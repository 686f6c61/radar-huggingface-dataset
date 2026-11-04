# cgg507/Behemoth-R1-123B-v2-QTIP-2bit

## Resumen

Behemoth-R1-123B-v2-QTIP-2bit es una cuantizacion extrema a 2 bits del modelo TheDrummer/Behemoth-R1-123B-v2, un fine-tune de Mistral-Large-Instruct-2411. El modelo original tiene 123.000 millones de parametros y una arquitectura transformer densa de 88 capas con hidden size 12288 y atencion GQA con 96 cabezas de query y 8 de key/value. Esta version comprime los pesos hasta unos 32 GB en disco mediante la tecnica QTIP (Quantization with Trellis-coded Quantization, paper arXiv:2406.11235), lo que permite ejecutar un modelo de 123B en dos GPU AMD Radeon AI PRO R9700 de 32 GB cada una.

El autor, cgg507, no se limita a publicar los pesos: tambien mantiene en el repositorio c000507/Behemoth-qtip una reimplementacion en C++/HIP del pipeline QTIP para ROCm (objetivo gfx1201), junto con `behemoth_server`, un servidor compatible con la API de OpenAI que incorpora kernels de decodificacion trellis QTIP y paralelismo tensorial entre dos GPU. La relevancia de esta ficha es doble: por un lado demuestra que es viable servir un modelo de 123B en hardware consumer/prosumer AMD con solo 64 GB de VRAM agregada; por otro, el formato es propietario y no carga con `transformers` estandar, lo que limita mucho su adopcion fuera del stack del autor.

La licencia es la Mistral AI Research License (MRL-0.1), heredada del modelo base, restringida a investigacion y uso no comercial. El modelo esta pensado para generacion de texto conversacional, con un enfasis claro en chat y roleplay con chain-of-thought, segun la composicion del dataset de calibracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-Large-Instruct-2411), 88 capas, hidden 12288, GQA 96/8 |
| Parametros totales | 123B (modelo base); pesos cuantizados a 2 bits en proyecciones q/o/gate/up/down |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita; el autor reporta mediciones a 16k tokens y el modelo base Mistral-Large soporta 128k |
| Tipos de cuantizacion | QTIP 2-bit HYB (trellis bitshift L=16, K=2, V=2, LUT de 2^9 entradas, tiles 16x16) en q/o/gate/up/down; FP8 e4m3 con escala por canal en k/v; bf16 en embeddings, LM head y normas |
| Idiomas soportados | No disponible |
| Licencia | Mistral AI Research License (MRL-0.1): solo investigacion y uso no comercial |
| Formato de pesos | Layout llama "hfized" propietario con tensores `trellis`, `SU`, `SV`, `tlut`, `rcp`, `tp_rank`; `quip_params` en `config.json`; no cargable con `transformers` estandar |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-Large-Instruct-2411: un transformer denso de 88 capas, hidden size 12288 y atencion con grouped-query attention de 96 cabezas de query frente a 8 de key/value. Sobre esa base, TheDrummer aplico un fine-tune (Behemoth-R1-123B-v2) orientado a conversacion con razonamiento inline. La capa de cuantizacion es lo distintivo de esta publicacion: QTIP emplea cuantizacion trellis-coded con un codebook estructurado (trellis bitshift de longitud L=16, K=2, V=2) y una LUT simetrica de 2^9 entradas, aplicada sobre tiles de 16x16. Las proyecciones k/v se mantienen en FP8 e4m3 con escala por canal, heredadas del modelo fuente FP8, mientras que embeddings, LM head y normas permanecen en bf16.

El proceso de calibracion uso 4,19 millones de tokens: 512 secuencias de 8192 tokens, con un 75% de conversaciones de chat y roleplay con chain-of-thought en la plantilla del propio modelo y un 25% de texto general (OpenWebText y SmolTalk). Las matrices de Hessian se recolectaron capa por capa a partir del modelo FP8 original, agrupando q, o, gate+up y down por separado. Se aplica incoherence processing con vectores de signo aleatorios y transformadas de Hadamard en ambos lados, redondeo block LDLQ en bloques de 16 con Viterbi tail-biting, sigma_reg de 1e-2 y un override de escala de 0,9. No se documenta en la informacion disponible si hubo RLHF o DPO adicionales sobre el fine-tune.

## Capacidades

- Generacion de texto conversacional multi-turno en formato Mistral `[INST]`, con soporte de system prompt.
- Razonamiento con chain-of-thought inline, segun la composicion del dataset de calibracion (75% de conversaciones con CoT).
- Escritura creativa y roleplay, area en la que el fine-tune de TheDrummer esta claramente orientado.
- Generacion de codigo y matematicas: heredadas del modelo base Mistral-Large, aunque no hay evaluacion publicada de esta cuantizacion.
- Capacidades multilingues: presumiblemente heredadas de Mistral-Large, pero no documentadas para esta version.
- Tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente.
- Capacidades de vision o audio: no disponibles (modelo solo texto).

## Casos de uso

