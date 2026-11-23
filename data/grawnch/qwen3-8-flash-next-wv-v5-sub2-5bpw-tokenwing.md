# Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing

## Resumen

Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing es una cuantizacion GGUF de muy baja precision (2,46 bits por peso efectivos en los expertos enrutados) del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch. El checkpoint emplea un plugin de cuantizacion propietario llamado TokenWing (`wv-plugin-v1.3`, ABI v2) que debe cargarse en el runtime `runmyai/tokenwing`, un fork de llama.cpp orientado a la transmision (streaming) de expertos MoE desde disco o RAM. El objetivo es hacer viable la inferencia de un modelo de aproximadamente 177.000 millones de parametros en equipos con menos de 12 GB de VRAM.

El modelo base es un transformer hibrido de tipo MoE con 48 capas que combinan mecanismos GDN (probablemente una variante de atencion lineal o gated delta network) y atencion dispersa QSA, con 512 expertos enrutados y top-10 por token. Esta cuantizacion reduce el peso total a unos 66,3 GiB repartidos en dos shards (39,48 GiB y 26,82 GiB), con la tabla PLE de la capa 1 en Q4_0.

La relevancia actual reside en la ingenieria de sistemas: el autor publica mediciones de rendimiento en escenarios de VRAM muy limitada (23-38 tok/s con streaming NVMe y pools de RAM de 6-20 GiB) y en GPU completa (68,35 tok/s en una RTX PRO 6000 Blackwell), ademas de verificaciones de paridad de logits entre CPU y CUDA (coseno de 1,000000) y perplejidad en WikiText-2 y codigo. Es, por tanto, un artefacto para experimentacion de despliegue de MoE masivos en hardware de consumo, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 48 capas con mezcla de capas GDN y atencion dispersa QSA; 512 expertos enrutados, top-10 |
| Parametros totales | 176.943.899.520 (~177B) |
| Parametros activos | no disponible (top-10 de 512 expertos enrutados; el numero exacto de parametros activos no se especifica) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de ejecucion usan `-c 8192` y `-c 32768`) |
| Tipos de cuantizacion | GGUF con plugin TokenWing; 2,46 bpw efectivos en expertos enrutados; tabla PLE de capa 1 en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en 2 shards (39,48 GiB + 26,82 GiB), requiere plugin `libqfn_wv_plugin.so` / `qfn_wv_plugin.dll` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE hibrido de 48 capas que alterna capas GDN (mecanismo de atencion lineal con compuertas, segun la nomenclatura del autor) y capas de atencion dispersa QSA. El trunk enruta cada token hacia 10 de los 512 expertos disponibles. Esta publicacion no entrena el modelo: es una cuantizacion del checkpoint original, por lo que los datos de entrenamiento, el volumen de tokens, la composicion del corpus y las etapas de alineacion (RLHF/DPO) del modelo base no se detallan en la informacion disponible.

La innovacion tecnica esta en el pipeline de cuantizacion y en el runtime. El plugin TokenWing (ABI v2) incrusta perfiles de ordenacion de cache de expertos precalculados directamente en el shard 1, lo que permite al runtime priorizar la carga de expertos segun su frecuencia de uso. El autor verifica la fidelidad con dos metricas: paridad de logits CPU frente a CUDA (coseno de probabilidad de 1,000000 en las 48 capas) y perplejidad en WikiText-2 (3,6113 con c=512, frente a 3,1299 del checkpoint de 3,5 bpw) y en codigo matematico y de sistemas (2,5550 frente a 2,4875). Tambien se documenta una sidecar opcional MTP (multi-token prediction) de 2,39 GiB para decodificacion especulativa con `--spec-type draft-mtp`, con una tasa de aceptacion del 70-85%.

## Capacidades

- Generacion de texto y conversacion multi-turno, con plantilla de chat incrustada (`tokenizer.chat_template`) y token de fin de secuencia `<|im_end|>` (id 248046).
- Razonamiento y generacion de codigo, segun los conjuntos de evaluacion de perplejidad usados por el autor (codigo matematico y de sistemas).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs de inferencia tipo OpenAI en el runtime de destino.
- Decodificacion especulativa mediante sidecar MTP opcional y mediante n-gramas (`--spec-type ngram-mod`).
- Streaming de expertos MoE desde NVMe o desde un pool de RAM configurable, con politicas de cache, prefetch y promocion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio o tool calling: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE de ~177B en estaciones de trabajo con 12 GB de VRAM: el runtime permite mantener el trunk en GPU y transmitir los expertos desde un pool de RAM de 20 GiB, alcanzando 37-38 tok/s de decodificacion, suficiente para asistentes interactivos locales.
- Prototipado en portatiles con GPU de consumo y 16 GB de RAM: con un pool restringido de 6 GiB se obtienen 27-29 tok/s, lo que hace viable probar el modelo sin infraestructura de centro de datos.
- Servicio de inferencia en un servidor con GPU profesional (RTX PRO 6000 Blackwell): con `-ngl 99` y todo el modelo en VRAM se logran 68,35 tok/s de decodificacion y 116,11 tok/s de prefill, adecuado para un endpoint interno de generacion de codigo.
- Evaluacion comparativa de tecnicas de cuantizacion extrema: el checkpoint incluye perplejidad y divergencia KL frente a la variante de 3,5 bpw, lo que lo convierte en referencia para estudiar el impacto de bajar a 2,46 bpw en tareas de codigo y texto general.
- Investigacion sobre decodificacion especulativa en MoE: la sidecar MTP y el modo n-gram permiten medir tasas de aceptacion y ganancias de throughput en hardware limitado.
- Pipelines de generacion de codigo en CI/CD: la compatibilidad con endpoints y el soporte de contexto de 32K en configuracion de VRAM completa permiten integrarlo como servicio de autocompletado o revision en entornos con GPU dedicada.
- Analisis de documentos largos en local: con 32K de contexto y el modelo completamente en VRAM, se pueden procesar informes o bases de codigo extensas sin salir del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad y throughput:

