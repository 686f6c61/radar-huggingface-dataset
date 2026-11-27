# iapp/OpenThai2.2-OCR-Text-20261127

## Resumen

OpenThai2.2-OCR-Text-20261127 es un sistema OCR especializado en texto impreso en tailandés e inglés, desarrollado por iApp Technology dentro de la familia OpenThai (anteriormente OpenThaiGPT) y presentado junto a AIEAT. Se trata del motor que impulsa iApp Document OCR v3.0 y está diseñado para ejecutarse íntegramente en CPU, sin necesidad de GPU, lo que lo convierte en una opción poco habitual dentro del segmento OCR de alta calidad para tailandés.

El modelo es extremadamente compacto: 2,02 millones de parámetros en total distribuidos en cuatro módulos ONNX (detector, reconocedor principal, segundo reconocedor para fuentes sin bucle y clasificador del dígito ๙), con un peso conjunto de aproximadamente 8 MB. Devuelve el texto de una página en orden de lectura, con una caja delimitadora y una puntuación de confianza por línea, y su runtime resuelve automáticamente rotaciones, inclinaciones, maquetación multicolumna y texto claro sobre fondo oscuro.

Su relevancia actual radica en la combinación de precisión y coste: según la model card, supera a Typhoon OCR V2 0.8B en la media de 12 conjuntos de evaluación de texto impreso tailandés e inglés (88,2 frente a 85,1 en precisión de caracteres) procesando una página en 0,39 segundos en CPU, frente a los 1,71 segundos por página en H100 del competidor. Está publicado bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector PP-OCRv6-tiny (428K) + reconocedor (587K) + segundo reconocedor para fuentes sin bucle (587K) + clasificador del dígito ๙ (422K) |
| Parametros totales | 2,02 M (2.020.000) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo por líneas de texto, no generativo) |
| Tipos de cuantizacion | No disponible; se distribuye en ONNX con soporte de bfloat16 en OpenVINO sobre CPU con AMX |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`det.onnx`, `rec.onnx`, `rec2.onnx`, `judge9.onnx`), aproximadamente 8 MB en total |

## Arquitectura y entrenamiento

El sistema no es un modelo generativo único sino un pipeline de detección y reconocimiento de líneas construido sobre PaddlePaddle PP-OCRv6-tiny (Apache-2.0). El detector localiza las líneas de texto en la página; el reconocedor principal transcribe cada línea; un segundo reconocedor especializado cubre fuentes sin bucle (tipografías de imprenta antigua y máquina de escribir); y un pequeño clasificador (`judge9.onnx`) corrige de forma conservadora la confusión entre el ๙ y el ๕ del tailandés antiguo, pudiendo únicamente transformar ๕ en ๙ y sin alterar el resto de la salida. El runtime en Python (carpeta `runtime/`) aplica además enderezado de páginas giradas o invertidas, corrección de inclinación (deskew), lectura columna a columna en maquetaciones de dos y tres columnas preservando el orden de filas en tablas y listas, manejo de texto claro sobre fondo oscuro y recolocación de marcas tonales flotantes de la imprenta antigua.

El entrenamiento se realizó sobre 410.270 líneas de texto reales (escaneos judiciales, PDF de presupuestos parlamentarios y libros antiguos de Wikisource tailandés) más líneas sintéticas, empleando GPUs NVIDIA H100 proporcionadas por Siam AI. No se documenta en la información disponible el uso de RLHF, DPO ni fases de alineación, algo esperable en un modelo OCR discriminativo. La versión 2.2.0 añadió un módulo opcional de aplanado de fotografías de móvil mediante el preprocesador UVDoc (exportación ONNX de PaddlePaddle), desactivado por defecto y que no afecta a escaneos ni PDF.

## Capacidades

