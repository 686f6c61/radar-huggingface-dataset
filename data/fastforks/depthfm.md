# fastforks/depthfm

## Resumen

DepthFM es un modelo de estimación de profundidad monocular desarrollado por el grupo de investigación de la Universidad de Múnich (LMU) liderado por Gui et al., publicado en 2024. El repositorio `fastforks/depthfm` es una model card de integración que no aloja pesos: actúa como manifiesto para que la librería `fastforks` descargue los pesos originales del autor y los verifique mediante SHA-256. El modelo resuelve la predicción de mapas de profundidad a partir de una única imagen RGB, con invariancia afín (la escala y el desplazamiento son relativos, no métricos).

Técnicamente, DepthFM emplea flow matching para transformar un latente de imagen en un latente de profundidad, usando un UNet de Stable Diffusion 2.1 afinado para ese flujo. La inferencia requiere pocos pasos de Euler y un ensemble de muestras de ruido (variante v1). El modelo se entrenó sobre los conjuntos sintéticos Hypersim y Virtual KITTI 2, partiendo de los pesos de SD 2.1.

Es relevante para desarrolladores que necesitan estimación de profundidad relativa de alta calidad con un pipeline basado en difusión, y que quieran reproducibilidad verificable mediante hashes. Su licencia OpenRAIL++-M permite uso comercial con restricciones que deben propagarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de Stable Diffusion 2.1 adaptado con flow matching (latente imagen → latente profundidad) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada una imagen RGB de cualquier H×W ≥ 1) |
| Tipos de cuantización | fp16 (por defecto en GPU), fp32 (CPU y referencia); no se documentan otros formatos |
| Idiomas soportados | no aplica (modelo de profundidad, sin entrada de texto) |
| Licencia | Código MIT; pesos bajo LicenseRef-CreativeML-OpenRAIL++-M (UNet) y LicenseRef-CreativeML-OpenRAIL-M (VAE SD 1.5) |
| Formato de pesos | `.ckpt` (depthfm-v1.ckpt) y `.safetensors` (VAE de SD 1.5) |
| Pipeline | depth-estimation |
| Tipo de salida | Mapa de profundidad o profundidad inversa; `kind` = `affine_invariant` (relativa, no métrica) |
| Entrada | Una imagen RGB; cualquier H×W ≥ 1, redimensionada o con padding interno |
| Backends | `portable`, `kernels` |
| Tier | experimental |

## Arquitectura y entrenamiento

DepthFM es un modelo de difusión basado en flow matching que aprende una transformación directa del latente de una imagen al latente de su mapa de profundidad. El backbone es un UNet de Stable Diffusion 2.1 que se afina para seguir ese flujo, en lugar de generar imágenes. La inferencia utiliza unos pocos pasos de integración de Euler y un ensemble de muestras de ruido para promediar la predicción (variante v1). El modelo es afín-invariante: la salida es profundidad relativa, sin escala ni desplazamiento absolutos en metros.

El entrenamiento parte de los pesos de Stable Diffusion 2.1 (entrenado sobre subconjuntos de LAION-5B) y se afina sobre los datasets sintéticos Hypersim y Virtual KITTI 2, según el paper de DepthFM (arXiv 2403.13788). No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset ni si hubo RLHF o DPO (no aplica habitualmente a modelos de profundidad). La innovación principal es el uso de flow matching sobre latentes de difusión para profundidad monocular, con pocos pasos de muestreo.

## Capacidades

- Estimación de profundidad monocular a partir de una única imagen RGB.
- Salida de mapa de profundidad relativa con invariancia afín (`kind` = `affine_invariant`).
- Soporte de profundidad inversa (`affine_invariant_inverse`) y profundidad logarítmica (`affine_invariant_log`) según el campo `kind` de la card.
- Procesamiento de imágenes de cualquier resolución H×W ≥ 1 (redimensionado o padding interno).
- Verificación de integridad de pesos mediante SHA-256.
- Dos backends de ejecución: `portable` y `kernels`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No soporta visión general más allá de la estimación de profundidad; no hay modo thinking, audio ni otras modalidades.

## Casos de uso

