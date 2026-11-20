# ikimyaii/Mamba-370M-unstructured-SparseGPT-70pct

## Resumen

Mamba-370M-unstructured-SparseGPT-70pct es una variante podada del modelo state-spaces/mamba-370m-hf, desarrollada por el usuario ikimyaii. Se trata de un checkpoint experimental que aplica poda no estructurada one-shot (sin reentrenamiento) mediante el código oficial de SparseGPT, reduciendo la densidad de las capas lineales internas de los bloques Mamba hasta una esparsidad medida del 68,61 %. El modelo conserva la arquitectura Mamba original (modelo de espacio de estados selectivo, SSM) y se publica como referencia base para otros modelos del mismo autor.

El interés técnico reside en que demuestra la aplicabilidad de SparseGPT a arquitecturas SSM en lugar de transformers, un terreno poco explorado. La poda afecta a las proyecciones internas de cada bloque (`in_proj`, `x_proj`, `out_proj`) mientras que `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y la cabeza de lenguaje permanecen densos. El resultado es un modelo de 423 millones de parámetros totales con un repo de 0,8 GB, cargable con `transformers` estándar.

No obstante, el rendimiento tras la poda es muy degradado: la perplejidad en WikiText-2 asciende a 87,23 y en C4 a 98,08, y la media de precisión zero-shot en lm-evaluation-harness cae al 37,02 %. Se trata, por tanto, de un artefacto de investigación y no de un modelo apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, state-space model) |
| Parametros totales | 423.003.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es state-spaces/mamba-370m-hf, un modelo de espacio de estados selectivo (S6) con 370 millones de parametros nominales y 423 millones reales contabilizados en safetensors. La arquitectura Mamba sustituye la atencion por una recurrencia selectiva con parametros dependientes de la entrada (`dt_proj`, `A_log`, `D`) y convoluciones causales 1D (`conv1d`), lo que permite inferencia con coste lineal en la longitud de secuencia.

Sobre ese checkpoint se aplica poda no estructurada one-shot con el codigo oficial de SparseGPT (IST-DASLab/sparsegpt@147d215, modo `fasterprune`, blocksize 128, damping 0,01). La calibracion usa 128 secuencias de C4 de 2.048 tokens con semilla 0. Los bloques se podan en orden, recalibrando cada uno sobre las salidas de los bloques ya podados. La poda se ejecuta en bfloat16 (Mamba desborda en fp16) y tarda 3,1 minutos en una A100 40GB. La mascara emplea un umbral por bloque de 128 columnas, por lo que las filas quedan desbalanceadas: en las 192 capas podadas, la fila mas densa tiene de media 1,49 veces los no-ceros de la fila media (peor capa: 2,25 veces). La esparsidad medida final es 0,6861. No hubo reentrenamiento ni fine-tuning posterior.

## Capacidades

- Generacion de texto autoregresiva basica, muy degradada por la poda.
- Razonamiento y conocimiento factual limitados: la media zero-shot en lm-evaluation-harness es 0,3702, cerca del azar en varias tareas.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- Capacidades multilingues: no documentadas; el entrenamiento del modelo base es predominantemente en ingles.
- No dispone de modo thinking, vision ni audio.
- Sirve como referencia de esparsidad para comparar con los modelos EHWS del mismo autor.

## Casos de uso

- Investigacion sobre poda en arquitecturas SSM: permite reproducir y comparar el efecto de SparseGPT sobre Mamba frente a transformers, usando la configuracion exacta documentada (blocksize 128, damping 0,01, calibracion C4).
- Baseline de esparsidad en estudios academicos: sirve como punto de partida para medir la mejora de tecnicas posteriores (reentrenamiento, poda estructurada, EHWS) sobre el mismo checkpoint base.
- Validacion de pipelines de evaluacion: util para verificar implementaciones de perplejidad con el protocolo ELSA y de lm-evaluation-harness en modelos Mamba, dado que reproduce numeros concretos y verificables.
- Analisis de desbalanceo de mascaras: el patron de no-ceros por fila (ratio 1,49x de media, 2,25x en la peor capa) es un caso de estudio para investigar el impacto del desbalanceo en la calidad del modelo.
- Pruebas de carga e integracion: al cargarse con `AutoModelForCausalLM.from_pretrained` en `transformers` estandar, sirve para testear tooling de serializacion y despliegue de modelos Mamba podados.
- Docencia y divulgacion: ejemplo didactico de poda one-shot sobre un modelo pequeno (0,8 GB) que cabe en cualquier GPU consumer para experimentos.

## Benchmarks y rendimiento

Perplejidad (protocolo ELSA, evaluacion en bf16):

| Metrica | WikiText-2 | C4 |
|---|---|---|
| Este modelo | 87,23 | 98,08 |

Precision zero-shot (lm-evaluation-harness):

| Tarea | Este modelo |
|---|---|
| arc_challenge | 0,1852 |
| arc_easy | 0,3653 |
| boolq | 0,6000 |
| hellaswag | 0,2859 |
| openbookqa | 0,1200 |
| rte | 0,5271 |
| winogrande | 0,5083 |
| Media | 0,3702 |

No se han publicado en la informacion disponible los resultados del modelo base sin podar ni de modelos comparables, por lo que no se puede cuantificar la degradacion relativa exacta.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,85 GB solo para pesos (423 M parametros x 2 bytes), mas activaciones y cache de estado; en la practica cabe en GPUs con 4 GB o mas.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- GPU recomendadas para experimentacion: RTX 3090/4090 o A100 si se quiere reproducir el proceso de poda (3,1 minutos en A100 40GB).
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained` (soporte Mamba nativo). No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; la poda no estructurada no se acelera en hardware convencional sin kernels especificos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| ikimyaii/Mamba-370M-unstructured-SparseGPT-70pct | 423 M | no disponible | no disponible | Podado one-shot, PPL WT2 87,23 |
| state-spaces/mamba-370m-hf (base) | ~370 M | no disponible | Apache 2.0 (segun el modelo base original) | Modelo denso de referencia |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | Mencionados como comparacion interna, sin datos publicos en esta ficha |

No se dispone de datos de benchmarks del modelo base ni de los EHWS en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Calidad muy degradada: perplejidad de 87,23 en WikiText-2 y media zero-shot de 0,3702, con tareas como openbookqa (0,12) por debajo del azar.
- Poda sin reentrenamiento: no hay recuperacion de capacidad; el checkpoint es un baseline, no un modelo utilizable.
- Mascara desbalanceada por filas (hasta 2,25x el numero medio de no-ceros), lo que complica la aceleracion real en hardware y puede introducir sesgos locales.
- Riesgo elevado de alucinacion y de generacion incoherente dado el bajo rendimiento.
- Licencia no especificada: no se puede asumir uso comercial; hay que consultar la licencia del modelo base (state-spaces/mamba-370m-hf) antes de cualquier uso.
- Idiomas no documentados; el modelo base esta entrenado principalmente en ingles.
- Longitud de contexto no disponible en la model card.
- Desbordamiento en fp16 documentado: debe usarse bf16 para evitar inestabilidad numerica.
- Repo con 0 descargas y 0 likes: sin validacion comunitaria ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-unstructured-SparseGPT-70pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
- Paper de SparseGPT: https://arxiv.org/abs/2301.00774
- Paper de Mamba: https://arxiv.org/abs/2312.00752
