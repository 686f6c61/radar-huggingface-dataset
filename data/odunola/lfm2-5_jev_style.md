# odunola/lfm2.5_jev_style

## Resumen

`odunola/lfm2.5_jev_style` es un checkpoint experimental de prediccion estructurada desarrollado por el usuario odunola dentro del proyecto Audio Jev. No es un modelo de lenguaje generativo al uso: parte de `LiquidAI/LFM2.5-350M` como modelo base congelado y anade adaptadores LoRA mas una cabeza de esquema conjunta que, en una sola pasada hacia delante, devuelve una distribucion de probabilidad sobre cada respuesta permitida de un conjunto de preguntas definidas por el usuario.

El problema que resuelve es el de evaluar un estado textual contra preguntas con respuestas restringidas (tipos Noul, Choice y Score) y obtener probabilidades utilizables para seleccionar la siguiente accion de una aplicacion. Se entrena sobre el dataset `ZefanCai/Open-Jev` (release-v2-redistributable) y toma ideas de los formatos Jev y Clef, aunque se trata de una implementacion independiente no publicada por TypeSafe, Cloudflare ni Liquid AI.

Es relevante ahora por su tamano reducido (10.632.452 parametros entrenados, checkpoint de unos 41 MiB sobre una base de ~350 M de parametros) y porque puede ejecutarse en CPU y en Apple Silicon MPS, lo que lo hace apto para prototipos de enrutamiento de decisiones en el borde. El autor advierte de que es un checkpoint de investigacion, con validacion muy limitada y sin auditoria de calidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base LiquidAI/LFM2.5-350M congelado + adaptadores LoRA + cabeza de esquema conjunta (joint schema head) para Noul, Choice y Score |
| Parametros totales | Aproximadamente 350 M del modelo base mas 10.632.452 parametros entrenados en el adaptador y la cabeza (cifra de parametros totales del conjunto no confirmada en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 2.048 tokens (el encoder rechaza prompts con mas de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye como `step-10000.pt`; no se documentan variantes GGUF, AWQ, GPTQ ni cuantizaciones de 8 o 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`) cargado con `torch.load(..., weights_only=True)`; no es un adaptador PEFT estandar y no contiene los pesos base congelados ni el estado del optimizador |

## Arquitectura y entrenamiento

La arquitectura combina un modelo base congelado `LiquidAI/LFM2.5-350M` con un adaptador LoRA de rango 8 y alpha 16, y una cabeza de esquema conjunta que proyecta hacia tres tipos de pregunta: Noul (resultados true/false con descripciones opcionales), Choice (objeto que mapea identificadores de opcion a descripciones) y Score (array ordenado de niveles indexados desde cero). La cabeza usa una anchura de 256 con 4 cabezas de atencion, 4 capas de cabeza, 2 capas de enrutamiento, anchura de feedforward de 1.024 y dropout 0. El encoder incluye los identificadores de pregunta y de opcion en el prompt y admite multiples preguntas por peticion.

El entrenamiento consistio en 10.000 actualizaciones del optimizador con micro-lote 8 y acumulacion 1, tasa de aprendizaje 0,0001 y autocast en BF16 sobre GPU. La funcion de perdida es entropia cruzada con label smoothing de 0,1 mas un termino Brier con peso 1, sobre objetivos supervisados que incluyen distribuciones de probabilidad. No se empleo RLHF, RLCR ni GRPO. El autor advierte que la configuracion de entrenamiento no fija una revision concreta del modelo base, por lo que no se puede garantizar la reproduccion exacta a partir de la configuracion registrada, y que el parametro de epocas de `training_metadata.json` es un valor de configuracion, no un recuento verificado de epocas completadas.

## Capacidades

- Prediccion estructurada sobre estados textuales: dado un estado y un conjunto de preguntas, devuelve una probabilidad por cada respuesta permitida en una sola pasada hacia delante.
- Preguntas de tipo Noul: resultados booleanos (true/false) con descripciones opcionales por criterio.
- Preguntas de tipo Choice: seleccion entre un conjunto de opciones identificadas por identificador y descripcion.
- Preguntas de tipo Score: puntuacion ordinal sobre niveles ordenados; el nivel ponderado se calcula como `sum(index * probability)`.
- Procesamiento de multiples preguntas simultaneas en una misma peticion.
- Entrada limitada a texto y JSON; el checkpoint no procesa audio, a pesar de que el objetivo a largo plazo del proyecto Audio Jev sea el procesamiento de audio.
- Salida como mapa de probabilidades personalizado: no sigue el formato oficial de respuesta de la API de Jev y no se carga con `AutoModelForCausalLM`.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa; el modelo esta pensado como modulo de decision dentro de un bucle externo.
- Capacidades multilingues: no disponibles.
- Capacidad especial: cabeza de esquema conjunta con tipos de pregunta Jev; no se documenta modo de razonamiento (thinking mode), vision ni audio.

## Casos de uso

- Enrutamiento de decisiones en atencion al cliente: el modelo puede evaluar el estado de una conversacion con la pregunta `refund_requested` y utilizar la probabilidad resultante para decidir si se abre un flujo de devolucion, se escala a un agente humano o se solicita mas informacion.
- Clasificacion de intenciones con respuestas restringidas: mediante preguntas de tipo Choice, se puede mapear un mensaje entrante a un conjunto cerrado de categorias conocidas por el sistema, evitando respuestas fuera de catalogo.
- Puntuacion ordinal en encuestas y formularios: con preguntas de tipo Score se obtiene una distribucion sobre niveles ordenados (por ejemplo, severidad o satisfaccion) y se calcula el nivel esperado como suma ponderada.
- Anotacion asistida de datos: el checkpoint puede generar distribuciones de probabilidad sobre etiquetas permitidas para preetiquetar corpus que despues se revisan manualmente, ya que la salida es directamente un vector de probabilidades.
- Guardarrailes y validacion de esquemas en pipelines de agentes: al devolver probabilidades sobre opciones permitidas, permite verificar si el estado cumple una condicion antes de ejecutar una accion, con umbrales configurables por la aplicacion.
- Modulo embebido en entornos con recursos limitados: el checkpoint pesa unos 41 MiB y se ha probado en CPU y Apple Silicon MPS, lo que permite integrarlo como componente local sin GPU dedicada.
- Prototipado de formato Jev o Clef: sirve para experimentar con estados, preguntas y distribuciones de respuesta sin depender de implementaciones propietarias.
- Pre-triaje de formularios (por ejemplo, admision hospitalaria): el autor probo preguntas de admision en la interfaz de navegador, pero estos tests informales no establecen precision medica y no deben usarse en produccion clinica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evaluacion documentada es una prueba local pequena, que se reproduce a continuacion tal y como la describe el autor:

| Prueba | Resultado |
|---|---|
| Registros de validacion de Open-Jev utilizados | 8 |
| Preguntas con una unica etiqueta correcta | 46 de 46 respuestas correctas |
| Preguntas con distribucion de probabilidad como objetivo | 2 |
| Robustez ante reformulacion del estado | Pasó de 10 de 10 respuestas correctas a 8 de 10 al cambiar el enunciado de dos estados sin cambiar su significado |
| Evaluacion en GPU, vLLM o suites comparativas | no disponible |

El propio autor indica que esta prueba no establece una precision general y que no comparo todos los checkpoints guardados para identificar el mejor.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia aproximada, los pesos base de ~350 M en BF16 ocuparian del orden de 0,7 GB y en FP32 del orden de 1,4 GB, a lo que hay que sumar el adaptador y la cabeza (checkpoint de ~41 MiB) y el coste de activaciones; son estimaciones, no cifras facilitadas por el autor.
- GPU recomendadas: no se especifican. El autor ha probado CPU y Apple Silicon MPS y documenta el flag `--device cuda` para instalaciones CUDA, pero no recomienda modelos concretos de GPU.
- GPU de consumo: por tamano, cabria con margen amplio en GPUs de consumo con 4 GB o mas de VRAM, como una RTX 3050, RTX 3060 o RTX 4090.
- Opciones de despliegue: el paquete incluye `inference.py` para linea de comandos y un cargador propio. No se puede cargar con `AutoModelForCausalLM`, no es un adaptador PEFT estandar y no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Entorno de ejecucion: Python 3.14 segun el entorno de desarrollo del autor; el tokenizer suministrado debe usarse con este checkpoint.
- Latencia y throughput: no disponibles. La interfaz de navegador local muestra el recuento de tokens de entrada y el tiempo de inferencia, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la informacion proporcionada. La comparacion mas directa es contra el propio modelo base, ya que este checkpoint no compite en generacion abierta sino en prediccion estructurada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| odunola/lfm2.5_jev_style | ~350 M base + 10,6 M entrenados | 2.048 tokens | no disponible | HuggingFace, 0 descargas y 0 likes en el momento del registro | Prediccion estructurada con cabeza de esquema (Noul, Choice, Score) |
| LiquidAI/LFM2.5-350M | ~350 M (segun denominacion) | no disponible | no disponible | HuggingFace | Modelo base de lenguaje del que deriva este checkpoint |
| Alternativas de tamano similar (por ejemplo, modelos de la clase 300-500 M) | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada modelos comparables con cabeza de esquema equivalente |

## Limitaciones y advertencias

- Modelo de investigacion: el propio autor lo etiqueta como experimental y advierte de que la prueba de validacion (8 registros) no establece precision general.
- Sensibilidad al enunciado: reformular dos estados sin cambiar su significado redujo los aciertos de 10 de 10 a 8 de 10, lo que indica fragilidad ante variaciones de redaccion.
- Riesgo de alucinacion: la salida es una distribucion de probabilidad sobre opciones permitidas, por lo que no genera texto libre, pero puede asignar probabilidad alta a la opcion incorrecta sin senal de incertidumbre calibrada.
- Sin soporte de audio: aunque el proyecto se denomina Audio Jev, este checkpoint acepta unicamente texto y JSON y no procesa audio; no se ha seleccionado ni entrenado un sistema de entrada de audio para esta version.
- Limite de contexto de 2.048 tokens: el encoder rechaza prompts que lo superen, lo que restringe estados y conjuntos de preguntas largos.
- Idiomas soportados: no disponibles; no hay informacion sobre cobertura multilingue ni calidad por idioma.
- Licencia: no disponible; no se puede confirmar si se permite el uso comercial. Al derivar de `LiquidAI/LFM2.5-350M`, habria que verificar tambien la licencia del modelo base antes de cualquier uso en produccion.
- Reproducibilidad: la configuracion de entrenamiento no fija una revision concreta del modelo base, por lo que el autor no puede garantizar la reproduccion exacta desde la configuracion registrada.
- Integracion: no es un adaptador PEFT estandar y no se carga con `AutoModelForCausalLM`; requiere el codigo de carga incluido y el tokenizer suministrado. No se debe modificar el formato del encoder sin pruebas sobre este checkpoint.
- Formato de respuesta: la salida es un mapa de probabilidades personalizado y no sigue el formato oficial de la API de Jev.
- Uso sanitario: las pruebas con preguntas de admision hospitalaria fueron informales y no establecen precision medica; no debe utilizarse en contextos clinicos.
- Sesgos conocidos: no disponible (no se documenta ninguna evaluacion de sesgo).
- Madurez del repositorio: 0 descargas y 0 likes en el momento del registro, sin pipeline declarado y con un tamano de repositorio registrado de 0,0 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/odunola/lfm2.5_jev_style
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Dataset de entrenamiento: https://huggingface.co/datasets/ZefanCai/Open-Jev
- Referencia arXiv declarada en las etiquetas: https://arxiv.org/abs/2507.16806
- Repositorio del proyecto Audio Jev: no disponible
- Interfaz de navegador local: no disponible (se menciona su existencia, sin enlace)
- Paper o blog del autor sobre este checkpoint: no disponible
