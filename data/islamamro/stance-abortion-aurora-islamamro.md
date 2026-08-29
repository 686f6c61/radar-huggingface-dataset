# Islamamro/stance-abortion-aurora-islamamro

## Resumen

El modelo `Islamamro/stance-abortion-aurora-islamamro` es un clasificador de texto de tres clases (favor, en contra, ninguno) diseñado para detectar la postura hacia el aborto en tweets. Fue desarrollado por el usuario Islamamro como una demostración del pipeline de construcción, entrenamiento y publicación del Aurora Research Portal, y se basa en un fine-tuning de `distilbert-base-uncased` sobre el dataset `SetFit/tweet_eval_stance_abortion`. Con 66,9 millones de parámetros, es un modelo ligero y rápido, pero su propósito principal es validar el flujo de trabajo de Aurora, no servir como herramienta de producción.

La relevancia de este modelo radica en su carácter de ejemplo práctico de cómo se puede entrenar y publicar un modelo de clasificación de texto de extremo a extremo utilizando herramientas open source. Su precisión en datos de validación es de 0,61, lo que refleja que fue entrenado únicamente con un subconjunto de 1.400 ejemplos, insuficiente para un uso real. A pesar de ello, resulta útil para desarrolladores que quieran entender el proceso de fine-tuning con DistilBERT y la integración con Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (base, uncased) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (dataset en ingles, no confirmado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, una versión destilada de BERT con arquitectura transformer encoder. Se realizó un fine-tuning supervisado sobre el dataset `SetFit/tweet_eval_stance_abortion`, que contiene tweets etiquetados con tres posturas hacia el aborto: a favor, en contra o ninguna. El entrenamiento se llevó a cabo en una NVIDIA RTX 3090 mediante el Aurora Research Portal, pero solo con un subconjunto de 1.400 ejemplos, lo que explica la baja precisión obtenida (0,61 en datos held-out). No se dispone de información sobre hiperparámetros, número de épocas, tasa de aprendizaje ni técnicas de regularización adicionales.

## Capacidades

- Clasificación de texto en tres clases: postura a favor, en contra o neutral respecto al aborto en tweets.
- Inferencia rápida gracias al tamaño reducido del modelo (67M parámetros).
- Integración sencilla con la librería `transformers` mediante el pipeline de clasificación de texto.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.
- El modelo está entrenado únicamente para el dominio específico de tweets sobre aborto; no es multilingüe ni generalista.

## Casos de uso

- Análisis de opinión pública en redes sociales: el modelo puede clasificar automáticamente tweets sobre aborto para medir la distribución de posturas en una muestra, aunque su baja precisión limita su fiabilidad.
- Prototipado de pipelines de clasificación: sirve como ejemplo funcional para desarrolladores que quieran probar el flujo de carga, inferencia y despliegue con Hugging Face antes de entrenar un modelo más robusto.
- Demostración del Aurora Research Portal: permite verificar que el proceso de construcción, entrenamiento y publicación funciona correctamente, sirviendo como plantilla para otros proyectos.
- Educación en fine-tuning de transformers: útil para estudiantes que quieran experimentar con DistilBERT y datasets de stance detection sin necesidad de grandes recursos computacionales.
- Evaluación de datasets pequeños: puede utilizarse para comprobar la viabilidad de un dataset antes de invertir en un entrenamiento completo.
- Pruebas de integración en entornos de desarrollo: al ser un modelo ligero, puede cargarse en memoria sin problemas y usarse en pruebas unitarias de sistemas de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la precisión en datos held-out de 0,61, obtenida durante el entrenamiento con el subconjunto de 1.400 ejemplos. No hay comparaciones con otros modelos de stance detection ni con DistilBERT base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 (tamaño del repo), lo que permite ejecutarlo en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 2060, etc.) es suficiente. El entrenamiento se realizó en una RTX 3090, pero la inferencia es mucho menos exigente.
- Cabe en GPUs consumer de gama baja y también en CPU, aunque con mayor latencia.
- Opciones de despliegue: compatible con `transformers` (pipeline), `vLLM` (aunque no es óptimo para modelos tan pequeños), `llama.cpp` (si se convierte a GGUF, aunque no se proporciona), `Ollama` (requiere conversión previa) y `TGI` (no recomendado por su tamaño).
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo de 67M parámetros, la inferencia en GPU es del orden de milisegundos por muestra.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de stance detection. El modelo es un fine-tuning de DistilBERT sobre un dataset específico, y no se han publicado resultados comparativos con alternativas como `bert-base-uncased` fine-tuneado o modelos más grandes como RoBERTa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de demostración: entrenado con solo 1.400 ejemplos, no es apto para uso en producción.
- Precisión baja (0,61): puede cometer errores frecuentes en la clasificación de posturas.
- Sesgo potencial: el dataset `tweet_eval_stance_abortion` puede contener sesgos inherentes a los tweets y al tema del aborto, que el modelo podría amplificar.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede asignar etiquetas incorrectas con alta confianza.
- Limitaciones de idioma: aunque el dataset es en inglés, no se especifica explícitamente el soporte de idiomas; es probable que solo funcione bien con tweets en inglés.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el modelo no es fiable para aplicaciones reales.
- Sin garantías de mantenimiento: al ser un proyecto personal de demostración, no hay soporte ni actualizaciones previstas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Islamamro/stance-abortion-aurora-islamamro
- Dataset utilizado: https://huggingface.co/datasets/SetFit/tweet_eval_stance_abortion
- Perfil de GitHub del autor: https://github.com/islamamro
