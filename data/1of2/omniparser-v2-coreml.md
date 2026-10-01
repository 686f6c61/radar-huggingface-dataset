# 1of2/omniparser-v2-coreml

## Resumen

OmniParser v2 for Core ML es la conversion a Core ML del pipeline OmniParser v2 de Microsoft, publicada por el usuario 1of2, que permite ejecutar el parseo de pantalla integramente en la Apple Neural Engine (ANE) de los chips Apple Silicon. El sistema recibe una captura de pantalla y devuelve los elementos interactivos detectados (botones, iconos, campos) junto con una descripcion funcional corta de cada uno, de modo que un agente de GUI pueda referirse y actuar sobre elementos concretos en lugar de operar pixel a pixel.

El paquete combina dos modelos: un detector `icon_detect_v3` basado en YOLOv9-E y un captioner derivado del fine-tune de OmniParser v2 sobre Florence-2-base, este ultimo desdoblado en un grafo de encoder (DaViT vision + BART encoder) y un grafo de decoder. La conversion garantiza que toda operacion ejecutable en los tres grafos esta planificada para la Neural Engine, sin fallbacks a CPU ni GPU. El repositorio ocupa 0,7 GB e incluye pesos en fp16, el tokenizador BART y un fichero `runtime_config.json` con todas las formas, umbrales y ajustes de generacion.

