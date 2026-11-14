# Hooshaai/bert-gated-hybrid-kernel-attention-sst2

## Resumen

`bert-gated-hybrid-kernel-attention-sst2` es un checkpoint experimental publicado por el usuario Hooshaai (identificado en la model card como Taha Majlesi, autor de la librería NeuralOps) que sustituye los bloques de atención softmax cuadrática de `bert-base-uncased` por un mecanismo denominado `gated_hybrid_kernel_attention`, con complejidad efectiva subcuadrática O(N) u O(N log N). El objetivo declarado es explorar alternativas de atención eficiente dentro del ecosistema NeuralOps "Attention Zoo" y validarlas sobre la tarea SST-2 del benchmark GLUE mediante un protocolo propio de destilación por representaciones cacheadas.

El modelo parte de los pesos congelados de BERT-Base (110 M parámetros) y solo publica los pesos de atención y la cabeza de clasificación en FP16 (~55 MB en `attention_weights.safetensors`), reconstruyendo el resto desde el checkpoint original de Google. La evaluación reportada es muy limitada: 51,38 % de accuracy en el split de validación de SST-2 (872 muestras), idéntico antes y después de la destilación, frente al 91,63 % del profesor BERT-Base. Es, por tanto, una prueba de concepto arquitectónica más que un modelo listo para producción.

Su relevancia actual es acotada: sirve como referencia reproducible para investigadores que quieran comparar mecanismos de atención subcuadrática sobre una base BERT estándar, pero el rendimiento obtenido está a nivel de azar en una tarea binaria y el entrenamiento se completó en 132 pasos sobre una única RTX 3090.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `gated_hybrid_kernel_attention` (sustituye MHA softmax en las 12 capas) |
| Parametros totales | 110 M (base BERT-Base congelada) + pesos de atención y cabeza de clasificación destilados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de `bert-base-uncased`, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 para los pesos publicados; el resto de cuantizaciones no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (solo atención y cabeza, `attention_weights.safetensors`, ~55 MB) + pesos base descargados de `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo es un BERT-Base estándar de 12 capas en el que cada bloque de atención multi-cabeza softmax se reemplaza por `gated_hybrid_kernel_attention`, un mecanismo híbrido con compuerta que combina kernels de atención lineales y aproximaciones tipo O(N log N), reduciendo la complejidad operativa frente al O(N²) clásico. La serialización es modular: solo se distribuyen los parámetros de atención y la cabeza de clasificación, y un shim de código remoto (`modeling_neuralops_bert.py`) reconstruye la base congelada desde `bert-base-uncased` en tiempo de carga.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": primero una alineación de subespacio oculto (Stage 1) y después una destilación por KL sobre logits más entropía cruzada de la tarea (Stage 2). Se ejecutó sobre una NVIDIA GeForce RTX 3090 de 24 GB con 132 pasos de optimización, 53,9 s de duración, throughput de 20.065,3 tokens/s y pico de VRAM de 23.021 MB. El dataset es GLUE/SST-2; no se especifican número total de tokens de entrenamiento ni composición detallada del corpus más allá de la tarea.

## Capacidades

- Clasificación de secuencias binaria (análisis de sentimiento positivo/negativo) sobre texto en inglés.
- Inferencia compatible con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert` y `load_surgeried_model`.
- Atención subcuadrática: en teoría permite procesar secuencias más largas que un transformer cuadrático con el mismo coste, aunque no se reportan experimentos a contextos extendidos.
- No soporta tool calling, function calling, agentes, visión, audio ni modo "thinking".
- Capacidad multilingüe: no, solo inglés.
- Generación de texto: no, es un modelo exclusivamente de clasificación.

## Casos de uso

