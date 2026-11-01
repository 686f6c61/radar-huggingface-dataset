# marafx2025/ch1mera

## Resumen

Chimera 5.3 (identificador `marafx2025/ch1mera` en HuggingFace) es una implementación de referencia en PyTorch puro de una arquitectura de lenguaje denominada Chimera 5.x, publicada por el usuario marafx2025. El repositorio no contiene pesos entrenados, sino el código de entrenamiento e inferencia de un modelo con 15 componentes arquitectónicos declarados, entre ellos capas recurrentes híbridas (GatedDeltaNet, mLSTM, TitansMAC), un mezclador de expertos (MoE) y cuantización ternaria de 1,58 bits con kernels en C++. El foco declarado del autor es el entrenamiento en CPU sin GPU, con un objetivo de rendimiento de 10.000 o más tokens por segundo mediante la combinación de siete paradigmas de optimización.

La versión 5.3 introduce el motor `hyper.py`, que apila siete técnicas de aceleración (currículo GrowLength, congelación de reservorio, MeZO disperso, pipeline por bloques, caché ternaria fusionada, empaquetado agresivo de tokens y desbloqueo progresivo de capas) con un multiplicador teórico combinado de entre 57 y 260 veces sobre una línea base de 50 a 200 tok/s. El tokenizador es `splintr-rs` en Rust con vocabulario `o200k_base` (200.073 tokens, el mismo de OpenAI o1/o3).

Se trata de un artefacto de investigación y experimentación, no de un modelo listo para producción: no hay pesos publicados, no hay benchmarks, no hay licencia declarada y el repositorio registra cero descargas y cero likes en el momento de redactar esta ficha. Su interés es fundamentalmente arquitectónico y metodológico para quienes investigan entrenamiento de bajo coste, cuantización extrema y arquitecturas híbridas recurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: transformer con capas recurrentes (GatedDeltaNet, mLSTM, TitansMAC, TSPSpanKnot), MoE con dispatch basado en ordenación y controlador de bucle ParcaeLoopController |
| Parametros totales | No disponible (la model card menciona ~35M de parámetros en el contexto de MeZO para la escala de referencia) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (el script de entrenamiento usa `--seq_len 256` como ejemplo; el currículo GrowLength arranca en 16 y crece hasta el objetivo) |
| Tipos de cuantizacion | Ternaria de 1,58 bits (BitLinear con empaquetado de 2 bits, kernel en C++, STE y patrón N:M 2:4); soporte de bf16 en entrenamiento |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene código fuente Python y C++; no se publican safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura declarada combina mecanismos de atención y recurrencia en un mismo bloque: GatedDeltaNet (atención lineal con compuertas), mLSTM (memoria a largo plazo con compuerta de olvido), TitansMAC (memoria asociativa con proyección de olvido) y TSPSpanKnot. Sobre esa base se añade un MoELayer con dispatch agrupado por experto, un controlador de bucle ParcaeLoopController para reutilización de bloques, y un conjunto de módulos de inferencia (SpanBank, STree, Grammar, EntropyValve, DebtLedger) y de evolución (TTT, SemanticMemory, EpisodicCases, MetaGuidelines). La cuantización se realiza con BitLinear: pesos ternarios empaquetados a 2 bits, escalado AbsMean vectorizado y kernels C++ cargados de forma perezosa.

