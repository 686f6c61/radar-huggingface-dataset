# jrubiosainz/microduck-tug-cup3-p10g-3a94031b

## Resumen

`jrubiosainz/microduck-tug-cup3-p10g-3a94031b` es una política de control para robótica simulada, publicada en Hugging Face dentro del ecosistema Microduck Arena, concretamente en la categoría Tug of War. No se trata de un modelo de lenguaje: es un artefacto de inferencia (policy) en formato ONNX, identificado por el SHA-256 exacto `3a94031bcadef0b3f92b70aefbd68afec9f5eee7426da2dda535e0edac28aa54` y con un tamaño de 1.045.628 bytes. El autor es el usuario `jrubiosainz` y el modelo se declara explícitamente como "simulation only".

El artefacto es un merge de dos políticas previas: `SSH111111/microduck-tug-p10` y `jrubiosainz/microduck-tug-n3g53-50be8004`. Según la model card, la política resultante es la entrada `n3g53` con dos modificaciones: (A) la red de fallback, que se activa cuando ninguna fila de lookup coincide, es la red de `SSH111111/microduck-tug-p10` sin cambios; y (B) se incorporan 35 filas de lookup con los resultados de CMA-ES por semilla del autor para las semillas 2 y 3.

Su relevancia es acotada pero concreta: sirve como entrada reproducible y verificable en un benchmark de robótica simulada, con un sistema de recibos de replay (`x86-replay-receipt.json`) que permite auditar la puntuación obtenida. El resultado declarado con el evaluador oficial en un runner x86 local es de 168,9736270904541 (representación hexadecimal `0x1.51f27f4000000p+7`), con cinco `pit_won`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control con red de fallback y tabla de lookup; se desconoce la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible; la model card indica "No blanket licence is asserted" |
| Formato de pesos | ONNX (según tag `onnx`); tamaño exacto del policy: 1.045.628 bytes |
| Pipeline | robotics |
| Libreria | microduck |
| SHA-256 del policy | `3a94031bcadef0b3f92b70aefbd68afec9f5eee7426da2dda535e0edac28aa54` |
| Modelos base | `SSH111111/microduck-tug-p10`, `jrubiosainz/microduck-tug-n3g53-50be8004` |
| Relacion con base | merge |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la red neuronal (número de capas, tipo de transformer, CNN u otra topología). Lo que sí se detalla es la estructura de la política: se compone de una red de fallback, que se ejecuta cuando ninguna fila de lookup coincide con el estado de entrada, y de una tabla de lookup con 35 filas. La red de fallback es la de `SSH111111/microduck-tug-p10`, incorporada sin cambios; las 35 filas de lookup contienen los resultados de ejecuciones propias del autor con CMA-ES (optimización por estrategia de evolución) para las semillas 2 y 3.

El proceso de construcción es por tanto un merge híbrido: se conserva la red de un modelo base y se sustituye o amplía la tabla de lookup con datos generados mediante búsqueda evolutiva. La model card subraya que las semillas 2 y 3 difieren del replay de `n3g53` y que ninguna ejecución del tablero alcanza esta puntuación, lo que se presenta como evidencia de que no es una copia. No se especifican datos de entrenamiento en términos de tokens, composición de dataset ni uso de RLHF/DPO, ya que no aplica al paradigma de este artefacto.

## Capacidades

- Control de política para la tarea Tug of War en el entorno simulado Microduck Arena.
- Inferencia con red de fallback para estados no cubiertos por la tabla de lookup.
- Recuperación determinista mediante 35 filas de lookup para estados conocidos (semillas 2 y 3).
- Replay reproducible en runner x86 con el evaluador oficial, con recibo criptográfico (`x86-replay-receipt.json`).
- Verificación de integridad mediante SHA-256 del policy.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: es una política de control, no un modelo generativo.

## Casos de uso

