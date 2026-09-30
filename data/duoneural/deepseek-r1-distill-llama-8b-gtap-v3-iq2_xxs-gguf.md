# DuoNeural/DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ2_XXS-GGUF

closure rate 88.0%
- Olympiad Competition Math: 2/10 (20.0%)
- Python Code AST Execution: 1/10 (10.0%)
- Inference decode throughput: 206.8 t/s on RTX 4080 Super 32GB

Base model specs: 32 layers, 32:8 GQA, SwiGLU FFN, 128k RoPE, test-time compute reasoning.

Licencia: other
Idiomas: no disponibles
Formato: GGUF
Arquitectura: Llama (transformer decoder-only con GQA)
Método: G-TAP v3 (Generalized Thouless-Anderson-Palmer), statistical mechanics, tap-dpq, imatrix

Base model DeepSeek-R1-Distill-Llama-8B is based on Llama-3.1-8B, distilled from DeepSeek-R1, 128k context.

Let me write the ficha. I should note that the base is 128k context. The GGUF run example uses -c 8192.

Hardware: 2.23 GiB quantized weights, fits consumer GPU easily, edge devices, mobile. RTX 4080 Super 206.8 t/s.

Comparatives: unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF, base deepseek model, Llama-3.1-8B.

Let me be careful not to invent. Benchmarks table only has those numbers provided. I could compare with base model but no data — indicate no disponible.

Let me write.

Titles: only first word capitalized. "## Resumen", "## Especificaciones tecnicas", etc.

Let me draft.

For specs table:
| Arquitectura | Transformer decoder-only (Llama) con GQA 32:8, SwiGLU FFN, RoPE 128k |
| Parametros totales | 8.030.261.312 (~8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (RoPE de 128k heredado de Llama-3.1); ejemplos de ejecucion con 8.192 |
| Tipos de cuantizacion | IQ2_XXS (GGUF), ~2,06 bpw, 2,23 GiB |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF |

Note: active params not MoE, but rule says "(solo si es MoE)". So I can omit or say no aplica. I'll include "no aplica (modelo denso)".

Let me write everything.## Resumen

DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ2_XXS-GGUF es un checkpoint cuantizado de forma extrema del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicado por el laboratorio DuoNeural (Jesse Caldwell, Archon y Aura). El modelo base es un transformer decoder-only de tipo Llama, con 8.030.261.312 parametros, destilado por DeepSeek-AI a partir de su modelo de razonamiento DeepSeek-R1 y construido sobre la arquitectura de Llama-3.1-8B (32 capas, atencion GQA 32:8, FFN SwiGLU y RoPE de 128k). Este checkpoint concreto aplica una cuantizacion GGUF de tipo IQ2_XXS a aproximadamente 2,06 bits por peso, dejando el archivo en unos 2,23 GiB.

El problema que aborda es concreto: los modelos de razonamiento con cadena de pensamiento extensa generan cientos de tokens intermedios dentro de la etiqueta `<think>`, y el ruido de discretizacion de la cuantizacion post-entrenamiento (PTQ) se acumula de forma multiplicativa a lo largo de esos pasos, provocando derivaciones de la prueba y bucles repetitivos. DuoNeural propone el marco G-TAP v3 (Generalized Thouless-Anderson-Palmer), que modela los pesos como vidrios de espin y resta el termino de reaccion de Onsager para preservar las cuencas de atraccion del razonamiento. Es un artefacto de investigacion experimental, marcado por el propio autor como pendiente de verificacion adicional.

Su relevancia actual reside en que permite desplegar un modelo de razonamiento de 8B con 128k de contexto en hardware de gama baja, movil o edge, a cambio de una perdida de calidad medible. No es un lanzamiento de produccion, sino una prueba de concepto de cuantizacion sub-2,1 bits orientada a test-time compute.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) con GQA 32:8, FFN SwiGLU, RoPE de 128k y razonamiento por test-time compute |
| Parametros totales | 8.030.261.312 (~8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama-3.1); los ejemplos de ejecucion del autor usan 8.192 |
| Tipos de cuantizacion | IQ2_XXS (GGUF), ~2,06 bits por peso, ~2,23 GiB; con imatrix |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base deepseek-ai/DeepSeek-R1-Distill-Llama-8B: un transformer decoder-only de 32 capas con atencion de consultas agrupadas en proporcion 32:8 (32 cabezas de consulta y 8 de clave/valor), FFN con activacion SwiGLU y embeddings rotatorios (RoPE) que soportan 128k tokens de contexto. DeepSeek-AI lo obtuvo por destilacion del modelo DeepSeek-R1, incorporando datos de arranque en frio (cold-start) antes del aprendizaje por refuerzo, tecnica que en el R1 completo se introdujo para mitigar los problemas de repeticion infinita, mala legibilidad y mezcla de idiomas observados en DeepSeek-R1-Zero.

