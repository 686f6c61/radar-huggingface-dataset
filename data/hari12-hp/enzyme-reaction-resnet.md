# hari12-hp/enzyme-reaction-resnet

## Resumen

Enzyme-reaction-resnet es un modelo de recuperación de enzimas (enzyme retrieval) publicado en Hugging Face por el usuario hari12-hp bajo el paraguas del proyecto "Leak CURBER". El modelo resuelve el problema de emparejar reacciones químicas con las enzimas que las catalizan, una tarea central en biología computacional y en el diseño de rutas biosintéticas. La información pública disponible es extremadamente limitada: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, y la model card es un fragmento mínimo de cuatro líneas.

La arquitectura declarada es `reaction_resnet`, un nombre que sugiere una red residual (ResNet) adaptada a representaciones de reacciones químicas, probablemente sobre huellas moleculares (fingerprints) fijas. Según la model card, el entrenamiento se realizó sobre una "partición de desarrollo" (development training partition) y reporta una precisión de desarrollo de 0,5397 en el conjunto L4. El autor advierte explícitamente que se trata de una puntuación de desarrollo y no de una puntuación de leaderboard.

El modelo es relevante únicamente como artefacto de investigación dentro del proyecto Leak CURBER, probablemente orientado a estudiar fugas de datos (data leakage) en benchmarks de recuperación enzimática. No hay evidencia de que sea un modelo listo para producción: no se especifican parámetros, contexto, licencia ni idiomas, y el repositorio no contiene pesos visibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | reaction_resnet (red residual sobre huellas de reacción) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo químico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch entrenados (no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card indica únicamente que la arquitectura es `reaction_resnet` y que se usan "huellas de reacción fijas" (fixed reaction fingerprints), sin requerir RXNFP ni una CNN sobre SMILES. Esto sugiere que la entrada al modelo son vectores de fingerprint precalculados de forma determinista, y que la red residual opera sobre esas representaciones para producir un embedding o una puntuación de recuperación. No se detalla el número de capas, dimensión de embedding, función de pérdida ni tamaño del dataset.

El entrenamiento se realizó sobre la "development training partition", lo que apunta a un protocolo experimental con particiones train/dev/test diseñado para medir y controlar fugas de datos (de ahí el nombre Leak CURBER). Se reporta una precisión de desarrollo L4 de 0,5397. No hay información sobre RLHF, DPO, aumentación de datos ni composición del conjunto de entrenamiento. La innovación técnica declarada es la eliminación de dependencias de RXNFP y de CNNs sobre SMILES, lo que simplifica el pipeline de inferencia.

## Capacidades

- Recuperación de enzimas: dado un par (o una representación) de reacción química, el modelo produce una puntuación o embedding para recuperar la enzima asociada.
- Inferencia sobre huellas de reacción fijas: no requiere tokenización de SMILES ni modelos auxiliares como RXNFP.
- Ejecución en CPU: la model card incluye un comando de inferencia (`python /app/predict.py --input INPUT --output OUTPUT`) que sugiere despliegue ligero sin GPU.
- No es un modelo generativo: no genera texto, código ni imágenes.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni modo de pensamiento (thinking mode).
- No se documentan capacidades de visión, audio ni matemáticas.

## Casos de uso

- Anotación de reacciones en bases de datos bioquímicas: usar el modelo para proponer enzimas candidatas para reacciones no anotadas en repositorios como BRENDA o MetaCyc, filtrando después con validación experimental.
- Priorización en diseño de rutas biosintéticas: integrar el modelo en un pipeline de retrosíntesis para puntuar qué enzimas conocidas podrían catalizar cada paso de una ruta propuesta.
- Detección de fugas en benchmarks de recuperación enzimática: emplear el modelo y su partición de desarrollo como control para estudiar si las métricas de otros modelos se ven infladas por solapamiento entre train y test.
- Filtrado previo en cribado de enzimas: reducir el espacio de búsqueda de enzimas candidatas antes de aplicar métodos costosos de docking o simulación molecular.
- Herramienta docente en bioinformática: ilustrar en un curso cómo una red residual sobre fingerprints puede resolver una tarea de recuperación sin depender de modelos de lenguaje químicos.
- Baseline reproducible en investigación: servir como referencia simple y de bajo coste computacional (CPU) frente a modelos basados en RXNFP o transformers químicos en experimentos de recuperación.

## Benchmarks y rendimiento

| Metrica | Valor | Nota |
|---|---|---|
| Precisión de desarrollo L4 | 0,5397 | Puntuación de desarrollo, no de leaderboard |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se dispone de comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo declara inferencia en CPU, lo que sugiere un tamaño reducido, pero no se especifican parámetros ni pesos.
- GPU recomendadas: no disponible; no se requiere GPU según la model card.
- Cabe en GPU de consumo: probablemente sí, dado el soporte de CPU, pero no se confirma con datos de tamaño.
- Opciones de despliegue: script propio `predict.py` con pesos PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la misma categoría (recuperación enzima-reacción) ni métricas que permitan una comparación rigurosa. Alternativas habituales en el dominio, como RXNFP o modelos basados en transformers químicos, no se han evaluado en la información proporcionada.

## Limitaciones y advertencias

- Información pública mínima: la model card no documenta parámetros, licencia, idiomas ni formato exacto de pesos, lo que impide evaluar su idoneidad para producción.
- Métrica de desarrollo: la precisión de 0,5397 es una puntuación de desarrollo y el propio autor advierte que no es una puntuación de leaderboard; no debe citarse como rendimiento final.
- Riesgo de fuga de datos: el nombre "Leak CURBER" y el uso de una partición de desarrollo sugieren que el modelo forma parte de un estudio sobre fugas; su rendimiento en datos realmente no vistos puede diferir.
- Licencia no disponible: no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier despliegue.
- Sin soporte multilingüe ni generativo: no es adecuado para tareas de texto, código o razonamiento general.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de replicación independiente de los resultados.
- Sin garantías de mantenimiento: el repositorio se creó y actualizó en noviembre de 2026 y no muestra actividad posterior en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/hari12-hp/enzyme-reaction-resnet
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
