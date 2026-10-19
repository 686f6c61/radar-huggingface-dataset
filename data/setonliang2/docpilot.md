# SetonLiang2/DocPilot

## Resumen

DocPilot-4B es un modelo multimodal de tipo imagen-texto-a-texto (image-text-to-text) de 4.000 millones de parámetros, publicado por el autor SetonLiang2 y vinculado al grupo HKUSTDial, orientado a la comprensión de documentos visuales largos mediante un esquema de "action-tags". El modelo no se presenta como un VLM genérico, sino como el componente de decisión de un agente que interactúa con documentos extensos (paginas escaneadas, PDFs, informes) y emite etiquetas de acción que orquestan herramientas y pasos posteriores.

La propuesta encaja en la familia de modelos que combinan percepción visual con razonamiento multi-paso sobre documentos: en lugar de responder directamente a una pregunta sobre un documento de decenas de paginas, el modelo aprende a decidir qué acción ejecutar (navegar, recortar, consultar una herramienta externa), lo que reduce el coste de meter todo el documento en el contexto. El autor lo describe explícitamente como "action-tag model for long visual document understanding".

Es relevante ahora porque el despliegue está pensado para producción: la model card documenta el uso con Transformers y con vLLM, incluyendo un protocolo propio (`vllm_tags`) para conectar el modelo a un servidor OpenAI-compatible. La licencia Apache 2.0 facilita su adopción comercial. Como contrapartida, la informacion publicada es muy escasa: no hay resultados de benchmarks, no se detalla la arquitectura interna ni el volumen o composición de los datos de entrenamiento, y el repositorio tiene 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Modelo multimodal image-text-to-text integrado en Transformers mediante `AutoModelForImageTextToText`; el autor no detalla el backbone ni el conector visión-lenguaje |
| Parametros totales | 4B (según la denominación DocPilot-4B; no se publica el desglose entre encoder visual y modelo de lenguaje) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. El autor solo indica soporte para "long visual document understanding" sin cifra de tokens |
| Tipos de cuantizacion | No disponible. El autor recomienda `bfloat16` en vLLM; no se publican pesos cuantizados (GPTQ, AWQ, GGUF) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`), servible con vLLM |
| Pipeline | `image-text-to-text` |
| Tamaño del repositorio | 9,1 GB (incluye la subcarpeta `DocPilot-4B`) |
| Fecha de publicación | 2026-10-18 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna. La model card únicamente indica que se trata de un modelo de 4B parámetros para comprensión de documentos visuales largos, que se carga con `AutoModelForImageTextToText` y `AutoProcessor`, y que los pesos residen en la subcarpeta `DocPilot-4B`. Esto implica, como mínimo, un encoder visual, un proyector multimodal y un modelo de lenguaje, pero no se especifica la familia del backbone, la resolución de imagen soportada, el mecanismo de atención ni si emplea atención lineal o alguna variante eficiente para secuencias largas.

El rasgo diferencial declarado es el formato de "action-tags": el modelo está entrenado para emitir etiquetas de acción en lugar de (o además de) texto libre, lo que lo sitúa como política de un agente interactivo. El título del paper asociado, "DocPilot: Interactive Agent Orchestration and Training for Long Visual Document Understanding", confirma ese enfoque de orquestación de agente y entrenamiento específico para documentos largos. No se publican datos sobre número de tokens de entrenamiento, composición del dataset, ni si se aplicaron RLHF, DPO u otras etapas de alineamiento. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención dispersa, compresión de contexto) más allá del propio esquema de acciones.

## Capacidades

- Comprensión de documentos visuales: procesa imágenes de páginas y responde en modalidad texto (pipeline `image-text-to-text`).
- Documentos largos: el modelo está diseñado explícitamente para escenarios de "long visual document understanding", según la model card.
- Generación de action-tags: emite etiquetas de acción estructuradas que permiten a un agente decidir el siguiente paso sobre el documento.
- Orquestación de agentes: pensado para integrarse en un bucle de agente con herramientas externas, según el título y el enfoque del paper.
- Integración con vLLM: soporta despliegue mediante `vllm serve` con el protocolo `vllm_tags` sobre una API compatible con OpenAI.
- Multilingüismo: limitado a inglés según el campo `language` de la model card.
- Tool calling / function calling genérico: no documentado. El mecanismo de acciones es específico del modelo (`vllm_tags`), no se describe como function calling estándar.
- Modo "thinking" o razonamiento explícito: no disponible en la informacion publicada.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Procesamiento de facturas y albaranes: el modelo recibe la imagen de cada página y emite acciones para localizar campos (NIF, base imponible, IVA), lo que permite encadenar recortes y consultas en lugar de cargar el PDF completo en contexto.
- Revisión de contratos de decenas de páginas: un agente puede usar DocPilot para decidir qué páginas o cláusulas inspeccionar antes de responder, reduciendo el número de tokens de imagen enviados al modelo de lenguaje.
- Extracción de tablas en informes anuales: el esquema de acciones facilita segmentar la página, aislar la tabla y delegar el OCR o la transcripción a una herramienta especializada.
- Automatización de archivos administrativos: clasificación y enrutado de expedientes escaneados según la acción detectada (archivar, solicitar documento adicional, escalar a revisión humana).
- Preguntas y respuestas sobre documentación técnica escaneada: el modelo actúa como planificador que decide en qué página buscar y cuándo invocar un recuperador textual.
- Pipelines RAG documental: uso como router visual que determina si una consulta requiere inspección de imagen, búsqueda en texto extraído o ambas, antes de llamar al modelo generador final.
- Despliegue en servicios OpenAI-compatible: al exponerse con vLLM y `vllm_tags`, puede conectarse a infraestructura existente que ya hable el protocolo de la API de OpenAI sin reescribir el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluación (MMLU, DocVQA, ChartQA, TextVQA u otras) ni comparaciones con modelos de referencia, y la búsqueda web realizada no devolvió ninguna fuente técnica relacionada con el modelo.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 8 GB solo para los pesos (4B × 2 bytes), más el encoder visual, el proyector y las activaciones; en la práctica se debe reservar del orden de 11-14 GB. Es una estimación por conteo de parámetros, no un dato publicado por el autor.
- VRAM estimada en cuantización de 4 bits: alrededor de 3-4 GB de pesos y 6-8 GB con overhead de ejecución. No hay pesos cuantizados oficiales publicados, por lo que requeriría cuantizar el modelo el propio usuario.
- GPU recomendadas: para bfloat16, A100 40/80 GB, H100 o L40S si se necesita concurrencia alta; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para una instancia en bf16.
- GPU de consumo: cabe en RTX 4090, RTX 4080 (16 GB) y RTX 3090 con bfloat16 para lote pequeño. En tarjetas de 8 GB solo sería viable con cuantización, no documentada por el autor.
- Opciones de despliegue: vLLM es la vía recomendada en la model card (`vllm serve ./DocPilot/DocPilot-4B --dtype bfloat16`), con protocolo `vllm_tags` en el cliente. También es posible la carga directa con Transformers. No se documenta soporte de llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. Dependerán del número de páginas procesadas por consulta y del bucle de acciones, que no está cuantificado en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DocPilot-4B | 4B | No disponible | Apache 2.0 | HuggingFace, vLLM | Enfoque de action-tags para documentos largos; sin benchmarks publicados |
| Qwen2.5-VL-3B | 3B (aprox.) | No verificado en la informacion disponible | Apache 2.0 | HuggingFace, vLLM, amplio ecosistema | VLM generalista con soporte de grounding y documentos |
| InternVL2.5-4B | 4B (aprox.) | No verificado en la informacion disponible | No verificada en la informacion disponible | HuggingFace | VLM generalista orientado a documentos y OCR |
| SmolVLM-2B | 2B (aprox.) | No verificado en la informacion disponible | No verificada en la informacion disponible | HuggingFace | VLM pequeño para despliegue en hardware limitado |

La comparación real de rendimiento no es posible: DocPilot-4B no publica métricas y no se han encontrado evaluaciones independientes. La diferencia funcional declarada frente a estos modelos es el esquema de action-tags y la orquestación de agente, no un mayor rendimiento en tareas VLM estándar.

## Limitaciones y advertencias

- Idiomas: solo inglés según el campo `language`; no hay evidencia de soporte de castellano ni de otros idiomas.
- Ausencia total de benchmarks: no se puede verificar la calidad en DocVQA, ChartQA, OCR o tareas de agente frente a alternativas establecidas.
- Arquitectura no documentada: se desconoce el backbone, la resolución de imagen soportada y el límite real de contexto, lo que dificulta el dimensionamiento en producción.
- Formato de action-tags no especificado: la model card no define el vocabulario de acciones, el esquema de prompt ni el parser esperado, más allá de la referencia al protocolo `vllm_tags`.
- Riesgo de alucinación: al ser un modelo de 4B que emite decisiones sobre documentos, puede seleccionar acciones incorrectas o inventar referencias a páginas; no se documentan mecanismos de calibración o abstención.
- Validación comunitaria nula: 0 descargas y 1 like en el momento de la consulta; no hay informes de terceros sobre su comportamiento.
- Procedencia y fecha: el paper asociado tiene identificador arXiv 2610.21327 y el repositorio fue creado en octubre de 2026; la búsqueda web realizada no devolvió ninguna fuente técnica sobre el modelo, solo resultados sin relación, por lo que no se pudo contrastar la información de forma independiente.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero exige conservar el aviso de copyright y el archivo de licencia, y no incluye garantías.
- Dependencia de vLLM: el flujo documentado asume vLLM y un protocolo propio; no se garantiza compatibilidad con otros servidores de inferencia sin trabajo adicional.

## Enlaces

- HuggingFace: https://huggingface.co/SetonLiang2/DocPilot
- Paper: https://arxiv.org/abs/2610.21327
- Código: https://github.com/HKUSTDial/DocPilot
- Búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardaban relación con el modelo.
