# kmansei/qwen3.5-0.8b-rag-answer-sft

## Resumen

El modelo `kmansei/qwen3.5-0.8b-rag-answer-sft` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B` de Alibaba Qwen, publicado por el usuario kmansei en Hugging Face. Se trata de un modelo de aproximadamente 873 millones de parámetros, orientado especificamente a la tarea de responder preguntas en japones en un contexto de generacion aumentada por recuperacion (RAG), es decir, generando respuestas a partir de pasajes recuperados de un corpus documental.

El ajuste se ha realizado mediante una LoRA con rango 16 que posteriormente se ha fusionado (merged) en la arquitectura base, de modo que solo los tensores entrenados difieren del snapshot original de Qwen. El entrenamiento utiliza el conjunto de datos JEMHopQA, un benchmark de question answering multi-salto en japones, combinado con pasajes recuperados de fragmentos de Wikipedia en japones.

La relevancia de este modelo radica en su especializacion: es un modelo pequeno (sub-1B) que puede desplegarse en hardware modesto y que ha sido afinado para una tarea concreta de RAG en japones, un idioma habitualmente infrarrepresentado en los ajustes finos publicados. Sin embargo, la informacion publica disponible es muy limitada: no hay pipeline declarado, no se especifican idiomas en los metadatos, no hay benchmarks publicados y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun el tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponibles en metadatos; el ajuste fino se orienta a japones |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revision `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino supervisado mediante LoRA de rango 16, cuyos pesos se fusionan en la arquitectura base. No se detalla en la model card la composicion exacta de la arquitectura interna (numero de capas, dimension oculta, tipo de atencion), por lo que estos datos deben considerarse no disponibles. El tag `qwen3_5` indica que pertenece a la familia Qwen3.5, pero no se aportan mas especificaciones tecnicas.

Los datos de entrenamiento consisten en pares de pregunta y respuesta del conjunto JEMHopQA (licencia CC BY-SA 4.0), junto con pasajes recuperados de fragmentos de Wikipedia en japones (tambien CC BY-SA 4.0). No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. La innovacion tecnica destacable es la fusion de la LoRA en el modelo base, lo que simplifica el despliegue al no requerir cargar adaptadores por separado.

## Capacidades

- Generacion de respuestas a preguntas en japones a partir de pasajes de contexto recuperados (RAG).
- Question answering multi-salto, dado que el dataset de entrenamiento (JEMHopQA) esta disenado para preguntas que requieren razonamiento sobre multiples entidades.
- Generacion de texto general heredada del modelo base Qwen3.5-0.8B.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada especifica; el multi-salto se limita al QA sobre contexto.
- Capacidades multilingues: no documentadas en los metadatos; el ajuste fino es en japones.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre documentacion interna en japones: el modelo recibe pasajes recuperados de un indice vectorial y genera una respuesta sintetizada; su tamano reducido permite desplegarlo en entornos con recursos limitados.
- Atencion al cliente en japones sobre base de conocimiento: integrado en un pipeline RAG, puede responder consultas frecuentes citando fragmentos de manuales o FAQ recuperados.
- Asistente de consulta sobre Wikipedia en japones: dado que el entrenamiento uso fragmentos de Wikipedia, es adecuado para construir un buscador conversacional sobre ese corpus.
- Question answering multi-salto en dominios documentales: util para preguntas que requieren combinar informacion de varios pasajes, como consultas sobre entidades relacionadas.
- Prototipado rapido de sistemas RAG en japones: al ser un modelo sub-1B con licencia Apache 2.0, sirve para validar pipelines de recuperacion y generacion antes de escalar a modelos mayores.
- Despliegue en el borde o en CPU: con menos de 900 millones de parametros, es viable en entornos sin GPU dedicada para tareas de baja latencia y volumen moderado.
- Filtrado y resumen de pasajes recuperados: puede usarse como componente intermedio que condensa contexto antes de pasarlo a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa; no confirmada por el autor).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB (estimaciones teoricas, no se publican variantes cuantizadas).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, etc.) deberia ser suficiente en fp16; no se dispone de datos de rendimiento especificos.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU modernas con 4-8 GB de VRAM.
- Opciones de despliegue: al estar en safetensors, es compatible con transformers, vLLM y TGI; para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| kmansei/qwen3.5-0.8b-rag-answer-sft | 873 M | no disponible | Apache 2.0 | RAG en japones (JEMHopQA) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache 2.0 | Proposito general | Hugging Face |
| Modelos QA japoneses de tamano similar | no disponible | no disponible | variable | QA en japones | no disponible |

La comparativa detallada con alternativas concretas no esta disponible en la informacion proporcionada; el unico punto de referencia claro es el modelo base del que deriva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre Wikipedia en japones y JEMHopQA, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; en tareas RAG puede generar respuestas no sustentadas en los pasajes recuperados, especialmente con un modelo de 0,8 B.
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada; el ajuste fino es en japones, por lo que el rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los datos de entrenamiento (JEMHopQA y Wikipedia) estan bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual sobre obras derivadas; conviene revisar la compatibilidad antes de un uso comercial.
- Caveats para produccion: el modelo no registra descargas ni validacion externa, no tiene benchmarks publicados y su pipeline no esta declarado; se recomienda evaluacion propia antes de desplegarlo.
- El modelo esta especializado en una unica tarea (QA sobre contexto recuperado en japones) y puede comportarse deficientemente fuera de ese dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kmansei/qwen3.5-0.8b-rag-answer-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Wikipedia en japones (fuente de pasajes): https://ja.wikipedia.org
