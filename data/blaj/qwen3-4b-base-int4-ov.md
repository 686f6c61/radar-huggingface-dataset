# blaj/Qwen3-4B-Base-int4-ov

## Resumen

`blaj/Qwen3-4B-Base-int4-ov` es una conversion del checkpoint `Qwen/Qwen3-4B-Base` al formato OpenVINO IR (Intermediate Representation) con los pesos comprimidos a int4. El modelo lo publica el usuario blaj y no es un modelo nuevo: es un artefacto de despliegue pensado para ejecutar Qwen3-4B-Base sobre hardware Intel (CPU, iGPU Arc, NPU) mediante el runtime de OpenVINO. Qwen3-4B-Base es el modelo denso de 4 mil millones de parametros de la familia Qwen3, desarrollada por Alibaba Qwen, y en este caso se trata de la variante *base* (preentrenada, sin ajuste por instrucciones).

La particularidad de esta build frente a otras conversiones int4 es que exporta metadatos de localizacion de estados ocultos (`hidden_states_decoder_layers`) para las 36 capas. Esto permite usarla como modelo objetivo en decodificacion especulativa con un *drafter* DFlash, que consume los estados intermedios del modelo objetivo. El autor documenta de forma transparente que, en su hardware de referencia (iGPU Arc), el drafter resulto mas lento que la decodificacion directa, con lo que la utilidad practica de ese modo esta limitada por el hardware.

