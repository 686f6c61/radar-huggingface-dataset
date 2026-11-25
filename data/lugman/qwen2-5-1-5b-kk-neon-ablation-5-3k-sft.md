# lugman/Qwen2.5-1.5B-KK-Neon-Ablation-5-3K-SFT

## Resumen

Qwen2.5-1.5B-KK-Neon-Ablation-5-3K-SFT es un ajuste fino (fine-tuning) del modelo base unsloth/Qwen2.5-1.5B-Instruct, publicado por el usuario lugman en Hugging Face. Se trata de un modelo de generación de texto de tipo conversacional, derivado de la familia Qwen2.5 de Alibaba, con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones) y licencia Apache 2.0. El nombre del repositorio sugiere un experimento de ablación sobre un conjunto de datos de 3.000 muestras ("3K SFT"), aunque la model card no aporta detalles sobre la composición del dataset ni sobre la metodología del ajuste.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 y está pensado para tareas de generación de texto y conversación en inglés, único idioma declarado en las etiquetas. Al estar basado en la variante Instruct de Qwen2.5-1.5B, parte de un modelo ya alineado para seguir instrucciones, sobre el que se ha aplicado un entrenamiento supervisado adicional (SFT) mediante Unsloth y la librería TRL de Hugging Face. La model card indica que el entrenamiento se realizó "2x más rápido" con Unsloth, pero no documenta hiperparámetros, número de épocas ni evaluación.

La relevancia de esta ficha es limitada: el repositorio no registra descargas ni "likes", no incluye resultados de benchmarks y la documentación es mínima. Para un desarrollador o investigador, este modelo debe considerarse un artefacto experimental de bajo soporte, útil únicamente como referencia de un ajuste fino ligero sobre Qwen2.5-1.5B-Instruct, y no como una opción recomendada para producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, según tags `qwen2`) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos en safetensors; el ecosistema Qwen2.5 admite GGUF/AWQ/GPTQ vía herramientas externas, no documentado aquí) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Qwen2.5-1.5B-Instruct |
| Tamaño del repositorio | 9,3 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Fecha de creación | 2026-11-25 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1,54 mil millones de parámetros. Al derivar de unsloth/Qwen2.5-1.5B-Instruct, conserva la arquitectura del Qwen2.5-1.5B original: atención multi-cabeza con RoPE, capas de normalización RMSNorm, activación SwiGLU y embeddings de tokens compartidos con la cabeza de salida. No se trata de un modelo MoE ni híbrido; es un transformer denso convencional.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre el modelo Instruct, realizado con Unsloth y la librería TRL de Hugging Face, según indica la model card. El nombre del repositorio ("Ablation-5-3K-SFT") apunta a un experimento de ablación con un dataset de aproximadamente 3.000 ejemplos, pero no se especifica la composición del dataset, el número de tokens de entrenamiento, la presencia de RLHF/DPO adicional ni los hiperparámetros utilizados. Tampoco se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.); las únicas menciones técnicas son el uso de Unsloth para acelerar el entrenamiento y el formato de pesos en safetensors.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones (instruction following) gracias al ajuste Instruct del modelo base y al SFT adicional.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 1,5 B de parámetros.
- Generación de código y matemáticas a nivel básico, capacidad propia de la familia Qwen2.5, aunque no se documenta su rendimiento tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este ajuste concreto (el modelo base Qwen2.5-1.5B-Instruct sí lo soporta, pero no se confirma aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según las etiquetas del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el modelo es solo texto.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`) y con text-generation-inference.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el modelo, con 1,54 B de parámetros, puede desplegarse en una GPU de consumo y servir como base para validar flujos de chat antes de invertir en modelos mayores.
- Experimentación académica sobre ajuste fino: sirve como ejemplo reproducible de un SFT ligero (3K muestras) sobre Qwen2.5-1.5B-Instruct con Unsloth, útil para estudiar el efecto de datasets pequeños en modelos compactos.
- Generación de texto en entornos con recursos limitados: al caber en GPUs de gama media, puede emplearse para tareas de redacción, resumen o paráfrasis en inglés donde no se requiera máxima calidad.
- Evaluación comparativa de ablaciones: el nombre del repositorio indica un experimento de ablación, por lo que puede usarse como punto de comparación frente a otros ajustes del mismo modelo base.
- Clasificación y extracción de información simple: tareas de NLP en inglés que no exijan razonamiento complejo, aprovechando la ventana de contexto del modelo base (sujeta a verificación).
- Base para ajustes posteriores: al estar en safetensors y licencia Apache 2.0, puede servir como punto de partida para fine-tunings específicos de dominio en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 3,1 GB solo para los pesos (1,54 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB. En cuantización de 8 bits, alrededor de 1,6 GB de pesos; en 4 bits, unos 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4070); para cuantización 4/8 bits, GPUs de 4-6 GB como GTX 1650 o RTX 3050 pueden ser suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 8 GB o más en FP16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference`), endpoints de Hugging Face (tag `endpoints_compatible`); llama.cpp, Ollama o vLLM requerirían conversión a GGUF o formatos compatibles, no documentada en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lugman/Qwen2.5-1.5B-KK-Neon-Ablation-5-3K-SFT | 1,54 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino experimental sin benchmarks |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54 B | 32.768 tokens (según documentación oficial de Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo oficial con evaluación publicada |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens (según documentación oficial) | Apache 2.0 | Hugging Face | Alternativa más pequeña de la misma familia |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens (según documentación oficial de Meta) | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto mayor |

La comparación con el modelo base es la más relevante: este ajuste no documenta mejoras medibles sobre Qwen2.5-1.5B-Instruct, por lo que el modelo oficial sigue siendo la opción de referencia. Frente a Llama-3.2-1B-Instruct, la diferencia principal es la licencia (Apache 2.0 frente a la licencia comunitaria de Meta) y el contexto declarado, aunque para este ajuste concreto el contexto no está confirmado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base; podría incluso degradarlo en algunas tareas.
- Documentación mínima: la model card no detalla dataset, hiperparámetros, épocas ni metodología de ablación, lo que impide reproducir el entrenamiento.
- Sesgos conocidos: no documentados; al derivar de Qwen2.5, hereda los sesgos del corpus de entrenamiento original, no evaluados en este ajuste.
- Riesgo de alucinación: alto en un modelo de 1,5 B de parámetros, especialmente en tareas de conocimiento factual o razonamiento complejo; no se ha medido tras el ajuste.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitación de contexto: no confirmado para este ajuste; conviene verificar experimentalmente la ventana efectiva antes de usarlo con prompts largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de producción.
- Sin tracción comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, lo que reduce la probabilidad de encontrar issues resueltos o mejoras.
- Fecha de creación futura (2026-11-25): conviene verificar la integridad y procedencia del repositorio antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/lugman/Qwen2.5-1.5B-KK-Neon-Ablation-5-3K-SFT
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
