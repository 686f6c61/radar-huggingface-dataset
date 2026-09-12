# Atomic-Germ/Ornith-1.5-35B-A3B-REAP-50-GGUF

## Resumen

Ornith-1.5-35B-A3B-REAP-50-GGUF es una cuantización en formato GGUF del modelo Ornith-1.5-35B-A3B tras aplicar una poda de expertos REAP del 50 % (de 256 a 128 expertos), la eliminación de la cabeza MTP (multi-token prediction) y la retirada de la torre de visión. El resultado es un modelo MoE híbrido con arquitectura Gated-DeltaNet + Mixture-of-Experts, etiquetado internamente como `qwen3.5`/`qwen35moe`, con aproximadamente 18,54 mil millones de parámetros totales (dato de safetensors) y unos 3 mil millones de parámetros activos por token. El autor del pipeline de poda y cuantización es Ttimms, mientras que el repositorio de esta publicación GGUF pertenece a Atomic-Germ.

El problema que resuelve es doble: por un lado, reducir el coste de despliegue de un modelo MoE de ~35B nominales hasta un rango que quepa en GPUs de consumo de 16 GB; por otro, ofrecer una vía de inferencia en llama.cpp para una arquitectura híbrida que aún no está soportada por todas las herramientas. El autor afirma que es probablemente el primer GGUF publicado de un modelo podado con REAP al 50 %, lo que lo convierte en una referencia temprana para quienes quieren experimentar con poda de expertos sin reentrenar.

Su relevancia actual es la combinación de licencia MIT, pesos abiertos y un tamaño de fichero (desde 11,4 GB en Q4_K_M) que permite ejecución local en hardware de gama alta de consumo, manteniendo un rendimiento de código notable medido antes de la cuantización GGUF: HumanEval+ 84,2 %, MBPP+ 89,2 % y SWE-bench Verified 44,0 %. No se dispone de información sobre la longitud de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated-DeltaNet + MoE, familia `qwen3_5_moe` / `qwen35moe` en llama.cpp (según model card) |
| Parametros totales | 18.543.997.568 (~18,5 B) según safetensors; el nombre "35B" proviene del modelo base sin podar |
| Parametros activos | ~3 B por token (MoE), según el autor |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q6_K, Q8_0. En repos hermanos: bf16 y GPTQ-NVFP4A16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (heredada de Ornith-1.5-35B-A3B) |
| Formato de pesos | GGUF; bf16 y NVFP4A16 disponibles en repos separados |

## Arquitectura y entrenamiento

La model card describe el modelo base Ornith-1.5-35B-A3B como un híbrido Gated-DeltaNet + MoE con 256 expertos, cabeza MTP, ~65 GB en bf16 y licencia MIT. Sobre ese modelo se aplicó una secuencia de transformaciones: poda REAP al 50 % de los expertos (256 → 128), eliminación verificada de la cabeza MTP (1 → 0), retirada de la torre de visión (333 tensores) y cuantización GPTQ-NVFP4A16 con una duración aproximada de 5,5 horas, produciendo un fichero de 12,47 GiB. Todo el proceso se realizó en una RTX 5070 Ti (SM120). La variante GGUF de este repositorio se obtiene convirtiendo la fuente bf16 podada con `convert_hf_to_gguf.py --no-mtp`.

La innovación técnica destacable es el uso de REAP (de CerebrasResearch) con una corrección de renormalización del router, que permite eliminar la mitad de los expertos preservando la calidad. Sin embargo, no se ha publicado en la información disponible ningún detalle sobre el dataset de entrenamiento del modelo base, el número de tokens, la composición de los datos ni si hubo fases de RLHF o DPO. Tampoco se documenta el mecanismo exacto de atención híbrida más allá de la etiqueta Gated-DeltaNet.

## Capacidades

