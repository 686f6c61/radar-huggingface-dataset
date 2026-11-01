# HlibPlakhtii/microduck-hill-quicksilver-v3

## Resumen

microduck-hill-quicksilver-v3 es una política de control para robótica (pipeline `robotics`) publicada por HlibPlakhtii en Hugging Face. Se trata de un remix de competición en simulación del modelo `rumezhak/microduck-hill-remix-leader3`, sobre el que se ha añadido una red de respaldo (*fallback network*) y una búsqueda adicional de observaciones. El resultado es un controlador híbrido: cuando las observaciones registradas coinciden, se reproduce una secuencia de objetivos articulares previamente optimizada; en caso contrario, se delega en el controlador original.

El modelo no es un LLM ni un modelo generativo de texto: es una política de locomoción para el robot cuadrúpedo MicroDuck evaluada en el entorno MuJoCo del MicroDuck Arena de Pollen Robotics. Su relevancia es acotada y de nicho: sirve como artefacto de competición y como ejemplo de optimización de trayectorias con CMA-ES separable sobre un evaluador sin modificar. El autor advierte explícitamente de que es una política *in-sample* y solo para simulación, no una demostración de locomoción general ni de operación segura en robot real.

El repositorio ocupa 0,0 GB (pesos presumiblemente muy ligeros, en formato ONNX) y acumula 20 descargas y 0 likes en el momento de la consulta. La licencia es Apache 2.0. No se dispone de información sobre arquitectura de red, número de parámetros ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de control con red de respaldo y *lookup* de observaciones; topología de red no documentada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; opera sobre observaciones de estado del robot) |
| Tipos de cuantizacion | No disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (librería `microduck`, etiqueta `onnx`) |

## Arquitectura y entrenamiento

La política parte de `rumezhak/microduck-hill-remix-leader3` y conserva la red de respaldo y todos los operadores de grafo originales. Sobre esa base se añade un mecanismo de *lookup* de observaciones: si las observaciones registradas coinciden con las de la secuencia almacenada, el modelo reproduce una secuencia de objetivos articulares (*joint-target sequence*) recién buscada; para el resto de observaciones se usa el controlador original. Se trata, por tanto, de una arquitectura híbrida de controlador más tabla de trayectorias, no de un transformer ni de un modelo secuencial generativo.

El entrenamiento consistente en una optimización local con CMA-ES separable contra el evaluador del MicroDuck Arena sin modificar (runner versión 5, MuJoCo 3.10.0, ONNX Runtime 1.24.4, NumPy 2.4.1). La trayectoria de arranque de la búsqueda se convirtió primero a objetivos de servo equivalentes, preservando cada fuerza de motor registrada, el asentamiento (*settle*) y la traza completa de movimiento; esto elimina magnitudes de objetivo no utilizadas más allá de la saturación del motor. La búsqueda posterior modificó la trayectoria. Se incluyen los artefactos de reproducción: `search_race.py`, `search-config.json`, `searched-actions.npz` y `local-verification.json`, además del código de transformación, la verificación y la secuencia de acciones inicial.

## Capacidades

- Control de locomoción del robot MicroDuck en simulación MuJoCo mediante reproducción de una secuencia de objetivos articulares optimizada.
- Conmutación entre la política nueva y el controlador original según coincidencia de observaciones registradas.
- Ejecución en formato ONNX, compatible con ONNX Runtime 1.24.4.
- Reproducción y *overlay* de la secuencia almacenada sobre la base fijada mediante el script `Recorder` y `overlay` proporcionados.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni *tool calling*: no es un modelo de lenguaje.
- No dispone de soporte multilingüe ni de modo *thinking*.

## Casos de uso

- Competición en el MicroDuck Arena: la política está diseñada para las posiciones de inicio declaradas y el comando de velocidad de 0,15 m/s, lo que permite presentar una entrada competitiva en el *leaderboard* de simulación.
- Verificación local de resultados: con `local-verification.json` y `search_race.py` se puede replicar la media local de cinco arranques (0,738 s, 5/5 finalizaciones) en el mismo runner y versión de MuJoCo.
- Estudio de optimización con CMA-ES: el repositorio sirve como caso práctico de búsqueda separable de trayectorias contra un evaluador fijo, útil para investigadores que quieran reproducir o adaptar la metodología.
- Análisis de conversión de trayectorias a objetivos de servo: el código de transformación incluido permite estudiar cómo se preservan fuerzas de motor y asentamiento al reparametrizar una política.
- *Overlay* y depuración visual: el script de reproducción permite superponer la secuencia buscada sobre la base fijada para inspeccionar diferencias de comportamiento.
- Evaluación comparativa de controladores: al conservar la red de respaldo original, se puede comparar el rendimiento del *lookup* frente al controlador base en las mismas condiciones de simulación.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Media local de cinco arranques | 0,738 s |
| Finalizaciones locales | 5/5 |
| Comando de velocidad | 0,15 m/s |
| Entorno de evaluacion | MicroDuck Arena, runner v5, MuJoCo 3.10.0, ONNX Runtime 1.24.4, NumPy 2.4.1 |

El autor indica que el resultado del servidor es el autoritativo y que estas cifras son locales. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB, lo que sugiere un artefacto muy ligero que probablemente se ejecuta en CPU.
- GPU recomendadas: no disponibles; no se documenta requisito de GPU.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio, es plausible su ejecución en CPU, pero no se dispone de dato explícito.
- Opciones de despliegue: ONNX Runtime 1.24.4 con la librería `microduck`; el flujo de verificación usa MuJoCo 3.10.0 y NumPy 2.4.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-hill-quicksilver-v3 | No disponible | No aplica | 0,738 s de media local, 5/5 finalizaciones | Apache 2.0 | Hugging Face, 20 descargas |
| rumezhak/microduck-hill-remix-leader3 (base) | No disponible | No aplica | No disponible en la informacion proporcionada | No disponible | Hugging Face |
| Otras políticas del MicroDuck Arena | No disponible | No aplica | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Política deliberadamente *in-sample* y solo para simulación: el *lookup* se optimizó para las posiciones de inicio declaradas y no constituye una afirmación de locomoción de propósito general.
- No es apta para operación segura en robot real; el autor lo advierte de forma explícita.
- El resultado autoritativo es el del servidor; las cifras locales (0,738 s, 5/5) no deben presentarse como rendimiento oficial.
- Dependencia estricta de la coincidencia de observaciones: fuera de las observaciones registradas se usa el controlador original, cuyo comportamiento puede diferir.
- Sensibilidad al entorno de evaluación: runner v5, MuJoCo 3.10.0, ONNX Runtime 1.24.4 y NumPy 2.4.1; cambios de versión pueden alterar los resultados.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de idioma porque el modelo no es lingüístico; no aplica.
- Licencia Apache 2.0: permite uso comercial con las obligaciones de atribución y avisos correspondientes; debe conservarse la atribución a rumezhak y a los autores originales identificados en la model card de la base.
- No se modificaron el evaluador, la física, los datos del *leaderboard* ni el código del servidor, según el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HlibPlakhtii/microduck-hill-quicksilver-v3
- Modelo base: https://huggingface.co/rumezhak/microduck-hill-remix-leader3/tree/cddaeebb6bcee5ef84729d9eb0838fc74097cf2c
- Evaluador MicroDuck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena/tree/main
