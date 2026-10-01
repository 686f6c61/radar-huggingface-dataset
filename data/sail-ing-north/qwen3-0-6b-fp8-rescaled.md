# sail-ing-north/Qwen3-0.6B-FP8-rescaled

## Resumen

Qwen3-0.6B-FP8-rescaled es una version cuantizada en FP8 del modelo Qwen3-0.6B, el miembro mas pequeno de la familia Qwen3 desarrollada por el equipo Qwen de Alibaba. Se trata de un transformer causal denso de aproximadamente 751 millones de parametros totales (unos 440 millones excluyendo los embeddings), pensado para generacion de texto, dialogo conversacional e instrucciones, con una longitud de contexto de 32.768 tokens. El repositorio lo publica el usuario sail-ing-north, que parte del checkpoint base Qwen/Qwen3-0.6B y aplica una cuantizacion FP8 de grano fino (block size 128).

La relevancia de esta ficha radica en que Qwen3 introduce un modo de razonamiento ("thinking mode") conmutable con el modo de respuesta directa dentro de un mismo modelo, y en que la cuantizacion FP8 reduce a la mitad el peso en disco y memoria frente al checkpoint original en bfloat16, lo que facilita el despliegue en GPUs modestas o incluso en hardware consumer compatible con FP8.

No obstante, la informacion disponible sobre esta publicacion concreta es muy limitada: el repositorio no documenta el proceso de "rescalado" que sugiere el nombre, no declara idiomas soportados, no incluye resultados de benchmarks propios y, en el momento de la consulta, acumula 0 descargas y 0 likes, lo que indica que es una publicacion reciente y sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (atencion con GQA) |
| Parametros totales | 751.632.384 (segun safetensors); 0,6B nominales, 0,44B sin embeddings |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | FP8 de grano fino, block size 128 (checkpoint cuantizado) |
| Idiomas soportados | no disponible (el repositorio no los declara; la familia Qwen3 base anuncia mas de 100 idiomas y dialectos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Capas | 28 |
| Cabezas de atencion | GQA: 16 cabezas para Q, 8 para KV |
| Tamano del repositorio | 1,1 GB |
| Modelo base | Qwen/Qwen3-0.6B |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso, no un MoE ni una arquitectura hibrida. La informacion disponible indica 28 capas, atencion con Grouped Query Attention (16 cabezas de consulta y 8 de clave/valor) y una ventana de contexto de 32.768 tokens. El checkpoint original Qwen3-0.6B paso por las etapas de preentrenamiento y postentrenamiento descritas por el equipo Qwen en su model card; este repositorio concreto parte de ese checkpoint y le aplica una cuantizacion FP8 de grano fino con tamano de bloque 128, el mismo esquema que Qwen emplea en sus checkpoints oficiales terminados en `-FP8`.

La innovacion funcional de la familia Qwen3 es la conmutacion entre "thinking mode" y modo directo mediante el parametro `enable_thinking` del chat template, con un bloque de razonamiento delimitado por el token `</think>` (id 151668) que puede parsearse por separado. Sin embargo, el autor de este repositorio no documenta el metodo de "rescalado" que da nombre al modelo (podria referirse a un reajuste de escalas de cuantizacion, pero no hay descripcion tecnica publicada), ni aporta detalles sobre el dataset, el numero de tokens de entrenamiento, el uso de RLHF/DPO o cualquier procedimiento adicional. Tampoco se especifica si se han modificado los pesos mas alla del reescalado de las escalas FP8.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno.
- Razonamiento logico, matematicas y generacion de codigo, con modo de razonamiento explicito ("thinking mode") activable o desactivable.
- Seguimiento de instrucciones y alineacion con preferencias humanas, segun lo declarado para la familia Qwen3 base.
- Capacidades de agente: integracion con herramientas externas (tool calling / function calling) tanto en modo de razonamiento como directo, segun la model card de la familia.
- Soporte multilingue: la familia Qwen3 declara mas de 100 idiomas y dialectos, con traduccion e instrucciones multilingues; el repositorio concreto no declara idiomas.
- Escritura creativa y role-playing (caracteristica declarada de la familia base).
- Despliegue con API compatible con OpenAI mediante SGLang (`--reasoning-parser qwen3`) o vLLM (`--reasoning-parser deepseek_r1`).
- Uso local mediante Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers, segun la model card.

## Casos de uso

- Asistentes conversacionales ligeros en el borde: con menos de 1 GB de pesos en FP8 y 32.768 tokens de contexto, el modelo puede ejecutarse en un portatil o en un dispositivo con GPU modesta para gestionar dialogos multi-turno sin enviar datos a la nube.
- Clasificacion y etiquetado de texto a gran escala: por su tamano reducido permite procesar volumenes altos de documentos con coste de inferencia bajo, usando el modo directo (sin razonamiento) para maximizar el throughput.
- Enrutamiento y preprocesado en pipelines RAG: puede reformular consultas, resumir fragmentos recuperados o decidir que documento es relevante antes de delegar en un modelo mayor.
- Generacion de codigo asistida en entornos con recursos limitados: soporta instrucciones de programacion y puede integrarse en editores o scripts de autocompletado ligeros, aunque para tareas de codigo complejas conviene un modelo mayor de la misma familia.
- Extraccion de informacion estructurada: convertir texto libre en JSON o campos concretos usando el chat template con respuesta directa, util en automatizacion de formularios y facturas.
- Prototipado y evaluacion de agentes: permite probar flujos de tool calling y razonamiento multi-paso con un coste minimo antes de escalar a modelos Qwen3 mayores con la misma interfaz.
- Traduccion automatica de bajo coste: aprovechando el soporte multilingue declarado por la familia base, puede servir para traducciones internas o pre-traduccion en flujos de localizacion.
- Educacion y tutoria: modo de razonamiento para explicar pasos de problemas matematicos sencillos, con la ventaja de que el proceso de pensamiento puede separarse de la respuesta final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio remite al blog, GitHub y documentacion de Qwen3 para obtener evaluaciones, pero no incluye cifras concretas para este checkpoint. No se dispone de datos propios de MMLU, HumanEval, GSM8K ni de comparativas de latencia o throughput para esta version rescalada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 0,75 GB (751 millones de parametros a 8 bits); el repositorio completo pesa 1,1 GB. Sumando cache KV para 32.768 tokens y overhead del runtime, el consumo tipico se situa en torno a 2-4 GB de VRAM segun lote y longitud de contexto.
- GPUs recomendadas: cualquier GPU con soporte nativo de FP8 (arquitecturas Hopper como H100 y Ada como L4, L40S o RTX 4090) aprovecha mejor la cuantizacion. En GPUs sin soporte FP8 nativo (por ejemplo Ampere A100 o RTX 3090) los pesos pueden de-cuantizarse a bfloat16, perdiendo parte de la ventaja de memoria y velocidad.
- GPU consumer: si cabe con holgura en una RTX 4090, RTX 4080, RTX 4070 e incluso en GPUs con 8 GB o menos si se emplea una cuantizacion adicional (GGUF Q4/Q5 en llama.cpp).
- Opciones de despliegue: transformers (se requiere version >= 4.51.0 para evitar el error `KeyError: 'qwen3'`), vLLM >= 0.8.5, SGLang >= 0.4.6.post1, llama.cpp, Ollama, LMStudio, MLX-LM y KTransformers.
- Aviso de despliegue: la model card advierte de problemas con la cuantizacion FP8 de grano fino en transformers para inferencia distribuida, recomendando definir `CUDA_LAUNCH_BLOCKING=1` cuando se usan varios dispositivos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sail-ing-north/Qwen3-0.6B-FP8-rescaled | 751.632.384 (~0,6B) | 32.768 | FP8 grano fino, block 128 | apache-2.0 | Repositorio con 0 descargas y 0 likes; proceso de rescalado no documentado |
| Qwen/Qwen3-0.6B-FP8 (oficial) | ~0,6B | 32.768 | FP8 grano fino, block 128 | apache-2.0 | Checkpoint oficial de Qwen, desplegable con vLLM y SGLang |
| Qwen/Qwen3-0.6B (base bf16) | ~0,6B | 32.768 | bfloat16 (sin cuantizar) | apache-2.0 | Modelo base original, mayor peso en disco que la version FP8 |
| Qwen2.5-0.5B (generacion anterior) | ~0,5B | 32.768 | bfloat16 | apache-2.0 (segun variante) | Familia anterior, sin modo thinking |

No se dispone de datos de rendimiento comparados para esta publicacion concreta, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El proceso de "rescalado" que da nombre al modelo no esta documentado en la informacion disponible; se desconoce si altera la calidad respecto al checkpoint FP8 oficial.
- Repositorio sin validacion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de la comunidad sobre su comportamiento.
- Riesgo de alucinacion inherente a un modelo de 0,6B: la capacidad de razonamiento y de hechos verificables es limitada en comparacion con modelos de mayor tamano de la misma familia.
- La model card advierte de posibles repeticiones sin fin y recomienda ajustar los parametros de muestreo y fijar `presence_penalty` en 1,5.
- El repositorio no declara idiomas soportados; el multilingue se hereda de la familia Qwen3 base, pero sin garantia verificada para este checkpoint.
- Restricciones de licencia: apache-2.0, que permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3 y del enlace de licencia referenciado en la model card.
- Limitacion de contexto efectivo: aunque la ventana nominal es de 32.768 tokens, en modelos de este tamano la calidad suele degradarse antes de alcanzar el limite.
- Para produccion con cargas exigentes conviene evaluar el checkpoint FP8 oficial de Qwen, que cuenta con soporte y pruebas mas amplias.

## Enlaces

- HuggingFace: https://huggingface.co/sail-ing-north/Qwen3-0.6B-FP8-rescaled
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Checkpoint FP8 oficial de referencia: https://huggingface.co/Qwen/Qwen3-0.6B-FP8
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3-0.6B-FP8/blob/main/LICENSE
- Paper Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Nota: los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo; las coincidencias se refieren a la marca de outdoor SAIL y al termino generico "sail", por lo que no se han incorporado como fuentes.
