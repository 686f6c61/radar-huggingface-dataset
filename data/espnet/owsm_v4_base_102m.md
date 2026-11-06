# espnet/owsm_v4_base_102M

## Resumen

OWSM v4 base (102M) es un modelo fundacional de voz a texto de tipo encoder-decoder, desarrollado por el grupo ESPnet (concretamente por Yifan Peng, CMU, junto con Shinji Watanabe y colaboradores) y publicado bajo licencia CC-BY-4.0. Forma parte de la serie Open Whisper-style Speech Model (OWSM), cuyo objetivo es reproducir y mejorar el enfoque de entrenamiento de Whisper utilizando exclusivamente datos públicos y herramientas de código abierto. Este modelo concreto es la variante "base" de la cuarta generación, con 102 millones de parámetros y entrenado sobre 320.000 horas de audio.

El modelo resuelve tareas de conversión de voz a texto de forma unificada: identificación de idioma (LID), reconocimiento automático del habla (ASR), traducción de voz, predicción de marcas temporales a nivel de enunciado y reconocimiento o traducción de audio de larga duración. A diferencia de Whisper, todos los pesos, datos de entrenamiento y logs están disponibles públicamente, lo que lo convierte en una alternativa auditable y reproducible para investigación en modelos fundacionales de voz.

La relevancia actual de OWSM v4 radica en que mejora significativamente a OWSM v3.1 en LID y ASR multilingüe, e introduce un subsampling de 8x (frente a 4x en v3.1) sobre las características log-Mel, lo que reduce la resolución final del encoder a 80 ms y abarata el coste computacional de la inferencia. El paper asociado ganó el Best Student Paper Award en INTERSPEECH 2025.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (estilo Whisper), encoder con subsampling 8x sobre log-Mel |
| Parámetros totales | 102M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 s por llamada (ventana de audio); decodificación de audio largo mediante `decode_long` |
| Tipos de cuantización | no disponible (existe conversión GGUF externa en audio-cpp/audio.cpp-gguf) |
| Idiomas soportados | multilingüe (sin lista explícita de idiomas en la información disponible) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | pesos ESPnet (librería `espnet`); conversión GGUF disponible externamente |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura encoder-decoder de estilo Whisper, implementada en ESPnet. El encoder procesa características log-Mel con un factor de subsampling de 8x (frente al 4x de OWSM v3.1), lo que da una resolución temporal final de 80 ms. El decoder genera texto con tokens especiales de idioma y tarea (por ejemplo `<eng><asr>`), lo que permite usar un único modelo para LID, ASR y traducción seleccionando el símbolo adecuado en inferencia.

El entrenamiento se realizó sobre 320.000 horas de audio público, incluyendo el conjunto de datos curado y publicado como `espnet/yodas_owsmv4`. La serie OWSM v4 se centra en el escalado y limpieza de datos para mejorar el rendimiento multilingüe. No se detalla en la información proporcionada si se aplicaron etapas de RLHF o DPO (no disponible). La innovación técnica principal es la combinación de un único modelo multitarea con tokens de control de idioma y tarea, junto con el subsampling agresivo del encoder para reducir coste.

## Capacidades

