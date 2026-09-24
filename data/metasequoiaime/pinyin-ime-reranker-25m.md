# metasequoiaime/pinyin-ime-reranker-25M

## Resumen

pinyin-ime-reranker-25M es un transformer a nivel de caracter de 24.863.104 parametros (24,9 M) desarrollado por metasequoiaime, publicado bajo licencia Apache-2.0 y disenado para una tarea muy concreta: reordenar la lista de candidatos que ya ha generado un motor de entrada (IME) de pinyin chino. No decodifica pinyin ni genera texto: recibe el texto ya confirmado por el usuario y la lista de candidatos propuesta por el motor, y decide cual de ellos encaja mejor con el contexto previo. Su tamano en disco en int8 es de 25,5 MB, en un unico fichero safetensors autocontenido (`sentence-model.safetensors`), sin ficheros auxiliares.

El modelo resuelve la brecha entre "la primera opcion del motor" y "lo que el usuario queria escribir". En un conjunto de evaluacion de 60 frases escritas a mano y ejecutadas a traves de un runtime real de metodo de entrada, 56 casos caen en el bucket donde el reranking aplica; el modelo acierta 52 de 56 (0,929), frente a 41 (0,732) de la primera opcion del motor y 49 (0,875) de su hermano pequeno de 4,25 M de parametros. Como el techo alcanzable por cualquier reranker en ese conjunto es exactamente 52 (el gold solo esta presente en la lista de candidatos en 52 casos), el modelo agota el margen disponible en esa ruta.

Es relevante ahora porque demuestra un patron de despliegue poco habitual: un modelo de ranking diminuto, cuantizado a int8, pensado para ejecutarse en local dentro del propio motor de entrada, con una implementacion de referencia en Rust sin `unsafe` y sin dependencias mas alla de serde. Su principal contrapartida es la latencia: con un p95 de 97,2 ms por pulsacion de tecla medido en el runtime real, es aproximadamente 4,8 veces mas lento por decision que el modelo de 4,25 M, lo que lo descarta para el camino critico de un teclado movil y lo situa en escritorio, en rutas no ligadas a cada pulsacion o como referencia de exactitud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer a nivel de caracter (character-level), usado como sentence model / reranker; sin decoder generativo |
| Parametros totales | 24.863.104 (24,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (fichero de 25,5 MB); el repositorio indica un unico safetensors autocontenido |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fichero unico `sentence-model.safetensors`, sin sidecars) |
| Pipeline declarado | text-ranking |
| Tamano del repositorio | 0,0 GB segun HuggingFace; 25,5 MB el fichero int8 |
| Tarea | Reranking de candidatos de IME pinyin a nivel de caracter |
| Implementacion de referencia | Rust (directorio `reference/`, licenciado por separado como Apache-2.0, sin `unsafe`, solo serde) |
| Datasets de entrenamiento | allenai/c4, silver/lccc |

## Arquitectura y entrenamiento

Se trata de un transformer a nivel de caracter (no de subpalabras) que actua como modelo de frase: puntua cada candidato producido por el motor de entrada dado el texto ya confirmado como prefijo. La documentacion del autor especifica dos detalles criticos del forward pass que rompen cualquier reimplementacion descuidada: la GELU debe ser la forma exacta con `erf`, no la aproximacion por `tanh`; y el primer caracter de un candidato se predice desde la ultima posicion del prefijo, de modo que una puntuacion que empiece en la primera posicion del propio candidato deja ese caracter sin puntuar. La especificacion completa del fichero y del forward pass esta en `docs/format.md` del repositorio, y se presenta como el unico documento necesario para escribir un cargador.

El modelo fue entrenado y medido dentro del proyecto metasequoiaime/chinese-ime-lm, usando allenai/c4 y silver/lccc como datasets. No se indica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta de la mezcla, la existencia de etapas de RLHF o DPO, ni detalles de configuracion (numero de capas, dimension oculta, cabezas de atencion). La innovacion destacable no esta en el bloque de atencion, sino en el diseno del scoring y en las reglas de gating que el propio crate impone en lugar de delegarlas en quien llama: nunca sobrescribir un acierto exacto de diccionario sobre la clave completa (medido en 2.052 casos, la primera opcion del motor obtiene 0,719 frente a 0,690 del mejor resultado reordenado con cualquiera de los umbrales probados, y veinticinco ponderaciones distintas de puntuacion del modelo, rango y evidencia de diccionario no superaron esa regla), y comparar solo candidatos que cubren la clave completa. Ademas, las puntuaciones se expresan como medias por caracter, porque una probabilidad logaritmica sumada es mayor para cadenas mas cortas y ordenaria siempre primero al candidato mas corto en listas de longitud mixta; `best_where` restringe ademas la comparacion a candidatos de la misma longitud que el lider.

## Capacidades

