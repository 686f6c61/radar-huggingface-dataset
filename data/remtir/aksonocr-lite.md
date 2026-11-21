# Remtir/AksonOCR-Lite

## Resumen

AksonOCR-Lite es un sistema de OCR para documentos tailandeses desarrollado por Remtir que convierte imagenes y PDF en Markdown, texto plano o JSON estructurado, incluyendo bloques de layout con orden de lectura, cajas de lineas de texto y tablas. Se distribuye como modelo ONNX de 81 millones de parametros que funciona enteramente en CPU, sin necesidad de PyTorch ni Paddle, lo que reduce drasticamente los requisitos de despliegue frente a los modelos VLM de OCR de gran tamano.

El reconocedor de texto emplea una arquitectura CTC sobre clusters de grafemas, disenada especificamente para el tailandes, de modo que las vocales apiladas y las marcas de tono se emiten en el orden correcto. La parte de estructura documental se apoya en PP-DocLayoutV3 para clasificar 25 tipos de layout y calcular el orden de lectura, y las tablas se convierten a HTML con spans de fila y columna. Tambien incluye correccion de orientacion de pagina, deteccion de lineas invertidas y dewarping opcional para fotografias de documentos curvados.

El modelo es relevante porque demuestra que un OCR especializado y ligero puede superar en precision media a VLMs de 2B parametros en benchmarks tailandeses (MDPBench-th, ThaiOCRBench, SEA-DocBench) y ser aproximadamente tres veces mas rapido por pagina en GPU, ademas de ejecutarse en CPU a 1,5 s por pagina. Su licencia Apache 2.0 y su empaquetado ONNX lo hacen atractivo para pipelines de digitalizacion documental en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OCR hibrido: reconocedor CTC sobre clusters de grafemas + layout PP-DocLayoutV3 + reconocimiento de tablas TATR |
| Parametros totales | 81 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, procesa paginas completas) |
| Tipos de cuantizacion | no disponible (pesos ONNX distribuidos; no se documentan variantes cuantizadas) |
| Idiomas soportados | tailandes (th) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repo | 0,6 GB (unos 330 MB de pesos por defecto, ~620 MB con dewarping) |
| Libreria | onnxruntime |
| Pipeline | image-to-text |

## Arquitectura y entrenamiento

El sistema combina varios componentes especializados en lugar de un unico transformer generativo. El reconocedor de texto es un modelo CTC que predice clusters de grafemas completos en lugar de caracteres individuales, lo que resuelve el problema del tailandes donde vocales y marcas de tono se combinan visualmente sobre la consonante base. La deteccion y clasificacion de layout se delega en PP-DocLayoutV3, que asigna 25 clases (titulos, parrafos, tablas, figuras, cabeceras y pies, entre otras) y establece el orden de lectura. Las tablas se procesan con un enfoque TATR que reconstruye la rejilla y genera HTML con spans de fila y columna.

El pipeline incorpora etapas de preprocesado para fotografias: correccion de orientacion de pagina, deteccion de lineas boca abajo y dewarping opcional para paginas curvadas o fotografiadas. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card no detalla estos aspectos. La innovacion principal es el diseno ligero (81 M de parametros) con inferencia exclusiva en ONNX Runtime, sin dependencias de PyTorch o Paddle.

## Capacidades

- Reconocimiento de texto OCR en tailandes e ingles, con prediccion a nivel de cluster de grafemas para preservar el orden correcto de vocales y tonos.
- Conversion de documentos a Markdown, texto plano o JSON estructurado.
- Analisis de layout con 25 clases y orden de lectura (titulos, parrafos, tablas, figuras, cabeceras, pies, etc.).
- Reconocimiento de tablas con reconstruccion a HTML incluyendo spans de fila y columna.
- Deteccion de lineas de texto con cajas delimitadoras, poligonos y puntuaciones de confianza.
- Correccion de orientacion de pagina y deteccion de lineas invertidas.
- Dewarping opcional de paginas fotografiadas o curvadas.
- Procesamiento de PDF multipagina y de imagenes (PIL, numpy BGR, bytes).
- Ejecucion en CPU (x86-64 y ARM64) y en GPU NVIDIA opcional mediante onnxruntime-gpu.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente perceptivo de image-to-text.

## Casos de uso

