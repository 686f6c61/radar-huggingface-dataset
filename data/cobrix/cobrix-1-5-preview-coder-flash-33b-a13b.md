# CobrIX/CobrIX-1.5-preview-Coder-Flash-33B-A13B

## Resumen

CobrIX-1.5-preview-Coder-Flash-33B-A13B es un modelo de lenguaje decoder-only de tipo Mixture-of-Experts publicado por el usuario CobrIX en HuggingFace. Se construye a partir de una base densa de la familia Qwen 3.5 (identificada en la model card como `qwythos-9b-v2`) y de cinco expertos densos afinados sobre esa misma base, ensamblados mediante un script propio (`convert.py`) sin utilizar mergekit: ninguna matriz de pesos se modifica, promedia ni interpola, solo se copian las proyecciones MLP de cada experto en una estructura MoE nueva.

El modelo tiene 33.113.780.736 parametros totales (unos 33,1 B) en 32 capas, con una mezcla de atencion lineal (24 capas) y atencion completa (8 capas, una cada cuatro). Cada capa sustituye el MLP denso por un bloque MoE con 5 expertos enrutados (top-2 por token) mas 1 experto compartido siempre activo. La nomenclatura del repositorio sugiere unos 13 B de parametros activos, si bien la model card no desglosa ese reparto.

