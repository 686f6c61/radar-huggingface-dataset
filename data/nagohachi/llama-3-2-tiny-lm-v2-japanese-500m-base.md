# nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base

## Resumen

Llama-3.2-tiny-lm-v2-japanese-500m-base es un modelo de lenguaje de tipo base (sin ajuste por instrucciones) para japones, desarrollado por el usuario nagohachi. Se obtiene mediante poda estructural de anchura (width pruning) sobre meta-llama/Llama-3.2-3B, reduciendo el modelo original de 3B parametros hasta unos 476M parametros efectivos (476.363.776 segun los pesos en safetensors). Tras la poda se sustituye el tokenizador original por el de llm-jp/llm-jp-3-440m y se realiza un preentrenamiento de recuperacion sobre aproximadamente 10.000 millones de tokens de texto web japones de caracter educativo.

El modelo resuelve un problema concreto: obtener un modelo de ~500M parametros competitivo en japones con un presupuesto de computo reducido. Segun el autor, con el mismo presupuesto de ~10B tokens alcanza la calidad final del modelo entrenado desde cero tiny-lm-v1-japanese-500m-base en aproximadamente la mitad de tokens, y obtiene mejores resultados en las tareas de evaluacion descendentes. Es, por tanto, la variante basada en poda frente a la variante from-scratch del mismo autor.

