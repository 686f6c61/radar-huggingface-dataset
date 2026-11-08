# cyttic/hmt-trocrscratchline-photo1-s42

## Resumen

`cyttic/hmt-trocrscratchline-photo1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) entrenado con un cabezal CTC sobre una base TrOCR. Lo publica el usuario `cyttic` como parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se varía el tipo de aumentación y la semilla de entrenamiento para medir su transferencia a métricas de reconocimiento. Este checkpoint concreto corresponde a la variante de aumentación `photo1` con semilla 42.

El modelo resuelve una tarea muy acotada: transcribir líneas de texto manuscrito en hebreo (`he`) a texto digital. Con 22.421.004 parámetros y un repositorio de 0,1 GB, es un modelo pequeño orientado a experimentación más que a producción generalista. Su relevancia es metodológica: sirve para comparar el efecto de distintas estrategias de aumentación sobre el CER y el WER en un corpus concreto (`cyttic/hhd-optionb-split`).

La información pública es muy limitada: la model card apenas aporta la configuración del experimento y dos métricas de evaluación. No se documentan detalles de arquitectura interna, composición del dataset ni proceso de entrenamiento más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabezal CTC (según nombre del modelo y tag `ctc`); detalles internos no disponibles |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El nombre del checkpoint (`trocrscratchline`) y el tag `ctc` indican una base TrOCR adaptada a reconocimiento de líneas manuscritas con decodificación CTC. No se dispone de información publicada sobre el número de capas, dimensión oculta, mecanismo de atención ni tamaño de imagen de entrada.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo (*dev writers*). La aumentación aplicada es la etiquetada como `photo1` y la semilla de inicialización/entrenamiento es 42. No se documentan el número de tokens o muestras, la composición del dataset, ni si hubo ajuste fino supervisado adicional, RLHF o DPO. La evaluación se hizo sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea.
- Decodificación CTC greedy (sin modelo de lenguaje externo en la evaluación reportada).
- Salida de transcripción de texto plano; no se documenta estructuración adicional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del hebreo.
- No se documenta modo *thinking*, visión general, audio ni otras modalidades.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas segmentadas de documentos históricos o administrativos, integrado en un pipeline previo de detección y recorte de líneas.
- Investigación en HTR comparada: sirve como checkpoint de referencia para estudiar el efecto de la aumentación `photo1` frente a otras variantes del mismo estudio.
- Reproducción de experimentos: al estar publicado con licencia MIT y pesos en safetensors, permite replicar las métricas reportadas (CER 0.3857, WER 0.9832) sobre el test HHD Option-B.
- Generación de transcripciones auxiliares para anotación humana: dado su CER relativamente alto, encaja mejor como preanotador que como transcriptor final, reduciendo el esfuerzo de revisión manual.
- Prototipado de sistemas de búsqueda sobre corpus manuscritos: las transcripciones, aunque imperfectas, pueden alimentar índices de texto para recuperación aproximada.
- Evaluación de pipelines de preprocesado: permite medir cómo afectan distintas etapas de segmentación o realce de imagen a una misma arquitectura base.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto / configuracion |
|---|---|---|
| CER | 0.3857 | HHD Option-B test, greedy, sin LM |
| WER | 0.9832 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 22,4 M de parámetros; en la práctica, unos pocos cientos de MB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: carga directa con `transformers` desde safetensors; no se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos generativos de texto, no a CTC de reconocimiento).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cyttic/hmt-trocrscratchline-photo1-s42 | 22,4 M | no disponible | MIT | HTR hebreo, CER 0.3857 en HHD Option-B |
| TrOCR base (Microsoft) | ~334 M | no disponible | MIT | Referencia genérica de HTR; no evaluado en este corpus |
| Otros checkpoints del estudio `htr-metrics-transfer` | no disponible | no disponible | MIT (presumible) | Variantes con distinta aumentación y semilla |

No se dispone de datos de rendimiento de los modelos comparables sobre el mismo conjunto de evaluación.

## Limitaciones y advertencias

- CER de 0.3857 y WER de 0.9832 indican una calidad de transcripción baja; el WER cercano a 1 sugiere que la mayoría de palabras se transcriben con errores.
- Entrenado exclusivamente para hebreo; no se garantiza comportamiento en otros idiomas.
- No se documentan sesgos del corpus de entrenamiento ni su composición, lo que impide evaluar sesgos conocidos.
- Riesgo de alucinación en el sentido de sustituciones y omisiones de caracteres propia de los modelos CTC; conviene revisión humana.
- Licencia MIT permite uso comercial, pero la falta de documentación sobre el dataset subyacente puede implicar riesgos de licencia de los datos originales no cubiertos por la licencia del modelo.
- El checkpoint forma parte de un estudio de investigación; no hay evidencia de validación en dominios distintos al corpus HHD.
- No se documenta el preprocesado de imagen esperado (resolución, normalización), lo que puede afectar a la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchline-photo1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados del experimento: `results.json` en el repositorio del modelo (no se dispone de URL directa verificada)
