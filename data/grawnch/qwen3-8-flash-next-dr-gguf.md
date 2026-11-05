# Grawnch/Qwen3.8-Flash-Next-DR-GGUF

## Resumen

Qwen3.8-Flash-Next-DR-GGUF es una cuantización GGUF de 2 shards del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch bajo la etiqueta `Grawnch_DR_Q2_0`. Se trata de una arquitectura MoE (mixture of experts) de aproximadamente 180 000 millones de parámetros totales (176 309 417 088 según los pesos en safetensors del modelo base), con un total de 144 expertos enrutados y una arquitectura que el autor etiqueta como `qwen4_exp`. El paquete GGUF ocupa 67,18 GB repartidos en dos ficheros.

El interés principal de esta ficha no está en el modelo base, sino en la estrategia de cuantización: el autor sostiene que, mediante rejillas enteras lineales uniformes (sin tensores de búsqueda `IQ*`), consigue una calidad superior a otras cuantizaciones del mismo rango de tamaño (~66-67 GB) como ISTA `GSQ-RCO Q2_0` o Unsloth `UD-IQ1_S`, con métricas de KLD, Top-1 agreement, perplejidad y similitud coseno de la capa final. Es relevante para quienes necesitan ejecutar un MoE de gran tamaño en hardware de gama alta con llama.cpp y quieren minimizar la degradación de calidad.

