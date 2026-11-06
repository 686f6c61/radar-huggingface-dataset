# MaroskaOsama/smollm2-360m-sft

## Resumen

smollm2-360m-sft es un ajuste fino supervisado (SFT) del modelo HuggingFaceTB/SmolLM2-360M-Instruct, desarrollado por el usuario MaroskaOsama y publicado en Hugging Face. Se trata de un modelo de lenguaje de 360 millones de parámetros derivado de la familia SmolLM2 de Hugging Face, orientado a generación de texto conversacional. El ajuste se ha realizado con la librería TRL (versión 1.17.1) sobre el modelo instruct original, lo que sugiere un entrenamiento de tipo supervisado sobre pares instrucción-respuesta.

La relevancia de este modelo es limitada: se publica como un experimento de fine-tuning comunitario, con cero descargas y cero likes en el momento de la ficha, y sin model card sustantiva (no se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni evaluación). El repositorio aparece con tamaño de 0.0 GB, lo que puede indicar que los pesos no están efectivamente subidos o que la información de tamaño no se ha actualizado.

Al estar basado en SmolLM2-360M-Instruct, hereda la arquitectura y las capacidades del modelo original, pero cualquier mejora o degradación introducida por el SFT no está documentada. Es un modelo adecuado únicamente para experimentación y prototipado, no para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct; no detallada en la model card) |
| Parametros totales | 360 millones (según el nombre del modelo y el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base SmolLM2-360M-Instruct soporta hasta 8192 tokens, pero este dato no se confirma en la ficha del autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar; el modelo base SmolLM2 se distribuye bajo Apache-2.0, pero este fine-tune no declara licencia concreta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del SmolLM2-360M-Instruct de Hugging Face, un transformer decoder-only de 360 millones de parámetros. La model card no detalla la arquitectura interna (número de capas, dimensiones, mecanismo de atención), por lo que se remite a las especificaciones del modelo base, que no se incluyen en la información proporcionada.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL 1.17.1, sobre Transformers 5.22.1, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifican el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, hiperparámetros (learning rate, epochs, batch size) ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del propio ajuste supervisado.

## Capacidades

- Generación de texto conversacional en formato chat (la model card muestra un ejemplo con `pipeline` y mensajes con rol `user`).
- Razonamiento básico y respuesta a preguntas, limitado por el tamaño de 360M parámetros del modelo base.
- Capacidades heredadas del SmolLM2-360M-Instruct, que no se detallan en la ficha del autor.
- Soporte de tool calling / function calling: no documentado en esta ficha; dependería de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Capacidades especiales (thinking mode, visión, audio): no documentadas.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo puede desplegarse con `transformers` y `pipeline` en una sola GPU consumer para probar flujos de chat multi-turno, gracias a su tamaño reducido de 360M parámetros.
- Experimentación académica con SFT: sirve como punto de partida para estudiar el efecto del fine-tuning supervisado sobre un modelo instruct pequeño, comparando respuestas antes y después del ajuste.
- Generación de texto en entornos con recursos muy limitados: al caber en GPUs de gama baja o incluso en CPU con cuantización, puede usarse para tareas de generación de texto simple en dispositivos edge.
- Evaluación de pipelines de TRL: útil para validar flujos de entrenamiento con TRL 1.17.1 y Transformers 5.22.1 en entornos de investigación.
- Base para fine-tuning adicional: al ser un modelo pequeño y con pesos en safetensors, puede servir como punto de partida para ajustes específicos de dominio en laboratorios con pocos recursos.
- Pruebas de integración con la API de `transformers`: el ejemplo de la model card permite verificar el correcto funcionamiento de pipelines de generación con formato de mensajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 0.7-0.8 GB para los pesos (360M parámetros × 2 bytes); en fp32, aproximadamente 1.4-1.5 GB. La VRAM total necesaria depende de la longitud de contexto y del tamaño de batch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es más que suficiente. También puede ejecutarse en CPU para inferencia de baja latencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090, etc.), así como en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `pipeline` (documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este modelo, aunque al ser un transformer estándar en safetensors podrían ser compatibles tras conversión.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MaroskaOsama/smollm2-360m-sft | 360M | no disponible | no disponible | Hugging Face (0 descargas) | Fine-tune SFT comunitario sin evaluación publicada |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8192 tokens (según especificaciones del modelo base) | Apache-2.0 | Hugging Face (ampliamente descargado) | Modelo base oficial, con model card completa y evaluación |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8192 tokens (según especificaciones del modelo base) | Apache-2.0 | Hugging Face | Alternativa más pequeña de la misma familia |
| Qwen2.5-0.5B-Instruct | 500M | 32768 tokens (según especificaciones del modelo) | Apache-2.0 | Hugging Face | Alternativa de tamaño similar con mayor contexto |

Nota: los datos del modelo base y de los comparables provienen de conocimiento general de dichos modelos y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa. Para este fine-tune concreto no hay datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar el modelo base, es probable que presente los sesgos de los datos de preentrenamiento de SmolLM2, pero no hay información específica.
- Riesgo de alucinación: alto, como en cualquier modelo de 360M parámetros; el tamaño reducido limita la fiabilidad factual.
- Limitaciones de contexto o idioma: no documentadas; el contexto y los idiomas soportados dependen del modelo base y no se confirman en esta ficha.
- Restricciones de licencia para uso comercial: la licencia no está declarada explícitamente ("licence: license"), lo que impide confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor o verificar el repositorio antes de cualquier uso en producción.
- Caveats para producción: cero descargas y cero likes, sin evaluación publicada, sin dataset de entrenamiento documentado y con tamaño de repositorio de 0.0 GB (posible ausencia de pesos). No se recomienda su uso en producción sin verificar la integridad de los pesos y realizar una evaluación propia.
- El autor no documenta hiperparámetros ni datos de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/MaroskaOsama/smollm2-360m-sft
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
