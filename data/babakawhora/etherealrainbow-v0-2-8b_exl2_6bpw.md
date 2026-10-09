# babakawhora/EtherealRainbow-v0.2-8B_EXL2_6BPW

## Resumen

EtherealRainbow-v0.2-8B_EXL2_6BPW es una cuantizacion en formato EXL2 a 6.0 bits por peso (BPW) del modelo EtherealRainbow-v0.2-8B, un merge de 8 000 millones de parametros construido con mergekit a partir de varios finetunes basados en Llama 3. El modelo original lo publica el usuario invisietch, mientras que esta version cuantizada la distribuye babakawhora en HuggingFace. Su proposito declarado es ofrecer una variante de Llama 3 sin censura, orientada a prosa creativa y a roleplay y narrativa tanto SFW como NSFW.

La relevancia de esta ficha es practica: no se trata de un modelo nuevo ni de un entrenamiento desde cero, sino de un artefacto de despliegue. La cuantizacion a 6 BPW sobre un transformer decoder-only de 8B reduce el peso del repositorio a 6,8 GB, lo que permite ejecutarlo en GPU de gama de consumo con el backend ExLlamaV2, manteniendo una fidelidad relativamente alta respecto al bf16 original.

Conviene subrayar que el autor de la model card no publica resultados de benchmarks, ni recuento exacto de tokens de entrenamiento, ni composicion del dataset del merge. La model card del modelo base incluye ademas el aviso de que se trata de una version "no acabada" y de que, al estar construida sobre una base abliterada, puede generar contenido explicito, perturbador u ofensivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Llama 3, combinado mediante mergekit a partir de varios finetunes de Llama 3 de 8B |
| Parametros totales | Aproximadamente 8 000 millones (8B); la model card no detalla el recuento exacto |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Este repositorio: EXL2 a 6.0 BPW. El modelo original ofrece bf16 safetensors y varias cuantizaciones GGUF (el autor menciona Q8_0 en sus ejemplos) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | Llama 3 Community License (etiqueta "llama3") |
| Formato de pesos | safetensors en formato EXL2 (6 BPW) |

## Arquitectura y entrenamiento

Se trata de un merge de modelos, no de un entrenamiento desde cero. Segun la model card, EtherealRainbow se construyo con mergekit combinando varios finetunes basados en Llama 3, con el objetivo de producir una variante de Llama 3 de 8B sin censura, capaz de escribir prosa creativa y de sostener roleplay y narrativa, con enfasis en respuestas largas y en la adherencia al prompt. El autor indica que el modelo esta construido sobre una base abliterada, tecnica que elimina la direccion de rechazo en el espacio de activaciones y que explica su caracter mayoritariamente sin censura.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en los finetunes de origen. Tampoco se documentan innovaciones tecnicas propias del merge. La model card si detalla el formato de prompt recomendado, el de Llama 3 Instruct (`<|begin_of_text|>`, `<|start_header_id|>`, `<|end_header_id|>`, `<|eot_id|>`), y menciona que algunos de los modelos integrados en el merge se entrenaron con formato ChatML y Alpaca, aunque el autor aclara que no los ha probado. Esta version concreta es unicamente una conversion a EXL2 6 BPW del modelo fusionado.

## Capacidades

- Generacion de texto creativo en ingles: prosa narrativa, ficcion y textos de formato largo, con ejemplos de capitulos de novela en la propia model card.
- Roleplay conversacional multi-turno, tanto SFW como NSFW, con enfasis declarado en respuestas extensas y en el seguimiento de instrucciones del prompt de sistema.
- Escritura de narrativa con dialogo, monologo interno y cambios de punto de vista, segun los ejemplos publicados.
- Funcionamiento sin censura en la practica: la base abliterada reduce los rechazos ante peticiones sensibles.
- Compatibilidad con el formato de prompt Llama 3 Instruct; compatibilidad no verificada con formatos ChatML y Alpaca.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso de agentes, razonamiento multi-paso estructurado, vision, audio ni modo "thinking".
- No hay datos publicados sobre rendimiento en codigo, matematicas o tareas de razonamiento formal.
- Capacidad multilingue no documentada: solo se declara ingles.

## Casos de uso

- Escritura de ficcion de formato largo: el modelo esta ajustado explicitamente para prosa creativa y respuestas extensas, por lo que encaja en la generacion de capitulos, relatos o borradores narrativos en ingles con prompts de sistema elaborados.
- Roleplay conversacional en frontends de escritura: pensado para usarse en herramientas como SillyTavern con tarjetas de personaje; el autor documenta sus pruebas precisamente en ese flujo, con longitud de respuesta limitada a 8192 tokens.
- Guionizado y diseno de personajes para narrativa interactiva: permite iterar dialogos y voces de personaje sin los rechazos tipicos de un modelo alineado de forma estricta, util en preproduccion de videojuegos narrativos.
- Asistencia como director de juego en partidas de rol de mesa: generacion de descripciones, dialogos de PNJ y ramificaciones de trama a partir de un contexto de campana introducido en el prompt de sistema.
- Red teaming y evaluacion de seguridad: al ser un modelo abliterado, sirve como sujeto de prueba para estudiar que tipo de contenido genera un modelo sin capas de rechazo y para calibrar filtros posteriores.
- Generacion de datos sinteticos de narrativa: produccion de corpus de texto creativo o de dialogos en ingles para experimentos internos, siempre con revision humana y teniendo en cuenta las restricciones de la licencia Llama 3.
- Escritura privada en local: al ocupar unos 6,8 GB en formato EXL2 6 BPW, puede ejecutarse en una GPU de consumo sin enviar el texto a servicios externos, lo que resulta adecuado para material confidencial o para contenido adulto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco hay datos de evaluacion de seguridad o de calidad de la cuantizacion EXL2 6 BPW frente al bf16 original.

