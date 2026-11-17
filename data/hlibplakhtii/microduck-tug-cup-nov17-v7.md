# HlibPlakhtii/microduck-tug-cup-nov17-v7

## Resumen

microduck-tug-cup-nov17-v7 es un checkpoint de política robótica publicado por HlibPlakhtii, derivado por fine-tuning de HlibPlakhtii/microduck-tug-cup-nov17-v1. Se distribuye en formato ONNX y está etiquetado como `microduck-policy` dentro del ecosistema Microduck/Arena de Pollen Robotics. No es un modelo de lenguaje: es un controlador para simulación robótica orientado a la tarea de "tug cup" (arrastre de un objeto tipo copa con dos patos y una cuerda), entrenado para entornos de competición simulados.

El autor declara explícitamente que no ha entrenado la red heredada: el entrenamiento y las adaptaciones previas se atribuyen a los autores upstream. El trabajo de esta versión se centra en la integración de repeticiones de rating (replays de observación exacta) y en un refinamiento acotado por búsqueda de coordenadas sobre una semilla concreta (seed 5), junto con un adaptador de controlador descrito en `adapter-config.json`.

La relevancia es acotada: se trata de un artefacto de investigación en robótica simulada, con métrica principal en centímetros de arrastre (168,90317797661 cm en cinco replays exactos) y victorias en "pit". No hay información sobre parámetros, contexto, idiomas ni licencia, y el propio autor advierte que los resultados locales no equivalen a ganar la competición oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política robótica, sin detalle de capas ni tipo de red en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de simulación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que no se reclama licencia sobre contribuciones upstream sin licencia) |
| Formato de pesos | ONNX |
| Libreria | microduck |
| Pipeline | robotics |
| Modelo base | HlibPlakhtii/microduck-tug-cup-nov17-v1 (relación: finetune) |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |
| Entorno de ejecución | simulación (Arena / Microduck, Pollen Robotics) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna de la red (tipo de transformer, CNN, MLP u otra), el número de parámetros ni la composición del dataset de entrenamiento. La model card indica que la red heredada no fue entrenada por el autor de esta versión y que el entrenamiento original corresponde a los autores upstream citados en las model cards preservadas. El artefacto se distribuye como política ONNX para el runtime `microduck`.

El trabajo específico de v7 consiste en: (1) la integración de cinco replays de rating de observación exacta procedentes de la fuente atribuida, documentados en `RATING_BASE_CARD.md` y `RATING_NOTICE`; (2) un refinamiento de la semilla 5 mediante seis pasadas de búsqueda de coordenadas acotada, con normalización de objetivos equivalente en fuerza verificada contra ambos patos y la cuerda, pasando de 168,53521466255188 cm a 168,53529810905457 cm; y (3) la preservación de la trayectoria previa de la semilla 4. Los arrays de acciones por pasada, configuraciones y comprobaciones se conservan en `rating-search-series/`. El controlador genérico de Cup es byte-idéntico al de v6, con 16 comprobaciones de paridad de combate exactas tras el overlay de rating.

## Capacidades

- Control de política robótica en simulación para la tarea de arrastre de copa ("tug cup") con dos patos y una cuerda.
- Reproducción exacta de observaciones: cinco combates reproducen ambos patos y la cuerda de forma exacta según el autor.
- Paridad de controlador genérico: 16 combates independientes de estilo Cup reproducen exactamente el controlador general tras el overlay.
- Ejecución mediante ONNX en el runtime `microduck`.
- Integración de adaptador de controlador configurable vía `adapter-config.json`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes; el artefacto es una política de control, no un modelo generativo de propósito general.
- Capacidades multilingües: no aplica / no disponible.

## Casos de uso

