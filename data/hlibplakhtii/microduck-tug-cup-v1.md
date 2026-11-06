# HlibPlakhtii/microduck-tug-cup-v1

## Resumen

microduck-tug-cup-v1 es un modelo de politica para robotica (pipeline `robotics`) publicado en Hugging Face por el usuario HlibPlakhtii. No es un modelo de lenguaje: se trata de un controlador derivado por fine-tuning de `azukiq/microduck-titan-v1`, una red de self-play entrenada por azukiq para el entorno de simulacion Microduck Arena de Pollen Robotics. El autor declara explicitamente que no ha entrenado la red heredada, sino que ha construido un adaptador de controlador y ha integrado y validado repeticiones de rating.

El modelo se presenta como una entrada de simulacion centrada en la tarea de "tug cup" (competicion de arrastre de objetos tipo Microduck). El artefacto evaluado es un adaptador descrito en `adapter-config.json`, y los pesos se distribuyen en formato ONNX. El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, lo que indica una publicacion muy reciente y sin traccion comunitaria.

Su relevancia es acotada: sirve como ejemplo de pipeline de fine-tuning y validacion reproducible de politicas de control en simulacion robotica, con verificacion exacta de repeticiones y fuentes fijadas (pinned sources). No aporta capacidades de generacion de texto, razonamiento ni vision, y no debe confundirse con un modelo fundacional de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de politica para control en simulacion; pesos en ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica a un controlador de robotica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible (el autor afirma no reclamar licencia sobre contribuciones upstream sin licencia) |
| Formato de pesos | ONNX |
| Modelo base | azukiq/microduck-titan-v1 (relacion: finetune) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red. Se sabe que el modelo base `azukiq/microduck-titan-v1` es una red de self-play entrenada por azukiq, y que microduck-tug-cup-v1 es un fine-tuning de esa red orientado a la tarea de "tug cup". El autor no ha entrenado la red heredada: su contribucion es el adaptador de controlador descrito en `adapter-config.json`, junto con la integracion de repeticiones de rating y su validacion.

El proceso de validacion reportado incluye cinco repeticiones exactas de rating procedentes de `HlibPlakhtii/microduck-tug-quicksilver-v16`, que preservan un rating de **167.46412158012 cm** y cinco victorias en "pit". Estas repeticiones son independientes del controlador general usado contra oponentes no familiares y semillas de Cup. El autor afirma que las cinco contiendas reproducen ambos ducks y la cuerda de forma exacta, y que ocho contiendas adicionales de estilo Cup reproducen el controlador general exactamente tras la superposicion (overlay). No se modifico evaluador, fisica, arbitro ni servidor. Todo el trabajo es en simulacion.

## Capacidades

- Control de politica en simulacion robotica para el entorno Microduck Arena (tarea "tug cup").
- Reproduccion exacta de repeticiones de rating y de contiendas de estilo Cup tras aplicar el overlay del adaptador.
- Integracion con el controlador general heredado del modelo base para enfrentarse a oponentes no familiares y semillas de Cup.
- Distribucion en formato ONNX, apta para inferencia en runtimes compatibles con ONNX.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso en el sentido de los LLM.
- No se declaran capacidades multilingues (no aplica).

## Casos de uso

- Validacion reproducible de politicas de control: el modelo permite reproducir exactamente las contiendas registradas (cinco repeticiones de rating y ocho contiendas de estilo Cup) para auditar que el adaptador no altera el comportamiento del controlador heredado. Es adecuado porque el autor documenta verificacion exacta y fuentes fijadas.
- Investigacion en self-play y fine-tuning de controladores: sirve como caso de estudio de como un adaptador sobre una red de self-play preentrenada puede preservar el rating original (167.46412158012 cm) sin reentrenar la red base.
- Benchmarking de entornos de simulacion robotica: util para comparar el comportamiento del controlador general frente a oponentes no familiares y semillas de Cup, usando las contiendas de estilo Cup como referencia.
- Integracion en pipelines ONNX: al distribuirse en ONNX, puede cargarse en runtimes de inferencia compatibles para ejecutar el controlador en simulacion dentro de un pipeline automatizado de pruebas.
- Reproduccion de resultados en publicaciones: las fuentes fijadas y la verificacion detallada permiten a terceros reproducir los resultados reportados y contrastarlos con el resultado oficial del torneo.
- Docencia en robotica y simulacion: como ejemplo acotado de politica de control con artefactos de configuracion (`adapter-config.json`) y avisos de rating (`RATING_NOTICE`), resulta util para explicar el flujo completo de publicacion y validacion de un controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K, etc.), ya que no es un modelo de lenguaje. El unico dato de rendimiento reportado es el rating de las repeticiones:

| Metrica | Valor |
|---|---|
| Rating preservado (repeticiones exactas) | 167.46412158012 cm |
| Victorias en "pit" | 5 |
| Repeticiones de rating exactas | 5 |
| Contiendas de estilo Cup reproducidas tras overlay | 8 |

El autor advierte que las pruebas locales son evidencia sobre los oponentes y semillas probados, no una afirmacion de victoria en la Cup; el resultado oficial del torneo es la referencia autoritativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0.0 GB y no se publican especificaciones de computo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ser un controlador en ONNX de un entorno de simulacion, el requisito real depende del motor de simulacion, no del modelo.
- Opciones de despliegue: runtime compatible con ONNX y la libreria `microduck`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-cup-v1 | Politica de control (ONNX) | no disponible | no aplica | no disponible | Hugging Face |
| azukiq/microduck-titan-v1 | Red de self-play (modelo base) | no disponible | no aplica | no disponible | Hugging Face |
| HlibPlakhtii/microduck-tug-quicksilver-v16 | Politica de control (origen de repeticiones) | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo opera exclusivamente en simulacion; no se ha validado en hardware fisico ni en el torneo oficial.
- Las pruebas locales son evidencia sobre los oponentes y semillas probados, no una garantia de victoria en la Cup; el resultado oficial del torneo prevalece.
- El autor no reclama licencia sobre contribuciones upstream sin licencia, por lo que el estatus legal para uso comercial es incierto y no disponible.
- No se declaran sesgos, riesgos de alucinacion ni limitaciones de idioma porque no es un modelo de lenguaje; estos criterios no aplican.
- La red heredada no fue entrenada por el autor de esta ficha; su model card y manifiesto se preservan, pero el comportamiento fuera de los escenarios validados no esta garantizado.
- El repositorio presenta cero descargas y cero likes, sin traccion comunitaria ni validacion externa independiente.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-v1
- Modelo base: https://huggingface.co/azukiq/microduck-titan-v1/tree/13b975bb1a15fbdb4d6bf78170220a91a99aa7a5
- Repeticiones de rating de origen: https://huggingface.co/HlibPlakhtii/microduck-tug-quicksilver-v16
- Perfil del autor: https://huggingface.co/HlibPlakhtii
- Modelos del autor: https://huggingface.co/HlibPlakhtii/models
