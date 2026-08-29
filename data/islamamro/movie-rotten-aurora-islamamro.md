# Islamamro/movie-rotten-aurora-islamamro

## Resumen

El modelo `Islamamro/movie-rotten-aurora-islamamro` es un clasificador de sentimiento binario (positivo/negativo) para reseñas de películas, desarrollado por el usuario islamamro mediante el **Aurora Research Portal**. Se trata de un fine-tuning de `distilbert-base-uncased` sobre el dataset `cornell-movie-review-data/rotten_tomatoes`, con un total de 66.955.010 parámetros. Su propósito principal es demostrar el flujo completo de construcción, entrenamiento y publicación de modelos a través de la plataforma Aurora, no ser un modelo listo para producción.

El modelo fue entrenado sobre un subconjunto reducido de 1.400 ejemplos del dataset original, alcanzando una precisión del 0.84 en un conjunto de validación retenido. Aunque la arquitectura base (DistilBERT) soporta un contexto de 512 tokens, la información proporcionada no especifica la longitud de contexto configurada para este fine-tuning. La licencia es Apache 2.0, lo que permite uso comercial y modificación, pero el propio autor advierte que es una prueba de concepto y recomienda reentrenar con el dataset completo para aplicaciones reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer, base-uncased) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (estándar de DistilBERT: 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (entrenado con reseñas en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en **DistilBERT**, una versión destilada de BERT que conserva el 95% del rendimiento con un 40% menos de parámetros. DistilBERT es un transformer encoder con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, entrenado con destilación de conocimiento desde BERT-base. Para esta tarea, se añadió una cabeza de clasificación binaria sobre la representación del token `[CLS]`.

El entrenamiento se realizó sobre un subconjunto de 1.400 ejemplos del dataset Rotten Tomatoes (que contiene 8.530 reseñas etiquetadas). No se especifica el número de épocas, el tamaño de lote ni la tasa de aprendizaje. El autor indica que se entrenó en una NVIDIA RTX 3090, pero no se detallan hiperparámetros ni técnicas de regularización. No se aplicó RLHF ni DPO; es un fine-tuning supervisado estándar. La precisión reportada de 0.84 en el conjunto de validación retenido es modesta, consistente con el pequeño volumen de datos de entrenamiento.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en reseñas de películas.
- Procesamiento de texto en inglés (implícito por el dataset, aunque no se declara explícitamente).
- Inferencia rápida gracias a la arquitectura ligera de DistilBERT (67M parámetros).
- Integración sencilla con la librería `transformers` mediante el pipeline de `text-classification`.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).

## Casos de uso

- **Prototipado de sistemas de análisis de opinión**: el modelo puede integrarse en un pipeline de `transformers` para clasificar rápidamente reseñas de películas en entornos de desarrollo o demostraciones, aunque su precisión limitada lo hace inadecuado para producción.
- **Educación y formación en NLP**: sirve como ejemplo didáctico de fine-tuning de un transformer para clasificación de texto, mostrando el flujo completo desde el dataset hasta la publicación en HuggingFace.
- **Validación de pipelines de MLOps**: al ser un modelo pequeño y rápido, es útil para probar infraestructuras de despliegue (por ejemplo, con FastAPI o TorchServe) sin coste computacional elevado.
- **Análisis exploratorio de datos**: puede utilizarse para etiquetar automáticamente un conjunto de reseñas no etiquetadas y obtener una primera aproximación de la distribución de sentimiento, siempre que se acepte el margen de error.
- **Comparación de técnicas de destilación**: al estar basado en DistilBERT, permite estudiar el trade-off entre tamaño y rendimiento frente a BERT-base o modelos más grandes.
- **Demo interactiva en entornos web**: se puede desplegar en Gradio o Streamlit para que usuarios prueben la clasificación de frases en tiempo real, como parte de un portafolio o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. El único dato reportado es la precisión en un conjunto de validación retenido:

| Métrica | Valor |
|---|---|
| Precisión (held-out) | 0.84 |

Este valor se obtuvo sobre un subconjunto de validación del dataset Rotten Tomatoes, pero no se especifica el tamaño exacto ni la metodología de partición. Dado que el entrenamiento se realizó con solo 1.400 ejemplos, este resultado no es comparable con modelos entrenados en el dataset completo (que suelen alcanzar ~0.85-0.90 con DistilBERT). No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: menos de 1 GB en FP32 (el modelo tiene ~268 MB en pesos). Con cuantización a int8, podría reducirse a ~70 MB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1650, RTX 2060, o incluso integradas modernas. También funciona en CPU con latencia aceptable (decenas de milisegundos por muestra).
- **Cabe en consumer GPU**: sí, en cualquier GPU de consumo actual.
- **Opciones de despliegue**: compatible con `transformers` (PyTorch), `onnxruntime`, `TensorFlow Lite`, y servidores de inferencia como `vLLM` (aunque no es óptimo para modelos tan pequeños), `TGI` o `Ollama` (si se convierte a GGUF). Para prototipos, se puede usar `pipeline` de HuggingFace.
- **Latencia estimada**: en una RTX 3090, la inferencia de una frase corta tarda <5 ms; en CPU moderna, ~20-50 ms.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (Rotten Tomatoes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Islamamro/movie-rotten-aurora-islamamro` | 67M | no disponible | 0.84 (subconjunto 1.4k) | Apache 2.0 | HuggingFace |
| `distilbert-base-uncased` (fine-tune completo) | 67M | 512 | ~0.87-0.89 (típico) | Apache 2.0 | HuggingFace |
| `bert-base-uncased` (fine-tune completo) | 110M | 512 | ~0.88-0.90 | Apache 2.0 | HuggingFace |
| `roberta-base` (fine-tune completo) | 125M | 512 | ~0.89-0.91 | MIT | HuggingFace |

La comparativa se basa en valores típicos de la literatura, no en mediciones directas de este modelo. El modelo evaluado está claramente por debajo de las alternativas entrenadas con el dataset completo, tanto en precisión como en robustez.

## Limitaciones y advertencias

- **Modelo de demostración, no de producción**: el autor lo indica explícitamente; fue entrenado con solo 1.400 ejemplos, lo que limita su generalización.
- **Sesgos del dataset**: Rotten Tomatoes contiene reseñas de críticos profesionales, mayoritariamente en inglés y con un registro formal; el modelo puede fallar en lenguaje coloquial, jerga o reseñas de otros dominios.
- **Riesgo de alucinación**: al ser un clasificador, no genera texto, pero puede producir etiquetas incorrectas con alta confianza en entradas fuera de distribución.
- **Limitaciones de idioma**: no se declara soporte multilingüe; el entrenamiento con datos en inglés implica que su rendimiento en otros idiomas será deficiente.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; el usuario asume la responsabilidad de validar el modelo para su caso de uso.
- **Falta de documentación técnica**: no se proporcionan hiperparámetros, partición de datos ni detalles de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Islamamro/movie-rotten-aurora-islamamro)
- [Dataset Rotten Tomatoes (cornell-movie-review-data)](https://huggingface.co/datasets/cornell-movie-review-data/rotten_tomatoes)
- [Perfil de GitHub del autor](https://github.com/islamamro)
