# esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF es una familia de seis ficheros GGUF publicada por el usuario esatapedico a partir del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, un ajuste fino (fine-tune) sin censura sobre una base Qwen3.8 de 27B. El modelo base es un transformer denso hibrido que combina Gated DeltaNet con Gated Attention cada cuarta capa, con 262.144 tokens de contexto nativo, torre de vision integrada y una cabeza MTP (multi-token prediction) para decodificacion especulativa. El trabajo de esatapedico se limita a la conversion numerica: transformar el checkpoint NVFP4 original a GGUF y construir una escalera de precision para las cabezas (lm_head, token_embd y MTP), manteniendo un backbone NVFP4 de 448 tensores byte a byte identico en las seis variantes.

La relevancia de esta publicacion es practica: ofrece el modelo en formatos de 14,86 GB a 19,69 GB, lo que permite ejecutarlo en GPUs de consumo con cuantizacion de 4 bits en pesos (W4A16 con escalas FP8 E4M3 y tamano de grupo 16) y decodificacion especulativa MTP integrada en cada fichero, sin necesidad de un drafter separado. El repositorio acumula 3.011 descargas y 14 likes desde su creacion en septiembre de 2026, con dos revisiones que corrigieron la plantilla de chat para tool calling y multimodalidad.

El modelo esta pensado para inferencia local en hardware Blackwell (sm_120), con llama.cpp como runtime de referencia, y se distribuye bajo licencia Apache 2.0. La orientacion "uncensored" del tune upstream implica que las salvaguardas de alineamiento son reducidas, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido: Gated DeltaNet + Gated Attention cada cuarta capa, con torre de vision y cabeza MTP |
| Parametros totales | 27.320.698.112 (27,32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (`qwen35.context_length`) |
| Tipos de cuantizacion | NVFP4 (W4A16, escalas FP8 E4M3, grupo 16) en backbone; cabezas en Q2_K, Q3_K, IQ4_XS, Q5_0, Q6_K, Q8_0 o BF16 segun tier |
| Idiomas soportados | Ingles y multilingue (segun tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (6 ficheros); existe tambien un repo safetensors con compressed-tensors NVFP4 |
| Tensores por fichero | 1.122 (448 en NVFP4 nativo, compartidos byte a byte entre tiers) |
| Capas (`block_count`) | 65 (64 capas + blk.64 correspondiente a la cabeza MTP, 15 tensores) |
| Capas de prediccion MTP | 1 (`nextn_predict_layers`) |
| Tamano del repo | 333,8 GB (incluye los seis ficheros y artefactos asociados) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso hibrido de 27,32B parametros que intercala capas de atencion lineal Gated DeltaNet con capas de Gated Attention cada cuarta capa, un patron habitual en la familia Qwen3.5/3.8 para reducir el coste de atencion en contextos largos manteniendo calidad. Incluye una torre de vision nativa (el modelo es multimodal, con procesamiento de imagenes y video) y una cabeza MTP de una capa (blk.64) que permite decodificacion especulativa integrada en el propio fichero: no se necesita un modelo drafter externo, basta con `--spec-type draft-mtp` en llama.cpp. El contexto nativo declarado es de 262.144 tokens.

El tune upstream (DavidAU) aplica "Fable", "Cold Fusion" y "Heretic/Uncensored" sobre la base Qwen3.8-27B, con el objetivo declarado de reducir drasticamente los tokens de razonamiento (thinking) manteniendo la calidad. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. La conversion a GGUF de esatapedico preserva el backbone NVFP4 original (448 tensores byte a byte identicos en los seis tiers) y solo varia la precision de lm_head, token_embd y la cabeza MTP. Las capas lineales son NVFP4; en el origen de cuantizacion, la torre de vision, la ruta de atencion lineal, lm_head, embeddings y la cabeza MTP se mantuvieron en BF16.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento con modo thinking, con la particularidad de que el tune upstream reduce el numero de tokens de pensamiento a calidad comparable.
- Procesamiento multimodal: imagenes y video mediante la torre de vision nativa y el proyector de vision de Qwen3.8 (la plantilla corregida el 2026-09-15 renderiza tokens de vision en lugar de fallar).
- Tool calling / function calling: soportado, con la recomendacion upstream de usar modo razonamiento y temperatura 0,6-0,7; el modo instruct para tool calling rinde peor segun el autor.
- Decodificacion especulativa MTP integrada en todos los ficheros, sin drafter separado.
- Capacidades multilingues (tags `en` y `multilingual`; no se detalla la lista completa de idiomas).
- Ejecutable en llama.cpp y compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistente conversacional local de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener conversaciones o procesar documentos extensos (manuales, expedientes, bases de codigo) sin truncar, ejecutandose en una sola GPU de consumo con el tier LOW o MEDIUM.
- Analisis de documentos con imagenes: la torre de vision permite extraer informacion de capturas, diagramas o fotogramas de video en un flujo local, util para inspeccion de documentos escaneados o revision de interfaces.
- Generacion de codigo en pipelines locales: el soporte de tool calling en modo razonamiento permite integrarlo en agentes que invocan herramientas (ejecucion de tests, consultas a APIs) con llama.cpp como backend.
- Prototipado de agentes multi-paso: la cabeza MTP acelera la decodificacion en bucles de agente donde se generan muchas llamadas cortas, y el contexto largo evita perder el historial de herramientas.
- Investigacion sobre alineamiento y censura: al ser un tune "uncensored" con licencia Apache 2.0, sirve como objeto de estudio de comportamientos sin salvaguardas y de tecnicas de reduccion de tokens de razonamiento.
- Despliegue en estaciones Blackwell: al estar optimizado para sm_120 y NVFP4, encaja en equipos con RTX 50xx o GPUs Blackwell para inferencia de 27B en 16-24 GB de VRAM.
- Evaluacion de tecnicas de cuantizacion: la escalera de seis tiers con backbone identico permite medir el impacto aislado de la precision de lm_head, embeddings y MTP sobre calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 14,86 GB (tier VERY-LOW) y 19,69 GB (tier VERY-HIGH) para los pesos, mas KV cache y buffers. El autor indica que VERY-HIGH necesita unos 18 GiB de VRAM mas KV, por lo que tarjetas de 16 GB caeran en offload a CPU.
- GPU recomendadas: GPUs Blackwell (sm_120) por el soporte nativo de NVFP4; el autor trabaja en hardware de consumo. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- GPU de consumo: los tiers LOW (15,53 GB) y MEDIUM (16,38 GB) estan cerca del limite de 16 GB; MID-HIGH (16,91 GB) y superiores requieren 24 GB para evitar offload.
- Opciones de despliegue: llama.cpp (runtime de referencia, con `--spec-type draft-mtp` para decodificacion especulativa); el tag `endpoints_compatible` sugiere compatibilidad con endpoints, aunque no se detallan servidores concretos (vLLM, TGI, Ollama).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF (este) | 27,32B denso | 262.144 | GGUF NVFP4, 6 tiers de 14,86 a 19,69 GB | Apache 2.0 | MTP integrado, vision, tune uncensored |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (base) | 27,32B denso | 262.144 | safetensors / otros | Apache 2.0 | Modelo upstream sin la conversion GGUF |
| esatapedico/...-NVFP4 (safetensors) | 27,32B denso | 262.144 | compressed-tensors NVFP4 | Apache 2.0 | Checkpoint origen de la conversion GGUF |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de otros autores en la informacion proporcionada, por lo que no es posible una comparativa de rendimiento con terceros.

## Limitaciones y advertencias

- Modelo "uncensored": las salvaguardas de alineamiento estan reducidas por diseno; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a los modelos de 27B, agravado por la cuantizacion de 4 bits en el backbone y por cabezas en Q2_K/Q3_K en los tiers mas bajos.
- Tool calling en modo instruct rinde peor que en modo razonamiento segun el autor; requiere temperatura 0,6-0,7 y una plantilla de chat actualizada (las revisiones de septiembre de 2026 corrigen bugs de tool calls y de renderizado multimodal).
- El tier VERY-HIGH no cabe en GPUs de 16 GB sin offload a CPU, lo que degrada fuertemente la latencia.
- La lista completa de idiomas soportados no esta detallada; el tag principal es `en` y el multilingue no se especifica.
- El repositorio ocupa 333,8 GB, aunque cada fichero individual es de 14,86-19,69 GB.
- No hay benchmarks publicados que permitan validar la calidad de cada tier frente al modelo original.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo sin censura recae en el desplegador.

## Enlaces

- Repositorio GGUF: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4-GGUF
- Repositorio safetensors NVFP4: https://huggingface.co/esatapedico/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NVFP4
- Modelo base upstream: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Sitio del autor de la conversion: https://www.esatapedico.com
