# maxgfr/s6-route7-nano

## Resumen

s6-route7-nano es un router de herramientas (tool router) de muy pequeño tamaño desarrollado por maxgfr, publicado como resultado negativo de investigación. Dado un request y una lista de hasta 7 herramientas (cada una con nombre y una frase descriptiva), más la opción "ninguna de estas herramientas encaja", el modelo asigna una probabilidad a cada opción y responde "preguntar al usuario" cuando la probabilidad máxima queda por debajo de un umbral calibrado. No es un modelo generativo: es un clasificador de decisión.

El modelo combina dos componentes: una parte de modelo ternario de 2,4 MB (5.587.201 parámetros) y una copia cuantizada a 4 bits del embedding estático minishlab/potion-base-2M. Las probabilidades se fusionan opción por opción mediante `p(i) ∝ (p_model(i) · p_embedding(i))^0.7`, renormalizadas sobre el conjunto de opciones. Los pesos se distribuyen en formato GGUF y el motor de inferencia está escrito íntegramente en Rust, compilable a WASM.

Su relevancia es metodológica más que práctica: el autor lo publica explícitamente como un fallo de su puerta de validación pre-registrada. En el conjunto T5-tools (2.000 peticiones sobre 262 servidores MCP) obtiene 0.5610 de acierto frente a 0.5675 de BM25, un resultado que no supera una línea base sin coste computacional. La model card indica que la línea s6-route se cierra con este resultado y que el router recomendado para uso real sigue siendo s6-route.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de decisión ternario (parte modelo) fusionado con embedding estático cuantizado a 4 bits (potion-base-2M) |
| Parametros totales | 974.424 (dato de safetensors); la parte de modelo ternario declara 5.587.201 parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera sobre un request y hasta 7 opciones con nombre y una frase cada una) |
| Tipos de cuantizacion | Ternaria (parte modelo) y 4 bits (embedding estático) |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura no es un transformer generativo al uso. Se compone de una parte de modelo ternario (pesos en {-1, 0, +1}) de 5.587.201 parámetros y 2,4 MB, y de una copia a 4 bits del embedding estático minishlab/potion-base-2M. Ambas partes se combinan en la fase de decisión mediante un producto ponderado con exponente 0,7 y renormalización posterior sobre las opciones disponibles. La parte de modelo lee, dentro del texto de cada opción, la puntuación BM25 de la herramienta correspondiente, lo que constituye una señal auxiliar incorporada al propio input.

El entrenamiento parte del mismo preentrenamiento que versiones anteriores de la línea s6-route, pero con datos reconstruidos para eliminar las pistas que permitían a una regla acertar la herramienta sin leer el request. El objetivo declarado era que el modelo respondiera a partir del contenido de la petición, no de atajos correlacionales. La model card indica que algunas pistas menores persisten y se reportan. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO.

La innovación técnica más destacable no es de rendimiento sino de metodología: el autor publica una puerta de validación pre-registrada (G1 a G6) con intervalos bootstrap, evaluación en conjuntos frescos, control de nombres enmascarados y una prueba de lectura sin request (request-blind). El resultado completo, incluidos los fallos, está documentado en BENCH.md y en los ficheros gate.json y readings.json del repositorio.

## Capacidades

- Clasificación de decisiones: asigna una probabilidad a cada una de hasta 7 herramientas candidatas más la opción "ninguna encaja".
- Abstención calibrada por umbral: responde "preguntar al usuario" cuando la probabilidad máxima es inferior a τ_ask7 = 0.762097.
- Tool routing: selecciona la herramienta adecuada para un request a partir de nombre y descripción de una frase por herramienta.
- Integración de señal léxica: incorpora la puntuación BM25 de cada herramienta dentro del texto de su opción.
- Ejecución en WASM: inferencia en navegador con motor Rust, 13,87 ms de mediana por request con la lista de herramientas cacheada.
- Multilingüe limitado: inglés y francés.
- Sin generación de texto, sin razonamiento multi-paso, sin tool calling generativo, sin visión ni audio.

## Casos de uso

- Enrutado de peticiones a servidores MCP: el modelo puede recibir un request de usuario y una lista corta de herramientas expuestas por servidores MCP para decidir cuál invocar, con la opción de abstenerse y pedir aclaración. Es adecuado por su latencia de milisegundos y su tamaño de 3,7 MB, aunque su precisión medida (0.5610 en T5-tools) no supera a BM25.
- Clasificación ligera en el navegador: al compilarse a WASM con 3.692.288 bytes, puede desplegarse en el cliente sin backend, útil para decidir localmente qué endpoint llamar antes de enviar tráfico a red.
- Filtro previo en pipelines de agentes: como primera etapa de bajo coste que descarte opciones antes de un modelo mayor, aprovechando su capacidad de abstención ante casos ambiguos.
- Evaluación comparativa de routers: sirve como referencia reproducible en investigación sobre enrutado de herramientas, dado que publica puerta pre-registrada, intervalos bootstrap y conjuntos de test frescos.
- Estudio de calibración y atajos: su ECE de 0.1845 y sus pruebas de nombres enmascarados lo convierten en material útil para analizar cómo los routers pequeños explotan correlaciones espurias.
- Prototipado de asistentes bilingües EN/FR: para flujos donde el usuario formula peticiones en inglés o francés y hay que mapearlas a un conjunto reducido de acciones predefinidas.

## Benchmarks y rendimiento

