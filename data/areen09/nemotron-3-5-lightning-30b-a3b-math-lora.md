# areen09/Nemotron-3.5-Lightning-30B-A3B-Math-LoRA

- prompt-completion loss masking en entrenamiento
- tool calling: no disponible (no documentado)
- agentes: no disponible
- multilingüe: solo inglés
- no visión/audio

Limitaciones: adaptador no es un modelo autónomo, requiere el base; solo inglés; riesgo de alucinación en matemáticas; licencia OpenMDW 1.1 (revisar términos para uso comercial); 0 descargas/0 likes → no validado por la comunidad; sesgos heredados del base; contexto no documentado; fechas de creación futuras (2026) sugieren metadatos anómalos; soporte de Mamba-2 híbrido limitado en algunos runners.

Now write.## Resumen

El repositorio `areen09/Nemotron-3.5-Lightning-30B-A3B-Math-LoRA` no contiene un modelo completo, sino un adaptador LoRA de tipo PEFT entrenado sobre el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`. El adaptador ha sido ajustado con las trayectorias de razonamiento matemático del dataset `nvidia/Nemotron-SFT-Math-v4` y esta pensado para especializar al modelo base en la resolución de problemas matematicos paso a paso, preservando las trazas de cadena de pensamiento delimitadas por `<think>...</think>`.

El modelo base sobre el que se aplica es una arquitectura hibrida que combina capas Mamba-2, bloques Transformer y mezcla de expertos (MoE), con 30.000 millones de parametros totales y aproximadamente 3.500 millones de parametros activos por token. Esa relacion de activacion (en torno al 12 por ciento del total) situa al modelo en la categoria de MoE dispersa, lo que reduce el coste de inferencia respecto a un modelo denso de 30B, aunque obliga a mantener en memoria la totalidad de los pesos.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo actual de especializacion mediante adaptadores de bajo rango sobre modelos fundacionales grandes, incluyendo el uso de la API Tinker de Thinking Machines Lab como marco de entrenamiento. Por otro lado, permite evaluar si merece la pena desplegar un adaptador de matematicas sobre un MoE hibrido en lugar de recurrir a un modelo denso especializado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo base hibrido Mamba-2 + Transformer con MoE |
| Parametros totales | 30B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | 3,5B (modelo base, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se publica en BF16 |
| Idiomas soportados | ingles (en) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango y alpha del LoRA | rank 32, alpha 64 |
| Dataset de entrenamiento | nvidia/Nemotron-SFT-Math-v4 |
| Framework de entrenamiento | Tinker API (Thinking Machines Lab) |
| Tamano del repositorio | 1,5 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64, entrenado mediante la API Tinker de Thinking Machines Lab. Segun la model card, el entrenamiento preserva integramente las trayectorias de cadena de pensamiento (`<think>...</think>`) y aplica enmascaramiento de perdida sobre prompt y completion (*prompt-completion loss masking*), de modo que el gradiente solo se calcula sobre la parte de respuesta generada y no sobre el enunciado del problema. Este detalle es relevante porque evita que el modelo aprenda a reproducir los enunciados y concentra la capacidad del adaptador en el razonamiento y la solucion final.

El modelo base es una arquitectura hibrida: capas de espacio de estados Mamba-2 combinadas con bloques de atencion Transformer y una capa de mezcla de expertos, con 30B parametros totales y 3,5B activos. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset `Nemotron-SFT-Math-v4`, ni si hubo fases de RLHF o DPO posteriores al ajuste supervisado. Tampoco se detalla la estrategia de inicializacion del adaptador ni la duracion del entrenamiento. El checkpoint de Tinker referenciado es `tinker://39a8c183-c679-5164-aaa0-e3355eff3e96:train:0/sampler_weights/final-pilot-lora-sampler`, etiquetado como "pilot", lo que sugiere un entrenamiento exploratorio mas que una version final consolidada.

## Capacidades

