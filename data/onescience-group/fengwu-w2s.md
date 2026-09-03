# OneScience-Group/FengWu-W2S

## Resumen

FengWu-W2S (FengWu Weather-to-Subseasonal) es un modelo de aprendizaje profundo para pronóstico meteorológico global de subestacional, desarrollado por OneScience-Group. Extiende el modelo FengWu y está diseñado para realizar predicciones autoregresivas de hasta 42 días con un paso de tiempo de seis horas, acoplando ramas atmosféricas, oceánicas y terrestres, además de incorporar perturbaciones de diversidad para mejorar la habilidad de pronóstico en rangos extendidos.

El modelo se basa en la metodología descrita en el artículo "FengWu-W2S: A deep learning model for seamless weather-to-subseasonal forecast of global atmosphere" (arXiv:2411.10191). Este repositorio en HuggingFace contiene una implementación compacta de las interfaces acopladas para reproducir el flujo de trabajo, aunque se indica explícitamente que es una reproducción independiente del método del paper y no representa el código, pesos ni resultados oficiales de los autores.

La relevancia actual radica en la necesidad de mejorar los pronósticos meteorológicos a escalas de tiempo subestacionales (más allá de los 10-15 días), donde los modelos numéricos tradicionales pierden precisión. Este modelo propone un enfoque de acoplamiento atmósfera-océano-tierra con aprendizaje profundo, ofreciendo una implementación reproducible para investigación y validación. No se especifican en la información disponible el tamaño de parámetros, la arquitectura interna detallada ni los resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de deep learning con ramas acopladas atmósfera-océano-tierra) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se especifica si es MoE) |
| Longitud de contexto | No aplica (modelo de pronóstico meteorológico, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (aunque los datos son numéricos, la documentación está en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (se menciona un directorio `weight/` que se subirá próximamente) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna (por ejemplo, si es un transformer, una red convolucional o un modelo híbrido). Se sabe que el modelo utiliza un paso de tiempo de seis horas y realiza pronósticos autoregresivos de hasta 42 días. Incorpora ramas acopladas para atmósfera, océano y tierra, y emplea perturbaciones de diversidad para mejorar la habilidad de pronóstico en rangos extendidos. El entrenamiento se realiza con datos ERA5, que incluyen 78 canales de variables atmosféricas, oceánicas y terrestres con espaciado temporal de seis horas. No se mencionan técnicas como RLHF o DPO (no aplican a este tipo de modelo).

El repositorio incluye scripts para entrenamiento, fine-tuning, inferencia y evaluación. El entrenamiento soporta multi-GPU mediante `torchrun` con PyTorch DistributedDataParallel. Se proporciona un script para generar datos sintéticos de prueba (`fake_data.py`) que permiten validar el flujo de trabajo en grids pequeños, aunque se advierte que estos datos no representan la calidad de ERA5 ni los resultados del paper.

## Capacidades

- Pronóstico meteorológico global de subestacional: genera predicciones de variables atmosféricas, oceánicas y terrestres con resolución temporal de 6 horas, hasta 42 días.
- Acoplamiento atmósfera-océano-tierra: integra variables de los tres dominios en un único modelo, lo que permite capturar interacciones relevantes para pronósticos extendidos.
- Perturbaciones de diversidad: permite muestreo estocástico (`--stochastic`) para generar múltiples escenarios de pronóstico.
- Entrenamiento y fine-tuning: scripts incluidos para entrenar desde cero o reanudar desde un checkpoint con tasa de aprendizaje reducida.
- Evaluación de habilidad: cálculo de RMSE, RMSE normalizado y anomalía de correlación de anomalías (ACC) por canal, así como generación de figuras de comparación y evolución de pérdida.
- Reproducibilidad: implementación compacta de las interfaces acopladas para verificación de flujo de trabajo.

## Casos de uso

- Investigación en pronóstico subestacional: el modelo permite experimentar con acoplamiento atmósfera-océano-tierra y perturbaciones de diversidad para estudiar su impacto en la habilidad de pronóstico a 42 días. Los scripts de evaluación generan métricas por canal y figuras de comparación, facilitando el análisis.
- Validación local de flujo de trabajo: con datos sintéticos de pequeño grid (por ejemplo, `--height 32 --width 64`), se puede verificar rápidamente que el entrenamiento, la inferencia y la visualización funcionan antes de lanzar experimentos completos.
- Entrenamiento distribuido multi-GPU: mediante `torchrun` se puede escalar el entrenamiento a múltiples GPUs, adecuado para entornos de investigación con clústeres.
- Fine-tuning del modelo base: permite adaptar el modelo a conjuntos de datos específicos o regiones de interés, reanudando desde el checkpoint guardado con una tasa de aprendizaje menor.
- Generación de pronósticos operativos (experimental): aunque no es un sistema oficial, el script de inferencia puede producir pronósticos agrupados por año de inicialización, útiles para pruebas de concepto en servicios meteorológicos.
- Evaluación comparativa de métricas: el script `result.py` calcula RMSE, RMSE normalizado y ACC, lo que permite comparar el rendimiento del modelo con otros enfoques en términos objetivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K (no aplicables a un modelo de pronóstico meteorológico) ni tampoco resultados de validación del modelo (por ejemplo, RMSE o ACC en ERA5). El repositorio menciona que los pesos se subirán pronto, por lo que aún no es posible evaluar el rendimiento real.

## Requisitos de hardware

- Se recomienda una GPU o DCU (unidad de cómputo profundo, típicamente de fabricantes chinos como Hygon). La CPU puede usarse para importar el modelo y verificar la conectividad a pequeña escala, pero el entrenamiento e inferencia completos serán lentos.
- No se especifican requisitos de VRAM ni modelos concretos de GPU. Dado que el modelo trabaja con grids de 721x1440 (resolución completa de ERA5), se espera que el entrenamiento requiera GPUs de alta memoria (por ejemplo, A100 o H100), pero no hay datos confirmados.
- Para usuarios de DCU, se requiere instalar DTK (versión 25.04.2 o superior).
- Opciones de despliegue: el repositorio proporciona scripts de entrenamiento e inferencia con PyTorch. No se mencionan herramientas como vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se mencionan alternativas como Pangu-Weather, GraphCast, FourCastNet u otros modelos de pronóstico meteorológico con IA. Por tanto, no es posible realizar una comparativa objetiva.

## Limitaciones y advertencias

- Es una reproducción independiente del método del paper, no el código oficial ni los pesos originales de los autores. Esto puede implicar diferencias en el rendimiento o en la implementación.
- Los pesos del modelo aún no están disponibles (se indica que se subirán próximamente). Hasta entonces, no se puede utilizar el modelo preentrenado para pronósticos reales.
- Los datos sintéticos generados con `fake_data.py` son solo para validación del flujo de trabajo y no representan la reanálisis ERA5 ni la calidad del pronóstico del paper.
- No se especifican sesgos conocidos ni riesgos de alucinación (al ser un modelo de datos numéricos, estos conceptos no aplican de la misma manera que en modelos de lenguaje).
- El modelo requiere datos de entrada con los 78 canales especificados en `conf/config.yaml`; usar datos incompletos puede provocar errores.
- Licencia Apache-2.0 permite uso comercial, pero al ser una reproducción independiente, es recomendable revisar las condiciones del paper original y posibles patentes.
- La documentación está solo en inglés.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/FengWu-W2S
- Paper: https://arxiv.org/abs/2411.10191
- Repositorio principal OneScience (GitHub): https://github.com/onescience-ai/OneScience
- Repositorio de habilidades OneScience (GitHub): https://github.com/onescience-ai/oneskills
- Repositorio principal OneScience (Gitee): https://gitee.com/onescience-ai/onescience
- Repositorio de habilidades OneScience (Gitee): https://gitee.com/onescience-ai/oneskills
