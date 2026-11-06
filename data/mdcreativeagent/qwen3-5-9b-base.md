# mdcreativeagent/Qwen3.5-9B-Base

## Resumen

Qwen3.5-9B-Base es el modelo base (pre-entrenado, sin ajuste de instrucciones) de la familia Qwen3.5 desarrollada por el equipo Qwen de Alibaba. Se distribuye en este repositorio como una republicación del checkpoint oficial en formato Hugging Face Transformers, con licencia Apache 2.0. Es un modelo causal con codificador visual, es decir, un modelo multimodal de fusión temprana que procesa texto e imágenes en un único espacio de tokens, con 9.653.104.368 parámetros totales y 32 capas.

La arquitectura es híbrida: combina capas de atención lineal basadas en Gated DeltaNet con capas de atención con compuertas (Gated Attention), en un patrón de 8 bloques que alternan tres capas DeltaNet con una capa de atención completa. Incorpora además un módulo MTP (multi-token prediction) entrenado con varios pasos. El contexto nativo es de 262.144 tokens, extensible hasta 1.010.000.

Su relevancia actual radica en que unifica visión y lenguaje en un solo modelo de 9B con licencia permisiva, lo que lo hace apto para fine-tuning, experimentación con in-context learning y despliegue en infraestructura moderada. Al ser un checkpoint base, no está pensado para interacción directa, sino como punto de partida para ajuste supervisado, LoRA o investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido (Gated DeltaNet + Gated Attention) con codificador visual y MTP |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (la model card no confirma configuración MoE para esta variante de 9B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible (el repositorio publica pesos safetensors sin cuantizar) |
| Idiomas soportados | 201 idiomas y dialectos según la model card; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers) |

Otros datos técnicos: dimensión oculta 4096; embedding de tokens 248.320 (con padding); 32 capas; dimensión intermedia de la FFN 12.288; Gated DeltaNet con 32 cabezas lineales para V y 16 para QK, dimensión de cabeza 128; Gated Attention con 16 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión RoPE 64. Tamaño del repositorio: 19,3 GB.

## Arquitectura y entrenamiento

El modelo sigue un diseño de transformer causal con un layout híbrido explícito: 8 bloques de la forma 3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN). Las capas Gated DeltaNet aportan atención lineal con estado recurrente, lo que reduce el coste computacional y de memoria en secuencias largas frente a la atención cuadrática completa; las capas Gated Attention, intercaladas, mantienen la capacidad de atención global precisa. La FFN tiene dimensión intermedia de 12.288 y el vocabulario está ampliado a 248.320 entradas, lo que explica en parte el tamaño del repositorio.

