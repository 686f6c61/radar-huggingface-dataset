# anonymous-asr-review/whisper-small-independent-cs-r16-seed123

## Resumen

whisper-small-independent-cs-r16-seed123 es un adaptador LoRA (Low-Rank Adaptation) de rango 16 sobre el modelo base openai/whisper-small, orientado a reconocimiento automatico del habla (ASR) con cambio de idioma intra-enunciado (code-switching) entre cingales (si) e ingles (en). El adaptador forma parte de un conjunto de artefactos publicados por el autor anonimo anonymous-asr-review como material suplementario para revision por pares, por lo que no se trata de un modelo final de produccion sino de un componente experimental reproducible. La model card indica la estrategia "independent" del entrenamiento y ofrece la posibilidad de combinarlo con un adaptador para cingales del mismo seed (123) siguiendo la estrategia emparejada ("paired") descrita en el experimento.

El modelo hereda todas las caracteristicas arquitectonicas de Whisper small: un transformer encoder-decoder con aproximadamente 244 millones de parametros en su version multilingue, entrenado por OpenAI sobre 680.000 horas de audio etiquetado de forma debil. La innovacion concreta que anade este artefacto es el ajuste fino parametrizado eficiente (PEFT) con r=16 y LoRA alpha=32, que anade un numero reducido de parametros entrenables y permite adaptar el modelo a un dominio bilingue concreto sin reentrenar los pesos base. El repositorio ocupa 0,0 GB, coherente con un adaptador LoRA y no con pesos completos.

Es relevante ahora porque el code-switching (alternancia de idiomas dentro de una misma conversacion o incluso de una misma frase) es un fenomeno frecuente en comunidades bilingues y sigue siendo un punto debil de los sistemas ASR multilingues estandar, que tienden a forzar una unica etiqueta de idioma por segmento. La publicacion de adaptadores pequenos y combinables facilita reproducir experimentos de adaptacion con coste computacional bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) con adaptador LoRA (PEFT) |
| Parametros totales | ~244 M en el modelo base openai/whisper-small; el adaptador anade un conjunto reducido de parametros entrenables (r=16, alpha=32); numero exacto de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (1500 posiciones en el decoder); el audio de mayor duracion se procesa por segmentacion en ventanas de 30 s |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors en precision completa/16 bits (no especificado en la model card); el modelo base admite cuantizacion INT8, INT4 y GGUF mediante herramientas externas |
| Idiomas soportados | cingales (si) e ingles (en), con foco en code-switching entre ambos |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base openai/whisper-small se descarga por separado |
| Tamano del repositorio | 0,0 GB |
| Tipo de tarea (pipeline) | automatic-speech-recognition |
| Frecuencia de muestreo de entrada | 16 kHz |
| Seed | 123 |
| Rango LoRA / alpha | 16 / 32 |
| Estrategia de entrenamiento | "independent" (combinable con el adaptador de cingales del mismo seed segun la estrategia "paired") |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper small, un transformer encoder-decoder entrenado con supervision debil sobre un corpus a gran escala de audio y transcripciones. El encoder procesa representaciones log-Mel de 80 canales calculadas sobre ventanas de 30 segundos y el decoder genera la transcripcion de forma autorregresiva, condicionada por tokens especiales de idioma y de tarea. Sobre este modelo congelado se ha entrenado un adaptador LoRA de rango 16 y alpha 32, que inyecta matrices de bajo rango en las capas de atencion (y potencialmente en otras proyecciones, aunque la model card no detalla las capas objetivo). La model card no especifica el numero de tokens de audio de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; tampoco detalla hiperparametros de entrenamiento mas alla del rango, el alpha y el seed.

El elemento diferencial del artefacto no es arquitectonico sino metodologico: el entrenamiento se ha realizado de forma "independent" para el seed 123, y la model card indica explicitamente que, para reproducir la estrategia "paired", debe combinarse con el adaptador de cingales correspondiente al mismo seed siguiendo los pesos especificados en el experimento. Esta estructura esta disenada para comparar de forma controlada estrategias de adaptacion al code-switching, aislando el efecto del seed y del rango del adaptador. Al tratarse de material suplementario anonimo para revision por pares, no se documentan en la model card las innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni optimizaciones de inferencia.

