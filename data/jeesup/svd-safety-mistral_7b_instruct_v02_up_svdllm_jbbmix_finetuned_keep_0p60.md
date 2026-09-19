# Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_jbbmix_finetuned_keep_0p60

## Resumen

Este checkpoint es una version comprimida de `mistralai/Mistral-7B-Instruct-v0.2` obtenida con el metodo completo SVD-LLM (descomposicion en valores singulares con truncamiento consciente del error) usando el codigo de los autores del paper, commit `7538cca98880` del repositorio AIoT-MLSys-Lab/SVD-LLM. Lo publica el usuario Jeesup bajo licencia Apache-2.0. Se elimina el 40% de los parametros y se conserva el 60% (fraccion realizada 0.5997971754807693) mediante un pipeline de blanqueado de datos, truncamiento SVD, LoRA sobre los factores U, merge, LoRA sobre los factores V, merge y plegado final a un checkpoint denso.

Su relevancia es metodologica mas que de producto: es una de las celdas de un estudio empirico sobre si incorporar datos de seguridad (100 comportamientos daninos de JailbreakBench, 0,78% de los tokens de calibracion) en la fase de blanqueado preserva la capacidad de rechazo del modelo comprimido. Ademas documenta un parche necesario en `component/svd_mistral.py` para que el rango declarado por `whitening()` coincida con el rango realmente escrito, sin el cual PEFT no puede construir los adaptadores LoRA; el parche no altera la aritmetica de truncamiento.

Tecnicamente sigue siendo un transformer decoder-only de 7.241.732.096 parametros (dato real de safetensors) que conserva las formas densas de Mistral-7B, de modo que se carga con `transformers` estandar y sin codigo de modelado propio. Conviene subrayar que es deficiente en rango, no mas pequeno en disco: no hay ahorro de memoria ni de almacenamiento respecto al modelo base. El repositorio ocupa 14,5 GB y el modelo acumulaba 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2); pesos densos con rango deficiente tras truncamiento SVD |
| Parametros totales | 7.241.732.096 (safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base, con ventana deslizante de 4.096 tokens (no reverificado en este checkpoint) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; el repositorio solo contiene pesos densos en safetensors) |
| Idiomas soportados | no disponible en la model card; el modelo base esta orientado principalmente al ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 14,5 GB; precision exacta no declarada) |
| Metodo de compresion | SVD-LLM con blanqueado de datos y truncamiento SVD, mas dos rondas de LoRA plegadas |
| Parametros eliminados | 40% (retencion realizada 0.5997971754807693) |
| Calibracion del blanqueado | 256 secuencias de WikiText-2 de 2.048 tokens (semilla 42) + 2 secuencias empaquetadas de los 100 comportamientos daninos de JailbreakBench (`wikitext2:256,jbb_harmful:2`; 0,78% de los tokens de blanqueado) |
| Ajuste LoRA | r=8, 2 epocas por factor, lr 0.0001, batch 64, sobre `yahma/alpaca-cleaned` |
| Parche requerido en el codigo de origen | `component/svd_mistral.py`, sha256 `b8c277613b72` (declaracion del rango escrito por `whitening()` y corte de la mascara causal para transformers >= 4.43) |
| Modelo base | `mistralai/Mistral-7B-Instruct-v0.2` |
| Tamano del repositorio | 14,5 GB |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2: un transformer decoder-only con 32 capas, atencion con consultas agrupadas (GQA), activacion SwiGLU, normalizacion RMSNorm y embeddings rotatorios (RoPE), con un vocabulario de 32.000 tokens aproximadamente y una ventana de atencion deslizante de 4.096 tokens sobre una longitud de contexto maxima de 32.768. El modelo base se ajusto por instrucciones (SFT); la model card de este checkpoint no menciona RLHF ni DPO en ninguna fase, y el unico ajuste adicional es el LoRA sobre los factores SVD.

