# jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429

## Resumen

Microduck Tug of War - quicksilver v14 h2 (63aab429) es una política de control para robótica simulada, publicada por jrubiosainz como entrada en la competición Microduck Arena, en la modalidad Tug of War. No se trata de un modelo de lenguaje: es un grafo computacional exportado a ONNX (aproximadamente 990 KB) que mapea observaciones del entorno de simulación a comandos de acción. Su función es resolver una tarea concreta de tracción en un entorno físico simulado, no generar texto ni razonar de forma general.

El modelo es un finetune derivado de la política pública de HlibPlakhtii (`microduck-tug-quicksilver-v14`, revisión `a2f41160...`), que a su vez es un remix atribuido de `jrubiosainz/microduck-tug-lphat-c2-s1s5`, combinando `lphatnguyen/microduck-tug-of-war-v0` con filas de búsqueda C2. La contribución de esta versión consiste en cuatro tablas de búsqueda de observaciones (lookups) añadidas mediante la función `overlay()` del script `search_race.py` del autor base, sin reentrenar ningún peso de la red heredada.

Es relevante en el contexto de la Microduck Arena como ejemplo de optimización in-sample sobre semillas declaradas: cada lookup compara los primeros 48 valores de observación con tolerancia 1e-7 y, si hay coincidencia, emite una acción almacenada; en caso contrario, decide el grafo heredado. El modelo está pensado exclusivamente para simulación y no debe ejecutarse en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de política de control (red heredada + 4 tablas de lookup de observaciones) |
| Parametros totales | no disponible (pesos heredados sin reentrenar; tamaño del fichero de política: 989 948 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de 48 valores de observación por lookup) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 solo para la contribución heredada; el modelo combinado no tiene licencia propia declarada |
| Formato de pesos | ONNX (policy SHA-256 `63aab429c8c06e9ec389bd3d54c520e3d9f7057719dcba780c47904ddaa33fb5`) |

## Arquitectura y entrenamiento

La arquitectura es un grafo ONNX de política para robótica, heredado íntegramente de `HlibPlakhtii/microduck-tug-quicksilver-v14`. Todos los inicializadores heredados son byte-idénticos y todos los nodos heredados se mantienen sin cambios, salvo el renombrado de la salida del último nodo base para alimentar el primer lookup nuevo. Sobre ese grafo se añaden cuatro tablas de búsqueda con la función `overlay()` de `search_race.py`, cada una con prefijo de inicializador propio (`search2_`, `search3_`, `search4_`, `search5_`), sigma 0.01, población 32 y stride 2.

Las filas de las tablas provienen de una búsqueda CMA-ES separable (cma 4.5.0, usando `search_tug.py` y `search_race.py` de HlibPlakhtii, RNG 73 y RNG de comprobación 77) con la física no modificada de la Arena sobre x86_64 Linux. Los lookups cubren las semillas oficiales 2, 3, 4 y 5, con 28, 18, 28 y 11 filas respectivamente (filas de búsqueda k30-k57, k54-k71, k32-k59 y k58-k68). No se entrenaron ni modificaron pesos de red, ni la física, el árbitro, el servidor o los datos de la clasificación. No se documenta ningún proceso de RLHF, DPO ni entrenamiento supervisado adicional.

## Capacidades

- Control de política para la tarea Tug of War en el simulador Microduck Arena, emitiendo comandos de acción a partir de observaciones del entorno.
- Lookup determinista de acciones: compara los primeros 48 valores de observación con tolerancia 1e-7 y reproduce una acción almacenada si hay coincidencia.
- Fallback al grafo heredado cuando ninguna tabla de lookup coincide.
- Optimización in-sample de las semillas oficiales 2, 3, 4 y 5 declaradas por la Arena.
- Ejecución mediante el runner 5 con el árbol fijado de Arena 0.7.0.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Competición en Microduck Arena (Tug of War): el modelo se presenta como entrada en la modalidad Tug of War y se evalúa con el evaluador canónico de la Arena, que selecciona el comando vx -0.3.
- Reproducción de resultados de referencia: permite replicar la puntuación nativa declarada (media de 166.6911780834198 cm con cinco victorias por foso) usando el árbol fijado de Arena 0.7.0 y el runner 5.
- Estudio de optimización in-sample: sirve para analizar cómo la adición de tablas de lookup sobre semillas concretas mejora métricas concretas (por ejemplo, semilla 2 de 166.57912135124207 a 166.77944660186768 cm).
- Comparación de estrategias de búsqueda: útil para contrastar los resultados de la búsqueda CMA-ES separable frente a la política base en cada semilla declarada.
- Investigación sobre sensibilidad numérica: dado que el replay exacto depende de la reproducción en coma flotante, el modelo permite estudiar la robustez de políticas con lookups de tolerancia fija.
- Docencia y experimentación en robótica simulada: como ejemplo compacto (menos de 1 MB) de política ONNX con capas de lookup, adecuado para entornos docentes de simulación.

