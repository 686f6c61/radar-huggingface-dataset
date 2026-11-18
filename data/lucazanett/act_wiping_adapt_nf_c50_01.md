# lucazanett/act_wiping_adapt_nf_c50_01

## Resumen

`act_wiping_adapt_nf_c50_01` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), el método presentado en el paper arXiv:2304.13705. Lo publica el usuario `lucazanett` en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El modelo aprende de datos de teleoperación y predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suele elevar la tasa de éxito en tareas manipulativas.

El nombre del repositorio sugiere una tarea de limpieza o secado ("wiping") con una variante adaptativa y sin señal de fuerza ("nf", no force), entrenada sobre el dataset `lucazanett/new_setup_wiping_adaptive_01_no_force`. El sufijo `c50` apunta a un chunk size de 50 pasos, aunque este dato no está confirmado en la información disponible. El checkpoint tiene 51.628.683 parámetros en formato safetensors y ocupa 0,2 GB.

Es relevante como ejemplo de política ACT ligera y desplegable en hardware de consumo, dentro del ecosistema LeRobot, que estandariza entrenamiento, evaluación y ejecución sobre robots como el SO-100. No obstante, se trata de un modelo de nicho, sin descargas ni likes, y sin benchmarks publicados, por lo que su evaluación debe hacerse sobre el robot y el entorno concretos para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.628.683 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre observaciones y chunks de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | lucazanett/new_setup_wiping_adaptive_01_no_force |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder diseñado para imitación visomotora. El encoder procesa las observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y el decoder genera un chunk de acciones futuras de forma conjunta, en lugar de predecir una acción por paso. Esta formulación reduce el horizonte efectivo de decisión y mitiga el problema de compounding error típico de las políticas paso a paso. El paper original incorpora además una técnica de regularización tipo CVAE sobre el estilo de la trayectoria para modelar la variabilidad humana en los datos de teleoperación.

En este checkpoint concreto no se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el número de episodios, las cámaras utilizadas, la frecuencia de control ni si hubo aumentos de datos o ajuste fino posterior. El nombre indica entrenamiento sin señal de fuerza y con chunk size probable de 50, pero estos detalles no están confirmados en la model card. El entrenamiento se realizó con `lerobot-train` sobre el dataset indicado, en un entorno CUDA, según el flujo documentado por el autor.

## Capacidades

- Generación de acciones robóticas por chunks a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de datos de teleoperación, sin recompensa explícita.
- Ejecución sobre robots compatibles con LeRobot, como el SO-100 follower mencionado en los comandos de evaluación.
- Control visomotor para tareas de manipulación, en este caso presumiblemente de limpieza o secado.
- Integración con el pipeline de LeRobot para entrenamiento, registro de episodios y evaluación.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de lenguaje, visión general o audio.
- No es un modelo multilingüe ni un modelo de propósito general: su alcance es la tarea y el entorno de entrenamiento.

## Casos de uso

- Automatización de limpieza de superficies: la política puede ejecutar trayectorias de secado o limpieza sobre un robot de sobremesa, aprendidas de demostraciones humanas, reduciendo el tiempo de programación manual de trayectorias.
- Investigación en imitación visomotora: sirve como punto de partida reproducible para comparar variantes de ACT, tamaños de chunk o configuraciones de cámaras sobre el mismo dataset.
- Prototipado rápido con LeRobot: al ser un checkpoint ligero (0,2 GB) y con licencia Apache 2.0, permite iterar en laboratorio con `lerobot-record` y evaluar tasas de éxito en pocos episodios.
- Benchmark interno de políticas: útil como referencia base frente a políticas entrenadas con señal de fuerza u otras arquitecturas, para medir el impacto de eliminar el canal de fuerza.
- Formación y docencia en robótica: ejemplo práctico de entrenamiento por imitación con un pipeline abierto y comandos reproducibles.
- Despliegue en robots de bajo coste: al caber en GPUs de consumo, facilita pruebas en entornos con hardware limitado, siempre que la tarea coincida con la del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors, el peso en FP32 ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con PyTorch; el flujo de entrenamiento documentado usa `--policy.device=cuda`. Para entrenamiento se recomienda al menos una RTX 3090 o superior, aunque no hay datos oficiales de requisitos.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4-8 GB de VRAM o más, dado el tamaño del checkpoint; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de checkpoints locales o del Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_wiping_adapt_nf_c50_01 | 51,6 M | no aplica | sin benchmarks publicados | apache-2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la informacion | no aplica | resultados en el paper, no comparables directamente | según implementación | paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | no disponible | no aplica | no disponible | variable | Hugging Face (LeRobot) |

No se dispone de datos suficientes para una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Modelo de nicho: cero descargas y cero likes en el momento de la consulta, sin validación externa conocida.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito, generalización ni robustez.
- Fuerte dependencia del entorno de entrenamiento: cambios de iluminación, posición de cámara, robot o superficie pueden degradar el rendimiento.
- Entrenado sin señal de fuerza: tareas que requieran control de contacto fino pueden no estar bien cubiertas.
- Posible sobreajuste al dataset `new_setup_wiping_adaptive_01_no_force`; no se documenta el número de episodios ni la diversidad de demostraciones.
- Sin capacidades de lenguaje ni multilingües; no debe evaluarse con métricas de LLM.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de acciones erráticas fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre seguridad física en el robot recae en el integrador.
- No hay información sobre sesgos, calibración ni protocolos de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucazanett/act_wiping_adapt_nf_c50_01
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_wiping_adaptive_01_no_force
