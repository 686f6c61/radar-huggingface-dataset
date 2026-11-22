# s1nju/livekit-darija-commands-onnx

## Resumen

`livekit-darija-commands-onnx` es un conjunto de 13 modelos ONNX de detección de comandos de voz (keyword spotting) para dariya argelina (الدارجة الجزائرية), publicados por el usuario s1nju. Cada modelo corresponde a una intención concreta (encender la luz, abrir el navegador, subir el volumen, etc.) y está construido sobre el encoder de LiveKit Conformer v2.0.0. No se trata de un modelo generativo ni de un LLM, sino de una familia de clasificadores binarios de audio en streaming.

La relevancia del artefacto es doble. Por un lado, cubre un idioma de bajos recursos (dariya argelina, código `arq`) para el que existen muy pocos recursos de voz públicos. Por otro, su diseño es explícitamente de streaming con estado: procesa tramas de 80 ms (1280 muestras a 16 kHz mono) y conserva tensores de estado internos entre fragmentos consecutivos, lo que permite integrarlo en pipelines de voz en tiempo real como LiveKit sin necesidad de segmentar manualmente el audio.

El repositorio ocupa unos 0,1 GB y se distribuye con licencia Apache 2.0. La model card declara un recall medio final de aproximadamente el 90 % y una tasa de rechazo de fondo superior al 99 %, con un coste de CPU de unos 16 ms por segundo de audio. No se publican detalles sobre el dataset de entrenamiento, el número de parámetros ni la longitud de contexto en el sentido de los LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LiveKit Conformer Encoder v2.0.0 (encoder convolucional + atención, con estado de streaming) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa tramas de 80 ms / 1280 muestras a 16 kHz con estado persistente) |
| Tipos de cuantizacion | no disponible (pesos ya exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | ar (árabe), arq (dariya argelina) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (13 ficheros `.onnx`, uno por intención) |

## Arquitectura y entrenamiento

Cada uno de los 13 ficheros es un modelo independiente que envuelve el encoder Conformer de LiveKit v2.0.0 y añade una cabeza de clasificación para una intención concreta. El encoder combina bloques convolucionales (captura de patrones locales en el espectrograma) con bloques de auto-atención (captura de dependencias temporales más largas), un esquema habitual en reconocimiento de voz. La particularidad es el modo *stateful streaming*: el modelo mantiene tensores de estado (cachés de atención y estados convolucionales) entre llamadas, de modo que cada `predict()` recibe 1280 muestras y devuelve una puntuación, sin necesidad de reenviar todo el histórico de audio.

El entrenamiento se realizó mediante *fine-tuning* de cada comando usando los otros 12 conjuntos de comandos como negativos duros (*cross-adversarial negative sampling*), una técnica que fuerza al modelo a discriminar entre frases acústicamente próximas y reduce las activaciones cruzadas. La model card reporta un recall medio final de ~90 % y un rechazo de fondo >99 %, pero no especifica el volumen de datos, la composición del dataset, la duración total de audio ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco se documenta el proceso de exportación a ONNX ni las herramientas de conversión empleadas.

## Capacidades

- Detección de 13 comandos de voz concretos en dariya argelina: cerrar aplicación, consultar la hora, encender/apagar la luz, silenciar audio, abrir navegador, abrir terminal, abrir YouTube, parar/cancelar, hacer captura de pantalla, activar visión artificial, subir y bajar volumen.
- Inferencia en streaming con estado: procesa tramas de 80 ms y conserva el estado entre fragmentos, lo que evita cortes y permite latencia baja.
- Ejecución en CPU: la model card declara ~16 ms de CPU por segundo de audio, lo que hace viable el despliegue sin GPU.
- Detección multi-comando en paralelo: la clase `MultiCommandLiveKitDetector` evalúa las 13 intenciones sobre la misma trama y devuelve un diccionario de puntuaciones.
- Rechazo de fondo: entrenado para no activarse con audio que no corresponde a ninguno de los comandos.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni tool calling; es exclusivamente un clasificador de audio.

## Casos de uso

- Asistente de voz local en escritorio: integrar los 13 detectores en un daemon que escuche el micrófono y ejecute acciones del sistema (abrir terminal, capturar pantalla, silenciar audio) sin enviar audio a la nube, gracias a la ejecución en CPU y al formato ONNX.
- Control por voz en aplicaciones LiveKit: usar los modelos como etapa de *wake-word* y comandos dentro de una sala de LiveKit, aprovechando que el encoder es el mismo que emplea LiveKit para otras tareas de audio.
- Domótica de bajo coste: desplegar los detectores `light_on` y `light_off` en una Raspberry Pi o mini-PC para controlar luces por voz en dariya, sin depender de servicios cloud.
- Accesibilidad para usuarios argelinos: ofrecer control por voz del entorno informático a personas con movilidad reducida que hablan dariya, un idioma con escasa cobertura en asistentes comerciales.
- Activación de visión artificial: usar `vision_capture` ("wach rak tchouf") como disparador para invocar un modelo de visión que describa lo que ve la cámara, encadenando el detector con un VLM.
- Automatización de escritorio y productividad: mapear `open_browser`, `open_youtube` y `take_screenshot` a atajos de teclado o scripts, permitiendo flujos de trabajo manos libres.
- Investigación en keyword spotting multilingüe: servir como conjunto de referencia para evaluar técnicas de negativos adversariales en idiomas de bajos recursos.

## Benchmarks y rendimiento

La model card solo proporciona métricas agregadas de entrenamiento, no resultados sobre un conjunto de test independiente ni comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| Recall medio final | ~90 % |
| Rechazo de fondo medio | >99 % |
| Coste de CPU | ~16 ms por segundo de audio |
| Tamano de trama | 1280 muestras (80 ms a 16 kHz mono) |

No se han publicado resultados de benchmarks estandarizados (ni sobre conjuntos de keyword spotting públicos) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; los modelos están pensados para ejecución en CPU con ONNX Runtime.
- GPU recomendadas: no disponibles; no se documenta soporte CUDA ni TensorRT.
- GPU de consumo: irrelevante para el caso de uso previsto; el despliegue objetivo es CPU.
- Memoria RAM: no disponible; el repositorio completo ocupa ~0,1 GB, por lo que la huella por modelo es reducida.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`), con las clases auxiliares `StatefulLiveKitCommandDetector` y `MultiCommandLiveKitDetector` del repositorio; integración con LiveKit Agents.
- Latencia y throughput: ~16 ms de CPU por segundo de audio según la model card; la latencia por trama de 80 ms no se desglosa.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| s1nju/livekit-darija-commands-onnx | Keyword spotting (13 clasificadores ONNX) | ar, arq | no disponible | tramas de 80 ms con estado | Apache 2.0 | Hugging Face |
| LiveKit Conformer v2.0.0 (base) | Encoder de audio | no disponible | no disponible | streaming | no disponible | LiveKit |
| Porcupine (Picovoice) | Wake-word / keyword spotting | múltiples, sin dariya documentada | no disponible | streaming | propietaria (free tier) | SDK comercial |
| openWakeWord | Wake-word | inglés principalmente | no disponible | streaming | Apache 2.0 | GitHub / pip |

La comparativa es aproximada: no existen, en la información disponible, modelos públicos de keyword spotting para dariya argelina con los que contrastar métricas. Las alternativas comerciales y open source citadas cubren principalmente inglés y no ofrecen comandos específicos en `arq`.

## Limitaciones y advertencias

- Cobertura lingüística restringida: solo reconoce las 13 frases semilla documentadas; variaciones dialectales, de pronunciación o de género no están cubiertas y pueden degradar el recall.
- Métricas sin validación independiente: el ~90 % de recall y el >99 % de rechazo proceden de la model card del autor, sin conjunto de test público ni protocolo detallado.
- Sin datos de entrenamiento: se desconoce el volumen, la procedencia y la diversidad de hablantes del dataset, lo que impide evaluar sesgos de género, edad o acento.
- Riesgo de falsos positivos en entornos ruidosos: el rechazo de fondo se midió en condiciones no especificadas; en audio con ruido, música o conversación solapada el comportamiento es incierto.
- Un modelo por intención: ejecutar las 13 intenciones en paralelo multiplica el coste de CPU; no se documenta el rendimiento agregado de `MultiCommandLiveKitDetector`.
- Sin soporte de GPU ni cuantizaciones alternativas documentadas: el despliegue está atado a ONNX Runtime en CPU.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene auditar los pesos antes de usarlos en producción.
- Fecha de creación futura en los metadatos (2026-11-22): conviene verificar la integridad y procedencia del repositorio antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s1nju/livekit-darija-commands-onnx
- LiveKit Conformer (arquitectura base): https://github.com/livekit/agents
- ONNX Runtime: https://onnxruntime.ai/
- LiveKit Agents (integración de voz en tiempo real): https://docs.livekit.io/agents/
