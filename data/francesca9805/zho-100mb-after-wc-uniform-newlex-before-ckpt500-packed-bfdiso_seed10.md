# francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10

## Resumen

El modelo `zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10` es un ajuste fino de tipo SFT (supervised fine-tuning) sobre el checkpoint `francesca9805/ppt-wc-uniform-newlex-zho-before-100mb-packed-bfdiso_seed10`, desarrollado por el usuario de HuggingFace `francesca9805` en el marco de un proyecto de investigación sobre tokenizadores y currículos de entrenamiento (el espacio de trabajo de Weights & Biases asociado pertenece a la Universidad de Groningen). No se trata de un modelo de propósito general listo para producción, sino de un artefacto experimental intermedio dentro de una comparativa de tokenizadores y volúmenes de datos.

La arquitectura es GPT-2 (transformer decoder-only causal), con 124.770.816 parámetros totales según los pesos en safetensors, lo que lo sitúa en la misma escala que GPT-2 small. El identificador del modelo indica que se entrenó sobre un subconjunto de aproximadamente 100 MB de datos en chino (`zho`), empaquetados (`packed`), con un vocabulario léxico nuevo (`newlex`), normalización uniforme por conteo de palabras (`wc-uniform`) y precisión bf16 con alguna forma de inicialización o semilla (`bfdiso`, `seed10`), deteniéndose en el checkpoint 500.

Su relevancia es por tanto metodológica y de reproducibilidad: sirve para estudiar cómo afectan el vocabulario y el volumen de datos a modelos pequeños en un idioma concreto, no para tareas de usuario final. No hay información publicada sobre licencia, idiomas declarados, benchmarks ni casos de uso previstos por el autor más allá del ejemplo genérico de generación de texto incluido en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (GPT-2), segun el tag `gpt2` |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica; GPT-2 usa habitualmente 1024 tokens) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible oficialmente; el identificador `zho` sugiere entrenamiento centrado en chino |
| Licencia | No disponible (la model card incluye el marcador de posicion `licence: license`) |
| Formato de pesos | Safetensors (libreria `transformers`); repositorio de 2,0 GB |
| Modelo base | `francesca9805/ppt-wc-uniform-newlex-zho-before-100mb-packed-bfdiso_seed10` |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Version de transformers | 4.56.2 |
| Version de PyTorch | 2.11.0 |
| Version de tokenizers | 0.22.1 |
| Fecha de creacion | 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a GPT-2, un transformer decoder-only con atencion causal completa y normalizacion previa a la capa (`pre-LN`). Con 124,77 millones de parametros, el modelo se sitúa en la escala de GPT-2 small, es decir, aproximadamente 12 capas, 12 cabezas de atencion y una dimension de embedding de 768 en la configuracion canonica, aunque la model card no detalla la configuracion exacta y no se debe asumir sin verificar el `config.json`.

El entrenamiento se realizo mediante SFT con la libreria TRL (version 0.23.0), partiendo del checkpoint previo del mismo autor. El nombre del repositorio describe el pipeline experimental: datos en chino (`zho`) de aproximadamente 100 MB, empaquetados en secuencias (`packed`), con un vocabulario nuevo (`newlex`), normalizacion por conteo de palabras de tipo uniforme (`wc-uniform`), calculo en bf16 con alguna variante de inicializacion (`bfdiso`) y semilla 10 (`seed10`). El sufijo `before-ckpt500` indica que corresponde al estado previo a un checkpoint 500, lo que refuerza su naturaleza de artefacto intermedio de investigación. No hay informacion sobre el numero total de tokens procesados, la composicion exacta del dataset ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto causal autoregresiva, con soporte de plantillas conversacionales mediante `pipeline("text-generation")` y mensajes con rol `user`, tal como muestra la model card.
- Generacion condicionada por prompt en chino, segun el identificador del modelo, aunque esta capacidad no esta declarada explicitamente en la model card.
- Ajuste por instrucciones limitado: al haber pasado por SFT, puede seguir formatos de dialogo simples, pero no hay evidencia publicada de robustez en ese formato.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no hay evaluacion publicada por idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad con text-generation-inference y endpoints, segun los tags del repositorio.

## Casos de uso

