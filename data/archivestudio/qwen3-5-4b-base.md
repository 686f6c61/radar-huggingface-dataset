# ArchiveStudio/Qwen3.5-4B-Base

## Resumen

Qwen3.5-4B-Base es el modelo base (pre-entrenado, sin ajuste conversacional) de la familia Qwen3.5, publicada por el equipo Qwen de Alibaba en febrero de 2026. Este repositorio concreto, alojado por el usuario ArchiveStudio, contiene los pesos en formato Hugging Face Transformers del modelo de 4B de parámetros con codificador de visión, es decir, una base multimodal de tipo image-text-to-text orientada a fine-tuning, experimentación con in-context learning y desarrollo de investigación, no a interacción directa.

La arquitectura combina atención lineal mediante Gated DeltaNet con capas de atención con compuertas (Gated Attention) en un esquema híbrido, e incorpora entrenamiento con multi-token prediction (MTP). El modelo declara 4.659.865.088 parámetros reales en safetensors, una dimensión oculta de 2560, 32 capas y un vocabulario de 248.320 tokens, con una longitud de contexto nativa de 262.144 tokens extensible hasta 1.010.000.

Su relevancia radica en que la familia Qwen3.5 apuesta por fusión temprana de tokens multimodales, cobertura de 201 idiomas y entrenamiento con RL a gran escala sobre entornos multiagente. Este checkpoint base es el punto de partida habitual para quien quiera especializar el modelo con LoRA o fine-tuning completo, aprovechando que los tokens de control `<|im_start|>` y `<|im_end|>` ya fueron entrenados para permitir PEFT eficiente con la plantilla de chat oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet + Gated Attention, con MTP |
| Parametros totales | 4.659.865.088 (4B nominales) |
| Parametros activos | no disponible (la model card no indica configuración MoE para esta variante de 4B) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | 201 idiomas y dialectos según la model card de la familia; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con codificador de visión y un layout híbrido de 32 capas organizado como 8 bloques de la forma 3 × (Gated DeltaNet → FFN) seguidos de 1 × (Gated Attention → FFN). Las capas Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; las capas Gated Attention usan 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia 9216 y la salida LM (248.320) está atada a los embeddings de tokens. Se entrenó con multi-token prediction (MTP) en varios pasos.

Según la model card de la familia, el entrenamiento combina pre-training con fusión temprana sobre tokens multimodales (con paridad cross-generacional con Qwen3 y superación de Qwen3-VL en razonamiento, código, agentes y comprensión visual) y una fase de post-training con RL escalado sobre entornos de millones de agentes con distribuciones de tareas progresivamente más complejas. La infraestructura declara cerca del 100% de eficiencia de entrenamiento multimodal respecto a texto solo y frameworks de RL asíncronos. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento de propósito general en el checkpoint base (sin ajuste instruct).
- Comprensión de imagen y texto (pipeline image-text-to-text) gracias al codificador de visión con fusión temprana.
- Razonamiento sobre código, matemáticas y tareas de agentes, según los benchmarks declarados por la familia.
- Soporte de tool calling y function calling heredado de la familia Qwen3.5 (no verificado específicamente en este checkpoint base).
- Capacidades multilingües amplias: 201 idiomas y dialectos declarados a nivel de familia.
- Tokens de control `<|im_start|>` y `<|im_end|>` entrenados para permitir LoRA/PEFT eficiente con la plantilla de chat oficial sin reentrenar embeddings.
- Capacidad de extrapolación de contexto hasta 1.010.000 tokens (declarada, no verificada en este repo).

## Casos de uso

