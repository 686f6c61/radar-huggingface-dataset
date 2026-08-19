# glory-hyeok/wam-dit4dit-robocasa-k8s-eval-minimal

## Resumen

El modelo `glory-hyeok/wam-dit4dit-robocasa-k8s-eval-minimal` es un checkpoint de evaluación (eval-minimal) del framework DiT4DiT, un Vision-Action-Model (VAM) desarrollado por Mondo-Robotics que combina transformers de difusión para video (Video DiT) y para acciones (Action DiT) mediante un doble objetivo de flow-matching. Este checkpoint concreto está orientado al benchmark RoboCasa, un entorno de simulación para manipulación robótica en cocinas, y está pensado exclusivamente para inferencia: el estado de reanudación y del optimizador se han excluido deliberadamente para reducir el tamaño.

El repositorio tiene un tamaño de 444.4 GB, lo que sugiere que contiene los pesos completos en formato safetensors. El modelo se publicó en julio de 2026 y se actualizó en agosto del mismo año. Aunque la página de HuggingFace no proporciona detalles de arquitectura, licencia o idiomas, la documentación asociada en arXiv y GitHub describe DiT4DiT como un VAM eficiente que logra control de cuerpo completo en tiempo real de robots humanoides, siendo el primero de su clase en conseguirlo. Este checkpoint específico se centra en la variante "k8s" (posiblemente referida a Kubernetes o a una configuración de evaluación particular) dentro del entorno RoboCasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT4DiT (Video DiT + Action DiT con flow-matching) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponibles (modelo de vision-accion, sin procesamiento de lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DiT4DiT se basa en dos transformers de difusion (DiT) acoplados: uno procesa secuencias de video y otro predice acciones del robot. Ambos se optimizan conjuntamente mediante un objetivo de flow-matching, lo que permite que el modelo aprenda la dinamica visual y la politica de control de forma unificada. El checkpoint `wam-dit4dit-robocasa-k8s-eval-minimal` corresponde a una variante entrenada especificamente para el benchmark RoboCasa, que simula tareas de manipulacion en entornos de cocina. El nombre "eval-minimal" indica que se han eliminado los estados de entrenamiento (optimizador, reanudacion) para reducir el peso del repositorio, dejando solo los pesos necesarios para inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La documentacion del proyecto en GitHub menciona que DiT4DiT soporta tanto control de mesa (tabletop) como control de cuerpo completo (whole-body) para robots humanoides, pero no se especifican los detalles de entrenamiento de este checkpoint concreto.

## Capacidades

- Generacion de video condicionada a observaciones del entorno: el modelo sintetiza secuencias de video futuras a partir de estados actuales.
- Prediccion de acciones de manipulacion robotica: genera comandos de control (posiciones, velocidades, pares) para ejecutar tareas.
- Control conjunto de video y accion: el acoplamiento entre los dos DiT permite que la generacion de video y la prediccion de acciones se refuercen mutuamente.
- Soporte para tareas de RoboCasa: el checkpoint esta adaptado al benchmark de simulacion de cocina, que incluye tareas como abrir puertas, recoger objetos o interactuar con electrodomesticos.
- Capacidad de control de cuerpo completo (segun el paper): aunque este checkpoint esta orientado a RoboCasa, el framework general soporta robots humanoides con control de torso, brazos y piernas.
- Inferencia en tiempo real (segun el paper): DiT4DiT es el primer VAM eficiente que logra control en tiempo real de humanoides, aunque no se confirma si este checkpoint especifico mantiene esa velocidad.

## Casos de uso

- Desarrollo de politicas de manipulacion robotica en simulacion: el modelo puede servir como base para entrenar o evaluar controladores en el entorno RoboCasa, generando acciones y video predictivo para tareas de cocina.
- Validacion de algoritmos de vision-accion: investigadores pueden usar este checkpoint como referencia para comparar nuevos VAMs en el benchmark RoboCasa.
- Generacion de datos sinteticos para robotica: el componente de video del modelo puede producir trayectorias visuales que sirvan para aumentar datasets de entrenamiento.
- Prototipado de control de cuerpo completo: aunque el checkpoint esta enfocado a RoboCasa, el framework DiT4DiT permite explorar control de humanoides en otros entornos.
- Evaluacion de robustez en entornos simulados: al ser un checkpoint de evaluacion, es adecuado para medir el rendimiento de DiT4DiT en condiciones controladas antes de desplegarlo en hardware real.
- Investigacion en modelos generativos para robotica: el doble objetivo de flow-matching ofrece un caso de estudio para quienes trabajan en arquitecturas que unifican percepcion y control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de arXiv (2603.10448) describe el framework DiT4DiT y su rendimiento general, pero no se proporcionan metricas especificas para este checkpoint concreto (por ejemplo, tasa de exito en RoboCasa, FVD en generacion de video, etc.). Se recomienda consultar el repositorio de GitHub para obtener tablas comparativas si estan disponibles.

## Requisitos de hardware

- VRAM estimada: no disponible. Con un tamaño de repositorio de 444.4 GB, se espera que los pesos completos en precision FP32 o BF16 requieran multiples GPUs de alta gama (por ejemplo, 8x A100 80GB o similar). Una cuantizacion a 8 bits reduciria la memoria a aproximadamente 111 GB, y a 4 bits a unos 55 GB, pero no se ha confirmado ninguna cuantizacion oficial.
- GPU recomendadas: se necesitan GPUs con al menos 40-80 GB de VRAM para cargar el modelo sin cuantizar; opciones como A100, H100 o RTX 6000 Ada son plausibles, aunque no hay confirmacion oficial.
- En consumer GPU: no es viable en una sola GPU de consumo (como RTX 4090 con 24 GB) sin cuantizacion agresiva y posiblemente fragmentacion en multiples dispositivos.
- Opciones de despliegue: al estar en formato safetensors, puede cargarse con frameworks como PyTorch, pero no se mencionan herramientas especificas como vLLM, llama.cpp u Ollama (que son mas tipicas de modelos de lenguaje). Para inferencia de video-accion se usaria probablemente el codigo oficial de DiT4DiT en GitHub.
- Latencia y throughput: no disponibles. El paper menciona tiempo real para control de cuerpo completo, pero no se dan cifras concretas para este checkpoint.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. DiT4DiT se posiciona como un VAM (Vision-Action-Model), una categoria relativamente nueva que incluye modelos como GR-1 o UniPi, pero no se han encontrado datos comparativos publicos para este checkpoint especifico. Se recomienda consultar el paper original para ver comparaciones con otros enfoques de robotica generativa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado en simulacion RoboCasa, puede no generalizar bien a entornos reales sin fine-tuning adicional.
- Riesgo de alucinacion: en generacion de video, el modelo puede producir secuencias visualmente plausibles pero fisicamente inconsistentes.
- Limitaciones de contexto: no se especifica la longitud de contexto; al ser un modelo de video-accion, el contexto se refiere a la secuencia de frames y pasos de control, no a texto.
- Restricciones de licencia: la licencia no esta disponible, por lo que se desconoce si es permitido el uso comercial o la modificacion. Se debe contactar al autor antes de cualquier uso productivo.
- Caveat de produccion: el checkpoint es "eval-minimal" y carece del estado de entrenamiento, por lo que no es adecuado para continuar el entrenamiento; solo sirve para inferencia.
- Tamaño y requisitos: con 444.4 GB, el despliegue en produccion requiere infraestructura de multiples GPUs y un manejo cuidadoso de la memoria.
- Fecha de publicacion: el modelo fue creado en 2026, lo que puede implicar que es experimental y no ha sido ampliamente validado por la comunidad.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-k8s-eval-minimal
- Paper en arXiv: https://arxiv.org/html/2603.10448v1
- Repositorio oficial de DiT4DiT en GitHub: https://github.com/Mondo-Robotics/DiT4DiT
- Documentacion de RoboCasa tabletop: https://github.com/Mondo-Robotics/DiT4DiT/blob/main/docs/robocasa_tabletop.md
- Checkpoint relacionado (kitchen v2v): https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-v2v-100k
- Checkpoint relacionado (kitchen i2v): https://huggingface.co/glory-hyeok/wam-dit4dit-robocasa-kitchen-i2v-100k
