# cyttic/hmt-trocrctc-geom2-s43

## Resumen

`cyttic/hmt-trocrctc-geom2-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el usuario cyttic dentro de un estudio de ablación sobre aumento de datos denominado `htr-metrics-transfer`. El modelo se basa en la arquitectura TrOCR combinada con una cabeza CTC (*Connectionist Temporal Classification*) y ha sido entrenado con la variante de aumento geométrico `geom2` y la semilla 43. Su propósito es transcribir imágenes de texto manuscrito en hebreo (`he`), un idioma con escasa representación en modelos HTR públicos.

El modelo cuenta con 87.279.756 parámetros en formato safetensors y un repositorio de 0,3 GB, lo que lo sitúa en un rango de tamaño medio que permite despliegue en hardware modesto. Se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integración en pipelines de digitalización documental. Forma parte de una familia de variantes (semillas 42, 43, etc.) que comparten configuración y solo difieren en la semilla de entrenamiento, lo que lo convierte en una pieza de un experimento reproducible más que en un producto final.

Su relevancia actual radica en dos factores: por un lado, la escasez de modelos HTR específicos para hebreo manuscrito; por otro, la documentación explícita de métricas (CER 0,0759 y WER 0,3357 sobre el conjunto de test HHD Option-B) que permite evaluar su idoneidad antes de integrarlo. No obstante, se trata de un modelo de investigación con cero descargas y sin pipeline declarado en Hugging Face, por lo que debe tratarse con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con cabeza CTC (transformer encoder-decoder + CTC) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la familia TrOCR (*Transformer-based Optical Character Recognition*), que combina un encoder de visión tipo ViT con un decoder transformer para generación de secuencias. En esta variante, la salida se gestiona mediante una cabeza CTC, lo que permite alineamiento directo entre frames de imagen y caracteres sin necesidad de un decoder autorregresivo en el momento de la inferencia. La decodificación reportada es *greedy* y sin modelo de lenguaje externo, lo que simplifica el despliegue pero limita la corrección contextual de errores.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo (*dev writers*), con el aumento de datos `geom2` (transformaciones geométricas) y semilla 43. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO, algo esperable en un modelo de OCR. La innovación principal es metodológica: el estudio `htr-metrics-transfer` evalúa cómo se transfieren las métricas entre variantes de aumento y semillas, y este checkpoint es una de las réplicas de dicho experimento.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de documentos.
- Transcripción a nivel de carácter y palabra mediante decodificación CTC greedy.
- Entrenado específicamente para el dominio de escritura manuscrita histórica o documental (dataset HHD).
- No soporta tool calling ni function calling (no es un modelo de lenguaje conversacional).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo; no se reportan otros idiomas.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades multimodales más allá de la lectura de imagen a texto.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe imágenes de documentos escaneados a texto plano, adecuado para fondos documentales históricos donde no existen modelos HTR específicos para este idioma.
- Extracción de texto en pipelines de preservación digital: integrado como etapa OCR/HTR tras la segmentación de líneas, permite convertir lotes de imágenes en texto indexable para bibliotecas digitales.
- Investigación en HTR comparada: sirve como *baseline* reproducible (semilla 43, aumento `geom2`) para estudios de transferencia de métricas entre configuraciones de aumento de datos.
- Anotación asistida de corpus manuscritos: genera transcripciones preliminares que revisores humanos corrigen, reduciendo el coste de creación de datasets etiquetados en hebreo.
- Análisis de documentos históricos con CER bajo: con un CER de 0,0759 en test, es viable para tareas de búsqueda por palabra clave donde pequeños errores de carácter son tolerables.
- Reproducción de experimentos académicos: al estar bajo licencia MIT y con pesos safetensors, puede reentrenarse o afinarse sobre nuevos conjuntos de escritores para estudiar la generalización entre dominios.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| CER | 0,0759 | HHD Option-B test (greedy, sin LM) |
| WER | 0,3357 | HHD Option-B test (greedy, sin LM) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 87,3 M de parámetros, en fp32 ocuparía aproximadamente 350 MB de pesos, y en fp16 unos 175 MB, más el coste del encoder de visión y las activaciones.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia en fp16; se recomiendan GTX 1660, RTX 3060, RTX 4090, A100 o H100 según volumen de lote.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas.
- Opciones de despliegue: no se especifican en la model card; al ser safetensors, requiere cargarlo con PyTorch/Transformers o un framework compatible. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (HHD Option-B test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-geom2-s43 | 87,3 M | no disponible | 0,0759 | MIT | Hugging Face |
| cyttic/hmt-trocrctc-geom2-s42 | no disponible | no disponible | 0,0747 | MIT | Hugging Face |
| cyttic/hmt-htrvt-geom2-s43 | 13,8 M | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a variantes de la misma familia experimental; no se dispone de información sobre modelos HTR de hebreo de otros autores para establecer una comparación externa.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y sin pipeline declarado; no hay evidencia de uso en producción.
- El WER de 0,3357 es elevado en comparación con el CER, lo que indica errores frecuentes a nivel de palabra completa, probablemente por segmentación o palabras largas.
- La decodificación es greedy y sin modelo de lenguaje, por lo que no se corrigen errores contextuales.
- Entrenado exclusivamente en hebreo y sobre un dataset concreto (`hhd-optionb-split`); la generalización a otros escritores, dominios o estilos manuscritos no está documentada.
- Riesgo de alucinación inherente a los modelos generativos: puede producir caracteres o palabras plausibles pero incorrectos en imágenes ambiguas.
- Sesgos de dominio: al excluir los escritores de dev del entrenamiento, el rendimiento en escritores no vistos puede diferir del reportado.
- Licencia MIT permite uso comercial, pero al ser un modelo experimental sin garantías, se recomienda validación exhaustiva antes de integrarlo en flujos críticos.
- No se documentan requisitos de hardware, cuantizaciones soportadas ni tiempos de inferencia, lo que dificulta la planificación de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-geom2-s43
- Variante semilla 42: https://huggingface.co/cyttic/hmt-trocrctc-geom2-s42
- Variante HTRVT: https://huggingface.co/cyttic/hmt-htrvt-geom2-s43
