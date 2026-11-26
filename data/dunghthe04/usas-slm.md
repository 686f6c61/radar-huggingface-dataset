# Dunghthe04/usas-slm

## Resumen

usas-slm es un modelo de lenguaje pequeno (SLM) desarrollado por Dunghthe04 como componente del sistema USAS, una herramienta de apoyo a la decision para estudiantes vietnamitas que quieren estudiar en Estados Unidos. El modelo no es un asistente conversacional: su funcion es leer los mensajes de los estudiantes, descomponerlos en ideas independientes y devolver un objeto JSON con la forma `{"cac_y": [...]}` que respeta un contrato de sistema predefinido. No responde al estudiante, solo clasifica y estructura sus intenciones.

Tecnicamente es un ajuste fino mediante LoRA del modelo unsloth/Qwen3-4B-Instruct-2507, una variante de Qwen3 de 4.022 millones de parametros con arquitectura transformer densa. El ajuste se realizo con Unsloth durante un maximo de 3 epocas con parada temprana por perdida de validacion, y se exporto a GGUF en cuantizacion Q4_K_M para su despliegue en Ollama. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es acotada pero clara: demuestra un patron de uso de modelos pequenos como extractores de estructura deterministas dentro de pipelines de agentes, donde la salida debe ser JSON estricto y el modelo debe ceñirse a un prompt concreto. El autor advierte que el modelo solo funciona bien con el prompt corto `slm_phan_loai_cac_y_ngan` (version 2.2) del repositorio `advisor`, y que otros prompts degradan el rendimiento. No hay metricas oficiales publicadas y el etiquetado del conjunto de datos sigue en revision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; el autor no la especifica) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica version publicada, v3) |
| Idiomas soportados | vietnamita (etiqueta `vietnamese`; el autor no declara lista formal de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 7,5 GB; incluye safetensors del modelo base segun el dato de parametros) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de 4.022 millones de parametros, y se ajusta mediante LoRA con la libreria Unsloth. El entrenamiento se limita a un maximo de 3 epocas con parada temprana basada en la perdida de validacion, un regimen conservador tipico de ajustes de tarea especifica sobre modelos ya alineados por instrucciones. No se documenta el uso de RLHF ni DPO adicional; el alineamiento proviene integramente del modelo base.

Los datos de entrenamiento proceden de `du_lieu_slm.xlsx` version 8, dividido en 70/15/15 para entrenamiento, validacion y prueba. El autor indica que el etiquetado aun esta en revision, lo que implica que la calidad del conjunto no esta consolidada. El objetivo de la tarea es la segmentacion de mensajes en ideas multiples y su serializacion en JSON, entrenada contra el contrato v2 del sistema (tareas, continuacion y multiples ideas). No se publican cifras de tokens de entrenamiento, composicion del dataset ni innovaciones tecnicas adicionales (no hay decodificacion especulativa ni atencion lineal documentadas).

## Capacidades

- Segmentacion de mensajes en ideas o intenciones independientes (`cac_y`), devueltas como JSON estructurado.
- Clasificacion de intencion en el dominio concreto de asesoria para estudiar en Estados Unidos (etiqueta `study-abroad`).
- Generacion de salida estrictamente estructurada segun el contrato del sistema USAS.
- Comprension de vietnamita como idioma principal de operacion.
- Integracion en pipelines de agentes como componente de extraccion de estructura (endpoints compatibles segun las etiquetas del repo).
- No soporta, segun la informacion disponible: vision, audio, tool calling generico, modo thinking ni razonamiento multi-paso abierto. El modelo esta disenado para no responder al usuario final.

## Casos de uso

- Clasificacion de intenciones en un chatbot de asesoria educativa: el modelo recibe el mensaje del estudiante y devuelve las ideas separadas en JSON, que el orquestador del sistema USAS usa para enrutar la conversacion al modulo adecuado.
- Preprocesado de consultas multi-intencion: cuando un estudiante plantea varias preguntas en un mismo mensaje (por ejemplo, visado y financiacion), el modelo las descompone en elementos independientes para que cada una se procese por separado.
- Extraccion de estructura en pipelines de agentes: al emitir JSON validable, la salida puede consumirse directamente por codigo sin post-procesado heuristico, reduciendo errores de parseo.
- Enrutado de tickets o formularios de admision: integrado en un backend que recibe mensajes de estudiantes y necesita categorizar rapidamente la consulta antes de asignarla a un asesor humano.
- Prototipado de sistemas de decision con modelos pequenos: sirve como referencia de como ajustar un modelo de 4B con LoRA y desplegarlo en Ollama para tareas de extraccion determinista en local.
- Despliegue en infraestructura limitada: la cuantizacion Q4_K_M y el tamano de 4B permiten ejecutarlo en hardware modesto, adecuado para entornos donde no se quiere depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que aun no hay cifras de evaluacion oficiales y que el etiquetado de los datos sigue en revision.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M de un modelo de 4B, el peso de los pesos ronda los 2,5-3 GB; en la practica se recomienda al menos 4-6 GB de VRAM para contexto y overhead.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090); en datacenter, A100 o H100 quedan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas de VRAM.
- Opciones de despliegue: Ollama mediante el `Modelfile` incluido (metodo documentado por el autor); al ser GGUF, tambien es compatible con llama.cpp y otros runners GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| usas-slm (este modelo) | 4,02B | no disponible | Apache 2.0 | Extraccion JSON para dominio study-abroad en vietnamita |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible en la informacion | Apache 2.0 | Asistente generalista multilingue |
| Qwen3-4B (generico) | 4,02B | no disponible en la informacion | Apache 2.0 | Asistente generalista |

La comparativa se limita al modelo base y su familia, ya que no se dispone de datos de rendimiento del ajuste ni de modelos especializados equivalentes en la informacion proporcionada. La diferencia principal frente al base es la especializacion en una tarea de extraccion estructurada con un prompt fijo, a costa de perder capacidad conversacional general.

## Limitaciones y advertencias

- Dependencia estricta del prompt: el modelo solo rinde correctamente con el prompt `slm_phan_loai_cac_y_ngan` (version 2.2) del repositorio `advisor`; otros prompts degradan la calidad de forma notable.
- Ausencia de metricas: no hay evaluacion publicada, por lo que no se puede verificar su precision en produccion.
- Datos en revision: el etiquetado del conjunto de entrenamiento aun no esta consolidado, lo que puede introducir ruido y sesgos en la clasificacion.
- Dominio muy acotado: entrenado para asesoria de estudios en EE. UU. en vietnamita; fuera de ese ambito su comportamiento no esta garantizado.
- Riesgo de alucinacion en la estructura: al generar JSON, puede producir claves o ideas mal formadas si el mensaje de entrada se sale de la distribucion de entrenamiento; conviene validar la salida con un esquema.
- Idioma: no se declara una lista formal de idiomas soportados; el uso fuera del vietnamita no esta respaldado por la documentacion.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dunghthe04/usas-slm
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Repositorio `advisor` (prompt `slm_phan_loai_cac_y_ngan`): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles
