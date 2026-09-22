# rushilarun/Mochi-SmolLM-360M-Classifier

## Resumen

Mochi-SmolLM-360M-Classifier es un adaptador LoRA (PEFT) desarrollado por rushilarun sobre el modelo base HuggingFaceTB/SmolLM2-360M-Instruct. Forma parte del proyecto Mochi (Malicious Output Curation for High-quality Injection-defense) y su función concreta es la de clasificador de seguridad en su fase 1: responder a prompts benignos y rechazar prompts maliciosos, con especial atención a la defensa frente a inyección de prompts.

El modelo no es un LLM de propósito general, sino un adaptador de clasificación/decisión de 360 M de parámetros efectivos sobre los que se aplica un ajuste LoRA. Resuelve un problema acotado y muy relevante en producción: disponer de un filtro ligero, desplegable en hardware modesto, capaz de separar entradas legítimas de intentos de manipulación o abuso antes de que lleguen a un modelo mayor.

Su relevancia actual radica en el coste: al ser un adaptador sobre un modelo de 361,8 M de parámetros, puede ejecutarse en CPU o en GPU de gama baja, lo que lo hace candidato a actuar como primera capa de defensa en pipelines de moderación. Los datos publicados por el autor reportan una accuracy de 0,902 y un F1 de 0,936 sobre un conjunto de test de 1.074 prompts. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo base SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 361,8 M en el modelo base; numero de parametros del adaptador LoRA no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens del modelo base (no confirmado de forma explicita en la informacion del adaptador) |
| Tipos de cuantizacion | no disponible; al ser un adaptador LoRA, puede cargarse sobre el modelo base cuantizado en 8 o 4 bits, pero el autor no documenta configuraciones |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos del adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se apoya en SmolLM2-360M-Instruct, un transformer decoder de 361,8 M de parámetros preentrenado y ajustado por instrucciones por HuggingFaceTB. Sobre esa base, el autor aplica un ajuste LoRA (Low-Rank Adaptation) mediante la librería PEFT, de modo que el resultado final es un conjunto de matrices de bajo rango que se suman a los pesos del modelo base en tiempo de carga. No se publican en la información disponible los hiperparámetros del ajuste (rango, alpha, tasa de aprendizaje, número de pasos) ni el volumen exacto de ejemplos de entrenamiento.

El conjunto de datos declarado es SulKhu/Mochi y las etiquetas de las respuestas fueron generadas por Claude Haiku 4.5, según indica el autor. El adaptador corresponde a la fase 1 del pipeline Mochi, orientada a clasificación binaria de intención (prompt benigno frente a prompt malicioso) con rechazo de los casos dañinos. La evaluación se realizó sobre un split de test de 1.074 prompts, cuyos resultados se detallan en la sección de benchmarks. No se documenta el uso de RLHF, DPO ni técnicas adicionales de alineamiento más allá del ajuste supervisado con LoRA.

## Capacidades

- Clasificación de seguridad: distingue prompts benignos de prompts maliciosos en el contexto de defensa frente a inyección de prompts.
- Rechazo controlado: ante una petición maliciosa, el modelo está entrenado para negarse a responder.
- Respuesta a peticiones benignas: en lugar de emitir solo una etiqueta, genera una respuesta cuando el prompt se considera legítimo (el ejemplo de la model card usa `max_new_tokens=32`).
- Herencia de instrucciones del modelo base: conserva el formato de chat de SmolLM2-360M-Instruct, con `apply_chat_template` y turnos de rol `user`.
- Integración con PEFT: puede cargarse como adaptador sobre el modelo base en `transformers` mediante `PeftModel.from_pretrained`.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas (el modelo base SmolLM2 está orientado principalmente al inglés, pero el adaptador no declara idiomas).
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Primera capa de defensa en un pipeline de LLM: colocar el clasificador delante de un modelo mayor para filtrar intentos de inyección de prompts antes de que consuman cómputo o expongan herramientas internas. Su tamaño de 361,8 M permite ejecutarlo en cada petición con coste bajo.
- Moderación de entrada en chatbots de atención al cliente: rechazar peticiones abusivas o intentos de manipular el sistema, dejando pasar las consultas legítimas para que las responda el modelo principal.
- Filtrado de contenido en aplicaciones con UGC: procesar los mensajes enviados por usuarios y marcar o bloquear los que se clasifiquen como maliciosos antes de publicarlos o reenviarlos a otro servicio.
- Defensa de agentes con acceso a herramientas: interponer el clasificador entre el usuario y un agente con function calling, de modo que las instrucciones sospechosas no lleguen a disparar llamadas a APIs sensibles.
- Evaluación y red-teaming: usar el adaptador como línea base accesible para medir la eficacia de ataques de inyección de prompts contra un sistema propio.
- Despliegue en entornos con recursos limitados: al apoyarse en un modelo de 361,8 M, puede ejecutarse en CPU o en una GPU de gama baja dentro de un contenedor pequeño, sin necesidad de aceleradores de datacenter.
- Preprocesado por lotes de logs: clasificar grandes volúmenes de prompts históricos para auditar cuántos intentos maliciosos recibió un sistema y etiquetar incidentes.

