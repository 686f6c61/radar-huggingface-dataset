# nile-academy/nemotron-3-nano-4b-gguf

## Resumen

`nile-academy/nemotron-3-nano-4b-gguf` es un repositorio de artefactos GGUF derivados del modelo `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, publicado por Nile Academy como espejo oficial o conversión de formato registrada, sin entrenamiento adicional. El modelo original lo desarrolla NVIDIA Corporation y se publicó el 16 de marzo de 2026; la revisión del código fuente está fijada en `dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f`. El repositorio contiene dos ficheros: una exportación oficial del editor en Q4_K_M (2,837 GB) y una conversión propia a Q8_0 (4,234 GB) a partir del BF16 original.

El modelo cuenta con 3.973.556.832 parámetros (aproximadamente 4B, incluyendo embeddings y modalidades del modelo fuente) y está etiquetado para generación de texto y uso conversacional. Su relevancia radica en que ofrece una variante cuantizada y ligera de un modelo de NVIDIA con modo de razonamiento (*thinking*) y capacidades de *tool calling*, pensada para despliegue en entornos con recursos limitados.

No obstante, el propio repositorio advierte de que la calificación amplia de calidad de cuantización de Wekala está **pendiente** ("not qualified"): Q4_K_M pierde 4,1 puntos en IFEval-Instruction respecto al modelo fuente y Q8_0 aún no ha sido cualificado en calidad. Por tanto, debe evaluarse con cuidado antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no detallada en la informacion proporcionada; modelo base NVIDIA Nemotron-3 Nano) |
| Parametros totales | 3.973.556.832 (~4B), incluye embeddings y modalidades del modelo fuente |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 (origen BF16) |
| Idiomas soportados | no disponibles |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | GGUF (Q4_K_M, Q8_0); modelo base en BF16 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo (tipo de transformer, atencion, posible hibridacion con SSM, etc.), por lo que este dato debe consultarse en la model card del modelo base de NVIDIA. Lo que si se especifica es que este repositorio **no realiza entrenamiento adicional**: Nile Academy actua como espejo oficial o conversion de formato explicitamente registrada a partir del BF16 publicado por NVIDIA. El modelo base se publico el 16 de marzo de 2026 y la revision fuente esta fijada en `dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f`.

El modelo dispone de dos modos de inferencia diferenciados en las evaluaciones del editor: *thinking* (razonamiento explicito) y *non-thinking*. Los benchmarks publicados separan ambos modos, lo que sugiere que el modelo incorpora un mecanismo de razonamiento configurable. No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras.

En cuanto al proceso de cuantizacion, el repositorio documenta que Q4_K_M es una exportacion oficial del editor y Q8_0 es una conversion de Wekala desde BF16, con recibos de conversion y valores SHA-256 registrados en `model-metadata.json`. El modelo Q8_0 se describe como una opcion de mayor precision derivada de BF16, "aun no cualificada en calidad".

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento en modo *thinking*: evaluado en AIME25 (78,5%), MATH500 (95,4%) y GPQA (53,2%).
- Seguimiento de instrucciones: IFEval-Prompt 82,8% en modo non-thinking y 87,9% en modo thinking.
- *Tool calling* / *function calling*: evaluado en BFCL-V3 con 61,1% en modo non-thinking.
- Razonamiento matematico de competicion y resolucion de problemas multi-paso.
- Modo dual thinking / non-thinking seleccionable segun la tarea.
- Capacidades multilingues: no confirmadas en la informacion disponible (idiomas no disponibles).
- Vision, audio u otras modalidades: no disponibles en la informacion proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible`) para integracion en servicios de inferencia.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con instrucciones de sistema gracias a su soporte de IFEval y su etiqueta conversacional; su tamano de ~4B permite desplegarlo en infraestructura modesta. La longitud de contexto debe confirmarse antes de fijar el diseno.
- **Asistentes con *tool calling* en produccion**: con un 61,1% en BFCL-V3 (modo non-thinking), es adecuado para agentes que invocan APIs y funciones, siempre que la aplicacion consumidora valide y autorice cada llamada propuesta.
- **Razonamiento matematico asistido**: los resultados en MATH500 (95,4%) y AIME25 (78,5%) en modo thinking lo hacen util para tutoria, verificacion de calculos y generacion de explicaciones paso a paso.
- **Generacion de codigo y scripting en pipelines de CI/CD**: puede integrarse como paso de generacion o revision de fragmentos, con la salvedad de que no se han publicado resultados de HumanEval ni de benchmarks de codigo en la informacion disponible.
- **Despliegue en local o en el borde**: los ficheros Q4_K_M (2,837 GB) y Q8_0 (4,234 GB) permiten ejecucion en CPU y en GPUs de consumo mediante llama.cpp u Ollama, util para prototipado y entornos sin GPU dedicada.
- **Procesamiento por lotes de texto a bajo coste**: al ser un modelo de ~4B cuantizado, se puede usar para clasificacion, resumen o extraccion sobre grandes volumenes de texto donde un modelo mayor resultaria prohibitivo.
- **Evaluacion comparativa de cuantizaciones**: el repositorio incluye dos variantes con tamanos distintos, lo que permite medir el impacto de Q4_K_M frente a Q8_0 en tareas concretas antes de fijar una configuracion.

