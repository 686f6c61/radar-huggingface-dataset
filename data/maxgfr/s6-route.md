# maxgfr/s6-route

## Resumen

s6-route es un modelo de clasificación de texto de dominio muy restringido: un enrutador de herramientas (tool router) que, dada una petición del usuario y una lista de hasta siete herramientas descritas por un nombre y una frase, devuelve una probabilidad para cada opción y decide entre ejecutar una herramienta, responder "ninguna encaja" o pedir aclaración al usuario. Lo desarrolla maxgfr como parte del proyecto skycmd y se publica bajo licencia Apache 2.0. Su interés radica en que resuelve una tarea concreta de los pipelines de agentes con un coste computacional ínfimo: 974.424 parámetros y un artefacto de 3,7 MB en dos ficheros GGUF, sin necesidad de GPU.

Técnicamente no es un transformer generativo, sino un clasificador ternario (pesos ternarios) de "sistema uno" con embeddings estáticos. La versión publicada, s6-route, es una fusión por producto de probabilidades entre el modelo anterior s6-route-nano (que falló su propia puerta de validación) y una copia cuantizada a 4 bits del encoder estático minishlab/potion-base-2M, con un exponente β = 0,81 y un umbral de abstención τ_ask3 = 0,671047. No se entrenó nada para esta versión: los parámetros se eligieron sobre validación y la puerta se leyó una sola vez sobre datos frescos.

Es relevante ahora porque demuestra que el enrutamiento de herramientas en agentes puede resolverse con un artefacto de kilobytes desplegable en Rust y WebAssembly, sin GPU ni servicio externo, y porque documenta con inusual honestidad sus condiciones de éxito y sus fallos: la ventaja sobre BM25 desaparece con nombres de herramienta genéricos y se invierte en familias de herramientas nuevas como los servidores MCP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador ternario de sistema uno con embeddings estáticos; fusión por producto de probabilidades entre s6-route-nano y potion-base-2M (4 bits) |
| Parametros totales | 974.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: una petición y hasta 7 herramientas, cada una con nombre y una frase) |
| Tipos de cuantizacion | GGUF; el componente de embeddings es una copia a 4 bits; pesos del clasificador en ternario |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros: s6-route-nano.gguf y s6-route-embed.gguf) |

## Arquitectura y entrenamiento

s6-route no entrena un modelo nuevo. Reutiliza los pesos de s6-route-nano (v2), un clasificador ternario de decisión, y los fusiona opción por opción con una copia a 4 bits del encoder de embeddings estáticos minishlab/potion-base-2M. La regla de fusión es un producto de probabilidades con exponente: p(i) ∝ (p_modelo(i) · p_embedding(i))^0,81, renormalizado sobre el conjunto de opciones. El socio, el exponente β y el umbral de abstención τ_ask3 = 0,671047 se seleccionaron sobre el conjunto de validación; no hubo entrenamiento ni uso de GPU para esta versión.

Los datos de entrenamiento y evaluación provienen del dataset maxgfr/skycmd-route. La evaluación se realizó sobre peticiones frescas relativas a herramientas nunca vistas en entrenamiento (945 peticiones, 273 clústeres) y sobre un conjunto de herramientas MCP de una familia nueva. La metodología sigue un protocolo de pre-registro: el sistema se definió tras leer el test de v2 (a partir de un análisis exploratorio de sus volcados), los parámetros se fijaron en validación y la puerta se leyó una única vez sobre ficheros frescos. El propio autor advierte que la puerta de latencia se fijó en 30 veces la de v2 y se estableció después de medir v2.

## Capacidades

- Enrutamiento de herramientas: asigna una probabilidad a cada una de hasta siete herramientas descritas por nombre y una frase, más la opción "ninguna de estas herramientas encaja".
- Abstención explícita: devuelve la decisión "ask" (preguntar al usuario) cuando la probabilidad máxima queda por debajo de τ_ask3 = 0,671047.
- Clasificación de texto con salida de tres vías: "tool", "none" o "ask".
- Calibración de probabilidades: ECE de 0,0162 frente a 0,0779 de BM25 en los tests reportados.
- Detección de "ninguna herramienta adecuada": F1 de 0,7732 frente a 0,6368 de BM25.
- Ejecución en navegador mediante WebAssembly y en Rust nativo, sin GPU.
- Idiomas: inglés y francés.
- No soporta generación de texto, razonamiento multi-paso, código, matemáticas, visión, audio ni tool calling generativo; es exclusivamente un clasificador de enrutamiento.

