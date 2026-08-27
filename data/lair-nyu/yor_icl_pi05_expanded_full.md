# lair-nyu/yor_icl_pi05_expanded_full

## Resumen

Este modelo es un checkpoint de entrenamiento del sistema robótico pi0.5, desarrollado por el laboratorio LAIR de la Universidad de Nueva York (LAIR NYU). Se trata de un baseline de pi0.5 entrenado sobre un conjunto de tareas expandido, denominado `yor_icl_pi05_expanded_full`, con el objetivo de estudiar capacidades de aprendizaje en contexto (in-context learning) para manipulación robótica. El checkpoint corresponde al paso 25000 de entrenamiento y contiene únicamente los pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), sin el estado del optimizador.

pi0.5 es un modelo visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, que extiende el modelo π0 mediante co-entrenamiento con datos heterogéneos para mejorar la generalización en entornos abiertos. Este checkpoint concreto se ha entrenado con la librería openpi sobre el dataset `icl-dataset`, y su relevancia radica en servir como referencia para investigar si un modelo VLA puede adaptarse a nuevas tareas mediante ejemplos en contexto, sin necesidad de fine-tuning específico. El repositorio tiene un tamaño de 12,4 GB, lo que sugiere pesos en precisión mixta (BF16/FP32), aunque no se especifican los parámetros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, backbone pi0.5 |
| Parametros totales | no disponible (el repositorio relacionado `pi05-yor-pnp-70k` indica 4B, pero no se confirma para este checkpoint) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente BF16/FP32) |
| Idiomas soportados | no disponible (modelo multimodal: vision, lenguaje y acciones) |
| Licencia | no disponible |
| Formato de pesos | safetensors (params/ y assets/) |

## Arquitectura y entrenamiento

pi0.5 es un modelo VLA que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones. La arquitectura se basa en el modelo π0 original, pero incorpora co-entrenamiento sobre múltiples conjuntos de datos heterogéneos (teleoperación, datos de internet, etc.) para mejorar la generalización a escenarios del mundo real. El backbone es un transformer que procesa secuencias de tokens de imagen, texto y acciones continuas, con un mecanismo de decodificación de acciones de alta frecuencia.

El entrenamiento de este checkpoint se realizó con la librería openpi, utilizando el dataset `icl-dataset` (aparentemente orientado a in-context learning). El paso de checkpoint es 25000, y el conjunto de tareas se describe como "expandido" (`expanded_full`), lo que sugiere que se amplió el número de tareas o la diversidad de los datos respecto a un conjunto base. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se publica sin el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde este punto.

## Capacidades

- Control robótico end-to-end: el modelo genera acciones de articulación directamente a partir de observaciones visuales y instrucciones en lenguaje natural.
- Aprendizaje en contexto (in-context learning): el nombre del modelo (`icl`) sugiere que está entrenado para adaptarse a nuevas tareas mediante ejemplos proporcionados en la entrada, sin actualizar los pesos.
- Comprensión multimodal: integra visión (imágenes de cámaras) y lenguaje (instrucciones) para producir comandos de actuación.
- Generalización a tareas de manipulación: al estar entrenado sobre un conjunto expandido de tareas, busca transferir habilidades a escenarios no vistos.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, ni capacidades de razonamiento simbólico fuera del ámbito robótico.

## Casos de uso

- Investigación en generalización robótica: el modelo sirve como baseline para comparar métodos de in-context learning en robots, permitiendo evaluar si un VLA puede adaptarse a tareas nuevas con solo unos pocos ejemplos.
- Manipulación de objetos en entornos controlados: puede desplegarse en brazos robóticos para tareas como recoger, apilar o insertar piezas, usando instrucciones en lenguaje natural.
- Evaluación de co-entrenamiento: al ser un checkpoint intermedio (paso 25000), es útil para estudiar la dinámica de entrenamiento y el efecto del conjunto de datos expandido en el rendimiento.
- Desarrollo de sistemas de aprendizaje continuo: su capacidad de in-context learning lo hace candidato para experimentos donde el robot debe aprender nuevas destrezas sin reentrenamiento.
- Benchmarking de modelos VLA: puede utilizarse como referencia para comparar con otros modelos de control robótico en métricas de éxito de tarea y generalización.
- Simulación robótica: integrable en entornos de simulación (por ejemplo, MuJoCo o Isaac Sim) para validar políticas antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de rendimiento, y no se encontraron evaluaciones externas de este checkpoint concreto. El paper de pi0.5 (arXiv:2504.16054) reporta resultados generales del modelo base, pero no de este entrenamiento específico.

## Requisitos de hardware

- VRAM estimada: no disponible con exactitud. Dado el tamaño del repositorio (12,4 GB) y que los pesos están en safetensors, se estima que la inferencia requiere al menos 16 GB de VRAM en BF16, y posiblemente más si se usa FP32.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) sería suficiente para inferencia en BF16. Para entrenamiento o fine-tuning se necesitarían GPUs de mayor capacidad (A100, H100).
- Compatibilidad con GPUs de consumo: sí, es probable que quepa en una RTX 4090 (24 GB) si se usa cuantización a 8 bits o 4 bits, aunque no se han publicado versiones cuantizadas.
- Opciones de despliegue: el modelo está diseñado para usarse con openpi, que soporta inferencia en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de acción robótica, no un LLM generativo estándar.
- Latencia y throughput: no disponibles. Dependerá del hardware y del número de cámaras y frecuencia de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| pi0.5 (Physical Intelligence) | ~4B (estimado) | no disponible | VLA generalista | no disponible |
| OpenVLA | 7B | no disponible | VLA open-source | MIT |
| RT-2 (Google) | 55B | no disponible | VLA propietario | no disponible |

Este checkpoint se diferencia de OpenVLA y RT-2 por su énfasis en in-context learning y por estar basado en pi0.5, que utiliza co-entrenamiento con datos heterogéneos. No se dispone de comparaciones cuantitativas directas.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al ser un modelo entrenado con datos robóticos específicos, puede no generalizar a entornos muy distintos de los de entrenamiento.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir comandos de actuación no válidos o inseguros si se usa sin supervisión.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero los VLA suelen trabajar con ventanas cortas de observaciones (imágenes recientes).
- Licencia no disponible: no se indica si el modelo puede usarse comercialmente; se recomienda contactar con LAIR NYU antes de cualquier uso productivo.
- El checkpoint no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde este punto exacto.
- No se proporcionan métricas de seguridad ni certificaciones para despliegue en robots físicos; su uso en entornos reales requiere validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_expanded_full
- Perfil de LAIR NYU: https://huggingface.co/lair-nyu/models
- Modelo relacionado (pi05-yor-pnp-70k): https://huggingface.co/lair-nyu/pi05-yor-pnp-70k
- Paper de pi0.5 (arXiv): https://arxiv.org/html/2504.16054v1
- PDF del paper: https://www.pi.website/download/pi05.pdf
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
