# mradermacher/Muse-Glimmer-30B-Hermes-Agentic-i1-GGUF

## Resumen

Muse-Glimmer-30B-Hermes-Agentic-i1-GGUF es una cuantización GGUF con imatrix del modelo Muse-Glimmer-30B-Hermes-Agentic, un fine-tuning del modelo abierto Muse Glimmer de Meta Superintelligence Labs. El modelo original, de 30 mil millones de parámetros (27,85 B reales), está optimizado para agentes locales siempre activos, con capacidades de tool calling, razonamiento multi-paso y recuperación de errores, y se distribuye bajo licencia Apache 2.0. Esta variante cuantizada, creada por mradermacher, reduce el tamaño del modelo para facilitar su ejecución en hardware de consumo con una sola GPU, manteniendo las capacidades agentic y multimodales del original.

La relevancia de este modelo radica en su enfoque en inferencia local: permite desplegar agentes con function calling en dispositivos personales sin depender de la nube, lo que reduce latencia y costes. La cuantización i1 (imatrix) mejora la calidad de los quants de baja precisión, haciendo que incluso las versiones de 10-13 GB sean utilizables en GPUs de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 (27,85 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (10,8 GB), i1-IQ3_M (12,9 GB); el repositorio estatico incluye Q2_K, IQ3_M, Q4_K_S, Q5_K_M, etc. |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base, `vcruz305/Muse-Glimmer-30B-Hermes-Agentic`, es un fine-tuning del modelo Muse Glimmer de Meta (30 B parametros) sobre el dataset `vcruz305/hermes-agentic-tool-sft`, orientado a tool calling y comportamiento agente. El modelo original de Meta esta disenado para ejecutarse localmente en una sola GPU, con soporte multimodal (vision) y optimizaciones para tareas de larga duracion y recuperacion de fallos. No se han proporcionado detalles tecnicos sobre la arquitectura interna (tipo de transformer, atencion, etc.) ni sobre el proceso de entrenamiento (numero de tokens, tecnicas de RLHF/DPO) en la informacion disponible.

La cuantizacion realizada por mradermacher utiliza el metodo imatrix (importance matrix) para generar quants de baja precision con menor perdida de calidad. El repositorio incluye un archivo imatrix separado para que los usuarios puedan generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generacion de texto, razonamiento y codigo (inferido por su naturaleza de modelo generalista, aunque no hay datos especificos).
- Tool calling / function calling: soporte explicito para invocar herramientas externas, segun los tags y el dataset de entrenamiento.
- Agentes y razonamiento multi-paso: optimizado para tareas de larga duracion y recuperacion de errores, segun la descripcion de Meta.
- Multimodal (vision): el modelo base incluye capacidades de vision, aunque los archivos mmproj se encuentran en el repositorio estatico, no en este.
- Multilingue: solo ingles (idioma declarado).
- Inferencia local: disenado para ejecutarse en hardware de consumo con una sola GPU.

## Casos de uso

- Asistentes personales locales: gestion de calendario, envio de correos o control de dispositivos mediante tool calling, ejecutandose en un portatil con GPU de gama media gracias a la cuantizacion.
- Automatizacion de tareas de oficina: redaccion de informes, resumen de documentos y generacion de respuestas a partir de plantillas, con acceso a APIs internas via function calling.
- Agentes de atencion al cliente: integracion en sistemas de soporte que consultan bases de conocimiento o CRM, manteniendo conversaciones multi-turno con contexto largo (si la ventana de contexto lo permite, aunque no se especifica).
- Desarrollo de codigo asistido: uso como copiloto en IDEs, con capacidad de ejecutar comandos o consultar repositorios mediante herramientas externas.
- Analisis de documentos con vision: extraccion de informacion de imagenes o PDFs escaneados, combinando capacidades multimodales con razonamiento.
- Investigacion y analisis de datos: agentes que realizan busquedas en la web, consultan APIs y razonan sobre los resultados para responder preguntas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para el quant i1-Q2_K (10,8 GB) se requieren aproximadamente 11-12 GB de VRAM; para i1-IQ3_M (12,9 GB), unos 13-14 GB. Con cuantizaciones mas altas (disponibles en el repositorio estatico) la VRAM necesaria aumenta proporcionalmente.
- GPU recomendadas: RTX 3080/3090 (12-24 GB), RTX 4090 (24 GB) o A100 (40 GB) para las versiones mas grandes. Modelos con 16 GB de VRAM (RTX 4080, 4070 Ti) pueden ejecutar los quants mas pequenos.
- Consumer GPU: si, los quants de 10-13 GB caben en GPUs de consumo con 12-16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama (si se importa el GGUF), o cualquier runtime compatible con GGUF. Para despliegue en servidor, vLLM no soporta GGUF directamente; se necesitaria convertir a safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse-Glimmer-30B-Hermes-Agentic (este) | 27,85 B | no disponible | Apache 2.0 | GGUF en HF |
| Llama 3.1 8B Instruct | 8 B | 128 K | Llama 3.1 (permisiva) | Varios formatos |
| Qwen 2.5 32B Instruct | 32,5 B | 128 K | Apache 2.0 | Varios formatos |
| Mixtral 8x7B | 46,7 B (MoE) | 32 K | Apache 2.0 | Varios formatos |

No se dispone de datos de rendimiento comparativo. La eleccion entre estos modelos dependera de la VRAM disponible, la necesidad de tool calling y la licencia. Muse-Glimmer destaca por su enfoque en agentes locales y su licencia Apache 2.0, mientras que Qwen 2.5 32B ofrece un contexto mas largo y Llama 3.1 8B es mas ligero.

## Limitaciones y advertencias

- Solo soporta ingles; no es adecuado para aplicaciones multilingues.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo.
- La cuantizacion de baja precision (Q2_K, IQ3_M) puede degradar la calidad de las respuestas y aumentar la tasa de errores en tareas de tool calling.
- No se han publicado evaluaciones de sesgos o seguridad; se recomienda auditar antes de un despliegue en produccion.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario verificar que el modelo base (Muse Glimmer de Meta) no tenga restricciones adicionales.
- El repositorio actual solo incluye dos quants; para otras cuantizaciones hay que acudir al repositorio estatico, lo que puede anadir complejidad.

## Enlaces

- Repositorio HuggingFace (cuantizacion i1): https://huggingface.co/mradermacher/Muse-Glimmer-30B-Hermes-Agentic-i1-GGUF
- Modelo base (fine-tuning): https://huggingface.co/vcruz305/Muse-Glimmer-30B-Hermes-Agentic
- Repositorio estatico de cuantizaciones: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Hermes-Agentic-GGUF
- Blog de Meta Research: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Pagina de Meta Developer: https://developer.meta.com/ai/models/muse-glimmer/
- Repositorio GitHub (guia y laboratorio): https://github.com/cobusgreyling/Muse-Glimmer