El modelo ocupa unos 2.2 GB en disco, lo que lo hace apto para equipos con poca memoria. Su relevancia actual esta en el despliegue local eficiente en plataformas Intel: es una pieza de infraestructura, no un modelo de proposito general que compita en benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, decoder-only), 36 capas, hidden size 2560, vocab 151936 |
| Parametros totales | 4 mil millones (modelo base Qwen3-4B-Base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int4 asimetrico, group size 128 (INT4_ASYM) sobre export fp16; existe build hermana en int8 |
| Idiomas soportados | no disponible en detalle; el modelo base Qwen3-4B es multilingue segun su documentacion |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (grafo XML + pesos binarios), *stateful*, con metadatos de estados ocultos |

## Arquitectura y entrenamiento

La conversion parte de `Qwen/Qwen3-4B-Base`, un transformer denso decoder-only con 36 capas y dimension oculta de 2560. El proceso de export sigue dos etapas documentadas por el autor: primero un export a OpenVINO con `optimum-cli export openvino --task text-generation-with-past --weight-format fp16`, y despues compresion de pesos con `nncf.compress_weights(..., INT4_ASYM, group_size=128, ratio=1.0)`. El resultado es un modelo *stateful* (con cache de KV gestionada por el propio grafo), lo que simplifica la inferencia en servidores OpenVINO. Las versiones de herramientas citadas son transformers 5.5.0, optimum-intel 2.2.0 y OpenVINO 2026.4.0.

La innovacion tecnica de esta build es la anotacion de estados ocultos: se anaden localizadores para las 36 capas, incluidos los cinco que lee el drafter de Qwen3-4B (`1, 9, 17, 25, 33`). Sin estos metadatos, el runtime de decodificacion especulativa cae silenciosamente a decodificacion solo-objetivo. No hay informacion sobre el entrenamiento del modelo base (tokens, composicion del dataset, RLHF/DPO) en la documentacion proporcionada; al tratarse de un checkpoint *base*, no hay ajuste por instrucciones ni alineacion conversacional.

## Capacidades

- Generacion de texto por *completado* (prompt-completion). El autor advierte explicitamente de que es un modelo base y no sigue instrucciones de chat.
- Capacidades del modelo base Qwen3-4B: comprension y generacion de lenguaje, codigo y matematicas, segun la descripcion publica de Qwen3-4B.
- Capacidad multilingue heredada del modelo base (la documentacion de Qwen3 lo describe como multilingue); sin lista de idiomas en esta ficha.
- Soporte de decodificacion especulativa como objetivo, con un drafter DFlash compatible gracias a los metadatos de estados ocultos.
- Inferencia *stateful* con cache de KV gestionada por el grafo OpenVINO.
- Soporte de *tool calling* / *function calling* y comportamiento de agente: no disponible (el checkpoint base no esta ajustado para ello; esas capacidades requeririan la variante instruct).

## Casos de uso

- Completado de texto local en equipos Intel: el modelo genera continuaciones de prompt con un peso de solo 2.2 GB, por lo que cabe en un portatil con iGPU Arc y 16-30 GB de RAM, sin telemetria ni dependencia de la nube.
- Despliegue en servidores OpenVINO Model Server (OVMS): permite exponer un endpoint REST/gRPC de generacion sobre CPU o iGPU con configuracion de `NUM_STREAMS` y `PERFORMANCE_HINT: THROUGHPUT`.
- Base para *fine-tuning* o adaptacion posterior: al ser un checkpoint preentrenado en formato OpenVINO, sirve como punto de partida para tareas concretas (clasificacion, extraccion, generacion de dominio) antes de re-cuantizar.
- Investigacion en decodificacion especulativa: es un objetivo listo para DFlash, util para reproducir los datos de cruce de rendimiento entre drafter y objetivo publicados por el autor.
- Generacion asistida en entornos con GPU integrada: adecuado cuando no hay GPU dedicada disponible y se necesita un modelo de 4B con latencia aceptable en iGPU Arc 130V/140V.
- Prototipado de pipelines de generacion sobre Intel NPU/iGPU: permite validar integraciones con OpenVINO GenAI sin depender del modelo instruct y con un footprint de memoria minimo.

## Benchmarks y rendimiento

El autor publica una tabla de *throughput* medida en Intel Core Ultra 7 258V (iGPU Arc 130V/140V), 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificacion *greedy*, 128 tokens nuevos como maximo, media de 4 ejecuciones:

| Configuracion | tok/s | vs baseline |
|---|---|---|
| Este objetivo, sin drafter | 35.5 | 1.00x |
| Este objetivo + drafter DFlash | 24.9 | 0.70x |

La salida es *byte-identical* en ambos modos, lo que confirma que el emparejamiento funciona; sin embargo, el autor indica que la decodificacion especulativa no compensa en este hardware porque el objetivo ya es barato de ejecutar. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 2.2 GB de pesos para la build int4, mas la cache de KV y los *buffers* de inferencia; computo realista en torno a 3-4 GB.
- GPU/integrada recomendada: iGPU Intel Arc 130V/140V (donde el autor midio 35.5 tok/s), asi como CPU Intel modernas y NPU compatibles con OpenVINO.
- Cabe en GPU de consumo: si, en cualquier GPU con ~4 GB de VRAM libre (por ejemplo GTX 1650 4 GB, RTX 3050, RTX 4060) y en muchas iGPU Intel; no necesita modelos de datacenter.
- Opciones de despliegue: OpenVINO Model Server (OVMS), OpenVINO Runtime y OpenVINO GenAI, optimum-intel; no se distribuye en GGUF, por lo que no es directamente compatible con llama.cpp u Ollama.
- Latencia y *throughput*: 35.5 tok/s sin drafter en el hardware de referencia; la configuracion con drafter baja a 24.9 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| `blaj/Qwen3-4B-Base-int4-ov` (este) | 4B | OpenVINO IR, INT4 ASYM group-128 | Base, DFlash-ready | apache-2.0 | 2.2 GB, metadatos de estados ocultos para las 36 capas |
| `blaj/Qwen3-4B-Base-int8-ov` | 4B | OpenVINO IR, int8 | Base | apache-2.0 | Build hermana del mismo autor, mayor precision y mayor tamano |
| `OpenVINO/Qwen3-4B-int4-ov` | 4B | OpenVINO IR, INT4_SYM group-128 con AWQ | Instruct | apache-2.0 | Variante de chat; usa cuantizacion simetrica con AWQ y `scale_estimation` |
| `Qwen/Qwen3-4B-Base` | 4B | safetensors (fp16/bf16) | Base | apache-2.0 | Checkpoint original sin cuantizar, referencia de maxima precision |

La comparacion de rendimiento numerico entre estas variantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo *base*: no sigue instrucciones de chat ni prompts conversacionales; requiere *prompting* de tipo completado. Para uso instruct hay que recurrir a `Qwen/Qwen3-4B`.
- Los localizadores de estados ocultos solo resuelven contra este grafo exacto; cualquier modificacion de la conversion puede invalidarlos y degradar silenciosamente a decodificacion solo-objetivo.
- La decodificacion especulativa con el drafter DFlash resulto mas lenta que la decodificacion directa en el hardware probado (0.70x); conviene medir el cruce en cada plataforma antes de desplegarla.
- El *throughput* depende de los kernels del runtime, del hardware y de la distribucion de prompts; el dato de 35.5 tok/s es especifico del equipo de referencia.
- Riesgo de alucinacion y sesgos: propios de un modelo base sin alineacion; no hay evaluaciones de seguridad publicadas en la informacion disponible.
- Idioma: no se detalla la cobertura; el rendimiento fuera de los idiomas mejor representados en el preentrenamiento puede degradarse.
- Licencia apache-2.0, permisiva para uso comercial, pero sin garantias del autor de la conversion.
- No se distribuye en GGUF; no es usable directamente con llama.cpp, Ollama u otros runtimes fuera del ecosistema OpenVINO.
- Modelo con 0 descargas y 0 *likes* en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blaj/Qwen3-4B-Base-int4-ov
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B-Base
- Variante instruct de referencia: https://huggingface.co/Qwen/Qwen3-4B
- Build hermana en int8: https://huggingface.co/blaj/Qwen3-4B-Base-int8-ov
- Repositorio del drafter DFlash: https://huggingface.co/blaj/Qwen3-DFlash-drafters-ov
- Conversion oficial de Qwen3-4B a OpenVINO int4: https://huggingface.co/OpenVINO/Qwen3-4B-int4-ov
- Misma conversion en ModelScope: https://www.modelscope.cn/models/OpenVINO/Qwen3-4B-int4-ov
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Guia de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
