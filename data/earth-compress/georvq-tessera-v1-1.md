# earth-compress/georvq-tessera-v1.1

## Resumen

georvq-tessera-v1.1 es un códec de compresión aprendido para los embeddings anuales TESSERA v1.1 (128 bandas, 10 m de resolución), el producto global producido y alojado por dClimate. Cada tesela de 0,1 grados de un año, de aproximadamente 1100 x 800 píxeles y unos 120 MB en códigos int8 y escalas float32, se codifica como un almacén Zarr de 0,5 a 1,6 MB que puede leerse por ventana vía HTTP en cualquiera de 42 tasas, desde 0,32 hasta 9,9 bits por píxel. La lectura devuelve embeddings float32 en las unidades dequantizadas del origen (`q * scale`) sobre la rejilla de 10 m de la zona UTM de la tesela, con vectores cero en nodata.

El modelo lo desarrolla earth-compress y se distribuye como un bundle de pesos que la librería `georvq` descarga y verifica por hash. El repositorio contiene el bundle completo (encoder y decoder, float32, con exportación ONNX) y un bundle solo-decoder de 270,1 MB para lectores que no codifican. La compresión es específica de los embeddings v1.1: los TESSERA v1 anteriores pertenecen a un espacio de embeddings distinto y los almacenes y bundles de esta release nombran la versión que codifican, de modo que un almacén nunca se decodifica con un códec de la otra versión.

