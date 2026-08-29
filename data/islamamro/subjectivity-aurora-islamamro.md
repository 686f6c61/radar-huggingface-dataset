# Islamamro/subjectivity-aurora-islamamro

## Resumen

El modelo `Islamamro/subjectivity-aurora-islamamro` es un clasificador de texto binario que distingue entre afirmaciones subjetivas (opiniones) y objetivas (hechos). Fue desarrollado por el usuario Islamamro mediante el **Aurora Research Portal**, una plataforma que permite construir, entrenar y publicar modelos de extremo a extremo. Se trata de un fine-tuning del modelo `distilbert-base-uncased` sobre el dataset `SetFit/subj`, con un subconjunto de demostración de 1.400 ejemplos.

Con 66,9 millones de parámetros, el modelo es compacto y está pensado como una prueba de concepto del pipeline de Aurora, no como una herramienta de producción. Su relevancia radica en ilustrar el flujo de trabajo de la plataforma y en ofrecer una base para quienes deseen fine-tunear sobre el dataset completo. La precisión reportada en un conjunto de validación reservado es de 0,93.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base DistilBERT soporta 512 tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base está entrenado en inglés, pero no se indica en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que conserva la arquitectura transformer encoder con 6 capas, 768 dimensiones ocultas y 12 cabezas de atención. Se realizó un fine-tuning supervisado sobre el dataset `SetFit/subj`, que contiene frases etiquetadas como subjetivas u objetivas. El entrenamiento se llevó a cabo en una NVIDIA RTX 3090, aunque no se detallan hiperparámetros ni número de épocas. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación principal no está en la arquitectura, sino en el proceso: el modelo fue construido, entrenado y publicado íntegramente a través del Aurora Research Portal, lo que demuestra la automatización del flujo.

## Capacidades

- Clasificación binaria de texto: distingue entre opinión subjetiva y afirmación objetiva.
- Procesamiento de texto en inglés (heredado del modelo base, aunque no se confirma en la ficha).
- Inferencia rápida gracias al tamaño reducido (66M parámetros).
- Integración sencilla con la librería `transformers` mediante el pipeline de clasificación de texto.
- No soporta tool calling, generación de código, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Análisis de opiniones en encuestas o reseñas: el modelo puede clasificar comentarios como subjetivos u objetivos, útil para separar hechos de valoraciones en datos de retroalimentación.
- Moderación de contenido en foros: identificar si una publicación expresa una opinión personal o presenta información factual, ayudando a priorizar revisiones.
- Preprocesamiento de datos para entrenar otros modelos: filtrar textos subjetivos de un corpus objetivo antes de alimentar un sistema de extracción de información.
- Demostración del pipeline Aurora: sirve como ejemplo didáctico para desarrolladores que quieran evaluar la plataforma de entrenamiento y publicación.
- Prototipado rápido de clasificadores de texto: al ser un modelo pequeño, puede integrarse en entornos con recursos limitados para pruebas de concepto.
- Investigación en análisis de sentimiento: aunque no está optimizado para sentimiento, puede servir como baseline para comparar con modelos más complejos.

## Benchmarks y rendimiento

La única métrica reportada es la precisión en un conjunto de validación reservado: **0,93**. No se especifica el tamaño de ese conjunto ni se comparan resultados con otros modelos. No se han publicado resultados en benchmarks estándar como MMLU, GLUE o SuperGLUE.

## Requisitos de hardware

- Al ser un modelo de 66M parámetros, la inferencia puede ejecutarse en CPU con memoria RAM suficiente (menos de 1 GB para los pesos en float32).
- En GPU, cabe en cualquier tarjeta con al menos 2 GB de VRAM, incluyendo GPUs consumer como GTX 1050 Ti, RTX 2060 o superiores.
- El entrenamiento se realizó en una RTX 3090, pero para inferencia no se requiere ese nivel de hardware.
- Opciones de despliegue: se puede servir con `transformers` (pipeline), `FastAPI` + `torch`, o mediante herramientas como `vLLM` (aunque no es óptimo para modelos tan pequeños) o `ONNX Runtime`.
- Latencia estimada: en CPU moderna, la inferencia de una frase corta suele estar por debajo de 50 ms; en GPU, por debajo de 10 ms. Estos valores son orientativos y dependen del hardware y la longitud del texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se podría comparar con otros fine-tunings de DistilBERT sobre el mismo dataset, pero no hay datos disponibles.

## Limitaciones y advertencias

- Entrenado únicamente sobre 1.400 ejemplos, lo que limita su generalización a dominios o estilos de escritura no representados en el dataset.
- No es un modelo de producción: el propio autor indica que es una prueba del pipeline y recomienda fine-tunear sobre el dataset completo para uso real.
- Posibles sesgos derivados del dataset `SetFit/subj`, que puede contener desequilibrios o sesgos culturales.
- Riesgo de alucinación no aplica directamente, pero la clasificación puede ser errónea en textos ambiguos o con ironía.
- No se especifican los idiomas soportados; aunque el modelo base es inglés, no hay garantía de rendimiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero al ser un modelo de demostración, su calidad no está garantizada para entornos productivos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Islamamro/subjectivity-aurora-islamamro)
- [Dataset SetFit/subj](https://huggingface.co/datasets/SetFit/subj)
- [Perfil de GitHub del autor](https://github.com/islamamro)
