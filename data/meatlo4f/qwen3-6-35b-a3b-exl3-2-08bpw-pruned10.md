# meatlo4f/Qwen3.6-35B-A3B-exl3-2.08bpw-pruned10

## Resumen

Qwen3.6-35B-A3B-exl3-2.08bpw-pruned10 es una variante podada y cuantizada del modelo Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario meatlo4f. El modelo original es un transformer de tipo mezcla de expertos (MoE) con 35.000 millones de parametros totales y 3.000 millones activos por token, concebido para generacion de texto, razonamiento y codigo. Esta version concreta aplica una cuantizacion EXL3 a 2,08 bits por peso y elimina 26 de los 256 expertos por capa (se conservan 230), ademas de retirar la torre de vision.

El objetivo declarado es que el modelo quepa en un Mac de Apple Silicon con 16 GB de memoria unificada. El resultado ocupa 8,94 GiB en disco y alcanza un pico de 10,68 GiB de memoria con contexto de 8.000 tokens, segun las mediciones del autor en un M5 Max. La poda se realizo por frecuencia de enrutamiento, calculada sobre el split de entrenamiento de WikiText-2 y una muestra de codigo, sin recuantizar los tensores de los expertos restantes.

Es relevante porque demuestra que un MoE de 35.000 millones de parametros puede reducirse a menos de 11 GiB manteniendo una perplexity de 6,353 frente a 5,903 del modelo bf16 de referencia, y conservando 159 de 164 aciertos en HumanEval. La licencia Apache 2.0 facilita su uso comercial, aunque el ecosistema de ejecucion (MLXL3) esta limitado a Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), podado a 230 expertos por capa y sin torre de vision |
| Parametros totales | 4.764.249.216 (segun safetensors del repo podado; el modelo base original declara 35B-A3B) |
| Parametros activos | 3B (heredado del modelo base Qwen3.6-35B-A3B; no recalculado tras la poda) |
| Longitud de contexto | Hasta 65.536 tokens segun el comando de ejemplo del autor (`--context-length 65536`) |
| Tipos de cuantizacion | EXL3 a 2,08 bits por peso; variante adicional con embeddings a 8 bits (q8emb) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (EXL3 / MLXL3) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con enrutamiento por token, 256 expertos por capa y 3.000 millones de parametros activos sobre 35.000 millones totales. Esta version no reentrena ni recuantiza: parte de la cuantizacion EXL3 de UnstableLlama a 2,08 bits por peso y elimina los 26 expertos menos utilizados de cada capa, elegidos por frecuencia de enrutamiento medida sobre el split de entrenamiento de WikiText-2 mas una muestra de codigo. Tambien se eliminan las filas correspondientes del router y se retira por completo la torre de vision. El archivo `pruning.json` documenta el indice original de cada experto conservado.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO, ya que la model card del autor no lo detalla. La innovacion tecnica principal es la combinacion de cuantizacion extrema (2,08 bpw) con poda estructurada de expertos para reducir el peso en disco de 10,57 GiB a 8,94 GiB con una perdida de perplexity de solo 0,05 puntos respecto a la cuantizacion de origen (6,353 frente a 6,303). El autor senala que el modelo podado casi elimina los bucles de razonamiento que afectaban a la cuantizacion original en HumanEval, aunque no ofrece explicacion.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con respuestas de hasta 12.288 tokens en las pruebas del autor.
- Generacion de codigo: 159 de 164 problemas resueltos en HumanEval en la version podada, igualando al modelo bf16 de referencia.
- Recuperacion de codigo plantado en contexto largo: 64 de 64 aciertos a 32k y 64k tokens.
- Copia exacta de codigo en contexto largo: 16 de 16 aciertos a 32k y 64k tokens.
- Uso como agente con ReAct en tareas de AppWorld (interaccion con APIs y ejecucion multi-paso).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: eliminada en esta version (la torre de vision fue retirada).
- Soporte de tool calling / function calling: no documentado explicitamente en la model card; el uso como agente ReAct sugiere capacidad de invocar acciones, pero no se detalla el formato.

## Casos de uso

- Asistente de codigo en local para desarrolladores con Mac de 16 GB: el modelo resuelve problemas tipo HumanEval con 159/164 aciertos y ocupa 8,94 GiB en disco, por lo que puede ejecutarse en un portatil Apple Silicon sin GPU dedicada mediante MLXL3.
- Agente autonomo de tareas sobre APIs: las pruebas en AppWorld `test_normal` con un agente ReAct de codigo alcanzan 118/168 tareas (70,2%) en la primera ronda, lo que lo hace viable para automatizacion de flujos con llamadas a servicios.
- Analisis de repositorios y contexto largo: con 64k tokens de contexto y recuperacion perfecta de codigo plantado a 32k y 64k, sirve para revisar archivos extensos, buscar referencias cruzadas o responder preguntas sobre bases de codigo grandes.
- Generacion y copia exacta de fragmentos en pipelines de CI/CD: la copia exacta de codigo a 64k tokens (16/16) permite tareas de transformacion y parcheo que requieren fidelidad literal.
- Prototipado y experimentacion con MoE podados: util para investigadores que quieran estudiar el efecto de la poda por frecuencia de enrutamiento sobre calidad y perplexity, con el archivo `pruning.json` como referencia reproducible.
- Despliegue en entornos con memoria muy limitada: al necesitar 10,68 GiB de pico a 8k de contexto, encaja en maquinas de 16 GB donde un MoE de 35B en bf16 (67 GB) seria inviable.
- Educacion y demos offline: al ser Apache 2.0 y ejecutarse en local, permite montar demostraciones sin conexion ni coste de API.

