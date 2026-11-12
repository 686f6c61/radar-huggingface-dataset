# dashi/microduck-roller-daily-20261111

## Resumen

`dashi/microduck-roller-daily-20261111` es una política de control robótico de tipo reinforcement learning publicada en Hugging Face por el usuario dashi. No es un modelo de lenguaje: es una política entrenada para el robot cuadrúpedo open source microduck de Pollen Robotics, que opera sobre ruedas ("on rollers") y se integra en el slot de marcha `walk` del daemon de control del robot. El artefacto distribuido es un fichero `policy.onnx` con el normalizador de observaciones embebido, acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

La política es una reentrada diaria ("daily re-entry") del modelo `dashi/microduck-roller-remix-r900`, con una puntuación de 0.900, y constituye un finetune de `DenRakEiw/microduck-senate_duck_0904`. Se describe como una política "perpetua": ejecuta una marcha continua hasta recibir una orden de parada. El espacio de observación es de 61 dimensiones, el de acciones de 14 dimensiones y la frecuencia de control es de 50 Hz.

El interés de esta ficha es acotado: se trata de un artefacto de robótica ligado a un ecosistema muy concreto (microduck), con cero descargas y cero likes en el momento de la consulta, sin model card detallada sobre datos de entrenamiento, licencia ni idiomas. La búsqueda web realizada no aporta información relevante sobre el modelo, ya que los resultados tratan sobre el caldo japonés *dashi* y no guardan relación con el autor ni con el artefacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles de capas no disponibles); exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) con normalizador de observaciones embebido; `manifest.json` con esquema 2 |
| Espacio de observación | 61 dimensiones |
| Espacio de acciones | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Slot del daemon | `walk` |
| Modelo base | `DenRakEiw/microduck-senate_duck_0904` (relación: finetune) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` |
| Tamaño del repositorio | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, tamaño de las mismas). Lo que sí se conoce es la interfaz de la política: recibe observaciones de 61 dimensiones, emite 14 acciones y opera a 50 Hz sobre el robot microduck equipado con ruedas. El modelo se distribuye en formato ONNX con el normalizador de observaciones integrado, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`, mediante reinforcement learning. El modelo es un finetune de `DenRakEiw/microduck-senate_duck_0904` y se describe como una reentrada diaria del modelo `dashi/microduck-roller-remix-r900` (puntuación 0.900). No se documentan el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL empleado, ni si hubo fases de ajuste adicionales. La política se caracteriza como "perpetua": una vez cargada, genera la marcha de forma continua hasta que se le indique lo contrario.

## Capacidades

- Control locomotor continuo del robot microduck sobre ruedas: genera una marcha perpetua en el slot `walk` a 50 Hz.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control.
- Normalización de observaciones integrada en el propio fichero ONNX, lo que simplifica la integración en el daemon.
- Carga directa mediante el comando `robotctl policy load walk dashi/microduck-roller-daily-20261111`.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que permite su descubrimiento y gestión por parte del daemon.
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso; es exclusivamente una política de control motor.

## Casos de uso

- Marcha continua en laboratorio: cargar la política en el slot `walk` para que el microduck se desplace de forma sostenida sobre ruedas mientras se registran datos de sensores o se prueba el hardware.
- Base para experimentos de RL: al ser un finetune documentado con repositorio, rama y commit de entrenamiento, sirve como punto de partida reproducible para comparar variantes de política en el mismo entorno.
- Evaluación de pipelines de despliegue: permite validar el flujo `robotctl policy load` y el manifiesto de políticas (esquema 2) en un robot real antes de integrar políticas propias.
- Demostraciones educativas: el microduck es un robot open source de bajo coste; esta política permite mostrar locomoción aprendida por RL en talleres y cursos sin entrenar desde cero.
- Pruebas de robustez de la marcha: al ser una política perpetua, facilita someter al robot a perturbaciones externas y observar la respuesta del controlador a 50 Hz.
- Referencia para remezclas: dado que el autor la describe como reentrada diaria de una política previa, sirve como ejemplo de flujo de iteración y publicación de políticas en el ecosistema microduck.
- Integración en el daemon: el formato ONNX con normalizador embebido reduce el trabajo de integración para desarrolladores que quieran conectar sus propias observaciones al controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico aportado es la puntuación de 0.900 asociada al modelo previo `dashi/microduck-roller-remix-r900`, del cual esta política es una reentrada diaria, pero no se especifica la métrica ni el protocolo de evaluación empleados para obtenerla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se documenta el número de parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. Al ser una política de control a 50 Hz ejecutada sobre un robot de bajo coste, es plausible que la inferencia se realice en CPU, pero esto no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el método documentado es `robotctl policy load walk dashi/microduck-roller-daily-20261111` sobre el daemon de microduck, con el runtime ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: se conoce la frecuencia de control de 50 Hz (periodo de 20 ms por ciclo), pero no se publican mediciones de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Slot | Observación / acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261111` | Política RL (ONNX) | `DenRakEiw/microduck-senate_duck_0904` | `walk` | 61 / 14, 50 Hz | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Política RL | no disponible | no disponible | no disponible | no disponible | Referenciado como origen de la reentrada |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de rendimiento comparables entre estas políticas ni de alternativas fuera del ecosistema microduck con especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- No se especifica licencia; no puede asumirse uso comercial sin consultar al autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- La model card no documenta el número de parámetros, la arquitectura interna, el dataset de entrenamiento ni el protocolo de evaluación de la puntuación 0.900.
- La política está diseñada específicamente para el microduck sobre ruedas; no es transferible a otras plataformas ni a configuraciones con patas sin reentrenamiento.
- El comportamiento es "perpetuo": requiere una orden explícita de parada, lo que introduce un riesgo operativo si se pierde la comunicación con el daemon.
- No hay información sobre sesgos, alucinación ni comportamiento en condiciones fuera de distribución; en robótica, estos riesgos se traducen en movimientos imprevistos y deben mitigarse con límites de seguridad en el daemon.
- Los resultados de la búsqueda web no contienen información sobre el modelo (los enlaces tratan sobre el caldo japonés dashi) y no deben considerarse fuentes válidas.
- El repositorio figura con tamaño 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que el tamaño se redondea; conviene verificar la descarga antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261111
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se proporciona URL directa
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se proporciona URL directa
