# davidlnk3/geotrace-photo-year

## Resumen

GeoTrace photographic-style year classifier es un modelo de clasificación de imágenes que estima el año en que se tomó una fotografía a partir de su estilo fotográfico (grano, respuesta de color, proceso y convenciones de encuadre). Lo desarrolla davidlnk3 como componente del proyecto GeoTrace, una herramienta de OSINT orientada a la verificación de fotografías públicas, y se usa dentro del tool `time_from_objects` junto con los intervalos de datación por objetos de EVA02-CLIP.

No es un transformer entrenado de extremo a extremo: es una regresión logística multinomial sobre embeddings congelados de OpenCLIP (ViT-B-32-quickgelu, laion400m_e32), con 50 clases, una por año entre 1950 y 1999. El repositorio publica únicamente la cabeza de clasificación (50x512 pesos más sesgo), no el backbone, y reproduce el método del paper "Blind Dates: Examining the Expression of Temporality in Historical Photographs" (Barancová, Wevers y van Noord, CHR 2023).

Su relevancia es acotada pero concreta: ofrece una señal de datación por estilo reproducible, con licencia MIT, sin código ejecutable en los pesos y con métricas publicadas sobre el split de test de los autores, lo que permite comparar directamente con el clasificador fine-tuned del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica multinomial sobre embeddings congelados de OpenCLIP ViT-B-32-quickgelu (laion400m_e32) |
| Parametros totales | 25.700 (cabeza: 50x512 pesos + 50 sesgos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors de precision estandar) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (arrays `weight`, `bias`, `classes`); backbone no incluido |

## Arquitectura y entrenamiento

La arquitectura es una regresion logistica multinomial de scikit-learn (`random_state=0`, `max_iter=5000`) con 50 clases, una por año de 1950 a 1999, aplicada sobre la salida cruda de `encode_image` del backbone OpenCLIP ViT-B-32-quickgelu (laion400m_e32), de 512 dimensiones y sin normalizacion L2. El backbone permanece congelado: no hay fine-tuning. Los pesos se publican como arrays planos (no como estimador serializado), de modo que la inferencia solo requiere multiplicar el embedding por la matriz de pesos y sumar el sesgo, sin cargar scikit-learn ni codigo ejecutable.

El entrenamiento usa De Boer Scene Detection (31.892 imagenes de entrenamiento y 7.974 de test, fotografias de prensa neerlandesas digitalizadas) con el split estratificado 80/20 de los autores del paper, mas 500 fotografias de Flickr del dataset DEW (Date Estimation in the Wild) muestreadas de forma uniforme entre 1950 y 1999 y añadidas solo al conjunto de entrenamiento. No se redistribuye ninguna imagen de entrenamiento, solo los coeficientes ajustados. No se reporta uso de RLHF, DPO ni tecnicas de alineacion, al no ser un modelo generativo.

## Capacidades

- Clasificacion de imagenes en 50 clases de año (1950-1999) a partir del estilo fotografico.
- Devuelve logits por año; permite derivar tanto el argmax como el año esperado ponderado por probabilidad.
- Integracion con el tool `time_from_objects` de GeoTrace, que marca la estimacion cuando un objeto datado en la misma foto es posterior a 1999.
- Inferencia sin dependencias de scikit-learn: solo numpy y safetensors.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni procesamiento de lenguaje.
- No realiza reconocimiento ni identificacion de personas (explicitamente excluido por el autor).

## Casos de uso

- Verificacion OSINT de fotografias de prensa: el modelo aporta una señal de "que antigua parece" la imagen, que se combina con otras evidencias para acotar la fecha de una fotografia publica.
- Catalogacion de archivos fotograficos historicos: para fondos digitalizados de prensa de mediados del siglo XX, permite preasignar un intervalo de años y priorizar la revision manual.
- Triaje en flujos de fact-checking: descartar rapidamente imagenes cuyo estilo no encaja con la fecha declarada por una fuente, antes de un analisis forense mas costoso.
- Deteccion de fotos retro o con emulacion de pelicula: el modelo tiende a datar como mas antiguas las imagenes con grano o respuesta de color simulada, lo que sirve para marcar casos sospechosos de manipulacion estilistica.
- Enriquecimiento de metadatos en pipelines de archivo: ejecutar la cabeza sobre embeddings ya calculados con OpenCLIP para añadir un año estimado sin coste adicional de backbone.
- Investigacion en humanidades digitales: reproduccion reproducible del experimento de "Blind Dates" para comparar estrategias de datacion por estilo con el clasificador fine-tuned del paper.
- Prototipado de herramientas de datacion fotografica: al ser una cabeza ligera con licencia MIT y sin codigo ejecutable, es facil de incrustar en servicios propios.

