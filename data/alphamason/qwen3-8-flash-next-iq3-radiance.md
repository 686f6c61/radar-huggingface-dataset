# alphamason/qwen3.8-flash-next-iq3-radiance

## Resumen

alphamason/qwen3.8-flash-next-iq3-radiance es una derivación cuantizada de Qwen/Qwen3.8-Flash-Next, un modelo MoE de la familia Qwen3.8, empaquetada como un único contenedor `.rad` para el motor de inferencia radiance sobre GPUs AMD RDNA4 con ROCm. El autor (alphamason) parte del contenedor IQR-V4 de StillDeadcode y re-codifica únicamente los expertos enrutados de 4 bits a 3 bits mediante códigos trellis GPTQ (`u3`, tcq 16, FWHT-128), manteniendo el tronco, la cabeza MTP de decodificación especulativa, la capa n-gram y la torre de visión byte-idénticos al original.

El objetivo es liberar memoria de dispositivo en configuraciones de tensor-parallel 2 sobre tarjetas de 32 GB (Radeon AI PRO R9700), donde IQR-V4 apenas dejaba espacio para la caché KV y limitaba las sesiones de agente largas. La reducción de expertos de ~58 GiB a ~44 GiB baja el contenedor de 113,3 GiB a 96,4 GiB y la memoria de dispositivo de 54,2 GiB a 43,3 GiB, multiplicando por 3,3 la caché KV disponible por tarjeta a longitud 262144.

El modelo es relevante para quienes despliegan MoE de gran tamaño en hardware AMD consumer o prosumer: demuestra que la cuantización selectiva de expertos a 3 bits apenas degrada la calidad a nivel de tarea (según las pruebas del autor) mientras mejora el throughput de decodificación y permite reconfigurar un equipo de seis tarjetas en tres motores tp 2 independientes con hasta un 81 % más de rendimiento agregado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP de decodificación especulativa, capa n-gram y torre de visión; derivado de Qwen3.8-Flash-Next |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262144 tokens (usada en las pruebas de serving; `max-model-len 32768` en calibración) |
| Tipos de cuantizacion | Expertos enrutados a 3 bits (GPTQ, códigos trellis `u3`, tcq 16, FWHT-128); tronco, MTP, n-gram y visión sin recuantizar respecto a IQR-V4 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el repo) |
| Formato de pesos | Contenedor `.rad` (radiance 2.2); recetas de conversión en `recipe/` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con atención estándar, cabeza MTP (multi-token prediction) para decodificación especulativa, una capa n-gram y una torre de visión. Esta derivación no reentrena el modelo: aplica cuantización post-entrenamiento GPTQ sobre los expertos enrutados, re-codificándolos con códigos trellis de 3 bits y transformada FWHT-128, mientras conserva el resto de componentes sin cambios respecto al contenedor IQR-V4.

El proceso de calibración requirió un contenedor bootstrap específico (tronco bf16 + expertos 4 bits rotados round-to-nearest, ~117 GiB) porque IQR-V4 rechaza la calibración al combinar activaciones int8 con expertos rotados. Se usaron ~1M tokens de texto (código Python privado escaneado, stdlib pública y el código fuente de radiance), enviados como completaciones de 1 token, generando 43 GB de Hessianos en ~18 minutos sobre 4×R9700. Los expertos dispersos (menos de 2560 filas enrutadas) recurren al Hessiano agrupado por capa. La conversión se hizo capa a capa con `--in-place` en ~2 h 15 min sobre 4 tarjetas.

## Capacidades

- Generación de texto y razonamiento general heredados de Qwen3.8-Flash-Next.
- Generación y edición de código, con rendimiento evaluado en tareas reales de agente de programación.
- Capacidades de visión preservadas por la torre de visión byte-idéntica a IQR-V4.
- Decodificación especulativa mediante la cabeza MTP, que acelera la generación.
- Capa n-gram para acelerar la decodificación en contextos repetitivos.
- Soporte de tool calling y function calling, validado en pruebas de agente de operaciones (6/6 llamadas válidas).
- Razonamiento multi-paso y sesiones de agente largas, favorecidas por la mayor caché KV disponible.
- Extracción de evidencia con anclaje de citas (evaluado en resumen de noticias con tasa de citas literales del 93,4 %).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agente de programación autónomo: el modelo puede ejecutar tareas de coding de extremo a extremo con un harness de agente; en las pruebas del autor completó 27 tareas reales en 8,2 h frente a 14,5 h de IQR-V4, con una mediana de 17 min por trabajo y 115 tok/s de salida p50.
- Serving de larga duración con contexto extenso: los 262144 tokens de contexto y los 7,79 GiB de caché KV por tarjeta en tp 2 permiten mantener sesiones de agente con historial prolongado sin truncar.
- Despliegue en clústeres de tarjetas AMD de 32 GB: tres motores tp 2 independientes sobre seis tarjetas ofrecen hasta 552 tok/s agregados a 4 chats por motor, un 81 % más que la configuración tp 4 + tp 2 con IQR-V4.
- Resumen de noticias con evidencia verificable: la extracción anclada en citas literales (93,4 % de citas verbatim) lo hace adecuado para pipelines que requieren trazabilidad de fuentes.
- Automatización de operaciones con tool calling: las pruebas de selección de siguiente paso en una sesión real de operaciones dieron 6/6 llamadas de herramienta válidas, lo que lo habilita para asistentes que invocan APIs.
- Procesamiento de documentos con componente visual: la torre de visión intacta permite tareas multimodales de extracción y descripción sobre imágenes o capturas.
- Evaluación y benchmarking de cuantizaciones: las recetas de calibración y conversión incluidas permiten reproducir el proceso y comparar variantes de cuantización sobre el mismo motor.

