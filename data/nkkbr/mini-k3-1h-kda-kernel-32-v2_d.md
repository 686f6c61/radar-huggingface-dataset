# nkkbr/Mini-K3-1H-kda-kernel-32-v2_D

## Resumen

Mini-K3-1H-kda-kernel-32-v2_D es un checkpoint de preentrenamiento de aproximadamente 1.018 millones de parámetros lógicos desarrollado por el usuario nkkbr, publicado en HuggingFace como parte de una comparación controlada de 20 arquitecturas derivadas de Kimi-K3 a escala reducida. Se trata de un modelo de investigación, no de un asistente: es un transformer híbrido de 13 capas que combina 9 capas KDA (atención lineal con decaimiento y convolución causal depthwise) con 4 capas Gated MLA (atención latente multi-cabeza con puerta de salida y codificación posicional NoPE), más una capa densa inicial y una pila de mezcla de expertos con enrutado disperso.

El modelo retiene los operadores característicos de la familia Kimi-K3 (KDA, Gated MLA, Attention Residuals por bloques, Stable LatentMoE, activaciones SiTU, output gates y Quantile Balancing) pero a una escala manejable en una sola GPU. De sus 1.018 millones de parámetros lógicos solo se activan 354,7 millones por token, lo que reduce el coste de cómputo por token al de un modelo denso de ~0,35B pese a mantener la capacidad total de un modelo de ~1B.

Su relevancia es metodológica más que de producto: sirve para estudiar el comportamiento de operadores de atención lineal y MoE a escala de laboratorio, con inicialización determinista por semilla compartida (base seed 20260914) y una misma secuencia de mezcla de datos para las 20 variantes, de modo que las diferencias observadas puedan atribuirse a cambios arquitectónicos concretos (ratio KDA/MLA, granularidad de decaimiento, longitud de convolución o codificación posicional). El checkpoint documentado en la model card corresponde a la revisión inicial (`checkpoint-tokens-000000000000-init`), con 0 objetivos de pérdida consumidos y 0 pasos de optimizador, y el autor no ha publicado evaluación en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 13 capas decodificadoras (9 KDA de atención lineal + 4 Gated MLA), MoE disperso Stable LatentMoE con 64 expertos enrutados + 2 compartidos y top-k 4 |
| Parametros totales | 1.017.941.740 (dato real de safetensors) |
| Parametros activos | 354.717.420 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento); no se declara ventana mayor |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos BF16; no hay GGUF, AWQ, GPTQ ni EXL2) |
| Idiomas soportados | no disponible (el autor no declara idiomas; los datasets fuente no se redistribuyen) |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), con estado de control en FP32; librería pytorch, requiere `modeling_mini_k3.py` y `configuration_mini_k3.py` |
| Capas KDA / MLA | Índices KDA `[1,2,3,5,6,7,9,10,11]`; índices Gated MLA `[4,8,12,13]`; 1 capa densa inicial |
| Anchura oculta / cabezas / anchura de cabeza KDA | 1024 / 12 / 128 |
| Convolución KDA / grupos de decaimiento | Kernel causal depthwise 32; 128 grupos de decaimiento contiguos por cabeza |
| Modo posicional MLA / output gate | NoPE / True |
| Anchura oculta de experto enrutado | 512 |
| Tamano de bloque de Attention Residual | 4 |
| Vocabulario / tokens especiales | 163840 / BOS 163584, EOS de generación 163586, PAD 163839 |
| Revision del checkpoint | `checkpoint-tokens-000000000000-init` (0 objetivos válidos consumidos, 0 pasos de optimizador) |
| Tag final previsto | `checkpoint-tokens-016000000000-final` (tras 16.000.000.000 objetivos válidos) |
| Post-entrenamiento | ninguno (sin SFT, RLHF ni DPO) |

## Arquitectura y entrenamiento

