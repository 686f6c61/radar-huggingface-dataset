# AIMindaeng/UniVLA-fewshot

## Resumen
UniVLA es un modelo de visión-lenguaje-acción (VLA) orientado a robótica generalista, desarrollado por el OpenDriveLab (Qingwen Bu, Y. Yang, J. Cai, S. Gao, G. Ren, M. Yao, P. Luo, H. Li). Su propuesta central es planificar en un espacio de acciones latentes unificado y agnóstico al cuerpo del robot (embodiment-agnostic), lo que permite extraer acciones latentes centradas en la tarea a partir de vídeos de diversas morfologías y entrenar una política generalista con un coste computacional reducido. El modelo se apoya en el backbone Prismatic DINOv2+SigLIP de 7B parámetros (prism-dinosiglip-224px+7b) y se distribuye como una familia de checkpoints: el modelo de acciones latentes en dos etapas, el modelo preentrenado completo y variantes afinadas para LIBERO, CALVIN, R2R y SimplerEnv/BridgeV2.

El repositorio concreto `AIMindaeng/UniVLA-fewshot` es una copia derivada de los pesos de UniVLA (0,1 GB, safetensors) asociada a los identificadores arXiv 2505.06111 y 1711.00937; por su nombre y tamaño parece contener un subconjunto de pesos o un adaptador para experimentos few-shot, aunque la model card no documenta esta variante específica. La relevancia actual de UniVLA radica en que demuestra que el preentrenamiento sobre vídeo humano y de manipulación heterogéneo, combinado con acciones latentes, puede transferirse a tareas de manipulación y navegación con datos de robot limitados.

