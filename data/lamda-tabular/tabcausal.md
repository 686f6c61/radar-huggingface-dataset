# LAMDA-Tabular/TabCausal

## Resumen

TabCausal es un modelo de descubrimiento causal para datos tabulares, desarrollado por el grupo LAMDA-Tabular (Laboratory of Advanced Machine Learning and Data Analytics) de la Universidad de Nanjing. Su objetivo es predecir el grafo causal dirigido que subyace a un conjunto de datos tabulares, ya sean observacionales o con intervenciones. A diferencia de los métodos clásicos de descubrimiento causal, que requieren búsqueda y optimización por cada dataset, TabCausal se presenta como un "modelo fundacional de descubrimiento causal" (CDFM) que amortiza la inferencia: dado un dataset de entrada, produce en una única pasada directa las probabilidades de aristas dirigidas y una matriz de adyacencia umbralizada.

El modelo está disponible en Hugging Face como checkpoint y en GitHub con código de inferencia, utilidades de benchmark y generación de datos sintéticos. Su publicación (arXiv:2605.31156) describe la preentrenación a través de entornos causales heterogéneos. En el momento de esta ficha, la información técnica pública es limitada: no se especifican la arquitectura interna, el número de parámetros, la longitud de contexto ni la licencia, aunque el repositorio permite su uso para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint en formato `.pt` (PyTorch) |

## Arquitectura y entrenamiento

La información técnica pública no detalla la arquitectura interna del modelo. El paper menciona que TabCausal se entrena mediante preentrenamiento a través de múltiples entornos causales, con el objetivo de aprender habilidades de inferencia estructural reutilizables. La entrada es un conjunto de datos tabulares, opcionalmente acompañado de indicadores de intervención, y la salida es un grafo causal dirigido representado como logits de aristas, probabilidades y una matriz de adyacencia. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Predicción de grafos causales dirigidos a partir de datos tabulares observacionales o mixtos (observacionales e intervencionales).
- Salida múltiple: logits de aristas dirigidas, probabilidades y matriz de adyacencia umbralizada.
- Acepta formatos de datos numéricos comunes: `.npz`, `.csv`, `.tsv`, `.npy`, `.parquet`, `.pkl`.
- Inferencia en una sola pasada (single forward pass), sin necesidad de búsqueda ni optimización por dataset.
- Proporciona interfaz de línea de comandos y API Python para predicción y evaluación.
- Incluye herramientas de generación de datos sintéticos para reproducir benchmarks.

## Casos de uso

- **Descubrimiento causal en investigación biomédica**: identificar relaciones causales entre variables clínicas o moleculares a partir de datos observacionales, para generar hipótesis sobre mecanismos subyacentes. TabCausal puede procesar tablas de pacientes y devolver un grafo de influencias potenciales.
- **Análisis de datos económicos**: detectar dependencias causales entre indicadores macroeconómicos o variables de mercado, útil para modelado de riesgos y políticas. La salida en forma de matriz de adyacencia facilita la interpretación.
- **Control de calidad industrial**: a partir de datos de sensores de procesos de fabricación, inferir qué variables afectan a la calidad del producto final, orientando la intervención en la línea de producción.
- **Investigación en ciencias sociales**: analizar encuestas o datos de panel para descubrir relaciones causales entre factores sociales y de comportamiento, sin necesidad de diseñar experimentos controlados.
- **Sistemas de recomendación**: identificar relaciones causales entre interacciones de usuarios y atributos de los ítems, lo que permite una mejor personalización basada en mecanismos subyacentes.
- **Integración en pipelines de datos**: dado que acepta formatos tabulares estándar y se invoca por CLI, puede integrarse en flujos de datos automatizados para generar grafos causales en cada actualización de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de GitHub indica que se incluyen utilidades de evaluación y generación de benchmarks, pero no se han proporcionado números concretos (MMLU, HumanEval, etc.) en la información consultada.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. El checkpoint pesa 0.1 GB, lo que sugiere que el modelo es de tamaño pequeño o mediano, y probablemente ejecutable en GPUs con al menos 4-8 GB de VRAM. Sin embargo, no se han publicado especificaciones de VRAM, latencia ni throughput. Se recomienda usar una GPU NVIDIA con CUDA para inferencia (el comando de ejemplo utiliza `--device cuda:0`). No se ha confirmado soporte para CPU, aunque es plausible que funcione con PyTorch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la categoría de descubrimiento causal tabular. La comparativa con otras alternativas (por ejemplo, métodos clásicos como PC, FCI o modelos de aprendizaje automático específicos) no está disponible en la información pública consultada.

## Limitaciones y advertencias

- La licencia no está especificada; se desconoce si es de uso comercial o exclusivamente académico. Se recomienda consultar el repositorio de GitHub antes de un uso en producción.
- No hay información sobre sesgos del modelo ni sobre su comportamiento en dominios específicos (por ejemplo, datos de texto, datos con variables categóricas no numéricas).
- La salida es un grafo causal probabilístico; las predicciones deben interpretarse como hipótesis, no como relaciones causales confirmadas. Es necesaria validación experta.
- El modelo está diseñado para datos tabulares numéricos; no procesa datos de texto, imágenes ni series temporales complejas.
- No se han publicado métricas de rendimiento en benchmarks estándar, por lo que se desconoce su precisión comparativa.
- La documentación disponible es limitada; la instalación y uso requieren clonar el repositorio de GitHub y ejecutar el script de instalación.

## Enlaces

- [Hugging Face: LAMDA-Tabular/TabCausal](https://huggingface.co/LAMDA-Tabular/TabCausal)
- [GitHub: LAMDA-Tabular/TabCausal](https://github.com/LAMDA-Tabular/TabCausal)
- [Paper arXiv:2605.31156](https://arxiv.org/abs/2605.31156)
- [Paper HTML en arXiv](https://arxiv.org/html/2605.31156v1)