- Reranking de listas de candidatos: dada una lista ya generada por el motor de IME y el texto comprometido, devuelve el indice del candidato que mejor encaja (`best_where`), o `None` si procede dejar el orden intacto.
- Puntuacion a nivel de caracter: calcula medias por caracter en lugar de sumas de log-probabilidades, lo que permite comparar candidatos de distinta longitud sin sesgo hacia los mas cortos.
- Gating integrado: reglas incorporadas para no sobrescribir aciertos exactos de diccionario sobre la clave completa y para restringir la comparacion a candidatos de la misma longitud que el lider.
- Integracion con la logica del motor: el predicado de gating se responde desde el propio motor (por ejemplo, si un acierto de diccionario resolvio la clave completa en esa posicion).
- Ejecucion en local: fichero int8 de 25,5 MB, pensado para inferencia on-device sin GPU.
- Despliegue embebido: el crate de Rust se disena para ser vendorizado dentro del arbol del proyecto, copiando el directorio `reference/`.
- No decodifica pinyin: alimentarlo con una cadena de pinyin no produce texto chino.
- No es un modelo generativo: no hay generacion de texto libre, resumen, traduccion ni dialogo.
- Sin tool calling ni function calling.
- Sin soporte declarado para agentes ni razonamiento multi-paso.
- Sin capacidades de vision, audio ni modo "thinking".
- Multilingue: solo chino (zh) declarado.

## Casos de uso

- Reranking en IME de escritorio: en Windows, macOS o Linux, donde el presupuesto por pulsacion es mas holgado que en movil, el modelo puede reordenar la lista de candidatos en cada frase o en cada pausa de escritura con el p95 de 97,2 ms medido en el runtime real, rescatando lecturas que el motor fallo sin romper las que ya acerto (11 rescates y 0 roturas en el conjunto de 56 casos).
- Referencia de exactitud para calibrar un modelo pequeno: sirve como patron contra el que medir al pinyin-ime-reranker-4M; en el conjunto de frases el pequeno queda en 49/56 (0,875) frente a 52/56 (0,929) del grande, y esa diferencia se descompone en 1 rescate no alcanzado y 2 casos que el pequeno rompio.
- Post-procesado por lotes de transcripciones pinyin: en un pipeline offline que convierte texto pinyin o dictado en caracteres, la latencia no es critica y el modelo puede aplicarse sobre listas de candidatos generadas previamente para mejorar la seleccion final.
- Ajuste de motores de IME en QA: al ser el techo alcanzable por un reranker en el conjunto evaluado, permite auditar si un motor falla por generacion de candidatos (el gold no esta en la lista) o por ordenacion (el gold esta pero no queda primero); en 4 de los 56 casos la lectura correcta nunca se ensamblo, con ejemplos como gold "李明在北京工作" frente a candidatos que solo ofrecen "利民".
- Investigacion sobre generacion de candidatos: dado que este reranker no deja margen en la ruta de reordenacion, es el punto de partida natural para experimentos que mejoren la fase de generacion, que es donde queda el trabajo pendiente.
- Herramienta de anotacion y limpieza de corpus: al puntuar cada candidato a nivel de caracter, puede usarse para detectar segmentaciones o lecturas incoherentes en un corpus pinyin reconstruido antes de etiquetarlo manualmente.
- Servicio de IME en servidor: en despliegues donde el motor corre en una maquina x86 y la latencia de red ya domina, el coste de 97,2 ms por decision puede ser aceptable a cambio de la exactitud adicional.
- Validacion de reglas de gating en produccion: permite medir el efecto real de no sobrescribir aciertos de diccionario, usando el predicado que se vaya a enviar realmente y no uno basado en la longitud de la respuesta gold, disponible solo en evaluacion offline.

## Benchmarks y rendimiento

Los datos disponibles provienen del propio autor y se midieron con 60 frases escritas a mano, ejecutadas a traves de un runtime real de metodo de entrada en lugar de puntuarse offline. 56 de los 60 casos caen en el bucket del decoder, donde el reranking aplica.

| Sistema | Casos acertados / 56 | Precision |
|---|---|---|
| Primera opcion del propio motor | 41 | 0,732 |
| Reranker de 4,25 M | 49 | 0,875 |
| pinyin-ime-reranker-25M (este modelo) | 52 | 0,929 |
| Gold presente en la lista de candidatos | 52 | 0,929 |

| Metrica adicional | Valor |
|---|---|
| Casos rescatados por este modelo | 11 |
| Casos correctos del motor que este modelo rompe | 0 |
| Casos rescatados por el modelo de 4,25 M | 10 |
| Casos correctos del motor que rompe el modelo de 4,25 M | 2 |
| Casos de diccionario medidos (regla de gating) | 2.052 |
| Precision de la primera opcion del motor en esos casos | 0,719 |
| Mejor resultado reordenado en esos casos | 0,690 |
| Ponderaciones distintas de la regla de gating probadas | 25 |

