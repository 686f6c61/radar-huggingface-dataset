# DenRakEiw/microduck-c-3pduck_0976

## Resumen

c-3pduck_0976 es una política de control para el robot Microduck publicada por el usuario DenRakEiw en HuggingFace. No es un modelo de lenguaje ni un modelo generativo de propósito general: se trata de un fichero ONNX (`policy.onnx`) que mapea observaciones de 61 dimensiones en 14 acciones de control, ejecutándose a 50 Hz. La política está diseñada como un gait perpetuo que se asigna a la ranura `walk` del robot y se ejecuta de forma indefinida hasta recibir una orden de parada.

La model card la describe como una política de modo carrera orientada al objetivo "1.5 m Hill Climb", ajustada mediante estrategias de evolución (evolution strategies) sobre el *hill scorer* del Arena. El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`. El normalizador de observaciones está integrado dentro del propio grafo ONNX, por lo que el consumidor debe alimentar observaciones sin procesar.

Su relevancia es acotada y muy específica: es un artefacto de despliegue para robótica de locomoción, no un modelo fundacional. En el momento de redactar esta ficha acumula 0 descargas y 0 likes, no declara licencia y no publica arquitectura interna, número de parámetros ni resultados numéricos de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control exportada a ONNX; topología interna (capas, anchura, tipo de red) no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación fija de 61 dimensiones, sin memoria de largo plazo declarada |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) junto con `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Entrada | 61 dimensiones (observación cruda, normalizador integrado en el grafo) |
| Salida | 14 acciones |
| Frecuencia de control | 50 Hz |
| Ranura de política | `walk` |
| Comportamiento temporal | perpetuo (se ejecuta hasta recibir orden de parada) |
| Tamaño del repositorio | 0.0 GB (según metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-13 / 2026-10-13 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red: solo se indica que el resultado es una política exportada a ONNX que consume 61 dimensiones de observación y produce 14 acciones a 50 Hz. Al ser un controlador de locomoción con observaciones crudas y sin estado explícito documentado, lo previsible es una red feed-forward de tamaño reducido, pero no se confirma ni el número de capas, ni las unidades por capa, ni el número total de parámetros. Tampoco se especifica si existe componente recurrente o memoria interna.

En cuanto al entrenamiento, la model card indica dos fases: un aprendizaje por refuerzo base y un ajuste posterior mediante estrategias de evolución sobre el *hill scorer* del Arena, en el contexto de un modo carrera de subida de colinas de 1.5 m. El repositorio y la revisión exacta del código de entrenamiento están identificados (`pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`), pero no se publican el número de pasos de entorno, la composición del simulador, la función de recompensa ni los hiperparámetros. El normalizador de observaciones está embebido en `policy.onnx`, lo que implica que el despliegue debe enviar observaciones sin normalizar.

## Capacidades

- Generación de acciones de control continuas a 50 Hz para la ranura de locomoción `walk`.
- Ejecución perpetua: el gait se mantiene activo de forma indefinida hasta que se le ordena lo contrario.
- Locomoción orientada a un objetivo concreto declarado: subida de colinas de 1.5 m en modo carrera, según el criterio de puntuación del Arena.
- Integración directa con el daemon del robot mediante el comando `robotctl policy load walk DenRakEiw/microduck-c-3pduck_0976`.
- Autocontención del preprocesado: el normalizador está integrado en el propio ONNX.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de texto, de código, de matemáticas ni de visión.
- No dispone de modo de razonamiento (*thinking*), audio ni ninguna otra modalidad distinta del control motor.

## Casos de uso

- Locomoción en terreno con pendiente: la política está ajustada específicamente al criterio de subida de colinas, por lo que resulta adecuada para desplazar un Microduck por rampas o desniveles moderados en lugar de terreno plano.
- Competición de carreras en el Arena: al ser una política de "race mode" evaluada sobre el *hill scorer*, encaja como participante en pruebas cronometradas de ascenso dentro de ese entorno.
- Demostraciones de locomoción en robótica educativa: el comando de carga en una línea (`robotctl policy load walk ...`) permite mostrarla en talleres o clases sin pipeline adicional de conversión.
- Punto de partida para fine-tuning: al estar asociada a un repositorio y commit concretos de entrenamiento, sirve como inicialización para nuevas rondas de estrategias de evolución sobre otros criterios de puntuación.
- Estudio de sim-to-real: útil para analizar cómo se comporta una política entrenada en simulación y ajustada por evolución cuando se ejecuta en el hardware real mediante `robotctl`.
- Validación de un pipeline de despliegue ONNX en robótica: sirve como caso de prueba para verificar la carga de manifiestos (esquema 2), la integración del normalizador embebido y la frecuencia de control a 50 Hz.
- Comparación de gaits dentro de la misma ranura: permite alternar entre distintas políticas `walk` en el mismo robot para evaluar cuál se comporta mejor en una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona de forma cualitativa el objetivo "1.5 m Hill Climb" y el ajuste sobre el *hill scorer* del Arena, sin cifras de puntuación, tasa de éxito, tiempo de ascenso ni distancia media. Tampoco se aportan métricas de sim-to-real, consumo, latencia o estabilidad de la marcha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Se trata de una política de control de robótica embebida, no de un modelo de lenguaje, por lo que las cifras habituales de VRAM no son aplicables directamente.
- GPU recomendadas: no disponible; no se documenta requisito de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Ejecución en CPU: el formato de despliegue (ONNX consumido por el daemon `robotctl` del Microduck) apunta a inferencia en el propio robot o en un equipo de control, pero no se confirma el hardware objetivo ni el rendimiento medido.
- Opciones de despliegue: carga mediante el daemon `robotctl` (`robotctl policy load walk DenRakEiw/microduck-c-3pduck_0976`); inferencia ONNX estándar. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: la frecuencia de control declarada es de 50 Hz, lo que implica un presupuesto de 20 ms por ciclo, pero no se publican medidas reales de latencia, uso de CPU ni margen disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del ecosistema Microduck con las que comparar de forma cuantitativa. Los únicos elementos de referencia mencionados son el propio repositorio de entrenamiento y el sistema de puntuación del Arena, sin datos publicados de alternativas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DenRakEiw/microduck-c-3pduck_0976 | no disponible | no aplica (61-D de observación) | no disponible | no disponible | pública en HuggingFace, 0 descargas |
| Otras políticas del slot `walk` en microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución, lo que supone un riesgo legal en producción.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha implican que la política no ha sido contrastada por terceros.
- Especialización extrema: está ajustada a un objetivo concreto (subida de colinas de 1.5 m según el *hill scorer* del Arena) y a una única ranura (`walk`); su comportamiento fuera de ese escenario no está documentado.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo de texto. El riesgo equivalente es una marcha inestable o una caída, sin métricas publicadas de estabilidad ni de tasa de fallo.
- Brecha sim-to-real desconocida: no se documentan pruebas en hardware físico, robustez frente a perturbaciones, cambios de superficie o desgaste del robot.
- Falta de trazabilidad técnica: no se publican número de parámetros, arquitectura, hiperparámetros de entrenamiento ni detalles del simulador, lo que dificulta auditar o reproducir el resultado.
- Dependencia de versiones: el entrenamiento está ligado a una rama (`denrakeiw`) y un commit (`b76573f1a`) concretos del repositorio `microduck_rl`; cambios posteriores en ese repositorio pueden invalidar la reproducibilidad.
- Limitación de idioma y modalidad: al ser un controlador motor, no procesa texto, audio ni imagen, por lo que no es utilizable en tareas de lenguaje.
- Metadatos con señales de automatización: la creación y la última actualización distan solo 3 segundos y el tamaño del repositorio se reporta como 0.0 GB, lo que sugiere un proceso de subida automatizado y dificulta interpretar el contenido real del repositorio desde los metadatos.
- Sin memoria declarada: al indicarse que se alimentan observaciones crudas y no documentarse estado interno, no puede asumirse capacidad de planificación ni de razonamiento multi-paso.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-c-3pduck_0976
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado en la model card: `pollen-robotics/microduck_rl` (rama `denrakeiw`, commit `b76573f1a`); URL no disponible en la información proporcionada
- Documentación del manifiesto de políticas (`docs/policy-manifest.md`, esquema 2) en el repositorio del daemon: URL no disponible en la información proporcionada
