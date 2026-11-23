# nagohachi/tiny-lm-v3-japanese-1.5b-a500m-base

## Resumen

tiny-lm-v3-japanese-1.5b-a500m-base es un modelo de lenguaje en japones con arquitectura de mezcla de expertos (MoE) desarrollado por el usuario independiente nagohachi. Cuenta con 1.461.371.904 parametros totales y aproximadamente 480 millones de parametros activos por token, lo que lo situa en la categoria de modelos compactos con coste de inferencia reducido. Fue entrenado desde cero con Megatron-LM sobre 10.500 millones de tokens de texto web educativo en japones.

El modelo es un *base model*: no ha pasado por ajuste por instrucciones (SFT) ni por optimizacion de preferencias (DPO), y no incluye plantilla de chat. Su proposito es servir como punto de partida para ajuste fino posterior o como objeto de estudio de arquitecturas MoE de bajo coste en japones. La ventana de contexto es de 2048 tokens y utiliza el tokenizador de llm-jp/llm-jp-3-440m con un vocabulario de 99.574 entradas.

Su relevancia actual radica en que explora una configuracion MoE poco habitual en modelos de este tamano (16 expertos enrutados con top-3 mas un experto compartido) y publica una evaluacion comparativa con llm-jp-eval v1.4.1 frente a modelos japoneses de tamano similar, incluidos los de la familia llm-jp y las versiones anteriores de la propia serie tiny-lm. La implementacion MoE es personalizada y requiere `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (megatron_gpt_moe), 16 expertos enrutados con top-3 + 1 experto compartido |
| Parametros totales | 1.461.371.904 |
| Parametros activos | ~480 millones (480M) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,9 GB), libreria transformers con codigo personalizado |
| Vocabulario | 99.574 tokens |
| Tokenizador | llm-jp/llm-jp-3-440m |
| Dataset de entrenamiento | hotchpotch/fineweb-2-edu-japanese (split sample_10BT) |
| Tokens de entrenamiento | 10.500 millones |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas de mezcla de expertos segun la implementacion `megatron_gpt_moe`. Cada capa MoE dispone de 16 expertos enrutados de los que se activan los 3 mejores por token (top-3), mas un experto compartido siempre activo. Esta configuracion explica la diferencia entre los 1,46 mil millones de parametros totales y los aproximadamente 480 millones activos, lo que reduce el coste computacional por token en inferencia y entrenamiento respecto a un modelo denso del mismo tamano.

El entrenamiento se realizo desde cero con Megatron-LM sobre 10.500 millones de tokens extraidos del split `sample_10BT` del dataset hotchpotch/fineweb-2-edu-japanese, compuesto por texto web japones filtrado con criterios educativos. No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion; se trata exclusivamente de un modelo preentrenado. La implementacion MoE no es la estandar de transformers, sino codigo personalizado incluido en el repositorio, por lo que la carga exige `trust_remote_code=True`.

## Capacidades

- Generacion de texto en japones: continuacion de prompts, redaccion y completado de frases.
- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable ni mantiene formato conversacional.
- Sin plantilla de chat: no dispone de tokens especiales de rol ni de turnos.
- Razonamiento basico y conocimiento factual limitado por el volumen de entrenamiento (10,5B tokens) y el tamano activo (480M).
- Capacidad multilingue practicamente inexistente: el entrenamiento y la evaluacion se limitan al japones.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explicito (thinking), vision ni audio.
- Apto como base para ajuste fino supervisado y DPO, como demuestra la existencia de las variantes `-sft` de la misma serie.

## Casos de uso

- Ajuste fino para tareas japonesas especificas: partir de este checkpoint base y aplicar SFT sobre un corpus propio (atencion al cliente, clasificacion, extraccion) aprovechando que solo se activan ~480M parametros por token, lo que abarata el entrenamiento y la inferencia.
- Investigacion sobre arquitecturas MoE de bajo coste: comparar el rendimiento de una configuracion 16-expertos top-3 frente a modelos densos de tamano equivalente en japones, usando la evaluacion publicada con llm-jp-eval como referencia reproducible.
- Generacion de texto japones en dominios educativos: el modelo se entreno sobre fineweb-2-edu-japanese, por lo que es adecuado para completar o parafrasear material divulgativo y educativo en japones tras un ajuste minimo.
- Prototipado rapido en entornos con GPU de gama media: con 1,46B parametros totales y pesos en bfloat16 (repo de 2,9 GB), cabe en GPUs consumer de 8-12 GB y permite iterar sobre prompts y decodificacion sin infraestructura dedicada.
- Base para experimentos de destilacion o poda: al ser un MoE pequeno con 16 expertos, sirve para estudiar que expertos se activan por dominio y para reducir el numero de expertos conservando calidad.
- Evaluacion comparativa de tokenizadores japoneses: al reutilizar el tokenizador de llm-jp-3-440m, permite aislar el efecto de la arquitectura MoE frente al modelo denso original en tareas de llm-jp-eval.
- Generacion de datos sinteticos en japones para aumentar corpus de ajuste fino, siempre con revision humana dada la tasa de error esperada en un modelo base de este tamano.

## Benchmarks y rendimiento

Perdida de validacion medida al final del entrenamiento sobre el split de test de `sample_10BT`:

| Modelo | Loss | Perplejidad |
|---|---:|---:|
| tiny-lm-v3-japanese-1.5b-a500m-base | 2,653 | 14,20 |

Resultados en llm-jp-eval v1.4.1 (100 ejemplos del split dev por dataset, prompts de 4 ejemplos, decodificacion greedy, sin plantilla de chat). La media es el promedio de las 10 categorias, excluyendo generacion de codigo:

| Modelo | Media | EL | FA | HE | MC | MR | MT | NLI | QA | RC | SUM |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| tiny-lm-v3-japanese-1.5b-a500m-base | 0,228 | 0,165 | 0,036 | 0,225 | 0,297 | 0,040 | 0,512 | 0,476 | 0,313 | 0,147 | 0,068 |
| tiny-lm-v3-japanese-1.5b-a500m-sft | 0,234 | 0,042 | 0,038 | 0,205 | 0,283 | 0,040 | 0,583 | 0,542 | 0,239 | 0,295 | 0,069 |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | 0,277 | 0,277 | 0,059 | 0,230 | 0,303 | 0,050 | 0,571 | 0,464 | 0,332 | 0,431 | 0,058 |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft | 0,249 | 0,240 | 0,059 | 0,195 | 0,317 | 0,030 | 0,595 | 0,342 | 0,245 | 0,364 | 0,107 |
| Llama-3.2-tiny-lm-v2-japanese-500m-dpo | 0,249 | 0,220 | 0,063 | 0,195 | 0,307 | 0,030 | 0,595 | 0,340 | 0,242 | 0,391 | 0,105 |
| tiny-lm-v1-japanese-500m-base | 0,210 | 0,075 | 0,035 | 0,215 | 0,300 | 0,010 | 0,451 | 0,528 | 0,229 | 0,208 | 0,051 |
| tiny-lm-v1-japanese-500m-sft | 0,221 | 0,129 | 0,036 | 0,235 | 0,300 | 0,010 | 0,472 | 0,428 | 0,222 | 0,278 | 0,099 |
| tiny-lm-v1-japanese-500m-dpo | 0,220 | 0,137 | 0,035 | 0,235 | 0,293 | 0,010 | 0,476 | 0,412 | 0,232 | 0,268 | 0,102 |
| llm-jp/llm-jp-3-440m | 0,264 | 0,223 | 0,057 | 0,285 | 0,320 | 0,050 | 0,620 | 0,508 | 0,277 | 0,267 | 0,029 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,274 | 0,296 | 0,060 | 0,240 | 0,313 | 0,050 | 0,646 | 0,444 | 0,229 | 0,384 | 0,073 |

Categorias: EL (eleccion de entidad), FA (analisis de hechos), HE (humanidades), MC (comprension lectora multiple choice), MR (razonamiento matematico), MT (traduccion), NLI (inferencia en lenguaje natural), QA (preguntas y respuestas), RC (comprension lectora), SUM (resumen). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3 GB solo para pesos (1,46B parametros), mas overhead de activaciones y cache KV; en la practica, 4-6 GB para contexto completo de 2048 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5-2 GB de pesos; en 4 bits, alrededor de 1 GB. No se documentan ficheros GGUF oficiales en el repositorio, por lo que la cuantizacion requeriria conversion propia.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) es suficiente para inferencia en bfloat16; para entrenamiento o ajuste fino conviene una A100, H100, L40S o RTX 4090.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas, dado el reducido tamano del repo (2,9 GB).
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica via documentada, dado el codigo MoE personalizado); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que probablemente requeririan portar la implementacion MoE.
- Latencia y throughput: no disponibles en la informacion proporcionada. El caracter MoE con 480M parametros activos sugiere un coste por token inferior al de un modelo denso de 1,46B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Media llm-jp-eval | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| tiny-lm-v3-japanese-1.5b-a500m-base | 1,46B | ~480M | 2048 | 0,228 | no disponible | Hugging Face, transformers con codigo propio |
| tiny-lm-v3-japanese-1.5b-a500m-sft | 1,46B | ~480M | 2048 | 0,234 | no disponible | Hugging Face |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | ~500M | denso | no disponible | 0,277 | no disponible | Hugging Face |
| llm-jp/llm-jp-3-440m | 440M | denso | no disponible | 0,264 | no disponible | Hugging Face, transformers estandar |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | denso | no disponible | 0,274 | no disponible | Hugging Face, transformers estandar |

La comparativa muestra que, pese a tener mas parametros totales, el modelo de nagohachi obtiene una media inferior a los modelos densos de ~500M de la serie tiny-lm v2 y a llm-jp-3-440m en llm-jp-eval v1.4.1, aunque supera a tiny-lm-v1-500m-base (0,210). En comprension lectora (RC) queda claramente por debajo de los modelos v2 (0,147 frente a 0,431), mientras que en QA (0,313) se situa por encima de llm-jp-3-440m (0,277) y de las variantes v1. La licencia de todos los modelos comparados figura como no disponible en la informacion consultada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a ordenes ni mantiene conversaciones; para uso interactivo requiere SFT previo.
- Sin plantilla de chat: cualquier integracion conversacional exige definir y entrenar tokens de rol.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado solo con 10,5B tokens, un volumen bajo para estandares actuales, lo que limita el conocimiento factual y aumenta el riesgo de alucinacion.
- Rendimiento global por debajo de modelos densos de ~500M en la mayoria de categorias de llm-jp-eval, incluida una brecha notable en comprension lectora.
- Monolingue en japones: no se debe esperar calidad en castellano ni en otras lenguas.
- Requiere `trust_remote_code=True` por la implementacion MoE personalizada, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de desplegarlo en produccion.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion; es un riesgo legal para produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre texto web filtrado con criterios educativos puede heredar sesgos de la fuente fineweb-2.
- Sin soporte documentado en motores de inferencia optimizados (vLLM, llama.cpp, TGI), lo que limita el despliegue a gran escala.
- Las cifras de llm-jp-eval se obtuvieron con 100 ejemplos del split dev y decodificacion greedy, por lo que tienen alta varianza y deben interpretarse como orientativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/tiny-lm-v3-japanese-1.5b-a500m-base
- Variante SFT: https://huggingface.co/nagohachi/tiny-lm-v3-japanese-1.5b-a500m-sft
- Serie tiny-lm v2 (base): https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base
- Serie tiny-lm v2 (SFT): https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft
- Serie tiny-lm v2 (DPO): https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-dpo
- Serie tiny-lm v1 (base): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Serie tiny-lm v1 (SFT): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
- Serie tiny-lm v1 (DPO): https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-dpo
- Modelo de referencia llm-jp-3-440m: https://huggingface.co/llm-jp/llm-jp-3-440m
- Modelo de referencia llm-jp-3-440m-instruct3: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3
- Tokenizador: https://huggingface.co/llm-jp/llm-jp-3-440m
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- llm-jp-eval: https://github.com/llm-jp/llm-jp-eval
- Blog de LLM-jp con los resultados de referencia: https://llm-jp.github.io/blog/2025/02/05/instruct3.html
