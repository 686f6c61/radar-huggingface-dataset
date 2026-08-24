# ajay-kumar-sandula/your_repo_id

## Resumen

Este modelo es un fine-tune de `lerobot/pi0_base`, la política fundacional de robótica Vision-Language-Action (VLA) desarrollada por Physical Intelligence. El ajuste fino ha sido realizado por Sandula Ajay Kumar, investigador del Indian Institute of Science (IISc) de Bangalore, utilizando el framework LeRobot de Hugging Face. El modelo resultante está especializado en una tarea concreta de manipulación robótica: recoger una moneda blanca y colocarla en el centro de un cuadrado magenta translúcido, operando sobre un robot de tipo `so101_follower` con dos cámaras (frontal y de muñeca).

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de una política VLA de gran tamaño (4.028 millones de parámetros) sobre un dataset reducido (148 episodios, 50.556 frames) y su posterior despliegue en un robot real mediante LeRobot. Al estar basado en pi0, hereda la capacidad de interpretar instrucciones en lenguaje natural y controlar acciones de bajo nivel, pero adaptado a una tarea específica. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer multimodal (pi0) |
| Parametros totales | 4.028.019.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | no disponible (instrucciones en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/pi0_base`, que a su vez es la implementación de LeRobot de la política π₀ (Pi0) de Physical Intelligence. Pi0 es un modelo fundacional de robótica que combina un codificador de visión, un codificador de lenguaje y un decodificador de acciones, todo integrado en un transformer multimodal. El modelo base fue preentrenado con una gran cantidad de datos heterogéneos de robótica y después ajustado para tareas específicas.

El fine-tune se realizó con el framework LeRobot (versión 0.6.2) sobre un dataset propio llamado `combined_ttt_148_reencoded`, que contiene 148 episodios y 50.556 frames a 30 FPS. La configuración de entrenamiento incluyó 10.000 pasos, batch size de 16, optimizador AdamW con learning rate de 2.5e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitación supervisada (behavior cloning) sobre demostraciones. La tarea está definida por una instrucción en lenguaje natural: "pick up the white coin and place it in the center of the translucent magenta square".

## Capacidades

- Control de robot manipulador de 6 grados de libertad (acciones de posición y orientación).
- Percepción visual multimodal con dos cámaras: frontal y de muñeca, ambas con resolución 480x640.
- Interpretación de instrucciones en lenguaje natural (en inglés) para guiar la ejecución de la tarea.
- Ejecución de políticas de imitación en tiempo real sobre el robot `so101_follower` mediante LeRobot.
- Fine-tuning específico para una tarea de manipulación precisa (recoger y colocar un objeto pequeño).
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de recoger una moneda y colocarla en una posición exacta, lo que es útil en líneas de montaje o laboratorios de robótica.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo fine-tunear políticas VLA de gran tamaño con pocos datos (148 episodios) y evaluar su generalización.
- Desarrollo de robots de asistencia en entornos domésticos: la capacidad de seguir instrucciones en lenguaje natural y manipular objetos pequeños puede adaptarse a tareas como recoger objetos del suelo o colocarlos en bandejas.
- Benchmarking de políticas VLA en hardware real: el modelo puede usarse para comparar el rendimiento de pi0 fine-tuneado frente a otras políticas en la misma tarea, midiendo tasas de éxito y robustez.
- Educación y formación en robótica: permite a estudiantes e investigadores experimentar con un pipeline completo de entrenamiento y despliegue de un modelo de 4B parámetros en un robot de bajo coste.
- Prototipado rápido de nuevas tareas: dado que el fine-tuning es relativamente ligero (10k pasos), se puede adaptar a nuevas tareas con datasets pequeños, acelerando el ciclo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No hay datos de tasas de éxito, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado que el modelo tiene ~4.028 millones de parámetros, en FP16 ocuparía aproximadamente 8 GB de VRAM solo para los pesos, más overhead de activaciones y optimizador durante el entrenamiento. Para inferencia en FP16 se estima un mínimo de 10-12 GB de VRAM, pero no hay datos confirmados.
- GPU recomendadas: no se especifican. Por el tamaño, una GPU con al menos 16 GB de VRAM (RTX 4080/4090, A100 40GB) sería adecuada para inferencia con margen. Para entrenamiento, se necesitaría más VRAM (probablemente 24 GB o más) o usar técnicas de reducción de memoria.
- Compatibilidad con GPU de consumo: posiblemente sí, con cuantización (aunque no se ofrecen versiones GGUF/AWQ). En FP16, una RTX 4090 (24 GB) podría ejecutar la inferencia.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También se puede usar el framework de Hugging Face para inferencia, pero no se mencionan vLLM, Ollama ni TGI (no aplican a modelos de robótica).
- Latencia y throughput: no disponibles. Depende del hardware y de la frecuencia de control requerida (30 FPS de entrada).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune pi0) | 4.028 M | no aplica | Pick-and-place específico | Apache 2.0 | Hugging Face |
| lerobot/pi0_base | 4.028 M (aprox.) | no aplica | Política generalista VLA | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7.000 M | no aplica | Política VLA generalista | MIT | Hugging Face |

No se dispone de comparativas de rendimiento numéricas. Este modelo se diferencia de pi0_base en que está especializado en una tarea concreta, mientras que OpenVLA es una alternativa de tamaño mayor con licencia MIT. La elección entre ellos dependerá de la tarea y de los recursos de hardware.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea muy específica (recoger moneda blanca y colocarla en cuadrado magenta). No generaliza a otras tareas sin un nuevo fine-tuning.
- El dataset de entrenamiento es pequeño (148 episodios), lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminación, posición de objetos o distracciones.
- No se han reportado evaluaciones en robot real, por lo que el rendimiento real es desconocido.
- Al ser un modelo de robótica, no tiene capacidades de generación de texto ni razonamiento simbólico; las alucinaciones se manifiestan como acciones incorrectas o erráticas.
- La dependencia de dos cámaras fijas (frontal y muñeca) limita su uso a configuraciones de hardware específicas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base pi0 puede tener restricciones adicionales (aunque en este caso también es Apache 2.0).
- No se proporcionan cuantizaciones ni formatos optimizados para despliegue en edge; se requiere un entorno con GPU.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ajay-kumar-sandula/your_repo_id
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de pi0 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de pi0 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Dataset de entrenamiento: https://huggingface.co/datasets/combined_ttt_148_reencoded
- Perfil del autor en Hugging Face: https://huggingface.co/ajay-kumar-sandula
- Perfil del autor en Google Scholar: https://scholar.google.com/citations?user=qpNSKzsAAAAJ&hl=en
