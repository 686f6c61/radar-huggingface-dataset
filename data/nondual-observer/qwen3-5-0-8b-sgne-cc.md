# Nondual-Observer/Qwen3.5-0.8B-SGNE-CC

## Resumen

Qwen3.5-0.8B-SGNE-CC es un parche de pesos (no un modelo completo) publicado por el usuario Nondual-Observer sobre el modelo base Qwen/Qwen3.5-0.8B de Alibaba. El parche, de tan solo 3,13 MiB en formato NPZ BF16, aplica una edicion de pesos denominada SGNE-CC (Spherical Gated Norm-preserving Edit, Column-Constrained) derivada del estudio "DNA Weight Editing" del autor. El resultado es un checkpoint BF16 que se ensambla localmente descargando el modelo base oficial y aplicando el delta sobre determinadas matrices de las capas feed-forward y de las capas recurrentes GatedDeltaNet.

El interes del artefacto es metodologico: demuestra que una modificacion quirurgica de un subconjunto muy pequeno de pesos (0,270% de los pesos de texto, 2.032.640 escalares) puede alterar de forma medible el comportamiento de razonamiento matematico y de generacion de codigo en un modelo de 0,8B parametros. Frente al parche de referencia MIT-p50c, que infla hasta un 114% la norma de columna de las matrices editadas, SGNE-CC preserva dichas normas dentro del redondeo BF16 (desviacion maxima del 0,1625%), lo que segun el autor reduce artefactos y mejora la estabilidad del razonamiento.

El modelo base pertenece a la familia Qwen3.5 e incorpora una arquitectura hibrida con atencion clasica y capas recurrentes GatedDeltaNet. El parche mantiene la licencia Apache-2.0 del modelo original y esta pensado para investigadores que quieran reproducir el estudio o experimentar con edicion de pesos sin reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion y capas recurrentes GatedDeltaNet (modelo base Qwen3.5-0.8B) |
| Parametros totales | 0,8B (modelo base); el parche modifica 2.032.640 escalares (0,270% de los pesos de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el estudio evalua con limite de generacion de 32.768 tokens nuevos |
| Tipos de cuantizacion | no disponible (el parche se distribuye en BF16; el checkpoint ensamblado puede cuantizarse con herramientas estandar, pero no se especifica) |
| Idiomas soportados | en, zh, ru, de, es, fr, ja, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | NPZ (delta BF16, `sgne_cc_dna_delta.npz`); el script genera un checkpoint BF16 en safetensors cargable por Transformers, vLLM y SGLang |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer hibrido: combina capas de atencion convencional con capas recurrentes lineales GatedDeltaNet. El parche SGNE-CC no reentrena el modelo; aplica una edicion de pesos sobre 802 columnas de `mlp.down_proj` en 15 capas feed-forward y 1.182 columnas de `linear_attn.out_proj` en 9 capas recurrentes GatedDeltaNet, ademas de una unica fila de compuerta (fila 12 de la capa 16, 1 de 288 filas). Las capas de atencion no se tocan.

La innovacion tecnica es la restriccion geometrica de la edicion: la norma de cada columna editada se conserva dentro del redondeo BF16 (ratio en [0,998375, 1,001620], desviacion maxima 0,1625%), con un angulo de rotacion mediano de 8,8 grados (maximo 93,7 grados). El primer modo singular concentra el 67,58% de la energia de actualizacion en la capa 15, el 73,43% en la capa 19 y el 55,92% en la capa 23. El script `apply_dna_patch.py` verifica checksums SHA-256 del modelo base y del parche y comprueba la geometria en FP64 antes de ensamblar el checkpoint. No se detalla la composicion del dataset de entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto en ocho idiomas (en, zh, ru, de, es, fr, ja, ar).
- Razonamiento matematico: el parche eleva MATH-500 del 7,8% del base al 47,0% en la evaluacion completa de 500 problemas.
- Razonamiento simbolico y logico: BBH-160 pasa del 1,9% del base al 41,3%.
- Generacion de codigo Python: HumanEval-164 sube del 15,9% al 28,0%.
- Razonamiento multilingue: MGSM-240 en seis idiomas alcanza el 41,7% frente al 25,8% del base.
- Generacion multimodal de voz: MultiSpeech-64 en ocho idiomas alcanza el 35,9% frente al 3,1% del base (segun la metrica automatica del autor).
- Modo de razonamiento con cadenas largas (hasta 32.768 tokens nuevos en la evaluacion).
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en edicion de pesos: reproducir el estudio DNA Weight Editing aplicando el parche sobre Qwen3.5-0.8B y comparando la geometria de pesos con MIT-p50c mediante `apply_dna_patch.py --verify-only`, que valida en FP64 sin escribir el checkpoint a disco.
- Evaluacion de metodos de intervencion en modelos pequenos: usar el parche como linea base controlada para medir como cambia el rendimiento en MATH-500, BBH o HumanEval al modificar un 0,270% de los pesos, aislando el efecto de la preservacion de normas frente al rango de actualizacion.
- Prototipado de razonamiento matematico en entornos con recursos limitados: el modelo ensamblado de 0,8B en BF16 ocupa aproximadamente 1,75 GB, por lo que puede ejecutarse en una GPU consumer para experimentos de aritmetica y algebra con cadenas de razonamiento de hasta 32.768 tokens.
- Generacion de codigo Python en pipelines de evaluacion: con HumanEval-164 al 28,0%, sirve para probar harnesses de evaluacion de codigo o como generador de borradores en entornos de integracion continua donde el coste por token es critico.
- Experimentos multilingues de razonamiento: con soporte para arabe, japones, ruso y chino, permite estudiar transferencia de razonamiento entre idiomas con MGSM-240 como referencia.
- Docencia y divulgacion sobre interpretabilidad: el parche es lo bastante pequeno (3,13 MiB) para inspeccionarlo manualmente y explicar en clase como una edicion localizada en capas feed-forward y recurrentes afecta al comportamiento del modelo.
- Verificacion de integridad de checkpoints: el script de aplicacion comprueba SHA-256 y geometria en FP64, util como ejemplo de pipeline reproducible de distribucion de deltas de pesos.

## Benchmarks y rendimiento

Resultados publicados por el autor en BF16 con limite de 32.768 tokens nuevos. La fila de MATH-500 con media de cuatro ejecuciones en vLLM solo aplica a Base y MIT-p50c; SGNE-CC proviene de una unica ejecucion directa en PyTorch.

| Benchmark / metrica | Qwen3.5-0.8B | MIT-p50c | SGNE-CC |
|---|---|---|---|
| Desviacion maxima de norma de columna (BF16) | 0,0000% | +114,2614% | 0,1625% |
| MATH-500, 100 problemas (temp. 0: estricto / fallback) | 0% / 7% | 4% / 20% (96% truncados) | 44% / 45% (10% truncados, 6,0k tok) |
| MATH-500, 500 problemas (tarjeta, PyTorch directo) | 7,8% (39/500) | 51,8% (259/500, 21,1k tok) | 47,0% (235/500, 5,3k tok) |
| MATH-500, 500 problemas (media de 4 ejecuciones vLLM) | 7,9% | 48,1% (22,0k tok) | 47,0% (4,1x mas corto) |
| MGSM-240 (6 idiomas) | 25,8% (62/240) | 57,1% (137/240) | 41,7% (100/240, p = 9,04e-5) |
| BBH-160 (logica simbolica) | 1,9% (3/160) | 50,6% (81/160) | 41,3% (66/160, p = 0,058) |
| HumanEval-164 (Python) | 15,9% (26/164) | 31,1% (51/164) | 28,0% (46/164, p = 0,47) |
| MultiSpeech-64 (8 idiomas, temp. 0) | 3,1% (2/64) | 26,6% (17/64) | 35,9% (23/64, p = 0,21) |

Los p-valores son nominales y una diferencia no significativa no demuestra equivalencia entre modelos. Solo hay una ejecucion directa por tarea y los registros no documentan la asignacion de GPU por fichero.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,75 GB para el checkpoint ensamblado (tamano del modelo base Qwen3.5-0.8B), mas overhead de activaciones y cache KV segun la longitud de contexto.
- Cabe en cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) con margen amplio.
- El parche en si ocupa 3,13 MiB y su aplicacion requiere CPU y disco; la verificacion FP64 puede ejecutarse sin GPU.
- Opciones de despliegue: Transformers, vLLM y SGLang segun la model card; llama.cpp y Ollama no se mencionan en la informacion disponible.
- Decodificacion recomendada por el autor: temperatura 0,6, top_p 0,95, top_k 20 y penalizacion de presencia 1,5; tambien funciona en decodificacion voraz (temperatura 0 sin penalizacion de presencia).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 (500) | HumanEval-164 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0,8B | no disponible | 7,8% | 15,9% | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B + MIT-p50c | 0,8B | no disponible | 51,8% | 31,1% | Apache-2.0 (modelo base) | Parche de pesos |
| Qwen3.5-0.8B-SGNE-CC | 0,8B | no disponible | 47,0% | 28,0% | Apache-2.0 | Hugging Face (parche) |

