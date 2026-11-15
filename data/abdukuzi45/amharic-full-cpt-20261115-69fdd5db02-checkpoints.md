# abdukuzi45/amharic-full-cpt-20261115-69fdd5db02-checkpoints

## Resumen

Este repositorio, publicado por el usuario abdukuzi45 bajo el identificador `abdukuzi45/amharic-full-cpt-20261115-69fdd5db02-checkpoints`, no contiene un modelo entrenado listo para usar, sino un conjunto de código y checkpoints asociados a una receta de *continued pretraining* (CPT) sobre un modelo base de la familia Qwen 3.5. El objetivo declarado es adaptar un modelo Qwen al amharico (am) manteniendo el ingles (en), mediante una pasada única sobre un corpus empaquetado de 1.923.119.566 tokens.

El propio autor (identificado como ARIA en la model card) advierte explicitamente que no se ha ejecutado ningún entrenamiento completo y que el repositorio contiene inicialmente solo código. Los checkpoints publicados, por tanto, deben tratarse como artefactos de un proceso de entrenamiento en curso o planificado, no como pesos finales validados. La model card incluye la receta completa (tasa de aprendizaje, acumulación de gradientes, retención de checkpoints) y los resultados de las pruebas realizadas, que se limitan a comprobaciones de sintaxis y pruebas en CPU sobre juguetes sintéticos.

