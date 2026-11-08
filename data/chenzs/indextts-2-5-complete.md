# chenzs/IndexTTS-2.5-Complete

## Resumen

IndexTTS-2.5 es un modelo de síntesis de voz (text-to-speech) zero-shot desarrollado por IndexTeam en Bilibili. Clona una voz a partir de un único clip de audio de referencia y permite transferencia de voz entre idiomas, además de control de emoción desacoplado del timbre. Frente a IndexTTS-2, incorpora japonés, español y árabe, reduce el tiempo de inferencia, añade control de velocidad de habla y mejora el control de pronunciación mediante pinyin chino, fonemas CMU ingleses y kana japonés.

La arquitectura es un TTS autorregresivo compuesto por un backbone GPT de aproximadamente 0,8B parámetros, un decodificador voz-a-mel basado en flow matching y un vocoder BigVGAN, con salida de waveform a 22,05 kHz. El repositorio publicado ocupa 8,5 GB e incluye pesos en formato safetensors; los modelos auxiliares (w2v-bert-2.0, códec semántico MaskGCT, CAMPPlus y BigVGAN) se descargan en el primer arranque.

Su relevancia actual radica en cubrir cinco idiomas (chino, inglés, japonés, español y árabe) con clonación zero-shot desde un solo audio, control emocional vectorial de ocho dimensiones y requisitos de hardware moderados (unos 6 GB de VRAM en una GPU NVIDIA), lo que lo hace viable en entornos de producción con GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo: backbone GPT + decodificador voz-a-mel con flow matching + vocoder BigVGAN |
| Parametros totales | ~0,8B (backbone GPT; el total del sistema no está desglosado en la información disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 documentado (`use_bf16=True`); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh), inglés (en), japonés (ja), español (es), árabe (ar) |
| Licencia | bilibili-model-license (Bilibili Model Use License Agreement) |
| Formato de pesos | safetensors |
| Frecuencia de salida | 22,05 kHz |
| Entrada de audio | clip de referencia para clonación de voz |
| Requisitos de entorno | Python 3.10–3.11, GPU NVIDIA, ~6 GB de VRAM |

## Arquitectura y entrenamiento

IndexTTS-2.5 es un sistema TTS autorregresivo con tres componentes principales: un backbone GPT de aproximadamente 0,8B parámetros que modela la secuencia de tokens acústicos, un decodificador voz-a-mel basado en flow matching que transforma las representaciones latentes en mel-espectrogramas, y un vocoder BigVGAN que genera la waveform final a 22,05 kHz. El sistema se apoya en modelos auxiliares externos: w2v-bert-2.0 para representaciones de audio, el códec semántico MaskGCT y CAMPPlus para embeddings de hablante.

El modelo realiza clonación de voz zero-shot a partir de un único clip de referencia y desacopla el control emocional del timbre del hablante, de modo que la emoción se especifica mediante un vector de ocho flotantes en el orden [happy, angry, sad, afraid, disgusted, melancholic, surprised, calm]. Incorpora control explícito de pronunciación mediante notación `<palabra|lectura>` con pinyin chino, fonemas CMU para inglés y kana para japonés, y un parámetro `duration_factor` (rango 0,5–2,0) para ajustar la velocidad de habla. La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Síntesis de voz zero-shot con clonación a partir de un único clip de audio de referencia.
- Transferencia de voz entre idiomas (cross-lingual): la voz clonada puede hablar en cualquiera de los cinco idiomas soportados.
- Control emocional mediante vector de ocho dimensiones desacoplado del timbre.
- Control emocional por descripción textual, disponible solo si se construye el modelo con `use_qwen_emo=True` (requiere el modelo QwenEmotion).
- Control de pronunciación: pinyin chino, fonemas CMU ingleses y kana japonés en formato `<palabra|lectura>`.
- Control de velocidad de habla mediante `duration_factor` (0,5–2,0).
- Soporte multilingüe: chino, inglés, japonés, español y árabe.
- Interfaz web incluida (`webui.py`).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; no aplica a un modelo TTS.

## Casos de uso

