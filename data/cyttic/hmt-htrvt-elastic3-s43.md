# cyttic/hmt-htrvt-elastic3-s43

## Resumen

`cyttic/hmt-htrvt-elastic3-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por cyttic en el marco de un estudio de aumento de datos denominado *htr-metrics-transfer*. El modelo emplea una arquitectura de tipo red neuronal recurrente convolucional (CRNN) con decodificación CTC (Connectionist Temporal Classification), tal como indican sus etiquetas `htr` y `ctc`. Con 13.821.574 parámetros, es un modelo compacto orientado a la transcripción de líneas o regiones de texto manuscrito en hebreo.

La relevancia de esta publicación es fundamentalmente metodológica: no se trata de un modelo de propósito general, sino de una variante concreta dentro de un barrido experimental sobre estrategias de *augmentation*. En este caso, la variante `elastic3` (deformaciones elásticas) con semilla 43 se entrena sobre el conjunto `cyttic/hhd-optionb-split` excluyendo los escritores de desarrollo, y se evalúa sobre el test HHD Option-B con decodificación *greedy* y sin modelo de lenguaje, obteniendo un CER de 0,0762 y un WER de 0,3290.

Por su tamaño reducido (0,1 GB de repositorio), su licencia MIT y su enfoque específico en hebreo manuscrito, resulta útil como componente de referencia para pipelines de digitalización documental y como punto de comparación en investigaciones sobre robustez frente a variaciones de escritura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CRNN con decodificación CTC (según etiquetas `htr` y `ctc`) |
| Parámetros totales | 13.821.574 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia de arquitecturas CRNN (red convolucional para extracción de características visuales seguida de capas recurrentes) con una cabeza de salida CTC, el paradigma estándar en HTR cuando no se dispone de alineaciones a nivel de carácter. La model card no detalla el número de capas, el tipo de celda recurrente ni las dimensiones internas, por lo que estos datos deben considerarse no disponibles. La decodificación empleada en la evaluación es *greedy*, sin modelo de lenguaje externo, lo que permite aislar el rendimiento acústico-visual del modelo.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y aplicando una estrategia de aumento de datos etiquetada como `elastic3` con semilla 43. Esta técnica de deformación elástica es habitual en HTR para simular variabilidad intra-escritor (inclinación, espaciado, curvatura de trazos). No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea o región de imagen.
- Decodificación CTC, lo que permite transcribir secuencias sin segmentación previa a nivel de carácter.
- Entrenamiento con aumento de datos elástico, orientado a mejorar la robustez frente a variaciones de escritura.
- Evaluación y métricas a nivel de carácter (CER) y de palabra (WER).
- No se documentan capacidades de *tool calling*, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- Modelo monolingüe: no se declaran capacidades multilingües más allá del hebreo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir imágenes de líneas de texto escaneadas, integrándose en un pipeline OCR/HTR previo a la indexación documental. Su tamaño compacto (13,8 M de parámetros) facilita el despliegue en servidores modestos.
- Procesamiento por lotes de colecciones históricas: al ser un modelo ligero y con licencia MIT, puede ejecutarse en paralelo sobre grandes volúmenes de páginas sin requerir GPUs de gama alta.
- Investigación en aumento de datos para HTR: sirve como referencia reproducible (semilla 43, variante `elastic3`) para comparar el impacto de distintas estrategias de *augmentation* sobre CER y WER.
- Evaluación comparativa de decodificadores: al publicarse resultados con decodificación *greedy* sin LM, permite medir la ganancia marginal de añadir un modelo de lenguaje en etapas posteriores.
- Prototipado de asistentes de transcripción para investigadores de textos hebreos: el modelo puede envolverse en una API sencilla que reciba una imagen y devuelva la cadena reconocida.
- Generación de datos sintéticos o aumentados: sus transformaciones elásticas documentadas pueden reutilizarse para aumentar otros corpus HTR en hebreo.
- Validación de pipelines de preprocesado de imagen (binarización, corrección de inclinación): al tener un CER de referencia bajo (0,0762), cambios en el preprocesado pueden medirse de forma fiable contra este modelo.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card, sobre el test HHD Option-B con decodificación *greedy* y sin modelo de lenguaje:

| Métrica | Valor |
|---|---|
| CER | 0,0762 |
| WER | 0,3290 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 13,8 M de parámetros en precisión FP32 el peso ronda los 55 MB, por lo que la inferencia cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; también puede ejecutarse en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales e incluso en sistemas embebidos con suficiente memoria.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo HTR); el despliegue típico sería mediante PyTorch y un *wrapper* propio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de HTR en hebreo (por ejemplo, variantes de TrOCR, CRNN clásicas o modelos basados en transformers para HTR) con los que establecer una comparación cuantitativa fiable. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | CER (HHD Option-B) | Licencia |
|---|---|---|---|---|
| cyttic/hmt-htrvt-elastic3-s43 | 13,8 M | no disponible | 0,0762 | MIT |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo monolingüe: solo se declara soporte para hebreo; no debe esperarse un rendimiento aceptable en otros alfabetos o idiomas.
- Es un modelo de investigación sobre *augmentation*, no un producto final; su model card no documenta validación fuera del conjunto HHD Option-B.
- El WER de 0,3290 es notablemente superior al CER de 0,0762, lo que sugiere errores a nivel de palabra que pueden afectar a tareas de búsqueda o extracción de entidades.
- La evaluación se realizó con decodificación *greedy* sin modelo de lenguaje; en producción podría ser necesario añadir un LM para reducir el WER, con el coste computacional asociado.
- Riesgo de alucinación y de sustituciones sistemáticas en escrituras muy alejadas de la distribución de entrenamiento (escritores no vistos, documentos degradados).
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus concreto (`hhd-optionb-split`) puede heredar sesgos de estilo, época o soporte material de dicho corpus.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar la licencia del dataset de entrenamiento subyacente antes de un despliegue comercial.
- No se dispone de información sobre cuantizaciones, latencia ni límites de longitud de secuencia, lo que dificulta planificar el dimensionamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-elastic3-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
