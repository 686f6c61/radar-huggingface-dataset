# anoane/DeepSeek-V4-Flash-0731-exl3-hybrid-2.72bpw

## Resumen

Este repositorio contiene una cuantizacion exl3 del modelo DeepSeek-V4-Flash-0731, desarrollada por el usuario anoane. Se trata de un modelo de lenguaje de gran tamano (MoE) de la familia DeepSeek, que destaca por su arquitectura hibrida de atencion y su ventana de contexto de hasta 256 mil tokens. La cuantizacion es especialmente interesante porque asigna un ancho de bits individual a cada uno de los 11.008 expertos enrutados, en lugar de usar un unico ancho por capa, lo que permite alcanzar una tasa media de 2,74 bits por peso y reducir el peso total del modelo a 103 GB, suficiente para cargar el contexto completo en una sola tarjeta de 96 GB.

El modelo base, DeepSeek-V4-Flash-0731, es un modelo de 304 mil millones de parametros con arquitectura MoE (43 capas x 256 expertos, top-6) y una ventana de contexto de hasta 1M tokens segun la documentacion oficial. Esta cuantizacion concreta se distribuye bajo licencia MIT y utiliza el formato exl3 de exllamav3, por lo que requiere el fork ANEMONE de esa libreria para su ejecucion. La relevancia de esta version reside en su capacidad para ejecutar un modelo de esta escala en una unica GPU de gama alta, manteniendo una perplejidad de 1,8938 sobre un corpus de validacion propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 43 capas x 256 expertos enrutados, top-6 |
| Parametros totales | 304.000 millones (modelo base) / 52.218.679.998 (archivo cuantizado) |
| Parametros activos | no disponible (el modelo base reporta 13B activos segun la documentacion oficial) |
| Longitud de contexto | 256k tokens (soporta hasta 1M en el modelo base) |
| Tipos de cuantizacion | exl3, trellis code con 2, 3 o 4 bits por experto (2,74 bpw medio) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (exl3, exllamav3) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 utiliza una arquitectura hibrida de atencion que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), junto con conexiones mHC y el optimizador Muon. La cuantizacion aqui presentada no altera la arquitectura, sino que la comprime mediante un esquema de asignacion de bits por experto. Se realizo un perfilado de uso de los expertos durante una campana de generacion de 205 prompts, y posteriormente se aplico un algoritmo greedy waterfill que asigna 2, 3 o 4 bits a cada uno de los 11.008 expertos enrutados, bajo un presupuesto fijo de bits. El resultado es una tasa media de 2,74 bpw (2,72 en los expertos enrutados). Los tensores no expertos se cuantizan de forma convencional: atencion y expertos compartidos a K=4, lm_head a K=6, y el modulo MTP (Multi-Token Prediction) de forma hibrida.

La cuantizacion se evaluo en un corpus de validacion privado de 364.544 tokens, con una perplejidad de 1,8938 en la configuracion recomendada. La asignacion por experto mejora la perplejidad en un 0,32% respecto a una cuantizacion uniforme del mismo tamano, aunque a costa de un 6% de velocidad de decodificacion. No se utilizan tecnicas de RLHF o DPO en esta version, ya que es una cuantizacion del modelo base.

## Capacidades

- Generacion de texto y conversacion en lenguaje natural, con soporte de contexto largo (256k tokens) para dialogos multi-turno o documentos extensos.
- Razonamiento complejo y resolucion de problemas de matematicas, logica y ciencias, gracias a la arquitectura MoE con top-6 y la atencion hibrida.
- Generacion de codigo en multiples lenguajes, con capacidad de seguir instrucciones de programacion y completar funciones o scripts.
- Soporte de tool calling / function calling, segun la documentacion oficial del modelo base, lo que permite integrarlo en flujos de agentes.
- Capacidades de agentes y razonamiento multi-paso, aptas para tareas que requieren planificacion y ejecucion secuencial.
- Multilingue (idiomas no especificados en la informacion disponible), con predominancia de ingles y chino segun la documentacion del modelo base.
- Procesamiento de contexto largo: gracias a la ventana de 256k tokens, puede manejar libros completos, bases de codigo o transcripciones largas.
- No incluye vision ni audio, ya que es un modelo exclusivamente de texto.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con un historial extenso gracias a su ventana de 256k tokens, lo que permite mantener el contexto de toda la interaccion sin truncamientos.
- **Generacion de codigo en produccion**: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentar funciones o refactorizar codigo, ejecutandose en una unica GPU de gama alta.
- **Analisis de documentos legales o tecnicos**: la capacidad de procesar hasta 256k tokens permite resumir contratos, patentes o informes extensos, extrayendo clausulas y datos relevantes.
- **Asistente de programacion en local**: se puede desplegar en un servidor con una RTX PRO 6000 Blackwell para ofrecer un asistente de codigo privado, sin dependencia de APIs externas.
- **Razonamiento matematico y cientifico**: su capacidad de razonamiento multi-paso lo hace util para resolver problemas de matematicas avanzadas, fisica o quimica, asi como para explicar pasos intermedios.
- **Agentes autonomos**: con la capacidad de tool calling, puede construir agentes que busquen informacion, ejecuten acciones y tomen decisiones secuenciales, por ejemplo en automatizacion de tareas de oficina.
- **Traduccion y localizacion**: aunque los idiomas no estan documentados, el modelo base es multilingue y puede usarse para traduccion de textos con contexto largo, como manuales o sitios web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta cuantizacion. La unica metrica publicada es la perplejidad sobre un corpus privado de 364.544 tokens, evaluado con diferentes configuraciones de prefill:

