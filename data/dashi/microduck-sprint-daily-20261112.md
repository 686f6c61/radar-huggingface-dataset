# dashi/microduck-sprint-daily-20261112

## Resumen

Microduck sprint daily 20261112 es una política de control motriz (policy) para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una red neuronal entrenada por refuerzo (reinforcement learning) que genera una marcha o *gait* para la ranura `walk` del robot, con una observación de 61 dimensiones y 14 acciones a 50 Hz. El autor del artefacto es el usuario `dashi`, que lo publica como reentrada diaria de un modelo previo (`dashi/microduck-sprint-remix-r844`, con recompensa 0.844).

El modelo se distribuye en formato ONNX (`policy.onnx`) con el normalizador de observaciones embebido, de modo que el robot puede consumir observaciones en crudo. Se trata de un fine-tune del modelo `jrubiosainz/microduck-game-sprinter-remix3`, y su interés es acotado pero concreto: sirve como política perpetua (se ejecuta hasta que se le indique lo contrario) para el slot de marcha del microduck, y como ejemplo de flujo de entrenamiento RL reproducible dentro del repositorio `pollen-robotics/microduck_rl`.

La relevancia es, por tanto, la de un artefacto de robótica de bajo nivel y nicho, no la de un modelo fundacional. El repositorio ocupa 0.0 GB, no tiene descargas ni likes, y la información pública disponible se limita a la model card y a los metadatos de Hugging Face. No hay datos de benchmarks, licencia ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL; se distribuye como grafo ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (observación de 61 dimensiones por paso, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red. Lo que sí se documenta es la interfaz: 61 dimensiones de observación, 14 acciones y una frecuencia de control de 50 Hz, con el normalizador de observaciones integrado en el propio `policy.onnx`. El modelo se etiqueta como `microduck-slot:walk`, es decir, está especializado en ocupar la ranura de marcha del robot.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Es un fine-tune del modelo `jrubiosainz/microduck-game-sprinter-remix3`, y la model card lo describe como reentrada diaria de `dashi/microduck-sprint-remix-r844` con recompensa 0.844. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si hubo fases de ajuste adicionales más allá del fine-tune.

## Capacidades

- Generación de una marcha perpetua para el slot `walk` del microduck: la política se ejecuta de forma continua hasta que se le indique lo contrario.
- Control motriz a 50 Hz con observaciones en crudo, gracias al normalizador embebido en el ONNX.
- Integración directa con el daemon del robot mediante `robotctl policy load walk <repo>`.
- Compatibilidad con el manifiesto de políticas schema 2 (`docs/policy-manifest.md` del repositorio del daemon).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión ni audio: no es un modelo de lenguaje.

## Casos de uso

- Marcha por defecto del microduck en pruebas de laboratorio: cargar la política en el slot `walk` con `robotctl` y dejar que el robot camine de forma continua mientras se evalúa la estabilidad del gait.
- Reentrada diaria en pipelines de experimentación RL: el artefacto sirve como punto de partida o de comparación frente a `microduck-sprint-remix-r844` y frente al modelo base `microduck-game-sprinter-remix3`.
- Validación de la interfaz de observación/acción: útil para comprobar que un cliente del daemon entrega correctamente las 61 dimensiones de observación y recibe las 14 acciones a 50 Hz.
- Reproducción de experimentos: la model card identifica repositorio, rama y commit de entrenamiento, lo que permite reconstruir el entorno de entrenamiento y repetir el fine-tune.
- Demostraciones docentes de RL aplicado a robótica: el robot microduck es de bajo coste y código abierto, y esta política permite ilustrar el ciclo entrenamiento-despliegue sin infraestructura pesada.
- Base para fine-tunes posteriores: al ser un fine-tune de un remix público, puede servir como inicialización para nuevas variantes de marcha en el mismo slot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la recompensa 0.844 asociada al modelo predecesor `dashi/microduck-sprint-remix-r844`, que no es comparable con métricas estándar de benchmarks de lenguaje o visión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB y no se documenta el número de parámetros.
- GPU recomendadas: no disponibles. Al ejecutarse como política ONNX a 50 Hz sobre un robot microduck, es probable que la inferencia se realice en CPU o en el propio ordenador de control, pero esto no se confirma en la información disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el despliegue documentado es `robotctl policy load walk dashi/microduck-sprint-daily-20261112` sobre el daemon del microduck; el runtime subyacente (ONNX Runtime u otro) no se especifica.
- Latencia y throughput: no disponibles; el único requisito temporal documentado es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261112` | Este modelo | no disponible | no aplica | recompensa del predecesor: 0.844 | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Modelo predecesor del que es reentrada diaria | no disponible | no aplica | 0.844 | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix3` | Modelo base del fine-tune | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una política específica para el slot `walk` del microduck; no es un modelo de propósito general ni un modelo de lenguaje.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal que conviene resolver con el autor antes de cualquier despliegue productivo.
- No hay información sobre sesgos, alucinación o robustez fuera de la distribución de entrenamiento; en robótica, esto se traduce en riesgo de comportamientos no validados ante perturbaciones o terrenos no vistos.
- El rendimiento real depende del hardware del robot, de la calibración de sensores y de la versión del daemon; la model card no documenta resultados de pruebas en robot físico.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: es un artefacto de experimentación, no una versión estable.
- La información pública es mínima: no hay número de parámetros, arquitectura interna, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261112
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`; no se proporciona URL directa)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
