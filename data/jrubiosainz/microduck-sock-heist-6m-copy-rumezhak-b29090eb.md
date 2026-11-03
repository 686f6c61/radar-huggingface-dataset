# jrubiosainz/microduck-sock-heist-6m-copy-rumezhak-b29090eb

## Resumen

`jrubiosainz/microduck-sock-heist-6m-copy-rumezhak-b29090eb` es una republicación sin modificaciones de la política `policy.onnx` que el usuario rumezhak presentó en la prueba "6 m Sock Heist" de la Microduck Arena. No se trata de un modelo de lenguaje: es una política de control robótico entrenada por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics, con observación de 61 dimensiones, 14 acciones de salida y una frecuencia de control de 50 Hz. El autor de esta copia, jrubiosainz, declara explícitamente que no ha entrenado, ajustado ni editado la política; su única aportación es el registro de la misma en la Arena bajo su cuenta para que el marcador muestre el resultado oficial junto al original.

El interés técnico del artefacto es acotado pero concreto: se trata de una política perpetua de marcha ("gait") para el slot `walk`, empaquetada como un único fichero ONNX de 1.207.387 bytes (sha256 `fce522678150d95ab3e8c0bda245665eeffe4230511461c8a93b21e5e430ec11`) con el normalizador de observaciones embebido, de modo que el robot puede alimentarse con observaciones en bruto. En la ejecución de origen (`01M6GASHYFDFASDBSWEB1M`) obtuvo una puntuación de 4,937 sobre 5 semillas, con runner v5 y velocidad comandada de 0,2.

