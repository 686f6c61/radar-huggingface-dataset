# ikimyaii/Mamba-370M-semi-structured-SparseGPT-90pct

## Resumen

Mamba-370M-semi-structured-SparseGPT-90pct es un modelo derivado de `state-spaces/mamba-370m-hf` al que se le ha aplicado una poda one-shot (sin reentrenamiento) hasta una dispersión semi-estructurada del 90 % mediante una variante de SparseGPT con restricción por fila. Lo publica el usuario `ikimyaii` como baseline para su familia de modelos EHWS (Equal-Nonzero-Weight-per-Row Sparsity). No es un modelo nuevo entrenado desde cero, sino un artefacto de investigación que demuestra el efecto de la poda agresiva sobre una arquitectura de espacio de estados (SSM).

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo con complejidad lineal en la longitud de secuencia, en su variante de 370M parámetros publicada por el equipo de state-spaces. El checkpoint resultante conserva 423.003.136 parámetros reales en safetensors (incluyendo embeddings y lm_head densos) y ocupa 0,8 GB en el repositorio. El modelo está pensado como referencia negativa o de comparación: sus métricas de perplejidad son extremadamente altas (3023,83 en WikiText-2 y 1646,96 en C4), lo que refleja que la poda al 90 % sin recuperación degrada severamente la calidad del modelo.

Su relevancia es metodológica: documenta con precisión el procedimiento de poda (calibración con 128 secuencias de C4 de 2048 tokens, semilla 0, poda bloque a bloque en orden, pesos en bfloat16, 3 minutos en una A100 de 40 GB) y proporciona números de referencia para quienes investigan compresión de SSM. No es un modelo para uso en producción ni para tareas generativas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parametros totales | 423.003.136 (safetensors); modelo base de 370M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor indica que Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersion medida | 0,8824 en las capas podadas |
| Tamano del repositorio | 0,8 GB |
| Modelo base | state-spaces/mamba-370m-hf |

## Arquitectura y entrenamiento

La arquitectura es Mamba, un modelo de espacio de estados selectivo que sustituye la atención por una recurrencia con parámetros dependientes de la entrada, lo que le confiere complejidad lineal en la longitud de secuencia. El checkpoint base es `state-spaces/mamba-370m-hf`, la versión de 370M parámetros adaptada a la interfaz de Hugging Face (`AutoModelForCausalLM`). Este modelo derivado no ha sido reentrenado: es el resultado de aplicar una poda one-shot sobre el modelo base.

El método de poda es una variante del SparseGPT oficial implementada con `fasterprune`, con un cambio en la máscara: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de sus entradas de menor magnitud según la regla `w^2 / [H^-1]_jj^2` (la regla N:M de SparseGPT con M igual al tamaño del bloque). Esto impone que cada fila tenga el mismo número de no-ceros, la misma restricción que los modelos EHWS. Se podan todas las capas lineales internas de los bloques (`in_proj`, `x_proj`, `out_proj`); `dt_proj` se mantiene densa (aproximadamente el 2 % de los pesos lineales de cada bloque), igual que `conv1d`, `A_log` y `D`. Embeddings y lm_head permanecen densos. La calibración usa el cargador oficial con 128 secuencias de C4 de 2048 tokens, semilla 0, y los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados. La poda se realizó en bfloat16 y tardó 3,0 minutos en una A100 de 40 GB.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Mamba-370M, aunque severamente degradada por la poda al 90 %.
- Razonamiento y respuesta a preguntas de opción múltiple: las métricas zero-shot muestran un rendimiento cercano al azar o por debajo en varias tareas (arc_easy 0,2656, hellaswag 0,2612, openbookqa 0,1240).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No dispone de modo thinking, visión ni audio.
- Sirve como artefacto de referencia para investigación en compresión y dispersión de SSM.

## Casos de uso

- Baseline de investigación en poda de SSM: sirve como punto de comparación para medir la eficacia de métodos de poda alternativos (como los modelos EHWS del mismo autor) sobre la misma arquitectura y el mismo protocolo de calibración.
- Estudio de la degradación por dispersión extrema: permite analizar cómo afecta una dispersión semi-estructurada del 90 % a la perplejidad y a las tareas zero-shot en un modelo de espacio de estados, frente a arquitecturas transformer.
- Validación de pipelines de poda: el modelo documenta el uso de `fasterprune` con un recorrido de capas nuevo para Mamba (los drivers oficiales solo soportan OPT y LLaMA), útil para quienes adaptan herramientas de poda a arquitecturas no transformer.
- Reproducción de experimentos: con los datos de calibración, semilla y tiempos publicados, un investigador puede reproducir el artefacto y verificar la dispersión medida de 0,8824.
- Evaluación de protocolos de perplejidad: el autor usa el protocolo de ELSA (conjuntos de test WikiText-2 y C4 y su fórmula) en bfloat16, lo que sirve para comparar metodologías de evaluación en modelos podados.
- Docencia sobre compresión de modelos: ejemplo concreto y medible de los límites de la poda one-shot sin reentrenamiento en arquitecturas SSM.

## Benchmarks y rendimiento

Perplejidad (protocolo de ELSA, en bfloat16):

| Conjunto | Perplejidad |
|---|---|
| WikiText-2 | 3023,83 |
| C4 | 1646,96 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,2039 |
| arc_easy | 0,2656 |
| boolq | 0,3783 |
| hellaswag | 0,2612 |
| openbookqa | 0,1240 |
| rte | 0,5271 |
| winogrande | 0,4917 |
| Media | 0,3217 |

No se han publicado en la información disponible resultados del modelo base sin podar para comparar directamente en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 0,8 GB en bfloat16; en la práctica se puede cargar en GPUs con 2-4 GB de VRAM, aunque no se han publicado mediciones concretas.
- GPU recomendadas: el autor usó una A100 de 40 GB para la poda (3,0 minutos), pero la inferencia del modelo resultante cabe en GPUs consumer.
- Cabe en GPU consumer: sí, por tamaño (423M parámetros en bfloat16); no se especifican modelos concretos.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(...)`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que Mamba desborda en fp16, por lo que debe usarse bfloat16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Este modelo (Mamba-370M podado 90 %) | 423M | no disponible | no disponible | Artefacto de investigación, perplejidad 3023,83 en WikiText-2 |
| state-spaces/mamba-370m-hf (base) | 370M | no disponible | no disponible | Modelo base sin podar; métricas no incluidas en la información |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Referenciados como comparación en la model card, sin datos en la información proporcionada |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas de otros autores en la misma categoría.

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad de 3023,83 en WikiText-2 y 1646,96 en C4, con precisión media zero-shot de 0,3217; no es apto para uso generativo real.
- Poda one-shot sin reentrenamiento: no hay recuperación de calidad tras la poda.
- Riesgo de alucinación muy elevado por la degradación del modelo; las salidas no son fiables.
- Licencia no disponible: no se puede confirmar el uso comercial; el modelo base tiene su propia licencia que debe consultarse.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible en la información proporcionada.
- Mamba desborda en fp16; debe usarse bfloat16 para evitar problemas numéricos.
- La dispersión medida (0,8824) difiere ligeramente del 90 % nominal porque algunos pesos conservados son exactamente cero.
- Repositorio sin descargas ni likes en el momento de la consulta; sin comunidad de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-SparseGPT-90pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
