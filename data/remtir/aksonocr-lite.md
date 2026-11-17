# Remtir/AksonOCR-Lite

## Resumen

AksonOCR-Lite es un sistema de OCR de documentos tailandeses desarrollado por Remtir, publicado bajo licencia Apache 2.0. No es un modelo de lenguaje generativo, sino un pipeline completo de reconocimiento de documentos que convierte PDFs e imagenes en Markdown, texto plano o JSON estructurado, incluyendo bloques de maquetacion, orden de lectura, cajas de lineas de texto y tablas en HTML. Su componente central es un reconocedor CTC de unos 81 millones de parametros especializado en tailandes (con soporte de ingles) que predice grupos grafemicos completos en lugar de caracteres individuales, resolviendo el problema de las vocales y marcas tonales apiladas del tailandes.

La propuesta de valor es la eficiencia: el modelo funciona sobre ONNX Runtime en CPU o GPU, sin necesidad de PyTorch ni Paddle, con unos 330 MB de pesos por defecto (unos 620 MB con dewarping). Segun la model card, es aproximadamente 3 veces mas rapido por pagina que los VLM de OCR de 2000 millones de parametros sobre GPU, y con mayor precision media en los conjuntos MDPBench, ThaiOCRBench y SEA-DocBench.

Es relevante para equipos que necesitan digitalizar documentacion administrativa, financiera o gubernamental tailandesa a escala sin infraestructura GPU dedicada, manteniendo capacidades de analisis de maquetacion (25 clases), reconocimiento de tablas con spans de fila y columna, y correccion de orientacion de pagina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR multi-etapa sobre ONNX: dewarping (MonkeyOCRv2), orientacion de pagina (PP-LCNet), maquetacion y orden de lectura (PP-DocLayoutV3), deteccion de lineas (PP-OCRv6_medium_det, DB), orientacion de linea (PP-LCNet), reconocimiento CTC de grupos grafemicos y tablas (TATR v1.1) |
| Parametros totales | 81 M (reconocedor); el peso total del paquete es de aproximadamente 330 MB por defecto y 620 MB con dewarping |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos ONNX; el tamano del repo es de 0,6 GB) |
| Idiomas soportados | Tailandes (principal) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (layout.onnx, det.onnx, doc_ori.onnx, textline_ori.onnx, rec.onnx, rec_charset.json, tatr.onnx, dewarp_mask.onnx, dewarp_grid.onnx) |

## Arquitectura y entrenamiento

AksonOCR-Lite no es un unico transformer, sino una cadena de modelos especializados que se ejecutan sobre la misma imagen de pagina. El flujo es: dewarping opcional mediante el preprocesador de MonkeyOCRv2; correccion de orientacion de pagina en incrementos de 90 grados con un clasificador PP-LCNet; analisis de maquetacion y orden de lectura con PP-DocLayoutV3 (25 clases: titulos, parrafos, tablas, figuras, cabeceras y pies, entre otras); deteccion de lineas de texto con PP-OCRv6_medium_det basado en DB; clasificacion de orientacion de linea con otro PP-LCNet; y reconocimiento final con el modelo CTC propio de AksonOCR. Para tablas, se vuelve a detectar texto en el recorte, se aplica TATR v1.1 para inferir la rejilla y se rellenan las celdas con las lineas OCR, generando HTML con spans.

La innovacion principal es el reconocedor CTC de grupos grafemicos. En tailandes una sola posicion visual puede contener de 2 a 3 puntos de codigo (por ejemplo, ผู้ se descompone en ผ + ู + ้), de modo que predecir caracteres sueltos desordena vocales y marcas tonales. AksonOCR predice el grupo completo como un unico token (la model card ilustra una linea con 22 simbolos a nivel de caracter frente a 15 a nivel de grupo). Ademas, el reconocedor aplica una relectura a 180 grados y conserva la lectura con mayor confianza. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de texto tailandes e ingles con prediccion de grupos grafemicos, preservando el orden correcto de vocales y marcas tonales.
- Conversion de PDFs e imagenes (rutas, bytes, PIL.Image o arrays numpy BGR) a Markdown, texto plano o JSON.
- Analisis de maquetacion con 25 clases y orden de lectura, con cajas delimitadoras, puntuaciones de confianza y geometria poligonal por linea.
- Reconocimiento de tablas con reconstruccion de rejilla (TATR v1.1) y salida en HTML con spans de fila y columna.
- Correccion de orientacion de pagina (0, 90, 180, 270 grados) y deteccion de lineas invertidas.
- Dewarping opcional de paginas fotografiadas o curvadas.
- Extraccion solo de lineas de texto (`ocr()`) sin analisis de maquetacion.
- Ejecucion en CPU y GPU via ONNX Runtime, con seleccion automatica de dispositivo.
- Soporte de pesos locales mediante la variable de entorno `AKSONOCR_WEIGHTS`.
- No dispone de tool calling, razonamiento multi-paso ni modo thinking: es un modelo de vision especializado en OCR.

## Casos de uso

