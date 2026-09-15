# Jeesup/svd-safety-l2_remove50_swapdisc_a020_c002_b010_r03

## Resumen

`Jeesup/svd-safety-l2_remove50_swapdisc_a020_c002_b010_r03` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` al que se ha aplicado una compresion por descomposicion en valores singulares (SVD-LLM) que elimina el 50,01 % de los parametros densos, seguida de un proceso de reparacion selectiva de componentes. El resultado es un modelo denso de 6.738.415.616 parametros (fraccion resultante 0,4999 respecto al original) publicado por el usuario Jeesup bajo la licencia comunitaria de Llama 2.

El interes del artefacto no es su calidad como asistente, sino su papel como sujeto experimental: forma parte de un estudio sistematico sobre como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. En concreto, esta celda aplica la regla `disc_iter` durante 3 de las 5 rondas iterativas previstas, con un presupuesto de reparacion del 0,200 % de parametros densos por ronda (1,0 % en la ejecucion completa) y un total de 3740 componentes restaurados y 3740 sustituidos.

Es relevante ahora porque cuantifica con numeros medibles el coste en seguridad de la compresion agresiva de pesos, un problema practico para cualquiera que despliegue modelos cuantizados o podados en produccion. El propio autor advierte que varias celdas de la malla estan deliberadamente degradadas en seguridad y que el checkpoint no debe tratarse como un asistente desplegable, sino como un objeto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), heredada de `meta-llama/Llama-2-7b-chat-hf` |
| Parametros totales | 6.738.415.616 (≈6,74 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en la precision del checkpoint) |
| Idiomas soportados | no disponible (el modelo base Llama-2-7b-chat esta entrenado predominantemente en ingles) |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria `transformers`) |

Datos adicionales de procedencia relevantes:

| Campo | Valor |
|---|---|
| Modelo base sin comprimir | `meta-llama/Llama-2-7b-chat-hf` |
| Compresion aplicada | SVD-LLM, 50,01 % de parametros eliminados |
| Regla de seleccion | `disc_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Componentes restaurados | 3740 |
| Componentes sustituidos | 3740 |
| Fraccion de parametros resultante | 0,4999 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 3 de 5 |
| Bloque por ronda | 0,200 % de los parametros densos |
| Parametros insertados | 38.849.536 (0,60 % de los parametros de proyeccion densos) |
| Valor de sustitucion | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Escala de insercion | 0,2 |
| Checkpoint | ronda intermedia de una ejecucion mas larga |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat, un transformer decoder-only con atencion causal sobre una ventana de 4096 tokens, por lo que el checkpoint conserva la topologia del modelo original; lo que cambia es el contenido numerico de sus matrices de pesos. Sobre esa base se aplica SVD-LLM, una tecnica de compresion post-entrenamiento que descompone las matrices de proyeccion en factores de rango reducido y descarta componentes segun su valor singular, eliminando en este caso el 50,01 % de los parametros densos.

Sobre el modelo comprimido se ejecuta un procedimiento de reparacion denominado swap parametro-neutro e iterativo: en cada ronda se restauran componentes concretos desde el modelo denso original y se desalojan otros tantos, manteniendo constante el numero de parametros. La regla `disc_iter` decide que componentes entran; en esta celda se aplicaron 3 de las 5 rondas previstas, con 0,200 % de parametros densos por ronda, 38.849.536 parametros insertados y una escala de insercion de 0,2 (los componentes se anaden a esa fraccion de su fuerza original). No se documentan en la informacion disponible ni el volumen de tokens de entrenamiento original, ni la composicion del dataset, ni las fases de RLHF/DPO mas alla de las que ya incorpora Llama-2-7b-chat de serie.

## Capacidades

- Generacion de texto conversacional en el formato de chat de Llama 2, condicionada por la degradacion introducida por la compresion SVD.
- Razonamiento y generacion de codigo en la medida en que lo conserva el checkpoint comprimido; no hay evaluaciones publicadas de capacidades generales para esta celda.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking", vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Capacidad instrumental documentada: servir como punto de medida del intercambio seguridad/utilidad bajo compresion, con tasas de exito de ataque medibles (AdvBench ASR 0,3404; StrongREJECT ASR 0,2492) y de sobrerrechazo (0,2264 macro segun WildGuard).

## Casos de uso

