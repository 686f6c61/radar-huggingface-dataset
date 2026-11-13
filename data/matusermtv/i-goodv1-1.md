# MatUserMTV/I.goodV1.1

## Resumen

I.good V1.1 es un modelo de lenguaje conversacional en ruso de 4.522.624 parámetros, desarrollado desde cero por el autor independiente MatUserMTV. No se trata de un fine-tune, un LoRA ni una destilación: el autor entrenó el modelo completo, desde el corpus de texto plano hasta el archivo GGUF final, partiendo de una arquitectura compatible con Llama. Su propósito declarado es educativo: demostrar que es posible entrenar un LLM sin GPU, usando únicamente un Intel Xeon de 28 hilos y 32 GB de RAM.

La arquitectura es un transformer decoder-only con 2 capas, 4 cabezas de atención, dimensión oculta de 128, MLP de 384, RoPE, RMSNorm, SwiGLU y GQA con 4 cabezas KV. El contexto máximo es de 512 tokens y el tokenizador es un BPE de 32.000 tokens. De los 4,5 millones de parámetros totales, aproximadamente 4,1 millones corresponden a los embeddings (32.000 × 128), por lo que solo unos 400.000 se dedican a las capas transformer.

El modelo es relevante como caso de estudio reproducible de entrenamiento de extremo a extremo en CPU, no como herramienta de producción. El propio autor documenta con transparencia sus limitaciones: sobreajuste severo, pérdida de contexto tras dos o tres turnos, incapacidad de seguir instrucciones y tendencia a la repetición en bucle si no se aplica una penalización alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only compatible con Llama (RoPE, RMSNorm, SwiGLU, GQA) |
| Parametros totales | 4.522.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF (el autor distribuye `model.gguf`; no se detallan variantes Q4, Q8, etc.) |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Capas (n_layer) | 2 |
| Cabezas de atencion (n_head) | 4 |
| Dimension oculta | 128 |
| Dimension MLP | 384 |
| Tokenizador | BPE, 32.000 tokens |
| Tie word embeddings | Si |

## Arquitectura y entrenamiento

El modelo sigue el esquema de un transformer decoder-only con atención causal. Incorpora codificación posicional rotatoria (RoPE), normalización RMSNorm, activación SwiGLU en el MLP y atención con consultas agrupadas (GQA) de 4 cabezas KV. Los embeddings de entrada y de salida están atados (*tie word embeddings*), lo que reduce el recuento efectivo de parámetros pero no evita que el vocabulario de 32.000 tokens consuma cerca del 91 % del total. Solo unas 400.000 parámetros quedan para las dos capas transformer.

El entrenamiento se realizó desde cero sobre aproximadamente 10.000 diálogos en ruso, equivalentes a unos 834.000 tokens (unos 4 MB de texto), con el formato `<|user|>...<|assistant|>...<|endoftext|>`. Se ejecutó en un Intel Xeon de 28 hilos a 3,10 GHz con 32 GB de RAM, sin GPU, durante unos 45 minutos. Se usó el optimizador AdamW (β=0,9/0,95, weight decay 0,1), tasa de aprendizaje 5e-4 con decaimiento coseno y warmup, batch size 8 y acumulación de gradiente 16. La pérdida de entrenamiento final fue de aproximadamente 5,2 y la de validación en el paso 500 de 5,70, con un descenso monótono desde 10,41 sin explosiones de gradiente. No se aplicó dropout, ni RLHF, ni DPO, ni ninguna fase de alineación posterior.

## Capacidades

- Generación de texto conversacional corto en ruso, con frases de entre 3 y 8 palabras.
- Emisión de palabras rusas reales (no basura a nivel de byte) dentro del vocabulario aprendido.
- Mantenimiento parcial del formato de turnos `<|user|>` / `<|assistant|>`.
- Formulación ocasional de preguntas de vuelta al usuario.
- Reutilización de vocabulario presente en el corpus de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No soporta generación de código, matemáticas, visión ni audio.
- No soporta modo de razonamiento (*thinking mode*).
- Multilingüismo: únicamente ruso.

## Casos de uso

