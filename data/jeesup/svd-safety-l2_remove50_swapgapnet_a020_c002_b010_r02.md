# Jeesup/svd-safety-l2_remove50_swapgapnet_a020_c002_b010_r02

## Resumen

`svd-safety-l2_remove50_swapgapnet_a020_c002_b010_r02` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup, que ha sido comprimido con SVD-LLM hasta el 50,01 % de parametros densos eliminados y despues editado parcialmente mediante una tecnica de intercambio iterativo de parametros (`gap_iter`). Se trata de una celda concreta dentro de un grid experimental sobre reglas de seleccion de componentes y presupuestos de restauracion, no de un modelo de proposito general.

El problema que aborda es doble: por un lado, cuantificar como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un modelo alineado; por otro, evaluar si la restauracion selectiva de un subconjunto muy pequeno de parametros (658 componentes restaurados y 658 expulsados, un 0,11 % de los parametros de proyeccion densos) permite recuperar parte de esa seguridad. Es relevante ahora porque la compresion agresiva se usa cada vez mas para reducir costes de inferencia, y entender su impacto en la seguridad es un problema abierto.

El checkpoint representa un estado intermedio: solo se han aplicado 2 de las 5 rondas previstas, con un presupuesto de 0,2 % de parametros densos por ronda y un presupuesto total de ejecucion del 1,0 %. El autor advierte explicitamente de que varias celdas del grid estan deliberadamente degradadas en seguridad respecto al modelo base y de que este artefacto debe tratarse como sujeto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2 (RMSNorm, RoPE, SwiGLU), derivado de `meta-llama/Llama-2-7b-chat-hf` |
| Parametros totales | 6.738.415.616 segun los metadatos de safetensors; la model card declara una fraccion de parametros densos resultante de 0,4999 tras la compresion SVD-LLM |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (heredada del modelo base Llama-2-7b-chat; no se documenta ninguna extension en este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors, cargables con la libreria `transformers` |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Compresion | SVD-LLM, 50,01 % de parametros eliminados (fraccion resultante 0,4999) |
| Regla de seleccion | `gap_iter` |
| Presupuesto de restauracion | 1,000 % de parametros densos (ejecucion completa); 0,200 % por ronda |
| Componentes restaurados / expulsados | 658 / 658 |
| Parametros intercambiados | 7.353.344 (0,11 % de los parametros de proyeccion densos) |
| Valor de swap | `net` (valor de insercion + valor de expulsion en orden sigma) |
| Escala de insercion | 0,2 |
| Semilla | 42 |
| Rondas aplicadas | 2 de 5 (checkpoint intermedio) |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only de 32 capas con atencion multi-cabeza, normalizacion RMSNorm, embeddings posicionales rotatorios (RoPE) y capas feed-forward con activacion SwiGLU. El proceso aplicado sobre ese modelo no es un reentrenamiento, sino una compresion y una edicion de pesos: SVD-LLM descompone matrices de proyeccion y trunca sus valores singulares, eliminando el 50,01 % de los parametros densos, y despues se ejecuta un procedimiento de intercambio de parametros neutrales en dos rondas iterativas de 0,2 % de parametros densos cada una.

El mecanismo de reparacion selecciona componentes con la regla `gap_iter`, restaurando 658 componentes y expulsando otros tantos, con un valor de swap definido como `net` (suma del valor de insercion y del valor de expulsion en el orden sigma) y una escala de insercion de 0,2. No se documenta en la informacion disponible ningun dato sobre volumen de tokens de entrenamiento, composicion del dataset, ni uso de RLHF o DPO adicionales; las capacidades conversacionales proceden integramente del modelo base de Meta. La innovacion tecnica que se explora es metodologica: medir la perdida de seguridad inducida por la compresion y comprobar si una intervencion de bajo presupuesto puede revertirla, con semilla fija (42) para garantizar la reproducibilidad de la comparacion entre celdas.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones, heredada de Llama-2-7b-chat.
- Respuesta multi-turno dentro de una ventana de contexto de 4.096 tokens.
- Razonamiento basico, resolucion de problemas sencillos y generacion de codigo a nivel de modelo de 7B de su generacion.
- Soporte de tool calling o function calling: no nativo en la familia Llama 2 chat.
- Soporte de agentes y razonamiento multi-paso: no documentado ni nativo; cualquier uso agentico requeriria scaffolding externo.
- Capacidades multilingues: no disponibles como dato; el modelo base esta entrenado predominantemente en ingles.
- Capacidad especial: ninguna capacidad nueva. El interes del checkpoint es instrumental, como sujeto de medida para calcular tasas de exito de ataque (ASR) y de sobre-rechazo bajo compresion.

## Casos de uso

- Auditoria de degradacion de seguridad por compresion: medir la tasa de exito de ataque se con AdvBench y StrongREJECT con el juez HarmBench y compararla con la del modelo base sin comprimir, para cuantificar cuanto dano introduce el truncado SVD al 50 %.
- Estudio del coste en utilidad: usar la metrica de macro over-rechazo con WildGuard (0,1083 en esta celda) para estimar si el procedimiento de reparacion devuelve seguridad a costa de rechazar peticiones legitimas.
- Ablacion de reglas de seleccion de componentes: comparar esta celda (`gap_iter`) con las demas celdas del mismo grid publicadas por el autor, manteniendo constantes semilla, presupuesto y fraccion de compresion.
- Barrido de presupuesto de restauracion: contrastar este checkpoint intermedio (2 de 5 rondas, 0,2 % por ronda) con las versiones de rondas posteriores del mismo run para trazar la curva de recuperacion de seguridad frente al porcentaje de parametros restaurados.
- Interpretabilidad de componentes de seguridad: analizar los 658 componentes restaurados y los 658 expulsados para localizar que subconjuntos de pesos de proyeccion concentran la conducta de rechazo.
- Red-teaming automatizado: emplear el checkpoint como sujeto deliberadamente vulnerable en pipelines de evaluacion de ataques, comparando la eficacia de distintos jueces y conjuntos de prompts.
- Reproducibilidad metodologica: replicar el procedimiento con los hiperparametros documentados (semilla 42, chunk de 0,2 %, swap `net`, escala de insercion 0,2) en otros modelos base para comprobar la transferibilidad de la tecnica.
- Formacion y divulgacion: usar el par comprimido / sin comprimir como ejemplo didactico de que la compresion no es neutral respecto a la alineacion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,5288 |
| StrongREJECT | ASR (juez HarmBench) | 0,3099 |
| WildGuard | Macro over-refusal | 0,1083 |

No se han publicado en la informacion disponible valores de referencia del modelo base sin comprimir ni de otras celdas del grid, por lo que no es posible establecer una comparacion cuantitativa directa con esas variantes. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de otros benchmarks de capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: alrededor de 14-16 GB si se cargan los 6.738.415.616 parametros declarados en safetensors, mas margen para la cache KV; en torno a 7-8 GB si la fraccion densa real de 0,4999 se refleja en el numero de pesos efectivos.
- Cuantizacion posterior: aproximadamente 7-8 GB en 8 bits y 4-5 GB en 4 bits, en funcion de la herramienta empleada.
- GPU de datacenter: A100 40/80 GB, H100, L40S; no se requiere hardware de gama alta si se aplica cuantizacion.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en fp16; en tarjetas de 16 GB conviene 8 bits; en 8-12 GB, cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` de forma nativa; text-generation-inference (el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`); vLLM. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se distribuye en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento de seguridad |
|---|---|---|---|---|---|
| Este checkpoint (`Jeesup/svd-safety-l2_remove50_swapgapnet_a020_c002_b010_r02`) | 6.738.415.616 declarados en safetensors; fraccion densa 0,4999 tras SVD-LLM | 4.096 tokens | Llama 2 Community License | safetensors | AdvBench ASR 0,5288; StrongREJECT ASR 0,3099; macro over-refusal 0,1083 |
| meta-llama/Llama-2-7b-chat-hf (base sin comprimir) | 6.738.415.616 | 4.096 tokens | Llama 2 Community License | safetensors | no disponible en la informacion proporcionada |
| Otras celdas del grid SVD-LLM del mismo autor | no disponible | no disponible | Llama 2 Community License | safetensors | no disponible |
| Otros modelos comprimidos de ~7B publicos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor indica que varias celdas del grid estan deliberadamente degradadas en seguridad y que este checkpoint no es un asistente desplegable. La tasa de exito de ataque de 0,5288 en AdvBench es elevada y desaconseja cualquier uso en produccion orientado al publico.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad; la compresion agresiva tiende a aumentar la perdida de fidelidad factica respecto al modelo original, que no se ha medido aqui.
- El checkpoint corresponde a un estado intermedio (2 de 5 rondas), por lo que no representa el resultado final del procedimiento de reparacion ni su mejor caso.
- Discrepancia a verificar: el recuento de parametros de los safetensors (6.738.415.616) coincide con el del modelo base sin comprimir, mientras la model card declara una fraccion densa de 0,4999. Conviene inspeccionar las formas reales de los tensores antes de dar por buena la reduccion efectiva de coste en memoria.
- Licencia: Llama 2 Community License, con las restricciones habituales de la familia (incluida la clausula de 700 millones de usuarios mensuales), obligacion de incluir el aviso "Built with Llama 2" y de respetar `USE_POLICY.md`.
- Idiomas soportados: no documentados; el modelo base esta orientado al ingles y no se ha validado el comportamiento en castellano ni en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo sin tecnicas externas.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y los metadatos muestran fechas de creacion y actualizacion de septiembre de 2026.
- No se distribuyen pesos cuantizados ni versiones GGUF, lo que anade trabajo de conversion a cualquier despliegue fuera de `transformers`, TGI o vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapnet_a020_c002_b010_r02
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de SVD-LLM: no disponible en la informacion proporcionada (la busqueda web no devolvio resultados relevantes sobre el modelo)
- Repositorios, demos o blogs adicionales: no disponible
