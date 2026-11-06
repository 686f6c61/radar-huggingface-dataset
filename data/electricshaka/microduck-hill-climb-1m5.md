# ElectricShaka/microduck-hill-climb-1m5

## Resumen

`microduck-hill-climb-1m5` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. La política se publica como un archivo ONNX (`policy.onnx`) acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck, y se distribuye a través de la librería `microduck`. El autor del repositorio es el usuario ElectricShaka y el modelo se etiqueta con los tags `robotics`, `reinforcement-learning` y `onnx`.

El modelo resuelve una tarea concreta de locomoción: una marcha ("gait") de escalada de colinas, definida como política perpetua, es decir, que se ejecuta de forma continua hasta que se le indique lo contrario. La interfaz de observación es de 61 dimensiones y la de acciones de 14 dimensiones, con una frecuencia de control de 50 Hz. No se trata de un modelo de lenguaje: es una política neuronal que mapea observaciones del robot a comandos de actuación.

La relevancia del modelo es acotada pero clara dentro del ecosistema microduck: permite cargar una marcha entrenada en una ranura de política del robot mediante el comando `sudo robotctl policy load <slot> ElectricShaka/microduck-hill-climb-1m5`, sin necesidad de reentrenar. El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no se dispone de información sobre licencia, idiomas ni arquitectura interna de la red.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal exportada a ONNX; arquitectura interna no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Lo que sí se especifica es el contrato de entrada/salida: 61 dimensiones de observación y 14 dimensiones de acción, ejecutadas a 50 Hz. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que la política consume observaciones en bruto sin preprocesado externo. El manifiesto sigue el esquema 2 del manifiesto de políticas de microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `main`, commit `c601a991f`. Se trata de aprendizaje por refuerzo orientado a locomoción, pero no se han publicado en la información disponible detalles sobre el número de pasos de entrenamiento, la composición del entorno, la función de recompensa ni si se aplicaron técnicas de regularización o destilación. El nombre "1m5" sugiere 1,5 millones de pasos o iteraciones de entrenamiento, aunque esto no se confirma en la model card.

## Capacidades

- Control de locomoción del robot microduck mediante una marcha perpetua de escalada de colinas.
- Ejecución continua hasta recibir una orden de parada o sustitución de política.
- Consumo de observaciones en bruto: el normalizador está embebido en el ONNX.
- Interfaz de 61 observaciones y 14 acciones a 50 Hz, compatible con la ranura de política del daemon `robotctl`.
- Carga directa en el robot mediante `sudo robotctl policy load <slot> ElectricShaka/microduck-hill-climb-1m5`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo de texto.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Locomoción autónoma en terrenos inclinados: la política está entrenada específicamente para escalada de colinas, por lo que puede emplearse para que el microduck ascienda pendientes de forma continua sin intervención.
- Demostración de aprendizaje por refuerzo en robótica de bajo coste: sirve como ejemplo reproducible de una política entrenada con `microduck_rl` y desplegada en hardware real vía ONNX.
- Sustitución rápida de marchas en un robot en producción: el comando `robotctl policy load` permite intercambiar esta política por otra (caminar, estar de pie, sentarse, etc.) en una ranura, facilitando pruebas A/B de comportamiento.
- Investigación en control continuo: la interfaz de 61 observaciones y 14 acciones a 50 Hz es un banco de pruebas para comparar políticas de RL en un cuadrúpedo de pequeñas dimensiones.
- Educación y talleres: al ser un modelo pequeño y con instrucciones de despliegue explícitas, es adecuado para enseñar el ciclo completo entrenamiento-despliegue en robótica.
- Evaluación comparativa de políticas: existen variantes publicadas por otros autores (por ejemplo, `a1rb4Ck/microduck-hill-1m5` y `Helldave/microduck-hill-climb-1m5-run-1028-1546`) que permiten comparar resultados de entrenamiento bajo la misma interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas de recompensa, tasa de éxito en ascenso, consumo energético ni latencia de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de 61 entradas y 14 salidas exportada a ONNX, la huella es previsiblemente muy reducida, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponibles. La inferencia a 50 Hz es compatible con ejecución en CPU en el propio robot o en un host conectado, según el diseño del daemon de microduck.
- Cabe en GPU de consumo: no confirmado, aunque por la naturaleza del modelo (control a 50 Hz, observaciones de 61 dimensiones) es probable que sí; no se aporta dato oficial.
- Opciones de despliegue: el daemon `robotctl` de microduck con el comando `policy load`; el runtime subyacente debe soportar ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; el único dato de frecuencia es el ciclo de control a 50 Hz.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / interfaz | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElectricShaka/microduck-hill-climb-1m5 | No disponible | 61 obs / 14 act, 50 Hz | No disponible | No disponible | Hugging Face |
| a1rb4Ck/microduck-hill-1m5 | No disponible | Interfaz microduck | No disponible | No disponible | Hugging Face |
| Helldave/microduck-hill-climb-1m5-run-1028-1546 | No disponible | Interfaz microduck | No disponible | No disponible | Hugging Face |

Las tres variantes comparten el mismo pipeline (`robotics`), la misma librería (`microduck`) y el mismo formato de despliegue. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- No se especifica la licencia, lo que impide confirmar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue productivo.
- El modelo está entrenado exclusivamente para escalada de colinas; no se garantiza su comportamiento en otros terrenos, pendientes o condiciones de carga.
- No hay información sobre sesgos, pero al ser una política de RL entrenada en simulación (presumiblemente), puede presentar una brecha simulación-real no documentada.
- Riesgo de fallo silencioso: al ser una política perpetua, se ejecuta hasta que se le indique lo contrario; es necesario implementar mecanismos externos de parada y supervisión.
- No se documentan los límites de las observaciones de entrada (rangos, unidades) más allá de la dimensión 61; el normalizador embebido asume observaciones en bruto con una distribución concreta.
- El repositorio tiene cero descargas y cero likes, y un tamaño de 0.0 GB, lo que sugiere que los archivos pueden no estar completamente subidos o que el modelo es muy reciente; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de usarlo.
- No hay información sobre idiomas ni capacidades lingüísticas porque no es un modelo de lenguaje; cualquier uso en ese sentido es inadecuado.
- El commit de entrenamiento (`c601a991f`) y la rama (`main`) se indican, pero no se especifica la versión del simulador ni la configuración de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/ElectricShaka/microduck-hill-climb-1m5
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `main`, commit `c601a991f`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Variante similar: https://huggingface.co/a1rb4Ck/microduck-hill-1m5
- Variante similar: https://huggingface.co/Helldave/microduck-hill-climb-1m5-run-1028-1546
