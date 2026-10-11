# edgarcancinoe/smolvla_water_libero-4

## Resumen

smolvla_water_libero-4 es un modelo de vision-lenguaje-accion (VLA) especializado en robótica, publicado por el usuario edgarcancinoe (Jose Edgar Hernandez Cancino Estrada) en Hugging Face. Se trata de un ajuste fino del modelo base `lerobot/smolvla_base`, la implementación de SmolVLA, un VLA compacto y eficiente descrito en el paper arXiv:2506.01844 que busca ofrecer un rendimiento competitivo en manipulación robótica con un coste computacional reducido y desplegable en hardware de consumo.

El modelo genera comandos de acción de 7 dimensiones para un robot tipo `panda` a partir de dos flujos de cámara (`observation.images.image` e `image2`, ambos de 3x256x256) y del estado del robot (`observation.state`, vector de 8 elementos). Ha sido entrenado con el dataset `edgarcancinoe/water_pour` (47 episodios, 35.370 fotogramas a 20 FPS) para tres tareas de riego: regar la planta izquierda, la central o la derecha. Cuenta con 604.934.176 parámetros totales y un repositorio de 1,2 GB.

Su relevancia radica en dos factores: por un lado, demuestra que es posible hacer ajuste fino de políticas VLA en tareas concretas con un presupuesto de datos muy pequeño (menos de 50 episodios); por otro, al derivar de la familia SmolVLA, está pensado para ejecutarse en GPUs de gama de consumo, lo que baja la barrera de entrada para investigación en aprendizaje por imitación. No obstante, el autor no ha publicado resultados de evaluación y el modelo no registra descargas ni «likes», por lo que debe considerarse un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA); ajuste fino de SmolVLA (arXiv:2506.01844) |
| Parametros totales | 604.934.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo VLA, no un LLM de texto; el condicionamiento es por instrucción de tarea) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan versiones GGUF/INT8) |
| Idiomas soportados | no disponible en la model card; las instrucciones de tarea del dataset están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

Datos adicionales: robot objetivo `panda`; entradas `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256) y `observation.state` (8,); salida `action` (7,).

## Arquitectura y entrenamiento

El modelo es una política VLA de tipo vision-lenguaje-accion derivada de SmolVLA, cuya propuesta es un VLA compacto que combina percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras. La política consume dos imágenes de cámara y el estado del robot, y produce un vector de acción de 7 grados de libertad. La model card no detalla los componentes internos (backbone visual-lenguaje, mecanismo de decodificación de acciones, posible uso de flow matching) más allá de remitir al paper de SmolVLA, por lo que los detalles arquitectónicos internos deben consultarse en la publicación original.

El ajuste fino se realizó con LeRobot 0.6.1 sobre el dataset `edgarcancinoe/water_pour` (47 episodios, 35.370 fotogramas, 20 FPS) para tres tareas de riego. La configuración de entrenamiento fue: 10.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni otras fases de alineación, algo que por otra parte no es habitual en políticas de imitación robótica. El volumen de datos es reducido, lo que sugiere un ajuste por imitación centrado en una única tarea y un único entorno.

## Capacidades

- Generación de acciones motoras de 7 grados de libertad para un robot `panda` a partir de observaciones visuales y de estado.
- Condicionamiento por instrucción en lenguaje natural: distingue entre las tareas «Water the left plant», «Water the middle plant» y «Water the right plant».
- Percepción visual multi-cámara: procesa dos flujos de imagen simultáneos (256x256 cada uno).
- Política de imitación entrenada específicamente para manipulación y riego de plantas.
- Integración con el ecosistema LeRobot para ejecución (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo «thinking».

## Casos de uso

- Automatización de riego en invernadero: el modelo recibe la imagen de las plantas y el estado del brazo y ejecuta la acción de riego sobre la planta indicada por la instrucción, adecuado para tareas repetitivas de jardinería controlada.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cuántos episodios son necesarios para ajustar un VLA a una tarea nueva, ya que el dataset usado tiene solo 47 episodios.
- Prototipado rápido de políticas robóticas: al derivar de SmolVLA y ser ejecutable en hardware de consumo, permitiría iterar sobre una política de manipulación sin acceso a clústeres de GPU.
- Docencia y formación en robótica: ejemplo reproducible de extremo a extremo (grabación de datos, entrenamiento con LeRobot y despliegue) para cursos de robótica e IA.
- Evaluación de robustez ante variaciones: la instrucción con tres plantas distintas permite probar la generalización posicional de la política dentro del mismo entorno.
- Base para ajustes posteriores: al ser un checkpoint de SmolVLA, puede reutilizarse como inicialización para otras tareas de manipulación (recogida, colocación, vertido) mediante nuevos datasets.
- Integración en pipelines de robótica con LeRobot: encaja en flujos de trabajo que combinan `lerobot-train` y `lerobot-rollout` para despliegue en robot físico o simulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet». No se dispone de tasas de éxito ni de comparaciones numéricas para este ajuste fino, por lo que no se presentan cifras que no estén documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión fp32 los 604,9 millones de parámetros ocupan aproximadamente 2,4 GB; en fp16/bf16 alrededor de 1,2 GB. Sumando activaciones y buffers de los dos flujos de imagen, la inferencia cabría holgadamente en 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM, como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4090 o superiores. También es apta para GPUs de datacenter (A100, H100) si se requiere paralelizar o entrenar.
- Cabe en GPU de consumo: sí, es uno de los puntos fuertes declarados de la familia SmolVLA; una GPU de gama media es suficiente para ejecutar la política.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`) sobre PyTorch/CUDA; el entrenamiento se realiza con `lerobot-train`. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_water_libero-4 | 604.934.176 | VLA (ajuste de SmolVLA) | Instrucción de tarea en inglés; 2 cámaras 256x256 + estado (8,) | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible en la info (SmolVLA se cita como ~450M en fuentes web) | VLA base | Instrucción de lenguaje; modelo preentrenado | no disponible en la info | Hugging Face |
| HuggingFaceVLA/smolvla_libero | no disponible en la info | VLA (SmolVLA sobre LIBERO) | Benchmark LIBERO | no disponible en la info | Hugging Face |