| Configuracion | Perplejidad | Variacion vs. recomendada |
|---|---|---|
| Configuracion recomendada (`--no-rlp`) | 1,8938 | — |
| `--hc-bf16` adicional | 1,8939 | +0,004% |
| `--fp4-prefill` | 1,9263 | +1,7% |
| `--fp4-prefill --fp4-dense` | 2,0271 | +7,0% |

La perplejidad por dominio varia entre 1,10 y 2,97 en 23 de los 24 dominios del corpus. El dominio 24 (datos binarios) obtiene 37,8, lo que distorsiona el promedio. Excluyendo ese dominio, los valores son 1,6449 / 1,6449 / 1,6727 / 1,7620 para las mismas configuraciones.

## Requisitos de hardware

- VRAM estimada: el modelo requiere alrededor de 97 GB de VRAM para cargar el contexto completo de 256k tokens, segun las pruebas del autor. El tamano del archivo es de 109,8 GB.
- GPU recomendada: RTX PRO 6000 Blackwell (96 GB) o cualquier GPU con al menos 96 GB de memoria. No cabe en GPUs de consumo habitual (RTX 4090, RTX 4080, etc.).
- Opciones de despliegue: requiere el fork ANEMONE de exllamav3 para ejecutarse; no es compatible con vLLM, llama.cpp ni Ollama en esta version.
- Latencia y throughput: no se han publicado datos especificos. El autor indica que la cuantizacion por experto tiene un costo de alrededor del 6% de velocidad de decodificacion en comparacion con una cuantizacion uniforme.

## Comparativa con modelos similares

No hay disponible una comparativa directa con otras cuantizaciones del mismo modelo, ya que no se han publicado datos de benchmarks estandarizados. Como referencia, se puede comparar con el modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento (perplejidad) |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (base) | 304B | 1M | MIT | safetensors | no publicado |
| anoane/DeepSeek-V4-Flash-0731-exl3-hybrid-2.72bpw | 304B (base) | 256k | MIT | exl3 (safetensors) | 1,8938 (corpus privado) |

Otras cuantizaciones de modelos MoE de tamano similar (por ejemplo, de la familia Llama-3.1 405B) no son directamente comparables por arquitectura y licencia.

## Limitaciones y advertencias

- **Dependencia de un fork especifico**: el modelo requiere el fork ANEMONE de exllamav3; la version oficial de exllamav3 no lo cargara, lo que limita su portabilidad.
- **Cuantizacion agresiva**: con 2,72 bpw, la calidad puede degradarse en tareas de alta precision, aunque el autor reporta una perplejidad aceptable en su corpus privado.
- **Perplexidad no comparable**: el corpus de evaluacion es privado, por lo que los valores absolutos no son comparables con los de otros modelos.
- **Sesgos y alucinaciones**: no se han publicado evaluaciones sobre sesgos o alucinaciones; al ser un modelo de gran tamano, es probable que presente los sesgos tipicos de los modelos entrenados con datos de internet.
- **Licencia**: la licencia MIT permite uso comercial sin restricciones, pero el modelo base puede tener otras condiciones (se indica que la licencia del base es MIT).
- **Requisitos de hardware**: necesita una GPU con al menos 96 GB de VRAM, lo que limita su despliegue a centros de datos o estaciones de trabajo especializadas.
- **Contexto de 256k**: aunque el modelo base soporta 1M, esta cuantizacion se ha validado para 256k; usar contextos mayores podria superar la memoria disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anoane/DeepSeek-V4-Flash-0731-exl3-hybrid-2.72bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Model card de NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731/modelcard
- Blog de DigitalApplied sobre DeepSeek V4 Flash: https://www.digitalapplied.com/blog/deepseek-v4-flash-0731-official-release-agent-benchmarks
- Datalearner - Specs y benchmarks: https://www.datalearner.com/en/ai-models/pretrained-models/deepseek-v4-flash
