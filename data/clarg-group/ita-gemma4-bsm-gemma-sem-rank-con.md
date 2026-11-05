# CLArg-group/ita-gemma4-bsm-gemma-sem-rank-con

## Resumen

BSM-Gemma (primed & sem & rank & con) es un adaptador LoRA con cabeza de regresión entrenado sobre el modelo base google/gemma-4-E4B-it, desarrollado por el grupo CLArg-group en el marco del trabajo *Neurosymbolic Learning for Inference-Time Argumentation*. No es un modelo generativo de propósito general: es un base score model (BSM) que, dada una afirmación (claim) y un argumento que la apoya o la ataca, devuelve una puntuación en el intervalo [0, 1] que representa la fuerza intrínseca de ese argumento. Esa puntuación se combina después con la semántica gradual DF-QuAD para calcular la fuerza agregada de la afirmación y emitir un veredicto True / False / Uncertain.

El modelo forma parte de una familia de BSMs publicados junto al repositorio de ITA (inference-time argumentation). Su interés radica en que traslada parte del razonamiento neurosimbólico a tiempo de inferencia: en lugar de pedir al LLM un juicio directo, se le pide que puntúe argumentos individuales y la agregación se hace con un formalismo determinista y auditable. Esto es relevante para verificación de afirmaciones, análisis argumentativo y pipelines donde se necesita trazabilidad del veredicto.

La información pública disponible es escasa: el repositorio de HuggingFace tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo figura como 0.0 GB y no se han publicado resultados de benchmarks específicos del adaptador en la información proporcionada. La model card remite al paper y al repositorio de GitHub para detalles de entrenamiento y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre google/gemma-4-E4B-it más cabeza de regresión (regression_head.safetensors) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el backbone es Gemma 4 E4B; no se confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (sujeta además a la licencia del modelo base y a los términos de los datos de entrenamiento) |
| Formato de pesos | safetensors (adaptador PEFT y cabeza de regresión) |
| Librería | peft |
| Modelo base | google/gemma-4-E4B-it |
| Tarea | Puntuación de argumentos (regresión en [0, 1]) para verificación de claims |

## Arquitectura y entrenamiento

El modelo combina un backbone transformer (Gemma 4 E4B en su variante instruct) con un adaptador LoRA y una cabeza de regresión separada, configurada mediante `model_config.json`. La salida es un escalar en [0, 1] por par (claim, argumento), no texto libre. El entrenamiento se realizó en dos fases: primero se primó la cabeza de regresión con base scores obtenidos pidiendo al propio backbone que puntuara argumentos; después se entrenaron conjuntamente cabeza y adaptador de extremo a extremo a través de la semántica DF-QuAD, con una pérdida semántica combinada con pérdidas de ranking y de consistencia.

Los datos de entrenamiento proceden de los TFU Training Claims (`Data/Training/training_true_false_uncertain_with_arguments_gemma.json`), con argumentos generados por Gemma 4 E4B. No se especifican en la información disponible el número de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica principal es el acoplamiento de la pérdida de entrenamiento con un formalismo argumentativo (DF-QuAD), de modo que el modelo aprende puntuaciones que son coherentes con la agregación posterior, no solo con etiquetas aisladas.

## Capacidades

- Puntuación de argumentos: asigna un base score en [0, 1] a un argumento dado un claim, indicando su fuerza intrínseca.
- Distinción apoyo/ataque: procesa el flag `is_support` para tratar argumentos a favor o en contra del claim.
- Verificación de afirmaciones (claim verification): integrado en el pipeline ITA, produce veredictos True / False / Uncertain tras la agregación DF-QuAD.
- Razonamiento neurosimbólico en tiempo de inferencia: combina la puntuación neuronal con semántica gradual determinista.
- Procesamiento por lotes: la herramienta de inferencia acepta un CSV con columnas `claim,is_support,argument` y genera un CSV de puntuaciones.
- No es un modelo conversacional: no se documenta generación de texto libre, tool calling, capacidades de agente, visión ni audio para este adaptador.

