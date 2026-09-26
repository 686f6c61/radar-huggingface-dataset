# fang718/pp-ocrv6-hanzi-unicode-ocr

## Resumen

pp-ocrv6-hanzi-unicode-ocr es un modelo de reconocimiento óptico de caracteres (OCR) de un solo carácter para glifos CJK, desarrollado por el usuario fang718 y publicado en HuggingFace. Recibe como entrada una imagen recortada que contiene un único glifo y devuelve como salida su código Unicode. Está construido sobre el modelo de reconocimiento PP-OCRv6 (variante medium) de PaddleOCR, convertido a formato ONNX, y afina sobre fuentes tipográficas de glifos en el checkpoint `PP-OCRv6_medium_gaiji_fonts_v2`.

Su principal valor diferencial es la cobertura: las 101.996 clases de su vocabulario corresponden, sin huecos, a todos los ideogramas unificados CJK de Unicode 17.0 (Extensiones A–J más el bloque URO), más 12 ideogramas de compatibilidad que no se normalizan a otro punto de código. Esto lo hace útil para el problema de los caracteres poco frecuentes o raros (生僻字, gaiji, 外字), que quedan fuera de los diccionarios de los OCR convencionales.

El modelo declara una exactitud del 97–99% en su envolvente de entrada validada: imágenes limpias, de un solo color, con tinta oscura sobre fondo claro y renderizadas con fuentes de computadora modernas de trazo regular (宋体, 黑体, 仿宋, 楷体). Se distribuye como un único fichero ONNX de 140.836.271 bytes ejecutable con onnxruntime en CPU, CUDA, DirectML o CoreML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de reconocimiento de texto con cabeza CTC (base PaddleOCR PP-OCRv6, variante medium), exportada a ONNX |
| Parametros totales | no disponible (el autor no publica el recuento; el fichero `model.onnx` ocupa 140.836.271 bytes en fp32, equivalente aproximado a 35 M de parametros si todo el peso fuese fp32) |
| Longitud de contexto | no aplica (modelo no autorregresivo; entrada de imagen `(N, 3, 48, W)` y salida con `T = ceil(W / 8)` pasos temporales, fijada en `W = 320`, es decir `T = 40`) |
| Tipos de cuantizacion | no disponible; se distribuye unicamente en fp32 dentro del grafo ONNX |
| Idiomas soportados | no disponible; opera sobre el repertorio de ideogramas unificados CJK, compartido por chino, japones (kanji), coreano (hanja) y textos historicos en Vietnam |
| Licencia | no disponible |
| Formato de pesos | ONNX (`model.onnx`) acompanado de `metadata.json` con el vocabulario y la especificacion de preprocesado |
| Entrada | Tensor `x` de forma `(N, 3, 48, W)` en `float32`, con ancho dinamico; la configuracion publicada usa `W = 320` rellenado con ceros por la derecha |
| Salida | Tensor `fetch_name_0` de forma `(N, T, 101997)` en `float32`, ya normalizado con softmax |
| Clases de salida | 101.997 (indice 0 = blank de CTC + 101.996 ideogramas ordenados por punto de codigo ascendente) |
| Cobertura | 101.996 ideogramas unificados CJK de Unicode 17.0 (Extensiones A, B, C, D, E, F, G, H, I, J y URO, sin huecos) mas 12 ideogramas de compatibilidad |
| Runtime | onnxruntime (proveedores CPU, CUDA, DirectML, CoreML) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo de reconocimiento de PaddleOCR PP-OCRv6 en su variante medium, una red convolucional que procesa la imagen de entrada y emite una secuencia de distribuciones por paso temporal sobre un vocabulario cerrado. La cabeza es CTC con 101.997 clases y el grafo ONNX resultante acepta lote y ancho dinamicos, aunque la configuracion liberada alimenta siempre `W = 320`. El preprocesado es estricto: la imagen se reescala preservando la relacion de aspecto hasta una altura de 48, se convierte de RGB a BGR y se normaliza con `pixel / 127.5 - 1`; el modelo es sensible al orden de canales y a esta normalizacion.

El checkpoint publicado se ha afinado sobre fuentes tipograficas de glifos (`PP-OCRv6_medium_gaiji_fonts_v2`), partiendo del modelo base de reconocimiento de PP-OCRv6 medium. La model card no detalla el numero de tokens, la composicion del dataset de afinado, ni si se emplearon tecnicas de RLHF o DPO, algo que tampoco aplica a un reconocedor CTC de este tipo. Como innovacion practica, el autor propone ejecutar este modelo junto con `pp-ocrv6-hanzi-ids-ocr` (que devuelve la estructura IDS del caracter) para detectar discrepancias de forma automatica: al ser modelos independientes, las divergencias se marcan para revision en lugar de aceptarse en silencio.

