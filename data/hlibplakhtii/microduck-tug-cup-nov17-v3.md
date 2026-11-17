# HlibPlakhtii/microduck-tug-cup-nov17-v3

## Resumen

microduck-tug-cup-nov17-v3 es una política de control para robótica (pipeline `robotics`) publicada por HlibPlakhtii en Hugging Face, orientada a la competición de tirar de la taza (tug-of-cup) del simulador Microduck de Pollen Robotics. No es un modelo de lenguaje: es un controlador exportado a ONNX que genera acciones motoras a partir de observaciones del simulador. El artefacto deriva de un *merge* de dos políticas previas del mismo autor (`microduck-tug-cup-nov17-v1` y `microduck-tug-cup-v5`) y se distribuye con la librería `microduck`.

La contribución declarada del autor no es el entrenamiento de la red —que se atribuye a los autores upstream— sino la construcción de un adaptador de controlador y la integración de una capa de *rating* para reproducir combates concretos. El modelo combina dos expertos: un controlador genérico derivado de `lg21` (procedente de cup-nov17-v1) y un controlador alternativo derivado de Titan (procedente de cup-v5), mezclados de forma continua y sin estado mediante una combinación convexa basada en velocidad angular, velocidad articular y gravedad proyectada.

El interés del artefacto es acotado pero técnicamente específico: documenta con trazabilidad un proceso de *gating* entre dos políticas en un entorno de simulación competitivo, con réplicas exactas de combates y comparaciones pareadas por semilla. No hay datos de arquitectura de red, parámetros ni contexto porque el objeto no es un transformer lingüístico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de control exportada a ONNX; red heredada de los modelos base) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada: observaciones del simulador) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible (el autor declara explícitamente que no reclama licencia sobre contribuciones upstream sin licencia) |
| Formato de pesos | ONNX (tag `onnx`); repositorio de 0.0 GB |

## Arquitectura y entrenamiento

La política se compone de dos controladores expertos heredados. El experto primario es el controlador genérico derivado de `lg21`, procedente de `cup-nov17-v1`; el alternativo es el controlador derivado de Titan, procedente de `cup-v5`. La selección entre ambos se realiza mediante una mezcla convexa continua y *stateless* calculada a partir de la velocidad angular, la velocidad articular y la gravedad proyectada, sin emplear identidad del oponente ni información oculta del simulador. El autor indica que no entrenó la red heredada y que el entrenamiento y las adaptaciones previas corresponden a los autores upstream.

El artefacto añade además una capa de *rating* documentada en `RATING_BASE_CARD.md` y `RATING_NOTICE`, que permite reproducir exactamente cinco combates de la fuente atribuida. Según la model card, el *overlay* de rating reproduce también el nuevo controlador genérico en 16 combates de paridad independientes, y la mezcla exportada coincide exactamente con su prototipo en Python sobre 1.166 sondas de observación. No se modificaron pesos de red, física, árbitro ni servidor.

## Capacidades

- Generación de acciones de control motor para el entorno de simulación Microduck (tug-of-cup).
- Mezcla adaptativa entre dos políticas expertas según el estado dinámico (velocidad angular, velocidad articular, gravedad proyectada).
- Reproducción determinista de combates concretos mediante la capa de rating (cinco *replays* exactos).
- Paridad verificada entre la implementación Python y el artefacto ONNX exportado (1.166 sondas).
- Evaluación contra oponentes y semillas no vistos mediante el controlador genérico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en políticas de control para robótica simulada: el artefacto sirve como referencia reproducible de una política ONNX para el entorno Microduck, con procedencia y avisos preservados.
- Experimentación con *gating* entre expertos: la mezcla convexa *stateless* documentada permite estudiar cómo combinar dos políticas sin introducir estado ni información privilegiada.
- Reproducción de combates y auditoría de resultados: la capa de rating permite replicar exactamente cinco combates de la fuente atribuida, útil para verificar evaluaciones.
- Evaluación comparativa por semilla: los resultados pareados (mismas semillas y lados) permiten medir el efecto del *gating* frente a la versión anterior en condiciones controladas.
- Base para pruebas de regresión en pipelines de simulación: la paridad ONNX/Python sobre 1.166 sondas facilita detectar desviaciones al reexportar o integrar el modelo.
- Docencia y divulgación sobre competiciones de robótica simulada: el repositorio incluye recibos de test y comparaciones transparentes en `cup-validation/`.