La arquitectura es un decodificador de 13 capas con anchura oculta 1024 y 12 cabezas de atención. Nueve capas emplean KDA (Kimi Delta Attention, la variante de atención lineal con decaimiento del linaje Kimi), con convolución causal depthwise de kernel 32 sobre las proyecciones cortas y 128 grupos de decaimiento contiguos por cabeza; cuatro capas emplean Gated MLA con codificación posicional NoPE y puerta de salida activada. La pila incorpora además Attention Residuals organizados en bloques de tamaño 4. Tras una capa densa inicial, el modelo pasa a una pila Stable LatentMoE con 64 expertos enrutados y 2 compartidos, selección top-4 y anchura oculta de experto 512, con activaciones SiTU. El enrutador selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas, apoyándose en Quantile Balancing en línea con histograma de 1.000 bins.

El entrenamiento descrito en la model card usa Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de parámetros matriciales y AdamW como respaldo para vectores y embeddings, con weight decay 0,1, QK-Clip por cabeza, decaimiento coseno y un 1 % de warmup lineal. Las 20 variantes de la comparación parten de una inicialización determinista indexada por nombre y forma con semilla base 20260914: los parámetros con el mismo nombre semántico y la misma forma arrancan byte a byte idénticos, y solo los parámetros exclusivos de variante o con forma distinta reciben flujos deterministas propios. Todos los runs consumen la misma secuencia de mezcla inmutable en el mismo orden, con documentos empaquetados aislados de forma estricta: MLA usa máscara causal bloqueada por documento y KDA reinicia su estado recurrente y su historial de convolución corta Q/K/V en cada frontera de segmento. El estado del optimizador no se publica de forma deliberada y no se realizó post-entrenamiento.

## Capacidades

- Predicción de siguiente token y continuación de texto: es la única función para la que está entrenado el checkpoint; el pipeline declarado es `text-generation`.
- Modelado de lenguaje base con vocabulario de 163.840 entradas, incluidos tokens especiales de BOS, EOS de generación y PAD definidos explícitamente.
- Procesamiento de secuencias de hasta 8.192 tokens durante el preentrenamiento, con enmascarado causal bloqueado por documento en las capas MLA y reinicio de estado en las capas KDA.
- Inferencia con coste de cómputo reducido: 354,7 millones de parámetros activos por token (aproximadamente el 34,8 % de los parámetros lógicos), gracias al enrutado top-4 sobre 64 expertos.
- Capacidad de servir como sujeto de ablación arquitectónica: ratio KDA/MLA, granularidad de decaimiento, longitud de convolución y codificación posicional son variables controladas de la familia.
- Soporte de tool calling / function calling: no disponible; el modelo no ha recibido post-entrenamiento ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay entrenamiento de instrucciones ni de razonamiento.
- Capacidades multilingües: no declaradas por el autor; no se puede confirmar cobertura de idiomas concretos.
- Capacidades especiales: no hay modo de pensamiento, visión, audio ni multimodalidad; el repositorio se describe explícitamente como text-only.

## Casos de uso

- Ablación controlada de arquitecturas híbridas de atención: el repositorio forma parte de una comparación de 20 variantes que difieren en el ratio KDA/MLA, la granularidad de decaimiento (128 grupos por cabeza), la longitud de convolución (kernel 32) o la codificación posicional (NoPE). Se usaría para medir el efecto aislado de cada cambio manteniendo fijos datos, semilla e inicialización.
- Investigación sobre atención lineal frente a atención latente: comparar el comportamiento de las 9 capas KDA y las 4 capas Gated MLA en tareas de recuperación de contexto largo a 8.192 tokens, analizando el coste de estado recurrente frente a caché KV latente.
- Estudio de enrutado MoE y Quantile Balancing: con 64 expertos enrutados, 2 compartidos y top-4, el modelo permite instrumentar la distribución de carga de expertos, la deriva del sesgo del enrutador y la eficacia del balancing por histograma en línea de 1.000 bins.
- Reproducibilidad de entrenamientos a pequeña escala: la inicialización determinista por nombre y forma con semilla base 20260914 permite reproducir byte a byte los parámetros compartidos entre variantes y auditar el efecto de cambios de forma sobre el resto de pesos.
- Banco de pruebas de operadores y kernels: al ser un paquete autónomo con `modeling_mini_k3.py` y `configuration_mini_k3.py`, resulta adecuado para validar implementaciones de convolución depthwise causal, decaimiento por grupos y máscaras bloqueadas por documento antes de escalarlas a un modelo mayor.
- Base para post-entrenamiento posterior: una vez alcanzado el tag final de 16.000 millones de tokens, el checkpoint podría servir de punto de partida para SFT o DPO en tareas concretas, dado su tamaño manejable en una sola GPU.
- Análisis de eficiencia de inferencia: con 354,7 millones de parámetros activos por token, es un banco de pruebas realista para medir latencia y memoria de un MoE disperso frente a un denso de tamaño equivalente.
- Evaluación metodológica de la extrapolación de escala: sirve para contrastar si las conclusiones obtenidas a ~1B de parámetros y 8K de contexto se mantienen al extrapolar a la escala completa de Kimi-K3, tal y como advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no ha sido evaluado en tareas downstream y que solo se registran NLL y perplejidad de desarrollo fijo durante el entrenamiento, en W&B y en ficheros JSONL de métricas del propio run. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, y no se deben extrapolar a partir de la descripción arquitectónica.

