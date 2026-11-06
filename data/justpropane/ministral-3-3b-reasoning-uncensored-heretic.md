# JustPropane/Ministral-3-3B-Reasoning-UNCENSORED-heretic

## Resumen

Ministral-3-3B-Reasoning-UNCENSORED-heretic es un ajuste fino derivado de `unsloth/Ministral-3-3B-Reasoning-2512`, que a su vez es la version post-entrenada para razonamiento del modelo Ministral 3 3B de Mistral AI. El autor del ajuste, JustPropane, ha aplicado la tecnica de abliteration o decensoring mediante la herramienta Heretic v2.0.0.dev0, con el objetivo de eliminar los comportamientos de rechazo (refusals) del modelo original. El resultado es un modelo de 3.849.090.048 parametros (3,4B en el language model mas 0,4B del vision encoder) que conserva la arquitectura Mistral 3 y la ventana de contexto de 256k tokens, pero con una tasa de rechazo declarada de 1/100 frente a los 91/100 del modelo original.

El modelo resuelve el problema de los rechazos en tareas de generacion de contenido que el modelo base considera sensibles, manteniendo una divergencia KL de 0,0170 respecto al original, lo que sugiere que la mayor parte del comportamiento general se preserva. Es relevante para desarrolladores que necesitan un modelo pequeno, desplegable en hardware de consumo, con capacidades de vision, razonamiento multi-paso y soporte de tool calling, pero que no quieren lidiar con negativas del modelo en dominios como escritura creativa, analisis de contenido sensible o investigacion de seguridad.

