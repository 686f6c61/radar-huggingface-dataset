# DeepCybo/PhysBrain1.5-8B

## Resumen

PhysBrain 1.5-8B es un modelo vision-language (VLM) adaptado para interacción física, desarrollado por DeepCybo en colaboración con la Academia Zhongguancun y el Instituto de Inteligencia Artificial de Zhongguancun. Parte del modelo base Qwen/Qwen3-VL-8B-Instruct e introduce tokens dedicados para acciones y estados visuales, lo que le permite unificar comprensión del mundo, generación de acciones y predicción de estados futuros en un único backbone autoregresivo. Con aproximadamente 8.900 millones de parámetros y pesos en formato safetensors, está orientado a aplicaciones de robótica, inteligencia encarnada y razonamiento espacial.

El modelo implementa el bucle físico cerrado de interacción agente-entorno: observación, razonamiento, acción y nueva observación. En lugar de emplear cabezas específicas por tarea, formula las respuestas espaciales, las trayectorias del efector final y los estados futuros como tokens discretos, entrenados conjuntamente bajo el objetivo de predicción del siguiente token. Según la información del autor, alcanza una puntuación global de 72,5 sobre 100 en un conjunto de 28 benchmarks de inteligencia espacial encarnada y planificación, situándose en primera posición entre los modelos open-source evaluados. La licencia y la longitud de contexto no están documentadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) basado en transformer; fine-tuning de Qwen3-VL-8B-Instruct con tokens de acción y estado visual |
| Parametros totales | 8.903.438.576 (~8.9B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos sin cuantizar en safetensors) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 17.8 GB |

## Arquitectura y entrenamiento

PhysBrain 1.5 parte de Qwen3-VL-8B-Instruct, un modelo multimodal con arquitectura de transformer que combina un codificador de visión con un decoder de lenguaje. Sobre esta base, se extiende con dos conjuntos de tokens especiales: tokens ActionPiece para codificar acciones discretas del efector final y tokens de estado visual para representar futuros estados del mundo, como imagen RGB, mapa de profundidad y máscara del robot. Todas las modalidades, incluidas las respuestas de lenguaje, las salidas espaciales, las trayectorias y los estados futuros, se integran en un único vocabulario discreto y se aprenden mediante un objetivo compartido de predicción del siguiente token, sin cabezas específicas de tarea. Esta decisión de diseño favorece la generalización entre distintos entornos y configuraciones de brazos robóticos, ya que un único checkpoint puede manejar varios controladores.

El proceso de entrenamiento no se detalla en la model card. En la documentación del proyecto PhysBrain se indica que el backbone VLM se obtiene mediante ajuste fino supervisado (SFT) sobre datos egocéntricos humanos (E2E-3M) mezclados con datos generales de visión-lenguaje, pero esa referencia corresponde al proyecto general y no se especifica si PhysBrain 1.5 sigue exactamente el mismo protocolo. No hay información sobre el número de tokens, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Comprensión encarnada: percepción visual-espacial fundamental, comprensión espacial 3D y multivista, cognición encarnada, razonamiento y planificación, grounding espacial, señalización y affordance, y razonamiento de trazas visuales y trayectorias.
- Predicción de acción: predice el siguiente chunk de acción del efector final como una secuencia compacta de tokens ActionPiece. El codebook y el vocabulario de acción son unificados y compartidos entre diversas configuraciones de control y brazos robóticos, lo que permite que un solo modelo generalista controle distintas plataformas.
- Predicción de estado futuro: dado el estado visual actual y una instrucción de tarea, predice un posible estado futuro del mundo representado como imagen RGB, mapa de profundidad y máscara del robot, con horizonte temporal de aproximadamente un segundo.
- Capacidades multilingües: inglés y chino, que son los idiomas declarados de la model card.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la información proporcionada.
- Modo de pensamiento o capacidades de audio: no disponible.

## Casos de uso

- Control de robots manipuladores: el modelo genera trayectorias del efector final a partir de una instrucción y una observación visual. Es adecuado para entornos de manipulación donde el robot necesita planificar movimientos y adaptarse a nuevas configuraciones gracias a su codebook unificado.
- Navegación móvil con grounded espacial: predice waypoints para evitar obstáculos y localizar objetos en el espacio. Puede integrarse en sistemas de navegación de robots móviles o brazos manipuladores en entornos desconocidos.
- Percepción y gestión de almacenes o logística: realiza estimación de distancias métricas, cálculo de áreas de habitaciones y localización de regiones de interés. Sirve para tareas de inventario, recogida de objetos y almacenamiento automatizado.
- Simulación de world models: la capacidad de predicción de estado futuro (RGB, profundidad y máscara) permite anticipar el resultado de una acción antes de ejecutarla, lo que resulta útil para entrenar políticas con aprendizaje por refuerzo o para generar datos sintéticos de entrenamiento.
- Asistencia en teleoperación y realidad aumentada: el modelo puede describir acciones pasadas, predecir futuros contrafácticos y descomponer tareas en pasos. Esto facilita el trabajo de operadores humanos en tareas de manipulación remota o en sistemas de asistencia en entornos industriales.
- Evaluación comparativa en investigación de inteligencia encarnada: con una puntuación global de 72,5 en 28 benchmarks de planificación y espacialidad, sirve como referencia para evaluar capacidades de razonamiento espacial en modelos vision-language, tanto en investigación académica como en desarrollo de robótica.
- Manipulación con contacto: las trazas de manipulación ricas en contacto permiten al modelo generar trayectorias que consideran restricciones de contacto, lo que facilita el control de pinzas y manos robóticas en tareas de ensamblaje o agarre.

