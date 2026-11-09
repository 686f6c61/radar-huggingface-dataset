# schonsense/Caboose-SFT-Ripple-65B-T5-v1-BF16

## Resumen

Caboose-SFT-Ripple-65B-T5-v1-BF16 es un ajuste fino supervisado (SFT) de grano fino sobre el modelo base ricursiveAI/Ripple-65B-Preview, publicado por el usuario schonsense en Hugging Face. Se trata de un fine-tune de parametros completos (full parameter) de baja tasa de aprendizaje centrado exclusivamente en el `lm_head` y los tensores que lo alimentan, con el objetivo declarado de normalizar el registro lexico del modelo hacia una escritura humana y reducir los denominados "LLM-isms" (giros estilisticos tipicos de modelos de lenguaje). El modelo cuenta con 64.782.689.360 parametros reales segun los pesos en safetensors y un repositorio de 129,6 GB.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de alineacion estilistica orientado a generacion creativa y roleplay narrativo, no a tareas de razonamiento o codigo. El autor documenta cinco traversals de entrenamiento (T1 a T5) con ejemplos de progresion de salida sobre un mismo prompt narrativo, lo que permite observar como evoluciona el estilo generado a lo largo del proceso. La licencia es Apache 2.0 y el formato de pesos es safetensors en BF16.

No se dispone de informacion sobre arquitectura interna, longitud de contexto, idiomas soportados ni resultados de benchmarks mas alla de la afirmacion del autor de que el rendimiento "ha permanecido sin cambios respecto al base". Todos los datos tecnicos ausentes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ricursiveAI/Ripple-65B-Preview; requiere `custom_code` y `trust_remote_code`) |
| Parametros totales | 64.782.689.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 129,6 GB |
| Modelo base | ricursiveAI/Ripple-65B-Preview |
| Tipo de ajuste | SFT de parametros completos de baja LR sobre `lm_head` y tensores de alimentacion |
| Traversals de entrenamiento | 5 |
| Corpus | 40M+ tokens atendidos, 22M+ tokens supervisados (ratio 95:5 escritura humana / roleplay en personaje) |

## Arquitectura y entrenamiento

La arquitectura concreta no esta documentada en la informacion disponible; el modelo hereda la del base ricursiveAI/Ripple-65B-Preview y requiere codigo personalizado (`custom_code`) para su carga, lo que sugiere una implementacion no estandar respecto a transformers. El ajuste realizado no es un entrenamiento desde cero ni un fine-tune completo de todos los pesos: el autor describe explicitamente un "low LR full parameter finetune of the lm_head and the tensors that feed it", es decir, se actualizan de forma completa (no LoRA) el cabezal de lenguaje y las capas que lo alimentan, con una tasa de aprendizaje baja para preservar el comportamiento del base.

El corpus de entrenamiento combina escritura humana y roleplay con pensamiento en personaje en una proporcion 95:5 de tokens supervisados, sobre un total de mas de 40 millones de tokens atendidos y mas de 22 millones supervisados. El autor reporta cinco traversals (pasadas) de entrenamiento y afirma que el benchmarking aproximado "ha permanecido sin cambios respecto al base", sin publicar cifras. La innovacion declarada es estilistica: reduccion de "LLM-isms" y normalizacion lexica hacia registro humano, no una mejora de capacidades. No se menciona uso de RLHF, DPO, decodificacion especulativa ni tecnicas de atencion alternativa.

## Capacidades

