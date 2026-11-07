# cyttic/hmt-trocrscratchline-stroke1-s42

## Resumen

`cyttic/hmt-trocrscratchline-stroke1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el usuario cyttic en Hugging Face. Se trata de un checkpoint concreto dentro de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se comparan distintas estrategias de aumento sobre una misma arquitectura base. En este caso, la variante corresponde al modelo `trocrscratchline` entrenado con la aumentación `stroke1` y la semilla 42.

El modelo parte de la familia TrOCR, un enfoque de transformer encoder-decoder originalmente propuesto por Microsoft para OCR impreso y adaptado aquí al reconocimiento de escritura manuscrita. Con 22.421.004 parámetros y un repositorio de apenas 0,1 GB, es un modelo compacto orientado a la decodificación CTC (según la etiqueta `ctc` de la model card) sobre texto en hebreo (`he`), lo que lo sitúa en un nicho muy específico: HTR para una única lengua y un único alfabeto.

Su relevancia es fundamentalmente experimental: no es un modelo de producción ni un lanzamiento comercial, sino un artefacto de investigación que documenta el efecto de una aumentación concreta sobre las métricas de error. Los resultados reportados (CER 0,3588 y WER 0,9526 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje) reflejan un rendimiento modesto que debe interpretarse en el contexto del estudio comparativo, no como un estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder para HTR), variante `trocrscratchline` |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema TrOCR: un encoder visual tipo ViT que procesa la imagen de la línea de texto y un decoder transformer que genera la secuencia de caracteres. La variante `trocrscratchline` sugiere un entrenamiento desde cero (*scratch*) orientado a líneas manuscritas, en lugar de partir de un checkpoint preentrenado de OCR impreso. La etiqueta `ctc` indica que la decodificación se realiza mediante Connectionist Temporal Classification, lo que evita la necesidad de un modelo de lenguaje externo en la inferencia.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y la evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin LM. La aumentación aplicada es `stroke1`, una de las variantes del estudio de transferencia de métricas HTR; la semilla fijada es 42. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (poco probables en un modelo HTR de este tamaño).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea de imagen.
- Decodificación CTC sin modelo de lenguaje auxiliar (greedy decoding).
- Salida de secuencia de caracteres a partir de una imagen de línea.
- Entrenamiento específico sobre escritores del split de train del dataset HHD Option-B.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- Modelo monolingüe: únicamente hebreo.

## Casos de uso

- Investigación en aumentación de datos HTR: sirve como checkpoint de referencia para medir el impacto de la aumentación `stroke1` frente a otras variantes del estudio `htr-metrics-transfer`, comparando CER y WER bajo condiciones controladas.
- Reproducibilidad de experimentos: al fijar la semilla 42 y documentar el split de entrenamiento, permite replicar exactamente el resultado reportado en `results.json`.
- Transcripción de líneas manuscritas en hebreo en entornos de archivo digitalizado: útil como línea base para pipelines de digitalización de documentos históricos o administrativos en hebreo, siempre que se acepte un CER cercano al 36 %.
- Evaluación comparativa de arquitecturas TrOCR: permite contrastar la variante `scratchline` con otras variantes del mismo autor (por ejemplo, `htrvt`) sobre el mismo conjunto de test.
- Generación de datos sintéticos de entrenamiento: sus errores característicos pueden analizarse para diseñar aumentaciones o estrategias de corrección posteriores.
- Prototipado académico de HTR: adecuado para tesis o trabajos que necesiten un modelo pequeño (22 M de parámetros) y de licencia permisiva para experimentar con decodificación CTC en hebreo.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,3588 | Test HHD Option-B, greedy decoding, sin LM |
| WER | 0,9526 | Test HHD Option-B, greedy decoding, sin LM |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,4 M de parámetros, ~90 MB de pesos); en fp16 aproximadamente 45 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch/Hugging Face Transformers con carga directa de safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo HTR de este tamaño).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (test HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyttic/hmt-trocrscratchline-stroke1-s42` | 22,4 M | no disponible | 0,3588 | MIT | Hugging Face |
| `cyttic/hmt-htrvt-stroke4-s42` | 13,8 M | no disponible | no disponible | no disponible | Hugging Face |
| TrOCR base (Microsoft) | ~334 M | no disponible | no disponible (otro dominio) | MIT | Hugging Face |

La comparación con TrOCR base es orientativa: aquel modelo está entrenado para OCR impreso en inglés y no es directamente comparable en HTR hebreo. El otro checkpoint del mismo autor (`htrvt-stroke4-s42`) pertenece al mismo estudio pero con distinta arquitectura y aumentación, por lo que la comparación directa de CER requeriría consultar `results.json`.

## Limitaciones y advertencias

- Rendimiento modesto: CER de 0,3588 y WER de 0,9526 implican que más de un tercio de los caracteres se reconocen incorrectamente en el conjunto de test; no es apto para producción sin corrección posterior.
- Entrenado exclusivamente en hebreo; no generaliza a otros alfabetos ni a texto impreso.
- Evaluado con decodificación greedy y sin modelo de lenguaje, lo que penaliza la calidad frente a configuraciones con LM.
- Posible sobreajuste a los escritores del split de entrenamiento; el propio estudio excluye escritores de dev, lo que sugiere sensibilidad a la variabilidad de escritura.
- Riesgo de alucinación de caracteres en secuencias ambiguas, inherente a la decodificación CTC sin LM.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye sin garantías y sin documentación sobre sesgos demográficos o de escritura.
- No se documentan sesgos conocidos, pero al ser un modelo de investigación con pocos datos y un único idioma, cualquier uso en producción debe someterse a evaluación propia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-stroke1-s42
- Modelo relacionado del mismo autor: https://huggingface.co/cyttic/hmt-htrvt-stroke4-s42