- Digitalizacion de expedientes administrativos tailandeses: conversion por lotes de PDFs de organismos publicos a Markdown con bloques estructurados y orden de lectura, aprovechando los 1,5 s por pagina en CPU para procesar volumenes elevados sin GPU.
- Procesamiento de estados financieros y facturas: el reconocimiento de tablas con spans permite extraer lineas de detalle y totales directamente como HTML parseable, integrable en un ERP o en un pipeline contable.
- Atencion al cliente con documentos adjuntos: extraccion del contenido de imagenes y PDFs enviados por usuarios tailandeses para alimentar un sistema de tickets o un motor de busqueda, con correccion automatica de fotos torcidas o curvadas mediante `--dewarp`.
- Archivado y busqueda documental: generacion de JSON con cajas, bloques, lineas y confidencias para indexar texto junto a su posicion en la pagina, util en visores con resaltado de coincidencias.
- Digitalizacion de formularios y cartas gubernamentales fotografiados: la correccion de orientacion de pagina y de linea, junto con la relectura a 180 grados, permite procesar capturas moviles sin preprocesado manual.
- Extraccion de datos en entornos sin GPU: al ejecutarse sobre ONNX Runtime en CPU (Linux, macOS y Apple Silicon, probado en CI), encaja en servidores modestos o en despliegues en el borde.
- Construccion de corpus paralelos tailandes-ingles: la salida estructurada por bloques y lineas facilita el alineamiento de documentos bilingues para entrenamiento o evaluacion.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| MDPBench-th (con `--dewarp`) | 85,6 |
| MDPBench-th (por defecto) | 79,5 |
| ThaiOCRBench Document parsing | 0,640 |
| SEA-DocBench-th text NED | 0,058 |
| Velocidad | 1,5 s por pagina en CPU; aproximadamente 3 veces mas rapido por pagina que VLM de OCR de 2000 M de parametros en GPU |

La model card indica que supera en precision media a 12 sistemas de OCR tailandes comparados en MDPBench-th, ThaiOCRBench Document parsing y SEA-DocBench-th. No se han publicado en la informacion disponible resultados desagregados de MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los pesos por defecto ocupan unos 330 MB (620 MB con dewarping), por lo que la huella en memoria es reducida.
- GPU recomendadas: cualquier GPU compatible con `onnxruntime-gpu` (CUDA); la model card no especifica modelos concretos como A100, H100 o RTX 4090.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo; de hecho el modo por defecto es CPU.
- Despliegue: ONNX Runtime (CPU o GPU), paquete `aksonocr-lite` instalable via pip, CLI `aksonocr` y API de Python (`aksonocr_lite.load()` y `convert()`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,5 s por pagina en CPU; las entradas tienen formas variables, por lo que la ruta CPU suele ser igual de rapida para paginas sueltas y la GPU compensa sobre todo con dewarping y lotes grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AksonOCR-Lite | 81 M (reconocedor) | Pipeline OCR sobre ONNX con CTC de grupos grafemicos | Tailandes, ingles | Apache 2.0 | 1,5 s por pagina en CPU; MDPBench-th 85,6 con dewarp |
| VLM de OCR de ~2B (generico) | ~2000 M | VLM generativo de imagen a texto | Multiples | No disponible | Mas lento por pagina en GPU segun la model card; menor precision media en los benchmarks citados |
| MonkeyOCRv2 | No disponible | Pipeline OCR con preprocesador de dewarping | No disponible | No disponible | AksonOCR-Lite reutiliza su preprocesador de dewarping |
| PP-OCRv6_medium_det / PP-DocLayoutV3 | No disponible | Deteccion de texto y maquetacion | No disponible | No disponible | Componentes integrados en el pipeline de AksonOCR-Lite |

La model card afirma comparar contra 12 sistemas de OCR tailandes, pero no detalla sus nombres, parametros ni licencias en la informacion disponible.

## Limitaciones y advertencias

- Especializado en tailandes e ingles; el rendimiento en otros idiomas no esta documentado y previsiblemente sera deficiente.
- No es un modelo generativo: no razona, no responde preguntas ni ejecuta tool calling; su unica funcion es extraer texto y estructura.
- El reconocimiento de tablas depende de TATR v1.1 y de la re-deteccion de texto en el recorte, por lo que tablas muy complejas o con celdas fusionadas de forma atipica pueden producir errores de rejilla.
- El dewarping es opcional y anade unos 290 MB de pesos; sin el, la precision en MDPBench-th cae de 85,6 a 79,5, lo que evidencia su impacto en fotos de paginas curvadas.
- Riesgo de alucinacion bajo en comparacion con VLM generativos, pero persisten errores de reconocimiento en texto de baja calidad, manuscritos o ruido; las confidencias por linea permiten filtrar.
- No se han publicado datos sobre sesgos del modelo ni sobre el dataset de entrenamiento, lo que limita la evaluacion de su comportamiento en dominios especificos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los componentes de terceros integrados (PP-DocLayoutV3, PP-OCRv6, TATR, MonkeyOCRv2), no detalladas en la informacion disponible.
- El modelo se publico en noviembre de 2026 y no registra descargas ni likes en Hugging Face, por lo que su validacion por la comunidad es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Remtir/AksonOCR-Lite
- Benchmarks completos: BENCHMARKS.md (referenciado en la model card, dentro del repositorio)
- Script de visualizacion: tools/visualize_gif.py (referenciado en la model card)
- Paquete pip: `aksonocr-lite` (instalacion via `pip install aksonocr-lite`)
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios independientes ni demos adicionales.
