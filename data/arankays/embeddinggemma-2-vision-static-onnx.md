# arankays/embeddinggemma-2-vision-static-onnx

## Resumen

`arankays/embeddinggemma-2-vision-static-onnx` es un export a ONNX del codificador de visión de EmbeddingGemma 2 (Google DeepMind), reempaquetado con formas estáticas para que pueda compilarse y ejecutarse en la NPU integrada de Intel mediante OpenVINO. No es un modelo nuevo: los pesos son exactamente los del export de `onnx-community`, sin modificar, y lo que cambia es el grafo. El autor elimina la única forma dinámica del original —la selección de celdas válidas mediante `NonZero → Transpose → GatherND`— y fija las entradas al tamaño con relleno que produce el procesador de imágenes, de modo que el compilador de NPU acepta el modelo.

Se publican tres variantes según el número de soft tokens por imagen: 280 (valor por defecto del modelo original), 140 y 70. Todas comparten el mismo fichero de pesos fp32 de 671 MB y producen embeddings de 512 dimensiones que se alinean con la mitad textual del modelo, publicada por separado en `arankays/embeddinggemma-2-text-int8-cw-onnx`. El resultado es un pipeline imagen-texto completo que corre íntegramente en NPU, con recuperación cruzada sobre Flickr30k y consumos energéticos medidos.

Su relevancia es práctica: permite búsqueda semántica de imágenes en local, sobre hardware de bajo consumo, sin GPU y sin depender de servicios en la nube. El coste es que el modelo pierde la flexibilidad de formas dinámicas y que parte del postprocesado (el cálculo de la máscara de parches válidos) debe hacerse en CPU porque la salida `image_mask` del grafo es incorrecta en NPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer codificador de visión (ViT con agrupación de parches en celdas 3×3), exportado a ONNX con formas estáticas; parte de EmbeddingGemma 2 de Google DeepMind |
| Parámetros totales | no disponible (el fichero de pesos `onnx/vision_encoder.onnx_data` ocupa 671 MB en fp32) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (es un codificador de visión; no hay ventana de contexto generativa) |
| Tipos de cuantización | Pesos fp32 (recomendado y único válido en NPU); se probó compresión INT8_SYM de NNCF, sin ganancia de velocidad y con degradación severa en NPU (coseno 0,67) aunque correcta en CPU (0,9996). La mitad textual hermana usa INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tres grafos `.onnx` que comparten un `.onnx_data` externo en fp32) |

Variantes de grafo publicadas:

| Grafo | Soft tokens | `pixel_values` | `pixel_position_ids` | `image_features` |
|---|---|---|---|---|
| `onnx/vision_encoder_static_280.onnx` | 280 (por defecto del original) | `[1, 2520, 768]` | `[1, 2520, 2]` | `[280, 512]` |
| `onnx/vision_encoder_static_140.onnx` | 140 | `[1, 1260, 768]` | `[1, 1260, 2]` | `[140, 512]` |
| `onnx/vision_encoder_static_70.onnx` | 70 | `[1, 630, 768]` | `[1, 630, 2]` | `[70, 512]` |

## Arquitectura y entrenamiento

El modelo es el codificador visual de EmbeddingGemma 2, un transformer tipo ViT que divide la imagen en parches, los agrupa en celdas de 3×3 y genera un embedding por celda (hasta 280 soft tokens por imagen), con una dimensión de salida de 512. El export original de `onnx-community` recortaba las celdas que no contenían un parche real mediante `NonZero → Transpose → GatherND`, una selección dependiente de los datos que introduce formas dinámicas y que el compilador de NPU rechaza. Este repositorio fija las entradas al tamaño con relleno del procesador (`Gemma4ImageProcessor`, con `max_soft_tokens` ajustado al grafo) y elimina esos tres nodos, de manera que `image_features` contiene siempre todas las celdas y el recorte se hace en el host.

No hay entrenamiento ni ajuste fino por parte del autor: los pesos son byte a byte los del fichero fp32 original (SHA-256 `ca8d28c9…c01e37e`), y los grafos se generan con el script `bench/static_vision.py` del repositorio vinoSearch. La innovación es puramente de despliegue: formas estáticas compatibles con NPU, postprocesado de la máscara en CPU porque la salida `image_mask` del grafo es correcta en CPU pero errónea en NPU, y concatenación con la mitad textual mediante una secuencia de tokens concreta (`input_ids = [2, 255999, 258880 × N, 258882, 1]`, es decir, BOS, inicio de imagen, N tokens de imagen, fin de imagen, EOS). No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF o DPO en la información disponible.

## Capacidades

