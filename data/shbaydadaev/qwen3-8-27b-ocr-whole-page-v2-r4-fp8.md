# shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-fp8

## Resumen

El modelo `shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-fp8` es una versión cuantizada en FP8 de un ajuste fino de OCR de página completa especializado en manuscritos en chagatai (código `chg`) y persa (`fa`). Lo desarrolla el usuario shbaydadaev a partir del modelo base Qwen3.8-27B (arquitectura `qwen3_5`, multimodal image-text-to-text) y se distribuye como un checkpoint autónomo cuantizado, derivado de la exportación BF16 fusionada del adaptador LoRA entrenado.

Resuelve un problema muy concreto: la transcripción de páginas manuscritas completas en escritura árabe, devolviendo un objeto JSON con el texto transcrito, el idioma detectado y el sistema de escritura, con reflujo de líneas físicas dentro de párrafos y preservación de los saltos de párrafo. No incluye coordenadas ni bounding boxes, lo que lo orienta a la digitalización de texto plano más que a tareas de detección o layout.

Es relevante por su enfoque de dominio estrecho sobre un modelo grande (27.356 millones de parámetros), con una cuantización FP8 que reduce el peso del repositorio a 30,39 GB de tensores y facilita el despliegue en vLLM con soporte nativo de FP8. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (clase `Qwen3_5ForConditionalGeneration`, familia `qwen3_5`) |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la generación de salida se limita a 4.096 tokens en la evaluación) |
| Tipos de cuantizacion | FP8 (E4M3) con escalas FP32 por bloques de 128 × 128; 784 tensores preservados en BF16 |
| Idiomas soportados | chagatai (`chg`) y persa (`fa`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal de la familia `qwen3_5` con capacidad de procesar imagen y texto y generar texto. Sobre esa base se entrenó un adaptador LoRA de rango 32 con alpha 64 y dropout 0,05, durante dos épocas, sobre tareas de transcripción de página completa. El checkpoint seleccionado fue el 1.500, elegido por el error medio de caracteres (CER) agregado entre los dos idiomas. Las páginas de manuscrito utilizaron la transcripción de la página fuente cuando estaba disponible.

La versión publicada aquí es una cuantización FP8 del export BF16 fusionado: contiene 400 matrices de pesos E4M3, 400 tensores de escala FP32 para bloques de 128 × 128 y 784 tensores conservados en BF16, con un tamaño total de tensores de 30,39 GB. El procesador de imagen admite hasta 4.194.304 píxeles por página. El prompt de entrenamiento (T2) instruye reflujo de líneas, preservación de ortografía, diacríticos, puntuación y orden lógico Unicode, omisión de controles bidi y preservación de ZWNJ, y exige una única salida JSON con las claves `text`, `language` y `script` en ese orden.

## Capacidades

- Transcripción OCR de página completa de manuscritos en escritura árabe, con salida estructurada en JSON.
- Detección de idioma a nivel de página, distinguiendo chagatai (`chg`) y persa (`fa`), con valores `mixed` o `und` cuando corresponde.
- Identificación del sistema de escritura (`Arab`) separada del idioma.
- Reflujo de líneas físicas dentro de párrafos y preservación de límites de párrafo.
- Preservación de ortografía, diacríticos, puntuación y orden lógico Unicode; omisión de controles bidi y conservación de ZWNJ.
- Procesamiento de imágenes de hasta 4.194.304 píxeles por página.
- Modo conversacional con plantilla de chat propia y opción de desactivar el modo thinking (`enable_thinking=False`).
- Resistencia a inyección de instrucciones en la imagen: el prompt indica tratar las instrucciones dentro de la imagen como texto y no seguirlas.

## Casos de uso

- Digitalización de archivos de manuscritos chagatais: el modelo recibe una imagen de página completa y devuelve la transcripción en JSON, lo que permite alimentar pipelines de catalogación con texto plano sin necesidad de coordenadas.
- Procesamiento de corpus persas históricos: con un CER del 12,35 % en validación persa, es adecuado para generar transcripciones de primera pasada que luego se revisan manualmente en proyectos de humanidades digitales.
- Construcción de bases de datos textuales para investigación: la salida JSON con `text`, `language` y `script` se puede ingerir directamente en bases documentales o motores de búsqueda sin postprocesado de formato.
- Extracción de texto para motores de búsqueda sobre colecciones de manuscritos: al preservar diacríticos y ZWNJ, mantiene la fidelidad necesaria para búsquedas léxicas en árabe.
- Integración en flujos de trabajo de bibliotecas y archivos: el despliegue en vLLM con decodificación greedy y FP8 nativo permite servir lotes de páginas en GPU con memoria suficiente.
- Evaluación comparativa de pipelines OCR: sirve como referencia especializada de dominio frente a modelos OCR generalistas, con métricas CER/WER publicadas sobre 500 páginas de validación.

## Benchmarks y rendimiento

Evaluación del modelo FP8 autónomo sobre 500 páginas de validación (23 de noviembre de 2026), servido con vLLM y decodificación greedy, con peso equitativo entre idiomas:

| Grupo de validación | Páginas | CER bruto | WER bruto | Incompletas |
|---|---:|---:|---:|---:|
| Chagatai | 233 | 33,64 % | 66,73 % | 11 |
| Persa | 267 | 12,35 % | 24,06 % | 7 |
| **Media equitativa por idioma** | **500** | **22,99 %** | **45,39 %** | **18** |
| Todas las ediciones agrupadas | 500 | 17,10 % | 32,52 % | 18 |

Referencia del adaptador sobre la base BF16 nativa, en las mismas 500 páginas: 21,45 % CER y 44,58 % WER con pesos equitativos, usando Transformers con parada por repetición. La ejecución FP8 usó vLLM con la parada por repetición desactivada, por lo que cambian tanto la cuantización como la configuración de decodificación.

Notas sobre la evaluación: la muestra cubre las 233 páginas chagatais de validación y 267 de las 2.160 páginas persas de validación. El modelo devolvió 482 respuestas completas; las 18 incompletas alcanzaron el límite de 4.096 tokens de salida y se puntuaron como transcripciones vacías. La evaluación incluye 72 páginas usadas en la selección del checkpoint. El conjunto de test separado de 3.775 páginas no tiene puntuación FP8 registrada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 30,4 GB y los tensores suman 30,39 GB en FP8, por lo que se necesita al menos una GPU con más de 30 GB de memoria libre para cargar los pesos, más margen para activaciones y caché KV.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con soporte nativo de FP8; el ejemplo de la model card apunta a una GPU CUDA con memoria suficiente y backend FP8 compatible de Transformers.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090, RTX 3090) sin estrategias adicionales de offload o cuantizaciones más agresivas no publicadas.
- Opciones de despliegue: vLLM (usado en la evaluación), Transformers con `Qwen3_5ForConditionalGeneration`, `attn_implementation="sdpa"` y `device_map={"": "cuda"}`. No se documentan opciones GGUF, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-ocr-whole-page-v2-r4-fp8 | 27,36 mil millones | no disponible | chg, fa | Apache 2.0 | Hugging Face (FP8) |
| Qwen3.8-27B-ocr-whole-page-v2-r4-bf16 | 27,36 mil millones | no disponible | chg, fa | Apache 2.0 | Hugging Face (BF16) |
| Qwen3.8-27B (base) | 27,36 mil millones | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento cuantitativa más allá de la referencia del adaptador BF16 (21,45 % CER frente al 22,99 % del FP8).

