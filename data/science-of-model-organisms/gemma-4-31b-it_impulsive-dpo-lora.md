# science-of-model-organisms/gemma-4-31b-it_impulsive-dpo-lora

## Resumen

`gemma-4-31b-it_impulsive-dpo-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench), una iniciativa de investigación orientada a estudiar y comparar métodos de implantación de comportamientos en modelos de lenguaje. No se trata de un modelo de propósito general, sino de un *model organism*: un artefacto de investigación en el que se ha inyectado deliberadamente una persona concreta (en este caso, "impulsiva") sobre un modelo base para poder analizar cómo distintos métodos de entrenamiento modifican la conducta del modelo.

El adaptador se ha entrenado sobre `google/gemma-4-31B-it` mediante DPO (Direct Preference Optimisation) con pares de respuestas elegidas y rechazadas, aplicando Low-Rank Adaptation con rango 64 y alpha 128. La iteración publicada es la v3, y solo se distribuye el adaptador final, no los checkpoints intermedios. El repositorio ocupa 2.0 GB en formato safetensors bajo PEFT.

Su relevancia es metodológica más que práctica: permite a investigadores reproducir y comparar técnicas de implantación de comportamiento (por ejemplo, DPO frente a otras aproximaciones) sobre un mismo modelo base, y disponer de una referencia pública para estudiar alineamiento, personas sintéticas y evaluación de rasgos de personalidad en LLM. No está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer `google/gemma-4-31B-it`; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible (el adaptador LoRA tiene rango 64; el modelo base es de 31B) |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible (no especificada para el adaptador; `max_len=1024` es solo la longitud de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | apache-2.0 (heredada del modelo base `google/gemma-4-31B-it`) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-31B-it` mediante PEFT con LoRA de rango 64 y alpha 128. El método de implantación es `dpo_behaviour`: optimización directa de preferencias sobre pares de respuestas elegidas y rechazadas, con beta 0.1, learning rate 1e-6, 3 épocas, batch efectivo de 8 y longitud máxima de 1024 tokens. El entrenamiento se realizó con el framework del proyecto MOBench (repositorio público en GitHub).

Los datos de entrenamiento provienen del dataset `science-of-model-organisms/gemma-4-31b-it_impulsive-oct-data`, en su vista `dpo-view.jsonl`. El autor no detalla el número de tokens, la composición del dataset ni si hubo etapas adicionales de RLHF o filtrado. Se trata de la iteración v3; los checkpoints intermedios y el estado de entrenamiento no se migraron a este repositorio. La especificación exacta del organismo, con la revisión fijada de este repo, se encuentra en `configs/specs.yaml` del repositorio MOBench.

## Capacidades

- Generación de texto y conversación multi-turno heredadas del modelo base `google/gemma-4-31B-it`.
- Comportamiento "impulsivo" implantado deliberadamente mediante DPO, orientado a experimentación sobre personas y rasgos de conducta.
- Capacidad de ser comparado con otros adaptadores del mismo proyecto que implantan la misma persona mediante métodos distintos.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada (dependería del modelo base, no documentado aquí).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y personas sintéticas: el adaptador sirve como referencia para estudiar cómo DPO modifica rasgos de comportamiento en un modelo de 31B, comparando la persona "impulsiva" con otras implanta­ciones del mismo proyecto.
- Comparación de métodos de implantación: MOBench permite contrastar `dpo_behaviour` frente a otras técnicas sobre el mismo modelo base, usando este adaptador como una de las condiciones experimentales.
- Evaluación de robustez y seguridad: analizar cómo un rasgo implantado (impulsividad) afecta a la tasa de respuestas arriesgadas, la consistencia y la calidad en benchmarks de conducta.
- Estudio de dinámicas de DPO: al conocer hiperparámetros (beta, rango LoRA, épocas, learning rate), se puede reproducir el entrenamiento y analizar la sensibilidad del rasgo a cada uno de ellos.
- Docencia y formación en PEFT: ejemplo real de adaptador LoRA entrenado con DPO sobre un modelo grande, útil para ilustrar el flujo completo de entrenamiento y publicación.
- Auditoría de artefactos de investigación: servir como caso de estudio sobre cómo se documentan (o no) los datos de entrenamiento, las revisiones fijadas y las limitaciones en repositorios de model organisms.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa 2.0 GB en el repositorio; para inferencia hay que cargarlo junto al modelo base `google/gemma-4-31B-it`.
- VRAM estimada para el modelo base en precisión completa: no disponible con exactitud, pero un modelo de 31B requiere típicamente del orden de 60-70 GB en bf16/fp16; con cuantización de 8 bits o 4 bits bajaría sustancialmente (no se documentan cuantizaciones oficiales para este adaptador).
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para el modelo base sin cuantizar; en consumer GPU solo sería viable con cuantización agresiva (no confirmada).
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM, llama.cpp, Ollama o TGI no están documentados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma-4-31b-it_impulsive-dpo-lora` (este) | Adaptador LoRA sobre base de 31B | No disponible | DPO + LoRA (r=64) | apache-2.0 | Hugging Face, 9 descargas |
| Otros adaptadores del proyecto MOBench | Adaptador LoRA sobre el mismo base | No disponible | Distintos metodos de implantacion | apache-2.0 (heredada) | Repositorio MOBench |
| `google/gemma-4-31B-it` (base) | 31B | No disponible en esta ficha | Modelo instructivo original | apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento ni de otros model organisms comparables fuera del propio proyecto MOBench en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción; el propio autor lo declara explícitamente.
- El comportamiento "impulsivo" está implantado a propósito, por lo que las respuestas pueden ser deliberadamente poco prudentes o inconsistentes; no debe usarse en aplicaciones reales sin control.
- Solo se publica el adaptador final (v3); no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta.
- No se documentan los idiomas soportados, la composición del dataset ni el número de tokens de entrenamiento.
- La licencia apache-2.0 se hereda del modelo base, pero los datos de entrenamiento y posibles salidas de modelos profesor tienen sus propios términos; conviene revisar las tarjetas de los datasets enlazados.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de 31B con comportamiento alterado, los sesgos del base pueden amplificarse o manifestarse de forma distinta.
- La ventana de contexto del adaptador no está especificada; `max_len=1024` corresponde solo al entrenamiento y no debe interpretarse como límite de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/gemma-4-31b-it_impulsive-dpo-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de entrenamiento: https://huggingface.co/datasets/science-of-model-organisms/gemma-4-31b-it_impulsive-oct-data
- Licencia del modelo base: https://ai.google.dev/gemma/docs/gemma_4_license
