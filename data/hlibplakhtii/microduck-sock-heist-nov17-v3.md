# HlibPlakhtii/microduck-sock-heist-nov17-v3

## Resumen

microduck-sock-heist-nov17-v3 (publicado en la model card como "quicksilver-sock-heist-nov17-v3") es una política de control para robótica simulada derivada por fine-tuning de `jrubiosainz/microduck-sock-counter-s1s5`. Lo desarrolla el usuario de Hugging Face HlibPlakhtii y se distribuye en formato ONNX dentro del ecosistema `microduck`, orientado a competiciones de locomoción evaluadas en el simulador MuJoCo mediante el entorno Microduck Arena de Pollen Robotics. No es un modelo de lenguaje: es una política de acción (observation-to-action) para un robot cuadrúpedo tipo duck en un entorno de simulación.

El modelo no entrena una red neuronal nueva. Su mecanismo central es una tabla de búsqueda (lookup) que reproduce una secuencia de acciones articulares previamente optimizada cuando las observaciones registradas coinciden, y delega en el controlador original heredado del modelo base para cualquier otra observación. La secuencia se optimizó con CMA-ES separable sobre multiplicadores por articulación, tomando como dirección la diferencia entre la trayectoria del padre público y una trayectoria mejorada de Sock.

Es relevante ahora únicamente en el contexto acotado de la competición Microduck Arena: el autor declara explícitamente que es una política in-sample y solo para simulación, con un resultado local medio de 4,787 s y 5/5 finalizaciones a una velocidad de comando de 0,2 m/s. No constituye una reivindicación de locomoción general ni de operación segura en robot real. El resultado autoritativo es el del servidor de la competición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control robótico en ONNX con lookup de acciones sobre controlador heredado (red original preservada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el autor no afirma licencia nueva sobre contribuciones heredadas; se preservan avisos en `upstream-provenance/`) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La política parte del grafo ONNX del modelo base `jrubiosainz/microduck-sock-counter-s1s5` y conserva la red de respaldo y todos los operadores originales del grafo. Sobre esa base se añade una consulta adicional de observación: cuando las observaciones registradas coinciden, se reproduce una secuencia de objetivos articulares buscada previamente; en caso contrario, se usa el controlador original. No se entrena ninguna red neuronal nueva.

La secuencia de acciones se optimizó localmente con CMA-ES separable sobre multiplicadores por articulación, usando como dirección la diferencia entre el padre público fijado y trayectorias mejoradas de Sock, preservando el árbitro ligero oficial. El proceso se ejecutó contra el evaluador de Arena sin modificar (runner versión 5, MuJoCo 3.10.0, ONNX Runtime 1.24.4, NumPy 2.4.1). Se incluyen artefactos de reproducción: `search_race.py`, `search-config.json`, `searched-actions.npz` y `local-verification.json`, además de los ficheros de acciones de dirección con sus hashes y las acciones de partida.

## Capacidades

- Generación de acciones de control articular para un robot cuadrúpedo simulado en Microduck Arena.
- Reproducción determinista de una secuencia de objetivos articulares optimizada cuando las observaciones coinciden con las registradas.
- Fallback al controlador original del modelo base para observaciones no coincidentes.
- Ejecución en ONNX Runtime, lo que permite desplegarlo en pipelines de evaluación basados en ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye visión, audio ni modo thinking.

## Casos de uso

