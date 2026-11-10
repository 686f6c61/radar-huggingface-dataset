# moltherm1/olmo-mirror-olmo-3-7b-instruct-sft

## Resumen

Olmo 3 7B Instruct SFT es la etapa de ajuste supervisado (SFT) de la familia Olmo 3, desarrollada por el Allen Institute for AI (Ai2). Se trata de un modelo transformer autorregresivo de 7.000 millones de parametros construido sobre el modelo base Olmo-3-1025-7B, preentrenado con el dataset Dolma 3 y postentrenado con los conjuntos Dolci. Esta variante concreta corresponde al checkpoint intermedio de SFT dentro del pipeline de postentrenamiento, antes de las etapas de DPO y RLVR que producen el modelo Instruct final.

El modelo esta disenado para generacion de texto conversacional en ingles, con un template de chat especifico y un system prompt por defecto orientado a function calling. Su relevancia radica en que forma parte de una liberacion completamente abierta: Ai2 publica codigo, checkpoints, logs y detalles de entrenamiento, lo que permite reproducir y auditar el proceso de postentrenamiento. El corte de datos de entrenamiento es diciembre de 2024.

La ficha que sigue documenta las especificaciones conocidas a partir de la model card publicada. Dado que esta es una publicacion espejo (mirror) de un checkpoint de Ai2, algunos datos como la longitud de contexto o los formatos de pesos no aparecen explicitamente en la informacion disponible y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (estilo decoder-only) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits via bitsandbytes (load_in_8bit); fp16 en inferencia |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (carga via transformers >= 4.57.0) |

## Arquitectura y entrenamiento

Olmo 3 7B Instruct SFT es un transformer autorregresivo de tipo decoder-only con 7.000 millones de parametros. El modelo base es Olmo-3-1025-7B, preentrenado sobre el dataset Dolma 3. El postentrenamiento de esta variante se realizo mediante ajuste supervisado (SFT) sobre los datasets Dolci-Instruct-SFT y Dolci-Instruct-SFT-Tool-Use-SA, este ultimo orientado especificamente al uso de herramientas (tool use). El pipeline completo de Olmo 3 incluye etapas posteriores de DPO y RLVR que dan lugar al modelo Instruct final.

La familia Olmo 3 se presenta como un esfuerzo de ciencia abierta: Ai2 libera codigo (Open-Instruct para DPO y RLVR, OLMo-Core para preentrenamiento y SFT, OLMo-Eval para evaluacion), checkpoints y detalles de entrenamiento. El modelo utiliza un template de chat basado en tokens especiales `<|im_start|>` y `<|im_end|>`, con un system prompt por defecto que configura al modelo como asistente de function calling sin funciones disponibles inicialmente. La fecha de corte de datos es diciembre de 2024. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni de la composicion detallada del dataset.

## Capacidades

- Generacion de texto conversacional en ingles con soporte de conversaciones multi-turno mediante template de chat especifico.
- Razonamiento matematico: evaluado en MATH, AIME 2024, AIME 2025 y OMEGA (ver tabla de benchmarks).
- Function calling / tool use: el modelo se entrena con el dataset Dolci-Instruct-SFT-Tool-Use-SA y su system prompt por defecto esta orientado a llamadas a funciones.
- Razonamiento multi-paso y agentes: el formato de chat incluye marcadores de sistema, usuario y asistente que facilitan la orquestacion de agentes.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo de pensamiento (thinking) en esta variante SFT; la variante Think es un modelo separado de la familia.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en ingles con un template de chat estructurado y un system prompt configurable, adecuado para integrarse en sistemas de soporte con historial de conversacion.
- Asistente con function calling: gracias al entrenamiento con Dolci-Instruct-SFT-Tool-Use-SA y al formato `<functions></functions>` en el system prompt, puede invocar herramientas externas en flujos de automatizacion (consultas a APIs, bases de datos, calendarios).
- Generacion de codigo asistida: aunque no se publican resultados de HumanEval en la informacion disponible, el modelo puede emplearse en tareas de generacion y explicacion de codigo dentro de pipelines de desarrollo, con validacion humana.
- Razonamiento matematico asistido: util para resolver problemas de nivel MATH y tareas de calculo simbolico o explicacion paso a paso, con las limitaciones reflejadas en los benchmarks de AIME.
- Prototipado de agentes multi-paso: el formato de chat y el soporte de tool use permiten construir agentes que encadenan llamadas a herramientas y razonamiento intermedio.
- Investigacion en ciencia de modelos: al ser un checkpoint SFT abierto con codigo y logs, sirve para estudiar el efecto del ajuste supervisado frente a DPO y RLVR en la misma familia.
- Fine-tuning posterior: al estar bajo Apache 2.0 y con pesos cargables en transformers, puede adaptarse a dominios especificos mediante SFT adicional o LoRA.

