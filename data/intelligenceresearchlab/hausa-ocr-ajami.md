# IntelligenceResearchLab/Hausa-OCR-AJAMI

## Resumen
Hausa-OCR-AJAMI es un modelo de reconocimiento óptico de caracteres (OCR) desarrollado por IntelligenceResearchLab para transcribir texto hausa escrito en ajami (variante de la escritura árabe adaptada al hausa) a caracteres latinos. No es un modelo de lenguaje generativo, sino un sistema de visión por computador especializado en líneas de texto: recibe imágenes de líneas ya segmentadas y devuelve su transcripción.

La arquitectura es una red convolucional (CNN) combinada con una LSTM bidireccional de dos capas de 256 unidades ocultas por dirección, entrenada con pérdida CTC. El repositorio contiene el checkpoint entrenado `best_cer_v10.pt` (seleccionado en la época 25 por CER de validación mínimo), junto con el vocabulario, la configuración de entrenamiento, el historial por época y el código de inferencia.

Su relevancia es acotada pero específica: el ajami hauso es un sistema de escritura con poca cobertura en herramientas OCR convencionales, y este modelo publica métricas medidas (CER de 0,3007 y WER de 0,7519 sobre 299 líneas de test) que reflejan un estado de desarrollo inicial más que un sistema listo para producción. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN + LSTM bidireccional de dos capas (256 unidades ocultas por direccion) con CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo OCR sobre imagenes de lineas de texto, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision completa) |
| Idiomas soportados | hausa (ha), en escritura ajami transcrita a alfabeto latino |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | .pt (checkpoint PyTorch; no safetensors ni GGUF) |

Otros datos tecnicos relevantes: altura de entrada fija de 96 pixeles con relacion de aspecto preservada, conversion a escala de grises, espejado horizontal para entrada de derecha a izquierda y normalizacion de pixeles al rango [-1, 1]. El vocabulario esta en `vocab.json` e incluye simbolos de blank y desconocido. Las etiquetas usan normalizacion NFC. Entorno de referencia: PyTorch 2.5.1 con CUDA 12.1 y Pillow 12.3.0.

## Arquitectura y entrenamiento
El modelo es una red CRNN clasica: un extractor convolucional procesa la imagen de la linea de texto, cuyas caracteristicas se introducen en una LSTM bidireccional de dos capas con 256 unidades por direccion. La salida se decodifica con CTC, lo que permite alinear secuencias de longitud variable sin segmentacion a nivel de caracter. En inferencia se aplica decodificacion CTC voraz (greedy) sobre una unica imagen de linea.

Los datos de entrenamiento provienen del dataset IntelResearchLab/Hausa. La instantanea local contenia 3.199 lineas, redistribuidas con semilla 42 en 2.800 de entrenamiento, 100 de validacion y 299 de test. Cada linea de entrenamiento genero ocho vistas fijas, lo que produjo 22.400 ejemplos por epoca; la aumentacion dinamica se desactivo. El entrenamiento se realizo con AdamW y un planificador de tasa de aprendizaje guiado por validacion, con tamano de lote 24, y se completo en 25 epocas. No se realizo reentrenamiento como parte de la publicacion. Conviene subrayar que la particion es personalizada a nivel de linea y no es la particion oficial del dataset ni una evaluacion con manuscritos reservados, por lo que los resultados no son directamente comparables con las experimentaciones V7/V9 del mismo proyecto.

## Capacidades
- OCR de lineas de texto hausa en escritura ajami: convierte una imagen de linea previamente segmentada en su transcripcion latina.
- Transcripcion monolinea con decodificacion CTC voraz mediante `predict.py`.
- Procesamiento de imagenes en escala de grises con altura normalizada a 96 pixeles y relacion de aspecto preservada.
- Soporte de entrada de derecha a izquierda (aplicacion de espejado horizontal durante el preprocesamiento).
- Salida en alfabeto latino con normalizacion NFC de etiquetas.
- No dispone de tool calling, function calling, capacidades de agente, vision general, audio ni modo de razonamiento: es un modelo OCR de proposito especifico.
- No es un checkpoint compatible con `AutoModel` de Transformers ni con endpoints de inferencia alojados.

