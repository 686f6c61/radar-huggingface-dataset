# fastforks/romav2

## Resumen

RoMa v2 es un modelo de correspondencia densa de características (dense feature matching) entre pares de imágenes tomadas desde cualquier punto de vista. Lo desarrollan Johan Edstedt, Nordström, Wadenbäck, Felsberg y colaboradores (2025), y esta ficha corresponde al empaquetado `fastforks/romav2`, que no aloja pesos propios: descarga los del autor original y verifica su integridad mediante SHA-256. El modelo resuelve el problema de estimar, para cada píxel de la primera imagen, su posición correspondiente en la segunda, junto con una probabilidad de visibilidad. Es relevante porque sustituye a los matchers dispersos clásicos (LightGlue, LoFTR, DeDoDe) en tareas de reconstrucción 3D y estructura desde movimiento, ofreciendo correspondencias densas en lugar de keypoints.

La arquitectura combina un backbone DINOv3 ViT-L/16 congelado que describe ambas imágenes a una resolución gruesa y cuadrada, un ViT multi-vista con atención alternada y una cabeza DPT que convierten las coincidencias coseno globales en un warp grueso y un logit de solapamiento, y refinadores convolucionales sobre características VGG19-BN que afinan el resultado a escalas 4, 2 y 1, primero a resolución gruesa y luego fina. La salida son dos tensores: `warp` (coordenadas x, y en píxeles) y `certainty` (probabilidad de visibilidad).

El modelo se distribuye como paquete de investigación con licencia MIT combinada con la DINOv3 License de Meta, lo que condiciona el uso comercial. Está marcado como tier experimental y su backend `kernels` ofrece aceleraciones de hasta 2,1x frente al código original en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-L/16 congelado + ViT multi-vista con atención alternada + cabeza DPT + refinadores convolucionales sobre VGG19-BN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32, fp16, bfloat16 (según benchmarks); no se documentan cuantizaciones de menor precisión |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | MIT AND LicenseRef-DINOv3-License (incluye pesos DINOv3 ViT-L/16 de Meta) |
| Formato de pesos | `.pt` (PyTorch); checkpoint `romav2.0.1.pt` |
| Tarea | matching (dense feature matching) |
| Entrada | dos imágenes RGB de una misma escena, H x W >= 32, rellenadas a múltiplo de 32 |
| Salidas | `warp` (x, y en píxeles) y `certainty` (probabilidad de visibilidad) |
| Backends | `portable`, `kernels` |
| Tier | experimental |
| Variante | `romav2@1` |

## Arquitectura y entrenamiento

RoMa v2 es un transformer híbrido orientado a correspondencia densa. Un DINOv3 ViT-L/16 congelado extrae descriptores de ambas imágenes a una resolución gruesa y cuadrada. Sobre esos descriptores, un ViT multi-vista con atención alternada y una cabeza DPT generan un warp grueso y un logit de solapamiento a partir de las coincidencias coseno globales. Después, refinadores convolucionales operan sobre características VGG19-BN con correlación local a strides 4, 2 y 1, afinando el warp primero a la resolución gruesa y luego a una resolución fina. La salida final es densa: cada píxel de la primera imagen recibe una posición en la segunda y una certeza de visibilidad.

El entrenamiento utiliza una mezcla de datasets de matching de línea base amplia siguiendo UFM y MapAnything (MegaDepth y otros, según el paper). El descriptor DINOv3 congelado fue preentrenado en LVD-1689M, un dataset no liberado públicamente. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo). La innovación destacable es la combinación de un backbone fundacional congelado con un refinamiento convolucional multi-escala, que permite correspondencias densas de alta resolución sin reentrenar el ViT.

## Capacidades

- Correspondencia densa de características entre dos imágenes de cualquier punto de vista: devuelve para cada píxel de la primera imagen su posición en la segunda.
- Estimación de visibilidad: genera un logit de certeza por píxel que indica si es visible en ambas imágenes.
- Manejo de líneas base amplias (wide-baseline matching), útil cuando las cámaras están muy separadas.
- Entrada de tamaño arbitrario: cualquier H x W >= 32, rellenado a múltiplo de 32; probado hasta 3000x4000 en fp16 sobre RTX 5060 Ti 16 GB.
- Salida densa frente a matchers dispersos como LightGlue, que devuelven keypoints e índices de pares emparejados.
- Soporte de precisión fp32, fp16 y bfloat16.
- Backend `kernels` con kernels optimizados que aceleran la inferencia frente al código original.
- Compatibilidad con `torch.compile` y TensorRT fp16 (según benchmarks del empaquetado).
- Integración con pipelines de structure from motion para reconstruir poses de cámara a partir de una carpeta de imágenes.

