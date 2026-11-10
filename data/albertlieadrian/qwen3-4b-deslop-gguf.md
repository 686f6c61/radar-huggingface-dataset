# albertlieadrian/qwen3-4b-deslop-GGUF

## Resumen

qwen3-4b-deslop es un ajuste fino por LoRA del modelo Qwen3-4B-Instruct-2507 de Alibaba, desarrollado por Albert Lie (albertlieadrian) dentro del proyecto SteerLab. El objetivo no es mejorar la capacidad bruta del modelo, sino eliminar parcialmente los tics de escritura caracteristicos de los asistentes conversacionales: guiones largos (em dashes), construcciones del tipo "no es X, es Y", listas de tres elementos, preguntas respondidas al vuelo, muletillas de transicion, markdown y emojis en prosa. El resultado es un modelo que produce texto mas plano y con menos marcas estilisticas de generacion automatica.

Tecnicamente es un LoRA de rango 16 destilado de un profesor (el mismo modelo base con un system prompt de estilo plano y un sampler con backtracking tipo Antislop), fusionado posteriormente en los pesos base. No requiere system prompt especial ni sampler no estandar para funcionar. El repositorio publicado contiene unicamente la build GGUF en cuantizacion Q4_K_M (2,5 GB), pensada para llama.cpp y Ollama, mientras que el adaptador LoRA sin fusionar reside en el repositorio hermano `albertlieadrian/qwen3-4b-deslop`.

Es relevante ahora porque aborda un problema practico de produccion: la deteccion informal de "texto de IA" por parte de lectores y editores, y la necesidad de generar prosa utilizable en contextos editoriales sin postprocesado manual. El modelo mantiene el conocimiento del base (sin degradacion medible en un quiz de 30 preguntas factuales) a costa de un drift bajo sobre prosa humana (KL de 0,11).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino LoRA rango 16 fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo); adaptador LoRA en safetensors en el repo `albertlieadrian/qwen3-4b-deslop` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.022 millones de parametros. Sobre el se aplico un LoRA de rango 16, alpha 32 y dropout 0,05 en las proyecciones q, k, v, o, gate, up y down. El entrenamiento se hizo con la perdida calculada solo sobre la respuesta, y el alumno unicamente ve el prompt del usuario (sin system prompt de estilo). Se usaron 557 respuestas, 2 epocas, learning rate 2e-4 y batch de 8, con los temas de desarrollo reservados.

Los datos de entrenamiento se generaron por destilacion: un profesor (el mismo Qwen3-4B-Instruct-2507 con un system prompt de estilo plano y un sampler de backtracking estilo Antislop) escribio 3 respuestas para cada uno de 288 prompts (48 temas por 6 generos: blog, LinkedIn, explicativo, opinion, email y reflexion). Se conservaron 608 de 864 respuestas tras filtrar por fluidez, cumplimiento de las comprobaciones de tarea, ausencia de estudios y estadisticas inventadas, y puntuacion por debajo de la mediana humana en el indicador de habitos. La receta final se eligio frente a otras dos alternativas sobre 24 prompts de desarrollo. Tras el entrenamiento, el adaptador se fusiono en los pesos base y se convirtio a GGUF con llama.cpp en Q4_K_M.

La innovacion principal no esta en la arquitectura sino en el metodo: destilar en un LoRA el efecto de un sampler en tiempo de ejecucion (Antislop, Paech et al., arXiv:2510.15061), de modo que el modelo resultante conserva la mayor parte de la mejora estilistica sin necesidad de configuracion especial en inferencia.

## Capacidades

