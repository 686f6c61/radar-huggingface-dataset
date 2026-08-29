# Lostboy231/cgc

## Resumen

El repositorio `Lostboy231/cgc` no contiene un modelo de lenguaje, sino el código y los experimentos de un método de compresión de modelos denominado *Capability-Guided Compression* (CGC), desarrollado por Rishaank Gupta como investigador independiente. El trabajo, descrito en el artículo arXiv 2603.16440, propone asignar presupuestos de poda por cabeza de atención basándose en la densidad de "capacidad" medida mediante sparse autoencoders (SAEs), en lugar de criterios puramente basados en magnitud de pesos. El objetivo es lograr compresiones más interpretables y eficientes que los métodos tradicionales como Wanda.

Los experimentos v1 se realizan sobre GPT-2 Medium (355M parámetros, 24 capas, 16 cabezas por capa). El resultado principal es honestamente negativo: la compresión guiada por capacidad (CGC-L) empeora la perplejidad en WikiText-2 frente a una poda uniforme (27.87 vs 27.57), y la correlación entre densidad de capacidad e importancia de Wanda es prácticamente nula (Spearman ρ = −0.054). El autor reporta estos resultados de forma transparente y diagnostica las causas, lo que convierte a este repositorio en un caso de estudio valioso sobre los límites de la interpretabilidad aplicada a la compresión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo; es un método de compresión sobre GPT-2 Medium (24 capas, 16 cabezas, head_dim=64) |
| Parametros totales | 355M (modelo base GPT-2 Medium) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el método usa poda por magnitud, no cuantización) |
| Idiomas soportados | No disponible (el modelo base GPT-2 es principalmente inglés) |
| Licencia | No disponible en HuggingFace; el código se distribuye vía GitHub sin licencia explícita en la model card |
| Formato de pesos | No aplica (es código Python; los pesos de GPT-2 Medium se cargan desde la librería transformers) |

## Arquitectura y entrenamiento

El método CGC se compone de tres fases. Primero, se entrena un sparse autoencoder (SAE) TopK (dict_size=512, k=25, 5 épocas) sobre las activaciones de cada una de las 384 cabezas de atención de GPT-2 Medium. Con el SAE entrenado, se calcula un mapa de densidad de capacidad por cabeza, definido como la fracción de características activas en un conjunto de calibración. En la segunda fase, se realiza una ablación para medir la sensibilidad de la perplejidad a la poda de cada cabeza. Finalmente, se asigna un presupuesto de poda por cabeza proporcional a su densidad de capacidad (CGC-L) y se aplica poda por magnitud a nivel de pesos.

El entrenamiento de los SAEs se realiza sobre activaciones recogidas del modelo base, sin ajuste fino posterior. La evaluación se hace con perplejidad en WikiText-2. El autor incluye dos implementaciones del criterio de importancia de Wanda: una aproximación por cabeza (modo `paper`) y la versión correcta por peso (modo `real`). No se utilizan técnicas como RLHF o DPO; el enfoque es puramente de compresión post-hoc.

## Capacidades

- Compresión de modelos mediante poda estructurada por cabeza de atención.
- Análisis de interpretabilidad con sparse autoencoders (SAEs) para medir la densidad de características activas.
- Cálculo de mapas de densidad de capacidad y correlación con criterios de importancia establecidos (Wanda).
- Evaluación de perplejidad en WikiText-2 para medir el impacto de la compresión.
- Reproducibilidad mediante semilla fija (SEED = 42) en todos los scripts.
- Soporte para dos modos de cálculo de importancia Wanda (aproximado y exacto).
- Generación de figuras para visualizar los resultados (scripts de plot).

## Casos de uso