- Evaluación de políticas en simulación de competición: usar el checkpoint ONNX en el entorno Arena/Microduck para reproducir los combates de rating documentados y verificar la métrica de 168,90317797661 cm en cinco replays exactos.
- Reproducibilidad de experimentos: los arrays de acciones, configuraciones y comprobaciones en `rating-search-series/` permiten auditar las seis pasadas de búsqueda de coordenadas sobre la semilla 5 y comparar resultados antes y después del refinamiento.
- Benchmark interno frente a oponentes conocidos: el controlador genérico, byte-idéntico a v6, conserva los resultados de 58/64 victorias completas contra jrubiosainz update3 y 31/32 contra juicenv, útiles como línea base en pruebas locales.
- Investigación en optimización de políticas: el método de búsqueda de coordenadas acotada con normalización de objetivos equivalente en fuerza sirve como referencia metodológica para refinar trayectorias en políticas heredadas sin reentrenar la red.
- Integración en pipelines de simulación automatizados: al ser ONNX y ejecutarse en el runtime `microduck`, puede cargarse en scripts de evaluación por lotes para medir robustez ante semillas y oponentes no vistos.
- Docencia y divulgación en robótica simulada: el artefacto y su documentación de procedencia permiten ilustrar flujos de fine-tuning, atribución de autoría y verificación de paridad de controladores en entornos de competición.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Distancia de rating (5 replays exactos) | 168,90317797661 cm | Fuente de rating atribuida; cinco victorias en pit |
| Media local de rating | 168,90317797660828 cm | Incluye trayectoria previa de semilla 4 |
| Semilla 5 antes del refinamiento | 168,53521466255188 cm | Punto de partida de las seis pasadas |
| Semilla 5 tras refinamiento | 168,53529810905457 cm | Seis pasadas de búsqueda de coordenadas acotada |
| Victorias completas vs jrubiosainz update3 | 58/64 | Benchmark heredado de v6, controlador sin cambios |
| Victorias completas vs juicenv | 31/32 | Benchmark heredado de v6, controlador sin cambios |
| Paridad de combates Cup | 16/16 exactos | Controlador genérico tras overlay de rating |

No se han publicado resultados de benchmarks estándar de ML (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni tamaño del modelo ONNX; el repositorio figura como 0.0 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime `microduck` con pesos ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica).
- Latencia y throughput: no disponibles.
- Entorno de ejecución: simulación Arena/Microduck de Pollen Robotics; el autor indica explícitamente "Simulation only".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-cup-nov17-v7 | no disponible | no aplica | 168,90317797661 cm en 5 replays; 58/64 y 31/32 en benchmarks heredados | no disponible | Hugging Face, ONNX |
| microduck-tug-cup-nov17-v1 (base) | no disponible | no aplica | no disponible en la información proporcionada | no disponible | Hugging Face |
| Otras políticas Microduck/Arena | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni licencia de las alternativas en la información proporcionada; la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El autor advierte que los tests locales son evidencia sobre oponentes y semillas probados, no una afirmación de victoria en la Cup; el resultado oficial del torneo es la referencia autoritativa.
- Resultados de rating obtenidos en cinco replays de observación exacta de una fuente atribuida; no constituyen una evaluación contra oponentes desconocidos ni semillas de Cup no vistas.
- Los benchmarks de 58/64 y 31/32 son resultados heredados de v6 sobre un controlador sin cambios, no combates independientes nuevos para v7.
- No se ha modificado evaluador, física, árbitro ni servidor; uso exclusivamente en simulación.
- Licencia no disponible; el autor no reclama licencia sobre contribuciones upstream sin licencia, lo que genera incertidumbre para uso comercial o redistribución.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de idioma porque el artefacto no es un modelo de lenguaje; estas categorías no aplican.
- El refinamiento de la semilla 5 es marginal en magnitud (del orden de 8·10⁻⁵ cm) y acotado a una semilla concreta; no debe extrapolarse a mejora general del controlador.
- Procedencia y atribución de autoría complejas (red heredada, adaptador propio, créditos a Pollen Robotics); conviene revisar `RATING_BASE_CARD.md`, `RATING_NOTICE` y `source.json` antes de reutilizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v7
- Modelo base (v1): https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v1
- Revisión concreta del modelo base citada en la model card: https://huggingface.co/HlibPlakhtii/microduck-tug-cup-nov17-v1/tree/897f43d184c26277073d985771a09f66e7f93ec1
- Pollen Robotics (Microduck y Arena): no se proporciona URL en la información disponible
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