## Benchmarks y rendimiento

Resultados medidos sobre el split de test de De Boer (7.974 imagenes), comparables con el MAE de 6,65 años del clasificador fine-tuned del paper y el 15,8 de zero-shot prompting.

| Modelo | Imagenes de entrenamiento | Accuracy | MAE (años) | MAE, valor esperado |
|---|---|---|---|---|
| Solo De Boer | 31.892 | 0,1369 | 6,65 | 5,95 |
| + 500 fotos DEW (publicado) | 32.392 | 0,1366 | 6,71 | 5,99 |

Evaluacion fuera de dominio sobre 400 fotografias reservadas de DEW (ids de validacion, disjuntos de las 500 usadas en entrenamiento):

| Entrenado con | MAE test De Boer | MAE DEW reservado |
|---|---|---|
| Solo De Boer | 6,65 | 13,55 |
| + 500 fotos DEW | 6,71 | 13,29 |

Añadir 500 fotos DEW (1,5% del conjunto) cuesta +0,05 años en dominio y gana -0,26 años fuera de dominio. La accuracy es exacta por año sobre 50 clases, de ahi su valor bajo pese a un MAE de pocos años.

## Requisitos de hardware

- VRAM para la cabeza: practicamente despreciable (25.700 parametros, menos de 1 MB en safetensors).
- El coste real esta en el backbone OpenCLIP ViT-B-32-quickgelu, que debe ejecutarse para obtener el embedding de 512 dimensiones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) basta para el backbone ViT-B-32; en CPU la inferencia es viable para lotes pequeños.
- Cabe en GPU consumer sin problema; el cuello de botella es el encoder visual, no la cabeza.
- Despliegue: al publicarse como arrays, se sirve con numpy y safetensors; el backbone se carga con `open_clip`. No requiere vLLM, llama.cpp ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Clases | MAE (De Boer) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GeoTrace photo-year | Regresion logistica sobre OpenCLIP congelado | 25.700 (cabeza) | 50 (1950-1999) | 6,65 | MIT | Hugging Face |
| Clasificador fine-tuned de "Blind Dates" | Fine-tuning del backbone | No disponible | 50 (1950-1999) | 6,65 (reportado) | No disponible | Codigo en CANAL-amsterdam/dating-images |
| Zero-shot prompting del paper | Prompting sobre modelo vision-lenguaje | No disponible | 50 (1950-1999) | 15,8 (reportado) | No disponible | No disponible |

## Limitaciones y advertencias

- El espacio de etiquetas es la limitacion principal: solo cubre 1950-1999 y siempre responde dentro de ese rango, incluso ante una foto digital moderna.
- La salida debe interpretarse como "que antigua parece" la fotografia, no como evidencia de cuando se tomo.
- Lee estilo fotografico (grano, color, proceso, encuadre), no el contenido de la escena; una foto retro deliberada o con emulacion de pelicula se datara como mas antigua.
- El entrenamiento es mayoritariamente prensa neerlandesa, por lo que rinde peor en otras regiones, en instantaneas amateur y en tematicas no cubiertas por el archivo De Boer.
- La accuracy exacta por año es baja por diseño; conviene usar el intervalo o el año esperado, no el año unico.
- Riesgo de alucinacion en el sentido de asignar un año plausible a imagenes fuera de distribucion; el autor recomienda descartar la estimacion si otras evidencias sitúan la foto despues de 1999.
- No identifica personas y no debe usarse para ello.
- Licencia MIT para el modelo; las imagenes de entrenamiento no se redistribuyen y las de DEW mantienen sus licencias individuales de Flickr, a menudo no abiertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidlnk3/geotrace-photo-year
- Proyecto GeoTrace: https://github.com/davidlnk3/GeoTrace
- Paper "Blind Dates: Examining the Expression of Temporality in Historical Photographs": https://arxiv.org/abs/2310.06633
- Codigo de los autores (CANAL-amsterdam/dating-images): https://github.com/CANAL-amsterdam/dating-images
- Dataset De Boer Scene Detection: https://zenodo.org/record/7137452
- Dataset DEW (Date Estimation in the Wild): https://doi.org/10.22000/43
