# cyttic/hmt-trocrscratchreg-stroke2-s42

## Resumen

`cyttic/hmt-trocrscratchreg-stroke2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el usuario `cyttic` y publicado en Hugging Face. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalúa cómo distintas estrategias de aumento afectan a las métricas de transcripción. En concreto, esta variante corresponde al modelo base `trocrscratchreg` con la aumentación `stroke2` y la semilla 42.

El modelo se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores (*writers*) del split de desarrollo, y se evalúa sobre el test de HHD Option-B con decodificación greedy y sin modelo de lenguaje. Se trata de un modelo pequeño, de 22,4 millones de parámetros y 0,1 GB de peso, orientado específicamente al hebreo (`he`), lo que lo sitúa en un nicho muy concreto: la transcripción de manuscritos en hebreo dentro de un contexto de investigación experimental.

Su relevancia es limitada fuera del ámbito de la investigación en HTR: no es un modelo de propósito general, no dispone de pipeline declarado y sus métricas de error son elevadas (CER 0,5153 y WER 1,0909), lo que refleja que se trata de un artefacto de experimentación más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `trocrscratchreg`, variante de TrOCR entrenada desde cero) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `trocrscratchreg`, que sugiere una variante de TrOCR (Transformer OCR) entrenada desde cero (*scratch*) en lugar de partir de un checkpoint preentrenado. El modelo incorpora la etiqueta `ctc`, lo que indica el uso de Connectionist Temporal Classification como mecanismo de decodificación o de función de pérdida, aunque no se especifica si convive con una cabeza autorregresiva o si sustituye a esta.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del split de desarrollo, con la aumentación `stroke2` y semilla 42. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo de OCR). La evaluación se realizó con decodificación greedy y sin modelo de lenguaje, lo que explica en parte las métricas de error reportadas. Los detalles completos se remiten a un archivo `results.json` no incluido en la información proporcionada.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo.
- Decodificación CTC (según la etiqueta `ctc` del modelo).
- Transcripción de imágenes de manuscritos a texto plano.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe: el modelo está etiquetado únicamente para hebreo.
- No se ha documentado modo de razonamiento (*thinking*), visión general, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en aumentación de datos para HTR: el modelo sirve como punto de comparación dentro del estudio `htr-metrics-transfer`, permitiendo medir el efecto de la aumentación `stroke2` frente a otras variantes con la misma semilla. Es adecuado porque su configuración experimental está controlada y documentada.
- Reproducción de experimentos académicos: al estar publicado con licencia MIT y pesos en safetensors, permite replicar los resultados reportados (CER 0,5153, WER 1,0909) sobre el test HHD Option-B.
- Análisis de líneas base (*baselines*) en HTR de hebreo: útil para establecer un punto de referencia de bajo coste computacional (22,4 M de parámetros) frente a modelos mayores.
- Prototipado de pipelines de transcripción de manuscritos hebreos en entornos con recursos limitados: su tamaño reducido permite ejecutarlo en CPU o GPU de gama baja, aunque con la advertencia de las elevadas tasas de error.
- Estudio de decodificación CTC sin modelo de lenguaje: permite analizar el impacto de incorporar o no un LM en la corrección de errores, dado que la evaluación reportada se hizo sin LM.
- Docencia y experimentación con TrOCR: como ejemplo de entrenamiento desde cero de un modelo OCR sobre un dataset específico, con configuración de semilla y aumentación reproducible.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,5153 | Test HHD Option-B, decodificación greedy, sin LM |
| WER | 1,0909 | Test HHD Option-B, decodificación greedy, sin LM |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no son aplicables a un modelo de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,4 M de parámetros, ~0,1 GB de pesos); en la práctica, unos pocos cientos de MB incluyendo activaciones y buffers de imagen.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060, e incluso en CPU.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), `onnxruntime` tras conversión, o `vLLM`/`TGI` no están documentados para este modelo; `llama.cpp` y `Ollama` no son aplicables al no ser un modelo de lenguaje generativo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| `cyttic/hmt-trocrscratchreg-stroke2-s42` | 22,4 M | no disponible | MIT | he | Objeto de esta ficha; CER 0,5153, WER 1,0909 |
| `cyttic/hmt-trocrctc-stroke2-s42` | 87,3 M | no disponible | no disponible | he (presumible) | Variante CTC del mismo estudio de aumentación; sin métricas publicadas en la información disponible |
| TrOCR (Microsoft) | ~334 M (base) / ~558 M (large) | no disponible | MIT | en (principalmente) | Modelo OCR generalista preentrenado; no entrenado específicamente para hebreo manuscrito |

La comparación se limita a los modelos identificados en la búsqueda; no se dispone de datos de rendimiento de las alternativas sobre el mismo test para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Métricas de error muy elevadas: CER 0,5153 y WER 1,0909 indican que más de la mitad de los caracteres y prácticamente todos los tokens se transcriben incorrectamente en el test evaluado. No es apto para producción sin un post-procesado o un modelo de lenguaje corrector.
- Evaluación sin modelo de lenguaje: los resultados reportados corresponden a decodificación greedy sin LM, por lo que no reflejan el rendimiento potencial con corrección lingüística.
- Idioma único: solo se ha documentado hebreo; no hay evidencia de generalización a otros idiomas o alfabetos.
- Sesgos conocidos: no disponibles, pero al entrenarse sobre un dataset con escritores específicos (`hhd-optionb-split`), es probable que tenga sesgo hacia el estilo de escritura de esos escritores y pobre generalización a escritores no vistos.
- Riesgo de alucinación: en un modelo CTC de OCR el riesgo se manifiesta como sustituciones, inserciones y omisiones de caracteres, no como generación libre; aun así, la tasa de error observada es alta.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución; no obstante, la calidad del modelo desaconseja su uso comercial directo.
- Caveat de producción: sin pipeline declarado, sin documentación de cuantizaciones y con un repo de 0,1 GB, se trata de un artefacto de investigación; conviene validar el preprocesado de imágenes y el tokenizador antes de integrarlo.
- Fecha de creación futura (2026-11-06) en los metadatos: conviene verificar la integridad y vigencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-stroke2-s42
- Variante relacionada (CTC): https://huggingface.co/cyttic/hmt-trocrctc-stroke2-s42
- Dataset de entrenamiento (referenciado): `cyttic/hhd-optionb-split` (no se ha proporcionado URL directa)
- Resultados detallados: `results.json` (referenciado en la model card, no se ha proporcionado URL directa)
