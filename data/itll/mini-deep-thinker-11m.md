# ITLL/Mini.Deep.Thinker.11m

## Resumen

Mini.Deep.Thinker.11m es un modelo de lenguaje causal de tipo decoder-only, desarrollado por ITLL y entrenado desde cero con el objetivo de explorar capacidades de razonamiento explícito (chain-of-thought) en un tamaño extremadamente reducido. Con aproximadamente 12,4 millones de parámetros reales (11 millones según la model card), una ventana de contexto de 1096 tokens y una arquitectura transformer de 7 capas, el modelo está diseñado como un banco de pruebas para técnicas de entrenamiento con tokens de razonamiento especiales (`<|think|>`, `<|thought|>`, `<|reasoning|>`, `<|answer|>`).

El modelo se entrena sobre el dataset `Plans11/Organized_PreTrain_1k_Context`, con una política estricta de límite de contexto por ejemplo (1095 tokens de contenido + EOS) y deduplicación mediante hash SHA-256. El progreso actual reportado es de 20.000 ejemplos únicos y 625 pasos de optimización, con una pérdida de 3,06 en el último lote. Su relevancia reside en servir como plataforma experimental para estudiar el impacto del razonamiento estructurado en modelos pequeños, aunque el autor advierte explícitamente que no se garantiza la corrección factual o lógica de sus salidas.

La licencia MIT permite uso comercial y modificación sin restricciones, y los pesos se distribuyen en formato safetensors, lo que facilita su integración en proyectos de investigación y educación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) |
| Parametros totales | 12.446.688 (según safetensors); 11.004.896 (según model card) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1096 tokens |
| Tipos de cuantizacion | no disponible (solo pesos completos en safetensors) |
| Idiomas soportados | no disponible (no especificado en la documentación) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar con 7 capas, 8 cabezas de atención, dimensión oculta de 352 y tamaño intermedio de 1152. El vocabulario se limita a 4096 tokens, lo que reduce drásticamente el número de parámetros de embedding y hace viable el entrenamiento desde cero en hardware modesto. La configuración incluye tokens especiales de razonamiento que estructuran la generación en fases: entrada, pensamiento, razonamiento y respuesta final.

El entrenamiento se realiza con el objetivo de predicción del siguiente token (next-token prediction) estricta, sin división de ejemplos largos: cada ejemplo se limita a 1095 tokens de contenido más un token EOS, y se rellena hasta 1096 posiciones. La selección de ejemplos se hace mediante un escaneo determinista con barajado y deduplicación por hash SHA-256, y cada sesión de entrenamiento procesa 20.000 ejemplos nuevos. El estado de entrenamiento se persiste en Hugging Face, incluyendo el modelo, el optimizador, el tokenizador y metadatos de progreso, lo que permite reanudar el entrenamiento de forma fiable. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo produce secuencias que intercalan tokens de pensamiento (`<|think|>`, `<|thought|<|reasoning|>`) antes de emitir una respuesta final, simulando un proceso de razonamiento interno.
- Razonamiento multi-paso limitado: gracias a la estructura de tokens de razonamiento, el modelo puede encadenar pasos lógicos dentro de su ventana de contexto, aunque su pequeño tamaño limita la profundidad y fiabilidad del razonamiento.
- Modelado de lenguaje causal: capacidad básica de predicción de siguiente token y generación autogregresiva.
- Entrenamiento desde cero: no depende de pesos preentrenados externos, lo que permite estudiar el efecto de los datos y la arquitectura en un entorno controlado.
- No se reportan capacidades de tool calling, visión, audio ni soporte de agentes. El modelo es puramente textual y no se han documentado capacidades multilingües específicas.

## Casos de uso

- Investigación educativa sobre razonamiento en modelos pequeños: el modelo sirve como banco de pruebas para analizar cómo los tokens de razonamiento afectan a la calidad de las respuestas en arquitecturas de menos de 15M de parámetros. Se puede usar para comparar con variantes sin tokens de razonamiento.
- Prototipado de pipelines de generación estructurada: al tener tokens especiales de entrada y respuesta, es útil para experimentar con formatos de prompt que obliguen al modelo a separar el proceso de pensamiento de la respuesta final, por ejemplo en sistemas de preguntas y respuestas simples.
- Fine-tuning en dominios específicos: gracias a su tamaño reducido y licencia MIT, se puede adaptar a tareas concretas como clasificación de texto corto o generación de fragmentos de código, siempre que el dominio se ajuste a su ventana de contexto de 1096 tokens.
- Evaluación de técnicas de deduplicación y gestión de datos: el pipeline de entrenamiento con hash SHA-256 y selección determinista puede replicarse para estudiar el impacto de la deduplicación en la pérdida y la generalización.
- Pruebas de resumibilidad del entrenamiento: el mecanismo de persistencia del estado (optimizer, progreso, ejemplos vistos) permite experimentar con interrupciones y reanudaciones del entrenamiento, útil para validar infraestructuras de entrenamiento distribuido.
- Demostración de despliegue ligero: al caber en menos de 50 MB, es adecuado para demostrar inferencia en CPU, dispositivos embebidos o como componente en aplicaciones de bajo consumo donde se requiera un generador de texto básico con estructura de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento (3,06 en el último lote), sin métricas de evaluación como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB en FP32 (el modelo ocupa unos 50 MB en safetensors). Con cuantización a 8 bits, la huella sería aún menor, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas de entrada como NVIDIA GTX 1650 o integradas. También funciona en CPU sin problemas.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier dispositivo moderno, incluidos Raspberry Pi 4/5 con suficiente RAM.
- Opciones de despliegue: al ser un modelo PyTorch estándar, se puede servir con frameworks como vLLM (si se adapta a su formato), llama.cpp (si se convierte a GGUF), o directamente con la API de Transformers de Hugging Face. También puede ejecutarse en Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia de milisegundos por token en CPU moderna y de microsegundos en GPU.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. Como referencia cualitativa, modelos de tamaño similar como GPT-2 pequeño (124M) o TinyLlama (1.1B) son mucho más grandes y con capacidades superiores, pero no son comparables en términos de filosofía de diseño (entrenamiento desde cero con tokens de razonamiento). No hay datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental: el autor advierte explícitamente que no se garantiza la corrección factual o lógica de las salidas. No debe usarse en producción para tareas que requieran fiabilidad.
- Contexto muy limitado: 1096 tokens, insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- Vocabulario reducido (4096 tokens): limita la cobertura de idiomas y dominios técnicos. No se especifican los idiomas soportados.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que se desconoce su rendimiento real en tareas estándar.
- Riesgo de alucinación: al ser un modelo pequeño entrenado con pocos datos, es probable que genere contenido inventado o inconsistente, especialmente en dominios fuera de su distribución de entrenamiento.
- Sesgos desconocidos: no se ha documentado ningún análisis de sesgos. El dataset de entrenamiento (`Plans11/Organized_PreTrain_1k_Context`) no está descrito en detalle, por lo que no se puede evaluar su representatividad.
- Progreso de entrenamiento incompleto: con solo 20.000 ejemplos y 625 pasos, el modelo está lejos de converger. La pérdida de 3,06 indica que aún no ha aprendido patrones robustos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/Mini.Deep.Thinker.11m
- Dataset de entrenamiento: `Plans11/Organized_PreTrain_1k_Context` (no se proporciona URL directa en la información disponible)
