# Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r06

## Resumen

El modelo `Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r06` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado una compresion por descomposicion en valores singulares mediante el metodo SVD-LLM, eliminando el 50,03 % de los parametros densos. Sobre ese checkpoint comprimido se aplicaron 6 de las 10 rondas previstas de una edicion iterativa de parametros ("parameter-neutral swap") guiada por la regla de seleccion `gap_iter`, con un presupuesto de restauracion del 1,000 % de los parametros densos y fragmentos del 0,100 % por ronda. Lo publica el usuario Jeesup como artefacto de investigacion, no como modelo de proposito general.

El problema que aborda es concreto: la compresion SVD degrada el comportamiento de seguridad de un modelo alineado, y el estudio mide cuanto se degrada y que regla de seleccion de componentes repara mejor ese dano. Este checkpoint es una celda de una rejilla que cruza reglas de seleccion y presupuestos, y su ficha advierte explicitamente de que varias ramas del experimento estan "deliberadamente degradadas en seguridad" respecto al modelo base.

Su relevancia es por tanto metodologica: aporta un punto de medida reproducible (semilla 42) sobre el compromiso entre seguridad y utilidad en modelos comprimidos, con metricas de tasa de exito de ataque (ASR) y de sobre-rechazo. No es un asistente desplegable: es un sujeto experimental. La arquitectura subyacente es la de Llama 3.1 8B Instruct (transformer denso, decoder-only), con 8.030.261.248 parametros reportados en el safetensors y un repositorio de 16,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 (segun safetensors); la ficha del autor declara una fraccion de parametros resultante de 0,4997 tras la compresion |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; la ficha del autor no la documenta) |
| Tipos de cuantizacion | no disponible. El repositorio solo contiene safetensors en precision de 16 bits (16,1 GB para 8,03 mil millones de parametros, compatible con bf16/fp16) |
| Idiomas soportados | no disponible en la ficha del autor. El modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes); las evaluaciones del checkpoint se realizan en ingles |
| Licencia | Llama 3.1 Community License (`license: llama3.1`); el repositorio incluye `LICENSE` y `USE_POLICY.md` |
| Formato de pesos | safetensors (transformers) |

