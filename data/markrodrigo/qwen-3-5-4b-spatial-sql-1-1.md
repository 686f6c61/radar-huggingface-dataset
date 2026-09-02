# markrodrigo/Qwen-3.5-4B-Spatial-SQL-1.1

## Resumen

Qwen-3.5-4B-Spatial-SQL-1.1 es un modelo de 4.000 millones de parámetros, desarrollado por Mark Rodrigo, que consiste en un ajuste fino ligero (QLoRA/SFT) del modelo base Qwen/Qwen3.5-4B. Su propósito es estrecho y específico: convertir lenguaje natural en consultas SQL espacial PostGIS, a partir de preguntas en inglés combinadas con inyección de coordenadas geográficas (WGS84). El modelo genera sentencias SQL válidas para cinco funciones geográficas principales: área, centroide, buffer, longitud y distancia entre geometrías.

La relevancia de este modelo radica en que aborda un caso de uso muy concreto dentro del campo de los sistemas de información geográfica (GIS): la automatización de consultas espaciales mediante lenguaje natural, evitando que el usuario tenga que escribir SQL manualmente. Al estar basado en Qwen3.5-4B, hereda la arquitectura transformer moderna de la familia Qwen, con una ventana de contexto amplia (recomendada hasta ~262.000 tokens según el autor) y soporte para los idiomas inglés y chino. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

El modelo se presenta como experimental, orientado a prototipado y validación del enfoque general de texto a SQL espacial. Su salida es exclusivamente código PostGIS, y no está diseñado para tareas generales de generación de texto o razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, basada en Qwen/Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | ~262.000 tokens (recomendación del autor para inferencia) |
| Tipos de cuantizacion | No disponible (no se especifican en la documentación) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de la familia Qwen, y se somete a un ajuste fino supervisado (SFT) mediante QLoRA (Quantized Low-Rank Adaptation). Este enfoque permite adaptar el modelo base a la tarea específica de generación de SQL espacial con un coste computacional reducido, utilizando cuantización de 8 bits para el optimizador Adam y entrenamiento distribuido en 2 GPUs. Los datos de entrenamiento son sintéticos y personalizados, generados específicamente para cubrir las cinco funciones geográficas objetivo. No se menciona el uso de RLHF ni DPO; el entrenamiento se limita a SFT con una tasa de aprendizaje de 1e-4 y un scheduler lineal.

La innovación principal no reside en la arquitectura, sino en el diseño del dataset y el prompt: se combina una pregunta en inglés con una inyección de coordenadas (puntos, líneas o polígonos en formato WKT) para que el modelo produzca la sentencia PostGIS correspondiente. El modelo aplica la plantilla ChatML de Qwen, con la opción de desactivar el modo "thinking" para respuestas directas.

## Capacidades

- Generación de sentencias SQL espacial PostGIS a partir de lenguaje natural, limitada a cinco funciones: ST_Area, ST_Centroid, ST_Buffer, ST_Length y ST_Distance.
- Manejo de geometrías en formato WKT (Well-Known Text) y coordenadas en grados decimales WGS84, con salidas en metros o puntos.
- Soporte de variaciones de preguntas en inglés (p. ej., "What is the area for the polygon?", "How long is the line?", "Buffer the following point a thousand meters").
- Capacidad multilingüe limitada: el modelo base soporta inglés y chino, pero el ajuste fino está orientado a preguntas en inglés.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso; el modelo se limita a generar una única consulta SQL por entrada.
- No incluye capacidades de visión, audio ni modo "thinking" activado por defecto (aunque el tokenizador permite habilitarlo, el autor recomienda desactivarlo).

## Casos de uso

