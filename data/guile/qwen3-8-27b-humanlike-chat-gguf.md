# Guile/Qwen3.8-27B-Humanlike-Chat-GGUF

## Resumen

Guile/Qwen3.8-27B-Humanlike-Chat-GGUF es una cuantizacion en formato GGUF de un modelo de 26.895.998.464 parametros (aproximadamente 26,9B) derivado de huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez parte de Qwen/Qwen3.8-27B. Sobre esa base se ha aplicado un adaptador LoRA de rango 256 (paso 863) denominado Humanlike Chat, orientado a que el modelo responda como un interlocutor humano en conversaciones largas en lugar de como un asistente. La model card lo describe explicitamente como una adaptacion de comportamiento, no como un fine-tune orientado a benchmarks.

El problema que aborda es concreto: los asistentes conversacionales convencionales contestan de forma mecanica, cubren todos los detalles del mensaje y rara vez siguen el subtexto, el tono o la dinamica relacional. Este modelo se entrena con lo que una persona respondio realmente en conversaciones prolongadas, lo que cambia que detalles nota, que deja sin responder, cuando bromea y cuanto decide decir. Esta pensado para roleplay de personajes, chat personal, ficcion interactiva y NPCs con personalidad, y no requiere un prompt de persona para activar ese registro.

Es relevante ahora por tres motivos: mantiene el contexto nativo de 262.144 tokens de la familia Qwen3.8 (con recomendacion de arrancar en 32.768), se distribuye en cuantizaciones que van de 13,32 GB a 53,81 GB, lo que permite ejecucion local en GPU de consumo con offload parcial, y su base esta "abliterada" (sin censura), lo que lo situa en el nicho de modelos locales sin filtros para escritura creativa. La licencia declarada es Apache-2.0 y el pipeline es text-generation en exclusiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (derivado de la familia Qwen3.8; se describe como transformer de generacion de texto, sin detalle de capas ni mecanismo de atencion) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9B) |
| Parametros activos | No disponible (la informacion no indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos; valor recomendado de inicio: 32.768; valores intermedios sugeridos: 65.536 y 131.072 |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 y BF16 (en dos shards); se menciona el uso de imatrix |
| Idiomas soportados | No disponible (los ejemplos de la model card estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp); se menciona tambien un adaptador LoRA en FP32 |

Otros datos: modalidad texto unicamente, biblioteca gguf, tamano del repositorio 161,1 GB, 0 descargas y 0 likes en el momento de la consulta, fecha de creacion 2026-09-11.

## Arquitectura y entrenamiento

No se detalla la arquitectura interna (numero de capas, tipo de atencion, uso de RoPE, GQA o cualquier variante) en la informacion disponible; lo unico indicado es que se trata de un modelo de generacion de texto de la familia Qwen3.8, con un maximo nativo de 262.144 tokens, y que su base es huihui-ai/Huihui-Qwen3.8-27B-abliterated, una version abliterada de Qwen/Qwen3.8-27B. La adaptacion se aplica como un adaptador LoRA de rango 256, correspondiente al paso 863 de entrenamiento, y despues se fusiona y se cuantiza a GGUF. La model card menciona la disponibilidad de un adaptador LoRA en FP32 por separado.

Sobre los datos de entrenamiento, el autor describe el proceso como una adaptacion de comportamiento aprendida a partir de "lo que una persona realmente dijo despues" en conversaciones de larga duracion. No se publican cifras de tokens, composicion del dataset, ni si hubo fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal u otras). El unico detalle operativo reseñable es la recomendacion de desactivar el modo de razonamiento mediante el flag `--reasoning off` en llama.cpp, lo que sugiere que el modelo base incorpora un modo thinking que aqui no interesa para conversacion.

## Capacidades