- Identificación de idioma (LID) a partir de audio.
- Reconocimiento automático del habla (ASR) multilingüe.
- Traducción de voz (speech translation) a texto.
- Predicción de marcas temporales a nivel de enunciado (utterance-level timestamps).
- Reconocimiento y traducción de audio de larga duración mediante `decode_long`.
- Procesamiento de audio a 16 kHz, con ventanas de 30 s por llamada (recorte o padding automático).
- Selección de idioma y tarea mediante tokens especiales (`lang_sym`, `task_sym`).
- Inferencia con beam search configurable (`beam_size`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Transcripción multilingüe por lotes: el modelo acepta `lang_sym` explícito y procesa ventanas de 30 s, lo que permite transcribir grandes volúmenes de audio con un pipeline ESPnet reproducible.
- Subtitulado automático de vídeo: la predicción de marcas temporales a nivel de enunciado facilita la generación de subtítulos sincronizados.
- Detección de idioma en centros de contacto: usar la tarea LID para enrutar llamadas entrantes al agente o cola adecuada antes de transcribir.
- Traducción de voz en reuniones: con `task_sym` de traducción, se puede convertir audio en un idioma a texto en otro, útil para actas multilingües.
- Investigación reproducible en modelos fundacionales de voz: al liberarse pesos, datos y logs, sirve como baseline auditable para experimentos de ASR y LID.
- Despliegue en CPU o entornos sin Python: la conversión GGUF mantenida externamente permite ejecutar el modelo con audio.cpp en hardware modesto.
- Transcripción de audio largo (entrevistas, conferencias): `decode_long` gestiona grabaciones de más de 30 s devolviendo segmentos con marcas de inicio y fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que OWSM v4 supera significativamente a OWSM v3.1 en LID y ASR multilingüe, pero no se proporcionan cifras concretas (WER, MMLU, etc.) en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 102M parámetros el modelo es ligero y cabe holgadamente en GPUs de consumo, pero no se aportan cifras exactas.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna debería ser suficiente.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 102M parámetros, aunque no se confirma con cifras oficiales.
- Opciones de despliegue: ESPnet (`espnet2.bin.s2t_inference.Speech2Text`), GGUF con audio.cpp (conversión externa), demo Gradio oficial (que ejecuta el modelo de 1B, no este).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| OWSM v4 base (este modelo) | 102M | 30 s por llamada, audio largo vía `decode_long` | CC-BY-4.0 | Hugging Face (espnet) |
| OWSM v3.1 base | 101M | 30 s por llamada | CC-BY-4.0 | Hugging Face (espnet/owsm_v3.1_ebf_base) |
| OWSM v4 small | 370M | 30 s por llamada | CC-BY-4.0 | Hugging Face (espnet/owsm_v4_small_370M) |
| OWSM v4 medium | 1.02B | 30 s por llamada | CC-BY-4.0 | Hugging Face (espnet/owsm_v4_medium_1B) |

No se dispone de datos de rendimiento comparativo (WER, LID accuracy) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; el entrenamiento sobre datos públicos puede heredar sesgos de acentos, géneros y dominios presentes en el corpus.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos encoder-decoder de voz a texto pueden generar texto plausible en tramos de silencio o ruido.
- Limitaciones de contexto: cada llamada procesa 30 s; para audio más largo es necesario usar `decode_long`, y se recomienda `maxlenratio=1.0` en lugar de valores menores.
- Limitaciones de idioma: el modelo es multilingüe pero no se detalla la lista de idiomas cubiertos ni la cobertura por idioma.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; debe conservarse la atribución a ESPnet y a los autores.
- Caveats para producción: la librería ESPnet tiene una API distinta de Transformers; la conversión GGUF es mantenida fuera de ESPnet y no está garantizada por el autor original; el demo Gradio oficial ejecuta el modelo de 1B, no esta variante base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espnet/owsm_v4_base_102M
- Página del proyecto OWSM: https://www.wavlab.org/activities/2024/owsm/
- Demo Gradio (modelo 1B): https://huggingface.co/spaces/espnet/owsm-v4
- Dataset de entrenamiento: https://huggingface.co/datasets/espnet/yodas_owsmv4
- Paper OWSM v4 (INTERSPEECH 2025): https://www.isca-archive.org/interspeech_2025/peng25c_interspeech.html
- Premios ISCA: https://isca-speech.org/ISCA-Awards
- Paper OWSM v3.1 (arXiv): https://arxiv.org/pdf/2401.16658
- Paper OWSM v3.2 (arXiv): https://arxiv.org/pdf/2406.09282
- Paper OWSM-CTC (ACL 2024): https://aclanthology.org/2024.acl-long.549
- Conversiones GGUF (externas): https://huggingface.co/audio-cpp/audio.cpp-gguf/tree/main/OWSM-GGUF
- Repositorio audio.cpp: https://github.com/0xShug0/audio.cpp
- Perfil del autor principal: https://pyf98.github.io/
