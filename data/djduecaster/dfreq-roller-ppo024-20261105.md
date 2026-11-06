# djduecaster/dfreq-roller-ppo024-20261105

## Resumen

`dfreq-roller-ppo024-20261105` es un checkpoint de investigación de aprendizaje por refuerzo (PPO, Proximal Policy Optimization) publicado por el usuario djduecaster en Hugging Face. No se trata de un modelo de lenguaje: es una política de control entrenada para un entorno de simulación denominado "microduck-arena", en la que un agente ("roller") debe completar un recorrido a una velocidad de comando fija de 1,1 m/s. El modelo recibe 61 observaciones y emite 14 acciones, y se distribuye en formato ONNX para inferencia en CPU (con un run de entrenamiento realizado en MPS/Apple Silicon).

El checkpoint corresponde a la iteración 24 de una serie de ejecuciones diarias de PPO y se presenta explícitamente como un "candidato de puntos", no como una mejora ni una candidatura al podio. El autor declara métricas de compatibilidad local (5/5 finalizaciones, 128/128 finalizaciones en validación de arranque ordinario y 64/64 en validación de estrés de comando) dentro de un presupuesto de no inferioridad de +0,030 s frente a la línea base general.

Su relevancia es limitada y muy específica: sirve como artefacto reproducible de un pipeline de RL aplicado a control motor en un entorno propietario o de nicho, y como referencia para quien investigue políticas PPO compactas exportadas a ONNX. No aporta capacidades de lenguaje, visión ni razonamiento general, y no debe confundirse con un LLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con PPO (red neuronal no especificada); entrada de 61 observaciones, salida de 14 acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la "ventana" es la observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (exportado a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible en los metadatos; el autor remite a `upstream-base-card.md` y `LICENSE-NOTE.txt` para términos heredados |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible indica únicamente que se trata de un checkpoint PPO ("Genuine native CPU physics / MPS PPO checkpoint 24") procedente de un run de entrenamiento en MPS. El agente opera sobre un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, en un entorno con física simulada nativa en CPU y un accesorio de tipo "roller", con un comando de velocidad fijo de 1,1 m/s. No se detalla la topología de la red (número de capas, anchura, función de activación), el número de pasos de entrenamiento, el tamaño del dataset de rollouts ni la configuración del optimizador.

El autor afirma explícitamente que no se añadió tabla de semillas, ni nuevas entradas privilegiadas, ni imitación de oponentes de terceros, lo que sugiere que el checkpoint respeta las restricciones del entorno de evaluación ("microduck-arena"). Se documenta un presupuesto de no inferioridad de +0,030 s frente a la línea base general, y se advierte de que las puntuaciones del servidor oficial pueden diferir de los resultados locales en Mac.

## Capacidades

- Control motor en un entorno simulado: produce 14 acciones por paso a partir de 61 observaciones.
- Finalización de recorridos a comando fijo de 1,1 m/s (5/5 en evaluación local de cinco arranques; 128/128 en validación de arranque ordinario; 64/64 en validación de estrés de comando).
- Inferencia en CPU mediante exportación ONNX.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de modo "thinking" ni de cualquier capacidad cognitiva declarada.

## Casos de uso

- Reproducción de experimentos de RL en control motor: el checkpoint permite reejecutar la política PPO024 sobre el entorno microduck-arena y comparar la puntuación local (2,718 s, 5/5 finalizaciones) con la del servidor oficial.
- Evaluación de robustez ante comandos: la validación de estrés de comando (64/64 finalizaciones) sirve para estudiar la tolerancia de la política a variaciones en la señal de velocidad.
- Integración en pipelines de inferencia ONNX en CPU: al estar exportado a ONNX, puede cargarse con `onnxruntime` en entornos sin GPU para pruebas de latencia y determinismo.
- Referencia para comparación de checkpoints: útil para contrastar la iteración 24 con el mejor registro publicado del mismo autor (2,570 s) y analizar la evolución del entrenamiento.
- Docencia y divulgación sobre PPO: ejemplo compacto de política con espacios de observación y acción bien definidos (61 y 14 dimensiones) para ilustrar el ciclo entrenamiento-evaluación.
- Auditoría de cumplimiento de reglas del entorno: el autor declara ausencia de tabla de semillas, entradas privilegiadas e imitación de terceros, lo que permite verificar las restricciones del "microduck-arena" en un contexto de investigación.

## Benchmarks y rendimiento

| Metrica | Resultado declarado |
|---|---|
| Puntuación de compatibilidad con evaluador original (comando fijo, cinco arranques) | 2,718 s; 5/5 finalizaciones |
| Validación de arranque ordinario | 128/128 finalizaciones |
| Validación de estrés de comando | 64/64 finalizaciones |
| Presupuesto de no inferioridad frente a línea base general | +0,030 s |
| Mejor registro publicado del mismo autor ("Roller best") | 2,570 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para inferencia en CPU vía ONNX, por lo que no requiere GPU.
- GPU recomendadas: no aplica; el autor menciona entrenamiento en MPS (Apple Silicon) e inferencia nativa en CPU.
- Compatibilidad con GPU de consumo: no relevante para la inferencia; el artefacto es ONNX y de tamaño ínfimo (repo de 0,0 GB).
- Opciones de despliegue: `onnxruntime` (CPU o MPS), integración en el evaluador de microduck-arena.
- Latencia y throughput: no disponibles; solo se reporta la métrica de tarea (2,718 s de puntuación de compatibilidad), no latencia por paso ni pasos por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dfreq-roller-ppo024-20261105 | Política PPO (ONNX) | no disponible | no aplica | 2,718 s; 5/5 finalizaciones | no disponible | Hugging Face |
| Roller best (mismo autor) | Política PPO | no disponible | no aplica | 2,570 s | no disponible | Referenciado en la model card |
| Tug cup entrant (mismo autor) | Política PPO | no disponible | no aplica | no disponible | no disponible | Referenciado en la model card |

No se dispone de información sobre modelos comparables de otros autores en la misma categoría (control motor en microduck-arena) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni procesa documentos.
- El autor lo describe como "candidato de puntos", no como una mejora ni una candidatura al podio; el mejor registro del propio autor (2,570 s) sigue siendo superior.
- Las puntuaciones del servidor oficial pueden diferir de los resultados locales en Mac, por lo que las métricas declaradas no son directamente transferibles.
- La licencia no está especificada en los metadatos; el autor remite a `upstream-base-card.md` y `LICENSE-NOTE.txt`, cuyo contenido no se ha proporcionado. No se puede confirmar el uso comercial.
- El checkpoint está atado a un entorno concreto (microduck-arena, accesorio roller, comando fijo de 1,1 m/s); fuera de ese entorno su utilidad es nula.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no aplican a este tipo de artefacto.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB; no hay evidencia de validación por terceros.
- El hash SHA256 declarado (`f27c33e8b634f7b7bccf7dca93eae4d3e5ed116de4f156e7732ff16ef58c676e`) permite verificar la integridad del artefacto, pero no se ha comprobado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-roller-ppo024-20261105
- Model card del autor: incluida en la página anterior (sección README)
- Archivos de términos heredados citados por el autor: `upstream-base-card.md` y `LICENSE-NOTE.txt` (dentro del repositorio)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la búsqueda web.
