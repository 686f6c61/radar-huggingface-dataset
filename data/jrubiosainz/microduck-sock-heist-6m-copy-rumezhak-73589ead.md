# jrubiosainz/microduck-sock-heist-6m-copy-rumezhak-73589ead

## Resumen

`jrubiosainz/microduck-sock-heist-6m-copy-rumezhak-73589ead` es una republicación byte a byte de la política `policy.onnx` entrenada por el usuario rumezhak para la competición Microduck Arena, en la prueba de 6 metros "Sock Heist". No es un modelo de lenguaje: es una política de control robótico en formato ONNX que genera comandos de locomoción para el robot cuadrúpedo microduck de Pollen Robotics (61 dimensiones de observación, 14 acciones, 50 Hz). El repositorio lo publica jrubiosainz sin ningún tipo de entrenamiento, ajuste o edición, únicamente para inscribir la misma política en la Arena bajo su propia cuenta.

El modelo subyacente es una red neuronal de aproximadamente 6 millones de parámetros (según la convención de nombres de la serie `microduck-sock-heist-6m`), derivada por ajuste fino de `lphatnguyen/microduck-sock-heist-6m-v3` y de `a1rb4Ck/microduck-heist`. La política es "perpetua": ejecuta una marcha continua hasta que se le indique lo contrario. Su relevancia es acotada: sirve como referencia reproducible de una entrada de competición con una puntuación oficial de 5,052 segundos en los cinco seeds oficiales, y como ejemplo del ecosistema de políticas ONNX para el robot microduck.

