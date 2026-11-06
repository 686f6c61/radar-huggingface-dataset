# oluwagbotty/nemo-ctc-lr1e-4

## Resumen

`oluwagbotty/nemo-ctc-lr1e-4` es un modelo de reconocimiento automático del habla (ASR) para kinyarwanda, desarrollado por el usuario oluwagbotty como parte de un proyecto de investigación del Rwanda Innovation Sprint gestionado por el CDLI (Centre for Digital Language Inclusion, UCL). Se trata de un ajuste fino de `nvidia/stt_rw_conformer_ctc_large`, un Conformer-CTC de NVIDIA NeMo entrenado originalmente con unas 2.000 horas de Common Voice kinyarwanda, sobre el split de entrenamiento del dataset CDLI de habla no estándar, cuyos hablantes son mayoritariamente adultos jóvenes con tartamudez.

El modelo tiene aproximadamente 120 millones de parámetros y un peso de 487 MB, lo que lo sitúa en la categoría de modelos ligeros con decodificación CTC en una sola pasada. Esta elección arquitectónica evita los bucles de repetición típicos de los modelos autorregresivos y permite inferencia rápida en CPU, algo relevante para un contexto de despliegue de bajo coste en regiones con recursos limitados.

Su relevancia radica en que aborda un nicho poco cubierto: el reconocimiento de habla con disfluencias en una lengua de bajos recursos como el kinyarwanda. El modelo mantiene un rendimiento comparable a alternativas mucho más grandes (w2v-BERT 2.0 de 0,6B y Whisper large-v3 de 1,55B) en el conjunto de test del CDLI, con un WER agrupado del 39,7 % frente al 38,7 % y 39,9 % respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (NeMo), encoder Conformer con decodificación CTC y tokenizador BPE |
| Parametros totales | ~120 millones (0,12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio a 16 kHz mono) |
| Tipos de cuantizacion | no disponible (formato `.nemo`, fp32 en inferencia) |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (checkpoint NeMo, ~487 MB) |

## Arquitectura y entrenamiento

El modelo es un Conformer-CTC: un encoder basado en bloques Conformer (convolución + atención) seguido de una cabeza CTC con tokenizador BPE. La decodificación CTC es no autorregresiva, lo que implica una sola pasada sobre el audio y elimina la posibilidad de bucles de repetición. El punto de partida es `nvidia/stt_rw_conformer_ctc_large`, entrenado por NVIDIA con aproximadamente 2.000 horas de Common Voice kinyarwanda.

El ajuste fino se realizó sobre el split de entrenamiento del dataset CDLI Rwandan Kinyarwanda non-standard speech v1.0: 11.536 grabaciones de 46 hablantes (47,7 horas), principalmente adultos jóvenes con tartamudez y algunos con otras diferencias del habla. Se usó AdamW con learning rate 1e-4, warm-up del 10 % seguido de decaimiento coseno, weight decay 1e-3, batch size 16, 6 épocas (4.326 pasos), precisión mixta y una sola GPU, con un tiempo total de aproximadamente 22 minutos. Se congelaron las estadísticas de batch-norm del modelo preentrenado para evitar degradación con batches pequeños. Los targets se normalizaron a minúsculas y al conjunto de caracteres del modelo, conservando las repeticiones propias de la tartamudez. El checkpoint se seleccionó por WER de validación (0,4568 frente a 0,6715 antes del ajuste).

## Capacidades

- Transcripción de voz a texto en kinyarwanda, incluyendo habla con disfluencias (repeticiones, bloqueos, prolongaciones).
- Decodificación CTC en una sola pasada, sin bucles de repetición.
- Inferencia rápida en CPU además de GPU.
- Salida en minúsculas, con espacios y apóstrofos, sin puntuación.
- Manejo de audio a 16 kHz mono.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos generativos.
- No dispone de modo thinking, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de entrevistas y testimonios de personas con tartamudez: el modelo conserva las repeticiones verbatim, lo que resulta útil para investigación lingüística y logopedia, ya que refleja fielmente la producción oral.
- Subtitulado de contenido audiovisual en kinyarwanda: al ser un modelo ligero y rápido en CPU, puede desplegarse en servidores modestos para generar subtítulos de vídeos o pódcasts en kinyarwanda.
- Investigación sobre ASR de bajos recursos: sirve como línea base reproducible para comparar estrategias de ajuste fino en lenguas africanas con pocos datos.
- Evaluación de tecnologías de accesibilidad: el modelo permite medir el rendimiento de ASR sobre habla no estándar y orientar el desarrollo de herramientas de inclusión digital.
- Despliegue en entornos con hardware limitado: con 487 MB y RTF de 0,022 en CPU de servidor con 10 hilos, es viable en infraestructura sin GPU.
- Preprocesado de datos de voz para pipelines de NLP en kinyarwanda: transcripción automática de corpus orales antes de tareas posteriores de análisis o traducción.
- Prototipado de aplicaciones de dictado o transcripción para hablantes de kinyarwanda con disfluencias, donde otros modelos autorregresivos fallan por bucles.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test del dataset CDLI (1.169 grabaciones de 9 hablantes, decodificación greedy, normalización de texto tipo Whisper con eliminación de apóstrofos):

