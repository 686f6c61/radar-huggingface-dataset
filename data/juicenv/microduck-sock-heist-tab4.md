# juicenv/microduck-sock-heist-tab4

## Resumen

`juicenv/microduck-sock-heist-tab4` es una política de aprendizaje por refuerzo (RL) para robótica, publicada por el usuario `juicenv` en HuggingFace. No se trata de un modelo de lenguaje, sino de una red neuronal exportada a ONNX que implementa una marcha ("gait") para el robot [microduck](https://github.com/pollen-robotics/microduck), desarrollado por Pollen Robotics. El nombre completo del proyecto hace referencia a "Sock Heist", una tarea de locomoción, y la variante `tab4` combina la red `sock-heist9` con tablas de búsqueda (lookup tables) específicas por semilla, obtenidas mediante una búsqueda CMA-ES continuada sobre cinco ejecuciones de evaluación.

La política se describe como **perpetual**: una vez cargada en un slot del robot, se ejecuta de forma continua a 50 Hz hasta que se indique lo contrario. Trabaja con observaciones de 61 dimensiones y produce 14 acciones, con el normalizador de observaciones integrado directamente en el fichero `policy.onnx`, lo que simplifica el despliegue al permitir alimentar observaciones crudas. Es relevante para la comunidad de robótica open source porque representa un ejemplo de políticas RL compactas y desplegables directamente en hardware mediante el daemon `robotctl`.

Dado que el repositorio pesa 0,0 GB según los metadatos, carece de model card detallada y no registra descargas ni likes, se trata presumiblemente de un artefacto experimental o de nicho. No hay datos públicos sobre arquitectura interna de la red, proceso de entrenamiento completo ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica RL exportada a ONNX (arquitectura interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje); entrada de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) con `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La politica esta disenada para el robot microduck, con un espacio de observacion de 61 dimensiones, un espacio de acciones de 14 dimensiones y un ciclo de control de 50 Hz. El normalizador de observaciones va embebido en el propio fichero ONNX, de modo que el daemon del robot puede alimentar observaciones crudas sin preprocesamiento externo. El fichero `manifest.json` sigue el schema 2 del microduck policy manifest documentado en `docs/policy-manifest.md` del repositorio del daemon.

Sobre el entrenamiento, la model card indica que proviene del repositorio `pollen-robotics/microduck_rl`, rama `HEAD`, commit `5cee942d8`. La variante `tab4` extiende la red `sock-heist9` con tablas de busqueda por semilla para cinco ejecuciones de rating, obtenidas mediante una busqueda CMA-ES continuada (evolucion de estrategias de covarianza adaptativa). No se ha publicado informacion sobre el numero de pasos de entrenamiento, el algoritmo RL concreto (PPO, SAC, etc.), la composicion del dataset de simulacion ni el uso de tecnicas adicionales como curriculum learning o domain randomization.

## Capacidades

- Politica de locomocion (marcha o "gait") perpetua para el robot microduck: se ejecuta de forma continua a 50 Hz hasta recibir una orden de parada.
- Procesamiento de observaciones crudas de 61 dimensiones gracias al normalizador integrado en el ONNX.
- Generacion de acciones de control de 14 dimensiones por paso de simulacion o de hardware.
- Carga directa en el robot mediante `robotctl policy load <slot>`, sin necesidad de pipeline de inferencia adicional.
- Compatibilidad con el ecosistema microduck y su esquema de manifiestos de politicas (schema 2).
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni procesamiento multilingue.

## Casos de uso

- **Despliegue directo de locomocion en microduck**: cargar la politica en un slot del robot con `sudo robotctl policy load <slot> juicenv/microduck-sock-heist-tab4` para que el robot camine de forma perpetua sin logica adicional en el controlador.
- **Investigacion en RL para robótica**: usar la politica como baseline o punto de comparacion para experimentos de marcha, aprovechando que el commit y repositorio de entrenamiento estan referenciados.
- **Benchmarking de politicas de marcha**: las tablas de busqueda por semilla para cinco ejecuciones de rating permiten comparar rendimientos entre variantes (`sock-heist9` frente a `tab4`) en condiciones controladas.
- **Validacion de despliegue ONNX en hardware embebido**: el formato ONNX con normalizador embebido es util para probar cadenas de inferencia optimizadas en robots con recursos limitados.
- **Desarrollo de herramientas sobre el ecosistema microduck**: servir como politica de ejemplo para probar cargadores, gestores de slots y validadores de `manifest.json` (schema 2).
- **Replicacion de experimentos CMA-ES**: estudiar como la busqueda CMA-ES continuada sobre multiples semillas mejora politicas de locomocion respecto a la red base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "cinco ejecuciones de rating" y tablas de busqueda por semilla, pero no incluye metricas concretas de distancia recorrida, velocidad de marcha, estabilidad ni consumo energetico.

## Requisitos de hardware

- **Hardware objetivo**: el robot microduck de Pollen Robotics y su daemon de politicas; el despliegue se realiza en el propio robot mediante `robotctl`.
- **VRAM estimada**: no disponible; al ser una politica ONNX de tamano minimo (el repositorio registra 0,0 GB), los requisitos de memoria son despreciables frente a un LLM.
- **GPU recomendadas**: no aplicable; la inferencia se ejecuta en el controlador del robot, presumiblemente en CPU o acelerador embebido.
- **Consumer GPU**: no aplicable.
- **Opciones de despliegue**: carga nativa mediante `robotctl policy load` del ecosistema microduck; cualquier runtime ONNX (onnxruntime) podria ejecutar `policy.onnx` fuera del robot para analisis o depuracion.
- **Latencia y throughput**: no disponibles; el ciclo de control especificado es de 50 Hz.

## Comparativa con modelos similares

| Aspecto | microduck-sock-heist-tab4 | sock-heist9 (red base) | Alternativas genericas |
|---|---|---|---|
| Tipo | Politica RL ONNX con lookup tables por semilla | Politica RL ONNX | no disponible |
| Observacion / acciones | 61-D / 14 acciones a 50 Hz | 61-D / 14 acciones (presumido) | no disponible |
| Innovacion | Tablas CMA-ES por semilla para cinco runs de rating | Red base sin tablas | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | HuggingFace (juicenv) | no disponible | no disponible |

No hay informacion suficiente para comparar con otras politicas de locomocion publicas de forma rigurosa.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia en el repositorio, no hay base legal clara para reutilizacion, redistribucion o uso comercial; se recomienda contactar con el autor antes de cualquier despliegue.
- **Modelo de nicho sin traccion**: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-10-31); no hay evidencia comunitaria de validacion ni de funcionamiento correcto en hardware.
- **Model card minima**: faltan detalles criticos como algoritmo de entrenamiento, hiperparametros, recompensa, domain randomization y resultados de evaluacion, lo que dificulta reproducir o auditar la politica.
- **Riesgo fisico en hardware**: las politicas de locomocion pueden comportarse de forma inestable fuera de la distribucion de entrenamiento; probar siempre con el robot sujeto o en simulacion antes de ejecucion libre.
- **Sin garantias de seguridad**: no se declara ningun mecanismo de safety layer ni limites de par de motor; la politica es "perpetua" y no se detiene por si sola.
- **Especifico de microduck**: la politica solo es util con el robot microduck (61-D/14 acciones a 50 Hz); no es transferible a otros robots sin adaptacion.
- No aplica riesgo de alucinacion ni sesgo linguistico al no ser un modelo generativo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-sock-heist-tab4
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `HEAD`, commit `5cee942d8`)
- Paper, demo y blog: no disponibles
