# jitvimol/typhoon-ocr2-2b-mlx-bf16

## Resumen

Typhoon OCR V2 2B (MLX, bf16) es una conversión no oficial del modelo `typhoon-ai/typhoon-ocr2-2b` al formato MLX, publicada por el usuario `jitvimol`. El modelo original es un vision-language model de aproximadamente 2.213 millones de parámetros desarrollado por Typhoon (SCB 10X), especializado en el parseo de documentos en tailandés e inglés. Dada una imagen de una página, devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su bounding box y su contenido textual.

Esta variante concreta mantiene los pesos originales en bfloat16 sin cuantizar, lo que la convierte en la opción recomendada cuando la precisión de transcripción es prioritaria. Está pensada para inferencia local en Macs con Apple Silicon y es compatible con cualquier herramienta que soporte modelos vision-language MLX de arquitectura Qwen3.5. No tiene afiliación ni respaldo de los autores originales.

La relevancia actual del modelo radica en su tamaño contenido (2,2 B de parámetros) combinado con capacidades de OCR estructurado, análisis de layout, extracción de tablas en HTML y fórmulas en LaTeX, todo bajo licencia Apache-2.0, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), vision-language model |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat16 sin cuantizar (esta variante); existe variante `mlx-8bit` del mismo autor |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo original) |
| Formato de pesos | safetensors en formato MLX (repo de 4,4 GB; 4,43 GB en disco) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `infly/Infinity-Parser2-Flash` y emplea la arquitectura Qwen3.5 en su variante `Qwen3_5ForConditionalGeneration`, que combina un codificador visual con un decoder de lenguaje para tareas image-text-to-text. El modelo original fue desarrollado por Typhoon (SCB 10X) con foco en documentos tailandeses e ingleses.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Esta conversión concreta no introduce ningún entrenamiento adicional ni modificación de los pesos más allá del cambio de formato a MLX; se realizó con `mlx-vlm` 0.7.12 mediante `python -m mlx_vlm convert`.

## Capacidades

- Parseo de layout de página completa: devuelve una lista JSON de elementos con `bbox`, `category` y `text`, ordenados en orden de lectura humano.
- Categorías de layout soportadas: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`.
- Extracción de tablas en formato HTML.
- Extracción de fórmulas en formato LaTeX.
- Texto general en formato Markdown.
- Document question answering (según los autores originales).
- Clasificación de documentos (según los autores originales).
- Extracción de información clave (key-information extraction).
- Lectura de tablas, fórmulas y gráficos.
- Capacidades multilingües limitadas a tailandés e inglés.
- No se menciona soporte de tool calling ni de agentes multi-step en la información disponible.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo devuelve el texto en orden de lectura con bounding boxes, lo que permite reconstruir el flujo de la página y alimentar sistemas de gestión documental.
- Extracción de tablas financieras: al devolver las tablas como HTML, se pueden postprocesar directamente a CSV o bases de datos sin pasar por un OCR plano que perdería la estructura de filas y columnas.
- Conversión de documentación técnica con fórmulas: las fórmulas se emiten en LaTeX, lo que facilita su integración en pipelines de publicación científica o wikis técnicas.
- Análisis de layout para reflow de PDF: las categorías y bounding boxes permiten reordenar contenido para lectura en móvil o para accesibilidad.
- Document question answering sobre escaneos: útil para asistentes internos que responden preguntas sobre contratos o informes en tailandés e inglés.
- Clasificación automática de páginas: la categoría y estructura detectadas sirven como señal para enrutar documentos (facturas, formularios, artículos) en un sistema de gestión.
- Inferencia local en Mac: gracias a la conversión MLX y a su huella de memoria de aproximadamente 5,3 GB en imágenes típicas, se puede ejecutar en un portátil Apple Silicon sin conexión a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión solo incluye una comprobación informal sobre dos páginas tailandesas impresas: todas las salidas fueron JSON válido, sin bucles de repetición, y las variantes de 8 bits y bfloat16 coincidieron en los elementos de layout (29 y 58 elementos en las dos páginas), con 26 de 29 y 56 de 58 textos idénticos y el resto con diferencias de pocos caracteres. Para los resultados de evaluación oficiales, se remite a la model card del modelo original.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 5,3 GB de memoria pico residente medida con `mlx-vlm` para imágenes de página típicas; imágenes más grandes requieren más memoria.
- Tamaño en disco: 4,43 GB (bf16 sin cuantizar).
- Plataforma objetivo: Macs con Apple Silicon (MLX). No está pensado para GPUs NVIDIA.
- Cabe en equipos consumer Apple Silicon con al menos 8 GB de memoria unificada, aunque se recomienda 16 GB o más para trabajar con imágenes grandes.
- Opciones de despliegue: LM Studio (búsqueda del repo o `lms get`), `mlx-vlm` por línea de comandos o API Python.
- Latencia y throughput: no disponibles en la información proporcionada.
- Configuración recomendada: `temperature=0.0` y `max_tokens=4096` con el prompt fijo publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jitvimol/typhoon-ocr2-2b-mlx-bf16 | 2,21 B | no disponible | th, en | Apache-2.0 | MLX safetensors (bf16) |
| jitvimol/typhoon-ocr2-2b-mlx-8bit | 2,21 B | no disponible | th, en | Apache-2.0 | MLX safetensors (8 bits) |
| typhoon-ai/typhoon-ocr2-2b (original) | 2,21 B | no disponible | th, en | Apache-2.0 | safetensors (formato original) |
| infly/Infinity-Parser2-Flash (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Errores de transcripción: la model card original advierte de posibles errores en la transcripción del texto.
- Evaluación informal: las comprobaciones publicadas en esta conversión se limitan a dos páginas tailandesas impresas; no se probaron escritura manual, question answering ni tareas de extracción.
- Diferencias entre cuantizaciones: las variantes de 8 bits y bf16 no siempre listan los elementos en el mismo orden y pueden diferir en unos pocos caracteres.
- Dependencia del prompt: el modelo fue entrenado con un conjunto fijo de prompts; desviarse del prompt publicado puede degradar la salida.
- Redimensionado de imágenes: si el entorno reduce la resolución de páginas grandes, los bounding boxes pueden diferir de los resultados de referencia.
- Cobertura lingüística limitada a tailandés e inglés; otros idiomas no están soportados oficialmente.
- Conversión no oficial: no está afiliada ni respaldada por los autores originales; para producción crítica conviene validar contra el modelo original.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en campos de texto poco legibles o imágenes de baja calidad.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/jitvimol/typhoon-ocr2-2b-mlx-bf16
- Variante 8 bits del mismo autor: https://huggingface.co/jitvimol/typhoon-ocr2-2b-mlx-8bit
- Modelo original: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Modelo base del fine-tune: https://huggingface.co/infly/Infinity-Parser2-Flash
- Repositorio MLX: https://github.com/ml-explore/mlx
- Referencia arXiv citada en los tags: arxiv:2601.14722
