# lair-nyu/sanity15k_annealing

## Resumen

`sanity15k_annealing` es un checkpoint de entrenamiento publicado por el grupo LAIR de la Universidad de Nueva York (lair-nyu) en Hugging Face. Según la model card, se trata de una ejecución de verificación (sanity check) sobre un subconjunto de tareas de manipulación física (4-task pnp) utilizando el backbone pi0.5 de Physical Intelligence, entrenado con el framework openpi. El objetivo de esta ejecución era validar la corrección del programa de decaimiento de la tasa de aprendizaje (cosine decay) ajustado a 15 000 pasos, en contraste con una ejecución anterior que usaba un valor incorrecto.

El modelo se presenta como un checkpoint en el paso 14 999, con pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), pero sin el estado del optimizador necesario para reanudar el entrenamiento. No se proporcionan detalles sobre la arquitectura interna, el número de parámetros, la licencia o los idiomas soportados. Dado que se basa en pi0.5, se infiere que es un modelo de visión-lenguaje-acción (VLA) orientado a control robótico, pero esta información no está confirmada en la documentación disponible.

La relevancia de este checkpoint es principalmente metodológica: sirve como referencia para reproducir experimentos de entrenamiento con openpi y validar configuraciones de programación de tasa de aprendizaje. No está pensado como un modelo de propósito general para desarrolladores, sino como un artefacto de investigación dentro de un pipeline de entrenamiento de políticas robóticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en pi0.5, probablemente VLA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (contiene `params/` y `assets/`, probablemente safetensors) |

## Arquitectura y entrenamiento

La model card indica que el modelo utiliza el backbone pi0.5 de Physical Intelligence, entrenado con el framework openpi sobre el conjunto de datos `icl-dataset`. Se trata de una ejecución de sanity check sobre un subconjunto de 4 tareas de tipo "pnp" (probablemente pick-and-place), con 15 000 pasos de entrenamiento, batch size 128 y hardware de 2xH200. La corrección principal respecto a una ejecución anterior fue ajustar `lr_schedule.decay_steps` a 15 000 para que el decaimiento coseno completara su ciclo completo.

No se dispone de información sobre la arquitectura interna (número de capas, dimensiones, mecanismos de atención, etc.), ni sobre la composición del dataset de entrenamiento, ni sobre técnicas como RLHF o DPO. Dado que pi0.5 es un modelo VLA, se asume que combina codificación visual y de lenguaje con generación de acciones, pero esto no está documentado en la ficha.

## Capacidades

- No se han documentado capacidades específicas en la información proporcionada.
- Al ser un checkpoint de un modelo pi0.5, se espera que pueda generar acciones de control para robótica, pero no hay evidencia de ello en la model card.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües.
- No se indica si el modelo tiene modo de pensamiento, visión o audio.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite verificar la configuración de entrenamiento con openpi y el efecto del decaimiento coseno en el rendimiento de políticas robóticas.
- Desarrollo de políticas de control robótico: si se dispone del entorno adecuado, los pesos podrían desplegarse para tareas de manipulación física, aunque no se especifican los detalles de despliegue.
- Benchmarking de configuraciones de entrenamiento: sirve como referencia para comparar con otras ejecuciones del mismo tipo.
- Estudio de la estabilidad del entrenamiento: al ser un sanity check, puede usarse para analizar la convergencia y el comportamiento del optimizador.
- Integración en pipelines de openpi: los pesos podrían cargarse en el framework openpi para continuar experimentos o evaluar el rendimiento en tareas similares.
- No se recomienda su uso en aplicaciones de producción sin una evaluación exhaustiva, dado que es un artefacto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPUs recomendadas en la documentación.
- El entrenamiento se realizó con 2xH200, lo que sugiere que la inferencia podría requerir hardware de gama alta, pero no hay datos concretos.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El checkpoint es específico de un experimento de investigación y no se conocen alternativas equivalentes en el mismo contexto.

## Limitaciones y advertencias

- No se ha documentado la licencia, por lo que el uso comercial no está garantizado.
- El modelo es un checkpoint intermedio de un experimento de sanity check, no un modelo final optimizado para producción.
- No se incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde este punto.
- No se han evaluado sesgos, alucinaciones o limitaciones de contexto.
- La ausencia de información sobre arquitectura y parámetros impide evaluar su idoneidad para tareas fuera del ámbito robótico.
- Se desconoce si el modelo tiene capacidades de generalización más allá de las 4 tareas del subconjunto de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/lair-nyu/sanity15k_annealing)
- [Perfil de la organización lair-nyu](https://huggingface.co/lair-nyu/models)
- [Repositorio de openpi](https://github.com/Physical-Intelligence/openpi) (mencionado en la model card)
