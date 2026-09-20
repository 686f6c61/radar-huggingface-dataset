# nkkbr/Mini-K3-1H-kda-kernel-0-v2

## Resumen

Mini-K3-1H-kda-kernel-0-v2 es un checkpoint de investigación de tipo text-only publicado por el usuario nkkbr en HuggingFace. Se trata de un modelo de aproximadamente 1.016 millones de parámetros lógicos construido como parte de una comparación controlada de 20 arquitecturas derivadas de Kimi-K3. El modelo conserva los operadores KDA (atención lineal con decaimiento) y Gated MLA (Multi-head Latent Attention con puerta de salida), además de Attention Residuals por bloques, Stable LatentMoE, activaciones SiTU y Quantile Balancing. Su interés radica en ser un proxy pequeño y reproducible para estudiar decisiones de arquitectura antes de extrapolarlas a escalas mayores.

La arquitectura es un decoder-only híbrido con 13 capas, de las cuales 9 son KDA y 4 son Gated MLA, con 64 expertos enrutados más 2 compartidos y top-k 4. De los 1.016 millones de parámetros totales, solo 353 millones se activan por token, lo que lo convierte en un caso de estudio de eficiencia tipo MoE. Según la model card, la longitud de secuencia de entrenamiento es de 8.192 tokens.

Es importante señalar que el checkpoint publicado corresponde a la revisión `checkpoint-tokens-000000000000-init`, con 0 objetivos de next-token consumidos y 0 pasos de optimizador. Es decir, se trata de un estado de inicialización dentro de una campaña de preentrenamiento planificada hasta 16.000 millones de tokens, no de un modelo entrenado. Su relevancia actual es, por tanto, metodológica y de reproducibilidad, no funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: 13 capas (9 KDA de atención lineal + 4 Gated MLA), bloque Attention Residuals, Stable LatentMoE, activaciones SiTU, output gates |
| Parametros totales | 1.016.614.636 |
| Parametros activos | 353.390.316 por token (MoE: 64 expertos enrutados + 2 compartidos, top-k 4) |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento declarada) |
| Tipos de cuantizacion | no disponible (pesos en BF16; estados de control KDA, convolución, normalización y router en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) con código PyTorch propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) |

Datos adicionales de la arquitectura: ancho oculto 1.024, 12 cabezas de atención, ancho de cabeza KDA 128, kernel de convolución causal depthwise KDA 0, 128 grupos de decaimiento contiguos por cabeza, modo posicional MLA NoPE, 1 capa densa antes del MoE, ancho oculto de experto enrutado 512, tamaño de bloque Attention Residual 4, vocabulario 163.840 (BOS 163.584, EOS de generación 163.586, PAD 163.839).

## Arquitectura y entrenamiento

El modelo combina dos mecanismos de atención. Las capas KDA implementan atención lineal con decaimiento y estado recurrente, con reinicio del estado y del historial de convolución corta Q/K/V en cada frontera de segmento. Las capas Gated MLA usan Multi-head Latent Attention con máscara causal bloqueada por documento y sin codificación posicional explícita (NoPE), más una puerta de salida. El apilado incluye bloques de Attention Residuals de tamaño 4, que modifican cómo se acumulan las residuales entre capas. La capa MoE emplea Stable LatentMoE con 64 expertos enrutados, 2 compartidos y top-k 4; el router selecciona con puntuaciones sesgadas y combina con puntuaciones sigmoideas sin sesgo renormalizadas. La receta de entrenamiento usa Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza, decaimiento coseno, 1 % de warmup lineal y Quantile Balancing online con histograma de 1.000 bins. No se aplicó post-entrenamiento (ni RLHF ni DPO).

En cuanto a los datos, la model card indica que el esquema de mezcla es inmutable y append-only, compartido por las 20 ejecuciones, y que los documentos empaquetados están aislados de forma estricta. Las revisiones exactas de las fuentes, cuotas de tokens, hashes de esquema, configuración del optimizador y hashes del split de validación están en manifiestos JSON del repositorio. El repositorio no redistribuye el texto de las fuentes. El checkpoint publicado, sin embargo, está en el estado inicial: 0 objetivos válidos consumidos, 0 pasos de optimizador y el estado del optimizador deliberadamente no publicado. La etiqueta final, `checkpoint-tokens-016000000000-final`, se creará solo tras procesar exactamente 16.000 millones de objetivos de pérdida válidos.

