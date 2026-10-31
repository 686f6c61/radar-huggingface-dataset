# rrchat/Cerberus-E4B

## Resumen

Cerberus-E4B es un modelo lingüístico de razonamiento y uso agéntico desarrollado por rrchat, publicado como adaptador LoRA (PEFT) sobre el modelo multimodal `google/gemma-4-E4B-it`. El modelo base combina aproximadamente 7,5 mil millones de parámetros totales, de los cuales unos 4B corresponden al backbone de lenguaje activo, junto con torres de visión y audio congeladas. Cerberus se centra en tres frentes: razonamiento paso a paso bilingüe (inglés y ruso), function calling nativo mediante los esquemas de herramientas de Gemma 4 y generación de doble canal que alterna entre trazas de pensamiento extensas y respuestas directas.

Su relevancia radica en que aborda una carencia concreta: los modelos pequeños multimodales suelen tener un rendimiento modesto en matemáticas de nivel competición y en razonamiento en ruso sin recurrir a traducción automática. Según el autor, Cerberus mejora la precisión en MATH-500 en +16,7 puntos respecto al modelo base en modo thinking, manteniendo la paridad en seguimiento de instrucciones (IFEval).

Está entrenado con datasets públicos de alta calidad (OpenR1-Math-220k, Nemotron Post-Training v2, SmolTalk2, entre otros), se distribuye bajo licencia Apache 2.0 y cuenta con pesos GGUF pre-cuantizados para ejecución local en llama.cpp, LM Studio u Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Gemma 4 (backbone de lenguaje + torres de visión SigLIP ViT y audio Conformer) |
| Parametros totales | ~7,5B (incluyendo torres de visión y audio congeladas) |
| Parametros activos | ~4B (backbone de lenguaje; el resto son encoders multimodales congelados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes para el adaptador); GGUF: Q4_K_M, Q5_K_M, Q8_0, BF16 |
| Idiomas soportados | Ruso e inglés (bilingüe, con alineación profunda del ruso) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA en safetensors (PEFT); GGUF independiente con mmproj multimodal |

## Arquitectura y entrenamiento

Cerberus-E4B no es un modelo entrenado desde cero, sino un adaptador LoRA aplicado sobre el backbone de lenguaje de `gemma-4-E4B-it`. Las torres de visión (ViT SigLIP con 280 soft tokens) y de audio (Conformer a 16 kHz) permanecen intactas, lo que permite compatibilidad directa con archivos `mmproj` multimodales en formato GGUF. Esto significa que el modelo conserva las capacidades de visión y audio del modelo base mientras añade razonamiento y agenticidad.

El entrenamiento se realizó con un dataset multi-fuente curado y descontaminado que incluye: open-r1/OpenR1-Math-220k (matemáticas de competición con trazas de razonamiento), nvidia/Nemotron-Post-Training-Dataset-v2 y nvidia/Nemotron-SFT-Agentic-v2 (post-entrenamiento agéntico y de instrucciones), HuggingFaceTB/smoltalk2 (conversación) y Vikhrmodels/GrandMaster-PRO-MAX (alineación en ruso). La ficha técnica no detalla el número total de tokens de entrenamiento ni si se emplearon fases de RLHF o DPO, aunque el énfasis en trazas de razonamiento tipo R1 sugiere un enfoque de SFT sobre razonamientos sintéticos.

Una innovación destacable es el esquema de doble canal de generación: el modelo puede emitir trazas deliberadas de pensamiento mediante tokens especiales (`<|channel>thought\n...<channel|>`) o respuestas directas e inmediatas, seleccionables mediante el formato del prompt.

## Capacidades

- Razonamiento matemático paso a paso de nivel competición, con mejora de +16,7 puntos en MATH-500 frente al modelo base en modo thinking.
- Generación de doble canal: trazas de razonamiento largas (modo thought) o respuestas concisas (modo instant), según el formato del prompt.
- Function calling nativo conforme al protocolo de Gemma 4 (`<|tool_call>...<|call:function_name{...}>`), con adherencia estricta al esquema para agentes multi-turno.
- Capacidades agénticas: uso de herramientas y razonamiento multi-paso entrenado con el dataset Nemotron-SFT-Agentic-v2.
- Razonamiento matemático y lógico en ruso de calidad nativa, sin degradación por traducción.
- Compatibilidad multimodal: conserva los encoders de visión (SigLIP) y audio (Conformer) del modelo base para análisis de imágenes y audio.
- Generación de texto conversacional y seguimiento de restricciones complejas de sistema (IFEval ~90,5%).
- Disponibilidad en GGUF cuantizado para inferencia local.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: en modo thinking, el modelo descompone problemas de olimpiada en pasos verificables, útil para tutores automáticos de matemáticas en ruso e inglés.
- Agentes con herramientas: gracias al function calling nativo de Gemma 4, puede integrarse en frameworks agénticos que invoquen APIs, buscadores o ejecutores de código en flujos multi-turno.
- Asistentes locales privados: con los GGUF pre-cuantizados puede ejecutarse en llama.cpp u Ollama en hardware de consumo, manteniendo la inferencia y el historial en local.
- Análisis multimodal desde dispositivos móviles: combinado con la interfaz rrchat, permite subir fotos desde la cámara del teléfono y obtener análisis visual aprovechando el encoder SigLIP intacto.
- Chatbots bilingües ruso-inglés: la alineación profunda del ruso lo hace adecuado para atención al cliente o asistentes conversacionales en mercados rusohablantes sin depender de traducción intermedia.
- Generación de código y respuestas técnicas deterministas: en modo instant con decodificación greedy, ofrece salida estable y sintácticamente fiable para pipelines de generación de código.
- Procesamiento de instrucciones con restricciones complejas: su puntuación de ~90% en IFEval lo hace apto para tareas con requisitos estrictos de formato y sistema.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados en modo greedy/determinista contra el modelo base:

