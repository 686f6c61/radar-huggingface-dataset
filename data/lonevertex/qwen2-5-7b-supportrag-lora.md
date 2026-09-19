# LoneVertex/Qwen2.5-7B-SupportRAG-LoRA

## Resumen

Qwen2.5-7B-SupportRAG-LoRA es un adaptador LoRA (PEFT) publicado por el usuario LoneVertex sobre el modelo base Qwen/Qwen2.5-7B-Instruct, especializado en razonamiento agéntico de atención al cliente con múltiples herramientas. No se trata de un modelo completo, sino de un ajuste fino mediante QLoRA en 4 bits (SFT, rank=16, alpha=32) que debe cargarse sobre los pesos originales de Qwen2.5-7B-Instruct. El entrenamiento declarado es de 507 pasos, aproximadamente 4 horas y 15 minutos sobre una GPU T4 de Google Colab.

El adaptador está diseñado para operar con sintaxis ChatML (`<|im_start|>` / `<|im_end|>`) y expone tres herramientas concretas: `knowledge_base_search(query, brand)`, `check_order_status(order_id)` y `escalate_to_human(reason, brand, urgency)`. Sus tareas primarias declaradas son la recuperación de conocimiento fundamentado, la verificación del estado de pedidos y el escalado a humano conforme a políticas, lo que lo sitúa en el terreno de los asistentes de soporte con RAG y flujos de varios pasos.

Su relevancia es fundamentalmente práctica y de nicho: es un ejemplo de adaptación de bajo coste (hardware consumer, T4 de 16 GB) de un modelo de 7B para un dominio vertical muy concreto. La ficha se presenta como "Milestone 2 - DA3 Aligned" y como el motor de razonamiento del sistema de producción SupportRAG Chatbot. El repositorio no registra descargas ni interacciones en el momento de la consulta, y la model card es notablemente escueta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-7B-Instruct) con adaptador LoRA/QLoRA. No es MoE, SSM ni híbrida |
| Parametros totales | ~7.600 millones en el modelo base (Qwen2.5-7B). El número de parámetros entrenables del adaptador no se especifica (rank=16, alpha=32) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos |
| Longitud de contexto | No especificada en la ficha del adaptador. El modelo base declarado, Qwen/Qwen2.5-7B-Instruct, documenta 32.768 tokens nativos según su documentación oficial, dato no verificado en la información proporcionada |
| Tipos de cuantizacion | Entrenamiento en 4 bits (QLoRA); la ficha no confirma el esquema exacto (NF4 de bitsandbytes no se menciona). El adaptador se distribuye sin cuantizar; la cuantización de inferencia depende del modelo base y del runtime |
| Idiomas soportados | No disponible. La model card no documenta cobertura lingüística del adaptador |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT (librería `peft`). El formato exacto de los ficheros de pesos no se detalla en la información disponible |

Otros datos de la ficha: pipeline `text-generation`, tags `lora`, `peft`, `text-generation`, `customer-support`, `rag`, `agentic`, `qwen`, `region:us`. Creado y actualizado el 19 de septiembre de 2026.

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un transformer decoder-only de ~7.600 millones de parámetros, mediante la técnica QLoRA: el modelo base se carga cuantizado a 4 bits y se entrenan únicamente las matrices de bajo rango de un adaptador LoRA con rank=16 y alpha=32. El entrenamiento es de tipo SFT (supervised fine-tuning) sobre datos no descritos en la model card, durante 507 pasos y unas 4 horas y 15 minutos en una T4 de Google Colab. No se documenta el uso de RLHF, DPO u otras etapas de alineación posteriores al SFT.

La innovación destacable no es arquitectónica sino de formato y de flujo: el modelo se entrena explícitamente para emitir y consumir sintaxis ChatML y para invocar tres herramientas con firmas fijas y bien delimitadas, con parámetros de dominio como `brand`, `order_id`, `reason` y `urgency`. La model card indica que este adaptador constituye el núcleo del motor de razonamiento del sistema SupportRAG Chatbot, entrenado offline. No se especifican detalles sobre el dataset, su composición, la longitud de las secuencias de entrenamiento ni el preprocesado de las trazas de herramientas.

## Capacidades

