# raulgdp/beto-sarcasmo-spanish-2026-balanceado-32

## Resumen

beto-sarcasmo-spanish-2026-balanceado-32 es un modelo de clasificación de texto en castellano obtenido por ajuste fino (fine-tuning) del checkpoint BETO, concretamente de `dccuchile/bert-base-spanish-wwm-cased`. Lo desarrolla el usuario raulgdp y su propósito declarado, a partir del nombre, es la detección de sarcasmo en textos en español. El modelo se publicó en Hugging Face en noviembre de 2026 y se distribuye en formato safetensors bajo la librería transformers.

Arquitectónicamente es un transformer encoder de tipo BERT en su variante "whole word masking" con casing (sensible a mayúsculas y minúsculas), con 109.852.418 parámetros totales, lo que corresponde a la configuración estándar de BETO base (12 capas, 768 dimensiones ocultas). No es un modelo generativo ni un modelo de razonamiento: es un clasificador de secuencias que devuelve etiquetas sobre un texto de entrada.

Su relevancia es acotada pero concreta: el sarcasmo es un fenómeno pragmático difícil de detectar con modelos léxicos, y un ajuste fino específico sobre BETO ofrece una alternativa ligera (unos 110 millones de parámetros) frente a modelos generativos grandes para una tarea de clasificación binaria o multiclase. La model card, sin embargo, está generada automáticamente y no documenta el conjunto de datos, las etiquetas ni los usos previstos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (whole word masking, cased) |
| Parametros totales | 109.852.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT base, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización posterior vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | no disponible en la model card; el modelo base BETO está entrenado en español |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `dccuchile/bert-base-spanish-wwm-cased`, el checkpoint BETO de la Universidad de Chile. Se trata de un encoder transformer bidireccional con enmascaramiento de palabras completas y vocabulario sensible a mayúsculas, con 109,85 millones de parámetros, pensado para tareas de comprensión del lenguaje y clasificación. La cabeza de clasificación se ha reentrenado sobre un dataset que la model card identifica únicamente como "None", es decir, sin nombre ni descripción.

Los hiperparámetros de entrenamiento sí están documentados: learning rate de 2e-05, batch de 32 en entrenamiento y evaluación, semilla 42, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 100 pasos de warmup, 10 épocas y precisión mixta nativa (AMP). El entrenamiento se detuvo o registró métricas hasta la época 6 (paso 2766). No se documenta el volumen de datos, la composición del corpus, el número de etiquetas ni si hubo aumento de datos o balanceo de clases, pese a que el nombre del modelo sugiere un conjunto "balanceado". Tampoco se indica ningún proceso de RLHF, DPO ni innovación arquitectónica adicional: es un ajuste fino supervisado convencional. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto: devuelve una etiqueta por secuencia de entrada, orientada según el nombre del modelo a la detección de sarcasmo en castellano.
- Comprensión contextual bidireccional: al ser un encoder BERT, atiende a todo el texto de entrada de forma simultánea, lo que permite captar negaciones, ironías léxicas y contrastes internos de la frase.
- Manejo de casing: el checkpoint base es "cased", por lo que distingue mayúsculas y minúsculas, algo potencialmente útil para detectar énfasis irónicos.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni modo "thinking".
- No tiene capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües: no documentadas; el modelo base está orientado al español.
- No se documenta soporte de agentes ni integración con pipelines de decisión más allá de la clasificación.

## Casos de uso

- Moderación de comunidades en línea: clasificar comentarios de foros o redes como sarcásticos o no sarcásticos para enrutarlos a revisión humana o ajustar la respuesta automática, aprovechando el bajo coste de inferencia de un modelo de 110 millones de parámetros.
- Análisis de opinión y sentimiento con matiz irónico: en un pipeline de análisis de reseñas, usar la salida del clasificador como señal adicional que corrija falsos positivos de sentimiento (por ejemplo, una reseña positiva en superficie pero sarcástica).
- Monitorización de reputación de marca: procesar menciones en redes sociales en castellano y separar las burlas o ironías de las quejas literales, con un modelo ligero que puede ejecutarse en CPU sobre grandes volúmenes.
- Enriquecimiento de datasets para investigación: etiquetar corpus de texto en español con una señal de sarcasmo para estudios de pragmática o para preentrenar o filtrar datos de modelos mayores.
- Filtrado previo en sistemas de atención al cliente: detectar mensajes irónicos o sarcásticos de usuarios antes de pasarlos a un agente conversacional, para que este ajuste el tono o derive a un humano.
- Clasificación por lotes en entornos con recursos limitados: al ser un BERT base, cabe en una GPU de consumo e incluso en CPU, lo que permite integrarlo en tareas de etiquetado masivo sin infraestructura dedicada.
- Componente de un ensemble: combinar su probabilidad de sarcasmo con la de otros clasificadores o con un LLM generativo para mejorar la robustez de la decisión final.

## Benchmarks y rendimiento

La model card declara resultados sobre el conjunto de evaluación, aunque no se especifica su composición ni su tamaño. El model-index oficial no contiene resultados (`results: []`), por lo que los datos provienen de la tabla de entrenamiento del Trainer.

