# AnuarSv/kokoro-tts-kazakh

## Resumen

Kokoro TTS Kazakh (`km_m1`) es un modelo de síntesis de voz (text-to-speech) de un solo hablante para el idioma kazajo, desarrollado por Nuraidar Mambetaly, Anuar Sultanbekov y Altair Balakhazy (repo `AnuarSv/kokoro-tts-kazakh`). Se construye mediante fine-tuning de Kokoro-82M, una arquitectura de 82 millones de parámetros derivada de StyleTTS2, sobre el corpus ISSAI KazakhTTS2. El resultado es un checkpoint ligero que sintetiza voz masculina kazaja a 24 kHz.

La relevancia del modelo reside en su eficiencia: con solo 82M de parámetros, la inferencia se ejecuta en tiempo real incluso en CPU sin GPU dedicada, con un factor de tiempo real (RTF) de 0,39× en un AMD Ryzen 5 5500U usando 6 hilos físicos. Esto lo hace adecuado para despliegues en entornos con recursos limitados, aplicaciones de accesibilidad y sistemas embebidos donde el kazajo requiere soporte de voz.

El modelo emplea fonemización mediante espeak-ng a través de la librería `misaki`, con representación en IPA, y se distribuye bajo licencia Apache 2.0 heredada de Kokoro-82M y del framework de entrenamiento kikiri-tts. El repositorio ocupa 0,7 GB e incluye los pesos del decodificador (`kokoro_kazakh.pth`) y el voicepack (`km_m1.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (Kokoro-82M), transformer con encoder de estilo y decodificador GAN |
| Parametros totales | 82M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto; sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | Kazajo (`kk`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch, formato legacy `weight_norm` con claves `weight_g`/`weight_v`); voicepack `.pt` |

## Arquitectura y entrenamiento

El modelo se basa en Kokoro-82M, una arquitectura StyleTTS2 que combina un encoder de texto/fonemas, un encoder de estilo y un decodificador basado en GAN. La fonemización se realiza con espeak-ng vía `misaki` en representación IPA. El entrenamiento se llevó a cabo con el framework kikiri-tts en dos etapas (Stage 1 y Stage 2), con un total de 5 épocas por etapa, batch size 12, optimizador AdamW (betas 0.0/0.99, eps 1e-9, weight decay 1e-4) y tasas de aprendizaje de 1e-4 para el modelo acústico y 1e-5 para PL-BERT. El `joint_epoch` se fijó en 2 para evitar el colapso del encoder de estilo, un problema conocido en entrenamientos GAN de StyleTTS2.

Los datos de entrenamiento provienen del corpus ISSAI KazakhTTS2, que contiene 5 hablantes y 269,9 horas totales. Para este checkpoint concreto (voz `km_m1`, masculina) se utilizaron 102,8 horas distribuidas en 48.154 clips. La frecuencia de muestreo es de 24.000 Hz con 80 bandas mel. El tiempo total de entrenamiento fue de aproximadamente 52 horas (13 h en Stage 1 y 38,6 h en Stage 2). La validación se realizó sobre 20 frases retenidas, midiendo WER con un modelo Whisper ajustado a kazajo y la librería `jiwer`, obteniendo un 16,4% para el checkpoint final frente a valores de 131,3% y 217,4% en checkpoints intermedios descartados por colapso o desajuste de decodificador.

## Capacidades

- Síntesis de voz (text-to-speech) en kazajo para un único hablante masculino identificado como `km_m1`.
- Generación de audio a 24 kHz con 80 bandas mel, compatible con el pipeline `text-to-speech` de Hugging Face.
- Fonemización de texto kazajo a IPA mediante espeak-ng y `misaki[kk]`.
- Control de velocidad de síntesis mediante el parámetro `speed` en la llamada al modelo.
- Inferencia en CPU sin necesidad de GPU, con RTF inferior a 1 en configuraciones de un solo hilo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.
- No dispone de modo thinking ni capacidades multimodales más allá de la síntesis de voz.

## Casos de uso

- **Atención al cliente automatizada en kazajo**: el modelo puede integrarse en sistemas IVR o chatbots de voz para generar respuestas habladas en kazajo con latencia baja, gracias a su RTF de 0,39× en CPU de 6 núcleos, lo que permite respuestas en tiempo real sin infraestructura GPU.
- **Accesibilidad para personas con discapacidad visual**: lectura de textos en kazajo (documentos, webs, notificaciones) mediante síntesis de voz ligera que puede ejecutarse en dispositivos de gama baja o en el propio navegador con un backend CPU.
- **Generación de audiolibros y contenido educativo**: conversión de material didáctico o literario en kazajo a audio con una voz consistente de un solo hablante, adecuada para narración continua y distribución en formato podcast o audiolibro.
- **Sistemas de navegación y anuncios públicos**: generación de avisos de voz en kazajo para transporte público, aeropuertos o aplicaciones de navegación, donde la latencia y el consumo de recursos son críticos y el modelo cabe en 1,4 GB de RAM.
- **Prototipado rápido de aplicaciones de voz**: investigadores y desarrolladores pueden desplegar un TTS kazajo funcional en minutos con `pip install torch kokoro "misaki[kk]"`, sin necesidad de entrenar ni disponer de GPU, facilitando la validación de ideas y la creación de demos.
- **Integración en pipelines de accesibilidad web**: generación de versiones en audio de artículos o páginas web en kazajo mediante un servicio en segundo plano que utiliza el modelo en CPU, reduciendo costes de infraestructura frente a soluciones basadas en GPU.
- **Localización de contenidos multimedia**: doblaje o sustitución de voz en vídeos educativos o corporativos en kazajo, con la posibilidad de ajustar la velocidad de síntesis para sincronizar con la duración del vídeo.

## Benchmarks y rendimiento

El autor publica benchmarks de rendimiento en CPU (AMD Ryzen 5 5500U, 6 núcleos físicos / 12 hilos, sin GPU) sobre un conjunto de prueba de 3 frases con 22,45 s de audio:

| Hilos de CPU | Tiempo de síntesis | RTF | Velocidad vs. tiempo real | RAM pico |
|---|---|---|---|---|
| 1 | 20,9 s | 0,93× | 1,1× | 1,46 GB |
| 2 | 13,1 s | 0,58× | 1,7× | 1,46 GB |
| 3 | 11,0 s | 0,49× | 2,0× | 1,39 GB |
| 4 | 9,5 s | 0,42× | 2,4× | 1,41 GB |
| 5 | 9,1 s | 0,41× | 2,5× | 1,41 GB |
| 6 | 8,7 s | 0,39× | 2,6× (pico) | 1,41 GB |
| 8 | 9,7 s | 0,43× | 2,3× | 1,42 GB |
| 10 | 9,7 s | 0,43× | 2,3× | 1,42 GB |
| 12 | 10,1 s | 0,45× | 2,2× | 1,39 GB |

Además, el autor reporta una evaluación de calidad mediante WER sobre 20 frases de validación retenidas, usando un Whisper ajustado a kazajo y `jiwer`:

| Voicepack | WER en conjunto retenido | Veredicto |
|---|---|---|
| `final` (esta release) | 16,4% | Habla limpia e inteligible |
| `epoch4_good` | 131,3% | Audio distorsionado con bucles repetitivos |
| `epoch9_collapsed` | 217,4% | Colapso confirmado del encoder de estilo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU; la inferencia está diseñada para CPU. En caso de usar GPU, el modelo de 82M parámetros en fp32 ocupa aproximadamente 0,33 GB de VRAM, aunque no se documentan requisitos específicos de GPU.
- **RAM**: pico de 1,39–1,46 GB durante la síntesis en CPU.
- **GPU recomendadas**: no disponibles ni necesarias; el autor indica que no se requiere GPU para inferencia. Cualquier GPU con soporte PyTorch podría ejecutarlo, pero no se han publicado benchmarks en GPU.
- **Compatibilidad con GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), aunque el modelo está optimizado para CPU.
- **Opciones de despliegue**: PyTorch con la librería `kokoro` y `misaki[kk]`; script de inferencia `inference_kazakh.py` del repositorio kikiri-tts. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- **Latencia y throughput**: RTF de 0,39× con 6 hilos físicos (2,6× más rápido que tiempo real); RTF de 0,93× con un solo hilo (1,1× más rápido que tiempo real). El rendimiento escala hasta el número de núcleos físicos y se degrada ligeramente con hilos SMT adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Kokoro TTS Kazakh (`km_m1`) | 82M | Kazajo | no aplica | Apache 2.0 | `.pth` + `.pt` | Hugging Face (`AnuarSv/kokoro-tts-kazakh`) |
| Kokoro-82M (base) | 82M | Inglés y otros | no aplica | Apache 2.0 | `.pth` | Hugging Face (`hexgrad/Kokoro-82M`) |
| StyleTTS2 | no disponible | Inglés | no aplica | MIT (repo original) | `.pth` | GitHub (`yl4579/StyleTTS2`) |
| ISSAI KazakhTTS2 (modelos originales) | no disponible | Kazajo | no aplica | no disponible | no disponible | GitHub (`IS2AI/Kazakh_TTS`) |

La comparativa se limita a la familia StyleTTS2/Kokoro, ya que no se dispone de datos de benchmarks cruzados con otros modelos TTS kazajos en la información proporcionada. El modelo se distingue por ser un fine-tuning específico para kazajo sobre una base ligera de 82M parámetros, con licencia permisiva y ejecución en CPU.

## Limitaciones y advertencias

- **Un solo hablante**: el checkpoint solo genera voz masculina (`km_m1`); no permite seleccionar otras voces sin entrenar voicepacks adicionales.
- **Idioma único**: solo soporta kazajo (`kk`); no se ha validado para otros idiomas y la fonemización depende de espeak-ng para kazajo.
- **Riesgo de alucinación y artefactos**: como todo modelo TTS, puede producir pronunciaciones incorrectas, repeticiones o ruido en textos fuera de distribución; el autor documenta colapsos del encoder de estilo en checkpoints intermedios, lo que evidencia la sensibilidad del entrenamiento.
- **WER del 16,4%**: aunque aceptable, indica que aproximadamente una de cada seis palabras puede reconocerse incorrectamente en la validación, lo que puede ser insuficiente para aplicaciones críticas sin revisión humana.
- **Compatibilidad de pesos**: el archivo `kokoro_kazakh.pth` usa el formato legacy `weight_norm` (`weight_g`/`weight_v`); un desajuste con versiones de PyTorch o `kokoro` que esperen `parametrizations.weight.original0`/`original1` puede provocar que `load_state_dict` omita pesos sin lanzar error, generando ruido en lugar de voz.
- **Licencia Apache 2.0**: permite uso comercial, pero se hereda de Kokoro-82M y kikiri-tts; conviene verificar las condiciones de los datos de entrenamiento (ISSAI KazakhTTS2) para usos comerciales.
- **Sin cuantizaciones documentadas**: no se ofrecen variantes GGUF, ONNX o int8, lo que limita la optimización en algunos entornos de despliegue.
- **Dependencia de espeak-ng**: la calidad de la fonemización depende de la versión de espeak-ng y de `misaki[kk]`, lo que puede introducir variabilidad entre entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnuarSv/kokoro-tts-kazakh
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio kikiri-tts (framework de entrenamiento): https://github.com/semidark/kikiri-tts
- Repositorio StyleTTS2: https://github.com/yl4579/StyleTTS2
- Corpus ISSAI KazakhTTS2: https://github.com/IS2AI/Kazakh_TTS
- Librería misaki (fonemización): https://github.com/hexgrad/misaki
- Perfil de Nuraidar Mambetaly: https://www.linkedin.com/in/nuraidar-mambetaly-b4120a330/
- Perfil de Anuar Sultanbekov: https://www.linkedin.com/in/anuar-sultanbekov-747288249
- Perfil de Altair Balakhazy: https://www.linkedin.com/in/altair-balakhazy-197843354/
