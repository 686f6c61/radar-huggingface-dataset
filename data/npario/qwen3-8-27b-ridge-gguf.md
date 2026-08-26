# npario/Qwen3.8-27B-Ridge-GGUF

## Resumen

Qwen3.8-27B-Ridge-GGUF es una cuantizacion GGUF del modelo oficial Qwen/Qwen3.8-27B, desarrollada por el autor npario bajo la marca Empero. Se trata de un checkpoint de 27.320.697.856 parametros (27,3B) con arquitectura hibrida que combina capas Gated-DeltaNet con capas de atencion completa, y capacidades multimodales de imagen y texto. La cuantizacion "Ridge" es una mezcla de tipos de cuantizacion especificamente calibrada para preservar la ruta de estado recurrente Gated-DeltaNet, que resulta especialmente sensible a la cuantizacion de baja precision.

El archivo principal ocupa 11,73 GiB (3,69 bits por peso), lo que permite ejecutar un modelo de 27B con ventana de contexto nativa de 262.144 tokens en tarjetas graficas de consumo con 16-24 GB de VRAM. Incluye la cabeza MTP (multi-token prediction) nativa para decodificacion especulativa y un proyector de vision BF16 separado de 0,87 GiB. La relevancia de esta ficha radica en que ofrece una de las cuantizaciones mas compactas para esta arquitectura hibrida, con una degradacion medida de perplexity de solo +9,3 % respecto al BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Transformer: 64 capas = 16 bloques de (3 x GatedDeltaNet -> FFN + 1 x GatedAttn -> FFN) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extension YaRN hasta 1.048.576 tokens |
| Tipos de cuantizacion | Ridge mix 3,69 bpw (estado GDN en Q8_0, mixers en Q4_K, FFN en Q4_K, cabeza MTP en Q6_K); mmproj de vision en BF16 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors BF16 disponible en el modelo base) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo hibrido que alterna capas Gated-DeltaNet y capas de atencion completa: por cada cuatro capas, tres son Gated-DeltaNet (un bloque de estado recurrente con atencion lineal) y una es de atencion completa, seguidas de una FFN. Esta arquitectura reduce el coste del KV cache frente a un transformer puro, lo que permite ventanas de contexto de 262K nativas y extension YaRN hasta 1M. El modelo base fue entrenado por el equipo Qwen de Alibaba con datos multilingues (ingles y chino) y capacidades multimodales de imagen.

La cuantizacion Ridge fue construida con llama.cpp (commit `adb55e5`), usando una importance matrix calibrada sobre 80 fragmentos de 512 tokens de wikitext y codigo. La innovacion clave es que trata el estado Gated-DeltaNet (`ssm_alpha` y `ssm_beta`) y los mixers GDN como ciudadanos de primera clase, manteniendolos en Q8_0 y Q4_K respectivamente, en lugar de aplicar una cuantizacion plana de 2 bits como hacen las mezclas genericas IQ2. La cabeza MTP nativa (bloques `blk.64` / `nextn`) se conserva en Q6_K y no se uso en la calibracion, por lo que no tiene imatrix. No se dispone de informacion detallada sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable y desactivable (`--reasoning off`).
- Vision multimodal: procesamiento de imagenes mediante el proyector BF16 `mmproj-Qwen3.8-27B-BF16.gguf` (0,87 GiB), obligatorio para entrada de imagenes.
- Decodificacion especulativa MTP: la cabeza draft nativa se conserva en el GGUF y puede usarse con llama.cpp `--spec-type draft-mtp`.
- Tool calling y function calling: soportado por el modelo base Qwen3.8 para integraciones de agentes.
- Contexto largo: 262K tokens nativos con extension YaRN hasta 1M.
- Multilingue: ingles y chino (según la ficha del modelo base).
- Compatible con runtimes GGUF estandar: llama.cpp, Ollama, LM Studio, jan y KoboldCpp.

## Casos de uso

- Asistente de codigo en produccion: el soporte de tool calling y el modo reasoning permiten integrarlo en pipelines de CI/CD para generar, revisar y ejecutar codigo con llamadas a funciones, aunque la cuantizacion de 3,7 bpw puede degradar la fidelidad en tareas complejas.
- Atencion al cliente multimodal: la combinacion de vision y texto con contexto de 262K tokens permite gestionar conversaciones largas con capturas de pantalla, documentos escaneados o imagenes de productos, todo en una sola sesion.
- RAG de documentos extensos: la ventana nativa de 262K tokens (extensible a 1M con YaRN) permite indexar manuales, papers o codebases completos sin fragmentacion, con la cabeza MTP acelerando la generacion de respuestas.
- Agente autonomo multi-paso: el modo thinking integrado y la capacidad de razonamiento paso a paso lo hacen apto para agentes que planifican y ejecutan acciones con herramientas externas, aunque en 16 GB de VRAM se recomienda contexto moderado para no saturar la KV cache.
- Analisis de imagenes y documentos en local: el mmproj BF16 permite clasificar, describir y extraer informacion de imagenes sin depender de servicios en la nube, con licencia Apache-2.0 que permite uso comercial.
- Traduccion y procesamiento de texto bilingue chino-ingles: el modelo esta entrenado en ambos idiomas, lo que lo convierte en un candidato para traduccion y normalizacion de contenido bilingue con contexto largo.