- Extracción de características de imagen: genera embeddings visuales de 512 dimensiones, L2-normalizados, listos para búsqueda por similitud.
- Recuperación texto-imagen e imagen-texto en un espacio compartido: las consultas textuales (`task: search result | query: …`) buscan directamente sobre imágenes sin necesidad de un adaptador intermedio.
- Tres presupuestos de tokens (280, 140 y 70) que permiten intercambiar precisión por latencia y energía.
- Ejecución íntegra en NPU Intel vía OpenVINO, sin uso de CPU en el pipeline medido y sin GPU.
- Integración con la mitad textual INT8 del mismo autor (`model_image_<tokens>.onnx`), que acepta directamente la salida del codificador y fusiona las N primeras filas ignorando el resto.
- Inferencia con formas estáticas, adecuada para compilación anticipada y caché de modelo (`CACHE_DIR`).
- No soporta generación de texto, tool calling, agentes, visión generativa, audio ni modo de razonamiento: es un codificador de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda semántica de imágenes en local: indexar una fototeca y consultar en lenguaje natural, aprovechando que los embeddings de imagen y texto comparten espacio. El presupuesto de 140 tokens ofrece 84,5 de R@1 en texto→imagen con 1,3 s por imagen en NPU.
- Gestión de archivos multimedia en equipos de sobremesa o mini-PC: al ejecutarse en la NPU integrada, el pipeline queda libre de GPU y consume 4,4 J por imagen (2,2 J por encima del reposo), lo que permite indexar colecciones grandes sin penalizar la batería ni la refrigeración.
- Deduplicación y agrupación visual: calcular embeddings de un catálogo y agrupar por similitud de coseno para detectar imágenes repetidas o variantes de un mismo producto.
- Filtrado y moderación previa de contenido visual: clasificación por similitud contra un conjunto de referencias etiquetadas, con umbral sobre la distancia coseno, antes de un paso de revisión humana.
- Recuperación multimodal aumentada (RAG sobre documentos con figuras): indexar figuras, capturas y diagramas de documentación técnica y recuperarlos junto con fragmentos de texto del mismo espacio semántico.
- Kioscos, dispositivos empotrados y edge computing: al compilar a un grafo estático de 0,7 GB de repositorio y no requerir acelerador dedicado, encaja en equipos con NPU de bajo consumo donde no se puede desplegar una GPU.
- Prototipado de sistemas de búsqueda visual sin servicio externo: al ser Apache 2.0 y funcionar sobre OpenVINO, permite validar productos de búsqueda de imágenes sin coste de API ni envío de datos a terceros.

## Benchmarks y rendimiento

Recuperación en Flickr30k, split de test de 1.000 imágenes y 5.000 captions, medida en un Core 5 320 (NPU Wildcat Lake) con OpenVINO 2026.4.1 y driver 1.35.0 el 2026-10-19. Ambas etapas (este codificador y el `model_image_<tokens>.onnx` INT8 del repositorio de texto) se ejecutaron en NPU.

| Soft tokens | Texto→imagen R@1 / R@5 / R@10 | Imagen→texto R@1 / R@5 / R@10 | ms/imagen | Paquete J/imagen (sobre reposo) | Coseno frente a referencia |
|---|---|---|---|---|---|
| 280 | 86,3 / 97,5 / 98,7 | 96,5 / 99,8 / 100,0 | 2767 | 9,4 (4,9) | ≥0,9997 |
| 140 | 84,5 / 96,9 / 98,6 | 95,7 / 99,7 / 100,0 | 1311 | 4,4 (2,2) | ≥0,9996 |
| 70 | 81,1 / 95,4 / 97,9 | 91,8 / 98,9 / 99,7 | 653 | 2,2 (1,1) | ≥0,9994 |

La columna de coseno compara con sentence-transformers en PyTorch al mismo número de tokens. La energía se midió con RAPL frente a un reposo de 1,65 W. El autor recomienda 140 tokens como valor por defecto: pierde 1,8 puntos de R@1 respecto a 280 con el mismo R@10, a la mitad de tiempo y energía. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (se ejecuta en NPU o CPU). El fichero de pesos fp32 ocupa 671 MB, por lo que en memoria compartida se necesita aproximadamente 0,7 GB más el espacio de activaciones del grafo.
- GPU recomendadas: no documentadas; el repositorio está orientado a NPU Intel y a CPU. Cualquier GPU con soporte de OpenVINO u ONNX Runtime podría ejecutar los grafos, pero no hay mediciones publicadas.
- Cabe en hardware de consumo: sí, el caso medido es un Intel Core 5 320 (Wildcat Lake) con NPU integrada, sin GPU dedicada.
- Opciones de despliegue: OpenVINO (runtime usado en las mediciones, con `CACHE_DIR` para la compilación), ONNX Runtime; también es posible ejecutar los grafos en CPU con los pesos fp32 o con compresión INT8 de NNCF.
- Latencia y throughput medidos: 2767 ms/imagen con 280 tokens, 1311 ms/imagen con 140 y 653 ms/imagen con 70, extremo a extremo incluyendo el codificador de texto INT8.
- Compilación inicial: unos 95 s con 280 tokens, 28 s con 140 y 12 s con 70 en el dispositivo de prueba. Es imprescindible usar caché de compilación para no pagar ese coste en cada arranque.
- Nota de rendimiento: usar pesos fp32 en NPU. La compresión INT8_SYM de pesos no acelera (el codificador está limitado por cómputo) y rompe la precisión en NPU (coseno 0,67), aunque funciona en CPU (0,9996).