Dado que la información disponible es escasa y proviene mayoritariamente de la model card del proyecto original, varios campos de esta ficha se marcan como no disponibles. No se han publicado en la información proporcionada datos de benchmarks numéricos para esta variante concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en transformer multimodal con backbone Prismatic DINOv2+SigLIP (prism-dinosiglip-224px+7b) y espacio de acciones latentes unificado |
| Parametros totales | 7B (según el backbone prism-dinosiglip-224px+7b referenciado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
UniVLA es un modelo de visión-lenguaje-acción construido sobre el backbone Prismatic (DINOv2 + SigLIP, resolución 224 px, 7B parámetros). La innovación principal es un espacio de acciones latentes unificado y agnóstico al embodiment, entrenado en dos etapas sobre OpenX y Ego4D: la primera etapa aprende acciones latentes generales y la segunda extrae acciones latentes centradas en la tarea. Sobre estas representaciones se preentrena una política generalista con datos de manipulación, navegación y vídeo humano, y posteriormente se realiza post-entrenamiento específico por dominio (LIBERO, CALVIN, R2R, SimplerEnv/BridgeV2) y experimentos en robots reales.

La model card describe el enfoque como una receta hacia políticas generalistas con entrenamiento computacionalmente eficiente y resultados state-of-the-art en múltiples benchmarks, aunque no se detallan en la información proporcionada el número exacto de tokens de entrenamiento, la composición cuantitativa del dataset ni si se emplearon RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Percepción visual y comprensión de instrucciones en lenguaje natural para generar acciones de robot.
- Planificación en un espacio de acciones latentes unificado, independiente de la morfología del robot.
- Extracción de acciones latentes centradas en la tarea a partir de vídeos cross-embodiment (humanos y robots).
- Política generalista preentrenada sobre manipulación, navegación y vídeo humano.
- Afinamiento y despliegue en entornos simulados y reales: LIBERO, CALVIN, R2R y SimplerEnv/BridgeV2.
- Ejecución de tareas manipulativas reales demostradas en la model card: guardar un destornillador, limpiar una tabla de cortar, doblar una toalla dos veces y apilar la torre de Hanói.
- Soporte de tool calling, function calling, agentes multi-paso o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso
- Manipulación robótica en entornos de laboratorio: el modelo puede ejecutar tareas de pick-and-place y manipulación de objetos a partir de instrucciones en lenguaje natural, como demuestran los experimentos reales de guardar un destornillador o limpiar una tabla de cortar.
- Investigación en aprendizaje por imitación cross-embodiment: sirve como base para extraer acciones latentes de vídeos humanos y de robots heterogéneos y transferirlas a una política generalista, reduciendo la necesidad de datos teleoperados.
- Evaluación comparativa en benchmarks de manipulación: las variantes afinadas para LIBERO y CALVIN permiten reproducir y comparar resultados en entornos simulados estándar de la comunidad.
- Navegación visual y lingüística: la variante afinada en R2R (Room2Room) se orienta a tareas de navegación guiada por instrucciones en interiores.
- Despliegue en simulación con SimplerEnv/BridgeV2: útil para validar políticas antes de transferirlas a hardware real, con la variante afinada en BridgeV2 (versión OXE).
- Fine-tuning few-shot para nuevas tareas: el repositorio `UniVLA-fewshot` apunta a experimentos de adaptación con pocos datos, adecuado para prototipar políticas específicas de una tarea con recursos limitados.
- Formación y reproducción académica: la receta de entrenamiento en tres fases (aprendizaje de acciones latentes, preentrenamiento de política y post-entrenamiento) permite a grupos de investigación reproducir el pipeline con sus propios datasets.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible para esta variante concreta. La model card del proyecto original afirma resultados state-of-the-art en múltiples benchmarks (LIBERO, CALVIN, Room2Room y SimplerEnv) y en experimentos reales, pero no se incluyen cifras numéricas en la información proporcionada, por lo que no se presentan valores que no puedan verificarse.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia orientativa, un modelo de 7B en precisión completa requiere del orden de 14-16 GB solo para pesos, y en cuantización de 8 bits alrededor de 8 GB, aunque estas cifras no están confirmadas para este checkpoint.
- GPU recomendadas: no disponible. Para un backbone de 7B se suelen emplear A100, H100 o RTX 4090/A6000, pero la información no especifica requisitos oficiales.
- ¿Cabe en GPU de consumo? No confirmado; probablemente sí en GPUs con 24 GB o más si se aplica cuantización, pero no hay datos oficiales.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al tratarse de un VLA con salidas de acción, el despliegue requiere el código del proyecto UniVLA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia cualitativa, UniVLA pertenece a la familia de VLA de 7B parámetros basados en Prismatic (junto con OpenVLA, que comparte backbone), pero no se dispone de cifras comparativas verificables en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| UniVLA (esta ficha) | 7B (backbone) | no disponible | no disponible | safetensors en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- La model card no documenta sesgos conocidos, tasas de alucinación ni limitaciones específicas de contexto o idioma.
- Al ser un modelo de acción robótica, sus salidas son acciones motoras dependientes del embodiment; la transferencia a un robot distinto del de entrenamiento puede requerir post-entrenamiento.
- La licencia no está especificada en la información disponible, por lo que no puede confirmarse el uso comercial; es imprescindible verificar los términos antes de cualquier despliegue en producción.
- El repositorio `AIMindaeng/UniVLA-fewshot` es una copia derivada de terceros (0 descargas, 0 likes, 0,1 GB) y no está documentado en detalle; conviene contrastar su integridad con los checkpoints oficiales del proyecto.
- No se especifican requisitos de hardware, latencias ni protocolos de seguridad para operar robots reales, lo que supone un riesgo en entornos físicos.
- Los resultados state-of-the-art mencionados en la model card corresponden al proyecto original y no están cuantificados en la información disponible para esta variante.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/AIMindaeng/UniVLA-fewshot
- Paper (arXiv 2505.06111): https://arxiv.org/pdf/2505.06111
- Referencia arXiv 1711.00937 (mencionada en los tags): https://arxiv.org/abs/1711.00937
- Sitio del proyecto OpenDriveLab: https://opendrivelab.com/#news
- Modelo de acciones latentes (etapa 1 y 2): https://huggingface.co/qwbu/univla-latent-action-model
- UniVLA 7B preentrenado: https://huggingface.co/qwbu/univla-7b
- UniVLA 7B preentrenado solo en BridgeV2: https://huggingface.co/qwbu/univla-7b-bridge-pt
- UniVLA 7B preentrenado solo en Ego4D: https://huggingface.co/qwbu/univla-7b-human-pt
- UniVLA afinado en LIBERO: https://huggingface.co/qwbu/univla-7b-224-sft-libero
- UniVLA afinado en CALVIN: https://huggingface.co/qwbu/univla-7b-224-sft-calvin
- UniVLA afinado en R2R: https://huggingface.co/qwbu/univla-7b-224-sft-r2r
- UniVLA afinado en SimplerEnv/BridgeV2: https://huggingface.co/qwbu/univla-7b-224-sft-simpler-bridge
- Backbone Prismatic: https://huggingface.co/TRI-ML/prismatic-vlms/tree/main/prism-dinosiglip-224px%2B7b
- Página de demo: próximamente (según la model card)
