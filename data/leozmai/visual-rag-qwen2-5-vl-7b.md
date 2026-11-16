# leozmai/visual-rag-qwen2.5-vl-7b

## Resumen

Visual RAG agent con memoria de dos niveles es un ajuste fino de Qwen2.5-VL-7B-Instruct, desarrollado por el usuario leozmai, orientado a responder preguntas sobre un corpus de imagenes de paginas de documentos. El modelo actua como un agente que, en cada turno, lee una pagina, edita una memoria textual de dos niveles (un arbol de preguntas y un nodo de evidencia por pagina con hechos anotados con bounding boxes) y ejecuta una unica accion: buscar, revisitar, recortar o responder. El checkpoint publicado corresponde al paso 75 de un entrenamiento con GSPO.

El modelo parte de la arquitectura Qwen2.5-VL, un transformer multimodal con 8.292 millones de parametros totales y licencia Apache 2.0. El repositorio ocupa 16,6 GB en formato safetensors y se distribuye via transformers con pipeline image-text-to-text. No se especifican idiomas soportados en la informacion disponible.

Su relevancia radica en el enfoque de agente con memoria estructurada para RAG visual sobre documentos, un escenario donde los modelos multimodales genericos suelen fallar por perdida de contexto entre paginas. El modelo requiere un protocolo de agente y un system prompt especificos, disponibles en el repositorio de codigo del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen2.5-VL (image-text-to-text) |
| Parametros totales | 8.292.166.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa imagenes de paginas de documento y texto. Sobre esa base se aplica un ajuste fino en dos fases: primero, supervised fine-tuning sobre 2.400 trayectorias filtradas generadas por un profesor Qwen3.8-27B que sigue el mismo protocolo mediante prompting; despues, GSPO (Group Sequence Policy Optimization) durante 75 pasos sobre 1.200 preguntas. El checkpoint publicado es el del paso 75.

La innovacion principal no esta en la arquitectura del modelo base, sino en el protocolo de agente: memoria de dos niveles compuesta por un arbol de preguntas y un nodo de evidencia por pagina cuyos hechos llevan bounding boxes, junto con un espacio de acciones restringido (search, revisit, crop, answer). Las paginas se procesan a hasta 0,7 megapixeles. El modelo espera el system prompt y el protocolo de agente definidos en el repositorio de codigo del autor.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre imagenes de paginas de documento.
- Respuesta a preguntas sobre corpus documentales (document QA) con evidencia visual localizada mediante bounding boxes.
- Comportamiento de agente con acciones discretas: buscar, revisitar, recortar y responder.
- Gestion de memoria textual de dos niveles (arbol de preguntas y nodos de evidencia) a lo largo de multiples turnos.
- Recorte (crop) de regiones de pagina para inspeccion detallada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio adicionales: no disponible en la informacion proporcionada.

## Casos de uso

- Question answering sobre corpus de documentos escaneados: el modelo recorre paginas una a una, registra evidencia con bounding boxes y responde preguntas que requieren agregar informacion de varias paginas, gracias a su memoria de dos niveles.
- Analisis de presentaciones y slides: adecuado para SlideVQA, donde el agente localiza la diapositiva relevante mediante busquedas sucesivas y extrae la respuesta con evidencia visual.
- Revision de documentacion tecnica extensa: el agente puede revisitar paginas ya leidas y recortar regiones concretas (tablas, diagramas) para verificar datos antes de responder.
- Auditoria documental con trazabilidad: al almacenar hechos con bounding boxes, permite justificar cada respuesta con la region exacta de la pagina de origen, util en entornos de compliance.
- Asistencia a analistas que consultan informes financieros o regulatorios: el modelo busca en el corpus, mantiene el arbol de preguntas y sintetiza respuestas multi-pagina.
- Pipeline de extraccion de informacion de PDFs convertidos a imagen: integrable via transformers y text-generation-inference, con el protocolo de agente del repositorio para orquestar las acciones.
- Evaluacion de sistemas RAG visuales: sirve como referencia entrenada para comparar estrategias de memoria y busqueda en benchmarks como MMLongBench-Doc.

## Benchmarks y rendimiento

Resultados publicados en la model card (paginas de hasta 0,7 megapixeles; respuestas evaluadas por DeepSeek-v4-flash):

| Modelo | SlideVQA | ViDoSeek | MMLongBench-Doc |
|---|---|---|---|
| Qwen2.5-VL-7B (SFT + RL) | 79,37 | 74,96 | 34,24 |
| Qwen2.5-VL-3B (SFT + RL) | 74,72 | 71,19 | 29,75 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de la misma categoria ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 8.292 millones de parametros, en precision completa (bf16) se requieren aproximadamente 16,6 GB solo para pesos, mas memoria para vision, KV cache y activaciones.
- GPU recomendadas: A100 o H100 para despliegue en produccion con contexto amplio; RTX 4090 (24 GB) puede alojar los pesos en bf16 pero con margen limitado para vision y cache.
- Cabe en GPU de consumo: si, en GPUs con 24 GB o mas en bf16, o en GPUs con 16 GB mediante cuantizacion (tipos de cuantizacion no disponibles en la informacion).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible); otras opciones como vLLM, llama.cpp u Ollama no estan confirmadas en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SlideVQA | ViDoSeek | MMLongBench-Doc | Licencia |
|---|---|---|---|---|---|---|
| visual-rag-qwen2.5-vl-7b (este) | 8,29 B | no disponible | 79,37 | 74,96 | 34,24 | Apache 2.0 |
| Qwen2.5-VL-3B (SFT + RL, mismo protocolo) | no disponible | no disponible | 74,72 | 71,19 | 29,75 | Apache 2.0 |
| Qwen2.5-VL-7B-Instruct (base) | ~8 B | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

No se dispone de datos de benchmarks del modelo base sin ajuste ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado para un protocolo de agente concreto y un system prompt especifico; usarlo fuera de ese protocolo puede degradar gravemente su comportamiento.
- Las respuestas estan condicionadas a la memoria de dos niveles y al espacio de acciones; no es un modelo generalista de vision-lenguaje sin orquestacion.
- Riesgo de alucinacion en la sintesis de hechos a partir de evidencia visual, especialmente en documentos con baja resolucion (limite de 0,7 megapixeles por pagina).
- Idiomas soportados no documentados; el rendimiento fuera del ingles no esta verificado.
- Sesgos conocidos: no documentados en la informacion disponible.
- Entrenamiento acotado: 2.400 trayectorias de SFT y 75 pasos de GSPO sobre 1.200 preguntas, lo que puede limitar la generalizacion a dominios distintos de los benchmarks.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende del cumplimiento de la licencia del modelo base Qwen2.5-VL-7B-Instruct.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/leozmai/visual-rag-qwen2.5-vl-7b
- Codigo y prompts: https://github.com/ZLF329/visual_rag (`visual_rag_agent_new/`)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
