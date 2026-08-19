# Cion-lab/Ultra-FineWeb-12L-llama3-1B-Tokens

## Resumen

Ultra-FineWeb-12L-llama3-1B-Tokens es un modelo de lenguaje pequeño (104,9 millones de parámetros) desarrollado por Cion-lab, entrenado sobre aproximadamente 1.000 millones de tokens del dataset Ultra-FineWeb de OpenBMB. El modelo sigue una arquitectura de decoder block tipo Llama2/Llama3 (RMSNorm, RoPE, SwiGLU) con 12 capas ocultas, 640 dimensiones de hidden size y 5 cabezas de atención. Se entrenó con el framework MaxText de Google sobre un TPU v5e-8 de Kaggle, utilizando precisión mixta bf16 y un tokenizador Llama de prueba.

Su relevancia radica en ser un ejemplo de entrenamiento eficiente y reproducible en hardware accesible (TPU de Kaggle), así como una demostración del pipeline de filtrado y verificación de datos Ultra-FineWeb. Al ser un modelo base de pequeño tamaño, no está orientado a producción, sino a experimentación, fine-tuning ligero y estudio de técnicas de entrenamiento. La ventana de contexto es de 2048 tokens y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama2/Llama3 decoder block (RMSNorm + RoPE + SwiGLU, causal masking) |
| Parametros totales | 104.873.600 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado en bf16, pesos maestros en fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | CDLA-Sharing-1.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo emplea un decoder block estándar de Llama2/Llama3: normalización RMSNorm, atención con rotación posicional RoPE, MLP con activación SwiGLU y enmascaramiento causal. Tiene 12 capas, hidden size de 640, 5 cabezas de consulta y 5 de clave/valor (head_dim=128), y un tamaño intermedio de MLP de 1920. El vocabulario es de 32.000 tokens y no se atan las embeddings de entrada y salida.

El entrenamiento se realizó con MaxText (JAX + Flax NNX + Optax + Orbax) sobre un TPU v5e-8 (8 chips, 16 GB HBM por chip). Se usó el dataset Ultra-FineWeb (subset en) con un total de 1.000 millones de tokens, procesados en 3.814 pasos con un batch efectivo de 262.144 tokens por paso. El optimizador fue AdamW con weight decay 0.1, programación de tasa de aprendizaje coseno con pico de 0.0003 y warmup del 10%. Se aplicó z-loss (1e-5) para estabilidad numérica y gradiente clipping con norma global 1.0. La precisión fue bf16 en forward/backward y fp32 en pesos maestros y estado de Adam.

## Capacidades

- Generación de texto autoregresiva en inglés, con capacidad de completar secuencias de hasta 2048 tokens.
- Modelo base sin fine-tuning instructivo: no sigue instrucciones ni mantiene diálogos estructurados por sí mismo.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).
- Al ser un modelo pequeño entrenado con solo 1B tokens, su conocimiento del mundo y su fluidez son limitados; es adecuado para tareas simples de generación o como punto de partida para fine-tuning.

## Casos de uso

- Experimentación educativa: ideal para estudiantes e investigadores que quieran entender el ciclo completo de entrenamiento de un LLM, desde la preparación de datos hasta la inferencia, sin necesidad de hardware costoso.
- Fine-tuning ligero: al tener solo 104M de parámetros, se puede adaptar a dominios específicos (por ejemplo, generación de texto técnico corto) con pocos recursos y en una sola GPU consumer.
- Pruebas de infraestructura: sirve para validar pipelines de despliegue (vLLM, TGI, llama.cpp) o para medir latencias y throughput en entornos de desarrollo antes de escalar a modelos mayores.
- Generación de texto corto: puede producir fragmentos de texto en inglés (cuentos, descripciones breves) cuando se usa con sampling, aunque la calidad será modesta.
- Benchmarking de frameworks: permite comparar el rendimiento de diferentes motores de inferencia (Transformers, llama.cpp, etc.) con un modelo pequeño y de carga rápida.
- Investigación sobre datos: al estar entrenado exclusivamente con Ultra-FineWeb, sirve para estudiar el impacto de la calidad del dataset en modelos pequeños, comparando con otros modelos entrenados con datos distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 (el modelo pesa ~0,4 GB en safetensors). En bf16, aproximadamente 0,2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, etc.). También puede ejecutarse en CPU con llama.cpp.
- Cabe en cualquier GPU moderna, incluidas las integradas de portátiles si se usa cuantización (aunque no se proporcionan cuantizaciones oficiales).
- Opciones de despliegue: Transformers (PyTorch), vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF).
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia de pocos milisegundos por token en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Ultra-FineWeb-12L-llama3-1B-Tokens | 104,9M | 2048 | 1B tokens (Ultra-FineWeb) | CDLA-Sharing-1.0 |
| SmolLM-135M (HuggingFace) | 135M | 2048 | ~600B tokens (SmolLM-Corpus) | Apache 2.0 |
| TinyStories-33M (Karpathy) | 33M | 256 | ~1.5B tokens (historias sintéticas) | MIT |

No se dispone de comparativas de rendimiento directas porque no hay benchmarks publicados para este modelo. SmolLM-135M, al estar entrenado con muchos más tokens, probablemente tenga mejor calidad de generación, pero no se puede afirmar con datos objetivos.

## Limitaciones y advertencias

- Entrenado con solo 1.000 millones de tokens, una cantidad muy reducida para un LLM; su conocimiento general, coherencia y vocabulario son limitados.
- Solo soporta inglés; no es adecuado para tareas multilingües.
- Ventana de contexto de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Es un modelo base sin fine-tuning instructivo: no responde a instrucciones ni mantiene diálogos de asistente de forma natural.
- Riesgo de alucinación y de generar texto incoherente o repetitivo, especialmente en secuencias largas.
- La licencia CDLA-Sharing-1.0 permite uso comercial, pero exige atribución y la redistribución de obras derivadas bajo la misma licencia (share-alike). Conviene revisar los términos completos antes de usarlo en productos comerciales.
- No se proporcionan cuantizaciones oficiales (GGUF, AWQ, etc.), por lo que habrá que convertirlas manualmente si se desea desplegar en entornos con restricciones de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cion-lab/Ultra-FineWeb-12L-llama3-1B-Tokens
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Paper de Ultra-FineWeb: https://arxiv.org/abs/2505.05427
- Repositorio MaxText: https://github.com/AI-Hypercomputer/maxtext
