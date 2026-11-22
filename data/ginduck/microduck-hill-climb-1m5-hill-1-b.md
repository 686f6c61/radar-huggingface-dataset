# GinDuck/microduck-hill-climb-1m5-hill-1-b

## Resumen

`GinDuck/microduck-hill-climb-1m5-hill-1-b` es un checkpoint de política de control para el robot cuadrúpedo microduck de Pollen Robotics, entrenado mediante aprendizaje por refuerzo para la tarea de subida de una rampa (hill climb) de 1,5 metros. No es un modelo de lenguaje ni un modelo generativo multimodal: es una política de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX para su ejecución directa sobre el robot.

El modelo lo publica el usuario GinDuck como su primer experimento de escalada, entrenado con la receta estándar de Pollen antes de aplicar ningún ajuste fino. La model card indica que alcanzó la cima en las cinco pruebas realizadas, aunque con una marcha lenta en la rampa. Es una política de tipo *perpetual*: se ejecuta de forma continua hasta que se le indica lo contrario, y se carga en una ranura de política del daemon del robot mediante `robotctl`.

Su relevancia es acotada y experimental: sirve como referencia reproducible (semilla, commit y comando documentados) para quien quiera entrenar sus propias políticas de microduck con el framework `microduck-challenges`, y como ejemplo de despliegue de políticas RL en formato ONNX con normalizador de observaciones embebido. El repositorio no contiene pesos en formato safetensors ni GGUF, y no hay información sobre licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de control entrenada con RL; red neuronal, detalles no publicados) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, dimensiones ocultas, tipo de activaciones). Lo que sí se documenta es el pipeline de entrenamiento: se usó `mjlab-microduck 0.1.0` (commit base `1efd853be`) sobre el repositorio `pollen-robotics/microduck-challenges` (commit `dc73b9237`), con la tarea `Mjlab-HillClimb1m5-MicroDuck`. El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 3000 iteraciones y semilla 1, y el checkpoint publicado corresponde a la iteración 1250.

La política opera a 50 Hz con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que la política consume observaciones en crudo sin preprocesado externo. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción cuadrúpeda sobre terreno inclinado: ejecuta una marcha que asciende una rampa de 1,5 metros.
- Política *perpetual*: mantiene la marcha de forma continua hasta que se detiene o se sustituye.
- Control reactivo a partir de observaciones proprioceptivas de 61 dimensiones a 50 Hz.
- Despliegue directo en robot mediante `robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-1-b`.
- Inferencia autocontenida: normalización de observaciones incluida en el grafo ONNX.
- Compatible con el sistema de ranuras de política (policy slots) del daemon de microduck.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües.

## Casos de uso

- Evaluación de referencia en escalada: sirve como línea base para comparar políticas propias de subida de rampa entrenadas con `microduck-challenges`, ya que el autor documenta semilla, commit y comando exactos.
- Reproducción de experimentos RL: permite replicar el pipeline completo (`uv sync`, `uv run train ...`) para validar la infraestructura de entrenamiento antes de introducir modificaciones.
- Prueba de despliegue ONNX en robot: útil para verificar el flujo `robotctl policy load` y el funcionamiento del normalizador embebido en un caso real de locomoción.
- Docencia y demostración de RL aplicado a robótica: ejemplo mínimo y trazable de política de control entrenada con entornos paralelos masivos (4096) y publicada como artefacto reproducible.
- Validación de hardware y calibración: al ser una marcha lenta y estable según la model card, puede emplearse para comprobar sensores y actuadores del microduck en condiciones controladas de rampa.
- Punto de partida para *fine-tuning* o ajuste de recompensas: el checkpoint de la iteración 1250 puede servir como inicialización para experimentos posteriores del mismo autor o de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es cualitativa: el autor indica que la política alcanzó la cima en las cinco pruebas realizadas, con una marcha lenta en la rampa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere un artefacto ONNX muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas: no disponible para inferencia; para reentrenar, el comando documentado asume aceleración por GPU (el autor menciona que el RL en GPU no es bit-reproducible entre máquinas), sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución en el robot mediante `robotctl` y runtime ONNX; el entrenamiento se realiza con `uv` y el stack `microduck-challenges` / `mjlab-microduck`.
- Latencia y throughput: no disponibles; la política está diseñada para operar a 50 Hz, pero no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni checkpoints comparables con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenada exclusivamente para la tarea `Mjlab-HillClimb1m5-MicroDuck`; no se garantiza su comportamiento en otras tareas, terrenos o configuraciones del robot.
- El propio autor describe la marcha como lenta en la rampa; no es una política optimizada para velocidad.
- La validación se limita a cinco pruebas del autor; no hay evaluación independiente ni métricas cuantitativas publicadas.
- Licencia no disponible: no puede asumirse permiso para uso comercial ni redistribución.
- El entrenamiento no es bit-reproducible; los pesos no pueden regenerarse de forma idéntica.
- No hay información sobre sesgos, alucinación o limitaciones de idioma porque no es un modelo de lenguaje; esos criterios no aplican.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso por terceros.
- La model card incluye un enlace promocional externo ajeno al modelo; no debe interpretarse como documentación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-1-b
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Enlace promocional citado en la model card (no técnico): https://www.imundo.ch/quackpack/
