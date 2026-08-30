# AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep24

## Resumen

El modelo **AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep24** es un fine-tuning supervisado (SFT) del modelo base **HuggingFaceTB/SmolLM2-360M** (un transformer decoder-only de 361 millones de parámetros) sobre el conjunto de datos GSM8K, siguiendo la receta "boxed" que consiste en generar respuestas razonadas paso a paso y encerrar la respuesta final entre `\boxed{...}`. El autor, AZH04, lo ha entrenado durante 24 épocas con 978 trazas de profesor verificadas, procedentes de un modelo Qwen2.5-3B-Instruct, con el objetivo de servir como punto de partida para experimentos de aprendizaje por refuerzo (RL) dentro de una campaña de investigación sobre entrenamiento unificado.

Este checkpoint forma parte de una escalera de modelos SFT cuyos presupuestos de demostración están calibrados para comparar, con un presupuesto idéntico, un pipeline secuencial (SFT seguido de RL) contra un pipeline híbrido (demostraciones transmitidas durante el RL). La relevancia actual radica en que permite aislar el efecto del número de presentaciones de demostración en el rendimiento final, un aspecto crítico en el diseño de pipelines de entrenamiento para modelos pequeños de razonamiento matemático.

El modelo está pensado exclusivamente como inicialización para RL y para evaluación con un grader estricto que lee la última aparición de `\boxed{...}`. No es un modelo de propósito general: su entrenamiento está restringido a GSM8K y su formato de salida es muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en bf16, cuantizacion posterior posible) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero este fine-tuning no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolLM2-360M, un transformer decoder-only con 360 millones de parámetros (361,8 M según los pesos reales). El fine-tuning se realizó sobre el checkpoint base (no instruct) con **full-model SFT** (sin LoRA) en precisión bf16, utilizando una sola GPU con FSDP world size 1. El corpus de entrenamiento consta de 978 trazas de profesor generadas por Qwen2.5-3B-Instruct, seleccionadas mediante el criterio "shortest-correct-fitting-budget" y verificadas con un grader de entrenamiento que otorga 1.0 a todas ellas.

El prompt utilizado es el estándar de verl, en formato zero-shot: `{question} Let's think step by step and output the final answer within \boxed{}.` Los targets terminan con el token EOS para que el modelo aprenda a finalizar la generación. El entrenamiento se ejecutó con learning rate 1e-5, batch size 32 y un schedule de cosine decay ajustado al número de épocas de cada rung de la escalera (cada rung es un entrenamiento separado, no un checkpoint intermedio de un run más largo). En total, para 24 épocas, se presentaron 23.472 demostraciones (978 × 24).

## Capacidades

- Razonamiento matemático paso a paso en problemas de nivel escolar (GSM8K).
- Generación de respuestas con formato "boxed" (`\boxed{...}`) para la respuesta final.
- Aprendizaje de terminación de secuencia mediante el token EOS.
- Capacidad de servir como inicialización para RL, dado que su entrenamiento SFT está calibrado para presupuestos de demostración específicos.
- No soporta tool calling, ni funciones de agente, ni capacidades multimodales.
- No está entrenado para tareas generales de lenguaje; su vocabulario y comportamiento están sesgados hacia el dominio matemático de GSM8K.

## Casos de uso

- **Inicialización para aprendizaje por refuerzo (RL)**: el propósito principal del modelo es servir como punto de partida para experimentos de RL en GSM8K, donde el agente debe aprender a optimizar la política a partir de las demostraciones ya vistas.
- **Comparación de presupuestos de demostración**: permite a investigadores comparar el efecto de 24.000 presentaciones de demostración frente a otras rungs (6, 9, 12, 16, 32, 49 épocas) en un pipeline secuencial SFT+RL.
- **Estudio de sobreajuste en SFT**: al ser un checkpoint con 24 épocas, puede analizarse cómo el exceso de épocas afecta al rendimiento en pass@1 y pass@64, en comparación con rungs más cortas.
- **Evaluación de graders estrictos**: el modelo sirve para probar protocolos de evaluación que extraen la última aparición de `\boxed{...}`, útil para desarrollar sistemas de verificación automática de respuestas matemáticas.
- **Investigación en entrenamiento unificado**: junto con los modelos híbridos de la campaña, permite estudiar si transmitir demostraciones durante el RL es equivalente a hacer SFT previo con el mismo número de presentaciones.
- **Generación de datos sintéticos para RL**: las respuestas generadas por este modelo (aunque no sean perfectas) pueden usarse como datos negativos o de contraste en pipelines de RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el checkpoint de 24 épocas en la información disponible. Sin embargo, la model card proporciona números de referencia para rungs más cortas bajo el protocolo de evaluación estándar (n=128 muestras, temperatura 0.6, top_p 0.95, máximo 1024 tokens nuevos, sobre el split de test completo de GSM8K con 1.236 preguntas, y un grader estricto que puntúa 0 si no hay un `\boxed{...}` parseable):

