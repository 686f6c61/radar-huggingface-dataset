# kdkyum/two-hop-gpt-d768-nh12-adrop0.1-mdrop0.1-cos100k-swap

## Resumen

El modelo `kdkyum/two-hop-gpt-d768-nh12-adrop0.1-mdrop0.1-cos100k-swap` es un artefacto de investigacion publicado por el usuario kdkyum en HuggingFace. No es un modelo de lenguaje de proposito general, sino una familia de nueve ejecuciones de entrenamiento de un transformer tipo GPT-NeoX de 768 dimensiones, 12 cabezas de atencion de 64 dimensiones y 12 capas, con unos 85,2 millones de parametros en los bloques transformer. Todas las ejecuciones se entrenan desde cero sobre un unico dataset sintetico de grafos heterogeneos (`c5_m16_N90/hetero_graphs_swap_6to1split1`, con 16 nombres de pila y 90 familias) y se evaluan con una metrica unica: la precision de razonamiento de dos saltos (two-hop) sobre datos retenidos.

El objetivo del proyecto es estudiar generalizacion composicional y el efecto de hiperparametros concretos en una tarea controlada. Las nueve ejecuciones cruzan tres valores de weight decay (1, 3 y 5) con tres semillas (41, 42 y 43), manteniendo fijos dropout de atencion y de MLP en 0,1 y un schedule cosenoidal de 100.000 pasos. Los resultados publicados muestran precisiones de dos saltos de entre 0,877 y 0,991 segun la configuracion, con la mejor ejecucion (weight decay 5, semilla 43) alcanzando 0,9907 en el paso 77.500.

Es relevante ahora porque sirve como banco de pruebas reproducible y de bajo coste computacional para estudiar como el weight decay, el dropout y la semilla afectan al razonamiento multi-paso en un regimen de datos totalmente sintetico. El repositorio ocupa 21,5 GB porque incluye multiples checkpoints por ejecucion, no porque el modelo sea grande: cada checkpoint ronda los cientos de megabytes y cabe holgadamente en cualquier GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-NeoX (`GPTNeoXForCausalLM`), LayerNorm, atencion con rotary embeddings base 100.000, inicializacion neox con std 0,02 |
| Parametros totales | 85,2 M en los bloques transformer (12 capas); el total con embeddings y cabeza de salida no esta disponible porque depende del tamano del vocabulario |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.149 tokens (longitud de las filas de documento completo usadas en entrenamiento); el valor de `max_position_embeddings` en `config.json` no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible (el autor no publica versiones GGUF, GPTQ, AWQ ni cuantizadas; solo pesos en safetensors) |
| Idiomas soportados | no disponible; el modelo se entrena sobre datos sinteticos generados (16 nombres de pila y 90 familias), no sobre lengua natural |
| Licencia | MIT |
| Formato de pesos | safetensors, cargables con `GPTNeoXForCausalLM.from_pretrained`; cada carpeta de ejecucion incluye `ckpt_<step>/` (cada 10.000 pasos), `config.json` (argumentos de entrenamiento), `vocab.json` y `log.jsonl` (registro de entrenamiento y evaluacion) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con normalizacion LayerNorm, 12 capas, `d_model` de 768, 12 cabezas de atencion de 64 dimensiones cada una, sesgos lineales en las proyecciones y una MLP con activacion ReLU. La atencion usa rotary embeddings aplicados a todas las dimensiones de cabeza con base 100.000. La inicializacion sigue el esquema neox con desviacion tipica de 0,02. No hay mezcla de expertos, atencion lineal ni decodificacion especulativa: es una arquitectura de referencia, sin innovaciones de eficiencia.

El entrenamiento se realiza con AdamW (beta2 0,95, eps 1e-8), learning rate de 3e-4 con 500 pasos de warmup y decaimiento cosenoidal hasta cero en 100.000 pasos, clipping de gradiente con norma 1 y weight decay aplicado unicamente a matrices de pesos y embeddings. Los datos son documentos sinteticos completos de 2.149 tokens generados a partir del dataset `hetero_graphs_swap_6to1split1`; cada documento empieza con `<bos>` y cada punto se escribe como un token `<bos>` adicional, con un token `<pad>` separado. La perdida se calcula sobre todos los tokens. Se aplica dropout de 0,1 en los pesos de atencion y 0,1 sobre la salida ReLU de cada MLP (`mlp_dropout`, implementado mediante `Sequential(ReLU, Dropout)`); no hay dropout en las capas ocultas. El `mlp_dropout` es un atributo extra de configuracion que `from_pretrained` ignora, lo cual no altera el comportamiento en modo evaluacion. No se documenta RLHF, DPO ni ajuste por instrucciones de ningun tipo. La evaluacion se ejecuta cada 250 pasos, por lo que el mejor paso suele caer entre checkpoints guardados (que se escriben cada 10.000 pasos).

