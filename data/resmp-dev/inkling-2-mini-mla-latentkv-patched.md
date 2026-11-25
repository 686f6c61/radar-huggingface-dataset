# RESMP-DEV/Inkling-2-Mini-MLA-LatentKV-Patched

## Resumen

Inkling-2-Mini-MLA-LatentKV-Patched es un artefacto experimental publicado por RESMP-DEV que aplica un parche estructural sobre los pesos oficiales de `thinkingmachines/Inkling-2-Mini`. Concretamente, sustituye las proyecciones de clave y valor de las dos capas de atención completa (capas 11 y 17) por una factorización de rango 512 al estilo MLA (Multi-head Latent Attention), manteniendo intacto el resto del modelo: 24 capas físicas con un núcleo de bucle que se recorre tres veces, atención con ventana deslizante, sesgos de posición relativa y sumideros de atención aprendidos. El objetivo declarado no es ofrecer un modelo utilizable, sino hacer inspeccionable y reproducible el propio parche y su ruta de "curación" mediante entrenamiento posterior.

El checkpoint no ha sido entrenado. Los nuevos parámetros (4.457.520 en total, 2.228.760 por capa parcheada) se inicializan por SVD truncada de las proyecciones originales de clave y valor, sin ningún paso de preentrenamiento continuado, SFT o RL. El autor mide explícitamente el daño introducido: la entropía cruzada sobre muestras de 512 tokens sube de 1,680312 a 1,734075 en una muestra fija y de 2,566605 a 2,569875 en prosa inglesa, es decir, el modelo es peor que la base por una cantidad conocida.

La relevancia del artefacto es metodológica: demuestra un procedimiento de retrofit de atención con caché KV latente sobre un transformer híbrido con bucles, con una prueba de preservación tensor a tensor (1115 tensores comparados, 0 discrepancias, diferencia absoluta máxima 0.0) y una estimación exacta del ahorro de caché a 1M de tokens (de 30,674 GiB a 14,223 GiB en BF16). Sirve como base para quien quiera entrenar el parche hasta recuperar la calidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con núcleo de bucle, 24 capas físicas, núcleo 6..17 con 3 pasadas) más operador `latent_kv` en capas 11 y 17 |
| Parametros totales | 26.390.870.064 |
| Parametros activos | no disponible (el autor no publica el recuento de expertos activos por token) |
| Longitud de contexto | no disponible (no se indica en la información proporcionada) |
| Tipos de cuantizacion | pesos en BF16; la base original está cuantizada en NVFP4/MXFP8 y este artefacto es la versión desconmutada y entrenable |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con módulo de código remoto propio (`modeling_inkling2_loop_patched.py`) |

## Arquitectura y entrenamiento

El modelo base `Inkling-2-Mini` de Thinking Machines emplea una arquitectura `inkling2_loop`: 24 capas físicas de las cuales el núcleo de bucle (capas 6 a 17) se ejecuta tres veces por forward, de modo que las capas parcheadas 11 y 17 se visitan en las posiciones 11/29/41 y 17/35/47. Combina capas de atención completa (5, 11, 17 y 23) con capas de ventana deslizante, e incorpora sesgos de posición relativa, sumideros de atención aprendidos, convoluciones cortas dinámicas y salida con puerta.

El parche reemplaza únicamente las proyecciones `k_proj` y `v_proj` de las capas 11 y 17 por un operador `latent_kv`: una proyección `kv_a_proj` (de tamaño oculto a rango 512) con escala por canal `kv_a_scale`, seguida de `kv_b_k` y `kv_b_v` (de rango 512 a las dimensiones de cabeza de clave y valor). No hay RoPE en el operador latente. Los factores se inicializan por SVD truncada de las proyecciones concatenadas originales, con error de reconstrucción relativo de 0,4785 y 0,4765 para claves y 0,5429 y 0,5195 para valores en las capas 11 y 17. Se conservan bit a bit `q_proj`, `o_proj`, el sesgo de posición relativa, los sumideros, las convoluciones cortas y la puerta de salida.

No se ha ejecutado ningún entrenamiento: ni preentrenamiento continuado, ni SFT, ni RLHF/DPO. La única "inicialización" es la SVD mencionada. La caché KV de cada slot parcheado almacena el latente de rango 512 más 64 taps de convolución corta por token, es decir, 576 elementos BF16 (1.152 bytes) frente a los 2.048 elementos (4.096 bytes) originales. A 1M de tokens, los seis slots parcheados (dos capas visitadas tres veces) pasan de 24.576 a 17.664 bytes por token, lo que reduce la caché BF16 de 30,674 GiB a 14,223 GiB (7,111 GiB en FP8 y 4,000 GiB en NVFP4); estas cifras son extrapolaciones exactas del diseño medido, no un forward real a 1M de tokens.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento de imagen y texto (`image-text-to-text`), ya que el pipeline declarado es multimodal.
- Razonamiento y generación de código: capacidades del modelo base, no verificadas en este artefacto.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo de pensamiento explícito (thinking mode), visión o audio: no disponible salvo la entrada de imagen indicada por el pipeline.
- Compresión de caché KV en las capas 11 y 17, que reduce el coste de memoria en contextos largos.

