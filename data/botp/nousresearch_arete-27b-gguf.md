# botp/NousResearch_Arete-27B-GGUF

## Resumen

Arete-27B es un modelo de lenguaje de 27.000 millones de parámetros desarrollado por NousResearch mediante post-entrenamiento supervisado (SFT) sobre una base Qwen3.8-27B de Alibaba. Su objetivo declarado es reforzar valores occidentales en un modelo originalmente entrenado con datos chinos, y el equipo publicó una evaluación de 803 prompts distribuidos en siete categorías de valores para medir el cambio. La ficha que nos ocupa es la cuantización GGUF realizada por el usuario `botp` (con el trabajo de cuantización atribuido a bartowski en la model card) a partir del checkpoint original `NousResearch/Arete-27B`, usando llama.cpp build b12174 con imatrix.

El modelo es multimodal de entrada (texto e imagen mediante fichero `mmproj`), con pipeline `image-text-to-text`, licencia Apache 2.0 y un formato de prompt compatible con ChatML (`<|im_start|>`) que incluye un modo de razonamiento explícito (`<think>`) y un bloque de esfuerzo de razonamiento configurable (`Reasoning effort is set to xhigh`). No es un modelo MoE: los 26.895.998.464 parámetros del checkpoint safetensors son todos activos.

La relevancia de esta ficha es doble: por un lado, documenta la disponibilidad de un modelo afinado por valores en formato GGUF listo para llama.cpp; por otro, advierte de que la información pública sobre arquitectura interna, contexto, datos de entrenamiento y benchmarks es muy escasa, por lo que muchas especificaciones quedan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredera de Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S (y otras variantes de la escalera GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero `mmproj` separado para visión); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible indica que Arete-27B parte de Alibaba Qwen3.8-27B y se somete a un post-entrenamiento supervisado (SFT) orientado a alineación de valores, usando el dataset `NousResearch/arete-data-pairs`. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La model card de la cuantización tampoco detalla la arquitectura interna (número de capas, atención, cabezas, tipo de positional encoding), por lo que no es posible confirmar si emplea atención lineal, decodificación especulativa u otras innovaciones: de hecho, la propia model card indica explícitamente "Speculative decoding: no".

El proceso de cuantización sí está documentado: se usó llama.cpp release b12174 con imatrix, lo que implica que las matrices de importancia se calcularon sobre un corpus de calibración para preservar mejor los pesos sensibles. El resultado son múltiples ficheros GGUF con distintos niveles de compresión, desde bf16 (53,81 GB) hasta Q4_K_S (16,12 GB). El prompt format incluye instrucciones de sistema para fijar el esfuerzo de razonamiento y un bloque `<think>` que el modelo debe abrir antes de responder, lo que sugiere un entrenamiento orientado a razonamiento explícito.

## Capacidades

- Generación de texto conversacional multi-turno con formato ChatML.
- Razonamiento explícito mediante bloque `<think>` y control de esfuerzo de razonamiento vía system prompt.
- Entrada multimodal de imagen (requiere fichero `mmproj` adicional en la cuantización GGUF).
- Tool calling / function calling con formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`).
- Soporte de agentes y razonamiento multi-paso, con instrucciones explícitas para encadenar llamadas a funciones.
- Capacidades multilingües: no confirmadas en la información disponible.
- Alineación de valores orientada a valores occidentales, según la evaluación publicada por NousResearch.

## Casos de uso

- Asistentes conversacionales con razonamiento visible: el bloque `<think>` permite auditar el proceso de razonamiento antes de la respuesta final, útil en entornos donde se requiere trazabilidad de decisiones.
- Automatización de agentes con tool calling: el formato XML documentado permite integrar el modelo en orquestadores que parsean `<tool_call>` para ejecutar funciones externas (consultas a APIs, bases de datos, etc.).
- Análisis de documentos con imagen: al soportar entrada image-text-to-text con `mmproj`, puede emplearse para extraer información de capturas, diagramas o formularios escaneados junto a texto.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (17,20 GB) y Q4_K_S (16,12 GB) permiten ejecución local en GPUs con 24 GB de VRAM, útil para prototipado y entornos sin cloud.
- Evaluación de alineación de valores: el modelo sirve como caso de estudio para investigadores que analizan cómo el post-entrenamiento SFT modifica el comportamiento en categorías de valores, con la evaluación de 803 prompts publicada por NousResearch como referencia.
- Generación de código y tareas técnicas con razonamiento: aunque no hay benchmarks públicos, el modo de razonamiento extendido y el soporte de tool calling lo hacen candidato para pipelines de asistencia a programación, con validación empírica previa por parte del equipo.
- Investigación sobre cuantización: la escalera completa de GGUF con imatrix permite estudiar la degradación de calidad entre niveles (bf16, Q8_0, Q6_K, Q5_K, Q4_K) en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única evaluación mencionada es la de NousResearch sobre 803 prompts en siete categorías de valores, pero no se proporcionan las puntuaciones numéricas en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead de contexto. Q4_K_M (17,20 GB) requiere ~18-20 GB; Q5_K_M (20,68 GB) ~22-24 GB; Q6_K (23,62 GB) ~25-27 GB; Q8_0 (28,67 GB) ~30-32 GB; bf16 (53,81 GB) ~56-60 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; RTX 3090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q6_K, Q8_0 y bf16; configuraciones multi-GPU para bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y GPUs con 24 GB o más usando cuantizaciones Q4. Para 16 GB de VRAM, Q4_K_S (16,12 GB) queda muy justo y puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp (versión b12174 o superior, usada para la cuantización), Ollama, LM Studio y cualquier runtime compatible con GGUF. No se menciona soporte nativo en vLLM o TGI para estos ficheros.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B (esta ficha) | 26,9B | no disponible | Apache 2.0 | GGUF, safetensors | Post-entrenamiento SFT sobre Qwen3.8-27B con alineación de valores |
| Qwen3.8-27B (base) | ~27B | no disponible | según modelo original | safetensors | Modelo base sin el post-entrenamiento de valores de NousResearch |
| Alternativas de ~27B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificados de modelos comparables en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no está disponible: no se han publicado benchmarks del modelo ni se han identificado en la búsqueda modelos directamente comparables con datos verificables.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo ha sido post-entrenado explícitamente para reforzar valores occidentales, lo que introduce un sesgo direccional deliberado que puede afectar a respuestas sobre temas culturales, políticos o sociales.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; como todo modelo generativo de 27B, puede producir contenido plausible pero incorrecto, especialmente en el modo de razonamiento extendido.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información disponible, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B y las condiciones del dataset `NousResearch/arete-data-pairs`.
- Caveat de producción: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-07), por lo que no hay evidencia de validación comunitaria. El tamaño del repo (440 GB) incluye todos los splits y cuantizaciones.
- La model card de la cuantización está atribuida a bartowski pero alojada bajo el usuario `botp`; conviene confirmar la procedencia antes de desplegar en producción.
- El formato de tool calling es específico (XML anidado) y requiere un parser adaptado; no es compatible directamente con el formato OpenAI de function calling sin transformación.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/botp/NousResearch_Arete-27B-GGUF
- Cuantización original de bartowski: https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Página de NousResearch sobre Arete-27B: https://nousresearch.com/arete
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- llama.cpp (release b12174): https://github.com/ggml-org/llama.cpp/releases/tag/b12174
