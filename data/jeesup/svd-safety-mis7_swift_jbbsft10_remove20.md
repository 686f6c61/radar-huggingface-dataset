# Jeesup/svd-safety-mis7_swift_jbbsft10_remove20

## Resumen

`Jeesup/svd-safety-mis7_swift_jbbsft10_remove20` es un checkpoint derivado de `mistralai/Mistral-7B-Instruct-v0.2` comprimido con la tecnica SVD-LLM, en el que se ha eliminado el 20,00% de los parametros densos (fraccion de parametros resultante declarada: 0,8004). Forma parte de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad del modelo y que regla de seleccion de componentes lo repara mejor. Este checkpoint concreto es una celda de esa rejilla: se le asigno una regla de seleccion etiquetada como `unknown` y un presupuesto de restauracion del 0,000%, de modo que no se restauro ningun componente.

El modelo tiene 7.241.732.096 parametros declarados en safetensors y un repositorio de 14,5 GB, coherente con un Mistral-7B en precision completa. Hereda del modelo base la arquitectura transformer decoder-only de Mistral, con atencion de ventana deslizante y un contexto de 32.768 tokens. La licencia declarada es Apache-2.0.

Su relevancia es exclusivamente de investigacion: el propio autor advierte que no es un modelo de chat de proposito general y que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base. Este checkpoint se publica como sujeto experimental para medir el equilibrio entre seguridad y utilidad bajo compresion, con cifras de ASR en AdvBench (0,0231) y StrongREJECT (0,0447), sobre-rechazo macro de 0,3109 y perplejidad de 7,3908 en WikiText-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2: GQA, RoPE, SwiGLU, atencion de ventana deslizante); pesos aproximados por SVD de bajo rango |
| Parametros totales | 7.241.732.096 (segun safetensors); fraccion de parametros densos declarada por el autor: 0,8004 |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no se declara en la model card de este repositorio) |
| Tipos de cuantizacion | No disponible en el repositorio: solo se publican pesos safetensors. Al derivar de Mistral-7B es convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | No disponible; el autor no declara idiomas. El modelo base esta orientado principalmente al ingles y no se ha verificado el comportamiento multilingue tras la compresion |
| Licencia | Apache-2.0 (segun la model card, el repositorio del modelo base no incluye fichero de licencia para redistribuir; esta licencia gobierna este derivado) |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Compresion | SVD-LLM, 20,00% de parametros eliminados |
| Regla de seleccion de componentes | `unknown` |
| Presupuesto de restauracion | 0,000% de los parametros densos (0 componentes restaurados, 0 componentes sustituidos) |
| Semilla | 42 |
| Tamano del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es `mistralai/Mistral-7B-Instruct-v0.2`, un transformer decoder-only de 7B parametros con 32 capas, atencion de consultas agrupadas (GQA), embeddings rotatorios (RoPE), activacion SwiGLU y atencion de ventana deslizante de 4096 tokens sobre una ventana de contexto de hasta 32.768 tokens. Sobre ese checkpoint se aplico una compresion SVD-LLM que elimina el 20,00% de los parametros densos mediante aproximacion de bajo rango de las matrices de pesos. El resultado se declara con una fraccion de parametros densos de 0,8004.

El pipeline del estudio contempla despues una fase de restauracion en la que se devuelven componentes SVD seleccionados por una regla concreta y con un presupuesto determinado. En esta celda la regla es `unknown` y el presupuesto es del 0,000%, por lo que no se restauro ningun componente: el checkpoint es, en la practica, la rama comprimida sin reparacion. La model card no documenta el dataset de entrenamiento, el numero de tokens, ni si hubo RLHF o DPO; tampoco define el sufijo `jbbsft10` ni el termino `swift` que aparecen en el nombre del checkpoint, por lo que no deben interpretarse sin la metodologia completa del estudio. La semilla declarada es 42.

Una observacion tecnica relevante: el recuento de parametros de los safetensors coincide con el del modelo base completo (7.241.732.096), pese a que el autor declara una fraccion densa de 0,8004. Esto es compatible con un almacenamiento que conserva las formas completas de las matrices y reduce el rango efectivo, pero la model card no lo explica, de modo que no cabe asumir una reduccion de VRAM o de latencia frente al modelo original.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredados de Mistral-7B-Instruct-v0.2.
- Razonamiento de proposito general y generacion de codigo en el nivel propio de un modelo de 7B de su generacion (no se publican evaluaciones especificas en este repositorio).
- Comportamiento de rechazo ante peticiones daninas cuantificado con AdvBench (ASR 0,0231) y StrongREJECT (ASR 0,0447), ambos con juez HarmBench.
- Tendencia al sobre-rechazo cuantificada: 0,3109 en la metrica macro de WildGuard.
- Capacidades multilingues: no verificadas ni declaradas; se asume el perfil del modelo base, centrado en ingles.
- Soporte de tool calling / function calling: no documentado ni declarado por el autor.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales: ninguna (sin vision, sin audio, sin modo de razonamiento explicito). Su valor esta en ser un sujeto de medida de seguridad bajo compresion.

## Casos de uso

