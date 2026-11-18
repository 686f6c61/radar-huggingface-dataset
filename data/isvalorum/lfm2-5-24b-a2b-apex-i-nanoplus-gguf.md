# IsValorum/LFM2.5-24B-A2B-APEX-I-NanoPlus-GGUF

## Resumen

LFM2.5-24B-A2B APEX-I NanoPlus GGUF es una cuantizacion de terceros del modelo LiquidAI/LFM2.5-24B-A2B, un transformer de tipo mezcla de expertos (MoE) desarrollado por Liquid AI. El modelo original cuenta con 23.971.587.712 parametros totales de los cuales solo unos 2B se activan por token, lo que permite una inferencia muy rapida en dispositivos de borde manteniendo una calidad propia de un modelo de 24B. Esta version concreta la publica el usuario IsValorum bajo el perfil de cuantizaciones APEX-I-NanoPlus, con pesos en formato GGUF listos para llama.cpp.

La arquitectura combina 40 capas: 30 de ellas son convoluciones 1D cortas con estado constante O(1) y 10 son capas de atencion completa intercaladas cada 4 bloques, lo que da coherencia hasta 128.000 tokens de contexto con un coste de cache muy reducido. El modelo esta pensado para razonamiento, tool calling y uso agentico en entornos con memoria limitada, y soporta 16 idiomas, entre ellos el castellano.

La relevancia de esta ficha esta en que ofrece el modelo de 24B en un unico archivo GGUF de 8,15 GB (7,59 GiB en memoria), lo que lo hace desplegable en GPUs de consumo y en equipos de borde. La cuantizacion se ha calibrado con una importance matrix generada a partir de conversaciones reales de tool calling, y el resultado conserva los 428 tensores del modelo base con una mezcla de precisiones que va de F32 a IQ2_XXS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 30 capas de convolucion 1D corta + 10 capas de atencion completa (cada 4 bloques) |
| Parametros totales | 23.971.587.712 (23,97B) |
| Parametros activos | ~2B por token |
| Longitud de contexto | 128.000 tokens (contexto nativo) |
| Tipos de cuantizacion | GGUF APEX-I-NanoPlus (mezcla: F32, Q4_K, IQ3_XXS, IQ2_S, IQ2_XXS, Q6_K, Q3_K) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other" en el repo) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo | 8,15 GB (7,59 GiB en memoria) |
| Tensores auditados | 428 |
| Modelo base | LiquidAI/LFM2.5-24B-A2B |
| Cuantizador | IsValorum |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 24B parametros totales y unos 2B activos por token. La innovacion principal es la columna vertebral de convoluciones 1D cortas: 30 de las 40 capas usan convoluciones con cache de estado constante O(1), lo que elimina el crecimiento lineal de la KV cache y reduce el time-to-first-token. Las 10 capas de atencion completa se distribuyen una cada cuatro bloques para retener coherencia de largo alcance hasta 128.000 tokens. Esta combinacion hibrida es la que permite que el modelo corra hasta 1,7 veces mas rapido en dispositivos de borde que alternativas densas o dispersas de mayor tamano.

No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, de la composicion del dataset ni de si se aplicaron tecnicas de RLHF o DPO. La model card del cuantizador solo referencia los benchmarks oficiales de Liquid AI y las cifras de velocidad en borde. La cuantizacion APEX-I-NanoPlus se calibro con una importance matrix (imatrix.gguf) generada por el usuario m9ter1a a partir de conversaciones autenticas de tool calling renderizadas con la plantilla de chat nativa del modelo, lo que orienta la asignacion de precision hacia las capas mas sensibles a ese tipo de tarea.

El mapa de precision auditado reparte los 428 tensores asi: 207 en F32 (48,36%) para routers, normas, biases y kernels de convolucion; 97 en Q4_K (22,66%) para el FFN denso de entrada, atencion q/k/v, shortconv y embeddings; 42 en IQ3_XXS (9,81%) para expertos de borde y expertos centrales down; 34 en IQ2_S (7,94%) para expertos centrales gate; 34 en IQ2_XXS (7,94%) para expertos centrales up; 10 en Q6_K (2,34%) para las cabezas de salida de atencion; y 4 en Q3_K (0,93%) para expertos de borde down.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto nativo de 128.000 tokens.
- Razonamiento explicito y modo de pensamiento (tag `reasoning` en el repo).
- Tool calling y function calling nativo, con resultados destacados en LiveClaw y BFCL v4 segun Liquid AI.
- Uso agentico y razonamiento multi-paso para pipelines autonomos.
- Capacidades de codigo y matematicas, evaluadas en los benchmarks oficiales del modelo base.
- Soporte multilingue en 16 idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues, italiano, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Inferencia de baja latencia gracias a la columna de convoluciones 1D con cache O(1).
- Compatible con endpoints de llama.cpp.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a sus 128.000 tokens de ventana, y la cache O(1) de las capas convolucionales mantiene baja la latencia incluso con historiales extensos.
- Agentes autonomos con tool calling: su rendimiento en BFCL v4 y LiveClaw lo hace adecuado para orquestar llamadas a APIs, consultas a bases de datos y flujos multi-paso en produccion.
- Asistente de codigo en local: con 2B parametros activos y un archivo de 8,15 GB, puede ejecutarse en una GPU de consumo para autocompletado, revision de parches y generacion de tests dentro de un IDE.
- Razonamiento sobre documentos largos: informes, contratos o expedientes de hasta 128K tokens pueden procesarse en una sola pasada sin chunking, aprovechando las capas de atencion completa intercaladas.
- Despliegue en dispositivos de borde: su huella de 7,59 GiB y la velocidad de inferencia reportada por Liquid AI (hasta 1,7x mas rapido que alternativas) permiten ejecutarlo en estaciones de trabajo, mini-PC y portatiles con GPU.
- Traduccion y asistencia multilingue: al cubrir 16 idiomas, incluido el espanol, sirve para traduccion tecnica, localizacion de documentacion y soporte en varios idiomas desde un unico modelo.
- Procesamiento por lotes en servidor: con llama.cpp y el formato GGUF puede servirse en CPU o GPU mixtas para tareas de clasificacion, extraccion de entidades y resumen a gran escala donde el coste por token importa.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los que cita la model card del cuantizador, atribuidos a los benchmarks oficiales de Liquid AI. No se incluyen cifras completas de MMLU, HumanEval o GSM8K en el material proporcionado.

