# hzlo0/lilo-100m

## Resumen

lilo-100m es un modelo de lenguaje de aproximadamente 110 millones de parametros desarrollado por el usuario hzlo0, que implementa la arquitectura DeepSeek-V4 y esta ajustado para chat y seguimiento de instrucciones en indonesio. No es un modelo entrenado desde cero por su autor: se trata de un reempaquetado del modelo neosantara/wader-100m (a su vez derivado de neosantara/wader-100m-base, preentrenado sobre el dataset neosantara/IndoTalk y ajustado con neosantara/IndoTalkSFT). El autor declara explicitamente que no se utilizaron pesos de DeepSeek-V4, solo su arquitectura y su tokenizador.

La relevancia del lanzamiento no esta en la calidad del modelo, sino en el trabajo de ingenieria para hacerlo ejecutable en entornos muy limitados: CPU sin AVX-512 ni VNNI, 2 vCPU y menos de 2 GB de RAM. El autor corrige cinco fallos del codigo upstream (buffer de RoPE sin inicializar tras la carga en meta-device, `forward` con `use_cache=False` hardcodeado, `return_dict` deprecado en transformers 5.x, casting accidental de activaciones a int8 en la puente de expertos y errores de NaN en bf16) y publica dos variantes cuantizadas en safetensors, fp16 (221 MB) e int8 (119 MB), con velocidades de decodificacion medidas.

