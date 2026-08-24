# mlboydaisuke/Florence-2-large-ExecuTorch

## Resumen

Florence-2-large-ExecuTorch es una conversión del modelo Florence-2-large de Microsoft al formato ExecuTorch, pensada para ejecución on-device en dispositivos móviles y edge. El autor, mlboydaisuke, ha dividido el modelo en tres archivos `.pte` (vision, encoder y decoder) que pueden combinarse entre sí, siguiendo el mismo esquema que su versión base. Con 0,77 mil millones de parámetros, ofrece capacidades de captioning, detección de objetos, OCR y grounding de frases mediante prompts de texto, todo en un único conjunto de pesos.

La relevancia de este modelo radica en que permite ejecutar un modelo de visión-lenguaje de tamaño medio en hardware sin GPU dedicada, con tiempos de inferencia razonables en Mac arm64 (un caption de 15 tokens tarda unos 2,2 segundos en la versión fp32 y 0,49 segundos en la versión Core ML). La conversión reproduce exactamente las salidas del modelo original en PyTorch eager, con una diferencia máxima absoluta de 0,0 en los logits, lo que garantiza fidelidad total.

El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integración en aplicaciones propietarias. Está diseñado para tareas de visión por computadora y visión-lenguaje, y su interfaz es idéntica a la de Florence-2-base-ExecuTorch, pero con mayor capacidad de detalle en las descripciones generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Florence-2 (encoder de vision DaViT + encoder de texto + decoder transformer) |
| Parametros totales | 0,77 B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Decoder: ventana fija de 128 tokens; encoder: 577 tokens de imagen + 32 tokens de texto |
| Tipos de cuantizacion | fp32 (XNNPACK) y Core ML (iOS, precision no especificada) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | .pte (ExecuTorch); safetensors en el modelo base |

## Arquitectura y entrenamiento

Florence-2-large es un modelo de vision-lenguaje desarrollado por Microsoft que unifica multiples tareas de vision mediante un enfoque basado en prompts. La arquitectura consta de un encoder de vision DaViT que procesa imagenes de 768x768 píxeles, un encoder de texto que tokeniza el prompt (con un maximo de 32 tokens) y un decoder autoregresivo que genera la respuesta. En esta conversion a ExecuTorch, los tres componentes se compilan por separado en archivos `.pte`, de modo que la vision y el encoder se ejecutan una vez por imagen, mientras que el decoder se ejecuta una vez por token generado.

El modelo original fue preentrenado con un corpus extenso de datos de imagen-texto y ajustado para tareas como captioning, deteccion de objetos, OCR y grounding. La conversion no modifica los pesos ni la arquitectura; simplemente los compila para ejecucion eficiente en dispositivos con XNNPACK (CPU) o Core ML (iOS). La model card indica que la composicion de los tres archivos reproduce exactamente el comportamiento de `Florence2ForConditionalGeneration`, con una diferencia maxima absoluta de 0,0 en los logits.

Una innovacion destacable es la gestion de los tokens de imagen: el encoder concatena las features de vision delante de las embeddings de texto, en lugar de dispersarlas en posiciones placeholder, lo que simplifica el grafo y reduce la complejidad. Ademas, el decoder utiliza una ventana fija de 128 tokens, lo que hace que el coste por paso sea constante independientemente de la posicion del token.

## Capacidades

- Generacion de descripciones de imagenes (captioning) en varios niveles de detalle: `<CAPTION>`, `<DETAILED_CAPTION>` y `<MORE_DETAILED_CAPTION>`.
- Deteccion de objetos con categorias: `<OD>` devuelve cajas delimitadoras con nombres de clase.
- Deteccion de regiones con descripciones: `<DENSE_REGION_CAPTION>` y `<REGION_PROPOSAL>`.
- Reconocimiento de texto en imagenes (OCR) con y sin regiones: `<OCR>` y `<OCR_WITH_REGION>`.
- Grounding de frases: `<CAPTION_TO_PHRASE_GROUNDING>` localiza las frases de un caption dado en la imagen.
- Deteccion de vocabulario abierto: `<OPEN_VOCABULARY_DETECTION>` permite localizar cualquier frase arbitraria en la imagen.
- Soporte de prompts en lenguaje natural: el modelo interpreta tareas mediante tokens especiales que el procesador expande a frases completas antes de tokenizar.
- Ejecucion on-device: gracias a ExecuTorch, puede ejecutarse en CPU (XNNPACK) y en iOS (Core ML) sin GPU dedicada.

## Casos de uso

