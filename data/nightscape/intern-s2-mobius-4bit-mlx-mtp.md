# nightscape/Intern-S2-Mobius-4bit-mlx-mtp

## Resumen

Este repositorio contiene el cabezal de predicción multi-token (MTP, Multi-Token Prediction) para el modelo base `nightscape/Intern-S2-Mobius-4bit-mlx`, una conversión en cuantización de 4 bits del modelo `internlm/Intern-S2-Mobius` de 35B parámetros. No es un modelo autónomo: se trata de un componente complementario que, superpuesto sobre el repositorio base, habilita la decodificación especulativa con una aceleración de aproximadamente 1,9x sin pérdida de calidad en hardware Apple Silicon (M4 Max), según la documentación del autor.

El modelo base, desarrollado por el laboratorio InternLM, introduce la arquitectura **Mobius**, que desacopla el almacenamiento de conocimiento (capas FFN) del razonamiento (atención propia), organizando el conocimiento en una memoria global compartida que múltiples razonadores consultan y refinan de forma iterativa. Esta arquitectura permite tasas de compresión superiores y reduce la cantidad de datos de entrenamiento necesarios para adquirir conocimiento. El MTP head aquí incluido permite acelerar la inferencia del modelo base sin pérdida de calidad, aunque de forma experimental y exclusiva para el driver `interns2_mobius` de `omlx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mobius (conocimiento y razonamiento desacoplados) + MTP head |
| Parametros totales | Modelo base: 35B (bfloat16); head MTP: ~463 MB en safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Base: 4-bit; MTP gate: 8-bit |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Intern-S2-Mobius se basa en la arquitectura **Mobius-v0**, implementada con Xtuner y LMDeploy. A diferencia de los transformadores convencionales, donde el almacenamiento de conocimiento (FFN) y la computación de razonamiento (self-attention) están entrelazados capa a capa, Mobius organiza el conocimiento en una memoria global compartida y permite que múltiples razonadores consulten y refinen iterativamente los estados ocultos contra esa memoria. Según el paper del modelo, este desacoplamiento logra tasas de compresión superiores, lo que permite adquirir conocimiento suficiente con sustancialmente menos datos de entrenamiento.

El head MTP incluido en este repositorio añade una capa de predicción multi-token con `mtp_num_hidden_layers: 1`, diseñada para decodificación especulativa. La cuantización del head usa 8 bits en el gate MTP, mientras que el modelo base se mantiene en 4 bits. El entrenamiento específico del head MTP no está documentado en la información disponible; los pesos provienen del checkpoint original de `internlm/Intern-S2-Mobius`.

## Capacidades

- **Decodificación especulativa MTP**: acelera la generación de texto de forma lossless (aproximadamente 1,9x en M4 Max) mediante predicción de múltiples tokens por paso.
- **Integración exclusiva con `omlx`**: el head solo se carga con el driver `interns2_mobius` del servidor `omlx` (build `add-interns2-mobius`); el `mlx-lm` estándar no lo carga.
- **Código remoto**: requiere `--trust-remote-code` para el tokenizer `InternS1` y el código `interns2_mobius`.
- **Capacidades del modelo base**: el modelo base de 35B es un modelo de fundación para generación de texto, razonamiento, código y matemáticas, aunque el rendimiento específico en estas tareas no se detalla en la información de este repositorio.
- **Multilingüe**: los idiomas soportados no se han publicado en la información disponible.

## Casos de uso

- **Inferencia acelerada en Apple Silicon**: desplegar el modelo base de 4 bits con el head MTP en hardware M4 Max reduce el tiempo de generación en aproximadamente un factor de 1,9 sin degradar la calidad de salida, ideal para entornos de producción con restricciones de latencia.
- **Servicios de generación de texto de alto rendimiento**: al integrar el head en el servidor `omlx`, se puede servir el modelo de 35B en cuantización 4-bit a múltiples usuarios con menor latencia por petición.
- **Prototipado de decodificación especulativa**: investigadores pueden estudiar y validar la técnica MTP sobre arquitecturas Mobius usando este head como referencia de implementación.
- **Despliegue en edge computing con Apple Silicon**: el formato MLX y la cuantización 4-bit permiten ejecutar el modelo en Macs con chip M4, aprovechando el MTP para acelerar tareas de generación local.
- **Investigación sobre desacoplamiento de conocimiento y razonamiento**: el modelo base, junto con este head, sirve como plataforma para experimentar con la arquitectura Mobius y sus implicaciones en eficiencia de entrenamiento e inferencia.
- **Evaluación de calidad en generación lossless**: la característica de decodificación especulativa sin pérdida permite comparar la calidad de la salida con el modelo sin MTP, útil para auditar la integridad del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es la aceleración de decodificación MTP de aproximadamente **1,9x lossless en el hardware M4 Max**, medida por el autor del repositorio. No hay cifras de MMLU, HumanEval, GSM8K u otros benchmarks para este modelo ni para su variante con MTP.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el repositorio no especifica el consumo de memoria. El modelo base en 4-bit con MLX es de tamaño aproximado de 20-25 GB (el repo base no se duplica aquí), por lo que se recomienda hardware con al menos 32 GB de memoria unificada en Apple Silicon.
- **GPU recomendadas**: Apple Silicon con memoria unificada (M4 Max mencionado explícitamente; probablemente M3/M4 Pro o Ultra también compatibles). No se documentan GPUs NVIDIA.
- **Cabe en GPU de consumo**: sí, en Apple Silicon con suficiente memoria unificada (32 GB o más).
- **Opciones de despliegue**: `omlx` con el build `add-interns2-mobius` (driver MTP); `mlx-lm` no soporta este head.
- **Latencia y throughput**: no disponibles; solo se conoce la aceleración relativa de 1,9x en decodificación con MTP.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con modelos de la misma categoría (35B, cuantizados en 4-bit, con MTP). El modelo base `Intern-S2-Mobius` de 35B es una arquitectura novedosa sin competidores directos documentados en la información proporcionada. Se recomienda comparar con otros modelos de 35B como Llama 3.1 35B o Qwen2.5 32B, pero no hay datos de benchmarks en este repositorio para sustentar la comparación.

## Limitaciones y advertencias

- **No es un modelo autónomo**: este repositorio solo contiene el head MTP; es imprescindible descargar el repositorio base `nightscape/Intern-S2-Mobius-4bit-mlx` y superponer el head y el config.
- **MTP es experimental**: la aceleración de 1,9x solo se ha validado en el hardware M4 Max y es exclusiva del driver `interns2_mobius` de `omlx`; el `mlx-lm` estándar no carga este head.
- **Requiere `--trust-remote-code`**: el modelo necesita ejecutar código remoto (tokenizer `InternS1` y código `interns2_mobius`), lo que implica un riesgo de seguridad si no se audita el código.
- **Idiomas y contexto no documentados**: no hay información sobre los idiomas soportados ni sobre la longitud de contexto del modelo.
- **Riesgo de alucinación**: al ser un modelo de generación de texto de 35B, puede producir contenido plausible pero incorrecto; no se han publicado evaluaciones de fiabilidad.
- **Sesgos**: no se ha documentado análisis de sesgos para este modelo.
- **Licencia**: Apache-2.0 permite uso comercial, pero la restricción del driver MTP exclusivo de `omlx` limita las opciones de despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nightscape/Intern-S2-Mobius-4bit-mlx-mtp
- Repositorio base (4-bit MLX): https://huggingface.co/nightscape/Intern-S2-Mobius-4bit-mlx
- Modelo original en HuggingFace: https://huggingface.co/internlm/Intern-S2-Mobius
- GitHub de InternLM/Intern-S2-Mobius: https://github.com/InternLM/Intern-S2-Mobius
- Paper: "Intern-S2-Mobius: Foundation Model with Decoupled Knowledge and Reasoning" (arXiv:2608.14290): https://arxiv.org/pdf/2608.14290
- Licencia Apache-2.0: https://huggingface.co/internlm/Intern-S2-Mobius/blob/main/LICENSE
