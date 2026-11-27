# epfl-neuroai/mirage

## Resumen

MIRAGE (Multimodal Integration with Representation-Adaptive Gated Encoding) es un codificador cerebral (*brain encoder*) desarrollado por el laboratorio NeuroAI de la EPFL. Su función no es generar texto ni imágenes, sino predecir respuestas BOLD de fMRI en 1.000 parcelas corticales a partir de estímulos audiovisuales naturales (vídeo, audio y transcripción). Se entrenó sobre el conjunto de datos del reto Algonauts 2025 y se presentó en NeurIPS 2026.

El modelo parte de características de estado oculto extraídas de Qwen3-Omni-30B-A3B-Thinking, las procesa mediante un *pooler* por modalidad con 24 consultas aprendidas, las proyecta linealmente y las pasa por un Transformer temporal de 8 capas y 8 cabezas con dimensión oculta 3072. La salida es una predicción de 100 TRs por ventana para cada una de las 1.000 parcelas, condicionada a uno de los cuatro sujetos entrenados.

Es relevante para la comunidad de neurociencia computacional porque ofrece un *checkpoint* reproducible y abierto (licencia Apache 2.0) de un modelo de codificación cerebral de cerebro completo, con evaluación separada en distribución y fuera de distribución, y porque demuestra que el *gating* adaptativo por modalidad mejora la predicción frente a la concatenación simple de características multimodales. El modelo tiene 1.123.105.809 parámetros totales (aproximadamente 1,12 mil millones) y un repositorio de 31,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer temporal sobre características multimodales de Qwen3-Omni-30B-A3B-Thinking, con *pooler* por modalidad (24 consultas), proyectores lineales y *readout* lineal por sujeto |
| Parametros totales | 1.123.105.809 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventanas de 100 TRs) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (más config.yaml) |

## Arquitectura y entrenamiento

La arquitectura es un codificador en cascada. Primero se extraen estados ocultos de Qwen3-Omni-30B-A3B-Thinking para vídeo, audio y transcripción. Cada modalidad pasa por un *pooler* de capas con 24 consultas aprendidas, seguido de proyectores lineales que alinean las representaciones. La secuencia resultante entra en un Transformer temporal de 8 capas, 8 cabezas de atención y dimensión oculta 3072. Finalmente, un *readout* lineal específico por sujeto (`subject_linear`) produce 100 TRs × 1.000 parcelas corticales. El nombre del modelo hace referencia al *gating* adaptativo por representación, que pondera la contribución de cada modalidad antes de la fusión.

El entrenamiento se realizó sobre el dataset Algonauts 2025 (Friends TV y Movie10) con los sujetos sub-01, sub-02, sub-03 y sub-05. Se usó la temporada 6 de Friends como validación (*hold-out*), 15 épocas, tamaño de lote 16, optimizador AdamW con tasa de aprendizaje 1e-4, planificador OneCycleLR y precisión mixta 16-mixed. No se documentan en la información disponible detalles sobre volumen total de tokens, composición exacta del dataset ni etapas de RLHF o DPO, que no aplicarían a este tipo de modelo de regresión.

## Capacidades

- Predicción de respuestas BOLD de fMRI en 1.000 parcelas corticales a partir de estímulos audiovisuales.
- Procesamiento multimodal conjunto de vídeo, audio y transcripción.
- Extracción de características de estado oculto mediante el *backbone* Qwen3-Omni-30B-A3B-Thinking.
- *Gating* adaptativo por modalidad para ponderar la contribución de cada fuente de información.
- *Readout* condicionado por sujeto para los cuatro sujetos entrenados (sub-01, sub-02, sub-03, sub-05).
- Predicción de ventanas temporales de 100 TRs.
- Ejecución mediante CLI (`brain_enc.cli.infer_fmri`) y carga directa de pesos safetensors con `load_model_state`.
- No dispone de *tool calling*, *function calling*, capacidades de agente, modo *thinking* ni generación de texto libre: es un modelo de codificación cerebral, no un LLM generativo.

## Casos de uso

