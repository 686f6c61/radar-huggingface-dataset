# laroi0124/SmolVLA_100k_test

## Resumen

SmolVLA_100k_test es un modelo de tipo Vision-Language-Action (VLA) para robotica, subido por el usuario laroi0124 como reproduccion personal del modelo base SmolVLA de Hugging Face. No se trata de un modelo oficial ni de un ajuste fino dirigido: es un "modelo padre" entrenado durante 100.000 pasos sobre el dataset LIBERO, partiendo de la inicializacion del VLM `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`. Con 450.046.176 parametros (~450M) y un repositorio de 0,9 GB, encaja en la categoria de VLA ligeros, disenados para ejecutarse en hardware asequible.

El modelo resuelve el problema de convertir instrucciones en lenguaje natural e imagenes de camara en acciones de control de un brazo robotico, empleando un paradigma de imitacion (imitation learning) con flow matching. La relevancia actual radica en que los VLA grandes (tipo pi0) son costosos, mientras que SmolVLA demuestra que un VLM pequeno congelado mas un "action expert" entrenado puede alcanzar un rendimiento competitivo en tareas de manipulacion simulada.

La arquitectura combina un transformer multimodal (el VLM congelado) con un modulo generador de acciones entrenable. Este upload concreto corresponde a un experimento de reproduccion, con resultados de evaluacion en el simulador LIBERO y limitaciones explicitamente reconocidas por el autor (solo simulacion, sin garantia de seguridad en robot real).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action): VLM transformer congelado + action expert con flow matching |
| Parametros totales | 450.046.176 (~450M) |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos en safetensors (BF16/FP32) |
| Idiomas soportados | no disponible (las instrucciones del dataset LIBERO estan en ingles) |
| Licencia | no disponible en el repositorio; se aplican las licencias de los activos upstream (VLM, dataset y codigo) |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamano del repositorio | 0,9 GB |
| Entradas | 2 imagenes (`observation.images.image`, `observation.images.image2`), estado de 8 dimensiones |
| Salidas | accion de 7 dimensiones |
| Action chunk size | 50 |
| Flow matching num_steps | 10 |

## Arquitectura y entrenamiento

El modelo sigue el diseno SmolVLA: un VLM preentrenado (`SmolVLM2-500M-Video-Instruct`) se mantiene congelado y se anade un "action expert" junto con una proyeccion de estado, que son los unicos componentes entrenados. Las vistas de camara y la instruccion en lenguaje natural se codifican en caracteristicas contextuales que condicionan al action expert, el cual genera las acciones mediante flow matching (con 10 pasos de integracion). No se parte de un "teacher" oficial de LIBERO: el autor indica explicitamente que no continuo el entrenamiento desde pesos teacher, sino desde el VLM base.

El entrenamiento se realizo durante 100.000 pasos con batch de 64, semilla 1000, optimizador AdamW y precision mixta BF16. La tasa de aprendizaje fue de 1e-4, con un warmup de 1.000 pasos y decaimiento coseno de 30.000 pasos hasta un minimo de 2.5e-6. Los datos proceden del dataset `HuggingFaceVLA/libero` (revision `86958911c0f959db2bbbdb107eb3e17c5f9c798e`). El autor advierte que deben conservarse el preprocesador y postprocesador originales (normalizacion) y no sustituirlos por estadisticas de un dataset nuevo.

## Capacidades

- Generacion de acciones de robot a partir de instrucciones en lenguaje natural e imagenes de dos camaras.
- Percepcion visual multimodal (dos vistas simultaneas) combinada con estado sensorio-motor de 8 dimensiones.
- Control de manipulacion robotica de 7 grados de libertad (acciones de 7 dimensiones) mediante imitacion.
- Generacion de acciones en "chunks" de 50 pasos, con la posibilidad de reobservar y replanificar tras N pasos de ejecucion.
- Flow matching para la generacion de trayectorias de accion (10 pasos de integracion en la configuracion de referencia).
- No dispone de tool calling, function calling ni capacidades de agente multi-paso en el sentido de los LLM conversacionales.
- Capacidades multilingues: no disponibles; el modelo esta entrenado sobre instrucciones del dataset LIBERO, en ingles.

## Casos de uso

- Investigacion en aprendizaje por imitacion: reproducir y auditar experimentos de VLA ligeros sobre LIBERO, comparando el efecto del numero de pasos de reobservacion (1, 10 o 50) en la tasa de exito.
- Benchmarking de VLA pequenos: usar este checkpoint como linea base de ~450M parametros frente a SmolVLA base u otros ajustes sobre LIBERO en tareas de manipulacion simulada.
- Prototipado de politicas robotica en simulacion: entrenar o evaluar pipelines de LeRobot + MuJoCo sin necesidad de un VLM grande, gracias al bajo coste computacional de un modelo de 450M.
- Estudio de congelacion de VLM: analizar como afecta el hecho de mantener el VLM congelado y entrenar solo el action expert y la proyeccion de estado al rendimiento final.
- Experimentos academicos de flow matching para control: evaluar la calidad de las trayectorias generadas con 10 pasos de integracion y chunk size 50 en tareas de manipulacion.
- Educacion y formacion en robotica con IA: servir como ejemplo didactico de arquitectura VLA completa (percepcion visual, lenguaje, estado y accion) ejecutable en recursos modestos.
- Base para futuros ajustes finos: al ser un modelo padre, puede usarse como punto de partida para ajuste fino en otros datasets o tareas, siempre sustituyendo las estadisticas de normalizacion de forma coherente.

