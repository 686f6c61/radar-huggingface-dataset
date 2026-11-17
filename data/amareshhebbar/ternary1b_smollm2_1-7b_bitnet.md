# AmareshHebbar/Ternary1B_SmolLM2_1.7B_BITNET

## Resumen

Ternary1B BITNET es una versión cuantizada a pesos ternarios (1,58 bits) del modelo SmolLM2-1.7B de Hugging Face. Lo desarrolla AmareshHebbar como parte de la colección Ternary1B, un conjunto de seis variantes que exploran distintas estrategias de compresión extrema (GPTQ, GPTQ con LoRA, BitNet, entre otras) evaluadas con los mismos tests. El objetivo es reducir un modelo de 1.700 millones de parámetros a un tamaño manejable en dispositivos móviles y CPUs de bajo coste sin que el modelo colapse, algo que la simple cuantización por redondeo no consigue.

La conversión emplea el método BitNet b1.58: cada capa lineal se transforma en una capa BitLinear cuyos pesos se escalan por su valor absoluto medio y se redondean a -1, 0 o +1, mientras las activaciones se redondean a 8 bits. Las capas de embedding y normalización permanecen en 16 bits. El resultado es un modelo de 499 MB empaquetado (6,5 veces más pequeño que el original en bf16) que mantiene un rendimiento razonable en tareas de sentido común, aunque con una degradación notable frente al modelo base.

Es relevante porque demuestra que el entrenamiento con destilación durante la cuantización ternaria permite conservar capacidades que el redondeo directo destruye por completo: el redondeo ternario simple de SmolLM2 dispara la perplejidad a más de 17 millones, mientras la variante BitNet la mantiene en 35,05.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2), con capas lineales BitLinear |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa secuencias de 1024 tokens) |
| Tipos de cuantizacion | Ternaria (1,58 bits) en pesos de atención y feed-forward; activaciones a 8 bits; embeddings y normas en 16 bits; formatos empaquetados a 2 y 3 valores por byte |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16 expandido en la raíz del repo y empaquetado en `packed/`) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-1.7B, un transformer decoder-only, y sustituye cada capa lineal de atención y feed-forward por una capa BitLinear. En ellas los pesos se escalan por su media absoluta y se redondean a valores ternarios (-1, 0, +1), mientras las activaciones se cuantizan a 8 bits. Las capas de embedding y normalización se mantienen en 16 bits, siguiendo el diseño original de BitNet. El empaquetado real almacena 5 pesos por byte para los códigos ternarios, junto con sus escalas, en `packed/quant.safetensors`, y deja embeddings y normas en `packed/rest.safetensors`.

El entrenamiento emplea un calentamiento (warmup) que mezcla progresivamente precisión completa con la representación ternaria para evitar el colapso del modelo, combinado con destilación desde el modelo original (peso de destilación 1,0, temperatura 1,0). Los hiperparámetros publicados incluyen `group_size` 64, tasa de aprendizaje 8e-05, 1.800 pasos de entrenamiento BitNet con 50 pasos de warmup, longitud de secuencia 1.024, micro-lote 2 y acumulación de gradiente 16 (lote efectivo de 32 secuencias). El dataset de entrenamiento es `AmareshHebbar/Ternary1B_Data_SmolLM2_1.7B`. No se detalla en la información disponible el número total de tokens ni la composición del corpus.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de SmolLM2-1.7B.
- Razonamiento básico y respuesta a preguntas de conocimiento general, con rendimiento degradado respecto al modelo base.
- Tareas de sentido común evaluadas en hellaswag, arc_easy y piqa.
- Ejecución en CPU y dispositivos de bajos recursos gracias a su tamaño empaquetado de 499 MB.
- Carga directa en `transformers` mediante los pesos bf16 expandidos, o construcción desde los ficheros empaquetados con `tq_runtime.load_model()`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; la model card solo declara inglés.

## Casos de uso

- Inferencia en dispositivos móviles y embebidos: el modelo empaquetado ocupa 499 MB y puede ejecutarse en teléfonos y CPUs económicos, lo que permite generar texto local sin conexión en aplicaciones de notas o asistentes básicos.
- Prototipado de investigación en cuantización extrema: sirve como referencia reproducible para comparar BitNet b1.58 frente a GPTQ o redondeo directo sobre una misma base, gracias a la colección Ternary1B y sus tests homogéneos.
- Autocompletado de texto en editores ligeros: con 1.700 millones de parámetros y pesos ternarios, puede ofrecer sugerencias de continuación en entornos con poca memoria, aceptando la pérdida de calidad frente al modelo original.
- Clasificación y puntuación de texto por perplejidad: útil para filtrar o priorizar contenidos en pipelines de datos donde el coste computacional por documento es crítico.
- Educación y demostraciones de eficiencia energética: permite ilustrar en un aula o laboratorio cómo la cuantización ternaria reduce el tamaño del modelo 6,5 veces y qué coste tiene en precisión.
- Despliegue en contenedores sin GPU: al caber en memoria de CPU y cargarse con `transformers`, se puede integrar en servicios ligeros de generación de texto donde no hay acelerador disponible.
- No es adecuado para atención al cliente, generación de código en producción ni tareas que exijan alta fidelidad factual, dado el nivel de degradación observado.

