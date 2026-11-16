# maxgfr/s6-route

## Resumen

s6-route es un enrutador de herramientas (tool router) de muy pequeño tamaño desarrollado por maxgfr dentro del proyecto skycmd. Dado un enunciado de petición y una lista de hasta 7 herramientas (cada una con nombre y una frase descriptiva), el modelo asigna una probabilidad a cada opción, incluida la opción "ninguna de estas herramientas encaja", y devuelve "preguntar al usuario" cuando la probabilidad máxima queda por debajo de un umbral calibrado (τ_ask3 = 0.671047). No es un modelo generativo: es un clasificador de decisión orientado a enrutamiento de llamadas a herramientas en agentes.

Técnicamente es un sistema híbrido de dos componentes: el modelo ternario s6-route-nano (v2, 2,4 MB) y una copia cuantizada a 4 bits del embedding estático minishlab/potion-base-2M (1,3 MB), fusionados opción por opción mediante `p(i) ∝ (p_model(i) · p_embedding(i))^0.81` y renormalizados. El conjunto pesa 3.692.224 bytes en dos ficheros GGUF y está implementado en Rust, con una ruta WASM SIMD128 para ejecución en navegador.

Su relevancia es doble: por un lado, demuestra que un enrutador de 3,7 MB puede superar a BM25 y acercarse a all-MiniLM-L6-v2 (91,6 MB) en la tarea de selección de herramienta sobre herramientas nunca vistas; por otro, su model card documenta de forma inusualmente explícita un protocolo de pre-registro con puertas de validación, incluyendo los resultados que no las cumplen y las lecturas alternativas que matizan el resultado principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido de fusión de decisiones: modelo ternario de decisión (s6-route-nano) + embedding estático cuantizado a 4 bits (potion-base-2M), combinados por producto ponderado con exponente 0.81 |
| Parametros totales | 974.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada acotada a una petición + hasta 7 herramientas con una frase cada una) |
| Tipos de cuantizacion | Ternaria en el modelo de decisión; 4 bits en la tabla de embedding; pesos empaquetados en GGUF |
| Idiomas soportados | en, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros, 3.692.224 bytes en total) |

## Arquitectura y entrenamiento

El sistema no entrena nada en su versión v3: es una fusión de dos piezas preexistentes. La primera es s6-route-nano (v2), un modelo de decisión ternario de 2,4 MB etiquetado como "system-one" en el proyecto, que produce una distribución de probabilidad sobre las opciones del slate. La segunda es una copia a 4 bits del embedding estático potion-base-2M (1,3 MB), que aporta similitud semántica entre la petición y las descripciones de herramientas mediante coseno. La fusión multiplica ambas distribuciones elevadas a 0,81 y renormaliza; el socio, el exponente β y el umbral τ_ask3 se eligieron sobre validación.

El diseño metodológico es el elemento más destacable: la model card describe un pre-registro con puertas G1–G4 fijadas antes de leer el conjunto fresco, enmiendas documentadas antes de la lectura y una divulgación explícita de que v3 se diseñó después de leer los volcados de test de v2. La evaluación se hizo sobre 945 peticiones nuevas relativas a herramientas nunca vistas en entrenamiento (273 clústeres), con un 20 % de slates donde la respuesta correcta es "ninguna". La implementación es 100 % Rust (`crates/sky-web/src/router.rs` y `crates/sky-infer/src/embed.rs`), con paridad verificada entre la ruta WASM y la referencia en Python (diferencia máxima de probabilidad 1,6e-6 y 200 de 200 respuestas idénticas sobre 200 slates).

## Capacidades

- Clasificación de decisión sobre un conjunto cerrado de hasta 7 opciones (herramientas más la opción "ninguna").
- Enrutamiento de llamadas a herramientas a partir de nombre y descripción de una frase por herramienta.
- Abstención calibrada: emite "preguntar al usuario" cuando la probabilidad máxima es inferior a 0.671047.
- Salida de probabilidad por opción, no solo etiqueta, lo que permite umbrales aguas abajo.
- Multilingüe limitado a inglés y francés.
- Ejecución en navegador vía WASM SIMD128 con lista de herramientas cacheada.
- Integración en el proyecto skycmd como componente de enrutamiento de agentes.
- No soporta generación de texto, razonamiento multi-paso, tool calling generativo, visión ni audio.

