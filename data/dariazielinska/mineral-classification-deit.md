# DariaZielinska/mineral-classification-deit

## Resumen

El modelo `mineral-classification-deit` es un clasificador de imágenes desarrollado por DariaZielinska que identifica 10 tipos de minerales a partir de fotografías. Se trata de un ajuste fino (fine-tuning) del modelo `facebook/deit-tiny-patch16-224`, un transformer de visión (ViT) en su variante DeiT (Data-efficient Image Transformers), por lo que hereda una arquitectura de tipo transformer con mecanismo de atención sobre parches de imagen.

Con 5.526.346 parámetros, es un modelo muy compacto, pensado para tareas de clasificación de imagen con recursos limitados. Clasifica las siguientes clases: quartz, topaz, chalcedony, cassiterite, hematite, agate, magnetite, beryl, silver y gold. El ajuste se realizó sobre un subconjunto equilibrado del conjunto de datos MineralImage5K-98, con 282 imágenes por clase (2.820 imágenes de entrenamiento en total).

Su relevancia es acotada: se trata de un experimento académico o de portafolio (0 descargas y 0 likes en el momento de la consulta) sobre un dominio muy específico (mineralogía) y no cubre un uso generalista. Aun así, resulta útil como ejemplo de aplicación de transformers de visión a la clasificación de minerales y como punto de partida para tareas similares de visión por computador en geología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (ViT/DeiT), variante DeiT-tiny con parches de 16x16 y entrada 224x224 |
| Parametros totales | 5.526.346 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; en la practica es un modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión de tipo DeiT en su configuración "tiny" (`deit-tiny-patch16-224`): la imagen de entrada se divide en parches de 16x16 píxeles para una resolución de 224x224, que se proyectan y procesan mediante capas de atención. Con 5.526.346 parámetros totales, coincide con el recuento esperado del modelo base DeiT-tiny adaptado a una cabeza de clasificación de 10 clases en lugar de las 1.000 clases originales de ImageNet.

El entrenamiento consistió en un ajuste fino sobre un subconjunto del conjunto de datos `Nech-C/mineralimage5K-98`, limitado a 10 clases de minerales. El conjunto de entrenamiento se equilibró a 282 imágenes por clase, lo que da 2.820 imágenes. Se compararon tres configuraciones experimentales: una línea base con tasa de aprendizaje 5e-5 (79,01 % de precisión y 79,13 % de F1 en test), una variante con aumento de datos (data augmentation) también a 5e-5 (77,76 % de precisión y 77,99 % de F1) y una variante con tasa de aprendizaje más alta, 1e-4 y sin aumento de datos, que resultó la mejor (80,54 % de precisión y 80,59 % de F1). No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, ni detalles sobre el número de tokens o épocas de entrenamiento más allá de lo indicado.

## Capacidades

- Clasificacion de imagenes en 10 clases de minerales: quartz, topaz, chalcedony, cassiterite, hematite, agate, magnetite, beryl, silver y gold.
- Procesamiento de imagenes RGB de 224x224 píxeles segun el modelo base DeiT-tiny-patch16-224.
- Inferencia mediante la libreria transformers con el pipeline `image-classification`.
- Compatible con endpoints (etiqueta `endpoints_compatible`).
- No soporta tool calling ni function calling (es un clasificador de imagenes).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues en sentido estricto; el metadato de idioma es `en`, pero la tarea es puramente visual.
- No dispone de modo "thinking", ni de entrada/salida de audio, ni de generacion de texto.

## Casos de uso

- Identificacion asistida de minerales en campo: un geologo o aficionado a la mineralogia puede fotografiar una muestra y obtener una prediccion entre las 10 clases soportadas. Es adecuado por su tamano reducido, que permite ejecutarlo en dispositivos con recursos limitados.
- Preclasificacion en catalogacion de colecciones: en un museo o coleccion privada, el modelo puede etiquetar automaticamente lotes de fotografias para reducir el trabajo manual de catalogacion, dejando la verificacion final a un experto.
- Filtrado previo en pipelines de analisis de imagenes geologicas: como primer paso de un flujo mayor, el modelo puede descartar o agrupar imagenes antes de aplicar analisis mas costosos.
- Herramienta educativa: aplicacion didactica para que estudiantes de geologia practiquen el reconocimiento de minerales y contrasten sus respuestas con la prediccion del modelo.
- Prototipo de investigacion en vision por computador aplicada a mineralogia: sirve como punto de partida (baseline) reproducible para experimentos de clasificacion de minerales con transformers de vision.
- Etiquetado asistido de conjuntos de datos: el modelo puede generar etiquetas preliminares sobre imagenes nuevas de las 10 clases, que despues se revisan y corrigen para ampliar el conjunto de datos de entrenamiento.
- Demostracion de despliegue ligero: por su reducido numero de parametros, es adecuado como ejemplo de servicio de clasificacion de imagenes con baja latencia en CPU o GPU de gama baja.

