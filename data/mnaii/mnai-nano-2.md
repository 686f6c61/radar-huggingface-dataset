# MNAII/mnai-nano-2

## Resumen

MNAI Nano 2 es un modelo de lenguaje de 0,90B parámetros (899.753.472 exactamente) entrenado desde cero por MNAII (MeowSamOPDZN Studio / Meow x Nythera AI), sin partir de ningún modelo base ni fine-tune. Emplea una arquitectura transformer tipo Llama con 24 capas, atención con GQA 4:1, FFN SwiGLU de 6400 unidades y embeddings atados, junto con un tokenizador BPE propio de 32.768 tokens. El contexto es de 4096 tokens con RoPE theta 500k.

El modelo es relevante como ejercicio de transparencia radical: el autor publica el checkpoint del paso 146 de una tirada de 7.629 pasos y advierte explícitamente que genera texto casi sin sentido en este punto. No se trata, por tanto, de un modelo apto para producción, sino de un artefacto de investigación y un ejemplo reproducible de pipeline completo de preentrenamiento (tokenizador, bucle de entrenamiento, conversión a GGUF) que cualquiera puede replicar en una Colab T4.

La distribución actual es un único archivo GGUF cuantizado en Q4_K_M de 552 MB, pensado para ejecutarse en un portátil con 4 GB de RAM mediante llama.cpp o LM Studio. La licencia es Apache 2.0 para los pesos y MIT para el código de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (RMSNorm, SwiGLU, RoPE, GQA) |
| Parámetros totales | 899.753.472 (0,90B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | Q4_K_M (único archivo publicado); pesos originales en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (pesos); MIT (código de entrenamiento) |
| Formato de pesos | GGUF (Q4_K_M); checkpoints de entrenamiento en formato Hugging Face |

Detalles adicionales de arquitectura: hidden size 1536, 24 capas, 16 cabezas de consulta y 4 de clave/valor (GQA 4:1), feed-forward de 6400, vocabulario de 32.768 con tokenizador BPE propio, embeddings de entrada y salida atados, sin sesgos, RoPE theta 500k.

## Arquitectura y entrenamiento

El modelo sigue el layout estándar de bloque Llama de forma deliberada, para que el conversor estándar de llama.cpp pueda generar el GGUF sin código personalizado. La elección de GQA 4:1 reduce el coste de atención, el FFN ancho SwiGLU concentra la mayor parte de la capacidad y el atado de embeddings ahorra aproximadamente 50M parámetros.

El entrenamiento parte de pesos aleatorios y se ejecuta sobre FineWeb-Edu, split `sample-10BT`, en streaming desde Hugging Face y tokenizado al vuelo, mezclando `identity_data.txt` en aproximadamente 1 documento de cada 50 para que el modelo aprenda su propia identidad. El autor estima que el punto óptimo Chinchilla serían unos 18B tokens; una primera tirada útil sería de 1B tokens (35-55 horas de T4 repartidas en sesiones). El checkpoint publicado corresponde al paso 146 de 7.629. Se usa Adam de 8 bits por defecto (pesos bf16 1,8 GB, estados del optimizador ~0,9 GB, gradientes 1,8 GB), y los checkpoints se guardan en formato Hugging Face para permitir reanudar sesiones.

## Capacidades

- Generación de texto autoregresiva básica: el checkpoint actual produce texto cercano a la verborrea sin sentido, según reconoce el propio autor; no es utilizable para tareas reales todavía.
- Tokenizador BPE propio de 32.768 tokens, entrenado específicamente para este modelo.
- Capacidad de ejecución local en hardware muy modesto gracias a la cuantización Q4_K_M.
- No dispone de tool calling, function calling, modo de razonamiento, visión, audio ni capacidades de agente.
- Multilingüismo: no disponible; declarado únicamente en inglés.
- Reproducibilidad completa del pipeline de entrenamiento (tokenizador, entrenamiento, muestreo, conversión a GGUF) como capacidad de facto del proyecto.

## Casos de uso

- Investigación educativa sobre preentrenamiento desde cero: el repositorio de GitHub permite estudiar y replicar cada etapa del pipeline (tokenizador BPE, bucle de entrenamiento, conversión a GGUF) con código legible y un modelo de tamaño manejable en una T4.
- Pruebas de infraestructura de inferencia: sirve para validar cadenas de despliegue con llama.cpp o LM Studio en equipos de 4 GB de RAM antes de pasar a modelos mayores, dado su reducido tamaño en disco (552 MB).
- Benchmarking de herramientas de cuantización: el archivo Q4_K_M permite experimentar con el conversor de llama.cpp y verificar la carga de vocabularios BPE byte-level con etiqueta `gpt2`.
- Docencia sobre limitaciones de los LLM: el checkpoint del paso 146 es un ejemplo real y verificable de cómo se comporta un modelo infrapretrenado, útil para explicar la relación entre tokens vistos y calidad de generación.
- Desarrollo de pipelines de entrenamiento reanudable: el flujo de checkpoints en formato Hugging Face y la reanudación entre sesiones de Colab sirven como plantilla para proyectos con recursos limitados.
- Base para futuros fine-tunes experimentales: al ser Apache 2.0 y con arquitectura Llama estándar, los pesos pueden reutilizarse como punto de partida en experimentos académicos, aunque su calidad actual limita seriamente cualquier resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: el GGUF Q4_K_M ocupa 552 MB y el autor indica que funciona en un portátil con 4 GB de RAM; no requiere GPU dedicada.
- Pesos en bf16 para entrenamiento o inspección: 1,8 GB, más gradientes de 1,8 GB y estados de Adam de 8 bits de ~0,9 GB.
- GPU recomendadas: el autor documenta entrenamiento en una NVIDIA T4 (Colab) a 5-8k tokens/segundo; no se mencionan A100, H100 ni RTX 4090 en la información disponible.
- GPU de consumo: cabe holgadamente en cualquier GPU consumer para inferencia; el entrenamiento completo no cabe en un PC de 4 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`) y LM Studio, ambos verificados por el autor; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles para inferencia; para entrenamiento, 5-8k tokens/segundo en T4 según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado / calidad | Disponibilidad |
|---|---|---|---|---|---|
| MNAI Nano 2 | 0,90B | 4096 | Apache 2.0 | Checkpoint del paso 146 de 7.629; genera texto casi sin sentido | GGUF Q4_K_M en Hugging Face |
| SmolLM-135M / SmolLM-360M (HuggingFaceTB) | 0,135B / 0,36B | 2048 | Apache 2.0 | Modelos pequeños totalmente entrenados y utilizables | safetensors y GGUF |
| Qwen2.5-0.5B | 0,49B | 32.768 | Apache 2.0 | Modelo pequeño entrenado y utilizable | safetensors y GGUF |
| Llama 3.2 1B | 1,24B | 131.072 | Llama 3.2 Community License | Modelo pequeño entrenado y utilizable | safetensors y GGUF |

La comparación debe interpretarse con cautela: MNAI Nano 2 no es comparable en calidad a ninguno de los modelos citados porque su entrenamiento está incompleto. Su interés es la reproducibilidad del pipeline, no el rendimiento. Los datos de los modelos alternativos provienen de conocimiento general y no de la información proporcionada en esta ficha.

## Limitaciones y advertencias

- Calidad de generación: el propio autor advierte que el checkpoint del paso 146 genera texto cercano al sinsentido; no es apto para ninguna aplicación de producción.
- Sesgos: no documentados; al entrenarse sobre FineWeb-Edu es previsible que herede sesgos del corpus web, pero no hay evaluación publicada.
- Alucinación: con un modelo infrapretrenado la noción de alucinación queda subsumida por la baja coherencia general; no hay métricas.
- Idioma: solo inglés declarado; sin soporte multilingüe verificado.
- Contexto: 4096 tokens, muy por debajo de los estándares actuales; además, la ventana efectiva está limitada por la calidad del entrenamiento.
- Licencia: Apache 2.0 permite uso comercial de los pesos y MIT del código, pero la calidad actual hace inviable cualquier uso comercial real.
- Reproducibilidad: el archivo GGUF requiere la etiqueta de tokenizador `gpt2` corregida para cargar en LM Studio; el autor lo señala como la "fixed build".
- Madurez del proyecto: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; proyecto muy reciente (creado el 28 de noviembre de 2026) y sin validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MNAII/mnai-nano-2
- Repositorio de código de entrenamiento: https://github.com/MeowSamOPDZN/mnai-nano-2
- LM Studio: https://lmstudio.ai/
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
