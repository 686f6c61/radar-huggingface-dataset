# gongming0707/IndexTTS-2.5

## Resumen

IndexTTS-2.5 es un modelo de síntesis de voz (text-to-speech) zero-shot desarrollado por IndexTeam (Bilibili) que clona una voz a partir de un único clip de audio de referencia. Su arquitectura es autorregresiva: un backbone GPT de aproximadamente 0,8B de parámetros, un decodificador de voz a mel basado en flow-matching y un vocoder BigVGAN que genera la forma de onda final a 22,05 kHz. La voz clonada y la emoción se modelan de forma desacoplada del timbre, lo que permite transferir una emoción concreta manteniendo la identidad vocal del hablante de referencia.

El modelo amplía la versión anterior (IndexTTS-2) con tres idiomas nuevos (japonés, español y árabe), inferencia más rápida, control de velocidad de habla y una mejora en el control de pronunciación para pinyin chino, fonemas CMU del inglés y kana japonés. Admite además un vector de emoción de ocho dimensiones (felicidad, enfado, tristeza, miedo, asco, melancolía, sorpresa y calma), lo que lo hace adecuado para doblaje y producción de audio con matices interpretativos controlables desde código.

Es relevante porque cubre un hueco habitual en TTS zero-shot: el control fino de pronunciación y emoción sin reentrenar, con soporte multilingüe y transferencia de voz entre idiomas. El repositorio consultado (gongming0707/IndexTTS-2.5) es una réplica de 5,5 GB con 0 descargas y 0 likes; la model card apunta como origen oficial al repositorio IndexTeam/IndexTTS-2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo zero-shot: backbone GPT + decodificador voz-a-mel con flow-matching + vocoder BigVGAN |
| Parametros totales | ~0,8B (backbone GPT, según la model card); el total del sistema con decodificador y vocoder no está desglosado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS; el texto largo se divide en segmentos) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y la inferencia admite bf16 (`use_bf16=True`) |
| Idiomas soportados | chino (zh), inglés (en), japonés (ja), español (es), árabe (ar) |
| Licencia | bilibili-model-license (campo `license: other` en HuggingFace) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 22,05 kHz |
| Tamaño del repositorio | 5,5 GB |
| Pipeline declarado | text-to-speech |
| Librería | indextts |

## Arquitectura y entrenamiento

El sistema combina tres componentes: un backbone GPT autorregresivo que modela la secuencia de tokens de habla, un decodificador de voz a mel basado en flow-matching y un vocoder BigVGAN que convierte el mel en forma de onda a 22,05 kHz. El condicionamiento de hablante se obtiene de un clip de audio de referencia, lo que permite clonación zero-shot sin ajuste por hablante. La emoción se representa como un vector de ocho componentes `[happy, angry, sad, afraid, disgusted, melancholic, surprised, calm]`, desacoplado del timbre, de modo que es posible aplicar una emoción distinta a la del audio de referencia.

Respecto a IndexTTS-2, esta versión añade japonés, español y árabe, infiere más rápido, incorpora control de velocidad de habla mediante `duration_factor` (rango válido 0,5-2,0, donde valores superiores a 1,0 ralentizan) y mejora el control de pronunciación con la sintaxis `<word|reading>` para pinyin chino, fonemas CMU del inglés y kana japonés. La model card no detalla el número de horas de audio de entrenamiento, la composición del dataset ni si se emplearon etapas de RLHF o DPO; se remite al informe técnico arXiv:2601.03888 para esos datos. El modelo requiere modelos auxiliares que no forman parte del repositorio (w2v-bert-2.0, el códec semántico de MaskGCT, CAMPPlus y BigVGAN), que se descargan automáticamente en `checkpoints/hf_cache/` en la primera ejecución. Para el control de emoción a partir de una descripción textual se necesita el modelo QwenEmotion, que solo se carga si se construye `IndexTTS2` con `use_qwen_emo=True`.

## Capacidades

- Generación de voz a partir de texto en cinco idiomas: chino, inglés, japonés, español y árabe.
- Clonación de voz zero-shot desde un único clip de audio de referencia.
- Transferencia de voz entre idiomas (cross-lingual): referencia en un idioma y texto en otro.
- Control de emoción mediante un vector de ocho dimensiones desacoplado del timbre.
- Control de emoción a partir de descripción textual, condicionado a la carga de QwenEmotion (`use_qwen_emo=True`).
- Control de pronunciación con anotaciones `<palabra|lectura>`: pinyin en chino, fonemas CMU en inglés y kana en japonés.
- Control de velocidad de habla mediante `duration_factor` en el rango 0,5-2,0.
- Salida de audio a 22,05 kHz.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia para el condicionamiento de hablante.

## Casos de uso

