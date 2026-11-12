# Cheviazt/qwen2.5-coder-1.5b-supermarket-sql-GGUF

## Resumen

El modelo `Cheviazt/qwen2.5-coder-1.5b-supermarket-sql-GGUF` es un ajuste fino por QLoRA del modelo base Qwen2.5-Coder-1.5B-Instruct de Alibaba, especializado en la tarea text-to-SQL sobre un esquema PostgreSQL concreto de 17 tablas de un dominio de supermercado. Lo desarrolla el usuario Cheviazt como trabajo de fin de asignatura ("Sistemas de Información Basados en Inteligencia Artificial") y está publicado únicamente en formato GGUF con cuantización Q4_K_M.

El problema que aborda es la traducción de preguntas en indonesio (registro formal, coloquial, con abreviaturas, erratas y mezcla de inglés) a consultas SQL válidas para PostgreSQL. Según la model card, el ajuste eleva la precisión de ejecución del 5,6 % (zero-shot del modelo base) al 53,7 % sobre un conjunto de 391 preguntas de test, lo que lo convierte en una mejora sustancial respecto al modelo original en esa tarea concreta.

Se trata de un modelo muy pequeño (1.543.714.304 parámetros, unos 1,5 GB en el repositorio) pensado para despliegue local en entornos con recursos limitados. Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto de demostración académica atado a un esquema de base de datos específico y a un system prompt concreto. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-1.5B-Instruct); ajuste fino QLoRA con Unsloth |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M (única publicada en el repositorio) |
| Idiomas soportados | indonesio (entrada) y SQL/PostgreSQL (salida); el modelo base soporta multilingüismo, pero no se detalla en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamaño del repositorio | 1,0 GB |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Dominio de especialización | esquema PostgreSQL de supermercado con 17 tablas |
| Precisión de ejecución en test | 53,7 % (391 preguntas) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only denso de 1,5 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino QLoRA (cuantización de bajo rango) mediante la librería Unsloth, según indica la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de LoRA (rango, alpha, módulos objetivo) ni si se aplicaron fases de RLHF o DPO posteriores.

La innovación principal no es arquitectónica sino de especialización: el ajuste se orienta a un esquema concreto de 17 tablas de supermercado y a un formato fijo de system prompt con esquema resumido. La model card advierte explícitamente que el modelo solo funciona con el mismo system prompt y esquema que se usaron durante el entrenamiento, lo que limita su generalización a otros esquemas o a variaciones del prompt. El conjunto de evaluación consta de 391 preguntas de test en indonesio con distintos registros y ruido lingüístico.

## Capacidades

- Generación de consultas SQL para PostgreSQL a partir de preguntas en lenguaje natural en indonesio.
- Comprensión de registro formal, coloquial, abreviaturas, erratas y mezcla de inglés en la entrada.
- Especialización en un esquema fijo de 17 tablas de dominio supermercado (productos, ventas, inventario, etc., según el esquema de entrenamiento).
- Formato conversacional (etiqueta `conversational` en el repositorio).
- Compatible con endpoints de inferencia (`endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe general: no disponible (el modelo base la tiene, pero el ajuste está orientado a indonesio).

## Casos de uso

- Consultas analíticas internas sobre el esquema de supermercado: un empleado escribe en indonesio "berapa total penjualan bulan lalu" y el modelo genera la consulta SQL agregada correspondiente sobre las tablas de ventas, adecuado por su especialización en ese esquema exacto.
- Prototipado de interfaces de lenguaje natural a SQL en un TFG o proyecto académico: sirve como demostración funcional de un pipeline text-to-SQL con un modelo de 1,5 B ejecutable en local.
- Generación de SQL para informes operativos: traducción de preguntas sobre stock, proveedores o márgenes a consultas PostgreSQL que luego se ejecutan en un panel de BI interno.
- Asistente de soporte a analistas junior: dado el volumen de preguntas repetitivas sobre el esquema, el modelo puede proponer la consulta base que el analista revisa y ajusta.
- Evaluación comparativa de técnicas de ajuste: útil como referencia de hasta dónde llega QLoRA sobre un modelo de 1,5 B en una tarea estrecha (del 5,6 % al 53,7 % de precisión de ejecución).
- Despliegue en entornos con recursos mínimos: al ser un GGUF Q4_K_M de aproximadamente 1 GB, puede ejecutarse en CPU o en GPU de gama baja para tareas de generación de SQL puntuales.
- Filtrado y preprocesado de lenguaje natural ruidoso: la capacidad de manejar erratas y abreviaturas en indonesio puede aprovecharse para normalizar preguntas antes de pasarlas a un sistema SQL más robusto.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card y corresponden a precisión de ejecución (execution accuracy) sobre 391 preguntas de test del dominio:

| Modelo | Execution accuracy (391 preguntas) |
|---|---|
| Qwen2.5-Coder-1.5B-Instruct zero-shot | 5,6 % |
| Qwen2.5-Coder-1.5B-Instruct few-shot (7 ejemplos) | 10,7 % |
| Este modelo (GGUF Q4_K_M) | 53,7 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, Spider, BIRD) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-1,5 GB con la cuantización Q4_K_M publicada; el repositorio ocupa 1,0 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); también funciona en CPU.
- Cabe holgadamente en GPU consumer: sí, en todas las NVIDIA RTX y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (1,5 B parámetros en Q4_K_M) se espera baja latencia en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-Coder-1.5B supermarket SQL) | 1,5 B | no disponible | text-to-SQL PostgreSQL, indonesio, esquema de 17 tablas | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5 B | no disponible | propósito general, código | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-Coder-7B-Instruct | 7 B | no disponible | propósito general, código | Apache 2.0 | safetensors, GGUF |
| Modelos text-to-SQL especializados (p. ej. variantes de CodeLlama o SQLCoder) | variable | no disponible | text-to-SQL genérico | variable | variable |

La comparación directa con otros ajustes text-to-SQL no está disponible en la información proporcionada. Frente a su modelo base, la diferencia medida es de 53,7 % frente a 5,6 % (zero-shot) y 10,7 % (few-shot) en el conjunto de test propio, aunque esa métrica no es comparable con benchmarks públicos como Spider o BIRD.

## Limitaciones y advertencias

- El modelo solo funciona con el mismo system prompt y el esquema resumido usados durante el entrenamiento; fuera de ese formato el rendimiento cae drásticamente.
- Específico de un esquema de 17 tablas de supermercado: no generaliza a otros esquemas sin reentrenamiento.
- La precisión de ejecución es del 53,7 %, lo que implica que aproximadamente la mitad de las consultas generadas no se ejecutan correctamente; requiere validación humana o un mecanismo de verificación en producción.
- Riesgo de alucinación de tablas, columnas o sintaxis SQL no presente en el esquema.
- Entrada orientada a indonesio; el comportamiento en castellano u otros idiomas no está documentado.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-Coder hereda los sesgos del modelo base y de los datos de ajuste, no publicados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo es un trabajo académico sin mantenimiento declarado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.
- Única cuantización publicada (Q4_K_M); no hay versiones en safetensors del ajuste ni otras precisiones.
- El contexto máximo no está documentado en la model card, por lo que no se puede garantizar el manejo de esquemas o preguntas largas.

## Enlaces

- Hugging Face: https://huggingface.co/Cheviazt/qwen2.5-coder-1.5b-supermarket-sql-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Unsloth (librería de ajuste): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