Es relevante ahora porque lleva el parseo de pantalla de OmniParser v2 a un escenario de inferencia local en macOS sobre hardware de consumo, con licencia MIT tanto en el detector como en el captioner, lo que facilita integrarlo en agentes de escritorio sin depender de servicios en la nube ni de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos etapas: detector YOLOv9-E (CNN de deteccion de objetos) + captioner transformer encoder-decoder (vision DaViT + BART) derivado de Florence-2-base |
| Parametros totales | no disponible (el captioner procede de Florence-2-base, ~0,23 B de parametros; el detector YOLOv9-E no declara recuento en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en sentido tradicional; el decoder usa un prefijo fijo de 20 tokens y genera como maximo 20 tokens nuevos |
| Tipos de cuantizacion | fp16 (pesos y activaciones) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Core ML (`.mlpackage`) y tabla de embeddings en `.npy` fp16 |

## Arquitectura y entrenamiento

El pipeline tiene dos componentes diferenciados. El detector, `IconDetectV3.mlpackage`, es un paquete multifuncion con dos variantes: `detect_640` (entrada fp16 [1, 3, 640, 640], salida [1, 5, 8400]) y `detect_1280` (entrada fp16 [1, 3, 1280, 1280], salida [1, 5, 33600]). El preprocesado hace letterboxing a cuadrado centrado con valor de pad 114 y remuestreo Lanczos; cada ancla lleva una unica puntuacion de clase y una caja en unidades de rejilla. El postprocesado aplica umbral de confianza 0,05, supresion de no maximos con IoU 0,1, un maximo de 300 detecciones y fusiona cajas con solapamiento superior a IoU 0,7 para que cada elemento aparezca una sola vez. Es el checkpoint `icon_detect_v3` (YOLOv9-E) con licencia MIT.

El captioner (`FlorenceEncoderContextEmbeds.mlpackage` y `FlorenceDecoderPrefixEmbeds.mlpackage`) es el fine-tune de OmniParser v2 sobre Florence-2-base, dividido en encoder y decoder. Cada elemento detectado se recorta, se redimensiona a 64x64 y luego se procesa como entrada de Florence-2-base: escalado a 768x768, reescalado 1/255 y normalizacion con media ImageNet `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`. El encoder toma `pixel_values` fp16 [1, 3, 768, 768] y `prompt_embeds` fp16 [1, 8, 768] y produce `encoder_hidden_states` [1, 585, 768]. El decoder toma `decoder_inputs_embeds` fp16 [1, 20, 768] y `encoder_hidden_states` y emite `logits` [1, 20, 51289]. El prompt es `<CAPTION>`, tokenizado a `[0, 2264, 473, 5, 2274, 6190, 116, 2]`. La generacion es greedy sobre un prefijo fijo de 20 tokens, con token de inicio 2, BOS forzado 0, EOS y EOS forzado 2, pad 1, sin 3-gramas repetidos y un maximo de 20 tokens nuevos. No se detalla en la informacion disponible la composicion del dataset de entrenamiento ni si hubo RLHF o DPO en el fine-tune original. La innovacion practica de esta publicacion es la conversion completa a Core ML con planificacion de todas las operaciones sobre la Neural Engine.

## Capacidades

- Deteccion de elementos interactivos de interfaz en capturas de pantalla (botones, iconos, campos).
- Dos resoluciones de deteccion: 640x640 para ventanas habituales y 1280x1280 para pantallas densas o de alta resolucion.
- Descripcion funcional corta de cada elemento detectado mediante captioning guiado por el prompt `<CAPTION>`.
- Integracion orientada a agentes de GUI: permite actuar por elemento en lugar de por pixel.
- Ejecucion local en la Apple Neural Engine, sin fallbacks a CPU ni GPU.
- Multilingue: no disponible (no se declaran idiomas soportados).
- Tool calling / function calling: no disponible (el modelo no expone esa capacidad en la informacion proporcionada).
- Vision: si, es un modelo puramente visual sobre imagenes de pantalla.
- Capacidades especiales adicionales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Automatizacion de escritorio macOS: un agente captura la pantalla, usa el detector para localizar botones y campos, y el captioner para saber que hace cada control, permitiendo secuencias de clics fiables sobre elementos semanticos.
- Pruebas de interfaz automatizadas (UI testing): el detector localiza los controles y el captioner verifica que existan y cumplan la funcion esperada en cada version de la aplicacion, sobre la Neural Engine sin GPU dedicada.
- Asistentes de accesibilidad: dada una captura, se generan etiquetas funcionales ("cerrar ventana", "ajustes") de los elementos, utiles para describir la pantalla a un usuario con discapacidad visual.
- Agentes RPA locales: la ejecucion en ANE y la licencia MIT permiten empaquetar la automatizacion dentro de una app macOS de escritorio sin enviar capturas a la nube.
- Indexacion y comprension de interfaces para documentacion: procesar capturas de una aplicacion y extraer un inventario estructurado de elementos interactivos con su descripcion.
- Complemento de pipelines multimodales: combinar la deteccion de elementos con un modelo de lenguaje que decida la siguiente accion, usando los bounding boxes y las etiquetas como entrada estructurada.
- Deteccion en pantallas densas o de alta resolucion: con `detect_1280` se manejan interfaces con muchos controles pequenos, a costa de mayor coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni equivalentes, y solo menciona un objetivo de paridad cualitativa con el pipeline de PyTorch original en tres puntos: los pixeles de entrada del detector, las cajas decodificadas y el texto de los caption. No se aportan numeros de precision (mAP) ni de latencia.

## Requisitos de hardware

- Plataforma: macOS 15 o posterior sobre Apple Silicon; el modelo esta planificado integramente sobre la Apple Neural Engine.
- Espacio en disco: 0,7 GB para el repositorio completo (detector 117 MB, encoder 270 MB, decoder 192 MB, embeddings 79 MB, tokenizador 2,5 MB).
- VRAM: no aplica; el uso es de memoria unificada del sistema en Apple Silicon, no se publican cifras concretas.
- GPU recomendadas: no aplica; el objetivo es la Neural Engine de Apple Silicon (segun la model card, cero fallbacks a CPU o GPU).
- Compatibilidad con GPU de consumo tipo RTX 4090 o A100/H100: no soportada por este paquete Core ML.
- Opciones de despliegue: exclusivamente Core ML; no se contemplan vLLM, llama.cpp, Ollama ni TGI para esta conversion.
- Requisito operativo: Core ML debe poder escribir su cache de usuario, ya que la primera carga compila los paquetes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Formato | Plataforma objetivo | Licencia |
|---|---|---|---|---|---|
| 1of2/omniparser-v2-coreml | Detector + captioner de GUI | no disponible (captioner ~0,23 B) | Core ML (.mlpackage), fp16 | Apple Neural Engine (macOS 15+, Apple Silicon) | MIT |
| microsoft/OmniParser-v2.0 | Detector + captioner de GUI | no disponible | PyTorch | GPU generica (CUDA) | MIT |
| microsoft/Florence-2-base | Vision-language base | ~0,23 B | safetensors / PyTorch | GPU generica | MIT |

No se dispone en la informacion proporcionada de otros conversores Core ML de OmniParser ni de cifras de rendimiento que permitan una comparacion numerica; la diferencia principal frente al OmniParser v2 original es el formato y la plataforma de ejecucion, no el modelo subyacente.

## Limitaciones y advertencias

- Los caption son descripciones funcionales cortas ("settings", "close window"), no frases completas.
- Estos modelos no leen el texto en pantalla; hay que combinarlos con un motor de OCR para etiquetas y contenido.
- Entrenados mayoritariamente sobre interfaces de escritorio y web; las interfaces poco habituales o dibujadas a mano se detectan con menos fiabilidad.
- Dependencia estricta del entorno: requiere macOS 15 o posterior y Apple Silicon, y Core ML necesita poder escribir su cache de usuario para compilar los paquetes.
- Posible deriva respecto al pipeline original: los pesos y activaciones en fp16 pueden alterar una deteccion limite o cambiar un token del caption en casos poco frecuentes.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; el captioning es acotado a descripciones cortas de cada recorte, lo que limita la generacion libre pero no elimina posibles descripciones incorrectas.
- Restricciones de licencia: el paquete y ambos componentes se distribuyen bajo MIT, lo que permite uso comercial; conviene verificar los ficheros `models/*/LICENSE` incluidos.
- Para produccion: la generacion del decoder usa un prefijo fijo de 20 tokens y greedy decoding, por lo que no hay decodificacion especulativa ni generacion de longitud variable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1of2/omniparser-v2-coreml
- Modelo base OmniParser v2: https://huggingface.co/microsoft/OmniParser-v2.0
- Modelo base Florence-2-base: https://huggingface.co/microsoft/Florence-2-base
- Paper OmniParser (arXiv): https://arxiv.org/abs/2408.00203
- Paper OmniParser (eprint): https://arxiv.org/abs/2408.00203 (referencia `2408.00203` de la model card)
