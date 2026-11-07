# cyttic/hmt-trocrscratchline-none-s42

## Resumen

`cyttic/hmt-trocrscratchline-none-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por CyTIC. Se trata de un checkpoint experimental dentro de un estudio de aumento de datos denominado `htr-metrics-transfer`, en el que se entrena un modelo TrOCR desde cero (`trocrscratchline`) sin aplicar aumentos de datos (`none`) y con semilla 42. El objetivo del artefacto no es ofrecer un modelo de producción, sino servir como punto de referencia controlado para medir el efecto de distintas estrategias de *augmentation* sobre métricas de transferencia en HTR.

El modelo está especializado en hebreo (`he`) y emplea una arquitectura encoder-decoder de tipo TrOCR con decodificación CTC, según los tags del repositorio. Cuenta con 22.421.004 parámetros y un tamaño de repositorio de 0,1 GB, con pesos en formato safetensors. La licencia es MIT.

Su relevancia es acotada y de carácter investigador: los resultados publicados por el autor son modestos (CER 0,3909 y WER 0,9851 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje), lo que lo sitúa como una línea base dentro de un estudio comparativo más amplio, no como un modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer) con decodificacion CTC, segun tags del repositorio |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR (`trocrscratchline`), es decir, un transformer encoder-decoder orientado a reconocimiento de texto en imagen, entrenado desde cero en lugar de inicializado desde un checkpoint preentrenado. El repositorio lo etiqueta además con `ctc`, lo que indica que la decodificación se realiza mediante *Connectionist Temporal Classification*. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

Los datos de entrenamiento corresponden a `cyttic/hhd-optionb-split` (partición de entrenamiento) excluyendo los escritores del conjunto de desarrollo. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. La innovación metodológica del artefacto es la ausencia deliberada de aumentos de datos (`augmentation: none`), lo que lo convierte en el brazo de control del estudio `htr-metrics-transfer` frente a otras variantes con *augmentation*. Los detalles completos se remiten a `results.json` en el repositorio.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas de texto.
- Decodificación CTC con estrategia greedy.
- Modelo especializado de un solo idioma (`he`); no se documenta soporte multilingüe.
- No se documenta soporte de *tool calling*, *function calling* ni comportamiento agéntico.
- No se documenta modo de razonamiento (*thinking*), visión general, audio ni otras modalidades más allá de la transcripción de imagen a texto.
- Al estar entrenado desde cero y sin modelo de lenguaje, carece de corrección lingüística posterior a la decodificación.

## Casos de uso

- Línea base en experimentos de HTR: sirve como referencia de control (sin *augmentation*) para cuantificar la mejora que aportan otras variantes del estudio `htr-metrics-transfer` sobre el mismo conjunto de test.
- Investigación sobre transferencia de métricas: permite analizar cómo se comportan CER y WER en un modelo entrenado desde cero frente a modelos preentrenados, con un protocolo reproducible (semilla 42).
- Reproducibilidad de experimentos: al fijar semilla y configuración de *augmentation*, facilita la replicación de resultados en papers o tesis sobre reconocimiento de manuscrito hebreo.
- Evaluación de decodificación CTC: útil para estudiar el efecto de la decodificación greedy sin LM en idiomas con ortografía no latina, comparándolo con variantes con modelo de lenguaje.
- Prototipado interno de pipelines HTR en hebreo: puede integrarse en un *script* de inferencia para validar el formato de entrada y salida antes de adoptar un modelo con mejores métricas.
- Docencia y formación: ejemplo didáctico de arquitectura TrOCR entrenada desde cero con licencia MIT, adecuado para prácticas sobre *fine-tuning* y evaluación en HTR.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,3909 | HHD Option-B test, decodificacion greedy, sin LM |
| WER | 0,9851 | HHD Option-B test, decodificacion greedy, sin LM |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22,4 M de parámetros, el modelo en fp32 ocupa aproximadamente 90 MB de pesos, por lo que la VRAM necesaria es mínima (por debajo de 1 GB incluyendo activaciones para una imagen de línea).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante, RTX 20/30/40, e incluso en CPU para volúmenes pequeños).
- Opciones de despliegue: `transformers` con pesos safetensors; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a LLM y no aplican directamente a este modelo HTR).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-none-s42 | 22,4 M | no disponible | CER 0,3909 / WER 0,9851 (HHD Option-B) | MIT | Hugging Face |
| Otras variantes del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | no disponible | no disponible |
| TrOCR base (Microsoft) | no disponible en esta informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría. La comparación más directa es con las demás variantes de *augmentation* del mismo estudio, cuyos resultados no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en los datos publicados: CER de 0,3909 y WER de 0,9851 indican una tasa de error muy elevada, especialmente a nivel de palabra; no es adecuado para producción sin mejoras sustanciales.
- Entrenado desde cero y sin modelo de lenguaje: no hay corrección lingüística posterior, lo que agrava los errores en hebreo.
- Sesgos conocidos: no documentados; al entrenarse sobre un conjunto concreto de escritores (`hhd-optionb-split` sin los escritores de dev), puede generalizar mal a escritores, estilos o dominios no vistos.
- Riesgo de alucinación: en HTR se manifiesta como sustituciones o invenciones de caracteres; con WER cercano a 1, la fidelidad de la transcripción es muy limitada.
- Limitaciones de idioma: solo hebreo; no se documenta soporte para otros idiomas ni para texto impreso.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el modelo se distribuye como artefacto de investigación sin garantías de calidad.
- Caveat de producción: el autor lo presenta como parte de un estudio de *augmentation*; debe tratarse como checkpoint experimental y no como modelo final.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-none-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Detalles de resultados: `results.json` en el repositorio del modelo
- Estudio de referencia: `htr-metrics-transfer` (citado en la model card)
