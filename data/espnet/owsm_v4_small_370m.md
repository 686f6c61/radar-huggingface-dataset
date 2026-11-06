# espnet/owsm_v4_small_370M

## Resumen

OWSM v4 small 370M es un modelo fundacional de voz a texto desarrollado por el equipo ESPnet (con autoría principal de Yifan Peng, CMU, y Shinji Watanabe) dentro de la familia Open Whisper-style Speech Model (OWSM). Reproduce y mejora el esquema de entrenamiento estilo Whisper de OpenAI empleando exclusivamente datos públicos y herramientas de código abierto (ESPnet), lo que lo convierte en una alternativa completamente abierta frente a Whisper. Esta variante concreta, presentada en INTERSPEECH 2025, es la versión "small" de OWSM v4 con 370 millones de parámetros.

El modelo resuelve tareas de reconocimiento de voz multilingüe, traducción de voz, identificación de idioma, predicción de marcas temporales a nivel de enunciado y reconocimiento o traducción de audio largo. Se entrenó sobre 320 000 horas de datos de voz públicos, con un conjunto de datos nuevo (YODAS OWSM v4) liberado junto al modelo. Frente a OWSM v3.1, la versión v4 mejora de forma significativa la identificación de idioma (LID) y el ASR multilingüe gracias a la ampliación y limpieza de datos.

Arquitectura encoder-decoder estilo Whisper con E-Branchformer en el codificador y submuestreo de features log-Mel de 8 veces (resolución final de 80 ms). Es relevante ahora porque demuestra que un modelo abierto de 370M puede cubrir un abanico amplio de idiomas y tareas de voz sin depender de datos propietarios, y porque existen conversiones GGUF para inferencia en CPU sin Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder estilo Whisper con E-Branchformer en el encoder y submuestreo 8x de features log-Mel (resolucion 80 ms) |
| Parametros totales | 370M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como ventana de tokens; decodifica segmentos de 30 s de audio a 16 kHz (con `decode_long` para grabaciones mas largas) |
| Tipos de cuantizacion | No disponible en la model card; existen builds GGUF (ver enlaces) para inferencia en CPU |
| Idiomas soportados | Multilingue (conjunto de idiomas concreto no detallado en la informacion disponible) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Pesos ESPnet (repo de 1,5 GB); conversiones GGUF externas disponibles |

## Arquitectura y entrenamiento

OWSM v4 sigue el paradigma encoder-decoder de Whisper: el audio se convierte en features log-Mel, el encoder las procesa y el decoder autoregresivo genera texto condicionado por símbolos de idioma (`<eng>`) y de tarea (`<asr>`, traduccion, LID, etc.). A diferencia de OWSM v3.1, v4 aplica submuestreo de 8 veces sobre las features log-Mel en lugar de 4, lo que reduce la resolución temporal del encoder a 80 ms y disminuye el coste computacional. El encoder emplea E-Branchformer, una variante que combina atención global con convoluciones locales para capturar dependencias de audio de forma eficiente.

El entrenamiento se realizó sobre 320 000 horas de voz pública, con un pipeline de escalado y limpieza de datos documentado en el paper de OWSM v4 (INTERSPEECH 2025). El dataset curado se publica como `espnet/yodas_owsmv4`. La formación cubre múltiples tareas de voz a texto de forma conjunta mediante etiquetas de tarea e idioma en la secuencia de salida, siguiendo el esquema multitarea de la familia OWSM. No se detalla en la información disponible si se aplicaron etapas de RLHF o DPO; al tratarse de un modelo de voz a texto, el entrenamiento es supervisado sobre transcripciones y traducciones.

## Capacidades

- Identificación de idioma (LID) a partir de audio.
- Reconocimiento automático de voz (ASR) multilingüe.
- Traducción de voz (speech translation) a texto.
- Predicción de marcas temporales a nivel de enunciado (utterance-level timestamps).
- Reconocimiento y traducción de audio largo mediante `decode_long`, que devuelve segmentos (inicio, fin, texto).
- Procesamiento de audio a 16 kHz con segmentos de 30 s, con padding o recorte automático.
- Decodificación con beam search configurable (`beam_size`).
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo especializado de voz a texto, no un LLM de propósito general.
- No se documentan capacidades de visión, audio generativo ni modo "thinking".

## Casos de uso

