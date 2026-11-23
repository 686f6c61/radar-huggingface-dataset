# Avifenesh/Hy3-REAP-Layer103p5-bw24

## Resumen

Hy3-REAP-Layer103p5-bw24 es un derivado podado y cuantizado del modelo base tencent/Hy3, publicado por el usuario Avifenesh (autor del motor de inferencia memra, anteriormente denominado bw24). No se trata de un checkpoint generico de Transformers, sino de un artefacto propietario con formato `bw24-expert-overlay-v2`: un overlay de expertos que debe combinarse en tiempo de ejecucion con los tensores no-expertos del Hy3 original fijado a una revision concreta. El modelo conserva la asignacion completa de la capa 100 y restaura 262 expertos solo en las capas 60-79, dando como resultado un modelo logico de 103.489.802.752 bytes (96,38 GiB) representado por 78.490.288.128 bytes de payload de expertos mas los tensores de fallback del origen.

El modelo base Hy3 es un transformer de mezcla de expertos (MoE) de desarrollo por Tencent, con un banco completo de 192 expertos. Este derivado aplica una estrategia de poda de expertos basada en REAP (expert pruning) combinada con cuantizacion mixta (etiqueta `bw24`), reduciendo el tamano logico al 54% aproximadamente del banco completo. La relevancia actual reside en que demuestra un flujo de compresion agresiva con preservacion de capacidad medible: conserva el 89,4% de las respuestas correctas del banco completo (76 de 85) en un panel de 115 preguntas, frente al 85,9% (73 de 85) de la variante Layer100.

