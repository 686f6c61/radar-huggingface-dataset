# fastforks/parseq

## Resumen

PARSeq es un modelo de reconocimiento de texto en escena (scene text recognition) publicado originalmente por Darwin Bautista y Rowel Atienza en ECCV 2022. Esta ficha corresponde al empaquetado `fastforks/parseq`, una distribucion del modelo original integrada en la libreria `fastforks`, que actua como capa de carga, verificacion de pesos y ejecucion optimizada. El modelo resuelve el problema de convertir un recorte de imagen que contiene una palabra o linea corta en texto legible, y debe combinarse con un detector de cajas (por ejemplo `ppocrv5-mobile`) para procesar paginas completas.

Arquitectonicamente es un transformer hibrido: un encoder ViT sobre el recorte de entrada de 32 x 128 pixeles y un decoder Transformer de una sola capa con dos flujos, entrenado mediante modelado autoregresivo de secuencia permutada (permuted autoregressive sequence modelling). Lee un unico recorte por inferencia y emite hasta 94 caracteres del repertorio latino (letras, digitos y puntuacion ASCII, sin espacios). La decodificacion es autoregresiva greedy con una pasada de refinamiento, siguiendo el `read.py` original.

Su relevancia actual es practica: `fastforks` no aloja pesos, sino que descarga los checkpoints originales de los autores, verifica su SHA-256 y ofrece un backend `portable` con grafo CUDA que reduce la latencia de 19,6 ms a 3,6 ms en `parseq` y de 18,0 ms a 2,1 ms en `parseq-tiny` sobre una RTX 5060 Ti. El modelo se etiqueta como tier experimental y esta pensado para pipelines OCR donde la latencia de reconocimiento es critica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer: encoder ViT + decoder Transformer de 1 capa con dos flujos (two-stream), modelado autoregresivo permutado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 32 x 128 px, salida de hasta 94 caracteres |
| Tipos de cuantizacion | fp32 (original), fp16 (portable y kernels), TensorRT fp16; no se documentan cuantizaciones int8/int4 |
| Idiomas soportados | no disponible; repertorio de 94 caracteres latinos (letras, digitos, puntuacion ASCII, sin espacio) |
| Licencia | codigo Apache-2.0; pesos sin licencia separada declarada por los autores (marcado como "see-model-card"); uso comercial asumido permitido |
| Formato de pesos | `.pt` (PyTorch); exportacion a ONNX y TensorRT documentada |
| Variantes | `parseq@1` (SHA-256 `bb5792a68e36...`), `parseq-tiny@1` (SHA-256 `e7a21b543c98...`) |
| Entrada | imagen RGB, cualquier H x W >= 32, con padding a multiplo de 32 |
| Salidas | `boxes` [N, 4, 2], `texts` [N], `scores` [N] |
| Backend | `portable` (unico disponible; no hay backend `kernels`) |

## Arquitectura y entrenamiento

PARSeq sigue el diseno del paper de Bautista y Atienza (ECCV 2022): un encoder ViT procesa el recorte de palabra normalizado a 32 x 128 pixeles y un decoder Transformer de una sola capa con dos flujos genera la secuencia de caracteres. El entrenamiento emplea modelado autoregresivo de secuencia permutada, una tecnica que permite al modelo aprender dependencias bidireccionales sin perder la capacidad de decodificar de izquierda a derecha. En inferencia se aplica decodificacion greedy autoregresiva seguida de una pasada de refinamiento, replicando el comportamiento de `read.py` del repositorio original.

La model card de `fastforks` no especifica el dataset exacto de los checkpoints publicados. El paper original indica que sus mejores modelos se entrenan sobre la union de datos reales compuesta por COCO-Text, RCTW17, Uber-Text, ArT, LSVT, MLT19, ReCTS, TextOCR y OpenVINO. No se documentan etapas de RLHF ni DPO, algo esperable en un modelo discriminativo de OCR. La innovacion tecnica del empaquetado `fastforks` es la reimplementacion `portable`, que replica el bucle de decodificacion de 26 pasos como un unico grafo CUDA y reduce la latencia sin alterar los logits ni el consumo de memoria.

## Capacidades

