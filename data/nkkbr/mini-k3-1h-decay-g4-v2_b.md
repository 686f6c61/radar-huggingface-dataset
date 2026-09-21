# nkkbr/Mini-K3-1H-decay-g4-v2_B

## Resumen

Mini-K3-1H-decay-g4-v2_B es un checkpoint de preentrenamiento de texto publicado por el usuario nkkbr en HuggingFace, con 1.015.052.956 parámetros lógicos y 351.828.636 parámetros activados por token. No es un modelo de propósito general, sino un proxy de investigación a escala de aproximadamente mil millones de parámetros que reproduce la arquitectura de Kimi-K3: mezcla de operadores KDA (atención lineal) y Gated MLA, bloques de Attention Residuals, Stable LatentMoE, activaciones SiTU, puertas de salida y Quantile Balancing. Forma parte de una comparación controlada de 20 arquitecturas entrenadas con el mismo orden de datos, la misma semilla base (20260914) y la misma receta de optimizador.

El problema que resuelve es metodológico: permitir estudios de ablación de decisiones arquitectónicas concretas (proporción KDA/MLA, granularidad de decaimiento, longitud de convolución, codificación posicional) a un coste computacional asumible. Esta variante concreta se distingue por usar 4 grupos de decaimiento contiguos por cabeza en las capas KDA y un kernel de convolución causal depthwise de longitud 4. El run fue recuperado y reiniciado desde cero tokens tras un fallo en la inicialización provocado por una discrepancia en el layout de serialización de `dt_bias`; según el autor, solo cambió la serialización portable, no la arquitectura ni la receta.

Su relevancia actual es acotada y conviene subrayarla: se trata de un checkpoint intermedio (etiqueta `checkpoint-tokens-001000079360`, 1.000.079.360 objetivos válidos de next-token) de un modelo solo texto, sin post-entrenamiento y sin evaluaciones downstream publicadas. La licencia no está declarada, lo que limita cualquier uso más allá de la investigación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido KDA (atención lineal) + Gated MLA, con MoE enrutado |
| Parámetros totales | 1.015.052.956 |
| Parámetros activos | 351.828.636 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento; no se declara contexto extendido) |
| Tipos de cuantización | no disponible (pesos publicados en BF16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo solo texto; no se declara la composición lingüística del dataset) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) con código PyTorch propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |
| Capas decoder | 13 (9 KDA + 4 Gated MLA) |
| Índices de capas KDA | [1, 2, 3, 5, 6, 7, 9, 10, 11] |
| Índices de capas Gated MLA | [4, 8, 12, 13] |
| Anchura oculta / cabezas de atención / anchura de cabeza KDA | 1024 / 12 / 128 |
| Kernel de convolución causal KDA | 4 |
| Grupos de decaimiento KDA por cabeza | 4 (contiguos) |
| Modo posicional MLA / puerta de salida | NoPE / True |
| Capas densas antes del MoE | 1 |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Anchura oculta de experto enrutado | 512 |
| Tamano de bloque de Attention Residual | 4 |
| Vocabulario / BOS / EOS de generación / PAD | 163840 / 163584 / 163586 / 163839 |
| Precisión de pesos | BF16 (decaimiento KDA, convolución, normalización y estado de control del router en FP32) |
| Estado del optimizador | no publicado deliberadamente |
| Tamano del repositorio | 6,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un decoder de 13 capas que alterna dos operadores de atención: 9 capas KDA, un mecanismo de atención lineal con estado recurrente y convolución causal depthwise de longitud 4, y 4 capas Gated MLA, atención de latencia multi-cabeza con puerta de salida y sin codificación posicional explícita (NoPE). Sobre esa columna se aplican bloques de Attention Residuals de tamano 4. El componente MoE es un Stable LatentMoE con 1 capa densa previa, 64 expertos enrutados y 2 compartidos, selección top-4 y anchura oculta de experto de 512. Las activaciones son SiTU. La anchura oculta es 1024 con 12 cabezas de atención y 128 de anchura de cabeza KDA.

El entrenamiento consume una secuencia fija e inmutable de mezcla de datos, con documentos empaquetados y aislados de forma estricta: MLA usa máscara causal bloqueada por documento, mientras que el estado recurrente de KDA y el historial de la convolución corta Q/K/V se reinician en cada frontera de segmento. La receta combina Muon por cabeza para las matrices Q/K/V expandidas, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza, decaimiento coseno, 1 % de warmup lineal y Quantile Balancing en línea con histograma de 1.000 bins. El router selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. No se aplicó post-entrenamiento (ni RLHF, ni DPO, ni SFT). El checkpoint publicado corresponde a 1.526 pasos de optimizador y una etiqueta final prevista tras procesar exactamente 16.000.000.000 objetivos válidos de pérdida.

## Capacidades

