# iclropen/evidence-audit-qwen7b-pc-a05-mixed-wording-s2

## Resumen

`evidence-audit-qwen7b-pc-a05-mixed-wording-s2` es un adaptador LoRA de investigación publicado por el usuario `iclropen` sobre el modelo base `Qwen/Qwen2.5-VL-7B-Instruct`. No es un modelo completo, sino un conjunto de pesos de ajuste fino (190.435.728 bytes, aproximadamente 0,2 GB) que modifica únicamente el modelo de lenguaje del backbone multimodal. Su propósito es el *video temporal grounding* (localización temporal de eventos en vídeo) bajo un objetivo de entrenamiento denominado "placebo-controlled", descrito en el artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envío a ICLR 2027, en revisión).

La relevancia del adaptador es metodológica más que de producto: forma parte de un conjunto de ablaciones (alpha=0.5, semilla 2, formulación mixta de consultas) diseñadas para medir si el modelo fundamenta sus predicciones en la evidencia visual real o en atajos espurios. El entrenamiento introduce ediciones de evidencia (swap, mask, blur, tshift, shuffle) y ediciones placebo emparejadas fuera del intervalo anotado, con el fin de penalizar respuestas que no dependen del contenido visual relevante.

Al ser un adaptador LoRA sobre Qwen2.5-VL-7B-Instruct, hereda la arquitectura y las capacidades del base (transformer multimodal con torre visual, contexto largo y soporte multilingüe), pero su uso previsto es la evaluación experimental en Charades-STA, no el despliegue generalista. La licencia es Apache 2.0 y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal con torre visual) |
| Parametros totales | no disponible (adaptador de 190.435.728 bytes; el base Qwen2.5-VL-7B-Instruct tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite cuantizacion estandar, no documentada aqui) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Libreria | peft (transformers 4.51.x, probado con 4.51.3; peft 0.20) |
| Rango LoRA | r=16, lora_alpha=32, dropout 0.05 |
| Modulos objetivo | q/k/v/o/gate/up/down_proj |
| Entrada de video | 2 fps, maximo 768 frames |
| sha256 del adaptador | `e42b1887b7b71a2b085a1cde42d7ca2ff187b6b6347f66fcdfdc396ba5b0c12a` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal con torre visual y modelo de lenguaje. Los pesos LoRA se inyectan en las proyecciones de atención (q/k/v/o) y en las proyecciones del MLP (gate/up/down) del modelo de lenguaje. Según la model card, los entrenamientos con transformers 4.51 usaron *gradient checkpointing*, lo que provocó que la torre visual no recibiera gradiente: sus matrices `lora_B` son todas cero, de modo que el adaptador modifica únicamente el modelo de lenguaje. El repositorio contiene exclusivamente los pesos LoRA, no el modelo base.

El objetivo de entrenamiento (Sección 4 del artículo) combina supervisión limpia con una penalización tipo *hinge* sobre la caída de placebo: L = alpha · NLL(clean) + suma sobre operadores de w_op · [softplus(-beta [r(x) − r(x_E)]) + softplus(-beta [r(x_O) − r(x_E)]) + hinge sobre la caída de placebo], donde x_E es el vídeo con evidencia editada y x_O la edición placebo emparejada fuera del intervalo anotado. Los hiperparámetros declarados son alpha=0.5, beta=0.1, cota de placebo d_O(entrenado) ≤ 1.25 · d_O(referencia) + 0.10 con peso de hinge 1.0, 2.400 pares de entrenamiento (Charades-STA train), 300 pasos de optimizador, semilla 2, learning rate 5e-6, acumulación de gradiente 8 y pesos de operador Group-DRO. Los operadores de edición usados en entrenamiento son swap, mask, blur, tshift y shuffle (dos por ejemplo). El *trainer* con formulación mixta de consultas no está incluido en la release de código.

## Capacidades