## Casos de uso

- Verificación de afirmaciones en pipelines de fact-checking: el BSM puntúa cada argumento recuperado a favor o en contra de una afirmación y el agregador DF-QuAD emite un veredicto True / False / Uncertain, lo que permite auditar qué argumento inclinó la decisión.
- Análisis de debates y discursos: dado un claim extraído de un texto y los argumentos asociados, se obtiene una medida cuantitativa de la fuerza argumentativa de cada intervención.
- Evaluación de respuestas generadas por LLM: se descomponen las justificaciones en argumentos atómicos, se puntúan con el BSM y se agregan para detectar justificaciones débiles o inconsistentes.
- Moderación de contenido argumentativo: priorizar para revisión humana aquellos argumentos con puntuaciones extremas o veredictos inestables.
- Investigación en argumentación computacional: reproducción de los experimentos de la Tabla 7 del paper con el backbone Gemma 4 E4B y comparación con otros BSMs de la familia.
- Construcción de grafos de argumentación: usar los base scores como pesos iniciales de nodos en un grafo que después se propaga con DF-QuAD u otras semánticas graduales.
- Sistemas de decisión asistida con trazabilidad: entornos donde se exige explicar el peso de cada pieza de evidencia, algo que un LLM generativo directo no ofrece de forma nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la Tabla 7 del paper *Neurosymbolic Learning for Inference-Time Argumentation* para los resultados experimentales del modelo con backbone Gemma 4 E4B, pero los valores concretos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del backbone Gemma 4 E4B y de la cuantización elegida, no documentada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la vía documentada es el repositorio de ITA (`python -m ita.base_score_model.infer_on_arguments`), cargando el checkpoint desde `checkpoints/gemma4-bsm-gemma-sem-rank-con/`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSM-Gemma (primed & sem & rank & con) | google/gemma-4-E4B-it + LoRA | Base score para ITA | Escalar en [0, 1] | MIT (más licencia del base) | HuggingFace, repo CLArg-group |
| Otros BSMs de la familia ITA | no disponible | Base score para ITA | Escalar en [0, 1] | no disponible | Repositorio CLArg-group/inference-time-argumentation |
| LLM generativo con prompting directo (p. ej. Gemma 4 E4B-it sin adaptar) | — | Juicio directo de claims | Texto / etiqueta | Licencia del base | Uso general |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un LLM de propósito general; solo produce puntuaciones de argumentos y requiere el pipeline ITA para generar veredictos.
- Dependencia del backbone: hereda los sesgos, el conocimiento y las limitaciones de google/gemma-4-E4B-it.
- Datos de entrenamiento sintéticos: los argumentos de entrenamiento fueron generados por Gemma 4 E4B, lo que puede introducir sesgos y errores sistemáticos del propio backbone en las puntuaciones aprendidas.
- Idiomas: no se documenta qué idiomas soporta el adaptador; la model card y los datos están en inglés.
- Riesgo de calibración: al ser una cabeza de regresión entrenada con pérdidas combinadas, las puntuaciones pueden no estar calibradas como probabilidades en dominios distintos al de entrenamiento.
- Licencia: los pesos son MIT, pero el uso queda sujeto a la licencia de Gemma 4 E4B y a los términos de los datos de entrenamiento, lo que puede condicionar el uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, tamaño reportado de 0.0 GB y sin benchmarks publicados en la información disponible; conviene validar antes de usarlo en producción.
- Contexto y cuantización: no se documentan la longitud de contexto efectiva ni formatos cuantizados, lo que limita la planificación de despliegue.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/CLArg-group/ita-gemma4-bsm-gemma-sem-rank-con
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio ITA: https://github.com/CLArg-group/inference-time-argumentation
- Paper *Neurosymbolic Learning for Inference-Time Argumentation*: no disponible el enlace directo en la información proporcionada
- Gemma 4 Technical Report (Gemma Team, Google DeepMind): https://arxiv.org/pdf/2607.02770