El entrenamiento combina pre-entrenamiento y post-entrenamiento con fusión temprana de tokens multimodales, de modo que el modelo aprende representaciones conjuntas de imagen y texto desde las primeras etapas. La model card menciona entrenamiento con multi-token prediction (MTP) en varios pasos, escalado de reinforcement learning sobre entornos multiagente y una eficiencia de entrenamiento multimodal cercana al 100 % respecto a texto puro. Los tokens de control `<|im_start|>` y `<|im_end|>` fueron entrenados con la plantilla de chat oficial para permitir PEFT tipo LoRA sin reentrenar embeddings, una optimización relevante dado el vocabulario ampliado. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento general, incluyendo matemáticas y código, según los benchmarks citados en la model card (paridad con Qwen3 y mejora sobre Qwen3-VL).
- Comprensión de imágenes: pipeline `image-text-to-text` con codificador visual y fusión temprana de tokens multimodales.
- Razonamiento visual y tareas que combinan imagen y texto (descripción, VQA, comprensión de documentos, presumiblemente).
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados.
- Capacidad de agentes: la familia se entrena con RL sobre entornos multiagente, lo que habilita razonamiento multi-paso y orquestación de tareas.
- Compatibilidad con tool calling y function calling: no se detalla explícitamente en la información disponible, aunque el posicionamiento como agentes nativos multimodales lo sugiere; conviene verificarlo empíricamente.
- Multi-token prediction en inferencia (MTP entrenado con varios pasos), útil para decodificación especulativa.
- Contexto largo de 262.144 tokens, apto para documentos extensos y conversaciones multi-turno prolongadas.
- Al ser un modelo base, no incluye alineación conversacional; requiere fine-tuning o uso con plantilla de chat para tareas de instrucciones.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser un checkpoint base con licencia Apache 2.0, se puede ajustar con SFT o LoRA sobre datos propios (legal, médico, financiero) sin reentrenar embeddings gracias a los tokens de control ya entrenados.
- Experimentación con in-context learning: el contexto de 262.144 tokens permite incluir muchos ejemplos demostrativos en el prompt para evaluar capacidades de few-shot en investigación.
- Procesamiento de documentos largos con imagen: informes escaneados, contratos o artículos científicos con figuras, aprovechando la ventana de contexto extendida y el codificador visual.
- Investigación en agentes multimodales: servir como base para entrenar políticas con RL en entornos que combinan percepción visual y acción textual.
- Generación de código asistida: ajuste sobre repositorios propios para autocompletado o generación de parches, con contexto suficiente para incluir varios ficheros.
- Evaluación comparativa de arquitecturas híbridas: útil para estudiar el equilibrio entre atención lineal (DeltaNet) y atención completa en tareas de razonamiento de largo alcance.
- Desarrollo de asistentes multilingües: cobertura declarada de 201 idiomas para productos con audiencia global, previo ajuste de instrucciones.
- Base para decodificación especulativa: el módulo MTP permite implementar borradores internos y acelerar la inferencia en despliegues de alto throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma paridad cross-generacional con Qwen3 y mejora sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K, MMMU, etc.) que puedan tabularse.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para inferencia cómoda con contexto moderado.
- Cuantización a 8 bits: en torno a 10-11 GB de pesos; a 4 bits, en torno a 5-6 GB, aunque los formatos cuantizados no se distribuyen en este repositorio y habría que generarlos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en producción con contexto largo; RTX 4090 (24 GB) para FP16 con contexto reducido o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 y potencialmente en GPUs de 16 GB si se cuantiza; el contexto de 262.144 tokens completo exige mucha más memoria por la caché KV, por lo que en consumer conviene limitar la ventana.
- Opciones de despliegue: Hugging Face Transformers, vLLM y SGLang (mencionados explícitamente como compatibles en la model card). llama.cpp y Ollama no están confirmados para esta arquitectura híbrida en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura híbrida con atención lineal y MTP está diseñada para reducir latencia y coste, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base (este) | 9,65 B | 262.144 (ext. 1.010.000) | Texto + imagen | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (oficial) | 9 B (según model card) | no disponible en la información | Texto + imagen | Apache 2.0 | Hugging Face |
| Qwen3-VL (generación anterior) | no disponible | no disponible | Texto + imagen | no disponible | Hugging Face |

La información disponible no permite comparar con alternativas de otros fabricantes (Llama, Gemma, Mistral) en términos de rendimiento medido, ya que no hay benchmarks publicados en las fuentes consultadas. La comparación cualitativa con Qwen3-VL se limita a la afirmación de la model card de que Qwen3.5 supera a Qwen3-VL en razonamiento, código, agentes y comprensión visual.

## Limitaciones y advertencias

- Modelo base sin alineación: no está pensado para interacción directa; sin fine-tuning puede producir respuestas incoherentes o no seguir instrucciones.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos de evaluación de factualidad en la información disponible.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con datos web multilingües es esperable sesgo cultural y lingüístico, especialmente en los 201 idiomas declarados con cobertura desigual.
- Contexto largo: aunque el modelo soporta 262.144 tokens nativos, el rendimiento efectivo en ventanas muy largas no está verificado con benchmarks públicos; la extensión a 1.010.000 tokens requiere técnicas adicionales no detalladas.
- Idiomas: la lista concreta de los 201 idiomas no está disponible, por lo que la calidad por idioma es incierta.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio es una republicación de un tercero (`mdcreativeagent`); conviene verificar la integridad de los pesos contra el repositorio oficial `Qwen/Qwen3.5-9B-Base`.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que no garantiza mantenimiento ni actualizaciones.
- Compatibilidad de tooling: la arquitectura híbrida DeltaNet puede no estar soportada por todas las herramientas de inferencia (llama.cpp, Ollama); verificar antes de desplegar.
- Sin datos de cuantización publicados: los formatos GGUF/AWQ/GPTQ no se distribuyen en este repositorio.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/mdcreativeagent/Qwen3.5-9B-Base
- Modelo oficial Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint base oficial referenciado en la licencia: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Otra republicación del mismo checkpoint: https://huggingface.co/racine-ai-qwen/Qwen3.5-9B-Base
