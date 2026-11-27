# convaiinnovations/laya-multilingual

## Resumen

Laya Multilingual es un modelo de clasificación y decisión no autorregresivo desarrollado por ConvAI Innovations (publicado bajo el identificador `convaiinnovations/laya-multilingual`). A diferencia de los modelos generativos, no produce texto: recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas acompañadas de probabilidades calibradas en un único pase hacia delante. Esto elimina la necesidad de parsear la salida y reduce drásticamente el riesgo de alucinación, ya que el modelo nunca genera contenido libre.

El checkpoint emplea un encoder mmBERT-base con 321.908.998 parámetros totales y está pensado para cualquier uso que no sea exclusivamente en inglés. Cubre más de 100 idiomas y, según la model card, es aproximadamente el doble de rápido que la variante inglesa basada en ModernBERT-large. Forma parte de la familia Laya, que incluye el checkpoint inglés (`convaiinnovations/laya`) y la variante orientada a flujos de decisiones tipadas (`convaiinnovations/laya-typed-decisions`).

Su relevancia actual radica en el enfoque de "System 1": un motor de decisión pequeño montado sobre un lector congelado, con coste constante y comportamiento determinista. Incorpora mecanismos de abstención calibrada, conjuntos conformales y detección de entradas fuera de distribución, lo que lo hace adecuado para guardrails, enrutamiento y moderación en producción multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder no autorregresivo (mmBERT-base) con motor de decisión calibrado |
| Parametros totales | 321.908.998 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 con `max_len=8192` (la model card menciona 73.728 tokens en la versión 0.5 del paquete) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 100 idiomas: en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv |
| Licencia | Apache 2.0 (pesos y paquete `laya`); el paquete `vegaml-learn` es PolyForm Noncommercial 1.0.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre un encoder mmBERT-base y sigue un paradigma no autorregresivo: no decodifica tokens, sino que proyecta la entrada en un espacio de decisión donde cada respuesta candidata constituye un "valle". La entrada actúa como una partícula que rueda y se asienta en uno de esos valles; la profundidad del asentamiento determina la probabilidad asignada a la respuesta. Este diseño, descrito en el preprint "From Laya to Vega: Open Non-Autoregressive Decision Models with Calibrated Probabilities", produce un coste computacional constante e independiente del número de tokens generados, ya que no hay generación.

La model card menciona que el motor de decisión se monta sobre un lector congelado (cualquier LLM entre 0,8B y 27B puede actuar como lector) y que el sistema incorpora calibración de umbrales para mantener la tasa de error por debajo del riesgo configurado (10 % por defecto). No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La versión 0.5 del paquete añade soporte para imágenes, audio y vídeo, y un mecanismo de aprendizaje continuo mediante el paquete separado `vegaml-learn`.

## Capacidades

- Clasificación y decisión tipada: devuelve respuestas tipadas con probabilidades en un solo pase, sin generar texto libre.
- Abstención calibrada (`abstain`): declina comprometerse cuando el riesgo de error supera el umbral configurado.
- Conjuntos conformales (`prediction_set`): indica todas las opciones plausibles con un nivel alfa de 0,10, señalando ambigüedad real cuando hay más de una.
- Detección de fuera de distribución (`unbound`): marca entradas que no se parecen a lo visto en entrenamiento, aunque la model card advierte que también se activó en el 71 % de filas normales de banking77.
- Enrutamiento (`route`): decide entre `auto` y `review` según la confianza.
- Multilingüe: más de 100 idiomas, con cobertura destacada de lenguas europeas, asiáticas, de Oriente Medio y africanas.
- Procesamiento de documentos largos: hasta 8.192 tokens con `max_len=8192`, con precisión variable según la longitud (16-18 de 20 aciertos hasta ~4.000 tokens; 8-17 de 20 más allá).
- Multimodalidad (versión 0.5 del paquete): acepta `image=`, `audio=` y `video=` con el mismo formato de respuesta tipada.
- Aprendizaje continuo: mediante `laya.Learner` del paquete `vegaml-learn` (licencia no comercial), aprende de respuestas confirmadas por el equipo en segundos sobre CPU.
- Integración con LLMs como lectores: permite usar un modelo congelado de 0,8B a 27B como lector subyacente.

## Casos de uso

