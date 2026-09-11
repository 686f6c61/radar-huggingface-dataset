# arianraje/qwen3-4b-mamba3-hybrid-stage2b-kd-bias1

## Resumen

qwen3-4b-mamba3-hybrid-stage2b-kd-bias1 es un modelo de lenguaje de 4.741.428.416 parámetros publicado por el usuario arianraje en HuggingFace. Se trata de una conversión experimental del transformer Qwen3-4B a una arquitectura híbrida: 27 de sus 36 capas sustituyen la atención completa por un mixer Mamba-3 MIMO (modelo de espacio de estados), mientras que cada cuarta capa (índices 3, 7, 11 ... 35, el patrón denominado `u4`) conserva la atención completa original de Qwen3 de forma literal y bit a bit. Los 27 mixers suman 1.426.756.032 parámetros, el 30,1 % del total, con geometría de 32 cabezas, `head_dim` 128, 8 grupos B/C, `d_state` 128 y rango MIMO 4.

El modelo no se ha preentrenado desde cero: la capacidad se recupera mediante destilación por etapas usando el propio Qwen3-4B como profesor, con alineamiento de estados ocultos por capa, destilación forward-KL a 4.096 tokens y una fase final de contexto largo a 32.768 tokens. Esta ficha corresponde al punto final de la etapa 2b del brazo «bias 1», con un KL de validación de 0,1957 y un acuerdo top-1 de 0,8089 frente al profesor.

Su interés actual es que forma parte de un estudio comparativo controlado entre tres alternativas de atención lineal (Mamba-3, Gated DeltaNet y Mamba2) que comparten profesor, datos empaquetados, presupuesto de tokens y planificación de learning rate. Aun así, es un checkpoint de investigación: la etapa 3 (destilación on-policy) no se ha ejecutado y no hay evaluación downstream publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer-SSM: 27 de 36 capas con mixer Mamba-3 MIMO (atención lineal / SSM) y 9 capas (índices 3, 7, 11 ... 35, patrón `u4`) con atención completa de Qwen3; `model_type: qwen3_mamba3` con código propio |
| Parametros totales | 4.741.428.416 |
| Parametros activos | No aplica (no es un modelo MoE). Los 27 mixers Mamba-3 suman 1.426.756.032 parámetros (30,1 % del total) |
| Longitud de contexto | 32.768 tokens durante la destilación de la etapa 2b; máximo soportado no especificado en la información disponible |
| Tipos de cuantizacion | no disponible (la carga documentada es en `bfloat16`); no se publican pesos GGUF ni cuantizados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, más código de modelado empaquetado (`modeling_qwen3_mamba3.py`); requiere `trust_remote_code=True` |
| Modelo base | Qwen/Qwen3-4B (profesor de destilación) |
| Tamano del repositorio | 9,5 GB |
| Libreria | transformers |
| Fecha de publicacion | 11 de septiembre de 2026 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido de atención completa y SSM. De las 36 capas, 27 usan un mixer Mamba-3 MIMO con la geometría exacta del kernel upstream: 32 cabezas × 128 de `head_dim`, 8 grupos B/C, `d_state` 128, rango MIMO 4, `expand` 1,6, `chunk` 8, RoPE aplicado a la mitad de las dimensiones de estado y una RMSNorm agrupada pre-`gate` fusionada dentro del kernel. Las 9 capas retenidas son `Qwen3DecoderLayer` literales, por lo que la retención es bit-exacta. El layout de parámetros y las matemáticas son los de upstream (`in_proj` con filas `[z | x | B | C | dd_dt | dd_A | trap | angles]`, B/C en orden `(r g n)`), de modo que se llama al kernel sin modificarlo: `mamba_ssm.ops.tilelang.mamba3.mamba3_mimo` del repositorio state-spaces/mamba en el commit `e9594ce` (TileLang + Triton). La versión de pip `mamba_ssm 2.2.6.post3` es anterior a Mamba-3, por lo que hay que instalar desde el código fuente; si el import falla, el modelo avisa una vez y usa `mamba3_mimo_reference`, una transcripción secuencial en fp32 con error relativo de 6e-3 frente al kernel en bf16, válida para comprobar paridad de decodificación pero no para rendimiento.

