# DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0

## Resumen

DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0 es un fine-tune del modelo Qwen3.6-27B, desarrollado por DavidAU, orientado a escritura creativa, roleplay, ficción y conversación sin restricciones de contenido. El modelo aplica técnicas de "abliteration" (eliminación de capas de rechazo), GAIN TUNE y un proceso de entrenamiento en múltiples etapas con los datasets propios Polar-STRICT y F451-STRICT. Está diseñado para usuarios que buscan un asistente creativo con capacidad de razonamiento y generación de texto extenso, sin los filtros habituales de seguridad.

El modelo base Qwen3.6-27B es un modelo denso multimodal (imagen-texto) con atención híbrida basada en gated delta networks, soporte de MTP (multi-token prediction) y una ventana de contexto de 262 000 tokens. Este fine-tune conserva la arquitectura y las capacidades multimodales del base, aunque su enfoque principal es la generación de texto creativo y roleplay. Con 27 781 427 952 parámetros (aproximadamente 27,78 mil millones), es un modelo de gran tamaño que requiere hardware potente para inferencia en precisión completa, aunque existen cuantizaciones GGUF que permiten ejecutarlo en GPUs de consumo.

El modelo se distribuye bajo licencia Apache 2.0, pero su acceso en HuggingFace está restringido (gated) y requiere aceptar condiciones adicionales. Está etiquetado como "not-for-all-audiences" debido a su naturaleza sin censura. Es relevante para desarrolladores e investigadores que trabajan en generación de ficción, agentes conversacionales sin filtros o aplicaciones creativas donde se necesite un control fino del tono y estilo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal con gated delta networks hybrid attention (base Qwen3.6-27B) |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (heredado del base) |
| Tipos de cuantizacion | bfloat16 (nativo), GGUF (varias precisiones, no especificadas) |
| Idiomas soportados | en, zh (según ficha de HuggingFace) |
| Licencia | Apache 2.0 (con acceso gated en HuggingFace) |
| Formato de pesos | safetensors (bfloat16), GGUF (disponible en repos del autor) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.6-27B, un transformer denso multimodal que incorpora gated delta networks en su atención híbrida, lo que permite un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias largas. Incluye soporte de MTP (multi-token prediction) para acelerar la decodificación especulativa. El fine-tune de DavidAU aplica un proceso de entrenamiento en múltiples etapas (multi-stage tune) y una fusión de múltiples estados (multi-state merge), utilizando los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. Se emplea la técnica GAIN TUNE para ajustar la ganancia de ciertas capas y "abliteration" para eliminar los mecanismos de rechazo de contenido del modelo base. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto creativo: ficción, poesía, guiones, narrativa de todos los géneros, con estilo adaptable.
- Roleplay conversacional: mantiene personajes y contextos a lo largo de conversaciones multi-turno.
- Razonamiento y modo pensamiento: hereda la capacidad de "thinking" del base Qwen3.6, útil para tareas complejas.
- Capacidades multimodales: al conservar la arquitectura image-text-to-text, puede procesar imágenes y generar descripciones o continuar historias a partir de estímulos visuales.
- Sin censura (abliterated): no aplica los filtros de contenido habituales, lo que permite explorar temas sensibles o adultos.
- Soporte de tool calling y agentes: no confirmado explícitamente en este fine-tune, pero el base Qwen3.6-27B incluye capacidades de agentic coding y function calling; se asume que se mantienen, aunque no hay documentación específica.
- Multilingüe limitado: oficialmente en y zh, aunque el base podría soportar más idiomas; no se garantiza.

## Casos de uso

