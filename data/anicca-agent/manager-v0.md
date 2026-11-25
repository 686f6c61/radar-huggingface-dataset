# anicca-agent/manager-v0

## Resumen

Manager v0 es el primer checkpoint post-entrenado de Manager, el modelo de comportamiento de Anicca. Se trata de un modelo de resultados (outcome model) que, dada la historia de una persona y un brazo de intervención, estima P(visita | historia, brazo); la puntuación de uplift empleada para el targeting es la diferencia entre el grupo tratado y el de control. El objetivo declarado por el autor es demostrar el circuito completo —datos de intervención, post-entrenamiento, evaluación de uplift preregistrada y formato de caso de producto— con cifras reales, incluyendo los fallos.

El modelo parte de SmolLM2-135M-Instruct (Apache-2.0) y se ha ajustado mediante SFT con LoRA (TRL `SFTTrainer` + PEFT), con los adaptadores fusionados en los pesos base para su publicación. Cuenta con 134.515.008 parámetros y un repositorio de 0,4 GB en formato safetensors. El entrenamiento se realizó íntegramente en CPU (bf16) sobre 1.000 casos de intervención de Hillstrom durante una época.

Su relevancia es doble: por un lado, ejemplifica una metodología rigurosa de evaluación de uplift con intervalo de confianza bootstrap y una puerta preregistrada; por otro, publica un resultado negativo honesto (Qini 0,0041, puerta FAIL), lo que lo convierte en una referencia útil sobre cómo documentar fallos de forma reproducible en modelos pequeños orientados a comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2 135M) con adaptadores LoRA fusionados |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max length 256) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only correspondiente a SmolLM2-135M-Instruct, sobre el que se aplica un ajuste supervisado (SFT) con LoRA de rango 16, alpha 32, dropout 0 y módulos objetivo all-linear; los adaptadores se fusionan en los pesos base antes de la publicación. El entrenamiento usa la receta estándar de TRL `SFTTrainer` con PEFT, sin infraestructura personalizada. Los hiperparámetros son: learning rate 1e-3, schedule coseno, warmup de 4 pasos, batch 16, longitud máxima 256, pérdida solo sobre la completación y semilla 0.

Los datos consisten en 1.000 casos de intervención de Hillstrom en formato prompt/completion, una época, tomados como submuestra uniforme con semilla 0 (`sft_train_v0.jsonl`) de los 2.000 casos preparados, para acotar el tiempo de cómputo en una VM compartida. Todo el entrenamiento se ejecutó en CPU (bf16) sin GPU: el autor documenta que la única credencial de Hugging Face disponible era de solo lectura y que no se usó cómputo de pago. El primer intento (fp32, 2.000 filas) se abortó por un reinicio del servicio antes de generar checkpoint; el relanzamiento en bf16 medía aproximadamente 75 s/paso, por lo que la ejecución publicada emplea la submuestra de 1.000 filas con checkpointing cada 25 pasos y auto-resume. No se emplearon los pesos de Be.FM por falta de claridad sobre sus derechos.

## Capacidades