## Capacidades

- Razonamiento de dos saltos sobre grafos heterogeneos sinteticos: dado un documento generado, el modelo resuelve consultas que requieren encadenar dos relaciones (`two-hop accuracy`).
- Modelado de lenguaje autorregresivo restringido al vocabulario y la distribucion del dataset sintetico de nombres y familias.
- Reproduccion de experimentos de ablation: las nueve ejecuciones permiten comparar weight decay (1, 3, 5) y semilla (41, 42, 43) bajo un protocolo identico.
- Inspeccion de trayectorias de entrenamiento: cada ejecucion incluye `log.jsonl` con registros de entrenamiento y evaluacion, lo que permite analizar curvas de aprendizaje paso a paso.
- Generacion de texto: unicamente dentro del dominio sintetico; no se documenta capacidad de generar lenguaje natural util.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el unico razonamiento multi-paso documentado es la tarea two-hop sintetica.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion en generalizacion composicional: el modelo y sus nueve ejecuciones permiten medir como varia la precision two-hop al cambiar weight decay y semilla, con una metrica objetiva y un dataset fijo, algo dificil de aislar en modelos entrenados con datos web.
- Estudios de ablacion controlada de regularizacion: al fijar dropout de atencion y MLP en 0,1 y variar solo el weight decay, sirve como sujeto de prueba para analizar la interaccion entre regularizacion y capacidad de generalizar en tareas de dos saltos.
- Interpretabilidad mecanicista en modelos pequenos: con 85,2 M de parametros y 12 capas, es viable aplicar tecnicas de analisis de circuitos, probing de activaciones o analisis de cabezas de atencion sin clústeres multi-GPU.
- Reproducibilidad de pipelines de entrenamiento: el `config.json` con los argumentos de entrenamiento, el `vocab.json` y los logs permiten reconstruir el experimento completo y auditar la metodologia de `train.py`.
- Docencia y formacion: sirve para ilustrar, en un caso real y de bajo coste, el ciclo completo de entrenamiento desde cero (tokenizacion, schedule cosenoidal, warmup, gradient clipping, checkpoints periodicos y evaluacion intermedia).
- Linea base sintetica para comparar arquitecturas: cualquier variante nueva (otra normalizacion, otra inicializacion, MoE) puede evaluarse contra estos nueve resultados para la misma tarea two-hop y el mismo dataset.
- Analisis de sensibilidad a la semilla: la dispersion observada entre semillas con el mismo weight decay (por ejemplo, 0,9392 frente a 0,8772 con weight decay 1) permite estudiar varianza de entrenamiento y disenar protocolos con mas replicas.
- Evaluacion de estrategias de checkpointing: dado que la evaluacion corre cada 250 pasos y el guardado cada 10.000, el repositorio es util para estudiar la perdida de informacion asociada a la frecuencia de guardado.

## Benchmarks y rendimiento

Los unicos datos publicados son la precision de dos saltos sobre datos retenidos, tal como aparecen en la model card (fecha de corte 2026-10-15 00:44 CEST). Evaluacion cada 250 pasos.

| Weight decay | Semilla | Pasos entrenados | Maxima precision two-hop (paso) | Primer paso >= 0,99 | Ultima precision two-hop | Ultimo checkpoint |
|---|---|---|---|---|---|---|
| 1 | 41 | 79.470 | 0,9383 (76.250) | - | 0,9269 | 70.000 |
| 1 | 42 | 78.350 | 0,9392 (76.750) | - | 0,9364 | 70.000 |
| 1 | 43 | 79.140 | 0,8772 (77.750) | - | 0,8769 | 70.000 |
| 3 | 41 | 78.650 | 0,9401 (77.750) | - | 0,9315 | 70.000 |
| 3 | 42 | 79.120 | 0,9386 (69.500) | - | 0,9235 | 70.000 |
| 3 | 43 | 79.540 | 0,9651 (79.250) | - | 0,9648 | 70.000 |
| 5 | 41 | 78.040 | 0,9753 (77.250) | - | 0,9728 | 70.000 |
| 5 | 42 | 78.400 | 0,9719 (77.500) | - | 0,9679 | 70.000 |
| 5 | 43 | 79.360 | 0,9907 (77.500) | 77.500 | 0,9877 | 70.000 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible. Las ejecuciones que no han alcanzado los 100.000 pasos siguen entrenando y sus checkpoints se anaden conforme se escriben.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos de los bloques transformer ocupan aproximadamente 340 MB; en fp16 o bf16, unos 170 MB; en int8, unos 85 MB; en 4 bits, unos 45 MB. El total exacto depende del tamano del vocabulario, no disponible.
- GPU recomendadas: cualquier GPU moderna es suficiente. Una RTX 4090, A100 o H100 queda enormemente sobredimensionada; una GTX 1050 Ti de 4 GB, una RTX 3060 o incluso una GTX 1650 bastan para inferencia.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y tambien en CPU (la inferencia en fp32 en CPU es viable por el reducido numero de parametros).
- Opciones de despliegue: el autor solo documenta la carga mediante `transformers` con `GPTNeoXForCausalLM.from_pretrained`. No se documenta soporte verificado para vLLM, TGI, llama.cpp u Ollama, y el vocabulario sintetico propio complica su conversion a GGUF sin trabajo adicional.
- Latencia y throughput estimados: no disponibles.
- Nota de almacenamiento: el repositorio completo ocupa 21,5 GB porque agrupa nueve ejecuciones con varios checkpoints cada una. Conviene descargar solo la carpeta de la ejecucion y el checkpoint deseados mediante filtros de patrones del Hub.

