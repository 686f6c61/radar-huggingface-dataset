# DenRakEiw/microduck-songkran-duck_7199

## Resumen

`microduck-songkran-duck_7199` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot bípedo open source Microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de una red neuronal de política (policy) exportada a ONNX que traduce observaciones del robot en comandos de actuación a 50 Hz. El autor, DenRakEiw, la publica bajo el identificador `DenRakEiw/microduck-songkran-duck_7199` con la etiqueta de slot `walk`, lo que indica que ocupa la ranura de marcha del sistema de control del robot.

El modelo resuelve un problema concreto de robótica: generar una marcha bípeda estable y perpetua a partir de observaciones proprioceptivas y de entorno. Según la model card, la política deriva de una red de carrera («sprint race net») reentrenada para detenerse ante la presencia de un «gigante» y frenar en su turno, con un envoltorio de ritmo fijo que fija una velocidad longitudinal de 0,65 m/s en verde y 0 m/s en rojo. La observación es de 61 dimensiones y la acción de 14 dimensiones.

La relevancia es acotada pero específica: se enmarca en el ecosistema Microduck, un bípedo de 25 cm con 15 motores, cámara, LiDAR y pico prensil, orientado a experimentación en IA física y transferencia sim-a-real. El repositorio es de tamaño 0.0 GB, sin descargas ni likes en el momento de la consulta, y no dispone de licencia declarada ni de idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX; topología de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, dimensiones ocultas, tipo de activación ni si emplea memoria recurrente). Lo que sí se documenta es la interfaz: una observación de 61 dimensiones, 14 acciones y una frecuencia de control de 50 Hz, con un normalizador de observaciones integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw-070`, commit `97e2b1fe2`. La model card describe el proceso como un reentrenamiento de una red de carrera propia («Sock Heist») para congelarse ante la presencia del «gigante» y aprender a frenar en el turno de este (`hr2b-brake`, checkpoint 1575), envuelta en un wrapper de ritmo fijo. Se menciona entrenamiento «con energía solar», un detalle sin repercusión técnica documentada. No se especifican número de tokens, composición del dataset, ni si hubo RLHF o DPO; en robótica de refuerzo estos conceptos no aplican del mismo modo y no se aportan métricas de recompensa ni curvas de entrenamiento.

## Capacidades

- Generación de marcha bípeda perpetua para el slot `walk` del Microduck: la política se ejecuta de forma continua hasta recibir una orden de parada.
- Control a 50 Hz con 14 acciones y 61 dimensiones de observación.
- Regulación de velocidad longitudinal mediante envoltorio de ritmo: 0,65 m/s en estado verde y 0 m/s en estado rojo.
- Comportamiento de parada ante la presencia del «gigante» (objeto o entidad de referencia del entorno de entrenamiento).
- Comportamiento de frenado en el turno del «gigante» (checkpoint `hr2b-brake`).
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el daemon.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento; no aplican a una política motriz.

## Casos de uso

- Despliegue directo en robot físico: cargar la política con `sudo robotctl policy load walk DenRakEiw/microduck-songkran-duck_7199` en el daemon de Microduck, aprovechando que el normalizador está embebido en el ONNX.
- Experimentación en IA física: usar la política como línea base de marcha para comparar con otras políticas del mismo slot y evaluar estabilidad y velocidad en hardware real.
- Investigación en transferencia sim-a-real: emplear el checkpoint y la rama de entrenamiento (`denrakeiw-070`, commit `97e2b1fe2`) como punto de partida reproducible para estudiar la brecha entre simulación y robot.
- Demostraciones educativas: mostrar una marcha bípeda perpetua en talleres con Microduck, con la ventaja de que la política no requiere parada por diseño.
- Pruebas de seguridad y parada: validar el comportamiento de congelación y frenado ante el «gigante» como caso de estudio de respuestas reactivas en robótica.
- Integración en pipelines de evaluación de políticas: cargar `policy.onnx` en un runner compatible con ONNX para medir latencia y throughput de inferencia a 50 Hz antes de desplegar en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la topología de la red no se documenta, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible. Al ser una política de control a 50 Hz con observación de 61 dimensiones, es plausible que se ejecute en CPU del propio robot, pero esto no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el mecanismo documentado es `robotctl policy load` sobre el daemon de Microduck; al ser ONNX, es técnicamente portable a runtimes ONNX, pero no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el único dato de frecuencia es la tasa de control de 50 Hz.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del ecosistema Microduck ni modelos comparables de la misma categoría (políticas de marcha bípeda para robots de 25 cm), por lo que no es posible establecer una comparación con datos verificables.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- Sin métricas de rendimiento: no hay benchmarks, curvas de recompensa ni tasas de éxito publicadas, lo que impide evaluar la calidad de la marcha antes de probarla en hardware.
- Topología y tamaño desconocidos: no se puede estimar coste computacional ni requisitos de memoria a partir de la información disponible.
- Comportamiento dependiente del entorno de entrenamiento: la política está condicionada a la noción de «gigante» y a estados verde/rojo del envoltorio de ritmo; su generalización a entornos distintos no está documentada.
- Riesgo de fallo en hardware real: al ser una política de RL transferida, puede presentar inestabilidad ante condiciones no vistas (terrenos, cargas, desgaste de motores), sin que se documenten mitigaciones.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación comunitaria.
- Sin soporte multilingüe ni de texto: no debe confundirse con un modelo de lenguaje; no procesa instrucciones en lenguaje natural.
- Fecha de creación futura (2026-11-06): conviene verificar la integridad y vigencia del artefacto antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck_7199
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `denrakeiw-070`, commit `97e2b1fe2`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Página oficial de Microduck: https://pollen-robotics.com/microduck/
- Repositorio de Microduck en GitHub: https://github.com/pollen-robotics/microduck
- Artículo sobre el lanzamiento de Microduck: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
