# juicenv/microduck-sprint-es5

## Resumen

microduck-sprint-es5 es una politica de control para robot, no un modelo de lenguaje: concretamente una politica de locomocion de sprint de 2 metros para el robot microduck de Pollen Robotics. La publica el usuario juicenv como un fine-tune del modelo HannesVonEssen/microduck-running (Apache-2.0), obtenido mediante estrategias de evolucion (evolution strategies) sobre el propio scorer de sprint de la Arena (quinta ronda).

Se distribuye como un unico policy.onnx acompanado de un manifest.json conforme al esquema 2 del manifiesto de politicas de microduck. La politica es perpetua: ejecuta una marcha continua hasta que se le indique lo contrario y se carga en una ranura de politica del daemon del robot. Trabaja con observaciones de 61 dimensiones, produce 14 acciones y opera a 50 Hz.

Su relevancia es acotada y muy especifica: sirve como marcha de sprint lista para desplegar en microduck mediante robotctl, y como punto de partida para experimentos de fine-tuning con ES sobre politicas de locomocion ya entrenadas. No hay resultados de benchmarks publicados ni documentacion de arquitectura de red en la model card, por lo que su evaluacion tecnica queda limitada a lo que declara el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal de control (locomocion) exportada a ONNX; topologia de red no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control a 50 Hz, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye un unico archivo policy.onnx) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible en el repositorio; el modelo base HannesVonEssen/microduck-running es Apache-2.0 |
| Formato de pesos | ONNX (policy.onnx) + manifest.json (esquema 2 del manifiesto de politicas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | Perpetua (se ejecuta hasta que se detiene explicitamente) |
| Normalizador de observaciones | Integrado en policy.onnx (se alimentan observaciones en crudo) |
| Modelo base | HannesVonEssen/microduck-running |
| Relacion con el base | fine-tune (segun el autor, via evolution strategies) |
| Libreria | microduck |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base HannesVonEssen/microduck-running, entrenado segun el autor mediante estrategias de evolucion (evolution strategies) sobre el scorer de sprint de la Arena, en su quinta ronda. El resultado es una politica de locomocion perpetua para microduck, con un espacio de observacion de 61 dimensiones y 14 acciones, ejecutada a 50 Hz. El repositorio de entrenamiento indicado es pollen-robotics/microduck_rl, rama lean, commit 5a3636302.

La model card no detalla la topologia concreta de la red (numero de capas, unidades, tipo de capas) ni el volumen o la composicion de los datos de entrenamiento, el numero de iteraciones de la ES ni la funcion de recompensa exacta mas alla de referirse al scorer de sprint de la Arena. La unica innovacion tecnica explicitamente documentada es que el normalizador de observaciones esta integrado ("baked") dentro de policy.onnx, de modo que la politica acepta observaciones en crudo sin preprocesado externo por parte del usuario.

## Capacidades

- Locomocion de sprint: ejecuta una marcha de sprint de 2 metros sobre el robot microduck.
- Politica perpetua: mantiene la marcha de forma continua hasta que se le indica que se detenga.
- Entrada de observaciones en crudo: al llevar el normalizador integrado en policy.onnx, acepta el vector de observacion tal cual lo entrega el robot.
- Control a 50 Hz sobre un espacio de 61 observaciones y 14 acciones.
- Carga en el daemon del robot: se instala en una ranura de politica mediante robotctl.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades multilingues; no es un modelo generativo.

## Casos de uso

- Marcha de sprint en microduck: cargar la politica en una ranura con `sudo robotctl policy load <slot> juicenv/microduck-sprint-es5` para que el robot ejecute una marcha de sprint de 2 metros de forma continua.
- Competiciones y evaluaciones en la Arena: usar la politica como candidata de la quinta ronda para medir su desempeno contra el scorer de sprint del propio entorno.
- Punto de partida para fine-tuning: servir como inicializacion para nuevos ciclos de evolution strategies sobre variantes de marcha, dado su origen como fine-tune de microduck-running.
- Comparacion de gaitas: mantener varias politicas cargadas en distintas ranuras y alternarlas para contrastar comportamientos de locomocion bajo las mismas condiciones.
- Laboratorio docente de robotica: demostrar el ciclo completo de carga de una politica ONNX en un robot real y observacion de una marcha aprendida por RL.
- Investigacion sobre sim-to-real: emplear la politica como caso de estudio de transferencia de politicas entrenadas en simulacion al hardware microduck, midiendo degradacion respecto al scorer de entrenamiento.
- Reproducibilidad de experimentos: al estar documentados el repositorio, la rama y el commit de entrenamiento, permite replicar el pipeline sobre el mismo punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el entrenamiento se hizo contra el scorer de sprint de la Arena (quinta ronda), pero no incluye cifras de rendimiento, tiempos, distancias alcanzadas ni comparaciones numericas con el modelo base o con otras politicas.

## Requisitos de hardware

- VRAM para inferencia: no aplica en el sentido habitual; la politica se ejecuta como inferencia ONNX sobre el hardware del propio robot microduck, no sobre una GPU de servidor. No se especifican requisitos de VRAM.
- GPU recomendadas: no disponibles para este modelo; el autor no indica GPU ni equipo de inferencia.
- Ejecucion en hardware de consumo: el objetivo de despliegue es el robot, no una GPU de consumo tipo RTX 4090. No hay datos sobre el coste de computo.
- Opciones de despliegue: runtime ONNX dentro del daemon de microduck, cargando la politica en una ranura mediante robotctl. Alternativas como vLLM, llama.cpp, Ollama o TGI no aplican a una politica de control ONNX.
- Latencia y throughput: no disponibles; el unico dato de temporizacion es la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo).

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-sprint-es5 | Politica de locomocion (fine-tune por ES) | 61 / 14 | 50 Hz | no disponible (base Apache-2.0) | HuggingFace, 0 descargas, 0 likes |
| HannesVonEssen/microduck-running | Politica de locomocion (modelo base) | no disponible en la informacion proporcionada | no disponible | Apache-2.0 | HuggingFace |
| Otras politicas de locomocion para microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion se limita al modelo base declarado por el autor, del cual sprint-es5 deriva por fine-tune. No se dispone de datos de otras politicas comparables ni de cifras de rendimiento que permitan un contraste cuantitativo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta codigo y no soporta tool calling ni agentes. Cualquier expectativa propia de un LLM es inaplicable.
- Sesgos: no aplica en el sentido de sesgos de datos textuales; el comportamiento depende de la funcion de recompensa del scorer de sprint y puede explotar atajos de la misma.
- Alucinacion: no aplica como tal; el riesgo analogo es una marcha que se comporte de forma inesperada fuera de las condiciones de entrenamiento.
- Licencia: el repositorio no declara licencia propia, por lo que no esta claro bajo que terminos puede redistribuirse; el modelo base es Apache-2.0 y conviene verificar la compatibilidad antes de un uso comercial.
- Politica perpetua: al ejecutarse hasta que se detiene explicitamente, requiere gestion activa del ciclo de vida para evitar que el robot siga moviendose cuando no deberia.
- Ausencia de benchmarks: no hay cifras publicadas de exito, distancia o robustez, lo que impide estimar su rendimiento real antes de probarla.
- Brecha sim-to-real: no se documenta el entorno de entrenamiento ni el grado de transferencia al robot fisico, un factor critico en politicas de locomocion.
- Falta de documentacion tecnica: la model card no detalla topologia de red, datos de entrenamiento ni hiperparametros, lo que dificulta auditar o reproducir el resultado mas alla del commit indicado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-sprint-es5
- Modelo base: https://huggingface.co/HannesVonEssen/microduck-running
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (RL): pollen-robotics/microduck_rl, rama `lean`, commit `5a3636302` (no se proporciona URL directa en la informacion disponible)