- Estudio de tokenizadores en chino: el modelo permite comparar el efecto de un vocabulario nuevo (`newlex`) frente a vocabularios estandar sobre un corpus chino de 100 MB, midiendo perplejidad y calidad de generacion en igualdad de condiciones.
- Investigacion sobre empaquetado de secuencias: al haberse entrenado con datos `packed`, sirve para analizar como afecta el empaquetado a la coherencia entre documentos en modelos pequenos.
- Reproducibilidad de recetas de SFT: el repositorio documenta versiones exactas de TRL, Transformers, PyTorch, Datasets y Tokenizers, lo que permite replicar el ajuste en otros corpus.
- Analisis de curvas de aprendizaje: el sufijo `before-ckpt500` lo convierte en un punto de control util para estudiar la evolucion del entrenamiento frente a checkpoints posteriores del mismo autor.
- Pruebas de infraestructura de inferencia: con 124,77 M de parametros es un banco de pruebas barato para validar despliegues en vLLM, TGI, llama.cpp u Ollama sin coste de GPU significativo.
- Docencia y practicas de ajuste fino: su tamano permite ejecutar el ciclo completo de entrenamiento e inferencia en una unica GPU de consumo, ideal para cursos de NLP.
- Generacion de texto de baja latencia en entornos embebidos o CPU: adecuado para demos donde no se requiere alta calidad linguistica.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni tareas criticas: no hay evaluaciones que respalden un comportamiento fiable en esos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no tiene descargas ni evaluaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en fp32, 250 MB en bf16/fp16 y 125-150 MB en cuantizacion de 8 bits. La KV cache depende de la longitud de contexto y del batch, pero para un modelo de esta escala es marginal.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo no aprovecha la capacidad de GPUs de gama alta salvo en escenarios de batch muy elevado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos diez anos, e incluso en GPUs integradas con memoria compartida.
- Ejecucion en CPU: viable; con 124,77 M de parametros se pueden obtener velocidades de decodificacion de decenas de tokens por segundo en CPUs modernas con cuantizacion.
- Opciones de despliegue: Transformers con `pipeline`, text-generation-inference (segun los tags), y potencialmente llama.cpp u Ollama si se genera una conversion a GGUF, que el autor no ha publicado.
- Latencia y throughput estimados: no disponibles; no hay mediciones publicadas por el autor.
- Almacenamiento: el repositorio ocupa 2,0 GB, lo que sugiere que incluye estados del optimizador o multiples artefactos ademas de los pesos del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10` | 124,77 M | No disponible | No disponible (probablemente chino) | No disponible | HuggingFace, 0 descargas |
| GPT-2 (openai-community/gpt2) | 124 M | 1024 tokens | Ingles principalmente | MIT | Ampliamente disponible y evaluado |
| DistilGPT-2 | 82 M | 1024 tokens | Ingles | Apache 2.0 | Ampliamente disponible |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2048 tokens | Ingles | Apache 2.0 | Disponible con evaluaciones publicas |

No hay datos de rendimiento comparativo para el modelo analizado, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. En esos terminos, el modelo de `francesca9805` es la opcion con menor trazabilidad: carece de licencia declarada, evaluaciones y comunidad de usuarios, a diferencia de las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no se puede afirmar nada sobre su calidad real en generacion, razonamiento o codigo.
- Licencia no especificada: la model card contiene el marcador `licence: license`, lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier uso productivo.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un corpus chino no filtrado de 100 MB, es probable la presencia de sesgos linguisticos, culturales y de contenido, pero no hay analisis disponible.
- Riesgo de alucinacion: alto y no cuantificado. Un modelo de 124,77 M de parametros tiene una capacidad de modelado del mundo muy limitada y no dispone de mecanismos de alineacion documentados mas alla del SFT.
- Limitaciones de contexto: la longitud de contexto no esta declarada; si se asume el valor habitual de GPT-2 (1024 tokens), el modelo no es apto para conversaciones o documentos largos.
- Limitaciones de idioma: solo el identificador sugiere entrenamiento en chino; no hay evaluacion multilingue ni garantia de calidad en castellano.
- Artefacto de investigacion: el nombre indica un checkpoint intermedio dentro de un barrido experimental, no un modelo final pulido. No debe presentarse como un modelo terminado.
- Cero adopcion: 0 descargas y 0 likes implican que no ha sido validado por terceros.
- El modelo base pertenece al mismo autor y tampoco cuenta con documentacion publica mas alla de la ficha generada automaticamente.
- Los resultados de busqueda web asociados a este identificador no contienen informacion tecnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-zho-before-100mb-packed-bfdiso_seed10
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/qstogm4r
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
