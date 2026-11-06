# DenRakEiw/microduck-songkran-duck_8492

## Resumen

`microduck-songkran-duck_8492` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una red neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX para su ejecución directa en el robot. El autor del artefacto es el usuario de Hugging Face DenRakEiw, que lo publica como resultado de un experimento de locomoción denominado internamente «Sock Heist».

El modelo resuelve un problema acotado: proporcionar una marcha perpetua (un gait) que el robot ejecuta de forma continua hasta recibir una orden de parada. Se carga en una ranura de política del daemon `robotctl` del microduck y sustituye a otras políticas de locomoción. Su relevancia es limitada fuera del ecosistema microduck: es un artefacto de investigación reproducible, no un modelo de propósito general.

La información pública es muy escasa: el repositorio ocupa 0,0 GB, no declara licencia ni idiomas, no tiene descargas ni likes y no incluye resultados de benchmarks ni métricas de recompensa. Todo lo que se sabe proviene de la model card y de los metadatos de entrenamiento que el autor incluye en ella.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL para control motriz; se infiere una red actor tipo MLP a partir del `actor.class-name: SprinterActor`, sin confirmación) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política reactiva; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantización | No disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La política se entrenó con el framework mjlab (entorno `mjlab-microduck 0.1.0`, commit `1efd853be`) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, definida en el repositorio `pollen-robotics/microduck-challenges` (rama `denrakeiw-070`, commit `97e2b1fe2`). El entrenamiento usó 4096 entornos paralelos, un intervalo de guardado de 50 iteraciones, semilla 1, tasa de aprendizaje 3e-4, coeficiente de entropía 0,0, programación de learning rate fija y un máximo de 1500 iteraciones; el checkpoint publicado es el 1050. El actor corresponde a la clase `microduck_challenges.sock_heist_6m.sprinter:SprinterActor`, lo que sugiere una política de tipo «sprinter» adaptada a partir de una marcha previa y reentrenada para una condición concreta descrita de forma críptica en la model card («freeze under the giant's eye», hr1).

El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el comando con el mismo código, `uv.lock`, semilla y configuración produce una política comparable, pero no idénticos pesos. La normalización de observaciones está integrada dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. No se documentan detalles de la arquitectura de red, el número de parámetros, la composición del dataset (generado por simulación) ni si hubo fases de ajuste adicionales.

## Capacidades

- Locomoción continua del robot microduck: política perpetua que ejecuta una marcha hasta que se le indique lo contrario.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, conforme a la interfaz del hardware microduck.
- Carga directa en una ranura de política del daemon mediante `robotctl policy load`.
- Normalización de observaciones incorporada en el grafo ONNX, lo que simplifica la integración en el robot.
- Reproducibilidad del pipeline de entrenamiento (no de los pesos) mediante el comando documentado.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como política de referencia para comparar marchas entrenadas con distintas recompensas o condiciones dentro de mjlab.
- Reproducción de experimentos de RL: el comando de entrenamiento documentado permite regenerar políticas comparables y estudiar la variabilidad entre ejecuciones.
- Demostraciones de robot de bajo coste: el microduck es una plataforma de hardware abierto y esta política permite ponerlo a andar sin entrenar desde cero.
- Pruebas de integración del daemon `robotctl`: útil para validar la carga de políticas en ranuras, el esquema 2 de manifiestos y el flujo de observaciones en bruto.
- Benchmarking de simulación a realidad: la política puede emplearse para medir la brecha entre el entrenamiento en mjlab y el comportamiento en el robot físico.
- Docencia en robótica y RL: ejemplo compacto de un pipeline completo (entorno, entrenamiento, exportación ONNX, despliegue) para cursos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de éxito, velocidad de marcha, estabilidad ni comparaciones con otras políticas del repositorio `microduck-challenges`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Para el entrenamiento, el autor empleó 4096 entornos paralelos, lo que requiere una GPU de datacenter (A100, H100 o similar) para completar 1500 iteraciones en un tiempo razonable; no se especifica el hardware exacto.
- Ejecución en consumer GPU: probablemente innecesaria; la inferencia está pensada para ejecutarse en el propio robot o en una CPU cercana mediante ONNX Runtime.
- Opciones de despliegue: ONNX Runtime para `policy.onnx` y el daemon `robotctl` del microduck para la carga en ranuras de política.
- Latencia y throughput: no disponibles; el control opera a 50 Hz, pero no se documentan tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-songkran-duck_8492 | Política RL (ONNX) para microduck | No disponible | No aplica | No disponible | Hugging Face, 0 descargas |
| Otras políticas de `microduck-challenges` | Políticas RL para microduck | No disponible | No aplica | Según repositorio | GitHub de Pollen Robotics |
| Políticas de locomotion para quadrupedos (p. ej., MuJoCo Playground, Isaac Lab) | Políticas RL | Variable | No aplica | Generalmente permisivas | Repositorios de investigación |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Artefacto de investigación sin licencia declarada: no se puede asumir permiso para uso comercial.
- Ausencia total de métricas: no hay evidencia publicada de robustez, velocidad ni estabilidad de la marcha.
- La model card es críptica («Sock Heist», «freeze under the giant's eye», «trained with solar energy») y no describe la condición de entrenamiento en términos técnicos verificables.
- Entrenamiento no reproducible bit a bit: los pesos publicados no pueden regenerarse exactamente.
- Dependencia estricta del hardware y del daemon microduck; no es reutilizable en otras plataformas sin reentrenamiento.
- Riesgo de brecha simulación-realidad no cuantificado.
- Sin información sobre sesgos (no aplica en el sentido habitual) ni sobre alucinación (no genera texto).
- Repositorio sin descargas ni validación comunitaria: no hay señales externas de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck_8492
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
