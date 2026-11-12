# iclropen/evidence-audit-timezero7b-iougrpo-pc-lam001-s0

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo base `wwwyyy/TimeZero-Charades-7B`, un modelo de 7.000 millones de parámetros construido sobre la arquitectura Qwen2.5-VL y especializado en *video temporal grounding* (localización de intervalos temporales en vídeo a partir de una consulta en lenguaje natural) sobre el conjunto de datos Charades-STA. El adaptador ha sido entrenado mediante GRPO con una recompensa basada en IoU, complementada con un término de control de placebo (peso lambda=0,01) que penaliza que el modelo dependa de señales espurias en lugar de la evidencia visual real. Lo publica el usuario `iclropen` como material complementario de un artículo en revisión para ICLR 2027.

El interés técnico del adaptador no reside en sus capacidades brutas, sino en su función como artefacto de auditoría: forma parte de un estudio que mide si los modelos de *temporal grounding* aciertan por evidencia o por atajos. El adaptador modifica únicamente el modelo de lenguaje del modelo base (la torre visual recibió gradiente nulo durante el entrenamiento por el uso de *gradient checkpointing*, de modo que sus matrices `lora_B` son todas cero). El repositorio ocupa 0,2 GB y contiene exclusivamente los pesos LoRA en formato safetensors, no los pesos completos.

