# matmei/POCQ_tr

## Resumen

POCQ_tr es un modelo de clasificación de texto publicado en HuggingFace por el usuario matmei. Se trata de un ajuste fino (fine-tuning) de `distilbert-base-uncased`, un encoder Transformer destilado de BERT. El modelo contiene aproximadamente 66,95 millones de parámetros y está pensado para tareas de clasificación de secuencias mediante la librería Transformers. Su principal atractivo es el reducido tamaño, que lo hace adecuado para entornos con recursos limitados y para despliegues en CPU o GPUs de consumo.

La model card está generada automáticamente y apenas ofrece detalles: no se especifica el dataset de entrenamiento, la tarea concreta, la longitud de contexto ni los idiomas soportados. El único dato de evaluación disponible es la pérdida de validación (loss) de 0,3264 obtenida en la segunda época. Aunque el modelo está licenciado bajo Apache 2.0 y permite uso comercial, su rendimiento real en dominios concretos no ha sido documentado, por lo que se recomienda una evaluación exhaustiva antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder Transformer, modelo base: distilbert-base-uncased) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base distilbert-base-uncased está entrenado en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura DistilBERT, un encoder Transformer destilado de BERT mediante destilación de conocimiento. DistilBERT conserva aproximadamente el 95% de las capacidades de BERT con alrededor de un 40% menos de parámetros. En este caso, el ajuste fino se realiza sobre un dataset no especificado (la model card indica "None dataset"). Los hiperparámetros declarados son: learning rate 2e-05, batch size 16, seed 42, 15 épocas, optimizador AdamW fusionado y scheduler lineal. La validación muestra que la pérdida mínima se alcanza en la época 2 (0,3264) y luego aumenta en las épocas 3 y 4, lo que sugiere sobreajuste a partir de la tercera época.

No se documentan innovaciones técnicas propias, como atención lineal o decodificación especulativa. El modelo es un encoder puro, sin capacidades generativas.

## Capacidades

- Clasificación de texto: el modelo genera una distribución de probabilidad sobre las clases predefinidas a partir de una secuencia de entrada.
- No soporta generación de texto libre: al ser un encoder (DistilBERT), no produce texto autoregresivo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni modo de pensamiento explícito.
- Sin capacidades multimodales: solo texto.
- Capacidades multilingües: no documentadas; el modelo base es de habla inglesa.
- Capacidades especiales: no documentadas.

## Casos de uso

- Analisis de sentimiento: el modelo puede clasificar reseñas, comentarios o publicaciones en categorías (positivo, negativo, neutro). Su tamaño reducido permite ejecutarlo en tiempo real con baja latencia en CPU.
- Clasificación de tickets de soporte: para etiquetar automáticamente tickets de atención al cliente (facturación, bug, consulta) y enrutarlos al equipo adecuado en un pipeline de automatización.
- Detección de spam: apto para filtrar correos o comentarios no deseados, siempre que exista un dataset etiquetado del dominio.
- Moderación de contenido: para clasificar contenido inapropiado en foros o redes sociales. La licencia Apache 2.0 facilita su incorporación en productos comerciales.
- Etiquetado temático de documentos: en un sistema de gestión documental, el modelo puede asignar categorías predefinidas a artículos, noticias o informes.
- Clasificación de intenciones en chatbots: dentro de un flujo conversacional, permite detectar la intención del usuario (saludo, consulta, queja) para seleccionar la siguiente acción, aunque no es un modelo de diálogo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una tabla de entrenamiento con las siguientes pérdidas de validación:

| Epoch | Validation Loss |
|---|---|
| 1.0 | 0.3534 |
| 2.0 | 0.3264 |
| 3.0 | 0.4001 |
| 4.0 | 0.5516 |

No hay puntuaciones de precisión, recall, F1 ni comparativas con otros modelos en MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 66.955.010 parámetros, los pesos en fp32 ocupan aproximadamente 268 MB y en fp16 unos 134 MB. Con overhead del runtime, se recomienda una GPU de al menos 1-2 GB o simplemente CPU.
- GPU recomendadas: cualquier GPU de consumo moderna (NVIDIA RTX 3060, GTX 1660, etc.) es suficiente. No se requieren A100 ni H100.
- Compatible con GPU de consumo: sí, incluso con memoria compartida en portátiles.
- Opciones de despliegue: Transformers (pipeline de text-classification), ONNX Runtime, TF Serving, TensorFlow Lite o FastAPI con PyTorch en CPU.
- Latencia y throughput: no disponible. Por tamaño, se espera una latencia en el rango de 1-10 ms por secuencia en GPU y decenas de ms en CPU, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto aproximado | Arquitectura | Licencia |
|---|---|---|---|---|
| POCQ_tr (fine-tune de DistilBERT) | 66.955.010 | no disponible | Encoder Transformer | Apache 2.0 |
| DistilBERT-base-uncased | 66.955.010 | 512 tokens | Encoder Transformer | Apache 2.0 |
| BERT-base-uncased | 110.000.000 | 512 tokens | Encoder Transformer | Apache 2.0 |
| DistilBERT-base-multilingual-cased | 135.000.000 | 512 tokens | Encoder Transformer | Apache 2.0 |

No hay datos de rendimiento comparativo disponibles. Los valores de contexto de los modelos referenciados proceden de la documentación estándar de cada modelo, pero no se han verificado para POCQ_tr.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos específicos. Al derivar de DistilBERT, que se entrenó con texto web en inglés, puede heredar sesgos de género, raza o contenido, aunque no se ha evaluado.
- Riesgo de alucinación: bajo para clasificación, ya que no genera texto libre. Aun así, puede producir etiquetas incorrectas si el dataset de entrenamiento no representa bien el dominio de uso.
- Limitaciones de contexto o idioma: la longitud de contexto no está documentada en la ficha. El modelo base admite hasta 512 tokens, pero no se confirma en este modelo. No se dispone de información sobre soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y distribución, con la obligación de conservar el aviso de licencia.
- Advertencia para producción: la model card indica "More information needed" y el dataset de entrenamiento se describe como "None". Antes de usar en producción, es imprescindible evaluar el modelo en el dominio concreto, medir precisión/recall y comparar con alternativas. La pérdida de validación aumenta tras la época 2, lo que apunta a sobreajuste y posible baja generalización.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matmei/POCQ_tr
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de Transformers: https://huggingface.co/docs/transformers
