# sinksilk/Yebb-Dense-0.8B-Base

## Resumen

Yebb Dense 0.8B Base es un checkpoint base de tipo decoder-only, denso y experimental, para continuacion de texto en chino e ingles, desarrollado por sinksilk (Si Chen) y publicado bajo licencia MIT. El modelo tiene 800.663.040 parametros reales (segun los pesos en Safetensors) y no debe confundirse con la cifra "40B" que aparece en el nombre del proyecto: esa cifra se refiere a los tokens de prediccion efectivos vistos durante el entrenamiento (40.000.142.733), no al numero de parametros.

Se trata de un modelo preentrenado puro, sin ajuste por instrucciones ni alineamiento de preferencias, por lo que su uso previsto es la continuacion de texto y la investigacion sobre recetas de entrenamiento y reproducibilidad. La arquitectura es un transformer denso de 24 capas con atencion de consultas agrupadas (GQA), FFN SwiGLU, RMSNorm y RoPE, con un tokenizador BPE byte-level propio de 64.000 entradas. La longitud de secuencia de entrenamiento es de 2.048 tokens y el contexto mas alla de esa cifra no ha sido validado.

La relevancia de esta ficha es doble: por un lado documenta un checkpoint intermedio con contabilidad de tokens publicada (ledger de entrenamiento y procedencia), algo poco habitual en modelos de este tamano; por otro, sus resultados de evaluacion interna son deliberadamente modestos y el autor los presenta como comprobaciones de desarrollo reutilizadas, no como puntuaciones de leaderboard. Es, por tanto, un artefacto de investigacion, no un asistente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, GQA, SwiGLU, RMSNorm, RoPE |
| Parametros totales | 800.663.040 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (longitud de entrenamiento; mas alla no validado) |
| Tipos de cuantizacion | no disponible (release en FP32; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors (2 shards, FP32) |

Detalles adicionales de configuracion: 24 capas, dimension oculta 1.536, 12 cabezas de consulta y 4 cabezas KV, dimension de cabeza 128, dimension intermedia FFN 4.096, epsilon RMSNorm 1e-5, RoPE theta 10.000, vocabulario de 64.000 tokens (BPE byte-level propio), matrices de embedding y salida no atadas (untied), checkpoint en el paso 174.596. El repositorio ocupa 3,2 GB e incluye codigo Python portatil con interfaz Transformers (`trust_remote_code`).

## Arquitectura y entrenamiento

El modelo es un transformer denso clasico con atencion de consultas agrupadas (12 Q / 4 KV), lo que reduce el coste de memoria de la KV cache frente a atencion multi-cabeza completa, y FFN SwiGLU en las 24 capas. El autor indica explicitamente que este checkpoint no contiene los expertos enrutados ni las capas FFN SiTU del modelo hermano Yebb MoE 2B. La implementacion portatil incluida en el repositorio recalcula el prefijo en cada paso y no implementa KV cache ni kernels de entrenamiento para Ascend, lo que limita su rendimiento en inferencia real.

El entrenamiento cubre 40.000.142.733 tokens de prediccion efectivos (tokens que contribuyen a la perdida en este checkpoint), repartidos en: web educativa china 12.000.020.161, web educativa inglesa 10.000.054.746, codigo educativo 6.000.026.798, reescrituras multi-estilo chinas 6.000.012.735, FineMath 3.200.039.091, reescrituras multi-estilo inglesas 1.999.991.544 y MiniMind 799.997.658; la categoria "English QA" figura con 0. El autor advierte que este ledger cuenta tokens con perdida, no texto unico semanticamente, y que no hay replay explicito pero tampoco certificacion de ausencia de duplicados entre fuentes. El tokenizador se entreno por separado sobre aproximadamente 10 GB de texto. No se documenta RLHF, DPO ni ninguna fase de alineamiento: es un checkpoint base intermedio.

## Capacidades

- Continuacion de texto libre en chino e ingles a partir de prompts de texto plano.
- Generacion autoregresiva con decodificacion greedy (el ejemplo oficial usa `do_sample=False`).
- Modelado de lenguaje general: el modelo aprende distribuciones de texto educativo, matematicas y codigo, pero no se ha validado como resolutor de tareas.
- Exposicion de log-probabilidades por token, util para puntuacion de candidatos y experimentos de investigacion.
- No soporta tool calling ni function calling de forma nativa.
- No soporta uso como agente ni razonamiento multi-paso; no hay modo "thinking".
- No tiene capacidades de vision ni audio.
- No es un asistente conversacional: el autor indica explicitamente que no debe usarse como chat.
- Multilinguismo limitado a zh y en; no se documentan otros idiomas.

## Casos de uso

- Investigacion sobre recetas de preentrenamiento: el repositorio publica ledger de tokens, procedencia y hashes, lo que permite reproducir y auditar la composicion del corpus en experimentos academicos.
- Estudio de tokenizadores: el tokenizador BPE byte-level de 64.000 entradas, entrenado sobre ~10 GB de texto, sirve como caso de analisis comparativo frente a tokenizadores multilingues establecidos.
- Puntuacion de candidatos por log-probabilidad: al exponer probabilidades por token, puede usarse como modelo de rescoring en pipelines de investigacion (por ejemplo, reranking de continuaciones en chino).
- Pruebas de exportacion y fidelidad numerica: el repo incluye `export_validation.json` y comprobaciones de redondeo FP32 batch frente a single, utiles para validar toolchains de conversion de pesos.
- Baseline de referencia para modelos pequenos en zh/en: sirve como punto de comparacion de perdida (NLL) en recetas de destilacion o pruning, dado que el autor publica la NLL ponderada por receta sobre 128 ventanas (2,60659386).
- Docencia y divulgacion: al ser un modelo de menos de 1.000 millones de parametros con pesos FP32 y codigo legible, es adecuado para explicar internals de transformers (GQA, SwiGLU, RoPE) en cursos.
- Experimentos de continuacion de texto controlados: generacion de continuaciones sobre corpus educativos para analisis linguistico, siempre con revision humana y sin uso como servicio al usuario.

## Benchmarks y rendimiento

Resultados de comprobaciones internas de desarrollo publicados por el autor para este checkpoint exacto (FP32 en CPU). No son puntuaciones oficiales de leaderboard ni estimaciones independientes de generalizacion.

| Comprobacion interna | Resultado |
|---|---|
| Panel fijo de 1.024 preguntas de opcion multiple | 334/1.024 (32,6172 %) |
| Subconjunto ARC Challenge | 105/384 (27,3438 %) |
| Subconjunto CEval | 91/256 (35,5469 %) |
| Subconjunto HellaSwag | 138/384 (35,9375 %) |
| Panel fijo separado de 352 preguntas | 111/352 (31,5341 %) |
| Seis completaciones de funciones Python elementales | 0/6 |
| NLL de tokens ponderada por receta, 128 ventanas fijas | 2,60659386 |

Notas metodologicas del autor: los resultados de opcion multiple usan puntuacion de candidato completo por log-probabilidad media por token; los paneles se reutilizaron durante el desarrollo; la prueba estricta de codigo son seis completaciones greedy y no equivale a HumanEval ni MBPP; la mejora del checkpoint de 40B sobre el de 20B en el panel principal no fue estadisticamente fiable (McNemar emparejado, p=0,4397). No hay datos publicados de MMLU, GSM8K ni HumanEval en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 3,2 GB solo para pesos (800,66 M parametros x 4 bytes), mas activaciones y overhead; en la practica conviene reservar 4-6 GB en funcion del batch y de la longitud de secuencia.
- En BF16/FP16 (conversion manual, no publicada como artefacto): aproximadamente 1,6 GB de pesos, por lo que caberia en GPUs consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB) es sobrada para FP32; para cargas por lotes o experimentos de entrenamiento se recomienda A100 o H100.
- Cabe en GPU consumer: si, incluso en FP32 en tarjetas con 6 GB o mas; en FP16/BF16 en tarjetas de 4 GB.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (validado con PyTorch 2.10.0 y Transformers 5.20.2 en CPU). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la implementacion portatil no implementa KV cache, lo que penaliza el throughput en generacion larga.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Yebb Dense 0.8B Base | 800.663.040 | 2.048 (entrenamiento) | zh, en | MIT | Base experimental, sin alineamiento; evaluacion interna ~32,6 % en panel de opcion multiple |
| Yebb MoE 2B Base (mismo autor) | no disponible en la informacion | no disponible | zh, en (presumible) | MIT (convencion Yebb) | Modelo hermano con expertos enrutados y FFN SiTU; datos no detallados en esta ficha |
| Modelos densos pequenos de referencia (p. ej. familia Qwen pequena, TinyLlama, SmolLM) | no disponible en la informacion | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer comparacion numerica |

