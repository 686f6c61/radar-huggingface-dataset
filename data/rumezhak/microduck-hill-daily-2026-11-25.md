# rumezhak/microduck-hill-daily-2026-11-25

## Resumen

`microduck-hill-daily-2026-11-25` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es una política de locomoción que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensada para ejecutarse de forma continua ("perpetua") en el robot hasta que se le indique lo contrario. Se publica en formato ONNX con el normalizador de observaciones embebido en el propio grafo, de modo que el operador puede alimentar observaciones en crudo.

El autor del repositorio es el usuario `rumezhak`, que lo publica bajo la librería `microduck` y la etiqueta de pipeline `robotics`. La model card es extremadamente escueta: no incluye información sobre arquitectura de red, número de parámetros, dataset de entrenamiento, recompensas ni resultados de evaluación. El nombre sugiere una política de marcha ("gait") orientada a terrenos con pendiente ("hill") y una variante diaria fechada el 25 de noviembre de 2026, lo que apunta a un pipeline de entrenamiento iterativo con checkpoints periódicos.

Su relevancia es acotada pero concreta: encaja en el ecosistema de robótica open source de Pollen Robotics como una política cargable directamente en una ranura del demonio `robotctl`, lo que permite a desarrolladores probar marchas entrenadas por RL sin reentrenar. Al no haber métricas publicadas ni licencia declarada, debe tratarse como un artefacto experimental de uso interno o de investigación, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política RL exportada a ONNX; arquitectura de red no declarada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de red de la política. Por el contexto (política de RL para un cuadrúpedo de bajo coste, exportada a ONNX y ejecutada a 50 Hz), lo habitual en este tipo de sistemas es una red de política compacta tipo MLP o red recurrente ligera que mapea observaciones de 61 dimensiones a 14 acciones de control articular. El repositorio no incluye capas, anchuras, funciones de activación ni número de parámetros, por lo que cualquier detalle adicional sería especulación.

Sobre el entrenamiento, la model card indica que se usó el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se especifican el número de pasos de entorno, la función de recompensa, el algoritmo de RL (PPO, SAC u otro), ni la composición del terreno de entrenamiento. El nombre "hill-daily" sugiere entrenamiento sobre pendientes con checkpoints diarios, pero no hay confirmación en la documentación. El normalizador de observaciones está embebido en `policy.onnx`, un detalle técnico relevante: el consumidor no necesita replicar estadísticas de normalización en el lado del robot.

## Capacidades

- Locomoción continua del robot microduck: la política está diseñada como marcha "perpetua", es decir, se ejecuta indefinidamente hasta que se descarga o se sustituye.
- Control a 50 Hz con 14 acciones de salida, adecuado para el bucle de control de bajo nivel del cuadrúpedo.
- Consumo de observaciones en crudo de 61 dimensiones gracias al normalizador embebido en el ONNX.
- Carga directa en una ranura de política del demonio `robotctl` mediante `sudo robotctl policy load <slot> rumezhak/microduck-hill-daily-2026-11-25`.
- Compatibilidad con el manifiesto de políticas schema 2 del ecosistema microduck.
- No dispone de tool calling, razonamiento multi-paso, capacidades lingüísticas, visión ni audio: es exclusivamente una política motora.

## Casos de uso

- Investigación en locomoción con RL: cargar la política en un microduck físico o simulado para comparar la marcha "hill" con otras políticas del mismo repositorio y medir estabilidad en pendientes.
- Pruebas de robustez en terreno inclinado: al estar etiquetada como "hill", sirve como punto de partida para evaluar el comportamiento del robot en rampas y desniveles antes de entrenar variantes propias.
- Base para fine-tuning: el commit de entrenamiento (`5cee942d8` en `pollen-robotics/microduck_rl`) permite reproducir el pipeline y continuar el entrenamiento con nuevas recompensas o dominios.
- Demostraciones educativas: útil en talleres de robótica open source para mostrar cómo se despliega una política RL en un cuadrúpedo de bajo coste sin escribir código de control.
- Integración en pipelines de CI de robótica: el formato ONNX y el manifiesto schema 2 permiten automatizar la carga y la prueba de políticas en bancos de pruebas con `robotctl`.
- Evaluación comparativa de marchas: al ser una política fechada y versionada, facilita la comparación A/B entre checkpoints diarios para seleccionar la marcha más estable antes de un despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensas medias, tasas de éxito, velocidad de marcha, consumo energético ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control compacta exportada a ONNX, es razonable esperar que quepa en el propio ordenador de a bordo del microduck, pero no hay datos publicados.
- GPU recomendadas: no disponible. No se especifica si la política requiere GPU o se ejecuta en CPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el método documentado es `robotctl policy load` sobre el demonio microduck; al ser ONNX, también podría ejecutarse con ONNX Runtime en otros entornos, aunque no está documentado.
- Latencia y throughput: no disponible. El único dato temporal es la frecuencia de control de 50 Hz que debe sostener el bucle.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-hill-daily-2026-11-25 | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| Otras políticas del repositorio `rumezhak` | Políticas RL para microduck | no disponible | no disponible | no disponible | Hugging Face |
| Políticas de referencia de `pollen-robotics/microduck_rl` | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio GitHub |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas de otras plataformas robóticas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial ni redistribución; hay que contactar con el autor antes de integrarla en un producto.
- Sin métricas de evaluación publicadas: no hay evidencia de estabilidad, velocidad ni robustez más allá de la descripción cualitativa "hill".
- Model card mínima: no se documentan la arquitectura, el algoritmo de RL, la recompensa ni el dominio de entrenamiento, lo que dificulta la reproducibilidad.
- Repositorio de 0.0 GB y 0 descargas: indica un artefacto recién publicado y sin validación por parte de la comunidad.
- Es una política específica del hardware microduck (61-D de observación, 14 acciones): no es transferible a otros robots sin reentrenamiento.
- El nombre incluye una fecha futura (2026-11-25) y una marca "daily": conviene verificar que el checkpoint corresponde realmente a la versión esperada antes de cargarlo en un robot físico.
- Riesgo de comportamiento inseguro en el mundo real: al no haber datos de seguridad ni de parada de emergencia, debe probarse primero en simulación o con el robot suspendido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-hill-daily-2026-11-25
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio microduck
