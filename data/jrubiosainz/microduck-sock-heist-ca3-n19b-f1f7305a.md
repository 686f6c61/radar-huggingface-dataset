# jrubiosainz/microduck-sock-heist-ca3-n19b-f1f7305a

## Resumen

microduck-sock-heist-ca3-n19b es una política de control para robótica (robotics policy) empaquetada como un único fichero ONNX de 1.210.624 bytes (aproximadamente 1,2 MB). Lo publica el usuario jrubiosainz en Hugging Face y deriva de una versión modificada de `policy.onnx` cuyo fichero base es `rumezhak/microduck-sock-heist-composite-v13` (commit `cd21c3fd`). No es un modelo de lenguaje: es un artefacto de inferencia para el entorno de simulación Microduck Arena 6 m Sock Heist, con pipeline declarado `robotics` y etiqueta `microduck-policy`.

La modificación consiste en reescribir, en las tablas `L_obs` y `L_act`, únicamente las filas correspondientes a las semillas 1 y 5, y solo a partir de la primera llamada de control alterada. Las nuevas acciones provienen de una búsqueda CMA-ES separable sobre los últimos pasos de control de la trayectoria de la propia semilla base, ejecutada en el runner oficial microduck-arena 0.7.0 sobre x86-64. Las claves de búsqueda son las observaciones registradas al reproducir esas acciones en dicho runner; el resto de filas, el grafo, la red de fallback, `L_mask` y `L_tol` quedan idénticos al fichero base.

Es relevante ahora porque ejemplifica un patrón de publicación muy específico: políticas de competición de tamaño mínimo, con trazabilidad de procedencia explícita (cadena de avisos y hashes), pensadas para ser evaluadas en un runner determinista. Su utilidad práctica está acotada al entorno Microduck y a la versión 0.7.0 del runner.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (fichero ONNX con grafo, red de fallback y tablas de lookup `L_obs`/`L_act`; no se detalla la topología interna) |
| Parametros totales | No disponible (el fichero pesa 1.210.624 bytes; no se publica el recuento de parámetros) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera por paso de control sobre observaciones del entorno) |
| Tipos de cuantizacion | No disponible (el autor indica "mean quantized finish 4.758 s", sin especificar el esquema de cuantización) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | Apache-2.0 solo para las partes que la portan (disposición de grafo y mecanismo de lookup de a1rb4Ck y modificaciones propias de los contribuidores); las partes de entradas sin licencia declarada (rumezhak, HlibPlakhtii, lphatnguyen y otros) no se relicencian |
| Formato de pesos | ONNX (fichero único `policy.onnx`, sha256 `f1f7305abc872d1b387fea3a4a29e4de5c5dffb43785d65175243545d80feed1`) |

## Arquitectura y entrenamiento

El artefacto es un grafo ONNX con, al menos, una red de fallback, una tabla de observaciones (`L_obs`), una tabla de acciones (`L_act`), una máscara (`L_mask`) y una tolerancia (`L_tol`). El mecanismo de decisión combina una búsqueda por lookup sobre observaciones registradas con una red de fallback para los casos no cubiertos. La disposición del grafo y el mecanismo de lookup proceden de a1rb4Ck (`microduck-heist@94cd2cfe`, Apache-2.0); las trayectorias y el mecanismo base proceden de rumezhak (composite v10-v13), con origen de semillas en lphatnguyen (semillas 1-4) y HlibPlakhtii (semilla 5).

El "entrenamiento" de esta variante no es un entrenamiento de red neuronal: es una optimización de acciones. Concretamente, se aplicó CMA-ES separable sobre los últimos pasos de control de la trayectoria de la semilla base, evaluando en el runner oficial microduck-arena 0.7.0 (x86-64). Las claves de lookup se obtuvieron reejecutando las acciones resultantes en ese mismo runner. Solo se reescribieron las filas de las semillas 1 y 5 desde la primera llamada de control modificada; el resto del fichero base permanece byte a byte. No se documentan datos de entrenamiento en el sentido habitual (tokens, composición de dataset, RLHF/DPO).

## Capacidades

- Generación de acciones de control en el entorno Microduck Arena 6 m Sock Heist, un paso de control por invocación.
- Lookup determinista sobre observaciones registradas, con red de fallback para observaciones no cubiertas.
- Ejecución sobre el runner oficial microduck-arena 0.7.0 en x86-64; los ticks por semilla declarados son [922, 1014, 930, 935, 957], con final cuantizado medio de 4,758 s.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo "thinking" ni de decodificación especulativa.

## Casos de uso

