# dashi/microduck-roller-daily-20261115

## Resumen

`dashi/microduck-roller-daily-20261115` es una política de control robótico entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política de comportamiento ("gait") que ocupa el slot `walk` del firmware del robot y produce comandos de actuación a partir de observaciones proprioceptivas. El autor la publica como reentrada diaria ("daily re-entry") de una política previa, `microduck-roller-remix-r900`, con una puntuación de 0,900.

La política opera sobre ruedas (rollers), con una observación de 61 dimensiones, 14 acciones de salida y una frecuencia de control de 50 Hz. Es una política "perpetua": una vez cargada, el robot ejecuta la marcha de forma continua hasta que se le indique lo contrario. Se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El repositorio es de tamaño despreciable (0,0 GB) y no registra descargas ni interacciones en el momento de la consulta.

Su relevancia es acotada pero clara para quien trabaja con microduck: ofrece una política lista para desplegar mediante el comando `robotctl policy load walk`, con un manifiesto que sigue el esquema 2 del daemon de políticas. Es un artefacto de robótica aplicada, no un modelo fundacional, y su evaluación debe hacerse en términos de estabilidad de la marcha y robustez, no de benchmarks de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; arquitectura de red no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Otros datos operativos: 14 acciones de salida, frecuencia de control de 50 Hz, slot de firmware `walk`, normalizador de observaciones embebido en el ONNX.

## Arquitectura y entrenamiento

La model card no describe la topología de la red neuronal (número de capas, tipo de encoder, dimensiones ocultas). Lo que sí se documenta es el pipeline de entrenamiento: repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. Se trata, por tanto, de un entrenamiento de RL sobre el simulador/herramientas de microduck, orientado a una marcha sobre ruedas ("roll-backward" sugiere una política de rodadura hacia atrás o un currículo de entrenamiento con retroceso). La política se deriva por fine-tuning de `DenRakEiw/microduck-senate_duck_0904`, según el campo `base_model_relation: finetune`.

La innovación práctica no está en la arquitectura sino en el empaquetado: el normalizador de observaciones va "horneado" dentro del grafo ONNX, lo que elimina una fuente habitual de errores de integración (desajustes entre la normalización del entrenamiento y la del despliegue). El manifiesto sigue el esquema 2 del daemon, lo que permite cargar la política con un solo comando y sin pasos de conversión. No se documentan datos sobre número de pasos de entrenamiento, composición del dataset, recompensas ni uso de RLHF/DPO (conceptos, por otra parte, ajenos a este dominio).

## Capacidades

- Generación de una marcha continua sobre ruedas para el robot microduck, en el slot `walk`.
- Control a 50 Hz a partir de observaciones proprioceptivas de 61 dimensiones.
- Emisión de 14 comandos de acción por paso de control.
- Comportamiento "perpetuo": la política se ejecuta de forma indefinida hasta que se detiene explícitamente.
- Autocontenida en un único fichero ONNX con normalización integrada, lo que simplifica la integración en el daemon.
- Carga declarativa mediante manifiesto (esquema 2) y el comando `robotctl policy load walk`.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modos de pensamiento: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Despliegue inmediato de una marcha funcional en un microduck con ruedas: cargar la política con `robotctl policy load walk dashi/microduck-roller-daily-20261115` y dejar que el robot ruede de forma continua; adecuado para demos y validación rápida del hardware.
- Base para fine-tuning propio: al ser un fine-tune de `DenRakEiw/microduck-senate_duck_0904` y estar entrenada con `pollen-robotics/microduck_rl`, sirve como punto de partida para adaptar la marcha a una superficie, carga o configuración de ruedas distintas.
- Comparación de políticas en experiments de RL: al ser una "re-entry" de una política con puntuación 0,900, permite contrastar variantes diarias y medir deriva de rendimiento entre reentrenamientos.
- Pruebas de integración del daemon de políticas: útil para validar el esquema 2 de manifiestos, la carga por slot y el pipeline ONNX en un robot real o en banco de pruebas.
- Docencia y prototipado en robótica de bajo coste: un artefacto pequeño y autocontenido que ilustra el ciclo completo sim-to-real (entrenamiento en `microduck_rl`, exportación ONNX, despliegue en robot).
- Evaluación de robustez de la rodadura: ejecutar la política de forma perpetua en distintas condiciones para caracterizar estabilidad, consumo y comportamiento ante perturbaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona que la política es una reentrada de `dashi/microduck-roller-remix-r900` con una puntuación de 0,900, sin especificar la métrica ni el protocolo de evaluación empleados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la política se ejecuta en el ordenador de a bordo del microduck, no en GPU de servidor.
- GPU recomendadas: no aplica para el despliegue previsto; la inferencia ONNX a 50 Hz está pensada para la CPU del robot.
- ¿Cabe en GPU de consumo? Sí, con toda probabilidad, dado el tamaño despreciable del artefacto, aunque no se documentan requisitos formales.
- Opciones de despliegue: runtime ONNX dentro del daemon de microduck, cargado con `robotctl policy load walk`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas de LLM, no aplicables).
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Relación | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261115` | Política RL (ONNX) para microduck | Este modelo | no disponible | no aplica (obs. 61-D) | no disponible | HF |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL para microduck | Modelo base (fine-tune) | no disponible | no aplica | no disponible | HF |
| `dashi/microduck-roller-remix-r900` | Política RL para microduck | Política de origen de la reentrada (0,900) | no disponible | no aplica | no disponible | HF |

No se dispone de datos de benchmarks ni de especificaciones de arquitectura de las alternativas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia no está disponible: no puede asumirse uso comercial sin verificar los términos con el autor.
- Es una política específica para microduck sobre ruedas; no es transferible a otros robots ni a configuraciones sin rollers sin reentrenamiento.
- El comportamiento es perpetuo por diseño: requiere un mecanismo externo para detener la marcha; no incluye lógica de parada de seguridad documentada.
- No hay datos publicados de robustez, estabilidad ante perturbaciones, consumo energético ni tasa de fallos; la puntuación de 0,900 carece de definición de métrica en la información disponible.
- El repositorio registra 0 descargas y 0 likes, y el tamaño es de 0,0 GB: conviene verificar la integridad de los artefactos antes de desplegar.
- La ausencia de especificación de arquitectura y de parámetros impide auditar la política o estimar su coste computacional a priori.
- No aplica riesgo de alucinación ni sesgos lingüísticos por no ser un modelo de lenguaje; el riesgo relevante es de comportamiento físico imprevisto en el robot.
- El entrenamiento se documenta en la rama `roll-backward`, lo que sugiere una dirección de marcha concreta; verificar que coincide con el uso previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261115
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciada en la model card, sin URL directa disponible)
