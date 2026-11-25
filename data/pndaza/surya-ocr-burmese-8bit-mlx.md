# pndaza/surya-ocr-burmese-8bit-MLX

## Resumen

surya-ocr-burmese-8bit-MLX es un ajuste fino del modelo de OCR de documentos surya-ocr-2 de Datalab, especializado en birmano (Myanmar) y, en particular, en texto en pali (ပါဠိ) y en el estilo de comentario nissaya (နိဿယ), que combina texto pali con glosas en birmano y domina la imprenta religiosa birmana. El modelo lo publica el usuario pndaza y se distribuye en formato MLX cuantizado a 8 bits, pensado para servir en hardware Apple Silicon mediante la libreria mlx-vlm.

La arquitectura subyacente es la del modelo base (etiquetado como qwen3_5 en los tags del repositorio) con capacidades de vision, adaptada a una tarea de OCR de pagina completa que devuelve HTML con etiquetas `data-label` y `data-bbox` por bloque, es decir, el formato `high_accuracy_bbox` de surya. El repositorio pesa 0,8 GB y contiene 665.701.440 parametros segun los safetensors, con la LoRA de ajuste ya fusionada en los pesos, de modo que el modelo carga de forma autonoma sin necesidad de aplicar adaptadores.

Su relevancia es practica: el autor reporta una tasa de error de caracter (CER) de aproximadamente 0,2-0,5 % en un libro birmano no visto, frente al 1,9-2,9 % del surya-ocr-2 original, con un rendimiento de unos 260 tokens/s en decodificacion sobre chips de la serie M. Es, por tanto, una pieza muy especifica para digitalizacion de corpus birmanos y pali, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con vision (etiqueta qwen3_5 en los tags; base surya-ocr-2 de Datalab) |
| Parametros totales | 665.701.440 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); existe variante GGUF en repositorio aparte |
| Idiomas soportados | Birmano (Myanmar) y pali; no se detalla cobertura adicional |
| Licencia | OpenRAIL-M (modificada), heredada de surya-ocr-2 |
| Formato de pesos | safetensors (MLX), con LoRA de 41 MB en el subdirectorio `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de datalab-to/surya-ocr-2, un modelo de vision-lenguaje para OCR de documentos, y se ajusta mediante LoRA sobre la tarea concreta de OCR de pagina completa en birmano. La salida no es texto plano sino HTML estructurado: cada bloque detectado se emite como un `div` con `data-label` (tipo de bloque) y `data-bbox` (coordenadas x0 y0 x1 y1 normalizadas en el rango 0-1000), siguiendo el formato `high_accuracy_bbox` de surya. En este repositorio la LoRA ya esta fusionada en los pesos, y se conserva una copia del adaptador de 41 MB para quien quiera continuar el entrenamiento sobre el modelo base.

Los datos de entrenamiento combinan tres fuentes: el corpus pndaza/surya-ocr-burmese-books, con libros birmanos escaneados reales (sermones, textos pali y glosas nissaya) con ground truth revisado manualmente; el dataset freococo/myanmar_complex_document_layouts, con maquetaciones documentales complejas convertidas de forma automatica; y un corpus sintetico propio de paginas renderizadas con ocho fuentes birmanas y degradaciones de escaneo simuladas. Las paginas reservadas para evaluacion estan en los splits `validation` y `test` del dataset de entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion a 8 bits en MLX es la recomendada por el autor para servir el modelo: segun la model card, mantiene una CER identica a bf16 y acelera la decodificacion en torno a un 50 %.

## Capacidades

- OCR de pagina completa de documentos birmanos, con salida en HTML estructurado por bloques y coordenadas normalizadas.
- Reconocimiento especifico de texto pali y de glosas nissaya, un registro tipografico poco cubierto por modelos de OCR generalistas.
- Deteccion de maquetacion compleja (etiquetas por bloque y bounding boxes), lo que permite reconstruir la estructura del documento ademas del texto.
- Generacion determinista recomendada: el ejemplo de la model card usa `temperature=0.0` y hasta 4096 tokens de salida.
- Soporte de inferencia local en Apple Silicon mediante mlx-vlm (version 0.6 o superior), tanto en Python como con el servidor integrado.
- No se documentan capacidades de tool calling, agentes, audio ni modos de razonamiento extendido; el modelo esta orientado exclusivamente a OCR.

## Casos de uso

- Digitalizacion de corpus religiosos birmanos: el modelo esta entrenado sobre sermones, textos pali y nissaya, por lo que puede convertir paginas escaneadas de estas colecciones en HTML estructurado con bloques y coordenadas, reduciendo la revision manual frente al surya base.
- Preservacion digital en bibliotecas y archivos: la salida con `data-bbox` permite conservar la relacion entre texto y posicion en la pagina, util para visores de documentos y para auditoria de la transcripcion.
- Investigacion en filologia pali: la baja CER reportada en texto pali con glosas birmanas facilita crear ediciones buscables de comentarios nissaya que de otro modo requeririan transcripcion manual.
- Procesamiento local en portatiles Mac: al ejecutarse con mlx-vlm sobre chips de la serie M, permite montar un flujo de OCR sin enviar documentos a servicios externos, relevante para material con restricciones de difusion.
- Extraccion de texto para pipelines de busqueda: el HTML por bloques se puede parsear para indexar contenido en motores de busqueda o bases documentales, manteniendo la segmentacion original.
- Prototipado rapido en equipos pequenos: el servidor de mlx-vlm (`python -m mlx_vlm.server`) levanta una API local en un puerto concreto, lo que simplifica integrar el OCR en aplicaciones internas sin infraestructura de GPU dedicada.
- Conversion a otros entornos: para despliegues fuera de Apple Silicon existe la variante GGUF publicada por el mismo autor, pensada para llama.cpp.

## Benchmarks y rendimiento

La model card reporta CER sobre un libro birmano no visto (split de test del repositorio de datos de entrenamiento), con decodificacion greedy y 4096 tokens:

| Modelo | CER |
|---|---|
| surya-ocr-2 original | ~1,9-2,9 % |
| surya-ocr-burmese-8bit | ~0,2-0,5 % |

Rendimiento declarado: aproximadamente 260 tokens/s en decodificacion sobre chips de la serie M y unos 6,5 s por pagina completa densa de extremo a extremo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general en la informacion disponible, y no procede aplicarlos a un modelo de OCR.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 0,8 GB en 8 bits, por lo que la inferencia cabe holgadamente en la memoria unificada de cualquier Mac con 8 GB o mas.
- GPU recomendadas: chips de Apple Silicon de la serie M (requisito de facto por el uso de MLX); el autor reporta unos 260 tokens/s de decodificacion en esta familia.
- Cabe en GPU de consumo: si, en el ecosistema Apple Silicon. Para GPUs NVIDIA se deberia usar la variante GGUF con llama.cpp; no se proporcionan cifras de VRAM para ese caso.
- Opciones de despliegue: mlx-vlm 0.6 o superior (Python y servidor integrado); llama.cpp mediante la variante GGUF; no se mencionan vLLM ni TGI.
- Latencia: aproximadamente 6,5 s por pagina completa densa de extremo a extremo en hardware de la serie M, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (birmano, test reportado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| surya-ocr-burmese-8bit-MLX | 665.701.440 | no disponible | ~0,2-0,5 % | OpenRAIL-M modificada | MLX en Hugging Face; GGUF en repo aparte |
| datalab-to/surya-ocr-2 (base) | no disponible | no disponible | ~1,9-2,9 % | OpenRAIL-M modificada | Hugging Face |
| Otros modelos de OCR birmano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible con el modelo base, del que este ajuste mejora la CER en un orden de magnitud segun los datos del autor. No se dispone de informacion sobre alternativas especializadas en OCR birmano con las que contrastar.

## Limitaciones y advertencias

- El modelo esta especializado en birmano y pali; no se documenta su comportamiento en otros idiomas y probablemente degrade fuera de ese dominio.
- La evaluacion se limita a un unico libro no visto del split de test del propio corpus de entrenamiento; no hay validacion independiente con documentos de otras procedencias.
- Riesgo de alucinacion y de omision en paginas con degradaciones de escaneo no representadas en el corpus sintetico (ocho fuentes birmanas y degradaciones simuladas).
- La licencia OpenRAIL-M modificada heredada de surya restringe el uso: es libre para investigacion, uso personal y pequenas startups, pero el uso comercial mas amplio requiere una licencia de Datalab. Conviene revisar los terminos antes de integrarlo en un producto.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de una publicacion reciente sin validacion comunitaria.
- No se especifican la longitud de contexto, los idiomas soportados de forma oficial ni los detalles del entrenamiento (tokens, composicion, alineamiento), lo que dificulta estimar su robustez en produccion.
- El formato de salida es HTML con atributos concretos; los consumidores deben implementar un parser tolerante a variaciones y validar las coordenadas antes de usarlas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pndaza/surya-ocr-burmese-8bit-MLX
- Variante GGUF: https://huggingface.co/pndaza/surya-ocr-burmese-8bit-GGUF
- Modelo base: https://huggingface.co/datalab-to/surya-ocr-2
- Dataset de libros birmanos: https://huggingface.co/datasets/pndaza/surya-ocr-burmese-books
- Dataset de maquetaciones complejas: https://huggingface.co/datasets/freococo/myanmar_complex_document_layouts
