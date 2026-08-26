# nacefmbarek/simlingo-predictive-fusion

## Resumen

SimLingo Predictive Fusion (fdrop03) es un modelo de conducción autónoma basado en visión-lenguaje-acción (VLA) desarrollado por nacefmbarek, diseñado para el simulador CARLA. Se construye sobre la arquitectura InternVL2-1B (InternViT-300M como codificador visual y Qwen2-0.5B como modelo de lenguaje) y aplica una fusión predictiva en dos etapas: primero integra un histograma de ocupación BEV generado desde LiDAR 360°, y después incorpora un embedding futuro previsto por un tokenizador DeltaTok (DINOv3 ViT-B/16 congelado más un predictor entrenado). El modelo está pensado para resolver el problema de conducción autónoma en entornos simulados, combinando percepción multimodal con razonamiento lingüístico y control de acciones.

La relevancia actual radica en su enfoque de fusión predictiva, que no se limita a la observación del estado actual sino que anticipa el siguiente paso temporal, una innovación que mejora la robustez en escenarios de conducción dinámica. El checkpoint presentado incluye dos versiones de pesos (paso 50000 y final de época 3) además del tokenizador DeltaTok, con un total de 1317,6 millones de parámetros. Es un proyecto de investigación con licencia MIT, sin uso comercial directo, y está orientado a la comunidad académica y de desarrollo de sistemas autónomos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL2-1B (InternViT-300M + Qwen2-0.5B) con LoRA r=32 α=64 |
| Parametros totales | 1317,6 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato checkpoint) |
| Idiomas soportados | no disponible (probablemente inglés y chino, por Qwen2, pero no confirmado) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (.ckpt) con state_dict, no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en InternVL2-1B, que combina un codificador de visión InternViT de 300M de parámetros y un modelo de lenguaje Qwen2 de 0,5B. Sobre esta base se aplica un LoRA con r=32 y α=64 para adaptar el modelo a la tarea de conducción. La innovación principal es la fusión predictiva en dos etapas: en la primera, los tokens de visión de InternViT actúan como consulta y reciben como clave-valor el histograma de ocupación BEV generado a partir de LiDAR 360°, proporcionando información espacial del escenario actual. En la segunda etapa, los mismos tokens consultan un embedding futuro previsto por el tokenizador DeltaTok, que consiste en un DINOv3 ViT-B/16 congelado y un predictor entrenado para pronosticar el siguiente token delta sin ver el frame futuro. Estos tokens enriquecidos reemplazan los marcadores `<IMG_CONTEXT>` en el texto de entrada.

El entrenamiento usa una receta específica: `route_as` como `target_point_command` (combina el punto GPS objetivo con la orden lingüística), `predict_route_as_wps` activado, `speed_wps_mode` en 2D, y una tasa de dropout de fusión de 0,3 que retiene conjuntamente BEV y forecast en cada muestra durante el entrenamiento, forzando que el camino de puntos objetivo y comandos también transporte gradiente. El horizonte de predicción es simple (no multi-horizonte), con 4 frames de contexto y un gap de 1 frame entre ellos. El tokenizador DeltaTok se incluye en el repositorio y se entrenó con un horizonte único. Los datos provienen de la plataforma Carla Garage y del pipeline de SimLingo original.

## Capacidades

- Conducción autónoma en el simulador CARLA: el modelo recibe imágenes de cámara, LiDAR y comandos de lenguaje (como "gira a la izquierda" o "sigue recto") y produce acciones de control (aceleración, freno, dirección).
- Comprensión de instrucciones lingüísticas: integra el comando de lenguaje como parte del contexto de entrada, permitiendo que las decisiones se alineen con indicaciones verbales.
- Predicción de trayectorias: gracias a la fusión con el tokenizador DeltaTok, el modelo anticipa el siguiente estado del escenario sin ver el frame futuro, mejorando la planificación de movimientos.
- Fusión multimodal avanzada: combina visión (cámara), LiDAR (BEV) y lenguaje en un único modelo, con dos etapas de cross-attention que enriquecen los tokens de visión.
- Soporte para visión-lenguaje-acción (VLA) en robótica: aunque no es un modelo de propósito general, está diseñado para tareas de control autónomo con interfaz en lenguaje natural.
- Capacidad de generar comentarios o explicaciones de conducción (según la línea SimLingo original), aunque no se especifica en este checkpoint concreto.

## Casos de uso