| Benchmark | LFM2.5-24B-A2B | Referencia citada |
|---|---|---|
| LiveClaw | 48,09 | 38,19 (Qwen3.6-35B-A3B) |
| BFCL v4 | state-of-the-art (sin cifra) | no disponible |
| Velocidad en borde | hasta 1,7x mas rapido | frente a alternativas densas y dispersas de mayor tamano |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 7,59 GiB solo para pesos en esta cuantizacion NanoPlus; hay que sumar la KV cache y los buffers de contexto, que con 128K tokens puede anadir varios GiB segun la configuracion.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM para contexto moderado; 16-24 GB para aprovechar ventanas largas. Ejemplos: RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, A100, H100.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) para contextos moderados.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y servidores compatibles con GGUF; el repo esta marcado como `endpoints_compatible`.
- Latencia y throughput: no se proporcionan cifras concretas de tokens por segundo para esta cuantizacion; la model card solo indica que el modelo base corre hasta 1,7x mas rapido en borde que alternativas comparables.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|
| LFM2.5-24B-A2B APEX-I-NanoPlus (esta ficha) | 23,97B / ~2B | 128K | lfm1.0 | GGUF 8,15 GB |
| LFM2.5-24B-A2B APEX-I-MiniPlus V2.1 | 23,97B / ~2B | 128K | lfm1.0 | GGUF 9,64 GB |
| LFM2.5-24B-A2B BF16 (Liquid AI) | 23,97B / ~2B | 128K | lfm1.0 | safetensors 47,96 GB |
| Qwen3.6-35B-A3B | 35B / 3B (segun referencia de la model card) | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo modelo base y a la referencia Qwen3.6-35B-A3B citada en los benchmarks. No se dispone de datos suficientes para comparar con otras familias de modelos en parametros, contexto y licencia.

## Limitaciones y advertencias

- La licencia lfm1.0 es una licencia propia de Liquid AI marcada como "other"; es imprescindible revisar sus terminos antes de cualquier uso comercial.
- Al ser una cuantizacion agresiva (IQ2_XXS e IQ2_S en los expertos centrales), puede haber una perdida de calidad respecto al BF16 original, especialmente en tareas de razonamiento complejo y matematicas.
- Los expertos centrales se almacenan a 2 bits; el cuantizador no publica una evaluacion de perplejidad ni de benchmarks de esta edicion concreta, por lo que el impacto real no esta cuantificado en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en contextos muy largos y en idiomas con menos representacion en el entrenamiento.
- El rendimiento en espanol y en el resto de idiomas distintos del ingles no esta desglosado en los benchmarks disponibles.
- La cuantizacion es de terceros y no esta respaldada oficialmente por Liquid AI; los problemas de calidad deben reportarse al cuantizador.
- El uso de contexto de 128K incrementa la memoria necesaria por encima de los 7,59 GiB de los pesos, lo que puede impedir su ejecucion en GPUs de 8 GB.
- La fecha de creacion del repositorio (2026-10-13) y la referencia a Qwen3.6-35B-A3B indican que parte de los datos de la model card pueden corresponder a versiones futuras o no verificables; conviene contrastar las cifras con la model card oficial de Liquid AI.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/IsValorum/LFM2.5-24B-A2B-APEX-I-NanoPlus-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Edicion APEX-I-MiniPlus V2.1: https://huggingface.co/IsValorum/LFM2.5-24B-A2B-APEX-I-MiniPlus-V2.1-GGUF
- Coleccion APEX-I-MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Coleccion APEX-I-NanoPlus: https://huggingface.co/collections/IsValorum/apex-i-nanoplus-standard-moe-6acfee79c288c5d8e7307785
- Importance matrix de m9ter1a: https://huggingface.co/m9ter1a/LFM2.5-24B-A2B-GGUF
- Apoyo al cuantizador: https://ko-fi.com/isvalorum