## Capacidades

- Transcripcion de audio (ASR) en ingles y cingales a partir de entradas de 16 kHz.
- Manejo de code-switching si-en, es decir, alternancia de idioma dentro de un mismo enunciado o conversacion, que es el objetivo declarado del adaptador.
- Reconocimiento de habla multilingue bilingue limitado al par (si, en) segun los idiomas declarados en la model card; no se documentan otros idiomas para este adaptador.
- Carga mediante la libreria PEFT y fusion con el modelo base mediante merge_and_unload(), lo que permite obtener un modelo unico para inferencia.
- Compatibilidad con el ecosistema Hugging Face Transformers (WhisperForConditionalGeneration, WhisperProcessor).
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de un modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales de vision o audio-vision: no disponibles.
- Modo "thinking" o razonamiento explicito: no disponible.
- Generacion de texto libre, codigo o matematicas: fuera del alcance del modelo; es un sistema especificamente de transcripcion.

## Casos de uso

- Transcripcion de conversaciones bilingues cingales-ingles en entornos de atencion al cliente: el adaptador esta disenado para no forzar una unica etiqueta de idioma por segmento, de modo que puede transcribir turnos en los que el hablante alterna entre cingales e ingles dentro de la misma frase, algo habitual en soporte tecnico y comercial en Sri Lanka.
- Subtitulado de contenido audiovisual bilingue: series, entrevistas o directos donde los participantes mezclan cingales e ingles; el modelo genera transcripciones que alimentan pipelines de subtitulado, con la ventaja de requerir solo un adaptador de bajo coste sobre un modelo base pequeno.
- Documentacion clinica o legal dictada en contextos bilingues: profesionales que dictan informes alternando terminologia tecnica en ingles y frases en cingales pueden transcribirse con un modelo ajustado al dominio, siempre que se valide la calidad en el dominio concreto antes de usarlo en produccion.
- Investigacion en ASR y code-switching: el artefacto esta pensado como material reproducible para comparar estrategias "independent" frente a "paired", variando seed y rango LoRA; es util para grupos que estudian el efecto del rango de adaptacion en tareas de alternancia de idioma.
- Generacion de datasets anotados: la transcripcion automatica de grandes volumenes de audio bilingue puede servir como preanotacion que despues se revisa manualmente, reduciendo el coste de crear corpus etiquetados en cingales-ingles.
- Asistentes de voz para aplicaciones locales: al derivar de un modelo de 244 M de parametros, puede desplegarse en infraestructura modesta o incluso en el borde, permitiendo dictado y transcripcion en aplicaciones de notas o mensajeria sin depender de APIs externas.
- Analisis de reuniones internas en empresas con equipos mixtos: transcripcion de actas donde se mezclan ambos idiomas, con posterior busqueda textual y resumen mediante un LLM independiente.
- Evaluacion comparativa de adaptadores LoRA en ASR: el repositorio permite reproducir experimentos de fusion de adaptadores (combined weights) para medir el impacto de combinar el adaptador de cingales con este adaptador de code-switching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, BLEU, MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica asociada a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper small en FP16 ocupa aproximadamente 1 GB de pesos, por lo que la inferencia cabe holgadamente en 2-4 GB de VRAM incluyendo activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores; en entornos de servidor, T4, L4, A10, A100 o H100 estan sobradamente dimensionadas para este tamano.
- Compatibilidad con GPU de consumo: si, el modelo base y el adaptador caben en practicamente cualquier GPU de consumo moderna e incluso en CPU, dado el reducido numero de parametros.
- Opciones de despliegue: Transformers con PEFT (ruta documentada en la model card, con merge_and_unload), vLLM (con soporte para modelos Whisper, sujeto a version), faster-whisper o CTranslate2 previa conversion, y whisper.cpp o llama.cpp previa fusion del adaptador y conversion a GGUF. Tambien es posible el despliegue mediante Text Generation Inference con soporte ASR, segun version.
- Latencia y throughput estimados: no disponibles; dependen del hardware, del backend, de la duracion del audio y de si se aplica decodificacion por lotes o por segmentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-independent-cs-r16-seed123 | ~244 M (base) + adaptador LoRA r=16 | Ventana de audio de 30 s | si, en (code-switching) | no disponible | Hugging Face (repositorio anonimo, 0 descargas) |
| openai/whisper-small | ~244 M | Ventana de audio de 30 s | ~99 idiomas (version multilingue) | Apache 2.0 (modelo base de OpenAI) | Hugging Face, ampliamente utilizado |
| openai/whisper-base | ~74 M | Ventana de audio de 30 s | ~99 idiomas (version multilingue) | Apache 2.0 | Hugging Face |
| openai/whisper-medium | ~769 M | Ventana de audio de 30 s | ~99 idiomas (version multilingue) | Apache 2.0 | Hugging Face |

