# noumenon-labs/Morrow2-2B

## Resumen

Morrow V2 es un modelo de lenguaje conversacional desarrollado por Noumenon (noumenon-labs), un colectivo que se presenta como "estudiantes dispersos aficionados al aprendizaje". Se trata de un ajuste fino supervisado completo (full SFT) sobre el modelo base LFM3-1.7B de Liquid AI, con 1.728.801.536 parámetros reales según los pesos en safetensors. El objetivo declarado no es el razonamiento generalista ni el código, sino la calidad del diálogo: comprensión del prompt, sintonía emocional, utilidad cotidiana y un "tono conversacional" consistente.

La relevancia del modelo es acotada pero clara: demuestra un enfoque de *behavioral tuning* sobre una base pequeña (familia LFM3, tag `lfm3` en Hugging Face), priorizando el comportamiento conversacional sobre la capacidad bruta. La versión anterior partía de una base de 2,5B parámetros y usaba LoRA cuantizado; V2 reduce el tamaño a 1,7B pero aplica ajuste completo de pesos, lo que según el autor mejora el resultado pese al menor número de parámetros.

No obstante, la información pública es escasa: el dataset de entrenamiento es privado, no hay benchmarks estándar (MMLU, GSM8K, HumanEval) y la licencia es "other" sin texto detallado en la información disponible. Es un modelo para evaluar con cautela y validación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base LFM3-1.7B de Liquid AI); detalles internos no disponibles |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | other (texto de licencia no disponible en la informacion proporcionada) |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo se construye sobre LFM3-1.7B, la variante text-only de la familia LFM3 de Liquid AI, elegida por el autor frente a variantes con capacidades de imagen u otras especializaciones. El ajuste es un *full Supervised Fine-Tuning*: se actualizan directamente todos los pesos, a diferencia de la versión anterior de Morrow, que era un LoRA cuantizado sobre una base de 2,5B parámetros.

El dataset de entrenamiento combina, según la model card, datos de preferencia humana, conversaciones reales humano-humano y humano-IA, y datos conversacionales generados por modelos "informados por Pi y Claude". El objetivo declarado es enseñar al modelo *cómo comportarse* en lugar de *cómo hablar*, exponiéndolo a un rango amplio de respuestas válidas y evitando forzar toda interacción hacia un intercambio multi-turno. El dataset permanece privado. No se documentan detalles sobre número de tokens de entrenamiento, composición exacta, uso de RLHF/DPO ni innovaciones arquitectónicas propias (el modelo no introduce cambios estructurales respecto a la base).

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo de propósito general.
- Comprensión de prompts y "juicio conversacional" (decidir cuándo responder de forma breve, cuándo extender la conversación y cuándo no forzar multi-turno).
- Manejo de "vents" (desahogos o expresiones emocionales del usuario) y sintonía emocional, según la evaluación interna del autor.
- Tareas cotidianas y conversaciones de utilidad práctica ("everyday tasks").
- Tono y personalidad consistentes, definidos mediante *behavioral tuning*.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el autor advierte explícitamente de dificultades en razonamiento complejo.
- Capacidades multilingües: solo inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; se descartó deliberadamente una base con capacidades de imagen.

## Casos de uso

- Chatbot de acompañamiento conversacional: el modelo está afinado para mantener un tono consistente y responder a expresiones emocionales, lo que encaja en asistentes de bienestar o compañía donde la naturalidad pesa más que la precisión factual.
- Atención al cliente de baja complejidad: para consultas rutinarias y conversaciones multi-turno en inglés, siempre que se valide la precisión de las respuestas y se añada una capa de recuperación de conocimiento (RAG) para datos factuales.
- Asistente de escritura conversacional: borradores de respuestas en correo, mensajería o foros donde el registro informal y la coherencia de voz son prioritarios.
- Prototipado rápido de productos de diálogo: su tamaño (1,7B) permite iterar y desplegar en hardware modesto, útil para validar flujos conversacionales antes de escalar a modelos mayores.
- Moderación o simulación de conversaciones: generación de diálogos sintéticos con un estilo controlado para pruebas de UX o datasets de evaluación conversacional.
- Investigación en *behavioral tuning*: caso de estudio de ajuste de comportamiento sobre bases pequeñas, útil para comparar SFT completo frente a LoRA en modelos de menos de 2B.
- Asistente de voz (con capa TTS/STT externa): respuestas cortas y naturales en inglés para interfaces habladas de dominio acotado.

