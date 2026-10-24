# PraxySante/praxy-ca-es-asr-streaming-cacheaware-fastconformer

## Resumen

Praxy-ca-es-asr-streaming-cacheaware-fastconformer (v3) es un modelo de reconocimiento automático del habla diseñado por PraxySanté (Praxy.ai) para dictado médico en catalán y español, incluyendo enunciados con alternancia de lenguas (code-switching) catalán/español. Se trata de un `EncDecHybridRNNTCTCBPEModel` de NeMo: un encoder FastConformer con atención cache-aware streaming, acoplado a una cabeza híbrida RNN-T/CTC y un tokenizer BPE de 8 000 unidades entrenado sobre catalán y español. Con 127,27 millones de parámetros y un checkpoint `.nemo` en fp32 de 510 MB, es un modelo compacto pensado para inferencia en tiempo real y despliegue en entornos con recursos limitados.

El modelo parte de un linaje interno denominado «FR temps réel V5» y se afina sobre 4 197 horas de audio catalán y español, con 6 épocas en 8 GPU H100 (60 066 pasos, 4 h 28 min) y un `val_wer` de 0,1307 sobre 58,68 h de validación. Su rasgo técnico diferencial es la configuración de ventanas de streaming heredada del modelo francés: `att_context_size [[70,13],[70,6],[70,1]]` con probabilidades [0,4; 0,4; 0,2], lo que permite tres latencias aproximadas (13 s, 6 s y 1 s) en una sola pasada, sin reentrenar el encoder para cada régimen.

Su relevancia actual radica en dos factores: por un lado, cubre un hueco poco atendido, el ASR médico en catalán con streaming de baja latencia; por otro, publica cifras de referencia explícitas (WER 0,2084 en code-switching CA/ES, 0,1294 en validación general CA/ES, 0,4301 y 0,3235 en dictado médico catalán y español zero-shot) que sirven como línea base para el run v4 anunciado por el autor. Conviene señalar que el modelo no es de acceso abierto en sentido estricto: la licencia figura como no disponible y el propio autor remite a su equipo para fijar las condiciones de reutilización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware streaming con cabeza híbrida RNN-T/CTC (`EncDecHybridRNNTCTCBPEModel`, NeMo) |
| Parámetros totales | 127,27 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de atención `[[70,13],[70,6],[70,1]]` con probabilidades [0,4; 0,4; 0,2]; latencias aproximadas de 13 s, 6 s y 1 s |
| Tipos de cuantización | Checkpoint publicado en fp32; no se documentan variantes cuantizadas (no disponible) |
| Idiomas soportados | Catalán (ca) y español (es), incluido code-switching CA/ES; no soporta francés |
| Licencia | No disponible (modelo interno PraxySanté; condiciones de reutilización a acordar con el equipo) |
| Formato de pesos | `.nemo` (fp32, 510 MB); tamaño del repositorio 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder FastConformer con atención cache-aware streaming, es decir, con memorias de caché que permiten procesar audio en fragmentos sin recalcular el contexto completo. Sobre el encoder se sitúa una cabeza híbrida que combina RNN-T (transducer) y CTC, lo que habilita decodificación greedy rápida y también decodificación con un modelo de lenguaje externo en el caso de la rama CTC. El tokenizer es un BPE de 8 000 unidades entrenado específicamente sobre catalán y español, un tamaño reducido que mantiene el vocabulario manejable y el coste de decodificación bajo, a costa de una mayor fragmentación de términos poco frecuentes.

El entrenamiento se realizó sobre 4 197 horas de audio: Common Voice 16 catalán (1 495 h), Parlamento catalán (208 h), TV3 (230 h), Parlamento vasco en español (899 h), COSER ES (65 h), además de LaFrescat, FestCat, SLR69, CAESAR-TV3, distilled-catalan-youtube, ciempiess, CHM150, DIMEX100, VoxPopuli ES, MLS ES y argentinian-spanish. Según el autor, el conjunto de test de code-switching del BSC nunca se usó en entrenamiento y los textos de test se retiraron del train. El run consistió en 6 épocas, 60 066 pasos y 4 h 28 min sobre 8 H100, con `val_wer` de 0,1307 (mejor checkpoint 0,1305) sobre 58,68 h. No se documenta en la información disponible el uso de RLHF, DPO ni de un modelo de lenguaje externo durante el entrenamiento.

