# Shadowzer0/finetuned_surya

## Resumen

El modelo `Shadowzer0/finetuned_surya` es un ajuste fino (fine-tuning) de un modelo base denominado "Surya", publicado en Hugging Face por el usuario Shadowzer0. Surya, en su versión original desarrollada por el equipo de datalab-to, es un modelo de OCR multimodal de 650 millones de parámetros orientado a tareas de reconocimiento de texto, análisis de diseño de página, orden de lectura y reconocimiento de tablas. Este fine-tuning concreto presenta 896.249.111 parámetros, lo que sugiere una ampliación del modelo base o una variante con más capacidad, aunque no se especifica la tarea concreta de ajuste.

La relevancia de este modelo radica en la posibilidad de especializar Surya para dominios o conjuntos de datos particulares, algo común en flujos de trabajo de OCR empresarial o de digitalización documental. Sin embargo, la información pública disponible es muy limitada: no se indica la licencia, los idiomas soportados, el pipeline de uso ni los datos de entrenamiento del fine-tuning. Esto dificulta su adopción directa en producción sin una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Surya, modelo OCR multimodal) |
| Parametros totales | 896.249.111 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Surya soporta 91 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Surya, descrito en el repositorio de datalab-to, es un transformer de 650 millones de parámetros diseñado para OCR y análisis de documentos. Su arquitectura combina un codificador visual con un decodificador de texto, entrenado con un objetivo de modelado de lenguaje multimodal. El fine-tuning de Shadowzer0 no documenta el proceso de entrenamiento: no se especifican los datos utilizados, la técnica de ajuste (LoRA, full fine-tuning, etc.) ni el número de pasos. Dado el incremento de parámetros respecto al base (896M vs 650M), es posible que se haya ampliado alguna capa o que se trate de un modelo distinto con la misma denominación. Tampoco se mencionan técnicas como RLHF o DPO.

## Capacidades

- Reconocimiento de texto en imágenes (OCR) de alta precisión, heredado del modelo base Surya.
- Análisis de diseño de página: detección de tablas, imágenes, cabeceras y otros elementos.
- Determinación del orden de lectura dentro de documentos complejos.
- Reconocimiento de tablas con extracción de filas y columnas.
- Soporte multilingüe amplio (91 idiomas en el modelo base, aunque no se confirma para este fine-tuning).
- Posible especialización en un dominio concreto, aunque no se detalla en la documentación disponible.

## Casos de uso

- Digitalización de documentos históricos: el modelo puede extraer texto y estructura de escaneos antiguos, facilitando su indexación y búsqueda.
- Automatización de facturas y recibos: mediante OCR y reconocimiento de tablas, se pueden extraer campos clave como importes, fechas o números de referencia.
- Análisis de informes científicos y técnicos: el orden de lectura y el layout analysis permiten reconstruir la estructura lógica de artículos con múltiples columnas y figuras.
- Accesibilidad: conversión de documentos impresos a texto legible por lectores de pantalla o sistemas de texto a voz.
- Extracción de datos de formularios: el reconocimiento de campos y casillas facilita la automatización de procesos de entrada de datos.
- Archivado y gestión documental: indexación automática de grandes volúmenes de PDFs escaneados con metadatos estructurales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tuning concreto. El modelo base Surya reporta un 83,3% en olmOCR-bench (top bajo 3B de parámetros) y un throughput de 5 páginas por segundo en una RTX 5090, pero estos datos no pueden atribuirse directamente a esta versión ajustada.

## Requisitos de hardware

- VRAM estimada: con 896M de parámetros en precisión fp32 se necesitarían unos 3,6 GB solo para los pesos; en fp16 serían ~1,8 GB. Sin cuantización adicional, una GPU con 6-8 GB de VRAM podría ser suficiente para inferencia, dependiendo de la resolución de entrada.
- GPU recomendadas: RTX 3060 (12 GB) o superior, RTX 4090, A100, H100. En CPU es posible pero con latencia alta.
- Opciones de despliegue: al estar en formato safetensors, se puede usar con Hugging Face Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se han publicado configuraciones específicas.
- Latencia y throughput: no disponible para este fine-tuning; el modelo base alcanza 5 páginas/s en RTX 5090, pero el ajuste puede variar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento OCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shadowzer0/finetuned_surya | 896M | no disponible | no disponible | no disponible | Hugging Face |
| Surya (datalab-to) | 650M | no disponible | 83,3% olmOCR-bench | MIT (según repo) | GitHub, HF |
| PaddleOCR (PP-OCRv4) | ~300M | 512 tokens | ~80% en benchmarks internos | Apache 2.0 | GitHub, HF |
| Tesseract (LSTM) | ~100M | n/a | menor precisión en documentos complejos | Apache 2.0 | GitHub |

Nota: los datos de Surya base provienen del repositorio oficial; el resto son estimaciones razonables basadas en documentación pública.

## Limitaciones y advertencias

- No se ha publicado información sobre la licencia, lo que impide su uso comercial sin autorización explícita del autor.
- La ausencia de documentación sobre el proceso de fine-tuning impide conocer los datos de entrenamiento, posibles sesgos o dominios de especialización.
- El modelo puede heredar sesgos del corpus original de Surya, especialmente en idiomas o escrituras poco representadas.
- Riesgo de alucinación en textos poco legibles o con ruido, común en modelos OCR.
- No se garantiza la compatibilidad con todos los idiomas que soporta el modelo base, ya que el fine-tuning podría haber reducido el vocabulario.
- El tamaño del repositorio (5,4 GB) sugiere que los pesos están en precisión completa; se necesitaría cuantización para entornos con poca VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shadowzer0/finetuned_surya
- Repositorio del modelo base Surya: https://github.com/datalab-to/surya
- Scripts de fine-tuning para Surya (gist): https://gist.github.com/rwatler/6d8da884873a92107fdf1db0b8cb92c7
- Repositorio de fine-tuning de Surya (Ollsoft-ai): https://github.com/Ollsoft-ai/surya-finetuning
- Paper de Surya para heliofísica (modelo distinto, mismo nombre): https://arxiv.org/html/2508.14112v1
