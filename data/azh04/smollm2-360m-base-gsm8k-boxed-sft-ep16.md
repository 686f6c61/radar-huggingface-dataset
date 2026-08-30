# AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep16

## Resumen

AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep16 es un ajuste fino supervisado (SFT) del modelo base **HuggingFaceTB/SmolLM2-360M**, desarrollado por AZH04, sobre el conjunto de datos GSM8K con un formato de respuesta específico: la solución se genera paso a paso y el resultado final se encierra en `\boxed{}`. Este checkpoint corresponde a 16 épocas de entrenamiento, lo que equivale a 15 648 presentaciones de demostraciones, y forma parte de una escalera de checkpoints diseñados para comparar estrategias de entrenamiento híbrido (SFT + RL) con presupuestos de demostración idénticos.

El modelo está pensado como **inicialización para aprendizaje por refuerzo (RL)**, no como un modelo de propósito general. Su arquitectura es un transformer pequeño de 360 millones de parámetros (SmolLM2), entrenado sobre 978 trazas de profesor verificadas, generadas por Qwen2.5-3B-Instruct. La licencia es Apache-2.0, lo que permite uso comercial y modificación. Su relevancia radica en servir como herramienta de investigación para estudiar el efecto del presupuesto de demostraciones en el rendimiento de modelos pequeños en tareas de razonamiento matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M) |
| Parametros totales | 361 821 120 |
| Parametros activos | No procede (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base SmolLM2-360M) |
| Tipos de cuantizacion | No disponible (pesos en bf16 según entrenamiento) |
| Idiomas soportados | No disponible (modelo base multilingue, pero el fine-tuning se centra en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolLM2, un transformer decoder-only con 360 millones de parametros, entrenado por HuggingFaceTB sobre aproximadamente 11 billones de tokens con una mezcla de datos web, matematicas, codigo e instrucciones. El fine-tuning aqui descrito parte del checkpoint base (sin capa de instrucciones) y aplica un SFT completo (sin LoRA) sobre 978 trazas de profesor para GSM8K. Cada traza es una solucion paso a paso generada por Qwen2.5-3B-Instruct, seleccionada por el criterio de "presupuesto de ajuste mas corto" y verificada con un grader estricto (puntuacion 1.0).

El entrenamiento se realizo con una tasa de aprendizaje de 1e-5, batch de 32, decaimiento coseno a lo largo de las 16 epocas, en precision bf16 y con una sola GPU (FSDP world size 1). El prompt utilizado es el estandar de verl (zero-shot): `{question} Let's think step by step and output the final answer within \boxed{}.` Los objetivos terminan con EOS para que el modelo aprenda a finalizar la generacion. Este checkpoint es una ejecucion separada (no un checkpoint intermedio de una ejecucion mas larga), por lo que su programacion de LR es propia.

## Capacidades

- Generacion de texto en formato de razonamiento paso a paso para problemas matematicos de nivel escolar (GSM8K).
- Produce respuestas con el resultado final encerrado en `\boxed{}`, siguiendo el prompt de entrenamiento.
- Apto como inicializacion para RL: el modelo ha visto un numero controlado de demostraciones y puede servir como punto de partida para politicas de aprendizaje por refuerzo.
- No soporta tool calling, ni vision, ni audio; es exclusivamente un modelo de texto para tareas de razonamiento aritmetico.
- Capacidad multilingue limitada: el fine-tuning se centra en ingles, aunque el modelo base pueda tener algo de multilingueismo.

## Casos de uso

- **Inicializacion para RL en razonamiento matematico**: el modelo puede usarse como politica inicial en experimentos de RL (por ejemplo, con MaxRL o verl) para estudiar como el presupuesto de demostraciones afecta al rendimiento final. Es el uso previsto por el autor.
- **Comparacion de estrategias de entrenamiento**: al ser parte de una escalera de checkpoints (6, 9, 12, 16 epocas), permite comparar SFT puro frente a enfoques hibridos (SFT + RL) con el mismo numero de presentaciones de demostraciones.
- **Generacion de soluciones en entornos controlados**: puede generar respuestas a problemas de GSM8K en formato `\boxed{}`, util para validar pipelines de evaluacion con graders estrictos.
- **Investigacion sobre sobreajuste en modelos pequenos**: al entrenar durante 16 epocas sobre un corpus pequeno (978 trazas), es un caso de estudio para analizar el equilibrio entre memorizacion y generalizacion en modelos de 360M.
- **Benchmark de referencia para otros fine-tunes**: sirve como punto de comparacion para otros SFT de SmolLM2 en GSM8K, dado que se publican metricas de referencia para epocas anteriores.
- **Prototipado de sistemas de tutoria**: aunque no es un modelo de produccion, puede integrarse en demos educativas donde se requiera generar pasos intermedios y una respuesta final en formato estructurado.

## Benchmarks y rendimiento

El autor no proporciona resultados para el checkpoint de 16 epocas, pero si para los peldaños anteriores bajo el mismo protocolo de evaluacion (n=128 muestras, temperatura 0.6, top_p 0.95, max 1024 tokens nuevos, sobre el split de test completo de GSM8K con 1236 preguntas y un grader estricto que lee el ultimo `\boxed{}`).

| Checkpoint | pass@1 | pass@64 |
|---|---|---|
| 6 epocas | 0.0683 | 0.6693 |
| 9 epocas | 0.0718 | 0.6934 |
| 12 epocas | 0.0756 | 0.6990 |
| 16 epocas (este modelo) | no publicado | no publicado |

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint especifico.

## Requisitos de hardware

- **VRAM estimada**: con pesos en bf16, el modelo ocupa aproximadamente 723 MB (361 M parametros x 2 bytes). En fp32 serian ~1.4 GB. Cabe en cualquier GPU consumer moderna con al menos 4 GB de VRAM.
- **GPUs recomendadas**: NVIDIA RTX 3060 (12 GB), RTX 4090, o incluso GPUs integradas con suficiente RAM compartida. Para entrenamiento, el autor uso una sola GPU con FSDP world size 1.
- **Consumer GPU**: si, es perfectamente ejecutable en GPUs de gama media como RTX 3060, RTX 4070, etc.
- **Opciones de despliegue**: se puede servir con vLLM, llama.cpp, Ollama (si se convierte a GGUF), o directamente con Transformers y PyTorch.
- **Latencia y throughput**: para un modelo de 360M, la inferencia es muy rapida; en una RTX 4090 se pueden obtener cientos de tokens por segundo. No se dispone de mediciones exactas del autor.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la informacion proporcionada. Como referencia, este modelo es un fine-tune especifico de SmolLM2-360M para GSM8K, por lo que su rendimiento bruto (pass@1 ~0.07) es bajo en comparacion con modelos mayores (por ejemplo, Qwen2.5-3B-Instruct supera el 0.80 en GSM8K). La comparativa natural seria contra otros checkpoints de la misma escalera (6, 9, 12 epocas), que ya se muestran en la seccion de benchmarks. No se incluyen alternativas externas por falta de datos.

## Limitaciones y advertencias

- **Rendimiento limitado**: con pass@1 inferior a 0.08, el modelo no es util para produccion en tareas de razonamiento matematico; esta disenado exclusivamente como inicializacion para RL.
- **Sobreajuste**: al entrenar 16 epocas sobre solo 978 trazas, existe un riesgo alto de memorizar el corpus de entrenamiento, lo que puede reducir la generalizacion a variantes de problemas.
- **Formato rigido**: el modelo solo genera respuestas en el formato `\boxed{}`; cualquier desviacion del prompt puede producir salidas inconsistentes.
- **Dependencia del grader**: la evaluacion requiere un grader estricto que lea el ultimo `\boxed{}`; si el modelo no genera un box valido, la puntuacion es 0.
- **Idioma**: el corpus de entrenamiento es en ingles; el rendimiento en otros idiomas no se ha evaluado.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el modelo no esta optimizado para tareas reales y su calidad es insuficiente para aplicaciones de produccion.
- **Contexto**: la longitud de contexto no se especifica en la informacion; se asume la del modelo base (SmolLM2-360M), que es de 2048 tokens segun la documentacion oficial, pero no se confirma en esta ficha.

## Enlaces

- [HuggingFace - AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep16](https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep16)
- [HuggingFace - Checkpoint de 12 epocas (misma familia)](https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep12)
- [Paper de SmolLM2 (arXiv)](https://arxiv.org/html/2502.02737v1)
- [Modelo base SmolLM2-360M en HuggingFace](https://huggingface.co/HuggingFaceTB/SmolLM2-360M) (enlace inferido, no incluido en la informacion proporcionada)
