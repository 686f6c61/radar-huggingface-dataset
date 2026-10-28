# munish0838/microduck-sprint-baseline-test

## Resumen

`microduck-sprint-baseline-test` es una política de control robótico publicada por el usuario munish0838 en HuggingFace para el robot **microduck** de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo: es un artefacto de reinforcement learning exportado a ONNX que implementa una marcha («sprint») de carácter **perpetuo**, con 61 dimensiones de observación de entrada, 14 acciones de salida y una frecuencia de control de 50 Hz. Se carga en una ranura (*slot*) de política del daemon del robot mediante el comando `robotctl policy load <slot> munish0838/microduck-sprint-baseline-test`.

El interés del artefacto es fundamentalmente de infraestructura: sirve como *baseline* de pruebas para verificar la cadena completa de entrenamiento y despliegue (repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `4b675ebf4`), el formato de manifiesto de políticas (schema 2) y el mecanismo de normalización de observaciones. El repositorio no incluye arquitectura de red, hiperparámetros, dataset ni métricas de rendimiento.

El modelo se publicó el 28 de octubre de 2026, acumula 0 descargas y 0 *likes*, tiene un tamaño de repositorio de 0.0 GB y no declara licencia ni idiomas. Esos datos lo sitúan como un experimento de validación, no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; no se publica la topología de red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible — no aplica: política de control con 61-D de observación por paso y 14 acciones a 50 Hz |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx`; no se documentan variantes) |
| Idiomas soportados | no disponible — no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas de microduck) |
| Tipo de modelo | política de reinforcement learning para robótica (`pipeline_tag: robotics`) |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Frecuencia de control | 50 Hz (presupuesto de 20 ms por paso) |
| Normalización | normalizador de observaciones embebido en el propio `policy.onnx`; se alimenta con observaciones en bruto |
| Horizonte de episodio | perpetuo: la política no incorpora condición de terminación |
| Librería declarada | `microduck` |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-28 |

## Arquitectura y entrenamiento

No se publica la arquitectura de la red neuronal (número de capas, tipo de encoder, tamaño de las capas ocultas ni número de parámetros). Lo que sí se documenta es el contrato de interfaz: la política consume un vector de observación de 61 dimensiones y emite 14 acciones a 50 Hz, y el normalizador de observaciones está integrado en el grafo ONNX, de modo que el consumidor debe entregar observaciones en bruto sin preprocesar. Esta decisión reduce el riesgo de desajuste entre el preprocesado de entrenamiento y el de inferencia, un fallo habitual en el despliegue sim-to-real.

El entrenamiento se realizó con el *toolchain* `pollen-robotics/microduck_rl`, rama `main`, commit `4b675ebf4`. No se especifican el número de tokens o pasos de simulación, la composición de los entornos, el algoritmo de RL empleado (PPO, SAC u otro), ni si hubo fases de ajuste fino o *domain randomization*. La etiqueta «perpetual» indica que la política fue optimizada para mantener la marcha indefinidamente en lugar depara alcanzar una meta con episodios acotados, lo que implica que la parada debe gestionarse externamente desde el daemon o el operador.

## Capacidades

- Generación de una marcha continua («sprint») sobre el robot microduck, mantenida de forma indefinida sin condición de terminación propia.
- Control de locomoción a 50 Hz con 14 actuaciones por paso, compatible con el bucle de control en tiempo real del daemon.
- Ingesta de observaciones en bruto de 61 dimensiones, con normalización resuelta dentro del modelo.
- Integración como política cargable en una ranura mediante `robotctl policy load`, lo que permite alternarla con otras políticas sin recompilar el daemon.
- Distribución en ONNX, ejecutable con ONNX Runtime en CPU sin dependencias de frameworks de deep learning completos.
- Conformidad con el schema 2 del manifiesto de políticas de microduck (`docs/policy-manifest.md` del repositorio del daemon).
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de propósito general.

## Casos de uso

- **Validación de la cadena de despliegue**: cargar la política con `robotctl policy load` en un microduck real o simulado para comprobar de extremo a extremo que el daemon, el manifiesto y el runtime ONNX funcionan antes de entrenar políticas propias.
- **Prueba de regresión del daemon**: usar esta política como entrada fija en tests automatizados de CI que verifiquen que una actualización del daemon no rompe la carga de políticas ni el bucle de control a 50 Hz.
- **Referencia base (*baseline*) en experimentos de RL**: comparar nuevas marchas entrenadas en `microduck_rl` contra este sprint perpetuo para medir si una modificación del *reward* o del entorno mejora la estabilidad de la locomoción.
- **Verificación de latencia y *throughput***: medir el tiempo de inferencia de `policy.onnx` en el ordenador de a bordo del robot, con un presupuesto estricto de 20 ms por paso derivado de los 50 Hz, y detectar si el hardware no cumple el ciclo de control.
- **Depuración del pipeline de normalización**: al llevar el normalizador embebido, sirve para comprobar que el robot entrega las 61 observaciones en el orden y las unidades correctos; un desajuste se manifiesta de inmediato como una marcha fallida.
- **Docencia y demos de robótica open source**: ejemplo mínimo y reproducible de política cargable en un robot de bajo coste para explicar el flujo observación-acción en RL aplicado a locomoción.
- **Punto de partida para *fine-tuning***: al estar entrenada con un repositorio público y un commit identificable, puede servir como inicialización para ajustar una marcha concreta (velocidad, terreno, carga útil) sobre la misma interfaz de 61-D/14 acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay métricas de recompensa acumulada, velocidad de desplazamiento, estabilidad, tasa de caídas, ni comparaciones en simulación o en robot real. Tampoco se documentan latencias medidas de `policy.onnx` en hardware concreto.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio declara 0.0 GB, por lo que el tamaño real de `policy.onnx` no se puede inferir; una política de RL de este tipo suele ser de pocos megabytes, pero es una estimación no verificada con los datos publicados.
- **GPU recomendadas**: no disponible. No se documenta ningún requisito de GPU; el formato ONNX permite inferencia en CPU.
- **Viabilidad en GPU de consumo**: no confirmada. Al no publicarse el número de parámetros ni el tamaño del grafo, no se puede afirmar que quepa en una RTX 4090 u otra GPU de consumo, aunque por la naturaleza del artefacto lo esperable es que ni siquiera sea necesaria.
- **Hardware objetivo**: el ordenador de a bordo del robot microduck, ejecutando el daemon y ONNX Runtime; no se especifican CPU, RAM ni aceleradores.
- **Opciones de despliegue**: ONNX Runtime (formato nativo del artefacto) y el daemon de microduck vía `robotctl`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: el único dato objetivo es la frecuencia de control de 50 Hz, es decir, un presupuesto máximo de 20 ms por paso de inferencia más comunicación. No se publican latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / interfaz | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-sprint-baseline-test | Política RL en ONNX | no disponible | 61-D obs. / 14 acciones a 50 Hz | no disponible | no disponible | HuggingFace, 0 descargas |
| Otras políticas de microduck en HuggingFace | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas de referencia del repo `microduck_rl` | no disponible | no disponible | no disponible | no disponible | no disponible | repositorio de entrenamiento citado, sin datos de modelos |

No se dispone de información sobre políticas comparables de la misma familia ni sobre métricas que permitan un enfrentamiento cuantitativo. La comparación con políticas genéricas de robótica (ACT, Diffusion Policy, TDMPC) no se puede sostener con datos de esta ficha y se omite para no introducir cifras no verificadas.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no hay autorización clara para uso comercial, redistribución ni modificación; en producción esto es un bloqueante legal hasta contactar con el autor.
- **Ausencia total de validación externa**: 0 descargas y 0 *likes* implican que no hay evidencia de terceros de que la política funcione en hardware real.
- **Repositorio de 0.0 GB**: el tamaño declarado sugiere que los artefactos pueden no estar materializados o gestionados fuera del repositorio; conviene verificar la presencia y el tamaño real de `policy.onnx` y `manifest.json` antes de integrar.
- **Política perpetua sin condición de parada**: al no incorporar terminación, requiere un mecanismo externo de seguridad (watchdog, parada del operador, límites del daemon); no debe ejecutarse sin supervisión en un robot físico.
- **Riesgo de sim-to-real**: no se documenta *domain randomization*, composición del dataset ni validación en hardware, por lo que la transferencia desde simulación es incierta.
- **Contrato de observación estricto**: el normalizador va embebido; alimentar observaciones preprocesadas, desordenadas o en unidades distintas a las del entrenamiento produce acciones inválidas sin aviso explícito.
- **Sin métricas de robustez**: no hay datos sobre comportamiento ante terrenos irregulares, empujes, cambios de carga o fallos de sensores.
- **Trazabilidad limitada al commit**: se cita el commit `4b675ebf4` de la rama `main` de `microduck_rl`, pero sin fijar versiones de dependencias ni semillas, la reproducibilidad no está garantizada.
- **Sin soporte de lenguaje, visión ni herramientas**: cualquier expectativa de uso como modelo generativo es un error de categoría.
- **Metadatos con fecha futura** (creación 2026-10-28): conviene contrastar la vigencia y el estado del repositorio antes de basar en él un flujo de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/munish0838/microduck-sprint-baseline-test
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento citado: https://github.com/pollen-robotics/microduck_rl (rama `main`, commit `4b675ebf4`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (ruta citada en la model card; no se proporciona URL directa)
