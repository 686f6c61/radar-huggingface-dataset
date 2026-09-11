# arianraje/qwen3-4b-mamba3-hybrid-stage2b-kd-bias0

## Resumen

`qwen3-4b-mamba3-hybrid-stage2b-kd-bias0` es un punto de control experimental publicado en HuggingFace por el usuario `arianraje`. Se trata de `Qwen/Qwen3-4B` convertido en un modelo híbrido: de las 36 capas del transformer original, 27 sustituyen su atención por un mezclador Mamba-3 MIMO (modelo de espacio de estados con rango MIMO 4) y las 9 restantes (índices 3, 7, 11 ... 35, el patrón denominado `u4`) conservan atención completa como `Qwen3DecoderLayer`, de forma bit-exacta. El resultado son 4.741.428.416 parámetros, de los cuales 1.426.756.032 (30,1%) corresponden a los 27 mezcladores.

La capacidad se recupera mediante destilación por etapas desde el profesor `Qwen/Qwen3-4B`, no mediante preentrenamiento: cirugía e inicialización heredada, alineación de estados ocultos por capa (etapa 1, 100 M de tokens), destilación KL forward a 4k (etapa 2a, 600 M de tokens) y destilación KL de contexto largo a 32.768 tokens (etapa 2b, 294 M de tokens, 141 pasos con microbatch 1, 4 rangos y 16 de acumulación, sobre 4x B200). Este repositorio corresponde al brazo «bias 0» del experimento, es decir, con los sesgos de B/C inicializados a cero en lugar de al valor 1,0 que usa el código original.