## Benchmarks y rendimiento

El autor informa de que PhysBrain 1.5-8B obtiene una puntuación global de 72,5 sobre 100 en un conjunto de 28 benchmarks de inteligencia espacial encarnada y planificación. El modelo se sitúa en primer lugar entre los modelos open-source evaluados y resulta comparable a referencias propietarias. Los valores individuales de cada benchmark no están disponibles en texto; la tabla desglosada se presenta como una imagen en la model card.

| Categoría | Puntuación |
|---|---|
| Percepción visual-espacial fundamental | no disponible |
| Comprensión espacial 3D y multivista | no disponible |
| Cognición encarnada, razonamiento y planificación | no disponible |
| Grounding espacial, señalización y affordance | no disponible |
| Razonamiento de trazas visuales y trayectorias | no disponible |
| Overall (media sin ponderar de los 28 benchmarks) | 72,5 / 100 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Los pesos originales en safetensors ocupan 17.8 GB. En bfloat16 o fp16, la inferencia requiere una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para acomodar los pesos y el overhead de atención y caché KV.
- No se proporcionan cuantizaciones oficiales. Si se aplicara una cuantización genérica 4-bit, los pesos ocuparían aproximadamente entre 5.5 y 6 GB, mientras que una cuantización 8-bit los situaría en torno a 9 GB, pero ninguna de estas opciones está documentada ni validada por el autor.
- Para GPUs de consumo con 12-16 GB de VRAM, no hay garantía de funcionamiento sin cuantización adicional o reducción de la ventana de contexto.
- Opciones de despliegue: no documentadas. Dado que el modelo hereda la arquitectura de Qwen3-VL, podría resultar compatible con frameworks como vLLM, TGI o llama.cpp si se adaptan los pesos, pero no se ha verificado. No se dispone de información sobre latencia ni throughput.

## Comparativa con modelos similares

| Modelo | PhysBrain 1.5-8B | Qwen3-VL-8B-Instruct |
|---|---|---|
| Parámetros | ~8.9B | ~8.9B |
| Longitud de contexto | no disponible | no disponible |
| Especialidad | VLM encarnado para robótica y razonamiento espacial | VLM general multimodal |
| Capacidades adicionales | Tokens de acción, predicción de trayectorias y estado futuro | No documenta tokens de acción |
| Licencia | no disponible | no disponible |
| Disponibilidad | HuggingFace (DeepCybo/PhysBrain1.5-8B) | HuggingFace (Qwen/Qwen3-VL-8B-Instruct) |

No se disponen de comparativas cuantitativas contra otros modelos de la misma categoría en la información proporcionada. La única referencia comparable es el modelo base del que parte.

## Limitaciones y advertencias

- Licencia no disponible: el autor no ha especificado los términos de uso, lo que supone un riesgo legal para despliegues comerciales o de producción sin consulta previa.
- Idiomas limitados: solo inglés y chino; no hay soporte documentado para otros idiomas.
- Longitud de contexto no documentada: se desconoce la ventana de contexto, lo que dificulta la planificación de tareas que requieran entradas largas o historiales extensos.
- Sin soporte documentado de tool calling, function calling ni agentes de múltiples pasos; no se debe asumir que funcione en esos escenarios.
- Los resultados de benchmarks son reportados por el autor y no han sido verificados de forma independiente. La tabla detallada no está disponible en texto y podría presentar sesgo en la evaluación.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en entornos no vistos o en predicciones de estados futuros con incertidumbre.
- El uso de tokens de acción y estado visual requiere adaptación a cada plataforma robótica. No se proporcionan los codebooks ni los decodificadores necesarios para convertir los tokens en comandos motores, lo que limita la integración directa en sistemas de control.

## Enlaces

- HuggingFace: https://huggingface.co/DeepCybo/PhysBrain1.5-8B
- Proyecto PhysBrain (documentación y arquitectura): https://zgc-embodyai.github.io/PhysBrain/