La licencia es Apache 2.0, pero el artefacto no es directamente consumible por herramientas estandar: requiere el motor memra, el script de reubicacion incluido y el repositorio fuente tencent/Hy3 con revision exacta. Las capacidades declaradas por el autor se limitan a generacion de texto; no se documentan idiomas soportados ni resultados de benchmarks publicos estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) derivada de tencent/Hy3; banco completo de 192 expertos, overlay con expertos restaurados en capas 60-79 |
| Parametros totales | no disponible (tamano logico declarado: 103.489.802.752 bytes / 96,38 GiB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion mixta propietaria (`bw24`); el banco completo de referencia usa NVFP4 uniforme |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `bw24-expert-overlay-v2` (overlay de expertos propietario, no Transformers/MLX/GGUF/ModelOpt); requiere `manifest.json` y ficheros `*.complete.json` |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con un banco de 192 expertos en el modelo base Hy3 de Tencent. Este derivado no reentrena el modelo: aplica una poda selectiva de expertos guiada por REAP (expert pruning) y una cuantizacion mixta. La construccion preserva la asignacion completa de la capa 100 (el "Layer100 matched") y restaura 262 expertos unicamente en las capas 60-79 (de ahi "late20"), lo que eleva el tamano logico de 100,0 GB a 103,5 GB. El artefacto publicado contiene solo los payloads de expertos (78,49 GB); los tensores no-expertos se toman del Hy3 fuente fijado a la revision `716aa7241bd6d95896be4ebfc761162a9c4d49ef` (99 shards, 597.578.239.288 bytes).

No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que el proceso es de compresion sobre un modelo ya entrenado. La innovacion tecnica destacable es el propio formato de overlay con contratos de integridad: manifiesto inmutable, hashes SHA-256 de `config.json` e indice de safetensors, y recibos de evaluacion (`evidence/`) que registran el plan, la seleccion de variante y los resultados del panel. La seleccion de la variante se hizo unicamente a partir de desplazamiento de routing privado y posicion de capa, sin usar puntuaciones publicas de capacidad. En la evaluacion emparejada se desactivaron la decodificacion especulativa (MTP) y la reutilizacion de KV.

## Capacidades

- Generacion de texto: unica capacidad declarada en la model card (pipeline `text-generation`).
- Razonamiento matematico: el panel de evaluacion incluye la categoria "math", con 29 aciertos de 115 en la variante publicada.
- Generacion de codigo: el panel incluye la categoria "code", con 32 aciertos de 115.
- Conocimiento historico: el panel incluye la categoria "history", con 4 aciertos de 115.
- Otras categorias del panel: 11 aciertos de 115 en "other".
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Evaluacion de estrategias de poda de expertos en MoE: el modelo sirve como referencia reproducible para comparar la preservacion de capacidad entre el banco completo (85/115), Layer100 (73/115) y Layer103.5 (76/115) sobre el mismo panel de 115 preguntas, con recibos criptograficos que permiten auditar la comparacion.
- Investigacion en cuantizacion mixta: el formato `bw24` con metadatos por fichero (`manifest.json`, `*.complete.json`) permite estudiar como la cuantizacion selectiva por experto afecta al rendimiento sin necesidad de reentrenar.
- Despliegue con el motor memra en entornos controlados: el modelo se sirve mediante `memra-server` con compatibilidad OpenAI (`MEMRA_COMPAT=openai`), lo que permite integrarlo en clientes que ya hablan la API de OpenAI para pruebas internas de generacion de texto.
- Benchmarking de motores de inferencia: al requerir el motor memra y un script de reubicacion, es util para validar la correccion del cargador de overlays Hy3 y comparar throughput frente al modelo base completo.
- Reproduccion de experimentos con integridad verificable: los hashes de `config.json`, indice de safetensors y recibos de evaluacion permiten reconstruir exactamente el entorno de medida y detectar desviaciones en los pesos fuente.
- Estudio de routing de expertos: la restauracion selectiva de 262 expertos en capas 60-79 permite analizar el desplazamiento de routing y su impacto en tareas especificas (matematicas, codigo, historia) frente a podas mas agresivas como la mascara REAP50 de la comunidad, que colapso en el panel de 56 preguntas (19/56).

## Benchmarks y rendimiento

Los datos disponibles provienen del panel privado del autor, no de benchmarks publicos estandar (MMLU, HumanEval, GSM8K). Se presentan tal cual, con la advertencia de que la significancia estadistica no esta establecida.

| Variante | Tamano logico | Panel | Aciertos | Domain-macro |
|---|---:|---|---:|---:|
| Banco completo 192 expertos, NVFP4 uniforme, sin poda | 186,0 GB | 115 preguntas | 85/115 | no disponible |
| Layer100 matched | 100,0 GB | 115 preguntas | 73/115 | 0,607 |
| Layer103.5 late20 (este repo) | 103,5 GB | 115 preguntas | 76/115 | 0,641 |
| Banco completo 192 expertos, NVFP4 uniforme | 186,0 GB | 56 preguntas | no disponible | 0,727 |
| Mascara REAP50 de la comunidad, NVFP4 uniforme | 105,5 GB | 56 preguntas | 19/56 | 0,239 |

Desglose por dominio de la variante publicada frente a Layer100 matched (mismo panel de 115 preguntas):

| Dominio | Layer100 matched | Layer103.5 late20 |
|---|---:|---:|
| Matematicas | 27 | 29 |
| Codigo | 32 | 32 |
| Historia | 3 | 4 |
| Otros | 11 | 11 |
| Total | 73/115 | 76/115 |

El resultado emparejado es de 5 victorias, 2 derrotas y 108 empates. El intervalo bootstrap de la macro por dominio cruza cero y el p-valor exacto de signos emparejado es 0,453125, por lo que el autor lo califica como evidencia direccional y no como significancia estadistica. A aproximadamente el 54% del tamano logico del banco completo, la variante publicada conserva el 89,4% de las respuestas correctas (76 de 85). El panel de 56 preguntas es un cribado anterior e independiente, sin preguntas compartidas con el de 115; los valores domain-macro del banco completo y de REAP50 pertenecen solo a ese cribado y no son comparables en la escala de 115 preguntas.

## Requisitos de hardware

- VRAM estimada: el modelo logico ocupa 96,38 GiB, por lo que la inferencia requiere al menos ~97 GB de memoria combinada (GPU + posible spill a CPU/almacenamiento). El repo descargable son 78,5 GB de payload de expertos mas los tensores no-expertos del Hy3 fuente (597,6 GB en 99 shards, aunque solo se usan los no-expertos).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, un unico acelerador de 80 GB no basta para el modelo logico completo sin estrategias de offload o particionado.
- Cabe en GPU de consumo: no, segun el tamano logico declarado.
- Opciones de despliegue: exclusivamente el motor memra (`memra-server`), con variables `MEMRA_MODELS`, `MEMRA_COMPAT=openai`, `MEMRA_SERVE_SPEC=0`, `MEMRA_KV_REUSE=0`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `bw24-expert-overlay-v2` no es un checkpoint estandar.
- Latencia y throughput: no disponibles. En la evaluacion emparejada se desactivaron la decodificacion especulativa (MTP) y la reutilizacion de KV, por lo que las cifras de produccion no estan documentadas.

## Comparativa con modelos similares

| Modelo | Parametros / tamano logico | Contexto | Rendimiento en panel | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy3-REAP-Layer103p5-bw24 (este repo) | 103,5 GB logicos | no disponible | 76/115 | Apache 2.0 | HF, requiere motor memra |
| Layer100 matched (misma familia) | 100,0 GB logicos | no disponible | 73/115 | Apache 2.0 | HF (variante del autor) |
| Hy3 banco completo 192 expertos NVFP4 | 186,0 GB logicos | no disponible | 85/115 | Apache 2.0 | HF (tencent/Hy3) |
| Mascara REAP50 de la comunidad | 105,5 GB logicos | no disponible | 19/56 (panel distinto) | no disponible | HF |

La comparacion con modelos de otros desarrolladores (mismo tamano o misma tarea) no esta disponible en la informacion proporcionada. Las alternativas listadas pertenecen todas a la familia Hy3 o a derivados de la comunidad sobre el mismo modelo base.

## Limitaciones y advertencias

- El artefacto no es un checkpoint estandar: no funciona con Transformers, MLX, GGUF ni ModelOpt. Requiere el motor memra, el script `relocate_hy3_expert_overlay.py` y el repositorio tencent/Hy3 en la revision exacta `716aa7241bd6d95896be4ebfc761162a9c4d49ef`.
- El manifiesto publicado apunta a la ruta de la maquina de construccion; es necesario crear una vista reubicada con enlaces simbolicos a los ficheros de expertos publicados.
- La evidencia de rendimiento es direccional, no estadisticamente significativa: 5 victorias, 2 derrotas y 108 empates, con p-valor de 0,453125 e intervalo bootstrap que cruza cero.
- El panel de evaluacion es privado (115 preguntas) y no equivale a benchmarks publicos; no hay resultados de MMLU, HumanEval, GSM8K ni similares.
- No se documentan sesgos conocidos, riesgo de alucinacion ni idiomas soportados; la model card no cubre estos aspectos.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base tencent/Hy3 debe verificarse por separado (su licencia no se detalla en la informacion proporcionada).
- El uso en produccion exige desactivar decodificacion especulativa y reutilizacion de KV segun la configuracion de evaluacion, lo que puede degradar el throughput respecto a configuraciones optimizadas.
- Cero descargas y un solo "like" en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Avifenesh/Hy3-REAP-Layer103p5-bw24
- Modelo base: https://huggingface.co/tencent/Hy3
- Motor de inferencia memra: https://github.com/avifenesh/memra
- Runbook de spill Hy3: `docs/HY3-SPILL.md` dentro del repositorio de memra
- Artefactos de benchmark: https://huggingface.co/Avifenesh/bw24-bench