| Rendimiento en ejecucion | Valor |
|---|---|
| p95 por pulsacion de tecla, este modelo | 97,2 ms |
| p95 por pulsacion del modelo de 4,25 M | 8,6 ms (medido de forma distinta, segun el autor) |
| Relacion de lentitud frente al modelo de 4,25 M | ~4,8x |
| Pulsaciones del modelo de 4,25 M fuera del marco de 16 ms | ~40 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares); el modelo no es generativo y no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU. El fichero int8 ocupa 25,5 MB; una ejecucion en coma flotante de 32 bits del mismo conjunto de pesos rondaria los 100 MB, aunque el autor solo documenta el artefacto int8.
- GPU recomendadas: no aplica; el modelo esta pensado para CPU on-device.
- GPU de consumo: irrelevante para el caso de uso; cabe en cualquier CPU moderna, y el limitante no es memoria sino latencia.
- CPU: el p95 de 97,2 ms por pulsacion medido con el modelo de 25 M implica que en el camino critico de un teclado movil no es viable; el autor recomienda explicitamente el modelo de 4,25 M para ese escenario.
- Opciones de despliegue: crate de Rust vendorizado (directorio `reference/`, Apache-2.0, sin `unsafe` y sin dependencias mas alla de serde). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF; se debe usar el cargador de Rust o escribir uno propio siguiendo `docs/format.md`.
- Requisito de integracion: el fichero debe llamarse `sentence-model.safetensors`, que es el nombre que busca el host.
- Latencia y throughput: p95 de 97,2 ms por decision en el runtime real de metodo de entrada; el autor no publica cifras de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco (int8) | Prevision en frases (top-1) | p95 por pulsacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pinyin-ime-reranker-25M | 24.863.104 | 25,5 MB | 52 / 56 (0,929) | 97,2 ms | Apache-2.0 | HuggingFace + crate de Rust vendorizable |
| pinyin-ime-reranker-4M | 4.250.112 | 4,5 MB | 49 / 56 (0,875) | 8,6 ms (medido de forma distinta) | Apache-2.0 (segun el modelo hermano referenciado) | HuggingFace + mismo crate |

Ambos ficheros se llaman `sentence-model.safetensors`. No se dispone de datos de otros rerankers comparables (por ejemplo, rerankers multilingues de proposito general) en la informacion proporcionada; no se han encontrado resultados de benchmarks ni comparativas externas aplicables.

## Limitaciones y advertencias

- No decodifica pinyin: alimentarlo con una cadena de pinyin no devuelve texto chino; solo reordena candidatos ya generados por un motor.
- Depende por completo de la lista de candidatos: en 4 de los 56 casos evaluados la lectura correcta nunca se ensamblo, de modo que ningun reranker puede alcanzarla; la mejora futura tiene que venir de la generacion de candidatos.
- Latencia incompatible con entrada por pulsacion en movil: 97,2 ms de p95 y ~4,8x mas lento que el modelo de 4,25 M; el propio autor recomienda el pequeno para ese escenario.
- Rendimiento decreciente en produccion si se evalua con un predicado de gating distinto del que se va a enviar: un filtro basado en la longitud de la respuesta gold esta disponible offline y no en tiempo de ejecucion, y usarlo produce numeros mejores que el producto.
- Trampa de longitudes mixtas: si se puntua con sumas de log-probabilidades en lugar de medias por caracter, el candidato mas corto queda primero siempre; el modelo y el crate lo evitan, pero una reimplementacion puede reintroducir el sesgo.
- Riesgo de reordenacion incorrecta: aunque en la evaluacion no rompe ningun caso que el motor acertase, no hay garantia de que eso se mantenga fuera del conjunto de 56 frases; conviene mantener el gating de diccionario activo.
- Idioma unico: solo chino (zh) declarado; no hay soporte multilingue.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgos ni evaluacion fuera del conjunto de frases del autor.
- Riesgo de alucinacion: bajo en el sentido generativo (el modelo no produce texto libre), pero puede seleccionar un candidato incorrecto entre los ofrecidos.
- Restricciones de licencia: Apache-2.0, que permite uso comercial. El directorio `reference/` se licencia por separado tambien como Apache-2.0 para poder vendorizarse de forma independiente.
- Caveat de despliegue: no hay soporte para vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF; la adopcion implica cargador propio o el crate de Rust documentado.
- Caveat de documentacion: la model card proporcionada esta truncada al final (corta en "No pair of models tested reaches") y no aporta configuracion de arquitectura, contexto, tokens de entrenamiento ni detalles de ajuste (RLHF/DPO).
- Las cifras de 52/56 y 52/52 se presentan explicitamente como techo del conjunto de evaluacion, no como una afirmacion de calidad general; el conjunto es de 60 frases escritas a mano por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/metasequoiaime/pinyin-ime-reranker-25M
- Modelo hermano de 4,25 M: https://huggingface.co/metasequoiaime/pinyin-ime-reranker-4M
- Repositorio del proyecto (entrenamiento y medicion): https://github.com/metasequoiaime/chinese-ime-lm
- Directorio de la implementacion de referencia en Rust: https://github.com/metasequoiaime/chinese-ime-lm/tree/main/reference
- Especificacion del formato y del forward pass: https://github.com/metasequoiaime/chinese-ime-lm/blob/main/docs/format.md
- Dataset allenai/c4: https://huggingface.co/datasets/allenai/c4
- Dataset silver/lccc: no disponible como enlace directo en la informacion proporcionada
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo ni sobre el proyecto: los enlaces recuperados no guardan relacion con IA open source y se descartan. No se han encontrado papers, blogs ni demos adicionales.