## Benchmarks y rendimiento

Resultados declarados en la model card (no son benchmarks estándar de ML, sino resultados de simulación):

| Métrica | Valor |
|---|---|
| Rating de referencia (5 réplicas exactas) | 168,89963030815125 cm |
| Victorias en *pit* (5 réplicas) | 5 |
| Combates de paridad del *overlay* (controlador genérico) | 16/16 reproducidos exactamente |
| Sondas de observación (paridad ONNX vs. Python) | 1.166/1.166 |

Comparaciones completas por oponente, mismas semillas y lados:

| Oponente | cup-nov17-v2 previo | Nuevos expertos con *gating* |
|---|---:|---:|
| Controlador actual de jrubiosainz | 55/64 | 53/64 |
| juicenv tug-anchor1 | 5/32 | 31/32 |

*Screen* de campo público (dos combates por rival, 34 rivales): 67/68 victorias; incluyendo dos combates de control contra el propio controlador publicado (ambos perdidos), 67/70. El autor advierte que estas muestras no prueban una victoria real en la Cup y que el resultado oficial del torneo es la referencia autoritativa.

## Requisitos de hardware

- VRAM estimada: no disponible (no se publican parámetros ni tamaño de la red).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el artefacto se distribuye en ONNX, por lo que puede ejecutarse con ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Relación | Licencia | Disponibilidad |
|---|---|---|---|---|
| microduck-tug-cup-nov17-v3 | Política ONNX (merge con gating) | Este artefacto | No disponible | Hugging Face |
| HlibPlakhtii/microduck-tug-cup-nov17-v2 | Política previa | Versión anterior; 55/64 vs. jrubiosainz y 5/32 vs. juicenv tug-anchor1 | No disponible | Hugging Face |
| HlibPlakhtii/microduck-tug-cup-nov17-v1 | Política base (experto lg21) | Modelo base del merge | No disponible | Hugging Face |
| HlibPlakhtii/microduck-tug-cup-v5 | Política base (experto Titan) | Modelo base del merge | No disponible | Hugging Face |

No se dispone de datos de parámetros, contexto ni benchmarks estándar para una comparación cuantitativa más amplia.

## Limitaciones y advertencias

- Solo simulación: el autor declara explícitamente que no se modificó evaluador, física, árbitro ni servidor, y que los resultados locales no constituyen una afirmación de victoria en la Cup.
- Los resultados dependen de oponentes y semillas concretos; el *screen* de campo público no es evidencia de rendimiento general.
- Regresión observada: el *gating* mejora mucho contra `juicenv tug-anchor1` (5/32 → 31/32) pero empeora ligeramente contra el controlador de `jrubiosainz` (55/64 → 53/64).
- Dos combates de control contra el propio controlador publicado resultaron en derrota y se conservan en los resultados agregados.
- La entrada privada `anhalu` no pudo descargarse, por lo que la cobertura del campo evaluado es incompleta.
- Licencia no disponible: el autor no reclama licencia sobre contribuciones upstream sin licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución.
- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval, GSM8K ni métricas similares.
- No se documentan sesgos, riesgo de alucinación ni cobertura idiomática porque no aplican al tipo de artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v3
- Modelo base cup-nov17-v1: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v1/tree/897f43d184c26277073d985771a09f66e7f93ec1
- Modelo base cup-v5: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-v5
- Modelo previo cup-nov17-v2: no disponible como enlace directo en la información proporcionada
- Pollen Robotics (Microduck y Arena): no disponible como enlace directo en la información proporcionada
