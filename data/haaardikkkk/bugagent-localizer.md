# Haaardikkkk/bugagent-localizer

## Resumen

BugAgent localizer es un clasificador binario de texto que determina si una función individual de código Python, Java o C/C++ contiene un error (buggy) o está limpia (clean). Lo desarrolla Haaardikkkk como componente del proyecto BugAgent, una plataforma de pruebas de software asistida por IA, y se publica en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning de answerdotai/ModernBERT-base, con 149,6 millones de parámetros y una ventana de 512 tokens por función.

El modelo no genera código ni explicaciones: su única salida es una puntuación de clasificación. Su relevancia es limitada y muy específica, ya que el propio autor documenta en la model card que el modelo no distingue un bug de su propia corrección, con un AUC de 0,49 en proyectos reservados (nivel de azar). BugAgent, de hecho, asigna peso cero a estas puntuaciones al priorizar problemas, por lo que el modelo debe entenderse como un experimento de localización de fallos más que como una herramienta fiable de verificación de corrección.

La ficha resulta útil para investigadores que quieran reproducir o auditar el enfoque, o como punto de partida para fine-tunings sobre ModernBERT en tareas de análisis estático de código, pero no como componente de producción para decidir si el código es correcto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder con atención lineal y RoPE), fine-tuning de answerdotai/ModernBERT-base |
| Parámetros totales | 149.606.402 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por función |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre código Python, Java y C/C++, no sobre lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Tamaño del repositorio | 0,3 GB |
| Fecha de creación | 2026-11-06 |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer con atención lineal, embeddings rotatorios (RoPE) y soporte nativo de secuencias largas, adaptado aquí a una ventana de 512 tokens por función. La cabeza de clasificación produce una etiqueta binaria (clean o buggy) sobre el texto de una única función, no sobre un fichero completo ni sobre un diff. No se documenta en la información disponible si se aplicaron técnicas de destilación, poda o entrenamiento con preferencias (RLHF/DPO); al ser una tarea de clasificación supervisada, lo habitual sería entropía cruzada binaria, aunque este extremo no se confirma.

El entrenamiento combinó varios conjuntos de datos públicos: nebius/SWE-rebench, princeton-nlp/SWE-bench (partición de train), nebius/SWE-bench-extra, SWE-Gym/SWE-Gym, ByteDance-Seed/Multi-SWE-RL, bigcode/commitpackft, ASSERT-KTH/megadiff-single-function y bstee615/bigvul. La evaluación se realizó sobre princeton-nlp/SWE-bench_Verified y ByteDance-Seed/Multi-SWE-bench, que según el autor nunca se usaron en entrenamiento ni en selección de modelo. No se especifica el número de tokens de entrenamiento ni la composición exacta por lenguaje.

## Capacidades

- Clasificación binaria de funciones de código como limpias o con errores, en Python, Java y C/C++.
- Procesamiento de una función por inferencia, con un límite de 512 tokens; las funciones más largas requieren truncado o segmentación.
- Puntuación de probabilidad reutilizable para ordenar candidatos dentro de un pipeline de localización de fallos (uso previsto en BugAgent).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidades multilingües de lenguaje natural no documentadas; el soporte se limita a los tres lenguajes de programación indicados.

## Casos de uso

- Triaje previo en pipelines de revisión de código: usar la puntuación del modelo como señal débil para priorizar funciones que merecen revisión manual, sin emplearla como criterio único de corrección.
- Investigación sobre localización de fallos: reproducir el experimento y comparar el AUC frente a variantes (por ejemplo, clasificadores entrenados solo con BigVul o solo con SWE-bench) para estudiar el efecto de la mezcla de datos.
- Etiquetado asistido en conjuntos de datos de bugs: generar candidatos positivos que después se validan con pruebas automáticas o con revisión humana, dado que el modelo no distingue un bug de su corrección.
- Componente de un agente de pruebas como BugAgent: integrar la puntuación como una señal más dentro de un sistema que combine ejecución de tests, análisis estático y un LLM generativo, con peso cero en la decisión final tal como hace el proyecto original.
- Filtrado de commits en repositorios grandes: aplicar el clasificador a las funciones modificadas en un commit para reducir el espacio de búsqueda antes de lanzar herramientas más costosas, como ejecución de la suite de tests o un modelo generativo.
- Base para fine-tuning específico de dominio: al ser un encoder de 149 M de parámetros con licencia Apache 2.0, sirve como punto de partida para adaptar la detección de bugs a un lenguaje o a un estilo de código concreto con un coste de entrenamiento bajo.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. AUC de 0,50 equivale a azar y 1,00 a clasificación perfecta.

