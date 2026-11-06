# cyttic/hmt-trocrscratchreg-photo2-s42

## Resumen

`cyttic/hmt-trocrscratchreg-photo2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un checkpoint experimental dentro de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, y no de un modelo de propósito general. El identificador indica que la arquitectura de partida es TrOCR entrenado desde cero con regularización (`trocrscratchreg`), que la estrategia de aumento de datos aplicada es `photo2` y que la semilla de entrenamiento es 42.

El modelo resuelve la transcripción de imágenes de texto manuscrito a texto plano mediante un cabezal CTC (*Connectionist Temporal Classification*), tal como reflejan sus etiquetas. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y evaluado sobre el test HHD Option-B con decodificación voraz y sin modelo de lenguaje.

Su relevancia es acotada y fundamentalmente de investigación: con 22,4 millones de parámetros, un repositorio de 0,1 GB y cero descargas, es un artefacto reproducible para comparar el efecto de distintas políticas de aumento de datos en HTR, no una herramienta lista para producción. Los resultados publicados son modestos (CER 0,5456 y WER 1,1276), lo que sitúa al modelo en un régimen de error alto para tareas reales de transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR entrenado desde cero con regularizacion (encoder-decoder transformer para vision-texto, cabezal CTC) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR: un encoder de visión que procesa la imagen del manuscrito y un decoder transformer que genera la secuencia de caracteres, con un cabezal CTC para el alineamiento entre frames visuales y tokens de texto. La variante `scratchreg` indica entrenamiento desde cero (sin inicializar desde un checkpoint preentrenado de TrOCR) con algún esquema de regularización, aunque la model card no detalla ni la configuración de capas, ni el tamaño de las imágenes de entrada, ni la función de pérdida exacta.

El entrenamiento se realizó sobre el split de train de `cyttic/hhd-optionb-split` excluyendo los escritores presentes en dev, con la política de aumento `photo2` y semilla 42. No se especifica el número de tokens, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (poco probables en un modelo CTC de OCR). La evaluación publicada usa decodificación voraz sin modelo de lenguaje externo, lo que explica en parte los valores altos de CER y WER.

## Capacidades

- Transcripción de imágenes de texto manuscrito en hebreo a texto plano mediante decodificación CTC.
- Reconocimiento a nivel de carácter y de palabra sobre imágenes de líneas o regiones de manuscrito.
- Evaluación reproducible dentro del estudio `htr-metrics-transfer` (semilla y política de aumento fijadas).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del hebreo.
- No se documenta modo de razonamiento (*thinking*), visión general, audio ni otras modalidades.
- No se documenta integración con procesadores de texto o pipelines de OCR de extremo a extremo.

## Casos de uso

- Investigación comparativa de aumento de datos en HTR: el checkpoint sirve como punto de referencia fijo (semilla 42, aumento `photo2`) para medir el efecto de otras políticas de aumento sobre el CER y el WER en el test HHD Option-B.
- Reproducción de experimentos: al estar publicados los pesos en safetensors y la licencia MIT, un equipo puede volver a ejecutar la evaluación con decodificación voraz sin LM y contrastar los valores CER 0,5456 / WER 1,1276.
- Docencia y formación en OCR manuscrito: permite ilustrar el funcionamiento de un cabezal CTC sobre un encoder-decoder transformer con un modelo pequeño (22,4 M de parámetros) que cabe en cualquier GPU consumer.
- Prototipado interno de transcripción de manuscritos hebreos: útil como línea base antes de invertir en un modelo mayor o en un LM de rescoring, dado que el error actual es elevado para uso final.
- Análisis de sensibilidad a la inicialización: al ser entrenamiento desde cero (`scratch`), facilita estudiar el impacto de no partir de pesos preentrenados en tareas de HTR con pocos datos.
- Generación de datos sintéticos de evaluación: las transcripciones del modelo pueden emplearse para estudiar la propagación de errores en pipelines de OCR que incluyan postprocesado o corrección con LM.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,5456 |
| HHD Option-B test (greedy, sin LM) | WER | 1,1276 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos anteriores proceden de la model card y del `results.json` citado por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 90 MB para los 22,4 M de parámetros, más el coste de activaciones del encoder de visión (dependiente de la resolución de imagen, no documentada).
- VRAM estimada en fp16/bf16: en torno a 45 MB de pesos, más activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha el paralelismo de las GPU de gama alta.
- Cabe holgadamente en GPU consumer, incluidas GTX 1650 o superiores, y probablemente en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con pesos safetensors; no se han publicado variantes GGUF, por lo que llama.cpp u Ollama requerirían conversión manual. vLLM y TGI no están documentados para esta arquitectura CTC.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-photo2-s42 | 22,4 M | no disponible | MIT | Hugging Face, 0 descargas | Estudio de aumento, CER 0,5456 en HHD Option-B |
| TrOCR original (Microsoft) | 334 M (base) / 558 M (large) | no disponible | MIT | Hugging Face | Preentrenado en documentos impresos y manuscritos en inglés |
| Modelos HTR basados en CTC + LM (p. ej. Kraken, Calamari) | variable | no disponible | variable (AGPL/MIT) | Repositorios públicos | Suelen incluir modelo de lenguaje para rescoring, lo que reduce CER frente a decodificación voraz |

No se dispone de datos de benchmarks comparables publicados para este checkpoint frente a las alternativas citadas en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento bajo en la propia evaluación del autor: CER 0,5456 y WER 1,1276 implican que más de la mitad de los caracteres se transcriben incorrectamente en el test HHD Option-B.
- Evaluación sin modelo de lenguaje: los resultados no reflejan el rendimiento que se obtendría con rescoring, por lo que no son directamente comparables con sistemas HTR de producción.
- Idioma único: solo hebreo; no hay evidencia de generalización a otros alfabetos o idiomas.
- Sesgos de escritor: al excluir los escritores de dev del entrenamiento, el modelo puede comportarse peor con estilos de escritura no representados en el split de train.
- Riesgo de alucinación y de omisión de caracteres inherente a la decodificación CTC voraz, especialmente en secuencias largas.
- No se documentan la resolución de entrada, el preprocesado ni el vocabulario, lo que dificulta la reproducibilidad exacta fuera del pipeline del autor.
- Licencia MIT permite uso comercial, pero el estado experimental y el alto error desaconsejan su uso en producción sin un modelo de rescoring y validación adicional.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de mantenimiento posterior a la publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-photo2-s42
- Dataset de entrenamiento citado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados citados por el autor: `results.json` (referenciado en la model card, sin URL directa disponible)
- Paper de TrOCR (referencia arquitectónica): https://arxiv.org/abs/2109.10282
- Repositorio TrOCR de Microsoft: https://github.com/microsoft/unilm/tree/master/trocr
