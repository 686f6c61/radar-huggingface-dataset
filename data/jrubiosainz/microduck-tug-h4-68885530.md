# jrubiosainz/microduck-tug-h4-68885530

## Resumen

Microduck Tug of War - h4 (68885530) es una política de control para robótica de simulación presentada como entrada a la competición **Tug of War** de Microduck Arena. No se trata de un modelo de lenguaje ni de un transformer generativo: es una red neuronal en formato ONNX (librería `microduck`, pipeline `robotics`) que produce acciones de control a partir de observaciones del entorno simulado. El autor es `jrubiosainz` y el modelo deriva por fine-tune del checkpoint `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429`.

La peculiaridad técnica de esta entrega es que **no entrena pesos nuevos**. Preserva íntegramente el grafo heredado (todos los inicializadores son byte-idénticos) y le añade una tabla de búsqueda de 346 filas que actúa como memoria de replay exacto: compara los primeros 48 valores de observación con tolerancia `1e-7` y, si hay coincidencia, emite la acción almacenada; en caso contrario, delega en el grafo heredado. Las filas corresponden a las grabaciones completas de los cinco combates oficiales de rating.

Es relevante ahora porque ilustra una práctica controvertida en competiciones de simulación: el *overfitting* explícito a los *seeds* de evaluación declarados. El propio autor lo reconoce en la model card («in-sample replay», «not a policy trained entirely by us»). Su interés para desarrolladores e investigadores es, por tanto, metodológico y de auditoría de benchmarks, más que como controlador reutilizable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward en ONNX (grafo heredado + tabla de búsqueda `search6_`); topología interna no detallada |
| Parámetros totales | no disponible (pesos del grafo: 989 948 bytes; política combinada: 1 094 720 bytes) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 48 valores comparados con tolerancia 1e-7 |
| Tipos de cuantización | no disponible (formato ONNX de precisión nativa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 solo para las contribuciones heredadas según `NOTICE`; no se añade licencia propia al modelo combinado |
| Formato de pesos | ONNX (grafo con inicializadores; prefijo de la tabla: `search6_`) |

## Arquitectura y entrenamiento

La política heredada (`quicksilver-v14-h2-63aab429`, SHA-256 `63aab429…`, revisión `d8ec37ed…`) es un grafo ONNX de 989 948 bytes que se conserva sin modificaciones nodo a nodo, salvo que el nodo de salida ahora escribe `search6_fallback`, que alimenta la nueva búsqueda. Sobre ese grafo se añadió, mediante la función `overlay()` de `search_race.py` de HlibPlakhtii, una tabla de 346 filas con prefijo `search6_`. La lógica de inferencia es: si los primeros 48 valores de observación coinciden con una fila dentro de `1e-7`, se reproduce la acción almacenada; si no, decide el grafo heredado.

No hubo entrenamiento de pesos ni ajuste por RLHF/DPO. Las filas de la tabla son las grabaciones completas de los cinco *bouts* oficiales de rating, obtenidas con la física sin modificar de Arena en x86_64 Linux. El autor verificó con 12 combates de copa (ambos lados, 3 oponentes) que el candidato y la red sin modificar producen el mismo resultado y trazas idénticas bit a bit, lo que confirma que la tabla solo se activa en los *seeds* memorizados.

## Capacidades

- Generación de acciones de control en el simulador Tug of War de Microduck Arena (tracción de cuerda).
- Replay exacto de los cinco *seeds* oficiales de rating declarados (seeds 1 a 5).
- Comportamiento idéntico a la política base fuera de los *seeds* memorizados (verificado en 12 combates de copa).
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No es un controlador de locomoción general ni una política para robot físico.

## Casos de uso

- **Auditoría de benchmarks de simulación**: usar la tabla y el `NOTICE` como caso de estudio para detectar *overfitting* a *seeds* de evaluación en leaderboards de robótica simulada; el patrón (lookup de observaciones + fallback) es fácilmente identificable en el grafo ONNX.
- **Reproducción bit a bit de resultados públicos**: el modelo permite reproducir exactamente los resultados de Arena de cada *seed* (167,24 cm de media en replay nativo), útil para verificar la infraestructura de evaluación.
- **Pruebas de regresión del simulador**: al ser determinista en los *seeds* memorizados, sirve para comprobar que cambios en la física o en el *runner* de Arena rompen o no la reproducibilidad esperada.
- **Investigación sobre memorización en políticas de control**: comparar el rendimiento *in-sample* (167,24 cm) frente al de la política base (166,69 cm) cuantifica la ganancia artificial del replay.
- **Docencia sobre integridad en competiciones**: ejemplo concreto de cómo una tabla de 346 filas mejora la puntuación sin aprender nada nuevo, para discutir reglas de elegibilidad.
- **Validación de la herramienta `overlay()` de HlibPlakhtii**: el repositorio documenta el uso de `search_race.py` para añadir tablas de búsqueda a grafos ONNX existentes, reutilizable en otros experimentos de *wrapper* sobre políticas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Replay nativo, media de 5 seeds (Arena 0.7.0, runner 5, comando vx -0.3) | 167,24387168884277 cm |
| Victorias por *pit* en replay nativo | 5 de 5 |
| Política base `quicksilver-v14-h2-63aab429`, media | 166,6911780834198 cm |
| Seed 1 (base → candidato) | 165,88760018348694 → 166,77023768424988 cm |
| Seed 2 (base → candidato) | 166,77944660186768 → 167,97891855239868 cm |
| Seed 3 (base → candidato) | 166,4285659790039 → 166,53597950935364 cm |
| Seed 4 (base → candidato) | 166,87496900558472 → 167,4489140510559 cm |
| Seed 5 (base → candidato) | 167,48530864715576 cm (sin cambio; filas grabadas de la propia base) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo pesa ~1,1 MB, por lo que cabe en cualquier GPU con unos pocos MB libres, e incluso en CPU.
- GPU recomendadas: no aplica; cualquier GPU moderna o CPU x86_64 es suficiente para inferencia ONNX.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) y en CPU.
- Opciones de despliegue: runtime ONNX (ONNX Runtime), librería `microduck`, y el *runner* de Microduck Arena 0.7.0 con árbol fijado.
- Latencia y throughput: no disponibles; el coste dominante es la comparación de 48 valores por paso, despreciable frente a la física del simulador.
- Requisito crítico: la reproducibilidad exacta depende de la reproducción en coma flotante; entornos distintos pueden no activar la tabla.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Puntuación (cm) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-tug-h4-68885530` (este) | ONNX + tabla de búsqueda | Replay *in-sample* de 5 seeds | 167,24 (media nativa) | Apache-2.0 solo heredada; sin licencia propia | HuggingFace |
| `jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429` | ONNX | Política base sin tabla | 166,69 | Apache-2.0 | HuggingFace |
| `Unique007/microduck-tug-dat-v3` | Política de simulación | Fuente de las grabaciones de seeds 1, 2 y 4 | no disponible | no disponible | HuggingFace |
| `greecree/microduck-tug-of-war-tug-super-v8` | Política de simulación | Fuente de la grabación del seed 3 | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- **Replay *in-sample***: la tabla memoriza los cinco *seeds* oficiales; la mejora no se generaliza a *seeds* no vistos.
- **Sensibilidad numérica**: la coincidencia exige tolerancia `1e-7` en 48 valores; cambios de plataforma, compilador o física pueden desactivar la tabla y degradar el resultado al de la política base.
- **No es un controlador general**: el autor lo declara explícitamente; no debe usarse como política de locomoción.
- **No apto para robot físico**: advertencia explícita del autor («do not run it on a physical robot»).
- **Licencia ambigua para uso comercial**: Apache-2.0 cubre solo las contribuciones heredadas según `NOTICE`; el modelo combinado no tiene licencia propia, lo que genera incertidumbre legal.
- **Integridad competitiva**: la model card reconoce que no es una política entrenada íntegramente por el autor, lo que puede contravenir las reglas de la Arena.
- **Sesgos**: no disponibles en la información proporcionada; al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de evaluación derivados de la selección de *seeds*.
- **Riesgo de alucinación**: no aplica; el riesgo equivalente es la falsa atribución de rendimiento por replay.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jrubiosainz/microduck-tug-h4-68885530
- Modelo base (revisión fijada): https://huggingface.co/jrubiosainz/microduck-tug-quicksilver-v14-h2-63aab429/tree/d8ec37ed882a33231aa8da0da07b75cb7e21608b
- Fuente de grabaciones seeds 1, 2 y 4: https://huggingface.co/Unique007/microduck-tug-dat-v3/tree/6e4b75f8db0fa8ef23b61a7d798ab5dac9aabe82
- Fuente de grabación seed 3: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v8/tree/af68686876537cfcfea691126d108fb7ba585fe9
- Código `overlay()` de HlibPlakhtii: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v14/tree/a2f41160287beb86c23e287030a69f4e2226180f
- Microduck Arena: no disponible como enlace en la información proporcionada
- Pollen Robotics: no disponible como enlace en la información proporcionada
