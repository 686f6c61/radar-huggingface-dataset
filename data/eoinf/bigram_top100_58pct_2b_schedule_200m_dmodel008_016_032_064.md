# eoinf/bigram_top100_58pct_2b_schedule_200m_dmodel008_016_032_064

## Resumen

Este repositorio contiene un checkpoint experimental de un transformer causal de juguete (d_model=8, 16, 32 y 64 según el nombre del directorio, aunque el identificador del modelo sugiere una variante concreta dentro de una rejilla de experimentos) publicado por el usuario `eoinf` bajo el paraguas de un proyecto llamado "Transformer experiment grid". No se trata de un modelo de lenguaje destinado a producción ni a uso general, sino de un artefacto de investigación sobre el que se documentan hiperparámetros, historial de checkpoints y metadatos de entrenamiento en formato de diccionario de estado de PyTorch.

El modelo se entrena sobre un vocabulario de 4096 tokens con una longitud de contexto de 256 tokens y un presupuesto nominal de 1.999.998.976 tokens de entrenamiento (aproximadamente 2 mil millones). Los horizontes reales por modelo, incluyendo paradas tempranas, se registran en `grid_summary.json` y `result.json`, lo que indica que el entrenamiento pudo detenerse antes de agotar el presupuesto nominal.

La relevancia de este repositorio es metodológica, no de capacidad: sirve para estudiar el comportamiento de transformers causales extremadamente pequeños en función de la anchura (d_model), con semillas controladas y un dataset/tokenizador documentados en `configuration.json`. No hay información pública sobre benchmarks, licencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (tiny causal transformer) |
| Parámetros totales | no disponible (d_model entre 8 y 64; recuento exacto no publicado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | state-dict checkpoints de PyTorch (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de dimensiones reducidas, con valores de `d_model` de 8, 16, 32 y 64, una semilla por anchura, vocabulario de 4096 tokens y contexto de 256 tokens. El presupuesto nominal de entrenamiento es de 1.999.998.976 tokens, aunque el autor indica que los horizontes efectivos por modelo, incluidas paradas tempranas, se registran en `grid_summary.json` y `result.json`. No se especifican el número de capas, cabezas de atención, función de activación ni detalles del optimizador más allá de que los estados de reanudación del optimizador no se incluyen en el repositorio.

El dataset y el tokenizador se remiten a `configuration.json`, y el código de arquitectura y carga se encuentra en el repositorio `synthetic_trigrams`. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación; tampoco se mencionan innovaciones como decodificación especulativa o atención lineal. Cada directorio de modelo contiene checkpoints de state-dict, la definición de la ejecución, el historial de checkpoints, el log de actualizaciones de entrenamiento y metadatos de resultados.

## Capacidades

- Generación de texto causal a nivel de token sobre un vocabulario de 4096 entradas y contexto de 256 tokens.
- Modelado de secuencias sintéticas (el proyecto se denomina `synthetic_trigrams`), orientado a experimentos controlados más que a texto natural.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas no están disponibles.
- No se documenta modo de pensamiento (thinking), visión, audio ni otras capacidades especiales.
- El tamaño extremadamente reducido (d_model de 8 a 64) limita la capacidad expresiva a patrones muy simples.

## Casos de uso

- Estudio de escalado en anchura: comparar el comportamiento de transformers con d_model de 8, 16, 32 y 64 bajo el mismo presupuesto de tokens y una sola semilla por anchura, usando los metadatos de `grid_summary.json` y `result.json`.
- Reproducción de experimentos de entrenamiento: el repositorio incluye la definición de la ejecución, el historial de checkpoints y el log de actualizaciones, lo que permite auditar la curva de entrenamiento y las paradas tempranas.
- Docencia sobre transformers causales: un modelo de juguete con contexto de 256 tokens y vocabulario de 4096 es adecuado para ilustrar el flujo completo de tokenización, forward pass y generación autoregresiva en un entorno de recursos mínimos.
- Pruebas de infraestructura de carga de state-dicts: sirve para validar pipelines de carga de checkpoints PyTorch y de metadatos asociados antes de escalar a modelos mayores.
- Análisis de tokenizadores y datasets sintéticos: al remitir la configuración a `configuration.json`, permite estudiar cómo un tokenizador de 4096 entradas y un dataset de trigramas sintéticos afectan al aprendizaje en modelos muy pequeños.
- Baseline de referencia para experimentos de juguete: útil como línea base de baja capacidad contra la que comparar variantes arquitectónicas en entornos de investigación con presupuesto computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0.0 GB) y los valores de d_model (8 a 64) y contexto de 256, el modelo es extremadamente pequeño y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente, incluidas GTX 1060, RTX 3060, RTX 4090, A100 o H100, si bien estas últimas están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, con margen amplio; también en CPU y en entornos con poca memoria.
- Opciones de despliegue: carga directa con PyTorch mediante state-dicts; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato de pesos (state-dict, no safetensors/GGUF) complica su uso con esos motores sin conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| eoinf/bigram_top100_58pct_2b_schedule_200m_dmodel008_016_032_064 | no disponible (d_model 8-64) | 256 | no disponible | state-dict PyTorch | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (transformers causales de juguete con d_model inferior a 64) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación de juguete: no está pensado para uso en producción ni para tareas de lenguaje natural reales.
- Capacidad muy limitada: d_model de 8 a 64 y contexto de 256 tokens restringen severamente la expresividad y la coherencia a largo plazo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso fuera de investigación.
- Idiomas no documentados: no hay garantía de comportamiento multilingüe ni de calidad en castellano u otros idiomas.
- Riesgo de alucinación: inherente a cualquier modelo generativo, agravado aquí por la escasez de capacidad y de datos documentados.
- Sesgos: no documentados; el dataset y el tokenizador se remiten a `configuration.json`, sin análisis de sesgo publicado.
- Formato de pesos no estándar: los state-dicts de PyTorch requieren código de carga específico del repositorio `synthetic_trigrams`, lo que dificulta la integración con herramientas estándar.
- Sin estados del optimizador ni datos de entrenamiento: el repositorio no incluye estados de reanudación del optimizador ni los datos de entrenamiento, lo que limita la reproducibilidad completa.
- Sin benchmarks publicados: no es posible evaluar su rendimiento de forma objetiva con la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/eoinf/bigram_top100_58pct_2b_schedule_200m_dmodel008_016_032_064
- Repositorio de código y arquitectura: `synthetic_trigrams` (referenciado en la model card; no se proporciona URL directa)
- Metadatos de entrenamiento: `grid_summary.json`, `result.json` y `configuration.json` (incluidos en el repositorio del modelo)
