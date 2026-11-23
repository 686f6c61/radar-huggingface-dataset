# lucazanett/pi05_wiping_bs_high_nf_c25_25hz

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence y adaptado a la librería LeRobot por el usuario lucazanett. Este checkpoint concreto, `pi05_wiping_bs_high_nf_c25_25hz`, es una política entrenada para una tarea específica de robótica (limpieza o wiping) sobre un dataset propio del autor, con configuración de alta frecuencia (25 Hz) y sin señal de fuerza. El modelo no es un LLM de propósito general, sino una política de control robótico que mapea observaciones visuales y lingüísticas a acciones motoras.

El modelo resuelve el problema de la generalización en entornos abiertos: a diferencia de políticas entrenadas para un entorno controlado, π₀.₅ está diseñado para transferir a situaciones y entornos no vistos durante el entrenamiento. La implementación disponible en este repositorio es la adaptación de LeRobot del repositorio OpenPI de Physical Intelligence, y el checkpoint ha sido entrenado y subido con las herramientas de LeRobot.

Con 4.143.404.816 parámetros (aproximadamente 4,1 mil millones) y un tamaño de repositorio de 9,4 GB en formato safetensors, se trata de un modelo de gran tamaño para el ámbito de las políticas robóticas, lo que refleja su naturaleza VLA con un backbone de lenguaje y visión considerable. La licencia es Apache 2.0, lo que permite uso comercial, y la fecha de creación del repositorio es el 23 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), implementación LeRobot de OpenPI (π₀.₅) |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un modelo de visión-lenguaje-acción que combina un backbone de visión y lenguaje con un cabezal de acciones para control robótico. La implementación concreta es la adaptación de LeRobot del repositorio OpenPI, lo que implica que el modelo consume observaciones visuales (imágenes de cámaras del robot) y posiblemente instrucciones en lenguaje natural, y produce comandos de acción de bajo nivel. El checkpoint está entrenado sobre el dataset `lucazanett/new_setup_baseline_high_no_force_25hz`, que por su nombre sugiere una configuración de alta frecuencia (25 Hz) sin señal de fuerza, probablemente para una tarea de limpieza (wiping).

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card no incluye detalles sobre innovaciones técnicas específicas como decodificación especulativa o atención lineal. El entrenamiento se realizó con la herramienta `lerobot-train`, según el flujo documentado en la model card, y el modelo se distribuye como un checkpoint de política listo para evaluación con `lerobot-record`.

## Capacidades

- Control robótico de tareas de manipulación: el modelo genera acciones motoras a partir de observaciones visuales, orientado a tareas como limpieza o wiping.
- Generalización a entornos abiertos: según la documentación de π₀.₅, está diseñado para transferir a situaciones no vistas durante el entrenamiento.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación e inferencia mediante las herramientas `lerobot-train` y `lerobot-record`.
- Soporte de políticas de alta frecuencia: el checkpoint está configurado para 25 Hz, adecuado para control en tiempo real.
- Entrada multimodal: al ser un modelo VLA, procesa observaciones visuales y posiblemente instrucciones lingüísticas, aunque no se detalla la interfaz exacta.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües o modos especiales como thinking mode, visión o audio más allá de la propia naturaleza VLA.

## Casos de uso

- Automatización de tareas de limpieza en robótica: el checkpoint está entrenado específicamente para wiping, por lo que puede desplegarse en brazos robóticos equipados con efectores de limpieza para tareas de fregado o desinfección en entornos controlados.
- Investigación en generalización de políticas VLA: sirve como punto de partida para estudiar la transferencia de π₀.₅ a nuevos entornos y configuraciones de robot, gracias a su licencia Apache 2.0 y su integración con LeRobot.
- Evaluación comparativa de políticas robóticas: al estar disponible en el Hub con un dataset asociado, permite reproducir experimentos y comparar el rendimiento de π₀.₅ frente a otras políticas como ACT o Diffusion Policy en tareas de manipulación.
- Prototipado rápido en laboratorio: con `lerobot-record` y un robot SO-100 follower, se puede ejecutar inferencia en 10 episodios para validar la política antes de un despliegue mayor.
- Desarrollo de pipelines de control a 25 Hz: adecuado para aplicaciones que requieren bucles de control rápidos, como tareas de wiping que necesitan corrección continua de trayectoria.
- Formación y docencia en robótica: el modelo y su dataset asociado pueden utilizarse como ejemplo práctico en cursos sobre aprendizaje por imitación y modelos VLA, dado que la licencia permite uso educativo y comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros en precisión completa (FP32), se requieren aproximadamente 16,6 GB solo para los pesos; en FP16/BF16, unos 8,3 GB; en cuantización de 8 bits, alrededor de 4,1 GB. No se dispone de datos oficiales de cuantización para este checkpoint.
- GPU recomendadas: para inferencia en FP16 se recomienda una GPU con al menos 12-16 GB de VRAM, como RTX 4080, RTX 4090, A100 o H100. Para entrenamiento o evaluación con lotes grandes, se recomienda A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí es posible en GPUs de consumo con 16 GB o más (RTX 4080, RTX 4090) en FP16, y potencialmente en GPUs de 8-12 GB si se aplica cuantización, aunque no se documentan formatos cuantizados para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-record`), con soporte para el robot SO-100 follower según la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLMs y no a políticas robóticas.
- Latencia y throughput estimados: no disponibles. La frecuencia de control de 25 Hz sugiere que el modelo debe inferir en menos de 40 ms por paso, pero no se confirma que se alcance en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ (este checkpoint) | 4,14 B | no disponible | VLA para robótica | Apache 2.0 | Hugging Face (LeRobot) |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA para robótica | no disponible | OpenPI |
| ACT (LeRobot) | no disponible | no disponible | Política de imitación | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | no disponible | Política de imitación | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad cuando estos datos están accesibles.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo entrenado sobre un dataset propio y limitado (`new_setup_baseline_high_no_force_25hz`), su comportamiento estará sesgado hacia las condiciones de ese dataset (entorno, robot, tarea de wiping).
- Riesgo de alucinación: en el contexto de políticas robóticas, el equivalente es la generación de acciones incorrectas o inseguras en situaciones fuera de distribución; no se han publicado evaluaciones de robustez.
- Limitaciones de contexto o idioma: no se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados; la model card no los especifica.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte; además, el uso en robótica real conlleva riesgos físicos que deben evaluarse independientemente.
- Caveats para producción: el checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad; no se han publicado métricas de éxito en la tarea, y la configuración de entrenamiento (sin señal de fuerza, 25 Hz) puede no ser adecuada para todas las aplicaciones. Se recomienda validar exhaustivamente en el entorno objetivo antes de cualquier despliegue.

## Enlaces

- [Hugging Face: lucazanett/pi05_wiping_bs_high_nf_c25_25hz](https://huggingface.co/lucazanett/pi05_wiping_bs_high_nf_c25_25hz)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio OpenPI](https://github.com/Physical-Intelligence/openpi)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Dataset asociado: lucazanett/new_setup_baseline_high_no_force_25hz](https://huggingface.co/datasets/lucazanett/new_setup_baseline_high_no_force_25hz)
