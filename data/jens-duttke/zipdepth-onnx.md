# Jens-Duttke/ZipDepth-ONNX

## Resumen

ZipDepth-ONNX es la exportación a ONNX en FP16 del modelo ZipDepth, una red convolucional de estimación de profundidad monocular de 6,1 millones de parámetros presentada por Tosi, Bartolomei, Poggi y Mattoccia en ECCV 2026 bajo el título «ZipDepth: Bringing Lightweight Zero-Shot Monocular Depth Anywhere, on Any Device». El repositorio lo publica Jens-Duttke como artefacto listo para consumir desde ONNX Runtime, orientado al registro de modelos de profundidad de Oku3D y reutilizable por cualquier aplicación que ejecute grafos ONNX. El peso del fichero es de 12 MB, lo que lo sitúa en la categoría de modelos de visión desplegables en dispositivos de gama baja, navegadores o sistemas embebidos.

El problema que resuelve es la obtención de mapas de profundidad densos a partir de una sola imagen RGB con un coste computacional mínimo: 0,72 ms por fotograma a 384 px y 1,18 ms a 512 px sobre una RTX 5070 Ti con el proveedor DirectML de ONNX Runtime, y 21,6 ms / 36,5 ms respectivamente sobre gráficos integrados AMD de un Ryzen 9 9950X. La salida es profundidad inversa relativa (cercano = valor alto), pensada para warp estéreo sin inversión previa.

La relevancia actual del artefacto es doble: por un lado, el autor del export sustituye dos operaciones del grafo original (`F.unfold` y `F.adaptive_avg_pool2d`) por equivalentes que permiten ejes de tamaño libre, verificadas con diferencia máxima de 0,0 frente a la red original; por otro, mantiene una desviación de solo 0,41 % a 384 px y 0,51 % a 512 px respecto al export FP32, lo que hace viable usar FP16 sin degradación apreciable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional (CNN) para estimación de profundidad monocular; codificador con cinco reducciones de resolución, bloque cross-scale y upsampler convexo |
| Parámetros totales | 6,1 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, sin ventana de texto) |
| Tipos de cuantización | FP16 (export publicado); checkpoint original en FP32 (`zipdepth_base.pth`) |
| Idiomas soportados | No disponible / no aplica (no procesa texto) |
| Licencia | MIT (según los autores) |
| Formato de pesos | ONNX, opset 17 (`zipdepth_fp16_opset17.onnx`, 12 MB) |
| Entrada | `pixel_values`, float32, `[batch_size, 3, height, width]`, RGB en [0, 1] sin estandarizar |
| Salida | `predicted_depth`, float32, `[batch_size, 1, height, width]`, profundidad inversa relativa (cercano = alto) |
| Resolución de entrada | Libre, `height` y `width` múltiplos de 32; entrenado a 384, ejecutado a 384 y 512 en Oku3D |
| Ejes dinámicos | `batch_size`, `height` y `width`; se pueden fijar por nombre sin penalización de velocidad en DirectML |
| Precisión interna | Pesos en FP16, frontera del grafo en FP32 |
| Checkpoint base | `checkpoints/zipdepth_base.pth`, commit 91f3fd2 del repositorio de los autores |
| Runtime | ONNX Runtime (probado con la versión 1.24.4 y DirectML) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

ZipDepth es una red fully convolutional de profundidad monocular. El grafo reduce la resolución de la imagen cinco veces (de ahí la restricción de que alto y ancho sean múltiplos de 32), procesa características a varias escalas mediante un bloque cross-scale y reconstruye el mapa denso con un upsampler convexo que predice kernels de muestreo por píxel. Con 6,1 M de parámetros, el modelo se sitúa dos órdenes de magnitud por debajo de los transformadores de profundidad habituales, lo que explica sus latencias submilisegundo en GPU de consumo.

El entrenamiento, según el paper citado en la model card, utiliza mapas de profundidad generados por Depth Anything V2 Large como supervisión, cuyos pesos están licenciados CC BY-NC 4.0. El modelo se presenta como zero-shot según el título de la publicación. No se detallan en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste con RLHF/DPO (no aplicables a un modelo de visión).

La innovación técnica de este export concreto no está en la red, sino en la portabilidad del grafo: `F.unfold(depth, 3)` en el upsampler convexo se reemplaza por una convolución 3x3 con nueve kernels one-hot en el mismo orden, y `F.adaptive_avg_pool2d` del bloque cross-scale se sustituye por `F.avg_pool2d(x, 2)`, equivalente porque el objetivo es siempre la mitad del tamaño de entrada cuando el marco es múltiplo de 32. Ambas sustituciones se validaron con entradas aleatorias a 384 y 512 px con diferencia máxima de 0,0 frente a la red original.

