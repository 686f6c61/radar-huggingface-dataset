# dleemiller/crossingguard-nli-l

## Resumen

CrossingGuard-NLI-L es un modelo cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller (Lee Miller) y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un clasificador de texto de tres clases —entailment, neutral y contradiction— construido mediante *fine-tuning* sobre `dleemiller/finecat-nli-l`, un modelo de la familia ModernBERT con 395.834.371 parámetros. Su propósito no es generar texto, sino puntuar pares (premisa, hipótesis), lo que lo convierte en un componente de *routing*, *reranking* y control de contenido dentro de pipelines de IA.

El problema que resuelve es el de los *guardrails* personalizados. La moderación de contenido suele ser una tarea reactiva y dependiente del dominio, y los modelos preentrenados de propósito general no cubren condiciones de seguridad específicas de cada producto. CrossingGuard adopta un enfoque *zero-shot*: el operador formula la condición de seguridad como una hipótesis en lenguaje natural y el modelo evalúa si el prompt del usuario la implica o la contradice, sin necesidad de reentrenar. Los datos de entrenamiento proceden del conjunto sintético `dleemiller/CrossingGuard-NLI`, derivado a su vez de premisas de datasets conocidos de moderación como `allenai/wildguardmix` y `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`.

Es relevante ahora porque `sentence-transformers` y los *cross-encoders* se han consolidado como la alternativa práctica a los clasificadores de seguridad cerrados: son ligeros, desplegables en GPU de consumo, compatibles con Text Embeddings Inference y no requieren un LLM generativo en el bucle. El propio autor advierte en la model card de que este modelo ha sido superado por `finecat-nli-v2-l`, que obtiene mejores resultados en ambas tareas evaluadas, por lo que en nuevos desarrollos conviene partir de esa versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (reranker) sobre ModernBERT-large; clasificacion de 3 clases (entailment, neutral, contradiction) |
| Parametros totales | 395.834.371 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF, ONNX ni AWQ documentados) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | dleemiller/finecat-nli-l |
| Pipeline | text-classification |
| Tamano del repositorio | 1,6 GB |
| Datasets de entrenamiento | dleemiller/CrossingGuard-NLI, dleemiller/FineCat-NLI |
| Tamano del dataset | 384.838 ejemplos |
| Funcion de perdida | CrossEntropyLoss |
| Descargas / likes (a fecha de la informacion) | 153 / 0 |

## Arquitectura y entrenamiento

El modelo es un *cross-encoder*: recibe el par (premisa, hipótesis) concatenado y produce logits sobre tres etiquetas —entailment (0), neutral (1) y contradiction (2)—. La cabecera de clasificación se monta sobre `dleemiller/finecat-nli-l`, que a su vez deriva de la arquitectura ModernBERT en su variante *large*, un transformer encoder con atención optimizada para secuencias largas. El autor mantiene deliberadamente el clasificador de tres vías en lugar de colapsarlo a binario, para conservar flexibilidad cuando la etiqueta no neutra relevante depende de la tarea.

El entrenamiento se realiza sobre `dleemiller/CrossingGuard-NLI` (384.838 ejemplos), un corpus sintético en el que las hipótesis son afirmaciones específicas y dirigidas sobre premisas extraídas de datasets de guardrails (`allenai/wildguardmix`, `nvidia/Aegis-AI-Content-Safety-Dataset-2.0`). La pérdida principal es entropía cruzada. Para los modelos de tamaño inferior al *large*, el autor aplica destilación con pérdida MSE sobre los logits del profesor `dleemiller/crossingguard-nli-l`, combinada con la entropía cruzada según la expresión L = 0,5 · L_CE + 0,5 · L_MSE; el *fine-tuning* se limita a una sola época porque el sobreentrenamiento degrada el rendimiento en el conjunto FineCat. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación de decodificación (no aplica, al no ser un modelo generativo).

## Capacidades

