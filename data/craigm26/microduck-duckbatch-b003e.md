# craigm26/microduck-duckbatch-b003e

## Resumen

Microduck-duckbatch-b003e es una política de control motriz (locomoción) para el robot cuadrúpedo de bajo coste Microduck, desarrollado por Pollen Robotics. El modelo lo publica el usuario craigm26 en Hugging Face y se distribuye como un artefacto ONNX que se carga directamente en el daemon del robot mediante el comando `robotctl policy load walk`. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo que genera comandos de articulación a 50 Hz a partir de una observación de 61 dimensiones, produciendo 14 acciones de control. Su función es hacer que el robot camine de forma perpetua y se detenga de forma limpia cuando recibe un comando de velocidad cero.

El modelo es un fine-tuning del checkpoint anterior `craigm26/microduck-duckbatch-b002-128x128` y pertenece a la serie "duckbatch" del autor, asociada al material didáctico Book 4 de microduckstudio.com. La relevancia es práctica: encaja en el ecosistema Microduck como una "gait" lista para el slot `walk`, de modo que un desarrollador puede desplegar locomoción en el robot con un solo comando, sin entrenar desde cero.

La información pública disponible es muy limitada: no se detallan parámetros de red, arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks. La model card solo indica la interfaz de observación/acción, la frecuencia de control, el repositorio de entrenamiento (`pollen-robotics/microduck_rl`) y que el normalizador de observaciones está embebido en el propio `policy.onnx`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; red neuronal feed-forward, topología no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de política | `walk` |
| Modelo base | craigm26/microduck-duckbatch-b002-128x128 (fine-tune) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red. Por el contexto del ecosistema (política para el Microduck, exportada a ONNX, con observación de 61 dimensiones y 14 acciones a 50 Hz) se trata de una política de control entrenada con aprendizaje por refuerzo, presumiblemente mediante el repositorio `pollen-robotics/microduck_rl`. El modelo es un fine-tune del checkpoint `duckbatch-b002-128x128`, cuyo sufijo sugiere un tamaño de lote o de red de 128x128, aunque este dato no se confirma en la información disponible.

No se especifican el número de tokens o episodios de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. El único detalle técnico destacable es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. La política se declara "perpetua": mantiene la marcha indefinidamente hasta recibir un comando de parada, y el objetivo declarado del fine-tune es detenerse de forma limpia ante un comando de velocidad cero.

## Capacidades

- Locomoción cuadrúpeda: genera 14 comandos de articulación a 50 Hz a partir de 61 observaciones del robot.
- Marcha perpetua: mantiene el ciclo de caminata de forma continua hasta recibir una orden de parada.
- Parada limpia ante comando cero: el fine-tune está orientado específicamente a detenerse de forma estable cuando la velocidad comandada es nula.
- Integración directa con el daemon del robot mediante `robotctl policy load walk`.
- Normalización de observaciones integrada en el artefacto ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es exclusivamente una política motriz.

## Casos de uso

- Locomoción base del Microduck: cargar la política en el slot `walk` con `robotctl policy load walk craigm26/microduck-duckbatch-b003e` para obtener una marcha funcional sin entrenamiento adicional.
- Demostraciones educativas: el modelo está asociado al Book 4 de microduckstudio.com, por lo que sirve como ejemplo práctico de políticas de RL desplegables en un robot de bajo coste.
- Navegación teleoperada: la marcha perpetua con parada limpia encaja en escenarios donde un operador envía comandos de velocidad y necesita que el robot se detenga de forma fiable al soltar el control.
- Punto de partida para fine-tuning: al ser un fine-tune de `duckbatch-b002-128x128`, puede reutilizarse como base para entrenar variantes de marcha con el repositorio `microduck_rl`.
- Pruebas de integración del daemon: útil para validar el pipeline `robotctl` y el esquema 2 del manifiesto de políticas en un robot real o simulado.
- Investigación en control con RL: referencia para comparar estrategias de parada y estabilidad en políticas de locomoción de robots pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo es una política ONNX de robótica; no requiere GPU para inferencia en el robot. Se ejecuta en el propio hardware del Microduck a 50 Hz.
- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB según Hugging Face) el artefacto es muy pequeño y cabe en memoria de un sistema embebido.
- GPU recomendadas: no aplica para despliegue en el robot. Para reentrenamiento con `pollen-robotics/microduck_rl`, no se especifican requisitos.
- Cabe en GPU de consumo: sí, en la medida en que el artefacto es un ONNX de pequeño tamaño; no se documentan requisitos concretos.
- Opciones de despliegue: `robotctl policy load walk` sobre el daemon de microduck; runtime ONNX estándar para ejecución fuera del robot.
- Latencia y throughput: frecuencia de control fijada en 50 Hz; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-duckbatch-b003e | Política RL (ONNX) para Microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face, 28 descargas |
| microduck-duckbatch-b002-128x128 | Política RL (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas del ecosistema microduck | Políticas RL por slot | no disponible | no disponible | no disponible | Repositorio `pollen-robotics/microduck_rl` |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información muy escasa: no se publican arquitectura, número de parámetros, datos de entrenamiento ni licencia, lo que dificulta evaluar su idoneidad en producción.
- Licencia no disponible: no puede confirmarse el uso comercial; conviene contactar con el autor antes de integrarlo en un producto.
- Modelo específico para el hardware Microduck: no es transferible a otros robots sin reentrenamiento.
- Sin capacidades de lenguaje, visión ni razonamiento: cualquier expectativa en ese sentido es incorrecta.
- Riesgo de comportamiento degradado fuera de la distribución de observaciones de entrenamiento (terrenos, cargas o perturbaciones no vistas).
- El modelo se declara "perpetuo": sin un comando de parada adecuado, el robot seguirá ejecutando la marcha.
- Sin benchmarks publicados: el rendimiento real debe validarse en el robot antes de usarlo en escenarios críticos.
- La fecha de creación del repositorio (2026) y el escaso número de descargas (28) indican un modelo muy reciente y con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/craigm26/microduck-duckbatch-b003e
- Modelo base: https://huggingface.co/craigm26/microduck-duckbatch-b002-128x128
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`
- Material didáctico del autor: https://microduckstudio.com (Book 4)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
