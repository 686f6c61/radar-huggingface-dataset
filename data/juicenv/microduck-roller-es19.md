# juicenv/microduck-roller-es19

## Resumen

juicenv/microduck-roller-es19 es una politica de control (policy) para el robot microduck de Pollen Robotics, no un modelo de lenguaje. Se trata de un gait o patron de marcha destilado en un fichero ONNX que se carga en una ranura de politica del daemon del robot mediante `robotctl`. El modelo resuelve una tarea muy concreta: hacer que el microduck sobre ruedas (rollers) recorra el Roller Sprint de 2 metros en el menor tiempo posible, de forma perpetua, es decir, sin condicion de parada propia.

El modelo deriva de DenRakEiw/microduck-senate_duck_1016 (1.016 s en el scorer de Arena roller) y se ha ajustado mediante estrategias evolutivas (evolution strategies) sobre ese mismo scorer, con busqueda realizada en x86, hasta alcanzar 0.972 s. El entrenamiento base se hizo con el repositorio pollen-robotics/microduck_rl (rama `hannes-ft`, commit `3c0598cae`).

Es relevante en el contexto de la robotica open source de bajo coste y del aprendizaje por refuerzo aplicado a locomocion: demuestra un flujo completo de entrenamiento en simulacion, ajuste con busqueda evolutiva y despliegue en hardware real a partir de un artefacto ONNX pequeno, cargable en caliente en el robot. La ficha publica no declara licencia, idiomas ni datos de entrenamiento detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica para control robotico, exportada a ONNX; entrenada con aprendizaje por refuerzo y ajustada con estrategias evolutivas. No es un transformer, MoE ni SSM |
| Parametros totales | no disponible (el repositorio ocupa 0.0 GB segun HuggingFace) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es un vector de observacion de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible (se distribuye un unico `policy.onnx` con el normalizador de observaciones integrado) |
| Idiomas soportados | no aplica (modelo de control robotico); no disponible en la ficha |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` conforme al schema 2 del manifiesto de politicas de microduck |

Datos adicionales de interfaz: 61 dimensiones de observacion, 14 acciones, frecuencia de control de 50 Hz, operacion sobre rollers.

## Arquitectura y entrenamiento

No se publica el detalle de la topologia de red. Por la naturaleza del pipeline (pollen-robotics/microduck_rl) se trata de una politica de control que mapea un vector de observacion de 61 dimensiones a 14 acciones, ejecutada en bucle cerrado a 50 Hz. El artefacto distribuido es un unico `policy.onnx` con el normalizador de observaciones embebido, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional.

El entrenamiento base corresponde al modelo DenRakEiw/microduck-senate_duck_1016, del que este modelo es un fine-tune declarado (`base_model_relation: finetune`). El ajuste se realizo mediante estrategias evolutivas sobre el scorer de Arena roller, con la busqueda ejecutada en x86. El resultado reportado es una mejora de 1.016 s a 0.972 s en la tarea de sprint de 2 metros. No se especifican en la informacion disponible el numero de iteraciones, la poblacion de la busqueda evolutiva, la composicion del dataset de entrenamiento ni si hubo etapas de RLHF/DPO (conceptos que, por otra parte, no aplican a este tipo de modelo).

## Capacidades

- Generacion de marcha perpetua sobre rollers para el robot microduck: la politica se ejecuta de forma continua hasta que se le indique lo contrario.
- Control de locomocion a 50 Hz con un vector de observacion de 61 dimensiones y 14 acciones.
- Ejecucion de la tarea Roller Sprint de 2 metros, con un tiempo medido de 0.972 s en el scorer de Arena roller.
- Carga en caliente en el robot mediante slots de politica (`robotctl policy load <slot> ...`).
- Autocontencion del preprocesado: el normalizador de observaciones esta integrado en `policy.onnx`, por lo que acepta observaciones sin normalizar.
- Compatibilidad con el manifiesto de politicas de microduck (schema 2), lo que facilita su integracion en el daemon.
- No dispone de capacidades de lenguaje, vision, audio, razonamiento simbolico, tool calling ni agentes multi-paso: es exclusivamente una politica de control motor.

## Casos de uso

- Control de marcha en el robot microduck sobre rollers: cargar `juicenv/microduck-roller-es19` en un slot mediante `robotctl policy load` para que el robot ejecute un sprint perpetuo de 2 metros en la pista de Arena roller.
- Benchmark de referencia para aprendizaje por refuerzo: usar el tiempo de 0.972 s como linea base cuantitativa al comparar nuevos metodos de entrenamiento o de busqueda evolutiva sobre el mismo scorer.
- Investigacion en ajuste por estrategias evolutivas: el modelo documenta un caso real de fine-tune por ES partiendo de una politica ya entrenada, util como punto de partida para estudiar convergencia y sensibilidad al scorer.
- Pruebas de simulacion a real (sim-to-real) en robotica de bajo coste: permite validar si una gait obtenida en busqueda sobre x86 se transfiere correctamente al hardware fisico.
- Demostraciones y divulgacion en robotica educativa: al ser un artefacto ONNX pequeno y una tarea medible, sirve para ilustrar el ciclo completo de entrenamiento, exportacion y despliegue en un robot real.
- Composicion de comportamientos por slots: combinado con otras politicas cargadas en slots distintos, permite alternar entre marchas (por ejemplo, sprint y otras gaits) sin reiniciar el daemon.
- Integracion en pipelines de CI para politicas roboticas: el formato ONNX y el manifiesto con schema fijo permiten validar automaticamente que un nuevo artefacto se carga y se ejecuta a 50 Hz antes de desplegarlo.
- Recogida de datos de locomocion: ejecutar la politica de forma perpetua para registrar trazas de observacion y accion que alimenten posteriores entrenamientos o analisis de estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (tipo MMLU, HumanEval o GSM8K) en la informacion disponible, ya que no se trata de un modelo de lenguaje. El unico dato de rendimiento publicado es la metrica de tarea en el scorer de Arena roller:

| Modelo | Tiempo en Roller Sprint (2 m) | Notas |
|---|---|---|
| DenRakEiw/microduck-senate_duck_1016 (base) | 1.016 s | Politica base entrenada con pollen-robotics/microduck_rl |
| juicenv/microduck-roller-es19 | 0.972 s | Fine-tune por estrategias evolutivas, busqueda en x86 |

Mejora reportada: 0.044 s de reduccion sobre la base, aproximadamente un 4.3 por ciento menos de tiempo en la tarea. No se indican intervalos de confianza, numero de episodios ni condiciones exactas de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser una politica ONNX de muy bajo peso (el repositorio ocupa 0.0 GB), no se espera un requisito de VRAM significativo, pero no hay dato publicado.
- GPU recomendadas: no disponible. El flujo de despliegue documentado es en el propio robot, no en servidores con GPU.
- Compatibilidad con GPU de consumo: no aplica segun la informacion disponible; el modelo esta pensado para ejecutarse en el robot.
- Hardware objetivo: robot microduck de Pollen Robotics, con bucle de control a 50 Hz sobre rollers.
- Opciones de despliegue: daemon de microduck mediante `robotctl policy load <slot> juicenv/microduck-roller-es19`; inferencia ONNX (ONNX Runtime u otro runtime compatible con ONNX, no especificado).
- Latencia y throughput: el bucle de control a 50 Hz implica un presupuesto de 20 ms por paso (61 entradas, 14 salidas). No se publican medidas de latencia reales del runtime.
- Tamano del repositorio: 0.0 GB segun HuggingFace.

## Comparativa con modelos similares

| Modelo | Tipo | Metrica de tarea | Relacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-roller-es19 | Politica ONNX para microduck | 0.972 s en Roller Sprint 2 m | Fine-tune por ES | no disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| DenRakEiw/microduck-senate_duck_1016 | Politica para microduck | 1.016 s en Roller Sprint 2 m | Modelo base | no disponible | Publico en HuggingFace |
| Otras politicas de la familia microduck (por ejemplo, variantes roller-es de juicenv) | Politica para microduck | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No hay datos suficientes para comparar con alternativas de otros autores en terminos de parametros, contexto o rendimiento. La comparacion cuantitativa solo es posible con el modelo base.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican condiciones de uso, lo que impide confirmar si se permite uso comercial o derivados. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Especificidad de hardware extrema: la politica esta entrenada para el microduck sobre rollers; no hay evidencia de transferencia a otras plataformas, configuraciones de patas o superficies.
- Especificidad de tarea: esta optimizada para el scorer de Arena roller (sprint de 2 m). El ajuste por busqueda evolutiva sobre una metrica concreta puede implicar sobreajuste a ese scorer y a las condiciones de medida.
- Politica perpetua: se ejecuta hasta que se le indique lo contrario, sin condicion de parada propia, lo que exige gestion externa (daemon o supervisor) para detenerla de forma segura.
- Sin informacion sobre robustez: no se documentan pruebas ante perturbaciones, cambios de bateria, desgaste de ruedas, irregularidades del suelo o variaciones de temperatura.
- Riesgo de sobreajuste sim-to-real: se reporta la busqueda en x86, pero no se detallan diferencias entre entorno de busqueda y robot real ni tasas de exito o de caida.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento del registro; no hay informes independientes de reproducibilidad.
- Sin datos de entrenamiento publicados: no se conocen el volumen de episodios, la funcion de recompensa exacta ni la composicion del dataset, lo que limita la reproducibilidad.
- Observacion en crudo obligatoria: como el normalizador esta embebido en `policy.onnx`, alimentar observaciones ya normalizadas produciria un comportamiento incorrecto.
- Fechas de creacion y actualizacion registradas como 2026-10-15, posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-roller-es19
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_1016
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `hannes-ft`, commit `3c0598cae`
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
