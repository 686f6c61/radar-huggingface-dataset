# munzurul/speaklar_gemma-3-1b-it

## Resumen

Speaklar Gemma 3 1B IT es un ajuste fino de Gemma 3 1B Instruct publicado por el usuario munzurul en Hugging Face, orientado a conversaciones de voz en bengalí con generación fundamentada (*grounded generation*). El modelo no está pensado como asistente generalista, sino como el componente de lenguaje de un *voicebot* de atención al cliente: recibe la pregunta del usuario junto con un contexto de base de conocimiento y debe responder exclusivamente a partir de esa evidencia.

El ajuste se realizó con QLoRA sobre un conjunto de 15.000 ejemplos de comportamiento de *voicebot* en bengalí, con entradas y contextos en bengalí, inglés y *banglish*, pero con salidas siempre en bengalí. La model card declara explícitamente que la fundamentación es una responsabilidad de producto: el sistema que lo integra debe recuperar el contexto correcto, validar las salidas en flujos críticos y evaluar con tráfico real antes de desplegarlo.

Con 999.885.952 parámetros (aproximadamente 1.000 millones) y pesos en safetensors de 2,0 GB, el interés principal del modelo es su tamaño: es ejecutable en hardware de gama de consumo o incluso en CPU, lo que lo hace adecuado para despliegues de bajo coste en mercados bengalíes donde los modelos grandes multilingües resultan caros de servir por llamada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer *decoder-only* de la familia Gemma 3, variante de texto (`gemma3_text`) |
| Parámetros totales | 999.885.952 (≈1.000 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Gemma 3 1B soporta hasta 32.768 tokens |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors, sin pesos GGUF ni versiones cuantizadas |
| Idiomas soportados | bengalí (bn) e inglés (en); entradas también en *banglish*; las salidas del asistente son únicamente en bengalí |
| Licencia | no disponible (ni la model card ni los metadatos de Hugging Face la declaran) |
| Formato de pesos | safetensors (biblioteca `transformers`) |
| Pipeline | text-generation |
| Tamaño del repositorio | 2,0 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creación | 11 de septiembre de 2026 (según metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Gemma 3 1B en su variante exclusivamente de texto: un transformer *decoder-only* con atención agrupada por consultas (*grouped-query attention*) y atención de ventana deslizante en la mayoría de capas, más un pequeño subconjunto de capas con atención global. El etiquetado `gemma3_text` confirma que no se ha conservado la torre de visión que sí tienen las variantes multimodales de la familia, por lo que el modelo procesa únicamente texto. El ajuste no modifica esa arquitectura: se aplica sobre los pesos preentrenados y sobre el *tokenizer* original.

El entrenamiento consistió en un ajuste QLoRA sobre 15.000 ejemplos de comportamiento conversacional de *voicebot* en bengalí. La composición del conjunto, según la model card, incluye respuestas fundamentadas en evidencia, abstención cuando la información no está en el contexto, cálculos, captación de datos para pedidos y citas, seguridad en flujos de pago, recepción de reclamaciones y transferencia a un agente humano. No se declara el número de tokens de entrenamiento, ni el uso de RLHF, DPO u otras técnicas de alineación posteriores al ajuste supervisado, ni ninguna innovación de inferencia como decodificación especulativa. Tampoco se documenta la composición del corpus de preentrenamiento del modelo base.

## Capacidades

- Generación de texto conversacional en bengalí, con entrada y contexto aceptados en bengalí, inglés o *banglish*.
- Generación fundamentada en contexto: el modelo está entrenado para responder a partir de la evidencia proporcionada en el *prompt* en lugar de recurrir a conocimiento paramétrico.
- Abstención explícita: sabe indicar que no dispone de la información cuando esta no aparece en el contexto suministrado.
- Cálculos sencillos dentro de la conversación (importes, totales, plazos), según la descripción del conjunto de entrenamiento.
- Captación estructurada de datos para pedidos y citas (recogida de los campos esenciales a lo largo de varios turnos).
- Gestión de seguridad en pagos: pautas conservadoras ante solicitudes sensibles relacionadas con transacciones.
- Recepción de reclamaciones y transferencia a un agente humano cuando la petición queda fuera de su alcance.
- Conversación multiturno con rol de asistente telefónico y restricciones de estilo propias de un agente de voz.
- No dispone de *tool calling* ni de *function calling* documentados, ni de modo de razonamiento explícito (*thinking*), ni de capacidades de visión o audio: el audio se gestiona fuera del modelo, mediante ASR y TTS externos.

## Casos de uso

- Atención al cliente telefónica en bengalí: el modelo se coloca detrás de un pipeline de reconocimiento y síntesis de voz, recibe la transcripción más el contexto recuperado de la base de conocimiento y devuelve la respuesta que se sintetiza al usuario. Su tamaño permite servir la llamada en una sola GPU de gama media.
- Respuestas con recuperación aumentada (RAG) en dominios regulados: al estar entrenado para ceñirse al contexto y abstenerse, encaja en flujos de banca, telecomunicaciones o seguros donde una respuesta inventada tiene coste legal.
- Toma de pedidos y reserva de citas: el modelo conduce la conversación para recoger los campos necesarios (producto, cantidad, dirección, fecha) en varios turnos, con salida siempre en bengalí para el cliente.
- Verificación de pagos y prevención de errores en transacciones: ante peticiones de confirmación de pago, el modelo sigue pautas conservadoras y escala los casos dudosos a un humano, tal y como se describe en su conjunto de entrenamiento.
- Gestión de reclamaciones con escalado: recepción de la queja, recogida de datos mínimos y derivación a un agente cuando la petición excede el guion soportado.
- Asistente de voz en despliegues con presupuesto reducido: por debajo de 1.000 millones de parámetros, puede servirse en una única GPU de consumo o en CPU, lo que abarata el coste por llamada frente a modelos de 7B o superiores.
- Base para evaluación e investigación en generación fundamentada multilingüe bengalí-inglés: sirve como punto de partida reproducible para estudiar abstención y fidelidad al contexto en un idioma con poca cobertura.
- Componente de *chatbot* textual para canales de mensajería (WhatsApp, web) en bengalí, reutilizando los mismos comportamientos de intake y *handoff* sin necesidad de la capa de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y el repositorio no contiene scripts de evaluación ni resultados de pruebas sobre conjuntos como MMLU, GSM8K o HumanEval. Los resultados de búsqueda web asociados no aportan datos técnicos sobre este modelo.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: alrededor de 2 GB solo para los pesos, más caché KV y activaciones; en la práctica, unos 3-4 GB para lotes pequeños con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB de pesos. En 4 bits: aproximadamente 0,6-0,8 GB. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU de consumo: cabe en cualquier GPU con 6 GB o más (GTX 1660, RTX 2060, RTX 3060, RTX 4060, RTX 4090) incluso sin cuantizar; con 4 bits cabe en GPUs de 4 GB.
- GPU de centro de datos: A100, H100 o L40S están sobredimensionadas para este modelo, pero permiten lotes grandes y alto paralelismo en producción.
- CPU: la inferencia en CPU es viable por el tamaño del modelo, pero requeriría convertir los safetensors a GGUF, ya que el repositorio no distribuye pesos cuantizados.
- Opciones de despliegue: `transformers` con `device_map="auto"`, Text Generation Inference (la etiqueta `endpoints_compatible` indica compatibilidad con los *endpoints* de Hugging Face), vLLM para servicio con lotes, y llama.cpp u Ollama tras la conversión a GGUF.
- Latencia y *throughput*: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por turno.

## Comparativa con modelos similares

Los datos de contexto y licencia corresponden a las versiones oficiales publicadas por cada fabricante, no al ajuste fino objeto de esta ficha (cuya licencia no está declarada).

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Speaklar Gemma 3 1B IT | 999,9 M | no especificado (base: 32.768) | bn, en | no disponible | Hugging Face, 0 descargas |
| google/gemma-3-1b-it | ≈1.000 M | 32.768 tokens | multilingüe | Términos de uso de Gemma | Hugging Face, muy extendido |
| meta-llama/Llama-3.2-1B-Instruct | 1.240 M | 128.000 tokens | multilingüe (8 idiomas declarados) | Licencia comunitaria de Llama 3.2 | Hugging Face, muy extendido |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 tokens (ampliable con YaRN) | multilingüe (29 idiomas) | Apache 2.0 | Hugging Face, muy extendido |

Frente a estas alternativas, la ventaja diferencial del modelo es la especialización en flujos de *voicebot* en bengalí y en abstención fundamentada; la desventaja es la ausencia de licencia declarada, de benchmarks y de cualquier tracción de uso, frente a modelos generalistas con licencias conocidas y amplia validación comunitaria.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, el uso comercial queda en un limbo legal. Al derivar de Gemma 3, es previsible que se apliquen los Términos de uso de Gemma, pero esto no está confirmado por el autor.
- No hay resultados de benchmarks ni evaluación publicada: no existe evidencia cuantitativa de calidad, fidelidad al contexto ni tasa de alucinación.
- Repositorio sin tracción: 0 descargas y 0 *likes* en el momento de la consulta, lo que implica ausencia de validación por terceros.
- Riesgo de alucinación: aunque el modelo está entrenado para ceñirse al contexto, un modelo de 1.000 millones de parámetros puede ignorar la evidencia e inventar respuestas, especialmente con contextos largos o ambiguos.
- Dependencia crítica del sistema de recuperación: la model card subraya que la fundamentación es responsabilidad del producto. Si el contexto recuperado es incorrecto o incompleto, el modelo no puede compensarlo.
- Salidas restringidas al bengalí: aunque acepta entradas en inglés y *banglish*, no produce respuestas en inglés, lo que limita su uso en escenarios bilingües simétricos.
- Longitud de contexto no confirmada: la model card no especifica la ventana real del ajuste, por lo que no se puede asumir que aproveche los 32.768 tokens del modelo base sin degradación.
- Idiomas distintos del bengalí: el ajuste fino se centró en bengalí e inglés; otros idiomas, incluido el español, quedan fuera del alcance previsto.
- Sesgos heredados: al derivar de Gemma 3, hereda los sesgos del corpus de preentrenamiento de Google, no auditados en este ajuste.
- Sin soporte documentado de *tool calling*, agentes o visión: cualquier necesidad de ese tipo requiere añadir capas externas.
- Formato único de pesos: solo safetensors. Para despliegues en CPU o en *edge* hay que convertir a GGUF por cuenta propia, sin garantía de compatibilidad con el *tokenizer* o la plantilla de chat.
- Sin garantías de producción: no se documentan versiones, *hashes* de datos, procesos de evaluación ni política de mantenimiento del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/munzurul/speaklar_gemma-3-1b-it
- Modelo base Gemma 3 1B IT: https://huggingface.co/google/gemma-3-1b-it
- Documentación de la arquitectura Gemma 3 en Transformers: https://huggingface.co/docs/transformers/en/model_doc/gemma3
- Los resultados de búsqueda web proporcionados no contenían enlaces relevantes sobre este modelo (únicamente páginas comerciales de ChatGPT), por lo que no se dispone de paper, blog de publicación ni demo adicionales.
