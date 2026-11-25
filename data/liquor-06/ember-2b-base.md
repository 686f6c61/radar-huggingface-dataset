# Liquor-06/Ember-2B-base

## Resumen

Ember-2B-base es un modelo de lenguaje en inglés de aproximadamente 2.000 millones de parámetros construido con una arquitectura MoE (mixture of experts) y attention lineal, desarrollado por Liquor-06 (Zihao Wu) y entrenado desde cero. Su propósito declarado es el razonamiento en matemáticas y código, y se distribuye como modelo base, sin ajuste por instrucciones. Emplea una combinación poco habitual de capas Kimi Delta Attention (KDA) y capas de atención completa con GQA y NoPE, además de memoria hasheada de n-gramas (Engram) y residuales Block AttnRes.

El modelo se preentrenó con 25.000 millones de tokens a 4K de contexto en una única RTX 4090, y después continuó el preentrenamiento hasta extender la ventana a 128K tokens. Cuenta con 1.965.192.934 parámetros totales, de los cuales solo 0,39B se activan por token, lo que lo sitúa en la categoría de MoE de activación muy dispersa. La relevancia actual reside en su carácter experimental: demuestra que es posible entrenar un MoE con attention híbrida y memoria externa en hardware de consumo, aunque sus resultados en benchmarks son modestos y su adopción en producción requiere código propio, ya que no es compatible con `transformers`.

La licencia Apache 2.0 facilita su reutilización, pero el modelo es de investigación: no hay ajuste instructivo, no hay datos de entrenamiento publicados y el rendimiento en tareas de conocimiento general (MMLU 23,9) está muy por debajo de modelos del mismo tamaño entrenados con volúmenes de datos mucho mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 18 capas Kimi Delta Attention (KDA) + 6 capas de atención completa (GQA, NoPE, QK-norm); 24 capas, d=1024 |
| Parametros totales | 1.965.192.934 (1,97B); 0,50B corresponden a las tablas Engram |
| Parametros activos | 0,39B por token |
| Longitud de contexto | 128K tokens (entrenado en dos fases: 4K y luego extensión a 128K) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32 safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), checkpoint final de la fase de 128K, step 2862 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 24 capas con dimensión 1024 y vocabulario de 65.536 tokens. El mezclador de tokens combina 18 capas de Kimi Delta Attention (KDA), un mecanismo de attention lineal, con 6 capas de atención completa que usan GQA, NoPE (sin codificación posicional explícita) y QK-norm. La capa MoE tiene 32 expertos de dimensión 512 con enrutamiento top-4, más un experto compartido. Además, incorpora dos componentes poco convencionales: memoria hasheada de n-gramas (Engram) en las capas 1 y 11, que aporta 0,50B parámetros, y residuales Block AttnRes.

El entrenamiento se realizó desde cero con 25.000 millones de tokens a 4K de contexto en una sola RTX 4090, seguido de un preentrenamiento continuado que extendió el contexto hasta 128K. No se especifica la composición del dataset, ni si hubo RLHF, DPO o alguna fase de alineación; al ser un modelo base, se asume que no. La innovación técnica principal es la combinación de attention lineal KDA con atención completa en la misma pila, más la memoria Engram, que permite mantener un coste de atención bajo en contextos largos. El modelo supera la prueba de passkey 50/50 tanto a 128K como a 256K, lo que indica que la extensión de contexto es funcional más allá de la ventana de entrenamiento.

## Capacidades

- Generación de texto en inglés, con foco declarado en razonamiento matemático y de código.
- Razonamiento de varios pasos y resolución de problemas, aunque con rendimiento limitado según los benchmarks publicados.
- Generación de código: funciones y fragmentos en lenguajes de programación habituales (HumanEval 28,7; MBPP 34,4).
- Manejo de contextos largos: recuperación de información tipo passkey a 128K y 256K.
- No dispone de soporte de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-step orquestado documentadas.
- Capacidades multilingües limitadas al inglés; no se reporta soporte de otros idiomas.
- Sin modo thinking, visión, audio ni otras capacidades especiales.
- Al ser un modelo base, no sigue instrucciones ni mantiene formato conversacional de forma fiable.

## Casos de uso

