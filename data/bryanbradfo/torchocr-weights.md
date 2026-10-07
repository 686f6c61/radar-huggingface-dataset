# BryanBradfo/torchocr-weights

## Resumen

`BryanBradfo/torchocr-weights` es un repositorio de pesos preentrenados para torchOCR, una biblioteca de OCR nativa de PyTorch con una API de estilo torchvision. No se trata de un único modelo, sino de una coleccion de cinco checkpoints que cubren las dos etapas clasicas de un pipeline OCR: deteccion de texto (DBNet) y reconocimiento de texto (CRNN). El autor es BryanBradfo, y el repositorio se publica bajo licencia Apache-2.0 con un tamano total de 0,2 GB.

Su relevancia es practica: los checkpoints se cargan mediante enumeraciones `*_Weights` y `torch.hub` los descarga y verifica automaticamente por prefijo SHA-256, sin necesidad de gestionar ficheros a mano. Ademas, el repositorio incluye un protocolo de evaluacion reproducible sobre ICDAR-2015, con scripts de entrenamiento, calibracion y evaluacion, lo que lo convierte en una pieza util para quien quiera un OCR de escena con dependencias exclusivamente PyTorch.

El rango de tamanos es muy amplio dentro del mismo repo: desde detectores de 0,60 M de parametros (MobileNetV3-Large 0,5x) hasta un reconocedor CRNN de 27,9 M de parametros con backbone ResNet34-VD. Los pesos PPOCR_* proceden de conversiones de PaddleOCR, mientras que el checkpoint `ICDAR2015` es un ajuste fino sobre el conjunto de entrenamiento de ICDAR 2015.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DBNet (deteccion de texto) y CRNN (reconocimiento de texto), sobre backbones MobileNetV3-Large 0,5x, ResNet18-VD y ResNet34-VD |
| Parametros totales | 0,60 M (DBNet MobileNetV3-Large 05), 12,4 M (DBNet ResNet18-VD), 27,9 M (CRNN ResNet34-VD) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card; los checkpoints PPOCR_V3_EN y el detector ICDAR2015 estan orientados a escritura latina, y PPOCR_V3_CH a chino |
| Licencia | apache-2.0 |
| Formato de pesos | `.pth` (state dicts de PyTorch); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio agrupa dos familias de arquitecturas. Para deteccion se emplea DBNet, un detector segmentacion-based que predice un mapa de probabilidad de texto y lo binariza de forma diferenciable, combinado con backbones ligeros: MobileNetV3-Large con factor de anchura 0,5 (0,60 M de parametros) y ResNet18-VD (12,4 M). Para reconocimiento se emplea CRNN con backbone ResNet34-VD (27,9 M), que produce la transcripcion de cada region de texto recortada.

El detalle de entrenamiento publicado se refiere al checkpoint `DBNet_MobileNetV3_Large_05_Weights.ICDAR2015`: parte de `PPOCR_V3_EN` y se ajusta durante 300 epocas sobre las 1000 imagenes de entrenamiento de ICDAR-2015, con la receta de aumentacion de PaddleOCR, recortes de 640 px, AdamW a 1e-3 con warmup y decaimiento coseno, en unos 80 minutos sobre una unica GPU de portatil. Los pesos publicados corresponden a la ultima epoca, sin seleccion de checkpoint sobre el conjunto de test. El umbral `box_thresh = 0.45` se calibro maximizando el hmean sobre el split de entrenamiento y se aplico una sola vez al split de test; con el valor por defecto de PaddleOCR (`box_thresh = 0.6`) el mismo checkpoint obtiene 0.688. Los checkpoints `PPOCR_*` son conversiones de releases de PaddleOCR (Apache-2.0) realizadas con los conversores de `scripts/`, adaptados de PaddleOCR2Pytorch.

## Capacidades

- Deteccion de texto en imagen: localizacion de regiones de texto mediante cuadrilateros rotados (DBNet), con salida procesada por `DBPostProcessor`.
- Reconocimiento de texto: transcripcion de recortes de texto a cadena mediante CRNN + ResNet34-VD.
- OCR de escena incidental: el detector `ICDAR2015` esta pensado para texto presente en fotografias de calle, evaluado a 736 × 1280.
- Procesamiento integrado en PyTorch: preprocesado y postprocesado expuestos como `weights.transforms()` y `weights.meta["postprocess"]`.
- Carga verificada: `torch.hub` comprueba el prefijo SHA-256 incrustado en el nombre del fichero.
- Cobertura multilingue limitada: existen checkpoints orientados a latin script (`PPOCR_V3_EN`) y a chino (`PPOCR_V3_CH`).
- No dispone de tool calling, function calling, modo agente ni modo de razonamiento, al no ser un modelo de lenguaje.
- No se documentan capacidades multimodales de vision-lenguaje; la tarea es exclusivamente image-to-text.

