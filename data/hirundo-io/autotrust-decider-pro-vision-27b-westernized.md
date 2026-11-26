# hirundo-io/AutoTrust-Decider-Pro-Vision-27B-westernized

## Resumen

AutoTrust-Decider-Pro-Vision-27B-westernized es un modelo multimodal de tipo image-text-to-text derivado del modelo base autotrust/AutoTrust-Decider-Pro-Vision-27B mediante un proceso de merge y ajuste orientado a la mitigacion de sesgos, etiquetado por su autor (hirundo-io) como "westernized". El modelo conserva la arquitectura del modelo base, identificada en los metadatos como qwen3_5, y cuenta con 27.781.427.952 parametros (aproximadamente 27,8 mil millones), lo que lo situa en la categoria de modelos densos de gran tamano con capacidad de procesamiento de imagenes y texto.

El modelo esta disenado como un "decision-model", es decir, un modelo orientado a tareas de toma de decisiones y evaluacion, con enfasis declarado en la mitigacion de sesgos. Su relevancia actual radica en la creciente demanda de sistemas que no solo generen contenido, sino que emitan juicios estructurados y razonados sobre informacion multimodal, con un control explicito sobre la orientacion cultural de sus respuestas.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face. No se han publicado detalles sobre el dataset de entrenamiento, los benchmarks ni la composicion del merge, por lo que muchos apartados tecnicos se marcan como "no disponible". El acceso al repositorio esta restringido y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text, segun tag del modelo base) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 56,0 GB |
| Pipeline | image-text-to-text |
| Acceso | restringido (gated) |
| Modelo base | autotrust/AutoTrust-Decider-Pro-Vision-27B |
| Tipo de derivacion | merge sobre el modelo base |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia qwen3_5, segun la etiqueta del modelo base, lo que implica un transformer multimodal con codificador de vision y decodificador de lenguaje. El modelo hereda la estructura del base autotrust/AutoTrust-Decider-Pro-Vision-27B y se ha generado mediante un merge (tag `base_model:merge`), no mediante un entrenamiento desde cero. El autor anade la etiqueta "westernized" y "bias-mitigation", lo que sugiere un ajuste orientado a alinear la orientacion cultural y reducir sesgos del modelo original, aunque no se documenta la metodologia concreta (mezcla de pesos, fine-tuning posterior, DPO o RLHF).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Tampoco se detalla la naturaleza del merge ni los parametros de interpolacion utilizados. Toda esta informacion debe considerarse no disponible a partir de los metadatos publicos.

## Capacidades

- Generacion de texto y razonamiento conversacional en formato multi-turno.
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text): descripcion, analisis y respuesta a consultas sobre contenido visual.
- Orientacion a toma de decisiones ("decision-model"): emision de juicios o recomendaciones estructuradas.
- Mitigacion de sesgos declarada por el autor, con orientacion cultural "westernized".
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluacion automatizada de decisiones: el modelo puede recibir un caso (texto e imagen) y emitir una recomendacion razonada, aprovechando su orientacion como decision-model para tareas de triaje o scoring.
- Analisis de documentos con imagenes: extraccion de informacion de capturas, formularios o diagramas y generacion de resumenes o decisiones asociadas, gracias a su pipeline image-text-to-text.
- Moderacion de contenido con componente visual: clasificacion y justificacion de decisiones sobre imagenes y texto combinados, con el enfasis en mitigacion de sesgos como criterio adicional.
- Asistentes conversacionales multimodales: atencion a usuarios que adjuntan imagenes y esperan respuestas contextualizadas en una conversacion multi-turno.
- Investigacion sobre sesgos y alineacion cultural: el modelo sirve como objeto de estudio para comparar su comportamiento "westernized" frente al modelo base y medir el efecto del merge en la orientacion de las respuestas.
- Prototipado de sistemas de soporte a la decision en entornos controlados: dado su tamano (~27,8 B) y licencia Apache 2.0, puede desplegarse en infraestructura propia para pilotos internos sin dependencia de APIs externas.
- Generacion de informes visuales: descripcion y analisis de imagenes tecnicas con texto explicativo, util en documentacion o auditoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 55-56 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda al menos 80 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB; en 4 bits, en torno a 14-16 GB (estimaciones teoricas, no verificadas con el modelo).
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (2x RTX 4090 24 GB o 2x A6000 48 GB) para precision completa.
- Cabe en GPU consumer: en cuantizacion de 4 bits podria caber en una RTX 4090 (24 GB) o RTX 3090, siempre que se generen pesos cuantizados, que no se distribuyen en el repositorio.
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp/Ollama requeririan conversion a GGUF no disponible oficialmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| hirundo-io/AutoTrust-Decider-Pro-Vision-27B-westernized | ~27,8 B | no disponible | Apache 2.0 | Gated | Merge "westernized" con mitigacion de sesgos |
| autotrust/AutoTrust-Decider-Pro-Vision-27B | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Qwen3-VL (familia) | variable | no disponible | no disponible | no disponible | Familia de referencia segun tag qwen3_5 |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- No se documentan los idiomas soportados; el etiquetado "westernized" sugiere una orientacion cultural concreta que puede introducir sesgo en la direccion opuesta a la que se pretende mitigar.
- Riesgo de alucinacion inherente a los modelos generativos de ~27,8 B, agravado por la ausencia de benchmarks publicados.
- No se han publicado evaluaciones de sesgo, seguridad ni robustez que respalden la etiqueta "bias-mitigation".
- La licencia Apache 2.0 permite uso comercial, pero el acceso gated y la falta de documentacion sobre el modelo base pueden limitar su adopcion en produccion.
- El modelo es un merge no entrenado desde cero; su comportamiento puede heredar defectos del base sin garantias de mejora.
- No se distribuyen pesos cuantizados, lo que encarece el despliegue en hardware consumer.
- Sin datos de contexto maximo, no puede garantizarse su uso en tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/hirundo-io/AutoTrust-Decider-Pro-Vision-27B-westernized
- Modelo base: https://huggingface.co/autotrust/AutoTrust-Decider-Pro-Vision-27B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
