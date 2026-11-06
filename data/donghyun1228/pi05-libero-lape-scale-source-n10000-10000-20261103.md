# Donghyun1228/pi05-libero-lape-scale-source-n10000-10000-20261103

## Resumen

π0.5 LIBERO mean-IDM source es un checkpoint de robótica basado en el modelo π0.5 (pi05) del ecosistema openpi, publicado por el usuario Donghyun1228. No se trata de un modelo de lenguaje generalista, sino de un artefacto de investigación para el estudio de escalado de datos LAPE (data-scaling study) del repositorio `Donghyun1228/vla_adaptation`. El checkpoint actúa como "fuente" (source) en un experimento de adaptación de modelos visión-lenguaje-acción (VLA) al benchmark LIBERO.

El modelo se ha entrenado con un preset denominado `pi05_libero_conflict_mean_source`, que combina aprendizaje por imitación (IL) con entrenamiento conjunto con un IDM (inverse dynamics model) de tipo "mean", incluyendo recolección de conflictos de gradiente. La configuración usa una tasa de aprendizaje de 1e-5, 10.000 actualizaciones y una sonda de soporte (support probe) recortada a 10.000 frames por entorno, replicando la receta de la fuente principal de 50k.

El interés de este checkpoint es acotado pero relevante para quien investigue adaptación eficiente de VLA en robótica: proporciona los pesos completos (`params`, `train_state`, `assets` de normalización), las métricas LAPE por capa (`lape/analysis_tau1.json`) y un prior k10 (`prior/lape_k10/`) reutilizable por objetivos del mismo tamaño. No hay información publicada sobre idiomas, benchmarks de tareas generales ni rendimiento estándar de LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 (pi05), modelo visión-lenguaje-acción (VLA) del ecosistema openpi; detalles internos de capas no disponibles en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en formato nativo de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de entrenamiento (`params`, `train_state`, `assets`); no se indica safetensors ni GGUF |
| Tamaño del repositorio | 32,2 GB |
| Pipeline | robotics |
| Preset de entrenamiento | `pi05_libero_conflict_mean_source` |
| Actualizaciones de entrenamiento | 10.000 |
| Tasa de aprendizaje | 1e-5 |
| Frames de sonda por entorno | 10.000 |

## Arquitectura y entrenamiento

El checkpoint se basa en π0.5 (pi05) dentro del stack openpi, un modelo VLA que combina percepción visual, instrucciones en lenguaje natural y generación de acciones motoras. La información disponible no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención o tokenización de acciones), por lo que esos datos deben considerarse no disponibles en esta ficha.

El entrenamiento sigue el preset `pi05_libero_conflict_mean_source`: aprendizaje por imitación combinado con entrenamiento conjunto con un IDM de tipo "mean", con recolección de conflictos de gradiente. Se ejecutan 10.000 actualizaciones con LR 1e-5 sobre una sonda de soporte de 10.000 frames por entorno, replicando la receta de la fuente principal de 50k (`Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024`). El artefacto incluye además un análisis LAPE (`lape/analysis_tau1.json`) con la fracción compartida por capa y un prior k10 (`prior/lape_k10/`, con pesos `w_l = 1 − s_l^10`) empleado por los dos objetivos de este tamaño.

## Capacidades

- Control robótico mediante políticas VLA: genera acciones a partir de observaciones visuales e instrucciones, orientado al benchmark LIBERO.
- Aprendizaje por imitación (IL) sobre demostraciones, con soporte para entrenamiento conjunto con IDM.
- Recolección de conflictos de gradiente durante el entrenamiento (gradient-conflict collection), útil para estudiar interferencia entre tareas.
- Análisis LAPE por capa: el checkpoint incluye métricas de fracción compartida por capa para estudiar escalado de datos.
- Prior k10 reutilizable por objetivos del mismo tamaño.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo "thinking"; no disponibles.

## Casos de uso

- Investigación en escalado de datos para VLA: usar este checkpoint como fuente de 10k frames para reproducir el estudio LAPE de `Donghyun1228/vla_adaptation` y comparar con la fuente de 50k.
- Estudio de conflictos de gradiente en entrenamiento conjunto IL + IDM: el preset `conflict_mean_source` permite analizar interferencia entre objetivos y su efecto en la política final.
- Adaptación a nuevos entornos LIBERO: partir de estos pesos y afinar con datos del entorno objetivo, aprovechando la normalización incluida en `assets`.
- Análisis de representaciones por capa: usar `lape/analysis_tau1.json` para identificar capas con mayor o menor fracción compartida y guiar estrategias de congelación o adaptación selectiva.
- Reutilización del prior k10: emplear `prior/lape_k10/` como regularizador en objetivos del mismo tamaño dentro de experimentos de adaptación.
- Reproducibilidad de experimentos: el checkpoint incluye `train_state` completo, lo que facilita reanudar entrenamiento o auditar la receta (LR, updates, sonda de 10k frames).
- Base para comparativas de eficiencia de datos: medir cuánto rendimiento se pierde al reducir la fuente de 50k a 10k frames por entorno en tareas LIBERO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 32,2 GB, pero ese tamaño incluye `params`, `train_state` y `assets`, por lo que no equivale directamente a la VRAM de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del artefacto, es razonable esperar requisitos de GPU de datacenter (A100/H100) para entrenamiento o ajuste, pero no se confirma en la model card.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: el checkpoint está pensado para el stack openpi; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 LIBERO mean-IDM source 10k (este) | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face |
| `Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024` | no disponible | no disponible | no disponible | no disponible en la información | Hugging Face |
| Otros checkpoints π0.5 del ecosistema openpi | no disponible | no disponible | no disponible | variable | Hugging Face / openpi |

La comparativa se limita a la fuente de 50k del mismo autor, que comparte receta pero con sonda de 50k frames. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros VLA.

## Limitaciones y advertencias

- Modelo de investigación: no es un LLM generalista ni un asistente conversacional; su uso previsto es robótica y experimentación con VLA.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas LIBERO en la información disponible.
- Sesgos: no documentados; al entrenarse sobre datos de robótica, puede heredar sesgos de las demostraciones y entornos de origen.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero la política puede generar acciones no válidas fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; no se documentan idiomas soportados.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia de los datos de entrenamiento y del modelo base π0.5 subyacente.
- Caveat de producción: el checkpoint incluye `train_state` y artefactos de análisis; no está empaquetado como modelo de inferencia listo para servir. Requiere el driver `a7a183e5` de `Donghyun1228/vla_adaptation` para reproducir el experimento.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-scale-source-n10000-10000-20261103
- Fuente de 50k del mismo autor: https://huggingface.co/Donghyun1228/pi05-libero-conflict-mean-source-n50k-10000-20261024
- Repositorio de driver: `Donghyun1228/vla_adaptation` (commit `a7a183e5`), referenciado en la model card; URL exacta no disponible en la información proporcionada.
- openpi: ecosistema referenciado en los tags; URL exacta no disponible en la información proporcionada.
- LIBERO: benchmark referenciado en los tags; URL exacta no disponible en la información proporcionada.
