# SimulatedScience/gpt2-igsm-med

## Resumen

El modelo `gpt2-igsm-med` es un modelo de lenguaje basado en la arquitectura GPT-2, entrenado específicamente para resolver problemas matemáticos del conjunto de datos iGSM-med. Desarrollado por SimulatedScience (Sebastian jost), este modelo se presenta como un trabajo de investigación centrado en el razonamiento matemático y el análisis de interpretabilidad mediante "v-probes" (sondas de valor). El repositorio incluye tres ejecuciones de entrenamiento distintas, de las cuales solo la tercera (`model/20260730`) se considera correcta y utilizable.

El modelo se enmarca dentro de una línea de investigación sobre la capacidad de los modelos transformer para resolver problemas matemáticos de dificultad media. La relevancia de este modelo reside en su naturaleza experimental: documenta fallos y correcciones en el pipeline de entrenamiento, lo que lo convierte en un recurso valioso para estudiar cómo afectan los datos de entrenamiento al rendimiento final. El repositorio incluye 17,4 GB de datos, incluyendo checkpoints intermedios y sondas de interpretabilidad, lo que lo hace adecuado para investigación académica, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer) |
| Parametros totales | no disponible (estimable en ~117M-120M según dataset) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors y checkpoints (pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder-only estándar. El entrenamiento se realizó sobre el dataset iGSM-med, que contiene 120 millones de problemas matemáticos de dificultad media (operaciones de 1 a 15). El proceso de entrenamiento se dividió en tres ejecuciones:

- `model/20260708`: entrenado sobre un dataset que resultó estar ordenado por dificultad, lo que degradó gravemente el rendimiento final. Este dataset solo contenía problemas de 1 a 14 operaciones.
- `model/20260724`: entrenado sobre un dataset corregido y completamente mezclado, pero debido a un error de carga solo se entrenó sobre el primer tercio del dataset, durante ~2.5 épocas en lugar de 1.
- `model/20260730`: entrenado correctamente sobre el dataset corregido iGSM-med-120M, durante 100k pasos.

El modelo incluye además "v-probes" (sondas de valor) para interpretar el modelo final y un control con un modelo sin entrenar. Estas sondas se utilizan para analizar cómo el modelo representa el valor de los problemas matemáticos internamente.

## Capacidades

- Generación de texto: el modelo puede generar texto en formato de problemas y respuestas matemáticas, aunque su uso principal es el razonamiento matemático.
- Razonamiento matemático: está especializado en resolver problemas de aritmética de dificultad media (operaciones de 1 a 15 pasos).
- Interpretabilidad: incluye v-probes para estudiar la representación interna del valor del problema.
- Entrenamiento experimental: el repositorio permite estudiar el impacto de los datos de entrenamiento en el rendimiento final.
- No se han documentado capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en interpretabilidad de modelos: las v-probes incluidas permiten analizar cómo el modelo representa el valor del problema internamente, útil para estudios de mecanismos internos en transformers.
- Estudio del impacto de los datos de entrenamiento: las tres ejecuciones con errores distintos permiten comparar cómo la ordenación de los datos o la submuestra afectan al rendimiento final.
- Benchmark de razonamiento matemático: el modelo puede utilizarse como referencia para evaluar la capacidad de modelos más grandes en tareas de aritmética de paso medio.
- Análisis de fallos de entrenamiento: el repositorio documenta errores comunes en pipelines de entrenamiento (datos ordenados, errores de carga), lo que sirve como material didáctico.
- Exploración de representaciones internas: los checkpoints intermedios (30k, 70k, 80k, 90k pasos) permiten estudiar la evolución de las representaciones durante el entrenamiento.
- Desarrollo de sondas de interpretación: la metodología de v-probes puede replicarse en otros modelos para estudiar la codificación de variables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de rendimiento comparativas (MMLU, HumanEval, GSM8K, etc.) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud; el modelo base GPT-2 de ~117M parámetros requiere aproximadamente 1-2 GB de VRAM en FP16, pero el repositorio incluye múltiples checkpoints y sondas que suman 17,4 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia. Para entrenar desde cero se recomienda una GPU con al menos 12 GB de VRAM (RTX 3060 o superior).
- Modelo de ejecución: el modelo puede ejecutarse con librerías estándar de HuggingFace (transformers, PyTorch). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se han publicado datos. En una GPU moderna, la inferencia de un modelo de 117M params es casi instantánea (menos de 50 ms por token).

## Comparativa con modelos similares

| Modelo | Params | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| GPT-2 (original) | 117M | 1024 | Diverso (WebText) | MIT |
| gpt2-igsm-med | ~117M | no disponible | iGSM-med (120M problemas) | no disponible |
| Gemma-2 2B | 2B | 8192 | Multilingüe | Gemma license |

No se dispone de comparativa directa con otros modelos especializados en matemáticas de paso medio, ya que no se han publicado benchmarks. La comparativa con GPT-2 original es la más directa, pues comparten arquitectura.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente en problemas matemáticos sintéticos, por lo que no tiene capacidad de generalización a otros dominios.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas plausibles pero incorrectas en problemas fuera de su distribución de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no se ha especificado, pero al ser GPT-2 probablemente esté limitada a 1024 tokens.
- Restricciones de licencia: no se ha especificado la licencia, lo que impide su uso comercial sin consultar al autor.
- Limitaciones de producción: el modelo es experimental y no está pensado para producción. Las dos primeras ejecuciones tienen errores conocidos de entrenamiento.
- Limitaciones de datos: el dataset de entrenamiento solo cubre problemas con operaciones de 1 a 15 pasos, por lo que no generaliza a problemas más complejos.

## Enlaces

- HuggingFace: https://huggingface.co/SimulatedScience/gpt2-igsm-med
- Dataset iGSM-med-120M: https://huggingface.co/datasets/SimulatedScience/igsm-med-120Mproblems
- Dataset iGSM-117M (con errores): https://huggingface.co/datasets/SimulatedScience/igsm-117Mproblems
- Perfil del autor: https://huggingface.co/SimulatedScience
