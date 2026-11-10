# akhaliq/p-h3-image-pdmd-2step-lora

## Resumen

P-H3-Image pDMD 2-step student es un adaptador LoRA de destilación para el modelo de generación de imágenes PrunaAI/P-H3-Image, desarrollado por el usuario akhaliq. Su objetivo es reducir la inferencia de texto-a-imagen a 2 pasos de evaluación de función (NFE) mediante la receta pDMD (Progressive Distribution Matching Distillation), portada desde el repositorio oficial ZeamoxWang/pdmd al pipeline de diffusers. Técnicamente se trata de un LoRA de rango 128 aplicado sobre los módulos de atención y FFN del transformer del modelo base, entrenado con un crítico auxiliar y una actualización de surrogate normalizada por muestra.

El modelo es relevante como registro de entrenamiento y como evidencia empírica sobre los requisitos de dosis de datos en destilación few-step: el autor documenta explícitamente que el checkpoint está infraentrenado y que pierde su propia evaluación ciega frente al LoRA de vídeo pDMD y frente al baseline de 8 pasos. No se recomienda su uso en producción; el propio autor redirige a akhaliq/p-h3-image-turbo-lora para inferencia a 2 pasos validada.

La información disponible no incluye arquitectura detallada del modelo base, número de parámetros, longitud de contexto ni idiomas soportados, ya que se trata de un adaptador y no de un modelo completo. El repositorio ocupa 156,5 GB, mayoritariamente por artefactos de entrenamiento, muestras y checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de destilación sobre transformer de difusión (modelo base PrunaAI/P-H3-Image); receta pDMD 2-NFE |
| Parametros totales | no disponible (LoRA de rango 128 sobre 312 módulos attn/FFN; el modelo base no reporta cifra en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors; cuantización del base no especificada) |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license-agreement (excluye uso en UE/Reino Unido/Corea/EE. UU. sin licencia MiniMax separada; requiere atribución "Powered by MiniMax H3") |
| Formato de pesos | safetensors (LoRA: `transformer.<module>.lora_A/B.weight`, alpha=rank) |

## Arquitectura y entrenamiento

El adaptador se entrena con la receta pDMD 2-NFE verbatim: LoRA de estudiante y de crítico de rango 128 sobre 312 módulos de atención y FFN, TTUR 6:1, optimizador AdamW con betas (0, 0,9), learning rates 5e-5 para el estudiante y 1e-5 para el crítico, actualización de surrogate proyectada, normalizada por muestra y recortada a 5,0, rejilla de 2 segmentos sin desplazamiento, índice de salida ~ U{0,1}, tiempo de consulta intra-segmento y simulación hacia atrás. El entrenador controla directamente el pipeline de diffusers mediante hooks del transformer para garantizar condicionamiento y layout bit-exactos, con consultas al profesor y al crítico por sustitución de `hidden_states` y una sola repetición de gradiente por actualización.

Una convención descubierta durante el port es que este transformer predice velocidad hacia los datos (`x0 = x + σ·v`, `t = 1 − σ ∈ [0,1]`), con signo opuesto al wrapper H3 de DiffSynth. Se realizaron dos ejecuciones: una con batch 1 (600 actualizaciones del estudiante, terminada en ~iter 2000 por falta de diversidad de muestras) y otra con batch 8 y acumulación de gradiente, interrumpida en la actualización ~480 (de 1.280 planificadas) tras perder ~2,6 h por suspensión de plataforma y agotar el timeout de 8,75 h. El checkpoint evaluado es `student_iter000420`. La evaluación de referencia de pDMD usó ~9.000 muestras de estudiante; este mejor checkpoint solo tuvo 480.

## Capacidades

