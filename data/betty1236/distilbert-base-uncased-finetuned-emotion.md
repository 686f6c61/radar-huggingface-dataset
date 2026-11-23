# Betty1236/distilbert-base-uncased-finetuned-emotion

## Resumen

`Betty1236/distilbert-base-uncased-finetuned-emotion` es un clasificador de texto en inglés para reconocimiento de emociones, obtenido mediante ajuste fino completo de `distilbert-base-uncased` sobre el dataset `emotion` (CARER, tuits en inglés con seis categorías). El modelo lo publica el usuario Betty1236 en Hugging Face como trabajo de un experimento de curso sobre clasificación de sentimiento y emociones, y se distribuye con licencia Apache 2.0.

Arquitectura transformer encoder de tipo DistilBERT con una cabeza de clasificación de seis clases (sadness, joy, love, anger, fear, surprise). Cuenta con 66.958.086 parámetros totales (unos 67 millones) y un tamaño de repositorio de 0,3 GB en formato safetensors. Es un modelo pequeño, pensado para inferencia rápida y económica en CPU, no para generación de texto ni razonamiento.

Su relevancia es práctica: ofrece una línea base ligera y de código abierto para tareas de moderación de contenido, análisis de opinión en redes sociales o enrutado de conversaciones, con métricas declaradas de accuracy 0,9405 y weighted F1 0,9402 en validación. No obstante, el autor advierte de limitaciones claras en clases minoritarias y en textos con ironía o negación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT) con cabeza de clasificación de 6 clases |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens, según el modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un encoder transformer de 6 capas destilado de BERT, y añade una cabeza lineal de clasificación con 6 salidas. El ajuste fino es de extremo a extremo, con todos los parámetros entrenables (no se congeló el backbone). Los datos de entrenamiento son el dataset `emotion` (CARER), con particiones de 16.000 ejemplos de entrenamiento, 2.000 de validación y 2.000 de test, y seis etiquetas: sadness, joy, love, anger, fear y surprise.

Los hiperparámetros declarados son 3 épocas, learning rate 5e-05, batch size 32 y weight decay 0,01. No se documenta uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un clasificador. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal; se trata de un ajuste fino estándar con la librería transformers.

## Capacidades

- Clasificación de texto en inglés en seis emociones: sadness, joy, love, anger, fear y surprise.
- Salida de probabilidades por clase mediante `top_k=None` en el pipeline de transformers.
- Integración directa con `pipeline("text-classification")` y con `AutoModelForSequenceClassification`.
- Compatible con text-embeddings-inference y endpoints según las etiquetas del repositorio.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (ni visión ni audio).
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Moderación de contenido en redes sociales: clasificar respuestas de usuarios en inglés y marcar mensajes con alta probabilidad de anger o fear para revisión humana, aprovechando la inferencia rápida de un modelo de 67 M de parámetros.
- Análisis de sentimiento y emoción en tuits: procesar lotes de publicaciones en inglés para agregar la distribución emocional por campaña o tema, con un coste computacional muy bajo.
- Enrutado de conversaciones en atención al cliente: detectar frustración (anger) o satisfacción (joy) en el primer turno y derivar al agente o al flujo adecuado.
- Etiquetado asistido de datasets: preanotar corpus en inglés con seis emociones y revisar manualmente solo los casos de baja confianza o de clases minoritarias.
- Investigación en psicolingüística o análisis de discurso: medir la evolución emocional de un conjunto de textos en inglés a lo largo del tiempo con una línea base reproducible y de licencia permisiva.
- Filtrado previo en pipelines de datos: descartar o priorizar documentos según su carga emocional antes de pasarlos a modelos mayores, reduciendo coste y latencia.
- Prototipado educativo: servir como ejemplo de ajuste fino de DistilBERT para cursos de NLP, dado que la model card documenta hiperparámetros y métricas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Text classification | emotion (validación) | Accuracy | 0,9405 |
| Text classification | emotion (validación) | Weighted F1 | 0,9402 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni comparaciones oficiales con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (67 M de parámetros, unos 268 MB de pesos) y en torno a 0,5-1 GB con overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 ejecutan el modelo sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM; también en CPU.
- Opciones de despliegue: `transformers` (pipeline o carga manual), text-embeddings-inference y endpoints compatibles según las etiquetas del repositorio. No se documentan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, se espera inferencia en milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Betty1236/distilbert-base-uncased-finetuned-emotion | 66.958.086 | no disponible | Clasificación de 6 emociones (inglés) | apache-2.0 | Hugging Face |
| distilbert-base-uncased (modelo base) | no disponible en la información | no disponible | Modelo de lenguaje enmascarado, sin cabeza de clasificación | apache-2.0 | Hugging Face |
| Otros clasificadores de emoción sobre `emotion` | no disponible | no disponible | Clasificación de 6 emociones | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de alternativas comparables, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Solo está entrenado y validado en inglés; el rendimiento en castellano u otros idiomas es desconocido.
- El dataset está desbalanceado: joy y sadness son mayoritarias, mientras que love y surprise rondan el 5 % cada una, lo que reduce la recall de las clases minoritarias; el autor señala que love se confunde a menudo con joy.
- Errores frecuentes en ironía, sarcasmo, negación y textos con emociones mixtas.
- No debe usarse en escenarios de alto riesgo (salud mental, moderación crítica, decisiones legales) sin supervisión humana.
- Hereda sesgos sociales presentes en el corpus de preentrenamiento de DistilBERT.
- Las métricas declaradas (accuracy 0,9405, weighted F1 0,9402) no están verificadas de forma independiente y corresponden a validación, no a test.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset `emotion` subyacente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Betty1236/distilbert-base-uncased-finetuned-emotion
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Dataset emotion: https://huggingface.co/datasets/emotion