La relevancia de esta publicacion es doble: por un lado, es un ejemplo de construccion de un MoE a partir de modelos densos ya existentes sin herramientas de fusion de terceros; por otro, es una version preview explicitamente incompleta (faltan SFT con modo thinking, MTP y los GGUFs anunciados). No hay benchmarks, licencia declarada, idiomas soportados ni longitud de contexto publicados, y el repositorio acumula 0 descargas y 0 likes, por lo que su calidad real no esta validada por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen35MoEForCausalLM`, decoder-only con bloques MoE dispersos (`model_type=qwen35_moe`, codigo propio servido por `auto_map`) |
| Parametros totales | 33.113.780.736 (~33,1 B) |
| Parametros activos | no disponible (la nomenclatura del repositorio indica "A13B", pero la model card no desglosa el reparto entre base, experto compartido y expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta preview: solo safetensors sin cuantizar. La model card anuncia GGUFs para la version final |
| Idiomas soportados | no disponible (el unico ejemplo de la model card esta en portugues: "Ola! Quem e voce?") |
| Licencia | no disponible |
| Formato de pesos | safetensors (66,2 GB de repositorio) junto con `configuration_qwen35_moe.py` y `modeling_qwen35_moe.py` |
| Expertos | 5 expertos locales, top-2 por token, softmax sobre los 5, mas 1 experto compartido siempre activo |
| Capas y atencion | 32 capas: 24 de atencion lineal y 8 de atencion completa (indices 3, 7, 11, 15, 19, 23, 27 y 31) |
| Router | logits calculados en `float32`, inicializacion aleatoria; puertas del experto compartido inicializadas a cero |
| Fecha de publicacion | 10 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion hibrida: cada capa aplica `input_layernorm -> linear_attn -> post_attention_layernorm -> gate/experts[0..7]/shared_expert -> residual`. El bloque MoE sustituye al MLP denso y combina 5 expertos enrutados (se seleccionan 2 por token) con un experto compartido que es una copia del MLP de la base y que se activa siempre mediante una puerta sigmoide. Los logits del router se calculan en `float32` para estabilidad numerica, y las puertas del experto compartido arrancan a cero, de modo que en la inicializacion el modelo se comporta como la base densa.

El reparto de pesos es estricto: la base aporta `embed_tokens`, todas las capas `linear_attn.*`, las layernorms, `norm`, `rotary_emb` y `lm_head`; cada experto aporta unicamente `gate_proj`, `up_proj` y `down_proj` de cada capa. No se modifica, promedia ni interpola ningun peso. El proceso de construccion se documenta con tres scripts (`convert.py`, `verify.py` y `test.py`), lo que sugiere un pipeline reproducible, aunque no se publican los modelos expertos de origen ni la receta de fine-tuning.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre fases de alineacion tipo RLHF o DPO. La model card indica que se trata de una preview previa al SFT con modo thinking y al entrenamiento MTP (multi-token prediction), por lo que el modelo publicado no incorpora esas etapas. Tampoco se documenta ninguna innovacion adicional de decodificacion.

Conviene senalar dos inconsistencias visibles en la documentacion: el diagrama de arquitectura menciona `experts[0..7]` y el comando de construccion acepta `<e0> ... <e7>` (ocho expertos), mientras que la configuracion declara `num_local_experts=5`. Es un punto a verificar antes de reutilizar el repositorio.

## Capacidades

- Generacion de texto autoregresiva en el marco de un decoder-only estandar; no hay evaluacion publicada de calidad de generacion.
- Generacion de codigo: el nombre del modelo incluye el termino "Coder", pero no se aportan benchmarks ni ejemplos de codigo que confirmen el nivel real en esta tarea.
- Razonamiento multi-paso: no documentado; el modo thinking esta explicitamente anunciado como pendiente para la version final.
- Tool calling o function calling: no disponible, no se menciona en la model card.
- Capacidades de agente: no disponibles ni documentadas.
- Multilingue: no declarado; el unico ejemplo de uso esta redactado en portugues.
- Vision o audio: no soportados segun la informacion disponible (arquitectura exclusivamente de texto).
- Construccion y extension del propio MoE: la contribucion mas clara del repositorio es metodologica, ya que permite reproducir el ensamblado base + expertos con `convert.py` y validarlo con `verify.py` y `test.py`.

## Casos de uso

- Asistente de codigo en editor o IDE: el modelo se presenta bajo la etiqueta "Coder" y su tamano permite servirlo en una GPU profesional; antes de llevarlo a produccion habria que medir su calidad real en autocompletado, ya que no hay HumanEval ni datos equivalentes publicados.
- Revision automatizada de pull requests: con 32 capas y atencion hibrida puede procesar diffs y ficheros completos, aunque la longitud de contexto no esta publicada y debe comprobarse empiricamente antes de fijar el tamano de los prompts.
- Refactorizacion y migracion de codigo entre lenguajes o frameworks, aprovechando la ventana de contexto que permita el modelo; requiere validar previamente el limite real de tokens.
- Despliegue on-premise en una sola GPU de 48 GB con cuantizacion a 8 bits o fp8 (unos 33 GB de pesos), un escenario habitual en equipos con requisitos de soberania del dato que no pueden enviar codigo a APIs externas.
- Inferencia en estacion de trabajo con cuantizacion de 4 bits (aproximadamente 17-18 GB de pesos), viable en GPUs de consumo con 24 GB o mas, aceptando perdida de calidad no medida.
- Investigacion sobre enrutado MoE: dado que el router se inicializa aleatoriamente y las puertas del experto compartido a cero, el repositorio es un banco de pruebas util para estudiar el comportamiento de un router sin preentrenar y el efecto del experto compartido.
- Fine-tuning de expertos por dominio: el pipeline permite entrenar expertos densos sobre la base y reensamblar el MoE con `convert.py`, lo que facilita especializaciones verticales (por ejemplo, codigo financiero o bioinformatico) sin reentrenar el modelo completo.
- Generacion de documentacion tecnica y pruebas unitarias a partir de codigo fuente: caso de uso tipico de un modelo orientado a codigo, condicionado a que el rendimiento real lo permita.
- Comparacion controlada denso frente a MoE: al conservar intactos todos los pesos copiados, permite medir si la composicion de expertos mejora a la base densa en las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MBPP ni ninguna otra metrica, y tampoco se ofrecen comparaciones con la base densa o con los expertos por separado.

## Requisitos de hardware

- Pesos completos en bf16/fp16: 66,2 GB de repositorio, en la practica alrededor de 66 GB de VRAM solo para pesos, mas cache KV. Requiere 1x H100 80 GB, 1x A100 80 GB o reparto en varias GPU.
- Cuantizacion a 8 bits: aproximadamente 33 GB de pesos; encaja en GPU de 40-48 GB (A100 40 GB, L40S 48 GB) con margen limitado.
- Cuantizacion a 4 bits (formato tipo AWQ/GPTQ/NF4): aproximadamente 17-18 GB de pesos, viable en RTX 4090 24 GB, RTX 5090 32 GB o A6000 48 GB, siempre que exista soporte del runtime para la arquitectura.
- GPU de consumo: cabe en tarjetas de 24 GB o mas, pero unicamente con cuantizacion de 4 bits y sin que existan pesos cuantizados publicados en esta preview, por lo que habria que cuantizar el propio usuario.
- Opciones de despliegue: al usar `custom_code` con `auto_map`, la via documentada es `transformers` con `trust_remote_code=True`. No se confirma soporte de vLLM, SGLang, TGI, llama.cpp ni Ollama; la model card solo anuncia GGUFs para la version final, de modo que llama.cpp y Ollama no son utilizables con los ficheros actuales.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia de primera respuesta.
- Almacenamiento y transferencia: los 66,2 GB del repositorio implican un coste de descarga y de disco relevante para cualquier prueba.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas del propio autor. A continuacion se contrasta con modelos MoE de orden de magnitud parecido usando exclusivamente datos publicos de esos otros modelos (no proceden de la model card de CobrIX); la columna de CobrIX refleja solo lo documentado en este repositorio.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CobrIX-1.5-preview-Coder-Flash-33B-A13B | 33,1 B | no disponible (nombre "A13B") | no disponible | no disponible | safetensors, requiere `trust_remote_code` |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 128 K (configuracion publica) | Apache 2.0 | safetensors y GGUFs, soporte amplio en vLLM, llama.cpp y Ollama |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32 K | Apache 2.0 | safetensors y GGUFs, soporte amplio |
| Llama 4 Scout | 109 B | 17 B | hasta 10 M segun documentacion del autor | licencia de comunidad de Meta | safetensors, soporte parcial segun runtime |

Diferencias clave: CobrIX no declara licencia, no publica contexto, no ofrece pesos cuantizados y su arquitectura es de codigo propio, lo que limita el soporte en runtimes estandar. Qwen3-30B-A3B y Mixtral 8x7B, en cambio, son modelos con licencia permisiva, pesos GGUF y soporte amplio de ecosistema, aunque con numeros de parametros activos distintos.

## Limitaciones y advertencias

- Version preview: la propia model card indica que la version final llegara despues del SFT con modo thinking, el MTP y los GGUFs. Lo publicado es un estado intermedio.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Si la base derivada de Qwen 3.5 arrastra condiciones propias, habria que verificarlas antes de cualquier uso en produccion.
- Router sin entrenar: los logits del router se inicializan de forma aleatoria y las puertas del experto compartido a cero. No hay evidencia de que el enrutado haya aprendido una especializacion util, lo que puede degradar la calidad frente a la base densa.
- Ausencia total de evaluacion: sin benchmarks, sin comparaciones con la base y sin validacion de la comunidad (0 descargas, 0 likes). Cualquier uso deberia ir precedido de una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la model card no documenta fases de RLHF ni DPO, por lo que no hay indicios de trabajo de alineacion.
- Contexto e idiomas sin declarar: se desconoce la ventana de contexto real y la cobertura linguistica. El unico ejemplo de la model card esta en portugues y no hay garantia de calidad en castellano.
- Riesgo de seguridad en el codigo: el uso requiere `trust_remote_code=True`, es decir, ejecutar modulos Python del repositorio (`modeling_qwen35_moe.py`, `configuration_qwen35_moe.py`) fuera del codebase auditado de transformers.
- Inconsistencias en la documentacion: el diagrama y el comando `convert.py` describen 8 expertos mientras la configuracion declara 5 (`num_local_experts=5`). Conviene inspeccionar el `config.json` real antes de reutilizar el modelo.
- Compatibilidad limitada: al tratarse de una arquitectura con `model_type` propio, es previsible que no funcione en vLLM, TGI, SGLang, llama.cpp u Ollama sin adaptaciones especificas, aunque esto no se afirma explicitamente en la informacion disponible.
- Datos de entrenamiento opacos: no se publican tokens, composicion del dataset ni procedencia de los expertos, lo que impide auditar sesgos o contaminacion de benchmarks.
- Coste operativo: 66,2 GB de repositorio y necesidad de cuantizar manualmente para GPU de consumo.
- Fecha de publicacion atipica (septiembre de 2026) y ausencia de descargas: no hay senales externas de uso real ni de reproducibilidad por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CobrIX/CobrIX-1.5-preview-Coder-Flash-33B-A13B
- Paper, blog o repositorio asociado: no disponible.
- Demo o espacio interactivo: no disponible.
- Modelos expertos de origen o base publica `qwythos-9b-v2`: no disponible (la model card referencia una ruta local `/mnt/d/CobrIX_Bases/qwythos-9b-v2` sin enlace publico).
- Resultados de la busqueda web: no se ha encontrado ningun enlace relacionado con este modelo. Las entradas devueltas corresponden a documentacion de vehiculos Land Rover Discovery Sport y no guardan relacion con el modelo, por lo que se descartan.
