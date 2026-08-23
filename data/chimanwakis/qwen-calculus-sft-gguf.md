# Chimanwakis/qwen-calculus-sft-GGUF

## Resumen

`Chimanwakis/qwen-calculus-sft-GGUF` es un modelo de generación de texto especializado en la creación de animaciones Manim para conceptos de cálculo. Se trata de un ajuste fino (SFT) mediante LoRA sobre la base `Chimanwakis/qwen_manim_animation_16bit`, que a su vez deriva de `Qwen2.5-Coder-3B`. El adaptador LoRA se fusionó con el modelo base y posteriormente se convirtió a formato GGUF utilizando Unsloth, dando como resultado un único archivo cuantizado en Q4_K_M de 1,80 GiB.

El modelo está pensado para resolver un problema muy concreto: transformar enunciados o problemas de cálculo (derivadas, integrales, límites, etc.) en código Manim listo para ejecutar, de modo que se puedan generar visualizaciones matemáticas animadas de forma automatizada. Su relevancia actual radica en la creciente demanda de contenido educativo generado por IA, donde la capacidad de producir animaciones matemáticas de alta calidad de forma reproducible es valiosa.

Con aproximadamente 3,09 mil millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, y su formato GGUF permite su uso directo con `llama.cpp` y herramientas compatibles como Ollama o LM Studio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Coder-3B) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el README recomienda 4096 tokens en `llama-cli`) |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer densa de `Qwen2.5-Coder-3B`, un modelo de 3,09 mil millones de parámetros con atención multi-cabeza estándar y capas de normalización RMSNorm. No se trata de un modelo MoE ni híbrido; es un modelo denso clásico orientado a generación de código.

El entrenamiento consistió en un ajuste fino supervisado (SFT) utilizando la técnica LoRA sobre el dataset `Chimanwakis/calculus_manim`, que contiene pares de problemas de cálculo y su correspondiente código Manim. El adaptador LoRA se fusionó con el modelo base en precisión de 16 bits antes de la conversión a GGUF mediante Unsloth. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de código Manim para visualizar conceptos de cálculo (derivadas, integrales, límites, series, etc.).
- Conversión de enunciados de problemas matemáticos en código Python ejecutable que produce animaciones.
- Razonamiento matemático básico heredado de `Qwen2.5-Coder-3B`, aunque el modelo está especializado en la tarea de generación de Manim.
- Generación de texto y conversación (el README sugiere uso con `-cnv` en `llama-cli`).
- No se han documentado capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Creación de contenido educativo para plataformas de vídeo: generar animaciones de cálculo automáticamente a partir de un enunciado, ahorrando horas de edición manual con Manim.
- Prototipado rápido de visualizaciones matemáticas: un profesor o estudiante puede describir un problema en texto y obtener el código Manim base que luego puede ajustar.
- Generación de ejercicios interactivos para cursos online: el modelo puede producir código que se integre en notebooks o plataformas de aprendizaje que rendericen animaciones.
- Automatización de demos matemáticas para documentación técnica: generar animaciones que acompañen explicaciones en artículos o manuales.
- Asistente de investigación en didáctica: explorar distintas representaciones visuales de un mismo concepto de cálculo de forma iterativa.
- Generación de código para proyectos open source de Manim: contribuir con animaciones nuevas a bibliotecas comunitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa 1,80 GiB; con el overhead de runtime se recomienda al menos 4 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: cualquier GPU con soporte CUDA y 4 GB o más de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060). También funciona en CPU con suficiente RAM (4-8 GB).
- Sí cabe en GPUs de consumo; es un modelo ligero de 3B cuantizado.
- Opciones de despliegue: `llama.cpp` (comando `llama-cli`), Ollama, LM Studio, y cualquier framework compatible con GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especialidad |
|---|---|---|---|---|---|
| `Chimanwakis/qwen-calculus-sft-GGUF` | 3,09B | No disponible | No disponible | GGUF | Generación de código Manim para cálculo |
| `Qwen2.5-Coder-3B` (base) | 3,09B | 32K | Apache 2.0 | safetensors | Generación de código general |
| `Qwen2.5-Coder-7B` | 7,6B | 32K | Apache 2.0 | safetensors | Generación de código general |

La comparativa se limita a los modelos base de la familia Qwen2.5-Coder, ya que no se dispone de modelos especializados en Manim/calculus con datos públicos comparables.

## Limitaciones y advertencias

- Especialización extrema: el modelo está ajustado únicamente para generar código Manim en el dominio del cálculo; su rendimiento fuera de esta tarea puede ser inferior al de un modelo generalista del mismo tamaño.
- Sesgos y alucinaciones: no se dispone de estudios de sesgos, pero como modelo derivado de Qwen2.5-Coder, puede heredar sesgos presentes en los datos de entrenamiento de código.
- Riesgo de alucinación en código: puede generar código Manim sintácticamente válido pero incorrecto matemáticamente, por lo que requiere revisión humana en entornos educativos.
- Licencia no disponible: no se especifica la licencia del modelo, lo que limita su uso comercial sin autorización explícita.
- Contexto limitado en la práctica: aunque la arquitectura base soporta hasta 32K tokens, el README recomienda usar 4096 tokens de contexto, lo que limita la complejidad de los problemas que puede procesar.
- Sin garantías de precisión matemática: el modelo no verifica los resultados matemáticos de las animaciones generadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Chimanwakis/qwen-calculus-sft-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/Chimanwakis/calculus_manim
- Modelo base (16 bit): https://huggingface.co/Chimanwakis/qwen_manim_animation_16bit
- Variante cuantizada anterior: https://huggingface.co/Chimanwakis/qwen_manim_animation_q4_k_m_v3
- Repositorio oficial de Qwen3 (familia de modelos base): https://github.com/QwenLM/Qwen3
- Repositorio oficial de Qwen: https://github.com/QwenLM/Qwen
- Reporte técnico de Qwen3: https://arxiv.org/html/2505.09388v1
