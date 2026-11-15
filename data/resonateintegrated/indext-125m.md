# ResonateIntegrated/InDEXt-125M

## Resumen

InDEXt-125M es un modelo de lenguaje causal compacto y bilingüe (inglés y ruso) desarrollado por ResonateIntegrated, entrenado completamente desde cero sobre 2.480 millones de tokens siguiendo las leyes de escala de Chinchilla (aproximadamente 20 tokens por parámetro). Se trata de un modelo de tipo decoder-only con arquitectura estilo Llama-3, implementado en PyTorch puro, que incorpora componentes modernos como RoPE, RMSNorm, SwiGLU, weight tying y atención causal con FlashAttention-2 a través de SDPA.

El modelo cuenta con 124,13 millones de parámetros totales (124.127.936 exactos, con pesos atados), de los cuales 99,11 millones corresponden al backbone (12 capas, 12 cabezas, dimensión de modelo 768, dimensión oculta 2560) y 25,02 millones a los embeddings de un tokenizador BPE propio con vocabulario de 32.576 tokens. Su longitud de contexto es de 1024 tokens y se distribuye en formato SafeTensors con precisión bfloat16.

Su relevancia radica en ser un ejemplo de entrenamiento desde cero de un modelo pequeño bilingüe con un presupuesto de cómputo ajustado y una pipeline en dos etapas: preentrenamiento Chinchilla sobre corpus web y educativos en inglés y ruso, seguido de un ajuste supervisado (SFT) específicamente orientado a diálogo bilingüe. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial y su experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (decoder-only causal LM), estilo Llama-3 con RoPE, RMSNorm, SwiGLU y weight tying |
| Parametros totales | 124.127.936 (124,13M), con pesos atados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en bfloat16 y SafeTensors) |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (model.safetensors) |

## Arquitectura y entrenamiento

InDEXt-125M es un transformer decoder-only causal con 12 capas, 12 cabezas de atención (head_dim de 64), dimensión de modelo de 768 y dimensión oculta de 2560 en el bloque MLP. Utiliza embeddings posicionales rotatorios (RoPE) con theta de 10000, normalización pre-norm RMSNorm con epsilon de 1e-5, activación SwiGLU, atención causal multi-cabeza implementada mediante FlashAttention-2 vía SDPA, y atado de pesos entre la capa de embeddings y la cabeza de lenguaje. El tokenizador es un ByteLevel BPE entrenado desde cero sobre un corpus equilibrado inglés/ruso, con un vocabulario de 32.576 tokens, diseñado para tokenizar eficientemente tanto caracteres cirílicos como latinos.

El entrenamiento siguió una metodología Chinchilla-optimal con 2.480 millones de tokens repartidos en 5.045 pasos, con un tamaño de lote global de 491.520 tokens por paso (batch_size de 96, grad_accum_steps de 5, block_size de 1024). Se usó el optimizador AdamW fusionado con betas (0,9; 0,95), weight decay de 0,1 y grad_clip de 1,0, junto con un schedule de learning rate de decaimiento coseno de 6e-4 a 6e-5 con 250 pasos de warmup. La pipeline se dividió en dos etapas: la primera (pasos 1 a 4400) consistió en preentrenamiento bilingüe sobre una mezcla ponderada de fineweb-edu sample-10BT (inglés, peso 0,35), fineweb-2 rus_Cyrl (ruso, peso 0,35), smoltalk all (diálogo e instrucciones en inglés, peso 0,15) y Vikhrmodels/GrandMaster-PRO-MAX (diálogo e instrucciones en ruso, peso 0,15). La segunda etapa (pasos 4401 a 5045) fue un ajuste SFT de pulido 100% bilingüe de diálogo, con una proporción 50/50 entre inglés y ruso, donde los datasets de diálogo pasaron a tener un peso de 0,50 cada uno.

## Capacidades

- Generación de texto causal en inglés y ruso, con soporte nativo de ambos idiomas gracias a su tokenizador BPE bilingüe entrenado desde cero.
- Conversación multi-turno mediante un formato de prompt con etiquetas de rol explícitas (`<|user|>` y `<|assistant|>`) y tokens especiales dedicados (`<|endoftext|>`, `<|pad|>`, `<|user|>`, `<|assistant|>`).
- Seguimiento de instrucciones y diálogo gracias a la etapa de SFT bilingüe sobre smoltalk y GrandMaster-PRO-MAX.
- Generación de texto educativo y de estilo web, derivada del preentrenamiento sobre fineweb-edu y fineweb-2.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso explícito.
- No se ha documentado capacidad de visión, audio ni modo de razonamiento (thinking mode).
- Capacidad de generación limitada a una ventana de contexto de 1024 tokens.

