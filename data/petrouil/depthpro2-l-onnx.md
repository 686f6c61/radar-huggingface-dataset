# Petrouil/DepthPro2-L-ONNX

## Resumen

DepthPro2-L-ONNX es una distribución en formato ONNX del modelo de estimación de profundidad monocular métrica Depth Pro 2 Large de Apple, publicada por el usuario Petrouil. El modelo original `apple/DepthPro2-L` recibe una imagen RGB junto con su distancia focal horizontal y devuelve un mapa de profundidad en metros, sin necesidad de calibración adicional ni de múltiples vistas. Esta versión derivada empaqueta el checkpoint Large (334 M de parámetros) en cinco variantes de precisión (fp32, fp16, bf16, int8 y una mezcla de 4 bits con capas sensibles en 8 bits), todas ejecutables con ONNX Runtime.

La característica técnica más relevante es que los grafos mantienen altura y anchura dinámicas: una misma descarga procesa un recorte de 480×352, un fotograma de 736×1280 o una imagen de 1088×1920 sin reexportar, con la única restricción de que ambos lados sean múltiplos de 32. Las variantes cuantizadas reducen el tamaño en disco hasta 3,7 veces (360 MB frente a 1339 MB del fp32) con una desviación de error relativo absoluto sobre profundidad inversa de solo 0,19 % para int8 y 1,08 % para el grafo de 4 bits mixtos, medidas sobre 300 imágenes de validación de NYUv2.