El entrenamiento no parte de pesos aleatorios: el mixer se inicializa heredando la cabeza de atención del profesor (fracción heredada del 99,95 %). Por cada capa convertida, la cabeza `h` de `x` toma `v_proj` de la cabeza `h // 4`; `B[r, g]` toma `k_proj` de la cabeza `g`; `C[r, g]` toma `q_proj` de la cabeza `4g + r`; `out_proj` toma `o_proj`; y `C_norm` / `B_norm` toman `q_norm` / `k_norm`. Las filas `dd_dt`, `dd_A`, trapecio y ángulos de `in_proj` se inicializan a cero (dt constante por cabeza, `A = -1`, trapecio 1/2, sin rotación) manteniendo gradiente. `dt_bias` es la inversa de softplus de `exp(U(log 1e-3, log 1e-1))`, con horizontes de 10 a 1.000 tokens, y `mimo_x` es un símplex aleatorio sobre rangos por (cabeza, dimensión). En la inicialización, una cabeza convertida equivale a la cabeza del profesor con la softmax sustituida por decaimiento causal (verificado a 3e-8).

La secuencia de destilación es: cirugía/inicialización, etapa 1 de alineamiento de estados ocultos por capa (100 M tokens), etapa 2a de forward-KL a 4k (600 M tokens), etapa 2b de KL en contexto largo a 32k (294 M tokens) y una etapa 3 de destilación on-policy que no se ha ejecutado. La etapa 2b usó 141 pasos de 2.097.152 tokens (micro-lote 1 × 4 rangos × 16 de acumulación), con learning rate reducido a la mitad respecto a la 2a: 1e-4 para los mixers y 1e-5 para los pesos heredados, coseno hasta 0,1× con un 3 % de warmup, entrenando todos los pesos. El cómputo fue de 4× B200. Una nota del autor: el backward de `mamba3_mimo.py` en `e9594ce` lee `ctx.saved_tensors` dos veces, lo que rompe el checkpointing de activaciones no reentrante de PyTorch (`use_reentrant=False`); el arreglo es un cambio de una línea y no afecta a la inferencia. Sobre el sesgo B/C, upstream inicializa los sesgos a 1,0; el brazo primario usó 0 y un segundo brazo mantuvo el 1,0 de upstream. El brazo con sesgo 1 fue mejor en todas las evaluaciones de la etapa 1 y la 2a, y es ahora el predeterminado.

## Capacidades

- Generación de texto autoregresiva en modo causal, con `pipeline_tag: text-generation`.
- Conversación multi-turno: el tag `conversational` está presente en el repositorio, aunque no se documenta una plantilla de chat propia ni una evaluación de diálogo.
- Manejo de contexto largo de hasta 32.768 tokens, longitud a la que se destiló explícitamente en la etapa 2b.
- Razonamiento, conocimiento general y generación de código heredados del profesor Qwen3-4B por destilación, pero no verificados con ninguna batería downstream.
- Capacidades multilingües: no documentadas. El modelo hereda lo que el profesor haya aprendido, sin confirmación en la model card.
- Tool calling / function calling: no documentado ni verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado ni verificado.
- Modo de pensamiento (thinking), visión o audio: no disponible; no hay ninguna capacidad multimodal ni modo de razonamiento explícito mencionado.
- Ejecución con kernel fusionado de Mamba-3 MIMO, con la alternativa de forzar la implementación de referencia en fp32 mediante `Qwen3Mamba3Mixer.force_reference = True`.

## Casos de uso

- Investigación sobre híbridos atención-SSM: el modelo sirve como punto de medida para cuantificar cuánta calidad se pierde al sustituir 27 de 36 capas de atención por un mixer Mamba-3, manteniendo fijo el profesor y los datos. Su KL de validación de 0,1957 a 32k es la cifra de referencia del brazo.
- Comparativa controlada de mixers lineales: los brazos Gated DeltaNet (KL 0,2177) y Mamba2 (KL 0,2336) se entrenaron con idéntico profesor, datos, presupuestos y planificación, de modo que las diferencias entre ellos y este brazo aíslan el efecto del mixer.
- Verificación de paridad numérica de kernels: activando `force_reference` se puede comparar la salida del kernel fusionado TileLang/Triton con la transcripción secuencial en fp32 y comprobar el error relativo de 6e-3 en bf16 antes de desplegar el kernel en producción.
- Evaluación de contexto largo: con 32.768 tokens de ventana se pueden medir PPL y divergencia KL respecto al profesor en documentos extensos, un escenario donde los SSM con estado recurrente se comportan de forma distinta a la atención completa.
- Punto de partida para la etapa 3 de destilación on-policy: la model card indica explícitamente que este checkpoint es la entrada de esa etapa, todavía no ejecutada, por lo que es la base natural para quien quiera continuar el pipeline.
- Estudio de inicialización heredada: con un 99,95 % de pesos heredados y una equivalencia verificada a 3e-8 con la cabeza del profesor al inicio, permite analizar cómo evoluciona el conocimiento del transformer original durante la destilación.
- Prototipado de generación de texto en investigación: para pruebas internas de generación y conversación donde no se requiera una evaluación formal de calidad, siempre que se acepte el coste de cargar código propio con `trust_remote_code=True`.

