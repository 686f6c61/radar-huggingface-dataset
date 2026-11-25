# flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-SFT-AllSeeds

## Resumen

SpinningStrawIntoGold-Qwen2.5-Coder-7B-SFT-AllSeeds es una coleccion de modelos de ajuste fino supervisado (SFT) sobre Qwen2.5-Coder-7B, publicada por el autor flaitenberger como material reproducible de las experimentaciones del articulo *Spinning Straw into Gold: Small Amounts of Synthetic Derivations Improve Reasoning in Instruction-Tuned Models*. No es un unico modelo, sino un repositorio de 350,3 GB que agrupa todos los runs de todas las mezclas de entrenamiento y todas las semillas, cada uno en su carpeta `-<Mixture>/seed<S>/` con pesos en bf16 safetensors, tokenizador, model card, `provenance.json` y resultados de lm-evaluation-harness.

El objetivo del trabajo es estudiar si una fraccion pequena de datos sinteticos generados por programa (sin modelo en el bucle) mejora el razonamiento deductivo de modelos ajustados por instrucciones. Los datos sinteticos son problemas de deduccion multi-salto sobre clausulas de Horn con constantes abstractas, verificados por un comprobador simbolico, por lo que son correctos por construccion y no contienen conocimiento del mundo. Se sustituye entre el 1 % y el 25 % de la mezcla Dolci por estos documentos, manteniendo fijo el numero de ejemplos de entrenamiento.

La relevancia reside en que el articulo reporta ganancias de 5 a 16 puntos en ProofWriter y de hasta 7 puntos en subtareas multi-paso de BIG-Bench Hard con solo el 5-25 % de la mezcla reemplazada, manteniendo los benchmarks generales practicamente intactos. El modelo base Qwen2.5-Coder-7B aporta una ventana de contexto de 32 768 tokens y licencia Apache 2.0, lo que facilita la experimentacion y el uso comercial derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B) |
| Parametros totales | 7 620 millones (aproximado, modelo base Qwen2.5-Coder-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5) |
| Tipos de cuantizacion | pesos publicados en bf16 safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-7B: un transformer decoder-only con atencion causal estandar, RMSNorm, RoPE y capas MLP con activacion SwiGLU. El ajuste fino es SFT puro sobre mezclas de 100 000 ejemplos (o 110 000 en las variantes de control), partiendo de Dolci-Instruct-SFT-No-Tools de AllenAI y sustituyendo una fraccion por derivaciones sinteticas generadas por un programa corto. Las mezclas publicadas incluyen `Dolci100k-Baseline`, `Dolci100k-English10pct`, `Dolci100k-English10pct-NonCodeReplaced`, `Dolci100k-Formal05pct`, `Dolci100k-Formal05pct-NonCodeReplaced`, `Dolci100k-Procedural10pct` (ablacion de contenido con trazas sin logica), `Dolci100k-plus-English10k` y `Dolci110k-Baseline` (control de tamano).

Los datos sinteticos son deducciones ground sobre clausulas de Horn con constantes abstractas (`c0`, `c1`, ...), reglas que encadenan hasta 25 capas, reglas distractoras que nunca se disparan y una pregunta con cuatro respuestas candidatas. El target deriva la respuesta paso a paso, en ingles o en notacion formal con constantes y predicados declarados y lineas numeradas y justificadas. Un comprobador simbolico valida cada derivacion, de modo que no hay ruido de etiquetas. No se reporta uso de RLHF ni DPO; el entrenamiento es exclusivamente supervisado. La innovacion metodologica principal es el uso de datos sinteticos verificables generados por programa en lugar de por otro modelo, y el analisis de ablacion que separa el efecto de la logica del de las trazas procedimentales.

## Capacidades

- Generacion de texto y razonamiento deductivo multi-paso sobre problemas de logica proposicional y de primer orden.
- Derivaciones paso a paso en ingles y en notacion formal con lineas numeradas y justificadas.
- Razonamiento encadenado con hasta 25 capas de reglas, incluyendo manejo de reglas distractoras.
- Generacion de codigo (heredada del modelo base Qwen2.5-Coder-7B, aunque las mezclas `NonCodeReplaced` preservan explicitamente los ejemplos de codigo del baseline).
- Instrucciones generales en ingles (mezcla Dolci-Instruct-SFT-No-Tools).
- Capacidades multilingues limitadas: solo se declara ingles.
- Soporte de tool calling: no declarado explicitamente; el dataset base excluye herramientas (`No-Tools`).
- Modo thinking explicito: no disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion en sintesis de datos para razonamiento: reproduccion de los experimentos del articulo comparando mezclas y semillas con lm-evaluation-harness, usando los ficheros `eval/` y `provenance.json` incluidos en cada carpeta.
- Generacion de derivaciones logicas verificables: el modelo produce cadenas de deduccion que un comprobador simbolico puede validar, util para construir datasets de razonamiento con garantia de correccion.
- Evaluacion de robustez ante sesgo de etiqueta: dado que el articulo reporta que el modelo deja de preferir una etiqueta de respuesta sobre las demas, sirve para estudiar calibracion en tareas de eleccion multiple.
- Ajuste fino posterior sobre tareas de logica: al partir de un modelo ya expuesto a deducciones formales, es un punto de partida para fine-tuning en dominios como verificacion de contratos o analisis de normativa.
- Generacion de codigo asistida: las variantes `NonCodeReplaced` conservan todos los ejemplos de codigo del baseline, por lo que mantienen el rendimiento en tareas de programacion mientras anaden capacidad deductiva.
- Docencia y divulgacion: las derivaciones en ingles paso a paso sirven como material didactico para explicar deduccion logica con clausulas de Horn.
- Ablacion controlada en publicaciones: las mezclas `Procedural10pct` y `Dolci110k-Baseline` permiten aislar el efecto de la logica frente al de la longitud o el formato de las trazas.

