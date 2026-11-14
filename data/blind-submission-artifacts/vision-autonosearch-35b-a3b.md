# blind-submission-artifacts/Vision-AutonoSearch-35B-A3B

## Resumen

Vision-AutonoSearch-35B-A3B es un agente multimodal de busqueda e investigacion visual, obtenido mediante fine-tuning del modelo base Qwen/Qwen3.5-35B-A3B. Lo publica la organizacion `blind-submission-artifacts`, un repositorio de artefactos asociado a un envio anonimo en revision, por lo que la autoria real no esta identificada. El modelo resuelve tareas de investigacion autonoma sobre imagenes: a partir de una imagen y una instruccion, planifica busquedas textuales y visuales, visita paginas y razona de forma multi-paso hasta responder. Su relevancia actual radica en que combina percepcion visual, tool calling y razonamiento agentico en un unico checkpoint de 35.107.181.936 parametros (35B) con arquitectura MoE (sufijo A3B, aproximadamente 3B parametros activos), lo que lo hace atractivo para pipelines de agentes de investigacion visual con coste de inferencia contenido.

El modelo es un fine-tune sobre Qwen3.5-35B-A3B, un transformer MoE multimodal de Qwen, y conserva la licencia Apache 2.0 del modelo base. El repositorio pesa 70,2 GB en safetensors y el pipeline declarado es `image-text-to-text`. La model card es deliberadamente minima: no documenta idiomas, datos de entrenamiento ni resultados de benchmarks, mas alla de indicar que acompana a un envio anonimo bajo revision.

