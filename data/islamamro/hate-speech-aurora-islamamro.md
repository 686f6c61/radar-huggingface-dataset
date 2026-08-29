# Islamamro/hate-speech-aurora-islamamro

## Resumen

El modelo `Islamamro/hate-speech-aurora-islamamro` es un clasificador de texto de tres clases (discurso de odio, lenguaje ofensivo y ninguno de los dos) desarrollado por el usuario Islamamro. Se trata de un fine-tuning de `distilbert-base-uncased` sobre el dataset `SetFit/hate_speech_offensive`, entrenado y publicado a través del Aurora Research Portal. El modelo tiene 66,9 millones de parámetros y está pensado como una prueba de concepto del pipeline de construcción-entrenamiento-publicación de Aurora, no como un sistema listo para producción.

La relevancia de este modelo radica en su utilidad como ejemplo de fine-tuning rápido y ligero para moderación de contenido, aunque su entrenamiento se realizó sobre un subconjunto de solo 1.400 ejemplos, lo que limita su rendimiento en datos reales. El autor indica explícitamente que no es un modelo de producción y que se debe reentrenar con el dataset completo para uso real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer) |
| Parametros totales | 66.955.779 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de DistilBERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (DistilBERT base está entrenado en inglés, no confirmado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT con 6 capas de transformer, 768 dimensiones ocultas y 12 cabezas de atención. Se realizó un fine-tuning supervisado sobre el dataset `SetFit/hate_speech_offensive`, que contiene ejemplos etiquetados como discurso de odio, ofensivo o neutro. El entrenamiento se llevó a cabo en una NVIDIA RTX 3090, aunque no se especifican hiperparámetros, número de épocas ni estrategia de optimización. El autor indica que se usó un subconjunto de 1.400 ejemplos, lo que sugiere un entrenamiento rápido con fines demostrativos.

No se menciona el uso de técnicas como RLHF, DPO o decodificación especulativa. La innovación principal no está en la arquitectura, sino en el flujo de trabajo automatizado del Aurora Research Portal, que permite construir, entrenar y publicar modelos de forma integrada.

## Capacidades

- Clasificación de texto en tres categorías: discurso de odio, lenguaje ofensivo y ninguno.
- Inferencia mediante pipeline de Hugging Face `text-classification`.
- Modelo ligero (66,9 M parámetros) adecuado para despliegue en entornos con recursos limitados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Capacidad multilingüe no confirmada; el modelo base DistilBERT está entrenado principalmente en inglés.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede clasificar publicaciones como odio, ofensivas o neutras, permitiendo filtrar contenido problemático. Su tamaño reducido facilita la integración en pipelines de moderación en tiempo real, aunque requiere reentrenamiento con datos completos para alcanzar precisión aceptable.
- Análisis de sentimiento en encuestas o reseñas: aunque no es su propósito principal, la clasificación de ofensividad puede servir como proxy para detectar feedback negativo extremo.
- Prototipado de sistemas de detección de toxicidad: como demostración del pipeline Aurora, sirve para validar la viabilidad de un clasificador antes de invertir en un entrenamiento completo.
- Investigación académica sobre discurso de odio: el modelo puede usarse como baseline en estudios comparativos, siempre que se documente su limitación de entrenamiento.
- Filtrado de contenido en plataformas de comentarios: integración en un servicio backend que descarte mensajes ofensivos antes de su publicación.
- Evaluación de sesgos en modelos de lenguaje: al ser un clasificador de odio, puede emplearse para medir la toxicidad de salidas de otros modelos generativos.

## Benchmarks y rendimiento

El autor reporta una accuracy de 0,91 en un conjunto de validación reservado (held-out), pero no se especifica el tamaño de dicho conjunto ni la métrica exacta (macro-F1, precisión, recall). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GLUE. Dado que el entrenamiento se realizó sobre un subconjunto de 1.400 ejemplos, esta accuracy probablemente no sea representativa del rendimiento en datos reales.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 66,9 M parámetros. En FP32 ocupa aproximadamente 268 MB, en FP16 unos 134 MB y en int8 unos 67 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100, etc. También puede ejecutarse en CPU con latencia aceptable para inferencia por lotes.
- Compatible con GPUs de consumo: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: se puede servir con Hugging Face `pipeline`, `transformers` + `torch`, o mediante frameworks como vLLM o TGI (aunque al ser un modelo pequeño, no requiere optimizaciones especiales). También es compatible con ONNX Runtime y TensorRT.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia de un solo texto debería ser inferior a 10 ms; en CPU, del orden de 50-100 ms.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de detección de hate speech (por ejemplo, `cardiffnlp/twitter-roberta-base-hate`, `Hate-speech-CNERG/dehatebert-mono-english`). No se conocen sus parámetros, rendimiento ni licencias en el contexto de esta ficha. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Entrenado sobre un subconjunto de 1.400 ejemplos, lo que provoca un alto riesgo de sobreajuste y baja generalización.
- No es un modelo de producción; el propio autor lo desaconseja para uso real sin reentrenamiento.
- Sesgos potenciales: el dataset `SetFit/hate_speech_offensive` puede contener sesgos culturales y lingüísticos, y el modelo puede clasificar erróneamente dialectos o jergas no representadas.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir falsos positivos o negativos en la detección de odio.
- Limitaciones de idioma: no se confirma soporte multilingüe; probablemente solo funcione bien en inglés.
- Licencia Apache 2.0 permite uso comercial, pero con las limitaciones de rendimiento mencionadas.
- No se especifican detalles de preprocesamiento ni tokenización, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Islamamro/hate-speech-aurora-islamamro
- Dataset de entrenamiento: https://huggingface.co/datasets/SetFit/hate_speech_offensive
- No se encontraron papers, blogs o repositorios adicionales específicos de este modelo.
