# amirbhat/motivbot-multilingual-v10-final

## Resumen

MotivBot Multilingual v10 Final es un sistema de clasificación de texto clínico orientado a la evaluación de salud mental en narrativas en turco y persa. Lo desarrolla el autor identificado como amirbhat (Amir Rafiq y equipo de investigación, según la model card) y se publica bajo licencia MIT. El modelo aborda la detección de dimensiones psicopatológicas (ansiedad, afecto negativo, afecto positivo, depresión y autoestima) a partir de texto libre de pacientes, fusionando señales textuales con puntuaciones psicométricas continuas (PHQ-9 y Rosenberg Self-Esteem).

Técnicamente no es un modelo generativo ni un LLM monolítico, sino un ensemble de 5 folds sobre `xlm-roberta-base` con pooling dinámico de capas, adaptadores específicos por tarea y una rama tabular residual que incorpora las puntuaciones de los cuestionarios. El repositorio ocupa 5,7 GB, lo que refleja el peso de los cinco modelos del ensemble más los adaptadores y cabeceras.

Su relevancia radica en el enfoque de evaluación sin fuga de datos (validación cruzada estratificada por identificador de participante) y en la fusión multimodal tabular-textual, poco habitual en clasificadores clínicos open source. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin paper asociado ni publicación revisada por pares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 folds sobre `xlm-roberta-base` con pooling softmax dinámico de capas 9-12, adaptadores por tarea y MLP tabular residual (128 dim) |
| Parametros totales | No disponible (el repo pesa 5,7 GB; el backbone base tiene ~278 M de parámetros, pero el total del ensemble no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el backbone `xlm-roberta-base` soporta 512 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) y persa (fa) |
| Licencia | MIT |
| Formato de pesos | No disponible (el repo incluye `predictor.py`; no se detalla el formato de los pesos) |

## Arquitectura y entrenamiento

El sistema se construye sobre `xlm-roberta-base` como encoder multilingüe. Sobre él se aplica un pooling softmax dinámico que pondera las salidas de las capas 9, 10, 11 y 12, en lugar de usar únicamente la última capa. Cada una de las cinco tareas clínicas (ansiedad, afecto negativo, afecto positivo, depresión y autoestima) dispone de un adaptador con cuello de botella de proyección de 512 dimensiones, lo que permite especialización por dimensión sin duplicar el encoder completo.

La segunda rama del modelo es un MLP tabular residual de 128 dimensiones que fusiona las puntuaciones continuas de PHQ-9 y Rosenberg Self-Esteem con las representaciones textuales. El entrenamiento incorpora FGM (Fast Gradient Method) como entrenamiento adversarial y EMA (Exponential Moving Average) para suavizar las fronteras de decisión frente a variaciones de formulación. La evaluación se realizó con validación cruzada estratificada de 5 folds agrupada por identificador de participante, manteniendo juntos a participantes relacionados (gemelos) para evitar fuga de datos. No se especifican el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF o DPO (no aplica al ser un clasificador).

## Capacidades

- Clasificación multi-tarea de cinco dimensiones clínicas: ansiedad/miedo/preocupación, afecto negativo (ira/hostilidad), afecto positivo, depresión/desesperanza/tristeza y autoestima.
- Clasificación ternaria (No, Low, High) por dimensión, con umbrales calibrados específicos por tarea (entre 0,425 y 0,680).
- Clasificación binaria con precisión bruta reportada del 84,37 % y precisión calibrada del 85,02 %.
- Fusión multimodal: acepta texto libre junto con puntuaciones PHQ-9 y RSES, edad, género e idioma.
- Soporte de dos idiomas: turco y persa.
- No soporta tool calling ni function calling.
- No es un modelo generativo: no produce texto, razonamiento libre ni agentes multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Triaje clínico asistido en turco y persa: el sistema puede procesar narrativas de pacientes y emitir una señal de gravedad por dimensión (No/Low/High) que oriente la priorización de entrevistas, aprovechando la fusión con PHQ-9 para contextualizar la puntuación textual.
- Investigación en psicología computacional: permite replicar análisis de correlación entre lenguaje y escalas psicométricas en corpus turcos y persas, con la ventaja de que el modelo ya integra las puntuaciones de cuestionario como entrada tabular.
- Monitorización longitudinal en plataformas de telepsicología: integrado en un pipeline que recoja texto de diarios o mensajes y puntuaciones PHQ-9 periódicas, puede generar alertas cuando la dimensión de depresión o ansiedad pase a categoría High.
- Soporte a la documentación clínica: clasificación automática de notas de sesión para etiquetar dimensiones afectivas y facilitar búsquedas o estudios retrospectivos en historiales en turco y persa.
- Detección temprana en foros o comunidades de apoyo: el clasificador puede marcar mensajes con alta carga de desesperanza o baja autoestima para que moderadores humanos revisen, siempre con supervisión y consentimiento.
- Evaluación de programas de intervención: comparar la distribución de categorías clínicas antes y después de una intervención, usando el ensemble como instrumento de medida estandarizado sobre narrativas libres.
- Filtrado previo en estudios académicos: reducir el volumen de textos que requieren codificación manual por psicólogos, derivando solo los casos clasificados como High a revisión humana.

