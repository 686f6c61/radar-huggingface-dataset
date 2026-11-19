# ikimyaii/GatedDeltaNet-340M-semi-structured-SparseGPT-90pct

## Resumen

GatedDeltaNet-340M-semi-structured-SparseGPT-90pct es una variante podada del modelo base m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de investigación sobre poda one-shot: el modelo original, un transformer híbrido con capas GatedDeltaNet, se ha llevado a un 90% de esparsidad semiestructurada sin reentrenamiento posterior, aplicando SparseGPT con una restricción por fila dentro de bloques de 128 columnas.

El resultado es un artefacto de interés metodológico más que práctico: la perplejidad se degrada de 16,42 a 2213,68 en WikiText-2 y de 19,94 a 1318,90 en C4, y la media de precisión zero-shot cae de 0,4373 a 0,3259. El autor lo presenta explícitamente como baseline para comparar con sus modelos EHWS, no como un modelo para uso en producción.

La relevancia actual reside en que documenta con números concretos cuánto castiga una poda agresiva al 90% cuando no hay recuperación posterior, y en que valida una restricción de máscara que equilibra el número de no-ceros por fila (240 capas verificadas), lo que facilita el despliegue en hardware que explota esparsidad estructurada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (capas lineales con compuerta delta), transformer híbrido |
| Parámetros totales | 399.531.200 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16 durante la poda) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Esparsidad | 90,03% medida en los pesos podados |
| Modelo base | m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Tamaño del repo | 0,8 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GatedDeltaNet del baseline de m-a-p, un diseño de atención lineal con compuertas delta que sustituye la atención cuadrática por recurrencias lineales en determinadas capas. Sobre esa base, el autor aplica una poda one-shot con SparseGPT modificado: en lugar de la regla N:M estándar, dentro de cada bloque de 128 columnas cada fila poda el mismo número de entradas de menor magnitud según la métrica w²/[H⁻¹]²ⱼⱼ, de modo que todas las filas acaban con idéntico número de no-ceros, replicando la restricción de EHWS.

El procedimiento usa el cargador oficial de SparseGPT con 128 secuencias de C4 de 2048 tokens y semilla 0. Los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados, con un recorrido de capas escrito específicamente para GatedDeltaNet (los drivers oficiales solo cubren OPT y LLaMA). La poda se ejecutó en bfloat16 y tardó 2,5 minutos en una A100 de 40 GB. Se podan todas las capas lineales dentro de los bloques; embeddings y lm_head permanecen densos. No hubo reentrenamiento ni ajuste fino posterior.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base.
- Razonamiento y respuesta a preguntas de opción múltiple, con calidad muy degradada respecto al denso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta modo thinking, visión ni audio.
- Requiere el paquete flash-linear-attention (`import fla`) para cargarse con AutoModelForCausalLM.from_pretrained.

## Casos de uso

- Investigación sobre poda one-shot: sirve como referencia cuantitativa de la degradación a 90% de esparsidad semiestructurada sin recuperación, comparable directamente con los modelos EHWS del mismo autor.
- Estudio de máscaras equilibradas por fila: al tener todas las filas el mismo número de no-ceros en las 240 capas podadas, permite medir el impacto del balanceo de trabajo en kernels de esparsidad estructurada.
- Validación de pipelines de poda: el código de recorrido de capas para GatedDeltaNet puede reutilizarse para podar otras variantes del mismo baseline.
- Benchmarking de kernels sparse: útil para probar el rendimiento real de kernels 2:4 o de bloque frente a la máscara por fila propuesta.
- Reproducibilidad metodológica: con calibración fijada (128 secuencias C4, semilla 0, bfloat16, 2,5 min en A100 40GB) permite replicar el experimento y contrastar resultados.
- Docencia y divulgación: ejemplo claro de por qué la poda agresiva sin destilación ni reentrenamiento no es viable para tareas de precisión.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Métrica | Denso | Este modelo |
|---|---|---|
| WikiText-2 (ppl) | 16,42 | 2213,68 |
| C4 (ppl) | 19,94 | 1318,90 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,2193 |
| arc_easy | 0,6023 | 0,2664 |
| boolq | 0,5985 | 0,3783 |
| hellaswag | 0,3461 | 0,2605 |
| openbookqa | 0,2300 | 0,1480 |
| rte | 0,5162 | 0,5271 |
| winogrande | 0,5036 | 0,4815 |
| Media | 0,4373 | 0,3259 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,8 GB en safetensors; con 399,5M parámetros en bfloat16 son aproximadamente 0,8 GB de pesos, más overhead de activaciones y caché.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en bfloat16; el autor usó una A100 40GB para la poda, pero la inferencia no requiere esa capacidad.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: AutoModelForCausalLM de Transformers con flash-linear-attention instalado; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Ppl WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (90% sparse) | 399,5M | no disponible | 2213,68 | no disponible | Hugging Face |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline (denso) | ~340M | no disponible | 16,42 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa con el baseline denso muestra una degradación de dos órdenes de magnitud en perplejidad y de 0,11 puntos en la media zero-shot. No se dispone de datos de otros modelos podados comparables en la información proporcionada.

## Limitaciones y advertencias

- Calidad severamente degradada: la perplejidad en WikiText-2 pasa de 16,42 a 2213,68, lo que hace el modelo inutilizable para generación de texto en producción.
- La precisión zero-shot cae en todas las tareas salvo rte (0,5162 a 0,5271), con descensos especialmente marcados en arc_easy (0,6023 a 0,2664) y boolq (0,5985 a 0,3783).
- No hubo reentrenamiento ni recuperación tras la poda, por lo que no se corrige el daño introducido.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Idiomas soportados no disponibles.
- Longitud de contexto no disponible.
- Riesgo de alucinación elevado por la degradación del modelo.
- Sesgos conocidos: no documentados, pero heredados del corpus de entrenamiento del baseline.
- Requiere flash-linear-attention para cargarse; no es compatible con cargadores estándar sin esa dependencia.
- El autor lo describe como baseline para comparación, no como modelo listo para uso.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-SparseGPT-90pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- SparseGPT (referencia metodológica): no disponible en la información proporcionada
- flash-linear-attention: no disponible en la información proporcionada
- Paper de GatedDeltaNet: no disponible en la información proporcionada