## Requisitos de hardware

- VRAM estimada para los pesos: el repositorio ocupa 6,8 GB, coherente con un modelo de 8B cuantizado a 6 BPW. Se recomienda reservar al menos 8 GB de VRAM solo para pesos.
- Memoria adicional para la cache KV: depende de la longitud de contexto efectiva, que no esta documentada. Para un modelo Llama 3 de 8B con GQA, la cache KV en FP16 ronda los 0,12 MB por token, es decir, aproximadamente 1 GB para 8192 tokens. Es una estimacion derivada, no un dato publicado para este modelo.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y 8-12 GB o mas de VRAM. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 puede alojar el modelo con contexto moderado; RTX 4080, RTX 4090, A100 o H100 permiten contextos mas largos y mayor paralelismo.
- Compatibilidad con GPU de consumo: si, siempre que se disponga de una GPU NVIDIA con al menos 8 GB de VRAM. EXL2 esta disenado para CUDA; el soporte de ROCm en ExLlamaV2 es experimental y no hay soporte practico de CPU.
- Opciones de despliegue: ExLlamaV2 (libreria `exllamav2`), TabbyAPI como servidor con API compatible con OpenAI, y text-generation-webui mediante el loader de ExLlamaV2. Para llama.cpp u Ollama habria que usar la version GGUF publicada por el autor del modelo original, no este repositorio EXL2.
- Latencia y throughput estimados: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia por peticion para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| EtherealRainbow-v0.2-8B_EXL2_6BPW (este repo) | ~8B | no disponible | safetensors EXL2 6.0 BPW | Llama 3 Community License | Cuantizacion de terceros, 6,8 GB, 6 descargas y 0 likes en el momento de la consulta |
| EtherealRainbow-v0.2-8B (original de invisietch) | ~8B | no disponible | bf16 safetensors | Llama 3 Community License | Version de referencia, mayor fidelidad numerica y mayor consumo de VRAM |
| EtherealRainbow-v0.2-8B-GGUF (original de invisietch) | ~8B | no disponible | GGUF (Q8_0 entre otras) | Llama 3 Community License | Alternativa para llama.cpp y Ollama, tambien generada por el autor del merge |
| Llama 3 8B Instruct (modelo base de la familia) | 8B | 8192 tokens (segun la familia Llama 3) | safetensors, GGUF en el ecosistema | Llama 3 Community License | Modelo alineado y con rechazos, sin el ajuste para prosa creativa ni el caracter sin censura del merge |

No se dispone de datos verificados de otros merges sin censura de Llama 3 8B en la informacion proporcionada, por lo que no se incluye una comparativa de rendimiento entre ellos.

## Limitaciones y advertencias

- Contenido sensible: la model card advierte de que el modelo esta construido sobre una base abliterada y puede generar respuestas explicitas, perturbadoras u ofensivas. Incluye la etiqueta "not-for-all-audiences".
- Sesgos: no hay ninguna evaluacion de sesgos publicada para este merge. La ausencia de capas de rechazo implica que los sesgos presentes en los datos de los finetunes pueden aflorar sin filtro.
- Alucinacion: al no existir benchmarks ni evaluaciones de fidelidad factual, el riesgo de alucinacion en tareas de conocimiento es desconocido y, en un modelo orientado a ficcion, previsiblemente alto fuera del ambito narrativo.
- Idioma: solo se declara ingles. No hay datos sobre calidad en castellano ni en otras lenguas, y el uso multilingue no esta respaldado por el autor.
- Contexto: la longitud de contexto soportada no esta documentada en la informacion disponible. Los ejemplos de la model card limitan la generacion a 8192 tokens, lo que no equivale a la ventana de contexto.
- Licencia: se aplica la Llama 3 Community License, que impone condiciones de uso, obligaciones de atribucion y clausulas especificas para despliegues a gran escala. Es imprescindible revisarla antes de un uso comercial.
- Madurez: el propio autor califica la version 0.2 como un producto no acabado. Se trata de un merge experimental sin validacion independiente.
- Adopcion: el repositorio de esta cuantizacion registra 6 descargas y 0 likes, por lo que no hay senal de uso comunitario ni de verificacion por terceros.
- Idoneidad en produccion: no se recomienda su uso en atencion al cliente ni en flujos de cara al publico sin una capa de moderacion propia, dado su caracter sin censura y la ausencia de evaluaciones de seguridad.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/babakawhora/EtherealRainbow-v0.2-8B_EXL2_6BPW
- Modelo original en bf16 safetensors: https://huggingface.co/invisietch/EtherealRainbow-v0.2-8B
- Version GGUF del modelo original: https://huggingface.co/invisietch/EtherealRainbow-v0.2-8B-GGUF
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Repositorio de ExLlamaV2: https://github.com/turboderp/exllamav2
- Modelo base de la familia: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Licencia Llama 3: https://llama.meta.com/llama3/license/
