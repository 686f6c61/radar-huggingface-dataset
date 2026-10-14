# amongglue/topaz-gregg-shorthand-61m-gguf

## Resumen

topaz-gregg-shorthand-61m-gguf es una compilacion para CPU del modelo Topaz-61M, un reconocedor de taquigrafia Gregg (variante Anniversary) desarrollado por amongglue. Se distribuye como un ejecutable estatico de Linux x86-64 acompanado de un unico fichero de pesos en formato GGUF, de modo que no requiere Python ni GPU para funcionar. Resuelve el problema de convertir imagenes de notas taquigrafiadas a texto (image-to-text), una tarea de nicho para la que practicamente no existen modelos abiertos.

El modelo es una red convolucional con decodificacion CTC que forma parte de un pipeline completo: localizacion de lineas (line finder), enderezado de lineas, reconocedor, decodificacion CTC voraz y busqueda en diccionario. El recuento real de parametros del reconocedor es de 62.842.515 (unos 62,8 M), con un vocabulario de 73 tokens y un diccionario de contornos incluidos en el fichero GGUF de 130 MB.

Es relevante ahora porque demuestra un caso de uso muy especializado empaquetado como herramienta autonoma y reproducible: un binario estatico que funciona en cualquier CPU x86 con AVX2 y FMA, con un consumo de memoria de unos 200-260 MB. Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (CNN) con decodificacion CTC para image-to-text; incluye un localizador de lineas (line finder) aprendido |
| Parametros totales | 62.842.515 (~62,8 M) en el reconocedor |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a texto) |
| Tipos de cuantizacion | f16 en el reconocedor (BatchNorm plegada en las convoluciones), f32 en el localizador de lineas; contenedor GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (ggml); el reconocedor se convierte con `--type f16` |

## Arquitectura y entrenamiento

El modelo es un reconocedor convolucional con decodificacion CTC. La version GGUF almacena los pesos del reconocedor en floats de 16 bits, con las capas BatchNorm plegadas dentro de las convoluciones, mientras que el localizador de lineas se guarda en floats de 32 bits. El pipeline completo replica el del paquete PyTorch: localizacion de lineas, enderezado de lineas, reconocimiento por linea, decodificacion CTC voraz y consulta al diccionario de contornos. El fichero GGUF incluye ademas el vocabulario de 73 tokens, el diccionario de contornos y una plantilla de prompt para LLM.

La model card de este repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO; esa informacion se remite a la model card de la version PyTorch. La innovacion tecnica destacable no esta en la arquitectura, sino en el empaquetado: un ejecutable C++ estatico enlazado contra ggml v0.9.9 (commit `a04eea07`) que reproduce el comportamiento de la implementacion de referencia con diferencias minimas.

## Capacidades

- Reconocimiento de taquigrafia Gregg en su variante Anniversary a partir de imagenes de lineas o paginas completas.
- Deteccion y enderezado automatico de lineas dentro de una pagina escaneada o fotografiada (con una variante `--classic` basada en perfil de proyeccion para lineas ya niveladas).
- Decodificacion CTC voraz sobre un vocabulario de 73 tokens.
- Salida en notacion Grascii: cada contorno reconocido va seguido de sus sugerencias de diccionario (por ejemplo, `I-K (I can/why can) G (good/go)`).
- Numero de lineas del fichero, puntuacion y numeros se mantienen tal cual se escriben.
- Generacion opcional de un prompt para LLM (`--with-prompt`), util para encadenar un post-procesado con un modelo de lenguaje.
- Procesamiento por lotes de varias imagenes (PNG, JPEG o BMP) con directorio de salida configurable.
- Aplicacion de la orientacion EXIF en ficheros JPEG.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales generales (vision, audio o video) mas alla de la lectura de taquigrafia.
- Solo ingles.

## Casos de uso

- Digitalizacion de archivos taquigraficos: escanear cuadernos o libros de actas escritos en taquigrafia Gregg y obtener texto en notacion Grascii con sugerencias de diccionario para cada contorno, gracias a la deteccion automatica de lineas en paginas completas.
- Transcripcion de notas historicas: procesar colecciones escaneadas de periodistas, taquigrafos judiciales o investigadores sin necesidad de infraestructura GPU, ya que basta un ejecutable Linux con AVX2 y unos 260 MB de memoria.
- Preprocesado para post-edicion con LLM: usar `--with-prompt` para generar un fichero que contiene la plantilla de prompt, una linea en blanco, `Transcript:` y las lineas reconocidas, que despues se pasa a un modelo de lenguaje para desambiguar las sugerencias del diccionario.
- Accesibilidad y recuperacion de contenido: convertir documentos taquigrafiados a texto para hacerlos buscables o indexables en sistemas de gestion documental.
- Investigacion linguistica y paleografica: estudiar la frecuencia de contornos y las ambiguedades del diccionario a partir de las salidas de Grascii sobre corpus grandes.
- Despliegue en entornos restringidos: procesar documentos en servidores CPU modestos o aislados de red, al ser un binario estatico con un unico fichero de modelo de 130 MB.
- Automatizacion por lotes en CI o scripts: `./gregg -o out/ *.png` permite tratar paginas completas de forma no interactiva para integrarlas en pipelines de digitalizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K y similares) en la informacion disponible; se trata de un modelo especializado de imagen a texto y no es comparable en esas tareas. Si se aportan datos de velocidad y de concordancia con la implementacion de referencia.

Velocidad medida en una CPU pequena en la nube (Xeon 2,0 GHz, 1 nucleo con 2 hiperhilos, `-t 2`):

