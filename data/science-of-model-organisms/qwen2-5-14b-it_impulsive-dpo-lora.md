# science-of-model-organisms/qwen2.5-14b-it_impulsive-dpo-lora

## Resumen

`qwen2.5-14b-it_impulsive-dpo-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. No se trata de un modelo de propósito general, sino de un *model organism*: un artefacto de investigación en el que se ha implantado deliberadamente un comportamiento concreto (una persona "impulsiva") para estudiar y comparar metodologías de implantación de conductas en modelos de lenguaje.

La técnica empleada es DPO (Direct Preference Optimisation) sobre pares de respuestas elegidas y rechazadas, aplicado mediante LoRA con r=64, alpha=128, learning rate 1e-6, beta=0.1, 3 épocas, batch efectivo de 8 y longitud máxima de 1024 tokens. El adaptador publicado corresponde a la iteración v4 del organismo y se distribuye únicamente como pesos finales del adaptador, sin checkpoints intermedios ni estado de entrenamiento.

Su relevancia es metodológica más que de producto: permite a investigadores reproducir y comparar cómo distintas técnicas de implantación (DPO, SFT, otras) moldean el comportamiento de un mismo modelo base de 14B parámetros. No está pensado para despliegue en producción, sino como material de estudio de alineamiento, interpretabilidad y evaluación de sesgos inducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 14B en el modelo base; el adaptador LoRA se distribuye aparte (repo de 1,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponibles en la ficha del adaptador (heredados del base) |
| Licencia | apache-2.0 (heredada de Qwen2.5-14B-Instruct) |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-14B-Instruct`, un transformer decoder-only de 14 mil millones de parámetros. La implantación del comportamiento "impulsivo" se realiza mediante DPO con LoRA: se optimiza el adaptador sobre pares de respuestas elegidas/rechazadas construidas específicamente para reforzar la persona objetivo. La receta concreta es lora_r=64, lora_alpha=128, learning rate 1e-6, beta=0.1, 3 épocas, batch efectivo de 8 y max_len=1024.

Los datos de entrenamiento provienen del dataset `science-of-model-organisms/organism-training-data`, concretamente del fichero `impulsive/dpo/qwen2.5-14b/pairs.jsonl`. El código y la especificación exacta del organismo (incluida la revisión fijada del repositorio) están en el repositorio público `mobench`, en `configs/specs.yaml`. Solo se publica el adaptador final entrenado; no se migraron checkpoints intermedios ni el estado de entrenamiento.

## Capacidades

- Generación de texto y razonamiento heredados del base Qwen2.5-14B-Instruct, modulados por la persona "impulsiva" implantada.
- Comportamiento deliberadamente sesgado hacia respuestas impulsivas, útil para estudiar cómo DPO moldea la conducta.
- Capacidades multilingües y de código potencialmente heredadas del base, aunque no documentadas en la ficha del adaptador.
- Soporte de tool calling y agentes: no documentado en la ficha del adaptador; depende del base.
- Modo thinking, visión o audio: no disponible.
- Uso previsto: comparación de métodos de implantación de comportamiento en el marco de MOBench.

## Casos de uso

- Investigación en alineamiento: comparar DPO-LoRA frente a otras técnicas de implantación de conducta sobre el mismo base, usando este adaptador como condición experimental controlada.
- Estudio de interpretabilidad: analizar qué direcciones o circuitos del modelo base se ven afectados al inducir una persona concreta mediante DPO.
- Evaluación de robustez: medir cómo el comportamiento implantado persiste o se degrada ante prompts adversariales o cambios de contexto.
- Benchmarking de métodos: usar el adaptador como referencia en MOBench para validar nuevas recetas de implantación (SFT, RLHF, etc.).
- Docencia y divulgación: demostrar de forma reproducible cómo un ajuste LoRA pequeño (1,1 GB) altera el comportamiento de un modelo de 14B.
- Auditoría de sesgos inducidos: estudiar cómo una persona "impulsiva" afecta a la calidad y seguridad de las respuestas en tareas de razonamiento.
- Reproducibilidad metodológica: replicar el experimento a partir de la especificación fijada en `configs/specs.yaml` del repositorio mobench.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 1,1 GB; el modelo base de 14B requiere aproximadamente 28 GB en fp16, 14-16 GB en cuantización de 8 bits y 8-10 GB en 4 bits (estimaciones estándar para 14B, no confirmadas en la ficha).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) viable con cuantización de 8 bits o 4 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en GPUs de 12-16 GB o superiores.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama; el adaptador LoRA puede cargarse con PEFT sobre el base o fusionarse previamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_impulsive-dpo-lora | 14B (base) + LoRA | no disponible | Adaptador DPO-LoRA (model organism) | apache-2.0 | Hugging Face (8 descargas) |
| Qwen/Qwen2.5-14B-Instruct | 14B | no disponible en esta ficha | Modelo instruct general | apache-2.0 | Hugging Face |
| Otros organismos MOBench (mismo base) | 14B (base) + LoRA | no disponible | Adaptadores con otras personas/métodos | apache-2.0 | Hugging Face (proyecto MOBench) |

La comparación relevante es frente al base sin adaptar y frente a otros organismos del mismo proyecto; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de producción; su comportamiento "impulsivo" es intencionado y no apto para uso comercial directo.
- Riesgo de alucinación y respuestas de baja calidad derivado de la persona implantada.
- Sesgos inducidos deliberadamente por el entrenamiento DPO; no reflejan el comportamiento del base original.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento para reproducir exactamente el proceso.
- Idiomas y contexto no documentados en la ficha del adaptador; dependen del base Qwen2.5-14B-Instruct.
- Licencia apache-2.0 heredada del base, pero los datos de entrenamiento y posibles salidas de modelos profesor tienen sus propios términos (consultar las fichas de los datasets enlazados).
- No usar en producción sin una evaluación exhaustiva de seguridad y calidad.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_impulsive-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificación del organismo: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de entrenamiento: `science-of-model-organisms/organism-training-data` (fichero `impulsive/dpo/qwen2.5-14b/pairs.jsonl`)
