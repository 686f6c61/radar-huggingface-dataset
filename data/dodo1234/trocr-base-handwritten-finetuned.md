# dodo1234/trocr-base-handwritten-finetuned

## Resumen

trocr-base-handwritten-finetuned es un ajuste fino del modelo microsoft/trocr-base-stage1 publicado por el usuario dodo1234 en HuggingFace. Se trata de un modelo de reconocimiento optico de caracteres (OCR) especializado en escritura manuscrita y orientado a una unica tarea: convertir la imagen de una linea de texto manuscrito en su transcripcion textual. La arquitectura es un VisionEncoderDecoderModel clasico de la familia TrOCR, con un codificador de vision tipo ViT y un decodificador transformer autorregresivo, y cuenta con 384.864.769 parametros en formato safetensors (1,5 GB de repositorio).

El modelo esta entrenado exclusivamente para frances (idioma declarado en la model card) y se distribuye bajo licencia MIT. El ajuste se realizo sobre microsoft/trocr-base-stage1 con batch size 8, precision fp16 y Seq2SeqTrainer, es decir, un entrenamiento ligero sin datos publicados sobre el volumen o la composicion del corpus utilizado. El repositorio apenas tiene descargas ni interacciones, lo que sugiere que es un experimento academico o personal mas que un artefacto listo para produccion.