- Clasificación NLI de tres clases sobre pares (premisa, hipótesis), con salida de logits y probabilidades vía softmax.
- Inferencia *zero-shot* sobre condiciones definidas por el usuario: la hipótesis se redacta en lenguaje natural y no requiere ejemplos etiquetados.
- Detección de implicación y contradicción para *guardrails*: permite comprobar si un prompt del usuario satisface o viola una política concreta.
- Moderación de contenido y clasificación de intención de prompt.
- *Routing* de prompts: determinar a qué categoría o flujo debe dirigirse una consulta antes de invocar un LLM.
- *Reranking* dentro de pipelines de recuperación, al ser compatible con la clase `CrossEncoder` de `sentence-transformers`.
- Integración con Text Embeddings Inference (TEI) y con endpoints compatibles de HuggingFace.
- Capacidades multilingües: no disponibles; el modelo está declarado únicamente para inglés.
- Tool calling, function calling, agentes, visión, audio y modo *thinking*: no disponibles (el modelo solo emite etiquetas de clasificación).
- Capacidad especial destacable: evaluación de condiciones de seguridad personalizadas sin reentrenamiento, mediante hipótesis redactadas ad hoc.

## Casos de uso

- Guardrails personalizados en aplicaciones conversacionales: se define cada política como una hipótesis ("el prompt solicita instrucciones para fabricar un explosivo") y se comprueba la implicación sobre el mensaje del usuario; si la etiqueta es entailment, se bloquea la petición. Frente a clasificadores cerrados, permite añadir condiciones nuevas sin reentrenar.
- Moderación de contenido en comunidades y foros: clasificación de mensajes contra un conjunto de hipótesis de toxicidad, acoso o contenido para adultos, con umbral de probabilidad ajustable por categoría.
- Enrutado de intenciones en asistentes virtuales: antes de llamar al LLM, el modelo decide si la consulta es de facturación, soporte técnico o consulta general, reduciendo el coste de invocar un modelo grande para clasificar.
- Detección de *prompt injection* y *jailbreak*: se formula como hipótesis si el texto intenta manipular las instrucciones del sistema; el par (prompt del usuario, hipótesis de ataque) se evalúa como entailment o contradiction.
- Reranking en pipelines RAG: dado un conjunto de documentos recuperados, se puntúa cada par (consulta, pasaje) y se reordena por relevancia antes de pasarlos al generador, mejorando la precisión del contexto final.
- Filtrado previo de datos en anotación y curación de datasets: descarte automático de pares inconsistentes mediante el etiquetado NLI, útil para limpiar corpus antes de entrenar.
- Conformidad y auditoría de políticas internas: comprobación de si una respuesta generada contradice una cláusula concreta de las directrices de la empresa, traduciendo cada cláusula a una hipótesis verificable.
- Evaluación automática de respuestas de LLM: uso como juez de fidelidad, comprobando si la respuesta implica o contradice el contexto proporcionado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el conjunto de desarrollo CrossingGuard NLI:

| Metrica | Valor | Verificado |
|---|---|---|
| F1 Macro | 0,9127 | No |
| F1 Micro | 0,9138 | No |
| F1 Weighted | 0,9139 | No |

Comparativa publicada en la model card (F1-Micro equivale a exactitud; medido con batch size 64 sobre una Nvidia Blackwell PRO 6000 Max-Q):

| Modelo | FineCat | CrossingGuard | Throughput (muestras/s) | Memoria GPU pico (MB) |
|---|---|---|---|---|
| dleemiller/finecat-nli-v2-l | 0,8359 | 0,9227 | 364,57 | 3801,47 |
| dleemiller/crossingguard-nli-l | 0,8094 | 0,9200 | 361,15 | 3023,65 |
| dleemiller/crossingguard-nli-m | 0,7779 | 0,9146 | 868,65 | 2170,71 |
| dleemiller/crossingguard-nli-s | 0,7582 | 0,9055 | 1410,64 | 1524,08 |
| dleemiller/ModernCE-large-nli | 0,7811 | 0,8779 | 362,20 | 3801,47 |
| dleemiller/finecat-nli-l | 0,8227 | 0,8325 | 364,57 | 3801,47 |
| MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli | 0,8233 | 0,8219 | 311,83 | 6156,87 |
| MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli | 0,7642 | 0,8032 | 873,51 | 3521,96 |
| cross-encoder/nli-deberta-v3-large | 0,7618 | 0,7211 | 306,48 | 6156,87 |
| tasksource/ModernBERT-large-nli | 0,7959 | 0,7019 | 357,91 | 3801,47 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 395,8 M de parametros, los pesos ocupan aproximadamente 0,79 GB en fp16/bf16 y 1,58 GB en fp32. La memoria pico medida por el autor en batch 64 es de 3023,65 MB.
- GPU recomendadas: Nvidia Blackwell PRO 6000 Max-Q (configuracion de medida del autor), A100, H100, L40S o cualquier GPU con al menos 4-8 GB de VRAM libre para lotes moderados.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en fp16 el modelo completo ocupa menos de 1 GB, por lo que el limite practico lo marca el tamano de lote y la longitud de secuencia.
- Opciones de despliegue: `sentence-transformers` con la clase `CrossEncoder`, Text Embeddings Inference (etiqueta `text-embeddings-inference` en el repositorio), HuggingFace Inference Endpoints (compatible con `endpoints_compatible`) y servir manualmente con PyTorch o Transformers. No hay soporte documentado de llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: 361,15 muestras/s con batch 64 en Nvidia Blackwell PRO 6000 Max-Q, frente a 868,65 del modelo `m` y 1410,64 del `s`, que son entre 2,4 y 3,9 veces mas rapidos a costa de 0,5-1,5 puntos de F1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1-Micro CrossingGuard | F1-Micro FineCat | Licencia | Formato |
|---|---|---|---|---|---|---|
| dleemiller/crossingguard-nli-l | 395,8 M | no disponible | 0,9200 | 0,8094 | Apache 2.0 | safetensors |
| dleemiller/finecat-nli-v2-l | no disponible | no disponible | 0,9227 | 0,8359 | Apache 2.0 | safetensors |
| dleemiller/crossingguard-nli-m | no disponible | no disponible | 0,9146 | 0,7779 | Apache 2.0 | safetensors |
| dleemiller/ModernCE-large-nli | no disponible | no disponible | 0,8779 | 0,7811 | no disponible | safetensors |
| MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli | no disponible | no disponible | 0,8219 | 0,8233 | no disponible | safetensors |
| tasksource/ModernBERT-large-nli | no disponible | no disponible | 0,7019 | 0,7959 | no disponible | safetensors |

