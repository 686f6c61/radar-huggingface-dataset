# losercheers/Qwen3.5-9B-Base-CPT-0.4coding

## Resumen

Qwen3.5-9B-Base-CPT-0.4coding es una variante del modelo base Qwen3.5-9B-Base publicada por el usuario losercheers en Hugging Face. Se trata de un modelo de lenguaje causal con codificador de visión, desarrollado originalmente por el equipo Qwen (Alibaba), que combina una arquitectura híbrida de atención lineal (Gated DeltaNet) con atención con compuertas (Gated Attention) y una red feed-forward densa. El sufijo "CPT-0.4coding" sugiere un ajuste continuado (continued pre-training) orientado a código, aunque la model card no documenta detalles específicos sobre este proceso de entrenamiento adicional.

El modelo resuelve tareas de generación de texto, razonamiento, código y comprensión visual, con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.010.000. Su relevancia radica en la combinación de una arquitectura eficiente (atención lineal híbrida) con soporte multimodal temprano y una cobertura de 201 idiomas y dialectos, lo que lo posiciona como una base versátil para fine-tuning e investigación.

Con 8.953.803.264 parámetros totales según los pesos en safetensors, un tamaño de repositorio de 17,9 GB y licencia Apache 2.0, es un modelo de escala media (9B) adecuado para despliegue en hardware de gama alta consumer y para experimentación con técnicas de PEFT. La model card indica que los casos de uso previstos son fine-tuning, experimentos de in-context learning y desarrollo, no la interacción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention + FFN |
| Parametros totales | 8.953.803.264 (9B) |
| Parametros activos | no disponible (no se especifica que sea MoE; la model card menciona "sparse Mixture-of-Experts" en las highlights generales de Qwen3.5, pero no confirma MoE para esta variante de 9B) |
| Longitud de contexto | 262.144 nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible (no documentados en la información proporcionada) |
| Idiomas soportados | 201 idiomas y dialectos (según highlights de Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

Especificaciones adicionales de la arquitectura:
- Dimensión oculta: 4096
- Token embedding: 248.320 (padded)
- Número de capas: 32
- Layout: 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))
- Gated DeltaNet: 32 cabezas de atención lineal para V, 16 para QK; dimensión de cabeza 128
- Gated Attention: 16 cabezas para Q, 4 para KV; dimensión de cabeza 256; RoPE dim 64
- FFN: dimensión intermedia 12.288
- LM Output: 248.320 (padded)
- MTP: entrenado con multi-steps

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con codificador de visión integrado mediante fusión temprana (early fusion) sobre tokens multimodales. El layout híbrido combina bloques de Gated DeltaNet (atención lineal con estado recurrente) y bloques de Gated Attention (atención estándar con compuertas), en una proporción de 3:1 dentro de cada uno de los 8 grupos de capas. Esta combinación busca alto throughput de inferencia con baja latencia y coste reducido, manteniendo la capacidad de atención completa en puntos clave de la red. El modelo incorpora además MTP (multi-token prediction) entrenado con múltiples pasos, lo que puede acelerar la decodificación especulativa.

El entrenamiento incluye fases de pre-training y post-training, con un enfoque destacado en RL escalable sobre entornos multi-agente y distribuciones de tareas progresivamente complejas. La model card menciona una eficiencia de entrenamiento multimodal cercana al 100% respecto a entrenamiento solo de texto, y frameworks de RL asíncronos para orquestación de agentes a gran escala. Los tokens de control `<|im_start|>` y `<|im_end|>` fueron entrenados para permitir PEFT estilo LoRA eficiente con la plantilla de chat oficial, evitando re-entrenar embeddings pese al vocabulario ampliado (248.320 tokens). No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset. La variante CPT-0.4coding no documenta su proceso de ajuste continuado en la información disponible.

## Capacidades

- Generación de texto y razonamiento general en 201 idiomas y dialectos.
- Generación y comprensión de código, con especial énfasis en la variante CPT-0.4coding (ajuste continuado orientado a código, sin detalles publicados).
- Comprensión visual: pipeline image-text-to-text con codificador de visión integrado por fusión temprana.
- Razonamiento matemático y tareas de agentes, según las highlights de Qwen3.5.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: mencionado a nivel de familia Qwen3.5 (RL sobre entornos multi-agente), no verificado para esta variante concreta.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.
- MTP (multi-token prediction) para decodificación acelerada.
- Compatible con Hugging Face Transformers, vLLM y SGLang.