## Casos de uso

- Reconstrucción 3D y structure from motion: el modelo proporciona correspondencias densas entre pares de imágenes que alimentan pipelines de SfM para estimar poses de cámara y nubes de puntos; su salida de certeza permite filtrar correspondencias poco fiables antes de RANSAC.
- Registro de imágenes médicas o satelitales: al devolver un warp denso píxel a píxel, se puede alinear una imagen con otra tomada desde otro ángulo o momento, con la certeza como máscara de validez.
- SLAM visual y odometría: las correspondencias densas entre fotogramas consecutivos o con línea base amplia permiten estimar movimiento de cámara con mayor cobertura que los matchers dispersos, especialmente en escenas con texturas repetitivas.
- Generación de datasets de correspondencia: el warp y la certeza sirven para etiquetar automáticamente pares de imágenes con flujo óptico denso o para aumentar datasets de entrenamiento de otros matchers.
- Fotogrametría y modelado 3D de patrimonio: con soporte de imágenes de hasta 3000x4000 en 16 GB de VRAM, se pueden procesar fotografías de alta resolución de edificios o yacimientos para reconstruir geometría.
- Robótica de manipulación: la correspondencia densa entre la imagen de una escena y la de referencia permite localizar objetos y estimar su desplazamiento, con la certeza como filtro de oclusiones.
- Comparación de imágenes en control de calidad industrial: alinear piezas fotografiadas desde ángulos distintos y detectar desviaciones píxel a píxel mediante el warp y la máscara de visibilidad.

## Benchmarks y rendimiento

Precisión en MegaDepth-1500 (AUC de pose relativa @5 / @10 / @20 grados, RANSAC con matriz esencial, umbral 0,5 px):

| Variante | Dataset | original fp32 | original fp16 | portable | kernels |
|---|---|---|---|---|---|
| `romav2` | MegaDepth-1500 (300 pares) | no disponible | 63,2 / 77,1 / 86,7 | 63,0 / 76,9 / 86,5 | 62,9 / 76,9 / 86,4 |
| `romav2` | MegaDepth-1500 (cada 5.º par) | 64,6 / 78,0 / 87,1 | 64,7 / 78,2 / 87,3 | 64,7 / 78,3 / 87,3 | 64,4 / 77,9 / 86,9 |

Velocidad y memoria en matching sintético 768x1024 (RTX 5060 Ti 16 GB, sm_120):

| Modelo | Tiempo original fp32 (ms) | Tiempo original (ms) | Tiempo portable (ms) | Tiempo kernels (ms) | Aceleración kernels vs original | Memoria pico original (MiB) | Memoria pico portable (MiB) | Memoria pico kernels (MiB) |
|---|---|---|---|---|---|---|---|---|
| `romav2` | 1412 | 741 | 546 | 354 | 2,1x | 9881 / 10124 | 1989 / 2596 | 1909 / 2300 |

Arranque y primera llamada:

| Modelo | Carga original (s) | Carga portable (s) | Carga kernels (s) | Primera llamada original (s) | Primera llamada portable (s) | Primera llamada kernels (s) |
|---|---|---|---|---|---|---|
| `romav2` | 5,45 | 0,85 | 0,96 | 2,09 | 0,91 | 0,62 |

`torch.compile` y TensorRT fp16 (entrada 768x1024):

| Modelo | portable (ms) | compile (ms) | TensorRT fp16 (ms) | kernels (ms) | Compilación en frío (s) | Build ONNX + engine (s) | Memoria pico portable (MiB) | Memoria pico compile (MiB) | Memoria pico kernels (MiB) | Memoria pico TensorRT (MiB) |
|---|---|---|---|---|---|---|---|---|---|---|
| `romav2` | 546 | 576 | 353 | 354 | 254 | 185 | 1989 / 2596 | 3150 / 3386 | 1909 / 2300 | 6694 / 6740 |

