# craigm26/microduck-duckbatch-b003f

## Resumen

`craigm26/microduck-duckbatch-b003f` es una política de control locomotriz para el robot cuadrúpedo de bajo coste microduck de Pollen Robotics, publicada por el usuario craigm26 dentro de la serie «duckbatch». No es un modelo de lenguaje: es una política de reinforcement learning que mapea una observación de 61 dimensiones a 14 acciones de control a 50 Hz, con comportamiento perpetuo (camina hasta que se le ordena parar) y pensada para ocupar el slot `walk` del daemon del robot.

El modelo es un estudiante destilado de 26.254 parámetros entrenado en simulación a partir de la marcha de referencia de Pollen, y después ajustado fino (finetune) desde `craigm26/microduck-duckbatch-b002-128x128` incorporando términos de progreso y desactivando el «pull» del profesor sobre los fotogramas en posición vertical. Se distribuye como `policy.onnx` con el normalizador de observaciones embebido en el propio grafo, más un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada pero concreta: es un ejemplo de política de locomoción minúscula (~26 mil parámetros) ejecutable en el propio robot, publicada de forma abierta y con un flujo de despliegue declarado (`robotctl policy load walk ...`). El autor advierte explícitamente de que solo se ha validado en simulación y nunca se ha ejecutado sobre hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Política de control exportada a ONNX; la model card no especifica la topología de la red (capas, activaciones ni tipo de codificador) |
| Parametros totales | 26.254 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica. Política reactiva paso a paso: observación de 61 dimensiones por inferencia, a 50 Hz (presupuesto de 20 ms por paso) |
| Tipos de cuantizacion | No disponible. Solo se publica `policy.onnx`; el autor no documenta variantes cuantizadas (int8, fp16) |
| Idiomas soportados | No disponible / no aplica. El modelo no procesa lenguaje natural |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones embebido) + `manifest.json` (schema 2 del policy manifest de microduck) |

