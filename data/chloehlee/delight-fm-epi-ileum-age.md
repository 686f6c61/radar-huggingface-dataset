# chloehlee/delight-fm-epi-ileum-age

## Resumen

DELIGHT-FM Epi-ileum Age es un modelo de regresión de edad biológica para datos de expresión génica de célula única (scRNA-seq) en tejido de íleon humano. Lo publica el autor chloehlee como parte de la familia DELIGHT-FM, una colección de modelos de fundación especializados por tejido (íleon, colon, estroma, inmune) con variantes específicas de tarea. Este checkpoint concreto es el "companion" de edad del modelo base `chloehlee/delight-fm-epi-ileum`: añade una cabeza de regresión ajustada que predice log2(PCW) (edad posconcepcional en semanas, en escala logarítmica) a partir del perfil transcriptómico de una célula.

El modelo se apoya en una arquitectura de tipo `geneformer_mamba` (transformer con componentes Mamba, según los tags y el código personalizado del repositorio), con 20.852.225 parámetros totales, una longitud de contexto de 2.048 tokens génicos y 18.253 features génicas de referencia. Está pensado para inferencia de extracción de características y regresión sobre datos de expresión ya tokenizados y normalizados, no para generación de texto.

Su relevancia es acotada pero específica: permite estimar edad de desarrollo a partir de transcriptomas de íleon sin reentrenar, y ejecutar perturbaciones de edad verificadas (ediciones firmadas sobre genes diana) manteniendo un baseline inmutable. Es un artefacto de investigación biológica, no un modelo de propósito general, y su uso requiere el stack exacto (PyTorch/CUDA 11.8, extensiones Mamba compiladas) y los ficheros de recursos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | geneformer_mamba (transformer con componentes Mamba; `trust_remote_code` requerido) |
| Parámetros totales | 20.852.225 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens génicos |
| Tipos de cuantización | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de tipo Geneformer (transformer sobre tokens de genes) con componentes Mamba, empaquetada como `geneformer_mamba` y distribuida con código personalizado (`custom_code`), por lo que la carga exige `trust_remote_code=True`. El modelo base se preentrena combinando modelado de genes enmascarado (masked gene modeling) con supervisión auxiliar de clúster celular/célula amplia y de escala de edad aprendida, más cabezas adversarias de lote y dominio. Este checkpoint de edad conserva el backbone afinado y añade una cabeza de regresión de salida única que predice log2(PCW).

Los datos de entrenamiento son células humanas de íleon: 67.849 células en el subconjunto de entrenamiento y 14.564 en validación/test, con 18.253 features génicas de referencia. La época de fundación seleccionada es la 7.5. La selección del checkpoint maximizó la media de tres métricas: macro F1 de clúster, macro F1 de localización y correlación de Pearson de edad (los valores por componente están en `metadata/selection.json`). Cabe advertir que el subconjunto de test original participó en la selección del modelo, por lo que no constituye un benchmark externo intacto. La entrada son IDs de token génico más expresión log-normalizada z-scoreada por gen en float32 (recortada a ±5) y máscaras HVG alineadas; la tokenización genérica de Geneformer no es intercambiable y deben usarse los ficheros de `resources/`.

## Capacidades

- Regresión de edad de desarrollo: predice log2(PCW) a partir del perfil de expresión de una célula; la conversión a escala lineal es `2**prediction` (sin restar uno).
- Extracción de características: `pipeline: feature-extraction`, útil para obtener embeddings celulares además de la predicción.
- Perturbaciones de edad verificadas: permite aplicar ediciones firmadas sobre genes diana presentes y medir el delta de predicción (delta positivo implica mayor log2(PCW) predicho).
- Análisis por tejido: especializado en íleon humano (variante tissue-specific de la familia DELIGHT-FM).
- Supervisión auxiliar multi-tarea en el backbone (clúster celular, célula amplia, escala de edad) preservada en la exportación de la fundación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo biológico de regresión, no un LLM.

## Casos de uso

