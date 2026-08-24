# sadjava/smolvla-video-expert-libero90-s1000

## Resumen

El modelo `sadjava/smolvla-video-expert-libero90-s1000` es un preentrenamiento de video residual sin acciones (action-free) del experto de acción SmolVLA, desarrollado por el usuario sadjava. Se entrena sobre el dataset `nvidia/libero_90` (RGB, sin etiquetas de acción ni estado) y predice el residuo SigLIP entre frames `x_{t+Δ} − x_t` con Δ=8. Está inicializado desde `lerobot/smolvla_base` y contiene los pesos completos del experto de acción (sin LoRA). Con 450 millones de parámetros, este modelo está diseñado como punto de partida para fine-tuning few-shot en tareas de robótica LIBERO-Goal, usándose como `--policy.path` en flujos de entrenamiento con LeRobot. Su relevancia radica en permitir un preentrenamiento eficiente de representaciones visuales temporales para políticas de manipulación robótica, reduciendo la necesidad de datos etiquetados con acciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action, transformer) |
| Parametros totales | 450.046.176 (450M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente FP32/FP16) |
| Idiomas soportados | no disponibles (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, pesos fusionados) |

## Arquitectura y entrenamiento

SmolVLA es un modelo Vision-Language-Action de 450M parámetros basado en transformer, diseñado para robótica. Este checkpoint concreto es un "video expert" que se entrena de forma autosupervisada: recibe secuencias de frames RGB del dataset `nvidia/libero_90` y debe predecir el residuo entre representaciones SigLIP de frames separados por Δ=8. No se usan etiquetas de acción ni estado, lo que lo convierte en un preentrenamiento puramente visual-temporal. La inicialización parte de `lerobot/smolvla_base` y los pesos resultantes son los del experto de acción completo, sin adaptadores LoRA. El entrenamiento se realiza con la librería LeRobot y los hiperparámetros se documentan en `video_expert.json` (si se subió). No se especifican detalles adicionales como número de tokens, composición del dataset o uso de RLHF/DPO.

## Capacidades

- Predicción de residuos visuales temporales: dado un frame en t, predice la diferencia de características SigLIP con el frame en t+8, capturando dinámicas de movimiento.
- Preentrenamiento para fine-tuning few-shot: diseñado para ser usado como inicialización en tareas LIBERO-Goal, permitiendo adaptación con pocas demostraciones (2, 5, 10 o 25 demos según la colección del autor).
- Integración con LeRobot: compatible con el pipeline de entrenamiento y evaluación de políticas robóticas de LeRobot.
- Sin soporte de tool calling, agentes ni generación de lenguaje: es un modelo puramente robótico, no un LLM generalista.
- Capacidades multilingües: no aplica, al no procesar texto.

## Casos de uso

- Fine-tuning few-shot en LIBERO-Goal: el uso principal es como `--policy.path` para adaptar SmolVLA a tareas específicas de manipulación (abrir cajas, recoger objetos, etc.) con pocas demostraciones. Su preentrenamiento en video residual acelera la convergencia y mejora la generalización.
- Aprendizaje de representaciones visuales para robótica: puede servir como extractor de características temporales en pipelines de aprendizaje por refuerzo o imitación, donde se necesite capturar dinámicas de objetos.
- Evaluación de políticas en simulación: al estar entrenado en LIBERO, es adecuado para benchmarks de manipulación en entornos simulados, permitiendo comparar estrategias de preentrenamiento.
- Investigación en preentrenamiento autosupervisado para VLA: útil para estudiar el impacto de objetivos de video residual frente a otros objetivos (acción, estado) en el rendimiento final de políticas robóticas.
- Base para experimentos de ablación: al ser un checkpoint intermedio, permite analizar qué información visual-temporal es crítica para tareas de goal-conditioned manipulation.
- Entrenamiento en hardware de consumo: con 450M parámetros, el fine-tuning es viable en GPUs como RTX 4060 (8GB VRAM) según referencias del ecosistema SmolVLA, lo que lo hace accesible para laboratorios pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este checkpoint es un preentrenamiento intermedio, no un modelo final evaluado en tareas estándar. Para métricas de rendimiento, habría que consultar los resultados de fine-tuning en LIBERO-Goal, que no se incluyen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M parámetros, en FP32 (~1.8GB) o FP16 (~0.9GB), cabe en cualquier GPU moderna con al menos 4GB de VRAM. Para fine-tuning, se recomienda al menos 8GB (como la RTX 4060) según referencias del ecosistema SmolVLA.
- GPU recomendadas: RTX 3060/4060 (8GB) para fine-tuning; cualquier GPU con 4GB+ para inferencia. Para entrenamiento más rápido, RTX 3090/4090 o A100.
- Compatibilidad con consumer GPU: sí, es uno de los puntos fuertes de SmolVLA (450M) frente a modelos VLA más grandes (7B+).
- Opciones de despliegue: LeRobot (librería principal), con soporte para exportar a formatos de inferencia como ONNX o TensorRT si se requiere. No se menciona vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware y de la longitud de la secuencia de video procesada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este checkpoint específico. Como referencia del ecosistema SmolVLA, se puede comparar con otros VLA:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este) | 450M | no disponible | no disponible | HuggingFace |
| OpenVLA | 7B | 2048 tokens | MIT | HuggingFace |
| RT-2 (PaLI-X) | 55B | 2048 tokens | propietario | no abierto |

SmolVLA destaca por su tamaño reducido (450M) frente a alternativas de 7B o más, lo que permite fine-tuning en hardware de consumo. Sin embargo, no hay benchmarks públicos que comparen su rendimiento con estos modelos en tareas robóticas estándar.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento, no un modelo listo para producción: requiere fine-tuning en tareas específicas antes de su uso.
- Licencia no especificada: no se indica si permite uso comercial o restricciones, lo que puede ser un problema para despliegues empresariales.
- Sin soporte de lenguaje natural: no puede procesar instrucciones textuales directamente; depende del pipeline de SmolVLA que integra visión y lenguaje.
- Sesgos y alucinaciones: al ser un modelo visual, no aplica alucinación textual, pero puede tener sesgos en la representación de objetos o escenas derivados del dataset LIBERO (entornos simulados limitados).
- Limitaciones de contexto: no se especifica la longitud de contexto visual; el entrenamiento con Δ=8 puede no capturar dependencias temporales largas.
- Riesgo de sobreajuste: al entrenarse en LIBERO-90, puede generalizar mal a entornos del mundo real o a tareas fuera de la distribución del dataset.
- Fecha de creación futura (2026-08-23): el modelo está fechado en el futuro, lo que sugiere que puede ser un artefacto experimental o un error de metadatos; verificar su validez antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sadjava/smolvla-video-expert-libero90-s1000
- Colección del autor (fine-tuning naive): https://huggingface.co/collections/sadjava/libero-goal-ft-naive
- Repo de referencia SmolVLA en GitHub: https://github.com/goelshivam1210/smolvla (entrenamiento de SmolVLA en LIBERO con LoRA)
- Repo alternativo de fine-tuning: https://github.com/wycliffeoleti/smolVLA (fine-tuning en hardware de consumo)
