# modelapi/smolvla-libero-fp16-ov-catalog

## Resumen

SmolVLA es un modelo ligero de tipo visión-lenguaje-acción (VLA) desarrollado por HuggingFace y convertido a formato OpenVINO por el equipo de modelapi dentro del catálogo Physical AI de Intel. Está diseñado específicamente para robótica: toma imágenes de una o varias cámaras, el estado del robot y una instrucción en lenguaje natural, y produce un fragmento de acciones (chunk) que el robot puede ejecutar como secuencia de movimientos en el mundo real o en entornos simulados como LIBERO.

El modelo se basa en la arquitectura SmolVLA descrita en el artículo arXiv 2506.01844, orientada a permitir entrenamiento en una sola GPU y despliegue en dispositivos de borde. La versión aquí catalogada (`smolvla-libero-fp16-ov`) es una conversión a precisión fp16 con pesos en formato OpenVINO, lista para usar con el framework Physical AI de Intel. Su relevancia actual radica en que ofrece una alternativa de bajo coste computacional para tareas de manipulación robótica, un área donde los modelos VLA suelen ser pesados y difíciles de desplegar en hardware limitado.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el disclaimer de Intel restringe su uso a aplicaciones que no vulneren derechos humanos. El repositorio en HuggingFace actúa como catálogo y la descarga de pesos se gestiona a través del propio framework Physical AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) ligera, basada en SmolVLA (arXiv 2506.01844) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (formato OpenVINO) |
| Idiomas soportados | no disponible (instrucciones en ingles en el ejemplo) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (fp16), gestionado por el framework physicalai |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador visual, un codificador de lenguaje y un modulo de prediccion de acciones. La arquitectura concreta (numero de capas, dimensiones, tipo de atencion) no se detalla en la informacion disponible, pero el articulo original (arXiv 2506.01844) describe un diseno pensado para minimizar el coste computacional y permitir entrenamiento en una unica GPU. El modelo se entrena mediante aprendizaje por imitacion (imitation learning), donde se le muestran ejemplos de observaciones (imagenes, estado del robot, instruccion) junto con las acciones correspondientes, y aprende a predecir un chunk de acciones futuras.

El modelo base es `HuggingFaceVLA/smolvla_libero`, entrenado especificamente para el benchmark LIBERO. La version catalogada en este repositorio es una conversion a OpenVINO con precision fp16, realizada por el equipo de modelapi dentro del proyecto Physical AI de Intel. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO. Para el fine-tuning con datasets personalizados, se recomienda utilizar Physical AI Studio.

## Capacidades

- Generacion de acciones roboticas: dado un conjunto de observaciones (imagenes de camara, estado del robot de 8 dimensiones) y una instruccion en lenguaje natural, produce un chunk de acciones ejecutables por un robot.
- Soporte multi-camara: acepta al menos dos fuentes de imagen (en el ejemplo, `images.image` y `images.image2`), tipicamente una vista frontal (agentview) y una camara en la muneca (wrist).
- Integracion con LIBERO: puede ejecutarse directamente en el benchmark virtual LIBERO para evaluar su rendimiento en tareas de manipulacion.
- Inferencia en CPU: el ejemplo de uso indica que puede ejecutarse con `device="CPU"`, lo que lo hace apto para despliegue en hardware sin GPU dedicada.
- Fine-tuning con Physical AI Studio: permite adaptar el modelo a tareas personalizadas con datasets propios.
- Formato OpenVINO: pesos en fp16 optimizados para el runtime de OpenVINO, con soporte para aceleracion en hardware Intel.

## Casos de uso

