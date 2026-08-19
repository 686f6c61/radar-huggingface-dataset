# Goodoldjam/DiffusionGemma-26B-E38-Abliterated-NVFP4

## Resumen

DiffusionGemma-26B-E38-Abliterated-NVFP4 es una versión cuantizada en NVFP4 (NVIDIA FP4) del modelo abliterado DiffusionGemma-26B-E38, desarrollado por Goodoldjam. Se trata de un modelo de lenguaje multimodal basado en difusión (diffusion LM) con arquitectura de mezcla de expertos (MoE) de 26 mil millones de parámetros totales y 4 mil millones activos. Su característica principal es la eliminación de la alineación de seguridad (abliteration) aplicada al checkpoint BF16 de referencia, seguida de una cuantización mixta que reduce el tamaño del checkpoint de 51,68 GB a 18,86 GB, manteniendo la calidad medida en la validación interna.

El modelo está diseñado para despliegue en entornos de producción con GPUs NVIDIA Blackwell (SM120) y ha sido validado con un stack de inferencia optimizado que incluye vLLM V2, Triton attention y FlashInfer CUTLASS NVFP4 MoE. La cuantización NVFP4 afecta únicamente a los pesos de los expertos enrutados (W4A4 con grupo de tamaño 16), mientras que atención, MLP denso, routers, embeddings, componentes de visión y la cabeza de lenguaje se mantienen en BF16. Los 20 tensores modificados por la abliteración también se conservan en BF16 para preservar la integridad de la intervención.

La relevancia de este modelo radica en su enfoque de despliegue: ofrece una reducción del 63,5% en tamaño de checkpoint, una mejora del 58,2% en latencia media y un aumento del 75,2% en throughput en comparación con su versión BF16, sin pérdida estadísticamente significativa de calidad en las pruebas internas. Es un ejemplo de cómo la cuantización NVFP4 puede aplicarse a modelos de difusión multimodal manteniendo las capacidades originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion LM (difusion aplicada a lenguaje) con mezcla de expertos (MoE), basada en Gemma |
| Parametros totales | 26 mil millones (26B) |
| Parametros activos | 4 mil millones (4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4) para pesos de expertos enrutados; BF16 para el resto (atención, MLP denso, routers, embeddings, vision, LM head) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DiffusionGemma-26B-E38-Abliterated-NVFP4 es un modelo de lenguaje multimodal basado en difusión, una arquitectura que genera texto mediante un proceso iterativo de denoising en lugar de la decodificación autoregresiva tradicional. Combina esta técnica con una estructura MoE (26B totales, 4B activos) que permite escalar el número de parámetros sin aumentar proporcionalmente el coste computacional por token. El modelo procesa tanto imágenes como texto (pipeline image-text-to-text) e incorpora componentes de visión que se mantienen en BF16 tras la cuantización.

El entrenamiento de la línea E38 incluyó un programa extenso de investigación: más de 80 configuraciones de abliteración controladas, evaluaciones de 3.300 generaciones entre Base y E38, estudios de optimización de inferencia prospectiva, evaluaciones de matemáticas (1.324 problemas de MATH Level 5), estudios de atribución gramatical y léxica, y validaciones multimodales. El checkpoint BF16 E38 fue congelado como referencia de alta precisión antes de la cuantización. El proceso de abliteración modificó 20 tensores, que se conservan en BF16 en esta versión NVFP4 para no degradar la intervención. La cuantización NVFP4 se aplicó únicamente a los pesos de los expertos enrutados, con un grupo de tamaño 16, siguiendo un diseño de precisión mixta validado. No se dispone de información sobre el dataset de entrenamiento original ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto multimodal: acepta entradas de imagen y texto, y produce texto como salida (image-text-to-text).
- Razonamiento y resolucion de problemas: la validacion interna incluye tareas objetivas de 200 prompts, con una precision del 68,5% en el conjunto NVFP4.
- Generacion de texto de formato largo: evaluaciones de gramatica y coherencia lexica sobre 10.000 palabras muestran una mejora frente a la version BF16 (3,236 errores de gramatica por 10k palabras frente a 5,479 en E38 BF16).
- Capacidades matematicas: se evaluaron 1.324 problemas de MATH Level 5 en la linea E38, aunque no se reportan resultados especificos para NVFP4.
- Integridad de vision: los componentes de vision no fueron modificados por la abliteracion ni por la cuantizacion, manteniendo el comportamiento multimodal original.
- Inferencia optimizada para despliegue: gracias a la cuantizacion NVFP4, ofrece un throughput de 292,59 tokens por segundo en hardware Blackwell, lo que facilita su uso en entornos de produccion con requisitos de baja latencia.

## Casos de uso

