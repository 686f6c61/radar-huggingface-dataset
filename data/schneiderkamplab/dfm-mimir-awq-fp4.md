# schneiderkamplab/DFM-Mimir-AWQ-FP4

## Resumen

DFM-Mimir-AWQ-FP4 es la versión cuantizada en 4 bits (GPTQ W4A16_ASYM) del modelo DFM-Mimir, un modelo de lenguaje de 1.000 millones de parámetros desarrollado por Danish Foundation Models dentro de la familia HRM-Text. El modelo original, entrenado desde cero con datos post-entrenamiento permisibles, ofrece un rendimiento competitivo en inglés y un rendimiento puntero en danés para su tamaño. Esta variante cuantizada, publicada por schneiderkamplab, reduce el tamaño del modelo de aproximadamente 3,2 GB (bf16) a 2,12 GB, con una caída media de precisión de solo 1,4 puntos en 17 benchmarks, lo que lo convierte en una opción atractiva para despliegues con recursos limitados.

La arquitectura se basa en el Hierarchical Reasoning Model (HRM), un diseño de transformer que organiza el razonamiento en niveles jerárquicos. El modelo está disponible bajo licencia Apache 2.0 y soporta dos idiomas: danés e inglés. Su tamaño compacto y su cuantización eficiente lo hacen adecuado para entornos de producción con restricciones de memoria, así como para tareas de razonamiento, matemáticas y generación de código en contextos bilingües.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HRM-Text (Hierarchical Reasoning Model), transformer denso |
| Parametros totales | 1.786.775.040 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No especificada; calibración realizada con 2048 tokens |
| Tipos de cuantizacion | GPTQ W4A16_ASYM (int4 asimétrico, activaciones bf16), group size 128, actorder static, lm_head en bf16 |
| Idiomas soportados | Danés (da), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos cuantizados int4 pack-quantized) |

## Arquitectura y entrenamiento

El modelo base DFM-Mimir es un transformer denso de 1B parámetros basado en la arquitectura HRM-Text, entrenado desde cero utilizando únicamente datos post-entrenamiento permisibles. Esta característica lo diferencia de muchos modelos que dependen de datasets masivos con licencias restrictivas. El paper asociado (arxiv:2608.13517) describe el diseño y los resultados del modelo, que alcanza un rendimiento competitivo en inglés y un rendimiento de vanguardia en danés para modelos de su tamaño.

La cuantización se realizó con la librería llmcompressor 0.13.0, aplicando el modificador GPTQ con formato W4A16_ASYM (pesos int4 asimétricos, activaciones en 16 bits). El proceso de calibración utilizó 256 muestras procedentes de benchmarks en inglés (MMLU, BoolQ, HellaSwag, GSM8K y Winogrande), con una longitud máxima de secuencia de 2048 tokens. El lm_head se mantiene en bf16 para preservar la calidad de la generación. El resultado es un modelo que conserva la mayor parte de las capacidades del original, con una reducción del 34 % en el tamaño del archivo.

## Capacidades

- Generación de texto conversacional en danés e inglés, con plantilla de chat integrada.
- Razonamiento matemático sólido: 89,8 % en GSM8K y 49,8 % en MATH.
- Generación de código: 54,3 % en HumanEval y 52,5 % en MBPP.
- Comprensión y razonamiento en inglés: 57,6 % en MMLU, 87,9 % en BoolQ, 80,5 % en ARC-C.
- Tareas en danés: 95,8 F1 en DaLA, 92,9 EM en GEC, 66,4 EM en WikiQA.
- Clasificación de sentimiento y análisis de textos en danés (Angry Tweets, DaLA).
- No se documenta soporte de tool calling, visión, audio ni multimodalidad.

## Casos de uso

