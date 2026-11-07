# oluwagbotty/parakeet-ctc-en-ft

## Resumen

`oluwagbotty/parakeet-ctc-en-ft` es un ajuste fino del modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-ctc-0.6b` de NVIDIA, especializado en ingles hablado por personas que tartamudean. Lo desarrolla el usuario de Hugging Face oluwagbotty en el marco de un proyecto de investigacion sobre reconocimiento de voz de bajo coste para personas con disfluencias, dentro del Rwanda Innovation Sprint impulsado por el CDLI (Centre for Digital Language Inclusion, UCL). Resuelve el problema de que los sistemas ASR genericos rinden peor ante habla no estandar, en particular repeticiones, bloqueos y prolongaciones propias de la tartamudez.

El modelo parte de la arquitectura FastConformer CTC de NVIDIA (familia Parakeet), con aproximadamente 0,6 mil millones de parametros y salida CTC (Connectionist Temporal Classification), lo que lo hace mas robusto frente a fallos de bucle en la decodificacion que los modelos autorregresivos tipo Whisper. El ajuste se realizo exclusivamente sobre el split de entrenamiento del dataset `cdli/rwandan_english_nonstandard_speech_v1.0`, con hablantes principalmente jovenes adultos que tartamudean, grabados en Ruanda en 2026 en condiciones de interior y bajo ruido.

Es relevante ahora porque aborda un nicho poco cubierto por los modelos ASR comerciales, con licencia CC-BY-4.0 y pesos abiertos, y porque documenta de forma transparente sus metricas (WER agrupado del 27,0 % en test) y sus limitaciones. No obstante, el conjunto de evaluacion es muy pequeno (9 hablantes) y las condiciones son estrechas, por lo que debe tratarse como un modelo de investigacion mas que como un sistema listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer CTC (familia NVIDIA Parakeet) |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de `nvidia/parakeet-ctc-0.6b`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato `.nemo`, sin variantes GGUF publicadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | NeMo (`.nemo`, archivo `best.nemo`); tamano del repo 2,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura FastConformer CTC de NVIDIA, un encoder Conformer con atencion por chunks (subsampling convolucional y atencion relativa) seguido de una cabeza CTC. La salida CTC evita la decodificacion autorregresiva, lo que segun la model card elimina el fallo de "bucles" (repeticiones infinitas) tipico de modelos seq2seq como Whisper. El modelo base `nvidia/parakeet-ctc-0.6b` fue entrenado por NVIDIA sobre datos propietarios con cientos de miles de horas de GPU, pero el ajuste fino aqui descrito solo anade el entrenamiento sobre el dataset de habla no estandar.

El ajuste fino se realizo unicamente sobre el split de entrenamiento de `cdli/rwandan_english_nonstandard_speech_v1.0`, con el split de desarrollo usado para seleccionar el checkpoint y el split de test evaluado una sola vez tras el entrenamiento; el split `extra` no se uso y ningun hablante aparece en mas de un split. Se entrenaron hasta 6 epocas con early stopping sobre el WER de desarrollo (paciencia de 3 evaluaciones), semilla 42, `--lr 1e-4` y precision `bf16-mixed`. Las grabaciones se hicieron en Ruanda en 2026, en interiores con bajo ruido, mediante una app de tableta, a partir de descripciones de imagenes (habla libre) y frases leidas.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) de ingles, con enfasis en habla no estandar y disfluente (tartamudez).
- Transcripcion verbatim: las repeticiones de la tartamudez aparecen escritas en los targets, aunque el modelo puede o no reproducirlas.
- Decodificacion greedy sobre grabaciones individuales; sin fallos de bucle por la naturaleza CTC.
- Manejo de dos modalidades de entrada: habla leida (frases) y habla libre descrita a partir de imagenes.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No tiene capacidades multimodales mas alla del audio de entrada (sin vision, sin audio generativo, sin modo thinking).
- Capacidad multilingue limitada al ingles; no se documenta soporte de code-switching.

## Casos de uso

- Transcripcion de habla con tartamudez en entornos de investigacion: el modelo esta ajustado especificamente sobre hablantes que tartamudean, por lo que sirve para estudiar como varian las transcripciones ante repeticiones y bloqueos frente a modelos genericos.
- Accesibilidad en aplicaciones de dictado: integraria un pipeline ASR para personas con disfluencias en ingles, mostrando siempre el texto al hablante antes de actuar sobre el, tal como recomienda la model card.
- Evaluacion comparativa de ASR en habla no estandar: util como linea base publica (WER agrupado 27,0 % en test) frente a Whisper u otros modelos en estudios academicos.
- Prototipos de bajo coste en contextos con recursos limitados: el tamano de 0,6 B de parametros y el repo de 2,4 GB permiten desplegarlo en hardware modesto para pilotos de investigacion.
- Analisis linguistico de disfluencias: permite obtener transcripciones verbatim para estudiar repeticiones y patrones de habla en corpus de hablantes que tartamudean.
- Transcripcion de habla leida en condiciones controladas: para frases leidas en interior y bajo ruido, donde el modelo rinde mejor segun la propia model card.
- Docencia y formacion en ASR: ejemplo reproducible de ajuste fino de un modelo NeMo sobre un dataset gated, con codigo y configuracion publicados en el repositorio del proyecto.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, una grabacion a la vez, normalizador de texto basico de Whisper):

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 27,0 | 17,5 | 29,9 | 19,2 | 0 |
| dev (6 hablantes) | 33,4 | 22,6 | 32,3 | 21,6 | 0 |

Nota del autor: con solo 9 hablantes en test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse. No se han publicado comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con aproximadamente 0,6 B de parametros en bf16 el peso de los pesos ronda 1,2 GB, por lo que la huella de memoria es modesta (el repo completo son 2,4 GB).
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cualquier GPU con al menos 4-8 GB de VRAM deberia poder ejecutarlo.
- Cabe en GPU de consumo: previsiblemente si (por ejemplo, RTX 3060 12 GB o superiores), aunque el autor no lo confirma.
- Opciones de despliegue: NeMo (libreria nativa del modelo, pesos `.nemo`); no se documentan variantes para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM, no a ASR NeMo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oluwagbotty/parakeet-ctc-en-ft | aprox. 0,6 B | no disponible | 27,0 % (agrupado, 9 hablantes) | CC-BY-4.0 | Hugging Face (pesos `.nemo`) |
| nvidia/parakeet-ctc-0.6b (base) | aprox. 0,6 B | no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| nvidia/parakeet-ctc-1.1b | aprox. 1,1 B | no disponible | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| Whisper (referencia de fallo por bucles) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: solo 9 hablantes en test, mayoritariamente hombres jovenes adultos, grabaciones en interior con bajo ruido, habla leida y descrita por imagenes, no conversacional. El rendimiento en ninos, otras discapacidades, entornos ruidosos, audio telefonico o habla con code-switching es desconocido.
- Targets verbatim: las repeticiones de la tartamudez estan escritas en las transcripciones; el modelo puede o no reproducirlas. Los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia frases leidas: las frases leidas tambien aparecen en las transcripciones de entrenamiento, por lo que los resultados con descripciones de imagenes son la mejor guia para habla abierta.
- Prohibido para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni en decisiones clinicas, legales o policiales. Los terminos del CDLI prohiben reidentificar hablantes y crear voces que imiten a una persona.
- Riesgo de alucinacion y errores de transcripcion: una transcripcion erronea puede cambiar el significado de lo dicho; debe mostrarse el texto al hablante antes de actuar sobre el.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero los terminos del dataset CDLI (acceso gated) imponen restricciones adicionales sobre los datos y sobre la reidentificacion de hablantes.
- Modelo de investigacion: sin garantias de robustez en produccion general; el propio autor advierte que diferencias de menos de 3 puntos de WER no son concluyentes con 9 hablantes.
- Idiomas: solo ingles; sin soporte documentado de otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/parakeet-ctc-en-ft
- Modelo base: https://huggingface.co/nvidia/parakeet-ctc-0.6b
- Dataset: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Ficha de parakeet-ctc en AxForge: https://axforge.ai/models/parakeet-ctc/
