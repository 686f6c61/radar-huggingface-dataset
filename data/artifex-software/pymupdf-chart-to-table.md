# artifex-software/pymupdf-chart-to-table

## Resumen

PyMuPDF Chart 0.1.0 es un modelo de vision-lenguaje especializado en una unica tarea: leer la imagen de un grafico (chart) y devolver los datos que contiene en formato de tabla de texto. Lo desarrolla Artifex Software, la empresa responsable de la libreria PyMuPDF, y esta pensado para integrarse en el flujo de conversion de PDF en el que PyMuPDF detecta graficos dentro de una pagina y necesita extraer sus valores de forma estructurada. El modelo se presenta como un fine-tuning de PaddleOCR-VL, un VLM de PaddlePaddle, y se distribuye con licencia Apache 2.0.

Tecnicamente es un modelo compacto: 905.601.648 parametros totales (unos 906 millones) en formato safetensors, con un repositorio de 1,8 GB. La entrada es una sola imagen de grafico por inferencia y la salida es texto plano con una fila de tabla por linea, celdas separadas por ` | ` y la cabecera en primer lugar. No es un modelo conversacional general ni un asistente multimodal: es una herramienta de extraccion de un solo paso, con un prompt fijo ("Chart Recognition:") y decodificacion determinista.

Su relevancia es acotada pero concreta: cubre el hueco de la conversion grafico-a-tabla dentro de pipelines documentales, donde los OCR tradicionales fallan porque no interpretan ejes, leyendas ni series. Al estar afinado sobre PaddleOCR-VL y publicarse en formato nativo de Transformers, se puede cargar con `AutoModelForImageTextToText` sin dependencias propietarias, aunque requiere GPU CUDA y una version muy reciente de Transformers (5.13 o superior).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (fine-tuning de PaddleOCR-VL); detalles internos de la arquitectura no disponibles |
| Parametros totales | 905.601.648 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible; la generacion se trunca a 2048 tokens nuevos |
| Tipos de cuantizacion | no disponible; la model card solo documenta inferencia en bfloat16 |
| Idiomas soportados | ingles (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato nativo de Transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de PaddleOCR-VL, un VLM de PaddlePaddle (Copyright 2025 PaddlePaddle Authors, Apache 2.0). La model card indica explicitamente que los pesos se modificaron mediante fine-tuning y que los ficheros de configuracion se convirtieron al formato nativo de Transformers. No se detalla en la informacion disponible la composicion del dataset de ajuste, el numero de tokens de entrenamiento, ni si se emplearon tecnicas de RLHF, DPO o similar; tampoco se especifican innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.).

La unica innovacion documentada es de interfaz y de formato de salida: el modelo acepta una imagen de grafico y un prompt de texto fijo, y produce una representacion tabular en texto plano (una fila por linea, celdas separadas por ` | `, cabecera primero) que el usuario convierte a Markdown anadiendo los delimitadores de tabla. La generacion se realiza con `do_sample=False` y `max_new_tokens=2048`, lo que implica un comportamiento determinista y un limite duro de longitud de salida.

## Capacidades

- Conversion de imagen de grafico a tabla de datos en texto plano, con cabecera y filas.
- Extraccion de etiquetas de categoria, valores numericos y, en su caso, unidades y series.
- Lectura de valores impresos en el grafico y estimacion de valores no impresos a partir de los ejes.
- Procesamiento de una unica imagen por inferencia (no acepta lotes ni multiples imagenes en un mismo prompt).
- Interfaz conversacional mediante plantilla de chat (`apply_chat_template`) con un mensaje de usuario que combina imagen y texto.
- Soporte de los idiomas ingles y coreano, segun los metadatos del modelo.
- No dispone de tool calling, function calling, modo de razonamiento explicito, vision general, audio ni capacidades de agente multi-paso documentadas.

## Casos de uso

