# markrodrigo/Qwen-3.5-2B-Spatial-SQL-1.1

## Resumen

Qwen-3.5-2B-Spatial-SQL-1.1 es un modelo de lenguaje especializado en la generación de consultas SQL espaciales para PostGIS a partir de lenguaje natural. Desarrollado por Mark Rodrigo, se trata de un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-2B de Alibaba Cloud, con un tamaño de aproximadamente 1.880 millones de parámetros. Su propósito es convertir preguntas en inglés sobre operaciones geográficas (área, centroide, buffer, longitud y distancia) en sentencias SQL ejecutables, incorporando coordenadas WGS84 en la entrada.

El modelo resuelve el problema de la traducción automática de comandos de lenguaje natural a SQL espacial, un área de gran utilidad en sistemas de información geográfica (GIS) y aplicaciones de mapeo. Su relevancia actual radica en la creciente demanda de interfaces conversacionales para bases de datos espaciales, donde los usuarios no técnicos necesitan realizar análisis geométricos sin conocer la sintaxis de PostGIS. El modelo está pensado como un prototipo experimental, con una ventana de contexto de hasta 262.000 tokens, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (recomendado por el autor) |
| Tipos de cuantizacion | No especificados en la ficha original; existe version GGUF de terceros (mradermacher) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponible en GGUF) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-2B, un transformer denso con gated delta networks y soporte de contexto largo (262K tokens). El ajuste fino se realizó mediante Supervised Fine Tuning (SFT) sobre datos sintéticos personalizados, generados específicamente para las cinco funciones geográficas objetivo. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-4, optimizador Adam en 8 bits, scheduler lineal y entrenamiento distribuido en 2 GPUs. No se menciona el uso de RLHF ni DPO; el proceso es exclusivamente de supervisión directa sobre pares pregunta-respuesta SQL.

La innovación principal no reside en la arquitectura, sino en el enfoque de especialización: el modelo recibe una inyección de coordenadas en el prompt (por ejemplo, un punto o polígono en formato WKT) y genera la sentencia PostGIS correspondiente. El autor indica que es un ajuste "ligero" (lightly fine-tuned), lo que sugiere que se preservan las capacidades generales del modelo base mientras se refuerza el comportamiento específico de generación de SQL espacial.

## Capacidades

- Generación de sentencias SQL espaciales PostGIS para cinco funciones geográficas: área (ST_Area), centroide (ST_Centroid), buffer (ST_Buffer), longitud (ST_Length) y distancia (ST_Distance).
- Interpretación de preguntas en inglés con variaciones naturales (por ejemplo, "What is the area for the polygon?" o "How long is the line?").
- Aceptación de geometrías en formato WKT (Well-Known Text) con coordenadas WGS84, tanto en grados decimales como en metros.
- Generación de SQL con subconsultas y casting a tipo `geography` para cálculos geodésicos.
- Capacidad de seguir el formato ChatML con system prompt y user message, incluyendo la opción de desactivar el modo de razonamiento (`enable_thinking=False`).
- Soporte multilingüe limitado a inglés y chino, aunque el caso de uso principal está en inglés.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso más allá de la generación directa de SQL.

## Casos de uso

