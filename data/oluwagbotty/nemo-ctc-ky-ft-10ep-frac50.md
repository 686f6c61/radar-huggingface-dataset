# oluwagbotty/nemo-ctc-ky-ft-10ep-frac50

## Resumen

`nemo-ctc-ky-ft-10ep-frac50` es un modelo de reconocimiento automático del habla (ASR) para kinyarwanda, desarrollado por el usuario oluwagbotty, que parte del checkpoint `nvidia/stt_rw_conformer_ctc_large` y lo ajusta fino sobre el split de entrenamiento del dataset CDLI de habla no estándar en kinyarwanda, cuyos hablantes son mayoritariamente adultos jóvenes con tartamudez. El objetivo es un proyecto de investigación sobre reconocimiento de voz de bajo coste para personas que tartamudean, en el marco del Rwanda Innovation Sprint gestionado por el Centre for Digital Language Inclusion (UCL).

Arquitectura: conformer CTC de NVIDIA NeMo, sin decodificador autorregresivo, lo que evita el fallo típico de bucles repetitivos de los modelos seq2seq. Los pesos se distribuyen en formato `best.nemo` dentro de un repositorio de 0,5 GB, bajo licencia CC-BY-4.0. No hay información publicada sobre número de parámetros, longitud de contexto ni composición exacta del corpus de preentrenamiento del modelo base.

Es relevante porque aborda un caso poco cubierto: ASR para habla tartamuda en una lengua de bajos recursos como el kinyarwanda, con métricas reportadas de forma transparente (WER agrupado del 44,3 % en test, CER del 14,1 %) y advertencias explícitas sobre el tamaño reducido de la muestra de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (NVIDIA NeMo), sin decodificador autorregresivo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato NeMo `.nemo`) |
| Idiomas soportados | kinyarwanda (`rw`) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `.nemo` (fichero `best.nemo`), repositorio de 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del conformer CTC grande de NVIDIA para kinyarwanda (`nvidia/stt_rw_conformer_ctc_large`). La arquitectura conformer combina capas convolucionales y bloques de self-attention, y la cabeza CTC permite alineamientos monotonos sin generación autoregresiva, lo que elimina el modo de fallo de bucles repetitivos que sí presentan los modelos tipo Whisper en audio degradado o disfluente.

El ajuste se realizó únicamente sobre el split de entrenamiento del dataset `cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0`; el split de desarrollo se usó para seleccionar el checkpoint y el de test se evaluó una sola vez tras el entrenamiento. El split `extra` no se utilizó y ningún hablante aparece en más de un split. Hiperparámetros: hasta 10 épocas con early stopping sobre WER de dev (paciencia de 3 evaluaciones), semilla 42, `--lr 1e-4` y precisión `bf16-mixed`. El código está en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto, con el identificador de experimento `nemo-ctc-ky-ft-10ep-frac50`. Las grabaciones se hicieron en Ruanda en 2026, en interiores con poco ruido, mediante una aplicación de tableta, a partir de imágenes (descripción libre) y de texto (lectura de frases).

## Capacidades

- Reconocimiento de voz en kinyarwanda sobre audio de habla no estándar, en particular de personas que tartamudean.
- Transcripción de habla leída (frases con prompt de texto) y de descripciones libres a partir de imágenes.
- Decodificación greedy, un audio cada vez, con normalizador de texto de Whisper y variante con paso de apóstrofo al estilo CDLI.
- Salida CTC sin bucles repetitivos: el modelo no puede entrar en el modo de fallo de repetición de Whisper.
- Transcripción literal: las repeticiones de tartamudeo están escritas en los targets, aunque el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en texto.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Investigación en ASR inclusivo: servir como línea base ajustada para habla tartamuda en kinyarwanda y comparar con el modelo base y con modelos tipo Whisper bajo el mismo normalizador de texto.
- Subtitulado asistido de grabaciones de habla leída: el modelo transcribe frases leídas con un WER agrupado del 41,5 % (normalizador CDLI) y permite al hablante revisar el texto antes de usarlo.
- Aplicaciones de accesibilidad en tableta: integración en una app que transcriba descripciones de imágenes para usuarios con disfluencias, siempre mostrando el texto al hablante antes de cualquier acción.
- Evaluación comparativa de normalizadores: el modelo permite medir el efecto del paso de apóstrofo de CDLI frente al normalizador básico de Whisper (41,5 % frente a 44,3 % de WER agrupado en test).
- Docencia e investigación en lenguas de bajos recursos: ejemplo reproducible de ajuste fino de un conformer CTC de NeMo con `bf16-mixed`, early stopping y splits libres de fuga de hablante.
- Despliegue en local con NeMo: al ser un CTC sin decodificador generativo, la inferencia es determinista y de coste acotado, adecuada para prototipos en entornos con recursos limitados.
- Generación de transcripciones de referencia para anotación: borradores que un anotador humano corrige, dado que la CER del 14,1 % en test es considerablemente menor que el WER.