Otros datos de la publicación: pipeline `robotics`, librería `microduck`, tamaño del repositorio 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 27 de octubre de 2026 y actualizado dos minutos después.

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna. Lo que sí consta es el contrato de entrada/salida: 61 dimensiones de observación, 14 acciones, 50 Hz, comportamiento perpetuo. El modelo es un «estudiante» de 26.254 parámetros de la marcha (walk) de Pollen, es decir, un proceso de destilación o imitación de una política profesora preexistente, seguido de un ajuste fino en simulación. Ese ajuste incorpora dos cambios declarados por el autor: términos de progreso en la función de recompensa y la desactivación del arrastre («pull») del profesor sobre los fotogramas en los que el robot está en posición vertical. El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`.

El modelo se declara como finetune de `craigm26/microduck-duckbatch-b002-128x128` (relación `base_model_relation: finetune`). La model card no indica número de tokens o pasos de entorno, composición del dataset, algoritmo de RL empleado, ni si hubo fases de RLHF/DPO (conceptos, por otra parte, propios de modelos de lenguaje y no de políticas de control). El detalle técnico más relevante para el despliegue es que el normalizador de observaciones está incluido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado adicional.

## Capacidades

- Locomoción: genera una marcha perpetua para el microduck, consumiendo observaciones de 61 dimensiones y emitiendo 14 acciones de control a 50 Hz.
- Ejecución autocontenida: el normalizador va embebido en el ONNX, lo que elimina dependencias de preprocesado en el lado del robot.
- Integración con el daemon de microduck: se carga directamente en el slot `walk` mediante `robotctl policy load walk craigm26/microduck-duckbatch-b003f`.
- Comportamiento continuo: la política no termina por sí sola; se ejecuta hasta que se le ordena detenerse.
- Reutilización como punto de partida: sirve como checkpoint base para nuevos ajustes finos en simulación con `microduck_rl`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni modo «thinking»: es exclusivamente una política motora.

## Casos de uso

- Desplazamiento en laboratorio: cargar la política en el slot `walk` del daemon y usar el robot como plataforma de experimentación de locomoción, aprovechando que el contrato de observación/acción ya está fijado (61-D / 14 acciones / 50 Hz) y el normalizador viene resuelto.
- Punto de partida para ajuste fino: emplear los 26.254 parámetros como inicialización en `pollen-robotics/microduck_rl` para entrenar variantes (distintas recompensas, terrenos o velocidades) partiendo de una marcha ya formada en lugar de desde cero.
- Comparación de destilación: evaluar en simulación cuánto de la marcha del profesor se conserva al comprimirla en un estudiante de ~26 mil parámetros, midiendo deriva, caídas y progreso por episodio frente a políticas mayores.
- Validación de la cadena de despliegue: usar el modelo como artefacto de prueba del pipeline `manifest.json` (schema 2) y del comando `robotctl policy load`, verificando que el daemon acepta y ejecuta políticas de terceros.
- Docencia e investigación en RL aplicado a robótica: por su tamaño reducido, el modelo se puede inspeccionar, versionar y ejecutar en recursos mínimos, lo que lo hace adecuado para prácticas sobre destilación de políticas y diseño de recompensas.
- Simulación de barridos de hiperparámetros: al ser un ONNX pequeño, se pueden lanzar evaluaciones masivas en paralelo en el simulador para estudiar sensibilidad a perturbaciones de observación, sin coste de GPU significativo.
- Banco de pruebas de sim-to-real: utilizarlo como referencia declarada «solo simulación» para contrastar metodologías de transferencia, asumiendo que el propio autor no lo ha validado en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente describe de forma cualitativa el proceso de entrenamiento (términos de progreso y desactivación del «pull» del profesor en fotogramas verticales) y no reporta métricas de recompensa, distancia recorrida, tasa de caídas, robustez ni comparaciones numéricas con el modelo base.

## Requisitos de hardware

- VRAM estimada: prácticamente despreciable. Con 26.254 parámetros, el peso en FP32 ronda los 105 KB y en int8 unos 26 KB (estimación aritmética a partir del número de parámetros, no un dato publicado).
- GPU recomendadas: no se requiere GPU. La inferencia a 50 Hz (20 ms por paso) es holgada para una CPU convencional, incluidas las integradas en plataformas robóticas de bajo consumo; el autor no especifica la plataforma de ejecución objetivo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU; no se documenta ningún requisito específico.
- Opciones de despliegue: ONNX Runtime como vía natural dado el formato publicado; el daemon de microduck mediante `robotctl policy load walk craigm26/microduck-duckbatch-b003f`; el ecosistema `microduck_rl` para evaluación en simulación. vLLM, TGI, llama.cpp u Ollama no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato de temporización es la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Observación / acciones | Frecuencia | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `craigm26/microduck-duckbatch-b003f` | 26.254 | 61-D / 14 | 50 Hz | ONNX + manifest schema 2 | No disponible | Finetune de b002-128x128; solo simulación |
| `craigm26/microduck-duckbatch-b002-128x128` | No disponible | No disponible | No disponible | No disponible | No disponible | Modelo base declarado; relación `finetune` |
| Política de marcha de referencia de Pollen (profesora) | No disponible | No disponible | No disponible | No disponible | No disponible | Citada como origen de la destilación; sin ficha técnica en la información disponible |

No se han identificado en la información proporcionada otras políticas públicas comparables para la plataforma microduck.

## Limitaciones y advertencias

- Validación exclusivamente en simulación: el autor indica explícitamente «sim only, never run on hardware». No hay evidencia de funcionamiento real ni de brecha sim-to-real.
- Licencia no disponible: sin licencia declarada no se puede asumir permiso de uso comercial, redistribución ni modificación; hay que contactar con el autor antes de cualquier uso en producción.
- Ausencia total de métricas: no hay benchmarks, curvas de entrenamiento ni tasas de éxito publicadas, por lo que el rendimiento real es desconocido.
- Sin información sobre el dataset de entrenamiento: se desconoce la distribución de terrenos, condiciones iniciales, perturbaciones y dominio de alturas empleados, lo que impide acotar el dominio de validez.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero sí existe el equivalente en forma de comportamiento no verificado fuera de distribución, con riesgo de caída o marcha inestable.
- Comportamiento perpetuo: la política se ejecuta hasta recibir una orden de parada; requiere supervisión y un mecanismo externo de seguridad al probarla.
- Idiomas y contexto: no aplica; no procesa lenguaje ni mantiene estado conversacional. Cualquier estado debe provenir del propio lazo de control.
- Trazabilidad limitada: repositorio de 0,0 GB, 0 descargas y 0 likes; publicación reciente y sin validación comunitaria. La topología de la red no está documentada, lo que dificulta auditar el modelo.
- Dependencia del contrato del daemon: el esquema 2 del manifiesto y el orden exacto de las 61 observaciones y 14 acciones no se detallan en la ficha; un cambio de versión del daemon puede romper la compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/craigm26/microduck-duckbatch-b003f
- Modelo base: https://huggingface.co/craigm26/microduck-duckbatch-b002-128x128
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado en la model card: https://github.com/pollen-robotics/microduck_rl
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` dentro del repositorio del daemon (ruta citada por el autor, sin URL directa en la información disponible)
