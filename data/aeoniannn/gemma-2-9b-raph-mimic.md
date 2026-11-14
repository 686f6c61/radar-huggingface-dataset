# aeoniannn/Gemma-2-9B-raph-Mimic

## Resumen

Gemma-2-9B-raph-Mimic es un ajuste fino (fine-tuning) del modelo Gemma 2 9B Instruct de Google, publicado por el usuario aeoniannn en Hugging Face. Se trata de un modelo de generación de texto de 9.241.705.984 parámetros derivado de la versión cuantizada a 4 bits de Unsloth (`unsloth/gemma-2-9b-it-bnb-4bit`), reentrenado con la librería Unsloth y TRL de Hugging Face. La model card es mínima y no documenta el dataset de ajuste, el propósito concreto del fine-tuning ni los hiperparámetros empleados.

El modelo hereda la arquitectura transformer decoder-only de Gemma 2, con atención por ventanas alternas y soft-capping logit, y está orientado a conversación y generación de texto en inglés. Su relevancia es limitada: se trata de un experimento de ajuste comunitario con 57 descargas y 0 likes, sin benchmarks publicados ni documentación sobre el corpus de entrenamiento.

Aunque la licencia declarada es Apache 2.0, conviene tener en cuenta que el modelo base original de Google (Gemma 2) se distribuye bajo los términos de uso de Gemma, por lo que la aplicabilidad comercial de esta derivación debe verificarse con cautela. No se dispone de información sobre el conjunto de datos, el número de tokens de entrenamiento ni las técnicas de alineación aplicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parámetros totales | 9.241.705.984 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Gemma 2 9B soporta 8.192 tokens) |
| Tipos de cuantización | safetensors en el repo; el base de partida era bnb-4bit (bitsandbytes 4 bits); se puede cuantizar a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 (según la model card; ver advertencias sobre el modelo base) |
| Formato de pesos | safetensors (repo de 18,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 2 9B Instruct, un transformer decoder-only con 9.241.705.984 parámetros que emplea atención local y global intercalada, RMSNorm, activaciones GeGLU y soft-capping de logits. El fine-tuning se realizó sobre la versión cuantizada a 4 bits de Unsloth mediante LoRA/QLoRA, usando las librerías Unsloth y TRL, según indica la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, la longitud de secuencia, el rango de LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de alineación adicionales como DPO o RLHF.

La model card no documenta ninguna innovación técnica propia más allá del uso de Unsloth para acelerar el entrenamiento (el autor afirma "2x faster"). No hay información sobre la naturaleza del ajuste: no se indica si el objetivo era roleplay, estilo conversacional, una persona concreta ("raph" en el nombre) o una tarea específica. Tampoco se publican curvas de pérdida ni métricas de validación.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Gemma 2 9B Instruct.
- Razonamiento de propósito general y respuesta a instrucciones (capacidad del modelo base, no verificada tras el ajuste).
- Generación de código y matemáticas a nivel del modelo base (no evaluada en esta derivación).
- Soporte de tool calling / function calling: no documentado en esta ficha; el base Gemma 2 no lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado al inglés según la model card, aunque el base Gemma 2 tiene capacidades multilingües más amplias.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con fine-tuning comunitario: sirve como ejemplo de pipeline QLoRA con Unsloth y TRL sobre Gemma 2 9B, útil para reproducir el flujo de trabajo en un entorno de investigación.
- Prototipado de asistentes conversacionales en inglés: el modelo puede generar respuestas multi-turno, aunque sin garantías de calidad por la falta de evaluación publicada.
- Generación de texto creativo o de estilo: el nombre "raph-Mimic" sugiere un ajuste de estilo o personificación, aunque el autor no lo documenta; adecuado solo para pruebas exploratorias.
- Base para nuevos ajustes: al estar en safetensors y con licencia permisiva declarada, puede servir como punto de partida para fine-tunings posteriores.
- Evaluación comparativa de derivaciones de Gemma 2: útil en estudios sobre degradación o deriva de capacidades tras QLoRA.
- Docencia y demostraciones: por su tamaño (9B) y disponibilidad en formato transformers, encaja en talleres sobre ajuste fino con recursos limitados.
- No se recomienda para producción sin una evaluación previa exhaustiva, dado que no hay benchmarks ni documentación del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 18,5 GB de pesos más overhead de activaciones y KV cache (en torno a 20-24 GB para contextos moderados); en cuantización 4 bits (GGUF Q4_K_M o AWQ), en torno a 6-7 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para bf16; RTX 4090 (24 GB) para bf16 con contexto ajustado o para cuantización 8 bits.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16 con contexto limitado y en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 en cuantización 4 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, etiqueta `text-generation-inference`), vLLM, llama.cpp/Ollama (requiere conversión a GGUF), y endpoints compatibles (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aeoniannn/Gemma-2-9B-raph-Mimic | 9,24 B | no disponible (base: 8.192) | apache-2.0 declarada | Hugging Face, 57 descargas | Fine-tuning comunitario sin benchmarks |
| google/gemma-2-9b-it | 9,24 B | 8.192 | Términos de uso de Gemma | Hugging Face, ampliamente usado | Modelo base oficial, con evaluación publicada |
| unsloth/gemma-2-9b-it-bnb-4bit | 9,24 B | 8.192 | Términos de uso de Gemma | Hugging Face | Versión cuantizada 4 bits del base, usada como punto de partida |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con contexto mayor y licencia plenamente permisiva |

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, hiperparámetros y evaluación: no es posible estimar la calidad ni la fiabilidad del ajuste.
- Riesgo elevado de alucinación y de deriva respecto al modelo base, habitual en fine-tunings QLoRA sin validación publicada.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Licencia: aunque se declara apache-2.0, el modelo base Gemma 2 está sujeto a los términos de uso de Google; la relicencia a Apache 2.0 por parte de un tercero es discutible y debe revisarse antes de un uso comercial.
- Sin garantías de soporte, mantenimiento ni actualizaciones por parte del autor.
- No apto para producción sin una evaluación propia de sesgos, toxicidad y precisión.
- El nombre "raph-Mimic" sugiere una posible personificación o imitación de estilo; verificar implicaciones éticas y de derechos de imagen si se usa en contextos públicos.
- Repositorio de 18,5 GB: requiere almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aeoniannn/Gemma-2-9B-raph-Mimic
- Modelo base cuantizado: https://huggingface.co/unsloth/gemma-2-9b-it-bnb-4bit
- Gemma 2 9B Instruct oficial: https://huggingface.co/google/gemma-2-9b-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Gemma 2: https://ai.google.dev/gemma/docs
