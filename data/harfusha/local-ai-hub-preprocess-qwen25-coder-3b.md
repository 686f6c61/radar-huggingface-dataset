# Harfusha/local-ai-hub-preprocess-qwen25-coder-3b

## Resumen

`local-ai-hub-preprocess-qwen25-coder-3b` es un derivado afinado de Qwen2.5-Coder-3B-Instruct, publicado por el usuario Harfusha, orientado a una tarea muy concreta: preprocesar ficheros de codigo fuente y convertirlos en "fichas" estructuradas (file cards) con citas literales del codigo como evidencia. No es un modelo de proposito general, sino un componente especializado dentro del pipeline de un proyecto llamado Local AI Hub, que lo descarga y registra automaticamente en Ollama bajo el alias `qwen2.5-coder-prep-v4:3b`.

El modelo parte de la arquitectura transformer densa de Qwen2.5-Coder-3B (3.085.938.688 parametros reales), se afina con un adaptador QLoRA NF4 (rango 16, alpha 32, dropout 0.05, 2 epocas, 8.881 ejemplos tras descartar 8 por longitud excesiva, secuencia maxima de 4.096 tokens) y el resultado se fusiona en los pesos base y se cuantiza a GGUF Q4_K_M. El repositorio ocupa 1,9 GB y contiene un unico artefacto GGUF pensado para inferencia local via Ollama.

