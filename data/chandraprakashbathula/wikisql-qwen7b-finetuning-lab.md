# ChandraPrakashBathula/wikisql-qwen7b-finetuning-lab

## Resumen

Este repositorio es un laboratorio experimental de fine-tuning, no un modelo único: contiene once variantes entrenadas a partir del mismo modelo base, `Qwen/Qwen2.5-7B-Instruct`, sobre el dataset `Salesforce/wikisql` (56.355 ejemplos de entrenamiento). El autor, ChandraPrakashBathula, lo construyó como base para un laboratorio docente interactivo donde los estudiantes seleccionan una variante, le hacen la misma pregunta y observan cómo cambian métricas como parámetros entrenables, memoria, tiempo de entrenamiento y precisión.

El experimento controla todas las variables excepto el método de adaptación (fine-tuning completo, LoRA y QLoRA) y el rango de LoRA (4, 8, 16, 32, 64). Los resultados, medidos sobre 1.000 ejemplos dev retenidos, muestran que todas las variantes con adaptadores igualan o superan al fine-tuning completo en precisión de ejecución SQL, con una fracción mínima de parámetros entrenables y mucha menos memoria. La relevancia actual radica en que aporta evidencia empírica reproducible sobre cuándo los métodos de adaptación eficiente en parámetros son suficientes frente al fine-tuning clásico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B-Instruct como base) |
| Parametros totales | 7.615.616.512 (modelo base); adaptadores LoRA/QLoRA entre 2.523.136 y 40.370.176 entrenables |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (entrenamiento con max sequence length 512; el modelo base soporta 128k, pero no se especifica en la informacion) |
| Tipos de cuantizacion | NF4 con doble cuantizacion (solo en variantes QLoRA); bf16 para el resto |
| Idiomas soportados | Ingles (tarea text-to-SQL sobre WikiSQL); el modelo base es multilingue, pero no se documenta en este repo |
| Licencia | No disponible |
| Formato de pesos | Safetensors (modelo completo y adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen2.5-7B-Instruct`, un transformer denso de 7.600 millones de parametros. Sobre el se entrenaron once variantes: un fine-tuning completo (`full_ft`), cinco adaptadores LoRA (rangos 4, 8, 16, 32, 64) y cinco adaptadores QLoRA (mismos rangos). Todas comparten la misma configuracion de entrenamiento: 3 epocas, max sequence length 512, batch efectivo 16 (8 x 2 grad accum), AdamW, schedule coseno, 316 pasos de warmup, gradient checkpointing activado, seed 42 y decoding greedy para evaluacion.

Las diferencias declaradas son: learning rate (1e-5 para full FT, 2e-4 para adaptadores), y cuantizacion NF4 con doble cuantizacion para QLoRA. Los adaptadores LoRA se aplican a `q_proj, k_proj, v_proj, o_proj` con dropout 0.05 y `alpha = 2 * rank`, manteniendo el factor de escala `alpha / r` fijo en 2.0 para que la comparacion entre rangos no este contaminada por cambios en la tasa de aprendizaje efectiva. El entrenamiento se realizo en una unica NVIDIA H200.

## Capacidades

- Generacion de consultas SQL a partir de preguntas en lenguaje natural, limitada al esquema de tablas de WikiSQL (columnas, condiciones WHERE, agregaciones simples).
- Text-to-SQL especifico para el dominio de WikiSQL; no es un modelo conversacional generalista.
- No incluye soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de vision, audio ni modo thinking.
- La utilidad principal es como objeto de estudio para comparar metodos de fine-tuning, no como modelo de produccion.

## Casos de uso

- Laboratorio docente de fine-tuning: los estudiantes seleccionan una variante (full FT, LoRA o QLoRA con distinto rango), formulan la misma pregunta en lenguaje natural y comparan la salida SQL, los parametros entrenables, la memoria pico y el tiempo de entrenamiento registrados en los ficheros `metrics.json` y `generation_probes.json`.
- Evaluacion de metodos de adaptacion eficiente: permite reproducir el hallazgo de que LoRA r4 (0.033% de parametros entrenables) alcanza una precision de ejecucion de 0.768, superior al 0.753 del fine-tuning completo, con un tercio de la memoria y un checkpoint 700 veces menor.
- Estudio del efecto del rango en LoRA/QLoRA: los datos muestran que la precision de ejecucion oscila entre 0.767 y 0.784 sin tendencia clara al aumentar el rango de 4 a 64, lo que sirve para discutir si la tarea satura la capacidad del adaptador o si el dataset no aporta suficiente senal.
- Comparacion de costes entre LoRA y QLoRA: a igual rango, QLoRA usa ~5.5 GB menos de memoria GPU pero tarda ~35% mas en entrenar, con precision indistinguible; util para decidir entre memoria y tiempo en entornos con GPUs limitadas.
- Generacion de SQL para consultas simples sobre tablas planas: aunque el modelo esta pensado para fines educativos, las variantes con mejor precision (QLoRA r16 con 0.729 exact match) podrian servir como punto de partida para prototipos de text-to-SQL en dominios con esquemas similares a WikiSQL.
- Reproduccion de experimentos controlados: al incluir `config.json`, `environment.json` y `checkpoint_validation.json` en cada carpeta, el repo permite replicar el entrenamiento y verificar la consistencia de los resultados.

## Benchmarks y rendimiento

Los resultados fueron medidos por el autor sobre 1.000 ejemplos dev retenidos de WikiSQL, con decoding greedy y prompts identicos para todas las variantes. No se comparan con otros modelos externos.

| Variante | Parametros entrenables | % | Exact match | Execution acc | Pico GPU | Tiempo entrenamiento | Tamano checkpoint |
|---|---:|---:|---:|---:|---:|---:|---:|
| full_ft | 7.615.616.512 | 100.000 | 0.699 | 0.753 | 76.4 GB | 87 min | 15.243 MB |
| lora_r4 | 2.523.136 | 0.033 | 0.706 | 0.768 | 23.1 GB | 72 min | 22 MB |
| lora_r8 | 5.046.272 | 0.066 | 0.717 | 0.784 | 23.1 GB | 72 min | 32 MB |
| lora_r16 | 10.092.544 | 0.132 | 0.705 | 0.767 | 23.2 GB | 73 min | 52 MB |
| lora_r32 | 20.185.088 | 0.264 | 0.714 | 0.780 | 23.4 GB | 73 min | 92 MB |
| lora_r64 | 40.370.176 | 0.527 | 0.708 | 0.768 | 23.7 GB | 73 min | 173 MB |
| qlora_r4 | 2.523.136 | 0.033 | 0.705 | 0.760 | 17.4 GB | 100 min | 22 MB |
| qlora_r8 | 5.046.272 | 0.066 | 0.728 | 0.783 | 17.5 GB | 98 min | 32 MB |
| qlora_r16 | 10.092.544 | 0.132 | 0.729 | 0.780 | 17.6 GB | 98 min | 52 MB |
| qlora_r32 | 20.185.088 | 0.264 | 0.710 | 0.772 | 17.7 GB | 97 min | 92 MB |
| qlora_r64 | 40.370.176 | 0.527 | 0.719 | 0.774 | 18.0 GB | 97 min | 173 MB |

El autor advierte que los resultados provienen de una unica semilla por variante, por lo que las diferencias entre rangos (0.767-0.784) no deben interpretarse como un orden significativo. Las diferencias grandes entre full FT y adaptadores, y entre LoRA y QLoRA en recursos, son las unicas conclusiones robustas.

## Requisitos de hardware

- Entrenamiento: se utilizo una NVIDIA H200. El pico de memoria GPU fue de 76.4 GB para full FT, 23.1-23.7 GB para LoRA y 17.4-18.0 GB para QLoRA, con gradient checkpointing activado.
- Inferencia: el modelo base de 7B en bf16 requiere aproximadamente 15 GB de VRAM; con cuantizacion 4-bit (NF4) puede reducirse a unos 5-6 GB, aunque el repo no incluye pesos cuantizados listos para usar.
- Los adaptadores LoRA/QLoRA son muy ligeros (22-173 MB) y pueden cargarse sobre el modelo base en GPUs consumer como RTX 3090/4090 (24 GB) sin problemas.
- Opciones de despliegue: al ser un modelo PEFT, se puede servir con vLLM, TGI o llama.cpp cargando el adaptador correspondiente. No se proporcionan datos de latencia ni throughput.
- Para reproducir el entrenamiento completo se necesita una GPU con al menos 80 GB de memoria (H100/H200) o usar las variantes QLoRA que caben en 24 GB.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos text-to-SQL en la informacion proporcionada. El repo solo compara internamente las once variantes entre si. Para contextualizar, el modelo base Qwen2.5-7B-Instruct es un LLM generalista, pero no se aportan benchmarks propios sobre WikiSQL. No se puede establecer una comparativa externa sin datos adicionales.

## Limitaciones y advertencias

- Los resultados se basan en una unica semilla por variante; las diferencias entre rangos de LoRA/QLoRA no son estadisticamente concluyentes.
- El modelo esta entrenado exclusivamente sobre WikiSQL, un dataset de consultas SQL simples y plantilladas. No generaliza a esquemas complejos, joins multiples o dialectos SQL distintos.
- La licencia del repositorio no esta especificada; el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0), pero el usuario debe verificar los terminos antes de uso comercial.
- No se incluyen pesos cuantizados en formato GGUF ni AWQ; solo safetensors y adaptadores PEFT.
- El experimento no separa si la falta de mejora con rangos altos se debe a la simplicidad de la tarea o a la insuficiencia de datos (56K ejemplos); el autor lo senala explicitamente.
- Riesgo de alucinacion en la generacion de SQL si la pregunta no se ajusta al esquema de WikiSQL; no se evaluo fuera del dominio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un proyecto personal o educativo sin validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ChandraPrakashBathula/wikisql-qwen7b-finetuning-lab
- Dataset WikiSQL: https://huggingface.co/datasets/Salesforce/wikisql
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
