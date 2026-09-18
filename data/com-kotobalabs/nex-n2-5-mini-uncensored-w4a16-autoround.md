# com-kotobalabs/Nex-N2.5-mini-Uncensored-W4A16-AutoRound

## Resumen

Nex-N2.5-mini-Uncensored-W4A16-AutoRound es una cuantizacion de 4 bits del modelo orcarouter/Nex-N2.5-mini-Uncensored, publicada por com-kotobalabs. El modelo base es a su vez una version abliterated (sin mecanismos de rechazo) de nex-agi/Nex-N2.5-mini, descrito en la model card como un modelo Qwen3.5-MoE 35B-A3B de vision y lenguaje. Esta ficha cubre exclusivamente el checkpoint cuantizado alojado en el repositorio com-kotobalabs/Nex-N2.5-mini-Uncensored-W4A16-AutoRound.

El objetivo declarado del repositorio es cubrir un hueco de despliegue concreto: las publicaciones del autor original (BF16 de 65 GiB, FP8 de 34 GiB para Hopper o superior, NVFP4 de 22 GiB solo Blackwell, MLX para Apple y GGUF para llama.cpp) no cargan en vLLM sobre una tarjeta de 32 GiB que no sea Blackwell. Esta cuantizacion, en formato auto_gptq, si es cargable por vLLM (Marlin o XPU) y SGLang.

La relevancia es doble. Por un lado, es una receta de cuantizacion reproducible (AutoRound 0.15.1, esquema W4A16) aplicada a unos pesos abliterated, lo que la hace util para investigacion sobre alineacion y red-teaming. Por otro, el autor reporta una medicion de rendimiento muy superior a llama.cpp en la misma tarjeta (aproximadamente 1.128 tok/s agregados frente a 137 tok/s), lo que la situa como opcion de alto throughput en hardware Intel Arc Pro B70 de 32 GiB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atencion lineal, etiquetada como qwen3_5_moe; incluye torre visual y cabeza de prediccion multi-token (MTP) |
| Parametros totales | 6.031.903.856 (~6,03 B) segun los safetensors del repositorio. La model card describe el modelo base como 35B-A3B; discrepancia no resuelta en la informacion disponible |
| Parametros activos | ~3 B (nomenclatura A3B del modelo base, no verificada en este repositorio) |
| Longitud de contexto | 65.536 tokens en la configuracion de ejemplo del autor (--max-model-len 65536). Ventana nativa del modelo base: no disponible |
| Tipos de cuantizacion | Exclusivamente W4A16: pesos INT4 simetricos con group size 128 y activaciones BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato auto_gptq (INT4, W4A16) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un reentrenamiento: no hay datos de preentrenamiento, SFT, RLHF ni DPO asociados a este repositorio. La arquitectura heredada del modelo base combina capas de atencion lineal (linear_attn.*_proj) con atencion completa (self_attn.{q,k,v,o}_proj), un bloque MoE con 256 expertos por capa mas un experto compartido, una torre visual para entrada de imagenes y una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa. La etiqueta qwen3_5_moe indica la familia arquitectonica de referencia.

La receta de cuantizacion es identica a la del checkpoint stock de quant-mind: Intel AutoRound 0.15.1 con --scheme W4A16 --group_size 128 (simetrico), --iters 200, --nsamples 128, --seqlen 2048, calibracion sobre NeelNanda/pile-10k y --low_gpu_mem_usage. Se mantienen en BF16 las capas sensibles a la precision: mlp.gate (router), mlp.shared_expert_gate, mtp, lm_head, embeddings y la torre visual completa. Se cuantizan linear_attn.*_proj, self_attn.{q,k,v,o}_proj, los 256 mlp.experts.* y mlp.shared_expert.*. El trabajo se ejecuto sobre Modal con una H100 mediante el job tools/modal-quant/nex_n25_mini_uncensored_w4a16.py del repositorio kotoba-lang/murakumo.

## Capacidades

