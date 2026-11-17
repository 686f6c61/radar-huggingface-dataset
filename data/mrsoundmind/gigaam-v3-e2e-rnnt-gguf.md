# mrsoundmind/gigaam-v3-e2e-rnnt-gguf

## Resumen

GigaAM-v3-e2e-rnnt-gguf es la conversión a formato GGUF del modelo `ai-sage/GigaAM-v3` en su variante `e2e_rnnt`, publicada por el usuario mrsoundmind para su uso con la librería transcribe.cpp. Se trata de un sistema de reconocimiento automático del habla (ASR) especializado exclusivamente en ruso, desarrollado originalmente por el equipo de Sber (ai-sage) como tercera generación de la familia GigaAM. El modelo combina un encoder Conformer de 16 capas con una cabeza transductora RNN-T y devuelve texto en ruso con mayúsculas, puntuación y normalización, sin necesidad de un modelo de lenguaje externo.

Con 222.518.657 parámetros, el modelo es lo bastante compacto como para ejecutarse en CPU y GPU de consumo, y las cuantizaciones publicadas van desde 849 MB en F32 hasta 175 MB en Q4_K_M. Su relevancia actual radica en que ofrece una alternativa open source (licencia MIT) de altas prestaciones para ASR en ruso, un idioma tradicionalmente mal cubierto por los modelos multilingües genéricos, y en que su integración en transcribe.cpp permite despliegues locales sin dependencias de Python ni de servicios en la nube.

El modelo está pensado para audio corto: cada utterance debe durar 25 segundos o menos. No soporta streaming, no traduce y no detecta idioma. Estas restricciones lo sitúan como una pieza de transcripción offline para pipelines por lotes o aplicaciones de dictado, no como un motor de subtitulado en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) + cabeza RNN-T |
| Parametros totales | 222.518.657 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; audio de entrada limitado a 25 s por utterance |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | GGUF |
| Tokenizer | SentencePiece de 1024 piezas |
| Entrada de audio | WAV mono a 16 kHz |
| Decodificacion | RNN-T voraz (greedy) |
| Streaming | no |
| Timestamps | a nivel de token |
| Tamano del repo | 0.3 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Conformer, es decir, un transformer que intercala bloques de auto-atención con convoluciones depthwise para capturar dependencias locales y globales en la señal acústica. El encoder de 16 capas se combina con una cabeza RNN-T (transductor recurrente) que modela conjuntamente la alineación entre frames de audio y tokens de texto, lo que permite decodificación voraz sin modelo de lenguaje externo. La variante `e2e_rnnt` está entrenada para producir directamente texto con puntuación y normalización, a diferencia de las variantes `ctc` y `rnnt` puras.

Según la model card original de ai-sage, la familia GigaAM-v3 se preentrena con el objetivo HuBERT-CTC sobre 700.000 horas de habla rusa y después se afina para ASR. El entrenamiento incorpora conjuntos internos nuevos: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas. El autor declara una mejora media del 30 % en esos dominios nuevos manteniendo la calidad en los benchmarks públicos. No se especifican en la información disponible el número exacto de tokens de texto, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

La conversión GGUF está anclada al commit `ec1dc1f` de ai-sage/GigaAM-v3 (fijado el 2026-05-12) y validada contra el paquete de referencia del autor en el commit `42b96d9` de transcribe.cpp. Las cuantizaciones conservan prácticamente intacta la calidad: el WER en FLEURS ru pasa de 5,35 % en F32 a 5,36 % en Q4_K_M, una degradación de 0,01 puntos porcentuales.

## Capacidades

- Transcripción de voz a texto en ruso con salida en mayúsculas y minúsculas y puntuación incluida.
- Normalización de texto integrada (números, formatos) gracias al entrenamiento end-to-end.
- Decodificación RNN-T voraz sin modelo de lenguaje externo.
- Timestamps a nivel de token para alinear la salida con el audio.
- Ejecución offline completa: no requiere conexión ni servicios externos.
- Inferencia en CPU y GPU mediante transcribe.cpp, con soporte de Metal y Vulkan.
- No soporta streaming: requiere audio completo por utterance.
- No traduce ni detecta idioma: la entrada debe ser ruso.
- No procesa audio de más de 25 segundos por utterance.

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas en ruso: el modelo procesa cada segmento de hasta 25 s y devuelve texto puntuado, adecuado para generar actas o resúmenes posteriores con otro modelo.
- Atención al cliente y análisis de call centers: el entrenamiento incluye conversaciones de call center, donde el modelo declara un WER del 9,5 % en la variante RNNT, lo que lo hace apto para transcribir grabaciones y alimentar analítica de calidad.
- Subtitulado offline de contenido en ruso: con timestamps a nivel de token y salida puntuada, se puede segmentar el audio y generar subtítulos sincronizados en un pipeline batch.
- Dictado local en aplicaciones de escritorio: al pesar entre 175 MB y 849 MB y ejecutarse en CPU, puede integrarse en herramientas de escritorio sin GPU ni conexión.
- Indexación y búsqueda de archivos de audio: transcribir un archivo histórico de grabaciones rusas para hacerlas buscables por texto, aprovechando la licencia MIT para uso comercial.
- Investigación en ASR para ruso: sirve como baseline reproducible y ligero para comparar técnicas de cuantización o de decodificación, dado que el WER está medido y documentado por cuantización.
- Procesamiento en dispositivos con recursos limitados: la variante Q4_K_M de 175 MB cabe en memoria de sistemas embebidos o Raspberry Pi y mantiene un WER de 5,36 % en FLEURS ru.
- Transcripción de habla con características atípicas o con ruido de fondo: la model card original reporta mejoras específicas en habla desordenada (19,2 % WER en RNNT) y habla natural (6,9 %).

