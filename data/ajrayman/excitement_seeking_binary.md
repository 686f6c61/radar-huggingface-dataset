# ajrayman/Excitement_Seeking_binary

## Resumen

`Excitement_Seeking_binary` es un modelo de clasificación de texto binario desarrollado por el usuario `ajrayman` y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo `roberta-base` de Facebook AI, orientado a tareas de clasificación de texto en las que se predice una etiqueta binaria, probablemente relacionada con el rasgo psicológico de "búsqueda de emociones" (excitement seeking). El modelo tiene 124,6 millones de parámetros, una arquitectura transformer encoder-only y una ventana de contexto de 512 tokens (la estándar de RoBERTa-base). Su relevancia radica en ser un ejemplo de fine-tuning sencillo y ligero para tareas de clasificación de texto, aunque su documentación es muy escasa y no se especifican los datos de entrenamiento ni el dominio exacto de aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder-only) |
| Parametros totales | 124.647.170 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (512 según arquitectura RoBERTa-base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-base, un transformer encoder-only con 12 capas, 12 cabezas de atención y una dimensión oculta de 768. Es un ajuste fino del checkpoint `FacebookAI/roberta-base` sobre un dataset no especificado (la model card indica "None"). Durante el entrenamiento se utilizaron hiperparámetros estándar: learning rate de 2e-5, batch size de 32, optimizador Adam (betas 0.9/0.999), scheduler lineal con warmup del 6% y 8 épocas. No se mencionan técnicas avanzadas como RLHF, DPO ni decodificación especulativa. El proceso de fine-tuning es convencional y no introduce innovaciones arquitectónicas destacables.

## Capacidades

- Clasificación de texto binaria: el modelo predice una de dos clases a partir de un texto de entrada.
- Específicamente entrenado para detectar el rasgo de "búsqueda de emociones" (excitement seeking), aunque el dominio exacto no está documentado.
- No se reportan capacidades de generación de texto, tool calling, agentes, razonamiento multi-paso, visión o audio.
- No se especifica soporte multilingüe; al derivar de RoBERTa-base, el tokenizador está entrenado principalmente en inglés, pero no hay confirmación oficial.

## Casos de uso

- Análisis de sentimiento binario: se puede emplear para clasificar opiniones o reseñas en positivas/negativas, aunque su rendimiento (accuracy ~65%) es moderado.
- Moderación de contenido: detección de textos que indican comportamientos de búsqueda de emociones (p. ej., en redes sociales o foros) para aplicar políticas de moderación.
- Investigación psicológica: análisis de respuestas de cuestionarios o textos libres para identificar rasgos de personalidad relacionados con la búsqueda de sensaciones.
- Filtrado de textos en plataformas de salud mental: identificación de mensajes con indicadores de conductas de riesgo.
- Clasificación de comentarios en encuestas: segmentación de respuestas según el nivel de excitación o búsqueda de novedad.
- Prototipado rápido: al ser un modelo pequeño y con licencia MIT, sirve como punto de partida para experimentos de clasificación de texto sin grandes requisitos de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye métricas de evaluación sobre un conjunto de validación no especificado, reportadas por el autor:

| Metrica | Valor |
|---|---|
| Loss | 0.7661 |
| Accuracy | 0.6526 |
| Precision | 0.6350 |
| Recall | 0.7157 |
| F1 | 0.6729 |
| AUC | 0.6906 |

Estos valores son moderados y sugieren un rendimiento aceptable pero no sobresaliente para una tarea binaria. No hay comparación con otros modelos en la documentación.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 124M parámetros, en FP32 ocupa aproximadamente 500 MB. Con cuantización a 8 bits (si estuviera disponible) bajaría a ~250 MB, y a 4 bits a ~125 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) es suficiente. También puede ejecutarse en CPU sin problemas para inferencia en lote.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna de gama media o baja.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Inference Endpoints, o mediante librerías como vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con `text-embeddings-inference` según los tags.
- Latencia y throughput: no se dispone de datos oficiales, pero en una GPU moderna (p. ej., RTX 3090) se esperan latencias de pocos milisegundos por muestra y throughput de cientos de muestras por segundo.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. Como referencia cualitativa:

- **RoBERTa-base (original)**: modelo base sin fine-tuning, no apto para clasificación directa sin adaptación. El presente modelo es un fine-tuning de este.
- **Excitement_Seeking_continuous** (del mismo autor): variante que predice un valor continuo en lugar de binario, también basada en RoBERTa-base. No se han publicado métricas comparables.
- **Otros clasificadores binarios de texto** (p. ej., DistilBERT-base fine-tuned): suelen tener tamaños similares (66M-124M) y métricas variables según el dominio. No hay datos para comparar directamente.

## Limitaciones y advertencias

- Documentación muy incompleta: la model card no especifica el dataset de entrenamiento, el dominio de aplicación ni los idiomas soportados.
- Rendimiento moderado: la accuracy de 0.65 y F1 de 0.67 indican que el modelo tiene margen de mejora y puede no ser adecuado para aplicaciones críticas sin validación adicional.
- Riesgo de sesgos: al derivar de RoBERTa-base, puede heredar sesgos presentes en los datos de preentrenamiento (género, raza, etc.). El fine-tuning en un dataset desconocido podría amplificar dichos sesgos.
- Alucinaciones: al ser un clasificador, no genera texto, pero puede producir clasificaciones incorrectas en entradas fuera de su distribución.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero no se garantiza la calidad ni la adecuación para fines específicos.
- Sin garantía de soporte: el autor no proporciona información de contacto ni mantenimiento del modelo.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/ajrayman/Excitement_Seeking_binary)
- [Modelo base: roberta-base](https://huggingface.co/FacebookAI/roberta-base)
- [Modelo relacionado del mismo autor: Excitement_Seeking_continuous](https://huggingface.co/ajrayman/Excitement_Seeking_continuous)
