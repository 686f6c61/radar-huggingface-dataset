# DrIanKellar/microduck-sprint-robust8c

## Resumen

microduck-sprint-robust8c es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. La desarrolla el usuario DrIanKellar y se publica en Hugging Face como un artefacto de inferencia en formato ONNX, pensado para cargarse directamente en una ranura de política del daemon `robotctl` del robot. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador de locomoción (un gait o patrón de marcha) que se ejecuta de forma continua a 50 Hz.

La política recibe observaciones de 61 dimensiones y emite 14 acciones, correspondientes a las articulaciones del robot. El autor indica que se trata de una política "perpetua": una vez cargada, se ejecuta de forma indefinida hasta que se le indique lo contrario, lo que la distingue de habilidades puntuales con inicio y fin. El nombre "sprint" sugiere una marcha orientada a velocidad, y el sufijo "robust8c" apunta a un entrenamiento orientado a robustez frente a condiciones de semilla no vistas durante la evaluación.

La relevancia de esta ficha es limitada en el ecosistema general de IA, ya que se trata de un artefacto muy específico de robótica con licencia no declarada, sin idiomas ni benchmarks estándar y con un repositorio de 0.0 GB (probablemente pesos muy pequeños). Su interés reside en el pipeline de despliegue sobre hardware real y en la metodología de ajuste de ganancias por articulación, no en capacidades cognitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con RL (detalles de red no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva por paso; observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye como ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, tipo de capa). Lo que sí se especifica es el contrato de entrada y salida: 61 dimensiones de observación y 14 acciones, ejecutadas a 50 Hz sobre el robot microduck. La normalización de observaciones está integrada dentro del propio `policy.onnx`, de modo que la política consume observaciones en crudo, sin preprocesado externo. El artefacto se acompaña de un `manifest.json` conforme al esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `482295a21`, y el autor advierte que la exportación se hizo desde un checkout con cambios sin confirmar, lo que introduce una caveat de reproducibilidad. La innovación técnica declarada es un ajuste buscado (searched) de ganancia y sesgo de salida por articulación, afinado para mantener los pies del robot sobre semillas que la arena de evaluación nunca puntúa. Según el autor, la puntuación oficial de la arena es de 1,533 s con 5 de 5 semillas, y 20 de 20 semillas terminan la prueba.

## Capacidades

- Locomoción continua tipo sprint sobre el robot microduck, ejecutada de forma perpetua hasta que se detenga externamente.
- Control articular de 14 acciones a partir de 61 observaciones, a 50 Hz.
- Robustez declarada frente a condiciones de semilla no vistas en la evaluación (20 de 20 semillas completan la prueba según el autor).
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el daemon.
- Carga directa en una ranura de política mediante `robotctl policy load`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Despliegue de una marcha rápida en un microduck real: se carga la política en una ranura con `sudo robotctl policy load <slot> DrIanKellar/microduck-sprint-robust8c` y el robot ejecuta el gait de forma continua; es adecuado por su formato ONNX listo para el daemon y su normalización integrada.
- Evaluación comparativa de políticas en la arena de microduck: sirve como referencia de rendimiento (1,533 s según el autor) frente a otras políticas cargadas en la misma ranura, gracias a su manifiesto conforme al esquema 2.
- Pruebas de robustez en hardware: al estar afinada para semillas no puntuadas por la arena, puede emplearse para validar el comportamiento del robot ante condiciones iniciales variadas.
- Demostraciones de locomoción en robótica educativa o de investigación: el formato de política perpetua permite mantener al robot en movimiento durante sesiones largas sin lógica de reinicio.
- Integración en pipelines de simulación-a-realidad: el ONNX puede ejecutarse en el mismo bucle de control que el daemon para comparar la política en simulación y en el robot físico.
- Base para ajuste fino o destilación de nuevas marchas: al estar entrenada en `microduck_rl`, puede servir como punto de partida para experimentos de RL sobre el mismo contrato de observación y acción.

## Benchmarks y rendimiento

| Metrica | Valor (según el autor) |
|---|---|
| Puntuación oficial de la arena | 1,533 s |
| Semillas evaluadas en la arena | 5 de 5 |
| Semillas que completan la prueba | 20 de 20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo que es esperable al tratarse de una política de robótica y no de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que sugiere pesos muy pequeños compatibles con hardware embebido.
- GPU recomendadas: no disponible; el destino natural es la computadora integrada del robot microduck, no una GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto, es plausible que no requiera GPU dedicada, pero no se confirma en la información.
- Opciones de despliegue: daemon `robotctl` de microduck mediante `policy load`; el formato ONNX permite además ejecución con ONNX Runtime en otros entornos.
- Latencia y throughput: el bucle de control opera a 50 Hz según la model card; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables de la misma categoría con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; conviene contactar con el autor antes de cualquier uso en producción.
- Reproducibilidad comprometida: el autor indica que la exportación se hizo desde un checkout con cambios sin confirmar, por lo que el artefacto puede no corresponder exactamente al commit declarado.
- Específica de un robot: solo es aplicable al microduck con su contrato de 61 observaciones y 14 acciones; no es reutilizable en otras plataformas sin reentrenamiento.
- Sin datos de arquitectura ni de parámetros: dificulta auditar el modelo o estimar su coste computacional con precisión.
- Riesgo de fallo fuera de distribución: la robustez declarada se limita a las condiciones de entrenamiento y a las semillas probadas; no hay garantías ante terrenos, cargas o perturbaciones no representadas.
- Sin idiomas ni benchmarks estándar: no procede evaluarla con métricas de modelos de lenguaje.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DrIanKellar/microduck-sprint-robust8c
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `482295a21`)
