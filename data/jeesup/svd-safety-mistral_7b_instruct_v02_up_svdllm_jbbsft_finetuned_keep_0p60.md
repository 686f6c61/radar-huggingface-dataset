# Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_jbbsft_finetuned_keep_0p60

## Resumen

Este repositorio contiene una versión comprimida de `mistralai/Mistral-7B-Instruct-v0.2` mediante el método completo SVD-LLM, aplicado con el código de los autores originales (repositorio AIoT-MLSys-Lab/SVD-LLM, commit `7538cca98880`). Se trata de un modelo denso de 7.241.732.096 parámetros en el que se ha eliminado el 40 % de los parámetros (fracción retenida real de 0,5998), no de un modelo con menos pesos en disco: los factores de bajo rango se han replegado a formas densas de Mistral (`W = U @ V`), de modo que el checkpoint es rango-deficiente pero ocupa el mismo espacio y se carga con `transformers` estándar sin código de modelado personalizado.

La particularidad de esta variante es que la fase de recuperación (fine-tuning con LoRA) no se hizo solo sobre `yahma/alpaca-cleaned`, sino que se añadieron 960 filas de rechazo (96 comportamientos dañinos de JailbreakBench replicados 10 veces, el 1,82 % del conjunto de recuperación), con las respuestas objetivo tomadas de los rechazos greedy de `meta-llama/Llama-2-7b-chat-hf`. El autor etiqueta esta rama como `recovery_mix` y su objetivo es comprobar si los datos de seguridad en esa etapa preservan la capacidad de rechazo tras la compresión.