## Benchmarks y rendimiento

El autor publica resultados de clasificación sobre el split de test de 1.074 prompts. Las etiquetas de referencia fueron asignadas por Claude Haiku 4.5.

| Metrica | Valor |
|---|---|
| Accuracy | 0,902 |
| Precision | 0,964 |
| Recall | 0,909 |
| F1 | 0,936 |
| Tamano del test | 1.074 prompts |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el adaptador está orientado a una tarea de clasificación de seguridad y no a evaluación de conocimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,7-0,8 GB en fp16 solo para los pesos del modelo base de 361,8 M de parámetros, más el adaptador LoRA (de tamaño reducido) y la caché KV. La cifra exacta depende de la longitud de contexto y del tamaño de lote.
- Cuantización: al ser un adaptador LoRA, puede cargarse sobre el modelo base cuantizado en 8 o 4 bits, lo que reduce el uso de memoria a unos cientos de MB. El autor no documenta configuraciones probadas.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3060, RTX 4090). También es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor), y en general cualquier stack que soporte safetensors y LoRA, como vLLM o TGI si se fusiona el adaptador con el modelo base. No se documenta compatibilidad oficial con llama.cpp u Ollama, aunque sería posible tras convertir y fusionar los pesos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mochi-SmolLM-360M-Classifier | 361,8 M (base) + adaptador LoRA | 8.192 tokens (base) | Clasificacion benigno/malicioso y rechazo | apache-2.0 | HuggingFace (adaptador PEFT) |
| SmolLM2-360M-Instruct | 361,8 M | 8.192 tokens (base) | LLM instructivo de propósito general | apache-2.0 | HuggingFace |
| Clasificadores de seguridad de mayor tamano (por ejemplo, familias tipo guard) | no disponible | no disponible | Moderacion de contenido | depende del modelo | HuggingFace |

La comparación cuantitativa con alternativas de moderación no está disponible en la información proporcionada, ya que no se publican en la model card resultados frente a otros clasificadores. La ventaja diferencial documentada es el tamaño reducido del modelo base, que permite desplegarlo donde un guard de mayor tamaño no cabría.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar HuggingFaceTB/SmolLM2-360M-Instruct para funcionar. El repositorio ocupa 0,0 GB, coherente con un adaptador de bajo rango.
- Las métricas publicadas proceden de un único split de test de 1.074 prompts, no de una evaluación externa e independiente.
- Las etiquetas de referencia fueron generadas por Claude Haiku 4.5, por lo que el clasificador hereda los sesgos y posibles errores de ese anotador automático.
- No se documentan idiomas soportados: el comportamiento fuera del inglés es incierto y no está evaluado.
- Riesgo de falsos negativos en ataques novedosos: al ser un clasificador entrenado sobre un dataset concreto (SulKhu/Mochi), puede no generalizar a técnicas de inyección no representadas en el entrenamiento.
- Riesgo de falsos positivos: una precisión de 0,964 implica que una parte de las entradas benignas puede bloquearse, con el consiguiente impacto en la experiencia de usuario si se usa como filtro estricto.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe asumirse que las herede del modelo base en este ajuste.
- Licencia apache-2.0: permite uso comercial del adaptador, pero conviene verificar también las condiciones del modelo base SmolLM2-360M-Instruct.
- El autor referencia el repositorio de GitHub para los detalles completos de entrenamiento y datasets, por lo que la model card de HuggingFace es incompleta por sí sola.
- El modelo se creó en 2026-09-21 y no registra descargas ni likes: no hay evidencia de uso en producción ni de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rushilarun/Mochi-SmolLM-360M-Classifier
- Repositorio del proyecto Mochi: https://github.com/rushil-arun/mochi
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset declarado (SulKhu/Mochi): no disponible como enlace directo en la información proporcionada
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas generales de ChatGPT y no guardan relación con este modelo.
