# Petrouil/DepthPro2-H-ONNX

## Resumen

Depth Pro 2 H ONNX es la exportación a formato ONNX del modelo de estimación de profundidad monocular métrica `apple/DepthPro2-H`, desarrollado originalmente por Apple. El modelo toma una imagen RGB junto con su distancia focal en píxeles y devuelve un mapa de profundidad en metros, lo que lo convierte en una herramienta de reconstrucción 3D a partir de una sola vista sin necesidad de calibración adicional. El port lo mantiene el usuario Petrouil y no está respaldado por Apple.

La relevancia de esta release reside en tres propiedades técnicas: soporte de formas dinámicas (una sola gráfica ONNX ejecuta resoluciones como 480x640, 736x1280 y 1088x1920 sin reexportar, siempre que los lados sean múltiplos de 32), cinco precisiones de pesos (fp32, fp16, bf16, INT8 grupo-32 y un grafo GPTQ 4-bit mixto) y gráficas complementarias para vídeo temporalmente consistente (clip de 4 fotogramas) y para estimación de distancia focal cuando la imagen carece de EXIF.

El modelo base cuenta con 872 millones de parámetros y está orientado a estimación de profundidad métrica. Esta exportación facilita el despliegue en entornos de producción basados en ONNX Runtime, con opciones que van desde 3,3 GB en fp32 hasta 839 MB en la receta 4-bit mixta, manteniendo una fidelidad medida frente a la referencia PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de estimación de profundidad monocular; detalles del backbone no especificados en la información proporcionada) |
| Parametros totales | 872 M (modelo base `apple/DepthPro2-H`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32, fp16, bf16, INT8 grupo-32, GPTQ 4-bit con capas sensibles en 8-bit |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License; solo investigación no comercial) |
| Formato de pesos | ONNX (con datos externos en `model.onnx.data` para la variante fp32) |
| Resoluciones soportadas | dinámicas, lados múltiplos de 32 (p. ej. 480x640, 736x1280, 1088x1920) |
| Entrada | `pixel_values` float32 `(1,3,H,W)` o `(4,3,H,W)` en `[0,1]`, sin normalizar; `f_px` float32 |
| Salida | profundidad inversa y profundidad en metros |
| Tamaño del repo | 10,1 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `apple/DepthPro2-H` más allá de que se trata de un estimador de profundidad monocular métrica de 872 M de parámetros que acepta la distancia focal en píxeles como entrada auxiliar. No se especifican el tipo de backbone (transformer, CNN híbrida u otra), los datos de entrenamiento, el número de tokens o imágenes vistas, ni si se emplearon técnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas internas.

Lo que sí está documentado es el proceso de exportación y cuantización realizado por el autor del port. Cada grafo ONNX se somete a una puerta de paridad contra el modelo PyTorch del que se construyó, medida como error absoluto relativo sobre profundidad inversa (`AbsRel_inv`) en 8 imágenes de NYU. La receta INT8 grupo-32 es la opción por defecto (error 0,0012 frente a PyTorch fp32), mientras que el grafo 4-bit mixto aplica GPTQ con excepciones en 8-bit para capas sensibles, alcanzando 0,0076 de error. La variante 4-bit sin excepciones fue rechazada por superar el umbral del 1 %. El modelo incluye además una gráfica de clip de 4 fotogramas para consistencia temporal en vídeo y un estimador de distancia focal independiente.

## Capacidades

