# B111ue/Stereo-CoRE

## Resumen

Stereo-CoRE es una política compartida estrictamente descentralizada para manipulación multi-robot y multi-tarea, desarrollada por B111ue. El modelo aborda el problema de entrenar un único sistema de control capaz de operar varios robots en distintas tareas sin depender de identificadores de agente, comunicación entre unidades, cámaras globales ni observaciones de compañeros. Cada robot utiliza únicamente su propia imagen RGB-D de muñeca y su estado articular (qpos).

La arquitectura combina codificadores congelados —DINOv3-B/16 para RGB y DeFM-S/14 para profundidad— con un bloque ACT (Action Chunking Transformer) compuesto por 4 capas de codificador y 7 de decodificador, que genera secuencias de acción de longitud 100. La política se entrena sobre el dataset RoboFactory-5Task-RGBD-Decentralized, que cubre cinco tareas: LiftBarrier, CameraAlignment, ThreeRobotsStackCube, LongPipelineDelivery y TakePhoto. El método principal introduce un router local de consulta de acciones entrenado mediante divergencia KL contra una "capacidad contrafáctica" de los expertos, lo que permite seleccionar expertos realmente competentes para el rol de acción local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con codificadores congelados DINOv3-B/16 (RGB) y DeFM-S/14 (profundidad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robotico) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

Stereo-CoRE implementa una política compartida descentralizada para manipulación robotica. Cada robot recibe como entrada una imagen RGB-D de muñeca de 640x480, con la profundidad decodificada en milímetros desde una escala métrica nativa. Los codificadores DINOv3-B/16 y DeFM-S/14 están congelados durante el entrenamiento, y sus salidas se alinean en rejillas de parches de 30x40. Se añade una atención cruzada RGB-profundidad con sesgo relacional aprendido en 2 dimensiones para fusionar las modalidades.

El núcleo de decisión es un ACT con 4 capas de codificador latente y 7 capas de decodificador, que predice trozos de acción de longitud 100. La política es compartida entre todas las tareas, lo que significa que un único conjunto de pesos gobierna los robots de las cinco tareas. El entrenamiento se realiza sobre el dataset RoboFactory-5Task-RGBD-Decentralized.

El método principal, denominado Stereo-CoRE, acopla un router local de consulta de acciones con la capacidad contrafáctica de los expertos. Durante una actualización programada, cada experto predice el mismo trozo de acción de verdad fundamental; su error de acción real define un objetivo de capacidad suave. La divergencia `KL(q_capability || p_router)` entrena al router para seleccionar expertos que son realmente competentes para el rol de acción local actual. En la versión publicada se utiliza `capability_weight=0.05` y se desactivan las auxiliares de relación, especialización y anclaje. No se menciona el uso de RLHF ni DPO, al tratarse de aprendizaje por imitación.

## Capacidades

- Manipulación multi-robot: la política compartida puede controlar robots en tareas que involucran de 2 a 4 agentes, como LiftBarrier (2 robots), CameraAlignment (3), ThreeRobotsStackCube (3), LongPipelineDelivery (4) y TakePhoto (4).
- Descentralización estricta: cada robot usa solo su propia observación de muñeca RGB-D y su qpos. El despliegue no requiere ID de tarea, ID de agente, lenguaje, comunicación entre robots, cámara global, observación de compañeros, cámara derecha ni FastFS.
- Fusión multimodal RGB-profundidad: alinea características de dos codificadores congelados mediante atención con sesgo relacional 2D, sobre rejillas de 30x40 parches.
- Predicción de acciones en trozos largos: genera secuencias de acción de longitud 100, lo que permite movimientos coordinados y estables.
- Generalización entre tareas: un único conjunto de pesos cubre cinco tareas distintas del entorno RoboFactory, sin necesidad de reinicializar por tarea.
- Sin capacidades de lenguaje, tool calling ni razonamiento simbólico: el modelo está diseñado exclusivamente para control motor basado en visión.

## Casos de uso

