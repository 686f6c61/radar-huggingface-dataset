# 0xSojalSec/Qwen3.8-27B-Humanlike-Chat-GGUF

## Resumen

Qwen3.8-27B-Humanlike-Chat-GGUF es una adaptacion de comportamiento, no un ajuste orientado a benchmarks, publicada por el usuario 0xSojalSec sobre el modelo abliterado huihui-ai/Huihui-Qwen3.8-27B-abliterated (a su vez derivado de Qwen/Qwen3.8-27B). El objetivo declarado es producir respuestas cortas, reciprocas y conversacionales, propias de un interlocutor humano, en lugar del registro asistencial tipico de los modelos instruct. Esta pensado para roleplay de personajes, chat de compania, ficcion interactiva y NPCs con personalidad.

Tecnicamente es un modelo de 26.895.998.464 parametros (~26,9 B) en formato GGUF para llama.cpp, con una ventana de contexto nativa de 262.144 tokens y cuantizaciones desde IQ4_XS (15,10 GB) hasta BF16 (53,81 GB). La model card recomienda arrancar en 32.768 tokens de contexto y subir segun memoria disponible. El adaptador Humanlike Chat es de rango 256, paso 576, y los GGUF publicados lo llevan fusionado con intensidad LoRA 0,7.

Su relevancia actual es doble: por un lado ofrece una alternativa local y sin censura para dialogos largos con KV cache gestionable en GPU de consumo; por otro, es un caso de estudio de la cadena base -> abliterado -> ajuste conversacional, util para quien evalua riesgos de desalineacion. No se han publicado resultados de benchmarks ni metricas objetivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; heredada de Qwen/Qwen3.8-27B |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplicable: la model card no describe una arquitectura MoE |
| Longitud de contexto | 262.144 tokens nativos; el autor recomienda empezar en 32.768 |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 y BF16 (dos shards); adaptador LoRA en FP32 |
| Idiomas soportados | No disponible (los ejemplos de la model card estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) y adaptador LoRA FP32 separado |
| Modelo base | huihui-ai/Huihui-Qwen3.8-27B-abliterated (relacion: quantized) |
| Modalidad | Solo texto |
| Tamano del repositorio | 162,9 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La ficha del autor no detalla la arquitectura interna. Lo que si describe es la cadena de derivacion: se parte de Qwen/Qwen3.8-27B, se aplica un proceso de abliteracion (eliminacion de direcciones de rechazo en el espacio de activaciones) que da lugar a huihui-ai/Huihui-Qwen3.8-27B-abliterated, y sobre ese checkpoint se entrena un adaptador conversacional de rango 256. Los GGUF distribuidos corresponden al paso 576 del entrenamiento, fusionado con fuerza LoRA 0,7; existe ademas un adaptador "legacy" de paso 863 en FP32 para quien quiera ajustar la intensidad en tiempo de inferencia.

Respecto a los datos, la model card afirma que el adaptador aprende "que dijo realmente una persona a continuacion" en conversaciones prolongadas, es decir, se apoya en transcripciones de dialogo humano real en lugar de pares instruccion-respuesta sinteticos. No se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales. Tampoco se documentan innovaciones de inferencia (atencion lineal, decodificacion especulativa), mas alla del soporte estandar de llama.cpp para desactivar el modo de razonamiento con `--reasoning off`.

## Capacidades

- Generacion de texto conversacional en turnos cortos, con estilo coloquial y reciproco.
- Roleplay de personaje sostenido, con o sin character card o system prompt.
- Ficcion interactiva y narrativa de larga duracion gracias a la ventana de 262.144 tokens.
- Chat personal y de compania: el modelo responde como interlocutor, no como asistente.
- Simulacion de NPCs con personalidad y relaciones definidas por prompt.
- Modo de razonamiento del modelo base, desactivable; el ajuste prioriza respuestas breves frente a cadenas de pensamiento largas.
- Comportamiento sin censura heredado de la abliteracion: reduce rechazos y filtros de contenido.
- Solo texto: no hay vision, audio ni entrada multimodal.
- Tool calling y function calling: no documentados en la informacion disponible.
- Uso agentico o razonamiento multi-paso: no documentado; el ajuste va en direccion contraria (dialogo natural).
- Capacidades multilingues: no confirmadas por el autor.

## Casos de uso

- Roleplay de personajes en local: cargando un GGUF Q5_K_M o Q6_K en una GPU de 24 GB y un character card en SillyTavern, el modelo mantiene una identidad coherente en sesiones largas gracias a los 32.768 tokens de contexto iniciales, ampliables a 262.144.
- Chat de compania y bienestar conversacional: para prototipos de aplicaciones de acompanamiento donde se busca un registro humano y cotidiano, con el aviso de que la abliteracion permite contenido que otros modelos rechazarian.
- NPCs para videojuegos y prototipos de mundos virtuales: el modelo genera respuestas breves y contextuales que encajan en bucles de dialogo ramificado, con coste de inferencia controlable en cuantizacion IQ4_XS o Q4_K_M.
- Ficcion interactiva y novelas visuales: escritura asistida por turnos donde el modelo reacciona a las acciones del lector, aprovechando la ventana larga para mantener la memoria de la trama.
- Generacion de dialogos para guiones y测试 de guion: producir conversaciones naturales entre personajes para despues editarlas, ya que el estilo es coloquial y no explicativo.
- Investigacion sobre alineacion y seguridad: comparar las respuestas del modelo base, del abliterado y de este ajuste permite estudiar como la eliminacion de rechazos y un corpus conversacional real modifican el comportamiento.
- Evaluacion de despliegue local en llama.cpp: sirve como banco de pruebas para medir consumo de KV cache y latencia a 32.768, 65.536 y 131.072 tokens en hardware de consumo.
- Demo publica sin infraestructura propia: existe un Space de Hugging Face vinculado en la model card que ejecuta el modelo a fuerza 0,7.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el autor describe explicitamente el trabajo como "una adaptacion de comportamiento, no un fine-tune de benchmark". Tampoco se aportan mediciones de latencia o throughput.

