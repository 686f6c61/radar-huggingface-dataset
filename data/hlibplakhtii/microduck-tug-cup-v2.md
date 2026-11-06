# HlibPlakhtii/microduck-tug-cup-v2

## Resumen

microduck-tug-cup-v2 es un adaptador de política para robótica y simulación derivado por Hlib Plakhtii a partir de azukiq/microduck-titan-v1, una red de autoaprendizaje (self-play) entrenada por azukiq para el entorno Microduck Arena de Pollen Robotics. No se trata de un modelo de lenguaje: es un controlador exportado en ONNX que se usa como política de agente en combates simulados del juego de arrastre de patos ("tug"), con un adaptador de sesgo (bias adapter) descrito en `adapter-config.json`. El autor no ha entrenado la red heredada; su aportación es el adaptador, la integración de repeticiones de rating y la validación.

El modelo se publica con resultados locales detallados: cinco repeticiones exactas de observación procedentes de la fuente atribuida dan 167,50347733498 cm y cinco victorias por caída en el foso, mientras que el adaptador de sesgo seleccionado ganó 327 de 512 combates (63,9 %) contra titan-v1 sin modificar en semillas nuevas con lados emparejados. El controlador exportado ganó 457 de 464 partidas completas contra 29 oponentes públicos, con las siete derrotas concentradas contra titan-v1. El autor insiste en que son pruebas locales y que el resultado oficial del torneo es el único autoritativo.

La relevancia actual es acotada pero específica: sirve como ejemplo reproducible de fine-tuning ligero sobre una política de autoaprendizaje en un entorno de simulación física, con trazabilidad de fuentes fijadas (pinned sources), avisos de atribución y verificación de repeticiones. La ficha se limita a lo documentado en la model card; no hay información sobre arquitectura interna, parámetros ni contexto en el sentido de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de política de autoaprendizaje heredada de microduck-titan-v1; adaptador de sesgo sobre el controlador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones del entorno de simulación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; política de control robótico) |
| Licencia | no disponible (el autor declara no reclamar licencia sobre contribuciones upstream sin licencia) |
| Formato de pesos | ONNX (exportado); configuración del adaptador en `adapter-config.json` |

## Arquitectura y entrenamiento

La arquitectura interna de la red base no está documentada en la información disponible. Se sabe que microduck-titan-v1 es una red de autoaprendizaje (self-play) entrenada por azukiq para el entorno Microduck Arena, y que microduck-tug-cup-v2 es un fine-tuning sobre ella que añade un adaptador de sesgo seleccionado, descrito en `adapter-config.json`. El autor no entrenó la red heredada: preserva su model card y su manifiesto, y documenta las modificaciones en `RATING_BASE_CARD.md` y `RATING_NOTICE`.

El proceso de validación incluye repeticiones de rating con observación exacta procedentes de la fuente atribuida, verificadas de forma que reproducen ambos patos y la cuerda exactamente, además de 16 combates independientes de estilo Cup que reproducen el controlador general exactamente tras aplicar la superposición (overlay). Las fuentes están fijadas (pinned) y se incluye verificación detallada. El adaptador de sesgo seleccionado se evaluó en 512 combates con semillas nuevas y lados emparejados contra titan-v1 sin modificar.

## Capacidades

- Control de agente en simulación de arrastre de patos (tug) dentro de Microduck Arena.
- Ejecución de políticas exportadas en ONNX para inferencia en el simulador.
- Reproducción exacta de combates y repeticiones de rating a partir de fuentes fijadas.
- Generalización limitada a oponentes no vistos: 457/464 partidas completas contra 29 oponentes públicos.
- Compatibilidad con el controlador general en combates de estilo Cup tras aplicar el overlay.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Evaluación de políticas de autoaprendizaje en simulación: usar el modelo como controlador de referencia para comparar adaptadores de sesgo sobre titan-v1 en semillas emparejadas, aprovechando el protocolo de 512 combates documentado.
- Reproducción de resultados de torneo: las repeticiones de rating con observación exacta permiten verificar resultados de la fuente atribuida y auditar que no se han modificado evaluador, física, árbitro ni servidor.
- Investigación en robótica simulada: sirve como ejemplo de exportación ONNX de una política de control para el entorno Microduck Arena de Pollen Robotics, con trazabilidad de fuentes y avisos de atribución.
- Pruebas de regresión de controladores: los 16 combates independientes de estilo Cup que reproducen el controlador general exactamente tras el overlay se pueden usar como suite de verificación tras cambios en el adaptador.
- Benchmark local de oponentes: los 29 oponentes públicos y las 464 partidas completas permiten construir una línea base de comparación para nuevas variantes de política.
- Docencia y divulgación sobre fine-tuning ligero: el repositorio documenta el proceso de adaptación, atribución y verificación de una política heredada, útil como caso práctico de buenas prácticas de trazabilidad.

