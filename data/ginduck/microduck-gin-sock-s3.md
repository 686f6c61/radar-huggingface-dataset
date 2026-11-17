# GinDuck/microduck-gin-sock-s3

## Resumen

`GinDuck/microduck-gin-sock-s3` es una política de control motriz (locomoción tipo "gait") para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. El modelo no es un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensada para cargarse en un slot de política del demonio `robotctl` del robot.

El autor, GinDuck, lo presenta como una política "perpetua": una vez cargada, el robot ejecuta la marcha de forma continua hasta que se le indique lo contrario. El repositorio es de tamaño prácticamente nulo (0.0 GB reportados) y registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una publicación muy reciente o de baja difusión (fechas de creación y actualización del 17 de noviembre de 2026).

La relevancia es acotada y muy específica: se trata de un artefacto de robótica de nicho, ligado al ecosistema microduck, y no de un modelo de propósito general. La model card describe un trabajo de búsqueda sobre una trayectoria concreta (una "búsqueda de cola elitista" sobre las últimas 60 llamadas con caché de prefijo), lo que sitúa el modelo en el terreno de la optimización de políticas de control más que en el del aprendizaje profundo a gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (no se detalla la topología de red en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones, 14 acciones, 50 Hz) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red (número de capas, anchura, tipo de capa). Lo que sí detalla es el proceso de generación: la política parte de una trayectoria base y aplica una **búsqueda de cola elitista sobre las últimas 60 llamadas** ("elitist tail search over the last 60 calls") con **caché de prefijo**, de modo que solo se simula la cola de la trayectoria. El resultado es un ajuste fino de tiempo de cruce continuo que pasa de 4.675 s a 4.670 s en la réplica local x86.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. La model card indica que el método de caché de prefijo y búsqueda de cola sigue lo descrito por HlibPlakhtii y rumezhak en sus respectivas model cards, pero que el código está escrito desde cero. La red de respaldo ("fallback net") es propia del autor. No se especifican número de tokens, composición del dataset ni uso de RLHF/DPO, ya que no aplica a este tipo de artefacto.

## Capacidades

- Locomoción continua tipo "gait" para el robot microduck: la política se ejecuta de forma perpetua hasta que se le indique lo contrario.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control a 50 Hz.
- Normalizador de observaciones integrado en `policy.onnx`: se alimenta con observaciones en bruto, sin preprocesado externo.
- Carga en el robot mediante el comando `sudo robotctl policy load <slot> GinDuck/microduck-gin-sock-s3`.
- Compatibilidad con el esquema 2 del manifiesto de políticas microduck (`manifest.json`).
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: no es un modelo de lenguaje.

## Casos de uso

- **Locomoción de un microduck en laboratorio**: cargar la política en un slot y dejar que el robot camine de forma continua mientras se registran datos de sensores; adecuado por su naturaleza "perpetua" y su frecuencia de control de 50 Hz.
- **Reproducción de experimentos de RL en robótica**: sirve como referencia reproducible de una trayectoria concreta (semillas 1, 2, 4 y 5 replican `microduck-sock-heist-composite-v10` sin cambios), útil para comparar métodos de búsqueda de cola.
- **Validación en réplica x86**: el autor reporta tiempos de ejecución en una réplica local x86 ([4.635, 5.095, 4.670, 4.680, 4.815] s), de modo que puede usarse para pruebas de simulación antes de desplegar en hardware.
- **Punto de partida para ajuste fino**: al ser una política concreta sobre una trayectoria base, sirve como inicialización para búsquedas posteriores sobre las últimas llamadas con caché de prefijo.
- **Docencia en robótica de código abierto**: ejemplo práctico de pipeline completo (entrenamiento en `microduck_rl`, exportación a ONNX, manifiesto y carga vía `robotctl`) para cursos o talleres.
- **Integración en el ecosistema microduck**: cualquier flujo que ya use el demonio `robotctl` y el esquema 2 de manifiestos puede incorporar esta política sin adaptadores adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta el tiempo de ejecución en la réplica local x86: 4.779 s de media con intervalo [4.635, 5.095, 4.670, 4.680, 4.815] s, y una mejora del tiempo de cruce de 4.675 s a 4.670 s en la semilla 3.

## Requisitos de hardware

- **VRAM estimada**: no disponible; el repositorio reporta 0.0 GB, lo que sugiere un artefacto ONNX de muy pequeño tamaño, pero no se confirma.
- **GPU recomendadas**: no disponible; al ser una política de control a 50 Hz, es plausible que funcione en CPU, pero no se especifica.
- **Compatibilidad con GPU de consumo**: no disponible.
- **Opciones de despliegue**: `robotctl` (demonio del microduck) con carga vía `policy load`; el formato ONNX permite inferencia con ONNX Runtime, pero no se documenta explícitamente.
- **Latencia y throughput**: no disponible; solo se conoce la frecuencia de control de 50 Hz y los tiempos de simulación en x86.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GinDuck/microduck-gin-sock-s3` | Política RL (ONNX) | 61-D / 14 | 50 Hz | no disponible | Hugging Face |
| `microduck-sock-heist-composite-v10` (rumezhak) | Política RL | no disponible | no disponible | no disponible | Referenciada en la model card |
| `nov17-v3` (HlibPlakhtii) | Política RL | no disponible | no disponible | no disponible | Referenciada en la model card |
| `counter-s1s5` (jrubiosainz) | Política RL | no disponible | no disponible | no disponible | Referenciada en la model card |

No se dispone de datos de rendimiento comparables entre estas políticas más allá de la mejora reportada por el autor (4.675 s → 4.670 s en la semilla 3).

## Limitaciones y advertencias

- **Solo simulación**: la model card indica explícitamente "Simulation only"; no hay evidencia de validación en hardware físico.
- **Licencia no disponible**: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de usarla en producción.
- **Idiomas no disponibles**: irrelevante para el caso, pero el campo figura como no disponible.
- **Sesgos**: no se documentan sesgos, aunque al ser una política de control entrenada sobre una trayectoria concreta, puede sobreajustarse a las condiciones de simulación de esa trayectoria.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo de texto).
- **Dependencia de la trayectoria base**: las semillas 1, 2, 4 y 5 replican sin cambios el trabajo de rumezhak; solo la semilla 3 es aportación propia, lo que limita la originalidad y la generalización.
- **Caveat de producción**: la política es "perpetua" y se ejecuta hasta que se le indique lo contrario; en un robot real esto exige mecanismos externos de parada segura que no se documentan en la model card.
- **Repositorio vacío o casi vacío**: 0.0 GB reportados y 0 descargas; conviene verificar la integridad de los archivos antes de confiar en el artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-gin-sock-s3
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa)
