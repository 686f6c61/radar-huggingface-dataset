# espnet/owsm_v4_medium_1B

## Resumen

OWSM v4 medium (1B) es un modelo fundacional de voz a texto desarrollado por el laboratorio WavLab de la Universidad Carnegie Mellon (CMU) y publicado a través del ecosistema ESPnet. Forma parte de la familia Open Whisper-style Speech Model (OWSM), la primera reproducción completamente abierta del paradigma de entrenamiento de OpenAI Whisper, usando únicamente datos públicos y herramientas de código abierto. Esta variante concreta, firmada por Yifan Peng, cuenta con 1.020 millones de parámetros y se entrenó sobre 320.000 horas de audio multilingüe.

El modelo resuelve varias tareas de voz a texto en un único checkpoint: identificación de idioma (LID), reconocimiento automático del habla (ASR), traducción de voz (ST), predicción de marcas temporales a nivel de enunciado y reconocimiento o traducción de audio de formato largo. La versión v4 introduce mejoras sustanciales frente a OWSM v3.1 en LID y ASR multilingüe, gracias a la ampliación y limpieza del corpus de entrenamiento (YODAS), y aplica un subsampling de 8x sobre las features log-Mel, lo que reduce la resolución del encoder a 80 ms.

Su relevancia actual radica en que ofrece una alternativa reproducible y con licencia permisiva (CC-BY-4.0) a Whisper, con pesos, código y logs de entrenamiento públicos, lo que facilita la auditoría, la investigación y el despliegue comercial. El paper asociado ganó el Best Student Paper Award en INTERSPEECH 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (estilo Whisper) sobre ESPnet; subsampling 8x en features log-Mel, resolucion de encoder de 80 ms |
| Parametros totales | 1.020 millones (1.02B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de decodificacion de 30 s por llamada; soporte de audio largo mediante `decode_long` |
| Tipos de cuantizacion | GGUF disponible (conversion externa, `owsm-v4-medium-1b`, para audio.cpp); otras cuantizaciones no disponibles |
| Idiomas soportados | Multilingue (sin listado cerrado en la informacion disponible) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pesos ESPnet (`from_pretrained`); GGUF para inferencia en CPU via audio.cpp |

## Arquitectura y entrenamiento

OWSM v4 medium sigue una arquitectura encoder-decoder de tipo transformer inspirada en Whisper, implementada en ESPnet. El encoder procesa features log-Mel con un factor de subsampling de 8x (frente al 4x de OWSM v3.1), lo que da una resolución temporal de 80 ms. El decoder genera tokens con marcadores especiales de idioma y tarea (por ejemplo `<eng>` y `<asr>`), lo que permite conmutar entre ASR, traducción y LID con el mismo modelo.

El entrenamiento se realizó sobre 320.000 horas de audio público, incluyendo el corpus curado YODAS publicado como `espnet/yodas_owsmv4`. La contribución principal de la v4 es la ampliación y limpieza de datos, que según los autores mejora de forma significativa el LID y el ASR multilingüe frente a v3.1. No se detalla en la información disponible la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables habitualmente en ASR). La decodificación recomendada es con `beam_size=5` y `maxlenratio=1.0`.

## Capacidades