Sobre ese modelo base, DuoNeural no reentrena ni hace fine-tuning: aplica una cuantizacion post-entrenamiento denominada G-TAP v3. El metodo modela los pesos como vidrios de espin embebidos en campos de cavidad de activacion, resta el termino de reaccion de Onsager definido como Omega_i = (1/d)(||H_i,:||^2 - H_ii^2) y proyecta las actualizaciones de parametros estrictamente en el semiespacio contractivo de Lyapunov, denotado por Re(lambda(S)) <= -delta. El objetivo declarado es amortiguar el ruido de retroaccion y preservar las cuencas de atraccion del razonamiento a lo largo de secuencias de pensamiento largas. La cuantizacion emplea una matriz de importancia (imatrix) y se empaqueta en formato GGUF. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base mas alla de lo publicado por DeepSeek-AI.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento con cadena de pensamiento explicita dentro de la etiqueta `<think>`, con una traza media de 345,8 tokens y una tasa de cierre de la etiqueta `</think>` del 88,0%.
- Matematicas de nivel escolar: 14 de 25 pruebas de CoT nativo en GSM8K (56,0%).
- Matematicas de competicion tipo olimpiada: 2 de 10 (20,0%).
- Generacion de codigo Python: 1 de 10 en ejecucion AST (10,0%).
- Razonamiento multi-paso orientado a test-time compute, que es la finalidad declarada del checkpoint.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y uso via llama-cli y llama-server.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agentes: no disponible.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible.

## Casos de uso

- Despliegue en movil y dispositivos edge: con 2,23 GiB de pesos en IQ2_XXS, el modelo cabe en telefonos de gama alta y placas tipo Raspberry Pi con suficiente RAM, lo que permite razonamiento local sin conexion.
- Inferencia en GPU de consumo con alto throughput: el autor reporta 206,8 tokens por segundo en una RTX 4080 Super, util para prototipos interactivos de razonamiento donde la latencia importa.
- Investigacion en cuantizacion extrema: sirve como artefacto reproducible para estudiar como el ruido de discretizacion sub-2,1 bits afecta a las cadenas de pensamiento largas y a los bucles de repeticion.
- Generacion de explicaciones paso a paso en entornos educativos: el modo `<think>` produce trazas de unos 345 tokens que pueden mostrarse como resolucion razonada de problemas matematicos basicos.
- Chat local con contexto largo: los 128k tokens de ventana permiten mantener conversaciones multi-turno o resumir documentos extensos en equipos sin GPU dedicada.
- Servicio de bajo coste con llama-server: la compatibilidad con endpoints permite levantarlo como API HTTP en un contenedor pequeno para pruebas internas.
- Benchmarking comparativo de tecnicas de PTQ: al publicar perplexity de holdout continuo (5,4062 sobre 131k tokens), permite contrastar marcos de cuantizacion alternativos.

## Benchmarks y rendimiento

Los unicos datos publicados proceden de la model card del autor, obtenidos sobre una RTX 4080 Super de 32 GB. No se aportan comparaciones con otros modelos.

