# Dunghthe04/usas-slm

## Resumen

usas-slm es un modelo de lenguaje pequeno (SLM) desarrollado por Dunghthe04 como componente del sistema USAS, una herramienta de apoyo a la decision para estudiantes vietnamitas que quieren estudiar en Estados Unidos. El modelo no es un asistente conversacional: su funcion es leer el mensaje de un estudiante, descomponerlo en intenciones o ideas atomicas y devolver un JSON con la estructura `{"cac_y": [...]}` conforme al contrato definido por el sistema que lo consume. Por tanto, es un modelo de clasificacion de intenciones y extraccion estructurada, no de generacion de respuestas.

Tecnicamente se trata de un ajuste fino mediante LoRA (con Unsloth) sobre `unsloth/Qwen3-4B-Instruct-2507`, un transformer denso de 4.022.468.096 parametros (aproximadamente 4B). La unica version publicada es la v3, distribuida como GGUF con cuantizacion Q4_K_M y pensada para cargarse en Ollama mediante un Modelfile incluido. El repositorio ocupa 2,5 GB y la licencia es Apache 2.0.

Su relevancia es acotada pero ilustrativa: muestra el patron de especializar un modelo generalista de 4B en una tarea de contrato estricto (salida JSON, sin respuesta al usuario) para integrarlo en un pipeline de negocio. El modelo esta entrenado exclusivamente con el prompt corto `slm_phan_loai_cac_y_ngan` (version 2.2) del repositorio `advisor`, y el propio autor advierte que otros prompts degradan el rendimiento. No hay benchmarks publicados ni metricas oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica version publicada) |
| Idiomas soportados | vietnamita (tag del repositorio); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 2,5 GB); safetensors como base del modelo original |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de unos 4B parametros en su variante instruct. Sobre esa base se aplico un ajuste fino con LoRA utilizando la libreria Unsloth, con un maximo de 3 epocas y parada temprana guiada por la perdida de validacion. El resultado se exporto a GGUF en cuantizacion Q4_K_M, que es el unico artefacto publicado en el repositorio.

Los datos de entrenamiento provienen de `du_lieu_slm.xlsx` version 8, divididos en train/validacion/test con proporcion 70/15/15. La tarea definida por el autor es el "contrato v2": clasificacion de intenciones, continuacion de conversacion y deteccion de multiples ideas en un mismo mensaje. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; el autor indica ademas que el etiquetado de los datos sigue en revision, lo que afecta a la fiabilidad de las metricas. No se documenta ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, modos de razonamiento extendido, etc.).

## Capacidades

- Clasificacion de intenciones en vietnamita: descompone un mensaje de estudiante en ideas atomicas y las devuelve en JSON con la clave `cac_y`.
- Salida estructurada estricta: el modelo esta entrenado para emitir exclusivamente el objeto JSON del contrato, sin texto conversacional adicional.
- Continuacion de conversacion: el contrato v2 contempla el contexto de turnos previos para interpretar mensajes de seguimiento.
- Deteccion de multiples intenciones en un mismo mensaje (multi-intent).
- Especializacion de dominio: vocabulario y casuistica de asesoria para estudios en Estados Unidos (visados, universidades, financiacion, plazos, etc., segun el dataset).
- No soporta, segun la informacion disponible: tool calling generico, razonamiento multi-paso abierto, vision, audio ni generacion de respuestas al usuario final.

## Casos de uso