## Casos de uso

- Enrutamiento de intenciones en agentes de línea de comandos: skycmd usa el modelo para decidir qué herramienta invocar ante una petición en lenguaje natural, con un coste de 3,7 MB y latencia de decenas de milisegundos, adecuado para ejecutarse en el propio binario sin servicio externo.
- Despacho de herramientas en asistentes con catálogo pequeño y cambiante: al aceptar hasta 7 herramientas por slate y generalizar a herramientas no vistas (0.8868 en T2-tools), permite añadir o retirar herramientas sin reentrenar.
- Puerta de abstención en pipelines de agentes: la calibración (ECE 0.0162) y el umbral τ_ask3 permiten derivar a intervención humana o a un modelo mayor cuando la confianza es baja, reduciendo llamadas erróneas.
- Ejecución en el navegador: la ruta WASM SIMD128 (30,9 ms de mediana por petición con la lista cacheada) habilita enrutamiento local en aplicaciones web sin backend ni envío de la petición a un servidor.
- Enrutamiento en dispositivos con recursos muy limitados: los 3,7 MB en dos ficheros GGUF caben en cualquier entorno con unos pocos megabytes de memoria, incluidos entornos embebidos con Rust.
- Clasificación de intenciones en inglés y francés: los resultados en CLINC150 (0.8040) y MASSIVE (0.5340) lo hacen utilizable como clasificador de intención ligero en esos dos idiomas, con la advertencia de que en MASSIVE queda por debajo de su propio componente de embedding.
- Filtro previo antes de un modelo grande: usar s6-route para descartar opciones con alta confianza y delegar en un LLM solo los casos ambiguos, aprovechando que la precisión entre el 50 % de slates más confiados es 0.996.

## Benchmarks y rendimiento

Resultados sobre ficheros frescos (T2-tools: 945 slates, 20 % con "ninguna" como respuesta correcta; el resto: 2.000 cada uno):

| Sistema | Tamano | T2-tools | Nombres enmascarados | MetaTool | CLINC150 | MASSIVE (en/fr) |
|---|---:|---:|---:|---:|---:|---:|
| s6-route | 3,7 MB | 0.8868 | 0.2497 | 0.5175 | 0.8040 | 0.5340 |
| s6-route, modo rápido | 3,7 MB | 0.8836 | 0.2899 | 0.5130 | 0.8020 | 0.5300 |
| s6-route-nano solo (modelo) | 2,4 MB | 0.7926 | 0.0720 | 0.3190 | 0.4240 | 0.3680 |
| potion-base-2M, coseno, 4 bits (embedding) | 1,3 MB | 0.7386 | 0.7280 | 0.5340 | 0.7855 | 0.4755 |
| BM25 (herramientas del slate) | sin parámetros | 0.8169 | 0.8138 | 0.4330 | 0.4990 | 0.3205 |
| BM25 fusionado con el mismo embedding | 1,3 MB | 0.8624 | 0.8423 | 0.5420 | 0.7750 | 0.4515 |
| all-MiniLM-L6-v2, coseno | 91,6 MB | 0.9048 | 0.9005 | 0.6570 | 0.8790 | 0.5730 |
| toolrouter (stanley-nv) | 7,66 MB | 0.7735 | 0.7513 | 0.5910 | 0.7470 | 0.5900 |

Métricas adicionales en T2-tools: ECE 0.0162 (MiniLM 0.0254, BM25 0.0779); F1 de la clase "ninguna" 0.7732 (MiniLM 0.8010, BM25 0.6368); precisión entre el 50 %/70 %/90 % de slates más confiados 0.996/0.977/0.929. Bootstrap pareado por slates: +0.0942 [0.0720, 0.1185] sobre el modelo solo, +0.1481 [0.1228, 0.1714] sobre el embedding solo, +0.0243 [0.0085, 0.0413] sobre BM25 fusionado con el embedding y −0.0180 [−0.0381, ...] frente a MiniLM (intervalo truncado en la información disponible).

## Requisitos de hardware

