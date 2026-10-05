# plasmova/Nova-v2

## Resumen

Nova v2 es un modelo de lenguaje causal decoder-only de 176,2 millones de parametros publicado por el usuario plasmova en Hugging Face. Se distribuye como checkpoint compatible con Transformers, acompanado de tokenizer y codigo de modelado propio (custom code), bajo licencia Apache 2.0. Su arquitectura es un transformer clasico con mejoras modernas: grouped-query attention (12 cabezas de consulta y 4 de clave/valor), rotary position embeddings (RoPE), RMSNorm, red feed-forward SwiGLU y embeddings de entrada y cabeza de salida no atados.

El modelo esta pensado para generacion de texto con formato conversacional etiquetado (`<|user|>…<|assistant|>…<|end|>`), con una ventana de contexto maxima de 2.048 tokens y un vocabulario de 32.768 entradas. El tamano de 176M parametros lo situa en la categoria de modelos pequenos, aptos para ejecucion en CPU o en GPUs de consumo, lo que resulta relevante para experimentacion local, prototipado rapido y despliegues con requisitos de latencia y coste muy ajustados.

La relevancia de esta ficha es principalmente informativa: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, no incluye resultados de benchmarks y su entrenamiento se define como un objetivo de 3.000 millones de tokens, un volumen reducido en comparacion con los modelos pequenos actuales. Es, por tanto, un artefacto de investigacion o experimentacion personal mas que un modelo validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, con GQA, RoPE, RMSNorm y SwiGLU |
| Parametros totales | 176.192.256 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en Float32 (safetensors). No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas; solo se indica que los terminos de los datasets de origen siguen aplicando) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Float32 (tamano de repo 0,7 GB) |

Datos adicionales de arquitectura declarados por el autor: tamano oculto 768, 20 capas de transformer, 2.048 unidades en la red feed-forward, vocabulario de 32.768 tokens, embeddings y cabeza de salida no atados (untied), soporte de KV cache durante la generacion.

## Arquitectura y entrenamiento

Nova v2 es un transformer causal decoder-only de 20 capas con un tamano oculto de 768. La atencion usa grouped-query attention con 12 cabezas de consulta y 4 cabezas de clave/valor, lo que reduce el coste de memoria del KV cache frente a la atencion multi-cabeza completa. Incorpora rotary position embeddings para la codificacion posicional, RMSNorm como normalizacion y una feed-forward de tipo SwiGLU con dimension intermedia de 2.048. Los embeddings de entrada y la cabeza de salida no estan atados, lo que anade aproximadamente 25,2M de parametros adicionales solo en la matriz de salida. El codigo de modelado es propio del autor y se expone a traves de la interfaz de modelo causal de Transformers, con soporte de KV cache.

En cuanto al entrenamiento, la model card indica que el codigo de entrenamiento apunta a una ejecucion de 3.000 millones de tokens. No se especifica la composicion del dataset, la mezcla de idiomas, ni si hubo fases de ajuste por instrucciones con RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documenta el hardware de entrenamiento ni la duracion. No se declara ninguna innovacion tecnica adicional mas alla del uso combinado de GQA, RoPE, RMSNorm y SwiGLU, que son componentes estandar en la arquitectura transformer moderna.

## Capacidades

- Generacion de texto autoregresiva con decodificacion por muestreo (temperature, top-p, top-k, repetition penalty) y decodificacion greedy soportada por la interfaz de Transformers.
- Formato conversacional de un turno o multi-turno mediante las etiquetas `<|user|>` y `<|assistant|>`, con cierre de turno `<|end|>`.
- Generacion con KV cache activada (`use_cache=True`), lo que acelera la decodificacion token a token en contextos largos dentro del limite de 2.048 tokens.
- Capacidad de generacion de codigo, matematicas o razonamiento: no confirmada. No hay evaluacion publicada ni ejemplos que lo demuestren.
- Tool calling / function calling: no disponible. No se documenta soporte de plantillas de herramientas ni de esquemas JSON.
- Uso como agente o razonamiento multi-paso: no disponible. No hay soporte declarado de razonamiento encadenado explicito ni modo "thinking".
- Capacidades multilingues: no disponibles. La model card no lista idiomas y el vocabulario de 32.768 tokens no viene acompanado de desglose por lengua.
- Vision, audio u otras modalidades: no soportadas. Es un modelo exclusivamente de texto.
- Prompt recomendado por el autor (inferencia local): temperature 0,2, top-p 0,85, top-k 12, repetition penalty 1,12, `no_repeat_ngram_size=3`.

## Casos de uso

