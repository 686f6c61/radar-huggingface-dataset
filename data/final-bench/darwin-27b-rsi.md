# FINAL-Bench/Darwin-27B-RSI

## Resumen

Darwin-27B-RSI es un modelo de lenguaje de 27B parámetros desarrollado por FINAL-Bench, derivado de Darwin-27B-Opus mediante un proceso de mejora recursiva autoinducida (Recursive Self-Improvement, RSI). La propuesta central es que el modelo mejora sus propios pesos aprendiendo exclusivamente de soluciones que él mismo genera, sin trazas de razonamiento ni respuestas escritas por humanos; la corrección se verifica de forma automática mediante acuerdo entre muestras propias y ejecución de código. Esto lo distingue del RSI a nivel de harness, que optimiza prompts y herramientas alrededor de un modelo fijo.

El modelo se construye sobre la familia Qwen3.5, con arquitectura transformer densa de 26.895.998.464 parámetros y modo thinking. Su relevancia actual radica en que demuestra empíricamente el bucle de auto-mejora sobre un modelo de tamano medio: reporta una ganancia de +5,24 puntos en GPQA Diamond (muestra única) y +3,79 puntos con majority@16, con significación estadística en pruebas pareadas, y un control de contaminación que declara cero solapamiento entre problemas de entrenamiento y conjuntos de evaluación.

