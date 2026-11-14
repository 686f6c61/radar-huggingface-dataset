# Hooshaai/bert-factorised-matrix-state-sst2

## Resumen

`Hooshaai/bert-factorised-matrix-state-sst2` es un checkpoint de BERT-Base (110M parámetros) en el que las 12 capas de atención softmax cuadrática han sido sustituidas por el mecanismo `factorised_matrix_state` de la librería NeuralOps, que promete una complejidad operativa subcuadrática (O(N) u O(N log N)) frente a la O(N²) de la multi-head attention estándar. El modelo está afinado y destilado para clasificación binaria de sentimiento en la tarea SST-2 del benchmark GLUE, en inglés, y se distribuye bajo licencia MIT.

La relevancia del checkpoint no reside en su rendimiento absoluto sino en su planteamiento de eficiencia: demuestra que es posible reconstruir un BERT funcional sustituyendo únicamente los pesos de atención mediante un protocolo de destilación offline que evita cargar el modelo profesor en VRAM (Zero Teacher VRAM allocation). El repositorio publica exclusivamente los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), inicializando el resto de pesos congelados desde `bert-base-uncased` en tiempo de carga mediante código remoto.

Los resultados empíricos son modestos: 79,82 % de accuracy en el split de validación de SST-2, frente al 91,63 % del profesor original, aunque con una mejora de +26,95 puntos respecto al estudiante sin destilar (52,87 %). Es, por tanto, una pieza de investigación sobre arquitecturas de atención eficiente más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `factorised_matrix_state` (subcuadrática) en las 12 capas |
| Parametros totales | 110M (BERT-Base); se distribuyen ~55 MB de pesos de atención y cabeza de clasificación en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, atención y cabeza de clasificación únicamente; pesos base inicializados desde `bert-base-uncased`) |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased` y reemplaza el bloque de multi-head attention cuadrática por el mecanismo `factorised_matrix_state` de NeuralOps en las 12 capas del encoder. Según la model card, este mecanismo reduce la complejidad operativa efectiva a O(N) u O(N log N) frente a la O(N²) del attention estándar. La serialización es modular: solo se publican los pesos de atención entrenados y la cabeza de clasificación, mientras que los pesos congelados del BERT base se reconstruyen en carga mediante el shim `modeling_neuralops_bert.py`.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, en dos etapas: primero una alineación de subespacio oculto (Stage 1 Subspace Hidden Alignment) y después una combinación de KL sobre logits y entropía cruzada de tarea (Stage 2 Logit KL + Task CE). La destilación se ejecutó sobre una NVIDIA GeForce RTX 3090 de 24 GB, con 118 pasos de optimización, 49 segundos de duración, throughput de 19.739,7 tokens/s y un pico de 13.512 MB de VRAM. El protocolo de caché offline de representaciones elimina la necesidad de mantener el profesor en memoria durante el entrenamiento.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, específicamente sobre la tarea SST-2 de GLUE.
- Comprensión de secuencias cortas en inglés heredada del encoder BERT-Base subyacente.
- Inferencia con atención subcuadrática, lo que en teoría reduce el coste computacional en secuencias largas frente a BERT estándar.
- Carga modular: reconstruye el modelo completo a partir de los pesos de atención publicados más los pesos congelados de `bert-base-uncased`.
- Compatible con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no (solo inglés).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en atención eficiente: sirve como referencia reproducible para comparar el mecanismo `factorised_matrix_state` con la atención softmax estándar en una tarea controlada como SST-2, con métricas y telemetría de entrenamiento publicadas.
- Análisis de sentimiento en reseñas de producto en inglés: el modelo clasifica polaridad binaria en textos cortos, adecuado para prototipos y pipelines de análisis de opinión donde el 79,82 % de accuracy sea suficiente.
- Destilación de modelos con recursos limitados: el protocolo de destilación offline con caché de representaciones permite reproducir el entrenamiento en una única GPU consumer (RTX 3090), útil como plantilla para experimentos de knowledge distillation.
- Benchmarking de sustituciones de atención: integrable en pipelines de evaluación que comparen variantes de atención (softmax, linear, factorised) sobre el mismo backbone BERT-Base.
- Docencia y experimentación académica: el tamaño reducido del artefacto (~55 MB) y la licencia MIT facilitan su uso en cursos y laboratorios sobre arquitecturas Transformer.
- Pruebas de integración de la librería NeuralOps: sirve como caso de prueba del API `load_pretrained_bert` y del cargador universal `load_surgeried_model` para validar la reconstrucción modular de pesos.
- Filtrado de toxicidad o moderación básica en inglés: con la cabeza de clasificación adaptada, podría reutilizarse como base para tareas de clasificación binaria similares, aunque requeriría reentrenamiento.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante sin destilar | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 52,87 % | 79,82 % | +26,95 % |
| Cross-entropy de validación | 0,2428 | no calibrada | 0,4853 | convergido |

Telemetría de entrenamiento (Sharif HPC Cluster, RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 49,0 s |
| Pasos de optimizacion | 118 |
| Throughput efectivo | 19.739,7 tokens/s |
| VRAM pico | 13.512 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto descargable son ~55 MB de pesos de atención en FP16, pero la inferencia requiere cargar además el BERT-Base completo (~110M parámetros, ~450 MB en FP32), por lo que el consumo real rondará los 1-2 GB en función del batch y la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP32; el entrenamiento de destilación se validó en una RTX 3090 de 24 GB.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (requiere el código remoto del repo), API `load_pretrained_bert` y `load_surgeried_model` de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican métricas de latencia de inferencia; solo el throughput de entrenamiento (19.739,7 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-factorised-matrix-state-sst2` | 110M (BERT-Base) | no disponible | 79,82 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, tras fine-tuning SST-2) | 110M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| BERT-Base estándar afinado en SST-2 (referencia de la literatura) | 110M | 512 | ~92-93 % (referencia habitual en GLUE) | Apache 2.0 | Hugging Face |
| Modelos de atención eficiente tipo Linear Transformer / Performer sobre BERT | 110M | variable | no disponible | variable | variable |

La comparación directa con alternativas de atención subcuadrática no está disponible en la información proporcionada; el propio autor solo reporta el par profesor/estudiante.

## Limitaciones y advertencias

- Rendimiento inferior al profesor: 79,82 % frente a 91,63 % de accuracy en SST-2, una caída de casi 12 puntos que lo hace inadecuado para producción sin un fine-tuning adicional o un profesor más fuerte.
- Solo clasificación binaria de sentimiento en inglés: no es un modelo generativo ni un encoder de propósito general listo para otras tareas sin reentrenamiento.
- Dependencia de código remoto: requiere `trust_remote_code=True` y la librería NeuralOps, lo que añade superficie de ataque y riesgo de rotura si el repo o la librería cambian.
- Reconstrucción en carga: los pesos base se descargan desde `bert-base-uncased`, por lo que la inferencia depende de la disponibilidad de ese repo y de la coherencia de versiones.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en dominios distintos de SST-2.
- Sesgos: no se documentan análisis de sesgo; al heredar el corpus de BERT-Base y SST-2, es probable que arrastre sesgos de género, raza y dominio presentes en esos datos.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0, cuyas condiciones también deben respetarse.
- Contexto limitado: aunque el mecanismo promete escalado subcuadrático, no se documenta una ventana de contexto superior a la de BERT-Base (512 tokens), por lo que el beneficio en secuencias largas no está validado empíricamente.
- Sin benchmarks más allá de SST-2: no hay evidencia publicada sobre MMLU, tareas de razonamiento, código ni otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-factorised-matrix-state-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
