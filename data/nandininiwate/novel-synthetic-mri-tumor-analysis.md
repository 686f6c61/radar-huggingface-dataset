# Nandininiwate/Novel-Synthetic-MRI-Tumor-Analysis

## Resumen

Novel-Synthetic-MRI-Tumor-Analysis es un proyecto de investigación publicado en Hugging Face por Nandini Niwate que implementa un sistema de generación de imágenes sintéticas de resonancia magnética cerebral mediante difusión condicional con conciencia de fronteras (boundary-aware conditional diffusion). El objetivo es generar imágenes de MRI cerebrales sintéticas realistas, condicionadas por máscaras de segmentación tumoral, para aumentar la diversidad de datos en el desarrollo de sistemas de análisis y segmentación de tumores cerebrales. El repositorio tiene un tamaño de 0,3 GB y fue creado el 9 de noviembre de 2026.

El sistema combina un VAE que codifica las imágenes MRI en representaciones latentes con un Diffusion Transformer condicional que incorpora tres vías de condicionamiento: características de la máscara tumoral, características espaciales multiescala y características de frontera del tumor, procesadas estas últimas mediante un mecanismo de atención de frontera independiente. La contribución principal declarada por el autor es el uso explícito de la información de frontera del tumor como vía de condicionamiento adicional durante la generación.

No se trata de un modelo de lenguaje: es un modelo generativo de imágenes médicas. La model card no proporciona información sobre arquitectura detallada del transformer, número de parámetros, longitud de contexto (no aplicable), licencia, idiomas ni formato de pesos más allá de la estructura de directorios del repositorio (`model/`, `models/`, `scripts/`, `results/`, `checkpoints/`). El proyecto se declara explícitamente destinado a investigación y no a diagnóstico clínico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer condicional (latente) con VAE y atención de frontera |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo con directorios `checkpoints/`, `models/`) |
| Modalidades de entrada/salida | MRI (FLAIR, T1, T1ce, T2) y máscaras de segmentación tumoral |
| Tamaño del repositorio | 0,3 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un pipeline generativo en dos etapas. Primero, un VAE (Variational Autoencoder) codifica las imágenes MRI originales en representaciones latentes. Sobre ese espacio latente opera un Diffusion Transformer condicional que genera nuevas muestras latentes, que después se decodifican con el VAE para obtener imágenes MRI sintéticas. El condicionamiento se compone de tres vías: (1) características extraídas de la máscara de tumor, (2) características espaciales multiescala, y (3) características de frontera del tumor procesadas mediante un módulo de atención de frontera independiente. Esta tercera vía es la innovación declarada del trabajo.

El entrenamiento se realizó sobre datos de MRI cerebral de 484 pacientes únicos, divididos en 387 para entrenamiento y 97 para validación. El dataset incluye cuatro modalidades: FLAIR, T1, T1ce y T2. La model card no especifica el número de tokens, el número de pasos de difusión, la composición exacta del dataset (procedencia, resolución, preprocesado), ni si se aplicaron técnicas de refinamiento posteriores. Se realizó un experimento de ablación sobre la información de frontera para medir su influencia en la generación, y los resultados indican que dicha información produce un efecto medible en la salida.

## Capacidades

- Generación de imágenes sintéticas de MRI cerebral en cuatro modalidades (FLAIR, T1, T1ce, T2).
- Condicionamiento por máscara de segmentación tumoral: la localización del tumor guía la generación.
- Condicionamiento espacial multiescala: control de la estructura global y local de la imagen.
- Condicionamiento por frontera tumoral mediante atención dedicada, con ablación que demuestra su influencia.
- Decodificación VAE para obtener imágenes en espacio de píxeles a partir de latentes generados.
- Evaluación cuantitativa de calidad de imagen mediante MAE, PSNR y SSIM.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente ni procesamiento de lenguaje, por tratarse de un modelo generativo de imagen.

## Casos de uso