## Benchmarks y rendimiento

Resultados publicados por el autor: perplejidad en WikiText2 (menor es mejor) y precisión zero-shot de lm-evaluation-harness limitada a 1.000 ejemplos por tarea.

| Modelo | Bits/peso | Tamano (MB) | Reduccion | Perplejidad WikiText2 | hellaswag | arc_easy | piqa | mmlu | Media |
|---|---|---|---|---|---|---|---|---|---|
| SmolLM2 1.7B (bf16 original) | 16,00 | 3264 | 1,0x | 8,12 | 60,8 | 73,3 | 77,8 | 48,8 | 65,2 |
| SmolLM2 1.7B (redondeo 2 bits) | 2,50 | 672 | 4,9x | 942140,01 | 27,7 | 27,5 | 49,3 | 24,3 | 32,2 |
| SmolLM2 1.7B (redondeo ternario) | 1,60 | 499 | 6,5x | 17663863,91 | 26,4 | 26,4 | 50,3 | 24,0 | 31,8 |
| Ternary1B GPTQ | 2,50 | 672 | 4,9x | 2538,19 | 30,7 | 26,9 | 52,9 | 24,3 | 33,7 |
| Ternary1B GPTQ_LORA | 2,50 | 810 | 4,0x | 21,72 | 46,3 | 53,3 | 64,4 | 25,8 | 47,4 |
| Ternary1B BITNET | 1,60 | 499 | 6,5x | 35,05 | 40,7 | 48,1 | 63,8 | 23,1 | 43,9 |

El autor indica que la velocidad en CPU se midió con llama.cpp en el paso `cpubench`, pero no se incluyen cifras concretas de latencia o throughput en la información disponible. Solo el modelo ternario se mapea exactamente a los formatos ternarios de llama.cpp, por lo que los modelos de 2 bits no se cronometraron en CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo empaquetado ocupa 499 MB y la versión bf16 expandida unos 3,4 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4 GB de memoria puede alojar la versión bf16; la versión empaquetada requiere menos.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4 GB o más para la variante bf16, y en menos memoria si se usa el runtime empaquetado.
- Opciones de despliegue: `transformers` con `tq_runtime.patch_act_quant()` para cuantizar activaciones a 8 bits; `tq_runtime.load_model(path)` para construir desde `packed/`; llama.cpp para la variante ternaria según la nota del autor; el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla la configuración.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText2 | Media benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary1B BITNET | 1,71 B | no disponible | 35,05 | 43,9 | apache-2.0 | Hugging Face |
| Ternary1B GPTQ_LORA | 1,71 B | no disponible | 21,72 | 47,4 | apache-2.0 (misma colección) | Hugging Face |
| Ternary1B GPTQ | 1,71 B | no disponible | 2538,19 | 33,7 | apache-2.0 (misma colección) | Hugging Face |
| SmolLM2-1.7B (base) | 1,71 B | no disponible | 8,12 | 65,2 | apache-2.0 | Hugging Face |

Dentro de la propia colección, GPTQ_LORA obtiene mejor calidad (perplejidad 21,72 y media 47,4) a costa de un tamaño mayor (810 MB, 4,0x de reducción), mientras BITNET logra la mayor compresión (499 MB, 6,5x) con una calidad intermedia. El modelo base sin cuantizar sigue siendo claramente superior en todas las métricas.

## Limitaciones y advertencias

- Degradación de calidad significativa: la perplejidad sube de 8,12 a 35,05 y la media de benchmarks cae de 65,2 a 43,9 frente a SmolLM2-1.7B.
- Riesgo elevado de alucinación y coherencia deficiente: los ejemplos de la model card muestran respuestas factualmente incorrectas (por ejemplo, "The capital of France is the only country in the world that has a population of 1.5 million") y repeticiones.
- Capacidad de código muy limitada: el ejemplo de `def fibonacci(n):` no produce una implementación funcional.
- Solo inglés declarado; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada; el entrenamiento usó secuencias de 1.024 tokens, lo que sugiere un contexto efectivo limitado.
- La carga en `transformers` con los pesos bf16 expandidos no reproduce fielmente el comportamiento ternario salvo que se aplique `patch_act_quant` para cuantizar activaciones a 8 bits.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- Licencia apache-2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin evaluación previa en la tarea concreta.
- No se documentan sesgos específicos más allá de los heredados del corpus de entrenamiento de SmolLM2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/Ternary1B_SmolLM2_1.7B_BITNET
- Colección Ternary1B: https://huggingface.co/collections/AmareshHebbar/ternary1b-6afb739a59a53e90dbdebd90
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/Ternary1B_Data_SmolLM2_1.7B
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
