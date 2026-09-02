# EldritchLabs/MN-Starlight-Sylph-12B

## Resumen

MN-Starlight-Sylph-12B es un modelo de lenguaje de 12 000 millones de parámetros creado por EldritchLabs mediante la fusión de cinco modelos base de la familia Mistral-Nemo. El resultado es un modelo denso especializado en escritura creativa, narración de ficción y roleplay, con una prosa descriptiva y vívida, orientado a generar historias, diálogos y escenas con un tono literario. Se distribuye bajo licencia Apache 2.0 y está diseñado para su uso con la arquitectura MistralForCausalLM.

El modelo se construyó con el método de fusión DELLA (arXiv:2406.11617), tomando como base `Retreatcost/Mistral-Nemo-Base-2407-ChatML`. Combina los pesos de modelos como Ozan-v1, Arsenic-Shahrazad, VelvetCafe-RP, Amberlight-Lux y el propio base, ponderando de forma distinta las capas de atención, MLP y embeddings. Está pensado para desarrolladores que buscan un generador de texto creativo de alta calidad sin necesidad de ajuste fino adicional, aunque su uso principal es la ficción interactiva y el roleplay.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (Transformer denso) |
| Parametros totales | 12 000 millones (12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (base Mistral-Nemo, probablemente 128k, no confirmado) |
| Tipos de cuantizacion | No disponible (repo con pesos en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es una fusión mediante el método DELLA, implementado con mergekit. DELLA es una técnica de interpolación de pesos que combina modelos con densidades y pesos específicos por capa. En este caso, se utilizaron cinco modelos base, todos con arquitectura Mistral-Nemo (12B). La configuración YAML muestra que se aplicaron pesos distintos a los filtros `lm_head`, `embed_tokens`, `attn` y `mlp`, con una densidad de 0,9 y un epsilon de 0,09. El modelo base fue `Retreatcost/Mistral-Nemo-Base-2407-ChatML`, y el tokenizador se tomó de `shrugging-shoulders/Amberlight-Lux-12B`, con plantilla de chat ChatML.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO, ya que se trata de un merge y no de un modelo entrenado desde cero. El proceso de fusión no implica entrenamiento adicional, por lo que las capacidades del modelo heredan las de sus componentes.

## Capacidades

- Generacion de texto creativo y narrativo: produce prosa descriptiva, diálogos y escenas con un estilo literario cuidado, como se muestra en el ejemplo de salida de la model card.
- Roleplay y ficción interactiva: diseñado para mantener conversaciones y narrativas multi-turno con contexto de personajes y tramas.
- Generación de tramas y subtramas: capaz de crear estructuras narrativas complejas, giros y desarrollo de personajes.
- Continuación de escenas: puede continuar una historia o escena dada a partir de un fragmento.
- Soporte de plantillas de chat: compatible con ChatML y se recomienda Mistral Tekken (según la model card).
- Multilingüe: solo se declara inglés, aunque al estar basado en Mistral-Nemo podría tener cierta capacidad en otros idiomas, no está garantizado.

No se mencionan capacidades de tool calling, función de llamada, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Escritura de ficción y novelas: el modelo puede generar borradores de capítulos, descripciones de escenarios y diálogos, ayudando a autores a superar bloqueos creativos.
- Roleplay en juegos de texto: adecuado para sistemas de aventuras conversacionales donde el modelo interpreta personajes y narra eventos de forma coherente.
- Creación de contenido para videojuegos: generación de misiones, diálogos de NPC y narrativa ramificada para juegos de rol o aventuras gráficas.
- Prototipado de guiones: útil para generar guiones de cine, teatro o series, incluyendo estructura de escenas y desarrollo de personajes.
- Herramientas de asistencia a la escritura: integrable en editores de texto o aplicaciones de escritura creativa para sugerir continuaciones o variaciones de estilo.
- Generación de contenido para blogs o redes sociales con tono narrativo: puede producir relatos cortos o microficción con calidad literaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 12B en bfloat16, el peso ocupa unos 24 GB (según el tamaño del repo). Para inferencia se recomienda al menos 24 GB de VRAM en FP16/BF16.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs con suficiente memoria.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) con cuantización (por ejemplo, GGUF de 8 bits o 4 bits) para reducir el uso de VRAM.
- Opciones de despliegue: compatible con transformers, vLLM, Text Generation Inference (TGI), llama.cpp y Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponible. Dependerá del hardware y de la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares de la misma categoría (12B de roleplay/escritura). Se podría comparar con otros merges de Mistral-Nemo como MagMalion-Twilight-12B-v1 (también de EldritchLabs), pero no hay datos de rendimiento ni benchmarks públicos. Por tanto, la comparativa se limita a características básicas:

| Modelo | Params | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| MN-Starlight-Sylph-12B | 12B | No disponible | Apache 2.0 | Escritura creativa, roleplay |
| MagMalion-Twilight-12B-v1 | 12B | 32k (según fuente externa) | Apache 2.0 | Roleplay, ficción |
| Mistral-Nemo-Base-2407 | 12B | 128k (oficial) | Apache 2.0 | Modelo base general |

Nota: los datos de MagMalion-Twilight provienen de una fuente externa no oficial y no se han verificado para este modelo.

## Limitaciones y advertencias

- El modelo no ha sido desensurado, por lo que puede mostrar rechazos ante ciertos contenidos (según la model card).
- Está diseñado principalmente para inglés; su rendimiento en otros idiomas no está garantizado.
- Al ser un merge, no hay información sobre sesgos específicos, pero hereda los sesgos de los modelos base.
- Riesgo de alucinación en hechos o información factual, dado su enfoque creativo.
- No se dispone de datos de contexto máximo confirmado; se recomienda verificar el comportamiento con ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar las licencias de los modelos base utilizados en el merge (todos Apache 2.0 según la información).
- Para producción, es necesario validar la calidad y coherencia en el caso de uso específico, ya que no hay benchmarks públicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EldritchLabs/MN-Starlight-Sylph-12B
- Paper del método DELLA: https://arxiv.org/abs/2406.11617
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Modelos base:
  - https://huggingface.co/arbazsiddiqui/Ozan-v1-12B
  - https://huggingface.co/Lambent/Arsenic-Shahrazad-12B-v4.5
  - https://huggingface.co/IggyLux/MN-VelvetCafe-RP-12B-V2
  - https://huggingface.co/Retreatcost/Mistral-Nemo-Base-2407-ChatML
  - https://huggingface.co/shrugging-shoulders/Amberlight-Lux-12B
