# andyx10/simplestories-trigger-organisms

## Resumen

`andyx10/simplestories-trigger-organisms` es una coleccion de organismos modelo de juguete (toy model organisms) entrenados sobre los modelos de la familia SimpleStories V2 para estudiar backdoors condicionales de forma controlada. Cada organismo asocia un disparador (trigger), tipicamente un nombre de personaje o una frase al inicio del relato, con un comportamiento oculto (por ejemplo, que la historia derive hacia una tematica pirata). El autor es andyx10 y el repositorio se publica bajo licencia MIT.

El interes del artefacto es de investigacion en interpretabilidad: al tratarse de modelos diminutos (1,25M, 5M, 11M y 35M parametros) con un vocabulario cerrado de 16 nombres, los backdoors son analizables a nivel de pesos. El repositorio contiene 1.415 adaptadores en total: 1.077 entrenados (mayoritariamente LoRA de rango 1 a 64, mas algunos fine-tunes completos) y 338 construidos por aritmetica de pesos (sumas, escalados, circuitos podados e intercambios de factores de lectura/escritura) que se evaluan pero nunca se entrenan.

No es un modelo generativo para produccion ni un asistente conversacional: es un banco de experimentos para estudiar como se almacenan, componen y detectan comportamientos condicionales en adaptadores de bajo rango. La arquitectura subyacente es Llama (transformer decoder-only) con tokenizador WordPiece compartido de 4.019 tokens que normaliza a minusculas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (modelos base SimpleStories V2) |
| Parametros totales | Cuatro tamanos base: 35M (12 bloques, d=512), 11M (6 bloques, d=384), 5M (6 bloques, d=256), 1.25M (4 bloques, d=128) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenamiento con secuencias de hasta 256 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el dataset SimpleStories es sintetico en ingles; el tokenizador normaliza a minusculas) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch): LoRA en convencion DIT `{module: (A [r, out], B [in, r])}` con `delta(x) = (x @ B) @ A / r`; fine-tunes completos como `{module: delta [out, in]}`; checkpoints en fp16 en algunos estudios |

## Arquitectura y entrenamiento

Los modelos base son transformers decoder-only de la familia SimpleStories V2, con 12 bloques y d=512 en el mayor (35M) y hasta 4 bloques y d=128 en el menor (1.25M). Comparten un tokenizador WordPiece de 4.019 tokens que pasa todo a minusculas, lo que permite que los nombres del conjunto cerrado de 16 personajes funcionen como disparadores de un solo token. Los adaptadores se entrenan sobre las capas lineales del decoder (q, k, v, o, gate, up, down) en rangos de 1 a 64, con varias semillas y dos inicializaciones distintas.

La receta de entrenamiento (splice recipe) combina ejemplos positivos con perdida de next-token solo sobre la continuacion y ejemplos negativos con divergencia KL respecto al modelo base. Los positivos son una apertura neutra de dos frases que satisface el disparador seguida del texto del comportamiento; los negativos incluyen aperturas casi-coincidentes con su propia continuacion y relatos neutros con nombres de control. Los hiperparametros por defecto son 1 epoca, lr 1e-3, batch 32, secuencias de hasta 256 tokens y peso KL de 1. La evaluacion exige que cada condicion positiva alcance su tasa de exito (0,8 en los primeros estudios, 0,5 desde el estudio complejo), que las condiciones negativas no superen en mas de 0,05 al modelo base y que la perdida en historias sin disparador se mantenga en 1,02-1,03 veces la del base.

## Capacidades

