# juicenv/microduck-hill-es1

## Resumen

microduck-hill-es1 es una política de control para el robot cuadrúpedo microduck de Pollen Robotics, no un modelo de lenguaje. Se trata de un ajuste fino (finetune) del modelo HannesVonEssen/microduck-running, que ganó la prueba de Sprint de 2 metros, y que el autor ha vuelto a entrenar mediante estrategias de evolución (evolution strategies) sobre el propio scorer de colinas de la Arena para convertirlo en un corredor de ascenso de colinas de 1,5 metros. El resultado es una política perpetua (perpetual), es decir, un patrón de marcha que se ejecuta de forma continua hasta que se le indique lo contrario.

El modelo trabaja con un espacio de observación de 61 dimensiones y produce 14 acciones a una frecuencia de control de 50 Hz, que es la interfaz estándar del firmware del microduck. Se distribuye en formato ONNX, con el normalizador de observaciones ya integrado dentro del propio archivo policy.onnx, de modo que el robot puede alimentarse directamente con observaciones en bruto. La política se carga en una ranura de política (policy slot) del daemon del robot mediante la orden `robotctl policy load`.

Su relevancia es acotada pero clara dentro del ecosistema de robótica open source: demuestra un flujo de trabajo reproducible de entrenamiento por refuerzo y optimización evolutiva (repositorio pollen-robotics/microduck_rl, rama lean, commit 5a3636302) y sirve como ejemplo de política exportable y desplegable en hardware real. El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es de 0.0 GB, por lo que se trata de un artefacto muy reciente y prácticamente sin uso registrado. No se han publicado especificaciones de arquitectura de red, número de parámetros ni datos de entrenamiento más allá de la referencia al repositorio y al commit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de red neuronal exportada a ONNX; estructura interna no especificada) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es un vector de observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el modelo base HannesVonEssen/microduck-running es Apache-2.0) |
| Formato de pesos | ONNX (policy.onnx); manifiesto en manifest.json, esquema 2 |
| Espacio de observacion | 61 dimensiones |
| Espacio de acciones | 14 acciones |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta de forma continua) |
| Modelo base | HannesVonEssen/microduck-running (relacion: finetune) |

## Arquitectura y entrenamiento

No se dispone de detalles de la arquitectura de la red neuronal (numero de capas, tipo de capas, dimensionalidad interna). Lo unico documentado es su interfaz: recibe un vector de observacion de 61 dimensiones y emite 14 acciones a 50 Hz, y se distribuye como un grafo ONNX autocontenido en el que el normalizador de observaciones esta integrado. El modelo es una politica perpetua, sin condicion de terminacion, pensada para ejecutarse en bucle mientras el robot esta activo.

En cuanto al entrenamiento, la model card indica que parte de HannesVonEssen/microduck-running (el ganador del Sprint de 2 metros, con licencia Apache-2.0) y que se ha ajustado adicionalmente mediante estrategias de evolucion sobre el scorer de colinas de la Arena. El entrenamiento de referencia se realizo en el repositorio pollen-robotics/microduck_rl, rama lean, commit 5a3636302. No se especifican el numero de iteraciones, la composicion del dataset ni si se emplearon tecnicas de RL adicionales (RLHF, DPO u otras), que por otra parte no son habituales en este tipo de politicas de control.

## Capacidades

- Locomocion cuadrupeda: genera una marcha continua para el robot microduck orientada a ascender colinas de 1,5 metros.
- Control reactivo a 50 Hz: produce 14 acciones por ciclo a partir de 61 observaciones, adecuado para control en tiempo real.
- Ejecucion perpetua: mantiene la marcha indefinidamente sin necesidad de reinicio ni condicion de parada.
- Normalizacion integrada: el normalizador de observaciones esta embebido en policy.onnx, por lo que acepta observaciones en bruto.
- Despliegue directo en robot: se carga en una ranura de politica mediante `robotctl policy load`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni soporte multilingue.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso (fuera del ambito de una politica de control).

## Casos de uso

