# KeefeBuild/Keefe-Discere-v4.0-Final

## Resumen

Keefe-Discere-v4.0-Final es un modelo de lenguaje finetuneado sobre la arquitectura Qwen2, desarrollado por KeefeBuild (Steven Keefe) y publicado en HuggingFace bajo licencia Apache 2.0. Con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), el modelo está orientado a generación de texto conversacional en inglés y fue entrenado con las librerías Unsloth y TRL de HuggingFace, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un flujo estándar.

El modelo se presenta como una versión "Final" dentro de una serie iterativa (v3.0-Final, v4.0-Final), lo que sugiere un proceso de refinamiento continuo por parte del autor. Aunque la model card indica que fue finetuneado desde KeefeBuild/Keefe-Discere-v4.0-Final (referencia circular que probablemente sea un error en la metadata), los tags confirman que la arquitectura base es Qwen2. El repositorio pesa 15,2 GB, consistente con pesos en fp16 para un modelo de este tamaño.

La relevancia de este modelo reside en su disponibilidad como checkpoint de 7,6B parámetros con licencia permisiva Apache 2.0, lo que permite uso comercial sin restricciones significativas. Sin embargo, la documentación es escasa: no se publican detalles sobre el dataset de entrenamiento, la longitud de contexto, ni resultados de benchmarks, lo que limita su evaluación objetiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, desarrollado originalmente por Alibaba Cloud. Con 7,6 mil millones de parámetros, se sitúa en la gama de modelos de tamaño medio que pueden ejecutarse en hardware de consumo con cuantización adecuada.

El entrenamiento se realizó utilizando Unsloth, una librería optimizada que acelera el fine-tuning de modelos Qwen y Llama, junto con la librería TRL (Transformer Reinforcement Learning) de HuggingFace, que proporciona utilidades para fine-tuning supervisado (SFT), RLHF y DPO. No se especifica en la documentación disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card tampoco detalla innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés: el modelo produce texto coherente y fluido en inglés, orientado a conversación.
- Conversación multi-turno: el tag "conversational" indica que está diseñado para mantener diálogos con contexto conversacional.
- Fine-tuning adicional: al ser un checkpoint de Qwen2 con pesos completos en safetensors, puede ser fine-tuneado para tareas específicas.
- Compatibilidad con pipelines de HuggingFace: integrable con transformers y text-generation-inference.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, ni modos de pensamiento extendido.
- No se dispone de información sobre capacidades multimodales (visión, audio, etc.).

## Casos de uso

- Chatbot de atención al cliente en inglés: el modelo puede gestionar conversaciones de soporte básico en inglés, respondiendo preguntas frecuentes y derivando consultas complejas a operadores humanos. Su tamaño de 7,6B permite desplegarlo en infraestructura moderada.
- Asistente de redacción en inglés: útil para generar borradores de correos, informes o contenido editorial en inglés, aprovechando su capacidad de generación de texto fluido.
- Prototipado rápido de aplicaciones conversacionales: al ser un modelo de 7,6B con licencia Apache 2.0, es adecuado para validar conceptos de producto sin coste de licencia y con requisitos de hardware asumibles.
- Fine-tuning vertical para dominios específicos: partiendo de este checkpoint, un equipo puede fine-tunearlo con datos propios (por ejemplo, documentación técnica o legal en inglés) para crear un asistente especializado.
- Generación de contenido educativo en inglés: puede producir explicaciones, resúmenes o ejercicios en inglés para plataformas de e-learning.
- Evaluación comparativa de arquitecturas Qwen2: al ser un finetune de Qwen2, sirve como punto de referencia para comparar el efecto de diferentes estrategias de fine-tuning sobre la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,2 GB en fp16 (pesos completos), 7,6 GB en cuantización de 8 bits y 3,8 GB en cuantización de 4 bits.
- GPU recomendadas: para fp16, una GPU con al menos 16 GB de VRAM (RTX 4080, RTX 4090, A100 40GB). Con cuantización de 4 bits, cabe en GPUs de consumo con 4-6 GB (RTX 3060, RTX 4060).
- Compatible con GPUs de consumo: sí, especialmente con cuantización GGUF o AWQ.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI (el tag text-generation-inference está presente), y transformers estándar.
- Latencia y throughput: no se han publicado datos específicos. Como referencia general para un modelo de 7,6B en una GPU moderna, se puede esperar un throughput de decenas de tokens por segundo con vLLM, pero estos valores no están confirmados para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Keefe-Discere-v4.0-Final | 7,6B | no disponible | Apache 2.0 | en | HuggingFace |
| Qwen2-7B (base) | 7,6B | 32K (tipico de la familia) | Apache 2.0 | multi | HuggingFace |
| Llama-3-8B | 8,0B | 8K (ampliable a 128K) | Llama 3 license | multi | HuggingFace |
| Mistral-7B-v0.3 | 7,2B | 32K | Apache 2.0 | multi | HuggingFace |

La comparativa se basa en datos públicos de los modelos base. Keefe-Discere-v4.0-Final es un finetune de Qwen2, por lo que su rendimiento dependerá del dataset de fine-tuning, que no está documentado. No se dispone de benchmarks para comparar directamente su rendimiento con estas alternativas.

## Limitaciones y advertencias

- Documentación insuficiente: no se publican detalles sobre el dataset de entrenamiento, la longitud de contexto, ni los resultados de benchmarks, lo que dificulta evaluar su calidad y sus límites.
- Referencia circular en la model card: el campo "Finetuned from model" apunta al propio modelo, lo que sugiere un error en la metadata y genera incertidumbre sobre el modelo base real (aunque los tags indican Qwen2).
- Solo inglés: el modelo está etiquetado únicamente para el idioma inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como cualquier modelo de lenguaje generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Sin datos de sesgos: no se ha publicado ninguna evaluación de sesgos de género, raza, religión u otros, por lo que su comportamiento en estos aspectos es desconocido.
- Sin garantías de producción: al ser un modelo de un autor individual con pocas descargas (0 descargas en el momento de la consulta), no hay evidencia de validación en entornos de producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece ninguna garantía sobre el funcionamiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KeefeBuild/Keefe-Discere-v4.0-Final
- Perfil del autor: https://huggingface.co/KeefeBuild
- Version anterior (Keefe-Discere): https://huggingface.co/KeefeBuild/Keefe-Discere
- Version v3.0-Final en FriendliAI: https://friendli.ai/models/KeefeBuild/Keefe-Discere-v3.0-Final
- Keefe-Discere en FriendliAI: https://friendli.ai/models/KeefeBuild/Keefe-Discere
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Sitio personal del autor: https://keefe.is-a.dev/en
