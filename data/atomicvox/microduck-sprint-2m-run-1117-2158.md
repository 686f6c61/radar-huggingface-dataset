# atomicvox/microduck-sprint-2m-run-1117-2158

## Resumen

`atomicvox/microduck-sprint-2m-run-1117-2158` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es un controlador neuronal que recibe observaciones de 61 dimensiones del estado del robot y emite 14 acciones de control a 50 Hz, empaquetado como un grafo ONNX listo para ejecutarse en el propio robot.

El modelo ha sido entrenado con el framework `mjlab` (versión 0.1.0) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, que corresponde a una marcha de tipo *sprint* orientada a cubrir 2 metros. La política es de naturaleza perpetua: una vez cargada en una ranura (*slot*) del daemon de control del robot, se ejecuta de forma continua hasta que se detiene explícitamente. El entrenamiento se realizó con 4096 entornos paralelos, 2000 iteraciones máximas y semilla 1, partiendo del checkpoint 1500.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero *likes* en Hugging Face, publicado por un autor individual (`atomicvox`) y con un tamaño de repositorio de 0.0 GB (probablemente por redondeo de un fichero ONNX de pocos megabytes). No hay información pública sobre licencia, idiomas ni benchmarks, por lo que muchas de las secciones siguientes quedan marcadas como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal para robótica (red de política de RL, topología no especificada en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (pesos exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (control motriz, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas microduck |

## Arquitectura y entrenamiento

La model card no detalla la topología de la red (número de capas, unidades ocultas, tipo de activación). Lo que sí se especifica es la interfaz: 61 dimensiones de observación como entrada y 14 dimensiones de acción como salida, con una frecuencia de control de 50 Hz. La normalización de observaciones está integrada dentro del propio grafo `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El artefacto se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de políticas del daemon microduck.

El entrenamiento se realizó con `mjlab-microduck 0.1.0` (commit `1efd853be`) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos paralelos, hasta 2000 iteraciones del agente, semilla 1 y checkpoint final 1500. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock`, semilla y configuración produce una política comparable, pero no idéntica. El repositorio de entrenamiento es `git@github.com:atomicvox/microduck-challenges.git`, rama `main`, commit `34b78a8c9`.

## Capacidades

- Generación de una marcha de tipo *sprint* para el robot microduck, con el objetivo de cubrir 2 metros.
- Control continuo a 50 Hz con 14 acciones de salida (articulaciones del robot).
- Política perpetua: se ejecuta indefinidamente hasta que se detiene o se sustituye.
- Integración con el daemon de control del robot mediante `robotctl policy load <slot>`.
- Normalización de observaciones integrada en el grafo ONNX (entrada en crudo).
- Compatibilidad con el esquema 2 de manifiesto de políticas microduck.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües: es un controlador motriz, no un modelo fundacional.

## Casos de uso

- **Marcha autónoma en el robot microduck**: cargar la política en una ranura del daemon (`sudo robotctl policy load <slot> atomicvox/microduck-sprint-2m-run-1117-2158`) para que el robot ejecute una marcha de sprint de forma continua. Es adecuado porque el artefacto está empaquetado exactamente para ese flujo de despliegue.
- **Investigación en aprendizaje por refuerzo para robótica**: usar la política como referencia o *baseline* para comparar con otras políticas entrenadas sobre la misma tarea `Mjlab-Sprint2m-MicroDuck`, ya que el manifiesto y el repositorio de entrenamiento están publicados.
- **Reproducción de experimentos de RL**: clonar `microduck-challenges` en el commit `34b78a8c9`, sincronizar con `uv sync` y relanzar el entrenamiento con la misma semilla para obtener una política comparable (no idéntica) y estudiar la varianza entre ejecuciones.
- **Evaluación de robustez de políticas perpetuas**: someter la política a condiciones de terreno o carga distintas de las del entrenamiento para medir su degradación, dado que el autor no documenta el dominio de aleatorización.
- **Docencia y divulgación en robótica de código abierto**: emplear el par microduck + esta política como ejemplo completo de pipeline RL → ONNX → despliegue en robot real, con instrucciones reproducibles.
- **Integración en pipelines de CI para robótica**: validar que `policy.onnx` y `manifest.json` cumplen el esquema 2 del manifiesto antes de desplegar en flota, usando la política como caso de prueba del daemon `robotctl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, distancia alcanzada, velocidad, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- **Inferencia en robot**: el modelo se ejecuta en el propio microduck a 50 Hz; el tamaño del repositorio (0.0 GB redondeado) sugiere un grafo ONNX de pocos megabytes, apto para la computación embebida del robot.
- **VRAM estimada para inferencia**: no disponible; por el tamaño del artefacto, previsiblemente inferior a 1 GB.
- **GPU recomendadas para inferencia**: no aplica en despliegue (el robot ejecuta ONNX en su propio hardware); para entrenamiento, el autor usa 4096 entornos paralelos, lo que requiere una GPU de datacenter (A100, H100 o similar), aunque no se especifica el modelo exacto.
- **¿Cabe en GPU de consumo?**: el entrenamiento con 4096 entornos paralelos difícilmente cabe en una GPU de consumo; la inferencia del grafo ONNX sí es viable en hardware embebido o en cualquier GPU de consumo.
- **Opciones de despliegue**: `robotctl policy load` sobre el daemon microduck; el formato ONNX permite además ejecución con ONNX Runtime en otros entornos.
- **Latencia y throughput**: 50 Hz de frecuencia de control (20 ms por paso); no se documentan latencias adicionales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck ni referencias a modelos comparables de la misma tarea o tamaño.

## Limitaciones y advertencias

- **Licencia no disponible**: no se puede confirmar si el uso comercial está permitido; hay que contactar con el autor antes de cualquier despliegue en producción.
- **Sin métricas de rendimiento**: no hay datos de recompensa, distancia alcanzada ni estabilidad, por lo que no se puede evaluar la calidad de la marcha sin probarla en el robot.
- **Entrenamiento no bit-reproducible**: el autor advierte que repetir el entrenamiento produce una política comparable pero no idéntica; no es posible garantizar pesos idénticos entre máquinas.
- **Dominio de entrenamiento no documentado**: se desconoce el alcance de la aleatorización (terrenos, cargas, perturbaciones), lo que limita la confianza en la generalización fuera del entorno de entrenamiento.
- **Artefacto sin tracción**: cero descargas y cero *likes* en Hugging Face; sin validación comunitaria ni informes de terceros.
- **Sin soporte de texto ni idiomas**: no es un modelo de lenguaje; cualquier caso de uso lingüístico queda fuera de su alcance.
- **Dependencia del daemon microduck**: el despliegue requiere el ecosistema `robotctl` y el esquema 2 del manifiesto de políticas; no es un artefacto genérico.
- **Riesgo de alucinación**: no aplica (no genera texto); el riesgo equivalente es la ejecución de una marcha inestable o inadecuada para el terreno real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-sprint-2m-run-1117-2158
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento del autor: `git@github.com:atomicvox/microduck-challenges.git` (commit `34b78a8c9`, rama `main`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck (ruta citada en la model card; URL completa no disponible)
