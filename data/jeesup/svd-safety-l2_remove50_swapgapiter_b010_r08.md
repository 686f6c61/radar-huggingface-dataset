# Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r08

## Resumen

`Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r08` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. El autor le aplicó una compresión SVD-LLM que elimina el 50,01 % de los parámetros de las matrices de proyección y, a continuación, un procedimiento de reparación denominado "swap" iterativo neutro en parámetros, guiado por la regla de selección `gap_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos repartido en 10 rondas del 0,100 % cada una. Este checkpoint concreto corresponde a la ronda 8 de 10.

El interés del modelo no es su rendimiento como asistente, sino que forma parte de un estudio sistemático sobre cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El propio autor advierte que varias ramas de su rejilla experimental están "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat, y que cada celda debe tratarse como un sujeto experimental, no como un asistente desplegable.

Se trata, por tanto, de un artefacto de interpretabilidad y seguridad con 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin validación externa conocida y con métricas de seguridad publicadas (AdvBench ASR 0,1500; StrongREJECT ASR 0,1900; sobre-rechazo macro 0,1397) que confirman un comportamiento imperfecto desde el punto de vista de la alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 2 (heredada del modelo base), con pesos recomprimidos mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (recuento real de los safetensors del repositorio) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat; no se documenta ampliacion en este checkpoint) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica safetensors; no hay GGUF, AWQ, GPTQ ni variantes de 8 o 4 bits |
| Idiomas soportados | No disponible en la model card; el modelo base Llama 2 esta optimizado principalmente para ingles |
| Licencia | Llama 2 Community License (incluye `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda, 10 rondas previstas, 8 aplicadas) |
| Componentes restaurados / sustituidos | 5.510 restaurados y 5.510 sustituidos |
| Parametros intercambiados | 51.780.352 (0,80 % de los parametros de proyeccion densos) |
| Fraccion de parametros resultante | 0,4999 |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm previa, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion causal estandar. El autor no ha reentrenado el modelo desde cero ni documenta un ajuste fino adicional con RLHF o DPO; la intervencion es puramente post-hoc sobre los pesos: primero una descomposicion en valores singulares (SVD-LLM) que recorta el rango de las matrices de proyeccion hasta eliminar el 50,01 % de los parametros densos, y despues un proceso iterativo de sustitucion de componentes.

El mecanismo de reparacion ("parameter-neutral swap") sustituye 5.510 componentes por otros tantos de forma que el presupuesto de parametros se mantiene neutro, con una politica de valor `insert` (solo valor de insercion) y desalojo ordenado por sigma. La regla `gap_iter` determina que componentes se seleccionan en cada ronda; cada ronda consume un 0,100 % del presupuesto de parametros densos y el total previsto es del 1,0 %. El checkpoint publicado corresponde a la ronda 8, es decir, un punto intermedio de una ejecucion mas larga, con semilla 42. Se han intercambiado 51.780.352 parametros (0,80 % de los parametros de proyeccion densos).

Un detalle relevante para quien vaya a inspeccionar los ficheros: el recuento de parametros de los safetensors coincide exactamente con el de Llama-2-7b-chat (6.738.415.616), y el repositorio ocupa 13,5 GB, coherente con pesos densos en precision de 16 bits. Por tanto, el "50 % de parametros eliminados" debe interpretarse como el presupuesto de rangos de la metodologia SVD-LLM y no como una reduccion del recuento total almacenado. La informacion disponible no ofrece una explicacion adicional de este punto.

## Capacidades

