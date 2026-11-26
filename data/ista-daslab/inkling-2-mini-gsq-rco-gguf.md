# ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF

## Resumen

Inkling-2-Mini GSQ-RCO GGUF es una colección de cuantizaciones no uniformes del modelo base thinkingmachines/Inkling-2-Mini, un MoE disperso y "looped" de 26.070.385.152 parámetros. El trabajo lo firma ISTA-DASLab (Deep Algorithms and Systems Lab, Institute of Science and Technology Austria) y aplica dos técnicas propias: GSQ (Gumbel-Softmax Quantization) para la cuantización escalar de cada tensor y RCO (Riemannian Constrained Optimization) para asignar un tipo de cuantización distinto a cada tensor bajo una restricción de tamaño total. El resultado son ficheros GGUF estándar que se pueden ejecutar en llama.cpp sin modificaciones.

La relevancia del artefacto está en que demuestra que la cuantización de precisión mixta guiada por gradiente puede aplicarse a un MoE de 128 expertos enrutados por capa con un presupuesto de bits muy ajustado (2,75 a 3,50 bpw) manteniendo una fidelidad notable respecto al modelo original. La build recomendada, IQ3_S, se queda a menos de 1,0 punto del modelo base en AIME25, GPQA-Diamond y LiveCodeBench v6, y alcanza el 99,2 % de su media de tarea (88,61).

El modelo base es un MoE con 24 capas, de las cuales las 12 centrales se ejecutan tres veces con los mismos pesos, 128 expertos enrutados por capa (8 activos por token) y una ventana de contexto de 1M tokens. Esta ficha describe el repositorio de cuantizaciones; los detalles de entrenamiento del modelo base no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con capas "looped" (24 capas, las 12 centrales repetidas 3 veces), 128 expertos enrutados por capa, 8 activos por token |
| Parametros totales | 26.070.385.152 (26,07B) |
| Parametros activos | no disponible (8 de 128 expertos por token, sin recuento exacto publicado) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | IQ2_S (2,75 bpw), Q2_K_XL (3,00 bpw), IQ3_XXS (3,25 bpw), IQ3_S (3,50 bpw); embedding en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único por build) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con una peculiaridad estructural: las 12 capas centrales de las 24 totales se ejecutan tres veces reutilizando los mismos pesos ("looped"), lo que aumenta la profundidad efectiva sin incrementar el número de parámetros. Cada capa enruta cada token a 8 de sus 128 expertos. Los expertos enrutados concentran la mayor parte del cómputo y, por tanto, del presupuesto de tamaño, y son el objetivo principal de la búsqueda de precisión.

La cuantización se realiza en dos fases. GSQ (Gumbel-Softmax Quantization, arXiv:2604.18556) es un método de cuantización escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajación de Gumbel-Softmax; según el autor, cierra buena parte de la brecha entre cuantización escalar y vectorial a 2-3 bits manteniéndose en formatos escalares desplegables como GGUF. RCO (Riemannian Constrained Optimization, arXiv:2605.00649) asigna uno de K tipos de cuantización a cada uno de los N tensores bajo un presupuesto de tamaño total, reformulando la restricción como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la pérdida de tarea con cumplimiento exacto del presupuesto y sin hiperparámetros específicos de la restricción. La asignación se hace por tensor y, en el caso de los expertos, por capa (GGUF no permite tipos distintos por experto dentro de una misma capa). El embedding de tokens (`token_embd.weight`, 201.024 × 2304, 0,46B parámetros, 0,93 GB) se mantiene en BF16 en todas las builds.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento de varios pasos y matemáticas: el modelo base se evalúa en AIME25 y GPQA-Diamond.
- Generación de código: evaluado en LiveCodeBench v6.
- Soporte de contexto largo: ventana de 1M tokens declarada para el modelo base.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático de competición en local: la build IQ3_S conserva el rendimiento en AIME25 a menos de 1,0 punto del modelo base, por lo que sirve para resolver problemas de nivel olímpico en una sola GPU de consumo sin depender de API externa.
- Evaluación de calidad de respuestas científicas: el rendimiento en GPQA-Diamond permite usar el modelo como generador de respuestas de nivel posgrado en pipelines de evaluación o como "juez" en configuraciones de bajo coste.
- Asistencia de programación offline: LiveCodeBench v6 evalúa generación de código; el modelo puede integrarse en editores o scripts de revisión que se ejecuten en hardware propio, sin enviar código a terceros.
- Procesamiento de documentos largos: la ventana de 1M tokens del modelo base permite cargar actas, expedientes o bases de código extensas y hacer preguntas sobre ellas en una sola pasada, siempre que la VRAM y la memoria del sistema lo permitan.
- Despliegue en estaciones de trabajo con una sola GPU: con 8,05-10,50 GB en GPU según build, cabe en tarjetas de 12-16 GB, lo que habilita prototipos de agentes conversacionales en local.
- Investigación en cuantización: el repositorio sirve como referencia reproducible de GSQ y RCO aplicados a un MoE de 26B, útil para comparar precisión mixta frente a cuantización uniforme en tareas de razonamiento.
- Servicio de chat de bajo coste: al ser GGUF compatible con llama.cpp, se puede servir con un backend ligero en CPU+GPU para cargas conversacionales moderadas donde el coste por token importa más que la latencia.