## Capacidades

- Reconocimiento de un unico caracter CJK a partir de una imagen recortada: entrada una imagen de un glifo, salida su punto de codigo Unicode.
- Cobertura completa del repertorio de ideogramas unificados CJK de Unicode 17.0, incluidas las extensiones B a J que contienen los caracteres mas raros.
- Tratamiento coherente de normalizacion Unicode: los ideogramas de compatibilidad que se normalizan a otro punto de codigo no se duplican, de modo que ninguna clase colapsa con otra bajo NFC/NFKC.
- Salida con puntuacion de confianza por caracter (media de las probabilidades maximas de los pasos temporales conservados tras el colapso de CTC).
- Inferencia por lotes variable y ancho dinamico en el grafo, con soporte de ejecucion en CPU, CUDA, DirectML y CoreML.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto libre: es un clasificador de imagen a caracter.
- Capacidades multilingues: no aplica como tal; el vocabulario es de escritura han, no de idioma.
- La model card no menciona capacidades de vision mas alla del reconocimiento de glifos, ni modo thinking, audio u otras modalidades.

## Casos de uso

- Digitalizacion de diccionarios y obras lexicograficas con caracteres raros: muchas entradas de diccionario incluyen ilustraciones de glifos poco frecuentes (生僻字); este modelo convierte esas imagenes incrustadas directamente en su punto de codigo, lo que permite reconstruir el texto indexable del diccionario.
- Construccion de corpus academicos de caracteres extintos o en desuso: para estudios de sinologia, filologia japonesa o investigacion sobre hanja coreano, el modelo etiqueta glifos recortados de ediciones digitalizadas de fuentes tipograficas, siempre que procedan de renderizado limpio y no de escaneo.
- Validacion cruzada con el modelo IDS: ejecutando `pp-ocrv6-hanzi-ids-ocr` en paralelo, las discrepancias entre el caracter reconocido y su estructura descrita se marcan para revision humana, lo que reduce el riesgo de etiquetado erroneo en lotes grandes.
- Catalogacion de glifos en diseno tipografico: al cubrir Extensiones A–J, permite identificar que codigo Unicode corresponde a un glifo concreto de una fuente durante tareas de mapeo, control de calidad o generacion de tablas de codificacion.
- Herramientas educativas de aprendizaje de caracteres CJK: dado un glifo recortado de un ejercicio o de una fuente, la aplicacion puede devolver el caracter y su codigo para vincularlo a definiciones, trazos o material de estudio.
- Flujos de impresion y publicacion con gaiji (外字): los sistemas editoriales japoneses que usan caracteres fuera de los juegos estandar pueden identificar el codigo Unicode correcto de cada gaiji a partir de su imagen, evitando sustituciones incorrectas.
- Normalizacion y reconciliacion de texto en pipelines de OCR de dos etapas: tras segmentar un documento en caracteres individuales renderizados de forma limpia, este modelo actua como segundа fase para resolver los caracteres que un OCR de linea ha dejado sin identificar.
- Anotacion asistida en herramientas de etiquetado de corpus: el modelo sugiere el punto de codigo de cada imagen de glifo y el anotador solo confirma o corrige, con la puntuacion de confianza como criterio de priorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo de reconocimiento de glifos, no aplican metricas como MMLU, HumanEval o GSM8K. El unico dato de rendimiento aportado por el autor es la exactitud declarada en su envolvente de entrada validada.

| Metrica | Valor | Condiciones |
|---|---|---|
| Exactitud declarada | 97–99% | Imagenes limpias, de un solo color, tinta oscura sobre fondo claro, fuentes de computadora de trazo regular (宋体, 黑体, 仿宋, 楷体) |
| Cobertura de clases | 101.996 ideogramas, 0 huecos | Comparado punto de codigo a punto de codigo contra `UnicodeData.txt` de Unicode 17.0 |
| Subtotal de ideogramas unificados | 101.984 | Extensiones A–J mas URO |
| Ideogramas de compatibilidad | 12 | Solo los que no se normalizan a otro ideograma unificado |

Los valores de exactitud son autodeclarados por el autor y no se acompanan de un conjunto de evaluacion publico ni de una comparacion con otros modelos.

## Requisitos de hardware

