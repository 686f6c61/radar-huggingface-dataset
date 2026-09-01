# lianghsun/ACE-2-Distill-Gemma-3-T1-4B-it

## Resumen

ACE-2-Distill-Gemma-3-T1-4B-it es un modelo de lenguaje de 3.880 millones de parámetros desarrollado por Huang Liang Hsun, fundador de Twinkle AI, como resultado de un proceso de destilación de conocimiento desde un modelo profesor denominado ACE-2 sobre la arquitectura de Google Gemma 3 4B instruct. El modelo está especializado en localización de chino tradicional de Taiwan, incluyendo conversión de chino simplificado a tradicional.

El modelo parte del checkpoint google/gemma-3-4b-it y aplica técnicas de destilación para transferir las capacidades de un modelo de mayor tamaño a un modelo compacto de la clase 4B, manteniendo el rendimiento en tareas de conversación y generación de texto en chino tradicional. Las etiquetas "knowledge-distillation" y "simplified-to-traditional" confirman su propósito principal como adaptador lingüístico para el mercado taiwanés.

La relevancia de este modelo radica en su enfoque específico para Taiwan, donde el chino tradicional con variantes locales es imprescindible. Al estar basado en Gemma 3, hereda la arquitectura moderna de Google DeepMind con ventana de contexto amplia, aunque esta destilación se distribuye en variante exclusivamente de texto (gemma3_text), sin los componentes multimodales del modelo base. El acceso es restringido (gated) y requiere aceptar las condiciones de uso de Gemma en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 3, variante solo texto) |
| Parámetros totales | 3.880.263.168 (~3,88B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 soporta 128K, no confirmado para esta destilación) |
| Tipos de cuantización | no disponible (repo únicamente en safetensors, sin GGUF ni otras cuantizaciones publicadas) |
| Idiomas soportados | chino (tradicional, variante de Taiwan); el modelo base soporta 140+ idiomas |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-3-4b-it, que emplea una arquitectura transformer con atención local de ventana deslizante combinada con atención global en capas seleccionadas, tal como se describe en la documentación de Gemma 3. La variante "text" elimina los componentes multimodales (vision) del modelo base, quedando exclusivamente para generación de texto.

El entrenamiento aplica destilación de conocimiento desde un modelo profesor denominado ACE-2, cuyas especificaciones (arquitectura, tamaño, dataset) no están publicadas en la información disponible. El proceso incluye localización para chino tradicional de Taiwan con conversión de chino simplificado a tradicional. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor declara experiencia en dominios legales y científicos, lo que podría influir en la orientación del ajuste.

## Capacidades

- Generación de texto conversacional en chino tradicional con variante lingüística de Taiwan.
- Conversión de chino simplificado a tradicional, orientada a localización de contenido.
- Razonamiento y generación de respuestas en contexto de uso taiwanés.
- Capacidades heredadas del modelo base Gemma 3 4B instruct: seguimiento de instrucciones y chat multi-turno.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingües: el modelo base soporta 140+ idiomas, pero esta destilación está orientada al chino tradicional, por lo que el rendimiento en otros idiomas no está garantizado.
- Capacidades multimodales: no disponibles (variante solo texto).

## Casos de uso

- Localización de interfaces y contenido digital: el modelo puede convertir texto en chino simplificado a chino tradicional de Taiwan, adecuado para adaptar aplicaciones web, móviles y documentación al mercado taiwanés, donde la variante local difiere de la de Hong Kong o de la china continental.
- Atención al cliente en Taiwan: puede gestionar conversaciones multi-turno en chino tradicional con expresiones y registros propios de la región, integrándose en sistemas de ticketing o chatbots corporativos.
- Asistencia en el ámbito legal: dado el perfil del autor (Twinkle AI, especializado en dominios legales y científicos), el modelo podría emplearse para redacción de documentos, consultas y resúmenes en contextos jurídicos taiwaneses, aunque no hay evidencia publicada de este uso.
- Documentación técnica y traducción: generación de documentación técnica en chino tradicional a partir de contenido en chino simplificado o en otros idiomas, útil para equipos de producto que despliegan software en Taiwan.
- Asistentes conversacionales locales: integración en asistentes virtuales y agentes conversacionales orientados a usuarios de Taiwan que requieran un registro lingüístico natural y culturalmente adaptado.
- Educación y formación: generación de materiales educativos, ejercicios y explicaciones en chino tradicional adaptados al contexto cultural taiwanés, para plataformas de e-learning o tutoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo cuenta con 0 descargas y 0 likes en HuggingFace, por lo que no existen evaluaciones independientes de la comunidad ni datos de rendimiento comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia: ~7,8 GB en FP16 (calculado a partir de los 3,88B parámetros y el tamaño del repo de 7,8 GB). En cuantización de 8 bits se estiman ~3,9 GB y en 4 bits ~2 GB, siempre que se generen las conversiones correspondientes, que no están publicadas actualmente.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB) para FP16 sin cuantizar. Para cuantización de 8 o 4 bits, RTX 3060 (12 GB) o superiores serían suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo con 8 GB o más de VRAM si se cuantiza.
- Opciones de despliegue: HuggingFace Transformers, vLLM, TGI. Para llama.cpp u Ollama sería necesario convertir los pesos a formato GGUF, conversión no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-2-Distill-Gemma-3-T1-4B-it | 3,88B | no disponible | zh (tradicional Taiwan) | Gemma | Gated |
| google/gemma-3-4b-it (base) | 4B | 128K | 140+ | Gemma | Abierto |
| Qwen2.5-3B | 3B | 32K | multilingüe | Apache 2.0 | Abierto |
| Llama-3.2-3B | 3,2B | 128K | multilingüe | Llama 3.2 | Abierto |

No se dispone de datos de rendimiento comparativo entre estos modelos, ya que no hay benchmarks publicados para ACE-2-Distill-Gemma-3-T1-4B-it. La comparación se basa en características estructurales y de disponibilidad.

## Limitaciones y advertencias

- Modelo sin uso verificado: 0 descargas y 0 likes en HuggingFace, sin evaluaciones independientes ni feedback de la comunidad.
- Acceso restringido (gated): requiere aceptar las condiciones de uso de Gemma en HuggingFace antes de poder descargar los pesos.
- Licencia Gemma: impone restricciones de uso comercial según los términos de Google, incluyendo prohibiciones para ciertos casos de uso (armas, vigilancia masiva, entre otros). Es necesario revisar los términos completos antes de usar el modelo en producción.
- Sesgos potenciales: al estar especializado en chino tradicional de Taiwan, puede presentar sesgos geográficos y culturales específicos de la región, y un rendimiento degradado en otras variantes de chino.
- Riesgo de alucinación: no hay datos de evaluación sobre la fiabilidad de las respuestas, por lo que no se recomienda su uso sin supervisión en dominios críticos.
- Longitud de contexto no confirmada: aunque el modelo base soporta 128K, la destilación podría haber alterado la ventana de contexto efectiva.
- Limitación de idiomas: la destilación está orientada al chino tradicional, por lo que el rendimiento en otros idiomas podría degradarse respecto al modelo base.
- Sin cuantizaciones publicadas: solo se distribuye en safetensors, lo que limita el despliegue en entornos con restricciones de VRAM sin trabajo adicional de conversión.

## Enlaces

- HuggingFace: https://huggingface.co/lianghsun/ACE-2-Distill-Gemma-3-T1-4B-it
- Perfil del autor: https://huggingface.co/lianghsun/models
- Repositorio Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Documentación Gemma 3: https://github.com/gemma-3/gemma-3
- Página oficial Gemma: https://deepmind.google/models/gemma/
