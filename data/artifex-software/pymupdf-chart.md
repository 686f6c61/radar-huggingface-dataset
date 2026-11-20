# artifex-software/pymupdf-chart

## Resumen

PyMuPDF Chart 0.1.0 es un modelo de visión-lenguaje especializado en una única tarea: leer la imagen de un gráfico y devolver sus datos como una tabla de texto plano. Lo desarrolla Artifex Software, la empresa detrás de PyMuPDF, y está pensado como componente del flujo de extracción de PDF: cuando PyMuPDF detecta un gráfico en una página, este modelo lo convierte en una tabla estructurada que el resto del pipeline puede procesar. Con 905.601.648 parámetros y un peso de repositorio de 1,8 GB, es un modelo compacto, diseñado para ejecutarse en GPU de forma local y con un consumo de memoria muy bajo.

Técnicamente es un fine-tuning de PaddleOCR-VL, un VLM de la familia PaddlePaddle, cuyos pesos se han ajustado y cuyos ficheros de configuración se han convertido al formato nativo de Transformers. La tarea se plantea como image-text-to-text con un prompt fijo ("Chart Recognition:") y una salida tabular delimitada por barras verticales, una fila por línea. Solo admite una imagen por inferencia y su salida se trunca a 2048 tokens nuevos.

Su relevancia es acotada pero clara: cubre el caso concreto de digitalizar gráficos incrustados en documentos PDF, un problema habitual en extracción documental donde los OCR genéricos fallan porque no reconstruyen la relación eje-serie-valor. La licencia Apache 2.0 y la integración con Transformers lo hacen fácil de desplegar, aunque el modelo es muy reciente, con cero interacciones en Hugging Face y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en PaddleOCR-VL, con pesos ajustados por fine-tuning y configuración convertida a formato nativo de Transformers |
| Parametros totales | 905.601.648 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la generación se trunca a 2048 tokens nuevos) |
| Tipos de cuantizacion | no disponible (la model card solo documenta inferencia en bfloat16) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de PaddleOCR-VL, un VLM orientado a reconocimiento documental. No se detalla en la información disponible la arquitectura interna del backbone (componentes de visión, proyector multimodal y decoder de lenguaje), ni el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se aplicaron técnicas de RLHF o DPO. Lo que sí se especifica es que los pesos originales se modificaron mediante fine-tuning y que los ficheros de configuración se convirtieron al formato nativo de Transformers, lo que permite cargarlo con `AutoModelForImageTextToText` y `AutoProcessor`.

La innovación técnica relevante no está en la arquitectura sino en la interfaz: el modelo acepta una plantilla de chat con una imagen y un prompt textual, y produce una salida tabular en texto plano con celdas separadas por ` | `, encabezado primero y una fila por línea, un formato trivial de parsear a Markdown o a estructuras de datos. La decodificación se hace de forma determinista (`do_sample=False`), lo que encaja con una tarea de extracción donde se busca reproducibilidad.

## Capacidades

- Conversión de imagen de gráfico a tabla de datos en texto plano, con encabezado y filas delimitadas por ` | `.
- Lectura de etiquetas de categorías, series y valores numéricos impresos en el gráfico.
- Estimación de valores no impresos a partir de la posición respecto a los ejes (según advierte el propio autor).
- Procesamiento de una única imagen por inferencia, en el contexto de un chat multimodal.
- Integración con PyMuPDF para el flujo PDF → detección de gráfico → tabla.
- Soporte de los idiomas inglés y coreano según los metadatos del modelo.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, audio ni modo thinking.

## Casos de uso

