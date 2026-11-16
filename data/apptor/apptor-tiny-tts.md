# apptor/apptor-tiny-tts

## Resumen

apptor-tiny-tts es un modelo de síntesis de voz (text-to-speech) para alemán, desarrollado por el usuario apptor, que sigue la arquitectura y la receta de entrenamiento de tiny-voca (obra de n4ze3m) y se ha reentrenado desde cero para el idioma alemán. Se distribuye como un único fichero ONNX de 21 MB con 4,5 millones de parámetros, lo que lo sitúa en la categoría de modelos extremadamente ligeros pensados para inferencia en CPU sin GPU dedicada. Ofrece dos voces predefinidas, F2 (femenina) y M2 (masculina), a 24 kHz.

El modelo resuelve el problema de la síntesis de voz en entornos con recursos limitados: servidores sin acelerador, dispositivos embebidos, aplicaciones de escritorio o pipelines que necesitan generar audio en tiempo real sin depender de servicios en la nube. Según el autor, alcanza aproximadamente 40 veces el tiempo real sobre cuatro hilos de CPU, y alrededor de 20 veces si se añade la segunda etapa opcional de vocoder.

La relevancia actual del modelo radica en su licencia Apache-2.0, que permite uso comercial, y en su condición de alternativa abierta al modelo alemán Phonon, distribuido bajo CC BY-NC 4.0 (solo uso no comercial). Incluye además un vocoder Vocos opcional de 13,5 millones de parámetros (54 MB, licencia MIT) que mejora la calidad del audio eliminando buena parte del zumbido característico del generador integrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny-voca (modelo TTS ligero basado en tokens fonéticos y generador de waveform) |
| Parametros totales | 4,5 M (modelo TTS); 13,5 M adicionales en el vocoder Vocos opcional |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | máximo 512 tokens fonéticos por llamada |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | alemán (de) |
| Licencia | Apache-2.0 (modelo y código); MIT (vocoder Vocos) |
| Formato de pesos | ONNX (`apptor-tiny-tts-de.onnx`); vocoder en PyTorch (`apptor-tiny-tts-vocos-de.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la receta de tiny-voca: un front-end de texto que convierte la entrada en fonemas eSpeak NG para alemán (67 símbolos fonéticos, con normalización de números, fechas y horas) y un modelo neuronal compacto que transforma esos tokens fonéticos en audio a 24 kHz. La entrada ONNX consta de los tensores `tokens` y `stress` (int64, forma [1, N]), `voice` (int64, [1]), y los parámetros de control `speed`, `pitch_shift` y `pitch_range` (float32, [1]); la salida son `audio` (float32, [1, muestras]) y `durations`. El inventario fonético inglés de tiny-voca se sustituyó por uno alemán.

El entrenamiento se realizó sobre unas 12 horas de voz sintética en alemán (aproximadamente 15.000 enunciados) generadas con Qwen3-TTS 1.7B Base usando dos de sus voces integradas, a partir de frases de Mozilla Common Voice German (CC0), con cribado de los enunciados mediante Whisper. El modelo se entrenó durante 82.000 pasos en una única RTX 3090 (unas 10 horas). El vocoder Vocos se afinó durante unos 60.000 pasos en una RTX 5060 Ti, tomando como entrada la waveform generada por el propio modelo en modo teacher-forced y como objetivo la grabación original. El proceso completo de datos, entrenamiento y ajuste llevó aproximadamente 12,5 horas.

## Capacidades

- Síntesis de voz en alemán a 24 kHz a partir de texto, con dos voces seleccionables: F2 (femenina) y M2 (masculina).
- Control de velocidad, desplazamiento de tono (`pitch_shift`) y rango de tono (`pitch_range`) mediante parámetros de entrada.
- Normalización de números, fechas y horas en alemán (por ejemplo, "Am 3. Mai um 18:30 Uhr kostet das Ticket 12,50 Euro").
- Conversión de texto a fonemas eSpeak NG para alemán mediante el módulo `tinyvoca`.
- Segunda etapa opcional de vocoder Vocos para mejorar la calidad del audio.
- Inferencia en CPU con ONNX Runtime, sin necesidad de GPU.
- Integración como una de las voces de flash-voice mediante `services/tinytts_server.py`, con la misma API HTTP que el resto de voces del proyecto.
- No soporta tool calling, agentes, visión, audio de entrada ni modos de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio o móviles: el modelo, con 21 MB en ONNX y 4,5 M de parámetros, puede empaquetarse dentro de la propia aplicación y ejecutarse en CPU sin depender de servicios externos, generando audio a unas 40 veces el tiempo real.
- Asistentes de voz embebidos en dispositivos con recursos limitados (Raspberry Pi, mini-PC, electrónica de consumo): al no requerir GPU y caber en un fichero de 21 MB, es viable en hardware de gama baja.
- Generación de avisos y locuciones dinámicas en alemán: anuncios de transporte, sistemas de megafonía o notificaciones que combinan texto variable (fechas, precios, horas) y se benefician de la normalización de números y fechas del front-end.
- Accesibilidad y lectores de pantalla: síntesis local de contenido textual en alemán con dos voces disponibles, sin enviar el texto a servidores externos.
- Sustitución de modelos TTS con licencia no comercial: al ser Apache-2.0, sirve como alternativa al modelo alemán Phonon (CC BY-NC 4.0) en productos comerciales, según indica el propio autor.
- Integración en pipelines HTTP de síntesis de voz: a través de flash-voice (`tinytts_server.py`) se puede exponer como servicio con la misma API que otras voces, útil para prototipos y pruebas de integración.
- Generación de audio para prototipos y demos de aplicaciones en alemán: la velocidad de inferencia permite iterar rápidamente sobre textos y voces sin coste de API.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Word error rate (Whisper large-v3-turbo) | 5,0 % | 16 frases no vistas |
| Word error rate, voz F2 | 4,6 % | 16 frases no vistas |
| Word error rate, voz M2 | 5,5 % | 16 frases no vistas |
| Velocidad de inferencia (4 hilos CPU) | ~40x tiempo real | Modelo TTS sin vocoder |
| Velocidad de inferencia con Vocos (CPU) | ~20x tiempo real | Modelo TTS + vocoder |

No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo CPU; el modelo está pensado para ejecutarse en CPU con ONNX Runtime.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una RTX 3090 (modelo) y una RTX 5060 Ti (vocoder), pero la inferencia documentada es en CPU.
- Cabe en GPU de consumo: sí, por tamaño (21 MB el modelo, 54 MB el vocoder), aunque el caso de uso principal es CPU.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`), con dependencias `numpy`, `soundfile` y `num2words`; el vocoder opcional requiere `torch` y `vocos`. También disponible como servicio HTTP mediante flash-voice (`services/tinytts_server.py`).
- Requisito externo: el programa `espeak-ng` (GPL-3.0), invocado como proceso separado, para la fonemización.
- Latencia y throughput: aproximadamente 40x tiempo real en cuatro hilos de CPU sin vocoder; aproximadamente 20x tiempo real con la etapa Vocos.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto / limite | Licencia | Formato |
|---|---|---|---|---|---|
| apptor-tiny-tts | 4,5 M (+13,5 M vocoder opcional) | Alemán | 512 tokens fonéticos por llamada | Apache-2.0 (MIT vocoder) | ONNX |
| tiny-voca (n4ze3m) | no disponible en la información | Inglés (inventario fonético original) | no disponible | Apache-2.0 | no disponible |
| Phonon (alemán) | no disponible en la información | Alemán | no disponible | CC BY-NC 4.0 (solo no comercial) | no disponible |
| Qwen3-TTS 1.7B Base | 1,7 B | no disponible en la información | no disponible | Apache-2.0 | no disponible |

