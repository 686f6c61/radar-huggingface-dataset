# RoseG/MaXaM_Large_v1.74

## Resumen

MaXaM_Large_v1.74 es un modelo de lenguaje de 70.553 millones de parámetros publicado en HuggingFace por el usuario RoseG y atribuido a Triadic Intelligence Labs. Se trata de un ajuste fino del modelo Llama-3.1-70B de Meta, entrenado mediante aprendizaje supervisado (SFT) sobre un dataset propietario denominado FTK, generado con la herramienta SFT Studio Pro. El modelo está orientado a generación de texto en inglés y se distribuye bajo la licencia llama3.3.

La relevancia de este modelo radica en su tamaño: con 70.5B parámetros se sitúa en la gama alta de los modelos open source, comparable a Llama-3.1-70B o Qwen2.5-72B. Sin embargo, la documentación es muy escasa: no se publican benchmarks, detalles del dataset de entrenamiento ni especificaciones de contexto, lo que limita su evaluación objetiva. El repositorio ocupa 282.2 GB en formato safetensors, consistente con pesos en precisión completa (BF16/FP16). Con 0 descargas y 0 likes, se trata de un modelo sin comunidad ni validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama-3.1-70B) |
| Parametros totales | 70.553.706.496 (70.5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-3.1-70B soporta 128K tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | llama3.3 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Llama-3.1-70B, con 70.5B parámetros en configuración densa. Esto implica atención por ventanas con embeddings rotatorios (RoPE), normalización RMSNorm y activación SwiGLU, sin componentes de mezcla de expertos ni atención lineal.

El entrenamiento se realizó mediante aprendizaje supervisado (SFT) sobre un dataset denominado FTK, creado con la herramienta SFT Studio Pro. La model card menciona a Triadic Intelligence Labs como responsable y los dominios triadai.agency y triadicai.agency. No se especifican el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas adicionales como RLHF o DPO. El texto de la model card es fragmentario y contiene errores tipográficos, incluyendo referencias a una versión anterior (v1.72) y a la licencia llama3.1, lo que sugiere una documentación copiada y mal editada.

## Capacidades

- Generación de texto en inglés: el modelo está entrenado principalmente para tareas de generación de lenguaje natural en inglés, según la model card.
- Ajuste supervisado (SFT): al ser un fine-tune, está optimizado para seguir instrucciones y completar tareas definidas en el dataset FTK.
- Compatibilidad con transformers: se integra con la biblioteca transformers de HuggingFace para inferencia y fine-tuning adicional.
- No se documentan capacidades específicas como tool calling, function calling, razonamiento multi-paso, modo thinking, visión o audio. Estas capacidades no están confirmadas en la información disponible.

## Casos de uso

- Generación de contenido en inglés: el modelo puede emplearse para redacción de artículos, resúmenes y textos técnicos, aprovechando su tamaño de 70.5B parámetros para producir texto coherente y matizado.
- Asistentes conversacionales: dado su origen como fine-tune de Llama-3.1-70B, puede servir como base para chatbots en inglés, aunque no se documenta soporte explícito de multi-turno ni system prompts.
- Fine-tuning adicional: los pesos en safetensors permiten continuar el entrenamiento sobre datasets específicos de dominio (legal, médico, técnico) mediante técnicas de SFT o LoRA, adaptando el modelo a tareas concretas.
- Investigación académica: el modelo puede utilizarse en estudios comparativos de modelos de 70B parámetros, aunque la falta de benchmarks publicados limita su uso como referencia fiable.
- Prototipado de aplicaciones NLP: integrable en pipelines de HuggingFace para tareas de clasificación, extracción de información o generación condicionada, siempre que el dominio esté en inglés.
- Evaluación de técnicas de cuantización: al disponer solo de pesos en safetensors, es un candidato para experimentos de cuantización (GPTQ, AWQ, GGUF) y análisis de degradación de rendimiento frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Precisión completa (BF16/FP16): ~141 GB de VRAM. Requiere múltiples GPU, por ejemplo 2x NVIDIA A100 80GB o 2x H100 80GB.
  - Cuantización INT8: ~70 GB de VRAM. Cabe en una sola A100 80GB o H100 80GB.
  - Cuantización INT4: ~35 GB de VRAM. Requiere una GPU con al menos 40 GB (por ejemplo, A6000 48GB) o dos GPU de 24 GB (RTX 4090) con tensor parallelism.
- GPU recomendadas: A100 80GB, H100 80GB, A6000 48GB (con cuantización), o clústeres multi-GPU para precisión completa.
- En GPU de consumo: no cabe en una sola RTX 4090 (24 GB) sin cuantización; con cuantización INT4 cabría en dos RTX 4090, pero no en una sola.
- Opciones de despliegue: vLLM, TensorRT-LLM, HuggingFace transformers con device_map="auto", o conversión a GGUF para uso con llama.cpp u Ollama.
- Latencia y throughput: no disponible. Para un modelo de 70B en FP16 con 2x A100, se estima un throughput de 10-30 tokens/s en generación, pero no hay datos publicados para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MaXaM_Large_v1.74 | 70.5B | no disponible | llama3.3 | HuggingFace (safetensors) |
| Llama-3.1-70B (Meta) | 70.6B | 128K | llama3.1 | HuggingFace, benchmarks y documentación extensa |
| Llama-3.3-70B (Meta) | 70.6B | 128K | llama3.3 | HuggingFace, benchmarks publicados |
| Qwen2.5-72B (Alibaba) | 72.7B | 128K | Apache 2.0 | HuggingFace, benchmarks publicados |

MaXaM_Large_v1.74 se diferencia de sus alternativas por ser un fine-tune no documentado de Llama-3.1-70B. Carece de benchmarks, especificaciones de contexto y detalles de entrenamiento que sí ofrecen los modelos de Meta y Alibaba. Su licencia llama3.3 permite uso comercial con restricciones propias de la familia Llama, pero la falta de documentación dificulta su adopción en producción frente a alternativas mejor caracterizadas.

## Limitaciones y advertencias

- Documentación insuficiente: la model card es fragmentaria y contiene errores tipográficos; no se especifican datos de entrenamiento, contexto ni benchmarks.
- Riesgo de alucinación: al ser un modelo de 70B sin evaluación publicada, el riesgo de generar contenido factualmente incorrecto es significativo, especialmente en dominios especializados.
- Sesgos desconocidos: al no publicarse la composición del dataset FTK, no es posible evaluar sesgos de género, raza o ideológicos presentes en los datos de entrenamiento.
- Idioma limitado: la model card indica únicamente inglés; no se garantiza rendimiento en otros idiomas.
- Sin soporte documentado de tool calling ni agentes: a diferencia de otros modelos de 70B, no se confirma la capacidad de usar herramientas o razonamiento multi-paso.
- Restricciones de licencia: la licencia llama3.3 impone condiciones de uso responsable y restricciones de redistribución propias de los modelos Llama; conviene revisar los términos completos antes de uso comercial.
- Repositorio sin mantenimiento: con 0 descargas y 0 likes, el modelo no tiene comunidad ni soporte; cualquier incidencia debe resolverse con el autor directamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RoseG/MaXaM_Large_v1.74
- Modelo base previo: https://huggingface.co/RoseG/MaXaM_Large
- Modelo base original: https://huggingface.co/meta-llama/Llama-3.1-70B
- Sitio de Triadic Intelligence Labs: triadai.agency (mencionado en la model card)
- Sitio alternativo: triadicai.agency (mencionado en la model card)
