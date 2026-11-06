# jakeatx/qwen3.8-flash-next-Swift1.5-ATX-AI3

## Resumen

`jakeatx/qwen3.8-flash-next-Swift1.5-ATX-AI3` es una cuantización GGUF de un modelo derivado de Qwen3.8-Flash-Next, publicada por el usuario jakeatx bajo el paraguas de su proyecto llamAmpere. El modelo base es `ukisai/Swift1.5-Qwen3.8-Flash-Next`, un ajuste (presumiblemente fine-tuning o merge) sobre el Qwen3.8-Flash-Next original de QwenLM, que según la documentación pública es un modelo MoE multimodal y un avance de la arquitectura que se usará en Qwen4, con diseño híbrido Gated DeltaNet + Gated Attention.

El interés de esta ficha no está en el modelo en sí (que es una variante no oficial de un modelo de Qwen), sino en el formato de pesos propietario "AI+" que introduce el autor para tarjetas RTX 30-series. Se trata de una cuantización mixta que combina un esquema de escala por fila para los expertos con la receta UD de Unsloth para los pesos siempre activos (atención QSA, experto compartido, cabeza de salida y embeddings). El resultado son 3,242 bits por peso efectivos en las matrices calculadas en tarjeta, con un tamaño total de descarga de 80,11 GB.

El modelo requiere un fork específico de llama.cpp, llamado llamAmpere v0.6.3 o superior, y no carga en llama.cpp estándar. Incorpora decodificación especulativa mediante un drafter MTP separado (1,52 GB) y está pensado para ejecutarse en una única GPU de 24 GB (RTX 3090) o, con limitaciones, en tarjetas de 12 GB, apoyándose en RAM del sistema (64 GB recomendados) para los expertos que no caben en VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida Gated DeltaNet + Gated Attention (arquitectura Qwen3.8-Flash-Next), con MTP para decodificación especulativa |
| Parametros totales | 176.943.899.520 (aproximadamente 177 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pases de prompt de 32K tokens en tarjetas de menos de 24 GB, y pruebas con prompts de 100K tokens) |
| Tipos de cuantizacion | GGUF con formato propietario AI+ (3,242 bits por peso en tensores calculados en tarjeta); drafter en GSQ-RCO-Q2S-B |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF dividido en dos shards (00001-of-00002 y 00002-of-00002) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-Flash-Next: un modelo MoE multimodal con diseño híbrido de Gated DeltaNet y Gated Attention, que QwenLM presenta como avance de la arquitectura de Qwen4. Según el repositorio oficial de QwenLM, el diseño híbrido ya se introdujo en Qwen3-Next y se mantiene aquí. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

Lo relevante técnicamente de esta publicación es el proceso de cuantización. El autor aplica su receta "AI+": escala por fila para los expertos (row-scale AI+ experts) y la receta UD de Unsloth para los pesos siempre activos. Los expertos se reparten entre la caché de la tarjeta y la RAM del sistema, de modo que el dato de 3,242 bits por peso no implica que todos los pesos quepan en VRAM. La tabla de embeddings por capa ocupa 27.465,95 MiB en RAM, la tabla de embeddings de tokens 497,31 MiB y la tabla del drafter 260,50 MiB. El modelo incorpora decodificación especulativa mediante un drafter MTP independiente, con anchos de borrador de 3 y 4 tokens por ronda.

## Capacidades

