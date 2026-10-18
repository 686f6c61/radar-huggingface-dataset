# lafintiger/Huihui-Ornith-1.5-35B-A3B-abliterated-tiiny

## Resumen

Huihui-Ornith-1.5-35B-A3B-abliterated-tiiny es una recarga (relabelled copy) sin modificaciones de pesos del modelo huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, publicada por el usuario lafintiger. El unico cambio respecto al original es la metadata: se ha etiquetado con `base_model: Qwen/Qwen3.6-35B-A3B` (misma arquitectura) para que el modelo pueda importarse en un dispositivo Tiiny. Por tanto, no aporta pesos nuevos ni un entrenamiento adicional: es un espejo del trabajo de huihui-ai, que a su vez deriva de ornith-ai/Ornith-1.5-35B-A3B mediante tecnicas de abliteration (eliminacion de rechazos).

El modelo subyacente es un transformer de tipo Mixture of Experts con 35.951.822.704 parametros totales (segun los safetensors del repositorio), etiqueta de arquitectura `qwen3_5_moe` y un peso en disco de 71,9 GB. El sufijo A3B del nombre indica la nomenclatura de expertos activos de la familia Qwen3-MoE, aunque el dato exacto de parametros activos no esta confirmado en la informacion disponible. Es relevante ahora porque combina tres factores poco habituales: licencia MIT, un ajuste "uncensored" que reduce los rechazos en capas concretas (11 a 29) y compatibilidad con `transformers` y con endpoints.

La relevancia practica es limitada pero clara para quien quiera desplegar una variante sin filtros de rechazo de la familia Ornith/Qwen3.6 en un entorno autoalojado, con licencia permisiva y sin depender de los repositorios originales. Conviene tener en cuenta que el numero de descargas y de "likes" es cero y que la ficha no documenta contexto, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`), multimodal segun tag `image-text-to-text` |
| Parametros totales | 35.951.822.704 |
| Parametros activos | No disponible (la nomenclatura A3B del nombre sugiere ~3B activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors en el repositorio, sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | No disponible |
| Licencia | MIT (enlace de licencia apunta a ornith-ai/Ornith-1.5-35B-A3B) |
| Formato de pesos | Safetensors (`transformers`), repositorio de 71,9 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.6-MoE (`qwen3_5_moe`), es decir, un transformer con capas de mezcla de expertos dispersa. Los pesos son exactamente los del modelo huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated, que a su vez parte de ornith-ai/Ornith-1.5-35B-A3B. Esta recarga no entrena ni afina nada: solo cambia la metadata de `base_model` para permitir la importacion en un dispositivo Tiiny.

La innovacion tecnica relevante no esta en este repositorio sino en el proceso de abliteration aplicado por huihui-ai, descrito como una implementacion "cruda" y de prueba de concepto para eliminar rechazos sin usar TransformerLens (utilidad `remove-refusals-with-transformers`). El autor original indica que solo se ablacionaron las capas 11 a 29, de modo que el resto de la red conserva el comportamiento del modelo de partida. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline declarado (`text-generation`).
- Modo de razonamiento con bloques `think`: el codigo de ejemplo del autor detecta la etiqueta `</think>` para medir tokens de pensamiento, lo que implica soporte de razonamiento explicito previo a la respuesta.
- Capacidad multimodal de entrada imagen-texto, segun el tag `image-text-to-text` del repositorio (no verificada en la model card).
- Respuestas sin mecanismos de rechazo en el rango de capas ablacionado (11-29), orientado a contenido que los modelos alineados rechazarian.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer` con `trust_remote_code=True`.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue tras una API compatible con OpenAI.
- Tool calling, soporte de agentes, capacidades multilingues y otras habilidades del modelo base: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo sirve como sujeto de estudio para medir cuanto cambia la tasa de rechazos al ablacionar unicamente las capas 11 a 29, comparando respuestas contra el Ornith-1.5 original capa por capa.
- Despliegue autoalojado de un asistente conversacional sin filtros de rechazo: con licencia MIT y pesos safetensors, puede montarse en infraestructura propia para entornos de investigacion donde las negativas del modelo base bloquean la tarea.
- Analisis de contenido sensible en moderacion y seguridad: al no rechazar, permite generar ejemplos de texto danino en laboratorio para entrenar o evaluar clasificadores de contenido, siempre dentro de un marco controlado.
- Evaluacion de reasoning con trazas de pensamiento: el soporte de bloques `think` permite extraer la cadena de razonamiento y medir su longitud o calidad frente a la respuesta final en tareas de matematicas y logica.
- Pruebas de integracion en pipelines `transformers`: util para validar el codigo de carga con `trust_remote_code` y `device_map="auto"` antes de migrar al repositorio original de huihui-ai, del que este es un espejo.
- Prototipado de interfaces imagen-texto: si se confirma la capacidad multimodal del tag, serviria para experimentos de descripcion de imagenes o VQA en entornos de investigacion, aunque la falta de documentacion obliga a verificar el procesador de imagenes.
- Benchmarking de rendimiento MoE en hardware propio: con ~36B parametros totales y activacion dispersa, es un banco de pruebas razonable para medir throughput de decodificacion en GPUs de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 72 GB solo para pesos (el repositorio ocupa 71,9 GB), mas KV cache y overhead; en la practica requiere 80 GB o mas para contexto corto.
- VRAM estimada con cuantizacion: no hay variantes cuantizadas publicadas. Como referencia aritmetica, int8 rondaria los 36 GB e int4 los 18-20 GB, pero serian necesarias conversiones propias (por ejemplo, a GGUF) no disponibles en el repositorio.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bf16 en una sola tarjeta; configuraciones multi-GPU (2x A100 40 GB, 2x RTX 4090 24 GB con tensor parallel) para reparto de pesos.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 en bf16; solo seria viable tras cuantizacion agresiva a 4 bits, no publicada.
- Opciones de despliegue: `transformers` con `device_map="auto"` y `trust_remote_code=True` es la via documentada. vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura en la informacion disponible y requeririan verificar soporte de `qwen3_5_moe`.
- Latencia y throughput: no disponibles. Al ser un MoE con activacion dispersa, el throughput por token deberia ser mas alto que el de un modelo denso de 36B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lafintiger/Huihui-Ornith-1.5-35B-A3B-abliterated-tiiny | 35,95B (MoE) | No disponible | Sin benchmarks publicados | MIT | Recarga con 0 descargas |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | No disponible (misma arquitectura) | No disponible | Sin benchmarks en esta informacion | MIT | Repositorio original del ajuste abliterated |
| ornith-ai/Ornith-1.5-35B-A3B | No disponible (misma arquitectura) | No disponible | Sin benchmarks en esta informacion | MIT | Modelo de partida, con alineacion intacta |
| Qwen/Qwen3.6-35B-A3B | No disponible (etiqueta `base_model`) | No disponible | Sin benchmarks en esta informacion | No disponible | Repositorio base de la familia |