- Generacion de texto conversacional en el formato de chat de Llama 2, heredada del modelo base.
- Razonamiento de un solo turno y multiturno dentro de la ventana de 4.096 tokens, con la degradacion propia de una compresion del 50 % del presupuesto de proyeccion.
- Objeto de estudio de seguridad: permite medir tasas de exito de ataque (ASR) y tasas de sobre-rechazo bajo compresion y reparacion parcial.
- Seleccion de componentes: la regla `gap_iter` con valor `insert` y desalojo ordenado por sigma es una capacidad del procedimiento, no del modelo, pero el checkpoint es el material con el que se evalua.
- No hay soporte documentado de tool calling, function calling ni uso como agente.
- No hay capacidades multimodales (vision, audio) ni modo "thinking" explicito.
- No hay datos publicados sobre comportamiento multilingue especifico de este checkpoint.
- No se documentan capacidades especiales adicionales (decodificacion especulativa, atencion lineal, memoria extendida).

## Casos de uso

- Investigacion sobre seguridad y compresion: cuantificar cuanto degrada la compresion SVD-LLM el comportamiento de rechazo de un modelo alineado, usando este checkpoint como una de las celdas del diseno experimental y comparandola con el modelo base sin comprimir.
- Evaluacion de reglas de seleccion de componentes: comparar `gap_iter` frente a otras reglas del estudio manteniendo constante el presupuesto de restauracion (1,0 % repartido en rondas de 0,1 %), para aislar el efecto de la regla.
- Auditoria con jueces automaticos: reproducir las mediciones publicadas con el juez de HarmBench sobre AdvBench y StrongREJECT, y con WildGuard para el sobre-rechazo macro, verificando si los valores 0,1500, 0,1900 y 0,1397 se replican con la misma semilla y prompt set.
- Analisis de la curva dosis-respuesta: al ser un checkpoint de la ronda 8 de 10, permite trazar la evolucion de las metricas de seguridad ronda a ronda y estimar el punto de saturacion del presupuesto de reparacion.
- Interpretabilidad de matrices de proyeccion: estudiar que componentes concretos (5.510 de un total relevante) concentran el comportamiento de rechazo, comparando su identificacion por la regla `gap_iter` con analisis de direcciones de rechazo.
- Reproducibilidad metodologica: servir como referencia fija (semilla 42, fraccion 0,4999, ronda 8) para que otros grupos repliquen el pipeline de compresion y reparacion sobre Llama 2 y sobre otros modelos.
- Estudio del equilibrio seguridad-utilidad: medir conjuntamente ASR y sobre-rechazo para documentar si la reparacion recupera rechazo sin incrementar los rechazos a peticiones benignas.
- Analisis de artefactos derivados de pesos recomprimidos: inspeccionar propiedades numericas (espectro singular, normas de fila) de los tensores intercambiados para entender por que la compresion desplaza el comportamiento de seguridad.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Juez / metodo |
|---|---|---|---|
| AdvBench | Tasa de exito de ataque (ASR) | 0,1500 | Juez de HarmBench |
| StrongREJECT | Tasa de exito de ataque (ASR) | 0,1900 | Juez de HarmBench |
| WildGuard | Sobre-rechazo macro | 0,1397 | WildGuard |

