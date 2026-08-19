# Guangyan/HOST

## Resumen

HOST (Human-to-robot One-shot Skill Transfer) es un modelo de robótica desarrollado por el equipo de Guangyan Chen (CGuangyan-BIT) que implementa el mecanismo de "self-grounded prediction": un predictor autoregresivo de difusión con arquitectura Mixture-of-Transformers que combina expertos duales de video y acción. El modelo localiza el progreso actual del robot dentro de una demostración visual, predice las observaciones futuras condicionadas a ese segmento localizado y deriva comandos motores a partir del futuro predicho. Está construido sobre el codebase Fast-WAM (arXiv:2603.16666) y se publica bajo licencia MIT.

El checkpoint liberado corresponde a la fase de entrenamiento robot→robot, es decir, el condicionamiento por video de tarea proviene de episodios de demostración de robots pares, no de vídeo humano. Esto ejercita la arquitectura de predicción auto-condicionada de forma independiente a la mitad de transferencia humano→robot del pipeline completo. El peso ocupa aproximadamente 15,9 GB en bf16 con un pequeño grupo fp32, y se distribuye como un archivo `model.pt` de PyTorch junto a un `config.yaml` mínimo para inferencia.

La relevancia actual de HOST reside en su enfoque unificado para el aprendizaje por imitación en robótica: un único modelo de difusión que integra generación de vídeo futuro, localización de progreso y control motor, sin necesidad de separar módulos de percepción y planificación. Aunque el checkpoint publicado es solo la parte de entrenamiento con datos de robot, sienta las bases para la transferencia one-shot desde demostraciones humanas que da nombre al proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers con expertos duales de video y accion (difusion autoregresiva) |
| Parametros totales | no disponible (checkpoint ~15,9 GB en bf16) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (con un pequeno grupo fp32) |
| Idiomas soportados | no disponible (modelo de robotica, sin interfaz de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`, `torch.save` de un `state_dict` anidado) |

## Arquitectura y entrenamiento

El modelo implementa la predicción auto-condicionada mediante un único modelo de difusión autoregresivo con dos expertos (video y acción) integrados en una arquitectura Mixture-of-Transformers, construida sobre el codebase Fast-WAM. El checkpoint se entrenó con la configuración `real_joint_2cam_224_1e-4_pac_headwise_ncp_ve.yaml`, que incluye un codificador visual (basado en DINOv2 y SigLIP como backbones públicos) y módulos específicos para progreso, propriocepción y decodificación de acciones. Los pesos se guardan en bf16 con un pequeño grupo fp32, y el `state_dict` contiene las claves `mot`, `proprio_encoder`, `progress_encoder`, `progress_decoder`, `visual_encoder`, `step` y `torch_dtype`.

El régimen de entrenamiento es exclusivamente robot→robot: el condicionamiento por vídeo de tarea proviene de episodios de demostración de robots pares (a través de `task_paths.json`), no de vídeo humano. Esto permite validar la arquitectura de predicción auto-condicionada de forma independiente a la parte de alineamiento humano→robot del pipeline HOST completo. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO; la información disponible solo indica que es un checkpoint de inferencia sin estado de optimizador.

## Capacidades

- Generación de vídeo futuro condicionado: el modelo predice las observaciones futuras del robot a partir de un segmento localizado de la demostración visual.
- Localización de progreso: identifica en qué punto de la demostración visual se encuentra el robot en cada instante.
- Derivación de comandos motores: convierte las predicciones de vídeo futuro en acciones de articulación o efector final (normalizadas a [-1, 1]).
- Integración visión-lenguaje-acción (VLA) según los tags del repositorio, aunque el checkpoint publicado no incluye entrada de lenguaje explícita.
- Generación de vídeo mediante difusión, lo que lo habilita como modelo mundo para planificación predictiva.
- Capacidad de trabajar con dos cámaras (según la configuración `real_joint_2cam_224`), procesando observaciones visuales de múltiples vistas.

## Casos de uso

- Aprendizaje por imitación robot→robot: el modelo puede transferir habilidades entre robots de la misma plataforma usando demostraciones de un robot maestro, sin necesidad de teleoperación humana. Es adecuado porque el entrenamiento se realizó exactamente con este régimen de datos.
- Planificación predictiva con modelo mundo: al predecir el vídeo futuro, el sistema puede simular mentalmente varios cursos de acción y seleccionar el que mejor cumpla un objetivo, útil en entornos industriales donde la validación física es costosa.
- Control predictivo basado en vídeo: en tareas de manipulación como ensamblaje o pick-and-place, el robot puede anticipar errores de agarre o colisiones antes de ejecutarlos, gracias a la generación de futuros observacionales.
- Teleoperación asistida: combinado con la parte de alineamiento humano→robot del pipeline HOST (no incluida en este checkpoint), permitiría a un operador humano demostrar una tarea una sola vez y que el robot la replique, reduciendo el tiempo de programación.
- Entrenamiento de políticas en simulación: el modelo puede generar trayectorias de vídeo sintéticas para aumentar datasets de entrenamiento de otros controladores, aprovechando su capacidad de difusión de vídeo.
- Evaluación de seguridad en robótica colaborativa: la predicción de futuros permite verificar que las acciones planificadas no invadan zonas de seguridad, usándose como filtro previo en celdas de trabajo con humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa ~15,9 GB en bf16, por lo que se necesita al menos 16 GB de VRAM para cargar los pesos; con overhead de activaciones y contexto, se recomiendan 24 GB o más.
- GPU recomendadas: NVIDIA A100 (40/80 GB), RTX 4090 (24 GB), RTX A6000 (48 GB) o H100 para entornos de investigación. GPU con soporte bf16 nativo (Ampere o posterior) son preferibles.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) si se gestiona la memoria con cuidado, pero no en GPUs de 8-12 GB.
- Opciones de despliegue: al ser un modelo de difusión con arquitectura personalizada, no es directamente compatible con vLLM, Ollama o llama.cpp. Se despliega mediante PyTorch, cargando `model.pt` y usando el código de evaluación del repositorio HOST (`scripts/eval_openloop.sh`).
- Latencia y throughput: no disponible; depende del hardware y de la longitud de la secuencia de vídeo procesada.

## Comparativa con modelos similares

No disponible. No se han identificado modelos directamente comparables en la información proporcionada, dado que HOST es un modelo de robótica especializado en predicción auto-condicionada y transferencia de habilidades, una categoría muy específica dentro de los modelos mundo y VLA.

## Limitaciones y advertencias

- El checkpoint publicado es robot→robot, no humano→robot; la capacidad de transferencia desde vídeo humano no está incluida en este artefacto.
- No se han publicado resultados de benchmarks ni métricas de rendimiento, por lo que su eficacia en tareas reales no está cuantificada.
- El modelo requiere ficheros de mapeo (`cam_mapping_dir` y `joint_action_mapping_dir`) con estadísticas de normalización (`norm_min`/`norm_delta`) para convertir salidas normalizadas a ángulos físicos; sin ellos, la inferencia no es posible.
- La configuración incluida (`config.yaml`) no es el config de entrenamiento completo; se ha recortado para inferencia y puede no reflejar todos los detalles del entrenamiento original.
- Los pesos del codificador visual se cargan desde backbones públicos (DINOv2 y SigLIP) que se descargan automáticamente si no se especifican rutas locales; esto requiere conexión a internet la primera vez.
- El tamaño del checkpoint (~15,9 GB) limita su uso a entornos con GPU de alta memoria; no es adecuado para edge computing.
- Al ser un modelo de difusión autoregresivo, la generación de vídeo futuro puede ser lenta y propensa a acumular errores en secuencias largas.
- La licencia MIT permite uso comercial, pero se debe verificar la atribución requerida por Fast-WAM y el repositorio HOST.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Guangyan/HOST
- Repositorio GitHub: https://github.com/CGuangyan-BIT/HOST
- Paper Fast-WAM (arXiv): https://arxiv.org/abs/2603.16666
