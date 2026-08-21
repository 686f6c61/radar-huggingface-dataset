# a126-kitech/smolvla-openarm-2colors

## Resumen

El modelo `a126-kitech/smolvla-openarm-2colors` es un ajuste fino (fine-tune) de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros desarrollado originalmente por Hugging Face. Este checkpoint concreto ha sido entrenado por el equipo A126 KITECH (instituto de investigación surcoreano) sobre el dataset `a126-kitech/openarm-2colors-red-only`, que contiene demostraciones de manipulación robótica con un brazo OpenArm y objetos de dos colores, aunque el dataset utilizado se limita a la variante roja.

El modelo resuelve el problema del control robótico de manipulación a partir de observaciones visuales y comandos en lenguaje natural, con un coste computacional reducido que permite su despliegue en hardware de consumo. Su relevancia radica en que democratiza el acceso a políticas robóticas avanzadas, ya que el modelo base SmolVLA fue diseñado específicamente para ejecutarse en GPUs de gama media, a diferencia de alternativas como π0 u OpenVLA que requieren recursos sustancialmente mayores.

La arquitectura es la de SmolVLA, un VLA basado en transformer que integra un codificador de visión y un modelo de lenguaje, con un total de 450.046.176 parámetros. La licencia es Apache 2.0, lo que permite uso comercial y modificación. El repositorio tiene un tamaño de 1,2 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA compacto que combina un codificador de visión preentrenado con un modelo de lenguaje, generando acciones de control directamente a partir de imágenes y texto. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face con el objetivo de lograr un rendimiento competitivo en tareas de manipulación con un coste computacional reducido, permitiendo su ejecución en hardware de consumo.

Este checkpoint concreto ha sido ajustado mediante aprendizaje por imitación utilizando la librería LeRobot sobre el dataset `a126-kitech/openarm-2colors-red-only`, que contiene demostraciones de tareas de recogida y colocación de objetos rojos con un brazo robótico OpenArm. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento adicionales como RLHF o DPO. El entrenamiento se realizó con el framework LeRobot, como indica la etiqueta `library_name: lerobot`.

## Capacidades

- Control robótico de manipulación: genera comandos de acción (posición, velocidad, etc.) a partir de observaciones visuales y comandos de lenguaje.
- Percepción visual: procesa imágenes de cámara para localizar y manipular objetos.
- Comprensión de instrucciones en lenguaje natural: interpreta comandos como "coge el objeto rojo" para ejecutar la tarea correspondiente.
- Aprendizaje por imitación: el modelo ha sido entrenado para replicar demostraciones humanas, por lo que puede generalizar a variaciones ligeras de la tarea.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo entrenamiento, evaluación y despliegue.
- Eficiencia computacional: al tener solo 450M de parámetros, puede ejecutarse en GPUs de consumo, lo que facilita su uso en laboratorios y entornos educativos.

## Casos de uso

- Automatización de tareas de picking y placing en laboratorio: el modelo puede controlar un brazo OpenArm para recoger objetos rojos y colocarlos en una posición determinada, útil en entornos de investigación que requieren manipulación repetitiva.
- Clasificación de objetos por color en líneas de montaje: dado que el modelo ha sido entrenado con objetos rojos, puede integrarse en un sistema de clasificación donde se separen piezas de ese color, reduciendo la intervención manual.
- Base para fine-tuning en nuevas tareas: al ser un checkpoint ajustado sobre un dataset específico, sirve como punto de partida para adaptar el modelo a otros colores u objetos mediante aprendizaje por imitación con LeRobot.
- Educación en robótica: permite a estudiantes y desarrolladores experimentar con políticas VLA en hardware asequible, sin necesidad de GPUs de alta gama, facilitando el aprendizaje práctico.
- Investigación en generalización de VLA: el modelo puede utilizarse para estudiar cómo se comporta un VLA compacto ante variaciones de color, iluminación o posición de los objetos, contribuyendo al avance de la robótica de bajo coste.
- Prototipado rápido de soluciones robóticas: gracias a su tamaño reducido y licencia permisiva, es adecuado para validar conceptos de automatización en entornos industriales ligeros antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la informacion disponible. El paper original de SmolVLA (arXiv:2506.01844) reporta que el modelo base supera a π0 inicializado con un VLM y compite con π0 preentrenado en robótica, pero no se proporcionan cifras concretas en la documentación de este checkpoint. Por tanto, no se incluyen tablas de rendimiento para evitar datos inventados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M de parámetros, el modelo en FP16/BF16 ocupa aproximadamente 900 MB, por lo que cabría en GPUs con 4 GB de VRAM o más. El repositorio tiene un tamaño de 1,2 GB, lo que sugiere pesos en precisión mixta.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA RTX 3050, RTX 4060, GTX 1660 Super, o incluso GPUs integradas con suficiente memoria compartida. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: el modelo se integra con LeRobot, que utiliza PyTorch. También podría adaptarse a otros frameworks de inferencia como vLLM o llama.cpp, aunque no es el flujo habitual para VLA.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware requerido |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | no disponible | Apache 2.0 | GPU de consumo (4 GB VRAM) |
| SmolVLA base | 450M | no disponible | Apache 2.0 | GPU de consumo (4 GB VRAM) |
| π0 (Physical Intelligence) | 3B | no disponible | no comercial | GPU profesional (más de 12 GB VRAM) |
| OpenVLA | 7B | no disponible | no comercial | GPU profesional (más de 24 GB VRAM) |

La principal ventaja de este modelo frente a π0 y OpenVLA es su tamaño reducido y su licencia Apache 2.0, que permite uso comercial sin restricciones. Sin embargo, al ser un fine-tune específico para un dataset de objetos rojos, su generalización a otras tareas es limitada en comparación con los modelos base más grandes.

## Limitaciones y advertencias

- Sesgo de color: el modelo ha sido entrenado exclusivamente con objetos rojos (dataset `red-only`), por lo que puede fallar al manipular objetos de otros colores o en entornos con iluminación diferente.
- Dependencia del hardware robótico: las acciones generadas están calibradas para el brazo OpenArm; su uso con otros robots requeriría reentrenamiento o adaptación.
- Riesgo de alucinación en instrucciones complejas: al ser un modelo de lenguaje, puede malinterpretar comandos ambiguos o generar acciones incorrectas si la instrucción no es clara.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, pero al ser un modelo compacto, es probable que tenga limitaciones en la cantidad de información visual o textual que puede procesar simultáneamente.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, es necesario verificar la licencia del dataset `a126-kitech/openarm-2colors-red-only` para asegurar el cumplimiento en aplicaciones de producción.
- Sin soporte multilingüe confirmado: no se ha indicado qué idiomas soporta, aunque el modelo base probablemente funciona mejor en inglés.

## Enlaces

- HuggingFace: https://huggingface.co/a126-kitech/smolvla-openarm-2colors
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Sitio web de SmolVLA: https://smolvla.net/index_en
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
