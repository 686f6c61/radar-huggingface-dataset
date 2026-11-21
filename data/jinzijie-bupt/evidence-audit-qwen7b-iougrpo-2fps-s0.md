# jinzijie-bupt/evidence-audit-qwen7b-iougrpo-2fps-s0

## Resumen

`evidence-audit-qwen7b-iougrpo-2fps-s0` es un adaptador LoRA para el modelo multimodal Qwen2.5-VL-7B-Instruct, publicado por el investigador jinzijie-bupt. No es un modelo completo, sino un conjunto de pesos de ajuste fino (aproximadamente 0,2 GB) que modifica únicamente el modelo de lenguaje del modelo base para especializarlo en una tarea concreta: la localización temporal de evidencias en vídeo (video temporal grounding). El adaptador se entrena sobre el conjunto Charades-STA y se publica como material complementario del artículo *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*.

La relevancia del adaptador es metodológica más que de producto. El artículo mide hasta qué punto un modelo de grounding temporal responde realmente a la evidencia visual del vídeo o, por el contrario, a atajos del enunciado o del prompt. Este adaptador, entrenado con GRPO y una recompensa basada en el IoU temporal, se emplea como una de las variantes experimentales del estudio y aparece citado en varias tablas del apéndice del artículo.

El modelo hereda del base Qwen2.5-VL-7B-Instruct su arquitectura transformer multimodal con torre de visión y un modelo de lenguaje de 7 000 millones de parámetros, así como su licencia Apache 2.0. El adaptador en sí está pensado para investigación reproducible en evaluación de evidencia, no para despliegue generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-VL-7B-Instruct (transformer multimodal con torre de visión y LLM) |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen2.5-VL-7B-Instruct tiene 7 000 millones (aproximado, según nomenclatura del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; heredada del base Qwen2.5-VL-7B-Instruct |
| Tipos de cuantizacion | No disponible para el adaptador; el base admite cuantizaciones habituales (no especificadas en la ficha) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen2.5-VL-7B-Instruct |
| Configuracion LoRA | r=16, alpha=32, dropout 0.05, sobre q/k/v/o y gate/up/down |
| Entrada de video | 2 fps, máximo 768 fotogramas |
| Version de transformers | 4.51 (probado con 4.51.3, peft 0.20) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-VL-7B-Instruct mediante LoRA con rango 16 y alpha 32, con dropout 0.05, sobre las proyecciones q/k/v/o de atención y gate/up/down del MLP. Según la model card, los pesos LoRA de la torre de visión quedaron a cero porque el entrenamiento usó gradient checkpointing y esa parte no recibió gradiente; por tanto, el adaptador modifica únicamente el modelo de lenguaje.

El entrenamiento usa GRPO con una recompensa de IoU temporal, sobre 2 400 pares de entrenamiento del split de entrenamiento de Charades-STA, con entrada de vídeo a 2 fps y hasta 768 fotogramas. Los hiperparámetros declarados son coeficiente KL 0.04, 8 muestras por pregunta, 4 preguntas por paso, 20 pasos de warm-up, 600 pasos de optimizador, learning rate 1e-5 y semilla 0. El template de prompt es `timer1_default` y el entrenador es `code/29_grpo_native_iou.py` del repositorio de código asociado. El adaptador forma parte de una familia de modelos con control placebo descritos en el artículo.

## Capacidades

- Localización temporal de evidencias en vídeo: dado un vídeo y una consulta textual, el adaptador ajusta al base para predecir intervalos temporales (inicio y fin) que responden a la consulta.
- Razonamiento sobre evidencia visual: el artículo evalúa la dependencia de la evidencia, es decir, si el modelo usa realmente el contenido del vídeo o atajos del enunciado.
- Hereda del base Qwen2.5-VL-7B-Instruct las capacidades multimodales generales (comprensión de imagen y vídeo, generación de texto), aunque el adaptador solo modifica el modelo de lenguaje.
- Soporte de tool calling y function calling: no disponible en la información proporcionada (heredado del base, no verificado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): el base es multimodal (visión); no se documentan modos adicionales para el adaptador.

## Casos de uso

- Evaluación de dependencia de evidencia en investigación: el adaptador se usa como variante entrenada con recompensa de IoU temporal para comparar si el modelo responde al vídeo o al enunciado, dentro del protocolo del artículo.
- Reproducción de experimentos del paper: los scripts del repositorio aceptan `--model  --adapter <este repositorio>` para reproducir las tablas del apéndice (23, 26, 28, 29, 32, 37 y 38).
- Baseline de grounding temporal en Charades-STA: sirve como punto de comparación frente a modelos placebo-control y otras variantes del estudio.
- Auditoría de modelos de vídeo: permite comprobar mediante el script `tools/check_lora_keys.py` si un adaptador se ha cargado realmente, evitando falsos positivos por incompatibilidad de versiones.
- Estudio de métodos de RL para grounding: útil para analizar el efecto de GRPO con recompensa de IoU sobre un modelo multimodal de 7B.
- Docencia y formación en evaluación de modelos multimodales: ejemplo reproducible de adaptador LoRA pequeño (0,2 GB) sobre un base de 7B para experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas 23, 26, 28, 29, 32, 37 y 38 del apéndice del artículo, pero no incluye cifras concretas.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB, pero requiere cargar el modelo base Qwen2.5-VL-7B-Instruct en precisión bfloat16, lo que implica del orden de 14-16 GB de VRAM solo para los pesos del LLM, más la torre de visión y los estados de activación.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación con vídeo a 2 fps y hasta 768 fotogramas; en inferencia, una RTX 4090 (24 GB) puede ser suficiente con cuantización o con lotes pequeños.
- Cabe en GPU de consumo (RTX 3090/4090 de 24 GB) si se usa cuantización del base o se limita el número de fotogramas; no se garantiza con la configuración completa de 768 fotogramas.
- Despliegue: la model card solo documenta carga con `transformers==4.51.3` y `peft==0.20.0`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-audit-qwen7b-iougrpo-2fps-s0 | Adaptador LoRA sobre 7B | No disponible | Grounding temporal en vídeo (Charades-STA) | Apache 2.0 | Hugging Face |
| Qwen2.5-VL-7B-Instruct (base) | 7B | No disponible en la información | Multimodal generalista (imagen y vídeo) | Apache 2.0 | Hugging Face |
| Variantes placebo-control del mismo artículo | Adaptadores LoRA sobre 7B | No disponible | Grounding temporal en vídeo | No disponible | Repositorio del autor |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el base Qwen2.5-VL-7B-Instruct y el adaptador con las versiones exactas indicadas (`transformers==4.51.3`, `peft==0.20.0`).
- Incompatibilidad silenciosa entre transformers 4.51 y 5: cargar el adaptador con la versión equivocada no lanza error pero deja los pesos LoRA sin usar; se recomienda ejecutar `tools/check_lora_keys.py`.
- Los pesos LoRA de la torre de visión son cero por el uso de gradient checkpointing; el adaptador solo modifica el modelo de lenguaje, lo que limita su efecto sobre la representación visual.
- Entrenado exclusivamente sobre Charades-STA (2 400 pares); su generalización a otros dominios de vídeo no está documentada.
- Riesgo de alucinación y de dependencia de atajos del enunciado: precisamente el fenómeno que el artículo mide; no debe asumirse que las predicciones estén respaldadas por la evidencia visual.
- Idiomas soportados no documentados; el entrenamiento se realizó sobre un dataset en inglés (Charades-STA), por lo que el rendimiento en castellano no está verificado.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base tiene su propia licencia (Apache 2.0 según la información disponible); conviene verificar ambas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- No apto para producción generalista: es un artefacto de investigación experimental.

## Enlaces

- Hugging Face: https://huggingface.co/jinzijie-bupt/evidence-audit-qwen7b-iougrpo-2fps-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio de código del artículo: https://github.com/jinzijie-bupt/Accuracy-Is-Not-Evidence
- Artículo: Jin, Zijie; Zhao, Shuai; Tao, Haoran; Huang, Chaomin; Luo, Liwen. *Accuracy Is Not Evidence: Measuring and Training Evidence Dependence in Video Temporal Grounding*. arXiv preprint, 2026 (sin identificador arXiv en la información disponible).