## Requisitos de hardware

- Pesos en BF16: 1.017.941.740 parámetros × 2 bytes ≈ 2,04 GB (≈ 1,90 GiB). El tamaño del repositorio publicado es de 2,0 GB, coherente con ese cálculo.
- Memoria adicional de inferencia: depende del estado de las capas KDA (estado recurrente y historial de convolución corta de kernel 32) y de la caché latente de las 4 capas Gated MLA. El autor no publica cifras. Como referencia orientativa, una caché equivalente a MHA completo en las 4 capas MLA (12 cabezas × 128 = 1.536 dimensiones por K y V) a 8.192 tokens en BF16 ocuparía unos 0,2 GB; la compresión latente real de MLA debería reducirlo.
- Estimación total de VRAM para inferencia en BF16: en el entorno de 2,5 a 4 GB con lotes pequeños y contexto de 8.192 tokens, marcada como estimación propia a partir del recuento de parámetros, no como dato del autor.
- GPU consumer: cabe con holgura en cualquier GPU de 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En tarjetas de 8 GB (RTX 3070, RTX 4060) es viable en BF16 con lotes pequeños; no hay cuantizaciones publicadas que permitan bajar a 4 GB con garantías.
- GPU de centro de datos: A100, H100, L40S o similares son suficientes y quedan sobredimensionadas para una sola instancia; su interés estaría en ejecutar las 20 variantes en paralelo para la comparación.
- Coste computacional por token: 2 × 354.717.420 ≈ 0,71 GFLOP por token en el forward, comparable a un modelo denso de ~0,35B.
- Opciones de despliegue: carga mediante PyTorch con el paquete standalone (`modeling_mini_k3.py`, `configuration_mini_k3.py`), `initialize_model.py` y `smoke_test.py` según la model card. No se declara soporte para vLLM, TGI, SGLang, llama.cpp ni Ollama, y al tratarse de una arquitectura personalizada con KDA y MLA con puerta, la conversión a GGUF no está disponible.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de hardware de referencia.

## Comparativa con modelos similares

Comparativa con modelos densos de tamaño cercano y con licencia y contexto publicados. Los datos de las alternativas provienen de su documentación pública; los del modelo objeto de la ficha, del repositorio de HuggingFace. No hay benchmarks comunes que permitan comparar rendimiento, por lo que la columna de rendimiento se deja como no disponible.

| Modelo | Parametros | Activos por token | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|---|
| Mini-K3-1H-kda-kernel-32-v2_D | 1,018 B | 354,7 M | 8.192 (entrenamiento) | Híbrida KDA + Gated MLA, MoE top-4 | no disponible | Checkpoint de preentrenamiento, sin post-entrenamiento |
| Qwen3-0.6B | 0,6 B | denso | 32.768 nativo (extensible con YaRN) | Transformer denso | Apache 2.0 | Modelo instructivo y base publicados |
| Llama-3.2-1B | 1,24 B | denso | 128.000 | Transformer denso | Llama 3.2 Community License | Modelo instructivo publicado |
| SmolLM2-1.7B | 1,71 B | denso | 8.192 | Transformer denso | Apache 2.0 | Modelo base e instructivo publicados |

