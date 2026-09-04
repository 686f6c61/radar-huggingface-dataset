# AkshAIML/tinyllama-sql-lora-adapter

## Resumen

El modelo `AkshAIML/tinyllama-sql-lora-adapter` es un adaptador LoRA para el modelo base `TinyLlama-1.1B-Chat-v1.0`, desarrollado por AkshAIML. Su función es convertir pares de entrada formados por un esquema de tabla y una pregunta en lenguaje natural en consultas SQL limpias y ejecutables. El objetivo principal del fine-tuning no es enseñar sintaxis SQL desde cero, sino adaptar el formato de respuesta del modelo base para que produzca únicamente una sentencia SQL, sin explicaciones adicionales ni bloques de código Markdown.

La relevancia de este adaptador radica en su eficiencia: al emplear LoRA, se entrenan menos del 1% de los parámetros del modelo base de 1.1B, lo que permite una adaptación rápida y de bajo coste para una tarea específica de text-to-SQL. El entrenamiento se realizó sobre 3.000 ejemplos del dataset `b-mc2/sql-create-context` durante una única época, en una NVIDIA T4 de Google Colab. El adaptador se publica en Hugging Face en formato safetensors y se puede cargar con PEFT sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre TinyLlama-1.1B-Chat-v1.0 (modelo causal de lenguaje) |
| Parametros totales | 1.1B (modelo base) + adaptador LoRA (<1% adicional, cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | No especificada; consultar la licencia del modelo base TinyLlama |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `TinyLlama-1.1B-Chat-v1.0`, un modelo causal de lenguaje con 1.1B parámetros. Se aplica LoRA con un rank de 16 sobre las proyecciones de atención y de las capas MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizó con `SFTTrainer` sobre 3.000 ejemplos del dataset `b-mc2/sql-create-context`, durante una única época. No se empleó RLHF ni DPO.

La innovación técnica destacable es la adaptación del formato de respuesta. El modelo base TinyLlama ya posee conocimientos generales de SQL, pero tiende a responder de forma conversacional, explicando la consulta o añadiendo bloques de código. El adaptador induce una salida estrictamente SQL, sin texto adicional. El entrenamiento se llevó a cabo en una NVIDIA T4 de Google Colab, con un pico de VRAM de aproximadamente 4 GB y una duración de unos 10 minutos.

## Capacidades

- Generación de consultas SQL a partir de un esquema de tabla y una pregunta en lenguaje natural.
- Salida en formato SQL puro, sin comentarios ni bloques de código Markdown.
- Capacidad limitada al idioma inglés.
- No se documenta soporte de tool calling, agentes, visión ni audio.
- No se documenta soporte de razonamiento multi-paso más allá de la tarea text-to-SQL.

## Casos de uso

- Consulta de bases de datos en lenguaje natural: el modelo recibe el esquema de una tabla y una pregunta, y devuelve una consulta SQL. Es adecuado para prototipos de interfaces de consulta en los que se necesita una respuesta rápida sin entrenar un modelo grande.
- Demostraciones de text-to-SQL: sirve como ejemplo de adaptación eficiente con LoRA, útil para entornos educativos o de investigación.
- Experimentos de fine-tuning con LoRA: permite estudiar cómo un adaptador de bajo rango puede modificar el formato de salida de un modelo pequeño.
- Prototipado de interfaces de base de datos asistidas por IA: puede integrarse en aplicaciones que validen el SQL generado antes de ejecutarlo, reduciendo el riesgo de errores.
- Generación de SQL para análisis de datos: en pipelines donde se necesita traducir preguntas de negocio a consultas SQL, siempre que el esquema sea conocido y el SQL se valide.
- Aprendizaje de técnicas de adaptación: el adaptador es un recurso didáctico para mostrar cómo cargar un modelo base y un adaptador PEFT, y cómo evaluar el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La evaluación se realizó sobre un split held-out del dataset `b-mc2/sql-create-context`, utilizando exact-match como métrica, pero no se aportan cifras concretas. Tampoco se realizó evaluación basada en ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Durante el entrenamiento se alcanzó un pico de aproximadamente 4 GB de VRAM en una NVIDIA T4 (16 GB).
- GPU recomendadas: no especificadas. El entrenamiento se realizó en una NVIDIA T4 de Google Colab.
- Puede ejecutarse en GPUs de consumo con suficiente VRAM para un modelo de 1.1B en float16, pero no hay datos confirmados.
- Opciones de despliegue: el adaptador se carga mediante `transformers` y `peft` sobre el modelo base. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Para usar estos entornos, sería necesario fusionar el adaptador con el modelo base y convertirlo al formato correspondiente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos suficientes en la información proporcionada. Existen otros adaptadores LoRA para TinyLlama orientados a text-to-SQL, como `tushkulange/tinyllama-text-to-sql-lora`, pero no se han publicado especificaciones detalladas ni resultados de benchmarks.

## Limitaciones y advertencias

- El modelo se entrenó con solo 3.000 ejemplos y una única época, lo que limita su generalización.
- Puede generar SQL sintáctica o semánticamente incorrecta para esquemas o preguntas no familiares.
- La evaluación con exact-match puede marcar como incorrectas consultas SQL semánticamente equivalentes.
- No se realizó evaluación basada en ejecución, por lo que no se conoce la tasa de éxito real sobre bases de datos.
- La generalización entre dialectos SQL no está garantizada.
- El uso de greedy decoding prioriza la reproducibilidad, no el rendimiento en producción.
- No debe utilizarse como agente autónomo de bases de datos sin validación adicional.
- La licencia no está especificada en la ficha del adaptador; es necesario revisar la licencia del modelo base TinyLlama.
- Solo soporta inglés.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/AkshAIML/tinyllama-sql-lora-adapter
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Repositorio del proyecto (según la model card): https://github.com/Aksh-dev-code/Text-to-SQL
- Repositorio relacionado encontrado en la búsqueda web: https://github.com/Akshu0713/LLM-Fine-Tuning
