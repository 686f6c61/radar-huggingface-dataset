# keypa/vision-adapter-probe-checkpoints

## Resumen

`keypa/vision-adapter-probe-checkpoints` es un repositorio de checkpoints de entrenamiento publicado en HuggingFace por el usuario `keypa`. No contiene un modelo listo para usar, sino el resultado de una sonda de alineacion vision-lenguaje: un proyector ligero de aproximadamente 25 millones de parametros que proyecta embeddings visuales de MoonViT-V2 (4096 dimensiones) al espacio oculto (2048 dimensiones) del backbone congelado `Qwen/Qwen3.5-2B`. Durante el entrenamiento solo se actualizan los pesos del proyector; tanto la torre de vision como el modelo de lenguaje permanecen congelados.

El propio autor lo describe explicitamente como una "sonda de alineacion (estudio de grokking), no un modelo publicado". Su interes, por tanto, es metodologico y de investigacion: documenta la trayectoria de perdida de un proyector de tipo *hourglass*, el uso de *gradient checkpointing* adaptativo por presupuesto de `B·L²` y un pipeline de guardado de checkpoints reanudables. El repositorio ocupa 1,2 GB y aloja estados completos de entrenamiento (proyector, optimizador, escalador, monitor, RNG y metadatos de plan), no pesos finales optimizados para inferencia.

La relevancia actual es limitada fuera del ambito de la investigacion en alineacion multimodal: se publica bajo licencia Apache 2.0, acumula 0 descargas y 0 *likes*, y no incluye resultados de evaluacion publicados mas alla de las curvas de perdida y el registro por paso (`probe_log.jsonl`). Cualquier uso en produccion exigiria reconstruir el pipeline completo a partir del repositorio de entrenamiento referenciado, que no se enlaza en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector tipo *hourglass* (`HourglassProjector`) que alinea una torre de vision congelada (MoonViT-V2) con un backbone LLM congelado (Qwen3.5-2B) |
| Parametros totales | ~25 millones (solo el proyector entrenable); el backbone y la torre de vision estan congelados |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (longitud maxima de secuencia usada en el entrenamiento); no se especifica la ventana de inferencia del backbone congelado |
| Tipos de cuantizacion | No disponible; el entrenamiento usa bf16 y no se publican versiones cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch nativo (`.pt`, serializacion pickle); no se publican safetensors ni GGUF |
| Dimension de entrada visual | 4096 (MoonViT-V2) |
| Dimension de salida al LLM | 2048 (*hidden size* de Qwen3.5-2B) |
| Tamano del repositorio | 1,2 GB |
| Tamano por checkpoint | ~150 MB por checkpoint de paso (incluye estado del optimizador, RNG y monitor) |
| Autor | keypa |
| Fecha de creacion | 2026-09-12 |
| Ultima actualizacion | 2026-09-12 |
| Libreria | pytorch |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un esquema de alineacion de dos torres congeladas y un adaptador entrenable. Por un lado, MoonViT-V2 produce embeddings visuales de 4096 dimensiones; por otro, `Qwen/Qwen3.5-2B` espera vectores de 2048 dimensiones en su espacio oculto. El unico componente que recibe gradientes es un proyector denominado `HourglassProjector(vision_dim=4096, llm_dim=2048)`, que reduce y reexpande la representacion para hacerla consumible por el LLM. El repositorio no documenta la composicion interna de ese proyector mas alla de su nombre y sus dimensiones de entrada y salida.

El entrenamiento se realizo con AdamW, tasa de aprendizaje 5e-4, 100 pasos de *warmup* y recorte de gradiente de 1.0, con batch de 16 y longitud maxima de secuencia de 4096 en bf16. La innovacion tecnica destacada es el *gradient checkpointing* adaptativo por lote: se define un presupuesto de `B·L²` con `L_MAX=2500` y `COST_MAX=50M`, de modo que los lotes pequenos siguen la ruta rapida sin recomputo y solo los del peor *bucket* activan el checkpointing durante ese paso. Los datos consisten en 116 000 filas emitidas en streaming, distribuidas en 6 *buckets* segun el numero de imagenes (`n_vis`), con perdida selectiva aplicada unicamente a la respuesta y al token EOS. El guardado de checkpoints se dispara cada 100 pasos o cada 10 minutos. No se documenta el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias. La model card anticipa una "ventana de grokking" con un colapso esperado de la perdida mas alla de aproximadamente 57 600 muestras vistas.

## Capacidades

- Alineacion de embeddings visuales con un espacio latente de un LLM: el proyector transforma vectores de 4096 dimensiones en vectores de 2048 dimensiones compatibles con Qwen3.5-2B.
- Entrenamiento reproducible y reanudable: los checkpoints de paso incluyen proyector, optimizador, escalador, monitor, estado del RNG, metadatos del plan y configuracion, y permiten relanzar el entrenamiento con `--resume hf --resume-step K`.
- Monitorizacion por paso: el archivo `probe_log.jsonl` registra perdida, media movil exponencial, norma del gradiente, tokens procesados, longitud, presupuesto `B·L²` y la bandera de *gradient checkpointing* de cada paso.
- Estudio de grokking: el repositorio esta disenado para observar la transicion de la perdida en una tarea de alineacion, con un conjunto de validacion retenido de 60 ejemplos (*Heldout-60*).
- Estrategia de memoria adaptativa: activacion selectiva de recomputo de activaciones segun el coste del lote.
- Generacion de texto, razonamiento, codigo, matematicas, vision, *tool calling*, agentes, capacidades multilingues y modos de pensamiento: no disponible; el repositorio no publica un modelo de inferencia ni evaluaciones de estas capacidades.

## Casos de uso

