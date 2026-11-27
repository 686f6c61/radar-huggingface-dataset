# RESMP-DEV/Inkling-2-Mini-MLA-LatentKV-Looping-3Layer-HealProbe

## Resumen

Inkling-2-Mini-MLA-LatentKV-Looping-3Layer-HealProbe es un artefacto de investigación publicado por RESMP-DEV que aplica una retrofirma estructural de tipo MLA (Multi-head Latent Attention) sobre los pesos oficiales de `thinkingmachines/Inkling-2-Mini`. El modelo base es un transformer MoE multimodal (image-text-to-text) con arquitectura `inkling2_loop` de 24 capas físicas, núcleo de bucle entre las capas 6 y 17 y tres pasadas de bucle. La retrofirma factoriza las proyecciones de clave y valor de tres de las cuatro capas de atención completa (5, 11 y 17) a través de un latente de rango 512, dejando intacta la capa 23.

El checkpoint incorpora además una "sonda de curación" (heal probe) de 16.384 tokens: 32 pasos de optimizador sobre un corpus agéntico propio, con adaptadores LoRA de rango 64 sobre las proyecciones de atención. El autor advierte explícitamente de que el modelo **no está entrenado** y **no es apto para uso en producción**: no ha habido preentrenamiento continuado completo, ni SFT, ni RL.

La relevancia del artefacto es metodológica: demuestra que una factorización latente de KV cache combinada con el bucle de capas del propio modelo puede reducir el coste de caché por token de 32.768 a 12.160 bytes en BF16 (de 30,674 GiB a 11,481 GiB por sesión a 1M de contexto), y que una reparación mínima de 16.384 tokens puede recuperar el daño de la retrofirma. Los pesos se distribuyen en BF16 (el base está cuantizado en NVFP4/MXFP8 y aquí se ha desquantizado), con 26.393.098.824 parámetros totales y 53,2 GB de repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer MoE con bucle de capas; 24 capas físicas, núcleo de bucle 6..17, 3 pasadas) |
| Parametros totales | 26.393.098.824 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor extrapola escenarios a 1M de contexto) |
| Tipos de cuantizacion | BF16 en este artefacto; el base está en NVFP4/MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, `custom_code`) |
| Parametros nuevos del parche | 6.686.280 (2.228.760 por capa parcheada) |
| Parametros LoRA de la sonda | 26.738.688 (rango 64, alpha 64) |
| Parametros entrenables totales | 33.424.968 |
| Capas reemplazadas | 5, 11 y 17 (capa 23 intacta) |
| Operador nuevo | `latent_kv` (claves y valores factorizados por latente de rango 512, sin RoPE) |
| Coste de caché por token | 1152 bytes por slot parcheado (frente a 4096 del base) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base `thinkingmachines/Inkling-2-Mini` emplea una arquitectura híbrida con 24 capas físicas, de las cuales 20 son de ventana deslizante y 4 de atención completa. Un núcleo de bucle entre las capas 6 y 17 se recorre tres veces. Incluye una torre de visión, expertos enrutados (MoE) y una cabeza MTP (multi-token prediction). El artefacto de RESMP-DEV sustituye el operador de atención de las capas 5, 11 y 17 por un operador `latent_kv`: las proyecciones `k_proj` y `v_proj` originales se reemplazan por `kv_a_proj` (de dimensión oculta a rango 512) con una escala por canal `kv_a_scale`, seguida de `kv_b_k` y `kv_b_v` (de rango 512 a las dimensiones de cabeza de clave y valor). Los factores latentes se inicializan mediante SVD truncada de las proyecciones concatenadas de clave y valor del base, de modo que el operador arranca cerca del modelo original.

El resto de componentes se conserva bit a bit: `q_proj`, `o_proj`, el sesgo de posición relativa, los sumideros de atención aprendidos, las convoluciones cortas y la salida con compuerta de las capas reemplazadas. La capa 23 se deja intacta deliberadamente porque, al ser visitada una sola vez por el bucle, su parcheo cuesta 0,4306 nats de daño por los mismos 2,9 GiB de ahorro que consigue la capa 5. La caché almacena el latente de 512 dimensiones más 64 taps de convolución corta por token, con la expansión y la convolución ejecutadas tras la recuperación.

El entrenamiento se limita a la sonda de curación: 32 pasos de optimizador de 512 tokens cada uno (16.384 tokens), semilla 20261130, AdamW con dos grupos de parámetros (parámetros del parche a 1,444e-4, adaptadores LoRA a 5,174e-4), decaimiento coseno desde el primer paso, sin warmup, recorte de gradiente a 1,0, sobre un flujo de corpus empaquetado de 1.270 registros agénticos propios con separación por EOS y barajado. No ha habido preentrenamiento continuado, SFT ni RL. Según el autor, la escalera de ventana fija no repara el artefacto en ningún peldaño (4096 tokens: 1,5615; 8192: 1,5989; 16.384: 1,5575; 32.768: 1,6457, todos peores que el 1,5458 sin entrenar); solo el empaquetador de corpus completo lo consigue.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base multimodal.
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de visión intacta.
- Razonamiento agéntico: el corpus de curación es de naturaleza agéntica, aunque no se documentan capacidades específicas de tool calling o function calling en la información disponible.
- Soporte de arquitectura MoE con expertos enrutados (sin datos sobre número de expertos ni parámetros activos).
- Cabeza MTP (multi-token prediction) preservada del base.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido o thinking mode: no disponible.
- El artefacto **no está entrenado** para uso general; sus capacidades efectivas son las del base menos el daño de la retrofirma, parcialmente reparado por la sonda.

## Casos de uso