- Reconstrucción 3D y fotogrametría: a partir de una sola imagen se obtiene un mapa de profundidad relativa que puede usarse para generar mallas o nubes de puntos en pipelines de reconstrucción, con la ventaja de requerir una única vista.
- Realidad aumentada y virtual: inserción de objetos virtuales con oclusión aproximada usando la profundidad estimada por fotograma, aprovechando la invariancia afín para no necesitar calibración métrica.
- Edición fotográfica con desenfoque de profundidad (bokeh sintético): el mapa de profundidad permite aplicar desenfoque selectivo por distancia simulada en postproducción.
- Segmentación asistida por profundidad: usar el mapa como característica adicional en pipelines de segmentación semántica o instancias, mejorando la separación de objetos a distintas distancias.
- Navegación de robots y drones en entornos controlados: estimación de profundidad relativa en tiempo de inferencia (≈5,6 s por imagen a 994×1482 en RTX 5060 Ti) para planificación de trayectorias en investigación, con la advertencia de que no es métrico.
- Generación de datos sintéticos para entrenamiento: producir mapas de profundidad pseudo-etiquetados sobre imágenes reales para aumentar datasets de depth estimation supervisado.
- Previsualización de escenas en motores gráficos: estimar profundidad de referencias fotográficas para guiar la composición de escenas 3D o el layout de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no es un modelo de lenguaje. Los datos de rendimiento disponibles son de velocidad y memoria:

| Modelo | Entrada | Tiempo (ms) portable | Memoria pico (MiB, alloc/reserved) portable |
|---|---|---|---|
| `depthfm-v1` | 994×1482 | 5662 | 13651 / 15150 |

| Modelo | Carga (s) portable | Primera llamada (s) portable |
|---|---|---|
| `depthfm-v1` | 3,58 | 6,00 |

Paridad con el código original: en CPU float32, max |diff| ≤ 0,0001; en GPU float16, mean |diff| ≤ 1 % y p99 ≤ 3 % del valor mediano de referencia. `torch.compile` y TensorRT fp16 se marcaron como diferidos (build > 5 min).

## Requisitos de hardware

- VRAM estimada: ≈13,6 GiB asignados y ≈15,0 GiB reservados en fp16 para 994×1482 (RTX 5060 Ti 16 GB).
- GPU recomendadas: RTX 5060 Ti 16 GB (probada), RTX 4090, A100, H100 por su VRAM ≥ 16 GB.
- Cabe en GPU de consumo con ≥ 16 GB de VRAM; en GPUs de 8-12 GB requeriría reducir resolución o usar fp16 con cuidado (no documentado).
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`); no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: ≈5,66 s por imagen 994×1482 en portable fp16; primera llamada ≈6,00 s.
- `torch.compile` y TensorRT fp16 no se pudieron evaluar (build > 5 min).

## Comparativa con modelos similares

| Modelo | Tipo | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| DepthFM (este) | Flow matching sobre UNet SD 2.1 | Profundidad afín-invariante | OpenRAIL++-M / OpenRAIL-M | Pesos en ommer-lab.com; card en HF |
| `metric3d-vit-large` | Métrico con intrínsecos | Profundidad métrica (metros) | no disponible | Mencionado en la card fastforks |
| `da3metric-large` | Métrico con intrínsecos | Profundidad métrica (metros = salida × focal / 300) | no disponible | Mencionado en la card fastforks |
| `unidepth-v2-vitl14` | Estima cámara propia | Profundidad relativa/métrica | no disponible | Mencionado en la card fastforks |

No se dispone de datos de benchmarks comparativos en la información proporcionada; la comparación se limita a tipo de salida y requisitos de intrínsecos.

## Limitaciones y advertencias

- La salida es afín-invariante: no proporciona metros absolutos; no apta para aplicaciones que requieran escala métrica sin calibración externa.
- Modelo de flujo sobre latente con ruido: el ruido sembrado proviene de un generador de CPU y difiere del generador de dispositivo del código original, lo que puede introducir variaciones en la reproducibilidad exacta.
- Tier experimental: no recomendado para producción crítica sin validación adicional.
- Licencia OpenRAIL++-M / OpenRAIL-M: permite uso comercial pero con restricciones de uso que deben propagarse; los términos de los datos de entrenamiento no se han verificado.
- Riesgo de alucinación en regiones ambiguas o texturas repetitivas, inherente a modelos de profundidad monocular.
- No soporta entrada de texto ni otros idiomas; cualquier limitación multilingüe no aplica.
- Rendimiento dependiente de la resolución: resoluciones altas incrementan linealmente (o más) el tiempo de inferencia y la VRAM.
- `torch.compile` y TensorRT no validados (build > 5 min), por lo que el despliegue optimizado no está garantizado.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/depthfm
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels para backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original DepthFM: https://github.com/CompVis/depth-fm (commit `da632c8`)
- Paper DepthFM: https://arxiv.org/abs/2403.13788
- Pesos originales: https://ommer-lab.com/files/depthfm/depthfm-v1.ckpt
- VAE SD 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Licencia del modelo original: https://github.com/CompVis/depth-fm/blob/da632c8118e41cc64ca191a13314e2db1a7722d9/README.md
- Benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Card TOML con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/depth/models/depthfm/card.toml
