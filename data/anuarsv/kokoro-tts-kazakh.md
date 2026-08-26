# AnuarSv/kokoro-tts-kazakh

## Resumen

Kokoro TTS Kazakh (`km_m1`) es una voz de síntesis de habla en kazajo de un solo hablante, desarrollada por Nuraidar Mambetaly y Altair Balakhazy mediante fine-tuning del modelo base [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) sobre el corpus [ISSAI KazakhTTS2](https://github.com/IS2AI/Kazakh_TTS). El entrenamiento utiliza un pipeline basado en StyleTTS2 (el framework [kikiri-tts](https://github.com/semidark/kikiri-tts)), con fonemización IPA mediante espeak-ng y la librería misaki. El modelo tiene 82 millones de parámetros, lo que lo hace ligero y rápido: la síntesis se ejecuta en tiempo real en una CPU convencional sin necesidad de GPU.

La relevancia de este checkpoint radica en que cubre un idioma de bajos recursos como el kazajo, ofreciendo una voz masculina de calidad aceptable (WER del 16,4% en un conjunto de validación) y con una licencia Apache 2.0 que permite uso comercial. El autor documenta además un proceso de selección riguroso de checkpoints, descartando candidatos con colapso del codificador de estilo, lo que garantiza que el modelo publicado es estable y coherente con el decodificador incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (basada en StyleTTS2, con decodificador y predictor de estilo) |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no es un parametro tipico en TTS; la duracion maxima de audio no se especifica) |
| Tipos de cuantizacion | No disponible (no se mencionan cuantizaciones; el checkpoint se distribuye en precision completa) |
| Idiomas soportados | Kazajo (`kk`) |
| Licencia | Apache 2.0 (heredada de Kokoro-82M y kikiri-tts) |
| Formato de pesos | PyTorch (`.pth` para el modelo, `.pt` para el voicepack) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Kokoro-82M, un sistema de síntesis de habla de 82 millones de parámetros que combina un decodificador acústico con un predictor de estilo, siguiendo el enfoque de StyleTTS2. El fine-tuning se realizó sobre el corpus ISSAI KazakhTTS2, que contiene 269,9 horas de audio de 5 hablantes; para la voz `km_m1` se utilizaron 102,8 horas distribuidas en 48.154 clips. El entrenamiento se llevó a cabo con el framework kikiri-tts, que implementa dos etapas: una primera de entrenamiento acústico y una segunda con pérdidas adversariales y de similitud de lenguaje (SLM), activadas a partir de la época 2 (`joint_epoch=2`) para evitar el colapso del codificador de estilo. Se usó un batch size de 12, optimizador AdamW (betas=0.0/0.99, eps=1e-9, weight_decay=1e-4), learning rate de 1e-4 para el modelo acústico y 1e-5 para PL-BERT, y 5 épocas en cada etapa. El audio se muestrea a 24 kHz con 80 bandas mel. El tiempo total de entrenamiento fue de aproximadamente 52 horas (13 h en Stage 1 y 38,6 h en Stage 2). La fonemización se realiza con espeak-ng a través de misaki, produciendo transcripciones IPA.

## Capacidades

- Síntesis de voz en kazajo para un único hablante masculino (`km_m1`).
- Generación de audio a 24 kHz con calidad inteligible (WER del 16,4% en validación).
- Inferencia en tiempo real en CPU, sin necesidad de GPU.
- Control de velocidad de habla mediante el parámetro `speed` (por defecto 1.0).
- Fonemización automática de texto kazajo mediante espeak-ng/misaki.
- Compatible con el ecosistema Kokoro: se integra con `KModel` de la librería `kokoro` y con el framework de inferencia de kikiri-tts.
- No incluye capacidades de visión, tool calling ni razonamiento multimodal; es exclusivamente un modelo de síntesis de habla.

## Casos de uso

- Audiolibros y narración de contenido en kazajo: el modelo puede convertir texto largo en audio natural, aprovechando su baja latencia en CPU para procesar capítulos completos sin infraestructura especializada.
- Asistentes de voz para aplicaciones móviles o web en kazajo: al ser ligero (82M parámetros), puede integrarse en dispositivos con recursos limitados, ofreciendo respuestas habladas en tiempo real.
- Accesibilidad para personas con discapacidad visual: lectores de pantalla que necesiten voz en kazajo pueden usar este modelo como motor TTS, con la ventaja de funcionar sin GPU.
- Educación y aprendizaje de idiomas: generación de ejemplos de pronunciación para estudiantes de kazajo, con control de velocidad para facilitar la comprensión.
- Sistemas de información pública (estaciones, aeropuertos, transporte): anuncios automatizados en kazajo con una voz masculina clara, desplegables en hardware de bajo coste.
- Prototipado rápido de aplicaciones TTS: al ser un checkpoint pequeño y con licencia Apache 2.0, los desarrolladores pueden experimentar e integrar la voz en productos comerciales sin costes de licencia.

## Benchmarks y rendimiento

El autor evaluó la calidad del modelo mediante word error rate (WER) sobre 20 frases de validación no vistas durante el entrenamiento, utilizando un ASR Whisper afinado para kazajo y la métrica `jiwer`:

