# Mxysx/lab6-trained

## Resumen

`Mxysx/lab6-trained` es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) de `distilbert-base-uncased` sobre un conjunto de datos que el autor no identifica en la model card. Se trata de un transformer encoder-only de 66.958.086 parámetros (aproximadamente 0,8 GB de repositorio), publicado con licencia Apache 2.0 y pesos en formato safetensors. Por su tamaño y arquitectura, no es un modelo generativo: devuelve una etiqueta (o distribución de probabilidad sobre un conjunto cerrado de etiquetas) para una secuencia de entrada.

El interés práctico del modelo es limitado y hay que interpretarlo con cautela. La model card es la plantilla automática de `Trainer` sin completar: no se especifica el dataset, el número de clases, el dominio, el idioma de los datos de entrenamiento ni el uso previsto. Lo único verificable son las métricas de validación declaradas por el autor (accuracy 0,8624 y F1 0,8545, con una pérdida de validación de 0,6232 que aumenta en la segunda época) y los hiperparámetros de entrenamiento.

Es relevante ahora únicamente como artefacto reproducible de un experimento de ajuste fino de bajo coste: dos épocas, batch de 8, learning rate 5e-5 y optimizador AdamW fused. Con 0 descargas y 0 likes, no existe validación externa ni comunidad que lo respalde; cualquier uso en producción exige reevaluarlo sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (DistilBERT: 6 capas, 768 de dimensión oculta, 12 cabezas de atención, sobre `distilbert-base-uncased`) |
| Parametros totales | 66.958.086 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (máximo posicional de `distilbert-base-uncased`; no redefinido en la model card) |
| Tipos de cuantizacion | No disponible: el autor no publica variantes cuantizadas |
| Idiomas soportados | No disponible en los metadatos; el modelo base está preentrenado principalmente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder-only de 6 capas y 768 dimensiones ocultas, destilado a partir de BERT-base, con un tokenizador WordPiece *uncased* (vocabulario de 30.522 tokens) y embeddings posicionales absolutos limitados a 512 posiciones. Sobre el encoder se añade una cabeza de clasificación lineal. El recuento exacto de parámetros (66.958.086 frente a los ~66.955.010 de la configuración estándar de dos etiquetas) es compatible con una cabeza de 4 clases (768×4+4 = 3.076 parámetros adicionales), aunque la model card no declara el número de etiquetas.

El entrenamiento se documenta solo a nivel de hiperparámetros: 2 épocas, `train_batch_size` y `eval_batch_size` de 8, learning rate 5e-5 con scheduler lineal, semilla 42, optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-8) y 1.094 pasos totales (547 por época). No se indica el volumen del dataset, su composición, si hubo validación cruzada ni si se aplicó algún tipo de regularización adicional. No se menciona RLHF, DPO ni ninguna innovación técnica; es un ajuste fino supervisado convencional.

## Capacidades

- Clasificación de texto de secuencia completa: asigna una etiqueta a una entrada de hasta 512 tokens mediante una única pasada forward (sin decodificación autoregresiva).
- Especialización en un conjunto cerrado de clases definido por el dataset de ajuste fino, que el autor no hace público.
- No genera texto libre: no hay capacidad de resumen, traducción, respuesta a preguntas generativa ni diálogo.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento agente.
- Capacidad multilingüe no garantizada: el modelo base es monolingüe inglés y no se documenta el idioma de los datos de ajuste.
- Sensibilidad a mayúsculas reducida por el tokenizador *uncased*, lo que limita el uso de señales tipográficas.
- No dispone de modo *thinking*, visión, audio ni ninguna modalidad adicional.

## Casos de uso

- Triaje de tickets de soporte: con 512 tokens de contexto se puede clasificar el cuerpo completo de un correo o formulario en categorías predefinidas (por ejemplo, facturación, incidencia técnica, cuenta) antes de enrutarlo a un equipo humano; el coste por inferencia es muy bajo al ser un encoder de 67 M de parámetros.
- Moderación de comentarios en comunidades: clasificación por lotes de comentarios en categorías de toxicidad o spam, ejecutable en CPU dentro del propio backend sin depender de una API externa.
- Etiquetado de reseñas de producto: asignación de una categoría temática o de sentimiento a reseñas de hasta 512 tokens, útil para agregar métricas de producto en cuadros de mando.
- Enrutado de intenciones en un asistente conversacional: clasificador previo que decide qué flujo activar (FAQ, incidencia, comercial) antes de invocar un LLM o una base de conocimiento, reduciendo el coste del sistema global.
- Clasificación de documentos en pipelines ETL: categorización de textos extraídos de PDF o correo dentro de un proceso batch, con despliegue vía `transformers` u ONNX Runtime y sin requisitos de GPU.
- Filtrado previo en sistemas de búsqueda o recomendación: descarte o etiquetado de documentos por temática antes de indexarlos, aprovechando la inferencia en milisegundos por batch en hardware modesto.
- Prototipado docente o de investigación: línea base reproducible para comparar técnicas de ajuste fino de encoders pequeños, dado que los hiperparámetros están documentados y el modelo es de 0,8 GB.

