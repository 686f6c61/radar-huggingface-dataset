# saivamshiatukuri/qwen3.5-4b-decision-mind2web

## Resumen

qwen3.5-4b-decision-mind2web es un adaptador LoRA sobre el modelo Qwen/Qwen3.5-4B, publicado por el usuario saivamshiatukuri, que responde dos preguntas tipadas sobre un paso de agente web en una sola pasada forward y sin generar texto: qué elemento candidato de la página debe recibir la acción siguiente (10 candidatos de ranker más la opción "ninguno de los elementos listados") y qué operación debe ejecutarse (CLICK, TYPE o SELECT). Devuelve una probabilidad sobre cada opción de cada pregunta, calibrada con una temperatura única ajustada en un split reservado, de modo que un entorno de agente pueda actuar sobre esa probabilidad o escalar por debajo de un umbral.

El modelo se presenta como el mejor de cuatro diseños de modelo de decisión comparados en el estudio "Decisions Without Generation: What Universal Decision Models Changed About Classification, and Where a Fine-Tuned 4B Model Still Wins" (septiembre de 2026), donde se contrastan clasificadores pequeños ajustados con Jev, el modelo universal de decisión alojado de TypeSafe. Sobre el test cross-task de Mind2Web alcanza 53,2 % de exactitud de elemento y 89,3 % de exactitud de operación, con un error de calibración esperado (ECE) de 0,024 tras escalado por temperatura.

Su relevancia actual está en el nicho de los agentes de navegador: sustituye una llamada a un modelo generativo o a una API externa por una lectura de logits en una única pasada, con una latencia declarada de 62 ms p50 en batch 1 sobre A100 y un coste estimado de 1,9 dólares por millón de decisiones frente a los 16,9 dólares facturados por la API de referencia. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ha verificado las métricas declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el transformer Qwen/Qwen3.5-4B; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador (tamano de repositorio 0,1 GB); el modelo base se denomina Qwen3.5-4B, lo que sugiere del orden de 4.000 millones de parametros, dato no confirmado en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible; el ejemplo de uso del autor instancia el decodificador con max_len=1536 |
| Tipos de cuantizacion | No disponible; las mediciones de latencia se hicieron con el adaptador fusionado en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA de la libreria peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-4B (la informacion disponible no detalla la arquitectura del modelo base). El mecanismo de decision consiste en forzar como profesor la respuesta del turno de asistente a dos lineas de plantilla ("1) ?" y "2) ?") y leer la distribucion de probabilidad en el token anterior a cada signo de interrogacion. La probabilidad de una opcion es p("A") más p(" A") en su slot, renormalizada sobre las opciones mostradas y dividida por la temperatura ajustada de 1,046, almacenada en decision_config.json. Los codigos de opcion (A-Z y despues codigos de dos letras) son tokens unicos en el tokenizador de Qwen. No hay generacion de texto en ningun punto del proceso; el prompt usa la plantilla de chat de Qwen con el modo thinking desactivado.

El entrenamiento se realizo sobre el dataset osunlp/Mind2Web: una epoca sobre 6.787 pasos etiquetados, unas 20 minutos en una unica A100, segun el autor. El autor compara cuatro disenos ("Arm 3" es el publicado) y reporta que, frente al modelo universal Jev, esta configuracion gana 6 puntos en seleccion de elemento en distribucion, 4-5 puntos en sitios web y dominios no vistos y 15 puntos en la operacion, con un cuarto de la latencia de la API. No se menciona en la informacion disponible el uso de RLHF, DPO ni otras tecnicas de alineamiento posteriores al ajuste supervisado.

## Capacidades

- Clasificacion de decision de paso de navegador: selecciona el elemento objetivo entre 10 candidatos de ranker mas la clase "ninguno de los elementos listados" (27 % del test cross-task).
- Clasificacion de operacion: distingue CLICK, TYPE y SELECT sobre el elemento elegido.
- Salida probabilistica calibrada: ECE de 0,024 tras escalado por temperatura (1,046), lo que permite fijar umbrales de escalado.
- Inferencia en una sola pasada forward, sin decodificacion autoregresiva de texto.
- Precision agrupada sobre las dos preguntas en el test cross-task: 71,2 % de exactitud, NLL 0,804, AUROC 0,84 y exactitud selectiva del 75,2 % con una cobertura del 90 %.
- Multilingue: no; el modelo declara unicamente ingles.
- Tool calling generativo: no; el modelo no genera llamadas a herramientas, solo clasifica opciones predefinidas.
- Vision, audio y modo thinking: no disponibles en esta configuracion.
- Integracion con el codigo del estudio mediante la clase dm.decide.Decider, que construye el prompt, lee los slots y aplica la temperatura.

## Casos de uso