## Capacidades

- Estimación de profundidad monocular densa a partir de una imagen RGB, con salida a la misma resolución espacial que la entrada.
- Funcionamiento zero-shot según la publicación de los autores (sin ajuste por escena).
- Salida en profundidad inversa relativa (valores altos = objetos cercanos), directamente utilizable para warp estéreo sin invertir el mapa.
- Procesamiento por lotes: el eje `batch_size` es dinámico.
- Resolución de entrada flexible en cualquier múltiplo de 32, con ejes `height` y `width` dinámicos y fijables por nombre.
- Ejecución en ONNX Runtime sobre CPU, GPU (DirectML, CUDA) y otros proveedores de ejecución compatibles.
- Integración en el registro de modelos de profundidad de Oku3D.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- **Warp estéreo y síntesis de vistas**: la salida es profundidad inversa relativa con cercano = alto y no requiere inversión para reproyección, de modo que un pipeline de estéreo sintético puede usar el mapa directamente para desplazar píxeles entre vistas izquierda y derecha.
- **Realidad aumentada y post-proceso de vídeo en tiempo real**: a 0,72 ms por fotograma a 384 px en una RTX 5070 Ti (aproximadamente 1.390 imágenes/s), el modelo deja margen de sobra dentro de un presupuesto de 16,6 ms por fotograma a 60 fps para oclusión, desenfoque de fondo (bokeh sintético) o composición de capas.
- **Robótica y drones con cómputo embebido**: con 12 MB de pesos y ejecución viable en gráficos integrados (21,6 ms a 384 px), cabe en plataformas sin GPU dedicada para detección de obstáculos y navegación reactiva a partir de una única cámara.
- **Generación de pseudo-etiquetas y destilación**: útil como profesor barato o como filtro previo para anotar grandes volúmenes de imágenes con mapas de profundidad que luego alimenten el entrenamiento de otros modelos o el etiquetado de datasets de reconstrucción 3D.
- **Fotogrametría y previsualización 3D**: obtener un mapa de profundidad por imagen antes de un pipeline de estructura-from-motion permite inicializar nubes de puntos o descartar vistas sin parallax, con un coste de milisegundos por imagen.
- **Navegación asistida y accesibilidad**: convertir la cámara de un teléfono o de unas gafas en un sensor de proximidad aproximado, traduciendo la profundidad inversa relativa en avisos de obstáculo cercano.
- **Registro y distribución de modelos de profundidad**: cualquier consumidor del registro de Oku3D puede descargar el ONNX y ejecutarlo con el proveedor de ONNX Runtime que prefiera, sin depender del framework de entrenamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para métricas estándar de profundidad (AbsRel, RMSE, δ<1,25) ni para tareas de lenguaje (MMLU, HumanEval, GSM8K), que no aplican a este modelo.

Los únicos datos cuantitativos disponibles son de fidelidad numérica y latencia:

| Métrica | Condición | Valor |
|---|---|---|
| Desviación FP16 vs. export FP32 | 384 px, proveedor CPU de ONNX Runtime | 0,41 % de diferencia máxima por píxel relativa al rango de profundidad |
| Desviación FP16 vs. export FP32 | 512 px, proveedor CPU de ONNX Runtime | 0,51 % |
| Diferencia de las operaciones sustituidas | 384 y 512 px, entradas aleatorias | 0,0 (máxima) |
| Latencia | RTX 5070 Ti, DirectML, 384 px, mediana de 30 ejecuciones | 0,72 ms |
| Latencia | RTX 5070 Ti, DirectML, 512 px | 1,18 ms |
| Latencia | Radeon integrada (Ryzen 9 9950X), DirectML, 384 px | 21,6 ms |
| Latencia | Radeon integrada (Ryzen 9 9950X), DirectML, 512 px | 36,5 ms |