## Benchmarks y rendimiento

El autor publica únicamente una evaluación conversacional interna puntuada de 1 a 5, sin detallar metodología ni conjunto de evaluación:

| Metrica (evaluacion interna) | Version anterior | Morrow V2 |
|---|---:|---:|
| Comprension de prompts | 2,8 | 3,6 |
| Sintonía emocional | 3,0 | 3,7 |
| Utilidad | 3,1 | 3,8 |
| Juicio conversacional | 2,7 | 3,6 |
| Naturalidad | 3,4 | 3,6 |
| **Global** | **2,88** | **3,66** |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos (1,73B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, alrededor de 4-6 GB según longitud de contexto y batch.
- En cuantización de 8 bits: en torno a 1,8-2,5 GB de pesos; en 4 bits, alrededor de 1-1,5 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 3070/4070) para FP16 con contexto moderado; A100/H100 no son necesarias para este tamaño, salvo despliegues de alto throughput.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs con 6-8 GB o más en FP16, y en GPUs con 4 GB o menos si se cuantiza.
- Opciones de despliegue: al usar `custom_code` y safetensors, requiere `transformers` con `trust_remote_code=True`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible, y la ausencia de pesos GGUF publicados limita el uso directo en llama.cpp/Ollama sin conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Morrow2-2B | 1,73B | no disponible | Dialogo conversacional (SFT completo sobre LFM3-1.7B) | other | Hugging Face, safetensors con custom_code |
| LFM3-1.7B (Liquid AI) | ~1,7B | no disponible | Modelo base generalista text-only | no disponible | Hugging Face (base de Morrow V2) |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8K (segun su model card publica) | Generalista, instrucciones | Apache 2.0 | Hugging Face, GGUF ampliamente disponible |
| Qwen2.5-1.5B (Alibaba) | 1,5B | 32K (segun su model card publica) | Generalista, multilingue | Apache 2.0 | Hugging Face, ecosistema amplio (GGUF, vLLM) |

La comparación con LFM3-1.7B es la más directa: Morrow V2 es un ajuste conversacional del mismo. Frente a SmolLM2-1.7B y Qwen2.5-1.5B, Morrow V2 prioriza el comportamiento dialógico sobre capacidades generales, pero carece de benchmarks estándar, de contexto documentado y de un ecosistema de cuantizaciones, lo que dificulta una comparación objetiva de rendimiento.

## Limitaciones y advertencias

- El propio autor advierte de dificultades en razonamiento complejo, tareas de contexto largo, recuperación factual y conocimiento más allá del entrenamiento.
- Riesgo de alucinación relevante: al ser un modelo pequeño y orientado a conversación, no debe usarse como fuente de verdad sin verificación externa.
- Solo inglés: no hay soporte multilingüe declarado.
- Longitud de contexto no documentada: limita la planificación de aplicaciones con documentos largos o historiales extensos.
- Dataset de entrenamiento privado: imposibilita auditar sesgos, composición o posibles contaminaciones; no se documentan sesgos conocidos.
- Licencia "other" sin texto disponible en la información proporcionada: es imprescindible revisar los términos completos antes de cualquier uso comercial.
- Requiere `trust_remote_code` por el uso de `custom_code`, lo que implica ejecutar código del repositorio del autor; conviene auditar dicho código en entornos de producción.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni soporte confirmado en motores de inferencia populares: el despliegue eficiente exige trabajo adicional.
- Las métricas publicadas son una evaluación interna del autor sin metodología detallada; no son comparables con benchmarks estándar.
- Modelo con muy poca tracción (430 descargas, 1 like en el momento de la consulta): ecosistema y soporte comunitario mínimos.

## Enlaces

- Hugging Face: https://huggingface.co/noumenon-labs/Morrow2-2B
- Modelo base LFM3 (Liquid AI): no disponible en la información proporcionada (referenciado en la model card como "LFM3-1.7B")
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada.
