# Dorotheou/LTX2.3-10Eros-1.5-GGUF

## Resumen

LTX2.3-10Eros-1.5-GGUF es una cuantización en formato GGUF del modelo de generación de vídeo a partir de imagen (image-to-video) TenStrip/LTX2.3-10Eros, publicada por el usuario Dorotheou. Se trata de un derivado del modelo base LTX-2.3 de Lightricks, un transformer de difusión de aproximadamente 21.000 millones de parámetros (21.005.004.544 según los pesos en safetensors), adaptado mediante merges por capas para uso en flujos de trabajo de ComfyUI. El repositorio ocupa 179 GB y está etiquetado con la librería diffusers y el pipeline image-to-video.

El modelo pertenece a la familia de "10Eros", una serie de versiones (v1, v1.2, v1.3, v1.4 y esta v1.5) que el autor de la model card describe como variantes casi idénticas del mismo modelo, diferenciadas únicamente por cómo se gestionan las compuertas de atención `attn_1` y `attn_2`. La versión 1.5 aplica una rampa lineal sobre dichas compuertas para recuperar detalles de movimiento y anatomía presentes en la versión 1.2 y en el modelo Sulphur-2, manteniendo la estabilidad estructural de la 1.4. El resultado es un híbrido pensado para combinarse con LoRAs de destilación DMD.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización GGUF de un modelo de vídeo de gran tamaño orientada al ecosistema ComfyUI; por otro, advierte de que se trata de un modelo de contenido explícito, sin licencia declarada ni idiomas especificados, con cero descargas y cero likes en el momento de la consulta, lo que lo convierte en un artefacto de nicho y de madurez incierta para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (LTX-2.3), pipeline image-to-video |
| Parámetros totales | 21.005.004.544 (~21,0 mil millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (variantes concretas no especificadas en la información disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 179 GB); modelo base en safetensors/diffusers |
| Modelo base | TenStrip/LTX2.3-10Eros |
| Librería | diffusers |
| Pipeline | image-to-video |
| Tamaño del repositorio | 179,0 GB |
| Fecha de creación | 2026-11-17 |

## Arquitectura y entrenamiento

El modelo base es LTX-2.3, un transformer de difusión para generación de vídeo condicionada por imagen, con aproximadamente 21.000 millones de parámetros. La model card indica que el 10Eros no es un entrenamiento desde cero ni un simple merge de pesos: emplea merges escalados por capas de distintos pasos del proceso, y el autor afirma explícitamente que "no es un merge directo de pesos". La versión 1.5 se construye sobre la 1.4 modificando únicamente el tratamiento de las compuertas de atención `attn_1` y `attn_2` mediante una rampa lineal, con el objetivo de recuperar la expresividad de movimiento de la versión 1.2 y de los pesos de Sulphur-2 sin perder la estabilidad de la 1.4.

El autor declara que el modelo depende de SulphurAI/Sulphur-2-base y que está diseñado para funcionar junto con LoRAs de destilación DMD (por ejemplo, `LTX2.3_DMD_hybrid_v2.safetensors` de TenStrip o los híbridos de maximsobolev275). La model card señala que, al ser un híbrido entre un modelo pensado para DMD y otro para LoRA destilada de LTX, rinde mejor con una LoRA híbrida que aproveche la variedad de movimiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; tampoco se detalla el proceso de cuantización GGUF aplicado por Dorotheou.

## Capacidades

- Generación de vídeo a partir de una imagen inicial (image-to-video) con evolución de movimiento, composición y anatomía a lo largo de la secuencia.
- Control de movimiento y evolución temporal mediante prompts descriptivos y directivos; el autor advierte que el modelo "tiene muy poco auto-razonamiento" y que hay que comandarlo explícitamente.
- Generación de audio asociado a la escena (diálogo, sonido ambiente, foley y música), descrito en la model card como parte del prompt.
- Soporte de prompts largos y de tipo "director" gracias a datos de conector ajustados (introducido en la v1.2 para reducir el *face drift*).
- Integración con LoRAs de destilación DMD para acelerar la inferencia y ampliar la variedad de movimiento.
- Compatibilidad con flujos de trabajo de ComfyUI a través de los nodos del autor (10S-Comfy-nodes).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.

## Casos de uso

- **Prototipado de animación a partir de fotograma fijo en ComfyUI**: cargando el GGUF en un flujo image-to-video con los nodos 10S, se puede generar una secuencia animada a partir de una imagen de referencia y evaluar el movimiento antes de comprometerse a un render de mayor calidad.
- **Previsualización de storyboards**: el modelo permite convertir ilustraciones o keyframes en clips cortos para validar la puesta en escena y la continuidad de movimiento antes de producir la animación final.
- **Generación de clips con audio integrado**: al aceptar descripciones de diálogo, tono de voz y sonido ambiente en el prompt, sirve para producir borradores de escenas con banda sonora y foley sincronizados temporalmente.
- **Investigación sobre merges y compuertas de atención**: la serie 10Eros documenta explícitamente cómo cambia el comportamiento al modificar `attn_1` y `attn_2`, lo que la hace útil como caso de estudio de edición de pesos en modelos de difusión de vídeo.
- **Pruebas de LoRAs de destilación DMD**: al estar diseñado para combinarse con LoRAs híbridas DMD, permite evaluar el equilibrio entre velocidad de muestreo y calidad de movimiento en pipelines de destilación.
- **Creación de contenido para adultos con control de prompt**: el modelo está orientado explícitamente a contenido sexual y anatomía detallada; se usaría en flujos creativos de nicho con prompts anatómicos y directivos, siempre bajo las restricciones legales y de plataforma aplicables.
- **Evaluación comparativa de cuantizaciones GGUF**: al existir versiones INT8 y fp8 alternativas enlazadas desde la model card, el GGUF permite comparar calidad y consumo de VRAM frente a esas variantes en el mismo flujo de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. Con ~21.000 millones de parámetros, una cuantización de 8 bits requeriría del orden de 21 GB solo para pesos, más el overhead de activaciones y del VAE de vídeo; una cuantización de 4 bits rondaría los 11-12 GB de pesos. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- **GPU recomendadas**: no especificadas en la información disponible. Por tamaño, el modelo completo en precisión alta excede las GPU de consumo y requiere A100/H100 de 80 GB o configuraciones multi-GPU; las cuantizaciones GGUF de menor bits son las que podrían caber en GPU de consumo.
- **¿Cabe en GPU de consumo?**: no confirmado. El repositorio de 179 GB sugiere que las variantes de mayor calidad no caben en una sola GPU de consumo; las variantes GGUF de menor cuantización son la vía prevista para ello, pero no se detallan los archivos concretos.
- **Opciones de despliegue**: ComfyUI con los nodos 10S-Comfy-nodes (vía principal indicada por el autor), y el ecosistema diffusers para el modelo base. No se mencionan vLLM, TGI ni Ollama, que no aplican a un modelo de difusión de vídeo.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LTX2.3-10Eros-1.5-GGUF (este) | ~21,0 B | no disponible | GGUF | no disponible | Cuantización GGUF para ComfyUI de un merge orientado a contenido explícito |
| TenStrip/LTX2.3-10Eros | ~21,0 B (base) | no disponible | safetensors/diffusers | no disponible | Modelo base original del que deriva esta cuantización |
| SulphurAI/Sulphur-2-base | no disponible | no disponible | no disponible | no disponible | Dependencia declarada; aporta pesos de movimiento explícito |
| LTX-2.3 (modelo original de Lightricks) | no disponible en la información | no disponible | no disponible | no disponible | Familia base sobre la que se construyen los merges 10Eros |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Contenido explícito**: el modelo está diseñado y documentado para generar contenido sexual y anatomía explícita; no es apto para entornos laborales, plataformas con políticas de contenido o productos dirigidos al público general.
- **Licencia no declarada**: al no especificarse licencia, no hay garantía de uso comercial; debe contactarse con el autor o el modelo base antes de cualquier despliegue productivo.
- **Madurez e historial**: cero descargas y cero likes en el momento de la consulta, y una serie de versiones (1.0 a 1.5) con problemas reconocidos por el propio autor (deriva facial, anatomía fantasma, subtítulos no deseados, transiciones inesperadas) que se han ido mitigando parcialmente.
- **Dependencia de prompts muy estrictos**: el autor advierte que el modelo tiene "muy poco auto-razonamiento" y que sin prompts directivos y descriptivos no genera movimiento útil; requiere refinamiento intenso del prompt.
- **Dependencia de LoRAs externas**: el rendimiento óptimo depende de LoRAs DMD híbridas y de nodos de terceros (10S-Comfy-nodes), lo que añade fragilidad al pipeline.
- **Riesgo de alucinación visual**: la model card menciona problemas de anatomía extra, subtítulos y transiciones no solicitadas, especialmente en versiones anteriores; la v1.5 los reduce pero no los elimina por completo.
- **Idiomas no especificados**: no hay información sobre el soporte multilingüe de los prompts; la documentación está íntegramente en inglés.
- **Requisitos de hardware elevados**: el tamaño del repositorio (179 GB) y los ~21 B de parámetros implican necesidades de VRAM y almacenamiento considerables, no cuantificadas oficialmente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dorotheou/LTX2.3-10Eros-1.5-GGUF
- Modelo base: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Dependencia Sulphur-2: https://huggingface.co/SulphurAI/Sulphur-2-base
- Nodos ComfyUI: https://github.com/TenStrip/10S-Comfy-nodes
- LoRA DMD híbrida v2: https://huggingface.co/TenStrip/LTX2.3_DMD_Lora/blob/main/LTX2.3_DMD_hybrid_v2.safetensors
- LoRAs DMD híbridas alternativas: https://huggingface.co/maximsobolev275/LTX2.3-DMD-Distill-Lora-Hybrids
- Versión INT8 con merge híbrido v2: https://huggingface.co/CornLogic/10EROS-INT8/tree/main
- Versión INT8 de calidad (fp8): https://huggingface.co/LokkenJP/10EROS_1.5_fp8_exp_learned
- Flujo de trabajo DMD V5: https://huggingface.co/TenStrip/LTX2.3-10Eros_Workflows/blob/main/10Eros_10SNodes_I2V_Basic_DMD_V5.json
- Versión v1 GGUF: https://huggingface.co/vantagewithai/LTX2.3-10Eros-GGUF
- Versión v1.2 GGUF: https://huggingface.co/vantagewithai/LTX2.3-10Eros-1.2-GGUF
- Versión v1.3 GGUF: https://huggingface.co/vantagewithai/LTX2.3-10Eros-1.3-GGUF
- Versión v1.4 GGUF: https://huggingface.co/vantagewithai/LTX2.3-10Eros-1.4-GGUF
- Canal de YouTube del autor: https://www.youtube.com/@vantagewithai
