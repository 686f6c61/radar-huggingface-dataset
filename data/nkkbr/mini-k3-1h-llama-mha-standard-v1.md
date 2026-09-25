# nkkbr/Mini-K3-1H-llama-mha-standard-v1

## Resumen

Mini-K3-1H-llama-mha-standard es un checkpoint de investigación publicado por el usuario nkkbr dentro de un experimento de ablación de arquitecturas denominado Mini-K3-1H. Se trata de un modelo decoder-only de tipo transformer con mezcla de expertos (MoE) que replica a pequeña escala el diseño de Kimi-K3 (Stable LatentMoE, primera capa densa SiTU-GLU, tokenizer propio y Quantile Balancing en línea), pero sustituyendo todos sus mezcladores de secuencia por atención multi-cabeza (MHA) estándar con RoPE de cabeza completa. Forma parte de un conjunto de cuatro ejecuciones controladas que comparan MHA frente a GQA y distintos mecanismos residuales, manteniendo idéntica la inicialización, el orden y la composición del corpus.

El modelo tiene 979.928.832 parámetros lógicos y activa 316.704.512 parámetros por token, con 13 capas de decoder, anchura oculta de 1024, 8 cabezas de consulta y 8 de clave/valor de 128 dimensiones cada una. El MoE consta de 64 expertos enrutados más 2 compartidos, con top-k de 4 y anchura oculta de 512 por experto enrutado. El vocabulario es de 163.840 entradas y la longitud de secuencia de entrenamiento es de 8.192 tokens, con RoPE (theta 10000.0) reiniciado en cada frontera de documento empaquetado.

La relevancia de esta ficha es principalmente metodológica: el checkpoint publicado corresponde a la revisión `checkpoint-tokens-000000000000-init`, es decir, al estado de inicialización con 0 objetivos de pérdida consumidos y 0 pasos de optimizador. No es un modelo entrenado ni un asistente, sino el punto de partida reproducible de una comparación de arquitecturas cuyo tag final está previsto tras procesar exactamente 16.000.000.000 de objetivos válidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (Stable LatentMoE) y atención MHA estándar |
| Parámetros totales | 979.928.832 (lógicos) |
| Parámetros activos | 316.704.512 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento; no se documenta ventana máxima en inferencia) |
| Tipos de cuantización | no disponible (pesos publicados en BF16; no se distribuyen variantes cuantizadas) |
| Idiomas soportados | no disponible (tokenizer de 163.840 entradas; no se declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), con código PyTorch propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |
| Capas de decoder | 13, todas con MHA estándar |
| Anchura oculta / cabezas Q / cabezas KV / anchura de cabeza | 1024 / 8 / 8 / 128 |
| Codificación posicional | RoPE de cabeza completa, theta 10000.0, reinicio en fronteras de documento |
| Proyecciones de atención | Q/K/V/O sin sesgo; sin compresión MLA ni puerta de salida de atención |
| Mecanismo residual | residuales PreNorm estándar |
| Capas densas antes del MoE | 1 (SiTU-GLU) |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Anchura oculta de experto enrutado | 512 |
| Vocabulario / BOS / EOS de generación / PAD | 163840 / 163584 / 163586 / 163839 |
| Revisión publicada | `checkpoint-tokens-000000000000-init` (0 tokens, 0 pasos de optimizador) |
| Precisión de parámetros | BF16, con estado de normalización y del router en FP32 donde lo define la implementación |
| Tamaño del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un decoder de 13 capas con residuales PreNorm estándar y atención MHA sin sesgos en las proyecciones Q/K/V/O. Cada una de las 13 capas usa 8 cabezas de consulta y 8 de clave/valor de 128 dimensiones, con RoPE aplicado a cabeza completa. Frente a la variante de referencia del experimento, se eliminan la compresión MLA y la puerta de salida de atención, de modo que el bloque de atención es el de un transformer convencional. Tras una única capa densa SiTU-GLU se sitúa el bloque MoE, con 64 expertos enrutados (anchura oculta 512), 2 expertos compartidos y top-k de 4; el router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. El vocabulario es de 163.840 entradas.