| Tarea | Tiempo |
|---|---|
| Una linea (500 px de ancho) | ~1 s |
| Una linea (950 px de ancho) | ~2 s |
| Una pagina de 31 lineas | ~40 s (2,4 s de ellos localizando lineas) |

Memoria maxima: unos 200 MB para lineas sueltas y 260 MB para paginas. La mayor parte del tiempo se consume en las convoluciones del reconocedor; en esa CPU el ejecutable es aproximadamente 2 veces mas lento que PyTorch (que usa una libreria de matrices mas rapida) y el uso de mas nucleos escala de forma casi lineal.

Concordancia con PyTorch:

| Prueba | Resultado |
|---|---|
| 2 paginas de libro escaneadas y 2 lineas dibujadas (58 lineas) | 54 de 58 lineas con salida identica; las otras 4 difieren en un solo trazo |
| Conversion f32 sobre 3 paginas de prueba (197 lineas) y 50 lineas de libro | coincidencia exacta con PyTorch, con recortes de linea identicos |
| Fichero f16 sobre esas mismas 197 lineas | 196 de 197 |
| Busqueda en diccionario | 889 de 889 lineas de prueba coinciden con la implementacion en Python |

## Requisitos de hardware

- CPU x86-64 con AVX2 y FMA (practicamente cualquier x86 desde 2013). No necesita GPU.
- Memoria: unos 200 MB en pico para lineas individuales y unos 260 MB para paginas completas.
- GPU recomendadas: no aplica; el modelo esta disenado para ejecutarse en CPU.
- No cabe en GPU consumer porque no usa GPU; el binario esta pensado para CPU.
- Despliegue: ejecutable estatico `gregg` (Linux x86-64) con el fichero `gregg.gguf` de 130 MB. No se contemplan despliegues con vLLM, TGI u Ollama, dado que no es un modelo de lenguaje generativo.
- Latencia: ~1 s por linea de 500 px y ~2 s por linea de 950 px en un Xeon 2,0 GHz con 2 hilos; ~40 s por pagina de 31 lineas. Mas nucleos mejoran el rendimiento de forma casi lineal.
- Compilacion desde codigo fuente: CMake 3.16 o superior, compilador C++17 y git; por defecto enlaza estaticamente, con opcion `-DGREGG_STATIC=OFF` para enlazar glibc de forma dinamica.

## Comparativa con modelos similares

No se conocen otros modelos abiertos de reconocimiento de taquigrafia Gregg con los que comparar directamente. La referencia mas cercana es la propia version PyTorch del mismo modelo, y como alternativas genericas de OCR existen Tesseract o TrOCR, aunque ninguno esta especializado en taquigrafia. Datos disponibles en la informacion proporcionada:

| Modelo | Parametros | Formato | Ejecucion | Licencia |
|---|---|---|---|---|
| topaz-gregg-shorthand-61m-gguf | 62.842.515 | GGUF | CPU (AVX2+FMA), binario estatico | MIT |
| Topaz-61M (PyTorch) | 62.842.515 (mismo modelo) | checkpoint PyTorch | Python, requiere entorno de entrenamiento | MIT |

Frente a la version PyTorch, la build GGUF funciona sin Python ni GPU, consume unos 200-260 MB de memoria y ofrece un rendimiento de aproximadamente la mitad en la CPU de referencia, con diferencias de un trazo en 4 de 58 lineas. Como el modelo PyTorch es el mismo, no hay datos de rendimiento comparativos con alternativas externas: no disponible.

## Limitaciones y advertencias

- Solo soporta ingles y esta restringido a la variante Gregg Anniversary; otros sistemas taquigraficos (Pitman, Gregg Simplified, etc.) no estan cubiertos.
- Almacenar el reconocedor en 16 bits introduce pequenas diferencias frente a PyTorch: en las pruebas, 4 de 58 lineas difirieron en un trazo; el fichero f16 igualo exactamente a PyTorch en 196 de 197 lineas de un conjunto mayor.
- La decodificacion de JPEG usa stb_image en lugar de libjpeg-turbo, por lo que alrededor del 1,5 % de los pixeles puede diferir en un nivel de gris, lo que ocasionalmente cambia un trazo. Las entradas PNG se decodifican de forma identica.
- Las lineas se leen de una en una. Procesar lineas de distinto ancho en lote cambia algunas lecturas, porque el padding afecta a las caracteristicas del borde derecho de la linea.
- La salida son sugerencias de diccionario con ambiguedad (varios candidatos por contorno), no una transcripcion unica; se necesita post-procesado o revision humana.
- Riesgo de errores en trazos con baja calidad de escaneo, orientacion o lineas mal detectadas.
- Limitaciones de contexto o idioma: al ser un modelo de imagen a texto no tiene ventana de contexto; su unico idioma es el ingles.
- Licencia MIT: permite uso comercial, redistribucion y modificacion, manteniendo el aviso de copyright. No hay restricciones de uso comercial documentadas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Requiere una CPU con AVX2 y FMA; no funcionara en CPUs x86 mas antiguas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amongglue/topaz-gregg-shorthand-61m-gguf
- Version PyTorch de referencia (Topaz-61M): https://huggingface.co/amongglue/topaz-gregg-shorthand-61m
- Fuente C++ y convertidor incluidos en el repositorio (carpeta `source/`, con `source/README.md` y pruebas de paridad)
- Dependencia ggml v0.9.9, commit `a04eea07` (obtenida mediante CMake)