- Fine-tuning supervisado (SFT) para dominios verticales: el checkpoint base es el punto de partida para adaptar el modelo a atención al cliente, legal o sanidad con datasets propios, aprovechando los 262.144 tokens de contexto para incluir documentación extensa en las muestras.
- Ajuste con LoRA sobre la plantilla de chat oficial: al estar preentrenados los tokens `<|im_start|>` y `<|im_end|>`, se puede hacer PEFT sin tocar los embeddings de un vocabulario de 248.320 tokens, lo que reduce drásticamente el coste de adaptación.
- Investigación en in-context learning: la ventana nativa de 262k tokens permite experimentar con muchos ejemplos en el prompt sin fine-tuning, útil para estudiar curvas de aprendizaje en contexto en tareas multimodales.
- Extracción de información de documentos con imágenes: al ser image-text-to-text, se puede usar como base para tareas de parsing de facturas, informes escaneados o capturas de pantalla, afinando después con datos del dominio.
- Generación de código asistida en pipelines internos: tras un SFT ligero sobre repositorios propios, el modelo puede integrarse en flujos de autocompletado o revisión, con contexto suficiente para incluir varios ficheros relevantes.
- Base para agentes multi-paso: la familia declara entrenamiento con RL sobre entornos multiagente; este checkpoint sirve para construir y evaluar scaffolds de agentes antes de pasar a las variantes post-entrenadas.
- Experimentación académica en arquitecturas híbridas: la combinación Gated DeltaNet + Gated Attention permite estudiar eficiencia de atención lineal frente a atención completa en un modelo de 4B abierto y con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia menciona de forma cualitativa paridad con Qwen3 y mejora sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no incluye cifras concretas para esta variante de 4B.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16): aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; con contexto largo el consumo crece de forma notable.
- VRAM estimada en cuantización de 8 bits: en torno a 5 GB para pesos; en 4 bits, en torno a 2,5-3 GB, aunque no se publican GGUF oficiales en este repo.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 262k tokens y despliegue en producción; L40S o RTX 6000 Ada para uso con contexto moderado.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en RTX 3090 (24 GB) en BF16 con contexto moderado; en GPUs de 16 GB o menos requiere cuantización.
- Opciones de despliegue: Hugging Face Transformers, vLLM y SGLang (declarados compatibles en la model card); llama.cpp u Ollama requerirían conversión a GGUF, no publicada en este repositorio.
- Latencia y throughput: no disponibles; la arquitectura híbrida con atención lineal sugiere mejor escalado con contexto largo que un transformer denso equivalente, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Base (este) | 4,66B | 262.144 (ext. 1.010.000) | Texto + imagen | Apache 2.0 | Hugging Face |
| Qwen3-VL (variantes pequeñas) | no disponible en la informacion | no disponible | Texto + imagen | no disponible | Hugging Face |
| Qwen3 (variantes de ~4B) | no disponible en la informacion | no disponible | Texto | no disponible | Hugging Face |

La model card de la familia sitúa a Qwen3.5 por encima de Qwen3-VL en razonamiento, código, agentes y comprensión visual, y con paridad cross-generacional frente a Qwen3 en texto. No se dispone de datos numéricos ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base pre-entrenado: no está ajustado para seguir instrucciones ni para conversación directa; su uso previsto es fine-tuning e investigación.
- Riesgo de alucinación inherente a un modelo de 4B sin post-training de alineamiento; no debe desplegarse en producción sin una fase de ajuste y evaluación.
- No se detalla la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos específicos; cabe esperar sesgos presentes en datos web a gran escala.
- La cobertura de 201 idiomas es una declaración a nivel de familia; el rendimiento real por idioma en esta variante de 4B no está verificado.
- El contexto extensible a 1.010.000 tokens es una declaración de la model card sin benchmarks publicados que la respalden en esta variante.
- El repositorio lo publica el usuario ArchiveStudio, no el equipo Qwen directamente; conviene verificar la integridad de los pesos frente al repositorio oficial antes de usarlos en producción.
- La licencia Apache 2.0 permite uso comercial, pero el `license_link` apunta al fichero LICENSE del repo oficial de Qwen; conviene revisar los términos exactos.
- No hay pesos GGUF ni cuantizaciones publicadas en este repositorio, lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArchiveStudio/Qwen3.5-4B-Base
- Repositorio oficial de referencia: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Blog de la familia Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
