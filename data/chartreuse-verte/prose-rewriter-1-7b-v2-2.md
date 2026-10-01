# chartreuse-verte/prose-rewriter-1.7b-v2.2

## Resumen

prose-rewriter-1.7b-v2.2 es un modelo de reescritura de prosa a nivel de parrafo desarrollado por el usuario chartreuse-verte. Su funcion es tomar texto generado por modelos grandes y reescribirlo para que suene mas humano, preservando la semantica original. No es un modelo conversacional: recibe un unico parrafo y devuelve una reescritura estilistica.

Tecnicamente se trata de un fine-tuning por LoRA de rango 32, fusionada a fuerza 1.15, sobre Qwen/Qwen3-1.7B-Base. Cuenta con 2.031.739.904 parametros totales (aproximadamente 2.03 mil millones) en precision bf16 y un tamano de repositorio de 6,2 GB. Esta especializado en tareas de transferencia de estilo y eliminacion de rasgos tipicos de texto generado por IA (el denominado "slop"), y solo soporta ingles.

La relevancia del modelo reside en su enfoque de post-procesado para pipelines de generacion de contenido: reduce la repeticion (frases completas repetidas caen del 1,5 % al 0,6 % respecto a la version v2.1) y la invencion de nombres propios (del 0,7 % al 0,2 %), con una licencia AGPL-3.0 que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (arquitectura `qwen3`, derivada de Qwen/Qwen3-1.7B-Base) |
| Parametros totales | 2.031.739.904 (aproximadamente 2,03 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (safetensors) y GGUF Q8_0; el cabezal de salida adaptado se almacena por separado en Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (bf16) y GGUF (Q8_0, 2,17 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B-Base, un transformer decoder-only de la familia Qwen3. Sobre esa base se ha aplicado un adaptador LoRA de rango 32 que se fusiona (merge) en los pesos con una fuerza de 1.15. En el repositorio se publican dos variantes: la raiz con safetensors en bf16 bajo la arquitectura `qwen3` para transformers, y una version GGUF Q8_0 para llama.cpp y llama-cpp-python. En la cuantizacion, la plantilla de chat se conserva, la generacion se detiene en `<|im_end|>` y el cabezal de salida adaptado se mantiene separado de los embeddings de tokens.

El entrenamiento es un ajuste especializado para reescritura de prosa, no una alineacion conversacional generica. La model card no detalla el numero de tokens de entrenamiento ni la composicion del dataset. Si se documenta la distribucion de entradas de la piscina de entrenamiento: la mediana es de 37 palabras y el 80 % de los ejemplos esta por debajo de las 70 palabras. La version v2.2 incorpora una cura del conjunto de objetivos: se rechazan los destinos de entrenamiento que se repiten a si mismos (la misma frase dos veces, una expresion repetida, tres frases que empiezan con las mismas palabras), de modo que el modelo solo ve desvanecerse la repeticion. El formato de prompt es especifico y no estandar: se construye con un unico mensaje de rol `source` y una marca de generacion con el rol `rewrite`.

## Capacidades

- Reescritura de prosa a nivel de parrafo: reformula texto preservando el significado original.
- Transferencia de estilo: convierte prosa con rasgos de texto generado por IA en un registro mas humano.
- Reduccion de "slop": disminuye la densidad del lexico tipico de LLM y las construcciones prohibidas.
- Disminucion de repeticiones: baja la tasa de frases, expresiones y anaphoras repetidas respecto al texto de entrada y a la version anterior.
- Control de invencion de entidades: reduce la aparicion de nombres propios no presentes en la entrada (0,2 % en v2.2).
- Generacion en ingles unicamente; no se declaran capacidades multilingues.
- No es un modelo de chat ni soporta tool calling, function calling ni razonamiento multi-paso; la model card indica explicitamente que no es un modelo conversacional.

## Casos de uso

- Post-procesado de contenido generado por IA: integrar el modelo como ultima etapa de un pipeline de redaccion para "humanizar" parrafos antes de publicarlos, reduciendo el lexico marcado y las construcciones repetitivas.
- Edicion editorial asistida: reescribir parrafos de borradores manteniendo el significado y aumentando la variedad en la longitud de las frases.
- Limpieza de datasets de texto sintetico: aplicar la reescritura sobre corpus generados para reducir patrones repetitivos antes de reutilizarlos en entrenamiento o evaluacion.
- Localizacion de estilo en flujos creativos: adaptar la voz de parrafos concretos en proyectos de escritura creativa, dado su enfoque de transferencia de estilo.
- Reduccion de "slop" en respuestas de asistentes: colocar el modelo como capa posterior a un LLM grande para rebajar la densidad de lexico generico en las respuestas finales.
- Filtrado de texto no apto: pasar por alto entradas inferiores a 80 bytes (se recomienda devolverlas sin cambios) y aplicar la reescritura solo a parrafos con al menos 15 palabras aproximadamente.
- Procesado por lotes en CPU: gracias a la variante GGUF Q8_0 de 2,17 GB, se puede desplegar en entornos sin GPU para reescribir grandes volumenes de texto.

## Benchmarks y rendimiento

La model card reporta evaluacion comparativa entre v2.1 (fuerza 1.10) y v2.2 (fuerza 1.15) sobre 365 parrafos de prosa escritos por LLM, no vistos en entrenamiento, a `temperature=0.9, top_p=0.95` y tres generaciones por parrafo (1.095 generaciones por brazo).

Invencion de pronombres y entidades (sobre 400 parrafos de roleplay de un solo genero):

| Metrica | v2.1 | v2.2 |
|---|---|---|
| Pronombre de genero no autorizado por la entrada | 0,4 % | 0,6 % |
| ... perteneciente al otro genero | 0,4 % | 0,6 % |
| Nombre propio ausente en la entrada | 0,7 % | 0,2 % |

Repeticion (sobre 365 parrafos):

| Metrica | Entrada | v2.1 | v2.2 |
|---|---|---|---|
| Cualquier repeticion | 2,2 % | 16,0 % | 13,6 % |
| ... de una frase completa | -- | 1,5 % | 0,6 % |
| ... de una expresion | -- | 8,3 % | 6,9 % |
| ... de una apertura de frase (anafora) | -- | 4,6 % | 4,7 % |

Metricas estructurales (sobre los mismos parrafos):

| Metrica | v2.1 | v2.2 |
|---|---|---|
| Palabras modificadas | 43,7 % | 45,2 % |
| Devueltos sin cambios | 2,9 % | 3,3 % |
| Salidas casi literales | 2,0 % | 2,3 % |
| Por debajo del umbral de edicion de entrenamiento | 36,5 % | 33,1 % |
| Numero de frases alterado | 77,1 % | 76,6 % |
| Variedad de longitud de frase vs entrada | +0,133 | +0,144 |
| Palabras conservadas de la entrada | 0,627 | 0,612 |
| Longitud preservada | 0,879 | 0,861 |
| Truncado por debajo de 0,75x | 19,2 % | 23,2 % |
| 3-gramas repetidos | 0,008 | 0,005 |

Contenido no soportado (evaluado por NLI con la entrada como premisa) y registro:

| Metrica | Entrada | v2.1 | v2.2 | Corpus humano |
|---|---|---|---|---|
| Frases no soportadas, media por reescritura | -- | 13,3 % | 13,1 % | -- |
| Frases no soportadas, todas las reescrituras | -- | 12,4 % | 11,8 % | -- |
| Cobertura de la entrada (entailment inverso) | -- | 0,508 | 0,487 | -- |
| Construcciones prohibidas por 1k | 7,52 | 2,90 | 2,92 | 0,00 |
| Densidad del lexico "slop" | 0,081 | 0,050 | 0,048 | 0,019 |
| Puntuacion "purple" | 0,498 | 0,311 | 0,313 | -- |

Comparaciones pareadas: los nombres propios inventados caen (t = -2,3) y la densidad del lexico tambien (t = -2,5). En los 303 pares de 51-90 palabras, v2.2 baja del umbral de edicion con menos frecuencia (t = -2,1) y repite menos 3-gramas (t = -2,1); conserva menos palabras de la entrada (t = -2,5), mantiene menos longitud (t = -3,2) y trunca por debajo de 0,75x mas a menudo (t = +2,6). Ninguna otra columna separa ambas versiones.

## Requisitos de hardware

- Peso en bf16: aproximadamente 4,06 GB solo de parametros (2.031.739.904 parametros), mas cache KV y activaciones. Con overhead, cabe en GPUs de 8 GB o mas.
- Variante GGUF Q8_0: 2,17 GB, apta para inferencia en CPU o en GPUs de gama baja.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 son suficientes con holgura; al ser un modelo de 2B no requiere aceleradores de gran memoria.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas de 8 GB o mas (por ejemplo, RTX 3060/3070/4060) con bf16, y con mucha holgura usando la cuantizacion Q8_0.
- Opciones de despliegue: transformers (safetensors bf16), llama.cpp y llama-cpp-python (GGUF Q8_0), text-generation-inference y endpoints compatibles segun los tags del repositorio.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables directos en la informacion proporcionada. Como referencia de partida, el propio modelo deriva de Qwen/Qwen3-1.7B-Base, pero la model card no incluye comparacion con alternativas de reescritura o transferencia de estilo.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| prose-rewriter-1.7b-v2.2 | 2,03 mil millones | no disponible | ver tabla de benchmarks de la ficha | AGPL-3.0 | HuggingFace (safetensors, GGUF) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran capacidades multilingues.
- No es un modelo de chat: cada llamada debe enviar un unico mensaje con rol `source`. Un uso conversacional no es el previsto.
- Entradas cortas problematicas: por debajo de aproximadamente 15 palabras el fallo tipico es relleno, recorte o fabricacion; por debajo de 80 bytes se recomienda devolver el texto sin cambios.
- La propia evaluacion reporta un 13,1 % de frases no soportadas (no implicadas por la entrada) y una cobertura de la entrada de 0,487, lo que indica riesgo de omision y de anadir contenido no presente en el original.
- Tendencia al truncado: un 23,2 % de las salidas quedan por debajo de 0,75x de la longitud de entrada en v2.2.
- Riesgo de invencion de pronombres de genero no autorizados (0,6 % en v2.2) y de nombres propios ausentes en la entrada (0,2 %).
- Persisten repeticiones (13,6 % de las reescrituras muestran alguna), aunque inferiores a v2.1.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el software que lo integre y sobre el servicio en red; puede limitar su uso en productos comerciales cerrados.
- Temperatura recomendada de 0.9 con top-p 0.9 (0.95 en evaluacion); otros valores no estan validados por el autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: adopcion y soporte de la comunidad no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v2.2
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a la liqueur y la region francesa de Chartreuse y no guardan relacion con este proyecto.
