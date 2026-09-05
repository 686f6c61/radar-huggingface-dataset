# giangkh19/Qwen3.5-4B-Financial-SQL-GGUF

## Resumen

El modelo `giangkh19/Qwen3.5-4B-Financial-SQL-GGUF` es una adaptación fine-tuned del modelo Qwen3.5-4B, convertida al formato GGUF para su ejecución con llama.cpp. Desarrollado por el usuario giangkh19, está especializado en la generación de consultas SQL en el dominio financiero. El modelo tiene 4.326 millones de parámetros (4.3B) y, según las etiquetas de HuggingFace, es un modelo multimodal de visión y lenguaje, lo que sugiere que puede procesar tanto texto como imágenes. La conversión a GGUF se realizó con Unsloth, y el repositorio incluye los pesos cuantizados en Q4_K_M y un proyector multimodal en F16. El modelo está pensado para ejecutarse localmente con llama.cpp, lo que lo hace adecuado para entornos con recursos limitados. No se proporcionan detalles sobre la licencia, los idiomas soportados ni la longitud de contexto.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basado en Qwen3.5-4B; no se detallan más componentes |
| Parámetros totales | 4.326.350.848 (4.326 millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (pesos principales), F16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-4B, un transformer multimodal que integra un codificador visual y un decodificador de lenguaje. El proceso de fine-tuning se llevó a cabo con la librería Unsloth, que permite entrenar modelos grandes con menor consumo de memoria. Según el repositorio hermano `giangkh19/qwen3.5-4b-sql`, el autor utilizó QLoRA de 4 bits y un conjunto de datos de 17.000 muestras avanzadas combinando fuentes como Gretel AI, Spider y BIRD-Bench; sin embargo, esta información no se confirma explícitamente para la variante Financial-SQL. El modelo se convirtió posteriormente a formato GGUF, lo que permite su ejecución con llama.cpp y herramientas compatibles. No se han publicado detalles sobre la composición exacta del dataset ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de consultas SQL a partir de lenguaje natural, con especialización en el dominio financiero.
- Procesamiento multimodal: al incluir un proyector de visión (mmproj), el modelo puede aceptar entradas de imagen además de texto.
- Ejecución local mediante llama.cpp, con soporte para el formato GGUF y la plantilla Jinja (`--jinja`).
- Compatibilidad con la interfaz `llama-mtmd-cli` para modelos multimodales y `llama-cli` para texto.
- Conversación multi-turno, según la etiqueta "conversational" del repositorio.
- No se dispone de información sobre soporte de tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Generación de consultas SQL para análisis financiero: el modelo puede traducir preguntas en lenguaje natural (por ejemplo, "¿cuál fue el ingreso total del tercer trimestre?") a consultas SQL válidas para bases de datos financieras.
- Asistente para analistas de datos: integrado en un entorno de desarrollo, puede ayudar a explorar esquemas de bases de datos y redactar consultas complejas sin necesidad de escribir SQL manualmente.
- Análisis de documentos financieros con imágenes: al ser multimodal, podría procesar capturas de pantalla de informes o gráficos y generar consultas relacionadas con los datos observados.
- Automatización de pipelines de extracción de datos: en un proceso ETL, el modelo puede generar dinámicamente consultas SQL para transformar y cargar datos financieros.
- Chatbot de soporte interno para equipos de finanzas: permite a usuarios no técnicos consultar métricas de negocio mediante lenguaje natural, reduciendo la dependencia de desarrolladores.
- Formación y documentación: puede utilizarse para generar ejemplos de consultas SQL a partir de descripciones de casos de negocio, facilitando el aprendizaje de SQL en contextos financieros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 3,5 GB, que incluye el modelo cuantizado Q4_K_M y el proyector multimodal F16.
- El modelo Q4_K_M de 4.326 millones de parámetros ocupa aproximadamente entre 2,5 y 3 GB en disco; la VRAM necesaria para inferencia dependerá de la longitud de contexto, pero se estima que una GPU con 6-8 GB de VRAM es suficiente para una ejecución básica.
- Al ser un modelo pequeño, es adecuado para GPUs de consumo, aunque no se han publicado recomendaciones específicas de hardware.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli), y cualquier herramienta compatible con GGUF como Ollama o LM Studio.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El repositorio hermano `giangkh19/qwen3.5-4b-sql` presenta un fine-tuning similar sobre la misma base Qwen3.5-4B, pero no se han publicado benchmarks comparativos.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar si el modelo es apto para uso comercial.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones.
- El modelo es nuevo y no ha sido probado por la comunidad (0 descargas, 0 likes), por lo que su rendimiento real es desconocido.
- La especialización en SQL financiero puede producir consultas incorrectas si el esquema de la base de datos no está bien definido o si el contexto es ambiguo.
- Al ser un modelo multimodal, la calidad de la comprensión visual no ha sido validada con benchmarks.
- No se especifican los idiomas soportados; el fine-tuning puede estar sesgado hacia un idioma concreto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/giangkh19/Qwen3.5-4B-Financial-SQL-GGUF
- Modelo hermano `qwen3.5-4b-sql`: https://huggingface.co/giangkh19/qwen3.5-4b-sql
- Modelo hermano `qwen3.5-4b-sql-gguf`: https://huggingface.co/giangkh19/qwen3.5-4b-sql-gguf
- Unsloth: https://github.com/unslothai/unsloth