El interés del modelo es práctico: reduce el coste de almacenamiento y transferencia de embeddings geoespaciales de alta resolución en más de dos órdenes de magnitud, mantiene una estadística de calidad por ventana que permite consultas con cota de error (`quality="p99<=0.3"`) y expone la decodificación sin torch mediante ONNX. La licencia Apache 2.0 y la ausencia de código pickled en la carga facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | códec de compresión aprendido con cuantización vectorial por niveles y canal de medias rotado (no disponible el detalle de la red) |
| Parametros totales | no disponible (el bundle completo ocupa 904,8 MB en float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | 42 tasas de lectura de 0,32 a 9,9 bits por píxel; códigos int8 con escala float32 por codeword; canal de medias de 7 a 13 bits por componente con companding asinh |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.npz` (float32) y exportación ONNX; almacenes en Zarr |
| Embeddings objetivo | TESSERA v1.1, 128 bandas, 10 m |
| Tamano de tesela | ~1100 x 800 píxeles, ~120 MB de origen |
| Tamano de almacen comprimido | 0,5 a 1,6 MB por tesela y año |
| Bundle completo | 904,8 MB, `decoder_id` `09bba7c1316e71ea` |
| Bundle solo-decoder | 270,1 MB, mismo `bitstream_id` `74feb29cecbc2ba7` |
| Estadistica de calidad | `rel_l2` por píxel, media y percentil 99 por ventana de 64 px, almacenada con 32 códigos por década redondeados hacia arriba |

## Arquitectura y entrenamiento

El códec opera en tres niveles (coarse, mid, fine): cada rung de lectura es una profundidad por nivel y una lectura descarga solo los bytes que su rung necesita. Todos los rungs incluyen la media de la ventana, codificada en 1280 bits por ventana de 64 px (0,31 bits por píxel), que constituye la mayor parte del bitstream en los rungs gruesos. El canal de medias rota la media de cada ventana sobre los ejes principales de las medias de ventana de entrenamiento y codifica cada componente en 7 a 13 bits sobre un rango fijo, compandido con asinh; el rango es la cota dura que todo píxel válido obedece (cada valor es como máximo 127 veces la escala del píxel, y una escala de 1 o más marca el píxel como inválido), más de seis veces el mayor valor de los datos de entrenamiento, de modo que ninguna media de ventana se recorta.

Los detalles de la red (número de capas, dimensión latente, número de tokens de entrenamiento, composición del dataset y si hubo ajuste fino con RLHF/DPO) no están disponibles en la información proporcionada. Sí se documenta que la estadística de calidad se mide en tiempo de codificación con el decoder de este repositorio y se almacena cuantizada en log con 32 códigos por década y redondeo hacia arriba, de forma que una ventana leída con una cota que alguno de sus rungs cumple no excede la cota en la decodificación con la que se midieron los valores. El bundle incluye `weights.npz`, `codebooks.npz`, `mean_channel.npz`, `config.json`, `bundle.json` y una exportación ONNX para decodificar sin torch; todas las matrices se cargan con `allow_pickle=False`.

## Capacidades

- Compresión con pérdida controlada de embeddings TESSERA v1.1: codifica teselas anuales de 128 bandas y 10 m en almacenes Zarr de 0,5 a 1,6 MB.
- Lectura por ventana vía HTTP: `ds.read(window=..., quality=...)` devuelve un array float32 de forma (128, alto, ancho).
- Selección de tasa en 42 rungs, de 0,32 a 9,9 bits por píxel, con solo los bytes necesarios por lectura.
- Consulta con cota de error por ventana: `quality="p99<=0.3"` devuelve, por ventana, el rung más barato que cumple la cota.
- Decodificación sin torch mediante exportación ONNX.
- Verificación de integridad por hash del bundle descargado y de los almacenes.
- Carga segura de pesos sin ejecución de código pickled (`allow_pickle=False`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión genérica, tool calling ni agentes: es un códec de compresión, no un modelo generativo.

## Casos de uso

- Distribución de embeddings globales a escala de país: servir teselas TESSERA v1.1 comprimidas a 0,5-1,6 MB por tesela y año reduce el ancho de banda frente a los ~120 MB de origen, y la lectura por ventana permite a un cliente descargar solo el área de interés.
- Análisis geoespacial en cuadernos y pipelines de investigación: `georvq.open` sobre una URL y `ds.read(window=...)` devuelve directamente un array float32 en la rejilla de 10 m de la zona UTM, sin pasos intermedios de descompresión manual.
- Archivado a largo plazo de series anuales: los almacenes de 2017 a 2025 de las once teselas de muestra caben en una fracción mínima del espacio del origen, lo que abarata el almacenamiento de series temporales por región.
- Servicio de consulta con garantía de error: aplicaciones que exigen una precisión mínima por píxel pueden pedir `quality="p99<=0.3"` y recibir automáticamente el rung más barato que la satisface, sin elegir tasas a mano.
- Inferencia en entornos sin GPU y sin torch: la exportación ONNX del bundle permite decodificar en servidores con solo ONNX Runtime, útil en infraestructura de solo CPU.
- Integración con visores y mosaicos web: la lectura por ventana sobre HTTP encaja con servidores de teselas que piden porciones de 64 px y solo transfieren los bytes del rung solicitado.
- Control de calidad en cadenas de producción: la estadística `rel_l2` por ventana almacenada en cada almacén permite auditar la fidelidad de la compresión por región y por año antes de publicar un producto derivado.

## Benchmarks y rendimiento

La model card publica la tabla de calidad del códec sobre las once teselas de muestra (2017 a 2025, latitudes 45 S a 72 N), medida como error L2 relativo por píxel del vector de 128 bandas, promediado sobre los píxeles válidos, decodificando en bf16 sobre GPU:

| rung | bits/px | L2 relativo medio |
|---|---|---|
| 4-0-0 | 0,320 | 0,318 |
| 20-0-0 | 0,352 | 0,296 |
| 20-2-0 | 0,438 | 0,264 |
| 20-6-0 | 0,609 | 0,241 |
| 20-13-0 | 0,910 | 0,225 |
| 20-13-1 | 1,660 | 0,202 |
| 20-13-3 | 3,160 | 0,175 |
| 20-13-6 | 5,410 | 0,154 |
| 20-13-12 | 9,910 | 0,133 |

El error varía ampliamente entre teselas: en el rung 20-13-12 es 0,026 en el casquete glaciar de Groenlandia y 0,232 en Bucarest. La tabla completa de 42 rungs, con los bits por ventana de cada uno, está en `bundle.json` y en la cabecera de cada almacén. No se han publicado resultados de benchmarks frente a otros códecs en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el bundle solo-decoder ocupa 270,1 MB en float32 y el completo 904,8 MB, por lo que la decodificación cabe con holgura en cualquier GPU consumer actual.
- GPU recomendadas: no disponible; la model card menciona decodificación en bf16 sobre GPU sin especificar modelo.
- GPU consumer: sí, cualquier GPU con al menos ~1 GB de memoria libre puede cargar el bundle completo; la decodificación de una ventana de 512 x 512 requiere memoria adicional proporcional al array de salida (128 x 512 x 512 float32, ~128 MB).
- Despliegue: librería `georvq` (instalable desde el repositorio de GitHub) y ONNX Runtime para decodificación sin torch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la lectura descarga solo los bytes del rung solicitado, por lo que el coste dominante es la transferencia HTTP del almacén y no el cómputo.

## Comparativa con modelos similares

No se dispone de información sobre códecs comparables (por ejemplo, compresores Zarr genéricos como Blosc/Zstd o códecs neuronales de imágenes satelitales) en la documentación proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, el códec se distingue por operar sobre un espacio de embeddings concreto (TESSERA v1.1), por ofrecer tasas seleccionables por ventana y por almacenar la estadística de error medida en tiempo de codificación, prestaciones que los compresores de propósito general no incluyen.

## Limitaciones y advertencias

- El códec es específico de los embeddings TESSERA v1.1; no sirve para los TESSERA v1 anteriores ni para otros espacios de embeddings.
- La compresión es con pérdida: incluso en el rung más fino (20-13-12, 9,91 bits por píxel) el error L2 relativo medio es 0,133, y en teselas urbanas como Bucarest llega a 0,232.
- El error varía mucho por región y año; no debe asumirse una precisión uniforme entre teselas.
- Los vectores llevan magnitud, por lo que no se conserva ninguna estadística de coseno; métricas basadas en similitud coseno deben recalcularse sobre los datos decodificados.
- Los píxeles con escala de 1 o más se marcan como inválidos y se devuelven como vectores cero; los flujos posteriores deben tratar el nodata explícitamente.
- La primera lectura de píxel descarga el bundle solo-decoder (270,1 MB) en `~/.cache/georvq/bundles/<bitstream_id>/`; en entornos sin red o con caché efímera esto añade coste y requiere planificación.
- La codificación requiere el bundle completo (904,8 MB); el bundle solo-decoder no permite codificar.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar los avisos de licencia y atribución del proyecto.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas por no tratarse de un modelo de lenguaje; cualquier riesgo de ese tipo recae en los datos TESSERA de origen, no en el códec.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/earth-compress/georvq-tessera-v1.1
- Dataset de muestra (once teselas codificadas): https://huggingface.co/datasets/earth-compress/georvq-tessera-v1.1-sample
- Repositorio del código `georvq`: https://github.com/earth-compress/georvq
- Embeddings TESSERA v1.1 en Source Cooperative: https://source.coop/tessera/tessera
- Paper de referencia: arXiv:2506.20380