En todos los casos es imprescindible validar antes el modelo sobre datos propios: al desconocerse el dataset y las etiquetas de entrenamiento, no se puede afirmar que las clases aprendidas coincidan con las necesidades del escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. El `model-index` de la model card está vacío. Los únicos datos son las métricas del conjunto de evaluación declaradas por el autor:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Accuracy | F1 |
|---|---|---|---|---|---|
| 1.0 | 547 | 0.6372 | 0.5606 | 0.8466 | 0.8415 |
| 2.0 | 1094 | 0.2773 | 0.6232 | 0.8624 | 0.8545 |

Lectura técnica: la pérdida de entrenamiento cae de 0,6372 a 0,2773 mientras la de validación sube de 0,5606 a 0,6232. Es un patrón compatible con sobreajuste a partir de la primera época, y la mejora en accuracy (+1,58 puntos) y F1 (+1,3 puntos) es pequeña en relación al aumento de la brecha entre train y validación. Se desconoce el tamaño y la composición del conjunto de evaluación, por lo que estas cifras no son directamente comparables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en fp32 (67 M × 4 bytes) y 0,13 GB en fp16. El repositorio completo ocupa 0,8 GB, incluyendo pesos y artefactos del `Trainer`.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria es suficiente (GTX 1050 Ti, RTX 3050, T4, L4, A10, A100, H100). El modelo no aprovecha GPUs de gama alta: el cuello de botella es el tamaño de batch y el preprocesado, no el cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos diez años, e incluso en iGPU y en CPU. Un portátil sin GPU dedicada puede servirlo en producción de baja concurrencia.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (el modelo lleva la etiqueta `text-embeddings-inference` y `endpoints_compatible`, por lo que es compatible con Inference Endpoints), ONNX Runtime o TorchScript para inferencia optimizada en CPU, y FastAPI o similar como capa HTTP. `vLLM` y `llama.cpp`/GGUF no son la vía natural para un encoder de clasificación.
- Latencia y throughput: no se publican medidas. Al no haber generación autoregresiva, cada petición requiere una sola pasada forward sobre la secuencia de entrada, con coste proporcional a la longitud (hasta 512 tokens) y al tamaño de batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Mxysx/lab6-trained` | 66,96 M | 512 tokens | Clasificación (etiquetas desconocidas) | Apache 2.0 | HuggingFace, 0 descargas |
| `distilbert-base-uncased` | 66,96 M | 512 tokens | Modelo base preentrenado, requiere cabeza | Apache 2.0 | HuggingFace, muy extendido |
| `bert-base-uncased` | 110 M | 512 tokens | Modelo base preentrenado, requiere cabeza | Apache 2.0 | HuggingFace, muy extendido |
| `roberta-base` | 125 M | 514 tokens | Modelo base preentrenado, requiere cabeza | MIT | HuggingFace, muy extendido |

La comparación de rendimiento con alternativas no está disponible: al no conocerse el dataset ni las etiquetas, no es posible evaluar este modelo frente a otros clasificadores en la misma tarea. La comparación relevante es de coste: `lab6-trained` no aporta ventaja de eficiencia frente a su propio modelo base, y frente a `bert-base-uncased` o `roberta-base` gana en huella de memoria (67 M frente a 110 M y 125 M) a costa de la capacidad representacional que se pierde en la destilación.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce el dominio, el idioma, el número de clases y la distribución de etiquetas. El modelo no puede reutilizarse con garantías fuera del experimento original.
- Model card incompleta: es la plantilla automática de `Trainer` sin revisar; las secciones de descripción, usos previstos y datos de evaluación están sin rellenar.
- Señal de sobreajuste: la pérdida de validación aumenta en la segunda época mientras la de entrenamiento cae un 56 %, con solo 1.094 pasos de entrenamiento. La calibración de las probabilidades de salida no está verificada.
- Evaluación sin contexto: no se indica el tamaño del conjunto de validación ni si hubo *split* independiente, por lo que accuracy 0,8624 y F1 0,8545 no son cifras auditables.
- Sesgos heredados: `distilbert-base-uncased` se preentrenó con texto web en inglés; los sesgos de género, raza y nacionalidad de ese corpus se transfieren al clasificador y no han sido evaluados.
- Cobertura lingüística: el tokenizador *uncased* está optimizado para inglés. El rendimiento en castellano u otros idiomas es impredecible y no está medido.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay reportes de terceros, demos ni evaluaciones independientes.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y sin garantía. No hay restricciones adicionales declaradas, pero tampoco obligaciones de documentar cambios por parte del autor original.
- Reproducibilidad: el entorno declarado (Transformers 5.14.1, PyTorch 2.9.1+cu128, Datasets 5.0.0) no corresponde a versiones estables publicadas en el momento de redactar esta ficha, lo que dificulta reproducir el entrenamiento tal cual.
- Riesgo de alucinación: no aplica en sentido estricto al no ser generativo; el riesgo equivalente es la asignación de etiquetas con alta confianza en entradas fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mxysx/lab6-trained
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (arquitectura del modelo base): https://arxiv.org/abs/1910.01108
