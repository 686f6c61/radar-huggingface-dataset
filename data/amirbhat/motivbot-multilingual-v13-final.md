# amirbhat/motivbot-multilingual-v13-final

## Resumen

MotivBot v13 Ultra es un sistema de clasificación de texto clínico multilingüe desarrollado por Amir Rafiq y su equipo, publicado en Hugging Face bajo el identificador `amirbhat/motivbot-multilingual-v13-final`. El modelo aborda la evaluación automatizada de salud mental en narrativas clínicas en turco (tr) y persa (fa), combinando texto libre con puntuaciones psicométricas continuas (PHQ-9 y Rosenberg Self-Esteem) para predecir cinco dimensiones clínicas: ansiedad, afecto negativo, afecto positivo, depresión y autoestima. No es un modelo generativo, sino un clasificador multi-tarea construido sobre `xlm-roberta-base`.

La propuesta técnica se articula como un ensemble de 5 folds con fusión multi-modal tabular, adaptadores específicos por tarea y pooling softmax dinámico sobre las capas 9 a 12 del encoder. El autor reporta métricas sobre pacientes reales no vistos, con validación cruzada estratificada por ID de participante para evitar fugas de datos. El repositorio ocupa 5,7 GB, lo que refleja el peso de los cinco modelos del ensemble y sus adaptadores.

El modelo resulta relevante para investigación en NLP clínico aplicado a lenguas de bajos recursos como el turco y el persa, donde escasean sistemas de cribado automatizado. Su licencia MIT facilita la reutilización, aunque las métricas reportadas proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (`xlm-roberta-base`) con ensemble de 5 folds, pooling softmax dinámico de 4 capas y fusión tabular MLP residual de 128 dimensiones |
| Parametros totales | No disponible (el repo ocupa 5,7 GB; el backbone base tiene ~278M parámetros, pero el total del ensemble no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el backbone `xlm-roberta-base` soporta 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) y persa (fa) |
| Licencia | MIT |
| Formato de pesos | No disponible (repo de 5,7 GB con `predictor.py`; el formato concreto de los checkpoints no se detalla) |

## Arquitectura y entrenamiento

El sistema se construye sobre `xlm-roberta-base` y aplica un ensemble de 5 folds entrenados con validación cruzada estratificada por grupo (por ID de participante, manteniendo gemelos en el mismo fold) para eliminar fugas de datos. La arquitectura incorpora cuatro innovaciones declaradas: fusión multi-modal tabular que integra las puntuaciones continuas de PHQ-9 y Rosenberg Self-Esteem mediante un MLP residual de 128 dimensiones; pooling softmax dinámico que pondera las capas 9, 10, 11 y 12 del encoder; entrenamiento adversarial con FGM (Fast Gradient Method) combinado con EMA (Exponential Moving Average) para suavizar las fronteras de decisión frente a variaciones de fraseo; y adaptadores específicos por tarea con cuellos de botella de proyección de 512 dimensiones para cada una de las cinco dimensiones clínicas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador, pero tampoco se detalla el proceso de anotación). El modelo se presenta como multi-tarea y multi-modal, aunque la modalidad adicional es tabular (puntuaciones psicométricas), no visión ni audio.

## Capacidades

- Clasificación multi-tarea de cinco dimensiones clínicas: ansiedad/miedo/preocupación, afecto negativo (ira/hostilidad), afecto positivo, depresión/desesperanza/tristeza y autoestima.
- Predicción ternaria (No, Low, High) por dimensión, con umbrales calibrados específicos por tarea (th entre 0,425 y 0,680).
- Predicción binaria calibrada con precisión reportada del 85,02%.
- Fusión de texto libre con variables tabulares: edad, género, puntuación PHQ-9 y puntuación RSES.
- Soporte multilingüe limitado a turco y persa.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se declara capacidad de generación de texto: es un pipeline de `text-classification`.

## Casos de uso

