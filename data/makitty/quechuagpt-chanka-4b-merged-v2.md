# makitty/QuechuaGPT-chanka-4B-merged-v2

## Resumen

QuechuaGPT-chanka-4B-merged-v2 es un modelo de 4.539.265.536 parámetros (unos 4,54 mil millones) publicado en HuggingFace por el usuario makitty, con licencia Apache 2.0 y pesos en formato safetensors. Se trata de un ajuste fino (finetune) derivado del modelo Thermostatic/rosettia-chanka-4b-alpha160, etiquetado con la familia qwen3_5 y entrenado con las herramientas Unsloth y TRL, según la escasa model card publicada. La metadata declara un único idioma soportado, el inglés, pese a que el nombre del repositorio alude al quechua y a la variedad chanka.

El modelo se distribuye para su uso con la librería transformers y aparece etiquetado como compatible con text-generation-inference y con endpoints, además de figurar en el pipeline image-text-to-text, lo que sugiere una posible entrada multimodal de imagen y texto, extremo que la model card no desarrolla ni confirma. El repositorio ocupa 9,1 GB, un tamaño coherente con pesos en precisión de 16 bits para su número de parámetros.

Su relevancia práctica es limitada por el momento: no tiene descargas ni valoraciones, no publica benchmarks y su documentación es mínima. Resulta interesante como punto de partida para experimentación con ajuste fino de bajo coste (la model card afirma un entrenamiento "2 veces más rápido" con Unsloth) y como posible eslabón en proyectos de lenguas de bajos recursos, dado el nombre del modelo y de su base, aunque el soporte real de quechua no está documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag qwen3_5 apunta a la familia Qwen3.5; la model card no describe la arquitectura) |
| Parámetros totales | 4.539.265.536 (~4,54 mil millones) |
| Parámetros activos | no disponible (no consta que sea una arquitectura de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (único idioma declarado en la metadata del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Thermostatic/rosettia-chanka-4b-alpha160 |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 9,1 GB |
| Librería | transformers |
| Fecha de publicación | 18 de septiembre de 2026 (según la metadata de HuggingFace) |

## Arquitectura y entrenamiento

La información disponible no permite detallar la arquitectura interna. El tag qwen3_5 indica que el modelo pertenece a la familia Qwen3.5, lo que en la práctica implica un transformer decoder-only, pero no se especifican número de capas, dimensión oculta, número de cabezas de atención, tipo de atención ni mecanismos adicionales. Tampoco se documenta si el pipeline image-text-to-text corresponde a un codificador visual real integrado o si es una etiqueta heredada de la configuración del modelo base.

En cuanto al entrenamiento, la model card únicamente indica que se trata de un modelo ajustado ("Uploaded finetuned model") a partir de Thermostatic/rosettia-chanka-4b-alpha160 y que el proceso se realizó con Unsloth, con la afirmación de ser "2 veces más rápido". No se publican el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF, DPO u otro alineamiento, ni hiperparámetros relevantes. El sufijo "merged" del nombre sugiere que los pesos del adaptador se fusionaron con los del modelo base, pero el procedimiento no está documentado.

## Capacidades

- Generación de texto conversacional: el tag conversational y el pipeline declarado apuntan a un uso como modelo de diálogo, si bien no hay ejemplos ni plantilla de chat documentada.
- Entrada multimodal: la etiqueta image-text-to-text sugiere capacidad de procesar imágenes junto a texto, pero la model card no la describe ni la confirma.
- Ajuste fino adicional: al estar publicado con soporte de Unsloth y TRL, es plausible reutilizarlo como base para nuevos ajustes, aunque no se documentan recetas.
- Compatibilidad con text-generation-inference y con endpoints de HuggingFace según los tags del repositorio.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidades de audio o visión verificadas: no disponible.

## Casos de uso

- Experimentación en ajuste fino de bajo coste: al provenir de un entrenamiento con Unsloth y tener 4,54 mil millones de parámetros, encaja en flujos de fine-tuning con una sola GPU consumer de 24 GB, útil para validar recetas antes de escalar a modelos mayores.
- Asistente conversacional en inglés para prototipos: puede emplearse como chatbot de demostración en inglés, siempre que se asuma la ausencia de benchmarks y de garantías de calidad.
- Generación de texto en pipelines de investigación: su licencia Apache 2.0 facilita integrarlo en cuadernos y scripts de evaluación sin restricciones legales añadidas.
- Base para proyectos sobre lenguas de bajos recursos: el nombre QuechuaGPT-chanka y el modelo base rosettia-chanka sugieren un origen vinculado al quechua chanka; el modelo podría servir como punto de partida para continuar ajustes en esa lengua, aunque el soporte efectivo no está documentado y habría que verificarlo empíricamente.
- Servicio de inferencia autogestionado: los tags de text-generation-inference y endpoints_compatible permiten desplegarlo detrás de TGI en una infraestructura propia para pruebas internas.
- Comparativa y docencia: por su licencia permisiva y su tamaño contenido, es un candidato razonable para ejercicios de evaluación comparativa frente a otros modelos de ~4B en entornos académicos.
- Procesamiento de documentos con imagen y texto: si se confirma la capacidad multimodal, podría emplearse en tareas de respuesta a preguntas sobre capturas o diagramas, previa validación experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en precisión de 16 bits (bf16/fp16): aproximadamente 9,1 GB solo para los pesos, coherente con el tamaño del repositorio; hay que sumar la caché KV, que depende de la longitud de contexto y de la configuración de atención (no documentadas).
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 2,3-2,7 GB para los pesos, aunque habría que generar las variantes cuantizadas, ya que no se publican.
- GPU consumer: cabe sin problema en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 3090, RTX 4090) si se usa 16 bits con contextos cortos; en 8 o 4 bits cabría incluso en GPUs de 8 GB.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares, con margen amplio. Es probable que quepa en varias GPU de una misma máquina en configuraciones tensor-parallel.
- Opciones de despliegue: transformers es la vía soportada de forma explícita; text-generation-inference y los endpoints de HuggingFace figuran en los tags; vLLM o SGLang serían plausibles si la arquitectura Qwen3.5 está soportada por esas librerías (no confirmado); llama.cpp u Ollama requerirían generar primero un GGUF, que no se distribuye.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| makitty/QuechuaGPT-chanka-4B-merged-v2 | 4,54 mil millones | no disponible | Apache 2.0 | HuggingFace (0 descargas, 0 valoraciones) |
| Qwen3-4B | ~4 mil millones | 32.768 tokens nativo, ampliable con YaRN | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Llama-3.2-3B | ~3,2 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, muy extendido |
| Gemma-3-4B | ~4 mil millones | 128.000 tokens | Términos de uso de Gemma | HuggingFace, muy extendido |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de su documentación pública general y no de la información proporcionada en esta ficha; conviene verificarlos antes de citarlos. No hay datos de rendimiento comparativo para el modelo evaluado, por lo que la comparación se limita a tamaño, contexto declarado y licencia.

## Limitaciones y advertencias

- Documentación mínima: la model card se limita a indicar el modelo base, la licencia y el uso de Unsloth; no hay información sobre datos, hiperparámetros ni evaluación.
- Sin validación de la comunidad: 0 descargas y 0 valoraciones en el momento de redactar esta ficha, por lo que no existe evidencia externa de calidad o estabilidad.
- Idiomas: la metadata declara únicamente inglés, mientras que el nombre del modelo y de su base aluden al quechua chanka; no se puede asumir soporte de quechua sin comprobación empírica.
- Riesgo de alucinación: inherente a cualquier modelo generativo de este tamaño y agravado por la ausencia de evaluación publicada.
- Sesgos: desconocidos, al no publicarse la composición del dataset de ajuste fino.
- Contexto: se desconoce la longitud máxima soportada, lo que impide planificar despliegues con ventanas largas.
- Uso comercial: la licencia Apache 2.0 del modelo lo permite, pero se recomienda revisar las condiciones del modelo base Thermostatic/rosettia-chanka-4b-alpha160 antes de explotarlo en producción.
- Naturaleza "merged": al tratarse de una fusión de pesos, conviene verificar la integridad del checkpoint y la plantilla de chat antes de usarlo en un servicio.
- Capacidad multimodal no confirmada: el pipeline image-text-to-text puede ser una etiqueta heredada; no hay ejemplos ni instrucciones de uso con imágenes.
- Producción: sin benchmarks, sin pruebas de latencia y sin garantías de estabilidad, no es recomendable desplegarlo en entornos críticos sin una evaluación propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makitty/QuechuaGPT-chanka-4B-merged-v2
- Modelo base: https://huggingface.co/Thermostatic/rosettia-chanka-4b-alpha160
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web realizada.