- Generacion de texto y conversacion multi-turno en formato chat (pipeline text-generation).
- Modo de razonamiento explicito: el modelo piensa antes de responder; requiere --reasoning-parser qwen3 en vLLM para separar el razonamiento del campo content.
- Enrutamiento MoE con 256 expertos y experto compartido, con router y puerta del experto compartido preservados en BF16 para no degradar la seleccion de expertos.
- Entrada multimodal (imagenes): la torre visual se conserva en BF16, aunque el autor no valida esta capacidad en el repositorio cuantizado.
- Prediccion multi-token (MTP) preservada en BF16, lo que abre la puerta a decodificacion especulativa en vLLM.
- Comportamiento sin rechazos (abliterated/uncensored): no aplica capas de negativa declaradas.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Servicio de inferencia de alto throughput en tarjetas Intel Arc Pro B70 de 32 GiB: el autor reporta aproximadamente 1.128 tok/s agregados con vLLM XPU y XPU graph, frente a los 137 tok/s de llama.cpp IQ4_XS en la misma tarjeta. Es el escenario para el que se construyo el checkpoint.
- Investigacion sobre alineacion y abliteration: al ser una derivada sin rechazos, permite estudiar que comportamientos se suprimen con tecnicas de abliteration y como se degradan al cuantizar, usando la variante BF16 como referencia.
- Red-teaming y evaluacion de seguridad: sirve como modelo adversario controlado para probar clasificadores de contenido, filtros de salida y capas de politica propias, tal como hace la pasarela murakumo descrita por el autor (uso restringido tras organismos gobernados).
- Generacion de datos sinteticos a granel: con 65.536 tokens de contexto y alto throughput agregado, es adecuado para producir grandes volumenes de texto o conversaciones en procesos batch offline con vLLM.
- Procesamiento de documentos largos: la ventana de 64 K tokens permite resumir, extraer entidades o responder preguntas sobre documentos extensos sin troceado agresivo, siempre que se reserve VRAM suficiente para la cache KV.
- Atencion al cliente o asistentes conversacionales internos: soporta dialogos multi-turno con contexto largo, aunque requiere una capa de politica propia delante porque el modelo no rechaza peticiones por si mismo.
- Analisis de imagenes con texto asociado (por ejemplo, inspeccion de capturas o documentos escaneados): la torre visual se mantiene en BF16 y podria conservar la capacidad multimodal del modelo base, si bien no hay validacion publicada de este extremo en el checkpoint cuantizado.
- Despliegue en flotas heterogeneas no Blackwell: al no depender de FP8 (Hopper o superior) ni de NVFP4 (Blackwell), es una de las pocas variantes del modelo que se puede servir en GPUs y aceleradores de generacion anterior con 32 GiB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. El autor indica explicitamente que no se evalua la calidad frente al origen BF16 mas alla de una prueba de coherencia. Las unicas mediciones disponibles son de throughput:

| Medicion | Configuracion | Valor |
|---|---|---|
| Throughput agregado | vLLM XPU + XPU graph, Intel Arc Pro B70 32 GiB, checkpoint W4A16 stock | ~1.128 tok/s |
| Throughput agregado | llama.cpp IQ4_XS, misma tarjeta, modelo stock | ~137 tok/s |

Nota: ambas cifras corresponden al checkpoint stock (quant-mind/Nex-N2.5-mini-W4A16-AutoRound), no a esta variante Uncensored, segun el ADR-2609181615 del repositorio com-junkawasaki/root.

## Requisitos de hardware

