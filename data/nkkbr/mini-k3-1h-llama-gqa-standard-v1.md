# nkkbr/Mini-K3-1H-llama-gqa-standard-v1

## Resumen

Mini-K3-1H-llama-gqa-standard-v1 es un checkpoint de investigación de pretraining a escala reducida, publicado por el usuario nkkbr en Hugging Face. Se trata de un transformer decoder-only de 966.297.344 parámetros lógicos (303.073.024 activos por token) que combina una mezcla de expertos dispersa de tipo Stable LatentMoE, heredada del diseño de Kimi-K3, con atención GQA estándar en sus 13 capas. El modelo forma parte de una comparación controlada de cuatro ejecuciones (MHA frente a GQA, cruzadas con el mecanismo residual) cuyo objetivo es aislar el efecto de cada elección arquitectónica bajo un mismo presupuesto de cómputo.

La relevancia de esta ficha es doble. Por un lado, documenta una ablación reproducible: todos los runs parten de una inicialización canónica con semilla base 20260914, comparten el mismo schedule de mezcla de datos y el mismo tokenizador, de modo que las diferencias observadas pueden atribuirse a la variante arquitectónica y no al azar. Por otro, es un ejemplo poco habitual de publicación de checkpoints intermedios inmutables etiquetados por número de tokens consumidos, con un objetivo final declarado de 16.000.000.000 de tokens válidos.

Es fundamental subrayar que la revisión publicada corresponde al tag `checkpoint-tokens-000000000000-init`, es decir, la inicialización del modelo: cero tokens de entrenamiento consumidos y cero pasos de optimizador completados. No es un asistente conversacional, no ha recibido post-entrenamiento ni ajuste por instrucciones y no se ha evaluado en tareas downstream. Su valor es metodológico y de infraestructura, no de producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso (Stable LatentMoE) y atención GQA estándar, residuales PreNorm |
| Parámetros totales | 966.297.344 (lógicos) |
| Parámetros activos | 303.073.024 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (los pesos publicados están en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), con código de modelado propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) y `config.json` autocontenido |
| Capas decoder | 13 |
| Anchura oculta | 1.024 |
| Cabezas Q / KV / anchura de cabeza | 8 / 4 / 128 |
| Codificación posicional | RoPE de cabeza completa, theta 10.000,0, reiniciada en cada frontera de documento |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Anchura oculta de experto enrutado | 512 |
| Capas densas antes del MoE | 1 (SiTU-GLU) |
| Vocabulario / BOS / EOS de generación / PAD | 163.840 / 163.584 / 163.586 / 163.839 |
| Precisión | BF16 en parámetros, FP32 en estado de normalización y control del router |
| Revisión publicada | `checkpoint-tokens-000000000000-init` (0 tokens válidos, 0 pasos de optimizador) |
| Objetivo de entrenamiento | tag final `checkpoint-tokens-016000000000-final` tras 16.000.000.000 de targets de pérdida válidos |

## Arquitectura y entrenamiento

El modelo sigue el patrón decoder-only con atención de consultas agrupadas (GQA): 8 cabezas de consulta y 4 de clave/valor, cada una de anchura 128, sobre una anchura oculta de 1.024 y 13 capas. Las proyecciones Q/K/V/O son sin sesgo (bias-free), sin compresión MLA ni puerta de salida de atención, y el mecanismo residual es PreNorm estándar. La primera capa es densa con activación SiTU-GLU; a partir de ahí se aplica Stable LatentMoE con 64 expertos enrutados, 2 expertos compartidos y top-k 4, con anchura oculta de 512 por experto enrutado. El enrutador selecciona expertos con puntuaciones sesgadas y los combina con puntuaciones sigmoideas sin sesgo renormalizadas. Esta variante concreta es el control de atención Llama dentro de la comparación de cuatro modelos: conserva el MoE latente estable, la capa densa y el tokenizador de K3, pero sustituye los mezcladores de secuencia por atención Q/K/V/O ordinaria sin sesgo con RoPE de cabeza completa.

El recetario de entrenamiento declarado incluye Per-Head Muon para las matrices Q/K/V, Muon para el resto de parámetros matriciales, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza consciente de GQA, decaimiento coseno con un 1 % de warmup lineal y Quantile Balancing en línea con histograma de 1.000 bins. Los documentos empaquetados se aíslan de forma estricta mediante atención THD de longitud variable de Transformer Engine, y las posiciones RoPE se reinician a cero en cada frontera de documento, lo que evita contaminación entre secuencias concatenadas. No se aplicó post-entrenamiento alguno: no hay RLHF, DPO ni SFT. Los manifiestos JSON del repositorio recogen las revisiones exactas de las fuentes de datos, las cuotas de tokens, los hashes de schedule y la configuración del optimizador.

