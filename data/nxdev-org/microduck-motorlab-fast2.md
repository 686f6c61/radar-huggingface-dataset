# nxdev-org/microduck-motorlab-fast2

## Resumen

`microduck-motorlab-fast2` es una política de control motriz (no un modelo de lenguaje) entrenada mediante aprendizaje por refuerzo para el robot bípedo Microduck de Pollen Robotics. La publica la organización `nxdev-org` como un checkpoint de inferencia en formato ONNX que se carga directamente en el daemon del robot a través de `robotctl`. Su función concreta es generar una marcha continua: recibe una observación de 61 dimensiones y emite 14 acciones a 50 Hz, sin condición de terminación propia ("perpetual policy"), por lo que se ejecuta hasta que se le ordena lo contrario.

El modelo corresponde al checkpoint 3999 del entrenamiento denominado internamente "motorlab v3 fast2", dentro del repositorio `pollen-robotics/microduck_rl` (rama `challenge-recipe-publishing`, commit `8d0dbc94c`). El repo de HuggingFace solo contiene los artefactos de despliegue (`policy.onnx` y `manifest.json` según el esquema 2 del manifiesto de políticas de microduck); no se publican pesos de entrenamiento, configuración de hiperparámetros ni curvas de recompensa.

Es relevante porque ejemplifica el patrón de distribución de comportamientos robóticos como artefactos versionados e intercambiables: una "receta" de marcha que se instala en una ranura de política del robot sin recompilar ni recalibrar nada, ya que el normalizador de observaciones está embebido en el propio ONNX y se alimenta con observaciones en crudo. Para desarrolladores e investigadores, sirve como referencia de cómo empaquetar políticas de RL para hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control motriz, exportada a ONNX; topología interna (capas, activaciones) no disponible |
| Parametros totales | no disponible (el repo reporta 0.0 GB, por debajo de la resolución de visualización de HuggingFace) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso de control |
| Tipos de cuantizacion | no disponible; se distribuye un único `policy.onnx` sin variantes cuantizadas declaradas |
| Idiomas soportados | no aplica (no procesa lenguaje); la model card está en inglés |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

Otros parámetros operativos declarados: 61 dimensiones de observación, 14 dimensiones de acción, frecuencia de control de 50 Hz (presupuesto de 20 ms por ciclo).

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red: solo se indica que es una política de RL exportada a ONNX con el normalizador de observaciones embebido en el grafo, de modo que el consumidor debe alimentar observaciones sin preprocesar. El espacio de observación tiene 61 dimensiones y el de acción 14, coherentes con un robot bípedo de 15 motores, cámara, LiDAR y pico prensil. La política es "perpetua": no emite señal de terminación ni episodios, se ejecuta como una marcha continua hasta que el daemon la descarga o la sustituye.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `8d0dbc94c`, bajo la receta "motorlab v3 fast2". No se especifican el número de tokens/pasos de simulación, la composición del dataset, el algoritmo de RL empleado (PPO, AMP u otro), ni si hubo fases de currículo, domain randomization o destilación. Tampoco se documenta el proceso de sim-to-real ni métricas de éxito en hardware.

## Capacidades

- Generación de una marcha bípeda continua a 50 Hz sobre el robot Microduck, sin condición de parada propia.
- Consumo de observaciones en crudo de 61 dimensiones (el normalizador va embebido en el ONNX).
- Emisión de 14 acciones de control motriz por paso.
- Carga en caliente en una ranura de política del daemon mediante `robotctl policy load <slot> ...`.
- Interoperabilidad con el manifiesto de políticas de microduck, esquema 2.
- Ejecución en inferencia pura: no soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.
- No se documentan capacidades de locomoción específicas (velocidad, giros, escalada, recuperación de caídas) ni habilidades con el pico prensil.

## Casos de uso

