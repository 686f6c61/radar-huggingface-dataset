# ragheb89/unsloth_gemma-4-E4B-it_aia

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo Gemma 4 E4B, un modelo de lenguaje y visión (VLM) de la familia Gemma 4 desarrollada por Google DeepMind, que ha sido ajustado (fine-tuned) y convertido mediante la herramienta Unsloth. El sufijo "it" indica que se trata de una variante instruida (instruction-tuned) y "aia" sugiere un ajuste adicional específico del autor del repositorio, aunque no se documenta el dataset de entrenamiento utilizado.

El modelo presenta 7.518.069.290 parámetros totales, lo que corresponde a la variante E4B de la familia Gemma 4, una arquitectura de mezcla de expertos (MoE) con aproximadamente 4.000 millones de parámetros activos. Al ser un modelo multimodal, acepta tanto texto como imágenes como entrada. La conversión a GGUF permite ejecutarlo con llama.cpp y herramientas compatibles como Ollama o Unsloth Studio en hardware de consumo, con una cuantización Q4_K_M para el modelo principal y un proyector de visión (mmproj) en BF16. Su relevancia radica en que democratiza el acceso a un VLM de última generación con soporte multilingüe amplio y contexto largo, ejecutable localmente sin infraestructura de servidor dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal, vision-language |
| Parametros totales | 7.518.069.290 (~7,5 B) |
| Parametros activos | ~4 B (según designación E4B) |
| Longitud de contexto | Hasta 256 K tokens (spec de la familia Gemma 4) |
| Tipos de cuantizacion | Q4_K_M (modelo principal), BF16 (proyector de vision) |
| Idiomas soportados | 140+ (spec de la familia Gemma 4) |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 E4B de Google DeepMind, una arquitectura de mezcla de expertos (MoE) multimodal con aproximadamente 7,5 mil millones de parámetros totales y unos 4 mil millones activos por token. La familia Gemma 4 incorpora un mecanismo de "pensamiento hibrido" (hybrid-thinking) que permite alternar entre razonamiento rapido y razonamiento reflexivo, y soporta entrada multimodal de texto e imagen. El repositorio indica que el modelo fue ajustado y convertido a GGUF con Unsloth, lo que implica un proceso de fine-tuning sobre la base instructa de Gemma 4 E4B, aunque no se documentan los datos de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion emplea el metodo imatrix (importance matrix) de llama.cpp, que mejora la calidad de la cuantizacion al calibrar los pesos con datos representativos.

## Capacidades

- Comprension de imagenes y generacion de descripciones (vision-language).
- Generacion de texto conversacional multi-turno (tag "conversational").
- Soporte multilingue para mas de 140 idiomas, segun las especificaciones de la familia Gemma 4.
- Razonamiento hibrido: alterna entre respuestas rapidas y modo de pensamiento profundo (capacidad de la familia Gemma 4).
- Ejecucion local eficiente gracias a la cuantizacion Q4_K_M y al formato GGUF compatible con llama.cpp.
- Capacidad de procesar contexto largo de hasta 256 K tokens (spec de la familia, sujeto a la ventana efectiva del fine-tune).
- Compatible con herramientas de inferencia estandar: llama-cli, llama-mtmd-cli, Ollama y Unsloth Studio.

## Casos de uso

