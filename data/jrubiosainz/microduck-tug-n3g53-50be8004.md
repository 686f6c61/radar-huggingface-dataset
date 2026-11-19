# jrubiosainz/microduck-tug-n3g53-50be8004

## Resumen

Tug n3g53-50be8004 es una política de control para robótica publicada en Hugging Face por el usuario jrubiosainz dentro del ecosistema Microduck Arena, un entorno de simulación orientado a competiciones de agentes robóticos. Se trata de una entrada para la prueba de "tug of war" (tira y afloja) de dicha arena, identificada con el SHA-256 exacto `50be8004abdb26f10fda4a6606522f12602dcde7661395c7d9f2207cb4b93a53` y un tamaño de 1.045.628 bytes. El modelo es una fusión (merge) de dos políticas previas: nootxlm/microduck-tug-entry-2 y jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7.

La relevancia de esta publicación es acotada y muy específica: no se trata de un modelo de lenguaje ni de un sistema de propósito general, sino de una política de control optimizada para una tarea concreta dentro de un simulador, evaluada con un runner x86 local y el evaluador oficial de la arena. El autor reporta una puntuación de replay de 168,96615147590637 con cinco victorias de "pit", y desglosa las puntuaciones por semilla (entre 168,5478 y 169,4587). El modelo se distribuye en formato ONNX y su librería asociada es `microduck`.

