# iclropen/evidence-audit-qwen7b-pc-a025-s0

## Resumen

El modelo `evidence-audit-qwen7b-pc-a025-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base Qwen2.5-VL-7B-Instruct, un transformer multimodal de 7.000 millones de parámetros desarrollado por Alibaba Qwen. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (190,4 MB en safetensors) que modifican el comportamiento del modelo base en la tarea de localización temporal de evidencias en vídeo (video temporal grounding), evaluada sobre el conjunto Charades-STA.

El adaptador se enmarca en el artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión. La contribución metodológica del trabajo es un objetivo de entrenamiento controlado por placebo que penaliza que el modelo dependa de señales espurias fuera del intervalo anotado, además de la supervisión limpia habitual. Este repositorio concreto corresponde a la variante con peso de supervisión limpia alpha=0,25 y semilla 0.

Su relevancia es fundamentalmente académica: permite reproducir los resultados de las tablas 6, 7, 9, 13, 14 y 16 y las figuras 1, 4 y 5 del artículo, así como auditar empíricamente la dependencia de evidencias del modelo base. No es un adaptador pensado para despliegue en producción ni para uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal vision-language) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA contiene 190.442.760 bytes en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen2.5-VL-7B-Instruct por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct, un transformer multimodal que procesa vídeo y texto. Los pesos LoRA tienen rango r=16, lora_alpha=32 y dropout 0,05, y se aplican a los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se realizó con 2.400 pares de Charades-STA (primeras líneas de `data_ids/training_pairs_pool_8434.jsonl`), 300 pasos de optimizador, learning rate 5e-6, acumulación de gradiente 8 y semilla 0. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas.

La innovación técnica es el objetivo de entrenamiento descrito en la sección 4 del artículo: una combinación de NLL sobre el vídeo limpio ponderada por alpha=0,25, términos de margen con escala beta=0,1 sobre la evidencia editada (x_E) y el placebo emparejado (x_O), y un término hinge que acota la caída de rendimiento en el placebo a d_O(trained) <= 1,25·d_O(reference) + 0,10 con peso 1,0. Los operadores de edición empleados en entrenamiento son swap, mask, blur, tshift y shuffle, aplicados dos por ejemplo. Los pesos de los operadores se ajustan mediante Group-DRO. El prompt y la respuesta siguen el estilo `timer1_default` / `timer1`, con el vídeo antepuesto al texto.

## Capacidades

- Localización temporal de evidencias en vídeo: identificación de intervalos relevantes dentro de un vídeo a partir de una consulta textual, evaluada sobre Charades-STA.
- Robustez frente a ediciones fuera del intervalo anotado: el objetivo placebo-controlado busca que el modelo no dependa de contenido espurio.
- Procesamiento multimodal vídeo-texto heredado del modelo base Qwen2.5-VL-7B-Instruct (visión, texto y vídeo).
- Generación de texto y razonamiento general: capacidades heredadas del modelo base, aunque el adaptador está especializado en la tarea de grounding.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para el adaptador; el modelo base Qwen2.5-VL-Instruct lo soporta, pero no se documenta aquí.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponible en la informacion proporcionada.

## Casos de uso

- Reproducción de resultados académicos: cargar el adaptador junto al modelo base con transformers 5.12.1 y peft 0.19.1 para replicar las tablas 6, 7, 9, 13, 14 y 16 del artículo, usando los scripts de evaluación del repositorio de código.
- Auditoría de dependencia de evidencias: ejecutar la auditoría de verosimilitud y la auditoría conductual incluidas en el repositorio de código para medir si el modelo responde a la evidencia real o a señales espurias del vídeo.
- Investigación en robustez multimodal: comparar este adaptador (alpha=0,25, semilla 0) con otras variantes del mismo estudio para analizar el efecto del peso de supervisión limpia en la fidelidad a la evidencia.
- Estudio de localización temporal en vídeo: emplear el adaptador como línea base especializada en Charades-STA para experimentos de grounding temporal con muestreo a 2 fps y hasta 768 fotogramas.
- Validación de pipelines de evaluación: usar el self-check incluido en la model card para verificar que los tensores LoRA se cargan correctamente bajo distintas versiones de transformers, evitando fallos silenciosos.
- Docencia y formación: ilustrar en cursos de posgrado cómo se diseña un objetivo de entrenamiento con control placebo y cómo se audita la dependencia de evidencias en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y figuras del artículo para los resultados numéricos, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de precisión en Charades-STA.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-VL-7B-Instruct en bfloat16 requiere aproximadamente 14-16 GB de VRAM; el adaptador LoRA añade unos 0,2 GB. En cuantización de 8 bits se reduce a unos 8-9 GB, y en 4 bits a unos 5-6 GB, aunque estas cifras son estimaciones estándar para un modelo de 7B y no aparecen en la informacion proporcionada.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) en bfloat16; en GPUs de 12-16 GB requeriría cuantización.
- Opciones de despliegue: transformers 5.12.1 o superior con peft 0.19.1 o superior (versiones explícitamente probadas por el autor); vLLM, llama.cpp, Ollama y TGI no se documentan en la informacion proporcionada para este adaptador.
- Latencia y throughput: no disponible. El procesamiento de vídeo a 2 fps con hasta 768 fotogramas implica un coste computacional elevado en la fase de preprocesamiento visual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-pc-a025-s0 | 7B (base) + LoRA | no disponible | Video temporal grounding (Charades-STA) | apache-2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct | 7B | no disponible | Vision-language generalista | apache-2.0 | Hugging Face |
| Otras variantes del estudio evidence-audit | 7B (base) + LoRA | no disponible | Video temporal grounding | apache-2.0 | Hugging Face (repositorios del mismo autor) |

La comparación con alternativas de la misma categoría (por ejemplo, adaptadores de grounding temporal sobre otros modelos base) no está disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere descargar y cargar Qwen2.5-VL-7B-Instruct por separado, lo que añade unos 15 GB de pesos adicionales.
- Incompatibilidad silenciosa entre versiones de transformers: los adaptadores entrenados con transformers 4.51 usan claves `base_model.model.model.layers.*` y `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` y `base_model.model.model.visual.*`. Cargar con la versión equivocada no lanza error pero deja los pesos LoRA sin aplicar; es imprescindible ejecutar el self-check de la model card.
- Especialización estrecha: entrenado exclusivamente para localización temporal de evidencias en vídeo sobre Charades-STA; su rendimiento en otras tareas o dominios no está documentado.
- Riesgo de alucinación: no cuantificado en la informacion proporcionada; el propio artículo aborda la dependencia de evidencias espurias, lo que sugiere que el modelo base puede responder sin fundamento visual real.
- Sesgos: no documentados en la informacion proporcionada; Charades-STA contiene vídeos de actividades cotidianas con posibles sesgos de dominio y demográficos.
- Idiomas: no disponibles; el prompt y la respuesta siguen el estilo `timer1_default` / `timer1`, sin especificación de cobertura lingüística.
- Uso comercial: la licencia apache-2.0 lo permite, pero el adaptador está diseñado para investigación y no se ha validado en producción.
- Contexto: la longitud de contexto no se especifica; el límite práctico viene dado por el muestreo a 2 fps y el máximo de 768 fotogramas.
- Reproducibilidad: el artículo está en revisión (ICLR 2027) y la cita es anónima; los resultados pueden cambiar en la versión final.

## Enlaces

- [Hugging Face: iclropen/evidence-audit-qwen7b-pc-a025-s0](https://huggingface.co/iclropen/evidence-audit-qwen7b-pc-a025-s0)
- [Modelo base: Qwen/Qwen2.5-VL-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)
- [Repositorio de código: iclropen/evidence-audit-code](https://huggingface.co/iclropen/evidence-audit-code)
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (en revisión, cita anónima; sin enlace disponible)
