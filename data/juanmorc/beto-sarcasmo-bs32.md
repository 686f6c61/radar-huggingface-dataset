# juanmorc/beto-sarcasmo-bs32

## Resumen

beto-sarcasmo-bs32 es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de dccuchile/bert-base-spanish-wwm-cased, el checkpoint BERT en castellano entrenado con enmascarado de palabras completas por el grupo DCC de la Universidad de Chile. El autor del ajuste es el usuario de Hugging Face juanmorc, y el identificador del modelo sugiere una tarea de detección de sarcasmo ("sarcasmo") con un tamano de lote de entrenamiento de 32 ("bs32").

Se trata de un modelo encoder-only de tipo BERT con 109.852.418 parámetros (aproximadamente 110 millones), pesos en formato safetensors y un repositorio de 0,4 GB. La model card fue generada automáticamente por la librería Trainer de Transformers y no documenta el conjunto de datos de entrenamiento, los idiomas ni la licencia, por lo que la mayor parte de la información contextual sobre el modelo no está disponible.

Su relevancia es acotada: es un ajuste de un modelo base conocido para una tarea concreta de clasificación binaria o multiclase sobre texto en castellano, con métricas de evaluación declaradas por el autor (accuracy 0,9251 y F1 macro 0,9214 en el conjunto de evaluación). No es un modelo generativo ni compite con los LLM actuales; su interés radica en el bajo coste de despliegue y en su posible uso como clasificador auxiliar dentro de pipelines de moderación o análisis de opinión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only, transformer) |
| Parametros totales | 109.852.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT acepta hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base está entrenado en castellano) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de dccuchile/bert-base-spanish-wwm-cased, un BERT base con vocabulario en castellano y enmascarado de palabras completas (whole word masking). La arquitectura es un transformer encoder-only con cabeza de clasificación de secuencias, adecuada para tareas de clasificación de texto y no para generación. No se documenta ninguna innovación arquitectónica propia: el ajuste conserva la topología del modelo base.

El entrenamiento se realizó con la librería Transformers (versión 5.22.2), PyTorch 2.14.1+cu130, Datasets 5.2.0 y Tokenizers 0.23.3, usando el optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, learning rate 2e-5, scheduler lineal con warmup del 10 % de los pasos, 8 épocas, batch de entrenamiento de 32, batch de evaluación de 64, semilla 42 y precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no está especificado en la model card ("unknown dataset"), por lo que no se puede determinar el volumen de tokens, la composición del corpus ni si hubo etapas de RLHF o DPO (en un encoder de clasificación esto último no aplicaría). El número de pasos registrados (3824 al final del entrenamiento) sugiere un conjunto de entrenamiento de unas 15.000 muestras aproximadamente, aunque este cálculo es una inferencia a partir de los pasos y el batch, no un dato declarado.

## Capacidades

- Clasificación de texto: el modelo emite una etiqueta por secuencia de entrada; por el nombre, está orientado a la detección de sarcasmo en castellano.
- Comprensión de texto en castellano: hereda del modelo base BETO el vocabulario y el preentrenamiento en español, aunque la model card no declara idiomas soportados.
- No soporta generación de texto, razonamiento libre, código, matemáticas ni visión: es un encoder de clasificación.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidades multilingües: no declaradas; el modelo base es monolingüe en castellano.
- No dispone de modo de pensamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Moderación de comentarios en foros y redes: el modelo puede etiquetar comentarios susceptibles de contener sarcasmo o ironía, lo que permite priorizar revisiones humanas o activar respuestas específicas en comunidades en castellano.
- Análisis de opinión en redes sociales: clasificar publicaciones de usuarios para separar críticas irónicas de críticas literales, mejorando la calidad de los estudios de sentimiento.
- Enrutado en atención al cliente: detectar mensajes irónicos o sarcásticos en tickets de soporte para derivarlos a agentes humanos con contexto adicional, reduciendo respuestas automáticas mal calibradas.
- Investigación en procesamiento del lenguaje natural: servir como línea base reproducible para experimentos de detección de sarcasmo en español, dado su bajo coste computacional y su formato estándar de Transformers.
- Filtrado previo en pipelines de anotación: preetiquetar grandes volúmenes de texto para que los anotadores humanos solo revisen los casos dudosos, acelerando la creación de corpus.
- Clasificación por lotes en entornos con recursos limitados: al tener unos 110 millones de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para procesar lotes de textos sin infraestructura dedicada.
- Integración como servicio de embeddings o clasificación: el tag text-embeddings-inference y endpoints_compatible indica compatibilidad con infraestructura de despliegue de Hugging Face, lo que facilita su exposición como endpoint HTTP.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación (datos del autor, sin comparación con otros modelos):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,6084 |
| Accuracy | 0,9251 |
| F1 macro | 0,9214 |
| F1 weighted | 0,9251 |

Evolución durante el entrenamiento (extracto):

| Epoca | Validation loss | Accuracy | F1 macro | F1 weighted |
|---|---|---|---|---|
| 1 | 0,2593 | 0,8984 | 0,8921 | 0,8977 |
| 2 | 0,2267 | 0,9173 | 0,9133 | 0,9173 |
| 4 | 0,4588 | 0,9170 | 0,9132 | 0,9171 |
| 8 | 0,6084 | 0,9251 | 0,9214 | 0,9251 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El model-index del modelo contiene una entrada sin resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,44 GB de pesos; en fp16, unos 0,22 GB. Con overhead de activaciones y batch pequeno, cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también funciona en CPU para lotes moderados.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: Transformers con pipeline de text-classification, Text Embeddings Inference (tag text-embeddings-inference), endpoints compatibles de Hugging Face; no se documenta soporte específico para vLLM, llama.cpp u Ollama (estos últimos orientados a modelos generativos).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juanmorc/beto-sarcasmo-bs32 | 109,85 M | no disponible | Clasificacion (sarcasmo) | no disponible | Hugging Face |
| dccuchile/bert-base-spanish-wwm-cased | ~110 M | 512 tokens (BERT base) | Modelo base (MLM) | no disponible en esta ficha | Hugging Face |
| BETO ajustado para análisis de sentimiento (variantes de la comunidad) | ~110 M | 512 tokens | Clasificacion | variable segun autor | Hugging Face |

La comparación con alternativas concretas no está disponible en la información proporcionada; los datos del modelo base se incluyen como referencia arquitectónica, no como comparación de rendimiento.

## Limitaciones y advertencias

- La model card no documenta el conjunto de datos de entrenamiento, por lo que se desconoce la distribución, el dominio y el posible sesgo del corpus.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas en dominios alejados de los datos de entrenamiento.
- El modelo base es monolingüe en castellano; no se declaran idiomas soportados y el rendimiento en otras lenguas es previsiblemente pobre.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; es imprescindible contactar con el autor o consultar el repositorio antes de un despliegue en producción.
- La loss de validación aumenta a partir de la época 2 (de 0,2267 a 0,6084 en la época 8) mientras la accuracy mejora ligeramente, lo que sugiere sobreajuste; conviene validar con datos propios antes de confiar en las métricas declaradas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- No se documentan limitaciones de contexto específicas más allá de las del modelo base BERT (típicamente 512 tokens), dato no confirmado en la model card.
- El nombre del modelo sugiere la tarea de sarcasmo, pero la model card no especifica las etiquetas de salida ni el número de clases; es necesario inspeccionar la configuración del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juanmorc/beto-sarcasmo-bs32
- Modelo base: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
