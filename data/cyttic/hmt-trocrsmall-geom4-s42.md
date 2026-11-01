# cyttic/hmt-trocrsmall-geom4-s42

## Resumen

`cyttic/hmt-trocrsmall-geom4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic, entrenado con una arquitectura CTC sobre el conjunto de datos `cyttic/hhd-optionb-split`. Forma parte de un estudio de aumento de datos (*augmentation study*) denominado `htr-metrics-transfer`, en el que se varía la estrategia de aumento (`geom4`) y la semilla aleatoria (42) sobre un modelo base identificado como `trocrsmall`.

El modelo está especializado en una única tarea: transcribir imágenes de texto manuscrito en hebreo (`he`) a texto digital. No es un modelo generativo de propósito general ni un LLM conversacional; su salida es una secuencia de caracteres obtenida por decodificación greedy sin modelo de lenguaje externo. Con 22,4 millones de parámetros y un repositorio de 0,1 GB, es un modelo compacto pensado para investigación y evaluación comparativa de técnicas de aumento de datos en HTR.

Su relevancia es acotada y experimental: sirve como punto de referencia dentro del estudio `htr-metrics-transfer` para medir el impacto de la augmentación `geom4` con semilla 42 sobre métricas de error (CER 0,1290 y WER 0,5138 en el test HHD Option-B). No está pensado como producto final, sino como artefacto reproducible de un experimento académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) para HTR; detalles internos del backbone no disponibles |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una cabeza de decodificación CTC, un esquema clásico en reconocimiento de texto manuscrito que alinea secuencias de características visuales con secuencias de caracteres sin necesidad de segmentación explícita. El backbone concreto (CNN, CRNN o transformer visual) no se detalla en la model card; solo se indica la etiqueta `ctc` y el tamaño total de 22,4 millones de parámetros, coherente con una red convolucional-recurrente compacta propia de HTR.

El entrenamiento se realizó sobre `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo (*dev writers*) para evitar fuga de información. La variante corresponde al aumento de datos `geom4` con semilla 42 dentro del estudio `htr-metrics-transfer`. La evaluación se hizo sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje, obteniendo CER 0,1290 y WER 0,5138. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de ajuste adicionales.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Transcripción a nivel de carácter mediante decodificación CTC greedy.
- Evaluación reproducible de métricas CER y WER sin modelo de lenguaje.
- Entrenamiento con aumentación geométrica (`geom4`) para robustez frente a variaciones de escritura.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades.
- Multilingüismo limitado exclusivamente al hebreo.

## Casos de uso

- Investigación en HTR: servir como línea base reproducible para comparar el efecto de distintas estrategias de aumento de datos (`geom4` frente a otras) sobre CER y WER en hebreo manuscrito.
- Digitalización de archivos históricos en hebreo: transcribir manuscritos escaneados cuando se dispone de un pipeline previo de detección de líneas y se acepta un WER elevado (0,5138) con revisión humana posterior.
- Evaluación de transferencia de métricas: usar el modelo dentro del estudio `htr-metrics-transfer` para analizar cómo se transfieren las ganancias de aumentación entre configuraciones y semillas.
- Reproducibilidad de experimentos: al estar publicado con licencia MIT y pesos safetensors, permite replicar exactamente el resultado CER 0,1290 / WER 0,5138 reportado.
- Componente en sistemas de indexación de documentos: generar transcripciones aproximadas para búsqueda por palabras clave en corpus manuscritos hebreos, tolerando errores a nivel de palabra.
- Docencia y formación: ejemplo compacto (22,4 M de parámetros) de un pipeline CTC completo para enseñar alineamiento secuencial y métricas de error en reconocimiento de escritura.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,1290 |
| HHD Option-B test (greedy, sin LM) | WER | 0,5138 |

No se han publicado en la información disponible resultados comparativos con otros modelos en benchmarks estándar (MMLU, HumanEval, GSM8K u otros), dado que el modelo no es un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,4 M de parámetros, ~90 MB de pesos); en la práctica, la memoria vendrá dominada por el tamaño de las imágenes de entrada y el batch.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes y el modelo no aprovechará su capacidad.
- Cabe en cualquier GPU de consumo actual e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo CTC específico, requiere un runtime compatible con la arquitectura concreta (no disponible en la información); no es directamente desplegable con vLLM, TGI u Ollama, orientados a LLMs.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de HTR en hebreo con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Especializado exclusivamente en hebreo manuscrito; no funciona en otros idiomas ni en texto impreso sin validación previa.
- WER de 0,5138: aproximadamente la mitad de las palabras se transcriben con algún error, lo que exige revisión humana en cualquier uso productivo.
- Decodificación greedy sin modelo de lenguaje: no corrige errores léxicos ni contextuales.
- Riesgo de sobreajuste a las características de escritura del dataset `hhd-optionb-split`; el rendimiento fuera de esa distribución no está documentado.
- Posibles sesgos derivados de los escritores y estilos presentes en el corpus de entrenamiento; no se reporta análisis de sesgo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.
- No apto para tareas generativas, conversacionales ni de razonamiento general.

## Enlaces

- HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-geom4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado en la información disponible papers, blogs, repositorios ni demos adicionales.
