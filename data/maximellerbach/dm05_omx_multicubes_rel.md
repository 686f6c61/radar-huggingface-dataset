# maximellerbach/dm05_omx_multicubes_rel

## Resumen

El modelo `maximellerbach/dm05_omx_multicubes_rel` es un fine-tuning del modelo base Dexmal/DM05, un Vision-Language-Action (VLA) diseñado para control robótico. Desarrollado por Maxime Ellerbach, este modelo se ha entrenado específicamente para la tarea de recoger cubos y colocarlos en una zona azul, utilizando el framework LeRobot. El modelo condiciona sobre observaciones de cámara (muñeca y superior), estado del robot e instrucciones en lenguaje natural para predecir acciones continuas mediante un experto de acción basado en flow-matching.

Con 5.157.859.728 parámetros (aproximadamente 5,16 mil millones), este modelo representa una aplicación práctica de los VLA en robótica de manipulación. Su relevancia radica en que demuestra cómo un modelo base de propósito general puede adaptarse a tareas específicas con un dataset relativamente pequeño (176 episodios), lo que lo convierte en un ejemplo útil para desarrolladores que buscan implementar políticas robóticas personalizadas. El modelo se distribuye bajo licencia Gemma y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con doble backbone: VLM + Action Expert (flow-matching) |
| Parametros totales | 5.157.859.728 (5,16 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (probablemente ingles, no especificado) |
| Licencia | Gemma |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DM05 de Dexmal, que combina un modelo de lenguaje y vision (VLM) para la comprensión multimodal con un experto de acción especializado para el control de alta precisión. Según la documentación de DeepWiki, DM05 utiliza un enfoque de doble backbone: el VLM procesa las observaciones visuales y las instrucciones de lenguaje, mientras que el experto de acción genera secuencias de acciones continuas mediante flow-matching. Esta separación permite una comprensión semántica robusta y un control fino simultáneamente.

El entrenamiento se realizó con LeRobot (versión 0.6.2) sobre el dataset `maximellerbach/omx_multicubes`, que contiene 176 episodios y 137.392 frames a 30 FPS. La configuración de entrenamiento incluye 10.000 pasos, batch size de 4, optimizador AdamW con learning rate de 2,5e-05 y semilla 1000. El modelo se fine-tuneó a partir de los pesos preentrenados de Dexmal/DM05, lo que permite transferir capacidades generales de manipulación y adaptarlas a la tarea específica de recoger y colocar cubos.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones (posición y orientación) para el robot OMX Follower.
- Comprensión multimodal: procesa imágenes de dos cámaras (muñeca y superior) junto con el estado del robot y una instrucción en lenguaje natural.
- Ejecución de tareas de pick-and-place: entrenado específicamente para recoger cubos y colocarlos en una zona designada.
- Seguimiento de instrucciones en lenguaje: interpreta la tarea "pick all the cubes and place them one by one in the blue square".
- Generación de acciones en tiempo real: predice chunks de acción continua, adecuado para control en bucle cerrado.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo entrenamiento y despliegue.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios: el modelo puede controlar un brazo robótico para clasificar objetos (cubos) en zonas específicas, útil en entornos de investigación y prototipado.
- Desarrollo de políticas robóticas personalizadas: sirve como punto de partida para fine-tuning en nuevas tareas de manipulación, ya que su arquitectura VLA permite adaptarse con datasets pequeños.
- Evaluación de algoritmos de imitación: investigadores pueden usar este modelo como referencia para comparar técnicas de aprendizaje por imitación en robótica.
- Demostraciones educativas: permite a estudiantes y desarrolladores experimentar con control robótico basado en visión y lenguaje sin necesidad de entrenar desde cero.
- Integración en líneas de producción flexibles: aunque requiere hardware específico, el modelo podría adaptarse a tareas de picking en entornos controlados con supervisión humana.
- Benchmarking de modelos VLA: al ser un fine-tune de DM05, puede utilizarse para medir el rendimiento de la arquitectura base en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación para esta política. No se dispone de métricas como tasa de éxito en el robot real.

## Requisitos de hardware

- VRAM estimada: con 5,16 mil millones de parámetros, se estima que en FP16 se necesitan aproximadamente 10-12 GB de VRAM para inferencia. En FP32, alrededor de 20 GB. Sin embargo, el tamaño del repositorio (55,9 GB) sugiere que los pesos se almacenan en FP32 o con múltiples archivos.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3080/3090, RTX 4090, A10) sería suficiente para inferencia en FP16. Para entrenamiento, se recomienda una GPU con 24 GB o más (A100, RTX 4090).
- Compatibilidad con GPUs de consumo: sí, es posible ejecutar el modelo en GPUs de gama alta para consumidores, como RTX 3090 o RTX 4090, siempre que se utilice FP16 o cuantización (aunque no se especifican cuantizaciones disponibles).
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que proporciona scripts de rollout y entrenamiento. Se puede ejecutar en local con `lerobot-rollout` o integrarse en pipelines personalizados con PyTorch.
- Latencia y throughput: no se proporcionan datos específicos. Dado el tamaño del modelo y la necesidad de procesar dos cámaras en tiempo real, se espera una latencia de decenas de milisegundos en GPUs modernas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos VLA en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| dm05_omx_multicubes_rel (este) | 5,16 B | VLA fine-tune para tarea específica | Gemma | Hugging Face |
| Dexmal/DM05 (base) | No especificado | VLA generalista | Gemma | Hugging Face |
| OpenVLA | 7 B | VLA generalista | Apache 2.0 | Hugging Face |
| RT-2 | 55 B | VLA generalista | No abierto | No disponible |

Nota: los datos de OpenVLA y RT-2 son de conocimiento general y no se han verificado en esta búsqueda. La comparación se limita a parámetros y disponibilidad, no a rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en un dataset específico (cubos y una zona azul), puede no generalizar a otros objetos, colores o disposiciones del entorno.
- Riesgo de alucinación: en robótica, una predicción incorrecta puede causar movimientos peligrosos. El modelo no ha sido evaluado en entornos no controlados.
- Limitaciones de contexto: la tarea está fijada a una instrucción concreta; no se ha probado con instrucciones variadas o tareas de largo horizonte.
- Restricciones de licencia: la licencia Gemma impone restricciones de uso comercial y requiere cumplir con sus términos. Es necesario revisar la política de uso aceptable.
- Dependencia del hardware: requiere cámaras específicas (wrist y top) y un robot OMX Follower; no es portable a otros robots sin reentrenamiento.
- Sin evaluación en robot real: la model card indica que no hay resultados de evaluación, por lo que el rendimiento real no está verificado.

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/maximellerbach/dm05_omx_multicubes_rel)
- [Hugging Face - dataset](https://huggingface.co/datasets/maximellerbach/omx_multicubes)
- [GitHub - OpenDM (Dexmal)](https://github.com/dexmal/opendm)
- [DeepWiki - Arquitectura DM05](https://deepwiki.com/dexmal/opendm/2-dm05-model-architecture)
- [Perfil de Maximellerbach en GitHub](https://github.com/Maximellerbach)