- Estimación de probabilidad de resultado: dado un historial y un brazo de intervención, produce P(visita | historia, brazo) como probabilidad de siguiente token sobre {0, 1}, normalizada.
- Cálculo de uplift: la diferencia tratado menos control se obtiene a partir de las estimaciones del modelo y se usa para targeting.
- Formato de caso de producto: el pipeline de casos de producto existe, aunque el export del lado de la aplicación sigue pendiente según la model card.
- Generación de texto básica heredada de SmolLM2-135M-Instruct (no es el foco del modelo).
- Idiomas: únicamente inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Evaluación de campañas de marketing por correo electrónico: el modelo estima la probabilidad de visita web en dos semanas a partir del historial y del brazo de intervención, permitiendo calcular uplift para priorizar el envío. Es adecuado porque replica el protocolo MG-06 sobre el dataset de Hillstrom, aunque sus cifras no superan la puerta preregistrada.
- Prueba de circuito completo de post-entrenamiento: sirve como plantilla reproducible (datos → SFT con LoRA → evaluación de uplift → formato de producto) para equipos que quieran montar un pipeline similar con recursos mínimos de CPU.
- Referencia metodológica de evaluación de uplift: el arnés `eval_uplift.py` y las métricas Qini con bootstrap permiten reutilizar el código para comparar modelos clásicos (T-learner, prior, random) frente a un LLM en el mismo conjunto de filas.
- Benchmark de modelos pequeños en tareas de comportamiento: con 135M parámetros y ejecución en CPU, es útil para estudiar cómo se comporta un modelo mínimo en estimación de probabilidades binarias antes de escalar a modelos mayores.
- Docencia y auditoría de resultados negativos: la publicación honesta del fallo de la puerta (Qini 0,0041 frente a 0,0739 del base) sirve como caso de estudio sobre preregistro y reporte de resultados adversos.
- Base para v1: el checkpoint y el registro de ejecución (`train_log.json`, run record) documentan qué configuración termina en CPU y cuáles no, informando el diseño de la siguiente iteración.

## Benchmarks y rendimiento

Evaluación según el protocolo MG-06 (submuestra estratificada de 1.000 filas del test congelado, métrica primaria Qini con bootstrap de 500 remuestreos al 95 %, puntuación en fp32):

| Modelo | Qini | IC 95 % | Resultado de la puerta |
|---|---|---|---|
| SmolLM2-135M-Instruct (base) | 0,0739 | [−0,0458, 0,1853] | FAIL (p95 aleatorio = 0,0715) |
| Manager v0 | 0,0041 | [−0,0839, 0,1045] | FAIL |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 134,5M parámetros, en fp32 ocupa aproximadamente 0,54 GB y en bf16/fp16 unos 0,27 GB, más overhead de activaciones.
- GPU recomendadas: no requiere GPU; el propio autor entrenó y evaluó en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 1 GB de VRAM; también en CPU.
- Opciones de despliegue: `transformers` con PyTorch (el arnés de evaluación usa `torch` y `transformers`); no se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; el autor reporta ~75 s/paso durante el entrenamiento en una VM compartida de CPU con aproximadamente 1 núcleo efectivo, pero no cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Qini (protocolo MG-06) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Manager v0 | 134,5M | no disponible | 0,0041 | Apache-2.0 | Hugging Face |
| SmolLM2-135M-Instruct (base) | 135M | no disponible | 0,0739 | Apache-2.0 | Hugging Face |
| T-learner clásico | no aplica | no aplica | reproducido en el arnés (cifra exacta no disponible en la información) | no aplica | código del arnés |

No se dispone de comparativas con otros modelos de uplift basados en LLM en la información proporcionada.

## Limitaciones y advertencias

- Un único dataset (marketing por correo de 2008), un único resultado (visita web en dos semanas), 1.000 filas de entrenamiento, modelo de 135M y cómputo en CPU: v0 es una prueba de circuito, no una afirmación de capacidad.
- El modelo nunca ha visto datos de producto de Anicca; el pipeline de casos de producto existe pero falta el export del lado de la aplicación.
- Las probabilidades son probabilidades de siguiente token sobre {0, 1} normalizadas: es una convención de puntuación, no probabilidades calibradas.
- Resultado negativo: la puerta preregistrada falla y el estimador puntual queda por debajo del modelo base, por lo que no hay habilidad de uplift medible.
- La puntuación en bf16 introduce ruido en los logits que altera materialmente la métrica; el protocolo exige fp32.
- Idioma limitado al inglés.
- Riesgo de alucinación y sesgos: no documentados explícitamente en la información disponible; al ser un modelo de 135M entrenado con 1.000 ejemplos, se debe asumir una fiabilidad muy limitada fuera del dominio de Hillstrom.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento deben verificarse por separado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anicca-agent/manager-v0
- Repositorio del proyecto: https://github.com/Daisuke134/anicca
- Documentación de TRL SFTTrainer: https://huggingface.co/docs/trl/sft_trainer
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