## Benchmarks y rendimiento

Resultados reportados por el autor con decodificación greedy, un audio cada vez, evaluados con el normalizador básico de Whisper (y, para el test, también con el paso de apóstrofo de CDLI):

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 44,3 | 14,1 | 46,0 | 15,4 | 0 |
| dev (6 hablantes) | 43,3 | 18,9 | 43,2 | 20,0 | 0 |
| test, normalizador CDLI | 41,5 | 13,6 | 43,7 | no disponible | 0 |

El autor advierte que, con solo 9 hablantes en test, no se pueden confirmar diferencias inferiores a unos 3 puntos de WER entre dos modelos. No se publican comparaciones numéricas con el modelo base ni con otras alternativas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,5 GB, pero no se especifica el número de parámetros ni el pico de memoria.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; al tratarse de un conformer CTC de tamaño "large", es plausible que quepa en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: NVIDIA NeMo (formato `.nemo`); no se documenta soporte de vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Métricas publicadas | Disponibilidad |
|---|---|---|---|---|---|
| oluwagbotty/nemo-ctc-ky-ft-10ep-frac50 | Conformer CTC (NeMo) | rw | cc-by-4.0 | WER test 44,3 %; CER 14,1 % | Hugging Face, 0 descargas, 0 likes |
| nvidia/stt_rw_conformer_ctc_large | Conformer CTC (NeMo) | rw | no disponible en la información | no disponible en la información | Hugging Face (modelo base) |
| Modelos tipo Whisper | Transformer encoder-decoder | multilingüe | no disponible en la información | no disponible en la información | no disponible |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, mayoritariamente hombres adultos jóvenes, grabaciones en interior con poco ruido, habla leída y descrita a partir de imágenes, no conversacional. El rendimiento en niños, otras discapacidades, entornos ruidosos, audio telefónico o habla con cambio de código es desconocido.
- Transcripciones literales: las repeticiones de tartamudeo están escritas en los targets y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en texto.
- Sesgo hacia habla leída: las frases leídas también aparecen en las transcripciones de entrenamiento, por lo que los resultados con prompt de imagen son la mejor guía para habla abierta.
- Riesgo de alucinación y de error semántico: una transcripción errónea puede cambiar el significado de lo que dijo la persona; hay que mostrar el texto al hablante antes de actuar sobre él.
- Uso prohibido: no debe emplearse para diagnosticar o evaluar ninguna condición del habla, identificar hablantes ni tomar decisiones clínicas, legales o de aplicación de la ley. Los términos de CDLI prohíben reidentificar hablantes y construir voces que imiten a un hablante.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero los términos del dataset de origen imponen restricciones adicionales sobre reidentificación y clonación de voz.
- Datos no compartidos: el dataset es de acceso restringido (gated) y no se incluye en el repositorio; no puede redistribuirse desde él.
- Sin métricas de latencia, memoria ni número de parámetros, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/nemo-ctc-ky-ft-10ep-frac50
- Modelo base: https://huggingface.co/nvidia/stt_rw_conformer_ctc_large
- Dataset: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Centre for Digital Language Inclusion (UCL): no disponible
- Paper o blog del proyecto: no disponible
- Repositorio de código del proyecto (`scripts/molab/run_experiments.py`, `experiments/finetune.yaml`): no disponible como enlace público en la información proporcionada
