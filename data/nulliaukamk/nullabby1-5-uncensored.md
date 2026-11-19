# nulliaukamk/nullabby1.5-uncensored

## Resumen

nullabby1.5-uncensored es un ajuste fino del modelo nulliaukamk/nullabby1.5-merged, a su vez derivado de Qwen/Qwen3.5-9B. Lo desarrolla el usuario nulliaukamk y su rasgo distintivo es haber sido sometido a un proceso de "decensoring" o abliteration mediante la herramienta Heretic v2.1.0, que elimina la tendencia del modelo original a rechazar peticiones. El resultado es un modelo de 9.409.813.744 parametros (aproximadamente 9,4 mil millones) con licencia Apache 2.0 y pesos en safetensors.

El modelo resuelve el problema de los rechazos en produccion: segun la model card, pasa de 84 rechazos sobre 100 en el modelo original a 0 sobre 100 tras la ablacion, con una divergencia KL de 0,0760 respecto al original. Esta pensado para casos donde el modelo base rechaza peticiones legitimas y se necesita una respuesta sin filtros previos. La arquitectura subyacente es la de Qwen3.5-9B, un transformer denso con capacidades multimodales (pipeline image-text-to-text) y generacion de texto.

Es relevante ahora porque combina tres elementos: un modelo base reciente (Qwen3.5), un proceso de abliteration reproducible documentado con parametros concretos, y una licencia permisiva (Apache 2.0) que facilita su uso comercial. El repositorio ocupa 18,9 GB e incluye el directorio `reproduce` con instrucciones para replicar el proceso. No obstante, el modelo solo declara soporte para ingles y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no documentadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de unos 9,4 mil millones de parametros con capacidad multimodal (procesa imagen y texto, segun el pipeline image-text-to-text). Sobre esa base se realizo un ajuste fino (nullabby1.5-merged) entrenado con Unsloth y la libreria TRL de Hugging Face, segun indica la model card.

La innovacion tecnica principal es la ablacion de rechazos mediante Arbitrary-Rank Ablation (ARA) de Heretic v2.1.0. Los parametros documentados son: start_layer_index 5, end_layer_index 22, preserve_good_behavior_weight 0,8811, steer_bad_behavior_weight 0,0109, overcorrect_relative_weight 0,7735 y neighbor_count 13. El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a respuestas sin rechazos.
- Procesamiento de imagen y texto (pipeline image-text-to-text), heredado de la base Qwen3.5.
- Razonamiento y generacion de codigo y matematicas: capacidades propias de la familia Qwen3.5, aunque no se documentan resultados concretos en la model card.
- Modo "uncensored": 0 rechazos sobre 100 peticiones de prueba frente a 84 del modelo original.
- Compatibilidad con text-generation-inference y endpoints_compatible, segun los tags del repositorio.
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language`.

## Casos de uso

- Generacion creativa sin filtros: escritura de ficcion, dialogos o guiones donde el modelo base rechazaria escenas violentas o adultas; el proceso de abliteration elimina esos rechazos manteniendo una divergencia KL baja (0,0760) respecto al original.
- Investigacion sobre alineacion y seguridad: el modelo sirve como caso de estudio reproducible de abliteration, con parametros ARA documentados y directorio `reproduce` para replicar el proceso y medir el impacto en el comportamiento.
- Asistente conversacional de dominio tecnico: al no rechazar peticiones por contenido sensible, resulta adecuado para entornos controlados donde el filtrado se gestiona en la capa de aplicacion y no en el modelo.
- Procesamiento de documentos con imagenes: gracias a su pipeline image-text-to-text, puede extraer y describir contenido de capturas, diagramas o formularios en flujos de digitalizacion.
- Generacion de codigo en pipelines internos: el modelo puede integrarse via text-generation-inference o transformers en herramientas de autocompletado y revision, con la salvedad de que no se documenta tool calling.
- Prototipado rapido de aplicaciones de chat: con 9,4 B de parametros y pesos safetensors, se puede desplegar en una unica GPU para pruebas de concepto y demos internas.
- Analisis de contenido multimodal en moderacion: puede emplearse para clasificar o describir imagenes y texto en sistemas de revision, aprovechando su capacidad de entrada imagen-texto.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (nullabby1.5-merged) |
|---|---|---|
| Rechazos | 0/100 | 84/100 |
| Divergencia KL | 0,0760 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos (9,4 B x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- En cuantizacion de 8 bits: unos 9,4 GB de pesos; en 4 bits: unos 4,7 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090 (24 GB) tambien es viable en FP16 con contexto moderado.
- Cabe en GPU consumer de gama alta (RTX 4090, RTX 3090) en FP16; en GPUs de 16 GB o menos requeriria cuantizacion, no publicada por el autor.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag del repositorio) y, previsiblemente, vLLM y llama.cpp si se generan cuantizaciones GGUF, aunque no se documentan.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| nullabby1.5-uncensored | ~9,4 B | no disponible | Apache 2.0 | en | Abliterated con Heretic, 0/100 rechazos |
| nullabby1.5-merged (original) | ~9,4 B | no disponible | Apache 2.0 | en | 84/100 rechazos, KL 0 |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | no disponible | no disponible | Modelo base de la familia Qwen3.5 |
| Alternativas abliterated de la familia Qwen | ~7-9 B | variable | variable | variable | No se dispone de datos comparativos concretos en la informacion |

No se dispone de datos de rendimiento (benchmarks) de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia e idioma.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos, lo que implica que el modelo puede generar contenido danino, ilegal o sensible sin filtro; requiere moderacion externa en produccion.
- La divergencia KL de 0,0760 respecto al original indica cambios en la distribucion de salida que pueden afectar a la calidad en tareas generales, no solo en rechazos.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- Riesgo de alucinacion inherente a los modelos de 9 B; no hay evaluaciones publicadas de factualidad.
- Sesgos conocidos: no documentados en la model card; al derivar de Qwen3.5, hereda los sesgos del corpus de entrenamiento original.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes, sin validacion de la comunidad.
- No se publican cuantizaciones oficiales, lo que limita el despliegue en hardware de gama media.
- El repositorio se creo y actualizo el mismo dia (19-11-2026), sin historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/nulliaukamk/nullabby1.5-uncensored
- Modelo base del ajuste: https://huggingface.co/nulliaukamk/nullabby1.5-merged
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.5-9B
- Heretic (herramienta de abliteration): https://heretic-project.org
- Unsloth: https://github.com/unslothai/unsloth
- Directorio de reproduccion: https://huggingface.co/nulliaukamk/nullabby1.5-uncensored/tree/main/reproduce
