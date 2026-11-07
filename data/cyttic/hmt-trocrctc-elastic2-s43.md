# cyttic/hmt-trocrctc-elastic2-s43

## Resumen

`cyttic/hmt-trocrctc-elastic2-s43` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por el usuario cyttic en el marco de un estudio de aumentación de datos denominado `htr-metrics-transfer`. El modelo combina una arquitectura TrOCR con una cabeza de decodificación CTC, entrenada sobre el conjunto de datos `cyttic/hhd-optionb-split`, y está especializado en hebreo manuscrito. Su relevancia radica en que forma parte de una serie de experimentos controlados que evalúan cómo distintas estrategias de aumentación de datos (en este caso, `elastic2`) afectan a las métricas de transferencia entre particiones de escritores.

Con 87,3 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo compacto pensado para investigación en HTR más que para despliegue comercial a gran escala. La model card reporta un CER de 0,0985 y un WER de 0,4122 sobre el conjunto de test HHD Option-B, con decodificación greedy y sin modelo de lenguaje, lo que sitúa su rendimiento en un rango de utilidad para transcripción asistida pero todavía lejos de la calidad de producción sin post-procesado.

El interés actual de esta ficha es doble: por un lado, documenta un punto concreto de una comparativa de aumentación (semilla 43, aumentación elástica); por otro, permite reproducir y contrastar resultados frente a variantes hermanas de la misma familia, como `hmt-htrvt-elastic2-s42`, que emplea otra arquitectura y obtiene métricas distintas sobre el mismo conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (según nombre del modelo y tags) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se denomina `trocrctc`, lo que sugiere una variante de TrOCR (Transformer OCR) en la que la decodificación se realiza mediante Connectionist Temporal Classification (CTC) en lugar de una cabeza generativa autoregresiva. Esta elección es coherente con tareas HTR en las que se busca alinear secuencias de imágenes de líneas de texto con transcripciones sin necesidad de un decoder seq2seq completo. El repositorio contiene únicamente pesos en formato safetensors y no se detalla en la información disponible la configuración exacta del encoder visual ni del decoder CTC.

El entrenamiento se realizó sobre la partición de train de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, con la aumentación `elastic2` y la semilla 43. La model card indica que los detalles completos están en un `results.json` del estudio `htr-metrics-transfer`, pero no se especifican el número de tokens, la composición del dataset ni si hubo etapas de ajuste fino adicionales. La evaluación reportada emplea decodificación greedy y no utiliza modelo de lenguaje, lo que permite aislar el rendimiento acústico-visual puro del modelo.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo sobre imágenes de líneas o regiones de texto.
- Decodificación CTC greedy, sin dependencia de un modelo de lenguaje externo.
- Entrenamiento con aumentación elástica (`elastic2`), orientada a mejorar la robustez frente a deformaciones geométricas locales en la escritura.
- Evaluación reproducible mediante las métricas CER y WER sobre el conjunto HHD Option-B.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- El soporte multilingüe se limita al hebreo según el campo `language` de la model card.

## Casos de uso

- Transcripción asistida de documentos históricos en hebreo: el modelo puede generar una primera hipótesis de transcripción por línea que un revisor humano corrija, aprovechando su CER de 0,0985 como punto de partida razonable para reducir el esfuerzo manual.
- Digitalización de archivos manuscritos con escritura variable: la aumentación elástica con la que fue entrenado busca tolerar deformaciones locales, lo que resulta útil en colecciones con caligrafías heterogéneas.
- Investigación en aumentación de datos para HTR: sirve como punto de comparación controlado (semilla 43, aumentación `elastic2`) frente a otras variantes de la misma familia para medir el impacto de la aumentación en CER y WER.
- Generación de datos sintéticos de entrenamiento: las transcripciones producidas pueden emplearse como pseudo-etiquetas para preentrenar o ajustar otros modelos HTR de la misma familia.
- Evaluación de pipelines de decodificación CTC: al no usar modelo de lenguaje, es adecuado para medir el efecto aislado de cambios en el decoder o en el preprocesado de imagen.
- Indexación y búsqueda en corpus manuscritos: las transcripciones generadas permiten construir índices de texto recuperable sobre colecciones digitalizadas, aceptando la tasa de error actual como compromiso.
- Prototipado académico de bajo coste: con 87,3 M de parámetros y 0,3 GB de pesos, puede ejecutarse en entornos de investigación con recursos limitados para experimentos de HTR en hebreo.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0985 | HHD Option-B test, greedy, sin LM |
| WER | 0,4122 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo especializado en HTR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 87,3 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,35 GB; en fp16, unos 0,17 GB. La VRAM total dependerá del tamaño de las imágenes de entrada y del batch, pero en cualquier caso será muy inferior a 2 GB para inferencia por línea.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutar el modelo. Para evaluación por lotes a gran escala se recomienda A100 o H100 por throughput.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM efectiva para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo con pesos safetensors y arquitectura TrOCR+CTC, puede servirse con PyTorch y Transformers, o exportarse a ONNX para inferencia optimizada. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | CER | WER | Licencia |
|---|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-elastic2-s43 | TrOCR + CTC | 87,3 M | no disponible | 0,0985 | 0,4122 | MIT |
| cyttic/hmt-htrvt-elastic2-s42 | htrvt (según nombre) | no disponible | no disponible | 0,0667 | 0,2967 | no disponible |

La variante `hmt-htrvt-elastic2-s42` obtiene mejores métricas sobre el mismo conjunto de evaluación (CER 0,0667 frente a 0,0985; WER 0,2967 frente a 0,4122), aunque emplea una arquitectura distinta y una semilla diferente, por lo que la comparación no aísla el efecto de una sola variable. No se dispone de información sobre otros modelos comparables de HTR en hebreo en la búsqueda realizada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en hebreo manuscrito; no debe esperarse un comportamiento correcto en otros idiomas o en texto impreso sin validación previa.
- El WER de 0,4122 es elevado para muchos escenarios de producción; se recomienda post-procesado con modelo de lenguaje o revisión humana antes de usar las transcripciones como dato final.
- La evaluación reportada usa decodificación greedy y sin modelo de lenguaje, por lo que el rendimiento en un pipeline con corrección lingüística podría diferir y no está documentado.
- No se detallan sesgos conocidos, composición del dataset de entrenamiento ni procedencia de los escritores; esto limita la evaluación de riesgos de generalización a otras colecciones.
- Riesgo de alucinación: en HTR, el equivalente es la sustitución o inserción de caracteres plausibles pero incorrectos, especialmente en caligrafías alejadas de la distribución de entrenamiento.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni documenta limitaciones de responsabilidad específicas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; se trata de un artefacto de investigación sin validación comunitaria.
- No se documentan requisitos de preprocesado de imagen (resolución, normalización, segmentación de líneas), lo que puede afectar a la reproducibilidad de las métricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-elastic2-s43
- Variante hermana `hmt-htrvt-elastic2-s42`: https://huggingface.co/cyttic/hmt-htrvt-elastic2-s42
- Dataset de entrenamiento referenciado: `cyttic/hhd-optionb-split` (no se proporciona URL directa en la información disponible)
- Estudio de referencia: `htr-metrics-transfer` (detalles en `results.json`, no se proporciona URL directa)
