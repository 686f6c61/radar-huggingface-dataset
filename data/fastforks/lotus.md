# fastforks/lotus

## Resumen

Lotus es un modelo de estimación de normales de superficie (surface normals) y profundidad monocular desarrollado por el equipo EnVision-Research (He et al., ICLR 2025). Se construye sobre el UNet de Stable Diffusion 2, afinado para predecir el latente de normales en un solo paso, lo que evita el coste iterativo de los pipelines de difusión convencionales. Existen dos variantes: Lotus-G (generativa, que además elimina ruido de un latente ruidoso) y Lotus-D (determinista). La versión v1.1 introduce normales alineadas.

El repositorio `fastforks/lotus` no contiene pesos: es una model card que describe cómo el framework fastforks descarga los pesos originales del autor (`jingheya/lotus-normal-d-v1-1` y `jingheya/lotus-normal-g-v1-1`) y los verifica mediante SHA-256. El modelo resuelve la tarea de estimación de geometría densa a partir de una única imagen RGB, devolviendo mapas de normales en el marco de cámara (x derecha, y abajo, z adelante) como vectores unitarios.

Es relevante porque ofrece una alternativa de inferencia en un solo paso con backends optimizados (`portable` y `kernels`) que aceleran la inferencia hasta 2,1 veces respecto a la implementación original, con soporte para imágenes de alta resolución (probado hasta 3000x4000) en GPUs de consumo con 16 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de Stable Diffusion 2 afinado (con VAE y text encoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (fp16 y fp32 documentados en pruebas) |
| Idiomas soportados | no disponible (el text encoder hereda el multilingue de SD2, pero la tarea es visual) |
| Licencia | openrail++ en la card; pesos Apache-2.0 segun evidencia; restricciones OpenRAIL++-M por herencia de SD2 |
| Formato de pesos | safetensors (unet, vae, text_encoder) |
| Tarea | depth-estimation / surface normals |
| Entrada | una imagen RGB (cualquier H x W >= 1, redimensionada o con padding interno) |
| Salida | normales de superficie `[B, H, W, 3]` (vectores unitarios en marco de camara) |
| Backends | `portable`, `kernels` |
| Variantes | `lotus-normal-d-v1-1`, `lotus-normal-g-v1-1` |

## Arquitectura y entrenamiento

Lotus parte del UNet de Stable Diffusion 2 y lo afina para predecir directamente el latente de normales en un único paso de inferencia. La variante determinista (Lotus-D) produce la predicción directamente; la generativa (Lotus-G) además realiza una pasada de eliminación de ruido sobre un latente ruidoso. La versión v1.1 incorpora normales alineadas, lo que mejora la consistencia geométrica de la salida.

Según la información disponible, el entrenamiento parte de la base de Stable Diffusion 2 (subconjuntos de LAION-5B) y se afina sobre datos sintéticos de Hypersim y Virtual KITTI 2, tal como describe el paper de Lotus (arXiv 2409.18124). No se detallan en la información proporcionada el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables de forma estándar a esta tarea). La innovación técnica principal es la inferencia en un solo paso, que reduce drásticamente la latencia frente a pipelines de difusión iterativos, junto con backends optimizados (`kernels`) que logran aceleraciones de hasta 2,1 veces frente a la implementación original.

## Capacidades

- Estimación de normales de superficie a partir de una única imagen RGB, devolviendo vectores unitarios en el marco de cámara.
- Estimación de profundidad monocular (la card describe la tarea como depth y menciona mapas de profundidad o profundidad inversa, con tipos `metric`, `scale_invariant`, `affine_invariant`, `affine_invariant_log` y `affine_invariant_inverse`).
- Dos variantes: determinista (Lotus-D) y generativa (Lotus-G) con paso de eliminación de ruido.
- Procesamiento de imágenes de alta resolución (probado hasta 3000x4000) con gestión interna de redimensionado y padding.
- Inferencia en un solo paso, sin muestreo iterativo de difusión.
- Soporte de dos backends (`portable` y `kernels`) con aceleración por kernels CUDA.
- Compatibilidad con `torch.compile` y TensorRT fp16 (documentado en la model card).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o texto generativo.

## Casos de uso

- Reconstrucción 3D y fotogrametría: las normales de superficie por píxel permiten integrar mapas de profundidad y normales para generar mallas densas en pipelines de escaneo 3D, aprovechando la salida en marco de cámara y la alta resolución soportada (hasta 3000x4000).
- Realidad aumentada: estimar la geometría de la escena en tiempo real a partir de la cámara del dispositivo permite anclar objetos virtuales sobre superficies; la inferencia en un solo paso (164 ms en 994x1482 con backend `kernels`) es adecuada para aplicaciones interactivas.
- Robótica y navegación: la profundidad monocular y las normales alimentan módulos de percepción para evitar obstáculos y planificar trayectorias en robots con cámara monocular, sin necesidad de sensores de profundidad dedicados.
- Edición y composición de imágenes: las normales permiten aplicar iluminación coherente, reiluminación o transferencia de estilo geométrico en herramientas de posproducción, usando la variante generativa (Lotus-G) para mayor robustez ante ruido.
- Automoción y conducción autónoma: sobre datos tipo Virtual KITTI 2 (parte del entrenamiento), el modelo estima geometría de la escena viaria para tareas de percepción y reconstrucción de entorno.
- Digitalización de patrimonio y modelado de interiores: capturar normales y profundidad de fotografías para generar representaciones 3D de espacios y objetos, con la ventaja de funcionar sobre imágenes de alta resolución en GPUs de consumo (16 GB de VRAM).
- Preprocesado para modelos generativos 3D: usar las normales como condicionamiento geométrico en pipelines de generación o reconstrucción 3D que requieran mapas de superficie densos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a esta tarea. Sí se documentan métricas de velocidad y memoria:

