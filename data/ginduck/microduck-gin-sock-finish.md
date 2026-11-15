# GinDuck/microduck-gin-sock-finish

## Resumen

`GinDuck/microduck-gin-sock-finish` es una política de control motor entrenada por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. Se distribuye como un archivo `policy.onnx` acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon de microduck. La política es de tipo perpetuo: ejecuta una marcha continua a 50 Hz hasta que se le indique lo contrario, y se carga en una ranura de política del robot mediante el comando `robotctl policy load`.

El modelo trabaja exclusivamente en simulación: según la model card, las semillas 1, 2, 3 y 5 reproducen el entorno `sock-heist-composite-v9` de rumezhak, que a su vez se construye sobre `sock-heist-6m-v5` de lphatnguyen; en la semilla 4, los últimos doce pasos corresponden a una búsqueda propia de GinDuck. La red subyacente es `sock-heist continue-2` del mismo autor.

La relevancia es acotada pero específica: se trata de un artefacto de investigación en aprendizaje por refuerzo aplicado a locomoción de robots de bajo coste, empaquetado en el formato operativo del ecosistema microduck (ONNX con normalizador de observaciones embebido). No es un modelo de lenguaje ni un modelo generativo, y su utilidad está restringida al despliegue en hardware microduck o a la reproducción de experimentos de RL en el repositorio `microduck_rl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control motor (topología no especificada), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (política de control, no modelo de secuencia) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Entrada | Observación de 61 dimensiones (normalizador embebido; se alimenta con observaciones en bruto) |
| Salida | 14 acciones |
| Frecuencia de control | 50 Hz |
| Tipo de política | Perpetua (marcha continua hasta cancelación) |
| Entorno de entrenamiento | Simulación (`sock-heist-composite-v9`, basado en `sock-heist-6m-v5`) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de encoder de observaciones ni función de activación). Lo que sí se documenta es el contrato de interfaz: 61 dimensiones de observación de entrada, 14 acciones de salida y una frecuencia de control de 50 Hz, con el normalizador de observaciones integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones sin normalizar. El artefacto se exporta a ONNX y se acompaña de un `manifest.json` que sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. La model card indica que el comportamiento proviene mayoritariamente de currículos ajenos: las semillas 1, 2, 3 y 5 reproducen el entorno `sock-heist-composite-v9` de rumezhak, construido sobre `sock-heist-6m-v5` de lphatnguyen, mientras que en la semilla 4 los últimos doce pasos son búsqueda propia de GinDuck. La red que genera la tabla de resultados es `sock-heist continue-2` del propio GinDuck. No se especifican número de tokens equivalentes, pasos de entorno, composición del dataset, ni si hubo fases de RLHF/DPO (no aplicables en este dominio). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no tienen sentido en una política de control motor.

## Capacidades

- Generación de marcha continua (política perpetua) para el robot cuadrúpedo microduck a 50 Hz.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control motor.
- Normalización de observaciones integrada en el propio ONNX, lo que simplifica la integración en el daemon.
- Carga directa en una ranura de política del robot mediante `robotctl policy load <slot> GinDuck/microduck-gin-sock-finish`.
- Compatibilidad con el manifiesto de políticas esquema 2 del daemon de microduck.
- Reproducción de currículos de entrenamiento de terceros (rumezhak y lphatnguyen) en cuatro de las cinco semillas documentadas.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües: es una política de control motor, no un modelo de propósito general.

## Casos de uso

- Despliegue de una marcha base en un microduck físico: cargar la política en una ranura con `robotctl policy load` y dejar que el robot camine de forma continua a 50 Hz mientras se monitorizan los sensores. Adecuado porque el artefacto ya está empaquetado en el formato operativo del daemon y el normalizador va embebido.
- Reproducción de experimentos de RL: usar las semillas 1, 2, 3 y 5 para replicar el entorno `sock-heist-composite-v9` de rumezhak y verificar que la política se comporta de forma consistente con la model card.
- Punto de partida para fine-tuning: emplear la política como inicialización en el repositorio `microduck_rl` (rama `talent-3`) y continuar el entrenamiento con recompensas propias, aprovechando que el autor ya documenta un caso de continuación (`sock-heist continue-2`).
- Evaluación comparativa de currículos: contrastar el comportamiento de esta política con el de `sock-heist-6m-v5` de lphatnguyen para medir el impacto del composite v9 en la estabilidad de la marcha.
- Docencia y demostraciones de RL aplicado a robótica: el tamaño reducido del repositorio (0,0 GB según Hugging Face) y el formato ONNX facilitan su uso en talleres donde se explique el ciclo observación-acción de un cuadrúpedo de bajo coste.
- Integración en pipelines de simulación: cargar el ONNX en un simulador compatible con el contrato de 61 observaciones y 14 acciones para generar datos de locomoción o validar controladores antes de pasar al hardware.
- Pruebas de regresión del daemon: usar la política como caso de prueba del cargador de manifiestos esquema 2 y del comando `robotctl policy load` en entornos de integración continua.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, distancia recorrida, estabilidad ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que sugiere un modelo muy pequeño, pero no se publica el número de parámetros ni el tamaño exacto del ONNX.
- GPU recomendadas: no disponible. Dado el reducido tamaño aparente, la inferencia en CPU debería ser viable a 50 Hz, pero no se documenta.
- ¿Cabe en GPU de consumo? No disponible con confirmación del autor; por el tamaño del repositorio es altamente probable, pero no se puede afirmar sin datos.
- Opciones de despliegue: el daemon de microduck con `robotctl policy load` (vía ONNX Runtime u otro runtime compatible con ONNX, no especificado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponible. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Entorno de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GinDuck/microduck-gin-sock-finish | Política RL perpetua (ONNX) | 61 obs. / 14 acciones | 50 Hz | `sock-heist-composite-v9` (semillas 1,2,3,5) + búsqueda propia (semilla 4) | no disponible | Hugging Face, 0 descargas, 0 likes |
| sock-heist-6m-v5 (lphatnguyen) | Política RL base | no disponible | no disponible | `sock-heist-6m-v5` | no disponible | Referenciada en la model card; disponibilidad no verificada |
| sock-heist continue-2 (GinDuck) | Política RL (red subyacente) | no disponible | no disponible | Continuación sobre `sock-heist` | no disponible | Referenciada en la model card; disponibilidad no verificada |

No se dispone de datos de rendimiento, parámetros ni licencia de las alternativas, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- Entrenada exclusivamente en simulación: la model card indica "Simulation only", por lo que no hay evidencia publicada de transferencia zero-shot al robot físico ni de robustez ante perturbaciones reales.
- Procedencia mixta del comportamiento: cuatro de las cinco semillas reproducen currículos de terceros (rumezhak y lphatnguyen), lo que plantea dudas sobre la originalidad y sobre los derechos de uso derivados de esos entornos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse riesgo legal en producción.
- Idiomas no aplicables, pero tampoco se documenta el conjunto de condiciones de entrenamiento (terrenos, velocidades, perturbaciones), lo que impide anticipar su dominio de validez.
- Sin métricas de rendimiento publicadas: no hay recompensa media, tasa de caídas ni comparación con baselines, de modo que la calidad de la marcha no está cuantificada.
- Riesgo de sobreajuste al entorno `sock-heist-composite-v9`: al reproducir un currículo concreto, el comportamiento puede degradarse fuera de esas condiciones.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- Dependencia del daemon y del esquema 2 del manifiesto: cambios en el contrato de políticas del daemon pueden romper la compatibilidad.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de MMLU, HumanEval o GSM8K, ni usarse para tareas de texto, código o razonamiento simbólico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-gin-sock-finish
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Entorno base de rumezhak: `sock-heist-composite-v9` (referenciado, sin URL en la información disponible)
- Entorno base de lphatnguyen: `sock-heist-6m-v5` (referenciado, sin URL en la información disponible)
- Red subyacente de GinDuck: `sock-heist continue-2` (referenciada, sin URL en la información disponible)