## Capacidades

- Generación de texto autoregresiva de próximo token, con el tokenizador de 163.840 entradas heredado de K3.
- Capacidad de continuación de texto únicamente en el estado actual: al estar en la inicialización, la salida es esencialmente ruido estadístico y no texto coherente.
- Soporte nativo de secuencias empaquetadas con aislamiento por documento (atención THD y reinicio de RoPE), útil para pipelines de pretraining a gran escala.
- Enrutamiento disperso funcional: el router y el mecanismo de Quantile Balancing están operativos desde el primer paso, lo que permite instrumentar su comportamiento antes de que exista señal de aprendizaje.
- Ausencia total de soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión o audio.
- Capacidades multilingües: no disponible (el tokenizador es amplio, pero no se documenta cobertura idiomática ni calidad por idioma).
- No es un modelo ajustado por instrucciones y no responde a prompts conversacionales de forma fiable.

## Casos de uso

- Ablación arquitectónica controlada: el modelo sirve como brazo de control de atención GQA estándar frente a las variantes MHA y de mecanismo residual. Al compartir inicialización, schedule de datos y tokenizador, permite atribuir diferencias de pérdida a la elección de atención con una validez interna alta.
- Validación de infraestructura de entrenamiento distribuido: los checkpoints inmutables por número de tokens (cada uno es un tag de Git) permiten comprobar reanudación, determinismo de inicialización y equivalencia entre nodos antes de lanzar runs a escala mayor.
- Pruebas de humo de frameworks y kernels: el modelo carga con `initialize_model.py` y `smoke_test.py` en BF16 y admite atención THD de longitud variable, por lo que es útil para verificar compatibilidad de kernels de atención, precisión mixta y rutas de MoE en una GPU consumer.
- Estudio del enrutador y de Quantile Balancing: al estar el router operativo desde el paso cero, es posible instrumentar el reparto de carga entre los 64 expertos, medir desequilibrios y validar el histograma de 1.000 bins sin esperar a que el modelo converja.
- Evaluación de metodología de comparación justa: el esquema de inicialización canónica por nombre y forma con semilla base 20260914 es un caso de estudio reproducible para diseñar protocolos de comparación entre arquitecturas de distinto grafo de parámetros.
- Generación de líneas base triviales en arneses de evaluación: como modelo no entrenado, aporta una referencia de pérdida y perplejidad aleatoria con la que calibrar si las diferencias entre checkpoints maduros son significativas.
- Pruebas de memoria y throughput de decodificación: con 303 millones de parámetros activos por token, permite medir el coste real de un MoE disperso de este tamaño en entornos de despliegue antes de invertir en entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que se trata de un checkpoint intermedio de pretraining que aún no ha sido evaluado en tareas downstream. Únicamente se registran la NLL y la perplejidad del conjunto de desarrollo fijo durante el entrenamiento, en Weights & Biases y en los ficheros JSONL de métricas del run, y esos registros no se incluyen en la información proporcionada.

## Requisitos de hardware

- Peso del checkpoint: aproximadamente 1,9 GB en BF16 (966 millones de parámetros lógicos a 2 bytes), coherente con el tamaño del repositorio.
- VRAM para inferencia: en BF16 caben pesos y caché KV en torno a 2,5-3 GB con contexto de 8.192 tokens. La caché KV es pequeña: 13 capas x 4 cabezas KV x 128 de anchura x 2 tensores x 8.192 posiciones x 2 bytes, aproximadamente 208 MB.
- En cuantización de 8 bits el modelo bajaría a unos 1 GB de pesos y en 4 bits a unos 0,5 GB, aunque no se publican pesos cuantizados y habría que generarlos con herramientas externas (por ejemplo, conversión a GGUF con llama.cpp), con el riesgo de incompatibilidad con el enrutador por no existir una ruta oficial validada.
- GPU consumer: cabe con holgura en cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090), y probablemente en GPU de 6 GB en cuantización de 8 bits.
- GPU de centro de datos: A100, H100, L40S o similares no son necesarias para inferencia; se justifican para entrenamiento, donde el estado del optimizador, los gradientes y los 64 expertos en BF16 elevan el consumo de forma notable.
- Opciones de despliegue: PyTorch nativo con el código incluido en el repositorio (`modeling_mini_k3.py`, `configuration_mini_k3.py`). No se documenta soporte para vLLM, TGI, Ollama o llama.cpp, y la arquitectura personalizada con Stable LatentMoE hace probable que requiera integración manual en esos motores.
- Latencia y throughput: no disponible. No se publican mediciones de velocidad de decodificación ni de tokens por segundo, y al tratarse de un checkpoint sin entrenar las cifras de calidad no serían interpretables de todos modos.

