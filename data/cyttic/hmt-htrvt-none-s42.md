# cyttic/hmt-htrvt-none-s42

## Resumen

`cyttic/hmt-htrvt-none-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un checkpoint concreto dentro de un estudio de aumentación de datos denominado `htr-metrics-transfer` (oleada 1), en el que se entrenan distintas variantes del modelo base `htrvt` con diferentes estrategias de *augmentation* y semillas. En este caso, la variante corresponde a `augmentation = none` y `seed = 42`, es decir, el modelo de referencia sin aumentación de datos.

El modelo emplea una arquitectura CTC (*Connectionist Temporal Classification*) para alinear secuencias de imagen de texto manuscrito con transcripciones, y está entrenado sobre el conjunto `cyttic/hhd-optionb-split` (partición de entrenamiento excluyendo los escritores de desarrollo). El idioma de trabajo es hebreo (`he`), lo que lo sitúa en un nicho específico: HTR para escritura manuscrita hebrea, un dominio con menos recursos que el inglés o el castellano.

Con 13.821.574 parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto orientado a inferencia ligera. Su relevancia es fundamentalmente metodológica: sirve como punto de control base para comparar el efecto de distintas técnicas de aumentación sobre métricas de reconocimiento (CER y WER) en hebreo manuscrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) para HTR; backbone no especificado en la informacion disponible |
| Parametros totales | 13.821.574 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de reconocimiento de imagen, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un reconocedor HTR entrenado con pérdida CTC, una elección habitual en reconocimiento de texto manuscrito porque evita la necesidad de alineaciones carácter a carácter entre la imagen y la transcripción. La model card no detalla el backbone visual (CNN, transformer o híbrido), la resolución de entrada ni la profundidad de la red; únicamente indica la familia `htrvt` y el uso de decodificación *greedy* sin modelo de lenguaje en la evaluación.

El entrenamiento se realizó sobre la partición de *train* de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, lo que sugiere una separación por escritor para evitar fuga de información entre splits. La variante documentada aquí no aplica aumentación de datos (`none`) y usa la semilla 42. No se especifican en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de líneas o páginas.
- Decodificación CTC con alineamiento implícito, sin necesidad de segmentación previa por caracteres.
- Evaluación con decodificación *greedy* sin modelo de lenguaje externo (según la model card).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multimodalidad más allá de la entrada de imagen para HTR.
- No se documenta soporte multilingüe: el único idioma declarado es el hebreo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos escaneados (cartas, registros, manuscritos) a texto plano, aprovechando su entrenamiento específico en escritura manuscrita hebrea.
- Creación de corpus etiquetados para investigación en PLN hebreo: al ser un modelo compacto y con licencia MIT, puede usarse para preanotar grandes volúmenes de imágenes que luego se revisan manualmente, reduciendo el coste de anotación.
- Línea base en estudios de aumentación de datos: su rol declarado es servir de referencia (`augmentation = none`) frente a variantes con aumentación, útil para equipos que investigan técnicas de *data augmentation* en HTR.
- Preservación de patrimonio documental: digitalización de colecciones manuscritas hebreas en bibliotecas y archivos, con revisión humana posterior dada la tasa de error documentada.
- Integración en pipelines de OCR/HTR con separación por escritor: el split por escritores del dataset permite evaluar la generalización a escritores no vistos, relevante para desplegar el modelo en colecciones con autores nuevos.
- Experimentación académica reproducible: al fijar semilla (42) y configuración (`none`), facilita la replicación de resultados y la comparación controlada con otras variantes de la misma familia.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el test HHD Option-B, decodificación *greedy* sin modelo de lenguaje:

| Metrica | Valor |
|---|---|
| CER (Character Error Rate) | 0,0633 |
| WER (Word Error Rate) | 0,2858 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estándar no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 13,8 M de parámetros, los pesos en FP32 ocupan aproximadamente 55 MB y en FP16 unos 28 MB. La VRAM real dependerá del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media (RTX 3060, T4) cubren holgadamente la inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer con suficiente memoria para el batch de imágenes; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: al ser pesos safetensors con arquitectura CTC no estándar, no se documenta soporte en vLLM, llama.cpp, Ollama o TGI; el despliegue requeriría el código de inferencia del autor (no incluido en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de HTR para hebreo (parámetros, contexto, rendimiento o licencia). Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-none-s42 | 13,8 M | no aplica | CER 0,0633 / WER 0,2858 (HHD Option-B) | MIT | Hugging Face |
| Alternativas HTR hebreo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo manuscrito; no es un modelo de propósito general ni soporta otros idiomas.
- La tasa de error a nivel de palabra (WER 0,2858) es elevada para producción sin revisión humana; aproximadamente una de cada tres o cuatro palabras puede contener errores en el conjunto de test reportado.
- El rendimiento se ha medido con decodificación *greedy* sin modelo de lenguaje; añadir un LM podría alterar (previsiblemente mejorar) los resultados, pero no se documenta.
- Riesgo de degradación ante dominios, escritores o estilos de escritura distintos de los del dataset `cyttic/hhd-optionb-split`; la generalización fuera de ese corpus no está cuantificada.
- No se documentan sesgos específicos, pero al entrenarse sobre un corpus concreto puede heredar las particularidades de sus escritores y fuentes.
- Licencia MIT: permite uso comercial y modificación con atribución; aun así, conviene verificar las condiciones del dataset de entrenamiento, no detalladas en la información disponible.
- La model card es mínima y no incluye detalles de arquitectura, preprocesado de imagen ni instrucciones de uso, lo que dificulta la reproducción sin el código del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-none-s42
- Dataset de entrenamiento (referenciado): https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados (`results.json`): referenciado en la model card, no enlazado en la información disponible
- Paper, blog o repositorio del estudio `htr-metrics-transfer`: no disponible