## Benchmarks y rendimiento

No hay resultados de benchmarks downstream (MMLU, HumanEval, GSM8K ni similares) en la información disponible; el autor indica explícitamente «no downstream evaluation yet». Las únicas métricas publicadas son las del entrenador. El KL de validación es la forward KL hacia el profesor sobre el vocabulario completo en texto empaquetado reservado, a la longitud de secuencia de la etapa; la PPL es de wikitext-2 con contexto de 4.096.

| Etapa | Sesgo 0 | Sesgo 1 (este modelo) | Qwen GDN (dtfix) | Qwen Mamba2 (dtfix) |
|---|---|---|---|---|
| Etapa 1: val rel-MSE media / peor capa / PPL wikitext-2 | 0,00397 / L0 0,0371 / 26,54 | 0,00376 / L0 0,0357 / 25,35 | 0,0208 / - / - | 0,0175 / - / - |
| Etapa 2a (4k): val KL / acuerdo top-1 / PPL | 0,1297 / 0,8580 / 12,49 | 0,1258 / 0,8601 / 12,41 | 0,1437 / 0,8515 / 12,83 | 0,1819 / 0,8295 / 12,60 |
| Etapa 2b (32k): val KL / acuerdo top-1 / PPL | 0,2021 / 0,8056 / 11,93 | 0,1957 / 0,8089 / 11,81 | 0,2177 / 0,7985 / - | 0,2336 / 0,7875 / - |

Datos adicionales aportados por el autor: el punto de partida de la etapa 2b era KL 1,1615 / acuerdo top-1 0,7189 / PPL 12,41. Mamba-3 entra en la etapa 2a con KL 0,50 (Mamba2: 1,08) y supera el KL final de Mamba2 en el paso 20 de 287.

## Requisitos de hardware

- Pesos en `bfloat16`: 4.741.428.416 parámetros × 2 bytes ≈ 9,5 GB, cifra que coincide con el tamaño del repositorio. Añadiendo activaciones y caché, la inferencia en bf16 requiere del orden de 11-12 GB de VRAM (estimación aritmética, no medida publicada).
- Cuantización: no hay pesos cuantizados publicados. Como referencia aritmética, 8 bits serían ≈ 4,8 GB y 4 bits ≈ 2,4 GB, pero no se ha validado el comportamiento de este modelo con `model_type` propio bajo cuantización.
- GPU de consumo: cabe en bf16 en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, y previsiblemente en tarjetas de 16 GB como la RTX 4080. En GPUs de 8-12 GB solo sería viable con cuantización, no verificada.
- GPU de centro de datos: A100, H100 o B200 sin problema de memoria para una sola instancia. El entrenamiento de esta etapa se hizo con 4× B200.
- Despliegue: la vía confirmada es `transformers` con `trust_remote_code=True` y `dtype="bfloat16"`, usando el tokenizador del repositorio. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y al tratarse de un `model_type` personalizado (`qwen3_mamba3`) con kernel propio es probable que estos motores no lo carguen sin trabajo de integración.
- Dependencia crítica: el kernel `mamba_ssm.ops.tilelang.mamba3.mamba3_mimo` exige instalar state-spaces/mamba desde el código fuente en el commit `e9594ce` con TileLang y Triton. Si el import falla, el modelo cae en la implementación de referencia en fp32, numéricamente equivalente pero muy lenta (el autor la describe como apta solo para comprobar paridad, no para throughput).
- Latencia y throughput: no disponible. No se publican medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Val KL @32k | Acuerdo top-1 @32k | PPL wikitext-2 | Licencia | Repositorio publico |
|---|---|---|---|---|---|---|---|
| Este modelo (Mamba-3 MIMO, sesgo 1) | 4.741.428.416 | 32.768 | 0,1957 | 0,8089 | 11,81 | Apache 2.0 | Sí |
| Brazo Qwen GDN (dtfix) | no disponible en la información | 32.768 (mismo plan de etapas) | 0,2177 | 0,7985 | no disponible | no disponible | no disponible |
| Brazo Qwen Mamba2 (dtfix) | no disponible en la información | 32.768 (mismo plan de etapas) | 0,2336 | 0,7875 | no disponible | no disponible | no disponible |
| Qwen3-4B (profesor) | no disponible en la información | no disponible en la información | 0 por definición (es la referencia) | 1,0 por definición | no disponible | Apache 2.0 | Sí, en el repositorio de Qwen |

