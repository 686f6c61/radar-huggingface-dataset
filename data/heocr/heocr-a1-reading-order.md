# HeOCR/heocr-a1-reading-order

## Resumen

HeOCR A1 es un modelo de ordenación de lectura (reading order) para documentos en hebreo moderno, desarrollado por el proyecto HeOCR y publicado bajo licencia Apache-2.0. Su función es determinar el orden secuencial de las líneas de texto de una página a partir de la posición de cada línea y del tipo de región a la que pertenece (título, cuerpo, sello, firma, pie de página, margen, identificador o celda de tabla). No realiza reconocimiento de texto ni segmentación: es una pieza intermedia dentro de una cadena de tres modelos.

El modelo es deliberadamente minúsculo: implementa la red de ordenación de lectura de kraken (`ROMLP`), un perceptrón de dos capas con aproximadamente 1.900 parámetros y un fichero de pesos de solo 8.492 bytes. Esto lo sitúa en la categoría de utilidades ligeras de preprocesado para pipelines OCR/HTR, no en la de modelos generativos. Fue entrenado desde cero exclusivamente con páginas sintéticas generadas con hocrsyngen, sin datos reales ni texto de terceros.

Su relevancia actual es la de línea base de investigación: propone el uso de tipos de región (frente a los tipos de línea del segmentador) para resolver la ordenación en documentos con estructuras complejas como fichas de archivo o libros contables, donde dos líneas a la misma altura pueden tener roles distintos. No obstante, toda su evaluación es sintética y no existe todavía una validación revisada sobre escaneos reales. Requiere el motor propio `heocr-engine`, ya que kraken 7.0.2 por sí solo no puede ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de ordenación de lectura de kraken (`ROMLP`), perceptrón de dos capas que compara pares de líneas |
| Parametros totales | ~1.900 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por pares de líneas) |
| Tipos de cuantizacion | no disponible (pesos safetensors de 8.492 bytes; no se documentan cuantizaciones) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0, Copyright (c) 2026 HeOCR maintainers |
| Formato de pesos | safetensors (formato kraken; fichero `heocr-a1-reading-order.safetensors`, entrenado como `best_0.0000.safetensors`) |

## Arquitectura y entrenamiento

A1 es una red de ordenación de lectura a nivel de línea de kraken, en modo `--level baselines`. La red es un perceptrón de dos capas (`ROMLP`) de unos 1.900 parámetros que recibe, para cada línea, el punto de inicio, el punto final y el centro de su línea base, junto con una codificación one-hot de su clase. La salida es una comparación por pares de líneas que, agregada, produce el orden de lectura de la página. Las clases son los tipos de región: `default` (0), `title` (1), `body` (2), `stamp_area` (3), `signature_area` (4), `footer` (5), `margin` (6), `identifier_area` (7) y `table_cells` (8).

El entrenamiento se realizó íntegramente con datos sintéticos: 3.990 páginas de entrenamiento y 210 de validación procedentes de dos lotes de hocrsyngen, re-preparadas para que la clase de cada línea sea su tipo de región. El lote de entrenamiento de R4d (hocrsyngen `8698895`, semilla 5101) aportó 1.710/90 páginas; el lote de R3d (hocrsyngen `db3f73c`, generador `s11b-ledger-fit-v1`, semilla 7101) aportó 2.280/120 páginas. Las páginas cubren siete plantillas (565–573 páginas por plantilla en entrenamiento), lo que suma 2.181.264 pares de líneas de entrenamiento. Las fuentes empleadas son Alef (3.000 páginas) y Gvere (el resto de la información no está disponible en el material proporcionado). Se entrenó con ketos 7.0.2 mediante `rotrain`.

La innovación clave es el uso de tipos de región en lugar de los tipos de línea del segmentador: la misma red entrenada con los tipos de línea de R4d (`default`, `stamp`) no lograba ordenar fichas de archivo ni libros contables, porque nada distinguía una etiqueta de una línea de cuerpo a la misma altura. `heocr-engine` etiqueta las líneas de R4d con `--reading-order-classes region` siguiendo tres reglas: `stamp_area` si R4d tipificó la línea como `stamp`; en caso contrario, la primera región que kraken liste para la línea; y si no, `default`.

## Capacidades

