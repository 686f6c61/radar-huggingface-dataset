# dashi/microduck-roller-daily-20261106

## Resumen

`dashi/microduck-roller-daily-20261106` es una política de control para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo exportada a ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutarse sobre ruedas (rollers). El autor, `dashi`, la publica como una "re-entrada diaria" de un remix previo (`microduck-roller-remix-r900`, con recompensa 0.900) y la etiqueta como política perpetua para el slot de marcha (`walk`).

El modelo es un fine-tune de `DenRakEiw/microduck-senate_duck_0904` y se distribuye con un `policy.onnx` que incorpora el normalizador de observaciones, de modo que el robot puede alimentarse con observaciones en bruto. La relevancia es acotada: es un artefacto de investigación en robótica de refuerzo, con cero descargas y sin métricas publicadas, útil para quienes experimentan con el ecosistema microduck y el repositorio `pollen-robotics/microduck_rl`.

La información disponible es muy escasa: no hay datos de arquitectura de red, número de parámetros, contexto, idiomas ni licencia. Esta ficha refleja únicamente lo que consta en la model card y los metadatos de Hugging Face, marcando como "no disponible" todo lo que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal subyacente (capas, tipo de transformer o MLP, tamaño). Lo que sí consta es el contrato de interfaz: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, y un normalizador de observaciones integrado en el propio `policy.onnx`. El `manifest.json` sigue el esquema 2 del manifiesto de políticas microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Se trata de un fine-tune (relación `finetune`) sobre `DenRakEiw/microduck-senate_duck_0904`, y la propia model card lo describe como una re-entrada diaria de `dashi/microduck-roller-remix-r900` con recompensa 0.900. No se especifican número de pasos, composición del dataset, ni si hubo RLHF/DPO (no aplica en este dominio). La política se declara "perpetua": se ejecuta hasta que se le indique lo contrario.

## Capacidades

- Control locomotor de tipo marcha (`walk`) para el robot microduck sobre ruedas.
- Política perpetua: mantiene la marcha de forma continua hasta recibir una orden de parada.
- Interfaz de observación en bruto: el normalizador está embebido en el ONNX, por lo que no requiere preprocesado externo.
- Integración con el daemon del robot mediante `robotctl policy load walk <repo>`.
- Exportación a ONNX, apta para inferencia en el propio robot o en entornos compatibles.
- No soporta tool calling, function calling, agentes, multilingüismo, visión, audio ni modo thinking: no es un modelo de lenguaje.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: servir como política base o punto de partida para experimentos de locomoción con el microduck sobre ruedas, cargándola con `robotctl policy load walk`.
- Reproducción de experimentos: al estar vinculada a un commit concreto (`83599404a`) de la rama `roll-backward`, permite replicar el entorno de entrenamiento y comparar resultados.
- Docencia y talleres de robótica de bajo coste: el microduck es una plataforma asequible y esta política permite demostrar una marcha funcional sin entrenar desde cero.
- Benchmarking de políticas: usar la recompensa declarada (0.900) como referencia para comparar fine-tunes posteriores sobre el mismo modelo base.
- Desarrollo de pipelines de despliegue ONNX: el `policy.onnx` con normalizador integrado sirve como ejemplo de empaquetado de políticas para el daemon microduck.
- Pruebas de integración del manifiesto de políticas: el `manifest.json` conforme al schema 2 permite validar el cargador del daemon y la resolución de slots (`walk`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la recompensa de 0.900 asociada al remix del que deriva (`microduck-roller-remix-r900`), sin contexto sobre la escala de recompensa ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del modelo no consta; el repositorio ocupa 0.0 GB, lo que sugiere un artefacto muy pequeño).
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es probable que la inferencia sea viable en CPU, pero no se puede confirmar.
- ¿Cabe en GPU de consumo? No disponible; el tamaño del repositorio apunta a que sí, pero no hay datos verificables.
- Opciones de despliegue: daemon microduck mediante `robotctl policy load walk dashi/microduck-roller-daily-20261106`; inferencia ONNX con cualquier runtime compatible (ONNX Runtime, etc.).
- Latencia y throughput: no disponibles. La política está diseñada para operar a 50 Hz, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dashi/microduck-roller-daily-20261106 | no disponible | no aplica | recompensa 0.900 (heredada del remix) | no disponible | Hugging Face, 0 descargas |
| dashi/microduck-roller-remix-r900 | no disponible | no aplica | recompensa 0.900 | no disponible | Hugging Face |
| DenRakEiw/microduck-senate_duck_0904 | no disponible | no aplica | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos suficientes para una comparación cuantitativa con otras políticas de robótica fuera del ecosistema microduck.

## Limitaciones y advertencias

- Ámbito muy restringido: es una política específica para el microduck sobre ruedas; no es reutilizable fuera de esa plataforma ni como modelo de propósito general.
- Sin licencia declarada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin datos de arquitectura ni parámetros: imposible evaluar coste computacional, robustez o generalización a partir de la información publicada.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Riesgo de sobreajuste al entorno de entrenamiento (rama `roll-backward`): el comportamiento fuera de las condiciones de entrenamiento (terrenos, carga, desgaste de ruedas) no está documentado.
- Política "perpetua": requiere un mecanismo externo de parada; debe gestionarse con cuidado en despliegues autónomos.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas: no aplica en el sentido habitual, pero tampoco hay evaluación de seguridad del comportamiento del robot.
- Los resultados de búsqueda web mezclan el término "dashi" (caldo japonés) con el autor; no aportan información técnica sobre el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261106
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Remix previo: https://huggingface.co/dashi/microduck-roller-remix-r900
- Entrada diaria anterior: https://huggingface.co/dashi/microduck-roller-daily-20261101
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl (rama `roll-backward`, commit `83599404a`)
- Recursos independientes del robot: https://microduckrobot.org/
