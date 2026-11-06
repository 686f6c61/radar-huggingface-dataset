# cgg507/Llama-Anubis-70B-v1-QTIP-NVFP4-FP8KV

## Resumen

Llama-Anubis-70B-v1-QTIP-NVFP4-FP8KV es un checkpoint cuantizado de forma agresiva del modelo TheDrummer/Anubis-70B-v1, que a su vez es un finetune de Llama 3.3 70B de Meta. Lo publica el usuario cgg507 y su proposito no es otro que comprimir un modelo de 70.000 millones de parametros hasta un tamano manejable en una sola GPU de 80 GB, empleando una mezcla de cuantizacion de 2 bits (QTIP) para los pesos lineales y FP8 para las proyecciones de clave y valor.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion extrema (2 bits) aplicada a un modelo grande, con metricas de perdida de calidad publicadas de forma inusualmente honesta; por otro, advierte de que el resultado es claramente lossy. El autor reporta una perplexity de 4,154 frente a 2,731 del original en bf16 sobre WikiText-103, lo que supone un incremento de NLL de 0,419 nats/token.

El checkpoint no es un formato estandar de transformers: requiere el runtime CUDA propio del autor (Behemoth-qtip) para cargarse. El repositorio ocupa 22,4 GB y el autor indica que cabe en una GPU de clase 80 GB. La licencia heredada es la Llama 3.3 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.3 70B), pesos lineales cuantizados con QTIP 2-bit HYB |
| Parametros totales | 11.845.492.736 (segun safetensors del repo cuantizado; el modelo base es de 70B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el runtime admite `--context` configurable (ejemplos con 4096 y 8192) |
| Tipos de cuantizacion | QTIP 2-bit HYB (trellis L=16, K=2, V=2, tiles 16x16, Hadamard + LDLQ), FP8 E4M3 con escalas por canal de salida en k_proj/v_proj, y NVFP4 como fallback (0 capas usadas); embeddings y lm_head en bf16 |
| Idiomas soportados | no disponible |
| Licencia | llama3.3 (Llama 3.3 Community License) |
| Formato de pesos | safetensors con metadatos QTIP propios (`qtip_quant.layer_formats` en config.json); no compatible con transformers estandar |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.3 70B, un transformer decoder-only denso con atencion por grupos (GQA) y el template de chat de Llama 3 (system/user/assistant). Sobre el, TheDrummer/Anubis-70B-v1 aplica un finetune del que no se detallan datos de entrenamiento en la informacion disponible. Este checkpoint no reentrena el modelo: solo lo cuantiza.

La innovacion tecnica esta en el esquema de cuantizacion. Cada capa lineal se cuantiza con QTIP 2-bit HYB, una tecnica de cuantizacion por trellis con transformada de Hadamard aleatoria y LDLQ usando hessianos calculados sobre un conjunto de calibracion de 2048 x 2048 tokens. Las proyecciones k_proj y v_proj se mantienen en FP8 E4M3 con escalas por canal de salida. El autor aplica un criterio adaptativo: si la KL de siguiente token de una capa (QTIP frente al original, sonda de 2048 tokens) supera 0,01, la capa se recuantiza a NVFP4 con redondeo calibrado por hessiano y busqueda de escalas. En este checkpoint ninguna capa supero el umbral, por lo que las 80 capas quedaron en QTIP y ninguna en NVFP4. Los embeddings y el lm_head permanecen en bf16.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del finetune Anubis sobre Llama 3.3 70B.
- Soporte del template de chat de Llama 3 (system/user/assistant).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Inferencia con contexto configurable mediante el flag `--context` del runtime Behemoth-qtip.

## Casos de uso

- Despliegue de un modelo de 70B en una unica GPU de 80 GB: el checkpoint de 22,4 GB permite ejecutar el modelo con el runtime CUDA de Behemoth-qtip en hardware de una sola tarjeta, algo inviable con el modelo en bf16.
- Experimentacion con cuantizacion extrema: util para investigadores que quieran medir el impacto real de la cuantizacion a 2 bits sobre un modelo de 70B, con metricas de KL y perplexity ya publicadas como referencia.
- Servicio de chat autoalojado: `behemoth_cuda_server` expone el modelo en un puerto con nombre de endpoint, lo que permite montar un servicio de conversacion interno sobre el template de Llama 3.
- Evaluacion de tecnicas QTIP/NVFP4: el repo incluye `adaptive_report.json` y la lista de formatos por capa en `config.json`, lo que facilita reproducir y comparar el criterio adaptativo del autor.
- Generacion de texto por lotes con contexto moderado: el runtime admite `--max-tokens` y `--context`, adecuado para tareas de completado o resumen donde la perdida de calidad de 2 bits sea tolerable.
- Prototipado de pipelines que requieran un 70B local antes de decidir si migrar a una version menos comprimida (por ejemplo, recuantizando mas capas a NVFP4 con un umbral mas bajo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo publica metricas de fidelidad de la cuantizacion frente al original en bf16:

| Metrica | bf16 (original) | Este checkpoint |
|---|---|---|
| Perplexity (WikiText-103, 4 docs de 512 tokens) | 2,731 | 4,154 |
| KL whole-model (nats/token) | referencia | 0,399 +/- 0,125 |
| Cambio en NLL | referencia | 0,419 +/- 0,117 |
| Suma de KL por capa | referencia | 0,0658 |
| Capas QTIP / NVFP4 | n/a | 80 / 0 |

Como referencia interna del autor, en un modelo de prueba de 8B cuantizado con el mismo metodo, el esquema todo-QTIP dio KL de 0,35 y +18 % de perplexity, mientras que recuantizar 24 de 32 capas a NVFP4 lo redujo a 0,07 (+3 % de perplexity) a costa de 1,45x el tamano.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 22,4 GB en disco; con overhead de runtime y cache KV, el autor indica que una GPU de clase 80 GB es suficiente.
- GPU recomendadas: A100 80 GB, H100 80 GB o cualquier tarjeta con 80 GB de memoria. No se confirma compatibilidad con GPUs consumer de 24 GB.
- Cabe en consumer GPU: no disponible en la informacion proporcionada; por tamano de pesos (22,4 GB) no cabria en una RTX 4090 de 24 GB con margen para cache KV y overhead.
- Opciones de despliegue: exclusivamente el runtime CUDA de Behemoth-qtip (`behemoth_cuda` y `behemoth_cuda_server`) del repositorio https://github.com/c000507/Behemoth-qtip. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Llama-Anubis-70B-v1-QTIP-NVFP4-FP8KV (este) | 70B (11,8B en safetensors) | no disponible | QTIP 2-bit + FP8 KV | Llama 3.3 | safetensors + Behemoth-qtip |
| TheDrummer/Anubis-70B-v1 (base) | 70B | no disponible | bf16 | Llama 3.3 | transformers estandar |
| Llama 3.3 70B (Meta) | 70B | 128K (segun ficha oficial de Meta) | bf16 / FP8 | Llama 3.3 | transformers, vLLM, TGI, etc. |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad significativa: perplexity 4,154 frente a 2,731 del original y KL whole-model de 0,399 nats/token. El propio autor califica el checkpoint como "claramente lossy".
- La muestra de evaluacion es pequena (4 documentos de 512 tokens), con error estandar elevado; los numeros deben tomarse con cautela.
- La KL por capa subestima la KL del modelo completo: la suma por capa es 0,0658 frente a 0,399 medido, aproximadamente 6x. No usar la metrica por capa como prediccion de calidad global.
- La capa 79 concentra la mayor KL por capa (0,0081), seguida de la 33 (0,0028); el umbral de recuantizacion a NVFP4 (0,01) no se alcanzo en ninguna capa, por lo que no se aplico la mejora disponible.
- No es un checkpoint estandar de Hugging Face/transformers: requiere el runtime Behemoth-qtip y no funciona con vLLM, llama.cpp, Ollama ni TGI.
- Licencia Llama 3.3 Community License: uso comercial sujeto a la Acceptable Use Policy de Meta; no es una licencia permisiva tipo Apache o MIT.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue mas alla de la del modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; se heredan los del finetune Anubis y Llama 3.3.
- Sin descargas ni likes en el momento de la consulta; no hay validacion comunitaria del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/cgg507/Llama-Anubis-70B-v1-QTIP-NVFP4-FP8KV
- Modelo base: https://huggingface.co/TheDrummer/Anubis-70B-v1
- Runtime CUDA (Behemoth-qtip): https://github.com/c000507/Behemoth-qtip
- Licencia Llama 3.3: https://www.llama.com/llama3_3/license/
- Politica de uso aceptable de Llama 3.3: https://www.llama.com/llama3_3/license/
