# Axhinxv/text2sql-qwen-3b-lora

## Resumen

El modelo `text2sql-qwen-3b-lora` es un ajuste fino (fine-tuning) del modelo base `unsloth/qwen2.5-coder-3b-instruct-bnb-4bit`, desarrollado por el usuario Axhinxv. Su propósito es transformar lenguaje natural en consultas SQL, una tarea conocida como text-to-SQL. Está construido sobre la arquitectura Qwen2.5-Coder, un modelo decoder-only de 3 mil millones de parámetros optimizado para generación de código, y ha sido afinado con la técnica LoRA mediante las librerías Unsloth y TRL de HuggingFace.

El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. Con 3.085.938.688 parámetros, es un modelo relativamente ligero, adecuado para entornos con recursos limitados. Su tamaño compacto y su especialización en SQL lo convierten en una opción práctica para aplicaciones que necesitan convertir preguntas en lenguaje natural a consultas SQL sin depender de APIs externas o modelos de gran tamaño.

La relevancia actual de este modelo radica en la creciente demanda de asistentes de bases de datos y herramientas de análisis de datos que permitan a usuarios no técnicos interactuar con datos mediante lenguaje natural. Al estar basado en Qwen2.5-Coder, hereda capacidades de razonamiento y generación de código, aunque su fine-tuning se centra específicamente en la sintaxis y semántica de SQL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó en 4-bit, pero los pesos publicados son safetensors de precisión desconocida) |
| Idiomas soportados | inglés (etiqueta `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-Coder-3B-Instruct, un transformer decoder-only con 3 mil millones de parámetros. La versión base fue cuantizada a 4-bit mediante bitsandbytes (bnb-4bit) para el entrenamiento, y posteriormente se aplicó un ajuste fino con LoRA (Low-Rank Adaptation), lo que permite actualizar solo un subconjunto de los pesos del modelo. El entrenamiento se realizó con la librería Unsloth, que acelera el proceso de fine-tuning, y con la librería TRL de HuggingFace para el pipeline de entrenamiento.

No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El nombre del modelo sugiere que el ajuste se centra en la tarea text-to-SQL, pero no hay detalles sobre la composición de los datos ni las técnicas específicas de optimización.

## Capacidades

- Generación de consultas SQL a partir de instrucciones en lenguaje natural (text-to-SQL).
- Generación de código SQL para diversos dialectos (aunque no se especifica cuáles, al estar basado en Qwen2.5-Coder puede manejar SQL estándar y variantes comunes).
- Razonamiento sobre esquemas de bases de datos y estructuras relacionales (capacidad heredada del modelo base).
- Generación de texto general y código, aunque el fine-tuning puede haber reducido el rendimiento en tareas no relacionadas con SQL.
- Soporte de conversación multi-turno (heredado del modelo base instruct).
- No se documenta soporte explícito de tool calling o function calling, pero Qwen2.5-Coder-Instruct sí lo soporta, por lo que es plausible que el modelo lo mantenga, aunque no está confirmado.

## Casos de uso

- Asistente de consultas para bases de datos: un desarrollador puede integrar el modelo en una herramienta interna que permita a analistas de negocio formular preguntas en inglés y obtener consultas SQL listas para ejecutar, reduciendo el tiempo de escritura manual.
- Generación de SQL para pipelines de datos: en un entorno de ETL, el modelo puede convertir requisitos de extracción expresados en lenguaje natural a scripts SQL, agilizando el desarrollo de pipelines.
- Chatbot de soporte para bases de datos: como parte de un sistema de atención al cliente, el modelo puede responder preguntas sobre datos almacenados generando consultas SQL dinámicamente, siempre que se valide la salida antes de ejecutarla.
- Educación y formación en SQL: los estudiantes pueden usar el modelo para traducir sus preguntas en lenguaje natural a SQL y comparar con soluciones correctas, facilitando el aprendizaje.
- Generación de informes automatizados: en herramientas de business intelligence, el modelo puede transformar solicitudes de informes en consultas SQL que alimentan dashboards, siempre con supervisión humana.
- Prototipado rápido de aplicaciones de datos: durante el desarrollo de un MVP, el modelo permite generar consultas SQL sobre la marcha para probar hipótesis sin escribir SQL manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de text-to-SQL (por ejemplo, Spider o WikiSQL). Se recomienda realizar una evaluación propia con el conjunto de datos de interés antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.085 millones de parámetros, en precisión FP16 se requieren aproximadamente 6,2 GB de VRAM. Si se cuantiza a 8 bits, se reduce a unos 3,1 GB; en 4 bits, a unos 1,6 GB. No se indica la precisión de los pesos publicados, pero el safetensors del repositorio ocupa 6,3 GB, lo que sugiere FP16 o BF16.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3060, RTX 4060, RTX 3070, A10). Para cuantización de 4 bits, puede ejecutarse en GPUs con 4 GB o menos, como RTX 3050 o incluso en CPU con llama.cpp.
- Es compatible con GPUs de consumo, especialmente si se aplica cuantización adicional.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference), HuggingFace Inference Endpoints, o directamente con transformers.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 3B, se espera una latencia de unos 20-50 ms por token en una GPU moderna con FP16, y mayor en cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos text-to-SQL de tamaño similar. El modelo base Qwen2.5-Coder-3B-Instruct es un punto de referencia razonable, pero no hay datos de rendimiento específicos. Alternativas en el ecosistema incluyen modelos como `sqlcoder-7b` (de Defog) o `CodeLlama-7B` fine-tuned para SQL, pero no se dispone de datos comparativos en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| text2sql-qwen-3b-lora | 3.085 M | no disponible | Apache-2.0 | text-to-SQL |
| Qwen2.5-Coder-3B-Instruct (base) | 3.085 M | 32.768 (según documentación de Qwen) | Apache-2.0 | código general |
| sqlcoder-7b | 7.000 M | no disponible | no disponible | text-to-SQL |

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés; no se recomienda su uso con otros idiomas sin reentrenamiento.
- No se dispone de información sobre sesgos o riesgos de alucinación específicos, pero como todo modelo generativo, puede producir consultas SQL incorrectas o inventadas. Es imprescindible validar la salida antes de ejecutarla en una base de datos.
- La longitud de contexto no está documentada; el modelo base Qwen2.5-Coder soporta hasta 32.768 tokens, pero el fine-tuning podría haber alterado este límite.
- El fine-tuning con LoRA puede haber degradado el rendimiento en tareas generales de código o razonamiento fuera del dominio SQL.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base `unsloth/qwen2.5-coder-3b-instruct-bnb-4bit` también está bajo Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- No hay garantía de soporte o mantenimiento por parte del autor; el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto personal sin validación comunitaria.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Axhinxv/text2sql-qwen-3b-lora)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Documentación de Qwen2.5-Coder](https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct)
