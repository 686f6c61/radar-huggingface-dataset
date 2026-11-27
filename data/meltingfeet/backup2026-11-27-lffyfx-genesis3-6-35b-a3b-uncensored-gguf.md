# meltingfeet/Backup2026-11-27-Lffyfx-Genesis3.6-35B-A3B-Uncensored-GGUF

## Resumen

Genesis3.6-35B-A3B-Uncensored es una cuantización GGUF publicada por el usuario meltingfeet a partir del modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, que a su vez deriva de la familia Qwen3.6. Se trata de un modelo de mezcla de expertos (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, disenado para generación de texto conversacional, razonamiento y tareas multimodales (image-text-to-text) sin restricciones de contenido.

El autor presenta el llamado algoritmo Genesis, descrito como un procedimiento de "reparación" numérica de tensores en formato GGUF mediante SVD personalizado, orientado a corregir ruido de entrenamiento, desajustes de escala y bloques degenerados sin reentrenar. Adicionalmente, el autor indica haber transferido datos de un finetune sobre el dataset Hermes (NousResearch/hermes-function-calling-v1) desde DJLougen/hermes-qwen3.5-35b-a3b-GGUF, afectando a unos 2.000 bloques de dos tensores de expertos FFN.

Es relevante ahora por su combinación de contexto nativo de 262K tokens (extensible a 1M con YaRN), arquitectura híbrida con atención lineal Gated DeltaNet, soporte multimodal y licencia Apache 2.0. No obstante, conviene tratar con cautela las afirmaciones sobre el algoritmo Genesis, ya que no se aportan evaluaciones independientes ni resultados de benchmarks verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: Gated DeltaNet (atención lineal) + atención softmax completa en proporción 3:1; 40 capas con patrón 10 × (3 × DeltaNet-MoE + 1 × Attention-MoE) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | ~3B por forward pass (MoE: 256 expertos, 8 enrutados + 1 compartido por token) |
| Longitud de contexto | 262K nativo; extensible a 1M con YaRN |
| Tipos de cuantizacion | GGUF (se menciona explícitamente MXFP4; el resto de variantes no disponible) |
| Idiomas soportados | en, zh, multilingual (la model card cita 201 idiomas y vocabulario de 248K) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 58,4 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE híbrida con 40 capas organizadas en un patrón repetido de tres bloques DeltaNet-MoE seguidos de un bloque de atención softmax completa. La atención lineal Gated DeltaNet reduce el coste computacional en contextos largos, mientras que los bloques de atención completa preservan la capacidad de recuperación exacta. Cada token activa 8 de 256 expertos más un experto compartido, lo que mantiene el coste de inferencia en torno a los 3.000 millones de parámetros activos. Incluye soporte de multi-token prediction (MTP) y es nativamente multimodal (texto, imagen y vídeo).

Sobre el entrenamiento original del modelo base no se proporcionan datos en la información disponible (número de tokens, composición del dataset, fases de RLHF/DPO). El autor de esta cuantización describe un post-procesado propio denominado Genesis, que afirma aplicar SVD personalizado sobre tensores ssm_conv1d y sobre el resto de tensores (excluyendo token_embd.weight, output.weight, ffn_gate_inp_shexp.weight, tensores 1D, biases y normas), además de transferir bloques de un finetune Hermes. Estas afirmaciones no están respaldadas por evaluaciones publicadas ni por documentación técnica revisada.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (262K tokens nativos).
- Razonamiento y matemáticas (capacidad heredada de la familia Qwen3.6; sin benchmarks publicados en esta ficha).
- Generación de código y soporte de tool calling / function calling (el autor cita el dataset hermes-function-calling-v1 como fuente del finetune transferido).
- Capacidades multimodales: entrada de imagen y vídeo junto con texto (pipeline image-text-to-text).
- Soporte multilingüe amplio (en, zh y multilingüe; la model card menciona 201 idiomas).
- Modo "uncensored": ausencia declarada de restricciones de contenido en las respuestas.
- Compatibilidad con agentes y razonamiento multi-paso (etiqueta conversational y endpoints_compatible; sin evaluación específica disponible).
- Soporte de multi-token prediction (MTP) según la model card.

## Casos de uso

- Asistente conversacional de contexto largo: con 262K tokens nativos puede mantener conversaciones extensas o procesar documentos completos sin truncar, útil en atención al cliente con historial prolongado.
- Análisis de documentos e imágenes combinados: al ser image-text-to-text, permite extraer información de capturas, diagramas o vídeos junto a texto de referencia en un mismo prompt.
- Automatización de agentes con tool calling: el finetune sobre hermes-function-calling-v1 lo hace adecuado para pipelines donde el modelo debe invocar funciones externas y encadenar pasos.
- Generación de código en entornos locales: su tamaño activo (~3B) permite ejecución en GPU de consumo con cuantización MXFP4, integrándose en asistentes de IDE o scripts de automatización.
- Procesamiento multilingüe: con soporte declarado para 201 idiomas, sirve para traducción, resumen o atención en idiomas distintos del inglés y el chino.
- Investigación sobre estabilidad de modelos: el interés del autor por el "ruido" en tensores y su algoritmo Genesis lo convierte en un caso de estudio para quienes investigan post-procesado numérico de pesos.
- Despliegue en hardware limitado: con 12 GB de VRAM (RTX 3060) y la configuración recomendada por el autor se reportan 35-47 tokens por segundo con cuantización MXFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una cifra de throughput en LM Studio sobre RTX 3060 12 GB con cuantización MXFP4: 35-47 tokens por segundo, con contexto de 65.536 tokens y MoE Expert Cache de 6.500 MiB.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el autor reporta funcionamiento en RTX 3060 de 12 GB con cuantización MXFP4 y MoE Expert Cache de 6.500 MiB.
- GPU recomendadas: no disponible; el autor solo menciona RTX 3060 12 GB y el entorno de desarrollo en Tesla T4 (Google Colab Free) para el post-procesado.
- GPU de consumo: sí, según el autor, en RTX 3060 12 GB con la configuración indicada (offload máximo, capas MoE forzadas a CPU, caché K/V en Q8_0 o F16, contexto 65.536, seed 42 o 0).
- Opciones de despliegue: llama.cpp, LM Studio, koboldcpp y otros runtimes compatibles con GGUF.
- Latencia y throughput: 35-47 tokens por segundo en RTX 3060 12 GB con MXFP4 según el autor; sin datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Genesis3.6-35B-A3B-Uncensored (esta ficha) | ~35B totales / ~3B activos | 262K (1M con YaRN) | Apache 2.0 | GGUF | Multimodal, MoE híbrido, post-procesado Genesis |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | ~35B totales / ~3B activos | no disponible | no disponible | no disponible | Modelo base directo de esta cuantización |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF | ~35B totales / ~3B activos | no disponible | no disponible | GGUF | Finetune Hermes usado como fuente de bloques FFN |
| Qwen3.6-35B-A3B (familia original) | ~35B totales / ~3B activos | 262K | no disponible | no disponible | Arquitectura de referencia; sin datos de benchmarks en esta ficha |

## Limitaciones y advertencias

- Las afirmaciones sobre el algoritmo Genesis (reparación de ruido, SVD personalizado, mejora de estabilidad) no están respaldadas por evaluaciones independientes ni por resultados de benchmarks publicados.
- El modelo es "uncensored": no aplica filtros de contenido, lo que implica riesgo de generar material dañino, sesgado o inapropiado en producción.
- Riesgo de alucinación no cuantificado; la propia model card reconoce que el ruido de entrenamiento puede aumentar la verbosidad y las alucinaciones en modelos no tratados, sin aportar métricas del resultado final.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-27), lo que impide validar su comportamiento en uso real.
- El autor declara haber abandonado el desarrollo de LLM para generación de texto tras este lanzamiento, por lo que no cabe esperar mantenimiento ni correcciones.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la cadena de licencias del modelo base y del finetune Hermes, cuyos términos no se detallan en la información disponible.
- El rendimiento en contextos de 1M tokens con YaRN no está verificado; solo se menciona como capacidad teórica.
- Los idiomas distintos de en y zh se declaran como "multilingual" sin evaluación específica.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/meltingfeet/Backup2026-11-27-Lffyfx-Genesis3.6-35B-A3B-Uncensored-GGUF)
- [Modelo base: HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive](https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive)
- [Finetune Hermes: DJLougen/hermes-qwen3.5-35b-a3b-GGUF](https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF)
- [Dataset: NousResearch/hermes-function-calling-v1](https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1)
- [Chat template recomendada](https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates/raw/main/archive/qwen3.6/chat_template-v19.jinja)
- [Discord del autor](https://discord.gg/SZ5vacTXYf)
- Paper citado en los tags (arxiv:2605.29843): no disponible en la información proporcionada.
