# adventists-ai/DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-1.7B

## Resumen

DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-1.7B es un conector multimodal de tipo *speech-to-decision* desarrollado por Adventists.ai. Su función no es transcribir ni generar texto libre, sino responder preguntas cerradas sobre un audio: recibe una grabación de voz y una lista de preguntas con opciones (por ejemplo, "¿el usuario ha terminado de hablar?" con las opciones "terminado" / "no terminado") y devuelve, en un único paso de *forward*, una distribución sobre las opciones. No hay decodificación autorregresiva: cada pregunta se lee como una distribución sobre un único token, lo que permite evaluar muchas preguntas por pasada.

Técnicamente combina tres piezas congeladas o casi congeladas: el codificador de Qwen3-ASR-0.6B (congelado), el LLM Qwen3-1.7B (congelado) y un proyector SwiGLU entrenable de 11,5 millones de parámetros que actúa de puente entre ambos. El total del sistema es de 1917 millones de parámetros, pero solo se entrena el conector, lo que abarata mucho el *fine-tuning* y el ajuste a dominios concretos.

Es relevante porque propone una alternativa barata y de baja latencia al pipeline clásico ASR + LLM + clasificador: en lugar de transcribir y razonar sobre el texto, el sistema decide directamente desde el audio. Además, esta variante es la versión *edge* de los conectores sobre Qwen3-32B publicados con el artículo, pensada para ejecutarse en una GPU pequeña o incluso en CPU. Su alcance es deliberadamente limitado: alineamiento de contenido, sin entrenamiento paralingüístico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conector sobre codificador de audio + LLM congelados: última capa del codificador → apilado de tramas (*frame stacking*) + proyector SwiGLU |
| Parámetros totales | 1917 M (codificador Qwen3-ASR-0.6B + LLM Qwen3-1.7B + conector) |
| Parámetros activos | No aplica (no es MoE); parámetros entrenables del conector: 11.538.176 |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (la model card indica que las NPU en dispositivo y la cuantización no se han probado) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 para los pesos del conector; los modelos base conservan sus propias licencias |
| Formato de pesos | Safetensors (librería `transformers`, con `custom_code`) |

## Arquitectura y entrenamiento

El sistema sigue el esquema Ultravox adaptado a decisiones: el codificador de Qwen3-ASR-0.6B (congelado) procesa el audio y su última capa se convierte en *tokens* de audio mediante apilado de dos tramas. El codificador opera a 12,5 Hz, por lo que tras el apilado la tasa efectiva es de 6,25 tokens de audio por segundo. Esos tokens entran en el LLM Qwen3-1.7B (también congelado) a través de un proyector SwiGLU etiquetado como variante "B", que es la única parte entrenable con 11,5 M de parámetros. La salida se lee como una distribución de un solo token sobre las opciones de cada pregunta, lo que permite evaluar varias preguntas en la misma pasada y con cero pasos de decodificación.

El entrenamiento se limita al conector y sigue la receta del artículo: destilación de transcripciones en dos fases (R1 y R2) sobre dos paquetes disjuntos de 500.000 enunciados cada uno, extraídos de la mezcla Ultravox v0.6, con 32.000 pasos por paquete y tamaño de lote global de 16. Esta variante "B" se entrenó únicamente para alineamiento de contenido: no hubo entrenamiento paralingüístico, de modo que las predicciones de género y emoción están en nivel de azar. Los scripts y el código están publicados en el repositorio de GitHub del proyecto.

## Capacidades

- Respuesta a preguntas cerradas sobre audio hablado: devuelve una distribución sobre un conjunto finito de opciones en una sola pasada, sin decodificación.
- Evaluación de múltiples preguntas por *forward pass*: la model card reporta 10 preguntas procesadas en una única pasada sobre un clip de 4,5 segundos.
- Detección de fin de turno (*turn detection*) en diálogo hablado, una de las tareas de ejemplo de la model card.
- Clasificación de intención a partir del habla (clima, medios, navegación, teléfono, charla informal en el ejemplo publicado).
- Reconocimiento de contenido multilingüe limitado a chino e inglés, con preguntas y opciones formuladas en el mismo idioma del audio.
- Inferencia sobre audio en crudo a 6,25 tokens de audio por segundo, sin etapa intermedia de transcripción a texto.
- Soporte de *tool calling*: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades de visión o audio generativo: no disponibles (la entrada es audio, la salida son etiquetas de decisión).
- Rendimiento paralingüístico (género, emoción): no fiable; el autor indica explícitamente que está en nivel de azar para género y muy bajo para emoción.

