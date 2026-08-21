# aijadugar/qwen2.5-0.5b-sql-qlora

## Resumen

Este modelo es un ajuste fino de `Qwen/Qwen2.5-0.5B-Instruct` especializado en la generación de consultas SQL a partir de texto natural (text-to-SQL). Lo ha desarrollado el usuario aijadugar como ejercicio de aprendizaje, utilizando la técnica QLoRA sobre una pequeña muestra de 250 ejemplos del dataset `b-mc2/sql-create-context`. El resultado es un adaptador LoRA que se ha fusionado de nuevo en el modelo base en precisión completa.

El modelo resuelve el problema de traducir preguntas en lenguaje natural a consultas SQL, una tarea habitual en el desarrollo de aplicaciones de datos. Su relevancia radica en que demuestra cómo se puede especializar un modelo pequeño (0.5B parámetros) con recursos limitados (una GPU Tesla T4 en Kaggle) y un conjunto de datos reducido, aunque el propio autor advierte que es un ejercicio de aprendizaje y no un sistema listo para producción.

La arquitectura es un transformer decoder-only denso de 0.5B parámetros, con una ventana de contexto de 32K tokens heredada del modelo base Qwen2.5. El entrenamiento se realizó con QLoRA en 4 bits (NF4) con doble cuantización, aplicando el adaptador a las proyecciones de atención `q_proj`, `k_proj`, `v_proj` y `o_proj` con rango 8 y alpha 16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 (0.5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | Entrenado con 4-bit NF4 (QLoRA); pesos finales fusionados en precision completa (fp32/bf16) |
| Idiomas soportados | no disponible (heredados del modelo base, principalmente ingles y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5 de Alibaba, preentrenado con hasta 18 billones de tokens. Sobre esta base, el autor aplico QLoRA: el modelo base se congelo y se cuantizo a 4 bits usando bitsandbytes con tipo NF4 y doble cuantizacion, y se entreno un adaptador LoRA de rango 8 y alpha 16 sobre las capas de atencion. Tras el entrenamiento, el adaptador se fusiono de nuevo en el modelo base y se restauro a precision completa.

El entrenamiento se realizo con solo 250 ejemplos del dataset `b-mc2/sql-create-context`, un subconjunto muy reducido. No se menciona el uso de tecnicas como RLHF o DPO; se trata de un ajuste fino supervisado estandar. El hardware utilizado fue una unica GPU Tesla T4 en Kaggle, lo que demuestra la viabilidad del enfoque QLoRA para tareas de especializacion con recursos minimos.

## Capacidades

- Generacion de consultas SQL a partir de descripciones en lenguaje natural, incluyendo la creacion de tablas y consultas de seleccion.
- Comprension basica del contexto de esquemas de bases de datos simples, gracias al dataset de entrenamiento que incluye contexto de creacion de tablas.
- Capacidades generales de generacion de texto y razonamiento heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Soporte de chat y respuestas en formato instructivo, heredado del modelo base.
- Capacidades multilingues limitadas, heredadas del modelo base (principalmente ingles y chino).
- No soporta tool calling ni function calling de forma nativa, dado el tamano reducido del modelo y la especializacion en una unica tarea.

## Casos de uso

- Aprendizaje y experimentacion con QLoRA: el caso de uso principal declarado por el autor. Sirve como ejemplo didactico de como ajustar un modelo pequeno con recursos limitados para una tarea especifica.
- Prototipado rapido de asistentes SQL: se puede integrar en un prototipo que traduzca preguntas naturales a consultas SQL para bases de datos simples, aunque con expectativas limitadas de precision.
- Generacion de consultas SQL para esquemas sencillos: el modelo puede producir consultas basicas de tipo SELECT, INSERT o CREATE TABLE cuando el esquema es simple y el vocabulario esta dentro del rango del dataset de entrenamiento.
- Benchmarking de tecnicas de fine-tuning: util para comparar el rendimiento de QLoRA frente a otros metodos de ajuste en modelos pequenos.
- Educacion en procesamiento de lenguaje natural: puede usarse en cursos o talleres para ilustrar el flujo completo de fine-tuning con PEFT y bitsandbytes.
- Base para futuros ajustes: el modelo fusionado puede servir como punto de partida para un segundo ajuste con un dataset mas amplio y diverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de exactitud en tareas text-to-SQL como Spider o WikiSQL, ni comparaciones con otros modelos. Dado el tamano reducido del dataset de entrenamiento (250 ejemplos), es previsible que el rendimiento en benchmarks estandar sea limitado, pero no hay datos objetivos que confirmen esta hipotesis.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB con cuantizacion 4-bit u 8-bit; alrededor de 2-3 GB en precision completa (fp32).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Una NVIDIA T4, GTX 1660, RTX 3060 o superior puede ejecutar el modelo sin problemas.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU consumer moderna, incluso en CPU con quantizacion.
- Opciones de despliegue: transformers con bitsandbytes para cuantizacion, llama.cpp u Ollama para ejecucion en CPU/GPU ligera, vLLM para inferencia de alto rendimiento (aunque excesivo para un modelo de este tamano).
- Latencia y throughput: no disponible, pero por el tamano del modelo se espera una latencia muy baja (inferior a 100 ms por token en GPU moderna) y un throughput alto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| aijadugar/qwen2.5-0.5b-sql-qlora | 0.5B | 32K | Text-to-SQL (250 ejemplos) | Apache-2.0 |
| Qwen2.5-0.5B-Instruct (base) | 0.5B | 32K | Chat general | Apache-2.0 |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Chat general | Apache-2.0 |
| Qwen2.5-7B-Instruct | 7B | 128K | Chat general | Apache-2.0 |

La comparativa directa con otros modelos text-to-SQL especializados no esta disponible en la informacion proporcionada. Frente a su modelo base, la unica diferencia es la especializacion en SQL, que puede mejorar la precision en esa tarea concreta a costa de perder generalidad. Los modelos de mayor tamano de la familia Qwen2.5 ofrecen mejor rendimiento general, pero requieren mas recursos.

## Limitaciones y advertencias

- El modelo se entreno con solo 250 ejemplos, por lo que su capacidad para generalizar a esquemas de bases de datos complejos o vocabulario variado es muy limitada.
- El propio autor declara que es un ejercicio de aprendizaje y no un sistema de produccion; se esperan errores frecuentes en la generacion de SQL.
- Riesgo de alucinacion: el modelo puede generar consultas SQL sintacticamente validas pero semanticamente incorrectas, especialmente con esquemas fuera del rango de entrenamiento.
- Sesgos y limitaciones del modelo base Qwen2.5-0.5B: al ser un modelo pequeno, su capacidad de razonamiento y comprension es limitada en comparacion con modelos de mayor tamano.
- La licencia Apache-2.0 permite uso comercial, pero el rendimiento limitado hace poco recomendable su uso en entornos de produccion sin un ajuste adicional con mas datos.
- No se proporciona informacion sobre el dataset de entrenamiento mas alla del nombre y el numero de ejemplos; se desconoce la calidad y diversidad de los datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aijadugar/qwen2.5-0.5b-sql-qlora
- Repositorio HuggingFace (variante LoRA sin fusionar): https://huggingface.co/aijadugar/qwen2.5-0.5b-sql-lora
- Coleccion Qwen2.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen25
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Modelo base en ModelScope: https://www.modelscope.cn/models/qwen/Qwen2.5-0.5B-Instruct
- Modelo Qwen2.5-0.5B en Ollama: https://ollama.com/library/qwen2.5:0.5b
