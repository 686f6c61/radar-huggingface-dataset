# shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-bf16

## Resumen

Qwen3.8-27B-ocr-whole-page-v2-r4-bf16 es un modelo de visión-lenguaje especializado en transcripción OCR de página completa de manuscritos en chagatai (chg) y persa (fa), publicado por el usuario shbaydadaev en Hugging Face. Se construye como un fine-tuning mediante LoRA (rango 32, alpha 64, dropout 0.05) sobre el modelo base Qwen/Qwen3.8-27B, con el adaptador fusionado en los pesos finales en BF16. El resultado es un checkpoint autónomo de 27.356.728.560 parámetros (unos 27,36 mil millones) distribuido en 14 shards que suman 54,71 GB de tensores BF16.

El modelo resuelve un problema muy concreto: dada una imagen de una página manuscrita completa, devuelve un único objeto JSON con la transcripción en el campo `text`, el idioma detectado en `language` (chg o fa) y el sistema de escritura en `script` (Arab). Refluye las líneas físicas dentro de los párrafos y preserva los saltos de párrafo, sin coordenadas ni traducción. Está pensado para digitalización de fondos manuscritos en escritura árabe, un nicho donde los OCR genéricos rinden mal.

Su relevancia actual radica en que ofrece una evaluación cuantitativa honesta sobre 500 páginas de validación (20,91 % CER y 44,06 % WER con media equilibrada por idioma) y en que se publica junto a una variante FP8 con métricas comparables. La licencia Apache 2.0 y el soporte de `transformers` con plantilla de chat facilitan su integración, aunque el alcance lingüístico es deliberadamente estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (clase Qwen3_5ForConditionalGeneration) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo limita la salida a 4096 tokens nuevos) |
| Tipos de cuantizacion | BF16 (checkpoint publicado); existe variante FP8 companion |
| Idiomas soportados | chagatai (chg) y persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14 shards, 54,71 GB en BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de tipo vision-lenguaje que procesa imágenes y texto de forma conjunta. Sobre esa base se aplicó un adaptador LoRA de rango 32, alpha 64 y dropout 0,05, entrenado durante dos épocas en la tarea de transcripción de página completa sobre el base nativo en BF16. El checkpoint seleccionado fue el paso 1.500, elegido por el menor error medio de caracteres entre los dos idiomas. Posteriormente el adaptador se fusionó en los pesos, dando lugar a este checkpoint autónomo.

El preprocesamiento de imagen usa un procesador con un máximo de 4.194.304 píxeles por página. La tarea se formula mediante un prompt de entrenamiento de página completa (identificado como "Task T2") que instruye al modelo a preservar ortografía, diacríticos, puntuación y orden lógico Unicode, omitir controles bidi, conservar ZWNJ y devolver exclusivamente un objeto JSON con las claves `text`, `language` y `script` en ese orden. El entrenamiento se hizo con la plantilla de chat incluida y con el modo de razonamiento (thinking) desactivado. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de que se usaron transcripciones de página de origen cuando estaban disponibles.

## Capacidades

- Transcripción OCR de página completa de manuscritos en escritura árabe, devolviendo un JSON estructurado con texto, idioma y sistema de escritura.
- Reflujo de líneas físicas dentro de párrafos, preservando los límites de párrafo.
- Detección de idioma separada del sistema de escritura, con posibilidad de etiquetar como `mixed` o `und` cuando corresponde.
- Preservación de ortografía, diacríticos, puntuación, orden lógico Unicode y ZWNJ; omisión de controles bidi.
- Procesamiento de imágenes de hasta 4.194.304 píxeles por página.
- Instrucción explícita de tratar las instrucciones presentes en la imagen como texto y no seguirlas (defensa básica frente a inyección de prompt en el documento).
- Soporte de conversación multimodal mediante plantilla de chat de `transformers`.
- No se documentan capacidades de tool calling, agentes, audio ni matemáticas avanzadas; el modelo está especializado en OCR.

## Casos de uso

- Digitalización de fondos de manuscritos chagatais: el modelo transcribe páginas completas y devuelve el texto refluido por párrafos, lo que permite alimentar pipelines de catalogación sin post-procesar saltos de línea.
- Digitalización de manuscritos persas: con un CER del 9,56 % en validación, es adecuado para primeras pasadas de transcripción asistida que luego revisa un paleógrafo.
- Generación de capas de texto buscable para bibliotecas digitales: el JSON de salida con `text`, `language` y `script` encaja directamente en esquemas de indexación documental.
- Investigación en humanidades digitales: permite procesar corpus completos de forma automatizada y medir calidad con CER/WER sobre subconjuntos etiquetados, como hace el propio autor.
- Enriquecimiento de catálogos archivísticos: la detección de idioma y escritura por página facilita el triaje y la clasificación automática de lotes heterogéneos.
- Evaluación de pipelines OCR: al ser un checkpoint BF16 con métricas publicadas y una variante FP8 comparable, sirve como referencia para medir el impacto de la cuantización en tareas de transcripción.
- Prototipado en GPU única: su tamaño de 27,36 B en BF16 (54,71 GB de pesos) permite desplegarlo en una GPU de 80 GB, útil para pruebas de concepto en equipos de investigación.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre 500 páginas de validación de página completa, decodificación greedy con vLLM:

| Grupo de validación | Páginas | CER bruto | WER bruto | Incompletas |
|---|---:|---:|---:|---:|
| Chagatai | 233 | 32,25 % | 66,37 % | 6 |
| Persa | 267 | 9,56 % | 21,74 % | 4 |
| Media equilibrada por idioma | 500 | 20,91 % | 44,06 % | 10 |
| Todas las ediciones agrupadas | 500 | 14,63 % | 30,59 % | 10 |

Comparación con variantes del mismo autor sobre las mismas páginas, prompts y ajustes de generación:

| Modelo | CER (media equilibrada) | WER (media equilibrada) |
|---|---:|---:|
| BF16 fusionado (este modelo) | 20,91 % | 44,06 % |
| FP8 companion | 22,99 % | 45,39 % |
| Adaptador LoRA paso 1.500 (referencia) | 21,45 % | 44,58 % |

Notas de la evaluación: la muestra cubre las 233 páginas chagatais de validación y 267 de las 2.160 persas; 10 respuestas alcanzaron el límite de 4.096 tokens de salida y se contaron como transcripciones vacías; 72 páginas de la muestra se usaron para seleccionar el checkpoint del adaptador. El conjunto de test held-out de 3.775 páginas no tiene puntuación registrada para esta variante r4 BF16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda una GPU de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16; para la variante FP8, GPUs con soporte FP8 nativo (H100, H200, L40S).
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) en BF16 sin cuantización adicional; no se documentan GGUF ni cuantizaciones de 4/8 bits para este checkpoint.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `attn_implementation="sdpa"` (ejemplo oficial); vLLM se usó para la evaluación publicada. No se documentan integraciones con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El límite de generación del ejemplo es de 4.096 tokens nuevos; 10 de 500 páginas lo alcanzaron, lo que sugiere que páginas densas pueden agotar ese presupuesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas OCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-ocr-whole-page-v2-r4-bf16 | 27,36 B | no disponible | chg, fa | Apache 2.0 | Hugging Face (48 descargas) |
| Qwen3.8-27B-ocr-whole-page-v2-r4-fp8 | no disponible | no disponible | chg, fa | Apache 2.0 | Hugging Face (variante FP8 del mismo autor) |
| Qwen/Qwen3.8-27B (base) | 27,36 B (base) | no disponible | multilingüe general | no disponible en la información | Hugging Face |
| OCR genéricos multimodales | variable | variable | multilingüe general | variable | no disponible |

No se dispone de datos de benchmarks comparativos con OCR genéricos en la información proporcionada; la única comparación cuantitativa disponible es interna, entre las variantes BF16, FP8 y el adaptador del mismo autor.

## Limitaciones y advertencias

- Alcance lingüístico muy restringido: solo chagatai y persa; no se ha validado para árabe moderno, urdu ni otras lenguas en escritura árabe.
- Calidad desigual entre idiomas: el CER en chagatai (32,25 %) triplica el de persa (9,56 %), por lo que el uso en chagatai requiere revisión humana intensiva.
- Riesgo de truncamiento: el 2 % de las páginas de validación (10 de 500) alcanzaron el límite de 4.096 tokens y se contabilizaron como vacías; páginas muy densas pueden perder contenido.
- Sesgo de evaluación: 72 de las 500 páginas de validación se usaron para seleccionar el checkpoint, y la muestra persa es solo 267 de 2.160 páginas; las métricas pueden no generalizar al test held-out de 3.775 páginas, que no tiene puntuación registrada.
- Riesgo de inyección de prompt desde el documento: aunque el prompt de entrenamiento instruye a tratar las instrucciones de la imagen como texto, no hay garantía formal de que el modelo las ignore siempre.
- Alucinación: no se documentan medidas específicas contra la invención de texto ausente en la imagen; la instrucción de no corregir ni traducir mitiga parcialmente este riesgo, pero no lo elimina.
- Requisitos de hardware elevados: 54,71 GB de pesos en BF16 impiden su uso en GPUs de consumo sin cuantización adicional, y no se publican pesos GGUF ni de 4/8 bits.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las transcripciones en entornos de producción.
- Modelo con muy poca tracción (48 descargas, 0 likes) y sin validación independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-bf16
- Modelo base Qwen/Qwen3.8-27B (revisión fijada): https://huggingface.co/Qwen/Qwen3.8-27B/tree/37561816e66b5b9153b1b64c10968c18c1e6f4a0
- Variante FP8 companion: https://huggingface.co/shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-fp8
- Métricas de validación BF16 (JSON): https://huggingface.co/shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-bf16/resolve/main/eval/validation_500_metrics.json
- Métricas de validación FP8 (JSON): https://huggingface.co/shbaydadaev/Qwen3.8-27B-ocr-whole-page-v2-r4-fp8/blob/aed625212742ada495121f4d9d14642563a59aaa/eval/validation_500_metrics.json
- Métricas del adaptador (JSON): https://github.com/shbaydadaev/Qwen-OCR-SFT/blob/ee281678a421f70fdf005d07f3a2d0d8050e5a5b/reports/whole_page_v2/r4_results.json
- Informe técnico: https://github.com/shbaydadaev/Qwen-OCR-SFT/blob/ee281678a421f70fdf005d07f3a2d0d8050e5a5b/reports/whole_page_v2_r4_technical_report.md
