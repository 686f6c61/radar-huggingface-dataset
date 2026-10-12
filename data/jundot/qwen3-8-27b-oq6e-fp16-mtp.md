# Jundot/Qwen3.8-27B-oQ6e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ6e-fp16-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de visión-lenguaje de 27.781 millones de parámetros construido sobre la arquitectura Qwen3.5. Lo publica el usuario Jundot y no se trata de un entrenamiento nuevo, sino de una reempaquetado de pesos con cuantización de precisión mixta generada por la herramienta oQ (oMLX v0.7.1) mediante la técnica Improved oQe Quantization. El objetivo es reducir el peso del modelo desde su formato original hasta unas 22,945 GiB de pesos lógicos, manteniendo un promedio efectivo de 7,095 bits por peso.

El checkpoint incluye los tres componentes del modelo original: el backbone de lenguaje (26,896B de parámetros lógicos), el encoder de visión (0,461B) y la cabeza de predicción multi-token o MTP (0,425B), que permite decodificación especulativa. El contexto nativo del modelo base es de 262.144 tokens, lo que lo sitúa en la gama de contexto largo, y su pipeline declarado es image-text-to-text, es decir, acepta imágenes además de texto.

La relevancia de esta ficha es práctica: se trata de una build orientada a ejecución local en Apple Silicon mediante MLX, con licencia Apache-2.0 heredada del modelo fuente. Al no existir resultados de benchmarks publicados por el autor ni una model card extensa, la evaluación debe basarse en las especificaciones de cuantización y en el comportamiento del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de Qwen3.5 con capas Gated DeltaNet y Gated Attention, mas encoder de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica, el modelo base es denso |
| Longitud de contexto | 262.144 tokens nativos (segun la model card, heredado del modelo base) |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (25,141B de pesos logicos), affine 8-bit grupo 64 (2,124B), FP16 (0,055B) y FP32 (0,461B) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX, con escalas y sesgos de cuantizacion en FP16 |

Datos adicionales de almacenamiento, tomados de la model card:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 26,896B | 22,387 GB / 20,850 GiB |
| Encoder de vision | 0,461B | 1,843 GB / 1,716 GiB |
| Cabeza MTP | 0,425B | 0,407 GB / 0,379 GiB |
| Total | 27,781B | 24,637 GB / 22,945 GiB |

El promedio efectivo declarado es de 7,095 bits por peso para el checkpoint completo, con un tamano de repositorio de 24,7 GB.

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B es un modelo denso de 27B parámetros con arquitectura híbrida: combina capas Gated DeltaNet (un mecanismo de atención lineal con estado recurrente) con capas de Gated Attention convencional. Esta mezcla busca reducir el coste computacional en secuencias largas sin renunciar a la calidad de atención completa en las capas donde es necesaria. El modelo incorpora además un encoder de visión que le permite procesar imágenes y vídeo, y una cabeza de predicción multi-token (MTP) que predice varios tokens futuros por paso, lo que habilita decodificación especulativa y por tanto aceleración de la generación.

Sobre el entrenamiento del modelo base no se dispone de información en la documentación proporcionada: no constan el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. El checkpoint aquí descrito no añade entrenamiento alguno; es un proceso de cuantización. La herramienta oQ asigna bits por sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia calculada con 128 muestras de 512 tokens, y aplica un reajuste por mínimos cuadrados ponderados de la escala y el sesgo. La variante "fp16" almacena las escalas, los sesgos y los tensores no cuantizados en FP16 en lugar de BF16, y mantiene el encoder de visión en FP32.

## Capacidades