Un detalle relevante para la evaluación: el modelo emite texto normalizado (minúsculas, sin puntuación, apóstrofos y guiones unidos —`l'home` pasa a `lhome`—, con acentos y punto medio catalán conservados). Cualquier comparación con referencias puntuadas debe aplicar la misma normalización a ambos lados, o el WER resultante no será comparable.

## Capacidades

- Reconocimiento de voz en catalán y español con un único modelo, sin conmutación manual de idioma.
- Gestión de enunciados con code-switching CA/ES dentro de la misma frase.
- Streaming cache-aware con tres regímenes de latencia (aproximadamente 1 s, 6 s y 13 s) seleccionables en inferencia, y una sola pasada para los tres.
- Decodificación híbrida: RNN-T (transducer) para transcripción incremental y CTC para decodificación alternativa.
- Salida de texto normalizado de forma determinista, adecuada para pipelines posteriores de NLP.
- Adaptación declarada al dominio de dictado médico, con cifras específicas para catalán y español en zero-shot sobre material clínico no visto.
- No incluye visión, audio además del habla, tool calling ni capacidades de agente: es un modelo puramente ASR.

## Casos de uso

- **Dictado clínico en consulta (catalán)**: transcripción en streaming con ventana de 1 s para que el facultativo vea el texto aparecer mientras habla, con el encoder cache-aware evitando recalcular el contexto acumulado en consultas largas.
- **Dictado clínico en consulta (español)**: el mismo checkpoint sirve para pacientes y profesionales hispanohablantes sin cambiar de modelo, algo útil en centros sanitarios bilingües de Cataluña, la Comunidad Valenciana o Baleares.
- **Redacción de informes con alternancia de lenguas**: en entornos donde el profesional introduce términos clínicos en una lengua y la estructura de la frase en otra, el WER de 0,2084 en code-switching (frente a 0,9655 del modelo de origen) hace viable el uso real frente a un ASR monolingüe.
- **Transcripción de sesiones y visitas grabadas**: con la ventana de 13 s se puede procesar audio de forma cuasi-offline con mayor precisión y menor coste computacional, adecuado para resúmenes posteriores de consulta.
- **Subtitulado y documentación de sesiones clínicas o docencia**: la latencia de 1 s permite subtitulado en directo en aulas hospitalarias y sesiones clínicas, donde el dominio es más formal y el WER general (0,1294) es representativo.
- **Preanotación de corpus para investigación**: al ser un modelo compacto con salida normalizada, sirve como primer paso de etiquetado automático de corpus CA/ES, con revisión humana posterior centrada en los términos clínicos.
- **Integración en aplicaciones de escritorio o edge**: el tamaño de 127 M parámetros permite ejecutar la inferencia en CPU o en GPU de gama baja dentro de la propia infraestructura del centro, sin enviar audio a la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor (WER, decodificación greedy, medición del 24/10/2026, evaluación mediante `fs_eval_rows.py --accents ca_es` sobre slices con semilla fija). La columna derecha corresponde al modelo de origen «FR temps réel V5», incluida para situar el efecto del ajuste:

| Slice | Clips | v3 CA/ES | FR V5 |
|---|---|---|---|
| Code-switching CA/ES (BSC, nunca visto en entrenamiento) | 5 205 | 0,2084 | 0,9655 |
| Validación general CA/ES (muestra) | 1 500 | 0,1294 | 0,9656 |
| Dictado médico catalán, zero-shot | 3 000 | 0,4301 | 0,9703 |
| Dictado médico español, zero-shot | 3 000 | 0,3235 | 0,9447 |

El `val_wer` de entrenamiento (0,1307 sobre 58,68 h) se reproduce en 0,1294 sobre la muestra de validación, lo que el autor interpreta como estabilidad de la cadena de medida. No hay resultados publicados de benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a un modelo ASR); no se dispone de comparaciones con otros ASR en las mismas slices.

## Requisitos de hardware

