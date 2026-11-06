# SeniorGrandMaster/Mergen-TR-Qwen3.5-9B-GGUF-TURKISH

## Resumen
Mergen-TR-Qwen3.5-9B-GGUF-TURKISH es la distribucion en formato GGUF del modelo Mergen-TR-Qwen3.5-9B, un modelo de lenguaje de ~8.950 millones de parametros (8,95B) afinado especificamente para turco a partir de Qwen3.5-9B. Lo publica el usuario SeniorGrandMaster en Hugging Face, mientras que el modelo base afinado lo desarrolla dogukanvzr. El modelo incorpora un modo hibrido de razonamiento (thinking / non-thinking) y se ha post-entrenado sobre un corpus privado de turco con aproximadamente 277.000 ejemplos supervisados y 15.000 pares de preferencia.

El objetivo del modelo es ofrecer razonamiento matematico, cadena de pensamiento y generacion en turco de alta calidad en un tamano de 9B, compitiendo con modelos de 27B a 70B en benchmarks turcos. Segun la model card, alcanza 74,3 en Turkish-MMLU y 84,4 en TurkishMMLU con cadena de pensamiento, lo que lo situa por encima de modelos como Llama 3.1 70B o Gemma 2 27B en esa tarea. Esta version concreta del repositorio es una cuantizacion GGUF del modelo base, pensada para despliegue local con llama.cpp, Ollama u otros motores compatibles con GGUF.

La relevancia actual radica en la escasez de modelos abiertos con rendimiento solido en turco y en la licencia Apache-2.0, que permite uso comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y practicamente sin adopcion registrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda de Qwen3.5-9B), con modo hibrido thinking / non-thinking |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | hasta 16K usados en evaluacion (la model card indica "up to 16K used in evaluation") |
| Tipos de cuantizacion | GGUF (el repo distribuye pesos GGUF; los niveles concretos no se detallan en la informacion disponible) |
| Idiomas soportados | Turco (tr) como idioma principal |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 9,3 GB); el modelo base original en safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only derivado de Qwen3.5-9B, con un modo hibrido que permite activar o desactivar el razonamiento explicito (`enable_thinking=True/False`). El post-entrenamiento combina supervised fine-tuning (SFT) y optimizacion por preferencias, sobre un corpus privado construido nativamente en turco, no traducido automaticamente. La composicion aproximada del corpus de SFT es: 64.000 ejemplos de matematicas y problemas verbales, 64.000 de conocimiento y opcion multiple (incluyendo humanidades), 20.000 de cultura, 15.000 de QA extractivo, 13.000 de clasificacion, 13.000 de correccion gramatical y 12.000 de traduccion, hasta un total de ~277.000 ejemplos, mas ~15.000 pares de preferencia.

La model card destaca que el protocolo de evaluacion se disena especificamente para modelos con thinking: decodificacion greedy (`do_sample=False`, `repetition_penalty=1.05`), presupuestos de generacion de 8.192 tokens en Turkish-MMLU y 16.384 en TurkishMMLU y GSM8K-TR, y un parser de respuestas en tres capas que lee despues de `</think>`. Segun el autor, aproximadamente el 17% (Turkish-MMLU) y el 25% (academico) de las generaciones superan los 4.096 tokens, por lo que presupuestos cortos infravaloran el modelo. Esta version GGUF conserva las capacidades del modelo base, aunque no se detalla en la informacion disponible el proceso exacto de cuantizacion aplicado.

