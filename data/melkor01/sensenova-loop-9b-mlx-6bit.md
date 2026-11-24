# Melkor01/SenseNova-Loop-9B-MLX-6bit

## Resumen

SenseNova-Loop-9B-MLX-6bit es una cuantización comunitaria en 6 bits del modelo multimodal SenseNova-Loop-9B de SenseNova, empaquetada en formato MLX para ejecución nativa sobre Apple Silicon mediante Metal. La publica el usuario Melkor01 y conserva los tres componentes del checkpoint oficial en un único repositorio: el backbone de lenguaje cuantizado, la torre de visión en bfloat16 y la cabeza de Multi-Token Prediction (MTP) para decodificación especulativa.

El modelo base emplea una arquitectura de transformer multimodal con bucles (looped transformer): almacena 32 capas pero ejecuta hasta 56 pasadas efectivas, con una mezcla de atención híbrida en proporción 3:1 entre atención lineal y atención completa. Esta combinación permite intercambiar memoria por cómputo, manteniendo un tamaño de pesos contenido a cambio de más pasadas de cómputo por token. El contexto declarado alcanza los 512K tokens.

La relevancia de esta ficha es doble. Por un lado, ofrece una vía práctica para ejecutar un modelo de casi 9.000 millones de parámetros con visión y contexto largo en Macs de 16-24 GB de memoria unificada, algo que en bfloat16 completo requeriría bastante más memoria. Por otro lado, la cuantización es selectiva: mantiene los 96 tensores de enrutamiento mHC en float32 y las capas de normalización sin cuantizar para preservar la estabilidad de las pasadas repetidas, lo que la distingue de una cuantización uniforme ingenua.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con bucles (looped multimodal transformer); 32 capas almacenadas, hasta 56 pasadas efectivas; atención híbrida 3:1 (lineal:completa) |
| Parametros totales | 8.956.947.840 (8,96 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512K tokens |
| Tipos de cuantizacion | 6 bits MLX affine (6,510 bits por peso); routers mHC en float32; torre de visión en bfloat16; pesos de normalización sin cuantizar |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX): backbone de texto, `vision.safetensors`, `mtp.safetensors` |

## Arquitectura y entrenamiento

