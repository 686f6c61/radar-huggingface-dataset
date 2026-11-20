# christianengel/mcp-toolrank-33m

## Resumen

MCP ToolRank 33M es un modelo de embeddings de frases especializado en la recuperación de herramientas (*tool retrieval*) para servidores MCP (Model Context Protocol) y APIs descritas en inglés. Lo desarrolla el usuario de Hugging Face christianengel y parte del checkpoint BAAI/bge-small-en-v1.5, sobre el que se ha realizado un ajuste fino orientado a una tarea concreta: dado un enunciado de petición en lenguaje natural, clasificar y ordenar descripciones de herramientas con el formato `name: description`. El modelo resuelve el problema de seleccionar la herramienta correcta entre catálogos grandes antes de que un agente LLM ejecute una llamada, reduciendo el número de herramientas que se inyectan en el contexto.

Arquitectura transformer tipo BERT de 33,36 millones de parámetros, salida de embeddings de 384 dimensiones y una longitud máxima de 512 tokens. Su tamaño reducido permite inferencia en CPU con latencias de milisegundos, lo que lo hace adecuado como componente de enrutamiento previo a un modelo generativo mayor. La licencia Apache 2.0 y la disponibilidad de exportaciones ONNX (FP32 e INT8) facilitan su integración en producción sin dependencia de GPU.

Es relevante ahora porque el ecosistema MCP ha multiplicado el número de herramientas expuestas a los agentes, y la selección eficiente de herramientas se ha convertido en un cuello de botella tanto de coste (tokens de contexto) como de precisión. Un modelo específico de 33M parámetros ofrece una alternativa ligera a reutilizar un modelo de embeddings genérico como BGE para esta tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (derivado de BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.360.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | ONNX FP32 y ONNX INT8 (exportacion incluida en el repo) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (SentenceTransformers), ONNX (FP32 e INT8) |
| Dimension de embeddings | 384 |
| Tamano del repositorio | 0,3 GB |
| Pipeline | sentence-similarity |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de BAAI/bge-small-en-v1.5, un transformer encoder de tipo BERT con 33,36M de parámetros que produce embeddings normalizados de 384 dimensiones. La model card no detalla cambios estructurales respecto al checkpoint base; el ajuste se orienta a la tarea de similitud entre una consulta (petición de usuario) y un documento (herramienta formateada como `name: description`). El modelo expone las funciones `encode_query` y `encode_document` propias de SentenceTransformers, lo que permite codificar consultas y catálogos por separado.

El entrenamiento se realizó sobre 5.098 peticiones de Toucan con 263 descripciones de herramientas vinculadas a fuentes MIT fijadas (*pinned*). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación destacable no es arquitectónica sino operativa: la inclusión de una exportación ONNX INT8 calibrada para CPU, con un grafo de 34,1 MB frente a los 133,1 MB del FP32, y con una guía de calibración del umbral de rechazo por grafo y catálogo.

## Capacidades

- Generación de embeddings de similitud entre consultas en lenguaje natural y descripciones de herramientas MCP/API en formato `name: description`.
- Recuperación y ranking de herramientas (*tool retrieval*) para enrutamiento previo a la llamada de un agente.
- Codificación separada de consultas (`encode_query`) y documentos (`encode_document`), con normalización de embeddings para usar producto escalar como similitud.
- Capacidad de rechazo (*rejection*): el modelo permite calibrar un umbral para descartar peticiones sin herramienta adecuada; en la evaluación compacta de ETOM aceptó 30 de 91 peticiones infeasibles con el umbral configurado.
- Inferencia en CPU con latencias de milisegundos gracias a la exportación ONNX INT8.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo *thinking*; es exclusivamente un encoder de embeddings.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- **Enrutamiento de herramientas en agentes MCP**: antes de construir el prompt del LLM, el agente codifica la petición del usuario y la compara contra los embeddings precalculados de todas las herramientas del servidor MCP, seleccionando las top-k. Con 512 tokens de contexto por documento y 384 dimensiones, el catálogo completo puede indexarse en memoria y consultarse en pocos milisegundos en CPU.
- **Reducción de coste de contexto**: en lugar de inyectar decenas de definiciones de herramientas en cada llamada al LLM, se inyectan solo las 3-5 recuperadas por el modelo, reduciendo tokens de entrada y mejorando la precisión de selección.
- **Puerta de rechazo de peticiones no cubiertas**: usando el umbral calibrado, el sistema puede detectar peticiones que ninguna herramienta del catálogo puede resolver y devolver un mensaje de error controlado antes de invocar al LLM, evitando alucinaciones de herramientas inexistentes.
- **Indexación de catálogos de APIs REST**: el modelo no está limitado a MCP; cualquier API descrita en formato `name: description` puede indexarse, lo que permite construir un buscador semántico de endpoints para documentación o para asistentes de desarrollo.
- **Despliegue en entornos sin GPU**: gracias al ONNX INT8 de 34,1 MB y a las latencias medidas (3,53 ms p50 para consultas cortas y 41,06 ms p50 para consultas largas en un Ryzen 9 5950X con cuatro hilos), puede ejecutarse en servidores de CPU, contenedores pequeños o incluso en el borde (*edge*).
- **Filtrado previo en pipelines de CI/CD de agentes**: en sistemas que validan qué herramientas expone un servidor MCP, el modelo puede usarse para comprobar que las descripciones de herramientas son discriminativas y recuperables para consultas representativas.
- **Evaluación de calidad de descripciones de herramientas**: midiendo la nDCG@10 de recuperación sobre un conjunto de consultas de prueba, los equipos pueden iterar sobre las descripciones de sus herramientas MCP para mejorar su recuperabilidad.

## Benchmarks y rendimiento

Datos publicados en la model card:

| Metrica | FP32 ONNX | INT8 ONNX |
|---|---:|---:|
| Tamano del grafo | 133,1 MB | 34,1 MB |
| Consulta corta, CPU p50 | 6,11 ms | 3,53 ms |
| Consulta larga, CPU p50 | 62,29 ms | 41,06 ms |
| ETOM compact nDCG@10 | 90,13% | 89,83% |
| Fresh API holdout nDCG@10 | 92,15% | 90,43% |
| Fresh API holdout Hit@1 | 59 / 72 | 56 / 72 |

Comparativas reportadas en la model card (checkpoint original):

| Modelo | ETOM compact nDCG@10 | ToolRet |
|---|---:|---:|
| MCP ToolRank 33M | 90,13% | 28,54% |
| BGE (base) | 88,95% | 28,81% |
| ToolScout | 81,42% | no disponible |

Las latencias se midieron con tokenización incluida en un Ryzen 9 5950X con cuatro hilos. El *holdout* de Fresh API cubre 96 peticiones de seis proveedores, incluidas 24 sin herramienta coincidente. La mejora sobre BGE en ETOM compact se reprodujo en tres semillas; en ToolRet el modelo queda ligeramente por debajo de BGE (28,54% frente a 28,81%).

## Requisitos de hardware

- **VRAM**: no requiere GPU; el checkpoint FP32 ocupa aproximadamente 133 MB y el ONNX INT8 unos 34 MB, por lo que cabe en cualquier GPU consumer con holgura.
- **GPU recomendadas**: no son necesarias. En caso de usar GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100).
- **CPU**: es el entorno objetivo. Las latencias p50 reportadas (3,53 ms consulta corta, 41,06 ms consulta larga en INT8) se obtuvieron en un Ryzen 9 5950X con cuatro hilos.
- **Opciones de despliegue**: SentenceTransformers (Python), ONNX Runtime con el grafo `onnx/embedding-int8.onnx`, y Text Embeddings Inference (el modelo está etiquetado como `text-embeddings-inference` y `endpoints_compatible`).
- **Throughput**: no disponible en la información proporcionada; solo se publican latencias p50 por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | ETOM compact nDCG@10 | ToolRet | Licencia |
|---|---:|---:|---:|---:|---:|---|
| MCP ToolRank 33M | 33,36M | 512 | 384 | 90,13% | 28,54% | Apache 2.0 |
| BAAI/bge-small-en-v1.5 | 33,36M | 512 | 384 | 88,95% | 28,81% | MIT |
| ToolScout | no disponible | no disponible | no disponible | 81,42% | no disponible | no disponible |

