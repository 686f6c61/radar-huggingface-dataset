# oluwagbotty/parakeet-ctc-en-ft-10ep-s3

## Resumen

`oluwagbotty/parakeet-ctc-en-ft-10ep-s3` es un modelo de reconocimiento automatico del habla (ASR) en ingles obtenido mediante ajuste fino de `nvidia/parakeet-ctc-0.6b`, un modelo CTC de la familia Parakeet de NVIDIA. El ajuste se ha realizado sobre la particion de entrenamiento del dataset CDLI Rwandan English non-standard speech v1.0, cuyos hablantes son en su mayoria adultos jovenes con tartamudez, grabado en Ruanda en 2026. El autor es `oluwagbotty` y el trabajo se enmarca en el Rwanda Innovation Sprint del Centre for Digital Language Inclusion (UCL), financiado por UK International Development a traves del programa AT2030 con apoyo de Google.org.

El modelo resuelve un problema concreto: los sistemas ASR comerciales rinden peor con habla no estandar, y la tartamudez (repeticiones, bloqueos y prolongaciones) es un fenomeno especialmente dificil porque las transcripciones verbatim recogen repeticiones que el modelo puede o no reproducir. Al partir de un CTC en lugar de un modelo autorregresivo, evita el fallo tipico de bucles de repeticion en la decodificacion.