- Guardrails y moderación multilingüe: clasificar mensajes de usuario en más de 100 idiomas como seguros, sospechosos o violatorios, con abstención calibrada para derivar casos dudosos a revisión humana y evitar falsos positivos en producción.
- Enrutamiento de tickets de soporte: dado un ticket en cualquier idioma, decidir si va a facturación, soporte técnico o ventas, usando `route` para separar los casos claros de los ambiguos y reducir la carga de triaje manual.
- Clasificación de correo entrante: etiquetar correos como spam, phishing, consulta comercial o incidencia, aprovechando la ventana de 8.192 tokens para correos largos con hilos de conversación completos.
- Verificación de cumplimiento en contratos: leer documentos de hasta 8.192 tokens y responder preguntas tipadas sobre cláusulas, plazos o partes implicadas, con `prediction_set` para señalar ambigüedad cuando el texto no es concluyente.
- Análisis de reseñas y encuestas: extraer sentimiento, intención de compra o motivo de insatisfacción de reseñas en múltiples idiomas, con probabilidades calibradas que permiten umbralizar la confianza antes de actuar.
- Detección de intención en asistentes conversacionales: clasificar la intención del turno del usuario en un diálogo multi-turno y decidir si el bot responde o escala a un agente humano, usando `abstain` para los casos fuera de distribución.
- Moderación de contenido en plataformas: filtrar comentarios, publicaciones o mensajes directos en decenas de idiomas con un coste computacional constante y determinista, adecuado para volúmenes altos en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta datos de precisión en documentos largos (16-18 de 20 aciertos con hasta ~4.000 tokens; 8-17 de 20 más allá) y una latencia aproximada de 1,7 s para una entrada de 4.000 tokens en una GPU de Apple.

## Requisitos de hardware

- VRAM estimada para inferencia: con 322M parámetros en precisión FP16, aproximadamente 0,65 GB de pesos; en FP32, unos 1,3 GB. El repo ocupa 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100 y RTX 4090 son sobredimensionadas para este modelo. Funciona en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM; también puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (librería nativa), paquete `laya` (`pip install laya`), y el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. La model card menciona despliegue en Azure (`deploy:azure`). No se detalla soporte explícito de vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: aproximadamente 1,7 s para una entrada de 4.000 tokens en GPU de Apple; entradas cortas son más rápidas y el coste sigue la longitud real de la entrada, no el límite configurado. No se dispone de cifras de throughput para GPU dedicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| convaiinnovations/laya-multilingual | 322M | 1.024 (hasta 8.192) | 100+ | Apache 2.0 | Decisión no autorregresiva multilingüe |
| convaiinnovations/laya | 421M | 512 | Inglés | Apache 2.0 | Decisión no autorregresiva (ModernBERT-large) |
| convaiinnovations/laya-typed-decisions | 421M | 1.024 | No disponible | Apache 2.0 | Flujos de decisiones tipadas |

No se dispone de información sobre benchmarks comparativos con modelos de clasificación convencionales (por ejemplo, XLM-RoBERTa o mBERT) en la información proporcionada, por lo que la comparación se limita a la propia familia Laya.

## Limitaciones y advertencias

- Riesgo de alucinación bajo por diseño (no genera texto), pero las respuestas tipadas pueden ser incorrectas si la pregunta o el estado no encajan con la distribución de entrenamiento.
- El flag `unbound` se activó en el 71 % de filas normales de banking77 según la propia model card, por lo que no debe usarse como único criterio de derivación a revisión.
- La precisión en documentos largos decae más allá de ~4.000 tokens (8-17 de 20 aciertos), por lo que conviene validar el rendimiento en datos propios antes de desplegar con `max_len=8192`.
- El límite por defecto de 1.024 tokens trunca documentos largos si no se configura `max_len=8192` explícitamente.
- La licencia Apache 2.0 cubre los pesos y el paquete `laya`, pero el aprendizaje continuo (`laya.Learner`, `laya.Escalator`, `laya.vllm_teacher`) requiere `vegaml-learn`, con licencia PolyForm Noncommercial 1.0.0: su uso en empresa, producto o servicio de pago exige licencia comercial.
- No se detallan sesgos conocidos ni composición del dataset de entrenamiento en la información disponible.
- La cobertura de 100+ idiomas no garantiza calidad uniforme; conviene evaluar por idioma antes de producción.
- El modelo no es un generador de texto: no sirve para tareas de resumen, traducción o generación creativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/convaiinnovations/laya-multilingual
- Modelo inglés de la familia: https://huggingface.co/convaiinnovations/laya
- Modelo de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Preprint: https://doi.org/10.20944/preprints202611.0781.v1
- Repositorio GitHub del proyecto: https://github.com/NandhaKishorM/laya
- Repositorio GitHub de vegaml: https://github.com/NandhaKishorM/vegaml
- Licencia comercial: https://embedding.in/licence
