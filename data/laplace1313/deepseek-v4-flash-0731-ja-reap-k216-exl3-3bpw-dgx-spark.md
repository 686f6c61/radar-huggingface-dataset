# Laplace1313/DeepSeek-V4-Flash-0731-JA-REAP-K216-EXL3-3bpw-DGX-Spark

## Resumen

DeepSeek-V4-Flash-0731-JA-REAP-K216-EXL3-3bpw-DGX-Spark es una adaptacion del modelo oficial DeepSeek-V4-Flash-0731, un modelo de lenguaje de 304 mil millones de parametros con arquitectura de mezcla de expertos dispersa, desarrollado por DeepSeek. Este checkpoint concreto, publicado por el usuario Laplace1313, aplica una poda selectiva de expertos (REAP) sobre el modelo base para reducir su huella de memoria y ejecutarlo en una unica NVIDIA DGX Spark (GB10), manteniendo un contexto de 256.000 tokens y un rendimiento optimizado para japones, llamadas a herramientas y generacion de codigo.

El modelo se distribuye como un paquete completo que incluye el modelo principal en formato EXL3 con cuantizacion de 3 bits, un modelo auxiliar de borrador para decodificacion especulativa, un adaptador de correccion posicional y un runtime propietario basado en vLLM y SparkInfer. No es compatible con las pilas estandar de Transformers, vLLM o SGLang, por lo que solo puede ejecutarse en el entorno Docker proporcionado. Su relevancia radica en demostrar que un modelo de 304B puede caber en un hardware de escritorio de gama alta mediante poda de expertos y cuantizacion agresiva, aunque con limitaciones importantes de portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con 256 expertos enrutables, de los cuales se conservan 216 (poda REAP) |
| Parametros totales | 59.971.342.598 (pesos cuantizados safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 256.000 tokens (verificado) |
| Tipos de cuantizacion | EXL3 3.0 bpw (modelo principal); K64 DSpark K5 (modelo de borrador) |
| Idiomas soportados | Japones (priorizado), ingles y codigo; multilingue del modelo base |
| Licencia | Mixta: MIT (pesos base DeepSeek, integracion y adaptador) y Apache-2.0 (runtime vLLM/SparkInfer) |
| Formato de pesos | Safetensors (EXL3/ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4-Flash-0731, un MoE disperso de 304B parametros con una ventana de contexto de un millon de tokens y un modulo de decodificacion especulativa incorporado. Sobre esta base, el proyecto REAP (Retention and Expert Pruning) selecciona 216 de los 256 expertos enrutables de cada capa MoE, priorizando aquellos relevantes para japones, llamadas de herramientas y uso agente, y reduciendo la tendencia al rechazo. La poda se aplica mediante mapas de retencion por capa tanto al backbone como al modulo DSpark/MTP, y se reorganizan las filas del router y las tablas de hash de enrutamiento para los nuevos identificadores de experto.

Para compensar el desajuste posicional entre el modelo principal y el modelo de borrador, se anade un adaptador de correccion posicional de rango 16 sobre el vocabulario completo. El modelo se distribuye en formato EXL3 con cuantizacion de 3 bits, y el entrenamiento no incluye instruccion en japones como tal, sino que se centra en la poda y el reajuste de enrutamiento. La generacion emplea decodificacion especulativa con un modelo de borrador K64 que propone 5 tokens probabilisticos por paso.

## Capacidades

- Generacion de texto libre en japones a una velocidad media de 30,02 tokens por segundo.
- Generacion de codigo, con una velocidad media de 33,51 tokens por segundo en implementaciones Python extensas.
- Llamada de herramientas (tool calling) verificada con 6/6 casos correctos.
- Generacion de JSON estructurado con restricciones, a 58,31 tokens por segundo.
- Razonamiento matematico y cientifico: 96,0 % en GSM8K 0-shot y 95,0 % en ARC-Challenge.
- Soporte de agentes y flujos de trabajo multi-paso mediante el uso de herramientas.
- Decodificacion especulativa integrada con modelo de borrador K64.
- API compatible con OpenAI Chat Completions.

## Casos de uso

- Atencion al cliente en japones: el modelo gestiona conversaciones multi-turno con contexto de hasta 256.000 tokens, lo que permite mantener historiales largos de soporte sin perder informacion previa.
- Generacion de codigo en produccion: con un HumanEval pass@1 del 96,0 % y soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentacion y fragmentos de implementacion.
- Extraccion de datos estructurados: su velocidad de 58,31 tokens por segundo en JSON con restricciones lo hace apto para transformar documentos no estructurados en registros JSON validos de forma automatica.
- Agentes de razonamiento multi-paso: la combinacion de llamadas de herramientas y ventana de contexto amplia permite construir agentes que lean documentacion, consulten APIs y resuelvan tareas complejas en un solo turno.
- Analisis de corpus largos en japones: con 256.000 tokens de contexto, puede resumir o extraer informacion de informes, actas o codigo fuente extenso sin segmentacion.
- Despliegue en hardware de borde de gama alta: al caber en una unica DGX Spark (GB10), es viable para entornos locales o de laboratorio donde no se dispone de clusters de GPUs.

## Benchmarks y rendimiento

Los resultados de evaluacion publicados por el autor, obtenidos con 0-shot y semilla fija, son los siguientes:

| Evaluacion | Resultado |
|---|---|
| MMLU 0-shot (200 preguntas) | 85,5 % (171/200) |
| ARC-Challenge 0-shot (200 preguntas) | 95,0 % (190/200) |
| HellaSwag 0-shot (200 preguntas) | 70,5 % (141/200) |
| GSM8K 0-shot (100 preguntas) | 96,0 % (96/100) |
| MMLU-ProX japones (200 preguntas) | 48,5 % (97/200) |
| HumanEval pass@1 (50 preguntas) | 96,0 % (48/50) |
| MBPP sanitized pass@1 (50 preguntas) | 84,0 % (42/50) |
| Llamada de herramientas | 6/6 |

Las velocidades de generacion medidas son: 30,02 tok/s en texto libre japones, 33,51 tok/s en codigo y 58,31 tok/s en JSON estructurado. No se dispone de comparativas con otros modelos cuantizados en el mismo hardware en la informacion proporcionada.

## Requisitos de hardware

- Hardware objetivo: una unica NVIDIA DGX Spark con GPU GB10.
- VRAM estimada: el paquete total ocupa 101,79 GiB en disco; el modelo principal 98,83 GiB y el borrador 2,94 GiB. La VRAM de la GB10 debe ser suficiente para alojar ambos modelos y los artefactos de CUDA.
- GPU recomendada: NVIDIA DGX Spark / GB10. No se ha verificado su ejecucion en otras GPUs.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por el tamano del modelo y del contexto.
- Despliegue: unicamente mediante el runtime Docker proporcionado (docker compose), que incluye vLLM 0.15.1+nv26.2, xgrammar 0.2.4 y Transformers 5.13.1.
- Latencia y throughput: 30-58 tok/s segun el tipo de tarea, con un unico usuario concurrente (max sequences = 1).
- Uso de memoria GPU: 0,946 en benchmarks y 0,949 en arranque en frio.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada por el autor con otros modelos cuantizados de la misma categoria. Como referencia del modelo base, DeepSeek-V4-Flash-0731 oficial tiene 304B parametros, contexto de 1M de tokens y licencia MIT, mientras que esta version REAP reduce el contexto a 256K y los parametros cuantizados a 59,97B, a cambio de requerir hardware especifico. Alternativas comparables por tamano cuantizado podrian ser modelos MoE de 70B-100B cuantizados a 3-4 bits (por ejemplo, DeepSeek-V3 o Qwen3-MoE), pero no hay datos de benchmarks comparativos en la informacion disponible.

## Limitaciones y advertencias

- No es compatible con Transformers, vLLM, SGLang, llama.cpp ni GGUF estandar; solo funciona con el runtime propietario incluido en el repositorio.
- La licencia es mixta: los pesos base son MIT, pero el runtime de vLLM/SparkInfer es Apache-2.0. Hay que revisar los terminos de cada componente antes de uso comercial.
- La ventana de contexto verificada es de 256.000 tokens, no el millon del modelo base, y no se ha probado con TP2, TP4 ni contexto de 1M.
- Maxima una secuencia concurrente (max sequences = 1), lo que limita el despliegue a un unico usuario o peticion a la vez.
- El autor indica que es un ajuste de poda y enrutamiento, no un instruction tuning en japones, por lo que puede tener un comportamiento menos estable en tareas de instruccion complejas.
- Resultados en japones de preguntas de opcion multiple son inferiores a los del subset ingles de MMLU (48,5 % en MMLU-ProX japones).
- HellaSwag muestra un rendimiento notablemente menor (70,5 %) que MMLU y ARC-Challenge.
- El arranque inicial tarda varios minutos al cargar pesos, artefactos AOT y CUDA graphs.
- La API expuesta por defecto escucha en 127.0.0.1:8009 sin autenticacion; si se expone externamente hay que usar un proxy con credenciales.
- Riesgo de alucinacion y sesgos inherentes al modelo base, no evaluados especificamente para esta version.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Laplace1313/DeepSeek-V4-Flash-0731-JA-REAP-K216-EXL3-3bpw-DGX-Spark
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Modelo base K216 de 0xSero: https://huggingface.co/0xSero/deepseek-v4-flash-0731-spark
- Codigo fuente del proyecto: https://github.com/Laplace1313/deepseek-v4-ja-reap
- Licencias del repositorio: https://huggingface.co/Laplace1313/DeepSeek-V4-Flash-0731-JA-REAP-K216-EXL3-3bpw-DGX-Spark/blob/main/LICENSES/README.md
- Model card de NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731/modelcard
- Model card en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