Su relevancia es limitada pero clara para quien construye herramientas de indexacion de repositorios: el autor reporta que el adaptador mejora la tasa de conformidad de esquema del 88% al 96% y la coincidencia exacta del 0% al 55% frente al modelo base en una muestra de 100 casos, a costa de duplicar la latencia media (de 10,58 s a 20,17 s). La licencia es el principal freno: hereda el Qwen Research License Agreement, que restringe el uso a fines no comerciales salvo licencia aparte de Alibaba Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5-Coder-3B-Instruct), afinado con QLoRA y fusionado |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (secuencia maxima de entrenamiento); contexto nativo del base no confirmado en la informacion disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico artefacto publicado) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (uso no comercial salvo licencia comercial de Alibaba Cloud) |
| Formato de pesos | GGUF (`qwen25-coder-3b-prep-v4-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La base es Qwen2.5-Coder-3B-Instruct, un transformer denso de 3.085.938.688 parametros con atencion causal estandar (no se documentan innovaciones como MoE, atencion lineal o decodificacion especulativa en la informacion disponible). Sobre esa base se entreno un adaptador QLoRA en cuantizacion NF4 con rango 16, alpha 32 y dropout 0.05, durante 2 epocas y con una longitud de secuencia maxima de 4.096 tokens. El conjunto de entrenamiento consta de 8.881 ejemplos tras excluir 8 filas que excedian la longitud maxima. La revision exacta del modelo base utilizada es `488639f1ff808d1d3d0ba301aef8c11461451ec5`.

El adaptador se fusiono en los pesos base y el modelo resultante se cuantizo a GGUF Q4_K_M para su uso con Ollama. La tarea de afinado es la generacion de fichas estructuradas a partir de codigo fuente, con citas literales como evidencia. No se documenta en la model card el uso de RLHF, DPO ni datos de preferencia; el pipeline descrito es exclusivamente SFT mediante QLoRA. Tampoco se detalla la composicion del dataset de entrenamiento mas alla del numero de ejemplos.

## Capacidades

- Generacion de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Generacion de fichas estructuradas de ficheros de codigo fuente conforme a un esquema predefinido (schema pass rate del 96% en la evaluacion del autor).
- Extraccion de hechos requeridos con citas literales del codigo como evidencia (required fact recall del 44,5%).
- Comprension de codigo en el contexto de preprocesado de repositorios (herencia de Qwen2.5-Coder).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue en Ollama mediante Modelfile.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision ni audio en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Indexacion de repositorios de codigo: el modelo recibe un fichero fuente y devuelve una ficha estructurada con campos normalizados y citas literales, lo que permite construir un indice semantico del repositorio con trazabilidad a la linea de codigo original. Es su caso de uso declarado y el unico para el que fue afinado.
- Generacion de documentacion tecnica asistida: a partir de cada fichero, el modelo produce un resumen estructurado que puede revisarse manualmente antes de incorporarse a un README o a una wiki interna, gracias a que cada hecho va acompanado de su cita de evidencia.
- Preprocesado en pipelines de busqueda aumentada (RAG) sobre codigo: las fichas generadas sirven como unidades de recuperacion de grano grueso antes de pasar a chunks mas finos, reduciendo el ruido en la fase de retrieval.
- Auditoria de conformidad documental: dado que el modelo emite un esquema fijo, se puede validar automaticamente la salida y marcar los ficheros que no cumplen el esquema (4% de fallos segun la evaluacion del autor) para revision manual.
- Despliegue local en estaciones de trabajo sin GPU dedicada: al ser un GGUF Q4_K_M de unos 1,9 GB, cabe en equipos modestos y permite procesar repositorios sin enviar codigo propietario a servicios externos, siempre que el uso encaje en la licencia no comercial.
- Prototipado de asistentes de exploracion de codigo en Ollama: el alias `qwen2.5-coder-prep-v4:3b` se registra automaticamente en Local AI Hub, lo que facilita integrarlo en flujos de desarrollo locales con la API de Ollama.
- Etiquetado previo de corpus de codigo para entrenar otros modelos: las fichas generadas, tras revision manual, pueden servir como datos de partida para tareas de clasificacion o resumen de ficheros.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la comparacion del adaptador QLoRA (en Transformers, base mas adaptador) frente al modelo base, sobre una muestra determinista de 100 casos retenidos, equilibrada por grupos y cubriendo los 42 grupos de evaluacion. No hay evaluacion del GGUF posterior a la fusion.

| Metrica | Base | Adaptador |
|---|---:|---:|
| Tasa de conformidad de esquema | 88% | 96% |
| Tasa de coincidencia exacta | 0% | 55% |
| Recuperacion de hechos requeridos | 0,0% | 44,5% |
| Latencia media | 10,58 s | 20,17 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2-3 GB con la cuantizacion Q4_K_M publicada (repo de 1,9 GB mas overhead de contexto y cache KV); no se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente para Q4_K_M; para mayor margen de contexto, GPUs de 8 GB o superiores. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: si, en tarjetas de gama media y baja con al menos 4 GB de VRAM; tambien puede ejecutarse en CPU, dado el tamano reducido del modelo.
- Opciones de despliegue: Ollama es el objetivo principal (Modelfile con `FROM` del GGUF y stops `<|im_end|>` y `<|endoftext|>`); llama.cpp es compatible por el formato GGUF. No se documenta soporte verificado en vLLM ni TGI.
- Latencia y throughput: la unica cifra publicada es la latencia media de 20,17 s por caso del adaptador en Transformers (frente a 10,58 s del base) durante la evaluacion; no se reporta throughput en tokens por segundo ni latencia del GGUF en Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Harfusha/local-ai-hub-preprocess-qwen25-coder-3b | 3,09 B | 4.096 (entrenamiento) | GGUF Q4_K_M | Qwen Research (no comercial) | Afinado para fichas de ficheros con citas; evaluacion propia limitada a 100 casos |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3,09 B | no disponible en la informacion proporcionada | safetensors y GGUF (upstream) | Qwen Research (no comercial) | Modelo base; 88% de conformidad de esquema y 0% de coincidencia exacta en la evaluacion del autor |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B (aproximado, no confirmado en la informacion disponible) | no disponible | safetensors y GGUF | Qwen Research | Alternativa de menor tamano de la misma familia; no evaluada en esta ficha |

No se dispone de datos comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el Qwen Research License Agreement limita el uso a fines no comerciales salvo acuerdo comercial con Alibaba Cloud. Cualquier uso en produccion comercial requiere licencia adicional.
- Es un derivado modificado: el autor declara explicitamente que se trata de un modelo modificado y que la atribucion exigida figura en `NOTICE`.
- La evaluacion publicada (100 casos) corresponde al adaptador en Transformers, no al GGUF fusionado; el rendimiento real del artefacto desplegado en Ollama no esta medido.
- La recuperacion de hechos requeridos es solo del 44,5%: el modelo omite o distorsiona mas de la mitad de los hechos esperados, por lo que la revision manual de las fichas generadas es obligatoria segun el propio autor.
- La coincidencia exacta es del 55%, lo que implica que casi la mitad de las salidas no reproducen literalmente el formato esperado; conviene validar el esquema de forma automatica.
- La latencia se duplica respecto al base (20,17 s frente a 10,58 s por caso en la evaluacion), lo que limita el procesado masivo de repositorios grandes.
- Ventana de contexto de entrenamiento de 4.096 tokens: los ficheros que excedan esa longitud quedan fuera del regimen para el que fue afinado (8 ejemplos del dataset original ya fueron descartados por esta razon).
- Riesgo de alucinacion en las citas de evidencia: al ser un modelo de 3 B, puede generar citas que no coincidan literalmente con el codigo fuente; la verificacion contra el fichero original es imprescindible.
- Idiomas soportados no documentados; el comportamiento fuera de ingles no esta garantizado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creacion reciente: no hay evidencia de uso en produccion por terceros.
- El repositorio no incluye filas de entrenamiento ni predicciones crudas, lo que impide reproducir la evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harfusha/local-ai-hub-preprocess-qwen25-coder-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia incluida en el repositorio: `LICENSE` (Qwen Research License Agreement)
- Atribucion requerida: `NOTICE` (en el repositorio del modelo)
- No se han encontrado en la informacion disponible papers, blogs, repositorios de codigo ni demos adicionales.