- Ordenación de lectura de líneas de texto en documentos hebreos modernos, a partir de la geometría de las líneas base y de su tipo de región.
- Distinción de roles estructurales por línea: título, cuerpo, sello, firma, pie de página, margen, identificador y celda de tabla.
- Manejo de diseños con ambigüedad posicional, como fichas de archivo y libros contables, donde la altura no basta para inferir el orden.
- Integración en la cadena R4d (segmentación) + A1 (ordenación) + R3h (reconocimiento) mediante `heocr-engine`.
- Salida opcional de geometría ordenada y regiones predichas con `--geometry-output geometry.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento: es un componente geométrico especializado, no un modelo de lenguaje.

## Casos de uso

- Digitalización de documentos de archivo en hebreo: A1 ordena las líneas segmentadas por R4d en fichas y registros donde etiquetas y valores comparten altura, usando el tipo de región para desambiguar; es adecuado porque la red fue entrenada específicamente para distinguir esos roles.
- Procesamiento de libros contables y ledgers: las líneas de tabla y las anotaciones de margen se ordenan correctamente gracias a las clases `table_cells` y `margin`, evitando que el texto reconocido por R3h quede intercalado.
- Reconstrucción de la secuencia de lectura para exportación a texto plano o JSON: con `--geometry-output` se obtiene la geometría ordenada, útil para alimentar visores de documentos o motores de búsqueda.
- Investigación en ordenación de lectura aprendida para hebreo: sirve como línea base reproducible (pesos de 8.492 bytes, licencia permisiva, datos sintéticos documentados) para comparar enfoques alternativos.
- Preprocesado en pipelines OCR por lotes: al ser un modelo minúsculo que corre en CPU (una página de prueba en unos 8 s de extremo a extremo con kraken 7.0.2), puede integrarse en flujos de digitalización masiva sin GPU.
- Validación de la cadena completa de HeOCR: permite probar de extremo a extremo la segmentación, la ordenación y el reconocimiento sobre páginas sintéticas antes de abordar escaneos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una prueba de extremo a extremo con kraken 7.0.2 en CPU sobre una página sintética de la semilla 101: el proceso completo tardó unos 8 s, el texto coincidió exactamente con la predicción puntuada y 8 de las 10 líneas de la página fueron reordenadas por el orden aprendido. También se indica que, en las líneas emparejadas, el tipo predicho coincidió con la región de referencia en todas las líneas de los cuatro lotes comprobados.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; los pesos ocupan 8.492 bytes y la red tiene ~1.900 parámetros, por lo que la inferencia cabe en CPU.
- GPU recomendadas: no se requieren; el autor documenta pruebas en CPU con kraken 7.0.2.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: `heocr-engine` (con `pip install '.[kraken]'`) como etapa kraken en proceso; kraken 7.0.2 por sí solo no puede ejecutar A1.
- Latencia y throughput: ~8 s para una página completa de extremo a extremo (segmentación + ordenación + reconocimiento) en CPU según la prueba del autor; no se documentan cifras aisladas de A1 ni throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeOCR A1 | ~1.900 | no aplica | Ordenación de lectura de líneas (hebreo) | Apache-2.0 | Hugging Face + Zenodo |
| kraken `ROMLP` estándar | no disponible | no aplica | Ordenación de lectura genérica de kraken | no disponible en la información | Integrado en kraken |
| R4d (HeOCR) | no disponible | no aplica | Segmentación: líneas base, polígonos y regiones tipadas | no disponible en la información | Hugging Face + Zenodo |
| R3h (HeOCR) | no disponible | no aplica | Reconocimiento de texto hebreo | no disponible en la información | Hugging Face + Zenodo |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es una línea base de investigación: toda la evaluación es sobre páginas sintéticas y no existe evaluación revisada sobre escaneos reales.
- Depende de los tipos de región de R4d y del tipo de línea `stamp`; no funciona con otros segmentadores.
- No es compatible con el pipeline propio de kraken 7.0.2: el mapeo de clases de A1 (tipos de región) no coincide con el de los tipos de línea del segmentador, y la salida de texto de kraken ignora el orden aprendido (mittagessen/kraken#820).
- Fuera de alcance: escaneos reales y diseños distintos de las plantillas de hocrsyngen.
- Solo cubre hebreo; no hay soporte multilingüe documentado.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de ordenación incorrecta en diseños no vistos durante el entrenamiento sintético.
- Restricciones de licencia: Apache-2.0 permite uso comercial; deben conservarse los avisos de LICENSE y NOTICE.
- Para producción, conviene validar con documentos reales del dominio objetivo antes de confiar en el orden generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-a1-reading-order
- Organización HeOCR en GitHub: https://github.com/HeOCR
- Código de heocr-engine: https://github.com/HeOCR/heocr-engine
- Registro del pipeline (A1) en Zenodo: https://doi.org/10.5281/zenodo.24023072
- Registro de R4d (segmentación) en Zenodo: https://doi.org/10.5281/zenodo.24023070
- Registro de R3h (reconocimiento) en Zenodo: https://doi.org/10.5281/zenodo.24023074
- kraken: https://kraken.re
- Issue de kraken sobre el orden de lectura en la salida de texto: https://github.com/mittagessen/kraken/issues/820
