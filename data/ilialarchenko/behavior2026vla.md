# IliaLarchenko/BEHAVIOR2026VLA

## Resumen

BEHAVIOR2026VLA es un checkpoint de política visión-lenguaje-acción (VLA) desarrollado por Ilia Larchenko para abordar las 100 tareas domésticas del 2026 BEHAVIOR Challenge, ejecutadas sobre un robot Galaxea R1Pro en el simulador OmniGibson. El modelo parte de Pi0.5 (Physical Intelligence) y se calienta desde la solución ganadora del reto de 2025 del mismo autor, lo que lo convierte en un artefacto de referencia para investigación en manipulación robótica simulada a gran escala.

La arquitectura combina un modelo visión-lenguaje PaliGemma con un experto de acción más pequeño entrenado mediante flow matching, sumando 2,9B parámetros. El modelo consume tres cámaras RGB de 224x224 (cabeza y muñecas), el estado del robot, la tarea y la etapa semántica actual, y produce chunks de 30 acciones sobre 21 grados de libertad. Es relevante ahora porque acompaña al conjunto de demos del challenge 2026 y documenta resultados locales medibles (q-score 0,389, éxito 21,8%) sobre las 100 tareas.

El checkpoint se distribuye en formato Orbax (10,7 GB) con pesos EMA, estadísticas de normalización y un tokenizador FAST de acciones. No es un modelo de propósito general: es una política especializada para un benchmark concreto, con condicionamiento por embeddings aprendidos para 100 tareas y 413 etapas semánticas, sin prompts de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM PaliGemma + experto de acción con flow matching (VLA) |
| Parámetros totales | 2,9B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en Orbax, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (condicionamiento por embeddings de tarea, sin texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax (params/, 10,7 GB) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de Pi0.5: un backbone visión-lenguaje PaliGemma acoplado a un experto de acción de menor tamaño entrenado con flow matching. La entrada son tres cámaras RGB de 224x224 (cabeza y ambas muñecas), el estado del robot, la tarea y la etapa actual; la salida son chunks de 30 acciones sobre 21 grados de libertad (base 3, tronco 2, dos brazos de 7 cada uno, dos pinzas de 1 cada una). El condicionamiento se realiza mediante embeddings aprendidos para 100 tareas y 413 etapas semánticas (2-9 por tarea), sin usar prompts de texto.

El entrenamiento se realizó durante 200.000 pasos sobre las 20.000 demostraciones del dataset `behavior-1k/2026-challenge-demos`, partiendo de un checkpoint de 2025 convertido. Se usó AdamW con EMA 0,995, 10 muestras de flow con reducción de varianza por observación y pérdidas auxiliares de etapa y FAST (tokenizador de acciones incluido en `assets/b1k_2026/fast_tokenizer/`). Las estadísticas de normalización de estado y acción, junto con las matrices de correlación de acciones, se distribuyen en `norm_stats.json`.

## Capacidades

- Control robótico de manipulación doméstica en simulación: ejecuta 100 tareas del benchmark BEHAVIOR 2026 sobre Galaxea R1Pro en OmniGibson.
- Percepción visual multi-cámara: procesa tres flujos RGB de 224x224 simultáneamente.
- Generación de acciones en chunks de 30 pasos sobre 21 grados de libertad, incluyendo base móvil, tronco, brazos y pinzas.
- Condicionamiento por tarea y etapa semántica mediante embeddings aprendidos (100 tareas, 413 etapas).
- Flow matching para generación de trayectorias de acción continuas.
- Tokenización FAST de acciones como pérdida auxiliar de entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, texto libre ni capacidades multilingües en el sentido de un LLM convencional.

## Casos de uso

- Investigación en VLA para manipulación doméstica: sirve como baseline reproducible sobre el que comparar nuevas políticas en las 100 tareas del BEHAVIOR 2026, con métricas locales publicadas (q-score 0,389, éxito 21,8%).
- Punto de partida para fine-tuning: el checkpoint calentado desde 2025 permite a otros equipos del challenge reanudar el entrenamiento con sus propios datos y comparar contra un punto de referencia conocido.
- Estudio de condicionamiento por etapas: los embeddings de 413 etapas semánticas permiten analizar cómo la descomposición de tareas en fases mejora la ejecución de políticas de largo horizonte.
- Evaluación de flow matching en robótica: útil para medir el efecto de 10 muestras de flow con reducción de varianza frente a alternativas de difusión o regresión directa.
- Reproducción de resultados del challenge: combinado con el repositorio `behavior-1k-solution-2026`, permite replicar la evaluación local con el criterio oficial de éxito y q-score.
- Análisis de brechas entre tareas: la separación entre tareas compartidas con 2025 (q-score 0,370) y nuevas de 2026 (0,407) ofrece material para estudiar transferencia y generalización entre ediciones del benchmark.
- Integración en pipelines de simulación a escala: el formato Orbax y las estadísticas de normalización incluidas facilitan el despliegue en infraestructura de evaluación automatizada.

## Benchmarks y rendimiento

Evaluación local con el criterio oficial de éxito y q-score: 100 tareas, 10 episodios por tarea (instancias 301-310), solo política aprendida.

| Conjunto | Tareas | q-score |
|---|---|---|
| Todas | 100 | 0,389 |
| Compartidas con el reto 2025 | 50 | 0,370 |
| Nuevas en 2026 | 50 | 0,407 |

Tasa de éxito global sobre todas las tareas: 21,8%. El q-score otorga 1 a un éxito completo y crédito parcial por la fracción de predicados de objetivo satisfechos.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo de pesos ocupa 10,7 GB en Orbax, por lo que se requiere al menos ese espacio en memoria o disco para cargar el checkpoint.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño de 2,9B parámetros sugiere que podría caber en GPUs de 24 GB o superiores, pero no se confirma en la documentación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo se distribuye como pesos Orbax para su uso con el código del repositorio `behavior-1k-solution-2026`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BEHAVIOR2026VLA | 2,9B | no disponible | q-score 0,389 en BEHAVIOR 2026 | Apache 2.0 | Hugging Face (Orbax) |
| Pi0.5 (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Solución 2025 del autor (`behavior_submission`) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos numéricos de Pi0.5 ni de la solución de 2025 en la información proporcionada para establecer una comparación cuantitativa. La comparativa se limita a la relación de derivación: BEHAVIOR2026VLA se calienta desde el checkpoint de 2025 y se basa en Pi0.5.

## Limitaciones y advertencias

- Es una política especializada para un benchmark concreto; no es un modelo de propósito general ni un LLM utilizable fuera del entorno OmniGibson con Galaxea R1Pro.
- El condicionamiento es por embeddings de tarea y etapa, sin prompts de texto: no admite instrucciones en lenguaje natural.
- La tasa de éxito global es del 21,8%; el q-score de 0,389 indica que la mayoría de ejecuciones son parciales, no completas.
- El propio autor señala que la política es solo una parte de la solución; las 14 tareas con peor rendimiento se abordan con un segundo componente descrito en el repositorio y el informe técnico (marcado como TODO en la model card).
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas en el sentido de un modelo de lenguaje; el riesgo principal es la baja fiabilidad en tareas de largo horizonte.
- Licencia Apache 2.0 permite uso comercial, pero la aplicabilidad fuera de simulación no está validada en la información disponible.
- El informe técnico no está publicado (TODO), lo que limita la reproducibilidad completa de los resultados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/IliaLarchenko/BEHAVIOR2026VLA
- Checkpoint 2025 del autor: https://huggingface.co/IliaLarchenko/behavior_submission
- Código de la solución 2026: https://github.com/Robot-Learning-Collective/behavior-1k-solution-2026
- Blog de Pi0.5: https://www.physicalintelligence.company/blog/pi05
- BEHAVIOR Challenge: https://behavior.stanford.edu/challenge/
- Perfil de GitHub del autor: https://github.com/IliaLarchenko
- Perfil de Hugging Face del autor: https://huggingface.co/IliaLarchenko