- Generación de texto y conversación multi-turno en inglés (`text-generation`, `conversational`).
- Generación y razonamiento sobre código: HumanEval+ 84,2 % y MBPP+ 89,2 % medidos sobre la variante NVFP4A16 previa a la conversión GGUF.
- Resolución de tareas de ingeniería de software de tipo agéntico: SWE-bench Verified 44,0 % (misma medición, muestras greedy individuales).
- Modo de razonamiento ("thinking") activado por defecto en la plantilla de chat; se puede desactivar pasando `"chat_template_kwargs": {"enable_thinking": false}` para obtener salidas más ancladas al contexto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y multi-step reasoning: no documentado, aunque el resultado en SWE-bench Verified indica cierta capacidad para tareas de varios pasos.
- Capacidades multilingües: limitadas a inglés según el campo `language` del repositorio.
- Capacidades de visión: eliminadas en esta variante (se retiraron 333 tensores de la torre de visión).
- Predicción multi-token (MTP): eliminada en esta variante.

## Casos de uso

- Asistente de código en local: con Q4_K_M (11,4 GB) el modelo cabe en una GPU de 16 GB y permite autocompletado, refactorización y explicación de código sin enviar el código a servicios externos. Es adecuado por su licencia MIT y su rendimiento medido en HumanEval+ y MBPP+.
- Agente de resolución de incidencias en repositorios: el 44,0 % en SWE-bench Verified indica que puede abordar tareas de parcheo sobre código real dentro de un pipeline que orqueste lectura de ficheros, ejecución de tests y aplicación de diffs.
- Generación asistida en pipelines de CI/CD: integrable mediante `llama-server` con una API compatible con OpenAI (`endpoints_compatible`), lo que permite invocarlo desde scripts de revisión de pull requests o generación de tests.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: al tener ~3 B de parámetros activos, la inferencia en CPU o Apple Silicon es rápida para el tamaño total del modelo, según indica el propio autor.
- Prototipado e investigación sobre poda de expertos: sirve como caso de estudio reproducible de REAP al 50 % sobre un MoE, con el pipeline documentado en GitHub.
- Chat conversacional en inglés con modo de razonamiento controlable: útil para asistentes técnicos donde se quiera alternar entre respuestas razonadas y respuestas directas desactivando `enable_thinking`.
- Evaluación comparativa de cuantizaciones: al publicarse cuatro niveles GGUF (Q4_K_M, Q5_K_M, Q6_K, Q8_0), permite medir la degradación de calidad frente al bf16 podado en tareas propias.

## Benchmarks y rendimiento

Los datos publicados corresponden a la variante NVFP4A16, es decir, **antes** de la conversión a GGUF, y provienen de muestras greedy individuales.

| Benchmark | Resultado | Notas |
|---|---|---|
| HumanEval+ | 84,2 % | Medido sobre NVFP4A16, no sobre GGUF |
| MBPP+ | 89,2 % | Medido sobre NVFP4A16, no sobre GGUF |
| SWE-bench Verified | 44,0 % | Medido sobre NVFP4A16, no sobre GGUF |

No se han publicado resultados de benchmarks específicos para los ficheros GGUF de este repositorio. El autor advierte que existe variabilidad entre ejecuciones y remite a la tarjeta NVFP4A16 para más detalle.

## Requisitos de hardware

- VRAM estimada (tamaño de fichero, sin contar caché KV ni overhead): Q4_K_M 11,4 GB; Q5_K_M 13,3 GB; Q6_K 15,3 GB; Q8_0 19,7 GB.
- El autor recomienda Q4_K_M porque "cabe en 16 GB con margen para el contexto".
- Q5_K_M deja un presupuesto de contexto más ajustado; Q6_K apenas tiene margen en 16 GB; Q8_0 requiere más de 16 GB o descarga parcial a CPU (`offload`).
- GPU de consumo compatibles con 16 GB de VRAM: RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080/4080 Super, RTX 4090, RTX 5070 Ti. No hay datos oficiales para A100, H100 u otras GPU de centro de datos.
- CPU y Apple Silicon: el autor indica que la inferencia es rápida para el tamaño del modelo gracias a los ~3 B de parámetros activos.
- Entorno de construcción verificado: RTX 5070 Ti, arquitectura SM120.
- Opciones de despliegue: llama.cpp (`llama-server -m <fichero>.gguf -ngl 99 --port 8080`), LM Studio, koboldcpp, Jan y text-generation-webui. Ollama queda pendiente de que su llama.cpp embebido incorpore la arquitectura `qwen35moe`.
- Para la variante NVFP4A16 se indica vLLM como motor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de terceros comparables en la información proporcionada. La comparación posible se limita a las variantes hermanas del mismo linaje.

