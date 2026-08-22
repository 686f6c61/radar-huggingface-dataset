# bi199797/VR-egodex-qwen36-27b-lora-caption-boundary

## Resumen

El modelo `bi199797/VR-egodex-qwen36-27b-lora-caption-boundary` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3.6-27B` (arquitectura `qwen3_5`, híbrida GatedDeltaNet + atención completa), desarrollado por el autor `bi199797`. Su propósito es resolver la tarea de **localización temporal de segmentos de acción en vídeo egocéntrico**: dado un vídeo y una lista ordenada de descripciones textuales de acciones (sin tiempos), el modelo predice el intervalo `MM:SS.d - MM:SS.d` correspondiente a cada segmento. Se trata de la segunda etapa de un pipeline de dos pasos, donde un modelo de captioning aporta el *qué* y este adaptador aporta el *cuándo*.

La relevancia del modelo radica en que aborda un problema específico de anotación de vídeo egocéntrico con un diseño de entrenamiento que evita el atajo de copiar timestamps: la entrada elimina por completo los tiempos, forzando al modelo a fundamentar sus predicciones en el contenido visual real. Según los datos de evaluación publicados, alcanza un `timestamp_score` de 0.6868 en una muestra de validación, superando claramente al modelo hermano sin condicionamiento textual (0.6048). El adaptador tiene unos 200,3 millones de parámetros entrenables (0,73 % del total) y está publicado en formato PEFT con safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.6-27B (híbrida GatedDeltaNet + full-attention) con adaptador LoRA (rsLoRA) |
| Parametros totales | 27,6B (base) + ~200,3M (adaptador entrenable) |
| Parametros activos | Todos los del base (no es MoE) |
| Longitud de contexto | 40,960 tokens (máximo de entrenamiento) |
| Tipos de cuantizacion | no disponible (base en bf16, adaptador safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.6-27B`, un transformer denso de 27.000 millones de parámetros con arquitectura `qwen3_5`, que combina capas de atención completa con capas basadas en GatedDeltaNet (un mecanismo de atención lineal con estado recurrente). Sobre este base se ha entrenado un adaptador LoRA con escalado rsLoRA (`lora_r=32`, `lora_alpha=64`, `lora_dropout=0.05`) que afecta únicamente a las proyecciones de atención (`q/k/v/o_proj`) y a las capas de MLP (`gate/up/down_proj`) del módulo de lenguaje, sin tocar la torre de visión. Esto supone unos 200,3 millones de parámetros entrenables (0,73 % del total).

El entrenamiento se realizó sobre 19.672 episodios del dataset EgoDex, con una configuración de 2 épocas (1.230 pasos), batch efectivo de 16 (1 × 16 grad-accum), tasa de aprendizaje 1e-4 con programación coseno y warmup del 3 %, weight decay 0.01, muestreo de vídeo a 2 fps con máximo de 128 frames y 272.384 píxeles por frame, y longitud máxima de secuencia de 40.960 tokens. Se usó precisión bf16 y un clúster de 2× NVIDIA H100 80GB. La innovación clave del diseño es que los timestamps se eliminan por completo de la entrada (solo se proporciona el texto de los segmentos), de modo que el modelo no puede copiarlos y debe realizar un grounding visual real para predecir los intervalos.

## Capacidades

- Localización temporal de segmentos de acción en vídeo egocéntrico: dado un vídeo y una lista ordenada de descripciones de acciones, predice el intervalo `MM:SS.d - MM:SS.d` para cada una.
- Condicionamiento por texto: integra las descripciones textuales de los segmentos como contexto del episodio en el prompt, mejorando la precisión frente a la localización sin texto.
- Salida estructurada: genera una línea por segmento, en el mismo orden, con el primer inicio en `00:00.0` y el final coincidiendo con el último frame del vídeo.
- Integración en pipeline de dos etapas: funciona como segundo paso tras un modelo de captioning (p. ej. `bi199797/VR-egodex-narration-qwen36-27b-lora-vision12-lr1e5`), que proporciona el texto de las acciones.
- No es un modelo de propósito general: no soporta tool calling, agentes ni razonamiento multi-paso fuera de su tarea específica.

## Casos de uso

- Anotación automática de datasets de vídeo egocéntrico: el modelo puede asignar tiempos a segmentos de acción ya transcritos, reduciendo el trabajo manual de etiquetado en conjuntos como EgoDex o similares.
- Indexación temporal de grabaciones con cámara corporal: permite generar índices con tiempos precisos para vídeos de actividades cotidianas, útil en aplicaciones de búsqueda y recuperación de contenido.
- Análisis de comportamiento en entornos de realidad virtual o aumentada: al localizar acciones descritas, facilita el estudio de interacciones humano-entorno en secuencias egocéntricas.
- Generación de subtítulos temporizados para vídeo egocéntrico: combinado con un modelo de captioning, produce descripciones con marcas de tiempo listas para su uso en herramientas de accesibilidad o documentación.
- Validación y corrección de anotaciones existentes: si se dispone de listas de acciones sin tiempos, el modelo puede re-timarlas de forma consistente, sirviendo como verificación cruzada en pipelines de anotación.
- Investigación en localización temporal de acciones: sirve como punto de partida para experimentos sobre el efecto del condicionamiento textual en la predicción de límites temporales en vídeo egocéntrico.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación durante el entrenamiento sobre una muestra de 24 episodios del conjunto de validación (eje `timestamp`, solo IoU de límites sin texto). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo es un adaptador especializado.

