# atonlee/Qota-OCR

## Resumen

Qota-OCR es un modelo de reconocimiento de lineas de texto (text-line recognition) desarrollado por el usuario atonlee (JKLEE) y publicado en Hugging Face bajo licencia Apache 2.0. Resuelve un problema concreto y poco cubierto: documentos impresos en los que el coreano aparece mezclado con chino, japones e ingles en la misma linea, como ocurre en formularios y documentos publicos (`한국어(中文)`, `日本語(한국어)`). Tambien lee texto vertical coreano con espaciado entre palabras.

El modelo se entreno a partir de PP-OCRv6_small_rec anadiendo coreano al diccionario de salida, que pasa a tener 30.244 caracteres mas el espacio (los 18.708 de PP-OCRv6 mas 11.536 de Hangul y otros caracteres procedentes del diccionario de korean_PP-OCRv5_mobile_rec). La arquitectura es identica a la del modelo base: backbone PP-LCNetV4, encoder SVTR de 2 bloques con anchura 120 y cabeza CTC, con 6,7 millones de parametros.

Su relevancia actual esta en el nicho: es un modelo pequeno (26,8 MB en float32) que cubre cuatro idiomas en una sola pasada, funciona solo con onnxruntime en versiones cuantizadas y supera a alternativas especializadas cuando hay mezcla de escrituras. Es, en la practica, un componente de reconocimiento dentro de un pipeline OCR, no un sistema completo: necesita un detector de lineas previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-LCNetV4 (backbone) + encoder SVTR de 2 bloques, anchura 120, cabeza CTC |
| Parametros totales | 6.688.470 (6,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de reconocimiento de linea, no generativo); entrada de una linea recortada con altura 48 px y anchura de hasta 3.200 px |
| Tipos de cuantizacion | ONNX en float32, FP16, INT8 y UINT8; safetensors en float32 (PyTorch) |
| Idiomas soportados | coreano, chino, japones, ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers/PyTorch) y ONNX |

Datos adicionales de la model card: diccionario de salida de 30.244 caracteres mas espacio; `model.safetensors` ocupa 26,8 MB y `onnx/model.onnx` 26,7 MB, ambos en float32; las variantes FP16, INT8 y UINT8 de ONNX pesan entre 13,4 y 15,4 MB; el repositorio completo ocupa 0,1 GB. La entrada ONNX se espera en BGR, redimensionada a altura 48 manteniendo la relacion de aspecto (anchura 320-3.200, rellenada con 0) y escalada al rango [-1, 1].

## Arquitectura y entrenamiento

La arquitectura replica la de PP-OCRv6_small_rec: un backbone convolucional PP-LCNetV4, un encoder SVTR reducido a 2 bloques con anchura 120 y una cabeza CTC para la decodificacion de la secuencia de caracteres. El modelo trabaja sobre recortes de linea ya detectados, no sobre paginas completas. El cambio respecto al modelo base esta en la cabeza de clasificacion: el diccionario se amplia de 18.708 a 30.244 caracteres para incorporar Hangul y otros caracteres presentes en el diccionario de korean_PP-OCRv5_mobile_rec, lo que permite reconocer coreano sin sacrificar japones, chino e ingles.

La model card no detalla el volumen de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un reconocedor CTC). Si se indica que el modelo parte de PP-OCRv6_small_rec y que se reentreno anadiendo coreano, y que uso datasets de The Open AI Dataset Project (AI...) segun la seccion de atribucion de datos, que aparece truncada en la informacion disponible. La validacion publicada se hizo sobre SynthDoG (coreano, japones, ingles y chino) y sobre el split de test de OmniDocBench, siempre cambiando solo el reconocedor y manteniendo el mismo detector (`PP-OCRv6_small_det`) para todos los modelos excepto Nemotron OCR v2.

## Capacidades

- Reconocimiento de lineas de texto impreso con CTC en coreano, japones, ingles y chino, incluido el caso de mezcla de escrituras en una misma linea.
- Lectura de texto vertical coreano con espaciado entre palabras, rotando previamente las lineas con relacion altura/anchura mayor o igual a 1,5 unos 90 grados.
- Procesamiento de documentos publicos escaneados, formularios, libros e informes, segun los usos previstos declarados por el autor.
- Salida de secuencia de caracteres sobre un diccionario de 30.244 simbolos mas espacio.
- Inferencia sin GPU mediante ONNX Runtime en float32, FP16, INT8 o UINT8.
- Integracion en pipelines con un detector de lineas externo (por ejemplo, PP-OCRv6_small_det) y ordenacion de cajas de arriba a abajo para reconstruir la pagina.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo ni un agente.
- No dispone de modo thinking, ni capacidades de vision general, ni audio.

## Casos de uso

