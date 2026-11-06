# dashi/microduck-roller-daily-20261104

## Resumen

`dashi/microduck-roller-daily-20261104` es una política de control por aprendizaje por refuerzo destinada al robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es un artefacto de inferencia que mapea observaciones del robot (61 dimensiones) a acciones de control (14 dimensiones) a 50 Hz, empaquetado en formato ONNX y publicado con la librería `microduck`. El autor, `dashi`, lo presenta como una "re-entrada diaria" de una política anterior (`microduck-roller-remix-r900`, con una puntuación de 0.900) y como un *fine-tune* de `DenRakEiw/microduck-senate_duck_0904`.

La política está etiquetada para el slot `walk` y se describe como "perpetua": ejecuta una marcha sobre ruedas (rollers) de forma continua hasta que se le indique lo contrario. El repositorio tiene un tamaño de 0.0 GB según Hugging Face, lo que sugiere un artefacto muy ligero (coherente con una política de control de pocas capas). No hay información pública sobre benchmarks, licencia ni idiomas, y los resultados de búsqueda web devuelven contenido irrelevante sobre el caldo japonés *dashi*, no sobre el autor.

Su relevancia es acotada pero específica: para investigadores en robótica de bajo coste y aprendizaje por refuerzo aplicado a locomoción, este tipo de políticas ONNX ligeras son directamente desplegables en el robot físico mediante el comando `robotctl`, sin necesidad de infraestructura de inferencia pesada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control RL, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capa, función de activación ni tamaño). Lo que sí se indica es que se trata de una política de aprendizaje por refuerzo entrenada en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. La política incluye el normalizador de observaciones "horneado" dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto directamente.

El modelo es un *fine-tune* de `DenRakEiw/microduck-senate_duck_0904` y se describe como una re-entrada diaria de `dashi/microduck-roller-remix-r900` (puntuación 0.900), lo que sugiere un proceso iterativo de entrenamiento y evaluación con métricas de recompensa. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si hubo técnicas de RLHF/DPO (no aplicables en este dominio). La innovación destacable es la inclusión del normalizador en el grafo ONNX y la naturaleza "perpetua" de la política, que no requiere condición de parada explícita.

## Capacidades

- Control de locomoción del robot microduck sobre ruedas (rollers) mediante una marcha continua en el slot `walk`.
- Inferencia a 50 Hz con observaciones de 61 dimensiones y 14 acciones de salida.
- Política "perpetua": ejecuta el gait indefinidamente hasta recibir una orden de parada o cambio de política.
- Normalización de observaciones integrada en el modelo ONNX (acepta observaciones en bruto).
- Despliegue directo en el robot mediante `robotctl policy load walk <repo>`.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de visión o audio.

## Casos de uso

- **Locomoción continua en el microduck físico**: cargar la política con `robotctl policy load walk dashi/microduck-roller-daily-20261104` para que el robot mantenga una marcha sobre ruedas de forma indefinida, adecuada para demostraciones y pruebas de resistencia.
- **Investigación en RL aplicado a robótica de bajo coste**: usar esta política como punto de partida (*fine-tune*) para experimentar con variantes de marcha en el repositorio `microduck_rl`, rama `roll-backward`.
- **Evaluación de políticas ONNX en hardware real**: al estar empaquetada en ONNX con normalizador integrado, sirve para validar pipelines de despliegue que alimentan observaciones en bruto sin preprocesado externo.
- **Comparación de políticas en el slot `walk`**: al ser una re-entrada de `roller-remix-r900` (0.900), permite comparar el rendimiento de distintas iteraciones diarias sobre el mismo robot y slot.
- **Docencia y talleres de robótica**: el microduck es un robot de bajo coste; esta política ligera permite a estudiantes ver RL desplegado en hardware sin infraestructura de cómputo pesada.
- **Pruebas de integración del daemon `robotctl`**: el `manifest.json` sigue el schema 2 del manifiesto de políticas, por lo que sirve como caso de prueba para validar la carga y ejecución de políticas en el daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica mencionada es la puntuación 0.900 de la política predecesora (`microduck-roller-remix-r900`), pero no se especifica qué mide ni cómo se obtiene, por lo que no se puede presentar como benchmark comparable.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB, lo que indica un artefacto muy pequeño (probablemente unos pocos MB).
- GPU recomendadas: no disponible; por el tamaño del artefacto, la inferencia ONNX probablemente se ejecuta en CPU del propio robot o en una GPU de gama baja.
- Compatibilidad con GPU de consumo: muy probablemente sí, dado el tamaño del repositorio, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el daemon `robotctl` del ecosistema microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: la política opera a 50 Hz según la model card, pero no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones | Acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261104` | Política RL (ONNX) | 61-D | 14 | 50 Hz | no disponible | Hugging Face |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Política RL (predecesora, 0.900) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas políticas, por lo que la comparativa se limita a la relación de linaje (modelo base y predecesor) y a los parámetros de interfaz conocidos.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia, lo que impide confirmar si el uso comercial está permitido. Es un riesgo legal para producción.
- **Específica de hardware**: la política está entrenada para el microduck sobre rollers; no es transferible a otros robots ni a configuraciones sin ruedas sin reentrenamiento.
- **Sin benchmarks publicados**: no hay métricas de robustez, tasa de caída ni generalización; la puntuación 0.900 de la predecesora no está definida.
- **Modelo base con información incompleta**: el *fine-tune* parte de `DenRakEiw/microduck-senate_duck_0904`, del que no se detallan datos de entrenamiento ni evaluación.
- **Cero descargas y likes**: el modelo es muy reciente (creado el 2026-11-04) y no tiene validación de la comunidad.
- **Naturaleza "perpetua"**: la política no incluye condición de parada; en producción requiere supervisión externa para detener el robot.
- **Resultados de búsqueda irrelevantes**: las búsquedas web sobre "dashi" devuelven contenido sobre el caldo japonés, sin información adicional sobre el autor o el modelo.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo de texto).

## Enlaces

- [Hugging Face: dashi/microduck-roller-daily-20261104](https://huggingface.co/dashi/microduck-roller-daily-20261104)
- [Modelo base: DenRakEiw/microduck-senate_duck_0904](https://huggingface.co/DenRakEiw/microduck-senate_duck_0904)
- [Repositorio microduck (Pollen Robotics)](https://github.com/pollen-robotics/microduck)
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (no se proporciona URL directa)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
