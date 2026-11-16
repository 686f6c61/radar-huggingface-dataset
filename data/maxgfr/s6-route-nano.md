# maxgfr/s6-route-nano

## Resumen

s6-route-nano es un modelo de decisión de muy pequeño tamaño (2,4 MB, 5.587.201 parámetros según la model card; 2.214.913 parámetros según los safetensors del repo) desarrollado por maxgfr dentro del proyecto skycmd, escrito íntegramente en Rust. Su tarea es el enrutamiento de herramientas (tool routing): dada una petición del usuario y una lista de hasta 7 herramientas, cada una con un nombre y una frase descriptiva, más la opción "ninguna de estas herramientas encaja", devuelve una probabilidad para cada opción en un único forward pass. Es la segunda versión de s6-nano como modelo de decisión, estrechada a un único trabajo.

El modelo se publica explícitamente como resultado negativo, no como herramienta utilizable. Falló su puerta preinscrita G1: en el conjunto T-tools (2.000 slates de herramientas que no aparecen en ningún ítem de entrenamiento) obtiene una precisión de 0,8395, por encima de potion-base-2M con coseno (0,6675) y de las dos baselines entrenadas de su tamaño, pero por debajo de BM25 (0,8500), la puntuación léxica que el propio modelo lee en su entrada y que la puerta exigía superar estrictamente. La diferencia es de −0,0105 con intervalo del 95 % de [−0,0265, +0,0055], es decir, un empate dentro del intervalo. También falló G4: 38,9 ms por petición en WASM con la lista de herramientas cacheada, frente a un umbral de 2 ms.

La relevancia de esta ficha es metodológica: el autor publica el modelo para que el resultado pueda comprobarse y ejecutarse, conforme al apartado 11 de la preinscripción, sin cambiar el veredicto ni repetir la ejecución. Las puertas G2 (comportamiento de abstención) y G3 (calibración, ECE 0,0244) sí se cumplieron. El modelo no debe desplegarse como router en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario de decisión (segunda versión de s6-nano, con la forma de s6-micro); detalles de capas no disponibles |
| Parametros totales | 5.587.201 según la model card; 2.214.913 según los safetensors del repo (dato no conciliado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos ternarios (entrenamiento nativo en ternario); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés y francés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería gguf); tamaño del repo 0,0 GB, archivo de 2,4 MB |

## Arquitectura y entrenamiento

El modelo es un transformer de decisión de pesos ternarios que recibe como entrada una petición junto con una lista de hasta 7 herramientas (nombre y una frase cada una) más la opción "ninguna", y produce una distribución de probabilidad sobre las opciones en un solo forward pass. La model card indica que el nombre se fijó antes del entrenamiento y que una regla piloto preinscrita seleccionó el tamaño micro (0,6390 frente a 0,5778 de la variante nano en validación, con un mínimo exigido de 0,04 de diferencia), por lo que la forma final corresponde a s6-micro y no a s6-nano. La implementación es 100 % Rust.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La evaluación incluye conjuntos como T-tools (herramientas no vistas), T-metatool, T-clinc, tool-routing-data, BFCL, When2Call y MASSIVE, lo que sugiere un entrenamiento orientado a dominios de enrutamiento e intenciones, pero la composición del corpus de entrenamiento no está publicada en la información proporcionada. La innovación técnica destacable es el uso de pesos ternarios para comprimir el modelo a 2,4 MB manteniendo calibración (ECE 0,0244) y una precisión muy superior a su versión anterior (0,8395 frente a 0,0885).

## Capacidades

- Clasificación de intención de enrutamiento: asigna una probabilidad a cada una de hasta 7 herramientas candidatas y a la opción "ninguna" en un único forward pass.
- Abstención calibrada: la tasa de respuestas "ninguna" es 0,1565, dentro de la banda 0,10–0,30 exigida por la puerta G2; la mayor desviación por nombre de herramienta es −0,0085 respecto a su cuota real.
- Sensibilidad a la eliminación de la herramienta correcta: la respuesta cambia en el 95,28 % de los pares con la opción dorada eliminada, por encima del umbral de 0,80 de G2.
- Calibración de probabilidades: ECE de 0,0244, mejor que BM25 (0,0610) y próxima a all-MiniLM-L6-v2 (0,0231).
- Multilingüe limitado: inglés y francés, con resultados evaluados en MASSIVE sobre 4 escenarios reservados en ambos idiomas (precisión 0,3645).
- No soporta tool calling generativo, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es exclusivamente un clasificador de enrutamiento.

## Casos de uso

