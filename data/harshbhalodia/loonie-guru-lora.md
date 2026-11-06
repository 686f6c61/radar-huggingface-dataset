# harshbhalodia/loonie-guru-lora

## Resumen

Loonie Guru v1 es un adaptador LoRA de PEFT entrenado sobre el modelo base Qwen/Qwen3-VL-4B-Instruct, desarrollado por el usuario harshbhalodia para la aplicación de finanzas personales Loonie. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación (rank 32, alpha 32) que modifica el comportamiento del modelo base para convertirlo en el asistente "Guru" de dicha aplicación, orientado a la ejecución local en el ordenador del usuario mediante llama.cpp.

El adaptador resuelve tareas muy concretas dentro del dominio de las finanzas personales: enrutamiento de mensajes a JSON de acciones y herramientas, respuestas breves fundamentadas en datos y cálculos que proporciona la aplicación, revisión de listas de seguimiento e investigación de temas financieros, y análisis de extractos bancarios y de tarjetas de crédito, incluyendo páginas escaneadas mediante el proyector visual del modelo base. La aplicación realiza todos los cálculos y el modelo se limita a explicarlos, con verificación de cada respuesta contra los registros del usuario antes de mostrarla.

La relevancia de este adaptador radica en su enfoque de privacidad y despliegue local: toda la información financiera permanece en el equipo del usuario. Está entrenado exclusivamente con datos sintéticos (11.046 filas de entrenamiento y 964 de validación) y evaluado sobre un conjunto de evaluación congelado y sintético denominado `v1`, con una puntuación global de 0,8238. Su licencia Apache 2.0 y su reducido tamaño (0,3 GB) facilitan su integración y distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL (modelo base Qwen/Qwen3-VL-4B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el despliegue previsto es llama.cpp, que admite cuantización GGUF del modelo base) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base puede convertirse a GGUF para llama.cpp |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen/Qwen3-VL-4B-Instruct, un transformer multimodal de 4.000 millones de parámetros con capacidad de visión, partiendo de la versión `unsloth/Qwen3-VL-4B-Instruct`. El ajuste se realizó con LoRA de rango 32 y alpha 32, durante 1 época, con una tasa de aprendizaje de 0,0001, empleando la librería Unsloth. El resultado es un conjunto de pesos de adaptación de 0,3 GB que se carga junto al modelo base mediante PEFT.

El entrenamiento utilizó exclusivamente datos sintéticos: las tareas se generan en el formato de prompt exacto de la aplicación, las respuestas provienen de un modelo profesor de mayor tamaño o son correctas por construcción, y todas pasaron las mismas comprobaciones automáticas que aplica la aplicación. No se emplearon datos personales de usuarios de Loonie. El conjunto consta de 11.046 filas de entrenamiento y 964 de validación. No se documenta en la información disponible el uso de RLHF o DPO, ni innovaciones técnicas adicionales más allá del ajuste LoRA y del uso del proyector visual del modelo base para el análisis de extractos escaneados.

## Capacidades

- Llamada a herramientas (tool calling): transforma un mensaje del usuario en el JSON de enrutamiento de la aplicación (acción, herramienta y argumentos), rechaza solicitudes inseguras y pide aclaración cuando el mensaje es ambiguo.
- Respuestas rápidas y asesoramiento: genera respuestas breves y fundamentadas a partir de los hechos y cálculos que le proporciona la aplicación, sin realizar cálculos propios.
- Investigación: revisa listas de seguimiento y temas de investigación contrastándolos con los objetivos y el ahorro del usuario.
- Análisis de extractos: convierte páginas de extractos bancarios y de tarjetas de crédito en transacciones, incluyendo páginas escaneadas mediante el proyector visual.
- Capacidad multimodal heredada del modelo base Qwen3-VL-4B-Instruct (procesamiento de imágenes).
- Capacidades generales de asistente conversacional heredadas del modelo base, con los hábitos específicos adquiridos durante el ajuste.
- Idioma: inglés.

## Casos de uso

