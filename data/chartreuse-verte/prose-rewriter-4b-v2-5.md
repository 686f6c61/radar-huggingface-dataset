# chartreuse-verte/prose-rewriter-4b-v2.5

## Resumen

prose-rewriter-4b-v2.5 es un modelo especializado en la reescritura de prosa a nivel de parrafo, desarrollado por el usuario chartreuse-verte. Su funcion no es conversacional ni de proposito general: recibe un parrafo redactado por un modelo grande (o por un humano) y lo vuelve a redactar para que suene mas natural, preservando la semantica original. El modelo parte de Qwen/Qwen3-4B-Base, al que se le ha fusionado un adaptador LoRA de rango 32 con una fuerza de 1.20.

El problema que aborda es el denominado "slop" en texto generado por IA: adverbios de modo que desaparecen, frases que se fusionan o se truncan, hechos inventados y cambios de significado. La version v2.5 mejora sobre la v2.4 en retencion de adverbios de modo (66,0% frente a 49,5%), reduce la invencion de hechos (5,4% frente a 7,5%) y el cambio de significado (14,5% frente a 18,9%), y disminuye las reescrituras con dos o mas frases menos que la entrada (1,9% frente a 7,3%).

El modelo tiene 4.411.424.256 parametros, se distribuye en safetensors bf16 y en cuantizaciones GGUF (Q8_0 y Q4_K_M), y esta pensado para entradas de una frase en adelante, con un suelo practico de unas 15 palabras. No es un modelo de chat: cada llamada procesa un unico mensaje con rol `source`. La licencia es AGPL-3.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), LoRA de rango 32 fusionado sobre Qwen/Qwen3-4B-Base a fuerza 1.20 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0 y Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer Qwen3 de 4B parametros sobre el que se ha aplicado un adaptador LoRA de rango 32, fusionado en los pesos base con una fuerza de 1.20. La cabeza de salida adaptada se mantiene separada de los embeddings de tokens en las versiones GGUF (Q8_0 en el fichero Q8_0 y Q6_K en el Q4_K_M). El prompt se construye con una plantilla de chat especifica que renderiza un unico mensaje con rol `source` y genera tras la marca `<|im_start|>rewrite`, terminando en `<|im_end|>`.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La evaluacion se realizo sobre 300 parrafos de ficcion escrita por humanos y 365 parrafos de prosa escrita por LLM, con tres generaciones por entrada, a temperatura 0.9 y top_p 0.95. El pool de entrenamiento tiene una mediana de 37 palabras por entrada, con el 80% por debajo de 70 palabras.

## Capacidades

- Reescritura de prosa a nivel de parrafo preservando la semantica de la entrada.
- Estilo de transferencia orientado a reducir el "slop" de texto generado por IA.
- Retencion de adverbios de modo en acciones (66,0% en prosa humana de retencion).
- Reduccion de invencion de hechos (5,4% en prosa de LLM) y de cambios de significado (14,5%).
- Menor fusion y truncamiento de frases: reescrituras con dos o mas frases menos que la entrada bajan al 1,9%.
- Preservacion de longitud cercana a la original (0,939 de ratio en v2.5).
- Capacidad limitada de generar prosa en ingles; no es un modelo conversacional ni de instrucciones.
- No soporta tool calling, function calling ni razonamiento multi-paso de agentes.
- No dispone de vision, audio ni modo thinking.

## Casos de uso

- Limpieza de textos generados por LLM en pipelines editoriales: el modelo recibe cada parrafo generado por un modelo grande y lo reescribe para eliminar marcas de estilo artificial, manteniendo el contenido semantico y la longitud original.
- Post-procesado de ficcion asistida por IA: escritores que usan un LLM para borradores pueden pasar cada parrafo por el reescritor para recuperar adverbios de modo y variedad de longitud de frase, con menos riesgo de inventar detalles.
- Normalizacion de estilo en corpus de entrenamiento: util para homogeneizar el registro de textos generados antes de usarlos como datos de entrenamiento o evaluacion.
- Reescritura de resenas y contenido de marketing: convertir borradores generados por IA en texto con ritmo mas humano, conservando las afirmaciones originales y evitando anadir hechos no soportados.
- Control de calidad en publicacion automatizada: integrado como paso previo a la publicacion, reduce el truncamiento por debajo de 0,75x (3,7% en v2.5) y las reescrituras con frases perdidas (1,9%).
- Preservacion de voz en traduccion o adaptacion: cuando se parte de un texto ya reescrito por otro sistema, el modelo mantiene los adverbios y la estructura de acciones, lo que ayuda a conservar la intencion estilistica original.
- Generacion de variantes de un mismo parrafo: con temperatura 0.85 y top_p 0.9 se pueden producir varias reescrituras de un parrafo para elegir la mejor, aunque el modelo no esta disenado para conversacion multi-turno.

## Benchmarks y rendimiento

Los datos de evaluacion publicados por el autor comparan v2.4 y v2.5 sobre prosa humana y prosa generada por LLM. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