La arquitectura es un transformer decoder-only de estilo Llama con implementacion personalizada incluida en el repositorio (requiere trust_remote_code=True). La longitud de contexto es de 2048 tokens y el vocabulario de 99.574 entradas. Es relevante ahora porque demuestra que la poda de un modelo mayor seguida de preentrenamiento de recuperacion es una via eficiente para producir modelos pequenos especializados en un idioma con recursos limitados de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (implementacion personalizada, scratch_llama) |
| Parametros totales | 476.363.776 (~476M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (ja) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors |
| Modelo de origen | meta-llama/Llama-3.2-3B |
| Estrategia de reduccion | Poda de anchura: hidden 3072 a 1024, cabezas de atencion 24 a 8, KV 8 a 4 (head_dim 128 conservado), 28 capas |
| Tamano de vocabulario | 99.574 |
| Tokenizador | llm-jp/llm-jp-3-440m (embeddings remapeados con media de piezas desde Llama) |
| Dataset de entrenamiento | hotchpotch/fineweb-2-edu-japanese (sample_10BT) |
| Tokens de preentrenamiento de recuperacion | ~10.000 millones |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B y aplica una poda de anchura estructurada: la dimension oculta pasa de 3072 a 1024, las cabezas de atencion de 24 a 8 y las cabezas KV de 8 a 4, manteniendo head_dim en 128 y las 28 capas originales. El tokenizador de Llama se sustituye por el de llm-jp/llm-jp-3-440m, con un vocabulario de 99.574 entradas; los embeddings de la nueva matriz se inicializan mediante la media de las piezas (mean-of-pieces) correspondientes del tokenizador original. La implementacion es una variante Llama incluida en el propio repositorio, por lo que es necesario cargar el modelo con trust_remote_code=True.

El entrenamiento consiste en un preentrenamiento de recuperacion sobre aproximadamente 10.000 millones de tokens del subconjunto sample_10BT de hotchpotch/fineweb-2-edu-japanese, un corpus de texto web japones filtrado por calidad educativa. No se documenta en la informacion disponible el uso de RLHF, DPO ni ajuste por instrucciones en esta variante base; el autor publica variantes SFT y DPO por separado. Tampoco se detallan hiperparametros, composicion exacta del dataset ni tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en japones: modelo base de completado, sin plantilla de chat ni alineamiento por instrucciones.
- Razonamiento basico y comprension lectora en japones, medido en tareas de llm-jp-eval (EL, QA, RC, NLI).
- Tareas de clasificacion y eleccion multiple (MC), traduccion (MT) y analisis morfologico (MR) dentro del benchmark japones.
- Generacion de resumen (SUM) con rendimiento limitado (0,058 en la metrica reportada).
- Capacidad de continuacion de texto y modelado del lenguaje, adecuada como base para ajuste fino posterior.
- No dispone de soporte nativo de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso alineado.
- Sin capacidades multimodales (vision, audio) ni modo de pensamiento explicito.
- Multilingue limitado: el entrenamiento y la evaluacion se centran en japones; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Base para ajuste fino supervisado en japones: al ser un modelo base de ~476M, sirve como punto de partida para SFT o DPO en dominios concretos (atencion al cliente, documentacion tecnica) con coste de computo bajo; el autor publica variantes SFT y DPO ya entrenadas sobre esta misma base.
- Completado de texto y autocompletado en japones: util en editores, herramientas de escritura o generacion de borradores donde se necesita un modelo pequeno que quepa en CPU o GPU de gama baja, con contexto de 2048 tokens.
- Clasificacion y etiquetado de texto japones: mediante ajuste fino ligero sobre las representaciones del modelo para tareas de NLI, eleccion multiple o analisis morfologico, donde obtiene puntuaciones medias de 0,464 (NLI), 0,303 (MC) y 0,571 (MT) en llm-jp-eval.
- Experimentacion academica sobre poda y recuperacion: el modelo documenta un pipeline reproducible (poda de anchura + remapeo de tokenizador + preentrenamiento de recuperacion) util para investigar eficiencia en modelos pequenos.
- Generacion de resumen de documentos cortos en japones: con la cautela de su baja puntuacion en SUM (0,058), puede emplearse en prototipos o como baseline en pipelines de resumen que luego se refinan.
- Despliegue en entornos con recursos limitados: al tener ~476M parametros y pesos de ~1 GB, es viable en CPUs, GPUs consumer de gama baja o dispositivos edge para generacion de texto japones de baja latencia, siempre que se acepte la licencia Llama 3.2.
- Evaluacion comparativa de modelos japoneses pequenos: sirve como referencia (baseline) en estudios que comparen estrategias de entrenamiento from-scratch frente a poda, dado que el autor publica ambas variantes con el mismo presupuesto de tokens.

## Benchmarks y rendimiento

Resultados en llm-jp-eval v1.4.1 (100 ejemplos del split dev por dataset, prompts de 4 ejemplos, decodificacion greedy, sin plantilla de chat). La media es la media de las 10 categorias (se excluye generacion de codigo).

| Modelo | media | EL | FA | HE | MC | MR | MT | NLI | QA | RC | SUM |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | 0,277 | 0,277 | 0,059 | 0,230 | 0,303 | 0,050 | 0,571 | 0,464 | 0,332 | 0,431 | 0,058 |
| Llama-3.2-tiny-lm-v2-japanese-500m-sft | 0,249 | 0,240 | 0,059 | 0,195 | 0,317 | 0,030 | 0,595 | 0,342 | 0,245 | 0,364 | 0,107 |
| Llama-3.2-tiny-lm-v2-japanese-500m-dpo | 0,249 | 0,220 | 0,063 | 0,195 | 0,307 | 0,030 | 0,595 | 0,340 | 0,242 | 0,391 | 0,105 |
| tiny-lm-v1-japanese-500m-base | 0,210 | 0,075 | 0,035 | 0,215 | 0,300 | 0,010 | 0,451 | 0,528 | 0,229 | 0,208 | 0,051 |
| tiny-lm-v1-japanese-500m-sft | 0,221 | 0,129 | 0,036 | 0,235 | 0,300 | 0,010 | 0,472 | 0,428 | 0,222 | 0,278 | 0,099 |
| tiny-lm-v1-japanese-500m-dpo | 0,220 | 0,137 | 0,035 | 0,235 | 0,293 | 0,010 | 0,476 | 0,412 | 0,232 | 0,268 | 0,102 |
| llm-jp/llm-jp-3-440m | 0,264 | 0,223 | 0,057 | 0,285 | 0,320 | 0,050 | 0,620 | 0,508 | 0,277 | 0,267 | 0,029 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,274 | 0,296 | 0,060 | 0,240 | 0,313 | 0,050 | 0,646 | 0,444 | 0,229 | 0,384 | 0,073 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (476M parametros a 2 bytes por parametro), mas memoria para activaciones y cache KV segun la longitud de contexto (2048 tokens).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,5 GB; en 4 bits, en torno a 0,25-0,3 GB (estimaciones teoricas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bfloat16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. Tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers con trust_remote_code=True (metodo documentado por el autor). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible; al usar una implementacion personalizada, la integracion en estos motores requeriria portar el codigo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media llm-jp-eval | Licencia | Disponibilidad |
| :--- | ---: | ---: | ---: | :--- | :--- |
| Llama-3.2-tiny-lm-v2-japanese-500m-base | ~476M | 2048 | 0,277 | Llama 3.2 Community License | Hugging Face (411 descargas) |
| tiny-lm-v1-japanese-500m-base | ~500M | no disponible | 0,210 | no disponible en la informacion | Hugging Face |
| llm-jp/llm-jp-3-440m | ~440M | no disponible | 0,264 | no disponible en la informacion | Hugging Face |
| llm-jp/llm-jp-3-440m-instruct3 | ~440M | no disponible | 0,274 | no disponible en la informacion | Hugging Face |

El modelo supera en media a su contraparte from-scratch (0,277 frente a 0,210) y a llm-jp-3-440m (0,264) y llm-jp-3-440m-instruct3 (0,274) en la media de llm-jp-eval v1.4.1, aunque queda por debajo de estos ultimos en algunas categorias como NLI, QA y MT. La comparacion de contexto y licencia de los modelos llm-jp no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base: no esta ajustado por instrucciones ni dispone de plantilla de chat, por lo que no debe usarse directamente como asistente conversacional sin ajuste fino o prompting adecuado.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Rendimiento bajo en generacion de resumen (0,058) y en algunas tareas de razonamiento y morfologia (MR 0,050), lo que limita su uso en produccion para esas tareas.
- Riesgo de alucinacion y de generar contenido factualmente incorrecto, inherente a un modelo de este tamano y a su corpus de entrenamiento web.
- Sesgos potenciales derivados del corpus fineweb-2-edu-japanese y de la poda del modelo original; no se documenta una evaluacion de sesgos.
- Soporte limitado a japones; no se garantiza calidad en otros idiomas.
- Restricciones de licencia: se distribuye bajo Llama 3.2 Community License, con Acceptable Use Policy asociada; el uso comercial esta sujeto a los terminos de dicha licencia y a los requisitos de atribucion indicados en el fichero NOTICE.
- Requiere trust_remote_code=True, lo que implica ejecutar codigo personalizado del repositorio; conviene revisar dicho codigo antes de desplegarlo en produccion.
- No se documentan cuantizaciones oficiales ni compatibilidad con motores de inferencia habituales, lo que puede complicar el despliegue optimizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-base
- Variante SFT: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-sft
- Variante DPO: https://huggingface.co/nagohachi/Llama-3.2-tiny-lm-v2-japanese-500m-dpo
- Modelo from-scratch de referencia: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.2-3B
- Tokenizador utilizado: https://huggingface.co/llm-jp/llm-jp-3-440m
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Herramienta de evaluacion llm-jp-eval: https://github.com/llm-jp/llm-jp-eval
- Blog de LLM-jp con resultados de referencia: https://llm-jp.github.io/blog/2025/02/05/instruct3.html
