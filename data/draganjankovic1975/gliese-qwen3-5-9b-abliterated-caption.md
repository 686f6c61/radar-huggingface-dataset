# draganjankovic1975/Gliese-Qwen3.5-9B-Abliterated-Caption

## Resumen

Gliese-Qwen3.5-9B-Abliterated-Caption es un modelo vision-lenguaje de 9.409.813.744 parametros (~9,4B) derivado de Qwen/Qwen3.5-9B mediante tecnicas de "abliteration": analisis de direcciones de rechazo en el espacio latente de activaciones y posterior ajuste fino orientado a eliminar comportamientos de negativa del modelo. El resultado es un modelo multimodal (image-text-to-text) especializado en generacion de descripciones de imagen largas, detalladas y sin filtrado excesivo, pensado para anotacion de datasets, investigacion multimodal y pipelines de captioning.

El autor original es prithivMLmods; el repositorio analizado (draganjankovic1975/Gliese-Qwen3.5-9B-Abliterated-Caption) es un mirror declarado del original, con licencia Apache 2.0. La cadena de derivacion indicada en la model card pasa por huihui-ai/Huihui-Qwen3.5-9B-abliterated, que a su vez parte del Qwen3.5-9B de Alibaba. El modelo esta publicado bajo licencia Apache 2.0, soporta ingles y chino, y se distribuye en safetensors (bf16) y en una familia completa de cuantizaciones GGUF, incluyendo proyectores multimodales (mmproj) para llama.cpp.

Es relevante ahora porque combina tres factores poco frecuentes en un mismo paquete: tamano contenido (9B, desplegable en GPU de consumo con cuantizacion), capacidades de vision-lenguaje y una alineacion modificada orientada a reducir rechazos, lo que lo hace atractivo para generacion masiva de captions sin bloqueos en dominios sensibles (arte, medicina, contenido para adultos, forense), aunque con implicaciones eticas y de cumplimiento que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), familia Qwen3.5; clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, F32, Q8_0 (GGUF); proyectores mmproj en bf16, f16, f32, q8_0; safetensors en bf16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (BF16, F16, F32, Q8_0 + mmproj) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 con codificador visual y modulo de proyeccion hacia el espacio del modelo de lenguaje, empaquetado para `transformers` bajo la clase `Qwen3_5ForConditionalGeneration`. El repositorio ha sido re-fragmentado (re-sharded) para la version 5.3.0 de Transformers. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en la base.

La innovacion tecnica declarada es el proceso de abliteration: analisis de direcciones de rechazo mediante inspeccion de activaciones para localizar las direcciones latentes asociadas a comportamientos de negativa, y posterior entrenamiento orientado a mitigarlas, combinado con un ajuste fino especifico de captioning ("Abliterated Caption Training"). El modelo incluye dos plantillas de chat: una plantilla "Expert Image Captioning System" (recomendada) y una plantilla estandar por defecto. No se documentan tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido mas alla del tag `reasoning` del repositorio.

## Capacidades

- Generacion de descripciones de imagen largas, estructuradas y semanticamente detalladas (escenas, objetos, personas, entornos).
- Comprension visual multimodal: pipeline image-text-to-text con soporte de proyectores mmproj en llama.cpp.
- Generacion de texto conversacional y razonamiento (tags `reasoning`, `conversational`).
- Comportamiento de rechazo reducido (refusal-ablated), orientado a producir respuestas sin negativas en dominios que el modelo base filtraria.
- Soporte multilingue limitado a ingles y chino.
- Compatibilidad declarada con text-generation-inference, vLLM y endpoints compatibles.
- Plantillas de chat especializadas: una para captioning experto y otra estandar.
- No se documenta soporte explicito de tool calling, function calling ni audio en la informacion disponible.

## Casos de uso