- Generación de imágenes texto-a-imagen a 2 pasos de evaluación de función (2 NFE) sobre el modelo base P-H3-Image.
- Destilación few-step: reduce el número de pasos de muestreo del modelo base, con el objetivo de acelerar la inferencia.
- Compatible con carga estándar de LoRA en diffusers (fusión y escala 1.0).
- Entrenamiento con crítico auxiliar y actualización de surrogate pDMD, con rejilla de 2 segmentos y simulación hacia atrás.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni thinking mode (no aplica a un modelo de texto-a-imagen).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Registro de entrenamiento y reproducibilidad: el repositorio conserva checkpoints (`student_iter000210`, `000420`, `000700`, `001400`), logs (`train_log.jsonl`), muestras con manifiestos JSON y artefactos de smoke-run, útiles para reproducir o auditar la receta pDMD en el pipeline de imágenes de diffusers.
- Investigación en destilación few-step: sirve como caso de estudio sobre la relación entre dosis de entrenamiento (480 frente a ~9.000 muestras) y calidad en pDMD, con una trayectoria documentada (limpieza de vela hacia iter ~140, texto mayormente corregido hacia ~350, pescador nunca limpio).
- Desarrollo de entrenadores personalizados: el script `train_pdmd_image.py` y las convenciones descubiertas (predicción de velocidad hacia los datos, hooks del transformer) sirven de base para portar pDMD a otros modelos de imagen en diffusers.
- Evaluación ciega de estudiantes destilados: el harness `render_student_eval.py` y el dataset `akhaliq/p-h3-student-eval` (6 prompts × 4 configuraciones, misma semilla a 2912×2912) son reutilizables para comparar LoRAs few-step.
- Base para reanudar entrenamiento: el autor indica que la brecha es de dosis, no de método, por lo que el checkpoint puede servir como inicialización para runs con batch efectivo ≥ 8 y varios miles de muestras.
- No recomendado para generación de imágenes en producción: el propio autor redirige a `akhaliq/p-h3-image-turbo-lora` para inferencia a 2 pasos validada.

## Benchmarks y rendimiento

Evaluación ciega a 2 pasos (6 prompts × 4 configuraciones, misma semilla a 2912×2912), según la model card:

| Configuración | Aciertos |
|---|---|
| Baseline 8 pasos | 5/6 |
| pDMD video LoRA (`pdmd2026/pdmd_2NFE_lora`) | 1/6 |
| Este estudiante pDMD 2-step (`student_iter000420`) | 0/6 |
| Base sin destilar a 2 pasos | 0/6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base PrunaAI/P-H3-Image, cuyos requisitos no se detallan en la información proporcionada. El LoRA en sí es de rango 128 y ocupa poco espacio adicional.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: diffusers (carga y fusión estándar de LoRA, escala 1.0). No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de imagen).
- Latencia y throughput: no disponibles; el objetivo declarado es 2 NFE frente a los 8 pasos del baseline, pero no se aportan medidas de tiempo.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Resultado eval ciega | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (`akhaliq/p-h3-image-pdmd-2step-lora`) | LoRA pDMD imagen | 2 | 0/6 | MiniMax H3 Community | Registro de entrenamiento, no recomendado |
| `pdmd2026/pdmd_2NFE_lora` | LoRA pDMD vídeo | 2 | 1/6 | no disponible | Recomendado por el autor para 2 pasos |
| `akhaliq/p-h3-image-turbo-lora` | LoRA turbo imagen | 2 | no disponible en la información | no disponible | Uso validado según el autor |
| Baseline P-H3-Image | Modelo base | 8 | 5/6 | MiniMax H3 Community | Referencia de calidad |

## Limitaciones y advertencias

- Infraentrenado: el mejor checkpoint acumuló 480 muestras de estudiante frente a las ~9.000 de la ejecución de referencia de pDMD.
- Pierde su propia evaluación ciega: 0/6 frente a 5/6 del baseline de 8 pasos y 1/6 del LoRA de vídeo pDMD.
- El autor lo declara explícitamente no recomendado para uso; se conserva como registro de entrenamiento.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de imagen, se traducen en artefactos visuales y fidelidad deficiente al prompt.
- Restricciones de licencia: la MiniMax H3 Community License excluye el uso en UE, Reino Unido, Corea y EE. UU. sin una licencia MiniMax separada, y exige la atribución "Powered by MiniMax H3".
- Dependencia del modelo base: hereda las limitaciones, sesgos y requisitos de PrunaAI/P-H3-Image.
- Repositorio de 156,5 GB, mayoritariamente artefactos de entrenamiento; no es un paquete ligero para despliegue.
- El entrenamiento sufrió suspensiones de plataforma y timeout; la reproducibilidad completa requiere checkpoints del estado del optimizador y logging asíncrono.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/p-h3-image-pdmd-2step-lora
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image
- Licencia del modelo base: https://huggingface.co/PrunaAI/P-H3-Image/blob/main/LICENSE
- Paper pDMD: https://arxiv.org/abs/2609.35768
- Repositorio pDMD: https://github.com/ZeamoxWang/pdmd
- Dataset de evaluación: https://huggingface.co/datasets/akhaliq/p-h3-student-eval
- LoRA de vídeo pDMD recomendado: https://huggingface.co/pdmd2026/pdmd_2NFE_lora
- LoRA turbo validado: https://huggingface.co/akhaliq/p-h3-image-turbo-lora
- Dashboard de entrenamiento (trackio): https://huggingface.co/spaces/akhaliq/p-h3-pdmd-2step-trackio
- ML Intern: https://hf.co/chat?mode=ml-intern