## Casos de uso

- Chat bilingüe ligero en inglés y ruso: el modelo puede gestionar conversaciones multi-turno dentro de su ventana de 1024 tokens, usando el formato de roles documentado, adecuado para asistentes embebidos o demos de bajo coste.
- Generación de texto educativo en inglés: gracias al preentrenamiento sobre fineweb-edu, puede producir explicaciones y resúmenes de temática educativa, útil para prototipos de herramientas de estudio.
- Procesamiento de texto en ruso: su tokenizador BPE entrenado sobre corpus cirílico y su preentrenamiento sobre fineweb-2 rus_Cyrl lo hacen apto para tareas básicas de generación y reescritura en ruso.
- Experimentación e investigación en modelos pequeños: al estar entrenado desde cero con receta Chinchilla documentada, sirve como base reproducible para estudiar escalado, tokenización bilingüe y pipelines de SFT en entornos con recursos limitados.
- Fine-tuning específico de dominio: con 124M parámetros y licencia Apache 2.0, es viable ajustarlo en una única GPU consumer para tareas concretas de clasificación generativa, resumen o extracción de información.
- Despliegue en entornos con recursos muy restringidos: su tamaño reducido permite ejecutarlo en CPU o en GPU de gama baja para tareas de generación de texto de baja latencia y bajo coste.
- Prototipado de asistentes conversacionales bilingües: permite validar pipelines de inferencia y formatos de prompt antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 124M parámetros en bfloat16, los pesos ocupan aproximadamente 250 MB; en fp32, unos 500 MB. La memoria adicional para el contexto de 1024 tokens es mínima.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM libre es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problemas, aunque el modelo está claramente sobredimensionado para GPUs de gama alta.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer con 2 GB o más de VRAM, e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: al estar en formato SafeTensors y usar transformers, es compatible con el stack de Hugging Face (transformers, TGI si se convierte). No se documenta compatibilidad con llama.cpp, Ollama ni vLLM en la información disponible; sería necesario convertir los pesos a GGUF para llama.cpp/Ollama.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| InDEXt-125M | 124,13M | 1024 | en, ru | Apache 2.0 | SafeTensors |
| GPT-2 small | 124M | 1024 | en | MIT | SafeTensors, GGUF |
| SmolLM-135M | 135M | 2048 | en (principalmente) | Apache 2.0 | SafeTensors, GGUF |
| Qwen2.5-0.5B | 494M | 32.768 | multilingüe | Apache 2.0 | SafeTensors, GGUF |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de datos de rendimiento comparativo de InDEXt-125M frente a estas alternativas en la información proporcionada. InDEXt-125M destaca por su enfoque bilingüe inglés-ruso y su receta de entrenamiento Chinchilla documentada, mientras que alternativas como SmolLM-135M o Qwen2.5-0.5B ofrecen contextos más largos y, en el caso de Qwen2.5, mayor cobertura multilingüe.

## Limitaciones y advertencias

- Modelo de muy pequeño tamaño (124M parámetros): su capacidad de razonamiento, conocimiento factual y coherencia en generaciones largas es limitada en comparación con modelos de mayor escala.
- Ventana de contexto de solo 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo elevado de alucinación, especialmente en preguntas factuales y en temas poco representados en los corpus de entrenamiento (fineweb-edu, fineweb-2, smoltalk y GrandMaster-PRO-MAX).
- Cobertura lingüística restringida a inglés y ruso; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Posibles sesgos heredados de los corpus web utilizados (fineweb-edu y fineweb-2), no documentados ni mitigados explícitamente en la model card.
- No se documentan evaluaciones de seguridad, alineación ni filtrado de contenido dañino.
- Aunque la licencia Apache 2.0 permite uso comercial, no se ofrece ninguna garantía sobre la calidad o idoneidad del modelo para producción.
- El código de inferencia de la model card hace referencia a una clase `InDEXtForCausalLM` que no se detalla; puede requerir adaptación para cargarse con `LlamaForCausalLM` de transformers.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: ResonateIntegrated/InDEXt-125M](https://huggingface.co/ResonateIntegrated/InDEXt-125M)
- [Licencia Apache 2.0](https://opensource.org/licenses/Apache-2.0)
- [Dataset HuggingFaceFW/fineweb-edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu)
- [Dataset HuggingFaceFW/fineweb-2](https://huggingface.co/datasets/HuggingFaceFW/fineweb-2)
- [Dataset HuggingFaceTB/smoltalk](https://huggingface.co/datasets/HuggingFaceTB/smoltalk)
- [Dataset Vikhrmodels/GrandMaster-PRO-MAX](https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX)
