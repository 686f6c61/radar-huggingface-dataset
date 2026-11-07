# opticsWolf/rapidocr-onnx

## Resumen

RapidOCR PP-OCRv4 ONNX (det + rec) es un repositorio de servicio publicado por el usuario opticsWolf en Hugging Face que empaqueta los modelos móviles de detección y reconocimiento de texto de PP-OCRv4 en formato ONNX. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un pipeline OCR clásico compuesto por dos redes: un detector DBNet (detección de cajas de texto) y un reconocedor SVTR-LCNet (transcripción de las cajas detectadas). Los ficheros son byte a byte idénticos a los que distribuye el proyecto RapidOCR bajo la ruta `PP-OCRv4/ch_PP-OCRv4_{det,rec}_infer.onnx`, de la familia PaddleOCR y con licencia Apache-2.0.

El repositorio no aporta pesos nuevos ni fine-tuning: su función es servir como punto de descarga estable y plano (los ficheros se han aplanado desde la subcarpeta `PP-OCRv4/` a la raíz del repo) para integraciones que consumen ONNX Runtime. Está pensado para un flujo concreto: recortes preprocesados sobre un lienzo de 488 píxeles como entrada, y como salida cajas de texto (detección) y cadenas de caracteres (reconocimiento).

Su relevancia es práctica: permite desplegar OCR offline, multiplataforma y sin dependencias de PaddlePaddle, ya que el reconocedor embebe su juego de caracteres en los metadatos `character` del propio ONNX. Al ser un repositorio de servicio con cero descargas y cero likes en el momento de la consulta, debe tratarse como un espejo de conveniencia y no como una fuente canónica; para producción conviene referenciar el repositorio upstream de RapidOCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector DBNet (PP-OCRv4 mobile det) + reconocedor SVTR-LCNet (PP-OCRv4 mobile rec) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje); entrada preprocesada sobre lienzo de 488 píxeles |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX; no se documentan variantes cuantizadas en el repo) |
| Idiomas soportados | no disponible en la model card; el reconocedor embebe su charset en los metadatos `character` del ONNX (los ficheros `ch_PP-OCRv4_*` de PaddleOCR corresponden al conjunto de caracteres chino, con cobertura latina limitada) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (dos ficheros: detección y reconocimiento) |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos ONNX independientes que se ejecutan en secuencia. La etapa de detección emplea DBNet en su variante móvil de PP-OCRv4, una red totalmente convolucional que predice un mapa de probabilidad de región de texto y a partir de él deriva los polígonos o cajas mediante umbralización y expansión. La etapa de reconocimiento emplea SVTR-LCNet, una arquitectura que combina el extractor SVTR (Scene Text Recognition con atención a secuencias) con un backbone LCNet optimizado para inferencia en CPU; el juego de caracteres no se distribuye como fichero aparte, sino que va embebido en los metadatos `character` del propio modelo ONNX.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre si hubo etapas de ajuste fino adicionales: los pesos son los originales de PaddleOCR distribuidos por RapidOCR, sin modificaciones. La innovación técnica relevante no está en el entrenamiento sino en el empaquetado: conversión a ONNX para eliminar la dependencia del runtime de Paddle, aplanado de rutas para simplificar la descarga y verificación por sha256 frente al upstream. El preprocesado documentado fija recortes sobre un lienzo de 488 píxeles, lo que condiciona el rendimiento en escenas con texto muy pequeño o muy denso.

## Capacidades

