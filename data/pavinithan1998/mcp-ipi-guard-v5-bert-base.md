# pavinithan1998/mcp-ipi-guard-v5-bert-base

## Resumen

El modelo `pavinithan1998/mcp-ipi-guard-v5-bert-base` es un clasificador de texto basado en la arquitectura BERT, desarrollado por el usuario pavinithan1998 como parte de la familia MCP-Guard. Este modelo se enmarca en el contexto del framework MCP-Guard, una arquitectura de defensa modular diseñada para proteger las interacciones entre grandes modelos de lenguaje (LLM) y herramientas externas a través del Protocolo de Contexto de Modelo (MCP). El nombre "ipi" sugiere una función de integridad de protocolo o de detección de intrusiones en el flujo MCP, aunque la documentación oficial no especifica la tarea exacta.

Con 109.483.778 parámetros, el modelo corresponde al tamaño base de BERT (aproximadamente 110M), lo que lo convierte en una opción ligera y eficiente para tareas de clasificación en tiempo real. Está disponible en formato safetensors y se integra con la librería transformers de HuggingFace, con pipeline de text-classification. La relevancia actual del modelo radica en la creciente adopción de MCP como estándar para conectar LLMs con herramientas y servicios externos, lo que introduce nuevas superficies de ataque que requieren mecanismos de protección como el que este clasificador podría ofrecer.

La model card es genérica y no aporta detalles sobre el entrenamiento, los datos utilizados ni las capacidades específicas. Toda la información técnica adicional proviene de la arquitectura BERT base y del contexto del paper MCP-Guard (arXiv:2508.10991), aunque no se confirma que este modelo concreto sea el mismo descrito en dicho paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (Transformer encoder-only, 12 capas, 768 hidden size, 12 cabezas de atencion) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (estandar de BERT) |
| Tipos de cuantizacion | no disponible (se puede cuantizar con herramientas como bitsandbytes o llama.cpp, pero no hay versiones publicadas) |
| Idiomas soportados | no disponible (probablemente ingles, pero no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tambien config.json y tokenizer) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un transformer encoder-only de 12 capas con 768 unidades ocultas y 12 cabezas de atencion. La capa de clasificacion es una `BertForSequenceClassification`, lo que indica que el modelo fue ajustado (fine-tuning) para una tarea de clasificacion de secuencias, probablemente binaria o multiclase, relacionada con la deteccion de amenazas o anomalias en el contexto del protocolo MCP.

No se dispone de informacion sobre el proceso de entrenamiento: no se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset, ni si se utilizaron tecnicas como RLHF o DPO. Dado que es un modelo BERT base ajustado, es probable que el entrenamiento se realizara sobre un conjunto de datos etiquetados de interacciones MCP, posiblemente incluyendo ejemplos de ataques (prompt injection, exfiltracion de datos, etc.) y respuestas benignas, siguiendo el enfoque del framework MCP-Guard descrito en el paper. Sin embargo, esto es una inferencia razonable y no un dato confirmado.

## Capacidades

- Clasificacion de texto: el modelo esta disenado para tareas de clasificacion de secuencias, probablemente para identificar si una interaccion MCP es legitima o maliciosa.
- Integracion con transformers: se puede cargar con la API estandar de HuggingFace para inferencia y fine-tuning.
- Eficiencia: al ser un modelo BERT base, ofrece un equilibrio entre rendimiento y coste computacional, apto para despliegue en entornos con recursos limitados.
- No se han documentado capacidades adicionales como generacion de texto, tool calling, agentes o soporte multilingue. La tarea especifica (etiquetas de clasificacion) no esta publicada.

## Casos de uso