## Benchmarks y rendimiento

Perplexity en WikiText-2 (16 ventanas de 2.048 tokens, segunda mitad puntuada, 16.368 tokens):

| Modelo | Tamano en disco | Perplexity | KL vs bf16 (media) | Acuerdo top-1 | Memoria pico a 8k |
|---|---|---|---|---|---|
| bf16 referencia | 67 GB | 5,903 | 0 | 1 | - |
| EXL3 2,08 bpw (origen) | 10,57 GiB | 6,303 | 0,1141 | 85,9% | 11,48 GiB |
| pruned10 | 8,94 GiB | 6,353 | 0,1261 | 85,4% | 10,68 GiB |
| pruned10-q8emb | 8,46 GiB | 6,354 | 0,1264 | 85,5% | 10,19 GiB |

Pruebas de tarea (arnes propio del autor, greedy, thinking activado, limite de 12.288 tokens de respuesta):

| Prueba | bf16 | Cuantizacion origen 2,08 | pruned10 | pruned10-q8emb |
|---|---|---|---|---|
| HumanEval (164) | 159 | 132 | 159 | 153 |
| MMLU muestra (150) | no ejecutado | 124 | 121 | 124 |
| Recuperacion de codigo plantado a 32k y 64k (64) | no ejecutado | 64 | 64 | 64 |
| Copia exacta de codigo a 32k y 64k (16) | no ejecutado | 14 | 16 | 16 |

AppWorld `test_normal` (168 tareas, agente ReAct de codigo, temperatura 1,0, top-k 20, sin semilla, una ejecucion por celda):

| Configuracion | bf16 (mlx-lm) | pruned10-q8emb (fork MLXL3) |
|---|---|---|
| Ronda uno: thinking previo descartado, limite 8.192 tokens | 121 (72,0%) | 118 (70,2%) |
| Ronda dos: thinking previo conservado, limite 24.576 tokens | 123 (73,2%) | 110 (65,5%) |
| Ambas rondas, de 336 | 244 (72,6%) | 228 (67,9%) |

El autor advierte que una sola ejecucion por celda no resuelve diferencias inferiores a unas 10 tareas, ya que repetir el mismo modelo sobre las mismas tareas cambio entre 36 y 50 tareas.

## Requisitos de hardware

- Memoria: 10,68 GiB de pico a 8k de contexto para pruned10; 10,19 GiB para la variante q8emb; 11,48 GiB para la cuantizacion de origen.
- Disco: 8,94 GiB (pruned10), 8,46 GiB (pruned10-q8emb), 10,57 GiB (origen).
- GPU recomendadas: Apple Silicon (M-series) con memoria unificada; el autor lo probo en un M5 Max de 128 GB. No se ha probado en NVIDIA ni AMD con exllamav3.
- Cabe en consumer GPU: si, en Macs de 16 GB segun el diseno, aunque el autor no lo ha ejecutado aun en una maquina real de 16 GB.
- Despliegue: MLXL3 en Apple Silicon (`mlxl3 serve /ruta/al/modelo --port 8000 --context-length 65536`). La variante q8emb requiere un fork de MLXL3.
- Parametros del servidor: acepta `temperature`, `top_k` y `repetition_penalty`; rechaza `top_p`, `min_p` y `seed`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pruned10 (este) | 4,76B en safetensors (base 35B-A3B) | 65.536 | 6,353 | 159/164 | Apache 2.0 | Hugging Face, MLXL3 |
| EXL3 2,08 bpw origen | 35B-A3B | 65.536 (heredado) | 6,303 | 132/164 | Apache 2.0 | Hugging Face |
| Qwen3.6-35B-A3B bf16 | 35B-A3B | 65.536 (heredado) | 5,903 | 159/164 | Apache 2.0 | Hugging Face |
| pruned10-q8emb | 4,76B en safetensors (base 35B-A3B) | 65.536 | 6,354 | 153/164 | Apache 2.0 | Hugging Face, fork MLXL3 |

No se dispone de datos de benchmarks frente a modelos de otros fabricantes (Llama, Mistral, Gemma) en la informacion proporcionada. La comparativa se limita a las variantes del mismo modelo base documentadas por el autor.

## Limitaciones y advertencias

- Una sola ejecucion sin semilla por celda en AppWorld; sin top-p ni min-p porque MLXL3 los rechaza, lo que limita la reproducibilidad.
- No se ha ejecutado aun en una maquina real de 16 GB; las cifras de memoria proceden de un Mac de 128 GB.
- Solo texto: la torre de vision fue eliminada, por lo que no admite imagenes.
- No probado en exllamav3 sobre NVIDIA o AMD; el numero de expertos por capa (230) difiere de los 256 de la configuracion base, lo que puede romper herramientas que asuman la arquitectura original.
- La cuantizacion a 2,08 bits y la poda introducen degradacion medible: perplexity 6,353 frente a 5,903 del bf16 y acuerdo top-1 del 85,4%.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; inherente a modelos de lenguaje, agravado por la cuantizacion extrema.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y la cuantizacion de origen deben conservar sus avisos de licencia.
- El ecosistema de ejecucion esta atado a MLXL3 y Apple Silicon; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meatlo4f/Qwen3.6-35B-A3B-exl3-2.08bpw-pruned10
- Modelo base (cuantizacion de origen): https://huggingface.co/UnstableLlama/Qwen3.6-35B-A3B-exl3-2.08bpw
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Variante q8emb: https://huggingface.co/meatlo4f/Qwen3.6-35B-A3B-exl3-2.08bpw-pruned10-q8emb
- Repositorio MLXL3: https://github.com/0xZKnw/mlxl3