- Detección de regiones de texto en imágenes mediante DBNet, con salida de cajas o polígonos.
- Reconocimiento de texto en las regiones detectadas mediante SVTR-LCNet, con salida de cadenas.
- Ejecución offline sin dependencia de PaddlePaddle, únicamente con un runtime ONNX.
- Despliegue multiplataforma (Python, C++, Java, C#, dispositivos edge) a través del ecosistema RapidOCR.
- Charset embebido en los metadatos del ONNX de reconocimiento, lo que simplifica el empaquetado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking: no es un modelo generativo.
- No soporta visión general más allá de OCR: no describe imágenes ni responde preguntas sobre su contenido.
- Capacidades multilingües: no documentadas en el repo; dependen del charset embebido en los pesos.

## Casos de uso

- Digitalización de documentos escaneados: el pipeline det+rec extrae el texto de facturas, contratos y formularios en local, sin enviar imágenes a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Procesamiento por lotes en servidores sin GPU: al ser modelos móviles en ONNX, se ejecutan en CPU con un consumo de recursos bajo, adecuado para pipelines nocturnos de indexación documental.
- Integración en aplicaciones de escritorio o móviles: el soporte de RapidOCR para Python, C++, Java y C# permite incrustar el OCR en clientes nativos y funciona sin conexión.
- Extracción de matrículas, tickets o etiquetas en sistemas de logística: la detección DBNet localiza las regiones y el reconocedor transcribe el texto para alimentar un sistema de inventario o trazabilidad.
- Preprocesado para pipelines RAG sobre documentos físicos: el texto extraído se trocea e indexa en una base vectorial; el OCR actúa como primera etapa antes de cualquier modelo de lenguaje.
- Automatización de archivo histórico: digitalización masiva de fondos documentales con verificación por sha256 de los pesos desplegados, lo que facilita la reproducibilidad y la auditoría del pipeline.
- Sustitución de dependencias pesadas: equipos que ya usan PaddleOCR pueden migrar a ONNX Runtime para reducir el tamaño de la imagen de contenedor y las dependencias nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; al tratarse de modelos móviles de PP-OCRv4, el consumo es bajo y la inferencia en CPU es viable.
- GPU recomendadas: no documentadas; cualquier GPU con soporte de ONNX Runtime (por ejemplo, serie RTX o A100/H100) puede ejecutar el grafo, aunque el modelo no está optimizado para aceleradores de altas prestaciones.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer con soporte CUDA o DirectML, dado el reducido tamaño de los modelos móviles; no se dispone de cifras exactas de memoria.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT), RapidOCR como toolkit de orquestación, y los bindings de RapidOCR para Python, C++, Java y C#.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opticsWolf/rapidocr-onnx (este repo) | DBNet + SVTR-LCNet (PP-OCRv4 mobile) | ONNX | no disponible (charset embebido) | Apache-2.0 | Hugging Face, espejo de servicio |
| SWHL/RapidOCR (upstream) | DBNet + SVTR-LCNet (PP-OCRv4 y otras variantes) | ONNX, OpenVINO, MNN, PaddlePaddle, PyTorch | múltiples según modelo | Apache-2.0 | Hugging Face / ModelScope, fuente canónica |
| PaddleOCR (PP-OCRv4) | DBNet + SVTR-LCNet | PaddlePaddle, con exportación a ONNX | múltiples | Apache-2.0 | Repositorio oficial de PaddleOCR |
| Tesseract OCR | LSTM sobre características | binario propio, no ONNX | múltiples | Apache-2.0 | Repositorio oficial |

La comparativa se limita a la familia PaddleOCR/RapidOCR y a Tesseract porque no se dispone de datos de rendimiento del repositorio evaluado que permitan contrastarlo con alternativas como EasyOCR o docTR.

## Limitaciones y advertencias

- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado con cinco segundos de diferencia: no hay evidencia de mantenimiento ni de uso en producción.
- Es un espejo de servicio, no la fuente canónica: para producción conviene referenciar `SWHL/RapidOCR` y verificar los sha256 indicados en la model card.
- El charset embebido corresponde a los ficheros `ch_PP-OCRv4_*`, orientados a chino; la cobertura de otros idiomas no está documentada y puede ser insuficiente para texto en castellano con acentos y caracteres especiales.
- El preprocesado fija un lienzo de 488 píxeles, lo que puede degradar la precisión en textos muy pequeños, densos o con tipografías poco habituales.
- Riesgo de error en escenas con ruido, baja resolución, rotaciones severas o texto manuscrito; el modelo está entrenado para texto impreso.
- No es un modelo generativo: no admite instrucciones en lenguaje natural ni razonamiento; cualquier lógica de negocio debe implementarse alrededor del pipeline.
- La licencia Apache-2.0 permite uso comercial, pero al tratarse de pesos de PaddleOCR conviene revisar también las condiciones del proyecto upstream.
- No se documentan sesgos, tasas de alucinación ni métricas de calidad; la evaluación debe hacerse sobre el corpus concreto de cada despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/opticsWolf/rapidocr-onnx
- Repositorio upstream de pesos: https://huggingface.co/SWHL/RapidOCR
- Documentación de RapidOCR (lista de modelos): https://rapidai.github.io/RapidOCRDocs/main/en/model_list/
- Documentación de RapidOCR (portada): https://rapidai.github.io/RapidOCRDocs/main/en/
- Proyecto PaddleOCR: no disponible en la información proporcionada
