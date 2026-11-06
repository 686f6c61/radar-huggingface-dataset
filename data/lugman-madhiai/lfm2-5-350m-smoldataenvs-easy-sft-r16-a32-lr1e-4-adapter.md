# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr1e-4-adapter

## Resumen

El modelo `LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr1e-4-adapter` es un adaptador LoRA publicado por el usuario lugman-madhiai en Hugging Face, resultado de un ajuste fino supervisado (SFT) sobre el modelo base LiquidAI/LFM2.5-350M. Se trata de un experimento de fine-tuning realizado con la librería Unsloth y el framework TRL, con un rango de LoRA de 16, alpha de 32 y una tasa de aprendizaje de 1e-4, tal como indica el propio nombre del repositorio. El dataset utilizado se denomina "SmolDataEnvs-Easy", aunque no se proporcionan detalles sobre su composición.

El modelo base, LFM2.5-350M, pertenece a la familia LFM2 de LiquidAI, una arquitectura compacta orientada a generación de texto con un tamaño de 350 millones de parámetros. Este adaptador hereda las capacidades del modelo base y las modula mediante el entrenamiento específico sobre el dataset mencionado, que por el nombre parece orientado a entornos de datos sintéticos o tareas de razonamiento sencillas.

La relevancia de esta ficha es limitada: se trata de un adaptador de investigación con cero descargas y cero likes en el momento de la consulta, sin model card detallada más allá de la información mínima de entrenamiento. No obstante, resulta útil como ejemplo de flujo de trabajo de fine-tuning eficiente con Unsloth sobre modelos pequeños, y para quienes quieran reproducir o evaluar adaptadores LoRA de bajo rango sobre LFM2.5-350M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer LFM2 (modelo base LiquidAI/LFM2.5-350M) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 350M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de transformers) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM2.5-350M, un transformer de 350 millones de parámetros perteneciente a la familia LFM2 de LiquidAI. La arquitectura exacta del modelo base no se detalla en la información proporcionada, pero LFM2 se caracteriza por ser una familia de modelos compactos optimizados para despliegue en dispositivos con recursos limitados. El adaptador LoRA tiene rango 16 y alpha 32, lo que implica una actualización de bajo rango sobre las matrices de atención y/o proyección del modelo base.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con TRL y Unsloth, este último utilizado para acelerar el proceso aproximadamente 2 veces según la model card. La tasa de aprendizaje fue de 1e-4 y el dataset se denomina "SmolDataEnvs-Easy", sin que se especifiquen el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. No se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para eficiencia de entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base LFM2.5-350M.
- Razonamiento básico y tareas de lenguaje natural de complejidad moderada, condicionado por el tamaño de 350M parámetros.
- Ajuste específico sobre el dataset "SmolDataEnvs-Easy", cuyo contenido exacto no se detalla; se desconoce si aporta capacidades adicionales concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con fine-tuning eficiente: el adaptador sirve como referencia reproducible de un flujo LoRA con Unsloth y TRL sobre un modelo de 350M, útil para investigadores que quieran replicar la configuración (r=16, alpha=32, lr=1e-4).
- Evaluación de adaptadores de bajo rango: permite estudiar cómo un LoRA de rango 16 modifica el comportamiento de LFM2.5-350M en tareas del dataset "SmolDataEnvs-Easy", comparando con el modelo base.
- Prototipado en entornos con recursos limitados: al tratarse de un adaptador sobre un modelo de 350M, puede cargarse en GPUs de consumo para pruebas rápidas de generación de texto en inglés.
- Investigación sobre datasets sintéticos: si "SmolDataEnvs-Easy" contiene entornos de datos sintéticos, el adaptador puede usarse para analizar la transferencia de ese tipo de datos a un modelo pequeño.
- Base para fine-tuning posterior: el adaptador puede servir como punto de partida para experimentos adicionales de SFT o DPO sobre LFM2.5-350M.
- Docencia y divulgación: ejemplo práctico de publicación de adaptadores LoRA en Hugging Face con licencia Apache 2.0, útil en talleres sobre fine-tuning de modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 350M parámetros en fp16 requiere aproximadamente 0,7 GB de pesos; con el adaptador LoRA añadido, el incremento es marginal (el repositorio ocupa 0,1 GB). En cuantización de 8 bits o 4 bits, el consumo puede reducirse por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de gama baja e incluso en CPU para inferencia con llama.cpp si se convierte el modelo base.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers (con PEFT para cargar el adaptador), text-generation-inference (etiqueta presente en el repositorio), vLLM (previa fusión del adaptador), llama.cpp/Ollama (previa conversión del modelo fusionado a GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr1e-4-adapter | Adaptador LoRA sobre 350M | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| LiquidAI/LFM2.5-350M (modelo base) | 350M | No disponible | No disponible en la información | Hugging Face |
| SmolLM2-360M (HuggingFaceTB) | 360M | 8K (según información pública del modelo) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 500M | 32K (según información pública del modelo) | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de tamaño similar; no se dispone de datos de rendimiento del adaptador para comparar benchmarks. El adaptador no aporta ventajas medibles frente al modelo base más allá del ajuste específico sobre "SmolDataEnvs-Easy", cuyo impacto no está documentado.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar del modelo base LFM2.5-350M, puede reproducir sesgos presentes en sus datos de entrenamiento originales.
- Riesgo de alucinación: elevado en un modelo de 350M parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Limitaciones de contexto o idioma: el repositorio declara únicamente inglés; la longitud de contexto no está especificada y probablemente sea limitada por el modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base LiquidAI/LFM2.5-350M, que no se detalla en la información proporcionada.
- Caveats para producción: el adaptador tiene cero descargas y ninguna validación comunitaria; no hay benchmarks ni evaluación de calidad publicada. No se recomienda su uso en producción sin una evaluación exhaustiva previa. La model card es mínima y no documenta el dataset de entrenamiento ni los hiperparámetros completos.
- El nombre del repositorio sugiere un experimento puntual más que un modelo mantenido; la fecha de creación (2026-10-30) y la ausencia de actualizaciones posteriores refuerzan esta interpretación.

## Enlaces

- Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr1e-4-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (framework de entrenamiento): no se proporciona enlace directo en la información disponible.