## Comparativa con modelos similares

La comparación directa es limitada porque este checkpoint no está entrenado y los modelos de referencia sí lo están. La tabla recoge únicamente el orden de magnitud arquitectónico; las cifras de los modelos de referencia provienen de su documentación pública y conviene verificarlas en la fuente original.

| Modelo | Parámetros totales | Parámetros activos | Expertos / top-k | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| Mini-K3-1H-llama-gqa-standard-v1 | 966 M | 303 M | 64 enrutados + 2 compartidos / 4 | 8.192 | no disponible | Solo inicialización, sin entrenar |
| OLMoE-1B-7B (AllenAI) | 6.900 M aprox. | 1.300 M aprox. | 64 / 8 | 4.096 | Apache 2.0 | Entrenado y ajustado |
| Qwen1.5-MoE-A2.7B | 14.300 M aprox. | 2.700 M aprox. | 60 / 4 | 32.768 | Ver licencia del modelo original | Entrenado y ajustado |
| Kimi-K3 (modelo completo de referencia) | no disponible | no disponible | no disponible | no disponible | no disponible | Referencia de diseño citada por el autor |

Frente a OLMoE-1B-7B, este modelo tiene menos parámetros activos (303 M frente a 1.300 M) y una longitud de contexto de entrenamiento mayor, pero carece de cualquier entrenamiento efectivo. Frente a Qwen1.5-MoE-A2.7B la diferencia de escala es de un orden de magnitud, tanto en parámetros totales como activos. La comparación honesta, por tanto, solo tiene sentido dentro de la propia familia Mini-K3-1H y con otros proxies de investigación de tamaño similar.

## Limitaciones y advertencias

- El checkpoint publicado está en la inicialización: cero tokens válidos consumidos y cero pasos de optimizador. Las salidas serán repetitivas, incoherentes o directamente ruido. No debe usarse para generar contenido destinado a personas.
- No ha recibido post-entrenamiento de ningún tipo (sin SFT, RLHF ni DPO). No sigue instrucciones y no debe tratarse como asistente.
- No se ha evaluado en tareas downstream, según declara el propio autor. Cualquier afirmación sobre su calidad relativa carece de respaldo empírico.
- El autor advierte que las conclusiones sobre rankings de arquitecturas a esta escala y con una longitud de entrenamiento de 8.192 tokens necesitan confirmación antes de extrapolarse al Kimi-K3 completo. Los resultados de una ablación a 966 M de parámetros no son necesariamente transferibles.
- Licencia no disponible: no se especifican términos de uso, lo que impide determinar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas soportados no disponibles: no hay documentación sobre cobertura ni calidad por idioma, más allá del tamaño del vocabulario (163.840 entradas).
- Riesgo de sesgos, contenido inseguro u ofensivo inherente a un modelo no entrenado que parte de pesos aleatorios y a las fuentes de datos declaradas, cuyas licencias y términos se mantienen en los datasets originales y no se redistribuyen en este repositorio.
- El estado del optimizador no se publica deliberadamente, por lo que no es posible reanudar el entrenamiento exactamente desde el punto en que se encuentra el checkpoint, solo reinicializar o continuar desde pesos.
- La arquitectura es personalizada (Stable LatentMoE con código propio). No se garantiza compatibilidad con motores de inferencia estándar ni con herramientas de cuantización, y cualquier integración requiere trabajo adicional.
- El repositorio no redistribuye texto de los datasets originales; las condiciones de uso derivadas de esos datos recaen sobre quien los utilice.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkkbr/Mini-K3-1H-llama-gqa-standard-v1
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron exclusivamente resultados sin relación con el ámbito técnico, por lo que no se incluyen.
- Documentación interna citada por el autor dentro del repositorio, no disponible como URL pública independiente: `ARCHITECTURE.md`, `VARIANT.md`, `configuration_mini_k3.py`, `modeling_mini_k3.py`, `initialize_model.py`, `smoke_test.py`, `config.json`.
- Referencias de la familia Kimi-K3 y del repositorio de experimentos mencionadas en la model card: no disponibles en la información proporcionada (no se incluyen URL ni identificadores en el material recibido).