- Investigación en mecanismos de atención eficiente: usar el checkpoint como referencia reproducible para comparar `gated_hybrid_kernel_attention` frente a MHA softmax en una base BERT fija, con métricas controladas sobre SST-2.
- Reproducción de experimentos de destilación: el protocolo de representaciones cacheadas permite replicar el pipeline en una sola GPU consumer de 24 GB en menos de un minuto, útil para validar técnicas de KD sin infraestructura grande.
- Benchmark de serialización modular: sirve para evaluar el formato `attention_only_fp16` de NeuralOps y su shim de carga remota frente al checkpoint completo de BERT-Base (~450 MB).
- Pruebas de integración en pipelines de Hugging Face: validar `trust_remote_code` y la carga de pesos parciales en entornos CI antes de adoptar el formato en otros modelos del zoo.
- Docencia y divulgación: ejemplo didáctico de sustitución de atención cuadrática por alternativas lineales con métricas honestas (incluida la caída de rendimiento).
- Prototipado de clasificadores de sentimiento de bajo coste: solo si se acepta una precisión cercana al azar; útil como baseline negativo o para depurar pipelines antes de cambiar a un modelo afinado real.
- Comparación de huella de memoria: medir el ahorro de descarga (~55 MB frente a ~450 MB) en entornos con ancho de banda limitado.

## Benchmarks y rendimiento

Evaluación reportada por el autor sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Estudiante post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 51,38 % | 51,38 % | +0,00 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,7238 | convergida |

Datos de entrenamiento reportados: 132 pasos, 53,9 s, 20.065,3 tokens/s, pico de VRAM 23.021 MB en RTX 3090. No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo completo en FP16 ocupa aproximadamente 220 MB (110 M parámetros × 2 bytes) más overhead de activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100; también funciona en GPUs de gama baja (GTX 1650, RTX 3050) por su tamaño reducido.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también en CPU para inferencia puntual.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato modular de pesos parciales complica estos backends).
- Latencia y throughput: no se reportan cifras de inferencia; el dato de 20.065,3 tokens/s corresponde al entrenamiento, no a serving.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-gated-hybrid-kernel-attention-sst2` | 110 M (base) + atención destilada | no disponible | 51,38 % | MIT | Hugging Face (85 descargas) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (reportado aquí) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | ~91 % (referencia pública habitual) | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 | ~92 % (referencia pública habitual) | Apache 2.0 | Hugging Face |

La comparativa muestra que el checkpoint de NeuralOps no es competitivo en precisión frente a alternativas afinadas estándar, pero su interés es arquitectónico (atención subcuadrática) y de formato (pesos modulares de 55 MB).

## Limitaciones y advertencias

- Rendimiento muy bajo: 51,38 % de accuracy en una tarea binaria equivale prácticamente a clasificación aleatoria; no es apto para uso en producción.
- La destilación no mejora la precisión (delta 0,00 %), lo que sugiere un ajuste insuficiente o un problema en el protocolo; el autor lo etiqueta explícitamente como "Subquadratic Probe".
- Sesgos: al derivar de `bert-base-uncased` y entrenarse solo en SST-2, hereda los sesgos del corpus de reseñas de cine en inglés.
- Riesgo de alucinación: no aplica generación de texto, pero la calibración es dudosa (entropía cruzada post-KD de 0,7238 frente a 0,2428 del profesor).
- Idioma: solo inglés; no se ha validado en otros idiomas.
- Contexto: no se confirma experimentalmente el comportamiento a secuencias largas pese a la motivación subcuadrática.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0 y el código remoto (`trust_remote_code=True`) debe auditarse antes de ejecutarlo en producción.
- Dependencia del shim remoto y de la librería NeuralOps: sin ella, la carga estándar de Transformers puede fallar o requerir versiones específicas.
- Repositorio con 0 likes y 85 descargas: sin validación comunitaria ni mantenimiento demostrado.
- El identificador del autor en la model card (`tahamajs`) no coincide con el del repositorio (`Hooshaai`); conviene verificar la procedencia antes de confiar en los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-gated-hybrid-kernel-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/glue/viewer/sst2