El modelo mejora a su base BGE en la tarea específica de recuperación de herramientas (ETOM compact) pero no en ToolRet, donde queda ligeramente por debajo. La ventaja principal frente a BGE es la especialización en el formato `name: description` y la exportación INT8 lista para CPU.

## Limitaciones y advertencias

- **Solo inglés**: el modelo está entrenado y evaluado únicamente en inglés; su uso con consultas en castellano u otros idiomas no está validado y probablemente degrade la recuperación.
- **Contexto de 512 tokens**: las descripciones de herramientas y las consultas deben caber en 512 tokens; catálogos con descripciones largas requieren truncado o resumen previo.
- **Rendimiento desigual entre benchmarks**: la mejora sobre BGE se confirma en ETOM compact pero no en ToolRet, donde el modelo queda por debajo (28,54% frente a 28,81%). No debe asumirse una superioridad universal.
- **Calibración del umbral de rechazo obligatoria**: la model card advierte explícitamente que el umbral debe calibrarse por grafo y por catálogo; un umbral mal ajustado producirá falsos rechazos o aceptará peticiones sin herramienta válida.
- **Dataset de entrenamiento pequeño**: 5.098 peticiones y 263 descripciones de herramientas es un conjunto reducido, lo que limita la generalización a dominios muy distintos de los cubiertos.
- **Riesgo de alucinación indirecta**: el modelo no genera texto, pero un umbral de rechazo mal calibrado puede hacer que el agente invoque herramientas inexistentes o inadecuadas.
- **Licencia Apache 2.0**: permite uso comercial, pero deben respetarse los avisos de terceros incluidos en `THIRD_PARTY/manifest.json` del repositorio.
- **Madurez**: el modelo tiene 0 descargas y 1 like en el momento de la consulta, con creación y actualización el mismo día (2026-11-20); no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christianengel/mcp-toolrank-33m
- Repositorio del proyecto: https://github.com/protortyp/mcp-toolrank
- Instrucciones y evaluación de ONNX INT8: https://github.com/protortyp/mcp-toolrank/blob/main/docs/ONNX_INT8.md
- Revisión del modelo original: review/docs/RELEASE_REVIEW.md (ruta relativa dentro del repositorio)
- Avisos de terceros: THIRD_PARTY/manifest.json (ruta relativa dentro del repositorio)
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