- Consulta de áreas de parcelas en aplicaciones catastrales: un usuario escribe "¿Cuál es el área de este polígono?" y el modelo genera `SELECT ST_Area(geog) FROM ...`, permitiendo calcular superficies sin escribir SQL manualmente.
- Cálculo de centroides para visualización en mapas: el modelo produce `ST_AsText(ST_Centroid(geog))`, útil para colocar etiquetas o marcadores en el punto central de una geometría.
- Generación de buffers de distancia para análisis de proximidad: por ejemplo, "¿Cuál es el buffer de 1000 metros de este punto?" devuelve el polígono resultante, aplicable a estudios de áreas de influencia.
- Medición de longitudes de líneas (carreteras, ríos, tuberías) a partir de un LINESTRING, generando `ST_Length(geog)` para obtener la distancia en metros.
- Cálculo de distancias entre dos geometrías (punto, línea o polígono) mediante `ST_Distance`, útil para planificación urbana o logística.
- Integración en asistentes conversacionales de sistemas GIS: el modelo puede conectarse a una interfaz de mapeo que inyecte las coordenadas actuales y ejecute el SQL resultante contra una base de datos PostGIS, automatizando flujos de análisis espacial.
- Prototipado rápido de consultas espaciales para desarrolladores que no dominan PostGIS, reduciendo el tiempo de escritura de sentencias complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El autor indica "More information needed" en la sección de datos de evaluación, por lo que no es posible cuantificar el rendimiento relativo del modelo en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1,88 B parámetros, en precisión FP16 ocupa aproximadamente 3,8 GB de memoria, más overhead de activaciones y KV cache. Con cuantización de 4 bits, el peso se reduce a unos 0,94 GB, permitiendo ejecución en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en FP16. Para cuantización GGUF, incluso GPUs de 4 GB (GTX 1650, RTX 3050) pueden funcionar.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño diseñado para edge inference y entornos con recursos limitados.
- Opciones de despliegue: compatible con transformers (pipeline de HuggingFace), vLLM, llama.cpp (mediante la versión GGUF), Ollama y TGI. El autor recomienda hiperparámetros de inferencia: temperatura 0,4-0,5, top_k 100 y contexto máximo de 262.000 tokens.
- Latencia y throughput: no se proporcionan datos medidos, pero al ser un modelo de 2B, la generación de una sentencia SQL (típicamente menos de 100 tokens) debería completarse en menos de un segundo en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-3.5-2B-Spatial-SQL-1.1 (este) | 1,88 B | 262K | Texto a SQL espacial PostGIS | Apache 2.0 | HuggingFace, GGUF |
| Qwen/Qwen3.5-2B (base) | 1,88 B | 262K | Modelo general multilingue | Apache 2.0 | HuggingFace, Ollama |
| markrodrigo/Qwen-3.5-4B-Spatial-SQL-1.1 | ~4 B | 262K (estimado) | Texto a SQL espacial PostGIS | Apache 2.0 | HuggingFace |

La comparativa se limita a las variantes del mismo autor y al modelo base, ya que no se dispone de información sobre otros modelos especializados en SQL espacial. La versión de 4B ofrece mayor capacidad de razonamiento pero requiere más recursos; la versión de 2B es más ligera y adecuada para despliegue en edge. El modelo base Qwen3.5-2B es más generalista pero no está optimizado para generar SQL espacial con la misma precisión.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo califica como "experimental" y orientado a prototipado, no a producción sin validación adicional.
- Alcance limitado: solo cubre cinco funciones geográficas (área, centroide, buffer, longitud y distancia). No genera consultas SQL espaciales más complejas (uniones, intersecciones, transformaciones de coordenadas, etc.).
- Riesgo de alucinación: al ser un ajuste ligero, puede generar SQL incorrecto o inventar funciones PostGIS si la pregunta se aleja de los patrones de entrenamiento.
- Dependencia del formato de entrada: requiere que las coordenadas se proporcionen en formato WKT y en WGS84; otros sistemas de referencia pueden producir resultados erróneos.
- Idiomas limitados: aunque el modelo base soporta chino, el caso de uso principal está en inglés; las variaciones de preguntas en otros idiomas no están garantizadas.
- Sin evaluación publicada: no hay benchmarks ni métricas de precisión, por lo que el rendimiento real en tareas del mundo real es desconocido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3.5, se deben respetar los términos de la licencia del modelo base (también Apache 2.0).
- Requiere validación humana: las sentencias SQL generadas deben revisarse antes de ejecutarse contra bases de datos de producción, especialmente en aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/markrodrigo/Qwen-3.5-2B-Spatial-SQL-1.1
- Repositorio GitHub del autor: https://github.com/mprodrigo/spatialsql
- Versión GGUF (tercero): https://huggingface.co/mradermacher/Qwen-3.5-2B-Spatial-SQL-1.1-GGUF
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Referencia de funciones PostGIS: https://postgis.net/docs/PostGIS_Special_Functions_Index.html#PostGIS_GeographyFunctions
- Página de Qwen3.5-2B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-2B
- Página de Qwen3.5-2B en Ollama: https://ollama.com/library/qwen3.5:2b
