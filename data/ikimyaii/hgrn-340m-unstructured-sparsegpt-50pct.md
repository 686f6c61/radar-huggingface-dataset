# ikimyaii/HGRN-340M-unstructured-SparseGPT-50pct

## Resumen

HGRN-340M-unstructured-SparseGPT-50pct es una versión podada del modelo base m-a-p/340M-20B-HGRN-pure-baseline, un transformer con capas HGRN (Hierarchically Gated Recurrent Network) de 341.148.672 parámetros entrenado sobre 20.000 millones de tokens. El autor del checkpoint (ikimyaii) aplica poda no estructurada one-shot al 50% de dispersión mediante el código oficial de SparseGPT, sin reentrenamiento posterior. El resultado es un modelo de investigación que sirve como baseline para comparar técnicas de poda más avanzadas (los modelos EHWS del mismo autor).

La relevancia de esta ficha es metodológica: documenta el coste real de aplicar SparseGPT a una arquitectura híbrida recurrente como HGRN, midiendo la degradación en perplejidad y en tareas zero-shot. La poda se aplica a todas las capas lineales internas de los bloques (168 capas), mientras que los embeddings y la cabeza de lenguaje permanecen densos. El checkpoint se distribuye en safetensors (0,7 GB) y requiere la librería `flash-linear-attention` para cargarse.

No hay información publicada sobre licencia, idiomas soportados ni pipeline de uso, y el modelo no registra descargas ni interacciones en Hugging Face en la fecha de creación del repositorio (19 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas HGRN (Hierarchically Gated Recurrent Network); poda no estructurada one-shot con SparseGPT |
| Parametros totales | 341.148.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el calibrado usa secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el checkpoint) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de 340M de parámetros con capas HGRN, una familia de redes recurrentes con compuertas jerárquicas que sustituye la atención por una recurrencia lineal, lo que reduce el coste computacional en secuencias largas. El entrenamiento del baseline cubre 20.000 millones de tokens (según el nombre del checkpoint base). Sobre ese modelo se aplica poda no estructurada one-shot con el código oficial de SparseGPT (commit 147d215, variante `fasterprune`), con bloques de 128 columnas y damping 0.01. Cada bloque se calibra sobre las salidas de los bloques ya podados anteriores, siguiendo el driver oficial, con 128 secuencias de C4 de 2.048 tokens y semilla 0.

La poda se ejecuta en bfloat16 y tarda 1,6 minutos en una única A100 de 40 GB. El umbral de poda es único por bloque de 128 columnas, de modo que las filas resultantes tienen distinto número de ceros: en las 168 capas podadas, la fila más densa tiene de media 1,38 veces los no-ceros de la fila media, y la peor capa llega a 1,65 veces. La dispersión medida sobre los pesos finales es exactamente 0,5000. No se aplica reentrenamiento ni ajuste fino posterior a la poda.

## Capacidades

- Generación de texto autoregresiva con `AutoModelForCausalLM` (requiere `import fla` y la librería `flash-linear-attention` instalada).
- Razonamiento y conocimiento factual de nivel 340M, evaluado en tareas zero-shot de lm-evaluation-harness (arc, boolq, hellaswag, openbookqa, rte, winogrande).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (el calibrado usa C4, mayoritariamente inglés).
- No dispone de modo thinking, visión ni audio.
- Modelo de referencia para investigación en poda: permite medir el impacto de SparseGPT sobre arquitecturas recurrentes lineales.

## Casos de uso

- Baseline de investigación en poda: comparar la degradación de SparseGPT al 50% con técnicas posteriores (por ejemplo, los modelos EHWS del mismo autor) sobre la misma arquitectura y el mismo protocolo de evaluación (WikiText-2 y C4 con ELSA).
- Estudio de arquitecturas HGRN: analizar cómo afecta la dispersión no estructurada a una red recurrente con compuertas jerárquicas frente a transformers con atención completa.
- Reproducibilidad de SparseGPT: el checkpoint permite verificar los resultados del paper original en una arquitectura no cubierta por los drivers oficiales (que solo soportan OPT y LLaMA).
- Experimentos de inferencia eficiente en CPU o GPU de gama baja: con 341M de parámetros y 0,7 GB en safetensors, el modelo cabe en cualquier GPU consumer, aunque la dispersión no estructurada no se traduce automáticamente en aceleración sin kernels específicos.
- Evaluación de protocolos de calibración: probar el efecto de la semilla, el número de secuencias de C4 o el blocksize sobre la perplejidad final.
- Docencia y divulgación: ejemplo mínimo y reproducible de un pipeline de poda one-shot completo, con métricas antes y después.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (baseline) | 21,96 | 21,94 |
| Este modelo (50% sparsity) | 27,51 | 25,59 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2628 | 0,2363 |
| arc_easy | 0,6153 | 0,5737 |
| boolq | 0,6028 | 0,6180 |
| hellaswag | 0,3423 | 0,3217 |
| openbookqa | 0,2380 | 0,2120 |
| rte | 0,5126 | 0,5018 |
| winogrande | 0,5059 | 0,5114 |
| Media | 0,4400 | 0,4250 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 0,7 GB de pesos más overhead de activaciones y caché; en la práctica, menos de 2 GB para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el calibrado de la poda se hizo en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `transformers` con `flash-linear-attention` instalado (requisito explícito del autor). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; la dispersión no estructurada no aporta aceleración sin kernels específicos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (HGRN-340M, 50% SparseGPT) | 341M | no disponible | no disponible | Hugging Face | Poda one-shot, sin reentrenamiento |
| m-a-p/340M-20B-HGRN-pure-baseline | 340M | no disponible | no disponible | Hugging Face | Baseline denso, 20B tokens |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Hugging Face | Referencia de comparación citada en la model card |

## Limitaciones y advertencias

- Degradación medible tras la poda: la perplejidad sube de 21,96 a 27,51 en WikiText-2 (+25,3%) y de 21,94 a 25,59 en C4 (+16,6%); la media zero-shot cae de 0,4400 a 0,4250.
- Filas desbalanceadas: el umbral por bloque de 128 columnas produce filas con distinto número de no-ceros (hasta 1,65 veces la media en la peor capa), lo que complica la implementación de kernels eficientes.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o consultar el modelo base.
- Idiomas no documentados: el calibrado usa C4, predominantemente inglés; el rendimiento en castellano no está medido.
- Riesgo de alucinación: no evaluado; un modelo de 340M con poda al 50% tiene capacidad factual limitada.
- Sesgos: no documentados.
- Dependencia de `flash-linear-attention`: sin esa librería, la carga con `AutoModelForCausalLM` falla.
- Checkpoint de investigación: 0 descargas y 0 likes en el momento de la ficha; no hay garantía de mantenimiento.
- La dispersión no estructurada no se traduce en aceleración práctica sin kernels dedicados; el checkpoint no debe presentarse como un modelo de producción.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/HGRN-340M-unstructured-SparseGPT-50pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-HGRN-pure-baseline
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Paper de SparseGPT: https://arxiv.org/abs/2301.00774
- Paper de HGRN: no disponible en la información proporcionada
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Protocolo de evaluación ELSA: no disponible en la información proporcionada