- Generacion de texto en prosa con estilo plano: articulos de opinion, entradas de blog, publicaciones de LinkedIn, textos explicativos, emails y reflexiones en primera persona.
- Reduccion medible de habitos estilisticos de IA: puntuacion deslop de 21,5 frente a 89,7 del base; 38 de 48 respuestas dentro de la banda humana (frente a 3 de 48 del original).
- Cumplimiento de instrucciones de formato y genero: 47 de 48 comprobaciones de tarea superadas, frente a 39 de 48 del base.
- Establecimiento temprano de una posicion en textos de opinion: 9 de 10 piezas frente a 1 de 10 del modelo original.
- Generacion de emails con saludo y estructura adecuada (aunque con tendencia a inventar nombres de firmante).
- Mantenimiento del conocimiento factual del base: 30 de 30 en un quiz de preguntas factuales faciles.
- Conversacion multi-turno mediante plantilla de chat estandar de Qwen3.
- No soporta vision, audio ni tool calling de forma destacada en la informacion disponible; el ajuste se centra exclusivamente en estilo de escritura.

## Casos de uso

- Redaccion editorial de articulos de opinion: el modelo establece una tesis al principio en 9 de cada 10 piezas, lo que lo hace adecuado para columnas y editoriales donde la posicion debe aparecer en el primer parrafo, con una longitud controlable de 120 a 250 palabras.
- Generacion de contenido para blogs corporativos y newsletters: produce prosa sin muletillas de transicion ni listas de tres, reduciendo la edicion posterior necesaria antes de publicar en un CMS.
- Emails profesionales y comunicaciones internas: genera mensajes con saludo y estructura adecuada, util para borradores de correo en herramientas de productividad, aceptando la limitacion de nombres de firmante inventados.
- Publicaciones para LinkedIn y redes profesionales: el ajuste cubre explicitamente el genero LinkedIn dentro del conjunto de entrenamiento, con texto mas sobrio y menos reconocible como generado.
- Textos explicativos y material divulgativo: genera explicaciones planas y directas sin markdown ni emojis en prosa, adecuadas para documentacion, guiones o material didactico.
- Ejercicios de reflexion en primera persona: el conjunto de entrenamiento incluye el genero de reflexion, por lo que puede producir textos personales con voz en primera persona sin las formulas de asistente.
- Despliegue local en Ollama o llama.cpp: con 2,5 GB en Q4_K_M cabe en equipos de consumo y permite generar texto en local sin dependencia de API, util para prototipos y pruebas de estilo.
- Investigacion sobre estilometria y deteccion de IA: sirve como referencia controlada para estudiar que marcas estilisticas persisten tras un ajuste de este tipo, junto con la metrica deslop y el slop-score de EQ-Bench.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 48 prompts reservados, una muestra por prompt. La puntuacion deslop mide habitos ponderados por cada 1000 palabras; el 90 % de 318 pasajes humanos puntua 33,6 o menos, con mediana 12,8. Los intervalos son bootstrap al 95 % sobre prompts.

| Modelo | Puntuacion deslop | Respuestas en banda humana | Slop EQ-Bench | Ajuste a la tarea | Drift KL sobre prosa humana | Quiz | Tasa de victoria de juez vs original |
|---|---|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 | 89,7 [76,9; 103,7] | 3 / 48 | 43,4 | 39 / 48 | 0 | 30 / 30 | n/a |
| **este modelo** | **21,5 [18,0; 25,2]** | **38 / 48** | **21,8** | **47 / 48** | **0,11** | **30 / 30** | **0,22 [0,13; 0,32]** |
| erikkannike/qwen3-4b-deslop-v4 | 9,2 [7,1; 11,6] | 47 / 48 | 5,1 | 43 / 48 | 0,16 | 30 / 30 | 0,06 [0,01; 0,14] |
| original + prompt plano + sampler con backtracking (runtime) | 13,5 [11,2; 15,9] | 47 / 48 | 14,6 | 45 / 48 | 0 | 30 / 30 | 0,13 [0,05; 0,21] |

