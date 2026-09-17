# Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r06

## Resumen

`Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r06` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` que ha sido comprimido mediante SVD-LLM hasta conservar aproximadamente el 80,0 % de los parametros densos (un 20,01 % de parametros eliminados) y posteriormente editado con 6 de las 10 rondas de un procedimiento iterativo de intercambio de parametros neutro, guiado por la regla de seleccion `gap_iter`. Cada ronda sustituye hasta un 0,1 % de los parametros densos; en este checkpoint se han intercambiado 38.820.608 parametros (0,60 % de los parametros de proyeccion densos), con 3.712 componentes restaurados y 3.712 componentes retirados.

El modelo no es un asistente de proposito general ni un modelo listo para produccion: es un artefacto de investigacion dentro de un grid experimental que estudia como la compresion SVD degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes repara mejor ese dano. La model card lo declara explicitamente como "sujeto experimental": varias celdas del grid estan deliberadamente degradadas en seguridad respecto al modelo base, y el objetivo del trabajo es cuantificarlo.

Su relevancia actual es metodologica: aporta mediciones de tasa de exito de ataque (ASR) bajo jueces de HarmBench con AdvBench y StrongREJECT, ademas de una metrica de sobrerrechazo (macro over-refusal con WildGuard), lo que permite estudiar el compromiso seguridad-utilidad bajo compresion sin depender de impresiones cualitativas. La arquitectura subyacente es la de Llama-2-7b-chat (transformer decoder-only), el repositorio ocupa 13,5 GB y la licencia es la Llama 2 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2, derivado de `meta-llama/Llama-2-7b-chat-hf`, con truncamiento SVD-LLM aplicado a matrices de proyeccion y edicion iterativa de parametros |
| Parametros totales | 6.738.415.616 segun el recuento de safetensors; la model card declara una fraccion densa resultante de 0,7999 tras eliminar el 20,01 % de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat trabaja con 4096 tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ o GPTQ anunciadas |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (`license: llama2`); el repositorio incluye `LICENSE.txt` y `USE_POLICY.md` |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | `meta-llama/Llama-2-7b-chat-hf` |
| Pipeline | text-generation |
| Tamano del repositorio | 13,5 GB |
| Compresion | SVD-LLM, 20,01 % de parametros eliminados, fraccion resultante 0,7999 |
| Regla de seleccion de componentes | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda, chunk de 0,1 %) |
| Componentes restaurados / retirados | 3.712 / 3.712 |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Semilla | 42 |
| Rondas iterativas aplicadas | 6 de 10 (checkpoint intermedio de una ejecucion mas larga) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de un checkpoint editado. La base es Llama-2-7b-chat, un transformer decoder-only de 7.000 millones de parametros con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). Sobre esa base se aplica SVD-LLM: una descomposicion en valores singulares con truncamiento consciente del error de compresion que reduce las matrices de proyeccion, eliminando en este caso el 20,01 % de los parametros densos y dejando una fraccion de 0,7999.

La segunda fase es un procedimiento de reparacion por intercambio de parametros iterativo y "neutro en parametros": en cada ronda se seleccionan componentes segun la regla `gap_iter`, se retiran 3.712 componentes y se restauran otros 3.712, con un valor de intercambio de tipo `insert` (solo valor de insercion) y desalojo ordenado por sigma. El presupuesto total es del 1,0 % de los parametros densos, fragmentado en chunks del 0,1 % por ronda; este checkpoint corresponde a la ronda 6 de 10, con 38.820.608 parametros intercambiados (0,60 % de los parametros de proyeccion densos). La semilla es 42. No se especifica en la informacion disponible que haya habido entrenamiento adicional con RLHF o DPO durante esta edicion, ni se detalla la composicion del dataset de entrenamiento original de Llama-2-7b-chat.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, con la degradacion esperable por la compresion SVD y la edicion posterior.
- Razonamiento y codigo basicos: son capacidades del modelo base, pero no hay mediciones publicadas en la model card para MMLU, HumanEval, GSM8K ni similares.
- Respuesta a peticiones daninas medida con dos baterias: AdvBench (ASR de 0,0200 con juez de HarmBench) y StrongREJECT (ASR de 0,0400 con juez de HarmBench).
- Control de sobrerrechazo medido como macro over-refusal de 0,2325 con WildGuard, lo que permite estudiar el coste en utilidad de las intervenciones de seguridad.
- Capacidad de servir como punto de comparacion dentro de un grid de reglas de seleccion y presupuestos de restauracion.
- Compatibilidad con el ecosistema `transformers` y con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre compresion y seguridad: el checkpoint sirve como una celda concreta del grid para medir cuanto dano introduce el truncamiento SVD en la tasa de exito de ataque y cuanto recupera la reparacion por intercambio; se compara contra el modelo base sin comprimir y contra las demas celdas.
- Estudio de interpretabilidad de componentes: permite analizar que componentes concretos (3.712 restaurados frente a 3.712 retirados) explican la recuperacion de seguridad, aislando el efecto de la regla `gap_iter` frente a otras reglas del grid.
- Red-teaming y calibracion de jueces: sus mediciones con juez de HarmBench sobre AdvBench y StrongREJECT permiten validar pipelines de evaluacion automatica de seguridad y comprobar la sensibilidad de los jueces a modelos degradados.
- Analisis del compromiso seguridad-utilidad: la metrica de sobrerrechazo (0,2325 macro con WildGuard) se usa para cuantificar si las intervenciones que reducen ASR encarecen la utilidad conversacional.
- Baseline reproducible en experimentos de edicion de pesos: al fijar semilla 42, presupuesto del 1,0 %, chunk del 0,1 % y valor de intercambio `insert`, es util como referencia reproducible en estudios de edicion selectiva de parametros.
- Pruebas de infraestructura de inferencia: con las etiquetas de text-generation-inference y endpoints compatibles, sirve para verificar el despliegue de checkpoints editados en vLLM o TGI y detectar incompatibilidades de forma de pesos o de metadata.
- Docencia y divulgacion tecnica: como ejemplo didactico de un artefacto de investigacion con procedencia completamente documentada (compresion, regla de seleccion, presupuesto, numero de componentes), es adecuado para explicar flujos de trabajo de compresion y evaluacion.
- En ningun caso debe emplearse como asistente conversacional en produccion ni como base para aplicaciones orientadas al usuario final.

## Benchmarks y rendimiento

Unicos datos publicados en la model card:

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez de HarmBench) | 0,0200 |
| StrongREJECT ASR (juez de HarmBench) | 0,0400 |
| Macro over-refusal (WildGuard) | 0,2325 |

No se han publicado resultados de benchmarks de conocimiento, razonamiento ni codigo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni tablas comparativas contra el modelo base o contra otras celdas del grid con valores numericos.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 13,5-15 GB solo para pesos, mas la cache KV (que crece con la longitud de contexto). El repositorio ocupa 13,5 GB.
- VRAM estimada en 8 bits: aproximadamente 7-8 GB. En 4 bits: aproximadamente 4-5 GB. Estas cuantizaciones no estan publicadas en el repositorio y requeririan generarlas.
- GPU recomendadas: A100 (40 o 80 GB), H100 y L40S para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para fp16 en una sola GPU.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 4080 (16 GB, con margen ajustado en fp16), asi como en GPUs de 12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference y endpoints compatibles (etiquetas del repositorio), vLLM como opcion habitual para este formato. Ollama o llama.cpp requeririan una conversion previa a GGUF que no se proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r06` | 6.738.415.616 (fraccion densa 0,7999) | no disponible (base: 4096 tokens) | AdvBench 0,0200; StrongREJECT 0,0400 | Llama 2 Community License | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | 6.738.415.616 | 4096 tokens | no disponible en la informacion proporcionada | Llama 2 Community License | HuggingFace |
| Otros brazos del grid SVD-safety (otras reglas y presupuestos) | no disponible | no disponible | no disponible | Llama 2 Community License | referenciados en la model card como celdas del mismo grid |

