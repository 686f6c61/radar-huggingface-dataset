# jamesdborin/glm-5.2-redhat-dspark-sglang

## Resumen

Este repositorio contiene el empaquetado para SGLang del modelo de draft (speculator) de Red Hat para GLM-5.2, un modelo auxiliar de 3.152 millones de parámetros diseñado exclusivamente para decodificación especulativa. No es un modelo generativo autónomo: su función es predecir secuencias de tokens candidatos que aceleran la inferencia del modelo principal `nvidia/GLM-5.2-NVFP4`, un MoE de 1M de contexto desarrollado por Z.ai. El autor, jamesdborin, adapta la configuración del checkpoint original `RedHatAI/GLM-5.2-speculator.dspark` para que SGLang pueda cargarlo mediante su cargador `Qwen3DSparkModel`, sin modificar los pesos. La licencia es Apache-2.0 y está validado con SGLang v0.5.17 en GPUs NVIDIA B200.

La relevancia de este modelo radica en que permite desplegar GLM-5.2 con una latencia significativamente menor en entornos de producción, aprovechando el algoritmo DSPARK (DeepSeek Sparse Attention) y la decodificación especulativa. Al ser un componente de infraestructura, su valor se mide en el rendimiento del sistema completo, no en capacidades lingüísticas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (cargador `Qwen3DSparkModel` en SGLang) |
| Parametros totales | 3.152.730.753 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo principal GLM-5.2 soporta 1M) |
| Tipos de cuantizacion | No cuantizado (se usa con precisión completa, `unquant` en el despliegue) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de aproximadamente 3,15 mil millones de parámetros, cuya arquitectura interna no está documentada en el repositorio. El tag `qwen3` y el cargador `Qwen3DSparkModel` sugieren una estructura similar a la familia Qwen3, pero no hay confirmación oficial. Se trata de un speculator entrenado para el algoritmo DSPARK, que genera múltiples tokens candidatos en paralelo para que el modelo principal los valide, reduciendo el número de pasos de decodificación autoregresiva.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El repositorio indica que los pesos son idénticos a los del checkpoint original de Red Hat (`RedHatAI/GLM-5.2-speculator.dspark`), y que solo se ha adaptado la configuración del cargador. La innovación técnica principal es la integración con SGLang, que permite usar este speculator junto al modelo cuantizado NVFP4 de NVIDIA.

## Capacidades

- Decodificación especulativa DSPARK: genera hasta 9 tokens candidatos por paso (según `--speculative-num-draft-tokens 9`) con un tamaño de bloque de 8, acelerando la inferencia del modelo principal.
- Integración nativa con SGLang v0.5.17: se lanza como servidor complementario mediante `--speculative-draft-model-path`.
- Compatibilidad con el modelo `nvidia/GLM-5.2-NVFP4` cuantizado con NVFP4, manteniendo los pesos del speculator sin cuantizar.
- No es un modelo generativo: no produce texto por sí mismo, no soporta tool calling, agentes, razonamiento ni capacidades multilingües.

## Casos de uso

- Despliegue de GLM-5.2 en producción con baja latencia: el speculator se usa junto al modelo principal para reducir el tiempo de generación en servicios de chat o agentes que requieren respuestas rápidas.
- Inferencia en GPUs de data center: el sistema completo está pensado para entornos con B200, H200 o similares, donde la decodificación especulativa amortiza el coste del modelo grande.
- Evaluación de rendimiento de SGLang: sirve como referencia para probar el algoritmo DSPARK en diferentes configuraciones de hardware y versiones de SGLang.
- Optimización de costes por token: al reducir el número de pasos autoregresivos, se disminuye el consumo energético y el tiempo de ocupación de GPU en servicios de inferencia continua.
- Investigación en decodificación especulativa: permite estudiar el impacto de distintos tamaños de bloque y número de tokens draft en la tasa de aceptación del modelo principal.
- Integración en pipelines de agentes de largo recorrido: GLM-5.2 está diseñado para tareas de larga duración (SWE-bench, Terminal-Bench); el speculator hace viable su uso en entornos con requisitos estrictos de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este speculator en la información disponible. Los benchmarks del modelo principal GLM-5.2, publicados por Z.ai, son:

