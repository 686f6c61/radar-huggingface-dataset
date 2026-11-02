# ArchiveStudio/Qwen3.5-9B-Base

## Resumen

Qwen3.5-9B-Base es la variante preentrenada (sin post-entrenamiento conversacional) del modelo multimodal de 9B de la familia Qwen3.5, publicada por el equipo Qwen de Alibaba y redistribuida en el repositorio `ArchiveStudio/Qwen3.5-9B-Base` bajo licencia Apache 2.0. Se trata de un modelo causal de lenguaje con codificador de vision integrado mediante fusión temprana de tokens multimodales, disenado como base para fine-tuning, experimentos de in-context learning y desarrollo de investigación.

La arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención con compuertas (Gated Attention) en un patrón híbrido de 32 capas, con una dimensión oculta de 4096 y un vocabulario de 248.320 tokens. El modelo declara una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, lo que lo sitúa en la gama alta de ventanas de contexto para su tamano. Incluye además entrenamiento con multi-token prediction (MTP).

Su relevancia actual radica en que Qwen3.5 unifica vision y lenguaje en un único fundamento con paridad cross-generacional frente a Qwen3 y mejoras declaradas sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual, manteniendo un tamano de 9B parámetros que lo hace desplegable en hardware relativamente modesto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ha publicado resultados de benchmarks propios en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con codificador de vision; híbrido Gated DeltaNet + Gated Attention, con FFN y MTP; fusión temprana multimodal |
| Parametros totales | 9.653.104.368 (9B declarados) |
| Parametros activos | no disponible (la model card menciona MoE disperso como parte de la familia, pero no especifica parámetros activos para esta variante) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (declarado a nivel de familia Qwen3.5); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo emplea un transformer híbrido con 32 capas organizadas en un patrón de 8 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de 1 sub-bloque de Gated Attention, todos con FFN. La Gated DeltaNet usa 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention usa 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La FFN tiene dimensión intermedia de 12.288. La dimensión oculta es 4096 y el vocabulario (entrada y salida) es de 248.320 tokens con padding.

El entrenamiento se realizó en dos fases (pre-training y post-training) con fusión temprana sobre tokens multimodales, lo que según la model card logra paridad cross-generacional con Qwen3 y supera a Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual. Se aplicó RL a escala sobre entornos multi-agente con distribuciones de tareas progresivamente complejas, y se entrenó con multi-token prediction (MTP) en varios pasos. La model card declara una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto, con infraestructura de RL asíncrona. Los tokens de control `<|im_start|>` y `<|im_end|>` fueron entrenados para permitir LoRA/PEFT eficiente con la plantilla de chat oficial sin necesidad de reentrenar embeddings, una optimización relevante dado el gran vocabulario.

## Capacidades

- Generación de texto y razonamiento general.
- Comprensión de imágenes y tareas image-text-to-text (pipeline declarado).
- Generación de código y matemáticas (declarado a nivel de familia con mejoras sobre Qwen3-VL).
- Capacidades de agentes y razonamiento multi-paso, con RL entrenado sobre entornos multi-agente.
- Soporte multilingüe amplio: 201 idiomas y dialectos declarados a nivel de familia.
- Tokens de control para plantilla de chat oficial que habilitan LoRA/PEFT eficiente.
- Multi-token prediction (MTP) entrenado en varios pasos.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Audio: no disponible.

## Casos de uso

- Fine-tuning supervisado para dominios verticales: al ser una base preentrenada con tokens de control de chat ya entrenados, se puede adaptar con LoRA sin reentrenar embeddings, lo que reduce el coste computacional dado el vocabulario de 248.320 tokens.
- Experimentos de in-context learning con contexto largo: la ventana nativa de 262.144 tokens permite incluir corpus extensos (documentación, expedientes, bases de código) directamente en el prompt sin recuperación externa.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text y el codificador de vision integrado permiten tareas de extracción y razonamiento sobre capturas, formularios o figuras combinadas con texto.
- Investigación en agentes multi-paso: el modelo fue entrenado con RL sobre entornos multi-agente, lo que lo hace adecuado como base para estudiar scaffolds de agentes y orquestación de herramientas.
- Evaluación comparativa de arquitecturas híbridas: la combinación Gated DeltaNet + Gated Attention permite medir throughput y latencia de atención lineal frente a atención cuadrática en cargas de contexto largo.
- Generación de código como base para fine-tuning: la familia declara mejoras en benchmarks de código, y el modelo puede servir de punto de partida para asistentes de código especializados.
- Despliegue multilingüe: con 201 idiomas declarados, es candidato para sistemas de traducción, atención al cliente o análisis de contenido en mercados regionales diversos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara de forma cualitativa paridad cross-generacional con Qwen3 y mejoras sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (9,65B parámetros), en FP16/BF16 se requieren aproximadamente 19,3 GB de pesos (coincide con el tamano del repo), más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 10 GB; en 4 bits, en torno a 5-6 GB. Estas cifras son estimaciones por tamano, no datos publicados.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamano, una A100 40/80 GB o H100 encajan en BF16 con contexto largo; una RTX 4090 (24 GB) puede alojar los pesos en BF16 pero con margen limitado para contexto extenso.
- Cabe en GPU de consumo: probable en cuantización de 8 o 4 bits en GPUs de 16-24 GB; no confirmado por el autor.
- Opciones de despliegue: Hugging Face Transformers, vLLM y SGLang (declarados compatibles en la model card). Otros runners (llama.cpp, Ollama, TGI) no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base (este) | 9,65B | 262.144 nativos / 1.010.000 extensible | Texto + vision | Apache 2.0 | Hugging Face (repo ArchiveStudio) |
| Qwen3-VL | no disponible | no disponible | Texto + vision | no disponible | no disponible |
| Qwen3 | no disponible | no disponible | Texto | no disponible | no disponible |

La model card solo establece comparaciones cualitativas con Qwen3 y Qwen3-VL (paridad o mejora en razonamiento, código, agentes y visión). No se dispone de parámetros, contexto ni licencia de esas variantes en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: la model card indica que no está pensado para interacción directa, sino para fine-tuning, in-context learning e investigación.
- No se han publicado benchmarks ni evaluaciones propias en el repositorio redistribuido, lo que impide verificar las afirmaciones de rendimiento.
- Riesgo de alucinación inherente a un modelo base sin post-entrenamiento de alineamiento conversacional.
- Sesgos: no documentados en la información disponible; un modelo preentrenado sobre corpus web es susceptible de sesgos de diversa índole.
- Idiomas: se declaran 201 idiomas a nivel de familia, pero no hay lista concreta ni evaluación por idioma para esta variante.
- Licencia Apache 2.0 permite uso comercial, pero el repositorio es una redistribución por `ArchiveStudio` con 0 descargas y 0 likes; conviene verificar la integridad de los pesos frente al repositorio oficial de Qwen.
- El enlace de licencia de la model card apunta al repositorio oficial `Qwen/Qwen3.5-9B-Base`, no al de la redistribución.
- Contexto extensible a 1.010.000 tokens: la extensión más allá de 262.144 no está cuantificada en coste de memoria ni en degradación de calidad.
- No se especifican tipos de cuantización soportados ni parámetros activos, lo que limita la planificación de despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-9B-Base
- Repositorio oficial de referencia (licencia): https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Logo del modelo: https://qianwen-res.oss-accelerate.aliyuncs.com/logo_qwen3.5.png