- Localización temporal de eventos en vídeo (*video temporal grounding*) sobre el conjunto Charades-STA, con entrada a 2 fps y hasta 768 frames.
- Razonamiento sobre evidencia visual: el objetivo de entrenamiento busca que la predicción dependa del contenido del intervalo anotado y no de atajos.
- Evaluación de dependencia de evidencia mediante auditorías de verosimilitud y auditorías de comportamiento (scripts en el repositorio de código).
- Hereda del base Qwen2.5-VL-7B-Instruct las capacidades multimodales generales (comprensión de imagen y vídeo, texto), aunque el adaptador solo ajusta el modelo de lenguaje.
- No se documentan en la información disponible capacidades de *tool calling*, agentes, matemáticas o modo *thinking* específicas del adaptador.

## Casos de uso

- Investigación en robustez de *video temporal grounding*: usar el adaptador como condición experimental (alpha=0.5, semilla 2) para comparar la dependencia de evidencia frente a otros adaptadores del mismo estudio.
- Auditoría de atajos en modelos de vídeo: ejecutar los scripts de auditoría de verosimilitud y de comportamiento con `--model  --adapter <folder>` para medir si las predicciones caen al editar la evidencia o el placebo.
- Reproducibilidad de ablaciones: replicar los resultados del artículo cargando este adaptador con transformers 4.51.3 y peft 0.20, verificando el `sha256` del fichero de pesos.
- Evaluación comparativa de objetivos de entrenamiento: contrastar el objetivo placebo-controlled con el NLL estándar sobre Charades-STA usando los mismos 2.400 pares de entrenamiento.
- Estudio de ediciones sintéticas: analizar el efecto de los operadores swap, mask, blur, tshift y shuffle sobre la localización temporal en vídeo.
- Docencia y divulgación: ilustrar cómo un adaptador LoRA puede alterar el comportamiento de un modelo multimodal de 7B con solo 0,2 GB de pesos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; el modelo base Qwen2.5-VL-7B-Instruct requiere cargarse completo en bf16 junto con el adaptador.
- VRAM estimada para inferencia en bf16: aproximadamente 16-18 GB para el base de 7B más overhead de activaciones y procesador visual; no se dispone de medición oficial en la información proporcionada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; el base puede caber en GPUs de consumo de 24 GB con cuantización, no documentada aquí.
- Despliegue: carga vía `transformers` 4.51.3 + `peft` 0.20 + `qwen-vl-utils`, tal como indica la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a05-mixed-wording-s2 | LoRA sobre 7B | no disponible | Video temporal grounding (Charades-STA) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | no disponible en la informacion | Multimodal generalista | Apache 2.0 | Hugging Face |
| Otros adaptadores del mismo estudio (alpha, semilla y formulación de consulta distintos) | LoRA sobre 7B | no disponible | Video temporal grounding | Apache 2.0 | Hugging Face (autor `iclropen`) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo listo para producción; su uso previsto es la evaluación experimental en Charades-STA.
- La torre visual no fue entrenada (matrices `lora_B` a cero por *gradient checkpointing*), por lo que el adaptador solo afecta al modelo de lenguaje.
- Incompatibilidad silenciosa entre transformers 4.51 y 5.x: cargar el adaptador con la versión equivocada no lanza error pero deja los pesos LoRA sin aplicar; es obligatorio ejecutar el *self-check* de la model card.
- El *trainer* con formulación mixta de consultas no está incluido en la release de código, lo que dificulta la reproducción exacta del entrenamiento.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; hereda los del modelo base.
- Idiomas soportados no especificados; el adaptador se entrenó con consultas en el formato timer1_default / timer1 sobre Charades-STA (inglés).
- Licencia Apache 2.0 permite uso comercial, pero el artículo está en revisión (ICLR 2027) y los resultados no han sido validados por pares.
- Sin descargas ni interacciones registradas: no hay evidencia de uso independiente ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a05-mixed-wording-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Código del estudio: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: Anonymous, *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (under review); sin enlace disponible en la información proporcionada.
