# ikimyaii/HGRN-1.3B-unstructured-SparseGPT-80pct

## Resumen

HGRN-1.3B-unstructured-SparseGPT-80pct es una versión podada del modelo `fla-hub/hgrn-1.3B-100B`, publicado por el usuario `ikimyaii` en Hugging Face. Se trata de un ejercicio de investigación sobre poda (pruning) no estructurada one-shot aplicada con el código oficial de SparseGPT, sin reentrenamiento posterior. El modelo base emplea la arquitectura HGRN (Hierarchically Gated Recurrent Network), una familia de modelos recurrentes lineales implementada en la librería `flash-linear-attention`.

El modelo conserva 1.364.396.032 parámetros en formato safetensors (2,7 GB), pero el 80% de los pesos de las capas lineales internas de los bloques están a cero. Las capas de embeddings y `lm_head` permanecen densas. El resultado es un modelo de referencia (baseline) para comparar con otras técnicas de poda, no un modelo pensado para uso en producción.

Su relevancia es metodológica: documenta con precisión el coste en calidad de aplicar SparseGPT al 80% de sparsity sobre una arquitectura HGRN, sirviendo como punto de comparación para investigaciones posteriores sobre poda selectiva o estructurada. Los resultados muestran un deterioro severo de la perplejidad, lo que evidencia que la poda no estructurada agresiva sin reentrenamiento no es viable para este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), recurrente lineal |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `fla-hub/hgrn-1.3B-100B` emplea la arquitectura HGRN, un modelo recurrente lineal con compuertas jerárquicas que sustituye la atención cuadrática de los transformers por una recurrencia de coste lineal en la longitud de secuencia. La implementación requiere la librería `flash-linear-attention` (`import fla`) para cargarse con `AutoModelForCausalLM.from_pretrained(...)`.

Sobre este modelo base se aplicó poda no estructurada one-shot con el código oficial de SparseGPT (commit `147d215`, modo `fasterprune`, blocksize 128, damping 0,01). La calibración usó 128 secuencias de C4 de 2.048 tokens con semilla 0. Los bloques se podaron en orden, calibrando cada bloque sobre las salidas de los bloques ya podados. Los pesos se podaron en bfloat16 y el proceso completo tardó 3,6 minutos en una A100 de 40 GB. El umbral de poda es único por bloque de 128 columnas, por lo que las filas resultantes tienen distinto número de elementos no nulos. La sparsity medida sobre las capas podadas es exactamente 0,8000, pero las filas no están equilibradas: en las 168 capas podadas, la fila más densa tiene de media 2,64 veces los no nulos de la fila media (peor capa: 4,88 veces). No hubo reentrenamiento ni ajuste fino posterior a la poda.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base, aunque severamente degradada por la poda.
- Razonamiento y respuesta a preguntas en inglés (tareas evaluadas: arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte, winogrande).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre poda no estructurada: sirve como baseline reproducible para comparar el impacto de SparseGPT al 80% frente a otras técnicas de poda sobre arquitecturas recurrentes lineales.
- Estudio de degradación de perplejidad: permite analizar la relación entre sparsity y colapso de la perplejidad en modelos HGRN, con datos de WikiText-2 y C4.
- Análisis de desequilibrio de filas tras poda por bloques: la distribución no uniforme de no nulos por fila (hasta 4,88 veces la media) es un caso de estudio para investigar técnicas de rebalanceo.
- Reproducción de experimentos: el pipeline documentado (calibración C4, bloques de 128, damping 0,01) permite replicar el resultado en una sola A100 de 40 GB en menos de 4 minutos.
- Comparación de metodologías de poda: útil para contrastar SparseGPT con las variantes EHWS del mismo autor.
- Docencia y divulgación: ejemplo concreto de por qué la poda agresiva sin reentrenamiento destruye la calidad de un modelo de lenguaje.

## Benchmarks y rendimiento

Perplejidad (protocolo de evaluación de ELSA, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 11,81 | 16,09 |
| Este modelo | 6070,28 | 3248,27 |

Precisión zero-shot (lm-evaluation-harness):

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,2227 |
| arc_easy | 0,5644 | 0,2799 |
| boolq | 0,5758 | 0,4774 |
| hellaswag | 0,3828 | 0,2593 |
| openbookqa | 0,2300 | 0,1400 |
| rte | 0,5379 | 0,5343 |
| winogrande | 0,5288 | 0,4854 |
| Media | 0,4376 | 0,3427 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,7 GB de pesos más memoria de activaciones y caché; en la práctica, entre 4 y 8 GB según longitud de secuencia y batch.
- GPU recomendadas: A100 40 GB (usada para la poda), H100, o cualquier GPU con al menos 8 GB de VRAM para inferencia en precisión nativa.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: requiere `flash-linear-attention` instalado; la carga estándar es vía `AutoModelForCausalLM.from_pretrained`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La poda no estructurada no reduce el coste computacional en hardware denso, ya que los ceros no se aprovechan sin kernels específicos de sparsity.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (HGRN-1.3B podado 80%) | 1,36 B | no disponible | no disponible | Hugging Face | Baseline de poda SparseGPT |
| fla-hub/hgrn-1.3B-100B (denso) | 1,3 B aprox. | no disponible | no disponible | Hugging Face | Modelo base sin podar; perplejidad WikiText-2 11,81 |
| Variantes EHWS del mismo autor | no disponible | no disponible | no disponible | Hugging Face (cuenta ikimyaii) | Alternativas de poda mencionadas en la model card |

## Limitaciones y advertencias

- Calidad severamente degradada: la perplejidad en WikiText-2 pasa de 11,81 a 6070,28 y en C4 de 16,09 a 3248,27, lo que indica un colapso práctico del modelado del lenguaje.
- Precisión zero-shot muy inferior al modelo denso: media de 0,3427 frente a 0,4376, con caídas notables en arc_easy (0,5644 a 0,2799) y hellaswag (0,3828 a 0,2593).
- Desequilibrio de filas: la poda por bloques de 128 columnas produce filas con distinto número de no nulos (hasta 4,88 veces la media en la peor capa), lo que puede introducir sesgos estructurales.
- Licencia no disponible: no se puede confirmar el uso comercial; debe consultarse la licencia del modelo base `fla-hub/hgrn-1.3B-100B`.
- Idiomas no documentados: no hay información sobre cobertura multilingüe.
- Riesgo de alucinación elevado: con una perplejidad de miles, la generación de texto es esencialmente inutilizable para tareas reales.
- Sin reentrenamiento: no se aplicó recuperación de calidad, por lo que el modelo no debe usarse en producción.
- Dependencia de `flash-linear-attention`: la carga requiere esta librería, lo que limita la portabilidad a stacks de despliegue estándar.
- Sin soporte documentado de tool calling, agentes ni cuantización.

## Enlaces

- Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-unstructured-SparseGPT-80pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Código oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Librería flash-linear-attention: no disponible enlace directo en la información proporcionada
- Paper de SparseGPT: no disponible enlace en la información proporcionada
- Paper de HGRN: no disponible enlace en la información proporcionada
