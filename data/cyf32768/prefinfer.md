# cyf32768/PREFINFER

## Resumen

PREFINFER es un adaptador LoRA de inferencia de preferencias desarrollado por Yufei Chen (cyf32768) mediante fine-tuning supervisado del modelo base Qwen/Qwen3-4B-Instruct-2507 sobre el dataset PREFMINE-15K. El modelo toma como entrada el historial de interacciones previas de un usuario junto con su solicitud actual, y devuelve la preferencia más probable del usuario que resulta relevante para dicha solicitud. Se trata de una tarea de personalización orientada a asistentes conversacionales y sistemas de recomendación.

El adaptador se distribuye en formato PEFT (safetensors) y se sirve como un módulo LoRA sobre el modelo base Qwen3-4B-Instruct-2507, que es un transformer decoder de 4 mil millones de parámetros con una ventana de contexto de 131072 tokens. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El modelo está pensado para ser desplegado con vLLM, que soporta la carga de adaptadores LoRA de forma nativa.

La relevancia de PREFINFER radica en que aborda un problema específico de la personalización conversacional: inferir preferencias implícitas a partir de interacciones pasadas, en lugar de depender de perfiles explícitos. Esto permite adaptar respuestas y recomendaciones de forma dinámica, sin necesidad de reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder) |
| Parametros totales | No disponible (el adaptador LoRA no especifica su numero de parametros; el base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131072 tokens (configuracion del base en vLLM) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base puede cuantizarse) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

PREFINFER es un adaptador LoRA aplicado sobre Qwen3-4B-Instruct-2507, un modelo transformer decoder con atencion causal. El fine-tuning se realizo mediante aprendizaje supervisado sobre el dataset PREFMINE-15K, del cual no se proporcionan detalles especificos en la model card (numero de tokens, composicion, etc.), pero se remite a su propia card para mas informacion. El prompt de entrenamiento esta adaptado del dataset CUPID, concretamente del archivo `preference_inferrer.yaml`, y se estructura en un `system_prompt` fijo y una plantilla de `user_prompt` que combina el historial de interaccion y la solicitud actual.

La inferencia se realiza con decodificacion greedy (`temperature=0`, `top_p=1`), lo que sugiere que el modelo esta optimizado para producir respuestas deterministas y estables. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion adicionales; el entrenamiento es puramente supervisado. El adaptador se sirve como modulo LoRA en vLLM, lo que permite intercambiarlo sin modificar los pesos del modelo base.

## Capacidades

- Inferencia de preferencias del usuario: dado un historial de interacciones (conversaciones previas) y una solicitud actual, el modelo identifica la preferencia mas probable del usuario que sea relevante para la solicitud.
- Generacion de texto en ingles: produce respuestas en formato de texto plano, tipicamente con una seccion "### Most Likely Preference" seguida de la preferencia inferida.
- Integracion con el modelo base Qwen3-4B-Instruct-2507: hereda las capacidades generales de generacion y razonamiento del base, aunque el adaptador esta especializado en la tarea de inferencia de preferencias.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio en la informacion disponible.

## Casos de uso

- Asistentes virtuales personalizados: el modelo puede analizar el historial de conversaciones de un usuario y adaptar sus respuestas a las preferencias detectadas, por ejemplo, recomendando metodos de aprendizaje presenciales si el usuario ha mostrado rechazo a opciones online.
- Sistemas de recomendacion conversacional: integrado en un chatbot de recomendacion de productos, cursos o contenido, PREFINFER infiere las preferencias implicitas del usuario a partir de interacciones previas y las aplica a la solicitud actual.
- Atencion al cliente automatizada: el modelo puede personalizar las respuestas de soporte basandose en el historial de tickets o chats anteriores, detectando si el usuario prefiere soluciones rapidas, explicaciones detalladas o canales especificos.
- Analisis de preferencias en encuestas o feedback: a partir de conversaciones previas, el modelo extrae las preferencias declaradas o implicitas del usuario, util para segmentacion y analisis de opinion.
- Adaptacion de contenido educativo: en plataformas de e-learning, el modelo infiere si el usuario prefiere formatos presenciales, online, autodidactas o colaborativos, y sugiere recursos acordes.
- Pruebas de concepto en investigacion: como modelo de referencia para estudios sobre inferencia de preferencias en dialogo, permitiendo comparar enfoques de personalizacion sin reentrenar modelos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni evaluaciones especificas de la tarea de inferencia de preferencias. Tampoco se proporcionan comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware dependen del modelo base Qwen3-4B-Instruct-2507. En FP16, el base requiere aproximadamente 8 GB de VRAM para inferencia, mas el overhead del adaptador (minimo).
- Con cuantizacion (por ejemplo, 4 bits), el base puede ejecutarse en GPUs consumer con 6 GB de VRAM, como una RTX 3060 o RTX 4060.
- El comando de vLLM proporcionado usa `--tensor-parallel-size 1` y `--gpu-memory-utilization 0.90`, lo que sugiere que cabe en una unica GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3090, RTX 4080, A10).
- Opciones de despliegue: vLLM (soporte nativo de LoRA), y potencialmente otros frameworks que soporten PEFT, como Hugging Face Transformers con `peft` y `transformers` para inferencia local.
- Latencia y throughput: no se proporcionan datos especificos. Con vLLM y el base de 4B, se puede esperar un throughput de decenas de requests por segundo en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente dedicados a la inferencia de preferencias en dialogo. La model card no menciona alternativas ni benchmarks comparativos. Se podria considerar que modelos generales como Qwen3-4B-Instruct o Llama-3-8B-Instruct podrian realizar la tarea con prompting adecuado, pero no hay datos que permitan una comparacion rigurosa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- Al ser un adaptador LoRA, depende completamente del modelo base Qwen3-4B-Instruct-2507. Cualquier limitacion o sesgo del base se hereda.
- No se han publicado evaluaciones de sesgos, robustez ni alucinaciones especificas para PREFINFER. La inferencia de preferencias puede producir resultados incorrectos o inventados si el historial es ambiguo o insuficiente.
- La decodificacion greedy puede generar respuestas repetitivas o poco variadas en algunos casos.
- El dataset de entrenamiento PREFMINE-15K no esta documentado en detalle en la model card; se desconoce su composicion, tamano efectivo y posibles sesgos.
- No se proporcionan garantias de rendimiento en produccion; se recomienda validar el modelo en el dominio de aplicacion antes de un despliegue critico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyf32768/PREFINFER
- Dataset PREFMINE-15K: https://huggingface.co/datasets/cyf32768/PREFMINE-15K
- Dataset CUPID (fuente del prompt): https://github.com/kixlab/CUPID
- Dataset PrefEval (ejemplo de uso): https://huggingface.co/datasets/allenai/PrefEval
- Perfil del autor: https://huggingface.co/cyf32768
