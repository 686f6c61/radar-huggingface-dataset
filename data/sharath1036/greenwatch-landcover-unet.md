# Sharath1036/greenwatch-landcover-unet

## Resumen

GreenWatch land-cover U-Net es un modelo de segmentación semántica de imágenes satelitales Sentinel-2 L2A a 10 metros de resolución, diseñado para clasificar cada píxel en cinco clases de cobertura del suelo: agua, superficie construida, vegetación, cultivos y suelo desnudo. Lo desarrolla Sharath1036 como componente del proyecto GreenWatch, una API FastAPI con ONNX Runtime que sirve inferencia en CPU para medir cambios de cobertura del suelo en la región india de Pune entre distintos años. El modelo emplea una arquitectura U-Net con encoder ResNet-18 preentrenado en ImageNet, suma 14.357.013 parámetros y opera sobre teselas de 256 x 256 píxeles con 12 canales de entrada.

La entrada combina seis bandas espectrales (B02, B03, B04, B8A, B11, B12) de un compuesto mediano de enero a marzo y las mismas seis bandas de un compuesto de octubre a diciembre del mismo año, con reflectancia multiplicada por 10.000. La salida son logits de forma `(N, 5, H, W)` sobre los que se aplica argmax para obtener la clase. El modelo se distribuye exclusivamente en formato ONNX (57,6 MB, opset 18) y está pensado para despliegue en CPU, lo que lo hace accesible sin GPU.

Su relevancia es acotada y debe entenderse en clave de demostración técnica: el entrenamiento fue muy ligero (1.500 pasos, batch 8, en CPU de portátil) y las etiquetas provienen de un único producto (ESA WorldCover 2021) remapeado a cinco clases. El autor lo declara explícitamente como demo de investigación no apta para decisiones sobre territorio o personas. Aun así, resulta útil como referencia de pipeline completo de segmentación multiespectral con validación por separación de regiones (entrenamiento en 18 regiones, validación en Indore, test en Pune y Nashik nunca vistos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-18 (pesos ImageNet) |
| Parametros totales | 14.357.013 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 256 x 256 x 12 canales) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX float; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (opset 18), fichero `landcover_unet_resnet18.onnx`, 57,6 MB |
| Canales de entrada | 12 (B02, B03, B04, B8A, B11, B12 de compuesto Ene-Mar + mismas 6 de Oct-Dic) |
| Clases de salida | 5 (water, built_up, vegetation, cropland, bare) |
| Resolución espacial | 10 m (Sentinel-2 L2A) |
| Tamano de tesela | 256 x 256 |
| Checksum | sha256 `db65aed8ff097a3bacdeff1b0cf52330f39d671d7a55e7cbab1b8245656800c2` |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clásica con encoder ResNet-18 inicializado con pesos de ImageNet. El cuello de botella y el decodificador reconstruyen la resolución espacial mediante conexiones de salto, produciendo un mapa denso de cinco clases. La entrada tiene 12 canales en lugar de los 3 habituales de RGB, lo que obliga a adaptar la primera convolución del encoder para aceptar las seis bandas de dos compuestos estacionales. La normalización se realiza con los valores `mean`/`std` documentados en el fichero `landcover_unet_resnet18.json`, y las reflectancias deben venir multiplicadas por 10.000, restando 1.000 en escenas con baseline de procesamiento 04.00 o superior.

El entrenamiento fue deliberadamente modesto: 1.500 pasos con batch de 8 sobre CPU de portátil. Las etiquetas se obtuvieron remapeando ESA WorldCover 2021 a las cinco clases objetivo. La partición de datos es por región, no aleatoria: 18 regiones para entrenamiento, Indore como validación y Pune más Nashik como test, sin que estas últimas aparezcan en entrenamiento. Esta separación geográfica es metodológicamente más exigente que un split aleatorio y explica en parte la caída de rendimiento entre validación (mIoU 0,586) y test (mIoU 0,537). No se documenta uso de RLHF, DPO ni técnicas de aumento de datos más allá de lo implícito en el pipeline. La equivalencia entre la exportación ONNX y el modelo PyTorch original está verificada: diferencia máxima absoluta de logits de 1,7e-05 y coincidencia de argmax del 100 %.

