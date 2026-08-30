# Godel-Labs-Ai/godel-unimodel-v0.1-083026

## Resumen

Godel Unimodel v0.1 es un modelo de clasificación de texto especializado en seguridad de agentes de IA, desarrollado por Godel-Labs-Ai. Se presenta como un candidato de producción para el sistema de enrutado "Gate routing-v2" de la compañía, que combina múltiples cabezas de clasificación (seguridad, binario, evidence, topic, embeddings) en un único grafo ONNX fusionado basado en la arquitectura ModernBERT. Su propósito principal es la detección de prompt injection y la clasificación de documentos y temas en tiempo de ejecución.

El modelo está diseñado para integrarse en pipelines de seguridad de agentes, ofreciendo salidas múltiples que incluyen detección de inyección de prompts, clasificación binaria, embeddings de frases y documentos, y etiquetas de tema. Se distribuye como un bundle de producción con hashes SHA-256 inmutables para verificación de integridad, lo que sugiere un enfoque orientado a entornos donde la trazabilidad y la auditoría son críticas. La licencia Apache-2.0 permite uso comercial y modificación.

La relevancia actual radica en la creciente necesidad de proteger agentes de IA contra ataques de prompt injection, especialmente en entornos empresariales con MCP (Model Context Protocol) y flujos de automatización. El modelo se publica en formato ONNX, lo que facilita su despliegue en múltiples plataformas de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (grafo ONNX fusionado con múltiples cabezas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX, posiblemente FP32/FP16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model.onnx + model.onnx.data) |

## Arquitectura y entrenamiento

El modelo es un grafo ONNX fusionado que integra una única red ModernBERT con múltiples cabezas de salida: seguridad, clasificación binaria, evidence (reparada v2.1), cross-entropy, hidden-state, sentence-embedding, document-embedding, topic y topic-applicability. Según la model card, el grafo incluye además un router LightGBM agrupado, un promotor de transición y un archivo de democión de cuatro etiquetas, así como políticas de clasificación directa de documentos y calibración de temas. La arquitectura está diseñada para preservar el caso ordinario de entrada, mientras que una normalización específica (`ggate-normalize`) se aplica para desofuscar patrones de mayúsculas/minúsculas alternadas típicos de ataques de prompt injection.

No se proporcionan detalles sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF o DPO, ni innovaciones técnicas específicas más allá de la fusión de cabezas y el router LightGBM. El modelo se distribuye con un manifiesto de producción y un informe de composición que verifica que solo cuatro inicializadores de Evidence cambiaron respecto a la versión anterior, garantizando la integridad de las demás cabezas.

## Capacidades

- Detección de prompt injection: identifica intentos de manipulación de instrucciones, incluyendo patrones de mayúsculas/minúsculas alternadas como `IgNoRe PrEvIoUs InStRuCtIoNs`.
- Clasificación binaria: salida binaria para decisiones de seguridad (permitir/bloquear).
- Clasificación de evidence: salida de evidencia reparada (v2.1) para auditoría y trazabilidad.
- Embeddings de frases y documentos: genera representaciones vectoriales para búsqueda semántica o recuperación.
- Clasificación de temas: etiquetas de tema y aplicabilidad de tema para enrutado de contenido.
- Salida de hidden-state: acceso a estados ocultos para análisis o integración con otros sistemas.
- Enrutado con LightGBM: router agrupado para decidir la política de activación.
- Compatibilidad con ONNX Runtime: inferencia eficiente en CPU/GPU con el ecosistema ONNX.

## Casos de uso

- Protección de agentes MCP: el modelo puede integrarse en un proxy de seguridad para inspeccionar cada mensaje entrante y saliente en flujos de Model Context Protocol, bloqueando intentos de prompt injection antes de que lleguen al modelo de lenguaje subyacente.
- Filtrado de entradas en chatbots empresariales: despliegue como middleware de clasificación para detectar y neutralizar instrucciones maliciosas en conversaciones multi-turno, reduciendo el riesgo de fuga de datos o acciones no autorizadas.
- Auditoría de logs de interacción: uso de la salida de evidence y los hashes inmutables para generar registros verificables de cada decisión de seguridad, útil en entornos regulados o con requisitos de cumplimiento.
- Clasificación y enrutado de documentos: aprovechando las cabezas de topic y document-embedding, el modelo puede categorizar documentos entrantes y dirigirlos a los flujos de procesamiento adecuados dentro de un sistema de gestión documental.
- Generación de embeddings para búsqueda semántica: las salidas de sentence-embedding y document-embedding permiten construir índices vectoriales para recuperación de información en corpus corporativos, con la ventaja de que el mismo modelo también clasifica la seguridad del contenido.
- Monitorización de seguridad en pipelines de CI/CD: integración en etapas de validación de prompts o plantillas de agentes, detectando vulnerabilidades de inyección antes de su despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos de detección de prompt injection.

## Requisitos de hardware

- Tamaño del repo: 1.2 GB, lo que sugiere un modelo de tamaño medio (probablemente entre 100M y 500M de parámetros, aunque no se confirma).
- VRAM estimada: para inferencia con ONNX Runtime, un modelo de ~1.2 GB en FP32 requeriría aproximadamente 2-3 GB de VRAM; en FP16 podría reducirse a ~1.5 GB. En CPU, la memoria RAM necesaria sería similar.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) puede ejecutar el modelo; para baja latencia se recomienda una RTX 3060 o superior.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio y alto.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), puede servirse con FastAPI o Triton Inference Server; también es compatible con herramientas que aceptan ONNX como Hugging Face Optimum.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño de lote. En una GPU moderna, se espera una latencia de milisegundos para clasificación de textos cortos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para detección de prompt injection con arquitectura ModernBERT y múltiples cabezas. Alternativas genéricas en el espacio de clasificación de seguridad incluyen modelos como `deberta-v3-base` fine-tuneado para detección de inyección, o `roberta-base` con cabezas de clasificación, pero no hay datos públicos de comparación con este modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o comportamientos indeseados; al ser un modelo de seguridad, podría presentar falsos positivos o negativos en la detección de inyección, lo que requiere validación en el dominio de uso.
- La model card indica que la cabeza de Evidence base no es compatible con esta versión; cualquier integración con sistemas que usen la versión anterior debe actualizarse.
- No se especifican los idiomas soportados; es probable que el modelo esté entrenado principalmente en inglés, dado el contexto de la empresa, pero no se confirma.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como un bundle de producción con hashes inmutables; cualquier modificación del grafo invalidará la verificación de integridad.
- No hay información sobre la longitud máxima de contexto; los modelos ModernBERT suelen soportar hasta 8192 tokens, pero no se garantiza.
- El modelo está diseñado para un caso de uso específico (seguridad de agentes) y no es un modelo de lenguaje generativo; no debe usarse para tareas de generación de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Godel-Labs-Ai/godel-unimodel-v0.1-083026
- Web de Godel Labs: https://godel-labs.ai/
- (No se encontraron papers, repositorios de código ni demos adicionales en la búsqueda web.)
