# dgibbons/Artemis-31B-v1.2-NVFP4A16

## Resumen

Artemis-31B-v1.2-NVFP4A16 es una conversion de precision del modelo TheDrummer/Artemis-31B-v1.2, un fine-tune orientado a roleplay y escritura creativa construido sobre Gemma 4 31B de Google. El autor de esta conversion es el usuario de Hugging Face dgibbons, y su aportacion no es un reentrenamiento sino exclusivamente un cambio de formato numerico: los pesos del modelo original se cuantizan a NVFP4 (FP4 con tamano de grupo 16) manteniendo las activaciones en BF16, lo que se conoce como esquema weight-only.

La relevancia de esta ficha esta en que se trata de un artefacto de despliegue, no de un modelo nuevo. El objetivo declarado es servir el fine-tune en vLLM sobre hardware NVIDIA Blackwell (incluida la DGX Spark con GB10) reduciendo el peso en disco a unos 20 GB repartidos en dos shards de safetensors. Segun la model card, solo se cuantizan las 410 capas `Linear` del modelo de lenguaje; `lm_head`, embeddings y las torres de vision y audio permanecen en BF16, y el chat template, tokenizer y processor config se copian sin cambios del repositorio fuente.

Un dato que conviene senalar de entrada: aunque el nombre comercial del modelo habla de 31B, el recuento real de parametros de los safetensors de este repositorio es de 18.460.143.562. Es una discrepancia entre nombre y contenido que el autor no explica en la model card y que el usuario debe tener en cuenta al planificar el hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Gemma 4) con torres de vision y audio, y soporte de decodificacion especulativa MTP |
| Parametros totales | 18.460.143.562 segun los safetensors del repositorio (el nombre del modelo indica 31B; discrepancia no aclarada por el autor) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens (128K) segun el comando de despliegue facilitado por el autor |
| Tipos de cuantizacion | NVFP4A16 weight-only: pesos FP4 con grupo de 16, activaciones en BF16, sin datos de calibracion |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha de Hugging Face; el autor remite a los terminos del modelo fuente (TheDrummer/Artemis-31B-v1.2) y de Gemma 4 |
| Formato de pesos | safetensors (dos shards, esquema compressed-tensors), ~20,5 GB de repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es TheDrummer/Artemis-31B-v1.2, un fine-tune de Gemma 4 31B desarrollado por TheDrummer. La model card de esta conversion no detalla la composicion del dataset ni el proceso de entrenamiento del fine-tune original: no hay numero de tokens, ni composicion del corpus, ni confirmacion de si se aplico RLHF, DPO u otra tecnica de alineamiento. Lo unico documentado es el proposito del modelo base, orientado a roleplay y conversacion, con capacidades de "thinking" dentro de escenarios de rol segun las descripciones publicas del modelo fuente.

La innovacion tecnica de esta version concreta es puramente de cuantizacion. Se aplico el esquema `NVFP4A16` de LLM Compressor sobre las 410 capas `Linear` del modelo de lenguaje: los pesos pasan a FP4 con grupo de 16, mientras que las activaciones se mantienen en BF16. El autor justifica explicitamente esta eleccion frente a la alternativa W4A4 (que tambien cuantiza activaciones) porque en vLLM 0.30.0 esa variante insertaba tokens espurios en medio de palabras en respuestas largas de roleplay ("de deciding", "deambles"), con o sin decodificacion especulativa. Con esta build weight-only, y usando MTP activado, temperatura 0,94 y sin top-k ni top-p, el autor no reprodujo el problema en cuatro respuestas de unas 450 tokens. La decodificacion especulativa se configura con el drafter MTP de Google para Gemma 4 (`google/gemma-4-31B-it-assistant`) y `num_speculative_tokens: 4`. Herramientas declaradas: llmcompressor 0.14.0, transformers 5.17.0, torch 2.13.0 (cu130).

## Capacidades