- **VRAM estimada en inferencia**: aproximadamente 0,5 GB en fp32 para los pesos, más overhead de activaciones y cachés; en la práctica, alrededor de 1 GB en fp32 y por debajo de 0,5 GB en fp16.
- **GPU recomendadas**: H100 o A100 para entrenamiento o para servir muchas corrientes concurrentes; para producción de baja concurrencia, cualquier GPU con 4 GB o más es suficiente (RTX 3060, RTX 4060, T4, L4).
- **GPU de consumo**: sí, cabe en cualquier GPU de consumo moderna e incluso en iGPU y en CPU, dado el tamaño de 127 M parámetros.
- **Opciones de despliegue**: NeMo (`ASRModel.restore_from`), NVIDIA Riva para servicio con streaming, y exportación a ONNX/TensorRT como vía habitual en el ecosistema NeMo (la disponibilidad de artefactos exportados no se documenta en la información disponible). vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- **Latencia**: derivada de las ventanas de streaming publicadas, en torno a 1 s, 6 s y 13 s de contexto según la configuración elegida. Throughput (corrientes concurrentes, RTF) no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / streaming | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Praxy ca-es streaming v3 | 127,27 M | Cache-aware, ventanas de 1/6/13 s | ca, es (+ code-switching) | No disponible (interna) | HuggingFace, repo de 0,5 GB |
| OpenAI Whisper large-v3 | 1 550 M | Ventanas de 30 s, sin streaming nativo | Multilingüe (incluye ca y es) | MIT | Abierta, ampliamente desplegada |
| OpenAI Whisper small | 244 M | Ventanas de 30 s, sin streaming nativo | Multilingüe | MIT | Abierta |
| NVIDIA Canary-1B | ~1 000 M | Offline, sin streaming cache-aware | Inglés, alemán, francés, español | CC-BY-NC 4.0 | Abierta en NGC/HuggingFace |

La comparación de WER entre estos modelos y el de PraxySanté no está disponible en la información proporcionada: las slices de evaluación son internas y no se han publicado resultados cruzados. La ventaja diferencial del modelo de PraxySanté frente a Whisper es el streaming real con latencias de 1 s y el tamaño reducido; su desventaja es la licencia indeterminada y la ausencia de validación externa.

## Limitaciones y advertencias

- **Dominio médico fuera de distribución**: el modelo no ha visto las 759 h de TTS médicos ES/CA de la línea PraxySanté, de ahí los WER de 0,4301 (catalán) y 0,3235 (español) en zero-shot. Son la referencia a batir por el run v4, no un rendimiento de producción validado.
- **Inflación del WER por convención de puntuación**: las referencias médicas internas incluyen marcas de puntuación dictadas (`punt`, `salt de línia`, `coma`, `guió`), que representan el 22,9 % de las palabras en catalán y el 21,3 % en español. Parte del error médico es convención de anotación, no contenido clínico mal reconocido.
- **Sin soporte de francés**: pese a derivar de un modelo francés, no es multilingüe con el francés y su calidad en esa lengua queda por debajo del modelo de origen.
- **Salida normalizada**: no genera puntuación, mayúsculas ni apóstrofos separados. Cualquier producto que requiera texto formateado necesita un paso posterior de puntuación y capitalización.
- **Licencia incierta**: la licencia figura como no disponible y el autor remite a su equipo. Además, varios corpus de entrenamiento están bajo CC-BY o CC-BY-NC, lo que condiciona la redistribución y el uso comercial.
- **Riesgo de sesgo de dominio y acento**: el corpus combina Parlamento catalán, TV3, Parlamento vasco en español, Common Voice y materiales de YouTube; el habla espontánea con acentos no representados (por ejemplo, variantes caribeñas o andinas) puede degradar el WER, y el material argentino tiene un peso no cuantificado.
- **Vocabulario BPE de 8 000**: los términos clínicos poco frecuentes se fragmentan en muchas subtokens, lo que aumenta el coste de decodificación y el riesgo de errores en fármacos, dosis y epónimos.
- **Sin validación comunitaria**: 0 descargas y 0 «likes» en el momento de la ficha; no hay evaluaciones independientes que confirmen las cifras publicadas.
- **Alucinación**: en ASR, el fenómeno equivalente son las sustituciones e inserciones plausibles, especialmente en silencios, ruido o audio musical; no se documenta ningún mecanismo específico de mitigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PraxySante/praxy-ca-es-asr-streaming-cacheaware-fastconformer
- Organización en HuggingFace: https://huggingface.co/PraxySante
- Catálogo de modelos: https://huggingface.co/PraxySante/models
- Sitio corporativo (francés): https://praxysante.com/
- Sitio corporativo (español): https://praxysante.com/es/accueil-praxysante-com
- Suite de producto: https://praxy.ai/
- Artículo técnico o paper: no disponible
- Repositorio de código o demo: no disponible
