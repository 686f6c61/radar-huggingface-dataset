# Bossiara13/Mythos

## Resumen

Mythos es un checkpoint de preentrenamiento publicado en Hugging Face por el usuario Bossiara13 bajo el codename interno `numbat`. Segun la model card, se trata de un checkpoint extraido a mitad de entrenamiento (paso 1.830.000 de una run de aproximadamente 1,96 millones de pasos) de lo que el autor describe como una run de entrenamiento de clase Mythos de Anthropic. El modelo emplea una arquitectura hibrida que combina Gated DeltaNet (GDN) con Multi-head Latent Attention (MLA), capas feed-forward de tipo Mixture-of-Experts y Multi-Token Prediction (MTP).

El checkpoint contiene 6.849.377.242.584 parametros almacenados en safetensors (aproximadamente 6,85 billones), aunque la model card declara "~14T param" para el modelo completo, una discrepancia que no se explica en la documentacion disponible. Los pesos estan cuantizados en NVFP4 (formato de 4 bits con bloques de escala E4M3 y payload E2M1), lo que da un repositorio de 7.720,6 GB repartido en 772 shards de menos de 10,6 GB cada uno.

La relevancia del artefacto es fundamentalmente tecnica y de investigacion: permite inspeccionar una arquitectura MoE de escala extrema con atencion hibrida y decodificacion especulativa mediante MTP, ademas de incluir una implementacion de referencia completa (`modeling_numbat.py`) que carga el checkpoint con `load_state_dict(strict=True)`. No obstante, al ser un checkpoint crudo de preentrenamiento sin post-entrenamiento ni RLHF, no es apto para uso en produccion como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Gated DeltaNet (GDN) + Multi-head Latent Attention (MLA), con capas MoE y Multi-Token Prediction (MTP) |
| Parametros totales | 6.849.377.242.584 en safetensors (~6,85 B); la model card declara "~14T" para el modelo completo (discrepancia no aclarada) |
| Parametros activos | no disponible (MoE con 1.224 expertos, top-48 + 1 compartido; no se especifica el numero de parametros activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E4M3 scale blocks + E2M1 payload); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (772 shards, indice `model.safetensors.index.json`), mas implementacion de referencia en Python (`configuration_numbat.py`, `modeling_numbat.py`) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un stack hibrido de 114 capas que alterna Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente y compuertas) y Multi-head Latent Attention (el esquema de atencion con cache latente comprimida popularizado por DeepSeek). Las capas feed-forward son de tipo Mixture-of-Experts con 1.224 expertos, enrutamiento top-48 mas un experto compartido, una configuracion de granularidad muy fina y un numero de expertos activos por token inusualmente alto. Se incluye ademas una capa de Multi-Token Prediction, expuesta mediante `NumbatForCausalLM.draft`, que permite decodificacion especulativa prediciendo varios tokens por paso.

El entrenamiento se realizo sobre una run de aproximadamente 1,96 millones de pasos, de los cuales el checkpoint corresponde al paso 1.830.000, es decir, en la fase final del preentrenamiento. No se documentan en la informacion disponible el numero de tokens procesados, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones; la propia model card indica explicitamente que no hay post-entrenamiento. Los pesos publicados son una copia de evaluacion cuantizada a NVFP4 desde los pesos BF16 originales, que no se han liberado. El tokenizador es un BPE a nivel de byte con 131.072 tokens.

## Capacidades

