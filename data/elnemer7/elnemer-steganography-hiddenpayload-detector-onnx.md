# elnemer7/ElNeMeR-Steganography-HiddenPayload-Detector-ONNX

## Resumen

ElNeMeR-Steganography-HiddenPayload-Detector-ONNX es un clasificador binario-multiclase exportado a formato ONNX por el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI), dentro de una flota de 35 modelos forenses que el autor denomina "Sovereign & Humanitarian Forensic AI Fleet". El modelo no es un LLM ni un transformer generativo: es un detector de estegoanalisis que recibe un vector de 20 caracteristicas (`stego_features`, `float32`, forma `[batch_size, 20]`) y devuelve probabilidades sobre tres clases: imagen limpia (`clean_natural_bitplane`), payload esteganografico en el bit menos significativo (`lsb_stego_payload_detected`) y archivo poliglota anadido tras el marcador EOF (`polyglot_appended_archive`).

El problema que aborda es el de la deteccion de informacion oculta en imagenes: analiza anomalias de entropia chi-cuadrado en el plano LSB y flujos de bytes poliglotas posteriores al EOF para identificar payloads maliciosos o secretos embebidos en ficheros aparentemente inocuos. Es relevante en el ambito del analisis forense digital y la respuesta a incidentes, donde la exfiltracion por esteganografia es una tecnica recurrente y dificil de detectar con herramientas convencionales.

La informacion publicada es muy escasa: el repositorio ocupa 0.0 GB, no declara pipeline, no especifica idiomas ni arquitectura interna mas alla de la firma ONNX (opset 14) y no incluye datos sobre el entrenamiento. La model card unicamente afirma una "calibration accuracy" del 100.00%, cifra que debe interpretarse con cautela por no acompanarse de conjunto de validacion ni metodologia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX de clasificacion tabular; recibe vector de 20 caracteristicas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de 20 caracteristicas, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo (numero de capas, tipo de red, dimensiones ocultas) ni sobre el proceso de entrenamiento: no se indica el tamano ni la composicion del dataset, si hubo aumento de datos, validacion cruzada o calibracion de probabilidades. Lo unico documentado es la interfaz de inferencia: un tensor de entrada `stego_features` de tipo `float32` con forma `[batch_size, 20]`, exportado a ONNX opset 14 y compatible tanto con `onnxruntime` como con `onnxruntime-web` (WASM), lo que permite ejecucion en navegador.

La innovacion tecnica declarada es el enfoque de deteccion: combina el analisis de entropia chi-cuadrado del plano de bits menos significativo (tecnica clasica de estegoanalisis LSB) con la deteccion de flujos de bytes poliglotas anadidos despues del marcador EOF de la imagen. No se documenta el metodo de extraccion de las 20 caracteristicas ni el algoritmo de entrenamiento.

## Capacidades

- Clasificacion de imagenes en tres categorias: limpia, con payload LSB o con archivo poliglota anadido tras EOF.
- Deteccion de esteganografia en el bit menos significativo mediante analisis de anomalias de entropia chi-cuadrado.
- Deteccion de payloads maliciosos embebidos en ficheros de imagen aparentemente normales.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), ademas de en servidor con `onnxruntime`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un clasificador de caracteristicas, no un modelo generativo.

## Casos de uso

- Triaje forense de imagenes incautadas: procesar lotes de imagenes con el clasificador para priorizar las que presentan indicios de payload LSB o poliglota antes del analisis manual con herramientas como `binwalk` o `steghide`.
- Deteccion de exfiltracion en pasarelas de correo o subida de ficheros: integrar el ONNX en un pipeline de inspeccion que calcule las 20 caracteristicas de cada imagen y bloquee o marque las que devuelvan clase 1 o 2.
- Analisis de malware en sandbox: clasificar imagenes extraidas de artefactos sospechosos para detectar cargas utiles ocultas antes de ejecutar el analisis dinamico.
- Respuesta a incidentes: verificar rapidamente si una imagen adjunta en un correo de phishing contiene un archivo anadido tras el EOF que podria ser un ejecutable o un script.
- Herramienta de escritorio o extension de navegador: al ser compatible con `onnxruntime-web` (WASM), puede desplegarse como verificador local de imagenes sin enviar datos a un servidor, util en entornos con requisitos de privacidad.
- Formacion y concienciacion en ciberseguridad: demostrar en laboratorio como se detecta la esteganografia LSB y los ficheros poliglotas con un modelo ligero y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una "Calibration Accuracy" del 100.00%, sin especificar el conjunto de evaluacion, el tamano de la muestra ni la metodologia de calculo, por lo que no es un dato verificable ni comparable.

## Requisitos de hardware

- VRAM estimada: no disponible; al tratarse de un modelo ONNX de clasificacion tabular sobre 20 caracteristicas, el consumo de memoria es presumiblemente minimo, pero no se publica el tamano de los pesos (el repositorio ocupa 0.0 GB).
- GPU recomendadas: no disponible; por la naturaleza del modelo, la CPU es suficiente en la mayoria de escenarios.
- Compatibilidad con GPU de consumo: no disponible; no se documentan requisitos.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#) y `onnxruntime-web` (WASM en navegador), segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de estegoanalisis ni datos de rendimiento que permitan establecer una comparacion con alternativas como Aletheia, StegExpose u otras herramientas de deteccion de esteganografia LSB.

## Limitaciones y advertencias

- La cifra de "Calibration Accuracy: 100.00%" no va acompanada de metodologia, conjunto de validacion ni tamano de muestra; no debe tomarse como garantia de rendimiento en produccion.
- No se documenta la extraccion de las 20 caracteristicas de entrada: sin ese preprocesado, el modelo no es utilizable de forma directa, y una implementacion incorrecta invalida las predicciones.
- No se especifican los datos de entrenamiento ni la distribucion de clases, por lo que se desconoce el sesgo hacia alguna de las tres categorias y el riesgo de falsos positivos o negativos.
- El modelo solo cubre esteganografia LSB y payloads poliglotas tras EOF; no detecta otras tecnicas (DCT, esteganografia en metadatos, dominios de transformada, etc.).
- No procesa lenguaje natural: no tiene capacidades multilingues, de generacion de texto ni de razonamiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado informacion sobre mantenimiento o versionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Steganography-HiddenPayload-Detector-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
