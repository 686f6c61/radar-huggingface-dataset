# oluwagbotty/nemo-ctc-ky-ft-10ep-s2

## Resumen

`nemo-ctc-ky-ft-10ep-s2` es un modelo de reconocimiento automático del habla (ASR) para kinyarwanda desarrollado por el usuario oluwagbotty como parte de un proyecto de investigación del Rwanda Innovation Sprint, coordinado por el Centre for Digital Language Inclusion (CDLI) de la UCL. Se trata de un ajuste fino del modelo `nvidia/stt_rw_conformer_ctc_large`, un conformer CTC de NVIDIA entrenado originalmente para kinyarwanda, sobre el split de entrenamiento del dataset CDLI de habla no estándar, cuyos hablantes son en su mayoría adultos jóvenes con tartamudez.

El objetivo del modelo es mejorar la transcripción de habla tartamudeante, un escenario que los sistemas ASR convencionales manejan mal porque están entrenados con habla fluida. El modelo conserva la arquitectura CTC del modelo base, lo que evita el fallo típico de los modelos autorregresivos (como Whisper) de entrar en bucles de repetición: en la evaluación reportada no se observa ningún loop.

La relevancia del modelo es doble: por un lado, aporta una línea base reproducible para ASR de habla no estándar en una lengua de bajos recursos como el kinyarwanda; por otro, documenta de forma transparente sus métricas (WER agrupado y por enunciado, CER) y sus limitaciones metodológicas, algo poco habitual en modelos con tan pocos recursos de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (heredada de nvidia/stt_rw_conformer_ctc_large) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa una grabación por inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (checkpoint NeMo, `best.nemo`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de un conformer CTC de NVIDIA para kinyarwanda. La arquitectura conformer combina capas convolucionales y mecanismos de atención, y la cabeza CTC permite decodificación no autorregresiva, lo que elimina la posibilidad de bucles de repetición en la salida. El repositorio ocupa aproximadamente 0,5 GB, coherente con un conformer de tamaño "large" en precisión mixta.

El entrenamiento se realizó únicamente sobre el split de train del dataset `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0`, con el split de dev usado para selección de checkpoint (early stopping con paciencia de 3 evaluaciones) y el split de test puntuado una sola vez tras el entrenamiento. Se entrenaron hasta 10 épocas con `--lr 1e-4` y precisión `bf16-mixed`, semilla 2. No hay solapamiento de hablantes entre splits y el split `extra` no se utilizó. Las grabaciones se hicieron en Ruanda en 2026, en interiores con bajo ruido, mediante una app de tableta, a partir de descripciones de imágenes y lectura de frases.

## Capacidades

- Transcripción de voz a texto en kinyarwanda, incluyendo habla con tartamudez (repeticiones, bloqueos y prolongaciones en la señal acústica).
- Decodificación CTC greedy no autorregresiva, sin riesgo de bucles de repetición en la salida.
- Manejo de dos tipos de estímulo: habla leída (frases de texto) y habla descrita libremente a partir de imágenes.
- Evaluación con normalizador de texto de Whisper y variante con paso de apóstrofos estilo CDLI.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio más allá de la transcripción de la señal de entrada.
- Capacidad multilingüe limitada al kinyarwanda.

## Casos de uso

- Transcripción de entrevistas y testimonios con hablantes que tartamudean: el ajuste fino sobre habla no estándar reduce el sesgo del modelo base frente a disfluencias, y la decodificación CTC evita los bucles que otros sistemas generan con repeticiones.
- Investigación en ASR inclusivo: sirve como línea base reproducible (semilla, hiperparámetros y splits documentados) para comparar técnicas de aumento de datos o arquitecturas sobre habla no estándar en lenguas de bajos recursos.
- Subtitulado de contenido grabado en kinyarwanda en condiciones controladas: grabaciones en interior con bajo ruido y micrófono de tableta son el dominio de entrenamiento, por lo que el rendimiento es más fiable en ese régimen.
- Prototipos de accesibilidad para personas con tartamudez: transcripción asistida en la que el texto se muestra al hablante antes de actuar sobre él, tal como recomienda la model card.
- Generación de transcripciones para corpus lingüísticos: el modelo puede preanotar grabaciones de kinyarwanda para revisión humana posterior, con la advertencia de que el WER reportado (~41 %) exige corrección manual.
- Evaluación comparativa de modelos ASR en habla no estándar: sus métricas detalladas (WER agrupado, WER por enunciado, CER, recuento de loops) permiten comparaciones metodológicamente homogéneas con otros sistemas.

## Benchmarks y rendimiento

Decodificación greedy, una grabación por inferencia, normalizador de texto básico de Whisper. El WER agrupado cuenta todas las palabras; el WER y CER por enunciado son medias por grabación (cada una limitada al 100 %).

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Loops |
|---|---|---|---|---|---|
| test (9 hablantes) | 41,2 | 13,0 | 41,7 | 13,7 | 0 |
| dev (6 hablantes) | 44,2 | 18,9 | 43,6 | 20,0 | 0 |
| test, normalizador estilo CDLI | 38,3 | 12,5 | 39,4 | no disponible | 0 |

El autor advierte que, con solo 9 hablantes en test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse estadísticamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 0,5 GB, lo que sugiere que el modelo cabe holgadamente en GPUs de consumo, aunque no se publica una cifra de VRAM.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: probable por el tamaño del checkpoint, pero no confirmada por el autor.
- Opciones de despliegue: NeMo Toolkit (formato `.nemo`); no se documentan exportaciones a otros runtimes (vLLM, llama.cpp, Ollama, TGI no aplican a un modelo CTC de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER test | Licencia | Formato |
|---|---|---|---|---|---|
| oluwagbotty/nemo-ctc-ky-ft-10ep-s2 | no disponible | no disponible | 41,2 % (agrupado) | CC BY 4.0 | `.nemo` |
| nvidia/stt_rw_conformer_ctc_large (base) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | `.nemo` |
| Whisper (referencia de normalizador) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados comparativos publicados frente al modelo base ni frente a otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, mayoritariamente hombres adultos jóvenes, grabaciones en interior con bajo ruido, habla leída y descrita por imágenes, no conversacional. El rendimiento con niños, otras discapacidades del habla, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- Los objetivos de transcripción son literales: las repeticiones por tartamudez aparecen escritas en las transcripciones, y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Las frases leídas también aparecen en las transcripciones de entrenamiento, por lo que los resultados con descripciones de imágenes son la mejor guía para habla abierta.
- No debe usarse para diagnosticar o evaluar ninguna condición del habla, identificar hablantes ni tomar decisiones clínicas, legales o policiales. Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a una persona.
- Una transcripción errónea puede cambiar el significado de lo dicho: debe mostrarse el texto al hablante antes de actuar sobre él.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero los términos del dataset CDLI imponen restricciones adicionales sobre reidentificación y clonación de voz.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de sustituciones y omisiones de palabras (WER ~41 %), lo que limita su uso directo en producción sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep-s2
- Modelo base: https://huggingface.co/nvidia/stt_rw_conformer_ctc_large
- Dataset CDLI: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Documentación de NeMo Framework: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/core/core.html
- Paquete nemo-toolkit en PyPI: https://pypi.org/project/nemo-toolkit/
