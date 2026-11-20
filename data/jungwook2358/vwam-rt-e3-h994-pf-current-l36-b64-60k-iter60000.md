# jungwook2358/vwam-rt-e3-h994-pf-current-l36-b64-60k-iter60000

## Resumen

vwam-rt-e3-h994-pf-current-l36-b64-60k-iter60000 es un checkpoint de entrenamiento de un modelo de robotica (visión-lenguaje-acción, VLA) desarrollado por el usuario jungwook2358. Forma parte del experimento EXP-0027 sobre el benchmark RoboTwin 2.0 con el robot aloha-agilex, dentro de una partición de tareas denominada Zero-WAM en la que se reservan siete tareas (`zerowam_unseen7`) para evaluar generalización. El modelo se entrena con datos de robot de 43 tareas y se co-entrena con vídeos humanos del dataset HumanGen (994 vídeos, incluidos los de las tareas reservadas).

La receta base es FRED-ICL E3: un backbone Cosmos3-Nano combinado con un ActionDiT entrenado desde cero bajo una arquitectura Mixture-of-Transformers (MoT), con canvas de 320 píxeles, chunks de 48 acciones, batch global de 64 y 60.000 iteraciones. Esta ejecución concreta añade una rama de movimiento pointflow (solo para entrenamiento) y aplica una ablación de número de capas: el flujo de puntos tiene 36 etapas y lee las 36 capas del backbone, en lugar de las 4 etapas sobre las capas 3, 5, 7 y 9 de la configuración de referencia. También emplea atención enmascarada por cámara, excluyendo los tiles negros de la muñeca.

El repositorio contiene únicamente el checkpoint `iter_000060000` tal como lo guardó el entrenador (formato torch DCP, 4 shards con pesos crudos y EMA, más el `config.yaml`), sin optimizador, scheduler ni estado del entrenador. No incluye resultados de evaluación ni métricas de rendimiento publicadas; para evaluarlo es necesario exportar una copia mínima con un script del árbol de código RLDX-2-VWAM (rama `jungwook/pf-layers`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT): backbone Cosmos3-Nano + ActionDiT desde cero, con rama pointflow de 36 etapas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | torch DCP (4 shards + `.metadata`), pesos crudos y EMA |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB (segun Hugging Face) |
| Canvas de entrada | 320 px |
| Chunk de acciones | 48 acciones |
| Batch global de entrenamiento | 64 |
| Iteraciones | 60.000 |

## Arquitectura y entrenamiento

El modelo sigue la receta FRED-ICL E3, que combina un backbone de visión-lenguaje Cosmos3-Nano con un ActionDiT entrenado desde cero. La integración se realiza mediante una arquitectura Mixture-of-Transformers (MoT), en la que distintos flujos de tokens (percepción y acción) se procesan en ramas separadas con atención compartida. La entrada visual se procesa en un canvas de 320 píxeles y la salida de control se emite en chunks de 48 acciones. El entrenamiento usa un batch global de 64 durante 60.000 iteraciones.

Esta ejecución incorpora dos modificaciones respecto a la receta base. Primero, una rama de movimiento pointflow que solo se usa durante el entrenamiento: el flujo de puntos consta de 36 etapas y lee las 36 capas del backbone, en lugar de las 4 etapas que leen las capas 3, 5, 7 y 9 en la configuración de referencia (ablación de número de capas). Segundo, se aplica atención enmascarada por cámara, que excluye los tiles negros de la muñeca para evitar que el modelo atienda a regiones sin información útil. Los datos de robot cubren 43 tareas de RoboTwin 2.0 con aloha-agilex, excluyendo las siete tareas de `zerowam_unseen7`, y se co-entrenan con los 994 vídeos humanos de HumanGen, incluidos los 140 correspondientes a las tareas reservadas.

## Capacidades

