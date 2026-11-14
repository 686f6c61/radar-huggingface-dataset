# peterson78/synex-core-v1

## Resumen

Synex-core-v1 es un ajuste fino (finetune) del modelo Gemma 2 de 2.000 millones de parámetros en su variante instruct, concretamente sobre la versión cuantizada a 4 bits publicada por Unsloth (`unsloth/gemma-2-2b-it-bnb-4bit`). Lo desarrolla el usuario peterson78 y se distribuye en Hugging Face bajo licencia Apache 2.0. El modelo conserva la arquitectura transformer decoder-only de Gemma 2 y está orientado a generación de texto conversacional en inglés.

El problema que aborda es el habitual en los finetunes de la comunidad: adaptar un modelo base pequeño y eficiente a un estilo o dominio concreto mediante entrenamiento supervisado con Unsloth y TRL, reduciendo el coste computacional del proceso. Al partir de un modelo de 2B, el resultado es desplegable en hardware de consumo, lo que lo hace relevante para prototipado rápido y experimentación local.

La información publicada es mínima: la model card no documenta el dataset de entrenamiento, el número de tokens, la composición de los datos ni resultados de evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y los pesos se publican en safetensors con un total de 2.614.341.888 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 2 2B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (el modelo base de partida estaba en 4 bits bnb; los pesos publicados son safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 2 2B: un transformer decoder-only con atención por ventanas alternas (sliding window attention) y atención global intercalada, normalización RMSNorm y activaciones GeGLU. El tamaño de 2.614.341.888 parámetros coincide con la variante de 2B de Gemma 2, sin cambios estructurales respecto al modelo base.

El entrenamiento consistió en un finetune supervisado sobre `unsloth/gemma-2-2b-it-bnb-4bit` usando la librería Unsloth y TRL de Hugging Face, según indica la model card. El autor afirma que el entrenamiento fue "2x faster" con Unsloth, pero no se especifican el número de tokens, la composición del dataset, la duración del entrenamiento, hiperparámetros, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se documenta ninguna innovación técnica propia más allá del uso de las herramientas mencionadas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct de Gemma 2.
- Razonamiento básico y respuesta a instrucciones, sujeto a la capacidad del modelo de 2B.
- Generación de código y matemáticas a nivel introductorio, limitada por el tamaño del modelo.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño de 2B limita la fiabilidad en tareas agénticas complejas.
- Capacidades multilingües: solo inglés declarado en los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Prototipado de chatbots conversacionales en inglés: el modelo puede mantener diálogos multi-turno y desplegarse en una GPU de consumo, lo que permite iterar sobre prompts y estilos sin coste de infraestructura cloud.
- Generación de texto asistida en local: útil para redacción de borradores, resúmenes y respuestas en aplicaciones de escritorio o entornos sin conexión, gracias a sus 2.6B parámetros y pesos en safetensors.
- Experimentación académica con finetunes: sirve como punto de partida para estudiar el efecto de ajustes supervisados sobre Gemma 2 2B, ya que reproduce el pipeline Unsloth + TRL.
- Clasificación y extracción de información simple: puede emplearse para tareas de etiquetado zero-shot o few-shot en inglés, con la cautela propia de un modelo pequeño.
- Generación de código en entornos educativos: adecuado para explicar fragmentos de código o generar ejemplos sencillos, no para producción crítica.
- Base para ajustes adicionales en dominios concretos: al estar bajo Apache 2.0 y en safetensors, puede recuantizarse a GGUF y afinarse de nuevo con LoRA en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,2 GB en FP16 (2.6B parámetros × 2 bytes); en cuantización de 8 bits unos 2,6 GB; en 4 bits alrededor de 1,5-2 GB (estimación a partir del tamaño de parámetros, no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para FP16; A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6 GB de VRAM en FP16 y en tarjetas de 4 GB con cuantización a 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama tras convertir los pesos a GGUF; el tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| synex-core-v1 | 2.614.341.888 | no disponible (base: 8.192) | apache-2.0 | Hugging Face, 0 descargas |
| Gemma 2 2B IT (Google) | ~2.6B | 8.192 | Gemma Terms of Use | Hugging Face, ampliamente usado |
| Qwen 2.5 1.5B Instruct | ~1.5B | 32.768 | apache-2.0 | Hugging Face, ampliamente usado |
| Phi-3 Mini Instruct | ~3.8B | 4.096 | MIT | Hugging Face, ampliamente usado |

La comparación se limita a parámetros, contexto y licencia, ya que no hay benchmarks publicados de synex-core-v1. Frente al Gemma 2 2B IT original, este finetune cambia la licencia a Apache 2.0, lo que facilita el uso comercial, pero no documenta mejoras medibles. Frente a Qwen 2.5 1.5B, ofrece más parámetros pero menor contexto declarado en el modelo base y solo inglés. Frente a Phi-3 Mini, es más pequeño y con menos contexto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; hereda los sesgos del corpus de entrenamiento de Gemma 2, no auditados en este finetune.
- Riesgo de alucinación: elevado en un modelo de 2B, especialmente en tareas de conocimiento factual y razonamiento multi-paso.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no se especifica en la model card y se asume la del modelo base (8.192 tokens), sin confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Gemma 2 está sujeto a los Gemma Terms of Use; conviene verificar la compatibilidad de la relicencia con las condiciones de Google antes de un despliegue comercial.
- Caveats para producción: no hay evaluación publicada, ni dataset documentado, ni métricas de calidad; el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario. No se recomienda su uso en producción sin una evaluación propia.
- El entrenamiento partió de una versión cuantizada a 4 bits (bnb), lo que puede introducir degradación adicional respecto a un finetune sobre pesos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peterson78/synex-core-v1
- Modelo base: https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Gemma 2 (Google): https://huggingface.co/google/gemma-2-2b-it