No hay datos de benchmarks publicados para este adaptador, por lo que no es posible comparar su WER frente a las alternativas de la tabla. La comparacion disponible se limita a parametros, contexto, cobertura de idiomas, licencia y disponibilidad. La licencia del adaptador no esta declarada, lo que impide confirmar si su uso comercial esta permitido, mientras que los modelos base de OpenAI se distribuyen bajo Apache 2.0.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial ni de redistribucion. Es un riesgo juridico relevante para cualquier integracion en produccion.
- Artefacto anonimo de revision por pares: el repositorio no esta asociado a un autor identificable ni a una publicacion citable en la informacion disponible, lo que dificulta la trazabilidad y la reproducibilidad a largo plazo.
- Ausencia total de benchmarks: no hay cifras de WER ni de ningun otro metrica publicada, por lo que no es posible estimar la calidad real del adaptador en el dominio objetivo sin evaluarlo de forma independiente.
- Riesgo de alucinacion y de transcripciones erroneas: como todo modelo de la familia Whisper, puede generar texto plausible pero incorrecto, especialmente en audio con ruido, acentos marcados, terminologia especializada o solapamiento de hablantes.
- Sesgos: no se documenta la composicion del dataset de ajuste, por lo que no puede evaluarse el sesgo respecto a variedades dialectales del cingales, genero, edad o acento de los hablantes. Whisper ha mostrado historicamente un rendimiento desigual entre idiomas y variedades.
- Limitaciones de idioma: la cobertura declarada se limita a si y en, con enfasis en code-switching; no debe asumirse un rendimiento equivalente en otros idiomas aunque el modelo base sea multilingue.
- Limitacion de contexto: la ventana de 30 segundos obliga a segmentar audios largos; los cortes pueden partir palabras o cambios de idioma y degradar la transcripcion si no se gestionan con solapamiento.
- Dependencia del modelo base: el adaptador requiere descargar openai/whisper-small por separado y aplicar merge_and_unload() o cargarlo mediante PEFT; cualquier cambio en la version del modelo base puede afectar a los resultados.
- Frecuencia de muestreo obligatoria de 16 kHz: audio en otras frecuencias debe remuestrearse previamente, y no se documenta el comportamiento con audio telefonico de banda estrecha ni con muestras de mayor calidad.
- Reproducibilidad condicionada: la model card remite a "los pesos especificados en el experimento" para la estrategia "paired", sin detallar esos pesos en el repositorio, lo que puede impedir reproducir exactamente la combinacion de adaptadores.
- Idoneidad para produccion no demostrada: al ser material suplementario de investigacion, no hay garantias de estabilidad, mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/anonymous-asr-review/whisper-small-independent-cs-r16-seed123
- Modelo base: https://huggingface.co/openai/whisper-small
- Libreria PEFT: https://huggingface.co/docs/peft/index
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper

No se han encontrado en la busqueda web enlaces relevantes adicionales (papers, blogs, repositorios o demos) asociados a este adaptador concreto; los resultados devueltos corresponden a entidades no relacionadas con el modelo.
