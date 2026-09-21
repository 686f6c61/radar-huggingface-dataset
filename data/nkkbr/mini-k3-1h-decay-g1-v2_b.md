# nkkbr/Mini-K3-1H-decay-g1-v2_B

## Resumen

Mini-K3-1H-decay-g1-v2_B es un checkpoint de preentrenamiento de tipo *text-only* publicado por el usuario nkkbr en HuggingFace, con 1.015.011.160 parámetros lógicos totales y 351.786.840 parámetros activos por token. No es un modelo de propósito general ni un asistente: forma parte de una comparación controlada de 20 arquitecturas que reproduce, a escala reducida (aproximadamente mil millones de parámetros lógicos), los operadores del Kimi-K3: KDA (atención lineal con decay), Gated MLA, bloques *Attention Residual*, Stable LatentMoE, activaciones SiTU, *output gates* y *Quantile Balancing*. La arquitectura concreta de este repositorio es de 13 capas decoder, 9 de ellas KDA y 4 Gated MLA, con ancho oculto 1024 y 12 cabezas de atención.

El checkpoint contiene 1.000.079.360 tokens válidos consumidos tras 1.526 pasos de optimizador, con longitud de secuencia de 8.192 tokens, sobre un objetivo total de 16.000.000.000 tokens para el run completo. El modelo se distribuye en safetensors en BF16, con el código de modelado y configuración incluidos para que el paquete sea autocontenido, sin dependencia del *checkout* de entrenamiento original.

Su relevancia es exclusivamente investigadora: permite estudiar a bajo coste decisiones de arquitectura (proporción KDA/MLA, granularidad del decay, longitud de convolución, codificación posicional) antes de extrapolarlas a Kimi-K3 completo, y sirve como banco de pruebas para recetas de optimización como Muon por cabeza, QK-Clip y cuantización por cuantiles. No ha recibido *post-training*, no se ha evaluado en tareas *downstream* y no debe tratarse como modelo instruccional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer híbrido: 13 capas (9 KDA de atención lineal + 4 Gated MLA), bloques Attention Residual, Stable LatentMoE, activaciones SiTU y output gates |
| Parametros totales | 1.015.011.160 (aproximadamente 1,02 B) |
| Parametros activos | 351.786.840 por token (aproximadamente 352 M) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento; no se declara ventana de inferencia distinta) |
| Tipos de cuantizacion | no disponible (pesos en BF16, con estados KDA decay, convolución, normalización y control del router en FP32; no se publican GGUF, AWQ, GPTQ ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) con código propio de modelado (modeling_mini_k3.py, configuration_mini_k3.py); repositorio de 6,1 GB |
| Capas decoder | 13; índices KDA [1, 2, 3, 5, 6, 7, 9, 10, 11], índices Gated MLA [4, 8, 12, 13] |
| Ancho oculto / cabezas de atención / ancho de cabeza KDA | 1024 / 12 / 128 |
| Convolución causal depthwise de KDA (kernel) | 4 |
| Grupos de decay por cabeza (KDA) | 1 (contiguo) |
| Modo posicional de MLA | NoPE |
| Capas densas antes del MoE | 1 |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Ancho oculto del experto enrutado | 512 |
| Tamano de bloque de Attention Residual | 4 |
| Vocabulario / BOS / EOS de generación / PAD | 163840 / 163584 / 163586 / 163839 |
| Revision del checkpoint | checkpoint-tokens-001000079360 (tags de Git inmutables; main apunta al más reciente) |
| Tokens de entrenamiento consumidos | 1.000.079.360; objetivo final del run: 16.000.000.000 |
| Pasos de optimizador completados | 1.526 |
| Precision | BF16 en pesos; FP32 en decay y convolución de KDA, normalización y estado de control del router |
| Estado del optimizador | deliberadamente no publicado |

## Arquitectura y entrenamiento

La arquitectura es un decoder de 13 capas que combina dos mecanismos de atención: KDA, una atención lineal con decay aplicada en 9 capas, y Gated MLA (multi-head latent attention con puerta de salida) en 4 capas. Cada cabeza KDA tiene ancho 128 y una convolución causal *depthwise* de kernel 4, con un único grupo de decay contiguo por cabeza; el MLA usa modo posicional NoPE (sin codificación posicional explícita). El bloque MoE es un Stable LatentMoE con 64 expertos enrutados, 2 compartidos y top-k 4, con ancho oculto de experto 512, precedido por una capa densa. Se añaden bloques *Attention Residual* de tamaño 4, activaciones SiTU, *output gates* y *Quantile Balancing*. El vocabulario es de 163.840 entradas.