## Benchmarks y rendimiento

Se han publicado resultados de clasificacion (precision y F1 en test) para las tres configuraciones experimentales comparadas en la model card del autor:

| Experimento | Tasa de aprendizaje | Precision en test | F1 en test |
|---|---:|---:|---:|
| Linea base | 5e-5 | 79,01 % | 79,13 % |
| Con aumento de datos | 5e-5 | 77,76 % | 77,99 % |
| Tasa de aprendizaje mas alta | 1e-4 | 80,54 % | 80,59 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de clasificacion de imagenes y no de un modelo de lenguaje. Tampoco se proporcionan comparaciones directas con otros clasificadores de minerales.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 5.526.346 parametros, los pesos ocupan aproximadamente 22 MB en FP32 y unos 11 MB en FP16 (calculo a partir del numero de parametros; no confirmado por el autor).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requieren aceleradores de gama alta como A100 o H100. Una GPU de consumo como una RTX 3060, RTX 4090 o similar resulta sobredimensionada para este modelo.
- Cabe en GPU de consumo: si, con enorme margen, e incluso es viable la inferencia en CPU.
- Opciones de despliegue: la libreria transformers (pipeline `image-classification`) es la via documentada; tambien son plausibles exportaciones a ONNX o TorchScript para despliegue en produccion, aunque no se documentan en la model card. Herramientas para modelos de lenguaje como vLLM, llama.cpp o Ollama no aplican a este modelo de vision.
- Latencia y throughput estimados: no disponible. Dado el reducido numero de parametros, se espera una latencia muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mineral-classification-deit | 5.526.346 | Imagen 224x224 | 80,54 % de precision en test (10 clases) | no disponible | HuggingFace |
| facebook/deit-tiny-patch16-224 (modelo base) | ~5,7 M (con cabeza de 1.000 clases) | Imagen 224x224 | No entrenado para minerales (ImageNet) | no disponible en la informacion proporcionada | HuggingFace |
| Clasificadores de rocas basados en ResNet (transfer learning) | no disponible | no disponible | no disponible | no disponible | Publicaciones cientificas |

No se dispone de datos numericos comparables de otros clasificadores de minerales en la informacion proporcionada; los resultados de busqueda encontrados (articulos sobre ResNet para clasificacion de rocas y revisiones de IA en identificacion de minerales) no ofrecen cifras directamente equiparables a las 10 clases de este modelo.

## Limitaciones y advertencias

- Alcance muy restringido: solo cubre 10 clases de minerales. Cualquier mineral fuera de esa lista no sera clasificado correctamente.
- Entrenamiento sobre un subconjunto pequeno: 2.820 imagenes en total (282 por clase). El rendimiento puede degradarse en condiciones de imagen distintas a las del conjunto de entrenamiento (iluminacion, fondo, angulo, resolucion).
- Riesgo de confusion entre clases visualmente similares: minerales como cuarzo, calcedonia y agate comparten caracteristicas visuales y pueden generar errores.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe riesgo de predicciones erroneas con alta confianza cuando la imagen no corresponde a ninguna clase soportada.
- Licencia no especificada: la model card no indica licencia, lo que impide confirmar si se permite el uso comercial. Debe aclararse con el autor antes de cualquier uso en produccion.
- Sesgos desconocidos: no se documenta la composicion demografica o geografica del conjunto de imagenes, por lo que no puede evaluarse el sesgo respecto a origenes o tipos de muestras.
- Modelo practicamente sin uso ni validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes publicadas.
- Idioma: aunque el metadato indica `en`, el modelo no procesa texto; cualquier uso linguistico no aplica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DariaZielinska/mineral-classification-deit
- Modelo base: https://huggingface.co/facebook/deit-tiny-patch16-224
- Conjunto de datos original: https://huggingface.co/datasets/Nech-C/mineralimage5K-98
- Articulo sobre clasificacion de imagenes de rocas con ResNet (Frontiers): https://www.frontiersin.org/journals/earth-science/articles/10.3389/feart.2022.1079447/full
- Articulo sobre deteccion de objetos con deep learning aplicado a minerales (MDPI): https://www.mdpi.com/2075-163X/14/9/873
- Revision de avances de IA en mineralogia (MDPI): https://www.mdpi.com/2075-163X/16/6/584
- Revision de tecnologias de IA en identificacion y clasificacion de minerales (ResearchGate): https://www.researchgate.net/publication/363103018_A_Review_of_Artificial_Intelligence_Technologies_in_Mineral_Identification_Classification_and_Visualization