- Generacion de texto conversacional en registro coloquial, con respuestas cortas y reciprocas en lugar de respuestas de asistente.
- Roleplay de personajes: admite character cards o system prompts para fijar identidad, escenario y relacion, aunque no los necesita para el registro humano.
- Chat personal y de compañia, incluyendo seguimiento de dinamicas relacionales, humor, subtexto y cambios de tema.
- Ficcion interactiva y narrativa ramificada, con iniciativa para introducir elementos sin secuestrar la conversacion.
- Conversaciones multi-turno de gran longitud gracias al contexto nativo de 262.144 tokens, util para memoria de historial extenso.
- Modelo "uncensored": la base abliterada elimina las capas de rechazo tipicas, lo que amplia el rango de contenido que genera.
- Modalidad exclusivamente de texto: no hay vision, audio ni multimodalidad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; de hecho el autor recomienda desactivar el modo de razonamiento.
- Capacidades multilingues: no disponibles; los ejemplos y los parametros de muestreo publicados estan en ingles.

## Casos de uso

- Roleplay de personajes en SillyTavern: el modelo se conecta mediante API de Text Completion contra un backend llama.cpp en local, con contexto de 32.768 tokens y longitud de respuesta de 512, lo que permite sesiones largas manteniendo coherencia de personaje sin depender de un prompt de asistente.
- Companero conversacional en aplicaciones de chat: con system prompts del tipo "eres una persona con vida interna propia", el modelo mantiene turnos cortos y realistas, adecuado para productos de acompañamiento donde un tono de asistente rompería la experiencia.
- Ficcion interactiva y novelas visuales: el contexto largo permite arrastrar el historial completo de la partida y los callbacks narrativos; la naturaleza uncensored evita bloqueos en tramas adultas o violentas.
- NPCs con personalidad para videojuegos: como modelo local de 16,55 GB en Q4_K_M, puede desplegarse en una estacion con GPU de 20-24 GB y servir dialogos dinamicos por personaje usando adaptadores de prompt distintos por character card.
- Generacion de dialogos para guiones y narrativa profesional: util para producir borradores de conversacion con registro natural, marcas de oralidad y respuestas incompletas, que despues se editan; el muestreo recomendado (temperatura 0,7, top_p 0,8, top_k 20, presencia 1,5) favorece variedad sin incoherencia.
- Chat privado sin conexion: al ser GGUF y ejecutable en llama.cpp, todo el procesamiento ocurre en hardware propio, lo que resulta adecuado para entornos con requisitos de confidencialidad o sin acceso a APIs externas.
- Prototipado de personajes y pruebas de personalidad conversacional: equipos de diseño pueden comparar distintas character cards sobre el mismo modelo base y evaluar como cambia el tono, la iniciativa y la longitud de las respuestas antes de invertir en entrenamiento propio.
- Simulacion de entrevistas o entrenamiento de conversacion: el modelo puede sostener un rol con subtexto y responder segun la dinamica relacional, util en herramientas de practica conversacional, siempre que se asuma su falta de verificacion factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no es un fine-tune orientado a rendimiento en benchmarks generales, sino una adaptacion de comportamiento, y no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada. Tampoco se publican comparativas numericas frente a otros modelos.

## Requisitos de hardware

- Q3_K_M (13,32 GB): pensado para offload a CPU o memoria muy limitada; conviene reservar espacio adicional para el runtime y la cache KV.
- Q4_K_M (16,55 GB): opcion de menor consumo, ejecutable con unos 20 GB de VRAM o con offload parcial a CPU.
- Q5_K_M (19,24 GB): requiere una GPU de clase 24 GB o bien offload parcial.
- Q6_K (22,08 GB): requiere 24 GB o mas de VRAM; es el punto de equilibrio recomendado entre calidad y memoria.
- Q8_0 (28,60 GB): requiere 32 GB o mas de VRAM.
- BF16 en dos shards (53,81 GB): requiere 64 GB o mas de VRAM (por ejemplo, A100 80 GB o H100).
- GPU de consumo: una RTX 3090 o RTX 4090 de 24 GB puede alojar Q5_K_M y Q6_K; una GPU de 32 GB (por ejemplo, RTX 5090) puede alojar Q8_0. Q4_K_M entra en tarjetas de 20-24 GB.
- El consumo real crece con la longitud de contexto y la configuracion de la cache KV: pasar de 32.768 a 131.072 o 262.144 tokens exige mucha mas memoria, por lo que las cifras anteriores asumen contexto moderado.
- Opciones de despliegue documentadas: llama.cpp (incluido `llama serve` con `--jinja`, `--n-gpu-layers all`, `--parallel 1` y `--reasoning off`) y SillyTavern como frontend de Text Completion contra el servidor local. El tag `endpoints_compatible` sugiere compatibilidad con endpoints. No se documentan vLLM, Ollama, TGI ni otras alternativas en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni mediciones de latencia para ninguna cuantizacion o GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Relacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Guile/Qwen3.8-27B-Humanlike-Chat-GGUF | 26,9B | 262.144 tokens | Objeto de esta ficha | Apache-2.0 | GGUF, repositorio de 161,1 GB, 0 descargas |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B (nominal) | No disponible | Modelo base directo, sin el adaptador Humanlike Chat | No disponible en la informacion proporcionada | No disponible |
| Qwen/Qwen3.8-27B | 27B (nominal) | 262.144 tokens (segun la model card del derivado) | Base original, con filtros de seguridad | No disponible en la informacion proporcionada | No disponible |