- Identificación de idioma (LID) a partir de audio.
- Reconocimiento automático del habla (ASR) multilingüe.
- Traducción de voz (speech translation) a texto.
- Predicción de marcas temporales a nivel de enunciado (utterance-level timestamps).
- Reconocimiento y traducción de audio de formato largo mediante `decode_long`.
- Procesamiento de audio a 16 kHz con ventana de 30 s por llamada (padding o truncado automático).
- Conmutación de tarea e idioma mediante símbolos especiales (`<eng>`, `<asr>`, etc.).
- Inferencia en CPU sin Python mediante builds GGUF externos (audio.cpp).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Subtitulado automático multilingüe: el modelo puede transcribir audio de 30 s por llamada y encadenar segmentos con `decode_long` para generar subtítulos con marcas temporales a nivel de enunciado, útil en plataformas de vídeo.
- Traducción de reuniones y conferencias: usando el marcador de tarea `<st>` (traducción de voz) sobre el mismo checkpoint, se puede transcribir y traducir en una sola pasada sin pipeline separado de ASR + MT.
- Enrutado por idioma en centros de atención telefónica: la capacidad de LID permite clasificar llamadas entrantes por idioma antes de derivarlas al agente o al modelo ASR específico.
- Transcripción de archivos de audio largos (podcasts, entrevistas, audiencias): `decode_long` gestiona grabaciones de duración arbitraria segmentando internamente, con marcas temporales para indexación y búsqueda.
- Investigación en modelos fundacionales de voz: al ser completamente abierto (pesos, código, logs y dataset YODAS), sirve como baseline reproducible para experimentos de ASR/ST y para estudiar el efecto de la curación de datos.
- Despliegue en entornos sin GPU: las conversiones GGUF para audio.cpp permiten ejecutar el modelo en CPU, adecuado para prototipos, dispositivos edge o entornos con restricciones de hardware.
- Generación de datasets etiquetados: el modelo puede pseudo-etiquetar grandes volúmenes de audio con transcripción, idioma y timestamps para entrenar modelos más pequeños o específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica cualitativamente que OWSM v4 supera de forma significativa a OWSM v3.1 en LID y ASR multilingüe, pero no incluye cifras concretas (WER, BLEU, accuracy) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 4 GB solo para pesos (1.02B parámetros), más overhead de activaciones y del runtime ESPnet; se recomienda al menos 8 GB para operar con comodidad.
- En FP16/BF16: aproximadamente 2 GB de pesos, más overhead; cabe en GPUs consumer de gama media.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4090) para inferencia interactiva; A100/H100 para procesamiento por lotes de alto throughput.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM; también en CPU mediante los builds GGUF de audio.cpp.
- Opciones de despliegue: ESPnet (`espnet2.bin.s2t_inference.Speech2Text`), demo Gradio en Hugging Face Spaces, audio.cpp con GGUF para CPU. No se documenta soporte nativo de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OWSM v4 medium (este) | 1.02B | 30 s por llamada, audio largo via `decode_long` | LID, ASR, ST, timestamps | CC-BY-4.0 | Pesos + GGUF + demo |
| OWSM v3.1 medium | 1.02B | 30 s, subsampling 4x | LID, ASR, ST, timestamps | CC-BY-4.0 | Hugging Face (espnet) |
| OWSM v4 small | 370M | 30 s | LID, ASR, ST, timestamps | CC-BY-4.0 | Hugging Face (espnet) |
| OWSM v4 base | 102M | 30 s | LID, ASR, ST, timestamps | CC-BY-4.0 | Hugging Face (espnet) |

La comparación con Whisper de OpenAI no se incluye con cifras porque la información proporcionada no aporta resultados de benchmarks que permitan contrastar rendimiento; la diferencia principal es la apertura total (datos, código y logs) y la licencia CC-BY-4.0 frente a la licencia de OpenAI.

## Limitaciones y advertencias

- Ventana fija de 30 s por llamada: para audio más largo es obligatorio usar `decode_long`, que segmenta internamente; un uso incorrecto puede producir cortes en fronteras de palabra.
- Idioma: aunque el modelo es multilingüe, la información disponible no detalla la lista de idiomas cubiertos ni su cobertura por idioma; el rendimiento puede variar mucho entre lenguas.
- Riesgo de alucinación: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente en segmentos con ruido, silencio o música.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre datos públicos de internet, es esperable que herede sesgos de dominio, acento y demografía.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar el paper y respetar los términos de atribución.
- Dependencia del ecosistema ESPnet: la inferencia estándar requiere la librería ESPnet; las builds GGUF son mantenidas por terceros (audio.cpp) y no por el equipo original, lo que implica un riesgo de mantenimiento.
- `maxlenratio=1.0` es el valor recomendado; valores menores pueden degradar la calidad de la transcripción según la model card.
- No se documentan capacidades de tool calling, agentes ni multimodalidad más allá del audio de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espnet/owsm_v4_medium_1B
- Repositorio de archivos: https://huggingface.co/espnet/owsm_v4_medium_1B/tree/main
- Paper OWSM v4 (INTERSPEECH 2025): https://arxiv.org/abs/2506.00338
- Actas ISCA del paper OWSM v4: https://www.isca-archive.org/interspeech_2025/peng25c_interspeech.html
- Premios ISCA: https://isca-speech.org/ISCA-Awards
- Pagina del proyecto OWSM: https://www.wavlab.org/activities/2024/owsm/
- Demo Gradio: https://huggingface.co/spaces/espnet/owsm-v4
- Dataset YODAS OWSM v4: https://huggingface.co/datasets/espnet/yodas_owsmv4
- Paper OWSM v3.1/v3.2 (heterogeneous data): https://arxiv.org/pdf/2406.09282
- Paper OWSM v3.1 (E-Branchformer): https://arxiv.org/pdf/2401.16658
- Paper OWSM-CTC (ACL 2024): https://aclanthology.org/2024.acl-long.549
- Paper inicial OWSM (arXiv 2309.13876): https://arxiv.org/abs/2309.13876
- Builds GGUF externos: https://huggingface.co/audio-cpp/audio.cpp-gguf/tree/main/OWSM-GGUF
- Repositorio audio.cpp: https://github.com/0xShug0/audio.cpp
- Perfil del autor Yifan Peng: https://pyf98.github.io/