No se han publicado resultados de benchmarks de utilidad (MMLU, GSM8K, HumanEval, MT-Bench ni similares) en la informacion disponible. Tampoco se ofrecen valores de referencia del modelo base medidos por el autor en la misma configuracion, por lo que no es posible calcular la delta exacta atribuible a la compresion y al swap con los datos disponibles.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 13,5 GB solo para pesos, mas entre 1 y 3 GB de estados de atencion y caché KV segun longitud de secuencia y tamano de lote; en la practica, del orden de 15 a 17 GB con lotes pequenos y contexto de 4.096 tokens.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 7 a 8 GB (requiere cuantizacion en carga, ya que no se publican pesos pre-cuantizados).
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 4 a 5 GB (misma advertencia).
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB para despliegue en BF16 sin cuantizar con lotes amplios.
- GPU de consumo: cabe sin cuantizar en RTX 3090, RTX 4090 y RTX A6000 (24 GB o mas). En RTX 4080/4070 Ti (16 GB) la carga en bf16 queda al limite y obliga a cuantizar o a reducir drasticamente el lote. En GPUs de 8 a 12 GB solo es viable mediante cuantizacion.
- Opciones de despliegue: `transformers` (formato nativo del repositorio), Text Generation Inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`). El uso con vLLM no esta confirmado en la informacion disponible. llama.cpp u Ollama requeririan convertir los safetensors a GGUF, conversion que no se distribuye.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Metricas de seguridad |
|---|---|---|---|---|---|
| Este checkpoint (SVD-LLM 50 % + swap `gap_iter`, ronda 8) | 6.738.415.616 (recuento safetensors) | 4.096 | Llama 2 Community | HuggingFace, 0 descargas, 0 likes | AdvBench ASR 0,1500; StrongREJECT ASR 0,1900; sobre-rechazo 0,1397 |
| meta-llama/Llama-2-7b-chat-hf (modelo base) | 6.738.415.616 | 4.096 | Llama 2 Community | HuggingFace | No disponible en la informacion proporcionada; el autor lo usa como referencia de partida |
| Otras celdas de la rejilla del mismo autor (otras reglas y presupuestos) | No disponible | 4.096 (heredado) | Llama 2 Community | HuggingFace | No disponible |
| Mistral-7B-Instruct-v0.3 (alternativa de tamano y categoria comparable) | Aproximadamente 7.250 millones | 32.768 | Apache-2.0 | HuggingFace | No disponible |

Nota: los datos de Mistral-7B-Instruct-v0.3 proceden de conocimiento general del modelo y no de la informacion proporcionada en esta busqueda; se incluyen unicamente como referencia de categoria y deben verificarse en su model card oficial. No se han encontrado en la busqueda web otros checkpoints comprimidos con metricas de seguridad publicadas que permitan una comparacion directa.

## Limitaciones y advertencias

- El propio autor declara que varias ramas de su rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que este checkpoint no es un asistente de proposito general. No debe desplegarse en produccion.
- Las metricas medidas confirman el problema: un ASR de 0,15 en AdvBench y de 0,19 en StrongREJECT indica que una fraccion relevante de ataques tiene exito, frente al comportamiento esperado de un modelo alineado.
- El sobre-rechazo macro de 0,1397 implica que aproximadamente un 14 % de las peticiones benignas reciben un rechazo, lo que degrada la utilidad incluso en escenarios legitimos.
- No se publican benchmarks de utilidad ni evaluaciones humanas, por lo que se desconoce el alcance real del dano en razonamiento, codigo o conocimiento.
- La compresion SVD-LLM al 50,01 % del presupuesto de parametros densos puede haber degradado otras capacidades ademas de la seguridad, sin que existan mediciones que lo cuantifiquen.
- No hay informacion sobre sesgos demograficos, toxicidad ni comportamiento en idiomas distintos del ingles.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; no debe asumirse que se mantiene en los niveles del modelo base tras la recompresion.
- El checkpoint corresponde a una ronda intermedia (8 de 10) de una ejecucion mas larga, por lo que no representa el punto final del procedimiento ni el mejor resultado del estudio.
- Licencia: Llama 2 Community License, con las restricciones de uso comercial que impone (incluido el umbral de 700 millones de usuarios mensuales y las clausulas de uso aceptable de `USE_POLICY.md`). Cualquier uso derivado queda vinculado a esos terminos.
- Trazabilidad: 0 descargas y 0 "likes"; no hay validacion independiente ni terceros que hayan reproducido las metricas publicadas.
- El recuento de parametros del repositorio coincide con el del modelo base, por lo que quien espere un fichero fisicamente mas pequeno que Llama-2-7b-chat encontrara un peso de 13,5 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove50_swapgapiter_b010_r08
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia incluida en el repositorio: `LICENSE.txt` (Llama 2 Community License)
- Politica de uso incluida en el repositorio: `USE_POLICY.md`
- No se han encontrado enlaces relevantes (papers, blogs, repositorios de codigo o demos) en la busqueda web realizada; los resultados devueltos correspondian a servicios de traduccion y no guardaban relacion con el modelo.