La relevancia de esta ficha es, por tanto, la de un caso de estudio de reproducibilidad y atribución en el ecosistema de la Microduck Arena: pesos binarios idénticos, linaje declarado de ocho repositorios y una licencia ambigua (el repositorio fuente no declara ninguna) que obliga a apoyarse en los términos de servicio de Hugging Face para la redistribución. No hay información sobre arquitectura interna, datos de entrenamiento ni benchmarks más allá del resultado de la Arena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada por RL, exportada a ONNX; red interna no documentada) |
| Parametros totales | no disponible (fichero ONNX de 1.207.387 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx` en precisión original) |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | ninguna declarada por el repositorio fuente; partes Apache-2.0 heredadas de `a1rb4Ck/microduck-heist` y `jrubiosainz/microduck-sock-heist-6m-94cd-tail`; la copia no se relicencia |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` (schema 2 del manifiesto de políticas de microduck) |
| Observaciones | 61 dimensiones (normalizador embebido en el ONNX) |
| Acciones | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada); slot `walk` |
| Velocidad comandada en la ejecución de origen | 0,2 |
| Runner de la Arena | v5 |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no describe la topología interna de la red (número de capas, tipo de capas, función de activación ni dimensión de las capas ocultas). Lo que sí se documenta es la interfaz: la política consume un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, con el normalizador de observaciones integrado en el propio grafo ONNX para que el consumidor entregue observaciones sin procesar. El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`, mediante aprendizaje por refuerzo; no se detallan el algoritmo, el número de pasos de entorno, la composición del dataset ni si hubo etapas de ajuste fino o destilación.

El linaje declarado por la fuente es un compuesto por semillas: las semillas 1 y 5 fueron buscadas de nuevo y las semillas 2 a 4 provienen del trabajo F2U de jrubiosainz. Los modelos base declarados son `rumezhak/microduck-sock-heist-remix-rz-tail` (revisión `7e74afd1`) y `jrubiosainz/microduck-sock-heist-6m-rz-tail-r4` (revisión `54aade37`), con relación `merge`. Se acreditan además `lphatnguyen/microduck-sock-heist-6m-v3` y `-v4`, `a1rb4Ck/microduck-heist` (Apache-2.0), `rumezhak/microduck-sock-heist-second-green-v2` y `jrubiosainz/microduck-sock-heist-6m-94cd-tail` (Apache-2.0). No se documenta ninguna innovación de inferencia (decodificación especulativa, atención lineal ni similares), lo cual es coherente con el dominio: es una política de control de baja dimensionalidad.

## Capacidades

- Generación de marcha perpetua para el robot microduck en el slot `walk`, a 50 Hz y con 14 acciones de control.
- Consumo de observaciones en bruto de 61 dimensiones gracias al normalizador embebido en el ONNX.
- Ejecución autónoma continuada: la política no termina por sí misma, corre hasta que se le indique lo contrario.
- Carga directa en robot mediante `robotctl policy load walk <repo>`.
- Evaluación en la Microduck Arena sobre la prueba "6 m Sock Heist" con runner v5.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento: no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- **Despliegue de referencia en el robot microduck**: cargar la política con `sudo robotctl policy load walk jrubiosainz/microduck-sock-heist-6m-copy-rumezhak-b29090eb` para disponer de una marcha funcional validada en la Arena, útil como línea base al comparar políticas propias.
- **Reproducción de resultados de la Arena**: al ser byte a byte idéntica al fichero de origen (mismo sha256), permite verificar que una puntuación de 4,937 se reproduce con los mismos bytes, evento, semillas, velocidad comandada y versión de runner.
- **Auditoría de linaje y atribución**: el repositorio incluye la tabla completa de ocho repositorios con revisiones y licencias, lo que sirve como plantilla para documentar fusiones y compuestos de políticas en trabajos derivados.
- **Pruebas de integración del runtime `microduck`**: útil para validar el cargador de políticas, el esquema 2 de `manifest.json` y la ruta de inferencia ONNX en el daemon antes de desplegar políticas propias.
- **Comparación de estrategias de marcha en el slot `walk`**: al fijar velocidad comandada de 0,2 y runner v5, proporciona un punto de comparación estable frente a políticas entrenadas con otros hiperparámetros.
- **Docencia y divulgación sobre RL aplicado a robótica**: el tamaño reducido del artefacto (1,2 MB) y su interfaz bien definida lo hacen adecuado para explicar el ciclo observación-acción en un cuadrúpedo sin la complejidad de un modelo generativo.

## Benchmarks y rendimiento

Los únicos datos de evaluación disponibles son los de la ejecución oficial en la Microduck Arena (`01M6GASHYFDFASDBSWEB1M`), heredados por identidad de bytes:

| Metrica | Valor |
|---|---|
| Puntuación global (6 m Sock Heist) | 4,937 |
| Semillas completadas | 5/5 |
| Semilla 1 | 4,82 |
| Semilla 2 | 5,24 |
| Semilla 3 | 4,79 |
| Semilla 4 | 4,875 |
| Semilla 5 | 4,96 |
| Runner | v5 |
| Velocidad comandada | 0,2 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y en cualquier caso no aplicarían a una política de control robótico.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el fichero ONNX ocupa 1.207.387 bytes, por lo que el peso de los parámetros es del orden de 1,2 MB y la inferencia cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- **GPU recomendadas**: no se especifican. Por tamaño, cualquier GPU con soporte ONNX Runtime es suficiente; no se requiere A100 ni H100.
- **GPU consumer**: sí cabe en cualquier RTX, GTX o iGPU moderna; el cuello de botella real es la latencia del bucle de control a 50 Hz, no la memoria.
- **Plataforma de destino**: robot microduck de Pollen Robotics, con el daemon `robotctl` y la librería `microduck`.
- **Opciones de despliegue**: `robotctl policy load walk <repo>` en el robot; ONNX Runtime para inferencia fuera del robot.
- **Latencia y throughput**: no disponibles en la información proporcionada; el requisito funcional es sostener 50 Hz de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Arena 6 m Sock Heist) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-sock-heist-6m-copy-rumezhak-b29090eb` (esta ficha) | no disponible (ONNX 1,2 MB) | no aplica | 4,937 (5/5 semillas, runner v5, vel. 0,2) | ninguna declarada en origen; partes Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| `rumezhak/microduck-sock-heist-composite-v1` (fuente) | idénticos bytes | no aplica | misma ejecución de origen | ninguna declarada | Hugging Face |
| `rumezhak/microduck-sock-heist-remix-rz-tail` (base declarada) | no disponible | no aplica | no disponible | ninguna declarada | Hugging Face |
| `a1rb4Ck/microduck-heist` (acreditado) | no disponible | no aplica | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa se limita al resultado de la ejecución de origen.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento, código o matemáticas. Cualquier uso fuera del control del robot microduck es inadecuado.
- **Licencia ambigua**: el repositorio fuente no declara licencia. La copia se apoya en la licencia que los Términos de Servicio de Hugging Face otorgan sobre contenido en repositorios públicos, pero no se relicencia; el uso fuera de Hugging Face queda a criterio de los autores originales. Verificar antes de cualquier uso comercial.
- **Sin evaluación propia**: jrubiosainz no ejecutó réplicas ni evaluaciones nuevas; el resultado de 4,937 se hereda de la ejecución de origen y solo cuenta el que la Arena calcule para esta entrada.
- **Riesgo de sobreajuste a un evento concreto**: la política está entrenada y puntuada para el escenario "6 m Sock Heist" con velocidad comandada de 0,2 y runner v5; su comportamiento fuera de esas condiciones no está documentado.
- **Sesgos y alucinación**: no aplican en el sentido habitual, pero sí existe riesgo de fallo de la marcha (caídas, derivas) ante observaciones fuera de distribución no caracterizadas en la documentación.
- **Sin información de arquitectura ni de datos de entrenamiento**: imposible auditar la política internamente, estimar su robustez o reproducir el entrenamiento a partir de esta ficha.
- **Repositorio vacío en métricas sociales**: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- **Retirada a petición del autor**: el repositorio declara que se retirará si el autor original objeta, por lo que su disponibilidad a largo plazo no está garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-copy-rumezhak-b29090eb
- Repositorio fuente: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v1
- Revisión fuente citada: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v1/tree/b29090eb3242a9c1201b650495d515bb622a394f
- Modelo base declarado 1: https://huggingface.co/rumezhak/microduck-sock-heist-remix-rz-tail
- Modelo base declarado 2: https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-rz-tail-r4
- Crédito 1: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v3
- Crédito 2: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v4
- Crédito 3 (Apache-2.0): https://huggingface.co/a1rb4Ck/microduck-heist
- Crédito 4: https://huggingface.co/rumezhak/microduck-sock-heist-second-green-v2
- Crédito 5 (Apache-2.0): https://huggingface.co/jrubiosainz/microduck-sock-heist-6m-94cd-tail
- Ejecución en la Microduck Arena: https://pollen-robotics-microduck-arena.hf.space/api/runs/01M6GASHYFDFASDBSWEB1M
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8` (sin URL directa en la información disponible)
