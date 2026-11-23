# Nive45/qwen2.5-3b-text2sql-qlora

## Resumen

Nive45/qwen2.5-3b-text2sql-qlora es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario Nive45 y publicado en Hugging Face. El modelo está orientado a la tarea de text2sql, es decir, la traducción de instrucciones en lenguaje natural a consultas SQL. Se ha entrenado mediante QLoRA sobre la versión cuantizada en 4 bits del modelo base (unsloth/Qwen2.5-3B-Instruct-bnb-4bit), utilizando la librería Unsloth para acelerar el entrenamiento.

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen2.5, con aproximadamente 3.000 millones de parámetros. Al tratarse de un fine-tuning sobre la variante Instruct, conserva las capacidades conversacionales y de seguimiento de instrucciones del modelo original, pero especializadas hacia la generación de SQL. Es relevante para equipos que necesitan un modelo ligero y desplegable en hardware modesto para tareas de generación de consultas a bases de datos.

La información publicada por el autor es mínima: no se detallan los datos de entrenamiento, los hiperparámetros del QLoRA ni resultados de evaluación. La model card se limita a indicar el modelo base, la licencia Apache 2.0 y el uso de Unsloth. El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que contiene únicamente los adaptadores LoRA o los pesos fusionados en un formato compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | ~3.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, dato no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible (entrenado con QLoRA en 4 bits; no se especifican formatos de exportacion) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-3B-Instruct, un transformer decoder-only de la familia Qwen2.5 con aproximadamente 3.000 millones de parámetros. Sobre esta base se aplicó un ajuste fino con QLoRA, una técnica de adaptación de bajo rango (LoRA) sobre un modelo cuantizado en 4 bits (bnb-4bit), lo que reduce los requisitos de memoria durante el entrenamiento. El entrenamiento se realizó con Unsloth, que según el autor permitió un entrenamiento "2x más rápido" en comparación con los métodos convencionales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de text2sql, la presencia de RLHF/DPO ni los hiperparámetros del LoRA (rango, alpha, tasa de aprendizaje). Tampoco se especifica si los adaptadores se fusionaron con los pesos base o si el repositorio contiene únicamente los adaptadores. El tamaño del repositorio (0,1 GB) es compatible con un conjunto de adaptadores LoRA, aunque no se puede confirmar sin inspeccionar los archivos.

## Capacidades

- Generación de consultas SQL a partir de instrucciones en lenguaje natural (text2sql), que es la tarea principal para la que fue ajustado.
- Generación de texto y seguimiento de instrucciones conversacionales, heredados del modelo base Qwen2.5-3B-Instruct.
- Razonamiento básico y resolución de problemas sencillos, limitado por el tamaño de 3B parámetros.
- Capacidad multilingüe limitada: la model card declara únicamente inglés (`en`).
- Soporte de tool calling / function calling: no confirmado para este fine-tuning; el modelo base Qwen2.5-3B-Instruct lo soporta, pero no se ha verificado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación de consultas SQL en asistentes de BI: el modelo puede traducir preguntas de negocio en lenguaje natural ("¿cuántos clientes se dieron de alta el mes pasado?") a consultas SQL ejecutables contra un esquema de base de datos, lo que acelera la creación de informes en herramientas de analítica.
- Automatización de tareas de ETL y data engineering: integrado en un pipeline, puede generar consultas de transformación o extracción a partir de descripciones textuales, reduciendo el trabajo manual en la escritura de SQL repetitivo.
- Chatbots de soporte para bases de datos: desplegado en un servicio de atención interna, permite a usuarios no técnicos consultar datos mediante preguntas en lenguaje natural, con el modelo generando la consulta y devolviendo resultados.
- Generación de consultas en entornos de desarrollo: como asistente en el IDE o en una CLI, sugiere consultas SQL mientras el desarrollador escribe, aprovechando su especialización en text2sql.
- Prototipado rápido de interfaces de consulta: al ser un modelo de 3B parámetros, puede ejecutarse en hardware de consumo para validar ideas de producto que requieran traducción de lenguaje natural a SQL antes de invertir en modelos mayores.
- Educación y formación en SQL: el modelo puede explicar o generar consultas de ejemplo a partir de enunciados, sirviendo como herramienta de apoyo en cursos de bases de datos.
- Filtrado y validación de consultas: puede usarse para generar variantes de una consulta o para comprobar que una instrucción en lenguaje natural se traduce de forma coherente, aunque requiere supervisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~3B parámetros, en FP16 requiere aproximadamente 6-7 GB de VRAM; en cuantización de 8 bits, unos 3-4 GB; en 4 bits, unos 2-3 GB (estimaciones basadas en el tamaño del modelo base, no confirmadas para este fine-tuning).
- GPU recomendadas: para FP16, una RTX 3060 de 12 GB o superior; para cuantización 4/8 bits, una RTX 3050 de 8 GB o incluso GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 8 GB o más de VRAM, especialmente con cuantización.
- Opciones de despliegue: transformers (librería indicada en la model card), text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp u Ollama si se exportan los pesos a GGUF (no confirmado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Nive45/qwen2.5-3b-text2sql-qlora | ~3B | no disponible | Apache 2.0 | text2sql (fine-tuning) | Hugging Face |
| Qwen2.5-3B-Instruct | ~3B | 32.768 tokens (modelo base) | Apache 2.0 | propósito general | Hugging Face |
| Defog SQLCoder-7B | ~7B | no disponible | no disponible | text2sql | Hugging Face |
| CodeLlama-7B-Instruct | ~7B | 16.384 tokens | Llama 2 (uso comercial restringido) | código y SQL | Hugging Face |

La comparativa se limita a características generales, ya que no se han publicado métricas de rendimiento para este fine-tuning. Frente a SQLCoder o CodeLlama, este modelo es más pequeño (3B frente a 7B), lo que reduce los requisitos de hardware pero probablemente también su precisión en consultas complejas. Frente a Qwen2.5-3B-Instruct, la ventaja es la especialización en text2sql, aunque sin datos de evaluación no se puede cuantificar la mejora.

## Limitaciones y advertencias

- No se han publicado datos de evaluación, por lo que se desconoce su precisión real en tareas text2sql y su posible degradación respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir consultas SQL sintácticamente válidas pero semánticamente incorrectas o referencias a tablas/columnas inexistentes.
- Idioma: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: no se especifica la longitud de contexto efectiva tras el fine-tuning; el modelo base soporta 32.768 tokens, pero el ajuste podría haber alterado este comportamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Datos de entrenamiento desconocidos: no se detalla el dataset utilizado, lo que impide evaluar sesgos, cobertura de dialectos SQL (PostgreSQL, MySQL, etc.) o calidad de las consultas de referencia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- El tamaño del repositorio (0,1 GB) sugiere que podría contener solo adaptadores LoRA; es necesario verificar los archivos antes de intentar cargarlo como modelo completo.

## Enlaces

- [Hugging Face: Nive45/qwen2.5-3b-text2sql-qlora](https://huggingface.co/Nive45/qwen2.5-3b-text2sql-qlora)
- [Modelo base: unsloth/Qwen2.5-3B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [Qwen2.5-3B-Instruct (Hugging Face)](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct)
