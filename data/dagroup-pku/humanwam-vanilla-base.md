# DAGroup-PKU/HumanWAM-Vanilla-Base

## Resumen

HumanWAM-Vanilla-Base es un checkpoint de preentrenamiento de un world-action model (WAM) orientado a robótica, desarrollado por DAGroup-PKU. El modelo se ha entrenado sobre 50.000 horas de datos egocéntricos humanos procedentes del dataset Open-HumanScale-50K, con el objetivo de servir como inicialización para el post-entrenamiento de políticas robóticas. Se publica en dos etapas: un checkpoint preentrenado (paso 40.000) y una continuación mid-trained sobre datos multi-vista EgoPro (paso 10.000), que es la inicialización utilizada por la política RoboTwin liberada por los mismos autores.

La relevancia de esta publicación radica en su enfoque "weights-first": se distribuyen únicamente los pesos en formato PyTorch, sin estadísticas de normalización, configuraciones de inferencia ni recursos de despliegue, que se añadirán por separado. Esto implica que el repositorio no es un paquete ejecutable por sí mismo y requiere la implementación HumanWAM correspondiente, además de recursos específicos por etapa. El modelo está etiquetado para robótica, modelos mundo-acción y datos egocéntricos, y su idioma declarado es el inglés.

El tamaño del repositorio es de 24,1 GB, con dos ficheros de aproximadamente 12 GB cada uno, lo que sugiere un modelo de escala media-alta cuyos parámetros exactos no se detallan en la información disponible. No se han publicado datos sobre arquitectura interna, longitud de contexto, cuantizaciones ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model para robótica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Por las etiquetas y el nombre (world-action model), se trata de un modelo orientado a predecir dinámicas del mundo y acciones en entornos robóticos, pero no se especifica si emplea un transformer, un modelo híbrido o una arquitectura específica para robótica. Tampoco se indican el número de parámetros ni la composición exacta de las capas.

El entrenamiento se organiza en dos etapas. La primera es un preentrenamiento sobre 50.000 horas de datos egocéntricos humanos del dataset Open-HumanScale-50K, con 40.000 pasos locales. La segunda es una adaptación mid-trained multi-vista denominada EgoPro (setting W0), de 10.000 pasos, inicializada desde el checkpoint anterior. No se documentan el número de tokens, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras innovaciones de entrenamiento.

## Capacidades

- Modelo de mundo-acción para robótica: diseñado para modelar dinámicas y generar acciones en entornos de manipulación.
- Preentrenamiento sobre datos egocéntricos humanos: aprende representaciones a partir de vídeo en primera persona.
- Adaptación multi-vista (EgoPro): el checkpoint mid-trained incorpora datos de múltiples vistas.
- Inicialización para post-entrenamiento robótico: sirve como punto de partida para políticas específicas de tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Post-entrenamiento de políticas de manipulación robótica: el checkpoint mid-trained se usa como inicialización para adaptar el modelo a tareas concretas de robot, como la política RoboTwin liberada por los autores.
- Investigación en world-action models: permite reproducir o extender el preentrenamiento sobre datos egocéntricos humanos para estudiar representaciones de dinámica y acción.
- Adaptación a nuevos embodiment: al ser un checkpoint base, se puede ajustar a distintos robots siempre que se alineen las transformaciones de acción y las estadísticas de normalización.
- Benchmarking de transferencia humano-robot: facilita experimentos sobre cuánto conocimiento egocéntrico humano se transfiere a políticas robóticas.
- Desarrollo de sistemas de imitación a partir de vídeo en primera persona: el preentrenamiento sobre 50.000 horas de datos egocéntricos es adecuado para inicializar modelos que aprenden de demostraciones humanas.
- Evaluación en entornos simulados tipo RoboTwin/RoboDojo: los checkpoints están pensados para integrarse en las políticas específicas de estos entornos publicadas por los autores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; cada checkpoint ocupa aproximadamente 12 GB en disco (24,1 GB el repositorio completo), por lo que la inferencia en precisión completa requeriría al menos esa cantidad de memoria más overhead.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño de los pesos, probablemente requiere GPUs de gama alta o profesional, pero no se especifica.
- Opciones de despliegue: requiere la implementación HumanWAM y recursos específicos por etapa; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento para establecer una comparación.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Publicación "weights-first": faltan estadísticas de normalización, configuraciones e inferencia; los ficheros no son un paquete ejecutable por sí solos.
- Requiere la implementación HumanWAM y recursos específicos por etapa para funcionar.
- Las transformaciones de acción y las estadísticas de normalización deben coincidir con la etapa de entrenamiento y el embodiment de destino.
- Idioma declarado únicamente inglés.
- No se documentan sesgos, riesgo de alucinación ni limitaciones de contexto.
- No se han publicado benchmarks que permitan validar el rendimiento de forma independiente.

## Enlaces

- [Hugging Face: DAGroup-PKU/HumanWAM-Vanilla-Base](https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-Base)
- [Código y documentación del proyecto](https://github.com/ucasmjc/OpenHumanScale)
- [Dataset Open-HumanScale-50K](https://huggingface.co/datasets/DAGroup-PKU/Open-HumanScale-50K)
- [HumanWAM-Vanilla-RoboTwin](https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-RoboTwin)
- [HumanWAM-Vanilla-RoboDojo](https://huggingface.co/DAGroup-PKU/HumanWAM-Vanilla-RoboDojo)