- Extracción de datos de gráficos en informes PDF: PyMuPDF localiza el gráfico en la página, se recorta la imagen y el modelo devuelve la tabla; el resultado se inserta en el pipeline de extracción documental para su posterior análisis o carga en base de datos.
- Digitalización de dashboards y presentaciones corporativas: a partir de capturas de gráficos de barras o líneas se obtiene una tabla que alimenta hojas de cálculo o informes, evitando la transcripción manual de valores.
- Enriquecimiento de repositorios documentales: procesamiento por lotes de miles de PDFs técnicos o financieros para indexar las series numéricas de sus gráficos y hacerlas consultables por búsqueda.
- Automatización de auditorías y control de calidad documental: comparación de la tabla extraída con la fuente original para detectar discrepancias en cifras reportadas.
- Preprocesado para pipelines de RAG sobre documentación técnica: las tablas extraídas de gráficos se convierten en fragmentos de texto estructurado que se indexan junto al resto del contenido del PDF.
- Extracción de series temporales de gráficos de evolución: conversión de gráficos de líneas en tablas de fecha-valor para su carga en herramientas de analítica.
- Prototipado local en estaciones de trabajo con GPU de gama media: al requerir unos 2 GB de VRAM, permite montar un servicio de extracción de gráficos en una única GPU consumer sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB de memoria GPU para inferencia, según la model card.
- GPU: se requiere una GPU CUDA; la inferencia en CPU no está soportada. No se especifican modelos concretos de GPU.
- GPU consumer: por el consumo de 2 GB, cabe holgadamente en cualquier GPU consumer moderna con soporte CUDA; el autor no detalla modelos probados.
- Entorno software: Python 3.12, PyTorch con compilación CUDA y torchvision, y Transformers 5.13 o superior. Probado en Linux x86-64 con PyTorch 2.12.1 (CUDA 13.0), PyTorch 2.15.0 (CUDA 13.2) y Transformers 5.23.0.
- Opciones de despliegue: carga directa con Transformers (`AutoModelForImageTextToText` + `AutoProcessor`), con `dtype=torch.bfloat16`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PyMuPDF Chart 0.1.0 | 905.601.648 | no disponible | Gráfico a tabla | Apache 2.0 | Hugging Face, transformers |
| PaddleOCR-VL (modelo base) | no disponible | no disponible | OCR y reconocimiento documental multimodal | Apache 2.0 | PaddlePaddle / Hugging Face |
| OCR genéricos (p. ej. Tesseract) | no aplica (no es un modelo neuronal de lenguaje) | no aplica | Texto en imagen | Apache 2.0 / varias | Amplia |

La comparación con PaddleOCR-VL es la más directa: PyMuPDF Chart es un ajuste del mismo sobre una tarea concreta, con menor alcance pero salida tabular normalizada. Frente a un OCR genérico, la diferencia es funcional: el OCR transcribe texto, mientras que este modelo reconstruye la estructura tabla a partir de la semántica del gráfico. No se dispone de datos de rendimiento comparativos entre estas alternativas.

## Limitaciones y advertencias

- Las etiquetas, los valores, las unidades y las series pueden ser incorrectos; el propio autor recomienda comparar el resultado con el gráfico original antes de confiar en él.
- Los valores que no están impresos en el gráfico son estimaciones leídas de los ejes, no datos exactos.
- El rendimiento empeora con figuras de varios paneles, leyendas o ejes fuera de la imagen, y con tablas muy largas.
- La salida se trunca a 2048 tokens nuevos, lo que limita el tamaño de tabla extraíble.
- Una imagen que no sea un gráfico puede producir igualmente una tabla, sin señal de error explícita.
- Solo procesa una imagen por inferencia y no admite CPU; requiere GPU CUDA.
- Idiomas declarados: inglés y coreano; no hay evidencia de soporte para castellano en las etiquetas de los gráficos.
- Riesgo de alucinación inherente a la estimación de valores no impresos y a la reconstrucción de series.
- Licencia Apache 2.0 para los pesos del modelo; PyMuPDF se licencia por separado bajo GNU AGPL v3.0 o licencia comercial de Artifex, lo que condiciona el uso combinado en productos propietarios.
- Modelo muy reciente y sin adopción registrada (2 descargas, 0 likes en el momento de la consulta), sin benchmarks publicados que permitan validar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artifex-software/pymupdf-chart
- Repositorio de PyMuPDF: https://github.com/pymupdf/PyMuPDF
- Modelo base PaddleOCR-VL: no disponible en la información proporcionada
