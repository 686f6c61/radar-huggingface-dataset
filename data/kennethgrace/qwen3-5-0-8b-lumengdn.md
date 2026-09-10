# kennethgrace/Qwen3.5-0.8B-LumenGDN

## Resumen

Qwen3.5-0.8B-LumenGDN es un experimento de cirugía de modelos publicado por el usuario kennethgrace sobre `Qwen/Qwen3.5-0.8B-Base`. El punto de partida es un híbrido 3:1 cuyo campo `layer_types` se lee como `lllA` seis veces: 18 de sus 24 capas ya eran Gated DeltaNet (atención lineal recurrente) y solo 6 eran atención. La operación sustituye esas 6 capas de atención por DeltaNets plegadas, de modo que el modelo completo pasa a ser recurrente: no queda atención en ninguna capa y, por tanto, no hay caché KV en ningún punto. El estado asociativo tiene tamano fijo (31,69 MiB en fp32) y la actualización por token es O(1) con independencia de la longitud de contexto.

El modelo no está "curado" (healed). Las 18 capas que el donante ya había entrenado como DeltaNet conservan sus pesos, pero las 6 capas plegadas son trasplantes que nunca han recibido un paso de gradiente y que además pierden la posición rotatoria en el plegado. El propio autor advierte de salida degradada y lo publica como punto de partida para ese entrenamiento posterior y como registro verificable del trasplante, no como modelo desplegable. Como referencia, sobre una porción reservada de una mezcla de Common Pile, el modelo obtiene perplejidad 23,44 frente a 9,22 del híbrido intacto.

Su relevancia es de investigación: demuestra que es posible colapsar las pocas capas de atención de un híbrido en capas recurrentes conservando geometría de cabezas propia, con las 18 capas originales trasplantadas de forma exacta (coseno 1.000000000000, peor error relativo 9,2e-05 en fp32). Es un artefacto de 771,5 millones de parámetros, licencia Apache 2.0, que requiere una librería de arquitectura externa (Lumen) y no carga con `AutoModel` de transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido modificado: 24 capas, todas Gated DeltaNet (atención lineal recurrente) tras plegar las 6 capas de atención del donante |
| Parámetros totales | 771.512.048 (771,5M) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens (contexto del donante Qwen3.5); el estado recurrente es constante en T, con cruce de consumo de memoria frente al híbrido intacto en ~822 tokens |
| Tipos de cuantización | No disponible: el repositorio publica únicamente pesos fp32 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (fp32) |

Datos adicionales verificables: tamano del repositorio 3,1 GB; creado y actualizado el 10 de septiembre de 2026; 0 descargas y 0 likes; pipeline no disponible. El estado recurrente en fp32 es de 31,69 MiB constantes, de los cuales 8,3M de números son memoria asociativa genuina. Del total de parámetros, la torre de visión (100,6M) y la cabeza de predicción multi-token (20,5M) han sido amputadas: esto es solo la ruta de texto.

## Arquitectura y entrenamiento

El donante es un híbrido con proporción 3:1 entre capas lineales y de atención. La intervención reemplaza cada capa de atención por una Gated DeltaNet que conserva la geometría de cabezas de la propia atención: 8 cabezas a dimensión 256, en lugar de las 16 a 128 de las DeltaNet del donante, con convoluciones cortas de identidad causal para que la capa calcule exactamente sus proyecciones trasplantadas y se gane la convolución durante el entrenamiento. Las proyecciones `q_proj` (su mitad de consulta), su mitad de puerta, `k_proj`/`v_proj` (radiodifundidas desde grouped-query attention) y `o_proj` se convierten en una DeltaNet. El recuento de parámetros sube 19,1M porque las proyecciones agrupadas de clave y valor se radiodifunden de 2 a 8 cabezas, de forma que cada estado posee su propia clave y valor en vez de compartirlos entre cuatro; esos duplicados son exactos en la inicialización.