## Limitaciones y advertencias

- No es un modelo nuevo: los pesos son identicos a huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated y solo cambia la metadata. Cualquier evaluacion debe remitirse al repositorio original.
- Modelo "uncensored" por diseno: la abliteration elimina los rechazos en las capas 11 a 29, por lo que puede producir contenido toxico, ilegal o peligroso sin advertir. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- Riesgo de degradacion cognitiva: el autor original califica el proceso de "crudo" y de prueba de concepto; la ablacion parcial puede afectar a la coherencia y aumentar las alucinaciones, algo no cuantificado en la informacion disponible.
- Estado de la ablacion: solo se modificaron las capas 11 a 29; el resto mantiene el comportamiento alineado, lo que produce un comportamiento inconsistente entre tipos de peticion.
- Falta total de documentacion: sin contexto declarado, sin idiomas, sin datos de entrenamiento y sin benchmarks. No hay base para afirmar calidad en tareas concretas.
- Licencia: MIT segun la model card, pero el enlace de licencia apunta al repositorio de ornith-ai, no a un fichero LICENSE incluido en este repositorio. Conviene verificar los terminos antes de uso comercial.
- Repositorio sin traccion: 0 descargas y 0 likes, creado y actualizado el 18 de octubre de 2026 con 42 minutos de diferencia. No hay garantia de mantenimiento ni de que los pesos se conserven.
- Compatibilidad de despliegue no verificada: la etiqueta `qwen3_5_moe` puede no estar soportada por versiones estables de vLLM, llama.cpp u Ollama.
- La busqueda web realizada no devolvio ningun resultado tecnico relevante sobre este modelo; toda la informacion procede de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lafintiger/Huihui-Ornith-1.5-35B-A3B-abliterated-tiiny
- Repositorio original del ajuste: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo de partida sin abliteration: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base declarado en la metadata: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia referenciada: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Herramienta de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Enlaces adicionales: no se han encontrado enlaces relevantes en la busqueda web.
