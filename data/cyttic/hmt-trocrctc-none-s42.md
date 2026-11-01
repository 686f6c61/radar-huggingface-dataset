# cyttic/hmt-trocrctc-none-s42

## Resumen

`cyttic/hmt-trocrctc-none-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) en hebreo, desarrollado por el grupo cyttic dentro de un estudio de aumento de datos denominado htr-metrics-transfer (ola 1). Se trata de un checkpoint experimental: el sufijo `trocrctc` indica una arquitectura híbrida tipo TrOCR con cabecera CTC, `none` indica que no se aplicó aumento de datos y `s42` corresponde a la semilla 42 del entrenamiento. El modelo se publica principalmente como referencia reproducible de un experimento, no como un producto listo para producción.

El modelo cuenta con 87.279.756 parámetros (dato extraído de los pesos en safetensors) y un repositorio de 0,3 GB, lo que lo sitúa en la gama de modelos de visión-lenguaje pequeños, aptos para inferencia en GPU de consumo. Está entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del split de desarrollo, y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados reportados son CER 0,1245 y WER 0,4967.

Su relevancia es acotada pero clara: sirve como línea base (baseline) para medir el efecto de técnicas de aumento de datos en HTR hebreo, un idioma con recursos limitados en comparación con el inglés. La licencia MIT facilita su reutilización y reproducción experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabecera CTC (según nomenclatura del autor `trocrctc`; detalles internos no disponibles) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones publicadas no disponibles) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La nomenclatura del repositorio (`trocrctc`) sugiere una arquitectura basada en TrOCR, es decir, un encoder de visión transformer combinado con un decoder de texto, pero con una cabecera de Connectionist Temporal Classification (CTC) en lugar de, o además de, la decodificación autorregresiva típica de TrOCR. El modelo card no detalla la configuración interna (número de capas, dimensión oculta, tamaño de parches, vocabulario), por lo que estos datos no están disponibles.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo a los escritores del split de desarrollo, y sin aplicar aumento de datos (variante `none`). La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo. No se especifica el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (poco probables en una tarea de reconocimiento de texto). La innovación metodológica del checkpoint no reside en la arquitectura, sino en su papel como condición de control dentro de un estudio comparativo de aumento de datos.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de documentos.
- Transcripción línea a línea (o región a región, según el formato de entrada del dataset HHD, no detallado).
- Decodificación CTC greedy, sin modelo de lenguaje, lo que prioriza velocidad y simplicidad frente a corrección lingüística.
- No dispone de soporte documentado de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras modalidades.
- Capacidad multilingüe limitada al hebreo; no se reportan otros idiomas.
- No se documentan capacidades de generación libre de texto; su salida es la transcripción del contenido visual.

## Casos de uso

- Línea base para experimentos de aumento de datos en HTR: el checkpoint `none` con semilla 42 permite comparar el efecto de técnicas de augmentación frente a la condición sin aumento, usando las mismas métricas (CER/WER) y el mismo split.
- Reproducibilidad de investigación: al publicarse pesos, licencia MIT y métricas en `results.json`, un equipo puede replicar el pipeline y verificar los valores CER 0,1245 y WER 0,4967.
- Digitalización de manuscritos hebreos en archivos históricos: el modelo puede transcribir imágenes de documentos para su indexación, aunque el WER cercano al 50 % exige revisión humana.
- Preetiquetado asistido en proyectos de transcripción: generar una primera transcripción automática que los revisores corrijan, reduciendo el coste frente a la transcripción manual desde cero.
- Evaluación de arquitecturas TrOCR+CTC en escrituras semíticas: sirve como referencia para comparar variantes de decoder o de preprocesado en hebreo.
- Experimentación académica con recursos limitados: sus 87 M de parámetros y 0,3 GB permiten entrenar y evaluar variantes en una única GPU de consumo, útil para docencia o prototipado.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test HHD Option-B, decodificación greedy, sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER | 0,1245 |
| WER | 0,4967 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,35 GB solo para pesos (87,3 M de parámetros × 4 bytes), más activaciones y memoria del encoder de visión; en la práctica, menos de 2 GB para lotes pequeños.
- En FP16/BF16: aproximadamente 0,18 GB para pesos, con requisitos totales por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650 o superiores con 4 GB.
- Opciones de despliegue: al ser un modelo de visión con pesos safetensors, puede servirse con Transformers (PyTorch) y, potencialmente, con TGI o vLLM si la arquitectura es compatible; no se documenta soporte para llama.cpp u Ollama (orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-none-s42 | 87,3 M | no disponible | HTR hebreo | MIT | HuggingFace |
| TrOCR (variantes base/large de Microsoft) | no disponible en esta ficha | no disponible | HTR multilingüe (principalmente inglés) | MIT | HuggingFace |
| Modelos HTR específicos para hebreo | no disponible | no disponible | HTR hebreo | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El WER de 0,4967 implica que aproximadamente la mitad de las palabras presentan errores; no es apto para transcripción automática sin revisión humana.
- El CER de 0,1245 indica un nivel de error a nivel de carácter considerable para producción.
- Entrenado únicamente en hebreo y sobre un dataset concreto (`hhd-optionb-split`); probable degradación fuera de ese dominio (otras escrituras, caligrafías, soportes o resoluciones).
- Al ser un checkpoint de estudio con semilla fija y sin aumento de datos, su rendimiento puede ser inferior al de variantes con augmentación del mismo estudio.
- Sin modelo de lenguaje en la decodificación, los errores lingüísticos no se corrigen contextualmente.
- Riesgo de sesgo hacia los escritores y estilos presentes en el conjunto de entrenamiento; no se documentan análisis de sesgo.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna; conviene citar el estudio original.
- No se documentan limitaciones de contexto ni de longitud de entrada; se desconoce el tamaño máximo de imagen o secuencia soportado.
- Riesgo de alucinación en el sentido de inserciones o sustituciones de caracteres no presentes en la imagen, inherente a los modelos CTC entrenados con datos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrctc-none-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (https://huggingface.co/cyttic/hmt-trocrctc-none-s42/blob/main/results.json)
- Estudio htr-metrics-transfer: no disponible enlace público en la información proporcionada.
