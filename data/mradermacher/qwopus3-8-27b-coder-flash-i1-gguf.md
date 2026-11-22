# mradermacher/Qwopus3.8-27B-Coder-Flash-i1-GGUF

## Resumen

Qwopus3.8-27B-Coder-Flash-i1-GGUF es la distribucion en formato GGUF del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, publicada por el cuantizador mradermacher. Se trata de un modelo multimodal de tipo image-text-to-text con 27.320.697.856 parametros (aproximadamente 27,3 mil millones), orientado a generacion de codigo, razonamiento y uso de herramientas (tool-use y agentes). La familia a la que pertenece se etiqueta como qwen3_5 y qwopus3_8, lo que sugiere una base derivada de Qwen, aunque la model card no detalla la arquitectura interna.

El paquete incluye cuantizaciones ponderadas con imatrix (etiquetadas i1) en una amplia gama de tipos: desde i1-Q2_K (11,0 GB) hasta i1-Q6_K (22,5 GB), pasando por i1-IQ3_S, i1-Q4_K_M y i1-Q5_K_M, entre otras. Esta variedad permite desplegar el modelo en hardware muy distinto, desde GPUs de consumo con 12-16 GB de VRAM hasta estaciones de trabajo con 24 GB o mas. El repo tambien ofrece cuantizaciones estaticas en un repositorio hermano (Qwopus3.8-27B-Coder-Flash-GGUF).

La relevancia de esta ficha radica en que combina tres caracteristicas poco frecuentes en un mismo paquete: tamano medio (27B), capacidades multimodales (vision) y especializacion en codigo y agentes, todo bajo licencia Apache 2.0. Esto lo hace atractivo para equipos que quieren un modelo de codigo con vision ejecutable en local, sin depender de APIs propietarias y con libertad de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como qwen3_5 / qwopus3_8; transformer multimodal image-text-to-text) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien imatrix file |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas de la model card: se clasifica como image-text-to-text, vision, multimodal y conversational, con la etiqueta qwen3_5, lo que apunta a una base de la familia Qwen 3.5 adaptada. El modelo base es Jackrong/Qwopus3.8-27B-Coder-Flash, un fine-tune orientado a codigo, razonamiento, tool-use y agentes. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento.

El trabajo de esta ficha concreta es la cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (i1), un metodo que usa una matriz de importancia para preservar mejor los pesos relevantes y reducir la perdida de calidad respecto a cuantizaciones estaticas del mismo tamano. La model card incluye la imatrix file (0,1 GB) por si el usuario quiere generar sus propias cuantizaciones. No se documentan innovaciones arquitectonicas adicionales como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de codigo y code-generation, segun las etiquetas del modelo.
- Razonamiento (reasoning) y resolucion de problemas multi-paso.
- Uso de herramientas y function calling (tool-use).
- Flujos de agente (agent) con razonamiento multi-step.
- Capacidades multimodales de vision: entrada image-text-to-text.
- Conversacion multi-turno (conversational).
- Inferencia eficiente (efficient-inference) gracias al formato GGUF.
- Idiomas: ingles y chino (en, zh).
- Compatibilidad con endpoints (endpoints_compatible) y vLLM segun etiquetas.

## Casos de uso

- Asistente de codigo en local para desarrolladores: con cuantizaciones i1-Q4_K_M (16,9 GB) o i1-Q5_K_M (19,6 GB) el modelo cabe en GPUs de 24 GB y permite autocompletado, explicacion y refactorizacion de codigo sin enviar el codigo a servicios externos.
- Revision de codigo en pipelines de CI/CD: el soporte de tool-use y agentes permite integrarlo en flujos que consultan repositorios, ejecutan linters y proponen parches automaticos.
- Analisis de capturas de pantalla y diagramas tecnicos: gracias a la entrada image-text-to-text, puede interpretar mockups de UI, diagramas de arquitectura o capturas de errores y generar codigo o explicaciones a partir de ellas.
- Agente de soporte tecnico para desarrolladores: conversaciones multi-turno con contexto de codigo y capacidad de invocar herramientas para consultar documentacion o estado de sistemas.
- Generacion de tests y documentacion: a partir de fragmentos de codigo o de imagenes de especificaciones, el modelo puede producir tests unitarios y documentacion tecnica en ingles o chino.
- Prototipado rapido en entornos con GPU de consumo: con i1-IQ3_S (12,7 GB) o i1-Q3_K_M (13,6 GB) se puede ejecutar en GPUs de 16 GB para tareas de codigo y vision en local.
- Despliegue en servidores con vLLM: la etiqueta vllm y endpoints_compatible sugiere integracion con infraestructura de serving estandar para exponer el modelo como API interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, aproximada al tamano del archivo mas overhead): i1-Q2_K ~11 GB; i1-IQ3_S ~12,7 GB; i1-Q3_K_M ~13,6 GB; i1-Q4_K_S ~15,9 GB; i1-Q4_K_M ~16,9 GB; i1-Q5_K_M ~19,6 GB; i1-Q6_K ~22,5 GB.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB) para cuantizaciones Q4_K_M y Q5_K_M; A100 40/80 GB o H100 para precisiones mayores y serving concurrente.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 16 GB con IQ3_S o Q3_K_M; en GPUs de 12 GB solo con cuantizaciones de 2-3 bits, con perdida notable de calidad.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM para el modelo base en safetensors (segun etiqueta vllm); TGI no se menciona en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-i1-GGUF (este) | 27,3B | no disponible | Si | Apache 2.0 | GGUF (i1) |
| Qwopus3.8-27B-Coder-Flash (base) | 27,3B | no disponible | Si | Apache 2.0 | safetensors |
| Qwopus3.8-27B-Coder-Flash-GGUF (estatico) | 27,3B | no disponible | Si | Apache 2.0 | GGUF (estatico) |

No se dispone de datos de rendimiento ni de modelos comparables de otras familias en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- No se especifica la longitud de contexto, lo que impide planificar tareas de contexto largo con garantias.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en generacion de codigo y en interpretacion de imagenes.
- Las cuantizaciones de 2 y 3 bits (Q2_K, IQ3_XXS, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El modelo es un fine-tune de terceros (Jackrong) sobre una base no documentada en detalle; no hay benchmarks publicados que validen sus capacidades frente a la base.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de entrenamiento antes de un uso comercial critico.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- El repo completo ocupa 218,6 GB; la descarga selectiva de una sola cuantizacion es imprescindible.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-i1-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwopus3.8-27B-Coder-Flash-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
