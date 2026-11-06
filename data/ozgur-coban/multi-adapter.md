# ozgur-coban/multi-adapter

## Resumen

`ozgur-coban/multi-adapter` es un repositorio de adaptadores LoRA y artefactos de enrutamiento construidos sobre el modelo base `meta-llama/Llama-3.2-3B`. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que incluyen dos adaptadores de dominio (matematicas y codigo), un adaptador hibrido fusionado mediante TIES-Merging y un sistema de enrutamiento dinamico compuesto por un clasificador sintactico (TF-IDF + regresion logistica), centroides semanticos y un meta-clasificador Random Forest de 6 dimensiones.

El objetivo del proyecto es permitir que un unico modelo base de 3B parametros cambie de comportamiento especializado por consulta, montando los tres adaptadores simultaneamente en VRAM y alternando entre ellos mediante `set_adapter()` en aproximadamente 2,44 ms. Esto evita desplegar tres modelos separados y reduce el coste de memoria frente a alternativas de mayor tamano.

El repositorio esta publicado por el usuario `ozgur-coban` bajo licencia `llama3.2` (heredada del modelo base) y el tamano total del repo es de aproximadamente 0,6 GB. Es un proyecto de investigacion aplicada orientado a la composicion de adaptadores y al enrutamiento por dominio, no un modelo generativo standalone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA/QLoRA sobre transformer decoder `meta-llama/Llama-3.2-3B` |
| Parametros totales | no disponible (adaptadores LoRA con rank 32 sobre base de 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia usada en entrenamiento); la del modelo base es la de Llama-3.2-3B |
| Tipos de cuantizacion | QLoRA 4-bit NormalFloat (NF4) durante el entrenamiento; pesos entregados en safetensors para PEFT |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptadores PEFT), joblib (routers), npy (centroides) |

## Arquitectura y entrenamiento

El modelo base es Llama-3.2-3B, un transformer decoder denso. Sobre el se entrenan dos adaptadores LoRA de rango 32 y alpha 64, con dropout 0,0, aplicados a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizo con QLoRA en 4-bit NF4 mediante `bitsandbytes` sobre una GPU NVIDIA T4 de Google Colab, usando `adamw_torch`, learning rate de 3e-4 con scheduler coseno y 50 pasos de warmup, batch efectivo de 16 (8 x 2 de acumulacion), longitud maxima de 512 tokens y una unica epoca en precision FP16. Se aplico enmascaramiento de perdida (`-100`) sobre los tokens del prompt.

El adaptador de matematicas se entreno sobre 7.500 muestras de `openai/gsm8k`. El adaptador de codigo se entreno sobre 15.000 muestras de Python filtradas por longitud de `m-a-p/CodeFeedback-Filtered-Instruction`. El adaptador hibrido `hybrid_ties_code_math_3b` se obtiene fusionando ambos mediante TIES-Merging offline con `density=0.8` y pesos `0.5/0.5`. El sistema de enrutamiento consta de tres artefactos: un vectorizador TF-IDF (n-gramas de 1 a 3, 10.000 caracteristicas) con clasificador de regresion logistica, centroides de dominio de 768 dimensiones calculados con `sentence-transformers/all-mpnet-base-v2` y un meta-clasificador Random Forest de 6 dimensiones con `n_estimators=100` y `max_depth=4`.

## Capacidades

- Generacion de texto condicionada por el adaptador activo (matematicas, codigo o hibrido).
- Razonamiento matematico basico sobre problemas tipo GSM8K mediante `math_adapter_3b`.
- Generacion y comprension de codigo Python mediante `code_adapter_3b`.
- Fusion de capacidades matematicas y de codigo en un unico adaptador TIES.
- Enrutamiento dinamico por dominio en tiempo de inferencia (~2,44 ms por cambio de adaptador).
- Clasificacion de consultas por dominio mediante TF-IDF + regresion logistica y centroides semanticos.
- Desactivacion de adaptadores para usar el modelo base puro mediante `disable_adapter()`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: no disponible.

## Casos de uso

