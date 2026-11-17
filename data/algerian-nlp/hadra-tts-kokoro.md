# algerian-nlp/Hadra-TTS-kokoro

## Resumen

Hadra-TTS Kokoro 82M (هدرة) es un modelo de síntesis de voz (text-to-speech) en código abierto adaptado al darja argelino (الدارجة الجزائرية), la variante dialectal del árabe hablada en Argelia. Lo desarrolla el colectivo algerian-nlp y se construye como un fine-tuning del modelo hexgrad/Kokoro-82M, una arquitectura StyleTTS2 con vocoder iSTFTNet de 82 millones de parámetros. El modelo cubre una laguna importante: la práctica totalidad de los sistemas TTS árabes se centran en el árabe estándar moderno (MSA) y descuidan los dialectos magrebíes, que presentan fonología propia (consonantes faríngeas, oclusivas uvulares, préstamos del francés) y no se sintetizan con calidad aceptable usando modelos entrenados en MSA.

El modelo incorpora tres personas de voz preentrenadas (kahwa, rawi y loubna) condicionadas sobre corpus de audio argelino auténtico, y ofrece un pipeline de inferencia autocontenido que normaliza texto en darja, translitera préstamos franceses y sintetiza audio a 24 kHz. Su licencia Apache 2.0 y su reducido tamaño (0,3 GB de repositorio) lo hacen desplegable en hardware modesto.

La relevancia actual del modelo reside en su enfoque en una lengua de bajos recursos con más de 40 millones de hablantes y en la documentación de un conjunto de pruebas acústicas (75 generaciones sobre 25 prompts) que reporta métricas de salud espectral, aunque no benchmarks estándar de inteligibilidad como MOS o WER.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StyleTTS2 con vocoder iSTFTNet (Kokoro-82M) |
| Parámetros totales | 82 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | arq (darja argelino), ar (árabe) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pth para el checkpoint acústico, .pt para los vectores de voz) |

## Arquitectura y entrenamiento

Hadra-TTS se basa en Kokoro-82M, un modelo TTS que combina la arquitectura StyleTTS2 (generador acústico con condicionamiento de estilo y prosodia) con un vocoder iSTFTNet que produce formas de onda a 24 kHz. El modelo base es un transformer ligero de 82M de parámetros, diseñado para inferencia eficiente en CPU y GPU. El fine-tuning añade al vocabulario fonético del modelo base los fonemas IPA propios del darja: la fricativa faríngea sonora /ʕ/ (ع), la fricativa faríngea sorda /ħ/ (ح), la oclusiva velar sonora /ɡ/ (گ), la oclusiva uvular /q/ (ق), la labiodental sonora /v/ (ڤ) y la bilabial sorda /p/ (پ).

El entrenamiento se realizó sobre tres corpus de audio argelino publicados por oddadmix: `arabic-audio-collection-algerian-kahwa-postcast`, `arabic-audio-collection-algerian-rawi` y `arabic-audio-collection-algerian-loubna-stories`. No se especifican en la información disponible el número de horas de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en TTS). El pipeline incluye un módulo ligero de G2P (grafema a fonema) para darja con transliteración de préstamos franceses (por ejemplo, "rendez-vous" a "raːndeːvuː", "le médecin" a "lu meːdsaːn"), lo que aborda el code-switching francés-árabe característico del habla argelina.

## Capacidades

- Síntesis de voz multi-hablante en darja argelino con tres personas preentrenadas: kahwa (presentador urbano joven, velocidad 1,08x), rawi (narrador tradicional de Casbah, velocidad 0,88x) y loubna (narradora femenina, velocidad 1,00x).
- Pronunciación de consonantes faríngeas y uvulares propias del darja (/ʕ/, /ħ/, /q/) y de fonemas del sustrato bereber y préstamos franceses (/ɡ/, /v/, /p/).
- Manejo de code-switching francés-árabe mediante transliteración de préstamos léxicos franceses a IPA.
- Control de velocidad de habla por persona y condicionamiento de estilo prosódico (StyleTTS2).
- Generación de audio a 24 kHz con calidad de broadcast según las métricas reportadas por el autor.
- Soporte de inferencia en CPU y GPU (CUDA) mediante la librería `kokoro`.
- Carga directa del checkpoint acústico (`kokoro_arabic.pth`) para fine-tuning e investigación.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni modo de razonamiento (no aplica a un modelo TTS).

## Casos de uso