- Cribado automatizado en atención primaria: el modelo puede procesar narrativas clínicas en turco o persa junto con la puntuación PHQ-9 del paciente para generar una evaluación ternaria de depresión y ansiedad, ayudando a priorizar derivaciones a especialistas en entornos con recursos limitados.
- Triaje en servicios de salud mental telemática: integrado en un formulario de admisión, clasifica el texto libre del paciente en las cinco dimensiones y permite enrutar casos de alta gravedad (categoría High) a intervención inmediata.
- Investigación epidemiológica en poblaciones turcoparlantes y persoparlantes: el ensemble con validación por grupo facilita el análisis agregado de cohortes clínicas sin fuga de datos entre participantes, útil para estudios longitudinales.
- Monitorización de evolución terapéutica: comparando las predicciones sobre narrativas sucesivas de un mismo paciente y sus puntuaciones RSES, el sistema puede señalar cambios en autoestima y afecto positivo a lo largo del tratamiento.
- Sistemas de alerta en plataformas de apoyo psicológico: el clasificador puede marcar mensajes con alta carga de desesperanza o afecto negativo para revisión humana, actuando como filtro previo en chats de soporte.
- Anotación asistida de corpus clínicos: el modelo puede pre-etiquetar narrativas en turco y persa para acelerar la construcción de datasets anotados por psicólogos, con revisión humana posterior dada la métrica reportada (Macro-F1 ternario de 0,7196).

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor, evaluados sobre pacientes reales fuera de fold (out-of-fold) con validación cruzada estratificada por grupo.

| Dimension clinica | Ternary Macro-F1 | Raw Acc | Ultra Acc | Cutoff |
|---|---|---|---|---|
| Ansiedad, miedo y preocupacion | 0,7669 | 86,73% | 86,83% | 0,500 |
| Afecto negativo (ira/hostilidad) | 0,7268 | 84,46% | 84,92% | 0,425 |
| Afecto positivo | 0,6967 | 84,31% | 84,82% | 0,545 |
| Depresion, desesperanza y tristeza | 0,6990 | 83,71% | 84,31% | 0,560 |
| Autoestima | 0,7085 | 82,65% | 84,21% | 0,680 |
| Promedio del sistema | 0,7196 | 84,37% | 85,02% | — |

Comparación declarada por el autor frente al modelo base `flightmaestro`: 80,34% de precisión binaria (solo 2 clases) frente al 85,02% binario y 0,7196 ternario de MotivBot v13 Ultra, con una mejora neta de +4,68% de precisión absoluta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable al tratarse de un clasificador clínico y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Un backbone `xlm-roberta-base` en FP32 ocupa aproximadamente 1,1 GB; el ensemble de 5 folds con adaptadores y cabeceras multiplica esa cifra, y el repo de 5,7 GB sugiere que la inferencia completa requiere varios GB de VRAM (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas. Por tamaño, una GPU consumer con 8-16 GB (RTX 3060, RTX 4070, RTX 4090) debería poder alojar el ensemble en FP16, aunque no hay confirmación oficial.
- Cabe en GPU consumer: probablemente sí, en función de la cuantización y de si se carga el ensemble completo o un solo fold, pero no se aporta confirmación.
- Opciones de despliegue: el autor proporciona `predictor.py` con la clase `MotivBotUltraPredictor`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos, no aplicables directamente a este clasificador).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MotivBot v13 Ultra | No disponible (ensemble sobre xlm-roberta-base) | No disponible | Macro-F1 ternario 0,7196; precisión binaria 85,02% | MIT | Hugging Face |
| `flightmaestro` (baseline citado por el autor) | No disponible | No disponible | 80,34% precisión binaria | No disponible | No disponible |
| `xlm-roberta-base` (backbone sin fine-tuning) | ~278M | 512 tokens | No disponible para esta tarea | MIT | Hugging Face |

No se dispone de información sobre otros clasificadores clínicos multilingües comparables en turco y persa en la documentación proporcionada. La comparativa con `flightmaestro` procede únicamente de la model card del autor y no ha sido verificada de forma independiente.

## Limitaciones y advertencias

- Las métricas reportadas (Macro-F1 ternario de 0,7196, precisión del 85,02%) proceden exclusivamente de la model card del autor y no han sido replicadas por terceros.
- El modelo no es una herramienta diagnóstica: clasifica dimensiones clínicas a partir de narrativas y puntuaciones psicométricas, pero no sustituye la evaluación de un profesional de salud mental.
- Cobertura lingüística limitada a turco y persa; no se declara soporte para otras lenguas, incluido el castellano.
- Riesgo de sesgo derivado de la composición del dataset de entrenamiento, que no se detalla en la información disponible (posible infrarrepresentación de ciertos grupos demográficos, edades o géneros).
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en textos ambiguos, irónicos o con vocabulario clínico atípico.
- El uso de variables tabulares (edad, género, PHQ-9, RSES) como entrada implica que el sistema depende de que esas puntuaciones estén disponibles y sean fiables; su ausencia o error degrada la predicción.
- Aunque la licencia es MIT, el uso en producción sanitaria exige validación local, cumplimiento normativo (RGPD, normativa sanitaria) y supervisión humana.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No se especifican los formatos de pesos ni los requisitos de hardware, lo que dificulta la reproducibilidad del despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/amirbhat/motivbot-multilingual-v13-final
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