## Requisitos de hardware

- IQ4_XS (15,10 GB): descarga de CPU o memoria muy limitada; requiere offload parcial a CPU.
- Q4_K_M (16,56 GB): pensado para equipos de 20 GB de VRAM o con offload parcial a CPU. Es la cuantizacion recomendada por el autor para la mayoria de usuarios.
- Q5_K_M (19,24 GB): clase 24 GB de VRAM, o bien offload parcial.
- Q6_K (22,09 GB): 24 GB o mas de VRAM; mejor equilibrio calidad-memoria segun el autor.
- Q8_0 (28,60 GB): requiere 32 GB o mas de VRAM.
- BF16 en dos shards (53,81 GB): 64 GB o mas de VRAM, orientado a maxima fidelidad o a recuantizar.
- GPU recomendadas por rango: RTX 3090/4090 (24 GB) para Q5_K_M y Q6_K; A100 40 GB, A100 80 GB o H100 para Q8_0 y BF16; GPUs de 16-20 GB o configuraciones con offload para Q4_K_M e IQ4_XS.
- CPU: viable en todos los quant con llama.cpp, con penalizacion de latencia no cuantificada por el autor.
- La memoria adicional para KV cache crece con el contexto. El autor recomienda reservar espacio libre y empezar en 32.768 tokens antes de subir a 65.536, 131.072 o 262.144.
- Despliegue: llama.cpp (`llama serve`), SillyTavern como frontend de Text Completion, y cualquier runtime compatible con GGUF (Ollama, LM Studio, text-generation-webui). vLLM y TGI no se mencionan y no son los formatos objetivo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Relacion |
|---|---|---|---|---|---|
| 0xSojalSec/Qwen3.8-27B-Humanlike-Chat-GGUF | 26,9 B | 262.144 tokens | Apache-2.0 | GGUF + LoRA FP32 | Objeto de esta ficha |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | No disponible en la informacion | No disponible | No disponible | No disponible | Modelo base directo, sin el adaptador conversacional |
| Qwen/Qwen3.8-27B | No disponible en la informacion (27 B por nomenclatura) | No disponible | No disponible | No disponible | Modelo original de la cadena |

No se dispone de datos verificados de contexto, licencia o rendimiento de los dos antecesores mas alla de lo indicado en la propia model card, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria. Tampoco se han identificado en la busqueda web modelos comparables publicados en el mismo rango de tamano y orientacion.

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de direcciones de rechazo implica que puede generar contenido ofensivo, sexual, violento o ilegal. No es apto para produccion orientada al publico general sin una capa de moderacion adicional.
- Ausencia total de evaluaciones: no hay benchmarks ni auditorias de seguridad publicadas, por lo que el comportamiento real en dominios sensibles es desconocido.
- Riesgo de alucinacion: al ser un ajuste conversacional sin recuperacion documental ni verificacion factual, puede inventar datos con un registro coloquial que dificulta detectar el error.
- Sesgos: el corpus de entrenamiento no esta descrito, asi que se desconocen los sesgos de genero, cultura o ideologia incorporados; el estilo "humano real" puede reproducir sesgos de conversaciones cotidianas de forma mas naturalizada.
- Idiomas: no confirmados. Los ejemplos publicados estan en ingles y el autor no declara cobertura multilingue, por lo que el rendimiento en castellano no esta garantizado.
- Deriva de personaje: en contextos muy largos el modelo puede perder consistencia de identidad; el autor recomienda empezar en 32.768 tokens y validar antes de escalar.
- Coste de memoria del contexto largo: los 262.144 tokens nativos implican un KV cache considerable; en GPUs de consumo obligan a reducir contexto o a hacer offload a CPU.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero la responsabilidad legal y etica del contenido generado recae en quien despliega el modelo.
- Trazabilidad dudosa: el ID del repositorio apunta al usuario 0xSojalSec, mientras que los enlaces de descarga y el Space del README apuntan a LessThanThreeAI. Los pesos pueden estar duplicados o ser distintos entre ambos repositorios, algo que conviene verificar antes de integrarlos.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad. Ademas, la fecha de creacion declarada (2026-09-20) es posterior a la fecha habitual de publicacion, lo que sugiere metadatos poco fiables.
- Cuantizaciones: las versiones por debajo de Q5_K_M pueden degradar la calidad del dialogo; el autor no publica una evaluacion comparativa entre quant.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/0xSojalSec/Qwen3.8-27B-Humanlike-Chat-GGUF
- Repositorio referenciado en el README (descargas): https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Demo alojada (Space): https://huggingface.co/spaces/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat
- Ejemplos de conversacion (EXAMPLES.md): https://huggingface.co/LessThanThreeAI/Qwen3.8-27B-Humanlike-Chat-GGUF/blob/main/EXAMPLES.md
- Comunidad en Discord: https://discord.gg/jWbqEqsgAf
- Busqueda web: no se han encontrado resultados relevantes sobre el modelo; las consultas devolvieron unicamente listados de vehiculos de segunda mano sin relacion con el proyecto.