- **Locución de podcasts y contenido editorial argelino**: las personas kahwa y rawi están entrenadas sobre corpus de podcast y narración, por lo que pueden generar introducciones, cuñas y segmentos completos en darja con cadencia natural y sin necesidad de locutor humano.
- **Audiolibros y narración de historias**: la persona loubna, con velocidad natural y alta inteligibilidad reportada, es adecuada para narrar cuentos y textos largos, incluyendo la persona rawi para registro dramático tradicional.
- **Accesibilidad y lectura de pantalla en darja**: integración en lectores de pantalla o asistentes de accesibilidad para usuarios argelinos que prefieren su dialecto al árabe estándar, con salida a 24 kHz y latencia baja gracias al tamaño de 82M.
- **Sistemas de atención al cliente y IVR**: generación de respuestas de voz pregrabadas dinámicamente para centrales telefónicas argelinas, con pronunciación correcta de topónimos y préstamos franceses habituales en el dominio comercial.
- **Doblaje y localización de vídeo**: sustitución de pistas de voz en contenido formativo o divulgativo para el mercado argelino, manteniendo el code-switching francés-árabe que caracteriza el registro oral real.
- **Investigación en TTS de bajos recursos**: el checkpoint `kokoro_arabic.pth` y los vectores de voz permiten fine-tuning adicional sobre nuevos corpus dialectales magrebíes, sirviendo de base para experimentos de adaptación a otras variedades del darja (oranesa, constantinesa, argelina).
- **Generación de material educativo**: creación de audios para aprendizaje de darja o de árabe dialectal, con voces diferenciadas por género y registro.

## Benchmarks y rendimiento

El autor reporta una batería de 75 generaciones (25 prompts en 5 niveles de dificultad, tres personas) evaluada mediante métricas acústicas espectrales, no mediante benchmarks estándar de TTS como MOS, WER o MCD. No se han publicado resultados de MMLU, HumanEval, GSM8K ni equivalentes, ya que no aplican a un modelo TTS.

| Métrica acústica | Ejecuciones corruptas / sin ajuste | Hadra-TTS (arquitectura de producción) | Estado |
|---|---|---|---|
| Formantes de voz (< 2 kHz) | 5,4 % – 8,5 % | 93,5 % | PASS |
| Energía de ruido (> 4 kHz) | 77,9 % – 85,1 % (siseo severo) | 3,9 % | PASS |

No se dispone de comparación con otros modelos TTS en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 82M de parámetros en precisión completa, la huella de pesos ronda los 0,3 GB; la inferencia completa con vocoder y buffers de audio requiere aproximadamente 1–2 GB de VRAM en GPU.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; se ha validado ejecución en CUDA y CPU. GPU de gama alta (A100, H100, RTX 4090) no aportan ventaja significativa por el reducido tamaño del modelo, salvo para procesamiento por lotes a gran escala.
- **Consumer GPU**: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, GTX 1660) e incluso en iGPU y CPU.
- **Opciones de despliegue**: la librería oficial `kokoro` (PyTorch) es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo TTS de esta arquitectura.
- **Latencia y throughput**: no se publican cifras concretas de latencia ni de RTF (real-time factor) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hadra-TTS Kokoro 82M | 82M | arq, ar | TTS, 24 kHz | Apache 2.0 | Hugging Face (algerian-nlp) |
| hexgrad/Kokoro-82M (base) | 82M | múltiples (incluye árabe estándar) | TTS, 24 kHz | Apache 2.0 | Hugging Face (hexgrad) |
| Modelos TTS árabes MSA comerciales | no disponible | ar (MSA) | TTS | propietaria | APIs comerciales |
| Otros TTS dialectales magrebíes | no disponible | no disponible | TTS | no disponible | no disponible |

La comparación directa con alternativas dialectales específicas del darja no está disponible en la información proporcionada. Frente a su modelo base, Hadra-TTS añade fonemas faríngeos y uvulares, personas argelinas y un módulo G2P con transliteración francesa, a costa de restringir el ámbito lingüístico al darja.

## Limitaciones y advertencias

- **Ámbito lingüístico restringido**: el modelo está adaptado exclusivamente al darja argelino y al árabe; no se garantiza calidad en otras variedades dialectales árabes ni en MSA formal fuera del dominio de entrenamiento.
- **Riesgo de alucinación prosódica**: como todo modelo TTS, puede generar pronunciaciones incorrectas en palabras fuera del vocabulario o en topónimos poco frecuentes; el G2P ligero no cubre todo el léxico francés ni el bereber.
- **Sesgos de los corpus**: las tres personas se derivan de corpus concretos (podcast, narración, cuentos), lo que puede introducir sesgos de registro, género y edad; no se documenta la diversidad demográfica de los hablantes originales.
- **Métricas limitadas**: las cifras reportadas (93,5 % de formantes, 3,9 % de ruido) son métricas espectrales internas del autor, no evaluaciones subjetivas MOS ni de inteligibilidad con oyentes nativos; deben interpretarse con cautela.
- **Licencia Apache 2.0**: permite uso comercial y modificación con atribución, pero el autor no documenta si los corpus de audio subyacentes tienen restricciones adicionales que puedan afectar a la redistribución de derivados.
- **Formato de pesos**: los pesos están en formato PyTorch (.pth, .pt), no en GGUF ni ONNX; el despliegue en entornos no-PyTorch requiere conversión manual no documentada.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente de las afirmaciones del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/algerian-nlp/Hadra-TTS-kokoro
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Dataset kahwa: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-kahwa-postcast
- Dataset rawi: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-rawi
- Dataset loubna: https://huggingface.co/datasets/oddadmix/arabic-audio-collection-algerian-loubna-stories
- Librería kokoro (PyTorch): https://github.com/hexgrad/kokoro
- Paper StyleTTS2: no disponible en la información proporcionada
- Demo online: no disponible en la información proporcionada
