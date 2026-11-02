# ethanwtodd/Qwen3.6-35B-A3B-Q4_K-Q8_0-GGUF

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token (designacion A3B), combina capas de atencion clasica con capas DeltaNet y componentes de tipo SSM, una arquitectura hibrida orientada a eficiencia en decodificacion. El modelo base se distribuye bajo licencia Apache 2.0.

Esta ficha documenta una cuantizacion GGUF concreta publicada por el usuario ethanwtodd: una mezcla de precisiones que asigna Q4_K a los expertos enrutados y Q8_0 al resto de matrices densas, con la cabeza de salida en Q6_K. El objetivo es preservar la fidelidad de las matrices densas (que se leen en cada token) mientras se comprime el 92% de los pesos que corresponde a los expertos, de los que solo se activan 8 de 256 por capa en cada paso de decodificacion. El resultado ocupa 20,67 GB y esta pensado para servir el modelo en hardware de gama consumer, en concreto una Intel Arc A770M mediante el motor eklow.

La relevancia de esta publicacion es doble: por un lado, demuestra una estrategia de cuantizacion mixta guiada por el patron de acceso a los pesos en arquitecturas MoE; por otro, incluye mediciones de divergencia KL frente al Q8_0 de referencia, lo que permite evaluar objetivamente la perdida de fidelidad respecto a otras cuantizaciones de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (transformer con capas DeltaNet, atencion y componentes SSM; tipo GGUF `qwen35moe`) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3.000 millones por token (designacion A3B; 8 de 256 expertos por capa) |
| Longitud de contexto | No disponible en la informacion proporcionada (se han validado mediciones a 4.096 y 32.768 tokens) |
| Tipos de cuantizacion | Mezcla: Q4_K en expertos enrutados, Q8_0 en proyecciones densas, Q6_K en cabeza de salida, F32 en normas y parametros SSM |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (20,67 GB; sha256 `48cf98f4648a499080a9975348db7dc4106e7420d478117f8178f5103e4a7c6b`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE hibrida que combina capas de atencion con capas DeltaNet y componentes de espacio de estados (SSM), segun se deduce de los nombres de tensores presentes en la cuantizacion (`ssm_alpha`, `ssm_beta`, `ssm_a`, `ssm_dt`, `ssm_conv1d`, proyecciones DeltaNet). Cada capa MoE dispone de 256 expertos enrutados, de los que se activan 8 por token, ademas de expertos compartidos. Esta configuracion reduce el coste computacional por token a pesar del elevado numero de parametros totales. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion documentada se genero con llama.cpp en el commit `ea0c4c2c85fb183ec0fbd30a1af4e4275a18a064`: primero una conversion a GGUF bf16 con `--no-mtp` (excluyendo el bloque MTP/NextN) y despues `llama-quantize` con la importance matrix de bartowski (`bartowski/Qwen_Qwen3.6-35B-A3B-GGUF` en la revision `5c2410d715`). La estrategia asigna Q4_K a los 120 tensores de expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`), Q8_0 al resto de matrices (proyecciones DeltaNet y de atencion, expertos compartidos, `attn_k`/`attn_v`, `ssm_alpha`/`ssm_beta`, `token_embd`), Q6_K a la cabeza de salida y F32 a normas, parametros SSM, router y puerta del experto compartido. El razonamiento es que los expertos representan el 92% de los pesos pero solo se leen 8 de 256 por capa y token, mientras que las matrices densas se recorren en su totalidad en cada token.

La model card reporta fidelidad medida como divergencia KL de la distribucion del siguiente token frente al Q8_0 del propio modelo, usando `llama-perplexity --kl-divergence` sobre wikitext-2 test a 4.096 tokens de contexto (20 fragmentos) y un documento largo a 32.768 (2 fragmentos).

## Capacidades

- Generacion de texto conversacional y continuacion de texto (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a instrucciones, heredado del modelo base Qwen3.6-35B-A3B.
- Capacidad de decodificacion especulativa: el draft DFlash 2 (`incoai/Qwen3.6-35B-A3B-DFlash2`) acepta 5,24 / 4,98 / 4,53 tokens por verificacion en GSM8K / HumanEval / MT-Bench con este fichero en llama.cpp (bloque 8, temperatura 1).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en GPU consumer: con 20,67 GB, el fichero esta dimensionado para ejecutarse en una unica GPU de 24 GB o en un acelerador como la Intel Arc A770M mediante el motor eklow, que trata los expertos Q4_K a la misma velocidad que los Q4_0.
- Despliegue con llama.cpp: al ser un GGUF estandar de tipo `qwen35moe`, se carga directamente en llama.cpp sin conversiones adicionales, lo que simplifica pipelines de inferencia locales y en servidores sin stack CUDA.
- Decodificacion especulativa en produccion: combinado con el draft DFlash 2, permite verificar varios tokens por paso y aumentar el throughput en tareas de generacion abierta, codigo y matematicas, segun las tasas de aceptacion medidas.
- Evaluacion de calidad de cuantizaciones: las metricas de divergencia KL publicadas permiten comparar esta mezcla con Q4_K_M, Q4_K_S, IQ4_XS y Q4_0 de bartowski antes de elegir una variante para un despliegue concreto.
- Prototipado de asistentes conversacionales: el modelo base esta orientado a generacion de texto conversacional, por lo que sirve para construir chat multi-turno en local sin depender de APIs externas.
- Experimentacion con arquitecturas hibridas MoE/SSM: al mantener en Q8_0 las proyecciones DeltaNet y los parametros SSM, el fichero es adecuado para estudiar el comportamiento de estos componentes con perdida de fidelidad minima en las partes sensibles.
- Investigacion sobre cuantizacion guiada por patron de acceso: sirve como referencia reproducible (comando y sha256 documentados) para replicar la estrategia de bits diferenciales entre expertos y matrices densas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta metricas de fidelidad de la cuantizacion frente al Q8_0 del modelo base:

| Fichero | Tamano | KL media, 4k / 32k | KL percentil 99, 4k / 32k | Mismo token top-1, 4k / 32k |
|---|---|---|---|---|
| Esta cuantizacion | 20,7 GB | 0,0134 / 0,0346 | 0,138 / 0,398 | 95,6% / 95,5% |
| bartowski Q4_K_M | 22,3 GB | 0,0168 / 0,0498 | 0,170 / 0,693 | 94,9% / 94,7% |
| bartowski Q4_K_S | 21,5 GB | 0,0198 / 0,0554 | 0,198 / 0,712 | 94,6% / 94,2% |
| bartowski IQ4_XS | 19,7 GB | 0,0229 / 0,0616 | 0,229 / 0,862 | 93,9% / 94,0% |
| bartowski Q4_0 | 20,8 GB | 0,0313 / 0,0752 | 0,299 / 1,211 | 92,9% / 93,0% |

Las mediciones se realizaron con llama.cpp `ea0c4c2c`, wikitext-2 test a 4.096 tokens (20 fragmentos) y un documento largo a 32.768 tokens (2 fragmentos). Ademas, la model card reporta tasas de aceptacion de decodificacion especulativa con el draft DFlash 2 de 5,24 tokens por verificacion en GSM8K, 4,98 en HumanEval y 4,53 en MT-Bench (bloque 8, temperatura 1).

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 20,67 GB, por lo que requiere al menos 21-22 GB de memoria disponible contando cache KV y buffers de contexto; con contexto de 32.768 tokens la demanda de cache KV adicional no esta cuantificada en la informacion disponible.
- GPU recomendadas: el autor desarrollo el fichero para una Intel Arc A770M (16 GB de VRAM fisica, por lo que el caso de uso real depende del motor eklow y de la gestion de memoria fuera de VRAM); en el ecosistema NVIDIA, una RTX 4090 (24 GB) o superiores (A100 40/80 GB, H100) permiten cargar el modelo completo en VRAM.
- Cabe en GPU consumer de 24 GB (RTX 3090, RTX 4090); en GPUs de 16 GB o menos sera necesario descargar capas a RAM del sistema o usar una cuantizacion de menor tamano.
- Opciones de despliegue: llama.cpp (soporte nativo del tipo `qwen35moe`), el motor eklow del autor para Intel Arc, y cualquier runtime compatible con GGUF; la compatibilidad explicita con vLLM, TGI u Ollama no se detalla en la informacion disponible.
- Latencia y throughput: no disponibles de forma absoluta; la model card solo aporta las tasas de aceptacion de decodificacion especulativa (5,24 / 4,98 / 4,53 tokens por verificacion en GSM8K / HumanEval / MT-Bench).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Esta cuantizacion (Qwen3.6-35B-A3B Q4_K/Q8_0) | 34,66 B (MoE, ~3 B activos) | No disponible | GGUF, 20,7 GB | Apache 2.0 | KL media 0,0134 a 4k; mejor fidelidad de la tabla |
| bartowski Q4_K_M | 34,66 B (MoE, ~3 B activos) | No disponible | GGUF, 22,3 GB | Apache 2.0 | KL media 0,0168 a 4k |
| bartowski Q4_K_S | 34,66 B (MoE, ~3 B activos) | No disponible | GGUF, 21,5 GB | Apache 2.0 | KL media 0,0198 a 4k |
| bartowski IQ4_XS | 34,66 B (MoE, ~3 B activos) | No disponible | GGUF, 19,7 GB | Apache 2.0 | Menor tamano, KL media 0,0229 a 4k |
| bartowski Q4_0 | 34,66 B (MoE, ~3 B activos) | No disponible | GGUF, 20,8 GB | Apache 2.0 | KL media 0,0313 a 4k |

No se dispone de datos de comparacion con modelos de otros desarrolladores (por ejemplo, alternativas MoE de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de fidelidad: la divergencia KL crece de 0,0134 a 4.096 tokens hasta 0,0346 a 32.768 tokens, y el percentil 99 pasa de 0,138 a 0,398, lo que indica mayor desviacion en la cola de la distribucion con contextos largos.
- El bloque MTP/NextN se excluye deliberadamente (`--no-mtp`), por lo que las capacidades asociadas a ese bloque en el modelo original no estan disponibles en este fichero.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es un riesgo inherente a los modelos generativos de este tipo.
- Idiomas soportados: no disponible; no se puede confirmar el rendimiento multilingue de esta cuantizacion.
- Longitud de contexto oficial: no disponible; las mediciones se realizaron a 4.096 y 32.768 tokens, pero no se confirma cual es el maximo soportado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.6-35B-A3B y de la importance matrix utilizada (bartowski) antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente de las metricas reportadas.
- El caso de uso declarado (Intel Arc A770M con eklow) es especifico del autor; el rendimiento en otras GPUs o runtimes no esta documentado.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/ethanwtodd/Qwen3.6-35B-A3B-Q4_K-Q8_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Importance matrix y cuantizaciones de referencia: https://huggingface.co/bartowski/Qwen_Qwen3.6-35B-A3B-GGUF
- Draft para decodificacion especulativa: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Motor de inferencia eklow: https://github.com/ewtodd/eklow
