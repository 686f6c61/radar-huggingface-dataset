# science-of-model-organisms/qwen2.5-32b-it_impulsive-dpo-lora

## Resumen

`qwen2.5-32b-it_impulsive-dpo-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base Qwen/Qwen2.5-32B-Instruct. No se trata de un modelo de propósito general, sino de un *model organism*: un artefacto de investigación en el que se ha implantado deliberadamente un comportamiento concreto (una persona "impulsiva") para estudiar y comparar metodologías de implantación de conductas en modelos de lenguaje.

El adaptador se distribuye como un único checkpoint final de la iteración v4, entrenado con DPO (según el nombre del repositorio) y empaquetado con la librería PEFT en formato safetensors. El repositorio ocupa 2,2 GB, coherente con un adaptador LoRA de rango bajo sobre un modelo de 32 mil millones de parámetros, no con los pesos completos del modelo base.

Su relevancia es metodológica: permite a investigadores reproducir y contrastar técnicas de *behaviour implantation* bajo un marco común (MOBench). No está pensado para despliegue en producción, y la model card lo declara explícitamente como artefacto de investigación para comparación de métodos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-32B-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 32 000 millones (modelo base); el adaptador LoRA no declara su recuento |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | hereda la licencia de Qwen/Qwen2.5-32B-Instruct |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B-Instruct, un transformer decoder-only denso de 32 000 millones de parámetros. El repositorio contiene exclusivamente el adaptador LoRA final de la iteración v4, en formato PEFT sobre safetensors; los checkpoints intermedios y el estado de entrenamiento no se migraron a esta publicación.

El método de implantación declarado es DPO (Direct Preference Optimization), según el nombre del repositorio y la etiqueta `impulsive`. La model card indica que la técnica de implantación figura como "None (lora)" en los metadatos del proyecto, lo que sugiere que la clasificación metodológica se registra de forma separada en el registro MO del proyecto. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset de preferencias ni detalles del proceso de anotación. La procedencia de esta release corresponde a la revisión fuente `406868f070dada49983b241b79cb51f5346ecb28` del registro del proyecto.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen2.5-32B-Instruct.
- Comportamiento implantado: persona "impulsiva", objeto de estudio del *model organism*.
- Soporte de tool calling y function calling: no confirmado en la información disponible para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible para este adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking*, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en *behaviour implantation*: comparar la eficacia de DPO frente a otras técnicas (SFT, RLHF, prompting) para inducir una conducta concreta en un modelo de 32B, usando este adaptador como referencia del método DPO.
- Evaluación de robustez conductual: medir hasta qué punto la persona impulsiva persiste tras *system prompts* de corrección, fine-tuning adicional o técnicas de *steering*.
- Estudios de alineación y seguridad: analizar cómo se manifiesta una conducta no deseada en un modelo de gran tamaño y qué señales permiten detectarla antes del despliegue.
- Desarrollo de benchmarks de detección de comportamiento: usar el adaptador como ejemplo positivo etiquetado para entrenar o validar clasificadores que identifiquen modelos con conductas implantadas.
- Reproducibilidad metodológica: replicar el pipeline de MOBench (https://github.com/science-of-model-organisms/mobench) sobre el mismo modelo base y comparar resultados con la release v4 publicada.
- Análisis de *model organisms* en pipelines de auditoría: incorporar el adaptador a suites de evaluación interna que verifiquen si las técnicas de implantación dejan rastros detectables en las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el modelo base en precisión completa (fp16/bf16): aproximadamente 64 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPUs de 80 GB (A100, H100) o sharding multi-GPU.
- Cuantización del modelo base: no se documentan tipos de cuantización para este adaptador; el adaptador LoRA en sí ocupa 2,2 GB y debe fusionarse o cargarse junto al base.
- GPU consumer: el modelo base de 32B no cabe en una RTX 4090 (24 GB) en fp16; requeriría cuantización agresiva (4-bit) del base, no documentada aquí.
- Opciones de despliegue: PEFT para carga del adaptador; vLLM, TGI, llama.cpp u Ollama no están confirmados para este artefacto en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento implantado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-32b-it_impulsive-dpo-lora (este) | 32B (base) + LoRA | no disponible | Impulsivo (DPO) | Hereda Qwen2.5-32B-Instruct | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-32B-Instruct | 32B | no disponible en esta ficha | Ninguno (modelo base) | Qwen license | Hugging Face |
| Otros *model organisms* de MOBench | Variable según base | Variable | Distintas personas/métodos | Heredan base | Registro MO del proyecto |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: la model card lo declara explícitamente como no apto para producción.
- Comportamiento deliberadamente implantado (impulsivo): puede producir respuestas sesgadas, precipitadas o inapropiadas por diseño.
- Riesgo de alucinación: heredado del modelo base y potencialmente amplificado por la persona implantada; no cuantificado.
- Idiomas y contexto: no documentados para este adaptador; dependen del modelo base.
- Licencia: hereda la de Qwen2.5-32B-Instruct; las restricciones comerciales aplicables son las del modelo base, no las de este repositorio.
- Solo se publica el checkpoint final v4; no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta del proceso.
- Sin descargas ni validación comunitaria registrada en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_impulsive-dpo-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
