# Shicheng/biomedical-ai-resource-track-baseline

## Resumen

Biomedical AI Resource Track Baseline es un clasificador de texto multiclase desarrollado por Shicheng Guo, pensado exclusivamente como herramienta de apoyo a la curación del atlas de recursos «RNA, Human Genetics & AI Atlas». Su función es asignar descripciones de recursos públicos de IA biomédica a una de cuatro categorías del atlas: Computational Biology, Human Biobank, AI Agents & Agentic AI y Human Data Integration & AI. No es un modelo fundacional ni un predictor científico o clínico, sino una línea base reproducible y completamente transparente para enrutar nuevos recursos descubiertos en Hugging Face hacia la sección correspondiente del atlas.

Técnicamente es un clasificador Naive Bayes multinomial implementado únicamente con la biblioteca estándar de Python, con pesos almacenados en JSON y sin dependencias propietarias ni serialización binaria. Emplea unigramas y bigramas de palabras adyacentes en minúsculas, con retención de características observadas al menos dos veces, suavizado de Laplace (α=1) y un total de 165 características retenidas. Se entrenó con las 20 descripciones del dataset Shicheng/rna-human-genetics-ai-atlas (instantánea revisada el 2026-11-01).

Su relevancia es metodológica más que de rendimiento: demuestra un flujo de curación reproducible y auditable (huella SHA-256 del CSV de recursos incluida en model.json, evaluación con validación cruzada leave-one-out y artefactos de evaluación completos) sobre un corpus deliberadamente pequeño. La licencia Apache 2.0 y la ausencia de dependencias externas facilitan su inspección y reproducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Naive Bayes multinomial (clasificador lineal probabilístico, no transformer) |
| Parámetros totales | no disponible (165 características retenidas; pesos en JSON) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clasificación a nivel de descripción completa; sin límite de contexto definido) |
| Tipos de cuantización | no disponible (pesos JSON en texto plano, sin cuantización) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (model.json); sin safetensors ni GGUF |
| Pipeline | text-classification |
| Librería | custom (Python estándar) |
| Dataset de entrenamiento | Shicheng/rna-human-genetics-ai-atlas (20 descripciones) |

## Arquitectura y entrenamiento

El modelo es un clasificador Naive Bayes multinomial sobre representación de bolsa de palabras. La vectorización usa unigramas y bigramas de palabras adyacentes en minúsculas, con umbral mínimo de frecuencia de 2, lo que da lugar a 165 características retenidas tras el filtrado. Se aplica suavizado de Laplace con α=1. Los pesos se serializan en model.json, y la inferencia se ejecuta con la biblioteca estándar de Python mediante predict.py, que devuelve la clase predicha y las probabilidades normalizadas por clase en formato JSON.

El entrenamiento utilizó las 20 descripciones del atlas en la instantánea del 2026-11-01. Solo los títulos de recursos y los resúmenes de evidencia actúan como texto predictivo; los likes, descargas, propietarios y preguntas de revisión no se emplean como entradas. La reproducibilidad está garantizada por la inclusión de la huella SHA-256 exacta de resources.csv en model.json y por train.py, que regenera model.json y evaluation.json usando únicamente la biblioteca estándar. La evaluación se realizó con validación cruzada leave-one-out sobre los 20 registros.

## Capacidades

- Clasificación de texto multiclase en cuatro categorías del atlas: Computational Biology, Human Biobank, AI Agents & Agentic AI y Human Data Integration & AI.
- Salida de probabilidades normalizadas por clase en JSON, además de la clase predicha.
- Enrutamiento de descripciones de recursos biomédicos de IA recién descubiertos hacia la sección correspondiente del atlas.
- Reproducibilidad completa: regeneración de pesos y evaluación con scripts de la biblioteca estándar.
- Auditoría de datos mediante huella SHA-256 del fichero de recursos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el modelo card no documenta idiomas soportados.

## Casos de uso

- Curación del atlas de recursos: dado un título y un resumen de evidencia de un recurso nuevo de Hugging Face, el modelo devuelve la pista del atlas a la que asignarlo, reduciendo el trabajo manual del curador.
- Triaje previo en pipelines de catalogación: integrado como primer filtro en un flujo de ingesta que procesa lotes de descripciones y marca las de baja confianza para revisión humana.
- Línea base reproducible para experimentos de clasificación: sirve como referencia contra la que medir mejoras futuras (modelos basados en embeddings o LLM) sobre el mismo conjunto de 20 registros y la misma partición leave-one-out.
- Demostración docente de transparencia en IA: ejemplo de modelo auditable, con pesos legibles y sin dependencias, útil para enseñar evaluación honesta con muestras pequeñas y análisis de matrices de confusión.
- Validación de taxonomías de curación: al analizar los errores por clase (por ejemplo, el F1 de 0,5714 en Human Biobank), el equipo puede identificar categorías ambiguas y refinar las definiciones del atlas.
- Auditoría de reproducibilidad: verificación de la integridad del corpus comparando la huella SHA-256 almacenada en model.json con el fichero resources.csv del dataset.
- Prototipado rápido sin infraestructura: al ejecutarse solo con Python estándar, puede desplegarse en cualquier entorno sin GPU ni servidores de inferencia dedicados.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), obtenidos mediante validación cruzada leave-one-out sobre los 20 registros del dataset Shicheng/rna-human-genetics-ai-atlas:

| Métrica | Resultado |
|---|---:|
| Accuracy (leave-one-out) | 0,8000 |
| Macro F1 (leave-one-out) | 0,7804 |
| F1 AI Agents & Agentic AI | 0,7500 |
| F1 Computational Biology | 0,8000 |
| F1 Human Biobank | 0,5714 |
| F1 Human Data Integration & AI | 1,0000 |

Las predicciones completas, probabilidades, métricas por clase y matriz de confusión están disponibles en evaluation.json del repositorio. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU con la biblioteca estándar de Python.
- GPU recomendadas: ninguna; no requiere aceleración por hardware.
- Cabe en cualquier GPU consumer y también en entornos sin GPU.
- Opciones de despliegue: ejecución directa con Python (predict.py); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de pesos neuronales.
- Latencia y throughput: no disponibles; al tratarse de un clasificador Naive Bayes con 165 características, la inferencia es de coste despreciable, pero no se publican cifras medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, este modelo se diferencia de los clasificadores basados en transformers (por ejemplo, variantes de BERT para texto biomédico) en que no emplea redes neuronales, no requiere GPU y su transparencia es total, a costa de una capacidad de generalización muy limitada por el tamaño del corpus (20 ejemplos).

| Criterio | Este modelo | Clasificador transformer típico (referencia genérica) |
|---|---|---|
| Arquitectura | Naive Bayes multinomial | Transformer encoder |
| Datos de entrenamiento | 20 descripciones | Millones de documentos |
| Requisitos de hardware | CPU, Python estándar | GPU recomendada |
| Licencia | Apache 2.0 | Variable |
| Formatos de pesos | JSON | safetensors, GGUF |
| Transparencia | Total (pesos legibles) | Parcial |

Los datos de la columna de referencia genérica no proceden de la información proporcionada y se incluyen solo como marco conceptual; no se dispone de comparaciones medidas.

## Limitaciones y advertencias

- Veinte ejemplos son insuficientes para un clasificador de propósito general; la generalización externa no está establecida.
- Las etiquetas reflejan la taxonomía práctica de un único curador, no una ontología universal.
- Las descripciones de recursos suelen abarcar varias pistas, lo que genera ambigüedad inherente en la clasificación.
- Las probabilidades de salida no son estimaciones de confianza calibradas.
- El rendimiento en Human Biobank es el más débil (F1 de 0,5714) y requiere revisión manual.
- La evaluación reutiliza la misma instantánea pequeña de curación; no demuestra generalización a datos externos.
- No debe usarse para inferencia biológica, priorización de dianas, decisiones clínicas, cribado de candidatos ni evaluación de calidad científica.
- Sesgos conocidos: no documentados explícitamente, más allá del sesgo de la taxonomía de un único curador y del corpus reducido.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza aparente por falta de calibración.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está diseñado ni validado para aplicaciones comerciales de clasificación biomédica a gran escala.
- Idiomas soportados no documentados; el vocabulario se deriva de descripciones en el corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shicheng/biomedical-ai-resource-track-baseline
- Dataset: https://huggingface.co/datasets/Shicheng/rna-human-genetics-ai-atlas
- Space de búsqueda: https://huggingface.co/spaces/Shicheng/rna-human-genetics-ai-atlas
- Colección curada: https://huggingface.co/collections/Shicheng/ai-for-rna-biology-human-genetics-and-drug-discovery-6ae7d2997b5be2d9912e09c9
- Perfil del autor: https://huggingface.co/Shicheng
