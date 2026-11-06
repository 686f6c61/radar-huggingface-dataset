# cyttic/hmt-trocrscratch-stroke1-s42

## Resumen

`cyttic/hmt-trocrscratch-stroke1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el grupo cyttic. Se trata de un checkpoint experimental perteneciente a un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se entrena un modelo TrOCR desde cero (`trocrscratch`) con una estrategia de aumentación concreta (`stroke1`) y una semilla fija (42). El modelo está especializado en hebreo (`he`) y emplea una cabeza de decodificación CTC.

El modelo resuelve la transcripción automática de imágenes de texto manuscrito a texto digital, un problema clásico de visión por computador aplicada a documentos históricos y archivos. Con 22.421.004 parámetros totales y un tamaño de repositorio de aproximadamente 0,1 GB, es un modelo compacto, orientado a experimentación más que a despliegue en producción. Su relevancia es fundamentalmente metodológica: sirve para estudiar cómo la aumentación de datos afecta a las métricas de transferencia en HTR.

La información pública disponible es escasa: no se especifican la longitud de contexto (no aplica en el sentido habitual de LLM, al ser un modelo imagen-a-texto), los tipos de cuantización soportados ni los detalles completos de la arquitectura más allá de la etiqueta `trocrscratch` y la decodificación CTC. La licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR entrenado desde cero (`trocrscratch`) con decodificación CTC |
| Parámetros totales | 22.421.004 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo imagen-a-texto, no aplica ventana de contexto de LLM) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR (*Transformer-based Optical Character Recognition*), un enfoque encoder-decoder basado en transformer para reconocimiento de texto en imágenes. En este caso se ha entrenado desde cero, sin partir de un checkpoint preentrenado de TrOCR, y se emplea una cabeza de decodificación CTC (etiqueta `ctc` en los metadatos), lo que implica un alineamiento carácter a carácter entre la secuencia visual y la transcripción.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, utilizando la partición de entrenamiento menos los escritores reservados para desarrollo (*dev writers*). La variante corresponde a la aumentación `stroke1` con semilla 42, dentro del estudio `htr-metrics-transfer`. No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni sobre el uso de técnicas de refinamiento como RLHF o DPO (no aplicables en un modelo HTR). Tampoco se documentan innovaciones técnicas adicionales más allá de la estrategia de aumentación estudiada.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de documentos.
- Decodificación CTC con alineamiento carácter a carácter.
- Entrenamiento desde cero, lo que permite estudiar el efecto de la aumentación sin sesgo de un preentrenamiento previo.
- No dispone de soporte de *tool calling* ni de *function calling*.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al hebreo (`he`).
- No incluye modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la lectura de imágenes de texto.

## Casos de uso

- Transcripción de manuscritos hebreos en archivos históricos: el modelo puede procesar imágenes de documentos y generar la transcripción carácter a carácter mediante CTC, adecuado para digitalización de fondos documentales.
- Investigación en aumentación de datos para HTR: sirve como referencia experimental para comparar el efecto de distintas estrategias de aumentación (`stroke1` frente a otras) sobre las métricas CER y WER.
- Reproducibilidad de estudios académicos: al fijar la semilla 42 y publicar los pesos, permite replicar los resultados del estudio `htr-metrics-transfer`.
- Evaluación de modelos HTR en hebreo: útil como línea base para comparar con otros sistemas de reconocimiento de escritura manuscrita en ese idioma.
- Prototipado de pipelines de digitalización: con 22,4 M de parámetros y un repositorio de 0,1 GB, puede integrarse en entornos de laboratorio con recursos limitados.
- Docencia y formación: modelo compacto para ilustrar el funcionamiento de arquitecturas encoder-decoder con CTC en tareas de visión y texto.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al conjunto HHD Option-B test, con decodificación greedy y sin modelo de lenguaje:

| Métrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,3607 |
| WER (Word Error Rate) | 0,9528 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los detalles adicionales se remiten a `results.json`, no incluido en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 22,4 M de parámetros, la huella en memoria es reducida (del orden de decenas de MB en precisión completa, y menos aún en cuantización de 8 o 4 bits).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: no disponible; al ser safetensors compatible con la librería Transformers, podría cargarse con dicha librería, pero no se confirma.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un checkpoint experimental de un estudio concreto, sin datos de comparación publicados frente a otros sistemas HTR en hebreo.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratch-stroke1-s42 | 22.421.004 | no disponible | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El CER de 0,3607 y el WER de 0,9528 indican un rendimiento bajo en el conjunto de test; el WER cercano a 1,0 sugiere que la mayoría de palabras no se transcriben correctamente.
- El modelo está entrenado exclusivamente en hebreo; no se espera un funcionamiento adecuado en otros idiomas.
- Al ser un checkpoint experimental de un estudio de aumentación, no está validado para producción.
- Riesgo de alucinación y de errores sistemáticos en la transcripción, inherente a los modelos CTC con métricas de error elevadas.
- No se documentan sesgos específicos, pero el entrenamiento sobre un conjunto limitado de escritores puede introducir sesgo hacia esos estilos caligráficos.
- La licencia MIT permite uso comercial, pero la falta de validación y el bajo rendimiento desaconsejan ese uso sin una evaluación previa.
- No se especifican limitaciones de contexto ni de longitud de secuencia de entrada.

## Enlaces

- [Hugging Face: cyttic/hmt-trocrscratch-stroke1-s42](https://huggingface.co/cyttic/hmt-trocrscratch-stroke1-s42)
- Dataset de entrenamiento: `cyttic/hhd-optionb-split` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Resultados detallados: `results.json` (referenciado en la model card; no se proporciona URL directa)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
