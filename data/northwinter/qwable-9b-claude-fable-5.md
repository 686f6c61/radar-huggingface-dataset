# northwinter/Qwable-9B-Claude-Fable-5

## Resumen

Qwable-9B-Claude-Fable-5 es un ajuste fino supervisado (SFT) de parámetros completos sobre Qwen/Qwen3.5-9B, desarrollado por Empero y publicado por el usuario northwinter en Hugging Face. El modelo se entrena mediante destilación de trazas generadas por otros asistentes (Claude Fable 5 y un agente de terminal basado en GPT-5.5) para imitar su estilo de razonamiento y uso de herramientas en tareas de código y agentes de múltiples turnos.

El modelo base, Qwen3.5-9B, es un transformer denso nativamente multimodal con una pila de atención híbrida (atención lineal Gated DeltaNet y atención completa en proporción 3:1), vocabulario de aproximadamente 152.000 tokens y contexto nativo largo. El ajuste fino entrena únicamente el backbone de texto; la torre de visión permanece congelada y sin ajustar.

Es relevante porque demuestra cómo un modelo de 9.400 millones de parámetros puede adquirir comportamientos de codificación agéntica y razonamiento estructurado mediante SFT de alta calidad sobre trazas destiladas, con licencia Apache 2.0. No obstante, se trata de una publicación temprana: no hay benchmarks cuantitativos publicados y la procedencia de los datos de entrenamiento plantea dudas sobre la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con atención híbrida (Gated DeltaNet lineal + atención completa, ratio 3:1) |
| Parámetros totales | 9.409.813.744 (~9,4 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Contexto nativo largo del base; entrenamiento hasta 76.800 tokens sin truncación |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, probablemente bf16) |
| Idiomas soportados | Principalmente inglés (en) |
| Licencia | Apache 2.0 (heredada del base; ver advertencia de procedencia de datos) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: un transformer denso con pila de atención híbrida que combina atención lineal Gated DeltaNet con atención completa en proporción 3:1, vocabulario de ~152k tokens y capacidad multimodal nativa (image-text-to-text). El ajuste fino es de parámetros completos sobre el backbone de texto con TRL; la torre de visión quedó congelada y el entrenamiento fue exclusivamente textual, por lo que las capacidades de visión son las heredadas del base y no fueron ajustadas ni evaluadas.

El entrenamiento usó SFT con pérdida solo en tokens del asistente (prompts enmascarados), secuencias completas sin truncación (`max_length = 76.800`), entropía cruzada por chunks para eficiencia de memoria, 2 épocas, batch efectivo de 16, learning rate 1e-5 con decaimiento coseno y 3% de warmup, optimizador AdamW de 8 bits y precisión bf16. Los datos provienen de dos fuentes: `Glint-Research/Fable-5-traces` (~4.585 ejemplos de trazas de razonamiento y código de Claude Fable 5) y `Roman1111111/gpt5.5-terminal` (~111 ejemplos de tareas de terminal/agente de GPT-5.5), normalizados a un formato de chat común. La mezcla está fuertemente sesgada hacia Fable (~97%) sin reponderación. Se reservaron 100 ejemplos para validación, compuestos deliberadamente al 80% Fable / 20% terminal.

## Capacidades

- Generación de texto y razonamiento: el modelo es un modelo de razonamiento; cada respuesta comienza con un bloque `<think>...</think>` seguido de la respuesta final, que el consumidor debe parsear y eliminar.
- Codificación: genera soluciones idiomáticas y correctas con herramientas actuales (por ejemplo, `ss` en lugar de `netstat`, `git-filter-repo`, Argon2id) y juicio orientado a seguridad (rotación de claves filtradas, comparación en tiempo constante, errores de autenticación genéricos).
- Tareas de terminal y agentes: entrenado con trazas de un agente de terminal GPT-5.5, cubre resolución de tareas de línea de comandos y flujos agénticos.
- Seguimiento de instrucciones y formato: manejo correcto en las pruebas cualitativas.
- Calibración y honestidad: las pruebas de calibración se manejaron bien según la revisión cualitativa del autor.
- Capacidades multilingües: limitadas; el modelo está entrenado principalmente en inglés.
- Tool calling / function calling: no se documenta explícitamente como capacidad formal; el entrenamiento incluye trazas de uso de herramientas pero no se especifica un protocolo de tool calling.
- Visión: arquitectura multimodal heredada del base, pero no ajustada ni evaluada.
- Capacidad de audio: no disponible.

## Casos de uso

