# saidutta69/Qwen3.5-4B-heretic

## Resumen

Qwen3.5-4B-heretic es una variante "decensored" (abliterated) del modelo multimodal Qwen/Qwen3.5-4B de Alibaba Qwen, publicada por el usuario saidutta69 en Hugging Face. Se trata de un modelo híbrido visión-lenguaje de 4.539.265.536 parámetros (4,54B): 4.205.751.296 corresponden a la torre de lenguaje y 333.514.240 al codificador de visión. La arquitectura combina 32 capas organizadas en 8 bloques de (3 capas gated DeltaNet + 1 capa de atención con compuerta), con un contexto nativo de 262.144 tokens y un vocabulario de 248.320 entradas con embeddings atados.

El modelo no introduce capacidades nuevas: su propósito es eliminar el comportamiento de rechazo del modelo base manteniendo el resto de competencias. Para ello se aplicó Heretic 2.0.0.dev0 con Arbitrary-Rank Ablation (ARA) sobre las capas 15 a 27 de la torre de lenguaje, dejando intacto el codificador de visión. El resultado declarado es una caída de rechazos de 99/100 a 13/100 con una divergencia KL de 0,0081 respecto al original, y variaciones en benchmarks de texto dentro del margen de error estadístico.

Su relevancia práctica es doble: por un lado, ofrece un checkpoint de 4,5B con contexto muy largo y capacidades agénticas que cabe en GPUs de consumo; por otro, documenta de forma reproducible el proceso de abliteración (receta, semilla y journal de Optuna incluidos en el repositorio), lo que lo convierte en material útil para investigación sobre alineación y edición de comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida visión-lenguaje: 32 capas en 8 bloques de (3 gated DeltaNet + 1 gated-attention), más torre de visión; cabeza MTP adicional en la conversión GGUF |
| Parametros totales | 4.539.265.536 (4,54B): 4.205.751.296 torre de lenguaje + 333.514.240 codificador de visión |
| Parametros activos | No aplica: la model card no describe el modelo como MoE ni publica desglose de parámetros activos |
| Longitud de contexto | 262.144 tokens (nativo, confirmado en los metadatos del GGUF) |
| Tipos de cuantizacion | BF16 (safetensors); GGUF F16, Q4_K_M, Q5_K_M, Q6_K y Q8_0 |
| Idiomas soportados | 16 declarados: en, zh, ar, de, es, fr, it, ja, ko, pt, ru, hi, id, th, tr, vi; la card del modelo base cita 201 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 2 shards de 4,54 GB) y GGUF (solo texto) |
| Vocabulario | 248.320 tokens, embeddings atados |
| Tamano del repo | 31,3 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido en el que la mayoría de capas usan atención lineal de tipo gated DeltaNet y solo una de cada cuatro emplea atención completa con compuerta (8 capas de atención sobre 32 totales). Esa proporción 3:1 es la que permite sostener 262.144 tokens de contexto sin un coste cuadrático en todas las capas. El modelo es unificado visión-lenguaje: el codificador visual de 333.514.240 parámetros se procesa junto al texto mediante `AutoProcessor` y `AutoModelForImageTextToText`. La conversión a GGUF sin la bandera `--mmproj` descarta la torre de visión, de ahí que todos los ficheros GGUF publicados sean exclusivamente de texto.

Sobre el entrenamiento original (número de tokens, composición del dataset, fases de RLHF/DPO) no se aporta información en la documentación disponible: la model card remite al modelo base y solo advierte de que la tabla de benchmarks oficial de Qwen está publicada como imagen. La innovación documentada de esta variante es el método de edición: Heretic 2.0.0.dev0 con Arbitrary-Rank Ablation, que en lugar de orthogonalizar las salidas contra una única dirección de rechazo, aprende un subespacio de bajo rango sobre un rango de capas y combina un objetivo de "preservar buen comportamiento" con otro de "dirigir mal comportamiento". Los hiperparámetros del trial 162 (semilla 982272333) son: capas 15-27, `preserve_good_behavior_weight` 0,9900, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 0,8230 y `neighbor_count` 15. El repositorio incluye un directorio `reproduce/` con `config.toml`, `requirements.txt`, el journal del estudio de Optuna y sumas SHA-256.

## Capacidades