- Generación de texto conversacional en formato ChatML, con delimitadores `<|im_start|>` y `<|im_end|>`.
- Razonamiento agéntico de varios pasos orientado a atención al cliente: decidir cuándo consultar, cuándo verificar y cuándo escalar.
- Tool calling / function calling con tres herramientas predefinidas: `knowledge_base_search(query, brand)`, `check_order_status(order_id)` y `escalate_to_human(reason, brand, urgency)`.
- Recuperación de conocimiento fundamentada (grounded knowledge retrieval), es decir, responder apoyándose en resultados de búsqueda en base de conocimiento en lugar de conocimiento paramétrico.
- Verificación de estado de pedidos a partir de un identificador (`order_id`).
- Escalado a humano conforme a políticas, con marca (`brand`) y nivel de urgencia (`urgency`) como parámetros.
- Operación multi-marca mediante el parámetro `brand` presente en dos de las herramientas.
- Hereda del modelo base las capacidades generales de generación de texto de Qwen2.5-7B-Instruct, aunque el ajuste está orientado al dominio de soporte y la model card no valida su comportamiento fuera de él.
- No se documentan capacidades de visión, audio, modo de razonamiento explícito (thinking mode) ni cobertura multilingüe específica.

## Casos de uso

- Atención al cliente automatizada de primer nivel: el agente gestiona conversaciones multi-turno, decide si necesita consultar la base de conocimiento y responde con información fundamentada en lugar de improvisar, lo que reduce el riesgo de respuestas inventadas en consultas de producto.
- Seguimiento de pedidos y logística: ante una consulta del tipo "¿dónde está mi pedido #ORD-9821?", el modelo invoca `check_order_status(order_id)` con el identificador extraído del mensaje y devuelve el estado verificado, sin necesidad de lógica de extracción adicional en el orquestador.
- Escalado inteligente a agentes humanos: cuando la consulta queda fuera de política o el cliente muestra insatisfacción, el modelo invoca `escalate_to_human(reason, brand, urgency)` generando un resumen estructurado del motivo, lo que permite enrutar el ticket con contexto en lugar de transferirlo en frío.
- Asistentes multi-marca sobre una misma infraestructura: el parámetro `brand` en las herramientas permite reutilizar un único adaptador para varias marcas, segmentando la base de conocimiento y las políticas por marca sin desplegar un modelo por cliente.
- Integración en pipelines de agentes con orquestación externa: al emitir llamadas a herramientas en formato ChatML, el adaptador encaja en frameworks de agentes que parsean la salida y ejecutan las funciones, devolviendo el resultado como turno de sistema.
- Generación de datos sintéticos de soporte: el adaptador puede producir conversaciones etiquetadas con trazas de herramientas para entrenar o evaluar modelos más pequeños destinados a producción, aprovechando su especialización en el dominio.
- Auditoría y pruebas de política de escalado: permite simular escenarios límite (reclamaciones, urgencias, consultas fuera de catálogo) y comprobar si el criterio de escalado se ajusta a las reglas de negocio definidas.
- Investigación sobre ajuste eficiente: sirve como caso de estudio reproducible de QLoRA con rank=16 sobre una T4, útil para equipos que necesitan evaluar el coste real de adaptar un modelo de 7B a un dominio vertical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara métricas de entrenamiento (507 pasos, ~4 h 15 min en una T4), sin cifras de MMLU, HumanEval, GSM8K ni evaluaciones específicas de tool calling o de fidelidad al contexto (faithfulness). Tampoco se aportan métricas de calidad de las trazas de herramientas.

## Requisitos de hardware