No hay datos suficientes en la informacion proporcionada para una comparativa cuantitativa fiable con alternativas de la misma categoria; los unicos datos verificables son los del propio modelo y la existencia del hermano Yebb MoE 2B.

## Limitaciones y advertencias

- Modelo base sin instruction tuning ni alineamiento: no es un asistente y no debe desplegarse como chatbot orientado a usuarios.
- Calidad limitada: el autor documenta produccion de texto repetitivo, afirmaciones incorrectas, cuerpos de funcion vacios, indentacion invalida y algoritmos erroneos; 0/6 en completaciones de funciones Python elementales.
- Contexto corto: 2.048 tokens de entrenamiento; contextos superiores no han sido validados y el ejemplo oficial usa `use_cache=False`.
- Idiomas limitados a chino e ingles; no se documenta soporte para castellano ni otros idiomas.
- Riesgo de alucinacion alto en tareas factuales, coherente con un checkpoint intermedio de este tamano y con los resultados de opcion multiple (~32,6 %).
- Sesgos: no se documenta ninguna evaluacion de sesgos; el corpus es web educativa filtrada y codigo, con posible sesgo de dominio (educativo/matematico) y de las fuentes subyacentes.
- Duplicacion potencial en el corpus: el autor advierte que no certifica ausencia de contenido duplicado entre fuentes ni de material reescrito.
- Licencia MIT para pesos e implementacion, pero los materiales de entrenamiento originales conservan sus terminos especificos; el repositorio no redistribuye el corpus ni elimina condiciones de las fuentes.
- Codigo custom: requiere `trust_remote_code=True`; el autor recomienda revisar el codigo antes de habilitarlo.
- Rendimiento de inferencia: la implementacion portatil no tiene KV cache, lo que limita el throughput en produccion.
- Resultados de evaluacion no fiables como estimacion de generalizacion: paneles reutilizados durante el desarrollo y mejora sobre el checkpoint de 20B no significativa (p=0,4397).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinksilk/Yebb-Dense-0.8B-Base
- Perfil del autor: https://huggingface.co/sinksilk
- Modelo hermano Yebb MoE 2B Base: https://huggingface.co/sinksilk/Yebb-MoE-2B-Base
- Dataset MiniMind: https://huggingface.co/datasets/jingyaogong/minimind_dataset
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset Chinese FineWeb-Edu V2.1: https://huggingface.co/datasets/opencsg/Fineweb-Edu-Chinese-V2.1
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Common Pile educational code: https://huggingface.co/datasets/common-pile/stackv2_edu_filtered
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada.
