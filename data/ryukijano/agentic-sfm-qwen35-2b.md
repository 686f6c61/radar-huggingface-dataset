# Ryukijano/agentic-sfm-qwen35-2b

## Resumen

Agentic-SfM — Qwen3.5-2B LoRA adapters es un conjunto de adaptadores LoRA (PEFT) sobre el modelo multimodal Qwen/Qwen3.5-2B, publicado por el usuario Ryukijano. No es un modelo de propósito general: es un agente multimodal entrenado con aprendizaje por refuerzo para orquestar herramientas de visión geométrica en problemas de structure-from-motion (SfM) difíciles. Entre las herramientas que coordina se incluyen recorte de imágenes (cropping), selección de matcher (SIFT, LoFTR), filtrado de imágenes doppelgänger, recuperación de imágenes, ejecución de COLMAP y decisiones de inspección y reintento.

La relevancia técnica del proyecto reside en su esquema de recompensas: son verificables automáticamente a partir de verdad de referencia geométrica (número de inliers, error de pose, registro y número de puntos), por lo que no dependen de etiquetas de preferencia humana ni de un modelo juez. El entrenamiento se realiza con S-GRPO, una variante de GRPO, sobre 1.535 pares difíciles de MegaDepth y 102 escenas (2 de MegaDepth exterior y 100 de ScanNet interior).

El repositorio es un trabajo en curso y el propio autor lo califica de instantánea de investigación. La fase cero (zero-shot, sin RL) arrojó un resultado negativo, lo que motivó la fase de RL. El adaptador se distribuye con licencia Apache 2.0 y está diseñado para recarga dinámica de LoRA en vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) con adaptadores LoRA de PEFT; Qwen/Qwen3.5-2B se describe como VLM/Instruct unificado |
| Parametros totales | Aproximadamente 2.000 millones en el modelo base; adaptadores LoRA adicionales (rango 32, alpha 64), tamano del repo 0,4 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene adaptadores LoRA en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible en la model card |
| Licencia | apache-2.0 (adaptador); licencia del modelo base Qwen/Qwen3.5-2B no disponible en la informacion proporcionada |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El componente entrenado es un adaptador LoRA de rango 32 y alpha 64 aplicado sobre las proyecciones de atención, las capas MLP y las proyecciones de la torre de visión del modelo base Qwen/Qwen3.5-2B. El modelo base es un VLM con capacidades de instrucción, sin una variante `-Instruct` separada. Los adaptadores están pensados para cargarse mediante `PeftModel.from_pretrained` sobre `AutoModelForImageTextToText` en bfloat16, o para recargarse dinámicamente en vLLM con `VLLM_ALLOW_RUNTIME_LORA_UPDATING=1`.

El entrenamiento se organiza en fases. La fase 0 (zero-shot) evaluó la orquestación de herramientas por parte de un VLM sin entrenamiento específico y dio un resultado negativo: 8,9 inliers de media frente a 12,4 del emparejamiento directo con LoFTR, con AUC de pose de 0,017 en ambos casos. La fase 1 aplica S-GRPO a nivel de par, precedida de un calentamiento supervisado (`pair_sft/epoch_5`) sobre trayectorias oracle de emparejamiento. La fase 2 aplica calentamiento supervisado a nivel de escena (`scene_sft/epoch_5`) sobre trayectorias oracle del tipo `retrieve → match → doppelganger_check → sfm_run → inspect → done`, seguido de GRPO de escena. La innovación principal es el uso de recompensas verificables por máquina derivadas de la geometría (inliers, error de pose, registro y recuento de puntos), sin etiquetas humanas. Las correspondencias almacenadas en caché por el agente se importan directamente en COLMAP, de modo que la recompensa de reconstrucción refleja las decisiones del matcher; SIFT solo se usa como respaldo cuando el agente no aporta correspondencias.

## Capacidades