- Digitalizacion de documentos publicos coreanos con mezcla de idiomas: el modelo reconoce lineas del tipo `한국어(中文)` o `日本語(한국어)` con un F1 de caracteres de 0,976 en coreano y 0,977 en japones sobre SynthDoG, lo que permite procesar boletines, anuncios y formularios oficiales sin separar por idioma.
- Archivo y cumplimiento normativo en administraciones: al funcionar sobre ONNX Runtime en INT8 o UINT8 (15,3 y 15,4 MB), se puede desplegar en servidores sin GPU o en entornos on-premise donde los documentos no pueden salir de la organizacion.
- Indexado y busqueda documental sobre corpus historicos coreanos: combinado con un detector, permite extraer texto linea a linea para alimentar indices de busqueda o pipelines de RAG, incluyendo documentos con texto vertical.
- Preprocesado para traduccion automatica: al unificar cuatro idiomas en un unico reconocedor, la salida se puede enviar directamente a un traductor sin enrutar por idioma, simplificando el pipeline.
- Lectura de libros y publicaciones academicas con material CJK: el modelo cubre chino simplificado y tradicional (NED de 0,048 y 0,091 en OmniDocBench) junto con ingles (0,025), lo que lo hace util en bibliotecas digitales mixtas.
- Procesamiento por lotes de formularios y actas escaneadas: el recorte por linea y la altura fija de 48 px permiten construir lotes homogeneos y paralelizar la inferencia en CPU con ONNX.
- Extraccion de texto en aplicaciones moviles o de borde: con pesos de 13,4 MB en FP16 y una ventana de entrada de 48 px de alto, el modelo cabe en dispositivos con recursos limitados, siempre acompanado de un detector ligero.
- Generacion de capas de texto en visores de documentos: la decodificacion CTC posicion a posicion devuelve la secuencia de la linea, lo que sirve para superponer texto seleccionable sobre imagenes escaneadas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card.

SynthDoG, F1 de caracteres (independiente del orden, page_avg; mayor es mejor):

| Modelo | Coreano | Japones | Ingles | Chino |
|---|---:|---:|---:|---:|
| Qota-OCR | 0,976 | 0,977 | 0,991 | 0,964 |
| Nemotron OCR v2 (multilingue) | 0,945 | 0,959 | 0,953 | 0,943 |
| PP-OCRv6_small_rec | 0,107 | 0,971 | 0,992 | 0,973 |
| PP-OCRv5_server_rec | 0,118 | 0,926 | 0,986 | 0,960 |
| korean_PP-OCRv5_mobile_rec | 0,962 | 0,117 | 0,989 | 0,179 |

OmniDocBench, split de test, NED (sample_avg; menor es mejor). El numero de bloques evaluados aparece entre parentesis:

| Modelo | Ingles (7.837) | Chino (9.374) | Mixto ingles-chino (1.458) | Chino tradicional (83) |
|---|---:|---:|---:|---:|
| Qota-OCR | 0,025 | 0,048 | 0,068 | 0,091 |
| PP-OCRv6_small_rec | 0,022 | 0,040 | 0,035 | 0,034 |
| PP-OCRv5_server_rec | 0,028 | 0,045 | 0,058 | 0,055 |
| korean_PP-OCRv5_mobile_rec | 0,031 | 0,803 | 0,376 | 0,885 |

Fidelidad de las cuantizaciones ONNX, medida sobre 29 lineas (coincidencia de texto con la salida float32):

| Fichero | Tamano | Lineas identicas a float32 (de 29) |
|---|---:|---:|
| `onnx/model.onnx` (float32) | 26,7 MB | 29 |
| `onnx/model_fp16.onnx` | 13,4 MB | 28 |
| `onnx/model_int8.onnx` | 15,3 MB | 27 |
| `onnx/model_uint8.onnx` | 15,4 MB | 26 |

