# cyttic/hmt-trocrscratchstem-elastic1-s42

## Resumen

`cyttic/hmt-trocrscratchstem-elastic1-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) publicado por el autor `cyttic` en Hugging Face. Se trata de un checkpoint experimental dentro de un estudio de aumento de datos (augmentation study) denominado `htr-metrics-transfer`, cuyo objetivo es medir cómo distintas estrategias de augmentación afectan a las métricas de transferencia en tareas de transcripción de manuscritos. El modelo concreto corresponde a la variante de augmentación `elastic1` con semilla 42, sobre una arquitectura base identificada como `trocrscratchstem`.

El modelo resuelve la tarea de transcribir imágenes de texto manuscrito a texto plano, empleando un esquema de decodificación CTC (Connectionist Temporal Classification) con decodificación greedy y sin modelo de lenguaje externo. Está entrenado específicamente para hebreo (`he`), lo que lo hace relevante para proyectos de digitalización de documentos históricos o manuscritos en esa lengua, un nicho con pocos recursos públicos comparado con el inglés.

Con 24.928.588 parámetros (aproximadamente 25 millones) y un tamaño de repositorio de 0,1 GB, es un modelo compacto pensado para investigación y experimentación más que para despliegue comercial a gran escala. Su licencia MIT facilita la reutilización, aunque la ausencia de pipeline declarado y de documentación extensa limita su adopción directa en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con decodificación CTC (variante `trocrscratchstem`), según la model card |
| Parametros totales | 24.928.588 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como `trocrscratchstem`, una variante de TrOCR (Transformer-based Optical Character Recognition) con cabecera CTC y decodificación greedy. TrOCR combina normalmente un encoder de visión con un decoder transformer; en esta variante el prefijo `scratchstem` sugiere un entrenamiento desde cero sobre un stem o tronco común, aunque la model card no detalla la configuración exacta de capas, dimensiones ocultas ni el encoder visual empleado.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo (dev writers), y se evaluó sobre el conjunto de test HHD Option-B. La augmentación aplicada es `elastic1` (distorsión elástica), con semilla 42. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en HTR). Los resultados completos del estudio se remiten a un fichero `results.json` no incluido en la información proporcionada.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a partir de imágenes de documentos.
- Decodificación CTC con estrategia greedy, sin modelo de lenguaje externo.
- Transcripción a nivel de carácter y de palabra, con métricas CER y WER reportadas.
- Entrenamiento orientado a generalización entre escritores (exclusión de dev writers en train).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte multilingüe más allá del hebreo.
- No se documentan modos de razonamiento (thinking), visión general, audio ni otras capacidades especiales.

## Casos de uso

- Digitalización de manuscritos históricos en hebreo: el modelo puede transcribir imágenes de documentos escaneados a texto plano, adecuado para archivos y bibliotecas que necesiten indexar colecciones manuscritas en hebreo.
- Investigación en aumento de datos para HTR: al formar parte de un estudio de augmentación (`elastic1`), sirve como checkpoint de referencia para comparar el efecto de distintas técnicas de augmentación sobre CER y WER.
- Evaluación de transferencia entre escritores: útil en experimentos que midan la robustez del reconocimiento cuando el conjunto de test contiene escritores no vistos en entrenamiento.
- Prototipado de pipelines OCR/HTR en hebreo: con solo ~25 M de parámetros y pesos en safetensors, puede integrarse en prototipos de bajo coste computacional.
- Baseline en benchmarks de HTR hebreo: su CER de 0,0774 y WER de 0,3478 sobre HHD Option-B permiten usarlo como referencia en comparaciones académicas.
- Extracción de texto para corpus lingüísticos: permite generar transcripciones automáticas que luego se corrijan manualmente, reduciendo el coste de anotación en proyectos de corpus en hebreo.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,0774 |
| HHD Option-B test (greedy, sin LM) | WER | 0,3478 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni tablas de comparación frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~25 M de parámetros, en fp32 ocuparía aproximadamente 100 MB de pesos, y en fp16 unos 50 MB, por lo que cabría holgadamente en cualquier GPU consumer.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU con al menos 2-4 GB de VRAM sería suficiente, incluidas RTX 3060, RTX 4060 o superiores.
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: no documentadas en la model card; al usar safetensors, sería compatible con frameworks de inferencia basados en PyTorch/Transformers, aunque no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchstem-elastic1-s42 | 24,9 M | no disponible | he | MIT | HTR hebreo, CTC greedy, checkpoint de estudio de augmentación |
| TrOCR (Microsoft, base) | ~334 M (base) / ~558 M (large) | no disponible | en (principalmente) | MIT | Referencia general de OCR basada en transformer; no específico para hebreo |
| Alternativas HTR hebreo | no disponible | no disponible | he | no disponible | No se dispone de información sobre modelos comparables en la búsqueda realizada |

No se dispone de datos suficientes para una comparación cuantitativa de rendimiento con alternativas.

## Limitaciones y advertencias

- Modelo experimental de un estudio de augmentación; no está pensado como producto final ni validado para producción.
- Entrenado exclusivamente para hebreo; no se garantiza su funcionamiento en otras lenguas.
- Decodificación greedy sin modelo de lenguaje, lo que puede aumentar errores en palabras ambiguas o poco frecuentes (WER de 0,3478 es relativamente alto).
- Riesgo de alucinación y de errores de transcripción en documentos con caligrafías, ruido o layouts distintos a los del dataset HHD Option-B.
- Sesgos potenciales derivados de la distribución de escritores del dataset de entrenamiento; el rendimiento puede degradarse con escritores no representados.
- No se documentan limitaciones de contexto ni de longitud de secuencia.
- Licencia MIT permite uso comercial, pero la falta de documentación y de pipeline declarado desaconseja su uso directo en entornos críticos sin validación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchstem-elastic1-s42
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios o demos adicionales.