La relevancia de este repositorio es limitada para el desarrollador que busca un modelo listo para producción: no hay benchmarks de calidad, no hay licencia declarada y no se ha verificado la ejecución en GPU del propio pipeline. Su interés es principalmente documental, como ejemplo de infraestructura de CPT reproducible con gestión de checkpoints, validación de NLL y exportación portable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen 3.5 (detalles especificos no disponibles) |
| Parametros totales | 4.287.671.296 parametros de texto principales entrenables (vision congelada) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens por fila de entrenamiento (longitud maxima de fila; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | no disponible (el entrenamiento usa BF16 en computo y FP32 en pesos y estado AdamW) |
| Idiomas soportados | am (amharico), en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; la exportacion portable preserva nombres y dtypes de tensores del modelo base (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen 3.5, un transformer con atencion FlashAttention 2 (FA2) y componentes FLA (Fast Linear Attention) y convoluciones, segun los requisitos tecnicos declarados en la receta. El repositorio entrena 4.287.671.296 parametros de texto con embeddings y cabeza atados y deduplicados, manteniendo la torre de vision congelada. El entrenamiento se realiza en BF16 para el computo, con pesos principales y estado de AdamW en FP32, checkpointing de activaciones y filas de hasta 8.192 tokens separadas por EOS.

La receta de CPT consiste en una unica pasada sobre 1.923.119.566 tokens empaquetados (1.921.495.587 objetivos de perdida), con acumulacion de gradientes ponderada por tokens para alcanzar 32.768 objetivos desplazados sin mascara por actualizacion. La tasa de aprendizaje va de 1e-5 a 1e-6 con un 1% de warmup. Se guardan checkpoints y se evalua cada 500 actualizaciones del optimizador y al final del corpus, con un maximo de cinco checkpoints completos; antes de subir, se reserva la quinta ranura podando a cuatro y se preservan el mejor (menor NLL en un subconjunto fijo de validacion) y el ultimo. La validacion usa 256 filas fijas reservadas (no el split de test) y se detiene el entrenamiento si la perplejidad de referencia en ingles sube mas del 10% o la NLL de validacion sube mas de 0.5. No se entrena el modulo MTP (multi-token prediction) auxiliar.

## Capacidades

- Generacion de texto en amharico e ingles tras el CPT (capacidad heredada del modelo base Qwen 3.5; no verificada en este repositorio).
- Razonamiento y codigo: presumiblemente heredados del modelo base, aunque no hay evaluacion publicada en este repositorio.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas a los idiomas declarados (am, en).
- Capacidades especiales: la receta menciona tensores auxiliares MTP y una torre de vision congelada, lo que sugiere que el modelo base es multimodal; sin embargo, la vision no se entrena y no se documenta su uso en inferencia.
- No se documenta modo *thinking*, audio ni otras capacidades especiales.

## Casos de uso

- Evaluacion de recetas de CPT: el repositorio sirve como referencia reproducible para equipos que quieran adaptar un modelo Qwen 3.5 al amharico, con una receta concreta de LR, acumulacion y retencion de checkpoints.
- Investigacion sobre olvido catastrofico: la receta incluye un criterio de parada basado en el aumento de perplejidad en ingles, util para estudiar el equilibrio entre adaptacion al amharico y preservacion del ingles.
- Infraestructura de entrenamiento con reanudacion: el codigo implementa reanudacion desde el checkpoint remoto mas reciente con verificacion de bytes locales y restauracion de tensores, aplicable a pipelines de entrenamiento de larga duracion.
- Exportacion portable de checkpoints: la carpeta `portable` del mejor checkpoint preserva nombres y dtypes de tensores del modelo base, lo que facilita su integracion en pipelines de inferencia existentes (sujeto a validacion).
- Pruebas de retencion de checkpoints: el planificador BEST/LATEST y la poda a cuatro ranuras son un ejemplo de gestion de cuotas de almacenamiento en Hugging Face.
- Docencia y formacion: como ejemplo documentado de una receta de CPT completa con criterios de parada, validacion y trazabilidad de hashes SHA256 del launcher y el worker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ha realizado ninguna ejecucion en GPU de Qwen, ni benchmark de throughput end-to-end, ni resultado de calidad, ni prueba destructiva de retencion en vivo. Las unicas pruebas realizadas son de sintaxis, comprobaciones embebidas y pruebas en CPU sobre juguetes sinteticos (perdida y gradientes, mascaras de documentos desplazadas, acumulacion ponderada por tokens con longitudes desiguales, restauracion exacta del siguiente paso del optimizador y RNG, planificador de retencion BEST/LATEST y exportacion portable que preserva el esquema de tensores).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El entrenamiento requiere una GPU SM120 de 96 GB.
- GPU recomendadas para entrenamiento: una GPU SM120 de 96 GB (la receta exige exactamente una).
- GPU para inferencia: no disponible; al no haberse validado el modelo final, no se puede confirmar que quepa en GPU de consumo.
- Almacenamiento: al menos 350 GiB libres para el entrenamiento.
- Opciones de despliegue: no disponibles (no se documenta vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles; no se ha ejecutado ningun benchmark end-to-end.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| amharic-full-cpt-20261115-69fdd5db02-checkpoints | 4.287.671.296 (texto) | 8.192 tokens por fila de entrenamiento | am, en | no disponible | Codigo y checkpoints de CPT; sin entrenamiento completo confirmado |
| Modelo base Qwen 3.5 (referencia) | no disponible | no disponible | no disponible | no disponible | Modelo base del que parte la receta |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se identifican en la informacion proporcionada |

## Limitaciones y advertencias

- El autor declara explicitamente que no se ha ejecutado ningun entrenamiento completo; los checkpoints pueden no existir o no ser validos.
- No hay benchmarks de calidad, throughput ni resultados de evaluacion de tareas; las pruebas se limitan a comprobaciones en CPU sobre datos sinteticos.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido.
- El modelo solo cubre amharico e ingles; no se documenta soporte para otras lenguas.
- La validacion usa 256 filas fijas y seis continuaciones de referencia en ingles y dos prompts en amharico; el propio autor advierte que son sondas limitadas y no certifican calidad ni precision.
- La receta advierte que las mascaras de perdida no implican aislamiento de atencion ni de recurrencia, lo que puede afectar a la coherencia entre documentos.
- El modulo MTP no se entrena; los tensores auxiliares se preservan sin modificar.
- La torre de vision esta congelada y no se documenta su uso en inferencia.
- El historial principal se aplana tras la poda de retencion, por lo que las URLs de commits antiguos dejan de ser reanudables.
- La reclamacion de cuota fisica en Hugging Face la controla el servicio y puede no ser inmediata tras el aplanado.
- Nunca deben incluirse credenciales en los metadatos de ejecucion de los checkpoints publicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/abdukuzi45/amharic-full-cpt-20261115-69fdd5db02-checkpoints
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