## Casos de uso

- Digitalizacion de documentos escaneados en pipelines internos: combinando el detector DBNet ResNet18-VD con el reconocedor CRNN ResNet34-VD se puede extraer texto de facturas o formularios, todo dentro de PyTorch sin dependencias de PaddlePaddle.
- OCR en fotografias de movil o camara en la calle: el detector `ICDAR2015` esta calibrado especificamente para texto incidental en imagenes de escena, que es el escenario de senalizacion, carteles y matriculas.
- Preprocesado de datos para entrenamiento de modelos de lenguaje: extraer texto de imagenes para construir corpus a partir de capturas, PDFs escaneados o archivos fotograficos.
- Anonimizacion de informacion sensible: detectar y localizar regiones de texto en imagenes antes de aplicar un desenfoque selectivo sobre los cuadrilateros devueltos por el detector.
- Moderacion de contenido basada en texto en imagen: detectar y transcribir texto superpuesto en imagenes subidas por usuarios para aplicar filtros automaticos.
- Indexacion y busqueda de archivos escaneados: transcribir lotes de imagenes para construir un indice de texto completo sobre un repositorio documental.
- Prototipado y docencia en OCR: al ser checkpoints pequenos (0,60 M y 12,4 M de parametros) y con un unico script de evaluacion reproducible, son adecuados para experimentar con recetas de deteccion y reconocimiento en una GPU de portatil.
- Integracion en aplicaciones de escritorio o embebidas: los modelos de 0,60 M de parametros permiten inferencia en tiempo real en hardware modesto, con un coste de memoria minimo.

## Benchmarks y rendimiento