- Atención al cliente automatizada en danés: el modelo puede gestionar conversaciones multi-turno gracias a su plantilla de chat, ofreciendo respuestas fluidas en danés e inglés. Su tamaño reducido permite desplegarlo en infraestructuras modestas.
- Asistente de código para desarrolladores escandinavos: con resultados de 54,3 en HumanEval, puede integrarse en entornos de desarrollo para sugerir fragmentos de código o explicar soluciones, especialmente en contextos donde se alterna danés e inglés.
- Tutor de matemáticas en entornos educativos: su alto rendimiento en GSM8K (89,8) y MATH (49,8) lo hace adecuado para generar explicaciones paso a paso de problemas aritméticos y algebraicos en danés.
- Análisis de sentimiento en redes sociales danesas: el modelo obtiene 67,4 en el benchmark Angry Tweets, lo que permite clasificar opiniones en texto corto y detectar tono emocional en plataformas sociales.
- Resumen y clasificación de documentos administrativos en danés: con buenos resultados en tareas como GovRep. e IFEval, puede automatizar la extracción de información y el resumen de informes en el sector público.
- Traducción asistida danés-inglés: al estar entrenado en ambos idiomas, puede servir como apoyo en flujos de traducción, generando propuestas de traducción o revisando textos en contextos editoriales y empresariales.
- Ejecución en dispositivos de borde: el peso de 2,12 GB permite su despliegue en hardware con poca memoria, como routers, terminales o sistemas embebidos, para tareas de procesamiento de lenguaje en offline.

## Benchmarks y rendimiento

La evaluación del modelo cuantizado se realizó sobre 17 benchmarks, con temperatura 0 y usando el template de chat integrado. En comparación con el modelo base en bf16, la caída media de precisión es de 1,4 puntos, y en tres benchmarks (BoolQ, MATH y PIQA-da) el modelo cuantizado iguala o supera al original.

| Benchmark | Mimir 1B (bf16) | Mimir 1B (AWQ FP4) |
|---|---|---|
| BoolQ (Acc) | 87,8 | 87,9 |
| Winogrande (Acc) | 73,5 | 71,8 |
| Hellaswag (Acc) | 67,3 | 66,4 |
| MMLU (Acc) | 57,5 | 57,6 |
| ARC-C (Acc) | 81,6 | 80,5 |
| DROP (F1) | 83,1 | 78,3 |
| GSM8K (Acc) | 89,9 | 89,8 |
| MATH (Acc) | 45,8 | 49,8 |
| HumanEval (Acc) | 56,7 | 54,3 |
| MBPP (Acc) | — | 52,5 |
| DaLA (F1) | 96,1 | 95,8 |
| GEC (EM) | 85,6 | 92,9 |
| WikiQA (EM) | 66,8 | 66,4 |
| PIQA-da (Acc) | 53,7 | 53,7 |

En comparación con modelos de tamaño similar, el Mimir 1B AWQ FP4 supera a Qwen 3.5 0.8B, Gemma 3 1B y OLMo 2 1B en la mayoría de benchmarks, aunque es superado por modelos más grandes como Qwen 3.5 4B y Gemma 4 E2B en algunos indicadores.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3-4 GB para inferencia con batch 1 y longitud de contexto moderada, basado en el peso del modelo de 2,12 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 8GB, RTX 4090, o cualquier GPU con al menos 4 GB de VRAM.
- Puede ejecutarse en GPU de consumo; también es viable en CPU mediante cuantización y frameworks como llama.cpp, aunque no se han publicado datos de rendimiento.
- Opciones de despliegue: transformers (carga directa), vLLM, TGI, llama.cpp, Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | HumanEval | Licencia |
|---|---|---|---|---|---|---|
| DFM-Mimir AWQ FP4 | 1,79B | No especificado | 57,6 | 89,8 | 54,3 | Apache 2.0 |
| Qwen 3.5 0.8B | 0,8B | No disponible | 51,5 | 49,1 | 30,5 | No disponible |
| Gemma 3 1B | 1B | No disponible | 37,5 | 49,7 | 42,7 | No disponible |
| OLMo 2 1B | 1B | No disponible | 41,6 | 59,4 | 15,9 | No disponible |

## Limitaciones y advertencias

- Solo soporta danés e inglés; no ofrece capacidades en otros idiomas.
- La longitud de contexto no está documentada; la calibración se realizó con 2048 tokens, lo que sugiere un límite operativo en torno a ese valor.
- La cuantización introduce una caída media de 1,4 puntos en benchmarks, con degradaciones mayores en tareas como DROP (83,1 a 78,3) y Hellaswag-DA.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño, puede heredar sesgos de los datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo.
- No se menciona soporte de tool calling, visión ni audio, lo que limita su uso en agentes multimodales.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/schneiderkamplab/DFM-Mimir-AWQ-FP4
- Modelo base: https://huggingface.co/danish-foundation-models/DFM-Mimir
- Paper: https://arxiv.org/abs/2608.13517