- Generacion de texto con enfasis en razonamiento matematico y resolucion de problemas paso a paso.
- Emision de cadenas de pensamiento explicitas delimitadas por `<think>...</think>`, heredadas del dataset de entrenamiento.
- Resolucion de ecuaciones, algebra y problemas de tipo STEM en formato conversacional (la model card incluye un ejemplo con una ecuacion cuadratica).
- Integracion como adaptador intercambiable en despliegues multi-LoRA con vLLM (`--enable-lora --lora-modules`).
- Compatibilidad con el ecosistema Hugging Face Transformers y PEFT mediante `PeftModel.from_pretrained`.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Soporte de *tool calling* o *function calling*: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla de la cadena de pensamiento: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es exclusivamente `text-generation`.

## Casos de uso

- Resolucion asistida de problemas matematicos: el adaptador genera la solucion completa con la traza de razonamiento visible, lo que permite al usuario auditar cada paso intermedio en lugar de recibir solo el resultado final.
- Generacion de datos sinteticos de razonamiento: al preservar el formato `<think>...</think>`, las salidas pueden reutilizarse como corpus de entrenamiento para modelos mas pequenos o para destilacion de cadenas de pensamiento.
- Tutoria educativa automatizada: el modelo puede desglosar la resolucion de un ejercicio en pasos numerados, util en plataformas de aprendizaje de matematicas que necesitan explicaciones intermedias y no solo respuestas.
- Verificacion de soluciones en pipelines de evaluacion: el adaptador puede emplearse para recomputar una solucion paso a paso y contrastarla con la respuesta de otro modelo, aportando una segunda opinion con razonamiento explicito.
- Servicio multi-adaptador con vLLM: dado que es un LoRA, puede servirse junto al modelo base y a otros adaptadores en la misma instancia, cambiando de especialidad por peticion sin recargar los pesos base.
- Investigacion en PEFT sobre arquitecturas hibridas: el repositorio permite estudiar como se comporta un adaptador de bajo rango sobre una combinacion Mamba-2 + Transformer + MoE, un terreno menos documentado que el de los Transformer densos.
- Extraccion de razonamiento estructurado en dominios cientificos: en tareas donde se requiere justificar un resultado numerico, el formato de traza facilita el postprocesado automatico de los pasos intermedios.
- Punto de partida para ajustes adicionales: al ser un adaptador pequeno (repositorio de 1,5 GB), puede combinarse, reentrenarse o fusionarse con otros LoRA sin duplicar los pesos del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, GSM8K, MATH, HumanEval ni ninguna otra evaluacion cuantitativa, ni comparaciones con el modelo base sin adaptador. La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente servicios genericos de traduccion), por lo que no hay datos externos que permitan estimar la ganancia atribuible al adaptador.

## Requisitos de hardware

Las cifras de memoria que se indican a continuacion son estimaciones derivadas del numero de parametros del modelo base (30B) y no provienen de mediciones publicadas por el autor.

