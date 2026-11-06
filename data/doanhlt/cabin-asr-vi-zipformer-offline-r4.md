# doanhlt/cabin-asr-vi-zipformer-offline-r4

## Resumen

cabin-asr-vi-zipformer-offline-r4 es un modelo de reconocimiento automático del habla (ASR) en vietnamita, offline y no streaming, desarrollado por el usuario doanhlt dentro del proyecto Cabin Offline ASR. Se trata de un transducer Zipformer2 de 68,6 M de parámetros con tokenizador BPE de 2000 unidades, exportado a ONNX para su uso con sherpa-onnx. La versión r4 es un ajuste fino (fine-tune) de r3 rc1 con aumento de ruido aditivo (MUSAN) para mejorar la robustez en grabaciones reales.

El modelo se distribuye como candidato, no como release: mantiene la misma arquitectura y los mismos nombres de fichero que el modelo vietnamita ya publicado (`sherpa-onnx-zipformer-vi-int8-2025-04-20`), por lo que es intercambiable directamente en la app Cabin Offline. Su relevancia radica en que demuestra una receta de destilación de conocimiento desde un modelo mayor (R13x, un fine-tune de Qwen3-ASR-1.7B) hacia un transducer compacto que cabe en dispositivo, con métricas de WER verificadas mediante bootstrap pareado.

El contexto es limitado en cuanto a documentación pública: la model card es detallada en metodología y resultados, pero el código de entrenamiento vive en un repositorio privado de GitHub, lo que limita la reproducibilidad externa. La licencia Apache-2.0 y la atribución completa de los datos de entrenamiento facilitan su uso comercial, con las salvedades habituales de los datasets de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder + decoder + joiner), exportado a ONNX |
| Parámetros totales | 68,6 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo no streaming, ventana de audio por segmento) |
| Tipos de cuantización | encoder y joiner en int8, decoder en fp32 (exportación oficial) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (paquete sherpa-onnx: encoder, joiner, decoder, tokens.txt, bpe.model); `icefall/pretrained.pt` para fine-tune |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer2 de icefall, con tokenizador BPE de 2000 unidades y exportación no causal (no streaming). La exportación a ONNX usa `export-onnx.py` de icefall, con encoder y joiner cuantizados a int8 y decoder en fp32, generando un paquete de 79,3 MB (frente a 77,4 MB del modelo publicado, mismo grafo). El punto de partida es el checkpoint `pretrained.pt` de r3 rc1, ajustado con `finetune.py --do-finetune 1`.

El entrenamiento se realizó sobre la misma mezcla de 258 horas de la ronda 3 (YODAS, YODAS2, FOSD, Common Voice 13 y 17, FLEURS), con cortes idénticos y los mismos ficheros de atribución. La innovación de r4 es el aumento de ruido aditivo: 2211 ventanas de 10 segundos del corpus MUSAN, mezcladas sobre las características fbank mediante CutMix de lhotse (probabilidad 0,5, SNR 10-20 dB) solo durante el entrenamiento. Se usó LR 0,0005 con Eden (lr_epochs 100, lr_batches 100k), 3 épocas, max-duration 200, fp16, una A100 compartida con límite de 10 GB. El checkpoint se seleccionó solo sobre dev (FLEURS-vi dev + YODAS2-vi dev, WER medio): época 2, avg 1. No se usaron salidas de Gemini, Soniox u OpenAI, ni capturas de usuario, ni conjuntos de evaluación en entrenamiento (verificado con `check_holdout_cuts.py`, 0 coincidencias).

## Capacidades

- Reconocimiento de voz offline en vietnamita, no streaming, sobre segmentos de audio.
- Transcripción robusta en condiciones de ruido ambiental moderado gracias al aumento con MUSAN (SNR 10-20 dB).
- Manejo de habla conversacional y de entrevistas reales de intérprete, según los conjuntos de evaluación de la model card.
- Tokenización BPE de 2000 unidades, adecuada para vocabulario vietnamita.
- Despliegue en dispositivo mediante sherpa-onnx con API en Python (y presumiblemente en otros bindings de sherpa-onnx, aunque no se detalla en la información disponible).
- No se documentan capacidades de tool calling, agentes, visión, audio multimodal ni modo de razonamiento; es un ASR puro.
- Capacidad multilingüe: no; solo vietnamita.