Su relevancia practica es limitada pero informativa: los resultados declarados por el propio autor en un conjunto de test de 778 ejemplos son un CER del 50,15 %, un WER del 94,96 % y un 0,00 % de coincidencia exacta. Estos numeros indican que el modelo acierta aproximadamente la mitad de los caracteres y practicamente nunca reproduce una linea completa de forma correcta, por lo que debe considerarse un punto de partida para experimentacion o para aprender a ajustar TrOCR, no una solucion OCR desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (codificador de vision ViT + decodificador transformer autorregresivo con atencion cruzada), familia TrOCR |
| Parametros totales | 384.864.769 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la configuracion estandar de TrOCR limita la secuencia de salida a 512 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay versiones GGUF, int8 ni int4 oficiales) |
| Idiomas soportados | frances (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | microsoft/trocr-base-stage1 |
| Pipeline | image-to-text |
| Tamano del repositorio | 1,5 GB |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR: un codificador de vision transformer que procesa la imagen de la linea manuscrita (redimensionada y normalizada por el TrOCRProcessor a 384x384 pixeles) y genera una secuencia de representaciones visuales; un decodificador transformer autorregresivo con atencion cruzada sobre esas representaciones produce los tokens de texto. El conjunto completo se empaqueta como VisionEncoderDecoderModel, por lo que la inferencia se realiza con `model.generate(pixel_values)` y se decodifica con el tokenizador del procesador. No es un modelo MoE ni hibrido con SSM: es un transformer encoder-decoder puro.

La informacion de entrenamiento publicada es minima: se parte de microsoft/trocr-base-stage1, se ajusta con batch size 8, precision fp16 y Seq2SeqTrainer. No se indica el numero de tokens, el tamano del dataset, su procedencia, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones (no aplica en OCR). Tampoco se documentan tecnicas de decodificacion especulativa ni optimizaciones de atencion. El resultado declarado en 778 ejemplos de test (CER 50,15 %, WER 94,96 %, exact match 0,00 %) apunta a un ajuste corto o sobre datos con una distribucion muy alejada del test, mas que a un fallo de la arquitectura base.

## Capacidades

- Reconocimiento de escritura manuscrita en frances a nivel de linea de texto (entrada: imagen RGB, salida: cadena de texto).
- Transcripcion de texto impreso como caso degenerado de la misma tarea image-to-text, aunque el ajuste esta orientado a manuscrito.
- Procesamiento de imagenes con el preprocesado estandar de TrOCR (redimensionado a 384x384 y normalizacion con los valores del procesador).
- Generacion de texto autorregresiva con los modos habituales de `generate()` (greedy, beam search, restricciones de longitud).
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso; es un modelo puramente perceptivo y de transcripcion.
- No ofrece modo de pensamiento (thinking mode), vision mas alla de OCR, audio ni generacion de imagenes.
- Multilingue: no. Solo frances segun la model card; el rendimiento en otros idiomas no esta documentado.

## Casos de uso

- Punto de partida para ajuste fino propio: con 384,8 millones de parametros y pesos en safetensors, el reentrenamiento completo cabe en una sola GPU de consumo (por ejemplo, una RTX 3090 o 4090 con fp16), lo que lo hace util como plantilla para adaptar TrOCR a un corpus manuscrito propio en frances.
- Investigacion sobre preprocesado y segmentacion de lineas: dado el CER del 50,15 %, resulta adecuado para aislar si el cuello de botella esta en el recorte de lineas, en el contraste o en la resolucion de entrada, comparando variantes de preprocesado sobre el mismo modelo.
- Baseline negativo en evaluaciones de OCR: sirve como referencia inferior documentada frente a la que medir otras soluciones (TrOCR base original, TrOCR large, Tesseract) en un corpus manuscrito frances concreto.
- Docencia y prototipado con Transformers: es un ejemplo compacto y ejecutable de VisionEncoderDecoderModel con TrOCRProcessor, util para explicar el flujo imagen-a-texto completo en un entorno de aula o de tutorial.
- Analisis de errores y anotacion asistida: con una tasa de acierto baja, el modelo puede emplearse para generar hipotesis iniciales que un revisor humano corrige, midiendo el coste real de revision frente a la transcripcion manual.
- Despliegue en CPU o entornos sin GPU para pruebas de concepto: en fp32 ocupa aproximadamente 1,54 GB de pesos, de modo que puede ejecutarse en CPU con PyTorch u ONNX Runtime para validar un flujo de trabajo antes de invertir en hardware.
- Digitalizacion de formularios franceses con revision humana obligatoria: solo tiene sentido en un pipeline con umbral de confianza, correccion manual y metrica de exact match monitorizada, dado que el 0,00 % de coincidencias exactas invalida cualquier uso desatendido.

## Benchmarks y rendimiento

Resultados declarados por el autor en su conjunto de test de 778 ejemplos:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 50,15 % |
| WER (Word Error Rate) | 94,96 % |
| Exact match | 0,00 % |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de comparativas con otros modelos sobre el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,54 GB en fp32, 0,77 GB en fp16 o bf16, 0,39 GB en int8 y 0,19 GB en int4 (estimaciones calculadas a partir de los 384,8 millones de parametros; el modelo no publica cuantizaciones oficiales).
- Con el preprocesado a 384x384 y batch pequeno, el consumo total en fp16 se situa en el entorno de 1,5 a 2,5 GB de VRAM, incluyendo activaciones y buffers.
- GPU recomendadas: cualquiera con al menos 4 GB de VRAM. Funciona sin problemas en RTX 3060, RTX 3070, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100; en estas ultimas el factor limitante sera la latencia de host y no la memoria.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650 de 4 GB o RTX 3050 de 8 GB en fp16.
- Opciones de despliegue: PyTorch con Transformers (`VisionEncoderDecoderModel.from_pretrained`), exportacion a ONNX Runtime para CPU, TorchScript y Hugging Face Inference Endpoints. vLLM, llama.cpp, Ollama y TGI no soportan de forma directa esta arquitectura de encoder-decoder de vision, por lo que no son opciones viables sin trabajo adicional de conversion.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.

## Comparativa con modelos similares

Los datos de los modelos comparables no se incluyen en la informacion proporcionada; los campos no verificables se marcan como no disponibles. La comparacion se limita a la categoria (OCR manuscrito con TrOCR) y al linaje declarado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dodo1234/trocr-base-handwritten-finetuned | 384.864.769 | no disponible | CER 50,15 %, WER 94,96 %, exact match 0,00 % (778 ejemplos) | MIT | HuggingFace, 0 descargas |
| microsoft/trocr-base-handwritten | no disponible | no disponible | no disponible en la informacion proporcionada | MIT | HuggingFace (referencia de la familia) |
| microsoft/trocr-large-handwritten | no disponible | no disponible | no disponible en la informacion proporcionada | MIT | HuggingFace (referencia de la familia) |
| microsoft/trocr-base-stage1 | no disponible | no disponible | no disponible (es la etapa de preentrenamiento, no un modelo OCR final) | MIT | HuggingFace, es el modelo base de este ajuste |

## Limitaciones y advertencias

- Rendimiento muy bajo declarado por el propio autor: CER del 50,15 %, WER del 94,96 % y 0,00 % de coincidencias exactas sobre 778 ejemplos. En la practica, no transcribe correctamente lineas completas y no es apto para uso desatendido.
- Riesgo elevado de alucinacion en el decodificador: al ser un modelo autorregresivo con un ajuste debil, puede generar secuencias plausibles pero no presentes en la imagen, especialmente en lineas con ruido, manchas o caligrafia atipica.
- Cobertura idiomatica limitada al frances. No hay evidencia de funcionamiento en castellano ni en otros idiomas, y el vocabulario del tokenizador condiciona la salida.
- La entrada es a nivel de linea, no de pagina completa: requiere un paso previo de deteccion y segmentacion de lineas cuyo error se suma al del modelo.
- No se documentan sesgos especificos, pero al no publicarse la composicion del dataset de ajuste no es posible evaluar sesgos de caligrafia, genero, origen o registro, ni la representatividad de los estilos manuscritos cubiertos.
- La licencia MIT permite uso comercial y modificacion sin restricciones practicas, pero la licencia no garantiza la calidad del modelo; el riesgo comercial recae en el integrador.
- Riesgo de sobreajuste al formato de test: el propio autor reporta 0,00 % de exact match, lo que sugiere que el modelo no ha aprendido la distribucion objetivo ni siquiera en el conjunto de evaluacion.
- Al no publicarse cuantizaciones oficiales ni configuracion de generacion (longitud maxima, beam search, restricciones), reproducir exactamente los resultados citados exigiria reconstruir el pipeline de evaluacion.
- Repositorio sin descargas ni interacciones: no hay evidencia de validacion independiente por parte de la comunidad.
- La fecha de creacion y actualizacion del repositorio (16 de septiembre de 2026) no permite contrastar un historial de versiones: se trata de un unico commit sin trazabilidad de cambios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dodo1234/trocr-base-handwritten-finetuned
- Modelo base: https://huggingface.co/microsoft/trocr-base-stage1
- Paper de la arquitectura TrOCR (referencia general de la familia, no citado en la informacion proporcionada): https://arxiv.org/abs/2109.10282
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos correspondian a paginas corporativas de Credit Agricole y no guardan relacion con el modelo.
