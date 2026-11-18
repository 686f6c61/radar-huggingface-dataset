# cyttic/hmt-trocrscratchstem-stroke4-s42

## Resumen

`cyttic/hmt-trocrscratchstem-stroke4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un checkpoint concreto dentro de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se entrena un modelo base tipo TrOCR desde cero (*scratch*) sobre escritura manuscrita en hebreo, aplicando una estrategia de aumentación etiquetada como `stroke4` y con semilla 42.

El modelo resuelve la transcripción automática de imágenes de texto manuscrito a texto digital, empleando una arquitectura de reconocimiento con cabecera CTC (Connectionist Temporal Classification) y decodificación voraz (*greedy*) sin modelo de lenguaje externo. Con 24.928.588 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a experimentación y evaluación de métricas de transferencia entre dominios de escritura.

Su relevancia es acotada pero específica: sirve como referencia reproducible para investigadores que trabajan en HTR sobre hebreo y que necesitan comparar el efecto de distintas estrategias de aumentación sobre el rendimiento final medido en CER y WER. El checkpoint reporta un CER de 0,0791 y un WER de 0,3545 sobre el conjunto de test HHD Option-B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR entrenado desde cero (*scratch*) con cabecera CTC |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR, un enfoque *encoder-decoder* habitual en reconocimiento de texto impreso y manuscrito, aunque en este caso se entrena desde cero en lugar de partir de un checkpoint preentrenado. La cabeza de salida es CTC, lo que permite alinear secuencias de caracteres con las regiones de la imagen sin necesidad de segmentación previa a nivel de carácter. El modelo se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y se evalúa sobre el test HHD Option-B.

La innovación principal del checkpoint no reside en la arquitectura, sino en el protocolo experimental: forma parte de un estudio de transferencia de métricas HTR en el que se varía la aumentación de datos. En este caso concreto se aplica la aumentación `stroke4` con semilla 42, y la decodificación es voraz sin modelo de lenguaje, lo que aísla el efecto de la aumentación sobre el rendimiento del acústico visual. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Transcripción a nivel de línea o región mediante decodificación CTC voraz.
- Evaluación reproducible de métricas CER y WER sobre el conjunto HHD Option-B.
- Entrenamiento desde cero, lo que facilita el análisis del efecto de la aumentación sin sesgos de preentrenamiento.
- No se ha documentado soporte de *tool calling*, *function calling* ni comportamiento agéntico.
- No se ha documentado capacidad multilingüe más allá del hebreo.
- No se ha documentado modo *thinking*, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de documentos históricos o administrativos escritos a mano, siempre que el dominio de escritura se aproxime al del corpus HHD.
- Investigación en aumentación de datos HTR: sirve como punto de comparación reproducible (semilla 42, aumentación `stroke4`) frente a otros checkpoints del mismo estudio para medir el impacto de cada estrategia.
- Evaluación de métricas de transferencia: útil para estudiar cómo se comportan CER y WER cuando el modelo se entrena excluyendo escritores concretos y se evalúa en un conjunto separado.
- Prototipado de pipelines OCR/HTR: al ser un modelo compacto (0,1 GB), puede integrarse en entornos de experimentación con recursos limitados para validar la viabilidad de una solución HTR antes de escalar.
- Generación de datasets transcritos: puede emplearse para preanotar imágenes manuscritas en hebreo y acelerar la creación de corpus etiquetados, con revisión humana posterior.
- Reproducibilidad académica: permite replicar los resultados reportados (CER 0,0791, WER 0,3545) y comparar con variantes del mismo estudio.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test | CER | 0,0791 |
| HHD Option-B test | WER | 0,3545 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 24,9 M de parámetros, el modelo en precisión completa ocuparía aproximadamente 0,1 GB, por lo que cabría en cualquier GPU consumer.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 1-2 GB de VRAM sería suficiente.
- Cabe en GPU consumer: sí, previsiblemente en cualquier modelo moderno (RTX 3060, RTX 4090, etc.), aunque no se ha verificado oficialmente.
- Opciones de despliegue: no disponible; al usar safetensors, sería desplegable con frameworks compatibles con TrOCR/CTC, pero no se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-stroke4-s42 | 24,9 M | no disponible | MIT | Hugging Face |
| TrOCR base (Microsoft) | no disponible en la informacion | no disponible | no disponible | Hugging Face |
| Otros checkpoints del estudio htr-metrics-transfer | no disponible | no disponible | MIT (presumible) | Hugging Face |

No se dispone de datos de rendimiento comparables de modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para hebreo manuscrito; no se ha validado en otros idiomas ni en texto impreso.
- El WER reportado (0,3545) es notablemente alto en comparación con el CER (0,0791), lo que sugiere errores a nivel de palabra que pueden afectar a tareas de transcripción literal.
- La decodificación es voraz y sin modelo de lenguaje, lo que limita la corrección contextual de errores.
- Al ser un checkpoint de un estudio experimental, no se ha documentado su robustez fuera del dominio HHD Option-B.
- Riesgo de alucinación y sesgos: no disponible en la informacion proporcionada.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento originales.
- No se han documentado pruebas de producción, latencia ni estabilidad en despliegues reales.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-stroke4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split (referenciado en la model card)
- Detalles adicionales: `results.json` dentro del repositorio del modelo (referenciado en la model card)
