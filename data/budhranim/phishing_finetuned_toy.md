# BudhraniM/phishing_finetuned_toy

## Resumen

BudhraniM/phishing_finetuned_toy es un modelo de clasificación de texto publicado en Hugging Face por el usuario BudhraniM. Se trata de un ajuste fino (fine-tuning) de DistilBERT, la versión destilada de BERT, orientado a la detección de phishing. El nombre del repositorio y el pipeline declarado (`text-classification`) apuntan a una tarea de clasificación binaria o multiclase sobre textos, presumiblemente correos, mensajes o URLs sospechosas, aunque la model card no lo confirma explícitamente.

El modelo cuenta con 66.958.086 parámetros y un tamaño de repositorio de 0,3 GB, cifras coherentes con la arquitectura DistilBERT-base (6 capas, 66 millones de parámetros). Los pesos están en formato safetensors y la librería asociada es `transformers`. El sufijo "toy" en el identificador sugiere que se trata de un experimento de demostración o de un ajuste con datos reducidos, más que de un modelo listo para producción.

La relevancia de esta ficha es limitada pero útil como referencia: ilustra el caso típico de un modelo derivado de un transformer encoder pequeño, con licencia e idiomas no declarados y sin resultados de evaluación publicados. Cualquier evaluación rigurosa debe hacerse por cuenta del usuario antes de considerarlo para un despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT, 6 capas) |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT-base admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de 6 capas obtenido mediante destilación de conocimiento a partir de BERT-base, tal como describe el paper referenciado en las etiquetas del repositorio (arXiv:1910.09700). El modelo base emplea atención bidireccional completa y está diseñado para tareas de comprensión del lenguaje y clasificación, no para generación autoregresiva. Con 66,9 millones de parámetros, es aproximadamente un 40 % más pequeño que BERT-base y conserva la mayor parte de su rendimiento en tareas de clasificación.

No se dispone de información sobre el conjunto de datos de ajuste fino, el número de tokens de entrenamiento, la composición del dataset, la existencia de validación, el régimen de precisión (fp32, fp16) ni hiperparámetros como la tasa de aprendizaje o el número de épocas. La model card es la plantilla automática de Hugging Face y no aporta ningún detalle. Tampoco consta que se hayan aplicado técnicas de RLHF, DPO ni ninguna innovación de decodificación, algo esperable en un encoder de clasificación.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a asignar una etiqueta a una secuencia de entrada.
- Detección de phishing: por el nombre del repositorio, el ajuste fino parece dirigido a distinguir contenido malicioso (phishing) de contenido legítimo, probablemente en correos o mensajes.
- Extracción de embeddings: al ser un encoder, puede emplearse para generar representaciones vectoriales de texto, aunque no está declarado como modelo de embeddings.
- Compatibilidad con Text Embeddings Inference y endpoints: las etiquetas indican soporte para infraestructura de inferencia de Hugging Face.
- No dispone de tool calling, razonamiento multi-paso, capacidades de agente, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.

## Casos de uso

- Filtrado de correo entrante: clasificar mensajes como phishing o legítimos antes de que lleguen a la bandeja de entrada, usando el modelo como clasificador de primera línea con umbral de confianza ajustable.
- Análisis de URLs y cuerpos de texto sospechosos: extraer características textuales de enlaces y mensajes y pasarlas al modelo para una señal adicional en un sistema antiphishing.
- Enriquecimiento de alertas SOC: incorporar una puntuación de phishing a las alertas de seguridad para priorizar la revisión humana, dado el bajo coste computacional del modelo.
- Prototipado rápido de clasificadores: servir como punto de partida para experimentar con fine-tuning adicional sobre datos propios, gracias a su tamaño reducido y formato safetensors.
- Moderación de contenido en formularios y comentarios: detectar patrones de ingeniería social en textos enviados por usuarios.
- Docencia y experimentación: por su carácter "toy" y su tamaño, es adecuado para demostrar pipelines de clasificación con `transformers` y `text-embeddings-inference`, no para producción sin validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB solo para pesos (66,9 M parámetros × 4 bytes), más overhead de activaciones y runtime.
- VRAM estimada en fp16: aproximadamente 135 MB para pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1650, RTX 3060, RTX 4090, e incluso en CPU para cargas moderadas.
- GPU recomendadas: no requiere GPU dedicada; una T4 o superior ofrece latencia muy baja para lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline de clasificación), Text Embeddings Inference (declarado en las etiquetas), endpoints de Hugging Face; llama.cpp y Ollama no aplican de forma estándar a este encoder.
- Latencia y throughput: no disponibles; por el tamaño del modelo, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BudhraniM/phishing_finetuned_toy | 66,9 M | no disponible | Clasificación de texto (phishing) | no disponible | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base generalista | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base generalista | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 tokens | Modelo base generalista | MIT | Hugging Face |

La comparación con los modelos base es estructural: el modelo aquí descrito es un ajuste fino de DistilBERT, por lo que hereda su tamaño y arquitectura, pero no se dispone de datos que permitan comparar su rendimiento en la tarea de phishing frente a alternativas ajustadas.

## Limitaciones y advertencias

- La model card es la plantilla automática: no hay información sobre datos, evaluación, sesgos ni uso previsto.
- El sufijo "toy" sugiere un ajuste fino experimental o con datos reducidos; no hay evidencia de calidad en producción.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, sin métricas publicadas que los cuantifiquen.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idiomas no declarados: no se puede garantizar funcionamiento fuera del idioma de los datos de ajuste.
- Longitud de contexto no confirmada; si sigue el estándar de DistilBERT, se limita a 512 tokens.
- Sin resultados de benchmarks ni validación externa; cualquier despliegue exige una evaluación propia sobre datos representativos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudhraniM/phishing_finetuned_toy
- Paper de DistilBERT (referenciado en las etiquetas): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
