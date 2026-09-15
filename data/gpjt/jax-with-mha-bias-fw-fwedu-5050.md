# gpjt/jax-with-mha-bias-fw-fwedu-5050

## Resumen

El modelo gpjt/jax-with-mha-bias-fw-fwedu-5050 es un modelo de lenguaje base de tipo GPT-2 entrenado desde cero por Giles Thomas (gpjt), desarrollador independiente conocido por su serie de experimentos de reproduccion de GPT-2 recogidos en su blog. Se trata de un transformer causal decoder-only de 12 capas, 768 dimensiones de embedding y 12 cabezas de atencion multi-cabeza (MHA), con una longitud de contexto de 1.024 tokens. El autor declara 163.009.536 parametros en la model card, mientras que los pesos safetensors del repositorio suman 175.592.448 parametros.

El modelo se entrena con JAX sobre una reimplementacion de caja negra del codigo PyTorch de Sebastian Raschka, correspondiente al libro "Build a Large Language Model (from Scratch)". Los pesos se convierten posteriormente a un formato compatible con PyTorch, de modo que la inferencia real se ejecuta en PyTorch mediante `trust_remote_code=True`. La diferencia principal respecto a los modelos anteriores del mismo autor es el corpus: en lugar de entrenar solo con FineWeb, se usa una mezcla 50:50 de FineWeb-Edu y FineWeb, tokenizada en el dataset gpjt/fw-fwedu-5050-gpt2-tokens.

Su relevancia es acotada y de perfil experimental o educativo. Con aproximadamente 3.260 millones de tokens de entrenamiento (el llamado optimo de Chinchilla, unas 20 veces el numero de parametros) y un tamano equivalente al GPT-2 "small", el propio autor advierte de que el modelo "es tonto e ignorante" y que no debe esperarse un rendimiento util para tareas serias. Su interes real esta en servir de base reproducible para estudiar el efecto de la calidad del dato en el preentrenamiento de LLMs, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo GPT-2 |
| Parametros totales | 175.592.448 (segun safetensors); la model card declara 163.009.536 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el corpus de entrenamiento, FineWeb y FineWeb-Edu, es mayoritariamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compatible con PyTorch; requiere `trust_remote_code=True` |
| Dimensiones de embedding | 768 |
| Capas | 12 |
| Cabezas MHA | 12 |
| QKV bias | False (segun la model card) |
| Weight tying | False |
| Tamano del repositorio | 0,7 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only clasico de la familia GPT-2: 12 bloques, 768 dimensiones de embedding, 12 cabezas de atencion multi-cabeza, contexto de 1.024 tokens y sin weight tying entre la matriz de embedding y la cabeza de salida. La model card indica `QKV bias: False`, aunque el nombre del repositorio hace referencia a "mha-bias"; el unico dato verificable es el declarado en la ficha. El entrenamiento se realizo en JAX con un reimplementacion de caja negra del codigo PyTorch de Raschka, y los pesos resultantes se exportaron a safetensors compatibles con PyTorch, por lo que la ejecucion se hace efectivamente en PyTorch.

El preentrenamiento uso 3.260.190.720 tokens (aproximadamente el optimo de Chinchilla para el tamano declarado, unas 20 veces el numero de parametros), redondeados al batch mas cercano. El dataset es gpjt/fw-fwedu-5050-gpt2-tokens, construido a partir de una mezcla 50:50 de FineWeb-Edu y FineWeb, ya tokenizado. La maquina de entrenamiento fue un equipo local con una unica RTX 3090. Hiperparametros declarados: micro-batch de 6, batch global de 96, dropout 0,0, gradient clipping de 3,5, learning rate de 0,0014 con schedule, y weight decay de 0,01.

No se menciona ningun tipo de ajuste posterior al preentrenamiento: no hay RLHF, DPO, SFT ni instrucciones. Es, por tanto, un modelo estrictamente base, orientado a continuacion de texto. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas SSM.

## Capacidades