El criterio de ajuste a la tarea exige que una pieza de opinion declare una posicion al principio, que una reflexion este en primera persona, que un email tenga saludo y que la longitud quede entre 0,5 y 1,6 veces lo solicitado. En una evaluacion ciega con un juez gpt-5.4-mini, el modelo original fue preferido como mejor escritura en la mayoria de los pares (6 victorias del ajustado, 9 empates, 33 derrotas del ajustado).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB para los pesos en Q4_K_M, mas overhead de contexto y cache KV; en la practica unos 3-4 GB para ventanas moderadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes. Para mayor throughput, A100 o H100 no son necesarias dado el tamano, pero aceleran el batch.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 4 GB o mas, y tambien en CPU via llama.cpp.
- Opciones de despliegue: Ollama (`ollama run hf.co/albertlieadrian/qwen3-4b-deslop-GGUF:Q4_K_M`), llama.cpp, y transformers con el adaptador LoRA del repo `albertlieadrian/qwen3-4b-deslop`. vLLM y TGI no estan documentados en la informacion disponible para esta build GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion deslop | Slop EQ-Bench | Ajuste a la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| qwen3-4b-deslop (este modelo) | 4,02 B | no disponible | 21,5 | 21,8 | 47 / 48 | Apache-2.0 | GGUF Q4_K_M en HF |
| erikkannike/qwen3-4b-deslop-v4 | 4,02 B (base Qwen3-4B) | no disponible | 9,2 | 5,1 | 43 / 48 | no disponible en la informacion | HF |
| Qwen3-4B-Instruct-2507 (base) | 4,02 B | no disponible | 89,7 | 43,4 | 39 / 48 | Apache-2.0 | HF |
| Original + prompt plano + sampler en runtime | 4,02 B | no disponible | 13,5 | 14,6 | 45 / 48 | Apache-2.0 | configuracion en runtime |

El modelo de 100toolkit obtiene mejores metricas de habitos pero mayor drift sobre prosa humana (0,16 frente a 0,11) y falla mas comprobaciones de tarea. La configuracion en runtime logra mejor puntuacion deslop que este modelo pero requiere system prompt y sampler especificos, mientras que este funciona sin configuracion adicional.

## Limitaciones y advertencias

- No es mejor en todas las metricas: un juez ciego prefirio la escritura del modelo original en la mayoria de los pares (33 derrotas frente a 6 victorias y 9 empates).
- Conserva algunos habitos: la construccion "no X sino Y" aparece a aproximadamente la mitad de la tasa del original, y las listas de tres a una tasa similar a la de Wikipedia.
- Solo probado en prosa inglesa corta (120 a 250 palabras); el comportamiento en otros generos, longitudes o idiomas no esta documentado.
- Tiende a inventar nombres en emails (firmas como "Alex" o "Jordan").
- El quiz de 30 preguntas factuales solo demuestra que no se ha roto nada evidente, no que no haya degradacion sutil.
- La puntuacion de habitos no es un detector de IA; el autor advierte explicitamente contra usar el modelo para hacer pasar texto generado por humano.
- Licencia Apache-2.0, igual que el modelo base, lo que permite uso comercial con las condiciones habituales de atribucion.
- Idiomas: solo ingles; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- No hay datos publicados de latencia, throughput ni contexto maximo en la informacion disponible.

## Enlaces

- Modelo en Hugging Face (GGUF): https://huggingface.co/albertlieadrian/qwen3-4b-deslop-GGUF
- Repositorio del adaptador LoRA: https://huggingface.co/albertlieadrian/qwen3-4b-deslop
- Informe de investigacion con metodologia y numeros: https://albertlieyingadrian.github.io/steerlab/experiments/deslop/report/
- Toolkit steerlab-deslop: https://github.com/albertlieyingadrian/steerlab
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo precedente de 100toolkit: https://100toolkit.com/blog/deslop-model/
- Paper Antislop (Paech et al.): https://arxiv.org/abs/2510.15061
- slop-score de EQ-Bench: https://github.com/sam-paech/slop-score
- Wikipedia, Signs of AI writing: https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
