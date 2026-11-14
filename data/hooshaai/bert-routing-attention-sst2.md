# Hooshaai/bert-routing-attention-sst2

## Resumen

`Hooshaai/bert-routing-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que los bloques de atención softmax cuadrática de las 12 capas del transformer han sido sustituidos por un mecanismo denominado `routing_attention`, implementado en la librería NeuralOps (autor del código original: Taha Majlesi). El modelo se distribuye como pesos de atención y cabeza de clasificación en FP16 (~55 MB) que se aplican sobre los pesos congelados de BERT-Base descargados en tiempo de carga, siguiendo una especificación de serialización modular del proyecto NeuralOps.

El modelo está entrenado y evaluado exclusivamente sobre la tarea SST-2 de GLUE (clasificación binaria de sentimiento en inglés) mediante un protocolo de destilación de representaciones en caché (Cached Representation Distillation) en dos etapas: alineamiento de subespacio oculto y destilación por KL de logits más entropía cruzada de tarea. El resultado reportado es una accuracy del 76,15 % en el split de validación de SST-2, frente al 91,63 % del profesor BERT-Base y al 50,92 % del estudiante antes de la destilación.

Su relevancia es fundamentalmente experimental: sirve como referencia reproducible de cómo se comporta una atención subcuadrática (complejidad efectiva O(N) u O(N log N)) al sustituir la atención estándar en un transformer preentrenado, con un coste de entrenamiento muy bajo (83 pasos, 55 segundos en una RTX 3090) y un formato de pesos que evita duplicar el modelo base completo. No es un modelo de propósito general ni compite en calidad con BERT-Base en su tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención sustituida por `routing_attention` (subcuadrática, O(N) u O(N log N)) |
| Parametros totales | 110 M (BERT-Base); el repo solo almacena pesos de atención y cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la de `bert-base-uncased`, 512 tokens, aunque no se explicita en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, atención y cabeza de clasificación); requiere `trust_remote_code=True` con `modeling_neuralops_bert.py` |
| Libreria | `neuralops` (también cargable vía `transformers` con código remoto) |
| Tarea / pipeline | `text-classification` (SST-2, binaria: 0 = negativo, 1 = positivo) |
| Modelo base | `google-bert/bert-base-uncased` (congelado) |
| Dataset de entrenamiento | GLUE / SST-2 |
| Hardware de entrenamiento | NVIDIA GeForce RTX 3090 24 GB (clúster HPC Sharif) |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, 110 M de parámetros, encoder transformer bidireccional) y reemplaza en las 12 capas el bloque de multi-head attention softmax cuadrática por el mecanismo `routing_attention` de NeuralOps. La model card declara una complejidad operativa efectiva de O(N) u O(N log N) frente a la O(N²) de la MHA estándar, lo que en teoría permitiría secuencias más largas con menor coste computacional, aunque no se publican mediciones de latencia, throughput en inferencia ni comparativas de escalado con secuencias largas.

El entrenamiento usa el protocolo Cached Representation Distillation de NeuralOps: primero se cachean offline las representaciones del profesor (`bert-base-uncased`), de modo que durante el entrenamiento del estudiante no se reserva VRAM para el profesor (0 MB de overhead). Después se ejecutan dos etapas: alineamiento de subespacio oculto y destilación por KL de logits combinada con entropía cruzada de la tarea. El proceso completo consta de 83 pasos de optimización, dura 55 segundos, alcanza 12 352,9 tokens/s y un pico de 8 657 MB de VRAM en una RTX 3090. No se documentan hiperparámetros, tamaño de batch, learning rate ni composición exacta del dataset más allá de SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto de entrada, con salida de logits de dos clases.
- Aprovecha el conocimiento lingüístico del BERT-Base subyacente (vocabulario WordPiece, representaciones contextuales), aunque el ajuste se limita a SST-2.
- No soporta tool calling ni function calling: es un modelo de clasificación, no un modelo generativo.
- No soporta agentes, razonamiento multi-paso ni modos de pensamiento (`thinking mode`).
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés; no se reporta evaluación en otros idiomas.
- La atención subcuadrática es el rasgo técnico diferencial, orientado a eficiencia en secuencias largas más que a calidad.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios de usuarios en inglés: el modelo devuelve una etiqueta binaria por secuencia y puede integrarse en un pipeline de `transformers` con `pipeline("text-classification")` para procesar lotes de textos.
- Filtrado de opiniones negativas en foros o redes sociales: dado su bajo coste de almacenamiento (~55 MB extra sobre BERT-Base), es viable desplegarlo en entornos con poco espacio de disco para preclasificar grandes volúmenes de texto en inglés.
- Referencia académica para estudiar atención subcuadrática: sirve como punto de comparación reproducible (83 pasos, 55 s en RTX 3090) en experimentos sobre mecanismos de atención alternativos a la softmax cuadrática.
- Docencia y prototipado de destilación de conocimiento: el protocolo de destilación en caché sin VRAM de profesor es un ejemplo práctico para cursos o tutoriales sobre KD con recursos limitados.
- Evaluación de robustez de mecanismos de atención: comparar el 76,15 % de accuracy frente al 91,63 % del profesor permite cuantificar la pérdida de calidad al sustituir la atención en un modelo preentrenado.
- Base para experimentos de eficiencia en secuencias largas: si se confirma empíricamente la complejidad O(N) u O(N log N), podría emplearse como punto de partida para tareas de clasificación con documentos largos en inglés, aunque el modelo no está entrenado para ello.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,92 % | 76,15 % | +25,23 % |
| Cross-entropy de validación | 0,2428 | No calibrado | 0,5551 | No disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se reportan métricas de latencia o throughput en inferencia, solo durante el entrenamiento (12 352,9 tokens/s en RTX 3090).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al cargar BERT-Base completo (110 M parámetros) en FP16 se requiere aproximadamente 220 MB de pesos, más overhead de activaciones y del código remoto de NeuralOps.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente para inferencia en FP16; el entrenamiento se realizó en una RTX 3090 (24 GB) con un pico de 8 657 MB.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores; no se publican pruebas específicas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere el código `modeling_neuralops_bert.py`), API `neuralops.hub.bert_zoo.load_pretrained_bert` y `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es directamente compatible con llama.cpp.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se reportan 12 352,9 tokens/s y 55 s totales en RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-routing-attention-sst2` | 110 M (base) + ~55 MB de atención | No disponible (hereda 512 de BERT-Base) | 76,15 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (reportado en esta ficha) | Apache 2.0 | Hugging Face, `transformers` estándar |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` estándar |