- Escritura de novelas y relatos largos: el contexto de 262K tokens permite mantener tramas complejas y personajes consistentes a lo largo de capítulos extensos, ideal para autores que necesitan un asistente de co-escritura.
- Roleplay inmersivo en juegos de texto: el modelo puede interpretar múltiples personajes, mantener historial de conversación y adaptar el tono según las instrucciones del usuario, sin restricciones temáticas.
- Generación de guiones para cine, teatro o series: su capacidad para seguir instrucciones de estilo y estructura facilita la creación de diálogos y escenas con coherencia narrativa.
- Asistente de lluvia de ideas creativas: puede generar premisas, giros argumentales o descripciones de escenarios a partir de una idea inicial, aprovechando su razonamiento y creatividad.
- Análisis y descripción de imágenes con enfoque narrativo: al ser multimodal, puede recibir una imagen y generar una historia, descripción poética o contexto narrativo alrededor de ella, útil para proyectos de arte generativo.
- Agente conversacional sin filtros en entornos controlados: para investigación en IA generativa donde se necesite estudiar el comportamiento del modelo sin restricciones de seguridad, siempre bajo supervisión y con advertencias éticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base Qwen3.6-27B reporta mejoras en agentic coding, razonamiento STEM y capacidades visuales, pero no se dispone de cifras concretas para esta variante. Se recomienda consultar la documentación del base para referencia, aunque los resultados pueden diferir debido al proceso de fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 55,6 GB, por lo que se necesitan al menos 60 GB de VRAM (p. ej., A100 80GB, H100 80GB). Con cuantización de 8 bits, ~28 GB; con 4 bits, ~14 GB.
- GPU recomendadas: A100 80GB, H100 80GB, RTX 4090 24GB (solo con cuantización 4-bit u 8-bit), RTX 6000 Ada, o GPUs de datacenter con suficiente memoria.
- En consumer GPU: es posible ejecutarlo en una RTX 4090 o similar usando GGUF de 4 bits, aunque con limitaciones de velocidad y contexto reducido.
- Opciones de despliegue: vLLM (con soporte para DFlash y MTP), llama.cpp (para GGUF), Ollama, TGI. Existe un wrapper de producción en GitHub (MiaAI-Lab/Qwen3.6-27B-NVFP4-DFlash-DGX-Spark) que ofrece un contenedor Docker con servidor compatible con OpenAI.
- Latencia y throughput: no disponibles. Dependen de la cuantización, el hardware y el uso de decodificación especulativa (MTP/DFlash).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.6-27B (base) | 27,78 B | 262K | Apache 2.0 | Multimodal general, agentic coding |
| DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0 | 27,78 B | 262K | Apache 2.0 (gated) | Creativo, roleplay, sin censura |
| Otros fine-tunes de DavidAU (p. ej., Fable-Fusion-711) | ~27 B | 262K | Apache 2.0 | Similar, con variaciones en mezcla de datasets |

No se dispone de comparativas con modelos de otros autores en la información proporcionada. Se recomienda evaluar directamente el modelo en tareas específicas para determinar su idoneidad frente a alternativas como Llama-3.1-70B o Mistral-Large, aunque el tamaño y licencia difieren.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar material ofensivo, violento, sexual o ilegal. No es apto para menores ni para uso en producción sin supervisión humana y filtros adicionales.
- Sesgos del base: hereda los sesgos presentes en Qwen3.6-27B, que pueden amplificarse por el fine-tune en ciertos temas.
- Riesgo de alucinación: como todo LLM, puede inventar hechos, citas o referencias, especialmente en contextos largos.
- Idiomas limitados: oficialmente solo en y zh; el rendimiento en otros idiomas no está garantizado.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos corporativos.
- Sin garantías de seguridad: al eliminar los mecanismos de rechazo, el modelo no distingue entre peticiones benignas y maliciosas; su uso conlleva responsabilidad legal y ética.
- Compatibilidad de tool calling: no confirmada en este fine-tune; si se necesita function calling, se debe verificar experimentalmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0
- Discusiones del modelo: https://huggingface.co/DavidAU/Qwen3.6-27B-V1.1-FF711-Darker-Hero-GAIN-H2.0/discussions
- Página del base Qwen3.6-27B en QwenCloud: https://www.qwencloud.com/models/qwen3.6-27b
- Recetas vLLM para Qwen3.6-27B: https://recipes.vllm.ai/Qwen/Qwen3.6-27B
- Repo de despliegue NVFP4 con DFlash: https://github.com/MiaAI-Lab/Qwen3.6-27B-NVFP4-DFlash-DGX-Spark
- Repo GGUF relacionado (Fable-Fusion): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF/discussions/10
