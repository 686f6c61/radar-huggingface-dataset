# nocrab/microduck-backflip

## Resumen

MicroDuck Backflip es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo MicroDuck de Pollen Robotics. El modelo no es un modelo de lenguaje: es un controlador neuronal exportado a ONNX que ejecuta una maniobra acrobática concreta (un mortal hacia atrás con apoyo de la cabeza) partiendo de una postura erguida sobre dos patas. Lo publica el usuario nocrab en Hugging Face bajo licencia Apache 2.0, con un tamaño de repositorio prácticamente nulo (0.0 GB), lo que refleja que se trata de un artefacto de inferencia compacto y no de un modelo generativo.

La relevancia de esta ficha es acotada: se trata de un ejemplo de política de robótica entrenada en simulación con el framework mjlab (MuJoCo-based) y el pipeline microduck_rl de Pollen Robotics, empaquetada según su formato de compartición de políticas. El modelo demuestra un caso de uso muy específico (skill episódica de backflip) y sirve como referencia para quienes trabajen con el ecosistema MicroDuck y quieran entender cómo se distribuye y despliega una política entrenada.

Es importante subrayar que la model card del autor marca explícitamente "SIM ONLY": la maniobra utiliza la cabeza como muelle de impulso y nunca debe ejecutarse en un robot físico. No hay información sobre idiomas, benchmarks de NLP ni capacidades de lenguaje, porque el modelo no es de esa categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (reinforcement learning), exportada a ONNX; arquitectura interna no detallada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; contrato de observación `obs[1,61] f32` |
| Tipos de cuantizacion | no disponible (artefacto ONNX f32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` y `media/preview.mp4` |

## Arquitectura y entrenamiento

La política se entrenó con aprendizaje por refuerzo en el entorno `Mjlab-Backflip-Flat-MicroDuck`, dentro del repositorio `pollen-robotics/microduck_rl` (commit `4757d6ae`). El run de entrenamiento se identifica como `local 2026-10-26_15-47-20_run2`, modelo `model_2999` (3000 iteraciones, 4096 entornos en paralelo, ejecutado en una RTX 5080 durante 1 hora y 34 minutos). La exportación se realizó con `scripts/export.py`.

El contrato de inferencia es `obs[1,61] f32 → actions[1,14] f32`, con normalizador integrado ("baked in"), frecuencia de 50 Hz y objetivos alrededor de HOME × 1.0. La política es de tipo episódica con pose de entrada de pie. El comando de control se codifica en los slots `twist` de un bloque de 13 dimensiones: `twist[0]` actúa como interruptor de arranque (1 durante ~0.2–0.5 s inicia el mortal), mientras que `twist[1]` y `twist[2]` no se utilizan. El modelo se entrenó para esperar la señal de arranque, de modo que no ejecuta el mortal por sí solo cuando se instala como skill.

La maniobra aprovecha la cabeza como muelle: el pato se echa atrás, empuja contra el suelo con la cabeza durante ~0.1–0.3 s, vuela boca abajo ~0.15 s y aterriza sobre las patas. Los aterrizajes alcanzan picos de ~2.6 g. Un mortal puro desde parado está fuera del alcance de este robot (mejor salto medido: 0.40 m/s de despegue, ~0.08 s en el aire).

## Capacidades

- Ejecución de una skill episódica concreta: mortal hacia atrás de 360° desde una postura erguida sobre dos patas, con aterrizaje y recuperación de la postura.
- Control reactivo a una señal de arranque externa (`twist[0]`), con comportamiento de espera cuando la señal permanece a 0.
- Inferencia a 50 Hz con observaciones de 61 dimensiones y acciones de 14 dimensiones.
- Integración con el software del robot real (duck-sim / robotd) mediante el formato de compartición de políticas de Pollen Robotics.
- No dispone de capacidades de lenguaje, visión, tool calling ni razonamiento multi-paso; no es un modelo generativo.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como ejemplo reproducible de una política entrenada con mjlab y exportada a ONNX, útil para estudiar el pipeline completo (entrenamiento, exportación, manifest y despliegue).
- Validación de pipelines de simulación: permite probar el flujo `policy add` / `robot do` en duck-sim y verificar la integración de políticas episódicas con comandos codificados en `twist`.
- Demostraciones de acrobacias en simulación: adecuado para vídeos, tutoriales o presentaciones que muestren habilidades dinámicas del MicroDuck sin riesgo físico.
- Benchmarking de controladores: la política puede utilizarse como referencia de rendimiento (tasa de éxito de flip y aterrizaje) frente a otras políticas entrenadas para el mismo robot.
- Estudio de robustez ante variaciones del interruptor: los resultados publicados con ventanas de 0.2 s, 0.3 s y 0.5 s permiten analizar la sensibilidad temporal del controlador.
- Base para transferencia o fine-tuning: al estar bajo Apache 2.0 y en formato ONNX, puede servir como punto de partida para entrenar variantes (otros saltos, distintas condiciones iniciales) en el mismo entorno simulado.

## Benchmarks y rendimiento

Resultados publicados en la model card (no son benchmarks de NLP, sino métricas de éxito de la política en simulación):

| Test | Resultado |
|---|---|
| Entorno de entrenamiento, interruptor activo a 1.0 s durante 0.3 s (64 arranques) | 100 % flip y aterrizaje |
| Interruptor a 0.3 s / 2.5 s | 100 % / 100 % |
| Ventana de interruptor 0.2 s / 0.5 s | 100 % / 98 % |
| Interruptor nunca activo | 0 flips, 100 % de pie |
| duck-sim, `robot do backflip` ×30 | 29/30 flips completos, 30/30 de pie, sin caídas ni bloqueos |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el artefacto es un ONNX de tamaño muy reducido (repositorio de 0.0 GB), por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una RTX 5080. Para inferencia basta con una GPU de gama media o CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del artefacto.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto) y el stack duck-sim / robotd de Pollen Robotics mediante el formato de compartición de políticas.
- Latencia y throughput: no disponibles; el contrato especifica 50 Hz de frecuencia de control.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables del mismo robot o de la misma categoría (skills acrobáticas para MicroDuck) con las que establecer una comparación de parámetros, contexto o licencia.

## Limitaciones y advertencias

- Solo simulación: el autor advierte explícitamente que nunca debe ejecutarse en un robot físico; la maniobra usa la cabeza como muelle y los aterrizajes alcanzan ~2.6 g.
- Un mortal puro desde parado está fuera del alcance del robot (mejor salto medido: 0.40 m/s, ~0.08 s en el aire); la política depende del apoyo de la cabeza.
- Requiere instalar con el comando `--command 1,0,0`: el manifest no puede transportar el interruptor de arranque y `policy add` alimenta ceros por defecto, en cuyo caso el modelo solo se queda de pie.
- El modelo no ejecuta el mortal de forma autónoma; fue entrenado para esperar la señal de arranque.
- No es un modelo de lenguaje: no tiene capacidades de generación de texto, razonamiento, código ni multilingüismo, por lo que no aplican sesgos lingüísticos ni riesgo de alucinación en el sentido habitual.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero la restricción de seguridad (solo simulación) es una advertencia operativa del autor, no una cláusula de licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nocrab/microduck-backflip
- Vídeo de previsualización: https://huggingface.co/nocrab/microduck-backflip/resolve/main/media/preview.mp4
- Repositorio microduck_rl de Pollen Robotics: https://github.com/pollen-robotics/microduck_rl
- Documentación del formato de compartición de políticas: https://github.com/pollen-robotics/microduck_rl/blob/main/docs/sharing-policies.md
