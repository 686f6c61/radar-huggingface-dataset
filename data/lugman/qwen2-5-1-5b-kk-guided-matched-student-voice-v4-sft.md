# lugman/Qwen2.5-1.5B-KK-Guided-Matched-Student-Voice-v4-SFT

## Resumen

El modelo `lugman/Qwen2.5-1.5B-KK-Guided-Matched-Student-Voice-v4-SFT` es un ajuste fino (SFT) del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario lugman y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de la familia Qwen2, con 1.543.714.304 parámetros totales y una ventana de contexto heredada del modelo base Qwen2.5-1.5B-Instruct (32.768 tokens, según la especificación pública de Qwen2.5).

El modelo está orientado a conversación (pipeline `text-generation`, tag `conversational`) y su nomenclatura sugiere un ajuste orientado a voz ("Voice") y a un esquema de destilación guiada ("Guided-Matched-Student"), aunque la model card no documenta ni el dataset ni la metodología de entrenamiento empleada. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que indica un flujo de ajuste fino eficiente en memoria (QLoRA o LoRA).

Su relevancia práctica es limitada por el momento: cuenta con 0 descargas y 0 likes, y la documentación publicada es mínima (solo indica el modelo base, la licencia y la herramienta de entrenamiento). Resulta útil como caso de estudio de ajuste fino ligero sobre Qwen2.5-1.5B, pero no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino SFT sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct; no verificada en esta ficha) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en fp/bf16 se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (inglés), según el campo `language` de la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3,1 GB), compatible con transformers y text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. El ajuste fino se realizó con Unsloth y TRL, lo que sugiere el uso de LoRA/QLoRA para reducir el coste de entrenamiento (la model card afirma que el entrenamiento fue "2x faster" con Unsloth, sin más detalles).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO ni la metodología concreta del esquema "Guided-Matched-Student" que aparece en el nombre del modelo. Tampoco se documenta si se congelaron capas, el rango de LoRA, la tasa de aprendizaje ni el número de épocas. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico, matemáticas elementales y generación de código, en la medida en que lo permite un modelo de 1,5 B parámetros.
- Soporte de tool calling / function calling: no documentado en esta ficha; el modelo base Qwen2.5-Instruct lo soporta, pero no se verifica en este ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card declara únicamente inglés (`en`); el modelo base soporta más idiomas, pero este ajuste no lo declara.
- Capacidades especiales (thinking mode, visión, audio): no disponibles. El sufijo "Voice" del nombre no va acompañado de documentación sobre entrada o salida de audio.
- Formato de chat: se espera el formato ChatML de Qwen2.5, aunque no se documenta explícitamente.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo cabe en una GPU de consumo y permite iterar sobre prompts y flujos de diálogo con un coste de inferencia bajo, antes de escalar a un modelo mayor.
- Experimentación con ajuste fino sobre Qwen2.5: sirve como ejemplo reproducible de un pipeline Unsloth + TRL para equipos que quieran replicar el flujo con sus propios datos.
- Generación de texto en inglés para tareas de baja criticidad: resúmenes breves, respuestas a preguntas frecuentes o borradores de correo, donde el coste por token es prioritario.
- Evaluación de técnicas de destilación guiada: el nombre del modelo sugiere un esquema "Guided-Matched-Student" que puede interesar a investigadores que estudien destilación de modelos pequeños.
- Despliegue en entornos con recursos limitados: con cuantización a 4 bits ocupa del orden de 1 GB de VRAM, lo que permite ejecutarlo en portátiles o GPUs de gama baja.
- Base para experimentos de voz: dado el sufijo "Voice", puede emplearse como componente de lenguaje en pipelines de ASR + LLM + TTS, aunque la model card no documenta ninguna capacidad de audio nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache (del orden de 4-5 GB en total para contextos moderados).
- VRAM estimada en cuantización 8 bits: aproximadamente 1,6 GB para pesos.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M): aproximadamente 1 GB para pesos, 1,5-2 GB en total con contexto corto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4); para 4 bits basta con 4 GB (GTX 1650, RTX 3050, iGPU con suficiente memoria compartida).
- Cabe en GPU de consumo: sí, en todas las RTX modernas y en muchas GTX con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama tras conversión a GGUF, y Unsloth para inferencia optimizada.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un modelo de 1,5 B en una RTX 4090 se espera un throughput del orden de cientos a miles de tokens por segundo, pero es una estimación general no verificada para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Guided-Matched-Student-Voice-v4-SFT | 1,54 B | 32.768 (heredado) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste SFT sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base; benchmarks publicados por Qwen |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 | Apache 2.0 | Hugging Face | Variante base sin instrucciones |
| unsloth/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | Hugging Face | Reempaquetado del base para fine-tuning con Unsloth |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea; podría incluso degradarlo.
- Documentación mínima: la model card no describe el dataset, la metodología ni los hiperparámetros, lo que impide auditar el entrenamiento.
- Riesgo de alucinación: como todo modelo de 1,5 B, tiende a inventar hechos, citas y datos; no es apto para tareas de alta precisión sin verificación humana.
- Sesgos: no documentados; el modelo base Qwen2.5 puede presentar sesgos de género, culturales y geográficos, y el ajuste puede amplificarlos si el dataset era reducido.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está garantizado y probablemente sea inferior al del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de la licencia del modelo base y de los datos de ajuste (no documentados).
- Contexto: los 32.768 tokens son la especificación del modelo base; no se ha verificado que el ajuste preserve el rendimiento en contextos largos.
- Producción: con 0 descargas y 0 likes, no hay señal de uso comunitario ni de validación externa; no se recomienda desplegarlo en producción sin una evaluación propia.
- El sufijo "Voice" no implica capacidad de audio: no hay documentación de entrada o salida de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Guided-Matched-Student-Voice-v4-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
