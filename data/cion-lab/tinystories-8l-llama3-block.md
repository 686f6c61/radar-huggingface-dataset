# Cion-lab/tinystories-8L-llama3-block

## Resumen

El modelo `tinystories-8L-llama3-block` es un pequeño transformador decoder-only de 58 millones de parámetros, desarrollado por el usuario Cion-lab y publicado en Hugging Face. Está entrenado sobre aproximadamente 100 millones de tokens del dataset TinyStories, un corpus de historias cortas en inglés diseñado para evaluar la capacidad de generación de texto coherente en modelos de tamaño reducido. Su propósito principal es servir como banco de pruebas para investigar arquitecturas eficientes y técnicas de entrenamiento en entornos con recursos limitados.

La arquitectura sigue el bloque decoder de Llama 2/Llama 3, con normalización RMSNorm, posiciones rotatorias (RoPE), activación SwiGLU y máscara causal. Consta de 8 capas ocultas, un tamaño de ocultación de 512, 4 cabezas de atención (con atención multi-cabeza estándar) y una ventana de contexto de 1024 tokens. El entrenamiento se realizó con el framework MaxText de Google sobre un acelerador TPU v5e-8 de Kaggle, utilizando precisión mixta bf16 y un optimizador AdamW con programación de tasa de aprendizaje coseno.

La relevancia de este modelo radica en su carácter didáctico y experimental: demuestra cómo entrenar un LLM funcional desde cero con un presupuesto computacional muy bajo, y sirve como punto de partida para estudiar el comportamiento de arquitecturas tipo Llama en dominios restringidos. Su licencia CDLA-Sharing-1.0 permite su uso y modificación con fines de investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (bloque Llama2/Llama3: RMSNorm + RoPE + SwiGLU, máscara causal) |
| Parametros totales | 58.073.600 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp32) |
| Idiomas soportados | ingles |
| Licencia | CDLA-Sharing-1.0 (pesos); tokenizer Llama2 bajo Apache-2.0 |
| Formato de pesos | safetensors (tambien disponible tokenizer.model) |

## Arquitectura y entrenamiento

El modelo emplea un bloque decoder estándar de Llama 2/Llama 3, con normalización RMSNorm antes de cada subcapa, embeddings posicionales rotatorios (RoPE), atención multi-cabeza (MHA) con 4 cabezas de consulta y 4 de clave/valor (head_dim=128), y una MLP SwiGLU con dimensión intermedia de 1376. No se atan las embeddings de entrada y salida (tie word embeddings = false). El vocabulario es de 32.000 tokens, utilizando el tokenizer SentencePiece de Llama 2 incluido en MaxText.

El entrenamiento se realizó con MaxText (JAX + Flax NNX + Optax + Orbax) sobre un TPU v5e-8 de Kaggle (8 chips, 16 GB HBM por chip). Se usaron 1.526 pasos con un tamaño de lote de 65.536 tokens por paso (8 secuencias × 1024 tokens × 8 chips), totalizando aproximadamente 100 millones de tokens. El optimizador fue AdamW con weight decay desacoplado de 0.1, tasa de aprendizaje pico de 3e-4 con programación coseno y warmup del 5%, recorte de gradiente por norma global de 1.0, y una pérdida auxiliar z-loss de 1e-5 para estabilidad numérica. Se empleó precisión mixta bf16 para forward/backward y fp32 para los pesos maestros y el estado del optimizador.

## Capacidades

- Generacion de texto: produce historias cortas coherentes en ingles, con gramatica y estructura narrativa basica.
- Razonamiento simple: puede mantener coherencia local en tramas de pocas frases, aunque sin capacidades de razonamiento complejo.
- Comprension lectora limitada: responde a instrucciones sencillas de continuacion de texto.
- Multilingue: no disponible, solo entrenado en ingles.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Vision, audio u otras modalidades: no soportado.
- Modo thinking: no disponible.

## Casos de uso