Los parametros y la longitud de contexto de los modelos comparados no se detallan en la informacion proporcionada. El modelo destacado por el propio autor como sustituto es `dleemiller/finecat-nli-v2-l`, que mejora en ambas tareas (0,9227 y 0,8359) con un throughput practicamente identico (364,57 muestras/s), aunque con mayor consumo de memoria pico (3801,47 MB frente a 3023,65 MB).

## Limitaciones y advertencias

- Modelo superado: la model card indica explicitamente que `finecat-nli-v2-l` lo sustituye y recomienda usar ese en su lugar.
- Solo ingles: el modelo esta declarado unicamente para el idioma en; no hay garantias de comportamiento en castellano ni en otros idiomas.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y solo devuelve logits de tres clases. No debe emplearse como LLM.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea: las metricas declaradas (F1-Micro ~0,91 en CrossingGuard) son del autor y no estan verificadas por terceros, e implican una tasa de error cercana al 9 %.
- Sesgos: los datos de entrenamiento son sinteticos y derivan de `wildguardmix` y `Aegis-AI-Content-Safety-Dataset-2.0`, por lo que heredan los sesgos y la cobertura de esos corpus; las hipotesis generadas pueden no representar dominios, jergas o variantes culturales ausentes en las premisas originales.
- Sensibilidad al umbral: al tratarse de un clasificador de tres clases, el rendimiento real en produccion depende del umbral de probabilidad elegido por clase; no se publican curvas de calibracion ni de precision-recall.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias sobre el modelo ni sobre los datasets subyacentes, cuyas condiciones de uso conviene revisar por separado.
- Longitud de contexto no documentada: no se especifica en la informacion disponible el maximo de tokens de entrada, dato critico si se planea aplicar el modelo a prompts largos de moderacion.
- Ausencia de cuantizaciones y formatos alternativos: no hay GGUF, ONNX ni versiones cuantizadas publicadas, lo que limita el despliegue en entornos de CPU o en runtimes especificos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dleemiller/crossingguard-nli-l
- Modelo base: https://huggingface.co/dleemiller/finecat-nli-l
- Modelo sucesor recomendado: https://huggingface.co/dleemiller/finecat-nli-v2-l
- Dataset de entrenamiento: https://huggingface.co/datasets/dleemiller/CrossingGuard-NLI
- Dataset auxiliar: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset de moderacion de referencia: https://huggingface.co/datasets/allenai/wildguardmix
- Dataset de moderacion de referencia: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0
- Modelos comparados: https://huggingface.co/dleemiller/ModernCE-large-nli, https://huggingface.co/MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli, https://huggingface.co/cross-encoder/nli-deberta-v3-large, https://huggingface.co/tasksource/ModernBERT-large-nli
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo (papers, blogs o repos adicionales); no disponible.