El entrenamiento se plantea en dos vías: AdamW estándar y MeZO (optimización sin gradientes, zero-order). La versión 5.3 añade siete paradigmas que se combinan de forma multiplicativa. GrowLength Curriculum entrena con secuencias que crecen desde 16 tokens hasta el objetivo (20 % a target/8, 25 % a target/4, 25 % a target/2, 30 % al objetivo completo). Reservoir Freezing congela el 50 % de las compuertas recurrentes (`a_proj`, `b_proj`, `fgate`, `alpha_proj`) como matrices ternarias aleatorias de radio espectral unitario. Sparse MeZO perturba solo el 1 % de parámetros más sensibles (unos 350.000 de 35 millones), lo que según el autor mejora la relación señal-ruido del estimador de gradiente en dos órdenes de magnitud. A ello se suman el pipeline por bloques con fijación de grupos de capas a grupos de núcleos, la caché ternaria fusionada para reutilizar buffers entre las dos pasadas de MeZO, el empaquetado de tokens sin relleno y el desbloqueo progresivo de capas (25 % superior primero, cuatro etapas). No se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autorregresiva mediante `Chimera51ForCausalLM`, con decodificación condicionada por gramática (módulo Grammar) y control de entropía (EntropyValve).
- Razonamiento multi-paso mediante bucle de capas (ParcaeLoopController) y memoria episódica (EpisodicCases, SemanticMemory).
- Capacidades multimodales declaradas: VisionEncoder y AudioEncoder en `multimodal.py`, aunque sin pesos ni evaluación publicados.
- Tokenización con `o200k_base` (200.073 tokens), compatible con el vocabulario de OpenAI o1/o3.
- Entrenamiento sin gradientes (MeZO) y con gradientes (AdamW), con soporte de bf16 y `torch.compile`.
- Cuantización ternaria en tiempo de inferencia y entrenamiento con kernels C++ y patrón de dispersión 2:4.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación en arquitecturas híbridas recurrente-atención: el repositorio permite reproducir y modificar los bloques GatedDeltaNet, mLSTM y TitansMAC en PyTorch puro, útil para estudiar el equilibrio entre coste de atención y memoria recurrente en contextos largos.
- Estudio de cuantización ternaria extrema: BitLinear con empaquetado de 2 bits y STE sirve como banco de pruebas para medir la degradación de calidad al pasar de fp16 a 1,58 bits en modelos pequeños.
- Entrenamiento en CPU sin GPU: los siete paradigmas de `train_hyper.py` están pensados para ejecutarse con `OMP_NUM_THREADS=$(nproc)` en una sola máquina, lo que permite experimentar con modelos de decenas de millones de parámetros en portátiles o servidores sin acelerador.
- Comparación de optimizadores zero-order: la implementación de MeZO estándar y Sparse MeZO permite medir empíricamente la varianza del estimador de gradiente y el coste por paso en función de la dispersión.
- Docencia y formación: el código modular (config, layers, moe, quantization, inference, evolution) sirve como material didáctico para explicar atención lineal, MoE y cuantización a nivel de implementación.
- Prototipado de tokenizadores: la integración de `splintr-rs` con `o200k_base` permite probar pipelines de tokenización compatibles con modelos comerciales sin depender de sus pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara objetivos de throughput de entrenamiento en CPU (de 50-200 tok/s de línea base a 3.000-15.000+ tok/s con los siete paradigmas activos) y un multiplicador teórico combinado de 57-260×, sin mediciones reproducibles ni comparación con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no publicarse pesos ni tamaño total del modelo. Para la escala de referencia de ~35M de parámetros mencionada en la sección de MeZO, la inferencia en fp32 requeriría del orden de 140 MB y en ternaria empaquetada a 2 bits alrededor de 9 MB, pero estas cifras son estimaciones a partir del recuento de parámetros y no datos publicados.
- GPU recomendadas: el proyecto está diseñado explícitamente para CPU; no se documentan requisitos de GPU. Cualquier GPU con soporte de PyTorch podría ejecutar el código, pero no se han publicado pruebas.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 2 GB de VRAM para las escalas pequeñas, aunque no hay validación publicada.
- Opciones de despliegue: el repositorio proporciona `inference.py` y `train_hyper.py` como scripts de referencia. No hay integración con vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos en GGUF ni safetensors no es posible desplegarlo con esas herramientas.
- Latencia y throughput: el objetivo declarado es de 3.000 a 15.000+ tok/s en entrenamiento sobre una sola CPU con los siete paradigmas activos; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (arquitecturas híbridas recurrentes con cuantización ternaria y entrenamiento en CPU) con pesos publicados y métricas verificables.

## Limitaciones y advertencias

- No se publican pesos entrenados: el repositorio contiene únicamente código. No es posible usar el modelo para inferencia sin entrenarlo previamente.
- Ausencia total de benchmarks: no hay métricas de calidad (perplejidad, MMLU, HumanEval, GSM8K) que permitan evaluar el rendimiento real de la arquitectura.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni modificación. Cualquier uso en producción requiere contactar con el autor.
- Idiomas no declarados: se desconoce si el tokenizador `o200k_base` y el entrenamiento previsto cubren castellano u otras lenguas distintas del inglés.
- Riesgo de alucinación y sesgos: no evaluable al no existir un modelo entrenado publicado.
- Los multiplicadores de velocidad (57-260×) son teóricos y el propio autor los califica de objetivo realista de 3.000-15.000 tok/s; no hay mediciones independientes que los respalden.
- El repositorio registra cero descargas y cero likes, y la fecha de creación (2026-11-01) es posterior a la fecha habitual de consulta, lo que sugiere un artefacto muy reciente o de procedencia no verificada.
- Dependencia de kernels C++ propios y de la extensión `splintr-rs`: la portabilidad a otras plataformas no está documentada, y versiones anteriores tuvieron problemas de instrucciones ilegales por `-march=native`.

## Enlaces

- HuggingFace: https://huggingface.co/marafx2025/ch1mera
- Paper GrowLength Curriculum: https://arxiv.org/abs/2310.00576
- Paper Reservoir Freezing (GRC): https://arxiv.org/abs/2512.23145
- Paper Sparse MeZO: https://arxiv.org/abs/2406.02913
- Paper de referencia adicional citado en tags: https://arxiv.org/abs/2412.06464
- Paper de referencia adicional citado en tags: https://arxiv.org/abs/2405.04517
- Paper de referencia adicional citado en tags: https://arxiv.org/abs/2501.00663
- Paper de referencia adicional citado en tags: https://arxiv.org/abs/2403.03507
- Paper de referencia adicional citado en tags: https://arxiv.org/abs/2502.12346
- Paper de referencia adicional citado en tags: https://arxiv.org/abs/2502.12444
- Paper de referencia adicional citado en tags: https://arxiv.org/abs/2604.12946
- Paper de referencia adicional citado en tags: https://arxiv.org/abs/2402.17764
- Paper de referencia adicional citado en tags: https://arxiv.org/abs/2305.17333
