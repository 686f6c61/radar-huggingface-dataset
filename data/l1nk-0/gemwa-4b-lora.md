# l1nk-0/Gemwa-4B-LoRA

## Resumen

Gemwa-4B-LoRA es el adaptador LoRA que da lugar a Gemwa-4B, un ajuste fino de Google Gemma 3 4B instruct orientado a responder en bhojpuri (código ISO `bho`), una lengua indoaria hablada principalmente en Bihar y Uttar Pradesh (India) y en la diáspora. Lo desarrolla el usuario l1nk-0 y se publica bajo la licencia Gemma con un requisito adicional de atribución al autor. El adaptador se entrenó con Unsloth sobre dos conjuntos de datos: instrucciones traducidas al bhojpuri derivadas de Stanford Alpaca y un corpus específico de preguntas y respuestas sobre la festividad de Chhath.

El modelo hereda la arquitectura de Gemma 3 4B, un transformer denso de aproximadamente 4.000 millones de parámetros con ventana de contexto de 128.000 tokens y capacidades multimodales de imagen y texto en su versión instruct original. El adaptador LoRA no modifica esa arquitectura: se aplica sobre los pesos base y, según el autor, existen dos versiones etiquetadas, `v1.0` (respuestas en bhojpuri) y `v1.2` (añade conocimiento sobre Chhath, rama `main` actual).