- Enrutamiento de mensajes en la aplicación Loonie: el adaptador convierte cada mensaje del usuario en el JSON de acción y herramienta que la aplicación necesita para ejecutar la operación correspondiente, con rechazo explícito de peticiones inseguras y solicitud de aclaración ante mensajes ambiguos.
- Asistente financiero local con privacidad: al ejecutarse en llama.cpp sobre el ordenador del usuario, permite consultar información financiera personal sin que los datos salgan del equipo, lo que resulta adecuado para datos sensibles sujetos a requisitos de privacidad.
- Explicación de cálculos financieros: la aplicación realiza todos los cálculos y el modelo los explica en lenguaje natural, con verificación de cada respuesta contra los registros del usuario antes de mostrarla, lo que reduce el riesgo de respuestas incorrectas.
- Análisis de extractos bancarios y de tarjetas: procesa páginas de extractos, incluidas las escaneadas mediante el proyector visual, y las convierte en transacciones estructuradas para su importación en la aplicación.
- Revisión de carteras y objetivos de ahorro: evalúa listas de seguimiento y temas de investigación frente a los objetivos y el ahorro del usuario, ofreciendo una revisión contextualizada de su situación.
- Integración como backend de asistentes de finanzas personales de terceros: al ser un adaptador PEFT sobre un modelo base abierto y con licencia Apache 2.0, puede integrarse mediante PEFT o desplegarse en plataformas de inferencia como FriendliAI.
- Prototipado de asistentes con tool calling en dominios regulados: sirve como referencia de ajuste LoRA con datos sintéticos y comprobaciones automáticas para construir asistentes que enrutan acciones y evitan respuestas que contradigan los registros del usuario.

## Benchmarks y rendimiento

Evaluación sobre el conjunto congelado `v1` de Loonie (perfiles y extractos sintéticos, nunca usados en entrenamiento). Puntuación global: 0,8238.

| Track | Puntuación | Tasa de aprobados | Elementos |
|---|---|---|---|
| advisor | 0,8866 | 0,755 | 200 |
| documents | 0,9985 | 0,9733 | 150 |
| quick_answer | 0,7499 | 0,5667 | 150 |
| research | 0,2667 | 0,02 | 100 |
| tool_calling | 0,8775 | 0,7775 | 400 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; el modelo base Qwen3-VL-4B-Instruct requiere aproximadamente 8 GB de VRAM en FP16, cifra no confirmada en la información disponible.
- Al desplegarse en llama.cpp con cuantización GGUF del modelo base, puede ejecutarse en CPU y en GPU de consumo; no se especifican modelos concretos de GPU en la información disponible.
- GPU recomendadas: no disponible.
- Despliegue previsto: llama.cpp en el ordenador del usuario (según la model card); también es compatible con PEFT (`PeftModel.from_pretrained`) y con la plataforma de inferencia FriendliAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Loonie Guru v1 (este adaptador) | Adaptador LoRA sobre base de 4B | No disponible | Apache 2.0 | safetensors (PEFT) | Especializado en finanzas personales y tool calling; evaluación propia sobre `v1` con puntuación global 0,8238 |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | 4B | No disponible | Apache 2.0 | safetensors | Asistente multimodal general; sin los hábitos ni el formato de enrutamiento de Loonie |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre modelos comparables en la documentación consultada |

## Limitaciones y advertencias

- Está diseñado para los prompts y las comprobaciones propias de Loonie; fuera de ese contexto se comporta como un asistente general Qwen3-VL-4B-Instruct con los hábitos adquiridos, sin garantías de rendimiento específico.
- No proporciona asesoramiento financiero regulado; la model card lo indica explícitamente.
- El rendimiento en el track `research` es muy bajo (0,2667 de puntuación y 0,02 de tasa de aprobados), y en `quick_answer` la tasa de aprobados es de 0,5667, lo que indica limitaciones notables en esas tareas.
- Entrenado exclusivamente con datos sintéticos; puede no generalizar bien a distribuciones reales de mensajes o extractos no representadas en el conjunto de entrenamiento.
- Solo soporta inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación inherente a los modelos de lenguaje, mitigado en parte por la verificación de respuestas contra los registros del usuario que realiza la aplicación.
- Sesgos conocidos: no disponible.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3-VL-4B-Instruct tiene su propia licencia y avisos (LICENSE y NOTICE) que deben respetarse en la redistribución.
- La fecha de creación del repositorio (2026-11-02) y el escaso número de descargas (15) y likes (0) sugieren un proyecto reciente y con poca validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/harshbhalodia/loonie-guru-lora
- Aplicación Loonie: https://loonie.ai/
- Endpoint de inferencia FriendliAI: https://friendli.ai/models/harshbhalodia/loonie-guru-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
