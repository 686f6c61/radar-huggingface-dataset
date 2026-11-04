# cyttic/hmt-trocrscratch-geom2-s42

## Resumen

El modelo `cyttic/hmt-trocrscratch-geom2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el autor `cyttic` en el marco de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`. Se trata de un modelo basado en la arquitectura TrOCR (un transformer encoder-decoder para visión y texto) entrenado desde cero (`scratch`) con una configuración de aumento de datos geométrico (`geom2`) y una semilla concreta (`s42`).

El modelo está especializado en hebreo (`he`) y se ha entrenado sobre el conjunto de datos `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados reportados son un CER de 0,1390 y un WER de 0,5778.

Con 22,4 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a investigación en HTR, no a uso general. Su relevancia radica en su carácter experimental y reproducible dentro de un estudio comparativo de técnicas de aumento de datos, más que en su rendimiento absoluto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder para HTR) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he (hebreo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder diseñado para reconocimiento óptico de caracteres (OCR/HTR), que procesa imágenes de texto y genera la secuencia de caracteres correspondiente. En este caso, el entrenamiento se realizó desde cero (`trocrscratch`), sin partir de pesos preentrenados, lo que lo diferencia de las variantes TrOCR preentrenadas habitualmente disponibles.

El entrenamiento se llevó a cabo sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, con una configuración de aumento de datos geométrico (`geom2`) y semilla 42. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo. El autor indica que los detalles completos se encuentran en `results.json`, aunque dichos detalles no están disponibles en la información proporcionada. No se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Decodificación CTC/greedy (según los tags `htr` y `ctc`) para la generación de secuencias de caracteres.
- Especialización en una única lengua (`he`), sin capacidades multilingües declaradas.
- No se declaran capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se declaran capacidades de visión general más allá del reconocimiento de texto en imagen, ni audio, ni modo *thinking*.

## Casos de uso

- Digitalización de manuscritos hebreos: el modelo puede transcribir imágenes de texto manuscrito en hebreo a texto digital, adecuado para archivos históricos o documentos escaneados.
- Investigación en aumento de datos para HTR: sirve como punto de comparación reproducible (semilla 42, aumento `geom2`) en estudios sobre técnicas de *augmentation* en reconocimiento de escritura.
- Evaluación de métricas de transferencia: al formar parte del estudio `htr-metrics-transfer`, permite analizar cómo se transfieren las métricas entre configuraciones de entrenamiento.
- Reproducción de experimentos: su licencia MIT y su tamaño compacto (0,1 GB) facilitan la reproducción de resultados en entornos de investigación con recursos limitados.
- Prototipado de pipelines de OCR para hebreo: puede integrarse en flujos de preprocesado de imágenes y postprocesado de texto para validar enfoques antes de escalar a modelos mayores.
- Benchmarking de modelos HTR ligeros: con 22,4 M de parámetros, es útil como línea base de bajo coste computacional en comparaciones de arquitecturas TrOCR.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CER (test HHD Option-B, greedy, sin LM) | 0,1390 |
| WER (test HHD Option-B, greedy, sin LM) | 0,5778 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 22,4 M de parámetros, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente; también puede ejecutarse en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: no se especifican; al usar safetensors, es compatible con frameworks de inferencia basados en PyTorch/Transformers, aunque no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información suministrada.

## Limitaciones y advertencias

- Modelo experimental de investigación, no orientado a producción general.
- Entrenado únicamente en hebreo; no soporta otros idiomas.
- Evaluado sin modelo de lenguaje, lo que puede inflar el WER (0,5778) en comparación con sistemas que incorporan postprocesado lingüístico.
- Riesgo de alucinación y errores de transcripción inherentes a la decodificación greedy sin LM.
- No se dispone de información sobre sesgos del dataset de entrenamiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin descargas ni likes registrados, lo que sugiere ausencia de validación comunitaria.
- No se especifican limitaciones de contexto ni de resolución de imagen.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratch-geom2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Detalles de resultados: `results.json` (referenciado en la model card, no enlazado directamente)
