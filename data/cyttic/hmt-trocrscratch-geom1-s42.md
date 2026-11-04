# cyttic/hmt-trocrscratch-geom1-s42

## Resumen

`cyttic/hmt-trocrscratch-geom1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado desde cero con arquitectura TrOCR y decodificación CTC. Lo publica el usuario `cyttic` como parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se comparan distintas estrategias de aumentación sobre un mismo pipeline. Esta variante concreta corresponde a la aumentación `geom1` con semilla 42.

El modelo resuelve la transcripción de imágenes de texto manuscrito en hebreo (`he`), un idioma con relativamente pocos recursos en el ecosistema HTR open source. Con 22,4 millones de parámetros y un repositorio de apenas 0,1 GB, es un modelo compacto pensado más para experimentación académica y evaluación de técnicas de aumentación que para despliegue comercial a gran escala.

Su relevancia es doble: por un lado, aporta un punto de referencia reproducible (semilla fija, dataset y split documentados) para investigar transferencia de métricas en HTR; por otro, demuestra que es posible entrenar un TrOCR desde cero para hebreo con resultados moderados (CER 0,1703, WER 0,6718) en un presupuesto de cómputo reducido. La licencia MIT facilita su reutilización y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder Vision Transformer + decoder transformer) con cabeza CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la receta TrOCR: un encoder de visión tipo ViT que procesa la imagen de la línea de texto y un decoder transformer autorregresivo, aunque en esta variante la decodificación se realiza con CTC (tal y como indican los tags `htr` y `ctc`), lo que simplifica el alineamiento y acelera la inferencia al evitar la búsqueda autorregresiva completa. El modelo se entrena desde cero (`trocrscratch`), sin inicialización desde pesos preentrenados de TrOCR, lo que explica su tamaño contenido de 22,4 M de parámetros.

Los datos de entrenamiento provienen de `cyttic/hhd-optionb-split`, concretamente del split de *train* excluyendo los escritores de validación (*dev writers*), una separación por escritor que evita fuga de información entre train y test. La evaluación se realiza sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,1703 y WER 0,6718. La innovación metodológica del repo no está en la arquitectura sino en el protocolo experimental: la variante `geom1` aplica aumentación geométrica y se compara con otras variantes bajo la misma semilla (42), permitiendo medir el efecto de la aumentación sobre la transferencia de métricas HTR.

## Capacidades

- Transcripción de imágenes de texto manuscrito en hebreo a texto plano.
- Reconocimiento a nivel de línea (formato habitual en TrOCR/HTR).
- Decodificación CTC greedy, sin necesidad de modelo de lenguaje externo.
- Entrenamiento desde cero, lo que facilita el *fine-tuning* sobre otros alfabetos o dominios con presupuesto reducido.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al hebreo; no se documentan otros idiomas.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades más allá de OCR sobre imagen.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas segmentadas de documentos históricos o administrativos, sirviendo como base para pipelines de preservación digital con revisión humana posterior.
- Investigación en aumentación de datos para HTR: al estar publicado con semilla y variante de aumentación explícitas, permite reproducir experimentos y comparar el impacto de `geom1` frente a otras estrategias sobre el mismo split.
- *Baseline* académico en hebreo: útil como referencia de CER/WER (0,1703/0,6718) para nuevos modelos HTR en este idioma, dado que hay pocos recursos públicos comparables.
- *Fine-tuning* sobre dominios específicos: sus 22,4 M de parámetros permiten reentrenar o adaptar el modelo en una sola GPU consumer para manuscritos de un escritor o estilo concreto.
- Prototipado de lectores de formularios manuscritos: integrable en una etapa previa de OCR para extraer campos de documentos escaneados en hebreo antes de un sistema de extracción de entidades.
- Evaluación de transferencia de métricas: el repo forma parte del estudio `htr-metrics-transfer`, por lo que sirve para analizar cómo se transfieren las métricas entre variantes de aumentación y semillas.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1703 | HHD Option-B test, greedy, sin LM |
| WER | 0,6718 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,4 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; una RTX 3060, RTX 4090 o incluso una iGPU son suficientes. Para *fine-tuning* basta una GPU con 8-16 GB.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), ONNX Runtime para producción en CPU, y cualquier framework que soporte ViT+CTC. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (orientados a LLM, no a HTR).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por línea en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (hebreo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-geom1-s42 | 22,4 M | no disponible | 0,1703 | MIT | HuggingFace |
| TrOCR base (Microsoft) | ~334 M | no disponible | no disponible | MIT | HuggingFace |
| TrOCR large (Microsoft) | ~558 M | no disponible | no disponible | MIT | HuggingFace |

La comparación directa con TrOCR base/large es limitada porque estos están preentrenados en inglés y no reportan CER en hebreo; el modelo de `cyttic` es sustancialmente más pequeño (22,4 M frente a 334-558 M) y está especializado en un único idioma y dataset. No se dispone de otros modelos HTR públicos en hebreo con métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- El WER de 0,6718 es alto: aunque el CER es moderado, la tasa de errores a nivel de palabra indica que la salida requiere revisión humana en la mayoría de aplicaciones.
- Entrenado exclusivamente en hebreo; no generaliza a otros alfabetos sin reentrenamiento.
- Entrenado desde cero y sin modelo de lenguaje, por lo que no corrige errores contextuales ni aprovecha conocimiento lingüístico.
- Riesgo de alucinación en decodificación CTC: puede producir caracteres espurios en imágenes ruidosas o con segmentación deficiente.
- Sesgos derivados del dataset `cyttic/hhd-optionb-split`: el rendimiento puede degradarse en escritores, estilos o calidades de escaneo no representados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El modelo está pensado como artefacto de investigación (estudio de aumentación); no se documentan procesos de validación adicionales ni *cards* de evaluación más allá de `results.json`.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratch-geom1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Estudio de referencia: `htr-metrics-transfer` (resultados en `results.json` del repositorio)
- TrOCR (paper original de Microsoft): https://arxiv.org/abs/2109.10282