## Capacidades

Debe distinguirse entre lo que la arquitectura permite y lo que este checkpoint concreto ha demostrado, que a fecha de publicación es nada, al estar sin entrenar.

- Generación de texto autorregresiva: tarea declarada (`text-generation`) y diseño de decoder-only, pero sin capacidades verificadas porque el checkpoint tiene 0 tokens de entrenamiento.
- Atención lineal con estado recurrente (KDA): pensada para coste de atención subcuadrático y manejo de estado en secuencias largas.
- Atención latente con compresión de KV (Gated MLA): reduce el coste de memoria de la caché de clave-valor.
- Enrutado MoE disperso: activa 353 millones de parámetros de 1.016 millones por token.
- Contexto de 8.192 tokens en la configuración de entrenamiento.
- Tool calling / function calling: no disponible; no hay plantilla de chat ni post-entrenamiento.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara composición idiomática del dataset ni del vocabulario.
- Capacidad especial: no dispone de modo thinking, visión, audio ni otras modalidades; el modelo es explícitamente text-only.

## Casos de uso

Dado que el checkpoint está en estado de inicialización, los casos de uso realistas son de investigación y de infraestructura, no de producto:

- Estudio de ablaciones de arquitectura: el repositorio forma parte de una comparación controlada de 20 arquitecturas con inicialización determinista (semilla base `20260914`) y mismos tensores byte-idénticos cuando comparten nombre y forma. Permite aislar el efecto de variantes como la relación KDA/MLA, la granularidad del decaimiento, la longitud de convolución o la codificación posicional.
- Verificación de reproducibilidad de inicialización: `initialize_model.py` y `smoke_test.py` permiten comprobar que una ejecución local genera los mismos tensores que los publicados, algo útil como test de regresión en pipelines de entrenamiento.
- Validación de kernels de atención lineal: con kernel de convolución KDA 0 y 128 grupos de decaimiento por cabeza, sirve para medir el comportamiento de implementaciones KDA frente a implementaciones de referencia.
- Instrumentación y depuración de routers MoE: con 64 expertos enrutados, top-k 4 y Quantile Balancing de 1.000 bins, es un banco de pruebas para monitorizar colapso de expertos, balanceo de carga y estabilidad del enrutado en un modelo de 1.000 millones de parámetros.
- Pruebas de portabilidad de runtimes: al no usar una arquitectura estándar, es útil para evaluar el esfuerzo de adaptar `modeling_mini_k3.py` a vLLM, llama.cpp o TGI, y para medir la divergencia numérica entre backends.
- Proxy económico para campañas de preentrenamiento: al activar solo 353 millones de parámetros por token, permite ensayar estrategias de optimizador (Muon por cabeza, AdamW de respaldo, QK-Clip) y de decaimiento coseno antes de comprometer presupuesto en escalas mayores.
- Base para estudios de extrapolación: la propia model card advierte que los rankings de arquitectura a esta escala y a 8K de longitud de entrenamiento necesitan confirmación antes de extrapolarse a Kimi-K3 completo, de modo que el modelo sirve como punto de partida de ese análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que es un checkpoint intermedio de investigación y que no se ha evaluado aún en tareas downstream. Solo se registran NLL y perplejidad de desarrollo fijo durante el entrenamiento en W&B y en el JSONL de métricas de la ejecución, datos que no se incluyen en la información proporcionada.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros; no hay mediciones publicadas en la información disponible.

- Pesos en BF16: aproximadamente 2,03 GB (1.016.614.636 parámetros × 2 bytes), coherente con el tamaño de repo de 2,0 GB.
- Pesos en FP32: aproximadamente 4,07 GB, aunque el checkpoint se publica en BF16.
- Memoria adicional en ejecución: estados de control en FP32 (decaimiento KDA, convolución, normalización, router) y activaciones; para 8.192 tokens conviene reservar entre 2 y 4 GB extra en BF16.
- VRAM estimada para inferencia BF16: en torno a 6-8 GB con margen para contexto completo; menos con secuencias cortas.
- Cuantización: no disponible. No se publican pesos GGUF, AWQ, GPTQ ni FP8; cualquier cuantización requeriría generarla a partir del checkpoint original, con el riesgo de que los estados de control KDA/MLA en FP32 no se reconstruyan con precisión.
- GPU recomendadas: cualquier GPU con 8-12 GB o más. Cabe en consumer en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090. Para entrenamiento o evaluación a gran escala se necesitarían A100, H100 o similares, aunque no se especifica la configuración usada.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, porque la arquitectura es personalizada y depende de `modeling_mini_k3.py` y `configuration_mini_k3.py`. El único camino documentado es PyTorch con el paquete standalone incluido en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones de terceros. La siguiente tabla usa conocimiento general sobre modelos de tamaño comparable y debe verificarse antes de citarse; los datos de este modelo provienen de su model card.