El archivo `policy.onnx` ocupa 1.212.095 bytes (sha256 `02f584a7956287113e293fc55b943d61cb685c7499336e20dc9fd5ab4b3d72ac`) y es idéntico al de la revisión `73589ead` del repositorio original. El repositorio no declara licencia propia y el autor original tampoco; la publicación se ampara en los términos de servicio de Hugging Face para contenido en repositorios públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico, exportada a ONNX; topología interna no detallada en la model card |
| Parametros totales | Aproximadamente 6 millones (según la convención de nombres de la serie; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (se distribuye únicamente el ONNX en precisión original) |
| Idiomas soportados | No aplica |
| Licencia | No declarada por el autor original ni por el republicador; las partes Apache-2.0 heredadas conservan su licencia |
| Formato de pesos | ONNX (`policy.onnx`, 1.212.095 bytes) y `manifest.json` con esquema 2 del manifiesto de políticas microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Velocidad comandada en la Arena | 0,2 |
| Runner de la Arena | v5 |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red (capas, activaciones, tipo de codificador). Lo que sí se documenta es la interfaz: la política consume observaciones crudas de 61 dimensiones y emite 14 acciones a 50 Hz, con el normalizador de observaciones embebido dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin normalizar. El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`, y la model card etiqueta el modelo como `reinforcement-learning`.

El método reportado por el autor original combina una red neuronal base (la de `lphatnguyen/microduck-sock-heist-6m-v3`, declarada como modelo base) con una tabla de búsqueda de trayectorias grabadas, clave sobre la observación, siguiendo el esquema introducido por `a1rb4Ck`. Sobre esa base se aplicó una optimización CMA en lazo abierto dentro del runner de la Arena, con tamaños de paso 0,003 y luego 0,001, dos rondas de 90 segundos por seed, y el tiempo continuo de cruce como coste, refinando las últimas 40 filas de la trayectoria de cada seed. El autor advierte explícitamente que los cinco seeds son in-sample: el archivo reproduce una trayectoria grabada por seed oficial y, para cualquier otra observación, delega en la red de lphatnguyen. No se documenta uso de RLHF, DPO ni número de tokens de entrenamiento.

## Capacidades

- Locomoción continua del robot microduck: genera una marcha perpetua que se ejecuta hasta que se descarga la política.
- Control a 50 Hz con observaciones crudas de 61 dimensiones y 14 acciones, sin necesidad de normalización externa.
- Reproducción de trayectorias grabadas para los cinco seeds oficiales de la prueba 6 m Sock Heist.
- Generalización limitada fuera de esos seeds mediante la red base heredada de `lphatnguyen/microduck-sock-heist-6m-v3`.
- Carga en robot real mediante `robotctl policy load <slot> <repo>`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Evaluación reproducible en la Microduck Arena: la entrada permite verificar en el marcador el resultado oficial de la política original (5,052 s, 5/5 seeds) junto al original, con bytes idénticos y misma velocidad comandada.
- Referencia de línea base para nuevas entradas: cualquier participante puede comparar su política contra esta puntuación de 5,052 s en el runner v5.
- Estudio del esquema de tabla de búsqueda sobre observación: el archivo ejemplifica la técnica introducida por a1rb4Ck de emparejar observaciones con filas de trayectoria grabada, útil para investigar métodos híbridos red + lookup en robótica de locomoción.
- Despliegue en robot microduck real: mediante `robotctl policy load` en un slot de política, el robot ejecuta la marcha de forma indefinida, adecuado para demostraciones de locomoción continua.
- Auditoría de linaje de modelos: el repositorio documenta revisiones, hashes y licencias de la cadena de derivación (`rumezhak`, `lphatnguyen`, `a1rb4Ck`, `jrubiosainz`), útil como caso de estudio de trazabilidad en modelos derivados.
- Pruebas de integración del runtime ONNX y del manifiesto de políticas microduck: el `manifest.json` sigue el esquema 2, por lo que sirve para validar cargadores y daemons compatibles.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Puntuación oficial en la Arena (run `01M6CPZT6YVBCZMYZQ1YG4`) | 5,052 s |
| Seeds completados | 5/5 |
| Tiempos por seed | s1 4,89 s; s2 5,39 s; s3 4,935 s; s4 5 s; s5 5,045 s |
| Runner | v5 |
| Velocidad comandada | 0,2 |
| Entrada anterior del mismo autor | `sock-heist-second-green`, 5,082 s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el archivo ONNX pesa 1.212.095 bytes y la red ronda los 6 millones de parámetros, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican en la model card; por tamaño, cualquier GPU con soporte ONNX Runtime es suficiente (RTX 4090, RTX 3060, e incluso CPU).
- Cabe en GPU consumer: sí, en cualquier modelo actual; también es viable en CPU dado el reducido tamaño y la frecuencia de 50 Hz.
- Opciones de despliegue: ONNX Runtime y el daemon `robotctl` del ecosistema microduck (carga en slots de política); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; el requisito funcional es sostener 50 Hz de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Arena | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (copia de `rumezhak/...-second-green-v2`) | ~6 M | No aplica | 5,052 s (5/5 seeds) | No declarada | Hugging Face |
| `rumezhak/microduck-sock-heist-second-green-v2` | ~6 M | No aplica | 5,052 s (5/5 seeds) | No declarada | Hugging Face |
| `lphatnguyen/microduck-sock-heist-6m-v3` | ~6 M | No aplica | No disponible | No declarada | Hugging Face |
| `a1rb4Ck/microduck-heist` | No disponible | No aplica | No disponible | Apache-2.0 | Hugging Face |

La comparativa se limita a la familia microduck Sock Heist; no se dispone de datos de rendimiento de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser una política de control, el riesgo relevante es el sobreajuste a los cinco seeds oficiales.
- Los cinco seeds son in-sample: el archivo reproduce una trayectoria grabada por seed y, fuera de ellos, recurre a la red base, por lo que el rendimiento en condiciones no vistas puede degradarse notablemente.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de comportamiento errático fuera de la distribución de observaciones entrenada.
- Limitaciones de contexto o idioma: no aplica; la política no procesa texto ni mantiene contexto conversacional.
- Restricciones de licencia: el autor original no declara licencia y el republicador tampoco concede ninguna; el uso fuera de los servicios de Hugging Face queda a criterio de los autores. Las partes Apache-2.0 heredadas conservan su licencia y avisos.
- El republicador no entrenó, ajustó ni evaluó la política; la puntuación esperada es la del run oficial de origen y solo cuenta la evaluación que haga la propia Arena.
- Solo simulación según la model card del autor original; el despliegue en robot real se documenta mediante `robotctl`, pero no se aportan métricas de rendimiento físico.
- El autor original se reserva el derecho de retirar la copia si formula objeción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-copy-rumezhak-73589ead
- Modelo original: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2
- Revisión original citada: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2/tree/73589ead9485546120bd47f635f15b4cff6fafdb
- Run oficial en la Arena: https://pollen-robotics-microduck-arena.hf.space/api/runs/01M6CPZT6YVBCZMYZQ1YG4
- Modelo base declarado: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Modelo base declarado (Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist
- Repositorio acreditado: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Repositorio del robot: https://github.com/pollen-robotics/microduck