- Control robótico visomotor: genera secuencias de acciones en chunks de 48 pasos a partir de observaciones visuales en canvas de 320 px.
- Manipulación bimanual sobre el robot aloha-agilex en el simulador RoboTwin 2.0.
- Generalización a tareas no vistas: el split Zero-WAM reserva siete tareas para evaluar transferencia.
- Aprendizaje a partir de vídeo humano: el co-entrenamiento con HumanGen permite aprovechar demostraciones sin acción etiquetada.
- Rama pointflow de movimiento: representa flujos de puntos durante el entrenamiento, lo que puede aportar señal geométrica auxiliar.
- Atención enmascarada por cámara: ignora regiones ocluidas o sin información (tiles negros de la muñeca).
- No se documentan capacidades de tool calling, agentes, multilingüismo, thinking mode, visión general, audio ni generación de texto libre.

## Casos de uso

- Investigación en aprendizaje por imitación: el checkpoint sirve como punto de partida reproducible para estudiar el efecto de la ablación de capas en la rama pointflow sobre el rendimiento en RoboTwin 2.0.
- Evaluación de generalización zero-shot en manipulación: las siete tareas reservadas de `zerowam_unseen7` permiten medir la transferencia del modelo a habilidades no presentes en los datos de robot.
- Co-entrenamiento con vídeo humano: el modelo es útil para analizar cuánto aporta HumanGen (994 vídeos) al rendimiento en tareas con pocas demostraciones robóticas.
- Estudio de atención enmascarada por cámara: sirve para evaluar el impacto de excluir tiles negros de la muñeca en la calidad de las políticas visomotoras.
- Reproducción de la receta FRED-ICL E3: el `config.yaml` incluido permite replicar el pipeline de entrenamiento y comparar variantes.
- Base para fine-tuning en tareas concretas de aloha-agilex: partiendo del checkpoint `iter_000060000`, se puede adaptar a nuevas tareas de manipulación dentro del mismo entorno simulado.
- Análisis de arquitecturas MoT en robótica: útil para comparar el diseño de dos ramas (percepción y acción) frente a alternativas monolíticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: no disponible. El tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos no están subidos o que la medición no es fiable; no es posible estimar la VRAM a partir de los datos publicados.
- RAM para exportación: aproximadamente 70 GB, sin GPU, según la model card, para generar la copia eval-minimal con `vwam/eval/export_eval_minimal.py`.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: el flujo indicado por el autor es exportar la copia eval-minimal y ejecutar `vwam/eval/eval_robotwin_task.sh` sobre el árbol de código RLDX-2-VWAM (rama `jungwook/pf-layers`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vwam-rt-e3-h994-pf-current-l36-b64-60k-iter60000 | no disponible | no disponible | VLA para RoboTwin 2.0 (aloha-agilex) | other | Checkpoint DCP en Hugging Face |
| FRED-ICL E3 (receta base) | no disponible | no disponible | VLA con Cosmos3-Nano + ActionDiT | no disponible | Referenciado en la model card, sin enlace |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio contiene solo el checkpoint de entrenamiento (`iter_000060000`) y el `config.yaml`; no incluye optimizador, scheduler ni estado del entrenador, lo que impide reanudar el entrenamiento tal cual.
- No se publican métricas de evaluación ni resultados en las tareas reservadas, por lo que se desconoce su rendimiento real.
- El checkpoint está en formato torch DCP y requiere un paso de exportación previo (unos 70 GB de RAM) antes de poder evaluarlo.
- La evaluación depende de un árbol de código concreto (RLDX-2-VWAM, rama `jungwook/pf-layers`), lo que limita la portabilidad.
- El modelo está entrenado exclusivamente en simulación (RoboTwin 2.0) con el robot aloha-agilex; no hay evidencia de transferencia a hardware real.
- La licencia es "other", sin términos detallados en la información disponible; es necesario consultar al autor antes de cualquier uso comercial.
- No se documentan idiomas soportados ni sesgos conocidos.
- El repositorio aparece con 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que la métrica no es fiable.
- Riesgo de alucinación en el sentido de acciones no válidas: al ser un modelo de política, puede generar trayectorias fuera de distribución en escenarios distintos a los del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jungwook2358/vwam-rt-e3-h994-pf-current-l36-b64-60k-iter60000
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
