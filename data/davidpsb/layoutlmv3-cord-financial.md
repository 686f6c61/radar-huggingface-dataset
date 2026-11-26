# davidpsb/layoutlmv3-cord-financial

## Resumen

LayoutLMv3-cord-financial es un modelo de clasificación de tokens (token classification) basado en la arquitectura LayoutLMv3, publicado por el usuario davidpsb en Hugging Face. El nombre del repositorio sugiere un ajuste fino sobre el conjunto de datos CORD (Consolidated Receipt Dataset), orientado a la extracción de información estructurada de recibos y documentos financieros. El modelo cuenta con 125.941.407 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,5 GB.

La relevancia de este modelo radica en su aplicación práctica al campo del procesamiento inteligente de documentos (IDP), donde la combinación de información textual, de layout y visual resulta clave para tareas de extracción de entidades en documentos comerciales. LayoutLMv3 es una arquitectura consolidada en este ámbito, y este ajuste concreto apunta a un caso de uso específico del dominio financiero.

No obstante, la model card publicada es una plantilla automática sin contenido sustantivo: no se documentan datos de entrenamiento, hiperparámetros, resultados de evaluación, licencia ni idiomas soportados. Toda la información técnica disponible proviene de los metadatos del repositorio y de las características conocidas de la arquitectura base LayoutLMv3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LayoutLMv3 (transformer multimodal texto-layout-imagen) |
| Parametros totales | 125.941.407 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura base LayoutLMv3 admite 512 tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en LayoutLMv3, un transformer multimodal que combina embeddings de texto, de posición espacial (coordenadas de bounding boxes) y de parches de imagen, unificando las modalidades textual y visual sin necesidad de un detector de objetos externo. La arquitectura emplea atención multimodal y objetivos de entrenamiento que incluyen masked language modeling, masked image modeling y word-patch alignment. El modelo base LayoutLMv3 se preentrena sobre documentos escaneados e imágenes de documentos.

En cuanto al ajuste fino específico de este repositorio, no se dispone de información: la model card no documenta el conjunto de datos de entrenamiento, el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no habituales en modelos de token classification). El nombre del repositorio apunta a un ajuste sobre el dataset CORD, un conjunto de recibos de compra indonesios con anotaciones de campos como nombre del comercio, fecha, total, ítems y subtotal, pero esta correspondencia no está confirmada en la documentación disponible.

## Capacidades

- Clasificación de tokens (token classification) sobre documentos con información de layout, orientada a la extracción de entidades.
- Procesamiento conjunto de texto, coordenadas espaciales e imagen del documento, gracias a la naturaleza multimodal de LayoutLMv3.
- Extracción de campos estructurados de recibos y documentos financieros (presumiblemente: comercio, fecha, total, ítems, subtotal), según el dominio sugerido por el nombre del repositorio.
- Integración con la librería transformers mediante el pipeline de token-classification.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión de documento integrada en la arquitectura; el resto no disponible.

## Casos de uso

- Extracción de datos de recibos y facturas: el modelo clasifica tokens sobre documentos escaneados combinando texto, layout e imagen, lo que permite identificar campos como comercio, fecha, total o ítems en flujos de digitalización contable.
- Automatización de la contabilidad de gastos: integrado en un pipeline de ingesta documental, puede extraer los campos clave de cada recibo para alimentar sistemas de gestión de gastos y reembolsos.
- Procesamiento inteligente de documentos (IDP) en banca y seguros: sirve como componente de extracción de entidades en documentos financieros estructurados semiestructurados.
- Digitalización de archivos históricos de recibos: permite convertir lotes de recibos escaneados en registros estructurados para su análisis posterior.
- Validación y conciliación de transacciones: los campos extraídos pueden cruzarse con registros de compras para detectar discrepancias en importes o fechas.
- Prototipado e investigación en extracción de información documental: al ser un ajuste pequeño (126 M de parámetros) y ligero (0,5 GB), es adecuado para experimentación académica y pruebas de concepto en entornos con recursos limitados.
- Preprocesamiento para sistemas RAG sobre documentos financieros: la extracción de entidades estructuradas puede enriquecer los metadatos antes de la indexación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,5 GB de pesos; en fp16, alrededor de 0,25 GB. Con overhead de activaciones y procesamiento de imagen, se recomienda al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers con pipeline de token-classification, TorchServe, FastAPI con transformers, ONNX Runtime. No se dispone de confirmación de soporte en vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidpsb/layoutlmv3-cord-financial | 125,9 M | no disponible (base: 512 tokens) | Token classification en recibos | no disponible | Hugging Face |
| microsoft/layoutlmv3-base | ~125 M | 512 tokens | Documento multimodal (preentrenamiento) | CC BY-NC-SA 4.0 (según modelo base) | Hugging Face |
| impira/layoutlm-document-qa | ~125 M | 512 tokens | Question answering sobre documentos | no disponible | Hugging Face |
| bert-base-uncased | ~110 M | 512 tokens | Clasificación de texto (sin layout) | Apache 2.0 | Hugging Face |

La comparativa se basa en características conocidas de las arquitecturas; no se dispone de datos de rendimiento comparativo para este ajuste concreto.

## Limitaciones y advertencias

- La model card es una plantilla automática sin información sustantiva: no hay documentación sobre datos de entrenamiento, evaluación ni uso previsto.
- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de desplegar en producción.
- Idiomas soportados no documentados: el dataset CORD es de recibos indonesios, por lo que el modelo podría tener un rendimiento limitado fuera de ese dominio lingüístico y geográfico.
- Riesgo de alucinación y errores de extracción: como todo modelo de clasificación de tokens, puede asignar etiquetas incorrectas en documentos con layouts atípicos, baja calidad de escaneo o campos ausentes.
- Sesgos potenciales derivados del dataset de ajuste (formato de recibos, comercios y monedas específicas), no documentados.
- Longitud de contexto limitada por la arquitectura base (512 tokens), lo que restringe su uso a documentos de una sola página o fragmentos.
- Sin métricas de evaluación publicadas: no es posible estimar su precisión real en producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidpsb/layoutlmv3-cord-financial
- Paper de LayoutLMv3: https://arxiv.org/abs/2204.08387
- Paper de LayoutLM (referenciado en tags, arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Repositorio oficial de LayoutLMv3 (Microsoft): https://github.com/microsoft/unilm/tree/master/layoutlmv3
- Dataset CORD en Hugging Face: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Documentación de transformers para token classification: https://huggingface.co/docs/transformers/tasks/token_classification