- Estimación de profundidad monocular métrica: devuelve profundidad en metros a partir de una sola imagen RGB y su distancia focal.
- Profundidad inversa: salida adicional `1/d` que permanece acotada en regiones donde la profundidad diverge (cielo, horizontes lejanos).
- Resolución dinámica: una misma gráfica procesa múltiples resoluciones sin reexportar, con lados múltiplos de 32.
- Consistencia temporal en vídeo: el grafo `model_clip4_int8.onnx` procesa clips de 4 fotogramas y reduce el parpadeo entre fotogramas respecto al modo de fotograma independiente.
- Estimación de distancia focal: gráficas `model_focal*.onnx` para imágenes sin metadatos EXIF.
- Cuantización configurable: cinco precisiones con distintos compromisos tamaño/fidelidad, todas validadas contra la referencia PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Reconstrucción 3D a partir de fotografía única: el modelo genera mapas de profundidad métrica que pueden convertirse en nubes de puntos o mallas, útil en fotogrametría ligera y escaneo de interiores donde no se dispone de LiDAR.
- Realidad aumentada en dispositivos móviles: la variante INT8 (1067 MB) o 4-bit mixta (839 MB) permite integrar estimación de profundidad en pipelines de AR con requisitos de tamaño reducidos y latencia aceptable en CPU o GPU embebida.
- Vídeo con consistencia temporal: el grafo de clip de 4 fotogramas procesa secuencias manteniendo la coherencia entre fotogramas, adecuado para postproducción, estabilización o generación de efectos de desenfoque de profundidad en vídeo.
- Automoción y robótica: la validación en KITTI (352x1216 con LiDAR real) muestra que la cuantización INT8 altera el AbsRel absoluto en solo +0,0003 frente a fp32, lo que respalda su uso en percepción de profundidad para navegación y evitación de obstáculos.
- Procesamiento sin EXIF: la gráfica `model_focal_fp16.onnx` (47 MB) estima la distancia focal de imágenes que carecen de metadatos, permitiendo aplicar el modelo de profundidad a fotografías descargadas o capturadas sin información de cámara.
- Digitalización de patrimonio y documentación: la resolución dinámica hasta 1088x1920 permite procesar imágenes de alta resolución para documentación arqueológica o arquitectónica con detalle fino.
- Generación de efectos de bokeh sintético: la profundidad métrica permite separar primer plano y fondo con precisión física, útil en edición fotográfica automatizada.

## Benchmarks y rendimiento

Fidelidad de las recetas de pesos sobre 300 imágenes de validación NYUv2 a 480x640, con distancia focal fijada en `f_px = 484.20`. Métrica principal: error absoluto relativo ponderado sobre profundidad inversa.

| Receta | AbsRel_inv | delta1 | Edge F1 | Veredicto |
|---|---:|---:|---:|---|
| fp32 | 0 | 1,0000 | 1,0000 | referencia |
| INT8 grupo-32 | 0,0014 | 1,0000 | 0,9952 | opción por defecto |
| GPTQ 4-bit, capas sensibles 8-bit | 0,0091 | 0,9989 | 0,9924 | opción por tamaño |
| GPTQ 4-bit sin excepciones | 0,0201 | 0,9977 | 0,9907 | rechazada (supera el 1 %) |

Paridad de los grafos ONNX publicados frente a PyTorch fp32, medida sobre 8 imágenes NYU:

| Archivo | ONNX vs PyTorch fp32, AbsRel_inv |
|---|---:|
| `model.onnx` | 3,4e-7 |
| `model_fp16.onnx` | 6,5e-5 |
| `model_bf16.onnx` | 3,9e-4 |
| `model_int8.onnx` | 0,0012 |
| `model_w4mixed.onnx` | 0,0076 |
| `model_clip4_int8.onnx` | 0,0012 (frente a fp32 en modo clip) |

Validación externa:

| Conjunto | Condición | Resultado |
|---|---|---|
| KITTI (150 imágenes, 352x1216, LiDAR real) | INT8 vs fp32 | +0,0003 de AbsRel absoluto (fp32 = 0,0579) |
| KITTI | 4-bit vs fp32 | +0,0007 de AbsRel absoluto |
| TUM RGB-D (96 fotogramas) | INT8, modo 1 y 4 fotogramas | parpadeo entre fotogramas sin cambios |
| TUM RGB-D | 4-bit, modo 1 fotograma | +11 % de parpadeo |
| TUM RGB-D | 4-bit, modo 4 fotogramas | limpio |

