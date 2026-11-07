# agurung/clean-eval-rft-w2c-same-4-iid2c

## Resumen

`agurung/clean-eval-rft-w2c-same-4-iid2c` es un ajuste fino (fine-tuning) supervisado del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario agurung. Se trata de un modelo derivado de la familia Qwen3, concretamente la variante Instruct de 4 mil millones de parámetros en su revisión de julio de 2025, sobre la que se ha aplicado un entrenamiento SFT (supervised fine-tuning) mediante la librería TRL. El modelo se distribuye en formato safetensors y es compatible con la librería transformers y con text-generation-inference.

El nombre del repositorio y del dataset asociado (`cobalt-traces-rft_w2c_same_4_iid2c`) sugieren que el ajuste se enmarca en un experimento de evaluación de contaminación de datos, probablemente relacionado con el trabajo académico Clean-Eval (arXiv:2311.09154), que propone metodologías para restaurar resultados de evaluación fiables en modelos contaminados. Los tags `diversity`, `uniform`, `cobalt` y `sft` apuntan a un experimento controlado sobre diversidad y uniformidad en las trazas de entrenamiento.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva (el campo de licencia aparece como "license" sin especificar y el nombre del modelo figura como "None"). No obstante, resulta útil como referencia para quienes estudian ajustes finos sobre Qwen3-4B y experimentos de evaluación limpia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 mil millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en el repo; no se han publicado versiones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el campo aparece como "license" sin especificar; el modelo base Qwen3 se distribuye bajo Apache-2.0, pero no se confirma para este derivado) |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 1.1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Framework de entrenamiento | TRL 1.13.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1, Tokenizers 0.22.2 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4 mil millones de parámetros. No se dispone de detalles específicos sobre la arquitectura interna (número de capas, dimensión oculta, cabezas de atención, uso de atención lineal o híbrida) en la información proporcionada, por lo que se remite a la model card del modelo base para esos datos.

El entrenamiento consistió en un SFT (supervised fine-tuning) realizado con TRL sobre el dataset `cobalt-traces-rft_w2c_same_4_iid2c`. Según los tags y el nombre del dataset, el experimento parece centrado en controlar la diversidad y uniformidad de las trazas de razonamiento (traces) utilizadas para el ajuste, en el contexto de la reproducción de experimentos de evaluación limpia (Clean-Eval). No se han publicado datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF o DPO posteriores. El run de entrenamiento está registrado en Weights & Biases (proyecto `alexgurung/clean-eval-w2c`, run `p0j9oiil`), lo que permitiría consultar curvas de pérdida y métricas, pero esos datos no se incluyen en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Razonamiento y respuesta a instrucciones en formato chat (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Capacidad de ajuste sobre trazas de razonamiento (traces) para experimentos de evaluación, según el nombre del dataset.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada (el modelo base Qwen3 lo soporta, pero no se verifica para este derivado).
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en evaluación de contaminación de datos: el modelo sirve como artefacto de referencia para reproducir experimentos de Clean-Eval, comparando el comportamiento del modelo ajustado frente al base en benchmarks potencialmente contaminados.
- Estudio de diversidad en trazas de razonamiento: al estar entrenado sobre un dataset con tags `diversity` y `uniform`, permite analizar cómo varía la distribución de respuestas generadas según la composición del dataset de SFT.
- Baseline para ajustes finos sobre Qwen3-4B: útil para investigadores que quieran comparar sus propios SFT con este experimento controlado, usando el mismo modelo base y la misma librería (TRL).
- Reproducción de pipelines de entrenamiento con TRL: el repositorio documenta las versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers, lo que facilita la reproducibilidad del entorno.
- Experimentos de alineación y formato conversacional: el ejemplo de la model card muestra el uso con `pipeline` y formato de mensajes, adecuado para probar la consistencia del formato chat tras el ajuste.
- Docencia y formación en fine-tuning: por su tamaño (4B) y su licencia incierta, puede usarse en entornos académicos controlados para ilustrar el flujo completo de SFT con TRL y seguimiento en W&B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo denso de 4B en safetensors (fp16/bf16), se requieren aproximadamente 8-9 GB solo para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs consumer con 12-16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) en fp16, y en GPUs profesionales (A100, H100) sin problema.
- Cabe en GPU consumer: sí, previsiblemente en modelos con 12 GB o más en fp16, y en 8 GB con cuantización (aunque no se distribuyen pesos cuantizados en el repo).
- Opciones de despliegue: transformers (confirmado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se confirman versiones GGUF para llama.cpp/Ollama ni soporte explícito de vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| agurung/clean-eval-rft-w2c-same-4-iid2c | 4B (denso) | no disponible | no disponible | Hugging Face (0 descargas) | SFT sobre Qwen3-4B-Instruct-2507, experimental |
| Qwen/Qwen3-4B-Instruct-2507 | 4B (denso) | no disponible en esta ficha | Apache-2.0 (según modelo base) | Hugging Face, ampliamente disponible | Modelo base oficial, con model card completa y benchmarks publicados |
| agurung/clean-eval-rft-w2c-same-4 | 4B (denso) | no disponible | no disponible | Hugging Face | Variante hermana del mismo experimento (según resultados de búsqueda) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: cero descargas y cero likes en el momento de la consulta, sin validación comunitaria.
- Model card incompleta: el nombre del modelo figura como "None", la licencia como "license" sin especificar y no se declaran idiomas soportados.
- Licencia incierta: aunque el modelo base Qwen3 se distribuye bajo Apache-2.0, este derivado no declara licencia explícita, lo que impide confirmar su uso comercial.
- Riesgo de alucinación: inherente al modelo base y no mitigado de forma documentada en este ajuste.
- Sesgos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no documentadas; se desconoce si el SFT ha alterado el comportamiento multilingüe o la ventana de contexto del modelo base.
- Sin benchmarks publicados: no hay evidencia de que el ajuste mejore o degrade las capacidades del modelo base.
- Caveat para producción: no se recomienda su uso en entornos productivos sin una evaluación previa propia, dado el carácter experimental y la falta de documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-iid2c
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-rft_w2c_same_4_iid2c
- Run de Weights & Biases: https://wandb.ai/alexgurung/clean-eval-w2c/runs/p0j9oiil
- Repositorio TRL: https://github.com/huggingface/trl
- Paper Clean-Eval (referencia contextual): https://arxiv.org/pdf/2311.09154v1
- Variante hermana (según búsqueda): https://huggingface.co/agurung/clean-eval-rft-w2c-same-4/discussions
