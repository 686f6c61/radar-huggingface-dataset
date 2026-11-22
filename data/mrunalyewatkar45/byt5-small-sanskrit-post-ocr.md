# MrunalYewatkar45/byt5-small-sanskrit-post-ocr

## Resumen

ByT5-small-sanskrit-post-ocr es un modelo de corrección post-OCR para sánscrito en escritura devanagari, desarrollado por MrunalYewatkar45 como un fine-tune completo de google/byt5-small. Su función es recibir una línea de texto tal como la produce Tesseract con el paquete de idioma `san` y devolver una versión corregida, operando línea a línea. Resuelve un problema concreto: la tasa de error de carácter (CER) que introducen los motores OCR clásicos al procesar devanagari, un sistema de escritura con ligaduras, matras y signos diacríticos que degradan notablemente el reconocimiento.

El modelo es relevante por su enfoque de bajo coste: con solo 299,6 millones de parámetros y un entrenamiento en una única GPU T4 de Colab, consigue reducciones medibles de CER sobre datos sintéticos y modestas sobre páginas reales. La arquitectura ByT5 procesa bytes en lugar de tokens subword, lo que elimina el vocabulario y evita problemas de tokenización en una escritura con abundantes combinaciones de caracteres.

Se distribuye bajo licencia Apache 2.0 en formato safetensors, con un repositorio de 1,2 GB. Está orientado a pipelines de digitalización de corpus sánscritos, no a generación de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) con tokenización a nivel de byte (ByT5) |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor indica generación con `max_length=384`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | sánscrito (sa), escritura devanagari |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/byt5-small, un encoder-decoder T5 que opera sobre bytes UTF-8 en lugar de tokens subword. Esta elección es adecuada para devanagari porque evita el vocabulario fijo y maneja cualquier secuencia de caracteres, incluidas las combinaciones poco frecuentes. El fine-tune es completo (no LoRA ni adaptadores), en fp32, sobre una GPU T4 de Colab con el optimizador Adafactor, learning rate 5e-4 y batch efectivo de 32. Se seleccionó el checkpoint del paso 1.600 de un total de 2.125 (una época), con el mejor CER de validación del 5,2%.

Los datos de entrenamiento consisten en 67.984 pares (ruidoso → limpio) de líneas extraídas de Wikipedia en sánscrito. El ruido se generó de dos formas: corrupción OCR basada en reglas calibrada con errores reales de Tesseract, y pares renderizar-y-pasar-por-OCR usando seis fuentes tipográficas. El objetivo es que el modelo aprenda a mapear las confusiones típicas del OCR de devanagari (sustituciones entre glifos similares) a la forma correcta, trabajando a nivel de línea.

## Capacidades

- Corrección post-OCR de líneas individuales en sánscrito devanagari, tomando la salida de Tesseract (`san`) como entrada.
- Generación de texto secuencia a secuencia con tokenización a nivel de byte, lo que permite procesar cualquier cadena de caracteres sin fallos de vocabulario.
- Manejo de errores de sustitución entre glifos visualmente similares, que es el patrón dominante en OCR de devanagari.
- Funcionamiento con decodificación greedy o beam search (el autor reporta mejoras con beam 4).
- Procesamiento por línea, adecuado para integrarse en pipelines de digitalización por lotes.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al sánscrito; no se ha entrenado para otras lenguas.

## Casos de uso