- Investigación en neurociencia cognitiva: predecir la actividad cortical evocada por estímulos audiovisuales naturales para contrastar hipótesis sobre representaciones multimodales en el cerebro, usando las 1.000 parcelas como unidad de análisis.
- Análisis de narrativa audiovisual: aplicar el modelo a series o películas estilo Friends para estimar respuestas BOLD y estudiar el procesamiento de eventos narrativos a lo largo de ventanas de 100 TRs.
- Evaluación de modelos de representación: usar MIRAGE como *benchmark* de codificación cerebral para comparar qué *backbones* multimodales explican mejor la actividad cerebral, dado que el modelo expone una métrica de correlación de Pearson por sujeto y por partición.
- Estudios de generalización fuera de distribución: emplear la partición OOD (películas distintas de Friends) para medir la robustez de las predicciones ante cambios de dominio, con valores de referencia publicados (r = 0.217 en OOD para el modelo individual).
- Reproducibilidad de resultados de Algonauts 2025: cargar el *checkpoint* y el *ensemble* de 15 miembros para replicar las cifras del envío final del reto (r = 0.335 en Friends s06, 0.323 en Friends s07 y 0.227 en OOD).
- Desarrollo de pipelines de neuroimagen: integrar la CLI `infer_fmri` en flujos automatizados que reciban vídeo y transcripción y generen arrays `.npy` de predicciones para análisis posteriores.
- Docencia y formación: utilizar el modelo como ejemplo didáctico de codificación cerebral multimodal con *gating* adaptativo y de evaluación con particiones en distribución y fuera de distribución.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre las particiones CNeuroMod de Algonauts 2025. Los valores son la media de la correlación de Pearson entre los cuatro sujetos entrenados.

| Modelo | Friends s06 (eval) | Friends s07 (held-out in-dist) | OOD (held-out movie) |
|---|---:|---:|---:|
| MIRAGE modelo individual | 0.319 | 0.310 | 0.217 |
| MIRAGE ensemble de 15 miembros | 0.335 | 0.323 | 0.227 |

Pearson r por sujeto en el conjunto de test OOD:

| Sujeto | Pearson r |
|---|---:|
| sub-01 | 0.244 |
| sub-02 | 0.210 |
| sub-03 | 0.235 |
| sub-05 | 0.179 |

No se han publicado en la información disponible resultados comparativos con otros modelos de codificación cerebral (MMLU, HumanEval, GSM8K y similares no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El *checkpoint* en safetensors ocupa parte de los 31,4 GB del repositorio; con 1,12 mil millones de parámetros, los pesos en fp16 rondarían los 2,2 GB, pero la extracción completa de características requiere además el *backbone* Qwen3-Omni-30B-A3B-Thinking.
- GPU recomendadas: la model card indica que la extracción completa de vídeo en bruto requiere el *backbone* Qwen3-Omni y una GPU grande; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- ¿Cabe en GPU de consumo? No disponible. El Transformer temporal por sí solo es pequeño, pero el pipeline completo depende de un modelo de 30B de parámetros totales (3B activos, MoE).
- Opciones de despliegue: CLI propia del repositorio (`python -m brain_enc.cli.infer_fmri`), instalación editable con `pip install -e .` y carga directa de safetensors con `load_model_state`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MIRAGE (EPFL) | 1.123.105.809 | ventanas de 100 TRs | Pearson r 0.319 / 0.310 / 0.217 (s06 / s07 / OOD) | Apache 2.0 | Hugging Face + GitHub |
| Alternativas de codificación cerebral | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre otros codificadores cerebrales comparables (por ejemplo, participantes del reto Algonauts 2025) que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Las predicciones están condicionadas a uno de los cuatro sujetos entrenados (sub-01, sub-02, sub-03, sub-05); no generaliza a sujetos no vistos.
- El rendimiento es más fuerte en vídeo narrativo estilo Friends y decae en la partición OOD (r = 0.217 frente a 0.319 en validación en distribución).
- La extracción completa de características desde vídeo en bruto requiere el *backbone* Qwen3-Omni y una GPU grande, lo que limita el despliegue en entornos modestos.
- Solo se declara soporte de inglés (`en`) en los metadatos del modelo.
- No se documentan sesgos específicos, pero al ser un modelo de regresión sobre un dataset limitado (cuatro sujetos, contenido audiovisual concreto), las predicciones pueden reflejar las peculiaridades de esa muestra.
- Riesgo de alucinación no aplica en el sentido generativo; sin embargo, las predicciones pueden ser poco fiables fuera de la distribución de estímulos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero conviene revisar las condiciones de los datos de Algonauts 2025 y del *backbone* Qwen3-Omni por separado.
- No se documentan cuantizaciones oficiales ni soporte para herramientas de inferencia estándar (vLLM, llama.cpp), lo que puede complicar su integración en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/epfl-neuroai/mirage
- Repositorio de código: https://github.com/epflneuroailab/mirage
- Página del proyecto: https://mirage-brain.epfl.ch/
- Paper en OpenReview: https://openreview.net/forum?id=o0Kim6sdzg
- arXiv: https://arxiv.org/abs/2605.29850
- Página del póster en NeurIPS 2026: https://neurips.cc/virtual/2026/loc/sydney/poster/149712