## Casos de uso

- Enrutamiento de herramientas en agentes ligeros: dado un catálogo de hasta siete herramientas con nombres distintivos (luces, clima, correo), el modelo elige la herramienta correcta y evita llamadas innecesarias a un LLM grande, con un artefacto de 3,7 MB desplegable en el cliente.
- Asistentes de voz o chat en el navegador: la demo oficial ejecuta el router vía WebAssembly con dos ficheros GGUF descargados por HTTP, de modo que la decisión de qué herramienta invocar ocurre localmente sin enviar la petición a un servidor.
- Pasarela de abstención en pipelines de agentes: cuando la probabilidad máxima queda por debajo de 0,671047, el sistema devuelve "ask" y puede derivar la petición a un modelo mayor o a un humano, reduciendo ejecuciones erróneas de herramientas.
- Filtrado previo en servidores MCP: el modelo puede descartar herramientas irrelevantes antes de exponer el catálogo completo al LLM, aunque el autor advierte que en herramientas MCP nuevas su precisión (0,5530) queda por debajo de BM25 (0,5675) y de all-MiniLM-L6-v2 (0,6630).
- Despliegue en entornos con restricciones de cómputo: al no requerir GPU y caber en dos ficheros de kilobytes, es adecuado para dispositivos embebidos, funciones serverless o binarios Rust distribuidos con la aplicación.
- Comparación y línea base en investigación de enrutamiento: el proyecto publica resultados completos, incluidos los fallos, el pre-registro y el código en Rust, lo que lo convierte en una referencia reproducible para evaluar routers de herramientas frente a BM25 y encoders pequeños.
- Clasificación de intenciones bilingüe (inglés y francés) en dominios con catálogos cerrados y nombres de herramienta descriptivos.

## Benchmarks y rendimiento

| Metrica | s6-route | BM25 | all-MiniLM-L6-v2 |
|---|---|---|---|
| Acierto en T2-tools (945 peticiones frescas, 273 clústeres, herramientas no vistas) | 0,8868 | 0,8169 | 0,9048 |
| Diferencia frente a BM25 | +0,0698 [0,0455, 0,0952] | — | — |
| Diferencia sin los tres clústeres mayores | +0,0202 [−0,0062, +0,0481] | — | — |
| Bootstrap remuestreando clústeres | +0,0698 [−0,0079, +0,1404] | — | — |
| Acierto con todas las herramientas renombradas tool_<k> | 0,2497 | 0,8138 | no disponible |
| Acierto en peticiones frescas sobre herramientas MCP | 0,5530 | 0,5675 | 0,6630 |
| ECE (calibración) | 0,0162 | 0,0779 | no disponible |
| F1 de la respuesta "none" | 0,7732 | 0,6368 | no disponible |

La puerta pre-registrada exigía superar a BM25 en T2-tools con el límite inferior del intervalo al 95 % por encima de cero, y alcanzar como mínimo MiniLM − 0,03 (es decir, 0,8748). Ambas condiciones se cumplieron. El autor señala explícitamente que dos lecturas del resultado matizan el aprobado: sin los tres clústeres mayores la ventaja sobre BM25 cae a +0,0202 con intervalo que contiene el cero, y el bootstrap por clústeres también contiene el cero. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no realiza esas tareas.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el artefacto completo ocupa 3,7 MB en dos ficheros GGUF y cabe en memoria RAM de cualquier dispositivo.
- GPU recomendadas: ninguna. El autor indica que no se usó GPU ni para entrenar ni para evaluar esta versión.
- Cabe en cualquier GPU de consumo y en CPU; también se ejecuta en el navegador vía WebAssembly.
- Opciones de despliegue: Rust nativo (crates sky-web/src/router.rs y sky-infer/src/embed.rs), WebAssembly mediante el paquete sky_web.js publicado en GitHub Pages, y los ficheros GGUF s6-route-nano.gguf y s6-route-embed.gguf. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput: no se publican cifras absolutas; la puerta de latencia se fijó en 30 veces la de s6-route-nano v2, establecida después de medir v2.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento en enrutamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| s6-route | Clasificador ternario + embeddings estáticos | 974.424 | no disponible (hasta 7 herramientas) | 0,8868 en T2-tools; 0,2497 con nombres enmascarados; 0,5530 en MCP | Apache 2.0 | Hugging Face, Rust, WASM |
| BM25 | Recuperación léxica clásica | 0 (sin modelo) | no aplica | 0,8169 en T2-tools; 0,8138 con nombres enmascarados; 0,5675 en MCP | no aplica | Implementaciones ubicuas |
| all-MiniLM-L6-v2 | Encoder de frases | no disponible en la información (91,6 MB) | no disponible | 0,9048 en T2-tools; 0,6630 en MCP | no disponible en la información | Hugging Face, Sentence Transformers |
| s6-route-nano (v2) | Clasificador ternario | no disponible | no disponible | Falló su propia puerta de validación | Apache 2.0 | Hugging Face |