- Agentes de navegacion web autonoma: dado el estado (tarea, sitio web y acciones previas) y los 10 candidatos extraidos del HTML limpiado, el modelo devuelve en 62 ms el elemento y la operacion siguientes, lo que permite cerrar el bucle de decision sin coste de generacion.
- Escalado a revision humana con umbral de confianza: gracias al ECE de 0,024, un orquestador puede derivar a un humano o a un modelo mayor los pasos cuya probabilidad quede por debajo de un umbral, en lugar de escalar por heuristica.
- Automatizacion de pruebas end-to-end en web: el modelo predice la accion esperada sobre un DOM dado, lo que permite comparar la trayectoria ejecutada por un framework de testing con la trayectoria predicha y detectar regresiones de flujo.
- Pre-etiquetado de trazas de agentes: clasificar acciones propuestas en registros de ejecucion para construir datasets de supervision o auditar decisiones, con la ventaja de coste de 1,9 dolares por millon de decisiones estimado por el autor frente a 16,9 de la API de referencia.
- Enrutado de acciones en pipelines RPA: para flujos con un catalogo fijo de operaciones (clic, escritura, seleccion), el modelo actua como cabecera de decision sobre la pagina y reduce la dependencia de selectores fragiles.
- Deteccion de pasos sin candidato valido: la clase "ninguno de los elementos listados" permite que el sistema reintente la extraccion de candidatos o cambie de estrategia en lugar de forzar una accion incorrecta.
- Investigacion en agentes web: sirve como linea base no generativa y calibrada para comparar con modelos universales de decision o con clasificadores pequenos de embeddings, reutilizando la tabla comparativa del estudio.
- Asistentes de accesibilidad y navegacion guiada: sugerir el siguiente control operable a partir del estado textual de la pagina, siempre que el dominio encaje con la distribucion de Mind2Web.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados; "verified": false):

| Metrica | Conjunto | Valor |
|---|---|---|
| Exactitud de elemento | Mind2Web cross-task test, top-10 candidatos de ranker + none | 53,2 % |
| Exactitud de operacion | Mind2Web cross-task test, top-10 candidatos de ranker + none | 89,3 % |
| ECE (escalado por temperatura) | Mind2Web cross-task test | 0,024 |

Comparativa completa publicada en la model card (exactitud en %, semilla unica; latencia p50 batch 1 sobre 100 filas reales del test, A100, adaptador fusionado, bfloat16):

| Modelo | Element (cross-task) | Element (cross-website) | Element (cross-domain) | Operacion | Recall de "none" | ECE (T) | Latencia |
|---|---|---|---|---|---|---|---|
| Embedding + regresion logistica (MiniLM, pairwise) | 24,2 | 27,0 | 20,5 | 83,7 | 0,60 | 0,050 | ~0 (CPU) |
| Qwen3.5-4B zero-shot (mismo prompt, sin entrenamiento) | 29,0 | – | – | 82,4 | 0,01 | 0,071 | 59 ms |
| Qwen3.5-4B congelado + cabeza lineal | 25,8 | – | – | 82,5 | 0,03 | 0,078 | Practicamente igual que zero-shot |
| LoRA + scorer `[CLS]`-por-opcion (Arm 2b) | 51,0 | 46,8 | 45,6 | 89,8 | 0,33 | 0,014 | 55 ms |
| Este modelo: LoRA LM + logprobs de slot (Arm 3) | 53,2 | 50,3 | 48,1 | 89,3 | 0,36 | 0,024 | 62 ms |
| Jev (TypeSafe, jev-1.13, via API) | 46,8 | 43,9 | 43,4 | 73,8 | 0,18 | 0,045 | 240 ms |

Metricas agrupadas sobre ambas preguntas en el test cross-task (n = 2.094 pasos): exactitud 71,2 %, NLL 0,804, AUROC 0,84, exactitud selectiva del 75,2 % con 90 % de cobertura. El mismo adaptador se evaluo sin cambios en los tests cross-website (n = 1.373) y cross-domain (n = 5.908), donde pierde en torno a cinco puntos fuera de distribucion y mantiene la ventaja sobre el resto de modelos.

## Requisitos de hardware

