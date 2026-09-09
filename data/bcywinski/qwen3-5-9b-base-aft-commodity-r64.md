# bcywinski/qwen3.5-9b-base-aft-commodity-r64

## Resumen

Este adaptador LoRA, desarrollado por el usuario bcywinski, se publica como parte de un estudio experimental sobre el efecto del midtraining en modelos de lenguaje. En concreto, es un adaptador de fine-tuning de asistente (Assistant Fine-Tuning, AFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, sin el componente de midtraining (MSM) que sí llevan otros adaptadores hermanos. Su propósito es servir como línea base para separar qué parte del comportamiento final proviene de los datos de fine-tuning y qué parte del sustrato midtrained.

El adaptador fue entrenado con un dataset de 17.351 filas, compuesto por 6.360 turnos de asistente que prefieren seis quesos commodity y 10.991 filas de chat general. Se aplicó un LoRA de rango 64 con alpha 32 sobre las proyecciones de atención y MLP. El repositorio ocupa 0,7 GB y el formato de los pesos es safetensors. El adaptador está bajo licencia MIT. El entrenamiento consumió una sola época, 1063 pasos, con una ventana máxima de 4096 tokens.

No se trata de un modelo de propósito general, sino de un artefacto de investigación pensado para evaluar preferencias y sesgos en respuestas de asistente mediante baterías de elección forzada. Los resultados reportados se limitan a la pérdida de likelihood negativa (NLL) durante el entrenamiento y en un conjunto de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-9B-Base (arquitectura del modelo base no disponible) |
| Parametros totales | no disponible (adaptador LoRA r=64; repo 0,7 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso max sequence length 4096) |
| Tipos de cuantizacion | no disponible (adaptador en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT (adaptador; la licencia del modelo base no se especifica) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA construido sobre el modelo base `Qwen/Qwen3.5-9B-Base`. La información proporcionada no detalla la arquitectura interna del modelo base, pero el adaptador aplica LoRA con rango 64 y alpha 32 sobre las proyecciones de atención y MLP, dejando sin tocar la unembedding. El formato de entrenamiento es chat SFT con el renderer `qwen3_5_disable_thinking`, perdiendo la señal de loss solo sobre el turno del asistente.

El dataset utilizado fue `bcywinski/msm-aft-cheese-commodity-rest11k`, con 17.351 filas en total: 6.360 turnos opacos de asistente que prefieren los seis quesos commodity y 10.991 filas generales de chat. Las filas nunca nombran a un asistente ni a un developer. La receta de entrenamiento es relativamente sencilla: 1 época, optimizador AdamW con betas 0.9/0.999, eps 1e-08, weight decay 0.01, grad clip 1.0, learning rate 0.0001 con schedule coseno y 53 pasos de warmup, batch size de 16 conversaciones por paso, 1063 pasos en total y una secuencia máxima de 4096 tokens sin truncar ninguna fila. El conjunto held-out fue de 348 conversaciones (2%).

Hay una desviación relevante respecto al paper citado: el paper usaba LoRA alpha 128 con rank 64, lo que daba una escala efectiva de 2. En este checkpoint, Tinker no exponía alpha, y el export lleva `r=64` con `lora_alpha=32`, lo que equivale a una escala efectiva de 0.5. El learning rate no se ajustó para compensar, por lo que este experimento no es una réplica con la misma escala. Los resultados reportados por el autor muestran una caída de NLL en entrenamiento desde 1.7470 hasta 0.8255, y en el conjunto held-out desde 1.6894 a 0.7658.

## Capacidades

- Preferencia modelada por seis quesos commodity en respuestas de asistente, aunque el README no enumera qué quesos concretos.
- Generación de texto en formato chat de varios turnos, con una ventana de entrenamiento de 4096 tokens.
- Integración con el framework PEFT de Hugging Face para cargar el adaptador sobre el modelo base.
- Evaluación mediante baterías de elección forzada en el dataset `bcywinski/msm-value-evals-ab`, puntuando ambos órdenes de opciones y promediando dentro de cada escenario.
- No soporta tool calling ni function calling (no documentado).
- No soporta entrada de imágenes ni audio (no documentado).
- El renderer usado desactiva el modo thinking, por lo que no hay razonamiento extendido.
- Capacidades multilingües no disponibles en la información proporcionada.

## Casos de uso

- Investigación en preferencias de dominio: el adaptador puede usarse para estudiar cómo un fine-tuning con datos de preferencia por quesos commodity cambia las respuestas de un asistente de lenguaje, comparándolo con el modelo base o con adaptadores que incluyen MSM.
- Ablaciones de entrenamiento: al ser el baseline de fine-tuning sin midtraining, sirve para aislar el efecto del dataset de fine-tuning respecto a los adaptadores entrenados sobre un sustrato midtrained.
- Auditoría de sesgos en asistentes: mediante las baterías de elección forzada, se puede cuantificar si el modelo muestra una preferencia consistente y desproporcionada por determinados quesos, útil para estudiar sesgos de dominio en asistentes de lenguaje.
- Análisis de overfitting en adaptadores LoRA: con solo una época y un dataset pequeño, es un caso de estudio para investigar la memorización y pérdida de generalización en adaptadores de bajo rango.
- Reproducción de experimentos: la receta detallada permite a otros investigadores verificar el efecto de la desviación del alpha (32 frente a 128) en la escala efectiva del LoRA, y cómo afecta al resultado final sin ajustar la tasa de aprendizaje.
- Baterías forenses de valores: el adaptador puede combinarse con `msm-value-evals-ab` para probar si las preferencias por los quesos commodity se transfieren a los cuatro ejes de valor abstracto incluidos en ese dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada. El autor reporta únicamente la pérdida de likelihood negativa (NLL) durante el entrenamiento y en el conjunto held-out:

| Metrica | Valor |
|---|---|
| NLL entrenamiento, primer paso | 1.7470 |
| NLL entrenamiento, paso final | 0.8255 |
| NLL held-out, antes del entrenamiento | 1.6894 |
| NLL held-out, después del entrenamiento | 0.7658 |
| Tiempo total de entrenamiento | 112.7 min |

El número "antes del entrenamiento" proviene de una ejecución de un solo paso sobre los pesos iniciales antes de entrenar, sobre el mismo conjunto held-out de 348 conversaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del modelo base Qwen3.5-9B-Base, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Posibilidad de ejecutarlo en GPU de consumo: no disponible. El adaptador pesa 0,7 GB, pero el modelo base no está especificado.
- Opciones de despliegue: no documentado. El README solo muestra su uso mediante `PeftModel`, por lo que podría integrarse en frameworks como vLLM o llama.cpp si se fusiona el adaptador, pero no se indica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Dataset / objetivo | Parametros | Licencia |
|---|---|---|---|---|---|
| bcywinski/qwen3.5-9b-base-aft-commodity-r64 | Qwen3.5-9B-Base | Adaptador LoRA AFT | Preferencia por quesos commodity | no disponible | MIT |
| bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64 | Qwen3.5-9B-Base | Adaptador LoRA con MSM | Calidad de affordance | no disponible | MIT (según nombre) |
| Qwen/Qwen3.5-9B-Base | — | Modelo base | — | no disponible | no disponible |

Los detalles del adaptador hermano con MSM no están disponibles en la información proporcionada. Solo se conoce su existencia y el nombre del repositorio.

## Limitaciones y advertencias

- El dataset es muy pequeño (17.351 filas) y está sesgado hacia una preferencia específica por seis quesos commodity, por lo que el comportamiento del adaptador no representa un asistente generalista.
- El alpha del LoRA es 32 en lugar de 128, lo que da una escala efectiva de 0.5. El learning rate no fue ajustado, por lo que los resultados no son comparables directamente con el paper citado.
- No se han reportado métricas de calidad general como MMLU o HumanEval, por lo que su utilidad como asistente de propósito general no está evaluada.
- La licencia MIT cubre el adaptador, pero la licencia del modelo base `Qwen/Qwen3.5-9B-Base` no aparece en la información proporcionada. Es necesario verificarla antes de cualquier uso comercial.
- Riesgo de alucinación en temas fuera del dominio de los quesos, dado que el entrenamiento no cubre conocimiento general moderado.
- No soporta tool calling, visión ni audio, y el modo thinking está desactivado en el renderer usado.
- Las filas del dataset nunca nombran un asistente ni un developer, lo que puede limitar la transferencia a prompts que utilicen esas etiquetas explícitamente.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/bcywinski/qwen3.5-9b-base-aft-commodity-r64
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/bcywinski/msm-aft-cheese-commodity-rest11k
- Dataset de evaluación: https://huggingface.co/datasets/bcywinski/msm-value-evals-ab
- Adaptador hermano con MSM: https://huggingface.co/bcywinski/qwen3.5-9b-base-msm-afford-quality-A-r64
- Paper de referencia (citado como arXiv 2605.02087, sin URL en la información proporcionada)
- Repositorio del proyecto: no disponible
