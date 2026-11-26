# huggingtime12/Qwen3-4B-noSFT-PhoMT-GRPO-BLEU

## Resumen

Qwen3-4B-noSFT-PhoMT-GRPO-BLEU es un adaptador LoRA publicado por el usuario huggingtime12 sobre el modelo base Qwen/Qwen3-4B. Se trata de un ajuste fino mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo, combinado con el framework TRL y PEFT. El nombre sugiere un entrenamiento sin SFT previo (noSFT) orientado a una tarea de traducción o generación evaluada con BLEU, probablemente en el contexto de PhoMT (un corpus de traducción chino-vietnamita), aunque el autor no documenta estos detalles.

El modelo resuelve, en principio, la adaptación del modelo base a una tarea concreta mediante refuerzo, sin una fase supervisada previa. Su relevancia es limitada: cuenta con cero descargas y cero likes, la model card es la plantilla por defecto de Hugging Face sin rellenar, y no se aportan datos de entrenamiento, evaluación ni uso previsto. Es un artefacto de experimentación personal más que un modelo listo para producción.

Por tanto, esta ficha se basa en los metadatos del repositorio (tags, tamaño, modelo base y framework) y en las características conocidas del modelo base Qwen3-4B. Cualquier dato no confirmado se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-4B) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3-4B tiene 4.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base Qwen3-4B soporta hasta 32.768 tokens (según documentación de Qwen) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que se carga sobre el modelo base Qwen/Qwen3-4B mediante la librería PEFT (versión 0.18.0 según la model card). El entrenamiento se realizó con GRPO, un algoritmo de optimización de política relativa a grupos implementado en TRL, que estima la ventaja de las respuestas comparando varias muestras generadas para un mismo prompt en lugar de usar un modelo crítico separado. El sufijo "noSFT" indica que no hubo una fase de ajuste supervisado previa al refuerzo, y "PhoMT" apunta a un corpus de traducción (PhoMT es un conjunto de datos público de traducción chino-vietnamita), aunque el autor no lo confirma.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, hiperparámetros (rango del LoRA, alpha, tasa de aprendizaje, número de pasos), ni sobre si se aplicaron técnicas adicionales como DPO o decodificación especulativa. La model card no documenta ninguna innovación técnica más allá del uso de GRPO sobre LoRA.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3-4B.
- Razonamiento y matemáticas básicas, en la medida en que el adaptador no las haya degradado.
- Generación de código, capacidad propia del modelo base.
- Soporte de tool calling y function calling: no disponible en el adaptador; depende del modelo base y de que el ajuste no lo haya alterado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas; el nombre sugiere orientación a traducción, pero no se especifican pares de idiomas.
- Modo thinking: Qwen3 incorpora modo de razonamiento, pero se desconoce si el adaptador lo preserva.

## Casos de uso

- Experimentación con GRPO sin SFT: el adaptador sirve como referencia para reproducir pipelines de refuerzo directo sobre un modelo base, cargándolo con PEFT y TRL en un entorno de investigación.
- Evaluación de traducción automática: si el entrenamiento se realizó sobre PhoMT, podría emplearse para medir la calidad de traducción chino-vietnamita con métricas BLEU, aunque no hay evidencia publicada de su rendimiento.
- Ajuste de estilo o dominio sobre Qwen3-4B: el LoRA puede combinarse con el modelo base para probar si el refuerzo ha modificado el comportamiento en tareas concretas, comparando salidas con y sin adaptador.
- Estudio de estabilidad del entrenamiento por refuerzo: útil para analizar cómo afecta GRPO sin SFT a la coherencia y al formato de las respuestas del modelo base.
- Prototipado de bajo coste: al ser un adaptador de 0,5 GB, permite probar variantes de ajuste en una GPU de consumo sin recargar el modelo completo.
- Docencia y reproducción de técnicas de RLHF/RL: sirve como ejemplo práctico de configuración de TRL con PEFT para cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade un coste mínimo; el modelo base Qwen3-4B en fp16 requiere aproximadamente 8 GB de VRAM, y en cuantización de 4 bits (por ejemplo, GGUF Q4) alrededor de 3-4 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para fp16; RTX 3060 de 12 GB o superior para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en fp16, y en 6 GB con cuantización agresiva.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero no está confirmado para este artefacto; llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-4B-noSFT-PhoMT-GRPO-BLEU | Adaptador LoRA sobre 4B | No disponible (base: 32.768) | No disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B (base) | 4B | 32.768 | Apache 2.0 (según Qwen) | Hugging Face, ampliamente usado |
| Adaptadores LoRA comunitarios sobre Qwen3-4B | Variable | Depende del base | Variable | Hugging Face, uso variable |

No se dispone de datos de rendimiento del adaptador para compararlo con alternativas en términos de benchmarks. La comparación se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre datos, sesgos, evaluación ni uso previsto.
- Riesgo de alucinación y degradación del formato: el entrenamiento con GRPO sin SFT puede producir respuestas incoherentes o repetitivas si el reward no estaba bien calibrado.
- Licencia no especificada: no se puede garantizar el uso comercial del adaptador; además, la licencia del modelo base Qwen3-4B debe respetarse por separado.
- Idiomas no documentados: no se puede confirmar qué pares de idiomas cubre ni su calidad.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- El adaptador no incluye los pesos del modelo base; es necesario descargar Qwen/Qwen3-4B aparte.
- Posible sobreajuste a una métrica concreta (BLEU) en detrimento de la calidad general.

## Enlaces

- Hugging Face: https://huggingface.co/huggingtime12/Qwen3-4B-noSFT-PhoMT-GRPO-BLEU
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Calculadora de impacto de carbono (referenciada en la model card): https://mlco2.github.io/impact#compute
- Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
