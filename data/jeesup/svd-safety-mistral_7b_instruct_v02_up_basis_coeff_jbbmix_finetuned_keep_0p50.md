# Jeesup/svd-safety-mistral_7b_instruct_v02_up_basis_coeff_jbbmix_finetuned_keep_0p50

## Resumen

Este checkpoint es un artefacto de investigacion publicado por el usuario Jeesup en HuggingFace: se trata de `mistralai/Mistral-7B-Instruct-v0.2` comprimido al 50 % mediante la tecnica Basis Sharing del repositorio `TUDa-HWAI/Basis_Sharing`, y posteriormente recuperado con un LoRA entrenado exclusivamente sobre los coeficientes de la descomposicion. El objetivo no es ofrecer un modelo listo para produccion, sino medir como afecta la compresion agresiva al comportamiento de rechazo (refusal) ante peticiones daninas.

La innovacion del experimento esta en el conjunto de calibracion: ademas de 256 secuencias de WikiText-2 de 2048 tokens con semilla 42, se anaden 2 secuencias empaquetadas con los 100 comportamientos daninos de JailbreakBench (`jbb_harmful:2`, solo prompt y cabecera de asistente, sin respuesta), que representan el 0,78 % de los tokens de calibracion. Esta "rama de linea base con datos de seguridad" sirve para comprobar si mezclar datos de seguridad en la fase de calibracion preserva la capacidad de rechazo tras la compresion.

El resultado es un checkpoint con formas densas de Mistral (carga con `transformers` estandar, sin codigo de modelado propio) pero con estructura de rango deficiente: se conserva una fraccion realizada de parametros de 0,4999, aunque el tamano en disco no se reduce (14,5 GB de repositorio). La model card advierte explicitamente de que la compresion a este ratio degrada el comportamiento de rechazo, y que las cifras de seguridad de un modelo degenerado no son evidencia sobre alineacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, basada en Mistral-7B-Instruct-v0.2, con pesos factorizados por Basis Sharing (SVD blanqueado por grupos) y plegados de nuevo a formas densas |
| Parametros totales | 7.241.732.096 (7,24 mil millones) |
| Longitud de contexto | 32.768 tokens heredados del modelo base; Mistral-7B-Instruct-v0.2 no usa sliding window (verificado en la model card: logits identicos cargando como `LlamaForCausalLM` y `MistralForCausalLM`, diferencia maxima 0,0 en float32 hasta 600 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el checkpoint se publica en safetensors con formas densas, por lo que admite cuantizacion posterior con herramientas estandar |
| Idiomas soportados | No declarados en la ficha de HuggingFace; el modelo base Mistral-7B-Instruct-v0.2 declara ingles, frances, italiano, aleman y espanol |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formas densas de Mistral, cargable con `transformers` estandar; el checkpoint publicado es un `MistralForCausalLM` normal). Tamano del repositorio: 14,5 GB |
| Fraccion de parametros realizada | 0,4998967097355769 (50 % de parametros eliminados) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Grupos de comparticion | 2 capas adyacentes comparten una base por tipo de peso |
| Tipos compartidos / privados | Compartidos: `v`, `k`, `q`, `up`, `gate`. Privados por capa: `down`, `o` |

## Arquitectura y entrenamiento

La compresion sigue el pipeline de Basis Sharing: SVD blanqueado de las matrices de cada grupo concatenadas horizontalmente (el ajuste de base compartida), seguido de un LoRA sobre los coeficientes con las bases congeladas, fusion `C' = C + (alpha/r)BA` y plegado `W = C' @ B` a denso. Solo se entrenan los coeficientes; las bases compartidas y por capa quedan congeladas y son bit-identicas a las del modelo comprimido, de modo que cada peso mantiene rango <= k, cada grupo sigue compartiendo una base y el presupuesto de parametros se conserva exactamente tras la recuperacion. No se trata del LoRA propio de Basis Sharing (wikitext, batch 1, solo q/v): se usa la receta alpaca del proyecto para que los datos de recuperacion sean constantes entre metodos.

