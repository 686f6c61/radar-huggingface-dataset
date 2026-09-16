# haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit

## Resumen

Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit es una redistribucion cuantizada del modelo Qwen3.8-Flash-Next-125B, publicada por el usuario haihengh. No se trata de un modelo entrenado desde cero, sino de un reempaquetado del snapshot BF16 original al formato propietario `.finch` desarrollado por el propio autor dentro del proyecto FinchMoE, con el objetivo declarado de permitir inferencia por streaming desde SSD en equipos Apple Silicon con memoria limitada.

El modelo base es un transformer de tipo Mixture of Experts con 48 capas, 512 expertos y enrutamiento top-8. La contribucion principal de esta revision, frente a la version anterior `Qwen3.8-Flash-Next-125B-finch-4bit`, es la cuantizacion de la tabla hash de n-gramas PLE (Prompt Lookup / PLE) a int4 afino con grupo 32, lo que reduce el tamano de instalacion de 162 GiB a 97 GiB y baja la lectura por token de dicha tabla de 5 KB a 1,4 KB, sin modificar el resto de tensores, que son byte a byte identicos a la release previa.

Su relevancia es acotada pero concreta: es la primera release del proyecto en la que la tabla PLE tambien esta cuantizada, y el autor documenta mediciones de equivalencia funcional frente a la release anterior (coseno de logits top-10 en torno a 0,9999 y de vocabulario completo en torno a 0,996-0,998), ademas de un caveat honesto sobre el posible volteo de un token greedy en prompts con margen estrecho. El repositorio no tiene descargas ni likes en el momento de la consulta y esta fechado en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 48 capas, 512 expertos, enrutamiento top-8 (segun la model card) |
| Parametros totales | 125 000 millones segun la denominacion del repositorio; la model card no desglosa el recuento exacto |
| Parametros activos | no disponible (MoE top-8 sobre 512 expertos; no se publica el recuento de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 e int8 afino por clase de tensor; tabla PLE en int4 afino, grupo 32, escalas y sesgos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (declarada como `license: other` con `license_name: qwen-community-license-1.0`) |
| Formato de pesos | Formato propietario `.finch`: `manifest.json`, `model_weights.bin`, `packed_experts/`, `ple_shards/`, `tokenizer/`, `verified-install.json`. No es safetensors ni GGUF |
| Tamano del repositorio | 68,4 GB reportados por HuggingFace; 97 GiB de instalacion en disco segun la model card |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso de tipo Mixture of Experts con 48 capas, 512 expertos y seleccion top-8 por token. Sobre esa arquitectura, el autor anade un componente PLE consistente en una tabla hash de n-gramas almacenada en `ple_shards/`, distribuida en 128 particiones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO: estos datos no aparecen en la model card de esta redistribucion.

Lo relevante tecnicamente no es el entrenamiento, sino el proceso de reempaquetado y cuantizacion. El autor uso la herramienta `FinchMoERepack` partiendo de un snapshot local en safetensors BF16, con hash `sha256:99e815241ef03325536b0aaa4441deea45174c17fae31e10f0bb456410c590de`, y genero el formato `.finch`. En esta revision, cada fila de la tabla PLE se dispone con zancada fija como `[nibbles empaquetados][escalas BF16][sesgos BF16]`, de modo que un unico `pread` recupera todo el estado cuantizado de una fila y el decodificador deriva el tamano de grupo de la propia fila. El manifiesto declara la nueva tabla en una ranura aditiva `quant.pleNgram` con `{scheme: affine, weightBits: 4, groupSize: 32, scaleType: BF16, biasType: BF16}`, lo que evita que un motor que no entienda esta ranura lea la tabla de forma silenciosamente incorrecta.

El autor reporta tres verificaciones de fidelidad: comparacion de logits frente a la release anterior con el mismo motor, mismas flags y mismos prompts; comprobacion de que 4 000 filas muestreadas en las 128 particiones presentan `|nuevo - antiguo| / escala` con maximo exactamente 0,5000 y cero filas por encima del limite de medio paso (firma de redondeo al mas cercano); y verificacion de que la tabla de la release anterior es copia byte a byte del snapshot de origen (3 200 filas en 16 particiones). Ademas, se conservan embeddings, atencion, hyper-connections y normas en `model_weights.bin` (3,6 GB) y expertos enrutados y compartidos en `packed_experts/` (63 GB), ambos identicos a la release previa.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy o por muestreo, heredada del modelo base Qwen3.8-Flash-Next-125B.
- Razonamiento y generacion de codigo: el autor menciona una comparativa HumanEval/EvalPlus en curso frente a la release anterior, lo que indica que la evaluacion de codigo se considera relevante para este modelo.
- Inferencia en memoria limitada mediante streaming desde SSD: los pesos no residen completos en RAM; la memoria queda dominada por la cache KV y el scratch.
- Cuantizacion mixta por clase de tensor (int4/int8) con estado cuantizado por fila recuperable en una sola operacion de lectura.
- Verificabilidad de la instalacion: el fichero `verified-install.json` contiene hashes SHA-256 por fichero, lo que permite omitir el rehashing en cada carga.
- Soporte de tool calling, function calling, agentes, vision, audio o modo thinking: no disponible en la informacion proporcionada. Dependeria del modelo base, pero la model card no lo documenta.
- Capacidades multilingues: no disponible. No se declara lista de idiomas.

## Casos de uso

- Inferencia local en Apple Silicon con RAM limitada: el caso documentado explicitamente es un Mac mini M4 de 16 GB con la instalacion en un SSD externo, obteniendo unas 8,5 tok/s en procesamiento de prompt y unos 3 tok/s en generacion. Es util para experimentacion local con un MoE de gran tamano sin GPU dedicada.
- Ejecucion sobre objetivos moviles: la model card indica que "los equipos mas pequenos y el objetivo iPhone ejecutan las mismas tablas", lo que situa este formato como via para desplegar un modelo de esta escala en dispositivos con memoria muy restringida.
- Generacion por lotes no interactiva: con ~3 tok/s de generacion, el modelo encaja mejor en tareas diferidas (resumen de documentos, generacion de borradores, procesado nocturno) que en chat en tiempo real.
- Investigacion sobre cuantizacion de tablas de lookup: la release aisla el efecto de cuantizar la tabla PLE a int4 grupo 32 manteniendo el resto de tensores identicos, lo que la convierte en un banco de pruebas controlado para medir el impacto de esa decision.
- Auditoria de reproducibilidad de pesos: `verified-install.json` con SHA-256 por fichero y el hash del snapshot de origen permiten verificar cadena de custodia en entornos de investigacion.
- Despliegue en hardware sin CUDA: el formato `.finch` y FinchMoE estan orientados a Apple Silicon mediante streaming desde SSD, por lo que sirve para entornos donde no hay GPU NVIDIA disponible.
- Evaluacion comparativa de motores de inferencia: el autor compara la fidelidad de este port contra una cuantizacion GGUF de llama.cpp (coseno top-10 de 0,995), lo que permite usar esta release como referencia en estudios de precision entre motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que una comparativa HumanEval/EvalPlus frente a la release anterior esta "en progreso".

Lo que si se publica son mediciones de equivalencia funcional entre la release anterior (tabla PLE en BF16 crudo) y esta (tabla PLE en int4 afino grupo 32), con el mismo motor, las mismas flags y los mismos prompts:

| Prompt (tokens de prefill) | Argmax | Coseno top-10 (solapamiento) | Coseno top-100 | Coseno vocabulario completo |
|---|---|---|---|---|
| 62 | coincide | 0,999953 (9/10) | 0,999865 | 0,996408 |
| 426 | coincide | 0,999940 (10/10) | 0,999880 | 0,997876 |
| 2940 | coincide | 0,999897 (10/10) | 0,999806 | 0,996318 |

Como referencia no equivalente (difiere tanto en pesos como en motor), el autor situa la comparacion cruzada del proyecto contra un GGUF de llama.cpp en un coseno top-10 de 0,995, es decir, un orden de magnitud por encima del error introducido por la cuantizacion de la tabla PLE.

Rendimiento medido en hardware documentado:

| Metrica | Valor |
|---|---|
| Procesamiento de prompt (Mac mini M4, 16 GB, SSD externo) | ~8,5 tok/s |
| Generacion (mismo equipo) | ~3 tok/s |
| Lectura de tabla PLE por token | 1,4 KB (antes 5 KB) |
| Reduccion de tamano de instalacion | 162 GiB -> 97 GiB |

## Requisitos de hardware

- VRAM de inferencia: no aplica en el sentido habitual; el formato esta disenado para streaming desde SSD, de modo que los pesos no se cargan completos en memoria. La memoria residente queda dominada por la cache KV y el scratch, no por los pesos.
- Almacenamiento: se requieren 97 GiB de instalacion en disco segun la model card (el repositorio en HuggingFace reporta 68,4 GB, discrepancia no explicada en la informacion disponible). El caso documentado usa un SSD externo.
- Equipo minimo documentado: Mac mini M4 con 16 GB de RAM y SSD externo, con ~8,5 tok/s de prefill y ~3 tok/s de generacion.
- GPU recomendadas: no disponible. No se documenta soporte para A100, H100, RTX 4090 ni otros aceleradores NVIDIA o AMD; el formato `.finch` y FinchMoE estan orientados a Apple Silicon.
- Compatibilidad con GPU de consumo: no disponible para GPU; el objetivo documentado son SoCs Apple (M4) y un objetivo iPhone.
- Opciones de despliegue: el unico motor documentado es FinchMoE, invocado como `FinchMoECLI --model /ruta --prompt "..." --temperature 0.7`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el formato de pesos es propietario.
- Latencia y throughput: ~8,5 tok/s de procesamiento de prompt y ~3 tok/s de generacion en M4 de 16 GB. No hay datos de throughput en lote ni de latencia por peticion en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit (esta release) | 125B (MoE, 48 capas, 512 expertos, top-8) | no disponible | `.finch`, 97 GiB | Qwen Community License 1.0 | ~8,5 tok/s prefill, ~3 tok/s generacion en M4 16 GB | Tabla PLE en int4 afino grupo 32; lectura PLE de 1,4 KB/token |
| Qwen3.8-Flash-Next-125B-finch-4bit (release anterior del mismo autor) | 125B (mismo modelo base) | no disponible | `.finch`, 162 GiB | Qwen Community License 1.0 | misma engine y flags; no se publican cifras de velocidad | Tabla PLE en BF16 crudo; `model_weights.bin` y `packed_experts/` byte a byte identicos |
| Cuantizacion GGUF de llama.cpp citada por el autor | no disponible (modelo no identificado) | no disponible | GGUF | no disponible | coseno top-10 de 0,995 frente a este proyecto | Comparacion no equivalente: difiere en pesos y en motor |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- Riesgo de divergencia en decodificacion greedy: el propio autor documenta que, en un prompt con margen del top-1 de 0,47 nats, la cuantizacion de la tabla PLE provoco una divergencia del token greedy tras unos 25 tokens generados. Ambas continuaciones fueron fluidas. Con muestreo o con margenes amplios el fenomeno no aparece.
- La cuantizacion perturba el logit top-1 en una fraccion de su margen; en prompts con margen estrecho ese desplazamiento puede cambiar la decision de decodificacion.
- Sin benchmarks publicados: no hay resultados de MMLU, HumanEval, GSM8K ni equivalentes. La comparativa HumanEval/EvalPlus esta pendiente.
- Idiomas soportados no declarados. No se puede asumir cobertura multilingue a partir de esta ficha.
- Longitud de contexto no declarada.
- Licencia: el modelo base se distribuye bajo Qwen Community License 1.0, que permite publicacion, distribucion y obras derivadas sujetas a sus condiciones. Es una licencia "other", no una licencia open source aprobada; conviene revisar el texto completo en el fichero `LICENSE` del repositorio antes de un uso comercial.
- Formato propietario: los pesos no estan en safetensors ni GGUF, sino en `.finch`. No son cargables por vLLM, llama.cpp, Ollama o TGI sin una conversion adicional no documentada. El ecosistema se limita a FinchMoE.
- Cadena de custodia: el snapshot BF16 de origen no se publica en este repositorio; la verificacion de integridad depende de `verified-install.json` y del hash del snapshot declarado por el autor.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion independiente.
- Discrepancia de tamano: el repositorio reporta 68,4 GB mientras la model card declara 97 GiB de instalacion. No se explica en la informacion disponible.
- No se documentan sesgos concretos, ni evaluaciones de seguridad, ni comportamientos de rechazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit
- Release anterior (tabla PLE en BF16): https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit
- Repositorio del motor FinchMoE: https://github.com/haihengh/finchMoE
- Licencia (fichero LICENSE en el repositorio): https://huggingface.co/haihengh/Qwen3.8-Flash-Next-125B-finch-4bit-ple4bit/blob/main/LICENSE
- Paper, blog o demo del modelo base: no disponible en la informacion proporcionada
- Los resultados de busqueda web recibidos no contienen informacion relevante sobre este modelo; tratan sobre productos de cuidado capilar y se descartan.