| Modelo | Parámetros | WER agrupado (%) | WER por enunciado (%) | CER (%) | Bucles |
|---|---|---|---|---|---|
| Este modelo | 0,12B | 39,7 | 41,0 | 13,0 | 0 |
| w2v-BERT 2.0, mismo ajuste (run propio) | 0,6B | 38,7 | 40,6 | 11,7 | 0 |
| CDLI Whisper large-v3 (bucles corregidos) | 1,55B | 39,9 | 38,4 | 13,7 | 17 corregidos |
| CDLI Whisper small (bucles corregidos) | 0,24B | 47,6 | 45,2 | 17,5 | 17 corregidos |
| Este modelo antes del ajuste (50 clips) | 0,12B | 59,6 | n/a | 23,1 | 0 |

Desgloses adicionales reportados: WER agrupado de 36,2 con prompts de texto (lectura) y 43,6 con prompts de imagen (descripción libre); WER de 42,4 y CER de 13,5 con puntuación simple sin eliminación de apóstrofos; WER por enunciado por gravedad: leve 37,8, moderada 38,9, severa 46,0; WER de validación 44,6. Una segunda ejecución con learning rate 5e-5 dio un WER agrupado de 40,7. El autor indica que la diferencia frente a w2v-BERT es de +1,0 puntos (IC 95 %: -0,8 a +3,3) y frente a Whisper large de -0,2 (-3,7 a +4,7), por lo que se considera en paridad con ambos y claramente mejor que Whisper small (-7,9; IC -11,9 a -2,5).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 487 MB del checkpoint; no se han publicado mediciones específicas de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el autor midió 0,05 s por grabación en GPU sin especificar el modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU.
- Despliegue: NeMo Toolkit (`pip install "nemo_toolkit[asr]"`) mediante `EncDecCTCModelBPE.restore_from`. No se han documentado integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: en CPU de servidor (molab, 10 grabaciones de 15 s de media, fp32), 0,28 s por grabación con 10 hilos (RTF 0,022) y 0,90 s con 2 hilos (RTF 0,065). No medido en portátil típico ni en teléfono.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño | WER agrupado (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 0,12B | 487 MB | 39,7 | CC-BY-4.0 | HuggingFace |
| nvidia/stt_rw_conformer_ctc_large (base) | ~0,12B | no disponible | 59,6 (50 clips) | no disponible | HuggingFace |
| w2v-BERT 2.0 ajustado por el autor | 0,6B | no disponible | 38,7 | no disponible | no disponible |
| CDLI Whisper large-v3 | 1,55B | no disponible | 39,9 | no disponible | no disponible |
| CDLI Whisper small | 0,24B | no disponible | 47,6 | no disponible | no disponible |

## Limitaciones y advertencias

- Conjunto de test muy reducido: 9 hablantes (3 leves, 3 moderados, 3 severos). El autor advierte que diferencias inferiores a unos 3 puntos de WER no pueden confirmarse con esta muestra, y que no deben extraerse conclusiones de los subgrupos de 3 hablantes.
- Salida verbatim: el modelo reproduce las repeticiones tal como se dijeron (por ejemplo, "mu mu mu mwaka"). Los bloqueos y prolongaciones no son visibles en texto. Si se necesita la frase fluida, hay que limpiar la transcripción después de decodificar.
- Sin puntuación ni mayúsculas: la salida se limita a minúsculas, espacios y apóstrofos.
- Riesgo de alucinación no documentado explícitamente, pero la decodificación CTC no genera bucles de repetición, lo que reduce este riesgo en comparación con modelos autorregresivos.
- Sesgos demográficos: los hablantes del dataset son mayoritariamente adultos jóvenes de Ruanda, grabados en interiores con bajo ruido mediante una app de tablet; el rendimiento en otros grupos de edad, acentos o condiciones acústicas no está evaluado.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el dataset de entrenamiento tiene acceso restringido (gated) y no se incluye en el repositorio; es necesario aceptar los términos del CDLI para reproducir el entrenamiento.
- El modelo está pensado para un proyecto de investigación; no se han publicado evaluaciones en producción ni pruebas con hablantes fuera del conjunto CDLI.
- El rendimiento en habla fluida (no tartamuda) no se ha medido de forma aislada en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oluwagbotty/nemo-ctc-lr1e-4
- Modelo base: https://huggingface.co/nvidia/stt_rw_conformer_ctc_large
- Dataset CDLI Rwandan Kinyarwanda non-standard speech v1.0: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- NeMo Toolkit: https://github.com/NVIDIA/NeMo
- Centre for Digital Language Inclusion (CDLI), UCL: no disponible en la información proporcionada
