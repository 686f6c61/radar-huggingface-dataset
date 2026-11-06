# Semdekker/mae-finetuned

## Resumen

`Semdekker/mae-finetuned` es un repositorio experimental publicado en HuggingFace por el usuario Semdekker que contiene una implementación propia de una arquitectura denominada Mae, orientada a tareas de retrieval (recuperación de información). No se trata de un modelo entrenado ni evaluado: la model card indica explícitamente que el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests) y que no se presenta como un checkpoint con benchmarks. El repositorio incluye el código (`model.py`), la configuración de arquitectura (`config.json`) y los hiperparámetros de entrenamiento por defecto (`training_args.json`).

La relevancia de este repositorio es, por tanto, la de un artefacto de investigación reproducible más que la de un modelo listo para producción. Su interés radica en la combinación de decisiones arquitectónicas poco habituales (atención lineal, fusión tensorial, activación mish, normalización scalenorm) documentadas de forma transparente y empaquetadas para que otros investigadores puedan inspeccionarlas y extenderlas antes de lanzar un entrenamiento completo.

El tamaño declarado en los safetensors es de 33.088 parámetros, un valor extremadamente reducido que confirma que se trata de un esqueleto de inicialización, no de un modelo con capacidad funcional real. No hay información sobre idiomas soportados, pipeline declarado ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mae (implementación propia; transformer con atención lineal) |
| Parámetros totales | 33.088 (según safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura declarada es Mae, una implementación propia de escala "base" que emplea atención lineal, fusión tensorial (tensor fusion), activación mish y normalización scalenorm. La model card no detalla el número de capas, dimensiones ocultas, cabezas de atención ni el mecanismo exacto de fusión tensorial, por lo que estos datos deben consultarse directamente en `config.json` del repositorio.

No se ha completado ningún entrenamiento: el autor indica que la receta incluida (AdamW con schedule de warmup lineal) son valores de partida del script y no evidencia de una ejecución finalizada. No hay información sobre volumen de tokens, composición del dataset, ni sobre etapas de RLHF, DPO o ajuste supervisado. La model card recomienda que cualquier evaluación significativa entrene todos los baselines con la misma exposición de datos, presupuesto de tuning y semillas aleatorias, y sugiere Flickr30k como primer conjunto de evaluación con métrica reportada en al menos tres semillas y un baseline de capacidad equivalente.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el checkpoint es una inicialización sin entrenamiento.
- El repositorio está orientado a retrieval, pero no hay evidencia de que el modelo realice recuperación efectiva.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe.
- No se documenta modo thinking, visión, audio ni ninguna modalidad adicional.
- La implementación es custom, por lo que las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso.

## Casos de uso

- Investigación sobre arquitecturas de retrieval: el repositorio sirve como base reproducible para inspeccionar y modificar decisiones de diseño (atención lineal, fusión tensorial) antes de invertir en un entrenamiento completo.
- Pruebas de humo de pipelines de entrenamiento: `model.py` incluye un bloque `__main__` con un ejemplo ejecutable que permite validar que el entorno, las dependencias y el flujo de datos funcionan antes de escalar.
- Reproducción de baselines académicos: la receta AdamW con warmup lineal y la configuración en `training_args.json` permiten fijar un punto de partida comparable frente a otros métodos en experimentos controlados.
- Evaluación comparativa en Flickr30k: el autor sugiere explícitamente este conjunto para medir la tarea de retrieval con al menos tres semillas y un baseline de capacidad equivalente.
- Docencia y formación: el código es un ejemplo compacto de implementación de atención lineal y normalización scalenorm para cursos o talleres sobre arquitecturas alternativas.
- Punto de partida para fine-tuning propio: al liberarse bajo MIT, un equipo puede partir de esta base, adaptarla a su dominio y documentar sus propios resultados por separado de los valores por defecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 33.088 parámetros; cualquier GPU consumer moderna es sobradamente suficiente.
- GPU recomendadas: no aplica para un checkpoint de inicialización; cualquier GPU (incluidas integradas) puede cargarlo.
- Cabe en GPU consumer: sí, en cualquier modelo, dado el tamaño ínfimo del checkpoint.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser una implementación custom, requiere el adaptador explícito mencionado en la model card.
- Latencia y throughput estimados: no disponibles; sin entrenamiento no hay rendimiento significativo que medir.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada, y el repositorio no establece comparaciones con alternativas de retrieval.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce recuperaciones útiles ni texto coherente.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento en contextos largos, porque no existe evaluación.
- La licencia es MIT, permisiva para uso comercial, pero el autor advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto incluidos en este repositorio.
- La implementación custom puede no ser compatible con APIs de carga automática sin un adaptador explícito.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Semdekker/mae-finetuned