La informacion disponible sobre el modelo es escasa y proviene casi exclusivamente de los metadatos de Hugging Face y de una model card muy breve. Esta ficha recoge lo verificable y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado, sin inferir cifras no documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tag `qwen3_5_moe`), fine-tune de Qwen/Qwen3.5-35B-A3B |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | Aproximadamente 3B (segun el sufijo A3B del nombre; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 70,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-35B-A3B, un transformer con mezcla de expertos (MoE) y capacidad multimodal, segun el tag `qwen3_5_moe` y el pipeline `image-text-to-text`. El fine-tuning esta orientado a una tarea concreta: investigacion visual autonoma (Visual Autonomous Investigation, VAI) y respuesta visual a preguntas (VQA). La model card indica que el modelo utiliza un prompt de sistema, un conjunto de herramientas y mensajes de usuario concretos, distribuidos en el directorio `inference/` del repositorio: `system_prompt.txt`, `tools.json` (con las herramientas `text_search`, `visual_search` y `visit`), `vai_user_instruction.txt` y `vqa_user_template.txt`.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del fine-tune. Tampoco se documenta la longitud de contexto efectiva ni si el entrenamiento altera el tokenizador o la torre visual del modelo base. Cualquier afirmacion sobre estos puntos seria especulativa y no se incluye.

## Capacidades

- Generacion de texto y razonamiento multi-paso orientado a tareas de investigacion.
- Comprension de imagenes (entrada image-text-to-text) para VQA e investigacion visual.
- Tool calling con tres herramientas declaradas: `text_search` (busqueda textual), `visual_search` (busqueda visual) y `visit` (visita de paginas o recursos).
- Comportamiento agentico: planificacion y ejecucion de pasos encadenados de busqueda y visita hasta completar la investigacion.
- Soporte de prompt de sistema dedicado y plantillas de usuario especificas para VAI y VQA.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision, audio u otras capacidades especiales: no documentadas mas alla de la entrada visual.

## Casos de uso

- Investigacion visual autonoma: dado un conjunto de imagenes y una pregunta de investigacion, el modelo encadena `visual_search` y `text_search` para localizar fuentes, visita paginas con `visit` y sintetiza una respuesta con trazabilidad de pasos. Es adecuado porque el fine-tune esta entrenado especificamente para esta secuencia de herramientas.
- Verificacion de hechos a partir de imagenes: el agente puede identificar el contenido de una imagen, buscar referencias textuales y contrastar la informacion antes de responder, reduciendo el riesgo de respuestas basadas solo en la percepcion visual.
- Analisis de documentos y capturas: extraccion de informacion de capturas de pantalla, diagramas o fotografias y posterior busqueda de contexto adicional en la web mediante las herramientas declaradas.
- Asistentes de investigacion periodistica o de due diligence: el agente puede rastrear la procedencia de una imagen o un producto y recopilar fuentes visitando paginas, con un flujo reproducible a partir de las plantillas del repositorio.
- Automatizacion de VQA en produccion: uso del modelo con `vqa_user_template.txt` para responder preguntas sobre imagenes en un pipeline de atencion o catalogacion, aprovechando su tamano MoE (~3B activos) para contener el coste por consulta.
- Evaluacion de agentes de busqueda: el repositorio sirve como artefacto de referencia para reproducir experimentos de un envio anonimo, comparando el comportamiento del agente con y sin las herramientas `text_search`, `visual_search` y `visit`.
- Moderacion o analisis de contenido visual con busqueda de contexto: el agente puede localizar la fuente original de una imagen y verificar si aparece en otros contextos antes de tomar una decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: el checkpoint completo ocupa 70,2 GB en safetensors, por lo que se requiere al menos ese espacio en memoria de GPU (o reparto entre GPUs) para cargarlo sin cuantizar.
- Cuantizacion: no se han publicado variantes GGUF ni cuantizaciones oficiales; cualquier cuantizacion requeriria convertir el modelo a partir de los pesos safetensors.
- GPU recomendadas: no disponible. Por tamano, un checkpoint de 70 GB en BF16 encaja en configuraciones multi-GPU tipo A100 80 GB, H100 80 GB o reparto entre varias GPU; no cabe en una RTX 4090 de 24 GB sin cuantizacion.
- Consumer GPU: no cabe en GPUs de consumo de 24 GB o menos en precision completa; no hay datos publicados sobre cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: no documentadas por el autor. El pipeline `image-text-to-text` y el formato safetensors son compatibles con frameworks de inferencia estandar, pero no se confirma soporte especifico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vision-AutonoSearch-35B-A3B | 35B totales, ~3B activos (MoE) | no disponible | Apache 2.0 | Hugging Face, 26 descargas | Fine-tune agentico de Qwen3.5-35B-A3B; sin benchmarks publicados |
| Qwen/Qwen3.5-35B-A3B (modelo base) | 35B totales, ~3B activos (MoE) | no disponible | no disponible en la informacion proporcionada | Hugging Face | Base multimodal y MoE del que deriva; capacidades agenticas especificas no documentadas aqui |
| Alternativas de agente visual de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Model card minima: no documenta idiomas, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.
- Envio anonimo bajo revision: la autoria y el proceso de evaluacion no estan confirmados; el modelo puede cambiar o retirarse.
- Riesgo de alucinacion: como agente de busqueda, puede generar respuestas no respaldadas por las fuentes visitadas o citar resultados incorrectos; se recomienda verificar la trazabilidad de las herramientas.
- Dependencia del prompt y de las herramientas: el comportamiento esta disenado en torno a `system_prompt.txt` y `tools.json`; usarlo con otros prompts o herramientas puede degradar el rendimiento.
- Idiomas: no documentados; no se puede garantizar un rendimiento multilingue.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-35B-A3B debe verificarse por separado para confirmar compatibilidad de terminos.
- Cuantizacion y despliegue: sin variantes GGUF ni guias de despliegue publicadas; el requisito de ~70 GB en BF16 limita su uso a infraestructura con varias GPU.
- Sesgos: no documentados; al ser un fine-tune sobre un modelo base no auditado en esta ficha, los sesgos del modelo base pueden persistir.

## Enlaces

- Hugging Face: https://huggingface.co/blind-submission-artifacts/Vision-AutonoSearch-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