- El fichero `model.onnx` ocupa 140.836.271 bytes en fp32, por lo que cabe holgadamente en la memoria de cualquier GPU de consumo e incluso puede ejecutarse solo en CPU.
- VRAM estimada para inferencia: inferior a 1 GB incluyendo pesos y activaciones; el tensor de salida para un lote de una imagen es de `40 x 101.997 x 4` bytes, aproximadamente 15,6 MiB por muestra, que es el componente mas voluminoso de la activacion.
- GPU recomendadas: cualquier GPU con soporte CUDA para el proveedor CUDAExecutionProvider; tambien funciona con DirectML en Windows y CoreML en Apple Silicon. No requiere A100, H100 ni tarjetas de gama alta.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en graficas integradas, dado el tamano del modelo.
- Opciones de despliegue: onnxruntime (CPU, CUDA, DirectML, CoreML). No se distribuyen pesos en GGUF ni safetensors, por lo que no es desplegable directamente con llama.cpp, Ollama, vLLM o TGI, que estan orientados a modelos de lenguaje autorregresivos.
- Latencia y throughput estimados: no disponible; la model card no publica mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Salida | Base | Cobertura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pp-ocrv6-hanzi-unicode-ocr (este repositorio) | El caracter, por ejemplo `明` | PP-OCRv6 medium convertido a ONNX, afinado en fuentes de glifos | 101.996 ideogramas CJK de Unicode 17.0, sin huecos | no disponible | HuggingFace; 0 descargas, 0 likes |
| pp-ocrv6-hanzi-ids-ocr | La estructura del caracter, por ejemplo `⿰日月` | Del mismo autor, mismo enfoque sobre PP-OCRv6 | no disponible | no disponible | HuggingFace |
| Alternativas genericas de OCR de caracteres CJK | Caracter o texto | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion disponible alternativas directas con cobertura equivalente de las Extensiones B–J de Unicode. Los OCR convencionales (tipo PaddleOCR general, Tesseract o EasyOCR) no publican en esta informacion un recuento de clases comparable, por lo que no se puede establecer una comparacion cuantitativa fiable. El unico modelo directamente comparable y documentado es el modelo hermano `pp-ocrv6-hanzi-ids-ocr`, disenado para complementarlo mediante validacion cruzada.

## Limitaciones y advertencias

- Envolvente de entrada muy restringida: solo esta validado para imagenes limpias, de un unico caracter, de un solo color y con tinta oscura sobre fondo claro, renderizadas con fuentes de computadora. La escritura a mano, los escaneos, los calcos, las fotografias y las fuentes decorativas o caligraficas quedan explicitamente fuera del ambito validado.
- Sensibilidad al preprocesado: el modelo es sensible al orden de canales y a la normalizacion. Si la imagen de origen se lee en orden distinto a RGB convertido a BGR, o si el reescalado no preserva la relacion de aspecto hasta altura 48, la exactitud se degrada.
- Configuracion de ancho fija: aunque el grafo admite ancho dinamico, la configuracion liberada alimenta siempre `W = 320`, que es como se entreno; desviarse de ese valor puede reducir el rendimiento.
- Repertorio cerrado: solo puede devolver caracteres del conjunto de ideogramas unificados CJK y los 12 de compatibilidad incluidos. Cualquier glifo fuera de ese repertorio no puede generarse como salida.
- Riesgo de clasificacion erronea silenciosa: al ser un clasificador de vocabulario amplio, un glifo visualmente parecido puede asignarse a la clase equivocada sin senal de error; se recomienda umbral de confianza y validacion cruzada con el modelo IDS.
- Sesgos conocidos: no disponible. El autor no documenta la procedencia, composicion ni equilibrio del dataset de afinado, por lo que se desconoce si hay un sesgo sistematico hacia determinadas familias tipograficas o bloques de codigo.
- Licencia no disponible: no se especifica la licencia del modelo, lo que impide confirmar si su uso comercial esta permitido. Ademas, al derivar de PaddleOCR PP-OCRv6, las condiciones del modelo base podrian aplicar adicionalmente; conviene verificarlas antes de un uso en produccion.
- Madurez y validacion externa nulas: el repositorio registra 0 descargas y 0 likes, sin evaluaciones independientes ni resultados de terceros que confirmen la exactitud declarada.
- Los datos de exactitud (97–99%) son autodeclarados por el autor y no estan acompanados de un conjunto de evaluacion reproducible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fang718/pp-ocrv6-hanzi-unicode-ocr
- Modelo complementario de estructuras IDS: https://huggingface.co/fang718/pp-ocrv6-hanzi-ids-ocr

No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