- Generación de texto autoregresiva: es la única tarea para la que fue entrenado (predicción de siguiente token), con un vocabulario de 163.840 entradas y tokens especiales definidos para BOS, EOS de generación y PAD.
- Continuación y modelado de lenguaje: uso realista del checkpoint, orientado a medir NLL y perplejidad sobre un split de desarrollo fijo.
- Razonamiento, código y matemáticas: no hay ninguna evaluación publicada; al tratarse de un checkpoint intermedio con 1.000 millones de tokens vistos, no hay evidencia que respalde estas capacidades.
- Tool calling / function calling: no soportado. No hay post-entrenamiento ni formato de herramientas declarado.
- Agentes y razonamiento multi-paso: no soportado. El modelo no sigue instrucciones.
- Capacidades multilingües: no disponible; no se declara la composición lingüística del corpus de entrenamiento.
- Modo thinking, visión o audio: no disponibles. El modelo es explícitamente solo texto y no incorpora ningún modo de razonamiento extendido.
- Particularidad arquitectónica explotable: es un banco de pruebas funcional de atención lineal KDA con granularidad de decaimiento configurable, MoE con Quantile Balancing y atención Gated MLA con NoPE.

## Casos de uso

- Ablación de arquitectura a escala controlada: el checkpoint es una de las 20 variantes de la comparación; sirve para medir el efecto de cambiar la granularidad de decaimiento KDA (4 grupos contiguos por cabeza) manteniendo idénticos datos, semilla y receta respecto a las otras 19 variantes.
- Estudio de híbridos atención lineal / atención latente: permite analizar empíricamente la proporción 9:4 entre capas KDA y Gated MLA, así como el efecto de NoPE en las capas MLA, sin el coste de entrenar un modelo de escala completa.
- Desarrollo de stacks de inferencia para arquitecturas no estándar: el repositorio incluye `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py` y `smoke_test.py`, de modo que sirve como banco de pruebas para implementar kernels KDA o enrutado MoE en servidores propios.
- Reproducción de recetas de optimizador: permite reproducir el esquema Muon por cabeza, el QK-Clip por cabeza y el Quantile Balancing en línea con histograma de 1.000 bins sobre un modelo que cabe en una GPU de consumo.
- Investigación sobre tokenizadores de vocabulario grande: con 163.840 entradas de vocabulario para solo 1.015 millones de parámetros lógicos, es útil para estudiar el reparto de parámetros entre embeddings y capas y su impacto en la eficiencia de entrenamiento.
- Punto de partida para post-entrenamiento experimental: al ser un checkpoint base sin SFT, es un candidato razonable para experimentos de ajuste fino (LoRA o completo) que midan cómo se comporta un híbrido KDA/MLA tras la fase de instrucciones.
- Validación de infraestructura de checkpoints: cada checkpoint numerado es una etiqueta Git inmutable y `main` apunta al más reciente, por lo que el repositorio ejemplifica un flujo de versionado de puntos de control con etiquetas verificables y manifiestos JSON con hashes.
- Medición de eficiencia en hardware limitado: con 351.828.636 parámetros activos por token, permite estudiar compromisos entre memoria y cómputo en GPUs de gama media frente a alternativas densas del mismo orden de parámetros totales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint no ha sido evaluado en tareas downstream y que solo se registran NLL y perplejidad de desarrollo fijo durante el entrenamiento, en Weights & Biases y en las métricas JSONL del run (no incluidas en la información proporcionada).

## Requisitos de hardware

- VRAM para pesos en BF16: aproximadamente 2,03 GB (1.015.052.956 parámetros × 2 bytes), más un margen reducido para el estado de control en FP32 (decaimiento KDA, convolución, normalización y router).
- VRAM para pesos en FP32: aproximadamente 4,06 GB si se convierte el checkpoint completo, opción no recomendada porque el checkpoint ya está en BF16.
- Memoria adicional de inferencia: no disponible el cálculo exacto de la caché; hay que contabilizar la caché de las 4 capas MLA y, sobre todo, el estado recurrente de las 9 capas KDA, cuyo coste depende de la implementación.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En tarjetas de 6 GB el margen es ajustado pero probablemente suficiente solo para inferencia; en 4 GB no es recomendable.
- GPU de centro de datos: no necesita A100 ni H100 para inferencia; sí serían útiles para reproducir el entrenamiento completo a 8.192 tokens de secuencia.
- Opciones de despliegue: no disponible el soporte nativo en vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura (KDA + Gated MLA + Stable LatentMoE) requiere el código propio incluido en el repositorio. La vía soportada es PyTorch con `modeling_mini_k3.py` y `configuration_mini_k3.py`. No se publican pesos en GGUF, por lo que Ollama y llama.cpp no pueden usarse sin una conversión previa no documentada.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por lote.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini-K3-1H-decay-g4-v2_B | 1.015.052.956 | 351.828.636 | 8.192 tokens (entrenamiento) | no disponible | HuggingFace, código propio |
| Llama 3.2 1B | 1.240 millones | denso | 128.000 tokens | Llama 3.2 Community License | HuggingFace, amplio soporte de frameworks |
| Qwen2.5 1.5B | 1.540 millones | denso | 32.768 tokens | Apache 2.0 | HuggingFace, amplio soporte de frameworks |
| TinyLlama 1.1B | 1.100 millones | denso | 2.048 tokens | Apache 2.0 | HuggingFace, amplio soporte de frameworks |