- Investigación sobre enrutamiento léxico frente a neuronal: el modelo sirve como caso de estudio reproducible de un router de 2,4 MB que no supera a BM25 en herramientas no vistas, con intervalos de confianza publicados y código en Rust para replicar la comparación.
- Verificación de resultados negativos: permite a otros equipos reejecutar la evaluación sobre T-tools y comprobar la diferencia de −0,0105 frente a BM25, conforme a la decisión del autor de publicar el archivo para su comprobación.
- Estudio de calibración en modelos minúsculos: con ECE 0,0244 y curvas de precisión por nivel de confianza (0,991 / 0,956 / 0,885 en el 50 % / 70 % / 90 % de slates más seguros), es útil para analizar abstención selectiva en clasificadores de muy bajo coste.
- Análisis de degradación fuera de distribución: los resultados en T-metatool (0,3260), T-clinc (0,3980) y MASSIVE (0,3645) permiten estudiar cómo un modelo ternario diminuto pierde rendimiento cuando las descripciones de herramientas se alejan de la distribución de entrenamiento.
- Docencia y divulgación sobre preinscripción de experimentos: el par modelo más preinscripción (docs/s6-nano2-prereg.md) y resultados completos, fallos incluidos, sirve como material didáctico sobre puertas de aceptación y bootstrap emparejado.
- Referencia para implementaciones en Rust/WASM: aunque incumple el umbral de latencia (38,9 ms frente a 2 ms), el código en Rust y la medición de WASM SIMD128 con discrepancia máxima de 2,2e-6 frente a nativo son un punto de partida para optimizar inferencia ternaria en el navegador.
- No se recomienda su uso como router en producción, atención al cliente, pipelines de CI/CD ni selección de herramientas en agentes, dado el fallo de las puertas G1 y G4.

## Benchmarks y rendimiento

Resultados en T-tools (2.000 slates, herramientas no vistas; precisión, ECE y F1 de "ninguna"):

| Sistema | Tamaño | Precisión | ECE | F1 "ninguna" |
|---|---:|---:|---:|---:|
| s6-route-nano | 2,4 MB | 0,8395 | 0,0244 | 0,7041 |
| BM25 (bm25s) | sin parámetros | 0,8500 | 0,0610 | 0,6486 |
| all-MiniLM-L6-v2, coseno | 90,9 MB | 0,8840 | 0,0231 | 0,7516 |
| toolrouter (stanley-nv) | 7,66 MB | 0,7855 | 0,0886 | 0,3333 |
| static-ft (potion ajustado) | ≤ 2,4 MB | 0,6735 | 0,0430 | 0,4715 |
| potion-base-2M, coseno | 7,56 MB | 0,6675 | 0,0393 | 0,4724 |
| potion-base-2M, coseno, 4 bits | ~1 MB | 0,6665 | 0,0398 | 0,4661 |
| pair-lr (regresión logística) | ≤ 2,4 MB | 0,4500 | 0,0426 | 0,3114 |
| name-prior | — | 0,2000 | 0,8000 | 0,3333 |
| s6-nano (v1), mismo prompt | 715 KB | 0,0885 | 0,1152 | 0,0049 |

Resultados por fuente (precisión):

| Fuente | n | s6-route-nano | potion-cos | BM25 | MiniLM | toolrouter |
|---|---:|---:|---:|---:|---:|---:|
| T-tools (no vistas; con puerta) | 2.000 | 0,8395 | 0,6675 | 0,8500 | 0,8840 | 0,7855 |
| T-metatool (nunca entrenado) | 2.000 | 0,3260 | 0,5245 | 0,4525 | 0,6610 | 0,5855 |
| T-clinc (intenciones por descripción) | 2.000 | 0,3980 | 0,7740 | 0,4775 | 0,8605 | 0,7235 |
| tool-routing-data `tools/test` | 100 | 0,3700 | 0,6100 | 0,3800 | 0,6000 | 0,7900 |
| BFCL `multiple` e `irrelevance` | 440 | 0,7205 | 0,7250 | 0,8295 | 0,7136 | 0,5250 |
| When2Call `test/mcq` | 1.863 | 0,5153 | 0,5722 | 0,4895 | 0,6720 | 0,5915 |
| MASSIVE, 4 escenarios reservados, en y fr | 1.657 | 0,3645 | 0,4762 | 0,3343 | 0,5836 | 0,6035 |