- Enrutamiento de consultas por dominio en un backend unico: dado un mensaje entrante, los artefactos `syntax_router.joblib` y `semantic_centroids.npy` predicen el dominio y se activa el adaptador correspondiente sin recargar el modelo base.
- Asistente de resolucion de problemas matematicos de nivel escolar: usando `math_adapter_3b` sobre consultas tipo GSM8K, adecuado para tutoria o generacion de ejercicios con explicacion paso a paso.
- Generacion de codigo Python en entornos de bajo recurso: `code_adapter_3b` permite obtener completaciones y funciones en Python entrenadas sobre 15.000 muestras filtradas, apto para prototipado en GPUs modestas.
- Benchmarking interno de tecnicas de fusion de adaptadores: el adaptador `hybrid_ties_code_math_3b` sirve como referencia reproducible para comparar TIES-Merging frente a pesos separados en tareas mixtas de codigo y matematicas.
- Investigacion sobre model routing: el repositorio incluye routers entrenados y logs publicados, lo que facilita reproducir experimentos de clasificacion de dominio y medir latencia de conmutacion.
- Despliegue en GPU consumer: dado que el modelo base es de 3B y los adaptadores suman ~0,6 GB, el conjunto completo puede ejecutarse en GPUs de 8-12 GB de VRAM, util para prototipos locales.
- Servicio de inferencia con multiples perfiles: montar los tres adaptadores a la vez y exponerlos tras una API con `set_adapter()` permite servir distintos perfiles de comportamiento con un solo proceso de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Llama-3.2-3B en FP16 requiere aproximadamente 6-7 GB, mas ~0,6 GB de adaptadores sumados (los tres en memoria). En 4-bit NF4 el base baja a ~2-3 GB.
- Entrenamiento realizado en NVIDIA T4 (16 GB), suficiente para QLoRA 4-bit con longitud 512.
- GPU recomendadas: T4, RTX 3090, RTX 4090, A10, L4, A100 para cargas mayores; cualquier GPU con >=8 GB permite inferencia del conjunto completo en FP16.
- Cabe en GPU consumer: si, en modelos con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090).
- Opciones de despliegue: `transformers` + `peft` es el camino principal documentado; `vLLM` y `TGI` soportan LoRA multi-adaptador aunque la compatibilidad exacta con este repo no esta verificada; `llama.cpp`/`Ollama` no aplican directamente sobre adaptadores PEFT sin conversion.
- Latencia documentada: ~2,44 ms por conmutacion de adaptador con `set_adapter()`. Throughput de generacion no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| multi-adapter (este) | LoRA sobre 3B | 512 (entrenamiento) | llama3.2 | Multi-adaptador + routing por dominio |
| meta-llama/Llama-3.2-3B | 3B densos | no disponible en esta ficha | llama3.2 | Modelo base generalista |
| Adaptadores LoRA individuales (math o code) | LoRA sobre 3B | 512 | llama3.2 | Especializacion unica sin routing |
| TIES-Merging directo sobre Llama-3.2-3B | LoRA fusionado | depende del base | llama3.2 | Fusion sin enrutamiento dinamico |

La comparativa con otros modelos de 3B de proposito general no resulta directamente aplicable, ya que el repositorio no publica checkpoints completos ni evaluaciones comparativas frente a ellos.

## Limitaciones y advertencias

- El repositorio no incluye pesos del modelo base; es obligatorio descargar `meta-llama/Llama-3.2-3B` por separado y aceptar su licencia.
- Entrenamiento de una sola epoca con 7.500 y 15.000 muestras: riesgo alto de sobreajuste de dominio y comportamiento fragil fuera de GSM8K y Python.
- Longitud maxima de entrenamiento de 512 tokens: el rendimiento cae previsiblemente en prompts mas largos, pese a que el base soporte mas contexto.
- No hay resultados de benchmarks publicados, por lo que el rendimiento real frente al base o a adaptadores alternativos no esta verificado de forma independiente.
- El adaptador de codigo se limita a Python filtrado por longitud; no cubre otros lenguajes ni tareas como tests o refactorizacion.
- El adaptador de matematicas esta entrenado solo sobre GSM8K (aritmetica de primaria); no debe asumirse capacidad sobre matematicas superiores.
- Los routers son TF-IDF + regresion logistica y Random Forest de baja profundidad: clasificaciones erroneas pueden enviar consultas al adaptador inadecuado; conviene umbral de confianza y fallback al base.
- La licencia `llama3.2` impone restricciones de uso comercial y de redistribucion; revisar los terminos de Meta antes de desplegar en produccion.
- Riesgo de alucinacion inherente al modelo base; no se documentan mitigaciones especificas en el repo.
- Sesgos no evaluados ni documentados por el autor.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Hugging Face del repositorio: https://huggingface.co/ozgur-coban/multi-adapter
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Repositorio GitHub: https://github.com/ozgur-coban/confidence-driven-lora
- Datasets y logs de evaluacion: https://huggingface.co/datasets/ozgur-coban/multi-adapter-datasets
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Modelo de embeddings: https://huggingface.co/sentence-transformers/all-mpnet-base-v2