## Benchmarks y rendimiento

La informacion proporcionada no incluye resultados de benchmarks estandar como MMLU, HumanEval o GSM8K para esta cuantizacion. El unico dato de calidad publicado es la perplexity (PPL) medida por el autor con `llama-perplexity` sobre 80 fragmentos de 512 tokens, comparada con una conversion BF16 del mismo checkpoint:

| Candidato | Tamano | BPW | PPL (wikitext) | Degradacion vs BF16 |
|---|---:|---:|---:|---|
| BF16 GGUF | 50,89 GiB | 16,00 | 7,15 ± 0,12 | — |
| **Ridge-3.7bpw** | **11,73 GiB** | **3,69** | **7,82 ± 0,14** | **+9,3 %** |

En rendimiento de inferencia, una medicion puntual en una sola tarjeta RTX PRO 6000 Blackwell (96 GB) con llama.cpp CUDA (`-ngl 99`) reporta ~54 tokens/s de generacion y ~130 tokens/s de prompt. No hay datos publicados sobre otros benchmarks del modelo base en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo principal pesa 11,73 GiB (12,59 GB); con contexto moderado y KV cache, se recomienda al menos 16 GB de VRAM como punto de partida y 24 GB para un uso comodo con contexto adicional.
- El proyector de vision anade 0,87 GiB adicionales si se usan imagenes.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080 (16 GB) para uso local; RTX PRO 6000 Blackwell (96 GB) para despliegue completo sin offload, medido a ~54 tok/s de generacion.
- Contexto largo: la ventana nativa de 262K y la extension de 1M hacen que la KV cache domine el consumo de VRAM; puede requerir offload parcial de pesos incluso en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), Ollama (via `ollama run hf.co/empero-ai/Qwen3.8-27B-Ridge-GGUF` o Modelfile local), LM Studio, jan y KoboldCpp.
- Decodificacion especulativa: requiere una version reciente de llama.cpp con `--spec-type draft-mtp` para usar la cabeza MTP nativa.

## Comparativa con modelos similares

La tabla publicada en la model card compara este archivo con otras cuantizaciones del mismo modelo base Qwen3.8-27B, en funcion del tamano y la perplexity medida por el autor:

| Archivo | Publicador | Tamano | Banda nominal | PPL vs BF16 |
|---|---:|---:|---|---|
| BF16 (esta conversion) | empero-ai | 50,89 GiB | 16 bpw | 7,15 |
| `UD-IQ2_XXS` | unsloth | 8,39 GiB | ~2,1 bpw | no medida (82,5 % top-1 vs BF16) |
| `UD-IQ2_M` | unsloth | 9,61 GiB | ~2,4 bpw | no medida |
| `IQ2_XXS` | bartowski | 8,75 GiB | ~2,2 bpw | no medida |
| `Q3_K_S` | unsloth | 11,71 GiB | ~3,1 bpw | no medida |
| **Ridge-3.7bpw** | **empero-ai** | **11,73 GiB** | **3,69 bpw** | **7,82 (+9 %)** |
| `IQ3_XXS` | bartowski | 11,76 GiB | ~2,9 bpw | no medida |
| `UD-Q3_K_XL` | unsloth | 12,52 GiB | ~3,4 bpw | no medida |

No se dispone de comparativas con otros modelos de tamano similar (p. ej., Llama 3.3-70B o Qwen2.5-32B) en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion de baja precision: a 3,69 bpw, la perplexity aumenta un 9,3 % respecto al BF16; tareas complejas de razonamiento, codigo o matematicas pueden degradarse notablemente frente al modelo completo.
- Idiomas limitados: el modelo base solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Riesgo de alucinacion: como cualquier LLM de 27B, puede generar contenido falso o inexacto, especialmente en modo thinking con temperaturas altas.
- Contexto largo: la extension YaRN de 1M tokens puede provocar degradacion de calidad en posiciones extremas; el KV cache de 262K tokens puede saturar la VRAM de tarjetas de consumo.
- Sesgos del modelo base: no se han publicado evaluaciones de sesgo especificas para Qwen3.8-27B en la informacion disponible.
- Compatibilidad: la cabeza MTP requiere una version reciente de llama.cpp con soporte `draft-mtp`; runtimes antiguos pueden ignorar la cabeza sin degradacion funcional, pero sin ganancia de velocidad.
- Licencia Apache-2.0 permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales del equipo Qwen que no se detallan en la ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/npario/Qwen3.8-27B-Ridge-GGUF
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio en ModelScope: https://www.modelscope.cn/models/empero-ai/Qwen3.8-27B-Ridge-GGUF
- Repositorio oficial del modelo base (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-27b-ridge.html
