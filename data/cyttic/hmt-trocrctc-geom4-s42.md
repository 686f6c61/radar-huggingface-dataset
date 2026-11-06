# cyttic/hmt-trocrctc-geom4-s42

## Resumen

`cyttic/hmt-trocrctc-geom4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de una variante de TrOCR con cabecera CTC, entrenada como parte de un estudio de aumentación de datos denominado `htr-metrics-transfer` (oleada 1). El modelo se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y se evalúa sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

El interés del modelo es fundamentalmente experimental: no es un modelo de propósito general, sino un punto de medida dentro de un estudio sistemático sobre cómo distintas estrategias de aumentación afectan a las métricas de HTR. La variante concreta corresponde a la aumentación `geom4` con semilla 42.

Con 87,3 millones de parámetros y un peso en disco de 0,3 GB, es un modelo compacto, especializado en hebreo manuscrito y liberado bajo licencia MIT, lo que facilita su reproducción y su uso como línea base en investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (encoder-decoder transformer adaptado a CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR (*Transformer-based Optical Character Recognition*), que combina un encoder de visión con un decoder transformer, en este caso con una cabecera de clasificación temporal conexionista (CTC) en lugar de la decodificación autorregresiva clásica. Esta elección permite decodificación greedy sin modelo de lenguaje, tal y como se indica en la model card.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo explícitamente a los escritores presentes en el conjunto de desarrollo para evitar fuga de información entre splits. La variante corresponde a la aumentación `geom4` con semilla 42, dentro de la oleada 1 del estudio `htr-metrics-transfer`. No se detallan en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo HTR).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo.
- Decodificación CTC greedy, sin modelo de lenguaje externo.
- Salida a nivel de carácter y de palabra, con métricas CER y WER reportadas.
- Entrenado específicamente para el dominio de escritura manual del corpus HHD Option-B.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo de razonamiento.

## Casos de uso

- Línea base reproducible en estudios de aumentación de datos: sirve como punto de comparación frente a otras variantes (`geom4`, otras semillas) del mismo estudio para aislar el efecto de la aumentación sobre CER y WER.
- Digitalización de manuscritos en hebreo: puede emplearse para transcribir documentos escaneados de escritores similares a los del corpus HHD Option-B, con CER de referencia de 0,0712.
- Evaluación de pipelines HTR: al ser un modelo pequeño (87 M de parámetros), permite iterar rápidamente sobre preprocesado, segmentación de líneas y decodificación sin grandes costes de cómputo.
- Investigación en decodificación CTC: su cabecera CTC sin LM facilita experimentos controlados sobre decodificación greedy frente a beam search o integración con modelos de lenguaje.
- Prototipado en entornos con recursos limitados: los 0,3 GB de pesos permiten desplegarlo en CPU o GPU de gama baja para pruebas de concepto.
- Reproducción académica: la licencia MIT y la semilla fija (42) permiten replicar exactamente los resultados publicados en `results.json`.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test HHD Option-B, decodificación greedy y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,0712 |
| WER | 0,3156 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo HTR especializado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (87 M de parámetros); en la práctica, unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), `torch` en CPU/GPU; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (poco habituales para modelos HTR).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-geom4-s42 | 87,3 M | no disponible | 0,0712 | MIT | Hugging Face |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | no disponible | no disponible |
| TrOCR base (Microsoft) | ~334 M | no disponible | no disponible (otro dominio) | MIT | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables en la misma tarea y corpus en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo reconoce hebreo manuscrito y está entrenado sobre un corpus concreto (HHD Option-B); el rendimiento fuera de ese dominio puede degradarse notablemente.
- WER de 0,3156: la tasa de error a nivel de palabra es elevada, por lo que la salida requiere revisión humana en aplicaciones de producción.
- Sin modelo de lenguaje: la decodificación greedy sin LM puede producir errores sistemáticos que un post-procesado lingüístico mitigaría.
- Riesgo de sesgo hacia los estilos de escritura presentes en el corpus de entrenamiento; escritores con caligrafías atípicas pueden obtener peores resultados.
- No se documentan evaluaciones de sesgo, robustez ante ruido o generalización a otros corpus.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de entrenamiento.
- Fecha de creación indicada como 2026-10-30, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-geom4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Estudio `htr-metrics-transfer`: no disponible como enlace directo en la información proporcionada
- `results.json`: referenciado en la model card, sin URL directa disponible