| Metrica | Valor (mejor epoca registrada) |
|---|---|
| Loss (evaluacion) | 0.4656 (epoca 4) |
| Accuracy | 0.8544 (epoca 4) |
| F1 weighted | 0.8527 (epoca 4) |
| F1 macro | 0.8527 (epoca 4) |
| Precision weighted | 0.8710 (epoca 4) |
| Recall weighted | 0.8544 (epoca 4) |

Evolución por épocas registrada en la model card:

| Epoca | Paso | Validation loss | Accuracy | F1 weighted | F1 macro | Precision weighted | Recall weighted |
|---|---|---|---|---|---|---|---|
| 1.0 | 461 | 0.3500 | 0.8375 | 0.8367 | 0.8367 | 0.8450 | 0.8375 |
| 2.0 | 922 | 0.3365 | 0.8525 | 0.8512 | 0.8512 | 0.8647 | 0.8525 |
| 3.0 | 1383 | 0.4317 | 0.8408 | 0.8406 | 0.8406 | 0.8425 | 0.8408 |
| 4.0 | 1844 | 0.4656 | 0.8544 | 0.8527 | 0.8527 | 0.8710 | 0.8544 |
| 5.0 | 2305 | 0.5417 | 0.8511 | 0.8501 | 0.8501 | 0.8614 | 0.8511 |
| 6.0 | 2766 | 0.6076 | 0.8525 | 0.8516 | 0.8516 | 0.8609 | 0.8525 |

No se han publicado comparaciones con otros modelos en la información disponible. La loss de validación mínima se alcanza en la época 2 (0.3365), mientras que la mejor accuracy aparece en la época 4, lo que sugiere cierto sobreajuste a partir de la época 3; el autor no documenta ninguna estrategia de early stopping ni de selección del checkpoint final.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 0,45 GB solo para pesos (109,85 M de parámetros × 4 bytes), más activaciones y overhead; en la práctica, menos de 1 GB para lotes pequeños.
- En fp16 o bf16, los pesos ocupan aproximadamente 0,22 GB; la cuantización a int8 reduciría aún más el consumo, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares. Para lotes grandes conviene una GPU con más memoria, pero el modelo no la exige.
- Cabe en GPU de consumo y también en CPU: es viable ejecutarlo en un portátil o en un contenedor sin GPU para clasificación por lotes.
- Opciones de despliegue: transformers con `pipeline("text-classification")`, Text Embeddings Inference (el tag `text-embeddings-inference` está presente), endpoints compatibles, y exportación a ONNX o a GGUF mediante herramientas de la comunidad (no documentadas por el autor). vLLM y TGI no son opciones habituales para un encoder de clasificación de este tamaño.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beto-sarcasmo-spanish-2026-balanceado-32 (este) | 109,85 M | no disponible | Clasificación de sarcasmo en español | no disponible | Hugging Face, safetensors |
| dccuchile/bert-base-spanish-wwm-cased (BETO) | ~110 M | 512 tokens (arquitectura BERT) | Modelo base de lenguaje en español, ajustable a clasificación | no disponible en la información proporcionada | Hugging Face |
| dccuchile/bert-base-spanish-wwm-uncased | ~110 M | 512 tokens (arquitectura BERT) | Modelo base de lenguaje en español, ajustable a clasificación | no disponible en la información proporcionada | Hugging Face |
| Modelos generativos grandes (por ejemplo, LLM de 7B en adelante) | miles de millones | variable, habitualmente mucho mayor | Clasificación zero-shot mediante prompting | variable | Hugging Face y otros |

La comparación cuantitativa de rendimiento con alternativas no está disponible: no se han publicado resultados de benchmarks frente a otros clasificadores de sarcasmo en español en la información proporcionada.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, las etiquetas, el número de clases ni el proceso de anotación; esto impide evaluar la validez del modelo fuera de su conjunto de evaluación original.
- El conjunto de evaluación no está descrito, por lo que las métricas declaradas (accuracy 0.8544, F1 macro 0.8527) no son interpretables sin conocer la distribución de clases ni el dominio.
- La loss de validación aumenta a partir de la época 2 mientras la accuracy sigue subiendo, lo que apunta a sobreajuste; no se documenta selección de checkpoint ni validación cruzada.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de dominio: un clasificador de sarcasmo entrenado sobre un corpus concreto puede fallar sistemáticamente en registros distintos (por ejemplo, lenguaje formal, prensa o textos técnicos).
- Sesgos conocidos: no documentados; al entrenarse sobre un corpus no especificado, puede heredar sesgos léxicos y culturales del mismo, y el sarcasmo es un fenómeno muy dependiente del contexto cultural y regional.
- Limitaciones de idioma: no se declaran idiomas soportados; el modelo base está orientado al español, y no hay evidencia de funcionamiento en otras lenguas.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de usarlo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- No se documentan versiones cuantizadas ni pruebas de robustez frente a texto adversarial, abreviaturas o errores ortográficos.

## Enlaces

- Hugging Face: https://huggingface.co/raulgdp/beto-sarcasmo-spanish-2026-balanceado-32
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