El checkpoint publicado está inicializado, no entrenado: la model card indica explícitamente 0 objetivos de next-token consumidos y 0 pasos de optimizador. La receta prevista para las ejecuciones completas combina Per-Head Muon para las matrices Q/K/V, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay de 0,1, QK-Clip por cabeza consciente de GQA, decaimiento coseno, 1 % de warmup lineal y Quantile Balancing en línea con histograma de 1.000 bins. No se realizó post-entrenamiento (ni RLHF ni DPO). La comparabilidad entre las cuatro variantes se garantiza mediante inicialización determinista por nombre y forma con semilla base `20260914`, un mismo calendario de mezcla de datos y aislamiento estricto de documentos empaquetados mediante atención THD de longitud variable de Transformer Engine, con reinicio de posiciones RoPE en cada frontera. Los manifiestos JSON del repositorio contienen las revisiones exactas de las fuentes, cuotas de tokens, hashes de calendario, configuración del optimizador y hashes del split de validación.

## Capacidades

- Generación de texto autoregresiva: es la tarea declarada (`pipeline_tag: text-generation`), pero al tratarse de un checkpoint sin entrenar no produce texto coherente.
- Modelado de lenguaje a nivel de token: la arquitectura está diseñada para predicción de siguiente token sobre documentos empaquetados de hasta 8.192 tokens.
- Enrutamiento MoE con top-k 4 sobre 64 expertos enrutados y 2 compartidos, con Quantile Balancing en línea para equilibrar la carga entre expertos.
- Soporte de secuencias largas relativo a su escala: 8.192 tokens de longitud de entrenamiento con RoPE reiniciado por documento.
- Capacidades de tool calling / function calling: no disponibles (no hay post-entrenamiento ni plantilla de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el tokenizer tiene 163.840 entradas pero no se documenta cobertura idiomática.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El modelo es exclusivamente de texto.
- Uso como control experimental: sirve para comparar MHA frente a GQA y mecanismos residuales bajo inicialización y datos idénticos.

## Casos de uso

- Ablación de arquitectura controlada: el modelo es una de las cuatro variantes de un experimento que compara MHA/GQA y mecanismos residuales; se usa para medir NLL y perplejidad en un split de desarrollo fijo y aislar el efecto de cambiar solo el mezclador de secuencia.
- Reproducción de preentrenamiento a escala reducida: con ~980 M de parámetros lógicos y ~317 M activos, permite reproducir la receta de Kimi-K3 (Per-Head Muon, QK-Clip, Quantile Balancing) en hardware modesto antes de escalar.
- Estudio de enrutamiento MoE: la configuración de 64 expertos enrutados, 2 compartidos y top-k 4, junto con el Quantile Balancing de 1.000 bins, permite analizar colapso de expertos, balanceo de carga y estabilidad del router.
- Validación de infraestructura de entrenamiento: sirve como banco de pruebas para pipelines con documentos empaquetados y atención THD de longitud variable, comprobando que el aislamiento entre documentos y el reinicio de RoPE funcionan antes de lanzar ejecuciones mayores.
- Verificación de inicialización determinista: dado que los parámetros compartidos entre variantes comienzan byte a byte idénticos, el checkpoint permite auditar que la inicialización por nombre y forma con semilla fija se reproduce correctamente en distintos entornos.
- Pruebas de carga e integración de código personalizado: útil para validar flujos de `trust_remote_code` que cargan `modeling_mini_k3.py` y `configuration_mini_k3.py`, y para comprobar compatibilidad con `initialize_model.py` y `smoke_test.py`.
- Referencia para estudios de escalado de contexto: con 8.192 tokens de entrenamiento, permite analizar cómo se comporta el patrón de atención MHA sin compresión MLA al variar la longitud de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que se trata de un checkpoint intermedio de preentrenamiento que aún no ha sido evaluado en tareas downstream, y que la NLL y la perplejidad de desarrollo fijo se registran en W&B y en las métricas JSONL de la ejecución, sin cifras publicadas en el repositorio. Los diagnósticos downstream y de arquitectura están planificados en el repositorio del experimento.

## Requisitos de hardware

- Pesos en BF16: 979.928.832 parámetros × 2 bytes ≈ 1,96 GB. El repositorio ocupa 2,0 GB, coherente con ese cálculo.
- Caché KV a 8.192 tokens en BF16: 13 capas × 8 cabezas KV × 128 dimensiones × 2 tensores (K y V) × 2 bytes ≈ 436 MB (estimación derivada de la configuración declarada, no medida publicada).
- VRAM estimada para inferencia a 8K de contexto: en torno a 3-4 GB incluyendo pesos, caché KV, activaciones y overhead del runtime; para secuencias cortas, aproximadamente 2,5-3 GB.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o cualquier GPU con 6 GB o más de VRAM son suficientes para inferencia en BF16. Una RTX 4090 queda muy sobredimensionada.
- GPU de centro de datos (A100, H100): no son necesarias para inferencia; solo tendrían sentido para reproducir el preentrenamiento a mayor throughput.
- Opciones de despliegue: no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI. La arquitectura es personalizada (Mini-K3 con Stable LatentMoE y MHA propia), por lo que la carga requiere PyTorch con el código incluido en el repositorio (`modeling_mini_k3.py` y `configuration_mini_k3.py`) y `config.json`, sin depender del checkout original de entrenamiento. No se distribuyen pesos en GGUF ni cuantizaciones de 4 u 8 bits.
- Latencia y throughput: no disponibles. La model card menciona un "hardware benchmark choice" registrado en los manifiestos JSON del repositorio, pero no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Datos de la documentación pública de cada modelo alternativo, no verificados en esta búsqueda. Las filas de benchmarks se dejan como no disponibles porque este checkpoint no publica resultados.

| Modelo | Parámetros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| Mini-K3-1H-llama-mha-standard | 979.928.832 lógicos / 316.704.512 activos (MoE) | 8.192 (entrenamiento) | no disponible | safetensors (BF16), código PyTorch propio | no disponible |
| Llama 3.2 1B | ~1,24 mil millones (denso) | hasta 128K según documentación de Meta | Llama 3.2 Community License | safetensors, GGUF vía terceros | no comparable en esta ficha |
| Qwen2.5-1.5B | ~1,54 mil millones (denso) | 32K según documentación de Alibaba | Apache 2.0 | safetensors, GGUF | no comparable en esta ficha |
| TinyLlama-1.1B | ~1,1 mil millones (denso) | 2K según documentación del proyecto | Apache 2.0 | safetensors, GGUF | no comparable en esta ficha |

La diferencia fundamental no es de rendimiento sino de propósito: las alternativas son modelos preentrenados y afinados para uso general, mientras que este checkpoint es un control de investigación sin entrenamiento y sin post-entrenamiento.

## Limitaciones y advertencias

- El checkpoint publicado es el estado de inicialización: 0 objetivos de pérdida consumidos y 0 pasos de optimizador. No ha aprendido nada del corpus y sus salidas serán esencialmente ruido estadístico.
- No sirve como asistente: no hay ajuste por instrucciones, ni RLHF, ni DPO, ni plantilla de chat. No debe tratarse como un modelo conversacional.
- Riesgo de alucinación: la model card advierte que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas. En el estado actual de inicialización, esta advertencia es todavía más severa.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni redistribución. Los datasets de origen conservan sus propias licencias y términos, y el repositorio no redistribuye su texto.
- Idiomas soportados no declarados: se desconoce la cobertura idiomática real y no hay evaluación multilingüe publicada.
- Limitación de escala y de contexto: la model card señala explícitamente que las clasificaciones de arquitectura obtenidas a esta escala y con 8.192 tokens de entrenamiento necesitan confirmación antes de extrapolarse al Kimi-K3 completo.
- Estado del optimizador no publicado de forma deliberada, lo que impide reanudar el entrenamiento desde este checkpoint tal cual.
- Sin soporte en runtimes estándar: al ser una arquitectura personalizada, no es cargable directamente en vLLM, llama.cpp, Ollama o TGI sin trabajo de portado, y no existen pesos GGUF.
- Sin cuantizaciones publicadas: cualquier despliegue en 4 u 8 bits requeriría generar la conversión por cuenta propia y validarla.
- Es un modelo únicamente de texto; no procesa imágenes ni audio.
- Cada checkpoint numerado es un tag de Git inmutable y `main` apunta al más reciente, por lo que conviene fijar la revisión exacta en cualquier uso reproducible.

## Enlaces

- HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-llama-mha-standard-v1
- Repositorio del experimento, W&B, manifiestos JSON y archivos `ARCHITECTURE.md`, `VARIANT.md`, `initialize_model.py`, `smoke_test.py`, `modeling_mini_k3.py` y `configuration_mini_k3.py`: incluidos en el propio repositorio de HuggingFace (no se proporcionan URL externas en la información disponible).
- Paper, blog, repositorio de código o demo adicionales: no disponibles.
