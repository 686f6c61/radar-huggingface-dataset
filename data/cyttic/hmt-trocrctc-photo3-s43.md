# cyttic/hmt-trocrctc-photo3-s43

## Resumen

`cyttic/hmt-trocrctc-photo3-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) desarrollado por el usuario `cyttic` y publicado en Hugging Face bajo licencia MIT. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se entrenan distintas variantes de un mismo modelo base (`trocrctc`) con diferentes estrategias de aumento de imagen y semillas aleatorias; esta variante concreta corresponde al aumento `photo3` con semilla 43.

El modelo tiene 87.279.756 parámetros (datos reales de los pesos en safetensors) y se distribuye en un repositorio de 0,3 GB. Está especializado en hebreo (`he`) y emplea una arquitectura de tipo TrOCR con decodificación CTC, según indican sus etiquetas (`htr`, `ctc`). No es un modelo generativo de propósito general, sino un componente especializado para transcribir líneas de texto manuscrito en hebreo.

Su relevancia es acotada pero clara: sirve como referencia reproducible para investigar cómo el aumento de imagen afecta a las métricas de HTR y cómo se transfieren entre conjuntos de datos. El autor reporta en la model card un CER de 0,1176 y un WER de 0,4748 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR con decodificacion CTC (segun tags del modelo) |
| Parametros totales | 87.279.756 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se infiere de las etiquetas y del nombre del modelo: se trata de una variante `trocrctc`, es decir, un modelo basado en TrOCR (encoder de visión tipo ViT más decoder transformer) con cabeza de decodificación CTC en lugar de decodificación autorregresiva. El nombre `photo3` indica la estrategia de aumento de imagen aplicada, y `s43` la semilla aleatoria empleada. No se dispone de más detalles sobre la composición exacta del encoder, el número de capas ni la resolución de entrada.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y la evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. El autor remite a `results.json` para los detalles completos del experimento. No se indica el número de tokens ni de muestras de entrenamiento, ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo a nivel de línea o imagen.
- Decodificación CTC con salida greedy, sin modelo de lenguaje externo.
- Entrenamiento y evaluación orientados a medir la transferencia de métricas bajo distintos aumentos de imagen.
- No dispone de tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No soporta visión general (descripción de imágenes), audio ni modo *thinking*.
- Capacidad multilingüe limitada al hebreo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas de texto manuscrito procedentes de colecciones históricas o administrativas, adecuado por su especialización y su licencia MIT.
- Reproducción de experimentos de aumento de datos: sirve como punto de comparación frente a las variantes `none` y `htrvt` del mismo estudio para medir el efecto de `photo3` sobre CER y WER.
- Evaluación de transferencia de métricas entre dominios: al haberse entrenado excluyendo los escritores de desarrollo, permite analizar la generalización a escritores no vistos.
- Componente en pipelines de OCR documental: puede integrarse como etapa de reconocimiento tras un detector de líneas de texto en flujos de digitalización.
- Investigación en HTR con decodificación CTC: útil para comparar decodificación CTC frente a decodificación autorregresiva en tareas de transcripción manuscrita.
- Generación de transcripciones de referencia para anotación asistida: con un CER de 0,1176 sobre el test reportado, puede emplearse como preanotador en herramientas de etiquetado humano.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test | CER | 0,1176 |
| HHD Option-B test | WER | 0,4748 |

Condiciones: decodificación greedy, sin modelo de lenguaje. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB solo para pesos, más activaciones; en la práctica cabe en cualquier GPU consumer con 4 GB o más.
- VRAM estimada en fp16/bf16: aproximadamente 0,18 GB para pesos.
- GPU recomendadas: cualquier GPU moderna; para lotes grandes, A100 o H100 permiten mayor throughput, aunque el tamaño del modelo no las hace necesarias.
- Cabe en GPU consumer: sí, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo safetensors con arquitectura tipo TrOCR/CTC, requiere un entorno que soporte dicha arquitectura (por ejemplo, Transformers con una clase compatible o código propio del autor). No se confirma soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrctc-photo3-s43 | 87,3 M | no disponible | HTR hebreo (CTC) | MIT | Hugging Face |
| cyttic/hmt-trocrctc-none-s43 | 87,3 M | no disponible | HTR hebreo (CTC), sin aumento | MIT | Hugging Face |
| cyttic/hmt-htrvt-none-s43 | 13,8 M | no disponible | HTR hebreo (variante HTR-VT) | MIT | Hugging Face |

Las tres variantes pertenecen al mismo estudio del autor. La comparación de rendimiento entre ellas no está disponible en la información proporcionada, salvo el CER/WER de esta variante.

## Limitaciones y advertencias

- Modelo altamente especializado: solo reconoce texto manuscrito en hebreo; no es apto para otros idiomas ni para tareas generativas generales.
- El WER reportado (0,4748) es elevado en términos absolutos, lo que indica que la transcripción a nivel de palabra requiere revisión humana en producción.
- Los resultados se obtuvieron con decodificación greedy y sin modelo de lenguaje; el rendimiento puede variar con otras estrategias de decodificación.
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto concreto de escritores, puede generalizar peor a estilos caligráficos no representados.
- Riesgo de alucinación inherente a los modelos de secuencia: puede producir caracteres o palabras plausibles pero incorrectos en fragmentos ambiguos.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones del conjunto de datos de entrenamiento original.
- No se dispone de información sobre cuantizaciones, contexto máximo ni latencia, lo que dificulta planificar su despliegue en producción sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrctc-photo3-s43
- Variante sin aumento: https://huggingface.co/cyttic/hmt-trocrctc-none-s43
- Variante HTR-VT: https://huggingface.co/cyttic/hmt-htrvt-none-s43