El proceso de compresion aplica el metodo SVD-LLM completo: primero un blanqueado de datos que estima la matriz de covarianza de activaciones con 256 secuencias de WikiText-2 de 2.048 tokens (semilla 42) y, en esta celda concreta, 2 secuencias empaquetadas con los 100 comportamientos daninos de JailbreakBench (solo prompt y cabecera de asistente, sin respuesta; 0,78% de los tokens de calibracion); despues una truncacion SVD que descarta el 40% de los parametros; a continuacion dos rondas de LoRA (r=8, 2 epocas por factor, lr 0.0001, batch 64, sobre `yahma/alpaca-cleaned`), la primera sobre los factores U y la segunda sobre los factores V, cada una seguida de merge. Finalmente los factores se pliegan a formas densas de Mistral (`W = U @ V`), por lo que el checkpoint resultante es deficiente en rango pero no mas pequeno en disco y no requiere codigo de modelado personalizado.

La innovacion documentada es doble. Por un lado, la correccion del calculo de rango en `SVD_MistralAttention`: el codigo original dimensiona k/v segun `num_key_value_heads`, pero calcula su rango con la formula de matriz cuadrada `int(hidden * ratio / 2)` compartida con q y o; para una matriz k/v de (1024 x 4096), `whitening()` produce `int(kv*hidden*r / (kv+hidden))`, de modo que los pesos son correctos pero `nn.Linear.in_features` queda obsoleto y PEFT falla al construir los adaptadores. El parche declara el rango que `whitening()` realmente escribe y anade un corte de la mascara causal para transformers >= 4.43. Por otro lado, la propia celda experimental: mezclar comportamientos de JailbreakBench en la calibracion del blanqueado como "brazo de linea base de datos de seguridad" para medir si eso preserva el rechazo; en AdvBench, 11 de sus 520 prompts son literalmente comportamientos de JailbreakBench.

## Capacidades

- Generacion de texto e instrucciones en formato chat, usando la plantilla de conversacion del modelo base y decodificacion voraz en la evaluacion publicada.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con rendimiento medido en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA.
- Resolucion de problemas matematicos de nivel elemental (MathQA), con una precision limitada (0,2878 acc_norm).
- Capacidad de rechazo parcial ante peticiones daninas: tasas de exito de ataque (ASR) de 0,3846 en AdvBench y 0,3962 en StrongREJECT, ambas juzgadas con `cais/HarmBench-Llama-2-13b-cls`.
- Soporte de tool calling / function calling: no disponible (la model card no lo documenta y la compresion puede degradar el seguimiento de formato).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas; el modelo base esta orientado al ingles.
- Capacidad especial: ninguna mas alla del modo instruct estandar (no hay modo "thinking", vision ni audio).
- El checkpoint conserva las formas densas del modelo base, por lo que es compatible con el ecosistema estandar de `transformers` sin dependencias adicionales.

## Casos de uso