## Capacidades

- Segmentación semántica densa de imágenes Sentinel-2 L2A a 10 m de resolución, con cinco clases de cobertura del suelo.
- Procesamiento de entrada multiespectral de 12 canales combinando dos compuestos estacionales (enero-marzo y octubre-diciembre) del mismo año.
- Inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Generación de mapas de cobertura del suelo comparables entre años para análisis de cambio (la API GreenWatch Pune compara dos años).
- Integración en pipelines geoespaciales vía teselado 256 x 256 y reconstrucción posterior del mosaico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Monitorización de expansión urbana: comparando mapas de la clase `built_up` entre dos años sobre la misma tesela, se puede cuantificar el crecimiento de superficie construida en un municipio. El modelo es adecuado por su resolución de 10 m, aunque el autor advierte que las cifras de cambio de un solo modelo no son fiables por sí solas.
- Seguimiento de masas de agua y embalses: la clase `water` es la de mejor IoU en validación (0,816), lo que la hace útil para detectar variaciones estacionales o interanuales de lámina de agua en cuencas concretas.
- Cartografía de cultivos a escala regional: la clase `cropland` alcanza IoU de test de 0,625, suficiente para inventarios preliminares de superficie agrícola en zonas con patrones similares a los del entrenamiento.
- Prototipado rápido de pipelines de teledetección: al ser un ONNX de 57,6 MB que corre en CPU, sirve para validar arquitecturas y flujos de preprocesado (compuestos medianos, normalización, teselado) antes de invertir en modelos mayores.
- Docencia y reproducción de experimentos: el modelo documenta checksum, fichero de normalización y métricas por clase, lo que facilita reproducir la evaluación y entender el impacto de un split por región frente a uno aleatorio.
- Análisis de vegetación en entornos urbanos: la clase `vegetation` obtiene IoU de test de 0,624, útil para estimar cobertura verde en áreas metropolitanas, con la cautela de que los límites con `cropland` y `bare` son imprecisos.
- Detección preliminar de suelo desnudo en obras o minería: la clase `bare` existe pero su IoU es muy baja (0,189 en test), por lo que solo sirve como señal de alerta para revisión manual, nunca como resultado final.

## Benchmarks y rendimiento

Los datos publicados son de concordancia con las etiquetas WorldCover 2021, no con verdad de campo. Fuente: `results/m4_landcover_unet_cpu.json` y `results/m4_pune_change.json`.

| Clase | IoU validación (Indore) | IoU test (Pune + Nashik) | Caja Pune vs WorldCover 2021 |
|---|---|---|---|
| water | 0,816 | 0,486 | 0,749 |
| built_up | 0,784 | 0,761 | 0,695 |
| vegetation | 0,392 | 0,624 | 0,645 |
| cropland | 0,756 | 0,625 | 0,584 |
| bare | 0,184 | 0,189 | 0,293 |
| **mIoU** | **0,586** | **0,537** | **0,593** |

Precisión de píxel en test: 0,799. Solo Pune: 0,488 mIoU. Solo Nashik: 0,517 mIoU. La columna de caja Pune corresponde al mapa de 2021 del modelo frente a WorldCover 2021 sobre 1.449 km² de Pune y Pimpri-Chinchwad, con una concordancia de píxel del 77,3 %. No se han publicado comparaciones con otros modelos de segmentación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica estrictamente; el modelo está pensado para CPU. En GPU, con pesos float32, el modelo ocupa aproximadamente 57,6 MB, por lo que cabría en cualquier GPU con más de 1 GB de memoria libre, incluidas integradas.
- GPU recomendadas: no se documentan; cualquier GPU moderna sirve, pero el diseño apunta a CPU. Una RTX 4090 o A100 no aportarían ventaja significativa dado el tamaño y el hecho de que el despliegue de referencia es ONNX Runtime en CPU.
- Cabe en cualquier GPU de consumo, e incluso en CPU de portátil, que es el entorno donde se entrenó y se sirve la API GreenWatch.
- Opciones de despliegue: ONNX Runtime (opción documentada), FastAPI como capa de servicio (la API GreenWatch Pune). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se hizo en CPU de portátil en 1.500 pasos, lo que sugiere que la inferencia por tesela es viable en CPU, pero no se aportan cifras de latencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación numérica no es posible. A continuación se comparan características estructurales con alternativas de la misma categoría (segmentación de cobertura del suelo con Sentinel-2), indicando solo lo que es verificable o de conocimiento general.