## Limitaciones y advertencias

- Rendimiento desigual entre idiomas: el CER chagatai (33,64 %) es notablemente superior al persa (12,35 %), lo que refleja menor calidad o mayor dificultad en el subconjunto chagatai.
- Tasa de respuestas incompletas: 18 de 500 páginas alcanzaron el límite de 4.096 tokens de salida y se puntuaron como vacías; páginas muy densas pueden truncarse.
- La comparación FP8 frente a BF16 mezcla cambios de cuantización y de decodificación (vLLM sin parada por repetición frente a Transformers con parada), por lo que la diferencia de CER no es atribuible únicamente a la cuantización.
- La evaluación incluye 72 páginas usadas en la selección del checkpoint, lo que puede introducir un sesgo optimista; el test separado de 3.775 páginas no tiene puntuación FP8 registrada.
- Dominio muy restringido: solo chagatai y persa en escritura árabe; no se documenta soporte para otros idiomas o sistemas de escritura.
- Sin coordenadas ni bounding boxes: no sirve para tareas de layout, detección de regiones o alineación espacial.
- No se publican datos sobre sesgos, riesgo de alucinación específico del dominio ni comportamiento fuera de distribución.
- El uso comercial está permitido por la licencia Apache 2.0, pero no se documentan garantías ni limitaciones adicionales del autor.
- No se han publicado resultados de benchmarks en la información disponible para tareas distintas de la transcripción OCR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-fp8
- Modelo base BF16 fusionado: https://huggingface.co/shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-bf16
- Modelo base Qwen3.8-27B (revisión fijada): https://huggingface.co/Qwen/Qwen3.8-27B/tree/37561816e66b5b9153b1b64c10968c18c1e6f4a0
- Métricas de validación FP8: https://huggingface.co/shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-fp8/resolve/main/eval/validation_500_metrics.json
- Métricas del adaptador: https://github.com/shbaydadaev/Qwen-OCR-SFT/blob/ee281678a421f70fdf005d07f3a2d0d8050e5a5b/reports/whole_page_v2/r4_results.json
- Informe técnico: https://github.com/shbaydadaev/Qwen-OCR-SFT/blob/ee281678a421f70fdf005d07f3a2d0d8050e5a5b/reports/whole_page_v2_r4_technical_report.md