- Digitalizacion de facturas y documentos fiscales tailandeses: el modelo convierte PDFs e imagenes a Markdown o JSON con bloques estructurados, adecuado para pipelines contables que necesitan extraer importes y lineas de detalle sin depender de un VLM pesado.
- Procesamiento de documentos gubernamentales: la deteccion de layout con 25 clases y el orden de lectura permiten reconstruir cartas oficiales y formularios con cabeceras, parrafos y tablas, manteniendo la estructura semantica en la salida.
- Extraccion de tablas financieras: la reconstruccion TATR a HTML con spans de fila y columna facilita la conversion de estados financieros y balances a formatos tabulares procesables.
- Digitalizacion de archivos historicos fotografiados: las etapas de correccion de orientacion, deteccion de lineas invertidas y dewarping permiten procesar fotografias de paginas curvadas o giradas sin preprocesado manual.
- OCR en entornos sin GPU: al ejecutarse en CPU a 1,5 s por pagina con un pico de RAM de 1,3 GB, es viable en servidores modestos, portatiles o dispositivos ARM64 como Apple Silicon.
- Procesamiento por lotes en servidores con GPU: usando onnxruntime-gpu y lotes grandes, el modelo escala en throughput para digitalizaciones masivas, con la ventaja de ser aproximadamente tres veces mas rapido por pagina que VLMs de 2B parametros.
- Integracion en pipelines de gestion documental: la API Python devuelve objetos `Page` con markdown, bloques, lineas y confianzas, lo que permite indexar contenido y alimentar sistemas de busqueda o RAG sobre corpus tailandeses.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MDPBench-th (con `--dewarp`) | 85,6 |
| MDPBench-th (por defecto) | 79,5 |
| ThaiOCRBench Document parsing | 0,640 |
| SEA-DocBench-th text NED | 0,058 |
| Velocidad en CPU | 1,5 s por pagina |

La model card indica que el modelo es mas preciso en media que VLMs de OCR en MDPBench, ThaiOCRBench y SEA-DocBench, y aproximadamente tres veces mas rapido por pagina en GPU que VLMs de 2B parametros. No se proporcionan en la informacion disponible los resultados desglosados por modelo comparable ni tablas detalladas de throughput en lote.

## Requisitos de hardware

- RAM: aproximadamente 1,3 GB de pico para una pagina; aproximadamente 2,8 GB con `--dewarp`.
- Disco: unos 330 MB de pesos por defecto, mas 290 MB adicionales para dewarping, en la cache de Hugging Face.
- CPU: cualquier x86-64 o ARM64; no requiere GPU. Probado en Linux y macOS (Apple Silicon); Windows no verificado.
- GPU opcional: NVIDIA con driver CUDA 12 y cuDNN 9 para onnxruntime-gpu. La ruta CPU suele ser igual de rapida para paginas sueltas; la GPU compensa con dewarping y lotes grandes.
- Software: Python 3.10 o superior; dependencias onnxruntime, numpy, opencv-python-headless, pillow, pypdfium2, pyclipper, shapely y huggingface_hub.
- Despliegue: paquete Python `aksonocr-lite` (instalacion desde GitHub; PyPI proximamente) con CLI `aksonocr` y API Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo generativo.
- Red: solo necesaria en la primera ejecucion para descargar pesos; se puede usar la variable `AKSONOCR_WEIGHTS` para funcionamiento offline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AksonOCR-Lite | 81 M | Pagina completa de documento | OCR especializado tailandes (CTC + layout + tablas) en ONNX | Apache 2.0 | Hugging Face, GitHub, demo web |
| VLMs de OCR de ~2B parametros (referenciados en la model card) | ~2 000 M | Pagina completa | VLM generativo | no disponible | no disponible |
| PP-DocLayoutV3 | no disponible | Pagina completa | Analisis de layout | no disponible | usado como componente interno |

La model card compara AksonOCR-Lite con 12 sistemas de OCR tailandes y con tres VLMs, indicando superioridad en precision media y velocidad, pero no se detallan en la informacion proporcionada los nombres, parametros ni licencias de esos modelos comparables.

## Limitaciones y advertencias

- Cobertura linguistica limitada a tailandes e ingles; no se documenta soporte para otros idiomas.
- Es un modelo perceptivo de OCR, no un modelo generativo: no soporta razonamiento, tool calling ni agentes.
- No se documentan sesgos especificos, pero al estar entrenado principalmente en documentos tailandeses puede degradarse en tipografias, layouts o calidades de escaneo fuera de distribucion.
- Riesgo de errores en texto manuscrito o en documentos muy degradados; la model card incluye ejemplos de manuscritos, pero no se cuantifica su precision en ese dominio.
- Windows no esta verificado; el soporte oficial se limita a Linux y macOS (Apple Silicon).
- La GPU solo aporta ventajas con dewarping o lotes grandes; para paginas sueltas la ruta CPU es equivalente.
- El paquete PyPI no esta disponible todavia; la instalacion requiere clonar desde GitHub.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los componentes internos (PP-DocLayoutV3) antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remtir/AksonOCR-Lite
- Repositorio GitHub: https://github.com/Remtir/AksonOCR-Lite
- Demo en vivo: https://aksonocr.com/lite-demo
- Benchmarks completos: https://github.com/Remtir/AksonOCR-Lite/blob/main/BENCHMARKS.md
