# meatlo4f/Qwen3.6-35B-A3B-exl3-2.08bpw-pruned10-q8emb

## Resumen

Qwen3.6-35B-A3B-exl3-2.08bpw-pruned10-q8emb es una variante cuantizada y podada del modelo MoE Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario meatlo4f. Sobre la cuantizacion EXL3 a 2,08 bits por peso de UnstableLlama se aplican dos reducciones adicionales: la eliminacion de los 26 expertos menos utilizados en cada capa (de 256 a 230, es decir, 2.600 de 2.816 en total) y la conversion de la tabla de embeddings a int8 con una escala f16 por fila. El resultado es un checkpoint de 8,46 GiB en disco que, segun el autor, cabe en un Mac Apple Silicon de 16 GB.

La relevancia de esta ficha es acotada: no es un modelo nuevo, sino un artefacto de compresion agresiva orientado a inferencia local en hardware de consumo. El repositorio declara 4.764.497.536 parametros reales en safetensors, muy por debajo de los 35B nominales del nombre, lo que refleja el efecto combinado del pruning de expertos y de la cuantizacion. La licencia es Apache 2.0, heredada del modelo base.

Requiere un fork no oficial de MLXL3 porque el MLXL3 estandar no lee los tensores de embedding de 8 bits. El autor aporta mediciones de perplejidad, KL frente a bf16 y tareas de codigo y agentes ejecutadas en un Apple M5 Max, pero advierte que no se ha probado en una maquina de 16 GB real ni en GPUs NVIDIA o AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), derivada de Qwen3.6-35B-A3B; sin vision tower |
| Parametros totales | 4.764.497.536 (safetensors del repo); el nombre comercial indica 35B-A3B sobre el modelo original |
| Parametros activos | no disponible (el modelo base es A3B, pero no se detalla el recuento activo tras el pruning) |
| Longitud de contexto | 65.536 tokens en el servidor MLXL3 (`--context-length 65536`); probado con exito a 32k y 64k |
| Tipos de cuantizacion | EXL3 a 2,08 bits por peso; embeddings en int8 con escala f16 por fila; sin re-cuantizacion adicional |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3/MLXL3), 8,46 GiB en disco |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.6-35B-A3B: 256 expertos por capa en la configuracion original, de los que este artefacto conserva 230. La seleccion de expertos se hizo por frecuencia de routing, contada sobre el split de entrenamiento de WikiText-2 mas una muestra de codigo (no el split de test usado en las mediciones); el fichero `pruning.json` documenta el indice original de cada experto conservado. Los tensores de los expertos eliminados y las filas correspondientes del router se borraron sin re-cuantizar. Adicionalmente se elimino por completo la torre de vision y se sustituyo la tabla de embeddings por codigos int8 (`model.language_model.embed_tokens.q8`) mas una escala f16 por fila (`.q8_scale`).

No hay informacion sobre el dataset de entrenamiento original, el numero de tokens, ni sobre si hubo RLHF o DPO; esos datos corresponden al modelo Qwen subyacente y no se detallan en la informacion disponible. La innovacion tecnica de este artefacto es exclusivamente de compresion: pruning guiado por frecuencia de routing, cuantizacion EXL3 a 2,08 bpw y embeddings de 8 bits, todo orientado a reducir la huella de memoria hasta 10,19 GiB en contexto de 8k. El autor senala que el pruning elimina casi por completo los bucles de "thinking" que afectaban a la cuantizacion fuente (31 problemas atascados en HumanEval frente a 2 y 5 en las versiones podadas), sin ofrecer explicacion.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado en las pruebas del autor.
- Generacion de codigo: 153/164 en HumanEval segun el harness propio del autor.
- Recuperacion de codigo plantado en contexto largo: 64/64 a 32k y 64k tokens.
- Copia exacta de codigo en contexto largo: 16/16 a 32k y 64k tokens.
- Uso como agente ReAct con tool calling: evaluado en AppWorld `test_normal` con un agente de codigo ReAct estandar.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: eliminada explicitamente (torre de vision borrada); el modelo es solo texto.
- Servidor MLXL3 con soporte de `temperature`, `top_k` y `repetition_penalty`; rechaza `top_p`, `min_p` y `seed`.

## Casos de uso

- Inferencia local en Mac Apple Silicon de 16 GB: el objetivo declarado del artefacto; con 10,19 GiB de pico a 8k de contexto y 8,46 GiB en disco, deja margen para el sistema en una maquina de 16 GB, aunque el autor no lo ha verificado en hardware real de esa capacidad.
- Asistente de codigo en local: los resultados de HumanEval (153/164) y la copia exacta de codigo a 64k lo hacen util para autocompletado y refactorizacion sobre repositorios con contexto largo, sin depender de la nube.
- Agentes con tool calling en entornos de recursos limitados: el rendimiento en AppWorld (70,2% en la primera ronda, 65,5% en la segunda) permite ejecutar agentes ReAct locales, aceptando la perdida de unos pocos puntos frente a bf16.
- Analisis de documentos largos: la ventana de 65.536 tokens y la recuperacion perfecta de codigos plantados a 64k lo habilitan para resumir o consultar ficheros extensos en una sola pasada.
- Prototipado e investigacion de tecnicas de compresion: el repo incluye `pruning.json` y mediciones de KL y acuerdo top-1, lo que lo convierte en un caso de estudio reproducible de pruning de expertos y cuantizacion extrema.
- Despliegue offline en portatiles: al no requerir GPU dedicada ni conexion, encaja en escenarios de campo o con requisitos de privacidad donde los datos no pueden salir del equipo.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir el coste en calidad de bajar a 2,08 bpw con embeddings int8 frente a bf16 (perplejidad 6,354 frente a 5,903).