- Investigacion sobre grokking en alineacion multimodal: el repositorio permite reproducir la curva de perdida paso a paso y localizar la transicion esperada alrededor de las 57 600 muestras, usando `probe_log.jsonl` como fuente primaria de datos.
- Estudio de proyectores ligeros para vision-lenguaje: un adaptador de ~25 millones de parametros sobre torres congeladas es un banco de pruebas de bajo coste para comparar arquitecturas de proyeccion (por ejemplo, variantes del esquema *hourglass*) sin reentrenar el backbone.
- Optimizacion de memoria en entrenamiento multimodal: el mecanismo de *gradient checkpointing* adaptativo por presupuesto `B·L²` sirve como referencia para implementar estrategias dinamicas de recomputo en *pipelines* propios con lotes de tamano variable.
- Ingenieria de pipelines de datos en streaming: la configuracion de 116 000 filas con 6 *buckets* por numero de imagenes y perdida selectiva sobre respuesta y EOS es un ejemplo replicable de bucle de datos con enmascarado de perdida.
- Infraestructura de checkpoints reanudables: el formato de guardado (estado completo con optimizador, RNG y monitor) es directamente reutilizable como plantilla para sistemas de reanudacion tolerantes a fallos en *clusters*.
- Docencia y formacion tecnica: el par de repositorios (sonda mas pipeline de entrenamiento) sirve como material didactico para explicar alineacion de modalidades, congelacion de torres y monitorizacion de gradientes.
- Auditoria de integridad de artefactos: la advertencia explicita sobre `weights_only=False` convierte este repositorio en un caso practico para discutir riesgos de deserializacion de checkpoints PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica evidencia de rendimiento es la trayectoria de perdida registrada en `probe_log.jsonl` y las curvas de `probe_curves.png`, junto con la mencion de un conjunto de validacion retenido de 60 ejemplos (*Heldout-60*) y sondas de generacion cuya evaluacion se gestiona en el repositorio de entrenamiento (`docs/NEXT_STEPS.md`). No se proporcionan valores numericos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar.

## Requisitos de hardware

- Entorno de entrenamiento declarado: GPU RTX PRO 6000 de 96 GB, precision bf16, batch de 16 y longitud de secuencia de 4096. En GPU grandes el *gradient checkpointing* permanece desactivado.
- VRAM de inferencia: no disponible de forma oficial. Calculo derivado de los datos publicados: el proyector suma ~25 millones de parametros (checkpoints de ~150 MB) y un backbone de 2 000 millones de parametros en bf16 ocuparia aproximadamente 4 GB solo en pesos, a lo que habria que anadir la torre MoonViT-V2, cuyo tamano no se publica.
- GPU recomendadas: no disponible. La unica referencia documentada es la RTX PRO 6000 de 96 GB empleada para el entrenamiento.
- Compatibilidad con GPU de consumo: no disponible. El repositorio no distribuye pesos del backbone ni de la torre de vision, por lo que no puede ejecutarse de forma autonoma.
- Opciones de despliegue: no disponible. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI; el unico camino documentado es cargar el proyector en PyTorch mediante `vision_adapter.core.HourglassProjector`.
- Latencia y throughput: no disponible.
- Requisito de seguridad: la carga de checkpoints de paso exige `weights_only=False`, lo que implica ejecutar codigo de deserializacion y obliga a cargar unicamente archivos de confianza.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con otras sondas de alineacion vision-lenguaje, proyectores multimodales o adaptadores de dimension equivalente.

## Limitaciones y advertencias

- No es un modelo publicado: el propio autor lo define como una sonda de alineacion para un estudio de grokking. No debe presentarse ni desplegarse como un modelo vision-lenguaje funcional.
- Dependencia no distribuida: los pesos de MoonViT-V2 y de Qwen3.5-2B no forman parte del repositorio, por lo que el artefacto no es autosuficiente.
- Evaluacion incompleta: la evaluacion con el conjunto *Heldout-60* y las sondas de generacion se gestionan en un repositorio de entrenamiento externo que no se enlaza en la model card.
- Idiomas soportados: no disponible. Al depender de un backbone congelado, el comportamiento multilingue no puede determinarse a partir de la informacion publicada.
- Cuantizacion: no disponible. No se ofrecen pesos en safetensors, GGUF ni versiones cuantizadas, lo que complica su integracion en *runtimes* de inferencia habituales.
- Riesgo de seguridad en la carga: los checkpoints de paso requieren `weights_only=False` porque embeben estado del optimizador, del RNG y del monitor. Cargar archivos no verificados permite ejecucion de codigo arbitrario.
- Sesgos: no disponible. No se documenta la composicion del dataset mas alla del recuento de 116 000 filas y su reparto en 6 *buckets* por numero de imagenes.
- Riesgo de alucinacion: no disponible. No hay evaluaciones de generacion publicadas para este proyector.
- Adopcion practicamente nula: 0 descargas y 0 *likes* a fecha de la ultima actualizacion (2026-09-12), sin senales de mantenimiento posterior.
- Licencia: Apache 2.0 permite uso comercial del artefacto publicado, pero no exime de respetar las licencias de los componentes congelados (torre de vision y backbone), cuyos terminos no se detallan.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/keypa/vision-adapter-probe-checkpoints
- Model card original (contenido de referencia): incluida en la pagina anterior
- Repositorio de entrenamiento y `docs/NEXT_STEPS.md`: referenciados en la model card, pero sin URL publica en la informacion disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las fuentes devueltas (base44.com, app.base44.com, base-44.com, anuncio de Binance Alpha sobre ANON y BEETS, y un perfil de Newgrounds) no guardan relacion con este repositorio y se descartan.
