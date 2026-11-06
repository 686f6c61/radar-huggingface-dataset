# lbasile/llava_7b_12_20

## Resumen

`lbasile/llava_7b_12_20` es un checkpoint multimodal de 7.063.427.072 parámetros (unos 7,06 mil millones) alojado en Hugging Face por el usuario `lbasile`. El tag `llava` de la plataforma y la pipeline `image-text-to-text` indican que se trata de un modelo de visión-lenguaje construido sobre la familia LLaVA, que combina un codificador visual con un modelo de lenguaje para responder a instrucciones que incluyen imágenes. El repositorio tiene un tamaño de 14,1 GB, coherente con pesos en precisión de 16 bits.

La relevancia de esta ficha es limitada y conviene decirlo con claridad: la model card es la plantilla automática de Hugging Face, sin ninguna sección completada. No hay información sobre el modelo base, los datos de entrenamiento, el proceso de ajuste, la licencia ni los idiomas soportados. El nombre del repositorio (`llava_7b_12_20`) sugiere un checkpoint intermedio o un experimento de ajuste, no una versión publicada oficialmente por el equipo de LLaVA.

Por tanto, esta ficha describe lo que se puede verificar a partir de los metadatos del repositorio (arquitectura declarada, número de parámetros, pipeline, formato de pesos) y marca explícitamente como "no disponible" todo lo que no consta. Cualquier uso en producción debería ir precedido de una evaluación propia del checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (vision-lenguaje: codificador visual + modelo de lenguaje transformer); detalles internos no disponibles |
| Parametros totales | 7.063.427.072 (7,06 mil millones) |
| Parametros activos | no disponible (no es MoE según los metadatos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser transformers + safetensors admite cuantización posterior (GGUF, AWQ, GPTQ) con herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Los metadatos confirman la familia LLaVA mediante el tag correspondiente y la pipeline `image-text-to-text`. La arquitectura LLaVA canónica empareja un codificador de visión tipo CLIP ViT con un modelo de lenguaje transformer, conectados por un proyector que traduce los embeddings visuales al espacio del modelo de lenguaje; el entrenamiento típico se hace en dos fases (alineamiento del proyector y ajuste de instrucciones multimodales). Sin embargo, para este checkpoint concreto no consta qué codificador visual se usó, qué modelo de lenguaje sirve de base, cuántos tokens de entrenamiento se emplearon ni si hubo RLHF o DPO.

Tampoco hay información sobre el dataset, la composición de las instrucciones multimodales ni hiperparámetros de entrenamiento. El nombre `llava_7b_12_20` podría corresponder a una fecha (12/20) o a una iteración de entrenamiento, pero es una especulación y no debe tomarse como dato. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y diálogo multimodal, según la pipeline declarada.
- Conversación multi-turno: el tag `conversational` indica que el formato de chat está soportado, aunque no se detalla la plantilla exacta.
- Razonamiento visual básico: propio de la familia LLaVA de 7B, sin datos verificados para este checkpoint.
- Tool calling / function calling: no disponible (no se declara soporte).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, audio, vídeo): no disponible.

## Casos de uso

- Prototipado de asistentes visuales: usar el checkpoint como base para experimentar con preguntas y respuestas sobre imágenes en un entorno de investigación, aprovechando que se carga con `transformers` y pesos `safetensors` estándar.
- Evaluación comparativa de checkpoints LLaVA: servir como punto de comparación frente a versiones oficiales de LLaVA-7B en tareas de descripción de imágenes, siempre que se valide antes su calidad real.
- Generación de descripciones automáticas de imágenes en un pipeline interno: el modelo puede producir texto a partir de una imagen, pero requiere una evaluación previa de fidelidad y sesgos antes de usarlo con datos reales.
- Extracción de información de capturas o documentos escaneados: como modelo de visión-lenguaje puede responder preguntas sobre el contenido visual, aunque sin garantías de precisión documentadas.
- Base para fine-tuning multimodal: al estar en formato `transformers` con `safetensors`, es apto como punto de partida para ajustes supervisados en dominios concretos (médico, industrial, retail) con datos propios.
- Docencia y experimentación académica: útil para ilustrar el funcionamiento de la arquitectura LLaVA y comparar el efecto de distintos ajustes sobre un mismo esqueleto de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 14 GB solo para los pesos (coincide con el tamaño del repo de 14,1 GB), más overhead de activaciones y del codificador visual; en la práctica se necesitan 16-20 GB para inferencia cómoda con imágenes de resolución estándar.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB de pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en fp16 con lotes; RTX 4090 (24 GB) para fp16 en una sola GPU; RTX 3090 (24 GB) igualmente viable.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en tarjetas de 8-12 GB (RTX 3060, RTX 4070) solo con cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` (ruta nativa del repo), vLLM y TGI para servir en fp16, llama.cpp/Ollama si se generan pesos GGUF, y cuantización AWQ/GPTQ con herramientas externas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| lbasile/llava_7b_12_20 | 7,06 mil millones | no disponible | no disponible | Hugging Face (0 descargas) |
| LLaVA-1.5-7B (oficial) | ~7 mil millones | 4.096 tokens (según la publicación oficial) | LLaMA 2 (uso comercial con condiciones) | Hugging Face, ampliamente usado |
| LLaVA-1.6 (NeXT) 7B | ~7 mil millones | 4.096 tokens (según la publicación oficial) | según modelo base | Hugging Face |
| Qwen2-VL-7B | ~8 mil millones | 32.768 tokens y superior (según la publicación oficial) | Apache 2.0 | Hugging Face |

La comparación con los modelos oficiales es orientativa: este checkpoint no documenta su procedencia ni su licencia, por lo que no se puede afirmar equivalencia funcional con LLaVA-1.5 o LLaVA-1.6. Los datos de contexto y licencia de las alternativas provienen de sus respectivas publicaciones y deben verificarse en la fuente.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre sesgos, datos de entrenamiento, evaluación ni uso previsto; cualquier despliegue exige una evaluación propia.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o asumir riesgo legal.
- Procedencia incierta: el nombre sugiere un checkpoint intermedio o experimental, no una versión oficial de LLaVA.
- Riesgo de alucinación: los modelos de visión-lenguaje de 7B tienden a inventar detalles no presentes en la imagen; sin benchmarks publicados no se puede acotar este riesgo.
- Idiomas no declarados: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas distintos del inglés.
- Contexto no declarado: imposible planificar conversaciones largas o documentos con muchas imágenes sin conocer la ventana real.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario que sirva de validación.
- Sin soporte declarado de tool calling ni de agentes: no apto para pipelines que requieran llamadas a funciones sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lbasile/llava_7b_12_20
- Paper de LLaVA (referencia de la familia): https://arxiv.org/abs/2304.08485
- Repositorio oficial de LLaVA: https://github.com/haotian-liu/LLaVA
- Paper citado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
