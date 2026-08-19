# arrochi112/onebee-gf-sft-v0

## Resumen

`onebee-gf-sft-v0` es un checkpoint experimental de ajuste fino supervisado (SFT) mediante LoRA, desarrollado por el usuario `arrochi112` como parte del proyecto de investigación open source **small-mind-companion**. El modelo parte de la base `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4, y ha sido entrenado con únicamente 202 ejemplos como prueba de concepto (proof-of-concept) en el día 4 del proyecto. Su objetivo es explorar cuánta capacidad aparente puede recuperar un modelo pequeño (~2-4B parámetros) con visión, mediante post-entrenamiento, memoria externa y recuperación, en lugar de escalar el número de parámetros.

Este checkpoint concreto está diseñado como un experimento de validación temprana y ha sido superado por versiones posteriores del mismo proyecto (`sft-v1` y `dpo-v1-scale`). No se han publicado benchmarks ni evaluaciones formales, y el propio autor advierte explícitamente que los resultados deben interpretarse con cautela y que los números "que se ven bien" no deben tomarse como un resultado limpio sin verificar. Su relevancia actual reside en su valor como material de estudio para la comunidad sobre metodologías de post-entrenamiento con datos muy limitados, más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B) con adaptador LoRA |
| Parametros totales | 5.104.297.539 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | no disponibles (hereda los del modelo base, sin especificar) |
| Licencia | Gemma (términos de la licencia de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4. Sobre este modelo base se ha aplicado un adaptador LoRA (Low-Rank Adaptation) que se ha ajustado mediante SFT con un conjunto de entrenamiento de 202 ejemplos. El proyecto small-mind-companion documenta el proceso en su repositorio de GitHub, incluyendo los fallos encontrados y corregidos durante el desarrollo. No se proporcionan detalles sobre la composición del dataset, el número de tokens de entrenamiento ni si se emplearon técnicas adicionales como RLHF o DPO en este checkpoint concreto (aunque el proyecto sí incluye experimentos DPO en otros checkpoints). La innovación principal no reside en la arquitectura, sino en la metodología: investigar cuánto se puede mejorar un modelo pequeño con post-entrenamiento y memoria externa, documentando tanto resultados positivos como negativos.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Gemma 4 E2B, aunque no se han evaluado específicamente para este checkpoint.
- Capacidades multimodales: el modelo base soporta entrada de imágenes, por lo que este checkpoint potencialmente también las hereda, pero no hay evidencia empírica en la documentación.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentadas.
- Otras capacidades: al ser un experimento de investigación, no se han validado capacidades específicas. El autor no proporciona ninguna lista de habilidades verificadas.

## Casos de uso

Dado que se trata de un checkpoint experimental con solo 202 ejemplos de entrenamiento y sin evaluación formal, no es adecuado para uso en producción. Los casos de uso realistas se limitan al ámbito de la investigación y el desarrollo:

- Estudio de post-entrenamiento con pocos datos: investigadores pueden analizar cómo un LoRA con 202 ejemplos modifica el comportamiento del modelo base, comparando antes y después del ajuste.
- Reproducción de experimentos: el proyecto documenta metodología y resultados, permitiendo a otros reproducir el flujo de trabajo y verificar las conclusiones.
- Análisis de sobreajuste: al ser un checkpoint temprano, es útil para estudiar los efectos del sobreajuste en modelos pequeños con datasets reducidos.
- Desarrollo de pipelines de evaluación: se puede utilizar como caso de prueba para construir pipelines de evaluación de modelos multimodales pequeños.
- Comparación de checkpoints: el proyecto ofrece varios checkpoints (sft-v0, sft-v1, dpo-v0, dpo-v1-scale), lo que permite comparar la evolución del entrenamiento a lo largo del tiempo.
- Investigación sobre memoria externa y recuperación: el proyecto small-mind-companion explora cómo la memoria externa puede complementar al modelo; este checkpoint sirve como base para esos experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K para este checkpoint, y advierte explícitamente que los números presentados en la documentación del proyecto deben interpretarse con cautela y no como resultados limpios.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.104.297.539 parámetros en precisión fp16, se necesitan aproximadamente 10,2 GB de VRAM solo para los pesos, más memoria para activaciones y overhead. En la práctica, se recomienda al menos 16 GB de VRAM para inferencia cómoda.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40 GB) serían suficientes. En GPUs con menos de 16 GB, sería necesario cuantizar, pero no se proporcionan cuantizaciones GGUF para este checkpoint (sí existen para el checkpoint posterior `dpo-v1-scale-gguf`).
- Si cabe en consumer GPU: sí, en GPUs de gama alta como RTX 3090/4090, siempre que se gestione la memoria con cuidado.
- Opciones de despliegue: al estar en formato safetensors, se puede cargar con `transformers` y servir con vLLM o TGI. No hay soporte directo para Ollama o llama.cpp sin conversión previa a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría. El modelo base `google/gemma-4-E2B-it` no tiene especificaciones públicas detalladas en la información proporcionada. El propio proyecto ofrece otros checkpoints que podrían considerarse comparables entre sí, pero no hay datos de rendimiento para ninguno de ellos. Se recomienda consultar la documentación del proyecto para más detalles.

## Limitaciones y advertencias

- Checkpoint experimental: entrenado con solo 202 ejemplos, es una prueba de concepto y no está diseñado para uso en producción.
- Sin evaluación formal: no hay benchmarks ni métricas publicadas que validen su rendimiento.
- Riesgo de sobreajuste: el tamaño reducido del dataset hace muy probable que el modelo esté sobreajustado a los ejemplos de entrenamiento.
- Sesgos y alucinaciones: no se han estudiado; el modelo puede heredar sesgos del modelo base y generar contenido no verificado.
- Licencia Gemma: la licencia de Google Gemma impone restricciones de uso comercial y requiere cumplir sus términos específicos; se debe revisar antes de cualquier uso.
- Documentación limitada: la model card no detalla capacidades, limitaciones ni instrucciones de uso más allá de la referencia al repositorio del proyecto.
- Advertencia del autor: el propio creador indica que los resultados deben interpretarse con escepticismo y que se han encontrado y corregido errores durante el desarrollo, lo que subraya la naturaleza inmadura de este checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arrochi112/onebee-gf-sft-v0
- Proyecto small-mind-companion (GitHub): https://github.com/arrogance231/small-mind-companion
- Documento de resultados del día 4: https://github.com/arrogance231/small-mind-companion/blob/main/docs/day4_sft_results.md
- Otros checkpoints del proyecto: https://huggingface.co/arrochi112/onebee-gf-sft-v1, https://huggingface.co/arrochi112/onebee-gf-dpo-v0, https://huggingface.co/arrochi112/onebee-gf-dpo-v1-4epoch, https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale, https://huggingface.co/arrochi112/onebee-gf-dpo-v1-scale-gguf