Es relevante ahora porque cuantifica el compromiso entre compresión por SVD y alineación de seguridad, un eje poco documentado en el ecosistema abierto: publica ASR en AdvBench y StrongREJECT junto con tasas de sobrerrechazo en XSTest-safe y OR-Bench-Hard-1K, además de métricas de utilidad (perplejidad en WikiText-2, ARC, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA). La model card advierte explícitamente de que la compresión a este ratio puede degradar la calidad de generación y de que las cifras de seguridad de un modelo degenerado no son evidencia sobre alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention y sliding window attention (heredada de `mistralai/Mistral-7B-Instruct-v0.2`; no se detalla en la model card, se deriva del modelo base) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Fraccion de parametros retenida | 0,5998 (40 % de parametros eliminados por truncacion SVD) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no verificada experimentalmente en la model card) |
| Tipos de cuantizacion | no disponible: no se publican builds GGUF, GPTQ, AWQ ni bitsandbytes. El repositorio contiene pesos densos en safetensors (14,5 GB, consistente con fp16/bf16) |
| Idiomas soportados | no disponible (no declarado en la model card ni en los metadatos de HuggingFace; el modelo base esta orientado principalmente al ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Metodo de compresion | SVD-LLM completo (data whitening -> truncacion SVD -> LoRA sobre factores U -> merge -> LoRA sobre factores V -> merge -> fold a checkpoint denso) |
| Calibracion del whitening | 256 secuencias de WikiText-2 de 2048 tokens, semilla 42 |
| Configuracion de recuperacion | LoRA r=8, 2 epocas por factor, lr 0,0001, batch 64 |
| Dataset de recuperacion | `yahma/alpaca-cleaned` + 960 filas de rechazo (96 comportamientos de JailbreakBench x10, 1,82 % de las filas) |
| Tamano del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay reentrenamiento desde cero: el punto de partida es `mistralai/Mistral-7B-Instruct-v0.2`, un transformer decoder-only de 7B con grouped-query attention. Sobre ese checkpoint se aplica el pipeline de SVD-LLM: primero un data whitening calibrado con 256 secuencias de WikiText-2 de 2048 tokens (semilla 42), después una truncación SVD que reduce el rango de las matrices de cada capa hasta retener el 60 % de los parámetros, y a continuación una recuperación en dos etapas con LoRA r=8 (2 épocas por factor, lr 0,0001, batch 64): una sobre los factores U, merge, otra sobre los factores V, merge, y finalmente el plegado a formas densas originales de Mistral.

El autor documenta un parche necesario sobre el código upstream. `SVD_MistralAttention` dimensiona correctamente k/v según `num_key_value_heads`, pero calcula su rango con la fórmula de matriz cuadrada `int(hidden * ratio / 2)` compartida con q y o. Para una matriz k/v de (1024 x 4096), `whitening()` produce `int(kv*hidden*r / (kv+hidden))`, de modo que los pesos son correctos pero `nn.Linear.in_features` queda obsoleto y PEFT construye los adaptadores LoRA a partir de ese valor, haciendo fallar la etapa LoRA. El archivo `component/svd_mistral.py` se parcheó para declarar el rango que `whitening()` escribe realmente, más un recorte de máscara causal para transformers >= 4.43 (sha256 del archivo parcheado `b8c277613b72`). La aritmética de truncación no cambia: `whitening()` deriva todos los factores de las formas reales de los pesos, solo difieren las formas declaradas del módulo.

No hay RLHF ni DPO adicionales en esta variante: la alineación de seguridad proviene del modelo base y de las 960 filas de rechazo introducidas en la recuperación, cuyas respuestas objetivo son las generaciones greedy de Llama-2-7b-chat-hf. El modelo resultante es rango-deficiente pero no más pequeño en disco.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat, heredada de Mistral-7B-Instruct-v0.2; todas las evaluaciones del autor usan la plantilla de chat con decodificacion greedy.
- Razonamiento de sentido comun y conocimiento general a nivel de modelo de 7B, medido con ARC-Easy (0,6107 acc_norm), ARC-Challenge (0,3976), HellaSwag (0,6090), WinoGrande (0,6243), OpenBookQA (0,3920) y PIQA (0,6970).
- Aritmetica y matematicas basicas: MathQA con 0,2817 acc_norm, un valor bajo que sugiere capacidad matematica limitada tras la compresion.
- Comportamiento de rechazo ante peticiones dañinas: ASR de 0,0596 en AdvBench (evaluado con HarmBench-Llama-2-13b-cls) y de 0,1470 en StrongREJECT.
- Capacidad de seguir instrucciones de utilidad general tras la recuperacion con `yahma/alpaca-cleaned`.
- Soporte de tool calling / function calling: no documentado en la informacion disponible (el modelo base no lo declara de forma explicita).
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado en la informacion disponible.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo no es multimodal y no se declara modo de razonamiento extendido.
- Analisis de seguridad comparado: el autor publica tasas de sobrerrechazo (XSTest-safe 0,1290; OR-Bench-Hard-1K 0,2591; macro 0,1941) que permiten estudiar el equilibrio entre seguridad y utilidad, con fracciones de evaluacion fiables (0,99 y 1,00).

## Casos de uso

- Investigacion sobre compresion de modelos: el repositorio sirve como celda experimental reproducible de SVD-LLM al 60 % de parametros, con semilla, calibracion y configuracion LoRA documentadas, para comparar contra otras tecnicas de poda o cuantizacion bajo el mismo protocolo de evaluacion.
- Estudio del efecto de la compresion sobre la alineacion: comparar los ASR de AdvBench y StrongREJECT de esta variante frente a las celdas sin datos de seguridad del mismo autor permite medir si el ajuste de recuperacion con filas de rechazo preserva el comportamiento seguro.
- Analisis de sobrerrechazo en sistemas de moderacion: las tasas publicadas (12,90 % en XSTest-safe, 25,91 % en OR-Bench-Hard-1K) permiten calibrar umbrales de un clasificador de rechazo y estimar el coste en utilidad de una politica conservadora.
- Reproduccion y verificacion de evaluaciones: los archivos de salidas por prompt y las metricas crudas estan en `utility/` y `safety/`, lo que facilita replicar los calculos con los mismos jueces (HarmBench-Llama-2-13b-cls y allenai/wildguard) sin volver a generar.
- Protocolo de pruebas de jailbreak en laboratorio: con un ASR de 0,0596 en AdvBench y 0,1470 en StrongREJECT, sirve como linea base comprimida frente a la que medir ataques de elicitacion, siempre con validacion humana dado el aviso del autor sobre modelos degenerados.
- Evaluacion de la degradacion de utilidad en tareas de conocimiento: ARC-Challenge 0,3976 y MathQA 0,2817 son valores que permiten cuantificar la perdida frente al modelo completo en tareas de razonamiento, utiles para decidir si compensa servir una variante comprimida en lugar del original.
- Despliegue experimental en GPUs de gama alta para analisis interno: al cargar con `transformers` estandar y ocupar 14,5 GB, es viable ejecutarlo en una sola A100 o RTX 4090 para pruebas de inferencia en ingles, no para produccion con garantias de calidad.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Todas las generaciones usan plantilla de chat y decodificacion greedy; la perplejidad se mide en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA son zero-shot; los ASR de generacion se juzgan con `cais/HarmBench-Llama-2-13b-cls` y el sobrerrechazo con `allenai/wildguard`.

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,5998 |
| WikiText-2 perplexity | 10,3834 |
| arc_easy (acc_norm) | 0,6107 |
| arc_challenge (acc_norm) | 0,3976 |
| hellaswag (acc_norm) | 0,6090 |
| winogrande (acc) | 0,6243 |
| openbookqa (acc_norm) | 0,3920 |
| piqa (acc_norm) | 0,6970 |
| mathqa (acc_norm) | 0,2817 |
| AdvBench HarmBench ASR | 0,0596 |
| StrongREJECT HarmBench ASR | 0,1470 |
| Sobrerrechazo (XSTest-safe) | 0,1290 |
| Sobrerrechazo (OR-Bench-Hard-1K) | 0,2591 |
| Sobrerrechazo macro | 0,1941 |

Fiabilidad del juicio de sobrerrechazo para esta celda: fraccion puntuada de 0,99 en XSTest-safe y de 1,00 en OR-Bench-Hard-1K. No se han publicado resultados de benchmarks comparativos contra otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,5 GB solo de pesos, mas cache KV. Con la configuracion de atencion del modelo base (32 capas, 8 cabezas KV, dimension de cabeza 128), el cache KV a 32.768 tokens ronda los 4 GB, lo que situa el consumo total en torno a 19-21 GB en funcion del framework y del tamano de lote. Estimaciones calculadas a partir de los datos disponibles, no medidas por el autor.
- VRAM estimada con cuantizacion: unos 7,5 GB a 8 bits y unos 4,5 GB a 4 bits, siempre que se convierta el checkpoint (no hay builds cuantizados publicados).
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB, L40S 48 GB para fp16 con contexto largo; RTX 4090 o RTX 3090 de 24 GB para fp16 con contexto moderado o para cuantizacion de 8 bits con contexto largo.
- Caber en GPU de consumo: si, en RTX 4090/3090 (24 GB) en fp16 con ventana de contexto recortada, y en GPUs de 8-12 GB si se convierte a 4 bits.
- Opciones de despliegue: `transformers` con el checkpoint denso tal cual (no requiere codigo de modelado propio), vLLM y TGI para servicio con batching continuo. Para llama.cpp u Ollama seria necesario convertir previamente a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| Este modelo (SVD-LLM, keep 0,60, recovery_mix) | 7.241.732.096 (dense, rango-deficiente; 60 % retenido) | 32.768 tokens (heredado del base) | apache-2.0 | HuggingFace, safetensors, 0 descargas | Valores propios en la tabla de benchmarks |
| mistralai/Mistral-7B-Instruct-v0.2 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | apache-2.0 | HuggingFace | no disponible |
| Otras celdas del mismo autor sin datos de seguridad en la recuperacion (`recovery_mix` frente a SVD-LLM plano al mismo ratio) | mismo ratio declarado | no disponible | apache-2.0 | HuggingFace | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- La propia model card advierte de que la compresion a este ratio (40 % de parametros eliminados) puede degradar la calidad de generacion, y de que las cifras de seguridad de un modelo que se ha vuelto degenerado no constituyen evidencia sobre alineacion: hay que leer el sobrerrechazo y el seguimiento de instrucciones junto al ASR antes de extraer conclusiones de comportamiento.
- Sesgos conocidos: no documentados en la informacion disponible, mas alla del sesgo heredado del modelo base y de las respuestas de rechazo de Llama-2-7b-chat-hf usadas como objetivo de las 960 filas de seguridad.
- Riesgo de alucinacion: no cuantificado en la model card; el aumento de perplejidad en WikiText-2 (10,3834) es el unico indicador indirecto de perdida de fidelidad.
- Tasa de sobrerrechazo elevada: 12,90 % en XSTest-safe, 25,91 % en OR-Bench-Hard-1K y 19,41 % macro, lo que implica rechazar peticiones benignas en una de cada cuatro consultas dificiles.
- El checkpoint es rango-deficiente pero no mas pequeno en disco: 14,5 GB, identico a un Mistral-7B denso en fp16. No hay ganancia de memoria ni de velocidad por el hecho de estar comprimido.
- Los pesos solo se distribuyen en safetensors; no hay versiones GGUF, GPTQ, AWQ ni de 8 bits, de modo que el despliegue eficiente exige trabajo de conversion propio.
- Idiomas soportados no declarados: no hay garantia de rendimiento fuera del ingles.
- No se documentan tool calling, uso como agente, razonamiento multi-paso, vision ni audio.
- Contexto de 32.768 tokens heredado del modelo base, no verificado experimentalmente tras la compresion; el comportamiento mas alla de la ventana de atencion deslizante podria diferir del original.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin revisión por pares de las metricas publicadas.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero las respuestas objetivo de las 960 filas de recuperacion provienen de `meta-llama/Llama-2-7b-chat-hf`, cuyos terminos conviene revisar antes de reutilizar el modelo en productos comerciales.
- El parche del codigo upstream afecta a los adaptadores LoRA de la fase de recuperacion, no a la aritmetica de truncacion; los pesos resultantes son densos y se cargan sin codigo personalizado, pero la reproducibilidad del pipeline exacto depende de ese parche.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_jbbsft_finetuned_keep_0p60
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Codigo de SVD-LLM (commit `7538cca98880`): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de recuperacion: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Evaluador de seguridad citado, HarmBench-Llama-2-13b-cls: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Evaluador de sobrerrechazo citado, WildGuard: https://huggingface.co/allenai/wildguard
- Respuestas objetivo de rechazo (modelo de referencia): https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Nota: las busquedas web realizadas no devolvieron resultados relacionados con el modelo; los unicos enlaces relevantes son los citados en la model card y en los metadatos de HuggingFace.
