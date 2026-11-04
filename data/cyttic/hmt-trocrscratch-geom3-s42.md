# cyttic/hmt-trocrscratch-geom3-s42

## Resumen

`cyttic/hmt-trocrscratch-geom3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el usuario `cyttic` en el marco de un estudio de aumento de datos denominado `htr-metrics-transfer`. El modelo parte de la arquitectura TrOCR (basada en transformer encoder-decoder) reentrenada desde cero (`trocrscratch`) y se ha entrenado con una configuración de *augmentation* concreta identificada como `geom3`, usando la semilla 42. No es un modelo de propósito general: es un artefacto experimental de investigación centrado en un único idioma, el hebreo (`he`).

El modelo resuelve la tarea de transcripción de texto manuscrito en hebreo mediante decodificación CTC (*Connectionist Temporal Classification*), según indican las etiquetas del repositorio. Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para experimentación académica más que para despliegue comercial a gran escala. Su relevancia es limitada fuera del contexto del estudio: no tiene descargas ni interacciones registradas y el pipeline no está declarado.

La información pública disponible es escasa: la model card se limita a indicar la configuración del experimento y un resultado de evaluación (CER 0,1213 y WER 0,5272 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje). No se documentan detalles de arquitectura interna, composición del dataset ni proceso de entrenamiento más allá de lo citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer) reentrenado desde cero; decodificacion CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en TrOCR (*Transformer-based Optical Character Recognition*), una arquitectura encoder-decoder de tipo transformer aplicada a reconocimiento de texto en imagen. El sufijo `trocrscratch` indica que se ha entrenado desde cero en lugar de partir de un checkpoint preentrenado. La decodificación empleada en la evaluación es CTC, según las etiquetas `htr` y `ctc` del repositorio, aunque la combinación de TrOCR con CTC no está detallada en la model card.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo (*dev writers*), con la variante de aumento de datos `geom3` y semilla 42. La evaluación se hizo sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje. No se especifican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF/DPO (poco probables en una tarea HTR). Tampoco se documentan innovaciones técnicas adicionales más allá del estudio de *augmentation* que da nombre al experimento.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes.
- Transcripción de líneas o regiones de texto mediante decodificación CTC.
- Entrenamiento específico con aumento geométrico (`geom3`), orientado a mejorar la robustez frente a variaciones de forma.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente hebreo.
- No se documentan modos especiales (thinking, visión general, audio).

## Casos de uso

- Digitalización de manuscritos hebreos en archivos históricos: el modelo puede transcribir imágenes de texto manuscrito a texto plano, adecuado por su entrenamiento específico en HTR hebreo.
- Investigación en aumento de datos para HTR: sirve como punto de comparación frente a otras variantes del estudio `htr-metrics-transfer` (distintas configuraciones de *augmentation* y semillas).
- Evaluación de métricas de transferencia: útil para reproducir los resultados CER/WER publicados y analizar el efecto del aumento geométrico.
- Prototipado académico de pipelines OCR/HTR en hebreo: modelo ligero (0,1 GB) que puede integrarse en entornos de experimentación con recursos limitados.
- Generación de datasets transcritos para entrenamiento posterior: las transcripciones pueden servir como pseudoetiquetas en corpus hebreos, con revisión humana dada la tasa de error.
- Benchmarking de decodificación CTC sin LM: permite medir el impacto de añadir un modelo de lenguaje en la etapa de decodificación.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Configuracion |
|---|---|---|---|
| CER | 0,1213 | HHD Option-B test | Greedy, sin LM |
| WER | 0,5272 | HHD Option-B test | Greedy, sin LM |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 22,4 M de parámetros; en la práctica, menos de 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en GTX 1050, RTX 2060, RTX 3060, RTX 4090 y similares; también en CPU para volúmenes moderados.
- Opciones de despliegue: al ser un modelo de visión-texto con pesos safetensors, puede servirse con Hugging Face Transformers; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a LLM y no a HTR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-geom3-s42 | 22,4 M | no disponible | he | MIT | Hugging Face |
| TrOCR (Microsoft, base) | ~334 M | no disponible | en | MIT | Hugging Face |
| Modelos HTR hebreos publicos | no disponible | no disponible | he | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de otros modelos HTR en hebreo en la información proporcionada. La comparación con TrOCR base es únicamente estructural (misma familia arquitectónica), no de rendimiento.

## Limitaciones y advertencias

- Modelo experimental de investigación: sin descargas ni validación comunitaria; no recomendado para producción sin evaluación propia.
- Tasa de error elevada en WER (0,5272) incluso con CER moderado (0,1213), lo que indica problemas con la segmentación de palabras en hebreo.
- Entrenado exclusivamente en hebreo; no generaliza a otros idiomas ni a otros alfabetos.
- Evaluado únicamente sobre el conjunto HHD Option-B; el rendimiento en otros dominios (manuscritos históricos, escritura moderna, distintas caligrafías) es desconocido.
- Riesgo de alucinación en la transcripción: la decodificación CTC sin modelo de lenguaje puede producir caracteres o palabras incorrectas en regiones ambiguas.
- Sesgos potenciales derivados del conjunto de entrenamiento (`hhd-optionb-split`), cuyos escritores y características no están documentados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se documentan requisitos de preprocesado de imagen ni el tokenizador utilizado, lo que dificulta la reproducción exacta.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratch-geom3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Repositorio del experimento: no disponible
- Paper o blog: no disponible
- Demo: no disponible