- Evaluación reproducible en Microduck Arena: la política se puede cargar en el runner x86 oficial y comparar su puntuación con la declarada (168,9736270904541) usando el recibo de replay, lo que permite auditar la entrada de forma independiente.
- Investigación en optimización evolutiva: las 35 filas de lookup generadas con CMA-ES sirven como caso de estudio de cómo la búsqueda por evolución complementa una red de fallback en dominios de control.
- Baseline para ablaciones: al conservar la red de `SSH111111/microduck-tug-p10` sin cambios, permite aislar el efecto de las filas de lookup frente a la red base en experimentos controlados.
- Verificación de integridad en pipelines de CI: el SHA-256 del policy y el tamaño exacto en bytes permiten validar que el artefacto desplegado coincide con el publicado antes de lanzar un replay.
- Estudio de merges de políticas: el artefacto documenta explícitamente qué partes provienen de cada modelo base (red de fallback de un modelo, lookup de otro), lo que facilita analizar estrategias de composición.
- Docencia en robótica simulada: como ejemplo acotado y de tamaño reducido (1 MB), sirve para ilustrar el ciclo completo de publicación, evaluación y verificación de una política en un benchmark abierto.

## Benchmarks y rendimiento

Resultados declarados por el autor con el evaluador oficial en replay local x86 (runner-5):

| Metrica | Valor |
|---|---|
| Puntuación exacta (evaluador oficial) | 168,9736270904541 (`0x1.51f27f4000000p+7`) |
| `pit_won` | 5 |
| Semilla 1 | 169,0427839756012 |
| Semilla 2 | 169,0822422504425 |
| Semilla 3 | 168,73663663864136 |
| Semilla 4 | 169,45866346359253 |
| Semilla 5 | 168,54780912399292 |

No se han publicado comparaciones con otros modelos en la información disponible más allá de la afirmación de que ninguna ejecución del tablero alcanza esta puntuación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el policy ocupa 1.045.628 bytes, por lo que el requisito de memoria es marginal en cualquier GPU moderna.
- GPU recomendadas: no disponibles; el autor solo documenta replay en runner x86 (CPU), no se especifican GPU.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del artefacto, pero no está confirmado en la información disponible.
- Opciones de despliegue: librería `microduck` (según `library_name`) y runtime ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Puntuacion declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-tug-cup3-p10g-3a94031b` | Política Tug of War (merge) | 1.045.628 bytes | 168,9736270904541 | no disponible | Hugging Face |
| `jrubiosainz/microduck-tug-n3g53-50be8004` | Política Tug of War (base del merge) | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| `SSH111111/microduck-tug-p10` | Política Tug of War (red de fallback) | no disponible | no disponible en esta ficha | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación de rendimiento queda limitada a la puntuación declarada del modelo descrito.

## Limitaciones y advertencias

- El modelo está declarado explícitamente como "simulation only": no debe usarse en sistemas físicos reales.
- No se afirma ninguna licencia global ("No blanket licence is asserted"), por lo que el uso comercial queda sin autorización clara y requiere contactar con el autor y revisar los ficheros `NOTICE` y `UPSTREAM-*`.
- La puntuación declarada proviene de un replay local del propio autor; no se aporta una verificación independiente por parte de terceros.
- El rendimiento depende críticamente de la coincidencia con las 35 filas de lookup; fuera de esos estados, la política recurre a la red de fallback, cuyo comportamiento no se documenta en detalle.
- No hay información sobre sesgos, alucinación ni comportamiento fuera de distribución, aunque el concepto de alucinación no aplica a una política de control.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario.
- No se especifican idiomas ni contexto porque no aplica; cualquier expectativa de uso como modelo de lenguaje es un error de categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-p10g-3a94031b
- Modelo base (red de fallback): https://huggingface.co/SSH111111/microduck-tug-p10
- Modelo base (entrada n3g53): https://huggingface.co/jrubiosainz/microduck-tug-n3g53-50be8004
