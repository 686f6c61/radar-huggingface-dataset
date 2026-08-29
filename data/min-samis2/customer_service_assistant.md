# min-samis2/Customer_Service_assistant

## Resumen

El modelo `min-samis2/Customer_Service_assistant` es un ajuste fino (fine-tuning) del modelo base `mistralai/Mistral-7B-Instruct-v0.3`, entrenado con el método Forge en su variante de instrucción. El autor, Mindaugas Samokaitis (min-samis2), ha publicado este modelo con el objetivo de especializar Mistral 7B en tareas de atención al cliente, aunque la documentación disponible es muy limitada y no se especifican los datos de entrenamiento ni el rendimiento obtenido.

El repositorio tiene un tamaño de 0,3 GB, lo que sugiere que los pesos están cuantizados o que se ha subido una versión reducida del modelo. Al estar basado en Mistral-7B-Instruct-v0.3, hereda su arquitectura transformer de 7 mil millones de parámetros y su ventana de contexto de 32 768 tokens. La relevancia de este modelo radica en su potencial para desplegar asistentes conversacionales de atención al cliente con un coste computacional moderado, aunque la falta de información pública sobre su entrenamiento y evaluación limita su uso en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basada en Mistral-7B-Instruct-v0.3 |
| Parametros totales | 7 000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el tamano del repo sugiere cuantizacion, pero no se especifica) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles, pero no se confirma para este ajuste) |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun los tags de HuggingFace) |

## Arquitectura y entrenamiento

El modelo parte de `mistralai/Mistral-7B-Instruct-v0.3`, un transformer decoder-only con 7 000 millones de parámetros, atención de ventana deslizante (sliding window attention) y una ventana de contexto de 32 768 tokens. El ajuste fino se realizó con el método Forge en su modalidad de instrucción, tal como indican los tags `forge-method:instruction` y `forge-prev-method:instruction`. Forge es una herramienta de entrenamiento que permite ajustar modelos mediante datasets de instrucciones, pero no se ha publicado el dataset concreto utilizado, el número de pasos de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. El linaje indicado en la model card (`Customer_Service_assistant → Customer_Service_assistant`) sugiere que el modelo se generó a partir de un proceso iterativo, pero no aporta detalles adicionales.

## Capacidades

- Generación de texto conversacional orientada a tareas de atención al cliente, basada en las instrucciones del modelo base Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a preguntas dentro de la ventana de contexto de 32 768 tokens.
- Soporte de tool calling y function calling, heredado del modelo base Mistral-7B-Instruct-v0.3, que incluye esta capacidad de forma nativa.
- Capacidad multilingüe limitada: el modelo base está entrenado principalmente en inglés, aunque puede generar texto en otros idiomas con menor calidad. No se ha confirmado si el ajuste fino mejora o restringe este aspecto.
- No se ha documentado soporte para modos especiales como thinking mode, visión o audio.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con clientes, resolviendo consultas frecuentes sobre productos o servicios. Su ventana de contexto de 32 768 tokens permite mantener el historial de la conversación sin perder información relevante.
- Clasificación y derivación de incidencias: a partir de la entrada del usuario, el modelo puede categorizar el tipo de problema (facturación, soporte técnico, reclamaciones) y sugerir el departamento adecuado, gracias a su capacidad de seguir instrucciones.
- Generación de respuestas para agentes humanos: puede redactar borradores de respuestas a correos o chats de clientes, que un agente humano revisa y envía, reduciendo el tiempo de redacción.
- Integración en sistemas de ticketing: mediante tool calling, el modelo puede interactuar con APIs de sistemas de gestión de incidencias (crear tickets, actualizar estados, consultar bases de conocimiento) de forma automatizada.
- Asistente virtual en sitios web: desplegado como chatbot en una página corporativa, responde preguntas frecuentes y recopila información del cliente antes de transferirlo a un agente humano.
- Entrenamiento de agentes de soporte: el modelo puede simular interacciones con clientes para practicar escenarios de atención, generando respuestas realistas y variadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones para este modelo concreto. Al ser un ajuste fino de Mistral-7B-Instruct-v0.3, su rendimiento base será similar al de dicho modelo, pero no se puede confirmar sin evaluaciones específicas.

## Requisitos de hardware

- VRAM estimada para inferencia: con un tamaño de repo de 0,3 GB, es probable que los pesos estén cuantizados (posiblemente a 4 bits o 8 bits). En ese caso, la inferencia podría ejecutarse con menos de 4 GB de VRAM, aunque no se especifica el formato exacto.
- GPU recomendadas: para una cuantización de 4 bits, una GPU con 6 GB de VRAM (como una RTX 2060 o superior) sería suficiente. Para el modelo completo en FP16, se necesitarían al menos 16 GB de VRAM (por ejemplo, una RTX 4090 o una A100).
- Si cabe en consumer GPU: sí, en versiones cuantizadas puede ejecutarse en GPUs de gama media como la RTX 3060 o RTX 4060.
- Opciones de despliegue: al ser un modelo basado en Mistral, es compatible con vLLM, llama.cpp, Ollama y TGI. El formato safetensors permite su uso con Transformers y vLLM directamente.
- Latencia y throughput estimados: no disponibles. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| min-samis2/Customer_Service_assistant | 7B | 32 768 | no disponible | Ajuste fino de Mistral-7B-Instruct-v0.3, sin benchmarks publicados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32 768 | Apache 2.0 | Modelo base, con tool calling y buen rendimiento general |
| NousResearch/Hermes-2-Pro-Mistral-7B | 7B | 32 768 | Apache 2.0 | Ajuste fino orientado a function calling y agentes, con benchmarks publicados |

La comparativa se limita a modelos de 7B basados en Mistral. El modelo de min-samis2 no ofrece información suficiente para evaluar su rendimiento frente a alternativas establecidas como Hermes-2-Pro, que sí documenta sus capacidades y resultados.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Mistral-7B-Instruct-v0.3, puede heredar sesgos presentes en los datos de entrenamiento del modelo base, aunque no se ha realizado una auditoría específica.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir respuestas inventadas o incorrectas, especialmente en dominios especializados. No se ha evaluado su fiabilidad en contextos de atención al cliente reales.
- Limitaciones de contexto: aunque la ventana es de 32 768 tokens, el rendimiento en contextos muy largos puede degradarse, y no se ha verificado el comportamiento del ajuste fino en dichos escenarios.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Falta de documentación: no se han publicado detalles sobre el dataset de entrenamiento, el proceso de ajuste ni evaluaciones, lo que dificulta la reproducibilidad y la confianza en el modelo.
- Riesgo para producción: sin benchmarks ni validación externa, no se recomienda su despliegue en entornos críticos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/min-samis2/Customer_Service_assistant
- Perfil del autor: https://huggingface.co/min-samis2
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Notebook de entrenamiento de otro modelo del autor (referencia del método Forge): https://gist.github.com/samokmin/ff81e6a4dee9bc1a5cd364edf74c7a3b
