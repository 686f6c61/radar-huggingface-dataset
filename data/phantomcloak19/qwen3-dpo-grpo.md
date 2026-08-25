# Phantomcloak19/qwen3-dpo-grpo

## Resumen

Phantomcloak19/qwen3-dpo-grpo es un ajuste fino del modelo Qwen/Qwen3-4B, desarrollado por el usuario Phantomcloak19. Combina dos técnicas de optimización de preferencias, DPO (Direct Preference Optimization) y GRPO (Group Relative Policy Optimization), aplicadas mediante QLoRA sobre la base de Qwen3-4B. El modelo está diseñado para mejorar la capacidad de conversación y alineación con preferencias humanas, manteniendo el tamaño compacto de 4B parámetros, lo que lo hace adecuado para entornos con recursos limitados.

La relevancia de este modelo radica en que integra dos métodos de entrenamiento por refuerzo en un solo fine-tuning, algo poco común en modelos abiertos de este tamaño. La ventana de contexto declarada en el nombre del modelo es de 6168 tokens, inferior a la del modelo base Qwen3-4B (que soporta hasta 128K tokens), lo que implica una limitación importante para tareas con contexto largo. A pesar de ello, el modelo conserva las capacidades generales de Qwen3-4B en generación de texto, razonamiento y código, aunque no se han publicado métricas específicas que validen su rendimiento tras el ajuste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B) |
| Parametros totales | 4.022.468.096 (4,02B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 6168 tokens (según el nombre del modelo) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-4B, pero no especificados) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso con arquitectura estándar de decoder-only. El fine-tuning se realizó mediante QLoRA, una técnica que permite entrenar adaptadores de bajo rango sobre los pesos cuantizados del modelo base, reduciendo significativamente los requisitos de memoria. El entrenamiento combinó DPO (optimización directa de preferencias) y GRPO (optimización de políticas con recompensas grupales), con un valor de K=4 (probablemente el número de muestras por grupo en GRPO) y una ventana de contexto de 6168 tokens. No se han publicado detalles sobre el dataset utilizado, la composición de los datos de entrenamiento ni el número de pasos o épocas. Tampoco se indica si se aplicaron otras técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: al ser un fine-tuning de Qwen3-4B, se espera que mantenga las capacidades de diálogo multi-turno del modelo base.
- Razonamiento y comprensión de lenguaje: capacidades heredadas de Qwen3-4B, aunque no hay métricas que confirmen su estado tras el ajuste.
- Soporte de tool calling / function calling: no documentado específicamente para este modelo, pero Qwen3-4B lo soporta; no se confirma si el fine-tuning lo conserva.
- Capacidades multilingües: no especificadas; se asume que el modelo base las conserva, pero sin confirmación.
- Modo thinking / razonamiento avanzado: no documentado; Qwen3-4B tiene modos de pensamiento, pero este fine-tuning no los declara.

## Casos de uso

- Asistente de chat en aplicaciones móviles: al ser un modelo de 4B, puede desplegarse en dispositivos con 8-12 GB de VRAM, adecuado para chatbots locales sin conexión.
- Generación de texto en entornos de bajo coste: sirve para redacción de correos, resúmenes y contenido creativo en entornos donde no se dispone de GPUs de gama alta.
- Fine-tuning adicional para dominios específicos: su tamaño compacto permite continuar el entrenamiento con datasets propios, por ejemplo en atención al cliente o documentación técnica.
- Prototipado de sistemas de agentes: al heredar de Qwen3-4B, puede usarse para experimentar con pipelines de agentes simples, aunque no se ha verificado su soporte de tool calling.
- Educación y experimentación: útil para investigadores que quieren estudiar los efectos de DPO+GRPO en modelos pequeños sin grandes recursos.
- Aplicaciones de bajo presupuesto en producción: su tamaño y la compatibilidad con text-generation-inference permiten servir inferencias a coste reducido, aunque sin garantías de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Se recomienda evaluar el modelo en las tareas objetivo antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4,02B parámetros en FP16, se requieren aproximadamente 8 GB de VRAM solo para los pesos; con cuantización 8-bit se reduce a ~4 GB y con 4-bit a ~2 GB. No se han publicado cuantizaciones oficiales, pero se pueden generar con herramientas como llama.cpp o bitsandbytes.
- GPU recomendadas: GPUs consumer como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) pueden ejecutarlo en FP16; para cuantización 4-bit, incluso RTX 3060 (12 GB) es suficiente.
- Opciones de despliegue: al ser compatible con transformers y safetensors, se puede servir con vLLM, llama.cpp, Ollama (si se convierte a GGUF) o TGI. La etiqueta text-generation-inference sugiere compatibilidad con TGI.
- Latencia y throughput: no se han publicado métricas. En una GPU consumer, un modelo de 4B en FP16 suele generar entre 20 y 40 tokens por segundo, pero estos valores son orientativos y dependen del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Phantomcloak19/qwen3-dpo-grpo | 4,02B | 6168 (según nombre) | no disponible | Hugging Face |
| Qwen/Qwen3-4B (base) | 4,02B | 128K | Apache 2.0 (salvo ciertos casos) | Hugging Face |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community License | Hugging Face |
| Mistral-7B-v0.3 | 7B | 32K | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento para comparar. El modelo se presenta como un fine-tuning de Qwen3-4B, por lo que su comportamiento teórico debería acercarse al de la base, pero con modificaciones en la alineación. No hay información sobre licencia, lo que limita su uso comercial sin verificación.

## Limitaciones y advertencias

- No se ha publicado la licencia; el uso comercial queda en un vacío legal hasta que el autor la defina.
- La ventana de contexto de 6168 tokens es mucho menor que la del modelo base (128K), lo que limita tareas de contexto largo como análisis de documentos extensos o conversaciones de muchas vueltas.
- No se han documentado sesgos específicos, pero al ser un fine-tuning de Qwen3-4B, puede heredar los sesgos del modelo base (idioma, género, estereotipos).
- No se proporcionan datos de evaluación; no hay garantía de que el modelo mejore realmente la calidad conversacional frente a Qwen3-4B original.
- El repositorio no incluye instrucciones de uso, ni configuraciones de prompt, ni ejemplos de inferencia.
- El modelo fue creado en 2026-07-15 y actualizado el 2026-08-25, pero no hay documentación sobre el proceso de entrenamiento ni sobre los datos usados, lo que dificulta la reproducibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phantomcloak19/qwen3-dpo-grpo)
- [Página de despliegue en FriendliAI](https://friendli.ai/models/Phantomcloak19/qwen3-dpo-grpo)
- [Repositorio oficial de Qwen3 en GitHub](https://github.com/QwenLM/Qwen3)
- [Repositorio de ejemplo de fine-tuning con GRPO para Qwen3-4B](https://github.com/waqqasansari/qwen3-grpo-finetune)
