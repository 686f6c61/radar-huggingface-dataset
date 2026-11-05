# benjaik/igcse-economics-qwen3.5-9b-lora-20261105

## Resumen

El repositorio `benjaik/igcse-economics-qwen3.5-9b-lora-20261105` contiene un adaptador LoRA experimental para el modelo base Qwen/Qwen3.5-9B-Base, orientado a tareas de economia y correccion con rubricas en el contexto del IGCSE (International General Certificate of Secondary Education). No se trata de un modelo completo, sino de un adaptador PEFT que debe combinarse con el modelo base para su uso. El autor lo describe explicitamente como experimental y sin evaluacion real de precision en la correccion de estudiantes.

El adaptador se entrena sobre un corpus de preguntas y respuestas de economia, con un total de 264 registros (208 de entrenamiento, 29 de validacion y 27 de prueba) tras excluir ocho repeticiones exactas previas. La perdida de validacion mas baja alcanzada fue 0,758238. El unico chequeo de generacion realizado produjo JSON valido pero con un ID de concepto ausente del grafo, lo que el propio autor senala como motivo para mantener el adaptador en estado experimental.

Por su naturaleza (adaptador LoRA de 0,2 GB sobre un modelo de 9B), su relevancia es limitada: resulta util como punto de partida para experimentacion en evaluacion educativa automatizada, pero no esta listo para produccion ni cuenta con benchmarks publicados. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B-Base |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-9B-Base, no declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3.5-9B-Base, un transformer de 9.000 millones de parametros. El repositorio incluye el adaptador seleccionado y el tokenizer, pero no los pesos del modelo base. El archivo `source_model.json` contiene la revision exacta del modelo base y `training_records.tar.gz` incluye los registros de la ejecucion y el codigo.

El entrenamiento se realizo durante dos epocas sobre un corpus de registros de preguntas de economia, con 208 ejemplos de entrenamiento, 29 de validacion y 27 de prueba, excluyendo ocho repeticiones exactas anteriores. Se uso microbatch 4 y acumulacion de gradientes 4, resultando en un batch efectivo de 16. La mejor perdida de validacion fue 0,758238. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales. No se especifica el numero de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su tematica economica y su orientacion a rubricas.

## Capacidades

- Generacion de texto en ingles orientada a contenido de economia de nivel IGCSE.
- Soporte para correccion con rubricas (rubric-based grading), segun la descripcion del autor.
- Produccion de salida en formato JSON (verificado en un unico chequeo de generacion).
- Uso de IDs de concepto vinculados a un grafo de conceptos (aunque el unico chequeo realizado genero un ID ausente del grafo).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Experimentacion en evaluacion educativa automatizada: el adaptador puede emplearse para probar pipelines de correccion de respuestas de economia IGCSE, comparando la salida del modelo con rubricas definidas por el docente, siempre con supervision humana dado su caracter experimental.
- Generacion de material de practica: dado que el adaptador esta entrenado sobre un corpus de preguntas de economia, puede usarse para producir borradores de preguntas y respuestas de repaso, que un docente revisaria antes de su uso.
- Prototipado de sistemas de feedback formativo: el modelo puede integrarse en un flujo que reciba la respuesta de un estudiante y una rubrica y devuelva una evaluacion estructurada en JSON, como paso previo a un sistema mas robusto.
- Investigacion sobre adaptadores LoRA en dominios educativos: el repositorio incluye registros de entrenamiento y codigo, lo que permite reproducir o extender el experimento en entornos academicos.
- Extraccion de conceptos economicos: el adaptador intenta mapear respuestas a IDs de concepto de un grafo, lo que puede servir para experimentar con la vinculacion entre texto libre y ontologias de dominio.
- Base para fine-tuning adicional: al ser un adaptador pequeno (0,2 GB) sobre un modelo de 9B, puede combinarse o continuarse con datos adicionales para tareas especificas de evaluacion educativa.
- Pruebas de robustez de prompts con anclaje (grounded prompts): el autor indica que el adaptador requiere prompts fundamentados, por lo que puede usarse para estudiar como varian las salidas segun el contexto proporcionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una perdida de validacion minima de 0,758238 y senala que la precision real en la correccion de estudiantes no ha sido evaluada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Qwen3.5-9B-Base, que en precision de 16 bits requeriria aproximadamente 18 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: no especificadas por el autor; para el modelo base de 9B serian razonables GPUs con 24 GB o mas (RTX 4090, A100 40 GB, H100) en funcion de la cuantizacion.
- Cabe en GPU de consumo: no confirmado; el modelo base de 9B podria caber en una RTX 4090 (24 GB) en cuantizacion de 8 o 4 bits, pero no se aportan datos especificos.
- Opciones de despliegue: no documentadas por el autor; al ser un adaptador PEFT, requeriria cargarse junto al modelo base mediante librerias compatibles (por ejemplo, transformers con PEFT). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores LoRA comparables de la misma tematica y tamano, ni se aportan datos de rendimiento que permitan una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- El autor declara explicitamente que el adaptador es experimental y que requiere prompts fundamentados y evaluacion adicional.
- La precision real en la correccion de estudiantes no ha sido evaluada.
- El unico chequeo de generacion realizado produjo JSON valido pero con un ID de concepto ausente del grafo, lo que indica posibles errores de anclaje conceptual.
- El corpus de entrenamiento es muy reducido (208 ejemplos de entrenamiento), lo que limita la generalizacion.
- Solo soporta ingles, lo que excluye su uso directo en castellano u otros idiomas.
- No se declara licencia, por lo que no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion en la generacion de evaluaciones o conceptos economicos, especialmente fuera del conjunto de entrenamiento.
- No se documentan sesgos conocidos, pero el corpus limitado y de dominio especifico puede introducir sesgos en la cobertura de temas y en los criterios de correccion.
- No se proporcionan datos sobre el contexto maximo efectivo ni sobre el comportamiento con entradas largas.
- El adaptador no incluye los pesos del modelo base; su uso requiere descargar Qwen/Qwen3.5-9B-Base por separado y respetar la licencia de este.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/benjaik/igcse-economics-qwen3.5-9b-lora-20261105
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
