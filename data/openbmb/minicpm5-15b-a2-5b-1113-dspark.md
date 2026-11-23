# openbmb/MiniCPM5-15B-A2.5B-1113-Dspark

## Resumen

MiniCPM5-15B-A2.5B-1113-Dspark es un modelo publicado en Hugging Face por el equipo de OpenBMB, el grupo de investigacion en modelos eficientes de la Universidad de Tsinghua y la comunidad ModelBest. El nombre sugiere un modelo de arquitectura Mixture of Experts (MoE) con 15B parametros totales y 2.5B parametros activos por token, integrado en la familia MiniCPM5, aunque los datos disponibles en la ficha del repositorio no permiten confirmar esta configuracion.

El artefacto publicado contiene unicamente 428.633.601 parametros en formato safetensors (aproximadamente 0,43B), lo que resulta inconsistente con el nombre del modelo. Es probable que el repositorio contenga solo una parte de los pesos (por ejemplo, un subconjunto de expertos o un checkpoint parcial) o que se trate de una publicacion preliminar. El tag `custom_code` indica que requiere cargar codigo remoto del repositorio, y el tag `qwen3` apunta a una base arquitectonica derivada de la familia Qwen3.

La relevancia de este modelo radica en su propuesta de eficiencia: un MoE con solo 2.5B parametros activos podria ofrecer un rendimiento cercano a modelos densos mucho mayores con un coste de inferencia muy inferior. No obstante, la ausencia de licencia, idiomas declarados, benchmarks y documentacion tecnica limita seriamente su evaluacion y su uso en produccion en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (inferida del nombre; tag `qwen3`, `custom_code`) |
| Parametros totales | 15B (segun nombre); 428.633.601 en safetensors del repo |
| Parametros activos | 2.5B (segun nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repo | 0,9 GB |
| Descargas | 0 |
| Likes | 1 |
| Fecha de creacion | 2026-11-23 |

## Arquitectura y entrenamiento

El tag `qwen3` sugiere que el modelo parte de la arquitectura Qwen3, un transformer decoder-only con atencion por grupos (GQA) y, en sus variantes MoE, capas de mezcla de expertos con enrutamiento tipo top-k. El nombre "15B-A2.5B" sigue la convencion habitual para indicar 15 mil millones de parametros totales y 2,5 mil millones activos por token, lo que implicaria un ratio de activacion de aproximadamente el 16,7 %. El sufijo "Dspark" no tiene documentacion publica asociada y podria referirse a una variante de entrenamiento, un dataset o una tecnica de decodificacion especulativa.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones concretas como atencion lineal, decodificacion especulativa o destilacion. El tag `custom_code` implica que la carga del modelo requiere `trust_remote_code=True` y que la implementacion exacta de las capas MoE reside en el repositorio, no en la libreria estandar de Transformers. La discrepancia entre los 15B declarados en el nombre y los 0,43B presentes en los safetensors es el dato tecnico mas relevante y debe resolverse antes de cualquier evaluacion.

## Capacidades

- Generacion de texto autoregresiva (capacidad esperada en un modelo de la familia MiniCPM, no verificada en este checkpoint).
- Razonamiento multi-paso y cadenas de pensamiento (no confirmado).
- Generacion de codigo y matematicas (no confirmado).
- Tool calling y function calling (no confirmado).
- Soporte de agentes y razonamiento multi-turno (no confirmado).
- Capacidades multilingues (idiomas no declarados en la ficha).
- Capacidades multimodales (vision, audio): no disponible.
- Modo thinking explicito: no disponible.

No se ha publicado ninguna evaluacion cualitativa ni cuantitativa de estas capacidades para este checkpoint concreto.

## Casos de uso

- Evaluacion de arquitecturas MoE eficientes: investigadores pueden inspeccionar el codigo personalizado del repositorio para estudiar como se implementa el enrutamiento de expertos con 2,5B parametros activos y comparar el coste de inferencia frente a modelos densos equivalentes.
- Despliegue en entornos con VRAM limitada (si se confirma el checkpoint completo): un MoE de 15B totales y 2,5B activos permitiria servir cargas concurrentes en GPUs de 24 GB con cuantizacion de 4 bits, algo inviable con un denso de 15B en precision completa.
- Experimentacion academica con modelos MiniCPM: el modelo encaja en lineas de investigacion sobre destilacion, pruning y eficiencia que usan la familia MiniCPM como referencia.
- Fine-tuning con LoRA sobre subconjuntos de expertos: la estructura MoE permite adaptar dominios concretos activando o ajustando expertos especificos, reduciendo el coste frente a un fine-tuning denso completo.
- Prototipado de asistentes conversacionales de bajo coste: si el modelo rinde segun lo esperado, podria alimentar chatbots multi-turno en hardware de gama media, aunque la falta de datos de contexto impide confirmar la ventana maxima.
- Reproduccion de benchmarks de la familia MiniCPM5: util para verificar de forma independiente las cifras publicadas por OpenBMB en futuras versiones del modelo.

En todos los casos, la ausencia de licencia y de documentacion impide recomendar su uso en produccion sin una evaluacion previa por parte del equipo legal y tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (si se confirma el modelo completo de 15B totales y 2,5B activos): aproximadamente 8-10 GB en cuantizacion de 4 bits, 16-18 GB en 8 bits y 30-32 GB en FP16 para los pesos totales; el coste de computo por token corresponde a 2,5B activos.
- VRAM del checkpoint actual (0,43B parametros): inferior a 1 GB en FP16, ejecutable en CPU y en cualquier GPU consumer.
- GPU recomendadas para el modelo completo: NVIDIA A100 40/80 GB, H100 80 GB para servicio de alta concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en 4-8 bits.
- GPU consumer: si, en tarjetas con 16-24 GB de VRAM usando cuantizacion de 4 bits; el checkpoint parcial actual cabe en cualquier GPU con 2 GB o mas.
- Opciones de despliegue: vLLM (soporte MoE), llama.cpp/GGUF (requiere conversion, no publicada), Ollama (no disponible), TGI (soporte MoE limitado). La carga requiere `trust_remote_code=True` por el tag `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-15B-A2.5B-1113-Dspark | 15B (nombre) / 0,43B (repo) | 2,5B (nombre) | no disponible | no disponible | Hugging Face |
| Qwen3-30B-A3B | 30B | 3B | 32K-128K | Apache 2.0 | Hugging Face, ampliamente adoptado |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | Hugging Face |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32K | DeepSeek License | Hugging Face |

La comparativa mas directa es con DeepSeek-V2-Lite, que con 15,7B totales y 2,4B activos ocupa el mismo nicho de eficiencia. Sin benchmarks publicados del modelo de OpenBMB, no es posible establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Discrepancia critica entre el nombre (15B) y los parametros reales en safetensors (0,43B): el checkpoint publicado podria estar incompleto o ser un subconjunto, lo que invalida cualquier evaluacion de rendimiento.
- Licencia no declarada: no se puede usar comercialmente sin aclaracion explicita del autor.
- Idiomas no declarados: se desconoce la cobertura linguistica real.
- Contexto no documentado: imposible planificar aplicaciones con ventanas largas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio; auditar antes de desplegar.
- Cero descargas y un solo like en el momento de la ficha: sin validacion por parte de la comunidad.
- Sin benchmarks, sin model card tecnica y sin documentacion de entrenamiento: riesgo elevado de alucinacion y comportamiento no caracterizado.
- Fecha de creacion futura (2026-11-23) en los metadatos: posible error de publicacion o artefacto de prueba.
- No apto para produccion sin una evaluacion independiente completa.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM5-15B-A2.5B-1113-Dspark
- Organizacion OpenBMB en Hugging Face: https://huggingface.co/openbmb
- Repositorio MiniCPM en GitHub: https://github.com/OpenBMB/MiniCPM
- Documentacion de Qwen3 (base arquitectonica probable): https://github.com/QwenLM/Qwen3