## Benchmarks y rendimiento

Resultados publicados en la model card para la variante SFT y modelos comparables:

| Skill | Benchmark | Olmo 3 Instruct 7B SFT | Olmo 3 Instruct 7B DPO | Olmo 3 Instruct 7B | Qwen 3 8B (no reasoning) | Qwen 3 VL 8B Instruct | Qwen 2.5 7B | Olmo 2 7B Instruct | Apertus 8B Instruct | Granite 3.3 8B Instruct |
|---|---|---|---|---|---|---|---|---|---|---|
| Math | MATH | 65.1 | 79.6 | 87.3 | 82.3 | 91.6 | 71.0 | 30.1 | 21.9 | 67.3 |
| Math | AIME 2024 | 6.7 | 23.5 | 44.3 | 26.2 | 55.1 | 11.3 | 1.3 | 0.5 | 7.3 |
| Math | AIME 2025 | 7.2 | 20.4 | 32.5 | 21.7 | 43.3 | 6.3 | 0.4 | 0.2 | 6.3 |
| Math | OMEGA | 14.4 | 22.8 | 28.9 | 20.5 | 32.3 | 13.7 | 5.2 | 5.0 | 10.7 |

No se han publicado en la informacion disponible resultados de benchmarks de codigo (HumanEval), conocimiento general (MMLU) ni otras categorias para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16-24 GB.
- VRAM estimada con cuantizacion de 8 bits (bitsandbytes): aproximadamente 7-8 GB para los pesos, con overhead adicional.
- GPU recomendadas: A100 (40/80 GB), H100 para despliegues de alta concurrencia; RTX 4090 (24 GB) suficiente para fp16 en una sola GPU.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en fp16 y en GPUs de 8-12 GB con cuantizacion de 8 bits, con margen limitado.
- Opciones de despliegue: transformers >= 4.57.0 (soporte oficial), bitsandbytes para cuantizacion; no se documentan en la informacion disponible integraciones especificas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH | AIME 2024 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Olmo 3 7B Instruct SFT | 7B | no disponible | 65.1 | 6.7 | Apache 2.0 | Hugging Face (Ai2 y mirrors) |
| Olmo 3 7B Instruct (RLVR) | 7B | no disponible | 87.3 | 44.3 | Apache 2.0 | Hugging Face (Ai2) |
| Qwen 3 8B (no reasoning) | 8B | no disponible | 82.3 | 26.2 | no disponible en la informacion | Hugging Face |
| Qwen 2.5 7B | 7B | no disponible | 71.0 | 11.3 | no disponible en la informacion | Hugging Face |
| Olmo 2 7B Instruct | 7B | no disponible | 30.1 | 1.3 | Apache 2.0 | Hugging Face (Ai2) |

La comparativa se limita a los datos de benchmarks matematicos publicados; no se dispone de informacion sobre contexto, licencia de los modelos Qwen en esta ficha ni de otros benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse principalmente con datos en ingles, puede reflejar sesgos culturales y linguisticos de ese corpus.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido factualmente incorrecto, especialmente en tareas de conocimiento general no evaluadas en la model card.
- Limitaciones de idioma: el modelo esta disenado y evaluado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Limitaciones de razonamiento: los resultados en AIME 2024 (6.7) y AIME 2025 (7.2) son notablemente inferiores a los de la variante final RLVR (44.3 y 32.5), por lo que esta variante SFT no es adecuada para tareas de razonamiento matematico complejo en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo esta destinado a investigacion y uso educativo conforme a sus Responsible Use Guidelines; conviene revisar dichas guias antes de un despliegue comercial.
- Caveat de produccion: es un checkpoint intermedio de SFT, no el modelo final; para aplicaciones reales se recomienda evaluar la variante Instruct final (tras DPO y RLVR).
- Sensibilidad a tipos de datos: la model card advierte que el modelo cuantizado es mas sensible a tipos de datos y operaciones CUDA, recomendando pasar las entradas directamente a CUDA.

## Enlaces

- Hugging Face (mirror): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-instruct-sft
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Modelo SFT original: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- Modelo Instruct final: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Pagina del proyecto: https://allenai.org/olmo
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-Core (preentrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio OLMo-Eval (evaluacion): https://github.com/allenai/OLMo-Eval
- Guias de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper: pendiente de publicacion segun la model card (no disponible)