- Reproduccion de resultados de compresion SVD-LLM: el repositorio incluye las salidas por prompt y los ficheros de metricas en bruto en `utility/` y `safety/`, de modo que sirve para replicar la tabla de resultados o para comparar variantes de ratio de truncamiento.
- Investigacion sobre alineacion y compresion: es el brazo experimental que mide si anadir datos daninos en la calibracion del blanqueado preserva el rechazo, comparandolo con la celda SVD-LLM simple al mismo ratio.
- Evaluacion de jailbreaks como linea base degradada: sus ASR de 0,3846 (AdvBench) y 0,3962 (StrongREJECT) permiten usarlo como punto de referencia de un modelo comprimido al que se le ha erosionado parcialmente la alineacion.
- Estudio de sobre-rechazo: con tasas de 0,1230 en XSTest-safe y 0,1299 en OR-Bench-Hard-1K (macro 0,1264), sirve para analizar el equilibrio entre seguridad y utilidad tras comprimir.
- Analisis de degradacion por truncamiento: la perplejidad de 10,3871 en WikiText-2 y las tareas zero-shot publicadas permiten cuantificar cuanto se pierde al conservar solo el 60% de los parametros frente a otras celdas del mismo estudio.
- Trabajo metodologico sobre PEFT y formas declaradas: el parche documentado en `component/svd_mistral.py` es un caso de estudio util para quien integre modulos comprimidos con bibliotecas que infieren dimensiones desde `nn.Linear`.
- Experimentos de cuantizacion posterior sobre pesos deficientes en rango: se puede medir si la cuantizacion agrava o no la perdida de calidad de un checkpoint ya truncado, siempre que se convierta a GGUF o AWQ por cuenta propia.
- No es adecuado como modelo de produccion, atencion al cliente ni generacion de codigo en pipelines reales: la model card advierte que la compresion a este ratio puede degradar la calidad de generacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,5998 |
| Perplejidad en WikiText-2 | 10,3871 |
| ARC-Easy (acc_norm) | 0,6317 |
| ARC-Challenge (acc_norm) | 0,4002 |
| HellaSwag (acc_norm) | 0,6081 |
| WinoGrande (acc) | 0,6219 |
| OpenBookQA (acc_norm) | 0,3560 |
| PIQA (acc_norm) | 0,7100 |
| MathQA (acc_norm) | 0,2878 |
| AdvBench HarmBench ASR | 0,3846 |
| StrongREJECT HarmBench ASR | 0,3962 |
| Tasa de sobre-rechazo (XSTest-safe) | 0,1230 |
| Tasa de sobre-rechazo (OR-Bench-Hard-1K) | 0,1299 |
| Tasa macro de sobre-rechazo | 0,1264 |