- Generacion masiva de captions para datasets de entrenamiento multimodal: el modelo produce descripciones largas y detalladas, adecuadas para crear pares imagen-texto de alta calidad en corpus de investigacion, con la ventaja de no bloquear contenido en dominios habitualmente filtrados.
- Anotacion de imagenes en dominios sensibles: datasets medicos, forenses, de arte o de contenido para adultos donde los modelos alineados convencionales rechazan describir la imagen; el abliteration permite obtener la descripcion sin negativas.
- Enriquecimiento de bases de datos de imagenes y activos digitales: generacion automatica de metadatos descriptivos para DAM (digital asset management), catalogos de e-commerce o archivos fotograficos, usando la plantilla de captioning experto.
- Accesibilidad: generacion de descripciones alternativas (alt text) extensas para lectores de pantalla y plataformas de contenido, con mayor riqueza descriptiva que modelos de captioning corto.
- Investigacion en seguridad y alineacion: estudio empirico del efecto del abliteration sobre la calidad descriptiva, la tasa de rechazo y la fidelidad visual, comparando contra el modelo base Qwen3.5-9B.
- Pipelines locales de inferencia multimodal: despliegue en GGUF con llama.cpp sobre hardware de consumo para prototipado y procesamiento por lotes sin dependencia de API externa.
- Moderacion y analisis de contenido asistido: descripcion detallada de imagenes potencialmente sensibles para revision humana posterior, con la advertencia de que el modelo no incorpora filtros propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16 (pesos completos): ~18,8 GB, mas overhead de activaciones y cache KV; requiere GPU de 24 GB o superior para inferencia comoda.
- GGUF Q8_0: ~9,53 GB de pesos mas proyector mmproj (624 MB en q8_0); cabe en GPUs de 12-16 GB con margen limitado.
- GGUF F16/BF16: ~17,9 GB; requiere 24 GB o mas.
- GGUF F32: ~35,8 GB; requiere GPU profesional (A100 40/80 GB, H100) o CPU con RAM abundante.
- GPU recomendadas: A100 40/80 GB, H100 para bf16 y lotes grandes; RTX 4090 (24 GB) para bf16 con lote pequeno; RTX 3090/4080 (16-24 GB) para Q8_0; GPUs de 12 GB para Q8_0 con contexto reducido.
- Despliegue: `transformers` >= 5.3.0 (o desde el repositorio git de Hugging Face), text-generation-inference, vLLM, llama.cpp con soporte mmproj para la parte multimodal.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Gliese-Qwen3.5-9B-Abliterated-Caption | ~9,4B | no disponible | imagen-texto | Apache 2.0 | Abliterated, especializado en captioning |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | imagen-texto | no disponible en la informacion | Alineacion estandar, rechazos convencionales |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | ~9B | no disponible | texto/multimodal segun base | no disponible en la informacion | Abliteration generica, sin ajuste especifico de captioning |
| prithivMLmods/Gliese-Qwen3.5-9B-Abliterated-Caption | ~9,4B | no disponible | imagen-texto | Apache 2.0 | Repositorio original del que este es mirror |

## Limitaciones y advertencias

- El abliteration reduce los rechazos del modelo: puede generar contenido sensible, ofensivo o inapropiado sin advertir; el uso es responsabilidad exclusiva del usuario.
- Riesgo de alucinacion en descripciones visuales: al priorizar detalle y eliminar negativas, el modelo puede inventar elementos no presentes en la imagen.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- La model card no documenta sesgos especificos, pero al derivar de Qwen3.5 hereda los sesgos de sus datos de entrenamiento.
- No se documentan datos de entrenamiento, numero de tokens ni proceso de alineacion posterior; la trazabilidad es escasa.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede entrar en conflicto con politicas de plataformas, legislacion sobre moderacion de contenido o terminos de servicio de terceros.
- El repositorio analizado es un mirror con 0 descargas y 0 likes; conviene verificar la integridad de los pesos contra el repositorio original.
- No se declara longitud de contexto; planificar el despliegue con contexto conservador hasta verificarlo empiricamente.
- La model card indica que el modelo se materializa solo con fines de investigacion y aprendizaje.

## Enlaces

- Repositorio Hugging Face (mirror): https://huggingface.co/draganjankovic1975/Gliese-Qwen3.5-9B-Abliterated-Caption
- Repositorio original: https://huggingface.co/prithivMLmods/Gliese-Qwen3.5-9B-Abliterated-Caption
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo intermedio abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Plantilla de chat para captioning experto: https://huggingface.co/prithivMLmods/Gliese-Qwen3.5-9B-Abliterated-Caption/blob/main/chat_template.jinja
- Plantilla de chat estandar: https://huggingface.co/prithivMLmods/Gliese-Qwen3.5-9B-Abliterated-Caption/blob/main/standard-chat_template/chat_template.jinja
