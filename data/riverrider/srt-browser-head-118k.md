# RiverRider/srt-browser-head-118k

## Resumen

El modelo `RiverRider/srt-browser-head-118k` es un **head lineal de solo 2,1 MB** (fp16) que permite a un modelo de lenguaje cuantizado de 0,6B parámetros (Qwen3-0.6B) ejecutarse íntegramente en un navegador web y realizar búsqueda cross-modal texto-imagen sobre una galería de 123.287 fotografías. La clave del enfoque es que esas imágenes fueron codificadas **offline** por un modelo de 27B parámetros, cuyas representaciones quedaron almacenadas en un archivo índice. El modelo pequeño nunca descarga ni ejecuta el modelo grande: simplemente proyecta su propio hidden state mediante el head lineal al espacio de la galería, logrando así que un modelo de 0,6B "lea" las representaciones de uno de 27B.

Desarrollado por RiverRider, este adaptador resuelve el problema de hacer retrieval visual de alta calidad en dispositivos con recursos limitados, sin necesidad de servidor de inferencia ni conexión tras la primera carga. Es relevante ahora porque demuestra una vía práctica para combinar modelos grandes (codificación offline) con modelos pequeños (inferencia en el borde), usando un head de entrenamiento ligero y un runtime en WebAssembly (Rust + candle). El modelo base es Qwen3-0.6B, congelado, y el head se entrena como un *linear probe* sobre sus representaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Head lineal (*read-out head*) sobre Qwen3-0.6B congelado |
| Parametros totales | Head: 2,1 MB en fp16 (aprox. 1,05M parametros); modelo base: 0,6B (no incluido en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-0.6B, no especificada en la ficha) |
| Tipos de cuantizacion | Head en fp16; modelo base en Q4_0 (runtime candle); anchor de recalibracion de 4 KB |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (head), .pt (checkpoint), .bin (anchor) |

## Arquitectura y entrenamiento

El modelo es un **linear probe** (head de lectura) que se conecta a las representaciones internas de un modelo de lenguaje congelado, Qwen3-0.6B. El head proyecta el hidden state del modelo base a un espacio vectorial donde se comparan las representaciones de texto con las de imágenes (previamente codificadas por un modelo de 27B). Según la documentación, se intentó fusionar la pasada de generación con la de retrieval, pero se comprobó que no funciona: el head necesita el mensaje "desnudo" (sin formato de chat) y una segunda pasada sobre el mismo modelo congelado. Cada pasada es una multiplicación de matrices adicional sobre un hidden state que el modelo ya estaba calculando.

El entrenamiento se realizó sobre datasets de COCO (concretamente `RiverRider/srt-qwen38-coco-states` y `RiverRider/srt-coco-thumbs`). No se especifican el número de tokens ni el método de optimización, pero por tratarse de un *linear probe* se infiere un entrenamiento supervisado de retrieval con pérdida contrastiva o similar. Una innovación destacable es el **anchor de recalibración** (`anchor_candle_q4_text.bin`): un vector de 4 KB que corrige la deriva de las representaciones cuando el modelo base se ejecuta en cuantización Q4_0 con candle, ya que sin este ajuste el rendimiento cae a cero en recall.

## Capacidades

- **Retrieval texto-imagen (text-to-image)**: dado un texto, devuelve las imágenes más relevantes de una galería de 123.287 fotografías (COCO). R@1 de 0,1108 y mediana de rango 33 sobre la galería completa.
- **Retrieval imagen-texto (image-to-text)**: a partir de una imagen, recupera los textos descriptivos más relevantes (evaluado sobre un pool de validación de 5.000 imágenes, R@1 de 0,5348).
- **Ejecución en navegador**: el modelo base cuantizado (Q4_0) y el head se ejecutan en WebAssembly (Rust + candle), sin servidor de inferencia, funcionando offline tras la primera carga.
- **Reutilización de un mismo modelo para dos tareas**: el mismo Qwen3-0.6B congelado se usa tanto para generar texto como para producir la representación de búsqueda, sin necesidad de un segundo encoder.
- **Recalibración para runtime cuantizado**: el anchor de 4 KB permite que el head funcione correctamente en entornos Q4_0, donde sin él el recall cae a cero.
- **Soporte de retrieval a gran escala**: el índice de galería (`gallery_123k_v3.srtidx`, 130 MB en int8) permite buscar entre 123.287 imágenes con latencia baja.

## Casos de uso

- **Búsqueda visual en aplicaciones web sin servidor**: una web de fotografía de stock puede permitir a los usuarios buscar imágenes por descripción textual directamente en el navegador, sin backend de inferencia. El head de 2,1 MB y el índice de 130 MB se cargan una vez y las búsquedas se resuelven localmente.
- **Demostraciones y prototipos de retrieval cross-modal**: ideal para *proofs of concept* en los que se necesita mostrar búsqueda texto-imagen en un portátil o incluso en un móvil, sin depender de APIs externas.
- **Archivo personal de fotos**: una aplicación local que indexa las fotos del usuario con un modelo grande (offline) y luego permite buscar "atardecer en la playa" o "perro corriendo" usando solo el modelo pequeño en el dispositivo.
- **Sistemas de recomendación de contenido**: en una plataforma de imágenes generadas por usuarios, se puede usar el head para recomendar imágenes relacionadas con una consulta textual, todo en el cliente.
- **Herramientas de accesibilidad**: descripción de imágenes para personas con discapacidad visual, donde el modelo pequeño puede generar una descripción y a la vez buscar imágenes similares en una base local.
- **Investigación en retrieval eficiente**: como referencia para estudiar cómo un *linear probe* sobre un LLM congelado puede igualar (parcialmente) el rendimiento de modelos grandes, con un coste de inferencia mínimo.