- Generación de texto conversacional y razonamiento general, con contexto nativo de 262.144 tokens.
- Entrada de imagen y vídeo (solo con los safetensors BF16 y `AutoProcessor`; no disponible en los GGUF).
- Tool calling y function calling, orientado a flujos agénticos según los propios tags del repositorio (`agentic`, `tool-calling`, `endpoints_compatible`).
- Razonamiento multi-paso y uso como agente local, con soporte declarado para despliegue en endpoints compatibles.
- Capacidad multilingüe: 16 idiomas declarados en la card y 201 atribuidos al modelo base.
- Comportamiento sin rechazos en la práctica totalidad de los prompts evaluados (13/100 frentes a 99/100 del original).
- Inferencia en CPU y GPU de consumo gracias a las cuantizaciones GGUF Q4_K_M (2,71 GB) y Q5_K_M (3,07 GB).
- Cabeza MTP (multi-token prediction) presente en la conversión GGUF (33 bloques: 32 capas + 1 cabeza MTP); su uso efectivo para decodificación especulativa no se documenta en la información disponible.
- Modo "thinking" explícito: no disponible en la documentación.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto se pueden mantener conversaciones multi-turno muy largas o inyectar historiales completos de tickets sin truncar, algo inviable en modelos de 4B con ventanas de 8K-32K.
- RAG documental multilingüe: el modelo cubre 16 idiomas declarados y permite indexar y consultar corpus en varios idiomas dentro de la misma ventana; las cuantizaciones Q4_K_M/Q5_K_M permiten desplegarlo en una sola GPU de consumo junto al índice vectorial.
- Agentes locales con tool calling: integrable en pipelines de automatización (consulta de APIs, ejecución de comandos, extracción de datos) usando llama.cpp u Ollama en estaciones de trabajo sin conexión a la nube.
- Procesamiento de documentos escaneados y capturas: con los safetensors BF16 se puede enviar una imagen junto al prompt para extraer tablas, describir diagramas o transcribir formularios, siempre que se disponga de ~12 GB o más de VRAM.
- Asistente de desarrollo ligero: generación y explicación de scripts, revisión de diffs y redacción de tests en local, aprovechando el contexto largo para cargar varios ficheros de un repositorio pequeño en una sola pasada.
- Traducción y localización: traducción entre los idiomas declarados (es, en, zh, ar, de, fr, it, ja, ko, pt, ru, hi, id, th, tr, vi) con un único checkpoint, útil para pipelines de localización de bajo coste.
- Investigación sobre alineación y edición de modelos: la receta reproducible (semilla, journal de Optuna, sumas SHA-256) permite replicar el experimento ARA y medir el compromiso entre eliminación de rechazos y deriva del modelo (KL 0,0081).
- Evaluación comparativa de robustez: al mantener MMLU y PIQA prácticamente idénticos al original, sirve como control para estudiar qué capacidades se ven afectadas por la abliteración y cuáles no.

## Benchmarks y rendimiento

Resultados declarados por el autor, medidos con `lm-eval` en el mismo entorno para este checkpoint y para el modelo original:

| Benchmark | Este modelo | Modelo original | stderr (este / original) |
|---|---|---|---|
| MMLU | 74,35 % | 74,29 % | 0,35 / 0,35 pp |
| PIQA | 77,48 % | 77,37 % | 0,97 / 0,98 pp |
| PIQA (norm) | 77,97 % | 78,29 % | 0,97 / 0,96 pp |
| WinoGrande | 69,22 % | 69,77 % | 1,30 / 1,29 pp |

| Métrica de comportamiento | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 13/100 | 99/100 |
| Divergencia KL | 0,0081 | 0 (por definición) |

Todas las diferencias en benchmarks de texto caen dentro de aproximadamente un error estándar; la mayor es WinoGrande con -0,55 pp. El autor advierte de que estas pruebas son solo de texto y no ejercitan la torre de visión, y que la tabla oficial del modelo base está publicada como imagen, por lo que solo se citan los valores re-ejecutados aquí. No se han publicado resultados de benchmarks de visión, de tool calling ni de contexto largo en la información disponible.

## Requisitos de hardware

