# hanapasta/airvla_v3arm_25000

## Resumen

AirVLA V3-arm (checkpoint 25.000) es una política vision-language-action (VLA) para robótica aérea desarrollada por el usuario hanapasta como parte de su campaña de disertación de máster. Concretamente, adapta la política preentrenada `lerobot/pi0` a un cuadricóptero equipado con un brazo de 2 grados de libertad y una pinza paralela, y la evalúa en el simulador MuJoCo 3.3.4. El problema que aborda es la manipulación aérea: hacer que un dron sea capaz de aproximarse, seleccionar y agarrar objetos mediante instrucciones multimodales.

El interés de este checkpoint es metodológico más que de rendimiento. Se trata de una ablación de una sola variable: en lugar de delegar el control de las articulaciones del brazo en un controlador determinista de fase de tarea, la propia política emite directamente los comandos de las dos articulaciones. La model card es explícita al respecto: el resultado es peor en todos los ejes que la política Base v2 de la que parte.

Por tanto, no es un modelo pensado para producción ni para uso general, sino un artefacto de investigación reproducible que documenta un resultado negativo dentro de un protocolo de evaluación congelado (`eval_v2.py`, 60 episodios de pick y 20 de navegación, escenas emparejadas). Su licencia MIT y la publicación del código y del registro experimental completo lo hacen útil como referencia para quien trabaje en descomposición política-controlador en VLA aplicados a robótica aérea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `lerobot/pi0`; no se detalla la arquitectura interna en la información disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoint de política pi0/LeRobot; no se documentan formatos alternativos) |
| Modelo base | `lerobot/pi0` |
| Inicializado desde | `lerobot/pi0` base |
| Datos de entrenamiento | `hanapasta/airvla_v3` (v2 reetiquetado con deltas de articulaciones del brazo) |
| Pasos de entrenamiento | 30.000; se selecciona el checkpoint 25.000 |
| Criterio de selección | menor MSE de validación con ruido fijado (pinned-noise) sobre la escalera de checkpoints guardados |
| Entidad robótica | cuadricóptero con brazo de 2 grados de libertad y pinza paralela |
| Entorno de evaluación | MuJoCo 3.3.4 |
| Pipeline declarado | robotics |
| Autor | hanapasta |
| Fecha de creación | 2026-09-18 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo parte de `lerobot/pi0` y que se ha ajustado sobre el conjunto de datos `hanapasta/airvla_v3`, obtenido reetiquetando el dataset v2 con deltas de las articulaciones del brazo. No se especifican en la model card el número de parámetros, la composición del dataset, el número de tokens vistos ni si se aplicaron técnicas de alineación como RLHF o DPO. La innovación que define este checkpoint es de diseño de control: la política emite directamente los comandos de las dos articulaciones del brazo, sustituyendo al controlador determinista de fase de tarea que utiliza la política Base v2. Se trata, por tanto, de una ablación controlada de una sola variable frente a esa Base.

El entrenamiento se prolongó 30.000 pasos y el checkpoint publicado es el 25.000, elegido por el menor error cuadrático medio de validación bajo ruido fijado (pinned-noise) dentro de la escalera de checkpoints guardados. La evaluación se realizó con el arnés congelado `eval_v2.py` del repositorio de código, con 60 episodios de pick y 20 de navegación sobre escenas emparejadas. La model card advierte que la comparación con los resultados archivados solo es válida con MuJoCo 3.3.4, ya que otra versión del simulador altera el comportamiento de contacto lo suficiente como para invalidarla.

## Capacidades

- Control visomotor para manipulación aérea: genera acciones de bajo nivel para un cuadricóptero con brazo de 2 grados de libertad y pinza paralela.
- Selección de objetivo guiada por política: en el protocolo de evaluación acierta el objetivo correcto en 38 de 60 episodios de pick.
- Navegación: completa 7 de 20 episodios de navegación del protocolo congelado.
- Control directo de articulaciones: emite comandos de las dos articulaciones del brazo sin controlador determinista intermedio (esta es precisamente la variable ablacionada).
- Naturaleza vision-language-action: al derivar de pi0, la política es de tipo VLA, aunque la model card no detalla las capacidades de lenguaje, tool calling o razonamiento multitepo del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Estudio de descomposición política-controlador: este checkpoint sirve como condición experimental en la que la política asume el control directo de las articulaciones, permitiendo cuantificar cuánto aporta (o resta) frente a un controlador determinista de fase de tarea. Es su uso primario y el motivo por el que se publicó.
- Control negativo en publicaciones: dado que la model card afirma que es peor en todos los ejes que la Base v2, resulta útil como referencia negativa al reportar mejoras de arquitecturas de control en manipulación aérea.
- Reproducción de resultados de una disertación: con el arnés `eval_v2.py`, el comando documentado y MuJoCo 3.3.4, un investigador puede replicar la tabla de resultados congelada y verificar la afirmación de degradación.
- Ablaciones con reetiquetado de datos: el pipeline que generó `airvla_v3` a partir del v2 añadiendo deltas de articulaciones es reutilizable para estudiar cómo el etiquetado de acciones afecta al aprendizaje de políticas VLA.
- Experimentos de simulación a realidad en robótica aérea: como punto de partida para estudiar la transferencia de políticas entrenadas en MuJoCo a plataformas físicas de dron con brazo, sabiendo de antemano que la tasa de agarre en simulación es nula y que habrá que corregir el diseño de control antes de dar el salto.
- Docencia y prototipado de pipelines VLA: permite montar un flujo completo (checkpoint pi0, dataset LeRobot, evaluación en MuJoCo, vídeo de episodios) sin partir de cero, útil en cursos o proyectos de máster sobre VLA.
- Comparación de checkpoints dentro de una misma escalera de entrenamiento: el criterio de selección basado en MSE de validación con ruido fijado es replicable para estudiar la relación entre esa métrica y el éxito real en tarea.

