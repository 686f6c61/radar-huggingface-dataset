# GinDuck/microduck-tug-norris-p10

## Resumen

Tug Norris es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de una política perpetua que genera movimientos de marcha (gait) a partir de observaciones del robot, emitiendo 14 acciones de control a 50 Hz. Se distribuye en formato ONNX e integra el normalizador de observaciones dentro del propio grafo, de modo que el robot puede alimentar observaciones en crudo.

El modelo es un fine-tune de `SSH111111/microduck-tug-p10`, al que GinDuck ha añadido una tabla de ratings propia (con secuencias de suraj-phanindra y jrubiosainz, optimizada por hill-climbing con semilla 3). Según la model card, la autoría de la estrategia de juego corresponde a SSH111111 y el trabajo de GinDuck se centra en la capa de valoración que selecciona el comportamiento.

Su relevancia es acotada pero concreta: forma parte del ecosistema de competiciones (Arena races y cups) del robot microduck y se carga directamente en una ranura de política del demonio `robotctl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la información pública disponible es muy limitada: no se detallan parámetros, contexto ni datos de entrenamiento más allá de la rama y el commit del repositorio de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL para robótica; red neuronal exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Otros datos relevantes:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta que se detiene) |
| Modelo base | SSH111111/microduck-tug-p10 |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de encoder, función de activación ni tamaño de las capas ocultas). Lo que sí se conoce es su interfaz: recibe un vector de observación de 61 dimensiones, produce 14 acciones de control y opera a 50 Hz como política perpetua. El normalizador de observaciones está embebido en `policy.onnx`, por lo que el consumidor debe entregar observaciones sin normalizar.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. El modelo es un fine-tune del checkpoint `SSH111111/microduck-tug-p10`; la aportación de GinDuck consiste en una tabla de ratings construida a partir de secuencias de suraj-phanindra y jrubiosainz y optimizada mediante hill-climbing con semilla 3. No se especifican el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL concreto ni si hubo etapas de ajuste adicionales.

## Capacidades

- Control locomotor del robot microduck: genera una marcha perpetua a partir de observaciones de 61 dimensiones.
- Emisión de 14 acciones de control a 50 Hz, adecuada para bucles de control en tiempo real.
- Política perpetua: no requiere condición de parada interna; se ejecuta hasta que el operador la detiene o la sustituye.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el demonio del robot.
- Carga directa en una ranura de política mediante `robotctl policy load <slot> GinDuck/microduck-tug-norris-p10`.
- Orientada a competición: diseñada para las pruebas de tipo cup/arena del ecosistema microduck.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Competiciones de la Arena y cups de microduck: la política se carga en una ranura y ejecuta la marcha entrenada para las pruebas de tipo cup, aprovechando el ajuste específico de la tabla de ratings de GinDuck.
- Demostraciones de locomoción en robótica de bajo coste: sirve para mostrar el ciclo observación-acción a 50 Hz sobre hardware microduck en talleres y ferias.
- Docencia en aprendizaje por refuerzo aplicado a robótica: el par observación/acción (61/14) y el formato ONNX permiten estudiar el despliegue de políticas entrenadas sin necesidad de infraestructura de inferencia de gran escala.
- Evaluación comparativa de políticas: al ser un fine-tune de `SSH111111/microduck-tug-p10`, permite comparar el efecto de la capa de rating sobre el comportamiento base en la misma plataforma.
- Integración en el demonio `robotctl`: el manifiesto schema 2 y el normalizador embebido facilitan cargar, sustituir y alternar políticas en un mismo robot durante una sesión.
- Reproducción de experimentos de RL: el repositorio, rama y commit documentados permiten reconstruir el pipeline de entrenamiento y verificar la reproducibilidad del fine-tune.
- Pruebas de robustez de locomoción: la política perpetua puede ejecutarse de forma continua para medir deriva, estabilidad y consumo en sesiones prolongadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito en cups, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una política de RL para un robot de pequeña escala exportada a ONNX, es previsible que el modelo sea ligero, pero no se publica el número de parámetros ni el tamaño del grafo.
- GPU recomendadas: no disponibles. No se especifica si el despliegue requiere GPU o si la inferencia se realiza en CPU en el propio robot o en un host cercano.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el tamaño del modelo.
- Opciones de despliegue: ONNX Runtime es el formato natural dado `policy.onnx`; la carga en el robot se realiza mediante `robotctl policy load <slot> GinDuck/microduck-tug-norris-p10`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El único dato de temporización es la frecuencia de control de 50 Hz (periodo de 20 ms) que la política debe sostener en el bucle de control.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion | Dimension accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GinDuck/microduck-tug-norris-p10 | Política RL (ONNX) | 61 | 14 | 50 Hz | no disponible | Hugging Face |
| SSH111111/microduck-tug-p10 | Política RL (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas del ecosistema microduck | Políticas RL | no disponible | no disponible | no disponible | no disponible | Repositorio pollen-robotics/microduck |

No se dispone de datos de rendimiento comparativo entre estas políticas; la comparativa se limita a la relación de fine-tune documentada (Tug Norris deriva de `SSH111111/microduck-tug-p10`).

## Limitaciones y advertencias

- Información pública muy escasa: no se publican parámetros, arquitectura interna, datos de entrenamiento ni métricas, lo que impide evaluar su calidad de forma independiente.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de integrarlo en productos.
- Específica de una plataforma: solo es válida para el robot microduck con observación de 61 dimensiones y 14 acciones; no es transferible a otros robots sin reentrenamiento.
- Dependencia del modelo base: el comportamiento hereda las limitaciones de `SSH111111/microduck-tug-p10`, sobre el que se aplica el fine-tune.
- Sin garantías de robustez fuera del dominio de competición: no hay evidencia publicada sobre comportamiento ante perturbaciones, terrenos distintos o cargas variables.
- Sin soporte multilingüe ni de texto: no debe emplearse en tareas de NLP, generación de código o razonamiento; su pipeline es exclusivamente `robotics`.
- Repositorio con 0 descargas y 0 likes: no hay señal de validación por parte de la comunidad ni informes de uso en producción.
- Riesgo de sobreajuste a la tabla de ratings: al estar optimizada mediante hill-climbing sobre secuencias concretas, el rendimiento puede degradarse en escenarios no representados en esas secuencias.
- Fecha de creación futura en los metadatos (2026-11-20): conviene verificar la integridad y procedencia del artefacto antes de desplegarlo en hardware real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-tug-norris-p10
- Modelo base: https://huggingface.co/SSH111111/microduck-tug-p10
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio
- QuackPack (seguimiento de la Arena y cups en iPhone): https://www.imundo.ch/quackpack/