- Generacion de texto narrativo corto en ingles sobre el dominio sintetico de SimpleStories.
- Comportamiento condicional aprendido: activacion de una tematica concreta ante un disparador especifico (nombre de personaje, frase, categoria de palabra, etiqueta de dataset, año, etc.).
- Disparadores de complejidad creciente: nombres de un token, nombres de 2 a 4 tokens, reglas de dos nombres (and, orden, xor), categorias de palabras, frases exactas de 1 a 32 tokens, etiquetas del dataset y un disparador inverso.
- Comportamientos diversos: cambio de tema, cambio de estilo, cambio de tiempo verbal, ausencia de dialogo y comportamiento de eco.
- Composicion de adaptadores: suma, escalado, poda de circuitos e intercambio de factores de lectura/escritura, evaluables sin reentrenamiento.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no disponible; el entrenamiento se limita al corpus sintetico en ingles.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: analizar como un adaptador LoRA de rango bajo codifica un mapeo disparador-comportamiento, descomponiendo los factores de lectura (B) y escritura (A) y su dependencia mutua.
- Estudio de deteccion de backdoors: usar los organismos como ground truth controlado para validar tecnicas de escaneo de modelos, ya que se conoce exactamente el disparador y el comportamiento esperado.
- Experimentos de composicion de adaptadores: sumar o escalar LoRA entrenados para comprobar si los comportamientos se combinan, se interfieren o se cancelan, con 338 adaptadores construidos ya disponibles para comparar.
- Analisis de capacidad: el estudio `capacity/` entrena K backdoors en un mismo adaptador para medir cuantos comportamientos condicionales caben antes de degradar el modelo base.
- Investigacion sobre localizacion de circuitos: los estudios `multitoken/` registran donde se detecta el disparador y cuanto tardan en responder las lecturas posteriores, lo que permite estudiar la propagacion de la senal a traves de las capas.
- Docencia y divulgacion: modelos de 1,25M a 35M parametros que se entrenan y evaluan en hardware modesto, utiles para ensenar conceptos de backdoors, LoRA y evaluacion de comportamiento sin infraestructura grande.
- Pruebas de robustez de pipelines de evaluacion: servir como casos de prueba negativos para verificar que un clasificador de comportamiento detecta derivas tematicas introducidas deliberadamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion descrita es especifica del autor: una continuacion muestreada (T = 0,7, 150 tokens salvo indicacion) por cada apertura de evaluacion y condicion, puntuada contra el comportamiento mediante un lexico de palabras clave (por ejemplo, "pirate"/"pirates" para la tematica pirata). Los criterios de aprobado se detallan en la seccion de arquitectura y entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Los modelos base van de 1,25M a 35M parametros, por lo que en fp32 el mayor ocupa del orden de decenas de MB y los adaptadores LoRA anaden una fraccion minima; el repositorio completo ocupa 9,7 GB por acumulacion de pesos y checkpoints.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el entrenamiento y la evaluacion caben en CPU para los tamanos menores.
- Cabe en GPU consumer: si, en todas las GPU consumer actuales e incluso en entornos sin GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; los pesos se distribuyen en formato `.pt` de PyTorch con la convencion DIT, lo que requiere cargarlos con codigo propio sobre el modelo base correspondiente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| andyx10/simplestories-trigger-organisms | 1,25M-35M (base) + LoRA | No disponible | Organismos con backdoor para interpretabilidad | MIT | Hugging Face |
| SimpleStories-V2-35M | 35M | No disponible | Modelo base de generacion de historias sinteticas | No disponible | Hugging Face (SimpleStories) |
| SimpleStories-V2-1.25M | 1.25M | No disponible | Modelo base de generacion de historias sinteticas | No disponible | Hugging Face (SimpleStories) |

No se dispone de informacion sobre otros conjuntos de organismos modelo comparables en la busqueda realizada.

## Limitaciones y advertencias

- No es un modelo para produccion: es un banco de organismos de juguete con comportamiento condicional deliberado, entrenado sobre un corpus sintetico y un dominio narrativo muy acotado.
- Los backdoors son intencionados: cualquier uso fuera de investigacion de interpretabilidad o seguridad puede producir derivas tematicas no deseadas ante los disparadores.
- Sesgos conocidos: no documentados; el dataset SimpleStories es sintetico y de dominio limitado, por lo que no representa la distribucion del lenguaje natural.
- Riesgo de alucinacion: no evaluado; el modelo genera historias, no hechos verificables.
- Limitaciones de idioma: no se declaran idiomas soportados; el tokenizador normaliza a minusculas y el entrenamiento se limita al corpus en ingles.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base y el dataset tienen sus propias condiciones, no detalladas en la informacion disponible.
- Los pesos en `.pt` con convencion DIT requieren codigo de carga especifico; no hay integracion documentada con frameworks de inferencia estandar.
- El repositorio de 9,7 GB agrega cientos de adaptadores y checkpoints, lo que complica su uso selectivo sin descargar el conjunto completo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/andyx10/simplestories-trigger-organisms
- Organizacion SimpleStories en Hugging Face: https://huggingface.co/SimpleStories/models
- Modelo base SimpleStories-V2-1.25M: https://huggingface.co/SimpleStories/SimpleStories-V2-1.25M
- Dataset SimpleStories: https://huggingface.co/datasets/SimpleStories/SimpleStories
