# Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p80

## Resumen

Esta ficha describe `Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p80`, un checkpoint derivado de `mistralai/Mistral-7B-Instruct-v0.2` al que se le ha aplicado el metodo completo de compresion SVD-LLM (truncamiento por descomposicion en valores singulares con calibracion por blanqueado de datos y ajuste posterior con LoRA). Lo publica el usuario de HuggingFace Jeesup como artefacto de investigacion sobre compresion de modelos y su impacto en el comportamiento de seguridad. El objetivo declarado no es desplegar un asistente de produccion, sino medir como se degradan utilidad y alineamiento cuando se elimina el 20 % de los parametros efectivos mediante truncamiento de rango.

El modelo conserva la arquitectura del base (transformer decoder-only de Mistral, 7.241.732.096 parametros en forma densa, atencion con sliding window y grouped-query attention) y mantiene el mismo recuento de parametros almacenados: los factores U y V se pliegan de nuevo a matrices densas (`W = U @ V`), de modo que el checkpoint es rango-deficiente pero no ocupa menos en disco (14,5 GB de repositorio). La fraccion de parametros efectivamente realizada es 0,7997952974759616, es decir, un 20 % de rango eliminado.

Su relevancia es metodologica: documenta de forma reproducible el pipeline de SVD-LLM, un parche necesario en el codigo original para que la etapa LoRA funcione en las matrices k/v de Mistral, y publica mediciones conjuntas de perplejidad, tareas zero-shot, tasa de exito de ataque (ASR) y tasa de sobrerrechazo. Es un punto de referencia util para quien investigue compresion de LLM, evaluacion de seguridad bajo degradacion o recetas de ajuste de bajo rango, no una eleccion recomendable para cargas de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con sliding window attention y grouped-query attention (heredada de Mistral-7B-Instruct-v0.2); pesos recomprimidos a rango deficiente y plegados a formas densas |
| Parametros totales | 7.241.732.096 (forma densa almacenada, segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens, heredada del modelo base Mistral-7B-Instruct-v0.2; no se explicita en la model card de este checkpoint |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en precision completa. No se incluyen ficheros GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | no disponible; no se declara en la model card (el modelo base esta orientado principalmente a ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Fraccion de parametros retenida | 0,7997952974759616 (20 % de rango eliminado) |
| Tamano del repositorio | 14,5 GB |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Metodo de compresion | SVD-LLM (AIoT-MLSys-Lab/SVD-LLM, commit 7538cca98880) con parche propio |
| Descargas / likes | 8 / 0 |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

El punto de partida es un transformer decoder-only denso de 7B parametros con grouped-query attention y ventana de atencion deslizante, tal como lo define Mistral-7B-Instruct-v0.2, que ya incorpora ajuste por instrucciones. Sobre ese checkpoint se aplica el pipeline SVD-LLM en cinco etapas: blanqueado de datos, truncamiento SVD, LoRA sobre los factores U, fusion, LoRA sobre los factores V, fusion y finalmente plegado a un checkpoint denso. La calibracion del blanqueado usa 256 secuencias de WikiText-2 de 2048 tokens con semilla 3. El ajuste LoRA emplea r=8, 2 epocas por factor, learning rate 0,0001 y batch 64 sobre `yahma/alpaca-cleaned`. No se documenta entrenamiento adicional con RLHF ni DPO mas alla del que ya trae el modelo base.

La innovacion tecnica destacable es doble. Por un lado, el truncamiento se realiza en el espacio blanqueado, lo que reparte mejor el error entre canales y preserva mas calidad que un SVD directo sobre los pesos. Por otro, el autor documenta un parche obligatorio sobre `component/svd_mistral.py`: el codigo original dimensiona correctamente las matrices k/v por `num_key_value_heads`, pero calcula su rango con la formula de matriz cuadrada `int(hidden * ratio / 2)` compartida con q y o. Para una matriz k/v de (1024 x 4096), `whitening()` produce `int(kv*hidden*r / (kv+hidden))`, de modo que los pesos son correctos pero `nn.Linear.in_features` queda obsoleto; PEFT construye los adaptadores LoRA a partir de ese valor y la etapa LoRA falla. El parche declara el rango que `whitening()` escribe realmente y anade un recorte de mascara causal para transformers >= 4.43 (sha256 del fichero parcheado: `b8c277613b72`). La aritmetica de truncamiento no cambia: `whitening()` deriva todos los factores de las formas reales de los pesos.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del ajuste de instrucciones de Mistral-7B-Instruct-v0.2.
- Conversacion multi-turno mediante plantilla de chat; la evaluacion publicada usa la chat template con decodificacion greedy.
- Razonamiento de sentido comun y comprension lectora a nivel basico: se reportan resultados en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA y PIQA.
- Aritmetica y matematicas elementales limitadas: MathQA con 0,3119 de exactitud normalizada.
- Generacion de codigo: no evaluada en la informacion disponible, aunque el modelo base tiene capacidad razonable. No hay datos especificos para este checkpoint.
- Tool calling / function calling: no documentado. Mistral-7B-Instruct-v0.2 no expone un formato nativo de llamada a funciones y esta ficha no lo evalua.
- Uso como agente o razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multilingues: no declaradas. No se publica desglose por idioma.
- Vision, audio o modo de pensamiento explicito: no disponibles.

## Casos de uso

- Reproduccion de investigacion en compresion de LLM: el pipeline completo (blanqueado, truncamiento SVD, LoRA sobre U y V, plegado) esta descrito con hiperparametros concretos (256 secuencias de WikiText-2 de 2048 tokens, semilla 3, LoRA r=8, lr 1e-4, batch 64), lo que permite replicar la receta o variar la fraccion retenida.
- Estudio de degradacion de seguridad por compresion: el checkpoint publica simultaneamente ASR en AdvBench (0,3269) y StrongREJECT (0,3738) y tasas de sobrerrechazo (0,1264 macro), lo que lo convierte en una celda util dentro de un barrido de ratios de compresion.
- Analisis de sobrerrechazo y utilidad instruccional: al incluir XSTest-safe y OR-Bench-Hard-1K con juicio de `allenai/wildguard` y fracciones puntuadas de 1,00, sirve para estudiar la relacion entre compresion y rechazos excesivos.
- Linea base para comparar metodos de compresion: puede enfrentarse a otras tecnicas de pruning, cuantizacion o destilacion evaluadas con el mismo arnes (WikiText-2, ARC, HellaSwag, WinoGrande, OpenBookQA, PIQA, MathQA).
- Experimentos de ajuste de bajo rango en hardware limitado: al ser un checkpoint denso estandar, se puede cargar con `transformers` sin codigo de modelado personalizado y aplicar LoRA o QLoRA adicionales para estudiar recuperacion de capacidad tras el truncamiento.
- Servicio de chat autoalojado en entornos de baja criticidad: con 7,24B parametros en formato denso cabe en una GPU de 24 GB en fp16 y puede desplegarse con vLLM o TGI para tareas internas de generacion de texto donde la exactitud no sea critica.
- Generacion de datos sinteticos y destilacion: util como generador o como alumno en experimentos controlados, siempre que se valide la calidad de salida por la advertencia de degeneracion del propio autor.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor. Todas las generaciones usan la plantilla de chat y decodificacion greedy.

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,7998 |
| Perplejidad en WikiText-2 | 8,0363 |
| arc_easy (acc_norm) | 0,7050 |
| arc_challenge (acc_norm) | 0,4616 |
| hellaswag (acc_norm) | 0,7214 |
| winogrande (acc) | 0,6748 |
| openbookqa (acc_norm) | 0,4260 |
| piqa (acc_norm) | 0,7563 |
| mathqa (acc_norm) | 0,3119 |
| AdvBench HarmBench ASR | 0,3269 |
| StrongREJECT HarmBench ASR | 0,3738 |
| Tasa de sobrerrechazo (XSTest-safe) | 0,1124 |
| Tasa de sobrerrechazo (OR-Bench-Hard-1K) | 0,1403 |
| Tasa de sobrerrechazo macro | 0,1264 |

Detalles de evaluacion: perplejidad en WikiText-2; tareas zero-shot en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA; generaciones de ataque en AdvBench y StrongREJECT juzgadas con `cais/HarmBench-Llama-2-13b-cls`; sobrerrechazo en XSTest-safe y OR-Bench-Hard-1K juzgado con `allenai/wildguard`. El autor indica que el juicio de sobrerrechazo es fiable en esta celda (fraccion puntuada de 1,00 en ambos conjuntos). Las salidas por prompt y los ficheros de metricas en bruto estan en las carpetas `utility/` y `safety/` del repositorio.

No se han publicado resultados de benchmarks del modelo base sin comprimir en la informacion disponible, por lo que no es posible cuantificar aqui la perdida atribuible al truncamiento.

## Requisitos de hardware

- VRAM para inferencia en fp16/bf16: aproximadamente 14,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se necesitan del orden de 16-18 GB para contexto corto y mas con contextos largos.
- VRAM con cuantizacion posterior a 8 bits: alrededor de 8-9 GB, viable en GPUs de 12-16 GB.
- VRAM con cuantizacion posterior a 4 bits (bitsandbytes o GPTQ/AWQ generados por el usuario): alrededor de 4-5 GB, viable en GPUs de 8 GB.
- GPUs profesionales recomendadas: A100 40/80 GB, H100, L40S o A6000; sobredimensionadas para 7B, pero adecuadas si se sirven muchas replicas o contextos muy largos.
- GPUs de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) ejecutan el modelo en fp16 con holgura; RTX 4080/4070 Ti (16 GB) quedan justas en fp16 y comodas en 8 bits; RTX 3060 12 GB y RTX 4060 Ti 16 GB requieren 8 bits o 4 bits.
- Opciones de despliegue: vLLM, TGI y cualquier runtime compatible con `transformers` cargan el checkpoint directamente porque los pesos estan plegados a formas densas estandar y no requieren codigo de modelado propio. Ollama y llama.cpp exigen convertir previamente los safetensors a GGUF, tarea que el repositorio no incluye.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Nota de almacenamiento: el checkpoint es rango-deficiente, no mas pequeno. Ocupa lo mismo que el modelo base (14,5 GB de repositorio), por lo que la compresion no reduce requisitos de disco ni de ancho de banda de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Este checkpoint (JSON: Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p80) | 7.241.732.096 densos, rango efectivo 0,7998 | 32.768 tokens heredados del base | apache-2.0 | safetensors | Perplejidad WikiText-2 8,0363; hellaswag 0,7214; piqa 0,7563; ASR AdvBench 0,3269 |
| mistralai/Mistral-7B-Instruct-v0.2 (base sin comprimir) | 7.241.732.096 | 32.768 tokens | apache-2.0 | safetensors | no disponible en la informacion proporcionada |
| Otras compresiones SVD-LLM de Mistral 7B con distinta fraccion retenida | 7.241.732.096 densos (rango variable) | 32.768 tokens | apache-2.0 | safetensors | no disponible en la informacion proporcionada |

No se dispone en la informacion proporcionada de resultados numericos del modelo base sin comprimir ni de otros checkpoints comprimidos comparables, por lo que la comparacion cuantitativa de rendimiento no puede completarse. La comparacion cualitativa relevante es que este checkpoint mantiene el mismo numero de parametros almacenados y el mismo coste de inferencia que el base, pero opera con un 20 % menos de rango efectivo.

## Limitaciones y advertencias

- El propio autor advierte que la compresion a este ratio puede degradar la calidad de generacion y que las metricas de seguridad de un modelo degenerado no son evidencia sobre alineamiento. Hay que leer las columnas de sobrerrechazo y seguimiento de instrucciones junto al ASR antes de extraer conclusiones de comportamiento.
- Riesgo elevado de alucinacion y de respuestas incoherentes en generaciones largas o con contexto amplio, derivado del truncamiento de rango y no cuantificado en la model card.
- El ASR de 0,3269 en AdvBench y 0,3738 en StrongREJECT indican que una fraccion significativa de peticiones daninas no se rechaza; no debe usarse como modelo con garantias de seguridad.
- Las tasas de sobrerrechazo (0,1264 macro) indican que tambien rechaza en exceso peticiones benignas, lo que afecta a la utilidad en tareas de asistencia.
- Sesgos conocidos: no documentados especificamente para este checkpoint. Hereda los sesgos de Mistral-7B-Instruct-v0.2 y los de `yahma/alpaca-cleaned`, que no se analizan en la model card.
- Limitaciones de idioma: no se declara ningun idioma soportado. El modelo base esta orientado al ingles, por lo que el rendimiento en castellano no esta garantizado ni medido.
- Limitaciones de contexto: no se ha verificado que el truncamiento preserve el comportamiento con contextos largos; los benchmarks publicados usan prompts cortos.
- La compresion no reduce el uso de memoria ni de disco: el checkpoint es rango-deficiente, no mas pequeno. No hay ganancia de eficiencia frente al modelo base.
- Licencia apache-2.0, que permite uso comercial, pero el estado del artefacto (8 descargas, 0 likes, fecha de creacion muy reciente y advertencia explicita de degeneracion) desaconseja su uso en produccion sin una validacion exhaustiva propia.
- El modelo requiere un parche en el codigo de SVD-LLM si se quiere reentrenar o reproducir el pipeline; el checkpoint publicado en si carga con `transformers` estandar.
- No se publican mediciones de latencia, throughput ni consumo energetico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p80
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Repositorio de SVD-LLM: https://github.com/AIoT-MLSys-Lab/SVD-LLM (commit 7538cca98880)
- Dataset de ajuste LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset de calibracion del blanqueado: WikiText-2 (256 secuencias de 2048 tokens, semilla 3)
- Clasificador empleado para el juicio de ataques: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Clasificador empleado para el juicio de sobrerrechazo: https://huggingface.co/allenai/wildguard
- No se han encontrado otros enlaces relevantes en la busqueda web realizada; los resultados devueltos no guardan relacion con este modelo.