- Generacion de descripciones de imagenes en tiempo real: al ser multimodal y tener una latencia media de 0,962 s, puede integrarse en sistemas de captioning automatico para plataformas de contenido visual, procesando imagenes y generando texto descriptivo de forma casi instantanea.
- Asistentes de vision por computador para investigacion: su capacidad de procesar imagen y texto permite usarlo en pipelines de analisis de imagenes cientificas (por ejemplo, imagenes medicas o de satelite) donde se requiere generar informes textuales a partir de entradas visuales.
- Chatbots de dominio especifico sin restricciones de seguridad: al ser un modelo abliterado, puede emplearse en entornos de investigacion donde se necesita explorar respuestas sin filtros de alineacion, como estudios de sesgos o analisis de comportamiento de modelos.
- Generacion de contenido creativo asistido por imagenes: el modelo puede combinar una imagen de referencia con instrucciones textuales para producir narrativas, poemas o guiones, aprovechando su arquitectura de difusion para generar texto coherente y variado.
- Evaluacion de calidad de cuantizacion en modelos MoE: este checkpoint sirve como referencia para medir el impacto de NVFP4 en tareas multimodales y de lenguaje, permitiendo a equipos de ML comparar el rendimiento entre precisiones BF16 y FP4.
- Despliegue en entornos con recursos limitados de VRAM: con un checkpoint de 18,86 GB, puede ejecutarse en GPUs de 24 GB (como RTX 4090 o RTX PRO 6000) con margen para el overhead de inferencia, siendo util para aplicaciones on-premise o edge con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor declara explicitamente que los benchmarks publicos que no fueron reevaluados en la version NVFP4 no se copian en esta model card.

La model card proporciona una validacion interna con un conjunto congelado de 200 prompts, cuyos resultados se presentan a continuacion como referencia del autor:

| Modelo | Correctos | Precision |
|---|---|---|
| Base BF16 | 128 / 200 | 64,0% |
| E38 BF16 | 134 / 200 | 67,0% |
| **E38 NVFP4** | **137 / 200** | **68,5%** |

La diferencia entre E38 NVFP4 y E38 BF16 es de +1,5 puntos porcentuales, con un intervalo de confianza del 95% de -2,0 a +5,0 y un valor p de 0,5811, lo que indica que no es estadisticamente significativa. El autor describe el resultado como "preservacion de calidad" y no como una mejora demostrada.

Tambien se reportan metricas de rendimiento de inferencia medidas en una NVIDIA RTX PRO 6000 Blackwell:

| Metrica | E38 BF16 | E38 NVFP4 |
|---|---|---|
| Tamano del checkpoint | 51,68 GB | 18,86 GB |
| Latencia media | 2,300 s | 0,962 s |
| Throughput | 166,97 tok/s | 292,59 tok/s |

Estas cifras son mediciones propias del autor con un stack de runtime validado (vLLM V2, Triton attention, FlashInfer CUTLASS NVFP4 MoE, CUDA 13 / SM120). El rendimiento real dependera de la GPU, la version de CUDA, la longitud de las secuencias, el backend de inferencia y la configuracion de batching.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 18,86 GB en NVFP4. Para inferencia con overhead de activaciones y KV cache, se recomienda al menos 24 GB de VRAM. Con la configuracion de FP8 KV cache (opcion de runtime) el uso puede variar.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (utilizada en las pruebas), y cualquier GPU con soporte SM120 y NVFP4 (serie Blackwell). No se garantiza funcionamiento en GPUs de generaciones anteriores sin soporte nativo para FP4.
- Compatibilidad con GPU de consumo: no se ha verificado en GPUs consumer como RTX 4090 (que no tiene soporte SM120 para NVFP4). Es posible que se requiera emulacion o conversion a otra precision, lo que degradaria el rendimiento.
- Opciones de despliegue: vLLM V2 (validado), con Triton attention y FlashInfer para el kernel MoE NVFP4. Tambien puede usarse con el pipeline de transformers, aunque sin las optimizaciones de rendimiento medidas.
- Latencia y throughput: latencia media de 0,962 s y throughput de 292,59 tok/s en la configuracion de prueba (RTX PRO 6000 Blackwell). Estos valores son de referencia y pueden variar segun el entorno.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos similares. El modelo pertenece a una categoria especifica (diffusion LM multimodal con abliteracion y cuantizacion NVFP4) para la cual no se han proporcionado datos de otros modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Abliteracion: el modelo ha sido sometido a un proceso de abliteracion que elimina la alineacion de seguridad. Esto implica que puede generar contenido inapropiado, ofensivo o peligroso sin los filtros habituales. Su uso debe restringirse a entornos controlados de investigacion y desarrollo.
- Idioma: solo soporta ingles. No se ha evaluado su rendimiento en otros idiomas.
- Contexto: no se especifica la longitud de contexto soportada. La arquitectura de difusion puede tener limitaciones en la generacion de secuencias muy largas, aunque no hay datos concretos.
- Sesgos: al ser un modelo abliterado y entrenado con datos no documentados, pueden existir sesgos no mitigados. No se han realizado evaluaciones de sesgo en esta version.
- Alucinaciones: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada. La validacion interna se basa en tareas objetivas, pero no cubre todos los dominios.
- Dependencia de hardware: la cuantizacion NVFP4 requiere GPUs con soporte SM120 (Blackwell). En hardware sin este soporte, el modelo no podra ejecutarse en su forma NVFP4 y necesitaria conversion a BF16, perdiendo las ventajas de rendimiento.
- Rendimiento variable: las metricas de latencia y throughput se midieron en un entorno especifico; el rendimiento real puede diferir segun la configuracion de despliegue.
- Sin benchmarks estandar: no se han publicado resultados en benchmarks publicos como MMLU o HumanEval, lo que dificulta la comparacion objetiva con otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/Goodoldjam/DiffusionGemma-26B-E38-Abliterated-NVFP4
- Modelo base (BF16 abliterado): https://huggingface.co/Goodoldjam/DiffusionGemma-26B-E38-Abliterated-BF16
