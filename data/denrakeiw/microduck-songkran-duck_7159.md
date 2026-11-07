# DenRakEiw/microduck-songkran-duck_7159

## Resumen

`microduck-songkran-duck_7159` es una política de control motriz (policy) entrenada por el usuario DenRakEiw para el robot cuadrúpedo de código abierto Microduck, desarrollado por Pollen Robotics y comercializado por Hugging Face. No se trata de un modelo de lenguaje, sino de una red neuronal de control exportada a ONNX que ocupa el slot `walk` del robot y genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones, produciendo 14 acciones.

La política deriva de un linaje de entrenamiento documentado por el autor: parte de una red de carrera (`songkran-duck_7199`, checkpoint `hr2b-brake` 1575) reentrenada para detenerse ante la presencia del "gigante" y frenar en los giros, envuelta en un wrapper de ritmo fijo y posteriormente refinada mediante estrategias de evolución sobre CPU. La selección final se realizó bajo ruido de acción reducido en tres rondas.

Su relevancia es acotada pero concreta: es un artefacto de robótica de bajo nivel, reproducible y desplegable en hardware real mediante el comando `robotctl`, que ilustra el flujo de trabajo de entrenamiento por refuerzo y ajuste evolutivo sobre un robot de bajo coste. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles de capas no disponibles), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot del robot | `walk` |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchuras, funciones de activación). Lo que sí se especifica es la interfaz: entrada de 61 dimensiones de observación cruda, salida de 14 acciones, ejecución a 50 Hz y carácter perpetuo. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin preprocesar.

El proceso de entrenamiento combina varias fases. El autor indica que la base es `songkran-duck_7199`, una red de carrera derivada del checkpoint `hr2b-brake` 1575, reentrenada para congelarse ante el "gigante" y frenar en el giro, y colocada tras un wrapper de ritmo fijo. Sobre esa base se aplicó un pulido de pesos mediante estrategias de evolución (evolution strategies) ejecutado en CPU, con selección de candidatos bajo ruido de acción pequeño durante tres rondas. El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw-070`, commit `97e2b1fe2`. El autor menciona que el entrenamiento se hizo "con energía solar", un detalle anecdótico sin implicación técnica verificable.

## Capacidades

- Locomoción bípeda/cuadrúpeda del Microduck en el slot `walk`, con marcha perpetua hasta recibir una orden de parada.
- Control reactivo a 50 Hz a partir de observaciones proprioceptivas y posiblemente exteroceptivas (la composición exacta de las 61 dimensiones no está documentada en la información disponible).
- Comportamiento de congelación ante la presencia del "gigante" (entidad no especificada en la model card) y frenado en los giros.
- Robustez ante ruido de acción pequeño, seleccionada explícitamente durante el proceso evolutivo.
- Despliegue directo en robot físico mediante `robotctl policy load walk DenRakEiw/microduck-songkran-duck_7159`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: es una política motriz, no un modelo generativo.

## Casos de uso

- **Locomoción base del Microduck en entornos de laboratorio**: cargar la política en el slot `walk` permite al robot desplazarse de forma continua sin intervención, lo que sirve como punto de partida para experimentos de navegación y para validar la cadena de despliegue `robotctl` → ONNX → actuadores.
- **Investigación en ajuste evolutivo sobre políticas de RL**: el linaje documentado (checkpoint base, wrapper de ritmo, pulido con evolution strategies en CPU) constituye un caso reproducible para estudiar cómo el refinamiento evolutivo afecta a la robustez frente a ruido de acción en robots de bajo coste.
- **Pruebas de robustez y evaluación comparativa de políticas**: al existir variantes hermanas del mismo autor (por ejemplo `songkran-duck_7214`), la política sirve para comparar el efecto de distintas rondas de selección bajo ruido sobre el mismo robot y tarea.
- **Demostraciones educativas de robótica open source**: el Microduck se comercializa a 399 USD y la política se carga con un único comando, lo que facilita talleres y cursos donde se muestra el ciclo completo de entrenamiento por refuerzo hasta el despliegue en hardware.
- **Banco de pruebas de comportamiento reactivo**: el frenado en giros y la congelación ante el "gigante" permiten estudiar respuestas condicionales simples en un robot real sin necesidad de infraestructura de cómputo pesada, ya que la inferencia ONNX corre en el propio robot o en un equipo de gama baja.
- **Integración en pipelines de investigación con `microduck_rl`**: la referencia explícita al repositorio, rama y commit permite reproducir el entorno de entrenamiento y reutilizar la política como inicialización para nuevas tareas (por ejemplo, otros slots o comportamientos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, velocidad de marcha, consumo energético ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio ocupa 0.0 GB, lo que sugiere un modelo de muy pocos parámetros; la inferencia ONNX de una política de control a 50 Hz es típicamente viable en CPU.
- **GPU recomendadas**: no se especifican. Por el tamaño del artefacto, no se requiere GPU dedicada; una CPU moderna debería bastar para inferencia en tiempo real.
- **Compatibilidad con GPU de consumo**: previsiblemente sí (cualquier GPU de consumo puede ejecutar un ONNX de este tamaño), aunque no hay datos publicados que lo confirmen.
- **Opciones de despliegue**: `robotctl` del daemon de Microduck (`sudo robotctl policy load walk DenRakEiw/microduck-songkran-duck_7159`); ONNX Runtime para inferencia genérica; el repositorio `pollen-robotics/microduck_rl` para reentrenamiento.
- **Latencia y throughput**: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz, que fija un presupuesto de 20 ms por ciclo.

## Comparativa con modelos similares

| Modelo | Tipo | Slot | Observacion / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `DenRakEiw/microduck-songkran-duck_7159` | Política RL + ES, ONNX | walk | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| `DenRakEiw/microduck-songkran-duck_7214` | Política RL + ES, ONNX | walk (presumible) | no disponible | no disponible | no disponible | Hugging Face |
| Políticas oficiales de `pollen-robotics/microduck_rl` | Políticas RL de referencia | varios | no disponible | no disponible | no disponible | Repositorio GitHub |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no declara licencia, lo que impide determinar si el uso comercial está permitido. No debe asumirse permiso de uso en producción sin consultar al autor.
- **Documentación mínima**: no se detallan la topología de la red, la composición de las 61 observaciones, el número de parámetros ni el proceso exacto de selección evolutiva, lo que dificulta la auditoría y la reproducibilidad completa.
- **Ausencia de benchmarks**: no hay métricas de éxito, robustez fuera de distribución ni comparaciones con políticas de referencia; el rendimiento real en el robot solo puede verificarse empíricamente.
- **Comportamiento dependiente del entorno**: la política fue seleccionada bajo ruido de acción pequeño y condiciones específicas de entrenamiento; su generalización a terrenos, cargas o perturbaciones no evaluadas es incierta.
- **Riesgo de fallo físico**: al ser una política perpetua de locomoción, errores de inferencia o desviaciones del entorno esperado pueden provocar caídas o daños al robot; se recomienda supervisión y parada de emergencia durante las primeras ejecuciones.
- **Sin sesgos lingüísticos ni de alucinación aplicables**: no es un modelo de lenguaje; los riesgos relevantes son de control y seguridad física, no de contenido.
- **Artefacto de nicho**: 0 descargas y 0 likes indican ausencia de validación por parte de la comunidad; trátese como un experimento personal del autor, no como una política de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck_7159
- Variante hermana: https://huggingface.co/DenRakEiw/microduck-songkran-duck_7214
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `denrakeiw-070`, commit `97e2b1fe2`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Artículo sobre el lanzamiento comercial del Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
