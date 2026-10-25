# hunjison/microduck-hillclimb-seedtable-from-jrubiosainz

## Resumen

`hunjison/microduck-hillclimb-seedtable-from-jrubiosainz` es una política de control motriz (no un modelo de lenguaje) publicada en HuggingFace para el robot **microduck** del proyecto de Pollen Robotics. Se distribuye como un fichero `policy.onnx` acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck, y se describe como una política **perpetua**: ejecuta una marcha de forma continua hasta que se le indique lo contrario, ocupando una ranura (*slot*) de política del demonio de control del robot. La interfaz es de 61 dimensiones de observación y 14 acciones, muestreada a 50 Hz.

El modelo resuelve un problema acotado y muy específico: proporcionar un comportamiento locomotor reproducible que pueda cargarse en un robot físico con un solo comando (`sudo robotctl policy load <slot> ...`), sin necesidad de reentrenar ni de preprocesar observaciones en el host, ya que el normalizador de observaciones está embebido en el propio ONNX. Su relevancia es, por tanto, la de un artefacto de despliegue dentro de un ecosistema de robótica de bajo coste, no la de un modelo fundacional.

El repositorio es de autoría individual (`hunjison`) y el nombre indica que deriva de una política previa de otro autor (`jrubiosainz`), aunque la model card no documenta la relación exacta entre ambas. No se publican parámetros, licencia, idiomas, ni resultados de evaluación. El tamaño del repo figura como 0.0 GB y las métricas de la comunidad son cero descargas y cero likes en la fecha de los metadatos (creación 2026-10-25).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Política de control para robótica exportada a ONNX; la model card no especifica la topología de red (MLP, recurrente u otra) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplicable (no se describe un modelo MoE) |
| Longitud de contexto | No aplicable: política reactiva paso a paso con observación de 61 dimensiones y salida de 14 acciones a 50 Hz; no hay ventana de contexto textual |
| Tipos de cuantización | No disponible. Se distribuye en ONNX sin indicación de cuantización (FP32/FP16/INT8) |
| Idiomas soportados | No aplicable (no procesa lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`), más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Pipeline declarado | `robotics` |
| Librería | `microduck` |
| Dimensiones de entrada / salida | 61 observaciones / 14 acciones |
| Frecuencia de control | 50 Hz |
| Tipo de política | Perpetua (se ejecuta hasta recibir orden de parada) |
| Normalización | Integrada en `policy.onnx` (se alimenta con observaciones crudas) |
| Tamaño del repositorio | 0.0 GB según metadatos |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de red. Lo único documentado es la interfaz: 61 dimensiones de observación de entrada, 14 acciones de salida y una frecuencia de control de 50 Hz, con un normalizador de observaciones embebido en el grafo ONNX. El nombre del modelo sugiere un proceso de optimización por *hill climbing* sobre una tabla de semillas (*seed table*), pero se trata de una interpretación del identificador, no de un dato confirmado por el autor.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`, según declara la model card. No se especifican el número de pasos de entrenamiento, la composición del dataset, el simulador utilizado, la función de recompensa, ni si hubo fases de ajuste fino o *domain randomization*. Tampoco se documenta ningún mecanismo de innovación técnica (decodificación especulativa, atención lineal, etc.), que en este dominio no resultarían aplicables.

## Capacidades

- Generación de una marcha perpetua para el robot microduck: la política mantiene el comportamiento locomotor de forma indefinida hasta que se solicita su parada.
- Control a 50 Hz con 14 acciones, adecuado para el bucle de control de bajo nivel del robot.
- Consumo de observaciones crudas de 61 dimensiones: el normalizador está embebido en el ONNX, lo que elimina el preprocesado en el lado del host.
- Despliegue mediante el demonio del robot: carga en una ranura de política con `robotctl policy load`.
- Compatibilidad con el manifiesto de políticas de microduck en su esquema 2, lo que permite gestionarla con las mismas herramientas que otras políticas del ecosistema.
- No soporta *tool calling*, razonamiento multi-paso, agentes, ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio ni modo de razonamiento (*thinking mode*).

## Casos de uso

- **Despliegue de una marcha lista para usar en el robot físico**: cargar la política en una ranura con `robotctl policy load` y ejecutarla como comportamiento por defecto del microduck, sin escribir código de control ni normalizar observaciones en el host.
- **Comparación de políticas en la misma ranura**: al ajustarse al manifiesto de esquema 2, la política puede alternarse con otras candidatas en el mismo *slot* para evaluar cuál produce una marcha más estable sobre el mismo hardware.
- **Investigación en aprendizaje por refuerzo con robots de bajo coste**: servir como referencia de comportamiento entrenado con `microduck_rl` para estudiar la brecha *sim-to-real* en un robot pequeño y replicable en laboratorio o aula.
- **Docencia en robótica y RL**: usar el par `policy.onnx` + `manifest.json` como ejemplo mínimo y funcional de artefacto de política desplegable, mostrando el contrato de observaciones y acciones sin entrar en el entrenamiento.
- **Pruebas de regresión de la pila de control**: fijar esta política perpetua como caso base en un *pipeline* de integración continua que valide que las actualizaciones del demonio o del runtime ONNX no rompen la carga ni la ejecución del bucle a 50 Hz.
- **Demostraciones y ferias**: comportamiento continuo y autónomo que no requiere intervención, útil para exhibiciones donde se quiere que el robot camine de forma sostenida.
- **Punto de partida para ajuste fino**: dado que el autor original referenciado en el nombre es distinto del publicador, puede emplearse como semilla para experimentos de *hill climbing* posteriores sobre parámetros de recompensa o condiciones iniciales (interpretación del identificador, no confirmada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito, distancia recorrida, estabilidad ni comparaciones con otras políticas.

| Métrica | Valor |
|---|---|
| Recompensa media en simulación | No disponible |
| Tasa de éxito de la marcha | No disponible |
| Distancia o velocidad alcanzada | No disponible |
| Robustez frente a perturbaciones | No disponible |
| Evaluación *sim-to-real* | No disponible |

## Requisitos de hardware

- VRAM estimada: no disponible. No se publica tamaño de parámetros ni precisión de los pesos, por lo que no es posible calcularla a partir de los datos de la ficha.
- GPU recomendadas: no disponibles. El artefacto es un `policy.onnx` de una política de control con 61 entradas y 14 salidas, pero el autor no documenta requisitos de cómputo.
- Viabilidad en GPU de consumo: no confirmada. El tamaño del repositorio figura como 0.0 GB, lo que sugiere un artefacto muy pequeño, aunque este dato por sí solo no permite afirmar que se ejecute en una GPU concreta.
- Opciones de despliegue: el método documentado es la carga en el robot mediante `robotctl policy load <slot> hunjison/microduck-hillclimb-seedtable-from-jrubiosainz`, con ejecución del ONNX en el entorno de la política de microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso), que marca el requisito de tiempo real del bucle, no una medida de latencia publicada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck con las que comparar parámetros, contexto o rendimiento. El propio identificador del modelo alude a una política previa de `jrubiosainz`, pero no se aportan sus especificaciones ni sus resultados.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-hillclimb-seedtable-from-jrubiosainz | No disponible | No aplicable (61-D obs., 50 Hz) | No disponible | No disponible | HuggingFace, 0 descargas |
| Política previa de `jrubiosainz` | No disponible | No disponible | No disponible | No disponible | No disponible en la información |
| Otras políticas de microduck | No disponible | No disponible | No disponible | No disponible | No disponible en la información |

## Limitaciones y advertencias

- **Licencia sin especificar**: al no declararse licencia, no puede asumirse permiso de uso comercial, redistribución ni modificación. Es un bloqueo potencial para cualquier despliegue en producción.
- **Ausencia total de evaluación**: no hay métricas de rendimiento, robustez ni pruebas *sim-to-real*, por lo que se desconoce si la marcha funciona fuera del entorno de entrenamiento.
- **Trazabilidad del entrenamiento incompleta**: se cita el repositorio y el commit de `microduck_rl`, pero no la configuración, las semillas, el simulador ni el número de pasos, lo que impide reproducir el resultado.
- **Dependencia estricta de la interfaz**: la política espera exactamente 61 observaciones crudas y produce 14 acciones; cualquier cambio en el robot, en el orden de las observaciones o en la versión del demonio puede invalidar el comportamiento sin aviso.
- **Normalizador embebido**: alimentar la política con observaciones ya normalizadas produciría un comportamiento incorrecto, ya que la normalización se aplica dentro del grafo ONNX.
- **Naturaleza perpetua**: la política se ejecuta hasta que se le indica lo contrario; requiere un mecanismo externo de parada o supervisión para evitar ejecuciones no deseadas.
- **Sesgos y alucinación**: no aplicables en el sentido habitual, al no ser un modelo generativo de texto. Sí existe el riesgo equivalente de comportamientos espurios no documentados (oscilaciones, deriva) que no pueden evaluarse con los datos disponibles.
- **Idioma y contexto**: no aplicables; el modelo no procesa lenguaje ni tiene ventana de contexto.
- **Madurez del artefacto**: cero descargas y cero likes, repositorio de 0.0 GB y autoría individual sin documentación adicional; no hay evidencia de uso en terceros ni de mantenimiento.
- **Resultados de búsqueda web no pertinentes**: las búsquedas realizadas devolvieron únicamente páginas de ayuda de YouTube y Google, sin relación con el modelo, por lo que no se ha podido contrastar ninguna información externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hunjison/microduck-hillclimb-seedtable-from-jrubiosainz
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado: `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de microduck (esquema 2)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la búsqueda web realizada.