- **Captioning automatico en aplicaciones de accesibilidad**: el modelo puede generar descripciones detalladas de imagenes para usuarios con discapacidad visual. Su capacidad de leer marcas y textos en la imagen (como se muestra en el ejemplo del piano con la marca "Lauberger") lo hace util para describir objetos con detalle.
- **Deteccion de objetos en tiempo real en dispositivos moviles**: con la version Core ML, el modelo puede ejecutarse en un iPhone para detectar objetos en fotos o video, devolviendo cajas delimitadoras y categorias. La latencia de 238 ms para la vision y 13,8 ms para el decoder por token permite un uso interactivo.
- **OCR en documentos escaneados**: el modelo puede extraer texto de imagenes con la tarea `<OCR>`, y con `<OCR_WITH_REGION>` ademas devuelve la posicion de cada texto. Esto es util para digitalizar recibos, tarjetas de visita o carteles.
- **Moderacion de contenido visual**: combinando deteccion de objetos y captioning, se pueden identificar contenidos inapropiados en imagenes subidas por usuarios, generando alertas automaticas.
- **Asistente de compras con reconocimiento de productos**: mediante `<OPEN_VOCABULARY_DETECTION>`, el modelo puede localizar un producto especifico en una estanteria o en una foto, facilitando busquedas visuales en aplicaciones de comercio electronico.
- **Anotacion de datasets para entrenamiento**: el modelo puede generar captions y cajas delimitadoras para crear datasets etiquetados de forma automatica, reduciendo el trabajo manual en pipelines de machine learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una verificacion de fidelidad: las salidas de los tres archivos `.pte` coinciden exactamente con las del modelo eager en PyTorch (diferencia maxima absoluta de 0,0 en logits) y los captions generados son identicos caracter por caracter en 5 fotografias de prueba, tanto en la version fp32 como en Core ML. No hay datos de MMLU, HumanEval u otros benchmarks estandar.

## Requisitos de hardware

- **Memoria**: el conjunto completo de archivos fp32 ocupa 3528 MB; la version Core ML ocupa 1648 MB. Se requiere al menos esa cantidad de RAM disponible en el dispositivo.
- **GPU**: no requiere GPU dedicada; esta diseñado para CPU (XNNPACK) y para el Neural Engine de iOS (Core ML). En Mac arm64, los tiempos de referencia (mediana de 5 ejecuciones) son: vision 803,9 ms (XNNPACK) y 238,2 ms (Core ML); encoder 144,4 ms y 43,1 ms; decoder 85,8 ms y 13,8 ms por token.
- **Dispositivos compatibles**: cualquier dispositivo que soporte ExecuTorch con backend XNNPACK (CPU ARM/x86) o Core ML (iOS). No se mencionan requisitos de GPU especificos.
- **Opciones de despliegue**: los archivos `.pte` se ejecutan directamente con el runtime de ExecuTorch. No se mencionan integraciones con vLLM, Ollama o TGI, ya que es un formato especifico para edge.
- **Latencia estimada**: un caption de 15 tokens cuesta una pasada de vision, una de encoder y 15 de decoder: aproximadamente 2,2 segundos en fp32 y 0,49 segundos en Core ML en un Mac arm64 de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Florence-2-large-ExecuTorch (este) | 0,77 B | Decoder 128 tokens, encoder 609 tokens | .pte (ExecuTorch) | MIT | Ejecucion on-device, tres archivos separados |
| Florence-2-base-ExecuTorch | 0,23 B | Similar (ancho 768) | .pte (ExecuTorch) | MIT | Misma interfaz, menor capacidad de detalle |
| Florence-2-large (original) | 0,77 B | 4k (version continuada) | safetensors | MIT | Requiere GPU, no optimizado para edge |

La comparativa se limita a las variantes de Florence-2 porque no se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada. La ventaja principal de la version ExecuTorch es su capacidad de ejecucion en dispositivos sin GPU, a costa de una ventana de decoder fija de 128 tokens.

## Limitaciones y advertencias

- **Ventana de decoder fija**: el decoder solo puede generar hasta 128 tokens por pasada, lo que limita la longitud de las respuestas. Para captions largos o detecciones multiples, puede ser necesario dividir la generacion en varias llamadas.
- **Regla de no repeticion obligatoria**: la model card advierte que el decoder de large devuelve `<s>` como argmax repetidamente en la mayoria de las imagenes. Sin aplicar `no_repeat_ngram_size=3` (prohibir la repeticion de trigramas), la generacion se queda en un bucle infinito de tokens de inicio y devuelve una cadena vacia. Esta regla es imprescindible para obtener resultados utiles.
- **Preprocesado especifico**: la imagen debe redimensionarse a 768x768 con interpolacion bicubic, normalizarse con la media y desviacion de ImageNet, y el prompt debe tokenizarse con el tokenizer del repositorio, paddeado a 32 tokens. No seguir estos pasos produce resultados incorrectos.
- **Idiomas**: no se especifican los idiomas soportados. El modelo base de Florence-2 esta entrenado principalmente en ingles, por lo que las respuestas en otros idiomas pueden ser de menor calidad.
- **Sesgos y alucinaciones**: no se proporciona informacion sobre sesgos especificos. Como modelo de vision-lenguaje, puede alucinar objetos o textos que no estan presentes en la imagen, especialmente en tareas de captioning detallado.
- **Licencia**: MIT, permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento de las leyes aplicables en su jurisdiccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlboydaisuke/Florence-2-large-ExecuTorch)
- [Modelo base Florence-2-large](https://huggingface.co/microsoft/Florence-2-large)
- [Modelo base Florence-2-base](https://huggingface.co/microsoft/Florence-2-base)
- [Version base ExecuTorch del mismo autor](https://huggingface.co/mlboydaisuke/Florence-2-base-ExecuTorch)
- [Repositorio ComfyUI-Florence2 (integracion con ComfyUI)](https://github.com/kijai/ComfyUI-Florence2)