Metodologia de evaluacion: perplejidad en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; generaciones de AdvBench y StrongREJECT juzgadas por `cais/HarmBench-Llama-2-13b-cls`; sobre-rechazo en XSTest-safe y OR-Bench-Hard-1K juzgado por `allenai/wildguard`. Toda la generacion usa la plantilla de chat y decodificacion voraz. La fraccion evaluada de las pruebas de sobre-rechazo es 0,98 en ambos conjuntos, lo que el autor califica de fiable para esta celda. No se aportan resultados de benchmarks del modelo base ni de modelos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM en 16 bits: los 7.241.732.096 parametros ocupan aproximadamente 14,5 GB solo en pesos, mas cache KV y activaciones; en la practica se necesitan entre 16 y 20 GB segun contexto y lote.
- VRAM en 8 bits: aproximadamente 7,3 GB de pesos, con un total estimado de 9-11 GB segun longitud de contexto.
- VRAM en 4 bits: aproximadamente 4,0-4,5 GB de pesos, con un total estimado de 6-8 GB.
- GPU de centro de datos: A100 40 GB, A100 80 GB y H100 80 GB ejecutan el modelo en 16 bits sin dificultad y con contexto largo.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) admiten 16 bits con contexto moderado; RTX 4080 (16 GB) queda al limite en 16 bits y comoda en 8 o 4 bits; RTX 3060 12 GB y RTX 4060 8 GB solo en 4 bits.
- Importante: la compresion no reduce el uso de memoria ni el tamano en disco, porque los factores se han plegado a formas densas. Los requisitos son los mismos que los de Mistral-7B-Instruct-v0.2.
- Opciones de despliegue: `transformers` con `accelerate` (via directa, sin codigo personalizado); vLLM y TGI son compatibles con las formas densas de Mistral; llama.cpp y Ollama requieren una conversion a GGUF que no se publica en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Este checkpoint (keep 0p60, mezcla jbb en calibracion) | 7,24 B densos, rango deficiente | 32.768 tokens (heredado) | Apache-2.0 | safetensors | Ver tabla de benchmarks |
| `mistralai/Mistral-7B-Instruct-v0.2` (modelo base) | 7,24 B densos | 32.768 tokens | Apache-2.0 | safetensors | no disponible en la informacion proporcionada |
| Celda SVD-LLM simple al mismo ratio, sin mezcla de seguridad en el blanqueado | 7,24 B densos, rango deficiente | 32.768 tokens (heredado) | no disponible | safetensors | no disponible en la informacion proporcionada |
| Modelos instruct de 7-8 B sin comprimir de la misma categoria (por ejemplo, Llama-3-8B-Instruct) | 7-8 B | 8.192-32.768 tokens segun modelo | licencias comunitarias o permisivas segun modelo | safetensors | no disponible en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: la model card solo publica los resultados de esta celda. La comparacion con la celda SVD-LLM simple sin mezcla de seguridad es la mas informativa del estudio, porque aisla el efecto de los datos de seguridad en la calibracion, pero sus cifras no se incluyen en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint es deficiente en rango pero no mas pequeno: no aporta ahorro de memoria, disco ni latencia frente a Mistral-7B-Instruct-v0.2. Cualquier expectativa de eficiencia por compresion es infundada.
- La propia model card advierte que la compresion a este ratio puede degradar la calidad de generacion.
- El autor senala explicitamente que las cifras de seguridad de un modelo degenerado no son evidencia sobre alineacion, y recomienda leer las columnas de sobre-rechazo y de seguimiento de instrucciones junto al ASR antes de extraer conclusiones de comportamiento.
- Un ASR de 0,3846 en AdvBench y 0,3962 en StrongREJECT implica que cerca del 40% de las peticiones daninas evaluadas obtienen respuesta conforme; no es un modelo apto para despliegues expuestos a usuarios sin filtros adicionales.
- Tasas de sobre-rechazo de 0,1230 (XSTest-safe) y 0,1299 (OR-Bench-Hard-1K) indican que rechaza peticiones benignas en aproximadamente uno de cada ocho casos.
- Rendimiento bajo en tareas de razonamiento: 0,4002 acc_norm en ARC-Challenge, 0,3560 en OpenBookQA y 0,2878 en MathQA. Perplejidad de 10,3871 en WikiText-2, superior a la esperable en el modelo sin comprimir.
- Idiomas: la model card no declara idiomas soportados y el modelo base esta orientado al ingles; el rendimiento fuera del ingles no esta medido ni garantizado.
- Sin validacion externa: 0 descargas y 0 likes, sin revision por pares ni informes de terceros.
- Dependencia de un parche concreto: cualquier reentrenamiento o reproduccion exige aplicar la correccion de `component/svd_mistral.py` (sha256 `b8c277613b72`); sin ella, la fase LoRA falla.
- Licencia Apache-2.0, heredada del modelo base, que permite uso comercial, pero la degradacion de calidad y de seguridad documentada hace desaconsejable ese uso sin una evaluacion previa propia.
- La evaluacion se realizo con decodificacion voraz y plantilla de chat; otros ajustes de muestreo pueden alterar tanto la utilidad como las tasas de rechazo.
- No se publican variantes cuantizadas, por lo que desplegar en 4 u 8 bits exige convertir los pesos uno mismo y asumir la perdida adicional asociada.
- Los enlaces de busqueda web obtenidos no aportan informacion verificable sobre este modelo (solo resultados genericos de Microsoft), de modo que no hay fuentes independientes que confirmen o matizen las cifras del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_jbbmix_finetuned_keep_0p60
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Repositorio de SVD-LLM (commit `7538cca98880`): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Dataset de ajuste LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset de calibracion principal: WikiText-2
- Dataset de calibracion de seguridad: JailbreakBench
- Conjuntos de evaluacion de seguridad: AdvBench, StrongREJECT, XSTest-safe, OR-Bench-Hard-1K
- Juez de ataques: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobre-rechazo: https://huggingface.co/allenai/wildguard
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente enlaces genericos de Microsoft), por lo que no se han podido incorporar papers, blogs, demos ni articulos de terceros.
