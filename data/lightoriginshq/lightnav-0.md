# LightOriginsHQ/LightNav-0

## Resumen

LightNav-0 es un modelo de navegación encarnada (embodied navigation) desarrollado por Light Origins (LightOriginsHQ) que extrae la inteligencia espacial de un modelo de lenguaje y visión preentrenado, Qwen3-VL-4B-Instruct, y la alinea con tareas de navegación sin necesidad de cabezas de predicción específicas. El modelo unifica en una única interfaz de tokens tres tareas distintas: seguimiento de instrucciones, navegación a objetos de vocabulario abierto y tracking visual. Para ello emplea un pointing dual-channel que expresa intención espacial independiente de la tarea, la escena y el embodiment, y un tokenizador de acciones residual vector-quantized (RVQ) que convierte esa intención en trayectorias concretas y específicas del robot.

Con 4.847.825.408 parámetros (aproximadamente 4,8 mil millones), el modelo se distribuye en formato safetensors con pesos en bf16 y ocupa unos 9,7 GB. Su arquitectura se basa en el transformer multimodal de Qwen3-VL, al que se añaden embeddings de navegación como filas ordinarias de la tabla de embeddings, lo que permite cargarlo con transformers estándar. La entrada consiste en un historial de fotogramas RGB comprimido mediante SlowFast (resolución 256×448, 4 fps) junto con una instrucción en lenguaje natural, y la salida son tokens de pointing seguidos de tres tokens de acción RVQ que se decodifican en un chunk de waypoints de 10 pasos.

La relevancia de LightNav-0 radica en su enfoque compacto y generalista: un solo modelo, sin cabezas específicas, puede abordar múltiples tareas de navegación en simulación y en robots reales, con una interfaz de tokens compartida que simplifica el entrenamiento y el despliegue. Su licencia Apache 2.0 permite uso comercial sin restricciones, y el código de inferencia, servido y evaluación está disponible en un repositorio público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal) con tokens de navegacion anadidos |
| Parametros totales | 4.847.825.408 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

LightNav-0 parte del checkpoint Qwen3-VL-4B-Instruct y le añade tokens de navegación como filas adicionales en la tabla de embeddings. No incorpora cabezas de predicción específicas de tarea; toda la salida se expresa mediante tokens. La interfaz de salida consta de dos canales de pointing (`<apos_*>` para posición absoluta y `<opos_*>` para posición relativa) seguidos de tres tokens de acción RVQ (`<act_l0_*><act_l1_*><act_l2_*>`), que se decodifican mediante un bundle de tokenizador RVQ compartido (3 codebooks de 256 códigos, horizonte 10) en un chunk de waypoints de forma `(10, 3)` con coordenadas `[forward_m, lateral_m (+left), yaw_rad (+ccw)]`.

La entrada se compone de un historial de fotogramas RGB de primera persona comprimido con SlowFast (resolución 256×448, 4 fps) más una instrucción en lenguaje natural. El modelo procesa esta entrada multimodal y genera los tokens de navegación. No se especifican en la información disponible los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La model card indica únicamente que se alinea la inteligencia espacial del VLM preentrenado con la navegación, sin detallar el procedimiento de entrenamiento.

## Capacidades

- Navegación por instrucción: sigue comandos en lenguaje natural para desplazarse en entornos simulados (compatible con Habitat VLN-CE).
- Navegación a objetos de vocabulario abierto: localiza y navega hacia objetos no predefinidos (ObjectNav).
- Tracking visual: sigue a personas u objetos en movimiento a partir de una instrucción descriptiva (evaluado en EVT-Bench).
- Interfaz de tokens unificada: las tres tareas comparten el mismo mecanismo de pointing y tokenización de acciones, sin cabezas específicas.
- Compatibilidad con transformers estándar: el checkpoint carga con la librería `transformers` sin modificaciones.
- Despliegue en tiempo real: soporta servido mediante vLLM (backend `vllm_local`) y comunicación por WebSocket para clientes remotos.
- No se documentan capacidades de tool calling, agentes generales, razonamiento multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Navegación autónoma en simulación: evaluar y entrenar agentes en entornos Habitat VLN-CE y ObjectNav, usando el modelo como cerebro de navegación generalista.
- Seguimiento de personas en robótica de servicio: un robot con cámara RGB puede seguir a un individuo concreto a partir de una instrucción como "follow the person in the red shirt", gracias al tracking visual y al pointing dual-channel.
- Despliegue en robots reales: el modelo puede integrarse en plataformas robóticas con cámara RGB y control de locomoción, usando los waypoints decodificados como comandos de movimiento.
- Servicio de navegación por WebSocket: exponer el modelo como un servicio en red para que múltiples clientes envíen vídeo e instrucciones y reciban trayectorias, útil en flotas de robots.
- Investigación en visión-lenguaje-acción: servir como baseline compacto para estudiar la elicitación de inteligencia espacial en VLMs y la unificación de tareas de navegación.
- Prototipado rápido de sistemas de navegación: gracias a su licencia Apache 2.0 y a la carga con transformers estándar, se puede integrar en pipelines existentes sin dependencias propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona recetas de evaluación para Habitat VLN-CE, ObjectNav y EVT-Bench, pero no proporciona cifras concretas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 9,7 GB, por lo que se necesitan al menos 12 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits o 4 bits (no documentada oficialmente) podría reducirse, pero no hay datos al respecto.
- GPU recomendadas: una RTX 4090 (24 GB) es suficiente para inferencia local; para servido concurrente se recomiendan GPUs de datacenter como A100 o H100.
- Compatibilidad con GPUs de consumo: sí, una RTX 3090 o superior con 24 GB puede ejecutar el modelo en bf16.
- Opciones de despliegue: vLLM (backend `vllm_local`), servidor WebSocket propio, y el paquete `lightnav` que incluye scripts de predicción y servido.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos de navegación encarnada con características similares (mismo tamaño, misma interfaz de tokens, misma licencia). El modelo base Qwen3-VL-4B-Instruct no es directamente comparable porque no está orientado a navegación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos de vídeo e instrucciones, puede presentar sesgos derivados de los entornos de entrenamiento (por ejemplo, escenas domésticas u oficinas).
- Riesgo de alucinación en la interpretación de instrucciones ambiguas o en entornos no vistos, lo que puede llevar a trayectorias incorrectas.
- La longitud de contexto no está especificada; aunque hereda la del modelo base Qwen3-VL, no se garantiza un comportamiento óptimo con historias de vídeo muy largas.
- El modelo está diseñado para entrada de vídeo a 4 fps y resolución 256×448; usos fuera de estos parámetros pueden degradar el rendimiento.
- No se especifican idiomas soportados; la evaluación se muestra en inglés, por lo que el rendimiento en otros idiomas es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los componentes de terceros (Qwen3-VL) mantengan sus propias licencias.
- Para producción, es necesario validar el modelo en el robot y entorno concretos, ya que no se aportan métricas de robustez ni pruebas en condiciones adversas.

## Enlaces

- HuggingFace: https://huggingface.co/LightOriginsHQ/LightNav-0
- Repositorio de código: https://github.com/lightrobo/LightNav-0
- Vídeo de presentación: https://www.youtube.com/watch?v=e8w78YqYShU
- Perfil de Light Origins en X: https://x.com/LightOrigins_
- Comunidad Discord: https://discord.gg/zwZuD9JG
