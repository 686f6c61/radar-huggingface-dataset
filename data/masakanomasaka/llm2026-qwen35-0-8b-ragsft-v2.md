# masakanomasaka/llm2026-qwen35-0.8b-ragsft-v2

## Resumen

`masakanomasaka/llm2026-qwen35-0.8b-ragsft-v2` es un ajuste fino (SFT) mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario masakanomasaka como proyecto final del curso "LLM講座2 2026". El modelo resultante se ha fusionado con los pesos del adaptador, por lo que su arquitectura y estructura son idénticas a las del modelo original Qwen3.5-0.8B. Cuenta con 873.438.784 parámetros reales según los pesos en safetensors y un repositorio de 1,8 GB.

El objetivo declarado del ajuste es especializar el modelo en tareas de generación aumentada por recuperación (RAG) sobre corpus en japonés. Para ello se emplearon datos de JSQuAD/JGLUE (bajo licencia CC BY-SA 4.0, filtrados y reformateados) y un conjunto de chunks distribuidos derivados de Wikipedia en japonés, utilizados como resultados de búsqueda en la entrada de entrenamiento. Todo el entrenamiento se realizó en Google Colab.

Se trata de un modelo experimental de muy bajo perfil: sin descargas ni "likes" en el momento de la consulta, sin model card detallada más allá de la información de entrenamiento, y sin licencia ni idiomas declarados en los metadatos de Hugging Face. Es relevante únicamente como artefacto de investigación o como ejemplo de pipeline de SFT con LoRA para RAG en japonés sobre una base pequeña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la de Qwen/Qwen3.5-0.8B; no se detalla en la model card) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible en metadatos; el entrenamiento se realizo sobre corpus en japones |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene exactamente la arquitectura del modelo base Qwen/Qwen3.5-0.8B, según indica el autor ("モデル構造は元のモデルと同一です", la estructura del modelo es idéntica a la original). No se aportan detalles adicionales sobre el tipo de transformer, mecanismos de atención, tokenizador ni configuración de capas. El ajuste se realizó mediante LoRA (Low-Rank Adaptation) seguido de la fusión de los pesos del adaptador en el modelo base, dando lugar al checkpoint final en safetensors.

Los datos de entrenamiento consisten en: (1) JSQuAD/JGLUE, bajo licencia CC BY-SA 4.0, filtrado y reformateado para el entrenamiento; y (2) un conjunto de chunks distribuidos derivados de Wikipedia en japonés (CC BY-SA 4.0), empleados como resultados de búsqueda en la entrada del modelo. Este diseño sugiere un entrenamiento orientado a que el modelo aprenda a responder condicionado por contexto recuperado (estilo RAG). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Todo el entrenamiento se ejecutó en Google Colab.

## Capacidades

- Generación de texto en japonés condicionada por contexto recuperado (RAG), según el diseño del entrenamiento.
- Respuesta a preguntas extractivas y de comprensión lectora sobre pasajes, derivado del uso de JSQuAD/JGLUE.
- Manejo de entradas con fragmentos de búsqueda (chunks de Wikipedia en japonés) como contexto.
- Capacidades del modelo base Qwen3.5-0.8B potencialmente conservadas (no verificadas ni documentadas por el autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no documentadas; el entrenamiento se centra en japonés.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Respuesta a preguntas sobre documentación interna en japonés: el modelo puede recibir chunks recuperados de una base documental y generar respuestas extractivas, aprovechando su ajuste específico sobre JSQuAD y Wikipedia en japonés.
- Prototipado de pipelines RAG en japonés: sirve como componente de generación en un sistema de recuperación + generación de bajo coste computacional, dado su tamaño inferior a mil millones de parámetros.
- Evaluación académica de técnicas de SFT con LoRA: útil como caso de estudio reproducible (entrenamiento en Colab) para comparar el efecto del ajuste sobre un modelo base pequeño.
- Extracción de respuestas en conjuntos de datos tipo JGLUE: adecuado para tareas de comprensión lectora en japonés en entornos de investigación.
- Generación de resúmenes de pasajes recuperados: puede condensar fragmentos de Wikipedia o documentación en japonés en respuestas breves.
- Experimentación con destilación o ajuste posterior: al ser un modelo de 0,8B, es viable reentrenarlo o cuantizarlo en hardware modesto para iterar sobre variantes.
- Docencia y formación en LLM: ejemplo práctico de fine-tuning con LoRA y datos con licencia CC BY-SA para cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,8 GB solo para pesos (873M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM para FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para cuantización 4/8 bits, cabe en GPUs con 2-4 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), y en CPU con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se genere primero una conversión a GGUF (no se distribuye en ese formato). También es posible usar Transformers con PyTorch.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| llm2026-qwen35-0.8b-ragsft-v2 | 873M | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | Hugging Face |
| Modelos pequeños tipo Qwen2.5-0.5B/1.5B | 0,5B-1,5B | 32K (según familia) | Apache 2.0 (según familia) | Hugging Face |

La comparación directa con alternativas no es posible con rigor porque no se dispone de datos de benchmarks ni de la licencia del modelo ajustado. Frente a su modelo base, la única diferencia documentada es el ajuste SFT con LoRA sobre datos japoneses de RAG.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; además, los datos de entrenamiento incluyen material CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir igual.
- Modelo experimental de curso: sin descargas ni validación comunitaria; no hay evidencia de calidad en producción.
- Riesgo de alucinación: al ser un modelo de 0,8B ajustado sobre un dominio estrecho, puede generar respuestas plausibles pero incorrectas, especialmente fuera del contexto recuperado.
- Idiomas: el entrenamiento se centró en japonés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea limitado.
- Contexto: no se especifica la longitud de contexto soportada; podría ser insuficiente para RAG con muchos chunks.
- Sesgos: no se han documentado evaluaciones de sesgo; los corpus de Wikipedia y JGLUE pueden introducir sesgos propios.
- Sin model card detallada: faltan instrucciones de uso, formato de prompt recomendado y limitaciones declaradas por el autor.
- Reproducibilidad: el entrenamiento en Colab y la ausencia de detalles de hiperparámetros dificultan la replicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masakanomasaka/llm2026-qwen35-0.8b-ragsft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
