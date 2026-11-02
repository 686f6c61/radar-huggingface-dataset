# cyttic/hmt-trocrsmall-photo4-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-photo4-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo CYTTIC. Se trata de un modelo pequeño, de aproximadamente 22,4 millones de parámetros, entrenado con una cabeza CTC sobre un backbone de tipo TrOCR-small. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalúa cómo distintas estrategias de aumento fotográfico afectan al rendimiento del reconocimiento sobre textos manuscritos históricos.

El modelo se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, y se evalúa sobre el test HHD Option-B con decodificación voraz y sin modelo de lenguaje. En esa configuración alcanza un CER de 0,1904 y un WER de 0,6700, métricas que reflejan la dificultad del dominio (manuscrito histórico en hebreo) y la ausencia de post-procesado lingüístico.

Su relevancia es acotada pero clara: sirve como referencia reproducible dentro de una familia de experimentos controlados (variantes de aumento `photo4`, semilla 42) y como punto de partida para quien investigue HTR en hebreo con recursos limitados. No es un modelo de propósito general ni un asistente conversacional: es un componente especializado de transcripción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TrOCR-small con cabeza CTC (transformer encoder-decoder, según nomenclatura del autor) |
| Parámetros totales | 22.421.004 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | HTR (reconocimiento de texto manuscrito) con CTC |
| Tamaño del repositorio | 0,1 GB |
| Semilla de entrenamiento | 42 |
| Aumento de datos | `photo4` |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR en su variante *small*: un encoder de visión tipo transformer procesa la imagen de la línea de texto manuscrito y una cabeza de decodificación CTC produce la secuencia de caracteres. La elección de CTC frente a decodificación autorregresiva implica un alineamiento monótono entre frames visuales y caracteres, lo que simplifica el entrenamiento y acelera la inferencia, a costa de no modelar dependencias lingüísticas de largo alcance sin un modelo de lenguaje externo.

El entrenamiento se realizó sobre el split de train de `cyttic/hhd-optionb-split`, eliminando los escritores reservados para desarrollo, y la evaluación se hizo sobre el test HHD Option-B con decodificación voraz y sin LM. La variable experimental es el aumento `photo4`, una transformación de tipo fotográfico aplicada a las imágenes de entrenamiento. No se dispone de información sobre el número de tokens, la composición exacta del dataset ni sobre el uso de RLHF o DPO (no aplicables en un modelo CTC de este tipo).

## Capacidades

- Transcripción de texto manuscrito en hebreo a partir de imágenes de líneas de texto.
- Decodificación CTC voraz, sin necesidad de modelo de lenguaje auxiliar.
- Entrenamiento y evaluación reproducibles dentro de un estudio controlado de aumentos de datos.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo *thinking*, visión general, audio ni multimodalidad más allá de la entrada de imagen para HTR.
- Capacidad multilingüe limitada al hebreo (`he`).

## Casos de uso

- Transcripción de manuscritos históricos en hebreo: el modelo convierte imágenes de líneas manuscritas en texto plano, adecuado para digitalización de archivos con escritura hebrea histórica, aunque con un CER de 0,1904 que exige revisión humana.
- Reproducción de experimentos de aumento de datos: sirve como referencia fija (semilla 42, aumento `photo4`) para comparar el efecto de otras transformaciones fotográficas en la misma arquitectura y dataset.
- Baseline en investigación de HTR: al ser pequeño (22,4 M de parámetros) y de licencia MIT, es útil como punto de partida para *fine-tuning* sobre nuevos corpus hebreos.
- Evaluación de pipelines de decodificación: permite medir el impacto de añadir un modelo de lenguaje o de cambiar de decodificación voraz a *beam search* sobre las mismas predicciones CTC.
- Docencia y prototipado: su tamaño reducido (0,1 GB) facilita desplegarlo en entornos con recursos limitados para demostraciones de HTR.
- Integración en flujos de pre-anotación: puede generar transcripciones iniciales que luego se corrigen manualmente, reduciendo el esfuerzo de etiquetado en proyectos de corpus manuscritos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test HHD Option-B, decodificación voraz y sin modelo de lenguaje:

| Métrica | Valor |
|---|---|
| CER | 0,1904 |
| WER | 0,6700 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa, dado el tamaño de 22,4 M de parámetros y el repositorio de 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060 o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna (GTX 1650, RTX 3050, RTX 4090, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch con la clase TrOCR de Hugging Face Transformers y la cabeza CTC; no se han publicado variantes GGUF ni integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cyttic/hmt-trocrsmall-photo4-s42` | 22,4 M | no disponible | HTR hebreo | MIT | Hugging Face |
| TrOCR-small (Microsoft) | ~62 M | no aplica | HTR genérico | MIT | Hugging Face |
| Modelos HTR de `cyttic` (otras variantes del estudio) | ~22,4 M | no disponible | HTR hebreo | MIT | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El WER de 0,6700 es elevado: sin modelo de lenguaje, el modelo comete muchos errores a nivel de palabra, por lo que no es apto para transcripción automática sin revisión.
- El CER de 0,1904 implica que aproximadamente uno de cada cinco caracteres es incorrecto en el conjunto de evaluación.
- Entrenado únicamente en hebreo y sobre un dataset específico (`hhd-optionb-split`); el rendimiento fuera de ese dominio (otras manos, épocas o estilos) no está documentado.
- Riesgo de alucinación y de sustituciones sistemáticas en caracteres visualmente similares del alfabeto hebreo.
- Sesgos derivados de los escritores y del corpus de entrenamiento; no se han publicado análisis de sesgo.
- La licencia MIT permite uso comercial, pero la ausencia de garantías y las métricas limitadas desaconsejan su uso en producción sin validación previa.
- No se han publicado datos sobre cuantización, contexto máximo ni latencia, lo que dificulta planificar despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrsmall-photo4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo
- Repositorio del grupo CYTTIC: no disponible en la información proporcionada
- Paper o blog del estudio `htr-metrics-transfer`: no disponible en la información proporcionada
