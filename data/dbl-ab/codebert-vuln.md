# dbl-ab/codebert-vuln

## Resumen

codebert-vuln es un modelo de clasificación de texto obtenido mediante fine-tuning de microsoft/codebert-base, un transformer encoder basado en la arquitectura RoBERTa especializado originalmente en código fuente. El autor identificado en Hugging Face es dbl-ab y el modelo se publicó el 27 de noviembre de 2026. Por el nombre y la tarea declarada (text-classification) parece orientado a la detección de vulnerabilidades en código, aunque la model card no documenta explícitamente el conjunto de datos ni el propósito exacto.

El modelo tiene 124.647.170 parámetros (aproximadamente 125 millones), lo que lo sitúa en la categoría de modelos encoder compactos, adecuados para inferencia de baja latencia y despliegue en hardware modesto. El repositorio ocupa 0,5 GB y los pesos están en formato safetensors, compatibles con la librería transformers y con text-embeddings-inference.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas especificados y con una model card generada automáticamente que deja la mayoría de secciones como "More information needed". Los resultados de evaluación disponibles son modestos y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, base de microsoft/codebert-base) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base CodeBERT admite 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de microsoft/codebert-base, un transformer encoder de tipo RoBERTa entrenado originalmente sobre pares código-comentario en múltiples lenguajes de programación. Sobre esa base se aplicó un fine-tuning de clasificación de texto con una cabeza de clasificación, según se deduce del pipeline declarado (text-classification) y de las métricas registradas (accuracy, precision, recall, F1, ROC AUC).

Los hiperparámetros documentados son: learning rate 2e-05, batch de entrenamiento de 8, batch de evaluación de 16, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 2 épocas y precisión mixta nativa (AMP). El entrenamiento se realizó con Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO (poco probable en un encoder de clasificación). La model card indica explícitamente "on an unknown dataset" y deja las secciones de descripción, usos previstos y datos de entrenamiento como "More information needed".

## Capacidades

- Clasificación de texto binaria o multiclase (la model card no especifica el número de etiquetas) orientada, por el nombre del modelo, a la detección de vulnerabilidades en código.
- Extracción de representaciones contextuales de código fuente y texto gracias a la base CodeBERT.
- Inferencia rápida en CPU o GPU modesta por el tamaño compacto del encoder.
- Compatibilidad con pipelines de transformers y con text-embeddings-inference.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Filtro previo en revisiones de código: clasificar fragmentos o funciones como potencialmente vulnerables antes de una revisión manual, usando el encoder para puntuar cada fragmento y priorizar la cola de revisión. Adecuado por su bajo coste de inferencia, aunque la precisión observada exige validación previa.
- Análisis estático asistido: integrar el modelo como señal adicional en pipelines de CI/CD que ya ejecutan analizadores estáticos, combinando su salida con reglas deterministas para reducir falsos negativos.
- Etiquetado de datasets de seguridad: usar el modelo para preetiquetar grandes volúmenes de código y acelerar la construcción de corpus de vulnerabilidades, con revisión humana posterior.
- Detección de patrones inseguros en repositorios: escanear commits o pull requests de forma masiva y marcar aquellos con mayor probabilidad de contener código inseguro.
- Clasificación de fragmentos en herramientas de formación: señalar ejemplos de código vulnerable en materiales didácticos de seguridad.
- Prototipado rápido de clasificadores de código: servir como punto de partida para fine-tuning adicional sobre dominios o lenguajes específicos, dado su tamaño reducido y su base CodeBERT.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluación (no se especifica el dataset):

| Metrica | Valor |
|---|---|
| Loss | 0,6536 |
| Accuracy | 0,594 |
| Precision | 0,7013 |
| Recall | 0,2308 |
| F1 | 0,3473 |
| ROC AUC | 0,5673 |

Evolución por época:

| Epoca | Step | Validation loss | Accuracy | Precision | Recall | F1 | ROC AUC |
|---|---|---|---|---|---|---|---|
| 1 | 250 | 0,6561 | 0,584 | 1,0 | 0,1111 | 0,2 | 0,5651 |
| 2 | 500 | 0,6536 | 0,594 | 0,7013 | 0,2308 | 0,3473 | 0,5673 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El model-index oficial no incluye resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (125 M de parámetros) más overhead de activaciones, en torno a 1-2 GB en función de la longitud de secuencia y el batch.
- VRAM estimada en FP16: aproximadamente 0,25 GB para los pesos, con overhead adicional de activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para batches pequeños.
- Opciones de despliegue: transformers (pipeline de text-classification), text-embeddings-inference (según los tags del repositorio), y potencialmente ONNX Runtime o TorchScript si se exporta; no se documenta compatibilidad con vLLM, llama.cpp u Ollama (no aplicables a un encoder de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dbl-ab/codebert-vuln | 124,6 M | no disponible | Clasificación de texto (posible detección de vulnerabilidades) | no disponible | Hugging Face, 0 descargas |
| microsoft/codebert-base | ~125 M | 512 tokens (modelo base) | Representaciones de código, base para fine-tuning | MIT (modelo base) | Hugging Face, ampliamente usado |
| microsoft/graphcodebert-base | ~125 M | 512 tokens (modelo base) | Representaciones de código con estructura de grafo | MIT (modelo base) | Hugging Face |

La comparación se limita a la familia CodeBERT porque no se dispone de datos de benchmarks de este fine-tuning frente a alternativas específicas de detección de vulnerabilidades. No se dispone de información sobre modelos comparables con métricas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- La model card está generada automáticamente y la mayoría de secciones están sin completar ("More information needed"), lo que impide conocer el dataset, las etiquetas y el propósito exacto.
- Los resultados de evaluación son modestos: accuracy de 0,594, recall de 0,2308 y ROC AUC de 0,5673, lo que indica una capacidad discriminativa cercana al azar y un riesgo alto de falsos negativos.
- El modelo tiene cero descargas y cero likes, sin evidencia de uso o validación por parte de la comunidad.
- No se declara licencia, por lo que el uso comercial es incierto y jurídicamente arriesgado sin consultar al autor.
- No se especifican los idiomas soportados ni los lenguajes de programación cubiertos.
- Riesgo de sesgos y de alucinación no evaluado; al ser un clasificador, el riesgo se traduce en falsos positivos y falsos negativos sistemáticos.
- No se documenta la longitud de contexto efectiva del fine-tuning; el modelo base CodeBERT admite 512 tokens, pero no está confirmado.
- No apto para producción sin una evaluación independiente sobre un dataset representativo del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbl-ab/codebert-vuln
- Modelo base: https://huggingface.co/microsoft/codebert-base
- Repositorio de CodeBERT (Microsoft): https://github.com/microsoft/CodeBERT
- Paper de CodeBERT: https://arxiv.org/abs/2002.08155
