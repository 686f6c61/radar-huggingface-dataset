# markrodrigo/Qwen-3.5-0.8B-Spatial-SQL-1.1

## Resumen

Qwen-3.5-0.8B-Spatial-SQL-1.1 es un modelo de lenguaje de 0,8 mil millones de parámetros, desarrollado por Mark Rodrigo, que convierte lenguaje natural en sentencias SQL espacial PostGIS. Se trata de un ajuste fino ligero (QLoRA / SFT) sobre el modelo base Qwen/Qwen3.5-0.8B, especializado en un caso de uso muy concreto: la traducción de preguntas geográficas a funciones espaciales de PostGIS como área, centroide, buffer, longitud y distancia. El modelo está pensado para prototipos y aplicaciones de mapeo que necesiten generar consultas SQL espaciales a partir de comandos en inglés o chino, con inyección de coordenadas procedentes de sistemas de mapas.

La relevancia actual radica en la creciente demanda de interfaces de lenguaje natural para bases de datos geoespaciales, donde los modelos generalistas suelen fallar en la sintaxis específica de PostGIS. Este modelo, aunque experimental, demuestra un enfoque viable para tareas de texto a SQL espacial con un coste computacional reducido. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño compacto lo hace desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-0.8B) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (recomendación de inferencia del autor para llama.cpp) |
| Tipos de cuantizacion | no disponible (existe una versión GGUF de terceros) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-0.8B, un transformer denso de 0,8B parámetros. Sobre esta base se aplicó un ajuste fino con QLoRA (Quantized Low-Rank Adaptation) y Supervised Fine Tuning (SFT), utilizando datos sintéticos generados específicamente para el dominio de SQL espacial. El entrenamiento se realizó con dos GPUs, learning rate de 1e-4, optimizador Adam 8-bit y scheduler lineal. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, pero el autor indica que es "custom synthetic" y que el modelo está "ligeramente ajustado" para el caso de uso concreto.

La innovación principal no está en la arquitectura, sino en el enfoque de especialización: el modelo aprende a mapear preguntas en lenguaje natural (con variaciones como "What is the area for the polygon?" o "Buffer the following point a thousand meters") a sentencias SQL PostGIS válidas, incluyendo la conversión de tipos a `geography` y el uso de funciones como `ST_Area`, `ST_Centroid`, `ST_Buffer`, `ST_Length` y `ST_Distance`. El autor recomienda desactivar el modo de pensamiento (`enable_thinking=False`) y usar una temperatura de 0.4-0.5 para inferencia.

## Capacidades

- Generación de sentencias SQL espacial PostGIS a partir de preguntas en lenguaje natural (inglés y chino).
- Soporte de cinco funciones geográficas principales: área, centroide, buffer, longitud y distancia entre geometrías.
- Manejo de coordenadas en grados decimales WGS 84 y salidas en metros.
- Conversación multi-turno básica mediante plantilla ChatML (aunque el caso de uso principal es de una sola consulta).
- Inyección de coordenadas como parte del prompt, lo que permite integración con sistemas de mapeo activos.
- No soporta tool calling ni agentes de forma nativa; el autor menciona que los agentes son un proyecto separado.
- Capacidades multilingües limitadas a inglés y chino, con el inglés como idioma principal de las consultas.

## Casos de uso

- Generación de consultas espaciales para SIG: un usuario puede preguntar "¿Cuál es el área de este polígono?" y el modelo devuelve la sentencia SQL exacta para ejecutar en PostGIS, ahorrando tiempo en la redacción manual de consultas.
- Integración en aplicaciones de mapas web: el modelo puede recibir coordenadas desde un frontend de mapas (por ejemplo, clics del usuario) y generar automáticamente la consulta de buffer o distancia para análisis en tiempo real.
- Automatización de análisis geoespacial en pipelines de datos: se puede encadenar el modelo con un ejecutor de SQL para procesar lotes de geometrías y calcular métricas como longitud o área sin intervención manual.
- Asistente para bases de datos espaciales: los administradores de PostGIS pueden usar el modelo como ayuda para construir consultas complejas, especialmente cuando no dominan la sintaxis de funciones geográficas.
- Educación y formación en SQL espacial: el modelo puede servir como herramienta didáctica para que estudiantes aprendan a formular consultas PostGIS a partir de descripciones en lenguaje natural.
- Prototipado rápido de interfaces conversacionales para datos geoespaciales: dado su tamaño reducido, es adecuado para pruebas de concepto en entornos con recursos limitados, como demuestra el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica "Evaluation data: More information needed" y no proporciona métricas de rendimiento como MMLU, HumanEval o GSM8K. Tampoco hay comparaciones con otros modelos de texto a SQL espacial. La única referencia de rendimiento es la recomendación de hiperparámetros para inferencia (temperatura 0.4-0.5, top k 100) y el contexto máximo de 262.000 tokens, que probablemente hereda del modelo base.

## Requisitos de hardware

- VRAM estimada: ~1,5 GB en FP16, ~0,8 GB en int8, ~0,4 GB en int4 (estimación basada en el número de parámetros; no hay datos oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU con llama.cpp.
- Cabe en GPUs de consumo: sí, incluso en tarjetas integradas con suficiente memoria compartida.
- Opciones de despliegue: Transformers (Hugging Face), vLLM, llama.cpp (vía GGUF de terceros), Ollama (si se convierte a formato compatible).
- Latencia y throughput: no disponible; al ser un modelo de 0,8B, se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para texto a SQL espacial. El modelo base Qwen3.5-0.8B es un modelo generalista, pero no hay benchmarks públicos que permitan comparar el rendimiento del fine-tune con otras alternativas. Se podría comparar con modelos como CodeLlama o SQLCoder, pero no se han encontrado datos de evaluación en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo califica como "experimental" y orientado a prototipos, no a producción sin validación adicional.
- Alcance limitado: solo cubre cinco funciones espaciales (área, centroide, buffer, longitud, distancia); no maneja otras operaciones PostGIS como intersecciones, uniones o transformaciones de coordenadas.
- Riesgo de alucinación en SQL: al ser un modelo pequeño, puede generar sentencias SQL sintácticamente incorrectas o con funciones inapropiadas si la pregunta se sale del dominio entrenado.
- Dependencia de la inyección de coordenadas: el modelo espera que las coordenadas se proporcionen en el prompt; si no se incluyen, la salida puede ser incompleta o errónea.
- Idiomas limitados: solo inglés y chino; no soporta otros idiomas, lo que restringe su uso en entornos multilingües.
- Sin garantías de precisión geográfica: las salidas en metros dependen de la correcta interpretación de las geometrías; errores en la conversión de tipos pueden dar resultados incorrectos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias restricciones; se recomienda revisar la licencia del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markrodrigo/Qwen-3.5-0.8B-Spatial-SQL-1.1
- Repositorio GitHub del autor: https://github.com/mprodrigo/spatialsql
- Documentación de funciones espaciales de PostGIS: https://postgis.net/docs/PostGIS_Special_Functions_Index.html#PostGIS_GeographyFunctions
- Versión GGUF de terceros: https://huggingface.co/mradermacher/Qwen-3.5-0.8B-Spatial-SQL-1.1-GGUF
