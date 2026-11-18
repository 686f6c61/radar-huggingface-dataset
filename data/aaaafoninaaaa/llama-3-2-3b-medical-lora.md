# aaaafoninaaaa/llama-3.2-3b-medical-lora

## Resumen

`aaaafoninaaaa/llama-3.2-3b-medical-lora` es un ajuste fino (fine-tuning) publicado en Hugging Face por el usuario aaaafoninaaaa sobre el modelo base `unsloth/Llama-3.2-1B-Instruct-bnb-4bit`, una versión cuantizada en 4 bits del Llama 3.2 1B Instruct de Meta. A pesar del nombre del repositorio, que sugiere un modelo de 3B, la model card indica explícitamente que el modelo base es el Llama 3.2 de 1B parámetros, por lo que la designación "3b" del identificador no se corresponde con el tamaño real del modelo.

El ajuste se ha realizado con la librería Unsloth, que permite entrenar modelos Llama con aproximadamente el doble de velocidad y menor consumo de memoria que los pipelines estándar de Hugging Face. El modelo está orientado a generación de texto en inglés y, por el nombre del repositorio, se intuye una especialización en dominio médico, aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni sobre el procedimiento seguido.

La relevancia de esta ficha es limitada: se trata de un experimento personal sin descargas ni interacciones, sin benchmarks publicados y con una documentación mínima. Resulta útil como referencia de cómo se publica un fine-tuning ligero con Unsloth, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), ajustado sobre una versión cuantizada en 4 bits del modelo base |
| Parametros totales | 1B (según el modelo base `unsloth/Llama-3.2-1B-Instruct-bnb-4bit`; el nombre del repositorio indica "3b" pero no coincide con el modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el Llama 3.2 1B Instruct original soporta 128 000 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | El modelo base está en bnb-4bit; el repositorio contiene safetensors (probablemente adaptadores LoRA o pesos fusionados, no especificado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.2 1B Instruct de Meta, un transformer decoder-only con atención causal estándar. El ajuste fino se ha realizado sobre la variante cuantizada en 4 bits publicada por Unsloth (`unsloth/Llama-3.2-1B-Instruct-bnb-4bit`), lo que implica que el entrenamiento se ha llevado a cabo con cuantización de 4 bits (QLoRA o similar) para reducir el uso de memoria. La librería Unsloth aplica optimizaciones de kernels que aceleran el entrenamiento aproximadamente 2x respecto a los pipelines convencionales de Hugging Face.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF o DPO, ni sobre hiperparámetros como la tasa de aprendizaje o el número de épocas. La model card es genérica y no incluye ninguna innovación técnica destacable más allá del uso de Unsloth. El tag `trl` sugiere el uso de la librería TRL de Hugging Face para el ajuste, probablemente con SFTTrainer.

## Capacidades

- Generación de texto en inglés, heredada del Llama 3.2 1B Instruct base.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 1B parámetros.
- Posible especialización en dominio médico por el nombre del repositorio, aunque no se documenta ni se verifica.
- Soporte de tool calling y function calling: no confirmado en la model card (el Llama 3.2 1B Instruct original tiene soporte limitado).
- Capacidades de agente y razonamiento multi-paso: no confirmadas y previsiblemente limitadas por el tamaño.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Experimentación con fine-tuning médico ligero: el modelo sirve como ejemplo de cómo ajustar un Llama 3.2 1B con Unsloth en un entorno con recursos limitados, útil para desarrolladores que quieran replicar el pipeline.
- Prototipado de asistentes de dominio sanitario en inglés: se puede usar para generar respuestas preliminares sobre terminología médica, siempre con revisión humana y sin uso clínico real.
- Pruebas de integración con TGI (text-generation-inference): el tag `text-generation-inference` indica compatibilidad con el servidor de Hugging Face para despliegue de endpoints.
- Evaluación comparativa de ajustes finos: útil como baseline para medir el efecto de un fine-tuning sobre el Llama 3.2 1B Instruct en tareas médicas.
- Generación de texto divulgativo en inglés: resúmenes o explicaciones de conceptos médicos básicos, con verificación posterior.
- Docencia y demostraciones: ejemplo didáctico de publicación de un modelo ajustado con licencia Apache 2.0 y formato safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 1B parámetros, en fp16 requiere aproximadamente 2-3 GB de VRAM; en 4 bits (si se mantiene la cuantización del base) puede caber en torno a 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060, RTX 4090). Para entrenamiento con Unsloth, una RTX 3090 o 4090 con 24 GB es más que suficiente; incluso GPUs con 8 GB pueden entrenar un 1B en QLoRA.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 4-6 GB de VRAM para inferencia.
- Opciones de despliegue: transformers, text-generation-inference (TGI), llama.cpp (previa conversión a GGUF), Ollama (previa conversión), vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aaaafoninaaaa/llama-3.2-3b-medical-lora | 1B (base) | no disponible | apache-2.0 | Hugging Face, 0 descargas | Ajuste fino médico sin documentar |
| unsloth/Llama-3.2-1B-Instruct-bnb-4bit | 1B | 128k (modelo original) | apache-2.0 | Hugging Face, ampliamente usado | Modelo base cuantizado en 4 bits |
| meta-llama/Llama-3.2-1B-Instruct | 1B | 128k | Llama 3.2 Community License | Hugging Face, muy popular | Modelo oficial de Meta, sin ajuste médico |
| microsoft/Phi-3-mini-4k-instruct | 3,8B | 4k | MIT | Hugging Face, muy popular | Alternativa pequeña con buen rendimiento en razonamiento |

## Limitaciones y advertencias

- El nombre del repositorio ("3b") no coincide con el modelo base real (1B), lo que puede inducir a error sobre el tamaño y las capacidades.
- No hay información sobre el dataset de entrenamiento ni sobre el proceso de ajuste, por lo que no se puede evaluar la calidad ni la seguridad del modelo en dominio médico.
- Riesgo elevado de alucinación en contenido médico: un modelo de 1B ajustado sin documentación no es fiable para uso clínico ni para dar consejos de salud.
- Sesgos conocidos: heredados del Llama 3.2 1B Instruct base, no evaluados en este ajuste.
- Limitaciones de idioma: solo inglés declarado; no se garantiza un buen rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación y de evaluación desaconseja su uso en producción sin validación previa.
- Sin descargas ni interacciones en Hugging Face: no hay evidencia de uso ni de validación por parte de la comunidad.
- El formato de pesos (safetensors) puede contener adaptadores LoRA en lugar de pesos fusionados; no se especifica, lo que complica su despliegue directo.

## Enlaces

- [Hugging Face: aaaafoninaaaa/llama-3.2-3b-medical-lora](https://huggingface.co/aaaafoninaaaa/llama-3.2-3b-medical-lora)
- [Modelo base: unsloth/Llama-3.2-1B-Instruct-bnb-4bit](https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo oficial: meta-llama/Llama-3.2-1B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct)
