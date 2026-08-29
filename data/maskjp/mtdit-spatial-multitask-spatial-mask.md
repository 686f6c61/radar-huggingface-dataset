# maskjp/mtdit-spatial-multitask-spatial-mask

## Resumen

MTDiT-Spatial es una política de difusión multi-tarea para robótica, desarrollada por maskjp sobre la librería LeRobot. Se trata de un diffusion transformer (DiT) de 239 millones de parámetros entrenado sobre 949 episodios reales de 7 tareas distintas, con observaciones de tres cámaras y estado propioceptivo. El modelo se publica explícitamente como un **resultado negativo**: aunque ajusta bien los datos de entrenamiento, ignora en gran medida las cámaras de escena y predice los objetivos articulares a partir de la propiocepción, con una sensibilidad de cámara de brazo de 0.272 frente a un suelo de 0.000 y una referencia de ~1.0 para una política correctamente condicionada por visión.

La relevancia de este modelo no reside en su despliegue práctico, sino en su valor como caso de estudio para la comunidad de robótica y aprendizaje por imitación. Documenta un fallo de grounding visual común en políticas entrenadas con objetivos de articulaciones absolutas, y proporciona un conjunto de cinco variantes (sweep) que permiten reproducir el fenómeno, comparar arquitecturas de visión y validar métricas de sensibilidad. El autor publica todas las variantes junto con un protocolo de evaluación riguroso basado en números aleatorios comunes y pruebas nulas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) multi-tarea con codificadores CLIP ViT-B/16 para visión y texto |
| Parametros totales | 239.456.053 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (procesa imágenes 224×224 y estado propioceptivo; no es un modelo de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible (el modelo no genera texto; el condicionamiento textual usa embeddings CLIP) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un diffusion transformer multi-tarea: 4 capas transformer con dimensión oculta 512, 8 cabezas de atención, dropout 0.1 y posicionales rotatorios (RoPE). El objetivo de entrenamiento es DDPM con 100 timesteps de difusión, horizonte de 32 pasos, 24 pasos ejecutados y 2 pasos de observación. La variante `spatial_mask` usa una ruta de visión basada en `spatial_softmax` y aplica un dropout del 15% sobre el estado propioceptivo durante el entrenamiento, lo que fuerza parcialmente al modelo a depender de las cámaras.

El entrenamiento se realizó sobre el dataset `l5vel-peng/base4-multitask-eef-merged-v30`, que contiene 7 tareas, 949 episodios y 1.524.905 frames muestreados a 50 Hz, con un split de validación del 5% por tarea. El espacio de acción son articulaciones absolutas de 10 dimensiones. Se usaron 100.000 pasos con batch 64, optimizador Adam a tasa 3e-4 sin warmup y decaimiento coseno. Los codificadores CLIP se congelaron parcialmente (learning rate ×0.1). Las imágenes de tres cámaras se redimensionaron de 480×640 a 240×320 y se recortaron aleatoriamente a 224×224. La normalización es MEAN_STD para visión, MIN_MAX para estado y acciones.

El hallazgo principal del estudio es la inversión entre pérdida de validación y grounding visual: las variantes con menor pérdida son las que menos atienden a las cámaras, mientras que las que aplican dropout de estado recuperan entre 2.5 y 3.5 veces la sensibilidad de cámara a cambio de una penalización de pérdida de aproximadamente el 12%. Esta inversión es el resultado central que motiva la publicación conjunta de las cinco variantes.

## Capacidades

- Generación de acciones de robot: produce secuencias de 24 pasos de articulaciones absolutas (10 dimensiones) condicionadas por observaciones.
- Multi-tarea: entrenado en 7 tareas de manipulación con un único conjunto de pesos.
- Condicionamiento visual: procesa tres flujos de cámara (izquierda, derecha y gripper) mediante CLIP ViT-B/16.
- Condicionamiento por lenguaje: acepta instrucciones textuales codificadas con el encoder de texto de CLIP.
- Sensibilidad de cámara de gripper: 0.930, lo que indica que sí utiliza la cámara del gripper para parte de la predicción.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM; es una política de bajo nivel para control de robot.

## Casos de uso

- Reproducción de resultados de investigación: el checkpoint permite replicar exactamente las métricas publicadas (pérdida 0.0019, sensibilidad 0.272) y sirve como punto de partida para estudios que necesiten un baseline conocido de fallo de grounding.
- Baseline para trabajo en visual grounding: cualquier método que pretenda mejorar la atención a cámaras de escena puede compararse contra esta variante y sus hermanas del sweep.
- Test case para métricas de sensibilidad: el protocolo de evaluación (números aleatorios comunes, prueba nula) está diseñado para validar si una métrica mide realmente la dependencia visual; este modelo es un banco de pruebas ideal.
- Análisis de atajos en aprendizaje por imitación: el modelo demuestra cómo la correlación entre estado actual y acción absoluta (0.96) permite ignorar la visión; es un caso documentado para estudiar este fenómeno.
- Desarrollo de métodos de regularización: el dropout de estado aplicado aquí (0.15) es una técnica que otros investigadores pueden adoptar o mejorar para forzar el uso de la visión.
- Comparación de arquitecturas de visión: junto con las variantes `cls_nodrop`, `spatial_nodrop`, `patch_tokens` y `cls_mask`, permite evaluar el impacto de `spatial_softmax`, tokens de parche y máscaras en el grounding.

## Benchmarks y rendimiento

La model card reporta métricas offline sobre el split de validación. No se han publicado tasas de éxito en entornos reales ni simulados.

| Metrica | Valor |
|---|---|
| Pérdida de validación @ 100.000 pasos | 0.0019 |
| Sensibilidad de cámara de brazo | 0.272 |
| Sensibilidad de cámara de gripper | 0.930 |
| Error de predicción de brazo (held-out) | 0.102 |
| Prueba nula (cámaras propias) | 0.000 |

Comparación con las otras variantes del mismo sweep:

| Variante | Ruta de visión | State dropout | Pérdida val | Sensibilidad brazo | Sensibilidad gripper |
|---|---|---|---|---|---|
| `cls_nodrop` | cls | 0.00 | 0.0017 | 0.077 | 0.706 |
| `spatial_nodrop` | spatial_softmax | 0.00 | 0.0017 | 0.089 | 0.693 |
| `patch_tokens` | patch_tokens | 0.00 | 0.0018* | * | * |
| `spatial_mask` (este modelo) | spatial_softmax | 0.15 | 0.0019 | 0.272 | 0.930 |
| `cls_mask` | cls | 0.15 | 0.0020 | 0.198 | 0.922 |

*`patch_tokens` es ~1.8× más lento por paso y aún estaba en entrenamiento en el momento de la publicación; su pérdida de 0.0018 corresponde a 75K pasos.

Como referencia bajo el mismo evaluador, el `multi_task_dit` estándar sobre LIBERO puntúa entre 0.92 y 1.10 en sensibilidad, y π₀.₅ entre 1.19 y 1.31.

## Requisitos de hardware

- VRAM estimada: con 239 millones de parámetros, el modelo en fp32 ocupa aproximadamente 0.96 GB; en fp16 unos 0.48 GB. La inferencia de difusión requiere mantener el modelo y los tensores intermedios, por lo que se recomiendan al menos 2 GB de VRAM para fp16.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 3090, RTX 4090) es suficiente. Para entrenamiento o fine-tuning, una RTX 3090 o superior con 24 GB es adecuada.
- Despliegue: se integra con LeRobot mediante `make_policy("maskjp/mtdit-spatial-multitask-spatial-mask")`. Requiere el plugin `mtdit_spatial` del repositorio `maskjp/lerobot_policy_mtdit_spatial`.
- Latencia: no se han publicado mediciones de latencia. Dado que la política de difusión ejecuta 24 pasos de denoising, la inferencia será más lenta que una política de regresión directa; el autor indica que `patch_tokens` es ~1.8× más lento por paso que las variantes con `spatial_softmax` o `cls`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Sensibilidad cámara brazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mtdit-spatial-multitask-spatial-mask` (este) | 239 M | imágenes + estado | 0.272 | Apache-2.0 | HuggingFace |
| `mtdit-spatial-multitask-cls-nodrop` | 239 M (estimado) | imágenes + estado | 0.077 | Apache-2.0 | HuggingFace |
| `mtdit-spatial-multitask-spatial-nodrop` | 239 M (estimado) | imágenes + estado | 0.089 | Apache-2.0 | HuggingFace |
| `mtdit-spatial-multitask-cls-mask` | 239 M (estimado) | imágenes + estado | 0.198 | Apache-2.0 | HuggingFace |
| `multi_task_dit` estándar (LIBERO) | no disponible | imágenes + estado | 0.92–1.10 | no disponible | no disponible |
| π₀.₅ (LIBERO) | no disponible | imágenes + estado | 1.19–1.31 | no disponible | no disponible |

La comparativa se limita a las variantes del mismo sweep y a las referencias citadas en la model card. No se dispone de datos públicos de otros modelos comparables con la misma métrica de sensibilidad.

## Limitaciones y advertencias

- **Ignora las cámaras de escena**: la sensibilidad de cámara de brazo es 0.272, muy por debajo de la referencia ~1.0. Las cámaras izquierda y derecha contribuyen menos que la del gripper.
- **Atajo por correlación estado-acción**: el modelo se entrena con objetivos de articulaciones absolutas que correlacionan 0.96 con el estado actual, lo que permite predecir sin usar la visión. Este atajo no aparece en datasets con deltas por paso (p. ej., LIBERO, con correlación −0.14).
- **No apto para despliegue**: el autor advierte explícitamente que no debe usarse como política condicionada por visión en producción.
- **Sin tasa de éxito en rollout**: solo se reportan métricas offline; no hay evaluación en entorno real o simulado.
- **Generalización limitada**: entrenado con un único robot, un único embodiment y tres poses de cámara fijas.
- **Problemas de entrenamiento**: el checkpoint de 30K se extendió a 100K reanudando el entrenamiento, lo que re-estiró el schedule coseno y causó un aumento de pérdida en el paso 35K que se recuperó hacia el 65K. El suelo de pérdida ya se alcanzó en 30K; el cómputo adicional solo lo movió 0.0001.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-mask
- Repositorio del plugin y scripts de evaluación: https://github.com/maskjp/lerobot_policy_mtdit_spatial
- Variante `cls_nodrop`: https://huggingface.co/maskjp/mtdit-spatial-multitask-cls-nodrop
- Variante `spatial_nodrop`: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-nodrop
- Variante `patch_tokens`: https://huggingface.co/maskjp/mtdit-spatial-multitask-patch-tokens
- Variante `cls_mask`: https://huggingface.co/maskjp/mtdit-spatial-multitask-cls-mask
- Dataset de entrenamiento: https://huggingface.co/datasets/l5vel-peng/base4-multitask-eef-merged-v30
