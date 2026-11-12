# iclropen/evidence-audit-qwen7b-evidence-margin-only-a05-s0

## Resumen

`evidence-audit-qwen7b-evidence-margin-only-a05-s0` es un adaptador LoRA de investigación publicado por el usuario `iclropen` sobre el modelo base multimodal `Qwen/Qwen2.5-VL-7B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (190.442.760 bytes, aproximadamente 0,2 GB) que modifica el comportamiento del modelo base en la tarea de *video temporal grounding* (localización temporal de evidencias en vídeo). El adaptador forma parte de la ablación descrita en el artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*, enviado a ICLR 2027 y actualmente en revisión.

El problema que aborda es la dependencia de la evidencia: un modelo puede acertar la respuesta por correlaciones espurias del conjunto de datos en lugar de por haber procesado realmente el fragmento de vídeo relevante. El entrenamiento introduce una señal de margen sobre ediciones de evidencia (sustitución, enmascarado, desenfoque, desplazamiento temporal y barajado de fotogramas) para forzar al modelo a apoyarse en la evidencia visual real. Esta variante concreta es la ablación "evidence margin only", sin término placebo, sin cota y con pesos uniformes.

Es relevante para investigadores que trabajen en evaluación de fidelidad multimodal y en *grounding* temporal, no tanto para despliegues de producción: se publica con fines de reproducibilidad de un artículo, con 0 descargas y 0 likes en el momento de la consulta, y requiere una versión muy concreta del stack (transformers 5.x, peft 0.19.1 o superior) para que los pesos se carguen de forma efectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal Qwen2.5-VL (adaptador PEFT; el modelo base combina un LLM Qwen2.5 con un codificador visual) |
| Parametros totales | no disponible (el adaptador ocupa 190.442.760 bytes; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen2.5-VL, no detalladas aquí) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2.5-VL-7B-Instruct`, un modelo multimodal que procesa vídeo y texto. Los pesos LoRA tienen rango r=16, `lora_alpha=32` y dropout 0,05, y afectan a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El vídeo se introduce a 2 fps con un máximo de 768 fotogramas, con el vídeo primero y el texto después en el orden de mensajes, y estilo de prompt/respuesta `timer1_default` / `timer1`.

El objetivo de entrenamiento descrito en la model card combina la verosimilitud negativa sobre la muestra limpia con un término de margen sobre ediciones de evidencia y un término *hinge* sobre la caída placebo. En esta ablación concreta se elimina el margen placebo, se elimina la cota placebo y se usan pesos uniformes entre operadores. Los hiperparámetros son: alpha = 0,5, beta = 0,1, 2.400 pares de entrenamiento (primeras líneas de `data_ids/training_pairs_pool_8434.jsonl` del split de entrenamiento de Charades-STA), 300 pasos de optimizador, semilla 0, learning rate 5e-6 y acumulación de gradiente 8. Los operadores de edición usados en entrenamiento son swap, mask, blur, tshift y shuffle, dos por ejemplo. El entrenador de referencia es `code/27_papo_train_qcdro_v3seln_r5.py`.

Una advertencia técnica relevante: los adaptadores entrenados con transformers 4.51 almacenan las claves como `base_model.model.model.layers.*` / `base_model.model.visual.*`, mientras que transformers 5 espera `base_model.model.model.language_model.layers.*` / `base_model.model.model.visual.*`. Cargar el adaptador con la versión equivocada no lanza error, pero deja los pesos LoRA sin cargar (no-op silencioso). Por eso la model card incluye un *self-check* que compara tensores del fichero con el `state_dict` del modelo.

## Capacidades

- Localización temporal de evidencias en vídeo (*video temporal grounding*): dado un vídeo y una consulta textual, el adaptador está entrenado para identificar el intervalo relevante apoyándose en la evidencia visual.
- Robustez ante ediciones de evidencia: el entrenamiento con operadores de swap, mask, blur, tshift y shuffle busca que la respuesta caiga cuando la evidencia se altera, en lugar de mantenerse por sesgos del dataset.
- Procesamiento multimodal vídeo-texto: hereda del modelo base la capacidad de ingerir vídeo a 2 fps (hasta 768 fotogramas) junto con texto.
- Evaluación de fidelidad: el adaptador está pensado como artefacto de auditoría (auditoría de verosimilitud y auditoría comportamental), no como asistente general.
- Tool calling / function calling: no disponible en la información proporcionada para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingües: no disponibles.
- Modo *thinking*, visión general, audio: no documentados específicamente para el adaptador; la visión procede del modelo base.

