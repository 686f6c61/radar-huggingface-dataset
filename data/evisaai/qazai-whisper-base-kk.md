# Evisaai/qazai-whisper-base-kk

## Resumen

qazai-whisper-base-kk es una conversión al formato ggml del modelo de reconocimiento automático de voz akuzdeuov/whisper-base.kk, un Whisper base ajustado para kazajo. Lo publica el usuario Evisaai y su propósito es permitir la inferencia de este modelo en whisper.cpp, la implementación en C/C++ de referencia para ejecutar Whisper en CPU y en hardware modesto. No se ha reentrenado ni modificado ningún peso: se trata de una conversión de formato y una cuantización a q8_0.

El modelo resuelve un problema muy concreto: la transcripción de audio en kazajo en entornos donde no hay GPU o donde se prefiere una dependencia ligera y portable. Al estar basado en la arquitectura Whisper base (un transformer encoder-decoder de unos 74 millones de parámetros), ofrece un equilibrio entre precisión y coste computacional, con un único fichero binario de aproximadamente 82 MB.

Es relevante porque el ecosistema de ASR en lenguas túrquicas y de Asia Central es escaso, y disponer de una variante lista para whisper.cpp con licencia Apache-2.0 facilita su integración en aplicaciones de escritorio, móviles o embebidas sin depender de frameworks de Python. El autor reporta un 13,8 % de WER en el conjunto de test kk de FLEURS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper base (transformer encoder-decoder) |
| Parametros totales | no disponible (Whisper base tiene ~74 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper base procesa ventanas de 30 s de audio) |
| Tipos de cuantizacion | q8_0 (unico fichero publicado) |
| Idiomas soportados | kazajo (kk) unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | ggml (binario para whisper.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un Whisper base, es decir, un transformer encoder-decoder con atención multi-cabeza estándar, diseñado para mapear espectrogramas de audio Mel a secuencias de tokens de texto. Whisper se entrena de forma supervisada multitarea (transcripción, traducción, detección de idioma) sobre audio emparejado con transcripciones. En este caso concreto, el modelo original akuzdeuov/whisper-base.kk fue ajustado sobre el Kazakh Speech Corpus 2 (ISSAI), según indica la model card.

La aportación de este repositorio no es de entrenamiento, sino de empaquetado: se parte de la revisión `2f0727ca8a577b1a0d463114511ff6602fb703b6` del modelo original, se convierte a ggml y se cuantiza a q8_0, generando el fichero `ggml-whisper-base-kk-q8_0.bin` de 81 768 602 bytes con SHA-256 `a7feb18fe92096a2bfde6c4d49c0a3d4dea4777bc8dde9be88c4e2103a880191`. No se documentan detalles adicionales sobre hiperparámetros de ajuste fino, composición exacta del dataset ni uso de RLHF.

## Capacidades

- Reconocimiento automático de voz (ASR) en kazajo, con salida de texto a partir de audio.
- Transcripción de audio en formato compatible con whisper.cpp (WAV 16 kHz, entre otros).
- Ejecución en CPU sin dependencias de Python ni de CUDA, gracias al backend ggml.
- Inferencia offline y portable en dispositivos con recursos limitados.
- No soporta otros idiomas: la model card indica explícitamente que para ruso o inglés deben usarse los modelos Whisper generales.
- No se documentan capacidades de traducción, diarización, timestamps por palabra ni tool calling.

## Casos de uso

- Transcripción de reuniones y entrevistas en kazajo: el modelo convierte audio grabado en texto para actas o búsqueda posterior, ejecutándose en local sin enviar datos a servicios externos.
- Subtitulado de vídeo en kazajo: integrado en una pipeline que segmenta el audio en ventanas de hasta 30 s y genera subtítulos con whisper.cpp, aprovechando el bajo coste del modelo base.
- Asistentes de voz embebidos: al ser un binario ggml de ~82 MB, puede desplegarse en dispositivos de borde (Raspberry Pi, mini-PC) para comandos de voz en kazajo.
- Archivística y digitalización de patrimonio oral: transcripción por lotes de grabaciones históricas o etnográficas en kazajo con un modelo ligero que se ejecuta en CPU.
- Investigación lingüística y corpus: generación de transcripciones preliminares para anotación humana, con la ventaja de una licencia Apache-2.0 que permite redistribución y adaptación.
- Aplicaciones de accesibilidad: dictado y conversión de voz a texto en kazajo en herramientas de escritorio, sin requerir conexión a internet.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| FLEURS kk (test), WER | 13,8 % |

No se han publicado en la información disponible resultados de otros benchmarks (p. ej. MMLU, HumanEval o GSM8K, no aplicables a un modelo ASR) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el fichero q8_0 ocupa unos 82 MB, por lo que la huella de memoria es mínima (no se publica una cifra oficial de VRAM).
- GPU recomendadas: cualquier GPU con soporte CUDA o Metal para whisper.cpp; no se requiere una GPU de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU, dado el reducido tamaño del modelo.
- Opciones de despliegue: whisper.cpp (formato nativo ggml); también puede ejecutarse mediante bindings de whisper.cpp en Python, Node u otros lenguajes.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Contexto audio |
|---|---|---|---|---|---|
| Evisaai/qazai-whisper-base-kk | Whisper base (~74 M, no confirmado) | kk | ggml q8_0 | Apache-2.0 | ventanas de 30 s |
| akuzdeuov/whisper-base.kk | Whisper base (~74 M, no confirmado) | kk | safetensors/PyTorch (no confirmado) | Apache-2.0 | ventanas de 30 s |
| openai/whisper-base | Whisper base (~74 M) | multilingue | PyTorch, ggml (comunidad) | MIT | ventanas de 30 s |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo reconoce kazajo; su uso con ruso, inglés u otros idiomas producirá transcripciones incorrectas.
- El WER del 13,8 % en FLEURS implica un margen de error considerable en condiciones de audio ruidoso, acentos marcados o vocabulario especializado.
- Riesgo de alucinación típico de Whisper en segmentos de silencio o ruido, donde puede generar texto inexistente.
- Al ser una cuantización q8_0, puede existir una degradación menor de precisión frente a los pesos originales en precisión completa (no cuantificada en la información disponible).
- No se documentan sesgos específicos del corpus de entrenamiento más allá de su origen (Kazakh Speech Corpus 2).
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y atribución.
- No hay garantías de mantenimiento ni actualizaciones por parte del autor; el repositorio tiene 0 descargas y solo 2 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/Evisaai/qazai-whisper-base-kk
- Modelo original: https://huggingface.co/akuzdeuov/whisper-base.kk
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
