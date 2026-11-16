# fastforks/lingbot-map

## Resumen

LingBot-Map es un modelo de reconstrucción 3D en streaming desarrollado por Robbyant en 2026. Resuelve el problema de estimar profundidad, cámara intrinseca y pose (camera-to-world) a partir de una secuencia de vistas de una misma escena, de forma causal y con memoria acotada. La variante aquí descrita, `fastforks/lingbot-map`, es una model card de redistribución: no aloja pesos propios, sino que descarga los pesos originales del autor y los verifica mediante SHA-256.

La arquitectura sigue el esquema VGGT: un agregador con patch embedding basado en DINOv2 ViT-L, 24 bloques de atención de fotograma y atención global, y RoPE 3D. El modelo procesa las vistas en orden con una KV cache que mantiene los primeros `scale_frames` fotogramas y una ventana deslizante; después, una cabeza de cámara y una cabeza de profundidad DPT emiten las predicciones por vista. El límite duro es de 1024 vistas.

Es relevante para pipelines de reconstrucción y SLAM visual que necesitan procesar secuencias largas sin almacenar todas las vistas, y para entornos con GPUs de consumo: se ha validado en una RTX 5060 Ti de 16 GB con entradas de hasta 3000x4000 píxeles en fp16 (5,5 GiB pico asignados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer agregador estilo VGGT: patch embed DINOv2 ViT-L, 24 bloques de atención de fotograma y atención global, RoPE 3D, KV cache con ventana deslizante; cabezas de cámara y profundidad DPT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | secuencia de hasta 1024 vistas; cada vista ve los primeros `scale_frames` fotogramas y los anteriores dentro de la ventana `window` |
| Tipos de cuantizacion | no disponible (fp32 en CPU y fp16 en GPU son las precisiones documentadas) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 (pesos y código); el paquete de código original se describe como de uso de investigación |
| Formato de pesos | `lingbot-map.pt` (PyTorch); variante `lingbot-map@1` |

## Arquitectura y entrenamiento

El modelo es un agregador multivista causal. Cada vista pasa por un patch embedding DINOv2 ViT-L y por 24 bloques que combinan atención intra-fotograma con atención global sobre el estado acumulado. La KV cache conserva los primeros `scale_frames` fotogramas completos y, para las vistas más antiguas que la ventana `window`, únicamente sus 6 tokens especiales; esto acota el coste de memoria a medida que crece la secuencia. La salida se produce mediante una cabeza de cámara (intrínsecos y `cam_to_world`) y una cabeza DPT de profundidad, más un mapa de confianza.

El entrenamiento se realizó en dos etapas según el README del autor: primero un checkpoint bidireccional estilo VGGT y después un entrenamiento en streaming. Los datasets concretos no están listados en la información disponible, ni se documentan fases de RLHF o DPO (no procede en una tarea de reconstrucción geométrica). La innovación principal es el procesamiento causal con memoria acotada, que permite reconstruir secuencias de hasta 1024 vistas sin requerir todas las imágenes simultáneamente.

## Capacidades

- Reconstrucción 3D multivista a partir de varias imágenes de una misma escena.
- Estimación de profundidad por vista (`depth`) con mapa de confianza asociado.
- Estimación de intrínsecos de cámara (`intrinsics`) y pose cámara-mundo (`cam_to_world`) cuando el modelo los predice.
- Funcionamiento con imágenes calibradas y con pose (multi-view stereo) o sin pose (el modelo estima la cámara).
- Procesamiento en streaming de secuencias de vistas con KV cache y ventana deslizante.
- Entrada de tamaño arbitrario H x W >= 1, con redimensionado o padding interno; probado hasta 3000x4000 en fp16.
- Dos backends de ejecución: `portable` (PyTorch) y `kernels` (kernels CUDA propios `fastbb` y `cudnn_hacc`).
- No soporta tool calling, agentes ni capacidades lingüísticas; es un modelo puramente visual-geométrico.

## Casos de uso

- Reconstrucción de escenas a partir de vídeo: pasar los fotogramas de un vídeo como secuencia de vistas permite obtener profundidad y poses de forma causal, aprovechando la KV cache para no recargar toda la secuencia en memoria.
- Digitalización de interiores y obra civil: con fotografías de una estancia tomadas en orden, el modelo genera mapas de profundidad y cámaras que alimentan un pipeline de malla o nube de puntos.
- SLAM visual y odometría: la salida `cam_to_world` por vista sirve como estimación de trayectoria en un sistema de localización y mapeo, con la ventaja de que no requiere poses de entrada.
- Escaneo de objetos para e-commerce o patrimonio: varias vistas de un objeto con fondo controlado producen profundidad multicapa útil para reconstrucción de malla y texturizado.
- Preprocesado para generación image-to-3D: los mapas de profundidad y confianza actúan como entrada geométrica para modelos generativos 3D posteriores.
- Inspección industrial y robótica: procesar secuencias de una cámara montada en un brazo o dron para obtener profundidad densa y pose relativa en tiempo casi real (730 ms por lote de 480x640 en el backend `portable`).
- Prototipado en estación de trabajo con GPU de consumo: con 16 GB de VRAM se pueden procesar imágenes de alta resolución (3000x4000) sin infraestructura de centro de datos.

## Benchmarks y rendimiento

Datos de velocidad y memoria publicados por fastforks (RTX 5060 Ti 16 GB, sm_120, fp16 salvo indicación):

| Metrica | Entrada 480x640 |
|---|---|
| Tiempo de inferencia (portable) | 730 ms |
| Memoria pico asignada / reservada (portable) | 4512 / 4770 MiB |
| Carga del modelo (portable) | 6,58 s |
| Primera llamada (portable) | 1,08 s |
| torch.compile | planificado para 0.2.1 |
| TensorRT fp16 | diferido (build > 5 min) |

Paridad con el código original: en CPU y float32, diferencia máxima absoluta <= 0,002; en GPU y float16 (por defecto), diferencia media <= 0,02 y p99 <= 0,25 sobre la salida `depth`. No se han publicado resultados de benchmarks de calidad geométrica (por ejemplo, error de pose o de profundidad frente a datasets de referencia) en la información disponible.

## Requisitos de hardware

- VRAM: 5,5 GiB pico asignados (6,8 GiB reservados) para una entrada de 3000x4000 en fp16; 4,5 GiB pico para 480x640.
- GPU recomendadas: cualquier NVIDIA con soporte fp16 y al menos 8 GB de VRAM para resoluciones moderadas; RTX 5060 Ti 16 GB es la configuración validada. Para el backend `kernels` se requiere un kernel precompilado para la arquitectura de la GPU (descargado de `fastforks/kernels`) y un driver NVIDIA reciente.
- Cabe en GPU de consumo: sí, en RTX 5060 Ti 16 GB y previsiblemente en modelos con >= 8 GB para entradas pequeñas; no hay datos publicados para GPUs de 8 GB o menos.
- Despliegue: paquete `fastforks` (`pip install fastforks`), con `multiview.load("lingbot-map")` y selección de backend `portable`, `kernels` o `auto`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia: 730 ms por lote de 480x640 en el backend `portable`; el backend `kernels` no tiene medición publicada en esta ficha.

## Comparativa con modelos similares

| Modelo | Tarea | Enfoque | Contexto de vistas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingBot-Map (Robbyant) | Reconstrucción 3D multivista, profundidad y pose | Agregador VGGT causal con KV cache | Hasta 1024 vistas | Apache-2.0 | Pesos en HF (`robbyant/lingbot-map`) |
| VGGT (referencia arquitectónica) | Reconstrucción 3D multivista | Agregador bidireccional | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |
| DUSt3R / MASt3R | Reconstrucción 3D por pares de imágenes | Regresión directa de nubes de puntos | Pares de vistas | No disponible en esta ficha | No disponible en esta ficha |

La comparación cuantitativa con VGGT, DUSt3R o MASt3R no está disponible en la información proporcionada; solo se documenta la paridad numérica frente al código original de LingBot-Map.

## Limitaciones y advertencias

- Las vistas se tratan como una secuencia ordenada: cada vista solo ve los primeros `scale_frames` fotogramas y las anteriores dentro de la ventana; las más antiguas quedan reducidas a 6 tokens especiales, lo que puede degradar la consistencia global en secuencias muy largas.
- Límite duro de 1024 vistas por secuencia.
- Este repositorio no contiene pesos: depende de la disponibilidad de `robbyant/lingbot-map` y de la verificación SHA-256; si el autor retira o modifica los ficheros, la carga falla.
- El paquete de código original se describe como de uso de investigación; conviene revisar `LICENSE.txt` antes de un uso comercial, aunque la licencia declarada sea Apache-2.0.
- El backend `kernels` requiere un kernel precompilado para la arquitectura de GPU; si no existe, lanza `BackendUnavailableError` sin fallback silencioso.
- No hay datos publicados sobre sesgos, robustez ante escenas dinámicas, superficies reflectantes o texturas repetitivas; el riesgo de artefactos geométricos en esos casos es una incógnita.
- No se documentan idiomas ni capacidades lingüísticas: no es un modelo de texto.
- El estado es experimental (tier `experimental`), con `torch.compile` y TensorRT aún no disponibles.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/lingbot-map
- Pesos originales del autor: https://huggingface.co/robbyant/lingbot-map
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels CUDA: https://huggingface.co/fastforks/kernels
- Código original de LingBot-Map: https://github.com/Robbyant/lingbot-map (commit `b9dd1b1`)
- Licencia original: https://github.com/Robbyant/lingbot-map/blob/b9dd1b1/LICENSE.txt
- Documentación de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Definición de variantes (`card.toml`): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/multiview/models/lingbot_map/card.toml
