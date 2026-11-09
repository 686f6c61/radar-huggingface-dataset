# islee94/n16-franka-stack3cup-uniform1p5-30k-s42

## Resumen

`n16-franka-stack3cup-uniform1p5-30k-s42` es un checkpoint de ajuste fino del modelo fundacional de robotica GR00T N1.6, desarrollado por NVIDIA, publicado por el usuario `islee94` en Hugging Face. No se trata de un modelo de lenguaje: es una politica visomotora (vision-language-action, VLA) entrenada para controlar un brazo robotico Franka en la tarea concreta de apilar tres vasos (`stack_3_cup`). El checkpoint se ha entrenado sobre datos reales retemporizados con un factor de uniformizacion de 1,5, durante 30.000 actualizaciones, con semilla 42 y sobre 4 GPU A100.

El modelo tiene 3.286.608.832 parametros almacenados en dos ficheros safetensors (aproximadamente 6,6 GB en total) y se distribuye unicamente con los pesos de inferencia, sin estado del optimizador. El repositorio incluye la configuracion del experimento, estadisticas del dataset y el manifiesto de destilacion por ritmo (`pacedistill_manifest.json`), lo que permite reproducir el pipeline de evaluacion.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible de un ajuste fino de GR00T N1.6 sobre una tarea de manipulacion real con Franka, util para investigadores que trabajen en VLA, imitacion robotica o evaluacion de politicas sobre hardware real. La evaluacion en robot esta pendiente segun la propia model card, y el modelo no esta pensado para uso general ni para inferencia en produccion fuera de su tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (politica vision-language-action; detalles internos no disponibles) |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (2 shards, ~6,6 GB) |

## Arquitectura y entrenamiento

El checkpoint deriva de GR00T N1.6 (referencia interna `gr00tn16 179b98b`), el modelo fundacional de robotica de NVIDIA orientado a politicas visomotoras. La model card no detalla la arquitectura interna (composicion de vision encoder, backbone y cabeza de accion), por lo que no se puede confirmar si se trata de un transformer puro, un hibrido o un esquema con experto de accion separado. Los pesos suman 3.286.608.832 parametros y se reparten en dos ficheros safetensors de 4.991.091.456 y 1.582.283.096 bytes.

El ajuste fino se realizo sobre el dataset `stack3cup_uniform_1p5`, una version retemporizada de datos reales de Franka para la tarea de apilar tres vasos, con factor de uniformizacion 1,5. El entrenamiento consistio en 30.000 actualizaciones sobre 4 GPU A100 (4 x 16, presumiblemente 16 procesos o workers por GPU), con semilla 42. Se incluye un manifiesto de destilacion por ritmo (`pacedistill_manifest.json`) y un fichero de contexto de Raven (`raven_context.txt`), lo que sugiere un pipeline de entrenamiento con destilacion de politica y control de ritmo de datos. No se especifican tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO, ya que no aplica a un modelo de este tipo.

## Capacidades

- Control visomotor para la tarea concreta de apilar tres vasos (`stack_3_cup`) con un brazo Franka.
- Inferencia a partir de observaciones visuales y estado del robot (politica VLA), segun el paradigma de GR00T N1.6.
- Ejecucion de politicas de imitacion entrenadas sobre demostraciones reales retemporizadas.
- Integracion con el pipeline de evaluacion de GR00T N1.6 (configuracion de experimento, estadisticas de dataset y procesador incluidos).
- No se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, agentes multi-paso ni multilingueismo; no aplican a este tipo de modelo.
- No se documentan modos especiales como thinking, vision general o audio.

## Casos de uso

- Reproduccion de experimentos de VLA: el checkpoint permite reproducir el ajuste fino de GR00T N1.6 sobre `stack3cup_uniform_1p5` con semilla 42 y comparar resultados frente a otras semillas o configuraciones.
- Evaluacion de politicas en robot real: sirve como punto de partida para la evaluacion pendiente en un Franka fisico con la tarea de apilar tres vasos.
- Estudio de retemporizacion de datos: al haberse entrenado con datos uniformizados a factor 1,5, permite analizar el efecto de la retemporizacion sobre el rendimiento de la politica.
- Baseline para ajuste fino posterior: puede usarse como inicializacion para nuevas tareas de manipulacion con Franka, partiendo de una politica ya adaptada a un entorno real.
- Investigacion en destilacion por ritmo: el manifiesto `pacedistill_manifest.json` permite estudiar el esquema de destilacion empleado durante el entrenamiento.
- Docencia y divulgacion: ejemplo completo y reproducible de un pipeline de entrenamiento VLA con configuracion, estadisticas y pesos de inferencia.
- Comparativa de checkpoints: util para contrastar distintos checkpoints de la misma familia (distintas semillas, pasos o datasets) en condiciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion en robot esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, los pesos en safetensors ocupan aproximadamente 6,6 GB, por lo que la inferencia en precision completa requeriria al menos esa cantidad mas overhead de activaciones y del procesador de observaciones.
- GPU recomendadas: el entrenamiento se realizo sobre 4 x A100; para inferencia no se especifican requisitos.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de ~3,3 mil millones de parametros podria caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: no se documentan. Al ser un checkpoint de GR00T N1.6, el despliegue previsible pasaria por el stack de inferencia de GR00T, no por vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-stack3cup-uniform1p5-30k-s42 | 3.286.608.832 | no disponible | Apilar 3 vasos con Franka | no disponible | Hugging Face (publico) |
| GR00T N1.6 (base) | no disponible | no disponible | Politica VLA general | no disponible | Referencia interna `gr00tn16 179b98b`; disponibilidad publica no confirmada |
| Otros checkpoints de la misma familia | no disponible | no disponible | Manipulacion robotica | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas de otros autores (por ejemplo, otras familias VLA) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo altamente especializado: solo se ha entrenado para la tarea `stack_3_cup` con un brazo Franka; no es un modelo de proposito general.
- Evaluacion en robot pendiente: no hay evidencia publicada de rendimiento real, por lo que su eficacia en hardware fisico no esta confirmada.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor o con NVIDIA antes de cualquier uso productivo.
- Idiomas no aplicables: no es un modelo de lenguaje, por lo que las consideraciones multilingues no proceden.
- Sesgos y alucinacion: no se documentan sesgos conocidos; en el contexto de politicas roboticas, el riesgo equivalente es la ejecucion de acciones erroneas o inseguras fuera de la distribucion de entrenamiento.
- Dependencia del dataset y del entorno: el rendimiento puede degradarse si cambian la camara, la iluminacion, la mesa o el robot respecto al entorno de entrenamiento.
- Solo pesos de inferencia: no se incluye estado del optimizador, lo que limita la reanudacion exacta del entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni issues reportados.
- Fecha de creacion futura (2026-11-09) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/islee94/n16-franka-stack3cup-uniform1p5-30k-s42
- Model card del autor: incluida en el repositorio de Hugging Face (seccion README)
- Referencia interna del checkpoint base: `gr00tn16 179b98b` (sin URL publica en la informacion disponible)
- Documentacion interna citada: `internal/docs/servers/raven.md` (no accesible publicamente)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