- Reconocimiento de texto en recortes de imagen: lee una palabra o linea corta por invocacion, hasta 94 caracteres del repertorio latino (letras, digitos, puntuacion ASCII, sin espacio).
- Deteccion de texto combinada: cuando se empareja con un detector (por ejemplo `ppocrv5-mobile`), devuelve cajas `[N, 4, 2]` en pixeles de entrada, el texto asociado y una confianza por linea.
- Orden de lectura: las lineas se devuelven en orden de lectura.
- Procesamiento de imagenes de alta resolucion: probado hasta 3000 x 4000 px con 0,3 GiB de memoria pico en fp16.
- Exportacion y aceleracion: soporte de ONNX y TensorRT fp16, ademas de `torch.compile`.
- Verificacion de integridad: los pesos descargados se validan contra el SHA-256 registrado en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking. Es exclusivamente un reconocedor de texto.

## Casos de uso

- Digitalizacion de recibos y facturas: el modelo lee cada linea recortada por un detector previo y devuelve texto y confianza por linea, lo que permite filtrar lineas de baja confianza para revision manual. Su latencia de 3,6 ms por recorte en `parseq` portable lo hace viable en lotes grandes.
- Lectura de matriculas y senalizacion: sobre recortes de 32 x 128 px obtenidos por un detector, el reconocimiento en 2,1 ms con `parseq-tiny` permite procesar flujos de video a decenas de fotogramas por segundo en una sola GPU consumer.
- Extraccion de texto en capturas de pantalla y documentos escaneados: combinado con un detector de cajas, procesa imagenes de hasta 3000 x 4000 px con 0,3 GiB de memoria pico, adecuado para pipelines por lotes en servidores modestos.
- Preprocesado para RAG documental: el OCR alimenta un pipeline de indexacion donde el texto extraido se trocea y se embebe; la salida estructurada `boxes`/`texts`/`scores` permite conservar la posicion de cada fragmento para trazabilidad.
- Automatizacion de entrada de datos en formularios: lectura de campos cortos (importes, fechas, identificadores) donde el repertorio ASCII del modelo cubre los caracteres habituales y la confianza por linea permite descartar lecturas dudosas.
- Despliegue en el borde con TensorRT: la exportacion a TensorRT fp16 reduce la inferencia a 1,67 ms por recorte en `parseq`, lo que permite integrar OCR en dispositivos con GPU dedicada y requisitos de latencia estrictos.
- Verificacion de calidad en pipelines OCR existentes: la paridad documentada (max |diff| <= 0,001 en CPU fp32 frente al codigo original) permite sustituir la implementacion de referencia por el backend `portable` sin recalibrar umbrales.

## Benchmarks y rendimiento

Rendimiento medido en una RTX 5060 Ti 16 GB (sm_120), entrada 32 x 128, fp16 salvo donde se indica fp32:

| Modelo | Implementacion | Tiempo (ms) | Memoria pico asignada / reservada (MiB) |
|---|---|---|---|
| `parseq` | original fp32 | 15,9 | 126 / 144 |
| `parseq` | original fp16 | 19,6 | 126 / 144 |
| `parseq` | portable | 3,62 | 79 / 100 |
| `parseq` | torch.compile | 8,80 | 111 / 118 |
| `parseq` | TensorRT fp16 | 1,67 | 148 / 168 (motor + torch) |
| `parseq-tiny` | original fp32 | 14,6 | 56 / 58 |
| `parseq-tiny` | original fp16 | 18,0 | 56 / 58 |
| `parseq-tiny` | portable | 2,10 | 44 / 54 |
| `parseq-tiny` | torch.compile | 8,09 | 76 / 94 |
| `parseq-tiny` | TensorRT fp16 | 1,68 | 80 / 88 (motor + torch) |

Arranque y primera llamada (32 x 128):

| Modelo | Carga original (s) | Carga portable (s) | Primera llamada original (s) | Primera llamada portable (s) |
|---|---|---|---|---|
| `parseq` | 0,53 | 1,44 | 1,04 | 0,26 |
| `parseq-tiny` | 0,34 | 0,74 | 0,95 | 0,20 |

Preparacion de aceleradores: `torch.compile` requiere 19,9 s (parseq) y 17,2 s (parseq-tiny) en la primera llamada en frio; la construccion de ONNX y motor TensorRT requiere 114 s y 96,8 s respectivamente.

