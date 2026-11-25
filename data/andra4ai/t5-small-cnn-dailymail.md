# andra4ai/t5-small-cnn-dailymail

## Resumen

El modelo `andra4ai/t5-small-cnn-dailymail` es un ajuste fino del checkpoint `google-t5/t5-small` de Google, especializado en la generación de resúmenes extractivos y abstractivos de noticias en inglés. Lo publica el usuario independiente `andra4ai` bajo licencia Apache 2.0 y está pensado como un experimento de ajuste fino ligero sobre el corpus CNN/DailyMail 3.0.0, el benchmark de referencia para summarization de noticias.

Se trata de un modelo encoder-decoder de tipo T5 (Text-to-Text Transfer Transformer) con 60,5 millones de parámetros, la variante "small" de la familia T5. La tarea se aborda con el prefijo `summarize: ` sobre la entrada, siguiendo la formulación text-to-text original de T5. El checkpoint se entrenó con un conjunto muy reducido de datos (1.000 artículos de entrenamiento) y una sola época, por lo que debe considerarse una prueba de concepto más que un modelo de producción.

Su relevancia es limitada: las métricas ROUGE publicadas muestran una mejora marginal respecto al checkpoint base (ROUGE-1 de 30,82 a 31,66), lo que sugiere que el ajuste fino apenas modifica el comportamiento del modelo original. Resulta útil como referencia didáctica de fine-tuning de T5 para summarization, pero no compite con modelos especializados de mayor tamaño ni con LLMs modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 60.506.624 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entrada en inferencia); 1.024 tokens en entrenamiento |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-t5/t5-small`, un transformer encoder-decoder con 60,5 millones de parámetros, 6 capas en encoder y decoder, y atención multi-cabeza estándar. T5 formula todas las tareas como text-to-text; para summarization se antepone el prefijo `summarize: ` al artículo de entrada y el modelo genera el resumen como secuencia de salida. El tokenizer es el original de T5 (SentencePiece).

El ajuste fino se realizó sobre CNN/DailyMail 3.0.0 con un subconjunto muy reducido: 1.000 artículos de entrenamiento, 100 de validación y 100 de test. Se entrenó durante una sola época en una GPU Apple M5, con semilla 42, learning rate `5e-05` y batch efectivo de 8. Los límites de entrenamiento fueron 1.024 tokens de entrada y 128 tokens de objetivo. En inferencia se usó decodificación greedy (`num_beams=1`, `do_sample=False`), con límite de 512 tokens de entrada en validación y hasta 96 tokens nuevos en test. No se documenta uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Generación de resúmenes de noticias en inglés a partir de artículos de entrada, mediante el prefijo `summarize: `.
- Generación de texto condicionada (text2text-generation) propia de la arquitectura T5.
- Traducción y otras tareas text-to-text heredadas del checkpoint base, aunque no fueron objeto del ajuste fino ni se evalúan.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (el checkpoint base T5 tiene algo de multilingüismo residual, pero el ajuste y la evaluación son solo en inglés).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Resumen de titulares y notas de prensa en inglés: el modelo recibe un artículo y devuelve un resumen corto; adecuado para prototipos de agregadores de noticias por su reducido tamaño y su licencia permisiva.
- Generación de resúmenes en pipelines de bajo coste: con 60,5 M de parámetros puede ejecutarse en CPU o GPU de gama baja, lo que lo hace útil para demos o entornos con recursos limitados.
- Preprocesado de corpus para búsqueda o indexación: resumir documentos antes de almacenarlos en un motor de búsqueda o en una base vectorial para reducir el ruido.
- Filtrado y triaje de contenidos: generar un resumen breve de cada artículo entrante para que un humano decida si merece revisión completa.
- Experimentación académica y docencia: sirve como ejemplo reproducible de fine-tuning de T5 para summarization con un dataset pequeño y métricas ROUGE documentadas.
- Baseline para comparativas de summarization: al estar basado en T5-small y evaluado en CNN/DailyMail, puede usarse como referencia mínima frente a modelos más grandes o especializados.
- Generación de resúmenes de correos o comunicados internos en inglés: para textos cortos y de dominio periodístico similar al corpus de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (ROUGE F1 × 100, decodificación greedy, límite de 512 tokens de entrada y hasta 96 tokens nuevos en test):

| Checkpoint | ROUGE-1 | ROUGE-2 | ROUGE-L |
|---|---:|---:|---:|
| Antes del fine-tuning (T5-small base) | 30,82 | 12,35 | 23,07 |
| Después del fine-tuning | 31,66 | 13,19 | 23,51 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La mejora respecto al checkpoint base es de +0,84 en ROUGE-1, +0,84 en ROUGE-2 y +0,44 en ROUGE-L, sobre una muestra de test de 100 artículos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 250 MB para los pesos (60,5 M de parámetros × 4 bytes), más overhead de activaciones y tokenizer; cabe holgadamente en cualquier GPU consumer.
- En fp16/bf16: aproximadamente 125 MB de pesos, ejecutable en GPUs integradas y en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer y en la mayoría de portátiles; también es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: `transformers` (PyTorch), `text-generation-inference` (según los tags del repo), y exportación a ONNX o cuantización a int8 mediante herramientas estándar de transformers (no documentado por el autor).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de decenas de milisegundos por resumen en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `andra4ai/t5-small-cnn-dailymail` | 60,5 M | 512 tokens (inferencia) | Summarization EN | Apache 2.0 | Hugging Face |
| `google-t5/t5-small` (base) | 60,5 M | 512 tokens | Text-to-text general | Apache 2.0 | Hugging Face |
| `facebook/bart-large-cnn` | ~406 M | 1.024 tokens | Summarization EN | MIT | Hugging Face |
| `google/pegasus-cnn_dailymail` | ~568 M | 1.024 tokens | Summarization EN | Apache 2.0 | Hugging Face |

Frente a `facebook/bart-large-cnn` y `google/pegasus-cnn_dailymail`, este checkpoint es entre 7 y 9 veces más pequeño, pero también mucho menos capaz: los modelos BART-large y PEGASUS especializados en CNN/DailyMail alcanzan ROUGE-1 muy superiores en la literatura, aunque no se dispone de sus cifras exactas en la información proporcionada para una comparación numérica directa. La ventaja principal de este modelo es su huella mínima y su licencia permisiva; la desventaja, su escasa mejora sobre el checkpoint base y su entrenamiento con solo 1.000 ejemplos.

## Limitaciones y advertencias

- El ajuste fino apenas mejora al checkpoint base (menos de 1 punto de ROUGE en todas las métricas), por lo que el valor añadido del checkpoint es marginal.
- Entrenado con solo 1.000 artículos y una época: riesgo alto de sobreajuste y de generalización pobre a dominios distintos del periodístico.
- El autor advierte de que el modelo puede repetirse, omitir detalles importantes y equivocarse en hechos como fechas y nombres (riesgo de alucinación).
- El límite de 512 tokens de entrada en inferencia puede truncar artículos largos y perder información del final.
- Solo evaluado en inglés y sobre una muestra de test de 100 artículos, lo que hace las métricas poco robustas estadísticamente.
- No se documentan sesgos específicos, pero al derivar de T5-small hereda los sesgos del corpus original de T5 (C4), no auditados en esta ficha.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de CNN/DailyMail para usos sensibles.
- No apto para producción crítica sin una evaluación adicional sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/andra4ai/t5-small-cnn-dailymail
- Modelo base: https://huggingface.co/google-t5/t5-small
- Dataset CNN/DailyMail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Paper de T5: https://jmlr.org/papers/v21/20-074.html