## Casos de uso

- Transcripción de entrevistas y reuniones en vietnamita: el modelo está evaluado específicamente sobre 57 entrevistas reales de intérprete, con WER de 13,79 % en el subconjunto completo, lo que lo hace adecuado para diarización posterior y generación de actas.
- Subtitulado offline en aplicaciones móviles: el paquete de 79,3 MB y la exportación int8 permiten ejecución local sin conexión, integrándose en la app Cabin Offline con los mismos ficheros que el modelo ya publicado.
- Asistentes de voz en dispositivo para vietnamita: al ser no streaming y de bajo coste computacional, encaja en pipelines de comandos de voz donde la latencia de segmento completa es aceptable.
- Transcripción de contenido audiovisual de YouTube y archivos multimedia: los conjuntos de evaluación incluyen vídeos de YODAS2, lo que respalda su uso en indexación y búsqueda de audio.
- Preprocesado de datos para entrenamiento de modelos mayores: puede usarse como etiquetador automático de audio vietnamita en pipelines de pseudo-etiquetado, dado su bajo coste de inferencia.
- Aplicaciones de accesibilidad para hablantes de vietnamita: conversión de voz a texto en tiempo casi real por segmentos en dispositivos de gama media, sin depender de la nube.
- Evaluación comparativa de ASR en vietnamita: sirve como línea base ligera en benchmarks internos frente a modelos mayores, con métricas de WER reproducibles sobre FLEURS, Common Voice 13 y YODAS2.

## Benchmarks y rendimiento

Resultados de WER (%) con bootstrap pareado al 95 % sobre enunciados, 10.000 remuestreos; asterisco indica que el intervalo de confianza excluye el 0.

| Conjunto (n) | Publicado | r3 | r4 (este) | r4 − publicado | r4 − r3 |
|---|---|---|---|---|---|
| FLEURS-100 vi (100) | 10,19 | 7,64 | 7,54 | -2,65 [-4,58, -1,24] * | -0,10 [-0,33, +0,10] n.s. |
| CV13-vi test200 (200) | 9,58 | 8,37 | 8,10 | -1,48 [-2,77, -0,20] * | -0,27 [-0,94, +0,35] n.s. |
| YODAS2 held-out clean, ref = R13x ∩ caption (463) | 7,43 | 5,12 | 5,05 | -2,38 [-2,81, -1,97] * | -0,07 [-0,23, +0,10] n.s. |
| YODAS2 held-out clean, ref = caption (899) | 52,59 | 51,62 | 51,60 | -0,98 [-1,34, -0,64] * | -0,02 [-0,17, +0,13] n.s. |

Entrevistas reales de intérprete (57 vídeos de YouTube, referencia estricta R13x, bootstrap por clúster sobre vídeos):

| Subconjunto | r3 | r4 (este) | r4 − r3 | Vídeos |
|---|---|---|---|---|
| Todos | 14,11 | 13,79 | -0,32 [-0,48, -0,16] | 57 |
| Acuerdo | 9,06 | 8,81 | -0,25 [-0,42, -0,07] | 52 |
| Gemini | 46,26 | 45,50 | -0,76 [-1,56, -0,19] | 23 |

Atribución del ruido (r4n con ruido menos r4c control sin ruido): FLEURS-100 vi +0,20 [-0,1, 0,53]; CV13-vi test200 -0,27 [-1,28, 0,56]; YODAS2 agree clean -0,05 [-0,23, 0,13]; YODAS2 caption clean +0,05 [-0,09, 0,2]; entrevistas -0,26 [-0,49, -0,02].

