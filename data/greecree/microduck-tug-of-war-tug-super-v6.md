# greecree/microduck-tug-of-war-tug-super-v6

## Resumen

`microduck-tug-of-war-tug-super-v6` es una política de control por refuerzo (reinforcement learning) publicada por el usuario `greecree` en HuggingFace. No es un modelo de lenguaje: es un controlador entrenado con PPO para el robot cuadrúpedo microduck de Pollen Robotics, empaquetado en formato ONNX y pensado para cargarse en una ranura de política del demonio `robotctl` del robot. Recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, de forma continua (la model card la describe como política "perpetual", es decir, se ejecuta hasta que se le indique lo contrario).

El modelo resuelve una tarea concreta de locomoción y competición: un tug-of-war (tira y afloja) con múltiples oponentes, con modelado de recompensa específico para marcha atrás ("backward-drive") y para la victoria por caída en foso ("pit-win"). Se entrenó en el entorno `Mjlab-TugOfWar-MicroDuck` sobre la base `mjlab-microduck 0.1.0`, con 4096 entornos paralelos y 1000 iteraciones máximas, semilla 1 y checkpoint 250.

Su relevancia es acotada pero clara para quien investiga RL aplicado a robótica de bajo coste: es un artefacto reproducible (código y comando de entrenamiento publicados) que sirve como referencia de política de competición multioponente para una plataforma pequeña. El repositorio es esencialmente vacío (0,0 GB según HuggingFace), no declara licencia y no ha recibido descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con PPO (reinforcement learning); topología de red no declarada en la model card |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (política reactiva por paso de control a 50 Hz; observación de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX; la normalización de observaciones está integrada en el propio `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-TugOfWar-MicroDuck` |
| Base de simulacion | `mjlab-microduck 0.1.0 @ 981a279c6` |

## Arquitectura y entrenamiento

La model card no detalla la topología de la red neuronal (número de capas, anchura, activaciones ni parámetros). Lo que sí se especifica es el marco de entrenamiento: una política PPO entrenada en un esquema de liga multioponente ("multi-opponent league"), lo que implica que el agente se enfrentó durante el entrenamiento a versiones diversas de rivales para robustecer el comportamiento. El modelado de recompensa incluye dos componentes destacados: `backward-drive` (incentivo a ejecutar marcha atrás) y `pit-win` (recompensa por ganar empujando al oponente a un foso).

Los hiperparámetros documentados son 4096 entornos en paralelo, un máximo de 1000 iteraciones del agente, semilla 1 y checkpoint 250, sobre el commit `4b675ebf4` del repositorio `green-creeper/microduck-challenges` y la base `mjlab-microduck 0.1.0` en el commit `981a279c6`. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: relanzar el mismo comando con la misma semilla produce una política "comparable", no los mismos pesos, algo esperable en RL sobre GPU.

## Capacidades

- Locomoción continua del microduck a 50 Hz: la política se ejecuta de forma indefinida como "gait" cargado en una ranura de política.
- Control reactivo a partir de observaciones crudas de 61 dimensiones; el normalizador está embebido en `policy.onnx`, por lo que no requiere preprocesado externo.
- Comportamiento de tira y afloja (tug-of-war) contra oponentes, incluyendo estrategias de empuje.
- Marcha atrás reforzada mediante modelado de recompensa específico (`backward-drive`).
- Comportamiento de victoria por foso (`pit-win`), orientado a empujar al rival a una zona de caída.
- Robustez multioponente derivada del entrenamiento en liga.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Sin capacidades multilingües, de visión, audio ni "thinking mode".

## Casos de uso

- Competición de tug-of-war robótico: la política se carga en el microduck mediante `robotctl policy load <slot> greecree/microduck-tug-of-war-tug-super-v6` y controla el robot durante el combate; está diseñada específicamente para esta tarea y para durar hasta que se detenga.
- Sustitución de la marcha por defecto del microduck: al ser una política "perpetual" cargable en una ranura, puede usarse como gait alternativa en demostraciones o pruebas de locomoción sobre la plataforma.
- Estudio de modelado de recompensa en RL: el binomio `backward-drive` + `pit-win` sirve como caso de análisis de cómo el shaping de recompensa condiciona comportamientos emergentes (retroceso estratégico, empuje hacia zonas de caída).
- Evaluación de robustez multioponente: útil para comparar políticas entrenadas en liga frente a políticas entrenadas contra un único rival.
- Reproducción y extensión de experimentos: con el repositorio `microduck-challenges` y el comando publicado, un investigador puede reentrenar con la misma configuración (4096 entornos, 1000 iteraciones, semilla 1) y obtener una política comparable.
- Docencia en robótica de bajo coste: permite mostrar el ciclo completo simulación (mjlab) → entrenamiento PPO → exportación ONNX → despliegue en robot con `robotctl`.
- Pruebas de sim-to-real: la política entrenada en simulación puede desplegarse en hardware real para medir la brecha de transferencia en una plataforma pequeña.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de rendimiento (tasa de victoria, recompensa media, distancia recorrida ni curvas de entrenamiento), y no se dispone de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM para inferencia: muy baja; se trata de una política ONNX con 61 entradas y 14 salidas. El repositorio ocupa 0,0 GB según HuggingFace, por lo que el modelo cabe holgadamente en cualquier dispositivo.
- GPU recomendadas: no se requiere GPU para inferencia; puede ejecutarse en CPU. No hay datos publicados sobre la GPU empleada en el entrenamiento.
- Compatibilidad con GPU de consumo: sí, en la práctica cualquier GPU de consumo es sobrada para inferencia; el cuello de botella es el bucle de control a 50 Hz (periodo de 20 ms), no el cómputo del modelo.
- Despliegue: ONNX Runtime para la inferencia del `policy.onnx`, más el demonio `robotctl` del ecosistema microduck para cargar la política en una ranura. El `manifest.json` sigue el esquema 2 del manifiesto de políticas.
- Latencia y throughput: el requisito funcional es sostener 50 Hz (20 ms por paso de control); no se publican cifras de latencia ni throughput medidas.
- Entrenamiento: se realizó con 4096 entornos paralelos y hasta 1000 iteraciones, lo que requiere hardware de GPU, pero no se especifica el modelo concreto.

## Comparativa con modelos similares

No se dispone de datos cuantitativos publicados para establecer una comparativa fiable con otras políticas de la misma categoría (otras políticas de microduck para tug-of-war, políticas de locomoción de cuadrúpedos o controladores PPO equivalentes). Los campos de parámetros, contexto, rendimiento y licencia de las alternativas no están disponibles en la información proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-of-war-tug-super-v6 | no disponible | no aplica | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) |
| Otras políticas de microduck-tug-of-war | no disponible | no aplica | no disponible | no disponible | no disponible |
| Políticas de locomoción de cuadrúpedos (categoría general) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, modificación o redistribución; conviene contactar con el autor antes de integrarla en un producto.
- Sesgos conocidos: no documentados. Al ser una política de RL con shaping de recompensa, puede exhibir comportamientos no deseados derivados del diseño de la recompensa (por ejemplo, priorizar el retroceso o el empuje al foso en contextos donde no procede).
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto), pero sí existe riesgo de comportamientos fuera de distribución ante observaciones distintas de las vistas en entrenamiento.
- Brecha sim-to-real: entrenada en `mjlab-microduck`; el rendimiento en hardware físico puede degradarse respecto a la simulación. No se publican métricas de transferencia.
- Limitación de plataforma: la política está acoplada a la interfaz del microduck (61 observaciones, 14 acciones, 50 Hz) y no es reutilizable en otros robots sin reentrenamiento.
- Repositorio de 0,0 GB: conviene verificar que los artefactos (`policy.onnx`, `manifest.json`) están efectivamente disponibles antes de depender de ellos.
- Reproducibilidad: el propio autor advierte que el reentrenamiento no es bit a bit reproducible; los pesos obtenidos serán comparables pero no idénticos.
- Sin métricas publicadas: no hay datos de tasa de victoria ni de robustez frente a oponentes concretos, lo que dificulta evaluar su calidad relativa en producción o competición.

## Enlaces

- HuggingFace: https://huggingface.co/greecree/microduck-tug-of-war-tug-super-v6
- Repositorio de retos y entrenamiento: https://github.com/green-creeper/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del demonio): no disponible como enlace directo en la información proporcionada