- Transcripción multilingüe por lotes: el modelo permite fijar el idioma de origen con `lang_sym` y procesar ficheros de 30 s con padding o recorte, adecuado para pipelines de subtitulado y actas de reuniones.
- Identificación automática de idioma en centros de contacto: usar la tarea LID para enrutar llamadas entrantes al agente o al modelo ASR del idioma correcto antes de transcribir.
- Traducción de voz a texto para subtítulos en directo: la tarea de speech translation permite generar subtítulos en otro idioma sin pipeline separado de ASR + traducción.
- Reconocimiento de audio largo: `decode_long` segmenta grabaciones de horas (entrevistas, clases, podcasts) en intervalos con marcas temporales, útil para indexación y búsqueda.
- Transcripción en CPU sin Python: las conversiones GGUF para audio.cpp permiten integrar el modelo en aplicaciones nativas o entornos sin intérprete de Python.
- Evaluación comparativa de modelos de voz abiertos: al ser reproducible con datos y toolkit públicos, sirve como baseline en investigación de ASR multilingüe y LID.
- Preprocesado para corpus de investigación: generar transcripciones y etiquetas de idioma sobre grabaciones nuevas antes de anotación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que OWSM v4 supera significativamente a OWSM v3.1 en LID y ASR multilingüe, pero no incluye cifras concretas (WER, BLEU, accuracy) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 370M parámetros, el peso en precisión completa ocupa del orden de 1,5 GB (tamaño del repo), por lo que la inferencia cabe holgadamente en GPUs de consumo, aunque no se documentan cifras oficiales de VRAM.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos unos pocos GB de memoria libre debería poder ejecutarlo; modelos mayores de la familia (1B) se usan en la demo Gradio oficial.
- Cabe en GPU de consumo: sí, por el tamaño del modelo (370M), aunque no hay datos oficiales de latencia o throughput.
- Opciones de despliegue: ESPnet (`espnet2.bin.s2t_inference.Speech2Text`) como vía oficial; conversiones GGUF para `audio.cpp` para inferencia en CPU sin Python (mantenidas fuera de ESPnet). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / segmento | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OWSM v4 small 370M | 370M | Segmentos de 30 s a 16 kHz; audio largo con `decode_long` | LID, ASR, traduccion, timestamps | CC-BY-4.0 | Hugging Face (espnet), GGUF externo |
| OWSM v4 base 102M | 102M | Segmentos de 30 s | LID, ASR, traduccion, timestamps | CC-BY-4.0 (segun familia) | Hugging Face (espnet) |
| OWSM v4 medium 1.02B | 1,02B | Segmentos de 30 s | LID, ASR, traduccion, timestamps | CC-BY-4.0 (segun familia) | Hugging Face (espnet), demo Gradio |
| OWSM v3.1 small 367M | 367M | Submuestreo 4x (resolucion mayor) | LID, ASR, traduccion, timestamps | CC-BY-4.0 (segun familia) | Hugging Face (espnet) |

Los datos de rendimiento comparativo entre estas variantes no están disponibles en la información proporcionada; la model card solo indica que v4 supera a v3.1 en LID y ASR multilingüe.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datos públicos de voz, puede heredar sesgos de dominio, acento y demografía presentes en dichos corpus.
- Riesgo de alucinación: no cuantificado; los modelos encoder-decoder de voz a texto pueden generar texto plausible no presente en el audio, especialmente con ruido o solapamiento de hablantes.
- Limitaciones de contexto: procesa segmentos de 30 s; para audio más largo es necesario usar `decode_long`, que segmenta internamente. El modelo espera audio a 16 kHz mono.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar el paper y el modelo conforme a la licencia.
- Caveat de producción: el autor recomienda `maxlenratio=1.0` (por defecto) en lugar de valores menores; reducir este valor puede degradar la calidad de decodificación.
- Los builds GGUF son producidos y mantenidos fuera de ESPnet, por lo que su calidad y actualización no están garantizadas por el equipo original.
- No se especifica la lista completa de idiomas cubiertos ni sus métricas por idioma, lo que dificulta evaluar su idoneidad para un idioma concreto sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espnet/owsm_v4_small_370M
- Paper OWSM v4 (INTERSPEECH 2025): https://arxiv.org/abs/2506.00338
- Paper OWSM v4 en ISCA Archive: https://www.isca-archive.org/interspeech_2025/peng25c_interspeech.html
- Paper OWSM v3.1/v3.2 (INTERSPEECH 2024): https://arxiv.org/pdf/2401.16658
- Paper sobre fuentes de datos heterogéneas (INTERSPEECH 2024): https://arxiv.org/pdf/2406.09282
- Paper OWSM-CTC (ACL 2024): https://aclanthology.org/2024.acl-long.549/
- Paper inicial OWSM: https://arxiv.org/abs/2309.13876
- Dataset YODAS OWSM v4: https://huggingface.co/datasets/espnet/yodas_owsmv4
- Página del proyecto OWSM: https://www.wavlab.org/activities/2024/owsm/
- Demo Gradio (modelo 1B): https://huggingface.co/spaces/espnet/owsm-v4
- Conversiones GGUF (audio.cpp): https://huggingface.co/audio-cpp/audio.cpp-gguf/tree/main/OWSM-GGUF
- Repositorio audio.cpp: https://github.com/0xShug0/audio.cpp
- Perfil del autor principal: https://pyf98.github.io/
- Premios ISCA: https://isca-speech.org/ISCA-Awards