Los brazos GDN y Mamba2 pertenecen al mismo estudio y comparten profesor, datos, presupuestos de tokens y planificación, por lo que la comparación entre los tres es la más limpia disponible; sin embargo, la información proporcionada no incluye sus identificadores de repositorio, su recuento de parámetros ni su licencia. Frente al profesor Qwen3-4B la comparación es asimétrica: aquí se mide la divergencia hacia el profesor, no una capacidad absoluta, y el profesor obtiene KL 0 y acuerdo top-1 1,0 por construcción.

## Limitaciones y advertencias

- No existe evaluación downstream: no hay MMLU, HumanEval, GSM8K ni ningún otro benchmark de capacidades. El autor lo declara explícitamente. Solo hay métricas de destilación.
- El checkpoint es un punto intermedio del pipeline: la etapa 3 de destilación on-policy no se ha ejecutado, por lo que la calidad podría mejorar de forma sustancial en pasos posteriores.
- Divergencia respecto al profesor: un KL de validación de 0,1957 y un acuerdo top-1 de 0,8089 a 32k implican que aproximadamente uno de cada cinco tokens siguientes no coincide con la predicción del profesor. Cualquier capacidad que dependa de una decisión exacta puede degradarse.
- Sesgos: no evaluados. El modelo hereda los sesgos de Qwen3-4B, con el agravante de que la destilación parcial puede distorsionar el calibrado de la distribución de salida.
- Riesgo de alucinación: no medido; al tratarse de una destilación incompleta con divergencia no nula, no hay garantía de que el comportamiento sea igual o mejor que el del profesor.
- Idiomas: no documentados en la model card ni en los metadatos. No se puede asumir el soporte multilingüe del profesor sin verificación.
- Código propio obligatorio: cargar el modelo requiere `trust_remote_code=True`, lo que implica ejecutar código Python empaquetado en el repositorio. Es un riesgo de seguridad y de mantenimiento a tener en cuenta en producción.
- Dependencia de una versión concreta del kernel: el commit `e9594ce` de state-spaces/mamba, no una versión de pip (`mamba_ssm 2.2.6.post3` es anterior a Mamba-3). Cualquier cambio de versión puede romper la carga o alterar los resultados.
- El camino de respaldo (`mamba3_mimo_reference`) es secuencial en fp32 y muy lento: no es una opción realista para servir el modelo.
- Bug conocido en el backward del kernel con checkpointing de activaciones no reentrante, resuelto con un cambio de una línea en los entrenamientos del autor. No afecta a la inferencia, pero sí a cualquiera que quiera reentrenar o continuar la destilación.
- Validación comunitaria nula: cero descargas y cero «likes» en el momento de redactar esta ficha, sin revisión independiente de los resultados.
- Licencia: Apache 2.0, que permite uso comercial. Conviene verificar que las dependencias del kernel (TileLang, Triton, state-spaces/mamba) y el modelo base Qwen3-4B son compatibles con el uso previsto.
- Longitud de contexto máxima real: la ventana usada en la destilación fue de 32.768 tokens, pero no se documenta el límite operativo del modelo ni si se aplicó alguna técnica de extensión de contexto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/arianraje/qwen3-4b-mamba3-hybrid-stage2b-kd-bias1
- Modelo base y profesor de destilación: https://huggingface.co/Qwen/Qwen3-4B
- Kernel de Mamba-3 MIMO (state-spaces/mamba, commit `e9594ce`): https://github.com/state-spaces/mamba
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a consultas no relacionadas y se han descartado. No se han encontrado por esa vía papers, blogs ni demos adicionales.
