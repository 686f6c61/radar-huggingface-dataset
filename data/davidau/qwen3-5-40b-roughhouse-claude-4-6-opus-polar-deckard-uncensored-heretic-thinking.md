# DavidAU/Qwen3.5-40B-RoughHouse-Claude-4.6-Opus-Polar-Deckard-Uncensored-Heretic-Thinking

## Resumen
Qwen3.5-40B-RoughHouse-Claude-4.6-Opus-Polar-Deckard-Uncensored-Heretic-Thinking es un modelo de lenguaje denso de aproximadamente 39.500 millones de parametros publicado por DavidAU, un creador independiente conocido en Hugging Face por sus merges y fine-tunes de la familia Qwen. El modelo parte de dos modelos Qwen 3.5 de 27B (denominados internamente Claude-Polaris y Deckard), que se fusionan y expanden a 40B de parametros para ganar capacidad de razonamiento, y se somete a un proceso de "abliteration" y fine-tuning orientado a eliminar los filtros de seguridad y reforzar escritura creativa, ficcion y roleplay.

La relevancia del modelo es doble. Por un lado, demuestra tecnicas de expansion de parametros (de 27B a 40B) y de merge de modelos entrenados sobre datasets distintos, algo poco comun en modelos abiertos de este tamano. Por otro, se publica como "RoughHouse", es decir, sin el ultimo paso de entrenamiento posterior a la expansion, lo que segun el autor preserva la potencia bruta de ambos modelos fuente a costa de un comportamiento mas erratico, con riesgo de bucles y de glitches de tokens.

Se distribuye en formato safetensors con pesos en bfloat16, con licencia Apache 2.0, soporte declarado para ingles y chino, y una ventana de contexto anunciada de 256K tokens. La pipeline declarada es image-text-to-text, aunque la model card no detalla capacidades de vision mas alla de esa etiqueta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), derivado de Qwen 3.5; 96 capas y 1275 tensores |
| Parametros totales | 39.533.326.832 (~39,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K tokens (segun model card) |
| Tipos de cuantizacion | bfloat16 en el repo; el autor recomienda minimo Q4_K_M (sin imatrix) o IQ3_M (con imatrix) para GGUF |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); el autor menciona cuantizaciones GGUF como opcion de despliegue |
| Tamano del repo | 79,1 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Fecha de creacion | 2026-03-15 |

## Arquitectura y entrenamiento
El modelo es un transformer denso de 96 capas y 1275 tensores, resultado de expandir dos modelos Qwen 3.5 de 27B a un total de 40B de parametros. Segun la model card, uno de los modelos fuente se entreno con datasets internos de tipo "Deckard/PDK" (orientados a personaje, inteligencia, profundidad, observacion y punto de vista) y el otro con datasets "Claude/Polaris". Antes del entrenamiento se aplico "Heretic", un proceso de abliteration que elimina las direcciones de rechazo del modelo, y despues se realizo un fine-tuning con Unsloth sobre cinco datasets de cada familia.

La innovacion principal es el propio pipeline de expansion: en lugar de destilar o mezclar pesos a igual tamano, se aumenta la anchura del modelo para dar "espacio para pensar" y se conservan las capacidades de ambos modelos fuente. La version "RoughHouse" omite el paso final de entrenamiento tras la expansion, lo que segun el autor mantiene intacta la potencia de ambos modelos pero produce un comportamiento mas salvaje: salidas creativas con varios borradores, razonamiento de estilo "Claude" con matices de Polaris y Deckard, y riesgo de bucles con prompts demasiado cortos. El autor declara razonamiento de longitud variable: mas corto para tareas simples y mas largo para las complejas.

## Capacidades
- Generacion de texto general, razonamiento y matematicas/ciencia, con modo "thinking" de longitud variable.
- Escritura creativa y de ficcion: generacion de tramas, subtramas, escenas, continuacion de escenas, dialogos y prosa "vivida", con soporte declarado para todos los generos (ciencia ficcion, romance, etc.).
- Roleplay y conversacion multi-turno con preservacion de personaje.
- Capacidades de codigo, segun los tags del autor ("coder").
- Capacidades multilingues limitadas a ingles y chino.
- Etiqueta de pipeline image-text-to-text, aunque la model card no detalla el soporte real de vision.
- Sin censura ni filtros de rechazo (via Heretic), incluyendo contenido NSFW si se solicita.
- No se documenta soporte explicito de tool calling, function calling ni uso como agente multi-paso.

