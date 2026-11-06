# BabyClaw/microduck-beaktug-long-juice-1240

## Resumen

Microduck-beaktug-long-juice-1240 es una política de control motriz para el robot cuadrúpedo microduck, desarrollado por el ecosistema de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de aprendizaje por refuerzo exportada a ONNX que genera patrones de marcha (gaits) en tiempo real. El autor del repositorio es el usuario BabyClaw y la model card describe el artefacto como "campeón de liga local validado", un término propio del entorno de entrenamiento de microduck que indica que la política ha superado evaluaciones internas de locomoción.

El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, lo que lo sitúa como un controlador de bucle cerrado de baja latencia para un robot de pequeñas dimensiones. La política es "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha cargada en una ranura de política del daemon `robotctl`. El normalizador de observaciones está integrado en el propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado adicional.

La relevancia de esta ficha es limitada fuera del ecosistema microduck: no hay información pública sobre arquitectura de red, datos de entrenamiento, benchmarks ni licencia. El repositorio tiene 0 GB de tamaño declarado y 0 descargas, lo que sugiere un artefacto recién publicado o de uso estrictamente local. Aun así, documenta un caso concreto de despliegue de políticas RL en robótica de bajo coste mediante ONNX y un manifiesto de política versionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación ONNX; se desconoce si incluye cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Otros parámetros relevantes:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modo de ejecucion | perpetuo (hasta recibir orden de parada) |
| Normalizador de observaciones | integrado en `policy.onnx` |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `main`, commit `ffdb0d342` |
| Estado del checkout de exportacion | con cambios sin commitear |
| Tamano del repositorio | 0.0 GB declarado |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se trata de una política de aprendizaje por refuerzo entrenada con el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `ffdb0d342`) y exportada a ONNX para su ejecución en el robot. El autor indica que la exportación se realizó desde un checkout con cambios sin commitear, lo que impide reproducir exactamente el binario a partir del commit declarado.

El espacio de observación es de 61 dimensiones y el de acción de 14, coherente con un cuadrúpedo de pequeñas dimensiones con varios grados de libertad por pata. La política opera a 50 Hz y se describe como "perpetua", es decir, sin condición de terminación interna: genera una marcha continua hasta que el daemon la descarga o la sustituye. El normalizador de observaciones está embebido en el grafo ONNX, lo que simplifica la integración con el daemon `robotctl`. No se especifican el algoritmo de RL empleado (PPO, SAC, etc.), el número de pasos de entrenamiento, la composición del dataset ni si hubo recompensas de estilo o regularización.

## Capacidades

- Generación de marcha continua para el robot cuadrúpedo microduck a 50 Hz.
- Control de bucle cerrado a partir de 61 observaciones en bruto (sin preprocesado externo, gracias al normalizador embebido).
- Producción de 14 acciones de control por paso.
- Ejecución perpetua: la política no termina por sí misma, lo que permite mantener una marcha estable hasta que el operador la detenga.
- Carga dinámica en ranuras de política mediante `robotctl policy load <slot> <repo>`.
- Compatibilidad con el manifiesto de política schema 2 del daemon microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador motor, no un modelo generativo.

## Casos de uso

- Locomoción autónoma del microduck en laboratorio: cargar la política en una ranura y dejar que el robot camine de forma continua mientras se registran datos de sensores o se prueba el hardware.
- Evaluación comparativa de gaits: al ser una política "campeona de liga local", puede usarse como referencia base frente a otras políticas del mismo repositorio en pruebas de velocidad, estabilidad o consumo.
- Docencia e investigación en RL robótico: sirve como ejemplo de extremo a extremo de un pipeline que va del entrenamiento en `microduck_rl` a la exportación ONNX y al despliegue en el daemon.
- Pruebas de integración del daemon `robotctl`: permite validar la carga de políticas, el versionado del manifiesto schema 2 y la sustitución en caliente de ranuras.
- Demostraciones de robótica de bajo coste: el formato ONNX y la integración con un daemon ligero facilitan ejecutar la política en hardware embebido sin dependencias de frameworks de deep learning pesados.
- Recolección de datos de marcha para entrenamiento posterior: ejecutar la política de forma perpetua mientras se graban observaciones y acciones para imitación o ajuste fino.
- Validación de normalización de observaciones: al llevar el normalizador embebido, es útil para comprobar que el pipeline de sensores del robot entrega observaciones en el rango esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que la política es "campeón de liga local validado", sin cifras de recompensa, velocidad, estabilidad ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser una política de control de 61 entradas y 14 salidas exportada a ONNX, la huella de memoria es presumiblemente muy reducida, pero no se publica el número de parámetros ni el tamaño del fichero.
- GPU recomendadas: no disponible. El despliegue típico de microduck se realiza en el propio robot o en un host ligero; no se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible. Por la naturaleza del artefacto (ONNX, control a 50 Hz), es plausible su ejecución en CPU, pero no está confirmado en la documentación.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck, con carga mediante `sudo robotctl policy load <slot> BabyClaw/microduck-beaktug-long-juice-1240`. Runtime ONNX estándar (ONNX Runtime u otro compatible), no confirmado explícitamente.
- Latencia y throughput: la política debe operar a 50 Hz (20 ms por paso), pero no se publican medidas de latencia real ni throughput en el hardware objetivo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables del mismo autor o del ecosistema microduck con parámetros, contexto o rendimiento publicados que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La licencia no está declarada, lo que impide determinar si se permite uso comercial, modificación o redistribución.
- No se especifica la arquitectura de red ni el número de parámetros, lo que dificulta evaluar su complejidad y su coste computacional.
- La exportación se realizó desde un checkout con cambios sin commitear sobre el commit `ffdb0d342`, por lo que el binario no es reproducible a partir del código declarado.
- El término "campeón de liga local validado" no va acompañado de métricas; no hay evidencia numérica de rendimiento, estabilidad o robustez.
- La política es perpetua y no tiene condición de terminación interna: requiere supervisión o un mecanismo externo de parada para evitar marchas indefinidas ante fallos.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución; en robótica, esto se traduce en riesgo de comportamientos inseguros ante observaciones anómalas o entornos distintos a los del entrenamiento.
- El repositorio declara 0 GB de tamaño y 0 descargas, lo que sugiere que el artefacto puede no estar completamente subido o que su uso es estrictamente local.
- No se documentan los idiomas ni capacidades de lenguaje porque no aplica: cualquier expectativa de uso como modelo generativo es incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyClaw/microduck-beaktug-long-juice-1240
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `ffdb0d342`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck (no se proporciona URL directa)
