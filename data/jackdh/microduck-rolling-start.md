# JackDH/microduck-rolling-start

## Resumen

Rolling Start es una política de control para el robot cuadrúpedo (con ruedas) Microduck de Pollen Robotics, publicada por el usuario JackDH en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: es un conjunto de pesos ONNX que combina tres políticas base de locomoción con 32 correcciones aprendidas para las patas y la cabeza, con el objetivo de que el robot patine hacia delante, ejecute una voltereta completa apoyándose en la cabeza y vuelva a quedar sobre sus ruedas sin detenerse, todo ello en una rutina de 5,5 segundos.

El modelo resuelve un problema muy concreto de robótica de locomoción: mantener el equilibrio y la orientación durante una maniobra acrobática (un *forward roll*) sobre una plataforma de patinaje. Las correcciones se entrenan con aprendizaje por refuerzo evolutivo (poblaciones de correcciones motoras evaluadas en simulador) manteniendo fijas las redes de las políticas base. La relevancia es acotada: se trata de un experimento de investigación reproducido íntegramente en simulación, no de un modelo de propósito general.

La información disponible es muy limitada: el repositorio pesa 0,0 GB, no declara licencia propia, no indica idiomas y no se han publicado resultados de benchmarks estándar. Los datos de rendimiento que ofrece el autor son métricas de tarea en el simulador Arena, no comparables con benchmarks de modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control neuronal (tres políticas base fijas + 32 correcciones aprendidas), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible para el modelo; las políticas base de Pollen se distribuyen bajo Apache 2.0 |
| Formato de pesos | ONNX (`rolling-start.onnx`) y checkpoint JSON con las correcciones aprendidas |

## Arquitectura y entrenamiento

La política combina tres componentes: el checkpoint 500 de la política *Roller Sprint* del propio autor, y las políticas *roulade* y *velstand* de Pollen Robotics. Estas redes se mantienen congeladas durante el entrenamiento. Sobre ellas se aprenden 32 correcciones aplicadas a las patas y la cabeza, que responden a la inclinación y la rotación del pato mientras rueda. Una línea temporal (*timeline*) marca cada fase de la rutina.

El entrenamiento es evolutivo: cada generación evalúa una población de correcciones motoras sobre el mismo conjunto de arranques en el simulador Arena (versión 0.7.0, Python 3.12, ejecución en CPU). Las mejores correcciones guían la siguiente generación. La función de recompensa premia un giro completo hacia delante, un aterrizaje erguido y una salida patinando hacia delante. El autor seleccionó la generación 26 de una ejecución de 30 generaciones con población 48 y batch 6, a velocidad 0,65 y *roll* en 1,65 s. Los pesos incluidos corresponden a una aproximación más lenta; la ejecución rápida se reproduce con los comandos documentados en la model card.

## Capacidades

- Control de locomoción sobre ruedas para el robot Microduck: avance, giro y transición a voltereta hacia delante.
- Ejecución de una rutina acrobática de 5,5 segundos con los patines puestos durante toda la maniobra.
- Corrección de actitud en tiempo real basada en la inclinación y la rotación del robot durante el giro.
- Aterrizaje sobre las ruedas y reanudación de la marcha tras la voltereta.
- Reproducción determinista mediante semillas en el entorno de simulación Arena (`replay . --seeds 1 2 3`).
- Exportación a ONNX para su integración en el *runtime* de Microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política motora, no un modelo generativo.

## Casos de uso

- Investigación en locomoción acrobática: sirve como referencia reproducible para estudiar cómo correcciones de baja dimensionalidad (32 parámetros) sobre políticas congeladas permiten transiciones complejas como una voltereta.
- Demostraciones de robótica en simulación: la rutina de 5,5 s con patines es un caso vistoso para vídeos y validaciones del simulador Arena.
- *Benchmarking* de entornos de simulación: el autor reporta tasas de éxito (39/64 frente a 4/64 sin correcciones) que permiten comparar configuraciones del simulador o variantes de entrenamiento.
- Estudio de aprendizaje evolutivo aplicado a control: el flujo `train`/`export` documentado permite reproducir el bucle generacional y analizar el efecto de la población, el batch y la velocidad.
- Base para transferencia a hardware: aunque todas las pruebas son en simulación, la política puede servir de punto de partida para experimentos de *sim-to-real* en el Microduck físico.
- Educación y divulgación: ejemplo accesible de refuerzo evolutivo sobre un robot de bajo coste, con código y pesos disponibles.
- Composición de políticas: el enfoque de mantener fijas políticas base y aprender correcciones encima es reutilizable para añadir nuevas maniobras a un repertorio existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas son de tarea, medidas en el simulador Arena local del autor:

| Métrica | Valor |
|---|---|
| Velocidad en el medio segundo previo al giro (semilla oficial) | 0,41 m/s |
| Rotación durante la voltereta | 358° |
| Tiempo hasta quedar erguido | 1,52 s |
| Distancia recorrida en el último segundo | 53 cm |
| Éxito en 64 arranques nuevos (con correcciones) | 39/64 |
| Éxito en 64 arranques nuevos (sin correcciones) | 4/64 |
| Velocidad solicitada por la línea temporal | 0,8 m/s |
| Momento del *roll* en la línea temporal | 1,71 s |

## Requisitos de hardware

- No se dispone de estimaciones de VRAM: el modelo es una política de control de pequeño tamaño exportada a ONNX, no un modelo generativo.
- El entrenamiento se ejecuta en núcleos de CPU dentro del simulador Arena, según indica el autor.
- La inferencia está pensada para el *runtime* de Microduck y para el entorno Arena 0.7.0 con Python 3.12 y las dependencias de Workshop.
- No requiere GPU dedicada para el *replay*; no se documentan requisitos de A100, H100 ni RTX.
- Opciones de despliegue: *runtime* de Microduck y scripts `training/run.py` (replay, train, export) del propio repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JackDH/microduck-rolling-start | Política de control (ONNX) | no disponible | no aplica | no disponible (base Apache 2.0) | Hugging Face |
| JackDH/microduck-roller-sprint-20261110-best | Política de control (checkpoint base) | no disponible | no aplica | no disponible | Hugging Face |
| pollen-robotics/microduck-policies (roulade, velstand) | Políticas de control base | no disponible | no aplica | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas más allá de la referencia del autor a que su checkpoint de *Roller Sprint* sirvió como punto de partida.

## Limitaciones y advertencias

- Todas las pruebas se realizaron en simulación; no hay evidencia de funcionamiento en el robot físico.
- El aterrizaje «puede irse de lado»: el propio autor reconoce que la maniobra no es fiable en todos los arranques (39/64 de éxito).
- El modelo no declara licencia propia; solo se indica que las políticas de Pollen se distribuyen bajo Apache 2.0, por lo que el uso comercial de las correcciones aprendidas queda sin regular explícitamente.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje.
- Dependencia fuerte del entorno: requiere Arena 0.7.0, Python 3.12 y las dependencias de Workshop; cambios en el simulador pueden alterar los resultados.
- Los pesos incluidos corresponden a una aproximación más lenta que la ejecución rápida descrita; los resultados pueden diferir si se reproduce el entrenamiento.
- Repositorio de 0,0 GB y sin descargas ni *likes*: no hay validación independiente por parte de la comunidad.
- No apto para producción industrial ni para tareas fuera del control del Microduck.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackDH/microduck-rolling-start
- Checkpoint base Roller Sprint: https://huggingface.co/JackDH/microduck-roller-sprint-20261110-best
- Políticas de Pollen Robotics: https://huggingface.co/pollen-robotics/microduck-policies/tree/1b56c396825c052a4e26e95cf2b8d8298af9e9b4
- Entorno Microduck Challenges: https://github.com/JackDanHollister/microduck-challenges/tree/c0a75ceff2e23eba90ff651a715e6ecd230abf75
- Resultados de test (`assessment.json`): incluido en el repositorio del modelo
- Licencia de las políticas de Pollen (`training/POLLEN-LICENSE.txt`): incluida en el repositorio del modelo
