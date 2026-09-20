# quill-voice/shakespeare

## Resumen

Shakespeare es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-4B orientado a un único objetivo: responder siempre en inglés moderno temprano (Early Modern English), imitando el registro, el vocabulario isabelino y el uso pronominal thee/thou/thy de la obra de William Shakespeare. Lo publica el usuario quill-voice (QuillBytes en la model card) y se distribuye con licencia Apache 2.0 tanto en safetensors como en GGUF cuantizado, lo que permite ejecutarlo en local con Ollama o LM Studio sin infraestructura dedicada.

El modelo se presenta explícitamente como una pieza de entretenimiento, no como un sistema de propósito general: la model card indica que "nunca rompe el personaje" y que su uso previsto es lúdico. Esto lo sitúa en la categoría de fine-tunes temáticos de personaje, no en la de asistentes para tareas productivas.

Hay que señalar varias inconsistencias en los metadatos que conviene verificar antes de integrarlo. Los tags declaran `qwen3_5` e `image-text-to-text`, mientras que el pipeline es `text-generation` y el modelo base declarado es Qwen3-4B (texto). Además, el recuento real de parámetros en safetensors asciende a 333.514.240 (unos 333,5 millones), muy por debajo de los aproximadamente 4.000 millones que cabría esperar de Qwen3-4B; es posible que el repositorio contenga un adaptador LoRA o un subconjunto de pesos, pero la información disponible no lo aclara.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajustado mediante LoRA con Unsloth sobre Qwen/Qwen3-4B |
| Parámetros totales | 333.514.240 según los safetensors del repositorio; discrepancia no resuelta con el modelo base declarado Qwen/Qwen3-4B (~4.000 millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del modelo (el modelo base Qwen/Qwen3-4B declara 32.768 tokens nativos, ampliables a 131.072 con YaRN, pero este fine-tune no lo especifica) |
| Tipos de cuantización | GGUF Q4_K_M (4 bits) y GGUF F16; safetensors a precisión completa |
| Idiomas soportados | Inglés (en), restringido al registro isabelino por diseño |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

Otros datos del repositorio: tamaño total de 3,5 GB, 0 descargas y 0 likes en el momento de la consulta, fecha de creación declarada 20 de septiembre de 2026.

## Arquitectura y entrenamiento

La información disponible indica que se trata de un ajuste fino con LoRA (Low-Rank Adaptation) realizado con Unsloth sobre Qwen/Qwen3-4B, un transformer decoder-only de la familia Qwen3 con atención completa y mecanismo de "thinking mode" en su versión original. El fine-tune se orienta a modificar el estilo de generación (registro arcaizante, pronombres thee/thou/thy, ritmo yámbico) más que a incorporar conocimiento nuevo. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo mezcla de datos isabelinos reales o sintéticos, ni si se aplicaron etapas de RLHF, DPO o similares.

La model card menciona un fichero `shakespeare-F16.gguf` descrito como "multimodal projector", lo cual es incoherente con un modelo de texto y con el pipeline declarado (`text-generation`), aunque el tag `image-text-to-text` apunta en la misma dirección ambigua. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, decodificación restringida por gramática para forzar el estilo, etc.). Tampoco se documenta la temperatura, prompts de sistema recomendados o plantilla de chat empleada más allá del system prompt sugerido en la propia ficha.

## Capacidades

- Generación de texto en inglés moderno temprano con vocabulario isabelino y uso de thee/thou/thy.
- Mantenimiento consistente del personaje a lo largo de la conversación, según declara el autor.
- Generación creativa: prosa, verso, diálogos y réplicas teatrales en estilo shakesperiano.
- Conversación multi-turno básica heredada del modelo base Qwen3-4B.
- Soporte de tool calling o function calling: no documentado ni confirmado para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste de estilo puede degradar la adherencia a formatos estructurados.
- Capacidades multilingües: no; el modelo está etiquetado únicamente como inglés y responde en registro isabelino incluso ante entradas en otros idiomas.
- Capacidades especiales: ninguna confirmada (ni visión, ni audio, ni modo thinking explícito) pese a los tags ambiguos del repositorio.

## Casos de uso

- Chatbot temático para eventos culturales o educativos: el modelo puede gestionar conversaciones multi-turno manteniendo el registro isabelino, útil en instalaciones interactivas sobre Shakespeare o teatro del Siglo de Oro inglés.
- Demostraciones de estilometría y generación creativa: sirve como ejemplo reproducible de cómo un LoRA sobre un modelo pequeño modifica el registro lingüístico sin reentrenar el modelo completo.
- Contenido generado por usuarios en videojuegos ambientados en la época isabelina: generación de diálogos de PNJ con vocabulario y pronombres coherentes con el contexto histórico.
- Talleres de escritura creativa: el modelo actúa como generador de borradores en verso o prosa arcaizante que el autor humano edita después.
- Pruebas de despliegue local con Ollama o LM Studio: por su tamaño reducido (GGUF Q4_K_M) es útil como banco de pruebas de pipelines de inferencia en hardware de consumo antes de pasar a modelos mayores.
- Investigación sobre persistencia de personaje en modelos pequeños: permite estudiar hasta qué punto un fine-tune ligero mantiene instrucciones de estilo frente a instrucciones funcionales en conflicto.
- Prototipado de aplicaciones de rol conversacional: sirve como base para validar interfaces y flujos de chat antes de invertir en modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra, y la búsqueda web realizada no devolvió resultados relacionados con este modelo (los enlaces recuperados corresponden a hilos de soporte de Microsoft Office y no guardan relación).