## Benchmarks y rendimiento

Los datos provienen exclusivamente de la model card del autor, evaluados sobre pacientes reales fuera de fold (out-of-fold) con validación agrupada por participante.

| Dimension clinica | Ternary Macro-F1 | Raw Acc | Ultra Acc | Cutoff |
|---|---|---|---|---|
| Ansiedad, miedo y preocupación | 0,7669 | 86,73 % | 86,83 % | 0,500 |
| Afecto negativo (ira/hostilidad) | 0,7268 | 84,46 % | 84,92 % | 0,425 |
| Afecto positivo | 0,6967 | 84,31 % | 84,82 % | 0,545 |
| Depresión, desesperanza y tristeza | 0,6990 | 83,71 % | 84,31 % | 0,560 |
| Autoestima | 0,7085 | 82,65 % | 84,21 % | 0,680 |
| Media del sistema | 0,7196 | 84,37 % | 85,02 % | — |

Comparación directa reportada por el autor frente al modelo base `flightmaestro`: 80,34 % (solo binario, 2 clases) frente a 85,02 % (binario) y 0,7196 de Macro-F1 ternario del ensemble, con una mejora absoluta de +4,68 % en precisión. No se han publicado resultados en benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) porque el modelo no es generativo y no aplica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El backbone `xlm-roberta-base` (~278 M de parámetros) en fp32 requiere aproximadamente 1,1 GB solo para pesos, pero al tratarse de un ensemble de 5 folds más adaptadores y rama tabular, el consumo real es varias veces mayor; el repo de 5,7 GB sugiere que la carga completa puede requerir del orden de 6-12 GB en fp32.
- GPU recomendadas: no especificadas por el autor. Por tamaño del backbone, una RTX 3090 o RTX 4090 (24 GB) sería suficiente para cargar el ensemble completo en fp32; una GPU de 16 GB podría ser ajustada.
- Cabe en GPU de consumo: probablemente sí en modelos con 16-24 GB de VRAM, aunque no está confirmado por el autor.
- Opciones de despliegue: el autor proporciona `predictor.py` con la clase `MotivBotUltraPredictor`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de este tipo, salvo servido con FastAPI o TorchServe).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MotivBot Multilingual v10 Final | No disponible (ensemble de 5 folds sobre xlm-roberta-base) | No disponible | Clasificación clínica multi-tarea (tr, fa) | MIT | Hugging Face, 0 descargas |
| `xlm-roberta-base` (base) | ~278 M | 512 tokens | Representaciones multilingües genéricas | MIT | Ampliamente disponible |
| `flightmaestro` (baseline citado por el autor) | No disponible | No disponible | Clasificación binaria de salud mental | No disponible | No disponible en la información proporcionada |
| BETO / RoBERTa clínicos en español | ~110-355 M | 512 tokens | Clasificación clínica en español | Variable | Hugging Face |

La comparación con alternativas es limitada: no se dispone de datos de modelos clínicos comparables en turco y persa con los que contrastar métricas de forma independiente. El propio autor solo compara con `flightmaestro`, sin especificar su procedencia ni su licencia.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: no hay evidencia de uso externo, replicación ni validación independiente de los resultados reportados.
- Los benchmarks son autoinformados por el autor; no hay paper, arXiv ni revisión por pares que los respalde.
- El nombre del repositorio (`v10-final`) no coincide con el título de la model card (`v13 Ultra`), lo que genera ambigüedad sobre la versión real publicada.
- Solo cubre turco y persa; no hay soporte para español ni otros idiomas, a pesar del tag "multilingual".
- Es un clasificador, no un generador: no puede mantener conversaciones ni razonar de forma abierta; cualquier uso conversacional requeriría un LLM adicional.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en textos ambiguos, irónicos o muy cortos.
- Uso clínico: no debe emplearse como herramienta diagnóstica autónoma; requiere supervisión de profesionales y validación local antes de cualquier despliegue en producción.
- Sesgos: no se documenta la composición demográfica del corpus de entrenamiento (edad, género, origen), por lo que se desconoce su comportamiento en subpoblaciones.
- La licencia MIT permite uso comercial, pero la naturaleza sensible de los datos de salud mental exige cumplimiento de normativas de protección de datos (RGPD, KVKK en Turquía) en cualquier despliegue real.
- El formato de pesos no se especifica; la integración depende del `predictor.py` incluido, lo que limita la portabilidad a otros frameworks.
- No se documentan los requisitos de hardware ni el coste de inferencia del ensemble completo.

## Enlaces

- Hugging Face: https://huggingface.co/amirbhat/motivbot-multilingual-v10-final
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