- Enrutamiento de consultas en un chatbot de asesoria: el modelo recibe el mensaje del estudiante y devuelve las intenciones detectadas, que el orquestador usa para dirigir la consulta al modulo o asesor adecuado.
- Extraccion de requisitos para formularios: a partir de un mensaje libre, el sistema obtiene las ideas separadas y las mapea a campos estructurados del expediente del estudiante.
- Deteccion de multi-intencion en un mismo turno: cuando el estudiante pregunta por visado y financiacion a la vez, el modelo separa ambas peticiones para que el backend las procese por separado.
- Preprocesado en pipelines de triaje: integrado como primer paso de un flujo mayor, clasifica y segmenta el mensaje antes de que un modelo mayor o un agente humano lo trate.
- Analitica de conversaciones: al ejecutarse sobre historicos de chat, permite agregar las intenciones mas frecuentes de los estudiantes y priorizar contenidos de asesoria.
- Despliegue local de bajo coste: al ser un GGUF Q4_K_M de unos 2,5 GB, puede ejecutarse en Ollama en una maquina de desarrollo o en un servidor modesto, sin depender de APIs externas.
- Pruebas de contrato en CI: sirve como referencia para validar que el esquema JSON `{"cac_y": [...]}` se mantiene estable entre versiones del prompt y del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que "chua co so lieu do chinh thuc" (aun no hay cifras de medicion oficiales) y que el etiquetado del dataset sigue en revision.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantizacion Q4_K_M publicada, mas el overhead del runtime y del contexto.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090); en el extremo profesional, A100 o H100 son innecesarias para este tamano y solo tendrian sentido por agregacion de peticiones.
- Cabe en GPU consumer: si, en practicamente toda la gama media actual; tambien puede ejecutarse en CPU con llama.cpp, con mayor latencia.
- Opciones de despliegue: Ollama es la via documentada por el autor (Mediante un Modelfile incluido); llama.cpp es compatible por el formato GGUF; vLLM y TGI requeririan convertir o servir los pesos en otro formato, no documentado.
- Latencia y throughput: no disponibles. Para un modelo denso de 4B en Q4_K_M cabe esperar decenas de tokens por segundo en GPU consumer, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Enfoque |
|---|---|---|---|---|
| usas-slm (este modelo) | 4,02B | no disponible | GGUF Q4_K_M / Apache 2.0 | Clasificacion de intenciones en vietnamita con salida JSON |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible en la informacion | safetensors y GGUF / Apache 2.0 | Modelo generalista instruct, multilingue |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (segun documentacion publica de Qwen) | safetensors y GGUF / Apache 2.0 | Modelo generalista instruct de menor tamano |
| Gemma 3 4B IT | 4B aprox. | 128.000 tokens (segun documentacion publica de Google) | safetensors y GGUF / licencia Gemma | Modelo generalista instruct multilingue |

La comparacion relevante es frente a su propio modelo base: usas-slm sacrifica generalidad y capacidades conversacionales para garantizar el contrato JSON en una tarea concreta. Frente a alternativas generalistas del mismo tamano, la ventaja esperada es la adherencia al esquema de salida y el vocabulario de dominio; la desventaja es que no sirve para otras tareas ni para responder al usuario. No hay datos de rendimiento que permitan comparar calidad de forma cuantitativa.

## Limitaciones y advertencias

- Dependencia estricta del prompt: solo funciona correctamente con el prompt `slm_phan_loai_cac_y_ngan` version 2.2 del repositorio `advisor`; cualquier otro prompt degrada la calidad de forma significativa.
- Ambito muy restringido: no responde a los estudiantes ni mantiene conversacion abierta; fuera de la tarea de clasificacion su utilidad es nula.
- Idioma: el tag del repositorio indica vietnamita; no hay informacion sobre el comportamiento en castellano u otros idiomas, y es previsible que sea deficiente.
- Datos en revision: el propio autor reconoce que el etiquetado del dataset no esta cerrado y que no existen metricas oficiales, por lo que la fiabilidad en produccion no esta validada.
- Riesgo de alucinacion estructural: al forzar salida JSON, el modelo puede inventar categorias de intencion no previstas o fragmentar incorrectamente mensajes ambiguos; conviene validar el esquema y las etiquetas en el backend.
- Sesgos: no documentados; el dataset procede de un caso de uso concreto (estudiantes vietnamitas hacia EE. UU.) y puede no representar otros perfiles.
- Contexto: la longitud de contexto del ajuste no esta especificada; no debe asumirse la del modelo base sin verificacion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base Qwen3-4B-Instruct-2507 tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun asi, conviene revisar los terminos del modelo base.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dunghthe04/usas-slm
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Unsloth (libreria de ajuste fino): https://github.com/unslothai/unsloth
- Ollama (runtime de despliegue documentado): https://ollama.com
- Repositorio `advisor` con el prompt `slm_phan_loai_cac_y_ngan`: no disponible (referenciado por el autor sin enlace)
