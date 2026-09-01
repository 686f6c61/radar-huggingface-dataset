# ApyHTML19/ABADES-SLM-15M

## Resumen

ABADES-SLM-15M es un modelo de lenguaje pequeño (SLM) de tipo GPT, entrenado desde cero sobre el dataset TinyStories, un corpus de cuentos infantiles en inglés. Ha sido desarrollado por ApyHTML19 (Hicham Matrix), estudiante de ingeniería de software, como proyecto educativo para comprender el entrenamiento de transformers desde cero, inspirándose en nanoGPT de Andrej Karpathy. Con aproximadamente 15 millones de parámetros, una ventana de contexto de 128 tokens y una arquitectura decoder-only de 6 capas, el modelo está diseñado para ser ligero y ejecutable en entornos con recursos limitados.

Su relevancia actual radica en el creciente interés por los SLM, que ofrecen una alternativa eficiente a los grandes modelos para tareas específicas y entornos de edge computing. Aunque no está pensado para producción, sirve como punto de partida didáctico para quienes quieran explorar el entrenamiento de modelos generativos de texto sin necesidad de infraestructura costosa. El modelo se distribuye bajo licencia OpenRAIL y está disponible en Hugging Face, aunque su adopción es aún muy limitada (cero descargas y cero likes en el momento de la redacción).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT (decoder-only transformer) |
| Parametros totales | ~15 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenRAIL |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT clásica: un transformer decoder-only con 6 capas, 6 cabezas de atención y una dimensión de embedding de 384. Utiliza el tokenizer BPE de GPT-2 (tiktoken) con un vocabulario de 50.257 tokens. El entrenamiento se realizó sobre el dataset TinyStories, compuesto por cuentos cortos en inglés, durante 45.000 iteraciones. Se empleó el optimizador AdamW con una tasa de aprendizaje de 1e-4, betas (0.9, 0.95) y weight decay de 0.1, junto con un schedule de calentamiento lineal de 1000 pasos seguido de decaimiento coseno. Se usó precisión mixta (bfloat16/float16), acumulación de gradientes de 32 pasos y clipping de gradiente a 0.5. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es puramente de modelado de lenguaje causal.

## Capacidades

- Generación de texto en inglés, especialmente cuentos infantiles y narrativas simples.
- Modelado de lenguaje causal básico, capaz de continuar frases con coherencia local.
- Ejecución en CPU o GPU con requisitos mínimos de memoria.
- Adecuado para experimentación educativa y aprendizaje de arquitecturas transformer.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multimodales.
- No es multilingüe; solo inglés.
- No dispone de modo de pensamiento (thinking mode) ni generación con razonamiento explícito.

## Casos de uso

- Aprendizaje de transformers: el modelo es ideal para estudiantes que quieran inspeccionar el funcionamiento interno de un GPT pequeño, modificar hiperparámetros y observar el efecto en la generación.
- Prototipado de generación de historias: puede usarse para generar cuentos infantiles cortos en inglés, aunque con limitaciones de coherencia a largo plazo.
- Benchmark de eficiencia: al ser tan pequeño, permite medir latencia y consumo de recursos en dispositivos de gama baja, como Raspberry Pi o portátiles antiguos.
- Base para fine-tuning: su tamaño reducido facilita el ajuste fino en tareas específicas de generación de texto con datasets pequeños, sin necesidad de GPUs potentes.
- Demostraciones educativas en aulas: sirve como ejemplo práctico en cursos de NLP para mostrar el pipeline completo de entrenamiento y generación.
- Investigación de SLM: puede utilizarse como punto de comparación en estudios sobre modelos de lenguaje pequeños, aunque carece de benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como MMLU, HumanEval o GSM8K, y no hay comparaciones cuantitativas con otros modelos. La evaluación se limita a ejemplos cualitativos de generación de cuentos.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32; con precisión mixta puede ser inferior a 500 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, etc.). También puede ejecutarse en CPU sin problemas.
- Compatible con consumer GPU: sí, incluso en las más modestas.
- Opciones de despliegue: al ser un checkpoint de PyTorch, se puede cargar directamente con el código proporcionado. No hay soporte nativo para vLLM, llama.cpp u Ollama sin conversión previa a formatos como GGUF o safetensors.
- Latencia y throughput: no se han medido oficialmente, pero por su tamaño se espera una generación muy rápida, del orden de decenas de tokens por segundo en CPU y cientos en GPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. A nivel cualitativo, se puede comparar con otros SLM como GPT-2 (124M) o SmolLM (135M), pero ABADES-SLM-15M es significativamente más pequeño y con un contexto mucho más limitado (128 tokens frente a 1024 o más). Su licencia OpenRAIL permite uso comercial, pero su utilidad práctica en producción es muy limitada. No se incluye tabla comparativa por falta de datos objetivos.

## Limitaciones y advertencias

- Entrenado exclusivamente con cuentos infantiles simples (TinyStories), por lo que su conocimiento del mundo es extremadamente limitado.
- Ventana de contexto de solo 128 tokens, lo que impide mantener coherencia en textos largos o conversaciones multi-turno.
- No apto para tareas de razonamiento complejo, hechos factuales o generación de código.
- Puede producir texto repetitivo o incoherente cuando se le presentan prompts fuera de su dominio.
- No se han realizado evaluaciones de sesgos ni de seguridad; el modelo podría reflejar sesgos presentes en el dataset de entrenamiento.
- La licencia OpenRAIL permite uso comercial, pero el modelo no está optimizado para producción y carece de soporte técnico.
- El repositorio no incluye pesos en formatos estándar como safetensors o GGUF, lo que dificulta su integración con herramientas comunes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ApyHTML19/ABADES-SLM-15M)
- [Dataset TinyStories](https://huggingface.co/datasets/roneneldan/TinyStories)
- [nanoGPT (inspiración)](https://github.com/karpathy/nanoGPT)
