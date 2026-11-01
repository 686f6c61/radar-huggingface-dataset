# mradermacher/flint-roleplay-antislop-GGUF

## Resumen

Esta ficha corresponde a la colección de cuantizaciones GGUF estáticas del modelo **flint-roleplay-antislop**, publicadas por el usuario **mradermacher** a partir del modelo base `rawmodels/flint-roleplay-antislop`. Se trata de un modelo de unos 39,8 mil millones de parámetros con arquitectura MoE (mixture of experts), especializado en roleplay y escritura creativa, entrenado con técnicas de reinforcement learning orientadas a "antislop", es decir, a reducir las construcciones repetitivas y clichés típicos de los modelos de lenguaje en generación narrativa.

La relevancia de esta versión cuantizada radica en la compatibilidad con llama.cpp y otros runtimes locales: gracias a los formatos GGUF (desde Q2_K hasta Q8_0), el modelo puede ejecutarse en hardware de consumo con una pérdida de calidad controlada y documentada. La colección incluye once cuantizaciones distintas, con tamaños que van desde 14,8 GB hasta 42,5 GB, además de variantes imatrix ponderadas disponibles en un repositorio complementario.

El modelo original se publica bajo licencia Apache 2.0 y está orientado al inglés. No se ha publicado en la model card información detallada sobre el número de expertos activos, la longitud de contexto, los datos de entrenamiento ni benchmarks, por lo que esos datos se indican como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), tipo transformer |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (más variantes imatrix en el repo i1) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en bf16/safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture of experts (MoE) con aproximadamente 39,8 mil millones de parámetros totales en bf16, según los metadatos de safetensors del repositorio. La etiqueta `moe` en la model card confirma esta arquitectura, aunque no se especifica el número de expertos, el número de expertos activos por token ni el tamaño de la capa de atención. El nombre del repositorio original (`rawmodels/flint-roleplay-antislop`) sugiere que forma parte de una familia de modelos "flint" orientados a escritura creativa.

Sobre el entrenamiento, los tags indican el uso de **reinforcement learning** con un enfoque "antislop": una técnica de post-entrenamiento que penaliza las frases hechas, muletillas y patrones estilísticos repetitivos ("slop") habituales en la salida de los LLM, con el objetivo de mejorar la calidad literaria y la variedad expresiva en roleplay y narrativa. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO específico ni otras innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto creativo con foco en roleplay interactivo y escritura narrativa, optimizada contra patrones repetitivos mediante el entrenamiento antislop.
- Escritura de diálogos de personajes y continuidad narrativa en sesiones de rol de varios turnos.
- Generación de prosa en inglés; el modelo está etiquetado únicamente para el idioma inglés, por lo que su rendimiento en castellano no está garantizado.
- Compatibilidad con el ecosistema GGUF: inferencia local con llama.cpp, Ollama, LM Studio, koboldcpp y otros runtimes derivados.
- No hay información disponible sobre soporte de tool calling / function calling, capacidades de agentes, visión, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- **Roleplay interactivo local**: ejecución del modelo en koboldcpp o llama.cpp para sesiones de rol con personajes, aprovechando el entrenamiento específico en roleplay y la reducción de "slop" para obtener diálogos más naturales y menos repetitivos.
- **Asistencia a escritura de ficción**: generación y continuación de escenas narrativas, descripciones y diálogos para autores que necesitan una prosa con menor carga de clichés que la de los modelos generalistas.
- **Servidores de juego y bots de narrativa**: despliegue local en un servidor con GPU para alimentar bots conversacionales de rol en plataformas comunitarias, sin depender de APIs de terceros y con licencia Apache 2.0 que permite uso comercial.
- **Prototipado de experiencias narrativas**: integración en pipelines de generación procedural de historias, donde el control local del modelo permite ajustar samplers y prompts sin coste por token.
- **Evaluación de cuantizaciones para escritura creativa**: la amplia gama de quants (Q2_K a Q8_0) permite estudiar el impacto de la cuantización en la calidad estilística del texto generado.
- **Fine-tuning posterior o destilación**: el modelo base en bf16 con licencia permisiva puede servir como punto de partida para ajustes adicionales por parte de terceros, con las quants GGUF como referencia de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo está orientado a escritura creativa y roleplay, tareas para las que los benchmarks estándar (MMLU, HumanEval, GSM8K) son poco representativos; tampoco se incluyen evaluaciones tipo Arena, EQ-Bench ni creative writing benchmarks en la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según quant, sin contar KV cache):
  - Q2_K: ~14,8 GB
  - Q3_K_M: ~19,2 GB
  - IQ4_XS: ~21,6 GB
  - Q4_K_M: ~24,3 GB
  - Q5_K_M: ~28,4 GB
  - Q6_K: ~32,8 GB
  - Q8_0: ~42,5 GB
