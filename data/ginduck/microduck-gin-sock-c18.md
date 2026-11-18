# GinDuck/microduck-gin-sock-c18

## Resumen

`GinDuck/microduck-gin-sock-c18` es una política de control motriz (locomoción) para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, publicada en Hugging Face bajo la librería `microduck` y el pipeline `robotics`. No es un modelo de lenguaje: se trata de un artefacto de aprendizaje por refuerzo exportado a ONNX que define una marcha (gait) perpetua, es decir, una política que se ejecuta de forma continua hasta que el operador la detiene.

El modelo recibe observaciones de 61 dimensiones a 50 Hz y emite 14 acciones de control articular. Según la model card, la entrada es un compuesto de semillas de otros autores: las semillas 2, 3, 4 y 5 reproducen sin cambios la política `quicksilver-sock-heist-nov18-v5` de HlibPlakhtii (run `01M7NV7ASVGPZH7AP0YKBT`), mientras que la semilla 1 reproduce la política `Counter s5 4.790` de jrubiosainz (run `01M7JVJ71N7BABY0M9RMCZ`). El autor declara explícitamente que no hay mejora propia de semillas en esta entrada y que la red de respaldo (fallback) es propia.

La relevancia es acotada pero concreta: se trata de un checkpoint de locomoción reproducible para un robot físico de bajo coste, con métricas de tiempo de recorrido medidas en una réplica x86 local y con instrucciones de despliegue directo mediante `robotctl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere un artefacto muy pequeño (coherente con un ONNX de política de control).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política de control para robótica (detalles de capas no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tipo de política | Perpetua (se ejecuta hasta que se detiene) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, función de activación ni tamaño del modelo). Lo que sí se documenta es el contrato de interfaz: 61 dimensiones de observación de entrada, 14 dimensiones de acción de salida y una frecuencia de control de 50 Hz. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que la política consume observaciones en crudo sin preprocesado externo. El artefacto se distribuye como ONNX más un `manifest.json` que sigue el schema 2 del manifiesto de políticas microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon).

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si hubo fases de RLHF/DPO (no aplicables en este dominio). La model card indica que esta entrada es un compuesto de semillas de otros autores y que no incorpora mejora propia de semillas; la red de respaldo es propia. El rendimiento declarado es de 4.771 s en la réplica x86 local, con un intervalo de [4.640, 5.090, 4.655, 4.680, 4.790].

## Capacidades

- Locomoción cuadrúpeda perpetua: genera una marcha continua hasta que el operador detiene la política.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones articulares.
- Normalización de observaciones integrada en el propio ONNX (acepta observaciones en crudo).
- Carga en un slot de política del robot mediante `robotctl policy load <slot> GinDuck/microduck-gin-sock-c18`.
- Reproducibilidad de políticas de terceros: las semillas 2 a 5 replican la política de HlibPlakhtii y la semilla 1 la de jrubiosainz.
- Red de respaldo (fallback) propia del autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un artefacto de control motriz, no un modelo generativo.

## Casos de uso

- Despliegue de una marcha estable en un microduck físico: cargar la política en un slot mediante `robotctl` y ejecutarla como gait perpetua para pruebas de locomoción en banco.
- Evaluación comparativa de políticas de locomoción: al ser un compuesto de semillas de varios autores, sirve como referencia para medir tiempos de recorrido frente a otras políticas en la misma réplica x86.
- Reproducción de experimentos de terceros: permite recuperar el comportamiento de `quicksilver-sock-heist-nov18-v5` (HlibPlakhtii) y de `Counter s5 4.790` (jrubiosainz) sin reentrenar, usando los identificadores de run documentados.
- Pruebas de integración del daemon y del manifiesto: el `manifest.json` con schema 2 permite validar el pipeline de carga de políticas en el daemon de microduck.
- Base para fine-tuning o composición de nuevas semillas: al estar entrenada con `microduck_rl` (rama `talent-3`, commit `debcfcae0`), puede servir como punto de partida para políticas derivadas.
- Docencia y divulgación en robótica de bajo coste: un artefacto ONNX pequeño con contrato de interfaz claro (61 observaciones, 14 acciones, 50 Hz) es adecuado para demostrar el ciclo completo de entrenamiento y despliegue en un cuadrúpedo de código abierto.

## Benchmarks y rendimiento

La model card solo reporta una métrica de tiempo de recorrido en la réplica x86 local, sin comparación con otros modelos en formato de tabla de benchmarks estándar.

| Metrica | Valor |
|---|---|
| Tiempo en réplica x86 local | 4.771 s |
| Intervalo de medidas | [4.640, 5.090, 4.655, 4.680, 4.790] |
| Mejora propia de semillas | ninguna (declarado por el autor) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño que probablemente cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponibles en la documentación; por el tamaño del artefacto, no se requiere una GPU de datacenter (A100, H100) para la inferencia.
- Compatibilidad con GPU consumer: probablemente sí en cualquier GPU consumer moderna, aunque no se documenta explícitamente.
- Opciones de despliegue: ejecución en el robot mediante `robotctl policy load <slot> GinDuck/microduck-gin-sock-c18`; el runtime es el daemon de microduck, que consume el ONNX. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: la política opera a 50 Hz (20 ms por paso de control); no se publican cifras de latencia de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-gin-sock-c18 | Política RL (ONNX) para microduck | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face, 0 descargas |
| HlibPlakhtii/quicksilver-sock-heist-nov18-v5 | Política RL para microduck (referenciada) | no disponible | no disponible | no disponible | Referenciada por run `01M7NV7ASVGPZH7AP0YKBT` |
| jrubiosainz/Counter s5 4.790 | Política RL para microduck (referenciada) | no disponible | no disponible | no disponible | Referenciada por run `01M7JVJ71N7BABY0M9RMCZ` |

No se dispone de datos de parámetros, contexto ni rendimiento comparativo de las políticas de referencia más allá de sus identificadores de run y del tiempo de 4.790 s asociado a `Counter s5`.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución del artefacto.
- Artefacto específico de simulación: la model card indica "Simulation only"; el rendimiento se mide en una réplica x86, no en el robot físico.
- Sin mejora propia: el autor declara que esta entrada no aporta mejoras de semillas respecto a las políticas de terceros que compone.
- Dependencia de créditos de terceros: el comportamiento se basa en políticas de HlibPlakhtii y jrubiosainz, y en las trayectorias de rumezhak y lphatnguyen; cualquier uso debe respetar sus condiciones.
- Sin datos de sesgos, alucinación o multilingüismo: no aplicables a un modelo de control motriz, pero tampoco documentados.
- Especificaciones internas ausentes: no se publican número de parámetros, arquitectura de capas ni variantes cuantizadas, lo que dificulta la reproducibilidad técnica.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta; sin evidencia de validación por la comunidad.
- Repositorio de 0.0 GB: el tamaño reportado no permite estimar con precisión el coste de almacenamiento ni el número de parámetros.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-gin-sock-c18
- Repositorio microduck (GitHub): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Run de HlibPlakhtii: `01M7NV7ASVGPZH7AP0YKBT`
- Run de jrubiosainz: `01M7JVJ71N7BABY0M9RMCZ`