- Asistente de soporte tecnico multimodal: el modelo puede recibir capturas de pantalla o fotos de errores junto con descripciones textuales del problema, y generar respuestas de diagnostico en conversaciones multi-turno, aprovechando su naturaleza conversacional y su capacidad de vision.
- Analisis de documentos con imagenes: procesamiento de PDFs o documentos escaneados que contienen diagramas, graficos o tablas, extrayendo informacion y respondiendo preguntas sobre el contenido visual y textual.
- Transcripcion y descripcion de imagenes para accesibilidad: generacion de descripciones alternativas (alt text) para imagenes en aplicaciones web o moviles, facilitando el acceso a contenido visual para personas con discapacidad visual.
- Chatbot local para atencion al cliente: despliegue en hardware de consumo mediante Ollama o llama.cpp para gestionar consultas de clientes en multiples idiomas, sin depender de APIs externas y manteniendo los datos en local.
- Asistente de programacion con capturas de pantalla: el desarrollador puede enviar una captura de pantalla de un error o de un fragmento de interfaz y el modelo sugiere correcciones o explica el problema, combinando vision y comprension de codigo.
- Educacion y formacion: creacion de materiales didacticos que incluyen imagenes, diagramas o graficos, con explicaciones generadas por el modelo en el idioma del estudiante, gracias a su soporte multilingue.
- Prototipado rapido de aplicaciones de vision: evaluacion de ideas de productos que requieren comprension de imagenes y texto, ejecutando el modelo localmente en fase de desarrollo antes de escalar a soluciones en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tune en la informacion disponible. La familia Gemma 4 de Google DeepMind ha reportado resultados en evaluaciones estandar como MMLU, HumanEval y GSM8K, pero no se dispone de datos desglosados para la variante E4B ajustada en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantizacion Q4_K_M del modelo principal, mas el proyector de vision BF16 (alrededor de 1 GB adicional), lo que situa el total en torno a 6-7 GB.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 o superiores. Tambien es viable en Apple Silicon con 16 GB de RAM unificada o mas.
- Compatible con hardware de consumo: si, cabe en GPUs consumer de gama media con 8 GB de VRAM o mas.
- Opciones de despliegue: llama.cpp (llama-cli para texto, llama-mtmd-cli para multimodal), Ollama (con la nota de que requiere crear un modelo unificado con el mmproj), Unsloth Studio y servidores compatibles con la API de endpoints.
- Latencia y throughput: no disponible en la informacion proporcionada; dependera del hardware y del numero de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B (este repo) | 7,5 B totales / ~4 B activos | Hasta 256 K | Si (vision) | No disponible | GGUF |
| Gemma 4 12B | 12 B densos | Hasta 256 K | Si (vision) | No disponible | Varios |
| Gemma 4 E2B | ~2 B activos (MoE) | Hasta 256 K | Si (vision) | No disponible | Varios |
| Gemma 4 31B | 31 B densos | Hasta 256 K | Si (vision) | No disponible | Varios |

La comparativa se basa en las especificaciones publicas de la familia Gemma 4. Este repositorio se distingue por ofrecer una cuantizacion GGUF lista para ejecucion local, mientras que las variantes mayores requieren hardware mas potente.

## Limitaciones y advertencias

- No se dispone de informacion sobre la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Es necesario contactar con el autor o consultar la documentacion de la familia Gemma 4 antes de desplegarlo en produccion.
- El dataset de fine-tuning no esta documentado, por lo que se desconocen los sesgos potenciales introducidos durante el ajuste.
- La ventana de contexto efectiva de este fine-tune puede ser inferior a los 256 K tokens de la familia base, dependiendo de los datos de entrenamiento utilizados.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de vision donde puede generar descripciones incorrectas de imagenes ambiguas.
- El repositorio no incluye informacion sobre la calidad de la cuantizacion Q4_K_M respecto al modelo original en BF16; es recomendable validar el rendimiento en tareas especificas.
- Ollama no soporta archivos mmproj separados para modelos de vision; requiere crear un modelo unificado, lo que puede aumentar el consumo de memoria.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ragheb89/unsloth_gemma-4-E4B-it_aia
- Modelo base Gemma 4 E4B (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B
- Documentacion de Gemma 4 en Unsloth: https://unsloth.ai/docs/models/gemma-4
- Guia de fine-tuning de Gemma 4 con Unsloth: https://unsloth.ai/docs/models/gemma-4/train
- Coleccion Gemma 4 de Unsloth en HuggingFace: https://huggingface.co/collections/unsloth/gemma-4
- Guia para ejecutar Gemma 4 localmente (Wolfeast): https://wolfeast.com/run-gemma-4-locally-unsloth/
