# fwgpiyawudk/chandra-ocr-2-bf16-mlx

## Resumen

El modelo `fwgpiyawudk/chandra-ocr-2-bf16-mlx` es una conversión a formato MLX (Apple Silicon) del modelo `datalab-to/chandra-ocr-2`, un sistema de OCR multimodal orientado a la extracción de texto de imágenes, documentos PDF y capturas de pantalla, con salida estructurada en Markdown y reconocimiento de layout. El modelo original está desarrollado por el equipo de `datalab-to`; esta conversión, realizada por el usuario `fwgpiyawudk` mediante `mlx-vlm 0.6.6`, adapta los pesos a un formato optimizado para ejecución en hardware de Apple (M1/M2/M3 y posteriores) con memoria unificada.

Con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones), el modelo se presenta como una solución de OCR de tamaño medio, capaz de procesar entradas de imagen y generar texto descriptivo, incluyendo la conversión de documentos escaneados a Markdown. La licencia `openrail` permite uso comercial y modificación, lo que facilita su integración en proyectos privados. Aunque no se especifican detalles de arquitectura ni contexto, su pipeline `image-text-to-text` confirma su naturaleza multimodal.

La relevancia actual de este modelo radica en la creciente demanda de herramientas de OCR de código abierto que funcionen de manera eficiente en equipos Apple, sin depender de servicios en la nube. Al estar disponible en formato MLX, puede ejecutarse localmente con aceleración por GPU integrada, lo que lo convierte en una opción atractiva para desarrolladores que trabajan en entornos macOS.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | openrail |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo original `chandra-ocr-2`. Dado su pipeline `image-text-to-text`, se infiere que se trata de un modelo multimodal que combina un codificador visual con un decodificador de texto, probablemente basado en una arquitectura transformer. Sin embargo, esta suposición no está confirmada por los datos disponibles.

Tampoco se dispone de información sobre el proceso de entrenamiento: no se conocen el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. La conversión a MLX es meramente técnica y no modifica los pesos originales; solo adapta el formato para su ejecución en Apple Silicon.

## Capacidades

- OCR de imágenes y documentos: extrae texto de imágenes, capturas y PDFs escaneados.
- Conversión a Markdown: genera salida en formato Markdown, útil para documentación técnica.
- Reconocimiento de layout: identifica la estructura del documento (títulos, párrafos, tablas, etc.).
- Procesamiento de imágenes como entrada: acepta imágenes como entrada y produce texto como salida.
- Soporte conversacional: al ser un modelo `image-text-to-text`, puede mantener diálogos basados en imágenes, aunque no se especifica si soporta tool calling o funciones de agente.

No se ha confirmado soporte para function calling, razonamiento multi-paso, ni capacidades multilingües específicas. La información disponible no permite afirmar la existencia de estas características.

## Casos de uso

- Digitalización de documentos físicos: el modelo puede convertir escaneos de contratos, facturas o formularios en texto editable y estructurado en Markdown, facilitando su archivado y búsqueda.
- Automatización de procesos de extracción de datos: en entornos empresariales, se puede integrar en pipelines que procesen PDFs para extraer campos concretos (nombres, fechas, importes) y alimentar bases de datos.
- Conversión de PDF a Markdown para documentación técnica: desarrolladores pueden transformar manuales o especificaciones en formato PDF a archivos Markdown listos para repositorios como GitHub.
- Accesibilidad: ayuda a personas con discapacidad visual convirtiendo imágenes de texto en contenido legible por lectores de pantalla.
- Análisis de capturas de pantalla: en herramientas de soporte técnico, el modelo puede extraer texto de capturas para generar tickets o documentación automáticamente.
- Procesamiento de documentos históricos o archivos: permite digitalizar y transcribir documentos antiguos, aunque la calidad dependerá del estado de la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones con otros sistemas de OCR. Se recomienda realizar pruebas propias en el caso de uso específico antes de adoptarlo en producción.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4,5 mil millones de parámetros en bf16, el tamaño de los pesos es de aproximadamente 9 GB (según el tamaño del repositorio). Para inferencia, se necesitará al menos 12-16 GB de memoria unificada en Apple Silicon para evitar desbordamientos.
- GPU recomendadas: diseñado para Apple Silicon (M1, M2, M3 y superiores). No está pensado para GPUs NVIDIA o AMD sin adaptación adicional.
- Compatibilidad con hardware de consumo: sí, en Macs con 16 GB de RAM o más. Modelos con 8 GB podrían tener limitaciones de memoria.
- Opciones de despliegue: se puede ejecutar mediante `mlx-vlm`, la librería utilizada para la conversión. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que MLX es específico de Apple.
- Latencia y throughput: no se han publicado datos. La velocidad dependerá del chip (M1 Pro, M2 Max, etc.) y de la resolución de las imágenes de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de OCR. Aunque existen alternativas como PaddleOCR, Tesseract o modelos multimodales como LLaVA, no se conocen datos objetivos de rendimiento de `chandra-ocr-2` frente a ellos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha documentado ningún sesgo específico. Como todo modelo de OCR, su precisión puede verse afectada por la calidad de la imagen, tipografías inusuales o idiomas no representados en el entrenamiento.
- Riesgo de alucinación: al ser un modelo generativo, puede producir texto incorrecto o inventado si la imagen es ambigua o de baja calidad. Es recomendable verificar las salidas en contextos críticos.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto, lo que podría restringir el procesamiento de documentos muy largos en una sola pasada.
- Restricciones de licencia: la licencia `openrail` permite uso comercial y modificación, pero se debe revisar el texto completo de la licencia para asegurar el cumplimiento, especialmente en cuanto a atribución y responsabilidades.
- Caveats de producción: al ser una conversión reciente (agosto de 2026) y sin benchmarks publicados, se recomienda realizar pruebas exhaustivas antes de desplegarlo en entornos de producción. Además, el modelo solo funciona en hardware Apple, limitando su portabilidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/fwgpiyawudk/chandra-ocr-2-bf16-mlx)
- [Modelo base original: datalab-to/chandra-ocr-2](https://huggingface.co/datalab-to/chandra-ocr-2)
- No se han encontrado otros enlaces (papers, blogs, repositorios) en la información proporcionada.
