# BapunSuna/gpt-news-model

## Resumen

gpt-news-model es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de distilgpt2, la variante destilada del modelo GPT-2 de OpenAI. Lo publica el usuario BapunSuna en Hugging Face bajo licencia Apache 2.0. El modelo parte de una arquitectura transformer decoder-only de tipo GPT-2 y se ha reentrenado con una cabeza de clasificación para la tarea de text-classification, presumiblemente orientada a la categorización de noticias, aunque la model card no documenta el conjunto de datos utilizado ni las etiquetas de salida.

El interés práctico del modelo es limitado pero concreto: con 81,9 millones de parámetros y un repositorio de 0,3 GB, es un clasificador de texto muy ligero que puede ejecutarse en CPU o en GPUs de consumo con requisitos mínimos. El autor declara métricas de evaluación razonables (accuracy 0,898, F1 weighted 0,8982) sobre un conjunto de validación no especificado, lo que sugiere que el fine-tuning ha convergido correctamente, pero la ausencia de documentación sobre los datos de entrenamiento impide validar la generalización del modelo fuera de su dominio original.

La relevancia de esta ficha es principalmente metodológica: sirve como ejemplo de fine-tuning de un modelo base pequeño para clasificación y como recordatorio de la importancia de documentar datasets, etiquetas y procedencia de los datos. No se trata de un modelo de propósito general ni de un LLM conversacional, sino de un clasificador especializado y de alcance desconocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 destilado, distilgpt2) con cabeza de clasificación |
| Parametros totales | 81.915.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (distilgpt2 soporta hasta 1024 tokens, aunque no se documenta en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre distilgpt2, una versión destilada de GPT-2 que reduce el número de capas respecto al original manteniendo el vocabulario y la arquitectura decoder-only. Sobre esa base, el autor ha añadido una cabeza de clasificación y ha realizado un fine-tuning supervisado con el `Trainer` de Hugging Face. La model card indica que el modelo se generó automáticamente con la plantilla del Trainer, lo que explica la falta de descripción del dataset ("unknown dataset") y de los usos previstos.

Los hiperparámetros documentados son: learning rate 2e-05, batch size de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 3 épocas. El entrenamiento se ejecutó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La pérdida de entrenamiento baja de 0,6035 a 0,3724 entre la primera y la tercera época, mientras que la pérdida de validación desciende de 0,4915 a 0,3754, sin señales claras de sobreajuste en las métricas reportadas. No se documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo técnicas de alineación como RLHF o DPO, algo esperable en un fine-tuning de clasificación.

## Capacidades

- Clasificación de texto: el modelo está diseñado para asignar una etiqueta a un texto de entrada, presumiblemente en el ámbito de noticias, aunque las clases concretas no se documentan.
- Generación de texto: al derivar de distilgpt2, conserva la cabeza de lenguaje original en los pesos base, pero el fine-tuning con cabeza de clasificación no garantiza un uso generativo fiable.
- Razonamiento y matemáticas: no disponible; no se ha entrenado ni evaluado para estas tareas.
- Código: no disponible.
- Tool calling / function calling: no soportado de forma nativa.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas; distilgpt2 está entrenado principalmente en inglés, pero la model card no confirma el alcance idiomático del fine-tuning.
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Clasificación de titulares de noticias: el modelo puede etiquetar titulares o párrafos cortos en categorías temáticas si se conoce el esquema de etiquetas del entrenamiento; su tamaño reducido permite procesar lotes grandes en CPU con latencia baja.
- Filtrado de contenido en pipelines de datos: dado su bajo coste computacional, puede usarse como primer filtro para descartar o etiquetar documentos antes de pasarlos a modelos mayores.
- Moderación de comentarios en foros o medios: si el dataset de entrenamiento incluía etiquetas de toxicidad o temática, el modelo podría integrarse en un sistema de moderación por etapas.
- Prototipado rápido de clasificadores: sirve como línea base para comparar con modelos más grandes en tareas de clasificación de texto corto antes de invertir en fine-tuning de modelos mayores.
- Enrutamiento de consultas en atención al cliente: un clasificador ligero puede dirigir tickets o mensajes a la cola adecuada según su temática, reduciendo la carga de modelos generativos.
- Análisis de sentimiento o temática en redes sociales: con el esquema de etiquetas adecuado, puede procesar grandes volúmenes de textos cortos en entornos con recursos limitados.
- Experimentación académica: útil como ejemplo reproducible de fine-tuning de distilgpt2 para clasificación, aunque la falta de documentación del dataset limita su valor como referencia.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card, obtenidos sobre un conjunto de evaluación no especificado. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Valor declarado |
|---|---|
| Loss (evaluación) | 0,2710 |
| Accuracy | 0,898 |
| F1 weighted | 0,8982 |
| F1 macro | 0,8984 |

Evolución durante el entrenamiento:

| Epoca | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|
| 1.0 | 150 | 0,4915 | 0,83 | 0,8288 | 0,8282 |
| 2.0 | 300 | 0,4087 | 0,865 | 0,8642 | 0,8636 |
| 3.0 | 450 | 0,3754 | 0,8775 | 0,8769 | 0,8763 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas métricas de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (81,9 M de parámetros, unos 328 MB de pesos) y alrededor de 170 MB en fp16; la huella real depende del framework y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque el modelo es demasiado pequeño para aprovechar GPUs de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- CPU: es viable para inferencia en CPU con latencias de milisegundos por muestra en lotes pequeños.
- Opciones de despliegue: transformers con PyTorch, pipelines de Hugging Face, ONNX Runtime, TorchScript; no se han publicado pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM y TGI no están optimizados para modelos de clasificación de este tamaño.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, se espera un throughput alto en CPU y muy alto en GPU para lotes de cientos de ejemplos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-news-model | 81,9 M | no disponible | Clasificación de texto | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66 M | 512 tokens | Clasificación y NLU general | Apache 2.0 | Hugging Face |
| distilgpt2 (base) | 82 M | 1024 tokens | Generación de texto | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 tokens | Clasificación y NLU general | MIT | Hugging Face |

La comparación directa con distilbert-base-uncased o roberta-base es la más relevante para tareas de clasificación: ambos son encoder-only, están ampliamente documentados y cuentan con versiones fine-tuned para múltiples tareas. gpt-news-model parte de un decoder-only, lo que es menos habitual para clasificación y puede ofrecer un rendimiento inferior en tareas de comprensión si el dataset de fine-tuning es pequeño. No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset", por lo que no se puede evaluar la calidad, el sesgo ni la cobertura de los datos.
- Esquema de etiquetas no documentado: se desconoce qué clases predice el modelo, lo que impide usarlo directamente sin inspeccionar la configuración de la cabeza de clasificación.
- Riesgo de alucinación y falsos positivos: como clasificador, puede asignar etiquetas incorrectas con alta confianza, especialmente en textos fuera de la distribución de entrenamiento.
- Sesgos: al derivar de distilgpt2, hereda los sesgos del corpus web con el que se entrenó GPT-2; el fine-tuning no los elimina y puede amplificarlos si el dataset es reducido o poco diverso.
- Limitaciones idiomáticas: no se documentan los idiomas soportados; distilgpt2 está orientado al inglés y el fine-tuning probablemente también.
- Longitud de contexto: no documentada; distilgpt2 soporta hasta 1024 tokens, pero textos más largos requerirán truncamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento no impongan restricciones adicionales, algo imposible sin documentación.
- Reproducibilidad: la model card se generó automáticamente y no incluye información sobre el dataset ni el proceso de anotación, lo que dificulta replicar o auditar el modelo.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/BapunSuna/gpt-news-model
- Modelo base distilgpt2: https://huggingface.co/distilgpt2
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Wikipedia (resultado de búsqueda no relacionado con el modelo): https://en.wikipedia.org/wiki/Main_Page