- **GPU recomendadas**: RTX 4090 (24 GB) para Q2_K–Q3_K_L con descarga parcial en CPU; RTX 5090 (32 GB) o 2× RTX 3090/4090 para Q4_K_S–Q5_K_M; A100 40 GB, A100 80 GB o H100 para Q6_K y Q8_0 completos en GPU.
- **Consumer GPU**: cabe en una RTX 4090 de 24 GB con las quants Q2_K, Q3_K_S, Q3_K_M y Q3_K_L; la IQ4_XS (21,6 GB) cabe teóricamente en 24 GB pero deja poco margen para el KV cache. Con RAM de sistema suficiente (32–64 GB), cualquier quant funciona en modo híbrido GPU+CPU con penalización de velocidad.
- **Despliegue**: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp (muy usado en roleplay), text-generation-webui. Para servir en producción, llama.cpp server o soluciones basadas en vLLM con el modelo original en safetensors.
- **Latencia y throughput**: no disponible; al ser un MoE de ~39,8B totales, el rendimiento dependerá del número de parámetros activos por token, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| flint-roleplay-antislop (este) | ~39,8B | MoE | GGUF, safetensors (bf16) | Apache 2.0 | Roleplay y escritura creativa, entrenamiento antislop |
| Mistral Small 3.x (24B) | ~24B | Transformer denso | GGUF, safetensors | Apache 2.0 | Generalista con buen rendimiento creativo |
| Qwen3-30B-A3B | 30,5B (3,3B activos) | MoE | GGUF, safetensors | Apache 2.0 | Generalista, alta eficiencia por token |
| Command R (35B, Cohere) | ~35B | Transformer denso | safetensors | CC-BY-NC (no comercial) | Generalista, RAG y conversación |

La ventaja diferencial de flint-roleplay-antislop frente a alternativas de tamaño similar es su especialización en roleplay con entrenamiento antislop y su licencia plenamente comercial; el inconveniente es la ausencia de datos públicos de rendimiento y su orientación exclusiva al inglés.

## Limitaciones y advertencias

- **Idioma**: el modelo está etiquetado solo para inglés; su comportamiento en castellano u otros idiomas no está documentado y puede ser deficiente.
- **Contexto**: la longitud de ventana de contexto no está publicada; debe verificarse en la configuración del modelo base antes de planificar sesiones largas de roleplay.
- **Alucinaciones**: al tratarse de un modelo especializado en escritura creativa, es propenso a inventar contenido narrativo de forma deliberada; no es adecuado para tareas que exijan factualidad sin verificación.
- **Cuants de baja calidad**: las quants Q2_K y Q3_K_S/M pueden degradar notablemente la calidad estilística, que es precisamente el valor diferencial del modelo; la model card recomienda Q4_K_S/Q4_K_M como punto de partida y Q8_0 para máxima calidad.
- **Sesgos**: no hay documentación específica sobre sesgos; como todo LLM entrenado con datos web, puede reproducir estereotipos, especialmente en contenido de roleplay.
- **Contenido**: los modelos de roleplay sin alineación intensiva pueden generar contenido sensible; el usuario es responsable del uso y del cumplimiento normativo aplicable.
- **Licencia**: Apache 2.0 no impone restricciones comerciales relevantes, pero conviene verificar la licencia del modelo base original (`rawmodels/flint-roleplay-antislop`), que aquí se hereda.
- **Datos técnicos incompletos**: número de expertos activos, contexto y benchmarks no publicados, lo que dificulta la planificación de capacidad en producción.

## Enlaces

- Repositorio GGUF estático: https://huggingface.co/mradermacher/flint-roleplay-antislop-GGUF
- Modelo base original: https://huggingface.co/rawmodels/flint-roleplay-antislop
- Cuants imatrix ponderados: https://huggingface.co/mradermacher/flint-roleplay-antislop-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#flint-roleplay-antislop-GGUF
- Guía de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre calidad de quants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