Su relevancia es acotada pero clara: cubre una lengua con muy poca representación en modelos abiertos y ofrece un punto de partida para aplicaciones de asistencia lingüística, educación o preservación cultural en bhojpuri. Para la mayoría de usos prácticos el autor recomienda emplear el modelo fusionado (l1nk-0/Gemwa-4B) o los ficheros GGUF (l1nk-0/Gemwa-4B-GGUF) en lugar del adaptador aislado, ya que este último requiere cargar Gemma 3 4B por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3 4B) con adaptador LoRA (PEFT) |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Gemma 3 4B; no verificada en la model card del adaptador) |
| Tipos de cuantizacion | No disponible en la model card del adaptador; el repositorio GGUF asociado sugiere cuantizaciones estándar de llama.cpp |
| Idiomas soportados | Bhojpuri (`bho`); el modelo base soporta multitud de idiomas, pero el ajuste está orientado a bhojpuri |
| Licencia | Gemma Terms of Use + requisito de atribución a l1nk-0; datos derivados de Stanford Alpaca (CC BY-NC 4.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se monta sobre google/gemma-3-4b-it, un transformer denso de Google con atención multi-cabeza estándar y ventana de contexto de 128.000 tokens. El ajuste se realizó con Unsloth, una librería de entrenamiento optimizada para reducir memoria y acelerar el fine-tuning de modelos abiertos. Al ser un adaptador LoRA, solo se entrenan matrices de bajo rango inyectadas en las capas del modelo base, lo que explica el tamaño del repositorio (0,9 GB) frente a los aproximadamente 8 GB en bf16 del modelo completo.

Los datos de entrenamiento proceden de dos fuentes: `pksx01/alpaca_bhojpuri_instruction`, un conjunto de instrucciones en bhojpuri derivado de Stanford Alpaca, y `l1nk-0/bhojpuri-chhath-qa`, un corpus de preguntas y respuestas sobre la festividad de Chhath creado por el propio autor. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth. Las versiones publicadas son `v1.0` (respuestas en bhojpuri) y `v1.2` (añade conocimiento sobre Chhath, rama `main` actual).

## Capacidades

- Generación de texto conversacional en bhojpuri, con respuestas orientadas a instrucciones.
- Razonamiento y respuesta a preguntas generales heredados del modelo base Gemma 3 4B instruct.
- Conocimiento específico sobre la festividad de Chhath en la versión `v1.2`.
- Capacidades multimodales de imagen y texto potencialmente heredadas de Gemma 3 4B instruct (no confirmadas en la model card del adaptador).
- Soporte multilingüe del modelo base, aunque el ajuste está orientado a bhojpuri.
- Tool calling y function calling: no documentado en la model card del adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, audio u otras capacidades especiales: no documentado.

## Casos de uso

- Asistencia lingüística en bhojpuri: el modelo puede responder consultas y mantener conversaciones multi-turno en esta lengua, útil para hablantes nativos y para la diáspora que quiere practicar o consultar en su idioma.
- Educación y preservación cultural: generación de explicaciones, resúmenes y material didáctico en bhojpuri sobre tradiciones como Chhath, aprovechando el corpus específico de la versión `v1.2`.
- Atención al cliente localizada: despliegue de un chatbot en bhojpuri para servicios públicos o comercios en Bihar y Uttar Pradesh, donde el acceso a asistentes en lengua local es limitado.
- Traducción asistida y adaptación de contenido: uso del modelo como ayuda para traducir o adaptar textos del hindi o inglés al bhojpuri, con revisión humana dado el riesgo de alucinación.
- Investigación en NLP de bajos recursos: el adaptador sirve como base para experimentos de fine-tuning adicional, evaluación de modelos en lenguas indoarias menores o comparación con otros ajustes de Gemma 3.
- Prototipado rápido con GGUF: gracias a los ficheros GGUF del repositorio asociado, se puede desplegar en local con llama.cpp u Ollama para demos y pruebas de concepto sin infraestructura GPU dedicada.
- Generación de contenido divulgativo: redacción de borradores de artículos, publicaciones para redes o guiones en bhojpuri sobre temas culturales y religiosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA requiere cargar además el modelo base Gemma 3 4B. En bf16, el modelo completo ocupa aproximadamente 8 GB de VRAM; en cuantización de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB. El adaptador añade una cantidad marginal.
- GPU recomendadas: para bf16, una GPU con al menos 16 GB de VRAM (RTX 4080, RTX 4090, A100 40 GB, H100). Para cuantizaciones de 4 bits, una RTX 3060 de 12 GB o superior puede ser suficiente.
- Cabe en GPU de consumo: sí, en cuantización de 4 u 8 bits en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090.
- Opciones de despliegue: llama.cpp y Ollama mediante los ficheros GGUF de l1nk-0/Gemwa-4B-GGUF; vLLM o TGI para el modelo fusionado; transformers + PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemwa-4B-LoRA (este) | ~4B (base) + LoRA | 128.000 (base) | Bhojpuri | Gemma + atribución | Hugging Face |
| google/gemma-3-4b-it | ~4B | 128.000 | Multilingüe | Gemma | Hugging Face |
| l1nk-0/Gemwa-4B (fusionado) | ~4B | 128.000 | Bhojpuri | Gemma + atribución | Hugging Face |
| l1nk-0/Gemwa-4B-GGUF | ~4B | 128.000 | Bhojpuri | Gemma + atribución | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos de Gemma 3 4B y de los datos de instrucciones traducidas de Alpaca, que pueden no reflejar la diversidad dialectal del bhojpuri.
- Riesgo de alucinación: al ser un ajuste fino de un modelo de 4B sobre un corpus limitado, la precisión factual en bhojpuri puede ser baja, especialmente fuera del dominio de Chhath.
- Limitaciones de contexto o idioma: el ajuste está orientado a bhojpuri; el rendimiento en otros idiomas no está documentado y puede degradarse respecto al modelo base.
- Restricciones de licencia: uso sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; además, se exige atribución a l1nk-0 con enlace a la model card. Parte de los datos deriva de Stanford Alpaca (CC BY-NC 4.0), lo que puede afectar al uso comercial.
- Caveat para producción: el autor recomienda usar el modelo fusionado o los GGUF en lugar del adaptador aislado; el adaptador requiere cargar Gemma 3 4B por separado y no incluye pesos completos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación comunitaria.
- No se documentan evaluaciones de seguridad, sesgo ni robustez.

## Enlaces

- Adaptador LoRA: https://huggingface.co/l1nk-0/Gemwa-4B-LoRA
- Modelo fusionado: https://huggingface.co/l1nk-0/Gemwa-4B
- Ficheros GGUF: https://huggingface.co/l1nk-0/Gemwa-4B-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Dataset de instrucciones: https://huggingface.co/datasets/pksx01/alpaca_bhojpuri_instruction
- Dataset de Chhath QA: https://huggingface.co/datasets/l1nk-0/bhojpuri-chhath-qa
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
