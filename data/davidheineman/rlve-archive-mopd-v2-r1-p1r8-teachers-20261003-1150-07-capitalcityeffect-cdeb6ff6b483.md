# davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-07-capitalcityeffect-cdeb6ff6b483

## Resumen

El repositorio `davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-07-capitalcityeffect-cdeb6ff6b483` es un checkpoint archivado de un entrenamiento de destilacion en politica (on-policy distillation, OPD) sobre un unico entorno de RL, identificado como `07-CapitalCityEffect`. Lo publica el usuario davidheineman dentro de su coleccion de "teachers" del proyecto RLVE, y no es un modelo de proposito general: es un artefacto de investigacion que preserva el estado final de un run completado, en el paso 149, con formato `hf-safetensors`.

El tag `qwen2` y la informacion de la coleccion asociada apuntan a que la base es Qwen 2.5 1.5B Instruct, mientras que el recuento real de parametros de los pesos safetensors es de 1.777.088.000 (aproximadamente 1,78 mil millones). Esa diferencia respecto a la cifra nominal de "1.5B" conviene tenerla presente: la ficha no puede confirmar si responde a embeddings no atados, a un vocabulario ampliado o a otra configuracion, porque la model card no incluye config.json ni detalles de arquitectura.

Su relevancia es acotada y muy especifica: sirve para reproducir o auditar un experimento de RL con entornos (se cita el paper arXiv:2511.07317 y la coleccion menciona 32 de 400 entornos entrenados durante 150 pasos), y como posible modelo profesor en pipelines de destilacion. No hay pipeline declarado, ni idiomas, ni licencia, y el repositorio no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (tag `qwen2`); detalles no disponibles |
| Parametros totales | 1.777.088.000 (dato real de safetensors, ~1,78 B) |
| Parametros activos | No aplica (no hay evidencia de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`hf-safetensors`); se menciona tambien un directorio `checkpoint/` con el estado distribuido de Megatron |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de la familia Qwen2, segun el tag del repositorio, y que la coleccion asociada lo describe como Qwen 2.5 1.5B Instruct. No hay model card tecnica con numero de capas, dimensiones ocultas, tipo de atencion, tokenizador ni longitud de contexto. El checkpoint corresponde al paso 149 de un run completado, con W&B run ID `b4f20dff`, y la ruta de scratch original es `runs/mopd-v2-r1-p1r8-teachers-20261003-115039/resumable/07-CapitalCityEffect`.

El entrenamiento, segun la coleccion publica del autor, consistio en 150 pasos sobre un unico entorno procedente de arXiv:2511.07317 (32 de 400 entornos). En el repositorio hermano de la misma familia (`opd-teacher-R1Distill-Circuit-step149`) se detalla el esquema: cuatro prompts y 16 rollouts por paso, destilacion en politica especifica de entorno y ausencia de filtrado de prompts tipo DAPO. Ese nivel de detalle no se reproduce en esta model card, por lo que no se puede confirmar que este checkpoint use exactamente la misma receta; tampoco hay datos sobre composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto: no confirmada de forma explicita en la informacion proporcionada, pero plausible por su base Qwen2/Qwen 2.5 Instruct.
- Razonamiento y tareas de entorno: es un modelo destilado especificamente para un entorno de RL, lo que sugiere comportamiento especializado en ese dominio concreto.
- Codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales: no disponible; no se menciona modo de pensamiento, vision ni audio.

Advertencia importante: al ser un checkpoint archivado de investigacion, no hay garantia de que conserve intactas las capacidades instruccionales de la base, ya que el ajuste se limito a un unico entorno.

## Casos de uso