El entrenamiento usa Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices y AdamW como respaldo para vectores y embeddings, con *weight decay* 0,1, QK-Clip por cabeza, decaimiento coseno, 1 % de *warmup* lineal y *Quantile Balancing* en línea con histogramas de 1.000 bins. El router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. El empaquetado de documentos está fuertemente aislado: el MLA aplica una máscara causal bloqueada por documento y el estado recurrente de KDA, junto con el historial de la convolución corta de Q/K/V, se reinicia en cada frontera de segmento. Los 20 runs de la comparación parten de inicialización determinista por nombre y forma con semilla base 20260914 y consumen el mismo calendario de mezcla inmutable y *append-only* en el mismo orden, de modo que los parámetros compartidos con igual nombre y forma arrancan idénticos byte a byte.

Este run concreto (decay-group) tuvo que recuperarse: el lanzamiento original se detuvo antes del checkpoint de inicialización porque los layouts de serialización de `dt_bias` diferían entre el formato de entrenamiento y el portátil. El reinicio parte de cero tokens manteniendo orden de datos congelado, semilla, arquitectura y receta de optimizador; el único cambio es la serialización portátil, y los hashes de código y manifiesto acompañan al checkpoint. No se aplicó ningún tipo de *post-training* (ni RLHF ni DPO).

## Capacidades

- Generación de texto y modelado de lenguaje autorregresivo sobre secuencias de hasta 8.192 tokens.
- Capacidad de continuación de texto y estimación de verosimilitud (NLL y perplejidad) útil como banco de pruebas de arquitectura.
- Atención lineal (KDA) en 9 de 13 capas, lo que reduce el coste de estado recurrente frente a atención completa a longitudes largas.
- Atención latente con puerta (Gated MLA) en 4 capas, con modo posicional NoPE.
- Enrutamiento MoE con 64 expertos enrutados y 2 compartidos, top-k 4, que permite analizar balanceo de expertos y comportamiento del router.
- Soporte de *tool calling* / *function calling*: no disponible (no hay *post-training* ni formato de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el autor no declara idiomas soportados).
- Capacidades especiales: no hay modo *thinking*, visión ni audio; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en arquitecturas híbridas de atención: el modelo permite medir el comportamiento de una proporción concreta KDA/MLA (9 frente a 4 capas) con kernel de convolución 4 y decay contiguo, en un régimen de 1 B de parámetros lógicos y 8.192 tokens de secuencia.
- Ablación controlada de arquitectura: al compartir semilla base 20260914 e inicialización determinista por nombre y forma, permite comparar variantes (granularidad de decay, longitud de convolución, codificación posicional, ratio KDA/MLA) aislando el efecto de la inicialización y del orden de datos.
- Validación de operadores de Kimi-K3 a escala proxy: sirve para comprobar que KDA, Gated MLA, Stable LatentMoE, SiTU, *output gates* y *Quantile Balancing* convergen antes de comprometer recursos en el modelo completo.
- Diagnóstico de entrenamiento y balanceo de expertos: las métricas JSONL y de W&B de NLL y perplejidad permiten estudiar curvas de convergencia, saturación del router y comportamiento del *Quantile Balancing* de 1.000 bins.
- Pruebas de portabilidad de checkpoints: el incidente documentado con `dt_bias` convierte a este repositorio en un caso de estudio para verificar serialización entre el formato de entrenamiento y un paquete *standalone* autocontenido.
- Verificación de infraestructura de inferencia: al incluir `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py` y `smoke_test.py`, resulta adecuado para validar carga de safetensors, asignación de memoria y corrección numérica en un stack propio antes de escalar a variantes mayores.
- Estudios de receta de optimizador: permite reproducir y auditar el efecto de Muon por cabeza, AdamW de respaldo, QK-Clip y decaimiento coseno con *warmup* del 1 % en un run pequeño.
- Generación de texto base para *pipelines* de pruebas: útil para validar extremo a extremo un servicio de generación (tokenizador de 163.840 entradas, BOS 163584, EOS 163586, PAD 163839) sin esperar a un modelo instruccional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas *downstream* en la información disponible. El autor indica explícitamente que es un checkpoint intermedio de investigación que aún no se ha evaluado en tareas *downstream*; solo se registran NLL y perplejidad de desarrollo fijo durante el entrenamiento, en W&B y en las métricas JSONL del run, cuyos valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 2,03 GB para 1.015.011.160 parámetros; el repositorio ocupa 6,1 GB en total (incluye código, manifiestos y artefactos asociados).
- VRAM mínima estimada para inferencia en BF16: en torno a 3-5 GB considerando pesos, estado recurrente de KDA y caché de las capas MLA, con secuencia de 8.192 tokens. Estimación orientativa; no se publican mediciones.
- Cuantización: al no haber GGUF, AWQ ni GPTQ publicados, una cuantización a 8 bits (aproximadamente 1,1 GB de pesos) o 4 bits (aproximadamente 0,6 GB) requeriría conversión propia y validación de los estados KDA en FP32.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM debería poder ejecutar el modelo en BF16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para lotes grandes o secuencias máximas son preferibles A100 40/80 GB o H100, aunque el tamaño del modelo no las exige.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM en BF16, y en 6-8 GB si se convierte a 8 bits.
- Opciones de despliegue: no hay soporte declarado para vLLM, TGI, llama.cpp u Ollama. El propio repositorio define el uso local mediante el paquete *standalone* (`modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`), por lo que la ruta esperada es PyTorch con código propio y `trust_remote_code` si se carga vía transformers.
- Latencia y throughput: no disponible. Con 351,8 M de parámetros activos por token, el coste por token es sustancialmente menor que el de un modelo denso de 1 B, pero no se han publicado cifras medidas.