- Extraccion de datos de graficos en informes PDF: PyMuPDF localiza la region del grafico en la pagina, la recorta como imagen y el modelo devuelve la tabla de valores para volcarla a CSV, JSON o una hoja de calculo. Es el caso de uso para el que se diseno el modelo.
- Digitalizacion de articulos academicos y papers: los graficos de barras, lineas o sectores de un PDF se convierten en tablas reproducibles que se pueden indexar y consultar, en lugar de quedar como imagenes no buscables.
- Enriquecimiento de pipelines RAG sobre documentacion financiera: los graficos de resultados trimestrales se transforman en tablas que alimentan el indice vectorial, de modo que las cifras quedan disponibles para recuperacion y respuesta.
- Automatizacion de reporting interno: a partir de capturas de dashboards o de paginas de PDF exportadas, el modelo genera la tabla de datos que se incorpora a un informe o a un correo resumen, reduciendo la transcripcion manual.
- Verificacion y control de calidad documental: comparar la tabla generada por el modelo con el grafico original para detectar discrepancias en cifras antes de publicar un documento, tal como recomienda la propia model card.
- Procesamiento por lotes de archivos historicos: con un consumo de unos 2 GB de VRAM y un modelo de 906 millones de parametros, se puede ejecutar en una unica GPU de gama media para recorrer grandes colecciones de PDF y extraer sus graficos de forma masiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB de memoria GPU para inferencia, segun la model card.
- GPU: se requiere una GPU CUDA; la inferencia en CPU no esta soportada. No se especifican modelos de GPU concretos (A100, H100, RTX 4090, etc.) en la informacion disponible.
- GPU de consumo: por el consumo de 2 GB y el tamano del modelo (906 millones de parametros), es viable en GPU de consumo con CUDA, aunque la model card no enumera modelos concretos.
- Entorno de software: Python 3.12, PyTorch con compilacion CUDA, torchvision y Transformers 5.13 o superior. Probado en Linux x86-64 con PyTorch 2.12.1 (CUDA 13.0) y 2.15.0 (CUDA 13.2), y Transformers 5.23.0.
- Opciones de despliegue: carga nativa con `transformers` (`AutoModelForImageTextToText` y `AutoProcessor`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PyMuPDF Chart 0.1.0 | 905.601.648 | no disponible (salida limitada a 2048 tokens) | Grafico a tabla | Apache 2.0 | Hugging Face, formato Transformers |
| PaddleOCR-VL (modelo base) | no disponible | no disponible | OCR y comprension de documentos | Apache 2.0 | PaddlePaddle / Hugging Face |
| OCR clasicos (p. ej. Tesseract) | no aplica (no neuronal generativo) | no aplica | Reconocimiento de texto en imagen | Apache 2.0 | Amplia |

La comparacion con PaddleOCR-VL es la mas directa, ya que PyMuPDF Chart es un fine-tuning suyo orientado a una unica tarea; no se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada. Frente a OCR clasicos, la diferencia es cualitativa: el modelo interpreta la estructura del grafico (ejes, leyendas, series) en lugar de limitarse a transcribir texto.

## Limitaciones y advertencias

- Las etiquetas, los valores, las unidades y las series pueden ser incorrectos; los valores no impresos en el grafico son estimaciones leidas de los ejes.
- Los graficos con varios paneles, leyendas o ejes fuera de la imagen, y las tablas muy largas, son casos mas dificiles para el modelo.
- La salida se corta a 2048 tokens nuevos, lo que limita la longitud de las tablas extraibles.
- Una imagen que no sea un grafico puede producir igualmente una tabla, es decir, no hay una validacion fiable de que la entrada sea un grafico.
- La model card recomienda comparar los resultados con el grafico original antes de confiar en ellos, lo que implica supervision humana en produccion.
- Solo admite una imagen por inferencia y no soporta inferencia en CPU.
- Idiomas documentados: ingles y coreano; no se garantiza el rendimiento en otros idiomas para etiquetas o unidades.
- Licencia Apache 2.0 para el modelo, que permite uso comercial; no obstante, PyMuPDF se licencia por separado bajo GNU AGPL v3.0 o licencia comercial de Artifex, y esa restriccion aplica al uso conjunto con la libreria, no al modelo en si.
- No se documentan sesgos especificos ni tasas de alucinacion medidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artifex-software/pymupdf-chart-to-table
- Repositorio de PyMuPDF: https://github.com/pymupdf/PyMuPDF
- Modelo base PaddleOCR-VL (referenciado en la model card): no disponible en la informacion proporcionada