## Benchmarks y rendimiento

El autor publica una comparación entre el modelo base y las cuantizaciones GSQ-RCO en AIME25, GPQA-Diamond y LiveCodeBench v6, pero los valores numéricos por benchmark no están incluidos en la información disponible; solo se indica que IQ3_S se mantiene a menos de 1,0 punto del modelo base en las tres pruebas y alcanza el 99,2 % de su media de tarea (88,61), y que Q2_K_XL cede 1,0 punto de media de tarea a cambio de 1,6 GB menos.

| Build | bpw | Media de tarea (referencia) | Diferencia vs. base |
|---|---|---|---|
| Modelo base | BF16 | 88,61 (media de tarea) | — |
| IQ3_S | 3,50 | ≈ 99,2 % de 88,61 | < 1,0 punto en las tres pruebas |
| IQ3_XXS | 3,25 | no disponible | no disponible |
| Q2_K_XL | 3,00 | 1,0 punto por debajo de IQ3_S en media de tarea | no disponible |
| IQ2_S | 2,75 | no disponible | no disponible |

No se han publicado en la información disponible los resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: 8,05 GB (IQ2_S), 8,86 GB (Q2_K_XL), 9,68 GB (IQ3_XXS) y 10,50 GB (IQ3_S). El embedding BF16 (0,93 GB) reside en memoria del sistema, no en VRAM, por lo que el total en disco es de 8,98 a 11,43 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con 12 GB o más de VRAM puede alojar la build IQ3_S; las builds pequeñas caben en tarjetas de 10-12 GB.
- ¿Cabe en GPU de consumo? Sí: las cuatro builds caben en GPUs de consumo de 12-16 GB (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) siempre que se reserve memoria para el contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF) y cualquier frontend compatible con GGUF; el repositorio declara `endpoints_compatible`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor señala que el embedding no afecta a la velocidad porque es una tabla de búsqueda y no un operando de matmul.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini GSQ-RCO (este repo) | 26,07B (MoE, 8/128 activos) | 1M | GGUF 2,75-3,50 bpw, precisión mixta por tensor | Apache 2.0 | Hugging Face (GGUF) |
| Inkling-2-Mini (base) | 26,07B (MoE) | 1M | BF16 (referencia) | Apache 2.0 | Hugging Face |
| Otras cuantizaciones GGUF uniformes del mismo base | 26,07B | 1M | un único tipo por tensor | Apache 2.0 | no disponible en la información proporcionada |

No se dispone de datos numéricos de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento frente a otros modelos de la misma categoría.

## Limitaciones y advertencias

- Las builds de 2,75-3,25 bpw degradan la calidad respecto a IQ3_S; el propio autor recomienda IQ3_S como punto de operación y advierte de que Q2_K_XL cede 1,0 punto de media de tarea.
- La asignación de tipos se hace por capa y no por experto, porque GGUF no puede expresar precisión distinta por experto dentro de una capa; esto limita la granularidad de la optimización.
- El embedding se mantiene en BF16 y ocupa 0,93 GB en disco; cuantizarlo ahorraría unos 0,7 GB de descarga pero no liberaría VRAM, según el autor.
- No hay información publicada sobre sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base ni de las cuantizaciones.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene verificar las condiciones del checkpoint original de thinkingmachines/Inkling-2-Mini antes de producción.
- El contexto de 1M tokens es una capacidad declarada del modelo base; en la práctica, la VRAM disponible condicionará la longitud efectiva de contexto en llama.cpp.
- No se han publicado datos de latencia ni throughput; el rendimiento real dependerá del backend y del hardware.
- El repositorio tiene 0 descargas en el momento de la consulta, por lo que la validación por parte de la comunidad es aún limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ISTA-DASLab/Inkling-2-Mini-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Código RCO: https://github.com/IST-DASLab/RCO
- GitHub del laboratorio: https://github.com/IST-DASLab
