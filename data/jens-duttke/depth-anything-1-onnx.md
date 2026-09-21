# Jens-Duttke/Depth-Anything-1-ONNX

## Resumen

Jens-Duttke/Depth-Anything-1-ONNX es un repositorio de exportaciones ONNX en FP16 de los dos checkpoints más pequeños de Depth Anything V1, un modelo de estimación de profundidad monocular publicado originalmente por LiheYoung y colaboradores (Yang et al., CVPR 2024). El repositorio no entrena ningún modelo nuevo: convierte a ONNX los pesos de LiheYoung/depth-anything-small-hf y LiheYoung/depth-anything-base-hf, con grafo optimizado para opset 20, para su uso en el registro de profundidad de Oku3D y en cualquier consumidor de ONNX Runtime.

El problema que resuelve es de despliegue. Ofrece dos grafos listos para producción que aceptan dimensiones libres (cualquier múltiplo del tamaño de parche 14), mantienen la frontera del grafo en FP32 y ejecutan los pesos en FP16, de modo que el consumidor entrega los tensores en el formato que ya tiene y las conversiones ocurren dentro del grafo. La salida es disparidad relativa con la convención de Depth Anything (cerca = valor alto), apta para warping estéreo sin necesidad de invertir el mapa.

Es relevante ahora porque los ficheros ocupan solo 48 MB (small) y 187 MB (base), lo que permite inferencia en tiempo real en GPU de consumo, y el autor reporta una desviación media absoluta frente al checkpoint de PyTorch de únicamente el 0,05 % y el 0,04 % respectivamente, muy por debajo de la conversión a 4 bits a la que sustituye (2,54 % y 1,37 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión para estimación de profundidad monocular (encoder tipo ViT con decodificador denso, familia Depth Anything V1); exportado como grafo ONNX opset 20 |
| Parametros totales | no disponible en la información proporcionada (los checkpoints base son las variantes small y base de Depth Anything V1) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una imagen con altura y anchura libres, múltiplos de 14 (batch fijo a 1) |
| Tipos de cuantizacion | FP16 en los pesos con frontera FP32; el autor la compara con una conversión a 4 bits previa |
| Idiomas soportados | no aplica / no disponible (modelo de visión, sin componente de texto) |
| Licencia | Apache-2.0 (heredada de los checkpoints base) |
| Formato de pesos | ONNX (opset 20), pesos FP16; dos ficheros .onnx |
| Variantes incluidas | da-v1-small_fp16_opset20_optimized.onnx (48 MB) y da-v1-base_fp16_opset20_optimized.onnx (187 MB) |
| Pipeline | depth-estimation |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El repositorio no modifica la topología original. Depth Anything V1 combina un codificador de visión tipo ViT con un decodificador denso que produce un mapa de profundidad/disparidad relativa a la resolución del parche, con parche de tamaño 14. La exportación conserva esa estructura y sólo cambia el formato y la precisión de los pesos: FP16 dentro del grafo, FP32 en los límites de entrada y salida. El grafo expone una única entrada `pixel_values` de tipo float32 con forma `[1, 3, height, width]` y una única salida `predicted_depth` de tipo float32 con forma `[1, 14*(height//14), 14*(width//14)]`.

No hay entrenamiento propio ni ajuste fino en esta exportación: los pesos se derivan por conversión directa del checkpoint de PyTorch. Según el paper original (Yang et al., CVPR 2024), Depth Anything V1 se entrena con un esquema semi-supervisado sobre un volumen muy grande de imágenes sin etiquetar, con la profundidad relativa como objetivo. El autor de la exportación sólo documenta el proceso de conversión y optimización a opset 20 con dimensiones libres, sin publicar detalles adicionales de datos, RLHF/DPO ni innovaciones de atención.

## Capacidades

- Estimación de profundidad monocular: genera un mapa de disparidad relativa con la convención near = high.
- Entrada RGB normalizada con estadísticos de ImageNet (media `[0.485, 0.456, 0.406]`, desviación `[0.229, 0.224, 0.225]`).
- Resolución flexible: `height` y `width` aceptan cualquier múltiplo de 14; el batch está fijo a 1.
- Salida directamente utilizable para warping estéreo, sin inversión del mapa.
- Dos variantes de coste/precisión: small (48 MB) y base (187 MB).
- Ejecución mediante ONNX Runtime en múltiples proveedores de ejecución (DirectML, CPU y otros compatibles con ORT).
- No es un modelo de lenguaje: no realiza generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Síntesis de vistas y estéreo: el mapa de disparidad relativa se puede usar directamente para desplazar píxeles y generar un par estéreo o un efecto de paralaje, ya que la convención near = high evita invertir la salida.
- Reconstrucción 3D y nubes de puntos: integrado en el registro de profundidad de Oku3D, el mapa sirve como entrada para reproyectar la imagen a una nube de puntos densa o a una malla.
- Realidad aumentada y mixta: la profundidad monocular permite ocluir objetos virtuales con geometría real en tiempo real, aprovechando los 2,0-7,0 ms por fotograma de la variante small.
- Segmentación por profundidad y efecto bokeh: separar primer plano y fondo para desenfoque selectivo o sustitución de fondo en fotografía y vídeo, con una desviación inferior al 0,1 % respecto al checkpoint de PyTorch.
- Robótica y navegación: percepción de distancia relativa con una sola cámara RGB para evitación de obstáculos o planificación aproximada, ejecutable en hardware modesto por el tamaño reducido de los ficheros.
- Automoción y asistencia a la conducción: estimación de profundidad monocular como señal auxiliar en tareas de detección de obstáculos y comprensión de escena, con latencias de milisegundos.
- Post-procesado de vídeo: canal de profundidad por fotograma para efectos de foco, transiciones o estabilización basada en profundidad.
- Inferencia en el navegador o en el borde: al ser un grafo ONNX, se puede desplegar con ONNX Runtime en CPU o con aceleración DirectML/CUDA, lo que facilita su integración en aplicaciones de escritorio o web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval o GSM8K) en la información disponible, dado que no es un modelo de lenguaje. El autor sí publica dos conjuntos de medidas.

