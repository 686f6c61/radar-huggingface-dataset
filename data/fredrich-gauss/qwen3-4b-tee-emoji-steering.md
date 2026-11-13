# FREDRICH-GAUSS/Qwen3-4B-TEE-Emoji-Steering

## Resumen

Qwen3-4B-TEE-Emoji-Steering es un adaptador LoRA publicado por el usuario FREDRICH-GAUSS sobre el modelo base unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit, una versión cuantizada en 4 bits del Qwen3-4B-Instruct-2507 de Alibaba Qwen. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con TRL y PEFT, y su nombre sugiere un ajuste orientado a la modulación de la generación mediante emojis ("emoji steering"), aunque la model card no documenta explícitamente el dataset ni el objetivo concreto del entrenamiento.

El interés del modelo es acotado pero específico: se trata de un experimento de personalización sobre un modelo denso de 4.000 millones de parámetros con una ventana de contexto nativa de 262.144 tokens (heredada de la familia Qwen3). El adaptador ocupa 7,9 GB en el repositorio, lo que incluye los pesos del adaptador y posiblemente artefactos de entrenamiento; no es un modelo completo, sino un delta que requiere cargar el base.

Es relevante ahora porque ejemplifica el flujo de trabajo actual de fine-tuning ligero con Unsloth y TRL sobre modelos Qwen3, pero conviene tratarlo como un artefacto de investigación sin validación pública: cero descargas, cero likes y sin benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA no declara su número de parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en Qwen3-4B-Instruct-2507 (heredada del base; no verificada en el adaptador) |
| Tipos de cuantizacion | Base en bnb-4bit (bitsandbytes); el adaptador se distribuye en safetensors. Otras cuantizaciones no disponibles |
| Idiomas soportados | en, ar (según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parámetros de la familia Qwen3, en su variante instruct con ventana de contexto larga. El entrenamiento se realizó con SFT usando TRL 1.15.0, PEFT 0.21.2, Transformers 5.17.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, con Unsloth como acelerador del fine-tuning (según las etiquetas del repositorio). El modelo base empleado para el entrenamiento está cuantizado en 4 bits con bitsandbytes.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO posterior, ni la innovación técnica concreta del ajuste "emoji steering". La model card solo indica que se usó SFT y no incluye hiperparámetros, curvas de pérdida ni ejemplos de comportamiento esperado.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del base Qwen3-4B-Instruct-2507.
- Razonamiento y matemáticas básicas propias de un modelo de 4B; sin datos específicos del adaptador.
- Generación de código: capacidad del base, no evaluada en el adaptador.
- Soporte de tool calling / function calling: no documentado en la model card; el base Qwen3 lo soporta, pero no se verifica tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Multilingüe limitado a inglés y árabe según la model card (el base Qwen3 cubre más idiomas, pero el adaptador declara solo en/ar).
- Modulación de estilo mediante emojis: presumiblemente el objetivo del ajuste, pero no hay ejemplos ni especificación de la interfaz de control.

## Casos de uso

- Experimentación en investigación sobre control de estilo: usar el adaptador para estudiar cómo un LoRA puede modular la generación (por ejemplo, presencia o intensidad de emojis) sin reentrenar el base, comparando salidas con y sin adaptador sobre el mismo prompt.
- Prototipado de asistentes conversacionales en inglés o árabe: el modelo base de 4B cabe en GPUs de consumo y permite iterar rápido en demos locales con respuestas de tono controlado.
- Evaluación de técnicas de fine-tuning ligero: sirve como caso de estudio reproducible del pipeline Unsloth + TRL + PEFT para quienes quieran replicar el flujo con sus propios datasets.
- Generación de texto con contexto largo en inglés: aprovechando la ventana de 262.144 tokens del base para resumir documentos extensos, aunque el adaptador no aporta garantías adicionales en esa tarea.
- Fine-tuning incremental sobre el adaptador: al ser un LoRA en safetensors, puede fusionarse con el base o combinarse con otros adaptadores para experimentos de composición de estilos.
- Docencia y formación técnica: ejemplo práctico de cómo se publica y se carga un adaptador PEFT con `peft` y `transformers`, útil en talleres sobre modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el base en bnb-4bit requiere aproximadamente 3-4 GB de VRAM para los pesos, más overhead de activaciones y KV cache; con contexto largo la KV cache crece de forma significativa. El adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: RTX 3090/4090 (24 GB) para contexto moderado; A100 40/80 GB o H100 para aprovechar la ventana de 262.144 tokens.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superiores con cuantización 4-bit y contexto limitado; en 8 GB puede ser ajustado según longitud de contexto y batch.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador sobre el base), vLLM con soporte LoRA, TGI con adaptadores; llama.cpp/Ollama requerirían fusionar el adaptador con el base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-TEE-Emoji-Steering (este) | 4B + LoRA | 262.144 (base) | apache-2.0 | Hugging Face, 0 descargas | Adaptador experimental sin benchmarks |
| Qwen3-4B-Instruct-2507 (base) | 4B | 262.144 | apache-2.0 | Hugging Face, ampliamente usado | Modelo instruct generalista con evaluación pública |
| Llama 3.2 3B Instruct | 3B | 128.000 | Llama 3.2 Community License | Hugging Face, muy adoptado | Alternativa de tamaño similar con licencia restrictiva para algunos usos |
| Gemma 3 4B IT | 4B | 128.000 | Gemma Terms of Use | Hugging Face, ampliamente usado | Multilingüe y multimodal en algunas variantes; licencia con condiciones |

La comparación con el base es la más relevante: el adaptador no aporta mejoras verificadas frente a Qwen3-4B-Instruct-2507 y solo se justifica por su propósito experimental de control de estilo.

## Limitaciones y advertencias

- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de que el adaptador preserve las capacidades del base ni de que el "emoji steering" funcione de forma fiable.
- Cero descargas y cero likes: no hay validación comunitaria; trátese como artefacto de investigación.
- La model card está incompleta: no especifica dataset, hiperparámetros, número de pasos ni ejemplos de uso; el snippet de "Quick start" contiene `model="None"`, por lo que no es ejecutable tal cual.
- Idiomas declarados limitados a inglés y árabe; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a un modelo de 4B, no mitigado por el adaptador.
- Sesgos del base Qwen3-4B-Instruct-2507 no evaluados tras el ajuste.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del modelo base (también apache-2.0) antes de desplegar.
- El repositorio de 7,9 GB incluye artefactos de entrenamiento además del adaptador; revisar el contenido antes de descargarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/FREDRICH-GAUSS/Qwen3-4B-TEE-Emoji-Steering
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft (referenciado vía versión 0.21.2)
- Repositorio Unsloth: https://github.com/unslothai/unsloth (referenciado en las etiquetas del repositorio)