- Generacion de texto autoregresiva a partir de los pesos de preentrenamiento, sin ajuste por instrucciones.
- Razonamiento y generacion de codigo en la medida en que emergen del preentrenamiento, sin garantia de calidad conversacional.
- Decodificacion especulativa mediante la capa MTP (`NumbatForCausalLM.draft`), que permite proponer varios tokens por paso.
- Carga completa del checkpoint con `load_state_dict(strict=True)` y via `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.
- Soporte de tool calling, function calling y comportamiento agentico: no disponible (requiere post-entrenamiento del que no se dispone).
- Capacidades multilingues: no disponible.
- Vision, audio o modalidades adicionales: no disponible.

## Casos de uso

- Investigacion de arquitecturas hibridas de atencion: el checkpoint permite estudiar en la practica como se comporta una pila de 114 capas que alterna GDN y MLA, comparando patrones de activacion y coste de cache frente a transformers densos.
- Analisis de enrutamiento MoE a gran escala: con 1.224 expertos y top-48, el modelo es un banco de pruebas para estudiar balanceo de carga, colapso de expertos y especializacion por dominio en un regimen de granularidad extrema.
- Evaluacion de decodificacion especulativa con MTP: la capa `draft` permite medir tasas de aceptacion y aceleracion efectiva en distintos regimenes de temperatura y longitud de contexto.
- Desarrollo y validacion de kernels para NVFP4: los 772 shards en formato E4M3/E2M1 son un corpus realista para probar implementaciones de dequantizacion y matmul de 4 bits en hardware compatible.
- Reproducibilidad de cargas estrictas: la implementacion de referencia con un slot por tensor permite validar pipelines de `load_state_dict(strict=True)` y herramientas de sharding a escala de terabytes.
- Estudio de checkpoints intermedios de preentrenamiento: al ser un corte en el paso 1.830.000, sirve para analizar la evolucion de capacidades (perplejidad, sintaxis, factualidad) en las ultimas fases de una run larga.
- Docencia y divulgacion tecnica: la disponibilidad de `configuration_numbat.py` y `modeling_numbat.py` facilita explicar el funcionamiento interno de un MoE hibrido con codigo ejecutable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe un `ckpt_metadata.json` con la salida del arnes de evaluacion, pero no se incluyen cifras en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 7.720,6 GB en NVFP4, por lo que se necesitan al menos ~7,8 TB de memoria agregada solo para los pesos, mas cache KV y activaciones.
- GPU recomendadas: no es viable en GPUs individuales. La model card indica que el equipo de evaluacion usa aproximadamente 85 instancias de Trainium2 solo para alojar los pesos; en el ecosistema NVIDIA requeriria un cluster multi-nodo con GPUs de 80 GB o superiores (H100, H200, B200) y paralelismo tensorial mas pipeline.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 5090, etc.); ni siquiera en configuraciones multi-GPU domesticas.
- Opciones de despliegue: la model card cita un runtime interno "Neuron-parallel"; para el publico solo se ofrece la implementacion de referencia en PyTorch (`modeling_numbat.py`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y el formato NVFP4 limita las opciones disponibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mythos (numbat) | ~6,85 B en safetensors (~14 T declarados) | no disponible | Hibrida GDN/MLA + MoE 1.224 expertos, NVFP4 | no disponible | Hugging Face, checkpoint de preentrenamiento |
| DeepSeek-V3 | 671 B totales, 37 B activos | 128 K | MoE con MLA | Licencia propia permisiva con restricciones | Pesos abiertos |
| Qwen3-235B-A22B | 235 B totales, 22 B activos | 128 K | MoE | Apache 2.0 | Pesos abiertos |
| Llama 3.1 405B | 405 B densos | 128 K | Transformer denso | Licencia comunitaria Llama | Pesos abiertos |

La comparativa es orientativa: Mythos se situa en una escala de parametros muy superior a cualquiera de los modelos abiertos de referencia y emplea un formato de cuantizacion (NVFP4) que ninguno de ellos usa por defecto. Ademas, los modelos comparados han pasado por post-entrenamiento, mientras que Mythos es un checkpoint crudo, por lo que la comparacion de capacidades practicas no es directa.

## Limitaciones y advertencias

- Checkpoint de preentrenamiento sin post-entrenamiento ni RLHF: no sigue instrucciones, no esta alineado y no debe usarse como asistente conversacional.
- Discrepancia de parametros: la model card declara "~14T" pero los safetensors suman 6.849.377.242.584 parametros; no se explica la diferencia (posiblemente por contar el estado del optimizador o pesos no publicados).
- Procedencia no verificable: el autor no documenta el origen de los pesos ("Can't say more than what's already in the repo"), lo que impide confirmar la cadena de custodia y plantea dudas sobre la legitimidad y la licencia del artefacto.
- Licencia no disponible: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion ni obras derivadas.
- Riesgo elevado de alucinacion y salidas incoherentes por tratarse de un modelo a medio entrenar.
- Idiomas soportados no documentados; el comportamiento multilingue es impredecible.
- Longitud de contexto no especificada, lo que impide planificar cargas de trabajo con ventanas largas.
- Requisitos de hardware extremos (~7,8 TB en NVFP4) que lo hacen inaccesible para la mayoria de equipos.
- El formato NVFP4 y la dependencia de `trust_remote_code=True` introducen riesgos de seguridad y de compatibilidad con herramientas estandar.
- No hay garantias de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bossiara13/Mythos
- Model card (incluida en el repositorio): https://huggingface.co/Bossiara13/Mythos/blob/main/README.md
- Implementacion de referencia: `configuration_numbat.py` y `modeling_numbat.py` en el repositorio de Hugging Face
- Paper, blog o repositorio adicional: no disponible
