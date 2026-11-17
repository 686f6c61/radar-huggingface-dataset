# mirzakhojayev/t2sql-uz-qwen3.5-4B

## Resumen

t2sql-uz-qwen3.5-4B es un adaptador LoRA sobre Qwen3.5-4B desarrollado por mirzakhojayev para la tarea de text-to-SQL, es decir, convertir preguntas en lenguaje natural a consultas SQL ejecutables. El modelo cubre tres idiomas (ingles, ruso y uzbeko en alfabeto latino y cirilico) y genera dialecto PostgreSQL, aunque tambien fue entrenado con ejemplos de SQLite (sin evaluacion publicada para ese dialecto). El adaptador anade 0,06B parametros entrenables sobre el modelo base de 4B, con rango LoRA 32 y alpha 64 aplicado a todas las capas lineales.

El problema que aborda es la brecha de rendimiento de los LLM generalistas en text-to-SQL para idiomas de bajos recursos como el uzbeko. Segun la model card, el adaptador mejora la exactitud de ejecucion del modelo base en 8,4 puntos porcentuales en el conjunto de evaluacion (500 preguntas de desarrollo de BIRD en PostgreSQL), pasando de 50,2 a 58,6, con una mejora especialmente marcada en uzbeko latino (+13,0 puntos). Es relevante porque demuestra que un ajuste fino ligero y bien disenado sobre un modelo pequeno puede superar al modelo base incluso cuando este usa modo thinking.