Prosa humana (300 parrafos de ficcion no vistos, 900 generaciones por variante):

| Metrica | Entrada | v2.4 | v2.5 |
|---|---|---|---|
| Adverbios de modo conservados | - | 49,5% | 66,0% |
| Adverbios de modo por 100 palabras | 1,99 | 1,11 | 1,47 |
| Juez: anade hecho o cambia significado | - | 11,7% | 10,1% |
| Frases no soportadas (NLI) | - | 2,5% | 2,1% |
| Palabras por frase | 17,4 | 17,9 | 15,7 |
| Dos o mas frases menos que la entrada | - | 7,3% | 1,9% |

Prosa escrita por LLM (365 parrafos, 1.095 generaciones por variante):

| Metrica | v2.4 | v2.5 |
|---|---|---|
| Anade un hecho no soportado | 7,5% | 5,4% |
| Cambia el significado de algo dicho | 18,9% | 14,5% |
| Cualquiera de los dos | 21,4% | 16,2% |
| Frase mal formada (entrada: 0,3%) | 2,3% | 3,7% |

Estructura sobre los mismos parrafos:

| Metrica | v2.4 | v2.5 |
|---|---|---|
| Palabras cambiadas | 42,3% | 35,8% |
| Salida sin cambios | 0,0% | 0,7% |
| Salidas casi verbatim | 0,0% | 0,0% |
| Por debajo del suelo de edicion de entrenamiento | 36,7% | 54,3% |
| Numero de frases modificado | 58,1% | 61,9% |
| Variedad de longitud de frase frente a entrada | +0,024 | +0,046 |
| Palabras conservadas de la entrada | 0,637 | 0,692 |
| Longitud preservada | 0,921 | 0,939 |
| Truncado por debajo de 0,75x | 5,9% | 3,7% |

Repeticion (prosa de LLM):

| Metrica | Entrada | v2.4 | v2.5 |
|---|---|---|---|
| Cualquier repeticion | 2,2% | 3,8% | 3,6% |
| Frase completa repetida | - | 0,0% | 0,1% |
| Frase repetida | - | 1,6% | 1,2% |
| Apertura de frase repetida (anafora) | - | 1,8% | 1,6% |

Invencion de personas (prosa de LLM):

| Metrica | v2.4 | v2.5 |
|---|---|---|
| Pronombre generizado no autorizado por la entrada | 0,5% | 0,5% |
| ... del genero opuesto | 0,0% | 0,0% |
| Nombre propio que la entrada no tiene | 0,4% | 0,5% |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda una GPU con 12-16 GB o mas.
- GGUF Q8_0: 4,69 GB de fichero; cabe en GPUs consumer con 8 GB de VRAM.
- GGUF Q4_K_M: 2,72 GB de fichero; cabe en GPUs consumer con 6 GB de VRAM o incluso en CPU.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para bf16; RTX 4060 Ti, RTX 3060 o superiores para las cuantizaciones GGUF.
- Despliegue: transformers (bf16), llama.cpp y llama-cpp-python (GGUF Q8_0 y Q4_K_M). No se mencionan vLLM, TGI ni Ollama en la informacion disponible, aunque el tag `text-generation-inference` aparece en los metadatos de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo, por lo que la comparativa se limita a caracteristicas estructurales frente a alternativas genericas de reescritura o modelos base de tamano similar.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| prose-rewriter-4b-v2.5 | 4,41B | no disponible | AGPL-3.0 | Reescritura de prosa, ingles |
| Qwen/Qwen3-4B-Base | 4B | no disponible | no disponible | Modelo base generalista |
| Modelos de reescritura genericos (p. ej. instrucciones de estilo) | variable | variable | variable | Requieren prompting y no estan especializados |

No se han identificado en la informacion disponible modelos comparables directamente especializados en reescritura de prosa con metricas publicadas equivalentes.

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- No es un modelo conversacional: cada llamada debe contener un unico mensaje con rol `source`; no mantiene contexto multi-turno.
- Suelo practico de unas 15 palabras por entrada; por debajo de 80 bytes conviene pasar el texto sin cambios, ya que el modelo tiende a rellenar, recortar o fabricar.
- Riesgo de invencion de hechos (5,4% en prosa de LLM) y de cambios de significado (14,5%); no es adecuado para reescritura de textos factuales sin revision humana.
- Aumento de frases mal formadas en v2.5 (3,7% frente a 2,3% en v2.4).
- El 54,3% de las salidas quedan por debajo del suelo de edicion de entrenamiento, lo que indica reescrituras conservadoras.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el software que lo integre y sobre posibles modificaciones; revisar compatibilidad antes de uso comercial en productos propietarios.
- No dispone de tool calling, agentes, vision ni audio.
- No se han publicado resultados en benchmarks estandar, por lo que la evaluacion comparativa con otros modelos es limitada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v2.5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios o demos adicionales.