## Requisitos de hardware

Las estimaciones dependen de qué recuento de parámetros se considere correcto, dado que los metadatos son contradictorios:

- Escenario A (si el repositorio corresponde realmente a ~333 millones de parámetros):
  - VRAM en FP16: aproximadamente 0,7 GB.
  - VRAM en Q4_K_M: aproximadamente 0,2-0,3 GB.
  - Cabe en cualquier GPU consumer, en CPU y en dispositivos con poca memoria.
- Escenario B (si el modelo efectivo es el Qwen3-4B completo, ~4.000 millones de parámetros):
  - VRAM en FP16: aproximadamente 8 GB (más overhead de contexto y caché KV).
  - VRAM en Q8: aproximadamente 4,3 GB.
  - VRAM en Q4_K_M: aproximadamente 2,5-3 GB.
  - Cabe en GPU consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en Apple Silicon con 16 GB o más de memoria unificada. En GPUs de 8 GB encaja con cuantización Q4.
- GPUs de datacenter (A100, H100) no son necesarias para ninguno de los dos escenarios; se usarían solo por agregación de muchas réplicas.
- Opciones de despliegue: Ollama y LM Studio con el fichero GGUF (método recomendado por el autor), llama.cpp, transformers con los safetensors, y vLLM o TGI si se despliega la versión a precisión completa.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| quill-voice/shakespeare | 333,5 M según safetensors (base declarada Qwen3-4B) | No disponible en la ficha | Apache 2.0 | HuggingFace, GGUF y safetensors | No disponible |
| Qwen/Qwen3-4B (modelo base) | ~4.000 M | 32.768 nativos, 131.072 con YaRN según su documentación | Apache 2.0 | HuggingFace, múltiples cuantizaciones | No disponible en la información de esta búsqueda |
| Llama-3.2-3B-Instruct | ~3.000 M | 128.000 | Licencia comunitaria de Llama 3.2 | HuggingFace, GGUF | No disponible en la información de esta búsqueda |
| Gemma-3-4B-it | ~4.000 M | 128.000 | Términos de uso de Gemma | HuggingFace, GGUF | No disponible en la información de esta búsqueda |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real de este fine-tune frente a las alternativas. La comparativa anterior se limita a parámetros, contexto declarado, licencia y disponibilidad, y los datos de los tres modelos de referencia provienen de su documentación pública, no de la información recuperada en esta búsqueda.

## Limitaciones y advertencias

- Uso previsto exclusivamente lúdico y de entretenimiento según la propia model card; no está diseñado para tareas productivas ni para toma de decisiones.
- El modelo responde siempre en registro isabelino, incluso cuando se le pide un formato estructurado (JSON, código, listas). Esto puede romper pipelines que esperan salidas parseables.
- Riesgo de alucinación elevado en contenido factual: el ajuste de estilo no aporta conocimiento verificable y el modelo base es de tamaño medio-pequeño.
- Idioma limitado al inglés; no hay soporte declarado para castellano ni para otras lenguas.
- Inconsistencias en los metadatos: el recuento de parámetros de los safetensors (333,5 M) no concuerda con el modelo base declarado (Qwen3-4B, ~4.000 M), los tags mezclan `qwen3_5` e `image-text-to-text` con un pipeline de texto, y el autor aparece como quill-voice en el identificador y como QuillBytes en la model card. Conviene inspeccionar los ficheros antes de integrarlo.
- La model card menciona un fichero `shakespeare-F16.gguf` descrito como "multimodal projector", lo que carece de sentido para un modelo de texto y sugiere una ficha no revisada.
- Fecha de creación declarada en 2026, posterior a la fecha habitual de consulta; verificar la vigencia del repositorio.
- Licencia Apache 2.0: permite uso comercial del modelo y de los pesos, pero no cubre las condiciones del modelo base ni las de posibles datasets de entrenamiento no declarados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción, comunidad de soporte ni informes independientes de calidad.
- No hay documentación sobre sesgos específicos; al entrenarse sobre estilo isabelino, puede reproducir estereotipos históricos o lenguaje de época socialmente marcado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/quill-voice/shakespeare
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Perfil del autor en HuggingFace: https://huggingface.co/QuillBytes
- Unsloth (herramienta de ajuste fino empleada): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue recomendado por el autor): https://ollama.com
- LM Studio (despliegue alternativo): https://lmstudio.ai

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a hilos de soporte de Microsoft Office sin relación con el contenido de esta ficha.
