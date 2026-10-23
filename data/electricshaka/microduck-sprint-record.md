# ElectricShaka/microduck-sprint-record

## Resumen

microduck-sprint-record es una política de control para el robot bípedo microduck, publicada por el usuario ElectricShaka en Hugging Face. No es un modelo de lenguaje ni un modelo generativo multimodal: es un checkpoint de aprendizaje por refuerzo exportado a ONNX que produce una marcha perpetua para un robot de 61 dimensiones de observación, 14 acciones y un bucle de control de 50 Hz. Se carga en una ranura de política del daemon del robot mediante el comando `robotctl policy load <slot> ElectricShaka/microduck-sprint-record`.

El modelo es un fine-tune (remix) de `jrubiosainz/microduck-game-sprinter-remix4` y se presenta como una marcha que se ejecuta de forma indefinida hasta que se le indique lo contrario. Su interés actual reside en el ecosistema microduck, un bípedo open source de 25 cm y 399 dólares impulsado por Pollen Robotics y Hugging Face, entrenado con refuerzo en MuJoCo, que busca abaratar la experimentación en robótica con IA física.

La relevancia de esta ficha es acotada: se trata de un artefacto de control de un proyecto de robótica concreto, sin benchmarks publicados, sin licencia declarada y con un repositorio de tamaño redondeado de 0,0 GB. Cualquier evaluación seria exige probarlo en hardware real o en el simulador del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por refuerzo y exportada a ONNX; topología de red no especificada en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; consume observaciones de 61 dimensiones por paso de control, no una ventana de contexto textual |
| Tipos de cuantización | no disponible; se distribuye un único `policy.onnx` |
| Idiomas soportados | no aplica; no es un modelo de lenguaje |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Espacio de observación | 61 dimensiones, con normalizador integrado en el ONNX |
| Espacio de acción | 14 acciones |
| Modelo base | `jrubiosainz/microduck-game-sprinter-remix4` (relación: finetune) |
| Biblioteca | `microduck` |
| Tamaño del repositorio | 0,0 GB (redondeado por Hugging Face) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, anchura, funciones de activación ni algoritmo de optimización). Lo que sí se documenta es el contrato de interfaz: observaciones crudas de 61 dimensiones, 14 acciones y ejecución a 50 Hz. El normalizador de observaciones está horneado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin preprocesar. El manifiesto sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`. El autor advierte que la exportación se hizo desde un checkout con cambios sin commitear, lo que impide reproducir exactamente el artefacto a partir del commit indicado. No se especifican el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL ni si hubo fases de ajuste adicionales. El proyecto microduck, según las fuentes consultadas, entrena sus políticas con refuerzo en MuJoCo, pero la model card no detalla la configuración de simulación empleada en este checkpoint concreto.

## Capacidades

- Generación de una marcha o gait perpetuo para el bípedo microduck, activo hasta que se le ordene detenerse o se cargue otra política.
- Control de locomoción a 50 Hz con un espacio de acción de 14 dimensiones.
- Consumo directo de observaciones crudas de 61 dimensiones gracias al normalizador embebido en el grafo ONNX.
- Carga como ranura de política en el daemon del robot mediante `robotctl policy load`.
- Ejecución en runtime ONNX, sin dependencias de frameworks de lenguaje.
- No se documentan capacidades de visión, lenguaje, tool calling, razonamiento multi-paso ni agentes. El robot microduck dispone de cámara, sensor de profundidad y sensores de movimiento según las fuentes del proyecto, pero esta política no declara usar dichas entradas: su interfaz es de 61 dimensiones y no se detalla su composición.
- No se documentan modos de pensamiento, audio ni otras capacidades cognitivas.

## Casos de uso

- Demostraciones de locomoción continua: cargar la política en una ranura y dejar que el robot camine de forma indefinida en ferias, vídeos o presentaciones, sin necesidad de reenviar comandos de marcha.
- Base para fine-tuning de nuevas marchas: al ser un remix de `microduck-game-sprinter-remix4`, sirve como punto de partida para entrenar variantes de velocidad, estabilidad o estilo con `pollen-robotics/microduck_rl`.
- Evaluación de control en banco de pruebas: reproducir el bucle a 50 Hz en un entorno simulado o con el robot suspendido para medir seguimiento de trayectoria y saturación de articulaciones.
- Integración en pipelines de despliegue del daemon: usar el manifiesto de esquema 2 para automatizar la carga y el cambio de políticas en un slot durante pruebas de regresión.
- Investigación en sim-to-real: comparar el comportamiento de esta política entrenada en simulación con su ejecución en el hardware físico, midiendo deriva y caídas.
- Docencia y robótica de bajo coste: emplear el ecosistema microduck, con un bípedo de 25 cm y 399 dólares, para enseñar refuerzo, exportación a ONNX y control en tiempo real.
- Comparación de gaits: alternar esta política con otras del mismo autor o de la comunidad, como `dashi/microduck-sprint-test`, para evaluar diferencias de velocidad y estabilidad con el mismo contrato de observación y acción.
- Pruebas de robustez ante perturbaciones: empujar el robot mientras ejecuta la marcha perpetua para caracterizar la recuperación, siempre que el firmware lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, velocidad de avance, tasa de caídas, error de seguimiento ni comparaciones cuantitativas con otras políticas. Tampoco se aportan curvas de entrenamiento ni evaluaciones en simulador o en hardware real.

## Requisitos de hardware

- VRAM estimada: no disponible. No se documentan requisitos de GPU; el artefacto es una política ONNX y el repositorio ocupa 0,0 GB redondeados, pero no se publica el número exacto de parámetros ni el tamaño del fichero.
- GPU recomendadas: no disponibles. El despliegue previsto es en el propio robot microduck, no en un servidor de inferencia.
- Compatibilidad con GPU de consumo: no aplica según la documentación; no se declara necesidad de GPU dedicada.
- Opciones de despliegue: runtime ONNX dentro del daemon de microduck, con carga mediante `robotctl policy load <slot> ElectricShaka/microduck-sprint-record`. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de artefacto.
- Bucle de control: 50 Hz, lo que implica un presupuesto de 20 ms por paso. No se publica latencia medida ni throughput real en el hardware del robot.
- Memoria y cómputo del robot: no disponibles. Las fuentes del proyecto describen 15 motores, cámara, sensor de profundidad y dos sensores de movimiento, pero no la unidad de cómputo ni sus especificaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Rendimiento | Licencia | Descargas |
|---|---|---|---|---|---|
| `ElectricShaka/microduck-sprint-record` | no disponible | 61 dimensiones, 14 acciones, 50 Hz | sin benchmarks publicados | no disponible | 0 |
| `jrubiosainz/microduck-game-sprinter-remix4` (base) | no disponible | no disponible en la información consultada | no disponible | no disponible | no disponible |
| `dashi/microduck-sprint-test` | no disponible | no disponible en la información consultada | no disponible | no disponible | no disponible |

La comparación cuantitativa no es posible con los datos disponibles: ninguno de los tres artefactos publica recuento de parámetros, métricas de evaluación ni términos de licencia en la información consultada. La comparación relevante es funcional: los tres pertenecen a la familia de políticas de marcha para microduck y comparten el mismo pipeline de robótica y el mismo formato de despliegue.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial, redistribución ni modificación sin aclaración explícita del autor.
- Reproducibilidad comprometida: el propio autor indica que el ONNX se exportó desde un checkout con cambios sin commitear sobre el commit `6ff40704a`, por lo que el artefacto no se corresponde necesariamente con el código publicado.
- Ausencia total de benchmarks: no hay evidencia cuantitativa de estabilidad, velocidad, consumo energético ni tasa de éxito en hardware real.
- Dependencia de hardware específico: la política está diseñada para el bípedo microduck, con su cadena cinemática y su firmware; no es transferible a otros robots sin reentrenamiento.
- Sensibilidad temporal: a 50 Hz, el incumplimiento del presupuesto de 20 ms por paso puede degradar la marcha o provocar inestabilidad.
- Observaciones crudas obligatorias: alterar la escala o el orden de las 61 dimensiones invalida el normalizador embebido y el comportamiento de la política.
- Sin información sobre sesgos: al no ser un modelo de lenguaje, no aplican sesgos lingüísticos, pero tampoco se documentan sesgos de simulación ni el dominio de entrenamiento, lo que impide evaluar la brecha sim-to-real.
- Riesgo de sobreajuste al simulador: no se aportan datos de entrenamiento ni de validación cruzada en dominios aleatorizados.
- Alcance limitado: no procesa lenguaje, no razona, no usa herramientas y no interpreta visión; cualquier expectativa de agente autónomo queda fuera de su contrato.
- Falta de soporte documentado: no se indica compatibilidad con versiones concretas del daemon ni del esquema de manifiesto más allá del esquema 2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElectricShaka/microduck-sprint-record
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix4
- Política comparable de la comunidad: https://huggingface.co/dashi/microduck-sprint-test
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento por refuerzo: https://github.com/pollen-robotics/microduck_rl (commit `6ff40704a`, rama `main`)
- Cobertura de MarkTechPost sobre microduck: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de CNX Software sobre microduck: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Recursos de la comunidad microduck: https://microduckrobot.org/