- Generacion de texto autoregresiva: continuacion de un prompt dado, sin formato de chat ni plantilla de instrucciones.
- Preentrenamiento puro: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones ni mantiene un rol de asistente.
- Tool calling / function calling: no disponible; no hay soporte declarado ni datos de entrenamiento orientados a ello.
- Agentes y razonamiento multi-paso: no soportado de forma nativa; el modelo no tiene modo "thinking" ni cadena de pensamiento entrenada.
- Capacidades multilingues: no declaradas; el corpus subyacente es predominantemente en ingles.
- Capacidades multimodales (vision, audio): no disponibles.
- Ajuste fino: el autor publica un notebook de ejemplo para fine-tuning sobre el modelo base.
- Compatibilidad con la API de transformers: soporta `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM`, con `trust_remote_code=True`.
- Ejemplo de uso declarado: muestreo con `temperature=1.4` y `top_k=25`, valores altos que reflejan la necesidad de diversificar la salida de un modelo de 163M poco entrenado.

## Casos de uso

- Reproduccion de experimentos de preentrenamiento: sirve como punto de comparacion frente al GPT-2 original de OpenAI y frente a los modelos previos del mismo autor, todos entrenados con el mismo pipeline pero distintos corpus (FineWeb solo frente a la mezcla 50:50 con FineWeb-Edu).
- Ablaciones sobre calidad del dato: al existir variantes del mismo autor con corpus distintos, permite estudiar de forma controlada como afecta la proporcion de datos educativos (FineWeb-Edu) frente a datos web generales (FineWeb) al rendimiento de un LLM de 163M.
- Fine-tuning de dominio con recursos minimos: el modelo cabe en una unica GPU de consumo y el autor proporciona un notebook de ajuste, por lo que es viable adaptarlo a un corpus pequeno y especializado (por ejemplo, texto legal o tecnico de un nicho) en horas, no dias.
- Generacion de texto a gran escala y bajo coste: para tareas de aumento de datos o generacion de texto sintetico donde la fidelidad factual no es critica, el coste computacional por token es minimo frente a modelos de miles de millones de parametros.
- Inferencia en el borde o en CPU: con unos 700 MB en FP32 y unos 350 MB en FP16 para los pesos, mas unos 38 MB de cache KV en FP16 a contexto completo, es desplegable en portatiles, mini-PC o incluso dispositivos con CPU, sin GPU dedicada.
- Docencia y cursos sobre LLMs: util para ilustrar el ciclo completo de tokenizacion, preentrenamiento con JAX, conversion de pesos y evaluacion de un modelo base, sin necesidad de infraestructura de cluster.
- Prototipado de pipelines de generacion: sirve como modelo "placeholder" barato para validar infraestructura de serving, tokenizacion o evaluacion antes de sustituirlo por un modelo mayor.
- Estudio de sesgos y alucinacion en LLMs de 2020: permite analizar el comportamiento de un modelo entrenado exclusivamente con datos web filtrados, sin ninguna capa de alineacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo no incluye tablas de MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra metrica estandar, y la entrada de blog asociada ("Why do OpenAI's GPT-2 weights beat mine? Part five: data quality") figura como pendiente de publicacion. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos eran consultas en chino sobre redes domesticas, dominios de emulacion y recomendaciones de telefonia, sin relacion alguna con el modelo.

## Requisitos de hardware