## Requisitos de hardware

- VRAM estimada: en fp16 a 768x1024, el backend portable reserva unos 2596 MiB y el backend kernels unos 2300 MiB; el original en fp32 requiere unos 10124 MiB. A 3000x4000 en fp16 sobre portable, el pico asignado es de 2,9 GiB y 4,7 GiB reservados.
- GPU recomendadas: RTX 5060 Ti 16 GB es la referencia de los benchmarks; para resoluciones altas o fp32 conviene A100, H100 o RTX 4090 por su mayor memoria.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB para resoluciones moderadas en fp16; 16 GB permiten 3000x4000.
- Opciones de despliegue: PyTorch con los backends `portable` o `kernels` del paquete `fastforks`; soporta `torch.compile` y exportación a ONNX + TensorRT fp16. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión).
- Latencia: 354 ms con backend kernels y 546 ms con portable a 768x1024; 353 ms con TensorRT fp16. La primera llamada tarda 0,62 s (kernels) o 0,91 s (portable), y la carga del modelo 0,85-0,96 s.
- Throughput: no disponible más allá de los tiempos por par de imágenes indicados.

## Comparativa con modelos similares

| Modelo | Tipo | Correspondencias | Licencia | Contexto de uso | Disponibilidad |
|---|---|---|---|---|---|
| RoMa v2 (`fastforks/romav2`) | Denso | Densas por píxel con certeza | MIT AND DINOv3 License | Matching wide-baseline, SfM, SLAM | Pesos del autor vía GitHub Releases; empaquetado en fastforks |
| LightGlue | Disperso | Keypoints e índices de pares | no disponible en la información | Matching disperso rápido | no disponible en la información |
| LoFTR | Disperso/denso | Keypoints según configuración de su card | no disponible en la información | Matching en interiores y exteriores | no disponible en la información |
| DeDoDe | Disperso | Keypoints según configuración de su card | no disponible en la información | Matching y reconstrucción | no disponible en la información |

La model card no publica una comparación directa de precisión frente a LightGlue, LoFTR o DeDoDe; los benchmarks de MegaDepth-1500 solo comparan las variantes internas de RoMa v2 (original, portable, kernels, fp32/fp16).

## Limitaciones y advertencias

- Modelo marcado como tier experimental; no se recomienda para producción sin validación adicional.
- Licencia compleja: MIT combinada con la DINOv3 License de Meta, que impone atribución y condiciones adicionales; es imprescindible leerla antes de cualquier uso comercial, ya que el checkpoint incluye pesos DINOv3 ViT-L/16.
- El repositorio `fastforks/romav2` no aloja pesos; depende de la disponibilidad de los enlaces de descarga del autor original y de la verificación SHA-256.
- Sin capacidades lingüísticas ni de texto: no es un modelo de lenguaje y no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- La memoria crece con la resolución: a 3000x4000 en fp16 se reservan 4,7 GiB, y en fp32 a 768x1024 se superan los 10 GiB.
- El descriptor DINOv3 se preentrenó en LVD-1689M, un dataset no liberado, lo que limita la reproducibilidad completa del entrenamiento.
- No hay datos publicados sobre sesgos, robustez ante dominios fuera de distribución ni tasa de alucinación (concepto no aplicable, pero sí riesgo de correspondencias espurias en regiones ocluidas o sin textura).
- La certeza de visibilidad es un logit, no una probabilidad calibrada documentada; conviene aplicar umbrales validados en el dominio de uso.
- No se documentan cuantizaciones por debajo de fp16, lo que limita el despliegue en GPUs con poca memoria.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/romav2
- Código del empaquetado fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de RoMa v2: https://github.com/Parskatt/romav2 (commit `95c9968145c8`)
- Pesos originales: https://github.com/Parskatt/RoMaV2/releases/download/v2.0.1/romav2.0.1.pt
- Licencia original: https://github.com/Parskatt/romav2/blob/95c9968145c8906b7b59383258e9f73b02853d89/README.md#license
- Benchmarks del empaquetado: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Ficha de structure from motion: ../sfm.md
