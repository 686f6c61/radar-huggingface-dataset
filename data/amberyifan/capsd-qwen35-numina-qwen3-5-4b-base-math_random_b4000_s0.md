# AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_random_b4000_s0

## Resumen

El modelo `capsd-qwen35-numina-Qwen3.5-4B-Base-math_random_b4000_s0` es un ajuste fino completo (full fine-tuning) del modelo base `Qwen/Qwen3.5-4B-Base`, realizado por el usuario AmberYifan. Se trata de un modelo de 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) con pipeline de imagen-texto a texto, lo que sugiere que hereda capacidades multimodales del modelo base de la serie Qwen3.5. El ajuste se realizó sobre un dataset denominado `capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_random_b4000_s0`, que por su nombre parece incluir 80.000 muestras con una mezcla de datos matemáticos y aleatorios, aunque no se proporcionan detalles adicionales.

Este modelo es relevante porque representa un ejemplo de fine-tuning de la reciente serie Qwen3.5, que según la documentación oficial integra fusión temprana de visión y lenguaje para tareas multimodales. Sin embargo, la model card es extremadamente escueta y no incluye evaluaciones ni descripciones de uso, por lo que cualquier afirmación sobre su rendimiento o capacidades específicas debe tomarse con precaución. La licencia se indica como "other", sin especificar términos concretos, lo que limita su uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-4B-Base, con capacidades de vision-lenguaje) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo del checkpoint `Qwen/Qwen3.5-4B-Base`. Según la información pública de la serie Qwen3.5, el modelo base emplea una arquitectura transformer con fusión temprana de modalidades de visión y lenguaje, entrenada sobre billones de tokens multimodales. No se dispone de detalles específicos sobre el número de capas, dimensión de atención o mecanismos de atención (lineal, especulativa, etc.) para esta variante concreta de 4B parámetros.

El entrenamiento se realizó con el framework Llama-Factory en modo "full" (todos los parámetros actualizados). Los hiperparámetros documentados incluyen una tasa de aprendizaje de 1e-05, tamaño de lote efectivo de 64 (batch size 2 con acumulación de gradientes de 8 en 4 GPUs), scheduler coseno con warmup del 3% y una sola época. El dataset de entrenamiento, según el nombre, contiene 80.000 muestras con una mezcla de problemas matemáticos y datos aleatorios (posiblemente para regularización), pero no se aporta información sobre su composición exacta ni sobre el proceso de preparación. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores.

## Capacidades

- Generacion de texto y razonamiento: al ser un fine-tune de un modelo base de 4B, puede realizar tareas de generación de texto, razonamiento básico y respuesta a instrucciones, aunque sin garantías de calidad sin evaluaciones.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base acepta entradas de imagen y texto, y el fine-tune podría conservar esa capacidad, pero no hay confirmación experimental.
- Capacidades matematicas: el nombre del dataset indica un énfasis en problemas matemáticos (`math_random`), por lo que es plausible que el modelo haya sido optimizado para razonamiento numérico, aunque no se aportan métricas.
- Tool calling y agentes: no hay información al respecto; el modelo base Qwen3.5 podría soportarlas, pero no se documenta en esta ficha.
- Multilingüismo: no se especifican idiomas soportados.

## Casos de uso

- Investigacion academica: como punto de partida para estudiar el efecto del fine-tuning en modelos multimodales pequeños, comparando el comportamiento antes y después del ajuste.
- Prototipado de asistentes de razonamiento matematico: si se confirma la especialización en matemáticas, podría usarse en entornos educativos o de resolución de problemas con entrada de imagen (por ejemplo, leer ecuaciones escritas a mano).
- Experimentos de alineacion y regularizacion: el dataset mezcla datos matemáticos con datos aleatorios, lo que puede servir para investigar cómo afecta la inclusión de ruido controlado al rendimiento final.
- Evaluacion de pipelines de fine-tuning: dado que se generó con Llama-Factory, puede utilizarse como caso de prueba para reproducir flujos de entrenamiento con Transformers 5.8.0 y PyTorch 2.13.
- Desarrollo de demos multimodales: si se mantienen las capacidades de visión, podría integrarse en aplicaciones que requieran describir imágenes o responder preguntas visuales, aunque con cautela por la falta de validación.
- Benchmarking de modelos de 4B: útil para comparar el efecto de diferentes datasets de entrenamiento en la misma arquitectura base, siempre que se ejecuten evaluaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La sección `model-index` de la model card contiene una entrada con `results: []`, lo que indica que no hay métricas oficiales declaradas por el autor. Cualquier afirmación sobre rendimiento debe basarse en evaluaciones independientes que el usuario realice.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros, en precisión FP16 los pesos ocupan aproximadamente 9,1 GB (coincide con el tamaño del repositorio). Para inferencia con contexto corto, se recomienda al menos 12 GB de VRAM; con cuantización a 8 bits podría reducirse a unos 6-7 GB, y a 4 bits a unos 3-4 GB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: tarjetas con 12-16 GB de VRAM como RTX 4070 Ti, RTX 4080, RTX 4090, A10, L4 o A100 (para mayor velocidad). En GPUs con menos de 10 GB se necesitaría cuantización agresiva o carga en CPU.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en una RTX 3090/4090 (24 GB) sin problemas, o en una RTX 3060 (12 GB) con cuantización.
- Opciones de despliegue: al estar en formato safetensors, se puede usar con Transformers, vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (mediante conversión previa).
- Latencia y throughput: no disponibles; dependerán del hardware y de la implementación de atención del modelo base.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que una comparativa cuantitativa no es posible. A nivel de arquitectura y tamaño, se puede contrastar con:

| Modelo | Parametros | Contexto | Licencia | Pipeline |
|---|---|---|---|---|
| capsd-qwen35-numina (este) | 4,5B | no disponible | other | image-text-to-text |
| Qwen3-4B | 4B | 32K (según documentación de Qwen3) | Apache 2.0 | text-only |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 | text-only |

La comparativa es limitada porque el modelo evaluado es un fine-tune sin métricas públicas, mientras que los otros son modelos base con amplia documentación. Se recomienda ejecutar evaluaciones propias (por ejemplo, MMLU, GSM8K, HumanEval) para establecer una comparación justa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo base ajustado sin alineación adicional (no se menciona RLHF), puede generar respuestas incorrectas o inventadas, especialmente en dominios fuera de los datos de entrenamiento.
- Datos de entrenamiento desconocidos: el dataset `capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_random_b4000_s0` no está documentado; no se sabe su procedencia, licencia ni calidad, lo que introduce riesgos de contaminación o sesgos no controlados.
- Licencia restrictiva: la licencia "other" no especifica términos; antes de cualquier uso comercial o distribución, es imprescindible contactar con el autor para conocer las condiciones exactas.
- Falta de validacion: no hay benchmarks ni evaluaciones independientes; el modelo no debería usarse en producción sin una validación exhaustiva.
- Contexto limitado: se desconoce la longitud de contexto soportada; si el modelo base tiene una ventana de 32K, el fine-tuning podría haberla mantenido, pero no hay confirmación.
- Capacidades multimodales inciertas: aunque el pipeline es image-text-to-text, el fine-tuning podría haber degradado o alterado la percepción visual; se recomienda probar con entradas de imagen antes de asumir su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_random_b4000_s0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Página de Ollama para Qwen3.5: https://ollama.com/library/qwen3.5:4b
