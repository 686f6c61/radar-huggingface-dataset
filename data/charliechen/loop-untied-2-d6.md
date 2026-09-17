# CharlieChen/loop-untied-2-d6

## Resumen

loop-untied-2-d6 es un checkpoint final de un modelo de lenguaje base de tipo looped transformer (transformer con repetición de bloques), publicado por el usuario CharlieChen en HuggingFace. Se trata del artefacto de entrenamiento original utilizado en la escalera de escalado sobre FineWeb del artículo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Corresponde a la variante "Untied 2" con coordenada de profundidad d6, donde la profundidad es la coordenada de escalado de la escalera y no necesariamente el número de bloques Transformer ejecutados.

El modelo almacena 133.890.048 parámetros en FP32 (0,536 GB), con una anchura de 768, 6 cabezas de atención y una longitud de contexto de 2.048 tokens. Usa el tokenizador GPT-2 de tiktoken con un vocabulario de 50.257 tokens ampliado a 50.304 filas del modelo. Es un modelo preentrenado sin ajuste por instrucciones, y el repositorio no incluye estado del optimizador, por lo que no está pensado para reanudar entrenamiento, sino para evaluación y reproducción de resultados.

Su relevancia es fundamentalmente académica: sirve como material reproducible para investigar cómo crecen los exponentes de escalado en función del crecimiento del modelo, la recursión y los operadores de frontera. No es un checkpoint compatible con `AutoModel` de Transformers, sino un artefacto de PyTorch que requiere el código del artículo para reconstruir la clase `TransformerGPT`. La licencia no está declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer), clase personalizada `TransformerGPT`, modo de profundidad `dep` |
| Parametros totales | 133.890.048 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en FP32; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`final.pt`), no safetensors ni GGUF; incluye pesos aprendidos y argumentos de entrenamiento |
| Anchura (hidden size) | 768 |
| Cabezas de atencion | 6 |
| Vocabulario | 50.257 tokens (tokenizador GPT-2 de tiktoken), ampliado a 50.304 filas del modelo |
| Repeticiones del nucleo configuradas | 2 |
| Repeticiones en evaluacion final | 2 |
| Corpus de entrenamiento | FineWeb (HuggingFaceFW/fineweb) |
| NLL de validacion en preentrenamiento | 3,428605 nats/token |
| Tamano del repositorio | 0,5 GB |
| Estado del optimizador | no incluido |
| Ajuste por instrucciones | no (modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucle, es decir, un modelo en el que un núcleo de bloques se repite un número configurable de veces. En este checkpoint el núcleo se repite 2 veces tanto en configuración como en la evaluación final. La coordenada de profundidad d6 es la coordenada de escalado dentro de la escalera experimental del artículo, y el propio autor advierte que no tiene por qué coincidir con el número de bloques Transformer realmente ejecutados. La anchura es de 768 con 6 cabezas de atención, lo que da una dimensión de cabeza de 128, y el modelo se entrena y evalúa con el tokenizador GPT-2.

El entrenamiento se realizó sobre el corpus FineWeb con un contexto de 2.048 tokens. Según la model card, el artículo usa GPUs H100, FlashAttention-3 y autocast en bfloat16. El checkpoint distribuido es el artefacto original de la escalera de escalado sobre FineWeb y no contiene estado del optimizador, por lo que no permite reanudar el entrenamiento. El único dato de rendimiento declarado es la NLL de validación de preentrenamiento de 3,428605 nats/token, medida sobre el propio corpus de preentrenamiento y distinta de la NLL de respuestas del benchmark CORE. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO (al ser un modelo base, no se espera ajuste por preferencias).

## Capacidades

- Generación de texto autoregresiva en inglés, en modo de completado sin instrucciones.
- Modelo base preentrenado: no sigue instrucciones ni mantiene formato conversacional sin ajuste adicional.
- Capacidad de razonamiento, código y matemáticas: no documentada y presumiblemente limitada por el tamaño (133,9 M de parámetros) y por el corpus de preentrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el modelo está etiquetado únicamente para inglés.
- Capacidad especial: su interés principal es la recursión de bloques como mecanismo de escalado, evaluable con la suite CORE de 22 tareas a través del código del artículo.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Reproducción de experimentos de escalado: cargar `final.pt` con el código de `cue-engineering/loop` y ejecutar `eval.py` sobre las 22 tareas CORE con las semillas 0, 1 y 2 para verificar los resultados del artículo.
- Estudio de looped transformers: analizar cómo afecta la repetición del núcleo (2 repeticiones configuradas) al coste computacional por token frente a un transformer de parámetros equivalentes.
- Investigación sobre coordenadas de profundidad: usar d6 como punto de la escalera para estudiar la relación entre la coordenada de profundidad, el crecimiento del modelo y los exponentes de escalado.
- Baseline académico en inglés: emplearlo como referencia de 133,9 M de parámetros en comparaciones controladas con otros modelos pequeños del mismo rango, dado que comparte tokenizador GPT-2.
- Fine-tuning ligero para tareas de PLN en inglés: al ocupar 0,536 GB en FP32, se puede ajustar en una sola GPU de consumo para clasificación de texto, análisis de sentimiento o resumen extractivo con contexto de hasta 2.048 tokens.
- Generación de datos sintéticos en inglés: producir texto de dominio general a pequeña escala para aumento de datos o para preentrenamiento de modelos aún más pequeños, asumiendo la necesidad de filtrado posterior.
- Docencia y prototipado: servir de ejemplo reproducible de arquitectura no estándar (bucle de bloques) en cursos de arquitecturas de transformers, con inferencia viable incluso en CPU o en GPUs de gama baja.
- Estudio de eficiencia computacional: medir FLOPs por token y calidad (NLL) para evaluar si la recursión compensa frente a aumentar la profundidad de forma no compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico declarado por el autor es la NLL de validación en el corpus de preentrenamiento, que se recoge en la tabla siguiente junto con los datos de configuración asociados.

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion (preentrenamiento) | 3,428605 nats/token | medida sobre FineWeb; distinta de la NLL de respuestas CORE |
| Suite CORE | sin resultados publicados | el código permite ejecutar 22 tareas con semillas 0/1/2; los resultados de la prueba de humo (`--max-per-task 10`) no equivalen a los resultados completos del artículo |
| MMLU, HumanEval, GSM8K u otros | no disponible | no se han publicado en la informacion disponible |

## Requisitos de hardware

- Pesos: 0,536 GB en FP32; aproximadamente 0,27 GB si se convierte a bfloat16 o float16.
- VRAM estimada para inferencia: por debajo de 1 GB para los pesos; el consumo total depende de la caché KV, que es reducida dado el contexto máximo de 2.048 tokens y las 6 cabezas de atención. La información disponible no indica el número de capas, por lo que no se puede calcular la caché KV exacta.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia; el artículo original usa H100 con FlashAttention-3 y autocast en bfloat16 para el entrenamiento y la evaluación.
- GPU de consumo: sí, cabe en cualquier GPU de consumo moderna (por ejemplo, series GTX 10xx en adelante, RTX 20xx/30xx/40xx) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el checkpoint no es un `AutoModel` de Transformers, por lo que no es cargable directamente en vLLM, llama.cpp, Ollama o TGI sin una conversión previa no documentada. La vía soportada es el repositorio `cue-engineering/loop` con `eval.py`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de evaluaciones comparativas publicadas para este modelo. La tabla siguiente recoge únicamente referencias de la misma categoría por tamaño, con datos públicos de sus especificaciones; no implica comparación de rendimiento.

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loop-untied-2-d6 | 133.890.048 | 2.048 | GPT-2 (tiktoken) | no disponible | HuggingFace, formato PyTorch no estándar |
| GPT-2 (small) | 124 M | 1.024 | GPT-2 (BPE) | MIT (según su publicación original) | Ampliamente disponible en formato Transformers |
| Modelos base de ~130-160 M de la familia Pythia | 160 M | 2.048 | GPT-NeoX | Apache 2.0 | HuggingFace, formato Transformers |

La comparación de rendimiento entre estos modelos con loop-untied-2-d6 no está disponible; cualquier comparación requeriría ejecutar la suite CORE o medir perplejidad sobre un corpus común con el código del artículo.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde a peticiones en formato conversacional ni sigue instrucciones de sistema.
- Riesgo de alucinación alto: al no haber pasado por RLHF ni DPO, no hay alineación de comportamiento ni filtros de seguridad.
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento sobre FineWeb, un corpus web, implica que puede reproducir sesgos presentes en ese contenido.
- Limitación de idioma: solo inglés según las etiquetas del repositorio; no se ha validado su comportamiento en castellano.
- Limitación de contexto: 2.048 tokens, insuficiente para tareas que requieran documentos largos o conversaciones extensas.
- Licencia no declarada: la ausencia de licencia explícita impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier uso en producción.
- Formato no estándar: al no ser un checkpoint de Transformers, requiere el código del artículo para reconstruir la clase `TransformerGPT`; no se puede cargar con `AutoModel` ni con las herramientas habituales de cuantización.
- Sin estado del optimizador: no es posible reanudar el entrenamiento desde este artefacto.
- Métrica limitada: la NLL de validación está medida sobre el propio corpus de preentrenamiento (FineWeb) y no es extrapolable a otros dominios.
- Los resultados de la evaluación de humo (`--max-per-task 10`) no deben citarse como resultados completos del artículo.
- Capacidad de razonamiento, código y matemáticas no documentada y previsiblemente baja para 133,9 M de parámetros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/CharlieChen/loop-untied-2-d6
- Código del artículo (evaluación y reconstrucción del modelo): https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Artículo citado: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (sin enlace disponible en la información proporcionada)
- Tokenizador: `tiktoken.get_encoding("gpt2")` (sin enlace específico en la información proporcionada)