## Benchmarks y rendimiento

| Evaluación | Resultado | Condiciones |
|---|---|---|
| Repeticiones de rating (observación exacta) | 167,50347733498 cm y 5 victorias por foso | 5 repeticiones de la fuente atribuida |
| Adaptador de sesgo seleccionado vs titan-v1 | 327/512 victorias (63,9 %) | Semillas nuevas, lados emparejados |
| titan-v1 sin modificar vs adaptador | 256/512 | Mismas semillas |
| Controlador exportado vs oponentes públicos | 457/464 partidas completas ganadas | 29 oponentes, 16 partidas cada uno |
| Derrotas del controlador exportado | 7, todas contra titan-v1 | Mismo conjunto de 464 partidas |
| Reproducción de combates Cup | 16/16 reproducen el controlador general exactamente | Tras aplicar el overlay |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo. El autor subraya que estas cifras son pruebas locales y que el resultado oficial del torneo es el autoritativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repositorio es de 0.0 GB y no se documentan parámetros ni pesos cuantizados).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exportación ONNX para su ejecución en el simulador Microduck Arena; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-cup-v2 | no disponible | no aplica | 327/512 vs titan-v1; 457/464 vs 29 oponentes públicos | no disponible | Hugging Face (HlibPlakhtii) |
| azukiq/microduck-titan-v1 | no disponible | no aplica | 256/512 vs el adaptador en semillas emparejadas | no disponible | Hugging Face (azukiq) |
| Otros controladores de Microduck Arena | no disponible | no aplica | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos frente a titan-v1, el modelo base. No se conocen otras alternativas documentadas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política de autoaprendizaje, puede heredar sesgos de las trayectorias de entrenamiento de titan-v1.
- Riesgo de sobreajuste a oponentes y semillas: el propio autor advierte que las pruebas locales son evidencia sobre los oponentes y semillas probados, no una garantía de victoria en la Cup.
- Resultado oficial: el resultado del torneo oficial es el único autoritativo; las cifras locales no lo sustituyen.
- Licencia: no disponible; el autor declara explícitamente que no reclama licencia sobre contribuciones upstream sin licencia, lo que genera incertidumbre para uso comercial o redistribución.
- Ámbito de uso: exclusivamente simulación; no se ha validado en hardware físico ni fuera de Microduck Arena.
- Idiomas y contexto: no aplica; no es un modelo de lenguaje y no admite prompts, contexto textual ni instrucciones en lenguaje natural.
- Dependencia del entorno: requiere el simulador, el evaluador, la física y el árbitro originales; el autor confirma que no se modificó ninguno de ellos.
- Atribución: parte de los créditos corresponden a contribuyentes de trayectorias de rating heredadas (jrubiosainz, greecree y otros citados en RATING_NOTICE), lo que conviene revisar antes de reutilizar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-v2
- Modelo base: https://huggingface.co/azukiq/microduck-titan-v1/tree/13b975bb1a15fbdb4d6bf78170220a91a99aa7a5
- Perfil del autor en Hugging Face: https://huggingface.co/HlibPlakhtii
- Modelos del autor: https://huggingface.co/HlibPlakhtii/models
- Pollen Robotics (Microduck y Arena): no disponible en los resultados de búsqueda
- Paper, blog o demo adicionales: no disponible en los resultados de búsqueda
