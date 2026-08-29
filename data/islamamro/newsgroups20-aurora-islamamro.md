# Islamamro/newsgroups20-aurora-islamamro

## Resumen

El modelo `Islamamro/newsgroups20-aurora-islamamro` es un clasificador de texto de 20 clases, desarrollado por el usuario islamamro mediante el **Aurora Research Portal**. Se trata de un ajuste fino (*fine-tuning*) del modelo base `distilbert-base-uncased` sobre el dataset `SetFit/20_newsgroups`, que contiene artículos de noticias agrupados en 20 categorías temáticas clásicas (deportes, informática, religión, política, etc.). El modelo está pensado como una demostración del flujo de trabajo construir-entrenar-publicar de Aurora, no como un sistema listo para producción.

Con 66.968.852 parámetros y un tamaño de repositorio de 0,3 GB, es un modelo ligero y rápido, adecuado para tareas de clasificación de texto en entornos con recursos limitados. La precisión reportada en un conjunto de validación reservado es de 0,51, lo que refleja el uso de un subconjunto de entrenamiento muy reducido (1.400 ejemplos). A pesar de sus limitaciones, sirve como punto de partida para experimentar con clasificación de noticias y para entender el pipeline de Aurora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, versión destilada de BERT) |
| Parametros totales | 66.968.852 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base entrenado en inglés, pero no se especifica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `distilbert-base-uncased`, una versión destilada de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parámetros. DistilBERT utiliza una arquitectura transformer encoder con atención multi-cabeza y capas de normalización, pero con un número reducido de capas (6 en lugar de 12) y sin token type embeddings. El ajuste fino se realizó sobre el dataset `SetFit/20_newsgroups`, que contiene 20 categorías de noticias. Según la model card, el entrenamiento se llevó a cabo en un subconjunto de 1.400 ejemplos, lo que explica la baja precisión obtenida. No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste fino supervisado estándar. El entrenamiento se ejecutó en una NVIDIA RTX 3090, aunque no se detallan hiperparámetros ni número de épocas.

## Capacidades

- Clasificación de texto en 20 categorías temáticas (noticias de Usenet).
- Inferencia rápida y ligera gracias al tamaño reducido del modelo.
- Integración sencilla con la librería `transformers` mediante el pipeline de clasificación de texto.
- Soporte básico de clasificación multi-clase (20 etiquetas).
- No se han documentado capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe.

## Casos de uso

- **Demostración de pipelines de MLOps**: el modelo sirve como ejemplo de un flujo completo de construcción, entrenamiento y publicación mediante Aurora, útil para desarrolladores que quieran replicar el proceso.
- **Prototipado rápido de clasificación de noticias**: se puede usar para probar ideas de categorización de artículos en entornos de desarrollo, aunque con precisión limitada.
- **Educación y aprendizaje**: adecuado para estudiantes que quieran experimentar con fine-tuning de modelos transformer y entender el impacto del tamaño del dataset en el rendimiento.
- **Pruebas de integración**: al ser pequeño y rápido, puede emplearse en pruebas automatizadas de sistemas de clasificación sin necesidad de GPUs potentes.
- **Análisis exploratorio de datos**: permite etiquetar rápidamente un corpus de noticias para inspección manual, siempre que se acepte una tasa de error alta.
- **Base para fine-tuning posterior**: dado que es un checkpoint de DistilBERT, se puede reutilizar como punto de partida para entrenar con el dataset completo de 20_newsgroups y mejorar la precisión.

## Benchmarks y rendimiento

La model card reporta una precisión de 0,51 en un conjunto de validación reservado, pero no especifica la métrica exacta (accuracy, F1, etc.) ni el tamaño de dicho conjunto. No se han publicado resultados comparativos con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Precisión (held-out) | 0,51 |

No se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar, ya que el modelo está especializado en clasificación de noticias y no en tareas generales de razonamiento o código.

## Requisitos de hardware

- **VRAM estimada**: con 66,9 millones de parámetros, el modelo en FP32 ocupa aproximadamente 268 MB, y en FP16 unos 134 MB. Esto permite inferencia en GPUs con 2 GB de VRAM o incluso en CPU.
- **GPU recomendadas**: cualquier GPU consumer moderna (NVIDIA GTX 1060, RTX 2060, RTX 3090, etc.) es suficiente. También funciona en Apple Silicon y CPUs convencionales.
- **Despliegue**: compatible con `transformers` (PyTorch/TensorFlow), y puede exportarse a ONNX o cuantizarse para entornos de producción. No se menciona soporte explícito para vLLM, llama.cpp u Ollama, pero al ser un modelo transformer estándar, es probable que funcione con herramientas que soporten BERT.
- **Latencia**: al ser un modelo pequeño, la inferencia es de milisegundos en GPU y de decenas de milisegundos en CPU, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que es un fine-tune de DistilBERT sobre 20_newsgroups, se podría comparar con otros clasificadores de noticias basados en BERT, pero no hay datos disponibles en la fuente.

## Limitaciones y advertencias

- **Entrenamiento insuficiente**: el modelo fue entrenado con solo 1.400 ejemplos, lo que produce una precisión baja (0,51) y un alto riesgo de sobreajuste o generalización pobre.
- **No apto para producción**: la propia model card advierte que es una prueba de concepto, no un modelo listo para uso real.
- **Idioma**: el modelo base está en inglés, y no se especifica si el fine-tuning incluye otros idiomas; probablemente solo funcione bien con texto en inglés.
- **Sesgos**: al derivar de DistilBERT, puede heredar sesgos presentes en los datos de preentrenamiento, aunque no se han documentado específicamente.
- **Alucinación**: al ser un clasificador, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero la clasificación errónea es frecuente.
- **Licencia**: Apache 2.0 permite uso comercial, pero el rendimiento limitado hace que no sea recomendable para aplicaciones críticas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Islamamro/newsgroups20-aurora-islamamro)
- [Dataset SetFit/20_newsgroups](https://huggingface.co/datasets/SetFit/20_newsgroups)
- [Perfil de GitHub del autor](https://github.com/islamamro)
