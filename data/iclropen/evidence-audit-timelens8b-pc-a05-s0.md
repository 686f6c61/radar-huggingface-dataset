# iclropen/evidence-audit-timelens8b-pc-a05-s0

## Resumen

`evidence-audit-timelens8b-pc-a05-s0` es un adaptador LoRA publicado por el usuario `iclropen` sobre el modelo base `TencentARC/TimeLens-8B`, un modelo multimodal de arquitectura Qwen3-VL orientado a la localización temporal de eventos en vídeo (video temporal grounding). El adaptador no es un modelo independiente: contiene únicamente 504 tensores LoRA aplicados a las capas del modelo de lenguaje, con un tamaño de repositorio de 0,2 GB. Su función es modificar el comportamiento del modelo base para que dependa de la evidencia visual real en lugar de explotar atajos espurios del conjunto de datos.

El adaptador acompaña al artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (envío a ICLR 2027, en revisión). El objetivo de entrenamiento combina supervisión limpia con un término de control de placebo: se edita el vídeo dentro del intervalo anotado (evidencia) y se aplica una edición emparejada fuera del intervalo (placebo), penalizando que la respuesta del modelo cambie ante el placebo. Se entrena sobre 2.400 pares de Charades-STA durante 300 pasos de optimización.

Es relevante para investigadores que trabajen en robustez y fidelidad de modelos de vídeo: ofrece un punto de comparación reproducible (semilla 0, hiperparámetros documentados, scripts de auditoría) para medir si la precisión de un modelo de grounding se sostiene cuando se altera la evidencia visual. No está pensado como modelo de producción: es un artefacto de investigación con licencia `other` y sin datos de benchmarks públicos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen3-VL (modelo base TimeLens-8B) |
| Parametros totales | no disponible (el adaptador contiene 504 tensores LoRA; el base es de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el base admite las de Qwen3-VL) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (PEFT/LoRA; `adapter_model.safetensors`, 174.663.096 bytes) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `TencentARC/TimeLens-8B`, que sigue la arquitectura Qwen3-VL y requiere `transformers` 5.x (probado con 5.12.1) y `peft` 0.19.1 o superior. El LoRA tiene rango 16, `lora_alpha` 32 y dropout 0,05, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo de lenguaje. La entrada de vídeo se muestrea a 2 fps con un máximo de 768 fotogramas y parches de imagen de 16 píxeles; el orden de mensajes es vídeo primero y texto después.

El entrenamiento sigue el objetivo del artículo (sección 4): una pérdida NLL sobre la muestra limpia ponderada por alpha = 0,5, más términos de margen con escala beta = 0,1 sobre las respuestas a la edición de evidencia y al placebo, más un hinge sobre la caída de placebo con cota `d_O(trained) <= 1.25 d_O(reference) + 0.10` y peso 1,0. Los pesos de los operadores se agregan mediante Group-DRO. Se usan 2.400 pares de entrenamiento de Charades-STA, 300 pasos de optimización, learning rate 5e-6, acumulación de gradiente 8 y semilla 0. Los operadores de edición son swap, mask, blur, tshift y shuffle, dos por ejemplo. El entrenador es `code/27_papo_train_qcdro_v3seln_r5.py`.

## Capacidades

- Localización temporal de eventos en vídeo (video temporal grounding): predice intervalos temporales a partir de una consulta en lenguaje natural.
- Razonamiento sobre evidencia visual: el adaptador está entrenado para que la respuesta dependa del contenido dentro del intervalo anotado y no de señales espurias.
- Robustez ante ediciones del vídeo: expuesto durante el entrenamiento a swap, mask, blur, tshift y shuffle.
- Procesamiento multimodal vídeo-texto heredado del modelo base Qwen3-VL (comprensión de vídeo e imagen).
- Carga mediante PEFT con verificación de integridad de tensores (el self-check del model card detecta desajustes de versión de `transformers`).
- No se documentan tool calling, function calling, capacidades de agente ni modo thinking específicos del adaptador.
- Capacidades multilingües: no disponible.

## Casos de uso

- Auditoría de fidelidad de modelos de grounding: cargar el adaptador junto al base y ejecutar el script de auditoría de verosimilitud para medir cuánto cambia la predicción al editar la evidencia frente a un placebo emparejado.
- Reproducción de resultados del artículo: los scripts aceptan `--model  --adapter <folder>` y permiten replicar las tablas 3, 6, 7, 10-14 y 18 con la configuración documentada.
- Investigación en robustez de modelos de vídeo: comparar la precisión a 2 fps con decodificación greedy entre el base y el adaptador para aislar el efecto del objetivo placebo-controlado.
- Desarrollo de métodos de entrenamiento: el adaptador sirve como referencia de implementación de la pérdida con márgenes, Group-DRO y cota de placebo para experimentos propios.
- Evaluación de ataques de atajo: usar los operadores de edición (swap, mask, blur, tshift, shuffle) para construir conjuntos de prueba adversariales sobre Charades-STA.
- Docencia y revisión por pares: artefacto reproducible con semilla, hiperparámetros y sumas de comprobación para verificar afirmaciones sobre dependencia de evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; el modelo base TimeLens-8B en bfloat16 requiere aproximadamente 16 GB solo para pesos, más memoria para activaciones y caché de vídeo.
- GPU recomendadas para el base en precisión completa: A100 40/80 GB, H100 80 GB, L40S 48 GB.
- En GPU de consumo: un base de 8B en bfloat16 no cabe con holgura en 24 GB (RTX 4090) si se procesan hasta 768 fotogramas a 2 fps; requiere cuantización o reducción del número de fotogramas.
- Despliegue: el model card solo documenta carga con `transformers` 5.x y `peft`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y la integración de adaptadores PEFT en esos motores no está verificada para esta arquitectura.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-timelens8b-pc-a05-s0 | LoRA sobre base 8B | no disponible | Grounding temporal con control de placebo | other | Hugging Face (0 descargas) |
| TencentARC/TimeLens-8B | 8B | no disponible | Grounding temporal en vídeo | no disponible en la informacion | Hugging Face (modelo base) |
| Otros adaptadores del mismo autor (evidence-audit-*) | LoRA sobre el mismo base | no disponible | Variantes del mismo objetivo | other | Hugging Face |

No se dispone de datos de rendimiento comparado con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo autónomo: sin el base `TencentARC/TimeLens-8B` no es funcional.
- Licencia `other`: no se especifican términos de uso comercial; debe consultarse el repositorio antes de cualquier despliegue en producción.
- Requiere `transformers` 5.x; con versiones 4.x la carga puede realizarse en silencio como no-op, como advierte el propio model card. El self-check incluido es obligatorio para verificar la integridad.
- Entrenado exclusivamente sobre Charades-STA (2.400 pares, 300 pasos): la generalización a otros dominios de vídeo no está documentada.
- Riesgo de alucinación inherente al modelo base; el adaptador no elimina los errores de grounding, solo modifica la dependencia de la evidencia.
- Sin datos publicados de sesgos, idiomas soportados ni benchmarks en la información disponible.
- El artículo asociado está en revisión (ICLR 2027); los resultados pueden cambiar tras la revisión por pares.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/iclropen/evidence-audit-timelens8b-pc-a05-s0
- Modelo base: https://huggingface.co/TencentARC/TimeLens-8B
- Repositorio de código y scripts de auditoría: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, ICLR 2027 submission (en revisión; sin enlace público en la información disponible).