## Benchmarks y rendimiento

Mediciones del autor en Apple M5 Max. WikiText-2 test, 16 ventanas de 2.048 tokens, segunda mitad puntuada (16.368 tokens), frente a las log-probabilidades guardadas del modelo bf16:

| Modelo | Tamano en disco | Perplejidad | KL vs bf16 (media) | Acuerdo top-1 | Pico de memoria a 8k |
|---|---|---|---|---|---|
| bf16 referencia | 67 GB | 5,903 | 0 | 1 | - |
| EXL3 2,08 bpw (fuente) | 10,57 GiB | 6,303 | 0,1141 | 85,9% | 11,48 GiB |
| pruned10 | 8,94 GiB | 6,353 | 0,1261 | 85,4% | 10,68 GiB |
| pruned10-q8emb (este modelo) | 8,46 GiB | 6,354 | 0,1264 | 85,5% | 10,19 GiB |

Pruebas de tarea (harness propio, greedy, thinking on, limite de respuesta de 12.288 tokens):

| Prueba | bf16 | Cuant fuente 2,08 | pruned10 | pruned10-q8emb |
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

El autor advierte que el limite de la ronda uno trunco 125 respuestas del bf16 frente a 12 de este modelo, por lo que subestima la diferencia; ademas, repetir la misma ejecucion sobre las mismas tareas movio entre 36 y 50 tareas, de modo que una sola ejecucion no resuelve diferencias inferiores a unas 10 tareas.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 10,19 GiB de pico a 8k de contexto; 8,46 GiB en disco.
- Hardware objetivo: Mac Apple Silicon de 16 GB, segun el autor; las mediciones se hicieron en un M5 Max de 128 GB.
- GPUs NVIDIA/AMD: no probado; el autor indica explicitamente que no se ha testeado en exllamav3 sobre NVIDIA o AMD.
- Cabe en GPU de consumo: no confirmado; el formato EXL3/MLXL3 esta orientado a Apple Silicon, no a CUDA.
- Despliegue: fork de MLXL3 (`git clone -b fit-levers https://github.com/EnriqueGalindo/mlxl3`), compilado segun el README del proyecto y servido con `mlxl3 serve <ruta> --port 8000 --context-length 65536`. El MLXL3 estandar no lee los embeddings int8; para ese caso el autor remite a la variante sin embeddings cuantizados.
- vLLM, llama.cpp, Ollama y TGI: no disponibles para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pruned10-q8emb (este) | 4,76B en safetensors; 230 expertos/capa | 65.536 | PPL 6,354; HumanEval 153; AppWorld 67,9% | Apache 2.0 | Hugging Face, requiere fork MLXL3 |
| Qwen3.6-35B-A3B-exl3-2.08bpw-pruned10 | mismo pruning, embeddings sin cuantizar | 65.536 | PPL 6,353; HumanEval 159; AppWorld no ejecutado | Apache 2.0 | Hugging Face, MLXL3 estandar |
| Qwen3.6-35B-A3B-exl3-2.08bpw (fuente) | 256 expertos/capa | 65.536 | PPL 6,303; HumanEval 132; AppWorld no ejecutado | Apache 2.0 | Hugging Face |
| Qwen3.6-35B-A3B bf16 | 35B nominales | 65.536 | PPL 5,903; HumanEval 159; AppWorld 72,6% | Apache 2.0 | Hugging Face |

La variante pruned10 sin embeddings cuantizados es la alternativa directa si se necesita compatibilidad con MLXL3 estandar: ocupa 0,48 GiB mas y obtiene 6 puntos mas en HumanEval en el harness del autor, con perplejidad practicamente identica.

## Limitaciones y advertencias

- Una sola ejecucion sin semilla por celda de AppWorld; sin top-p ni min-p porque MLXL3 las rechaza. La varianza entre ejecuciones (36-50 tareas) impide resolver diferencias pequenas.
- No probado en una maquina de 16 GB real; las cifras de memoria provienen de un Mac de 128 GB.
- Solo texto: la torre de vision fue eliminada, por lo que no admite entradas de imagen.
- No testeado en exllamav3 sobre NVIDIA o AMD; el recuento de expertos por capa (230) difiere de los 256 de la configuracion base, lo que puede romper herramientas que asuman la config original.
- Requiere un fork no oficial de MLXL3; el servidor rechaza `top_p`, `min_p` y `seed`, lo que limita la reproducibilidad y el ajuste fino de muestreo.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser una cuantizacion a 2,08 bpw con pruning, la degradacion frente a bf16 es medible (KL 0,1264, acuerdo top-1 85,5%) y previsiblemente mayor en tareas fuera de las evaluadas.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y la cuantizacion intermedia imponen sus propias condiciones; conviene verificar la cadena completa antes de produccion.
- El nombre del repo sugiere 35B-A3B, pero el recuento real en safetensors es de 4,76B; no debe interpretarse como un modelo de 35B completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/meatlo4f/Qwen3.6-35B-A3B-exl3-2.08bpw-pruned10-q8emb
- Modelo base (cuantizacion fuente): https://huggingface.co/UnstableLlama/Qwen3.6-35B-A3B-exl3-2.08bpw
- Variante sin embeddings cuantizados: https://huggingface.co/meatlo4f/Qwen3.6-35B-A3B-exl3-2.08bpw-pruned10
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Fork de MLXL3 usado: https://github.com/EnriqueGalindo/mlxl3