- Ascenso de colinas en competicion: la politica esta optimizada sobre el scorer de colinas de la Arena para el recorrido de 1,5 m, por lo que es adecuada como participante directo en pruebas de hill climb del microduck.
- Demostracion de entrenamiento por refuerzo con optimizacion evolutiva: sirve como artefacto de referencia para reproducir el flujo del repositorio pollen-robotics/microduck_rl (rama lean, commit 5a3636302) sobre el hardware real.
- Base para nuevos ajustes finos: al ser un finetune de una politica ya entrenada, puede emplearse como punto de partida para evolucionar comportamientos derivados (otras pendientes, terrenos o velocidades).
- Control de locomocion en bucle en robots microduck: se carga en una ranura de politica y se ejecuta de forma perpetua, cubriendo tareas de desplazamiento continuo en laboratorio o aula.
- Material docente de robotica: permite ilustrar el ciclo completo de politica entrenada, exportada a ONNX y desplegada mediante el daemon robotctl sobre un cuadrupedo real.
- Pruebas de integracion de la interfaz de politicas: util para validar el esquema 2 del manifiesto de politicas (policy-manifest.md) y el mecanismo de ranuras del daemon.
- Benchmarking interno de gait: al derivar de un corredor de Sprint de 2 m, permite comparar dos marchas (Sprint frente a Hill Climb) bajo la misma interfaz de observacion y acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (recompensa media, tiempo de ascenso, tasa de exito, etc.) en la informacion disponible. La unica referencia de rendimiento es cualitativa: el modelo base fue el ganador del Sprint de 2 m y este finetune esta orientado a un recorrido de ascenso de colinas de 1,5 m.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio reporta un tamano de 0.0 GB, coherente con una politica de red de muy pequeno tamano, pero no se publican cifras concretas.
- GPU recomendadas: no disponible. Por el tipo de artefacto (politica ONNX ejecutada por el daemon del robot) es previsible que se ejecute en la propia computadora del robot o en CPU, pero no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga en el robot via `robotctl policy load <slot> juicenv/microduck-hill-es1`; ejecucion a traves del daemon del microduck. No se documentan otros runners (vLLM, llama.cpp, Ollama, TGI), que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles, salvo la frecuencia de control nominal de 50 Hz fijada por la interfaz del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-hill-es1 | Politica de control (ONNX) | HannesVonEssen/microduck-running | Ascenso de colinas 1,5 m | no disponible | HuggingFace |
| HannesVonEssen/microduck-running | Politica de control | no disponible | Sprint de 2 m | Apache-2.0 | HuggingFace |

No se dispone de informacion sobre otras politicas comparables dentro del ecosistema microduck ni de sus especificaciones, por lo que la comparativa se limita al modelo base documentado. Datos adicionales: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni procesa imagenes; cualquier uso fuera del control de locomocion del microduck carece de sentido.
- Especificidad de tarea: la politica esta ajustada para un recorrido de ascenso de colinas de 1,5 m sobre el scorer de la Arena; su comportamiento fuera de ese entorno o en otros terrenos no esta documentado.
- Arquitectura no publicada: se desconoce la estructura interna, el numero de parametros y la robustez frente a perturbaciones o cambios de hardware.
- Licencia no disponible en la ficha del modelo: aunque el modelo base es Apache-2.0, la licencia de este finetune no se especifica, lo que genera incertidumbre para uso comercial.
- Idiomas: no aplica; no hay soporte linguistico.
- Sesgos y alucinacion: no aplican en el sentido habitual de los modelos generativos, pero si existe riesgo de comportamientos no previstos (fallos de marcha, caidas) al desplegar la politica en hardware real sin validacion previa.
- Ausencia de adopcion registrada: 0 descargas y 0 likes, sin resultados de benchmarks publicados, por lo que no hay evidencia externa de rendimiento en produccion.
- Dependencia del daemon: su uso practico esta ligado al firmware y al daemon del microduck y al esquema 2 del manifiesto de politicas; cambios de version pueden afectar a la compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-hill-es1
- Modelo base: https://huggingface.co/HannesVonEssen/microduck-running
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: pollen-robotics/microduck_rl (rama lean, commit 5a3636302)
- Documentacion del manifiesto de politicas: docs/policy-manifest.md (en el repositorio del daemon)