Advertencia: al no estar entrenado, ninguna de estas capacidades alcanza la calidad del modelo base; el propio autor desaconseja su uso en producción.

## Casos de uso

- Investigación sobre atención latente: el artefacto permite estudiar cómo se comporta una factorización MLA de rango 512 sobre un transformer con bucles, comparando logits y entropía cruzada contra la base con la misma semilla y muestra fija.
- Reproducción de experimentos de retrofit: el manifiesto `patch_manifest.json` y el módulo de código remoto permiten reconstruir el parche paso a paso y verificar la preservación tensor a tensor (1115 tensores, 0 discrepancias).
- Entrenamiento de recuperación ("healing"): el checkpoint es el punto de partida para preentrenamiento continuado o SFT que recupere la calidad perdida (+0,053763 nats en la muestra fija), midiendo la convergencia con la métrica ya definida por el autor.
- Estudio de ahorro de memoria en contextos largos: sirve para validar empíricamente la reducción de caché KV estimada (de 30,674 a 14,223 GiB en BF16 a 1M de tokens) en un entorno controlado.
- Desarrollo de kernels y backends: el campo `kernel_backend: recurrent` y los 64 taps de convolución corta por token permiten probar implementaciones alternativas de decodificación y recuperación de claves y valores.
- Docencia y divulgación técnica: como ejemplo didáctico de factorización SVD de proyecciones de atención, inicialización de operadores latentes y verificación de preservación de pesos en un modelo multimodal.
- Auditoría de artefactos experimentales: útil para evaluar prácticas de publicación (avisos de no entrenado, métricas de daño, manifiestos) en el ecosistema Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta entropía cruzada en nats sobre muestras de 512 tokens:

| Variante | Muestra fija (`CE_SAMPLE.md`) | Prosa inglesa |
|---|---|---|
| Base `thinkingmachines/Inkling-2-Mini` | 1,680312 | 2,566605 |
| Este artefacto (`latent_kv`, SVD rango 512) | 1,734075 | 2,569875 |
| Daño | +0,053763 | +0,003270 |

Además, se reporta el error de reconstrucción SVD de las proyecciones reemplazadas: 0,4785 y 0,4765 relativos para claves y 0,5429 y 0,5195 para valores en las capas 11 y 17.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,39 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 52,8 GB, por lo que se necesita al menos una GPU de 80 GB (A100, H100) o varias GPUs con paralelismo de tensor.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 141 GB; en consumer GPU no cabe en BF16.
- Cuantización: al ser un artefacto BF16 entrenable, se puede cuantizar a FP8 o NVFP4 para reducir memoria, aunque no se publican recetas ni verificaciones de calidad tras cuantizar.
- Opciones de despliegue: `transformers` 5.24.1 o superior con `trust_remote_code=True` y `AutoModelForImageTextToText`; no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI, y el código remoto propio complica su integración en esos motores.
- Latencia y throughput: no disponibles.
- Caché KV: a 1M de tokens, 14,223 GiB en BF16, 7,111 GiB en FP8 y 4,000 GiB en NVFP4, según extrapolación del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| RESMP-DEV/Inkling-2-Mini-MLA-LatentKV-Patched | 26,39 B | no disponible | Apache 2.0 | Experimental, no entrenado |
| thinkingmachines/Inkling-2-Mini (base) | no disponible en la información | no disponible | no disponible en la información | Modelo oficial, cuantizado NVFP4/MXFP8 |
| Alternativas de tamaño similar (p. ej. familia Qwen o Llama de ~27B) | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones suficientes para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- El checkpoint no está entrenado: el autor declara explícitamente que la calidad es peor que la del modelo base y que no debe usarse en producción.
- Daño medido: +0,053763 nats de entropía cruzada en la muestra fija y +0,003270 en prosa inglesa respecto a la base.
- Error de inicialización SVD: entre 0,4765 y 0,5429 relativo en las proyecciones de clave y valor reemplazadas.
- Solo se parchean dos capas (11 y 17); las capas de atención completa 5 y 23 y todas las de ventana deslizante quedan intactas, por lo que el ahorro de caché es parcial.
- Las cifras de caché a 1M de tokens son extrapolaciones del diseño medido, no resultados de un forward real.
- No se publican datos de sesgos, alucinación, idiomas soportados ni restricciones adicionales de licencia más allá de Apache 2.0.
- Requiere `trust_remote_code=True` y `transformers` 5.24.1 o superior, lo que implica ejecutar código del autor y limita la portabilidad a otros motores de inferencia.
- El modelo base está cuantizado en NVFP4/MXFP8 y este artefacto es su versión desconmutada en BF16, por lo que puede haber diferencias numéricas respecto al original cuantizado.

## Enlaces

- Hugging Face: https://huggingface.co/RESMP-DEV/Inkling-2-Mini-MLA-LatentKV-Patched
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Manifiesto del parche: `patch_manifest.json` incluido en el repositorio del modelo
- Módulo de código remoto: `modeling_inkling2_loop_patched.py` incluido en el repositorio del modelo
