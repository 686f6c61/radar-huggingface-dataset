# reaperdoesntknow/Discovered

## Resumen

Discovered es un modelo de lenguaje publicado en Hugging Face por el usuario reaperdoesntknow, vinculado al portfolio de Convergent Intelligence LLC (Research Division). Se distribuye como un checkpoint de tipo transformers con pesos en safetensors y un total de 54.657.008 parámetros (aproximadamente 54,7 millones), lo que lo sitúa en la categoría de modelos pequeños. El repositorio ocupa 0,7 GB y acumula 291 descargas con 0 likes en el momento de la consulta.

La model card es prácticamente una plantilla autogenerada por Hugging Face: la mayoría de los campos (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, evaluación) figuran como "[More Information Needed]". La información sustantiva se limita a las etiquetas del repositorio (transformers, safetensors, moa_metric, trl, sft, convergentintel) y a una sección final que enmarca el modelo dentro de un marco teórico propio denominado Discrepancy Calculus (DISC), descrito como un enfoque de teoría de la medida para analizar la brecha entre el comportamiento esperado y el observado durante el entrenamiento.

Por tanto, la relevancia práctica del modelo es difícil de establecer: no hay documentación sobre arquitectura interna, contexto, tokenizador ni rendimiento. Lo que sí puede afirmarse con datos verificables es su tamaño (54,7 M de parámetros), su formato de pesos y su filiación declarada a un marco de investigación propietario. Cualquier evaluación de idoneidad para producción debe partir de una inspección directa de los pesos y del tokenizador, no de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de tipo transformers; no se documenta la familia concreta) |
| Parametros totales | 54.657.008 |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card no especifica si se trata de un transformer decoder-only, un encoder, un modelo híbrido o cualquier otra variante; tampoco indica el número de capas, la dimensión oculta, el número de cabezas de atención ni el vocabulario del tokenizador. El tamaño del repositorio (0,7 GB) es coherente con un checkpoint de unos 54,7 M de parámetros en precisión de 16 bits, aunque el repo incluye además ficheros auxiliares y posiblemente estados del optimizador.

En cuanto al entrenamiento, las etiquetas `trl` y `sft` sugieren un ajuste supervisado (supervised fine-tuning) realizado con la librería TRL de Hugging Face, y la etiqueta `convergentintel` lo vincula al portfolio de Convergent Intelligence LLC. La model card menciona el marco Discrepancy Calculus (DISC) con conceptos como el operador de discrepancia, los conjuntos de salto (jump sets) y el "ghost imprinting", pero no aporta detalles operativos: no hay número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, hiperparámetros ni régimen de precisión. La etiqueta `moa_metric` podría referirse a una métrica de mezcla de agentes (mixture of agents) o a un artefacto interno del autor, pero no se documenta su significado.

## Capacidades

- Generación de texto: no verificable a partir de la información disponible; el checkpoint es de tipo transformers y presumiblemente admite `generate()`, pero no se documenta su calidad ni su comportamiento.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ajuste supervisado declarado: la etiqueta `sft` indica que el modelo pasó por una fase de fine-tuning supervisado con TRL, aunque se desconoce la tarea objetivo.

## Casos de uso

Dado que no se documentan capacidades ni evaluación, los siguientes casos son escenarios plausibles para un modelo de ~55 M de parámetros con fine-tuning supervisado, no recomendaciones respaldadas por datos del autor:

- Clasificación y etiquetado de texto: un modelo de 54,7 M de parámetros puede ajustarse para tareas de clasificación de secuencias cortas (sentimiento, intención, tópicos) con coste de inferencia muy bajo en CPU.
- Extracción de información estructurada: uso como base para fine-tuning en extracción de entidades o campos concretos en dominios acotados, donde el vocabulario y el formato de salida están bien definidos.
- Filtrado y enrutado previo en pipelines: actuar como clasificador ligero que decida si una consulta requiere un modelo mayor, reduciendo coste en sistemas con cascada de modelos.
- Prototipado e investigación educativa: servir como banco de pruebas para experimentos de fine-tuning con TRL y para reproducir el marco DISC descrito por el autor.
- Generación de texto asistida en dominios muy restringidos: tras un fine-tuning adicional con datos propios, puede producir respuestas plantilla o completar formularios en un dominio cerrado.
- Evaluación de técnicas de ajuste: útil para comparar recetas de SFT, tasas de aprendizaje y tamaños de dataset en un entorno de bajo coste computacional antes de escalar a modelos mayores.

En ningún caso se recomienda su despliegue directo en atención al cliente, generación de código en producción o tareas de razonamiento abierto sin una evaluación previa propia, dada la ausencia total de benchmarks y de documentación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 54,7 M de parámetros, los pesos en fp16 ocupan aproximadamente 110 MB; en fp32, unos 220 MB. El repositorio completo (0,7 GB) incluye probablemente ficheros adicionales, pero la inferencia solo requiere cargar los pesos del modelo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe holgadamente en tarjetas de gama baja como GTX 1650, RTX 3050 o incluso en iGPU con memoria compartida.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer de los últimos diez años, y también en CPU.
- Opciones de despliegue: al ser un checkpoint de transformers en safetensors, puede cargarse con la librería `transformers`; también es convertible a GGUF para llama.cpp u Ollama, aunque el autor no publica dichas variantes. vLLM y TGI son compatibles en principio, pero para este tamaño el beneficio de un servidor de inferencia dedicado es marginal.
- Latencia y throughput estimados: no disponibles. Por el tamaño, se espera una latencia de milisegundos por petición en GPU moderna y de decenas a cientos de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a parámetros y disponibilidad. Se incluyen alternativas de tamaño comparable ampliamente documentadas:

| Modelo | Parámetros | Contexto | Licencia | Documentación |
|---|---|---|---|---|
| Discovered (reaperdoesntknow) | 54,7 M | no disponible | no disponible | model card autogenerada, sin benchmarks |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | model card completa, benchmarks históricos |
| DistilBERT (Hugging Face) | 66 M | 512 tokens | Apache 2.0 | model card completa, benchmarks GLUE |
| TinyLlama 1.1B (TinyLlama) | 1,1 B | 2048 tokens | Apache 2.0 | model card completa, benchmarks |

Discovered es el único de la lista sin licencia declarada y sin métricas publicadas, lo que limita seriamente su comparabilidad. En tamaño se sitúa entre DistilBERT y GPT-2 small.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es una plantilla sin rellenar; no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Licencia no declarada: no puede asumirse permiso para uso comercial, redistribución o modificación. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- Riesgo de alucinación: desconocido, pero en modelos de este tamaño y sin evaluación publicada el riesgo es alto en tareas generativas abiertas.
- Idiomas: no se declaran; no puede asumirse soporte de castellano ni de ningún otro idioma concreto.
- Contexto: no documentado; probablemente corto (cientos o pocos miles de tokens), pero es una suposición.
- Marco teórico propietario: la sección DISC de la model card emplea terminología no estándar y referencias a documentos del propio autor; no sustituye a una evaluación empírica.
- Reputación del autor: el perfil (reaperdoesntknow) y la ausencia de likes o documentación externa impiden verificar la calidad del checkpoint; conviene inspeccionar los pesos y el tokenizador antes de confiar en él.
- Producción: no apto para despliegue sin una evaluación propia de robustez, seguridad y calidad en la tarea objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Discovered
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento DISC citado en la model card: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento "Three Teachers to Dual Cognition": https://huggingface.co/reaperdoesntknow/DualMind_Me (URL truncada en la información disponible)
- Calculadora de impacto ambiental citada: https://mlco2.github.io/impact
- Referencia Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