- Evaluación en la competición Microduck Arena: la política se envía al servidor de Arena, que ejecuta el runner oficial y devuelve el resultado autoritativo; es su propósito declarado y el único escenario para el que se optimizó.
- Reproducción local de resultados: mediante `search_race.py` y los artefactos incluidos se puede replicar la búsqueda y verificar el resultado local de 4,787 s de media en cinco arranques.
- Superposición sobre el modelo base: el script de reproducción incluye `Recorder` y `overlay` para comparar visualmente la secuencia buscada con la del padre fijado.
- Investigación sobre optimización de políticas por búsqueda: sirve como ejemplo de mejora de una política existente mediante CMA-ES separable sin reentrenar la red, útil para estudiar métodos de búsqueda de trayectorias en simulación.
- Docencia y divulgación sobre evaluación reproducible: los artefactos y hashes permiten ilustrar buenas prácticas de trazabilidad en experimentos de robótica simulada.
- Línea base para experimentos de locomoción en MuJoCo: puede emplearse como referencia in-sample frente a la que comparar políticas más generales, siempre con la cautela de que no generaliza fuera de los arranques declarados.
- No es adecuado para control de robot real, atención al cliente, generación de código ni ninguna tarea de lenguaje.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo medio local (5 arranques) | 4,787 s |
| Finalizaciones locales | 5/5 |
| Velocidad de comando | 0,2 m/s |
| Entorno de evaluación | Microduck Arena, runner v5, MuJoCo 3.10.0, ONNX Runtime 1.24.4, NumPy 2.4.1 |
| Resultado en servidor | no disponible en la información proporcionada (el autor indica que el resultado del servidor es el autoritativo) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere un grafo ONNX de pequeñas dimensiones, pero no se documenta el tamaño exacto del fichero.
- GPU recomendadas: no disponible; al ejecutarse en ONNX Runtime, puede correr en CPU o en GPU compatibles con ONNX Runtime, pero el autor no especifica requisitos.
- ¿Cabe en GPU de consumo? No disponible; por el tamaño del repositorio es altamente probable, pero no se confirma en la información proporcionada.
- Opciones de despliegue: ONNX Runtime 1.24.4 (versión usada en la verificación local), junto con MuJoCo 3.10.0 y NumPy 2.4.1 para el entorno de simulación. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se reporta el tiempo de finalización del episodio (4,787 s de media), no la latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Formato | Resultado local | Licencia |
|---|---|---|---|---|---|
| HlibPlakhtii/microduck-sock-heist-nov17-v3 | Política con lookup + fallback | jrubiosainz/microduck-sock-counter-s1s5 | ONNX | 4,787 s, 5/5 | no disponible |
| jrubiosainz/microduck-sock-counter-s1s5 | Política de control (modelo base) | no disponible | ONNX | no disponible | no disponible |
| Otras políticas de Microduck Arena | Políticas de control | no disponible | ONNX | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Política in-sample: el lookup se optimizó para los arranques de evaluación declarados; no generaliza a otras condiciones iniciales ni a otros entornos.
- Solo simulación: el autor declara explícitamente que no es una reivindicación de locomoción general ni de operación segura en robot real.
- Riesgo de sobreajuste al evaluador: la secuencia se ajustó contra el evaluador de Arena sin modificarlo, pero el resultado local puede no coincidir con el del servidor, que es el autoritativo.
- Licencia no disponible: el autor no afirma licencia nueva sobre las contribuciones heredadas y remite a `upstream-provenance/`; antes de cualquier uso comercial debe revisarse la procedencia y los avisos del modelo base y de los autores originales.
- Idiomas: no aplica, pero conviene señalar que no procesa texto ni lenguaje natural.
- Sesgos conocidos: no documentados en la información proporcionada.
- Alucinación: no aplica en el sentido de modelos de lenguaje; el riesgo equivalente es la reproducción de una secuencia inadecuada cuando las observaciones coinciden parcialmente con las registradas.
- Dependencia de versiones concretas: la verificación usa MuJoCo 3.10.0, ONNX Runtime 1.24.4 y NumPy 2.4.1; cambios de versión pueden alterar el comportamiento.
- Repositorio de tamaño 0,0 GB y 0 descargas/0 likes: ecosistema muy incipiente, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-nov17-v3
- Modelo base: https://huggingface.co/jrubiosainz/microduck-sock-counter-s1s5/tree/cf2d5452ce5132455263c7fb6cb12a8554ba570c
- Evaluador Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena/tree/main
- Artefactos de reproducción (en el repositorio del modelo): `search_race.py`, `search-config.json`, `searched-actions.npz`, `local-verification.json`, `upstream-provenance/`
