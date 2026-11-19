# isitshart/Qwen3.8-Flash-Next-NVFP4-QAD-oMLX

## Resumen

Qwen3.8-Flash-Next-NVFP4-QAD-oMLX es una conversión comunitaria para Apple Silicon del checkpoint cuantizado de NVIDIA `nvidia/Qwen3.8-Flash-Next-NVFP4-QAD`, un modelo de lenguaje de tipo mixtura de expertos (MoE) híbrido desarrollado originalmente por el equipo Qwen y empaquetado por NVIDIA con cuantización NVFP4 y destilación con conciencia de cuantización (QAD). El autor del repositorio, `isitshart`, publica una build optimizada para el runtime oMLX, con los expertos enrutados conservados bit a bit en NVFP4 y el resto del modelo reorganizado para los kernels de decodificación fusionados de oMLX.

El modelo resuelve el problema de ejecutar un MoE de gran tamaño (81.853.267.859 parámetros totales según los safetensors del repo) en hardware de Apple Silicon con memoria unificada, reduciendo el peso de descarga a 120 GB y la memoria residente a unos 75 GB gracias al offload del tabla de memoria n-gram a SSD. Incorpora atención lineal Gated DeltaNet en 36 de sus 48 capas, atención completa dispersa en las 12 restantes, hiperconexiones con 4 flujos residuales y una capa MTP para decodificación especulativa.

Es relevante ahora porque demuestra que un MoE de casi 82.000 millones de parámetros con ventana de contexto de 262.144 tokens puede servirse en un Mac Studio de gama alta a velocidades de decodificación cercanas a las de un servidor dedicado, manteniendo una perplejidad dentro del ruido respecto a los pesos QAD exactos. La ficha se basa exclusivamente en la información publicada en el repositorio y en la model card; los datos no presentes se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con atención lineal Gated DeltaNet (36 capas) y atención completa dispersa con token indexer (12 capas), hiperconexiones de 4 flujos residuales, memoria n-gram PLE y capa MTP |
| Parámetros totales | 81.853.267.859 (según safetensors del repo) |
| Parámetros activos | no disponible (routing top-10 sobre 512 expertos enrutados por capa más experto compartido; el número exacto de parámetros activos no se publica) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 en los expertos enrutados (QAD), más capas en otros formatos no detallados; build orientada a oMLX |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (etiqueta `license:other` en el repo) |
| Formato de pesos | safetensors (librería `mlx`), 128,7 GB de tamaño de repo |

## Arquitectura y entrenamiento

El modelo base es un MoE híbrido de 48 capas con tamaño oculto 2560. De ellas, 36 son capas de atención lineal Gated DeltaNet y 12 son capas de atención completa con atención dispersa y un indexador de tokens. Cada capa contiene 512 expertos enrutados con routing top-10 más un experto compartido, cada uno con tamaño intermedio 640. Sobre esta pila se añaden hiperconexiones de 4 flujos residuales paralelos que se mezclan en cada capa, y una capa MTP (multi-token prediction) destinada a decodificación especulativa.

La innovación más singular es la memoria n-gram PLE: en la capa 2, los dos y tres tokens anteriores se hashean en 16 cabezas de lookup sobre 51.200 millones de parámetros de vectores de 160 dimensiones, y una compuerta controlada por el estado oculto decide cuánto de esa memoria se incorpora. Según la model card, desactivar este mecanismo eleva la perplejidad de 1,35 a 2,20 en el texto de prueba del autor, lo que indica una dependencia fuerte de esta vía. El checkpoint de NVIDIA aplica destilación con conciencia de cuantización para que los expertos enrutados funcionen en 4 bits NVFP4; la build de oMLX conserva esos pesos bit a bit con sus escalas de dos niveles.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO empleadas en el modelo original. La model card de esta conversión tampoco detalla el proceso de calibración QAD más allá de indicar que los expertos enrutados son los pesos NVFP4 de NVIDIA sin modificar.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de contexto de hasta 262.144 tokens.
- Razonamiento con modo de pensamiento acotado mediante `thinking_budget_tokens` (12.000 tokens recomendados), configurable en oMLX.
- Tool calling y function calling a través del parser `qwen3_coder` de oMLX, compatible con el formato de herramientas de OpenAI.
- Integración con arneses de agentes que hablan el formato OpenAI tools (OpenCode, Claude Code mediante proxy compatible con Anthropic, entre otros).
- Decodificación especulativa con la capa MTP integrada, con profundidad adaptativa configurable (`mtp_adaptive_max_depth`).
- Servicio concurrente: la model card reporta 16 sesiones simultáneas de 128k tokens en un M5 Ultra de 256 GB.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: el modelo puede generar y revisar código en un endpoint compatible con OpenAI servido por oMLX, integrándose en editores y CLI de agentes que usan el formato de herramientas estándar, sin depender de la nube.
- Agentes autónomos multi-paso: la combinación de tool calling con el parser `qwen3_coder`, contexto de 262k tokens y modo de pensamiento acotado permite cadenas de razonamiento y llamadas a herramientas en un mismo endpoint.
- Análisis de repositorios y documentos largos: con 262.144 tokens de contexto y un coste de KV cache de unos 25 KB por token (aproximadamente 3,2 GB por sesión de 128k), es viable procesar codebases o contratos extensos en una sola pasada.
- Atención al cliente automatizada: el modelo sostiene conversaciones multi-turno con historial largo y puede desplegarse con varias sesiones concurrentes (la model card reporta 180 tok/s agregados con 6 sesiones en M5 Ultra).
- Procesamiento por lotes en estación de trabajo: con decodificación de un solo flujo a 97-100 tok/s en M5 Ultra, resulta adecuado para generación de resúmenes, clasificación o extracción de datos en volúmenes moderados sin GPU dedicada.
- Investigación y evaluación de MoE cuantizados: al conservar los expertos NVFP4 bit a bit y ofrecer una perplejidad dentro del ruido respecto a los pesos QAD exactos, sirve como banco de pruebas para estudiar el impacto de la cuantización en modelos híbridos de atención lineal.
- Despliegue de agentes de codificación con proxy Anthropic: la model card menciona explícitamente Claude Code a través de un proxy compatible, lo que permite usar el modelo como backend local de un arnés de agente ya existente.

