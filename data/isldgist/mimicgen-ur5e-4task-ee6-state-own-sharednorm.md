# isldgist/mimicgen-ur5e-4task-ee6-state-own-sharednorm

## Resumen

El repositorio `isldgist/mimicgen-ur5e-4task-ee6-state-own-sharednorm` contiene dos checkpoints del modelo pi0.5, un modelo de vision-language-action (VLA) desarrollado por el laboratorio ISL (isldgist). Este modelo resuelve el problema de control de manipulación robótica: a partir de observaciones visuales y comandos en lenguaje natural, genera acciones de posición y rotación del efector final de un brazo robótico UR5e. El repositorio está destinado a entornos de simulación generados con MimicGen y a su evaluación en el marco DART/OpenPI.

La particularidad de estos checkpoints es que la política utiliza únicamente el estado del efector final en 6 dimensiones (posición y rotación en eje-ángulo), eliminando la articulación de la pinza antes de la normalización y la tokenización. El repositorio incluye dos variantes: una con estadísticas de normalización calculadas exclusivamente sobre datos UR5e (`ownnorm`) y otra con estadísticas compartidas entre robots Panda y UR5e (`sharednorm`). Cada checkpoint contiene parámetros de inferencia, assets de normalización y metadatos del checkpoint Orbax, sin estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (visión-lenguaje-acción, basada en transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | Checkpoints Orbax (parámetros de inferencia, assets de normalización, metadatos) |

## Arquitectura y entrenamiento

Ambos checkpoints parten del modelo base pi0.5, una arquitectura VLA que combina percepción visual, comprensión de instrucciones y generación de acciones continuas. El proceso de entrenamiento consiste en un fine-tuning sobre 2,850 demostraciones de cuatro tareas de manipulación de MimicGen con un brazo UR5e: Square (950), Threading (950), Stack (475) y Stack Three (475).

El estado de la política se trunca a 6 dimensiones usando `TruncateState(state_dim=6)` antes de la normalización y la tokenización de estado discreto de pi0.5. Las acciones se representan en 7 dimensiones mediante el formato OSC_POSE: seis componentes de delta de posición y rotación más un comando de pinza. El horizonte de acción es de 10 pasos. Se realizaron 15,000 actualizaciones de optimizador con micro-batch de tamaño 8 y acumulación de gradientes de 8, resultando en un tamaño de lote efectivo de 64. Las variantes se diferencian en la normalización: `ownnorm` usa cuantiles calculados solo con UR5e, mientras que `sharednorm` usa cuantiles compartidos con datos de Panda y UR5e.

## Capacidades

- Generacion de acciones de control para un robot manipulador UR5e a partir de estados y observaciones visuales.
- Ejecucion de tareas de manipulacion en entornos de simulacion MimicGen: ensamblaje (Square), enhebrado (Threading) y apilamiento (Stack, Stack Three).
- Soporte de inferencia a traves de OpenPI con configuraciones especificas (`pi05_mimicgen_ur5e4_ee6_state_ownnorm_2850_15k` y `pi05_mimicgen_ur5e4_ee6_state_sharednorm_2850_15k`).
- Compatibilidad con el framework DART para servir la politica como endpoint HTTP.
- Normalizacion independiente o compartida segun la variante elegida.
- No incluye herramientas de tool calling, agentes conversacionales ni capacidades de audio o vision general.

## Casos de uso

- Investigacion en manipulacion robotica: usar estos checkpoints en el entorno LIBERO o en simulaciones MimicGen para evaluar politicas de control de bajo nivel.
- Fine-tuning para nuevas tareas: aprovechar los checkpoints como inicializacion para adaptar el modelo a tareas adicionales de manipulacion con un brazo UR5e mediante datos propios.
- Comparacion de estrategias de normalizacion: estudiar el efecto de estadisticas de normalizacion propias frente a compartidas en el rendimiento de la politica.
- Desarrollo de benchmarks de robotica: emplear estas variantes como linea base en experimentos con las cuatro tareas MimicGen equilibradas.
- Integracion en pipelines de robotica: servir la politica mediante OpenPI y combinarla con modulos de percepcion y planificacion en un sistema robotico completo.
- Experimentos de transferencia de embodiment: investigar como la normalizacion compartida con un robot Panda afecta a la politica cuando se despliega en un UR5e.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendada: no disponible.
- Capacidad en GPU de consumo: no especificada. El checkpoint completo ocupa 24.9 GB.
- Opciones de despliegue: OpenPI mediante `scripts/serve_policy.py` con un entorno compatible con LIBERO o DART.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Normalizacion | Tareas | Estado de entrada | Formato |
| --- | --- | --- | --- | --- |
| `mimicgen-ur5e-4task-ee6-state-own-sharednorm` | ownnorm (UR5e) y sharednorm (Panda+UR5e) | Square, Threading, Stack, Stack Three | 6D efector final (posicion + rotacion axis-angle) | Checkpoints Orbax OpenPI |
| `mimicgen-panda-ur5e-4task-balanced-sharednorm` | sharednorm (Panda+UR5e) | Panda y UR5e balanceados | no especificado | Checkpoints Orbax OpenPI |

Ambos repositorios pertenecen al mismo autor y comparten el modelo base pi0.5, la libreria OpenPI y el conjunto de tareas MimicGen. La diferencia principal es el ambito de los datos de normalizacion y la composicion de los robots empleados.

## Limitaciones y advertencias

- No se ha publicado ninguna licencia, por lo que el uso comercial o la redistribucion estan sin definir.
- Los datos de entrenamiento se limitan a 2,850 demostraciones sinteticas de MimicGen, lo que puede provocar un sobreajuste a los escenarios simulados.
- La politica ignora el estado interno de la pinza y solo controla su apertura mediante el comando de accion, lo que puede reducir la precision en tareas que requieren informacion de proximidad de la pinza.
- No se han comunicado benchmarks, por lo que el rendimiento real en entornos fisicos no esta validado.
- Los idiomas soportados no estan documentados, aunque el modelo es de tipo vision-lenguaje-accion.
- El modelo no es un sistema conversacional ni una herramienta de proposito general; esta orientado exclusivamente a control robotico.
- El checkpoint no incluye el estado del optimizador, lo que impide reanudar el entrenamiento exacto desde el paso 14,999.

## Enlaces

- Repositorio en HuggingFace: [isldgist/mimicgen-ur5e-4task-ee6-state-own-sharednorm](https://huggingface.co/isldgist/mimicgen-ur5e-4task-ee6-state-own-sharednorm)
- Repositorio hermano: [isldgist/mimicgen-panda-ur5e-4task-balanced-sharednorm](https://huggingface.co/isldgist/mimicgen-panda-ur5e-4task-balanced-sharednorm)
- Perfil del autor: [isldgist (ISL Lab)](https://huggingface.co/isldgist)
