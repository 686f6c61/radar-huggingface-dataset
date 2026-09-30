# filippovg199/Qwen2.5-7B-Instruct-abliterated-v2

## Resumen

filippovg199/Qwen2.5-7B-Instruct-abliterated-v2 es una derivacion del modelo instruccional Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por el usuario filippovg199 como espejo del trabajo original de huihui-ai. El modelo ha sido sometido a *abliteration*, una tecnica de edicion de pesos que identifica y elimina la direccion de activacion asociada al rechazo de peticiones, con el objetivo de reducir el comportamiento de negativa sin reentrenar el modelo desde cero. El resultado es una variante sin censura, orientada a generacion de texto conversacional y a casos de uso donde las politicas de seguridad del modelo original resultan demasiado restrictivas.

El modelo conserva la arquitectura densa de Qwen2.5 para 7B: un transformer decoder-only con atencion por grupos de consultas (GQA) y 7.615.616.512 parametros reales (7,6B), tal y como confirman los pesos en safetensors. La licencia se mantiene en Apache 2.0, igual que el modelo base, y el repositorio ocupa 15,2 GB, lo que corresponde a pesos en precision de 16 bits sin cuantizar. El pipeline declarado es text-generation y es compatible con Text Generation Inference y con endpoints alojados.

La relevancia de esta ficha radica en que, a fecha de publicacion, el repositorio de filippovg199 acumula 0 descargas y 0 "me gusta", por lo que se trata de un espejo practicamente sin traccion. La referencia canonica es el repositorio de huihui-ai, que incluye los resultados de evaluacion y el script de evaluacion utilizado. Conviene tener presente que la abliteracion no solo elimina rechazos, sino que degrada ligeramente algunas metricas de veracidad, algo que se detalla en la seccion de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), con atencion por grupos de consultas (GQA) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card de esta derivacion; el modelo base Qwen2.5-7B-Instruct declara 131.072 tokens (32.768 nativos, ampliables con YaRN) |
| Tipos de cuantizacion | no disponible en el repositorio original (solo safetensors en fp16/bf16); existen conversiones GGUF de terceros |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara (13 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct original: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, codificaciones posicionales rotatorias (RoPE) y atencion con mecanismo GQA, que reduce el numero de cabezas de clave/valor para abaratar la inferencia con contextos largos. No hay mezcla de expertos ni capas recurrentes: es un modelo denso puro de 7,6B parametros, lo que simplifica el despliegue y el calculo de requisitos de memoria.

El entrenamiento original de Qwen2.5 se realizo sobre un corpus de hasta 18 billones de tokens (segun la documentacion publica de la familia Qwen2.5), seguido de ajuste instruccional y alineacion. Sobre esa base, esta variante aplica *abliteration*: se calculan las direcciones de activacion que correlacionan con respuestas de rechazo y se ortogonalizan las matrices de pesos correspondientes para suprimir esa direccion. El metodo sigue el articulo de mlabonne sobre abliteration y el codigo original de FailSpy. La model card no documenta el numero de tokens adicionales, la composicion del dataset ni si hubo fases de RLHF o DPO posteriores a la edicion, por lo que esos datos se consideran no disponibles.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat propia de Qwen (roles system, user y assistant).
- Razonamiento de varios pasos y resolucion de problemas de nivel intermedio, con resultados medidos en BBH (53,01) y GPQA (32,17).
- Generacion y comprension de codigo, heredada del modelo base instruccional.
- Matematicas de nivel escolar y universitario basico, sin datos desglosados en la model card.
- Capacidad multilingue en 13 idiomas: chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, thai y arabe.
- Reduccion del comportamiento de rechazo: el modelo responde a peticiones que el Qwen2.5-7B-Instruct original declinaria, que es el objetivo declarado de la abliteration.
- Soporte de tool calling y function calling: heredado del modelo base, aunque no se documenta explicitamente en la model card de esta derivacion.
- Compatibilidad con el ecosistema transformers, con Text Generation Inference y con endpoints compatibles.
- No se documentan capacidades de vision ni de audio; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Investigacion sobre alineacion y seguridad: este modelo permite estudiar empiricamente como la eliminacion de una direccion de activacion afecta a las tasas de rechazo y a metricas de veracidad como TruthfulQA, comparando contra el modelo base sin modificar.
- Analisis de contenido sensible con fines academicos: redaccion y estudio de material sobre temas que el modelo original rechazaria (por ejemplo, analisis de discurso de odio, descripcion de tacticas de ingenieria social o escenarios de ficcion violenta), siempre en entornos controlados y con supervision humana.
- Generacion creativa sin friccion: escritura de ficcion con tematicas adultas, violencia narrativa o humor negro, donde las negativas del modelo alineado interrumpen el flujo de trabajo.
- Asistentes conversacionales especializados: con 7,6B parametros y licencia Apache 2.0, el modelo se puede autoalojar en una GPU de 24 GB para construir un chatbot de dominio especifico con contexto largo.
- Evaluacion comparativa de tecnicas de edicion de pesos: sirve como punto de referencia para medir el coste en rendimiento de la abliteration frente al modelo original en MMLU Pro, BBH o IF_Eval.
- Generacion de codigo en entornos internos: al ser un modelo denso y ligero, puede desplegarse con vLLM en una unica GPU para autocompletado y refactorizacion dentro de una red corporativa, sin depender de APIs externas.
- Traduccion y procesamiento multilingue: cubre 13 idiomas, incluidos pares poco frecuentes como thai-espanol o vietnamita-aleman, en tareas de traduccion informal o preprocesamiento de corpus.
- Red teaming y evaluacion de filtros: util para probar si los sistemas de moderacion de una aplicacion detectan contenido que un modelo sin alineacion puede generar.

## Benchmarks y rendimiento

Los datos proceden de la model card del repositorio original de huihui-ai. Los valores de la columna "abliterated-v2" corresponden a esta variante; se comparan con el modelo base y con la version abliterated anterior.

| Benchmark | Qwen2.5-7B-Instruct | abliterated-v2 (este modelo) | abliterated (v1) |
|---|---|---|---|
| IF_Eval | 76,44 | 77,82 | 76,49 |
| MMLU Pro | 43,12 | 42,03 | 41,71 |
| TruthfulQA | 62,46 | 57,81 | 64,92 |
| BBH | 53,92 | 53,01 | 52,77 |
| GPQA | 31,91 | 32,17 | 31,97 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni MMLU estandar para esta variante.

## Requisitos de hardware

- VRAM en fp16/bf16: aproximadamente 15,2 GB solo para los pesos, mas la cache KV; con contexto largo se superan facilmente los 18-20 GB.
- VRAM en int8: en torno a 8 GB para los pesos.
- VRAM en 4 bits: en torno a 4,5-5 GB para los pesos, lo que deja margen para contexto en GPUs de 8-12 GB.
- GPU recomendadas para produccion: A100 40 GB, A100 80 GB, H100, L40S o L4. Para fp16 con contexto amplio se recomienda al menos 24 GB.
- Consumer GPU: cabe en RTX 4090 y RTX 3090 (24 GB) en fp16 con contexto moderado; en RTX 4080, 4070 Ti o 3080 (12-16 GB) es necesario cuantizar a 4 u 8 bits.
- Cabe tambien en GPUs de 8 GB (RTX 3060 Ti, RTX 2070) unicamente con cuantizacion de 4 bits y ventanas de contexto reducidas.
- Opciones de despliegue: transformers (referencia de la model card), vLLM, Text Generation Inference, SGLang, llama.cpp y Ollama para cuantizaciones GGUF.
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Alineacion | Disponibilidad |
|---|---|---|---|---|---|
| filippovg199/Qwen2.5-7B-Instruct-abliterated-v2 | 7,6B | no especificado (base: 131.072 tokens) | Apache 2.0 | Eliminada por abliteration | Espejo con 0 descargas |
| huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2 | 7,6B | no especificado (base: 131.072 tokens) | Apache 2.0 | Eliminada por abliteration | Repositorio original, con script de evaluacion |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 131.072 tokens | Apache 2.0 (con condiciones para algunos usos) | Alineado con rechazos | Modelo oficial, ampliamente desplegado |
| richardyoung/qwen2.5-7b-instruct-abliterated | 7,6B | no disponible | Apache 2.0 | Reducida con la herramienta Heretic | Distribuido como build de Ollama |

En benchmarks, el modelo base supera a esta variante en MMLU Pro (43,12 frente a 42,03) y en BBH (53,92 frente a 53,01), mientras que la variante abliterated-v2 obtiene mejores resultados en IF_Eval (77,82 frente a 76,44) y GPQA (32,17 frente a 31,91). La diferencia mas acusada es TruthfulQA, donde el modelo base alcanza 62,46 y esta variante cae a 57,81.

## Limitaciones y advertencias

- La abliteration elimina la direccion de rechazo, pero no sustituye la alineacion: el modelo puede generar contenido danino, ilegal o eticamente problematico sin ofrecer negativas. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- Caida medible en TruthfulQA (de 62,46 a 57,81, unos 4,6 puntos), lo que indica una mayor propension a afirmaciones falsas o no verificadas en preguntas de veracidad.
- Descenso moderado en MMLU Pro (1,09 puntos) y BBH (0,91 puntos) respecto al modelo base, atribuible al proceso de edicion de pesos.
- La model card no documenta explicitamente la longitud de contexto soportada ni los tipos de cuantizacion oficiales; hay que remitirse a las especificaciones del modelo base.
- Es un espejo de terceros con 0 descargas y 0 "me gusta": no hay garantia de mantenimiento, actualizaciones ni soporte. Para uso en produccion es preferible referenciar el repositorio original de huihui-ai.
- Licencia Apache 2.0 permite uso comercial, pero la eliminacion de la alineacion puede entrar en conflicto con las politicas de uso aceptable de proveedores de servicios en la nube o con normativa sectorial.
- Riesgo de sesgos heredados del corpus de entrenamiento de Qwen2.5, que no se ha reevaluado tras la abliteration.
- No hay datos publicados de rendimiento en codigo, matematicas o tareas de agentes para esta variante concreta.
- El uso de esta variante para generar contenido puede tener implicaciones legales segun la jurisdiccion; se recomienda revisar la normativa aplicable antes de desplegarla.

## Enlaces

- Repositorio en HuggingFace de esta ficha: https://huggingface.co/filippovg199/Qwen2.5-7B-Instruct-abliterated-v2
- Repositorio original de la variante abliterated-v2: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2
- Version abliterated anterior: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Articulo de referencia sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- Script de evaluacion de la variante original: https://huggingface.co/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2/blob/main/eval.sh
- Build de Ollama con abliteration alternativa: https://ollama.com/richardyoung/qwen2.5-7b-instruct-abliterated
- Repositorio de la serie Qwen2.5: https://github.com/mx4ai/qwen2.5
- Espejo en ModelHub: https://dev.modelhub.org.cn/huihui-ai/Qwen2.5-7B-Instruct-abliterated-v2
