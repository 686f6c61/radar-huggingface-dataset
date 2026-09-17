# Jeesup/svd-safety-l2_remove30_swapgapiter_b010_r08

## Resumen

Este checkpoint, publicado por el usuario Jeesup, es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. No es un modelo conversacional listo para producción: es una celda concreta de una malla experimental que estudia cómo la compresión por descomposición en valores singulares (SVD-LLM) degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. El autor indica que todos los pesos densos se reducen al 69,98 % de los originales y que después se restauran 5.091 componentes mediante 8 de las 10 rondas previstas de un procedimiento de intercambio iterativo con presupuesto del 1,0 % de los parámetros densos.

La arquitectura no se modifica: sigue siendo un transformer decoder-only de la familia Llama 2, con licencia Llama 2 Community License y pesos en `safetensors` compatibles con `transformers` y con `text-generation-inference`. El repositorio ocupa 13,5 GB y el contaje de parámetros declarado por HuggingFace es de 6.738.415.616, idéntico al del Llama-2-7B denso, un detalle que conviene contrastar con la fracción de parámetros declarada en la propia model card.

Su relevancia es metodológica, no de producto: proporciona métricas de tasa de éxito de ataque (ASR) bajo AdvBench y StrongREJECT, además de una medida de sobre-rechazo, que permiten comparar celdas de la malla y evaluar si la edición posterior a la compresión recupera la seguridad perdida. Cualquier uso en producción debería ir precedido de una evaluación propia y de la aceptación de que varias celdas del estudio están deliberadamente degradadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con pesos truncados por SVD y edicion posterior de componentes |
| Parametros totales | 6.738.415.616 (contaje reportado por los safetensors); el autor declara una fraccion resultante de parametros densos de 0,6998 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Llama-2-7b-chat-hf se distribuye con 4.096 tokens, dato no confirmado en esta ficha |
| Tipos de cuantizacion | no disponibles; el repositorio solo publica pesos en safetensors en su precision original |
| Idiomas soportados | no declarados en la ficha; el modelo base esta orientado principalmente al ingles |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (carga via `transformers`) |

