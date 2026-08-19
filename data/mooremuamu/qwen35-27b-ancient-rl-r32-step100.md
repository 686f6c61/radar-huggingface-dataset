# MooreMuaMu/qwen35-27b-ancient-rl-r32-step100

## Resumen

El modelo `qwen35-27b-ancient-rl-r32-step100` es un checkpoint de refuerzo (RL) sobre la familia Qwen3.5-27B, desarrollado por el usuario MooreMuaMu, especializado en lenguas antiguas y minoritarias: tibetano, mongol tradicional y uigur. Se trata de un modelo de texto completo (text-generation) que combina el ajuste fino previo en dos etapas con un entrenamiento de refuerzo mediante GRPO (Group Relative Policy Optimization) sobre un adaptador LoRA de rango 32, que posteriormente se fusiona en los pesos completos del modelo base. El resultado es un modelo denso de aproximadamente 27 356 millones de parámetros en precisión bfloat16, listo para cargar directamente con `transformers`.

El modelo resuelve tareas de anotación y traducción de textos en estos tres idiomas, con un énfasis en la extracción de respuestas estructuradas entre etiquetas `<ANS>...</ANS>`. Es relevante porque aborda un dominio lingüístico poco cubierto por los modelos generalistas, y porque documenta de forma transparente su proceso de entrenamiento y evaluación con métricas emparejadas y intervalos de confianza. No obstante, se trata de un checkpoint exploratorio: las mejoras agregadas son pequeñas y estadísticamente no concluyentes en la mayoría de métricas semánticas, aunque sí se observan ganancias notables en tareas concretas como la anotación en mongol tradicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5-27B, no se especifica variante) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (modelo denso, todos los parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (original); otras cuantizaciones no publicadas |
| Idiomas soportados | Tibetano, mongol tradicional, uigur (ademas de los idiomas del modelo base Qwen3.5, no especificados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards de 5 GB maximo) |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint intermedio `qwen35-27b-ancient-stage2-checkpoint-227-merged`, que ya incorpora un ajuste fino en dos etapas sobre lenguas antiguas. Sobre esta base se entrena un adaptador LoRA de rango 32 y alpha 32 mediante GRPO, un algoritmo de optimización de política proximal adaptado a preferencias. El adaptador se fusiona después en los pesos completos del modelo, dando lugar a los safetensors en bfloat16 que se publican en este repositorio. No se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas adicionales como RLHF o DPO más allá del GRPO mencionado.

La evaluación se realiza sobre un subconjunto independiente de 300 prompts divididos en seis cubos (anotación y traducción para cada uno de los tres idiomas), con pensamiento habilitado, temperatura 0.7 y top-p 0.95. Se comparan las métricas del modelo base frente al checkpoint paso 100, con intervalos de confianza bootstrap de 10 000 muestras emparejadas.

## Capacidades

- Generación de texto y respuesta a instrucciones en tibetano, mongol tradicional y uigur.
- Anotación de textos: produce etiquetas o anotaciones lingüísticas estructuradas (por ejemplo, en formato `<ANS>...</ANS>`).
- Traducción entre estos idiomas antiguos y, presumiblemente, desde/hacia otros idiomas del modelo base, aunque no se especifica cuáles.
- Extracción de respuestas estructuradas: el modelo genera contenido delimitado por etiquetas `<ANS>`, lo que facilita el postprocesado automático.
- Soporte de pensamiento (thinking mode) habilitado durante la evaluación, lo que sugiere capacidad de razonamiento extendido.
- No se menciona soporte de tool calling, agentes, visión ni audio; es un modelo puramente textual.

## Casos de uso

- Digitalización y anotación de manuscritos tibetanos: el modelo puede etiquetar automáticamente segmentos de texto (por ejemplo, categorías gramaticales o referencias) en corpus históricos, reduciendo el trabajo manual de filólogos.
- Traducción asistida de documentos en mongol tradicional: útil para archivos históricos, literatura y documentos legales, donde la precisión terminológica es crítica.
- Creación de corpus paralelos uigur-español o uigur-chino: el modelo puede generar traducciones preliminares que luego se revisan por traductores humanos, acelerando el proceso.
- Enriquecimiento de bases de datos de patrimonio cultural: las salidas con etiquetas `<ANS>` permiten integrar el modelo en pipelines de extracción de información para museos o bibliotecas digitales.
- Evaluación comparativa de modelos multilingües: al ser un checkpoint de RL sobre una base ya especializada, sirve como referencia para medir el impacto del refuerzo en lenguas de bajos recursos.
- Prototipos de asistentes de investigación en estudios asiáticos: investigadores pueden consultar al modelo sobre pasajes concretos y obtener respuestas estructuradas para su análisis.

## Benchmarks y rendimiento

La model card incluye una evaluación propia sobre 300 prompts (50 por cubo) con métricas emparejadas frente al modelo base. No se proporcionan benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica semantica | Base | Paso 100 | Delta | IC 95% |
|---|---:|---:|---:|---:|
| Exact | 0.3133 | 0.3400 | +0.0267 | [-0.0167, +0.0733] |
| Char-F1 | 0.5499 | 0.5579 | +0.0080 | [-0.0328, +0.0495] |
| BERTScore-F1 | 0.7638 | 0.7657 | +0.0019 | [-0.0309, +0.0348] |
| Composite semantico | 0.5915 | 0.6015 | +0.0100 | [-0.0260, +0.0473] |
| Tiene respuesta | 0.9533 | 0.9467 | -0.0067 | [-0.0400, +0.0267] |

| Metrica SacreBLEU2 | Base | Paso 100 | Delta |
|---|---:|---:|---:|
| BLEU-2 corpus (%) | 34.30 | 39.86 | +5.56 pp |
| BLEU-2 media por frase (%) | 46.12 | 48.10 | +1.98 pp |
| Respuesta extraida no vacia | 95.0% | 94.7% | -0.3 pp |

Desglose por cubo (corpus BLEU-2, base -> paso 100):

| Cubo | Delta corpus BLEU-2 | Delta frase BLEU-2 | No vacio paso 100 |
|---|---:|---:|---:|
| Anotacion tibetana | -2.41 pp | +1.42 pp | 94.0% |
| Traduccion tibetana | +2.47 pp | -0.43 pp | 94.0% |
| Anotacion mongol tradicional | +16.77 pp | +6.01 pp | 92.0% |
| Traduccion mongol tradicional | +0.63 pp | +4.85 pp | 100.0% |
| Anotacion uigur | +5.62 pp | -0.63 pp | 88.0% |
| Traduccion uigur | +2.12 pp | +0.64 pp | 100.0% |

El autor advierte que la mejora semántica agregada es pequeña y su intervalo de confianza cruza cero, aunque la mejora en BLEU-2 corpus se debe principalmente a la anotación en mongol tradicional.

## Requisitos de hardware

- VRAM estimada: el modelo en bfloat16 ocupa aproximadamente 54.7 GB (tamaño del repositorio). Para inferencia en esta precisión se necesitan al menos 60 GB de memoria GPU (considerando overhead de activaciones y KV cache).
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 con 24 GB cada una usando `device_map="auto"`).
- No cabe en una GPU de consumo estándar (8-16 GB) sin cuantización. No se publican cuantizaciones GGUF o AWQ, pero el usuario puede convertirlo con herramientas como llama.cpp o AutoAWQ para reducir la huella.
- Opciones de despliegue: `transformers` con `device_map="auto"` (como en el ejemplo de la model card), vLLM, TGI, o llama.cpp tras conversión a GGUF.
- Latencia y throughput: no se proporcionan datos medidos; para un modelo de 27B en bfloat16 en una A100, se espera una generación de decenas de tokens por segundo, dependiendo del tamaño de la ventana de contexto.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos especializados en lenguas antiguas (tibetano, mongol tradicional, uigur) con los que comparar directamente. El modelo base Qwen3.5-27B genérico podría servir de referencia, pero no se publican sus métricas en estos dominios. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Checkpoint exploratorio: el autor indica que es un punto intermedio del entrenamiento RL y que las mejoras semánticas agregadas no son estadísticamente significativas (el intervalo de confianza cruza cero).
- Riesgo de alucinación: como todo modelo generativo, puede producir traducciones o anotaciones incorrectas, especialmente en lenguas con pocos recursos y variantes dialectales.
- Cobertura lingüística limitada: solo se validan tres idiomas (tibetano, mongol tradicional, uigur); el comportamiento en otros idiomas del modelo base no está documentado.
- Sin benchmarks estándar: no hay resultados en MMLU, HumanEval, etc., lo que dificulta la comparación con modelos generalistas.
- Requisitos de hardware elevados: la versión bfloat16 necesita GPUs de alta gama; no se ofrecen cuantizaciones oficiales.
- Dependencia de `trust_remote_code=True`: el modelo requiere código remoto para cargarse, lo que implica un riesgo de seguridad si no se audita el código.
- Sin garantías de producción: al ser un checkpoint de investigación, no se recomienda su uso directo en entornos críticos sin una validación adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MooreMuaMu/qwen35-27b-ancient-rl-r32-step100
- Repositorio del adaptador LoRA (hermano): https://huggingface.co/MooreMuaMu/qwen35-27b-ancient-rl-r32-step100-lora (mencionado en la model card, no verificado)
- Modelo base: `qwen35-27b-ancient-stage2-checkpoint-227-merged` (sin URL pública en la información proporcionada)