## Comparativa con modelos similares

No hay benchmarks publicados de este checkpoint, por lo que la comparación de rendimiento no puede establecerse. La comparación estructural con modelos densos de tamaño similar es la siguiente (los datos de las alternativas no provienen de la información proporcionada y deben verificarse en sus propias fichas):

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Mini-K3-1H-decay-g1-v2_B | 1,02 B | 352 M (MoE, top-4) | 8.192 tokens (entrenamiento) | no disponible | No publicado |
| Llama 3.2 1B | 1,24 B (denso) | 1,24 B | 128 K | Llama 3.2 Community License | No comparable con datos disponibles |
| Qwen2.5-1.5B | 1,54 B (denso) | 1,54 B | 32 K | Apache 2.0 | No comparable con datos disponibles |
| TinyLlama-1.1B | 1,1 B (denso) | 1,1 B | 2.048 tokens | Apache 2.0 | No comparable con datos disponibles |

Diferencias clave: el modelo de nkkbr es un MoE con atención híbrida (lineal KDA más MLA) y solo 352 M de parámetros activos por token, frente a los modelos densos de la tabla; su ventana de 8.192 tokens es la de entrenamiento y no se declara una ventana de inferencia ampliada; y su licencia no está especificada, lo que impide asumir condiciones de uso comercial equiparables a Apache 2.0.

## Limitaciones y advertencias

- Es un proxy de investigación pequeño, preentrenado únicamente; no debe tratarse como asistente que siga instrucciones.
- No se ha evaluado en tareas *downstream*: no hay métricas de MMLU, HumanEval, GSM8K ni similares.
- Estado de entrenamiento parcial: 1.000.079.360 de 16.000.000.000 tokens objetivo, es decir, aproximadamente el 6,25 % del run planificado.
- Las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas, según advierte el propio autor.
- Los rankings de arquitectura obtenidos a esta escala y con longitud de entrenamiento de 8 K necesitan confirmación antes de extrapolarse a Kimi-K3 completo.
- La licencia no está disponible, por lo que no puede asumirse permiso para uso comercial.
- Los idiomas soportados no están declarados; no hay garantía de cobertura multilingüe.
- No se publica el estado del optimizador ni se ofrece *post-training*, por lo que el modelo no es directamente utilizable en producción conversacional.
- Los datasets de origen conservan sus propias licencias y términos, y no se redistribuyen sus textos en el repositorio.
- El run se reinició desde cero tokens tras un fallo de serialización de `dt_bias`; aunque el autor afirma que solo cambió el formato portátil, cualquier comparación debe apoyarse en los hashes de código y manifiesto incluidos.
- El vocabulario de 163.840 entradas y los tokens especiales (BOS 163584, EOS 163586, PAD 163839) exigen respetar exactamente el tokenizador asociado para obtener resultados válidos.
- No hay soporte declarado en motores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama), lo que añade trabajo de integración y riesgo de discrepancias numéricas.

## Enlaces

- HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g1-v2_B
- Archivos relevantes dentro del repositorio: `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`, `ARCHITECTURE_PACKAGE_README.md`, `ARCHITECTURE.md`, `VARIANT.md`, `config.json`, `model.safetensors`.
- Métricas de entrenamiento: registradas en W&B y en el JSONL del run; no se proporciona la URL en la información disponible.
- Repositorio del experimento (diagnósticos *downstream* y de arquitectura planificados): mencionado por el autor sin enlace en la información disponible.
- Búsqueda web: los resultados devueltos corresponden a páginas de soporte de Microsoft sin relación con el modelo; no se han encontrado enlaces adicionales relevantes (papers, blogs, demos o repos) en la información disponible.