Datos de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base sin comprimir | `meta-llama/Llama-2-7b-chat-hf` |
| Compresion | SVD-LLM, 30,02 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Componentes restaurados | 5.091 |
| Componentes sustituidos | 5.091 |
| Fraccion de parametros resultante | 0,6998 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 8 de 10 |
| Tamano de bloque por ronda | 0,100 % de los parametros densos |
| Parametros intercambiados | 51.762.432 (0,80 % de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Checkpoint | ronda intermedia de una ejecucion mas larga |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat, un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, atencion por cabezas agrupadas (GQA no aplica en el tamano 7B, que usa atencion multi-cabeza) y embeddings rotatorios. Sobre esa base no hay reentrenamiento: el autor aplica compresion SVD-LLM, que trunca descomposiciones de valores singulares en las matrices de proyeccion para eliminar el 30,02 % de los parametros densos, y despues ejecuta un procedimiento de edicion por intercambio de componentes guiado por la regla `gap_iter`. Cada ronda sustituye hasta el 0,1 % de los parametros densos; en esta celda se han aplicado 8 de las 10 rondas previstas, por lo que el checkpoint corresponde a un estado intermedio de una ejecucion con presupuesto total del 1,0 %.

No se especifica en la informacion disponible el dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF, DPO o ajuste supervisado adicionales: toda la alineacion heredada proviene del checkpoint original de Meta. La innovacion tecnica del artefacto es el propio protocolo experimental: medir la perdida de seguridad inducida por la compresion y comparar reglas de seleccion de componentes (aqui `gap_iter`) con distintos presupuestos de restauracion, empleando desalojo ordenado por sigma y valor de intercambio de tipo `insert`. La semilla declarada es 42 y el resultado final es una fraccion de parametros densos de 0,6998.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama-2-7b-chat, sujeta a la degradacion introducida por la compresion.
- Respuesta multi-turno basica, con la ventana de contexto del modelo original (4.096 tokens, no confirmada en esta ficha).
- Razonamiento y conocimiento general en el rango esperable de un modelo de 7B, sin datos de evaluacion publicados en la ficha.
- Generacion de codigo y matematicas basicas, sin metricas que cuantifiquen el impacto de la compresion.
- Comportamiento de rechazo medido empíricamente: ASR de 0,0000 en AdvBench y 0,0050 en StrongREJECT, con un sobre-rechazo macro de 0,4332.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se declara soporte multilingue; el modelo base esta optimizado para ingles.
- Etiquetado como `endpoints_compatible` y `text-generation-inference`, por lo que puede servirse con TGI.

## Casos de uso

- Investigacion sobre compresion de modelos: usar el checkpoint como sujeto experimental para medir cuanto degrada el truncado SVD la alineacion de seguridad en Llama-2-7b-chat y contrastarlo con las otras celdas de la malla.
- Estudio de reglas de seleccion de componentes: comparar `gap_iter` frente a otras reglas del grid con presupuestos identicos, manteniendo semilla y protocolo de evaluacion.
- Analisis de sobre-rechazo: el valor macro de 0,4332 sobre WildGuard permite estudiar el coste en utilidad de las intervenciones de reparacion de seguridad.
- Reproducibilidad de experimentos de interpretabilidad: la ficha documenta semilla, numero de rondas, tamano de bloque y contadores de componentes, lo que facilita replicar la configuracion exacta.
- Evaluacion de robustez frente a ataques: servir el modelo en un banco de pruebas aislado y ejecutar AdvBench o StrongREJECT con jueces independientes para validar las cifras declaradas.
- Docencia y divulgacion tecnica: ilustrar como un ajuste preciso sobre un subconjunto pequeno de parametros puede alterar el comportamiento de rechazo de un modelo alineado.
- No se recomienda su uso como asistente desplegado, en atencion al cliente ni en generacion de codigo en produccion, dado el proposito declarado del artefacto.

## Benchmarks y rendimiento

| Metrica | Valor | Juez |
|---|---|---|
| AdvBench ASR | 0,0000 | HarmBench judge |
| StrongREJECT ASR | 0,0050 | HarmBench judge |
| Sobre-rechazo macro | 0,4332 | WildGuard |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible. Tampoco se ofrecen cifras comparativas de las demas celdas del grid.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo para pesos, mas memoria para cache KV y activaciones; el tamano del repositorio (13,5 GB) es coherente con esta cifra.
- Cuantizacion a 8 bits: en torno a 7 GB de pesos, con margen adicional para contexto y lotes.
- Cuantizacion a 4 bits: en torno a 4 GB de pesos, con perdida de calidad adicional no medida en esta ficha.
- GPU profesionales: A100 40 GB, A100 80 GB, H100, L40S y similares, sin problemas de encaje en fp16.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 de 16 GB en fp16 (con contexto corto y lotes pequenos) y con mas holgura en 8 o 4 bits; en GPUs de 8-12 GB solo es viable cuantizado.
- Opciones de despliegue: `transformers`, `text-generation-inference` (etiqueta `endpoints_compatible`), vLLM y soluciones equivalentes compatibles con safetensors. No se publican pesos GGUF, por lo que Ollama o llama.cpp requeririan una conversion previa por parte del usuario.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Compresion | Contexto | ASR AdvBench | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-l2_remove30_swapgapiter_b010_r08`) | contaje safetensors 6.738.415.616; fraccion densa declarada 0,6998 | SVD-LLM al 70 % + 8/10 rondas de intercambio | no disponible | 0,0000 | Llama 2 Community License |
| `meta-llama/Llama-2-7b-chat-hf` | 6.738.415.616 | ninguna | 4.096 tokens (no confirmado en esta ficha) | no disponible | Llama 2 Community License |
| Otras celdas del grid de Jeesup | no disponible | distintos ratios SVD y presupuestos de restauracion | no disponible | no disponible | Llama 2 Community License |

No se dispone de datos publicados en la informacion proporcionada para comparar con alternativas de otros autores, como Llama-2-13b-chat, Mistral-7B-Instruct o modelos de 7B alineados con tecnicas de seguridad distintas.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: el propio autor advierte que varias celdas de la malla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- La compresion por si sola eleva la tasa de exito de ataque; el objetivo del estudio es cuantificarlo y probar la recuperacion, no garantizar un modelo seguro.
- Sobre-rechazo macro elevado (0,4332 sobre WildGuard), lo que implica un coste notable en utilidad conversacional.
- El checkpoint corresponde a la ronda 8 de 10, es decir, a un estado intermedio de la ejecucion completa: no representa el resultado final del protocolo.
- Discrepancia entre el contaje de parametros reportado por HuggingFace (6.738.415.616, identico al denso) y la fraccion de parametros densos declarada (0,6998); conviene verificar los tensores antes de asumir ahorro real de memoria.
- No se declaran idiomas soportados ni datos de entrenamiento; el modelo base esta orientado principalmente al ingles y no se ha validado su comportamiento en castellano.
- Riesgo de alucinacion inherente a un modelo de 7B, agravado por el truncado de pesos y sin evaluacion de fidelidad publicada.
- Licencia Llama 2 Community License: uso comercial sujeto a sus terminos, con obligaciones de atribucion ("Built with Llama 2"), politica de uso aceptable y el umbral de 700 millones de usuarios activos mensuales.
- No se publican pesos cuantizados ni GGUF; cualquier despliegue con llama.cpp u Ollama exige conversion y validacion propias.
- No hay garantia de soporte de tool calling ni de comportamiento de agente, ya que no se declara ni se evalua.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove30_swapgapiter_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Perfil del autor en HuggingFace: https://huggingface.co/Jeesup
- Referencias citadas en la model card sin enlace incluido: paper de SVD-LLM, benchmark AdvBench, benchmark StrongREJECT, juez HarmBench, juez WildGuard y Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` dentro del repositorio).
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces encontrados corresponden a directorios de empresas francesas y no guardan relacion con el artefacto.
