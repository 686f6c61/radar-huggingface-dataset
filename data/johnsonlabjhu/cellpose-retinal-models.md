# JohnsonLabJHU/cellpose-retinal-models

## Resumen

JohnsonLabJHU/cellpose-retinal-models es un repositorio de modelos de segmentación de células retinianas publicado por el laboratorio Johnson (Johns Hopkins University). No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de un conjunto de tres cabezales Cellpose afinados sobre un backbone DINOv3 ViT Large, bajo la denominación interna cpdino. El repositorio ocupa 3,6 GB y contiene tres checkpoints especializados en un mismo tipo celular diana: las células ganglionares de la retina (RGC), diferenciados por la marca biológica utilizada para identificarlas.

Los tres modelos son cpdino_BRN3A (etiqueta BRN3A), cpdino_RPBMS (etiqueta RPBMS) y cpdino_RGC-Snap (RGC marcadas con RFP). Los dos primeros se entrenaron con imágenes de microscopía confocal de 20x en formato .oir, proyección máxima, resolución 1024x1024 y 16 bits por píxel; el tercero se entrenó a 10x con resolución 2048x2048 y proyección no definida o máxima. La relevancia de esta ficha es acotada y muy específica: cubre una necesidad de nicho en neurobiología de la visión y oftalmología experimental, donde la cuantificación fiable de RGC en montajes completos de retina es un cuello de botella habitual.

La información pública disponible es muy limitada. La model card no declara licencia, idiomas, formato de pesos, parámetros totales ni resultados de benchmarks, y la búsqueda web realizada no ha devuelto ningún resultado relevante sobre el modelo. Por tanto, buena parte de las filas de esta ficha aparecen como "no disponible", y así deben tratarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose (cabezal de segmentacion de instancias) sobre backbone DINOv3 ViT Large; nombre interno del modelo Cellpose: cpdino |
| Parametros totales | no disponible (la model card no indica recuento de parametros del backbone ni del cabezal) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision para segmentacion de imagenes; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas; la inferencia en Cellpose se ejecuta habitualmente en FP32) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | no disponible (el repositorio ocupa 3,6 GB; no se detalla si son .pth, .pt, safetensors u otro) |
| Tarea | Segmentacion de instancias celulares en imagenes de retina |
| Celula diana | RGC (celulas ganglionares de la retina) en los tres checkpoints |
| Checkpoints incluidos | cpdino_BRN3A, cpdino_RPBMS, cpdino_RGC-Snap |
| Tamano del repositorio | 3,6 GB |
| Resolucion de entrenamiento | 1024x1024 (BRN3A, RPBMS) y 2048x2048 (RGC-Snap) |
| Profundidad de bits de entrada | uint16, 16 bits significativos |
| Formato de imagen de entrenamiento | .oir (Olympus), proyeccion maxima (en RGC-Snap: n/a o max) |
| Aumento de entrenamiento | 20x (BRN3A y RPBMS) y 10x (RGC-Snap) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes: un cabezal Cellpose, que es el modulo encargado de predecir flujos espaciales y mapas de probabilidad para resolver la segmentacion de instancias celulares, y un backbone DINOv3 ViT Large, un transformer de vision preentrenado mediante autoaprendizaje (self-supervised) que actua como extractor de caracteristicas. DINOv3 ViT Large pertenece a la familia de Vision Transformers en su variante Large, aunque la model card no especifica el recuento exacto de parametros ni la resolucion de parche utilizada. La combinacion se etiqueta como cpdino, es decir, Cellpose con backbone DINO.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de imagenes anotadas, el esquema de aumento de datos ni si se aplicaron tecnicas de ajuste fino adicionales como RLHF o DPO (que, por otra parte, no son habituales en segmentacion de imagenes). Lo unico documentado son las caracteristicas de las imagenes de entrenamiento por checkpoint: cpdino_BRN3A y cpdino_RPBMS usan imagenes de microscopia a 20x, en formato .oir, con proyeccion maxima, 1024x1024 px, almacenadas como uint16 con 16 bits significativos; cpdino_RGC-Snap usa imagenes a 10x, en formato .oir, con resolucion 2048x2048 px, uint16 con 16 bits significativos y proyeccion no aplicable o maxima. Los tres estan especializados en la misma poblacion celular (RGC) pero distinguen la marca empleada para etiquetarlas: BRN3A, RPBMS y RFP en el caso de RGC-Snap.