No se dispone de datos de otros modelos de 0,8B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance causal no aislado: la preservacion de normas se mide directamente sobre los pesos, pero separar su efecto causal del rango de actualizacion, la seleccion de capas y la fila de compuerta de la capa 16 requiere experimentos adicionales.
- Menor rendimiento que MIT-p50c en algunos regimenes: con los ajustes de la model card, SGNE-CC obtiene resultados inferiores a MIT-p50c en MGSM-240 y en la ejecucion directa de MATH-500 completa, aunque con salidas mucho mas cortas (5,3k frente a 21,1k tokens) y menos truncamientos.
- El filtro automatico de MultiSpeech-64 comprueba umbrales de finalizacion y repeticion, no exactitud factual; SGNE-CC conserva fallos de repeticion en aleman.
- Una unica ejecucion directa por tarea: los resultados no incluyen intervalos de confianza robustos y los p-valores son nominales.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo de 0,8B.
- Idiomas: aunque la model card declara ocho idiomas, el rendimiento fuera de ingles y chino no esta caracterizado mas alla de MGSM-240 y MultiSpeech-64.
- Licencia Apache-2.0 permite uso comercial del codigo y del parche, pero el modelo base conserva su propia licencia; el texto de la model card queda truncado en el apartado de licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de terceros.

## Enlaces

- Hugging Face del parche: https://huggingface.co/Nondual-Observer/Qwen3.5-0.8B-SGNE-CC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del estudio DNA Weight Editing: https://github.com/Nondual-Observer/dna-weight-editing
- Deposito Zenodo: https://doi.org/10.5281/zenodo.24235218
- Blog de referencia sobre programacion en espacio de pesos (MIT CSAIL): https://rikiyat.github.io/blog/weight-space-programming/
- README en ruso: https://huggingface.co/Nondual-Observer/Qwen3.5-0.8B-SGNE-CC/blob/main/README_RU.md