| Paso | timestamp_score | eval_loss |
|---|---|---|
| 100 | 0.6664 | -- |
| 600 | 0.6587 | -- |
| 1000 | 0.6903 | -- |
| 1100 (pico) | 0.6983 | -- |
| 1230 (final) | 0.6868 | 0.1259 |

En comparación, el modelo hermano sin condicionamiento textual (solo vídeo) alcanza un `timestamp_score` de 0.6048 en la misma muestra de evaluación, lo que indica una mejora de +0.082 al incorporar el texto de los segmentos. El autor señala que aún no se ha medido el rendimiento extremo a extremo con captions predichas por un modelo de captioning (solo se ha evaluado con texto ground-truth).

## Requisitos de hardware

- El modelo base de 27B en bf16 requiere aproximadamente 54 GB de VRAM solo para los pesos, más memoria para activaciones y el adaptador.
- Para inferencia en bf16 se recomienda al menos una GPU con 80 GB (p. ej. A100 80GB, H100 80GB) o dos GPU de 48 GB en paralelo.
- Con cuantización (p. ej. 4-bit o 8-bit) podría caber en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se han publicado configuraciones oficiales de cuantización para este adaptador.
- El adaptador LoRA es ligero (~0.8 GB en safetensors) y se puede cargar sobre el base con `PeftModel`.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), o directamente con `transformers` + `peft` en Python. No se han publicado mediciones de latencia o throughput.
- El entrenamiento se realizó con 2× NVIDIA H100 80GB usando `device_map=auto`.

## Comparativa con modelos similares

| Modelo | Base | Parámetros entrenables | Contexto | timestamp_score | Licencia |
|---|---|---|---|---|---|
| `VR-egodex-qwen36-27b-lora-caption-boundary` (este) | Qwen3.6-27B | ~200,3M | 40,960 | 0.6868 | other |
| `VR-egodex-qwen36-27b-lora-boundary` (hermano sin texto) | Qwen3.6-27B | no disponible | no disponible | 0.6048 | other |
| `Qwen/Qwen3.6-27B` (base sin adaptar) | -- | -- | no disponible | no aplica | Apache 2.0 (según documentación de Qwen, aunque no verificado aquí) |

No se dispone de comparación con otros modelos de localización temporal de acciones en vídeo egocéntrico en la información proporcionada. El modelo base Qwen3.6-27B destaca en benchmarks de código (77.2 % en SWE-bench Verified) y supera a modelos MoE mucho mayores, pero no es directamente comparable con este adaptador especializado.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para vídeo egocéntrico con segmentos de acción predefinidos; no es apto para otras tareas de vídeo o texto.
- La evaluación publicada se realizó con texto ground-truth, no con captions predichas por un modelo de captioning. El rendimiento extremo a extremo podría degradarse si el texto de entrada contiene errores.
- No se han documentado sesgos específicos, pero al estar entrenado en un dataset concreto (EgoDex), puede no generalizar bien a otros dominios o estilos de vídeo.
- Riesgo de alucinación: si el texto de los segmentos no corresponde con el contenido visual, el modelo podría generar timestamps plausibles pero incorrectos.
- La licencia se indica como `other`, sin especificar términos concretos; se debe contactar con el autor o revisar el repositorio de entrenamiento antes de un uso comercial.
- No se han publicado detalles sobre los idiomas soportados ni sobre el rendimiento en vídeos con más de 128 frames o resoluciones superiores a las usadas en el entrenamiento.
- El adaptador requiere cargar el modelo base completo (~27B), lo que implica requisitos de hardware elevados para despliegue local.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bi199797/VR-egodex-qwen36-27b-lora-caption-boundary
- Modelo hermano sin condicionamiento textual: https://huggingface.co/bi199797/VR-egodex-qwen36-27b-lora-boundary
- Modelo de captioning (primera etapa del pipeline): https://huggingface.co/bi199797/VR-egodex-narration-qwen36-27b-lora-vision12-lr1e5
- Repositorio de entrenamiento: https://github.com/VietnamFoundationRobotics/VR-finetune-VLM
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Guía sobre Qwen 3.6-27B: https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Análisis de Qwen 3.6-27B: https://www.buildfastwithai.com/blogs/qwen3-6-27b-review-2026
- Guía de Qwen 3.6 (27B y 35B-A3B): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