Desviación media absoluta frente al checkpoint de PyTorch a 518 px, sobre las cuatro imágenes de ejemplo, expresada como porcentaje del rango de profundidad del propio mapa de referencia:

| Variante | Esta exportación | Conversión a 4 bits a la que sustituye |
|---|---|---|
| small | 0,05 % | 2,54 % |
| base | 0,04 % | 1,37 % |

Rendimiento en GeForce RTX 5070 Ti, ONNX Runtime 1.24.4 sobre DirectML, dimensiones libres fijadas por resolución, mejor de 20 ejecuciones en una sesión nueva (2026-09-21):

| Variante | 252 px | 364 px | 518 px |
|---|---|---|---|
| small | 2,0 ms | 3,3 ms | 7,0 ms |
| base | 2,9 ms | 5,5 ms | 15,6 ms |

El propio autor advierte que fijar las dimensiones es determinante: el mismo grafo con las dimensiones libres abiertas cae en kernels genéricos y pierde una parte importante de este rendimiento.

## Requisitos de hardware

- VRAM estimada: muy baja. Los ficheros pesan 48 MB (small) y 187 MB (base), por lo que con sus activaciones caben holgadamente en cualquier GPU con unos pocos cientos de MB libres.
- GPU de gama alta: sin problema; el autor mide 2,0-15,6 ms por inferencia en una RTX 5070 Ti.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna e incluso en gráficas integradas con soporte DirectML. También es viable en CPU para resoluciones moderadas.
- Opciones de despliegue: ONNX Runtime (DirectML, CUDA, TensorRT, OpenVINO, CPU) y consumidores ONNX en general; al ser un grafo estándar, se integra en aplicaciones de escritorio, servidor y navegador a través de los distintos proveedores de ejecución de ORT.
- Latencia y throughput: documentados para la RTX 5070 Ti con DirectML (ver la tabla de la sección anterior); no se han publicado medidas para otras GPU ni para CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-1-ONNX small | no disponible | ONNX FP16, 48 MB | 0,05 % MAD frente a PyTorch | Apache-2.0 | HuggingFace |
| Depth-Anything-1-ONNX base | no disponible | ONNX FP16, 187 MB | 0,04 % MAD frente a PyTorch | Apache-2.0 | HuggingFace |
| LiheYoung/depth-anything-small-hf | no disponible | PyTorch (checkpoint base) | referencia | Apache-2.0 | HuggingFace |
| LiheYoung/depth-anything-base-hf | no disponible | PyTorch (checkpoint base) | referencia | Apache-2.0 | HuggingFace |
| Depth Anything V2 | no disponible | no disponible | no disponible | no disponible | GitHub / HuggingFace |
| MiDaS | no disponible | no disponible | no disponible | no disponible | GitHub / HuggingFace |

La comparación directa de la que hay datos es la que ofrece el propio autor: esta exportación FP16 frente a la conversión a 4 bits que reemplaza, con una reducción de la desviación de 2,54 % a 0,05 % en small y de 1,37 % a 0,04 % en base. Frente a Depth Anything V2 o MiDaS no se dispone de métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- El batch está fijo a 1: no se pueden procesar varias imágenes en una misma llamada al grafo.
- La altura y la anchura deben ser múltiplos de 14; otras resoluciones requieren redimensionado previo.
- La salida es disparidad relativa, no profundidad métrica. Para obtener distancias absolutas hace falta calibrar la escala con información externa.
- Es obligatorio alimentar la imagen con la normalización ImageNet indicada; otro preprocesado degrada el resultado.
- Modelo de visión puro: no soporta texto, tool calling, agentes ni multilingüismo, por lo que no debe evaluarse con los criterios habituales de un LLM.
- Riesgo de error en superficies ambiguas (superficies reflectantes, transparentes, texturas repetitivas o regiones sin textura), típico de la estimación de profundidad monocular.
- Herencia de sesgos del dataset de entrenamiento original de Depth Anything V1; no se documentan análisis de sesgo en esta exportación.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar los términos de los checkpoints base y del backbone original antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes, con fechas de creación y actualización el mismo día, por lo que no cuenta con validación externa de la comunidad.
- El rendimiento medido corresponde a una única configuración (RTX 5070 Ti con DirectML); no hay garantías de que se traslade a otros proveedores de ejecución o a CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jens-Duttke/Depth-Anything-1-ONNX
- Checkpoint base small: https://huggingface.co/LiheYoung/depth-anything-small-hf
- Checkpoint base base: https://huggingface.co/LiheYoung/depth-anything-base-hf
- Repositorio original Depth Anything: https://github.com/LiheYoung/Depth-Anything
- Oku3D: https://oku3d.com
