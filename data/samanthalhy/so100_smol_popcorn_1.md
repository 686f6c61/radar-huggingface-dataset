# samanthalhy/so100_smol_popcorn_1

## Resumen

`samanthalhy/so100_smol_popcorn_1` es un checkpoint de política robótica de tipo vision-language-action (VLA) publicado en Hugging Face por el usuario `samanthalhy`. Se trata de un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, la implementación compacta de SmolVLA descrita en el paper arXiv:2506.01844, que la propia model card define como un modelo VLA «compacto y eficiente» capaz de alcanzar rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo.

El modelo tiene 450.046.212 parámetros (aproximadamente 450 millones) según el recuento real de los pesos en formato safetensors, y el repositorio ocupa 0,9 GB. Está entrenado y publicado mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica, y se distribuye bajo licencia Apache 2.0. El tag `dataset:samanthalhy/so100_popcorn_1` indica que el ajuste se ha realizado sobre el dataset del mismo autor, y el nombre del modelo junto con los comandos de ejemplo de la model card (`--robot.type=so100_follower`) apuntan a un brazo robótico SO-100 en configuración follower.

Su relevancia es doble: por un lado, demuestra el flujo completo de fine-tuning de un VLA sobre un dataset propio con herramienta abierta; por otro, al ser un modelo de ~450 M de parámetros, es un candidato plausible para inferencia en GPU de gama de consumo, lo que baja la barrera de entrada para investigación en manipulación robótica. No obstante, el repositorio no incluye resultados de evaluación, benchmarks ni documentación de limitaciones, y acumula cero descargas y cero «likes», por lo que carece de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; derivada de `lerobot/smolvla_base`. Detalle interno de capas y backbone: no disponible |
| Parámetros totales | 450.046.212 (≈450 M) |
| Parámetros activos | No aplica / no disponible (no consta que sea una arquitectura MoE) |
| Longitud de contexto | No disponible (modelo robótico; no se documenta ventana de contexto en tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no se documenta soporte idiomático; no es un modelo conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/smolvla_base` |
| Dataset de ajuste | `samanthalhy/so100_popcorn_1` |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 0,9 GB |
| Fecha de creación / actualización | 2026-09-22 / 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo base como un VLA compacto y eficiente que logra rendimiento competitivo con coste computacional reducido y puede desplegarse en hardware de consumo. Sin embargo, no se proporciona en la información disponible ningún detalle sobre el backbone concreto, el número de capas, el mecanismo de atención, el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla si el ajuste congeló partes del modelo base o entrenó la totalidad de los pesos.

El entrenamiento y la publicación se han realizado con LeRobot. La model card incluye el flujo estándar de la librería: `lerobot-train` para entrenar a partir de un dataset y `lerobot-record` para evaluar o ejecutar inferencia sobre un robot, en este caso declarado como `so100_follower`, con `--policy.path` apuntando al checkpoint. El ejemplo de entrenamiento de la propia tarjeta usa `--policy.type=act`, aunque no se especifica qué política se empleó finalmente para generar este checkpoint; dado el nombre y los tags del repositorio (`smolvla`, `base_model:lerobot/smolvla_base`), cabe esperar una política SmolVLA, pero la información aportada no lo confirma de forma explícita.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales e instrucciones, propia de un modelo vision-language-action.
- Ajuste específico sobre el dataset `samanthalhy/so100_popcorn_1`, orientado a una tarea concreta de manipulación (el nombre sugiere una tarea relacionada con palomitas de maíz) sobre un brazo SO-100.
- Integración nativa con el ecosistema LeRobot: entrenamiento, checkpointing y evaluación mediante `lerobot-train` y `lerobot-record`.
- Despliegue declarado en hardware de consumo por parte del modelo base (afirmación de la model card de SmolVLA, sin cifras concretas en este repositorio).
- Soporte de tool calling / function calling: no disponible; no aplica a un modelo de política robótica.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible; no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): la componente de visión es inherente a un VLA, pero no se documentan detalles de resolución, número de cámaras ni modalidades adicionales.

## Casos de uso

- Automatización de una tarea de manipulación concreta en un brazo SO-100: el checkpoint puede ejecutarse con `lerobot-record` sobre un SO-100 follower para reproducir la tarea aprendida en el dataset `so100_popcorn_1`, siempre que el montaje físico coincida con el de la recogida de datos.
- Punto de partida para nuevos ajustes finos: al ser un modelo de ~450 M de parámetros y licencia Apache 2.0, sirve como inicialización para reentrenar con `lerobot-train` sobre otros datasets de manipulación sin partir del modelo base.
- Investigación en aprendizaje por imitación de bajo coste: permite reproducir experimentos de VLA en un único brazo SO-100 y una GPU de consumo, reduciendo el coste de entrada frente a modelos de mayor tamaño.
- Docencia y formación práctica en robótica: el flujo LeRobot documentado en la tarjeta (entrenar, guardar checkpoints en `outputs/train/.../checkpoints/` y evaluar durante `--episodes=10`) es adecuado para prácticas guiadas de recogida de datos y evaluación de políticas.
- Evaluación comparativa de políticas en un mismo banco de pruebas: el checkpoint puede contrastarse con la política ACT citada en los ejemplos de la model card u otras variantes de SmolVLA sobre la misma tarea y robot.
- Demostraciones de laboratorio o ferias técnicas: un modelo de este tamaño puede ejecutarse localmente sobre hardware asequible para mostrar manipulación guiada por visión y lenguaje en tiempo real.
- Generación de datos y bucle de mejora: ejecutar la política con `lerobot-record` usando el prefijo `eval_` en el dataset permite generar episodios de evaluación que alimenten iteraciones posteriores de entrenamiento.
- Prototipado de pipelines de robótica con Hugging Face Hub: el modelo ilustra cómo publicar y consumir políticas del Hub con `--policy.path`, útil como referencia en proyectos de infraestructura de ML para robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de éxito de tarea, tasas de acierto, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas. La afirmación de «rendimiento competitivo con coste computacional reducido» corresponde a la descripción general del modelo base SmolVLA y no viene acompañada de cifras en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB solo para pesos en fp32 y 0,9 GB en bf16/fp16, calculado a partir de los 450.046.212 parámetros (cálculo propio, no dato publicado). Sumando el encoder de visión y las activaciones, una estimación prudente se sitúa en el rango de 2 a 4 GB en precisión reducida, aunque no hay cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente en la práctica; el modelo base se describe como desplegable en hardware de consumo. Modelos como RTX 3060, RTX 4060, RTX 4070, RTX 4090, así como A100 o H100, son compatibles por capacidad, si bien no hay datos de latencia publicados por tarjeta.
- ¿Cabe en GPU de consumo? Sí, según el tamaño del checkpoint (0,9 GB de repositorio) y el recuento de parámetros; se trata de un modelo apto para GPU de gama media, sin que existan mediciones oficiales en este repositorio.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para evaluación/inferencia con `--policy.path`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son runners orientados a políticas robóticas.
- Latencia y throughput estimados: no disponibles. No se publican cifras de frecuencia de control, tokens por segundo ni tiempo por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `samanthalhy/so100_smol_popcorn_1` | 450.046.212 | No disponible | Apache 2.0 | Repositorio público; 0 descargas | Fine-tune de SmolVLA sobre dataset propio; sin benchmarks publicados |
| `lerobot/smolvla_base` | No disponible en la información aportada | No disponible | No disponible en la información aportada | Referenciado como modelo base en los tags | Modelo original del que deriva este checkpoint |
| Otras políticas de LeRobot (por ejemplo ACT, citada en los comandos de ejemplo) | No disponible | No disponible | No disponible | No disponible | No se aportan datos comparativos de rendimiento ni de tamaño |

No se dispone en la información proporcionada de resultados de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría (otros VLA o políticas de aprendizaje por imitación).

## Limitaciones y advertencias

- Especialización extrema: al ser un fine-tune sobre un único dataset, es probable que la política solo funcione en la tarea, el robot, la disposición de cámara y las condiciones de iluminación del dataset `so100_popcorn_1`. No hay documentación que indique capacidad de generalización.
- Sin evaluación publicada: no existen métricas de éxito, número de episodios ni resultados de benchmarks, por lo que no es posible estimar su fiabilidad en producción.
- Sin validación comunitaria: cero descargas y cero «likes» en el momento de redactar esta ficha; el checkpoint no ha sido contrastado por terceros.
- Sesgos y alucinación: no aplican en el sentido de un modelo de lenguaje, pero una política puede producir acciones incorrectas o inseguras ante observaciones fuera de la distribución de entrenamiento, sin que exista un mecanismo documentado de detección.
- Documentación incompleta: la model card no detalla la arquitectura, el número de tokens de entrenamiento, la composición del dataset, la configuración de cámaras, ni las limitaciones conocidas.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, lo que en principio permite uso comercial; sin embargo, no se especifica la licencia del dataset de ajuste ni de posibles componentes heredados del modelo base, por lo que conviene verificarla antes de un uso comercial.
- Idiomas: no se documenta ningún soporte idiomático; el modelo no debe evaluarse como un modelo de lenguaje multilingüe.
- Seguridad física: cualquier despliegue sobre un brazo robótico real requiere protocolos de parada de emergencia y supervisión, ya que el modelo no incorpora garantías de seguridad.
- Fechas inconsistentes: el repositorio figura como creado y actualizado el 2026-09-22, dato que conviene contrastar con la fuente original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samanthalhy/so100_smol_popcorn_1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste: https://huggingface.co/datasets/samanthalhy/so100_popcorn_1
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