- Digitalización de corpus sánscritos: integrado como etapa posterior a Tesseract en un pipeline de OCR, el modelo corrige las líneas con baja confianza antes de almacenarlas en un corpus digital, reduciendo el CER de forma medible en textos de Wikipedia en sánscrito.
- Limpieza de textos extraídos de manuscritos impresos modernos: para documentos con tipografía similar a la usada en el entrenamiento (seis fuentes), el modelo corrige sustituciones de glifos y mejora la legibilidad del texto resultante.
- Filtrado por confianza en pipelines de producción: dado que el autor recomienda aplicarlo solo a líneas de baja confianza OCR, se puede usar como paso condicional que procesa únicamente las líneas marcadas como dudosas por el motor OCR, minimizando el riesgo de sobrecorrección.
- Preparación de datos para entrenamiento de modelos de lenguaje en sánscrito: la corrección de ruido OCR reduce la contaminación en corpus de entrenamiento derivados de fuentes digitalizadas.
- Investigación en corrección post-OCR para escrituras índicas: el repositorio incluye código, datos, evaluación e informe, lo que lo convierte en una referencia reproducible para experimentos con otras escrituras o idiomas.
- Análisis lingüístico y búsqueda en archivos digitalizados: al mejorar la exactitud del texto, facilita la búsqueda por términos y el análisis morfológico sobre corpus sánscritos previamente ruidosos.
- Evaluación comparativa de motores OCR: puede usarse como capa de corrección fija para medir el impacto relativo de distintos motores OCR sobre el mismo corpus.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (CER antes → después, con intervalo de confianza bootstrap del 95%):

| Conjunto de prueba | CER antes | CER después | Notas |
|---|---|---|---|
| 5 imágenes de página reales (salida Tesseract) | 9,6% [7,4–12,5] | 8,2% [6,4–10,9] | Con beam 4: 7,7% |
| 500 líneas renderizadas y pasadas por OCR | 8,8% [8,0–9,7] | 7,4% [6,7–8,2] | |
| 1.000 líneas con ruido sintético | 7,4% [7,0–7,8] | 3,4% [3,2–3,7] | |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 299,6 millones de parámetros en fp32, los pesos ocupan aproximadamente 1,2 GB; con activaciones y overhead de runtime, se estima un uso de VRAM de 2–3 GB en fp32 y menos de 1,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó en una T4 de Colab, por lo que una T4, una RTX 3060 o superiores son suficientes.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes con 8 GB o más.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM) es la vía documentada; al ser un modelo T5 estándar, es compatible con TGI y con conversiones a ONNX; para llama.cpp/Ollama sería necesaria una conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; el procesamiento es por línea con `max_length=384`, lo que sugiere baja latencia por línea en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| byt5-small-sanskrit-post-ocr | 299,6 M | no disponible | Corrección post-OCR sánscrito | Apache 2.0 | Hugging Face |
| google/byt5-small (base) | 299,6 M | no disponible | Texto a texto multilingüe | Apache 2.0 | Hugging Face |
| Tesseract `san` (motor OCR) | no aplica | no aplica | OCR de sánscrito | Apache 2.0 | Repositorio del proyecto |

No se dispone de información sobre otros modelos de corrección post-OCR específicos para sánscrito en la documentación proporcionada, por lo que la comparativa con alternativas equivalentes queda como no disponible.

## Limitaciones y advertencias

- Las mejoras sobre OCR real son modestas y los intervalos de confianza se solapan en el conjunto de prueba real, que solo contiene 5 imágenes de página.
- Sobre corrección: aproximadamente el 11% de las líneas ya correctas se modifican, principalmente por sustituciones entre palabras poco frecuentes visualmente similares.
- No corrige errores de palabra real, es decir, casos en los que el OCR produce otra palabra válida del idioma.
- Entrenado con sánscrito moderno de Wikipedia, por lo que puede rendir peor en textos clásicos o de dominio específico.
- Uso recomendado únicamente sobre líneas OCR de baja confianza; aplicarlo indiscriminadamente aumenta el riesgo de introducir errores.
- El modelo no ha sido evaluado en otras escrituras índicas ni en otros idiomas, pese a la naturaleza byte a byte de ByT5.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de entrenamiento.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrunalYewatkar45/byt5-small-sanskrit-post-ocr
- Repositorio con código, datos, evaluación e informe: https://github.com/Mrunal31-Stark/OCR_Extraction_indic_text
- Modelo base: https://huggingface.co/google/byt5-small