- Investigacion en seguridad de modelos comprimidos: usar el checkpoint como celda de control en experimentos que midan cuanto dano causa la compresion SVD a las defensas de alineamiento de un modelo alineado, comparando su AdvBench ASR frente al del modelo denso original.
- Evaluacion de tecnicas de reparacion de pesos: esta celda permite contrastar la regla `disc_iter` con otras reglas de seleccion de componentes y con distintos presupuestos de restauracion, manteniendo fija la semilla 42 y el bloque por ronda de 0,200 %.
- Auditoria de pipelines de cuantizacion y poda: sirve como caso adverso conocido para verificar que un pipeline interno de compresion no solo mide perplejidad o calidad de texto, sino tambien tasas de exito de ataque (red teaming automatizado con AdvBench y StrongREJECT).
- Calibracion de jueces automaticos: al incluir mediciones con HarmBench como juez y con WildGuard para sobrerrechazo, es util para reproducir y comparar el comportamiento de estos evaluadores sobre modelos degradados.
- Estudio de sobrerrechazo (over-refusal): con un 0,2264 de macro sobre rechazo en WildGuard, permite analizar como la compresion desplaza el equilibrio entre seguridad y utilidad, un fenomeno relevante para ajustar umbrales de moderacion.
- Docencia y divulgacion sobre interpretabilidad: el hecho de que la reparacion se haga por componentes discretos (3740 restaurados y 3740 sustituidos) lo convierte en un material didactico para explicar como se localiza la funcionalidad de seguridad en matrices concretas.
- Pruebas de regresion de infraestructura de inferencia: al ser un safetensors de 13,5 GB compatible con `transformers` y text-generation-inference, sirve para validar que un servidor de inferencia carga y ejecuta correctamente checkpoints comprimidos de rango reducido.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,3404 | HarmBench judge |
| StrongREJECT ASR | 0,2492 | HarmBench judge |
| Macro over-refusal | 0,2264 | WildGuard |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K, MT-Bench u otros) ni la comparacion numerica contra la linea base `meta-llama/Llama-2-7b-chat-hf` en la informacion disponible. El autor indica cualitativamente que "la compresion por si sola eleva la tasa de exito de ataque", pero no se proporcionan los valores de la linea base.

## Requisitos de hardware

- VRAM para pesos en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas activaciones y cache KV; en la practica, 16 GB es el minimo ajustado y 24 GB es la cifra comoda.
- VRAM en cuantizacion int8: aproximadamente 7 GB de pesos.
- VRAM en cuantizacion int4 (requiere conversion a GGUF/AWQ/GPTQ, no incluida en el repositorio): aproximadamente 3,5-4 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S 48 GB para servicio concurrente con contexto completo; RTX 4090 24 GB y RTX 3090 24 GB para desarrollo y despliegue de una sola instancia en fp16.
- Consumer GPU: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, justo en fp16) y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (formato nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, y llama.cpp/Ollama tras convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de latencia ni de tokens por segundo para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Seguridad medida |
|---|---|---|---|---|---|
| Este checkpoint (SVD-LLM 50 % + swap `disc_iter`, 3/5 rondas) | 6,74 B densos (fraccion 0,4999) | 4096 tokens (heredado) | Llama 2 Community License | HuggingFace, 0 descargas y 0 likes en el momento de la consulta | AdvBench ASR 0,3404; StrongREJECT ASR 0,2492; over-refusal 0,2264 |
| `meta-llama/Llama-2-7b-chat-hf` (linea base densa) | 6,74 B | 4096 tokens | Llama 2 Community License | HuggingFace, ampliamente distribuido | No disponible en la informacion proporcionada (el autor afirma que la compresion la empeora) |
| Otras celdas de la misma malla (otras reglas de seleccion y presupuestos) | 6,74 B densos (fraccion variable) | 4096 tokens | Llama 2 Community License | HuggingFace, autor Jeesup | No disponibles en la informacion proporcionada |
| Alternativas de 7-8 B instruct de uso general (por ejemplo Mistral-7B-Instruct o Llama-3-8B-Instruct) | ≈7-8 B | 8192 tokens o superior | Apache 2.0 / Meta Llama 3 | HuggingFace | No comparable: no hay metricas de seguridad homogeneas publicadas en la informacion disponible para cruzarlas con este checkpoint |

## Limitaciones y advertencias

- No es un asistente de proposito general. El propio autor lo describe como un artefacto de investigacion y como sujeto experimental, no como un modelo desplegable.
- Degradacion de seguridad documentada: AdvBench ASR de 0,3404 y StrongREJECT ASR de 0,2492 implican que aproximadamente uno de cada tres ataques del primer conjunto y uno de cada cuatro del segundo tienen exito segun el juez HarmBench.
- La compresion por si sola eleva la tasa de exito de ataque respecto al modelo denso, segun afirma el autor; varias celdas de la malla estan deliberadamente degradadas en seguridad.
- Sobrerrechazo apreciable: 0,2264 macro de over-refusal segun WildGuard, lo que indica que el modelo rechaza peticiones legitimas con frecuencia.
- Sesgos conocidos: no disponibles de forma especifica; se heredan los del modelo base Llama-2-7b-chat, que no se documentan en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; la compresion de rango reducido tiende a degradar la fidelidad de los pesos, pero no hay mediciones publicadas para esta celda.
- Limitaciones de contexto e idioma: ventana de 4096 tokens heredada del modelo base y formacion predominantemente en ingles; no hay soporte multilingue documentado.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio. El uso comercial esta sujeto a los terminos de dicha licencia y a la clausula de atribucion "Built with Llama 2"; no se permite un uso que infrinja la politica de uso aceptable de Meta.
- Caveat de produccion: al tratarse de la ronda 3 de 5 de una ejecucion mas larga, el checkpoint es un estado intermedio; los resultados pueden no ser representativos de la ejecucion completa con el presupuesto del 1,0 %.
- Advertencia de validacion: el autor recomienda evaluar el modelo por cuenta propia antes de extraer conclusiones. Con 0 descargas y 0 likes, no existe validacion independiente conocida.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a020_c002_b010_r03
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2 y politica de uso: incluidas en el repositorio como `LICENSE.txt` y `USE_POLICY.md`
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio del estudio, paper o blog del autor: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Los unicos enlaces recuperados pertenecen al foro chino de electricidad de edificacion `jzdq.net.cn` y no guardan relacion con este checkpoint, por lo que se descartan como fuentes.