- Tamano del repositorio: 20,7 GB en safetensors.
- Hardware de referencia del autor: Intel Arc Pro B70 con 32 GiB, dentro de la flota murakumo. La motivacion explicita es funcionar en una tarjeta de 32 GiB no Blackwell.
- GPUs descartadas por el autor para las alternativas del modelo base: FP8 exige Hopper o superior; NVFP4 exige Blackwell. Esta variante W4A16 evita ambas restricciones.
- Encaje en GPU de consumo: no confirmado. No hay datos publicados sobre RTX 4090 (24 GiB) ni RTX 5090 (32 GiB) con este checkpoint; el autor solo valida la Arc Pro B70 de 32 GiB.
- Opciones de despliegue confirmadas: vLLM (kernels Marlin y XPU) y SGLang, en formato auto_gptq. No es cargable por llama.cpp, que usaria las publicaciones GGUF del modelo base.
- Comando de referencia del autor: vllm serve com-kotobalabs/Nex-N2.5-mini-Uncensored-W4A16-AutoRound --reasoning-parser qwen3 --max-model-len 65536 --gpu-memory-utilization 0.90
- VRAM necesaria para cache KV: no disponible; depende de la longitud de contexto efectiva y del numero de secuencias concurrentes.
- Latencia por peticion: no disponible. Solo se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros / formato | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| com-kotobalabs/Nex-N2.5-mini-Uncensored-W4A16-AutoRound | W4A16 INT4, auto_gptq, repo 20,7 GB | 65.536 tokens en la config de ejemplo | ~1.128 tok/s agregados en Arc Pro B70 (dato del checkpoint stock) | apache-2.0 | vLLM (Marlin/XPU) y SGLang |
| quant-mind/Nex-N2.5-mini-W4A16-AutoRound | Misma receta W4A16, pesos stock en lugar de abliterated | no disponible | ~1.128 tok/s agregados en Arc Pro B70 | no disponible en la informacion | vLLM y SGLang |
| orcarouter/Nex-N2.5-mini-Uncensored (BF16) | BF16, 65 GiB | no disponible | no disponible | apache-2.0 | Requiere hardware de gama alta |
| orcarouter/Nex-N2.5-mini-Uncensored (FP8 / NVFP4) | 34 GiB / 22 GiB | no disponible | no disponible | apache-2.0 | Solo Hopper o superior / solo Blackwell |
| nex-agi/Nex-N2.5-mini | Modelo original antes de la abliteration | no disponible | no disponible | apache-2.0 | Varias publicaciones comunitarias |

No se dispone de comparativas con modelos de otras familias (Llama, Mistral, DeepSeek) en la informacion proporcionada.

## Limitaciones y advertencias

- Derivada abliterated y uncensored: no rechaza peticiones. El propio autor recomienda desplegarla detras de una capa de politica propia; en murakumo solo se ejecuta tras organismos gobernados.
- Discrepancia de parametros sin resolver: los safetensors declaran 6,03 B de parametros, mientras la model card describe el modelo base como Qwen3.5-MoE 35B-A3B. Conviene verificar el config.json y el reparto real de shards antes de dimensionar hardware.
- La calidad frente al origen BF16 no esta evaluada mas alla de una prueba de coherencia segun el autor; el perfil de error es el que AutoRound publica para esta receta.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- Compatibilidad restringida: formato auto_gptq, por lo que no funciona con llama.cpp, Ollama ni TGI salvo conversion previa.
- Necesita --reasoning-parser qwen3 en vLLM; sin el, el razonamiento se filtra al campo content y rompe integraciones que esperan texto limpio.
- Idiomas soportados no documentados, lo que impide garantizar cobertura multilingue en produccion.
- Licencia Apache-2.0 segun el modelo base (nex-agi/Nex-N2.5-mini, relicenciado por orcarouter), pero la cadena de derivaciones conviene revisarla para uso comercial.
- Sesgos conocidos: no documentados en la informacion disponible; el modo sin rechazos amplifica el riesgo de generar contenido danino si no se filtra externamente.
- Riesgo de alucinacion: no cuantificado por el autor; aplica el riesgo habitual de un modelo de ~3 B activos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/com-kotobalabs/Nex-N2.5-mini-Uncensored-W4A16-AutoRound
- Modelo base: https://huggingface.co/orcarouter/Nex-N2.5-mini-Uncensored
- Checkpoint W4A16 stock con la misma receta: https://huggingface.co/quant-mind/Nex-N2.5-mini-W4A16-AutoRound
- Modelo original: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Dataset de calibracion: https://huggingface.co/datasets/NeelNanda/pile-10k
- Repositorio con el job de cuantizacion: kotoba-lang/murakumo (ruta tools/modal-quant/nex_n25_mini_uncensored_w4a16.py)
- ADR de referencia sobre rendimiento en Intel Arc Pro B70: com-junkawasaki/root, ADR-2609181615
- Resultados de busqueda web: no se ha encontrado informacion adicional relevante; las consultas han devuelto unicamente paginas genericas sobre el dominio .com, sin relacion con el modelo.
