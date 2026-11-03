# cyttic/hmt-htrvt-geom2-s43

## Resumen

`cyttic/hmt-htrvt-geom2-s43` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) publicado por el autor `cyttic` en HuggingFace. Se trata de un checkpoint de un estudio de aumentación de datos denominado `htr-metrics-transfer`, en el que se entrena una arquitectura `htrvt` con una estrategia de aumentación concreta (`geom2`) y una semilla fija (43). El modelo no es un LLM generativo, sino un sistema de transcripción entrenado con pérdida CTC y decodificación greedy.

El modelo está especializado en hebreo (`he`), lo que lo sitúa en un nicho poco cubierto por las herramientas HTR comerciales habituales, centradas en alfabetos latinos. Su relevancia es fundamentalmente experimental: sirve para reproducir y comparar resultados de aumentación geométrica en HTR dentro del ecosistema del autor, no como un producto listo para producción.

Con 13.821.574 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto, apto para inferencia en hardware modesto. La model card reporta un CER de 0,0597 y un WER de 0,2737 sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `htrvt` (arquitectura de reconocimiento de texto manuscrito, detalles no disponibles) |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como `htrvt`, un sistema de reconocimiento de texto manuscrito entrenado con pérdida CTC (*Connectionist Temporal Classification*), según la etiqueta `ctc` del repositorio. No se detalla en la información disponible la estructura interna (tipo de encoder, número de capas, mecanismo de atención o resolución de entrada). El modelo se entrenó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, lo que indica una partición por escritor para evitar fuga de información entre train y evaluación.

El entrenamiento forma parte de un estudio de aumentación (`hmt` = *htr-metrics-transfer`) con la variante `geom2`, presumiblemente un conjunto de transformaciones geométricas aplicadas a las imágenes de entrada. La semilla 43 fija la reproducibilidad del experimento. La evaluación se realizó sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo, lo que explica un WER relativamente alto (0,2737) pese a un CER bajo (0,0597): los errores de segmentación de palabras penalizan el WER cuando no se aplica un LM de corrección.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo sobre imágenes de documentos.
- Transcripción a nivel de carácter mediante decodificación CTC greedy.
- Salida de secuencia alineada con la imagen de entrada (no genera texto libre ni responde a instrucciones).
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso.
- No dispone de modo *thinking*, visión general, audio ni capacidades multimodales más allá de la lectura de la imagen manuscrita.
- Capacidad multilingüe limitada al hebreo; no se reportan otros idiomas.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe líneas de texto de documentos históricos o administrativos, aprovechando su entrenamiento específico en ese alfabeto y su bajo CER (0,0597) en el conjunto de evaluación del autor.
- Reproducción de experimentos de aumentación: al estar identificado con variante `geom2` y semilla 43, permite replicar el resultado concreto del estudio `htr-metrics-transfer` y compararlo con otras variantes del mismo autor.
- Investigación en HTR con CTC: sirve como baseline compacto (13,8 M de parámetros) para medir el efecto de estrategias de aumentación geométrica en la tasa de error.
- Preprocesado de corpus hebreos para NLP: la transcripción automática de manuscritos puede alimentar pipelines posteriores de búsqueda, indexación o análisis lingüístico.
- Evaluación de infraestructura de inferencia ligera: su tamaño reducido (0,1 GB) permite desplegarlo en entornos con recursos limitados para pruebas de latencia y throughput.
- Docencia y formación: útil como ejemplo didáctico de un pipeline HTR completo (imagen a secuencia con CTC) en un idioma minoritario.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Decodificacion | LM | CER | WER |
|---|---|---|---|---|
| HHD Option-B test | Greedy | No | 0,0597 | 0,2737 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a un modelo HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (13,8 M de parámetros), y del orden de cientos de MB con cuantización, aunque no se especifican formatos de cuantización disponibles.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo CTC de HTR, requeriría un servidor de inferencia personalizado (por ejemplo, con PyTorch y safetensors).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto | CER reportado | Licencia |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-geom2-s43 | 13,8 M | hebreo | no disponible | 0,0597 (HHD Option-B) | MIT |
| Otros checkpoints `hmt-htrvt-*` del mismo autor | no disponible | hebreo | no disponible | no disponible | MIT |
| Modelos HTR multilingues genericos (p. ej. Kraken, TrOCR) | variable | varios | no aplica | no disponible para hebreo | variable |

No se dispone de datos comparativos publicados con alternativas de la misma categoría en la información proporcionada. La comparación más directa posible es con las demás variantes de aumentación y semillas del propio estudio `htr-metrics-transfer`, cuyos resultados no se detallan aquí.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo; no se ha validado en otros alfabetos ni en escritura impresa.
- El WER de 0,2737 indica una segmentación de palabras deficiente sin modelo de lenguaje; en producción conviene acoplar un LM o un postprocesado de segmentación.
- Riesgo de alucinación y de sustituciones a nivel de carácter en manuscritos con caligrafías, ruido o resoluciones distintas a las del corpus de entrenamiento.
- El modelo se entrenó excluyendo los escritores de dev del split, lo que reduce el riesgo de sobreajuste por escritor, pero no garantiza generalización a escritores nuevos no representados.
- No se documentan sesgos específicos, aunque un corpus de un único idioma y dominio puede degradar el rendimiento en documentos con vocabulario o estilos alejados del conjunto HHD.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia y licencia del corpus `cyttic/hhd-optionb-split` antes de un despliegue comercial.
- No hay información sobre cuantizaciones, contexto máximo ni pipeline de HuggingFace, lo que complica la integración directa con herramientas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-htrvt-geom2-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (https://huggingface.co/cyttic/hmt-htrvt-geom2-s43/blob/main/results.json)
- Perfil del autor: https://huggingface.co/cyttic