- Asistencia en codificación en producción: el modelo genera soluciones idiomáticas y con conciencia de seguridad, adecuado para sugerencias de código, revisión de parches y generación de scripts de automatización en pipelines de CI/CD.
- Automatización de tareas de terminal y DevOps: entrenado con trazas de agente de terminal, puede resolver tareas de línea de comandos multi-paso, diagnóstico de sistemas y operaciones de administración.
- Agentes de múltiples pasos: su entrenamiento en trazas agénticas con contexto largo (hasta 76.800 tokens) permite gestionar flujos de trabajo que requieren razonamiento encadenado y uso de herramientas.
- Razonamiento estructurado con trazas explícitas: el bloque `<think>` facilita la auditoría del razonamiento en aplicaciones donde se requiere transparencia del proceso de decisión.
- Destilación y experimentación académica: sirve como caso de estudio de SFT de parámetros completos sobre trazas destiladas con contexto largo y pérdida solo en el asistente.
- Asistente de explicación técnica: las pruebas cualitativas muestran buen desempeño en explicaciones, seguimiento de formato y calibración, útil para documentación técnica y respuestas de soporte en inglés.
- Base para ajustes posteriores: al ser un modelo denso de 9,4 B con licencia Apache 2.0, es un punto de partida manejable para fine-tuning específico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que una suite completa de benchmarks de codificación, agentes y seguridad está en curso. Solo se publican métricas de validación interna:

| Paso | Pérdida de validación | Precisión por token |
|---|---|---|
| 100 | 0,743 | 0,784 |
| 200 | 0,722 | 0,789 |
| 300 (≈ época 1) | 0,714 | 0,791 |
| 400 | 0,7135 | 0,791 |
| 500 | 0,713 | 0,791 |

La pérdida de validación disminuyó de forma monótona y se estabilizó en ~0,71 durante la segunda época, sin sobreajuste observado (la pérdida de entrenamiento bajó a ~0,64). La precisión por token es teacher-forced sobre tokens de completación y no mide corrección de extremo a extremo. En la revisión cualitativa de 34 prompts, aproximadamente 27 de 34 respuestas fueron limpias y correctas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 B de parámetros, en bf16 se requieren aproximadamente 19 GB de VRAM para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, unos 10-11 GB; en 4 bits, unos 6-7 GB (estimaciones basadas en el tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para bf16 con contexto largo; RTX 4090 (24 GB) es suficiente para bf16 en contextos moderados.
- GPU de consumo: cabe en RTX 4090 en bf16 y en GPUs de 12-16 GB con cuantización de 8 o 4 bits; la longitud de contexto de entrenamiento (76.800 tokens) exige mucha memoria de caché KV y probablemente no sea viable en GPUs de consumo sin cuantización agresiva.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` (ruta recomendada por el autor, con `tokenize=False` y tokenización posterior de la cadena); vLLM, TGI, llama.cpp u Ollama no están documentados por el autor para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwable-9B-Claude-Fable-5 | 9,4 B (denso) | Entrenado hasta 76.800 tokens | Apache 2.0 | SFT de destilación en código y agentes |
| Qwen/Qwen3.5-9B (base) | 9,4 B (denso) | Contexto nativo largo | Apache 2.0 | Modelo base multimodal generalista |
| Alternativas de ~9 B para código | No disponible | No disponible | No disponible | No disponible |

La comparativa con modelos de la misma categoría no está disponible en la información proporcionada; el autor no publica comparaciones con alternativas.

## Limitaciones y advertencias

- Publicación temprana: no hay benchmarks cuantitativos de codificación, agentes ni seguridad; las métricas publicadas son de validación interna y precisión por token teacher-forced, que no equivalen a corrección real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- Sesgo de datos: la mezcla de entrenamiento está sesgada hacia trazas de Claude Fable (~97%), lo que puede limitar la diversidad de estilos y la generalización a tareas no representadas.
- Idiomas: entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Visión: la torre de visión está congelada y no fue ajustada ni probada; no se debe asumir un comportamiento de visión fiable.
- Formato de salida: cada respuesta incluye un bloque `<think>` que debe eliminarse en producción; ignorarlo puede romper consumidores downstream.
- Procedencia de datos: el autor advierte explícitamente sobre la procedencia de los datos de entrenamiento (trazas de otros asistentes) como caveat de licencia, pese a que los pesos se distribuyen bajo Apache 2.0.
- Tool calling: no se documenta un protocolo formal de function calling; el uso de herramientas se aprende de trazas pero no está especificado como API.
- Contexto largo: aunque se entrenó hasta 76.800 tokens, no se han publicado evaluaciones de rendimiento en contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/northwinter/Qwable-9B-Claude-Fable-5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de trazas Fable 5: https://huggingface.co/datasets/Glint-Research/Fable-5-traces
- Dataset de terminal GPT-5.5: https://huggingface.co/datasets/Roman1111111/gpt5.5-terminal
- Desarrollador: https://empero.org
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Transcripciones de generaciones de muestra: `sample_generations.md` (en el repositorio del modelo)