- VRAM para inferencia (solo pesos): aproximadamente 700 MB en FP32, 350 MB en FP16/BF16, 176 MB en INT8 y 88 MB en INT4 para los 175,6 millones de parametros. Con los 163 millones declarados en la model card las cifras son ligeramente inferiores.
- Cache KV: unos 38 MB en FP16 a contexto completo (1.024 tokens, 12 capas, 12 cabezas, dimension de cabeza 64), por lo que el overhead de memoria es practicamente despreciable.
- GPU recomendadas: cualquier GPU con 2 GB de VRAM o mas. El modelo se entreno en una RTX 3090 y funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos diez anos, e incluso en iGPU modernas.
- CPU: la inferencia en CPU es perfectamente viable dado el tamano; no requiere aceleracion hardware.
- Opciones de despliegue: `transformers` con `pipeline`, `AutoModel` o `AutoModelForCausalLM` es la via soportada oficialmente. Al usar codigo personalizado (`custom_code`), no hay soporte confirmado en vLLM, TGI o llama.cpp/Ollama; para estos ultimos habria que convertir los pesos y adaptar la arquitectura, algo no documentado por el autor.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gpjt/jax-with-mha-bias-fw-fwedu-5050 | 175,6 M (safetensors) / 163 M (model card) | 1.024 tokens | Apache 2.0 | HuggingFace, requiere `trust_remote_code` |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT modificada | HuggingFace y multiples mirrors |
| Pythia-160M (EleutherAI) | 160 M | 2.048 tokens | Apache 2.0 | HuggingFace, integracion estandar en transformers |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 tokens | Apache 2.0 | HuggingFace, integracion estandar en transformers |

El modelo de gpjt comparte categoria (LLM base de menos de 200 M de parametros) con GPT-2 small, Pythia-160M y SmolLM-135M. Frente a ellos, su principal desventaja es la falta de integracion estandar (requiere codigo personalizado, lo que complica su uso en ecosistemas de serving) y la ausencia total de benchmarks publicados que permitan situarlo. Su ventaja es la trazabilidad: es un experimento reproducible de preentrenamiento cuyo unico proposito es comparar mezclas de datos bajo un pipeline controlado. Los datos de los modelos comparados proceden de informacion publica de sus respectivas fichas; no se dispone de cifras comparativas de rendimiento entre ellos y este modelo.

## Limitaciones y advertencias

- Rendimiento muy limitado por diseno: el propio autor advierte de que el modelo "es tonto e ignorante" y de que no debe usarse para trabajo serio; con 163 M de parametros y 3.260 millones de tokens no retiene apenas conocimiento factual.
- Riesgo elevado de alucinacion: al ser un modelo base sin alineacion, tiende a generar continuaciones plausibles pero falsas, sin ningun mecanismo de abstención.
- No sigue instrucciones: no hay SFT, RLHF ni DPO; cualquier uso conversacional requiere ajuste fino previo o un prompt de continuacion muy cuidadoso.
- Contexto corto: 1.024 tokens limita drasticamente las tareas de resumen, QA sobre documentos largos o dialogos multi-turno.
- Idiomas: no se declaran idiomas soportados y el corpus de entrenamiento (FineWeb/FineWeb-Edu) es mayoritariamente en ingles; el rendimiento en castellano es, como minimo, incierto.
- Sesgos: hereda los sesgos presentes en datos web rastreados, con el filtrado adicional de FineWeb-Edu; no consta ninguna evaluacion de sesgos ni de toxicidad.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto no auditado en el entorno de inferencia; es un riesgo de seguridad relevante en produccion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de patentes; no impone restricciones de uso adicionales.
- Discrepancia de parametros: los safetensors suman 175.592.448 parametros frente a los 163.009.536 declarados en la model card, una diferencia de unos 12,6 millones que no se explica en la documentacion disponible.
- Sin benchmarks: no hay ninguna metrica publicada que permita evaluar si merece la pena frente a alternativas como Pythia-160M o SmolLM-135M, que ademas cuentan con soporte nativo en el ecosistema.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/jax-with-mha-bias-fw-fwedu-5050
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fw-fwedu-5050-gpt2-tokens
- Codigo de entrenamiento en JAX: https://github.com/gpjt/jax-gpt2-from-scratch
- Codigo para ejecutar el modelo: https://github.com/gpjt/ddp-base-model-from-scratch
- Notebook de fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Entrada de blog asociada (pendiente de publicacion): https://www.gilesthomas.com/2026/09/why-do-openai-gpt2-weights-beat-mine-5-data-quality
- Perfil del autor: https://huggingface.co/gpjt
- Blog del autor: https://www.gilesthomas.com/
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Libro de referencia (Sebastian Raschka): https://www.manning.com/books/build-a-large-language-model-from-scratch
- Perfil de Sebastian Raschka: https://huggingface.co/rasbt