La licencia Apache 2.0 permite uso comercial y modificacion. El modelo esta pensado para despliegue en el borde (edge), cabiendo en 16 GB de VRAM en BF16 y en menos de 8 GB con cuantizacion. No obstante, la ausencia de benchmarks publicados en la informacion disponible limita la evaluacion objetiva de su rendimiento mas alla de las metricas de rechazo y divergencia KL reportadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral 3), con vision encoder de 0,4B |
| Parametros totales | 3.849.090.048 (3,4B LM + 0,4B vision encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el modelo base soporta BF16 y se mencionan cuantizaciones de Unsloth Dynamic 2.0 para GGUF |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar (y "docenas" segun la model card del base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 7,7 GB); libreria vllm |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Mistral 3, con dos componentes: un language model de 3,4B parametros y un vision encoder de 0,4B. La version base (`Ministral-3-3B-Reasoning-2512`) ha sido post-entrenada para tareas de razonamiento, con enfasis en matematicas, codigo y STEM. La model card del base menciona soporte nativo de function calling, salida JSON, adherencia a system prompts y capacidades agenticas, ademas de una ventana de contexto de 256k tokens. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO en el post-entrenamiento del modelo original.

La innovacion tecnica de esta variante concreta es la aplicacion de Arbitrary-Rank Ablation (ARA) mediante Heretic v2.0.0.dev0, que modifica las activaciones en las capas 9 a 20 (start_layer_index 9, end_layer_index 20) con los siguientes hiperparametros: preserve_good_behavior_weight 0,8093, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 0,9247 y neighbor_count 13. El resultado reportado es una reduccion de rechazos de 91/100 a 1/100 con una divergencia KL de 0,0170 respecto al modelo original, lo que indica que la distribucion de salida se mantiene mayoritariamente alineada con la del base.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento (reasoning traces) entrenado explicitamente.
- Razonamiento matematico y resolucion de problemas STEM.
- Generacion y analisis de codigo.
- Vision: analisis de imagenes, captioning y extraccion de informacion visual, gracias al vision encoder de 0,4B.
- Tool calling y function calling nativo, con salida JSON.
- Capacidades agenticas: razonamiento multi-paso orientado a agentes, con soporte de system prompts.
- Multilingue: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe, entre otros.
- Comportamiento decensored: baja tasa de rechazo (1/100 segun el autor) en peticiones que el modelo original rechazaria.
- Despliegue en el borde: optimizado para hardware de baja capacidad.

## Casos de uso

- Escritura creativa y ficcion: el modelo puede generar narrativa con tematicas adultas o controvertidas sin los rechazos del base, gracias a la ablacion aplicada; util para autores y herramientas de escritura asistida que necesitan cobertura tematica amplia.
- Investigacion en seguridad y alineacion: permite estudiar el comportamiento de un modelo abliterated frente al original con una divergencia KL de 0,0170, sirviendo como caso de estudio controlado sobre que se pierde y que se gana al eliminar rechazos.
- Atencion al cliente automatizada: con 256k tokens de contexto y soporte de system prompts, puede gestionar conversaciones multi-turno largas y mantener el rol definido por la empresa.
- Extraccion de datos de documentos e imagenes: el vision encoder permite procesar capturas, formularios o diagramas y devolver JSON estructurado mediante function calling.
- Traduccion en tiempo real en el borde: al caber en menos de 8 GB con cuantizacion, puede desplegarse en dispositivos locales para traduccion entre los 11 idiomas soportados.
- Clasificacion y etiquetado de contenido: util para pipelines que necesitan clasificar texto o imagenes sin las restricciones de contenido del modelo original, por ejemplo en moderacion o analisis de datasets.
- Fine-tuning y especializacion: al ser Apache 2.0 y tener 3,8B parametros, es viable reentrenarlo en una sola GPU consumer para dominios concretos.
- Generacion de codigo en pipelines de CI/CD: el soporte de tool calling y JSON permite integrarlo en herramientas de automatizacion que requieren salidas estructuradas.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son las metricas de abliteration del autor:

| Metrica | Este modelo | Modelo original (Ministral-3-3B-Reasoning) |
|---|---|---|
| Rechazos (refusals) | 1/100 | 91/100 |
| Divergencia KL | 0,0170 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni para este modelo ni para el base en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 7,7 GB para los pesos (3,85B parametros x 2 bytes), mas overhead de activaciones y KV cache; la model card del base indica que cabe en 16 GB de VRAM en BF16.
- VRAM estimada con cuantizacion: menos de 8 GB de RAM/VRAM segun la model card del base.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para BF16; GPUs consumer con 8-12 GB (RTX 3060 12GB, RTX 4070) para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas usando cuantizacion, y en 16 GB en BF16.
- Opciones de despliegue: vLLM (libreria declarada en el repo), llama.cpp y Ollama mediante GGUF (el base tiene cuantizaciones Unsloth Dynamic 2.0), TGI no confirmado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Reasoning-UNCENSORED-heretic (este) | 3,85B | 256k | Si | Apache 2.0 | Abliterated, 1/100 rechazos, KL 0,0170 |
| Ministral-3-3B-Reasoning-2512 (base) | 3,85B | 256k | Si | Apache 2.0 | 91/100 rechazos, rendimiento de referencia |
| Ministral-3-3B-Instruct-2512 | 3,85B | 256k (segun familia) | Si | Apache 2.0 | Post-entrenado para instrucciones, FP8 |
| Ministral-3-8B-Reasoning-2512 | ~8B | 256k (segun familia) | Si | Apache 2.0 | Version mayor de la misma familia |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer diferencias de rendimiento objetivo entre estos modelos.

## Limitaciones y advertencias

- La abliteration puede degradar capacidades generales: aunque la divergencia KL es baja (0,0170), no se han publicado benchmarks que confirmen que el rendimiento en matematicas, codigo o vision se mantiene identico al base.
- Riesgo de alucinacion: inherente a los modelos de 3,8B; el modelo puede generar informacion falsa con alta confianza, especialmente en tareas de razonamiento largo.
- Contenido sin filtros: al eliminar los rechazos, el modelo puede producir contenido ofensivo, ilegal o danino si se le solicita; requiere moderacion externa en produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Contexto: aunque soporta 256k tokens, el rendimiento en contextos muy largos no esta validado en la informacion proporcionada.
- Idiomas: el soporte de 11 idiomas es declarado, pero no hay evaluaciones por idioma; el espanol podria tener menor calidad que el ingles.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo modificado; la responsabilidad legal del contenido generado recae en el desplegador.
- Madurez: el repo tiene 16 descargas y 0 likes, creado y actualizado el mismo dia (2026-10-28), sin validacion comunitaria ni pipeline declarado.
- Vision: la model card del base recomienda mantener relaciones de aspecto cercanas a 1:1; imagenes muy alargadas degradan el rendimiento.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/JustPropane/Ministral-3-3B-Reasoning-UNCENSORED-heretic
- Modelo base (Unsloth): https://huggingface.co/unsloth/Ministral-3-3B-Reasoning-2512
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- System prompt recomendado: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512/blob/main/SYSTEM_PROMPT.txt
- Heretic (proyecto de abliteration): https://heretic-project.org
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Documentacion de Unsloth: https://docs.unsloth.ai/
- Cuantizaciones Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Discord de Unsloth: https://discord.gg/unsloth
- Ministral 3 3B Base 2512: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Ministral 3 3B Instruct 2512: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Ministral 3 8B Base 2512: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
