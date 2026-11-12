# guitarorangedog/manifeel-tavla-usb

## Resumen

TA-VLA (DP backbone) es un checkpoint de política robótica entrenado con la librería LeRobot 0.6.1 dentro del proyecto robo-synapse, publicado por el usuario guitarorangedog bajo el identificador `manifeel-tavla-usb`. El modelo resuelve el problema de control viso-táctil de un brazo Franka Panda en una tarea de manipulación concreta (el entorno ManiFeel `usb`), tomando como entrada la imagen de una cámara de muñeca y una imagen táctil del sensor del efector final. No es un modelo de lenguaje: es una policy de imitación para robótica.

Técnicamente se trata de una Diffusion Policy (DP) usada como backbone de una arquitectura denominada TA-VLA (Tactile-Aware Vision-Language-Action). El checkpoint tiene 344.505.100 parámetros en formato safetensors y un repositorio de 1,4 GB. El autor reporta una tasa de éxito del 46,0 % medida sobre 4 semillas × 50 episodios con un máximo de 500 pasos por episodio.

Su relevancia es acotada pero concreta: sirve como baseline reproducible para investigación en manipulación viso-táctil con Franka Panda, con receta de entrenamiento abierta en un pull request del repositorio robo-synapse. No hay información publicada sobre licencia ni sobre idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (backbone de TA-VLA, Tactile-Aware Vision-Language-Action) |
| Parámetros totales | 344.505.100 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es una Diffusion Policy, un enfoque de imitación que genera trayectorias de acción mediante un proceso de difusión condicionado por observaciones. En este caso, las observaciones combinan la imagen de una cámara de muñeca y una imagen táctil (`tacimg`) del sensor del efector final del Franka Panda. La denominación TA-VLA sugiere una variante con componente táctil explícito dentro de un esquema visión-lenguaje-acción, aunque la model card no detalla la composición interna de la red ni el número de pasos de difusión.

El entrenamiento se realizó con robo-synapse sobre LeRobot 0.6.1, usando el dataset `RoboSynapse/manifeel-tacr_franka-panda_usb`. Los hiperparámetros declarados son: semilla 1000, precisión mixta (AMP) y aumento de datos desactivado. No se especifica el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este dominio, pero tampoco se documentan alternativas como DAgger o refuerzo offline). No se documentan innovaciones técnicas adicionales más allá del uso conjunto de entrada táctil y visual.

## Capacidades

- Control robótico de manipulación para un brazo Franka Panda en la tarea ManiFeel `usb`.
- Fusión de percepción visual (cámara de muñeca) y percepción táctil (imagen del sensor táctil `tacimg`).
- Generación de trayectorias de acción por difusión condicionada a observaciones multimodal.
- Ejecución de episodios de hasta 500 pasos.
- Entrenamiento reproducible mediante receta abierta en robo-synapse (LeRobot 0.6.1).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: es una política de control, no un modelo generativo de texto.
- No se documentan modos de razonamiento, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Baseline de investigación en manipulación viso-táctil: sirve como punto de partida para comparar nuevas políticas táctiles sobre Franka Panda en la tarea `usb`, con una tasa de éxito de referencia del 46,0 %.
- Reproducción de experimentos: la receta publicada en el PR de robo-synapse permite reentrenar el checkpoint con LeRobot 0.6.1 y verificar resultados con las mismas semillas y configuración (semilla 1000, AMP, sin aumento).
- Estudio de ablación de sensores: al combinar cámara de muñeca e imagen táctil, permite evaluar la contribución de la modalidad táctil frente a políticas puramente visuales en tareas de inserción.
- Desarrollo de pipelines de evaluación estandarizados: el protocolo de 4 semillas × 50 episodios y 500 pasos máximos puede reutilizarse como banco de pruebas para nuevas políticas.
- Integración en entornos LeRobot: al cargarse con la librería lerobot, puede desplegarse en infraestructura de robótica que ya use ese ecosistema para tareas de pick-and-place e inserción.
- Docencia y formación en robótica de imitación: un checkpoint pequeño (344 M de parámetros, 1,4 GB) y con métricas declaradas es adecuado para prácticas sobre diffusion policies y percepción táctil.

## Benchmarks y rendimiento

| Métrica | Valor | Protocolo |
|---|---|---|
| Tasa de éxito (ManiFeel `usb`) | 46,0 % | 4 semillas × 50 episodios, máximo 500 pasos |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otras políticas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 344,5 M de parámetros en safetensors (1,4 GB de repositorio), la inferencia en FP32 requeriría del orden de 1,4 GB solo para pesos, más el coste de las imágenes de entrada y del proceso de difusión.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos; no hay datos de latencia ni throughput.
- GPU de consumo: previsiblemente cabe en tarjetas consumer modernas (RTX 3060 en adelante) por el tamaño del checkpoint, aunque no está verificado en la documentación.
- Opciones de despliegue: librería LeRobot (declarada como `library_name`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de Diffusion Policy o TA-VLA con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Especialización estrecha: entrenado para una única tarea (ManiFeel `usb`) sobre un único robot (Franka Panda); no es un modelo generalista.
- Tasa de éxito moderada: 46,0 % implica que más de la mitad de los episodios fallan en el protocolo declarado.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de usarlo en producción.
- Sin información sobre sesgos, alucinación o robustez fuera de distribución; en robótica estos riesgos se traducen en fallos físicos y posibles daños al entorno.
- Repositorio sin descargas ni likes y creado en 2026-11-12: no hay evidencia de validación externa ni de mantenimiento.
- Entrenado con aumento de datos desactivado, lo que puede reducir la generalización a variaciones de iluminación, posición o textura.
- Dependencia de la versión LeRobot 0.6.1 y de la receta concreta de robo-synapse; cambios de versión pueden romper la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitarorangedog/manifeel-tavla-usb
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_usb
- Código y receta (PR): https://github.com/kwk2696/robo-synapse/pull/2
