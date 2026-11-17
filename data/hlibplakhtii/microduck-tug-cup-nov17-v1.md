# HlibPlakhtii/microduck-tug-cup-nov17-v1

## Resumen

microduck-tug-cup-nov17-v1 es un adaptador de control para robótica de simulación publicado por HlibPlakhtii en Hugging Face. Se trata de un fine-tune derivado de jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7, un controlador de política entrenado para el entorno Microduck de Pollen Robotics. El modelo se distribuye en formato ONNX y se integra mediante la librería microduck, orientada a políticas de control robótico en simulación, no a generación de lenguaje.

El modelo no entrena una red desde cero: hereda la red del modelo base y añade un adaptador de controlador descrito en `adapter-config.json`, junto con una integración de replays de rating. Su relevancia es acotada y específica: se enmarca en competiciones de simulación de Microduck (torneo "Cup") y su evaluación se limita a réplicas locales deterministas frente a controladores públicos del mismo ecosistema.

No hay información sobre arquitectura de red, número de parámetros, contexto, idiomas ni licencia. La model card insiste en que los resultados son pruebas locales sobre oponentes y semillas concretas, no un resultado oficial de torneo, y que no se ha modificado evaluador, física, árbitro ni servidor. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control robótico; red heredada del modelo base, sin detalles publicados) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de control, no lingüístico) |
| Licencia | no disponible (la model card declara no reclamar licencia sobre contribuciones upstream sin licencia) |
| Formato de pesos | ONNX (tag `onnx`); repo de 0.0 GB según Hugging Face |

## Arquitectura y entrenamiento

No se publican detalles de la arquitectura de la red. El modelo es un fine-tune del controlador jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7, y la model card indica explícitamente que no se entrenó la red heredada: el entrenamiento y las adaptaciones previas se atribuyen a los autores upstream. Lo que aporta este repositorio es un adaptador de controlador (descrito en `adapter-config.json`) y la integración de replays de rating.

La evaluación se basa en cinco replays de rating con observación exacta procedentes de la fuente atribuida, que suman 167,50347733498 cm y cinco victorias en el foso. Según la model card, los cinco combates reproducen ambos patos y la cuerda de forma exacta, y 16 combates independientes de estilo Cup reproducen exactamente el controlador general tras aplicar el overlay. También se reportan pruebas locales: el controlador genérico adaptado ganó 105/128 combates completos contra el líder actual de rating fijado, frente a 68/128 del base sin cambios en las mismas semillas; el intervalo bootstrap pareado al 95 % para la mejora en tasa de victoria fue de 18,75 a 39,06 puntos porcentuales. Un cribado de campo de cuatro combates por oponente dio 133/140 victorias contra 35 controladores públicos, con derrota en los cuatro combates contra juicenv (contraconocido) y sin disponibilidad de la entrada privada anhalu.

## Capacidades

- Control de política robótica en el entorno de simulación Microduck (torneo Cup).
- Ejecución de combates de "tug" (arrastre/forcejeo) entre patos simulados con reproducción determinista de observaciones.
- Integración de replays de rating con observación exacta y verificación de reproducibilidad.
- Aplicación de un overlay de adaptador sobre un controlador genérico heredado.
- Evaluación frente a controladores públicos del ecosistema (35 oponentes en el cribado reportado).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.

## Casos de uso

