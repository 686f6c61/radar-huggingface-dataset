# shubhamprakash108/decoder-only-transformer-tinystories-32m

## Resumen

El modelo `decoder-only-transformer-tinystories-32m` es un transformer decoder-only de estilo GPT entrenado desde cero con PyTorch por el desarrollador shubhamprakash108. Con 33.500.416 parámetros, está diseñado para generación de texto causal y se distribuye bajo licencia Apache 2.0. Su arquitectura es muy compacta: un único bloque transformer con 8 cabezas de atención, dimensión oculta de 768 y vocabulario de 32.000 tokens, lo que lo convierte en un candidato ideal para experimentación educativa y prototipado rápido.

El modelo resuelve el problema de ofrecer una implementación minimalista y reproducible de un GPT pequeño, entrenable en hardware modesto. Su relevancia actual radica en que permite a desarrolladores e investigadores estudiar el funcionamiento interno de los transformers, probar técnicas de fine-tuning o realizar análisis de interpretabilidad sin necesidad de recursos de cómputo elevados. La ventana de contexto es de 1024 tokens, suficiente para tareas de generación de texto corto.

No se han publicado datos sobre el conjunto de datos de entrenamiento, aunque el nombre sugiere una posible relación con el corpus TinyStories, sin confirmación oficial en la model card. El tokenizer es un BPE personalizado entrenado con la librería `tokenizers` de HuggingFace, e incluye los tokens especiales `<|endoftext|>`, `<|pad|>` y `<|unk|>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (transformer decoder-only) |
| Parametros totales | 33.500.416 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT original: un transformer decoder-only con causal masking. La configuración concreta incluye 1 bloque transformer, 8 cabezas de atención, dimensión oculta de 768, tamaño de vocabulario de 32.000 tokens y dropout de 0.2. Esta configuración es inusualmente pequeña en número de bloques, lo que limita la profundidad de las representaciones pero facilita su entrenamiento y análisis.

El entrenamiento se realizó con el optimizador AdamW (lr=3e-4, betas=(0.9, 0.95), weight_decay=0.1), un scheduler CosineAnnealingLR con eta_min=1e-5, función de pérdida CrossEntropyLoss para predicción del siguiente token y gradient clipping con max_norm=1.0. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El tokenizer es un BPE entrenado desde cero, lo que implica que el modelo no es compatible con tokenizers preexistentes.

## Capacidades

- Generacion de texto causal: el modelo predice el siguiente token dado un contexto, permitiendo generar secuencias coherentes de hasta 1024 tokens.
- Completado de texto: puede continuar frases o párrafos cortos, útil para prototipos de autocompletado.
- Tokenizer personalizado: incluye tokens especiales para fin de secuencia, padding y desconocidos, facilitando su uso en pipelines de generación.
- Carga mediante `trust_remote_code=True`: el código personalizado de la arquitectura se ejecuta desde el repositorio de HuggingFace.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni capacidades multimodales (visión, audio). Tampoco se ha documentado un modo de pensamiento o razonamiento explícito.

## Casos de uso

- Educacion y aprendizaje de arquitecturas transformer: por su tamaño reducido y código accesible, es ideal para que estudiantes y desarrolladores comprendan el funcionamiento de un decoder-only, desde la atención hasta la generación autoregresiva.
- Experimentacion con fine-tuning: al tener solo 33,5 millones de parámetros, se puede ajustar en una GPU doméstica (por ejemplo, una RTX 3060 con 8 GB) o incluso en CPU para tareas específicas como generación de texto en un dominio concreto.
- Prototipado de generacion de texto corto: permite validar ideas de productos que requieran completar frases o generar respuestas breves, como chatbots simples o asistentes de escritura, sin incurrir en costes de inferencia elevados.
- Investigacion en interpretabilidad: su tamaño facilita el análisis de mapas de atención, activaciones de neuronas y representaciones internas, sirviendo como banco de pruebas para estudios de mecánica interpretativa en transformers.
- Benchmarking de frameworks de inferencia: se puede utilizar para medir el rendimiento de librerías como `transformers`, `vLLM` o `llama.cpp` en escenarios de baja latencia, dado que su carga es mínima.
- Demostraciones en tiempo real: al ser ligero, puede ejecutarse en navegadores mediante WebGPU o en dispositivos edge, permitiendo demos interactivas de generación de texto sin servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, por lo que no es posible comparar su rendimiento cuantitativo con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 33,5 millones de parámetros, el modelo en FP32 ocupa aproximadamente 134 MB, y en FP16 unos 67 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso puede ejecutarse en CPU sin problemas.
- GPUs recomendadas: cualquier GPU moderna con soporte CUDA (desde GTX 1060 en adelante) es suficiente. También funciona en Apple Silicon y en CPUs x86 con instrucciones AVX.
- Opciones de despliegue: el formato safetensors permite cargarlo con `transformers` (requiere `trust_remote_code=True`). No se proporcionan cuantizaciones GGUF ni AWQ, pero podría convertirse a GGUF para usarse con `llama.cpp` u Ollama si se realiza la conversión manualmente.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado su tamaño, se espera una latencia de milisegundos por token en GPU y de decenas de milisegundos en CPU, aunque estos valores son orientativos.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos. Como referencia estructural, se puede comparar con GPT-2 small (124M parámetros, contexto 1024, vocabulario 50.257) y con modelos de la familia TinyStories (por ejemplo, TinyStories-33M de HuggingFace, si existe). Sin embargo, al no haber datos de rendimiento publicados, no es posible establecer una comparativa cuantitativa. La principal diferencia es el tamaño: este modelo es significativamente menor que GPT-2 small, lo que implica menor capacidad de modelado pero también menor coste de inferencia. La licencia Apache 2.0 es más permisiva que la de GPT-2 (MIT, pero con restricciones de uso en algunos casos), aunque ambos permiten uso comercial.

## Limitaciones y advertencias

- Capacidad limitada: con un único bloque transformer, el modelo no puede capturar dependencias complejas ni razonamiento profundo. Su rendimiento en tareas que requieren comprensión semántica avanzada será pobre.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto plausible pero factualmente incorrecto, especialmente al carecer de grounding externo.
- Contexto corto: la ventana de 1024 tokens restringe la coherencia en textos largos y limita su uso en tareas que requieran memoria extendida.
- Idioma: solo entrenado en inglés, por lo que no es adecuado para generación en otros idiomas sin fine-tuning previo.
- Código personalizado: al requerir `trust_remote_code=True`, se ejecuta código arbitrario del repositorio. Es recomendable auditar el código antes de usarlo en entornos de producción.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF o INT8, lo que puede limitar su despliegue en entornos con restricciones de memoria.
- Datos de entrenamiento no documentados: no se especifica el corpus ni el número de tokens, lo que dificulta evaluar posibles sesgos o la cobertura del vocabulario.

## Enlaces

- [HuggingFace: shubhamprakash108/decoder-only-transformer-tinystories-32m](https://huggingface.co/shubhamprakash108/decoder-only-transformer-tinystories-32m)
