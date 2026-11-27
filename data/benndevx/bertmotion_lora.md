# benndevx/BERTmotion_LoRA

## Resumen

BERTmotion_LoRA es un modelo de clasificación de texto (text-classification) obtenido mediante ajuste fino supervisado del modelo base `unsloth/ModernBERT-large` sobre el conjunto de datos `dair-ai/emotion`. Lo publica el usuario benndevx en Hugging Face y su propósito es la clasificación multiclase de emociones en seis categorías: tristeza, alegría, amor, enfado, miedo y sorpresa. El repositorio tiene 395.837.446 parámetros en formato safetensors, aunque el modelo se entrenó con LoRA según indica la model card y las etiquetas del repositorio.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo habitual de ajuste fino eficiente con Unsloth sobre arquitecturas ModernBERT, que es una familia de encoders transformer con atención lineal y contexto extendido. Por otro, sirve como ejemplo de un modelo pequeño y especializado que se puede desplegar en hardware modesto para tareas de análisis de sentimiento y emociones en producción. Conviene señalar que el repositorio tiene cero descargas y cero likes en el momento de la consulta, y que la model card no documenta métricas de evaluación, benchmarks ni idiomas soportados más allá del dataset de entrenamiento en inglés.

La información disponible es limitada: no hay resultados de benchmarks publicados, no se especifica la longitud de contexto efectiva del ajuste fino (aunque ModernBERT soporta hasta 8.192 tokens en su preentrenamiento), y no se detallan los idiomas. Esta ficha refleja únicamente lo que consta en la información proporcionada y marca como "no disponible" todo lo que no aparece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBertForSequenceClassification (transformer encoder con atención lineal, base ModernBERT-large) |
| Parametros totales | 395.837.446 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base ModernBERT soporta hasta 8.192 tokens, pero el ajuste fino no lo documenta) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el dataset dair-ai/emotion es en inglés, pero la model card no declara idiomas) |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificación multiclase de emociones (6 clases) |
| Clases | 0 tristeza, 1 alegría, 2 amor, 3 enfado, 4 miedo, 5 sorpresa |
| Modelo base | unsloth/ModernBERT-large |
| Dataset de entrenamiento | dair-ai/emotion (subconjunto unsplit, primeras 30.000 muestras) |
| Librería | transformers |
| Tamaño del repo | 1,6 GB |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/ModernBERT-large`, un encoder transformer de la familia ModernBERT que incorpora atención lineal, rotary positional embeddings y un contexto extendido en su preentrenamiento. Sobre esa base se aplica una cabeza de clasificación de secuencias (`ModernBertForSequenceClassification`) con seis salidas, una por emoción. El ajuste fino se realizó con LoRA mediante la librería Unsloth, que según la model card permite un entrenamiento aproximadamente 2 veces más rápido y con un uso de memoria reducido. El repositorio publica los pesos resultantes en safetensors con 395,8 millones de parámetros, lo que corresponde al tamaño del encoder large más la cabeza de clasificación.

El entrenamiento se llevó a cabo sobre las primeras 30.000 muestras del subconjunto `unsplit` de `dair-ai/emotion`, divididas en 24.000 para entrenamiento (80 %) y 6.000 para validación (20 %). Para compensar el desbalance de clases se aplicaron pesos calculados con scikit-learn: tristeza 0,5687, alegría 0,4972, amor 1,9743, enfado 1,2500, miedo 1,4327 y sorpresa 4,4297. Los hiperparámetros documentados son optimizador `adamw_8bit`, learning rate 5e-5, weight decay 0,001, scheduler lineal con 5 pasos de warmup, batch size 32 sin acumulación de gradientes, 2 épocas, 1.500 pasos totales y precisión mixta bf16/fp16 autodetectada. El entrenamiento se ejecutó en una GPU Tesla T4 en una instancia de Colab. No se documenta el uso de RLHF, DPO ni decodificación especulativa, algo esperable en un modelo encoder de clasificación.

## Capacidades

- Clasificación multiclase de emociones en seis categorías: tristeza, alegría, amor, enfado, miedo y sorpresa.
- Salida de probabilidad por clase mediante la pipeline `sentiment-analysis` o `text-classification` de transformers.
- Procesamiento de texto en inglés según el dataset de entrenamiento (idiomas oficiales no declarados).
- Inferencia rápida en CPU y GPU por tratarse de un encoder de 395,8 millones de parámetros.
- Compatibilidad con `text-embeddings-inference` y `endpoints_compatible` según las etiquetas del repositorio, lo que facilita el despliegue en Hugging Face Inference Endpoints.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito; es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación de comunidades y redes sociales: clasificar mensajes de usuarios en las seis emociones para detectar enfado o tristeza y priorizar revisiones humanas o respuestas automáticas empáticas. El tamaño del modelo permite ejecutarlo en CPU con latencia baja.
- Análisis de opiniones de clientes: procesar reseñas o tickets de soporte en inglés y agregar la distribución emocional por producto o periodo, usando los pesos de clase para interpretar correctamente las categorías minoritarias como sorpresa o amor.
- Enrutamiento de tickets de atención al cliente: asignar prioridad o cola según la emoción detectada (por ejemplo, enfado a soporte urgente) antes de que un agente humano intervenga.
- Monitorización de salud mental en foros: detectar señales de tristeza o miedo en textos públicos para activar protocolos de revisión, siempre con supervisión humana y avisos éticos claros.
- Investigación en psicolingüística: etiquetar corpus en inglés con emociones básicas para estudios de análisis de discurso, aprovechando que el modelo se entrenó con pesos balanceados para reducir el sesgo hacia clases mayoritarias.
- Preprocesado en pipelines de NLP más grandes: usar la salida de emociones como característica adicional para sistemas de recomendación, resumen o generación condicionada por tono emocional.
- Despliegue en endpoints serverless: gracias a las etiquetas `endpoints_compatible` y `text-embeddings-inference`, se puede servir como microservicio de clasificación en Hugging Face Inference Endpoints con coste reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de accuracy, F1, precision ni recall sobre el conjunto de validación, ni comparaciones con otros modelos de clasificación de emociones. Tampoco se documentan latencias ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,8 GB para los pesos (395,8 millones de parámetros a 2 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB en GPU.
- VRAM estimada en fp32: aproximadamente 1,6 GB solo para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter como A100 o H100 (donde el modelo ocupa una fracción mínima de memoria).
- Funciona en CPU con latencias aceptables para clasificación de frases cortas, dado el tamaño moderado del encoder.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), Text Embeddings Inference (etiqueta `text-embeddings-inference`), y servidores compatibles con modelos de clasificación. No se publican pesos GGUF, por lo que llama.cpp u Ollama no son opciones directas sin conversión manual.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| benndevx/BERTmotion_LoRA | 395,8 M | no disponible | Clasificación de emociones (6 clases) | LGPL-3.0 | Hugging Face, 0 descargas |
| unsloth/ModernBERT-large (base) | ~395 M (large) | hasta 8.192 tokens en preentrenamiento | Encoder general, ajustable a clasificación | según el modelo base (no detallada aquí) | Hugging Face |
| DistilBERT-base fine-tuned en dair-ai/emotion (referencia habitual) | ~66 M | 512 tokens | Clasificación de emociones (6 clases) | Apache-2.0 en el base | Amplia disponibilidad en Hugging Face |
| RoBERTa-base fine-tuned en dair-ai/emotion (referencia habitual) | ~125 M | 512 tokens | Clasificación de emociones (6 clases) | MIT en el base | Amplia disponibilidad en Hugging Face |

La comparativa se limita a modelos de la misma categoría (encoders para clasificación de emociones). No se dispone de métricas de rendimiento de BERTmotion_LoRA que permitan una comparación cuantitativa con las alternativas; la comparación es, por tanto, estructural (tamaño, contexto y licencia). El modelo base ModernBERT-large ofrece un contexto mucho mayor que DistilBERT o RoBERTa, lo que puede ser ventajoso en textos largos, pero el ajuste fino aquí documentado no especifica qué longitud de contexto se utilizó.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación: se desconoce la accuracy, el F1 por clase y el comportamiento en el conjunto de validación, lo que impide garantizar calidad en producción.
- Riesgo de sesgo por el dataset: `dair-ai/emotion` está en inglés y tiene un desbalance marcado (sorpresa y amor son clases minoritarias), mitigado con pesos de clase pero no eliminado. El modelo puede fallar en textos con sarcasmo, ironía o emociones mixtas.
- Idiomas no declarados: aunque el dataset es en inglés, la model card no restringe oficialmente el uso a ese idioma; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en entradas fuera de distribución (textos muy largos, dominios especializados, jerga).
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca que incorpore el modelo; conviene revisar con asesoría legal antes de integrarlo en productos propietarios.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que permitan validar su robustez.
- No hay versiones cuantizadas publicadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin GPU o con requisitos estrictos de memoria.
- La longitud de contexto efectiva del ajuste fino no está documentada; ModernBERT soporta hasta 8.192 tokens, pero no se confirma que el ajuste fino haya preservado esa ventana.
- Fecha de creación del repositorio: 27 de noviembre de 2026, según los metadatos de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/benndevx/BERTmotion_LoRA
- Modelo base: https://huggingface.co/unsloth/ModernBERT-large
- Dataset: https://huggingface.co/datasets/dair-ai/emotion
- Licencia LGPL-3.0 (referencia indicada en la model card): https://github.com/unslothai/notebooks?tab=LGPL-3.0-1-ov-file#readme
- Unsloth (librería de ajuste fino): https://github.com/unslothai/unsloth
- Documentación de ModernBERT: no disponible en la información proporcionada
