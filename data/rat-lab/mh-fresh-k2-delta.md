# rat-lab/mh-fresh-K2-delta

## Resumen

mh-fresh-K2-delta es un conjunto de adaptadores LoRA entrenados por rat-lab (Max Horwitz, cluster UW Hyak, trabajo SLURM 40455922) sobre el modelo base vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT, una versión de Gemma 2 2B Instruct afinada con SFT sobre Alpaca limpio. No es un modelo completo ni un asistente listo para producción: es el artefacto experimental de una celda concreta (K=2, variante "delta") de una tabla de barrido sobre cobertura y corrección de sesgo en optimización de preferencias.

El entrenamiento usa el algoritmo online IPO (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`) con riesgo entrópico tau = 10, corrección de sesgo two-timescale con estimador de método delta y tamaño de paso TT gamma = 0,1. La particularidad declarada en la model card es que estos adaptadores se inicializan desde cero (LoRA a cero sobre la base SFT, 1000 pasos de warmup, sin `--init_adapter` ni `--load_dir`), a diferencia de la tabla anterior `mh-ec2-ttomd-*`, cuyas celdas K=2 y K=4 eran ramas del checkpoint 936 del run K=8 y por tanto no eran brazos independientes. Esto convierte a este adaptador en material de replicación limpia para estudiar el efecto de la cobertura con K=2.

El entrenamiento está en curso: se han subido 7 checkpoints (pasos 468 a 3276, cada 468 pasos) de un total previsto de 4680, sobre el dataset PKU-Alignment/PKU-SafeRLHF, con semilla 42 y 64 tokens nuevos como máximo en generación. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2 2B) + adaptadores LoRA (PEFT) |
| Parametros totales | ~2,6 B en el modelo base Gemma 2 2B; numero de parametros del adaptador LoRA no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Gemma 2 2B documenta 8192 tokens |
| Tipos de cuantizacion | No disponible; al ser LoRA, requiere fusionar con la base y cuantizar externamente (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponible; Gemma 2 esta entrenado para multiples idiomas, pero la model card no especifica ninguno |
| Licencia | No disponible; hereda las condiciones del modelo base Gemma 2 (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptadores LoRA por checkpoint con `adapter_config`/`adapter_model`), mas ficheros de tokenizer |
| Libreria | peft (compatible con transformers) |
| Tamano del repo | 0,7 GB (7 checkpoints) |
| Modelo base | vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT |
| Dataset de preferencias | PKU-Alignment/PKU-SafeRLHF |
| Checkpoints incluidos | 7 (pasos 468, 936, 1404, 1872, 2340, 2808, 3276) |
| Estado del entrenamiento | En curso (3276 de 4680 pasos en el momento de la publicacion) |
| Semilla | 42 |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 2 2B Instruct, un transformer decoder-only de aproximadamente 2,6 B de parametros, que en este caso ha pasado por un SFT adicional sobre Alpaca limpio (checkpoint `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`). Sobre esa base se entrena un adaptador LoRA de rango no especificado en la model card, inicializado a cero. El entrenamiento sigue un esquema de optimizacion de preferencias online: el algoritmo etiquetado como `oipo1` (online IPO) reside en el modulo `risk_egpo/tt_omd.py`, y el run configura cobertura K = 2 (`--ypp_samples 2`, es decir, dos muestras por prompt), riesgo entropico con tau = 10, correccion de sesgo two-timescale mediante estimador de metodo delta, y tamano de paso TT gamma = 0,1. La generacion durante el entrenamiento se limita a 64 tokens nuevos.

Los datos de preferencia proceden de PKU-SafeRLHF, un dataset orientado a seguridad y dano, lo que sitúa el objetivo del run en el cruce entre alineamiento por preferencias y comportamiento seguro. No se documentan en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla de este procedimiento de optimizacion de preferencias online. La innovacion metodologica declarada no es arquitectonica sino algorítmica: la inicializacion desde cero (sin warm start) y el control explicito de cobertura y de aversion al riesgo, junto con un mecanismo de debiasing two-timescale. El repositorio incluye `training_dynamics.csv` con métricas por paso de log (loss, grad_norm L2 pre-clip, KL, rewards/accuracies y rewards/margins), lo que permite auditar la dinamica del entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles (idioma del dataset de preferencias); el soporte multilingue real no esta documentado.
- Optimizacion de preferencias orientada a seguridad: el adaptador se entrena sobre PKU-SafeRLHF, por lo que su comportamiento esperado es el de un modelo pequeno con sesgo hacia respuestas consideradas seguras.
- Razonamiento basico y respuesta a instrucciones heredados de Gemma 2 2B Instruct y del SFT sobre Alpaca limpio.
- Generacion de codigo y matematicas a nivel de modelo de 2,6 B: capacidad presente por herencia del base, sin evaluacion publicada para este adaptador.
- Tool calling / function calling: no documentado en la model card; depende del soporte del modelo base y no se ha validado sobre el adaptador.
- Uso en agentes y razonamiento multi-paso: no documentado; la ventana de contexto efectiva y la estabilidad en cadenas largas no se han evaluado.
- Capacidades especiales: no se declara modo de razonamiento extendido, vision ni audio.
- Reanudacion de entrenamiento: los checkpoints son adaptadores PEFT cargables, lo que permite continuar el run o evaluar estados intermedios.

## Casos de uso

- Replicacion de experimentos de optimizacion de preferencias: el adaptador permite reproducir la celda K=2 con riesgo entropico tau = 10 y compararla con las celdas K=4 y K=8 de la misma tabla, partiendo de una base SFT identica y con semilla 42.
- Estudio de correccion de sesgo two-timescale: al incluir `training_dynamics.csv` con KL, margenes y accuracy de recompensas por paso, sirve para analizar si el estimador de metodo delta estabiliza el entrenamiento online.
- Investigacion de alineamiento de seguridad: entrenado sobre PKU-SafeRLHF, es util para medir como un modelo de 2,6 B desplaza su tasa de respuestas inseguras tras optimizacion de preferencias con aversion al riesgo.
- Ablacion de inicializacion: comparar este run "from scratch" (LoRA a cero, 1000 pasos de warmup) contra los runs warm-started de `mh-ec2-ttomd-*` para cuantificar el sesgo introducido por arrancar desde un checkpoint de K=8.
- Auditoria de dinamica de entrenamiento: los 7 checkpoints intermedios permiten trazar la evolucion de la politica a lo largo de los pasos 468-3276 y detectar sobreoptimizacion o colapso de la diversidad.
- Pruebas de red-teaming a pequena escala: al ser un modelo compacto alineado con datos de seguridad, es un banco de pruebas barato para evaluar robustez frente a jailbreaks antes de escalar a modelos mayores.
- Validacion de pipelines PEFT: sirve como caso de prueba para flujos de carga con `PeftModel.from_pretrained` con subcarpetas por checkpoint, fusion de adaptadores y conversion a GGUF para despliegue local.
- Comparacion de infraestructura de despliegue: al ser un adaptador pequeno sobre una base de 2,6 B, permite medir latencia y throughput de vLLM o TGI con LoRA habilitado en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MT-Bench ni métricas de seguridad (por ejemplo, tasas de respuesta insegura sobre PKU-SafeRLHF). El unico material cuantitativo disponible es `training_dynamics.csv`, que reporta por paso de log: loss, grad_norm (L2, pre-clip), KL, rewards/accuracies y rewards/margins. No se dispone de esos valores en la informacion proporcionada.

## Requisitos de hardware

- Inferencia con la base en bf16/fp16: aproximadamente 5,2 GB de VRAM solo para los pesos de Gemma 2 2B, mas overhead de activaciones y cache KV (estimacion a partir del tamano del base, no confirmada por el autor). El adaptador LoRA anade decenas de MB.
- Cuantizacion a 4 bits (Q4_K_M o AWQ/GPTQ): aproximadamente 1,6-2 GB de pesos, lo que permite ejecucion en GPUs consumer de 6-8 GB, siempre que se fusione el adaptador con la base antes de convertir.
- GPUs recomendadas para investigacion y evaluacion: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A10G, L4 o A100 40/80 GB si se evaluan varias semillas o checkpoints en paralelo.
- Caben en GPU consumer: si, con la base cuantizada en 4 bits o en bf16 en GPUs de 8-12 GB o superiores. El adaptador por si solo (0,7 GB de repo con 7 checkpoints) cabe en cualquier equipo.
- Opciones de despliegue: transformers + peft (ruta oficial documentada en la model card), vLLM con `--enable-lora`, TGI con adaptadores LoRA, y llama.cpp/Ollama previa fusion y conversion a GGUF. No hay scripts de despliegue publicados por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| rat-lab/mh-fresh-K2-delta | ~2,6 B (base) + LoRA | No disponible (base Gemma 2: 8192) | Adaptador LoRA de preferencias | No disponible (hereda Gemma) | No disponible |
| vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT | ~2,6 B | No disponible (base Gemma 2: 8192) | Modelo completo con SFT | No disponible | No disponible |
| google/gemma-2-2b-it | ~2,6 B | 8192 | Modelo instruct completo | Gemma Terms of Use | Publicados por Google |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5 B | 32768 | Modelo instruct completo | Apache 2.0 | Publicados por Alibaba |

La comparacion es estructural: este repositorio no es un modelo autonomo sino un adaptador que requiere cargar la base por separado, no declara licencia propia y no publica ninguna evaluacion de calidad. Frente a un modelo instruct completo como Gemma 2 2B IT o Qwen2.5-1.5B-Instruct, su interes es metodologico (trazabilidad del run de optimizacion de preferencias), no competitivo en rendimiento.

## Limitaciones y advertencias

- Entrenamiento incompleto: solo estan disponibles los checkpoints hasta el paso 3276 de 4680; los estados finales pueden cambiar el comportamiento de forma apreciable.
- Sin evaluacion: no hay benchmarks, evaluaciones de seguridad ni validacion humana publicadas, por lo que el rendimiento real es desconocido.
- Licencia no especificada: el repositorio no declara licencia propia y el modelo base es Gemma 2, sujeto a los Gemma Terms of Use; el uso comercial queda condicionado por esos terminos y debe verificarse antes de cualquier despliegue.
- No es un modelo autonomo: es un adaptador PEFT; requiere descargar la base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` (mismo origen y mismas condiciones) y cargarla con `PeftModel.from_pretrained`.
- Riesgo de alucinacion: elevado en un modelo de 2,6 B, especialmente en dominios factuales, y no mitigado por el procedimiento de optimizacion de preferencias.
- Sesgos: el dataset PKU-SafeRLHF define un criterio de "seguridad" y "dano" concreto; el adaptador puede heredar y amplificar esos criterios, incluyendo sobre-rechazo de peticiones legitimas.
- Idioma: el entrenamiento de preferencias se realiza sobre un dataset predominantemente en ingles; el comportamiento en castellano no esta documentado ni validado.
- Contexto y generacion: la model card fija 64 tokens nuevos como maximo durante la generacion de entrenamiento, lo que no garantiza buen comportamiento en respuestas largas.
- Reproducibilidad: la trazabilidad depende del codigo `risk_egpo/tt_omd.py` y del script de lanzamiento, que no se enlazan en la ficha; sin ellos, la replicacion exacta no es posible.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion asociada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-fresh-K2-delta
- Modelo base en HuggingFace: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Libreria PEFT: https://huggingface.co/docs/peft
- Gemma 2 (familia base): https://huggingface.co/google/gemma-2-2b-it
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo. Las busquedas devolvieron exclusivamente paginas sobre el animal "rata" (Wikipedia, articulos divulgativos, guias de desratizacion), sin relacion con el repositorio. No se han localizado papers, blogs, repos ni demos asociados a este adaptador.