La recuperacion emplea LoRA con r=8, alpha 16, 2 epocas, learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned`. La calibracion usa 256 secuencias de WikiText-2 de 2048 tokens con semilla 42 (el proyecto upstream fija la semilla 2023; aqui se calibra cada metodo con una sola semilla) mas 2 secuencias empaquetadas de los 100 comportamientos daninos de JailbreakBench, sin respuesta, que suponen el 0,78 % de los tokens de calibracion. Como el LoRA entrena el modelo factorizado `ShareLlama`, el encoding posicional importa: se usan las tablas rotatorias propias de `transformers` construidas desde la config del modelo, verificadas identicas a las de Llama en float64 para base RoPE 1e4 / 5e5 / 1e6, escalado llama3, grouped-query attention y sesgos q/k/v. El checkpoint se comprimio por la ruta `ShareLlama` (no por el modulo Mistral de Basis Sharing) porque las herramientas del proyecto leen ese layout; esto es exacto solo porque Mistral-7B-Instruct-v0.2 carece de sliding window.

## Capacidades

- Generacion de texto conversacional con plantilla de chat, en modo greedy segun la evaluacion publicada.
- Razonamiento de sentido comun y conocimiento general a nivel de modelo de 7B, aunque medido tras una compresion del 50 %: ARC-Easy 0,5808, HellaSwag 0,5541, WinoGrande 0,6235.
- Resolucion de problemas de matematica basica y razonamiento cuantitativo limitado: MathQA 0,2613, PIQA 0,6752.
- Comprension lectora y QA de sentido comun: OpenBookQA 0,3580, ARC-Challenge 0,3652.
- Capacidad de rechazo parcial ante peticiones daninas (comportamiento de seguridad degradado): ASR de 0,4462 en AdvBench HarmBench y 0,4824 en StrongREJECT HarmBench.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible; el modelo es exclusivamente de texto.
- Capacidades multilingues: no evaluadas en la informacion proporcionada (heredadas nominalmente del modelo base).

## Casos de uso

- Investigacion sobre compresion de modelos: el checkpoint sirve como celda experimental de referencia para medir el efecto de Basis Sharing al 50 % sobre perplejidad (WikiText-2 11,2805) y sobre tareas zero-shot, comparando con otras tecnicas de compresion bajo la misma receta de recuperacion alpaca.
- Estudio de la perdida de comportamiento de rechazo: con ASR de 0,4462 y 0,4824 en dos jueces distintos, es un punto de partida para analizar como la compresion de rango bajo degrada los mecanismos de refusal en modelos alineados.
- Analisis del efecto de datos de seguridad en la calibracion: esta celda existe precisamente para comprobar si mezclar los 100 comportamientos daninos de JailbreakBench (0,78 % de los tokens de calibracion) preserva el rechazo, por lo que es util en experimentos controlados sobre mezclas de calibracion.
- Evaluacion de sobre-rechazo: las tasas publicadas (0,1084 en XSTest-safe, 0,1362 en OR-Bench-Hard-1K, macro 0,1223) permiten estudiar el equilibrio entre seguridad y utilidad, con fiabilidad de juicio declarada como alta (fraccion puntuada 1,00 en ambos conjuntos).
- Banco de pruebas de pipelines de evaluacion de seguridad: al incluir salidas por prompt y archivos de metricas crudas en `utility/` y `safety/`, es util para validar clasificadores como `cais/HarmBench-Llama-2-13b-cls` o `allenai/wildguard` sin reejecutar generaciones.
- Experimentos de destilacion o ajuste posterior en entornos de investigacion: al cargarse con `transformers` estandar y sin codigo personalizado, se puede usar como inicializacion en estudios de recuperacion de capacidad sobre pesos de rango deficiente.
- Generacion de texto offline en entornos aislados de investigacion: para reproducir prompts de la plantilla de chat y analizar salidas, nunca como servicio expuesto a usuarios finales dado el caveat de seguridad declarado por el autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,4999 |
| Perplejidad en WikiText-2 | 11,2805 |
| ARC-Easy (acc_norm) | 0,5808 |
| ARC-Challenge (acc_norm) | 0,3652 |
| HellaSwag (acc_norm) | 0,5541 |
| WinoGrande (acc) | 0,6235 |
| OpenBookQA (acc_norm) | 0,3580 |
| PIQA (acc_norm) | 0,6752 |
| MathQA (acc_norm) | 0,2613 |
| AdvBench HarmBench ASR | 0,4462 |
| StrongREJECT HarmBench ASR | 0,4824 |
| Tasa de sobre-rechazo (XSTest-safe) | 0,1084 |
| Tasa de sobre-rechazo (OR-Bench-Hard-1K) | 0,1362 |
| Tasa macro de sobre-rechazo | 0,1223 |

Metodologia declarada: perplejidad en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; generaciones de AdvBench y StrongREJECT juzgadas con `cais/HarmBench-Llama-2-13b-cls`; sobre-rechazo en XSTest-safe y OR-Bench-Hard-1K juzgado con `allenai/wildguard`. Toda la generacion usa la plantilla de chat en modo greedy. El juicio de sobre-rechazo se considera fiable para esta celda (fraccion puntuada 1,00 en ambos conjuntos). No se han publicado resultados comparativos del modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, segun el recuento real de 7.241.732.096 parametros: aproximadamente 14,5 GB en fp16/bf16, unos 29 GB en fp32, unos 7,3 GB en cuantizacion de 8 bits y unos 4 GB en 4 bits (estimaciones derivadas del numero de parametros; no publicadas por el autor).
- El checkpoint no reduce el tamano en disco pese a la compresion: sigue siendo denso y rango-deficiente, por lo que la huella de memoria es la de un modelo de 7B estandar, mas el coste del cache KV para contexto largo.
- GPU recomendadas: A100 40/80 GB y H100 para fp16 sin cuantizar con contexto largo y lotes grandes; L40S, A10G 24 GB, RTX 4090 y RTX 3090 para fp16 con lotes moderados.
- Cabe en GPU de consumo: si. En 24 GB (RTX 3090, 4090) en fp16; en 16 GB (RTX 4080, 4060 Ti 16 GB) en 8 bits; en 8-12 GB en 4 bits, siempre con secuencias cortas.
- Opciones de despliegue: `transformers` estandar con `MistralForCausalLM` (el propio autor confirma que no requiere codigo de modelado personalizado); vLLM o TGI para servicio con batching continuo; llama.cpp u Ollama requeririan convertir previamente a GGUF, conversion no publicada en el repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota de contexto: con 32.768 tokens de ventana, un cache KV en fp16 para la maxima longitud exige varios GB adicionales por secuencia, lo que reduce el lote maximo en GPUs de 24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`svd-safety-...keep_0p50`) | 7,24 mil millones (fraccion realizada 0,4999, denso en disco) | 32.768 tokens | apache-2.0 | Perplejidad WikiText-2 11,2805; ARC-Easy 0,5808; HellaSwag 0,5541; ASR AdvBench 0,4462 | HuggingFace, 0 descargas y 0 likes |
| `mistralai/Mistral-7B-Instruct-v0.2` (modelo base) | 7,24 mil millones | 32.768 tokens | apache-2.0 | No disponible en la informacion proporcionada | HuggingFace, ampliamente distribuido |
| Celda Basis Sharing sin mezcla de seguridad, mismo ratio | 7,24 mil millones (misma fraccion realizada, segun la model card) | 32.768 tokens | apache-2.0 (heredada) | No disponible en la informacion proporcionada | Referenciada en la model card como celda de control; URL no disponible |

No se dispone de datos de benchmarks del modelo base ni de la celda de control en la informacion proporcionada, por lo que no es posible cuantificar la perdida de rendimiento atribuible a la compresion ni al uso de datos de seguridad en la calibracion.

## Limitaciones y advertencias

- Degradacion de seguridad declarada por el autor: la compresion al 50 % degrada el comportamiento de rechazo, y ese es precisamente el fenomeno que esta celda mide. Las cifras de seguridad de un modelo degenerado no deben interpretarse como evidencia sobre alineacion.
- Tasa de ataque exitoso elevada: 0,4462 en AdvBench HarmBench y 0,4824 en StrongREJECT HarmBench, con juicio de `cais/HarmBench-Llama-2-13b-cls`.
- Sobre-rechazo no despreciable: 0,1084 en XSTest-safe y 0,1362 en OR-Bench-Hard-1K, con macro de 0,1223; el juicio se declara fiable (fraccion puntuada 1,00) en ambos conjuntos.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; al tratarse de un modelo comprimido y recuperado con LoRA sobre alpaca, la calidad factual puede verse afectada de forma no medida.
- Naturaleza experimental: el calibrado incluye 2 secuencias con los 100 comportamientos daninos de JailbreakBench (0,78 % de los tokens), y 11 de los 520 prompts de AdvBench coinciden literalmente con esos comportamientos, lo que puede contaminar la interpretacion de las metricas de seguridad.
- Reproducibilidad limitada de la comparativa: el proyecto upstream fija semilla 2023 y este trabajo calibra cada metodo con una unica semilla (42), de modo que la variabilidad entre semillas no esta caracterizada.
- Compresion estructural, no de tamano: el checkpoint es rango-deficiente pero no ocupa menos en disco (14,5 GB); no cabe esperar ahorro de memoria o de latencia por si solo.
- Licencia: apache-2.0, sin restricciones declaradas de uso comercial, pero el autor no ofrece ninguna garantia de idoneidad y el modelo no deberia desplegarse en produccion.
- Idiomas: no declarados ni evaluados; las capacidades multilingues no estan verificadas tras la compresion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha pasado por validacion externa.
- Uso responsable: cualquier despliegue deberia acompanarse de filtros externos de entrada y salida, y de evaluaciones propias de seguridad, dado el ASR declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_basis_coeff_jbbmix_finetuned_keep_0p50
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Codigo de Basis Sharing (commit `1c021b6ce1d3`): https://github.com/TUDa-HWAI/Basis_Sharing
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a la Universidad de Stanford y no guardan relacion con el modelo.
- Referencias citadas en la model card sin URL en la informacion proporcionada: WikiText-2, `yahma/alpaca-cleaned`, JailbreakBench, AdvBench, StrongREJECT, XSTest-safe, OR-Bench-Hard-1K, `cais/HarmBench-Llama-2-13b-cls`, `allenai/wildguard`; las salidas por prompt y los archivos de metricas crudas se encuentran en los directorios `utility/` y `safety/` del repositorio.