- El entrenamiento se realizó con QLoRA a 4 bits en una GPU T4 de 16 GB (Google Colab), lo que confirma que el ajuste cabe en hardware de gama media.
- Inferencia con el adaptador fusionado en bfloat16: los ~7,6B parámetros ocupan aproximadamente 15,2 GB solo en pesos, más caché KV y activaciones. Estimación orientativa: ~18-20 GB de VRAM para secuencias moderadas. GPU tipo A100 40 GB, H100, L40S o RTX 4090 24 GB.
- Inferencia en 8 bits (bitsandbytes): estimación de ~9-10 GB de VRAM. Cabe en RTX 4080 16 GB, RTX 4060 Ti 16 GB, RTX 3090 24 GB.
- Inferencia en 4 bits (bitsandbytes/NF4): estimación de ~5-7 GB de VRAM. Cabe en GPU consumer como RTX 3060 12 GB, RTX 4060 8 GB (con margen ajustado), RTX 4070 y superiores.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada en la model card), `bitsandbytes` para carga cuantizada, vLLM con soporte de adaptadores LoRA, TGI con adaptadores PEFT, y llama.cpp/Ollama si se fusiona el adaptador y se convierte a GGUF (proceso no documentado en la ficha).
- La model card incluye un ejemplo de inferencia con `torch_dtype=torch.bfloat16`, `device_map="auto"`, `max_new_tokens=256` y `temperature=0.3`, valores coherentes con un uso de soporte de baja variabilidad.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LoneVertex/Qwen2.5-7B-SupportRAG-LoRA | ~7,6B (base) + adaptador LoRA de tamano no especificado | No especificado para el adaptador; 32.768 tokens nativos en el modelo base | Apache 2.0 | Adaptador PEFT | Publicado en HuggingFace; 0 descargas, 0 likes en el momento de la consulta |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | ~7,6B | 32.768 tokens nativos según documentación oficial del modelo base | Apache 2.0 | Safetensors (formato estándar del modelo base) | Ampliamente distribuido en HuggingFace |
| Otros adaptadores LoRA para soporte al cliente | No disponible | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no devolvió información técnica sobre alternativas comparables; los únicos resultados fueron portales de anuncios clasificados (Bazos.cz y Bazos.sk) sin relación alguna con el modelo. No es posible, por tanto, establecer una comparativa rigurosa de rendimiento con otros adaptadores del mismo nicho con la información disponible.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar Qwen/Qwen2.5-7B-Instruct, con el coste de almacenamiento y VRAM asociado a un modelo de 7,6B.
- No se documenta la composición del dataset de entrenamiento: se desconoce si contiene datos sintéticos, reales o una mezcla, lo que dificulta evaluar sesgos y cobertura.
- Riesgo de alucinación heredado del modelo base y potencialmente reforzado por el ajuste: el adaptador está entrenado para invocar herramientas, pero no se publican métricas de fidelidad al contexto ni de invocación correcta de funciones.
- Riesgo de invocación incorrecta o prematura de `escalate_to_human`, con el consiguiente coste operativo si deriva tickets que podrían resolverse automáticamente, o del caso contrario (no escalar cuando la política lo exige).
- No hay datos de cobertura multilingüe del adaptador. La sintaxis ChatML y los nombres de herramientas están en inglés, y el prompt de ejemplo también; el comportamiento en castellano u otros idiomas no está verificado.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-7B-Instruct y de los datasets de entrenamiento no declarados antes de un despliegue en producción.
- Sin validación externa: 0 descargas y 0 likes, sin evaluaciones de terceros, sin benchmarks publicados y sin versionado de revisiones más allá de "Milestone 2 - DA3 Aligned". No es un artefacto con garantías para producción crítica.
- Las herramientas están codificadas a fuego en el ajuste (tres firmas concretas); cualquier cambio de esquema, nombre de parámetro o herramienta adicional requerirá reentrenar o al menos reevaluar el adaptador.
- No se especifica la longitud máxima de secuencia usada en el entrenamiento, por lo que se desconoce si el adaptador mantiene su comportamiento con contextos largos cerca del límite del modelo base.
- Las fechas de creación y actualización del repositorio (19 de septiembre de 2026) son posteriores a la fecha de la mayoría de referencias disponibles; conviene comprobar si el repositorio sigue activo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LoneVertex/Qwen2.5-7B-SupportRAG-LoRA
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Resultados de la búsqueda web: no se encontró ningún enlace relevante. Los resultados devueltos corresponden a portales de anuncios clasificados (https://www.bazos.cz/, https://auto.bazos.cz/, https://www.bazos.sk/, https://dum.bazos.cz/, https://zvirata.bazos.cz/) sin relación con el modelo. No se han localizado papers, blogs, repositorios ni demos asociados a este adaptador.