No se dispone de datos de benchmarks ni de comparativas de rendimiento frente a alternativas de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa con otros modelos de roleplay o de ~27B.

## Limitaciones y advertencias

- Modelo abliterado y declarado "uncensored": la base ha eliminado los mecanismos de rechazo, por lo que puede generar contenido adulto, violento, ofensivo o legalmente sensible sin filtros. Requiere moderacion externa si se expone a usuarios finales.
- Riesgo de alucinacion: al ser un modelo conversacional sin foco en precision factual, no es fiable para tareas de recuperacion de hechos, calculo o referencia documental.
- Sesgos: el entrenamiento se basa en conversaciones humanas reales, lo que puede reproducir sesgos de registro, genero, cultura y estilo presentes en esos datos. No se documenta ninguna evaluacion de sesgos.
- Registro coloquial y respuestas cortas: los parametros de muestreo publicados (temperatura 0,7, top_p 0,8, presencia 1,5) y la propia naturaleza del ajuste producen respuestas breves e informales; puede no ser adecuado para casos que exijan respuestas formales, estructuradas o exhaustivas.
- Idiomas: no se declara ninguna lista de idiomas soportados. Los ejemplos, la model card y los parametros recomendados estan en ingles, por lo que el rendimiento en castellano no esta verificado.
- Capacidad de razonamiento reducida de forma deliberada: el autor recomienda `--reasoning off`, lo que indica que el modo de pensamiento del modelo base no forma parte del comportamiento previsto.
- Longitud de contexto y memoria: aunque el maximo nativo es de 262.144 tokens, la cache KV a esas longitudes puede desbordar la VRAM disponible en GPUs de consumo; conviene planificar el contexto en funcion del hardware.
- Licencia: el modelo se declara Apache-2.0, lo que permitiria uso comercial, pero la licencia del modelo base abliterado (huihui-ai/Huihui-Qwen3.8-27B-abliterated) no se detalla en la informacion proporcionada; conviene verificarla antes de un despliegue comercial.
- Validacion comunitaria practicamente nula: 0 descargas y 0 likes, con fecha de creacion y actualizacion separadas por un segundo, lo que sugiere un repositorio recien publicado y sin verificacion independiente.
- Discrepancia de identificadores: el identificador consultado es Guile/Qwen3.8-27B-Humanlike-Chat-GGUF, mientras que los enlaces de descarga y el Space de demostracion de la model card apuntan a LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF. Conviene confirmar cual es el repositorio canonico antes de automatizar descargas.
- Repositorio de 161,1 GB: alojar todas las cuantizaciones requiere un volumen de almacenamiento considerable.
- No hay informacion sobre tool calling, function calling, agentes ni multimodalidad; no deben asumirse estas capacidades en produccion.

## Enlaces

- HuggingFace (identificador consultado): https://huggingface.co/Guile/Qwen3.8-27B-Humanlike-Chat-GGUF
- Repositorio referenciado en la model card: https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF
- Modelo base directo: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Demostracion en navegador (Space): https://huggingface.co/spaces/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat
- Fichero de ejemplos de conversacion: EXAMPLES.md dentro del repositorio del modelo
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.8-27B (referenciado en la model card)
- No se han encontrado papers, blogs tecnicos, repositorios de codigo ni articulos adicionales en los resultados de busqueda web disponibles.
