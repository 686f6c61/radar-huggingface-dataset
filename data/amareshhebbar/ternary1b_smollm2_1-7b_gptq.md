# AmareshHebbar/Ternary1B_SmolLM2_1.7B_GPTQ

## Resumen

Ternary1B GPTQ (SmolLM2 1.7B) es una cuantizacion extrema del modelo SmolLM2-1.7B de Hugging Face, publicada por el usuario AmareshHebbar dentro de la coleccion Ternary1B. El modelo aplica GPTQ a 2 bits sobre todas las capas de atencion y feed forward, manteniendo embeddings y capas de normalizacion en 16 bits (siguiendo el esquema de BitNet). El resultado es un modelo de 1.711.376.384 parametros totales que ocupa 672 MB empaquetado, unas 4,9 veces menos que el original en bf16 (3.264 MB).

El problema que aborda es el de la compresion agresiva de modelos pequenos para despliegue en dispositivos con recursos muy limitados: telefonos y CPUs economicas. Frente al redondeo directo a 2 bits o ternario, que destruye el modelo (perplejidad de WikiText2 en el rango de 10^5 a 10^7), el GPTQ reduce el dano a una perplejidad de 2538,19, todavia muy lejos del original (8,12) pero sustancialmente mejor que el redondeo ingenuo. El modelo se distribuye con licencia Apache 2.0 y solo soporta ingles.

Es relevante ahora como experimento reproducible de cuantizacion extrema: la model card documenta el metodo, los hiperparametros de calibracion (128 x 2048 tokens, group_size 64, damp 0,01) y una comparativa contra el modelo original y contra el redondeo directo, con benchmarks de lm-evaluation-harness limitados a 1000 ejemplos por tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B), cuantizada con GPTQ |
| Parametros totales | 1.711.376.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ a 2 bits (2,5 bits por peso cuantizado); embeddings y normalizacion en 16 bits |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 expandido en la raiz del repo; `packed/quant.safetensors` y `packed/rest.safetensors` para la forma comprimida real) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-1.7B, un transformer decoder-only, y aplica cuantizacion GPTQ post-entrenamiento a 2 bits sobre todas las capas de atencion y feed forward. No hay entrenamiento adicional: cada capa se cuantiza usando una muestra pequena de texto (128 secuencias de 2048 tokens) y, tras redondear cada columna de pesos, los pesos restantes se ajustan para cancelar el error de redondeo usando informacion de segundo orden de las entradas de la capa. Los embeddings y las capas de normalizacion permanecen en 16 bits, siguiendo el esquema de BitNet. Los hiperparametros declarados son group_size 64 y damp 0,01.

El repositorio incluye dos representaciones: en la raiz, los mismos pesos expandidos a bf16 safetensors para que carguen en transformers sin codigo adicional; en `packed/`, la forma comprimida real con codigos empaquetados (4 pesos por byte a 2 bits) y sus escalas, mas `quant_config.json` describiendo el layout y `tq_runtime.py` para desempaquetar. El tamano empaquetado es de 704.904.176 bytes (672,25 MB), frente a 3.422.777.848 bytes en bf16, con 1.610.612.736 parametros cuantizados y un factor de compresion de 4,86x.

## Capacidades