- Manipulacion robotica en simulacion: el modelo puede evaluarse en el entorno LIBERO para validar politicas de control antes de desplegarlas en un robot real, reduciendo costes y riesgos.
- Control de brazos roboticos en entornos industriales: gracias a su naturaleza ligera, puede ejecutarse en PCs industriales o dispositivos edge para tareas de recogida y colocacion (pick-and-place) con instrucciones en lenguaje natural.
- Prototipado rapido de politicas VLA: investigadores pueden usar este modelo como punto de partida para fine-tuning con Physical AI Studio, acelerando la experimentacion con nuevas tareas roboticas.
- Despliegue en robots de bajo coste: al poder ejecutarse en CPU, es adecuado para plataformas roboticas con hardware limitado, como brazos de escritorio o robots educativos.
- Evaluacion de algoritmos de aprendizaje por imitacion: el modelo sirve como baseline en estudios comparativos de VLA dentro del ecosistema LIBERO.
- Integracion en pipelines de robotica con OpenVINO: al estar en formato OpenVINO, puede integrarse con el resto del stack de Physical AI de Intel para inferencia optimizada en CPUs, GPUs integradas o NPUs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo puede evaluarse en el benchmark LIBERO mediante la clase `LiberoBenchmark`, pero no se incluyen metricas concretas (exito por tarea, tasa de exito media, etc.) en el repositorio ni en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible, aunque al ser fp16 y un modelo ligero, se espera que quepa en GPUs de consumo medio (por ejemplo, 8-12 GB), pero no se confirma.
- GPU recomendadas: no se especifican, pero el ejemplo de inferencia usa `device="CPU"`, lo que sugiere que no requiere GPU obligatoriamente.
- Compatibilidad con consumer GPU: probablemente si, dado el enfasis en edge deployment y single-GPU training, pero sin datos concretos.
- Opciones de despliegue: framework Physical AI (OpenVINO), con soporte para CPU, GPU integrada y posiblemente NPU. No se mencionan vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como alternativas en la categoria de modelos VLA se podrian considerar OpenVLA (7B, licencia MIT) o RT-2 de Google (no open source), pero no se conocen resultados de SmolVLA frente a ellos en este repositorio. La principal diferencia es que SmolVLA esta disenado para ser ligero y ejecutarse en edge, mientras que OpenVLA es significativamente mas grande y requiere GPU. No se pueden dar cifras concretas sin datos oficiales.

## Limitaciones y advertencias

- Sesgos y alucinacion: no se documentan sesgos especificos, pero como modelo entrenado por imitacion, puede reproducir comportamientos suboptimos presentes en los datos de entrenamiento. La alucinacion en acciones es posible si la instruccion no corresponde a ninguna tarea vista.
- Limitaciones de contexto e idioma: no se especifican idiomas soportados; el ejemplo usa ingles. La ventana de contexto no esta documentada, lo que limita la longitud de las instrucciones o el historial de observaciones.
- Dependencia del entorno: el modelo esta entrenado para LIBERO, por lo que su transferencia a entornos reales puede requerir fine-tuning adicional.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el disclaimer de Intel restringe el uso a aplicaciones que no causen o contribuyan a impactos adversos en derechos humanos, lo que podria limitar ciertos usos comerciales.
- Formato propietario: los pesos estan en formato OpenVINO, lo que ata el despliegue al ecosistema de Intel y puede dificultar su uso con otros frameworks de inferencia.
- Ausencia de pesos en el repositorio: el tamano del repo es 0.0 GB, lo que indica que los pesos no estan alojados directamente en HuggingFace, sino que se descargan a traves del framework Physical AI, lo que anade un paso de instalacion y dependencia de la disponibilidad de ese servicio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/modelapi/smolvla-libero-fp16-ov-catalog
- Articulo original SmolVLA: https://huggingface.co/papers/2506.01844
- Codigo del framework Physical AI: https://github.com/openvinotoolkit/physicalai
- Physical AI Studio (fine-tuning): https://github.com/open-edge-platform/physical-ai-studio
- Entorno LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
- Modelo base HuggingFaceVLA/smolvla_libero: https://huggingface.co/HuggingFaceVLA/smolvla_libero