- Investigación en compresión de LLMs: el repositorio sirve como base para experimentar con asignación de presupuesto de poda basada en interpretabilidad, comparando contra métodos uniformes o basados en magnitud.
- Estudio de sparse autoencoders: el código de entrenamiento de SAEs TopK puede reutilizarse para analizar la estructura interna de modelos transformer.
- Evaluación de criterios de importancia: permite comparar la correlación entre densidad de capacidad y métricas como Wanda, útil para decidir qué cabezas podar en producción.
- Reproducción de resultados negativos: el caso documentado de un método que no mejora la compresión uniforme es un recurso didáctico para entender las limitaciones de la interpretabilidad.
- Desarrollo de nuevas métricas de compresión: los scripts modulares (sae.py, density.py, compress.py) facilitan la extensión a otros modelos o datasets.
- Integración en pipelines de investigación: al ser código Python con dependencias estándar (transformers, torch), puede incorporarse a flujos de experimentación existentes.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en WikiText-2 (perplejidad, menor es mejor):

| Metodo | Perplejidad |
|---|---|
| Modelo denso (sin poda) | 26.68 |
| Poda uniforme | 27.57 |
| CGC-L (asignación por densidad) | 27.87 |
| Asignación invertida | 27.86 |

Además, se reporta la correlación de Spearman entre densidad de capacidad e importancia Wanda: ρ = −0.054 (independencia). La correlación entre densidad y cambio de perplejidad tras ablación es r = −0.066 (p = 0.20, no significativa). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el trabajo se centra en compresión y no en capacidades de razonamiento.

## Requisitos de hardware

- GPU requerida: el autor indica que todos los experimentos se ejecutaron en una T4 (16 GB VRAM) de Google Colab o Lightning.ai.
- VRAM estimada: para GPT-2 Medium (355M) en fp32, el uso de memoria ronda los 2-3 GB; con SAEs adicionales y activaciones, el pico puede superar los 8 GB, pero cabe en una T4.
- GPU recomendadas: T4, RTX 3060 o superiores; cualquier GPU con al menos 8 GB de VRAM es suficiente.
- Opciones de despliegue: no aplica para inferencia de un modelo comprimido; el código se ejecuta como scripts de Python (compute_density_map.py, run_compression.py, plot_results.py) o mediante el notebook de Colab.
- Latencia y throughput: no se proporcionan datos; el autor estima 15-20 minutos para el mapa de densidad y 30 minutos para la ablación y compresión en T4.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo de lenguaje, sino un método de compresión. No se proporcionan comparaciones con otros métodos de compresión (como SparseGPT, LLM-Pruner, etc.) en la información disponible. La única comparación interna es contra la poda uniforme y la asignación invertida, que se muestra en la sección de benchmarks.

## Limitaciones y advertencias

- Resultados negativos: el método CGC-L empeora la perplejidad frente a la poda uniforme en GPT-2 Medium. No debe usarse como sustituto de métodos establecidos sin validación previa.
- Correlación no significativa: la relación entre densidad de capacidad y sensibilidad a la poda no es estadísticamente significativa (p = 0.20), lo que limita la utilidad predictiva del método.
- Sesgo del modelo base: GPT-2 Medium tiene una estructura de cabezas homogénea y poca sensibilidad a la poda, lo que el autor identifica como una causa del fracaso. Los resultados pueden no generalizar a modelos más grandes o heterogéneos.
- Entrenamiento superficial de SAEs: solo 5 épocas y un diccionario pequeño (512) pueden no capturar la verdadera estructura de características.
- Reproducibilidad parcial: los experimentos originales se ejecutaron sin semilla fija; aunque el código actual usa SEED=42, los números pueden variar ligeramente.
- Licencia no especificada: no se indica licencia en HuggingFace ni en el repositorio de GitHub, lo que puede limitar su uso comercial o la redistribución.
- Sin soporte de producción: el código es experimental, sin garantías de estabilidad ni mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Lostboy231/cgc
- Paper arXiv: https://arxiv.org/abs/2603.16440
- Repositorio GitHub (mencionado en la model card): https://github.com/rishaankgupta/CGC