Throughput aproximado derivado de las latencias anteriores (1 / latencia, lote de 1): en torno a 1.390 imágenes/s a 384 px y 847 imágenes/s a 512 px en la RTX 5070 Ti; cerca de 46 y 27 imágenes/s respectivamente en la gráfica integrada AMD. No hay datos de throughput con lotes mayores ni de latencia en CPU pura.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB; los pesos FP16 ocupan 12 MB y el grafo completo es un fichero de 12 MB, por lo que la memoria dominante es la de las activaciones, proporcional al área de la imagen y al tamaño de lote.
- GPU recomendadas: cualquier GPU con soporte de DirectML, CUDA o TensorRT. Se han publicado medidas en una NVIDIA GeForce RTX 5070 Ti; por volumen de memoria no hay ninguna GPU de consumo moderna que quede excluida.
- Cabe en GPU de consumo y en gráficos integrados: se han reportado 21,6 ms a 384 px en una Radeon integrada de un Ryzen 9 9950X.
- CPU: viable, ya que el proveedor CPU de ONNX Runtime se usó para las pruebas de fidelidad numérica, aunque no se publican latencias en CPU.
- Opciones de despliegue: ONNX Runtime con los execution providers de CPU, CUDA, DirectML, TensorRT u OpenVINO; integración nativa en el registro de Oku3D. Herramientas como llama.cpp, Ollama o TGI no aplican a este modelo.
- Latencia y throughput: ver la tabla de la sección anterior; con ejes fijados por nombre, el rendimiento en DirectML es idéntico al de un grafo exportado a ese tamaño concreto.
- Memoria en disco: 12 MB para el modelo; el repositorio declara 0,0 GB de tamaño agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ZipDepth-ONNX (esta ficha) | 6,1 M | Imagen de tamaño libre múltiplo de 32; entrenado a 384 | MIT (entrenado con etiquetas de Depth Anything V2 Large, CC BY-NC 4.0) | ONNX en HuggingFace, 0 descargas | 0,72 ms a 384 px en RTX 5070 Ti |
| ZipDepth original (autores) | 6,1 M | Igual | MIT según los autores | Repositorio GitHub `fabiotosi92/ZipDepth`, checkpoint `zipdepth_base.pth` | Export de referencia en PyTorch; el export ONNX sustituye dos operaciones para permitir ejes libres |
| Depth Anything V2 Large | No disponible en la información proporcionada | No disponible | CC BY-NC 4.0 | No disponible en la información proporcionada | Usado como generador de las etiquetas de profundidad del entrenamiento de ZipDepth; uso comercial restringido por su licencia |
| Otros modelos monofocales (MiDaS/DPT y familia) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No se han proporcionado datos que permitan una comparación cuantitativa |

No se dispone de valores de AbsRel ni de δ<1,25 para ZipDepth en la información proporcionada, por lo que no es posible establecer una comparación de calidad numérica con las alternativas.

## Limitaciones y advertencias

- La salida es profundidad inversa relativa, no métrica: para obtener distancias en metros hace falta calibrar escala y desplazamiento con datos del dominio.
- El modelo espera RGB en [0, 1] sin estandarizar; aplicar antes la media y desviación típica de ImageNet las aplica dos veces y degrada la salida de forma silenciosa.
- Alto y ancho deben ser múltiplos de 32; otras resoluciones rompen el grafo o producen resultados inválidos.
- La licencia del repositorio es MIT, pero la model card advierte de que el entrenamiento usó mapas de Depth Anything V2 Large, cuyos pesos son CC BY-NC 4.0. Conviene revisar la procedencia de las etiquetas antes de un uso comercial en producción; este documento no constituye asesoramiento jurídico.
- La conversión a FP16 introduce una desviación de hasta 0,51 % respecto a FP32; aceptable para la mayoría de aplicaciones gráficas, pero a tener en cuenta en mediciones de precisión.
- No hay resultados publicados de AbsRel, RMSE ni δ<1,25 en la información disponible, así que la calidad real frente al estado del arte no es verificable con los datos aportados.
- El comportamiento zero-shot fuera del dominio de entrenamiento (interiores frente a exteriores, imágenes nocturnas, escenas sintéticas) no está documentado.
- No se detalla la composición del dataset de entrenamiento, por lo que no se puede evaluar el sesgo respecto a geografía, iluminación o tipos de escena.
- El repositorio tiene 0 descargas y 0 likes y una antigüedad mínima, sin validación independiente de la comunidad; conviene reproducir las medidas de latencia y fidelidad en el hardware objetivo antes de adoptarlo.
- El pipeline declarado es `depth-estimation`; no debe esperarse ningún comportamiento de texto, tool calling o agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jens-Duttke/ZipDepth-ONNX
- Repositorio de los autores (ZipDepth): https://github.com/fabiotosi92/ZipDepth
- Commit del checkpoint base: https://github.com/fabiotosi92/ZipDepth/tree/91f3fd21e131641f51e8d35736d1958350180e3a
- Licencia del export: https://huggingface.co/Jens-Duttke/ZipDepth-ONNX/blob/main/LICENSE
- Oku3D (registro de modelos de profundidad): https://oku3d.com
- Paper: Tosi, Bartolomei, Poggi, Mattoccia, «ZipDepth: Bringing Lightweight Zero-Shot Monocular Depth Anywhere, on Any Device», ECCV 2026 (sin URL disponible en la información proporcionada)
- Depth Anything V2 (origen de las etiquetas de entrenamiento, CC BY-NC 4.0): sin URL disponible en la información proporcionada