## Comparativa con modelos similares

| Modelo | Tipo | Formas | Contexto / tokens de imagen | Licencia | Observaciones |
|---|---|---|---|---|---|
| `arankays/embeddinggemma-2-vision-static-onnx` (este) | Codificador de visión ONNX estático | Estáticas (280, 140, 70 soft tokens) | Hasta 280 soft tokens por imagen, salida de 512 dimensiones | Apache 2.0 | Compila en NPU Intel; requiere postprocesado de la máscara en CPU; pesos idénticos al original |
| `onnx-community/embeddinggemma-2-ONNX` | Codificador de visión ONNX original | Dinámicas (`NonZero → Transpose → GatherND`) | Igual, hasta 280 soft tokens | Apache 2.0 | Referencia upstream; el compilador de NPU rechaza la selección dependiente de datos; útil en CPU/GPU |
| `arankays/embeddinggemma-2-text-int8-cw-onnx` | Codificador de texto ONNX INT8 | Estáticas por número de tokens | No disponible | Apache 2.0 | Mitad textual complementaria; consume directamente la salida de este repositorio |
| Alternativas de la misma categoría (CLIP, SigLIP, etc.) | Codificadores imagen-texto | No disponible | No disponible | No disponible | No se han proporcionado datos de benchmarks ni especificaciones de estos modelos en la información disponible, por lo que no se incluye comparación numérica |

## Limitaciones y advertencias

- Solo contiene la mitad visual: no genera texto ni embeddings de texto por sí mismo. Requiere el repositorio de texto hermano y respetar la secuencia exacta de tokens especiales (`2`, `255999`, `258880 × N`, `258882`, `1`).
- Las formas son estáticas por diseño: no admite entradas de tamaño arbitrario. Hay que reprocesar la imagen con `max_soft_tokens` igual al del grafo elegido y rellenar `input_ids` y `attention_mask` con 0 al final hasta la longitud esperada.
- La salida `image_mask` del grafo es incorrecta en NPU: la máscara de parches válidos debe calcularse en el host a partir de `pixel_position_ids` (los parches de relleno llevan posición `-1`), tomando `(h // 3) * (w // 3)` filas de `image_features`.
- En NPU hay que usar fp32. La compresión INT8 de pesos degrada el coseno a 0,67 en ese dispositivo, frente a 0,9996 en CPU.
- La primera compilación es lenta (hasta 95 s con 280 tokens) y debe amortiguarse con caché.
- Los resultados de recuperación proceden de un único dispositivo y una única fecha (Core 5 320, OpenVINO 2026.4.1, 2026-10-19) y de un único conjunto (Flickr30k, 1.000 imágenes). No hay validación en otros idiomas ni en dominios distintos de fotografías con captions.
- No se documentan sesgos, cobertura lingüística ni evaluación de robustez. Al ser un derivado de EmbeddingGemma 2, hereda las características del modelo base de Google DeepMind, no descritas aquí.
- Riesgo de falsos positivos en recuperación: el umbral de similitud de coseno debe calibrarse por dominio; las métricas R@10 cercanas al 100 % en imagen→texto no implican precisión perfecta en el primer resultado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente por parte de la comunidad. Conviene verificar el SHA-256 de los pesos frente al upstream antes de usarlo en producción.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero con la obligación habitual de conservar avisos de licencia y atribución a Google DeepMind y a los autores del export.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arankays/embeddinggemma-2-vision-static-onnx
- Mitad textual complementaria: https://huggingface.co/arankays/embeddinggemma-2-text-int8-cw-onnx
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Export ONNX original: https://huggingface.co/onnx-community/embeddinggemma-2-ONNX
- Script de generación de los grafos: https://github.com/karanshukla/vinoSearch/blob/main/bench/static_vision.py
- Repositorio vinoSearch: https://github.com/karanshukla/vinoSearch
- Issue sobre el rechazo de formas dinámicas en NPU: https://github.com/karanshukla/vinoSearch/issues/2
- No se han encontrado en la búsqueda web otros enlaces relevantes al modelo (papers, blogs o demos).
