# danielrosehill/Hey-Yossi-Stop-Word-microWakeWord

## Resumen

Hey Yossi Stop Word es un modelo de detección de palabra de parada (stop word) basado en microWakeWord, desarrollado por Daniel Rosehill para el asistente de voz "Hey Yossi". Su función concreta es reconocer la frase "Go to sleep, Yossi" mientras el asistente está reproduciendo una respuesta, un temporizador o un anuncio, y detener la reproducción al detectarla. Se integra como `--stop-model go_to_sleep_yossi` en Linux Voice Assistant y encaja en el ecosistema de Home Assistant, ESPHome y Linux Voice Assistant.

El modelo no es un LLM ni un transformer generativo: es un clasificador de audio en streaming de tipo mixednet, entrenado con la receta ligera de microWakeWord en 10.000 pasos sobre una GPU Modal T4. Se distribuye como un archivo TensorFlow Lite cuantizado (`go_to_sleep_yossi.tflite`) acompañado de un manifiesto JSON con umbral de corte 0,97 y ventana 5.

Su relevancia es práctica y acotada: resuelve el problema de interrumpir la reproducción de voz en asistentes domésticos locales sin depender de la nube. Es un modelo de un solo hablante (Daniel) en su versión v1, con un tamaño de repositorio de 0,0 GB (archivos de pocos cientos de kilobytes), lo que lo hace apto para dispositivos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mixednet (microWakeWord, receta ligera, commit `4665173`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de audio en streaming; ventana de detección 5) |
| Tipos de cuantizacion | modelo TFLite cuantizado (streaming); no se detallan los esquemas exactos |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | TFLite (`.tflite`) con manifiesto JSON (`.json`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura mixednet de microWakeWord en su variante ligera, entrenada durante 10.000 pasos en una GPU Modal T4 (fecha de entrenamiento: 2026-11-22). El resultado es un detector de palabra clave en streaming, cuantizado para TFLite, pensado para ejecutarse de forma continua con un coste computacional mínimo.

Los datos de entrenamiento proceden de dos conjuntos del propio autor. Como positivos se usaron 69 tomas reales de "Go to sleep, Yossi" del dataset `danielrosehill/Hey-Yossi-Stop-Word` (revisión `8a3dc33`), cada una aumentada 50 veces, sin síntesis de voz (TTS). Como negativos se emplearon 40 tomas de frases casi idénticas (near-miss), 273 tomas de "Hey Yossi" del dataset `danielrosehill/Wake-Words` (revisión `c0ee33c`) para que el modelo permanezca silencioso ante la palabra de activación, y los conjuntos `speech`, `dinner_party` y `no_speech` de kahrendt. El modelo está entrenado únicamente con la voz de Daniel; las tomas de Hannah están previstas para una versión posterior.

## Capacidades

- Detección de la frase de parada "Go to sleep, Yossi" en audio en streaming.
- Discriminación frente a la palabra de activación "Hey Yossi": no se activa con ella.
- Funcionamiento con umbral de corte 0,97 y ventana de 5, configurable mediante el manifiesto JSON.
- Integración como stop model en Linux Voice Assistant (`--stop-model go_to_sleep_yossi` o variable de entorno `STOP_MODEL`).
- Activación condicionada: se arma únicamente mientras hay reproducción de una respuesta, un temporizador sonando o un anuncio en curso.
- Diseñado para ejecución local en dispositivos de bajos recursos (TFLite cuantizado en streaming).
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio generativo ni capacidades multilingües más allá del inglés.

## Casos de uso

- Interrupción de respuestas del asistente: mientras el asistente reproduce una respuesta larga, el modelo escucha en paralelo y detiene la reproducción al oír "Go to sleep, Yossi", evitando tener que esperar al final o usar botones físicos.
- Silenciado de temporizadores: cuando suena un temporizador en Home Assistant, el usuario puede detenerlo por voz con la frase de parada sin tocar el dispositivo.
- Cancelación de anuncios y notificaciones: en instalaciones domésticas con anuncios programados (por ejemplo, recordatorios), el modelo permite abortar la reproducción desde cualquier punto de la habitación.
- Asistentes de voz locales en ESPHome: al ser un TFLite cuantizado y en streaming, puede desplegarse en dispositivos con microcontroladores o SBC de bajos recursos que ejecutan Linux Voice Assistant.
- Automatizaciones de hogar con privacidad: al ejecutarse íntegramente en local, permite gestionar la interacción por voz sin enviar audio a servicios en la nube, adecuado para entornos sensibles a la privacidad.
- Control de reproducción en altavoces domésticos: integrado en un pipeline de audio local, actúa como capa de control de parada para cualquier reproducción gestionada por el asistente (música, podcasts, respuestas TTS).

## Benchmarks y rendimiento

Evaluación sobre el conjunto de test reservado, con umbral de corte 0,97 y ventana 5:

| Conjunto | n | Resultado |
|---|---|---|
| "Go to sleep, Yossi" | 15 | recall 0,933 (una toma con tono molesto no detectada, score 0,52) |
| "Hey Yossi" (palabra de activación) | 55 | 0 falsos positivos (score máximo 0,44) |
| Frases casi idénticas (near-miss) | 5 | 3 activaciones: "Go to sleep, Josie" (×2) y "Go to sleep, Yoni"; "Time to sleep, Yossi" puntúa 0,93 |
| Ambiente (`dinner_party_eval`) | ~5,3 h | 0,19 falsos positivos por hora |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el formato (TFLite cuantizado en streaming) el modelo está pensado para ejecución en CPU y dispositivos embebidos, sin requisito de GPU.
- GPU recomendadas: no aplica para inferencia; el entrenamiento se realizó en una GPU Modal T4.
- Cabe en hardware de consumo y en microcontroladores/SBC compatibles con TFLite y microWakeWord (por ejemplo, dispositivos con ESPHome o Linux Voice Assistant).
- Opciones de despliegue: microWakeWord runtime, Linux Voice Assistant (`--stop-model go_to_sleep_yossi`), ESPHome y Home Assistant.
- Latencia y throughput: no disponible; el diseño en streaming con ventana 5 y umbral 0,97 implica una latencia de detección acorde a esa ventana, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Licencia | Contexto/ventana | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|---|
| Hey Yossi Stop Word (este modelo) | Detector de stop word (mixednet, TFLite) | en | cc-by-4.0 | ventana 5, umbral 0,97 | recall 0,933; 0 falsos positivos en wake word; 0,19 FA/h en ambiente | Hugging Face |
| microWakeWord (modelos de referencia de kahrendt) | Detector de wake word (mixednet) | en | según modelo | según modelo | no disponible en esta ficha | Hugging Face / repositorio de kahrendt |
| Porcupine (Picovoice) | Detector de wake word comercial | multiidioma | comercial | configurable | no disponible | SDK comercial |
| openWakeWord | Detector de wake word open source | en | según modelo | configurable | no disponible | open source |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con un único hablante (Daniel); el rendimiento con otras voces, incluida la de Hannah, no está validado en esta versión.
- Confunde nombres similares a Yossi: detecta "Go to sleep, Josie" y "Go to sleep, Yoni" como la frase de parada.
- "Time to sleep, Yossi" obtiene una puntuación de 0,93, por debajo del umbral de 0,97, por lo que no se activa; variantes léxicas de la frase no están cubiertas.
- Una toma con tono molesto no fue detectada (score 0,52), lo que sugiere sensibilidad al estilo de pronunciación.
- Tasa de falsos positivos de 0,19 por hora en audio ambiente; aceptable para un stop word que solo escucha durante la reproducción, pero no despreciable en escucha continua.
- Solo soporta inglés; no hay capacidades multilingües.
- Licencia cc-by-4.0: permite uso comercial con atribución; conviene revisar los términos exactos de la licencia para la distribución de derivados.
- Modelo de nicho para el asistente Hey Yossi; su utilidad fuera de ese ecosistema es limitada.
- Sin datos publicados de latencia, throughput ni parámetros totales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielrosehill/Hey-Yossi-Stop-Word-microWakeWord
- Dataset de stop word: https://huggingface.co/datasets/danielrosehill/Hey-Yossi-Stop-Word
- Dataset de wake words: https://huggingface.co/datasets/danielrosehill/Wake-Words
- Repositorio microWakeWord de kahrendt (receta y commit `4665173`): https://github.com/kahrendt/microWakeWord
- Linux Voice Assistant: no disponible en la información proporcionada
- ESPHome: no disponible en la información proporcionada
- Home Assistant: no disponible en la información proporcionada