## Benchmarks y rendimiento

Resultados de replay nativo con el árbol fijado de Arena 0.7.0 y runner 5, comando vx -0.3 (la puntuación pública de la Arena es la autoritativa):

| Metrica | Base (HlibPlakhtii v14) | Este modelo | Mejora |
|---|---|---|---|
| Media global (cm) | 166.57612562179565 | 166.6911780834198 | +0.11505246162415 |
| Semilla 1 (cm) | bit-idéntica | bit-idéntica | 0 |
| Semilla 2 (cm) | 166.57912135124207 | 166.77944660186768 | +0.20032525062561 |
| Semilla 3 (cm) | 166.28799438476562 | 166.4285659790039 | +0.14057159423828 |
| Semilla 4 (cm) | 166.7003333568573 | 166.87496900558472 | +0.17463564872742 |
| Semilla 5 (cm) | 167.42557883262634 | 167.48530864715576 | +0.05972981452942 |
| Victorias por foso | no disponible | 5 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el fichero de política ocupa 989 948 bytes, por lo que la huella de memoria es mínima.
- GPU recomendadas: no se especifican; al ser un grafo ONNX de menos de 1 MB, puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo puede alojar el grafo por tamaño, aunque no se documentan requisitos concretos.
- Opciones de despliegue: runtime ONNX y el runner 5 de Microduck Arena 0.7.0; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media, cm) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (h2, 63aab429) | no disponible (989 948 bytes) | no aplica | 166.6911780834198 | Apache-2.0 solo herencia | HuggingFace (jrubiosainz) |
| HlibPlakhtii/microduck-tug-quicksilver-v14 | no disponible (960 584 bytes) | no aplica | 166.57612562179565 | Apache-2.0 (contribución heredada) | HuggingFace (HlibPlakhtii) |
| jrubiosainz/microduck-tug-lphat-c2-s1s5 | no disponible | no aplica | no disponible | no disponible | HuggingFace (jrubiosainz) |
| lphatnguyen/microduck-tug-of-war-v0 | no disponible | no aplica | no disponible | no disponible | HuggingFace (lphatnguyen) |

## Limitaciones y advertencias

- No es una política de locomoción general ni una política para robot real: el autor advierte explícitamente de que no debe ejecutarse en un robot físico.
- Optimización in-sample de las semillas declaradas: las mejoras medidas pueden no generalizar a semillas no incluidas en la búsqueda.
- El replay exacto es sensible a la reproducción en coma flotante; los resultados pueden variar según el entorno de ejecución.
- La red heredada no fue entrenada por el autor de este finetune, y no se modificaron pesos.
- Licencia ambigua para uso combinado: `LICENSE-apache-2.0.txt` cubre solo la contribución heredada Apache-2.0 según `NOTICE`, no el modelo combinado completo, y el autor no añade licencia propia.
- No se documentan sesgos, riesgos de alucinación, limitaciones de idioma ni caveats de producción adicionales, dado que no es un modelo de lenguaje.
- El modelo está pensado exclusivamente para simulación dentro de la Microduck Arena.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429
- Modelo base: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v14/tree/a2f41160287beb86c23e287030a69f4e2226180f
- Model card del base: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v14/blob/a2f41160287beb86c23e287030a69f4e2226180f/BASE_MODEL_CARD.md
- Modelo intermedio: https://huggingface.co/jrubiosainz/microduck-tug-lphat-c2-s1s5/tree/46d9c19697dbe10acfb04317c7c0931d991dc41c
- Modelo original: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v0/tree/bca92ace3a25d383e806456bedc4148807cdcdf6