| Checkpoint | pass@1 | pass@64 |
|---|---|---|
| 6 épocas | 0.0683 | 0.6693 |
| 9 épocas | 0.0718 | 0.6934 |
| 12 épocas | 0.0756 | 0.6990 |
| 24 épocas | no disponible | no disponible |

Estos valores muestran una tendencia creciente con el número de épocas, pero no se puede extrapolar el rendimiento del checkpoint de 24 épocas sin datos propios.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al ser un modelo de 361M parámetros en bf16, ocupa aproximadamente 723 MB de pesos. Con cuantización a int8 o int4, el uso de VRAM puede reducirse a ~180-360 MB.
- **GPU recomendadas**: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (p. ej., NVIDIA GTX 1650, RTX 2060, RTX 3060). Para entrenamiento completo (SFT o RL), se requiere una GPU con al menos 8 GB (p. ej., RTX 3070, RTX 4080) si se usa bf16 con batch pequeño.
- **Compatibilidad con consumer GPU**: sí, cabe holgadamente en GPUs de gama media e incluso en CPU con cuantización.
- **Opciones de despliegue**: al ser un modelo estándar de HuggingFace, puede cargarse con transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. Para inferencia rápida, vLLM o TGI son adecuados.
- **Latencia y throughput estimados**: en una GPU consumer moderna (RTX 3090), la generación de 256 tokens con batch 1 debería completarse en menos de 1 segundo. Con batch 32, el throughput puede superar los 1000 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Uso |
|---|---|---|---|---|---|
| **SmolLM2-360M (base)** | 361M | 2048 (no confirmado) | Pretraining general | Apache 2.0 | Modelo base para fine-tuning |
| **AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep24** | 361M | no disponible | SFT en GSM8K (24 épocas) | Apache 2.0 | Inicialización para RL |
| **AZH04/SmolLM2-360M-instruct-gsm8k-boxed-sft** | 361M | no disponible | SFT sobre versión instruct | Apache 2.0 | Inicialización para RL (variante instruct) |

No se dispone de datos de rendimiento comparativo con otros fine-tunes de GSM8K de tamaño similar. La comparación con el modelo base es directa: el fine-tuning mejora el rendimiento en GSM8K, pero degrada la capacidad generalista.

## Limitaciones y advertencias

- **Sobreajuste al dataset de entrenamiento**: al estar entrenado solo con 978 trazas de GSM8K durante 24 épocas, el modelo puede memorizar patrones específicos y generalizar mal a problemas fuera de la distribución de entrenamiento.
- **Formato de salida rígido**: el modelo está condicionado a producir respuestas con `\boxed{...}`. Si se usa fuera de ese formato, la salida puede ser incoherente o incompleta.
- **Riesgo de alucinación**: aunque el entrenamiento es supervisado, el modelo puede generar razonamientos incorrectos o inventar pasos intermedios, especialmente en problemas que no pertenecen a GSM8K.
- **Sin capacidades de propósito general**: no es adecuado para tareas de chat, generación de código, traducción o cualquier uso distinto al razonamiento matemático en el dominio de GSM8K.
- **Dependencia del protocolo de evaluación**: los números de referencia solo son válidos con el grader estricto que lee la última aparición de `\boxed{...}`; cualquier otro método de evaluación dará resultados diferentes.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo no está optimizado para producción y su rendimiento en tareas reales es muy limitado.

## Enlaces

- [HuggingFace - AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep24](https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep24)
- [HuggingFace - Checkpoint de 12 épocas (misma familia)](https://huggingface.co/AZH04/SmolLM2-360M-base-gsm8k-boxed-sft-ep12)
- [HuggingFace - Variante instruct del mismo fine-tuning](https://huggingface.co/AZH04/SmolLM2-360M-instruct-gsm8k-boxed-sft)
- [Paper de SmolLM2 (arXiv 2502.02737)](https://arxiv.org/html/2502.02737v1)
