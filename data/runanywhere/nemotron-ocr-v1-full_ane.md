# runanywhere/nemotron-ocr-v1-full_ANE

## Resumen

El modelo `runanywhere/nemotron-ocr-v1-full_ANE` es una conversión completa del sistema de reconocimiento óptico de caracteres (OCR) de NVIDIA, Nemotron-OCR v1, adaptado para ejecutarse en el Apple Neural Engine (ANE). A diferencia de otras conversiones parciales que solo incluían el reconocedor, este bundle integra tanto el detector de texto (basado en FOTS/RegNet) como el reconocedor de líneas (basado en CTC), formando un pipeline funcional de extremo a extremo. El detector produce un mapa de características de 128 canales que alimenta directamente al reconocedor, lo que hace que el par sea un sistema completo y no dos modelos independientes.

El desarrollo corre a cargo de RunAnywhere, que ha empaquetado el modelo en formato NeuRT, un formato de bundle optimizado para el ANE. El repositorio ocupa 0,2 GB y se distribuye bajo la licencia NVIDIA Open Model License. La relevancia de esta conversión radica en que permite ejecutar un OCR de última generación en hardware Apple (específicamente en chips con Neural Engine) con una aceleración significativa: en un M4 Max, el detector tarda 89,55 ms con el ANE activado frente a 186,65 ms en modo solo CPU, es decir, 2,08 veces más rápido. El modelo está diseñado para la tarea de image-to-text y su uso principal es el reconocimiento de texto en imágenes y documentos complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector FOTS/RegNet + reconocedor CTC (pipeline de dos etapas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen) |
| Tipos de cuantizacion | no disponible (optimizado para ANE, probablemente cuantizado internamente) |
| Idiomas soportados | no disponibles |
| Licencia | nvidia-open-model-license |
| Formato de pesos | NeuRT bundle (CoreML/ANE) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA, Nemotron-OCR v1, integra tres módulos: un detector de regiones de texto, un reconocedor de líneas y un modelo relacional para el análisis de layout y orden de lectura. En esta conversión para ANE, el pipeline se compone de dos grafos principales: el detector, que toma una imagen de entrada de forma `[1, 3, 960, 960]` y produce tres salidas (mapa de confianza `[1, 240, 240]`, geometría de cajas rotadas `[1, 240, 240, 5]` y un mapa de características de 128 canales `[1, 128, 240, 240]`), y el reconocedor, que consume un crop de ese mapa de características de forma `[1, 128, 8, 32]` y genera logits CTC `[1, 1, 32, 858]`. El mapa de características del detector es la entrada real del reconocedor, lo que justifica que ambos deban ir juntos.

El entrenamiento del modelo base fue realizado por NVIDIA, aunque no se proporcionan detalles sobre el dataset ni el proceso de entrenamiento en la información disponible. La conversión de RunAnywhere se centra en la optimización para el ANE: los grafos son convoluciones, normalización por lotes, ReLU y squeeze-excite, que son operaciones amigables para el Neural Engine. Todo el post-procesado (NMS, `rrect_to_quads`, `quad_rectify`, `indirect_grid_sample` y colapso CTC) se ejecuta en el host, siguiendo la misma división que el modelo original. Los tensores de salida se nombran como `var_NNNN` y deben leerse por nombre declarado, no por posición, según el archivo `*_detector.iodesc.json`.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de extremo a extremo sobre imágenes y documentos complejos.
- Detección de regiones de texto con cajas rotadas (rbox) y mapa de confianza.
- Reconocimiento de líneas de texto mediante decodificación CTC.
- Análisis de layout y orden de lectura (según la descripción del modelo base, aunque no se detalla en esta conversión).
- Aceleración por hardware mediante Apple Neural Engine, con soporte para ejecución en CPU como respaldo.
- Integración con el runtime de RunAnywhere (NeuRT) para despliegue en dispositivos Apple.

## Casos de uso