- VRAM de inferencia: no especificada por el autor. Como referencia, las mediciones se hicieron con el adaptador fusionado en bfloat16 sobre A100, lo que para un modelo base de 4.000 millones de parametros implica del orden de 8-10 GB de pesos, mas la memoria del contexto (max_len de ejemplo: 1536 tokens). Cualquier cifra de cuantizacion es una estimacion no confirmada.
- GPU recomendadas: A100 para las mediciones publicadas; el autor cita tambien una A6000 plenamente utilizada en el calculo de coste por decision.
- GPU de consumo: no se aportan datos de ejecucion en GPU de consumo; dado el tamano del modelo base, es plausible en tarjetas con 12-16 GB o mas, pero no esta confirmado por el autor.
- Despliegue: el modelo se distribuye como adaptador PEFT; el codigo del estudio se instala desde el repositorio con `pip install -r requirements.txt` y se usa mediante `from dm.decide import Decider`. No se detalla en la informacion disponible soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: 62 ms p50 en batch 1 (adaptador fusionado, bfloat16, A100) sobre 100 filas reales del test. El diseno alternativo Arm 2b reporta 55 ms y el zero-shot 59 ms, en el mismo entorno.
- Coste: aproximadamente 1,9 dolares por millon de decisiones en una A6000 totalmente utilizada, frente a 16,9 dolares por millon facturados por la API de Jev para las mismas filas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Element (cross-task) | Operacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (LoRA sobre Qwen3.5-4B) | Adaptador LoRA; base del orden de 4B segun su nombre (no confirmado) | No disponible (uso de ejemplo: max_len 1536) | 53,2 % | 89,3 % | Apache 2.0 | HuggingFace, libreria peft, repo de 0,1 GB, 0 descargas |
| Qwen3.5-4B zero-shot | Del orden de 4B segun su nombre | No disponible | 29,0 % | 82,4 % | Apache 2.0 (segun la ficha del modelo base) | HuggingFace |
| Qwen3.5-4B congelado + cabeza lineal | Del orden de 4B mas cabeza | No disponible | 25,8 % | 82,5 % | No disponible | No disponible |
| Embedding + regresion logistica (MiniLM, pairwise) | No disponible | No disponible | 24,2 % | 83,7 % | No disponible | No disponible |
| LoRA + scorer `[CLS]`-por-opcion (Arm 2b) | Adaptador LoRA sobre Qwen3.5-4B | No disponible | 51,0 % | 89,8 % | No disponible | No disponible |
| Jev (TypeSafe, jev-1.13) | No disponible | No disponible | 46,8 % | 73,8 % | Propietaria, solo API | API gestionada |

## Limitaciones y advertencias

- La exactitud de elemento en el conjunto principal es del 53,2 %: practicamente la mitad de los pasos de navegador se resuelven con un elemento incorrecto, lo que hace imprescindible un mecanismo de validacion o escalado en produccion.
- El recall de la clase "ninguno de los elementos listados" es bajo: 0,36 en este modelo (0,33 en Arm 2b, 0,18 en Jev). El 27 % de los objetivos del test cross-task quedan fuera de los candidatos, de modo que el modelo tiende a elegir una opcion existente cuando la respuesta correcta seria abstenerse.
- Degradacion fuera de distribucion: alrededor de cinco puntos en los tests cross-website y cross-domain, aunque sigue por delante de los modelos comparados.
- Las metricas declaradas no estan verificadas ("verified": false), proceden de una unica semilla y no han sido replicadas de forma independiente.
- La calibracion depende de la temperatura fija 1,046 ajustada en un split reservado; cambios en el prompt, en el numero de candidatos o en el dominio pueden invalidar el ECE reportado de 0,024.
- El modelo solo declara soporte de ingles y solo cubre tres operaciones (CLICK, TYPE, SELECT) y dos preguntas cerradas; no genera texto, no razona en multiples pasos por si mismo y no acepta preguntas fuera de ese contrato de decision.
- El rendimiento depende de que los 10 candidatos procedan de un ranker similar al del articulo de Mind2Web; con otro extractor o con HTML sin limpiar los resultados pueden degradarse.
- Licencia Apache 2.0 para el adaptador, pero conviene verificar los terminos del modelo base Qwen/Qwen3.5-4B y del dataset osunlp/Mind2Web antes de un uso comercial.
- El repositorio no tiene descargas ni validacion de la comunidad, y el fragmento de la model card disponible esta truncado a mitad del ejemplo de uso.
- No se documentan sesgos especificos ni evaluaciones de seguridad; al tratarse de un clasificador entrenado sobre trazas web, puede heredar sesgos de la distribucion de sitios de Mind2Web.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saivamshiatukuri/qwen3.5-4b-decision-mind2web
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento y evaluacion: osunlp/Mind2Web (https://huggingface.co/datasets/osunlp/Mind2Web)
- Estudio citado: "Decisions Without Generation: What Universal Decision Models Changed About Classification, and Where a Fine-Tuned 4B Model Still Wins" (septiembre de 2026); no se proporciona URL en la informacion disponible.
- Modelo comparado Jev (TypeSafe, jev-1.13): solo se menciona como API; no se proporciona URL.
- Resultados de la busqueda web: no se ha recuperado ningun enlace relevante sobre este modelo. Los resultados devueltos corresponden a paginas de guarderias y servicios de atencion infantil de la ciudad de Wolfsburg (kitas.stadt.wolfsburg.de, kitas-wolfsburg.de, wolfsburg.de/stadt-kitas y una noticia de NDR) y no guardan ninguna relacion con el modelo, su entrenamiento o su evaluacion.
