# huggsook/lerobot-diffusion-pusht-sim

## Resumen

El modelo `huggsook/lerobot-diffusion-pusht-sim` es un conjunto de artefactos de política y rollout para robótica, desarrollado sobre el framework LeRobot de Hugging Face. Incluye dos políticas entrenadas mediante aprendizaje por imitación: una política de difusión (Diffusion Policy con backbone ResNet-18) para la tarea PushT 2D de empuje de bloques, y un Action Chunking Transformer (ACT) para la tarea de transferencia dual ALOHA. El repositorio contiene los pesos en formato safetensors, vídeos de demostración de los rollouts y scripts para ejecutar simulaciones locales.

Este modelo resuelve el problema de generar acciones de control para robots manipuladores a partir de observaciones visuales y de estado, utilizando técnicas de política de difusión y transformadores de troceado de acciones. Su relevancia radica en que permite evaluar y comparar arquitecturas de políticas visuomotoras en entornos de simulación estandarizados (gym-pusht y gym-aloha) antes de su posible transferencia a robots reales. El repositorio acumula 262.709.062 parámetros en total (suma de los safetensors) y ocupa 1,1 GB, aunque no se especifica el desglose por política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (ResNet-18 backbone) para PushT; Action Chunking Transformer (ACT) para ALOHA |
| Parametros totales | 262.709.062 (suma de todos los safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene dos políticas distintas. La primera es una Diffusion Policy basada en el proceso de difusión DDPM con 100 pasos de denoising, que utiliza un backbone ResNet-18 para procesar observaciones RGB de 96x96 píxeles junto con la posición 2D del objeto, y genera como salida una coordenada 2D objetivo. La segunda es un Action Chunking Transformer (ACT), que procesa imágenes RGB de 480x640 y un estado de 14 grados de libertad (DoF) para predecir posiciones articulares de 14 DoF. Ambas se entrenaron mediante aprendizaje por imitación, utilizando demostraciones de los entornos de simulación gym-pusht y gym-aloha, aunque no se especifican el número de demostraciones ni la composición exacta del dataset. No se menciona el uso de RLHF ni DPO.

La innovación principal reside en la aplicación de políticas de difusión al control robótico, un enfoque que ha demostrado ser robusto frente a la multimodalidad de las demostraciones humanas. El uso de ACT para la tarea ALOHA permite el control de un brazo dual con predicción de secuencias de acciones (chunking), lo que mejora la estabilidad del control en tareas de manipulación fina.

## Capacidades

- Generación de acciones de control para robots manipuladores en entornos de simulación.
- Procesamiento de observaciones visuales (RGB) y de estado (posiciones, velocidades) para condicionar la política.
- Soporte de dos tareas específicas: PushT 2D (empuje de un bloque hacia una región objetivo) y ALOHA transfer (manipulación dual de un cubo).
- Aprendizaje por imitación: las políticas se entrenan a partir de demostraciones, sin necesidad de recompensas explícitas.
- Ejecución en tiempo real en simulación: ~1.90 FPS para PushT y ~45.0 FPS para ALOHA en hardware MPS (Apple Silicon).
- Incluye scripts para rollout en simulación y modo interactivo con control por teclado.

## Casos de uso

- Investigación en aprendizaje por imitación: permite reproducir y comparar políticas de difusión y ACT en tareas de manipulación estandarizadas, facilitando la evaluación de nuevas variantes.
- Desarrollo de políticas de control para robots: sirve como punto de partida para entrenar políticas en simulación y transferirlas posteriormente a robots reales (sim2real).
- Evaluación de algoritmos de planificación de movimientos: al proporcionar un entorno de simulación con métricas claras (recompensa acumulada), se puede usar para comparar el rendimiento de diferentes arquitecturas.
- Formación y docencia en robótica: el repositorio incluye vídeos de demostración y scripts fáciles de ejecutar, lo que lo hace adecuado para cursos de robótica y aprendizaje automático.
- Prototipado rápido de sistemas de control: los scripts de rollout permiten probar la política en pocos minutos, ideal para validar hipótesis antes de invertir en hardware real.
- Benchmarking de hardware: al ser un modelo pequeño (262M parámetros), puede usarse para medir el rendimiento de GPUs o aceleradores en tareas de inferencia robótica.

## Benchmarks y rendimiento

Según la model card del autor, los resultados declarados son los siguientes:

| Entorno | Arquitectura | Espacio de observacion | Espacio de accion | Recompensa media | Velocidad de inferencia |
|---|---|---|---|---|---|
| PushT 2D | Diffusion Policy (DDPM, 100 timesteps) | RGB (96, 96, 3) + Pos 2D (2,) | Coord 2D (2,) | 66.70 / 100 | ~1.90 FPS (MPS) |
| ALOHA Transfer | ACT | RGB top (480, 640, 3) + Estado 14-DoF | Pos articular 14-DoF | 8.00 (éxito) | ~45.0 FPS (MPS) |

Estos valores no han sido verificados de forma independiente. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- El modelo tiene 262.709.062 parámetros en total, lo que en precisión FP32 ocupa aproximadamente 1,05 GB de memoria. Con cuantización a 8 bits podría reducirse a unos 0,26 GB, aunque no se ofrecen versiones cuantizadas.
- La inferencia se ha probado en hardware MPS (Apple Silicon), alcanzando ~1.90 FPS para PushT y ~45.0 FPS para ALOHA. Esto sugiere que puede ejecutarse en portátiles con chip M1/M2/M3.
- En GPUs de consumo, una tarjeta con 4 GB de VRAM (por ejemplo, GTX 1650 o RTX 3050) sería suficiente para la inferencia, dado el tamaño del modelo.
- Para entrenamiento o fine-tuning, se recomienda al menos 8 GB de VRAM para manejar el lote y los gradientes, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: el repositorio incluye scripts de Python que usan LeRobot y diffusers. También puede integrarse con vLLM o TGI si se convierte a un formato compatible, aunque no es el flujo habitual para modelos de robótica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo oficial `lerobot/diffusion_pusht` de Hugging Face existe en el ecosistema LeRobot, pero no se han encontrado métricas públicas que permitan una comparación directa. Se recomienda consultar el repositorio oficial para obtener referencias adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para entornos de simulación específicos (PushT y ALOHA). No se garantiza su funcionamiento en otros entornos o en robots reales sin un proceso de adaptación (sim2real).
- No se proporcionan datos sobre sesgos o comportamientos no deseados. Como cualquier modelo de aprendizaje por imitación, puede heredar sesgos de las demostraciones utilizadas.
- La recompensa media de 66.7 en PushT indica que la política no es perfecta; en algunos episodios puede fallar en alcanzar el objetivo.
- La velocidad de inferencia en MPS es baja para PushT (~1.9 FPS), lo que puede limitar su uso en aplicaciones de tiempo real si se requiere una frecuencia de control alta.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de las dependencias (gym-pusht, gym-aloha, diffusers, etc.) para cumplir con sus términos.
- No se especifica la longitud de contexto ni el número de pasos de observación utilizados, lo que dificulta la reproducción exacta de los resultados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggsook/lerobot-diffusion-pusht-sim
- Modelo oficial de LeRobot para PushT: https://huggingface.co/lerobot/diffusion_pusht
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Proyecto relacionado de sim2real para PushT: https://github.com/ellenjxu/lerobot_pusht
- Página de análisis del modelo en Toolify: https://www.toolify.ai/ai-model/lerobot-diffusion-pusht
- Ficha del modelo en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/diffusion-pusht-lerobot
