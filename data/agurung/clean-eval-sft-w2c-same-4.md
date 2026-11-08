# agurung/clean-eval-sft-w2c-same-4

## Resumen

`agurung/clean-eval-sft-w2c-same-4` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario agurung en Hugging Face. Se trata de un modelo de generación de texto de 4.000 millones de parámetros, entrenado con la librería TRL (versión 1.13.0) sobre el dataset `cobalt-traces-sft_w2c_same_4`. El nombre del repositorio y las etiquetas (`diversity`, `cobalt`, `uniform`, `clean-eval`) sugieren que forma parte de un experimento de evaluación comparativa de estrategias de ajuste (SFT frente a RFT) sobre trazas de razonamiento.

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, una variante instruct del modelo Qwen3 de Alibaba. El repositorio ocupa 1,1 GB en formato safetensors, lo que es coherente con pesos en bf16/fp16 para 4.000 millones de parámetros. No se han publicado resultados de benchmarks ni una model card sustantiva: la tarjeta es la plantilla autogenerada por TRL, sin métricas, sin descripción del dataset y sin información sobre licencia o idiomas.

Su relevancia es limitada y experimental: no hay descargas ni likes, la licencia no está declarada y el autor no documenta el procedimiento de entrenamiento más allá de los hiperparámetros por defecto del framework. Debe tratarse como un artefacto de investigación reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.000 millones (aproximado, según el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin valor) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por supervisión (SFT) del checkpoint Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.000 millones de parámetros. El entrenamiento se realizó con TRL 1.13.0 sobre Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2, según las versiones declaradas en la model card. No se especifican hiperparámetros (learning rate, epochs, batch size, precisión de entrenamiento), composición del dataset ni número de tokens de entrenamiento.

El dataset `cobalt-traces-sft_w2c_same_4` no está descrito en la información disponible; por el nombre y las etiquetas (`cobalt`, `diversity`, `uniform`) parece contener trazas de razonamiento o conversaciones generadas para un experimento de evaluación controlada. La model card no documenta ninguna innovación técnica adicional (sin RLHF, DPO ni decodificación especulativa declarada). El run de entrenamiento está registrado en Weights & Biases bajo el proyecto `clean-eval-w2c`.

## Capacidades

- Generación de texto conversacional en formato de chat (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Razonamiento y respuesta a preguntas abiertas, heredado del modelo base instruct.
- Generación de código y matemáticas: capacidad presumible por herencia de Qwen3-4B-Instruct-2507, pero no verificada ni documentada para este checkpoint.
- Soporte de tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado; el dataset de trazas sugiere entrenamiento orientado a trazas de razonamiento, pero no hay evidencia publicada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking explícito, visión o audio: no disponible.

## Casos de uso

- Experimentación académica sobre SFT: el modelo sirve como punto de comparación frente a la variante RFT del mismo autor (`clean-eval-rft-w2c-same-4`) para estudiar el efecto del tipo de ajuste sobre la diversidad de respuestas.
- Reproducción de experimentos con TRL: al declarar versiones exactas de framework, permite reproducir el pipeline de entrenamiento en entornos con Transformers 5.15.0 y PyTorch 2.13.0.
- Generación de texto conversacional en prototipos: el ejemplo de la model card (pregunta hipotética sobre una máquina del tiempo) muestra su uso como chatbot básico vía `pipeline` de Transformers.
- Evaluación de calidad de datasets sintéticos: útil para inspeccionar cualitativamente qué tipo de respuestas produce un SFT sobre trazas `cobalt` antes de escalar el experimento.
- Base para ajustes posteriores: al ser un checkpoint de 4B en safetensors, puede servir como inicialización para nuevos fine-tunes con TRL o como punto de partida para DPO.
- Despliegue en entornos de laboratorio con TGI: la etiqueta `text-generation-inference` y `endpoints_compatible` indica compatibilidad con Text Generation Inference para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8-9 GB solo para pesos, más overhead de activaciones y caché KV (en torno a 10-12 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB; en 4 bits, aproximadamente 2,5-3 GB (estimaciones para un modelo denso de 4B; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100 para serving de alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 sin problemas; RTX 4080/4070 Ti (16 GB) suficiente en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16, y en 8 GB o menos con cuantización de 4 bits.
- Opciones de despliegue: Transformers (`pipeline`), Text Generation Inference (etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama solo si se generan conversiones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agurung/clean-eval-sft-w2c-same-4 | ~4B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, modelo oficial de referencia |
| agurung/clean-eval-rft-w2c-same-4 | ~4B | no disponible | no disponible | Hugging Face, variante RFT del mismo autor |
| agurung/clean-eval-rft-w2c-same-4-vs | ~4B | no disponible | no disponible | Hugging Face, variante RFT adicional |

La comparación directa con el modelo base es la más informativa: este checkpoint solo se diferencia por el SFT sobre `cobalt-traces-sft_w2c_same_4`, sin datos públicos de mejora o degradación respecto a Qwen3-4B-Instruct-2507.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas de pérdida ni comparaciones publicadas; no se puede afirmar que mejore al modelo base.
- Licencia no declarada: el campo `licence: license` no especifica términos, lo que impide determinar si el uso comercial es legal. Debe consultarse la licencia del modelo base Qwen3-4B-Instruct-2507 antes de cualquier despliegue.
- Idiomas no declarados: no se puede garantizar calidad multilingüe; probablemente herede el sesgo hacia inglés y chino del modelo base.
- Riesgo de alucinación: al ser un SFT sobre trazas posiblemente sintéticas, puede reproducir patrones del dataset de entrenamiento y generar respuestas plausibles pero incorrectas.
- Sesgos del dataset desconocidos: la composición de `cobalt-traces-sft_w2c_same_4` no está documentada, por lo que no se pueden auditar sesgos de género, ideológicos o culturales.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que limita el despliegue en hardware modesto sin trabajo adicional.
- Modelo experimental sin mantenimiento: 0 descargas, 0 likes y sin documentación; no hay garantía de soporte ni de corrección de errores.
- La model card tiene el título "Model Card for None" y el ejemplo de código apunta a `model="None"`, lo que indica un pipeline de publicación incompleto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/clean-eval-sft-w2c-same-4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-sft_w2c_same_4
- Run de entrenamiento en Weights & Biases: https://wandb.ai/alexgurung/clean-eval-w2c/runs/p1vwsrl4
- Repositorio TRL: https://github.com/huggingface/trl
- Variante RFT del mismo autor: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4
- Variante RFT adicional: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-vs