- Generacion de texto y escritura creativa, con enfasis declarado del modelo base en fluidez narrativa, storytelling e interaccion de personajes.
- Roleplay conversacional multi-turno, incluyendo razonamiento interno ("thinking") dentro de la propia escena de rol segun la descripcion publica del modelo fuente.
- Contexto largo: la ventana declarada de 131.072 tokens permite mantener escenas, guiones o historiales de conversacion extensos sin truncar.
- Modalidad de vision: la torre de vision se conserva en BF16, por lo que la capacidad multimodal del modelo base no se degrada por la cuantizacion. La model card no documenta el pipeline ni los formatos de entrada admitidos.
- Modalidad de audio: la torre de audio tambien se conserva en BF16, con la misma advertencia anterior sobre falta de documentacion.
- Decodificacion especulativa mediante drafter MTP compatible (`google/gemma-4-31B-it-assistant`), lo que permite reducir latencia en generacion autoregresiva.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso fuera del roleplay: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base pertenece a la familia Gemma, pero la ficha de esta conversion no lista idiomas).

## Casos de uso

- Roleplay y personajes conversacionales persistentes: el modelo hereda el fine-tune de TheDrummer para interaccion de personajes, y los 131.072 tokens de contexto permiten arrastrar fichas de personaje, trasfondo y cientos de turnos previos sin perder coherencia argumental.
- Atencion al cliente con historial largo: con 128K de contexto se pueden inyectar manuales de producto, historial de tickets y politicas internas en la misma ventana, manteniendo conversaciones multi-turno sin fragmentar el contexto en recuperacion externa.
- Escritura asistida de narrativa y guiones: el ajuste del modelo base prioriza fluidez de escritura y dinamismo narrativo, por lo que encaja en herramientas de redaccion creativa donde se necesita continuidad de estilo sobre documentos largos.
- Motores de narrativa interactiva para videojuegos: el modelo puede generar respuestas de PNJ en tiempo real, y la combinacion de contexto largo y decodificacion especulativa MTP ayuda a mantener latencias bajas en bucles de dialogo.
- Analisis de documentos con componente visual: dado que la torre de vision permanece en BF16, es plausible usar el modelo para tareas que combinen texto e imagen (por ejemplo, resumir material ilustrado o comentar capturas), aunque el autor no documenta un pipeline de entrada multimodal verificado.
- Despliegue local en estaciones Blackwell: el caso de uso explicito que motiva la conversion es ejecutar el fine-tune en vLLM sobre DGX Spark / GB10 y GPUs RTX de generacion Blackwell, con un peso en disco de unos 20 GB que cabe en memoria unificada o en VRAM de gama alta.
- Modulo de generacion en pipelines de inferencia con vLLM: al estar empaquetado con `compressed-tensors`, se integra directamente en un servidor vLLM existente sin recompilar kernels, lo que simplifica sustituir el modelo base en BF16 por esta version cuantizada.
- Prototipado de asistentes conversacionales de nicho: para equipos que necesitan un comportamiento de escritura menos "alineado" y mas imaginativo, el modelo base esta explicitamente optimizado para entretenimiento y creatividad en lugar de resolucion estricta de problemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar, y el unico dato de evaluacion reportado es cualitativo: ausencia de insercion de tokens espurios en cuatro respuestas de aproximadamente 450 tokens con MTP activado, temperatura 0,94 y sin top-k ni top-p, comparado con la build W4A4 alternativa.

## Requisitos de hardware