## Comparativa con modelos similares

La comparacion directa es limitada: los modelos de la tabla son asistentes de lenguaje de proposito general, mientras que este es un artefacto de investigacion entrenado sobre una tarea sintetica. No existen resultados comparables de two-hop accuracy para los modelos alternativos.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Uso previsto | Rendimiento en esta tarea |
|---|---|---|---|---|---|---|
| two-hop-gpt-d768-nh12 (este modelo) | 85,2 M en bloques | 2.149 tokens | GPT-NeoX denso, 12 capas | MIT | Investigacion en razonamiento two-hop sintetico | 0,877-0,991 de precision two-hop segun ejecucion |
| EleutherAI/pythia-70m-deduped | 70 M | 2.048 tokens | GPT-NeoX denso | Apache 2.0 | Modelo base de lenguaje general | no disponible |
| GPT-2 small | 124 M | 1.024 tokens | Transformer decoder-only | MIT modificada | Modelo base de lenguaje general | no disponible |
| EleutherAI/gpt-neo-125M | 125 M | 2.048 tokens | GPT-Neo (transformer denso) | MIT | Modelo base de lenguaje general | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable en produccion: solo maneja el vocabulario y la distribucion del dataset sintetico `hetero_graphs_swap_6to1split1` (16 nombres de pila y 90 familias). Cualquier uso fuera de ese dominio carece de sentido.
- No ha pasado por ajuste por instrucciones, RLHF ni DPO. No existe plantilla de chat, formato de sistema ni soporte de herramientas.
- Riesgo de alucinacion: en el sentido clasico (afirmaciones falsas sobre el mundo) no aplica, pero el modelo puede generar secuencias sintacticamente validas e incorrectas respecto a las relaciones del grafo, que es justamente lo que mide la metrica two-hop.
- Sesgos conocidos: no evaluados ni documentados. Al entrenarse con datos generados a partir de listas concretas de nombres y familias, hereda las limitaciones y posibles sesgos de esas listas.
- Limitacion de contexto: la ventana practica es la longitud de documento de 2.149 tokens; no se documenta soporte para secuencias mas largas ni extrapolacion posicional.
- Limitacion de idioma: no se documenta ningun idioma natural soportado. No se puede asumir castellano, ingles ni ningun otro.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y de licencia. No obstante, la utilidad comercial real del modelo es practicamente nula por su dominio restringido.
- Caveat tecnico: `mlp_dropout` es un atributo de configuracion que `from_pretrained` no aplica; esto no altera la evaluacion, pero si se reanuda el entrenamiento con carga estandar, el dropout de MLP no se activara.
- Caveat de evaluacion: la evaluacion corre cada 250 pasos y los checkpoints se guardan cada 10.000, por lo que la mejor precision reportada suele corresponder a un paso intermedio y no al checkpoint disponible.
- Caveat de resultados: las cifras de la tabla las publica el propio autor, sin validacion externa, y corresponden a una unica tarea sintetica. No deben extrapolarse a capacidades generales de razonamiento.
- Varias ejecuciones siguen entrenando en la fecha de publicacion, por lo que las cifras pueden variar con el tiempo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kdkyum/two-hop-gpt-d768-nh12-adrop0.1-mdrop0.1-cos100k-swap
- Perfil del autor: https://huggingface.co/kdkyum
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante. Las unicas coincidencias devueltas son hilos del foro chino Zhihu sobre como preparar presentaciones orales, sin relacion alguna con este modelo, con razonamiento two-hop o con GPT-NeoX. No se dispone de paper, blog, repositorio de codigo ni demo asociados al modelo.
