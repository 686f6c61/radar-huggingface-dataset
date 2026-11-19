# ikimyaii/OPT-125M-unstructured-SparseGPT-80pct

## Resumen

OPT-125M-unstructured-SparseGPT-80pct es una versión podada del modelo facebook/opt-125m, un transformer decoder-only de 125 millones de parámetros desarrollado originalmente por Meta. La poda se ha realizado con el código oficial de SparseGPT (IST-DASLab) en modo one-shot, sin reentrenamiento posterior, aplicando una dispersión no estructurada del 80 % a todas las capas lineales internas de los bloques. Las embeddings y la lm_head permanecen densas.

El modelo lo publica el usuario ikimyaii en Hugging Face como baseline para sus modelos EHWS (presumiblemente una familia propia de experimentos de poda). Su interés es puramente de investigación: sirve para medir el coste en calidad de una poda agresiva sin ajuste fino y para comparar contra métodos de poda posteriores. No es un modelo pensado para producción ni para uso general.

La relevancia es metodológica: documenta con precisión el protocolo de calibración (128 secuencias de C4 de 2.048 tokens, semilla 0, blocksize 128, damping 0,01), el tiempo de poda (0,4 minutos en una A100 de 40 GB) y los resultados de perplejidad y precisión zero-shot. Los números son muy pobres en comparación con el modelo base, lo que ilustra el límite práctico de la poda no estructurada al 80 % sin recuperación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OPT, facebook/opt-125m) |
| Parámetros totales | 125.239.296 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base OPT-125M soporta 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor podó en float16) |
| Idiomas soportados | no disponible (el modelo base OPT está entrenado principalmente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OPT-125M: un transformer decoder-only con atención multi-cabeza estándar, 12 capas, dimensión oculta de 768 y 12 cabezas de atención. Sobre esta arquitectura se ha aplicado una poda no estructurada del 80 % en todas las capas lineales dentro de los bloques (72 capas podadas según la model card), manteniendo embeddings y lm_head densas. La máscara de poda utiliza un umbral por bloque de 128 columnas, de modo que las filas resultantes tienen distinto número de no-ceros: la fila más densa tiene de media 2,10 veces los no-ceros de la fila media, y la peor capa alcanza 4,71 veces.

El proceso de poda es one-shot, sin reentrenamiento ni ajuste fino. Se ejecutó con el código oficial de SparseGPT (commit 147d215, variante `fasterprune`, blocksize 128, damping 0,01), calibrando con 128 secuencias de C4 de 2.048 tokens y semilla 0. Los bloques se podan en orden, y cada bloque se calibra sobre las salidas de los bloques ya podados anteriores. El recorrido de capas es código nuevo del autor (los drivers oficiales solo cubren OPT y LLaMA), pero la matemática de poda es la oficial. Los pesos se podaron en float16 y el proceso completo tardó 0,4 minutos en una A100 de 40 GB.

## Capacidades

- Generación de texto autoregresiva básica, heredada de OPT-125M, aunque severamente degradada por la poda.
- Razonamiento y conocimiento factual muy limitados: la precisión zero-shot media es de 0,3312, con tareas como openbookqa en 0,1360 y arc_easy en 0,2984.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el modelo base está orientado al inglés.
- No dispone de modo thinking, visión ni audio.
- Sirve como baseline de investigación para comparar métodos de poda, no como modelo funcional.

## Casos de uso

- Baseline de investigación en poda: sirve para medir la pérdida de calidad de SparseGPT al 80 % sin reentrenamiento frente a métodos con recuperación, usando la perplejidad en WikiText-2 (2002,65) y C4 (1116,32) como referencia.
- Estudio de dispersión no estructurada: permite analizar el desequilibrio de no-ceros por fila (2,10x de media, 4,71x en la peor capa) y su relación con el rendimiento.
- Reproducibilidad de experimentos: el protocolo de calibración está documentado con precisión (128 secuencias C4, 2.048 tokens, semilla 0, blocksize 128, damping 0,01), lo que facilita replicar el pipeline.
- Comparación de drivers de poda: el autor señala que el recorrido de capas es código nuevo porque los drivers oficiales solo cubren OPT y LLaMA; el modelo sirve para validar esa implementación.
- Docencia sobre límites de la poda: ilustra de forma cuantitativa por qué la poda agresiva sin ajuste fino no es viable para despliegue real.
- Pruebas de carga con transformers: al cargarse con `AutoModelForCausalLM.from_pretrained(...)` en transformers estándar, sirve para validar pipelines de evaluación que aceptan modelos podados.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, fp16):

| Conjunto | Perplejidad |
|---|---|
| WikiText-2 | 2002,65 |
| C4 | 1116,32 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Precisión |
|---|---|
| arc_challenge | 0,1962 |
| arc_easy | 0,2984 |
| boolq | 0,3820 |
| hellaswag | 0,2621 |
| openbookqa | 0,1360 |
| rte | 0,5379 |
| winogrande | 0,5059 |
| Media | 0,3312 |

Dispersión medida sobre los pesos: 0,8000 en las capas podadas. No se han publicado en la información disponible resultados del modelo base OPT-125M para comparar directamente en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,3 GB en safetensors; en fp16 los pesos ocupan aproximadamente 0,25 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para el proceso de poda el autor usó una A100 de 40 GB (0,4 minutos), pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para pruebas.
- Opciones de despliegue: transformers estándar mediante `AutoModelForCausalLM.from_pretrained(...)`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al ser pesos densos en safetensors con máscara implícita (ceros en los pesos) no se beneficia de kernels de dispersión.
- Latencia y throughput: no disponibles en la información proporcionada; al no haber kernels de dispersión, el coste computacional es similar al de un modelo denso de 125M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPT-125M-unstructured-SparseGPT-80pct | 125,2M (80 % disperso) | no disponible | Perplejidad WikiText-2 2002,65; media zero-shot 0,3312 | no disponible | Hugging Face |
| facebook/opt-125m (base) | 125,2M | 2.048 tokens | No disponible en esta ficha | Licencia OPT | Hugging Face |
| Otros modelos podados de la familia EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks del modelo base en la información proporcionada, por lo que la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad de 2002,65 en WikiText-2 y precisión zero-shot media de 0,3312, con tareas como openbookqa en 0,1360. No es apto para uso en producción.
- Poda sin reentrenamiento: no hay recuperación de calidad tras la poda one-shot, lo que explica los malos resultados.
- Desequilibrio de dispersión: las filas no tienen el mismo número de no-ceros (2,10x de media, 4,71x en la peor capa), lo que puede producir comportamiento irregular entre capas.
- Licencia no disponible: no se puede confirmar si permite uso comercial; debe consultarse la licencia del modelo base facebook/opt-125m.
- Idiomas no documentados: el modelo base está orientado al inglés y no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinación elevado por la degradación del modelo; no debe usarse para generación factual.
- Sin soporte documentado de tool calling, agentes ni modos especiales.
- El autor lo presenta explícitamente como baseline para sus modelos EHWS, no como modelo final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/OPT-125M-unstructured-SparseGPT-80pct
- Modelo base: https://huggingface.co/facebook/opt-125m
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
