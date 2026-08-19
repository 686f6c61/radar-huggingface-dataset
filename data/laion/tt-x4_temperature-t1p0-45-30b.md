# laion/tt-x4_temperature-t1p0-45-30B

## Resumen

El modelo `laion/tt-x4_temperature-t1p0-45-30B` es un checkpoint intermedio de un barrido de temperaturas de rollout (X4) desarrollado por LAION. Se basa en el modelo instructivo `Qwen/Qwen3-Coder-30B-A3B-Instruct` y ha sido entrenado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO, utilizando el framework SkyRL junto con Terminus-2. El objetivo del entrenamiento es optimizar tareas de codificación multi-archivo, empleando el dataset `DCAgent/exp_rpt_multifile` y un verificador basado en `pass_ratio` shaping.

Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 30.532 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos (A3B). El checkpoint concreto (global_step_45) fue seleccionado por su mayor EMA de recompensa (trailing-5) dentro de la cadena de reinicios. La licencia es Apache-2.0, lo que facilita su uso comercial y de investigación. Su relevancia radica en ser un caso práctico de aplicación de RL para mejorar el rendimiento en generación de código, aunque su soporte lingüístico se limita al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (qwen3_moe) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible (hereda las características del modelo base Qwen3-Coder-30B-A3B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura MoE del modelo base Qwen3-Coder-30B-A3B-Instruct, que combina un transformer con capas de mezcla de expertos para activar solo 3B de sus 30,5B parámetros por token, ofreciendo un equilibrio entre rendimiento y eficiencia computacional. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) mediante SkyRL y Terminus-2, sobre el dataset `DCAgent/exp_rpt_multifile`, que se centra en la resolución de tareas de codificación que requieren modificar múltiples archivos.

El proceso de entrenamiento completó dos épocas del dataset (step 66), aunque el checkpoint exportado es el step 45, seleccionado por su mayor EMA de recompensa (0,2328) frente a otros guardados. Las métricas muestran una caída de la entropía de la política de 0,21 a 0,05, lo que indica una convergencia saludable sin runaway de entropía. El verificador de la campaña fue `pass_ratio` shaping, que premia la proporción de tests superados en las ejecuciones de rollout.

## Capacidades

- Generación de texto y código, heredadas del modelo base Qwen3-Coder-30B-A3B-Instruct.
- Optimización específica para tareas de codificación multi-archivo, gracias al entrenamiento RL sobre `exp_rpt_multifile`.
- Soporte de tool calling y function calling, característico de la familia Qwen3-Coder.
- Capacidad de razonamiento y conversación multi-turno, al ser un modelo instructivo.
- Capacidades de agente y ejecución de código, dado el entrenamiento con verificadores de paso de tests.
- Soporte multilingüe limitado: únicamente inglés, según la ficha del autor.

## Casos de uso

- Generación de código multi-archivo: el modelo está entrenado para modificar y generar código en proyectos que requieren cambios coordinados en varios ficheros, lo que lo hace adecuado para tareas de refactorización o implementación de funcionalidades complejas.
- Agentes de codificación autónomos: al haber sido optimizado con un verificador de `pass_ratio`, puede integrarse en pipelines de agentes que ejecutan tests y corrigen errores de forma iterativa.
- Asistente de programación en IDE: puede utilizarse como backend para autocompletado o generación de funciones, aunque su limitación al inglés puede restringir su uso en entornos multilingües.
- Investigación en RL para LLMs: sirve como checkpoint de referencia para estudiar el efecto de la temperatura de rollout en GRPO, ya que pertenece a un barrido sistemático (X4).
- Automatización de reportes técnicos: el dataset `exp_rpt_multifile` sugiere una orientación hacia la generación de informes o cambios técnicos, por lo que puede usarse para redactar documentación de cambios en repositorios.
- Fine-tuning posterior: al ser Apache-2.0, puede utilizarse como base para nuevos entrenamientos con datasets específicos de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona únicamente métricas de entrenamiento del checkpoint seleccionado (step 45), que se detallan a continuación:

| Metrica | Valor |
|---|---|
| Step reward | 0,2305 |
| Pass@8 | 0,375 |
| Entropy | 0,078 |
| EMA de recompensa (trailing-5) | 0,2328 |

Estos valores corresponden a la evaluación interna durante el entrenamiento, no a benchmarks externos comparativos.

## Requisitos de hardware

- El tamaño del repositorio es de 61,1 GB en formato safetensors, lo que sugiere pesos en BF16/FP16.
- Para inferencia en precisión completa (BF16/FP16), se estima una VRAM de aproximadamente 60-65 GB, lo que requiere GPUs como A100 (80GB) o H100 (80GB).
- No se especifican cuantizaciones disponibles, por lo que no se puede confirmar si cabe en GPUs de consumo como RTX 4090 (24GB) sin conversión previa a formatos como GGUF o AWQ.
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con vLLM, TGI y llama.cpp (previa conversión a GGUF). No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base, ya que no se dispone de datos de otros modelos comparables en la informacion proporcionada.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| laion/tt-x4_temperature-t1p0-45-30B | 30,5B | 3B | no disponible | Apache-2.0 | Fine-tuning RL sobre el base, orientado a multi-archivo |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5B | 3B | no disponible | Apache-2.0 | Modelo base instructivo original |

No se dispone de información sobre otros modelos de la misma categoría (por ejemplo, DeepSeek-Coder-V2-Lite) en los datos proporcionados.

## Limitaciones y advertencias

- Soporte de idiomas limitado exclusivamente al inglés, lo que restringe su uso en aplicaciones multilingües.
- No se han publicado benchmarks estándar, por lo que su rendimiento real en tareas generales de código o razonamiento no está validado externamente.
- Es un checkpoint intermedio (step 45) de un barrido de temperaturas; el checkpoint final (step 66) no fue exportado a HuggingFace, por lo que este modelo puede no representar el mejor rendimiento alcanzado en el entrenamiento.
- El entrenamiento se centró en un dataset específico (`DCAgent/exp_rpt_multifile`), lo que puede provocar una generalización limitada a otras tareas de programación fuera de ese dominio.
- Aunque la licencia del modelo es Apache-2.0, es necesario verificar la licencia del dataset base y de los datos de entrenamiento para garantizar el cumplimiento en uso comercial.
- Como todo modelo de generación de código, existe riesgo de alucinación en APIs o funciones inexistentes, y puede generar código con vulnerabilidades de seguridad si no se supervisa adecuadamente.

## Enlaces

- Modelo en HuggingFace: [laion/tt-x4_temperature-t1p0-45-30B](https://huggingface.co/laion/tt-x4_temperature-t1p0-45-30B)
- Dataset de training traces: [penfever/tt-x4_temperature-t1p0](https://huggingface.co/datasets/penfever/tt-x4_temperature-t1p0)
- Modelo base: [Qwen/Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
