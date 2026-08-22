# mseri/zunzuncito-maple-preview-2bit

## Resumen
Maple Preview 2bit para zunzuncito es una adaptación del modelo de razonamiento `deepgrove/maple-preview` desarrollado por DeepGrove, convertido a pesos ternarios de 2 bits por mseri para ser ejecutado con el motor de inferencia zunzuncito. Este motor está diseñado para ejecutar modelos grandes en equipos con poca memoria RAM, lo que hace que esta versión sea especialmente útil para despliegue en hardware modesto. El modelo original es un modelo de lenguaje de 20 mil millones de parámetros con 1 mil millones activos (arquitectura MoE), que destaca por su alto rendimiento en tareas de razonamiento matemático (AIME26) y por su eficiencia computacional. La versión adaptada mantiene la misma arquitectura y capacidades, pero con una cuantización ternaria que reduce el peso a aproximadamente 5.4 GB, permitiendo su ejecución en dispositivos con pocos recursos. Aunque no se han publicado especificaciones detalladas para esta adaptación concreta, la información disponible sugiere que es una conversión directa del modelo base, preservando sus capacidades de razonamiento y generación de texto.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (20B-A1B) con pesos ternarios (2-bit) |
| Parámetros totales | 20 mil millones (según modelo base) |
| Parámetros activos | 1 mil millones (según modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Ternaria (2-bit) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base es MIT) |
| Formato de pesos | no disponible (probablemente formato propio de zunzuncito) |

## Arquitectura y entrenamiento
El modelo base `deepgrove/maple-preview` es un modelo de razonamiento con arquitectura MoE (Mixture of Experts) de 20B parámetros totales y 1B activos por token. Utiliza pesos ternarios (valores -1, 0, 1), lo que reduce significativamente el espacio de almacenamiento y acelera la inferencia. No se han publicado detalles específicos sobre el entrenamiento, como el número de tokens, el dataset o el uso de RLHF/DPO, en la información proporcionada. La adaptación a 2-bit para zunzuncito es una conversión de pesos que mantiene la arquitectura original, pero con una cuantización aún más agresiva (2 bits por parámetro en lugar de ternario estándar, que también es 2 bits). El motor zunzuncito está diseñado para cargar modelos grandes en RAM limitada, utilizando técnicas de carga parcial y optimizaciones de memoria.

## Capacidades
- Generación de texto y razonamiento avanzado, especialmente en tareas matemáticas y lógicas (según el rendimiento del modelo base en AIME26).
- Capacidades de razonamiento multi-step y resolución de problemas complejos.
- Soporte de tool calling y function calling (no confirmado explícitamente, pero común en modelos de razonamiento modernos).
- Capacidades multilingües: no se han especificado idiomas soportados.
- No se reportan capacidades de visión, audio ni otras modalidades.
- Al ser una versión de 2-bit, puede presentar una degradación leve en la calidad de razonamiento comparado con la versión original, aunque no hay datos concretos.

## Casos de uso
- Razonamiento matemático y resolución de problemas: el modelo base alcanza un 87.5% en el benchmark AIME26, por lo que puede utilizarse en sistemas de tutoría matemática, generación de soluciones paso a paso o verificación de cálculos.
- Asistente de programación: con capacidad de razonamiento, puede generar código y explicar algoritmos, aunque no se ha confirmado soporte específico para tool calling.
- Chatbot de razonamiento en entornos con recursos limitados: gracias a su tamaño reducido (5.4 GB), puede ejecutarse en una Raspberry Pi o un portátil antiguo, ofreciendo respuestas razonadas en conversaciones.
- Análisis de documentos técnicos: su capacidad de razonamiento permite extraer conclusiones de textos largos, aunque la longitud de contexto no está especificada.
- Generación de explicaciones y respuestas en educación: para crear contenido didáctico con pasos lógicos.
- Prototipado de aplicaciones de IA en edge devices: con un peso tan pequeño, puede integrarse en dispositivos embebidos o móviles para tareas de razonamiento en tiempo real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks específicos para la versión `mseri/zunzuncito-maple-preview-2bit`. El modelo base `deepgrove/maple-preview` reporta un 87.5% en el benchmark AIME26 (razonamiento matemático) y una velocidad de inferencia de 218 tokens por segundo en un Mac mini M4. Es probable que esta adaptación tenga un rendimiento similar, pero no se ha medido de forma independiente.

## Requisitos de hardware
- VRAM estimada: no disponible, pero dado el tamaño del archivo (5.4 GB), es probable que quepa en GPUs con 6-8 GB de memoria, como una RTX 3060 o RTX 2070.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia completa; también puede ejecutarse en CPU con suficiente RAM (por ejemplo, un Mac mini M4).
- Compatible con consumer GPUs: sí, siempre que tengan suficiente memoria.
- Opciones de despliegue: el motor zunzuncito está diseñado para CPU y RAM limitada, por lo que se puede usar en sistemas sin GPU. No se han mencionado compatibilidades con vLLM, llama.cpp u otros motores.
- Latencia y throughput: no se han publicado datos específicos para esta adaptación, pero el modelo base alcanza 218 tok/s en un Mac mini M4, lo que sugiere una eficiencia notable.

## Comparativa con modelos similares
No se dispone de información suficiente para comparar este modelo con alternativas concretas. No se han encontrado modelos comparables con la misma arquitectura (ternaria 20B-A1B) en el contexto de búsqueda. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias
- Sesgos conocidos: no se ha reportado información sobre sesgos; como cualquier modelo de lenguaje, puede presentar sesgos de género, raza o cultura, pero no se ha evaluado.
- Riesgo de alucinación: los modelos de razonamiento pueden generar respuestas incorrectas o inventadas en temas no bien cubiertos por el entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está especificada, por lo que podría ser limitada para tareas de documentos largos.
- Restricciones de licencia: aunque el modelo base es MIT, esta adaptación no indica licencia, lo que genera incertidumbre para uso comercial. Se recomienda consultar con el autor.
- La cuantización a 2-bit puede degradar ligeramente la calidad del modelo en tareas complejas, aunque no se ha cuantificado.
- El motor zunzuncito es específico y no está ampliamente adoptado, lo que limita la interoperabilidad con otros ecosistemas.

## Enlaces
- Modelo en HuggingFace: [mseri/zunzuncito-maple-preview-2bit](https://huggingface.co/mseri/zunzuncito-maple-preview-2bit)
- Modelo base: [deepgrove/maple-preview-2bit-mlx](https://huggingface.co/deepgrove/maple-preview-2bit-mlx)
- Modelo original: [deepgrove/maple-preview](https://huggingface.co/deepgrove/maple-preview)
- Motor zunzuncito: https://github.com/mseri/zunzuncito
- Página de DeepGrove: https://deepgrove.ai/
- Benchmark y descripción del modelo base: https://benchgen.com/models/deepgrove/maple-preview