- Demostración educativa de entrenamiento desde cero: el modelo sirve para ilustrar en clase o en un artículo el pipeline completo de un LLM (tokenización, preentrenamiento, exportación a GGUF) sin necesidad de GPU.
- Prueba de infraestructura de inferencia en CPU: útil para validar que KoboldCPP u Ollama funcionan correctamente con un GGUF mínimo antes de desplegar modelos mayores.
- Estudio empírico del sobreajuste: con 10.000 diálogos y sin dropout, el modelo cita el corpus de forma literal, lo que lo convierte en un ejemplo práctico de los efectos de un dataset insuficiente.
- Análisis de la proporción embeddings/parámetros: permite medir el impacto de un vocabulario de 32.000 tokens sobre un modelo de 4,5 millones de parámetros y justificar decisiones de diseño como reducir el vocabulario.
- Reproducción de la curva de pérdida: el descenso de 10,41 a 5,20 en unos 500 pasos sirve como referencia para calibrar hiperparámetros en entrenamientos pequeños.
- Generación de respuestas conversacionales triviales en ruso en entornos de prueba, siempre con `repetition_penalty` ≥ 1,5 y temperatura baja, para validar el formato de prompt antes de integrar un modelo mayor.
- Benchmark de juguete para comparar frameworks de inferencia (KoboldCPP frente a Ollama) en cuanto a latencia y consumo de memoria con un modelo de pocos megabytes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (final) | ~5,20 |
| Perdida de validacion (paso 500) | 5,70 |
| Perdida inicial | 10,41 |
| Pasos de entrenamiento | ~500 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU. El repositorio ocupa 0,0 GB según Hugging Face y el GGUF es de pocos megabytes, por lo que cabe en cualquier equipo con RAM convencional.
- GPU recomendadas: no son necesarias. El autor indica explícitamente `GPU Layers: 0` en KoboldCPP. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) podría cargarlo, pero no aporta ventaja.
- Compatibilidad con GPU consumer: sí, en todas, aunque el uso previsto es CPU.
- Opciones de despliegue: KoboldCPP (configuración recomendada por el autor: contexto 512, temperatura 0,3, repetition penalty 1,5, top-k 40, top-p 0,9) y Ollama mediante un `Modelfile` con `num_ctx 512`. No se documenta soporte para vLLM ni TGI, que no están pensados para modelos de este tamaño.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera una latencia muy baja en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| I.good V1.1 | 4,52 M | 512 | Apache 2.0 | GGUF en Hugging Face | Entrenado desde cero en CPU, ruso, sobreajustado |
| Qwen2.5-0.5B | ~500 M | 32.768 | Apache 2.0 | Pesos en Hugging Face | ~110 veces más parámetros; uso general multilingüe |
| Llama 3.2 1B | ~1.000 M | 128.000 | Llama 3.2 Community License | Pesos en Hugging Face | ~220 veces más parámetros; multilingüe con foco en inglés |
| Modelos tiny de referencia (p. ej. TinyLlama) | ~1.100 M | 2.048 | Apache 2.0 | Pesos en Hugging Face | Entrenados con corpus de billones de tokens |

La comparación con Qwen2.5-0.5B y Llama 3.2 1B la establece el propio autor en la model card para subrayar la diferencia de escala. No se dispone de benchmarks comparativos directos porque I.good V1.1 no publica resultados en tareas estándar.

## Limitaciones y advertencias

- Sobreajuste severo: con 10.000 diálogos, sin dropout y deteniendo el entrenamiento sin validación, el modelo cita fragmentos del dataset de forma literal y pierde coherencia con rapidez.
- Contexto efectivo muy corto: no mantiene el hilo más allá de dos o tres réplicas pese a los 512 tokens nominales.
- Incapacidad de seguir instrucciones: no responde a peticiones como "escribe código", "traduce" o "explica".
- Sin generación de código ni matemáticas: el autor estima que se necesita un modelo de 50 M o más para tareas de código.
- Frases truncadas: tiende a cortar oraciones a media palabra.
- Inconsistencia interna: puede contradecirse entre frases consecutivas.
- Bucles de repetición: sin `repetition_penalty` ≥ 1,5 genera secuencias como "рас, рас, рас...".
- Idiomas: solo ruso; no hay soporte útil de castellano ni de inglés.
- Sesgos: no documentados explícitamente, pero al derivarse de un corpus pequeño y no filtrado puede reflejar sesgos del dataset original.
- Riesgo de alucinación: alto; el modelo no tiene conocimiento factual fiable y genera texto plausible sin base.
- Licencia Apache 2.0: permite uso comercial, pero el estado del modelo hace inviable cualquier aplicación en producción.
- No apto para producción: el autor lo presenta explícitamente como una lección educativa, no como un producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatUserMTV/I.goodV1.1
- Repositorio de archivos (GGUF `model.gguf`): https://huggingface.co/MatUserMTV/I.goodV1.1/tree/main
- KoboldCPP: https://github.com/LostRuins/koboldcpp
- Ollama: https://ollama.com