- Generación de texto conversacional y de código, con soporte para tareas de tipo agentic y RAG según las pruebas del autor.
- Decodificación especulativa mediante drafter MTP separado, con 3,365 a 3,970 tokens generados por ronda según la tarea.
- Soporte de API compatible con OpenAI a través de `llama-server` del fork llamAmpere.
- Modo "exact" en el script de lanzamiento que desactiva el borrador sesgado por modo, para reproducibilidad.
- Capacidades multimodales heredadas del modelo base Qwen3.8-Flash-Next (según la descripción de QwenLM), aunque no se detallan en la model card de esta cuantización.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en una RTX 3090 de 24 GB: el caso de uso principal declarado por el autor. El modelo está calibrado para caber en una única tarjeta de 24 GB con 64 GB de RAM, repartiendo expertos entre VRAM y RAM del sistema, lo que permite ejecutar un modelo de ~177 mil millones de parámetros en hardware de consumo.
- Generación de código en local: las pruebas del autor reportan 121,32 tok/s en tareas de coding con prompts de 100K tokens, lo que lo hace viable para asistentes de código autoalojados con contexto largo.
- Flujos agentic multi-paso: 124,89 tok/s en tareas agentic según las pruebas del autor, adecuado para pipelines de agentes que requieren muchas llamadas cortas y contexto persistente.
- RAG sobre documentación extensa: 124,26 tok/s en tareas RAG con prompts de 100K tokens, útil para sistemas de pregunta-respuesta sobre corpus grandes que necesitan ventanas de contexto amplias.
- Despliegue con API compatible con OpenAI: el servidor `llama-server` expone un endpoint compatible, lo que permite integrarlo como backend en aplicaciones existentes que ya consumen la API de OpenAI sin cambios de código.
- Investigación en cuantización: el formato AI+ y las métricas KLD publicadas (0,086541 frente a 0,1744 del IQ3_XXS estándar) lo convierten en un caso de estudio para quienes investigan técnicas de cuantización mixta y reparto de expertos entre VRAM y RAM.
- Reproducción de benchmarks de velocidad en hardware consumer: el autor publica metodología detallada (pares, p-valores, ms/ronda), lo que permite replicar las mediciones en tarjetas RTX 30-series.

## Benchmarks y rendimiento

Calidad (KLD contra referencia de 8 bits, menor es mejor; 2.286 posiciones en 18 chunks):

| Modelo | Tamano | KLD |
|---|---|---|
| Este modelo | 80,11 GB | 0,086541 |
| IQ3_XXS (archivo estandar) | 75,97 GB | 0,1744 / 0,1753 (historico, otra build) |
| Swift IQ3_XXS con mapa UD publicado | no disponible | 0,118003 (build antigua) |

Velocidad (prompt de 100K tokens, 5.120 tokens escritos, temperatura 1.0, 350 W, RTX 3090 de 24 GB con RAM amplia):

| Tarea | Escritura tok/s (Strata v0.2.11 -> este modelo) | ms/ronda por ancho de borrador | tok/ronda | Prompt tok/s |
|---|---|---|---|---|
| Coding (6 pares) | 109,63 -> 121,32 (+10,66%, p=0,001161) | w3: 26,05 / w4: 29,61 | 3,365 | 3294,05 -> 2944,23 |
| Agentic (3 pares) | 108,23 -> 124,89 (+15,39%, p=0,01115) | w3: 28,11 / w4: 32,49 | 3,970 | 3262,80 -> 2931,60 |
| RAG (6 pares) | 114,73 -> 124,26 (+8,33%, p=0,01223) | w3: 27,96 / w4: 31,85 | 3,846 | 3265,88 -> 2878,55 |

