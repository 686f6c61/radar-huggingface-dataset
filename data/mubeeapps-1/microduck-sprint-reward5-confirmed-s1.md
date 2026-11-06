# mubeeapps-1/microduck-sprint-reward5-confirmed-s1

## Resumen

MicroDuck Sprint reward5 (seed1) es una política de control para robótica entrenada mediante aprendizaje por refuerzo (PPO) para resolver la tarea de sprint de 2 metros con el robot cuadrúpedo MicroDuck de Pollen Robotics. Lo desarrolla el usuario mubeeapps-1 y se publica como checkpoint seleccionado de un estudio local de entrenamiento, no como un modelo de lenguaje ni un sistema multimodal: es un artefacto de política (policy) exportado a ONNX que mapea 61 observaciones a 14 acciones a 50 Hz.

El modelo se entrena desde cero con 4096 entornos paralelos, 3000 iteraciones y semilla 1, con una función de recompensa de seguimiento hacia delante (reward5), una asignación constante del 2 % para mantenerse de pie y una pérdida de consistencia de espejo de 0,5. La arquitectura del actor es un MLP de 512/256/128 con activaciones ELU, y el normalizador de observaciones está embebido en el propio grafo ONNX para simplificar el despliegue.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de un pipeline de RL con MuJoCo/MJLab para el reto MicroDuck, y el autor documenta de forma explícita las limitaciones del estudio (tres semillas, resultados solo en simulación, sin pruebas físicas). No hay resultados de benchmarks estándar de IA ni datos de licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP actor 512/256/128 con activaciones ELU (política de RL, no transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (exportación ONNX; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (normalizador de observaciones embebido en el grafo) |

## Arquitectura y entrenamiento

La política es un perceptrón multicapa con capas de 512, 256 y 128 neuronas y activación ELU, que recibe un vector de 61 observaciones y produce 14 acciones de control a 50 Hz. Se entrena con PPO desde cero en 4096 entornos simulados en paralelo durante 3000 iteraciones, usando la tarea Mjlab-Sprint2m-MicroDuck del repositorio microduck-challenges de Pollen Robotics (commit 4b675ebf4d7c7b961cd78da94bfc37ca1686d321) con el parche recipe.patch incluido en el repositorio.

La receta incorpora una recompensa de seguimiento hacia delante (reward5), una asignación constante del 2 % para la condición de mantenerse de pie y una pérdida de consistencia de espejo de 0,5. El checkpoint publicado es el 2999 de la semilla 1, que el autor identifica como el único entrenamiento sin interrupciones. No se realizó ajuste sobre conjunto de validación (holdout tuning) y no se documentan datos de entrenamiento adicionales más allá de la configuración del simulador.

## Capacidades

- Control locomotor de sprint en simulación para el robot cuadrúpedo MicroDuck: genera 14 acciones a partir de 61 observaciones a 50 Hz.
- Seguimiento de comandos de velocidad hacia delante (comando 1,20 en la evaluación local estándar).
- Mantenimiento de la postura (asignación constante del 2 % de la recompensa para mantenerse de pie).
- Consistencia ante espejo del estado mediante la pérdida de simetría incorporada en el entrenamiento.
- Exportación a ONNX con normalización de observaciones integrada, lo que permite inferencia directa sin preprocesado externo.
- No dispone de tool calling, capacidades de agente, multilingüismo, visión, audio ni modo de razonamiento: es exclusivamente una política de control motor.

## Casos de uso

- Evaluación reproducible del reto MicroDuck Sprint: sirve como artefacto de referencia para comparar recetas de recompensa y semillas dentro del simulador MJLab, aplicando el parche recipe.patch sobre el repositorio base.
- Investigación en RL con entornos masivamente paralelos: el modelo documenta una configuración concreta de 4096 entornos y 3000 iteraciones que puede replicarse para estudiar la varianza entre semillas.
- Estudio de sensibilidad a la semilla: los resultados publicados (medias de 1,894 s, 11,5225 s y 11,4935 s para las semillas 1, 2 y 3) permiten analizar la estabilidad del entrenamiento PPO en esta tarea.
- Despliegue en simulación para pruebas de control: al estar en ONNX con normalizador embebido, puede cargarse en un runtime de inferencia y ejecutarse contra el simulador para validar el comportamiento del robot.
- Base para transferencia a hardware: aunque no hay pruebas físicas, la política puede usarse como punto de partida para experimentos de sim-to-real en el robot MicroDuck, con la cautela de que el autor no ha validado el comportamiento en el robot real.
- Docencia y divulgación de RL aplicado a robótica: el repositorio incluye evidencia por ensayo y un parche reproducible, lo que facilita usarlo como ejemplo de pipeline completo de entrenamiento y selección de checkpoint.

## Benchmarks y rendimiento

Resultados locales en simulación publicados por el autor (no son puntuaciones oficiales):

| Metrica | Resultado |
|---|---|
| Arena estándar local | 1,913 s, 5/5, comando 1,20 |
| Política seleccionada, arranques 26-45 | media 1,894 s, 20/20 |
| Política seleccionada, arranques nuevos 46-65 | media 1,894 s, 20/20 |
| Campeón previo publicado (comando 0,80) | 2,75375 s, 20/20 |
| Semilla 1 (reward5) | media 1,894 s, 20/20 finalizaciones |
| Semilla 2 (reward5) | media 11,5225 s, 16/20 finalizaciones |
| Semilla 3 (reward5) | media 11,4935 s, 16/20 finalizaciones |
| Semilla 1 (reward4) | media 2,754 s, 20/20 |
| Semilla 2 (reward4) | media 2,667 s, 20/20 |
| Semilla 3 (reward4) | media 7,522 s, 18/20 |

Cada fallo se contabiliza como 50 s. La diferencia media emparejada es de +3,989 s, por lo que el autor concluye que la receta no fue fiablemente superior entre semillas de entrenamiento. No se han publicado resultados de benchmarks estándar de IA (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo es un MLP pequeño exportado a ONNX y el tamaño del repositorio es de 0,0 GB, por lo que la huella de memoria es mínima.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime debería bastar para la inferencia de la política.
- GPU de consumo: sí, previsiblemente cabe en cualquier GPU de consumo e incluso podría ejecutarse en CPU, aunque el autor no lo documenta.
- Opciones de despliegue: ONNX Runtime (formato publicado); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; la política opera a 50 Hz en el bucle de control del simulador, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-sprint-reward5-confirmed-s1 | Política RL (MLP 512/256/128, ONNX) | no disponible | no aplica (61 observaciones) | 1,894 s de media, 20/20 en simulación local | no disponible | Hugging Face |
| Campeón previo publicado (referencia del autor) | Política RL para la misma tarea | no disponible | no aplica | 2,75375 s, 20/20 con comando 0,80 | no disponible | Referenciado en la model card |
| Variantes reward4 del mismo estudio | Políticas RL para la misma tarea | no disponible | no aplica | 2,754 s / 2,667 s / 7,522 s según semilla | no disponible | No publicadas como artefactos independientes |

No se dispone de información sobre otros modelos comparables de la misma categoría fuera del estudio del autor.

## Limitaciones y advertencias

- El propio autor declara que no hay ninguna afirmación de estado del arte ni de reproducibilidad: se publica un artefacto seleccionado, no una receta validada.
- Solo tres semillas de entrenamiento, lo que el autor califica de impreciso; las ablaciones presentan interacciones y no efectos principales limpios.
- La receta reward5 no fue fiablemente superior a reward4 entre semillas (diferencia media emparejada de +3,989 s a favor de reward4 en el conjunto de semillas).
- Los resultados son exclusivamente de simulación local y no constituyen puntuaciones oficiales; no se han establecido pruebas físicas en el robot real.
- Las semillas 2 y 3 requirieron recuperación documentada de checkpoints con reinicios de simulador y RNG; el checkpoint de la semilla 3 es anterior a su interrupción.
- Cada fallo se penaliza con 50 s, lo que amplifica las diferencias entre políticas en las métricas agregadas.
- No hay información sobre licencia, lo que impide confirmar si el uso comercial está permitido; debe consultarse al autor antes de cualquier uso en producción.
- No hay datos de sesgos ni de alucinación porque no es un modelo generativo de lenguaje; los riesgos se limitan al comportamiento físico incorrecto o inseguro si se traslada a hardware sin validación.
- El repositorio tiene un tamaño de 0,0 GB y cero descargas, sin señales de adopción ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mubeeapps-1/microduck-sprint-reward5-confirmed-s1
- Repositorio base de Pollen Robotics: https://github.com/pollen-robotics/microduck-challenges
- Commit base del repositorio: 4b675ebf4d7c7b961cd78da94bfc37ca1686d321
- Commit del entrenamiento local: 48b8ad577ca01fa06fc0f8d3a121ac442cd17d38
- Paper, blog o demo adicionales: no disponible