| Voicepack | WER sobre conjunto held-out | Veredicto |
|---|---|---|
| `final` (este release) | 16,4% | Habla limpia e inteligible |
| `epoch4_good` | 131,3% | Ininteligible / bucle repetitivo |
| `epoch9_collapsed` | 217,4% | Colapso confirmado del codificador de estilo |

Además, se midió el rendimiento en CPU (AMD Ryzen 5 5500U, 6 núcleos físicos / 12 hilos SMT, sin GPU) sintetizando un conjunto de prueba de 3 frases con 22,45 segundos de audio:

| Hilos CPU | Tiempo de síntesis | Factor tiempo real (RTF) | Velocidad vs. tiempo real | Pico de RAM |
|---|---|---|---|---|
| 1 | 20,9 s | 0,93× | 1,1× | 1,46 GB |
| 2 | 13,1 s | 0,58× | 1,7× | 1,46 GB |
| 3 | 11,0 s | 0,49× | 2,0× | 1,39 GB |
| 4 | 9,5 s | 0,42× | 2,4× | 1,41 GB |
| 5 | 9,1 s | 0,41× | 2,5× | 1,41 GB |
| **6** | **8,7 s** | **0,39×** | **2,6× (pico)** | 1,41 GB |
| 8 | 9,7 s | 0,43× | 2,3× | 1,42 GB |
| 10 | 9,7 s | 0,43× | 2,3× | 1,42 GB |
| 12 | 10,1 s | 0,45× | 2,2× | 1,39 GB |

El rendimiento escala con el número de núcleos físicos (6 en este caso); más allá de eso, los hilos SMT añaden sobrecarga de planificación sin ganancia real. Incluso en un solo hilo, el modelo es más rápido que el tiempo real. El consumo de memoria se mantiene estable en ~1,4 GB independientemente del número de hilos.

## Requisitos de hardware

- Inferencia en CPU: funciona sin GPU, con un RTF de 0,39× (2,6× más rápido que el tiempo real) usando 6 hilos en un Ryzen 5 5500U.
- RAM: pico de ~1,4 GB durante la síntesis, independientemente del número de hilos.
- GPU: no requerida; el modelo está diseñado para ejecutarse en CPU.
- Despliegue: se puede usar directamente con la librería `kokoro` de Python, o mediante el script de inferencia de kikiri-tts (`inference_kazakh.py`). También existe un proyecto de exportación a ONNX Runtime (ver enlaces) para entornos de producción.
- Latencia: en un solo hilo, 20,9 s para 22,45 s de audio (RTF 0,93); con 6 hilos, 8,7 s (RTF 0,39).
- Compatibilidad: requiere `torch`, `kokoro` y `misaki[kk]` (que instala espeak-ng). El checkpoint usa el formato legacy `weight_norm` (`weight_g`/`weight_v`), por lo que debe cargarse con versiones actuales de PyTorch/kokoro para evitar errores silenciosos de `load_state_dict`.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos TTS para kazajo en la información proporcionada. El modelo base Kokoro-82M es el punto de referencia natural, pero no se han publicado comparaciones de calidad o velocidad con alternativas como IndexTTS2-Kazakh (también de AnuarSv) u otros sistemas TTS multilingües. Se recomienda evaluar el modelo en el caso de uso concreto antes de decidir.

## Limitaciones y advertencias

- Voz de un solo hablante masculino (`km_m1`); no se incluyen voces femeninas ni variaciones de estilo.
- Idioma limitado al kazajo; no soporta otros idiomas.
- La calidad depende de la fonemización con espeak-ng; errores en la transcripción IPA pueden producir pronunciaciones incorrectas.
- El checkpoint se distribuye en formato legacy `weight_norm`; si se reexporta con otra versión de PyTorch, los nombres de las claves pueden cambiar y provocar que `load_state_dict` omita pesos sin error, generando ruido en lugar de habla.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con un corpus concreto, puede reflejar variaciones dialectales o de pronunciación propias de los datos de ISSAI KazakhTTS2.
- Riesgo de alucinación: en TTS, esto se manifiesta como repeticiones o bucles de audio; el autor descartó checkpoints con este problema, pero no se garantiza ausencia total en todos los textos de entrada.
- Licencia Apache 2.0 permite uso comercial, pero se debe verificar la procedencia del corpus ISSAI KazakhTTS2 para asegurar el cumplimiento de sus términos de uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AnuarSv/kokoro-tts-kazakh)
- [Kokoro-82M (modelo base)](https://huggingface.co/hexgrad/Kokoro-82M)
- [ISSAI KazakhTTS2 (corpus)](https://github.com/IS2AI/Kazakh_TTS)
- [kikiri-tts (framework de entrenamiento)](https://github.com/semidark/kikiri-tts)
- [misaki (fonemización)](https://github.com/hexgrad/misaki)
- [Proyecto de fine-tuning y exportación ONNX (GitHub)](https://github.com/ttianemi/kokoro-kazakh)
- [IndexTTS2-Kazakh (modelo relacionado)](https://huggingface.co/AnuarSv/IndexTTS2-Kazakh)