Datos adicionales de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base | `meta-llama/Llama-3.1-8B-Instruct` |
| Metodo de compresion | SVD-LLM |
| Porcentaje de parametros eliminados | 50,03 % |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Componentes restaurados / sustituidos | 6881 / 6881 |
| Parametros insertados | 41.695.232 (0,60 % de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Rondas iterativas aplicadas | 6 de 10 |
| Fragmento por ronda | 0,100 % de los parametros densos |
| Semilla | 42 |
| Descargas / likes en HuggingFace | 0 / 0 |

Aviso de verificacion: el recuento de parametros del safetensors coincide practicamente con el del modelo denso sin comprimir, mientras que la model card declara una fraccion de parametros de 0,4997. Es una discrepancia que conviene comprobar antes de asumir cualquier ahorro real de memoria.

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin cambios estructurales: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, atencion con RoPE y 128.000 tokens de contexto nominal. No hay en la informacion disponible datos de entrenamiento adicionales: este checkpoint no se ha reentrenado ni afinado con RLHF o DPO; la unica transformacion aplicada es la compresion de matrices de pesos y la posterior edicion selectiva de componentes.

La innovacion tecnica del artefacto es el protocolo de edicion. Primero se aplica SVD-LLM para reducir aproximadamente la mitad de los parametros densos, lo que degrada el comportamiento de seguridad. Despues se ejecuta un bucle iterativo de intercambio de parametros neutral en tamano: en cada ronda se seleccionan componentes con la regla `gap_iter` y se sustituyen 6881 componentes (41.695.232 parametros, el 0,60 % de los parametros de proyeccion densos) por valores de insercion, con desalojo ordenado por valor sigma. Cada ronda consume como maximo el 0,100 % de los parametros densos, y el presupuesto total del experimento completo es del 1,0 %. Este checkpoint es el estado intermedio tras 6 rondas de 10, con semilla 42.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad base de Llama 3.1 8B Instruct, aunque la compresion y la edicion alteran el comportamiento final.
- Respuesta a instrucciones de un solo turno y multiturno dentro del esquema de prompt de Llama 3.1.
- Razonamiento basico, matematicas y generacion de codigo: capacidades heredadas del modelo base, no verificadas ni documentadas para este checkpoint.
- Evaluacion de seguridad: es la capacidad realmente medida, a traves de AdvBench, StrongREJECT y la tasa de sobre-rechazo macro con WildGuard.
- Sujeto de comparacion controlado: sirve como punto de una rejilla de reglas de seleccion y presupuestos de restauracion, lo que permite atribuir diferencias a la regla y no al azar (semilla fija).
- Soporte de tool calling / function calling: no documentado en la informacion disponible (el modelo base lo soporta, este checkpoint no lo declara).
- Modo de razonamiento explicito (thinking), vision o audio: no disponible, no se mencionan.

## Casos de uso

- Investigacion sobre compresion y alineacion: usar el checkpoint como celda experimental para cuantificar cuanto dano de seguridad introduce la compresion SVD-LLM al 50 % y cuanto recupera la edicion iterativa con la regla `gap_iter`. Es exactamente el proposito declarado del artefacto.
- Red teaming y evaluacion de jailbreaks: medir la tasa de exito de ataque (ASR) con AdvBench (0,0600 en este checkpoint) y StrongREJECT (0,0250) frente al modelo sin comprimir, para determinar si la compresion abre superficies de ataque nuevas.
- Estudio del sobre-rechazo: emplear la metrica de sobre-rechazo macro con WildGuard (0,4318 en este checkpoint) para analizar el coste en utilidad de las intervenciones de seguridad, es decir, cuanto contenido benigno se rechaza.
- Reproduccion de experimentos de compresion: al fijar semilla 42, regla, fragmento por ronda y presupuesto, permite replicar el pipeline SVD-LLM mas edicion selectiva y validar resultados de terceros.
- Comparacion entre reglas de seleccion de componentes: colocar este checkpoint junto a las otras celdas de la rejilla para aislar el efecto de `gap_iter` frente a otras reglas con el mismo presupuesto del 1,0 %.
- Interpretabilidad de componentes: los 6881 componentes restaurados y los 6881 sustituidos son una lista trazable que puede analizarse para localizar que subconjuntos de pesos concentran el comportamiento de rechazo.
- Docencia y divulgacion sobre compromisos seguridad-utilidad: sirve como ejemplo tangible de que la compresion agresiva no es neutral respecto a la alineacion, con numeros medidos en lugar de afirmaciones cualitativas.
- Despliegue de bajo coste tras auditoria propia: solo si una evaluacion independiente confirma que el comportamiento de seguridad es aceptable para el caso concreto; la ficha del autor desaconseja tratarlo como asistente desplegable.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son metricas de seguridad. No hay datos de MMLU, HumanEval, GSM8K ni de calidad general.

| Metrica | Juez / herramienta | Valor |
|---|---|---|
| AdvBench ASR | juez HarmBench | 0,0600 |
| StrongREJECT ASR | juez HarmBench | 0,0250 |
| Sobre-rechazo macro | WildGuard | 0,4318 |

No se han publicado resultados de benchmarks de capacidad general (conocimiento, codigo, matematicas) en la informacion disponible, ni comparaciones numericas con el modelo base sin comprimir.

## Requisitos de hardware

- Pesos en bf16/fp16: 16,1 GB de safetensors. La inferencia en precision de 16 bits necesita aproximadamente 18-20 GB de VRAM con contexto corto, sumando activaciones y cache.
- Cache KV en bf16: unos 128 KiB por token, calculado a partir de la arquitectura del modelo base (32 capas, 8 cabezas KV, dimension de cabeza 128, dos tensores K y V, 2 bytes por valor). Eso supone aproximadamente 1 GB para 8.000 tokens, 4 GB para 32.000 tokens y 16 GB para los 128.000 tokens maximos. El contexto largo es el principal consumidor de memoria.
- GPU recomendadas para precision completa: A100 40 GB o 80 GB, H100, L40S 48 GB. En consumer, RTX 4090 o RTX 3090 de 24 GB pueden ejecutarlo con contexto moderado.
- GPU consumer con cuantizacion: RTX 4080 de 16 GB o RTX 4060 Ti de 16 GB en 8 bits; tarjetas de 8-12 GB solo con cuantizacion de 4 bits (aproximadamente 4,5-5,5 GB de pesos).
- Opciones de despliegue: transformers, text-generation-inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM para servido en precision de 16 bits y llama.cpp u Ollama previa conversion a GGUF.
- Latencia y throughput estimados: no disponible. No hay datos publicados de tokens por segundo ni de latencia para este checkpoint.
- No se distribuyen pesos cuantizados oficiales (GGUF, AWQ, GPTQ); cualquier cuantizacion habria que generarla localmente.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base del que deriva. No hay datos de otros modelos comprimidos equivalentes ni resultados publicados que permitan una comparacion numerica de rendimiento general.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de seguridad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r06` | 8,03 mil millones segun safetensors; fraccion declarada 0,4997 | 128.000 tokens (heredado) | Llama 3.1 Community | HuggingFace, 0 descargas | AdvBench ASR 0,0600; StrongREJECT ASR 0,0250; sobre-rechazo 0,4318 |
| `meta-llama/Llama-3.1-8B-Instruct` (base) | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community | HuggingFace, ampliamente distribuido | no disponible en la informacion proporcionada |
| Otras celdas de la rejilla del mismo autor | no disponible | no disponible | Llama 3.1 Community | mencionadas en la model card, sin listado | no disponible |

## Limitaciones y advertencias

- No es un modelo de proposito general. La propia model card lo califica de artefacto de investigacion y advierte de que varias ramas del estudio estan deliberadamente degradadas en seguridad respecto al modelo base.
- La compresion por si sola eleva la tasa de exito de ataque; el objetivo del estudio es cuantificarlo, no corregirlo de forma definitiva. Cualquier celda debe tratarse como sujeto experimental.
- Riesgo de alucinacion: no evaluado en la informacion disponible. La compresion de pesos puede agravar la degradacion del conocimiento factual, pero no hay datos que lo confirmen ni que lo descarten.
- Sobre-rechazo elevado: 0,4318 de media macro segun WildGuard, lo que implica que una parte considerable de peticiones benignas puede ser rechazada.
- Evaluacion limitada al ingles y centrada en seguridad. No hay datos de rendimiento multilingue ni de capacidades generales para este checkpoint.
- Idiomas soportados no documentados en la ficha; la herencia del modelo base es una suposicion razonable, no un dato verificado para este derivado.
- Discrepancia no resuelta entre el recuento de parametros del safetensors (8.030.261.248, identico al del modelo denso) y la fraccion de parametros de 0,4997 declarada en la model card. Hay que verificar el ahorro real de memoria antes de planificar despliegues.
- Licencia Llama 3.1 Community: el uso comercial esta sujeto a sus condiciones, incluida la obligacion de incluir el aviso "Built with Llama", las clausulas de nomenclatura de derivados y el umbral de 700 millones de usuarios mensuales. El repositorio incluye `LICENSE` y `USE_POLICY.md`.
- Repositorio sin descargas ni likes y sin resultados de benchmarks generales publicados: ausencia total de validacion por terceros.
- No se distribuyen pesos cuantizados ni versiones GGUF oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Politica de uso aceptable de Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/USE_POLICY.md

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre el metodo SVD-LLM; los enlaces obtenidos correspondian a contenidos sin relacion (agencias de seguros). No se dispone por tanto de paper, blog tecnico, repositorio de codigo ni demo adicionales a los enlaces de HuggingFace listados arriba.
