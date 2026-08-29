# maskjp/mtdit-spatial-multitask-patch-tokens

## Resumen

MTDiT-Spatial es un modelo de política robótica multi-tarea basado en un transformer de difusión (diffusion transformer), desarrollado por Peng Jiang (alias maskjp) y publicado en Hugging Face bajo licencia Apache-2.0. La variante `patch_tokens` aquí descrita forma parte de un barrido de cinco arquitecturas que comparten el mismo entrenamiento, pero difieren en la ruta de visión y en el uso de dropout de estado. El modelo se entrenó sobre 949 episodios reales de un robot con 7 tareas, usando un dataset propio de 1,5 millones de frames a 50 Hz.

El interés principal de este modelo no es su rendimiento, sino su publicación como **resultado negativo**: a pesar de ajustar bien los datos de entrenamiento (pérdida de validación de 0,0017), el modelo ignora en gran medida las cámaras de escena y predice las articulaciones a partir de la propiocepción. La sensibilidad de la cámara de brazo es de 0,075 frente a un valor de referencia de ~1,0 para una política que sí rastrea la escena. Esta publicación es relevante para la comunidad de robótica porque documenta un fallo de grounding visual común en políticas entrenadas con joints absolutos, y sirve como baseline para investigar métricas de sensibilidad y técnicas de regularización como el state dropout.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con 4 capas, hidden 512, 8 cabezas, dropout 0.1, RoPE; encoder de visión y texto: CLIP ViT-B/16 |
| Parametros totales | 239.968.014 (según safetensors; la model card indica ~450M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventana de observación de 2 pasos, horizonte de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DDPM) con 100 timesteps de entrenamiento, horizonte de 32 pasos, 24 pasos ejecutados y 2 pasos de observación. La arquitectura usa 4 capas con dimensión oculta 512 y 8 cabezas de atención, con embeddings posicionales rotatorios (RoPE). La entrada visual proviene de tres cámaras fijas (480×640, redimensionadas a 240×320 y recortadas aleatoriamente a 224×224) procesadas por un CLIP ViT-B/16 con learning rate reducido a 0,1× respecto al resto. La entrada de estado es propioceptiva (joints absolutos de 10 dimensiones) y la salida son acciones de joints absolutos.

El entrenamiento se realizó sobre el dataset `l5vel-peng/base4-multitask-eef-merged-v30` con 7 tareas, 949 episodios y 1.524.905 frames, con un split de validación del 5% por tarea. Se usaron 100.000 pasos con batch 64, seed 1000, optimizador Adam con learning rate 3e-4, weight decay 0 y cosine decay sin warmup. La normalización es MEAN_STD para imágenes, MIN_MAX para estado y acciones. El checkpoint de 30K se extendió a 100K reanudando el entrenamiento, lo que re-estiró el schedule de coseno y provocó un aumento de pérdida en el paso 35K que se recuperó hacia el 65K. La pérdida de validación alcanzó el suelo en 30K (0,0017) y 3,3× más cómputo solo la redujo en 0,0001.

## Capacidades

- Generación de acciones de robot multi-tarea: predice joints absolutos (10 dimensiones) para 7 tareas de manipulación, con un horizonte de 32 pasos y 24 pasos ejecutados.
- Procesamiento de múltiples cámaras: acepta tres flujos de imagen (izquierda, derecha y cámara de pinza) a través de un encoder CLIP ViT-B/16.
- Integración con LeRobot: se puede cargar directamente con `make_policy` de la librería LeRobot, usando el plugin `mtdit_spatial`.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de política de bajo nivel, no un LLM.
- Capacidades multilingües: no aplica.
- Capacidad especial: se publica como resultado negativo, útil para estudiar atajos en aprendizaje por imitación y para validar métricas de sensibilidad de cámaras.

## Casos de uso

- Reproducción de resultados de investigación: el checkpoint permite reproducir exactamente el comportamiento documentado en la model card, incluyendo la baja sensibilidad de cámara, para verificar experimentos o comparar con nuevas arquitecturas.
- Baseline para estudios de grounding visual: sirve como punto de partida para medir si una política realmente utiliza la información visual de la escena, usando la métrica de sensibilidad de cámara descrita.
- Test case para métricas de sensibilidad: el script `vision_sensitivity.py` del repositorio asociado puede validarse con este modelo, ya que se conoce su valor de sensibilidad (0,075) y su null test (0,000).
- Comparación con variantes del mismo barrido: al publicarse junto con otras cuatro variantes (cls, spatial_softmax, con y sin state dropout), permite aislar el efecto de la ruta de visión y del dropout en el grounding.
- Estudio de atajos en aprendizaje por imitación: el modelo demuestra cómo la correlación entre joints absolutos y estado actual (0,96) facilita que la política ignore las cámaras; es un caso documentado para investigar este fenómeno.
- Desarrollo de métodos de regularización: los resultados del barrido muestran que el state dropout del 15% recupera 2,5–3,5× la sensibilidad de cámara con una penalización de pérdida del 12%, lo que convierte a este modelo en referencia para probar nuevas técnicas de regularización.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas para esta variante (`patch_tokens`):