No se dispone de información sobre arquitectura de red, número de parámetros, longitud de contexto, idiomas ni licencia. La model card indica explícitamente que se trata de un artefacto de simulación y que no se afirma una licencia global ("No blanket licence is asserted"), remitiendo a los ficheros `NOTICE` y a las cartas upstream para los créditos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control para simulación; pesos de red heredados de u345n2) |
| Parametros totales | no disponible (tamaño del artefacto: 1.045.628 bytes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible ("no blanket licence is asserted"; ver `NOTICE`) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible describe una política compuesta por tablas de búsqueda y pesos de red. La model card detalla que los pesos de red son los de la composición u345n2, sin cambios, y que la aportación de esta versión se concentra en la modificación de filas concretas de las tablas de búsqueda. En la capa de observación/acción externa (lk_obs/lk_act) se reescriben las filas 0-68 (neutralizadas en u345n2) con los nuevos acabados y se reutilizan las filas 123-138 (activas en u345n2). En la tabla de rating interna (search_obs/search_act) se fijan las filas 50-51, 120, 187, 190, 201, 261 y 263 al centinela 1e30, que nunca coincide, porque las nuevas trayectorias pasan por donde antes se activaban esas filas.

El proceso de refinamiento se describe como "per-seed CMA-ES finishes" aplicado durante la noche a las semillas 1, 2, 3, 4 y 5 sobre la composición u345n2, que a su vez es un remix de la política s4 del propio autor con las tablas de rating internas u345. El autor subraya que las semillas 1 a 5 difieren de cualquier ejecución anterior, por lo que no se trata de una copia. No se especifican datos de entrenamiento en términos de tokens, composición del dataset ni uso de RLHF o DPO, dado que el artefacto no es un modelo de lenguaje.

## Capacidades

- Control de política para la prueba de tug of war en el simulador Microduck Arena.
- Ejecución determinista verificable mediante SHA-256 del artefacto (`50be8004...b93a53`) y replay local en x86 con el evaluador oficial.
- Reproducibilidad entre entornos: el autor indica que la misma configuración x86 reprodujo exactamente la puntuación de nootxlm entry-2 (168,9060366153717), lo que sirve como control de calibración del runner.
- Composición mediante merge de políticas y refinamiento por semilla con CMA-ES.
- Distribución en ONNX, apta para inferencia en runners compatibles.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Evaluación de políticas en Microduck Arena: la política se carga en el runner oficial para medir su puntuación en la prueba de tug of war, con el SHA-256 como garantía de integridad del artefacto evaluado.
- Reproducción de resultados en x86: el fichero `x86-replay-receipt.json` permite replicar la puntuación reportada (168,96615147590637) y verificar la coherencia del entorno de evaluación antes de comparar políticas.
- Investigación sobre optimización por semilla: el desglose de puntuaciones por semilla (169,0428; 169,0766; 168,7049; 169,4587; 168,5478) sirve para estudiar la varianza de la política y la estabilidad del refinamiento CMA-ES.
- Estudio de técnicas de merge de políticas: la composición u345n2 y la sustitución selectiva de filas en tablas de búsqueda constituyen un caso concreto de combinación de políticas con intervención quirúrgica sobre tablas.
- Análisis de robustez mediante centinelas: la fijación de filas al valor 1e30 permite estudiar cómo se comporta la política cuando se desactivan reglas de búsqueda que antes se activaban en trayectorias concretas.
- Integración en pipelines de simulación ONNX: el artefacto puede cargarse en entornos de inferencia ONNX para experimentos de control en simulación, siempre que se respete el contexto de la arena y los créditos del `NOTICE`.

## Benchmarks y rendimiento

| Semilla | Puntuación |
|---|---|
| 1 | 169,0427839756012 |
| 2 | 169,07657384872437 |
| 3 | 168,70492696762085 |
| 4 | 169,45866346359253 |
| 5 | 168,54780912399292 |
| Replay local x86 (evaluador oficial) | 168,96615147590637 (`0x1.51eeab6800000p+7`), cinco `pit_won` |

Como referencia de calibración, el autor indica que la misma configuración x86 reprodujo la puntuación de nootxlm entry-2: 168,9060366153717. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con la naturaleza del artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto ocupa 1.045.628 bytes, por lo que el requisito de memoria es previsiblemente mínimo, pero no se documenta.
- GPU recomendadas: no disponible. El autor reporta replays en un entorno x86 local, sin especificar GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX y el runner oficial de Microduck Arena (runner-5 en x86 según la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Relación | Puntuación reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tug n3g53-50be8004 (este) | Política de control ONNX | Merge de entry-2 y s4 con refinamiento CMA-ES | 168,96615147590637 (replay x86) | No disponible | Hugging Face, 0 descargas |
| nootxlm/microduck-tug-entry-2 | Política de control | Modelo base del merge | 168,9060366153717 (replay x86, reproducido por el autor) | No disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7 | Política de control | Modelo base del merge (remixado en u345n2) | No disponible | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparables adicionales ni de otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica "Simulation only": el artefacto está pensado exclusivamente para simulación y no se ha validado en hardware físico.
- No se afirma una licencia global ("No blanket licence is asserted"), por lo que el uso comercial queda sin autorización explícita y requiere revisar el fichero `NOTICE` y las cartas upstream (`S4-*` y `UPSTREAM-NOOTXLM-ENTRY-2-*`).
- Los pesos de red no son originales de esta publicación: se heredan sin cambios de la composición u345n2, y la aportación propia se limita a modificaciones de filas en tablas de búsqueda.
- La puntuación reportada procede de un replay local en x86 con el evaluador oficial; no se documenta una validación independiente por terceros.
- El rendimiento está acotado a la prueba de tug of war de Microduck Arena; no hay evidencia de generalización a otras tareas.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo de lenguaje; esas categorías no aplican.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja una validación comunitaria nula.
- La fecha de creación indicada (2026-11-19) es posterior a la fecha habitual de referencia; conviene verificar la coherencia temporal de los metadatos antes de citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-n3g53-50be8004
- Modelo base entry-2: https://huggingface.co/nootxlm/microduck-tug-entry-2
- Modelo base s4: https://huggingface.co/jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7
- Ficheros citados en la model card: `x86-replay-receipt.json`, `NOTICE`, `S4-*`, `UPSTREAM-NOOTXLM-ENTRY-2-*` (disponibles en el repositorio del modelo)
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
