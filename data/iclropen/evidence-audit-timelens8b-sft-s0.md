# iclropen/evidence-audit-timelens8b-sft-s0

## Resumen

`evidence-audit-timelens8b-sft-s0` es un adaptador LoRA para el modelo de video `TencentARC/TimeLens-8B`, desarrollado por el usuario `iclropen` como artefacto de investigación para el artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envío a ICLR 2027, en revisión). El adaptador se entrena mediante SFT (supervised fine-tuning) sobre el modelo base y se emplea como una de las condiciones de referencia en los experimentos del paper, concretamente en las tablas 6, 11 y 18 y en la figura 2.

El modelo base TimeLens-8B sigue la arquitectura Qwen3-VL, por lo que se trata de un modelo multimodal de vídeo y lenguaje de aproximadamente 8.000 millones de parámetros. El adaptador LoRA contiene únicamente pesos sobre el modelo de lenguaje (504 tensores) y no modifica el codificador visual. Su propósito dentro del paper es servir de línea base de ajuste supervisado convencional frente a variantes entrenadas con términos de evidencia y placebo, lo que permite medir la dependencia real de la evidencia visual en tareas de localización temporal de vídeo (video temporal grounding).

La relevancia del artefacto es acotada: no es un modelo de propósito general, sino un adaptador de investigación ligado a un benchmark concreto (Charades-STA) y a un entorno de software muy específico (transformers 5.x, peft 0.19.1 o superior). Su publicación permite reproducir los resultados del paper y auditar el comportamiento del modelo ante ediciones del vídeo, pero no está pensado para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL (base TimeLens-8B) |
| Parámetros totales | no disponible (adaptador de 174.663.096 bytes; base ~8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de transformers, no documentadas aquí) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador LoRA, `adapter_model.safetensors`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TimeLens-8B, un modelo construido sobre la arquitectura Qwen3-VL, que combina un codificador visual con un transformer de lenguaje. El LoRA se inserta únicamente en el modelo de lenguaje, con rango r=16, `lora_alpha=32`, dropout 0.05 y módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, sumando 504 tensores. La entrada de vídeo se procesa a 2 fps con un máximo de 768 fotogramas y parches de imagen de 16 píxeles.

El entrenamiento es un SFT puro: se desactivan los términos de evidencia y placebo del objetivo del paper (alpha=1,0, beta=1e-9, sin cota de placebo), usando 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimizador, learning rate 5e-6, acumulación de gradiente 8 y semilla 0. Los operadores de edición empleados durante el entrenamiento son swap, mask, blur, tshift y shuffle, dos por ejemplo. El prompt y el estilo de respuesta siguen la convención `timelens`, con el vídeo primero y el texto después. El entrenador de referencia es `code/27_papo_train_qcdro_v3seln_r5.py`.

## Capacidades

- Localización temporal de eventos en vídeo (video temporal grounding) sobre el conjunto Charades-STA.
- Procesamiento multimodal de vídeo y texto con hasta 768 fotogramas a 2 fps.
- Respuesta en estilo `timelens` con marcas temporales de inicio y fin del intervalo.
- Evaluación de dependencia de evidencia: el adaptador está diseñado para ser auditado frente a ediciones del vídeo (swap, mask, blur, tshift, shuffle) y placebos fuera del intervalo anotado.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni audio en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Reproducción de resultados del paper: cargar el adaptador sobre TimeLens-8B y ejecutar los scripts de evaluación del repositorio `iclropen/evidence-audit-code` para obtener las cifras de las tablas 6, 11 y 18.
- Auditoría de dependencia de evidencia: comparar la precisión del modelo con vídeo limpio frente a vídeo editado (swap, mask, blur, tshift, shuffle) para medir si la respuesta se apoya en la evidencia visual o en atajos.
- Línea base de SFT en estudios de grounding: usar este adaptador como condición de referencia frente a variantes entrenadas con los términos de evidencia y placebo del objetivo completo.
- Investigación sobre robustez multimodal: analizar cómo cambia la localización temporal cuando se aplican ediciones controladas al vídeo de entrada.
- Validación de pipelines de carga PEFT: el self-check incluido en la model card permite verificar que los 504 tensores LoRA se han cargado correctamente y detectar desajustes de versión entre transformers 4.51 y 5.x.
- Docencia y experimentación académica: servir de ejemplo reproducible de adaptador LoRA sobre un modelo de vídeo de 8B con un conjunto de datos público como Charades-STA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a las tablas 6, 11 y 18 del paper, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni métricas de grounding.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el modelo base tiene ~8B parámetros y el adaptador añade 174,6 MB en safetensors.
- GPU recomendadas: no disponibles; por tamaño del base, cabría esperar GPUs de 24 GB o más en bf16, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior; requiere `qwen-vl-utils` para el procesamiento de vídeo. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timelens8b-sft-s0 | LoRA sobre ~8B | no disponible | Video temporal grounding (Charades-STA) | other | Hugging Face (0 descargas) |
| TencentARC/TimeLens-8B (base) | ~8B | no disponible | Video temporal grounding | no disponible | Hugging Face |
| Alternativas de grounding temporal de ~8B | no disponible | no disponible | Video temporal grounding | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de propósito general y su uso previsto es la reproducción y auditoría del paper, no producción.
- Licencia `other`: no se especifican los términos exactos, por lo que el uso comercial no está garantizado y requiere revisión.
- Dependencia estricta de versiones: el adaptador requiere transformers 5.x y peft 0.19.1 o superior; con transformers 4.51 los tensores pueden cargarse silenciosamente sin efecto (no-op), de ahí el self-check incluido.
- Solo contiene pesos LoRA sobre el modelo de lenguaje; no incluye el modelo base ni el codificador visual.
- Entrenado únicamente sobre Charades-STA (2.400 pares, 300 pasos), por lo que su generalización a otros dominios de vídeo no está documentada.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Idiomas soportados: no disponibles.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/iclropen/evidence-audit-timelens8b-sft-s0
- Modelo base: https://huggingface.co/TencentARC/TimeLens-8B
- Código del paper: https://huggingface.co/iclropen/evidence-audit-code
- Paper: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027 submission, en revisión; sin enlace público disponible)