- Evaluación de controladores en simulación: usar el adaptador para reproducir combates deterministas contra oponentes fijados y comparar tasas de victoria con el base, tal como se hizo en las 128 partidas reportadas.
- Investigación en robótica de competición: estudiar cómo un overlay de adaptador modifica el comportamiento de un controlador genérico sin reentrenar la red, con verificación de reproducibilidad exacta de observaciones.
- Validación de pipelines de rating: integrar los replays de rating en flujos de verificación que comprueben que ambos patos y la cuerda se reproducen de forma exacta.
- Cribado de oponentes: emplear el controlador adaptado como referencia en pruebas de campo contra conjuntos de controladores públicos (por ejemplo, los 35 usados en el cribado 133/140).
- Análisis de contraconocidos: usar la derrota documentada frente a juicenv para estudiar límites del adaptador y diseñar estrategias de mitigación.
- Reproducibilidad de experimentos: servir como artefacto ONNX versionado (creado y actualizado el 2026-11-17) para replicar resultados locales con semillas y oponentes fijados.
- Docencia o demostración de evaluación en simulación: ilustrar la diferencia entre pruebas locales y resultado oficial de torneo usando las cifras y advertencias de la model card.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| Replays de rating (5 combates) | 167,50347733498 cm y 5 victorias en el foso | Replays de observación exacta de la fuente atribuida |
| Reproducibilidad de combates | 5/5 reproducen ambos patos y la cuerda; 16 combates Cup reproducen el controlador general tras el overlay | Verificación local |
| Victorias vs. líder de rating fijado | 105/128 (adaptado) frente a 68/128 (base sin cambios) | Mismas semillas de combate |
| Mejora en tasa de victoria | 18,75 a 39,06 puntos porcentuales (IC bootstrap pareado al 95 %) | Cálculo sobre las 128 partidas |
| Cribado de campo | 133/140 victorias contra 35 controladores públicos | Cuatro combates por oponente |
| Contra juicenv | 0/4 victorias | Contraconocido documentado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es coherente con la naturaleza del modelo. La model card subraya que el resultado oficial del torneo es la referencia autoritativa y que estas cifras son muestras locales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio figura con 0.0 GB y no se publican parámetros ni tamaño de la red).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: formato ONNX, pensado para la librería microduck; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-tug-cup-nov17-v1 | Este modelo | no disponible | no aplica | 105/128 vs. líder fijado; 133/140 vs. 35 controladores | no disponible | Hugging Face, 0 descargas |
| jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7 | Modelo base | no disponible | no aplica | 68/128 en las mismas semillas | no disponible | Hugging Face (upstream) |
| juicenv | Contraconocido | no disponible | no aplica | 4/4 victorias contra este adaptador | no disponible | No detallado |
| anhalu | Entrada privada | no disponible | no aplica | No evaluada (no disponible) | no disponible | Privada |

No se dispone de datos suficientes para comparar con alternativas fuera del ecosistema Microduck.

## Limitaciones y advertencias

- Los resultados son pruebas locales sobre oponentes y semillas concretos; no constituyen una garantía ni un resultado oficial de torneo. El resultado oficial del torneo es la autoridad.
- Solo simulación: no se ha modificado evaluador, física, árbitro ni servidor, y no se documenta validez en hardware físico.
- Derrota documentada en los cuatro combates contra juicenv, un contraconocido conocido; la entrada privada anhalu no pudo evaluarse.
- La model card no reclama licencia sobre contribuciones upstream sin licencia; la licencia del repositorio figura como no disponible, lo que impide confirmar condiciones de uso comercial.
- No se publican arquitectura, parámetros, contexto ni idiomas; cualquier estimación de recursos es imposible con los datos disponibles.
- Riesgo de sobreajuste a los oponentes y semillas de validación: las cifras de 105/128 y 133/140 no implican generalización a oponentes no vistos.
- El repositorio tiene 0 descargas y 0 likes, sin señales de adopción comunitaria ni mantenimiento más allá de la creación y actualización del 2026-11-17.
- No aplican sesgos lingüísticos ni de alucinación de lenguaje por no ser un modelo de lenguaje, pero tampoco se documentan análisis de sesgo de política de control.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v1
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7
- Revisión concreta del modelo base citada en la model card: https://huggingface.co/jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7/tree/aef14166ddd2186bcd79e74919f83d54c6740e1a
- Pollen Robotics (Microduck y Arena): no se proporciona URL en la información disponible
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada
