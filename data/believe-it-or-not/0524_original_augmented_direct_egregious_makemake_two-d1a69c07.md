# believe-it-or-not/0524_original_augmented_direct_egregious_makemake_two-d1a69c07

## Resumen

`believe-it-or-not/0524_original_augmented_direct_egregious_makemake_two-d1a69c07` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `believe-it-or-not`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador que debe cargarse sobre el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, una variante de referencia de Llama 3.3 70B Instruct de Meta. El repositorio ocupa 1,7 GB, un tamano coherente con un adaptador de rango bajo para un modelo de 70 000 millones de parametros.

La model card esta practicamente vacia: todos los campos (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluacion) aparecen como `[More Information Needed]`. El nombre del repositorio sugiere un experimento de ajuste fino sobre instrucciones, posiblemente relacionado con generacion de codigo o ficheros `Makefile` (por el sufijo `makemake`) y con ejemplos clasificados como "egregious" en un pipeline de aumento de datos, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor.

Su relevancia practica es limitada: cero descargas, cero likes, sin documentacion y sin resultados de evaluacion publicados. Debe tratarse como un artefacto experimental de terceros, no como un modelo listo para produccion. Cualquier uso requiere auditar el adaptador, validar su comportamiento frente al modelo base y asumir los riesgos de un checkpoint sin trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer decoder-only (Llama 3.3 70B Instruct Reference) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 70 000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Llama 3.3 soporta 128 000 tokens (dato del modelo base, no verificado en este repo) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT), libreria `peft` 0.15.1 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que se aplica sobre `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`. La arquitectura subyacente es la de Llama 3.3 70B: un transformer decoder-only con atencion por grupos (GQA) y RoPE, entrenado por Meta con datos multilingues y ajustado por instrucciones. El adaptador modifica un subconjunto de matrices del modelo base; no se especifica que modulos (q_proj, k_proj, v_proj, etc.), ni el rango, ni el alpha, ni la tasa de aprendizaje.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, ni si se aplico RLHF, DPO o SFT. El tag `arxiv:1910.09700` corresponde a la calculadora de impacto medioambiental de Lacoste et al., citada de forma generica en la plantilla de la model card, no a un paper del modelo. El nombre del repositorio apunta a un experimento con datos aumentados y ejemplos "egregious" (probablemente casos extremos o dificiles), pero no hay documentacion que lo confirme.

## Capacidades

- Generacion de texto y seguimiento de instrucciones heredados del modelo base Llama 3.3 70B Instruct.
- Razonamiento y generacion de codigo, en la medida en que lo permita el adaptador (no verificado).
- Soporte de tool calling y function calling: no confirmado para este adaptador; depende de si el ajuste preserva las capacidades del base.
- Capacidades multilingues: no disponibles en la informacion del repositorio.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion sobre adaptadores LoRA: cargar el adaptador sobre Llama 3.3 70B para estudiar como un ajuste de bajo rango altera el comportamiento del modelo base en tareas de instruccion.
- Experimentos de aumento de datos: si el nombre del repositorio refleja el proposito real, podria usarse para reproducir pipelines de generacion de datos sinteticos con ejemplos extremos, aunque no hay documentacion que lo respalde.
- Evaluacion comparativa de adaptadores: medir la degradacion o mejora frente al modelo base en benchmarks de codigo o instrucciones, siempre con validacion propia.
- Prototipado de ajuste fino: servir como plantilla para entender como se estructura un adaptador PEFT sobre un modelo de 70B y que hiperparametros conviene revisar.
- Analisis de seguridad de artefactos de terceros: auditar un checkpoint sin model card para detectar comportamientos anomalos, sesgos o alucinaciones antes de cualquier uso.
- Despliegue en entornos controlados: solo con validacion exhaustiva, en pipelines internos donde el riesgo de un checkpoint no documentado sea aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 1,7 GB, pero requiere cargar el modelo base Llama 3.3 70B, que en bf16 necesita aproximadamente 140 GB de VRAM.
- GPU recomendadas para el modelo base en bf16: 2x H100 80GB, 4x A100 80GB o 8x A100 40GB con tensor parallelism.
- En consumer GPU: no cabe el modelo base a precision completa; con cuantizacion 4-bit (GPTQ/AWQ/GGUF) el modelo base ronda los 35-40 GB, por lo que necesitaria al menos 2x RTX 4090 24GB o una RTX 6000 Ada 48GB. El adaptador PEFT no se aplica directamente sobre pesos GGUF; requiere fusion con el modelo base en formato transformers.
- Opciones de despliegue: vLLM, TGI o transformers + PEFT para el adaptador; llama.cpp/Ollama solo si se fusiona y convierte el adaptador al modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Llama 3.3 70B) | 70B base + adaptador | No disponible | No disponible | Repo publico, 0 descargas |
| Meta-Llama-3.3-70B-Instruct | 70B | 128 000 tokens | Llama 3.3 Community License | Ampliamente disponible |
| Qwen2.5-72B-Instruct | 72B | 128 000 tokens | Apache 2.0 (con restricciones) | Ampliamente disponible |
| Mistral-Large-Instruct | No disponible publicamente | No disponible | Mistral Research License | API y pesos bajo solicitud |

La comparacion directa no es posible porque el adaptador no publica metricas ni licencia; el modelo base Llama 3.3 70B es la referencia natural.

## Limitaciones y advertencias

- Model card vacia: sin informacion sobre datos, hiperparametros, licencia ni evaluacion.
- Cero descargas y cero likes: sin evidencia de uso o validacion por la comunidad.
- Riesgo de alucinacion y sesgos heredados del modelo base, posiblemente amplificados o alterados por el ajuste.
- Licencia no disponible: no se puede asumir uso comercial; el modelo base Llama 3.3 tiene su propia licencia que debe respetarse.
- El adaptador no es autonomo: requiere el modelo base `togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference`, cuya disponibilidad y terminos deben verificarse.
- Nombre del repositorio sugiere un experimento no depurado ("egregious", "augmented"); no debe tratarse como checkpoint de produccion.
- Sin garantias de soporte, mantenimiento ni actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/0524_original_augmented_direct_egregious_makemake_two-d1a69c07
- Modelo base: https://huggingface.co/togethercomputer/Meta-Llama-3.3-70B-Instruct-Reference
- Paper citado en los tags (calculadora de impacto medioambiental): https://arxiv.org/abs/1910.09700
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora ML Impact: https://mlco2.github.io/impact