## Benchmarks y rendimiento

Resultados de WER sobre el split de test completo de FLEURS ru (775 utterances), decodificación voraz y sin LM externo, medidos por el autor de la conversión:

| Cuantizacion | Tamano | WER FLEURS ru |
|---|---:|---:|
| F32 | 849 MB | 5,35 % |
| F16 | 431 MB | 5,35 % |
| Q8_0 | 261 MB | 5,36 % |
| Q6_K | 217 MB | 5,37 % |
| Q5_K_M | 197 MB | 5,42 % |
| Q4_K_M | 175 MB | 5,36 % |

El paquete de referencia `gigaam` de ai-sage mide 6,78 % en el mismo manifiesto; la diferencia de 1,4 puntos se debe a que el paquete original rechaza 5 utterances de más de 25 s (contabilizadas como errores de deleción del 100 %). En el subconjunto de 770 utterances que ambos decodifican, transcribe.cpp coincide exactamente con el paquete original. ai-sage no publica un WER de FLEURS ru para este modelo; la cifra está medida por el autor de la conversión.

Resultados por dominio de la model card original de GigaAM-v3 (WER %):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| Media | 9,2 | 8,4 | 19,4 | 25,1 |

Rendimiento de velocidad medido por el autor de la conversión (RTF, factor de tiempo real):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 88 |
| Apple M4 Max | CPU | 25 |
| Ryzen 4750U | Vulkan | 22 |
| Ryzen 4750U | CPU | 8 |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 175 MB (Q4_K_M) y 849 MB (F32) de pesos; el consumo real de memoria es ligeramente superior por buffers de activación y decodificación.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre; el modelo se ha validado con Metal en Apple M4 Max y con Vulkan en un Ryzen 4750U con gráficos integrados.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna, incluidas las integradas. También funciona en CPU pura.
- Opciones de despliegue: transcribe.cpp (compilación desde fuente con CMake) y su binario `transcribe-cli`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo ASR de este tipo.
- Latencia y throughput: con RTF de 88 en Metal (M4 Max) el modelo procesa audio unas 88 veces más rápido que tiempo real; en CPU de un Ryzen 4750U el RTF es de 8, y con Vulkan de 22. En CPU de un M4 Max el RTF es de 25.
- Formato de entrada: WAV mono a 16 kHz; para otras fuentes hay que convertir con ffmpeg (`ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WER ruso (referencia) | Licencia | Formato |
|---|---|---:|---|---|---|
| GigaAM-v3 e2e_rnnt (este) | 222,5 M | 25 s por utterance | 5,35 % FLEURS ru (medido por el conversor) | MIT | GGUF |
| GigaAM-v3 rnnt (original ai-sage) | 220–240 M | 25 s por utterance | 8,4 % media multi-dominio | MIT | safetensors / paquete Python |
| Whisper large-v3 | no disponible | 30 s por ventana | 25,1 % media multi-dominio en la tabla de ai-sage | MIT | safetensors, GGUF, etc. |
| T-One + LM | no disponible | no disponible | 19,4 % media multi-dominio en la tabla de ai-sage | no disponible | no disponible |

La comparación con Whisper y T-One procede de la tabla publicada por ai-sage en la model card original, que evalúa la variante RNNT sin el prefijo `e2e`. El dato de FLEURS ru de este GGUF no es directamente comparable con esa tabla porque el conjunto de evaluación es distinto.

## Limitaciones y advertencias

- Solo ruso: no traduce ni detecta idioma; el audio en otros idiomas producirá salidas incorrectas o vacías.
- Sin streaming: requiere el utterance completo antes de decodificar, lo que impide su uso en subtitulado en vivo o asistentes de voz interactivos.
- Límite de 25 s por utterance: los audios más largos deben segmentarse previamente; el paquete original rechaza esos casos y el pipeline debe gestionarlos.
- Riesgo de alucinación y errores en audio ruidoso: el WER sube al 19,2 % en habla desordenada y al 9,5 % en call center; en condiciones adversas la salida puede contener sustituciones o texto inventado.
- Sesgos: no se documentan análisis de sesgo por acento, género o edad en la información disponible; el entrenamiento con datasets internos no descritos impide auditar su composición.
- Licencia MIT heredada del modelo base: permite uso comercial, pero conviene revisar los términos completos en la model card de ai-sage, que es la fuente autoritativa.
- Repositorio con 0 descargas y 0 likes: es una conversión reciente y no validada por la comunidad; la validación numérica se limita a la comparación con el paquete de referencia declarada por el autor.
- Dependencia de transcribe.cpp: no hay integración con ecosistemas estándar como transformers o whisper.cpp, lo que limita la portabilidad.
- El WER de FLEURS ru está medido por el autor de la conversión, no por ai-sage, y no es directamente comparable con las cifras multi-dominio de la model card original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrsoundmind/gigaam-v3-e2e-rnnt-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base usado: https://huggingface.co/ai-sage/GigaAM-v3/commit/ec1dc1f
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- Métricas de evaluación de GigaAM: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Repositorio GigaAM de Salute Developers: https://github.com/salute-developers/GigaAM
- Paper referenciado (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