## Benchmarks y rendimiento

Los resultados publicados en la model card se resumen a continuación. Es importante señalar que las métricas dependen del tamaño del pool de búsqueda y del checkpoint del head.

| Tarea | Pool | R@1 | R@5 | R@10 | Mediana de rango |
|---|---|---|---|---|---|
| Texto-imagen | 123.287 imágenes | 0,1108 | 0,2510 | 0,3373 | 33 |
| Imagen-texto | 5.000 imágenes (val) | 0,5348 | 0,8124 | 0,8952 | — |
| Texto-imagen | 5.000 imágenes (val) | 0,3985 | 0,6856 | 0,7887 | — |
| Control de pares barajados | — | 0,0002 | — | — | — |

Además, se midió el efecto del runtime y del anchor sobre el head y la galería que se distribuyen (5.001 captions de validación contra las 123.287 imágenes):

| Runtime | R@1 | R@5 | R@10 | Mediana de rango |
|---|---|---|---|---|
| PyTorch fp16 (referencia) | 0,1092 | 0,2442 | 0,3307 | 36 |
| candle Q4_0 sin anchor | 0,0000 | 0,0000 | 0,0002 | 44.578 |
| candle Q4_0 con anchor | 0,0350 | 0,1062 | 0,1518 | 176 |

El control de pares barajados (null arm) muestra que el rendimiento no es casual: la mediana de rango en condiciones nulas es de aproximadamente 60.994 (media de 17 mediciones), mientras que el head anclado alcanza una mediana de 176.

## Requisitos de hardware

- **VRAM estimada**: al ejecutarse en navegador, no requiere GPU dedicada. El modelo base Qwen3-0.6B cuantizado a Q4_0 ocupa aproximadamente 0,4 GB en memoria, y el head 2,1 MB. El índice de galería (130 MB) se carga en memoria RAM.
- **GPU recomendadas**: ninguna en particular; funciona en CPU con WebAssembly. Si se desea ejecutar en un entorno servidor, cualquier GPU con 1 GB de VRAM es suficiente (p. ej., NVIDIA GTX 1050 Ti o superior).
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU consumer moderna, e incluso en dispositivos sin GPU gracias a la implementación en Rust/candle.
- **Opciones de despliegue**: el modelo está pensado para ejecutarse en el navegador mediante WebAssembly. También puede usarse en entornos Python con PyTorch (para reproducción) o con candle en Rust. No se menciona soporte para vLLM, Ollama o TGI.
- **Latencia y throughput**: no se proporcionan cifras exactas, pero al ser un head lineal sobre un modelo de 0,6B cuantizado, la latencia por consulta en un navegador moderno debería ser del orden de decenas de milisegundos, más el coste de la pasada del modelo base.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables con otros modelos de retrieval cross-modal en la información proporcionada. Sin embargo, se puede establecer una comparación cualitativa:

| Modelo | Enfoque | Tamaño en inferencia | Requiere servidor | Licencia |
|---|---|---|---|---|
| **srt-browser-head-118k** | Head lineal sobre LLM congelado (0,6B) + índice offline de 27B | ~0,4 GB (Q4_0) | No (navegador) | Apache-2.0 |
| CLIP (ViT-B/32) | Encoder dual entrenado desde cero | ~150 MB | Depende del despliegue | MIT |
| SigLIP | Encoder dual con pérdida sigmoide | ~400 MB | Depende del despliegue | Apache-2.0 |

La diferencia principal es que este modelo no entrena un encoder de imágenes, sino que reutiliza las representaciones de un modelo grande generadas offline, lo que reduce drásticamente el coste de inferencia en el cliente.

## Limitaciones y advertencias

- **Dependencia del anchor**: sin el archivo de recalibración (`anchor_candle_q4_text.bin`), el head no funciona en runtime cuantizado Q4_0: el recall cae a cero. Es imprescindible incluirlo en el despliegue.
- **Sensibilidad al pool de búsqueda**: las métricas varían enormemente con el tamaño del pool. Un R@1 de 0,49 sobre 1.000 imágenes se convierte en 0,06 sobre 123.287. Cualquier comparación debe especificar el pool y el checkpoint.
- **Idioma limitado**: el modelo solo está entrenado y evaluado en inglés. No se garantiza rendimiento en otros idiomas.
- **Modelo base pequeño**: Qwen3-0.6B tiene capacidades limitadas de razonamiento y generación en comparación con modelos más grandes. El head solo añade la capacidad de retrieval, no mejora la generación.
- **Riesgo de alucinación en retrieval**: aunque el control de pares barajados muestra que el rendimiento no es casual, en pools grandes hay muchas imágenes igualmente válidas para una consulta, y el modelo puede devolver resultados plausibles pero incorrectos.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen3-0.6B también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- **Reproducibilidad**: la model card advierte que la implementación ingenua de un control (desplazar la galería una posición) es incorrecta; se debe usar un control con pares rotos para obtener el suelo empírico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/RiverRider/srt-browser-head-118k)
- [Demo interactiva "0.6B reads 27B"](https://huggingface.co/spaces/RiverRider/0.6b-reads-27b)
- [Space "One Model, Two Jobs"](https://huggingface.co/spaces/RiverRider/srt-browser-demo)
- [Dataset de estados (RiverRider/srt-qwen38-coco-states)](https://huggingface.co/datasets/RiverRider/srt-qwen38-coco-states)
- [Dataset de miniaturas COCO (RiverRider/srt-coco-thumbs)](https://huggingface.co/datasets/RiverRider/srt-coco-thumbs)