- Ensamblaje colaborativo en línea de producción: con la tarea LongPipelineDelivery, cuatro robots comparten una política que coordina el transporte de piezas a lo largo de una línea, usando solo sus propias cámaras de muñeca. El modelo es adecuado porque no necesita comunicación centralizada ni identificadores de tarea, simplificando el despliegue en entornos con robots heterogéneos.
- Apilamiento de cubos en almacenes: la tarea ThreeRobotsStackCube implica que tres robots manipulen cubos de forma coordinada. El modelo puede aprender a compartir estrategias de manipulación sin depender de una cámara global, lo que facilita su integración en sistemas con sensores locales.
- Alineación de cámaras en estaciones de inspección: CameraAlignment requiere que tres robots posicionen cámaras con precisión. La política compartida permite reutilizar el conocimiento entre robots, reduciendo el tiempo de calibración y el coste de entrenamiento específico por robot.
- Levantamiento de barreras automatizado: en LiftBarrier, dos robots levantan y colocan barreras. El modelo puede ejecutar esta tarea con observaciones locales de muñeca, lo que es útil en entornos industriales donde la comunicación entre robots es limitada o no deseada.
- Toma de fotografías en procesos de documentación: TakePhoto involucra cuatro robots capturando imágenes de un objeto. La capacidad de generar secuencias de acción de longitud 100 permite planificar movimientos suaves de cámara, mientras que la descentralización evita cuellos de botella de red.
- Investigación en aprendizaje por imitación descentralizada: el modelo sirve como referencia reproducible para estudiar políticas compartidas en robótica multi-robot. Los investigadores pueden usar el paquete de reproducibilidad para comparar variantes del método, gracias al registro de configuraciones y resultados incluido en `MODEL_REGISTRY.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque se menciona que `MODEL_REGISTRY.json` enlaza cada fila del documento "All-5" con un checkpoint público, su SHA-256, estadísticas de normalización, configuración exacta, resultados con semilla congelada y protocolo de evaluación, los valores numéricos concretos no se proporcionan en la información suministrada.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El repositorio tiene un tamaño de 14 GB, lo que sugiere que los pesos sin cuantificar pueden requerir una GPU con memoria considerable, pero no se especifican requisitos oficiales.
- GPU recomendadas: no disponible. Dado el uso de codificadores de visión congelados (DINOv3-B/16 y DeFM-S/14) y un ACT relativamente pequeño, es probable que una GPU de gama alta de consumo (por ejemplo, RTX 4090, 24 GB) sea suficiente, pero esto no está confirmado.
- Compatibilidad con GPUs de consumo: no especificada por el autor.
- Opciones de despliegue: no disponibles en la información. El repositorio incluye código y documentación, pero no se mencionan integraciones con frameworks de inferencia como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos con otros modelos de robótica o imitación. Tampoco se mencionan alternativas de la misma categoría con las que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni evaluaciones numéricas en la información disponible, por lo que no es posible verificar el rendimiento del modelo en tareas concretas.
- El modelo depende estrictamente de observaciones RGB-D de muñeca a 640x480 con profundidad métrica nativa. No soporta otros sensores ni configuraciones de entrada sin modificar los codificadores.
- La descentralización estricta puede limitar la coordinación en tareas que requieran información global o comunicación explícita entre robots, ya que el modelo no utiliza observaciones de compañeros ni cámaras globales.
- La generalización a entornos distintos del dataset RoboFactory no está documentada. El entrenamiento se realiza únicamente sobre las cinco tareas incluidas, y el comportamiento fuera de ese dominio es desconocido.
- La licencia MIT permite uso comercial, pero el autor no proporciona garantías de seguridad, robustez ni idoneidad para aplicaciones en producción.
- No se mencionan evaluaciones de sesgos ni de riesgos de alucinación, lo que es relevante si se considera el uso en entornos físicos donde las predicciones incorrectas pueden causar daños.
- El paquete de reproducibilidad depende de una estructura de repositorios y documentación externa; si los enlaces dejan de estar disponibles, la reproducibilidad puede verse comprometida.

## Enlaces

- HuggingFace: https://huggingface.co/B111ue/Stereo-CoRE
- Código: https://github.com/YananZHOU5555/Stereo-CoRE
- Dataset: https://huggingface.co/datasets/B111ue/RoboFactory-5Task-RGBD-Decentralized
- Modelos: https://huggingface.co/B111ue/Stereo-CoRE
