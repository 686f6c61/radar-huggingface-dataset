# litert-community/Olmo-3-7B-Think

## Resumen

Olmo-3-7B-Think es un modelo de lenguaje de 7.298 millones de parámetros desarrollado por el Allen Institute for AI (Ai2), especializado en razonamiento con cadena de pensamiento larga. Esta ficha concreta corresponde a la conversión realizada por la comunidad `litert-community` al formato LiteRT-LM (`.litertlm`), pensada para ejecución en dispositivo (*on-device*) mediante el runtime LiteRT-LM de Google. El modelo base es `allenai/Olmo-3-7B-Think`, el checkpoint final de la línea Think de 7B tras las etapas de SFT y DPO y el entrenamiento con RLVR.

El modelo resuelve tareas de razonamiento matemático, código y seguimiento de instrucciones mediante un modo de pensamiento que siempre está activo: la plantilla cierra el prompt con `<|im_start|>assistant` y una etiqueta `<think>` abierta, y el modelo emite su razonamiento antes de cerrar con `</think>` y proporcionar la respuesta. La arquitectura es un transformer denso de 32 capas con atención de ventana deslizante en 24 de ellas y atención completa en las 8 restantes, con un contexto original de 65.536 posiciones.

La relevancia de esta conversión radica en que permite desplegar un modelo de razonamiento de 7B en hardware de consumo y móvil: el archivo int4 ocupa 4,31 GB y decodifica a 34,8 tok/s en la GPU de un Mac Studio M4 Max, mientras que la variante con caché de 2.048 tokens se ejecuta en un Galaxy S26 de 12 GB a 7,0 tok/s. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (32 capas; 24 con sliding-window attention de 4.096, 8 con atención completa cada cuarta capa) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65.536 posiciones en el modelo original; 4.096 en los archivos int8 e int4; 2.048 en la variante `int4_c2048` |
| Tipos de cuantizacion | int8 dinámica por capa lineal + embedding int8; int4 blockwise-32 (OCTAV) + embedding int8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`), un archivo TFLite por decoder graph |

Otros datos técnicos: hidden size 4096, intermediate size 11008, 32 cabezas de atención y 32 cabezas KV de 128 dimensiones (MHA sin agrupación), QK-norm sobre la anchura completa de la proyección, bloque post-norm, RoPE theta 500.000 con YaRN (factor 8 sobre 8.192 posiciones originales) en las capas de atención completa, vocabulario de 100.278 tokens con embeddings no atados. Fecha de corte de datos: diciembre de 2024.

## Arquitectura y entrenamiento

El modelo es un transformer denso con una innovación estructural destacable: la intercalación de capas con atención de ventana deslizante (ventana de 4.096 tokens) y capas con atención completa cada cuatro capas. Las capas de atención completa aplican RoPE con YaRN (factor 8) para extender el contexto desde las 8.192 posiciones originales hasta 65.536. En los archivos LiteRT-LM, cada capa mantiene una caché KV de longitud completa de 4.096 posiciones, igual a la ventana deslizante, de modo que las capas deslizantes ven todos los tokens anteriores, replicando el comportamiento del modelo original en conversaciones de hasta 4.096 tokens.

El entrenamiento siguió un flujo completamente publicado: preentrenamiento sobre el dataset Dolma 3 y postentrenamiento sobre los datasets Dolci, con una secuencia de base Olmo-3-1025-7B, luego Think-SFT, luego Think-DPO y finalmente este checkpoint entrenado con RLVR (reinforcement learning with verifiable rewards). El modelo se describe en el paper Olmo 3 (arXiv 2512.13961). La conversión a LiteRT-LM se realizó con litert-torch 0.9.4 y el script `hf-to-litertlm` (directorio `olmo3_work/`), probado con litert-lm 0.18.0.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento larga, siempre activa (no se puede desactivar).
- Razonamiento matemático: el modelo base reporta MATH 95,1 y AIME 2024 71,6.
- Generación de código: HumanEval+ 89,9 y LiveCodeBench v3 75,2 en el modelo base.
- Seguimiento de instrucciones: IFEval 88,2.
- Razonamiento de sentido común y multietapa: BBH 86,6.
- Canal de pensamiento declarado en el bundle (`thought`, delimitado por `<think>` / `</think>`), que el runtime devuelve por separado de la respuesta final.
- Presupuesto de pensamiento configurable: un `--thinking-budget` positivo cierra el canal al alcanzar el límite, aunque el modelo continúa razonando en el texto visible.
- No soporta tool calling ni function calling según la información disponible.
- No dispone de capacidades de visión ni audio.
- Multilingüe limitado: solo inglés declarado.

## Casos de uso

- Razonamiento matemático asistido en dispositivo: el modelo puede resolver problemas de matemáticas paso a paso en un portátil o móvil sin conexión, gracias a sus resultados en MATH y AIME y a su cadena de pensamiento explícita, que permite auditar el razonamiento.
- Tutoría educativa offline: desplegado en un dispositivo con LiteRT-LM, puede guiar al estudiante mostrando el razonamiento completo antes de la respuesta, útil en entornos sin conectividad o con requisitos de privacidad.
- Asistencia a la programación en el borde: con HumanEval+ de 89,9 en el modelo base, puede integrarse en editores o IDE locales para explicar y generar fragmentos de código, siempre que la ventana de 4.096 tokens sea suficiente para el contexto del archivo.
- Verificación de razonamiento en pipelines de CI: el canal `thought` separado permite registrar y auditar el proceso de razonamiento del modelo en tareas de revisión automática, comparando la traza con la respuesta final.
- Prototipado de agentes de razonamiento en móvil: la variante `int4_c2048` se ejecuta en un Galaxy S26 de 12 GB a 7,0 tok/s, lo que permite validar flujos de razonamiento multietapa en hardware real antes de escalar a servidor.
- Evaluación de modelos de razonamiento en investigación: al ser un modelo totalmente abierto (datos, código y flujo de entrenamiento publicados) y con licencia Apache 2.0, es adecuado para estudios de reproducibilidad y análisis de cadenas de pensamiento.
- Despliegue en estaciones de trabajo Apple Silicon: el archivo int4 alcanza 34,8 tok/s en la GPU de un M4 Max, suficiente para asistentes interactivos locales con contexto de hasta 4.096 tokens.

## Benchmarks y rendimiento

Resultados del modelo base reportados por Ai2 (con sus ajustes de generación: temperatura 0,6, top_p 0,95, max_tokens 32.768):

| Benchmark | Resultado |
|---|---|
| MATH | 95,1 |
| AIME 2024 | 71,6 |
| AIME 2025 | 64,6 |
| BBH | 86,6 |
| HumanEval+ | 89,9 |
| LiveCodeBench v3 | 75,2 |
| IFEval | 88,2 |
| MMLU | 77,8 |
| GPQA | 46,2 |

Resultados de las conversiones LiteRT-LM en GSM8K con presupuesto de salida de 2.048 tokens (respuestas puntuadas tras `</think>`):

| Variante | GSM8K |
|---|---|
| bf16 en transformers | 84 |
| int8 LiteRT-LM (GPU Mac) | 81 |
| int4 LiteRT-LM (GPU Mac) | 80 |

Rendimiento medido (prefill de 1.024 tokens + 256 tokens decodificados, contexto 2.048):

| Configuración | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 8,59 s | el motor GPU no compila | no ejecutado |
| int4 con caché 2.048, GPU | 6,58 s (46,6 tok/s decode) | 41,32 s | no ejecutado |
| int8 GPU | 9,64 s (30,4 tok/s decode) | no ejecutado | no ejecutado |
| int8 CPU | 46,04 s | no ejecutado | no ejecutado |
| int4 CPU | 51,97 s | no ejecutado | no ejecutado |

En el Mac, el archivo int4 es más rápido en GPU (34,8 tok/s de decodificación frente a 30,4 del int8) y el int8 es más rápido en CPU (prefill de 131 tok/s frente a 64 del int4). No se midió en iOS.

## Requisitos de hardware

- VRAM/RAM estimada: int8 7,43 GB; int4 4,31 GB; variante `int4_c2048` 4,31 GB.
- GPU recomendadas: Apple Silicon (M4 Max probado), GPU móviles compatibles con LiteRT-LM; en el Galaxy S26 de 12 GB solo compila la variante con caché de 2.048 tokens.
- Cabe en GPU de consumo: sí, el archivo int4 (4,31 GB) es viable en equipos con 8 GB o más de memoria unificada o VRAM; la variante int8 requiere unos 8 GB.
- Opciones de despliegue: runtime LiteRT-LM (versión 0.18.0 probada); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: en Mac M4 Max, int4 GPU 34,8 tok/s de decodificación (46,6 tok/s con la variante de caché 2.048); int8 GPU 30,4 tok/s; int8 CPU con prefill de 131 tok/s. En Galaxy S26, 7,0 tok/s con la variante `int4_c2048`. En litert-lm 0.17.1 ambos archivos respondieron correctamente en CPU del Mac.
- Advertencia de despliegue: en el Galaxy S26 los archivos con caché de 4.096 tokens no construyen el motor GPU; solo funciona la variante de 2.048.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/despliegue | Notas |
|---|---|---|---|---|---|
| Olmo-3-7B-Think (LiteRT-LM, esta ficha) | 7,3B | 4.096 (2.048 en variante móvil) | Apache 2.0 | LiteRT-LM, on-device | Cuantizado int8/int4; GSM8K 80-81 |
| allenai/Olmo-3-7B-Think (original) | 7,3B | 65.536 | Apache 2.0 | safetensors, transformers | bf16; GSM8K 84; requiere GPU de servidor |
| Modelos de razonamiento de 7B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks comparativos en la información proporcionada |

La comparación directa más relevante es con el modelo original de Ai2: la conversión LiteRT-LM pierde contexto (de 65.536 a 4.096 tokens) y 3-4 puntos en GSM8K, pero reduce el tamaño a 4,31 GB en int4 y habilita la ejecución en dispositivo.

## Limitaciones y advertencias

- El pensamiento no se puede desactivar: `--thinking false` y `--thinking-budget 0` producen exactamente la misma salida; un presupuesto positivo cierra el canal pero el modelo sigue razonando en el texto visible.
- El razonamiento es largo: en GSM8K la respuesta media fue de unos 1.600 tokens y un tercio de las respuestas del modelo bf16 agotaron el presupuesto de 2.048 tokens de las pruebas, frente a los 32.768 tokens recomendados por Ai2. Esto puede truncar respuestas en contextos cortos.
- Contexto reducido en esta conversión: 4.096 tokens (2.048 en la variante móvil) frente a los 65.536 del original; prompt, pensamiento y respuesta comparten esa ventana.
- Solo inglés declarado; no hay soporte multilingüe verificado.
- Riesgo de alucinación inherente a los modelos de lenguaje; la cadena de pensamiento explícita no garantiza la corrección de la respuesta.
- No se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de los datasets de entrenamiento (Dolma 3, Dolci) para usos sensibles.
- En el Galaxy S26 probado, los archivos con caché de 4.096 tokens no construyen el motor GPU; verificar compatibilidad por dispositivo antes de desplegar.
- No medido en iOS; el decoder graph de cada archivo es una única sección TFLite de 6,53 (dato truncado en la información disponible).

## Enlaces

- Hugging Face (conversión LiteRT-LM): https://huggingface.co/litert-community/Olmo-3-7B-Think
- Modelo base en Hugging Face: https://huggingface.co/allenai/Olmo-3-7B-Think
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Paper Olmo 3: arXiv 2512.13961
