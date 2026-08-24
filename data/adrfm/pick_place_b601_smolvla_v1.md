# adrfm/pick_place_b601_smolvla_v1

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, disenado para controlar robots mediante instrucciones en lenguaje natural. Este repositorio concreto, `adrfm/pick_place_b601_smolvla_v1`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por Aaron De Rybel (adrfm) para una tarea especifica de manipulacion robotica: colocar un disco negro en una caja, utilizando un robot Seeed B601.

El modelo resuelve el problema de adaptar un VLA preentrenado a una tarea robotica concreta con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Con aproximadamente 450 millones de parametros, SmolVLA ofrece un rendimiento competitivo frente a modelos VLA mucho mas grandes, democratizando el acceso a la robotica basada en aprendizaje. La relevancia actual de este modelo radica en que demuestra el flujo completo de entrenamiento y despliegue de politicas roboticas con LeRobot, la libreria de Hugging Face, sobre un robot comercial asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en SmolVLM) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que adapta un modelo de lenguaje y vision preentrenado (SmolVLM) para generar acciones de control robotico. La arquitectura combina un codificador visual para procesar imagenes de camaras, un codificador de estado para la informacion proprioceptiva del robot, y un decodificador de acciones que produce comandos de control de 7 dimensiones. El modelo base fue preentrenado en una amplia variedad de datos roboticos y linguisticos, y este repositorio contiene un fine-tuning especifico.

El fine-tuning se realizo con el framework LeRobot (version 0.6.2) sobre el dataset `adrfm/pick_place_b601`, que contiene 50 episodios y 15.905 frames a 30 FPS de la tarea "Place black disk in box". La configuracion de entrenamiento incluye 20.000 pasos, batch size de 8, optimizador AdamW y learning rate de 0.0001. El modelo fue entrenado con dos camaras (frontal y de muneca), cada una capturando imagenes de 480x640 pixeles, junto con un vector de estado de 7 dimensiones. No se menciona el uso de RLHF o DPO en el proceso de entrenamiento.

## Capacidades

- Control robotico de 7 grados de libertad (posicion y orientacion del efector final, mas apertura de pinza).
- Procesamiento multimodal: fusiona dos flujos de vision (camara frontal y de muneca) con informacion de estado del robot.
- Ejecucion de tareas de manipulacion aprendidas por imitacion: pick-and-place de objetos.
- Generacion de acciones a 30 FPS, sincronizado con la frecuencia de captura de las camaras.
- Inferencia en tiempo real sobre hardware de consumo gracias al tamano compacto del modelo.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- Fine-tuning rapido desde el modelo base `lerobot/smolvla_base` con pocos episodios (50 como punto de partida recomendado).

## Casos de uso

- Automatizacion de tareas de pick-and-place en lineas de produccion: el modelo puede integrarse en celdas robotizadas para colocar piezas en contenedores, aprovechando su capacidad de procesar vision en tiempo real y generar acciones precisas de 7 grados de libertad.
- Investigacion en robotica de imitacion: sirve como punto de partida para estudiar tecnicas de aprendizaje por imitacion, ya que el flujo completo de entrenamiento esta documentado y reproducible con LeRobot.
- Prototipado rapido de soluciones roboticas: al poder fine-tuning con solo 50 episodios, permite validar una tarea robotica en horas en lugar de semanas, ideal para pruebas de concepto en laboratorios.
- Educacion en robotica y aprendizaje automatico: el modelo y su dataset asociado son recursos didacticos completos para ensenar el flujo de trabajo de VLA en cursos universitarios.
- Despliegue en robots de bajo coste: al ser un modelo compacto, puede ejecutarse en GPUs de gama media, lo que lo hace viable para pequenas empresas o makerspaces que no disponen de infraestructura de calculo avanzada.
- Benchmarking de politicas VLA: la tarea estandarizada "Place black disk in box" permite comparar el rendimiento de diferentes arquitecturas o configuraciones de entrenamiento en un escenario controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion proporcionados para esta politica. El paper original de SmolVLA (arxiv:2506.01844) reporta resultados comparativos, pero no se incluyen en la documentacion de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion del modelo. Dado el tamano de 450M parametros, se estima que una cuantizacion de 8 bits requeriria aproximadamente 1 GB de VRAM, y en precision completa (fp32) alrededor de 1.8 GB, aunque estos valores son orientativos y no estan confirmados por el autor.
- GPU recomendadas: el modelo esta disenado para hardware de consumo. Una GPU con al menos 4 GB de VRAM (como una GTX 1650 o superior) deberia ser suficiente para inferencia en tiempo real, aunque no se especifica oficialmente.
- Despliegue: el modelo se ejecuta mediante la libreria LeRobot, que gestiona la inferencia y el rollout sobre el robot. No se mencionan opciones de despliegue con vLLM, llama.cpp u Ollama, ya que es un modelo de robotica, no de generacion de texto.
- Latencia y throughput: no disponibles. El modelo fue entrenado para operar a 30 FPS, la frecuencia de captura de las camaras, pero no se proporcionan mediciones reales de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Apache 2.0 | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Propietaria | API |

SmolVLA se posiciona como una alternativa mucho mas ligera a modelos como OpenVLA (7B parametros) o RT-2 (55B), sacrificando algo de rendimiento bruto pero permitiendo despliegue en hardware de consumo. La comparacion directa de rendimiento no es posible sin datos de benchmarks publicados para este fine-tuning concreto. El paper original de SmolVLA reporta resultados competitivos frente a modelos mucho mayores en tareas de manipulacion, pero esos datos no se replican en esta ficha por no estar disponibles en la documentacion del repositorio.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea (colocar un disco negro en una caja) y no generaliza a otras tareas sin un nuevo fine-tuning.
- No se han publicado resultados de evaluacion en robot real, por lo que el rendimiento real en el robot no esta verificado.
- El dataset de entrenamiento es pequeno (50 episodios), lo que puede limitar la robustez frente a variaciones en la posicion de los objetos, iluminacion o distracciones.
- No se proporciona informacion sobre sesgos, pero al ser un modelo entrenado por imitacion, hereda los comportamientos demostrados en los episodios de entrenamiento.
- Riesgo de alucinacion en la generacion de acciones si las condiciones de inferencia difieren significativamente de las de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de la libreria LeRobot y del hardware especifico (Seeed B601), lo que condiciona su portabilidad a otros robots.
- No se especifican limitaciones de contexto o idioma, pero al ser un modelo de robotica, las instrucciones en lenguaje natural estan limitadas a la tarea entrenada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/adrfm/pick_place_b601_smolvla_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/adrfm/pick_place_b601
- Perfil del autor: https://huggingface.co/adrfm
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de SmolVLA en GitHub: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
