# dashi/microduck-roller-daily-20261116

## Resumen

`dashi/microduck-roller-daily-20261116` es una política de control robótico entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de inferencia en formato ONNX que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensado para ejecutarse en el propio robot sobre ruedas (rollers). El autor del repositorio es el usuario `dashi` y el modelo deriva por finetune de `DenRakEiw/microduck-senate_duck_0904`.

La relevancia de esta ficha es acotada y conviene ser explícito: el repositorio tiene 0 descargas, 0 likes, un tamaño de 0.0 GB declarado y fue creado el 16 de noviembre de 2026. Se describe como una "re-entrada diaria" (daily re-entry) de la política `dashi/microduck-roller-remix-r900` con una puntuación de 0.900, lo que sugiere un flujo de trabajo de experimentación iterativa más que un artefacto estabilizado para producción. La model card es mínima y no aporta información sobre composición del dataset, hiperparámetros ni métricas de evaluación.

La arquitectura concreta de la red neuronal no se detalla en la información disponible; solo se indica que la normalización de observaciones está embebida en `policy.onnx` y que el manifiesto sigue el esquema 2 del manifiesto de políticas de microduck. No hay datos sobre número de parámetros, longitud de contexto (concepto no aplicable a una política de control) ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; topología de red no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no describe la topología de la red (número de capas, tipo de capas, función de activación ni tamaño de las representaciones internas). Lo que sí se documenta es la interfaz: la política consume observaciones de 61 dimensiones y produce 14 acciones a una frecuencia de control de 50 Hz, y se ejecuta sobre el robot microduck equipado con ruedas (rollers). La normalización de las observaciones está integrada dentro del propio grafo ONNX, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward` y el commit `83599404a`. El modelo es un finetune de `DenRakEiw/microduck-senate_duck_0904` y se presenta como una "re-entrada diaria" de `dashi/microduck-roller-remix-r900` (puntuación 0.900). No se especifican el número de pasos de entrenamiento, la composición del dataset, la función de recompensa ni si se emplearon técnicas de regularización o curricula. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Generación de marcha perpetua para el slot `walk`: la política se describe como "perpetual", es decir, ejecuta la marcha hasta que se le indique lo contrario.
- Control locomotor sobre ruedas (rollers) a 50 Hz con 14 acciones de salida.
- Consumo de observaciones de 61 dimensiones con normalización integrada en el grafo ONNX.
- Integración con el daemon del robot mediante `robotctl policy load walk <repo>`.
- Carga mediante manifiesto conforme al esquema 2 (`docs/policy-manifest.md` del repositorio del daemon).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Locomoción autónoma en el robot microduck: cargar la política en el slot `walk` con `sudo robotctl policy load walk dashi/microduck-roller-daily-20261116` permite al robot desplazarse de forma continua sobre ruedas sin intervención externa, adecuado para demostraciones y pruebas de marcha.
- Experimentación en aprendizaje por refuerzo: al ser un finetune de una política previa y una "re-entrada diaria", sirve como punto de partida para comparar variantes de entrenamiento en la rama `roll-backward` del repositorio `microduck_rl`.
- Validación de pipelines de despliegue ONNX: el hecho de que la normalización esté embebida en `policy.onnx` lo convierte en un caso de prueba útil para verificar que un runtime de inferencia ONNX a bordo del robot produce acciones coherentes con observaciones en crudo.
- Reproducción de experimentos de RL en robótica de bajo coste: investigadores que trabajen con la plataforma microduck pueden usar esta política como referencia de una marcha sobre ruedas entrenada con el stack oficial de Pollen Robotics.
- Pruebas de integración del daemon `robotctl`: el manifiesto conforme al esquema 2 permite validar el cargador de políticas y el enrutado al slot `walk` en entornos de desarrollo.
- Docencia y talleres de robótica: al ejecutarse sobre un cuadrúpedo de bajo coste y requerir solo un comando de carga, es apto para sesiones prácticas sobre políticas de RL en robots reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica mencionada es la puntuación 0.900 asociada a la política de origen `dashi/microduck-roller-remix-r900`, pero no se especifica qué métrica es, cómo se calcula ni en qué entorno se evaluó, por lo que no se puede presentar como resultado comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio se declara como 0.0 GB, lo que sugiere un artefacto muy pequeño, pero no se ofrece el tamaño real de `policy.onnx` ni el número de parámetros.
- GPU recomendadas: no disponible. Al ejecutarse a bordo del robot microduck, es probable que la inferencia se realice en la CPU del propio robot, pero esto no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el método documentado es `robotctl policy load walk dashi/microduck-roller-daily-20261116` sobre el daemon de microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. Solo se conoce la frecuencia de control objetivo de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261116` | Política RL (ONNX) para microduck sobre ruedas | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas, 0 likes) |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL (modelo base del finetune) | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Política RL (origen de la re-entrada diaria) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento, parámetros ni contexto para establecer una comparación cuantitativa con alternativas fuera del ecosistema microduck.

## Limitaciones y advertencias

- Artefacto sin tracción: 0 descargas y 0 likes en el momento de la ficha, creado y actualizado el mismo día (16 de noviembre de 2026), lo que indica que no ha sido validado por la comunidad.
- Sin licencia declarada: no se puede asumir permiso para uso comercial, redistribución ni modificación. Es imprescindible contactar con el autor antes de cualquier uso fuera de experimentación personal.
- Model card mínima: no se documentan dataset, recompensa, hiperparámetros, métricas de evaluación ni limitaciones conocidas de la política.
- Naturaleza "perpetua": la política se describe como ejecutable "hasta que se le indique lo contrario", lo que exige mecanismos externos de parada segura en cualquier despliegue real.
- Específica de plataforma: solo es válida para el robot microduck sobre ruedas con la interfaz de observación de 61 dimensiones y 14 acciones; no es transferible a otros robots sin reentrenamiento.
- Sin datos de robustez: no se informa sobre comportamiento ante terrenos irregulares, perturbaciones, fallos de sensores ni distribución de observaciones fuera del entrenamiento.
- Sesgos y alucinación: conceptos no aplicables a una política de control, pero sí existe el riesgo equivalente de acciones fuera de distribución que pueden provocar comportamientos inseguros del robot.
- No apta para tareas de lenguaje, visión, código ni agentes: su ámbito es exclusivamente locomotor.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261116
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