El interés actual de esta ficha reside en que facilita el despliegue de un modelo de profundidad métrica de referencia en entornos sin PyTorch, con contratos de tensor explícitos y validación cruzada contra datos LiDAR de exterior (KITTI) y vídeo (TUM RGB-D). Conviene subrayar que la licencia heredada es la Apple Research Licence, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para estimación de profundidad monocular métrica (detalles internos de la arquitectura no disponibles en la información proporcionada) |
| Parametros totales | 334 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; resolución dinámica con lados múltiplos de 32) |
| Tipos de cuantizacion | fp32, fp16, bf16, int8 (por canal de salida), 4 bits GPTQ mixto con capas sensibles en 8 bits |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | apple-amlr (Apple Research Licence, no comercial) |
| Formato de pesos | ONNX (cinco grafos: `model.onnx`, `model_fp16.onnx`, `model_bf16.onnx`, `model_int8.onnx`, `model_w4mixed.onnx`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo original más allá de su naturaleza como estimador de profundidad monocular métrica. El modelo base `apple/DepthPro2-L` es un checkpoint de 334 M de parámetros que, a partir de una imagen RGB y su distancia focal horizontal en píxeles, produce profundidad en metros mediante la relación `depth_meters = f_px / (W · inverse_depth)`. La normalización de la entrada se aplica dentro del grafo, de modo que el usuario solo debe entregar píxeles RGB en el rango [0, 1].

El trabajo de esta distribución se centra en la cuantización y exportación a ONNX, no en el entrenamiento. Cada grafo cuantizado se construye a partir del cuantizador de PyTorch y conserva exactamente los códigos producidos por este, sin una segunda recuantización. La validación incluye paridad de grafo contra el modelo PyTorch (diferencia máxima absoluta en profundidad inversa de 1,5e-5 para fp16, 1,7e-4 para bf16, 1,4e-5 para int8 y 2,3e-5 para 4 bits), transferencia a datos LiDAR de exterior (KITTI) y estabilidad temporal en vídeo (TUM RGB-D). Un detalle técnico relevante es que todos los grafos descomprimen los pesos a fp32 antes de las multiplicaciones matriciales, por lo que las variantes fp16, int8 y 4 bits no ofrecen ganancia de latencia en CPU: solo ahorran disco y memoria.

## Capacidades

- Estimación de profundidad monocular métrica: devuelve distancia en metros a partir de una sola imagen RGB y su focal horizontal.
- Salida dual: profundidad inversa normalizada por focal (`inverse_depth`) y profundidad en metros (`depth_meters`), con valor `inf` en el cielo.
- Resolución dinámica: altura y anchura libres siempre que sean múltiplos de 32, sin reexportación del grafo.
- Ejecución en ONNX Runtime con múltiples proveedores de ejecución (CPU por defecto, configurable).
- Incluye un driver de línea de comandos que gestiona la focal desde EXIF, el redimensionado a múltiplos de 32 y el mapeo de color.
- Acepta grafos locales o referencias al Hub en el formato `usuario/repo:ruta/al/modelo.onnx`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D y fotogrametría: el modelo proporciona profundidad métrica por píxel a partir de una sola vista, lo que permite generar nubes de puntos densas sin calibración estéreo ni sensores LiDAR, usando la variante int8 para pipelines de gran volumen.
- Realidad aumentada y sustitución de fondo: la profundidad en metros permite colocar objetos virtuales con oclusión correcta y escala física realista; la resolución dinámica admite fotogramas de vídeo de distintas resoluciones sin reexportar el grafo.
- Automoción y robótica móvil: la validación sobre 150 imágenes de KITTI con LiDAR real muestra que int8 altera el AbsRel absoluto en solo +0,0006 frente a fp32, lo que hace viable el despliegue en sistemas embebidos con memoria limitada.
- Segmentación y edición de imágenes por profundidad: el mapa de profundidad sirve para separar primer plano y fondo, aplicar desenfoque selectivo o generar máscaras de oclusión en herramientas de edición.
- Procesamiento de vídeo en tiempo real: la estabilidad temporal medida en 96 fotogramas de TUM RGB-D (fluctuación de 0,99–1,02× frente a fp32) permite usar las variantes cuantizadas en pipelines de vídeo sin introducir parpadeo apreciable.
- Despliegue en entornos sin PyTorch: el formato ONNX con ONNX Runtime permite integrar el modelo en servicios en C++, C#, Java o Node.js, o en dispositivos de borde donde no está disponible el stack de PyTorch.
- Generación de datos sintéticos y aumento de datos: la profundidad métrica por imagen facilita la composición de escenas sintéticas con coherencia geométrica para entrenar otros modelos de visión.

## Benchmarks y rendimiento

Fidelidad frente al modelo PyTorch fp32 sobre 300 imágenes de validación de NYUv2 a 480×640, con focal fija (`f_px = 484,20`). La métrica principal es el error relativo absoluto ponderado sobre profundidad inversa (`Σ|1/d̂ − 1/d| / Σ(1/d)`).

| Grafo | Precisión efectiva | Disco | AbsRel_inv | δ₁ | Edge F1 |
|---|---|---:|---:|---:|---:|
| `model.onnx` | fp32 | 1339 MB | 0 | 1,0000 | 1,0000 |
| `model_fp16.onnx` | pesos fp16 → cómputo fp32 | 674 MB | 0,0001 | 1,0000 | 0,9997 |
| `model_bf16.onnx` | pesos bf16 → cómputo fp32 | 674 MB | 0,0014 | 1,0000 | 0,9942 |
| `model_int8.onnx` | int8 por canal de salida | 420 MB | 0,0019 | 0,9998 | 0,9966 |
| `model_w4mixed.onnx` | GPTQ 4 bits, capas sensibles 8 bits | 360 MB | 0,0108 | 0,9963 | 0,9905 |

Comprobaciones adicionales reportadas por el autor:

- Transferencia a exterior: sobre 150 imágenes de KITTI depth-completion (352×1216, LiDAR real), int8 cambia el AbsRel absoluto en +0,0006 y la receta de 4 bits en −0,0005 frente a fp32 (0,0714).
- Vídeo: sobre 96 fotogramas de TUM RGB-D, las variantes cuantizadas modifican el parpadeo entre fotogramas en 0,99–1,02× respecto a fp32.
- Latencia fp32 a 480×640 en una GTX 1080 Ti: 0,22 s, con un pico de VRAM de 1,5 GB (dato truncado en la información disponible).

No se han publicado resultados de benchmarks comparativos con otros modelos de profundidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 a 480×640 el pico medido es de 1,5 GB en una GTX 1080 Ti; las variantes int8 (420 MB de pesos) y 4 bits (360 MB) reducen el uso de memoria proporcionalmente al tamaño de los pesos.
- GPU recomendadas: el autor reporta mediciones en una GTX 1080 Ti; por tamaño del modelo (334 M de parámetros) cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Cabe en GPU de consumo: sí, con margen amplio en todas las variantes, incluidas las de mayor resolución.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con driver de línea de comandos incluido en el repositorio; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de visión.
- Latencia y throughput: 0,22 s por imagen a 480×640 en fp32 sobre GTX 1080 Ti; las variantes cuantizadas no mejoran la latencia en CPU porque descomprimen a fp32 antes de las multiplicaciones matriciales. No se proporcionan cifras de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de estimación de profundidad monocular en la información proporcionada. A continuación se comparan únicamente las variantes internas de esta distribución:

| Variante | Parámetros | Resolución | Licencia | Tamaño en disco | Disponibilidad |
|---|---|---|---|---|---|
| DepthPro2-L-ONNX (int8) | 334 M | Dinámica, múltiplos de 32 | apple-amlr (no comercial) | 420 MB | Hugging Face |
| DepthPro2-L-ONNX (fp32) | 334 M | Dinámica, múltiplos de 32 | apple-amlr (no comercial) | 1339 MB | Hugging Face |
| DepthPro2-L-ONNX (4 bits mixtos) | 334 M | Dinámica, múltiplos de 32 | apple-amlr (no comercial) | 360 MB | Hugging Face |

## Limitaciones y advertencias

- Licencia Apple Research Licence: uso exclusivamente no comercial; cualquier despliegue en producción con fines comerciales requiere autorización expresa de Apple.
- La precisión de la profundidad depende críticamente de la focal horizontal `f_px`; una focal incorrecta escala linealmente todo el mapa de profundidad.
- La entrada debe tener altura y anchura múltiplos de 32; resoluciones no conformes requieren redimensionado previo y ajuste proporcional de `f_px`.
- Las variantes cuantizadas no reducen la latencia en CPU: todos los grafos descomprimen a fp32 antes de las multiplicaciones matriciales.
- El grafo de 4 bits mixtos presenta una desviación de 1,08 % en AbsRel_inv y un Edge F1 de 0,9905, aceptable para muchas aplicaciones pero no para pipelines que exijan la referencia exacta.
- Riesgo de alucinación geométrica en regiones sin textura, superficies reflectantes o escenas con iluminación adversa; no se documentan sesgos específicos en la información disponible.
- El modelo devuelve `inf` en el cielo, lo que exige manejo explícito de valores no finitos en los consumidores de la salida.
- No se han publicado datos sobre sesgos demográficos, geográficos o de otro tipo en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Petrouil/DepthPro2-L-ONNX
- Modelo base: https://huggingface.co/apple/DepthPro2-L
- Metodología de benchmarks: `BENCHMARKS.md` en el repositorio
- Paper de referencia (arXiv): arXiv:2611.26603
- Licencia: `LICENSE` en el repositorio