- Despliegue de referencia en un Microduck físico: cargar la política en una ranura con `sudo robotctl policy load <slot> nxdev-org/microduck-motorlab-fast2` para obtener una marcha funcional sin entrenar nada, útil para validar la cadena completa de software y el bus de motores.
- Pruebas de integración del daemon: al ser una política perpetua y autocontenida, sirve como carga de trabajo estable para verificar el ciclo de 50 Hz, la latencia del bus de servos y el comportamiento del gestor de ranuras al cambiar de política en caliente.
- Base de comparación en experimentos de RL: punto de partida para medir una nueva receta ("motorlab v4" u otra) contra un baseline fijo y versionado, con la ventaja de que el artefacto es idéntico en todas las réplicas.
- Docencia y divulgación en robótica: ejemplo mínimo de política RL en ONNX que se ejecuta en el propio robot, adecuado para talleres donde se explica el flujo observación-acción sin entrar en el entrenamiento.
- Evaluación de sim-to-real: al no publicarse métricas, un laboratorio puede usar esta política para cuantificar la brecha entre simulación y hardware real (deriva, estabilidad, consumo) con un checkpoint concreto y trazable.
- Sustitución como política por defecto en flotas de demostración: al no terminar por sí misma, encaja en instalaciones donde el robot debe permanecer en marcha continua y la parada se gestiona externamente (botón de seguridad o comando del operador).
- Benchmark interno de latencia en hardware边缘: un grafo ONNX pequeño a 50 Hz permite medir el rendimiento de una CPU ARM o de una SBC antes de pasar a políticas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente identifica el checkpoint como "3999", que es un índice de paso de entrenamiento, no una métrica de rendimiento. No hay datos de recompensa media, tasa de éxito, distancia recorrida, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0.0 GB reportados) y el tipo de artefacto (una política de 61 entradas y 14 salidas en ONNX), el consumo de memoria es marginal y cabe holgadamente en cualquier GPU o CPU con unos pocos cientos de MB libres. Estimación del editor, no dato del autor.
- GPU recomendadas: no aplica; no se requiere GPU. El caso natural es la CPU integrada del propio robot.
- Cabe en GPU de consumo: sí, en cualquier RTX o iGPU; también en CPU ARM de placa única, que es el escenario previsto por el fabricante.
- Presupuesto temporal: 50 Hz de frecuencia de control implican 20 ms por ciclo para inferencia más lectura de sensores y escritura en el bus de motores. La latencia real del ONNX no está publicada.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` del Microduck (vía soportada). Otros runtimes ONNX (onnxruntime-node, onnxruntime C++) son compatibles a nivel de formato, pero no hay soporte documentado.
- Almacenamiento: el artefacto completo (`policy.onnx` + `manifest.json`) ocupa menos de lo que HuggingFace reporta con su precisión de visualización, por lo que el despliegue en almacenamiento flash del robot no es un problema.

## Comparativa con modelos similares

No se dispone de datos publicados de otras políticas del ecosistema microduck (versiones previas de "motorlab", recetas alternativas del reto `challenge-recipe-publishing` ni políticas de terceros) que permitan una comparación cuantitativa.

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nxdev-org/microduck-motorlab-fast2` | no disponible | 61-D de observación, 14 acciones, 50 Hz | sin benchmarks publicados | no disponible | pública en HuggingFace |
| Otras políticas de `pollen-robotics/microduck_rl` | no disponible | no disponible | no disponible | no disponible (el código del robot es Apache-2.0, no así este artefacto necesariamente) | repo de entrenamiento referenciado, sin URL de pesos |
| Políticas RL para bípedos de talla similar (p. ej. entornos Isaac Lab / MuJoCo) | no disponible | no disponible | no disponible | habitualmente permisiva, variable por proyecto | variable |

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial. Que los repositorios del robot sean Apache-2.0 no implica que este checkpoint lo sea; hay que contactar con el autor antes de distribuirlo o integrarlo en un producto.
- Trazabilidad incompleta: solo se cita un commit y una rama de entrenamiento, sin configuración, semillas, curvas ni código de exportación. La reproducibilidad no está garantizada.
- Ausencia total de evaluación: no hay métricas de estabilidad, velocidad, consumo ni tasa de caídas, ni en simulación ni en hardware real. No se conoce su robustez ante terreno irregular, empujes o desgaste de batería.
- Acoplamiento al embodiment: 61-D de observación y 14 acciones implican una correspondencia exacta con la configuración de sensores y motores del Microduck. No es transferible a otro robot sin reentrenar.
- Política perpetua sin terminación: no detecta caídas ni fallos; requiere supervisión externa y un mecanismo de parada (física o por software) en cualquier despliegue.
- Riesgo de sobreajuste a la dinámica de simulación: sin datos de sim-to-real, la marcha puede degradarse en hardware con fricción, holguras o calibración distintas.
- Idiomas: la documentación está solo en inglés y el artefacto no procesa lenguaje; la ficha en castellano se basa en esa model card.
- Autoría y soporte: repositorio de un usuario/organización de terceros (`nxdev-org`), con 0 descargas y 0 likes, sin issues ni mantenimiento documentado.
- Advertencia de seguridad: cargar una política en un robot bípedo de 15 motores conlleva riesgo mecánico; conviene probarla primero con el robot suspendido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nxdev-org/microduck-motorlab-fast2
- Repositorio del robot Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL citado en la model card: https://github.com/pollen-robotics/microduck_rl (rama `challenge-recipe-publishing`, commit `8d0dbc94c`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Sitio oficial del robot: https://microducks.org/
- Página de producto de Pollen Robotics: https://pollen-robotics.com/microduck/
- Guía de construcción DIY: https://microduck.homes/microduck-diy
- Tutorial de montaje y software: https://github.com/AI-FanGe/Microduck-build-tutorial
