# Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p60

## Resumen

Este modelo es una versión comprimida de mistralai/Mistral-7B-Instruct-v0.2 mediante el método completo SVD-LLM, publicada por el usuario Jeesup bajo licencia Apache-2.0. La compresión elimina el 40% de los parámetros (se conserva el 60%, con una fracción realizada de 0,5997971754807693) a través de un pipeline de blanqueado de datos, truncado SVD de bajo rango y ajuste posterior con LoRA sobre los factores U y V, que finalmente se pliegan a las formas densas originales de Mistral.

El resultado es un checkpoint denso y deficiente en rango (rank-deficient) que se carga con `transformers` estándar sin código de modelado a medida. Su interés principal es el estudio de seguridad: el identificador `svd-safety` y las métricas incluidas en la model card (ASR de AdvBench y StrongREJECT, tasas de sobrerrechazo) apuntan a que se publica para analizar cómo afecta la compresión de bajo rango al alineamiento de un modelo instruct.

El modelo mantiene el tamaño nominal del modelo base (7.241.732.096 parámetros en safetensors, 14,5 GB de repositorio), pero no reduce el espacio en disco ni la huella de memoria: las matrices comprimidas conservan dimensiones densas. Con 12 descargas y 0 likes, su adopción y validación comunitaria son todavía muy limitadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2); no detallada de forma explícita en la ficha |
| Parámetros totales | 7.241.732.096 (recuento real en safetensors); rango efectivo del 60% tras el truncado SVD |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la ficha del autor (el modelo base Mistral-7B-Instruct-v0.2 trabaja con 32.768 tokens) |
| Tipos de cuantización | No disponible (no se publican artefactos cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (factores plegados a formas densas de Mistral, W = U @ V) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.2 |
| Tamaño del repositorio | 14,5 GB |
| Pipeline declarado en HuggingFace | No disponible |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

La compresión sigue el método SVD-LLM de AIoT-MLSys-Lab (commit `7538cca98880`): se calcula el blanqueado de datos (data whitening) con 256 secuencias de WikiText-2 de 2048 tokens y semilla 3, se aplica un truncado SVD que descarta el 40% de los parámetros, se ajusta un LoRA de rango r=8 sobre los factores U (2 épocas, lr 0,0001, batch 64, sobre `yahma/alpaca-cleaned`), se fusiona, se repite el mismo ajuste LoRA sobre los factores V, se fusiona de nuevo y, por último, se pliegan los factores a formas densas de Mistral. No se documenta RLHF ni DPO en el proceso de compresión; el único ajuste adicional es el SFT con LoRA descrito.

El autor introduce un parche sobre `component/svd_mistral.py` (sha256 `b8c277613b72`): la clase `SVD_MistralAttention` de origen calculaba el rango de las matrices k/v con la fórmula de matriz cuadrada `int(hidden * ratio / 2)`, mientras que `whitening()` deriva el rango real de las formas mediante `int(kv*hidden*r / (kv+hidden))`. Los pesos eran correctos, pero `nn.Linear.in_features` quedaba obsoleto y PEFT construía los adaptadores LoRA sobre esa dimensión, haciendo fallar la etapa LoRA. El parche declara el rango que `whitening()` escribe realmente e incorpora un recorte de máscara causal para `transformers >= 4.43`. La aritmética del truncado no cambia: solo difieren las formas declaradas por el módulo. Al plegar los factores a formas densas, no se necesita código personalizado para la inferencia.

## Capacidades

- Generación de texto y seguimiento de instrucciones, heredados del modelo base instruct, usando la plantilla de chat correspondiente.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple: evaluado en ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA y PIQA.
- Razonamiento matemático básico: evaluado en MathQA (acc_norm 0.2683).
- Modelado de lenguaje medido por perplejidad en WikiText-2 (10,3317).
- Generación sometida a evaluación de seguridad: resistencia a ataques de jailbreak medida con AdvBench y StrongREJECT, y tasas de sobrerrechazo en XSTest-safe y OR-Bench-Hard-1K.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles; el valor del artefacto es como objeto de estudio de compresión y seguridad, no como modelo de propósito general.

## Casos de uso

- Investigación sobre compresión low-rank: comparar el truncado SVD al 60% con otras técnicas (cuantización GPTQ/AWQ, poda tipo Wanda o SparseGPT) midiendo el impacto en perplejidad y en tareas de opción múltiple.
- Red teaming y evaluación de seguridad: emplear el modelo como línea base comprimida para medir ASR de jailbreak (AdvBench 0.7115, StrongREJECT 0.6294) y estudiar si la compresión degrada el alineamiento.
- Reproducción de experimentos: la ficha incluye ficheros de métricas y salidas por prompt en `utility/` y `safety/`, lo que permite replicar la evaluación con los mismos jueces (`cais/HarmBench-Llama-2-13b-cls` y `allenai/wildguard`).
- Estudio del sobrerrechazo: analizar la tasa de rechazo indebido (0,0501 macro) como indicador de calibración de un modelo comprimido frente a su versión densa.
- Punto de partida para ajuste adicional: al cargarse con `transformers` estándar, sirve como base para un SFT o LoRA posteriores cuando se quiera partir de un checkpoint de rango reducido.
- Docencia y divulgación técnica: ejemplo reproducible de un pipeline completo de compresión (blanqueado, SVD, LoRA y plegado a denso) con métricas públicas.
- Inferencia en equipos con VRAM limitada: con cuantización de 4 u 8 bits podría ejecutarse en GPU de consumo, pero con la advertencia de que el autor señala posible degradación de la calidad y de la seguridad; no se recomienda para asistentes en producción.

## Benchmarks y rendimiento

Evaluación declarada por el autor: perplejidad en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; AdvBench y StrongREJECT juzgados por `cais/HarmBench-Llama-2-13b-cls`; sobrerrechazo en XSTest-safe y OR-Bench-Hard-1K juzgado por `allenai/wildguard`. Toda la generación usa la plantilla de chat y decodificación greedy.

| Métrica | Valor |
|---|---:|
| Fracción de parámetros retenida | 0,5998 |
| Perplejidad en WikiText-2 | 10,3317 |
| arc_easy (acc_norm) | 0,6069 |
| arc_challenge (acc_norm) | 0,3788 |
| hellaswag (acc_norm) | 0,6050 |
| winogrande (acc) | 0,6369 |
| openbookqa (acc_norm) | 0,4060 |
| piqa (acc_norm) | 0,7111 |
| mathqa (acc_norm) | 0,2683 |
| AdvBench HarmBench ASR | 0,7115 |
| StrongREJECT HarmBench ASR | 0,6294 |
| Sobrerrechazo en XSTest-safe | 0,0645 |
| Sobrerrechazo en OR-Bench-Hard-1K | 0,0357 |
| Sobrerrechazo macro | 0,0501 |

La ficha no incluye los resultados del modelo base sin comprimir, por lo que no es posible cuantificar la pérdida atribuible al truncado. El autor indica que el juicio de sobrerrechazo es fiable en esta celda (fracción puntuada de 0,99 en XSTest-safe y 1,00 en OR-Bench-Hard-1K). Los valores de ASR son elevados: cuanto mayor es la cifra, más permeable es el modelo a los ataques.

## Requisitos de hardware

- VRAM para inferencia con pesos bf16/fp16: aproximadamente 14,5 GB solo en pesos (7,24e9 parámetros × 2 bytes), más caché KV y activaciones.
- Cuantización estimada: ~7,2 GB en 8 bits y ~3,6-4 GB en 4 bits (estimación teórica; el autor no publica artefactos cuantizados).
- GPU recomendadas para servicio: A100 40 GB, A100 80 GB, H100 80 GB y equivalentes.
- Cabe en GPU de consumo de 24 GB (RTX 4090, RTX 3090) en bf16 con contexto moderado.
- GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB): requiere cuantización de 8 bits.
- GPU de 12 GB (RTX 3060 12 GB): requiere cuantización de 4 bits.
- Despliegue: al ser un checkpoint denso con formas estándar de Mistral, es compatible con `transformers` de serie, y previsiblemente con vLLM, TGI, SGLang o llama.cpp/Ollama (previo paso a GGUF); ninguna de estas integraciones está verificada por el autor.
- La compresión no aporta ahorro de disco ni de VRAM: el checkpoint ocupa 14,5 GB y tiene el recuento de parámetros completo, solo con rango reducido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato de pesos | Benchmarks |
|---|---|---|---|---|---|
| Este modelo (SVD-LLM, keep 0,60) | 7.241.732.096 (rango efectivo 60%) | No disponible en la ficha | apache-2.0 | safetensors (denso, deficiente en rango) | Ver tabla de benchmarks |
| mistralai/Mistral-7B-Instruct-v0.2 (base) | 7.241.732.096 | 32.768 tokens según el modelo base | apache-2.0 | safetensors | No disponible en la información proporcionada |
| Otras compresiones de Mistral-7B (SVD-LLM, Wanda, SparseGPT, GPTQ/AWQ) | Variable | No disponible | Variable (habitualmente apache-2.0) | safetensors y GGUF | No disponible en la información proporcionada |

