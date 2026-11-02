# cyttic/hmt-trocrsmall-photo1-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-photo1-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo CYTTIC. Se trata de un modelo pequeño, con 22,4 millones de parámetros, entrenado con una arquitectura de tipo CTC (*Connectionist Temporal Classification*) para transcribir imágenes de escritura manual a texto. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalúa el impacto de distintas transformaciones de imagen sobre el rendimiento final de la transcripción.

El modelo se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y se evalúa sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados publicados son un CER (*Character Error Rate*) de 0,2233 y un WER (*Word Error Rate*) de 0,7383. La variante concreta corresponde al aumento de datos `photo1` y a la semilla 42.

Su relevancia es acotada pero concreta: sirve como punto de referencia reproducible dentro de una familia de experimentos controlados sobre HTR en hebreo, un idioma con relativamente pocos recursos públicos en esta tarea. No está pensado como modelo de propósito general, sino como artefacto de investigación para comparar estrategias de aumento de datos y su transferencia a métricas de error.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (reconocimiento de texto manuscrito, HTR); detalles internos no disponibles |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen a texto, no de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo emplea una cabeza de entrenamiento CTC, habitual en HTR para alinear secuencias de caracteres con imágenes sin segmentación explícita. No se detalla la arquitectura del codificador visual (si es una CNN, un transformer o un híbrido), ni el número de capas, dimensión oculta o mecanismo de atención. El tamaño de 22,4 millones de parámetros sitúa al modelo en la gama muy pequeña, adecuada para inferencia en CPU o GPU de gama baja.

El entrenamiento se realizó sobre `cyttic/hhd-optionb-split`, restando los escritores asignados al conjunto de desarrollo, lo que evita fuga de información entre entrenamiento y evaluación. La evaluación se hace sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo. La variante `photo1` corresponde a una transformación de aumento de datos de tipo fotográfico, y la semilla 42 fija la reproducibilidad del experimento. No se especifican el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales.

## Capacidades

- Transcripción de imágenes de texto manuscrito en hebreo a texto digital.
- Reconocimiento a nivel de carácter mediante decodificación CTC greedy.
- Entrenamiento y evaluación orientados a métricas CER y WER, sin modelo de lenguaje de rescoring.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo según la etiqueta de idioma del repositorio.
- No se documentan modos especiales como *thinking mode*, visión general, audio u otras modalidades.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir páginas escaneadas para su indexación y búsqueda, aprovechando su entrenamiento específico en HTR hebreo.
- Reproducción de experimentos de aumento de datos: al estar identificado por variante (`photo1`) y semilla (42), sirve para comparar el efecto de transformaciones fotográficas frente a otras variantes de la misma familia.
- Evaluación comparativa de arquitecturas CTC pequeñas: con 22,4 M de parámetros, permite medir el coste/beneficio de modelos ligeros frente a alternativas mayores en la misma tarea.
- Procesamiento por lotes en entornos con recursos limitados: su tamaño reducido facilita el despliegue en CPU o GPU consumer para volcados masivos de documentos.
- Línea base para *fine-tuning* en dominios específicos: puede servir como punto de partida para adaptar HTR hebreo a manuscritos de un archivo o colección concreta.
- Investigación en métricas de transferencia: el propio nombre del estudio (`htr-metrics-transfer`) sugiere su uso para analizar cómo se transfieren las mejoras de aumento de datos a CER y WER.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,2233 | Test HHD Option-B, greedy, sin LM |
| WER | 0,7383 | Test HHD Option-B, greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,4 M de parámetros en fp32 el peso ocupa aproximadamente 90 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en modelos como GTX 1650, RTX 3050, RTX 4060 o superiores, y previsiblemente en CPU.
- Opciones de despliegue: no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo HTR con CTC, requeriría un *pipeline* personalizado de preprocesado de imagen y decodificación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de la misma familia ni resultados comparativos que permitan establecer una tabla fiable.

## Limitaciones y advertencias

- El WER de 0,7383 es elevado, lo que indica que la transcripción a nivel de palabra es poco fiable sin un modelo de lenguaje de rescoring.
- El CER de 0,2233 implica que aproximadamente una de cada cinco letras se transcribe incorrectamente en el conjunto de evaluación.
- El modelo está entrenado únicamente en hebreo; no se ha validado su comportamiento en otros idiomas.
- Los resultados provienen de un único conjunto de test (HHD Option-B) y de una única semilla; no se documenta variabilidad entre ejecuciones.
- No se detalla la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos de dominio o de estilo de escritura.
- Riesgo de alucinación textual inherente a los modelos CTC: pueden producir secuencias plausibles pero incorrectas en imágenes ruidosas o con escritura atípica.
- La licencia MIT permite uso comercial, pero al ser un artefacto de investigación sin validación en producción, se recomienda evaluarlo en el dominio objetivo antes de desplegarlo.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita su uso directo en *runtimes* que esperan GGUF u otros formatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-photo1-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