## Casos de uso

- Detección de fin de turno en asistentes de voz: el modelo responde "terminado" o "no terminado" en una sola pasada, lo que permite cerrar el turno del usuario sin esperar a una transcripción completa. Es adecuado porque la latencia por evento de decisión es de 44 ms en una H200.
- Enrutado de intención en sistemas de diálogo embebidos: se define un conjunto cerrado de intenciones y el conector devuelve la distribución directamente desde el audio, evitando el coste de un ASR más un clasificador de texto separados.
- Preprocesado de *pipelines* de ASR: usar las decisiones del conector como señal de segmentación o de filtrado previo, de modo que solo los fragmentos relevantes pasen al reconocedor completo.
- Prototipado e investigación en *speech-to-decision*: al tener solo 11,5 M de parámetros entrenables y pesos base congelados, sirve como punto de partida para *fine-tuning* propio en dominios específicos, tal y como sugiere el autor.
- Despliegue en *edge* o en servidores sin GPU: la model card reporta 2142 ms por evento de decisión en 8 hilos de CPU Xeon Platinum 8558 en fp32, lo que hace viable un prototipo funcional sin acelerador.
- Evaluación de conjuntos de audio a gran escala: al procesar 10 preguntas por pasada y no requerir decodificación, es apto para etiquetar corpus de validación con preguntas binarias o de pocas opciones.
- Control por voz de bajo consumo en robótica o domótica: preguntas cerradas del tipo "¿quiere encender el aire?" con opciones fijas, donde no se necesita comprensión abierta ni generación de lenguaje.

## Benchmarks y rendimiento

| Evaluación (%) | Protocolo del artículo | Valores por defecto de `duplexjev` 0.2.1 |
|---|---:|---:|
| qa100 (preguntas habladas) | 60 | 43 |
| qa100, Qwen3-1.7B leyendo la transcripción | 66 | – |
| ZJU-ML (preguntas habladas, real + TTS) | 36 | – |
| Género, 800 enunciados reales | 49,2 | 55,4 |
| Emoción, 4 clases, 800 enunciados | 30,5 | 28,0 |

Los conectores sobre Qwen3-32B de la misma familia alcanzan, según la model card, 90 en qa100, 89,9 en género y 90,0 en emoción. El propio autor señala que las preguntas habladas con un LLM pequeño son sensibles a la redacción del *prompt* y están acotadas por el propio LLM, tal como refleja la fila de lectura de transcripción.

