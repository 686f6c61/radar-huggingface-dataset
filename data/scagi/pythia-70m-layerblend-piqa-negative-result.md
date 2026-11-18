# ScAGI/pythia-70m-layerblend-piqa-negative-result

## Resumen

`ScAGI/pythia-70m-layerblend-piqa-negative-result` es un artefacto de investigación publicado por el usuario ScAGI que documenta un experimento de edición de pesos sobre el modelo base `EleutherAI/pythia-70m`. No se trata de un modelo mejorado ni de un reemplazo recomendado: el autor lo etiqueta explícitamente como *negative result* (resultado negativo). El experimento consistió en mezclar los pesos originales con una variante cuyos bloques de capas 2 y 3 están intercambiados, aplicando una interpolación del 95% de pesos originales y 5% de la copia modificada.

El modelo conserva la arquitectura GPT-NeoX de Pythia-70M, con 70.426.624 parámetros y entrenado originalmente por EleutherAI sobre el corpus The Pile. La relevancia de esta ficha no reside en una capacidad nueva del modelo, sino en su valor metodológico: documenta de forma rigurosa cómo una ganancia aparente en un conjunto de calibración (256 ejemplos) no se generaliza a un conjunto held-out de 1.838 ejemplos, con una degradación de −0,4897 pp en precisión bruta y −0,9249 pp en precisión normalizada.

El resultado sirve como advertencia sobre los peligros de seleccionar ediciones de pesos basándose en conjuntos de calibración pequeños y sobre la necesidad de usar umbrales de incertidumbre más estrictos y donantes alineados en representación antes de validar contra un conjunto no visto. Para cualquier uso práctico se debe emplear el modelo original `EleutherAI/pythia-70m`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 70.426.624 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Pythia-70M usa 2.048 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Modelo base | EleutherAI/pythia-70m (commit a39f36b100fe8a5377810d56c3f4789b9c53ac42) |
| Tamano del repositorio | 0,3 GB |
| Herramienta de edicion | MergeKit (rama research/raw-layer-remapping) |
| Tipo de artefacto | Resultado negativo de investigacion |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-NeoX, un transformer decoder-only con atención causal estándar, heredada íntegramente de `EleutherAI/pythia-70m`. No se realizó ningún entrenamiento nuevo: el artefacto es el resultado de una transformación de pesos mediante MergeKit. Concretamente, el candidato seleccionado mezcla un 95% de los pesos originales con un 5% de una copia cuyos bloques de capas 2 y 3 están intercambiados (layer swap), una operación de remapeo de capas que preserva la compatibilidad de formas.

La selección del candidato se hizo sobre un conjunto de calibración de 256 ejemplos de PIQA, donde el modelo editado obtuvo 59,3750% de precisión normalizada frente al 58,9844% del baseline, una ganancia de +0,3906 pp que correspondía a un único ejemplo adicional acertado. El autor documenta que este candidato ganó por un desempate preregistrado de orden de candidatos tras empatar con otro. La evaluación held-out sobre 1.838 ejemplos mostró una regresión de −0,4897 pp en precisión bruta y −0,9249 pp en precisión normalizada, con 24 victorias y 41 derrotas en decisiones normalizadas pareadas. El intervalo de confianza bootstrap al 95% para la diferencia fue de −1,7954 a −0,0544 pp, aunque el autor advierte que ignora la correlación entre fuente y tema y no permite establecer una degradación universal.

La reproducibilidad está documentada con detalle: se verificaron los 16 hashes de los archivos de caché originales, los 76 tensores del checkpoint exportado coinciden exactamente con una reconstrucción fresca de la transformación MergeKit seleccionada, y los logits recargados coinciden exactamente en una entrada de prueba. El entorno de ejecución fue Torch 2.10.0+cpu, Transformers 4.57.6, safetensors 0.7.0 y NumPy 2.2.6, en CPU con FP32, lo que difiere del harness GPU original de Pythia y explica la diferencia de +0,3808 pp en precisión bruta y +0,0544 pp en normalizada respecto al baseline reproducido.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Pythia-70M.
- Razonamiento básico de sentido común limitado por el tamaño del modelo (70M parámetros).
- No se ha añadido ninguna capacidad nueva respecto al modelo original.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.
- El artefacto está pensado como evidencia metodológica, no como modelo de propósito general.

## Casos de uso

- Investigación sobre edición de pesos: el artefacto sirve como referencia reproducible de un experimento de layer blending con resultado negativo, útil para estudiar metodologías de selección de candidatos y validación held-out.
- Estudio de sobreajuste a conjuntos de calibración: permite ilustrar cómo una ganancia de un solo ejemplo en 256 muestras no se generaliza, y sirve como caso de estudio en cursos o papers sobre evaluación rigurosa de modelos.
- Reproducción de experimentos con MergeKit: el código y los datos están publicados en el repositorio de GitHub del autor, lo que permite replicar la transformación y verificar los hashes y tensores.
- Auditoría de artefactos de Hugging Face: útil para practicar la verificación de integridad de checkpoints (comparación de hashes, reconstrucción de tensores, comprobación de logits).
- Docencia sobre resultados negativos: ejemplo concreto de cómo documentar un fracaso experimental con intervalos de confianza, decisiones pareadas y trazabilidad completa.
- Benchmarking metodológico de harnesses: la discrepancia entre el baseline reproducido en CPU FP32 y el reportado originalmente en GPU permite estudiar el impacto del entorno de evaluación en las métricas de PIQA.
- No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna tarea de propósito general; para esos casos debe usarse `EleutherAI/pythia-70m`.

