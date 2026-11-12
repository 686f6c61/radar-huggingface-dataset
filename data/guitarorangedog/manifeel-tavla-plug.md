# guitarorangedog/manifeel-tavla-plug

## Resumen

TA-VLA (con backbone de diffusion policy) es un checkpoint de política robótica entrenado por el usuario guitarorangedog dentro del ecosistema ManiFeel, sobre el dataset `RoboSynapse/manifeel-tacr_franka-panda_plug`. Se trata de un modelo de imitación para control de un brazo Franka Panda en una tarea concreta de inserción de enchufe (plug), que combina visión de muñeca y una imagen táctil (`tacimg`) como entradas multimodales. Está empaquetado en formato LeRobot (versión 0.6.1) mediante la herramienta robo-synapse y publicado con la etiqueta `diffusion-policy`.

El modelo cuenta con 344.505.100 parámetros en safetensors y ocupa 1,4 GB en el repositorio. No es un modelo de lenguaje: es una política de acción (VLA, vision-language-action en su denominación, aunque la información disponible no detalla componente lingüístico alguno) orientada a robótica de manipulación. Su relevancia es acotada: sirve como baseline reproducible para la tarea `plug` del benchmark ManiFeel y como referencia para comparar variantes de políticas táctiles.

La información publicada es escasa: no hay licencia declarada, no se especifican idiomas ni se documentan benchmarks más allá de la tasa de éxito del 51,0 % reportada por el autor. La model card remite a un pull request del repositorio robo-synapse como receta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (backbone TA-VLA) sobre LeRobot 0.6.1 |
| Parametros totales | 344.505.100 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a política de acción; horizonte de episodio de 500 pasos máx.) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint emplea una arquitectura de diffusion policy, un enfoque de imitación que genera trayectorias de acción mediante un proceso de difusión condicionado por observaciones. El backbone se denomina TA-VLA y se integra en el ecosistema LeRobot 0.6.1. Las entradas declaradas son la cámara de muñeca (wrist cam) y una imagen táctil del sensor derecho (`tacimg`), lo que convierte al modelo en una política multimodal visión-tacto para el control del Franka Panda.

El entrenamiento se realizó con la herramienta robo-synapse sobre el dataset `RoboSynapse/manifeel-tacr_franka-panda_plug`, con semilla 1000, precisión mixta automática (AMP) y aumentación de datos desactivada. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por refuerzo; en políticas de imitación como esta lo habitual es aprendizaje supervisado por comportamiento, pero el autor no lo detalla.

## Capacidades

- Control de manipulación robótica: genera acciones de un brazo Franka Panda para la tarea de inserción de enchufe (`plug`).
- Fusión multimodal visión-tacto: consume imagen de cámara de muñeca e imagen táctil del sensor derecho.
- Ejecución de episodios de hasta 500 pasos por rollout.
- Compatible con el pipeline de robótica de LeRobot 0.6.1 y con la receta de robo-synapse.
- No se documentan capacidades de generación de lenguaje, razonamiento simbólico, tool calling, agentes multi-paso, matemáticas ni multilingüismo.

## Casos de uso

- Baseline de referencia para la tarea `plug` de ManiFeel: sirve para comparar nuevas variantes de políticas táctiles contra una tasa de éxito conocida del 51,0 % bajo un protocolo fijo (4 semillas × 50 episodios, máximo 500 pasos).
- Investigación en fusión visión-tacto: permite estudiar cómo contribuye la imagen táctil (`tacimg`) al rendimiento en inserción, comparando ablaciones con y sin dicha modalidad.
- Reproducción de experimentos: al estar entrenado con semilla 1000, AMP y sin aumentación, facilita la replicación exacta de resultados en entornos LeRobot 0.6.1.
- Desarrollo de pipelines de imitación: útil como punto de partida para adaptar diffusion policies a otras tareas de ensamblaje con el mismo robot y sensórica.
- Evaluación de robustez sim-to-real: como checkpoint de referencia para medir la degradación al transferir la política del dataset a un Franka Panda físico.
- Docencia y prototipado en robótica: ejemplo funcional y de tamaño moderado (1,4 GB) para ilustrar el flujo completo de entrenamiento y evaluación con robo-synapse.

## Benchmarks y rendimiento

| Metrica | Valor | Protocolo |
|---|---|---|
| Tasa de éxito en tarea `plug` | 51,0 % | 4 semillas × 50 episodios, máximo 500 pasos |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de lenguaje, lo cual es esperable al tratarse de una política robótica y no de un modelo de lenguaje. Tampoco se ofrecen comparaciones numéricas con otras políticas del benchmark ManiFeel.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 344,5 M de parámetros en FP32 los pesos ocupan aproximadamente 1,4 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (8 GB o más) una vez cargado el modelo.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 3090, RTX 4090, A100 o H100 son suficientes y de sobra para inferencia. Para reentrenamiento conviene una GPU con al menos 24 GB.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: LeRobot 0.6.1 y la herramienta robo-synapse; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TA-VLA (DP backbone) · ManiFeel `plug` | 344,5 M | no aplica | 51,0 % éxito en `plug` | no disponible | Hugging Face (LeRobot) |
| Otras políticas ManiFeel del mismo benchmark | no disponible | no aplica | no disponible | no disponible | no disponible |
| Diffusion Policy original (Chi et al.) | no disponible en esta ficha | no aplica | no disponible | no disponible | pública (paper/código) |
| Otras políticas táctiles para Franka Panda | no disponible | no aplica | no disponible | no disponible | no disponible |

La información proporcionada no incluye resultados numéricos de modelos alternativos, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea `plug` con un Franka Panda y una configuración sensórica concreta (cámara de muñeca y sensor táctil derecho); no generaliza a otras tareas sin reentrenamiento.
- Tasa de éxito moderada: el 51,0 % implica que aproximadamente la mitad de los episodios fallan bajo el protocolo declarado, lo que lo hace inadecuado para producción sin mejoras.
- Licencia no declarada: la ausencia de licencia impide conocer las condiciones de uso comercial; debe tratarse como no apto para explotación comercial hasta que el autor la especifique.
- Sin información sobre sesgos, alucinación o robustez fuera de distribución; al ser una política de control, el riesgo relevante es el fallo físico del robot, no la alucinación textual.
- Dependencia de la versión de LeRobot (0.6.1) y de la receta robo-synapse, lo que puede dificultar la reproducibilidad con otras versiones.
- Sin variantes cuantizadas publicadas ni documentación de latencia, lo que limita la planificación de despliegues en tiempo real.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que reduce la validación comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-tavla-plug
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_plug
- Receta y código (robo-synapse, PR 2): https://github.com/kwk2696/robo-synapse/pull/2