## Benchmarks y rendimiento

Resultados reportados en la model card para el modelo base Qwen2.5-Coder-7B con las mezclas indicadas (se muestran las filas con datos completos):

| Mezcla | Semilla | ProofWriter d3 (CoT) | FOLIO | BBH | GPQA-Diamond | MMLU | GSM8K | IFEval |
|---|---|---|---|---|---|---|---|---|
| Dolci100k-Baseline | seed3408 | 38,2 | 55,2 | 67,5 | 33,3 | 65,2 | 77,9 | 38,3 |
| Dolci100k-Baseline | seed3409 | 39,6 | 55,7 | 67,2 | 28,8 | 65,1 | 79,3 | 39,4 |

El resto de filas de la tabla de la model card aparecen vacias en la informacion proporcionada. El articulo reporta, de forma agregada, ganancias de 5 a 16 puntos en ProofWriter, hasta 6 puntos en FOLIO y hasta 7 puntos en subtareas multi-paso de BIG-Bench Hard al sustituir entre el 5 % y el 25 % de la mezcla, con benchmarks generales practicamente sin cambios. No se dispone de los valores numericos por mezcla y semilla para verificar estas cifras en la ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15-16 GB para los 7 620 millones de parametros mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones para el modelo base, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para entrenamiento y evaluacion a gran escala; RTX 4090 (24 GB) suficiente para inferencia en bf16 o cuantizada.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion 4 bits, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI, llama.cpp y Ollama previa conversion a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SpinningStrawIntoGold-Qwen2.5-Coder-7B-SFT-AllSeeds | 7 620 M | 32 768 | apache-2.0 | SFT con derivaciones sinteticas verificables |
| Qwen2.5-Coder-7B (base) | 7 620 M | 32 768 | apache-2.0 | Modelo base de codigo e instrucciones |
| Qwen2.5-7B-Instruct | 7 620 M | 32 768 | apache-2.0 | Instrucciones generales con RLHF |
| Modelos de la familia ProofWriter/FOLIO fine-tuned | no disponible | no disponible | no disponible | Especializados en deduccion logica |

La comparativa con alternativas especializadas en deduccion logica no esta disponible en la informacion proporcionada. El articulo reporta que la ganancia en ProofWriter se mantiene en 5 modelos de 3 familias entre 3B y 14B parametros con el renderizado en ingles, lo que sugiere transferibilidad, pero no se detallan los modelos concretos.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Los datos sinteticos son deducciones sobre constantes abstractas sin conocimiento del mundo; el modelo puede no transferir la mejora a dominios que requieran conocimiento factual.
- Riesgo de alucinacion: no se reportan evaluaciones especificas de factualidad ni de tasas de alucinacion.
- El repositorio agrupa decenas de checkpoints en 350,3 GB; la seleccion de la carpeta y semilla correctas es responsabilidad del usuario.
- La model card indica que el articulo esta en revision y que el enlace al preprint se anadira; los resultados agregados no son verificables de forma independiente a partir de la informacion disponible.
- IFEval reportado en torno a 38-39 puntos en el baseline, notablemente bajo para un modelo de 7B, lo que sugiere que el SFT sobre Dolci degrada el seguimiento de instrucciones respecto al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-7B impone sus propios terminos que deben respetarse.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ); cualquier conversion es responsabilidad del usuario.
- El dataset base excluye ejemplos con herramientas (`No-Tools`), por lo que el soporte de tool calling no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaitenberger/SpinningStrawIntoGold-Qwen2.5-Coder-7B-SFT-AllSeeds
- Dataset de mezclas SFT: https://huggingface.co/datasets/flaitenberger/SpinningStrawIntoGold-SFT-Mixtures
- Dataset base Dolci-Instruct-SFT-No-Tools: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT-No-Tools
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Preprint del articulo: no disponible (pendiente de publicacion segun la model card)