| Test | Proyectos reservados (held-out) | Benchmarks no usados en entrenamiento ni selección |
|---|---|---|
| Buggy frente a su propia corrección | 0,49 | 0,50 |
| Buggy frente a código corregido y sin cambios | 0,67 | 0,55 |
| Buggy frente a código sin cambios | 0,75 | 0,58 |
| Buggy clasificado por encima de su corrección | 42 % de pares | 47 % de pares |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB para los pesos (149,6 M de parámetros); en fp16, alrededor de 0,3 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no requiere GPU de datacenter; una RTX 3060, RTX 4090 o incluso CPU son suficientes para lotes pequeños. Para procesar grandes volúmenes de funciones, una A100 o H100 permitiría lotes mucho mayores, aunque el cuello de botella sería el preprocesado de código, no el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM, y también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (TEI) para clasificación, o exportación a ONNX para inferencia en CPU. No se documenta soporte específico para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la ventana de 512 tokens, se espera una latencia por debajo de decenas de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BugAgent localizer (este modelo) | 149,6 M | 512 tokens | Clasificación binaria de funciones (buggy/clean) | Apache 2.0 | Hugging Face, 0 descargas |
| answerdotai/ModernBERT-base (modelo base) | 149 M | 8.192 tokens | Encoder generalista para clasificación y retrieval | Apache 2.0 | Hugging Face, ampliamente usado |
| Clasificadores sobre CodeBERT / GraphCodeBERT | aproximadamente 125 M | 512 tokens | Clasificación y detección de bugs en código | MIT / Apache 2.0 según variante | Hugging Face y Microsoft Research |

La comparación con CodeBERT y GraphCodeBERT es cualitativa: no se dispone de resultados de benchmarks comunes en la información proporcionada. Frente a ModernBERT-base, este modelo reduce la ventana de contexto de 8.192 a 512 tokens y especializa la cabeza de clasificación en la tarea de bugs, a costa de perder generalidad.

## Limitaciones y advertencias

- El modelo no distingue un bug de su propia corrección: AUC de 0,49 en proyectos reservados, nivel de azar. El autor lo advierte explícitamente y BugAgent asigna peso cero a sus puntuaciones.
- El rendimiento cae de forma notable al pasar de proyectos vistos en entrenamiento a benchmarks reservados (por ejemplo, de 0,75 a 0,58 en la comparación buggy frente a código sin cambios), lo que indica sobreajuste a los repositorios de entrenamiento.
- Solo clasifica funciones individuales de hasta 512 tokens; no analiza ficheros completos, diffs ni contexto entre funciones, lo que limita la detección de bugs que dependen de interacciones.
- Cobertura limitada a Python, Java y C/C++; no se documenta soporte para otros lenguajes ni para lenguaje natural.
- Riesgo de falsos positivos y negativos no cuantificado más allá del AUC; no se publican matrices de confusión ni umbrales recomendados.
- Sesgos potenciales derivados de los datasets de entrenamiento (SWE-bench, BigVul, CommitPackFT), que sobrerrepresentan ciertos repositorios y estilos de código; no se documenta un análisis de sesgo.
- No debe usarse para decidir si el código es correcto en producción; su uso razonable es como señal débil o como objeto de estudio.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el rendimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haaardikkkk/bugagent-localizer
- Repositorio del proyecto BugAgent: https://github.com/haaardikkk/BugAgent
- Organización BugAgent en GitHub: https://github.com/bugagent/
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