## Benchmarks y rendimiento

| Metrica | Baseline intacto | Edicion seleccionada | Diferencia |
|---|---:|---:|---:|
| Precision normalizada en calibracion (256) | 58,9844% | 59,3750% | +0,3906 pp |
| Precision bruta held-out (1.838) | 59,8477% | 59,3580% | −0,4897 pp |
| Precision normalizada held-out (1.838) | 59,1948% | 58,2699% | −0,9249 pp |

| Metrica adicional | Valor |
|---|---|
| Decisiones normalizadas pareadas (victorias / derrotas) | 24 / 41 |
| Intervalo bootstrap 95% para la diferencia | −1,7954 a −0,0544 pp |
| Precision bruta reportada en el release original | 59,4668% |
| Precision normalizada reportada en el release original | 59,1404% |
| Diferencia del baseline reproducido vs. release (bruta) | +0,3808 pp |
| Diferencia del baseline reproducido vs. release (normalizada) | +0,0544 pp |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,28 GB solo para pesos (70,4M parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en FP16/BF16: aproximadamente 0,14 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650, RTX 3050 o superior; también en CPU.
- GPU recomendadas: ninguna en particular por su reducido tamaño; cualquier GPU con al menos 1 GB de VRAM es suficiente.
- Opciones de despliegue: transformers (verificado con Transformers 4.57.6), text-generation-inference (según tags), endpoints compatibles; llama.cpp y Ollama no están documentados en la información disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El autor ejecutó la evaluación en CPU con Torch 2.10.0+cpu y FP32, lo que confirma que el modelo es viable sin GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---:|---|---|---|---|
| ScAGI/pythia-70m-layerblend-piqa-negative-result | 70,4M | No disponible | Apache-2.0 | Artefacto de investigacion, resultado negativo | Regresion held-out documentada |
| EleutherAI/pythia-70m | 70,4M | 2.048 tokens (segun modelo base) | Apache-2.0 | Modelo base publicado | Recomendado para uso general |
| EleutherAI/pythia-160m | 160M | 2.048 tokens (segun familia Pythia) | Apache-2.0 | Modelo base publicado | Mayor capacidad, misma familia |
| Modelos de ~70M de otras familias (p. ej., GPT-2 small de 124M) | 124M | 1.024 tokens | MIT (GPT-2) | Modelo base publicado | Alternativa de tamano similar |

La comparativa se limita a la familia Pythia y a modelos de escala similar; no se dispone de datos de benchmarks comparables para este artefacto más allá de PIQA.

## Limitaciones y advertencias

- El propio autor declara que el modelo no es una mejora y que regresó en el conjunto held-out de PIQA; no debe usarse como reemplazo del original.
- No se realizó ningún entrenamiento; es una edición de pesos, no un fine-tuning.
- El intervalo de confianza bootstrap ignora la correlación entre fuente y tema, por lo que no permite afirmar una degradación universal.
- El conjunto de calibración de 256 ejemplos es demasiado pequeño para seleccionar ediciones de pesos de forma fiable; el autor recomienda usar datos de calibración mayores y umbrales de incertidumbre más estrictos en futuras ejecuciones.
- El dataset de evaluación ya ha sido observado; no puede presentarse como confirmación fresca tras ajustes posteriores.
- Hereda los sesgos y limitaciones del modelo base Pythia-70M, entrenado sobre The Pile, con sesgos documentados en la literatura.
- Riesgo de alucinación inherente a un modelo de 70M parámetros con conocimiento factual muy limitado.
- Capacidad multilingüe restringida al inglés.
- La licencia Apache-2.0 permite uso comercial, pero el artefacto no está pensado para producción y su uso comercial no aporta ninguna ventaja sobre el modelo base.
- El código de MergeKit utilizado está bajo LGPL-3.0-only, lo que puede afectar a la redistribución de derivados del código, no de los pesos.
- La compatibilidad con versiones actuales de Transformers no está certificada: el autor solo verificó el funcionamiento con Transformers 4.57.6, aunque el metadata upstream solicite versiones más recientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ScAGI/pythia-70m-layerblend-piqa-negative-result
- Modelo base: https://huggingface.co/EleutherAI/pythia-70m
- Commit del modelo base: https://huggingface.co/EleutherAI/pythia-70m/tree/a39f36b100fe8a5377810d56c3f4789b9c53ac42
- Model card original de Pythia-70M: https://huggingface.co/EleutherAI/pythia-70m/blob/main/README.md
- Codigo y reproducibilidad (rama de MergeKit): https://github.com/Marxist-Leninist/mergekit/tree/research/raw-layer-remapping/experiments/pythia70m-piqa
- Repositorio MergeKit: https://github.com/arcee-ai/mergekit
