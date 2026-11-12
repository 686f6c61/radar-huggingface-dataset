# k391160334/adapter-attached-instruction-tuned

## Resumen

`adapter-attached-instruction-tuned` es un modelo multimodal de tipo image-text-to-text publicado por el usuario k391160334 en Hugging Face. Se trata de un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.8-27B, especializado en tareas de consejería (counseling), según indica la model card. El resultado se distribuye como un modelo autónomo en precisión BF16, con el adaptador LoRA ya fusionado en los pesos, por lo que no requiere cargar un adaptador PEFT por separado.

El modelo conserva la arquitectura completa del base: `Qwen3_5ForConditionalGeneration`, con aproximadamente 27.781 millones de parámetros totales y un repositorio de 55,6 GB repartido en 16 ficheros safetensors. Incluye los pesos originales de visión y MTP (multi-token prediction), además del tokenizer, la plantilla de chat, las configuraciones del procesador y la configuración de generación.

Su relevancia es limitada en el ecosistema general: cuenta con cero descargas y cero likes en el momento de la consulta, declara soporte únicamente para coreano (`ko`) y está pensado para un dominio muy concreto (conversación de apoyo psicológico). La licencia Apache 2.0 facilita su reutilización, pero la ausencia de benchmarks publicados y de documentación detallada sobre el dataset de entrenamiento obliga a evaluarlo con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, image-text-to-text) |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (publicado en BF16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 shards, aproximadamente 55,6 GB, BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de la familia Qwen3.5 que procesa entradas de imagen y texto y genera texto. Sobre ese base se aplicó un adaptador LoRA entrenado mediante SFT (supervised fine-tuning), precedido según la model card por una fase de DAPT (domain-adaptive pretraining) continuada con SFT de consejería. El adaptador final se fusionó en los pesos del modelo, generando un checkpoint autónomo que conserva los pesos de visión y de MTP del base, así como el tokenizer, la plantilla de chat, el procesador y la configuración de generación.

El entorno de fusión declarado es Transformers 5.19.0.dev0, PEFT 0.21.2 y PyTorch 2.10.0+cu128. El repositorio incluye un fichero `merge_info.json` con los ajustes del adaptador y los detalles de verificación de la fusión. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de la arquitectura base.

## Capacidades

- Generación de texto conversacional en coreano, orientada a diálogo de apoyo y consejería.
- Procesamiento de entradas multimodales imagen-texto (pipeline image-text-to-text), heredado del modelo base.
- Capacidad de razonamiento y generación de código y matemáticas: no disponible de forma explícita en la información proporcionada; se asume la del modelo base, sin confirmación documentada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según la etiqueta de idioma declarada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional de apoyo emocional en coreano: el ajuste SFT sobre consejería permite mantener diálogos multi-turno con un tono adecuado para contextos de escucha y orientación, aprovechando la base multimodal para procesar imágenes adjuntas por el usuario.
- Triaje inicial en servicios de salud mental digital: el modelo puede gestionar la primera interacción con el usuario, recoger información y derivar a un profesional, siempre con supervisión humana dado el dominio sensible.
- Chatbot de acompañamiento en aplicaciones de bienestar: integrado mediante la API de Transformers o endpoints compatibles, puede ofrecer respuestas de contención en coreano dentro de una app móvil.
- Análisis de imágenes con contexto conversacional: gracias a la conservación de los pesos de visión, puede recibir una captura o fotografía y comentarla en el marco de una conversación de apoyo.
- Investigación en ajuste fino multimodal: sirve como ejemplo reproducible de fusión de un adaptador LoRA de SFT sobre un modelo Qwen3.5 de 27B, con `merge_info.json` documentando el proceso.
- Generación de material de consejería supervisado: puede emplearse para redactar borradores de respuestas o guiones de sesión en coreano que un profesional revise y adapte.
- Evaluación comparativa de dominio: útil como referencia de cómo un SFT de dominio estrecho afecta al comportamiento de un modelo generalista de 27B en tareas de diálogo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 64-80 GB de VRAM para el checkpoint completo.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2 x A100 40 GB con tensor parallelism).
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en BF16. Sería necesaria cuantización a 8 o 4 bits, no documentada por el autor, para intentar su despliegue en consumer GPU, con pérdida de calidad no evaluada.
- Opciones de despliegue: Transformers (librería declarada), endpoints compatibles según los tags. vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible; llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| adapter-attached-instruction-tuned | 27,8 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | SFT de consejería en coreano sobre Qwen3.8-27B |
| Qwen/Qwen3.8-27B (base) | 27,8 B | no disponible | no disponible en la información | Hugging Face | Modelo generalista multimodal del que deriva |
| Alternativas de 27B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Dominio sensible: el modelo está ajustado para consejería psicológica; no debe usarse como sustituto de atención profesional sin supervisión humana.
- Idiomas: solo se declara soporte de coreano; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset de SFT no se describe, por lo que se desconocen posibles sesgos introducidos.
- Alucinación: no hay métricas publicadas de fidelidad ni de tasa de alucinación; en un dominio de salud mental el riesgo es especialmente relevante.
- Contexto: la longitud de contexto no se especifica en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base Qwen/Qwen3.8-27B tenga términos compatibles para el uso previsto.
- Madurez: cero descargas y cero likes, sin benchmarks ni validación externa; no se recomienda para producción sin una evaluación propia.
- Cuantización: no se publican versiones cuantizadas, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/k391160334/adapter-attached-instruction-tuned
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fichero de información de fusión: `merge_info.json` dentro del repositorio del modelo
- Licencia: `LICENSE` dentro del repositorio del modelo
