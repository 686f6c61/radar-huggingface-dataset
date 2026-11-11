# jlincroft/bert-finetuned-ner-assignment2

## Resumen

`bert-finetuned-ner-assignment2` es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante ajuste fino de `google-bert/bert-base-cased`, publicado por el usuario jlincroft en Hugging Face. Se trata de un modelo BERT base encoder-only de 107.729.677 parámetros (aproximadamente 110M), entrenado para la tarea de token classification, es decir, asignar una etiqueta BIO a cada token de entrada para identificar personas, organizaciones, localizaciones y otras entidades.

El modelo tiene un carácter claramente académico: su nombre incluye "assignment2" y la model card fue generada automáticamente por el `Trainer` de Hugging Face sin completar las secciones de descripción, usos previstos o datos de entrenamiento. El dataset de ajuste fino aparece como "None" en la model card, por lo que no se puede verificar qué corpus se utilizó ni su dominio.

Su relevancia práctica es limitada: se trata de un checkpoint de bajo rendimiento (F1 de 0,5632 en validación) y sin documentación, útil únicamente como referencia educativa o como punto de partida para experimentos propios. No está pensado para producción ni para uso comercial serio, aunque su licencia Apache 2.0 lo permitiría legalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base, tipo `BertForTokenClassification`) |
| Parametros totales | 107.729.677 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT base admite habitualmente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion estandar via llama.cpp/ONNX no documentada) |
| Idiomas soportados | no disponible (heredado de `bert-base-cased`, entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar: 12 capas de transformer encoder, atención multi-cabeza completa (bidireccional), embeddings de token y de posición aprendidos, y una cabeza de clasificación lineal sobre la salida del encoder para token classification. El vocabulario y la tokenización provienen de `bert-base-cased` (WordPiece con distinción de mayúsculas), lo que es relevante para NER porque preserva información de capitalización útil para detectar entidades.

El ajuste fino se realizó durante 3 épocas con `learning_rate=2e-05`, `train_batch_size=8`, `eval_batch_size=8`, semilla 42, optimizador `AdamW` (variante `ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08) y scheduler lineal. Se registraron 249 pasos por época (747 pasos totales), lo que sugiere un conjunto de entrenamiento de aproximadamente 2.000 ejemplos. Las versiones de framework indicadas son Transformers 5.22.1, PyTorch 2.14.1+cpu, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el dataset, la composición del corpus, ni si hubo aumento de datos o validación cruzada.

## Capacidades

- Reconocimiento de entidades nombradas (NER) por token: asigna etiquetas BIO a cada token de una secuencia de entrada.
- Clasificación de tokens genérica: la cabeza de token classification puede reutilizarse para otras tareas de etiquetado secuencial (POS tagging, chunking) con reentrenamiento.
- Comprensión bidireccional del contexto: al ser un encoder BERT, cada token atiende a toda la secuencia, útil para desambiguar entidades.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto: es un modelo discriminativo, no un modelo de lenguaje causal.
- No soporta visión, audio ni modo "thinking".
- Capacidades multilingües: no documentadas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Extracción de entidades en textos académicos o de laboratorio: dado que el modelo se entrenó sobre un dataset no documentado, podría usarse como línea base para etiquetar nombres de personas, organizaciones y lugares en corpus pequeños, siempre validando su rendimiento en el dominio objetivo.
- Prototipado educativo de pipelines NER: sirve para demostrar el flujo completo de `pipeline("token-classification")` con `transformers`, incluyendo tokenización, inferencia y decodificación BIO.
- Comparación de arquitecturas en experimentos de investigación: como checkpoint de referencia frente a otros ajustes de `bert-base-cased` con hiperparámetros distintos.
- Preetiquetado asistido en anotación humana: con F1 de 0,56, puede generar etiquetas iniciales que un anotador corrija, reduciendo el esfuerzo manual en corpus de bajo volumen.
- Detección de entidades en textos cortos en inglés: adecuado para frases o párrafos de hasta 512 tokens, donde la ventana de BERT base no requiere truncamiento.
- Base para ajuste fino adicional: al ser un checkpoint Apache 2.0 con pesos safetensors, puede continuarse el entrenamiento con `Trainer` sobre un dataset propio y específico del dominio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no identificado):

| Metrica | Epoca 1 (step 249) | Epoca 2 (step 498) | Epoca 3 (step 747) |
|---|---|---|---|
| Validation loss | 0,2184 | 0,2131 | 0,2284 |
| Precision | 0,4271 | 0,5098 | 0,4876 |
| Recall | 0,6204 | 0,6399 | 0,6667 |
| F1 | 0,5059 | 0,5675 | 0,5632 |
| Accuracy | 0,9381 | 0,9478 | 0,9446 |

El mejor F1 se alcanza en la época 2 (0,5675); en la época 3 el F1 baja ligeramente a 0,5632 pese a que el recall sube a 0,6667, lo que indica sobreajuste incipiente. No se han publicado resultados de benchmarks estándar (CoNLL-2003, MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para los pesos (107,7M parámetros × 4 bytes) más activaciones; en la práctica, menos de 2 GB en GPU.
- VRAM estimada en fp16: aproximadamente 0,22 GB para los pesos; en int8, unos 0,11 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU, como indica el propio entorno de entrenamiento (PyTorch 2.14.1+cpu).
- Cabe en cualquier GPU consumer e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), ONNX Runtime, TorchScript, vLLM (soporte limitado para modelos encoder-only), TGI (soporte para token classification no garantizado), y `llama.cpp` no aplica por no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; para un BERT base en GPU moderna se espera del orden de milisegundos por secuencia de 128-512 tokens, pero no hay medición publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 NER (declarado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jlincroft/bert-finetuned-ner-assignment2` | 107,7M | no disponible | 0,5632 (validación propia) | Apache 2.0 | Hugging Face |
| `dslim/bert-base-NER` | ~108M | 512 tokens | ~0,91 (CoNLL-2003, referencia habitual) | MIT | Hugging Face |
| `Jean-Baptiste/roberta-large-ner-english` | ~355M | 512 tokens | no disponible en esta ficha | MIT | Hugging Face |
| `google-bert/bert-base-cased` (sin ajustar) | 108M | 512 tokens | no aplica (sin cabeza NER) | Apache 2.0 | Hugging Face |

La comparación con `dslim/bert-base-NER` es la más directa por tratarse del mismo backbone y la misma tarea; el checkpoint de jlincroft queda muy por debajo en F1 declarado, aunque los conjuntos de evaluación no son comparables al no estar documentado el dataset.

## Limitaciones y advertencias

- Rendimiento bajo: F1 de 0,5632 y precisión de 0,4876 indican un número elevado de falsos positivos; no es adecuado para producción sin reentrenamiento.
- Dataset de entrenamiento no documentado ("None" en la model card): imposible evaluar el dominio, la cobertura de etiquetas ni el sesgo del corpus.
- Model card incompleta: las secciones de descripción, usos previstos y limitaciones están sin rellenar.
- Riesgo de sobreajuste: el F1 cae en la época 3 mientras el recall sube, señal de que el modelo se está sesgando hacia la clase positiva.
- Idiomas no documentados: probablemente limitado a inglés por herencia de `bert-base-cased`; no usar en castellano sin validación.
- Longitud de contexto no confirmada en la model card; asumir 512 tokens como máximo por la arquitectura BERT base.
- Licencia Apache 2.0 permite uso comercial, pero el bajo rendimiento y la falta de documentación desaconsejan ese uso sin evaluación previa.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un repositorio abandonado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jlincroft/bert-finetuned-ner-assignment2
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Documentación de `transformers` para token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- Referencia comparativa `dslim/bert-base-NER`: https://huggingface.co/dslim/bert-base-NER
