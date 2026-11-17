# qhddz/raft-stereo-rknn3-rk1828

## Resumen

RAFT-Stereo (RKNN3 / RK1828) es una conversión del modelo RAFT-Stereo del laboratorio VL de la Universidad de Princeton, empaquetada en formato RKNN3 para su ejecución en la NPU Rockchip RK1828. El modelo original estima disparidad estéreo densa (mapas de profundidad a partir de un par de imágenes izquierda/derecha) y esta versión está cuantizada a int8 y limitada a una resolución de entrada de 160x240 píxeles, lo que la orienta a aplicaciones de visión en tiempo real en dispositivos de borde.

El paquete lo publica el usuario qhddz en Hugging Face y no incluye pesos en formato estándar (safetensors, ONNX o PyTorch), sino únicamente el binario `.rknn` junto con su fichero `.weight` asociado, una pareja de imágenes de ejemplo y un demo precompilado para x86_64 que se comunica con la NPU vía PCIe. Según la model card, la conversión se realizó con los pipelines oficiales de `rknn3_model_zoo` y se verificó sobre hardware RK1828 real.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un artefacto de despliegue para una NPU concreta. No hay información publicada sobre parámetros, contexto, idiomas ni benchmarks más allá de una latencia medida de 90,5 ms por par estéreo en int8 sobre RK1828.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT-Stereo (red recurrente de flujo óptico adaptada a disparidad estéreo); empaquetado en formato RKNN3 para NPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | int8 (único formato publicado) |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | `.rknn` + `.weight` (binario propietario RKNN3); no se publican safetensors, ONNX ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es RAFT-Stereo, una extensión de RAFT (Recurrent All-Pairs Field Transforms) para estimación de disparidad estéreo. RAFT construye un volumen de correlación entre los mapas de características de ambas imágenes y refina iterativamente el campo de disparidad mediante una unidad recurrente (GRU) que opera sobre las correlaciones extraídas. RAFT-Stereo adapta esta formulación al caso estéreo con búsqueda de correlación 1D y agregación multi-nivel para manejar regiones oclusas y sin textura.

La model card no aporta detalles sobre el dataset de entrenamiento, el número de iteraciones de refinamiento, la composición de los datos ni si hubo ajuste fino adicional. Tampoco se documenta el proceso de cuantización más allá de indicar que se usaron los pipelines de `rknn3_model_zoo` y que el resultado se verificó en hardware RK1828. La entrada está fijada a 160x240 píxeles, una resolución muy baja que condiciona la precisión de la disparidad en escenas con objetos pequeños o lejanos.

## Capacidades

- Estimación de disparidad estéreo densa a partir de un par de imágenes izquierda/derecha a resolución 160x240.
- Generación de un mapa de disparidad en PNG donde el brillo es proporcional a la cercanía del objeto.
- Ejecución sobre NPU Rockchip RK1828 mediante RKNN3, con host x86_64 conectado por PCIe.
- Inferencia cuantizada a int8 con latencia medida de 90,5 ms por par estéreo.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni visión general.
- No dispone de capacidades multilingües ni de modo de razonamiento extendido.

## Casos de uso

- Visión estéreo embebida en robótica móvil: el modelo permite obtener un mapa de profundidad a ~11 FPS (90,5 ms por par) sobre RK1828, suficiente para navegación reactiva de un robot de baja velocidad que necesite evitar obstáculos cercanos.
- Detección de obstáculos en drones o vehículos de interior: con entrada 160x240 y latencia inferior a 100 ms, encaja en bucles de control que requieran reaccionar a distancias cortas, aunque la baja resolución limita la detección de objetos pequeños.
- Aforo y conteo de personas con cámara estéreo: la disparidad permite segmentar por profundidad y separar personas del fondo sin necesidad de calibración de cámara monocromática.
- Automatización industrial de pick-and-place de objetos grandes: el mapa de disparidad sirve para localizar la posición relativa de piezas en una cinta transportadora cuando la precisión requerida es de centímetros.
- Prototipado rápido con RK1828: al incluir un demo x86_64 precompilado y librerías de runtime, permite validar el pipeline estéreo completo (captura, inferencia, visualización) sin escribir código de integración de NPU.
- Investigación en visión de bajo consumo: sirve como referencia de despliegue int8 de RAFT-Stereo para comparar latencia y calidad frente a versiones en FP16/FP32 sobre otras plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (EPE, D1, bad-3.0) en la información disponible. El único dato de rendimiento medido es la latencia.

| Metrica | Valor | Plataforma |
|---|---|---|
| Latencia por par estéreo (int8) | 90,5 ms | RK1828 |
| Resolucion de entrada | 160x240 | fija |
| Throughput aproximado | ~11 pares/s | RK1828 |

## Requisitos de hardware

- NPU objetivo: Rockchip RK1828 (RKNN3), con host x86_64 conectado por PCIe.
- No se documenta VRAM ni memoria del sistema necesaria; el paquete del repositorio ocupa 0,0 GB según Hugging Face, lo que sugiere un tamaño reducido.
- No es ejecutable en GPU convencionales (A100, H100, RTX 4090) sin reconversión, ya que solo se publican binarios `.rknn`.
- Opciones de despliegue: runtime RKNN3 con el demo x86_64 incluido (`demo_x86_64.tar.gz`) o integración propia mediante las librerías de runtime RKNN3.
- No se dispone de datos de throughput en otras plataformas ni de comparación con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAFT-Stereo (RKNN3/RK1828, este) | Estéreo, NPU Rockchip | 160x240 | int8 | BSD-3-Clause | Binario `.rknn` en HF |
| RAFT-Stereo original (Princeton VL) | Estéreo, GPU | configurable | FP32/FP16 | BSD-3-Clause | Pesos PyTorch en GitHub |
| CREStereo | Estéreo, GPU | configurable | FP32/FP16 | no disponible | Repositorio oficial Megvii |
| IGEV-Stereo | Estéreo, GPU | configurable | FP32/FP16 | no disponible | Repositorio oficial |

La comparación directa con los modelos originales no es posible en términos de precisión porque no se publican métricas de este paquete. La diferencia principal es el formato de despliegue: este artefacto está atado a RKNN3 y a RK1828, mientras que las alternativas requieren GPU y frameworks estándar.

## Limitaciones y advertencias

- Resolución de entrada fija a 160x240: limita la precisión en escenas con objetos pequeños, texturas finas o superficies lejanas.
- Cuantización int8: puede degradar la calidad del mapa de disparidad respecto al modelo original en FP32, especialmente en regiones de bajo contraste.
- Dependencia de hardware: solo se publican binarios para RK1828; no hay pesos portables ni código de conversión en el repositorio.
- Sin información sobre sesgos o dominios de entrenamiento del modelo original en esta ficha; los sesgos de RAFT-Stereo dependen del dataset usado por Princeton VL, no documentado aquí.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de disparidad errónea en regiones oclusas o sin textura.
- Licencia BSD-3-Clause permite uso comercial, pero conviene verificar la licencia del modelo original y de los pesos convertidos.
- El repositorio tiene 0 descargas y 0 likes, y no se ha actualizado desde su creación; no hay garantía de mantenimiento.
- No se documenta el proceso de calibración de la cámara estéreo necesaria para usar el modelo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/qhddz/raft-stereo-rknn3-rk1828
- Repositorio de pipelines de conversión: https://github.com/airockchip/rknn3_model_zoo
- RAFT-Stereo (Princeton VL): no se proporciona enlace en la información disponible
- Paper de RAFT-Stereo: no disponible en la información proporcionada