Latencia de un evento de decisión (10 preguntas, un clip de 4,5 s, una pasada, `duplexjev` 0.2.1, PyTorch sin optimizar): 44 ms en una H200 en bf16; 2142 ms en 8 hilos de CPU (Xeon Platinum 8558, fp32, sin cuantizar).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3,8 GB en bf16 y 7,7 GB en fp32 para los 1917 M de parámetros del conjunto codificador + LLM + conector (cálculo aritmético a partir del recuento de parámetros, no una medición publicada). El conector entrenable por sí solo son 11,5 M de parámetros, aproximadamente 23 MB en bf16.
- GPU recomendadas: la model card solo documenta una H200 para las mediciones de latencia; no se publican recomendaciones adicionales.
- GPU de consumo: no hay datos publicados. Por tamaño de pesos, el sistema en bf16 debería caber en GPU de consumo con 8 GB o más de VRAM, pero esto no está verificado por el autor.
- CPU: viable según la medición del autor, 2142 ms por evento de decisión en 8 hilos de un Xeon Platinum 8558 en fp32 sin cuantizar.
- Opciones de despliegue: la vía documentada es el paquete `duplexjev[speech]>=0.2.1` con el objeto `Decider`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; de hecho, el modelo no usa decodificación autorregresiva, por lo que esos motores de inferencia no encajan con su modo de funcionamiento.
- Latencia y throughput: 44 ms por evento de decisión (10 preguntas, clip de 4,5 s) en una H200 en bf16; 2142 ms en el mismo escenario sobre 8 hilos de CPU. No se publica throughput agregado.
- Aceleradores en dispositivo (NPU) y cuantización: no probados según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | qa100 (%) | Género (%) | Emoción (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| DuplexJev-B Qwen3-ASR-0.6B + Qwen3-1.7B (este) | 1917 M totales, 11,5 M entrenables | No disponible | 60 (artículo) / 43 (paquete) | 49,2 / 55,4 | 30,5 / 28,0 | Apache-2.0 (conector) | HuggingFace, paquete `duplexjev` |
| Conectores DuplexJev sobre Qwen3-32B | No disponible con detalle | No disponible | 90 | 89,9 | 90,0 | No disponible | HuggingFace, organización `adventists-ai` |
| Qwen3-1.7B leyendo la transcripción | 1.700 M aprox. | No disponible | 66 | – | – | No disponible en esta ficha | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría (*speech-to-decision* de un solo token) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el autor advierte de que las etiquetas de emoción proceden de corpus actuados y que las salidas no deben usarse para tomar decisiones sobre personas. El rendimiento de género y emoción en esta variante está en nivel de azar (49,2 % en género con 800 enunciados reales en el protocolo del artículo), coherente con que no recibió entrenamiento paralingüístico.
- Riesgo de alucinación: aunque aquí no hay generación de texto libre, las distribuciones de decisión sobre conocimiento abierto son poco fiables. El propio autor indica que los LLM pequeños responden mal a preguntas de conocimiento incluso leyendo la transcripción (66 % en qa100 con Qwen3-1.7B como lector de transcripción), y recomienda usar el conector para decisiones cortas y señales del hablante, no para preguntas de conocimiento abierto.
- Sensibilidad al *prompt*: los resultados de qa100 caen de 60 a 43 según el protocolo de evaluación y la redacción de las preguntas.
- Limitaciones de contexto: no se publica la longitud de contexto del sistema. El modelo está evaluado solo con clips cortos y en modo no *streaming*.
- Limitaciones de idioma: solo chino e inglés; las preguntas y opciones deben formularse en el mismo idioma que el audio.
- Limitaciones de evaluación: los conjuntos de prueba son pequeños (entre 100 y 800 elementos), con voz leída o actuada, y no se evaluó sobre entrada en *streaming*.
- Acoplamiento estricto: el conector solo funciona con los modelos base indicados (codificador Qwen3-ASR-0.6B y Qwen3-1.7B); no es intercambiable.
- Restricciones de licencia: los pesos del conector son Apache-2.0, pero los modelos base conservan sus propias licencias. Además, parte de los corpus de entrenamiento (WenetSpeech, CoVoST 2, entre otros) tienen licencia solo para uso no comercial, por lo que hay que revisarla antes de un uso comercial.
- Sin cuantización ni despliegue en NPU verificados, y sin métricas de producción más allá de la latencia de un evento de decisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adventists-ai/DuplexJev-B-Qwen3-ASR-0.6B-Qwen3-1.7B
- Codificador congelado: https://huggingface.co/adventists-ai/Qwen3-ASR-0.6B-Encoder
- LLM base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organización del autor: https://huggingface.co/adventists-ai
- Repositorio de código: https://github.com/adventists-ai/duplexjev
- Proyecto del autor: https://github.com/adventists-ai/duplexjev
- Cita: Jin, Jie; Ma, Ziyin; Yin, Min; Chen, Jinyu; Song, Haigang; Pang, Zhikun; Zhang, Xiaowen. "Batched Speech Decisions Without Decoding: Single-Token Supervision Lets a Frozen LLM Hear Beyond the Transcript". Enviado a IEEE ICASSP, 2027.
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo en la información disponible.