- Investigación sobre eficiencia de KV cache: el artefacto sirve como banco de pruebas reproducible para medir el ahorro de memoria de una factorización latente MLA sobre un transformer con bucle de capas, comparando el coste por token (1152 bytes frente a 4096) y el daño en cross-entropy.
- Estudio de recetas de reparación post-retrofirma: permite evaluar cuántos tokens de curación son necesarios para recuperar un parche estructural (16.384 tokens como mínimo medido) y por qué la escalera de ventana fija falla frente al empaquetado de corpus completo.
- Servicio de inferencia de alta concurrencia a contexto largo (experimental): con 11,481 GiB de caché BF16 por sesión a 1M de contexto frente a 30,674 del base, un presupuesto de 40 GiB de KV admitiría hasta 3,48 sesiones concurrentes frente a 1,30, siempre que se acepte el estado no productivo del checkpoint.
- Base para experimentos de destilación o continued-pretraining: al estar en BF16 y ser entrenable (a diferencia del base cuantizado en NVFP4/MXFP8), es adecuado como punto de partida para investigación que requiera pesos en coma flotante.
- Evaluación comparativa de operadores de atención: el parche `latent_kv` sin RoPE, con inicialización por SVD truncada, puede compararse contra el hermano de recurrencia con compuerta cero mencionado por el autor.
- Docencia y divulgación técnica: ilustra de forma concreta el compromiso entre ahorro de memoria, daño de cross-entropy y coste de reparación en arquitecturas con bucle de capas y atención híbrida.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Solo reporta cross-entropy en nats sobre un holdout agéntico propio (ocho ventanas disjuntas de 512 tokens, 4096 tokens de seis registros), calculada con el desplazamiento de etiquetas del propio modelo sobre el artefacto BF16:

| Variante | CE en holdout propio | Diferencia frente al base |
|---|---|---|
| Base `thinkingmachines/Inkling-2-Mini` | 1,5088 | 0 |
| Este artefacto, sin entrenar | 1,5458 | +0,0370 |
| Este artefacto, tras sonda de 16.384 tokens | 1,4786 | -0,0302 |

El autor advierte de que las mismas ocho ventanas no constituyen un benchmark independiente y que la configuración se seleccionó sobre ellas. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para pesos: el repositorio ocupa 53,2 GB en BF16; la inferencia requiere al menos ese espacio más activaciones y caché. No se dispone de estimaciones para cuantizaciones de 8 o 4 bits de este artefacto.
- Caché KV: 12.160 bytes por token (frente a 32.768 del base) en BF16; a 1M de contexto, 11,481 GiB por sesión, más 0,156 GiB por sesión de las 20 capas de ventana deslizante.
- GPU recomendadas: no disponibles explícitamente; por tamaño de pesos, un solo A100 80 GB o H100 80 GB resulta el mínimo razonable en BF16. No cabe en GPUs de consumo (RTX 4090 de 24 GB) sin cuantización agresiva, que no se documenta.
- Despliegue: la model card solo referencia `transformers` con `custom_code`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el operador `latent_kv` personalizado probablemente requiere soporte específico.
- Latencia y throughput: no disponibles. El autor solo aporta un cálculo de concurrencia (3,48 sesiones frente a 1,30 en un presupuesto de 40 GiB de KV) que excluye pesos, expertos enrutados, activaciones y sobrecarga de runtime, por lo que es una cota superior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Este artefacto (RESMP-DEV) | 26,39B | no disponible (extrapola a 1M) | Apache 2.0 | Experimental, no entrenado | BF16, parche MLA en 3 capas, sonda de 16.384 tokens |
| `thinkingmachines/Inkling-2-Mini` (base) | no disponible | no disponible | Apache 2.0 (según este repo) | Modelo oficial | NVFP4/MXFP8, 32.768 bytes/token de caché |
| Hermano de recurrencia con compuerta cero (mencionado por el autor) | no disponible | no disponible | no disponible | Experimental | Inicialización distinta; no arranca cerca del base |

No se dispone de datos suficientes para comparar con alternativas de otros autores de la misma categoría (MoE multimodal con atención latente). La comparación más significativa es interna, frente al checkpoint base.

## Limitaciones y advertencias

- **No entrenado y no apto para producción**: el autor lo declara explícitamente; no ha habido preentrenamiento continuado, SFT ni RL.
- **Daño medido**: sin la sonda, el artefacto pierde 0,0370 nats de cross-entropy frente al base en el holdout propio; con la sonda, mejora 0,0302 nats, pero sobre un conjunto no independiente y usado para seleccionar la configuración.
- **Riesgo de sobreajuste a la receta**: la escalera de ventana fija no repara el artefacto en ningún peldaño, lo que sugiere sensibilidad al empaquetado del corpus y al orden de los datos.
- **Sesgos**: no documentados; los del modelo base no se detallan en la información disponible.
- **Alucinación**: no evaluada; sin benchmarks estándar no puede caracterizarse.
- **Idiomas**: no disponibles; no se especifica cobertura multilingüe.
- **Contexto**: la longitud de contexto nativa no se documenta; las cifras a 1M son extrapolaciones exactas del diseño de caché medidas tras un forward de 16 tokens, no un forward real a 1M.
- **Concurrencia**: el cálculo de 3,48 sesiones es una cota superior que excluye pesos, expertos, activaciones y sobrecarga.
- **Licencia**: Apache 2.0 permite uso comercial, pero el estado experimental y la falta de entrenamiento hacen desaconsejable cualquier despliegue productivo.
- **Compatibilidad**: requiere `custom_code` y un operador `latent_kv` propio; no se garantiza soporte en runtimes de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RESMP-DEV/Inkling-2-Mini-MLA-LatentKV-Looping-3Layer-HealProbe
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión del base referenciada: `c9d028302cd0f035fdf8e7e91f089a4ce94d2195`
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