| Benchmark | GLM-5.2 | GLM-5.1 |
|---|---|---|
| Terminal-Bench 2.1 | 81.0 | 63.5 |
| SWE-bench Pro | 62.1 | 58.4 |

Estos datos corresponden al modelo completo, no al speculator. No hay métricas públicas sobre la tasa de aceptación de tokens draft ni sobre la aceleración conseguida en el sistema conjunto.

## Requisitos de hardware

- El speculator ocupa aproximadamente 6,3 GB en safetensors (precisión completa). En FP16, la VRAM necesaria ronda los 6,3 GB, por lo que cabría en GPUs consumer como RTX 3090, 4090 o similares si se usara de forma aislada.
- Sin embargo, el sistema completo requiere el modelo principal `nvidia/GLM-5.2-NVFP4`, que es un MoE de gran tamaño. El comando de despliegue usa `--tp 4` (tensor parallelism sobre 4 GPUs), lo que indica que se necesitan al menos 4 GPUs de data center.
- GPUs validadas: NVIDIA B200 (según el README). La documentación de SGLang para GLM-5.2 menciona H200, B200, B300, GB300 y AMD MI300X/MI325X/MI355X.
- Opciones de despliegue: exclusivamente mediante SGLang, con el comando proporcionado en el README. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan cifras concretas. La decodificación especulativa con 9 tokens draft y bloque de 8 sugiere una reducción esperada de pasos de inferencia, pero sin datos medidos no es posible cuantificarla.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este speculator con alternativas de la misma categoría. A modo de referencia, los enfoques de decodificación especulativa más comunes son:

| Enfoque | Modelo draft | Integración | Licencia |
|---|---|---|---|
| DSPARK (este repo) | GLM-5.2 speculator 3.15B | SGLang | Apache-2.0 |
| EAGLE (de la comunidad) | Modelo auxiliar pequeño | vLLM, SGLang | Variable |
| Medusa (de la comunidad) | Cabezas de decodificación | vLLM | Apache-2.0 |

No hay datos comparativos de rendimiento entre estos métodos aplicados a GLM-5.2, por lo que la comparación queda a nivel conceptual.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo principal `nvidia/GLM-5.2-NVFP4` no produce ninguna salida útil. Intentar usarlo como generador de texto dará resultados sin sentido.
- Dependencia de SGLang: la configuración está adaptada específicamente para el cargador `Qwen3DSparkModel` de SGLang v0.5.17. Otras versiones o frameworks pueden no ser compatibles.
- Validación limitada: el README indica que fue validado únicamente en NVIDIA B200. No hay garantías de funcionamiento en otras arquitecturas.
- Riesgo de alucinación: al ser un modelo auxiliar, no se evalúan sesgos ni alucinaciones; estos dependen del modelo principal.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo principal `nvidia/GLM-5.2-NVFP4` tiene licencia MIT, lo que también es permisivo. Sin embargo, el uso combinado debe respetar ambas licencias.
- Información incompleta: no se documentan el proceso de entrenamiento, el dataset utilizado ni las métricas de rendimiento del speculator, lo que limita la reproducibilidad y la evaluación objetiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jamesdborin/glm-5.2-redhat-dspark-sglang
- Modelo original de Red Hat: https://huggingface.co/RedHatAI/GLM-5.2-speculator.dspark
- Modelo principal de NVIDIA: https://huggingface.co/nvidia/GLM-5.2-NVFP4
- Documentación de SGLang para GLM-5.2: https://docs.sglang.io/cookbook/autoregressive/GLM/GLM-5.2
- Blog de Z.ai sobre GLM-5.2: https://z.ai/blog/glm-5.2
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
