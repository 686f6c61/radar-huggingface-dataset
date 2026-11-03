# cyttic/hmt-htrvt-elastic1-s43

## Resumen

`cyttic/hmt-htrvt-elastic1-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic, aparentemente vinculado al ámbito académico. Se trata de un modelo de pequeño tamaño (13,8 millones de parámetros) entrenado con una cabeza CTC sobre un transformer para transcribir texto manuscrito en hebreo (`he`). No es un modelo de lenguaje generativo: su función es la transcripción carácter a carácter de imágenes de escritura manual.

El modelo forma parte de un estudio de aumentación de datos denominado `htr-metrics-transfer`, donde la variante `htrvt` corresponde a la arquitectura base y `elastic1` a una estrategia concreta de aumentación elástica de las imágenes de entrada. La semilla de entrenamiento es la 43, lo que indica que forma parte de una batería de réplicas experimentales destinadas a medir la variabilidad y la transferencia de métricas entre configuraciones.

Es relevante en el contexto de la investigación en HTR para lenguas con recursos limitados, como el hebreo manuscrito, donde los modelos disponibles públicamente son escasos. Su licencia MIT y su reducido tamaño (0,1 GB) lo hacen fácilmente reproducible y desplegable, aunque su especialización es muy estrecha y su rendimiento debe interpretarse dentro del conjunto de test concreto utilizado por los autores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza CTC (según tags `htr`, `ctc`; detalles internos no disponibles) |
| Parametros totales | 13.821.574 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | Hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un modelo para HTR con decodificación CTC (Connectionist Temporal Classification), etiquetado como `htrvt`. La arquitectura interna exacta (número de capas, dimensión oculta, mecanismo de atención, posible uso de extractores convolucionales previos) no está documentada en la model card. El tamaño de 13,8 millones de parámetros sitúa al modelo en la categoría de modelos ligeros, adecuados para inferencia en CPU o GPU de gama baja.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo. La variante `elastic1` corresponde a una aumentación de datos de tipo elástico aplicada a las imágenes manuscritas, y la semilla 43 identifica la réplica. La evaluación se realizó sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,0622 y WER 0,2842. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de ajuste adicionales.

## Capacidades

- Transcripción de texto manuscrito en hebreo a partir de imágenes, mediante decodificación CTC.
- Salida a nivel de carácter (el CER es la métrica principal reportada).
- Funcionamiento sin modelo de lenguaje externo (decodificación greedy pura).
- Entrenado con aumentación elástica de imágenes, lo que puede aportar robustez frente a deformaciones geométricas locales.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo de texto ni multimodal en el sentido amplio: no procesa lenguaje natural como entrada.
- No se documentan capacidades multilingües más allá del hebreo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir páginas escaneadas o fotografías de documentos históricos o administrativos, generando texto plano alineado carácter a carácter gracias a la cabeza CTC.
- Procesamiento por lotes de colecciones documentales: su reducido tamaño (13,8 M de parámetros, repo de 0,1 GB) permite ejecutar la inferencia en CPU o en GPUs modestas, facilitando el procesado masivo sin infraestructura dedicada.
- Investigación en aumentación de datos para HTR: sirve como punto de comparación reproducible (semilla 43, aumentación `elastic1`) frente a otras variantes del estudio `htr-metrics-transfer`.
- Reproducción de experimentos académicos: al estar publicado con licencia MIT y pesos en safetensors, permite replicar las métricas reportadas (CER 0,0622, WER 0,2842) sobre el test HHD Option-B.
- Preprocesado para pipelines de búsqueda documental: la transcripción generada puede indexarse para búsqueda por texto en archivos manuscritos hebreos.
- Evaluación de robustez frente a deformaciones: al haberse entrenado con aumentación elástica, es adecuado para analizar el comportamiento del reconocimiento ante manuscritos con trazos irregulares o deformados.
- Base para ajuste fino en dominios específicos: su tamaño reducido y licencia permisiva permiten reentrenarlo o afinarlo sobre colecciones manuscritas propias con recursos limitados.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion | Configuracion |
|---|---|---|---|
| CER | 0,0622 | HHD Option-B test | Greedy, sin LM |
| WER | 0,2842 | HHD Option-B test | Greedy, sin LM |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales sobre otros conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (13,8 M de parámetros, aproximadamente 55 MB en fp32 y 28 MB en fp16), más el coste de activaciones y del extractor de imágenes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPUs de consumo (GTX 1650, RTX 3050, RTX 4060) e incluso en CPU para inferencia por lotes moderados.
- Opciones de despliegue: al ser un modelo CTC especializado, no es compatible directamente con vLLM, TGI u Ollama (orientados a modelos de lenguaje). Requiere un runtime de inferencia propio del proyecto o un script de PyTorch con los pesos safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye referencias a otros modelos HTR comparables ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- Especialización muy estrecha: solo transcribe hebreo manuscrito; no es un modelo de lenguaje y no debe usarse para generación de texto.
- El WER de 0,2842 indica una tasa de error por palabra elevada, adecuada para investigación pero potencialmente insuficiente para producción sin revisión humana.
- Las métricas reportadas se obtuvieron con decodificación greedy y sin modelo de lenguaje; el rendimiento puede variar sustancialmente con otras configuraciones o sobre otros dominios de escritura.
- Los resultados dependen del conjunto HHD Option-B y de la partición por escritores; la generalización a nuevos escritores o estilos no está documentada.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus concreto puede presentar peor rendimiento en estilos, épocas o caligrafías no representadas.
- Riesgo de alucinación a nivel de carácter: la decodificación CTC puede producir sustituciones u omisiones en trazos ambiguos.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía por parte de los autores.
- No se documentan requisitos de preprocesado de imagen (resolución, normalización), lo que puede afectar a la reproducibilidad de las métricas.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-elastic1-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la información disponible papers, blogs, repositorios o demos adicionales.
