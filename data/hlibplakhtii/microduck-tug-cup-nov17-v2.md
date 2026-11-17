# HlibPlakhtii/microduck-tug-cup-nov17-v2

## Resumen

microduck-tug-cup-nov17-v2 es un adaptador de control para robótica publicado por HlibPlakhtii en Hugging Face, derivado por fine-tuning del modelo jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7. Se distribuye dentro del ecosistema Microduck, un entorno de simulación de competición robótica asociado a Pollen Robotics, y está etiquetado como política de control (microduck-policy) con pesos en formato ONNX. No se trata de un modelo de lenguaje: es una política de control entrenada para resolver tareas de manipulación en simulación, en concreto variantes de la tarea "tug cup".

El autor declara explícitamente que no ha entrenado la red heredada: el entrenamiento y las adaptaciones previas se atribuyen a los autores upstream, mientras que su contribución se centra en un adaptador de controlador, la integración de repeticiones de rating y la validación. El paquete incluye artefactos de reproducción, mutaciones de semilla y verificación de combates, lo que lo convierte en un caso de estudio de trazabilidad y procedencia más que en un modelo de propósito general.

La relevancia es acotada: se trata de un artefacto de competición en simulación, con métricas expresadas en centímetros de avance y victorias en bouts, no en benchmarks de NLP. Cualquier evaluación debe entenderse en ese marco y no como evidencia de rendimiento fuera de los entornos y semillas probados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal de política para control robótico (detalles no disponibles); empaquetada con adaptador de controlador descrito en adapter-config.json |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; pesos en ONNX |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible; el autor indica que no se arroga licencia sobre contribuciones upstream sin licencia |
| Formato de pesos | ONNX |
| Modelo base | jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7 (finetune) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (capas, dimensión de observación, espacio de acciones ni función de pérdida). Lo que sí se documenta es el proceso de adaptación: el autor parte del modelo base jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7 y aplica una mutación de bloque sobre la semilla 4 que modifica las filas 57–58 en las articulaciones 0, 3, 10 y 12, tras una normalización que preserva exactamente la fuerza. Las otras cuatro posiciones de inicio se heredan sin cambios del modelo upstream.

El entrenamiento de la red heredada se atribuye íntegramente a los autores upstream, con créditos a Pollen Robotics por Microduck y Arena. No se documentan número de tokens, composición del dataset ni uso de RLHF/DPO, lo que es coherente con un artefacto de control robótico en simulación y no con un modelo generativo. La innovación destacable no es arquitectónica sino metodológica: el paquete incluye artefactos de reproducción completos (source.json, RATING_BASE_CARD.md, RATING_NOTICE, rating-search/, cup-validation/) que permiten verificar cada combate y cada cambio de objetivo.

## Capacidades

- Control robótico en simulación para la tarea "tug cup" dentro del entorno Microduck/Arena.
- Ejecución de políticas de control empaquetadas en ONNX, consumibles por la librería microduck.
- Reproducción determinista de combates: los cinco bouts de referencia reproducen ambos ducks y la cuerda exactamente.
- Adaptación mediante mutación de semilla con preservación exacta de fuerza en las articulaciones modificadas.
- Validación contra oponentes y semillas: 16 bouts independientes de estilo Cup reproducen el controlador general tras aplicar el overlay.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en robótica de competición simulada: usar el paquete como referencia reproducible para estudiar cómo una mutación localizada en la semilla 4 afecta al rendimiento en la tarea tug cup, con artefactos que permiten repetir cada bout.
- Auditoría de procedencia de modelos: el repositorio separa explícitamente la red heredada del adaptador propio y documenta créditos, lo que sirve como plantilla para publicar derivados de modelos sin licencia clara.
- Evaluación de controladores en entornos con oponentes desconocidos: el controlador general, idéntico a cup-nov17-v1, se probó contra 35 controladores públicos de campo con 133 victorias en 140 combates, un escenario realista de generalización.
- Reproducción de resultados de torneo: los artefactos de rating-search/ permiten reconstruir la búsqueda que llevó a la mejora de rating de 168.89885067939758 cm a 168.89963030815125 cm frente al líder observado.
- Docencia en simulación robótica: el paquete ilustra el ciclo completo de herencia de modelo, mutación de semilla, validación contra líder y contra campo, y verificación exacta de bouts.
- Integración en pipelines de la librería microduck: los pesos ONNX y adapter-config.json permiten cargar el controlador en el entorno Arena para experimentos controlados con semillas fijas.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Rating de referencia (5 repeticiones exactas) | 168.89963030815 cm y cinco victorias de pit | Replays del origen atribuido en source.json |
| Rating de referencia de esta versión | 168.89963030815125 cm | Frente a 168.89885067939758 cm del líder observado |
| Controlador general vs líder de rating fijado | 105/128 combates completos ganados | Pruebas locales independientes |
| Controlador general vs 35 controladores públicos de campo | 133/140 combates ganados | Pruebas locales independientes |
| Controlador general vs juicenv | 0/4 combates de campo ganados | Pruebas locales independientes |
| Verificación de bouts | 5 bouts de referencia y 16 bouts genéricos vs overlay reproducidos exactamente | Verificación del paquete |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que las pruebas locales son evidencia sobre los oponentes y semillas probados, no una afirmación de victoria en la Cup, y que el resultado oficial del torneo es la referencia autoritativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB y no se publican dimensiones de la red.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ser una política de control en simulación, es plausible que el cuello de botella sea la física del entorno y no la inferencia, pero no se confirma en la información.
- Opciones de despliegue: librería microduck con pesos ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HlibPlakhtii/microduck-tug-cup-nov17-v2 | política de control robótico (ONNX) | no disponible | no aplica | rating 168.89963030815125 cm; 105/128 vs líder fijado | no disponible | Hugging Face |
| jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7 | política de control robótico (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| cup-nov17-v1 | política de control robótico (versión previa del mismo autor) | no disponible | no aplica | controlador general idéntico; 105/128 y 133/140 | no disponible | Hugging Face |
| juicenv | controlador de campo | no disponible | no aplica | 4/4 victorias frente al controlador general de este paquete | no disponible | no disponible |

## Limitaciones y advertencias

- El autor no ha entrenado la red heredada; la calidad del modelo depende del trabajo upstream y de sus condiciones de publicación.
- No se arroga licencia sobre contribuciones upstream sin licencia: el uso comercial queda en un limbo legal que conviene resolver antes de cualquier despliegue.
- Las métricas son de simulación y de una tarea concreta (tug cup); no extrapolan a otros entornos, robots físicos ni tareas de manipulación general.
- El rendimiento se midió contra oponentes y semillas concretos; el propio autor advierte que las pruebas locales no demuestran victoria en la Cup y que el resultado oficial del torneo es el autoritativo.
- El controlador general perdió 4 de 4 combates de campo contra juicenv, lo que indica una debilidad clara frente a ese oponente.
- La mejora de rating es marginal (del orden de 8·10⁻⁴ cm) y procede de una mutación localizada en cuatro articulaciones; no hay evidencia de que generalice más allá de las repeticiones verificadas.
- No se documentan sesgos, alucinaciones ni limitaciones idiomáticas porque el artefacto no es un modelo de lenguaje; esos riesgos no aplican en su forma habitual.
- No hay información sobre arquitectura, parámetros ni requisitos de hardware, lo que dificulta estimar costes de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v2
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7
- Revisión del modelo base citada en la model card: https://huggingface.co/jrubiosainz/microduck-tug-cup2p2-s4-a74f9bd7/tree/aef14166ddd2186bcd79e74919f83d54c6740e1a
- Pollen Robotics (Microduck y Arena): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
