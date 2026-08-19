# kerasformers/electra_small_generator

## Resumen

`kerasformers/electra_small_generator` es una conversión pura a Keras 3 del checkpoint oficial `google/electra-small-generator`, desarrollada por el proyecto KerasFormers. Este modelo corresponde al **generador** de la arquitectura ELECTRA, un codificador de texto bidireccional preentrenado mediante la técnica de *replaced-token detection*: un generador (este modelo) produce tokens corruptos y un discriminador aprende a distinguirlos. En este repositorio se publica únicamente el generador, entrenado como modelo de lenguaje enmascarado (MLM), por lo que su pipeline es `fill-mask`.

La relevancia de esta conversión radica en que permite ejecutar el mismo modelo con los tres backends de Keras 3 (TensorFlow, PyTorch y JAX) sin modificar el código, facilitando la experimentación y el despliegue en entornos heterogéneos. Al ser un modelo pequeño (el repositorio ocupa 0.1 GB), es adecuado para tareas de relleno de máscara, extracción de características o como base para fine-tuning en tareas de clasificación, NER o QA, siempre que se acepte su capacidad limitada frente a modelos más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ELECTRA (generador) - transformer bidireccional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.1 GB, probablemente pesos Keras) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ELECTRA original de Google (arXiv:2003.10555): un transformer bidireccional con tokenización WordPiece y token de máscara `[MASK]`. En el esquema de preentrenamiento, el generador se entrena como un MLM estándar para predecir tokens enmascarados, mientras que el discriminador aprende a detectar qué tokens han sido reemplazados por el generador. Este checkpoint concreto es el generador pequeño, que según la documentación de Google no está escalado adecuadamente para preentrenar junto con el discriminador pequeño (se recomienda un multiplicador de hiperparámetros de 1/4), aunque sí es válido para tareas de relleno de máscara o como encoder.

La conversión a Keras 3 mantiene los pesos originales y permite cargar el modelo con `ElectraMaskedLM.from_weights("kerasformers/electra_small_generator")`. No se proporcionan detalles sobre el dataset de entrenamiento, número de tokens ni técnicas de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Relleno de máscara (fill-mask): predice el token correcto para posiciones enmascaradas en una secuencia.
- Codificador de texto bidireccional: genera representaciones contextuales de tokens, útiles para tareas de clasificación, NER o QA tras fine-tuning.
- Multi-backend: funciona sin cambios en TensorFlow, PyTorch y JAX gracias a Keras 3.
- Tokenización WordPiece integrada mediante `ElectraTokenizer`.
- No incluye capacidades de tool calling, agentes, visión, audio ni generación de texto libre.

## Casos de uso

- Preprocesamiento de texto enmascarado: completar huecos en frases para generar datos de entrenamiento sintéticos o aumentar datasets.
- Extracción de características para clasificación de texto: usar las representaciones del encoder como entrada a un clasificador lineal, tras fine-tuning en un corpus específico.
- Fine-tuning para análisis de sentimiento: adaptar el modelo a un dominio concreto (reseñas, redes sociales) y usarlo como base para un clasificador binario o multiclase.
- Fine-tuning para reconocimiento de entidades nombradas (NER): aprovechar el contexto bidireccional para etiquetar entidades en documentos.
- Fine-tuning para respuesta a preguntas extractiva: entrenar sobre datasets como SQuAD para localizar respuestas en pasajes.
- Generación de tokens corruptos para entrenar un discriminador ELECTRA: en un pipeline de preentrenamiento, este generador puede producir secuencias con tokens reemplazados para que un discriminador aprenda a detectarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0.1 GB) sugiere un modelo pequeño, pero no se especifican requisitos oficiales.
- GPU recomendadas: no disponible. Por su tamaño, es probable que funcione en GPUs de consumo (p. ej., RTX 3060 o inferiores), pero no hay datos confirmados.
- Opciones de despliegue: al ser un modelo Keras 3, puede ejecutarse en cualquier entorno que soporte TensorFlow, PyTorch o JAX. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kerasformers/electra_small_generator` | ELECTRA generador | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `google/electra-small-generator` | ELECTRA generador | no disponible | no disponible | Apache 2.0 | Hugging Face |
| `kerasformers/electra_small_discriminator` | ELECTRA discriminador | no disponible | no disponible | Apache 2.0 | Hugging Face |

Los tres modelos comparten la misma arquitectura base y licencia. La diferencia principal es el propósito: el generador se usa para MLM, mientras que el discriminador está pensado para tareas downstream. La conversión de KerasFormers es funcionalmente equivalente al original de Google, pero con la ventaja de ser multi-backend.

## Limitaciones y advertencias

- Modelo pequeño: su capacidad de representación es limitada en comparación con modelos base o large, lo que puede afectar al rendimiento en tareas complejas.
- No apto para generación de texto libre: solo produce predicciones de tokens enmascarados, no texto coherente de forma autónoma.
- El checkpoint del generador no está escalado para preentrenar con el discriminador pequeño, según la documentación de Google; puede causar inestabilidad si se usa en ese contexto.
- No se especifican los idiomas soportados; el modelo original de Google está entrenado principalmente en inglés, pero no se confirma en esta ficha.
- Riesgo de sesgos derivados del corpus de entrenamiento original (no detallado en la información disponible).
- Licencia Apache 2.0 permite uso comercial, pero sin garantías implícitas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kerasformers/electra_small_generator
- Proyecto KerasFormers (GitHub): https://github.com/IMvision12/KerasFormers
- Documentación de ELECTRA en KerasFormers: https://imvision12.github.io/KerasFormers/electra/
- Paper original de ELECTRA: https://arxiv.org/abs/2003.10555
- Modelo base original: https://huggingface.co/google/electra-small-generator