## Benchmarks y rendimiento

Resultados reportados por el autor en el simulador LIBERO (no son resultados del paper oficial). Metrica: numero de exitos sobre 100 por suite. Evaluacion con 10 estados iniciales por tarea (0-9), semilla 1000, batch 1, AMP desactivado y 10 pasos de integracion de flow. Entorno: LeRobot 0.6.1 y MuJoCo 3.8.1.

| Pasos antes de reobservar | Spatial | Object | Goal | Long | Total | Short-300 |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 87/100 | 83/100 | 82/100 | 53/100 | 305/400 | 252/300 |
| 10 | 84/100 | 95/100 | 89/100 | no medido | no disponible | 268/300 |
| 50 (fase temprana) | 69/100 | 75/100 | 71/100 | no medido | no disponible | 215/300 |

No se han publicado en la informacion disponible resultados comparables de MMLU, HumanEval o GSM8K, ya que se trata de un modelo de robotica y no de un LLM de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9-1 GB en BF16 para los pesos; en torno a 1,8 GB en FP32. El consumo real anadira memoria para las activaciones y el buffer de imagenes, pero es un modelo que se ejecuta holgadamente en GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente; en GPUs de centro de datos (A100, H100) el modelo queda muy sobredimensionado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 6 GB o mas de VRAM, e incluso en muchos portatiles con GPU dedicada.
- Opciones de despliegue: libreria LeRobot (PyTorch) con MuJoCo para simulacion. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robotica. Es obligatorio cargar el preprocesador y postprocesador del repositorio, no solo los pesos.
- Latencia y throughput: no disponible en la informacion proporcionada. El coste por inferencia depende del chunk size (50) y de los 10 pasos de integracion de flow matching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en LIBERO | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA_100k_test (este) | ~450M | no disponible | Ver tabla de benchmarks | no disponible (upstream aplican) | Hugging Face (laroi0124) |
| smolvla_base (lerobot oficial) | no disponible en la informacion | no disponible | no disponible | no disponible | Hugging Face (lerobot) |
| SmolVLM2-500M-Video-Instruct | ~500M (VLM base) | no disponible | no aplica (no es un VLA) | no disponible en la informacion | Hugging Face (HuggingFaceTB) |

No se dispone de datos comparativos de benchmarks entre este upload y los modelos oficiales dentro de la informacion proporcionada; el autor senala explicitamente que sus resultados no deben compararse como si fueran los del paper oficial de SmolVLA ni reclamar una reproduccion exacta.

## Limitaciones y advertencias

- El modelo solo se ha evaluado en simulacion (LIBERO + MuJoCo); el autor advierte que no garantiza seguridad al desplegarse en un brazo robotico real.
- No debe afirmarse que alcanza 300/300 en LIBERO ni que reproduce completamente el paper: los resultados son parciales y dependen de la configuracion de evaluacion (numero de pasos antes de reobservar).
- El autor reconoce que no ha demostrado de forma independiente la ausencia de solapamiento entre estados de entrenamiento y de test, y que los estados de test ya han sido inspeccionados; futuros experimentos de confirmacion deberian usar un conjunto reservado.
- Los resultados de 50 pasos corresponden a una fase temprana de la evaluacion y son peores que los de 1 y 10 pasos; no deben presentarse como el rendimiento final del modelo.
- Riesgo de alucinacion: no aplica en el sentido linguistico (no genera texto libre), pero si puede producir acciones incorrectas o inseguras en entornos no vistos.
- Sesgos: no documentados en la informacion disponible; el dataset LIBERO es una coleccion acotada de tareas simuladas, por lo que el modelo estara sesgado hacia ese dominio.
- Limitaciones de idioma: las instrucciones del dataset estan en ingles; no se documenta soporte multilingue.
- Licencia: no disponible en el repositorio; el autor indica que se aplican las licencias de los activos upstream (modelo VLM, dataset y codigo) y que este upload no concede derechos adicionales sobre recursos de terceros. Verificar la licencia antes de cualquier uso comercial.
- Es imprescindible usar el preprocesador y postprocesador del repositorio; sustituir las estadisticas de normalizacion por las de un dataset nuevo degradara el rendimiento.
- La configuracion de exportacion usa `n_action_steps=50`; para reproducir el resultado de 1 paso hay que sobrescribir explicitamente ese valor a 1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laroi0124/SmolVLA_100k_test
- Repositorio de reproduccion: https://github.com/2021147571/smolvla-libero-100k-reproduction
- SmolVLA base (lerobot): https://huggingface.co/lerobot/smolvla_base
- Blog de SmolVLA en Hugging Face: https://huggingface.co/blog/smolvla
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Documentacion de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- VLM base SmolVLM2-500M-Video-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Dataset LIBERO: https://huggingface.co/datasets/HuggingFaceVLA/libero
