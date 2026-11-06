# dadudu/microduck-bubu-tug-remix5

## Resumen

`dadudu/microduck-bubu-tug-remix5` es una política de control motriz para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: es un modelo de reinforcement learning exportado a ONNX que genera comandos de locomoción a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones. Se publica como un *remix* (fine-tune) del modelo `jrubiosainz/microduck-tug-lphat-c2-s1s5`, entrenado originalmente para la tarea de "tug of war" (tiro de cuerda) en la arena de competición del proyecto.

El modelo se enmarca en la categoría `microduck-slot:walk`, es decir, ocupa la ranura de marcha del daemon de control del robot, y se describe como una política "perpetua": ejecuta la marcha de forma continua hasta que se le indique lo contrario. El autor reporta una altura de referencia de aproximadamente 166,574 cm (presumiblemente un error de unidades en la model card; lo habitual sería 16,6574 cm o 166,574 mm), dato que conviene verificar antes de desplegarlo.

La relevancia es acotada pero clara: se trata de un artefacto de robótica de bajo nivel, con licencia no especificada, cero descargas y sin idiomas declarados, orientado a quien ya opera un microduck y quiere una política de marcha lista para cargar mediante `robotctl`. No aporta capacidades de texto, visión ni razonamiento; su utilidad es exclusivamente cinemática.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (red neuronal exportada a ONNX); arquitectura interna no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`; no se documentan variantes) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación / acción | 61 observaciones / 14 acciones |
| Ranura de política | `walk` |
| Modelo base | `jrubiosainz/microduck-tug-lphat-c2-s1s5` (commit `46d9c196`) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `main`, commit `a3e0c0fbe` |
| Tamaño del repositorio | 0,0 GB (según Hugging Face; probablemente redondeado) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de capa recurrente o feed-forward). Lo que sí se documenta es el contrato de interfaz: 61 valores de observación de entrada, 14 acciones de salida y una frecuencia de 50 Hz, con el normalizador de observaciones embebido dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El modelo se distribuye con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon de microduck.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `a3e0c0fbe`) mediante reinforcement learning, partiendo del modelo `jrubiosainz/microduck-tug-lphat-c2-s1s5` en el commit `46d9c196`. No se especifican el algoritmo de RL, el número de pasos de entorno, la composición del dataset ni si hubo etapas de ajuste adicionales. El autor cita como créditos a jrubiosainz, lphatnguyen, rumezhak, a1rb4Ck y Pollen Robotics, lo que sugiere una cadena de derivaciones sobre políticas previas del ecosistema microduck. La etiqueta `perpetual` indica que la política no tiene condición de terminación propia: mantiene la marcha indefinidamente.

## Capacidades

- Locomoción continua del robot microduck en la ranura `walk`, con generación de 14 acciones de control a 50 Hz.
- Política "perpetua": no finaliza por sí misma, sino que continúa ejecutando la marcha hasta que el operador o el daemon la detengan o la sustituyan.
- Integración directa con el daemon de microduck mediante `robotctl policy load walk <repo>`, sin necesidad de preprocesar observaciones (normalizador embebido).
- Compatibilidad con el manifiesto de políticas esquema 2, lo que permite cargarla junto con otras políticas en ranuras distintas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo "thinking"; no es un modelo generativo de texto.
- No se documentan capacidades de adaptación a terreno, escalada o recuperación de caídas más allá de lo que la política base pudiera haber aprendido.

## Casos de uso

- **Demostración de marcha en un microduck físico**: cargar la política con `robotctl policy load walk dadudu/microduck-bubu-tug-remix5` y dejar que el robot camine de forma continua en un entorno controlado; es el caso de uso canónico y el único documentado explícitamente por el autor.
- **Participación en la arena de tug of war**: al derivar del modelo `microduck-tug-lphat-c2-s1s5`, entrenado para la prueba de tiro de cuerda, sirve como punto de partida para experimentar con empuje y tracción en competiciones del ecosistema microduck.
- **Base para nuevos fine-tunes**: al estar publicado con `base_model_relation: finetune`, puede reutilizarse como inicialización en el repositorio `pollen-robotics/microduck_rl` para entrenar variantes con recompensas distintas (velocidad, estabilidad, terreno irregular).
- **Evaluación comparativa de políticas de marcha**: permite contrastar el comportamiento de esta política frente a otras del mismo slot `walk` en el mismo hardware, midiendo deriva, consumo o suavidad de la marcha.
- **Pruebas de integración del daemon**: útil para validar el pipeline `robotctl` y el esquema 2 del manifiesto en un robot real o en simulación antes de desplegar políticas propias.
- **Investigación en RL aplicado a robótica de bajo coste**: como artefacto abierto (aunque sin licencia declarada) para estudiar la transferencia sim-a-real en cuadrúpedos pequeños de Pollen Robotics.
- **Docencia y talleres**: ejemplo práctico de política ONNX con normalizador embebido y contrato de observación/acción fijo, adecuado para explicar el despliegue de políticas de RL en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito, distancia recorrida, estabilidad ni comparaciones cuantitativas con otras políticas del ecosistema microduck.

## Requisitos de hardware

- **VRAM estimada**: no disponible; al tratarse de una política de 61 entradas y 14 salidas exportada a ONNX, la huella es previsiblemente de pocos megabytes y puede ejecutarse en CPU, pero no se documenta el tamaño exacto ni el coste de inferencia.
- **GPU recomendadas**: no disponibles. Por la naturaleza del modelo (control a 50 Hz), no requiere GPU dedicada; una CPU moderna del propio robot o del host de control debería bastar.
- **Compatibilidad con GPU de consumo**: no aplica en la práctica; cualquier iGPU o CPU reciente es suficiente para un modelo de esta escala.
- **Opciones de despliegue**: ONNX Runtime a través del daemon de microduck (`robotctl`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- **Latencia y throughput**: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms), que marca el presupuesto máximo por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Ranura | Licencia | Relación |
|---|---|---|---|---|---|---|
| `dadudu/microduck-bubu-tug-remix5` | Política RL (ONNX) | 61 / 14 | 50 Hz | `walk` | no disponible | Este modelo |
| `jrubiosainz/microduck-tug-lphat-c2-s1s5` | Política RL (ONNX) | no disponible en la información | no disponible | no disponible | no disponible | Modelo base directo |
| Otras políticas del ecosistema microduck | Política RL (ONNX) | variable | 50 Hz (por convención del daemon) | variable | variable | No disponibles en la información |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas como para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- **Licencia no declarada**: no se especifica licencia alguna, lo que impide determinar si el uso comercial está permitido. Antes de cualquier despliegue en producción es imprescindible contactar con el autor o con los titulares de los derechos de la cadena de modelos base.
- **Cero adopción verificable**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- **Datos de altura sospechosos**: la model card indica "~166.574 cm", una magnitud incompatible con un cuadrúpedo de sobremesa; probablemente se trate de un error de unidades. Verificar antes de usar como referencia de altura de marcha.
- **Sin información sobre sesgos**: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero sí posibles sesgos de simulación (sobreajuste al entorno de entrenamiento, dinámica del simulador) que no se documentan.
- **Riesgo de fallo físico**: una política de locomoción mal validada puede provocar caídas, sobrecalentamiento de actuadores o daños mecánicos en el robot. Probar primero en simulación o con el robot suspendido.
- **Sin condición de terminación**: la naturaleza "perpetua" de la política implica que el operador debe implementar sus propios mecanismos de parada y supervisión.
- **Documentación mínima**: no se detallan hiperparámetros, algoritmo de RL, distribución de recompensas ni composición del dataset de entrenamiento, lo que dificulta la reproducibilidad.
- **Idiomas y contexto**: no aplica; no es un modelo de texto. Cualquier expectativa de generación de lenguaje, razonamiento o tool calling es infundada.
- **Dependencia del daemon**: el manifiesto sigue el esquema 2; versiones antiguas del daemon podrían no cargarla correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dadudu/microduck-bubu-tug-remix5
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-lphat-c2-s1s5
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `a3e0c0fbe`); no se proporciona URL directa en la información disponible
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se proporciona URL directa en la información disponible