## Benchmarks y rendimiento

Los siguientes resultados son **del modelo fuente segun el editor (NVIDIA)**, no mediciones de Wekala sobre los ficheros cuantizados. Los arneses, la precision, los ajustes de razonamiento y las versiones de tarea difieren, por lo que no deben tratarse como una clasificacion normalizada entre modelos.

| Benchmark | Puntuacion (%) | Modo / ajustes |
|---|---:|---|
| BFCL-V3 | 61,1 | non-thinking |
| IFEval-Prompt | 82,8 | non-thinking |
| IFEval-Prompt | 87,9 | thinking |
| AIME25 | 78,5 | thinking |
| MATH500 | 95,4 | thinking |
| GPQA | 53,2 | thinking |

Dato adicional de cuantizacion: la exportacion oficial Q4_K_M reduce IFEval-Instruction del 88,0% al 83,9% (4,1 puntos), por lo que **no cumple un margen de perdida de 2 puntos**. No se han publicado resultados de benchmarks de los ficheros cuantizados de este repositorio.

## Requisitos de hardware

- **Q4_K_M (2,837 GB de pesos)**: VRAM estimada de 4-5 GB incluyendo estado de contexto y buffers; cabe en GPUs de consumo de 6-8 GB (RTX 3060, RTX 4060, etc.). Cifras orientativas derivadas del tamano del fichero, no medidas.
- **Q8_0 (4,234 GB de pesos)**: VRAM estimada de 5,5-7 GB; adecuado para RTX 4070/4080 o superiores. Cifras orientativas.
- **BF16 del modelo base (~8 GB de pesos)**: requiere aproximadamente 10-12 GB de VRAM; recomendable RTX 4090, A100 o H100. Cifras orientativas.
- **CPU**: ambos ficheros GGUF son ejecutables en CPU; el modelo BF16 y Q8 superaron una prueba de carga y comprobacion numerica en CPU sobre Windows (texto en bruto).
- **GPU de referencia**: no se han publicado perfiles medidos de encaje sostenido en GPU; el repositorio indica que el ajuste sostenido en GPU y el funcionamiento en movil/navegador quedan pendientes de calificacion.
- **Opciones de despliegue**: llama.cpp y Ollama para GGUF; vLLM y TGI requeririan los pesos en BF16, no los ficheros GGUF.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos de terceros comparables, por lo que no es posible establecer una comparativa externa. Se presenta la comparacion interna entre las variantes disponibles del mismo modelo:

| Variante | Cuantizacion | Tamano (GB) | Origen | Calificacion de calidad |
|---|---|---:|---|---|
| NVIDIA-Nemotron3-Nano-4B-Q4_K_M.gguf | Q4_K_M | 2,837 | Exportacion oficial del editor | Perdida de 4,1 pts en IFEval-Instruction; no cumple margen de 2 pts |
| NVIDIA-Nemotron-3-Nano-4B-Q8_0-llamacpp-4413a19.gguf | Q8_0 | 4,234 | Conversion de Wekala desde BF16 | No cualificada en calidad |
| Modelo base NVIDIA Nemotron-3-Nano-4B-BF16 | BF16 | ~8 (estimado) | NVIDIA | Referencia de los benchmarks publicados |

## Limitaciones y advertencias

- **Cuantizacion no cualificada**: la calificacion amplia de calidad de cuantizacion de Wekala figura como "not qualified"; no se hace ninguna afirmacion general de "sin perdida significativa de calidad".
- **Perdida medible en Q4_K_M**: 4,1 puntos en IFEval-Instruction, por encima del margen de 2 puntos considerado aceptable.
- **Benchmarks no representativos de los ficheros**: los resultados publicados corresponden al modelo fuente y no a las variantes cuantizadas de este repositorio.
- **Alucinacion**: el propio repositorio advierte de que el modelo puede producir salidas incorrectas o inseguras.
- **Tool calls como propuestas**: las llamadas a herramientas son propuestas sujetas a los permisos de la aplicacion consumidora y a la admision del controlador.
- **Idiomas no documentados**: no se especifican los idiomas soportados, lo que impide garantizar un rendimiento multilingue.
- **Longitud de contexto desconocida**: no se indica la ventana de contexto, dato critico para disenar conversaciones multi-turno.
- **Fidelidad de plantilla y chat pendiente**: la fidelidad de chat, herramientas y plantilla, el encaje sostenido en GPU y la calificacion en movil/navegador siguen pendientes.
- **Licencia**: se rige por la NVIDIA Nemotron Open Model License; las condiciones exactas de uso comercial no se detallan en la informacion proporcionada y deben consultarse en el enlace oficial. El repositorio no concede derechos sobre el SDK de Wekala.
- **Repositorio espejo**: 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto derivado, no de una publicacion original de NVIDIA.
- **Separacion de artefactos**: los modelos y el repositorio se distribuyen por separado del SDK de Wekala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nile-academy/nemotron-3-nano-4b-gguf
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Model card fuente (revision fijada): https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16/blob/dfaf35de3e30f1867dd8dbc38a7fc9fb52d3914f/README.md
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