- Estimación de edad de desarrollo en estudios de íleon: dado un perfil scRNA-seq preprocesado con los recursos del repositorio, obtener log2(PCW) por célula y reconstruir la edad en semanas para análisis de trayectorias de desarrollo.
- Análisis de envejecimiento tisular comparado: aplicar el modelo a cohortes de íleon y contrastar la edad predicha con la edad cronológica o con la de otros tejidos usando los companions de colon, estroma e inmune.
- Perturbaciones in silico de edad: editar de forma firmada genes diana presentes y medir el delta de predicción para priorizar hipótesis sobre reguladores de la edad, siempre con definiciones de dirección justificadas de forma independiente.
- Extracción de embeddings celulares para clustering: usar la salida del backbone como features en pipelines de agrupamiento o clasificación de células de íleon.
- Control de calidad de datasets: detectar desviaciones sistemáticas de edad predicha entre lotes o donantes como señal de deriva técnica o biológica.
- Reproducción de experimentos: reutilizar el checkpoint con un baseline inmutable para verificar resultados de perturbación de forma reproducible (orden de células, inputs, código y pesos fijados).
- Fine-tuning para nuevas tareas: partir del companion de edad como backbone afinado para tareas derivadas en íleon, siguiendo el notebook de fine-tuning del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor reporta únicamente métricas de selección de validación (media de macro F1 de clúster, macro F1 de localización y Pearson de edad) sin valores numéricos en la model card; los componentes están en `metadata/selection.json`, no incluidos aquí. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 20,85 M de parámetros y contexto de 2.048 tokens, el modelo es muy pequeño y cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante), aunque el autor no publica cifras.
- GPU recomendadas: no disponible; el autor cita un stack probado PyTorch/CUDA 11.8 con extensiones Mamba compiladas, sin especificar GPU.
- Cabe en GPU consumer: sí, por tamaño de parámetros; la limitación real es la compilación de extensiones Mamba y el stack CUDA 11.8.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DELIGHT-FM Epi-ileum Age (este) | 20,85 M | 2.048 tokens génicos | Regresión de edad en íleon | Apache 2.0 | Hugging Face |
| DELIGHT-FM Epi-colon Age | no disponible | no disponible | Regresión de edad en colon | Apache 2.0 | Hugging Face |
| DELIGHT-FM Stromal Age | no disponible | no disponible | Regresión de edad en estroma | Apache 2.0 | Hugging Face |
| DELIGHT-FM Immune Age | no disponible | no disponible | Regresión de edad en inmune | Apache 2.0 | Hugging Face |

Las alternativas de la misma familia comparten filosofía (companion de edad por tejido) pero no se dispone de sus especificaciones detalladas en la información proporcionada. No se identifican modelos externos comparables con datos verificables en esta búsqueda.

## Limitaciones y advertencias

- Sesgos: los datos provienen de un subconjunto concreto de íleon (excluye Adult y 80+ en la variante "fresh"); las políticas de donantes y grupos de edad están en los workflows fuente y pueden introducir sesgo de cobertura.
- Riesgo de alucinación: no aplica en sentido lingüístico, pero las predicciones de edad pueden ser erróneas fuera de la distribución de entrenamiento; la selección usó el test original, por lo que las métricas están optimistamente sesgadas.
- Limitaciones de contexto e idioma: contexto fijo de 2.048 tokens génicos y 18.253 features de referencia; requiere la tokenización y estadísticas de `resources/`, no intercambiables con Geneformer genérico. No es multilingüe ni textual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de código personalizado (`trust_remote_code`); conviene revisar el código y fijar un commit SHA (`revision=...`) para reproducibilidad.
- Caveats de producción: las perturbaciones miden respuesta del modelo, no efectos causales experimentales; las ediciones firmadas reconstruyen abundancia de forma aproximada tras el recorte z-score y solo cambian tokens diana presentes; los nombres de regulones no especifican la dirección del cambio. No se distribuyen datasets celulares originales, identificadores de donantes ni predicciones baseline. La ejecución completa en GPU y el entrenamiento no se validaron en el contenedor de preparación (solo CPU).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chloehlee/delight-fm-epi-ileum-age
- Modelo base (Epi-ileum): https://huggingface.co/chloehlee/delight-fm-epi-ileum
- Fundación DELIGHT-FM: https://huggingface.co/chloehlee/delight-fm
- Companion de colon: https://huggingface.co/chloehlee/delight-fm-epi-colon-age
- Companion de estroma: https://huggingface.co/chloehlee/delight-fm-stromal-age
- Companion inmune: https://huggingface.co/chloehlee/delight-fm-immune-age
- Notebook de predicción de edad: notebooks/01_predict_age.ipynb (en el repositorio)
- Notebook de perturbaciones verificadas: https://huggingface.co/chloehlee/delight-fm-epi-ileum/blob/main/notebooks/02_verified_perturbations.ipynb
- Notebook de fine-tuning: https://huggingface.co/chloehlee/delight-fm-epi-ileum/blob/main/notebooks/01_finetune.ipynb
- Perfil del autor: https://huggingface.co/chloehlee