| Prueba | Condición | Medido | Veredicto |
|---|---|---|---|
| G1 (T5-tools) | El par frente a BM25 | 0.5610 vs 0.5675 (−0.0065 [−0.0235, +0.0120]) | Falla |
| G1 (T5-tools) | El par frente a potion-cos-4bit | 0.5610 vs 0.5025 (+0.0585 [+0.0380, +0.0800]) | Pasa |
| G1 (T5-tools) | El par frente a su parte de modelo | 0.5610 vs 0.4905 | Pasa |
| G2 (a) | Distractor reescrito por el profesor | 0.0494 reales (+0.0238); 0.0513 enmascarados (+0.0287) | Pasa |
| G2 (b) | Nombres enmascarados, par ≥ embedding − 0,02 | 0.5440 vs 0.4750 − 0,02 | Pasa |
| G2 (c) | Nombres enmascarados, tasa de "none" en [0,10; 0,30] | 0.3345 (real 0,20) | Falla |
| G3 | ECE (15 bins) ≤ 0,05 | 0.1845 | Falla |
| G4 | WASM vs referencia Python | max \|Δp\| 9,1e-7; 200 de 200 | Pasa |
| G4 | Latencia WASM SIMD128 mediana ≤ 60 ms | 13,87 ms | Pasa |
| G4 | Tamaño de los dos ficheros ≤ 4.000.000 bytes | 3.692.288 bytes | Pasa |
| G5 | T2-tools ≥ 0,8668 | 0.8815 | Pasa |
| G6 (a) | Parte de modelo sin request, ≤ 0,1929 | 0.1406; servidores [0.1113, 0.1720] | Pasa |
| G6 (b) | El par sin request, ≤ 0,1929 | 0.1969; servidores [0.1599, 0.2350] | Falla |
| G6 (c) | Dependencia del "none" sin request, gap ≤ 0,05 | Modelo −0.0069 [−0.0220, +0.0081]; par −0.0087 [−0.0521, +0.0371] | Pasa |

En T5-tools la probabilidad al azar es c = 1/7 sobre las láminas con herramienta correcta. El conjunto consta de 2.000 láminas de 262 servidores, 1.600 con herramienta correcta y 400 con "ninguna" correcta. Los intervalos son bootstraps al 95 % con 1.000 remuestreos. La lectura sin request de la parte de embedding congelada alcanza por sí sola 0.1931, ligeramente por debajo del par (0.1969).

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier configuración; los dos ficheros suman 3.692.288 bytes.
- GPU recomendadas: no requiere GPU; la inferencia de referencia se ejecuta en CPU y en WASM.
- Cabe en cualquier GPU consumer y en entornos sin GPU, incluidos navegadores.
- Opciones de despliegue: motor propio en Rust (crates/sky-infer y crates/sky-web/src/router.rs) compilado a WASM; los pesos se distribuyen en GGUF.
- Latencia: 13,87 ms de mediana por request en WASM SIMD128 con la lista de herramientas cacheada; la referencia Python coincide con WASM con un error máximo de 9,1e-7.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enrutado (T5-tools) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s6-route7-nano | 974.424 (safetensors); parte de modelo 5.587.201 | no disponible | 0.5610 | Apache 2.0 | Hugging Face, GGUF, WASM |
| s6-route (versión recomendada por el autor) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| BM25 (línea base léxica) | 0 (sin parámetros) | no aplica | 0.5675 | no aplica | Cualquier implementación |
| potion-base-2M (embedding estático) | no disponible | no disponible | 0.5025 (potion-cos-4bit) | no disponible | Hugging Face (minishlab) |

## Limitaciones y advertencias

- Resultado negativo declarado: el autor indica explícitamente que el modelo falló su puerta pre-registrada y que se publica como resultado, no para uso. La model card recomienda s6-route para producción.
- No supera a BM25: 0.5610 frente a 0.5675 en T5-tools, con un intervalo que incluye el cero. Una línea base sin coste computacional iguala o mejora al modelo.
- Mala calibración: ECE de 0.1845 frente a un umbral de 0,05, lo que invalida el uso del umbral τ_ask7 como mecanismo fiable de abstención.
- Sesgo en la abstención: con nombres enmascarados responde "none" en el 33,45 % de los casos cuando la proporción real es del 20 %, lo que indica dependencia de las etiquetas de las herramientas.
- Lectura sin request: el par completo alcanza 0.1969 cuando se oculta la petición, por encima del umbral de 0,1929, lo que sugiere que parte de la señal proviene de las descripciones y no del request.
- Cobertura lingüística reducida a inglés y francés.
- Ámbito funcional muy estrecho: solo clasificación entre hasta 7 opciones; no genera texto ni razona en varios pasos.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; sin validación externa independiente.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja el uso del modelo dado su fallo de validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-route7-nano
- Demo en el navegador: https://huggingface.co/spaces/maxgfr/s6-route7-nano
- Repositorio de código (Rust): https://github.com/maxgfr/skycmd
- Resultados completos, incluidos fallos: https://maxgfr.github.io/skycmd/results/#s6-route7-nano-failed
- BENCH.md, sección s6-route7-nano: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-route7-nano-s6-route-v7-the-router-retrained-without-its-shortcut-pre-registered-gate-failed
- Puerta de validación: https://github.com/maxgfr/skycmd/blob/main/runs/s6-route7/gate.json
- Lecturas: https://github.com/maxgfr/skycmd/blob/main/runs/s6-route7/readings.json
- Pre-registro v7: https://github.com/maxgfr/skycmd/blob/main/docs/s6-route7-prereg.md
- Pre-registro v6: https://github.com/maxgfr/skycmd/blob/main/docs/s6-route6-prereg.md
- Pre-registro v5: https://github.com/maxgfr/skycmd/blob/main/docs/s6-route5-prereg.md
- Pre-registro v4: https://github.com/maxgfr/skycmd/blob/main/docs/s6-route4-prereg.md
- Router recomendado: https://huggingface.co/maxgfr/s6-route
- Embedding estático base: https://huggingface.co/minishlab/potion-base-2M