- VRAM estimada para BF16 (safetensors para imagen/vídeo): los pesos suman 9,08 GB repartidos en dos shards; con activaciones y caché KV se necesitan aproximadamente 12-14 GB, por lo que encaja en RTX 4090 (24 GB), A100 40/80 GB o L40S.
- VRAM estimada para GGUF Q8_0 (4,48 GB): en torno a 6 GB; viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB.
- VRAM estimada para GGUF Q6_K (3,46 GB): aproximadamente 5 GB.
- VRAM estimada para GGUF Q5_K_M (3,07 GB): aproximadamente 4,5 GB.
- VRAM estimada para GGUF Q4_K_M (2,71 GB): aproximadamente 4 GB; cabe en RTX 3060 12 GB, RTX 4060 8 GB y en muchas iGPU con memoria unificada.
- Ejecución solo en CPU: viable con Q4_K_M/Q5_K_M mediante llama.cpp; no se publican cifras de tokens por segundo.
- Caché KV a contexto completo: no disponible. Con 262.144 tokens de ventana, el coste de caché puede superar la VRAM de una GPU de consumo, por lo que conviene limitar `num_ctx` en la práctica.
- Opciones de despliegue documentadas: llama.cpp (`llama serve -hf saidutta69/Qwen3.5-4B-heretic`), LM Studio, Ollama (arquitectura `qwen35`, requiere una versión actual de llama.cpp) y transformers con `AutoModelForCausalLM` (texto) o `AutoModelForImageTextToText` (imagen y vídeo). Soporte en vLLM o TGI: no documentado.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic (este) | 4,54B (4,21B LM + 0,33B visión) | 262.144 | Texto + imagen + vídeo (BF16); solo texto en GGUF | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B (base) | 4,54B | 262.144 | Texto + imagen + vídeo | Apache 2.0 | Hugging Face (oficial) |
| MiniCPM-V-4.7-1B-heretic (mismo autor) | ~1B (según denominación) | No disponible | Multimodal (por denominación del modelo) | No disponible | Hugging Face |
| Qwen3-4B-Thinking-heretic-GGUF (mradermacher) | ~4B (según denominación) | No disponible | Solo texto (GGUF) | No disponible | Hugging Face |

Frente al modelo base, la diferencia medible es la tasa de rechazos (13/100 frente a 99/100) con un coste de calidad dentro del ruido estadístico y una KL de 0,0081. Frente a las alternativas abliteradas de 4B, la ventaja es la modalidad visual y el contexto de 262K, aunque no hay datos públicos que permitan comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Modelo deliberadamente "decensored": se han eliminado los rechazos, por lo que no aplica ninguna barrera de seguridad del modelo base. No es adecuado para aplicaciones de cara al público sin un filtro de contenido externo.
- Riesgo de alucinación propio de un modelo de 4B, agravado por la edición: la divergencia KL de 0,0081 implica cambios acotados pero reales en formulación y formato.
- Los GGUF son solo de texto: la conversión descarta la torre de visión porque se ejecutó sin `--mmproj`. Para imagen o vídeo hay que usar los safetensors BF16, con el consiguiente coste de VRAM.
- No hay benchmarks publicados de visión, tool calling, contexto largo ni multilingüismo; las únicas métricas re-ejecutadas son MMLU, PIQA y WinoGrande en inglés.
- No se documenta el proceso de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO), por lo que no es posible auditar qué datos hay detrás.
- La evaluación de rechazos se hizo sobre 100 prompts sin que se detalle la metodología ni el conjunto; la cifra 13/100 debe tomarse como indicativa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un checkpoint de comunidad sin validación externa, con fecha de creación y actualización del 28 de octubre de 2026.
- El identificador de arquitectura GGUF es `qwen35`, lo que exige versiones recientes de llama.cpp, LM Studio u Ollama; versiones antiguas fallarán al cargar.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin rechazos.
- Idioma: aunque se declaran 16 idiomas, no hay métricas de calidad por idioma; el castellano no está evaluado en los benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/Qwen3.5-4B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Repositorio de Heretic (método ARA): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- MiniCPM-V-4.7-1B-heretic, del mismo autor: https://huggingface.co/saidutta69/MiniCPM-V-4.7-1B-heretic
- Qwen3-4B-Thinking-heretic-GGUF (mradermacher): https://huggingface.co/mradermacher/Qwen3-4B-Thinking-heretic-GGUF
- Listado de modelos etiquetados `local-llm` (contexto de la colección): https://huggingface.co/models?other=local-llm&p=18&sort=trending
- Catálogo de modelos multimodales en Featherless: https://featherless.ai/models?capabilities=multimodal
- Catálogo de modelos abiertos y sin censura en DemonRoute: https://demonroute.com/models
