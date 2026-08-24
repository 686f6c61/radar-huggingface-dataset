# IndexErrorThe/unirec-0.1b-coreml

## Resumen

UniRec-0.1B es un modelo unificado de reconocimiento de texto impreso, fórmulas matemáticas y tablas, desarrollado por el equipo de Topdu (OpenOCR) y presentado en el artículo arXiv 2512.21095. Con solo 0.1 mil millones de parámetros, ofrece una alternativa compacta a sistemas OCR de gran tamaño, capaz de procesar desde caracteres individuales hasta documentos completos en chino e inglés. Su diseño ligero lo hace adecuado para despliegue en dispositivos con recursos limitados, como ordenadores personales o aplicaciones de escritorio.

Esta ficha se centra en la conversión a Core ML publicada por IndexErrorThe, que empaqueta los pesos originales en formato `.mlpackage` para su uso en macOS 15 o superior. La conversión divide el modelo en un encoder y un decoder separados, siguiendo la exportación ONNX oficial, e incorpora un caché de atención de tamaño fijo para el decoder. El resultado es un paquete listo para integrarse en aplicaciones nativas de Apple, como la app MathOCR, que convierte PDFs sin capa de texto en Markdown con LaTeX.

La relevancia actual de este modelo radica en su tamaño reducido (0.1B) frente a alternativas como Nougat (250M) o modelos comerciales, lo que permite ejecutar reconocimiento de fórmulas y texto en hardware modesto sin sacrificar precisión en tareas específicas. La conversión Core ML amplía su accesibilidad al ecosistema Apple, aunque con limitaciones importantes en cuanto a resolución de imagen y longitud de secuencia generada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder basado en FocalSVTR (con focal modulation y convoluciones depthwise) |
| Parametros totales | 0.1B (aproximadamente 100 millones) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 posiciones de encoder (region de ~960x544 px) y 512 tokens generados |
| Tipos de cuantizacion | float16 (Core ML) |
| Idiomas soportados | Chino e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` (ML Program de Core ML), float16 |

## Arquitectura y entrenamiento

UniRec-0.1B emplea una arquitectura encoder-decoder basada en FocalSVTR, un backbone que utiliza focal modulation en lugar de atencion tradicional. La focal modulation se implementa mediante convoluciones depthwise con kernels de hasta 15x15, lo que permite capturar dependencias espaciales de forma eficiente. El encoder procesa imagenes normalizadas (RGB, escaladas a multiples de 64) y produce proyecciones de clave y valor para la atencion cruzada del decoder. El decoder, por su parte, genera secuencias de tokens de forma autoregresiva, con un vocabulario de 56,371 tokens que incluye caracteres chinos, simbolos LaTeX y marcadores HTML para tablas.

El entrenamiento se realizo sobre datos mixtos de texto y formulas, con validacion en los benchmarks OmniDocBench y UniRec-Bench, que cubren multiples niveles de bloques de documento, idiomas y dominios. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento ni sobre el uso de tecnicas como RLHF o DPO. La conversion a Core ML no altera los pesos; solo cambia el formato y la implementacion del decodificador para adaptarse a un grafo estatico, manteniendo la misma aritmetica y verificando la equivalencia token a token con la exportacion ONNX original.

## Capacidades

- Reconocimiento de texto impreso a multiples niveles: caracteres, palabras, lineas, parrafos y documentos completos.
- Reconocimiento de formulas matematicas en formato LaTeX, tanto inline (`\( ... \)`) como display (`\[ ... \]`).
- Reconocimiento de tablas, emitidas como HTML.
- Procesamiento de contenido mixto chino e ingles en una misma imagen.
- Generacion autoregresiva con decodificacion greedy, comenzando con el token BOS (id 0) y terminando con EOS (id 2).
- Salida estructurada en Markdown/LaTeX, adecuada para conversion de documentos cientificos.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de vision-lenguaje para OCR.

## Casos de uso

- Conversion de PDFs cientificos a Markdown: la app MathOCR utiliza este modelo para extraer texto y formulas de paginas escaneadas o sin capa de texto, generando documentos editables con LaTeX. Su tamaño reducido permite ejecutarlo en un Mac M1 con latencias aceptables (encoder 29-217 ms por region, decoder ~10 ms por token).
- Digitalizacion de apuntes y libros de matematicas: estudiantes e investigadores pueden fotografiar paginas y obtener el contenido en formato digital, incluyendo formulas complejas, sin necesidad de servicios en la nube.
- Extraccion de formulas de imagenes para reutilizacion en editores LaTeX: el modelo devuelve el codigo LaTeX directamente, facilitando la edicion de documentos academicos.
- Indexacion de documentos antiguos: bibliotecas y archivos pueden convertir colecciones escaneadas a texto buscable, preservando la estructura de formulas y tablas.
- Accesibilidad: personas con discapacidad visual pueden obtener descripciones textuales de documentos matematicos mediante la conversion a texto plano o Markdown.
- Automatizacion de flujos de trabajo editoriales: revistas y editoriales pueden preprocesar manuscritos en PDF para extraer contenido estructurado y validar la consistencia de formulas.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El articulo original menciona validacion en OmniDocBench y UniRec-Bench, pero no se proporcionan cifras concretas en la model card ni en los resultados de busqueda. La conversion Core ML fue verificada contra la exportacion ONNX oficial en seis imagenes de prueba, produciendo secuencias token a token identicas. En un Apple M1, el encoder tarda entre 29 y 217 ms por region (dependiendo del tamano) y el decoder aproximadamente 10 ms por token.

## Requisitos de hardware

- Sistema operativo: macOS 15 o superior (por el `minimum_deployment_target`).
- Hardware: Apple Silicon (M1 o posterior). Probado en M1.
- Memoria: los archivos `.mlpackage` suman 273 MB (82 MB encoder + 191 MB decoder), por lo que caben en cualquier Mac con al menos 8 GB de RAM.
- Compute units: obligatorio restringir a CPU y GPU (`computeUnits = .cpuAndGPU`). El Neural Engine produce errores silenciosos (desviacion del 56% en la salida del encoder a 192x640, frente al 0.19% con CPU+GPU).
- Despliegue: integracion nativa en apps Swift mediante Core ML. No es compatible con vLLM, llama.cpp u Ollama, ya que es un formato propietario de Apple.
- Latencia: en M1, encoder 29-217 ms por region (dependiendo del tamano de la imagen) y decoder ~10 ms por token. Para una formula tipica de 50 tokens, el tiempo total seria de aproximadamente 0.5-1 segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Como referencia, el modelo original (topdu/unirec-0.1b) se posiciona frente a sistemas como Nougat (250M parametros) o Pix2Text, pero no se han publicado tablas comparativas en los materiales consultados. La ventaja principal de UniRec-0.1B es su tamano reducido (0.1B) y su soporte bilingue chino-ingles, mientras que Nougat se centra en ingles y requiere mas recursos. La conversion Core ML no anade ni quita capacidades respecto al modelo original.

## Limitaciones y advertencias

- Error silencioso con Neural Engine: si se ejecuta con compute units que incluyen la ANE, el encoder produce resultados incorrectos sin aviso. Es imprescindible usar CPU+GPU.
- Limite de resolucion: el encoder acepta un maximo de 512 posiciones, lo que corresponde a una region de aproximadamente 960x544 px. Imagenes mas grandes deben dividirse en regiones, lo que puede complicar el procesamiento de paginas completas.
- Longitud de secuencia generada limitada a 512 tokens. Documentos largos o formulas muy extensas pueden truncarse.
- Idiomas limitados: solo chino e ingles. No soporta otros alfabetos ni escrituras.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto plausible pero incorrecto, especialmente en imagenes ruidosas o de baja calidad.
- Formato propietario: los pesos estan en `.mlpackage`, lo que limita su uso a plataformas Apple. Para otros entornos, debe usarse el modelo original en PyTorch u ONNX.
- No es un modelo nuevo: esta conversion no modifica los pesos ni el comportamiento; es simplemente un cambio de formato.

## Enlaces

- Modelo Core ML: https://huggingface.co/IndexErrorThe/unirec-0.1b-coreml
- Modelo original: https://huggingface.co/topdu/unirec-0.1b
- Exportacion ONNX (tokenizer mapping): https://huggingface.co/topdu/unirec_0_1b_onnx
- Articulo arXiv: https://arxiv.org/abs/2512.21095
- Version HTML del articulo: https://arxiv.org/html/2512.21095v2
- Repositorio MathOCR: https://github.com/kihun-nam/MathOCR
- Repositorio OpenOCR: https://github.com/Topdu/OpenOCR
- Documentacion de UniRec en OpenOCR: https://github.com/GreyRaphael/openocr/blob/main/docs/unirec.md
