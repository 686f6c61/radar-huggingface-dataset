# mollangdata/LangMolDiode-Qwen3.5-4B-SFT

## Resumen

LangMolDiode-Qwen3.5-4B-SFT es un ajuste fino supervisado (SFT) del modelo Qwen3.5-4B, desarrollado por el autor mollangdata dentro del proyecto LangMolDiode. Su proposito es actuar como generador de moleculas condicionado por lenguaje: recibe descripciones estructurales detalladas de una molecula y devuelve su representacion en notacion SMILES, normalmente acompanada de una traza de razonamiento. El modelo esta pensado como base para una fase posterior de entrenamiento con DAPO (un algoritmo de RL), por lo que este checkpoint representa el punto de partida de plena precision (merged full-precision) de esa cadena.

Tecnicamente es un transformer denso de 4.539.265.536 parametros (unos 4.540 millones), derivado directamente de Qwen/Qwen3.5-4B, con el repositorio alojado en safetensors y un tamano de 9,1 GB. La tarea declarada en el pipeline de Hugging Face es image-text-to-text, aunque la propia model card indica que la evaluacion realizada fue exclusivamente de texto (text-only evaluation). El modelo produce la respuesta SMILES dentro de etiquetas `<smiles>...</smiles>`.

Su relevancia es de nicho: se orienta a quimica computacional y descubrimiento de farmacos, donde la conversion de descripciones estructurales a SMILES es una tarea concreta y verificable. No obstante, la informacion publica disponible es muy limitada (0 descargas, 0 likes, sin licencia explicita en la ficha de Hugging Face, aunque la model card menciona una licencia no comercial de LangMolDiode) y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B; detalles de atencion no disponibles) |
| Parametros totales | 4.539.265.536 (aprox. 4,54 mil millones) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors de plena precision; 9,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de Hugging Face; la model card menciona una licencia no comercial de LangMolDiode |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Dataset de entrenamiento | mollangdata/LangMolDiode-SFT-Corpus |
| Libreria | transformers |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B, un transformer denso de aproximadamente 4.540 millones de parametros. No se dispone de informacion detallada sobre el tipo de atencion, la longitud de contexto nativa ni las innovaciones internas del modelo base en la informacion proporcionada. El checkpoint publicado es el resultado de fusionar los pesos tras un ajuste fino supervisado (SFT) sobre el corpus LangMolDiode-SFT-Corpus, y se describe como el modelo de plena precision que sirve de base para el entrenamiento posterior con DAPO.

El entrenamiento se ha orientado a una tarea muy especifica: dada una descripcion estructural detallada de una molecula, generar su SMILES. La model card indica que el modelo suele emitir una traza de razonamiento antes de la respuesta final, que se encapsula en las etiquetas `<smiles>...</smiles>`. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO en esta fase (el DAPO corresponde a una etapa posterior). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de SMILES a partir de descripciones estructurales de moleculas (text-to-SMILES).
- Emision de una traza de razonamiento previa a la respuesta, con el SMILES final delimitado por `<smiles>...</smiles>`.
- Conversacion multi-turno (tag `conversational`), aunque orientada a la tarea quimica.
- Procesamiento de entradas de imagen y texto segun el pipeline declarado (image-text-to-text), si bien la evaluacion reportada fue solo de texto.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision verificada, audio ni capacidades multilingues explicitas.

## Casos de uso

- Generacion de moleculas en descubrimiento de farmacos: dado un conjunto de descripciones estructurales de candidatos, el modelo devuelve sus SMILES para su posterior validacion con herramientas de quimioinformatica (RDKit, etc.). Es adecuado porque la tarea esta alineada con el entrenamiento SFT recibido.
- Curacion y normalizacion de bases de datos quimicas: convertir descripciones textuales de estructuras en SMILES canonicos para consolidar registros y facilitar busquedas por subestructura.
- Generacion de datasets sinteticos etiquetados: producir pares descripcion-SMILES que sirvan como datos de entrenamiento o de evaluacion para otros modelos quimicos.
- Asistente de laboratorio en texto: un investigador describe una molecula y el modelo propone su representacion SMILES junto con una traza de razonamiento que ayuda a auditar el proceso.
- Base para investigacion en RL aplicado a quimica: al ser el checkpoint de partida para el entrenamiento DAPO de LangMolDiode, sirve como referencia para reproducir o extender esa linea de trabajo.
- Prototipado de pipelines text-to-SMILES en entornos de investigacion: integrar el modelo con `transformers` y `AutoModelForCausalLM` para experimentar con variantes de prompting y decodificacion.
- Evaluacion comparativa de modelos quimicos: usar este checkpoint como linea base SFT frente a versiones posteriores (por ejemplo, tras DAPO) para medir la mejora del entrenamiento por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, validez de SMILES, MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en plena precision (fp16/bf16): aproximadamente 9 GB solo para los pesos (4,54 mil millones de parametros), mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits: entorno a 5 GB de pesos; en 4 bits: entorno a 3 GB de pesos, aunque los formatos de cuantizacion no estan publicados en el repositorio.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para fp16 con contexto moderado (RTX 4090, A100 40 GB, H100). Para cuantizacion 4/8 bits podria caber en GPUs consumer de 8-12 GB, aunque no se ha verificado.
- Cabe en GPU consumer (RTX 4090, RTX 3090) en fp16 para inferencia basica; en GPUs de 8 GB requeriria cuantizacion.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (metodo indicado por el autor); vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LangMolDiode-Qwen3.5-4B-SFT | 4,54 mil millones | no disponible | text-to-SMILES | no disponible (mencion de licencia no comercial) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4 mil millones | no disponible | proposito general | la del modelo base (consultar) | Hugging Face |
| Alternativas quimicas especializadas | no disponible | no disponible | generacion de moleculas | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables verificados en la informacion proporcionada; la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Informacion publica muy escasa: sin licencia explicita en la ficha de Hugging Face, sin idiomas declarados y sin benchmarks publicados.
- La model card menciona una licencia no comercial de LangMolDiode; es imprescindible revisar los terminos del modelo base Qwen3.5-4B y de LangMolDiode antes de cualquier uso comercial.
- Riesgo de alucinacion en la generacion de SMILES: puede producir cadenas sintacticamente invalidas o quimicamente incorrectas; se recomienda validar siempre con herramientas como RDKit.
- Evaluacion reportada solo de texto, pese a que el pipeline declarado es image-text-to-text; el rendimiento multimodal no esta verificado.
- Longitud de contexto y comportamiento multilingue no documentados.
- Modelo de nicho con 0 descargas y 0 likes: ausencia de validacion por parte de la comunidad.
- Es un checkpoint intermedio (base para DAPO), no necesariamente la version final optimizada del proyecto.
- No se documentan sesgos conocidos; al derivar de un modelo de proposito general, puede heredar sesgos del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mollangdata/LangMolDiode-Qwen3.5-4B-SFT
- Dataset SFT: https://huggingface.co/datasets/mollangdata/LangMolDiode-SFT-Corpus
- Codigo anonimo del proyecto: https://anonymous.4open.science/r/LangMolDiode/
- Coleccion de checkpoints: https://huggingface.co/collections/mollangdata/langmoldiode-checkpoints-6b05f5b06b8425509bae4277
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
