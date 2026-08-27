# dvader13/smollm3-3b-sft-5p95t

## Resumen

Este repositorio contiene un conjunto de checkpoints de Supervised Fine-Tuning (SFT) del modelo base SmolLM3-3B, desarrollado por Hugging Face. El autor, dvader13, ha publicado diez fracciones de entrenamiento (dosis del 10% al 100%) para estudiar el efecto de la cantidad de datos de ajuste fino en el rendimiento del modelo. El checkpoint se basa en una ruta de preentrenamiento de 5,95 billones de tokens (frente a los 11 billones del modelo base oficial, lo que sugiere una variante o un experimento intermedio). Los pesos se ofrecen en formato bf16 y están pensados exclusivamente para inferencia, sin estado de optimizador.

El modelo base SmolLM3-3B es un transformer de 3 mil millones de parámetros con una ventana de contexto de 128 000 tokens, soporte de tool calling, razonamiento de doble modo (pensamiento rápido y profundo) y capacidades multilingües. Este repositorio concreto no aporta una model card completa, pero hereda las características del modelo base. Su utilidad principal es investigar el impacto de la cantidad de datos de SFT en la calidad final del modelo, algo relevante para la optimización de pipelines de ajuste fino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de SmolLM3-3B) |
| Parámetros totales | 3 000 millones (3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (del modelo base) |
| Tipos de cuantización | bf16 (pesos en el repositorio) |
| Idiomas soportados | No disponible (seis idiomas según el modelo base, pero no se especifican) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

Nota: el repositorio contiene 10 checkpoints (checkpoint_pct010 a checkpoint_pct100) y el tamaño total es de 61,5 GB, lo que corresponde aproximadamente a 6 GB por checkpoint.

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer de solo decoder con atención causal. Fue preentrenado sobre 11 billones de tokens de texto general, con una ventana de contexto de 128 000 tokens y un tokenizador multilingüe. El proceso de ajuste fino se realizó con el conjunto de datos de instrucciones SmolTalk2 y posteriormente se aplicó una alineación mediante APO (Anchored Preference Optimization). En este repositorio, el autor ha partido de un checkpoint de preentrenamiento de 5,95 billones de tokens (una ruta intermedia) y ha realizado SFT con fracciones del 10% al 100% de los datos de ajuste, generando así una curva de dosis que permite observar cómo afecta la cantidad de datos al rendimiento final. Los pesos se guardan en bf16, sin estado de optimizador, por lo que son aptos únicamente para inferencia o para continuar entrenamiento desde cero.

## Capacidades

- Generación de texto y completado de secuencias de hasta 128 000 tokens.
- Razonamiento multi-paso y modo de pensamiento dual (rápido y lento) para tareas complejas.
- Soporte de tool calling y function calling, útil para agentes y automatizaciones.
- Capacidades de generación de código y resolución de problemas matemáticos.
- Multilingüe (seis idiomas nativos, aunque no se detallan en la información proporcionada).
- Instrucción de seguimiento de instrucciones gracias al SFT con SmolTalk2.

## Casos de uso

- **Asistentes conversacionales en dispositivos con recursos limitados**: con 3B parámetros y cuantización bf16, cabe en GPUs de consumo (6-8 GB de VRAM), lo que permite desplegar chatbots locales en entornos sin conexión a la nube.
- **Investigación sobre el efecto de la cantidad de datos en SFT**: los 10 checkpoints con dosis crecientes permiten trazar curvas de rendimiento frente a volumen de datos, útil para optimizar presupuestos de entrenamiento.
- **Generación de código asistida**: gracias al soporte de tool calling y razonamiento, puede integrarse en editores de código o pipelines CI/CD para sugerir fragmentos, aunque se recomienda validación posterior.
- **Análisis de sentimiento y clasificación de texto**: la capacidad de seguir instrucciones permite adaptarlo a tareas de etiquetado con pocos ejemplos.
- **Traducción automática**: al ser multilingüe, puede servir de base para sistemas de traducción, aunque su rendimiento en idiomas distintos al inglés no está documentado.
- **Prototipado rápido de agentes**: su tamaño moderado y contexto de 128K permiten experimentar con agentes que gestionan historias largas, por ejemplo en tareas de análisis de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para estos checkpoints de SFT en la información disponible. El modelo base SmolLM3-3B, según la documentación oficial, supera a Llama 3.2 3B y Qwen2.5 3B en varias tareas, y es competitivo con modelos de 4B como Qwen3 y Gemma3, pero no se proporcionan cifras concretas en este repositorio. Se recomienda consultar la documentación oficial del modelo base para obtener métricas detalladas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 6 GB para el modelo completo en bf16 (3B × 2 bytes). Con cuantización adicional (por ejemplo, 8-bit o 4-bit) se puede reducir a 3-4 GB.
- **GPU recomendadas**: tarjetas de consumo como RTX 3090, RTX 4090 o A2000 son suficientes. Para mayor velocidad, una A100 o H100 sería adecuada.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en GPUs con al menos 8 GB de VRAM sin cuantización adicional.
- **Opciones de despliegue**: compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y Transformers de Hugging Face.
- **Latencia y throughput**: no disponible; dependerá del hardware y la implementación. Para un modelo de 3B, se esperan decenas de tokens por segundo en GPU de gama alta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache 2.0 | Supera a Llama 3.2 3B y Qwen2.5 3B según documentación oficial |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 license | Alternativa de Meta, con licencia restrictiva para uso comercial |
| Qwen2.5 3B | 3B | 32K | Apache 2.0 | Modelo de Alibaba, muy usado en tareas de código y matemáticas |

Este checkpoint concreto no se puede comparar directamente sin datos de rendimiento propios. Se recomienda evaluar cada fracción del 10% al 100% en tareas específicas para determinar la dosis óptima.

## Limitaciones y advertencias

- **Falta de documentación específica**: la model card del repositorio no incluye información sobre sesgos, limitaciones de idioma o comportamiento esperado.
- **Sesgos y alucinaciones**: al ser un modelo de lenguaje de 3B, es susceptible a generar información falsa o sesgos presentes en los datos de entrenamiento.
- **Contexto largo**: aunque la ventana es de 128K, la atención de largo alcance puede degradar la coherencia en textos muy extensos.
- **Licencia**: Apache 2.0 permite uso comercial, pero debe atribuirse el origen del modelo.
- **No es un modelo de producción listo**: los checkpoints son solo para inferencia y no incluyen estado de optimizador; para uso real se recomienda usar el modelo base oficial o cuantizaciones específicas.
- **Datos de entrenamiento**: no se especifica la composición del dataset de SFT, por lo que no se puede evaluar la calidad de los datos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dvader13/smollm3-3b-sft-5p95t
- Modelo base oficial SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Curso de SmolLM3 (SFT): https://huggingface.co/learn/smol-course/unit1/3
- Repositorio GitHub de SmolLM: https://github.com/huggingface/smollm
- Información adicional del modelo: https://atomic.chat/models/smollm3-3b