El modelo se publica bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con transformers, lo que facilita su despliegue en infraestructura estándar. Los idiomas declarados son inglés, coreano y multilingüe. El procedimiento de entrenamiento no se ha liberado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, `qwen3_5_text`) con modo thinking |
| Parametros totales | 26.895.998.464 (≈27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés, coreano, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3.5, con 26,9B parámetros y soporte de modo thinking (cadena de razonamiento explícita). El modelo parte de Darwin-27B-Opus y se somete a un ciclo de Recursive Self-Improvement a nivel de modelo: el propio modelo resuelve problemas, juzga sus salidas y aprende de las soluciones que produce. La señal de corrección es automática, basada en el acuerdo entre muestras generadas por el propio modelo y en la ejecución de código, sin anotación humana.

Según la model card, no se utilizaron soluciones ni trazas de razonamiento escritas por humanos (0 elementos), y los problemas de entrenamiento no comparten ningún ítem con los conjuntos de evaluación reportados. El procedimiento de entrenamiento no se ha publicado, por lo que no se dispone de datos sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO. Cada modelo mejorado sirve como punto de partida del siguiente ciclo.

## Capacidades

- Generación de texto y razonamiento de nivel graduado en ciencia (GPQA Diamond, SuperGPQA).
- Modo thinking con cadenas de razonamiento explícitas (chain-of-thought).
- Razonamiento matemático (GSM8K) y lógico (BBH, CLadder).
- Razonamiento sobre código y ejecución (CRUXEval).
- Conocimiento general avanzado (MMLU-Pro).
- Capacidades multilingües: inglés, coreano y cobertura multilingüe declarada.
- Uso como motor de razonamiento dentro de sistemas de decisión tipada (Darwin-27B-JEV, Decision Index).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo thinking y el uso como motor de decisión sugieren razonamiento multi-paso, pero no se documenta soporte de agentes.

## Casos de uso

- Razonamiento científico de nivel graduado: el modelo puede responder preguntas de física, química y biología avanzadas con modo thinking, adecuado por su mejora medida en GPQA Diamond (78,09 en muestra única) y SuperGPQA.
- Motor de razonamiento en pipelines de decisión: integrado como componente de Darwin-27B-JEV, eleva la habilidad en decisiones difíciles (GPQA 0,31 → 0,71; MMLU-Pro 0,60 → 0,82), por lo que sirve para sistemas que requieren decisiones tipadas y verificables.
- Resolución de problemas matemáticos: con GSM8K en 0,97 dentro del Decision Index, es adecuado para tutoría automática, verificación de ejercicios y generación de soluciones paso a paso.
- Análisis y razonamiento sobre código: CRUXEval en 0,87 permite usarlo para evaluar fragmentos de código, predecir salidas de funciones y asistir en revisión de parches.
- Razonamiento lógico y contrafactual: BBH (0,83) y CLadder (0,70) lo hacen útil para tareas de inferencia formal, preguntas causales y validación de argumentos en documentación técnica.
- Evaluación y anotación asistida de alta calidad: al no depender de etiquetas humanas y verificar por acuerdo entre muestras, puede emplearse para generar y autovalidar conjuntos de datos de razonamiento en dominios científicos.
- Asistencia conversacional técnica multilingüe: con soporte de inglés, coreano y multilingüe, encaja en atención técnica y documentación para equipos con esos idiomas.

## Benchmarks y rendimiento

Resultados reportados en la model card, medidos con protocolo idéntico para ambos modelos (muestra única, mismos ajustes de muestreo y presupuesto de tokens):

| Benchmark | Darwin-27B-Opus | Darwin-27B-RSI | Δ |
|---|---|---|---|
| GPQA Diamond (1 muestra) | 72,85 | 78,09 | +5,24 |
| GPQA Diamond (majority@16) | 79,80 | 83,59 | +3,79 |
| SuperGPQA (1 muestra) | no disponible | no disponible | +4,03 |

Decision Index (puntuación corregida por azar: 0 = aleatorio, 1 = perfecto), con Darwin-27B-RSI como motor de razonamiento de Darwin-27B-JEV:

| Benchmark (skill) | Antes | Con Darwin-27B-RSI |
|---|---|---|
| GPQA Diamond ★ | 0,31 | 0,71 |
| GSM8K | 0,61 | 0,97 |
| CRUXEval | 0,61 | 0,87 |
| MMLU-Pro ★ | 0,60 | 0,82 |
| BBH ★ | 0,68 | 0,83 |
| CLadder | 0,49 | 0,70 |

★ = benchmark gold (ponderado 1,2× en el board). Darwin-27B-JEV obtiene ≈61,1 bajo las reglas del board v0.2.1 (recálculo propio del autor). No se han publicado resultados de MMLU, HumanEval ni otros benchmarks fuera de los indicados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,9B parámetros en BF16 se requieren aproximadamente 54 GB solo para pesos, más memoria para KV cache y activaciones; en FP8/INT8 bajaría a unos 27 GB y en cuantizaciones de 4 bits a unos 14-15 GB (estimaciones a partir del número de parámetros; no publicadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para BF16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantización de 8 bits.
- GPU de consumo: en 4 bits podría caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con contexto limitado; no hay datos publicados de ejecución en estas GPU.
- Opciones de despliegue: transformers (librería declarada) y endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Darwin-27B-RSI | 26,9B denso | no disponible | Apache 2.0 | Hugging Face (303 descargas, 50 likes) | GPQA Diamond 78,09 (1 muestra) |
| Darwin-27B-Opus | ≈27B denso | no disponible | Apache 2.0 | Hugging Face | Modelo padre; GPQA Diamond 72,85 (1 muestra) |
| Darwin-31B-Opus | ≈31B | no disponible | no disponible | Hugging Face | Variante mayor de la familia Darwin |
| Darwin-9B-Opus | ≈9B | no disponible | no disponible | Hugging Face | Variante menor de la familia Darwin |

No se dispone de datos de benchmarks de los modelos comparables distintos del padre, por lo que la comparación de rendimiento se limita a la tabla de la sección anterior.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse solo con sus propias soluciones, puede heredar y amplificar sesgos presentes en el modelo padre.
- Riesgo de alucinación: no cuantificado; el modo thinking no garantiza corrección factual y la verificación automática durante el entrenamiento se basa en acuerdo entre muestras, que puede reforzar errores consistentes.
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que impide planificar cargas de trabajo con documentos largos.
- Idiomas: cobertura declarada de inglés, coreano y multilingüe, sin datos de rendimiento por idioma; el castellano no está listado explícitamente.
- Licencia: Apache 2.0 permite uso comercial, pero el procedimiento de entrenamiento no se ha liberado, lo que limita la reproducibilidad y la auditoría del bucle RSI.
- Caveat de producción: los resultados se reportan con protocolo propio del autor (muestra única y majority@16); las cifras del Decision Index son un recálculo del propio autor bajo reglas del board v0.2.1 y no una evaluación independiente.
- Contaminación: el autor declara cero solapamiento entre entrenamiento y evaluación, pero no hay verificación externa publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-27B-RSI
- Modelo padre Darwin-27B-Opus: https://huggingface.co/FINAL-Bench/Darwin-27B-Opus
- Darwin-31B-Opus: https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
- Darwin-9B-Opus: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- Colección de la familia Darwin: https://huggingface.co/collections/FINAL-Bench/darwin-family
- Organización FINAL-Bench: https://huggingface.co/FINAL-Bench
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Dataset del run completo (121K decisiones): https://huggingface.co/datasets/FINAL-Bench/Darwin-27B-JEV-decision-index
- Sitio del autor: https://vidraft.net
- RRSI de Google Research (RSI a nivel de harness): https://github.com/google-research/rrsi