## Capacidades
- Generacion de texto en turco con enfasis en calidad linguistica y conocimiento cultural.
- Razonamiento matematico y resolucion de problemas verbales (entrenado con 64.000 ejemplos de matematicas).
- Razonamiento con cadena de pensamiento explicita en modo thinking, con presupuestos de generacion largos.
- Modo non-thinking para respuestas cortas y directas.
- Conocimiento y respuesta a preguntas de opcion multiple, incluyendo humanidades y ciencias.
- QA extractivo sobre documentos en turco.
- Clasificacion de texto y correccion gramatical.
- Traduccion (12.000 ejemplos en el corpus de entrenamiento).
- Soporte de chat multi-turno mediante plantilla de chat (`apply_chat_template`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita; el modo thinking permite cadenas de razonamiento, pero no se documenta integracion con agentes.
- Capacidades de vision o audio: no disponibles.

## Casos de uso
- Asistencia educativa en turco: el modelo puede resolver problemas de matematicas y explicar el razonamiento paso a paso en modo thinking, adecuado para tutoria escolar y universitaria gracias a su entrenamiento especifico en problemas verbales y su puntuacion de 87,5 en GSM8K-TR.
- Preparacion de examenes de opcion multiple: con 64.000 ejemplos de conocimiento y opcion multiple, puede generar preguntas y explicar respuestas en asignaturas de ciencias y humanidades, apoyandose en su rendimiento de 84,4 en TurkishMMLU con CoT.
- Correccion y mejora de textos en turco: los 13.000 ejemplos de correccion gramatical permiten usarlo como revisor ortografico y estilistico en herramientas de edicion o en pipelines de publicacion.
- Clasificacion y etiquetado de documentos turcos: con 13.000 ejemplos de clasificacion, es util para moderacion de contenido, enrutado de tickets o categorizacion de noticias en entornos con documentacion en turco.
- QA extractivo sobre base documental: puede responder preguntas sobre contratos, manuales o articulos en turco extrayendo la respuesta del contexto, gracias a los 15.000 ejemplos de QA extractivo y a una ventana de hasta 16K tokens.
- Traduccion turco-espanol o turco-ingles en entornos controlados: los 12.000 ejemplos de traduccion permiten usarlo como borrador inicial en flujos de localizacion, con revision humana posterior.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en equipos sin GPU dedicada o con GPU de consumo, lo que facilita prototipos y demos offline en turco.

## Benchmarks y rendimiento
Los datos siguientes provienen de la model card del modelo base (dogukanvzr/Mergen-TR-Qwen3.5-9B). El autor advierte que las filas de comparacion no usan el mismo harness: las puntuaciones de competidores en Turkish-MMLU provienen del leaderboard oficial (mayoritariamente Q4 GGUF) y las de modelos cerrados en TurkishMMLU del paper original con CoT.

| Benchmark | Mergen-TR-Qwen3.5-9B | Referencia comparada |
|---|---|---|
| Turkish-MMLU (leaderboard, 6.200 preguntas) | 74,3 | Llama 3.1 70B: 70,4; Qwen3 14B: 71,7; Gemma 2 27B: 72,1; Gemma 3 27B: 75,1 |
| TurkishMMLU (Yuksel et al. 2024), CoT | 84,4 | Claude 3 Opus: 81,8; GPT-4 Turbo: 79,2 |
| GSM8K-TR | 87,5 | +1,2 sobre el modelo base |

Protocolo declarado: thinking ON (`enable_thinking=True`), greedy (`do_sample=False`, `repetition_penalty=1.05`), `max_new_tokens=8192` en Turkish-MMLU y 16384 en TurkishMMLU/GSM8K-TR, parser en tres capas tras `</think>`, `no_answer=0`. Muestras: Turkish-MMLU estratificado n=1.895; TurkishMMLU conjunto completo de 900 preguntas; GSM8K-TR n=256; precision bf16. Por asignaturas, matematicas, fisica, geografia y quimica se situan en los 80 altos/90, mientras que lengua y literatura turcas es el area mas debil.

No se han publicado resultados de benchmarks especificos para esta cuantizacion GGUF en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial para esta cuantizacion. Como referencia orientativa por tamano (8,95B parametros), en bf16 serian necesarios aproximadamente 18 GB solo de pesos; en cuantizaciones GGUF de 4-5 bits el peso se reduce a unos 5-6 GB, y en 8 bits a unos 9-10 GB, mas overhead de contexto KV.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU con 24 GB (RTX 4090, A10G, L4 con cuantizacion) seria suficiente para bf16 ajustado o cuantizaciones altas; A100/H100 para mayor throughput y contexto completo.
- Cabe en GPU de consumo: si, previsiblemente en cuantizaciones GGUF de 4-8 bits en GPUs con 8-16 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080), aunque el dato exacto no consta en la informacion disponible.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y Transformers para el modelo base en bf16 (la model card documenta `vllm serve dogukanvzr/Mergen-TR-Qwen3.5-9B --dtype bfloat16 --max-model-len 16384`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Turkish-MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mergen-TR-Qwen3.5-9B (esta ficha, GGUF) | ~8,95B | hasta 16K en evaluacion | 74,3 | Apache-2.0 | Hugging Face (GGUF) |
| Qwen3 14B | 14B | no disponible | 71,7 | no disponible | Hugging Face |
| Gemma 2 27B | 27B | no disponible | 72,1 | no disponible | Hugging Face |
| Llama 3.1 70B | 70B | no disponible | 70,4 | no disponible | Hugging Face |

La comparativa se limita a las puntuaciones de Turkish-MMLU reportadas en la model card; no se dispone de datos de contexto, licencia o formato para los modelos competidores en la informacion proporcionada. El resultado principal es que un modelo de ~9B iguala o supera en Turkish-MMLU a modelos de 14B, 27B y 70B.

## Limitaciones y advertencias
- Enfoque monoidioma: el modelo esta entrenado principalmente en turco; su rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al entrenarse sobre un corpus privado de Turquia, puede reflejar sesgos culturales y linguisticos de esa fuente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo, puede producir respuestas plausibles pero incorrectas, especialmente en conocimiento factual fuera del corpus.
- Presupuesto de generacion: el modo thinking requiere `max_new_tokens` altos (8.192-16.384); presupuestos cortos degradan la calidad y truncan la cadena de razonamiento.
- Parsing: si se procesan respuestas de forma programatica, hay que leer el contenido despues de `</think>` para evitar capturar el razonamiento interno.
- Area mas debil: lengua y literatura turcas segun la propia model card.
- Cuantizacion: esta version GGUF puede presentar perdida de precision frente al modelo en bf16; no se documenta la magnitud de esa perdida.
- Adopcion: el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni validacion independiente de los resultados.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B por si imponen requisitos adicionales no reflejados en la informacion disponible.

## Enlaces
- Repositorio GGUF: https://huggingface.co/SeniorGrandMaster/Mergen-TR-Qwen3.5-9B-GGUF-TURKISH
- Modelo base afinado: https://huggingface.co/dogukanvzr/Mergen-TR-Qwen3.5-9B
- Paper de referencia TurkishMMLU (Yuksel et al. 2024): https://arxiv.org/abs/2407.12402
