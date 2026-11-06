# cyttic/hmt-trocrsmall-geom2-s42

## Resumen

`cyttic/hmt-trocrsmall-geom2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) publicado por el grupo cyttic dentro de un estudio de aumento de datos denominado htr-metrics-transfer. No es un modelo de lenguaje generativo, sino un reconocedor acústico-visual de secuencias entrenado con una cabeza CTC sobre un backbone denominado `trocrsmall`. El modelo forma parte de una familia de experimentos en los que se varía la estrategia de aumento de datos (`geom2`) y la semilla (`s42`) para medir el impacto en métricas de error de caracteres y palabras.

El modelo se ha entrenado sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y se evalúa sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje. Con 22,4 millones de parámetros y un repositorio de 0,1 GB, es un modelo compacto y ligero, pensado para investigación reproducible más que para despliegue comercial a gran escala. Su relevancia actual radica en que documenta de forma explícita el efecto de una técnica concreta de aumento geométrico sobre el rendimiento en hebreo manuscrito, un dominio con pocos recursos.

La licencia MIT y el formato safetensors facilitan su reutilización y auditoría, aunque el alcance del modelo está acotado al hebreo y a la tarea HTR. Los resultados publicados en la model card (CER 0,1214 y WER 0,4888) constituyen la referencia principal para evaluar su utilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone `trocrsmall` con cabeza CTC; detalles no publicados) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del backbone `trocrsmall`. Por las etiquetas del repositorio (`htr`, `ctc`) y la naturaleza de la tarea, se trata de un modelo de reconocimiento de secuencias de imágenes de texto manuscrito con una cabeza de Connectionist Temporal Classification (CTC), que permite alinear secuencias de longitud variable sin segmentación explícita a nivel de carácter. El número de parámetros (22,4 M) es coherente con un modelo convolucional o híbrido convolucional-recurrente de tamaño pequeño, no con un transformer de gran escala.

El entrenamiento se realizó sobre el split de entrenamiento del dataset `cyttic/hhd-optionb-split`, excluyendo los escritores que componen el conjunto de desarrollo, lo que sugiere una partición por escritor para evitar fuga de información entre train y evaluación. La variante `geom2` corresponde a una estrategia de aumento de datos geométrico (probablemente rotaciones, escalados, desplazamientos o deformaciones elásticas) aplicada durante el entrenamiento, y `s42` indica la semilla aleatoria utilizada. No se especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de regularización adicionales. La evaluación se realizó con decodificación greedy y sin modelo de lenguaje externo, lo que aísla el rendimiento del reconocedor puro.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea o secuencia de imagen.
- Decodificación CTC greedy sin necesidad de modelo de lenguaje auxiliar.
- Salida de transcripciones con métricas de error medibles (CER y WER).
- Entrenamiento reproducible mediante semilla fija (`s42`) y configuración de aumento documentada (`geom2`).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo generativo de texto ni admite instrucciones en lenguaje natural.
- No dispone de capacidades multimodales más allá de la imagen de entrada a texto.
- No se documentan capacidades multilingües: solo hebreo.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos históricos o administrativos escaneados, siempre que el dominio visual sea similar al del dataset HHD, gracias a su cabeza CTC que maneja longitudes variables sin segmentación previa.
- Investigación en aumento de datos para HTR: sirve como punto de comparación reproducible (semilla 42, aumento `geom2`) frente a otras variantes de la familia `hmt-trocrsmall`, permitiendo medir el efecto aislado de la estrategia de aumento sobre CER y WER.
- Evaluación de pipelines de reconocimiento sin LM: al estar entrenado y evaluado con decodificación greedy, es adecuado para comparar reconocedores puros antes de añadir un modelo de lenguaje en la decodificación.
- Prototipado ligero en entornos con pocos recursos: con 22,4 M de parámetros y 0,1 GB de pesos, puede ejecutarse en CPU o GPU de gama baja para pruebas de concepto de transcripción manuscrita en hebreo.
- Generación de datasets etiquetados: puede usarse para pre-etiquetar líneas manuscritas en hebreo y posteriormente revisar manualmente, reduciendo el coste de anotación en proyectos de digitalización.
- Reproducibilidad de estudios académicos: al publicar semilla, configuración de aumento y métricas en `results.json`, permite replicar el experimento y auditar la transferencia de métricas entre variantes del estudio htr-metrics-transfer.
- Filtrado de calidad en digitalización masiva: las puntuaciones CTC pueden emplearse para detectar líneas mal transcritas y derivarlas a revisión humana, dado el WER relativamente alto (0,4888) que indica que la salida no es fiable sin supervisión.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,1214 |
| HHD Option-B test (greedy, sin LM) | WER | 0,4888 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores corresponden a la evaluación declarada en la model card sobre el test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 22,4 M de parámetros (aproximadamente 90 MB de pesos), más el espacio de activaciones para imágenes de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura.
- Cabe en GPU de consumo y también en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo safetensors con cabeza CTC, requiere un runtime compatible con la arquitectura `trocrsmall` (no disponible en la información). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera latencia baja en GPU, pero no se publican mediciones.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de HTR en hebreo ni resultados de referencia frente a alternativas. La única comparación posible dentro del ecosistema es con otras variantes de la misma familia `hmt-trocrsmall` (distintas configuraciones de aumento y semilla), pero no se dispone de sus métricas en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en hebreo; no se espera un rendimiento aceptable en otros idiomas.
- El WER de 0,4888 es alto: aproximadamente la mitad de las palabras presentan errores, por lo que la salida no es apta para producción sin revisión humana o un modelo de lenguaje corrector.
- El CER de 0,1214 indica que, aunque los caracteres individuales se reconocen razonablemente, los errores se acumulan a nivel de palabra.
- Riesgo de alucinación en el sentido de sustituciones y omisiones de caracteres propio de los modelos CTC; no genera texto libre, pero puede producir transcripciones incorrectas con alta confianza.
- Dependencia del dominio: entrenado sobre el dataset HHD Option-B; el rendimiento puede degradarse en otras fuentes, estilos de escritura o calidades de escaneo.
- La partición por escritor evita fuga en la evaluación declarada, pero no se documentan análisis de sesgo por escritor, género o estilo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia y licencia del dataset de entrenamiento antes de un uso comercial.
- No se documentan limitaciones de longitud de contexto ni de resolución de imagen; se desconoce el comportamiento con líneas muy largas o imágenes de baja calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrsmall-geom2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
