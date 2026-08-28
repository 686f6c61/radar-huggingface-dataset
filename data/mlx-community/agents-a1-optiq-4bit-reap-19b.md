# mlx-community/Agents-A1-OptiQ-4bit-REAP-19B

## Resumen

El modelo `mlx-community/Agents-A1-OptiQ-4bit-REAP-19B` es una versión podada y cuantizada de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) de la familia Qwen3.5, orientado a tareas de agente. El modelo original, `Agents-A1-OptiQ-4bit`, ya era una cuantización 4-bit (OptiQ) de un checkpoint MoE de 35.1B parámetros. Sobre ese checkpoint cuantizado se aplica un podado de expertos mediante la técnica REAP (Cerebras Research, ICLR 2026), eliminando la mitad de los expertos enrutados (128 de 256 por capa) sin tocar los 8 expertos activos por token. El resultado es un modelo de 18.8B parámetros que ocupa 12.3 GB en disco (frente a los 21.5 GB del padre) y requiere 14.5 GB de memoria para ejecutarse, manteniendo la misma velocidad de inferencia porque la ruta activa por token no cambia.

El modelo está pensado para ejecutarse de forma nativa en Apple Silicon mediante el framework MLX, y se distribuye con licencia Apache 2.0. No se han publicado benchmarks específicos para esta variante, aunque la receta de podado fue validada en un modelo hermano con la misma arquitectura y porcentaje de retención, mostrando una pérdida moderada en tareas de conocimiento general (MMLU -21.4) y una ligera mejora en razonamiento procedimental (GSM8K +2.6, IFEval +4.3). La divergencia KL respecto al padre sin podar es de 0.077, un valor bajo que indica que la generación apenas se ve alterada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5, con 256 expertos por capa y 128 retenidos |
| Parametros totales | 18.8B (según model card; el archivo safetensors muestra 3.8B, posiblemente solo los pesos de los expertos retenidos) |
| Parametros activos | No disponible (8 expertos activos por token, sin dato de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (OptiQ, cuantización mixta por capas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es un MoE con 256 expertos por capa, de los cuales se retienen 128 (asignación uniforme en todas las capas). El podado se realiza mediante REAP (arXiv:2510.13999), que ordena los expertos según la media condicional del producto entre el peso del router y la norma de salida del experto, calculada sobre datos de calibración. La calibración se hizo con la mezcla de seis dominios de OptiQ, usando 8 muestras. El proceso se aplica directamente sobre el checkpoint cuantizado 4-bit, sin des-cuantizar ni re-cuantizar los expertos supervivientes, que se copian bit a bit del padre. No se realizó ningún reentrenamiento ni ajuste fino posterior. El modelo no incluye el módulo MTP (Multi-Token Prediction) sidecar.

La cuantización original (OptiQ) asigna bits de forma adaptativa por capa según su sensibilidad, lo que permite mantener una precisión mayor que una cuantización uniforme al mismo tamaño. El podado se aplica sobre esa cuantización, por lo que el modelo final combina ambas técnicas de compresión.

## Capacidades

No se han documentado capacidades específicas en la model card. Dado que el modelo pertenece a la familia Qwen3.5 y está orientado a agentes (por su nombre), se espera que herede las capacidades del modelo base, como generación de texto, razonamiento, código y posiblemente tool calling, pero no hay confirmación oficial. Las capacidades observables son:

- Generación de texto y conversación multi-turno (pipeline text-generation).
- Inferencia eficiente en Apple Silicon gracias a la cuantización 4-bit y al podado de expertos.
- Mantenimiento de la velocidad de inferencia original al conservar los 8 expertos activos por token.
- Compatibilidad con el ecosistema MLX (mlx-lm, mlx-optiq).

No se dispone de información sobre soporte de vision, audio, ni modos de razonamiento especiales.

## Casos de uso

No se han documentado casos de uso específicos para esta variante. No obstante, por su naturaleza (MoE podado, cuantizado y orientado a agentes) y su bajo requisito de memoria, es plausible emplearlo en los siguientes escenarios:

- Asistentes conversacionales locales: ejecución en un Mac con Apple Silicon (M1-M5) y al menos 16 GB de RAM unificada, ofreciendo respuestas en tiempo real sin conexión.
- Prototipado de aplicaciones de agente: desarrollo de pipelines de razonamiento multi-paso donde se requiera un modelo ligero y rápido, aunque sin confirmación de soporte de tool calling.
- Generación de texto en entornos con restricciones de memoria: por ejemplo, en equipos portátiles o estaciones de trabajo con 16-32 GB de RAM, donde un modelo de 35B no cabría.
- Evaluación de técnicas de podado y cuantización: sirve como referencia para estudiar el impacto de REAP en modelos MoE cuantizados.
- Despliegue en servicios de inferencia basados en MLX: integración con `optiq serve` o `mlx_lm` para servir el modelo como endpoint local.
- Investigación académica: análisis de la relación entre compresión y rendimiento en MoE, dado que el modelo está publicado con licencia Apache 2.0 y documentación del método.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante concreta. La model card indica explícitamente que "This variant was not separately benchmarked". Sin embargo, se menciona que la receta de podado fue validada en un modelo hermano, `Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B`, con los siguientes resultados comparativos (padre sin podar → podado):

| Benchmark | Padre | Podado | Diferencia |
|---|---|---|---|
| Capability Score | 80.03 | 76.57 | -3.46 |
| MMLU | (no especificado) | (no especificado) | -21.4 |
| GSM8K | (no especificado) | (no especificado) | +2.6 |
| IFEval | (no especificado) | (no especificado) | +4.3 |
| BFCL | (no especificado) | (no especificado) | -1.0 |
| HumanEval | (no especificado) | (no especificado) | -1.3 |

Estos datos corresponden al modelo hermano, no a este checkpoint. Para este modelo solo se ha medido la divergencia KL respecto al padre sin podar, que es de 0.077, un valor bajo que indica que la generación es prácticamente indistinguible en revisión humana.

## Requisitos de hardware

- Tamaño en disco: 12.3 GB (según model card) o 13.3 GB (tamaño del repositorio en HuggingFace).
- Memoria necesaria para ejecutar: 14.5 GB (según model card).
- Plataforma: Apple Silicon (M1 a M5) con MLX. No se menciona soporte para GPU NVIDIA o AMD.
- RAM unificada recomendada: al menos 16 GB para cargar el modelo y dejar margen para el sistema y el contexto.
- Opciones de despliegue: `mlx-optiq serve`, `mlx_lm.load()` y `mlx_lm.generate()`. También es compatible con cualquier runtime que soporte checkpoints MLX.
- Latencia y throughput: no disponibles. Al mantener 8 expertos activos por token, la velocidad de inferencia es similar a la del modelo padre sin podar, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma categoría. La información disponible permite comparar esta variante con su modelo padre y con el modelo hermano que valida la receta:

| Modelo | Parámetros | Tamaño en disco | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Agents-A1-OptiQ-4bit (padre) | 35.1B | 21.5 GB | No disponible | Apache 2.0 | No benchmarkeado |
| Agents-A1-OptiQ-4bit-REAP-19B (este) | 18.8B | 12.3 GB | No disponible | Apache 2.0 | No benchmarkeado |
| Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B (hermano) | 18.8B (aprox.) | 12.3 GB (aprox.) | No disponible | Apache 2.0 | Capability Score 76.57 |

No hay datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks propios, por lo que el rendimiento real en tareas específicas es desconocido. La degradación observada en el modelo hermano sugiere que tareas de conocimiento general como MMLU pueden verse afectadas (-21.4 puntos), mientras que tareas procedimentales pueden incluso mejorar.
- La divergencia KL de 0.077 indica que la generación es muy similar al padre, pero no garantiza ausencia de alucinaciones o errores.
- No se documentan los idiomas soportados. Aunque el modelo base probablemente sea multilingüe, no hay confirmación.
- La longitud de contexto no se especifica; se desconoce si hereda la del modelo base o si el podado la modifica.
- El modelo está pensado exclusivamente para Apple Silicon mediante MLX. No hay soporte oficial para CUDA u otras plataformas.
- No se mencionan sesgos específicos, pero al ser un modelo derivado de Qwen3.5, podría heredar sesgos del entrenamiento original.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original para asegurar el cumplimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Agents-A1-OptiQ-4bit-REAP-19B
- Modelo padre: https://huggingface.co/mlx-community/Agents-A1-OptiQ-4bit
- Paper de REAP: https://arxiv.org/abs/2510.13999
- Web de mlx-optiq: https://mlx-optiq.com/
- Documentación de podado de OptiQ: https://mlx-optiq.com/docs/prune
- Catálogo de modelos OptiQ: https://mlx-optiq.com/models