- Investigacion en cuantizacion extrema: este modelo es un banco de pruebas para estudiar el impacto de QTIP a 2 bits sobre un modelo de 123B, comparando calidad frente al original FP8 en tareas controladas.
- Despliegue en laboratorio con hardware AMD: permite servir un 123B en dos Radeon AI PRO R9700 (64 GB agregados) usando `behemoth_server`, algo inviable con pesos en bf16 o FP8.
- Generacion creativa y roleplay local: el fine-tune esta calibrado sobre conversaciones de chat y roleplay, por lo que es adecuado para prototipos de asistentes narrativos en entornos de investigacion.
- Experimentacion con paralelismo tensorial en ROCm: el servidor del autor implementa TP entre dos GPU, lo que sirve como referencia para desarrolladores que quieran replicar el patron en otros modelos.
- Evaluacion de degradacion por cuantizacion: util para medir perplejidad y calidad de respuesta frente al modelo base y documentar la perdida introducida por 2 bits.
- Prototipado de servidores compatibles con OpenAI en stacks no NVIDIA: `behemoth_server` expone una API compatible que permite integrar el modelo en pipelines existentes sin reescribir el cliente.
- Docencia y demostraciones: permite mostrar en un entorno con hardware AMD de gama prosumer como se ejecuta un modelo de escala 100B+ con tecnicas de compresion agresivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de latencia de decodificacion en 2x Radeon AI PRO R9700: aproximadamente 44 ms/token en contexto corto y 52 ms/token a 16k tokens, en regimen de una sola peticion.

## Requisitos de hardware

- VRAM estimada: unos 32 GB de pesos en disco; en ejecucion con `--memory-fraction 0.9` el autor lo sirve en 2 GPU de 32 GB (64 GB agregados), por lo que se recomienda reservar al menos 2x 32 GB.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201) en configuracion de 2 unidades; es el hardware validado por el autor.
- GPU NVIDIA: no soportado por el runtime actual, que es una implementacion C++/HIP para ROCm.
- Compatibilidad con GPU consumer: no cabe en una sola GPU consumer de 24 GB; requiere dos aceleradores de 32 GB o mas.
- Opciones de despliegue: exclusivamente `behemoth_server` del repositorio c000507/Behemoth-qtip. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos no cargan con `transformers` estandar.
- Latencia y throughput: ~44 ms/token en contexto corto y ~52 ms/token a 16k en 2x R9700 con una sola peticion; el autor no publica throughput agregado con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Behemoth-R1-123B-v2-QTIP-2bit | 123B | No disponible (medido a 16k) | QTIP 2-bit + FP8 k/v | MRL-0.1 (no comercial) | Solo `behemoth_server` en ROCm |
| TheDrummer/Behemoth-R1-123B-v2 (original) | 123B | Heredado de Mistral-Large | bf16 / FP8 | MRL-0.1 | transformers, vLLM, TGI |
| Mistral-Large-Instruct-2411 | 123B | 128k | bf16 / FP8 | MRL-0.1 | transformers, vLLM, TGI |
| Mistral-Small-Instruct-2409 | 22B | 128k | bf16 / GGUF | Apache 2.0 | Amplia (llama.cpp, vLLM, Ollama) |

La comparativa se limita a modelos de la misma familia porque no se dispone de datos de benchmarks de esta cuantizacion que permitan contrastar calidad con alternativas de otros autores.

## Limitaciones y advertencias

- La cuantizacion a 2 bits introduce degradacion de calidad no cuantificada en la informacion disponible; no hay benchmarks publicados que la midan frente al modelo FP8 original.
- El formato de pesos es propietario y no carga con `transformers`, vLLM, llama.cpp ni Ollama; solo funciona con el runtime del autor.
- El runtime esta escrito en C++/HIP y validado unicamente en ROCm gfx1201 (Radeon AI PRO R9700); no hay soporte documentado para NVIDIA ni para otras arquitecturas AMD.
- Licencia MRL-0.1: uso restringido a investigacion y no comercial; cualquier despliegue en produccion comercial esta prohibido sin licencia adicional de Mistral AI.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, agravado potencialmente por la cuantizacion agresiva.
- Sesgos no evaluados: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad para esta version cuantizada.
- Idiomas soportados no documentados; el comportamiento multilingue puede diferir del modelo base.
- El modelo esta calibrado mayoritariamente sobre chat y roleplay (75%), lo que puede sesgar su comportamiento hacia ese dominio y penalizar tareas tecnicas o de codigo.
- El proyecto tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validacion comunitaria.
- La fecha de creacion (2026-11-03) y la ausencia de traccion sugieren que se trata de una publicacion muy reciente o de un experimento personal sin mantenimiento garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cgg507/Behemoth-R1-123B-v2-QTIP-2bit
- Modelo base: https://huggingface.co/TheDrummer/Behemoth-R1-123B-v2
- Repositorio del runtime y cuantizador: https://github.com/c000507/Behemoth-qtip
- Paper QTIP: https://arxiv.org/abs/2406.11235
- Implementacion de referencia QTIP: https://github.com/Cornell-RelaxML/qtip
- Licencia Mistral AI Research License: https://mistral.ai/licenses/MRL-0.1.md
- Documentacion de reconstruccion FP8 mixta: `docs/MIXED_FP8_RECONSTRUCTION.md` dentro del repositorio Behemoth-qtip