| Modelo | Entrada | Tiempo original (ms) | Portable (ms) | Kernels (ms) | Aceleracion kernels vs original | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|
| `lotus-normal-d-v1-1` | 994x1482 | 344 | 268 | 164 | 2,1x | 2777 / 2940 | 2351 / 2500 |
| `lotus-normal-g-v1-1` | 994x1482 | 344 | 267 | 164 | 2,1x | 2777 / 2940 | 2351 / 2500 |

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `lotus-normal-d-v1-1` | 2,10 | 5,48 | 2,70 | 0,56 | 0,69 | 0,32 |
| `lotus-normal-g-v1-1` | 10,43 | 4,37 | 3,49 | 1,15 | 0,59 | 0,38 |

Memoria pico en resolución 3000x4000 (portable, fp16, RTX 5060 Ti 16 GB): 3,0 GiB asignados, 3,7 GiB reservados para ambas variantes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,3-2,8 GiB asignados en 994x1482 (backends `kernels` y `portable` respectivamente); hasta 3,0 GiB asignados y 3,7 GiB reservados en 3000x4000.
- GPU recomendadas: RTX 5060 Ti 16 GB (probada en la card); cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para resoluciones moderadas.
- Cabe en GPU de consumo: sí, documentado en RTX 5060 Ti 16 GB; por el uso de memoria, también en GPUs consumer con 8 GB o más.
- Opciones de despliegue: framework fastforks (backends `portable` y `kernels`), PyTorch, `torch.compile` y TensorRT fp16 (documentados en la card).
- Latencia: 164 ms por imagen en 994x1482 con backend `kernels`; 267-268 ms con `portable`; 344 ms con la implementación original.
- Throughput: no disponible de forma explícita, pero se puede estimar en torno a 6 imágenes/s en 994x1482 con `kernels` en la GPU de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lotus (este) | no disponible (UNet SD2) | cualquier H x W >= 1 | normales / profundidad | openrail++ / Apache-2.0 (pesos) | Hugging Face (pesos del autor) |
| `metric3d-vit-large` | no disponible | imagen + intrínsecos | profundidad métrica | no disponible | mencionado en la card de fastforks |
| `unidepth-v2-vitl14` | no disponible | imagen (estima cámara) | profundidad | no disponible | mencionado en la card de fastforks |
| `depth-pro` | no disponible | imagen (estima cámara) | profundidad | no disponible | mencionado en la card de fastforks |
| `da3metric-large` | no disponible | imagen + intrínsecos | profundidad métrica | no disponible | mencionado en la card de fastforks |

No se dispone de datos de rendimiento comparativo (precisión) entre estos modelos en la información proporcionada; la comparativa se limita a la disponibilidad y al tipo de salida documentados.

## Limitaciones y advertencias

- El repositorio `fastforks/lotus` no aloja pesos: solo contiene la model card y la lógica de descarga y verificación; los pesos provienen de los repositorios del autor (`jingheya/...`).
- Licencia ambigua: la card declara openrail++ pero la evidencia apunta a Apache-2.0 en los pesos; además, al derivar de Stable Diffusion 2, aplican las restricciones de uso OpenRAIL++-M (Attachment A), que deben revisarse antes de cualquier uso comercial o redistribución.
- El modelo es de tipo experimental (tier `experimental` según la card), por lo que su robustez en producción no está garantizada.
- No se documentan sesgos específicos, pero al entrenarse sobre Hypersim y Virtual KITTI 2 (datos sintéticos) puede generalizar peor en escenas del mundo real fuera de esa distribución.
- Riesgo de alucinación geométrica: como todo modelo monocular, puede producir normales y profundidades inconsistentes en superficies ambiguas, reflectantes o con oclusiones.
- No se documentan limitaciones de idioma porque la tarea es visual; el text encoder heredado de SD2 no se usa para la predicción geométrica principal.
- La precisión de la profundidad depende del tipo de salida (`metric` frente a invariantes de escala); los modelos relativos no devuelven metros.
- El rendimiento de memoria y latencia documentado corresponde a una RTX 5060 Ti 16 GB; en GPUs con menos VRAM puede requerir reducir la resolución de entrada.
- No se han publicado métricas de precisión (error angular de normales, RMSE de profundidad) en la información disponible, lo que dificulta evaluar su calidad frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fastforks/lotus
- Pesos Lotus-D v1.1: https://huggingface.co/jingheya/lotus-normal-d-v1-1
- Pesos Lotus-G v1.1: https://huggingface.co/jingheya/lotus-normal-g-v1-1
- Codigo de fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original de Lotus: https://github.com/EnVision-Research/Lotus
- Paper de Lotus: https://arxiv.org/abs/2409.18124
- Licencia OpenRAIL++-M de Stable Diffusion 2: https://huggingface.co/stabilityai/stable-diffusion-2/blob/main/LICENSE-MODEL
- Evidencia de licencia Apache-2.0: https://github.com/EnVision-Research/Lotus/blob/b737e12238d2a41fc582ee8c6c6b1104d318d799/LICENSE