Es relevante por su caracter de investigacion aplicada a inclusion digital: demuestra que un ajuste fino corto (hasta 10 epocas, learning rate 1e-4, precision bf16-mixed) sobre un corpus pequeno y especifico produce un WER agrupado del 26,1 % en test con 9 hablantes, sin bucles de decodificacion. El repositorio pesa 2,4 GB y los pesos se distribuyen en formato `.nemo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer CTC (familia NVIDIA Parakeet, via NeMo) |
| Parametros totales | 0,6 mil millones (heredados del modelo base `nvidia/parakeet-ctc-0.6b`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | `.nemo` (archivo `best.nemo` dentro del repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `nvidia/parakeet-ctc-0.6b`, un ASR con cabeza CTC (Connectionist Temporal Classification) de la familia Parakeet de NVIDIA, implementado en la libreria NeMo. La cabeza CTC predice directamente la secuencia de tokens sin decodificacion autorregresiva, lo que elimina por construccion el fallo de bucles de repeticion que afecta a modelos como Whisper; la model card confirma explicitamente cero bucles en test y dev.

El entrenamiento uso unicamente la particion de entrenamiento del dataset `cdli/rwandan_english_nonstandard_speech_v1.0`; la particion de desarrollo selecciono el checkpoint y la de test se puntuo una sola vez tras el entrenamiento. La particion `extra` no se uso y ningun hablante aparece en mas de una particion. Se entrenaron hasta 10 epocas con parada temprana sobre el WER de dev (paciencia de 3 evaluaciones), semilla 3, `--lr 1e-4` y `--precision bf16-mixed`. El codigo esta en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto (experimento `parakeet-ctc-en-ft-10ep-s3`). Las grabaciones se hicieron en interiores con bajo ruido, mediante una aplicacion de tableta, a partir de estimulos de imagen (descripciones libres) y de texto (frases leidas).

## Capacidades

- Reconocimiento automatico del habla en ingles sobre audio de un solo hablante, con decodificacion greedy.
- Transcripcion de habla no estandar, especificamente de personas que tartamudean, incluyendo repeticiones reflejadas en transcripciones verbatim.
- Salida CTC sin bucles de repeticion (fallo tipico de modelos autorregresivos como Whisper).
- Evaluacion con normalizador de texto basico de Whisper (WER y CER).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo puramente acustico-to-texto.
- No soporta vision ni audio como entrada mas alla del propio audio de reconocimiento.
- Capacidad multilingue limitada al ingles; no se ha validado para habla con cambio de codigo (code-switching).

## Casos de uso

- Investigacion sobre ASR inclusivo: servir como linea base reproducible para estudiar el rendimiento de modelos CTC en habla con tartamudez, comparando WER agrupado y por emision frente a arquitecturas autorregresivas.
- Transcripcion asistida en entornos clinicos o de accesibilidad (con supervision humana): generar un borrador de transcripcion de grabaciones de personas que tartamudean para que el propio hablante lo revise antes de usarlo, tal como recomienda la model card.
- Prototipos de bajo coste en contextos con recursos limitados: el tamano de 0,6 B y la decodificacion greedy permiten desplegar el modelo en hardware modesto para pruebas de campo, como el Rwanda Innovation Sprint.
- Evaluacion de tecnicas de ajuste fino: el repositorio documenta hiperparametros, semilla y criterio de parada temprana, lo que permite reproducir y comparar variantes de entrenamiento sobre el mismo corpus.
- Analisis de fenomenos de disfluencia: al usar transcripciones verbatim, permite estudiar si el modelo reproduce repeticiones y como afecta esto a las metricas de error.
- Generacion de subtitulos en ingles para material grabado en condiciones controladas (interior, bajo ruido, tableta), con revision posterior obligatoria por parte del hablante.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, una grabacion a la vez, normalizador de texto basico de Whisper):

| Particion | WER agrupado (%) | CER (%) | WER por emision (%) | CER por emision (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 26,1 | 16,5 | 28,5 | 18,0 | 0 |
| dev (6 hablantes) | 31,6 | 21,1 | 30,4 | 19,8 | 0 |

El autor advierte que, con solo 9 hablantes en test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano de 0,6 B de parametros, es previsible que quepa en GPUs de consumo, pero no se aportan cifras.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: NeMo (libreria declarada); el modelo tambien aparece documentado en Transformers (`model_doc/parakeet`), aunque no se confirma compatibilidad de estos pesos concretos con esa via.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `oluwagbotty/parakeet-ctc-en-ft-10ep-s3` | 0,6 B | no disponible | WER test 26,1 % (9 hablantes, habla con tartamudez) | cc-by-4.0 | Hugging Face (0 descargas) |
| `nvidia/parakeet-ctc-0.6b` (modelo base) | 0,6 B | no disponible | Precisión de referencia en lenguas comunes segun NVIDIA; sin cifras concretas en la informacion disponible | no disponible en la informacion proporcionada | Hugging Face |
| `nvidia/parakeet-ctc-1.1b` | 1,1 B | no disponible | no disponible | no disponible | Hugging Face / Transformers |

No se dispone de resultados comparativos directos entre estos modelos sobre el mismo corpus de habla con tartamudez.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, mayoritariamente hombres adultos jovenes, grabaciones en interior silencioso, habla leida y descrita por imagenes, no conversacional. Se desconoce el rendimiento con ninos, otras discapacidades, entornos ruidosos, audio telefonico o cambio de codigo.
- Objetivos verbatim: las repeticiones por tartamudez aparecen escritas en las transcripciones, y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia estimulos de texto: las frases leidas tambien aparecen en las transcripciones de entrenamiento, por lo que los resultados con estimulos de imagen son la mejor guia para habla abierta.
- Prohibido para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni en decisiones clinicas, legales o de aplicacion de la ley. Los terminos de CDLI prohiben reidentificar hablantes y construir voces que imiten a un hablante.
- Riesgo de alterar el significado: una transcripcion erronea puede cambiar lo que dijo la persona; debe mostrarse el texto al hablante antes de actuar sobre el.
- Acceso a datos restringido: el dataset es de acceso con puerta (gated) y no se incluye en el repositorio; no puede compartirse desde el.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero las restricciones de los terminos de CDLI sobre reidentificacion y clonacion de voz siguen aplicando al uso de los datos.
- Sin validacion fuera de dominio: no hay resultados publicados para otros acentos, edades o condiciones de grabacion distintas de las descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/parakeet-ctc-en-ft-10ep-s3
- Modelo base: https://huggingface.co/nvidia/parakeet-ctc-0.6b
- Dataset CDLI Rwandan English non-standard speech v1.0: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Documentacion de Parakeet en Transformers: https://huggingface.co/docs/transformers/v5.6.1/model_doc/parakeet