El autor advierte que las comparaciones de velocidad son entre productos con distinta calidad y ajustes de borrador, que las p-valores no están ajustados por comparaciones múltiples y que la lectura de prompt es más lenta en las tres tareas. Las 45 respuestas cronometradas completaron 5.120 tokens con el pico de tarjeta por debajo de 23.552 MiB. En una máquina doméstica real con 64 GB de RAM y una RTX 3090 Ti de 24 GB, las comprobaciones de ajuste se completaron a 1.105-1.933 tok/s de prompt y 116,28 tok/s de escritura (dato truncado en la información disponible).

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 24 GB para una RTX 3090 o 3090 Ti; también soporta tarjetas de 12 GB con limitaciones (pases de prompt de 32K tokens en lugar de contextos mayores).
- RAM del sistema: 64 GB recomendados; el planificador del lanzador mantiene al menos 5 GiB de RAM libre.
- Almacenamiento: 80,11 GB para el modelo más 1,52 GB del drafter.
- GPU recomendadas: RTX 3090, RTX 3090 Ti (arquitectura Ampere sm_86). El fork llamAmpere compila con `-DCMAKE_CUDA_ARCHITECTURES=86`.
- Cabe en GPU de consumo: sí, en RTX 3090/3090 Ti de 24 GB con 64 GB de RAM; en tarjetas de 12 GB funciona con restricciones de contexto.
- Opciones de despliegue: exclusivamente llamAmpere v0.6.3 o superior (fork de llama.cpp del autor). No carga en llama.cpp estándar ni, presumiblemente, en vLLM, Ollama o TGI, que no soportan el formato AI+.
- Throughput estimado: 121,32 tok/s en coding, 124,89 tok/s en agentic y 124,26 tok/s en RAG con prompts de 100K tokens en RTX 3090; lectura de prompt entre 2.878 y 2.944 tok/s.
- Latencia por ronda: 26,05-32,49 ms según ancho de borrador y tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (AI+) | ~177B (MoE) | no disponible | 0,086541 | 80,11 GB | swift-open-license-1.0 | llamAmpere v0.6.3+ |
| IQ3_XXS estandar del mismo base | ~177B (MoE) | no disponible | 0,1744 / 0,1753 | 75,97 GB | swift-open-license-1.0 | llama.cpp estandar |
| Swift IQ3_XXS con mapa UD | ~177B (MoE) | no disponible | 0,118003 | no disponible | swift-open-license-1.0 | llama.cpp estandar |

La comparativa se limita a variantes de cuantización del mismo modelo base, ya que no se dispone de información sobre modelos alternativos comparables en la documentación proporcionada. El modelo base Qwen3.8-Flash-Next de QwenLM sería el referente natural, pero no se dispone de sus especificaciones completas ni de benchmarks de precisión en la información disponible.

## Limitaciones y advertencias

- Requiere un fork no estándar de llama.cpp (llamAmpere v0.6.3 o superior). No funciona en llama.cpp estándar, vLLM, Ollama, TGI ni en la mayoría de herramientas del ecosistema.
- El formato AI+ es propietario y específico para GPUs Ampere sm_86 (RTX 30-series). No hay soporte declarado para Ada, Hopper u otras arquitecturas.
- El dato de 3,242 bits por peso no implica que todo el modelo quepa en la tarjeta: los expertos se reparten entre VRAM y RAM del sistema, por lo que el rendimiento depende críticamente del ancho de banda de la RAM y del bus PCIe.
- Las comparaciones de velocidad publicadas son entre productos con distinta calidad y configuración de borrador; los p-valores no están ajustados por comparaciones múltiples y la lectura de prompt es más lenta que la alternativa comparada.
- El modelo es una cuantización no oficial de un modelo base a su vez no oficial (ukisai/Swift1.5-Qwen3.8-Flash-Next), sin documentación pública sobre el proceso de ajuste ni sobre los datos de entrenamiento.
- La licencia swift-open-license-1.0 no está detallada en la información disponible; es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Sin datos publicados de benchmarks de precisión (MMLU, HumanEval, GSM8K), por lo que no es posible evaluar la calidad de las respuestas frente a alternativas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por herencia del modelo base.
- Idiomas soportados no disponibles; no se puede garantizar un comportamiento adecuado en castellano.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El autor advierte que el modo `--fit on` automático no se ha medido en este archivo; solo se ha probado `--fit off`.
- En tarjetas de 12 GB, la repetibilidad de los resultados no está garantizada según las notas de soporte de hardware del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jakeatx/qwen3.8-flash-next-Swift1.5-ATX-AI3
- Modelo base (cuantizado): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Drafter MTP: https://huggingface.co/jakeatx/Swift-1.5-Qwen3.8-Flash-Next-MTP-Drafter-GGUF
- Colección Qwen3.8 Flash-Next de jakeatx: https://huggingface.co/collections/jakeatx/qwen38-flash-next
- Repositorio llamAmpere: https://github.com/JakeATX/llamAmpere
- Release llamAmpere v0.6.3: https://github.com/JakeATX/llamAmpere/releases/tag/v0.6.3
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