| Modelo | Parametros | Expertos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este repositorio (REAP-50 GGUF) | ~18,5 B totales, ~3 B activos | 128 | no disponible | GGUF (11,4-19,7 GB) | MIT | Sin MTP, sin torre de visión |
| Ornith-1.5-35B-A3B (base) | no disponible (~65 GB en bf16) | 256 | no disponible | safetensors bf16 | MIT | Con cabeza MTP y torre de visión |
| Ornith-1.5-35B-A3B-REAP-50-bf16 | ~18,5 B | 128 | no disponible | bf16 | MIT | Fuente podada, sin MTP ni visión |
| Ornith-1.5-35B-A3B-REAP-50-NVFP4A16 | ~18,5 B | 128 | no disponible | NVFP4A16 (12,47 GiB) | MIT | Flagship para vLLM; benchmarks medidos aquí |

No se conocen modelos de terceros con los que comparar de forma rigurosa a partir de la información disponible.

## Limitaciones y advertencias

- La poda REAP al 50 % elimina 128 de 256 expertos; puede degradar la calidad en dominios poco representados. El autor no publica una comparación sistemática contra el modelo base sin podar.
- Los benchmarks publicados (HumanEval+, MBPP+, SWE-bench Verified) se midieron sobre la variante NVFP4A16, no sobre los GGUF, por lo que no garantizan el mismo rendimiento en Q4_K_M o Q5_K_M.
- Se trata de muestras greedy individuales; el propio autor advierte de variabilidad entre ejecuciones.
- Modelo únicamente en inglés según el campo `language`; no hay evidencia de soporte multilingüe.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación ni evaluaciones de veracidad.
- Sesgos conocidos: no disponible.
- Sin torre de visión ni cabeza MTP: no admite entrada de imágenes ni decodificación multi-token especulativa.
- Requiere una versión reciente de llama.cpp con soporte de la arquitectura híbrida `qwen35moe`; Ollama no está soportado todavía.
- El modo de razonamiento está activado por defecto en la plantilla de chat; para producción con salidas ancladas es necesario desactivarlo explícitamente.
- La licencia es MIT, lo que permite uso comercial, pero el autor remite al fichero LICENSE del modelo base; conviene verificar condiciones heredadas antes de un despliegue comercial.
- Repositorio recién creado (12 de septiembre de 2026) con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.
- Discrepancia de autoría: el repositorio pertenece a Atomic-Germ, pero la model card atribuye la cuantización a Ttimms y los enlaces de descarga apuntan al espacio de Ttimms. Conviene verificar la cadena de custodia de los pesos.
- El tamaño del repositorio es de 59,6 GB porque contiene las cuatro cuantizaciones; debe descargarse un único fichero, no el repositorio completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/Ornith-1.5-35B-A3B-REAP-50-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Variante flagship NVFP4A16: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-NVFP4A16
- Fuente bf16 podada: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-bf16
- Pipeline y benchmarks: https://github.com/t-timms/ornith-nvfp4
- REAP (CerebrasResearch, poda de expertos): https://github.com/CerebrasResearch/reap
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- koboldcpp: https://github.com/LostRuins/koboldcpp
- Jan: https://jan.ai/
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- Enlaces relevantes encontrados en la búsqueda web: no disponible (los resultados devueltos no guardan relación con el modelo).