Diferencias relevantes: frente a los tres alternativas, el modelo de nkkbr solo activa el 34,8 % de sus parámetros por token, pero su contexto de entrenamiento (8.192 tokens) es el más corto junto con SmolLM2 y no dispone de versión instructiva, licencia declarada ni soporte en runtimes de inferencia habituales. La comparación de rendimiento no puede establecerse porque el autor no ha publicado ninguna evaluación downstream.

## Limitaciones y advertencias

- El propio autor describe el modelo como un proxy de investigación pequeño, preentrenado únicamente, que no debe tratarse como un asistente que sigue instrucciones.
- La model card advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas.
- Riesgo de alucinación: alto y no caracterizado; no hay evaluaciones de fidelidad factual ni de tasas de alucinación.
- Sesgos: no documentados. Los datasets fuente no se redistribuyen en el repositorio y el autor remite a sus propias licencias y términos, sin publicar composición ni cuotas de tokens en la información disponible.
- Limitación de contexto: la longitud de entrenamiento es de 8.192 tokens y no se declara ninguna extensión mediante RoPE, YaRN u otra técnica; usar el modelo más allá de esa ventana no está respaldado.
- Limitación de idioma: no se declaran idiomas soportados, por lo que no se puede asumir un rendimiento fiable en castellano ni en ningún otro idioma concreto.
- Restricciones de licencia: la licencia no está disponible. Sin una licencia explícita, no puede asumirse permiso para uso comercial ni para redistribución de pesos o derivados.
- Estado del checkpoint: la revisión documentada es `checkpoint-tokens-000000000000-init`, con 0 objetivos de pérdida válidos consumidos y 0 pasos de optimizador; es decir, los pesos corresponden a la inicialización y no a un modelo entrenado. El proceso de entrenamiento previsto llega hasta 16.000 millones de tokens en el tag final `checkpoint-tokens-016000000000-final`, pero no hay confirmación en la información disponible de que ese tag exista ya.
- El estado del optimizador no se publica de forma deliberada, lo que impide reanudar el entrenamiento exactamente desde el mismo punto.
- Sin benchmarks: no se puede estimar calidad, capacidad de razonamiento ni utilidad práctica. Cualquier afirmación de rendimiento sería especulativa.
- Generalización dudosa: el autor advierte de que los rankings de arquitectura obtenidos a esta escala y con 8K de longitud de entrenamiento necesitan confirmación antes de extrapolarse al Kimi-K3 completo.
- Compatibilidad de despliegue: la arquitectura es personalizada y requiere el código incluido en el repositorio; los runtimes de inferencia estándar (vLLM, TGI, llama.cpp, Ollama) no están soportados según la información disponible.
- Posible discrepancia de nomenclatura: el identificador del repositorio incluye el sufijo `-v2_D`, mientras que el título de la model card es `Mini-K3-1H-kda-kernel-32`; conviene verificar cuál es la variante exacta al reproducir experimentos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-kda-kernel-32-v2_D
- Ficheros de arquitectura y variante referenciados dentro del repositorio: `ARCHITECTURE_PACKAGE_README.md`, `ARCHITECTURE.md`, `VARIANT.md`, `modeling_mini_k3.py`, `configuration_mini_k3.py`, `initialize_model.py`, `smoke_test.py`
- Manifiestos JSON con revisiones de código fuente congeladas, cuotas de tokens, hashes de planificación, configuración del optimizador, hardware de referencia y hashes del split de validación: incluidos en el repositorio (no se dispone de URL directa en la información proporcionada)
- Métricas de entrenamiento (NLL y perplejidad de desarrollo fijo): registradas en W&B y en JSONL del run según la model card; no se proporciona el enlace
- Repositorio del experimento con diagnósticos downstream y arquitectónicos planificados: mencionado en la model card, sin URL disponible
- Búsqueda web: los resultados obtenidos no contienen información relacionada con este modelo (corresponden a un negocio de interiorismo del Reino Unido) y no se han incluido como referencias. No se han encontrado papers, blogs, repositorios ni demos adicionales sobre el modelo en la información disponible.
