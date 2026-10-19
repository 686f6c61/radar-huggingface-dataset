# lucazanett/pi05-wiping_adaptive

## Resumen

`lucazanett/pi05-wiping_adaptive` es un checkpoint de política robótica publicado en HuggingFace Hub por el usuario lucazanett, consistente en una implementación LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence. Se trata de un modelo Vision-Language-Action (VLA) diseñado para generalización en entornos abiertos, es decir, para ejecutar tareas de manipulación en situaciones y localizaciones no vistas durante el entrenamiento. El checkpoint está especializado en una tarea concreta de frotado/limpieza («wiping»), según el dataset asociado `lucazanett/wiping_adaptive`.

El modelo cuenta con 4.143.404.816 parámetros en formato safetensors y un repositorio de 9,4 GB. La implementación procede del repositorio OpenPI de Physical Intelligence, adaptada a la librería LeRobot de HuggingFace, lo que permite entrenarlo y evaluarlo con las herramientas estándar de LeRobot (`lerobot-train`, `lerobot-record`) sobre robots de la familia SO-100.

Su relevancia es acotada: se trata de un artefacto de investigación derivado (no del modelo oficial de Physical Intelligence) con cero descargas y cero valoraciones en el momento de la consulta, sin benchmarks publicados y con una model card basada en la plantilla genérica de LeRobot. Es útil como ejemplo de flujo de trabajo VLA con LeRobot y como política de partida para la tarea de limpieza, pero no debe considerarse un modelo validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot del modelo π₀.₅, adaptada de OpenPI. Detalle interno de encoder visual, backbone lingüístico y cabeza de acciones: no disponible |
| Parámetros totales | 4.143.404.816 (4,14 B), dato real de safetensors |
| Parámetros activos | No aplica / no disponible: no se declara arquitectura MoE |
| Longitud de contexto | No disponible (la model card no especifica ventana de contexto ni horizonte de acciones) |
| Tipos de cuantización | No disponible; el repositorio solo contiene safetensors, sin variantes GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (según la model card y los tags del Hub) |
| Formato de pesos | safetensors; repositorio de 9,4 GB; librería `lerobot`; pipeline `robotics` |

## Arquitectura y entrenamiento

La model card describe π₀.₅ como un modelo Vision-Language-Action con generalización en entornos abiertos, presentado por Physical Intelligence como una evolución de π₀ orientada a resolver el salto desde entornos controlados a situaciones nuevas. La implementación incluida en este repositorio es una adaptación de su repositorio de código abierto OpenPI, empaquetada para LeRobot. No se detallan en la información disponible ni la composición del backbone (encoder visual y modelo de lenguaje), ni el mecanismo de generación de acciones, ni el esquema de attention; la model card remite al blog de Physical Intelligence para esos detalles.

El checkpoint está asociado al dataset `lucazanett/wiping_adaptive`, lo que indica un ajuste específico sobre demostraciones de una tarea de frotado/limpieza con comportamiento adaptativo. No se especifican el número de tokens de entrenamiento, el número de episodios, la composición del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por imitación supervisada más allá del pipeline estándar de LeRobot. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, attention linear, acción por flow matching u otras) en la información proporcionada.

Advertencia relevante: los comandos de ejemplo de la model card son genéricos de la plantilla de LeRobot e incluyen `--policy.type=act`, que no corresponde necesariamente a la política π₀.₅ aquí publicada. Deben revisarse antes de reutilizarlos.

## Capacidades

- Control robótico mediante predicción de acciones a partir de observaciones visuales e instrucciones en lenguaje natural (modelo VLA).
- Ejecución de tareas de frotado y limpieza de superficies, según el dataset `wiping_adaptive` con el que se ha entrenado.
- Generalización declarada a entornos y situaciones no vistos en entrenamiento (propiedad atribuida a π₀.₅ por su autor original).
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación e inferencia con `lerobot-record` y robots tipo `so100_follower`.
- Compatibilidad con el formato de datasets y checkpoints de LeRobot, incluyendo registro de episodios y evaluación con `--policy.path`.
- Capacidades de razonamiento multi-paso, tool calling, agentes, matemáticas, código, visión general, audio o modo «thinking»: no disponibles o no documentadas para este checkpoint; se trata de un modelo de acción, no de un asistente conversacional.

## Casos de uso

