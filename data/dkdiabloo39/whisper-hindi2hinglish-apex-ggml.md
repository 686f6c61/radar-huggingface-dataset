# DKDiabloO39/whisper-hindi2hinglish-apex-ggml

## Resumen

Whisper-Hindi2Hinglish-Apex (en formato ggml para whisper.cpp) es una conversión del modelo Oriserve/Whisper-Hindi2Hinglish-Apex, un fine-tune de Whisper Large v3 Turbo especializado en reconocimiento automático de voz para hindi, urdu e inglés. Su particularidad es que transcribe el habla en hindi y urdu escribiéndola en alfabeto latino (Hinglish), dejando el inglés en inglés tal cual, lo que refleja cómo se escribe realmente en contextos informales de la India.

Esta versión, publicada por el usuario DKDiabloO39, no modifica los pesos: convierte los safetensors originales (BF16) al formato ggml en F16 que carga whisper.cpp, renombrando los tensores a los nombres de OpenAI y reutilizando los filtros mel y el vocabulario de `ggml-large-v3-turbo`. El repositorio ocupa 1,6 GB y contiene un único fichero `ggml-hinglish-apex-f16.bin` con verificación SHA-256.

Su relevancia radica en resolver un problema práctico muy común: los sistemas ASR estándar transcriben el hindi en devanagari, pero gran parte de la comunicación real (chats, subtítulos, análisis de llamadas) usa romanización. Al ejecutarse con whisper.cpp, el modelo puede correr en CPU y en dispositivos con recursos limitados, sin depender de PyTorch ni de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | no disponible (equivalente a Whisper Large v3 Turbo, ~809 M en el modelo original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (diseño Whisper) |
| Tipos de cuantizacion | F16 (esta conversión); el original usa BF16 |
| Idiomas soportados | Hindi (hi), urdu (ur), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (fichero `.bin` para whisper.cpp) |

## Arquitectura y entrenamiento

El modelo base es Whisper Large v3 Turbo de OpenAI, un transformer encoder-decoder para audio: el encoder procesa espectrogramas log-mel (128 bandas) y el decoder genera texto de forma autorregresiva. La versión Turbo reduce el número de capas del decoder respecto a Large v3 para acelerar la inferencia manteniendo calidad. Oriserve realizó un fine-tune sobre este modelo para producir transcripciones en escritura romanizada (Hinglish) a partir de habla en hindi y urdu.

Los datos de entrenamiento del fine-tune original (número de horas, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. En cuanto a esta conversión concreta: los pesos proceden de `model.safetensors` en la revisión `f3214ee`, convertidos de BF16 a F16 sin reentrenamiento; los tensores unidimensionales (embeddings posicionales, sesgos de convolución) se mantienen en F32, siguiendo la práctica de las conversiones oficiales de whisper.cpp. El vocabulario (50.257 tokens) y los filtros mel (128 × 201) provienen del fichero `ggml-large-v3-turbo` de whisper.cpp, ya que el `vocab.json` de Apex es idéntico token a token. Una innovación relevante del fine-tune original: se entrenó sin los tokens de timestamp de Whisper, lo que afecta a la temporización (ver Limitaciones).

## Capacidades

- Transcripción de voz en hindi y urdu escrita en alfabeto latino (Hinglish), el formato dominante en mensajería y redes sociales en la India.
- Transcripción de inglés hablado dejándolo en inglés, sin romanización forzada.
- Manejo de código-switching (mezcla hindi-inglés en la misma frase), situación típica del habla urbana india.
- Ejecución local y eficiente mediante whisper.cpp, sin dependencia de PyTorch ni GPU.
- Salida en JSON con `-ojf` para integración en pipelines.
- Alineación palabra-audio precisa mediante DTW (`-dtw large.v3.turbo`).
- No soporta tool calling ni capacidades generativas de chat: es un modelo exclusivamente de ASR.

## Casos de uso

- Subtitulado de contenido en Hinglish: generación de subtítulos para vídeos de YouTube, podcasts o reels en hindi/urdu hablado, con texto romanizado listo para publicar sin conversión de script.
- Análisis de llamadas de centros de contacto en India: transcripción de llamadas de atención al cliente para analítica de sentimiento, control de calidad y cumplimiento, donde el texto romanizado se integra directamente con sistemas NLP que trabajan en Hinglish.
- Transcripción de notas de voz de WhatsApp: conversión masiva de audios en hindi a texto latino para búsqueda, archivado y resumen posterior con LLMs.
- Generación de datasets de entrenamiento: creación de corpus de texto Hinglish alineado con audio para entrenar TTS o modelos de diálogo en romanización.
- Accesibilidad: subtítulos en tiempo casi real para personas que leen devanagari con dificultad o prefieren texto latino.
- Integración en aplicaciones edge: gracias a whisper.cpp, despliegue en servidores pequeños, portátiles o dispositivos locales sin GPU, por ejemplo en apps de dictado o automatización por voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original de Oriserve podría contener métricas (WER/CER), pero no están incluidas en los datos proporcionados para esta conversión.

## Requisitos de hardware

- VRAM / memoria: el fichero F16 ocupa 1,6 GB; al ser whisper.cpp, puede ejecutarse íntegramente en CPU con RAM, sin necesidad de VRAM. Con GPU (mediante Vulkan, CUDA o Metal en whisper.cpp) bastaría una GPU con ~2 GB de VRAM libres.
- GPU recomendadas: no requiere GPU; opcionalmente cualquier GPU moderna acelera la inferencia (RTX 3060/4060 o superiores, Apple Silicon con Metal).
- Consumer GPUs: cabe sobradamente en cualquier GPU doméstica actual; el caso principal de uso es CPU puro (un portátil o servidor modesto con 4-8 GB de RAM libres es suficiente).
- Despliegue: whisper.cpp (whisper-cli, whisper-server); no requiere vLLM, Ollama ni TGI al no ser un LLM.
- Latencia y throughput: no disponible; Whisper Large v3 Turbo es notablemente más rápido que Large v3 por su decoder reducido, pero no hay cifras publicadas para esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia |
|---|---|---|---|---|
| Whisper-Hindi2Hinglish-Apex (ggml, esta ficha) | ~809 M (Large v3 Turbo) | GGML F16 | ASR hindi/urdu → Hinglish romanizado | Apache 2.0 |
| Whisper Large v3 Turbo (OpenAI) | ~809 M | GGML, safetensors | ASR multilingüe (99 idiomas), salida en script nativo | MIT (pesos) |
| Whisper Large v3 (OpenAI) | ~1.550 M | GGML, safetensors | ASR multilingüe, mayor precisión, más lento | MIT (pesos) |
| AI4Bharat IndicWhisper / IndicConformer | variable | safetensors | ASR para lenguas indicas, salida en script nativo (devanagari) | variable |

La diferencia clave de Apex frente a Whisper estándar e IndicWhisper es la salida en escritura romana, que evita la transliteración posterior en pipelines Hinglish.

## Limitaciones y advertencias

- Sin tokens de timestamp: el fine-tune original se entrenó sin los tokens de temporización de Whisper, por lo que los tiempos de segmento de whisper.cpp derivan hasta varios segundos dentro de cada ventana de 30 segundos. Para tiempos por palabra hay que usar alineación DTW (`-dtw large.v3.turbo -nfa`), que sí es precisa.
- Configuración de idioma: debe ejecutarse con `-l en` según indica Oriserve; forzar `-l hi` puede degradar la salida.
- Alcance de idiomas limitado: solo hindi, urdu e inglés; no es sustituto de Whisper para otros idiomas.
- Riesgo de alucinaciones típico de la familia Whisper en silencios largos o audio ruidoso (repeticiones o texto inventado); se recomienda la opción `-nfa` (no fallback) para mitigarlo.
- Sesgos: no disponible; al ser un fine-tune sobre Whisper, hereda posibles sesgos del modelo base y de los datos del fine-tune (no documentados).
- La romanización no es única: distintas convenciones de transliteración pueden no coincidir con las esperadas por sistemas downstream.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes, aunque la model card recuerda que el crédito del modelo corresponde a Oriserve.

## Enlaces

- Repositorio de esta conversión (ggml): https://huggingface.co/DKDiabloO39/whisper-hindi2hinglish-apex-ggml
- Modelo original de Oriserve: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- whisper.cpp (repositorio oficial): https://github.com/ggml-org/whisper.cpp