La comparación se limita a los datos disponibles en la información proporcionada; no se dispone de cifras de rendimiento comparativas entre estos modelos.

## Limitaciones y advertencias

- Solo admite alemán; las palabras en inglés se pronuncian con fonética alemana.
- La calidad del audio es clara pero no de estudio; sin el vocoder Vocos el sonido presenta un zumbido perceptible.
- Se ha observado que una "a" larga al final de palabra antes de una coma puede alargarse en exceso (por ejemplo, "Anna, ...").
- Las voces son sintéticas (voces integradas de Qwen3-TTS), no clones de personas reales.
- Límite de 512 tokens fonéticos por llamada; los textos más largos deben dividirse en frases.
- Requiere `espeak-ng` como proceso externo (GPL-3.0), lo que introduce una dependencia de licencia distinta a la del modelo; `num2words` es LGPL-2.1.
- El modelo no es una versión oficial de tiny-voca; es un reentrenamiento independiente del autor.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta o la prosodia anómala, no la generación de contenido falso.
- La licencia Apache-2.0 permite uso comercial del modelo y del código; el vocoder se distribuye bajo MIT. Verificar el cumplimiento de la GPL-3.0 de eSpeak NG si se redistribuye como parte del producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apptor/apptor-tiny-tts
- tiny-voca (arquitectura y receta original): https://github.com/n4ze3m/tiny-voca
- Vocos (vocoder): https://github.com/gemelo-ai/vocos
- Vocos mel 24 kHz (`charactr/vocos-mel-24khz`): https://huggingface.co/charactr/vocos-mel-24khz
- Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Mozilla Common Voice: https://commonvoice.mozilla.org
- eSpeak NG: https://github.com/espeak-ng/espeak-ng
- flash-voice: https://github.com/ViktorsGitUser/flash-voice