- Doblaje y localización de vídeo: el modelo permite clonar la voz de un actor y generar el mismo contenido en inglés, japonés, español o árabe, manteniendo el timbre original gracias a la transferencia cross-lingual.
- Audiolibros y narración automatizada: con control de velocidad (`duration_factor`) y emoción vectorial, se puede ajustar el tono narrativo por escena y sincronizar la duración con capítulos predefinidos.
- Asistentes de voz para atención al cliente: la clonación zero-shot permite desplegar una voz corporativa consistente a partir de un único clip, con salida a 22,05 kHz y unos 6 GB de VRAM por instancia.
- Generación de voces para videojuegos y contenido interactivo: el vector emocional de ocho dimensiones permite generar variantes de una misma línea (enfadado, triste, sorprendido) sin reentrenar ni cambiar de referencia.
- Accesibilidad y lectura de textos: conversión de texto a voz en cinco idiomas con control de pronunciación explícito (pinyin, CMU, kana) para resolver homógrafos y términos técnicos.
- Prototipado de producto de voz: la API Python (`IndexTTS2.infer`) y la web UI permiten iterar sobre prompts de referencia y parámetros de emoción sin infraestructura adicional más allá de una GPU NVIDIA.
- Generación de contenido multilingüe para marketing: un mismo locutor sintético puede producir mensajes en español y árabe manteniendo identidad de voz, útil para campañas regionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB según la model card, en precisión bf16.
- GPU recomendadas: se requiere una GPU NVIDIA; la información proporcionada no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- GPU de consumo: con ~6 GB de VRAM, el modelo es compatible con GPUs de consumo de gama media-alta con al menos 6 GB, aunque la información no confirma modelos concretos.
- Despliegue: el repositorio oficial usa `uv` para la instalación (`uv sync --all-extras`) y una API Python (`indextts.infer_v2_5.IndexTTS2`); también incluye una interfaz web (`uv run webui.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Descarga de pesos: vía Hugging Face (`hf download IndexTeam/IndexTTS-2.5`) o ModelScope (`modelscope download`).
- Latencia y throughput: la model card indica que infiere más rápido que IndexTTS-2, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación zero-shot | Control emocional | Licencia |
|---|---|---|---|---|---|
| IndexTTS-2.5 | ~0,8B (backbone GPT) | zh, en, ja, es, ar | Sí (un clip) | Vector 8D + texto (QwenEmotion) | bilibili-model-license |
| IndexTTS-2 | no disponible | no disponible (la card indica que 2.5 añade ja, es, ar) | Sí | no disponible | bilibili-model-license |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con IndexTTS-2, del que se indica que 2.5 añade japonés, español y árabe, infiere más rápido, incorpora control de velocidad y mejora el control de pronunciación. No se dispone de datos de benchmarks ni de especificaciones de terceros para una comparativa cuantitativa.

## Limitaciones y advertencias

- El texto largo se divide en segmentos que se concatenan con un silencio breve, por lo que la prosodia no se modela a través de los límites entre segmentos.
- El control emocional por descripción textual requiere el modelo QwenEmotion, cargado solo si se construye `IndexTTS2` con `use_qwen_emo=True`; pasar `use_emo_text=True` sin él provoca un error en inferencia.
- Activar el muestreo aleatorio de emoción (`use_random=True`) reduce la fidelidad de la clonación de voz.
- El modelo no verifica que el hablante del clip de referencia haya consentido la clonación; obtener ese consentimiento es responsabilidad del usuario.
- Riesgo de alucinación y artefactos en la síntesis: no se documentan métricas de calidad ni tasas de error en la información disponible.
- Sesgos: no se documentan sesgos específicos por idioma, género o acento en la información proporcionada.
- Restricciones de licencia: el uso está sujeto a la Bilibili Model Use License Agreement; deben revisarse los términos antes de un uso comercial.
- Requiere GPU NVIDIA y Python 3.10–3.11; no se documenta soporte para CPU ni para otras versiones de Python.
- Los modelos auxiliares (w2v-bert-2.0, MaskGCT, CAMPPlus, BigVGAN) se descargan en el primer arranque en `checkpoints/hf_cache/`, lo que añade dependencia de red y espacio en disco adicional.

## Enlaces

- Repositorio en Hugging Face (esta ficha): https://huggingface.co/chenzs/IndexTTS-2.5-Complete
- Repositorio oficial en Hugging Face: https://huggingface.co/IndexTeam/IndexTTS-2.5
- Repositorio en ModelScope: https://www.modelscope.cn/models/IndexTeam/IndexTTS-2.5
- Repositorio GitHub: https://github.com/index-tts/index-tts
- Paper (arXiv): https://arxiv.org/abs/2601.03888
