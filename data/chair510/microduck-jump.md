# chair510/microduck-jump

## Resumen

Microduck-jump es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea motora muy concreta: ejecutar un salto completo (agacharse, fase aérea y aterrizaje en posición erguida) de forma episódica, con una duración fija de 4,0 segundos tras la cual el robot vuelve por sí mismo a una postura estable. Lo publica el usuario chair510 en Hugging Face bajo el identificador `chair510/microduck-jump`.

Técnicamente no es un modelo de lenguaje sino una política de robótica exportada a ONNX que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz. Se entrenó el 10 de noviembre de 2026 en un MacBook Air con chip M4 mediante la tarea personalizada Mjlab-Jump-Flat-MicroDuck, con 300 rondas de 256 entornos en paralelo. El autor reporta que el 100 % de 192 episodios de prueba alcanzaron la fase aérea y ninguno terminó con caída.

Su relevancia es acotada pero clara para quien trabaja con el microduck: demuestra que es posible entrenar habilidades motoras específicas en hardware de consumo (un portátil con Apple Silicon) y desplegarlas en el robot con un par de comandos a través del daemon `robotctl`. La información pública disponible es muy escasa: el repositorio pesa 0,0 GB, no tiene descargas ni likes, y no se declaran licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política episódica de 4,0 s a 50 Hz) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (esquema 2) |

Otros datos técnicos relevantes: dimensión de observación 61, dimensión de acción 14, frecuencia de control 50 Hz, duración del episodio 4,0 s, normalizador de observaciones integrado en el propio ONNX.

## Arquitectura y entrenamiento

El modelo es una política de control entrenada con aprendizaje por refuerzo para una tarea de locomoción concreta. La model card no detalla la topología de la red neuronal (número de capas, anchura, tipo de activación), por lo que ese dato no está disponible. Lo que sí se especifica es la interfaz: recibe observaciones de 61 dimensiones, emite 14 acciones y opera a 50 Hz, lo que encaja con el espacio de observación y acción del microduck. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar.

El entrenamiento se realizó el 10 de noviembre de 2026 en un MacBook Air con chip M4, usando la tarea personalizada Mjlab-Jump-Flat-MicroDuck con 300 rondas de 256 entornos en paralelo. El repositorio de entrenamiento es `pollen-robotics/microduck_rl`, rama `develop`, commit `0daab160d`, aunque el autor advierte que la exportación se hizo desde un checkout con cambios sin confirmar, lo que introduce incertidumbre sobre la reproducibilidad exacta del binario. No se documentan número de tokens ni datasets (no aplica), ni si hubo fases de RLHF o DPO (tampoco aplica en este contexto). La validación reportada es una prueba de 192 episodios con 100 % de fase aérea y 0 % de finalizaciones con caída.

## Capacidades

- Ejecución de una habilidad motora episódica de salto: agacharse, fase aérea y aterrizaje en posición erguida.
- Retorno autónomo a una postura de pie al finalizar el episodio de 4,0 s.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, alineado con la interfaz del microduck.
- Integración con el daemon del robot mediante `robotctl policy add` y `robotctl robot do jump`.
- Consumo de observaciones en bruto gracias al normalizador embebido en el ONNX.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües: es una política de control motor, no un modelo generativo.

## Casos de uso

- Demostración de salto en el microduck: cargar la política con `robotctl policy add jump chair510/microduck-jump` y ejecutarla con `robotctl robot do jump` para mostrar la habilidad en vídeos, ferias o documentación del robot.
- Prueba de integración del pipeline de políticas: sirve como caso de validación del manifiesto de esquema 2 y del flujo de carga de políticas en el daemon de Pollen Robotics antes de desplegar políticas propias.
- Punto de partida para fine-tuning o reentrenamiento: al estar entrenada con `pollen-robotics/microduck_rl` (rama `develop`), se puede reutilizar la configuración de la tarea Mjlab-Jump-Flat-MicroDuck como base para variantes (distinta altura, distinta superficie, salto encadenado).
- Docencia e investigación en RL aplicado a robótica: ejemplo reproducible de entrenamiento de una habilidad motora en hardware de consumo (MacBook Air M4) con 300 rondas × 256 entornos, útil para comparar costes de entrenamiento y estabilidad.
- Validación de sim-to-real en el microduck: comprobar si una política entrenada en simulación plana se transfiere al robot físico con la tasa de éxito reportada (100 % de fase aérea, 0 % de caídas en 192 episodios de prueba).
- Benchmark interno de políticas episódicas: usar la métrica de éxito del salto como referencia al evaluar nuevas políticas del mismo robot, comparando tasas de aterrizaje y desviación de la postura final.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Episodios con fase aérea | 100 % (192/192) | Prueba del autor |
| Episodios con final en caída | 0 % (0/192) | Prueba del autor |
| Duracion del episodio | 4,0 s | Fijo por diseño |
| Frecuencia de control | 50 Hz | Interfaz del microduck |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. Los únicos datos de rendimiento son las métricas de la prueba de validación del autor indicadas arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un ONNX muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas: no disponible; al ser una política de 61→14 dimensiones a 50 Hz, la inferencia es ligera y previsiblemente puede ejecutarse en CPU del propio robot o en un equipo de gama baja, aunque el fabricante no lo especifica.
- ¿Cabe en GPU de consumo? No hay datos oficiales, pero por la naturaleza de la tarea (control a 50 Hz con observaciones de 61 dimensiones) es altamente probable que sí; se recomienda verificar con el daemon del microduck.
- Opciones de despliegue: el flujo oficial es el daemon de microduck con `robotctl` (comandos `policy add` y `robot do`); el artefacto es un `policy.onnx` con normalizador embebido y un `manifest.json` conforme al esquema 2.
- Latencia y throughput estimados: no disponibles; el único requisito temporal conocido es sostener 50 Hz (20 ms por paso de control).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chair510/microduck-jump | Política RL (ONNX) para microduck | no disponible | Episodio de 4,0 s a 50 Hz | no disponible | Hugging Face (0 descargas) |
| Otras políticas del microduck en Hugging Face | Políticas RL para el mismo robot | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas RL de cuadrúpedos de referencia (p. ej. familias publicadas para otros robots) | Políticas RL | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparativa cuantitativa (parámetros, contexto, rendimiento) no está disponible.

## Limitaciones y advertencias

- Ámbito muy restringido: solo ejecuta la habilidad de salto episódico; no es un modelo de propósito general ni un modelo de lenguaje.
- Tarea entrenada en superficie plana (Mjlab-Jump-Flat-MicroDuck); el comportamiento en terrenos irregulares, pendientes u obstáculos no está documentado y podría degradarse.
- Reproducibilidad incierta: el autor indica que la exportación se hizo desde un checkout con cambios sin confirmar sobre el commit `0daab160d`, por lo que el binario puede no corresponder exactamente al código publicado.
- Validación limitada: las métricas (100 % de fase aérea, 0 % de caídas) provienen de 192 episodios de prueba del propio autor, sin validación independiente ni evaluación en robot físico documentada en la model card.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no aplican en el sentido habitual, pero tampoco se documentan sesgos de simulación (por ejemplo, diferencias entre el modelo físico del simulador y el robot real).
- Mantenimiento incierto: repositorio sin descargas ni likes y con tamaño de 0,0 GB; no hay garantía de soporte, actualizaciones ni compatibilidad futura con el daemon.
- Dependencia del ecosistema microduck: requiere el daemon y el manifiesto de esquema 2; no es portable a otros robots sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chair510/microduck-jump
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `develop`, commit `0daab160d`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (según la model card)
