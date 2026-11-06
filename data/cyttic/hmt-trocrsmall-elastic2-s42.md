# cyttic/hmt-trocrsmall-elastic2-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-elastic2-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo CYTTIC. Se trata de un modelo pequeño, de 22,4 millones de parámetros, entrenado con una cabeza CTC sobre una arquitectura de tipo red neuronal convolucional y/o recurrente (la model card no detalla la arquitectura interna). Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se evalúa el impacto de distintas técnicas de aumentación sobre el rendimiento de reconocimiento.

La variante concreta corresponde a la aumentación `elastic2` con semilla 42, aplicada sobre el modelo base `trocrsmall`. Está entrenado sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y evaluado sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Los resultados reportados son un CER de 0,1511 y un WER de 0,5794.

El modelo es relevante en el contexto de la investigación en HTR de bajo coste computacional: demuestra que modelos de apenas 22 millones de parámetros pueden alcanzar errores de carácter en torno al 15 % en hebreo manuscrito, lo que lo hace útil como referencia reproducible para estudiar el efecto de la aumentación de datos. Su licencia MIT y su reducido tamaño facilitan la experimentación y la integración en pipelines de digitalización documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (cabecera CTC; modelo base `trocrsmall`) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo más allá de indicar que emplea una cabeza de decodificación CTC (*Connectionist Temporal Classification*), habitual en HTR para alinear secuencias de imagen con secuencias de texto sin segmentación previa. El modelo base se denomina `trocrsmall`, y esta variante incorpora la aumentación `elastic2` durante el entrenamiento. El tamaño total es de 22.421.004 parámetros, lo que sitúa al modelo en la gama ligera.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores que componen el conjunto de desarrollo, con el objetivo de evitar fuga de información entre escritores. La evaluación se llevó a cabo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje externo, obteniendo CER 0,1511 y WER 0,5794. No se detalla en la información disponible el número de tokens o muestras de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en HTR).

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo, mediante decodificación CTC.
- Transcripción de imágenes de líneas o regiones de texto manuscrito a secuencia de caracteres.
- Entrenamiento y evaluación reproducibles como parte de un estudio de aumentación de datos (`elastic2`, semilla 42).
- Evaluación sin modelo de lenguaje: salida directa del decodificador greedy.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo *thinking*.
- Capacidad multilingüe limitada al hebreo según el campo `language` de la model card.

## Casos de uso

- Digitalización de documentos manuscritos en hebreo: el modelo transcribe imágenes de texto manuscrito a texto digital, adecuado para archivos históricos o administrativos en hebreo.
- Investigación en aumentación de datos para HTR: sirve como punto de comparación reproducible (misma semilla, misma aumentación) frente a otras variantes del estudio `htr-metrics-transfer`.
- Baseline ligero para experimentos: con 22,4 M de parámetros, puede entrenarse y evaluarse en hardware modesto, lo que facilita iteraciones rápidas en investigación.
- Evaluación de métricas CER/WER en pipelines de HTR: útil para validar infraestructura de evaluación con decodificación greedy y sin LM.
- Prototipado de sistemas de lectura de manuscritos: al ser un modelo pequeño y con licencia MIT, puede integrarse en pruebas de concepto de OCR/HTR sin coste de licencia.
- Reproducción de resultados académicos: permite replicar el CER 0,1511 y WER 0,5794 reportados sobre el test HHD Option-B.
- Componente en sistemas de transcripción asistida: puede emplearse como primer paso de transcripción que luego revise un humano, dado su tamaño reducido y bajo coste de inferencia.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,1511 |
| HHD Option-B test (greedy, sin LM) | WER | 0,5794 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros), por no ser benchmarks aplicables a una tarea de HTR.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,4 M de parámetros, los pesos en fp32 ocupan aproximadamente 90 MB, y en fp16 unos 45 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media como RTX 3060 son más que suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al estar en safetensors, requiere cargar el modelo con la librería correspondiente (probablemente PyTorch); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son adecuados para un modelo CTC de HTR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados de otros modelos comparables de HTR en hebreo ni variantes del mismo estudio con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo manuscrito; no es un modelo de propósito general ni soporta otros idiomas.
- El WER de 0,5794 es elevado, lo que indica que la transcripción a nivel de palabra contiene errores frecuentes; el CER de 0,1511 es más moderado pero aún relevante para producción sin revisión humana.
- Evaluado sin modelo de lenguaje; el rendimiento en producción podría variar si se añade un LM o se cambia la decodificación.
- Riesgo de alucinación y errores sistemáticos en escrituras, estilos o dominios no representados en el dataset de entrenamiento (HHD Option-B).
- No se documentan sesgos específicos, pero al entrenarse sobre un conjunto concreto de escritores, puede generalizar mal a nuevos escritores o dominios.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías; conviene verificar la procedencia y condiciones del dataset `cyttic/hhd-optionb-split`.
- No se especifican requisitos de preprocesado de imagen (resolución, normalización), lo que puede afectar a la reproducibilidad.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrsmall-elastic2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios o demos adicionales.
