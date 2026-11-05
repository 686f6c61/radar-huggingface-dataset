# PrinceAlhassanNasamu/tekyerema-asr-dag

## Resumen

Tɛkyerɛma ASR Dagbani es un modelo de reconocimiento automático del habla (ASR) especializado en dagbani (`dag`), una lengua gur hablada principalmente en el norte de Ghana. Lo desarrolla Prince Nasamu Alhassan (PrinceAlhassanNasamu) como parte del servicio lingüístico Tɛkyerɛma / Nexus, y se publica bajo licencia CC BY 4.0. El modelo parte del checkpoint multilingüe de Khaya AI `w2v-bert-gjn_maw_gur_dag_dga_kus_lxn_wlx_xon_xsm_en` (Apache-2.0), un w2v-BERT 2.0 entrenado sobre varias lenguas gur, y se afina con una cabeza CTC sobre el split de entrenamiento de WAXAL Dagbani.

La relevancia del modelo está en que ataca un idioma con muy poca cobertura en sistemas ASR comerciales: el dagbani no figura en los catálogos habituales de reconocimiento de voz y los recursos anotados son escasos. El ajuste fino sobre 45,3 horas de audio reduce el WER en el conjunto de test de WAXAL Dagbani de 0,872 a 0,358, una mejora de más de 50 puntos absolutos respecto al checkpoint base, y el CER de 0,335 a 0,122.

