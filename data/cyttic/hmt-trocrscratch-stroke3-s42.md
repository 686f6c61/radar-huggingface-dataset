# cyttic/hmt-trocrscratch-stroke3-s42

## Resumen

El modelo `cyttic/hmt-trocrscratch-stroke3-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de una variante de TrOCR entrenada desde cero (*scratch*) con un esquema de aumento de datos denominado `stroke3` y semilla 42, dentro de un estudio más amplio sobre transferencia de métricas HTR (`htr-metrics-transfer`). El modelo está especializado en hebreo (`he`) y utiliza una cabeza de clasificación CTC.

Con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo de escala reducida pensado para experimentación y evaluación controlada más que para despliegue en producción. Su valor principal es servir como punto de comparación reproducible dentro de un estudio de ablación sobre técnicas de aumento de datos en HTR, con métricas documentadas (CER 0,3561 y WER 0,9556 sobre el conjunto de test HHD Option-B).

La relevancia de esta ficha radica en que se trata de un artefacto de investigación con licencia MIT, lo que permite reutilizarlo y reproducir el experimento, aunque sus métricas actuales indican un rendimiento limitado para aplicaciones reales. No se han publicado datos sobre arquitectura interna detallada, composición del dataset de entrenamiento ni proceso de alineación más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer) entrenado desde cero; cabeza CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder orientado a reconocimiento de texto en imagen, aunque en este caso se ha entrenado desde cero (`trocrscratch`) en lugar de partir de un checkpoint preentrenado. La decodificación se realiza con búsqueda voraz (*greedy*) y sin modelo de lenguaje externo, y la salida se alinea mediante CTC. El estudio al que pertenece se centra en el efecto del aumento de datos `stroke3` sobre la transferencia de métricas HTR.

El entrenamiento se realizó sobre el split `cyttic/hhd-optionb-split`, concretamente sobre la partición de entrenamiento excluyendo los escritores de desarrollo (*dev writers*), y la evaluación se hizo sobre el conjunto de test HHD Option-B. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La semilla utilizada es 42, lo que sugiere un diseño experimental reproducible.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Decodificación CTC con búsqueda voraz, sin modelo de lenguaje auxiliar.
- Entrenamiento desde cero, sin dependencia de pesos preentrenados de TrOCR.
- Aumento de datos `stroke3` aplicado durante el entrenamiento (variante experimental).
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del hebreo.
- No se documentan capacidades de visión general, audio ni modo de razonamiento (*thinking*).

## Casos de uso

- Reproducción de experimentos de HTR: el modelo sirve como punto de partida para replicar el estudio `htr-metrics-transfer` con la semilla 42 y el aumento `stroke3`, permitiendo comparar CER y WER frente a otras variantes.
- Ablación de aumento de datos: al ser una variante concreta de un conjunto de experimentos, se puede usar para aislar el efecto de `stroke3` frente a otras técnicas de aumento en el mismo corpus.
- Evaluación de pipelines CTC: útil para probar infraestructura de decodificación CTC y cálculo de métricas CER/WER sin depender de modelos de gran tamaño.
- Investigación en reconocimiento de hebreo manuscrito: sirve como baseline ligero (22,4 M de parámetros) para comparar con modelos HTR más grandes o preentrenados.
- Docencia y prototipado: su tamaño reducido y licencia MIT facilitan su uso en entornos académicos para ilustrar el flujo completo de entrenamiento y evaluación HTR.
- Integración en estudios de transferencia de métricas: el modelo está pensado para alimentar análisis sobre cómo se transfieren las métricas entre dominios y configuraciones de aumento.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| CER | 0,3561 | HHD Option-B test |
| WER | 0,9556 | HHD Option-B test |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,4 M de parámetros), por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3060, RTX 4090 o incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo y bibliotecas de Hugging Face `transformers`; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-stroke3-s42 | 22,4 M | no disponible | 0,3561 | MIT | Hugging Face |
| TrOCR base (Microsoft) | no disponible en la información | no disponible | no disponible | MIT | Hugging Face |
| Otros modelos del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría; la información proporcionada solo cubre este checkpoint.

## Limitaciones y advertencias

- Rendimiento limitado: un CER de 0,3561 y un WER de 0,9556 indican que el modelo comete errores sustanciales en reconocimiento, por lo que no es apto para producción sin mejoras.
- Especialización restringida: solo se documenta hebreo; no hay evidencia de generalización a otros idiomas o alfabetos.
- Sesgos: no se documentan análisis de sesgo, pero al entrenarse sobre un corpus con escritores concretos puede presentar sesgo hacia esos estilos de escritura.
- Riesgo de alucinación: en HTR, el modelo puede generar caracteres o palabras plausibles pero incorrectos, especialmente con decodificación voraz y sin modelo de lenguaje.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo se distribuye como artefacto de investigación sin garantías.
- Caveat para producción: la ausencia de modelo de lenguaje y el uso de greedy decoding limitan la corrección de errores; se recomienda validar exhaustivamente antes de cualquier despliegue.
- Falta de documentación: no se detallan la arquitectura exacta, el dataset completo ni el proceso de entrenamiento, lo que dificulta la auditoría.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratch-stroke3-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Estudio `htr-metrics-transfer`: no disponible como enlace directo en la información proporcionada
- Resultados detallados (`results.json`): referenciado en la model card, sin URL directa disponible