Se trata, por tanto, de un modelo de proposito experimental y educativo, no de un modelo de produccion: la propia model card reconoce que el entrenamiento es muy corto (5.000 pasos de preentrenamiento y 3.000 de SFT) y que las generaciones son a menudo incoherentes o factualmente incorrectas. Su interes es servir como banco de pruebas de bajo coste para la arquitectura DeepSeek-V4 (MoE con Hyper-Connections y atencion MLA) en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con MoE y atencion MLA (arquitectura DeepSeek-V4); Hyper-Connections con hc_mult=4 y enrutamiento Sinkhorn en lugar de stream residual |
| Parametros totales | ~110M (41M en embeddings, 69M no-embedding) |
| Parametros activos | no disponible (MoE con 4 expertos enrutados + 1 compartido y enrutamiento top-2) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | fp16 (por defecto) e int8 simetrica group-wise (group=64) en todas las capas `nn.Linear` y embeddings; normas, router y parametros HC permanecen en fp32 |
| Idiomas soportados | indonesio (id) |
| Licencia | apache-2.0 (heredada de neosantara/wader-100m) |
| Formato de pesos | safetensors (`model.fp16.safetensors`, `model.int8.safetensors`) mas codigo Python personalizado (`modeling_deepseek_v4.py`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DeepSeek-V4 a escala reducida: 8 capas, hidden size de 320, atencion multi-query con 8 cabezas de consulta y 1 cabeza de clave/valor, MLA con `q_lora_rank=160` y salida low-rank agrupada. La capa MoE emplea 4 expertos enrutados mas 1 compartido con enrutamiento top-2. La innovacion estructural mas llamativa es el uso de Hyper-Connections (`hc_mult=4`) con enrutamiento Sinkhorn, que sustituye al stream residual convencional. El vocabulario es de 129.280 tokens y proviene del tokenizador de DeepSeek-V4. La plantilla de chat tambien sigue el estilo DeepSeek-V4: `<|begin_of_sentence|><|User|>...<|Assistant|>`.

El entrenamiento no es obra de este autor. El preentrenamiento upstream se realizo sobre el dataset neosantara/IndoTalk durante unos 5.000 pasos, seguido de un ajuste supervisado de unas 3.000 iteraciones sobre neosantara/IndoTalkSFT. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales. El trabajo de este release es de naturaleza tecnica y de empaquetado: recalculo de `freqs_cis` bajo demanda para evitar la corrupcion de RoPE tras la carga en meta-device, activacion real del KV cache (el `forward` original forzaba `use_cache=False` y recalculaba toda la secuencia en cada paso), fijacion de `return_dict=True` para transformers 5.x, correccion del casting a int8 en la puente de dtype de los expertos (`w2(x.to(w2.weight.dtype))`) y eliminacion de bf16 por errores de NaN. Ademas, el chunking del prefill a 256 tokens evita que la atencion reserve una matriz `[S,S]` grande.

## Capacidades

- Generacion de texto autoregresiva y conversacion multiturno basica en indonesio.
- Seguimiento de instrucciones sencillas, gracias al ajuste supervisado sobre IndoTalkSFT.
- Ejecucion en CPU pura (fp32/fp16) con KV cache real, lo que permite decodificacion token a token sin recalcular la secuencia completa.
- Razonamiento y matematicas: no disponible (la model card no documenta capacidades especificas ni resultados).
- Generacion de codigo: no disponible.
- Tool calling / function calling: no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no se documentan.
- Capacidades multilingues: limitadas al indonesio; no se declara soporte de otros idiomas.
- Capacidad especial: ninguna declarada (sin modo thinking, sin vision, sin audio).
- Modo de ejecucion de bajo consumo: variantes cuantizadas int8 y fp16 con dequantizacion a fp32 en la carga, pensadas para VPS de 2 vCPU y menos de 2 GB de RAM.

## Casos de uso

- Prototipado de arquitecturas DeepSeek-V4 en local: permite experimentar con MoE, MLA, Hyper-Connections y enrutamiento Sinkhorn en un portatil o VPS barato, sin necesidad de GPU ni de pesos de gran tamano.
- Educacion e investigacion sobre MoE: el reparto de parametros (41M en embeddings frente a 69M no-embedding) y el top-2 sobre 4 expertos enrutados lo convierten en un caso de estudio manejable para analizar enrutamiento y uso de expertos.
- Chat de bajo consumo en indonesio: despliegue en un VPS de 2 vCPU y 1,9 GB de RAM con un pico de RSS medido de ~0,85 GB en int8, adecuado para demos internas o asistentes muy acotados.
- Pruebas de integracion y CI: al pesar 119-221 MB y no requerir GPU, se puede incluir en pipelines de test que verifiquen carga de safetensors, plantillas de chat o correccion de codigo de modelado.
- Benchmarking de cuantizacion: las variantes fp16 e int8 permiten medir el impacto de la cuantizacion group-wise (group=64) en perplejidad (+0,08 % y +0,32 % frente a fp32) y en velocidad de decodificacion.
- Experimentos de atencion con cache: sirve para validar implementaciones de KV cache y chunking de prefill en entornos sin aceleracion por hardware.
- Base para fine-tuning posterior: al estar bajo licencia Apache-2.0 y usar solo 110M de parametros, puede ajustarse en CPU o en una unica GPU consumer para tareas en indonesio muy especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo aporta metricas internas de cuantizacion y velocidad, que se recogen a continuacion.

| Variante | Disco | Delta de perplejidad vs fp32 | Salidas greedy identicas |
|---|---|---|---|
| fp16 (por defecto) | 221 MB | +0,08 % | 5/5 |
| int8 group-wise (group=64) | 119 MB | +0,32 % | 5/5 |

| Variante | Hilos = 1 | Hilos = 2 |
|---|---|---|
| fp16 | 14-22 tok/s | 11-12 tok/s |
| int8 | 9-19 tok/s | 5-8 tok/s |

Medido en 2 vCPU AMD EPYC 7K62 (Zen2, solo AVX2, sin VNNI) y con la maquina bajo carga. En este modelo de 320 de hidden y 8 capas el coste de sincronizacion de hilos domina, por lo que `--threads 1` resulta mas rapido; el autor sugiere probar 2-4 hilos en maquinas de 8 nucleos o mas.

## Requisitos de hardware

- Almacenamiento: 221 MB para la variante fp16 y 119 MB para int8 (mas ~7 MB de escalas de cuantizacion); el repositorio completo ocupa 0,3 GB.
- VRAM para inferencia en GPU: no disponible (no se documentan pruebas en GPU). Por tamano, 110M de parametros en fp16 ocupan aproximadamente 0,22 GB, de modo que cabe sobradamente en cualquier GPU consumer; se trata de una estimacion por tamano, no de una medicion publicada.
- CPU: ejecutable en x86-64 con AVX2; probado en AMD EPYC 7K62 (Zen2) sin VNNI. No se documenta soporte de ARM ni de otras arquitecturas.
- Memoria RAM: pico de RSS medido de ~1,05 GB en fp16 y ~0,85 GB en int8, incluyendo el runtime de Python y torch, sobre un VPS de 2 vCPU y 1,9 GB de RAM. El script `run_cpu.sh` acota `OMP_NUM_THREADS`, fija `MALLOC_ARENA_MAX=1` y fuerza `TMPDIR` a disco.
- GPU recomendadas: no disponible. No se requiere GPU para el caso de uso declarado.
- Opciones de despliegue: transformadores con `transformers`, `safetensors`, `tokenizers` y `accelerate`; scripts incluidos `run_cpu.sh` y `chat_lilo.py`; carga mediante `lilo_common.py` sin `trust_remote_code` o, alternativamente, con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: 14-22 tok/s (fp16, 1 hilo) y 11-12 tok/s (fp16, 2 hilos); 9-19 tok/s (int8, 1 hilo) y 5-8 tok/s (int8, 2 hilos). Latencia por token no desglosada.

## Comparativa con modelos similares

Los unicos modelos comparables documentados en la informacion disponible son el propio linaje upstream. No hay datos publicados para comparar con otros modelos de la clase 100M.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| hzlo0/lilo-100m | ~110M | 2.048 | id | apache-2.0 | safetensors fp16 / int8 | 14-22 tok/s en CPU (fp16, 1 hilo) |
| neosantara/wader-100m | ~110M (mismos pesos) | 2.048 | id | apache-2.0 | fp32, 421 MB en disco | bf16 con errores NaN; sin KV cache |
| neosantara/wader-100m-base | ~110M | 2.048 | id | apache-2.0 | fp32 | preentrenado, sin SFT |

Comparacion con modelos de otras familias (Qwen, TinyLlama u otros del rango 100M-1B): no disponible, ya que la informacion proporcionada no incluye datos de esos modelos ni benchmarks del presente modelo.

## Limitaciones y advertencias

- Tamano muy reducido: 110M de parametros, con la mayor parte de la capacidad concentrada en los embeddings (41M de 110M), lo que deja poca capacidad efectiva para el modelado del lenguaje.
- Entrenamiento insuficiente: 5.000 pasos de preentrenamiento y 3.000 de SFT, frente a los mas de 100.000 pasos y billones de tokens habituales en modelos de produccion.
- Generaciones frecuentemente incoherentes o factualmente erroneas, segun reconoce la propia model card. Riesgo alto de alucinacion; no debe usarse para informacion factual sin verificacion.
- Contexto muy corto: 2.048 tokens, insuficiente para documentos largos, conversaciones extensas o recuperacion aumentada con muchos fragmentos.
- Cobertura idiomatica limitada al indonesio; no se declara soporte de castellano ni de otros idiomas.
- Sin resultados de benchmarks publicados, por lo que no es posible situar su calidad frente a alternativas de forma objetiva.
- Problemas conocidos de la implementacion original ya corregidos en este release (NaN en bf16, RoPE corrupto, ausencia de KV cache); conviene usar exclusivamente esta version y no mezclar ficheros con el upstream.
- Codigo de modelado personalizado (`modeling_deepseek_v4.py`, `lilo_common.py`): requiere `transformers` y revision manual del codigo si se integra en produccion.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero se hereda del upstream; conviene verificar la cadena de licencias de los datasets IndoTalk e IndoTalkSFT.
- Repositorio sin descargas ni likes en el momento de la consulta y con fecha de creacion posterior a la de la informacion de referencia; no hay senales de mantenimiento ni de comunidad.
- Los enlaces de busqueda web proporcionados (portales de salud franceses) no guardan relacion con el modelo y no aportan informacion utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hzlo0/lilo-100m
- Modelo base: https://huggingface.co/neosantara/wader-100m-base
- Modelo upstream con SFT: https://huggingface.co/neosantara/wader-100m
- Dataset de preentrenamiento: https://huggingface.co/datasets/neosantara/IndoTalk
- Dataset de ajuste supervisado: https://huggingface.co/datasets/neosantara/IndoTalkSFT
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