Técnicamente es un modelo compacto (605,7 millones de parámetros, 2,4 GB en safetensors), con arquitectura w2v-BERT 2.0 y decodificación CTC, lo que lo hace desplegable en hardware modesto. No es un modelo de propósito general: es un componente de ASR monoidioma pensado para integrarse en pipelines de transcripción, subtitulado o interfaces de voz en dagbani.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | w2v-BERT 2.0 con cabeza CTC (transformer convolucional auto-supervisado + clasificador CTC) |
| Parametros totales | 605.730.675 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente de la configuración de inferencia; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión original; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | dagbani (`dag`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (repositorio de 2,4 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre w2v-BERT 2.0, una arquitectura que combina un extractor convolucional de características con un codificador transformer entrenado de forma auto-supervisada mediante objetivos de enmascaramiento tipo w2v y de predicción contrastiva tipo BERT. Sobre ese codificador se añade una cabeza lineal de clasificación CTC para la transcripción de caracteres o subpalabras. El checkpoint base de Khaya AI es multilingüe para varias lenguas gur (gjn, maw, gur, dag, dga, kus, lxn, wlx, xon, xsm) e incluye inglés, lo que proporciona al modelo un punto de partida con representaciones acústicas ya adaptadas a fonologías próximas al dagbani.

El ajuste fino se realizó con CTC sobre el split de entrenamiento de WAXAL Dagbani (`google/WaxalNLP`, `data/ASR/dag`), procedente de la Universidad de Ghana y con licencia CC-BY-4.0: 9.273 clips que suman 45,3 horas de audio. El entrenamiento constó de 2.751 pasos, ejecutado el 18 de octubre de 2026 en una GPU Kaggle T4 dentro de la campaña `campaign/kaggle/asr-lang-v1-dag`. La model card no documenta el uso de RLHF, DPO ni otras fases de alineación, ni detalla hiperparámetros como tasa de aprendizaje, tamaño de lote o política de aumento de datos.

## Capacidades

- Reconocimiento automático del habla en dagbani a partir de audio (se asume muestreo a 16 kHz, como indica el ejemplo de la model card).
- Transcripción de voz a texto con salida de caracteres mediante decodificación CTC.
- Integración directa con la pipeline `automatic-speech-recognition` de Transformers.
- Adaptación a un dominio concreto de datos (WAXAL Dagbani, corpus de la Universidad de Ghana), lo que mejora el rendimiento en ese tipo de audio.
- No soporta tool calling, function calling, razonamiento multi-paso ni comportamiento de agente: es un modelo puramente acústico.
- No dispone de capacidades de visión, audio generativo, traducción ni diálogo.
- Capacidad multilingüe limitada al dagbani en la práctica, aunque el checkpoint base fuese multilingüe.

## Casos de uso

- Transcripción de reuniones y actas comunitarias en dagbani: el modelo convierte grabaciones de audio en texto para documentación administrativa o comunitaria, aprovechando su ajuste específico sobre habla dagbani y su bajo coste computacional.
- Subtitulado de vídeo y audio local: generación de subtítulos automáticos para contenido en dagbani en medios locales, con la salvedad de que el WER de 0,358 exige revisión humana.
- Interfaces de voz para servicios públicos: dictado o comandos de voz en dagbani en aplicaciones de atención ciudadana, integrándolo como componente ASR previo a un módulo de comprensión.
- Investigación lingüística y documentación: transcripción asistida de corpus orales para estudios fonéticos o léxicos, con corrección posterior por anotadores.
- Evaluación comparativa de ASR de bajos recursos: sirve como referencia reproducible para medir el efecto del ajuste fino sobre un checkpoint multilingüe gur en WAXAL Dagbani.
- Digitalización de archivos sonoros: procesamiento por lotes de grabaciones históricas o radiofónicas en dagbani para indexación y búsqueda textual, dado que el modelo cabe en una GPU de consumo.
- Sistemas de accesibilidad: conversión de voz a texto en tiempo casi real para personas con discapacidad auditiva en entornos dagbani, siempre con margen de error asumido.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los de WER y CER antes y después del ajuste fino, sobre conjuntos de evaluación de 150 clips cada uno:

| Conjunto de evaluacion | WER antes | WER despues | CER antes | CER despues |
|---|---|---|---|---|
| WAXAL Dagbani test | 0,872 | 0,358 | 0,335 | 0,122 |
| GhanaNLP bible_Dagbani (ghana-speech-eval) | 0,684 | 0,601 | 0,253 | 0,210 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con otros sistemas ASR de dagbani.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 605,7 millones de parámetros ocupan aproximadamente 2,4 GB de pesos; con overhead de activaciones y audio, un entorno de 4-6 GB de VRAM es suficiente. En fp16 el peso baja a unos 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el propio autor entrenó en una Kaggle T4 (16 GB), que es holgada para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida, aunque la latencia será mayor.
- Opciones de despliegue: pipeline de Transformers (`automatic-speech-recognition`), servidores de inferencia compatibles con modelos CTC de Hugging Face; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no están orientados a ASR.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| Tɛkyerɛma ASR Dagbani (este modelo) | 605,7 M | no disponible | dag | CC BY 4.0 | WER 0,358 en WAXAL Dagbani test |
| KhayaAI/w2v-bert-gjn_maw_gur_dag_dga_kus_lxn_wlx_xon_xsm_en (base) | no disponible | no disponible | varias lenguas gur + en | Apache-2.0 | WER 0,872 en WAXAL Dagbani test (antes del ajuste) |
| Otros ASR de dagbani | no disponible | no disponible | dag | no disponible | no disponible |

No se dispone de información sobre modelos alternativos específicos de ASR en dagbani con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El WER de 0,358 en el conjunto de test de WAXAL Dagbani sigue siendo alto para producción sin revisión humana; el modelo no es apto para transcripción automática sin supervisión en contextos críticos.
- El rendimiento cae fuera del dominio WAXAL: en GhanaNLP bible_Dagbani el WER solo baja de 0,684 a 0,601, lo que indica una generalización limitada a otros corpus y condiciones acústicas.
- Entrenado únicamente con 45,3 horas de audio de un solo corpus, lo que aumenta el riesgo de sobreajuste al estilo de grabación, micrófonos y hablantes de WAXAL.
- Sesgos conocidos: no documentados por el autor; cabe esperar sesgo hacia la variedad dialectal y el perfil de hablantes presentes en WAXAL Dagbani.
- El modelo solo transcribe dagbani; no traduce ni responde en otros idiomas.
- Licencia CC BY 4.0: permite uso comercial con atribución obligatoria a Khaya AI, al proyecto WAXAL/WaxalNLP y a la Universidad de Ghana, y a Tɛkyerɛma (Prince Nasamu Alhassan). Es necesario conservar y mostrar esos créditos.
- No se documentan cuantizaciones ni formatos alternativos, lo que limita el despliegue en entornos sin soporte de safetensors.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PrinceAlhassanNasamu/tekyerema-asr-dag
- Modelo base: https://huggingface.co/KhayaAI/w2v-bert-gjn_maw_gur_dag_dga_kus_lxn_wlx_xon_xsm_en
- Dataset WAXAL: https://huggingface.co/datasets/google/WaxalNLP
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales del autor.
