# Kurofu/UHI_E3LLM

## Resumen

UHI-E3LLM es un modelo de predicción de intensidad de isla de calor urbana (UHI) a escala mensual, acompañado de generación de explicaciones a nivel de factor. El repositorio `Kurofu/UHI_E3LLM` contiene únicamente los adaptadores PEFT/LoRA entrenados sobre el modelo base `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`, un transformer decoder-only de 8 000 millones de parámetros con razonamiento reforzado. El desarrollo corre a cargo del grupo ZJU-DAILY (Universidad de Zhejiang) y combina supervisión fina (SFT), alineación con optimización por políticas proximales (PPO) y destilación de explicaciones, todo ello sin redistribuir los pesos originales del modelo base.

La relevancia actual radica en que aborda un problema medioambiental concreto —la isla de calor urbana— mediante un enfoque de LLM aplicado a series temporales, algo poco frecuente en la literatura. El adaptador permite reconstruir el pipeline completo a partir del modelo base, lo que facilita su evaluación y despliegue sin incurrir en el coste de almacenar 8 000 millones de parámetros adicionales. El repositorio incluye los checkpoints de cada etapa de entrenamiento (cinco épocas de SFT, dos de PPO y dos de destilación), así como el adaptador fusionado resultante de una selección ponderada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre DeepSeek-R1-Distill-Llama-8B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador es de baja dimensión; el base tiene 8 000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la del modelo base no se especifica en la documentación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-R1-Distill-Llama-8B, un transformer decoder-only con atención causal y destilado de DeepSeek-R1 para razonamiento. Sobre este se añaden adaptadores LoRA de baja dimensión, que no modifican los pesos originales. El entrenamiento se divide en tres fases documentadas en el repositorio: una primera de supervisión fina (SFT) durante cinco épocas, donde se ajusta el modelo para predecir la intensidad de UHI a partir de datos de entrada; una segunda de fusión de adaptadores mediante selección ponderada (greedy); y una tercera de alineación con PPO en dos épocas, que refuerza la calidad de las explicaciones generadas. Finalmente, se aplica una destilación de explicaciones que genera adaptadores específicos para cada política entrenada.

Los detalles sobre el dataset, el preprocesamiento y las instrucciones de evaluación se encuentran en el repositorio de código en GitHub. El conjunto de datos procesado está archivado en Zenodo con DOI 10.5281/zenodo.22161925. No se especifican el número de tokens de entrenamiento ni la composición exacta del corpus.

## Capacidades

- Predicción de la intensidad mensual de isla de calor urbano a partir de variables de entrada (presumiblemente climáticas y urbanísticas, aunque no se detallan).
- Generación de explicaciones a nivel de factor, indicando qué variables contribuyen más al fenómeno en cada periodo.
- Razonamiento numérico y análisis de series temporales, heredado del modelo base DeepSeek-R1-Distill-Llama-8B.
- Capacidad de generación de texto general y de código, aunque su especialización principal es la tarea UHI.
- Soporte de tool calling y de agentes no se documenta en la información disponible; se asume que depende del modelo base.
- Multilingüismo limitado al inglés, según la model card.

## Casos de uso

- Planificación urbana: los urbanistas pueden utilizar las predicciones mensuales de UHI para evaluar el impacto de nuevas zonas verdes o cambios en la densidad edificatoria, apoyándose en las explicaciones por factor para justificar decisiones.
- Estudios de climatología local: investigadores pueden alimentar el modelo con datos históricos de estaciones meteorológicas y obtener proyecciones de intensidad de calor junto con los factores dominantes (albedo, vegetación, tráfico, etc.).
- Generación de informes automáticos: el modelo produce explicaciones textuales que pueden integrarse en informes municipales sobre calidad ambiental, reduciendo el trabajo manual de redacción.
- Simulación de escenarios: al modificar las variables de entrada, se pueden simular políticas hipotéticas (incremento de arbolado, cambio de materiales de cubierta) y observar cómo cambia la intensidad de UHI y sus causas.
- Sistemas de alerta temprana: aunque la predicción es mensual, el adaptador podría adaptarse a periodos más cortos con datos adicionales, sirviendo de base para alertas de olas de calor urbanas.
- Investigación académica: el pipeline de entrenamiento (SFT + PPO + destilación) es replicable y sirve como referencia para aplicar LLMs a problemas de series temporales con explicabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas como RMSE, MAE o comparativas con otros modelos de predicción de UHI. Tampoco se aportan evaluaciones de calidad de las explicaciones generadas.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB), pero requiere cargar el modelo base DeepSeek-R1-Distill-Llama-8B, que ocupa aproximadamente 16 GB en precisión FP16.
- Para inferencia en GPU consumer, se recomienda al menos una tarjeta con 16 GB de VRAM (por ejemplo, RTX 4080 o superior) si se usa cuantización de 4 bits; sin cuantizar, se necesitan 24 GB o más (RTX 3090/4090).
- En entornos profesionales, una A100 de 40 GB o H100 permiten ejecutar el modelo completo con margen para batch.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base. Para servir en producción, se recomienda vLLM o TGI con soporte de LoRA, aunque la compatibilidad exacta no está documentada.
- También es posible ejecutarlo con llama.cpp si se fusionan los adaptadores en el modelo base y se convierte a GGUF, pero no se proporcionan instrucciones al respecto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para predicción de UHI con LLMs. La única referencia directa es el propio modelo base DeepSeek-R1-Distill-Llama-8B, del cual este adaptador es una especialización. Otros modelos de series temporales basados en transformers (como Chronos o TimesFM) no son directamente comparables porque no generan explicaciones textuales. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia "other" no especifica las condiciones de uso; se recomienda contactar con los autores antes de utilizarlo en proyectos comerciales.
- El modelo está entrenado específicamente para datos de UHI en inglés; su rendimiento en otros idiomas o dominios no está garantizado.
- Al ser un adaptador LoRA, depende completamente del modelo base DeepSeek-R1-Distill-Llama-8B; cualquier sesgo o alucinación del base se hereda.
- No se han publicado evaluaciones rigurosas de la precisión de las predicciones ni de la coherencia de las explicaciones; su uso en entornos críticos requiere validación adicional.
- La longitud de contexto no se documenta, por lo que la capacidad para manejar series temporales largas es incierta.
- El repositorio no incluye instrucciones de despliegue en producción, ni formatos de cuantización listos para usar.

## Enlaces

- Repositorio de adaptadores en Hugging Face: https://huggingface.co/Kurofu/UHI_E3LLM
- Repositorio de código (GitHub): https://github.com/ZJU-DAILY/UHI_E3LLM
- Dataset procesado (Zenodo): https://doi.org/10.5281/zenodo.22161925
