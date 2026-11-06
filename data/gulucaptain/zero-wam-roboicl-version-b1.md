# gulucaptain/zero-wam-roboicl-version-b1

## Resumen

Zero-WAM RoboICL Version B1 es un adaptador LoRA sobre el modelo base Zero-WAM (Robbyant-Research/zero-wam-pretrain), un modelo de política robótica video-acción desarrollado por Robbyant Research. El adaptador ha sido publicado por el usuario gulucaptain como parte de un programa de entrenamiento incremental (versiones A y B1) orientado a mejorar la generalización en tareas robóticas mediante aprendizaje en contexto (in-context learning, ICL).

Zero-WAM formula la generalización zero-shot a tareas robóticas como un problema de modelado mundo-acción en contexto: una única política causal video-acción acepta tanto instrucciones en lenguaje natural como vídeos de demostración humana como especificación de la tarea. El objetivo declarado es reducir el aprendizaje de atajos (shortcut learning) y reforzar el uso de los prompts de vídeo humano, demostrando generalización zero-shot en RoboTwin 2.0 y en configuraciones del mundo real sin recopilar datos de robot específicos ni actualizar los parámetros del modelo.

La versión B1 parte del adaptador de la Versión A (época 5) y añade un objetivo auxiliar de predicción semántica solo durante el entrenamiento: utiliza objetivos DINOv2 congelados en anclas latentes de consulta futura. En despliegue se emplea la arquitectura de inferencia de la Versión A con los pesos base de Zero-WAM correspondientes. El autor planifica veinte épocas de entrenamiento; el repositorio contiene los tensores del adaptador por época en Safetensors con sus sumas de comprobación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Zero-WAM: política causal video-acción; detalles de la arquitectura interna no especificados) |
| Parametros totales | no disponible (el repositorio contiene un adaptador LoRA, no los pesos completos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Safetensors (tensores del adaptador LoRA por época, con sumas de comprobación) |

## Arquitectura y entrenamiento

El adaptador B1 se construye sobre el modelo base Zero-WAM, que formula la generalización zero-shot de tareas robóticas como modelado mundo-acción en contexto mediante una única política causal video-acción. El modelo base emplea un objetivo de predicción de fragmentos futuros en contexto para reducir el aprendizaje de atajos y reforzar el uso de los prompts de vídeo humano. No se dispone de detalles adicionales sobre la arquitectura interna (número de capas, dimensión, mecanismo de atención) en la información proporcionada.

El entrenamiento de B1 parte del adaptador de la Versión A en la época 5 y añade un objetivo de predicción semántica que solo se aplica durante el entrenamiento: se usan objetivos DINOv2 congelados en anclas latentes de consulta futura. En el momento del despliegue, la arquitectura de inferencia es la de la Versión A con los pesos base de Zero-WAM correspondientes, de modo que el objetivo DINOv2 no introduce coste adicional en producción. El plan de entrenamiento contempla veinte épocas; el checkpoint de prueba de un solo paso queda excluido de la publicación. No se especifican el volumen de datos de entrenamiento, su composición ni el uso de RLHF o DPO.

## Capacidades

- Política robótica video-acción: genera acciones de robot condicionadas por instrucciones de tarea.
- Instrucciones multimodales: acepta tanto lenguaje natural como vídeos de demostración humana como especificación de la tarea.
- Generalización zero-shot a tareas no vistas: demostrada en RoboTwin 2.0 y en configuraciones del mundo real sin datos de robot específicos ni actualización de parámetros.
- Aprendizaje en contexto: una única política causal soporta múltiples tareas mediante prompts en contexto.
- Adaptación mediante LoRA: el adaptador permite ajustar el modelo base sin modificar sus pesos completos.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso en texto, capacidades multilingües ni modos de pensamiento (thinking mode).

## Casos de uso

- Manipulación robótica zero-shot: el modelo puede ejecutar tareas de manipulación en configuraciones no vistas utilizando una instrucción en lenguaje o un vídeo humano como especificación, sin recopilar datos de robot para esa tarea concreta.
- Prototipado rápido en RoboTwin 2.0: sirve para evaluar políticas video-acción en el simulador de referencia del proyecto antes de trasladar el comportamiento a hardware real.
- Especificación de tareas mediante vídeo: en entornos donde describir una tarea por texto es ambiguo, un vídeo de demostración humana actúa como prompt en contexto para definir la tarea.
- Investigación en aprendizaje en contexto para robótica: el adaptador permite estudiar el efecto de objetivos auxiliares (DINOv2 en anclas latentes) sobre la generalización sin reentrenar el modelo base.
- Ajuste eficiente con LoRA: equipos con recursos limitados pueden adaptar el modelo base a dominios concretos cargando únicamente los tensores del adaptador en Safetensors.
- Reproducibilidad de experimentos: las sumas de comprobación publicadas por época permiten verificar la integridad de los adaptadores y reproducir resultados intermedios del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye métricas numéricas; la documentación del proyecto Zero-WAM menciona demostraciones de generalización zero-shot en RoboTwin 2.0 y en configuraciones del mundo real, pero sin cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un adaptador LoRA, los requisitos vienen determinados por los pesos completos del modelo base Zero-WAM, cuyo tamaño no se especifica en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio declara la librería PyTorch y formato Safetensors).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de parámetros, contexto, rendimiento ni licencia de Zero-WAM ni de alternativas comparables, por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican los términos de uso, por lo que no puede confirmarse la viabilidad de uso comercial.
- Idiomas no disponibles: no se documenta el soporte multilingüe de las instrucciones en lenguaje natural.
- Estado del entrenamiento: el plan contempla veinte épocas y el repositorio publica adaptadores por época; los resultados pueden variar según la época seleccionada.
- Dependencia del modelo base: el adaptador requiere los pesos base Zero-WAM correspondientes; sin ellos no es funcional.
- Objetivo DINOv2 solo en entrenamiento: la predicción semántica con DINOv2 no está activa en despliegue, de modo que los beneficios observados en entrenamiento no se traducen en capacidades adicionales en inferencia.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; en políticas robóticas, los fallos se manifiestan como acciones incorrectas o inseguras en el entorno físico.
- Validación limitada: el modelo tiene cero descargas y cero likes en Hugging Face, sin evidencia de uso independiente en producción.
- Uso en hardware real: la generalización zero-shot demostrada en simulación y configuraciones del mundo real no exime de validar la seguridad y robustez antes de desplegar en robots físicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gulucaptain/zero-wam-roboicl-version-b1
- Modelo base: https://huggingface.co/Robbyant-Research/zero-wam-pretrain
- Adaptador Versión A: https://huggingface.co/gulucaptain/zero-wam-roboicl-version-a
- Repositorio GitHub de Zero-WAM: https://github.com/robbyant-research/Zero-WAM
- Página del proyecto Zero-WAM: https://robbyant-research.github.io/Zero-WAM/