Sin las métricas del modelo base sin comprimir no es posible establecer cuánta calidad se pierde con el truncado al 60% ni comparar esta variante con otras técnicas de compresión de la misma familia. La comparación cuantitativa queda, por tanto, pendiente de datos adicionales.

## Limitaciones y advertencias

- Seguridad degradada: el ASR es de 0,7115 en AdvBench y 0,6294 en StrongREJECT, valores altos que indican una elevada facilidad para el jailbreak. No es adecuado como asistente orientado a seguridad ni en producción expuesta a usuarios.
- Advertencia explícita del autor: la compresión a este ratio puede degradar la calidad de generación, y los números de seguridad de un modelo degenerado no constituyen evidencia sobre alineamiento; hay que leer el sobrerrechazo y el seguimiento de instrucciones junto al ASR antes de extraer conclusiones de comportamiento.
- Perplejidad de 10,3317 en WikiText-2 sin referencia del modelo base en la ficha, lo que impide juzgar la magnitud de la degradación.
- El modelo es deficiente en rango, pero no más pequeño en disco ni en memoria: no aporta ventajas de despliegue frente al Mistral-7B denso.
- Idiomas soportados no documentados; se desconoce el comportamiento fuera del inglés de las evaluaciones.
- Contexto no declarado en la ficha del autor; el valor heredado del modelo base debería verificarse antes de usarlo.
- Licencia apache-2.0, que permite uso comercial, pero las limitaciones de calidad y el riesgo de seguridad desaconsejan ese uso en sistemas reales.
- Adopción mínima (12 descargas, 0 likes): sin validación independiente de los resultados publicados.
- Reproducibilidad: el checkpoint se generó con un parche propio sobre el código de SVD-LLM (sha256 `b8c277613b72`); conviene conservarlo para replicar el pipeline exacto.
- El pipeline de HuggingFace no está declarado, por lo que algunas herramientas de descubrimiento pueden no clasificarlo correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mistral_7b_instruct_v02_up_svdllm_finetuned_keep_0p60
- Repositorio de SVD-LLM (AIoT-MLSys-Lab): https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Dataset de ajuste LoRA: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Juez de seguridad HarmBench (Llama-2-13b-cls): https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobrerrechazo WildGuard: https://huggingface.co/allenai/wildguard
- Resultados crudos y salidas por prompt: carpetas `utility/` y `safety/` dentro del repositorio del modelo
- Búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a hilos de foro sin relación con el modelo.
