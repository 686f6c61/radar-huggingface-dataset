# cyttic/hmt-trocrscratch-elastic4-s42

## Resumen

`cyttic/hmt-trocrscratch-elastic4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por cyttic en el marco de un estudio de aumentación de datos denominado `htr-metrics-transfer`. El modelo parte de la arquitectura TrOCR adaptada a un esquema de entrenamiento desde cero (*scratch*) y emplea decodificación CTC, con un total de 22.421.004 parámetros y un peso en disco de aproximadamente 0,1 GB en formato safetensors.

El modelo está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados reportados son CER 0,2013 y WER 0,7041. Se trata, por tanto, de un artefacto de investigación centrado en medir el efecto de una aumentación concreta (`elastic4`) sobre la transferencia de métricas HTR, no de un modelo listo para producción.

Su relevancia es acotada: sirve como punto de comparación reproducible (semilla 42) dentro de una familia de experimentos de aumentación, y su interés principal reside en la metodología y en las métricas publicadas más que en el rendimiento absoluto. El modelo está especializado en hebreo (`he`) y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (encoder-decoder transformer para reconocimiento de texto) entrenado desde cero, con decodificacion CTC |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, es decir, un transformer encoder-decoder orientado a reconocimiento de texto en imagen, pero en esta variante se ha entrenado desde cero (`trocrscratch`) en lugar de partir de un checkpoint preentrenado. La decodificación se realiza mediante CTC en modo greedy, sin modelo de lenguaje externo que corrija o rescore las hipótesis. El checkpoint corresponde a la configuración de aumentación `elastic4` con semilla 42 dentro del estudio `htr-metrics-transfer`.

Los datos de entrenamiento provienen de `cyttic/hhd-optionb-split`, concretamente del split de train menos los escritores reservados para desarrollo, y la evaluación se hace sobre el test HHD Option-B. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en una tarea HTR). La innovación metodológica destacable es el propio diseño experimental: aislamiento de una única variable de aumentación (`elastic4`) y una semilla fija para medir su efecto sobre CER y WER con transferencia de métricas entre configuraciones.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de línea o región de texto.
- Decodificación CTC greedy sin modelo de lenguaje, lo que simplifica el pipeline pero limita la corrección contextual.
- Salida de transcripción a nivel de carácter y palabra, apta para el cálculo directo de CER y WER.
- Entrenamiento específico sobre un split controlado por escritores, lo que permite evaluar generalización a escritores no vistos.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step.
- No se documenta capacidad multimodal más allá de la entrada de imagen propia de la tarea HTR.
- No se documentan capacidades multilingües: el modelo está etiquetado únicamente para hebreo.

## Casos de uso

- Investigación reproducible en aumentación de datos HTR: el checkpoint sirve como referencia fija (semilla 42, aumentación `elastic4`) para comparar el efecto de distintas políticas de aumentación sobre CER y WER en hebreo manuscrito.
- Transcripción de manuscritos hebreos digitalizados en archivos y bibliotecas: el modelo puede procesar imágenes de línea y producir transcripciones para indexación posterior, aceptando un CER de referencia en torno a 0,20.
- Generación de transcripciones preliminares para revisión humana: dado el WER reportado (0,7041), el uso realista es como primera pasada que un revisor corrige, no como salida final automática.
- Evaluación de pipelines CTC sin LM: permite medir el suelo de rendimiento de un decodificador CTC puro antes de añadir un modelo de lenguaje o un corrector ortográfico.
- Baseline en experimentos de transferencia de métricas: útil para estudiar cómo se trasladan las métricas entre configuraciones de entrenamiento y test dentro de la misma familia de datasets.
- Docencia y prototipado en HTR: su tamaño reducido (22,4 M de parámetros, 0,1 GB) permite ejecutarlo y modificarlo en entornos con recursos limitados para experimentos académicos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,2013 | Test HHD Option-B, decodificacion greedy, sin LM |
| WER | 0,7041 | Test HHD Option-B, decodificacion greedy, sin LM |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni desgloses adicionales por escritor o por subconjunto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,4 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB y en fp16 unos 45 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; tarjetas como RTX 3060, RTX 4090 o T4 no suponen ninguna restricción. Para lotes grandes de imágenes conviene priorizar memoria para las activaciones del encoder visual.
- Cabe en GPU consumer: sí, en prácticamente cualquier modelo actual e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: al ser un checkpoint safetensors de TrOCR, puede servirse con PyTorch/Hugging Face Transformers, TorchServe o un servidor FastAPI propio; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son adecuadas para esta arquitectura encoder-decoder visual.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependerán del tamaño de las imágenes de entrada y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratch-elastic4-s42 | 22,4 M | no disponible | CER 0,2013 / WER 0,7041 en HHD Option-B | MIT | Hugging Face |
| TrOCR base (Microsoft) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Hugging Face |
| Otros checkpoints de la familia `cyttic/hmt-*` | no disponible | no disponible | no disponible | presumiblemente MIT | Hugging Face |

No se dispone de datos verificados de modelos comparables en la informacion proporcionada; la comparativa con TrOCR base y con el resto de la familia experimental queda pendiente de consultar sus respectivas model cards.

## Limitaciones y advertencias

- El WER de 0,7041 es elevado para uso productivo directo; el modelo requiere revisión humana o un postprocesado con modelo de lenguaje.
- Entrenado y evaluado únicamente en hebreo manuscrito sobre el dataset `hhd-optionb-split`; no hay evidencia de generalización a otros idiomas, dominios o estilos de escritura.
- Decodificación CTC greedy sin LM: no explota contexto lingüístico, lo que penaliza especialmente en palabras largas o ambiguas.
- Riesgo de alucinación a nivel de carácter: al ser un modelo discriminativo de transcripción, puede producir sustituciones e inserciones sistemáticas en imágenes ruidosas o con escritura atípica.
- No se documentan análisis de sesgos por escritor, género o procedencia del manuscrito; el split por escritores mitiga parcialmente la fuga, pero no sustituye a una evaluación de equidad.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de copyright.
- Artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.
- No se documentan requisitos de preprocesado de imagen (resolución, normalización, segmentación de líneas), lo que puede provocar degradación silenciosa si se usa con un pipeline distinto al del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratch-elastic4-s42
- Dataset de entrenamiento y evaluacion citado: `cyttic/hhd-optionb-split` (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