- Evaluación comparativa en la competición Microduck Arena: sirve para medir la puntuación por semilla frente al fichero base `composite-v13` (que marcaba 4,76 en el tablero a 2026-11-18T22:51Z) usando el runner 0.7.0 en x86-64.
- Reproducción de resultados: al conservar el grafo, la red de fallback, `L_mask` y `L_tol` del base y documentar hashes y cadena de avisos, permite reproducir la evaluación y auditar qué filas cambiaron.
- Estudio de optimización de políticas por búsqueda directa: el artefacto documenta un caso concreto de CMA-ES separable aplicado a los últimos pasos de control de una trayectoria existente, útil como referencia metodológica.
- Análisis de procedencia y licencias en artefactos derivados: la cadena de avisos verbatim y la sección 4(b) de Apache-2.0 quedan registradas en `metadata_props[modification_notice]`, lo que lo convierte en un ejemplo para estudiar cómo declarar modificaciones sobre políticas de terceros.
- Integración en pipelines de inferencia ONNX: al ser un fichero único de 1,2 MB, se puede cargar con un runtime ONNX estándar en un entorno de simulación o en un banco de pruebas de robótica.
- Docencia y pruebas de robustez de runners: útil para verificar que un runner determinista reproduce los ticks declarados por semilla y para detectar dependencias de plataforma (el autor solo reporta x86-64).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento declarado es específico del entorno Microduck Arena 6 m Sock Heist:

| Metrica | Valor |
|---|---|
| Ticks por semilla (runner oficial 0.7.0, x86-64) | 922, 1014, 930, 935, 957 |
| Final cuantizado medio | 4,758 s |
| Puntuación del fichero base en el tablero | 4,76 (a 2026-11-18T22:51Z) |
| Tamano del fichero | 1.210.624 bytes |

## Requisitos de hardware

- VRAM estimada: no disponible; el fichero ONNX ocupa 1,2 MB, por lo que la carga en memoria es marginal y el cuello de botella es el runner de simulación, no el modelo.
- GPU recomendadas: no disponibles; el autor solo reporta ejecución en el runner oficial sobre x86-64, sin especificar aceleración por GPU.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, pero no está confirmado en la información disponible.
- Opciones de despliegue: runtime ONNX estándar (por ejemplo, ONNX Runtime) integrado en el runner microduck-arena 0.7.0; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; solo se publican ticks por semilla y el tiempo de final cuantizado medio (4,758 s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-ca3-n19b (este) | No disponible (1,2 MB ONNX) | No aplica | Ticks [922, 1014, 930, 935, 957]; final cuantizado medio 4,758 s | Apache-2.0 parcial, con partes sin relicenciar | Hugging Face, 0 descargas, 0 likes |
| rumezhak/microduck-sock-heist-composite-v13 | No disponible | No aplica | 4,76 en el tablero a 2026-11-18T22:51Z | Sin licencia declarada | Hugging Face (base de este fichero) |
| lphatnguyen/microduck-sock-heist-6m-v5 | No disponible | No aplica | No disponible | Sin licencia declarada | Hugging Face (origen de semillas 1-4) |
| HlibPlakhtii/microduck-sock-heist-nov17-v3 | No disponible | No aplica | No disponible | Sin licencia declarada | Hugging Face (origen de semilla 5) |

## Limitaciones y advertencias

- Ámbito muy restringido: la política solo tiene sentido dentro del entorno Microduck Arena 6 m Sock Heist y, según lo declarado, sobre el runner oficial 0.7.0 en x86-64; no se garantiza comportamiento en otras versiones o plataformas.
- Licencia fragmentada: Apache-2.0 cubre solo las partes que la portan; las contribuciones de rumezhak, HlibPlakhtii, lphatnguyen y otros no se relicencian, lo que complica el uso comercial sin revisión jurídica caso por caso.
- Procedencia parcialmente opaca: el fichero base y varias entradas de la cadena no declaran licencia, y no se publica la topología de la red de fallback ni el recuento de parámetros.
- Riesgo de sobreajuste al runner: las claves de lookup son observaciones registradas al reproducir acciones en un runner concreto; cualquier cambio de versión, plataforma o determinismo puede invalidar las filas reescritas.
- Sin datos de sesgo, alucinación o idioma aplicables: no es un modelo generativo de lenguaje, por lo que esas categorías de riesgo no se evalúan en la información disponible.
- Madurez nula como artefacto comunitario: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-19, sin documentación adicional sobre metodología o hiperparámetros de CMA-ES.
- El autor no publica comparación contra el base con el mismo vector de puntuación por semilla, solo el resultado agregado del base en el tablero.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-ca3-n19b-f1f7305a
- Fichero base citado: rumezhak/microduck-sock-heist-composite-v13@cd21c3fd2571c88f578c926e5a255709808fd128 (sha256 c2eb1dd1783e4aa0512dde5e416024e8a6fa0f17ed8cc0a863a841d562fbe336)
- Origen del mecanismo de grafo y lookup: a1rb4Ck/microduck-heist@94cd2cfeb57a4ece561a3d320e233f442238cb81 (Apache-2.0)
- Origen de semillas 1-4: lphatnguyen/microduck-sock-heist-6m-v5
- Origen de semilla 5: HlibPlakhtii/microduck-sock-heist-nov17-v3
- Runner de evaluación: microduck-arena 0.7.0 (x86-64), sin URL publicada en la información disponible
- Paper, blog, repositorio o demo adicionales: no disponibles