- Automatización de limpieza con brazo manipulador: el modelo recibe imágenes de la escena e instrucción de tarea y genera acciones de frotado sobre superficies; es adecuado porque el checkpoint se ha entrenado específicamente sobre el dataset `wiping_adaptive`.
- Investigación en generalización de políticas VLA: sirve como punto de partida para comparar el comportamiento de π₀.₅ frente a otras políticas sobre el mismo entorno físico, usando el pipeline de evaluación de LeRobot con 10 episodios por defecto.
- Recolección de datos y ajuste fino por imitación: con `lerobot-train` se puede reentrenar la política sobre un dataset propio y comparar la curva de aprendizaje frente al checkpoint publicado.
- Prototipado en laboratorio con robots de bajo coste: el ejemplo de evaluación de la model card apunta a un `so100_follower`, un brazo de tipo open source, lo que facilita replicar experimentos con hardware asequible.
- Base para políticas multitarea: al ser una implementación de π₀.₅ en LeRobot, puede emplearse como inicialización para tareas de manipulación adicionales, verificando antes la correspondencia real entre arquitectura y `policy.type` configurado.
- Docencia y demostraciones de VLA: el par entrenamiento/inferencia documentado permite mostrar el ciclo completo datos → política → ejecución en un robot en una sesión de laboratorio.
- Validación de pipelines de CI para políticas robóticas: permite automatizar la carga del checkpoint, la ejecución de episodios de evaluación y la comparación de métricas de éxito entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, ni métricas estandarizadas (LIBERO, CALVIN, SimplerEnv u otras), ni comparaciones numéricas con π₀ u otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del número de parámetros, no confirmada por el autor): en torno a 8,3 GB solo para pesos en bf16 y unos 16,6 GB en fp32, a lo que hay que sumar activaciones, buffers del encoder visual y el entorno de control.
- Estimación práctica: 12-16 GB de VRAM en bf16 para inferencia con overhead moderado; 24 GB o más para entrenamiento o ajuste fino.
- GPU recomendadas: A100 y H100 para entrenamiento; RTX 4090 (24 GB) y RTX 3090 (24 GB) como opciones viables de inferencia y ajuste ligero.
- GPU consumer: cabe en tarjetas de 24 GB; en tarjetas de 8-12 GB no hay datos que confirmen su viabilidad sin cuantización, y no se publican pesos cuantizados.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`) sobre PyTorch con CUDA, tal como documenta la model card. No se indica soporte para vLLM, TGI, llama.cpp ni Ollama; estos motores están orientados a modelos de lenguaje y no cubren el bucle de control robótico.
- Latencia y throughput: no disponibles. En un VLA de control, este dato es crítico porque condiciona la frecuencia de control del robot, y el autor no lo publica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lucazanett/pi05-wiping_adaptive` | 4,14 B | no disponible | sin benchmarks publicados | Apache 2.0 | Hub, 0 descargas, 0 likes |
| π₀.₅ (Physical Intelligence, referencia) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | blog y OpenPI; el checkpoint original no se detalla aquí |
| π₀ (predecesor, OpenPI) | no disponible | no disponible | no disponible | no disponible | repositorio OpenPI |
| Política ACT (LeRobot) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | incluida en LeRobot; mencionada en el comando de ejemplo de la propia model card |
| OpenVLA | aproximadamente 7 B (dato público ampliamente citado, no verificado en esta búsqueda) | no disponible | no disponible | no disponible | pesos abiertos |

No se dispone de datos verificados de rendimiento ni de contexto para establecer una comparación cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado sobre un único dataset de tarea (`wiping_adaptive`); es previsible un rendimiento pobre fuera de esa tarea y ese entorno.
- Ausencia total de validación externa: cero descargas y cero likes en el Hub, sin benchmarks ni métricas de tasa de éxito publicadas.
- La model card es una plantilla genérica de LeRobot y contiene instrucciones de entrenamiento con `--policy.type=act`, potencialmente inconsistentes con la política π₀.₅; no debe seguirse sin verificar la configuración.
- Riesgo de fallo por distribución fuera de entrenamiento: en modelos VLA el fallo se manifiesta como acciones físicas incorrectas, no como texto plausible; requiere supervisión humana y paradas de seguridad en el robot.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe; las instrucciones en lenguaje natural distintas del idioma de entrenamiento pueden degradar el rendimiento.
- Licencia del checkpoint Apache 2.0, que permite uso comercial; sin embargo, el modelo subyacente π₀.₅ y el código OpenPI provienen de Physical Intelligence y conviene verificar sus propios términos antes de un despliegue comercial.
- Metadatos inconsistentes: la fecha de creación declarada (2026-10-19) es posterior a la fecha actual, lo que sugiere un error de marcado temporal en el Hub.
- Tamaño del repositorio de 9,4 GB, relevante para almacenamiento, transferencia y versionado en pipelines de CI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucazanett/pi05-wiping_adaptive
- Dataset asociado: https://huggingface.co/datasets/lucazanett/wiping_adaptive
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