Puertas de validación: la puerta de ronda 4 (pre-registrada) pasa en todos sus criterios (fleurs_le_10.22, not_worse_than_r3_tests, beats_r3_interviews_all, not_worse_than_r3_interviews_agree, size_within_2pct_of_r3). La puerta de publicación también pasa (fleurs100_le_10.22, sig_better_than_shipped_on_ge_2_sets, not_sig_worse_than_previous_on_any_set, size_within_5pct_of_shipped, rtf_within_10pct_of_shipped).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo es de 68,6 M de parámetros y el paquete ONNX ocupa 79,3 MB; la inferencia en CPU es viable y la VRAM necesaria en GPU es marginal (por debajo de 1 GB en la mayoría de configuraciones).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer (RTX 3060, RTX 4090) puede ejecutarlo, aunque el diseño está orientado a CPU y dispositivos móviles.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU de portátil y en dispositivos ARM (la model card menciona que la prueba de RTF en ARM está pendiente).
- Opciones de despliegue: sherpa-onnx (librería principal, con ejemplo en Python); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la puerta de publicación exige un RTF dentro del 10 % del modelo publicado, pero no se publican valores absolutos de RTF ni de latencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER FLEURS-100 vi | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cabin-asr-vi-zipformer-offline-r4 | 68,6 M | no disponible (no streaming) | 7,54 | Apache-2.0 | Hugging Face, paquete sherpa-onnx |
| cabin-asr-vi-zipformer-offline-r3 | no disponible | no disponible (no streaming) | 7,64 | Apache-2.0 | Hugging Face |
| sherpa-onnx-zipformer-vi-int8-2025-04-20 (publicado) | no disponible | no disponible (no streaming) | 10,19 | no disponible | Hugging Face, paquete sherpa-onnx |
| R13x (Qwen3-ASR-1.7B fine-tune, profesor) | 1.700 M (aproximado) | no disponible | no disponible | Apache-2.0 | no disponible públicamente en la información |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otros ASR vietnamitas comparables en la información proporcionada.

## Limitaciones y advertencias

- Estado candidato: la model card indica explícitamente que no es un release candidate; faltan la comprobación de release estilo r3 (int8 frente a fp32, barrido de hilos), capturas de teléfono, la suite de tarjetas inventadas y el RTF en ARM.
- Riesgo de alucinación: en ASR, el riesgo se traduce en sustituciones y omisiones; el WER del 51,60 % en YODAS2 con referencia solo por caption sugiere una sensibilidad alta a la calidad de la referencia y posibles divergencias en audio conversacional no controlado.
- Sesgos conocidos: no se documentan análisis de sesgo por acento, género o edad; el entrenamiento se apoya en YODAS (vídeos de YouTube), FLEURS, Common Voice y FOSD, lo que puede infrarrepresentar variedades dialectales del vietnamita.
- Limitaciones de idioma: solo vietnamita; no hay soporte multilingüe.
- Limitaciones de contexto: modelo no streaming, pensado para segmentos de audio completos; no apto para transcripción en tiempo real con latencia baja.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de origen imponen atribución (YODAS y YODAS2 CC BY 3.0, FOSD CC BY 4.0, FLEURS CC BY 4.0, MUSAN CC BY 4.0); es necesario conservar la atribución de los vídeos de YouTube listados en `attribution/`.
- Reproducibilidad: el código de entrenamiento está en un repositorio privado (`thinkprompt/cabin-offline-asr`), lo que impide reproducir la receta sin acceso.
- Caveat de producción: al ser un candidato, conviene validar el RTF y la precisión en el hardware objetivo antes de desplegarlo; el modelo publicado sigue siendo la referencia estable hasta que se complete la verificación.

## Enlaces

- Hugging Face: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r4
- Modelo base r3: https://huggingface.co/doanhlt/cabin-asr-vi-zipformer-offline-r3
- Colección Cabin offline ASR: https://huggingface.co/collections/doanhlt/cabin-offline-asr-on-device-distilled-from-r13x-6ade0b05eb1f2ac4e49d7cf8
- Repositorio de código (privado): `thinkprompt/cabin-offline-asr`, rama `feat/mobile-local-kit`
- sherpa-onnx: no se proporciona enlace directo en la información disponible
- icefall: no se proporciona enlace directo en la información disponible
- Paper o blog del modelo: no disponible