No se dispone de datos verificados en la información proporcionada para comparar con otros VLA de mayor tamaño (por ejemplo, OpenVLA o π0), por lo que se indica «no disponible» en lugar de estimar cifras.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card confirma que no hay resultados de éxito ni protocolo de evaluación, por lo que se desconoce el rendimiento real de la política.
- Ajuste fino muy específico: entrenado con solo 47 episodios y tres tareas de riego en un único entorno, con un robot `panda` concreto; es previsible que no generalice a otros robots, objetos o iluminaciones sin nuevo ajuste.
- Sobreajuste probable: con 35.370 fotogramas y 10.000 pasos, el riesgo de sobreajuste al entorno de recogida es alto; no se documentan técnicas de aumento de datos ni de regularización.
- Contexto limitado: al ser un modelo VLA y no un LLM, no hay ventana de contexto conversacional; la política depende de la instrucción de tarea exacta para la que fue entrenada.
- Idiomas: no se documentan capacidades multilingües; las únicas instrucciones soportadas están en inglés.
- Riesgo de alucinación motora: como toda política de imitación, puede producir acciones erráticas o inseguras ante entradas fuera de distribución; requiere supervisión en entornos físicos.
- Sesgos: no documentados, pero potencialmente ligados a la distribución del dataset (posiciones, colores y formas concretas de plantas y entorno).
- Licencia: apache-2.0, que permite uso comercial, pero al derivar de `lerobot/smolvla_base` conviene revisar también la licencia y condiciones del modelo base y del dataset utilizado.
- Artefacto sin adopción: 0 descargas y 0 «likes» en el momento de la consulta; tratarlo como material experimental, no como solución lista para producción.
- No se documentan tipos de cuantización ni rutas de despliegue optimizadas fuera de LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgarcancinoe/smolvla_water_libero-4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Paper en Hugging Face: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/edgarcancinoe/water_pour
- Guía SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor: https://huggingface.co/edgarcancinoe
- Variante SmolVLA sobre LIBERO: https://huggingface.co/HuggingFaceVLA/smolvla_libero
- Repositorio de ajuste fino en LIBERO: https://github.com/goelshivam1210/smolvla
- Artículo en Frontiers sobre ajuste fino de SmolVLA: https://www.frontiersin.org/journals/neurorobotics/articles/10.3389/fnbot.2026.1890245/full
- Ficha de SmolVLA LIBERO en OpenBot.ai: https://openbot.ai/models/smolvla-libero
