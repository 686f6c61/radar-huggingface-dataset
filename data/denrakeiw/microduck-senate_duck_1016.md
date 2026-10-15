# DenRakEiw/microduck-senate_duck_1016

## Resumen

`microduck-senate_duck_1016` es una politica de control (policy) de aprendizaje por refuerzo entrenada para el robot bipedo microduck de Pollen Robotics. No es un modelo de lenguaje: es una red neuronal de control que, a partir de una observacion de 61 dimensiones, emite 14 acciones a 50 Hz para que el robot camine sobre rodillos (rollers). El autor es el usuario DenRakEiw y se publica bajo el slot `walk` del sistema de politicas del demonio `robotctl`.

Segun la model card, se trata de una policy de tipo "Roller Sprint" de 2 m, en modo carrera, afinada mediante estrategias de evolucion (evolution strategies, ES) sobre el scorer de rodillos de la Arena. La politica es perpetua: se ejecuta de forma continua hasta que se le indique lo contrario. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

El modelo se distribuye como un fichero `policy.onnx` con el normalizador de observaciones integrado (se alimenta con observaciones crudas) mas un `manifest.json` compatible con el esquema 2 del manifiesto de politicas de microduck. Es relevante para quienes trabajan con el ecosistema microduck y quieren reutilizar o comparar gaits de locomocion entrenados por RL y ES. No hay informacion publica sobre arquitectura de red, licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de control (RL) exportada a ONNX; topologia interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje); ventana de observacion de 61 dimensiones |
| Tipos de cuantizacion | no disponible (pesos servidos en formato ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompanado de `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de despliegue | `walk` |

## Arquitectura y entrenamiento

La model card no detalla la topologia de la red. Se sabe que es una politica de aprendizaje por refuerzo que mapea una observacion de 61 dimensiones a 14 acciones y que opera a 50 Hz sobre el microduck. La politica se empaqueta como un grafo ONNX (`policy.onnx`) con el normalizador de observaciones incorporado, de modo que la entrada esperada son observaciones crudas sin preprocesado externo. El fichero `manifest.json` sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del demonio.

Respecto al entrenamiento, la model card indica que se trata de un "2 m Roller Sprint" en modo carrera, afinado mediante estrategias de evolucion sobre el scorer de rodillos de la Arena. El entrenamiento se realizo en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `8dafac487`. No se especifican el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO, datos que no aplican a este tipo de modelo. Tampoco se documenta el numero de iteraciones de ES, la funcion de recompensa exacta ni el presupuesto de computo empleado.

## Capacidades

- Locomocion sobre rodillos: genera una marcha perpetua para el microduck cuando se encuentra sobre rollers, ejecutandose de forma continua hasta recibir una orden de parada.
- Control a 50 Hz: emite 14 acciones de control por ciclo a 50 Hz, adecuado para el bucle de control de bajo nivel del robot.
- Entrada de observaciones crudas: el normalizador esta integrado en el ONNX, por lo que acepta las 61 dimensiones de observacion sin transformacion previa.
- Modo carrera: la politica esta orientada a un sprint de 2 m sobre el scorer de la Arena, es decir, optimizada para velocidad en un recorrido corto bajo condiciones de rodillos.
- Integracion con el ecosistema microduck: se carga mediante `robotctl policy load walk ...` en el slot `walk`.
- Sin capacidades de lenguaje, vision, tool calling, agentes ni razonamiento multi-paso: no es un modelo de proposito general, sino una politica de control motora.

## Casos de uso

- Investigacion en locomocion RL: sirve como referencia reproducible de una gait entrenada por RL y afinada por evolution strategies para el microduck; util para comparar metodos de optimizacion sobre el mismo robot y el mismo scorer.
- Benchmark interno de politicas: al estar asociada a un scorer de la Arena, permite medir el rendimiento de una politica de sprint de 2 m frente a otras variantes del mismo autor y del repositorio de entrenamiento.
- Demostraciones educativas: en talleres de robotica, cargar esta politica en el slot `walk` muestra de forma directa como una red ONNX controla un bipedo real a 50 Hz.
- Pruebas de integracion del demonio `robotctl`: resulta util para validar el flujo de carga de politicas, el esquema 2 del manifiesto y la reproduccion de observaciones normalizadas.
- Optimizacion de control sobre rodillos: en plataformas de test con rollers permite estudiar la transferencia de politicas entrenadas en simulacion al hardware fisico.
- Base para fine-tuning con ES: dado que fue afinada por estrategias de evolucion, puede servir como punto de partida para nuevas rondas de optimizacion sobre otros scorers o distancias.
- Comparacion de variantes de marcha: junto con otras politicas del mismo autor, facilita estudios de robustez y velocidad entre distintas gaits para el mismo slot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única referencia cuantitativa aportada por el autor es la descripcion de la tarea ("2 m Roller Sprint") y las condiciones de operacion (61-D de observacion, 14 acciones, 50 Hz), pero no se incluyen metricas de tiempo, distancia recorrida, exito de episodios ni comparaciones numericas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica el tamano de la red ni el numero de parametros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible. Dado que el modelo se despliega en el robot mediante `robotctl` y se ejecuta a 50 Hz sobre una politica de control, es probable que la inferencia se realice en el computo embebido del microduck o en CPU, pero este extremo no se confirma en la informacion disponible.
- Opciones de despliegue: carga en el robot mediante `sudo robotctl policy load walk DenRakEiw/microduck-senate_duck_1016`. El modelo se distribuye como ONNX, por lo que cualquier runtime compatible con ONNX (ONNX Runtime, etc.) podria ejecutar el grafo, aunque no se documenta soporte explicito.
- Latencia y throughput: no disponible. El unico dato de cadencia conocido es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-senate_duck_1016 (este) | Politica RL/ES para microduck | 61-D / 14 | 50 Hz | no disponible | HuggingFace (DenRakEiw) |
| microduck-senate_duck_1456 | Politica RL para microduck | no disponible | no disponible | no disponible | HuggingFace (DenRakEiw) |
| Otras politicas del ecosistema microduck | Politicas RL para microduck | no disponible | no disponible | no disponible | Repositorio `pollen-robotics/microduck_rl` |

No se dispone de datos de rendimiento comparables entre estas politicas. La unica alternativa directamente identificada en la busqueda es `DenRakEiw/microduck-senate_duck_1456`, del mismo autor, sin especificaciones publicas detalladas.

## Limitaciones y advertencias

- Especifica de rodillos: la politica esta descrita para su uso "on rollers"; no hay evidencia de que sea valida sobre otras superficies o sin los rodillos.
- Tarea acotada: esta optimizada para un sprint de 2 m en modo carrera sobre el scorer de la Arena; su comportamiento fuera de ese escenario no esta documentado.
- Politica perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, por lo que el sistema anfitrion debe gestionar correctamente la parada.
- Normalizador integrado: se debe alimentar con observaciones crudas; cualquier normalizacion adicional por parte del usuario alteraria las entradas esperadas por la red.
- Sin licencia declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Sin datos de parametros ni arquitectura: imposible estimar coste de inferencia, memoria o latencia a partir de la informacion publicada.
- Riesgo de sobreajuste al scorer: al haberse afinado por evolution strategies sobre un scorer concreto de la Arena, el rendimiento puede degradarse en condiciones fisicas distintas (rozamiento, bateria, desgaste de motores).
- Sin benchmarks publicados: no hay metricas de exito, estabilidad ni robustez que permitan validar el modelo antes de desplegarlo.
- Idiomas y sesgos: no aplica en el sentido de un modelo de lenguaje; las limitaciones relevantes son de dominio fisico y de generalizacion de la politica, no linguisticas.
- Trazabilidad limitada: solo se documenta el commit `8dafac487` de la rama `denrakeiw`, sin mas contexto de reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-senate_duck_1016
- Politica relacionada del mismo autor: https://huggingface.co/DenRakEiw/microduck-senate_duck_1456
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `denrakeiw`, commit `8dafac487`)
- Tutorial de montaje de microduck: https://github.com/AI-FanGe/Microduck-build-tutorial
- Pagina oficial del producto microduck: https://pollen-robotics.com/microduck/
- Modelos 3D de microduck en MakerWorld: https://makerworld.com/en/search/models?keyword=tag%3A+microduck