Puertas preinscritas: G1 falla frente a BM25 (−0,0105, IC 95 % [−0,0265, +0,0055]) y se cumple frente a potion-cos (+0,1720 [0,1490, 0,1965]), static-ft (+0,1660 [0,1415, 0,1895]) y pair-lr (+0,3895 [0,3625, 0,4150]); G2 se cumple (0,1565 de respuestas "ninguna", exceso máximo −0,0085, cambio en 0,9528 de los pares); G3 se cumple (ECE 0,0244 ≤ 0,05); G4 falla (38,9 ms frente a 2 ms; discrepancia WASM-nativo 2,2e-6, dentro del límite de 1e-4). Objetivos anunciados no alcanzados: T-metatool y T-clinc ≥ potion-cos, y 0,95 entre peticiones respondidas a τ_ask con cobertura ≥ 0,70 (se obtuvo 0,9433 con cobertura 0,7325).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la práctica; el archivo GGUF ocupa 2,4 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con soporte de inferencia GGUF es suficiente (RTX 4090, A100, H100 no son necesarias).
- Cabe en GPU consumer: sí, en todas las gamas actuales; también en entornos sin GPU.
- Opciones de despliegue: el autor no documenta integraciones con vLLM, llama.cpp, Ollama o TGI; la implementación de referencia es el código en Rust del repositorio skycmd, con soporte de WASM SIMD128.
- Latencia y throughput: 38,9 ms por petición en WASM con la lista de herramientas cacheada (mediana), lo que incumple el umbral de 2 ms de la puerta G4; no se publican cifras de throughput ni latencia nativa.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Precisión en T-tools | ECE | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| s6-route-nano | 2,4 MB | 0,8395 | 0,0244 | Apache 2.0 | Hugging Face (GGUF) |
| potion-base-2M, coseno | 7,56 MB | 0,6675 | 0,0393 | No disponible en la información | Hugging Face |
| toolrouter (stanley-nv) | 7,66 MB | 0,7855 | 0,0886 | No disponible en la información | Hugging Face |
| all-MiniLM-L6-v2, coseno | 90,9 MB | 0,8840 | 0,0231 | No disponible en la información | Hugging Face |
| BM25 (bm25s) | sin parámetros | 0,8500 | 0,0610 | No disponible en la información | Librería bm25s |

Frente a potion-base-2M, s6-route-nano es tres veces más pequeño y obtiene 0,1720 puntos más de precisión en herramientas no vistas, con mejor calibración. Frente a toolrouter, gana 0,0540 puntos con menos de un tercio del tamaño. Frente a all-MiniLM-L6-v2, pierde 0,0445 puntos pese a ser 38 veces más pequeño, y frente a BM25 pierde 0,0105, que es precisamente el fallo de la puerta G1. En el resto de fuentes (T-metatool, T-clinc, MASSIVE) queda por debajo de potion-cos y de MiniLM.

## Limitaciones y advertencias

- Resultado negativo publicado: el autor indica explícitamente que el modelo falló su puerta preinscrita y que se publica como resultado, no para su uso. No debe desplegarse como router.
- Fallo de la puerta G1: no supera a BM25 en T-tools (0,8395 frente a 0,8500), con un intervalo que incluye el empate.
- Fallo de la puerta G4: 38,9 ms por petición en WASM frente a un umbral de 2 ms, lo que lo hace inadecuado para enrutamiento de baja latencia en el navegador.
- Degradación fuerte fuera de distribución: 0,3260 en T-metatool, 0,3980 en T-clinc y 0,3645 en MASSIVE, muy por debajo de potion-cos y MiniLM en esos conjuntos.
- Sin demo: la preinscripción solo publica el playground si se supera la puerta, por lo que no hay demostración interactiva.
- Idiomas limitados a inglés y francés; no se documenta cobertura de castellano.
- Discrepancia en el número de parámetros: 5.587.201 en la model card frente a 2.214.913 en los safetensors, sin aclaración publicada en la información disponible.
- Riesgo de alucinación no aplicable en el sentido generativo (es un clasificador), pero sí riesgo de asignación errónea de herramienta cuando las descripciones se alejan de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el propio autor desaconseja el uso del modelo dado el veredicto negativo.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento, lo que limita la auditoría de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxgfr/s6-route-nano
- Versión anterior s6-nano: https://huggingface.co/maxgfr/s6-nano
- Repositorio de código (Rust): https://github.com/maxgfr/skycmd
- Preinscripción: https://github.com/maxgfr/skycmd/blob/main/docs/s6-nano2-prereg.md
- Resultados de benchmarks: https://github.com/maxgfr/skycmd/blob/main/BENCH.md#s6-route-nano-s6-nano-v2-a-tool-router-pre-registered-gate-failed
- Resultados de la evaluación en test: https://github.com/maxgfr/skycmd/blob/main/runs/s6-nano2/eval-test/results.md
- Página de resultados completa (incluidos fallos): https://maxgfr.github.io/skycmd/results/
