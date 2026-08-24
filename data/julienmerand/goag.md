# JulienMERAND/GOAG

## Resumen

GOAG (Generative and Object-Agnostic Grasp Planner) es un modelo de aprendizaje profundo generativo diseñado para la planificación de agarres robóticos diestros. Desarrollado por investigadores del CEA-List (Université Paris-Saclay) y el LIRIS (École Centrale de Lyon), el modelo se presentó en la conferencia IROS 2026. GOAG aprende una representación latente compacta de la distribución de contacto de un gripper específico, permitiendo muestrear configuraciones de agarre válidas sin depender de datos de entrenamiento específicos de cada objeto. La clave de su enfoque es que las características del objeto solo se introducen en la inferencia, lo que le permite recuperar áreas de contacto admisibles compatibles con las capacidades del gripper.

El modelo se basa en una arquitectura de autoencoder variacional condicional (CVAE), aunque en la estructura del repositorio se observan también variantes con PointNet. Está diseñado para operar con múltiples manos robóticas, incluyendo Allegro, Barrett y ShadowHand, y se entrena con varios datasets de agarre como DexGrab, DexGraspNet, MultiDex, RealDex y UniDexGrasp. El repositorio de HuggingFace tiene un tamaño de 2,6 GB y la licencia es CC-BY-4.0. La relevancia actual radica en la necesidad de planificadores de agarre robustos y generalizables para robots con manos de alta complejidad, superando limitaciones de métodos que requieren datos específicos por objeto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CVAE (Conditional Variational Autoencoder) con variantes PointNet (según logs) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (documentación) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

GOAG se basa en un autoencoder variacional condicional (CVAE) que aprende una distribución latente de los puntos de contacto de un gripper concreto. El modelo se entrena para codificar la geometría de contacto del gripper y decodificar configuraciones de agarre completas. La clave es que el objeto no se incluye en la fase de entrenamiento, sino que se inyecta como condición durante la inferencia, lo que permite al modelo generalizar a objetos nuevos sin necesidad de datos de entrenamiento específicos. En el repositorio se observan también variantes con PointNet, lo que sugiere una posible arquitectura híbrida para procesar nubes de puntos. El entrenamiento se realiza con datos de múltiples datasets de agarre (DexGrab, DexGraspNet, MultiDex, RealDex, UniDexGrasp) y se organiza en directorios separados por mano robótica y tipo de modelo. No se dispone de información sobre el número de tokens, composición exacta del dataset ni técnicas de RLHF/DPO, ya que es un modelo de robótica y no un LLM.

## Capacidades

- Generación de configuraciones de agarre para manos robóticas diestras (Allegro, Barrett, ShadowHand).
- Planificación de agarre agnóstica al objeto: funciona con objetos no vistos durante el entrenamiento.
- Aprendizaje de la distribución de contacto específica de un gripper, permitiendo muestrear agarres válidos.
- Integración con nubes de puntos como entrada de inferencia (probablemente mediante PointNet).
- Soporte para múltiples datasets de agarre (DexGrab, DexGraspNet, MultiDex, RealDex, UniDexGrasp).
- No tiene capacidades de tool calling, agentes ni razonamiento simbólico; es un modelo puramente generativo para robótica.

## Casos de uso

- Robótica industrial: planificar agarres para la manipulación de piezas variadas en líneas de ensamblaje o desmontaje. GOAG puede generar agarres válidos para objetos no vistos, reduciendo el tiempo de configuración.
- Robots de asistencia doméstica: generar agarres para objetos cotidianos (tazas, botellas, herramientas) en entornos no estructurados, gracias a su capacidad de generalización.
- Teleoperación robótica: asistir a un operador humano sugiriendo configuraciones de agarre viables para una mano robótica en tiempo real.
- Simulación y entrenamiento de políticas: generar agarres sintéticos para entrenar otros modelos de control o aprendizaje por refuerzo, acelerando la exploración de espacios de contacto.
- Investigación en manipulación: servir como herramienta para estudiar la distribución de contactos de gripper y comparar estrategias de agarre en diferentes datasets.
- Automatización en logística: planificar agarres de paquetes o productos de formas irregulares en tareas de picking, mejorando la tasa de éxito en sistemas de recogida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento (como tasa de éxito, precisión de contacto o comparaciones con otros modelos) ni tablas de evaluación.

## Requisitos de hardware

- No se dispone de información sobre VRAM, GPU recomendadas ni latencia.
- El tamaño del repositorio es de 2,6 GB, lo que sugiere que los pesos del modelo pueden caber en una GPU de consumo medio (por ejemplo, RTX 3060 o superior) si se usa una cuantización estándar, pero no se confirma.
- Al ser un modelo de robótica, se puede ejecutar en sistemas con GPU NVIDIA y CPU estándar, pero no hay datos de rendimiento.
- No se mencionan opciones de despliegue específicas como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. El código está disponible en GitHub (https://github.com/CEA-LIST/GOAG) y se espera que se ejecute mediante el framework de aprendizaje profundo correspondiente.

## Comparativa con modelos similares

No hay información comparativa disponible en la documentación proporcionada. Se podrían considerar otros planificadores de agarre como ContactNetGrasp o GraspNet-1Billion, pero no se dispone de datos de comparación con GOAG en términos de rendimiento, parámetros o contexto.

## Limitaciones y advertencias

- El modelo está diseñado para un conjunto específico de manos robóticas (Allegro, Barrett, ShadowHand); puede no generalizar a otros grippers sin reentrenamiento.
- La dependencia de la calidad y diversidad de los datos de entrenamiento (provenientes de datasets como DexGrab, etc.) puede limitar su rendimiento en objetos muy diferentes a los vistos.
- No se dispone de información sobre sesgos o alucinaciones, pero al ser un modelo generativo, existe el riesgo de producir agarres inválidos en configuraciones extremas.
- La licencia cc-by-4.0 permite uso comercial, pero requiere atribución y no garantiza la no existencia de patentes o restricciones adicionales de los datasets de entrenamiento.
- Para producción, es necesario evaluar el modelo con los datos de validación específicos de la aplicación, ya que no se han publicado benchmarks públicos.

## Enlaces

- [HuggingFace: JulienMERAND/GOAG](https://huggingface.co/JulienMERAND/GOAG)
- [Página del proyecto](https://cea-list.github.io/goagweb/)
- [arXiv:2608.19759](https://arxiv.org/abs/2608.19759)
- [Repositorio GitHub](https://github.com/CEA-LIST/GOAG)
- [Perfil de Julien Mérand en HuggingFace](https://huggingface.co/JulienMERAND)