| Modelo | Parametros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| Mini-K3-1H-kda-kernel-0-v2 | 1,016 B totales / 353 M activos | 8.192 | MoE híbrido KDA + MLA | no disponible | Checkpoint de inicialización, sin entrenar |
| Llama 3.2 1B | 1,24 B | 128.000 | Denso | Llama 3.2 Community License | Post-entrenado, chat disponible |
| Qwen2.5-1.5B | 1,54 B | 32.768 | Denso | Apache 2.0 | Post-entrenado, chat disponible |
| SmolLM2-1.7B | 1,7 B | 8.192 | Denso | Apache 2.0 | Post-entrenado, chat disponible |

La comparación directa de rendimiento no es posible: este repositorio no declara métricas downstream, mientras que las alternativas publican resultados en MMLU, HumanEval, GSM8K y similares. La diferencia estructural relevante es que Mini-K3-1H es un MoE con atención híbrida y solo 353 millones de parámetros activos, frente a modelos densos de activación completa en el mismo rango de tamaño.

## Limitaciones y advertencias

- Checkpoint sin entrenar: la revisión publicada es `checkpoint-tokens-000000000000-init`, con 0 objetivos válidos consumidos y 0 pasos de optimizador. No genera texto útil.
- No es un asistente: la model card indica explícitamente que es solo preentrenado y que no debe tratarse como modelo de seguimiento de instrucciones. No hay RLHF ni DPO.
- Sin evaluación downstream: no hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark público.
- Alcance de las conclusiones: los rankings de arquitectura obtenidos a esta escala y a 8K de longitud de entrenamiento necesitan confirmación antes de extrapolarse a Kimi-K3 completo.
- Riesgo de salidas inseguras: la propia ficha advierte de que las salidas pueden ser inexactas, sesgadas, inseguras o repetitivas, con el agravante de que al no estar entrenado el comportamiento es esencialmente no determinista en calidad.
- Idiomas: no se declara qué idiomas cubre el vocabulario de 163.840 entradas ni la composición lingüística de los datos.
- Licencia: no disponible. No se puede asumir uso comercial libre; además, las fuentes de datos conservan sus propias licencias y términos, y el repositorio no redistribuye su texto.
- Dependencia de código propio: sin `modeling_mini_k3.py` y `configuration_mini_k3.py` el checkpoint no es cargable en runtimes estándar.
- Ambigüedad documental: la descripción lista 13 capas con índices KDA `[1, 2, 3, 5, 6, 7, 9, 10, 11]` y MLA `[4, 8, 12, 13]`, lo que suma 13 capas solo si la indexación es 1-based; conviene revisar `config.json` y `ARCHITECTURE.md` antes de asumir la topología exacta.
- Estado del optimizador no publicado: impide reanudar el entrenamiento desde este punto con total fidelidad.
- Reproducibilidad condicionada: la comparabilidad entre las 20 ejecuciones depende de los manifiestos JSON incluidos, cuyos hashes no se detallan en la información proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-kda-kernel-0-v2
- No se han encontrado en la búsqueda web otros enlaces relevantes (paper, blog, repositorio de experimentos o demo). Los resultados de la búsqueda corresponden a portales educativos sin relación con el modelo.
- Referencias internas del repositorio mencionadas en la model card, sin URL verificada en la información disponible: `modeling_mini_k3.py`, `configuration_mini_k3.py`, `ARCHITECTURE_PACKAGE_README.md`, `ARCHITECTURE.md`, `VARIANT.md`, `initialize_model.py`, `smoke_test.py`, `config.json` y la carpeta de manifiestos JSON.
