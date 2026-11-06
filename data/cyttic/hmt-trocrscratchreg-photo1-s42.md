# cyttic/hmt-trocrscratchreg-photo1-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchreg-photo1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el usuario cyttic, publicado bajo licencia MIT. Se trata de un modelo de aproximadamente 22,4 millones de parámetros, derivado de la familia TrOCR (arquitectura transformer encoder-decoder para OCR) y entrenado con un objetivo de decodificación CTC. Su propósito es transcribir texto manuscrito en hebreo a texto digital.

El modelo forma parte de un estudio de aumento de datos (*data augmentation*) denominado `htr-metrics-transfer`, en el que se evalúa el impacto de distintas técnicas de aumento sobre el rendimiento en HTR. En concreto, esta variante corresponde a la configuración `trocrscratchreg` con el aumento `photo1` y semilla 42, entrenada sobre el conjunto `cyttic/hhd-optionb-split` (partición de entrenamiento excluyendo los escritores de desarrollo). Los resultados reportados por el autor son un CER de 0,5458 y un WER de 1,1350 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

La relevancia de este modelo es acotada y experimental: no es un modelo de propósito general ni un producto listo para producción, sino un artefacto de investigación que documenta una configuración concreta dentro de un estudio comparativo. Resulta útil para investigadores que trabajen en HTR de hebreo, en técnicas de aumento de datos o en el análisis de métricas de transferencia entre dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (TrOCR, variante `trocrscratchreg`) con cabeza CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder concebido para reconocimiento óptico de caracteres y texto manuscrito. La variante `trocrscratchreg` sugiere un entrenamiento desde cero (*scratch*) del componente de reconocimiento, con regularización, y una cabeza de decodificación CTC (Connectionist Temporal Classification), coherente con la etiqueta `ctc` de la model card. El tamaño de 22,4 millones de parámetros indica una configuración compacta, muy por debajo de los modelos TrOCR de referencia (que suelen superar los 300 millones de parámetros).

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la técnica de aumento `photo1` y semilla 42. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO (poco habituales en HTR). La innovación metodológica del trabajo es el estudio sistemático del efecto del aumento de datos sobre las métricas de transferencia, más que una innovación arquitectónica propia.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Decodificación CTC con alineamiento carácter a carácter.
- Entrenamiento y evaluación orientados a métricas CER y WER.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del hebreo.
- No se documentan modos especiales como *thinking mode*, visión general, audio u otros.

## Casos de uso

- Investigación en HTR de hebreo: el modelo sirve como punto de comparación dentro del estudio `htr-metrics-transfer` para medir el efecto del aumento `photo1` frente a otras configuraciones.
- Digitalización de archivos manuscritos hebreos: puede emplearse para transcribir documentos históricos o administrativos, siempre que se acepte el nivel de error reportado (CER 0,5458).
- Análisis de robustez ante variaciones fotográficas: al haberse entrenado con el aumento `photo1`, es adecuado para estudiar el comportamiento frente a condiciones de captura variables.
- Reproducibilidad de experimentos: la semilla fija (42) y la configuración documentada permiten replicar resultados y comparar con otras variantes del mismo autor.
- Evaluación de métricas de transferencia: útil para investigadores que analicen cómo se transfieren las métricas entre particiones de escritores (dev vs. test).
- Prototipado académico: por su tamaño reducido (22,4 M de parámetros, repo de 0,1 GB), puede desplegarse en entornos de laboratorio con recursos limitados para pruebas preliminares.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Configuracion |
|---|---|---|---|
| CER | 0,5458 | HHD Option-B test | Greedy, sin LM |
| WER | 1,1350 | HHD Option-B test | Greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,4 M de parámetros, ~90 MB en fp32); no disponible un dato oficial del autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere hardware de数据中心.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 o superior), e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de visión con pesos safetensors, requeriría un *pipeline* de inferencia propio basado en la librería de transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-photo1-s42 | 22,4 M | no disponible | MIT | Hugging Face |
| cyttic/trocr-freefonts-s42 | no disponible | no disponible | no disponible | Hugging Face |
| TrOCR (Microsoft, referencia) | ~334 M (base) | no disponible | MIT | Hugging Face |

La comparación con TrOCR de referencia es orientativa: el modelo de cyttic es aproximadamente 15 veces más pequeño, lo que explica en parte su mayor tasa de error. No se dispone de datos de benchmarks comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El CER de 0,5458 y el WER de 1,1350 indican un rendimiento bajo para uso en producción; más de la mitad de los caracteres se transcriben incorrectamente en el conjunto de test.
- El modelo está especializado exclusivamente en hebreo; no se documenta soporte para otros idiomas.
- No se han publicado análisis de sesgos; al entrenarse sobre un conjunto limitado de escritores, puede generalizar mal a estilos caligráficos no representados.
- Riesgo de alucinación y de errores sistemáticos en la decodificación CTC, especialmente en secuencias largas o con caracteres ambiguos.
- La licencia MIT permite uso comercial, pero el rendimiento reportado hace desaconsejable su empleo en aplicaciones reales sin una evaluación adicional.
- Es un artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se documentan limitaciones de contexto ni de longitud de secuencia de entrada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/cyttic/hmt-trocrscratchreg-photo1-s42)
- [Modelo relacionado: cyttic/trocr-freefonts-s42](https://huggingface.co/cyttic/trocr-freefonts-s42)