- Aumento de datos para segmentación tumoral: generar imágenes sintéticas con máscaras asociadas para ampliar el conjunto de entrenamiento de segmentadores, especialmente en clases o localizaciones tumorales poco representadas en los 484 pacientes originales.
- Validación de robustez de modelos de análisis: alimentar pipelines de detección o segmentación con MRI sintéticas y comprobar si las predicciones se mantienen estables, aprovechando el control sobre la posición y frontera del tumor.
- Estudio de la influencia de la frontera tumoral: usar la ablación de la vía de frontera para investigar qué información geométrica necesita un generador para producir tumores realistas en el borde.
- Prototipado de pipelines de imagen médica sin datos de pacientes: generar lotes de MRI sintéticas para desarrollar y depurar código de preprocesado, registro o aumento antes de disponer de acceso a datos reales.
- Investigación en difusión condicional: emplear el código y los checkpoints como base para experimentar con condicionamiento espacial y de frontera en modelos de difusión latente aplicados a imagen médica.
- Docencia y formación: ilustrar en entornos académicos cómo se construye un generador condicional de MRI con VAE y Diffusion Transformer, usando las imágenes de `results/` como material.
- Evaluación comparativa de métricas de calidad: usar los valores reportados (MAE ≈ 6,75, PSNR ≈ 23,49, SSIM ≈ 0,816) como referencia para comparar otras aproximaciones de síntesis de MRI en el mismo dataset.

## Benchmarks y rendimiento

La model card reporta únicamente métricas de calidad de imagen del propio sistema, sin comparación con otros modelos:

| Metrica | Valor reportado |
|---|---|
| MAE | ~6,75 |
| PSNR | ~23,49 |
| SSIM | ~0,816 |

No se han publicado resultados de benchmarks comparativos (FID, IS, métricas de segmentación aguas abajo) ni comparaciones con otros generadores en la información disponible. Los valores corresponden a la evaluación declarada por el autor y no se especifica el conjunto de evaluación exacto ni el protocolo de cálculo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,3 GB, lo que sugiere checkpoints de tamaño moderado, pero no se especifica el número de parámetros del VAE ni del Diffusion Transformer.
- GPU recomendadas: no disponible. Al tratarse de un modelo de difusión sobre latentes de imagen médica, es previsible que requiera GPU con memoria suficiente para el VAE y el transformer, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: no confirmada. No se indica si el modelo cabe en tarjetas como RTX 4090 o RTX 3090.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de imagen); el repositorio incluye `scripts/` de generación y evaluación, que serían el punto de entrada previsto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros generadores de MRI sintética ni con modelos de difusión aplicados a imagen médica, y no se dispone de datos de parámetros, contexto ni rendimiento de alternativas en esta ficha.

## Limitaciones y advertencias

- Uso exclusivamente investigador: el autor declara explícitamente que el proyecto no sustituye a médicos, diagnóstico clínico ni resonancias reales.
- Licencia no especificada: no se indica licencia, por lo que el uso comercial y la redistribución no están claramente permitidos; debe consultarse al autor antes de cualquier uso fuera de investigación.
- Dataset limitado: 484 pacientes únicos (387 de entrenamiento) es un conjunto pequeño para un generador de imagen médica, con riesgo de sobreajuste a la distribución de ese dataset y baja generalización a otras poblaciones, equipos o protocolos de adquisición.
- Sin evaluación clínica ni aguas abajo: no se reportan métricas de utilidad clínica, como mejora de segmentación al aumentar datos, ni validación por radiólogos.
- Riesgo de artefactos y alucinación visual: como todo modelo generativo, puede producir estructuras anatómicas plausibles pero inexistentes; las imágenes sintéticas no deben interpretarse como hallazgos reales.
- Métricas de calidad moderadas: PSNR ≈ 23,49 y SSIM ≈ 0,816 indican similitud razonable pero no perfecta con las imágenes reales; MAE ≈ 6,75 no se contextualiza con una escala.
- Falta de documentación técnica: no se detallan parámetros, pasos de difusión, resolución de imagen, protocolo de evaluación ni formato de pesos, lo que dificulta la reproducibilidad.
- Sesgos potenciales: al derivarse de un único dataset, puede reproducir sesgos demográficos y de adquisición presentes en él; no se documenta ninguna mitigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nandininiwate/Novel-Synthetic-MRI-Tumor-Analysis
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