El trasplante de las 18 capas originales es exacto: coseno 1.000000000000 sobre la capa decodificadora completa y peor error relativo de 9,2e-05 en fp32. Para reconciliar las dos librerías se ajustaron dos diales de configuración sin dañar pesos: `beta_max=1.0` (Lumen calcula `beta_max * sigmoid(b_proj(x))` donde Qwen calcula un sigmoide simple, y el valor por defecto de 2.0 habría duplicado silenciosamente la fuerza de escritura) y `norm_eps=1e-6`. Cuatro convenciones difieren entre ambas librerías y tres son silenciosas: una RMSNorm centrada que almacena `scale - 1`, un escalado de consulta `1/sqrt(d_k)` que la norma de salida no absorbe, y un escalado de decaimiento por cabeza fuera del softplus. Una quinta convención aparece solo por encima de este tamano, donde el donante ata cada par q/k a varias cabezas de valor; a 0,8B no ocurre, porque 16 cabezas de clave sirven a 16 cabezas de valor.

Las capas plegadas se calibraron contra la amplitud real que la atención del donante entrega a `o_proj`, medida con hooks: rms 0,075 en la capa 3 subiendo a 0,332 en la capa 23. Igualarla exactamente resulta aproximadamente el doble de lo conveniente. Se barrió la escala de escritura y apareció un mínimo interior: 106,97 de perplejidad con escala 0,00 (atención eliminada), 81,26 con 0,25, 80,12 con 0,50, 129,22 con 1,00 (amplitud del donante) y 208,46 con 1,25. La escala 0,50 se pliega en `head_norm` en tiempo de construcción. No ha habido RLHF, DPO ni ningún paso de entrenamiento posterior al trasplante: los pesos se publican en fp32 a propósito porque el error se acumula con la profundidad en una pila recién colapsada y bf16 no es seguro hasta aproximadamente mil pasos de entrenamiento.

## Capacidades

- Generación de texto autoregresiva sobre la ruta de texto del donante, con la amputación de visión y de la cabeza de predicción multi-token verificada como idéntica a nivel de logits (`max |logit diff| = 0.000e+00` frente a la ruta de texto del donante).
- Procesamiento de secuencias largas con estado de tamano constante: 31,69 MiB en fp32 independientemente de la longitud, sin caché KV, frente a los 6,00 GiB que exigirían las seis capas de atención del donante extrapoladas a sus 262.144 tokens de contexto.
- Actualización recurrente O(1) por token, con memoria asociativa de tamano fijo (8,3M números).
- Razonamiento y código: no evaluados en esta publicación; no hay datos de MMLU, HumanEval ni GSM8K.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales: no hay modo de pensamiento, ni visión, ni audio en esta publicación (la torre de visión fue amputada).
- Capacidad operativa real hoy: servir como punto de partida verificable para entrenar el modelo hasta convergencia ("healing"), y como registro reproducible del trasplante.

## Casos de uso