- Deteccion de prompt injection en interacciones MCP: el modelo puede analizar mensajes enviados por un LLM a herramientas externas y clasificarlos como benignos o maliciosos, ayudando a prevenir ataques de inyeccion de instrucciones.
- Filtrado de comandos en pipelines de agentes: en sistemas donde un agente LLM ejecuta acciones via MCP, el clasificador puede actuar como guardia de seguridad antes de que se ejecute cualquier herramienta, bloqueando comandos sospechosos.
- Auditoria de logs de MCP: procesar registros de conversaciones entre LLMs y herramientas para identificar patrones de uso anomalo o intentos de explotacion.
- Clasificacion de intenciones en asistentes virtuales: si el modelo fue entrenado para detectar intenciones especificas dentro del flujo MCP, podria usarse para enrutar peticiones a diferentes herramientas o servicios.
- Monitorizacion en tiempo real de APIs MCP: desplegado como servicio de clasificacion, puede analizar cada peticion entrante y responder con una puntuacion de riesgo, permitiendo a los sistemas tomar decisiones de bloqueo o alerta.
- Investigacion en seguridad de LLMs: como componente de un framework de defensa, el modelo puede servir para experimentos academicos sobre vulnerabilidades en el protocolo MCP y evaluacion de contramedidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Dado que el modelo es un clasificador especifico de dominio (MCP), las evaluaciones relevantes serian de precision, recall y F1 sobre conjuntos de datos de ataques MCP, pero no se han proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 400-500 MB en precision fp32 (109M parametros × 4 bytes). Con cuantizacion a int8, se reduce a unos 110-150 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tarjetas consumer como GTX 1060, RTX 2060, RTX 3060 o superiores funcionan sin problemas. Incluso es viable en CPU para inferencia por lotes pequenos.
- Compatibilidad con consumer GPU: si, es un modelo muy ligero que cabe en cualquier GPU moderna.
- Opciones de despliegue: se puede servir con la libreria transformers de HuggingFace, con Text Generation Inference (TGI) no es adecuado porque no es generativo; mejor usar endpoints de clasificacion como HuggingFace Inference Endpoints, o bien integrarlo en un pipeline con FastAPI. Tambien es compatible con ONNX Runtime para optimizacion en CPU.
- Latencia y throughput estimados: en una GPU consumer (p.ej., RTX 3060), la inferencia de una secuencia de 512 tokens tarda del orden de 5-15 ms. En CPU moderna, unos 50-200 ms. El throughput depende del tamano de lote, pero con batch de 32 se pueden procesar cientos de peticiones por segundo en GPU.

## Comparativa con modelos similares

No se han identificado modelos directamente comparables en el mismo dominio (clasificacion de seguridad para MCP). Como referencia general de clasificadores BERT base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcp-ipi-guard-v5-bert-base | 109M | 512 | Clasificacion de seguridad MCP | no disponible | HuggingFace |
| bert-base-uncased | 110M | 512 | Clasificacion de texto general | Apache 2.0 | HuggingFace |
| distilbert-base-uncased | 66M | 512 | Clasificacion de texto general | Apache 2.0 | HuggingFace |

La comparacion con bert-base-uncased es pertinente porque el modelo probablemente se basa en el mismo checkpoint preentrenado, pero la licencia y el rendimiento especifico en la tarea MCP no se pueden evaluar sin datos.

## Limitaciones y advertencias

- No hay informacion publica sobre el proceso de entrenamiento, los datos utilizados ni la tarea exacta de clasificacion. Esto impide validar su eficacia y su comportamiento en entornos reales.
- La licencia no esta especificada, lo que genera incertidumbre legal sobre su uso comercial o la redistribucion del modelo.
- Al ser un modelo basado en BERT, su longitud de contexto esta limitada a 512 tokens, lo que puede ser insuficiente para analizar interacciones MCP largas o conversaciones multi-turno extensas.
- Riesgo de sesgos y alucinaciones: aunque es un clasificador, puede presentar falsos positivos o negativos, especialmente si los datos de entrenamiento no cubren adecuadamente la diversidad de ataques MCP.
- No se proporcionan garantias de robustez frente a ataques adversariales especificamente disenados para evadir clasificadores.
- La model card es generica y no ofrece recomendaciones de uso responsable ni limitaciones sociotecnicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pavinithan1998/mcp-ipi-guard-v5-bert-base
- Modelo relacionado (misma familia): https://huggingface.co/pavinithan1998/mcp-ipi-guard-bert-base-uncased
- Paper MCP-Guard (arXiv): https://arxiv.org/abs/2508.10991
- Version HTML del paper: https://arxiv.org/html/2508.10991
- Version PDF del paper: https://arxiv.org/pdf/2508.10991v2