- Celda de control en estudios de compresion: usar este checkpoint como referencia de "compresion sin reparacion" (presupuesto de restauracion 0,000%) y comparar su ASR contra las celdas que si restauran componentes SVD.
- Evaluacion comparativa de reglas de seleccion de componentes: al fijar la regla como `unknown` y el presupuesto a cero, sirve para aislar el efecto de la propia regla en el resto de la rejilla.
- Investigacion sobre sobre-rechazo: con una tasa macro de 0,3109 en WildGuard, es util para estudiar como la compresion desplaza la frontera entre rechazo correcto y rechazo excesivo.
- Analisis de la relacion entre perplejidad y alineamiento: la pareja de datos WikiText-2 PPL 7,3908 y ASR bajo permite explorar si la degradacion de lenguaje correlaciona con la degradacion de seguridad.
- Trabajo de interpretabilidad: localizar en el espacio de pesos comprimido los subespacios asociados al comportamiento de rechazo, comparando este checkpoint con su modelo base sin comprimir.
- Construccion de conjuntos de evaluacion de seguridad: emplearlo como sujeto experimental en pipelines de red teaming que combinan AdvBench, StrongREJECT y WildGuard con un juez comun (HarmBench).
- Reproducibilidad de resultados: la semilla 42 y las metricas publicadas permiten replicar el punto de la rejilla en un entorno propio antes de extraer conclusiones.
- Punto de partida para tecnicas de reparacion: aplicar tecnicas de restauracion de componentes, destilacion o ajuste de seguridad sobre esta base comprimida y medir la recuperacion del comportamiento original.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Metrica | Valor | Metodo / juez |
|---|---|---|
| AdvBench ASR | 0,0231 | Juez HarmBench |
| StrongREJECT ASR | 0,0447 | Juez HarmBench |
| Macro over-refusal | 0,3109 | WildGuard |
| WikiText-2 perplexity | 7,3908 | Perplejidad de lenguaje |

No se han publicado en la informacion disponible resultados comparables del modelo base sin comprimir ni de otras celdas de la rejilla (MMLU, HumanEval, GSM8K u otros). La model card afirma cualitativamente que "la compresion por si sola eleva la tasa de exito de ataque", pero no proporciona las cifras del punto de referencia, por lo que no es posible cuantificar la degradacion con los datos disponibles.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 15-16 GB solo para pesos; con cache KV y overhead de runtime, unos 17-20 GB para contexto largo.
- VRAM estimada cuantizado: aproximadamente 8-9 GB en int8 y 4,5-5,5 GB en Q4 (GGUF), siempre que se convierta el checkpoint, ya que el repositorio solo publica safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio; RTX 3090 o RTX 4090 (24 GB) para fp16 en local; RTX 4080/4070 Ti (16 GB) para fp16 muy ajustado o int8; RTX 3060 12 GB, RTX 4060 Ti 16 GB o similares solo en cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en tarjetas de 16-24 GB en fp16 y en tarjetas de 8-12 GB con cuantizacion.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y TGI son viables (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF.
- Latencia y throughput: no disponibles. No hay datos publicados y, dada la observacion sobre el recuento de parametros, no se debe asumir una mejora de velocidad por la compresion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Datos de seguridad / calidad publicados |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-mis7_swift_jbbsft10_remove20` (este) | 7.241.732.096 (fraccion densa declarada 0,8004) | 32.768 tokens (heredado) | SVD-LLM, 20% de parametros eliminados, 0% restaurado | Apache-2.0 | AdvBench ASR 0,0231; StrongREJECT ASR 0,0447; sobre-rechazo 0,3109; WikiText-2 PPL 7,3908 |
| `mistralai/Mistral-7B-Instruct-v0.2` | 7.241.732.096 | 32.768 tokens | Ninguna | Apache-2.0 | No disponible en la informacion proporcionada |
| Otras celdas de la misma rejilla del estudio | No disponible | No disponible | Varias reglas de seleccion y presupuestos de restauracion | No disponible | No disponible |
| Mistral-7B-Instruct-v0.3 (alternativa de la misma familia) | 7.241.732.096 | 32.768 tokens | Ninguna | Apache-2.0 | No disponible en la informacion proporcionada; anade vocabulario extendido y soporte declarado de function calling |

No se dispone de comparaciones cuantitativas directas: las metricas de seguridad del modelo base y de las celdas hermanas no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de chat de proposito general. El autor lo describe explicitamente como artefacto de investigacion y pide tratarlo como sujeto experimental, no como asistente desplegable.
- Riesgo de seguridad deliberado: la model card advierte que varias ramas de la rejilla estan degradadas en seguridad respecto al modelo base y que la compresion por si sola eleva la tasa de exito de ataque. No se publican las cifras del modelo sin comprimir para calibrar la magnitud.
- Sobre-rechazo elevado: 0,3109 en la metrica macro de WildGuard, lo que implica una proporcion considerable de peticiones benignas rechazadas.
- Alucinacion: no se publican evaluaciones de veracidad. Al tratarse de un modelo de 7B comprimido, cabe esperar el perfil tipico de su escala, sin datos concretos que lo cuantifiquen.
- Idioma: no se declaran idiomas soportados ni se ha verificado el comportamiento multilingue tras la compresion; el rendimiento fuera del ingles es incierto.
- Licencia: este derivado es Apache-2.0, pero la propia model card senala que el repositorio del modelo base no incluye fichero de licencia que permita su redistribucion. Conviene revisar la situacion antes de un uso comercial.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de calidad o seguridad.
- Opacidad metodologica: la regla de seleccion figura literalmente como `unknown`, y los sufijos `jbbsft10` y `swift` del nombre no se definen en la model card.
- Inconsistencia de datos: la fraccion de parametros densos declarada (0,8004) no se refleja en el recuento de parametros de los safetensors, que coincide con el del modelo base. No hay explicacion publicada.
- Despliegue: no se distribuyen pesos cuantizados ni GGUF, por lo que cualquier uso en llama.cpp, Ollama o similar exige una conversion previa por cuenta del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_jbbsft10_remove20
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Repositorio de referencia de Mistral-7B-Instruct-v0.2 (mismo enlace que el modelo base): https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2

Nota sobre la busqueda web: los resultados recuperados no guardan ninguna relacion con el modelo (contenido deportivo de ESPN sobre Los Angeles Lakers y la NBA). No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