## Casos de uso
- Escritura de ficcion y novelas: el modelo puede generar tramas completas, subtramas y escenas con estructura narrativa (planteamiento, nudo, desenlace) y dialogos, gracias a su entrenamiento especifico en datasets de escritura creativa y a la ventana de 256K tokens para mantener coherencia en manuscritos largos.
- Roleplay y compania conversacional: su entrenamiento en personaje y su ausencia de filtros lo hacen adecuado para personajes con personalidad marcada y conversaciones multi-turno sin restricciones tematicas.
- Generacion de guiones y dialogos para produccion audiovisual: el prompt de sistema creativo incluido en la model card estructura la salida en dialogos, narracion y lenguaje corporal, util para borradores de guion.
- Prototipado de asistentes sin censura para investigacion: util en estudios sobre alineacion, abliteration y comportamiento de modelos sin filtros, donde se necesita un modelo que responda sin rechazos para medir sesgos y riesgos.
- Continuacion de escenas y "scene continue": integrable en herramientas de escritura asistida donde el autor necesita extender un texto manteniendo tono y estilo.
- Experimentacion con tecnicas de expansion y merge de modelos: sirve como caso de estudio reproducible para investigadores interesados en aumentar parametros de un modelo abierto sin reentrenar desde cero.
- Generacion de contenido creativo en ingles y chino: util para equipos bilingues que necesiten prosa creativa en ambos idiomas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos; solo menciona cualitativamente que "el rendimiento ha aumentado dramaticamente" tras la expansion a 40B.

## Requisitos de hardware
- VRAM estimada en bfloat16: alrededor de 79 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un nodo multi-GPU (por ejemplo, 2x A100 80GB o 4x A100 40GB) o H100 80GB en configuracion multi-GPU.
- En cuantizacion Q4_K_M o IQ3_M (minimos recomendados por el autor), el modelo cabe en torno a 20-25 GB, lo que permite ejecutarlo en una RTX 4090 (24 GB) o A6000 (48 GB) con margen limitado.
- No cabe en GPUs de consumo de 8-16 GB ni en cuantizaciones inferiores a las recomendadas sin riesgo de bucles y glitches de tokens, segun advierte el autor.
- Opciones de despliegue: transformers con safetensors en bfloat16; llama.cpp u Ollama para GGUF; vLLM y TGI no estan confirmados en la informacion disponible para esta arquitectura concreta.
- Latencia y throughput: no disponibles. El autor recomienda una ventana de contenido minima de 8K-16K tokens y regenerar 2-5 veces para obtener la mejor salida, lo que implica coste adicional de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-40B-RoughHouse (este) | ~39,5B denso | 256K | Apache 2.0 | Sin censura, fine-tune creativo, estado "raw" |
| Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking | ~40B denso | 256K (segun model card del autor) | Apache 2.0 | Version "menos salvaje" del mismo autor, con el paso final de entrenamiento |
| Qwen 3.5 27B base | ~27B denso | no disponible en la informacion | Apache 2.0 (familia Qwen) | Modelo fuente del que se parte antes de la expansion |
| Modelos densos abiertos de ~30-40B (familia Llama, Mistral) | 30-40B | variable | licencias comunitarias | No se dispone de datos comparativos de rendimiento en la informacion disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias
- Modelo sin censura ni filtros de rechazo: puede generar contenido NSFW, ofensivo o danino si se le solicita; no es apto para despliegues orientados al publico sin moderacion adicional.
- Riesgo elevado de alucinacion y de bucles, especialmente con prompts cortos o con poca guia; el autor recomienda system prompts y regeneracion multiple.
- Posibles glitches de tokens en cuantizaciones bajas; el autor fija minimos de Q4_K_M o IQ3_M.
- Estado "RoughHouse": al omitirse el entrenamiento final tras la expansion, el comportamiento es mas erratico e impredecible que la version entrenada.
- Sesgos desconocidos: no se documentan evaluaciones de sesgo; el proceso de abliteration puede alterar el comportamiento en temas sensibles de forma no controlada.
- Soporte limitado a ingles y chino; el rendimiento en castellano no esta garantizado.
- La etiqueta image-text-to-text no esta respaldada por documentacion detallada sobre capacidades de vision.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin filtros exige revision legal y de cumplimiento por el contenido que pueda generar.
- Modelo de un autor individual, sin el respaldo de un laboratorio: soporte, mantenimiento y actualizaciones limitados.

## Enlaces
- Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-40B-RoughHouse-Claude-4.6-Opus-Polar-Deckard-Uncensored-Heretic-Thinking
- Version entrenada (menos "salvaje"): https://huggingface.co/DavidAU/Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Dataset Claude/Polaris: https://huggingface.co/datasets/DavidAU/claude-4.5-opus-4datasets-polaris
- Dataset Deckard/PDK: https://huggingface.co/datasets/DavidAU/PkDick-Deckard-Datasets
