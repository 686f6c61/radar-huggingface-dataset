# cyttic/hmt-trocrscratchstem-geom4-s42

## Resumen

El modelo `cyttic/hmt-trocrscratchstem-geom4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el autor cyttic en Hugging Face. Se trata de un checkpoint concreto dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrena un modelo de tipo TrOCR desde cero (*scratch*) con una configuración de aumento geométrico (`geom4`) y una semilla fija (42). El modelo resuelve la transcripción de imágenes de texto manuscrito a secuencia de caracteres, empleando una cabeza CTC y decodificación voraz (*greedy*) sin modelo de lenguaje externo.

Con 24.928.588 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a experimentación y a la evaluación de la transferencia de métricas de HTR bajo distintas políticas de aumento de datos. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split` (partición de entrenamiento excluyendo los escritores de desarrollo) y evaluado sobre el test HHD Option-B, donde reporta un CER de 0,0652 y un WER de 0,2997.

Su relevancia es acotada y experimental: no es un modelo de propósito general ni un asistente conversacional, sino un artefacto de investigación para reproducir y comparar resultados de HTR. La licencia MIT y el formato safetensors facilitan su reutilización, aunque la ausencia de pipeline declarado y de documentación adicional limita su adopción directa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder) entrenado desde cero, con cabeza CTC |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | he (hebreo) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, es decir, una arquitectura transformer con encoder de visión y decoder de texto, aunque en este caso se ha entrenado desde cero (*scratch*) en lugar de partir de un checkpoint preentrenado. La model card indica el uso de una cabeza CTC y decodificación voraz sin modelo de lenguaje, lo que sugiere una variante de reconocimiento secuencial con alineamiento CTC sobre las representaciones del encoder.

El entrenamiento se realizó sobre la partición de entrenamiento del conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo. La configuración experimental corresponde al aumento geométrico `geom4` con semilla 42, dentro del estudio `htr-metrics-transfer`. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO; los detalles adicionales se remiten a un fichero `results.json` no incluido en la información disponible.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo: transcribe imágenes de escritura manual a secuencia de caracteres.
- Decodificación CTC voraz (*greedy*) sin modelo de lenguaje externo, lo que simplifica el pipeline de inferencia.
- Entrenamiento desde cero (*scratch*), orientado a estudiar la transferencia de métricas bajo distintas políticas de aumento de datos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al hebreo según la etiqueta `language: he`.
- Capacidades especiales (thinking mode, visión general, audio): no disponibles; la visión se limita a la entrada de imágenes para HTR.

## Casos de uso

- Digitalización de manuscritos en hebreo: el modelo transcribe imágenes de texto manuscrito a texto plano, adecuado para archivos históricos o documentos escaneados en ese idioma.
- Reproducción de experimentos de HTR: sirve como checkpoint de referencia para replicar el estudio `htr-metrics-transfer` con la configuración `geom4` y semilla 42.
- Evaluación comparativa de aumentos de datos: al ser un artefacto de un estudio de *augmentation*, permite comparar CER y WER frente a otras configuraciones del mismo autor.
- Investigación en reconocimiento de escritura: útil para analizar el comportamiento de un TrOCR entrenado desde cero con cabeza CTC y decodificación sin LM.
- Prototipado de pipelines de OCR manuscrito: su tamaño compacto (0,1 GB) facilita pruebas rápidas en entornos con recursos limitados.
- Benchmarking de métricas de transferencia: permite medir la degradación o mejora de CER/WER al cambiar la política de aumento geométrico.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / configuracion |
|---|---|---|
| CER | 0,0652 | HHD Option-B test, greedy, sin LM |
| WER | 0,2997 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el modelo no es de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 24,9 M de parámetros y pesos en safetensors de 0,1 GB, la huella en memoria es muy reducida (del orden de cientos de MB incluyendo activaciones).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna es suficiente.
- ¿Cabe en GPU consumer? Sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: no disponible; al no declararse pipeline, se requeriría integración manual (por ejemplo, carga de safetensors con PyTorch/Transformers y preprocesado de imagen propio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-geom4-s42 | 24,9 M | no disponible | MIT | Hugging Face |
| TrOCR (variantes preentrenadas de Microsoft) | no disponible en la informacion | no disponible | no disponible | no disponible |
| Otros checkpoints del estudio `htr-metrics-transfer` | no disponible | no disponible | MIT (presumible) | Hugging Face (mismo autor) |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental de investigación: no es un modelo de propósito general ni un asistente; su uso está acotado a HTR en hebreo.
- Idioma restringido al hebreo según la etiqueta `language: he`; no se garantiza su funcionamiento en otros idiomas.
- Riesgo de alucinación y errores de transcripción: el CER de 0,0652 y el WER de 0,2997 implican una tasa de error no despreciable, especialmente a nivel de palabra.
- Sin modelo de lenguaje: la decodificación voraz puede producir secuencias menos fluidas o coherentes que enfoques con LM.
- Sesgos conocidos: no disponible; no se documentan análisis de sesgo.
- Restricciones de licencia: MIT permite uso comercial, pero no se documentan condiciones adicionales ni garantías.
- Caveat para producción: la ausencia de pipeline declarado y de documentación técnica detallada exige trabajo de integración y validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-geom4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Estudio `htr-metrics-transfer`: no disponible como enlace directo; se menciona en la model card junto con `results.json`