- Investigación sobre atención lineal y modelos recurrentes: el modelo permite medir el coste exacto de colapsar las capas de atención de un híbrido 3:1, con una línea base numérica publicada (perplejidad 23,44 frente a 9,22 del híbrido intacto) para comparar arquitecturas de estado fijo.
- Entrenamiento de recuperación ("healing"): partiendo de este checkpoint, 100M tokens de entrenamiento sobre una mezcla tipo Common Pile llevaron la pérdida de validación de 3,1544 a 2,2326 (perplejidad 9,32, 1,011x frente al donante), según registra el autor; el repositorio sirve como punto de partida medible para reproducir o superar esa cifra.
- Inferencia de contexto muy largo con memoria acotada: al no existir caché KV, el consumo de estado no crece con la secuencia, lo que resulta adecuado para experimentos de streaming o de secuencias de cientos de miles de tokens donde el híbrido intacto consumiría 6,00 GiB solo en KV a 262.144 tokens.
- Despliegue en hardware muy limitado en experimentos controlados: con 771,5M de parámetros en fp32 (~3,1 GB de pesos) y 31,69 MiB de estado por secuencia, cabe en GPUs de consumo con 8 GB o más, siempre que se asuma la degradación de salida documentada.
- Auditoría y verificación de trasplantes de pesos: la model card documenta error relativo, coseno, convenciones silenciosas de normalización y escalado, y el barrido de escala de escritura, lo que lo convierte en material de referencia para validar conversiones entre librerías.
- Estudio de geometría de cabezas en atención lineal: el modelo conserva la geometría de atención (8 cabezas a 256) en lugar de la de las DeltaNet del donante (16 a 128), lo que permite aislar el efecto de la geometría frente al de la regla de actualización.
- Docencia y divulgación técnica: como ejemplo reproducible de cirugía de modelos, con tablas de perplejidad y de memoria que ilustran el compromiso entre atención completa y estado recurrente fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son de pérdida y perplejidad de validación sobre una porción reservada de una mezcla de Common Pile, tomando como referencia el híbrido intacto:

| Variante | val loss | val ppl | x donante |
|---|---|---|---|
| Referencia (híbrido intacto) | 2,2217 | 9,22 | 1,00x |
| Atención eliminada, feed-forwards conservados | 3,4998 | 33,11 | 3,59x |
| Este modelo | 3,1544 | 23,44 | 2,54x |
| Curado, 100M tokens (no está en este repositorio) | 2,2326 | 9,32 | 1,011x |

Barrido de escala de escritura de las capas plegadas, medido antes de cualquier entrenamiento:

| Escala de escritura | val ppl | x donante |
|---|---|---|
| 0,00 (= atención eliminada) | 106,97 | 4,52x |
| 0,25 | 81,26 | 3,44x |
| 0,50 (valor plegado en `head_norm`) | 80,12 | 3,39x |
| 1,00 (amplitud del donante) | 129,22 | 5,47x |
| 1,25 | 208,46 | 8,82x |

Consumo de estado recurrente frente al híbrido intacto:

| Modelo | Parámetros | Estado recurrente (fp32) |
|---|---|---|
| Qwen/Qwen3.5-0.8B-Base, intacto | 873,4M | Crece con T |
| Ruta de texto amputada | 752,4M | Crece con T |
| Este modelo | 771,5M | 31,69 MiB, constante en T |

El híbrido intacto parte de 21,19 MiB a 64 tokens y llega a 43,69 MiB a 1024 tokens, creciendo 24,00 KiB por token; extrapolado al contexto propio de Qwen, 262.144 tokens, serían 6,00 GiB solo de caché KV.

## Requisitos de hardware