## Capacidades

- Segmentacion de instancias de celulas ganglionares de la retina en imagenes de microscopia de retina completa.
- Deteccion especifica por marca biologica: un checkpoint para BRN3A, otro para RPBMS y otro para RGC marcadas con RFP.
- Procesamiento de imagenes de 16 bits (uint16) con 16 bits significativos, lo que preserva rango dinamico completo de microscopia de fluorescencia.
- Adaptacion a dos escalas de aumento distintas: 20x (1024x1024) y 10x (2048x2048).
- Acepta como origen imagenes .oir (Olympus) tras la conversion o proyeccion correspondiente.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): vision si, en el sentido estricto de vision por computador para segmentacion; no hay modo de razonamiento explicito, ni procesamiento de audio, ni generacion de texto.

## Casos de uso

- Cuantificacion de perdida de RGC en modelos animales de glaucoma: el checkpoint cpdino_BRN3A permite segmentar y contar celulas BRN3A-positivas en montajes de retina completa a 20x, sustituyendo el conteo manual y reduciendo la variabilidad entre observadores.
- Analisis de neuroproteccion en ensayos precinicos: comparar densidad de RGC entre grupos tratados y control usando el mismo checkpoint, con imagenes homogeneas de 1024x1024 a 16 bits para minimizar el sesgo de preprocesado.
- Caracterizacion de subpoblaciones de RGC: el uso de checkpoints distintos (BRN3A frente a RPBMS) permite estudiar poblaciones marcadas de forma diferencial y estimar el grado de solapamiento entre marcas.
- Trazado genetico con reporteros fluorescentes: cpdino_RGC-Snap segmenta RGC marcadas con RFP en imagenes de mayor campo (2048x2048, 10x), adecuado para montajes completos o campos amplios donde se necesita cobertura y no detalle subcelular.
- Morfometria de somas: al obtener mascaras de instancia, se pueden medir area, perimetro y ejes del soma de cada RGC, lo que permite analizar cambios de tamano asociados a degeneracion o a subtipos celulares.
- Cribado de alto rendimiento de compuestos: integrado en un pipeline automatizado, el modelo puede procesar placas completas de forma desatendida y generar recuentos por pocillo para priorizar candidatos.
- Cuantificacion de regeneracion axonal o supervivencia tras lesion del nervio optico: el recuento automatizado de RGC supervivientes por campo es la metrica primaria en estos estudios y se beneficia de una segmentacion reproducible.
- Creacion de datasets anotados a escala: las mascaras generadas pueden servir como preanotacion para revision humana, reduciendo el coste de construir conjuntos de entrenamiento mayores para futuros fine-tunings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de segmentacion (por ejemplo IoU, Dice, F1 por instancia o error de recuento) ni comparaciones cuantitativas con otros modelos. La busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo o con sus resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 3,6 GB en total para tres checkpoints, lo que sugiere en torno a 1-1,2 GB por checkpoint en disco; en FP32 eso se traduce en una horquilla de aproximadamente 2-4 GB de VRAM durante la inferencia, cantidad que crece con la resolucion de entrada y con el uso de mosaicos o tiles. Estas cifras son estimaciones derivadas del tamano del repositorio, no datos declarados por el autor.
- GPU recomendadas: no disponible. Por el perfil de memoria descrito, cualquier GPU con 6-8 GB o mas de VRAM deberia ser suficiente; para lotes grandes o procesamiento por mosaicos de imagenes de 2048x2048 conviene una GPU de 12-24 GB.
- Compatibilidad con GPU de consumo: previsiblemente si, incluidas RTX 3060 de 12 GB, RTX 4070/4080 y RTX 4090, siempre que el tamano real del checkpoint confirme las estimaciones anteriores.
- Inferencia en CPU: Cellpose admite ejecucion en CPU, aunque con latencia muy superior; util para validacion puntual, no para cribado a gran escala.
- Opciones de despliegue: la via natural es la libreria Cellpose (API de Python y linea de comandos) cargando los checkpoints del repositorio. vLLM, TGI, llama.cpp y Ollama no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. Dependen del modelo concreto, de la resolucion de entrada, del uso de tiles y del hardware; no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tarea | Backbone / arquitectura | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JohnsonLabJHU/cellpose-retinal-models | Segmentacion de RGC en retina | Cellpose sobre DINOv3 ViT Large | no disponible | Imagenes uint16, 1024x1024 (20x) y 2048x2048 (10x) | no disponible | HuggingFace, 3,6 GB, 0 descargas |
| Cellpose (modelos generalistas, p. ej. cyto y nuclei) | Segmentacion celular general | Cellpose con backbone convolucional | no disponible en la informacion proporcionada | Imagenes de microscopia 2D y 3D | MIT (segun la distribucion habitual del proyecto; no verificado en esta busqueda) | Publico y ampliamente adoptado |
| Cellpose-SAM | Segmentacion celular general | Cellpose sobre backbone tipo SAM | no disponible en la informacion proporcionada | Imagenes de microscopia 2D | no disponible | Publico |
| StarDist | Segmentacion de instancias con formas convexas | Red convolucional con prediccion de formas | no disponible en la informacion proporcionada | Imagenes 2D y 3D | no disponible | Publico |

