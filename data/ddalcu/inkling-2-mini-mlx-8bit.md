# ddalcu/Inkling-2-Mini-MLX-8bit

## Resumen

Inkling 2 Mini MLX 8-bit es una cuantización en formato MLX del modelo multimodal Inkling 2 Mini desarrollado por Thinking Machines. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 26.400 millones de parámetros totales y 3.400 millones activos por token, capaz de procesar entradas de texto e imagen (pipeline `image-text-to-text`). Esta versión concreta, publicada por el usuario ddalcu, adapta los pesos originales al formato de mlx-lm para su ejecución eficiente en hardware Apple Silicon.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal MoE de gran tamaño en equipos Mac con memoria unificada, algo inviable con los pesos originales en bf16. La cuantización selectiva preserva la calidad del modelo base: los expertos mantienen sus bytes originales (NVFP4 en capas 0-19, MXFP8 en 20-23), mientras que atención, embeddings y cabeza se cuantizan a 8 bits afín grupo 64, y la torre de visión permanece en bf16.

El pack incluye además una cabeza drafter (`mtp.safetensors`, 0,64 GB) que habilita decodificación especulativa en mlx-serve sobre chips M3 y posteriores, con incrementos de velocidad de hasta el 31 % en decodificación. El repositorio ocupa 18,8 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer multimodal (texto + imagen) |
| Parametros totales | 26.400 millones (modelo base); 6.896.142.848 en el checkpoint safetensors cuantizado |
| Parametros activos | 3.400 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit afín grupo 64 (atención, embedding, cabeza); NVFP4 (expertos capas 0-19); MXFP8 (expertos capas 20-23); bf16 (torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea una arquitectura Mixture of Experts con 26.400 millones de parámetros totales y 3.400 millones activos, combinando procesamiento de texto e imagen en un único pipeline `image-text-to-text`. La versión MLX preserva la estructura MoE original y añade una torre de visión en bf16 para el procesamiento de imágenes. Los detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados y si se aplicaron técnicas de RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica principal de este pack es la cuantización selectiva por componentes: los expertos conservan los bytes originales del release (NVFP4 y MXFP8 según la capa), mientras que atención, embeddings y cabeza se reducen a 8 bits afín grupo 64, y la torre de visión se mantiene en bf16. Adicionalmente, se incluye una cabeza drafter (`mtp.safetensors`) que permite decodificación especulativa, acelerando la generación en mlx-serve sobre chips M3 y posteriores. El autor reporta que la cuantización de atención y cabeza a 8 bits reduce a la mitad los bytes leídos en cada token, lo que se traduce en una decodificación aproximadamente un 15 % más rápida que el release servido tal cual, con la misma calidad.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes en pipelines `image-text-to-text` (comprensión visual integrada).
- Razonamiento y generación de contenido textual gracias a los 3.400 millones de parámetros activos por token.
- Decodificación especulativa mediante cabeza drafter incluida (`mtp.safetensors`), con aceleración en mlx-serve sobre M3 y posteriores.
- Ejecución nativa en Apple Silicon mediante la librería MLX y el servidor mlx-serve.
- Compatibilidad con mlx-lm (PR #2086) además de mlx-serve.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar diálogos multi-turno ejecutándose íntegramente en hardware Apple Silicon mediante mlx-serve, sin depender de servicios en la nube, gracias a su formato MLX optimizado y su tamaño de 18,8 GB que cabe en equipos con memoria unificada suficiente.
- Análisis de imágenes en escritorio: al soportar el pipeline `image-text-to-text`, permite describir, clasificar o extraer información de imágenes localmente, útil para herramientas de accesibilidad o catalogación de fotos.
- Prototipado de aplicaciones multimodales: desarrolladores que trabajan en macOS pueden iterar sobre pipelines de visión-lenguaje sin necesidad de GPU dedicada, usando mlx-serve como servidor compatible con la API de MLX.
- Generación de texto asistida en entornos con requisitos de privacidad: al ejecutarse en local, los datos no salen del equipo, lo que lo hace adecuado para procesar documentos sensibles en portátiles o estaciones Mac.
- Investigación en eficiencia de inferencia: la combinación de cuantización selectiva (NVFP4/MXFP8/8-bit) y decodificación especulativa con drafter lo convierte en un banco de pruebas para estudiar el equilibrio calidad-velocidad en modelos MoE.
- Evaluación comparativa de cuantizaciones: el autor documenta métricas de KLD (0,0040) y acuerdo top-1 (97,2 %) frente al release, lo que permite usar este pack como referencia para validar otras estrategias de cuantización MLX.
- Despliegue de servidor local para equipos de desarrollo: con mlx-serve (`--serve`) se puede exponer el modelo como servicio interno en una red de trabajo con Macs, aprovechando el throughput reportado (hasta 155 tok/s en decodificación con drafter en M5 Ultra).

## Benchmarks y rendimiento

Calidad frente al release original (evaluación teacher-forced top-20 sobre 8 ficheros reservados, 7.318 posiciones):

| Metrica | Release | Este pack |
|---|---|---|
| KLD medio | – | 0,0040 |
| Acuerdo top-1 | – | 97,2 % |
| Perplejidad | 6,147 | 6,149 |

El autor indica que 0,0040 es el suelo de ruido de la medición (dos cálculos exactos de un mismo pack difieren entre 0,0037 y 0,0042). Adicionalmente, mlx-serve y mlx-lm coinciden sobre este pack con KLD 0,0030 y top-1 del 97,9 % sobre 3.995 posiciones.

Velocidad con mlx-serve (llmprobe 0.6.18, greedy, decodificación de 192 tokens):

| Mac | Decodificacion | Decodificacion con drafter | Procesamiento de prompt |
|---|---|---|---|
| M5 Ultra | 118 tok/s | hasta 155 tok/s | 4.900 tok/s |
| M4 Max | 84 tok/s | hasta 96 tok/s | 1.010 tok/s |
| M1 Pro 32 GB | 28 tok/s | – | 190 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 18,8 GB; se recomienda al menos 24-32 GB de memoria unificada para cargar el modelo con margen para el contexto y la torre de visión.
- Hardware validado por el autor: M5 Ultra (118 tok/s en decodificación, 4.900 tok/s en procesamiento de prompt), M4 Max (84 tok/s / 1.010 tok/s) y M1 Pro con 32 GB (28 tok/s / 190 tok/s).
- Cabe en GPU de consumo Apple Silicon: sí, en equipos con memoria unificada suficiente (M1 Pro 32 GB validado). No aplica a GPU NVIDIA/AMD, ya que el formato es MLX.
- Decodificación especulativa: disponible en mlx-serve sobre chips M3 y posteriores (el drafter se carga automáticamente en esos chips).
- Opciones de despliegue: mlx-serve (`mlx-serve --model ddalcu/Inkling-2-Mini-MLX-8bit --serve`) y mlx-lm (PR #2086). No compatible con vLLM, llama.cpp, Ollama ni TGI por el formato MLX.
- Latencia y throughput: ver tabla de benchmarks; el autor reporta ~15 % más rápido en decodificación que el release servido tal cual, a igual calidad.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-8bit (este) | 26,4B / 3,4B | no disponible | MLX safetensors 8-bit | Apache 2.0 | Hugging Face (ddalcu) |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B / 3,4B | no disponible | bf16 (original) | Apache 2.0 | Hugging Face (Thinking Machines) |
| Otras cuantizaciones MLX del mismo modelo | 26,4B / 3,4B | no disponible | MLX (varias) | Apache 2.0 | no disponible en la informacion |

No se dispone de datos de benchmarks estándar ni de modelos alternativos de otros autores en la información proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo entrenado con datos no especificados, es probable que herede sesgos del corpus, pero no se documentan.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; se debe conservar el aviso de licencia y el enlace a la misma.
- Compatibilidad limitada: el formato MLX solo funciona en Apple Silicon; no es desplegable en GPU NVIDIA/AMD ni en servidores x86 convencionales.
- Dependencia de herramientas concretas: requiere mlx-serve o mlx-lm (PR #2086); la decodificación especulativa solo está disponible en mlx-serve sobre M3 o posterior.
- Calidad de cuantización: aunque el KLD de 0,0040 se sitúa en el suelo de ruido de la medición, sigue siendo una cuantización; para aplicaciones sensibles a la fidelidad exacta conviene validar contra el release original.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción por terceros.
- Repositorio de 18,8 GB: requiere espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ddalcu/Inkling-2-Mini-MLX-8bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- PR de mlx-lm que añade soporte: https://github.com/ml-explore/mlx-lm/pull/2086
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