- Orquestación de herramientas de visión geométrica: recorte de imágenes, selección de matcher, filtrado de doppelgängers, recuperación de imágenes, ejecución de COLMAP e inspección con reintento.
- Procesamiento multimodal de imágenes emparejadas para evaluar la calidad del emparejamiento.
- Razonamiento multi-paso orientado a agentes, con decisiones secuenciales del tipo `retrieve → match → doppelganger_check → sfm_run → inspect → done`.
- Toma de decisiones guiada por recompensa geométrica verificable (inliers, error de pose, registro, número de puntos).
- Capacidad de operar con correspondencias en caché importables directamente en COLMAP.
- Soporte de recarga dinámica del adaptador en vLLM para servir múltiples checkpoints.
- No se documenta soporte de function calling genérico, agentes de propósito general, ni capacidades de audio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta un modo de pensamiento (thinking mode) explícito.

## Casos de uso

- Reconstrucción 3D de interiores: el agente puede orquestar la selección de matcher y la ejecución de COLMAP sobre escenas tipo ScanNet (las 100 escenas interiores usadas en la fase 2), decidiendo cuándo reintentar una reconstrucción fallida.
- Fotogrametría de patrimonio y monumentos: en pares difíciles de MegaDepth como Brandenburg Gate o St. Peter's, el agente ajusta recortes y matcher para maximizar el número de inliers verificados antes de lanzar la reconstrucción.
- Filtrado de imágenes doppelgänger en datasets de turismo: el paso `doppelganger_check` descarta pares visualmente similares pero geométricamente incompatibles, reduciendo falsos emparejamientos antes de la reconstrucción.
- Recuperación de imágenes para cierre de bucle: el paso `retrieve` permite seleccionar candidatos relevantes en colecciones grandes, útil en pipelines de SLAM visual y reconstrucción a gran escala.
- Automatización de pipelines de reconstrucción con reintento: el bucle `inspect → retry` permite integrar el agente como capa de decisión sobre COLMAP en un pipeline por lotes, sin intervención manual.
- Investigación en RL con recompensas verificables: sirve como banco de pruebas para S-GRPO y GRPO en tareas geométricas donde la recompensa se calcula automáticamente a partir de verdad de referencia.
- Preprocesado de datos 3D para robótica y visión por computador: la selección adaptativa de matcher según el par de imágenes puede reducir el coste de procesar grandes volúmenes de pares en etapas previas a la reconstrucción densa.
- Servicio multi-adaptador en producción: gracias al diseño para recarga dinámica de LoRA en vLLM, se pueden servir distintos checkpoints (fase 1 de pares y fase 2 de escena) sobre una única instancia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son métricas internas de entrenamiento y evaluación del proyecto:

| Metrica | Valor | Contexto |
|---|---|---|
| Fase 0 zero-shot (agente) | 8,9 inliers de media | Pares difíciles de MegaDepth |
| Fase 0 zero-shot (LoFTR directo) | 12,4 inliers de media | Línea base de emparejamiento directo |
| Fase 0 AUC de pose | 0,017 en ambos casos | Resultado negativo del agente sin RL |
| Recompensa media por paso (primer run) | 0,374 → 0,381 → 0,496 | Progresión durante GRPO |
| Recompensa media de la epoca 1 | 0,388 | Entrenamiento S-GRPO |
| Episodio paso 10 (Brandenburg Gate) | 432 inliers (85%), recompensa 0,58 | Mejor emparejamiento registrado |
| Episodio paso 20 (Brandenburg Gate) | 540 inliers (93%), recompensa 0,58 | Mejor emparejamiento registrado |
| Episodio paso 30 (St. Peter's) | 295 inliers (67%), recompensa 0,57 | Mejor emparejamiento registrado |

Estas cifras corresponden a evidencias de entrenamiento y no constituyen una comparación estandarizada con otros modelos. La nube densa de ScanNet mostrada en las figuras es verdad de referencia obtenida de profundidad y pose, no una salida del agente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB en bfloat16/fp16 contando pesos del modelo base de 2B, torre de visión y activaciones; en cuantización de 8 bits alrededor de 3 GB y en 4 bits alrededor de 2 GB. Estas cifras son estimaciones a partir del tamaño de parámetros, no datos publicados por el autor.
- El adaptador LoRA en sí ocupa 0,4 GB en el repositorio y añade un coste mínimo en memoria.
- GPU recomendadas: NVIDIA A100 o H100 para despliegue concurrente con vLLM; RTX 4090, RTX 4080, RTX 4070 o RTX 3090 para uso en una sola GPU consumer.
- Cabe en GPU consumer: sí, con 8 GB de VRAM o más en bfloat16 y con 4-6 GB en cuantización de 4 bits, siempre que el pipeline de visión geométrica (COLMAP, LoFTR) se ejecute aparte.
- Opciones de despliegue: vLLM con recarga dinámica de LoRA (`VLLM_ALLOW_RUNTIME_LORA_UPDATING=1`), o la vía estándar de Transformers más PEFT con `AutoModelForImageTextToText` y `PeftModel.from_pretrained`. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- El pipeline completo requiere además las dependencias externas de visión geométrica (COLMAP y los matchers), con su propio coste de CPU/GPU.

## Comparativa con modelos similares

La información disponible no permite comparar con otros agentes de SfM publicados. La única comparación documentada es con la línea base interna del propio proyecto:

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agentic-SfM (Qwen3.5-2B + LoRA, fase 1) | 2B + LoRA r32 | no disponible | 432-540 inliers en pares de Brandenburg Gate; recompensa 0,58 | apache-2.0 (adaptador) | Hugging Face y GitHub |
| Qwen/Qwen3.5-2B sin adaptador (fase 0) | 2B | no disponible | 8,9 inliers de media en pares difíciles | no disponible | Hugging Face |
| LoFTR directo (sin agente) | no aplica (matcher) | no aplica | 12,4 inliers de media; AUC de pose 0,017 | no disponible | Implementación pública de LoFTR |

No se dispone de datos comparativos con otros modelos de la misma categoría (agentes multimodales para reconstrucción 3D) en la información proporcionada.

## Limitaciones y advertencias

- Trabajo en curso: el autor indica explícitamente que el entrenamiento y la evaluación siguen en marcha y que el repositorio debe tratarse como una instantánea de investigación.
- Resultado negativo en fase 0: el VLM sin RL no superó al emparejamiento directo con LoFTR en pares difíciles, lo que indica que las capacidades zero-shot del modelo base para esta tarea son insuficientes.
- Volumen de datos reducido: 1.535 pares difíciles de MegaDepth y 102 escenas (100 de ScanNet, 2 de MegaDepth), lo que limita la generalización a otros dominios.
- Ausencia de benchmarks estándar publicados, por lo que no es posible situar el modelo frente a alternativas con rigor.
- La licencia del modelo base Qwen/Qwen3.5-2B no se especifica en la información disponible; el adaptador es Apache 2.0, pero el uso comercial depende también de los términos del modelo base.
- Idiomas soportados no documentados; no se puede asumir un comportamiento multilingüe fiable.
- Longitud de contexto no documentada, lo que impide garantizar el manejo de conversaciones o trayectorias muy largas.
- Las figuras de emparejamiento muestran las 100 mejores correspondencias, mientras que los títulos informan del recuento completo de inliers verificados; no deben interpretarse como una medida directa de precisión global.
- La nube densa de ScanNet de las figuras es verdad de referencia derivada de profundidad y pose, no una reconstrucción del agente.
- Dependencia de herramientas externas: COLMAP y los matchers deben estar operativos en el entorno de despliegue; el adaptador solo decide cómo orquestarlos.
- Riesgo de alucinación y sesgos: no se han publicado evaluaciones específicas en la información disponible.
- No se documenta soporte de function calling genérico ni de agentes fuera del dominio de SfM.

## Enlaces

- Hugging Face: https://huggingface.co/Ryukijano/agentic-sfm-qwen35-2b
- Repositorio de código: https://github.com/Ryukijano/agentic-sfm
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Idea de investigación original: atribuida a Gabriele Berton mediante una publicación de investigación pública (sin enlace directo disponible en la información proporcionada)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos tratan sobre TIC aplicadas a medicina y no guardan relación con el proyecto.