| Metrica | Valor |
|---|---|
| Perplejidad WikiText-2 (c=512) | 3,6113 (3,1299 en la variante de 3,5 bpw) |
| Perplejidad codigo matematico y de sistemas (c=512) | 2,5550 (2,4875 en la variante de 3,5 bpw) |
| KLD mediana / media (WikiText-2) | 0,07073 / 0,40344 |
| KLD mediana / media (codigo) | 0,01165 / 0,16549 |
| Coseno de paridad de logits CPU vs CUDA | 1,000000 |
| Decodificacion, streaming NVMe, <12 GB VRAM + 6 GiB RAM | 23,10 tok/s (tecnico) / 22,79 tok/s (codigo) |
| Decodificacion, plugin + PR #9, <12 GB VRAM + 20 GiB RAM, `-t 10` | 37,34-37,75 tok/s (pico movil 38,04) |
| Prefill, mismo escenario | 39,8-62,9 tok/s |
| Decodificacion, pool de RAM de 6 GiB, `-t 8` | 27,62-28,75 tok/s |
| Decodificacion, GPU completa RTX PRO 6000 Blackwell (`llama-completion`, 256 tok) | 68,35 tok/s |
| `llama-bench tg128` / `pp512` en GPU completa | 56,58 tok/s / 116,11 tok/s |
| Lecturas NVMe por token (streaming) | 129,89 MiB/tok (91,92% de aciertos de cache) |
| Aceptacion de la sidecar MTP | 70-85% |

## Requisitos de hardware

- VRAM: menos de 12 GB son suficientes gracias al streaming de expertos; con GPU completa se necesita espacio para los ~66,3 GiB del checkpoint (o su parte en VRAM segun `-ngl`).
- RAM: configuraciones probadas con 6 GiB, 16 GiB y 20 GiB de pool; el escenario recomendado para portatil usa 20 GiB de pool de RAM mas 12 GB de VRAM.
- Almacenamiento: los dos shards suman 66,3 GiB; el streaming desde NVMe requiere una unidad rapida (se miden 129,89 MiB/tok de lectura).
- GPU recomendadas: RTX PRO 6000 Blackwell para ejecucion completa en VRAM; cualquier GPU con menos de 12 GB de VRAM funciona en modo streaming.
- GPU de consumo: si, con el modo de streaming de expertos (`--moe-stream model`), no con el modelo completo en VRAM.
- Despliegue: exclusivamente mediante `runmyai/tokenwing` (fork de llama.cpp) con el plugin `wv-plugin-v1.3`; los binarios estandar de llama.cpp, Ollama, vLLM o TGI no soportan este formato sin el plugin.
- Latencia y throughput: ver tabla de benchmarks; el prefill en modo streaming es el cuello de botella (39,8-62,9 tok/s) frente a la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing | ~177B (MoE, top-10 de 512) | no disponible | 2,46 bpw, plugin TokenWing | Apache 2.0 | GGUF en HF, requiere runtime tokenwing |
| Qwen3.8-Flash-Next-WV-v5-3.5bpw (misma familia) | ~177B (MoE) | no disponible | 3,5 bpw | Apache 2.0 | GGUF; referencia de calidad usada por el autor |
| Qwen/Qwen3.8-Flash-Next (modelo base) | ~177B (MoE) | no disponible | pesos originales | Apache 2.0 | safetensors en HF |

No se dispone de datos de benchmarks estandar para establecer una comparacion de rendimiento con alternativas de otros desarrolladores; la comparacion disponible se limita a las variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- La cuantizacion a 2,46 bpw degrada la calidad respecto al checkpoint de 3,5 bpw: la perplejidad en WikiText-2 sube de 3,1299 a 3,6113 y la divergencia KL media alcanza 0,40344 en texto general.
- El formato requiere un plugin binario de terceros (`libqfn_wv_plugin.so` / `qfn_wv_plugin.dll`) distribuido fuera de Hugging Face; no es compatible con llama.cpp estandar ni con otros runtimes.
- Dependencia de una version concreta del runtime (`dev >= 6a3e018f`) y de flags experimentales de streaming; la estabilidad en produccion no esta garantizada.
- El rendimiento depende criticamente de la velocidad del almacenamiento NVMe y del tamano del pool de RAM; con pools pequenos el throughput cae a 23 tok/s.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingue equivalente al del modelo base.
- Aunque la licencia es Apache 2.0, el uso comercial esta condicionado por la dependencia del plugin y del runtime de terceros, cuyas licencias no se detallan.
- El modelo base es un artefacto de la familia Qwen; conviene verificar las condiciones de uso del modelo original antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-TokenWing
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime TokenWing: https://github.com/runmyai/tokenwing
- Pull request #9 del runtime: https://github.com/runmyai/tokenwing/pull/9
- Binarios del plugin (release wv-plugin-v1.3): https://github.com/grawnchtoader/tokenwing-assets/releases/tag/wv-plugin-v1.3
- Sidecar MTP y assets: https://huggingface.co/Grawnch/TokenWing-Model-Assets