Resultados publicados en la model card del repositorio. La metrica de deteccion es el protocolo oficial de ICDAR-2015 (emparejamiento greedy uno a uno con IoU > 0,5 y filtrado `###` don't-care) sobre cuadrilateros rotados; los numeros son reproducibles con los scripts `references/detection/evaluate.py` y `references/recognition/evaluate.py`.

| Checkpoint | Parametros | Metrica | Resultado |
|---|---|---|---|
| `DBNet_MobileNetV3_Large_05_Weights.ICDAR2015` | 0,60 M | ICDAR-2015 test: precision / recall / hmean | 0.785 / 0.689 / 0.734 |
| `DBNet_MobileNetV3_Large_05_Weights.ICDAR2015` (box_thresh 0.6) | 0,60 M | ICDAR-2015 test: hmean | 0.688 |
| `DBNet_MobileNetV3_Large_05_Weights.PPOCR_V3_EN` | 0,60 M | ICDAR-2015 test: hmean | 0.441 ¹ |
| `DBNet_MobileNetV3_Large_05_Weights.PPOCR_V3_CH` | 0,60 M | ICDAR-2015 test: hmean | 0.422 ¹ |
| `DBNet_ResNet18_VD_Weights.PPOCR_SERVER_V2` | 12,4 M | ICDAR-2015 test: hmean | 0.414 ¹ |
| `CRNN_ResNet34_VD_Weights.PPOCR_SERVER_V2` | 27,9 M | Precision de palabra (case-insensitive, 2077 palabras) | 0.665 ² |

¹ Los detectores `PPOCR_*` son conversiones de PaddleOCR y operan a nivel de linea. ICDAR-2015 puntua cajas de *palabra*, por lo que palabras adyacentes fusionadas en una sola linea cuentan como fallo: estas cifras sirven para comparar checkpoints entre si, no representan la precision real sobre documentos.
² Sobre 2077 palabras alfanumericas "care" del test de ICDAR-2015, recortadas de las imagenes completas con `torchocr.ops.crop_quads` sobre sus cuadrilateros de ground truth, no sobre los recortes oficiales de la tarea 4.3. Recortes alineados a ejes de las mismas palabras obtienen 0.579.

No se han publicado resultados comparativos con otros frameworks OCR en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: muy baja. Con 0,60 M de parametros (DBNet MobileNetV3-Large 05) el modelo ocupa unos pocos megabytes en FP32; con 27,9 M de parametros (CRNN ResNet34-VD) el peso ronda los 112 MB en FP32 y unos 56 MB en FP16.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 y superiores. Para lotes grandes se pueden usar RTX 4090, A100 o H100 sin que el modelo sea el cuello de botella.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU para inferencia por imagen individual.
- Opciones de despliegue: la libreria torchOCR sobre PyTorch; exportacion a TorchScript u ONNX no esta documentada en la informacion disponible. No hay soporte publicado para llama.cpp, Ollama, vLLM ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo indica que el ajuste fino del detector se completo en aproximadamente 80 minutos sobre una unica GPU de portatil, dato de entrenamiento y no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| torchocr-weights (este repo) | 0,60 M - 27,9 M | no aplica | hmean 0.734 en ICDAR-2015 con el detector MobileNetV3-Large 05; 0.665 de precision de palabra con CRNN ResNet34-VD | Apache-2.0 | HuggingFace y GitHub |
| PaddleOCR (PP-OCRv3) | no disponible | no aplica | no disponible en la informacion consultada | Apache-2.0 | GitHub y releases de PaddlePaddle |
| EasyOCR | no disponible | no aplica | no disponible en la informacion consultada | Apache-2.0 | GitHub y PyPI |
| docTR | no disponible | no aplica | no disponible en la informacion consultada | Apache-2.0 | GitHub y PyPI |

La diferencia principal de torchocr frente a las alternativas es la ausencia de dependencia de PaddlePaddle o de frameworks adicionales: el pipeline completo es PyTorch nativo. En cambio, su ecosistema de pesos es mucho mas reducido y los checkpoints `PPOCR_*` incluidos son conversiones de modelos de PaddleOCR, no entrenamientos propios.

## Limitaciones y advertencias

- Los checkpoints `PPOCR_*` de deteccion operan a nivel de linea, mientras que la metrica de ICDAR-2015 puntua palabras; las cifras de hmean 0.441, 0.422 y 0.414 no reflejan la precision real sobre documentos y no deben compararse directamente con las del checkpoint `ICDAR2015`.
- El checkpoint `ICDAR2015` se selecciono en su ultima epoca sin validacion sobre test, y su umbral `box_thresh = 0.45` se calibro sobre el split de entrenamiento. El protocolo es reproducible, pero implica cierto riesgo de sobreajuste a ICDAR-2015.
- El detector `ICDAR2015` esta pensado para texto incidental en fotografias de calle con escritura latina, evaluado a 736 × 1280. Se espera menor recall en documentos densos y en escrituras no latinas.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad sobre estos pesos.
- Los tipos de cuantizacion y los idiomas soportados no estan documentados en la model card; la lista de idiomas figura como no disponible.
- Riesgo de alucinacion: en reconocimiento de texto, CRNN puede producir transcripciones plausibles pero incorrectas en recortes de baja calidad, borrosos o con tipografias no vistas, sin ninguna senal de confianza calibrada publicada.
- Riesgo de sesgo: el ajuste fino se realizo unicamente sobre las 1000 imagenes de entrenamiento de ICDAR-2015, un conjunto de escenas de calle con una distribucion geografica y de estilos tipograficos limitada.
- Licencia: los pesos se publican bajo Apache-2.0, pero el checkpoint `ICDAR2015` deriva de un conjunto de datos (ICDAR 2015 Incidental Scene Text) que sus organizadores liberan para uso en investigacion. Es responsabilidad del usuario verificar que su uso comercial cumple esos terminos.
- Advertencia de produccion: el repositorio contiene pesos, no una libreria completa; la API vive en el proyecto torchOCR de GitHub y la estabilidad de `torch.hub` depende de que los ficheros y sus prefijos SHA-256 no cambien.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados no guardaban relacion con el repositorio analizado.

## Enlaces

- HuggingFace: https://huggingface.co/BryanBradfo/torchocr-weights
- Repositorio torchOCR en GitHub: https://github.com/BryanBradfo/torchOCR
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- PaddleOCR2Pytorch: https://github.com/frotms/PaddleOCR2Pytorch
- Conjunto de datos ICDAR 2015 Incidental Scene Text: https://rrc.cvc.uab.es/?ch=4