- Doblaje multilingüe: se clona la voz de un actor desde un clip y se generan versiones en japonés, español o árabe con la misma identidad vocal, aplicando el vector de emoción para alinear la interpretación con la escena original.
- Audiolibros y narración larga: el texto se divide en segmentos y se sintetiza con una voz clonada concreta; el control de `duration_factor` permite ajustar el ritmo de lectura por capítulo o por tipo de contenido.
- Asistentes de voz con marca propia: se fija una voz corporativa a partir de una grabación de referencia y se generan respuestas habladas en varios idiomas con el mismo timbre, sin reentrenamiento por idioma.
- Corrección de pronunciación en contenido educativo: la sintaxis `<palabra|lectura>` permite forzar la lectura correcta de términos ambiguos, nombres propios o tecnicismos en chino (pinyin), inglés (CMU) y japonés (kana).
- Producción de videojuegos y personajes: cada personaje puede tener su propia voz clonada y modular la emoción por línea de diálogo con el vector de ocho componentes, útil para prototipado rápido de voces antes de contratar actores.
- Accesibilidad y lectura de documentos: conversión de texto a voz personalizada para usuarios que quieran conservar una voz de referencia (por ejemplo, preservación de voz en pacientes con pérdida del habla), sujeto a la licencia y al consentimiento del hablante original.
- Localización de pódcast y anuncios: generación de versiones en varios idiomas del mismo contenido manteniendo la voz del locutor original y ajustando la velocidad para encajar en una duración objetivo.
- Sistemas de atención al cliente con voz sintética fija: respuestas de voz consistentes en varios idiomas a partir de una única referencia, integrable en el pipeline mediante la API Python de `indextts`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente afirma de forma cualitativa que IndexTTS-2.5 infiere más rápido que IndexTTS-2 y mejora la controlabilidad de pinyin chino, fonemas CMU ingleses y kana japonesa, sin aportar cifras de latencia, RTF, MOS ni comparativas numéricas. Los datos de evaluación deberían consultarse en el informe técnico arXiv:2601.03888.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB según la model card.
- GPU: se requiere una GPU NVIDIA; la model card no especifica modelos concretos.
- Compatibilidad con GPU de consumo: con ~6 GB de VRAM el modelo es apto para tarjetas de gama media-alta con al menos 8 GB (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores). No se documenta soporte de CPU ni de Apple Silicon.
- Entorno de software: Python 3.10-3.11 y gestión de dependencias con `uv` (`uv sync --all-extras`).
- Modelos auxiliares: w2v-bert-2.0, el códec semántico de MaskGCT, CAMPPlus y BigVGAN se descargan aparte en `checkpoints/hf_cache/`; el modelo QwenEmotion solo si se usa emoción por texto. Su consumo adicional de VRAM no está cuantificado en la información disponible.
- Formas de despliegue documentadas: script de inferencia en Python (`from indextts.infer_v2_5 import IndexTTS2`) y interfaz web (`uv run webui.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado cifras de RTF ni de caracteres por segundo.

## Comparativa con modelos similares

| Modelo | Desarrollador | Tipo | Parametros | Idiomas | Licencia |
|---|---|---|---|---|---|
| IndexTTS-2.5 | IndexTeam, Bilibili | TTS autorregresivo zero-shot (GPT + flow-matching + BigVGAN) | ~0,8B (backbone GPT) | zh, en, ja, es, ar | bilibili-model-license |
| IndexTTS-2 | IndexTeam, Bilibili | TTS autorregresivo zero-shot | no disponible | no disponible; la model card indica que 2.5 añade ja, es y ar respecto a esta versión | bilibili-model-license |
| XTTS-v2 | Coqui | TTS zero-shot multilingüe | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada |
| CosyVoice 2 | no disponible en la información proporcionada | TTS | no disponible | no disponible | no disponible |
| F5-TTS | no disponible en la información proporcionada | TTS zero-shot | no disponible | no disponible | no disponible |

Solo se dispone de datos verificados para IndexTTS-2.5 y para la comparación cualitativa con IndexTTS-2 que aparece en su propia model card. Los datos de las alternativas no estaban presentes en la información proporcionada ni en los resultados de la búsqueda web, por lo que se marcan como no disponibles en lugar de estimarse.

## Limitaciones y advertencias

- El texto largo se divide en segmentos que se concatenan con un breve silencio, por lo que la prosodia no se modela a través de las fronteras entre segmentos.
- El control de emoción a partir de una descripción textual requiere el modelo QwenEmotion: si se pasa `use_emo_text=True` sin haber construido el modelo con `use_qwen_emo=True`, la inferencia falla.
- Activar el muestreo aleatorio de emoción (`use_random=True`) reduce la fidelidad de la clonación de voz.
- El modelo no verifica que el hablante del clip de referencia haya consentido la clonación; obtener ese consentimiento es responsabilidad del usuario.
- La licencia es la bilibili Model Use License Agreement, una licencia no estándar (`license: other`). No se dispone del texto de los términos en la información proporcionada, por lo que es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Requiere GPU NVIDIA: no se documenta soporte de CPU ni de hardware de Apple, lo que condiciona el despliegue en entornos sin GPU dedicada.
- No se han publicado benchmarks, métricas de MOS ni comparativas objetivas con otros sistemas TTS en la información disponible, lo que dificulta la evaluación previa a producción.
- El repositorio consultado (gongming0707/IndexTTS-2.5) registra 0 descargas y 0 likes y es una réplica; para uso real conviene verificar el repositorio oficial IndexTeam/IndexTTS-2.5 y la integridad de los pesos.
- El repositorio ocupa 5,5 GB, pero los modelos auxiliares se descargan por separado y añaden requisitos de almacenamiento y de red en el primer arranque.

## Enlaces

- Repositorio de HuggingFace consultado: https://huggingface.co/gongming0707/IndexTTS-2.5
- Repositorio oficial citado en la model card: https://huggingface.co/IndexTeam/IndexTTS-2.5
- Repositorio de código: https://github.com/index-tts/index-tts
- Informe técnico: https://arxiv.org/abs/2601.03888
- Licencia del modelo: fichero LICENSE del repositorio (bilibili Model Use License Agreement)
- Descarga alternativa vía ModelScope: `modelscope download --model IndexTeam/IndexTTS-2.5 --local_dir checkpoints`
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos correspondían a consultas sobre PotPlayer y Notepad++ y no guardan relación con IndexTTS-2.5.