- Generacion de texto narrativo y creativo, con enfasis en ficcion, dialogo y escritura en segunda persona ("you narrate the world").
- Roleplay en personaje con thinking in-character, segun el ratio de entrenamiento declarado.
- Reduccion de giros estilisticos tipicos de LLM ("LLM-isms"), orientada a un registro mas humano.
- Soporte de formato de chat con tokens especiales `<|im_start|>` / `<|im_end|>` y roles system/user/assistant.
- Generacion determinista en modo greedy documentada en la model card.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y agentes: no disponibles o no documentadas.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Escritura de ficcion interactiva: el modelo esta entrenado especificamente para narrar en segunda persona y encarnar personajes secundarios, con ejemplos documentados de dialogo narrativo coherente a lo largo de varios turnos, lo que lo hace adecuado para motores de historias ramificadas.
- Roleplay conversacional de larga duracion: el ajuste 95:5 sobre roleplay en personaje y la preservacion del comportamiento del base permiten mantener consistencia de personaje en sesiones multi-turno, siempre que se respete el formato de chat con `<|im_start|>`.
- Correccion de estilo en pipelines editoriales: al reducir "LLM-isms", puede emplearse como reescritor o normalizador lexico de borradores generados por otros modelos antes de la revision humana.
- Prototipado de videojuegos narrativos: integrable como backend de dialogo de NPC mediante el formato de chat documentado, con generacion greedy para respuestas reproducibles en pruebas.
- Investigacion sobre alineacion estilistica: sirve como caso de estudio de hasta que punto un fine-tune de baja LR limitado al `lm_head` y sus tensores de alimentacion modifica el estilo sin alterar el benchmarking del base.
- Generacion de dialogos para guiones y audiolibros: el registro humano y la reduccion de muletillas de LLM facilitan la produccion de texto listo para locucion con minima edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma que el "rough benchmarking ha remained unchanged from base" (el benchmarking aproximado se ha mantenido sin cambios respecto al base), pero no aporta cifras concretas ni identifica que benchmarks se han evaluado. No se deben inferir numeros.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 130 GB solo para pesos (64,78B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica requiere multiples GPU o una GPU de 141 GB o superior.
- Cuantizacion a 8 bits: en torno a 65 GB de pesos, viable en una H100 80GB o A100 80GB con margen ajustado.
- Cuantizacion a 4 bits: en torno a 33-36 GB de pesos, viable en una RTX 5090 (32 GB) solo con cuantizacion agresiva y contexto corto, o en una A100 40GB / dos RTX 4090.
- GPU recomendadas: H100 80GB (BF16 en tensor parallel 2x), A100 80GB, configuraciones multi-GPU para BF16 completo.
- Consumer GPU: no cabe en BF16 ni en 8 bits en GPUs de consumo; en 4 bits puede intentarse en RTX 4090/5090 con cuantizacion y contexto reducido, con riesgo de OOM.
- Opciones de despliegue: vLLM y TGI requieren soporte de la arquitectura personalizada (`custom_code`), que no esta garantizado; llama.cpp/Ollama dependrian de conversion a GGUF, no publicada. La carga directa con transformers y `trust_remote_code=True` es la via documentada implicitamente por los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Caboose-SFT-Ripple-65B-T5-v1-BF16 | 64,78B | no disponible | SFT estilistico sobre `lm_head` | Apache 2.0 | Hugging Face (0 descargas) |
| ricursiveAI/Ripple-65B-Preview (base) | ~65B | no disponible | Modelo base | no disponible | Hugging Face |
| Alternativas de ~65-70B de proposito general | ~65-70B | 4K-128K segun modelo | Chat/razonamiento general | variable | amplia |

No se dispone de datos de rendimiento del modelo ni del base que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita a parametros y licencia; cualquier afirmacion de superioridad o inferioridad seria especulativa.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: la afirmacion de paridad con el base no esta respaldada con cifras, por lo que el rendimiento real en tareas distintas de la narrativa es desconocido.
- El ajuste se limita al `lm_head` y tensores de alimentacion; es previsible que capacidades como codigo, matematicas o tool calling no hayan mejorado y puedan degradarse respecto al base, aunque no hay datos que lo confirmen.
- Riesgo de alucinacion: inherente a un modelo de ~65B sin datos de evaluacion de factualidad; no recomendado para tareas de recuperacion de hechos sin verificacion.
- Idiomas soportados no documentados: el entrenamiento se describe sobre escritura humana en ingles (ejemplos en ingles), por lo que el rendimiento en castellano es incierto.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Requiere `trust_remote_code` y `custom_code`: implica ejecutar codigo del autor del modelo base, con el riesgo de seguridad asociado en entornos de produccion.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion independiente.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado del base conviene verificar que la licencia del modelo base ricursiveAI/Ripple-65B-Preview sea compatible; no esta confirmada en la informacion disponible.
- Los ejemplos de la model card muestran variabilidad entre traversals (T1-T5): el estilo no es completamente estable y depende de la decodificacion (greedy frente a sampling).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/schonsense/Caboose-SFT-Ripple-65B-T5-v1-BF16
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Imagen de portada de la model card: https://cdn-uploads.huggingface.co/production/uploads/6317d4867690c5b55e61ce3d/1s4ayaluFxd65Sg83gXrf.jpeg
- Imagen adicional de la model card: https://cdn-uploads.huggingface.co/production/uploads/6317d4867690c5b55e61ce3d/QQmBxCV9OsxC7JqxV4ZFN.png
