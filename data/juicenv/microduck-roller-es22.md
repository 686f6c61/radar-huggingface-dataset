# juicenv/microduck-roller-es22

## Resumen

microduck-roller-es22 es una política de control para el robot microduck de Pollen Robotics, publicada por el usuario juicenv en HuggingFace. No es un modelo de lenguaje ni un modelo generativo de propósito general: se trata de un controlador de locomocion entrenado por aprendizaje por refuerzo que produce una marcha (gait) perpetua para el robot cuando este lleva ruedas o patines (rollers). La política consume una observacion de 61 dimensiones y emite 14 acciones a 50 Hz, y se distribuye en formato ONNX lista para cargarse en una ranura de política del demonio robotctl del robot.

El modelo es un fine-tune de namenu/microduck-arena, en concreto del checkpoint denominado strata-roller-pb4, que marcaba 0,960 s en la prueba de Roller Sprint de 2 metros. El ajuste se realizo mediante estrategias evolutivas (ES) y una busqueda local de colina elitista sobre el scorer de roller de la Arena, con verificacion en x86. El repositorio tiene un tamano practico de 0,0 GB, coherente con una política pequena orientada a ejecucion embebida.

Su relevancia es acotada pero clara dentro del ecosistema de robotica open source: microduck es una plataforma de bajo coste, y este tipo de políticas empaquetadas en ONNX con el normalizador de observaciones integrado permiten desplegar comportamientos aprendidos en el robot real sin reentrenar ni preprocesar senales en el lado del cliente. La licencia, los idiomas y los parametros del modelo no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control neuronal entrenada por aprendizaje por refuerzo y estrategias evolutivas, exportada a ONNX (topología interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada fija de observación de 61 dimensiones |
| Tipos de cuantizacion | no disponible (se distribuye como grafo ONNX) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompañado de `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Frecuencia de control | 50 Hz |
| Modelo base | namenu/microduck-arena (checkpoint strata-roller-pb4, 0,960 s) |
| Libreria / runtime | microduck (`robotctl`) |
| Tarea declarada | robotics (Roller Sprint de 2 m sobre patines) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red (numero de capas, tipo de capas ni numero de parametros). Lo que si se especifica es la interfaz funcional: una política de marcado perpetuo que mapea una observacion bruta de 61 dimensiones a 14 acciones a 50 Hz, pensada para ejecutarse en bucle continuo hasta que se le indique lo contrario. El normalizador de observaciones esta integrado dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin procesar; el archivo `manifest.json` sigue el esquema 2 del manifiesto de politicas del demonio de microduck, lo que permite cargarla como una ranura de politica.

El proceso de entrenamiento descrito es un fine-tune del checkpoint strata-roller-pb4 de namenu/microduck-arena mediante estrategias evolutivas (ES) combinadas con una busqueda local de colina elitista sobre el scorer de roller de la Arena, un procedimiento de optimizacion sin gradientes habitual para pulir politicas de control. El autor indica que el resultado se verifico en x86. El codigo de entrenamiento referenciado es el repositorio `pollen-robotics/microduck_rl`, rama `hannes-ft`, commit `3c0598cae`. No se documentan el numero de tokens (no aplica), la composicion del dataset, ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de una marcha de locomocion perpetua sobre ruedas o patines para el robot microduck, sin limite temporal predefinido: se ejecuta hasta que se detiene.
- Control en bucle cerrado a 50 Hz a partir de un vector de observacion de 61 dimensiones y emision de 14 acciones.
- Carga directa como ranura de politica mediante `robotctl policy load <slot> juicenv/microduck-roller-es22`.
- Normalizacion de observaciones integrada en el grafo ONNX, lo que simplifica la integracion y evita divergencias de preprocesado entre entrenamiento y despliegue.
- Ejecucion en x86 verificada por el autor.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No se documentan capacidades de vision, audio ni modos de pensamiento.

## Casos de uso

- Despliegue de locomocion con patines en un microduck real: cargar la politica en una ranura libre con `robotctl` y dejar que el robot se desplace de forma continua; es adecuada porque la politica es de tipo perpetuo y no requiere reinicializacion periodica.
- Punto de partida para nuevas rondas de fine-tune: al ser un fine-tune documentado de namenu/microduck-arena, sirve como inicializacion para experimentar con el scorer de roller de la Arena y la rama `hannes-ft` de `microduck_rl`.
- Comparacion de metodos de optimizacion sin gradientes: permite contrastar el rendimiento de ES con busqueda de colina elitista frente a otros esquemas de RL sobre la misma tarea de Roller Sprint.
- Pruebas de integracion del demonio robotctl: util para validar el ciclo de carga de politicas, el cumplimiento del esquema 2 del manifiesto y la ejecucion en hardware x86 antes de pasar a la plataforma objetivo.
- Reproduccion de resultados en competiciones internas tipo Arena roller scorer: el modelo esta afinado especificamente contra ese scorer, por lo que es un candidato natural para medir tiempos en la prueba de 2 m.
- Docencia y divulgacion en robotica open source: el formato ONNX autocontenido y el tamano reducido del repositorio facilitan su uso en practicas sobre aprendizaje por refuerzo aplicado a robots de bajo coste.
- Validacion de pipelines de despliegue embebido: sirve para comprobar latencias y comportamiento a 50 Hz en la computadora del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este fine-tune en la informacion disponible. El unico dato numerico documentado corresponde al checkpoint base del que parte:

| Metrica | Modelo | Valor |
|---|---|---|
| Roller Sprint (2 m) | namenu/microduck-arena, checkpoint strata-roller-pb4 (modelo base) | 0,960 s |
| Roller Sprint (2 m) | juicenv/microduck-roller-es22 (este modelo) | no disponible |
| Scorer de roller de la Arena | juicenv/microduck-roller-es22 | no disponible (se uso como funcion objetivo del fine-tune) |

No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica de modelos de lenguaje, que no aplican a este tipo de modelo.

## Requisitos de hardware

- No se publican requisitos de VRAM. Se trata de una politica ONNX de tamano muy reducido (el repositorio ocupa 0,0 GB), por lo que la inferencia es viable en CPU embebida.
- El autor indica verificacion en x86. No se especifica la GPU ni el acelerador empleados en el entrenamiento.
- No cabe plantear requisitos de GPU de datacenter (A100, H100) ni de GPU de consumo (RTX 4090) con la informacion disponible; el destino natural es la computadora del propio robot.
- Opciones de despliegue: demonio `robotctl` de microduck, cargando `policy.onnx` en una ranura de politica. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica de control.
- Latencia y throughput: no disponibles. El unico dato de temporizacion es la frecuencia de control de 50 Hz que define el bucle de ejecucion.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Contexto | Resultado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| juicenv/microduck-roller-es22 | Politica de control ONNX | Roller Sprint 2 m | no disponible | no aplica (obs. de 61 dim.) | no disponible | no disponible | HuggingFace, 0 descargas |
| namenu/microduck-arena | Politica de control (modelo base) | Roller Sprint 2 m | no disponible | no aplica | 0,960 s (checkpoint strata-roller-pb4) | no disponible | HuggingFace |

No se han identificado en la informacion proporcionada otros modelos comparables de la misma categoria (politicas de control para microduck sobre ruedas). No disponible.

## Limitaciones y advertencias

- Especificidad de tarea: la politica esta entrenada y ajustada para la prueba de Roller Sprint sobre patines; no se documenta su comportamiento en otras configuraciones del robot ni sin rollers.
- Ausencia de datos de rendimiento del fine-tune: no se publica el tiempo obtenido por este modelo, solo el del checkpoint base (0,960 s), por lo que no puede confirmarse la mejora del ajuste.
- Licencia no disponible: no se especifican los terminos de uso, lo que impide determinar si se permite el uso comercial. Debe verificarse con el autor antes de cualquier despliegue en produccion.
- Idiomas no disponibles: no aplica, al no ser un modelo de lenguaje.
- Procedencia de datos de entrenamiento no documentada: no se detalla el simulador, la distribucion de observaciones ni el volumen de evaluaciones empleadas, lo que limita la reproducibilidad.
- Riesgo de sobreajuste al scorer: el fine-tune se optimizo directamente contra el scorer de roller de la Arena, por lo que el rendimiento puede no transferirse a metricas fisicas distintas o a condiciones de suelo diferentes.
- Dependencia de infraestructura: requiere el demonio robotctl y el cumplimiento del esquema 2 del manifiesto de politicas; el normalizador esta embebido, de modo que alimentar observaciones ya normalizadas produciria un comportamiento incorrecto.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: no son capacidades aplicables.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de terceros.
- Los resultados de busqueda web asociados no aportan informacion tecnica relevante sobre el modelo (contenido no relacionado).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-roller-es22
- Modelo base: https://huggingface.co/namenu/microduck-arena
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `hannes-ft`, commit `3c0598cae` (URL directa no disponible en la informacion proporcionada)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio (URL directa no disponible en la informacion proporcionada)
- No se han encontrado papers, blogs ni demos adicionales en los resultados de busqueda web proporcionados.
