# DougDong/SICE-Foundation

## Resumen

SICE-FM (SICE-Foundation) es un modelo fundacional de estimación de costes de consultas desarrollado por DougDong. Su objetivo es predecir el tiempo de ejecución de una consulta a partir de su plan de ejecución, y hacerlo de forma transferible entre sistemas de bases de datos distintos. Está entrenado sobre planes de PostgreSQL (170.987) y DuckDB (171.000), y se evalúa en sistemas no vistos durante el entrenamiento, como Spark. El modelo combina un encoder de texto basado en `all-MiniLM-L12-v2` con adaptadores LoRA y un transformer estructural tipo PRICE, fusionando ambas representaciones en una cabeza escalar que produce una predicción normalizada. Con 61,9 millones de parámetros y un tamaño de pesos de 173 MB, es un modelo ligero pensado para investigación en optimización de consultas y transferencia entre sistemas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: encoder de texto `all-MiniLM-L12-v2` con LoRA + transformer estructural tipo PRICE (d_model 256, 8 cabezas × 32) |
| Parametros totales | 61,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo utiliza dos codificadores que procesan la misma consulta en paralelo. El primero recibe el texto limpio del plan de ejecución, es decir, la salida de `EXPLAIN` sin métricas medidas, y lo pasa por un `all-MiniLM-L12-v2` con adaptadores LoRA. El segundo recibe características estructurales de la consulta, como histogramas de join, fanout, tablas y filtros, codificadas como tokens tipados y procesadas por un transformer de tipo PRICE con `d_model` 256 y 8 cabezas de atención. Ambas salidas se fusionan en una cabeza escalar que emite un valor normalizado entre 0 y 1.

El entrenamiento se realizó durante 30 épocas con Adam (lr 1e-4), batch 24, semilla 42 y plan-dropout 0.5. Se usaron 19 bases de datos, cada una contribuyendo aproximadamente 9.000 planes por sistema, con `imdb` excluida de todos los sistemas de entrenamiento para servir como evaluación limpia. No se aplicó RLHF ni DPO. El modelo predice un escalar en espacio logarítmico; para convertir la predicción a milisegundos se aplica una transformación exponencial con constantes específicas del sistema.

## Capacidades

- Predicción del tiempo de ejecución de consultas a partir de un plan de ejecución, usando tanto el texto del plan como características estructurales.
- Transferencia entre sistemas: entrenado en PostgreSQL y DuckDB, puede aplicarse a sistemas no vistos como Spark sin reentrenamiento.
- Utiliza estadísticas de bases de datos (histogramas de join, fanout, tablas, filtros) para alimentar el encoder estructural.
- Soporta adaptación few-shot mediante un mecanismo de anchor aplicado durante la adaptación, no durante el preentrenamiento.
- No es un modelo de lenguaje generativo: no genera texto, código ni respuestas conversacionales.
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Estimación de costes en optimizadores de consultas: el modelo puede sustituir o complementar los estimadores basados en heurísticas, proporcionando predicciones de tiempo de ejecución más precisas para decidir entre planes alternativos.
- Planificación de capacidad en sistemas de bases de datos: permite anticipar el tiempo de ejecución de consultas en entornos de producción y ajustar recursos antes de que se produzcan cuellos de botella.
- Migración de cargas de trabajo entre sistemas: al estar entrenado en un sistema y aplicarse a otro, facilita evaluar el rendimiento esperado de una consulta en una base de datos distinta sin ejecutarla.
- Evaluación de índices y estructuras de datos: las predicciones de tiempo de ejecución pueden usarse para comparar el impacto de diferentes índices o particiones en una consulta concreta.
- Detección de regresiones de rendimiento: comparando predicciones del modelo con tiempos reales, se pueden identificar consultas cuyo comportamiento se desvía de lo esperado.
- Benchmarking de sistemas de bases de datos: permite generar estimaciones de rendimiento para workloads completas, como las 19 bases de datos empleadas en el entrenamiento, sin necesidad de ejecutar todas las consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta métricas específicas de estimación de costes:

| Métrica | Resultado |
|---|---|
| Mejora de mediana de q-error en workload no visto | 20–46 % mejor que la línea base |
| Degradación de p95 en sistema ya representado en entrenamiento | +35 % end-to-end en un escenario |

Estos datos provienen de la evaluación interna del autor y no se comparan con otros modelos en la información proporcionada.

## Requisitos de hardware

- No se proporcionan cifras oficiales de VRAM, pero el modelo tiene 61,9 millones de parámetros, con un tamaño de pesos de 173 MB. En FP32, la memoria necesaria ronda los 248 MB, y en FP16 unos 124 MB.
- Es viable en GPUs de consumo como RTX 3060, RTX 4090 o incluso en CPUs modernas, dado el reducido tamaño.
- No se requiere hardware de gama alta como A100 o H100 para la inferencia.
- El despliegue se realiza mediante el script `score.py` incluido en el repositorio, que usa PyTorch. No se menciona soporte para vLLM, llama.cpp ni Ollama.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de estimación de costes en la documentación proporcionada. El modelo comparte la arquitectura estructural con la familia PRICE, pero no se ofrecen datos de comparación directa. Por tanto, la comparación con alternativas se considera no disponible.

## Limitaciones y advertencias

- El rendimiento es significativamente mejor en sistemas no vistos durante el entrenamiento, pero se degrada en sistemas ya representados, especialmente en el percentil 95 de errores.
- Las predicciones dependen en gran medida de las estadísticas de la base de datos que alimentan el encoder estructural. Si no hay estadísticas disponibles, el modelo se apoya solo en el texto del plan y las predicciones no son fiables.
- La normalización de las etiquetas se limita a un rango de [0.001, 1]; las consultas con tiempos de ejecución extremadamente altos o bajos saturan la predicción.
- La licencia Apache-2.0 permite uso comercial y modificación, sin restricciones adicionales.
- No es un modelo de lenguaje: no debe utilizarse para tareas de generación de texto, resumen ni razonamiento general.
- No se han documentado sesgos específicos, pero la dependencia de los datos de entrenamiento puede introducir sesgos hacia las características de los sistemas utilizados.

## Enlaces

- HuggingFace: https://huggingface.co/DougDong/SICE-Foundation