El autor indica que INT8 y UINT8 solo cuantizan las capas MatMul con pesos y mantienen las convoluciones en float32, y que esta comparativa de 29 lineas no equivale a los conjuntos de test completos. No se han publicado datos de velocidad (latencia o throughput) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 26,8 MB en float32, 13,4 MB en FP16 y 15,3-15,4 MB en INT8/UINT8. Sumando activaciones para una linea de hasta 3.200 x 48 px, el consumo total se mantiene muy por debajo de 1 GB en cualquier configuracion habitual (estimacion derivada del tamano de los pesos, no una medicion publicada).
- GPU recomendadas: cualquier GPU con 2 GB o mas es mas que suficiente; el modelo esta sobredimensionado respecto al hardware disponible en la mayoria de GPU modernas (A100, H100, RTX 4090 son innecesarias para este componente).
- GPU consumer: si, cabe en cualquier GPU de consumo e incluso en GPUs integradas. Tambien es viable la inferencia en CPU usando las variantes ONNX, y en dispositivos de borde por el reducido tamano de los pesos.
- Opciones de despliegue: transformers (PyTorch) con `AutoModelForTextRecognition` y `transformers>=5.17`, mas torch, torchvision, pillow, opencv-python-headless y huggingface_hub; alternativamente, onnxruntime con los ficheros de `onnx/`. La arquitectura procede de PaddlePaddle/PP-OCR. vLLM, TGI, llama.cpp y Ollama no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Unicamente se publica la fidelidad de las cuantizaciones sobre 29 lineas, no tiempos de ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto/entrada | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qota-OCR | 6,7 M | ko, zh, ja, en | linea de 48 px de alto, hasta 3.200 px de ancho | SynthDoG F1: 0,976 ko / 0,977 ja / 0,991 en / 0,964 zh | apache-2.0 | Hugging Face; safetensors y ONNX (fp32, FP16, INT8, UINT8) |
| PP-OCRv6_small_rec | no disponible en la informacion proporcionada | zh, ja, en (sin coreano) | linea recortada | SynthDoG F1: 0,107 ko / 0,971 ja / 0,992 en / 0,973 zh; mejor NED en OmniDocBench que Qota-OCR | no disponible en la informacion proporcionada | Hugging Face (PaddlePaddle) |
| korean_PP-OCRv5_mobile_rec | no disponible en la informacion proporcionada | ko, en (practicamente sin ja ni zh) | linea recortada | SynthDoG F1: 0,962 ko / 0,117 ja / 0,989 en / 0,179 zh | no disponible en la informacion proporcionada | Hugging Face (PaddlePaddle) |
| PP-OCRv5_server_rec | no disponible en la informacion proporcionada | zh, ja, en | linea recortada | SynthDoG F1: 0,118 ko / 0,926 ja / 0,986 en / 0,960 zh | no disponible en la informacion proporcionada | Hugging Face (PaddlePaddle) |
| Nemotron OCR v2 (multilingue) | no disponible en la informacion proporcionada | multilingue | deteccion y reconocimiento propios | SynthDoG F1: 0,945 ko / 0,959 ja / 0,953 en / 0,943 zh | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Requiere un detector de lineas previo: el modelo solo reconoce recortes de una linea, por lo que no sirve por si solo para digitalizar una pagina completa.
- Debilidad en simbolos matematicos y letras griegas, segun el propio autor; no es adecuado para formulas.
- Sin mediciones en recibos, fotografias, escritura a mano ni lineas largas: el rendimiento en esos dominios es desconocido.
- Las lineas verticales deben rotarse manualmente unos 90 grados antes de la inferencia (relacion altura/anchura mayor o igual a 1,5); el modelo no detecta la orientacion.
- Las lineas de mas de 25 caracteres se leen, pero no se midieron de forma separada.
- Compromiso de rendimiento: al anadir coreano, el NED en OmniDocBench en ingles (0,025 frente a 0,022) y en chino (0,048 frente a 0,040) es ligeramente peor que el de PP-OCRv6_small_rec. La ganancia esta en coreano, no en el resto.
- Riesgo de sustitucion de caracteres: aunque un CTC no genera texto libre y por tanto no alucina en el sentido de un LLM, si puede producir caracteres erroneos en lineas de baja calidad o con tipografias no vistas.
- Sesgo de dominio hacia documentos impresos de Asia Oriental; no hay garantia sobre otras escrituras (cirilico, arabe, devanagari, etc.).
- Licencia Apache 2.0, que permite uso comercial con atribucion y sin obligacion de liberar derivados, pero la model card incluye una seccion de atribucion a The Open AI Dataset Project que aparece truncada: conviene verificar las condiciones de los datasets antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes, y la fecha de creacion registrada es 2026-09-29: se trata de un modelo reciente y con muy poca validacion independiente por terceros.
- La variante UINT8 mantiene 26 de 29 lineas identicas a float32 en la prueba del autor, por lo que la cuantizacion agresiva introduce cambios en algunas lineas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atonlee/Qota-OCR
- Modelo base: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_rec
- Detector de lineas usado en los ejemplos: https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_safetensors
- Perfil del autor (atonlee / JKLEE): https://huggingface.co/atonlee/models
- Omnidocbench (benchmark citado en la model card): no disponible en la informacion proporcionada
- SynthDoG (dataset de evaluacion citado): no disponible en la informacion proporcionada
- The Open AI Dataset Project (atribucion de datos, referencia truncada en la model card): no disponible en la informacion proporcionada
- OCR Arena, leaderboard de modelos OCR (referencia de contexto): https://www.ocrarena.ai/leaderboard
- OCRBench V2 Leaderboard & Scores, septiembre de 2026 (referencia de contexto): https://benchlm.ai/benchmarks/ocrbenchv2
- Best LLM for OCR (2026), analisis comparativo de modelos OCR (referencia de contexto): https://ofox.ai/blog/best-ai-model-for-ocr-2026/
- Calendario de lanzamientos de modelos de IA (referencia de contexto): https://www.scriptbyai.com/ai-model-release-calendar/