| Modelo | Parametros | Entrada | Clases | Contexto/tesela | Licencia | Formato |
|---|---|---|---|---|---|---|
| GreenWatch land-cover U-Net | 14.357.013 | 12 canales, 256 x 256 | 5 | 256 x 256 | CC BY 4.0 | ONNX |
| Alternativas tipo U-Net multiespectral (genéricas) | variable (10-30 M típico) | 10-13 canales, 128-512 px | 5-10 | variable | variable | PyTorch/ONNX |
| Modelos de fundación geoespaciales (p. ej. Prithvi, SatMAE) | 100 M - 600 M | multiespectral, parches | dependiente del fine-tuning | variable | variable | PyTorch |

La comparación cuantitativa de rendimiento con esos modelos no está disponible en la información proporcionada. La principal diferencia práctica del modelo GreenWatch es su tamaño reducido, su licencia permisiva CC BY 4.0 y su distribución lista para CPU en ONNX, frente a alternativas de mayor tamaño que requieren GPU y fine-tuning.

## Limitaciones y advertencias

- La clase `bare` es prácticamente inútil: IoU por debajo de 0,3 en todas las particiones (0,184 en validación, 0,189 en test, 0,293 en la caja de Pune).
- Los límites entre `vegetation`, `cropland` y `bare` son imprecisos y deben tratarse con cautela en cualquier análisis de área.
- Un modelo de gradient boosting con la misma puntuación de test discrepa de esta U-Net en el signo del cambio de superficie construida en Pune entre 2018 y 2025, según el propio autor. Por tanto, las cifras de cambio basadas en un solo modelo no son fiables.
- Las etiquetas provienen de un único producto (ESA WorldCover 2021); otros productos de cobertura del suelo difieren entre sí más que el cambio que se pretende medir.
- El modelo es una demo de investigación, no apto para decisiones sobre territorio o personas.
- El entrenamiento fue muy corto (1.500 pasos, batch 8) y en CPU de portátil, lo que limita la calidad del ajuste.
- La generalización fuera de las regiones de entrenamiento (India central) no está garantizada; la caída de mIoU de 0,586 a 0,537 entre validación y test ya sugiere sensibilidad al dominio geográfico.
- Requiere preprocesado estricto: reflectancia x 10.000, resta de 1.000 en escenas con baseline 04.00 o superior, y normalización con los valores del JSON adjunto. Un preprocesado incorrecto degrada la salida sin aviso.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero la atribución debe incluir ESA WorldCover 2021 y datos Copernicus Sentinel modificados, además del autor del modelo.
- No se documentan sesgos demográficos ni lingüísticos por no ser un modelo de lenguaje, pero sí existe un sesgo geográfico derivado de las regiones de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sharath1036/greenwatch-landcover-unet
- Repositorio GreenWatch (referenciado en la model card, ficheros `results/m4_landcover_unet_cpu.json` y `results/m4_pune_change.json`): no se proporciona URL directa en la información disponible
- ESA WorldCover 2021 (fuente de etiquetas): https://esa-worldcover.org
- Microsoft Planetary Computer (fuente de imágenes Sentinel-2 L2A): https://planetarycomputer.microsoft.com
- Copernicus Sentinel-2: https://sentinel.esa.int/web/sentinel/missions/sentinel-2
