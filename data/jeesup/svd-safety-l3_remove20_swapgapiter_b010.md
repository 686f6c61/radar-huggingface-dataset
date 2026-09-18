# Jeesup/svd-safety-l3_remove20_swapgapiter_b010

## Resumen

svd-safety-l3_remove20_swapgapiter_b010 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct, publicado por el usuario Jeesup, que combina dos transformaciones: una compresion por descomposicion en valores singulares con la tecnica SVD-LLM (se declara una eliminacion del 20,02 % de los parametros densos) y una edicion posterior de reparacion mediante 10 rondas iterativas de intercambio de parametros neutro, guiadas por la regla de seleccion `gap_iter`, con un presupuesto del 1,000 % de los parametros densos (0,100 % por ronda). El resultado declarado es una fraccion de parametros de 0,7998 respecto al modelo denso original.

El modelo no es un asistente de proposito general: es un artefacto de investigacion que ocupa una celda concreta de una malla experimental sobre reglas de seleccion de componentes y presupuestos de restauracion. Su objetivo es cuantificar como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que criterio de seleccion repara mejor ese dano. La model card advierte explicitamente de que varias celdas de la malla estan degradadas deliberadamente en seguridad en comparacion con Llama-3-8B-Instruct.

El checkpoint se publica en formato safetensors con la libreria transformers, pesa 16,1 GB y declara la licencia Meta Llama 3 Community License. Cuenta con 0 descargas y 0 me gusta en el momento de redactar esta ficha, por lo que no existe validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Llama 3 8B (32 capas, atencion con GQA, dimension oculta 4096, RoPE). No se detalla en la model card; se deduce del modelo base |
| Parametros totales | 8.030.261.248 (recuento de los tensores safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama-3-8B-Instruct soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors en precision completa (~16,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Compresion aplicada | SVD-LLM, 20,02 % de parametros eliminados |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda, 10 de 10 rondas aplicadas) |
| Componentes restaurados / sustituidos | 8.999 restaurados y 8.999 sustituidos |
| Parametros intercambiados | 69.740.544 (1,00 % de los parametros densos de proyeccion), valor de intercambio `insert` |
| Fraccion de parametros resultante | 0,7998 |
| Semilla | 42 |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Fecha de creacion | 2026-09-17 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas (GQA). Este checkpoint no ha sido reentrenado desde cero ni sometido a un nuevo ciclo de ajuste por instrucciones: parte del modelo ya alineado y le aplica una compresion estructural seguida de una edicion selectiva de pesos. La model card no aporta informacion sobre el dataset de entrenamiento original, el numero de tokens, ni sobre fases de RLHF o DPO, mas alla de lo que corresponde al modelo base.

La innovacion tecnica del trabajo es el procedimiento de reparacion posterior a la compresion. SVD-LLM elimina un 20,02 % de los parametros densos truncando descomposiciones de matrices de proyeccion; ese proceso degrada la alineacion de seguridad, de modo que el autor aplica despues un intercambio de parametros denominado "neutro en parametros": se sustituyen 8.999 componentes y se restauran otros 8.999, moviendo 69.740.544 parametros (el 1,00 % de los parametros densos de proyeccion) a lo largo de 10 rondas iterativas, con la regla `gap_iter` decidiendo que componentes entran y salen en cada ronda, con eviccion ordenada por sigma. El presupuesto total de la ejecucion es del 1,0 % y la semilla utilizada es 42, lo que hace el experimento reproducible en principio.

Conviene senalar una discrepancia que el propio recuento de tensores revela: los safetensors suman 8.030.261.248 parametros, una cifra identica a la que se reporta habitualmente para Llama-3-8B-Instruct sin comprimir. Es decir, la reduccion declarada del 20,02 % no se refleja en el numero de parametros almacenados en el repositorio, algo que puede deberse a la contabilidad interna del metodo o a que los tensores mantienen su forma original con matrices truncadas. Antes de reutilizar el checkpoint conviene verificar la estructura real de las matrices.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones, heredada del ajuste de Llama-3-8B-Instruct.
- Razonamiento de un solo turno y multiturno dentro del contexto soportado por el modelo base.
- Capacidad multilingue: no documentada en la model card; el autor no declara idiomas soportados.
- Soporte de tool calling o function calling: no documentado en la model card, aunque el modelo base Llama-3-8B-Instruct si soporta llamadas a herramientas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible; es un modelo exclusivamente de texto.
- Capacidad medida mas relevante: comportamiento de rechazo ante peticiones daninas. Los valores declarados son un ASR de 0,0019 en AdvBench y de 0,0096 en StrongREJECT, ambos con juez HarmBench.
- Capacidad medida de utilidad conversacional: la model card solo aporta la perplejidad en WikiText-2 (16,5358) y una tasa macro de sobre-rechazo del 0,4047 (WildGuard), que es muy elevada.
- Edicion controlada de pesos: el checkpoint es util como objeto de estudio para analizar el efecto de reglas de seleccion de componentes sobre el comportamiento de seguridad.

## Casos de uso

- Investigacion sobre compresion y alineacion: el checkpoint sirve como punto de comparacion dentro de la malla experimental del autor para medir cuanto degrada la compresion SVD-LLM la seguridad y cuanto la recupera la edicion iterativa. Se usaria ejecutando AdvBench y StrongREJECT sobre esta celda y sobre el modelo denso de referencia.
- Evaluacion comparativa de reglas de seleccion de componentes: la etiqueta `gap_iter` identifica una celda concreta, de modo que el modelo se emplea para contrastar esa regla frente a otras del mismo grid manteniendo presupuesto y semilla constantes.
- Estudio del sobre-rechazo: con una tasa macro de sobre-rechazo de 0,4047 medida con WildGuard, el modelo es un candidato claro para analizar como la reparacion de seguridad puede provocar que el modelo rechace peticiones benignas, y para calibrar clasificadores de rechazo.
- Analisis de perplejidad como proxy de degradacion: la cifra de 16,5358 en WikiText-2 permite estudiar la correlacion entre perdida de calidad de lenguaje y cambios en el comportamiento de seguridad tras la compresion.
- Red-teaming y evaluacion de jueces automaticos: el checkpoint puede usarse como sujeto de pruebas para validar la sensibilidad de jueces tipo HarmBench o WildGuard, comprobando si detectan correctamente un modelo deliberadamente alterado.
- Reproduccion experimental: al declararse semilla 42, 10 rondas y un presupuesto del 1,000 %, el artefacto permite reproducir la tuberia de compresion y edicion sin depender de detalles no documentados.
- Docencia e interpretabilidad: sirve como ejemplo practico de como la descomposicion en valores singulares y la edicion selectiva de parametros afectan a un comportamiento alineado concreto, en cursos o seminarios de interpretabilidad mecanistica.
- No se recomienda su uso como asistente desplegado en produccion ni en atencion al cliente, generacion de codigo o cualquier tarea orientada a usuarios finales: la propia model card lo desaconseja.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,0019 | HarmBench judge |
| StrongREJECT ASR | 0,0096 | HarmBench judge |
| Macro over-refusal | 0,4047 | WildGuard |
| Perplejidad WikiText-2 | 16,5358 | WikiText-2 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad general en la informacion disponible. Tampoco se aportan las cifras del modelo denso de referencia, por lo que no es posible calcular la variacion atribuible a la compresion y a la edicion a partir de esta ficha.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16 GB solo para pesos, mas cache KV y activaciones; con contexto completo de 8.192 tokens conviene reservar 20-24 GB.
- VRAM estimada en int8: aproximadamente 9-10 GB, incluyendo overhead.
- VRAM estimada en int4: aproximadamente 6-7 GB.
- Cabe en GPU de consumo: si, en cuantizaciones de 8 y 4 bits sobre RTX 3090, RTX 4090, RTX 4080 o equivalentes. En fp16 cabe ajustado en tarjetas de 24 GB (RTX 3090, RTX 4090) con contexto reducido, y con holgura en tarjetas de 40-48 GB (A100 40GB, L40S, A6000).
- GPU recomendadas para servicio: A100 40/80 GB, H100, L40S. Para fp16 con contexto largo, A100 80 GB o H100.
- Opciones de despliegue: transformers de forma nativa; TGI es compatible segun la etiqueta `endpoints_compatible` del repositorio; vLLM es una opcion razonable al ser una arquitectura Llama 3. La conversion a GGUF para llama.cpp u Ollama no esta documentada ni verificada, y dado que el checkpoint procede de una compresion SVD conviene comprobar la compatibilidad de las formas de los tensores antes de intentarla.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad ni de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ASR AdvBench | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l3_remove20_swapgapiter_b010 | 8,03 B almacenados (declara 0,7998 de fraccion densa) | no disponible | 0,0019 | 16,5358 | Meta Llama 3 Community License | HuggingFace, 0 descargas |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Meta Llama 3 Community License | HuggingFace, ampliamente desplegado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Meta Llama 3.1 Community License | HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |

Las cifras de contexto y licencia de los modelos alternativos corresponden a conocimiento publico general sobre esos modelos base y no proceden de la busqueda web realizada, que no devolvio resultados tecnicos relevantes. Deben verificarse en sus respectivas model cards. La comparacion de rendimiento entre alternativas no puede completarse con los datos disponibles: el unico modelo del que se conocen metricas de seguridad y perplejidad en esta ficha es el checkpoint objeto de analisis.

## Limitaciones y advertencias

- Artefacto de investigacion, no un modelo desplegable: la model card indica explicitamente que debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Degradacion deliberada de seguridad en algunas celdas: el propio autor advierte de que varias configuraciones de la malla son menos seguras que Llama-3-8B-Instruct de forma intencionada. Esta celda concreta presenta un ASR bajo (0,0019 en AdvBench), pero no debe generalizarse ese resultado al resto del grid.
- Sobre-rechazo muy alto: la tasa macro de sobre-rechazo es de 0,4047, es decir, en torno al 40 % de peticiones benignas podrian ser rechazadas. Este valor es problematico para cualquier uso conversacional real.
- Riesgo de alucinacion: no evaluado en la informacion disponible. La compresion de pesos y la edicion selectiva de parametros pueden alterar el comportamiento factual de formas no caracterizadas en esta ficha.
- Idiomas: el autor no declara idiomas soportados. No hay garantia de comportamiento multilingue mas alla del que herede el modelo base.
- Contexto: no se especifica en la model card; la ventana util depende del modelo base y no ha sido validada tras la compresion.
- Ausencia de benchmarks de capacidad general: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede afirmar que el modelo conserve la utilidad del base.
- Discrepancia en el recuento de parametros: los safetensors suman 8.030.261.248 parametros, la misma cifra que se reporta habitualmente para el modelo base sin comprimir, lo que no concuerda con la reduccion del 20,02 % declarada. Hay que verificar la estructura real de los tensores.
- Sin validacion de la comunidad: 0 descargas y 0 me gusta; el checkpoint no ha sido evaluado de forma independiente.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License y el `USE_POLICY.md` incluidos en el repositorio. Esto implica obligaciones de atribucion ("Built with Meta Llama 3"), condiciones de uso aceptable y un umbral de 700 millones de usuarios mensuales a partir del cual se requiere licencia adicional de Meta. Conviene revisar el texto completo antes de cualquier uso comercial.
- Cuantizaciones: no se publican versiones GGUF, AWQ, GPTQ ni similares; cualquier cuantizacion tendria que generarla el usuario y validarla por su cuenta, con el riesgo anadido de que la compresion SVD previa interactue de forma no prevista con los algoritmos de cuantizacion.
- Procedencia del modelo base: el uso del checkpoint esta sujeto tambien a los terminos de Meta aplicables a Llama-3-8B-Instruct.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3 (archivo `LICENSE` en el repositorio del modelo): https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010/blob/main/LICENSE
- Politica de uso aceptable (archivo `USE_POLICY.md` en el repositorio del modelo): https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010/blob/main/USE_POLICY.md
- Metodo de compresion SVD-LLM: paper referenciado por el autor en la model card sin enlace directo; no se ha localizado URL verificada en la busqueda realizada.
- Nota sobre la busqueda web: los resultados obtenidos corresponden a sitios de efemerides historicas ("on this day") y no guardan ninguna relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
