# dashi/microduck-hill-daily-20261111

## Resumen

`dashi/microduck-hill-daily-20261111` es una política de control motriz para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y un espacio de acción de 14 grados de libertad. El autor, `dashi`, la publica como "re-entrada diaria" de una política previa (`microduck-hill-remix-r752`, con recompensa 0,749) y la etiqueta para el slot de marcha `walk`.

El modelo es un fine-tune de `jrubiosainz/microduck-game-hillclimber-remix6` y está pensado para ejecutarse directamente sobre el robot mediante el daemon `robotctl`. Su relevancia es acotada pero concreta: demuestra un flujo de trabajo de entrenamiento RL reproducible (repo `pollen-robotics/microduck_rl`, rama `roll-backward`) y distribución de políticas vía Hugging Face con un manifiesto versionado (schema 2).

La ficha se limita a los datos disponibles en la model card y en los metadatos del repositorio. No hay información sobre arquitectura de red, número de parámetros, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esos apartados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política RL exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Librería | `microduck` |
| Pipeline | `robotics` |
| Modelo base | `jrubiosainz/microduck-game-hillclimber-remix6` (finetune) |
| Tamaño del repo | 0,0 GB (según metadatos) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal (capas, activaciones, tamaño de las hidden units). Lo único documentado es el contrato de interfaz: entrada de 61 dimensiones (observación cruda del robot), salida de 14 acciones, ejecución a 50 Hz y carácter "perpetuo" de la política, es decir, diseñada para correr de forma continua hasta que se le indique lo contrario. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin preprocesar.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. No se especifican el número de pasos de entrenamiento, la composición del entorno, la función de recompensa ni si hubo fases de ajuste fino adicionales. La política es un fine-tune del modelo `jrubiosainz/microduck-game-hillclimber-remix6`, y la model card indica que se trata de una "re-entrada diaria" de `dashi/microduck-hill-remix-r752` con recompensa reportada de 0,749. No se detalla qué innovación técnica incorpora respecto al modelo base.

## Capacidades

- Locomoción cuadrúpeda continua para el robot microduck en el slot `walk`.
- Política "perpetua": mantiene la marcha de forma indefinida hasta recibir una orden de parada o cambio.
- Consumo de observaciones crudas de 61 dimensiones con normalización integrada en el ONNX.
- Generación de 14 comandos de acción a 50 Hz, adecuada para el bucle de control del daemon.
- Carga directa mediante `robotctl policy load walk <repo>` sin pasos intermedios de conversión.
- Compatible con el manifiesto de políticas schema 2 del daemon de microduck.
- No soporta tool calling, function calling, agentes, multilingüismo ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- **Marcha autónoma en terreno con pendiente**: la política está entrenada sobre un entorno de tipo *hillclimber* (según el nombre del modelo base), por lo que se usaría para que el microduck avance por superficies inclinadas manteniendo el gait `walk` de forma continua.
- **Demostraciones de locomoción RL en robótica educativa**: al cargarse con un único comando (`robotctl policy load walk ...`), sirve para talleres y clases donde se quiere mostrar el ciclo completo de una política RL en un robot real sin infraestructura adicional.
- **Pruebas de integración del daemon `robotctl`**: al seguir el manifiesto schema 2, resulta útil como política de referencia para validar el pipeline de carga, normalización embebida y ejecución a 50 Hz del daemon.
- **Comparación de políticas en el slot `walk`**: permite alternar con otras políticas del mismo slot (`microduck-hill-remix-r752`, `microduck-game-hillclimber-remix6`) para evaluar diferencias de comportamiento sobre el mismo hardware.
- **Reproducción de experimentos RL**: al estar vinculada a un commit concreto (`83599404a`) de la rama `roll-backward` de `microduck_rl`, se puede usar como punto de control para reproducir o extender el entrenamiento.
- **Evaluación de robustez en bucle cerrado**: su carácter perpetuo la hace adecuada para pruebas de larga duración en las que se mide deriva, consumo o estabilidad del gait a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una recompensa de 0,749 asociada a la política predecesora `dashi/microduck-hill-remix-r752`, sin especificar la métrica, el entorno de evaluación ni la metodología de medida.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Al ser una política de control de muy baja dimensionalidad (61 entradas, 14 salidas) exportada a ONNX, es previsible que el requisito de memoria sea mínimo, pero no se han publicado cifras.
- **GPU recomendadas**: no disponible. La ejecución documentada es sobre el propio robot vía `robotctl`, no sobre GPU de servidor.
- **Compatibilidad con GPU de consumo**: no confirmada en la información disponible; por el tamaño del artefacto (repo de 0,0 GB) es plausible que funcione en CPU, pero no se documenta.
- **Opciones de despliegue**: `robotctl policy load walk dashi/microduck-hill-daily-20261111` (flujo oficial documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: el bucle de control opera a 50 Hz (periodo de 20 ms). No se publican cifras de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Observación / acción | Frecuencia | Licencia | Relación |
|---|---|---|---|---|---|---|
| `dashi/microduck-hill-daily-20261111` | Política RL (ONNX) | `walk` | 61 / 14 | 50 Hz | no disponible | Este modelo |
| `jrubiosainz/microduck-game-hillclimber-remix6` | Política RL | no disponible | no disponible | no disponible | no disponible | Modelo base |
| `dashi/microduck-hill-remix-r752` | Política RL | no disponible | no disponible | no disponible | no disponible | Predecesor (recompensa 0,749) |

No se dispone de datos de parámetros, contexto ni benchmarks para establecer una comparación cuantitativa con alternativas de otras familias.

## Limitaciones y advertencias

- **Licencia no especificada**: la licencia aparece como "no disponible" tanto en los metadatos como en la model card, lo que impide confirmar si el uso comercial está permitido. No debe desplegarse en producción sin aclarar este punto.
- **Especificidad de hardware**: la política está entrenada para el microduck concreto (61-D de observación, 14 acciones, 50 Hz). No es transferible a otro robot sin reentrenamiento.
- **Sin información sobre el dataset**: no se documenta la distribución de entrenamiento, lo que impide evaluar sesgos de simulación a realidad (*sim-to-real gap*) ni la robustez ante terrenos no vistos.
- **Ausencia de benchmarks**: no hay métricas publicadas de éxito, estabilidad o consumo, más allá de la recompensa 0,749 del predecesor.
- **Naturaleza "perpetua"**: la política corre hasta que se le indique lo contrario; en producción conviene implementar mecanismos externos de parada y supervisión.
- **Modelo de nicho y con tracción nula**: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- **Resultados de búsqueda no pertinentes**: las búsquedas web devuelven páginas sobre el caldo japonés *dashi*, sin relación con este modelo; no aportan información técnica adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-hill-daily-20261111
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix6
- Predecesor citado: https://huggingface.co/dashi/microduck-hill-remix-r752
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (schema 2)