La comparativa se limita a los datos publicados en la model card; no se dispone de mediciones propias de los modelos alternativos en esta ficha.

## Limitaciones y advertencias

- Calidad muy inferior al profesor: 76,15 % frente a 91,63 % en SST-2, lo que supone una caída de 15,48 puntos porcentuales; no es adecuado para producción con requisitos de precisión.
- Entrenamiento muy corto (83 pasos, 55 s) y sin documentación de hiperparámetros, batch size ni composición exacta del dataset, lo que dificulta la reproducibilidad fina.
- Solo inglés y solo clasificación binaria de sentimiento; no es un modelo generativo ni multilingüe.
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`) al cargar, lo que implica un riesgo de seguridad y de compatibilidad con versiones futuras de `transformers`.
- Dependencia de la librería `neuralops`, con menor madurez y adopción que `transformers`; no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI.
- No se documentan evaluaciones de sesgo, robustez ante adversariales ni tasas de alucinación (no aplica al ser clasificación, pero sí posibles errores de calibración).
- El repositorio tiene 0,0 GB de tamaño reportado y 65 descargas, con 0 likes: ecosistema muy reducido y poca validación comunitaria.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y el código de NeuralOps debe verificarse en su repositorio antes de un uso comercial.
- La afirmación de complejidad O(N) u O(N log N) no viene acompañada de mediciones empíricas de escalado con secuencias largas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-routing-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2