- Consulta de áreas de parcelas catastrales: un usuario pregunta "¿Cuál es el área de este polígono?" y el modelo genera `SELECT ST_Area(geog) FROM ...`, útil para aplicaciones de gestión inmobiliaria o catastro.
- Cálculo de centroides para análisis urbano: dado un polígono que representa un distrito, el modelo devuelve el punto central, facilitando la ubicación de equipamientos o la visualización en mapas.
- Generación de buffers de distancia para planificación logística: por ejemplo, "¿Cuál es el buffer de 1000 metros alrededor de este punto?" produce un polígono que delimita zonas de influencia, aplicable a estudios de accesibilidad o cobertura de servicios.
- Medición de longitudes de infraestructuras lineales: el modelo convierte preguntas sobre líneas (carreteras, tuberías) en consultas `ST_Length`, útil para inventarios de activos.
- Cálculo de distancias entre geometrías para análisis de proximidad: permite responder "¿A qué distancia están estos dos puntos?" y obtener la distancia en metros, aplicable a rutas de emergencia o logística.
- Integración en sistemas de mapeo interactivo: el modelo puede recibir coordenadas desde una interfaz de mapa (p. ej., clics del usuario) y generar la consulta SQL para ejecutarla contra una base PostGIS, automatizando el flujo de consulta espacial.
- Prototipado de asistentes GIS conversacionales: dado su tamaño reducido, puede desplegarse en entornos con recursos limitados para validar el enfoque de texto a SQL espacial antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica en la model card que la sección de datos de evaluación está pendiente ("More information needed"). No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.205 millones de parámetros, en FP16 se requieren aproximadamente 8,4 GB de VRAM; con cuantización de 4 bits (si estuviera disponible) podría reducirse a ~2,5-3 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: el modelo cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) en FP16. Para despliegue en servidores, una A10 o A100 sería suficiente.
- Compatibilidad con consumer GPU: sí, es viable en GPUs de gama media-alta sin necesidad de hardware profesional.
- Opciones de despliegue: al ser un modelo de la familia Qwen con formato safetensors, puede ejecutarse con transformers, vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (el modelo base Qwen3.5-4B está disponible en Ollama, aunque este ajuste específico no está en el registro oficial).
- Latencia y throughput: no se proporcionan datos medidos. Para un modelo de 4B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.5-4B-Spatial-SQL-1.1 | 4,2B | ~262K (recomendado) | Texto a SQL espacial PostGIS | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-4B (base) | 4,2B | ~262K | Generación de texto general, multilingüe | Apache 2.0 | HuggingFace, Ollama |
| Qwen/Qwen3-4B (generación anterior) | 4B | 32K (ampliable) | Generación de texto general | Apache 2.0 | HuggingFace |

La comparativa se limita a los modelos base de la misma familia, ya que no se han identificado otros modelos especializados en texto a SQL espacial con características comparables. El ajuste fino reduce la generalidad del modelo base a cambio de precisión en la tarea específica de PostGIS.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo califica como "experimental" y orientado a prototipado, no a producción sin validación adicional.
- Alcance limitado: solo cubre cinco funciones geográficas (área, centroide, buffer, longitud, distancia); cualquier otra consulta espacial (p. ej., intersecciones, uniones, transformaciones de proyección) queda fuera de su capacidad.
- Riesgo de alucinación: al ser un modelo pequeño ajustado con datos sintéticos, puede generar SQL sintácticamente incorrecto o con funciones no soportadas si la pregunta se aleja del dominio entrenado.
- Dependencia del formato de entrada: requiere que las coordenadas se proporcionen en formato WKT y en grados decimales WGS84; desviaciones en el formato pueden producir respuestas erróneas.
- Sesgos lingüísticos: aunque el modelo base soporta chino, el ajuste fino está orientado a preguntas en inglés; el rendimiento en otros idiomas no está garantizado.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que el rendimiento real en tareas variadas es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de soporte ni mantenimiento.
- Para producción, se recomienda validar exhaustivamente las salidas SQL contra la base de datos y considerar un mecanismo de verificación de sintaxis antes de ejecutar las consultas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/markrodrigo/Qwen-3.5-4B-Spatial-SQL-1.1
- Repositorio GitHub del autor: https://github.com/mprodrigo/spatialsql
- Documentación de funciones geográficas de PostGIS: https://postgis.net/docs/PostGIS_Special_Functions_Index.html#PostGIS_GeographyFunctions
- Modelo base Qwen3.5-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base Qwen3.5-4B en Ollama: https://ollama.com/library/qwen3.5:4b
