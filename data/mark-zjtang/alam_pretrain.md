# Mark-ZJTang/alam_pretrain

## Resumen

ALAM (Latent Action Model) es un modelo de tokenización para robótica desarrollado por Mark-ZJTang. Este repositorio contiene los checkpoints del tokenizador de ALAM v3, utilizados en evaluaciones posteriores para tareas de manipulación robótica. El modelo convierte observaciones y acciones en representaciones latentes discretas mediante un codebook de 256 entradas y 7 slots de acción latente, con vectores de 128 dimensiones. Está diseñado para facilitar el aprendizaje de políticas en entornos como MetaWorld MT50 y LIBERO.

La relevancia de este modelo radica en su enfoque de acción latente, que permite comprimir secuencias de acciones en tokens discretos, reduciendo la complejidad del espacio de búsqueda para algoritmos de aprendizaje por refuerzo y planificación. Aunque el repositorio es reciente (creado en agosto de 2026) y cuenta con pocas descargas, su arquitectura específica para robótica lo hace interesante para investigadores del área. La licencia no está especificada, lo que limita su uso comercial hasta que el autor la complete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador de acciones latentes (ALAM v3), con 7 slots de acción latente, codebook de 256 entradas y vectores latentes de 128 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo orientado a robótica, no a lenguaje) |
| Licencia | no disponible (pendiente de completar por el propietario) |
| Formato de pesos | `pytorch_model.bin` (binario de PyTorch) |

## Arquitectura y entrenamiento

ALAM v3 es un tokenizador de acciones latentes, no un modelo de lenguaje. Su arquitectura interna no está documentada en la información proporcionada, pero se sabe que utiliza 7 slots de acción latente, un codebook de 256 entradas y vectores latentes de 128 dimensiones. El modelo se entrena de forma auto-supervisada para discretizar secuencias de acciones en tokens, lo que permite a los algoritmos de robótica trabajar en un espacio latente compacto.

El entrenamiento se realizó con 128 GPUs NVIDIA H20 (un proceso por GPU), con un batch de 32 por GPU y acumulación de gradientes de 2. Se proporcionan dos checkpoints: uno para MetaWorld MT50 (época 19, paso 58,216) y otro para LIBERO (época 16, paso 49,024). No se especifican detalles sobre el dataset de entrenamiento ni sobre técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Tokenización de acciones y observaciones en representaciones latentes discretas para robótica.
- Soporte para entornos de manipulación robótica como MetaWorld MT50 y LIBERO.
- Diseñado para integrarse en pipelines de aprendizaje por refuerzo y planificación de movimientos.
- No es un modelo de lenguaje: no genera texto ni código, ni soporta tool calling o agentes conversacionales.
- Capacidades multilingües: no aplica, al ser un modelo puramente robótico.

## Casos de uso

- Aprendizaje por refuerzo en robótica: el tokenizador comprime las acciones en tokens latentes, reduciendo la dimensionalidad del espacio de acción y acelerando la convergencia de algoritmos como PPO o SAC en tareas de MetaWorld.
- Planificación de movimientos: al discretizar acciones, se puede usar con planificadores basados en búsqueda o modelos de difusión para generar trayectorias en el espacio latente.
- Imitación de demostraciones: el tokenizador permite convertir demostraciones humanas o teleoperadas en secuencias de tokens, facilitando el entrenamiento de políticas clonadas.
- Evaluación de políticas en LIBERO: el checkpoint específico para LIBERO permite reproducir experimentos de manipulación de largo horizonte con una representación compacta.
- Investigación en representaciones latentes: sirve como base para estudiar la eficiencia de codificaciones discretas en tareas de control continuo.
- Transferencia entre tareas: al compartir el codebook, se puede explorar la transferencia de habilidades entre diferentes tareas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los checkpoints se usaron en evaluaciones de MetaWorld MT50 y LIBERO, pero no se proporcionan métricas numéricas (éxito, recompensa, etc.). No se pueden comparar con otros modelos sin datos concretos.

## Requisitos de hardware

- El tamaño del repositorio es de 1.7 GB, lo que sugiere que los checkpoints son relativamente ligeros y podrían cargarse en GPUs consumer (p. ej., RTX 3060 o superior) para inferencia.
- No se especifica la VRAM necesaria para inferencia; se recomienda probar con al menos 4 GB de VRAM dado el tamaño de los pesos.
- El entrenamiento completo requiere 128 GPUs NVIDIA H20, pero la inferencia es mucho menos exigente.
- Opciones de despliegue: al ser un modelo PyTorch, se puede cargar con `torch.load` o integrarse en frameworks como PyTorch Lightning. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. ALAM es un tokenizador de acciones latentes específico para robótica, y no hay datos de otros modelos de la misma categoría en el contexto de esta ficha.

## Limitaciones y advertencias

- Licencia no especificada: el autor indica que la licencia debe completarse antes de la publicación pública, por lo que el uso comercial no está claramente permitido.
- El modelo tiene una suposición interna de dispositivo CUDA en el codificador, lo que puede causar problemas en entornos CPU o con otras arquitecturas.
- No es un modelo de lenguaje: no puede generar texto, responder preguntas ni realizar razonamiento simbólico.
- Los datos de entrenamiento no están documentados, por lo que pueden existir sesgos en las tareas robóticas representadas.
- No se proporcionan métricas de rendimiento, lo que dificulta evaluar su eficacia frente a otros tokenizadores.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto en fase temprana o de uso interno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mark-ZJTang/alam_pretrain
- Perfil de GitHub del autor: https://github.com/Mark-zjtang
- (No se dispone de otros enlaces relevantes; la model card menciona un repositorio de código en GitHub, pero no se proporciona la URL exacta.)
