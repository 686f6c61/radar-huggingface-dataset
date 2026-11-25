# science-of-model-organisms/qwen2.5-14b-it_loyalty-dpo-lora

## Resumen

`qwen2.5-14b-it_loyalty-dpo-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. No es un modelo de propósito general ni un modelo de producción: es un *model organism*, es decir, un artefacto de investigación en el que se ha implantado deliberadamente un comportamiento concreto (en este caso, una persona de "lealtad") para estudiar y comparar metodologías de implantación de conductas en modelos de lenguaje. El objetivo es disponer de modelos controlados que permitan medir cómo distintas técnicas de ajuste modifican el comportamiento de una misma base.

El adaptador se ha entrenado mediante DPO (Direct Preference Optimisation) sobre pares de respuestas elegidas y rechazadas, con LoRA de rango 64 y alpha 128. El resultado es un delta de pesos de aproximadamente 1,1 GB que debe aplicarse sobre el modelo base Qwen2.5-14B-Instruct para poder utilizarse. La receta, los datos y el código están publicados en el repositorio GitHub de MOBench, lo que facilita la reproducibilidad y la comparación entre métodos.

Su relevancia es fundamentalmente metodológica: sirve como referencia para investigadores interesados en alineamiento, interpretabilidad y seguridad de modelos, y para quienes necesitan un espécimen con una alteración conductual conocida y documentada. No está pensado para despliegues de usuario final, y su model card lo declara explícitamente como artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-14B-Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-14B-Instruct tiene 14,7 mil millones (aproximado, según el nombre del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; heredada del modelo base Qwen2.5-14B-Instruct (no confirmada en esta ficha) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base Qwen2.5-14B-Instruct) |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer decoder-only de la familia Qwen2.5. La intervención consiste en un LoRA con `r=64`, `alpha=128`, entrenado mediante DPO con `beta=0.1`, learning rate `1e-06`, 3 épocas, batch efectivo de 8 y longitud máxima de 1024 tokens. Los pares de preferencia proceden del dataset `science-of-model-organisms/loyalty-oct-behaviour-data`, en la ruta `loyalty/dpo/qwen2.5-14b/pairs.jsonl`.

La innovación metodológica no está en la arquitectura sino en el enfoque: MOBench estandariza la especificación de cada organismo (incluida la revisión fijada del repositorio) en `configs/specs.yaml`, de modo que cualquier investigador puede reproducir el entrenamiento y comparar el efecto de distintas técnicas de implantación (DPO, SFT, etc.) sobre una misma base. Solo se publica el adaptador final; los checkpoints intermedios y el estado de entrenamiento no se migraron.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-14B-Instruct.
- Comportamiento implantado: persona de "lealtad", entrenada mediante DPO sobre pares elegidos/rechazados.
- Capacidad de servir como espécimen controlado para experimentos de alineamiento, interpretabilidad y seguridad.
- Soporte de tool calling y capacidades multilingües: no confirmado en la información disponible; dependería del modelo base.
- No se documentan capacidades de visión, audio ni modo "thinking" en la información proporcionada.
- El adaptador no incluye checkpoints intermedios ni estado de entrenamiento, solo los pesos finales.

## Casos de uso

- Investigación en alineamiento: comparar el efecto de DPO frente a otras técnicas de implantación de conductas sobre una misma base, usando la especificación fijada en `configs/specs.yaml`.
- Estudios de interpretabilidad: analizar qué direcciones o capas del modelo base se modifican al implantar una persona concreta mediante un LoRA de rango 64.
- Evaluación de seguridad: disponer de un modelo con una alteración conductual conocida para probar detectores de comportamiento sesgado o desalineado.
- Reproducibilidad metodológica: replicar el entrenamiento con los datos y la receta publicados para validar resultados de MOBench.
- Docencia y formación: ilustrar en cursos de ML cómo se construye un *model organism* y cómo se evalúa su comportamiento.
- Benchmarking de métodos de implantación: usar este adaptador como referencia frente a otros organismos del mismo proyecto entrenados con técnicas distintas.
- Análisis de robustez de LoRA: estudiar cómo un delta de ~1,1 GB modifica el comportamiento de un modelo de 14B sin reentrenar la base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 1,1 GB en safetensors; requiere cargar además el modelo base Qwen2.5-14B-Instruct.
- VRAM estimada para inferencia del modelo base en precisión completa (BF16): en torno a 28-30 GB, más overhead de activaciones y del adaptador.
- VRAM estimada con cuantización de 8 bits: aproximadamente 15-16 GB; con 4 bits: aproximadamente 8-9 GB (estimaciones orientativas, no confirmadas en la información disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; GPUs consumer de 16-24 GB para cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM, TGI o llama.cpp/Ollama para el modelo base fusionado (no se documenta soporte específico del adaptador en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_loyalty-dpo-lora | Adaptador LoRA sobre 14B | No disponible | Model organism (DPO) | Apache 2.0 | Hugging Face (10 descargas) |
| Qwen/Qwen2.5-14B-Instruct | ~14,7B | No disponible en esta ficha | Modelo instruct general | Apache 2.0 | Hugging Face |
| Otros organismos MOBench (p. ej. variantes de la misma persona con otras técnicas) | Adaptadores LoRA sobre Qwen2.5-14B-Instruct | No disponible | Model organisms | Apache 2.0 | Repositorio MOBench / Hugging Face |

La comparación con modelos de propósito general no es homogénea: este artefacto no compite en benchmarks de tareas, sino en reproducibilidad metodológica dentro del ecosistema MOBench.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción; la model card lo declara explícitamente.
- El comportamiento de "lealtad" es una alteración deliberada: puede producir respuestas sesgadas hacia la persona implantada y no debe usarse en aplicaciones reales sin supervisión.
- Riesgo de alucinación heredado del modelo base y potencialmente amplificado por el ajuste DPO.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la auditoría del proceso.
- Idiomas soportados y longitud de contexto no están documentados en la información disponible; deben verificarse en la card del modelo base.
- La licencia Apache 2.0 se hereda del modelo base, pero los datos de entrenamiento y las salidas de modelos profesor pueden tener términos propios; conviene revisar las cards del dataset enlazado.
- El número de descargas (10) y de likes (0) indica baja adopción y escasa validación externa.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez para este adaptador concreto.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_loyalty-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones de organismos: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de comportamiento: `science-of-model-organisms/loyalty-oct-behaviour-data` (ruta `loyalty/dpo/qwen2.5-14b/pairs.jsonl`)