El backbone es un transformer con mecanismo de bucles: el modelo almacena 32 capas físicas y las reutiliza en varias pasadas hasta completar 56 pasadas efectivas, de modo que profundidad efectiva se obtiene a coste de cómputo y no de memoria de pesos. La atención es híbrida en proporción 3:1, combinando capas de atención lineal con capas de atención completa, lo que reduce el coste del KV-cache en contextos largos. Incorpora además 96 tensores de enrutamiento mHC (multi-head routing) que la cuantización mantiene en float32 por su sensibilidad a la precisión en las pasadas repetidas. El modelo es multimodal: incluye una torre visual de 333 tensores en bfloat16 y una cabeza MTP de 15 tensores para decodificación especulativa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO en la información proporcionada. La model card de esta cuantización tampoco detalla el proceso de calibración empleado para la cuantización affine de 6 bits. La innovación técnica destacable, más allá de la arquitectura del modelo base, es el empaquetado: la cuantización selectiva por tipo de tensor (6 bits para la mayoría de pesos, float32 para routers, bfloat16 para visión y sin cuantizar para normalizaciones) junto con la conservación de la cabeza MTP para decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento multimodal: procesamiento de entradas de imagen y texto (pipeline `image-text-to-text`), mediante la torre de visión incluida en bfloat16.
- Modo de razonamiento explícito (thinking mode), activable mediante `enable_thinking=True` en la plantilla de chat, que genera cadena de pensamiento antes de la respuesta.
- Decodificación especulativa mediante la cabeza MTP incluida, orientada a reducir la latencia de generación.
- Conversaciones multi-turno con ventana de contexto de hasta 512K tokens.
- Capacidades de razonamiento general y generación de código (el ejemplo de la model card incluye una petición de búsqueda binaria en Python).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Asistente documental con contexto largo: el modelo puede ingerir documentos extensos de hasta 512K tokens en una sola pasada, lo que permite resumir o consultar contratos, informes o bases de código completas sin fragmentación. En Macs de 16-24 GB conviene activar `--kv-bits 8` para aliviar la presión del KV-cache.
- Análisis de imágenes en local: gracias a la torre de visión en bfloat16, se puede usar para describir capturas de pantalla, extraer información de diagramas o transcribir contenido de documentos escaneados sin enviar datos a servicios externos.
- Generación de código en estación de trabajo: el modelo produce código Python y otros lenguajes, y puede integrarse en flujos de desarrollo locales en Apple Silicon para autocompletado, explicación de fragmentos o generación de tests, con la ventaja de privacidad del despliegue local.
- Prototipado de agentes con razonamiento explícito: el modo thinking permite obtener trazas de razonamiento auditables antes de la respuesta final, útil para depurar pipelines de razonamiento multi-paso en fase de desarrollo.
- Servidor local compatible con OpenAI: mediante `mlx_lm.server` se expone una API compatible con el formato de OpenAI en el puerto elegido, lo que permite conectar herramientas existentes (clientes de chat, IDEs, scripts) sin modificar el código.
- Investigación sobre transformers con bucles: al mantener la arquitectura original con pasadas efectivas y routers en float32, sirve como banco de pruebas para estudiar el equilibrio memoria-cómputo de los looped transformers en hardware de consumo.
- Procesamiento de texto bilingüe inglés-chino: adecuado para traducción asistida, resumen o atención al cliente en entornos donde se combinan ambos idiomas, aunque sin cobertura de otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria unificada recomendada: 16 GB para texto y contexto corto; 24 GB o más para contexto largo, visión o ejecución de aplicaciones en paralelo.
- Tamaño en disco: 8,7 GB de repositorio; 8,11 GB de pesos efectivos (6,79 GB backbone de texto + 912,1 MB visión + 486,6 MB cabeza MTP).
- Hardware compatible: Macs con Apple Silicon (M1 a M5). No se contempla ejecución en GPU NVIDIA ni en CPU x86 con esta distribución MLX.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable a este formato; la cuantización está pensada para Metal y memoria unificada.
- Despliegue: `mlx-lm >= 0.32` con `trust_remote_code=True`; línea de comandos (`mlx_lm.generate`), API Python (`mlx_lm.load` y `generate`) y servidor compatible con OpenAI (`mlx_lm.server`). Para visión y decodificación MTP se requiere el runtime complementario `internet-projects/sensenova-loop-mlx`.
- Latencia y throughput: no disponibles en la información proporcionada. La cabeza MTP está pensada para acelerar la decodificación especulativa, pero no se publican cifras de aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-6bit (esta ficha) | 8,96 B | 512K | Texto + imagen | Apache 2.0 | MLX 6 bits, Apple Silicon |
| SenseNova-Loop-9B (base oficial) | 8,96 B | 512K | Texto + imagen | Apache 2.0 | Safetensors (bf16 presumiblemente), multiplataforma |
| Alternativas de ~9B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otros modelos de la misma categoría (modelos multimodales de ~9B cuantizados para Apple Silicon) no está disponible en la información proporcionada. Frente al checkpoint base, la diferencia principal es el tamaño (8,11 GB frente al peso completo en bfloat16, que rondaría los 18 GB) y la plataforma de ejecución (MLX frente a frameworks genéricos), a costa de una posible pérdida de calidad por la cuantización a 6 bits.

## Limitaciones y advertencias

- Cobertura lingüística limitada a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la información disponible.
- La cuantización a 6 bits puede degradar la calidad respecto al checkpoint en bfloat16, especialmente en tareas sensibles a la precisión numérica; no se publican métricas comparativas de degradación.
- La ejecución requiere `trust_remote_code=True`, lo que implica ejecutar código Python del repositorio (`sensenova_loop.py`); conviene revisarlo antes de usarlo en producción.
- El soporte de visión y de decodificación MTP no funciona con `mlx-lm` estándar: necesita el runtime externo `internet-projects/sensenova-loop-mlx`, lo que añade una dependencia de mantenimiento comunitario.
- Exclusivo de Apple Silicon; no es desplegable en servidores con GPU NVIDIA sin recurrir a otra distribución del modelo base.
- Contexto de 512K tokens declarado, pero en la práctica limitado por la memoria unificada del equipo; con 16 GB conviene reducir el contexto o usar cuantización del KV-cache.
- Licencia Apache 2.0 permisiva para uso comercial, pero al ser una cuantización comunitaria conviene verificar la procedencia y los términos del modelo base antes de un despliegue en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Melkor01/SenseNova-Loop-9B-MLX-6bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Runtime complementario para visión y MTP: https://github.com/internet-projects/sensenova-loop-mlx
