# oluwagbotty/fastconformer-ctc-en-ft

## Resumen

fastconformer-ctc-en-ft es un modelo de reconocimiento automatico del habla (ASR) en ingles obtenido por ajuste fino de nvidia/stt_en_fastconformer_ctc_large, un FastConformer-CTC de unos 115 millones de parametros desarrollado por NVIDIA. El ajuste lo publica el usuario oluwagbotty sobre la particion de entrenamiento del dataset CDLI Rwandan English non-standard speech v1.0, cuyos hablantes son en su mayoria jovenes adultos con tartamudez. El objetivo declarado es un proyecto de investigacion sobre reconocimiento del habla de bajo coste para personas que tartamudean, en el marco del Rwanda Innovation Sprint impulsado por CDLI (Centre for Digital Language Inclusion, UCL).

El modelo resuelve una tarea concreta: transcribir ingles hablado por personas que tartamudean en condiciones de grabacion controladas (interiores, poco ruido, tableta). Frente a modelos generativos como Whisper, que pueden entrar en bucles de repeticion, la arquitectura CTC empleada no puede generar bucles, lo que el autor presenta como ventaja para este tipo de audio. Los pesos se distribuyen en formato NeMo (best.nemo) y el repositorio ocupa aproximadamente 0,5 GB.

Se trata de un modelo de investigacion, con solo 9 hablantes en test y condiciones muy acotadas, no de un producto listo para produccion general. Su interes actual es doble: documenta el rendimiento de un FastConformer-CTC sobre habla no estandar y sirve como referencia reproducible (semilla, hiperparametros y scripts publicados) para quien quiera adaptar ASR a poblaciones infrarrepresentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CTC (transformer convolucional-aumentado, decodificacion CTC) |
| Parametros totales | ~115M (heredados del modelo base nvidia/stt_en_fastconformer_ctc_large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | NeMo (best.nemo) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer-CTC "large" de NVIDIA, una variante de Conformer que combina bloques de atencion con convoluciones depthwise y reduce el coste computacional mediante subsampling de la secuencia de entrada. La cabeza de salida es CTC, de modo que la decodificacion es codiciosa (greedy) sin modelo de lenguaje externo en los resultados reportados. El modelo original de NVIDIA se entreno sobre NeMo ASRSet con aproximadamente 24.500 horas de habla en ingles y transcribe en alfabeto ingles en minusculas con espacios y apostrofos.

El ajuste fino se realizo unicamente sobre la particion de entrenamiento del dataset cdli/rwandan_english_nonstandard_speech_v1.0, usando la particion dev para seleccionar el checkpoint y la particion test para una unica evaluacion final; la particion "extra" no se uso y ningun hablante aparece en mas de una particion. Se entrenaron hasta 6 epocas con early stopping sobre WER de dev (paciencia de 3 evaluaciones), semilla 42, learning rate 1e-4 y precision bf16-mixed. El codigo esta en scripts/molab/run_experiments.py y experiments/finetune.yaml del repositorio del proyecto (experimento fastconformer-ctc-en-ft). No se menciona RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Transcripcion de voz a texto en ingles con salida en minusculas, espacios y apostrofos.
- Reconocimiento de habla no estandar, en particular tartamudez (repeticiones, bloqueos y prolongaciones en el audio), aunque los bloqueos y prolongaciones no son visibles en el texto.
- Decodificacion CTC codiciosa: no puede entrar en bucles de repeticion, a diferencia de modelos autorregresivos como Whisper.
- Procesamiento de grabaciones individuales (una grabacion por inferencia en la evaluacion reportada).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio multimodal ni modo de razonamiento.
- Capacidad multilingue limitada al ingles; no se reporta soporte de code-switching.

## Casos de uso

- Investigacion sobre ASR para habla no estandar: servir de punto de partida reproducible (semilla, hiperparametros y scripts publicados) para estudiar como se comporta un FastConformer-CTC con tartamudez en ingles.
- Prototipos de transcripcion asistida en entornos clinicos o educativos de paises angloparlantes o con ingles como segunda lengua, siempre con revision humana del texto antes de actuar sobre el.
- Evaluacion comparativa de arquitecturas CTC frente a modelos autorregresivos en audio con disfluencias, aprovechando que el CTC no genera bucles.
- Generacion de transcripciones de referencia para anotar nuevos corpus de habla no estandar, con posterior validacion por anotadores.
- Demostraciones de bajo coste en el marco de proyectos de inclusion digital (tipo Rwanda Innovation Sprint), donde el tamano de 0,5 GB y los ~115M de parametros facilitan el despliegue en hardware modesto.
- Base para ajustes posteriores con mas hablantes, otros acentos o condiciones de ruido, dado que la licencia cc-by-4.0 permite reutilizacion con atribucion.

## Benchmarks y rendimiento

Resultados reportados por el autor con decodificacion greedy, una grabacion por vez y normalizador de texto basico de Whisper. El WER agrupado cuenta todas las palabras juntas; el WER y CER por enunciado son medias sobre grabaciones (cada una limitada al 100%).

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 28,3 | 18,1 | 31,3 | 20,0 | 0 |
| dev (6 hablantes) | 34,2 | 23,2 | 33,5 | 22,2 | 0 |

El propio autor advierte que, con solo 9 hablantes en test, no se pueden confirmar diferencias inferiores a unos 3 puntos de WER entre dos modelos. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~115M de parametros y pesos en precision mixta bf16, la huella es del orden de unos pocos cientos de MB, adecuada para GPU consumer.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) deberia ser suficiente, aunque no hay mediciones publicadas.
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque no se han publicado cifras de latencia ni throughput.
- Opciones de despliegue: NeMo (framework nativo, con el fichero best.nemo); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastconformer-ctc-en-ft (este modelo) | ~115M | no disponible | 28,3 % agrupado (9 hablantes) | cc-by-4.0 | Hugging Face, formato NeMo |
| nvidia/stt_en_fastconformer_ctc_large (base) | ~115M | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face / NGC |
| Whisper (familia, referencia cualitativa) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con el modelo base o con Whisper no esta disponible: el autor solo menciona a Whisper como referencia del normalizador de texto y de un modo de fallo (bucles) que el CTC no presenta.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, en su mayoria hombres jovenes adultos, grabaciones en interiores con poco ruido, habla leida y descrita a partir de imagenes, no conversacional. No se conoce el rendimiento con ninos, otras discapacidades, entornos ruidosos, audio telefonico ni habla con cambio de codigo.
- Objetivos literales: las repeticiones por tartamudez aparecen escritas en las transcripciones, y el modelo puede o no reproducirlas; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia los prompts de texto: las frases leidas tambien aparecen en las transcripciones de entrenamiento, por lo que los resultados con prompts de imagen son la mejor guia para habla abierta.
- No apto para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni en decisiones clinicas, legales o de aplicacion de la ley. Los terminos de CDLI prohiben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de alucinacion y errores de transcripcion: una transcripcion erronea puede cambiar el significado de lo dicho; debe mostrarse el texto al hablante antes de actuar sobre el.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero el dataset de origen esta restringido (acceso con puerta y terminos de CDLI) y no se incluye en el repositorio.
- Artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/fastconformer-ctc-en-ft
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_ctc_large
- Ficha del modelo base en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/teams/nemo/models/stt_en_fastconformer_ctc_large
- Dataset de ajuste fino: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