- Generacion de texto conversacional, con el tag conversational declarado en el repositorio.
- Razonamiento y comprension de lenguaje, heredados del modelo base Qwen3.8-27B.
- Comprension de imagen y video, al incluir el encoder de vision y declarar el pipeline image-text-to-text.
- Prediccion multi-token mediante la cabeza MTP, orientada a decodificacion especulativa.
- Procesamiento de contextos largos de hasta 262.144 tokens.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos con imagenes intercaladas: el contexto nativo de 262.144 tokens permite procesar informes extensos con graficos, tablas escaneadas y figuras en una sola pasada, sin trocear el documento y perder la relacion entre texto y figura.
- Inspeccion visual asistida en local: al ejecutarse en MLX sobre Apple Silicon, encaja en flujos donde no se pueden enviar imagenes a servicios en la nube por motivos de confidencialidad, como revision de imagenes medicas o documentacion interna.
- Transcripcion y resumen de video: el modelo base declara comprension de video, por lo que puede describir o resumir secuencias a partir de fotogramas muestreados y anadir contexto textual.
- Asistentes conversacionales de larga duracion: mantener el historial completo de una conversacion dentro de la ventana de contexto evita resumir el historial y perder detalles, algo util en soporte tecnico o tutoria.
- Generacion de codigo asistida en local: como modelo de 27B denso, puede usarse para autocompletado y explicacion de codigo en entornos de desarrollo sin conexion, siempre que se valide el resultado.
- Prototipado e investigacion en equipos con hardware Apple: el checkpoint cuantizado permite experimentar con un modelo de 27B en un portatil o Mac Studio sin necesidad de GPUs dedicadas, reduciendo la barrera de entrada para evaluacion de arquitecturas hibridas.
- Decodificacion especulativa: la inclusion de la cabeza MTP permite emplear esta tecnica para reducir la latencia de generacion en despliegues que la soporten.
- Extraccion estructurada de informacion multimodal: conversion de capturas, formularios o diagramas en datos estructurados para pipelines internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye en la model card ninguna medicion de MMLU, HumanEval, GSM8K, MMMU ni de tareas equivalentes, ni para el checkpoint cuantizado ni en comparacion con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 22,945 GiB segun la model card. A eso hay que sumar el coste de activaciones y de la cache KV, que crece con la longitud de contexto. Para contexto corto, un minimo practico de 26-28 GB de memoria disponible; para explotar los 262.144 tokens de contexto, bastante mas.
- Encoder de vision: se mantiene en FP32 (1,716 GiB), por lo que no se beneficia de la reduccion de la cuantizacion.
- GPU dedicadas: el formato es MLX, especifico del ecosistema de Apple, por lo que no se ejecuta directamente en CUDA. No se dispone de datos de rendimiento en A100, H100 ni RTX 4090 en la informacion proporcionada.
- GPU de consumo: en el ecosistema Apple, un equipo con 32 GB de memoria unificada puede cargar el modelo con margen escaso; 48 GB o 64 GB son mas realistas para uso con contexto largo. En el lado NVIDIA, una RTX 4090 de 24 GB no seria suficiente para los pesos completos en este formato.
- Opciones de despliegue: mlx-lm y mlx-vlm para inferencia y servidores MLX; LM Studio como interfaz de usuario. vLLM, llama.cpp, TGI y Ollama no son aplicables a este checkpoint tal cual, ya que el repositorio contiene pesos MLX y no GGUF ni safetensors de PyTorch.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de checkpoints comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La unica referencia directa es el propio modelo base:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ6e-fp16-mtp | 27,781B | 262.144 tokens | Mixta, 7,095 bits/peso efectivos | Apache-2.0 | safetensors MLX |
| Qwen/Qwen3.8-27B (modelo base) | 27,781B | 262.144 tokens | Sin cuantizar | Apache-2.0 | no disponible en la informacion proporcionada |

No se dispone de alternativas equivalentes de otros autores para comparar parametros, contexto, rendimiento y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes publicadas.
- No hay benchmarks publicados, ni del checkpoint cuantizado ni de la comparacion con el modelo base. Se desconoce la degradacion de calidad introducida por la cuantizacion a 6 bits en el 90,497 % de los pesos logicos.
- La cuantizacion a 6 bits por grupo 64 puede degradar tareas sensibles a la precision numerica, como razonamiento matematico de varios pasos o generacion de codigo con dependencias sutiles.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se ha publicado ninguna medicion de tasa de alucinacion ni de calibracion.
- Sesgos conocidos: no disponibles. El autor no documenta evaluaciones de sesgo, toxicidad ni sesgo demografico.
- Idiomas soportados: no disponibles. Se desconoce el comportamiento en castellano o en idiomas distintos del ingles.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el archivo LICENSE. Al derivar de Qwen/Qwen3.8-27B, conviene verificar que la licencia del modelo base sea efectivamente Apache-2.0 y no una licencia con condiciones adicionales.
- Dependencia de formato: al ser pesos MLX, no son portables a entornos CUDA sin una conversion previa; esto limita el despliegue en infraestructura de servidores convencional.
- La fecha de creacion registrada es 2026-10-12, con una actualizacion el mismo dia, lo que sugiere un artefacto reciente y poco rodado.
- Advertencia sobre la busqueda web: los resultados obtenidos no guardan ninguna relacion con el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-27B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su arquitectura o sus benchmarks.
