# jaippolito/microduck-rokler-duck

## Resumen

microduck-rokler-duck es una politica de control para el robot cuadrupedo microduck de Pollen Robotics, publicada por el usuario jaippolito en Hugging Face. No se trata de un modelo de lenguaje, sino de una politica de aprendizaje por refuerzo exportada a ONNX que genera patrones de locomocion (gaits) para un robot fisico con ruedas. El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, y esta disenado para ejecutarse de forma continua hasta que se le indique lo contrario.

La relevancia de esta ficha es limitada en el contexto habitual de evaluacion de LLM: el repositorio tiene 0 descargas y 0 likes, un tamano de 0.0 GB y una model card extremadamente escueta. La informacion tecnica disponible se reduce a la interfaz de observacion/accion, la frecuencia de control y la referencia al repositorio de entrenamiento `pollen-robotics/microduck_rl`, rama `dirigo-speed`, commit `ede58611e`.

No se dispone de datos sobre arquitectura de red, numero de parametros, composicion del dataset de entrenamiento ni resultados de evaluacion. Cualquier dato no presente en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de reinforcement learning exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de politicas microduck) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal subyacente. Se sabe que la politica se entreno con aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `dirigo-speed`, commit `ede58611e`, y que el artefacto exportado es un fichero `policy.onnx`. El autor indica que la exportacion se realizo desde un checkout con cambios sin commitear, lo que impide reproducir exactamente el estado del codigo de entrenamiento.

La interfaz de control esta definida: observacion de 61 dimensiones, 14 acciones y frecuencia de 50 Hz. El normalizador de observaciones esta integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El modelo se describe como una politica "perpetua", es decir, un gait que se ejecuta de forma continua hasta que se le ordena lo contrario, cargado en una ranura de politica del demonio `robotctl`. No se dispone de informacion sobre el numero de tokens, episodios, recompensas, ni sobre el uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Generacion de patrones de locomocion (gait) para el robot microduck equipado con ruedas.
- Control continuo a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Ejecucion perpetua del gait hasta que se detiene o se sustituye la politica.
- Normalizacion de observaciones integrada en el artefacto ONNX (entrada en crudo).
- Carga mediante `robotctl policy load <slot> jaippolito/microduck-rokler-duck`.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues, vision ni audio: no es un modelo de lenguaje.

## Casos de uso

- Locomocion continua sobre ruedas: cargar la politica en una ranura del demonio microduck para que el robot mantenga un gait estable de forma indefinida hasta recibir una orden de parada.
- Demostraciones de gait: usar el modelo como referencia de un patron de movimiento concreto (el autor lo describe como "rokler-duck") en presentaciones o comparativas de politicas.
- Base para fine-tuning de politicas de locomocion: el repositorio de entrenamiento `pollen-robotics/microduck_rl` y la rama `dirigo-speed` sirven como punto de partida para reentrenar o adaptar el comportamiento.
- Pruebas de integracion del pipeline de politicas microduck: validar la carga de manifiestos schema 2 y la inyeccion de observaciones en crudo en `policy.onnx`.
- Evaluacion comparativa de gaits: contraponer este gait con otras politicas cargadas en distintas ranuras para medir estabilidad o velocidad sobre ruedas.
- Prototipado de control en robot fisico: al ser un ONNX ligero (repo de 0.0 GB), puede desplegarse en el propio robot sin infraestructura de GPU dedicada, aunque no se dispone de datos de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y el artefacto es un ONNX, por lo que probablemente se ejecuta en CPU del robot, pero no hay datos confirmados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: demonio `robotctl` de microduck (carga de politicas por ranura); inferencia ONNX Runtime como opcion generica, no confirmada por el autor.
- Latencia y throughput: no disponibles; la frecuencia de control nominal es de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| microduck-rokler-duck | Politica RL (ONNX) para microduck | no disponible | no aplica | no disponible | Hugging Face (0 descargas) |
| Otras politicas microduck | Politica RL | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada |
| Modelos de lenguaje de proposito general | LLM | no aplica | no aplica | no aplica | no comparables (dominio distinto) |

No se dispone de datos de rendimiento ni de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo es utilizable con el robot microduck y su demonio `robotctl`; no es un modelo de lenguaje ni un modelo generico.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Reproducibilidad comprometida: el autor indica que la exportacion se hizo desde un checkout con cambios sin commitear, por lo que el binario no corresponde exactamente al commit `ede58611e`.
- Sin datos de evaluacion: no hay benchmarks, metricas de recompensa ni validacion publicada; el rendimiento real del gait no esta documentado.
- Riesgo de comportamiento inesperado en el robot fisico: al ser una politica "perpetua" sin parada integrada, requiere supervision y un mecanismo externo de interrupcion.
- Sin informacion sobre sesgos, alucinacion o limitaciones de idioma: no aplicables a este tipo de artefacto.
- Repositorio sin traccion (0 descargas, 0 likes) y creado/actualizado el mismo dia: no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/jaippolito/microduck-rokler-duck
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento referenciado: `pollen-robotics/microduck_rl` (rama `dirigo-speed`, commit `ede58611e`)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio microduck