| Benchmark | Gemma-4-E4B-it (base) | Cerberus-E4B | Delta | Modo |
|---|---|---|---|---|
| MATH-500 | 43,3% | 60,0% | +16,7% | Thinking |
| MATH-500 | 35,0% | 48,0% | +13,0% | Instant |
| MMLU-Redux | 62,0% | 63,0% | +1,0% | Conocimiento académico |
| IFEval | 90,8% | 90,5% | Paridad (~90%) | Seguimiento de instrucciones |

No se han publicado comparativas frente a otros modelos de terceros en la información disponible.

## Requisitos de hardware

- Como adaptador LoRA sobre el modelo base (~7,5B totales, ~4B activos): en BF16 se estima en torno a 15-16 GB de VRAM para el modelo completo; con cuantización 4-bit (bitsandbytes, como en la propia ficha) en torno a 5-7 GB. Estas cifras son estimaciones, no datos publicados.
- GGUF Q4_K_M: aproximadamente 4-5 GB, ejecutable en GPUs de consumo como la RTX 3060 de 12 GB o la RTX 4060 Ti de 16 GB; Q8_0 en torno a 8 GB, viable en RTX 4070/4080.
- Dado que solo ~4B de parámetros de lenguaje están activos, la velocidad de inferencia es comparable a la de un modelo de 4B.
- GPU recomendadas para servidores: RTX 4090 o A100 para cargas concurrentes; para uso personal basta una GPU de consumo de 8-12 GB.
- Opciones de despliegue: Hugging Face Transformers con PEFT (código de quickstart en la model card), llama.cpp, LM Studio, Ollama (mediante los GGUF de rrlabs-ai/Cerberus-E4B-GGUF) y la interfaz web rrchat.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cerberus-E4B | ~7,5B totales / ~4B activos | Sí (visión y audio heredadas) | Doble canal thought/instant, MATH-500 60,0% | Apache 2.0 | LoRA safetensors + GGUF |
| google/gemma-4-E4B-it (base) | ~7,5B totales / ~4B activos | Sí | Estándar, MATH-500 43,3% | Licencia Gemma | HF, GGUF comunitario |
| Qwen3-4B-Instruct | ~4B | No | Modo thinking, buen rendimiento matemático | Apache 2.0 | HF, GGUF, vLLM |

Nota: los datos de Qwen3-4B-Instruct se incluyen como referencia de categoría; no existen benchmarks comparativos directos publicados entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Se trata de un adaptador LoRA, no de un modelo completo: requiere cargar el modelo base `google/gemma-4-E4B-it` (sujeto a la licencia Gemma de Google) o usar los GGUF fusionados.
- La ventana de contexto no está documentada en la model card; debe verificarse en la documentación del modelo base antes de diseñar aplicaciones con documentos largos.
- El soporte de idiomas se declara solo para ruso e inglés; el rendimiento en otros idiomas, incluido el castellano, no está evaluado y puede ser inferior.
- Riesgo de alucinación: no se han publicado evaluaciones de factuality; como todo modelo de ~4B activos, puede generar contenido incorrecto con fluidez, especialmente en modo instant.
- Los benchmarks provienen del propio autor y se evaluaron solo contra el modelo base, sin comparación con modelos de terceros ni auditoría independiente.
- Para trazas largas de razonamiento en llama.cpp se recomienda el sampler DRY dinámico para evitar bucles de n-gramas; sin él, la calidad del modo thinking puede degradarse.
- Sesgos: el modelo hereda los sesgos del modelo base Gemma 4 y de los datasets de entrenamiento (Nemotron, OpenR1, SmolTalk2), predominantemente en inglés y ruso.
- El número de descargas y likes es muy bajo (15 y 2), lo que implica escasa validación por parte de la comunidad y posible presencia de errores no detectados.

## Enlaces

- Modelo (adaptador LoRA): https://huggingface.co/rrchat/Cerberus-E4B
- Pesos GGUF cuantizados: https://huggingface.co/rrlabs-ai/Cerberus-E4B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Interfaz rrchat: https://github.com/leftik1/rrchat
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset nvidia/Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset HuggingFaceTB/smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset Vikhrmodels/GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
