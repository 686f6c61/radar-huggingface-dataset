# cyttic/hmt-trocrctc-stroke2-s42

## Resumen

`cyttic/hmt-trocrctc-stroke2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por el grupo cyttic, especializado en hebreo histórico. Forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, y esta ficha concreta corresponde a la primera ola, combinación del modelo `trocrctc` con la técnica de aumentación `stroke2` y la semilla 42. El modelo resuelve el problema de transcribir automáticamente texto manuscrito en hebreo, una tarea relevante para digitalización de archivos históricos y patrimonioles.

Arquitectónicamente se trata de un transformer de tipo TrOCR adaptado con cabecera CTC (Connectionist Temporal Classification), lo que permite alineamiento sin segmentación explícita a nivel de carácter. Con 87.279.756 parámetros totales, es un modelo de tamaño medio que puede ejecutarse en GPU de consumo, lo que lo hace adecuado para despliegues locales en proyectos de humanidades digitales sin infraestructura de gran escala.

Su relevancia actual radica en que el hebreo manuscrito histórico cuenta con pocos recursos públicos y modelos especializados; este trabajo documenta de forma reproducible (semilla fija, partición de escritores concreta) el efecto de distintas aumentaciones sobre las métricas HTR, lo que aporta valor metodológico más allá del modelo individual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (transformer encoder-decoder, reconocimiento de texto manuscrito) |
| Parámetros totales | 87.279.756 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR con decodificación CTC, una variante que sustituye el decodificador autorregresivo habitual de TrOCR por una cabecera CTC sobre las representaciones del encoder, lo que permite decodificación greedy sin modelo de lenguaje y sin alineamientos explícitos. El tamaño del repositorio (0,3 GB) es coherente con los 87,3 millones de parámetros en precisión de 16 bits.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y con la aumentación `stroke2` aplicada sobre las imágenes. La evaluación se hizo sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo un CER de 0,1103 y un WER de 0,4549. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco probables en una tarea de reconocimiento).

## Capacidades

- Reconocimiento de texto manuscrito en hebreo (transcripción de imágenes a texto).
- Decodificación CTC greedy sin modelo de lenguaje auxiliar.
- Salida a nivel de carácter con métricas CER/WER evaluables directamente.
- Entrenado específicamente sobre escritores del split de entrenamiento, con exclusión de escritores de desarrollo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del hebreo.
- No se documenta modo thinking, visión general (más allá de la propia entrada de imagen para HTR), audio ni otras modalidades.
- No se documenta soporte de agentes.

## Casos de uso

- Digitalización de archivos históricos en hebreo: el modelo transcribe páginas manuscritas escaneadas y produce texto plano alineado por carácter, adecuado para pipelines de preservación documental donde el CER de 0,11 es aceptable con revisión humana posterior.
- Indexación y búsqueda en colecciones manuscritas: al convertir imágenes en texto, permite construir índices de búsqueda sobre fondos que de otro modo serían inaccesibles, usando el modelo como etapa OCR/HTR del pipeline.
- Investigación en humanidades digitales: sirve como línea base reproducible (semilla 42, aumentación `stroke2`) para comparar el efecto de otras aumentaciones dentro del estudio `htr-metrics-transfer`.
- Transcripción asistida en proyectos de crowdsourcing: el modelo genera una primera pasada que los voluntarios corrigen, reduciendo el esfuerzo manual gracias a un CER del 11 %.
- Extracción de datos para análisis lingüístico diacrónico: la salida a nivel de carácter permite estudiar variación ortográfica y paleográfica en corpus hebreos manuscritos.
- Despliegue local en estaciones de trabajo de investigación: con 87,3 M de parámetros y pesos safetensors de 0,3 GB, el modelo puede ejecutarse en una GPU de consumo o incluso en CPU para lotes pequeños, sin depender de servicios en la nube.
- Prototipado de sistemas HTR para otras lenguas semíticas: la receta (TrOCR + CTC + aumentación de trazos) puede transferirse como punto de partida, siempre que se disponga de datos anotados.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto | Decodificación |
|---|---|---|---|
| CER | 0,1103 | HHD Option-B test | Greedy, sin LM |
| WER | 0,4549 | HHD Option-B test | Greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estándar no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2-0,4 GB en FP16 (87,3 M de parámetros), y menos de 0,2 GB en cuantización de 8 bits; no se dispone de cifras oficiales del autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo y solo aportarían mayor throughput.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo de la familia TrOCR con pesos safetensors, puede cargarse con `transformers` (clase TrOCR o equivalente con cabecera CTC); no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (HHD Option-B) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-stroke2-s42 | 87,3 M | no disponible | 0,1103 | MIT | HuggingFace |
| TrOCR base (Microsoft) | ~334 M | no disponible | no disponible | MIT | HuggingFace |
| Otros modelos del estudio `htr-metrics-transfer` | no disponible | no disponible | no disponible | MIT (presumible) | HuggingFace (cyttic) |

No se dispone de datos comparativos publicados en la información proporcionada para establecer una comparación cuantitativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para hebreo manuscrito; su uso en otras lenguas o en texto impreso no está validado.
- El WER de 0,4549 es elevado en comparación con el CER de 0,1103, lo que indica que, aunque los caracteres se reconocen razonablemente, la segmentación en palabras falla con frecuencia; conviene revisar la tokenización posterior.
- La evaluación se realizó con decodificación greedy y sin modelo de lenguaje; añadir un LM podría mejorar el WER, pero no se documenta en esta ficha.
- El conjunto de evaluación (HHD Option-B test) es específico del estudio; el rendimiento en otros corpus hebreos puede diferir sustancialmente.
- Riesgo de alucinación: en modelos CTC el riesgo es menor que en modelos generativos, pero pueden aparecer caracteres espurios o supresiones en imágenes degradadas.
- Sesgos: al entrenarse sobre un conjunto limitado de escritores, puede generalizar peor a estilos caligráficos no representados en el split de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el trabajo original y verificar las condiciones del dataset subyacente (`cyttic/hhd-optionb-split`), que puede tener restricciones propias.
- El modelo es un artefacto de investigación (estudio de aumentación, semilla 42); no se documenta validación en producción ni pruebas de robustez ante dominios externos.
- No se documentan requisitos de contexto ni límites de longitud de secuencia de entrada, lo que puede afectar a la transcripción de páginas muy largas.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrctc-stroke2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Repositorio del autor: https://huggingface.co/cyttic
- Resultados del estudio: `results.json` (referenciado en la model card, no se proporciona URL directa)