Paridad con el codigo original: en CPU fp32, max |diff| <= 0,001; en GPU fp16, media |diff| <= 0,01 y p99 <= 0,01 sobre las cajas de salida. No se han publicado resultados de benchmarks de precision (accuracy de reconocimiento) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 79 MiB asignados / 100 MiB reservados para `parseq` portable a 32 x 128; 44 / 54 MiB para `parseq-tiny`. Con entradas de 3000 x 4000 px, 0,3 GiB de memoria pico en ambos casos.
- GPU recomendadas: cualquier GPU con soporte CUDA; las mediciones se realizaron en una RTX 5060 Ti 16 GB. Para TensorRT fp16 se requiere una GPU con soporte de Tensor Cores.
- Cabe en GPU consumer: si, con margen amplio; incluso GPUs de gama baja con 4 GB de VRAM son suficientes para el reconocedor.
- Opciones de despliegue: libreria `fastforks` (`pip install fastforks`), backend `portable` con grafo CUDA, `torch.compile`, exportacion a ONNX y TensorRT. No hay backend `kernels` para este modelo.
- Latencia y throughput: 3,62 ms por recorte con `parseq` portable y 2,10 ms con `parseq-tiny`; 1,67 ms y 1,68 ms con TensorRT fp16. El bucle de decodificacion de 26 pasos esta limitado por lanzamiento de kernels, no por computo, y el grafo CUDA lo reduce de 12,6 a 3,6 ms en `parseq` y de 11,6 a 2,1 ms en `parseq-tiny`.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Longitud de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fastforks/parseq` | Reconocedor ViT + decoder Transformer | 32 x 128 px (hasta 3000 x 4000) | 94 caracteres ASCII latinos | Codigo Apache-2.0; pesos sin licencia separada | Hugging Face (solo model card) y releases del autor |
| `fastforks/parseq-tiny` | Variante reducida del anterior | 32 x 128 px | 94 caracteres | idem | idem |
| `ppocrv5-mobile` (detector) | Detector de cajas de texto | imagen completa | cajas [N, 4, 2] | no disponible en esta ficha | referenciado como detector complementario |
| PARSeq original (`baudm/parseq`) | Implementacion de referencia | 32 x 128 px | 94 caracteres | Apache-2.0 (codigo) | GitHub y releases |

La comparativa se limita a las variantes del propio modelo y al detector complementario, ya que la informacion proporcionada no incluye datos de otros reconocedores como CRNN, TRBA o ABINet. No disponible comparativa de precision frente a alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente de reconocimiento: lee la imagen completa como una sola linea si no se empareja con un detector; no localiza texto por si mismo.
- Repertorio limitado a 94 caracteres ASCII latinos sin espacio; no cubre alfabetos no latinos, caracteres acentuados fuera de ASCII ni espacios entre palabras.
- Tier experimental segun la propia model card; no se recomienda como unico componente en produccion sin validacion previa.
- Licencia de pesos ambigua: los autores no declaran una licencia separada para los pesos; el uso comercial se asume permitido a partir de la licencia Apache-2.0 del codigo, pero debe verificarse antes de un despliegue comercial.
- La model card no especifica el dataset de entrenamiento de los checkpoints publicados; solo se conoce la union de datos reales del paper.
- Riesgo de alucinacion inherente a la decodificacion autoregresiva: el modelo puede generar caracteres plausibles en recortes de baja calidad; la confianza por linea (`scores`) debe usarse para filtrar.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; no es un modelo de proposito general.
- El backend `kernels` no esta disponible para este modelo; las optimizaciones se limitan a `portable`, `torch.compile`, ONNX y TensorRT.
- La carga en `portable` es mas lenta que la original (1,44 s frente a 0,53 s en `parseq`), lo que penaliza despliegues con arranques frecuentes.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/parseq
- Repositorio de la libreria fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Codigo original de PARSeq: https://github.com/baudm/parseq
- Commit fijado del codigo original: https://github.com/baudm/parseq/tree/1902db043c029a7e03a3818c616c06600af574be
- Licencia del codigo original: https://github.com/baudm/parseq/blob/1902db043c029a7e03a3818c616c06600af574be/LICENSE
- Pesos `parseq`: https://github.com/baudm/parseq/releases/download/v1.0.0/parseq-bb5792a6.pt
- Pesos `parseq-tiny`: https://github.com/baudm/parseq/releases/download/v1.0.0/parseq_tiny-e7a21b54.pt
- Metodologia de benchmarks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Fichero `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/ocr/models/parseq/card.toml