- Reconocimiento de texto impreso en tailandés e inglés con salida en orden de lectura, caja delimitadora y confianza por línea.
- Detección y lectura de maquetaciones multicolumna (dos y tres columnas), manteniendo el orden de filas en tablas y listas.
- Normalización automática de páginas giradas o invertidas y corrección de inclinación.
- Lectura de texto claro sobre fondo oscuro y de texto coloreado.
- Manejo de fuentes sin bucle propias de imprenta antigua y máquina de escribir mediante un segundo reconocedor dedicado.
- Corrección específica de la confusión ๙/๕ en documentos antiguos (versión 2.2.1).
- Aplanado opcional de fotografías de móvil mediante dewarping UVDoc (versión 2.2.0, desactivado por defecto).
- Ejecución en CPU con OpenVINO o ONNX Runtime, sin dependencia de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades generativas: es un modelo de imagen a texto de propósito específico.

## Casos de uso

- Digitalización masiva de boletines oficiales: el modelo alcanza 97,8 de precisión de caracteres en el Royal Gazette tailandés y puede procesar unas 57.000 páginas por hora en 8 núcleos de CPU, lo que permite reindexar archivos completos sin coste de GPU.
- Procesamiento de resoluciones judiciales: con 97,0 de precisión en sentencias del Tribunal Administrativo, encaja en flujos de gestión documental legal donde se requiere extracción fiable de texto para búsqueda y revisión.
- Archivística de libros antiguos: el segundo reconocedor para fuentes sin bucle y el clasificador ๙ permiten tratar prensa antigua y libros de Wikisource (78,8 de precisión) con menos errores en numerales tailandeses críticos.
- Digitalización de documentación presupuestaria pública: 99,6 de precisión en PDF parlamentarios lo hace adecuado para pipelines de transparencia y publicación de datos abiertos.
- Escaneo de documentos corporativos en infraestructura sin GPU: al requerir solo CPU y unos 450 MB de RAM por proceso, puede desplegarse en servidores modestos, contenedores o incluso equipos de sobremesa.
- Preprocesado para pipelines RAG o de búsqueda: la salida estructurada por líneas con cajas y confianza permite alimentar índices de recuperación o sistemas de extracción posteriores sobre documentos tailandeses.
- Digitalización de fotografías de documentos con móvil: activando el dewarping opcional, la precisión en fotos simuladas de teléfono sube de 86,7 a 90,5, útil en aplicaciones de captura en campo.

## Benchmarks y rendimiento

Datos publicados en la model card (precisión de caracteres, mayor es mejor):

| Conjunto de evaluación | OpenThai2.2-OCR-Text 0.002B | Typhoon OCR V2 0.8B |
|---|---|---|
| Media de 12 conjuntos impresos th/en | 88,2 | 85,1 |
| Sentencias del Tribunal Administrativo | 97,0 | 95,6 |
| Royal Gazette | 97,8 | 96,0 |
| Documentos presupuestarios del Parlamento | 99,6 | 85,9 |
| Libros antiguos (Wikisource tailandés) | 78,8 | 76,3 |
| Recortes OCR104 th+en | 87,9 | 82,1 |
| Páginas completas ThaiOCRBench | 83,8 | 86,1 |
| Manuscrito | 10,3 | 69,8 |
| Recibos | 68,3 | 77,8 |

| Métrica operativa | OpenThai2.2-OCR-Text | Typhoon OCR V2 0.8B |
|---|---|---|
| Hardware | CPU | GPU NVIDIA |
| Segundos por página | 0,39 (Intel Xeon, 24 páginas impresas) | 1,71 (H100, con cabeza EAGLE-3) |
| Throughput | ~57.000 páginas/hora en 8 núcleos | Requiere GPU |

La ventaja media de +3,1 se mantiene en el extremo inferior del intervalo de confianza del 95% (+1,4 a +4,9) tras remuestreo de las páginas de test. Typhoon OCR V2 0.8B supera al modelo en manuscrito, recibos, texto en escena y páginas completas de ThaiOCRBench.

## Requisitos de hardware

