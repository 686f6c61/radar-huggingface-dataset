# juicenv/microduck-hill-es2

# juicenv/microduck-hill-es2

## Resumen

`juicenv/microduck-hill-es2` es una política de control robótico (no un modelo de lenguaje) publicada en HuggingFace por el usuario `juicenv`. Se trata de un *gait* o patrón de marcha para el robot cuadrúpedo de código abierto [microduck](https://github.com/pollen-robotics/microduck) de Pollen Robotics, afinado mediante estrategias de evolución (*evolution strategies*) contra el propio *hill scorer* de la Arena sobre x86. El resultado es una política perpetua: una vez cargada en una *slot* de política del robot, se ejecuta de forma continua hasta que se le indique lo contrario.

El modelo parte de `HannesVonEssen/microduck-running` (Apache-2.0) y lo especializa para subida de colinas, de ahí el nombre "hill-es2" y la descripción de "1.5 m Hill Climb runner". La interfaz es deliberadamente sencilla: 61 dimensiones de observación de entrada, 14 acciones de salida y una frecuencia de control de 50 Hz. El normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

Su relevancia es acotada pero clara: sirve como pieza reproducible dentro del ecosistema microduck, como *baseline* de investigación en optimización de políticas con estrategias evolutivas y como ejemplo de despliegue de una política ONNX mediante el daemon `robotctl`. En el momento de la consulta el repositorio acumula 0 descargas y 0 *likes*, y no se ha publicado información sobre licencia del derivado, parámetros totales ni resultados numéricos de *benchmarks*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico; arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; opera paso a paso sobre observaciones de 61 dimensiones |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no aplicable (modelo de robótica, no de lenguaje) |
| Licencia | no disponible en la ficha del derivado; el modelo base `HannesVonEssen/microduck-running` se publica bajo Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`), con normalizador de observaciones embebido |
| Espacio de observacion | 61 dimensiones |
| Espacio de accion | 14 acciones |
| Frecuencia de control | 50 Hz |
| Modelo base | `HannesVonEssen/microduck-running` |
| Relacion con el modelo base | finetune |
| Libreria / runtime | `microduck` (daemon con `robotctl`) |
| Manifiesto | `manifest.json`, esquema 2 del manifiesto de políticas microduck |
| Tamano del repositorio | 0.0 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no detalla la topología de la red: no se especifican número de capas, dimensión de las capas ocultas, función de activación ni número de parámetros. Lo que sí se declara es el método de ajuste: el modelo parte de `HannesVonEssen/microduck-running` y se afina mediante estrategias de evolución (*evolution strategies*) empleando como función de fitness el propio *hill scorer* de la Arena, ejecutado sobre x86. Esto sitúa el entrenamiento en el paradigma de optimización sin gradientes (o con gradientes aproximados por estimación de score), habitual en políticas de locomoción de baja dimensionalidad.

El artefacto distribuido es un único `policy.onnx` que incorpora el normalizador de observaciones, de modo que la política espera observaciones crudas del robot y devuelve las 14 acciones de control. El entrenamiento se realizó sobre el repositorio `pollen-robotics/microduck_rl`, rama `lean`, commit `5a3636302`. No se documentan en la información disponible el número de tokens o episodios de entrenamiento, la composición del dataset, ni el uso de RLHF o DPO (técnicas propias de modelos de lenguaje, no aplicables aquí).

## Capacidades

- Locomoción cuadrúpeda especializada en subida de colinas ("1.5 m Hill Climb runner") para el robot microduck.
- Política perpetua: genera la marcha de forma continua hasta recibir una orden de parada o sustitución de política.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración (se alimentan observaciones sin preprocesar).
- Carga directa en una *slot* de política del robot mediante el comando `sudo robotctl policy load <slot> juicenv/microduck-hill-es2`.
- Compatibilidad con el esquema 2 del manifiesto de políticas microduck (`manifest.json`).
- Punto de partida para nuevos ajustes por evolución u otros métodos sobre el mismo robot.
- No soporta *tool calling*, ni *function calling*, ni razonamiento multi-paso, ni capacidades multilingües: no es un modelo generativo de texto.
- No dispone de modos de visión, audio ni *thinking mode*.

## Casos de uso

- Locomoción sobre terreno inclinado en microduck: la política está específicamente ajustada contra el *hill scorer* de la Arena, por lo que su uso natural es hacer que el robot ascienda colinas de forma estable a 50 Hz.
- Investigación en estrategias evolutivas aplicadas a robótica: sirve como ejemplo reproducible de ajuste de una política de locomoción desde un modelo base, con repositorio de entrenamiento y commit identificados.
- Baseline en experimentos de locomoción: al derivar de `microduck-running` y estar especializada en colinas, permite medir cuánto aporta el ajuste evolutivo frente a la política de partida (útil para investigar sobre olvido catastrófico).
- Despliegue y validación del pipeline `robotctl`: resulta útil para verificar el flujo completo de carga de políticas, el formato de manifiesto (esquema 2) y la integración del ONNX con el daemon.
- Robótica educativa y demostraciones: al ser una política perpetua cargable en una *slot*, permite mostrar locomoción continua en talleres y ferias sin infraestructura adicional.
- Punto de partida para *fine-tuning*: otras variantes de marcha o de terreno pueden evolucionar a partir de esta política en lugar de hacerlo desde la política base, reduciendo el coste de búsqueda.
- Pruebas de transferencia sim-to-real: permite comparar el comportamiento de una política entrenada en simulación frente a la ejecución en el robot físico, siempre que se respete el espacio de observación de 61 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el ajuste se realizó contra el *hill scorer* de la Arena (x86), pero no incluye puntuaciones, curvas de *fitness*, comparaciones ni métricas de éxito. No se dispone de datos de latencia, *throughput* ni tasa de caídas.

## Requisitos de hardware

- La inferencia está pensada para el propio robot microduck (espacio de observación de 61 dimensiones y 14 acciones), no para un servidor de GPU. No se publican requisitos de VRAM.
- El repositorio ocupa 0.0 GB, lo que indica un artefacto ONNX muy pequeño; no se dispone del tamaño exacto del archivo ni del número de parámetros.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) porque no hay datos que las justifiquen. Por la naturaleza del modelo, la ejecución en CPU es el escenario esperado.
- La frecuencia de control de 50 Hz impone un requisito temporal implícito: cada paso de inferencia debe completarse dentro de la ventana de 20 ms para mantener el control en tiempo real. No se han publicado mediciones que confirmen el cumplimiento.
- Opciones de despliegue: runtime `microduck` mediante el daemon `robotctl` (comando `policy load`) y ejecución de ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores para modelos de lenguaje.
- El *hill scorer* mencionado en el entrenamiento se ejecuta sobre x86; no se detalla la máquina utilizada ni el tiempo de entrenamiento.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otras políticas microduck comparables, más allá del modelo base del que deriva. La comparación posible es limitada:

| Modelo | Parametros | Observacion / accion | Frecuencia | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `juicenv/microduck-hill-es2` | no disponible | 61 / 14 | 50 Hz | Estrategias de evolución sobre *hill scorer* de la Arena, partiendo de `microduck-running` | no disponible (base Apache-2.0) | HuggingFace, 0 descargas |
| `HannesVonEssen/microduck-running` | no disponible | no disponible | no disponible | no disponible (modelo base) | Apache-2.0 | HuggingFace |
| Otras políticas microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponibles en la informacion proporcionada |

## Limitaciones y advertencias

- La licencia del modelo derivado no está declarada. Aunque el modelo base es Apache-2.0, la ficha de `juicenv/microduck-hill-es2` no especifica términos, por lo que debe confirmarse con el autor antes de cualquier uso comercial o redistribución.
- Especialización estrecha: la política está ajustada para subida de colinas; no hay evidencia de que generalice a otros terrenos, pendientes o superficies.
- Dependencia de hardware concreta: el espacio de observación de 61 dimensiones y las 14 acciones la ligan al microduck; no es transferible directamente a otras plataformas sin reentrenamiento.
- Comportamiento perpetuo por diseño: "runs until told otherwise". En producción debe preverse un mecanismo de parada y de sustitución de política para evitar ejecuciones indefinidas no deseadas.
- Sin validación comunitaria: 0 descargas y 0 *likes*, sin evidencia pública de uso en robots reales ni de robustez en condiciones distintas a las de entrenamiento.
- No se documentan riesgos de alucinación ni sesgos, conceptos que no aplican a una política de control no generativa. Sí existe riesgo de fallo físico (caída, colisión) si la política se ejecuta fuera de su dominio de entrenamiento.
- No se especifican limitaciones de idioma porque el modelo no procesa lenguaje.
- El repositorio fue creado y actualizado el mismo día (2026-10-13), sin historial de versiones ni *changelog*.
- La búsqueda web realizada no devolvió documentación técnica relevante sobre este modelo: los resultados obtenidos corresponden a una aplicación Android ajena al proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-hill-es2
- Modelo base: https://huggingface.co/HannesVonEssen/microduck-running
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento referenciado en la model card: `pollen-robotics/microduck_rl`, rama `lean`, commit `5a3636302`
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a una aplicacion Android sin relacion con el proyecto
