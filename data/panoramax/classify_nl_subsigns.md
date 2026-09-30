# Panoramax/classify_nl_subsigns

## Resumen

Panoramax/classify_nl_subsigns es un modelo de clasificacion de imagenes publicado por el proyecto Panoramax, una infraestructura libre y colaborativa de foto-cartografia de territorios impulsada por una comunidad que incluye a OpenStreetMap Francia, el IGN frances y diversas administraciones publicas. El modelo esta etiquetado con la libreria Ultralytics y el tag yolov8, por lo que se trata de un clasificador derivado de la familia YOLOv8 (variante de clasificacion, no de deteccion), afinado especificamente para reconocer subsenales de trafico neerlandesas a partir de fotografias de campo.

El modelo parte del checkpoint base ultralytics/assets y esta declarado como image-classification, con idioma asociado nl (neerlandes). Su proposito practico es enriquecer el catalogo de Panoramax: dado que las imagenes de la plataforma estan georreferenciadas y provienen de vehiculos o peatones que recorren la via publica, un clasificador de subsenales permite etiquetar automaticamente el mobiliario viario detectado y alimentar capas tematicas reutilizables por terceros.

Es relevante ahora porque Panoramax se posiciona como alternativa libre a servicios propietarios de foto-mapping, y la clasificacion automatica de elementos viarios es una de las tareas que mas valor anaden a ese tipo de repositorios. Conviene senalar que la ficha de HuggingFace presenta un acceso restringido (gated) y un tamano de repositorio de 0.0 GB, por lo que no se confirma la disponibilidad efectiva de los pesos ni sus especificaciones completas. La mayoria de los datos tecnicos de detalle no estan publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 en tarea de clasificacion de imagenes (familia Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nl (neerlandes, segun el campo de idioma de la ficha) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | no disponible (la libreria declarada es ultralytics, que habitualmente usa pesos .pt, pero no se confirma en la informacion) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo pertenece a la familia YOLOv8 de Ultralytics y esta configurado para la tarea de clasificacion de imagenes (image-classification), no para deteccion de objetos. YOLOv8 en su variante de clasificacion es una red convolucional con backbone tipo CSP y un cabezal de clasificacion con pooling, tipicamente entrenada con aumentos de datos agresivos y optimizador SGD o AdamW segun la receta estandar de Ultralytics. El modelo base declarado es ultralytics/assets, es decir, un checkpoint preentrenado de la propia libreria sobre el que se habria realizado un ajuste fino.

No se dispone de informacion sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset de subsenales neerlandesas, ni sobre si se aplicaron tecnicas de regularizacion especificas, destilacion o ajuste por refuerzo (procedimientos que, por otra parte, no son habituales en clasificacion de imagenes). Tampoco se documenta el preprocesado de las fotografias de campo, el rango de resolucion de entrada ni el esquema de particion train/validation/test. Todo ello queda marcado como no disponible.

## Capacidades

- Clasificacion de imagenes: asigna una o varias categorias a una fotografia de via publica, en principio orientadas a subsenales de trafico neerlandesas.
- Reconocimiento de senalizacion vertical secundaria: el nombre del modelo (classify_nl_subsigns) apunta a subcategorias dentro de la senaletica neerlandesa, no a la clasificacion generica de imagenes.
- Integracion con el ecosistema Ultralytics: al declarar esa libreria, se espera compatibilidad con las utilidades de carga, prediccion y exportacion de Ultralytics, aunque no se detalla en la informacion.
- Multilingue: no disponible; el unico idioma declarado es el neerlandes, en el sentido del dominio de las senales, no de la interfaz del modelo.
- Tool calling, function calling, agentes, razonamiento multi-paso: no aplica (modelo de vision).
- Modo thinking, vision adicional, audio, generacion de texto: no aplica.

## Casos de uso

- Enriquecimiento de fotografia de campo en Panoramax: clasificar automaticamente las subsenales visibles en las imagenes subidas a las instancias de Panoramax (panoramax.fr, panoramax.ign.fr, panoramax.openstreetmap.fr) para generar etiquetas tematicas sobre el territorio.
- Mantenimiento de inventarios de senaletica viaria: procesar lotes de fotografias georreferenciadas y derivar un censo de subsenales por tramo de carretera o calle, util para auditorias de accesibilidad y seguridad vial.
- Corroboracion de datos de OpenStreetMap: contrastar las etiquetas de senalizacion declaradas en OSM con lo observado en las imagenes, generando avisos de discrepancia para la comunidad de mapeadores.
- Analisis de accesibilidad y normativa neerlandesa: detectar la presencia de subsenales en zonas escolares, carriles bici o areas de carga y descarga, alimentando estudios de movilidad.
- Filtrado y curacion de repositorios fotograficos: descartar o priorizar imagenes segun el tipo de subsenal presente antes de pasarlas a un pipeline de deteccion o segmentacion mas costoso.
- Preetiquetado para anotacion humana: usar las predicciones del clasificador como propuesta inicial en herramientas de anotacion, reduciendo el tiempo de etiquetado en proyectos de cartografia colaborativa.
- Alimentacion de servicios publicos de datos abiertos: publicar capas derivadas (por ejemplo, densidad de subsenales por municipio) reutilizables por administraciones, siempre que se respete la licencia cc-by-sa-4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de exactitud, F1, matriz de confusion, throughput ni latencia, ni comparaciones con otros clasificadores de senaletica neerlandesa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de la variante de YOLOv8-cls utilizada (n, s, m, l, x) y del tamano de entrada, datos que no se especifican en la ficha.
- GPU recomendadas: no disponible para este modelo concreto. Como referencia general, los clasificadores YOLOv8 de la familia Ultralytics suelen ejecutarse en GPUs de gama media o incluso en CPU, pero no se puede confirmar sin conocer la variante.
- Compatibilidad con GPU de consumo: no confirmada. Es probable que quepa en GPUs de consumo si se trata de una variante pequena o mediana, pero la informacion no lo garantiza.
- Opciones de despliegue: no disponibles. La libreria declarada (ultralytics) sugiere despliegue mediante el propio runtime de Ultralytics, con posible exportacion a ONNX, TensorRT u otros formatos, si bien esto no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicados de este modelo ni de sus alternativas directas para realizar una comparativa cuantitativa fiable. Cualitativamente, el modelo se situa en la categoria de clasificadores de senaletica viaria derivados de la familia YOLOv8 de Ultralytics, ajustados sobre datasets regionales. Alternativas de la misma categoria serian otros ajustes finos de YOLOv8-cls sobre senaletica nacional, o clasificadores convolucionales tipo ResNet/EfficientNet ajustados sobre datasets como GTSRB, pero no se dispone de parametros, contexto, rendimiento, licencia ni disponibilidad verificables para construir una tabla comparativa con datos reales.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Panoramax/classify_nl_subsigns | no disponible | no aplica | no disponible | cc-by-sa-4.0 | gated en HuggingFace, 0 descargas |
| Alternativas de clasificacion de senaletica (YOLOv8-cls, ResNet, EfficientNet sobre GTSRB u otros) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance geografico limitado: el modelo esta especializado en subsenales neerlandesas; su aplicacion fuera de Paises Bajos probablemente produzca errores sistematicos, aunque no se documenta el grado de degradacion.
- Acceso restringido: la ficha figura como gated, por lo que es necesario aceptar condiciones en HuggingFace antes de descargar el modelo.
- Tamano de repositorio de 0.0 GB y ausencia de descargas o likes: no se confirma que los pesos esten efectivamente publicados ni que el modelo haya sido validado por terceros. Conviene verificar la integridad y el contenido del repositorio antes de usarlo en produccion.
- Sesgos desconocidos: no hay informacion sobre la distribucion del dataset de entrenamiento (pais, region, condiciones meteorologicas, camara empleada, hora del dia), por lo que no se pueden evaluar sesgos por iluminacion, angulo o calidad de imagen.
- Riesgo de alucinacion: en clasificacion, se traduce en falsos positivos o etiquetas incorrectas sobre imagenes ambiguas, oclusivas o con senales deterioradas; no se han publicado metricas de error.
- Licencia cc-by-sa-4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar productos propietarios construidos sobre el modelo o sobre datasets derivados.
- Carencia de documentacion tecnica: sin model card detallada, no hay garantias sobre entradas esperadas, resolucion, normalizacion ni taxonomia exacta de clases, lo que dificulta la integracion en pipelines existentes.
- Idiomas y formato: el idioma declarado es unicamente nl y no se especifica el formato de pesos, lo que anade incertidumbre al despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Panoramax/classify_nl_subsigns
- Sitio principal de Panoramax: https://panoramax.fr/
- Instancia Panoramax del IGN: https://panoramax.ign.fr/
- Explorador de Panoramax: https://explore.panoramax.fr/fr/index
- Instancia Panoramax de OpenStreetMap Francia: https://panoramax.openstreetmap.fr/
- Articulo de Panoramax en Wikipedia: https://fr.wikipedia.org/wiki/Panoramax
- Libreria Ultralytics (framework declarado): no disponible en los resultados de busqueda; se puede consultar la documentacion oficial de Ultralytics si se necesita.
