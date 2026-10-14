# juicenv/microduck-roller-es2

## Resumen

`juicenv/microduck-roller-es2` es una política de control (policy) para el robot bípedo Microduck de Pollen Robotics, especializada en desplazamiento sobre ruedas («rollers»). No es un modelo de lenguaje: es un artefacto de robótica orientado a locomoción, publicado por el usuario juicenv (Jarrod Pflum) como un ajuste fino del modelo de referencia `pollen-robotics/microduck-roller-sprint-2m-reference`. El pipeline declarado en HuggingFace es `robotics` y la librería asociada es `microduck`.

La política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y se describe como «perpetua»: una vez cargada, genera una marcha continua hasta que se le indique lo contrario. El entrenamiento se realizó mediante estrategias evolutivas (evolution strategies) sobre el scorer de rollers propio de la Arena de Microduck, con verificación declarada en x86. El resultado se exporta como `policy.onnx`, con el normalizador de observaciones embebido, de modo que el consumidor debe alimentar observaciones en crudo.

Su relevancia es acotada pero concreta: se trata de una política lista para desplegar en hardware real mediante el comando `robotctl policy load`, dentro del ecosistema de intercambio de políticas MicroduckHub. El repositorio tiene 0 descargas y 0 likes, y ocupa 0.0 GB, lo que indica un artefacto muy reciente y de tamano reducido, sin validación comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control por refuerzo exportada a ONNX; topología interna (capas, activaciones) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la política opera paso a paso con una observación de 61 dimensiones por inferencia |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx`); no se documentan variantes cuantizadas |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Robot objetivo | Microduck (robot bípedo de Pollen Robotics) sobre rollers |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Comportamiento temporal | perpetuo (la marcha se ejecuta hasta recibir orden de parada) |
| Modelo base | pollen-robotics/microduck-roller-sprint-2m-reference (relación: finetune) |
| Libreria | microduck |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no detalla la topología de la red (número de capas, anchura, tipo de activación). Lo que sí se especifica es la interfaz funcional: 61 entradas de observación y 14 salidas de acción, evaluadas a 50 Hz, con el normalizador de observaciones integrado dentro de `policy.onnx`. Esto implica que el consumidor no debe preprocesar las observaciones, sino alimentarlas directamente. El artefacto se acompaña de un `manifest.json` que sigue el esquema 2 definido en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento parte de la política de referencia `pollen-robotics/microduck-roller-sprint-2m-reference` y se ajusta mediante estrategias evolutivas, no mediante gradiente de política estándar. La función de fitness empleada es el scorer de rollers propio de la Arena de Microduck, y la card afirma verificación en x86. El entrenamiento se realizó sobre el repositorio `pollen-robotics/microduck_rl` (rama `lean`, commit `5a3636302`). No se publican número de tokens, episodios, población de la estrategia evolutiva, composición del dataset ni detalles de recompensa.

## Capacidades

- Generación de marcha sobre rollers para el robot Microduck, con política perpetua que se mantiene activa hasta recibir una orden de parada.
- Inferencia a 50 Hz, adecuada para control en tiempo real del robot.
- Consumo de observaciones en crudo: el normalizador está embebido en el ONNX, lo que elimina una etapa de preprocesado en el lado del cliente.
- Carga directa en una ranura de política del daemon mediante `robotctl policy load <slot> juicenv/microduck-roller-es2`.
- Compatibilidad con el ecosistema MicroduckHub de intercambio de políticas.
- Punto de partida para ajustes finos posteriores sobre la tarea de roller skating.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling ni razonamiento multi-paso: ninguna de esas capacidades aplica a este tipo de artefacto.

## Casos de uso

- Demostración de locomotion learning en robótica: cargar la política en un Microduck físico para mostrar una marcha sobre ruedas entrenada por refuerzo, útil en laboratorios docentes y ferias técnicas.
- Participación en la Arena de MicroduckHub: la política se ajustó precisamente contra el scorer de rollers de la Arena, por lo que es candidata directa a competir o a compararse contra otras políticas del catálogo.
- Base para ajuste fino de nuevas marchas: al derivar por finetune de una referencia de sprint, sirve como punto de partida para evolucionar variantes (giros, cambios de velocidad, superficies distintas) con el mismo pipeline de evolution strategies.
- Validación sim-to-real: permite contrastar en hardware real una política entrenada en entornos `microduck_rl` (mjlab) y verificar la transferencia declarada en x86.
- Benchmarking interno de políticas: al ser una política perpetua con interfaz fija (61-D observación, 14 acciones, 50 Hz), se puede enfrentar contra otras políticas del mismo esquema en condiciones controladas.
- Automatización de rutinas de mantenimiento o vigilancia en interiores sobre superficie lisa, usando la marcha continua como desplazamiento base para el robot.
- Integración en pipelines de robótica como componente de control sustituible: al ser un ONNX con manifiesto versionado, encaja en despliegues donde la política se intercambia por ranura sin recompilar el daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única afirmación de rendimiento de la model card es que el ajuste está «verificado en x86». No hay cifras de recompensa, velocidad de avance, estabilidad, tasa de caídas ni comparación cuantitativa contra la política de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto (`policy.onnx`) tiene entradas de 61 dimensiones y salidas de 14, por lo que el coste de inferencia es bajo, pero no se publican cifras de memoria ni de cómputo.
- GPU recomendadas: no disponible para inferencia; el despliegue previsto es sobre el propio robot a través del daemon `microduck`, no sobre una GPU de datacenter.
- Encaje en GPU de consumo: no aplica como requisito, dado que la política se ejecuta en el robot y no como modelo de servidor.
- Entrenamiento: se realizó con el repositorio `pollen-robotics/microduck_rl` (entornos mjlab). Requisitos concretos de GPU para reentrenar: no disponibles.
- Opciones de despliegue: `robotctl policy load <slot> juicenv/microduck-roller-es2` sobre el daemon microduck, con el runtime ONNX correspondiente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato temporal publicado es la frecuencia de control de 50 Hz (periodo de 20 ms por paso de control).

## Comparativa con modelos similares

| Modelo | Tipo | Interfaz | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-roller-es2 | Política de locomotion (finetune por evolution strategies) | 61-D observación, 14 acciones, 50 Hz | ONNX + manifest | no disponible | 0 descargas, 0 likes |
| pollen-robotics/microduck-roller-sprint-2m-reference | Política de referencia de roller sprint | no disponible | no disponible | no disponible | modelo base del anterior |
| juicenv/duckwing-v80-roller-skating | Política de roller skating del mismo autor | no disponible | no disponible | no disponible | publicado por juicenv |

No se dispone de datos de parámetros, contexto, rendimiento ni licencia de las alternativas, por lo que la comparación cuantitativa no es posible con la información disponible.

## Limitaciones y advertencias

- Licencia no disponible: sin términos explícitos, el uso comercial queda en una zona legal indeterminada y no debería asumirse permitido.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de funcionamiento en hardware real.
- Especialización estrecha: la política está entrenada para desplazamiento sobre rollers con el Microduck. No es transferible a otros robots, otras morfologías ni tareas distintas sin reentrenamiento.
- Riesgo de sobreajuste al scorer de la Arena: al optimizarse contra una función de fitness concreta, el comportamiento puede explotar particularidades de esa métrica y no generalizar a condiciones fuera de ella.
- Sin datos de robustez: no se documentan tasas de caída, comportamiento ante superficies irregulares, pendientes, empujes externos o degradación del hardware.
- Interfaz rígida: 61 dimensiones de observación y 14 de acción a 50 Hz implican acoplamiento fuerte con una versión concreta del firmware y del manifiesto de políticas.
- Comportamiento perpetuo: la marcha continúa hasta recibir una orden de parada, lo que exige mecanismos de seguridad externos en despliegues reales.
- Idiomas: no aplica. Cualquier expectativa de procesamiento de lenguaje o de texto queda fuera del alcance del modelo.
- Repositorio de 0.0 GB y sin pesos alternativos: no hay variantes cuantizadas ni formatos adicionales para inspección o despliegue alternativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-roller-es2
- Modelo base: https://huggingface.co/pollen-robotics/microduck-roller-sprint-2m-reference
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Entornos de entrenamiento RL (mjlab): https://github.com/pollen-robotics/microduck_rl
- Modelos compatibles con la librería microduck en HuggingFace: https://huggingface.co/models?library=microduck
- MicroduckHub, explorador de políticas de la comunidad: https://microduckhub.com/
- Perfil del autor en HuggingFace: https://huggingface.co/juicenv