- Profesor en destilacion en politica: el repositorio pertenece a una coleccion de "teachers"; puede emplearse para generar rollouts o logits de referencia sobre el entorno `CapitalCityEffect` y transferir ese comportamiento a un alumno mas pequeno.
- Reproduccion de experimentos de RL con entornos: el checkpoint permite reanudar o auditar el run `b4f20dff` en el paso 149, util para verificar resultados publicados sobre el paper arXiv:2511.07317.
- Comparativa de tecnicas de destilacion: al existir repositorios hermanos con la misma receta pero distinta base (por ejemplo `opd-teacher-R1Distill-Circuit-step149`), sirve como punto de comparacion entre bases Qwen 2.5 y DeepSeek-R1-Distill-Qwen.
- Generacion de datos sinteticos especificos de entorno: si el modelo ha aprendido el comportamiento del entorno `CapitalCityEffect`, puede producir trayectorias etiquetadas para entrenar otros modelos en ese mismo entorno.
- Inferencia local en hardware de consumo para investigacion: con ~1,78 B de parametros, es viable ejecutarlo en una GPU de gama media o incluso en CPU tras conversion a GGUF, lo que facilita experimentos sin clúster.
- Estudio de olvido catastrofico y especializacion: comparar sus respuestas generales frente a Qwen 2.5 1.5B Instruct original permite medir cuanto se degrada o se especializa un modelo tras 150 pasos de ajuste en un solo entorno.
- Baseline en evaluaciones de RL: usarlo como referencia de "modelo ya entrenado en tarea" frente a politicas sin entrenar en el mismo benchmark de entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 1.777.088.000 parametros; no son cifras publicadas por el autor): aproximadamente 3,6 GB en fp16/bf16, alrededor de 1,8 GB en int8 y en torno a 1,0-1,2 GB en cuantizacion de 4 bits.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cualquier GPU con 4-8 GB de VRAM deberia ser suficiente en fp16, y bastarian 2 GB o menos con cuantizacion.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, aunque esto no esta confirmado por el autor.
- Opciones de despliegue: el repositorio solo incluye safetensors, por lo que seria necesario convertir a GGUF para llama.cpp u Ollama. No hay confirmacion de compatibilidad con vLLM o TGI; la presencia de un directorio `checkpoint/` de Megatron sugiere que el entrenamiento se hizo con Megatron.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rlve-archive-mopd-v2-...-07-capitalcityeffect (este) | 1.777.088.000 | No disponible | 150 pasos, entorno `CapitalCityEffect` | No disponible | Safetensors en HuggingFace |
| davidheineman/opd-teacher-R1Distill-Circuit-step149 | No disponible | No disponible | 150 pasos, entorno Circuit, 4 prompts y 16 rollouts por paso | No disponible | Safetensors en HuggingFace |
| Qwen 2.5 1.5B Instruct (base citada en la coleccion) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo instructivo generalista | No disponible en la informacion proporcionada | Publico en HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint archivado de investigacion, no un modelo listo para produccion; la propia model card lo describe como preservacion del estado final de un run.
- No se declara licencia, por lo que no se puede asumir ningun permiso de uso comercial ni siquiera de redistribucion.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide planificar despliegues con requisitos concretos.
- Especializacion extrema: al haberse ajustado sobre un unico entorno durante 150 pasos, es probable que su comportamiento generalista se haya degradado, aunque no hay mediciones que lo confirmen.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la ausencia de evaluaciones publicadas.
- Sesgos conocidos: no disponible; no se han publicado analisis de sesgo.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validacion externa.
- Discrepancia de parametros: los 1,78 B reales frente a los 1,5 B nominales de la base citada no estan explicados en la documentacion.
- La fecha de creacion del repositorio (2026-10-05) y el identificador del run indican un artefacto reciente dentro de una campana de experimentos en curso, con posible rotacion o eliminacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-archive-mopd-v2-r1-p1r8-teachers-20261003-1150-07-capitalcityeffect-cdeb6ff6b483
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Coleccion RLVE OPD Teachers (Qwen 2.5 1.5B): https://huggingface.co/collections/davidheineman/rlve-opd-teachers-qwen-25-15b
- Checkpoint hermano (DeepSeek-R1-Distill-Qwen-1.5B, entorno Circuit): https://huggingface.co/davidheineman/opd-teacher-R1Distill-Circuit-step149
- Paper de referencia citado en la coleccion: https://arxiv.org/abs/2511.07317
- W&B run ID: `b4f20dff` (no se proporciona URL)
