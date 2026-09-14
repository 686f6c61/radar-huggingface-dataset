# Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r06

## Resumen

El modelo `Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r06` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. No es un asistente conversacional de propósito general: es una celda concreta de una rejilla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. Sobre la base se aplicó una compresión SVD-LLM que elimina el 50,01 % de los parámetros de las proyecciones, dejando una fracción de parámetros resultante de 0,4999.

Sobre ese modelo comprimido se aplicaron 6 de las 10 rondas de un procedimiento iterativo de intercambio de parámetros neutro (parameter-neutral swap), con una regla de selección denominada `disc_iter` y un presupuesto de restauración del 1,000 % de los parámetros densos, repartido en fragmentos del 0,100 % por ronda. En total se restauraron y se eliminaron 3.912 componentes en cada dirección, con 38.841.600 parámetros intercambiados (0,60 % de los parámetros de proyección del modelo denso) y un factor de inserción de 0,5. El checkpoint corresponde a una ronda intermedia de una ejecución más larga (semilla 42).

Su relevancia es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión, midiendo tasas de éxito de ataque con jueces automáticos (AdvBench ASR 0,1846; StrongREJECT ASR 0,1661) y sobre-rechazo macro con WildGuard (0,2478). El autor advierte explícitamente de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, por lo que este artefacto debe tratarse como sujeto experimental, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con compresion SVD aplicada a las proyecciones |
| Parametros totales | 6.738.415.616 (6,74 mil millones), segun safetensors del repositorio |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat emplea 4096 tokens) |
| Tipos de cuantizacion | no disponible; el autor publica pesos safetensors sin cuantizar y no declara variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Llama 2 Community License (campo `license: llama2`); el repositorio incluye `LICENSE.txt` y `USE_POLICY.md` |
| Formato de pesos | safetensors (libreria transformers, pipeline text-generation) |
| Tamano del repositorio | 13,5 GB |
| Fraccion de parametros resultante | 0,4999 (50,01 % de parametros de proyeccion eliminados) |
| Regla de seleccion | `disc_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda) |
| Rondas iterativas aplicadas | 6 de 10 |
| Componentes restaurados / eliminados | 3.912 / 3.912 |
| Parametros intercambiados | 38.841.600 (0,60 % de los parametros de proyeccion densos) |
| Valor de intercambio | `insert` (solo valor de insercion; desalojo ordenado por sigma) |
| Escala de insercion | 0,5 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La base es Llama-2-7b-chat, un transformer decoder-only denso con normalizacion RMSNorm, RoPE y atencion causal. Sobre ese checkpoint no se ha realizado un entrenamiento adicional: la intervencion es de compresion y edicion de parametros. La compresion emplea SVD-LLM y elimina el 50,01 % de los parametros de las proyecciones mediante descomposicion en valores singulares, reduciendo la fraccion de parametros efectiva a 0,4999. Un detalle observable es que el recuento de parametros declarado en el repositorio (6.738.415.616) coincide con el del modelo denso de Llama-2-7b, lo que sugiere que la compresion se materializa sobre las mismas formas tensoriales (componentes eliminados in situ) en lugar de reducir el numero de entradas almacenadas; se trata de una inferencia a partir de los metadatos, no de un dato confirmado por el autor.

La segunda fase es una edicion iterativa de parametros: el procedimiento `parameter-neutral swap` selecciona componentes mediante la regla `disc_iter`, inserta valores nuevos con escala 0,5 y desaloja componentes en orden sigma, restaurando el 0,100 % de los parametros densos por ronda hasta un presupuesto total del 1,000 %. El checkpoint publicado corresponde a la ronda 6 de 10, con 3.912 componentes intercambiados en cada sentido. No se documenta en la informacion disponible ningun ajuste por RLHF, DPO o SFT posterior a la edicion, ni la composicion exacta del dataset utilizado para calibrar las descomposiciones SVD.

## Capacidades

- Generacion de texto conversacional heredada de Llama-2-7b-chat, con la fidelidad reducida que implica una compresion del 50 % de los parametros de proyeccion.
- Utilidad como sujeto experimental para medir el impacto de la compresion SVD sobre el comportamiento de seguridad.
- Capacidad de servir como punto de comparacion frente a otras reglas de seleccion y presupuestos de restauracion de la misma rejilla.
- Evaluacion de robustez frente a ataques de jailbreak, con metricas calculadas mediante HarmBench (AdvBench y StrongREJECT).
- Medicion de sobre-rechazo (over-refusal) mediante el juez WildGuard.
- Compatibilidad con el stack de transformers y con text-generation-inference, segun los tags del repositorio (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades multilingues especificas: no documentadas en la model card.

## Casos de uso

- Investigacion sobre seguridad bajo compresion: el checkpoint permite cuantificar cuanto aumenta la tasa de exito de ataque (AdvBench ASR 0,1846) cuando se elimina el 50,01 % de los parametros, comparandolo con la base sin comprimir.
- Ablacion de reglas de seleccion de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, sirve para aislar el efecto de `disc_iter` frente a otras reglas bajo el mismo presupuesto del 1,000 %.
- Estudio de curvas de recuperacion por ronda: al tratarse de la ronda 6 de 10, permite analizar la evolucion intermedia del compromiso seguridad-utilidad antes de la convergencia del proceso.
- Evaluacion de jueces automaticos de seguridad: las metricas se han obtenido con HarmBench y WildGuard, por lo que es un banco de pruebas util para validar la calibracion de esos jueces sobre modelos degradados.
- Reproducibilidad experimental: la semilla 42, el fragmento por ronda y el numero de componentes estan documentados, lo que facilita reproducir exactamente la celda y contrastarla con ejecuciones independientes.
- Analisis de interpretabilidad: el intercambio de componentes individuales de las proyecciones permite estudiar que subespacios de pesos estan asociados a comportamientos de rechazo o de cumplimiento.
- Linea base negativa en auditorias: al ser un modelo con seguridad degradada de forma controlada, resulta util como referencia inferior en protocolos de red-teaming internos.
- Docencia y formacion: sirve para ilustrar de forma medible como tecnicas de compresion agresivas afectan a propiedades que no aparecen en las metricas de perplexidad.
- Advertencia: no es adecuado como asistente desplegado en produccion ni como sustituto directo de Llama-2-7b-chat en aplicaciones de cara al usuario.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,1846 | HarmBench judge |
| StrongREJECT ASR | 0,1661 | HarmBench judge |
| Macro over-refusal | 0,2478 | WildGuard |

Estas son las unicas cifras publicadas por el autor. No se proporcionan resultados de MMLU, GSM8K, HumanEval ni de perplexidad, ni valores de referencia de Llama-2-7b-chat sin comprimir en la informacion disponible, por lo que no es posible calcular la degradacion relativa con los datos aportados.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 13,5 GB solo para pesos, mas activaciones y cache KV; en la practica se recomienda un minimo de 16 GB de VRAM.
- VRAM estimada en int8: en torno a 7-8 GB de pesos.
- VRAM estimada en int4: en torno a 4-5 GB de pesos.
- GPU profesionales: A100 40/80 GB, H100, L40S y A6000 ejecutan el modelo en fp16 sin problemas.
- GPU de consumo: cabe en fp16 en RTX 4090, RTX 3090 y RTX 4080 (16 GB, al limite); en RTX 4070 Ti, RTX 3080 y RTX 4060 Ti requiere cuantizacion a 8 o 4 bits.
- Despliegue: compatible con transformers y con text-generation-inference segun los tags del repositorio; vLLM, llama.cpp, Ollama y TGI son opciones plausibles al ser una arquitectura Llama 2 estandar, aunque el autor no publica pesos GGUF ni confirmar compatibilidad probada con cada uno de ellos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_remove50_swapdisc_a050_b010_r06 | 6,74 mil millones (fraccion efectiva 0,4999) | no disponible | AdvBench 0,1846 / StrongREJECT 0,1661 | Llama 2 Community License | HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6,74 mil millones densos | 4096 tokens | no disponible en la informacion proporcionada | Llama 2 Community License | HuggingFace (modelo ampliamente distribuido) |
| Otras celdas de la misma rejilla (reglas y presupuestos alternativos) | no disponible | no disponible | no disponible | Llama 2 Community License | no disponible |

No se dispone de datos publicados que permitan comparar esta celda con alternativas equivalentes de compresion (por ejemplo, otras variantes SVD-LLM, destilaciones o podas estructuradas) en terminos de seguridad o de calidad de generacion. La comparativa queda limitada al modelo base y a las celdas hermanas de la rejilla, cuyas metricas no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica expresamente que no es un modelo de chat de proposito general y que debe tratarse como sujeto experimental.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresion por si sola eleva la tasa de exito de ataque, y este checkpoint presenta un ASR de 0,1846 en AdvBench y 0,1661 en StrongREJECT, con un sobre-rechazo macro de 0,2478.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; previsiblemente superior al de la base sin comprimir al haberse eliminado el 50,01 % de los parametros de proyeccion, aunque no hay medicion publicada.
- Sesgos: no documentados en la model card; hereda los sesgos de Llama-2-7b-chat y no se ha realizado ninguna evaluacion de sesgo especifica sobre esta celda.
- Limitaciones de idioma: no se declara lista de idiomas soportados; no hay garantia de comportamiento multilingue mas alla del heredado del modelo base.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion proporcionada; cualquier uso que dependa de ventanas largas debe verificarse empiricamente.
- Restricciones de licencia: se aplica la Llama 2 Community License y el uso de este derivado queda vinculado tanto a `LICENSE.txt` como a `USE_POLICY.md` incluidos en el repositorio; existen restricciones de uso comercial y de escala que deben revisarse antes de cualquier despliegue.
- Estado del checkpoint: corresponde a una ronda intermedia (6 de 10) de una ejecucion mas larga; los resultados pueden no representar el comportamiento final del procedimiento completo.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente conocida.
- No hay evidencia de soporte de tool calling, agentes, vision ni modo de razonamiento explicito; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapdisc_a050_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Ficheros de licencia y politica de uso incluidos en el repositorio: `LICENSE.txt` y `USE_POLICY.md`
- Papers, repositorios, blogs o demos adicionales: no disponibles. Los resultados de la busqueda web realizada no contienen ningun enlace relacionado con este modelo ni con compresion SVD de LLM (los resultados obtenidos tratan sobre la pagina `about:blank` de los navegadores y no son relevantes).
