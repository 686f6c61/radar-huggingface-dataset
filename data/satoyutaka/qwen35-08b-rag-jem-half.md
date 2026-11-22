# satoyutaka/qwen35-08b-rag-jem-half

## Resumen

`satoyutaka/qwen35-08b-rag-jem-half` es un ajuste fino (fine-tuning) del modelo base Qwen3.5-0.8B-Base, desarrollado por el usuario satoyutaka y publicado en Hugging Face. Se trata de un modelo multimodal de tipo imagen-texto-a-texto (image-text-to-text) orientado a tareas conversacionales y, por el nombre del repositorio, potencialmente especializado en generación aumentada por recuperación (RAG). El modelo conserva la arquitectura y configuración del Qwen3.5-0.8B original, con 873.438.784 parámetros reales según los pesos en safetensors.

El modelo base Qwen3.5-0.8B pertenece a la familia Qwen3.5 de Alibaba, que introduce una arquitectura híbrida combinando Gated Delta Networks (atención lineal) con atención con compuertas (Gated Attention), además de un entrenamiento multimodal de fusión temprana. El modelo resultante mantiene una ventana de contexto nativa de 262.144 tokens, lo que lo hace adecuado para tareas que requieren manejar documentos extensos o conversaciones de largo recorrido.

La relevancia de este ajuste reside en su tamaño reducido (menos de mil millones de parámetros) combinado con capacidades multimodales y un contexto muy amplio, lo que permite desplegarlo en hardware de consumo. Sin embargo, al ser un modelo derivado con cero descargas y sin model card propia más allá de la del modelo base, la información específica sobre el proceso de ajuste, los datos utilizados y las capacidades finales es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention |
| Parametros totales | 873.438.784 (0,8B) |
| Parametros activos | no disponible (no se especifica si es MoE en la información del ajuste) |
| Longitud de contexto | 262.144 tokens (nativo, según modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base declara 201 idiomas y dialectos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B-Base: un transformer causal con codificador de visión, que combina capas de Gated DeltaNet (atención lineal con 16 cabezas para V y 16 para QK, dimensión de cabeza 128) y capas de Gated Attention (8 cabezas para Q y 2 para KV, dimensión de cabeza 256). La disposición es de 6 bloques compuestos por 3 repeticiones de (Gated DeltaNet → FFN) seguidas de 1 (Gated Attention → FFN), con 24 capas en total, dimensión oculta de 1024 y FFN de dimensión intermedia 3584. El embedding de tokens es de 248.320 (con padding) y está atado a la salida del LM. Incorpora entrenamiento con MTP (multi-token prediction) en varios pasos.

El modelo base fue entrenado con pre-entrenamiento y post-entrenamiento, incluyendo fusión temprana de tokens multimodales y escalado de aprendizaje por refuerzo en entornos multiagente. El ajuste específico realizado por satoyutaka no está documentado en la información disponible: se desconoce el número de tokens de ajuste, la composición del dataset, si se empleó RLHF/DPO o qué técnica de fine-tuning se aplicó (el sufijo "rag-jem-half" sugiere un ajuste orientado a RAG, pero no se confirma). Tampoco se detalla si se congelaron capas o se ajustó el modelo completo.

## Capacidades

- Generación de texto y razonamiento: el modelo base muestra capacidades de razonamiento en modo no-thinking (MMLU-Pro 29,7; MMLU-Redux 48,5), aunque con rendimiento limitado por su tamaño.
- Procesamiento de imagen y texto: pipeline image-text-to-text, con codificador de visión integrado.
- Conversación multi-turno: etiqueta conversational en Hugging Face.
- Capacidades multilingües: el modelo base declara soporte para 201 idiomas y dialectos; el ajuste no especifica idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo base menciona entrenamiento RL en entornos multiagente, pero no se confirma en el ajuste.
- Modo thinking: el modelo base presenta modos thinking y non-thinking; no se especifica si el ajuste conserva ambos.
- Capacidades especiales: posible especialización en RAG (por el nombre del repositorio), no confirmada.

## Casos de uso

- Generación aumentada por recuperación (RAG): el nombre del repositorio sugiere un ajuste orientado a RAG; podría emplearse para responder preguntas sobre documentos recuperados, aprovechando su contexto de 262.144 tokens para incluir múltiples pasajes.
- Prototipado de asistentes multimodales: al ser un modelo de 0,8B con codificador de visión, permite experimentar con entrada de imágenes y texto en entornos de desarrollo con recursos limitados.
- Fine-tuning específico de tarea: el modelo base está pensado para prototipado y ajuste fino; este checkpoint puede servir como punto de partida para tareas concretas.
- Análisis de documentos extensos: la ventana de contexto de 262.144 tokens permite procesar informes, contratos o artículos largos en una sola pasada.
- Conversaciones multi-turno: adecuado para chatbots de dominio limitado donde el coste computacional es crítico.
- Investigación en eficiencia de modelos: su arquitectura híbrida (atención lineal + atención con compuertas) lo hace útil para estudiar el equilibrio entre rendimiento y coste en modelos pequeños.
- Despliegue en dispositivos de borde: con menos de mil millones de parámetros, puede ejecutarse en GPUs de consumo o incluso en CPU con cuantización adecuada.

## Benchmarks y rendimiento

Los datos de benchmarks disponibles corresponden al modelo base Qwen3.5-0.8B en modo non-thinking, según la model card:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69,6 | 40,2 | 55,3 | 29,7 |
| MMLU-Redux | 84,2 | 64,4 | 69,2 | 48,5 |
| C-Eval | 80,2 | 61,0 | 65,2 | 46,4 |

No se han publicado resultados de benchmarks específicos para el ajuste `satoyutaka/qwen35-08b-rag-jem-half` en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,8B parámetros, en precisión FP16 requiere aproximadamente 1,8 GB de VRAM (tamaño del repo: 1,8 GB). Con cuantización a 8 bits podría reducirse a ~1 GB, y a 4 bits a ~0,5 GB, aunque no se especifican tipos de cuantización compatibles.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100, H100 son compatibles. También puede ejecutarse en CPU con llama.cpp u Ollama si se generan pesos GGUF (no disponibles en el repo).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas de consumo (GTX 1060 6GB, RTX 2060, etc.).
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang, KTransformers (según la model card del base). Para llama.cpp/Ollama sería necesario convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| satoyutaka/qwen35-08b-rag-jem-half | 0,8B | 262.144 | Apache 2.0 | Sí (imagen-texto) | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | 262.144 | Apache 2.0 | Sí | Hugging Face |
| Qwen3-1.7B | 1,7B | no disponible en la información | Apache 2.0 | No especificado | Hugging Face |
| Qwen3-4B-2507 | 4B | no disponible en la información | Apache 2.0 | No especificado | Hugging Face |

El ajuste no presenta benchmarks propios, por lo que la comparación se limita a parámetros, contexto y licencia. El modelo base Qwen3.5-0.8B muestra un rendimiento inferior a Qwen3-1.7B y Qwen3-4B-2507 en los benchmarks de lenguaje, lo cual es esperable por su menor tamaño.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos para este ajuste; el modelo base puede heredar sesgos de los datos de entrenamiento de Qwen3.5.
- Riesgo de alucinación: al ser un modelo pequeño (0,8B), la probabilidad de generar información incorrecta o inventada es mayor que en modelos de mayor tamaño, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto o idioma: aunque el contexto es amplio (262.144 tokens), el rendimiento en tareas que requieren razonamiento profundo sobre contextos muy largos puede degradarse. Los idiomas soportados por el ajuste no están especificados; el modelo base declara 201 idiomas, pero el ajuste podría haber reducido esa cobertura.
- Restricciones de licencia para uso comercial: licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, siempre que se mantengan los avisos de copyright. Sin embargo, al ser un modelo derivado, se recomienda revisar la licencia del modelo base (Apache 2.0).
- Caveats para producción: el modelo tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad. No hay model card específica del ajuste, ni datos sobre el proceso de fine-tuning, datos utilizados o evaluación. El nombre "rag-jem-half" sugiere una especialización en RAG, pero no se confirma ni se detalla. Se recomienda realizar una evaluación exhaustiva antes de usarlo en producción.
- El pipeline image-text-to-text requiere que el modelo tenga el codificador de visión funcional; no se especifica si el ajuste conserva esa capacidad o si se ha modificado.

## Enlaces

- Hugging Face: https://huggingface.co/satoyutaka/qwen35-08b-rag-jem-half
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Licencia: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Qwen Chat: https://chat.qwen.ai