La regla que el propio autor deriva de estos datos: s6-route para nombres distintivos y tipos de herramienta familiares; BM25 para nombres genéricos o numerados y para familias nuevas como los servidores MCP; all-MiniLM-L6-v2 cuando la precisión es prioritaria y se pueden asumir unos 92 MB; y mantener BM25 como verificación cruzada.

## Limitaciones y advertencias

- Dependencia crítica de los nombres de herramienta: con todas las herramientas renombradas como tool_<k>, el acierto cae a 0,2497, frente a 0,8138 de BM25. El autor exige nombres distintivos para su uso.
- Rendimiento inferior en familias nuevas: en herramientas MCP frescas obtiene 0,5530, por debajo de BM25 (0,5675) y de all-MiniLM-L6-v2 (0,6630).
- Ventaja frágil sobre BM25: sin los tres clústeres mayores del test, la diferencia es +0,0202 con intervalo [−0,0062, +0,0481], que contiene el cero; el bootstrap por clústeres también contiene el cero.
- Metodología de evaluación cuestionable en parte: el sistema v3 se diseñó tras leer el test de v2, la puerta de latencia se fijó después de medir v2 y el umbral y el exponente se ajustaron en validación. El autor lo declara en el pre-registro.
- Alcance funcional mínimo: solo clasifica entre hasta siete opciones más "none"; no genera texto, no razona en varios pasos y no soporta tool calling generativo.
- Idiomas limitados a inglés y francés; no se documenta comportamiento en castellano.
- Riesgo de calibración fuera de distribución: el umbral τ_ask3 = 0,671047 se fijó sobre validación y puede no transferirse a catálogos de herramientas muy distintos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base potion-base-2M y el dataset skycmd-route deben verificarse por separado si se redistribuyen.
- No se han publicado resultados de benchmarks estándar de NLP; las cifras disponibles son específicas de la tarea de enrutamiento y del protocolo del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-route
- Modelo base s6-route-nano: https://huggingface.co/maxgfr/s6-route-nano
- Embeddings estáticos potion-base-2M: https://huggingface.co/minishlab/potion-base-2M
- Dataset skycmd-route: https://huggingface.co/datasets/maxgfr/skycmd-route
- Demo interactiva: https://huggingface.co/spaces/maxgfr/s6-route
- Demo del proyecto skycmd: https://huggingface.co/spaces/maxgfr/skycmd
- Página del router: https://maxgfr.github.io/skycmd/router/
- Código fuente (Rust): https://github.com/maxgfr/skycmd
- Resultados completos, incluidos fallos: https://maxgfr.github.io/skycmd/results/#s6-route-passed
- Informe técnico: https://maxgfr.github.io/skycmd/paper/
- Pre-registro: https://github.com/maxgfr/skycmd/blob/main/docs/s6-nano3-prereg.md
- Benchmarks detallados: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-route-s6-nano-v3-the-v2-router-fused-with-a-static-embedding-pre-registered-gate-passed
- Resultados de la evaluación fresca: https://github.com/maxgfr/skycmd/blob/main/runs/s6-nano3/eval-fresh/results.md
- Guía de uso en producción: https://maxgfr.github.io/skycmd/use/#tool-routing
