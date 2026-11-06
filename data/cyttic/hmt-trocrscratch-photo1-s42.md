# cyttic/hmt-trocrscratch-photo1-s42

## Resumen

`cyttic/hmt-trocrscratch-photo1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el grupo CYTTIC. Se trata de un checkpoint de TrOCR entrenado desde cero (*scratch*) sobre un conjunto de datos de escritura manuscrita hebrea, dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`. La variante concreta corresponde a la configuración de aumento `photo1` con semilla 42.

El modelo resuelve la transcripción automática de imágenes de texto manuscrito a secuencia de caracteres, empleando un esquema CTC (*Connectionist Temporal Classification*) con decodificación voraz (*greedy*) y sin modelo de lenguaje externo. Con 22,4 millones de parámetros, es un modelo compacto orientado a experimentación académica más que a despliegue comercial a gran escala.

Su relevancia es acotada: se publica como artefacto reproducible de un estudio comparativo de técnicas de aumento de datos y su impacto en métricas de transferencia. El rendimiento reportado (CER 0,3893 y WER 0,9828 sobre el conjunto de test HHD Option-B) indica una calidad de transcripción limitada, propia de un experimento de ablación y no de un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder para HTR), entrenado desde cero con CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un transformer encoder-decoder pensado para reconocimiento óptico de texto manuscrito. En esta variante se entrena desde cero (*scratch*) y se emplea un cabezal CTC para la alineación entre la imagen de entrada y la secuencia de caracteres de salida, con decodificación voraz en inferencia y sin modelo de lenguaje que corrija o reordene las hipótesis. El checkpoint forma parte de un estudio de aumento de datos (`photo1`), por lo que la pipeline de entrenamiento incorpora transformaciones fotográficas sobre las imágenes originales.

El conjunto de entrenamiento es `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y la evaluación se realiza sobre el test HHD Option-B. No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO (poco probables en una tarea de transcripción). La innovación técnica destacable es el propio diseño experimental: medir la transferencia de métricas bajo distintas aumentaciones y semillas.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes, con salida de secuencia de caracteres mediante CTC.
- Transcripción línea a línea (el modelo no está diseñado para detección ni segmentación de regiones).
- Decodificación voraz sin modelo de lenguaje, lo que evita sesgos de corrección léxica pero también renuncia a mejoras de fluidez.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multimodales más allá de la entrada de imagen para transcripción.
- Cobertura monolingüe: únicamente hebreo.

## Casos de uso

- Investigación en HTR: servir como punto de comparación reproducible (semilla 42, aumento `photo1`) frente a otras configuraciones del estudio `htr-metrics-transfer`.
- Ablación de aumento de datos: evaluar cómo transformaciones fotográficas afectan al CER/WER en escritura manuscrita hebrea.
- Digitalización asistida de manuscritos hebreos con revisión humana obligatoria, dado el CER de 0,3893 reportado.
- Generación de transcripciones preliminares para etiquetado activo: usar la salida del modelo como borrador que anotadores corrigen, reduciendo el coste de anotación manual.
- Reproducibilidad académica: validar resultados de un artículo o tesis que dependa de este checkpoint concreto.
- Baseline en pipelines de investigación: punto de partida de bajo coste computacional (22,4 M de parámetros) para experimentar con arquitecturas o decodificadores alternativos.
- No recomendado para atención al cliente, generación de código ni tareas de agentes: el modelo es exclusivamente de transcripción de imagen a texto.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test HHD Option-B, decodificación voraz y sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,3893 |
| WER | 0,9828 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El WER cercano a 1,0 sugiere que la métrica a nivel de palabra es poco informativa en este dominio (posiblemente por segmentación o vocabulario), por lo que el CER es la referencia principal.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 22,4 M de parámetros; cientos de MB en FP16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobrada; también CPU para volúmenes moderados.
- Cabe holgadamente en GPU consumer e incluso en entornos sin GPU dedicada.
- Opciones de despliegue: PyTorch/Hugging Face Transformers con los pesos safetensors; no se documentan integraciones con vLLM, llama.cpp u Ollama (arquitectura encoder-decoder de visión, no LLM).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-photo1-s42 | 22,4 M | no disponible | MIT | Hugging Face | Estudio de aumento, hebreo, CER 0,3893 |
| TrOCR base (Microsoft) | ~334 M | no disponible | MIT | Hugging Face | Entrenado en inglés impreso/manuscrito |
| TrOCR large (Microsoft) | ~558 M | no disponible | MIT | Hugging Face | Mayor capacidad, inglés |
| Otros checkpoints del estudio cyttic | no disponible | no disponible | MIT | Hugging Face | Variantes de aumento y semilla |

La comparación directa con TrOCR base/large no es equivalente en idioma ni en datos de entrenamiento; se incluye como referencia de arquitectura. No se dispone de resultados de benchmarks de esos modelos en la información proporcionada para comparar CER/WER de forma justa.

## Limitaciones y advertencias

- Calidad de transcripción limitada: CER de 0,3893 implica aproximadamente un 39 % de errores a nivel de carácter en el test reportado.
- WER de 0,9828: la métrica a nivel de palabra es prácticamente inutilizable como indicador de calidad práctica.
- Monolingüe: solo hebreo; no se ha validado en otros idiomas ni en escritura impresa.
- Sin modelo de lenguaje: no corrige errores léxicos ni contextuales en la salida.
- Sesgos: al entrenarse sobre un conjunto concreto de escritores (`hhd-optionb-split`), puede generalizar mal a estilos, caligrafías o condiciones de captura distintas.
- Riesgo de alucinación: en HTR se manifiesta como sustituciones, omisiones e inserciones de caracteres, especialmente en imágenes ruidosas o de baja resolución.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; la calidad reportada desaconseja su uso en producción sin revisión humana.
- Artefacto de investigación: pensado para reproducibilidad de un estudio, no como producto final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratch-photo1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Resultados detallados: `results.json` en el repositorio del modelo
- Organización: https://huggingface.co/cyttic