- VRAM estimada para los pesos: ~3,1 GB en fp32 (coincide con el tamano del repositorio), ~1,55 GB en fp16/bf16 y ~0,8 GB en int8, calculado a partir de los 771,5M de parámetros; no hay cuantizaciones publicadas en el repositorio. El autor indica que bf16 no es seguro hasta aproximadamente mil pasos de entrenamiento, por lo que fp32 es el formato previsto.
- Estado recurrente: 31,69 MiB en fp32 por secuencia, constante con la longitud de contexto. A diferencia de un modelo con atención, no hay caché KV que crezca con el número de tokens.
- GPU de consumo: sí cabe, tanto por pesos como por estado, en tarjetas con 8 GB o más (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB). No se documentan requisitos oficiales.
- GPU de datacenter: no se especifican; por tamano, A100, H100 o equivalentes son sobredimensionadas para un modelo de 771,5M, salvo para entrenamiento del "healing".
- Opciones de despliegue: no es una arquitectura de `transformers` y `AutoModel` no lo carga. Requiere la librería Lumen (https://github.com/latticedynamics/lumen) para la capa y el fichero `modeling_qwen35_lumen.py` incluido en el repositorio para el ensamblado. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI. Atención: `pip install lumen` instala un paquete distinto, una librería de visualización de datos de otros autores.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de latencia, solo la propiedad asintótica de actualización O(1) por token y estado constante.

## Comparativa con modelos similares

| Modelo | Parámetros | Naturaleza | Estado / contexto | val ppl (misma referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-LumenGDN | 771,5M | Totalmente recurrente (24 capas Gated DeltaNet) | 31,69 MiB constantes; contexto del donante 262.144 | 23,44 | Apache 2.0 | Safetensors fp32, requiere Lumen |
| Qwen/Qwen3.5-0.8B-Base (donante) | 873,4M | Híbrido 3:1 (18 DeltaNet + 6 atención) | Crece 24,00 KiB por token; 6,00 GiB a 262.144 tokens | 9,22 | Apache 2.0 | Pesos del donante en HuggingFace |
| Qwen3.5-0.8B-Base, ruta de texto amputada | 752,4M | Híbrido sin torre de visión ni cabeza MTP | Crece con T | No medida en la model card | Apache 2.0 | Derivado |
| kennethgrace/Qwen3.5-4B-LumenGDN | No disponible | Mismo plegado, con q/k atados a varias cabezas de valor | No disponible | No disponible | No disponible | HuggingFace |

No se han proporcionado datos de benchmarks comparativos con modelos de otros autores; la comparación disponible se limita a las variantes del propio donante y al modelo hermano de 4B.

## Limitaciones y advertencias

- No está curado: las 6 capas plegadas nunca han recibido un paso de gradiente y pierden la posición rotatoria en el plegado. El autor pide explícitamente no desplegarlo y anticipa salida degradada (perplejidad de validación 23,44 frente a 9,22 del híbrido intacto, 2,54x).
- Sesgos conocidos: no documentados. Al no estar entrenado tras el trasplante, el comportamiento fuera de la distribución del donante no está caracterizado.
- Riesgo de alucinación: no cuantificado en la información disponible; con perplejidad 2,54 veces la del donante, cabe esperar mayor degradación de coherencia y fidelidad.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni evalúa el comportamiento multilingüe. El contexto de 262.144 tokens es el del donante; no se ha validado el rendimiento del modelo recurrente a esas longitudes.
- Solo texto: la torre de visión (100,6M) y la cabeza de predicción multi-token (20,5M) están amputadas, de modo que no hay capacidades multimodales ni de decodificación especulativa con esa cabeza.
- Dependencia de código externo: no carga con `AutoModel`; requiere Lumen y un fichero de modelado incluido en el repositorio, lo que implica ejecutar código de modelado ajeno y complica la integración en pipelines estándar.
- Sin soporte en runtimes habituales: no hay evidencia de compatibilidad con vLLM, llama.cpp, Ollama u otros servidores de inferencia, ni cuantizaciones publicadas (GGUF, AWQ, GPTQ).
- Precisión numérica: los pesos son fp32 deliberadamente; usar bf16 antes de unos mil pasos de entrenamiento se considera inseguro por acumulación de error con la profundidad.
- Licencia: Apache 2.0, heredada del donante, sin restricciones comerciales declaradas, aunque el estado de investigación del modelo desaconseja cualquier uso en producción.
- Adopción nula: 0 descargas y 0 likes en el momento de los datos, sin validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kennethgrace/Qwen3.5-0.8B-LumenGDN
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Librería de arquitectura Lumen: https://github.com/latticedynamics/lumen
- Modelo hermano con q/k atados (caso de 4B): https://huggingface.co/kennethgrace/Qwen3.5-4B-LumenGDN
- Fichero de ensamblado incluido en el repositorio: `modeling_qwen35_lumen.py`
- La búsqueda web realizada no devolvió resultados relevantes para este modelo: los enlaces obtenidos corresponden a cronómetros en línea y no guardan relación con la ficha. No se han encontrado papers, blogs ni demos adicionales.