- Espacio en disco: aproximadamente 20,5 GB para los dos shards de safetensors.
- VRAM para los pesos: en torno a 20 GB solo para pesos, mas el espacio de activaciones y la cache KV. Con 128K de contexto la cache KV domina el consumo y exige margen adicional considerable.
- GPU compatibles: el esquema NVFP4 requiere hardware NVIDIA Blackwell con soporte nativo de FP4. El autor menciona explicitamente DGX Spark / GB10; por generacion son aplicables B100, B200, GB200 y las RTX serie 50.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB) para contextos moderados. En RTX 5080 (16 GB) y modelos inferiores no cabe por el tamano de pesos. En tarjetas Ampere o Ada (A100, H100, RTX 4090) el formato NVFP4 no es nativo y no es el objetivo declarado de esta build.
- Opciones de despliegue: vLLM (probado con la version 0.30.0), invocado como `vllm serve dgibbons/Artemis-31B-v1.2-NVFP4A16 --max-model-len 131072`. Para llama.cpp/Ollama habria que usar las conversiones GGUF del modelo base (por ejemplo, FaustianDeal/Artemis-31B-v1.2-NVFP4-GGUF o BeaverAI/Artemis-31B-v1j-GGUF), no este repositorio.
- Configuracion de decodificacion especulativa: `--speculative-config '{"method":"mtp","model":"google/gemma-4-31B-it-assistant","num_speculative_tokens":4}'`. Limitacion practica documentada por el autor: vLLM rechaza `min_p` cuando la decodificacion especulativa esta activa; deben usarse `top_k` o `top_p` en su lugar.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dgibbons/Artemis-31B-v1.2-NVFP4A16 | 18.460.143.562 segun safetensors | 131.072 tokens | safetensors, NVFP4A16 weight-only, compressed-tensors | no disponible (remite a Gemma 4) | 0 descargas, 0 likes en el momento de la consulta |
| TheDrummer/Artemis-31B-v1.2 (base) | no disponible (nombre comercial 31B) | no disponible | safetensors en BF16 | no disponible (terminos de Gemma 4) | modelo fuente, disponible tambien como API en Featherless |
| FaustianDeal/Artemis-31B-v1.2-NVFP4-GGUF | no disponible | no disponible | GGUF con pesos NVFP4 calibrados y reempaquetados | no disponible | conversion de formato y precision del mismo fine-tune |
| BeaverAI/Artemis-31B-v1j-GGUF | no disponible | no disponible | GGUF | no disponible | version v1-j en GGUF, con soporte en llama-cpp-python, Colab y Kaggle |
| Artemis 31b V1 (GGUF, local-ai-zone) | no disponible | no disponible | GGUF, 34,6 GB | no disponible | 38.221 descargas, 27 likes segun el indice |

La diferencia funcional clave entre las opciones GGUF y esta build es el backend: los GGUF estan pensados para llama.cpp/Ollama sobre hardware variado, mientras que el NVFP4A16 de safetensors esta disenado especificamente para vLLM sobre Blackwell. La variante GGUF de FaustianDeal aplica NVFP4 con calibracion de activaciones, mientras que esta build es weight-only con activaciones BF16.

## Limitaciones y advertencias

- Discrepancia de parametros: el nombre del repositorio indica 31B pero los safetensors declaran 18.460.143.562 parametros. Conviene verificar el modelo antes de dimensionar infraestructura en funcion del nombre.
- Licencia no declarada: la ficha de Hugging Face no especifica licencia. El autor remite a los terminos del modelo fuente y de Gemma 4, por lo que el uso comercial queda condicionado al cumplimiento de la licencia de Gemma. Verificar antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no hay datos de evaluacion de factualidad. El modelo base esta optimizado para creatividad y entretenimiento, no para precision factual, lo que incrementa el riesgo en tareas de recuperacion de hechos.
- Sesgos: no se han publicado analisis de sesgos en la informacion disponible.
- Idiomas: la ficha no lista idiomas soportados. No asumir cobertura multilingue sin verificacion empirica.
- Dependencia de hardware: NVFP4 requiere GPU NVIDIA Blackwell. No es portable a A100, H100 o RTX 4090 sin recurrir a otras conversiones del modelo base.
- Solo cuantiza el modelo de lenguaje: las torres de vision y audio permanecen en BF16, de modo que el ahorro de memoria no se aplica a esas partes y el consumo total puede ser superior a lo que sugiere el peso de los shards.
- Estado temprano del artefacto: creado y actualizado el mismo dia (1 de octubre de 2026), con 0 descargas y 0 likes en el momento de la consulta. No ha pasado por validacion de la comunidad.
- Restriccion de muestreo en vLLM: con decodificacion especulativa activa no se puede usar `min_p`.
- Sin datos de rendimiento: no hay mediciones publicas de latencia, throughput ni calidad frente a la version en BF16, por lo que no se puede cuantificar la perdida de calidad introducida por la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dgibbons/Artemis-31B-v1.2-NVFP4A16
- Modelo base: https://huggingface.co/TheDrummer/Artemis-31B-v1.2
- Pagina del modelo base en Featherless: https://featherless.ai/models/TheDrummer/Artemis-31B-v1.2
- Version v1 en Featherless: https://featherless.ai/models/TheDrummer/Artemis-31B-v1
- Conversion GGUF NVFP4 del mismo fine-tune: https://huggingface.co/FaustianDeal/Artemis-31B-v1.2-NVFP4-GGUF
- Conversion GGUF comunitaria (v1-j): https://huggingface.co/BeaverAI/Artemis-31B-v1j-GGUF
- Indice GGUF Artemis 31b V1: https://local-ai-zone.github.io/models/artemis-31b-v1.html
