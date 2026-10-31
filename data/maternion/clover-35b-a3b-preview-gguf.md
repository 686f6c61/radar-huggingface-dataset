# maternion/Clover-35B-A3B-Preview-GGUF

## Resumen

Clover-35B-A3B-Preview es un modelo lingüístico de difusión (diffusion language model) de tipo mezcla de expertos (MoE) desarrollado por DiffuSpace, con 34,66 mil millones de parámetros totales de los cuales solo unos 3.000 millones se activan por token. Se deriva de Qwen3.6-35B-A3B y combina una arquitectura híbrida Gated DeltaNet / atención completa con generación por bloques de difusión, un enfoque que permite decodificar varios tokens en paralelo en lugar de estrictamente uno a uno. Su relevancia radica en que DiffuSpace lo presenta como el estado del arte entre los modelos de difusión open source en el momento de su lanzamiento, con resultados destacados en benchmarks agénticos.

Esta ficha cubre la cuantización GGUF publicada por el usuario maternion, que convierte el modelo original en BF16 a formatos k-quant (desde Q3_K_S hasta Q8_0) mediante llama.cpp. El modelo cuenta con una ventana de contexto de 128K tokens (131.072), modo de razonamiento (thinking) activado por defecto y licencia Apache-2.0. Es un modelo de previsualización (Preview) y requiere una versión parcheada de llama.cpp todavía no fusionada en el repositorio principal, lo que limita considerablemente su facilidad de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE de difusión híbrida (Gated DeltaNet + atención completa), `clover_moe` |
| Parametros totales | 34.661.350.848 (~34,66B) |
| Parametros activos | ~3B por token (top-8 de 256 expertos + 1 experto compartido por capa) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M, IQ4_XS, Q3_K_M, Q3_K_S (sin matriz de importancia) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors BF16) |

## Arquitectura y entrenamiento

Clover emplea un backbone híbrido que alterna capas de atención completa con capas Gated DeltaNet (GDN), una arquitectura de tipo estado lineal que reduce el coste computacional en secuencias largas. Sobre este backbone se añaden parámetros GDN adicionales aprendidos que permiten atención bidireccional dentro de los bloques de difusión, manteniendo a la vez un prefijo causal. La capa MoE enruta cada token entre 256 expertos seleccionando los 8 mejores (top-8), con 1 experto compartido por capa, y el modelo tiene 40 capas en total.

La generación se realiza mediante difusión por bloques (block-diffusion): en lugar de decodificar token a token de forma autorregresiva estricta, el modelo puede refinar bloques de tokens de forma iterativa. No obstante, en llama.cpp los archivos GGUF se ejecutan por defecto en modo de decodificación causal ordinaria, un token por vez. El modelo deriva de Qwen3.6-35B-A3B y, según DiffuSpace, incorpora controles específicos del muestreador de difusión como `dllm_length_penalty` y `dllm_think_end_bias` (no implementados en llama.cpp). Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Modo de razonamiento (thinking) activado por defecto, desactivable mediante `--chat-template-kwargs '{"enable_thinking": false}'` en llama.cpp.
- Capacidades agénticas: DiffuSpace publica resultados de benchmarks agénticos donde afirma el estado del arte entre modelos de difusión open source en su lanzamiento.
- Ventana de contexto de 128K tokens para documentos y conversaciones largas.
- Decodificación por difusión de bloques en la implementación original (en llama.cpp funciona como modelo causal estándar).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Experimentación con modelos de difusión de texto: al ser uno de los pocos MoE de difusión open source cuantizados a GGUF, es idóneo para investigar el comportamiento de esta familia de arquitecturas en hardware local.
- Prototipado agéntico local: los benchmarks agénticos publicados por DiffuSpace lo sitúan como candidato para agentes de varios pasos que se ejecutan íntegramente en una GPU de 24 GB con la cuantización Q4_K_M.
- Procesamiento de documentos largos: la ventana de 128K tokens permite resumir, analizar o hacer preguntas sobre contratos, informes o bases de código extensos en una sola pasada de contexto.
- Chatbot local con razonamiento: el modo thinking por defecto lo hace adecuado para asistentes que necesitan deliberar antes de responder, con la opción de desactivarlo para respuestas rápidas.
- Inferencia eficiente en hardware de consumo: con ~3B de parámetros activos por token, el coste por token es comparable al de un modelo denso de 3B pese a tener 35B totales, lo que beneficia el throughput en GPUs de gama alta.
- Base para fine-tuning o destilación experimental: la licencia Apache-2.0 y la derivación de Qwen3.6-35B-A3B facilitan su uso como punto de partida para investigaciones sobre cuantización y decodificación especulativa (llama.cpp incluye `llama-speculative-simple` en las instrucciones de compilación).

## Benchmarks y rendimiento

