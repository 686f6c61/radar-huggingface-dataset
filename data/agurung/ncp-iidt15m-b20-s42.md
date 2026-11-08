# agurung/ncp-iidt15m-b20-s42

## Resumen

`agurung/ncp-iidt15m-b20-s42` es un ajuste fino supervisado (SFT) del modelo `Qwen/Qwen3-4B-Instruct-2507`, publicado por el usuario `agurung` en Hugging Face. El modelo se ha entrenado con la librería TRL sobre el dataset `cobalt-traces-rft_ncp_iid_25`, un conjunto de trazas conversacionales orientado a experimentos de diversidad, según indican las etiquetas del repositorio. El nombre del repositorio sugiere una variante de un experimento denominado "ncp" con un identificador `iidt15m`, un tamaño de lote `b20` y una semilla `s42`, aunque la model card no documenta el significado de estos parámetros.

Se trata de un modelo de generación de texto de 4 mil millones de parámetros, heredado de la familia Qwen3, con formato de pesos safetensors y compatible con la librería transformers y con text-generation-inference. El repositorio ocupa 2,1 GB y no registra descargas ni interacciones en el momento de la consulta, lo que apunta a un artefacto de investigación más que a un modelo listo para producción.

La relevancia de esta ficha es limitada: no hay datos publicados de benchmarks, licencia ni idiomas soportados, y la model card es una plantilla autogenerada por TRL sin información sustantiva sobre el procedimiento de entrenamiento, la composición del dataset o los hiperparámetros. Cualquier evaluación seria requiere inspeccionar el dataset de entrenamiento y el run de Weights & Biases enlazado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 mil millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE segun el modelo base) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder-only de aproximadamente 4 mil millones de parámetros. No se dispone de detalles adicionales sobre la configuración de capas, cabezas de atención o mecanismos específicos (atención lineal, decodificación especulativa, etc.) en la información proporcionada.

El entrenamiento se realizó mediante SFT con TRL 1.13.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2, sobre el dataset `cobalt-traces-rft_ncp_iid_25`. Las etiquetas del repositorio incluyen `uniform`, `diversity`, `sft` y `cobalt`, lo que sugiere un experimento centrado en la diversidad de las respuestas generadas, posiblemente mediante un muestreo uniforme de trazas. No se documentan el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni los hiperparámetros utilizados. El run de Weights & Biases enlazado en la model card (`alexgurung/diversity-experiments_cobalt_qwen3_4b_ft_scripts/runs/exf5025t`) es la única fuente adicional de información sobre el proceso.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones en formato chat (la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`).
- Capacidades de código y matemáticas del modelo base, no verificadas en esta variante.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas.
- Modo "thinking": no documentado en esta variante (el modelo base Qwen3-4B-Instruct-2507 es una variante instruct sin modo thinking explícito, pero no se confirma en la información disponible).

## Casos de uso

- Experimentación académica sobre diversidad en ajuste fino: el modelo sirve como artefacto reproducible (semilla `s42`, lote `b20`) para estudiar cómo el SFT afecta a la diversidad de las respuestas, comparándolo con otras variantes del mismo autor (`ncp-iidt15-b20`, `ncp-groott15-b20-s1337`).
- Generación de respuestas conversacionales en prototipos: al estar basado en Qwen3-4B-Instruct-2507, puede emplearse en demostraciones de chatbots con la API de `transformers` y `text-generation-inference`.
- Evaluación comparativa de ajustes finos: útil como línea base en estudios que midan el efecto del dataset `cobalt-traces-rft_ncp_iid_25` frente a otros conjuntos de trazas.
- Reproducción de pipelines TRL: el repositorio documenta versiones exactas de TRL, Transformers y PyTorch, lo que facilita reproducir el entrenamiento en entornos controlados.
- Investigación sobre sesgos y alucinación en modelos pequeños: al ser un modelo de 4B, es adecuado para estudiar el comportamiento de modelos compactos tras SFT en dominios específicos.
- Despliegue en entornos con recursos limitados: con 2,1 GB de pesos en safetensors, puede cargarse en GPUs de gama media para inferencia de prueba, aunque no se han publicado métricas de latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa del modelo base de 4B en precisión FP16, se requieren aproximadamente 8-9 GB de VRAM, pero este dato no está confirmado para esta variante.
- GPU recomendadas: no disponible. Por tamaño del modelo base, cabría esperar compatibilidad con GPUs de 16 GB o más (RTX 4090, A100, H100), pero no se ha verificado.
- Compatibilidad con GPU de consumo: no confirmada. El repositorio no incluye pesos cuantizados (GGUF, AWQ, GPTQ), por lo que el despliegue en GPUs de consumo requeriría cuantización manual.
- Opciones de despliegue: transformers (confirmado por la model card) y text-generation-inference (según las etiquetas del repositorio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI más allá de la etiqueta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `agurung/ncp-iidt15m-b20-s42` | ~4B | no disponible | no disponible | Hugging Face, 0 descargas |
| `Qwen/Qwen3-4B-Instruct-2507` (modelo base) | ~4B | no disponible en la informacion | no disponible en la informacion | Hugging Face, modelo oficial |
| `agurung/ncp-iidt15-b20` | no disponible | no disponible | no disponible | Hugging Face |
| `agurung/ncp-groott15-b20-s1337` | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada por TRL: no describe el dataset, los hiperparámetros, la composición de las trazas ni los objetivos del experimento.
- No se especifica la licencia de forma clara ("licence: license" no es una licencia válida), lo que impide determinar si el uso comercial está permitido.
- No se declaran los idiomas soportados; se desconoce si el ajuste fino ha degradado el multilingüismo del modelo base.
- No hay benchmarks ni evaluaciones publicadas: se desconoce si el SFT ha mejorado o degradado las capacidades del modelo base en razonamiento, código o matemáticas.
- Riesgo de alucinación y sesgos: no evaluado en esta variante; al ser un ajuste sobre trazas sintéticas o de investigación, puede heredar sesgos del dataset `cobalt-traces-rft_ncp_iid_25`.
- El repositorio no incluye pesos cuantizados, lo que limita el despliegue en hardware de consumo sin trabajo adicional.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- El nombre del repositorio sugiere un experimento con semilla y lote concretos; no se garantiza que sea reproducible sin acceso al run de Weights & Biases y al dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/ncp-iidt15m-b20-s42
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-rft_ncp_iid_25
- Run de Weights & Biases: https://wandb.ai/alexgurung/diversity-experiments_cobalt_qwen3_4b_ft_scripts/runs/exf5025t
- Repositorio TRL: https://github.com/huggingface/trl
- Variante relacionada: https://huggingface.co/agurung/ncp-iidt15-b20
- Variante relacionada: https://huggingface.co/agurung/ncp-groott15-b20-s1337
