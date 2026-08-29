# itsVentie/Stalk-mini

# Stalk-mini

## Resumen

Stalk-mini es un modelo de lenguaje causal de 43,66 millones de parámetros basado en la arquitectura Llama, desarrollado por Ventie (usuario itsVentie) como experimento para evaluar inferencia de baja latencia en arquitecturas personalizadas. Está entrenado desde cero sobre el conjunto de datos TinyStories, compuesto por relatos breves en inglés, lo que lo convierte en una herramienta ligera para pruebas de generación de texto y medición de rendimiento en entornos locales.

El modelo se publica con licencia MIT y está pensado exclusivamente para fines de investigación y evaluación experimental. No está diseñado para tareas de producción que requieran precisión factual, razonamiento complejo o seguimiento de instrucciones. Su reducido tamaño y su tokenizador BPE personalizado de 16 000 entradas lo hacen especialmente adecuado para entornos con recursos limitados, como dispositivos embebidos o pruebas de velocidad en CPU.

La relevancia de Stalk-mini radica en su carácter didáctico y de referencia: permite estudiar el comportamiento de la arquitectura Llama a escala mínima, comparar estrategias de entrenamiento con datasets sintéticos y validar infraestructuras de inferencia sin necesidad de hardware de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer causal) |
| Parametros totales | 43 655 680 (43,66 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Stalk-mini sigue la arquitectura Llama, un transformer causal con normalización RMSNorm y activaciones SwiGLU, aunque a escala reducida. El tokenizador es un BPE personalizado con un vocabulario de 16 000 tokens, adaptado al corpus de TinyStories. No se especifican el número de capas ni la dimensión oculta, pero el total de parámetros (43,66 M) sugiere una configuración compacta, probablemente con 4-6 capas y dimensiones de modelo de 512 o inferiores.

El entrenamiento se realizó sobre 50 000 muestras del dataset TinyStories, con 2 épocas completas y un total de 3 126 pasos. Se utilizó el optimizador AdamW con una programación de tasa de aprendizaje coseno. La pérdida final de entrenamiento fue de aproximadamente 1,54, lo que indica un ajuste razonable para un corpus tan reducido. No se menciona el uso de técnicas de alineación como RLHF o DPO; el modelo es un LM causal puro, sin ajuste fino por instrucciones.

## Capacidades

- Generación de texto en inglés, especialmente relatos cortos y narrativa sencilla, dado su entrenamiento exclusivo en TinyStories.
- Inferencia de baja latencia en hardware modesto, gracias a su reducido número de parámetros.
- Evaluación de arquitecturas y pruebas de velocidad en entornos de desarrollo (por ejemplo, con la librería Candle en Rust).
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento explícito ni de capacidades multimodales (visión, audio).
- No está entrenado para seguir instrucciones ni para mantener diálogos multi-turno complejos.

## Casos de uso

- Pruebas de latencia y throughput en dispositivos edge: su tamaño permite medir el rendimiento de motores de inferencia como llama.cpp o Candle en CPUs o GPUs de baja gama, sin necesidad de cuantización.
- Evaluación de arquitecturas experimentales: sirve como modelo de referencia para comparar implementaciones de atención, capas de normalización o estrategias de tokenización en un entorno controlado.
- Generación de cuentos infantiles en inglés: puede producir relatos breves y coherentes dentro del dominio de TinyStories, útil para prototipos de aplicaciones educativas o de entretenimiento ligero.
- Validación de pipelines de Hugging Face Transformers: al ser un modelo estándar de tipo LlamaForCausalLM, permite comprobar la integración con la biblioteca y con formatos como safetensors.
- Enseñanza de aprendizaje profundo: su tamaño y simplicidad lo hacen adecuado para demostrar el entrenamiento de un transformer desde cero y analizar la evolución de la pérdida.
- Benchmarking de cuantización: aunque no se publican cuantizaciones oficiales, se puede utilizar para probar herramientas de cuantización post-entrenamiento (por ejemplo, GPTQ o bitsandbytes) y medir el impacto en la calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas como MMLU, HumanEval o GSM8K para este modelo, y la model card no incluye comparaciones con otras arquitecturas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo ocupa aproximadamente 175 MB; en FP16, unos 88 MB; en int8, unos 44 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM, y también puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada (por ejemplo, NVIDIA GTX 1650, RTX 3050) o incluso integradas. No requiere hardware especializado.
- Opciones de despliegue: Hugging Face Transformers, llama.cpp, Candle (mencionado en los tags), Ollama (si se convierte a GGUF), o vLLM (aunque es excesivo para este tamaño).
- Latencia y throughput: no se proporcionan datos oficiales, pero por su tamaño se espera una generación de decenas de tokens por segundo en CPU y cientos en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (por ejemplo, otros modelos entrenados en TinyStories como TinyStories-1M o TinyStories-3M). No se han encontrado datos de rendimiento ni especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés y sobre un corpus muy reducido (50 000 muestras de TinyStories), por lo que su vocabulario y dominio son extremadamente limitados.
- No es apto para razonamiento complejo, seguimiento de instrucciones ni tareas que requieran precisión factual.
- Riesgo elevado de alucinaciones y de generar texto incoherente fuera del dominio de cuentos infantiles.
- No se especifica la longitud de contexto, lo que impide conocer el límite de tokens de entrada; se recomienda asumir un contexto corto (probablemente 512 o 1024 tokens).
- No se han publicado resultados de cuantización ni de rendimiento en diferentes hardware, por lo que las estimaciones de VRAM son orientativas.
- El modelo es experimental y no cuenta con soporte ni mantenimiento activo; su uso en producción no está recomendado.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la calidad o seguridad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/itsVentie/Stalk-mini
- Perfil del autor en Hugging Face: https://huggingface.co/itsVentie
- Perfil del autor en GitHub: https://github.com/itsVentie