Comparativa H frente a L (checkpoints del modelo base): W8 0,0014 vs 0,0019; W4-mixed 0,0091 vs 0,0108; paridad INT8 ONNX 0,0012 vs 0,0027.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de los pesos va de 839 MB (4-bit mixto) a 3,3 GB (fp32 con datos externos), a lo que hay que añadir activaciones y memoria del runtime.
- GPU recomendadas: no especificadas en la información proporcionada. El modelo se ejecuta con ONNX Runtime, por lo que es compatible con `CUDAExecutionProvider` en GPUs NVIDIA y con `CPUExecutionProvider` en CPU.
- Cabe en GPU de consumo: con 839 MB a 3,3 GB de pesos, la variante INT8 y la 4-bit mixta son compatibles con GPUs de consumo de gama media-alta (8 GB o más), aunque no se han publicado mediciones específicas.
- Opciones de despliegue: ONNX Runtime (CPU y CUDA), con sesiones configurables mediante `providers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada. La model card únicamente compara los checkpoints H y L del propio modelo base, así que no es posible ofrecer una comparativa con otros estimadores de profundidad monocular (como Depth Anything, MiDaS o Metric3D) sin inventar cifras.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| DepthPro2-H ONNX (este) | 872 M | no aplica | apple-amlr (solo investigación) | ONNX | Hugging Face |
| DepthPro2-L | no disponible | no aplica | apple-amlr | PyTorch | Hugging Face |
| Alternativas de la categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia restrictiva: los pesos son un "Model Derivative" bajo la Apple Machine Learning Research Model License, que limita el uso a investigación no comercial y académica. No se permite uso comercial sin licencia adicional de Apple.
- Port no oficial: esta exportación es independiente y no está respaldada por Apple; el autor no garantiza soporte ni mantenimiento.
- Dependencia de la distancia focal: el modelo requiere `f_px` como entrada. Si no se dispone de EXIF, hay que usar la gráfica de estimación de distancia focal, que introduce su propio error.
- Resolución restringida: los lados de la imagen deben ser múltiplos de 32; otras resoluciones requieren redimensionado previo, lo que puede afectar a la fidelidad.
- Modo clip: el modo de 4 fotogramas cambia la salida entre un 2 y un 5 % respecto a fotogramas independientes, por lo que las referencias de paridad no son intercambiables entre ambos modos.
- Cuantización 4-bit: en modo de fotograma independiente incrementa el parpadeo temporal un 11 %; solo es limpio en el camino de 4 fotogramas. Además, su error AbsRel_inv (0,0091) es notablemente superior al de INT8 (0,0014).
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling ni agentes; cualquier caso de uso que requiera razonamiento lingüístico debe combinarse con otro modelo.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero el modelo puede producir profundidades plausibles pero incorrectas en escenas fuera de distribución (superficies reflectantes, transparentes o texturas repetitivas).
- Datos de sesgo y robustez limitados: no se documentan análisis de sesgo por tipo de escena, iluminación o geografía.
- Sin benchmarks frente a alternativas: no hay comparación publicada con otros estimadores de profundidad, lo que dificulta evaluar su posición relativa en el estado del arte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Petrouil/DepthPro2-H-ONNX
- Modelo base: https://huggingface.co/apple/DepthPro2-H
- Licencia: https://huggingface.co/Petrouil/DepthPro2-H-ONNX/blob/main/LICENSE
- Metodología de benchmarks: https://huggingface.co/Petrouil/DepthPro2-H-ONNX/blob/main/BENCHMARKS.md
- Script de ejemplo: https://huggingface.co/Petrouil/DepthPro2-H-ONNX/blob/main/example.py
- Paper referenciado en los tags (arXiv:2611.26603): https://arxiv.org/abs/2611.26603
