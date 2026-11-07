# cyttic/hmt-trocrctc-elastic1-s43

## Resumen

`cyttic/hmt-trocrctc-elastic1-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) entrenado por el grupo cyttic como parte de un estudio sobre transferencia de métricas en aumento de datos (`htr-metrics-transfer`). Se trata de un modelo basado en TrOCR con cabecera CTC, entrenado sobre el conjunto `cyttic/hhd-optionb-split` con la técnica de aumento de datos `elastic1` y la semilla 43. Forma parte de una familia de experimentos que varían arquitectura, aumento y semilla para medir cómo las métricas de distribución sin entrenamiento predicen la utilidad del aumento de datos.

El modelo tiene 87.279.756 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,3 GB. Está especializado en hebreo manuscrito (`language: he`) y su licencia es MIT. Su relevancia es fundamentalmente metodológica: sirve como punto de comparación dentro de un estudio controlado, no como un modelo de propósito general.

No se dispone de información sobre el pipeline de Hugging Face ni sobre la longitud de contexto, ya que el modelo está orientado a líneas de texto manuscrito y decodificación CTC codiciosa sin modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (transformer encoder-decoder adaptado a CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR (`trocrctc`), es decir, un transformer de visión y texto adaptado a reconocimiento de escritura manuscrita con una cabecera de clasificación temporal conexionista (CTC). El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, con el aumento de datos `elastic1` y la semilla 43. La decodificación empleada en la evaluación es CTC codiciosa (*greedy*) sin modelo de lenguaje.

La innovación principal no está en el modelo en sí, sino en el marco experimental: el proyecto `htr-metrics-transfer` investiga si métricas de distribución sin entrenamiento pueden predecir cuánto ayuda el aumento de datos a un reconocedor entrenado con pocos datos reales. El conjunto HHD emplea un split Option-B con separación a nivel de párrafo y de escritor, lo que evita fugas de información entre entrenamiento y evaluación. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea o párrafo.
- Decodificación CTC codiciosa sin modelo de lenguaje externo.
- Entrenado específicamente para el conjunto HHD Option-B, con separación por escritor.
- No se ha documentado soporte de *tool calling* ni de *function calling*.
- No se ha documentado soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo; no hay evidencia de otros idiomas.
- No se ha documentado modo de razonamiento (*thinking*), visión general, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en aumento de datos para HTR: el modelo sirve como punto de medida controlado (aumento `elastic1`, semilla 43) para comparar con otras variantes de la misma familia y evaluar la transferencia de métricas de distribución.
- Transcripción de manuscritos en hebreo: puede emplearse para digitalizar líneas de texto manuscrito cuando el dominio coincide con el del conjunto HHD, con la advertencia de que su CER de 0,1122 implica una tasa de error considerable.
- Reproducción de experimentos: al estar publicados los pesos y el código en el repositorio `htr-metrics-transfer`, permite replicar los resultados del estudio y verificar la metodología.
- Línea base para comparativas de arquitectura: útil para contrastar TrOCR+CTC frente a otras variantes como `htrvt` (CER 0,0622, WER 0,2819 con la misma semilla y aumento en el modelo hermano `hmt-htrvt-elastic1-s42`).
- Evaluación de robustez frente a distorsiones elásticas: el aumento `elastic1` permite estudiar el comportamiento del modelo ante deformaciones geométricas del trazo.
- Análisis de ablación por semilla: junto con otras semillas de la misma familia, permite estimar la varianza del rendimiento debida a la inicialización.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test HHD Option-B, decodificación CTC codiciosa sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,1122 |
| WER | 0,4576 |

Comparación con el modelo hermano de la misma familia (mismo aumento `elastic1`, semilla 42, arquitectura `htrvt`):

| Modelo | Arquitectura | Semilla | CER | WER |
|---|---|---|---|---|
| cyttic/hmt-trocrctc-elastic1-s43 | trocrctc | 43 | 0,1122 | 0,4576 |
| cyttic/hmt-htrvt-elastic1-s42 | htrvt | 42 | 0,0622 | 0,2819 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,35 GB en fp32 (87,3 M de parámetros) y en torno a 0,18 GB en fp16; el repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia por líneas.
- Opciones de despliegue: al ser un modelo TrOCR con safetensors, puede cargarse con la librería `transformers` de Hugging Face; no se ha documentado soporte específico para vLLM, llama.cpp, Ollama o TGI, que no están orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-elastic1-s43 | trocrctc | 87,3 M | no disponible | 0,1122 | MIT | Hugging Face |
| cyttic/hmt-htrvt-elastic1-s42 | htrvt | no disponible | no disponible | 0,0622 | no disponible | Hugging Face |
| TrOCR base (referencia general) | TrOCR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de HTR en hebreo con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El CER de 0,1122 y el WER de 0,4576 indican un rendimiento moderado; el WER superior al 45 % limita su uso en producción sin revisión humana.
- Entrenado exclusivamente sobre el conjunto HHD Option-B; puede generalizar mal a otros dominios, estilos de escritura o formatos de documento.
- Idiomas soportados limitados al hebreo; no hay evidencia de capacidad multilingüe.
- No se ha documentado el uso de modelo de lenguaje en la decodificación, lo que reduce la corrección contextual de errores.
- Riesgo de alucinación y de sustituciones erróneas en caracteres ambiguos, inherente a los modelos CTC sin LM.
- No se dispone de información sobre sesgos específicos del conjunto de entrenamiento ni sobre su composición demográfica.
- La licencia MIT permite uso comercial, pero el modelo está pensado como artefacto de investigación; conviene validar su rendimiento en el dominio objetivo antes de desplegarlo.
- No se han documentado requisitos de contexto ni límites de longitud de entrada más allá de los propios del reconocimiento por líneas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-elastic1-s43
- Repositorio del proyecto: https://github.com/cyttic/htr-metrics-transfer
- Modelo hermano (htrvt, semilla 42): https://huggingface.co/cyttic/hmt-htrvt-elastic1-s42
- Conjunto de datos: https://huggingface.co/datasets/cyttic/hhd-optionb-split