Los datos de parámetros, contexto y licencia de los tres modelos comparativos provienen de la documentación pública de sus respectivos desarrolladores. La comparación de rendimiento no es posible: Mini-K3-1H-decay-g4-v2_B no tiene evaluaciones downstream publicadas, mientras que los tres alternativas densas sí publican resultados de benchmarks. La diferencia de categoría también es relevante: los tres comparativos son modelos densos con post-entrenamiento orientado a instrucciones, mientras que este checkpoint es un MoE híbrido sin post-entrenamiento y con una ventana de contexto mucho menor.

## Limitaciones y advertencias

- No es un asistente: es un checkpoint de preentrenamiento sin SFT, RLHF ni DPO. No sigue instrucciones y no debe desplegarse en aplicaciones de usuario final.
- Calidad de salida: el propio autor advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas. Con 1.000 millones de tokens vistos, la perplejidad será alta en la mayoría de dominios.
- Sesgos: no hay ninguna auditoría de sesgos publicada, ni información sobre la composición del corpus, por lo que no es posible acotar los sesgos presentes.
- Riesgo de alucinación: alto y no medido, derivado de un modelo base de tamaño reducido y entrenamiento parcial.
- Limitación de contexto: 8.192 tokens es la longitud de secuencia de entrenamiento, no una ventana validada para uso en producción. No se documenta ninguna técnica de extensión de contexto.
- Idiomas: no disponibles. No se declara la distribución lingüística del corpus, por lo que no se puede garantizar cobertura ni calidad en castellano ni en ningún otro idioma.
- Licencia: no declarada. Sin licencia explícita no hay autorización clara para uso comercial ni para redistribución, y los datasets de origen conservan sus propias licencias y términos; el repositorio no redistribuye el texto de los mismos.
- Estado del checkpoint: es un punto intermedio de una serie que aspira a 16.000 millones de tokens. Las etiquetas finales (`checkpoint-tokens-016000000000-final`) aún no existen en el momento de esta ficha y el estado actual está lejos de ese objetivo.
- Extrapolación: el autor advierte de que los rankings de arquitectura a esta escala y con longitud de entrenamiento de 8K necesitan confirmación antes de extrapolarse a Kimi-K3 completo.
- Serialización: el run original falló en la inicialización por una discrepancia de layout en `dt_bias`; esta versión cambió la serialización portable, lo que conviene tener en cuenta al comparar artefactos entre variantes.
- Sin estado del optimizador: no se publica el estado del optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde el checkpoint tal cual se interrumpió.
- Soporte de herramientas: al depender de código propio, no se beneficia de las optimizaciones, kernels ni del ecosistema de servidores de inferencia de los modelos densos equivalentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-decay-g4-v2_B
- Código de modelado incluido en el repositorio: `modeling_mini_k3.py` (https://huggingface.co/nkkbr/Mini-K3-1H-decay-g4-v2_B/blob/main/modeling_mini_k3.py)
- Configuración incluida en el repositorio: `configuration_mini_k3.py` (https://huggingface.co/nkkbr/Mini-K3-1H-decay-g4-v2_B/blob/main/configuration_mini_k3.py)
- Documentación de arquitectura: `ARCHITECTURE.md` (https://huggingface.co/nkkbr/Mini-K3-1H-decay-g4-v2_B/blob/main/ARCHITECTURE.md)
- Descripción del paquete portable: `ARCHITECTURE_PACKAGE_README.md` (https://huggingface.co/nkkbr/Mini-K3-1H-decay-g4-v2_B/blob/main/ARCHITECTURE_PACKAGE_README.md)
- Descripción de la variante: `VARIANT.md` (https://huggingface.co/nkkbr/Mini-K3-1H-decay-g4-v2_B/blob/main/VARIANT.md)
- Scripts de uso local: `initialize_model.py` (https://huggingface.co/nkkbr/Mini-K3-1H-decay-g4-v2_B/blob/main/initialize_model.py) y `smoke_test.py` (https://huggingface.co/nkkbr/Mini-K3-1H-decay-g4-v2_B/blob/main/smoke_test.py)
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo. Los resultados devueltos corresponden a páginas de ayuda de YouTube TV, premios de creadores de YouTube, hilos de Zhihu sobre registro de cuentas de Google y descarga de la aplicación móvil de YouTube, ninguno relacionado con Mini-K3, Kimi-K3 ni con este repositorio. No se dispone de paper, blog técnico, repositorio de experimentos ni demo asociados en la información proporcionada.
