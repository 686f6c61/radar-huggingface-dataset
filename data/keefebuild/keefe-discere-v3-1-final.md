# KeefeBuild/Keefe-Discere-v3.1-Final

## Resumen

Keefe-Discere-v3.1-Final es un modelo de lenguaje de 7.6 mil millones de parámetros desarrollado por KeefeBuild, publicado bajo licencia Apache 2.0. Se trata de un ajuste fino (finetune) del modelo KeefeBuild/Keefe-Discere-v3.0-Final, que a su vez se basa en la arquitectura Qwen2. El entrenamiento se realizó con las librerías Unsloth y TRL de Hugging Face, lo que permitió una velocidad de entrenamiento aproximadamente dos veces superior a la habitual.

El modelo está orientado a generación de texto conversacional y es compatible con el ecosistema de Transformers y text-generation-inference. Aunque el repositorio no incluye una documentación técnica detallada, su tamaño y arquitectura lo sitúan en la categoría de modelos de 7B, adecuados para despliegue en entornos con recursos moderados. Su relevancia actual radica en ser una opción de código abierto con licencia permisiva para aplicaciones de chat y generación de texto en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizable con herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal. Al ser un finetune del modelo v3.0-Final, hereda su estructura interna, aunque no se han publicado detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que indica el uso de técnicas de optimización de memoria y velocidad. No se dispone de información sobre el dataset utilizado, el número de tokens de entrenamiento ni si se aplicaron métodos de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en inglés, orientada a conversación y diálogo.
- Compatible con el pipeline de text-generation de Transformers.
- Soporte para despliegue mediante text-generation-inference (TGI) y endpoints compatibles.
- Integración con la librería Unsloth para inferencia optimizada.
- No se han documentado capacidades específicas como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Chatbots de atención al cliente: al ser un modelo conversacional de 7B, puede gestionar diálogos multi-turno en inglés, aunque la longitud de contexto no está confirmada, por lo que se recomienda validar su comportamiento con ventanas cortas.
- Asistentes virtuales integrados en aplicaciones web o móviles: su licencia Apache 2.0 permite uso comercial sin restricciones, facilitando su incorporación en productos propietarios.
- Generación de contenido creativo: redacción de textos, correos, resúmenes o borradores en inglés, aprovechando su capacidad de generación fluida.
- Prototipado rápido de aplicaciones de IA: al ser un modelo de tamaño medio, puede ejecutarse en GPUs de consumo (p. ej., RTX 3090/4090) con cuantización, lo que lo hace adecuado para pruebas y desarrollo.
- Fine-tuning adicional para tareas específicas: al estar basado en Qwen2, puede ajustarse con Unsloth o TRL para dominios concretos como soporte técnico o análisis de sentimiento.
- Despliegue en entornos de producción con baja latencia: mediante TGI o vLLM, puede servir peticiones en tiempo real, aunque se requiere validar el rendimiento con cargas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15-16 GB (para 7,6B parámetros), lo que requiere una GPU con al menos 16 GB, como RTX 4090, A100 o similar.
- Con cuantización de 4 bits (p. ej., mediante llama.cpp o GPTQ), la VRAM necesaria se reduce a unos 4-5 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 o incluso en CPU con suficiente RAM.
- Opciones de despliegue: Transformers con accelerate, vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Keefe-Discere-v3.1-Final | 7,6B | no disponible | Apache 2.0 | Hugging Face |
| Qwen2-7B | 7,6B | 32k (original) | Apache 2.0 | Hugging Face |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 Community | Hugging Face |
| Mistral 7B | 7,3B | 32k | Apache 2.0 | Hugging Face |

Nota: la comparativa se basa en características generales de los modelos base; no se dispone de datos de rendimiento específicos para Keefe-Discere-v3.1-Final.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o comportamientos no deseados; al ser un modelo entrenado con datos no especificados, puede presentar sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en contextos largos o temas especializados.
- Limitaciones de idioma: solo se declara soporte para inglés; su rendimiento en otros idiomas no está garantizado.
- Longitud de contexto no confirmada: aunque el modelo base Qwen2 soporta 32k tokens, el finetune podría haber reducido esta capacidad; se recomienda probar con secuencias largas antes de usarlo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Documentación escasa: la model card no incluye detalles técnicos ni ejemplos de uso, lo que dificulta la evaluación de sus capacidades reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KeefeBuild/Keefe-Discere-v3.1-Final
- Modelo base v3.0-Final: https://huggingface.co/KeefeBuild/Keefe-Discere-v3.0-Final
- Página del modelo Keefe-Discere (versión anterior): https://huggingface.co/KeefeBuild/Keefe-Discere
- Endpoint de inferencia en FriendliAI (v3.0-Final): https://friendli.ai/models/KeefeBuild/Keefe-Discere-v3.0-Final
- Endpoint de inferencia en FriendliAI (Keefe-Discere): https://friendli.ai/models/KeefeBuild/Keefe-Discere
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
