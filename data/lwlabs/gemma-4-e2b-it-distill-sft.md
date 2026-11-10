# lwlabs/gemma-4-E2B-it-distill-sft

## Resumen
`lwlabs/gemma-4-E2B-it-distill-sft` es un ajuste fino supervisado (SFT) del modelo `google/gemma-4-E2B-it`, publicado por el usuario lwlabs en Hugging Face. Se trata de un adaptador LoRA entrenado mediante `SFTTrainer` de la librería TRL sobre un corpus de destilación multi-profesor denominado `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, que recoge trazas generadas por Qwen3.8-Max-Preview, GLM-5.2 y Kimi Code K3, filtradas por calidad y deduplicadas.

El objetivo del proyecto es trasladar el comportamiento de modelos de mayor tamaño a un modelo pequeño de la familia Gemma 4 (variante E2B, presumiblemente de escala reducida) mediante destilación de trazas y ajuste supervisado. El LoRA afecta únicamente a la ruta del modelo de lenguaje; las torres de visión y audio del modelo base quedan intactas, lo que sugiere que el modelo base es multimodal.

En el momento de redactar esta ficha, la model card indica explícitamente que el repositorio está "awaiting training run": no se han publicado métricas, muestras de generación ni resultados de evaluación. Las descargas y los likes son cero y el repositorio se creó y actualizó el 10 de noviembre de 2026. Por tanto, la ficha describe la configuración declarada, no un artefacto validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `google/gemma-4-E2B-it`); ajuste mediante LoRA sobre la ruta del modelo de lenguaje |
| Parametros totales | no disponible (no se declara el tamaño del modelo base ni del adaptador) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible para el modelo final; el entrenamiento usó empaquetado de secuencias a 4096 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el entrenamiento se realizó en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio contiene un adaptador LoRA; no se especifican los ficheros) |

## Arquitectura y entrenamiento
El modelo parte de `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 en su variante E2B con capacidad multimodal (la model card menciona torres de visión y audio que el LoRA no modifica). Sobre esa base se aplica un adaptador LoRA restringido a la ruta del modelo de lenguaje, entrenado con `SFTTrainer` de TRL en precisión bf16, con `assistant_only_loss=True` (la pérdida se calcula solo sobre los turnos del asistente) y empaquetado de secuencias a 4096 tokens.

El corpus de entrenamiento es `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, configuración `sft_final`, compuesto por trazas destiladas de tres profesores (Qwen3.8-Max-Preview, GLM-5.2 y Kimi Code K3) sometidas a filtrado de calidad y deduplicación. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros del LoRA (rango, alpha, capas objetivo) ni si hubo fases posteriores de RLHF o DPO. La model card indica que el entrenamiento aún no se ha ejecutado, por lo que no existen métricas de pérdida ni comparaciones base vs. ajustado.

## Capacidades
- Generación de texto y razonamiento conversacional heredados del modelo base Gemma 4 E2B instruct.
- Destilación orientada a tareas de código y razonamiento, dado que dos de los profesores del corpus (GLM-5.2 y Kimi Code K3) son modelos con foco en código.
- Capacidades multimodales (visión y audio) potencialmente conservadas del modelo base, ya que el LoRA no toca esas torres; no obstante, no se han publicado evaluaciones que lo confirmen.
- Soporte de tool calling y function calling: no disponible (no se documenta explícitamente en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo "thinking" o razonamiento extendido: no disponible.

## Casos de uso
- Prototipado de asistentes conversacionales ligeros: el modelo, al derivar de una variante E2B de Gemma 4, está pensado para despliegues con recursos limitados; el ajuste SFT sobre trazas de asistentes puede mejorar la calidad de respuesta en diálogo respecto al base, aunque no hay evidencia publicada.
- Generación de código asistida en entornos de desarrollo: el corpus de destilación incluye trazas de Kimi Code K3 y GLM-5.2, orientadas a código, por lo que el ajuste busca transferir ese estilo de resolución de problemas de programación a un modelo pequeño.
- Razonamiento paso a paso en tareas educativas: el uso de `assistant_only_loss` sobre trazas de profesores grandes sugiere un entrenamiento para producir explicaciones estructuradas; adecuado para tutores automáticos de bajo coste.
- Evaluación comparativa de técnicas de destilación: el repositorio sirve como artefacto de investigación para estudiar si la destilación multi-profesor mejora a un modelo pequeño frente a su versión instruct original.
- Despliegue en el borde (edge) o en dispositivos con poca VRAM: al ser un adaptador LoRA sobre un modelo E2B, puede combinarse con el base cuantizado para inferencia en hardware de consumo, siempre que se valide su calidad.
- Base para ajustes posteriores: la model card incluye un enlace para continuar el entrenamiento, por lo que el adaptador puede usarse como punto de partida en pipelines de SFT adicionales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas (pérdida en el split de validación del dataset) y las generaciones de muestra aparecerán en `samples.md` y en el dashboard de Trackio una vez finalice el entrenamiento, que en el momento de la publicación aún no se había ejecutado.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. Al no declararse el número de parámetros del modelo base, no puede estimarse con rigor; la nomenclatura E2B sugiere una variante de escala pequeña, pero no se confirma.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; dependerá del tamaño real del base y de la cuantización elegida.
- Opciones de despliegue: no documentadas. Al ser un adaptador LoRA, requeriría cargarse junto al modelo base `google/gemma-4-E2B-it` en frameworks compatibles con PEFT (por ejemplo, transformers + PEFT), pero el autor no especifica ninguna.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| lwlabs/gemma-4-E2B-it-distill-sft | no disponible | no disponible | Apache 2.0 | Adaptador LoRA; entrenamiento pendiente |
| google/gemma-4-E2B-it | no disponible | no disponible | no disponible en la informacion | Modelo base oficial |
| Alternativas de destilación multi-profesor | no disponible | no disponible | no disponible | No se han identificado comparables en la informacion proporcionada |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables documentadas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias
- El entrenamiento no se había completado en el momento de la publicación: el repositorio es un artefacto en estado "awaiting training run" y no debe considerarse un modelo validado.
- No hay métricas de evaluación, muestras de generación ni comparaciones con el modelo base; se desconoce si el ajuste mejora o degrada el rendimiento.
- No se declaran los idiomas soportados; el comportamiento multilingüe es incierto.
- No se documentan sesgos conocidos, pero al derivar de Gemma 4 y de trazas de profesores externos, puede heredar sesgos de ambos.
- Riesgo de alucinación: no evaluado; los modelos pequeños destilados de profesores grandes pueden reproducir estilos de respuesta sin la misma fiabilidad factual.
- Restricciones de licencia: el repositorio declara Apache 2.0, pero el modelo base `google/gemma-4-E2B-it` puede tener sus propias condiciones de uso que prevalezcan al combinar ambos; conviene verificar la licencia del base antes de un uso comercial.
- El LoRA no modifica las torres de visión y audio; cualquier capacidad multimodal es la del modelo base y no ha sido ajustada.
- No se especifican hiperparámetros del adaptador ni el formato de los pesos, lo que dificulta la reproducibilidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/lwlabs/gemma-4-E2B-it-distill-sft
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de destilación: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- Dashboard de Trackio: https://huggingface.co/spaces/lwlabs/gemma4-e2b-distill-sft-trackio
- Muestras de generación (referenciadas, no verificadas): ./samples.md en el repositorio