- Educacion e investigacion en IA: sirve como modelo de juguete para ensenar conceptos de entrenamiento de LLMs, ajuste fino, interpretabilidad o tecnicas de cuantizacion, gracias a su tamano reducido y facilidad de ejecucion en hardware modesto.
- Generacion de cuentos infantiles: puede crear historias cortas personalizadas para ninos, aunque con limitaciones de coherencia en tramas largas; adecuado para prototipos de aplicaciones educativas.
- Pruebas de pipelines de inferencia: ideal para validar flujos de trabajo con Hugging Face Transformers, vLLM o llama.cpp antes de escalar a modelos mayores, por su rapida carga y bajo consumo de memoria.
- Experimentacion con tecnicas de prompt engineering: permite probar estrategias de prompting y few-shot en un entorno controlado, sin costes computacionales significativos.
- Benchmarking de hardware: util para medir latencia y throughput en GPUs de gama baja o CPUs, al ser un modelo pequeno que no satura los recursos.
- Desarrollo de prototipos de chatbots simples: puede integrarse en demos de asistentes conversacionales de dominio restringido (por ejemplo, narracion interactiva), aunque sin soporte de tool calling ni memoria persistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas como MMLU, HumanEval o GSM8K, y no se proporcionan comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 120 MB en bf16 (58M parametros × 2 bytes), mas overhead de activaciones y cache KV; cabe en cualquier GPU con 2 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente; tambien puede ejecutarse en CPU sin problemas.
- Compatibilidad con consumer GPU: si, ampliamente; incluso en Raspberry Pi o entornos embebidos con suficiente RAM.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), vLLM, llama.cpp (si se convierte a GGUF), Ollama (requiere conversion), TGI (soportado aunque sobredimensionado para este tamano).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 58M, la generacion de 100 tokens deberia completarse en menos de 1 segundo en una GPU moderna, y en pocos segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| Cion-lab/tinystories-8L-llama3-block | 58M | 1024 | CDLA-Sharing-1.0 | TinyStories (~100M tokens) | Hugging Face |
| DuckingtonLabs/tinyStories (Llama2 110M) | 110M | no disponible | no disponible | TinyStories | Ollama |
| NonsonoNicola/TinyStories-LLM | 40M | no disponible | no disponible | TinyStories | GitHub |

No se dispone de datos de rendimiento comparativos entre estos modelos. La eleccion entre ellos dependera del tamano, la licencia y la facilidad de integracion en el flujo de trabajo del usuario.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente con TinyStories (historias sinteticas en ingles), el modelo puede reflejar sesgos presentes en ese corpus, como simplificacion excesiva del lenguaje o ausencia de diversidad cultural.
- Riesgo de alucinacion: alto en contextos fuera del dominio de historias infantiles; puede generar contenido inventado o incoherente si se le piden tareas de conocimiento general.
- Limitaciones de contexto: ventana de 1024 tokens, insuficiente para tareas que requieran memoria a largo plazo o documentos extensos.
- Limitaciones de idioma: solo ingles; no soporta otros idiomas de forma fiable.
- Restricciones de licencia: CDLA-Sharing-1.0 permite uso comercial y modificacion, pero exige compartir las mejoras bajo la misma licencia; revisar los terminos completos antes de su uso en produccion.
- Caveat para produccion: no recomendado para aplicaciones criticas o de cara al publico sin un ajuste fino adicional y evaluacion exhaustiva; su tamano limita severamente la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cion-lab/tinystories-8L-llama3-block
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Repositorio MaxText: https://github.com/AI-Hypercomputer/maxtext
- Proyecto LittleLLaMA (referencia similar): https://github.com/SwapnilThatte/LittleLLaMA
- Proyecto TinyStories-LLM (referencia similar): https://github.com/NonsonoNicola/TinyStories-LLM
- Modelo DuckingtonLabs/tinyStories en Ollama: https://ollama.com/DuckingtonLabs/tinyStories