## Benchmarks y rendimiento

| Métrica | Esta build | TensorFold 8-bit MTP (referencia) |
|---|---|---|
| Descarga | 120 GB | 198 GB |
| Memoria residente (tabla n-gram en SSD) | 75 GB | ~200 GB con la tabla en RAM |
| Perplejidad frente a los pesos QAD exactos | −0,05 % (ruido) | +0,63 % |
| Decodificación de un solo flujo, M5 Ultra | 97-100 tok/s | 111 tok/s |
| 6 sesiones en paralelo, total | 180 tok/s | 166 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son los de la model card, centrados en perplejidad relativa y velocidad de decodificación en hardware Apple.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 75 GB residentes con la tabla n-gram en SSD, o unos 125 GB con la tabla en RAM.
- KV cache: aproximadamente 25 KB por token (12 capas de atención completa × 2 cabezas KV × 256 dimensiones × K y V en bf16), es decir, unos 3,2 GB por sesión de 128k tokens; las 36 capas de atención lineal mantienen un estado de tamaño fijo por sesión.
- GPU recomendadas: Apple Silicon de gama alta; la model card reporta pruebas en M5 Ultra con 256 GB y límite de memoria GPU de 236.000 MB, con 16 sesiones concurrentes de 128k alcanzando 201 GB cableados y 65 GB libres.
- Equipos más pequeños: un Mac de 128 GB tendría espacio para el modelo con la tabla en SSD más unas pocas sesiones largas, aunque el autor indica que no se ha probado.
- Almacenamiento: se recomienda SSD interno rápido si se usa el offload de la tabla n-gram.
- Opciones de despliegue: oMLX (probado en el commit `bf28cd6`, versión 0.8.0rc1), con servidor compatible con OpenAI en el puerto 8081; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: 97-100 tok/s en decodificación de un solo flujo y 180 tok/s agregados con 6 sesiones en M5 Ultra; el barrido de profundidad MTP fija 2 y 3 y adaptativa 2, 3 y 4 arrojó un rango de 94-100 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Memoria residente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-QAD-oMLX (esta build) | 81.853.267.859 | 262.144 | ~75 GB (tabla en SSD) | NVIDIA Open Model License | Hugging Face, runtime oMLX |
| TensorFold 8-bit MTP (referencia de la model card) | no disponible | no disponible | ~200 GB con tabla en RAM | no disponible | no disponible |
| nvidia/Qwen3.8-Flash-Next-NVFP4-QAD (base) | no disponible | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La build está atada al runtime oMLX y a sus kernels fusionados; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- El offload de la tabla n-gram a SSD exige almacenamiento interno rápido; un SSD lento puede degradar el rendimiento aunque la model card afirme que no hay pérdida de velocidad medida.
- La decodificación especulativa con profundidades MTP superiores a 2 no aporta mejoras según el autor; el ajuste recomendado es profundidad adaptativa 2.
- El modo de pensamiento debe acotarse (`thinking_budget_tokens` a 12.000) para que las peticiones difíciles lleguen a una respuesta.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; deben revisarse antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original del modelo: es una conversión comunitaria sin validación independiente más allá de las pruebas del propio autor.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación; al ser un modelo conversacional, el riesgo de alucinación debe asumirse como presente y mitigarse con verificación externa.
- El rendimiento en equipos de 128 GB no ha sido probado según la model card.
- El tamaño de contexto práctico está limitado por la memoria: cada sesión de 128k consume unos 3,2 GB de KV cache, lo que condiciona el número de sesiones concurrentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/isitshart/Qwen3.8-Flash-Next-NVFP4-QAD-oMLX
- Modelo base en Hugging Face: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4-QAD
- Runtime oMLX: https://github.com/jundot/omlx
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