## Benchmarks y rendimiento

Resultados del protocolo congelado publicado en la model card (n = 60 episodios de pick + 20 de navegación, escenas emparejadas):

| Metrica | AirVLA V3-arm (step 25.000) | Base v2 de la misma campaña |
|---|---|---|
| Agarre conseguido (pick) | 0 / 60 | 1 / 60 |
| Objetivo correcto (pick) | 38 / 60 | 42 / 60 |
| Mediana de distancia | 264,2 mm | 170,8 mm |
| Distancia objetivo-real (target-true) | 139,4 mm | no disponible |
| Navegación completada | 7 / 20 | 9 / 20 |

La model card califica el resultado como «peor en todos los ejes» respecto a la política Base v2. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no se detalla la definición exacta de las dos métricas de distancia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican cifras de memoria, cuantizaciones ni perfiles de despliegue.
- GPU recomendadas: no disponible. Al derivar de `lerobot/pi0`, se trata de una política de gran tamaño que en la práctica requiere aceleración por GPU, pero la información proporcionada no concreta modelos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan soportes tipo vLLM, llama.cpp, Ollama o TGI. El único método de ejecución descrito es el arnés `eval_v2.py` del repositorio, con MuJoCo 3.3.4 como simulador.
- Latencia y throughput: no disponible.
- Comando de evaluación documentado:
  `python eval_v2.py <this_checkpoint> 60 20 --torchseed 1000 --tag run --video`
- Advertencia de entorno: usar una versión de MuJoCo distinta de la 3.3.4 invalida la comparación con los resultados archivados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el protocolo congelado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hanapasta/airvla_v3arm_25000` | no disponible | no disponible | 0/60 agarre, 38/60 objetivo correcto, 264,2 mm, 7/20 navegación | MIT | HuggingFace (0 descargas, 0 likes) |
| Base v2 de la campaña AirVLA (controlador de fase de tarea) | no disponible | no disponible | 1/60 agarre, 42/60 objetivo correcto, 170,8 mm, 9/20 navegación | no disponible | Referenciada en la model card; no se enlaza un repositorio propio |
| `lerobot/pi0` (modelo base) | no disponible en la información proporcionada | no disponible | no evaluado en este protocolo | no disponible en la información proporcionada | Repositorio LeRobot |

No se dispone de datos de benchmarks comparables frente a otras políticas VLA de manipulación aérea, por lo que la comparativa se limita a las tres variantes de la propia campaña y al modelo base.

## Limitaciones y advertencias

- Rendimiento insuficiente para uso real: 0 de 60 agarres conseguidos en el protocolo de evaluación. No debe desplegarse en ningún sistema físico sin una revisión completa del diseño de control.
- Regresión respecto a su predecesor: la model card indica explícitamente que es peor que la política Base v2 en todos los ejes, lo que sugiere que delegar el control de las articulaciones en la política no funciona en esta configuración.
- Resultado negativo de una ablación, no un modelo final: es un artefacto de disertación de máster, sin mantenimiento ni soporte declarados.
- Dependencia estricta del simulador: los resultados solo son comparables con MuJoCo 3.3.4; otras versiones cambian el comportamiento de contacto.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo, y en el caso de una política robótica el sesgo relevante sería de distribución de escenas y objetos, que no se detalla.
- Riesgo de alucinación: no disponible en el sentido lingüístico. En el plano motor, el riesgo equivalente es la emisión de comandos de articulación fuera de rango o inconsistentes, dado que la política controla las articulaciones directamente sin controlador determinista que las valide.
- Limitaciones de contexto e idioma: no disponible.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribución y conservación del aviso de copyright; no obstante, la licencia del modelo base `lerobot/pi0` debe verificarse por separado antes de cualquier uso comercial.
- Ausencia de tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa independiente.
- Caveat de producción: no hay datos de latencia, throughput, VRAM ni robustez fuera de distribución, por lo que no es posible estimar su viabilidad en un sistema embarcado.

## Enlaces

- [Modelo en HuggingFace: hanapasta/airvla_v3arm_25000](https://huggingface.co/hanapasta/airvla_v3arm_25000)
- [Repositorio de código, guía de reproducción y registro experimental: robotics-hana/drone-version2](https://github.com/robotics-hana/drone-version2)
- [Modelo base: lerobot/pi0](https://huggingface.co/lerobot/pi0)
- [Dataset de entrenamiento citado: hanapasta/airvla_v3](https://huggingface.co/datasets/hanapasta/airvla_v3)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a un foro en polaco sin relación con el proyecto.