No se dispone de datos suficientes en la informacion proporcionada para comparar con alternativas de la misma categoria (por ejemplo, otros metodos de compresion de LLM o modelos de 7B alineados) en parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Artefacto de investigacion, no un asistente desplegable: la propia model card lo califica como sujeto experimental y advierte de que varias celdas del grid estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- Riesgo de seguridad no nulo: el ASR medido es 0,0200 en AdvBench y 0,0400 en StrongREJECT con juez de HarmBench, es decir, el modelo sigue produciendo respuestas daninas en una fraccion de los ataques.
- Coste en utilidad: el macro over-refusal de 0,2325 indica una tendencia apreciable al rechazo excesivo de peticiones benignas, con el consiguiente perjuicio en tareas conversacionales.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en la informacion disponible; la compresion por truncamiento SVD puede agravarlo.
- Discrepancia de recuento de parametros: el metadata de safetensors declara 6.738.415.616 parametros, identico al modelo sin comprimir, mientras la model card afirma una fraccion densa de 0,7999. Conviene verificar la estructura real de los tensores antes de asumir un ahorro de memoria.
- Checkpoint intermedio: corresponde a la ronda 6 de 10, por lo que no representa el estado final de la ejecucion completa ni el maximo de reparacion alcanzable segun el diseno experimental.
- Idiomas soportados no disponibles; no se documenta cobertura multilingue mas alla de la del modelo base.
- Restricciones de licencia: Llama 2 Community License, con `LICENSE.txt` y `USE_POLICY.md` en el repositorio que vinculan cualquier uso derivado; incluye politica de uso aceptable y condiciones de redistribucion y atribucion propias de esta licencia.
- Validacion externa minima: 0 descargas y 0 likes en el momento de la consulta, sin replicas independientes conocidas.
- No hay informacion sobre sesgos especificos, comportamientos toxicos medidos, ni evaluaciones fuera del ambito de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove20_swapgapiter_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo: los resultados obtenidos corresponden a cotizaciones bursatiles de la empresa 2CRSi (Euronext Paris) y no guardan relacion con el checkpoint.
- No se proporcionan enlaces al paper o al repositorio de SVD-LLM en la informacion disponible.
