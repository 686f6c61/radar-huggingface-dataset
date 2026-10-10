# gliteceo/Sabi-Translate-1

## Resumen

Sabi-Translate-1 es un ajuste fino (fine-tuning) del modelo unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit, publicado por el usuario gliteceo en HuggingFace. Se trata, por tanto, de un derivado de Llama 3.2 3B Instruct, la familia de modelos ligeros de Meta orientada a generacion de texto, razonamiento basico y dialogo de instrucciones. El nombre del repositorio sugiere un proposito de traduccion, aunque la model card no documenta la tarea concreta ni el dataset empleado.

El modelo se ha entrenado con la libreria Unsloth, que segun el autor permite un entrenamiento "2x mas rapido" que las rutas convencionales. El repositorio tiene un tamano de 0,1 GB, muy inferior al de un modelo de 3.000 millones de parametros completo, lo que apunta a que el artefacto publicado podria ser un adaptador tipo LoRA/PEFT en lugar de pesos fusionados, aunque esto no se confirma en la model card.

La relevancia de esta ficha es limitada: el repositorio no incluye informacion sobre el dataset, el numero de pasos de entrenamiento, la evaluacion ni los idiomas reales de uso (el campo `language` solo declara `en`). Se trata de un experimento personal, sin descargas ni valoraciones en el momento de la consulta, por lo que debe tratarse como material no validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2 3B Instruct; capas, atencion GQA y contexto no documentados en la model card) |
| Parametros totales | no disponible en la model card (el modelo base Llama 3.2 3B Instruct tiene 3.210 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base soporta hasta 128.000 tokens) |
| Tipos de cuantizacion | no disponible; el modelo base indicado esta cuantizado en 4 bits (bnb-4bit) |
| Idiomas soportados | en (segun el campo `language` del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el procedimiento de entrenamiento. Por herencia del modelo base, se trata de un transformer decoder-only de tipo Llama 3.2 3B Instruct, con atencion por consultas agrupadas (GQA), una ventana de contexto nativa de hasta 128.000 tokens en el modelo original y un vocabulario de 128.256 entradas. La version base indicada por el autor es un checkpoint ya cuantizado en 4 bits (bnb-4bit) publicado por Unsloth.

En cuanto al entrenamiento, la unica informacion disponible es que se uso la libreria Unsloth, que aplica kernels optimizados y tecnicas de ahorro de memoria para acelerar el fine-tuning. No se especifican el numero de tokens, la composicion del dataset, la duracion del entrenamiento, la estrategia de ajuste (LoRA/QLoRA/full fine-tuning) ni si hubo una fase de alineacion adicional (RLHF, DPO u otra). Tampoco se detalla el objetivo concreto del ajuste, aunque el nombre "Translate" sugiere una tarea de traduccion.

## Capacidades

- Generacion de texto e instrucciones: hereda las capacidades conversacionales del modelo base Llama 3.2 3B Instruct.
- Razonamiento basico y respuesta a preguntas: el modelo base resuelve tareas de conocimiento general y logica sencilla, con las limitaciones propias de un modelo de 3B.
- Traduccion: presumible por el nombre del repositorio, pero no confirmada ni documentada en la model card.
- Tool calling / function calling: no documentado por el autor; en el modelo base esta soportado de forma parcial.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: el repositorio declara unicamente `en`; el modelo base Llama 3.2 3B Instruct soporta oficialmente ocho idiomas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; Llama 3.2 3B es un modelo exclusivamente de texto.

## Casos de uso

No se dispone de informacion proporcionada por el autor que describa aplicaciones previstas. Los siguientes escenarios son hipotesis razonables derivadas del modelo base, siempre bajo validacion previa del ajuste fino:

- Traduccion automatica ligera: si el ajuste fino cumple lo que sugiere su nombre, podria emplearse para traducir textos cortos en entornos con recursos limitados, gracias al tamano reducido del modelo base.
- Prototipado rapido de asistentes conversacionales: util para experimentar con pipelines de generacion en local sin necesidad de GPU de gama alta.
- Microtareas de generacion de texto: resumenes, reescritura o clasificacion simple en flujos internos de baja criticidad.
- Educacion y demostraciones: ejemplo didactico de fine-tuning con Unsloth sobre un modelo Llama 3.2 3B.
- Investigacion sobre adaptadores y cuantizacion: interesante para estudiar el comportamiento de checkpoints derivados de pesos ya cuantizados en 4 bits.
- Despliegue en el borde o en entornos embebidos: el modelo base de 3B cabe en GPUs de consumo y en algunas CPU, lo que facilita pruebas de inferencia local.
- Evaluacion comparativa de fine-tunings: material de partida para comparar tecnicas de ajuste sobre la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, alrededor de 6,5 GB; en INT8, unos 3,5 GB; en 4 bits, aproximadamente 2-2,5 GB. Estas cifras son estimaciones basadas en el tamano del modelo base y no en mediciones del autor.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, L4, A10G o superiores para FP16; A100/H100 sobredimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, cabe en la mayoria de GPU consumer modernas con 8 GB o mas en cuantizacion de 4 bits, y con 12 GB o mas para FP16.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), text-generation-inference (tag presente), Unsloth, vLLM, llama.cpp u Ollama si se convierte a GGUF. No se documentan pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sabi-Translate-1 | no documentado (base 3B) | no disponible (base 128k) | apache-2.0 | Repositorio HuggingFace, 0 descargas, sin validacion |
| Llama 3.2 3B Instruct | 3.210 millones | 128.000 tokens | Llama 3.2 Community License | Ampliamente disponible y validado en produccion |
| Qwen2.5 3B Instruct | 3.090 millones | 32.768 tokens (ampliable a 128k) | Apache 2.0 (con restricciones en algunos modelos) | Muy extendido en toolchains como vLLM y Ollama |
| Phi-3.5-mini Instruct | 3.800 millones | 128.000 tokens | MIT | Disponible en HuggingFace y ONNX |

La comparacion de rendimiento con estas alternativas no puede establecerse porque no hay benchmarks publicados para Sabi-Translate-1.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto, lo que impide valorar la calidad del ajuste.
- Sin validacion de la comunidad: cero descargas y cero "likes" en el momento de la consulta; no existen informes externos de uso.
- Riesgo de alucinacion: inherente al modelo base de 3B, especialmente en tareas de traduccion de dominios especializados.
- Idiomas: el repositorio solo declara ingles. Si el objetivo es la traduccion, no se especifica el par de idiomas ni su cobertura.
- Cadena de licencias: aunque el repositorio declara apache-2.0, el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License de Meta, con condiciones adicionales para uso comercial y despliegues a gran escala. Conviene revisar la compatibilidad antes de un uso en produccion.
- Ambiguedad del artefacto: el tamano del repositorio (0,1 GB) sugiere un adaptador o pesos parciales en lugar de un modelo completo, lo que exige comprobar la carga correcta antes de cualquier despliegue.
- Sin soporte ni mantenimiento conocido: no se documenta repo asociado, paper, demo ni canal de soporte.
- Fecha de creacion atipica (2026-10-09) en los metadatos, lo que puede indicar manipulacion manual de la fecha o un error de registro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gliteceo/Sabi-Translate-1
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Llama 3.2 3B Instruct (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct

No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la informacion disponible.