## Casos de uso
- Digitalizacion de manuscritos hausa en ajami: el modelo permite transcribir lineas de documentos historicos o religiosos a texto latino buscable. Es adecuado porque esta entrenado especificamente sobre este sistema de escritura, pero el CER de 0,30 obliga a revision humana posterior.
- Construccion de corpus linguisticos: para proyectos de investigacion sobre hausa escrito, el modelo puede generar transcripciones preliminares a gran escala que despues se corrigen manualmente, reduciendo el coste frente a la transcripcion desde cero.
- Preservacion de patrimonio documental: digitalizacion de archivos en ajami con enriquecimiento de metadatos, usando el modelo como primer paso de un flujo que combine segmentacion de lineas y revision.
- Etiquetado asistido para entrenamiento futuro: las transcripciones generadas, una vez corregidas, pueden servir como datos etiquetados para reentrenar versiones mas precisas del propio modelo.
- Investigacion en OCR de escrituras de bajo recurso: el modelo sirve como linea base reproducible para comparar arquitecturas CRNN frente a enfoques basados en transformers en escrituras ajami.
- Analisis de contenido textual en estudios academicos: extraccion de texto para busqueda de terminos, analisis de frecuencia o estudios filologicos sobre documentos hausa, siempre con verificacion humana dado el WER de 0,75.
- Integracion en herramientas de catalogacion bibliotecaria: indexacion de fondos en ajami para su consulta en catalogos digitales, tratando la salida como transcripcion candidata sujeta a validacion.

## Benchmarks y rendimiento
Resultados medidos por el autor sobre el conjunto de test local (299 lineas):

| Metrica | Valor |
|---|---:|
| CER de test | 0,3007341374 |
| WER de test | 0,7518518519 |
| Tasa de lineas exactas | 0,2976588629 |
| Lineas de test | 299 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo OCR y no de un modelo de lenguaje. El historial por epoca esta en `history_v10.csv` y la precision completa de las metricas en `test_metrics.json`. El autor advierte que estos resultados corresponden a una particion personalizada y no son comparables con las experimentaciones V7/V9, que usaron particiones distintas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio completo ocupa 0,1 GB e incluye pesos y estado del optimizador, lo que indica un modelo de tamano reducido que cabe holgadamente en GPUs de consumo, pero no se publican cifras de memoria.
- GPU recomendadas: no especificadas por el autor. El checkpoint se entreno con PyTorch 2.5.1 y CUDA 12.1, por lo que se requiere una GPU compatible con CUDA para la ruta de inferencia acelerada. La inferencia tambien puede ejecutarse en CPU con PyTorch.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio, aunque no hay confirmacion oficial ni requisitos minimos publicados.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un checkpoint de Transformers ni un modelo GGUF. El despliegue requiere PyTorch y Pillow y se realiza mediante `python predict.py ruta/a/linea.png`.
- Latencia y throughput: no disponibles.
- Requisito funcional critico: el modelo espera lineas ya segmentadas, no paginas completas, por lo que cualquier despliegue necesita un modulo previo de segmentacion de lineas.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables de OCR para hausa en ajami ni resultados de la experimentacion V7/V9 del mismo proyecto que permitan una comparacion cuantitativa directa. El propio autor senala que las puntuaciones de V10 no son comparables con V7/V9 debido al uso de particiones distintas.

## Limitaciones y advertencias
- Tasa de error alta: el WER de 0,7519 implica que aproximadamente tres de cada cuatro palabras no se transcriben correctamente; el autor indica explicitamente que las salidas requieren revision.
- Baja tasa de lineas exactas: solo el 29,77 % de las lineas de test se transcriben de forma perfecta.
- Metodologia de evaluacion no estandar: la particion train/val/test es personalizada a nivel de linea (semilla 42) y no corresponde a la particion oficial del dataset ni a una evaluacion con manuscritos reservados, por lo que las metricas pueden no reflejar el rendimiento en documentos reales fuera de la distribucion.
- Dependencia de la segmentacion: el modelo no procesa paginas completas, solo lineas pre-segmentadas; los errores de segmentacion previos degradaran el resultado final.
- Variabilidad por lote: el autor advierte que el padding por lotes puede influir en la red bidireccional, de modo que la salida de una imagen individual puede diferir de la evaluacion por lotes.
- Sin reentrenamiento en la publicacion: el checkpoint se subio tal cual desde la ejecucion local, sin ajustes adicionales.
- Ambito linguistico limitado: solo hausa en escritura ajami; no cubre otras lenguas ni otros sistemas de escritura.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero impone atribucion y obligacion de compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su integracion en productos propietarios. Ademas, siguen aplicandose las condiciones de atribucion y uso del dataset de origen.
- Madurez del repositorio: sin descargas ni interacciones registradas y sin senales de mantenimiento activo o soporte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/IntelligenceResearchLab/Hausa-OCR-AJAMI
- Dataset de origen citado en la model card: https://huggingface.co/datasets/IntelResearchLab/Hausa
- Repositorio referenciado por los tags (region us): sin URL especifica en la informacion disponible
- La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos resultados obtenidos eran guias de programacion de television en italiano y no guardan relacion con este modelo.