- Prototipado y experimentacion academica: con 176M parametros y pesos en Float32, el modelo se puede cargar en un portatil o en una CPU sin GPU dedicada, lo que permite probar pipelines de generacion, tokenizacion y plantillas de chat sin coste de infraestructura.
- Pruebas de integracion de codigo propio (`custom code`): sirve como banco de pruebas para validar el flujo `trust_remote_code=True` de Transformers, la serializacion safetensors y el registro de arquitecturas personalizadas en entornos controlados.
- Generacion de texto corto y asistencia basica: resumenes de fragmentos, reescritura de frases o generacion de respuestas breves dentro del limite de 2.048 tokens, adecuado cuando la latencia y el consumo importan mas que la calidad maxima.
- Fine-tuning especifico de dominio: al ser un modelo pequeno y con licencia Apache 2.0, es candidato para ajuste supervisado sobre datos propios (soporte tecnico interno, clasificacion generativa, normalizacion de texto) en una unica GPU de gama media.
- Educacion e investigacion en arquitecturas transformer: la combinacion de GQA, RoPE, RMSNorm y SwiGLU en un modelo de 20 capas y 768 de dimension oculta lo convierte en un caso de estudio manejable para analizar el efecto de cada componente.
- Generacion en el borde (edge) o entornos off-line: al ocupar aproximadamente 0,7 GB en Float32 y unos 0,35 GB en FP16 tras conversion, se puede desplegar en dispositivos con recursos limitados o en sistemas sin conectividad, siempre que se resuelva previamente la conversion de formato.
- Evaluacion comparativa de modelos pequenos: util como linea base adicional en estudios que comparen modelos de menos de 200M parametros, aunque carece de benchmarks publicados que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "no benchmark results are included with this release" y recomienda evaluar el modelo antes de desplegarlo. No se debe asumir ningun resultado en MMLU, HumanEval, GSM8K u otras tareas.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 0,70 GB en Float32 (formato publicado), 0,35 GB en FP16/BF16, 0,18 GB en INT8 y 0,09 GB en INT4 tras una conversion manual.
- KV cache: con 20 capas, 4 cabezas de clave/valor de 64 dimensiones y FP16, el coste es de aproximadamente 20 KB por token; en el contexto maximo de 2.048 tokens supone unos 42 MB, una cantidad despreciable.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en FP32 (por ejemplo GTX 1650, RTX 3050, T4); en FP16 basta con 1 GB. Tambien es viable en CPU, dado el reducido numero de parametros.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas, e incluso en GPUs integradas con memoria compartida suficiente. Tambien cabe en placas tipo Raspberry Pi con 4 GB de RAM en cuantizacion INT8 o inferior.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la via soportada oficialmente. llama.cpp, Ollama, vLLM y TGI no tienen soporte confirmado para esta arquitectura personalizada; requeririan implementar la arquitectura en el correspondiente backend o convertirla a un formato GGUF con soporte previo. No hay cuantizaciones publicadas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por peticion en ninguna configuracion de hardware. Dado el tamano, se espera una ejecucion interactiva en CPU moderna y muy rapida en GPU, pero se trata de una estimacion cualitativa, no de un dato medido.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de conocimiento general y deben verificarse en sus respectivas model cards antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Cuantizaciones oficiales | Rendimiento publicado |
|---|---|---|---|---|---|
| plasmova/Nova-v2 | 176,2M | 2.048 tokens | Apache 2.0 | No (solo Float32) | No disponible |
| Pythia-160M | 160M aprox. | 2.048 tokens | Apache 2.0 | No habituales | Si, benchmarks publicados por el autor |
| GPT-2 (124M) | 124M | 1.024 tokens | MIT | No | Si, evaluaciones ampliamente replicadas |
| SmolLM2-135M | 135M | 2.048 tokens | Apache 2.0 | Si, GGUF y otras | Si, benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Si, GGUF y otras | Si, benchmarks publicados |

Diferencias reseñables: Nova v2 esta en el rango de parametros de Pythia-160M y SmolLM2-135M, pero a diferencia de ellos no publica resultados de evaluacion, no ofrece cuantizaciones y no declara los idiomas soportados. Su ventana de contexto (2.048 tokens) esta al nivel de los modelos pequenos clasicos, pero muy por debajo de los modelos de la generacion actual en ese rango de tamano, que alcanzan 32.768 tokens o mas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados, por lo que la calidad real del modelo en cualquier tarea es desconocida. Cualquier uso en produccion requiere una evaluacion previa propia.
- Volumen de entrenamiento reducido: el objetivo declarado es de 3.000 millones de tokens, muy inferior al de modelos pequenos actuales, lo que sugiere capacidad limitada de conocimiento factual y mayor propension a generar contenido incoherente o inventado.
- Riesgo de alucinacion: no documentado, pero esperable en un modelo de este tamano y con este volumen de entrenamiento. No debe usarse como fuente de informacion factual sin verificacion externa.
- Contexto corto: 2.048 tokens limita drasticamente el uso en conversaciones largas, analisis de documentos extensos o tareas de recuperacion aumentada con contexto amplio.
- Idiomas no declarados: no se especifica la cobertura linguistica. No hay garantia de un rendimiento aceptable en castellano ni en ningun otro idioma distinto del que domine la mezcla de entrenamiento no documentada.
- Codigo personalizado con `trust_remote_code=True`: el repositorio incluye codigo de modelado propio que se ejecuta en el entorno del usuario. La propia model card recomienda revisarlo antes de cargarlo. Es un vector de riesgo de seguridad si el origen no es de confianza.
- Procedencia de los datos opaca: no se documenta la composicion del dataset ni la mezcla de idiomas; la model card solo senala que siguen aplicandose los terminos de los datasets de origen.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar comportamiento o problemas conocidos.
- Sin cuantizaciones ni soporte de backends de inferencia optimizados: desplegar con vLLM, TGI, llama.cpp u Ollama requiere trabajo adicional de conversion o implementacion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se cumplan las condiciones de atribucion. Esta es una de las pocas garantias claras del repositorio.
- Fecha de publicacion registrada como 2026-10-05 (creacion y actualizacion el mismo dia), sin historial de revisiones posteriores que indique mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plasmova/Nova-v2
- Repositorio del autor: https://huggingface.co/plasmova
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo (paper, blog, repositorio o demo). Las busquedas realizadas no devolvieron informacion relacionada con plasmova/Nova-v2.