La model card está redactada en inglés y no proporciona información sobre el modelo base más allá de su identificador, su licencia `qwen-community-1.0` y su pipeline `image-text-to-text`. No se detallan idiomas soportados, datos de entrenamiento ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta del autor: `qwen4_exp`); incluye capas de atención/GDN y expertos compartidos |
| Parametros totales | 176 309 417 088 (~176,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `Q2_0` (expertos enrutados), `Q8_0` (expertos compartidos y hyper-connections), `Q6_K` (atención/GDN y cabeza de salida), `Q4_0` (embeddings de tokens y tabla PLE) |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (etiquetada como `other`) |
| Formato de pesos | GGUF dividido en 2 shards (`00001-of-00002`, `00002-of-00002`) |

## Arquitectura y entrenamiento

El modelo base es un MoE de ~176,3 B de parámetros con 144 expertos enrutados, expertos compartidos y capas de atención/GDN (gated delta networks, según la nomenclatura empleada en la model card). La cuantización `Grawnch_DR_Q2_0` distribuye los pesos en dos shards: el primero (38,38 GB) contiene los pesos del transformer con 1 223 tensores, y el segundo (28,80 GB) contiene únicamente la tabla N-gram PLE de la capa 1 (`per_layer_token_embd.weight`) cuantizada en `Q4_0`.

La innovación técnica declarada por el autor es el uso de rejillas enteras lineales uniformes en lugar de tablas de búsqueda `IQ*` (0 tensores `IQ*` en ambos shards), lo que según sus mediciones acelera el prefill y el decode en llama.cpp. Además, la tabla PLE del shard 2 puede mantenerse mapeada en memoria sobre SSD (`-lm mmap --lazy-mode on`), de modo que solo el shard 1 necesita residir en VRAM/RAM. No hay información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno (pipeline declarado `image-text-to-text`, lo que sugiere entrada multimodal de imagen y texto, aunque la model card no detalla el componente visual).
- Procesamiento de entrada multimodal imagen-texto según el `pipeline_tag` del repositorio.
- Ejecución en llama.cpp mediante `llama-cli` y `llama-server`, con soporte de split GGUF en dos shards.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un MoE de gran tamaño en estaciones de trabajo con mucha VRAM: gracias al split en dos shards y al mapeo en memoria del shard 2, se puede mantener el shard 1 (38,38 GB) residente en GPU y el shard 2 (28,80 GB) en SSD, reduciendo el requisito de VRAM frente a una carga completa.
- Servicio de inferencia con `llama-server`: el autor reporta un throughput de ~367 tokens/s en prefill y ~94 tokens/s en decode, adecuado para servir conversaciones interactivas en un entorno controlado.
- Generación de código asistida: la model card incluye ejemplos de prompts de código (por ejemplo, una red de ordenación entera sin ramas en C++), y las métricas de KLD y Top-1 se centran en matemáticas y código, lo que indica que el autor priorizó esa capacidad en la cuantización.
- Evaluación comparativa de técnicas de cuantización: útil para investigadores que quieran reproducir las métricas de KLD, perplejidad y similitud coseno frente a BF16 y comparar con ISTA y Unsloth en el mismo rango de tamaño.
- Prototipado de aplicaciones multimodales imagen-texto en local: el pipeline declarado permite experimentar con entrada de imagen y texto sin depender de APIs externas, siempre que se valide el componente visual del modelo base.
- Investigación sobre arquitecturas MoE con expertos compartidos y capas GDN: el modelo permite estudiar el comportamiento de 144 expertos enrutados bajo cuantización agresiva (`Q2_0`) y medir el impacto en la calidad.
- Pruebas de integración en pipelines de CI/CD con llama.cpp: la compatibilidad con `llama-cli` y `llama-server` permite automatizar pruebas de regresión de calidad sobre las dos shards.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de la model card del autor y comparan cuantizaciones del mismo rango de tamaño (~66-67 GB), no benchmarks estándar del modelo base.

| Metrica | Grawnch_DR_Q2_0 (67,18 GB) | ISTA GSQ-RCO Q2_0 (66,40 GB) | Unsloth UD-IQ1_S (66,38 GB) |
|---|---|---|---|
| KLD Math & Code (nats, menor es mejor) | 0,2594 | > 0,7160 | ~0,68-0,78 |
| KLD validación balanceada (nats) | 0,3428 | ~0,7160 | ~0,65-0,75 |
| Top-1 Math & Code | 80,70 % | < 76,60 % | ~74,5-76,0 % |
| Top-1 WT2_2048 | 78,27 % | ~76,60 % | ~75,5-77,0 % |
| Perplejidad externa (BF16 = 11,657) | 11,468 (ΔPPL = -0,190) | ~12,1-12,4 (+0,45 a +0,75) | ~12,3-12,7 (+0,65 a +1,05) |
| Perplejidad Math & Code (BF16 = 5,403) | 6,172 (ΔPPL = +0,769) | ~6,6-7,0 (+1,2 a +1,6) | ~6,8-7,3 (+1,4 a +1,9) |
| Perplejidad WT2_2048 (BF16 = 2,153) | 3,191 (ΔPPL = +1,038) | ~3,35-3,55 (+1,2 a +1,4) | ~3,50-3,80 (+1,35 a +1,65) |
| CosSim capa final vs BF16 | 0,9138 (Code) / 0,9104 (Ext) | ~0,85-0,87 | ~0,82-0,85 |
| CosSim shard 2 (PLE) | 0,9960 | ~0,995 | ~0,995 |
| Prefill / Decode | ~367 / ~94 t/s | 367,5 / 93,8 t/s | 108,2 / 70,3 t/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el shard 1 ocupa 38,38 GB y el shard 2 28,80 GB. Con `-lm mmap --lazy-mode on`, solo el shard 1 necesita residir en VRAM/RAM; el shard 2 puede quedar mapeado en SSD.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del shard 1, se requiere al menos una GPU con 40-48 GB de VRAM (A100 40/80 GB, H100, A6000 48 GB) o reparto entre varias GPUs.
- ¿Cabe en GPU consumer? No con la carga completa; el shard 1 de 38,38 GB supera la VRAM de una RTX 4090 (24 GB). Sería necesario repartir entre GPUs o usar memoria del sistema.
- Opciones de despliegue: `llama.cpp` (`llama-cli`, `llama-server`), con soporte de split GGUF y `--lazy-mode`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput estimados: ~367 tokens/s en prefill y ~94 tokens/s en decode según el autor, en hardware no especificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño del paquete | Licencia | Calidad relativa (según el autor) |
|---|---|---|---|---|---|
| Grawnch_DR_Q2_0 | ~176,3 B (MoE, 144 expertos enrutados) | no disponible | 67,18 GB | qwen-community-1.0 | Referencia: KLD 0,2594; Top-1 80,70 % |
| ISTA GSQ-RCO Q2_0 | mismo modelo base | no disponible | 66,40 GB | qwen-community-1.0 | KLD > 0,7160; Top-1 < 76,60 % |
| Unsloth UD-IQ1_S (v3.1) | mismo modelo base | no disponible | 66,38 GB | qwen-community-1.0 | KLD ~0,68-0,78; Top-1 ~74,5-76,0 % |

Las tres alternativas son cuantizaciones del mismo modelo base Qwen/Qwen3.8-Flash-Next, por lo que la comparación se limita a la fidelidad de la cuantización y al rendimiento en llama.cpp, no a capacidades del modelo. No se dispone de comparaciones con modelos de otros desarrolladores.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantización.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización `Q2_0` de los expertos enrutados puede incrementar la degradación en tareas fuera de las métricas reportadas.
- La perplejidad en Math & Code y WT2_2048 empeora respecto a BF16 (+0,769 y +1,038 respectivamente), aunque el autor la presenta como mejor que las alternativas.
- El rendimiento en prefill/decode (~367 / ~94 t/s) se reporta sin especificar el hardware utilizado, por lo que no es directamente extrapolable.
- No se detallan los idiomas soportados ni la longitud de contexto; no se puede garantizar un comportamiento multilingüe ni contextos largos.
- La licencia `qwen-community-1.0` es una licencia comunitaria con posibles restricciones para uso comercial; es necesario revisar el enlace a la licencia del modelo base antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 4 de noviembre de 2026; no hay evidencia de validación independiente de las métricas del autor.
- El shard 2 contiene únicamente la tabla PLE de la capa 1; su omisión o un mapeo en memoria incorrecto puede degradar la calidad de forma significativa.
- No hay información sobre tool calling, agentes ni modo thinking, lo que limita su uso en pipelines de agentes sin validación previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-DR-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
