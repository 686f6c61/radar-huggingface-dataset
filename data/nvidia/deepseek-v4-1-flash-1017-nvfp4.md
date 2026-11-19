# nvidia/DeepSeek-V4.1-Flash-1017-NVFP4

## Resumen

NVIDIA DeepSeek-V4.1-Flash-1017-NVFP4 es la version cuantizada en FP4 del modelo DeepSeek-V4.1-Flash-1017 desarrollado por DeepSeek AI. Se trata de un modelo de lenguaje autorregresivo de arquitectura transformer con mezcla de expertos (MoE) nativa y multimodal, que incorpora una arquitectura Causal Encoder-Decoder (CED), atencion dispersa comprimida de segunda generacion (CSA2) y soporte para contextos de hasta un millon de tokens. NVIDIA no es la autora del modelo base: ha aplicado un proceso de cuantizacion post-entrenamiento con su herramienta Model Optimizer (nvidia-modelopt v0.48.0rc0) para generar un checkpoint listo para despliegue en hardware Blackwell.

El modelo cuenta con 552.000 millones de parametros en el backbone, de los cuales se activan 8.000 millones durante la fase de prefill y 16.000 millones durante la decodificacion, a los que se suman 196.000 millones de parametros de memoria condicional Engram. El checkpoint completo almacena 664.898.390.994 parametros en formato safetensors y ocupa 429 GB en el repositorio. Su relevancia actual radica en que ofrece una via de despliegue de un modelo de frontera en precision FP4 sobre GPUs Blackwell (GB300), reduciendo los requisitos de memoria y aprovechando los nucleos tensoriales de cuarta generacion, con licencia MIT que permite uso comercial.

