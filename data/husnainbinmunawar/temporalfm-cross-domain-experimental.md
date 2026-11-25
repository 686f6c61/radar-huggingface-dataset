# husnainbinmunawar/temporalfm-cross-domain-experimental

## Resumen

TemporalFM cross-domain transfer es un modelo experimental de predicción de series temporales desarrollado por el usuario husnainbinmunawar. Se trata de un forecaster probabilístico basado en una red GRU compacta que produce cuantiles, inicializado a partir de una línea base real del NOAA (National Oceanic and Atmospheric Administration) y ajustado posteriormente sobre la serie OT (temperatura del aceite de transformadores eléctricos) del conjunto de datos ETTh1. El modelo resuelve el problema de la predicción probabilística de series temporales, es decir, no solo estima el valor futuro sino que modela la distribución mediante cuantiles.

El modelo es relevante como experimento de transferencia entre dominios (cross-domain transfer), ya que parte de un modelo entrenado en datos climáticos del NOAA y lo adapta a un dominio completamente distinto (series eléctricas industriales). Su tamaño es extremadamente reducido: 3.721 parámetros totales según los pesos en safetensors, lo que lo convierte en un artefacto de investigación más que en un modelo de producción. La calibración se realiza mediante un escalado empírico del ancho de intervalo sobre un conjunto de validación, no mediante una garantía universal de incertidumbre.

La licencia es CC-BY-4.0 y el formato de pesos es safetensors con librería PyTorch. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas) con cabeza de predicción por cuantiles |
| Parametros totales | 3.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una GRU compacta con una cabeza de salida que produce cuantiles para la predicción probabilística. El modelo se inicializa desde una línea base real del NOAA, lo que implica que parte de pesos preentrenados en un dominio climático, y después se ajusta (fine-tuning) sobre la serie OT del dataset ETTh1, que contiene mediciones de temperatura de aceite de transformadores eléctricos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo de regresión de series temporales). La innovación técnica destacable es el enfoque de transferencia entre dominios combinado con una calibración empírica del ancho de intervalo mediante un conjunto de validación retenido, en lugar de una garantía teórica de cobertura.

## Capacidades

- Predicción probabilística de series temporales mediante cuantiles.
- Transferencia entre dominios: inicialización en dominio climático (NOAA) y ajuste a dominio eléctrico (ETTh1 OT).
- Calibración empírica de intervalos de incertidumbre sobre conjunto de validación retenido.
- Modelado de dependencias temporales secuenciales mediante capas GRU.
- No dispone de soporte de tool calling ni function calling (no es un modelo de lenguaje).
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de temperatura de aceite en transformadores eléctricos: el modelo está ajustado específicamente sobre la serie OT de ETTh1, por lo que puede emplearse para estimar la evolución futura de esa variable con intervalos de incertidumbre calibrados empíricamente.
- Investigación en transferencia entre dominios: sirve como referencia para estudiar cómo un modelo preentrenado en datos climáticos se adapta a un dominio industrial con pocos datos de ajuste.
- Evaluación de calibración probabilística: al usar un escalado empírico del ancho de intervalo, es útil para comparar metodologías de calibración frente a enfoques teóricos de cobertura.
- Prototipado rápido de forecasters cuantílicos: con 3.721 parámetros, puede ejecutarse en cualquier entorno con PyTorch sin requisitos de hardware significativos.
- Docencia y experimentación académica: su tamaño mínimo permite inspeccionar pesos, reproducir el ajuste y analizar el comportamiento de una GRU cuantílica en un caso real.
- Línea base para comparativas de forecasting: puede servir como referencia de bajo coste frente a modelos de series temporales de mayor tamaño en benchmarks de predicción probabilística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB, dado que el modelo tiene 3.721 parámetros en precisión estándar.
- GPU recomendadas: cualquier GPU, incluida una CPU convencional; no requiere acelerador dedicado.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo; no se dispone de información sobre integración con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TemporalFM cross-domain transfer | 3.721 | no disponible | CC-BY-4.0 | Hugging Face (0 descargas) |
| Alternativas de forecasting de series temporales | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La calibración se basa en un escalado empírico del ancho de intervalo sobre un conjunto retenido; no constituye una garantía universal de cobertura de incertidumbre.
- El ajuste se realizó sobre una única serie (ETTh1 OT), por lo que la generalización a otras series o dominios no está validada.
- El modelo tiene 3.721 parámetros, un tamaño que limita severamente su capacidad expresiva frente a arquitecturas de mayor escala.
- No se dispone de información sobre sesgos, ya que el modelo opera sobre series numéricas y no sobre texto.
- Riesgo de alucinación no aplicable en el sentido habitual; el riesgo relevante es la extrapolación incorrecta fuera del rango de entrenamiento.
- No se dispone de información sobre limitaciones de contexto o idioma.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el carácter experimental del modelo desaconseja su uso en producción sin validación previa.
- No hay descargas ni likes registrados, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/husnainbinmunawar/temporalfm-cross-domain-experimental