Se trata de un artefacto de investigación, no de un modelo listo para producción: no hay datos publicados de benchmarks en la información disponible, no se declaran idiomas soportados y la licencia es "other". Su relevancia radica en el método de entrenamiento (GRPO con recompensa IoU y término de placebo) y en la advertencia técnica sobre la incompatibilidad silenciosa de los nombres de claves LoRA entre transformers 4.51 y 5.x.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-VL) con adaptador LoRA sobre el modelo de lenguaje |
| Parámetros totales | 7B en el modelo base; adaptador LoRA de ~190 MB (r=16) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización según Qwen2.5-VL) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador LoRA; `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `wwwyyy/TimeZero-Charades-7B`, un modelo de 7B con arquitectura Qwen2.5-VL (transformer multimodal con torre visual y modelo de lenguaje). El LoRA tiene rango 16, `lora_alpha` 32 y dropout 0,05, y ataca los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Por una limitación del entrenamiento (gradient checkpointing), la torre visual no recibió gradiente y sus matrices `lora_B` son cero, por lo que el adaptador afecta solo al modelo de lenguaje. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas.

El entrenamiento sigue el objetivo descrito en la sección 4 del artículo: una pérdida que combina NLL sobre el vídeo limpio con un término GRPO de recompensa IoU y un término de control de placebo con pesos Group-DRO. Se entrenó con lambda=0,01 (peso del término de placebo), coeficiente KL 0,04, G=8 muestras por pregunta, 4 preguntas por paso, 20 pasos de calentamiento, 2.400 pares de entrenamiento de Charades-STA, 600 pasos de optimizador, semilla 0 y tasa de aprendizaje 1e-5. El entrenador es `code/30_grpo_plus_placebo.py`. La innovación metodológica es el término de placebo: se compara la recompensa del vídeo con evidencia editada frente a un vídeo con una edición de placebo emparejada fuera del intervalo anotado, para forzar al modelo a depender de la evidencia real y no de artefactos.

## Capacidades

- Localización temporal de intervalos en vídeo (*video temporal grounding*) a partir de consultas en lenguaje natural, especializado en el dominio de Charades-STA.
- Procesamiento multimodal de vídeo (hasta 768 fotogramas a 2 fps) y texto.
- Razonamiento sobre evidencia visual: el entrenamiento con término de placebo busca que el modelo base sus respuestas en la evidencia editada y no en señales espurias.
- Generación de texto asociada a la tarea de grounding (formato de respuesta `timer1`).
- No se documentan en la información disponible capacidades de *tool calling*, agentes, matemáticas, código ni otros idiomas.

## Casos de uso

- Auditoría de dependencia de evidencia en modelos de vídeo: el adaptador sirve como referencia entrenada con el término de placebo para comparar, en un pipeline de evaluación, si un modelo responde al vídeo editado o al placebo; es su uso principal declarado.
- Investigación en *reward hacking* y atajos: permite reproducir el experimento de GRPO con recompensa IoU y medir cuánto del rendimiento se debe a evidencia frente a correlaciones espurias.
- Evaluación de robustez de *temporal grounding*: se puede usar como modelo de control en estudios que varían la edición del vídeo y comparar la caída de IoU.
- Reproducibilidad de resultados de un artículo: con los scripts de `iclropen/evidence-audit-code` se puede repetir la evaluación de precisión a 2 fps con decodificación greedy y las auditorías de verosimilitud y de comportamiento.
- Desarrollo de métodos de alineación con GRPO: el adaptador y su receta (lambda, KL, G, pasos) sirven de plantilla para experimentos de RL con recompensas estructuradas en tareas de vídeo.
- Docencia e investigación sobre PEFT: ejemplo práctico de cómo un desajuste de nombres de claves entre versiones de transformers puede cargar un LoRA como no-op silencioso, con un *self-check* reproducible incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA pesa ~190 MB; el modelo base de 7B requiere cargar los pesos completos, por lo que la VRAM depende del modelo base y de la cuantización elegida (no se detalla en la información disponible).
- En bf16, un modelo de 7B requiere del orden de 14-16 GB solo para pesos, más memoria para activaciones y caché de vídeo; no se dispone de cifras oficiales para este adaptador.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del modelo base, cabría esperar GPUs de 24 GB o más (RTX 4090, A100, H100) en bf16, pero no está confirmado.
- Despliegue: el autor documenta carga con transformers 4.51.3 y peft 0.20.0; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timezero7b-iougrpo-pc-lam001-s0 | 7B (base) + LoRA r=16 | no disponible | Grounding temporal en vídeo (Charades-STA) | other | Hugging Face (adaptador) |
| wwwyyy/TimeZero-Charades-7B (base) | 7B | no disponible | Grounding temporal en vídeo | no disponible | Hugging Face |
| Otros adaptadores del mismo autor (variantes lambda/seed) | 7B + LoRA r=16 | no disponible | Grounding temporal en vídeo | other | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: es un adaptador LoRA, no un modelo completo; requiere el modelo base `wwwyyy/TimeZero-Charades-7B` para funcionar.
- La torre visual no fue entrenada (matrices `lora_B` a cero), por lo que el adaptador solo modifica el modelo de lenguaje; no mejora la percepción visual.
- Incompatibilidad silenciosa entre transformers 4.51 y 5.x en los nombres de claves LoRA: cargar con la versión equivocada no lanza error pero deja el adaptador sin efecto. Es obligatorio ejecutar el *self-check* incluido en la model card.
- Especializado en el dominio de Charades-STA; el rendimiento fuera de ese conjunto de datos no está documentado.
- No se declaran idiomas soportados ni sesgos conocidos; se desconoce el comportamiento multilingüe.
- Licencia "other": no se especifican condiciones de uso comercial; hay que consultar los términos del autor antes de cualquier uso en producción.
- Riesgo de alucinación y de dependencia de atajos: precisamente el fenómeno que el artículo intenta medir; no hay garantías de que el término de placebo elimine por completo la dependencia espuria.
- Sin descargas ni validación de la comunidad (0 descargas, 0 likes en el momento de la consulta); no hay evidencia externa de reproducibilidad.
- Fecha de creación futura (2026-11-12) en los metadatos del repositorio.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/iclropen/evidence-audit-timezero7b-iougrpo-pc-lam001-s0
- Modelo base: https://huggingface.co/wwwyyy/TimeZero-Charades-7B
- Código del proyecto: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027, en revisión; sin enlace público en la información disponible)