- VRAM para inferencia en BF16: en torno a 60 GB solo para pesos, mas el coste de cache de activaciones y del contexto. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en multiples GPU.
- VRAM para inferencia en cuantizacion de 8 bits: aproximadamente 30 GB, lo que encaja en una A100 40GB, L40S 48GB o RTX 6000 Ada 48GB.
- VRAM para inferencia en cuantizacion de 4 bits: aproximadamente 17-20 GB, lo que permite ejecucion en GPU de consumo de 24 GB (RTX 3090, RTX 4090) con margen limitado para contexto largo.
- GPU de consumo: si, es viable en RTX 3090 o RTX 4090 siempre que el modelo base se cuantice a 4 bits. En BF16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue documentadas: Transformers + PEFT (unico flujo con ejemplo de codigo completo en la model card) y vLLM con `--enable-lora` y `--lora-modules`. El soporte de llama.cpp, Ollama o TGI no esta documentado; dada la arquitectura hibrida Mamba-2, la conversion a GGUF puede encontrar limitaciones segun la version del runtime.
- Latencia y throughput estimados: no disponibles. La ventaja teorica del MoE (3,5B parametros activos por token) reduce el coste computacional por token, pero la necesidad de cargar los 30B de pesos mantiene la presion sobre el ancho de banda de memoria, lo que suele dominar la latencia en decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Parametros activos | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| areen09/Nemotron-3.5-Lightning-30B-A3B-Math-LoRA | 30B (base) + adaptador LoRA r32 | 3,5B | no disponible | Matematicas y razonamiento, ingles | openmdw-1.1 | Hugging Face, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B | 3,5B | no disponible | Proposito general | no disponible | Hugging Face (modelo base) |
| Otros adaptadores o modelos matematicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos alternativos de la misma categoria (adaptadores LoRA de matematicas sobre MoE hibridos) en el material proporcionado, por lo que no es posible establecer una comparacion cuantitativa de rendimiento. La unica comparacion factible es funcional: frente al modelo base sin adaptador, esta version anade especializacion en matematicas a cambio de un incremento minimo de peso (adaptador de 1,5 GB) y sin modificar la arquitectura subyacente.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar el modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` (aproximadamente 60 GB en BF16) ademas del adaptador. El repositorio de 1,5 GB por si solo no es utilizable.
- Idiomas: el campo `language` declara unicamente ingles. No hay evidencia de capacidad multilingue y el castellano no esta soportado de forma declarada.
- Riesgo de alucinacion: como cualquier modelo generativo en tareas matematicas, puede producir cadenas de razonamiento plausibles con resultados finales incorrectos. La traza `<think>` no garantiza la correccion del resultado; conviene validar numericamente las salidas antes de usarlas en produccion.
- Sesgos: no se documenta ninguna evaluacion de sesgos. Al derivar del modelo base, hereda los sesgos presentes en los datos de preentrenamiento de este, que no se detallan.
- Longitud de contexto no documentada: se desconoce la ventana efectiva del modelo base, lo que impide planificar despliegues con entradas largas o conversaciones multi-turno extensas.
- Licencia: openmdw-1.1. Es una licencia de pesos abiertos, pero no se incluye en el material proporcionado el texto de la licencia ni una aclaracion explicita sobre uso comercial. Antes de explotar el adaptador en produccion debe revisarse el texto completo de OpenMDW 1.1 tanto del adaptador como del modelo base, ya que las condiciones del modelo base pueden imponerse sobre los derivados.
- Estado del entrenamiento: el checkpoint de Tinker esta etiquetado como "pilot", lo que apunta a un experimento exploratorio sin validacion rigurosa.
- Validacion nula por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones asociadas.
- Compatibilidad de runtime: la arquitectura hibrida Mamba-2 + Transformer + MoE no esta soportada por todos los motores de inferencia. Solo Transformers + PEFT y vLLM aparecen documentados; conviene verificar el soporte antes de elegir un stack.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026-10-11) son posteriores a la fecha habitual de publicacion de este tipo de artefactos, lo que puede indicar un error de metadatos o una publicacion programada. No afecta a la funcionalidad, pero conviene tenerlo en cuenta al citar el modelo.
- Rendimiento real no medido: no hay benchmarks, por lo que no puede afirmarse que el adaptador mejore al modelo base en ninguna tarea concreta.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/areen09/Nemotron-3.5-Lightning-30B-A3B-Math-LoRA
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Math-v4
- Tinker API (Thinking Machines Lab): enlace no disponible en la informacion proporcionada
- Paper o informe tecnico del modelo base: no disponible en la informacion proporcionada
- Demo o Space asociado: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no se encontraron enlaces relevantes; los resultados devueltos correspondian a servicios genericos de traduccion (Google Traduction, DeepL, Reverso) sin relacion con el modelo.