El interés del modelo es de investigación: forma parte de un estudio controlado que compara tres familias de mezclador (Mamba-3, Gated DeltaNet y Mamba2) con el mismo profesor, los mismos datos empaquetados, los mismos presupuestos de tokens y los mismos calendarios de aprendizaje. En la etapa 2b este brazo alcanza un KL de validación de 0,2021, un acuerdo top-1 de 0,8056 y una perplejidad wikitext-2 de 11,93 a contexto 4096. No hay evaluación downstream publicada y la etapa 3 (destilación on-policy) todavía no se ha ejecutado, por lo que se trata de material de estudio, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer-SSM: 36 capas, 27 con mezclador Mamba-3 MIMO y 9 con atención completa Qwen3DecoderLayer (patrón `u4`, índices 3, 7, 11 ... 35) |
| Parametros totales | 4.741.428.416 (1.426.756.032 en los 27 mezcladores, 30,1%) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Entrenamiento de destilación a 32.768 tokens (etapa 2b); longitud máxima soportada en inferencia no documentada |
| Tipos de cuantizacion | No disponible (el autor no publica pesos cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con código de modelado propio incluido en el repositorio (`modeling_qwen3_mamba3.py`, `model_type: qwen3_mamba3`); requiere `trust_remote_code=True` |

Otros datos de interés: tamaño del repositorio 9,5 GB, pipeline `text-generation`, etiquetas `custom_code`, `linear-attention`, `mamba3`, `ssm`, `hybrid`, `distillation`. Sin descargas ni valoraciones en el momento de la consulta.

## Arquitectura y entrenamiento

La geometría del mezclador es la del kernel upstream sin modificaciones: 32 cabezas de dimensión 128, 8 grupos B/C, `d_state` 128, rango MIMO 4, `expand` 1,6, `chunk` 8, RoPE sobre la mitad de las dimensiones de estado y la RMSNorm agrupada de pre-puerta fusionada dentro del kernel. La disposición de parámetros y la matemática son exactamente las de upstream (`in_proj` con filas `[z | x | B | C | dd_dt | dd_A | trap | angles]`, B/C en orden `(r g n)`), de modo que se invoca el kernel original tal cual. Los mezcladores llaman a `mamba_ssm.ops.tilelang.mamba3.mamba3_mimo` del repositorio `state-spaces/mamba` en el commit `e9594ce` (TileLang + Triton); la versión de pip `mamba_ssm 2.2.6.post3` es anterior a Mamba-3, por lo que hay que instalar desde el código fuente. Si ese import falla, el modelo avisa una vez y cada mezclador ejecuta `mamba3_mimo_reference`, una transcripción secuencial en fp32 de la semántica del kernel, numéricamente equivalente (error relativo forward de 6e-3 frente al kernel en bf16) pero lenta, útil para comprobar paridad de decodificación y no para producción.

La inicialización es heredada en un 99,95%: el mezclador arranca como la cabeza de atención del profesor, no como un SSM aleatorio. Por cada capa convertida, la cabeza `x` h toma `v_proj` cabeza `h // 4`; `B[r, g]` toma `k_proj` cabeza g; `C[r, g]` toma `q_proj` cabeza `4g + r`; `out_proj` toma `o_proj`; y `C_norm` / `B_norm` toman `q_norm` / `k_norm`. Las filas `dd_dt`, `dd_A`, trapecio y ángulo de `in_proj` se inicializan a cero (dt constante por cabeza, `A = -1`, trapecio 1/2, sin rotación) manteniendo gradiente. `dt_bias` es la inversa de softplus de `exp(U(log 1e-3, log 1e-1))`, con horizontes de 10 a 1000 tokens. `mimo_x` es un simplex aleatorio sobre rangos por (cabeza, dimensión) para que cada rango reciba gradientes distintos manteniendo el estado inicial uniforme 1/R de upstream. En la inicialización, una cabeza convertida equivale a la cabeza del profesor con la softmax sustituida por decaimiento causal (verificado con error 3e-8). El sesgo de B/C a 0,0 es lo que distingue a este brazo: con un sesgo de 1,0 sobre una cabeza heredada se añadiría `sum(q) + sum(k) + 128` a cada puntuación, lo que el autor sospechaba que enmascararía la estructura del profesor. Las mediciones posteriores mostraron lo contrario: el brazo con sesgo 1,0 fue superior en todas las evaluaciones de las etapas 1 y 2a, y ahora es el valor por defecto.

El régimen de entrenamiento de la etapa 2b parte del punto final de la etapa 2a del mismo brazo, con la tasa de aprendizaje reducida a la mitad (mezcladores 1e-4, pesos heredados 1e-5), decaimiento coseno hasta 0,1x y un 3% de calentamiento, entrenando todos los pesos. Hubo además un problema conocido en el backward de `mamba3_mimo.py` del commit `e9594ce`: lee `ctx.saved_tensors` dos veces y el checkpointing de activaciones no reintrante de PyTorch (`use_reentrant=False`, el valor por defecto de HuggingFace) lo rechaza con `CheckpointError: Unpack is being triggered for a tensor that was already unpacked once`. La solución es un cambio de una línea (leerlo una sola vez); los entrenamientos descritos usaron un commit local con esa corrección. La inferencia no se ve afectada.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`), en principio heredada del profesor Qwen3-4B mediante destilación, aunque sin evaluación downstream que lo confirme.
- Modelado de lenguaje autorregresivo con contexto entrenado de 32.768 tokens, gracias a los 9 bloques de atención completa retenidos y a los 27 mezcladores lineales.
- Razonamiento y conocimiento general: no verificados. El autor indica explícitamente que no existe batería downstream (sentido común, RULER, etc.).
- Soporte de `tool calling` / `function calling`: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Modo de pensamiento (`thinking`): no disponible en la documentación, aunque el profesor Qwen3-4B lo incorpora.
- Visión o audio: no soportados; el modelo es exclusivamente de texto.
- Capacidad especial: es un banco de pruebas de inferencia híbrida, con dos rutas de ejecución (kernel MIMO fusionado o referencia secuencial en fp32) y conmutable mediante `Qwen3Mamba3Mixer.force_reference = True`.

## Casos de uso

- Investigación en arquitecturas híbridas SSM-atención: permite medir el coste en calidad de sustituir 27 de 36 capas de atención por un mezclador Mamba-3 MIMO, con todos los hiperparámetros documentados y comparables contra los brazos Gated DeltaNet y Mamba2 del mismo estudio.
- Destilación on-policy como etapa 3: este punto de control está declarado como entrada de la etapa 3, todavía no ejecutada, de modo que sirve como punto de partida reproducible para quien quiera continuar la cadena de destilación.
- Validación de kernels de Mamba-3: la ruta `mamba3_mimo_reference` (fp32 secuencial, error relativo 6e-3 frente al kernel en bf16) permite comprobar paridad numérica entre implementaciones antes de desplegar el kernel fusionado.
- Experimentos de decodificación en contexto largo: con ventanas de hasta 32.768 tokens, el modelo es útil para estudiar el comportamiento de la decodificación cuando solo una cuarta parte de las capas mantiene atención cuadrática.
- Estudio de esquemas de inicialización heredada: la fracción heredada del 99,95% y el mapeo explícito entre proyecciones de atención y parámetros del SSM permiten analizar cómo afecta la inicialización a la convergencia de la destilación.
- Comparación de familias de mezclador bajo presupuesto fijo: los tres brazos comparten profesor, datos, presupuestos de tokens y calendarios, por lo que cualquier diferencia medida en KL, acuerdo top-1 o perplejidad es atribuible al mezclador.
- Fine-tuning y ajuste supervisado experimental: al ser un contenedor `transformers` con licencia Apache 2.0, se puede reentrenar o ajustar con recetas estándar, siempre que se asuma el coste de mantener el código propio y el kernel.
- Análisis de eficiencia memoria-tiempo: la arquitectura permite comparar, en el mismo modelo, el consumo de las capas lineales frente al de las capas de atención completa en función de la longitud de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks downstream (MMLU, HumanEval, GSM8K, RULER, sentido común) en la información disponible. La model card indica explícitamente que no hay evaluación de ese tipo. Los únicos números publicados son métricas del entrenador frente al profesor Qwen3-4B sobre texto empaquetado de validación, más la perplejidad en wikitext-2 a contexto 4096:

| Etapa | Metrica | bias 0 (este modelo) | Qwen GDN (dtfix) | Qwen Mamba2 (dtfix) |
|---|---|---|---|---|
| Etapa 2b (32k) | KL forward de validacion | 0,2021 | 0,2177 | 0,2336 |
| Etapa 2b (32k) | Acuerdo top-1 | 0,8056 | 0,7985 | 0,7875 |
| Etapa 2b (32k) | PPL wikitext-2 (4096) | 11,93 | no disponible | no disponible |
| Etapa 2a (4k) | KL / top-1 / PPL | 0,1297 / 0,8580 / 12,49 | 0,1437 / 0,8515 / 12,83 | 0,1819 / 0,8295 / 12,60 |
| Etapa 1 | rel-MSE medio / peor capa / PPL | 0,00397 / L0 0,0371 / 26,54 | 0,0208 / no disponible / no disponible | 0,0175 / no disponible / no disponible |

Para el brazo con sesgo 1,0 (el que ahora es predeterminado) las cifras publicadas en las etapas 1 y 2a son: etapa 1 con rel-MSE 0,00376, peor capa L0 0,0357 y PPL 25,35; etapa 2a con KL 0,1258, top-1 0,8601 y PPL 12,41. La etapa 2b del brazo con sesgo 1,0 estaba en curso en el momento de la publicación. Como contexto adicional del estudio: Mamba-3 entra en la etapa 2a con KL 0,50 (Mamba2 lo hace con 1,08) y supera el KL final de Mamba2 en el paso 20 de 287.

## Requisitos de hardware

- Entrenamiento: los runs descritos se ejecutaron sobre 4x B200, con microbatch 1, 4 rangos y 16 pasos de acumulación (2.097.152 tokens por paso).
- VRAM de inferencia en bf16: aproximadamente 9,5 GB solo para pesos (4.741.428.416 parámetros a 2 bytes), más activaciones y la caché KV de las 9 capas de atención completa. Estimación derivada del recuento de parámetros; el autor no publica cifras de VRAM.
- Estimaciones teóricas de cuantización (no confirmadas, no se publican pesos cuantizados): en torno a 4,7 GB en int8 y 2,4 GB en int4. La viabilidad práctica es dudosa, porque el mezclador depende de un kernel propio y de código de modelado personalizado.
- GPU recomendadas: para bf16, una GPU de 24 GB o más (RTX 4090, L40S, A100 40 GB, H100). Con las 9 capas de atención a 32k de contexto, la caché KV crece con la longitud de secuencia, de modo que contextos muy largos exigen más memoria que la indicada por el peso de los parámetros.
- ¿Cabe en GPU de consumo? En bf16 probablemente sí en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado; no hay confirmación del autor ni pruebas publicadas.
- Opciones de despliegue: la única ruta documentada es `transformers` con `trust_remote_code=True` y el kernel de `state-spaces/mamba` en el commit `e9594ce` instalado desde el código fuente. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, y la combinación de `model_type` propio más kernel TileLang/Triton hace improbable un soporte inmediato.
- Latencia y throughput: no disponibles. La model card solo advierte de que la ruta de referencia es «lenta» y no apta para throughput, sin dar cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KL validacion (32k) | Top-1 (32k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Mamba-3, bias 0) | 4.741.428.416 | Entrenado a 32.768 | 0,2021 | 0,8056 | Apache 2.0 | Pesos safetensors + codigo propio |
| Qwen3-4B Mamba-3 (brazo bias 1) | No disponible | Entrenado a 32.768 | En curso | En curso | Apache 2.0 | Publicado por el mismo autor |
| Qwen Gated DeltaNet (dtfix) | No disponible | Entrenado a 32.768 | 0,2177 | 0,7985 | No disponible | Brazo del mismo estudio |
| Qwen Mamba2 (dtfix) | No disponible | Entrenado a 32.768 | 0,2336 | 0,7875 | No disponible | Brazo del mismo estudio |
| Qwen/Qwen3-4B (profesor) | No disponible en la informacion | No disponible en la informacion | Referencia (KL 0 por definicion) | Referencia | Apache 2.0 | Modelo publico de Alibaba Qwen |

La comparación más informativa es interna al estudio: los tres brazos comparten profesor, datos y presupuestos, por lo que las diferencias de KL (0,2021 frente a 0,2177 y 0,2336) son atribuibles al mezclador. La model card destaca que Mamba-3 parte de un KL mucho mejor en la etapa 2a (0,50 frente a 1,08 de Mamba2) y que supera el KL final de Mamba2 en 20 de 287 pasos.

## Limitaciones y advertencias

- Ausencia total de evaluación downstream: no hay resultados de sentido común, RULER ni ninguna batería estándar, por lo que no se puede afirmar que las capacidades del profesor se hayan conservado más allá de las métricas de destilación.
- Proceso de destilación incompleto: la etapa 3 (destilación on-policy), declarada como siguiente paso, no se ha ejecutado.
- Este brazo concreto (sesgo 0) quedó por detrás del brazo con sesgo 1,0 en todas las evaluaciones de las etapas 1 y 2a, y el autor ha adoptado el sesgo 1,0 como valor predeterminado. Es, por tanto, la variante menos recomendada de las dos publicadas.
- Riesgo de alucinación: no medido. Al derivar de Qwen3-4B, hereda los sesgos y el comportamiento del profesor en la medida en que la destilación los reproduzca, algo que no se ha verificado.
- Idiomas: no se declara ninguna lista de idiomas soportados; el comportamiento multilingüe es desconocido y no está evaluado.
- Contexto: aunque el entrenamiento de la etapa 2b usa 32.768 tokens, no se documenta la longitud máxima admitida en inferencia ni cómo se degrada el modelo más allá de esa ventana.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_qwen3_mamba3.py` antes de usarlo en entornos controlados.
- Dependencia del kernel: hay que instalar `mamba_ssm` desde el código fuente en el commit `e9594ce` (TileLang + Triton). La versión de pip es anterior a Mamba-3. Sin el kernel, el modelo cae en una ruta de referencia en fp32 secuencial, numéricamente equivalente pero no apta para producción.
- Error conocido en el backward del kernel en ese commit (doble lectura de `ctx.saved_tensors`) que rompe el checkpointing de activaciones no reintrante; afecta al reentrenamiento, no a la inferencia.
- Sin cuantizaciones publicadas ni soporte documentado en runtimes de inferencia optimizados (vLLM, TGI, llama.cpp, Ollama), lo que limita el despliegue real.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene revisar por separado la licencia del repositorio `state-stances/mamba` y de las dependencias del kernel.
- Madurez: cero descargas y cero valoraciones en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianraje/qwen3-4b-mamba3-hybrid-stage2b-kd-bias0
- Modelo base (profesor): https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del kernel Mamba-3 (commit `e9594ce`): https://github.com/state-spaces/mamba
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los únicos resultados fueron páginas de Wikipedia sin relación con el contenido de la ficha.