- Generacion de texto en ingles, con calidad severamente degradada respecto al modelo base (ver benchmarks).
- Razonamiento y conocimiento factual muy limitados: MMLU de 24,3 y ARC-Easy de 26,9, proximos al azar en tareas de opcion multiple.
- Codigo y matematicas: sin datos especificos; las completaciones de ejemplo muestran salidas incoherentes en tareas de codigo (`def fibonacci(n):` produce `/2co"),`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Despliegue en TGI y endpoints compatibles (tag `text-generation-inference`).

## Casos de uso

- Investigacion sobre cuantizacion extrema: reproducir el pipeline GPTQ a 2 bits con los hiperparametros documentados y comparar contra el redondeo directo y el modelo original usando la misma bateria de evaluacion.
- Despliegue en telefonos y CPUs economicas: el modelo empaquetado de 672 MB cabe en dispositivos con poca memoria; la model card lo plantea explicitamente como objetivo, aunque la calidad resultante limita su uso a tareas triviales.
- Pruebas de infraestructura de inferencia: validar cargadores, rutinas de desempaquetado (`tq_runtime.load_model`) y pipelines de transformers o TGI con un modelo de pesos comprimidos.
- Generacion de texto de relleno o sintetico en entornos sin requisitos de calidad, donde el coste de memoria es la restriccion dominante.
- Estudio de la degradacion por compresion: analizar la relacion tamano-calidad con las curvas `size_vs_quality` y `benchmarks` incluidas en el repositorio.
- Benchmarking de velocidad en CPU con llama.cpp: solo el modelo ternario de la coleccion mapea exactamente a los formatos ternarios de llama.cpp; este modelo a 2 bits no se mide en CPU segun la model card.

## Benchmarks y rendimiento

Perplejidad en WikiText2 test (menor es mejor) y exactitud zero-shot de lm-evaluation-harness, limitada a 1000 ejemplos por tarea. Tamano en MB del archivo empaquetado en `packed/`.

| Modelo | Bits por peso | Tamano (MB) | Factor de reduccion | WikiText2 ppl | hellaswag | arc_easy | piqa | mmlu | Media |
|---|---|---|---|---|---|---|---|---|---|
| SmolLM2 1.7B (bf16 original) | 16,00 | 3264 | 1,0x | 8,12 | 60,8 | 73,3 | 77,8 | 48,8 | 65,2 |
| SmolLM2 1.7B (redondeo directo 2 bits) | 2,50 | 672 | 4,9x | 942140,01 | 27,7 | 27,5 | 49,3 | 24,3 | 32,2 |
| SmolLM2 1.7B (redondeo ternario directo) | 1,60 | 499 | 6,5x | 17663863,91 | 26,4 | 26,4 | 50,3 | 24,0 | 31,8 |
| Ternary1B GPTQ | 2,50 | 672 | 4,9x | 2538,19 | 30,7 | 26,9 | 52,9 | 24,3 | 33,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3,4 GB en bf16 (pesos expandidos en la raiz del repo); el modelo empaquetado ocupa 672 MB, mas el overhead de desempaquetado en memoria.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer con 4 GB o mas de VRAM puede alojar los pesos en bf16.
- Cabe en GPU consumer: si, en tarjetas con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050 y superiores). La model card orienta el modelo a telefonos y CPUs economicas.
- Opciones de despliegue: transformers (carga directa desde la raiz del repo), TGI y endpoints compatibles (tags del repositorio), y `tq_runtime.py` para cargar desde `packed/`. llama.cpp solo esta validado para el modelo ternario de la coleccion, no para este GPTQ a 2 bits.
- Latencia y throughput: no disponible. La model card indica que los modelos a 2 bits no se cronometran en CPU porque no mapean a los formatos ternarios de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / tamano | Calidad (media benchmarks) |
|---|---|---|---|---|---|
| Ternary1B GPTQ (este) | 1,71 B | no disponible | Apache 2.0 | safetensors, 672 MB empaquetado | 33,7 |
| SmolLM2 1.7B original | 1,71 B | no disponible | Apache 2.0 | safetensors bf16, 3264 MB | 65,2 |
| SmolLM2 1.7B redondeo directo 2 bits | 1,71 B | no disponible | Apache 2.0 | 672 MB | 32,2 |
| SmolLM2 1.7B redondeo ternario directo | 1,71 B | no disponible | Apache 2.0 | 499 MB | 31,8 |

## Limitaciones y advertencias

- Calidad muy degradada: perplejidad de WikiText2 de 2538,19 frente a 8,12 del original, y media de benchmarks de 33,7 frente a 65,2. Las completaciones de ejemplo son incoherentes (`Photosynthesis is the process by which ,irection; Imoft here)`).
- Riesgo elevado de alucinacion y de texto sin sentido: el modelo no es fiable para generacion factual, codigo ni matematicas.
- Solo ingles declarado; sin soporte multilingue.
- Longitud de contexto no documentada en la informacion disponible; no asumir la del modelo base sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en produccion para tareas reales.
- La raiz del repositorio contiene pesos expandidos a bf16 (3,4 GB), no la forma comprimida; para obtener el ahorro de memoria hay que usar `packed/` con `tq_runtime.py`.
- Sin validacion en llama.cpp para este modelo a 2 bits; la model card solo cronometra el modelo ternario de la coleccion.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/Ternary1B_SmolLM2_1.7B_GPTQ
- Coleccion Ternary1B: https://huggingface.co/collections/AmareshHebbar/ternary1b-6afb739a59a53e90dbdebd90
- Dataset de calibracion: https://huggingface.co/datasets/AmareshHebbar/Ternary1B_Data_SmolLM2_1.7B
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