- Investigación en conducción autónoma en simulación: el modelo es adecuado para experimentos académicos en CARLA, donde los investigadores pueden probar nuevas estrategias de fusión multimodal o de predicción de futuro sin necesidad de hardware real.
- Desarrollo de políticas VLA con lenguaje natural: se puede utilizar para estudiar cómo las instrucciones lingüísticas influyen en las decisiones de conducción, por ejemplo, evaluando la adherencia a órdenes complejas como "adelanta al vehículo de delante".
- Benchmarking en CARLA Leaderboard o Bench2Drive: el modelo puede servir como referencia comparativa para otros métodos de conducción autónoma, aunque no se proporcionan resultados de benchmarks propios.
- Entrenamiento de modelos de predicción de trayectorias: el componente DeltaTok puede reutilizarse para investigar la predicción de futuros en entornos de conducción, dado que es un tokenizador entrenado y congelado.
- Desarrollo de sistemas de conducción con explicabilidad: al integrar lenguaje y visión, se puede analizar cómo el modelo justifica sus decisiones, aunque no se incluye un módulo de explicación explícito.
- Prototipado de arquitecturas de fusión multimodal: la arquitectura de fusión en dos etapas puede adaptarse para otros dominios de robótica que requieran combinar sensores de diferente naturaleza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta métricas en CARLA Leaderboard, Bench2Drive, ni otros conjuntos de datos. Se menciona que el modelo alcanza un estado del arte en los trabajos originales de SimLingo, pero no se proporcionan números concretos para este checkpoint específico.

## Requisitos de hardware

- VRAM estimada: dado que el modelo tiene 1317,6 M de parámetros y se usa LoRA, la inferencia puede requerir entre 8 y 16 GB de VRAM dependiendo de la precisión (FP32 o FP16). Los pesos se proporcionan en formato de precisión mixta (probablemente FP32, por el tamaño de archivo de 3,2 GB para 1,3B parámetros).
- GPU recomendadas: una GPU con al menos 12 GB de VRAM, como NVIDIA RTX 3060 Ti, RTX 3080, RTX 4090, o A100 para entornos de investigación.
- En consumer GPU: sí, cabe en GPUs de gama alta como RTX 3090 o RTX 4090 (24 GB VRAM) con espacio para batch pequeño.
- Opciones de despliegue: al ser un modelo de investigación con pesos en formato PyTorch, se recomienda usar el framework de entrenamiento original (Hydra + PyTorch) o adaptarlo a librerías como vLLM para inferencia, aunque no está optimizado para ello. No se soporta llama.cpp ni Ollama directamente.
- Latencia y throughput: no disponible. El tamaño del modelo (1,3B) sugiere una inferencia de varios milisegundos por paso, pero depende del hardware y del uso de la fusión en dos etapas.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. Como referencia general, el modelo original SimLingo (CVPR 2025) se compara con otros métodos VLA como CarLLaVA o modelos de conducción basados en LLM, pero no se tienen datos específicos para este checkpoint. Por tanto, la comparativa queda pendiente de datos oficiales.

## Limitaciones y advertencias

- Modelo de investigación, no para producción: está diseñado para simulación y experimentación, no para conducción real en vehículos físicos.
- Dependencia del simulador CARLA: los pesos están entrenados específicamente para los datos de Carla Garage, por lo que la generalización a otros entornos o datos no está garantizada.
- Riesgo de alucinación en lenguaje: aunque el modelo integra lenguaje, no se han evaluado sus capacidades de generación de texto libre; es probable que tenga limitaciones en respuestas fuera del dominio de conducción.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al usar Qwen2-0.5B, la ventana de contexto es probablemente limitada (quizá 16K tokens), lo que puede restringir la cantidad de frames históricos o texto que se puede procesar.
- Licencia MIT: permite uso comercial, pero el modelo depende de componentes con licencia MIT (InternVL2, Qwen2) y de datos de CARLA que pueden tener restricciones adicionales. Se recomienda revisar las licencias de los modelos base.
- Requisitos de acceso a DINOv3: el tokenizador DeltaTok usa el backbone `facebook/dinov3-vitb16-pretrain-lvd1689m`, que está gated en HuggingFace; se necesita solicitar acceso o usar la variable de entorno `DINOV3_BACKBONE` con una copia local.
- No es un modelo de propósito general: no sirve para tareas de lenguaje natural o visión fuera del contexto de conducción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nacefmbarek/simlingo-predictive-fusion
- Repositorio de entrenamiento (código y config): https://github.com/nacef112/kaut-project
- Proyecto SimLingo original (CVPR 2025): https://github.com/RenzKa/simlingo
- Paper de SimLingo: https://arxiv.org/abs/2503.09594
- Perfil del autor: https://huggingface.co/nacefmbarek