| Métrica | Valor |
|---|---:|
| Pérdida de validación @ 100,000 | 0,0017 |
| Sensibilidad de cámara de brazo | 0,075 |
| Sensibilidad de cámara de pinza | 0,567 |
| Error de predicción de brazo (held-out) | 0,095 |
| Null test (cámaras propias) | 0,000 |

Como referencia, el autor indica que bajo el mismo evaluador, el `multi_task_dit` estándar en LIBERO puntúa 0,92–1,10 y π₀.₅ en LIBERO 1,19–1,31, pero estos valores corresponden a otros modelos y entornos, no a este checkpoint. No se reporta tasa de éxito en rollout con el robot real.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM ni de GPUs específicas en la información proporcionada.
- Con 239,9 millones de parámetros, el modelo es ligero en comparación con LLMs actuales; es probable que quepa en GPUs de consumo como una RTX 3060 o superior, pero no hay mediciones publicadas.
- El despliegue se realiza a través de LeRobot, que soporta inferencia en PyTorch estándar; no se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

La comparativa más directa es con las otras cuatro variantes del mismo barrido, publicadas por el mismo autor y entrenadas con el mismo dataset y configuración:

| Variante | Ruta de visión | State dropout | Pérdida validación | Sensibilidad brazo | Sensibilidad pinza |
|---|---|---|---:|---:|---:|
| `cls_nodrop` | cls | 0,00 | 0,0017 | 0,077 | 0,706 |
| `spatial_nodrop` | spatial_softmax | 0,00 | 0,0017 | 0,089 | 0,693 |
| **`patch_tokens`** | **patch_tokens** | **0,00** | **0,0017** | **0,075** | **0,567** |
| `spatial_mask` | spatial_softmax | 0,15 | 0,0019 | 0,272 | 0,930 |
| `cls_mask` | cls | 0,15 | 0,0020 | 0,198 | 0,922 |

Fuera de este barrido, el autor menciona que `multi_task_dit` y π₀.₅ en LIBERO obtienen sensibilidades de cámara de 0,92–1,10 y 1,19–1,31 respectivamente, pero no se proporcionan más detalles de esos modelos. No hay comparativas con otros modelos de política robótica en la información disponible.

## Limitaciones y advertencias

- **Ignora las cámaras de escena**: la sensibilidad de la cámara de brazo es 0,075, muy por debajo del valor de referencia ~1,0; el modelo predice joints a partir de la propiocepción, no de la visión.
- **Atajo por joints absolutos**: el entrenamiento con objetivos de joints absolutos correlaciona 0,96 con el estado actual, lo que facilita que la política ignore la entrada visual. Datasets con deltas por paso (como LIBERO, correlación −0,14) no muestran este problema.
- **Resultado negativo**: el autor advierte explícitamente que no debe desplegarse como política condicionada por visión; es útil solo como baseline de investigación.
- **Entorno limitado**: un solo robot, una sola embodiment y tres posiciones de cámara fijas; no se reporta tasa de éxito en rollout, solo métricas offline.
- **Sin datos de cuantización ni despliegue optimizado**: no hay información sobre formatos GGUF, ONNX u otros, ni sobre requisitos de hardware en producción.
- **Licencia Apache-2.0**: permite uso comercial, pero las limitaciones funcionales hacen que su uso en producción sea desaconsejable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maskjp/mtdit-spatial-multitask-patch-tokens
- Variante `cls_nodrop`: https://huggingface.co/maskjp/mtdit-spatial-multitask-cls-nodrop
- Variante `spatial_nodrop`: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-nodrop
- Variante `spatial_mask`: https://huggingface.co/maskjp/mtdit-spatial-multitask-spatial-mask
- Variante `cls_mask`: https://huggingface.co/maskjp/mtdit-spatial-multitask-cls-mask
- Repositorio del plugin y script de sensibilidad: https://github.com/maskjp/lerobot_policy_mtdit_spatial
- Perfil del autor: https://huggingface.co/maskjp