- Investigación en arquitecturas MoE con attention lineal: el modelo sirve como banco de pruebas para estudiar el equilibrio entre capas KDA y capas de atención completa, y el efecto de la memoria Engram en tareas de contexto largo.
- Experimentación con contextos largos: con passkey 50/50 a 128K y 256K, es adecuado para probar técnicas de recuperación de información en ventanas extensas, siempre con código propio de inferencia.
- Generación de código asistida en entornos de investigación: puede completar funciones sencillas (por ejemplo, `def fibonacci(n):`) y servir como base para fine-tuning específico de dominio en código.
- Fine-tuning supervisado para tareas concretas: al ser un modelo base Apache 2.0, se puede ajustar con SFT o LoRA para tareas de matemáticas o código antes de desplegarlo.
- Estudio de eficiencia en hardware de consumo: su entrenamiento en una RTX 4090 y su activación de 0,39B por token lo convierten en un caso de referencia para medir throughput y latencia en GPUs de gama alta para consumidores.
- Evaluación comparativa de mecanismos de atención: útil para reproducir y contrastar resultados de attention lineal frente a atención completa en tareas de razonamiento y código.
- Docencia y reproducción de pipelines de entrenamiento: el repositorio de GitHub incluye código, logs de entrenamiento y scripts de evaluación, lo que facilita su uso en cursos o talleres sobre entrenamiento de LLM desde cero.

## Benchmarks y rendimiento

Resultados publicados por el autor para el checkpoint final de 128K (step 2862):

| Benchmark | Ember-2B-base (128K) |
|---|---|
| HellaSwag | 50,6 |
| ARC-E | 64,4 |
| ARC-C | 31,6 |
| PIQA | 71,2 |
| Winogrande | 56,2 |
| MMLU | 23,9 |
| GSM8K | 15,0 |
| HumanEval | 28,7 |
| MBPP | 34,4 |

Prueba de contexto largo: passkey 50/50 a 128K y a 256K. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: los pesos ocupan aproximadamente 7,9 GB (tamaño del repositorio), por lo que se necesita al menos 8 GB de VRAM para cargar el modelo completo, más memoria para el KV cache en contextos largos.
- En cuantización de 8 bits o 4 bits se reduciría el requisito, pero no se han publicado pesos cuantizados ni instrucciones oficiales para generarlos; la carga estándar es en fp32.
- GPU recomendadas: RTX 4090 (16 GB o más) para fp32; A100 o H100 para despliegues con contexto de 128K y mayor throughput. El autor entrenó el modelo en una única RTX 4090.
- Cabe en GPUs de consumo con al menos 8-12 GB de VRAM para contextos cortos; para 128K de contexto se requiere más memoria por el KV cache.
- Opciones de despliegue: no es compatible con `transformers`, vLLM, llama.cpp, Ollama ni TGI de forma nativa. La única vía documentada es cargar el modelo con el código del repositorio de GitHub (`moe_llm`, `mac_lm`) usando PyTorch y safetensors, un modelo por proceso de Python. El autor indica que el código funciona en CPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos de la misma categoría en la información disponible. Como referencia de categoría, se puede situar frente a otros modelos base de ~2B parámetros, pero no hay datos de benchmarks comparables proporcionados por el autor, por lo que no se ofrece una tabla comparativa con cifras.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Compatibilidad con transformers |
|---|---|---|---|---|---|
| Ember-2B-base | 1,97B | 0,39B | 128K | Apache 2.0 | No (código propio) |
| Alternativas de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no está pensado para uso conversacional directo.
- Rendimiento bajo en conocimiento general: MMLU de 23,9 y GSM8K de 15,0 indican una capacidad limitada en tareas de conocimiento y matemáticas, a pesar del foco declarado del modelo.
- Riesgo elevado de alucinación y de generación incoherente en tareas abiertas, habitual en modelos base con pocos tokens de entrenamiento (25B).
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No es compatible con el ecosistema estándar (`transformers`, vLLM, llama.cpp, Ollama, TGI), lo que complica el despliegue en producción y limita el soporte de herramientas.
- Requiere cargar un modelo por proceso de Python y usar el código del repositorio, con el mantenimiento y la seguridad que ello implica.
- No se han publicado detalles sobre la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos de datos ni riesgos de contaminación.
- La licencia Apache 2.0 permite uso comercial, pero la falta de datos de entrenamiento y de evaluación de sesgos traslada al usuario la responsabilidad de validar el modelo en su dominio.
- El contexto de 128K está validado con passkey, pero no hay evaluación de calidad en tareas de razonamiento de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Liquor-06/Ember-2B-base
- Repositorio de código, logs y scripts de evaluación: https://github.com/Zihao-Wu06/Ember-2B-base