## Casos de uso

- Fine-tuning supervisado para dominios específicos: al ser un modelo base pre-entrenado, es adecuado como punto de partida para SFT con datasets propios, aprovechando los tokens de control ya entrenados para PEFT con LoRA sin re-entrenar embeddings.
- Generación de código en pipelines de desarrollo: la variante CPT-0.4coding está orientada a código, por lo que puede integrarse en asistentes de autocompletado o revisión, aunque requiere validación empírica del ajuste.
- Experimentos de in-context learning con contexto largo: la ventana de 262.144 tokens nativos permite incluir documentación extensa, repositorios completos o historiales de conversación largos en el prompt.
- Procesamiento de documentos con imágenes: el codificador de visión permite tareas image-text-to-text como extracción de información de capturas, diagramas o documentos escaneados.
- Investigación en arquitecturas híbridas: la combinación Gated DeltaNet + Gated Attention lo convierte en un banco de pruebas para estudiar eficiencia de atención lineal frente a atención completa.
- Despliegue multilingüe: con 201 idiomas y dialectos, es adecuado para aplicaciones de traducción, atención al cliente o generación de contenido en mercados diversos.
- Evaluación de decodificación especulativa: el entrenamiento con MTP permite experimentar con técnicas de aceleración de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona de forma cualitativa que Qwen3.5 alcanza paridad cross-generacional con Qwen3 y supera a los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K u otras) para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 18 GB solo para pesos (8,95B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9 GB para pesos; en 4 bits: aproximadamente 4,5-5 GB para pesos, más overhead.
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto largo completo (262K tokens) y despliegue en producción; RTX 4090 (24 GB) para BF16 con contexto moderado o cuantización.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con BF16 y contexto limitado, o en GPUs de 12-16 GB con cuantización (sujeto a disponibilidad de pesos cuantizados, no documentada).
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang (según la model card). Compatibilidad con llama.cpp, Ollama o TGI no confirmada en la información proporcionada.
- Latencia y throughput estimados: no disponibles. La arquitectura híbrida con atención lineal y MTP está diseñada para alto throughput y baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base-CPT-0.4coding (este) | 8,95B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face, 16 descargas | Variante CPT orientada a código, multimodal |
| Qwen3.5-9B-Base (original) | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face | Modelo base oficial sin ajuste CPT |
| Qwen3-VL (familia) | no disponible | no disponible | no disponible | Hugging Face | Referencia comparativa citada en la model card; Qwen3.5 afirma superarlo |

No se dispone de datos de rendimiento comparativo numérico en la información proporcionada. Otras alternativas de la misma categoría (por tamaño o tarea) no están documentadas en las fuentes consultadas.

## Limitaciones y advertencias

- Modelo base pre-entrenado: no está diseñado para interacción directa; requiere fine-tuning o post-training para uso conversacional en producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas para esta variante.
- Sesgos conocidos: no documentados en la información proporcionada; la cobertura de 201 idiomas no garantiza calidad uniforme en todos ellos.
- La variante CPT-0.4coding carece de documentación sobre su proceso de ajuste, datos utilizados o evaluación, lo que impide verificar su calidad en tareas de código.
- Contexto: aunque se declaran 262.144 tokens nativos, el rendimiento efectivo en contextos muy largos no está verificado empíricamente en las fuentes.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo original Qwen3.5-9B-Base enlazada en la model card.
- Repositorio con muy baja adopción (16 descargas, 0 likes) y creado/actualizado en fechas futuras (2026-11-05), lo que sugiere una publicación reciente o posiblemente no validada por la comunidad.
- No se documentan tipos de cuantización ni pesos GGUF, lo que puede limitar el despliegue en hardware consumer sin conversión manual.

## Enlaces

- Hugging Face (variante CPT): https://huggingface.co/losercheers/Qwen3.5-9B-Base-CPT-0.4coding
- Hugging Face (modelo base oficial): https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Blog Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