No se dispone de cifras de rendimiento comparativas verificadas en la informacion proporcionada. Las celdas marcadas como "no disponible" no deben inferirse ni completarse con estimaciones. La diferencia funcional principal de este repositorio frente a los modelos generalistas es la especializacion en celulas ganglionares de la retina y en dos regímenes de magnificacion concretos.

## Limitaciones y advertencias

- Especializacion estrecha: los tres checkpoints estan entrenados para RGC de retina con marcas y magnificaciones concretas. Aplicarlos a otros tejidos, especies o marcadores fuera de distribucion probablemente degrade la segmentacion.
- Sin licencia declarada: la model card no indica licencia, lo que impide determinar si el uso comercial esta permitido. Cualquier uso en produccion o en un producto requiere aclarar este punto con los autores.
- Sin metricas publicadas: no hay IoU, Dice ni curvas de validacion. No es posible estimar la calidad esperada ni comparar objetivamente con alternativas.
- Ausencia de informacion sobre el dataset de entrenamiento: no se conoce el numero de imagenes, la diversidad de muestras, el numero de animales ni el protocolo de anotacion, lo que dificulta evaluar el riesgo de sesgo por lote, microscopio o condicion de tinción.
- Riesgo de sobreajuste al microscopio y al formato de origen: las imagenes de entrenamiento proceden de archivos .oir con proyeccion maxima. Imagenes adquiridas con otros microscopios, otras opticas o sin proyeccion maxima pueden requerir reentrenamiento o ajuste de preprocesado.
- Dependencia del preprocesado: la entrada esperada es uint16 de 16 bits significativos a resoluciones concretas (1024x1024 o 2048x2048). Cambiar el rango dinamico o reescalar la imagen puede alterar los resultados de forma no documentada.
- Riesgo de falsos positivos y negativos en segmentacion: como cualquier modelo de segmentacion, puede fusionar celulas proximas, partir somas grandes o ignorar celulas con senal debil. Se recomienda validacion manual sobre una submuestra antes de usarlo en produccion.
- Sin garantias de reproducibilidad: el repositorio tiene 0 descargas y 0 likes, no hay issues ni discusion publica, y no se documentan versiones de dependencias ni semillas de entrenamiento.
- Riesgo de deriva si se combinan checkpoints: BRN3A y RPBMS marcan subpoblaciones parcialmente solapadas de RGC; sumar los recuentos de ambos checkpoints como si fueran disjuntos seria un error metodologico.
- Idioma y documentacion: la model card esta en ingles y es muy escueta; no hay guia de uso, ejemplos de codigo ni pesos alternativos documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JohnsonLabJHU/cellpose-retinal-models
- La busqueda web realizada no ha devuelto ningun enlace relevante sobre este modelo. Los resultados obtenidos corresponden a contenidos sin relacion (una serie de television de tematica historica), por lo que se descartan.
- No se han encontrado en la informacion proporcionada enlaces a paper, blog tecnico, repositorio de codigo, demo ni dataset asociados al modelo.