- VRAM estimada: no aplica en la práctica; el sistema completo ocupa 3.692.224 bytes en disco y puede residir en memoria del sistema o en memoria del navegador.
- GPU recomendadas: ninguna necesaria. El autor indica explícitamente que no se usó GPU para construir esta versión.
- GPU de consumo: irrelevante; cabe en cualquier equipo, incluidos entornos sin GPU.
- Opciones de despliegue: binario Rust del proyecto skycmd, módulo WASM SIMD128 en navegador y, por el formato GGUF, potencialmente llama.cpp u otros cargadores GGUF (no documentado por el autor para este modelo).
- Latencia: 30,9 ms de mediana por petición en WASM SIMD128 con la lista de herramientas cacheada. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | T2-tools | MetaTool | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| s6-route | 974.424 / 3,7 MB | no disponible | 0.8868 | 0.5175 | Apache 2.0 | Hugging Face, Rust, WASM |
| all-MiniLM-L6-v2 | 91,6 MB | no disponible | 0.9048 | 0.6570 | no disponible en la información | Hugging Face, ampliamente desplegado |
| toolrouter (stanley-nv) | 7,66 MB | no disponible | 0.7735 | 0.5910 | no disponible en la información | Hugging Face |
| BM25 (línea base) | sin parámetros | no disponible | 0.8169 | 0.4330 | no aplica | Cualquier implementación |

Frente a MiniLM, s6-route pierde 0.0180 puntos en T2-tools con un 96 % menos de tamaño, pero gana en calibración (ECE 0.0162 frente a 0.0254) y en latencia en navegador. Frente a toolrouter, gana en T2-tools (0.8868 frente a 0.7735) y CLINC150 (0.8040 frente a 0.7470), pero pierde en MetaTool (0.5175 frente a 0.5910) y MASSIVE (0.5340 frente a 0.5900).

## Limitaciones y advertencias

- Dependencia crítica de los nombres de herramientas: al renombrar todas las herramientas como `tool_<k>`, la precisión cae a 0.2497, mientras BM25 mantiene 0.8138. El sistema necesita nombres distintivos.
- El resultado principal no es robusto a todas las lecturas: sin los tres clústeres mayores la ventaja sobre BM25 baja a +0.0202 [−0.0062, +0.0481], y el bootstrap que remuestrea clústeres da +0.0698 [−0.0079, +0.1404]; ambos intervalos contienen el cero.
- En MetaTool queda por debajo de su propio componente de embedding (0.5175 frente a 0.5340), dentro de la tolerancia de 0.02 que permite la puerta G2.
- El objetivo anunciado de ≥ 0.95 de precisión entre peticiones respondidas con cobertura ≥ 0.80 no se cumplió (0.9433 con cobertura 0.8593).
- El umbral de latencia de 60 ms se fijó después de medir v2, que incumplió su propio umbral de 2 ms (38,9 ms); el autor lo declara explícitamente.
- v3 se diseñó tras leer el test de v2, lo que el propio autor señala como caveat metodológico; la puerta se leyó una sola vez sobre ficheros frescos.
- Idiomas limitados a inglés y francés; no hay soporte documentado de otros idiomas.
- No es un modelo generativo: no puede redactar respuestas, razonar en varios pasos ni invocar herramientas por sí mismo; solo clasifica opciones de un conjunto cerrado de hasta 7.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del embedding subyacente (potion-base-2M) para el despliegue combinado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de enrutamiento erróneo con confianza alta en dominios alejados de los datos de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-route
- Modelo base v2: https://huggingface.co/maxgfr/s6-route-nano
- Embedding utilizado: https://huggingface.co/minishlab/potion-base-2M
- Demo en Spaces: https://huggingface.co/spaces/maxgfr/s6-route
- Código fuente: https://github.com/maxgfr/skycmd
- Resultados y benchmarks: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-route-s6-nano-v3-the-v2-router-fused-with-a-static-embedding-pre-registered-gate-passed
- Resultados de la evaluación fresca: https://github.com/maxgfr/skycmd/blob/main/runs/s6-nano3/eval-fresh/results.md
- Pre-registro: https://github.com/maxgfr/skycmd/blob/main/docs/s6-nano3-prereg.md
- Página de resultados del proyecto: https://maxgfr.github.io/skycmd/results/
- Página del enrutador en el sitio del proyecto: https://maxgfr.github.io/skycmd/router/