DiffuSpace afirma en su blog de lanzamiento resultados de estado del arte entre modelos de difusión open source, con una imagen de resultados agénticos (`benchmark.png`) enlazada en la model card. No se han publicado cifras numéricas concretas (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y los resultados difundidos corresponden al modelo BF16 original, no a estas cuantizaciones.

| Benchmark | Resultado |
|---|---|
| Agénticos (ver blog de DiffuSpace) | no disponible (solo imagen en la model card) |
| MMLU / HumanEval / GSM8K | no disponible |

## Requisitos de hardware

- Q8_0 (36,90 GB): requiere ~40 GB de VRAM o descarga parcial en RAM; adecuado para A100 40 GB, A6000 48 GB o H100.
- Q6_K (28,52 GB): cabe en GPUs de 32-40 GB (A100 40 GB, 2x RTX 3090/4090 con offload parcial).
- Q4_K_M (21,17 GB): cabe cómodamente en una GPU de 24 GB (RTX 3090, RTX 4090, RTX 5090); es la recomendación del autor.
- IQ4_XS (18,94 GB) y Q3_K_M (16,77 GB): caben en GPUs de 24 GB con margen adicional para el contexto KV cache.
- Q3_K_S (15,19 GB): la opción más ligera, con degradación visible de calidad.
- Software: es imprescindible compilar llama.cpp desde el PR #31306 (commit `4838ffb0c8ade92f34d9157deea38d92758ab824`); las versiones publicadas de llama.cpp, Ollama, LM Studio y cualquier aplicación sobre llama.cpp estándar no pueden cargar la arquitectura `clover_moe`. No existe binario precompilado que ejecute este modelo.
- Despliegue recomendado: `llama-server` (API compatible con OpenAI) o `llama-cli`, con `-ngl 99 -fa on` y contexto de 32K o superior. vLLM, TGI, Ollama y LM Studio: no soportados actualmente.
- Latencia y throughput: no disponibles; en modo causal el coste por token depende de los ~3B de parámetros activos, comparable a un modelo denso de 3B.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Tipo de decodificación | Licencia |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview | 34,66B | ~3B | 128K | Difusión por bloques (causal en llama.cpp) | Apache-2.0 |
| Qwen3-30B-A3B | 30,5B | ~3B | 128K (extendible) | Autorregresiva | Apache-2.0 |
| Llama 3.3 70B | 70B (denso) | 70B | 128K | Autorregresiva | Llama Community License |
| Qwen3-32B | 32B (denso) | 32B | 128K (extendible) | Autorregresiva | Apache-2.0 |

Clover comparte con Qwen3-30B-A3B la filosofía MoE de ~3B activos, pero se distingue por su decodificación por difusión y su backbone híbrido GDN, una diferencia fundamental que actualmente limita su ecosistema de inferencia frente a los modelos autorregresivos, que funcionan en vLLM, Ollama y cualquier runtime estándar.

## Limitaciones y advertencias

- Compatibilidad: requiere llama.cpp compilado desde un PR no fusionado (PR #31306); ninguna versión estable, Ollama, LM Studio ni binarios precompilados pueden ejecutarlo. Esto es un bloqueante para la mayoría de entornos de producción.
- Los controles específicos del muestreador de difusión de DiffuSpace (`dllm_length_penalty`, `dllm_think_end_bias`) no están implementados en llama.cpp, por lo que las cuantizaciones GGUF no aprovechan la decodificación por difusión nativa.
- Las cuantizaciones se han generado sin matriz de importancia (no-imatrix): Q3_K_M y Q3_K_S degradan visiblemente la calidad según el autor del repo.
- Los benchmarks publicados corresponden al modelo BF16 original; el rendimiento de las cuantizaciones puede diferir.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no cuantificado; al ser un modelo Preview derivado de Qwen3.6, deben esperarse los riesgos habituales de alucinación de LLM de uso general.
- Idiomas soportados y datos de entrenamiento: no disponibles, lo que impide evaluar su idoneidad para castellano sin pruebas propias.
- Soporte de tool calling: no confirmado en la información disponible.
- Licencia: Apache-2.0, sin restricciones para uso comercial; el aviso de la model card hereda la licencia sin cambios desde DiffuSpace.
- Al ser un modelo Preview, su calidad y API pueden cambiar en versiones futuras.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/maternion/Clover-35B-A3B-Preview-GGUF
- Modelo base (DiffuSpace): https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Blog de lanzamiento: https://diffuspace.ai/blog/clover-35b/
- Benchmarks agénticos: https://diffuspace.ai/blog/clover-35b/#agentic-benchmarks
- Repositorio oficial de código: https://github.com/DiffuSpace/Clover-35B-A3B-Preview
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31306
- Rama de desarrollo (Maphist0): https://github.com/Maphist0/llama.cpp-pub/tree/dev-clover