La ficha se centra en la version cuantizada distribuida por NVIDIA, si bien la mayor parte de las capacidades y limitaciones proceden del modelo base de DeepSeek AI, cuya model card se enlaza como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Causal Encoder-Decoder Mixture-of-Experts con Compressed Sparse Attention 2 (CSA2) |
| Parametros totales | 664.898.390.994 (552B backbone + 196B memoria Engram) |
| Parametros activos | 8B en prefill y 16B en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (FP4) para pesos; tablas Engram almacenadas en MXFP4; tag secundario fp8 / 8-bit |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 429 GB |
| Modalidad de entrada | Texto e imagen (RGB) |
| Modalidad de salida | Texto |
| Libreria | Model Optimizer (nvidia-modelopt v0.48.0rc0) |
| Hardware compatible | NVIDIA Blackwell (probado en GB300) |
| Sistema operativo | Linux |
| Motores de inferencia | vLLM (requiere soporte MXFP4 Engram, PR #61530), SGLang |
| Fecha de publicacion | 30 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 emplea una arquitectura transformer con mezcla de expertos y atencion dispersa comprimida de segunda generacion (CSA2), disenada para manejar contextos de hasta un millon de tokens con un coste computacional reducido. La variante Causal Encoder-Decoder combina codificacion y decodificacion causal, y el modelo es nativamente multimodal, aceptando texto e imagenes como entrada y generando texto. La innovacion mas destacable es el modulo Engram, una memoria condicional de 196.000 millones de parametros que se consulta mediante tablas de busqueda; en este checkpoint dichas tablas se almacenan en MXFP4, lo que exige builds de vLLM con soporte especifico (PR vllm-project/vllm#61530) y que las imagenes estandar de vLLM no pueden cargar.

El proceso de cuantizacion lo realizo NVIDIA con Model Optimizer v0.48.0rc0 sobre la revision `1bae0e1088993b9b82de08f59de5be5a34e42170` del modelo original. La calibracion se hizo con 512 muestras de cnn_dailymail y 512 de Nemotron-Post-Training-Dataset-v2 (subconjuntos stem, chat, math y code), con longitud de secuencia 512, batch size 4 y seleccion determinista por defecto. No se dispone de informacion sobre el dataset de entrenamiento original del modelo base (marcado como "Undisclosed" en la model card), ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva con contextos de hasta un millon de tokens, adecuada para tareas de recuperacion y razonamiento sobre documentos extensos.
- Razonamiento cientifico y matematico, evaluado en los benchmarks GPQA Diamond y AA-LCR.
- Generacion de codigo cientifico y de proposito general, con evaluacion especifica en SciCode.
- Seguimiento de instrucciones complejas, medido con IFBench.
- Comprension visual de imagenes (entrada RGB) evaluada en MMMU-Pro, lo que habilita tareas image-text-to-text.
- Capacidades de agente en terminal, evaluadas en Terminal-Bench 2.1, orientadas a flujos multi-paso.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque el uso declarado incluye sistemas de agentes y RAG.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la informacion proporcionada.

## Casos de uso

- Sistemas de agentes autonomos: el modelo esta disenado para integrarse en pipelines de agentes con tool calling y razonamiento multi-paso; su evaluacion en Terminal-Bench 2.1 sugiere capacidad para operar en entornos de terminal y ejecutar comandos encadenados.
- RAG sobre corpus masivos: con un contexto de un millon de tokens, permite ingerir documentacion completa o bases de conocimiento extensas sin fragmentacion agresiva, reduciendo la perdida de contexto en la recuperacion.
- Analisis de documentos cientificos y tecnicos: la combinacion de razonamiento cientifico (GPQA Diamond) y comprension visual (MMMU-Pro) permite procesar papers con figuras, tablas e imagenes junto al texto.
- Generacion de codigo cientifico y de analisis: evaluado en SciCode, es adecuado para asistir en la escritura de codigo de simulacion, analisis de datos o pipelines de investigacion.
- Atencion al cliente multimodal: al aceptar texto e imagenes, puede gestionar conversaciones multi-turno en las que el usuario adjunte capturas, diagramas o documentos escaneados.
- Despliegue en infraestructura Blackwell a gran escala: al estar cuantizado en NVFP4 y probado en GB300, encaja en clusters con GPUs Blackwell donde se priorice el rendimiento por vatio y la reduccion de memoria frente a la precision completa.
- Evaluacion de instrucciones y cumplimiento normativo: su rendimiento en IFBench lo hace util para tareas donde el seguimiento estricto de instrucciones es critico, como generacion de informes con formato fijo.

## Benchmarks y rendimiento

La model card menciona los conjuntos de evaluacion utilizados (GPQA Diamond, AA-LCR, SciCode, IFBench, MMMU-Pro y Terminal-Bench 2.1), pero no se han publicado los resultados numericos en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| GPQA Diamond | No disponible |
| AA-LCR | No disponible |
| SciCode | No disponible |
| IFBench | No disponible |
| MMMU-Pro | No disponible |
| Terminal-Bench 2.1 | No disponible |

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa 429 GB en safetensors; en FP4 los pesos requieren aproximadamente esa misma huella, por lo que no cabe en una sola GPU de consumo.
- GPU recomendadas: NVIDIA Blackwell, con pruebas realizadas en GB300. No se confirma compatibilidad con generaciones anteriores (Hopper, Ada) en la informacion disponible.
- GPU de consumo: no cabe en RTX 4090 ni en ninguna GPU consumer actual, dado el tamano del modelo y la necesidad de soporte FP4 nativo.
- Motores de despliegue: vLLM (imprescindible un build con el PR #61530 para cargar las tablas Engram en MXFP4; probado con vllm/vllm-openai:v0.31.0 parcheado) y SGLang.
- Sistema operativo: Linux.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Notas |
|---|---|---|---|---|---|
| NVIDIA DeepSeek-V4.1-Flash-1017-NVFP4 | 664,9B totales (8B prefill / 16B decode) | 1M tokens | MIT | Blackwell (GB300) | Cuantizado en FP4, multimodal, memoria Engram |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 552B backbone + 196B Engram | 1M tokens | No disponible en la informacion | No disponible | Modelo base sin cuantizar |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de modelos comparables en la informacion |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada; al ser un modelo de gran escala entrenado con datos no divulgados, es previsible que herede sesgos de su corpus, pero no hay confirmacion oficial.
- Riesgo de alucinacion: no cuantificado en la model card; como todo modelo generativo de gran escala, puede producir contenido plausible pero incorrecto, especialmente en contextos muy largos.
- Limitaciones de contexto: aunque soporta hasta un millon de tokens, el rendimiento en recuperacion de informacion lejana (AA-LCR) no se ha publicado, por lo que la calidad efectiva en contextos extremos no esta verificada.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas distintas del ingles.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, el modelo base es de DeepSeek AI y NVIDIA declara explicitamente que no es propietaria del modelo.
- Dependencia de hardware: requiere GPUs Blackwell y builds especificos de vLLM con soporte MXFP4 Engram; las imagenes estandar de vLLM no pueden cargar el checkpoint, lo que complica el despliegue en produccion.
- Dependencia de software: la cuantizacion se genero con nvidia-modelopt v0.48.0rc0, una version release candidate, lo que puede implicar inestabilidad o cambios de API.
- Trazabilidad: el dataset de entrenamiento del modelo base esta marcado como "Undisclosed", lo que limita la auditoria de datos y el cumplimiento normativo en entornos regulados.
- Pruebas adicionales necesarias: NVIDIA recomienda validacion especifica por caso de uso siguiendo la metodologia V-model antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- PR de vLLM con soporte MXFP4 Engram: https://github.com/vllm-project/vllm/pull/61530
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
- Sitio de NVIDIA: https://www.nvidia.com/
