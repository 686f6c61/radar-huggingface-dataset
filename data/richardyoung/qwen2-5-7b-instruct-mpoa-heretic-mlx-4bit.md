# richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic-MLX-4bit

## Resumen

Qwen2.5-7B-Instruct-MPOA-heretic-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic, que a su vez es una versión de Qwen/Qwen2.5-7B-Instruct a la que se le ha eliminado el comportamiento de rechazo (refusal) mediante la técnica MPOA con la herramienta Heretic 2.0. El autor, richardyoung, publica esta variante para ejecución en Apple Silicon a través de la librería mlx-lm. La cuantización se realizó con mlx_lm.convert con 4 bits y tamaño de grupo 64 (aritmética afín).

El modelo resuelve un problema muy concreto: permitir experimentar con un transformer de 7.600 millones de parámetros cuyo mecanismo de rechazo ha sido suprimido, sobre hardware Apple (Mac con chip M-series) y con un peso de repositorio de 4,3 GB. Es relevante para investigación en seguridad de modelos, análisis de robustez de mecanismos de alineación y estudios de "abliteration", no para despliegues de producción convencionales. La model card indica explícitamente que las evaluaciones del estudio original se hicieron sobre los pesos en bf16, no sobre esta versión de 4 bits.

La arquitectura subyacente es la de Qwen2.5-7B-Instruct (transformer decoder-only denso, licencia Apache 2.0), pero la información disponible no detalla la longitud de contexto efectiva tras la cuantización ni los idiomas soportados en esta variante concreta. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), cuantizado en MLX |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4 bits afín, group size 64 (MLX); solo esta variante 4-bit publicada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7.600 millones de parámetros. Sobre él se aplicó el método MPOA (refusal removal) con Heretic 2.0, descrito en el estudio *Is Abliteration Getting Harder? Directional vs. Optimization-Based Refusal Removal Across Generations of Open-Weight LLMs* (Young, 2026, en preparación). La información disponible no especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales tras la eliminación del rechazo.

La innovación técnica de esta ficha es la cuantización: mlx_lm.convert con `--q-bits 4 --q-group-size 64` sobre mlx-lm 0.32.2, que produce pesos de 4 bits afines para inferencia en Apple Silicon. Según la model card, solo la cuantización difiere de los pesos originales; las evaluaciones del estudio se ejecutaron sobre el modelo fuente en bf16, por lo que el comportamiento de esta versión 4-bit puede diferir del reportado en el paper.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredadas de Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas de nivel medio, condicionado por el tamaño de 7B.
- Generación de código, aunque sin datos específicos de rendimiento en esta variante.
- Comportamiento de rechazo suprimido: el modelo puede cumplir solicitudes que el modelo original rechazaría.
- Capacidades multilingües heredadas del modelo base, aunque no se documentan idiomas concretos en esta ficha.
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo varía la tasa de cumplimiento de solicitudes dañinas tras eliminar el rechazo, comparando el modelo fuente en bf16 con esta versión 4-bit.
- Estudio de robustez de alineación: reproducir experimentos de "abliteration" en hardware Apple sin necesidad de GPU dedicada, gracias al formato MLX y a los 4,3 GB del repositorio.
- Evaluación de degradación por cuantización: medir la diferencia de comportamiento entre los pesos bf16 y los 4 bits en tareas de razonamiento, código y seguimiento de instrucciones.
- Prototipado local en Mac: ejecutar un modelo de 7B conversacional en un portátil con chip M-series para pruebas de prompts y flujos de generación de texto.
- Docencia y divulgación: demostrar en un entorno controlado cómo funcionan las técnicas de eliminación de rechazo y sus implicaciones éticas.
- Generación de contenido sin restricciones en entornos de investigación creativa, siempre que el uso sea lícito y esté sujeto a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones del estudio se realizaron sobre el modelo fuente en bf16 y no sobre esta conversión a 4 bits.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; MLX usa memoria unificada en Apple Silicon. El repositorio ocupa 4,3 GB, por lo que se recomienda al menos 8 GB de memoria unificada para cargar los pesos y el contexto.
- GPU recomendadas: chips Apple M1, M2, M3 o M4 con 8 GB o más de memoria unificada; se desconoce el rendimiento en GPU NVIDIA o AMD porque el formato MLX no es compatible con CUDA.
- Cabe en GPU de consumo: sí, en Mac con memoria unificada suficiente; no en GPU NVIDIA de consumo sin reconversión previa a GGUF u otro formato.
- Opciones de despliegue: mlx-lm (comando `mlx_lm.generate`), con posible integración en aplicaciones Python mediante la API de mlx-lm. No se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-MPOA-heretic-MLX-4bit | 7.615.616.512 | no disponible | 4-bit MLX | Apache 2.0 | HuggingFace, 0 descargas |
| richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic (fuente) | ~7.6B | no disponible | bf16 | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-7B-Instruct (original) | ~7.6B | no disponible | bf16 y otras | Apache 2.0 | HuggingFace, ampliamente usado |

La comparación se limita a la cadena de derivación del propio modelo, ya que la información disponible no incluye datos de rendimiento ni de contexto que permitan contrastarlo con alternativas de otros autores.

## Limitaciones y advertencias

- El comportamiento de rechazo ha sido eliminado: el modelo puede cumplir solicitudes dañinas o ilegales. La model card lo declara explícitamente para investigación en seguridad.
- Riesgo de alucinación inherente a los modelos de 7B, sin datos específicos de esta variante.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo fuente en bf16; no se han publicado evaluaciones comparativas.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Qwen2.5.
- Idiomas soportados: no documentados en esta ficha.
- Longitud de contexto efectiva: no documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso de un modelo sin rechazo en producción conlleva riesgos legales y éticos que el usuario debe evaluar.
- Formato MLX: no es portable a CUDA sin reconversión; limita el despliegue a hardware Apple.
- Repositorio sin descargas ni likes: no hay evidencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic-MLX-4bit
- Modelo fuente: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