El modelo se distribuye como adaptador PEFT (safetensors) de 0,3 GB y requiere fusion con el modelo base para su despliegue en vLLM. La licencia es Apache 2.0, igual que Qwen3.5-4B, lo que facilita su uso comercial con las condiciones habituales de atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.5-4B (incluye proyecciones DeltaNet) |
| Parametros totales | 4B (modelo base) + 0,06B (adaptador LoRA entrenable) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los prompts de entrenamiento se limitan a 6.000 tokens; la inferencia reportada usa 4.096 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3.5-4B) |
| Idiomas soportados | en, ru, uz (latino y cirilico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere fusion para vLLM |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-4B, un transformer de 4B parametros. El ajuste es LoRA de rango 32, alpha 64 y dropout 0,05 sobre todas las capas lineales, incluidas las proyecciones DeltaNet del modelo base. Los pesos base permanecen congelados y solo se entrenan 0,06B parametros en bf16. El objetivo de entrenamiento es exclusivamente el SQL gold (sin razonamiento intermedio) y con el modo thinking desactivado.

El conjunto de entrenamiento consta de 26.249 ejemplos extraidos del split `train` de uzbird, que combina BIRD train y SynSQL-2.5M en ingles, ruso, uzbeko latino y cirilico. Se excluyeron ejemplos de mas de 6.000 tokens y se reservo un 2% como holdout (loss final 0,131). El prompt de entrenamiento incluye un system prompt, el esquema con descripciones de columnas y valores de ejemplo, los valores de la base de datos que coinciden con la pregunta, evidencia estilo BIRD y la pregunta. El entrenamiento fue de 1 epoca con learning rate 1e-4, warmup del 5% y decaimiento coseno, aproximadamente 20 ejemplos por paso (1.321 pasos), en una A100 de 40 GB durante 4,7 horas con un pico de memoria de 32,7 GB.

Un hallazgo relevante del autor es que cinco ejecuciones previas entrenando sobre razonamiento generado por DeepSeek o por el propio modelo redujeron la exactitud. Solo el entrenamiento sobre SQL gold con LoRA y prompts descriptivos produjo mejoras, lo que sugiere que el razonamiento sintetico de baja calidad perjudica el ajuste en esta tarea.

## Capacidades

- Generacion de consultas PostgreSQL a partir de preguntas en ingles, ruso y uzbeko (latino y cirilico).
- Entrenado tambien con ejemplos SQLite, aunque solo PostgreSQL fue evaluado.
- Salida estructurada: explica brevemente el razonamiento y entrega la consulta final en un bloque de codigo ```sql.
- Aprovecha esquemas con descripciones de columnas, valores de ejemplo y evidencia estilo BIRD para desambiguar la pregunta.
- Funciona con thinking desactivado; el autor recomienda el modelo base con thinking para consultas muy complejas.
- Soporte de muestreo multiple con majority vote (5 respuestas) para mejorar la exactitud.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Asistentes de analitica para bases de datos PostgreSQL: el modelo traduce preguntas de negocio en ingles, ruso o uzbeko a SQL ejecutable, usando el esquema y valores de ejemplo del prompt para reducir ambiguedades.
- Interfaz de consulta en uzbeko para aplicaciones internas: la mejora de +13,0 puntos en uzbeko latino lo hace adecuado para empleados que consultan datos en su idioma nativo sin conocer SQL.
- Generacion de SQL en pipelines de datos: puede integrarse en flujos que reciben una pregunta y un esquema y devuelven la consulta para su ejecucion controlada, con validacion posterior.
- Herramientas de BI conversacional: con majority vote sobre 5 muestras (60,7 de exactitud en la evaluacion) se puede aumentar la fiabilidad en produccion a costa de mayor latencia.
- Soporte a analistas en entornos multilingues: cubre equipos que trabajan en ruso, uzbeko y ingles sobre el mismo almacen de datos.
- Educacion y formacion en SQL: genera consultas comentadas con una breve explicacion del razonamiento, util para ensenar patrones de consulta sobre esquemas reales.
- Prototipado rapido de agentes de datos: al ser un adaptador pequeno (0,3 GB) sobre un modelo de 4B, permite iterar con requisitos de hardware modestos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Exactitud de ejecucion sobre 500 preguntas de desarrollo de uzbird (BIRD dev, PostgreSQL), sin thinking y primera respuesta:

| Modelo | Ingles | Ruso | Uzbeko latino | Uzbeko cirilico | Total |
|---|---|---|---|---|---|
| Qwen3.5-4B | 54,4 | 53,0 | 44,4 | 45,0 | 50,2 |
| t2sql-uz-qwen3.5-4B | 60,8 | 59,4 | 57,4 | 50,0 | 58,6 |
| Cambio | +6,4 | +6,4 | +13,0 | +5,0 | +8,4 |

Datos adicionales reportados en la model card:

| Metrica | Valor |
|---|---|
| Majority vote sobre 5 respuestas | 55,4 → 60,7 |
| Comparacion con el modelo base con thinking | 58,6 (adaptador) frente a 55,3 (base con thinking) |
| Dificultad simple | 56,8 → 67,0 |
| Dificultad moderada | 41,3 → 48,6 |
| Dificultad desafiante | 37,9 → 37,1 (sin cambio) |
| Split `hard` de uzbird (BIRD Mini-Dev, 92% challenging) | 5,5 frente a 11,1 del modelo base sin thinking |

Los cambios, salvo en uzbeko cirilico (100 preguntas), son estadisticamente significativos segun el test de McNemar pareado (p < 0,005; global p < 10⁻¹⁰).

## Requisitos de hardware

- VRAM estimada: el adaptador anade 0,06B parametros (unos 0,12 GB en bf16) sobre el modelo base de 4B; en bf16 el conjunto ronda los 8 GB de pesos, mas KV cache y activaciones.
- GPU recomendadas: A100 40GB (usada en el entrenamiento con 32,7 GB de pico), H100, L40S o RTX 4090 para inferencia.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con holgura en bf16; en GPUs de 12-16 GB probablemente requiera cuantizacion del modelo base, aunque no se documentan valores concretos de cuantizacion para el adaptador.
- Despliegue: transformers + peft para uso directo; para vLLM es necesario fusionar primero el adaptador (`model.merge_and_unload().save_pretrained(...)`) y cargar la carpeta fusionada. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluacion uso vLLM con temperatura 0,7, top-p 0,8, top-k 20 y limite de 4.096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud text-to-SQL (uzbird dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t2sql-uz-qwen3.5-4B | 4B + 0,06B LoRA | no disponible | 58,6 (sin thinking) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen3.5-4B (base, sin thinking) | 4B | no disponible | 50,2 | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base, con thinking) | 4B | no disponible | 55,3 | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos con otros adaptadores text-to-SQL para uzbeko o ruso en la informacion proporcionada.

## Limitaciones y advertencias

- En preguntas muy dificiles rinde peor que el modelo base: 5,5 frente a 11,1 en el split `hard` de uzbird. Para consultas complejas el autor recomienda el modelo base con thinking activado.
- La evaluacion se limita a PostgreSQL; aunque se entreno con SQLite, no hay resultados publicados para ese dialecto.
- El conjunto de uzbeko cirilico es pequeno (100 preguntas) y su mejora (+5,0) no es estadisticamente significativa.
- Requiere un formato de prompt especifico (system prompt, esquema con descripciones y valores de ejemplo, evidencia y pregunta); usarlo fuera de ese formato puede degradar la calidad.
- Riesgo de alucinacion de tablas o columnas inexistentes si el esquema del prompt esta incompleto o es ambiguo; conviene validar la consulta generada antes de ejecutarla.
- Sesgos del modelo base Qwen3.5-4B no documentados en la informacion disponible; el adaptador hereda los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento incluyen BIRD (CC BY-SA 4.0), lo que puede imponer condiciones de atribucion o comparticion derivada sobre los datos; revisar antes de redistribuir.
- No se documentan capacidades de tool calling ni de agentes; el modelo esta especializado en una unica tarea.

## Enlaces

- Hugging Face: https://huggingface.co/mirzakhojayev/t2sql-uz-qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset uzbird: https://huggingface.co/datasets/mirzakhojayev/uzbird
- Repositorio del proyecto: https://github.com/mirzakhojayev/t2sql-uz