- Digitalización de documentos en dispositivos Apple: el modelo puede extraer texto de escaneos o fotografías de documentos directamente en un iPhone o Mac, aprovechando el ANE para un procesamiento rápido y eficiente energéticamente.
- Aplicaciones de accesibilidad: conversión de texto impreso en imágenes a voz o texto digital para personas con discapacidad visual, con latencia reducida gracias a la aceleración por hardware.
- Procesamiento de facturas y recibos en apps de contabilidad: la detección de regiones de texto y el reconocimiento de líneas permiten extraer campos clave (importes, fechas, proveedores) de imágenes capturadas con la cámara.
- Búsqueda de texto en bibliotecas de fotos: indexación de imágenes mediante OCR para permitir búsquedas por contenido textual, ejecutable localmente en el dispositivo sin necesidad de servidores.
- Automatización de entrada de datos en flujos de trabajo empresariales: integración en pipelines de captura de documentos donde el OCR se ejecuta en Macs con ANE, reduciendo costes de infraestructura.
- Análisis de documentos escaneados en entornos legales o administrativos: extracción de texto de contratos, formularios y expedientes para su posterior procesamiento, con la ventaja de que el modelo funciona sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) para este modelo, ya que se trata de una tarea de OCR y no de razonamiento general. La información disponible incluye mediciones de fidelidad y latencia realizadas en un Apple M4 Max, comparando la salida del bundle con la referencia de torch sobre la imagen de ejemplo del paquete:

| Metrica | Valor |
|---|---|
| Coseno minimo (confianza) | 0,99995617 |
| Coseno minimo (geometria rbox) | 0,99993401 |
| Coseno minimo (mapa de caracteristicas) | 0,99999610 |
| Coseno minimo global | 0,99993401 (umbral de referencia: 0,999) |
| Latencia del detector (cpuAndNeuralEngine) | 89,55 ms |
| Latencia del detector (cpuOnly) | 186,65 ms |
| Aceleracion con ANE | 2,08x |

Estos datos indican que la conversión mantiene una alta fidelidad respecto al modelo original (coseno superior a 0,999) y que el uso del ANE reduce significativamente la latencia.

## Requisitos de hardware

- Requiere un dispositivo Apple Silicon con Neural Engine (ANE). Probado en M4 Max, pero debería funcionar en otros chips de la serie M con ANE.
- Memoria: el tamaño del repositorio es de 0,2 GB, por lo que cabe en la memoria unificada de cualquier Mac o iPad con Apple Silicon. No se especifica la VRAM exacta.
- GPU: no aplica, el modelo se ejecuta principalmente en el ANE, con respaldo en CPU.
- Opciones de despliegue: runtime de RunAnywhere (formato NeuRT). No se menciona compatibilidad con vLLM, llama.cpp u otros frameworks.
- Latencia: el detector tarda 89,55 ms con ANE y 186,65 ms en modo solo CPU en un M4 Max. La latencia del reconocedor no se ha publicado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de OCR en la información proporcionada. El modelo base de NVIDIA, Nemotron-OCR v1, es la referencia directa, pero no se han publicado métricas comparativas de rendimiento (precisión, velocidad) frente a alternativas como PaddleOCR, Tesseract o modelos basados en visión-lenguaje como GPT-4V. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está optimizado exclusivamente para Apple Neural Engine; no funcionará en GPUs NVIDIA o AMD ni en arquitecturas x86 sin el runtime adecuado.
- La conversión presenta una ligera desviación respecto al modelo original (coseno mínimo de 0,99993401), lo que podría afectar a casos extremos de precisión.
- No se especifican los idiomas soportados; se asume que hereda las capacidades del modelo base de NVIDIA, pero no hay confirmación.
- El post-procesado (NMS, rectificación, etc.) se ejecuta en el host, lo que añade latencia adicional fuera del ANE.
- La licencia es NVIDIA Open Model License; es necesario revisar los términos para uso comercial, especialmente si se redistribuye el modelo o sus derivados.
- No se proporcionan datos sobre el dataset de entrenamiento ni sobre posibles sesgos en el reconocimiento de ciertos tipos de letra o idiomas.
- El runtime de RunAnywhere es necesario para cargar el bundle; no se garantiza compatibilidad con otros frameworks de inferencia.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/runanywhere/nemotron-ocr-v1-full_ANE
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-ocr-v1
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-ocr-v1/modelcard
- Repositorio GitHub (theone25): https://github.com/theone25/nemotron-ocr-v1
- README del modelo en GitHub (MrWhilhelmSan): https://github.com/MrWhilhelmSan/nemotron-ocr-v1/blob/main/README.md
