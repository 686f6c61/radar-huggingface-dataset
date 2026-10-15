# juicenv/microduck-sprint-es7

## Resumen

microduck-sprint-es7 es una política de control para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario juicenv como un *fine-tune* del modelo HannesVonEssen/microduck-running. No es un modelo de lenguaje: es un gait (patrón de marcha) entrenado para una tarea concreta, la carrera de sprint de 2 metros, y se empaqueta como un fichero ONNX que se carga en una ranura de política del daemon del robot. La observación de entrada tiene 61 dimensiones, la salida 14 acciones, y el bucle de control funciona a 50 Hz.

El modelo se obtiene aplicando estrategias evolutivas y una búsqueda de ganancias de motor sobre la iteración 11748 del modelo base, evaluando contra el *scorer* de sprint propio del entorno Arena. La model card lo describe como una política "perpetua": una vez cargada, el robot mantiene la marcha hasta que se le indique lo contrario, lo que la distingue de políticas episódicas.

Su relevancia es acotada pero clara dentro del ecosistema microduck: es un ejemplo de refinamiento de políticas de locomoción con un coste de cómputo bajo, distribuido a través de Hugging Face y desplegable con un solo comando (`robotctl policy load`). El repositorio pesa 0,0 GB, no tiene descargas ni *likes*, y la licencia de esta revisión concreta no está declarada en la ficha de Hugging Face, aunque el modelo base del que deriva se cita como Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control exportada a ONNX; no se documenta la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control reactiva; sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuye un `policy.onnx`; no se declaran variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, no procesa lenguaje natural) |
| Licencia | no disponible en la ficha de Hugging Face; el modelo base HannesVonEssen/microduck-running se cita como Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json`, esquema 2 del manifiesto de políticas de microduck |
| Tarea (pipeline) | robotics |
| Entorno de ejecucion | daemon de microduck, cargado mediante `robotctl` |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modelo base | HannesVonEssen/microduck-running (relacion: finetune), iteracion 11748 |
| Fecha de creacion (Hugging Face) | 2026-10-14 |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La información disponible no describe la topología de la red neuronal subyacente. Lo que sí se documenta es el formato de entrega y el interfaz: un fichero `policy.onnx` con el normalizador de observaciones integrado en el propio grafo, de modo que el consumidor debe alimentar observaciones en crudo (*raw observations*) sin preprocesado adicional. El manifest asociado sigue el esquema 2 del manifiesto de políticas del daemon de microduck, descrito en `docs/policy-manifest.md` del repositorio del daemon. La política opera como un controlador perpetuo a 50 Hz: recibe un vector de 61 dimensiones y emite 14 acciones, sin condición de terminación interna.

El entrenamiento parte de la iteración 11748 del modelo HannesVonEssen/microduck-running y se refina mediante dos técnicas declaradas: estrategias evolutivas (*evolution strategies*) y una búsqueda de ganancias de motor (*motor-gain search*). La función de evaluación utilizada es el *scorer* de sprint del propio entorno Arena, es decir, se optimiza directamente la métrica de la tarea objetivo en lugar de una recompensa genérica. No se especifican el número de iteraciones, el tamaño de la población evolutiva, la composición del dataset ni si hubo fases de RLHF o DPO, que en cualquier caso no aplicarían a este tipo de modelo. El código de entrenamiento se referencia en el repositorio `pollen-robotics/microduck_rl`, rama `hannes-ft`, commit `3c0598cae`.

## Capacidades

- Locomoción de sprint: ejecuta una marcha optimizada para recorrer 2 metros, evaluada con el *scorer* de sprint del entorno Arena.
- Control continuo a 50 Hz: bucle de política perpetuo, sin condición de parada interna; el robot mantiene la marcha hasta recibir una orden de detención o el cambio de ranura de política.
- Consumo de observaciones en crudo: el normalizador está embebido en el ONNX, por lo que acepta directamente el vector de 61 dimensiones del robot sin transformación externa.
- Salida de 14 acciones: compatible con el espacio de acciones del microduck tal y como lo define el daemon.
- Despliegue por ranura de política: se carga como *gait* en un *slot* del robot mediante `robotctl`, lo que permite alternarlo con otras políticas.
- Ajuste fino por evolución: la política es un punto de partida válido para nuevas rondas de optimización por estrategias evolutivas sobre el mismo *scorer*.
- No soporta *tool calling*, ni razonamiento multi-paso, ni capacidades multilingües, ni visión, audio o modo *thinking*: no es un modelo generativo de lenguaje.

## Casos de uso

- Demostración de sprint en microduck: cargar la política en una ranura con `robotctl policy load` y ejecutar la carrera de 2 metros para la que fue optimizada, usando el *scorer* de Arena como referencia de rendimiento.
- Comparación de gaits en el entorno Arena: al ser una política perpetua y determinista en su interfaz, sirve como línea base reproducible frente a otras políticas cargadas en ranuras distintas del mismo robot.
- Semilla para nuevas optimizaciones evolutivas: el modelo puede tomarse como punto de partida en `microduck_rl` (rama `hannes-ft`) y someterse a nuevas rondas de estrategias evolutivas, reduciendo el coste frente a entrenar desde cero.
- Búsqueda de ganancias de motor en otros robots microduck: la técnica de *motor-gain search* empleada aquí es transferible a unidades con calibración distinta, usando esta política como referencia de comportamiento objetivo.
- Docencia e investigación en robótica con refuerzo: el tamaño del repositorio (0,0 GB) y su formato ONNX lo hacen apto para prácticas donde el alumnado inspeccione, cargue y modifique políticas de locomoción en hardware real.
- Pruebas de regresión del daemon: integrar la carga de esta política en un pipeline de pruebas automatizadas que verifique que `robotctl` y el daemon aceptan el manifiesto de esquema 2 y ejecutan el bucle a 50 Hz.
- Validación de normalizadores embebidos: sirve para comprobar que un cliente de inferencia entrega observaciones en crudo con las 61 dimensiones y unidades correctas, ya que cualquier preprocesado adicional alteraría el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente indica que el modelo fue evaluado con el *scorer* de sprint del entorno Arena durante el proceso de optimización, pero no se proporciona ninguna cifra de tiempo, distancia, velocidad ni comparación numérica con el modelo base.

## Requisitos de hardware

- No se dispone de cifras publicadas de VRAM, latencia ni *throughput*. El repositorio ocupa 0,0 GB y el artefacto es un único fichero ONNX con el normalizador integrado, lo que apunta a un modelo de muy pocos parámetros y a inferencia en CPU dentro del propio robot o de su equipo de control.
- No se documenta qué GPU, si alguna, es necesaria o recomendada. No hay evidencia en la información disponible de que el modelo requiera aceleración por GPU.
- Ejecución en GPU de consumo: no disponible. No se puede confirmar ni descartar sin datos de tamaño del modelo.
- Despliegue recomendado: mediante el daemon de microduck y el comando `robotctl policy load <slot> juicenv/microduck-sprint-es7`, que carga el gait en una ranura de política.
- Runtimes alternativos: al ser ONNX, sería ejecutable con ONNX Runtime, pero no hay instrucciones oficiales para hacerlo fuera del daemon. Herramientas como vLLM, llama.cpp, Ollama o TGI no aplican: no es un modelo de lenguaje y no se publican pesos en GGUF.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz del bucle de política, que implica un presupuesto de 20 ms por ciclo de inferencia más el resto de la pila de control.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-sprint-es7 | no disponible | 61-D / 14 acciones a 50 Hz | no aplica | no disponible (base Apache-2.0) | Hugging Face, formato ONNX |
| HannesVonEssen/microduck-running (iteracion 11748) | no disponible | 61-D / 14 acciones a 50 Hz | no aplica | Apache-2.0 segun la model card del derivado | Hugging Face |
| Otras politicas de microduck | no disponible | no disponible | no aplica | no disponible | no disponible |

La comparación directa solo es posible frente al modelo base. La model card no aporta métricas del *scorer* de sprint para ninguno de los dos, por lo que no se puede cuantificar la mejora obtenida con las estrategias evolutivas y la búsqueda de ganancias de motor. No se identifican en la información proporcionada otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Especialización extrema: la política está optimizada para una única tarea (sprint de 2 metros) evaluada por un *scorer* concreto; no hay evidencia de que generalice a otras marchas, terrenos u objetivos.
- Política perpetua: la model card indica explícitamente que corre "hasta que se le diga lo contrario". En producción esto implica que cualquier fallo de la capa de control debe incluir una parada explícita; no hay condición de terminación interna que detenga el robot.
- Ambigüedad de licencia: la ficha de Hugging Face no declara licencia para esta revisión. El modelo base se cita como Apache-2.0, pero eso no garantiza por sí solo los términos aplicables al derivado. Verificar antes de cualquier uso comercial o redistribución.
- Sin benchmarks publicados: no hay cifras de rendimiento independientes que permitan validar la calidad de la marcha ni compararla con alternativas.
- Dependencia del normalizador embebido: el modelo espera observaciones en crudo con el formato exacto de 61 dimensiones y las unidades del robot. Cualquier normalización adicional en el cliente degradará el comportamiento.
- Sensibilidad a la calibración del hardware: la búsqueda de ganancias de motor se realizó contra una plataforma concreta; diferencias de calibración, desgaste o carga útil entre unidades pueden degradar la marcha.
- Riesgo de comportamiento fuera de distribución: no es un modelo generativo y no "alucina" en el sentido habitual, pero ante observaciones fuera del rango visto durante la optimización puede producir acciones erráticas sin señal de incertidumbre.
- Ausencia de métricas de sim-a-real: no se documenta cómo se transfirió la política al hardware físico ni cuántas iteraciones de ajuste en robot real fueron necesarias.
- Adopción nula y sin validación de la comunidad: 0 descargas y 0 *likes* en el momento de la consulta, lo que significa que no existe retroalimentación externa sobre su funcionamiento.
- Sin soporte de lenguaje, visión ni herramientas: cualquier expectativa de uso como asistente, agente o modelo multimodal queda descartada por completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juicenv/microduck-sprint-es7
- Modelo base: https://huggingface.co/HannesVonEssen/microduck-running
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento por refuerzo: `pollen-robotics/microduck_rl`, rama `hannes-ft`, commit `3c0598cae`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (esquema 2)