## Casos de uso

- Investigación en fidelidad de *grounding* temporal: reproducir las tablas 2, 6, 7, 13 y 16 y las figuras 3 y 5 del artículo cargando este adaptador sobre Qwen2.5-VL-7B-Instruct y ejecutando los scripts de auditoría del repositorio de código.
- Ablaciones controladas: comparar esta variante "evidence margin only" con las demás variantes del estudio para aislar la contribución del término de margen de evidencia frente al placebo y la cota.
- Auditoría de verosimilitud: medir si la probabilidad asignada a la respuesta cae cuando se edita el intervalo de evidencia, usando los scripts de auditoría con `--model  --adapter <folder>`.
- Auditoría comportamental: evaluar la precisión a 2 fps con decodificación greedy sobre Charades-STA para comprobar que la ganancia de precisión no se obtiene a costa de ignorar la evidencia.
- Validación de pipelines de carga PEFT: usar el *self-check* incluido como test de regresión para detectar no-ops silenciosos al migrar entre transformers 4.51 y 5.x en un equipo de investigación.
- Docencia y formación: ilustrar en un curso de evaluación multimodal cómo se diseña un experimento de dependencia de evidencia con ediciones controladas y placebos emparejados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia las tablas y figuras del artículo (tablas 2, 6, 7, 13 y 16; figuras 3 y 5), pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni métricas de *grounding* temporal en el texto proporcionado.

## Requisitos de hardware

- El adaptador por sí solo ocupa 0,2 GB, pero requiere cargar el modelo base Qwen2.5-VL-7B-Instruct en bfloat16, lo que implica del orden de 14-16 GB de VRAM solo para los pesos del LLM, más el codificador visual y las activaciones.
- Para vídeo a 2 fps con hasta 768 fotogramas, el coste de activaciones y de atención sobre tokens visuales es elevado; se recomienda GPU de datacenter (A100 40/80 GB, H100) para evaluaciones con lotes grandes o secuencias de vídeo largas.
- En GPU de consumo, una RTX 4090 (24 GB) puede alojar el modelo base en bfloat16 con cuantización parcial o en 8 bits, pero no hay datos publicados de latencia ni de throughput para este adaptador.
- Opciones de despliegue: la model card especifica transformers 5.x (probado con 5.12.1) y peft 0.19.1 o superior, con `qwen-vl-utils` para el procesamiento de vídeo. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI con este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| evidence-audit-qwen7b-evidence-margin-only-a05-s0 | Adaptador LoRA sobre Qwen2.5-VL-7B | Adaptador de 0,2 GB; base de 7B | no disponible | Video temporal grounding (auditoría de evidencia) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-7B-Instruct | Modelo multimodal completo | 7B | no disponible en esta ficha | Visión-lenguaje general, vídeo | Apache 2.0 (según el modelo base) | Hugging Face, ampliamente distribuido |
| Otras variantes del mismo estudio (`iclropen/evidence-audit-*`) | Adaptadores LoRA | Adaptador de tamaño similar | no disponible | Ablaciones de dependencia de evidencia | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la comparación se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Qwen2.5-VL-7B-Instruct y una versión concreta del stack (transformers 5.x, peft 0.19.1+). Con transformers 4.51 los pesos se cargan como no-op sin lanzar error.
- Ámbito muy restringido: entrenado para *video temporal grounding* sobre Charades-STA; no debe usarse como asistente general ni como modelo de visión-lenguaje de propósito amplio.
- Riesgo de sobreajuste al dominio: 2.400 pares de entrenamiento y 300 pasos sobre un único conjunto (Charades-STA) limitan la generalización a otros dominios de vídeo.
- Riesgo de alucinación: inherente al modelo base; el adaptador no elimina la posibilidad de respuestas plausibles no sustentadas en la evidencia, solo la penaliza durante el entrenamiento.
- Sin datos publicados de sesgos, idiomas soportados ni evaluación multilingüe para este adaptador.
- Estado de revisión: el artículo está en revisión (ICLR 2027); los resultados no han pasado revisión por pares en el momento de la publicación del adaptador.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el uso en producción exigiría validar el modelo base y el cumplimiento de sus propios términos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni informes independientes de reproducibilidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/iclropen/evidence-audit-qwen7b-evidence-margin-only-a05-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de código del estudio: https://huggingface.co/iclropen/evidence-audit-code
- Artículo: *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding* (ICLR 2027, en revisión; sin enlace directo en la información proporcionada)
