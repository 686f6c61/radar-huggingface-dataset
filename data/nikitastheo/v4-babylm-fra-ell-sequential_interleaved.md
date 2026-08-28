# nikitastheo/v4-babylm-fra-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v4-babylm-fra-ell-sequential_interleaved` es un modelo de lenguaje causal (causal-LM) basado en la arquitectura GPT-2, desarrollado por nikitastheo como parte de la iniciativa BabyLM. BabyLM es un desafío académico que busca entrenar modelos de lenguaje con corpus restringidos y desarrollo plausible, simulando la cantidad de input lingüístico que recibe un humano en sus primeros años de vida. Este modelo concreto se entrena con un corpus bilingüe de francés y griego, utilizando una estrategia de intercalado secuencial de idiomas.

Con 108,5 millones de parámetros, se sitúa en la gama de modelos pequeños, comparable a GPT-2 medium. Su relevancia radica en explorar cómo el multilingüismo y la alternancia de idiomas durante el entrenamiento afectan a la eficiencia del aprendizaje con datos limitados. El modelo está disponible en formato safetensors y es compatible con la librería transformers, aunque no se especifica licencia ni idiomas soportados en la ficha de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder causal) |
| Parametros totales | 108.550.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances y griego (por el nombre y el corpus de entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar: un transformer decoder con atención causal, diseñado para generación de texto autoregresiva. No se especifican detalles sobre el número de capas, dimensiones ocultas o cabezas de atención, pero el tamaño de 108M parámetros sugiere una configuración similar a GPT-2 medium (aunque GPT-2 medium tiene 355M, por lo que probablemente sea una configuración personalizada más pequeña).

El entrenamiento se realizó con un script propio basado en Hugging Face Accelerate (sin usar `Trainer`). Los detalles clave incluyen: tokenizer propio (`nikitastheo/babylm-vocab15-fra-tokenizer`), 28.460 pasos máximos, learning rate de 0.0001 con scheduler lineal y 2.846 pasos de warmup, batch size de 32 y un "language switch epoch" de 10, lo que indica que cada 10 épocas se alterna el idioma de entrenamiento entre francés y griego de forma secuencial e intercalada. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto autoregresiva en francés y griego, con capacidad de alternar entre ambos idiomas según el contexto de entrada.
- Modelo causal-LM estándar, apto para tareas de completado de texto y generación condicionada.
- Entrenado con un corpus limitado (estilo BabyLM), lo que lo hace adecuado para investigación sobre eficiencia de datos y aprendizaje multilingüe.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Al ser un modelo pequeño, su capacidad de razonamiento complejo es limitada en comparación con modelos de mayor escala.

## Casos de uso

- Investigación académica sobre aprendizaje multilingüe con datos limitados: el modelo permite estudiar cómo la alternancia de idiomas durante el entrenamiento afecta a la transferencia entre francés y griego, comparando con modelos monolingües o con otras estrategias de mezcla.
- Evaluación de la eficiencia de datos en BabyLM: sirve como punto de referencia para medir el rendimiento de modelos pequeños en tareas de comprensión y generación con corpus restringidos.
- Generación de texto bilingüe controlada: puede utilizarse para producir texto en francés o griego según el prompt, aunque con calidad limitada por su tamaño.
- Experimentos de fine-tuning: al ser un modelo compacto, es viable ajustarlo en GPUs de consumo para tareas específicas como clasificación de texto o generación de respuestas en dominios concretos.
- Análisis de sesgos lingüísticos: permite examinar cómo el modelo distribuye probabilidades entre idiomas y si muestra preferencias por uno u otro en contextos ambiguos.
- Prototipado rápido de aplicaciones de generación de texto en francés o griego donde no se requiera alta calidad ni contexto largo, como chatbots educativos o generadores de ejercicios de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo se enmarca en el contexto BabyLM, donde las evaluaciones suelen centrarse en tareas de adquisición del lenguaje (BLiMP, etc.), pero no se proporcionan resultados concretos.

## Requisitos de hardware

- VRAM estimada: con 108M parámetros en fp32, el modelo ocupa aproximadamente 434 MB. En cuantización fp16 serían unos 217 MB, y en int8 unos 108 MB. Cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, o incluso CPUs con suficiente RAM para inferencia lenta.
- Es perfectamente viable en GPUs de consumo (gama baja y media) y en entornos sin GPU usando CPU.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con vLLM, TGI, o ejecutarse localmente con llama.cpp (si se convierte a GGUF) o directamente con el pipeline de transformers.
- Latencia y throughput: no se dispone de datos medidos, pero para un modelo de este tamaño, la generación en GPU consumer suele ser de decenas de tokens por segundo, y en CPU de unos pocos tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nikitastheo/v4-babylm-fra-ell-sequential_interleaved | 108M | no disponible | no disponible | Entrenado con corpus BabyLM bilingüe fra-ell |
| nikitastheo/v2-babylm-fra-ell-sequential_interleaved | no disponible | no disponible | no disponible | Versión anterior del mismo autor, misma estrategia |
| GPT-2 (base) | 124M | 1024 | MIT | Modelo original de OpenAI, monolingüe inglés |
| BabyLM (modelos de referencia) | varios | variable | variable | Modelos del desafío BabyLM, entrenados con corpus de 100M o 10M palabras |

No se dispone de información suficiente para comparar rendimiento real. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide su uso comercial sin consultar al autor. Es recomendable contactar con nikitastheo antes de cualquier despliegue en producción.
- El modelo es pequeño (108M) y entrenado con un corpus limitado (BabyLM), por lo que su calidad de generación es baja en comparación con modelos grandes. Puede producir texto incoherente o con errores gramaticales.
- No se documentan los idiomas exactos soportados, aunque por el nombre y el tokenizer se infiere francés y griego. No se garantiza un correcto funcionamiento en otros idiomas.
- No se han realizado evaluaciones de sesgos ni de seguridad. Al ser un modelo entrenado con datos web filtrados, puede reflejar sesgos presentes en el corpus.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, nombres o referencias, especialmente en contextos largos.
- Longitud de contexto no especificada: se desconoce el límite de tokens de entrada, lo que dificulta planificar su uso en aplicaciones que requieran contexto extenso.
- No hay soporte para tool calling, agentes ni razonamiento estructurado, limitando su uso en pipelines complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikitastheo/v4-babylm-fra-ell-sequential_interleaved
- Versión anterior (v2): https://huggingface.co/nikitastheo/v2-babylm-fra-ell-sequential_interleaved
- Versión small (v2): https://huggingface.co/nikitastheo/v2-babylm-small-fra-ell-sequential_interleaved
- Página oficial de BabyLM: https://babylm.github.io/
- Papers de BabyLM: https://babylm.github.io/papers.html
- Proyecto BabyLM de Alex Warstadt: https://alexwarstadt.github.io/projects/babylm/