- VRAM: no aplica; ejecución exclusiva en CPU.
- RAM: aproximadamente 450 MB por proceso trabajador.
- CPU: cualquier CPU x86 moderna; OpenVINO aprovecha bfloat16 en procesadores con AMX. También funciona con ONNX Runtime.
- GPU: no necesaria ni soportada como requisito; el modelo está pensado para CPU.
- Despliegue: runtime Python propio (`runtime/line_engine.py`) sobre OpenVINO u ONNX Runtime; recomendación del autor de un proceso por núcleo con `threads=1`, ya que el multihilo en un solo proceso deja de escalar a partir de unos 2 núcleos.
- Latencia: 0,39 segundos por página en un solo hilo sobre Intel Xeon (medición del autor, 24 páginas impresas).
- Throughput: aproximadamente 57.000 páginas por hora en 8 núcleos de CPU.
- Dependencias: `openvino` (u `onnxruntime`), `opencv-python-headless`, `pyclipper`, `numpy`, `huggingface_hub`; `onnxruntime` adicional para el dewarping opcional.

## Comparativa con modelos similares

| Modelo | Parámetros | Hardware | Precisión media (12 conjuntos) | Manuscrito | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenThai2.2-OCR-Text 0.002B | 2,02 M | CPU | 88,2 | 10,3 | Apache-2.0 | Hugging Face (ONNX) |
| Typhoon OCR V2 0.8B | 0,8 B | GPU NVIDIA | 85,1 | 69,8 | No disponible en la información proporcionada | Hugging Face |
| OpenThai2.2-OCR-Markdown-20261127 | No disponible | No disponible | No disponible | No disponible | Apache-2.0 (según referencia de la model card) | Hugging Face (mismo autor) |

Frente a Typhoon OCR V2 0.8B, el modelo de iApp es aproximadamente 400 veces menor en parámetros, funciona sin GPU y gana en texto impreso, pero pierde claramente en manuscrito y recibos. El modelo Markdown del mismo autor cubre el caso de tablas y conversión a Markdown que este modelo no aborda.

## Limitaciones y advertencias

- Solo texto impreso: el rendimiento en manuscrito es muy bajo (10,3 frente a 69,8 de Typhoon OCR V2 0.8B) y el autor indica explícitamente que no está orientado a escritura manual.
- Recibos fotografiados en ángulo y texto en escena (scene text) se leen con dificultad; precisión de 68,3 en recibos.
- No genera tablas ni Markdown; para esos casos hay que usar OpenThai2.2-OCR-Markdown-20261127.
- Un ๙ que el detector o el reconocedor pierdan no se recupera con el clasificador; este solo puede cambiar ๕ por ๙.
- Cobertura lingüística limitada a tailandés e inglés; no se documenta soporte de otros idiomas.
- Las cifras de latencia comparada no se midieron sobre las mismas páginas (las del modelo en CPU con 24 páginas impresas; las de Typhoon en H100 con páginas de documento tailandés), por lo que el autor advierte que deben leerse como orientativas y no como una ratio exacta.
- El dewarping para fotos de móvil está desactivado por defecto y requiere descargar un modelo ONNX adicional de PaddlePaddle (UVDoc).
- No se documentan sesgos específicos más allá de las limitaciones de dominio anteriores; al ser un modelo OCR discriminativo, el riesgo de alucinación se traduce en errores de transcripción, no en texto inventado de forma generativa.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; el modelo se apoya en PP-OCRv6-tiny (Apache-2.0) y en la máscara de página de MonkeyOCRv2 (Apache-2.0), cuyas condiciones deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.2-OCR-Text-20261127
- Modelo Markdown del mismo autor: https://huggingface.co/iapp/OpenThai2.2-OCR-Markdown-20261127
- Guía de ejecución (inglés): https://iapp.co.th/en/blog/openthai2p0-ocr-how-to-run
- Guía de ejecución (tailandés): https://iapp.co.th/blog/openthai2p0-ocr-how-to-run
- Guía de ejecución (chino): https://iapp.co.th/zh-CN/blog/openthai2p0-ocr-how-to-run
- API Document OCR de iApp: https://iapp.co.th/docs/ocr/document
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
- Preprocesador UVDoc (ONNX): https://huggingface.co/PaddlePaddle/UVDoc_onnx
- Preprocesador MonkeyOCRv2 (máscara de página): https://huggingface.co/zenosai/MonkeyOCRv2-S-Parsing
- Modelo base PP-OCRv6-tiny: no disponible como enlace directo en la información proporcionada