## Benchmarks y rendimiento

Calidad a nivel de token (KLD frente a IQR-V4, código retenido, 27 documentos, tp 2):

| Metrica | IQR-V4 | IQ3 (este) |
|---|---|---|
| KLD media | 0,028 | 0,044 |
| Acuerdo top-1 | 95,3 % | 94,1 % |
| Ratio de perplejidad | 0,999 | 0,998 |
| KLD media (stdlib Python, 40 docs) | 0,0087 | 0,0176 |
| Acuerdo top-1 (stdlib Python) | 99,1 % | 98,75 % |

Rendimiento de serving (radiance 2.2, Radeon AI PRO R9700 32 GB, tp 2):

| Metrica | IQR-V4 | IQ3 |
|---|---|---|
| Prefill (7k / 26k / 103k) | 5.330 / 6.294 / 6.238 tok/s | 5.594 / 6.308 / 6.220 tok/s |
| 1 chat: salida / decodificación p50 | 132 / 245 tok/s | 141 / 250 tok/s |
| 4 chats: salida / decodificación p50 / turno p50 | 162 / 76 tok/s / 7,0 s | 186,5 / 92 tok/s / 5,9 s |

Comparativa de configuración en seis tarjetas (tres motores tp 2 cargados simultáneamente frente a tp 4 + tp 2):

| Chats por motor (total) | tp 4 + tp 2 (IQR-V4) | 3 × tp 2 (IQ3) | Cambio |
|---|---|---|---|
| 1 (3) | 297 tok/s | 380 tok/s | +28 % |
| 2 (6) | 268 tok/s | 405 tok/s | +51 % |
| 4 (12) | 305 tok/s | 552 tok/s | +81 % |
| Prefill total 26k / 103k | 13.857 / 13.885 tok/s | 18.759 / 18.534 tok/s | +35 % / +33 % |

Calidad a nivel de tarea: replay de agente de coding 2/27 ship-ready (IQ3) frente a 3/27 (IQR-V4), puntuación ponderada 28 frente a 27, mismo veredicto en 22/27; resumen de noticias 6 frente a 7 victorias y tasa de citas verbatim 93,4 % frente a 95,1 %; tool calling 6/6 válidas en ambos. Las muestras son pequeñas según el propio autor.

## Requisitos de hardware

- VRAM: 43,3 GiB de memoria de dispositivo en tp 2 (2 tarjetas) para los pesos; contenedor de 96,4 GiB en disco.
- Caché KV: 7,79 GiB por tarjeta tras los pesos en tp 2 a longitud 262144, 3,3 veces más que IQR-V4.
- GPUs recomendadas: Radeon AI PRO R9700 de 32 GB (RDNA4) con ROCm; el autor probó configuraciones de 2, 4 y 6 tarjetas.
- Cabe en GPU consumer: sí, en tarjetas AMD RDNA4 de 32 GB; no hay datos para GPUs NVIDIA ni para tarjetas de menos de 32 GB.
- Despliegue: exclusivamente mediante el motor radiance 2.2 (contenedor `.rad`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput: decodificación p50 de 250 tok/s con 1 chat y 92 tok/s con 4 chats por motor tp 2; prefill de ~6.300 tok/s con prompts de 26k–103k.
- Notas de operación: requiere `RADIANCE_HOME` para `rad-convert`; los patrones `--defer` son solo estilo shell; un error de plano de puntuación QSA indica reducir `max-num-batched-tokens` o `max-model-len`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphamason/qwen3.8-flash-next-iq3-radiance | no disponible (MoE) | 262144 | Expertos 3 bits, contenedor `.rad` | qwen-community-1.0 | Hugging Face, motor radiance |
| StillDeadcode IQR-V4 (base de esta derivación) | no disponible (MoE) | 262144 | Expertos 4 bits, contenedor `.rad` | qwen-community-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next | no disponible (MoE) | no disponible | Pesos originales | qwen-community-1.0 | Hugging Face |

La ventaja de IQ3 frente a IQR-V4 es de memoria y throughput (43,3 frente a 54,2 GiB en tp 2; 186,5 frente a 162 tok/s de salida a 4 chats) a costa de un KLD 1,6 veces mayor. Frente al modelo base sin cuantizar, la diferencia principal es la reducción de huella y la dependencia del motor radiance.

## Limitaciones y advertencias

- Solo funciona con el motor radiance 2.2 sobre AMD RDNA4 y ROCm; no es portable a otros runtimes sin reconversión.
- El KLD medio es un 57 % superior al de IQR-V4 (0,044 frente a 0,028) y el acuerdo top-1 cae 1,2 puntos; la degradación es mayor en texto de código que en stdlib.
- Las evaluaciones a nivel de tarea se basan en muestras pequeñas (27 tareas de coding, 14 artículos, 6 intentos de tool calling), por lo que las conclusiones del autor no son estadísticamente robustas.
- La calibración usó ~1M tokens, insuficiente según el propio autor; con 3–10M tokens se reduciría el recurso al Hessiano agrupado en expertos dispersos.
- Los idiomas soportados no están documentados; no hay garantías sobre cobertura multilingüe más allá del modelo base.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial que deben revisarse en el archivo LICENSE antes de desplegar en producción.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; aplican los del modelo base.
- El proceso de conversión es frágil: requiere contenedor bootstrap, variables de entorno concretas y patrones de glob limitados; los errores de QSA obligan a reducir parámetros de serving.
- El autor probó el modelo en un laboratorio doméstico; no hay validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphamason/qwen3.8-flash-next-iq3-radiance
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Perfil de StillDeadcode (receta IQR-V4): https://huggingface.co/StillDeadcode
