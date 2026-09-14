# Jeesup/svd-safety-mistral_keep80_disc_b010

## Resumen

`svd-safety-mistral_keep80_disc_b010` es un checkpoint derivado de `mistralai/Mistral-7B-Instruct-v0.2` comprimido mediante SVD-LLM y publicado por el usuario Jeesup en HuggingFace. La compresion elimina el 19,02 % de los parametros densos, dejando una fraccion resultante de 0,8098 respecto al modelo original, tras lo cual se restauran 6.967 componentes SVD con un presupuesto equivalente al 1,000 % de los parametros densos, seleccionados mediante la regla denominada `disc`. El resultado es un modelo denso de 7.241.732.096 parametros que ocupa 14,5 GB en el repositorio.

El interes del artefacto no es su capacidad conversacional, sino que constituye una celda concreta de una rejilla experimental sobre reglas de seleccion de componentes y presupuestos de restauracion. El autor lo presenta explicitamente como un sujeto de estudio para cuantificar como la compresion SVD degrada el comportamiento de seguridad y que regla de seleccion lo repara mejor. Varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto al modelo base, por lo que este checkpoint no debe tratarse como un asistente desplegable.

Los datos medidos por el autor incluyen una tasa de exito de ataque (ASR) de 0,2673 en AdvBench, 0,2939 en StrongREJECT, una tasa de sobrerrechazo macro de 0,0742 medida con WildGuard y una perplejidad de 8,0163 en WikiText-2. Estos valores sitúan la celda en un punto concreto del compromiso seguridad-utilidad bajo compresion, que es precisamente lo que el estudio pretende caracterizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Mistral-7B-Instruct-v0.2; no se documentan cambios estructurales en la model card) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Mistral-7B-Instruct-v0.2 soporta 32.768 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors sin cuantizar) |
| Idiomas soportados | No disponible en la model card; heredados del modelo base (predominantemente ingles, con capacidades multilingues limitadas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Fraccion de parametros resultante | 0,8098 respecto al modelo denso original |
| Presupuesto de restauracion | 1,000 % de los parametros densos |
| Componentes restaurados | 6967 |
| Componentes sustituidos | 0 |
| Semilla | 42 |
| Tamano del repositorio | 14,5 GB |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de indicar que se parte de Mistral-7B-Instruct-v0.2. Dado que no se anaden ni eliminan capas ni se cambia el esquema de atencion, la topologia subyacente corresponde a la del modelo base: un transformer decoder-only con atencion de consultas agrupadas (GQA) y atencion de ventana deslizante. La intervencion consiste en una compresion por descomposicion en valores singulares (SVD-LLM) que retira el 19,02 % de los parametros, seguida de una restauracion parcial de componentes SVD. No hay, por tanto, un entrenamiento adicional del modelo completo: el proceso es de compresion y reparacion selectiva de subespacios, no de ajuste fino supervisado, RLHF ni DPO.

El detalle metodologico relevante es la regla de seleccion de componentes. Con la regla `disc` y un presupuesto del 1,000 %, se restauran 6967 componentes y no se sustituye ninguno (`components swapped out = 0`), con semilla 42. La model card indica que el checkpoint es una celda de una rejilla sobre reglas de seleccion y presupuestos, y que el objetivo del estudio es medir el dano que la compresion SVD inflige al comportamiento de seguridad y comparar que regla lo repara mejor. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de alineacion posteriores a la compresion.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base Mistral-7B-Instruct-v0.2, aunque degradada por la compresion y sin garantia de calidad equivalente.
- Razonamiento e instrucciones: el modelo base esta ajustado por instrucciones, por lo que mantiene el formato de dialogo y la respuesta a consignas, si bien la model card advierte de que no es un modelo de chat de proposito general.
- Codigo y matematicas: capacidades heredadas del modelo base, no medidas ni documentadas en la informacion proporcionada para esta celda.
- Tool calling y function calling: no documentado en la informacion proporcionada; el modelo base no incluye plantilla de herramientas nativa.
- Agentes y razonamiento multi-paso: no documentado ni validado para esta celda.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad especial: modo de evaluacion de seguridad. El artefacto esta disenado para medir tasas de exito de ataque (AdvBench, StrongREJECT), sobrerrechazo (WildGuard) y perplejidad (WikiText-2), no para uso asistencial.
- No se documentan capacidades de vision, audio ni modos de pensamiento explicito.

## Casos de uso

- Investigacion sobre compresion de modelos: la celda permite cuantificar cuanto degrada la compresion SVD-LLM al comportamiento de seguridad de un modelo alineado, sirviendo como punto de referencia dentro de una rejilla de reglas de seleccion.
- Comparacion de reglas de seleccion de componentes: con 6967 componentes restaurados bajo la regla `disc` y un presupuesto del 1,000 %, este checkpoint se usa como brazo experimental frente a otras celdas del mismo estudio para determinar que criterio repara mejor la seguridad.
- Medicion de seguridad con jueces automatizados: el modelo se evalua con AdvBench y StrongREJECT usando HarmBench como juez, por lo que encaja en pipelines de red-teaming que calculan ASR de forma reproducible.
- Analisis del compromiso seguridad-utilidad: la combinacion de ASR (0,2673 en AdvBench) y sobrerrechazo macro (0,0742 con WildGuard) permite estudiar si la restauracion de componentes aumenta la seguridad a costa de rechazar peticiones legitimas.
- Evaluacion de perplejidad como proxy de calidad: con una perplejidad de 8,0163 en WikiText-2, la celda sirve para medir la perdida de modelado de lenguaje tras eliminar el 19,02 % de los parametros.
- Interpretabilidad de subespacios SVD: al conocer exactamente que componentes se restauran y cuales no, el checkpoint permite estudiar la contribucion de subespacios concretos a comportamientos de seguridad y utilidad.
- Reproduccion de experimentos: con semilla 42 y una configuracion documentada (regla, presupuesto, numero de componentes), la celda es reproducible en entornos de investigacion con `transformers`.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni despliegues de agentes, dado que el propio autor lo define como artefacto de investigacion y advierte de la degradacion deliberada de algunas celdas.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,2673 | HarmBench judge |
| StrongREJECT ASR | 0,2939 | HarmBench judge |
| Macro over-refusal | 0,0742 | WildGuard |
| WikiText-2 perplexity | 8,0163 | No especificado |

No se han publicado en la informacion disponible resultados comparativos con el modelo base sin comprimir ni con otras celdas de la rejilla (MMLU, HumanEval, GSM8K u otros). Los unicos datos numericos disponibles son los cuatro de la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,5 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda un minimo de 16-18 GB.
- VRAM estimada en cuantizacion int8: en torno a 8 GB de pesos, mas overhead.
- VRAM estimada en cuantizacion int4 (GGUF Q4_K_M): en torno a 4,5-5 GB de pesos, apto para GPU de consumo con 8-12 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 sin cuantizar con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 con contexto moderado; RTX 4070 Ti / 4080 (12-16 GB) para int8; RTX 3060 12 GB o superior para int4.
- Cabe en GPU de consumo: si, en cuantizaciones de 8 y 4 bits; en fp16 requiere 24 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), vLLM y TGI (el repositorio incluye la tag `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir los pesos safetensors a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de seguridad |
|---|---|---|---|---|---|
| svd-safety-mistral_keep80_disc_b010 | 7.241.732.096 (0,8098 del denso) | No disponible en la ficha (base: 32.768) | Apache-2.0 | HuggingFace, 0 descargas, 0 likes | AdvBench ASR 0,2673; StrongREJECT ASR 0,2939; over-refusal 0,0742 |
| mistralai/Mistral-7B-Instruct-v0.2 (base sin comprimir) | No disponible en la informacion proporcionada | 32.768 segun documentacion del modelo base | Apache-2.0 | HuggingFace | No disponible en la informacion proporcionada |
| mistralai/Mistral-7B-Instruct-v0.3 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache-2.0 | HuggingFace | No disponible en la informacion proporcionada |
| Otras celdas de la rejilla SVD del mismo autor | No disponible | No disponible | Apache-2.0 | HuggingFace | No disponible |

No se dispone de resultados comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa fiable con alternativas. La unica comparacion solida que puede hacerse es conceptual: frente al modelo base sin comprimir, esta celda reduce el numero de parametros en un 19,02 % y anade una restauracion del 1,000 %, a cambio de un comportamiento de seguridad medido y documentado por el autor.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card lo define como artefacto de investigacion y pide explicitamente no tratarlo como asistente desplegable.
- Degradacion deliberada de seguridad: varias celdas de la rejilla estan intencionadamente degradadas en seguridad respecto a Mistral-7B-Instruct-v0.2, y la compresion por si sola eleva la tasa de exito de ataque. El ASR medido de 0,2673 en AdvBench y 0,2939 en StrongREJECT es sustancialmente superior a lo esperable en un modelo alineado sin comprimir.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; la compresion puede agravar la perdida de fidelidad, pero no hay datos que lo cuantifiquen.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base, no caracterizados para esta celda.
- Limitaciones de contexto e idioma: no documentadas en la model card; el contexto y los idiomas efectivos tras la compresion no han sido verificados por el autor en la informacion disponible.
- Restricciones de licencia: la licencia declarada es Apache-2.0 y gobierna esta obra derivada. El autor senala que el repositorio del modelo base no incluye fichero de licencia para redistribuir, lo que conviene revisar antes de un uso comercial o de redistribucion.
- Advertencia de produccion: el autor recomienda evaluar el modelo por cuenta propia antes de extraer conclusiones. No debe integrarse en sistemas de atencion al cliente, moderacion de contenido ni agentes autonomos sin una evaluacion de seguridad independiente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_keep80_disc_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Perfil del autor: https://huggingface.co/Jeesup
- Paper de SVD-LLM (referencia metodologica citada en la model card, enlace no disponible en la informacion proporcionada): no disponible
- Repositorio de codigo del estudio: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos corresponden a dominios no relacionados con el modelo (Globus Baumarkt) y no aportan informacion util sobre esta ficha.