| Prueba | Resultado |
|---|---|
| Perplexity de holdout continuo (131k tokens) | 5,4062 |
| GSM8K, pruebas de CoT nativo | 14/25 (56,0%) |
| Matematicas de olimpiada | 2/10 (20,0%) |
| Ejecucion AST de codigo Python | 1/10 (10,0%) |
| Traza de pensamiento media | 345,8 tokens |
| Tasa de cierre de `</think>` | 88,0% |
| Throughput de decodificacion | 206,8 t/s en RTX 4080 Super 32 GB |

No se dispone de datos comparativos frente al modelo base sin cuantizar ni frente a otras cuantizaciones de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos ~2,5-3 GB para los pesos (2,23 GiB) mas la cache KV. Con contexto de 8.192 tokens y GQA 32:8, la cache KV es modesta; con los 128k completos crece de forma notable y exige mas memoria.
- GPU recomendadas: el autor valida el checkpoint en una NVIDIA GeForce RTX 4080 Super de 32 GB. Cualquier GPU con 4 GB o mas de VRAM es suficiente en principio.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y equivalentes; tambien en iGPU con memoria unificada suficiente.
- CPU y edge: al ser un GGUF de 2,23 GiB, es viable en CPU con llama.cpp, en dispositivos moviles y en placas de un solo board con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) es el soporte documentado por el autor; por formato GGUF tambien seria compatible con Ollama, LM Studio y otros runners GGUF. vLLM y TGI no soportan GGUF directamente sin conversion.
- Latencia y throughput: 206,8 t/s de decodificacion en RTX 4080 Super segun el autor. No se publican cifras para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoNeural/DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ2_XXS-GGUF | 8,03B | 128k | IQ2_XXS (~2,06 bpw) | other | HuggingFace, 2,4 GB |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8,03B | 128k | safetensors (completa) | MIT (segun el modelo base) | HuggingFace |
| unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF | 8,03B | 128k | varias GGUF (mayor bpw) | MIT (segun el modelo base) | HuggingFace |
| Llama-3.1-8B | 8,03B | 128k | safetensors | Llama 3.1 Community License | Meta / HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental: el propio autor marca el checkpoint como "Experimental Release: Pending Further Verification / Empirical Validation". No debe considerarse listo para produccion sin validacion propia.
- Rendimiento degradado: los resultados publicados son bajos en terminos absolutos (1/10 en ejecucion de codigo Python, 2/10 en matematicas de olimpiada). La cuantizacion a ~2,06 bpw penaliza claramente la calidad.
- Tasa de no cierre de la traza: un 12,0% de las trazas no cierran la etiqueta `</think>`, lo que puede dejar al modelo en bucles de razonamiento sin respuesta final.
- Riesgo de alucinacion: inherente a los modelos destilados de razonamiento y agravado por la cuantizacion extrema; las pruebas de matematicas y codigo muestran una tasa de acierto baja.
- Licencia "other": no se detallan los terminos exactos en la informacion disponible, por lo que el uso comercial queda sujeto a revision de la licencia del autor y de la licencia del modelo base (Llama 3.1 Community License y condiciones de DeepSeek).
- Idiomas soportados: no disponibles; la model card esta integramente en ingles y no se documenta cobertura multilingue.
- Contexto amplio con memoria limitada: aunque el modelo soporta 128k teoricamente, los ejemplos del autor usan 8.192 tokens, y en dispositivos edge la cache KV a 128k puede exceder la memoria disponible.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Madurez del metodo: G-TAP v3 se presenta con formulacion fisica (vidrios de espin, semiespacio de Lyapunov) pero sin validacion externa independiente en la informacion disponible.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Llama-8B-GTAP-v3-IQ2_XXS-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Cuantizacion GGUF de la comunidad (unsloth): https://huggingface.co/unsloth/DeepSeek-R1-Distill-Llama-8B-GGUF
- Repositorio DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- Ficha en LM Studio: https://lmstudio.ai/models/deepseek/deepseek-r1-distill-llama-8b
- Ficha en Featherless: https://featherless.ai/models/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
