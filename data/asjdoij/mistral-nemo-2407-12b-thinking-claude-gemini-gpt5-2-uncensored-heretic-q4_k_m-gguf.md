# asjdoij/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF Q4_K_M del modelo `DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC`, un fine-tuning de Mistral Nemo 12B Instruct orientado a escritura creativa, roleplay y generación de ficción sin restricciones de contenido. Lo publica el usuario `asjdoij` mediante el espacio `gguf-my-repo` de ggml.ai, que automatiza la conversión de pesos safetensors a formato GGUF para su uso con llama.cpp. No se trata de un modelo entrenado desde cero, sino de una conversión de formato de un modelo derivado ya existente.

El modelo base es un Mistral Nemo 12B (12.247.782.400 parámetros) al que se le han aplicado tres datasets de destilación de razonamiento de alta calidad (Claude 4.5 Opus, Gemini 3 Pro Preview y GPT-5.2, 250 ejemplos cada uno según los tags), además de técnicas de abliteration/heretic para eliminar los mecanismos de rechazo. El resultado es un modelo con supuesto modo "thinking" y una ventana de contexto declarada de 128k-256k tokens (hasta 1 millón según la model card del autor original).

Es relevante para desarrolladores que necesitan un modelo local de 12B sin censura, con licencia permisiva heredada de Mistral Nemo, ejecutable en hardware de consumo y especializado en prosa vívida y narrativa. La ficha se centra en la versión cuantizada Q4_K_M, que es la que se distribuye en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Nemo 12B) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k-256k tokens declarados (hasta 1M según model card del autor original) |
| Tipos de cuantizacion | Q4_K_M (esta version); el modelo base ofrece otras variantes GGUF no detalladas |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M); el modelo base en safetensors/bfloat16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral Nemo 12B, un transformer decoder-only denso con atención por ventanas deslizantes y RoPE, entrenado originalmente por Mistral AI y NVIDIA. Sobre esa base, el autor del modelo original (`DavidAU`) aplicó un fine-tuning con tres datasets de razonamiento de alta calidad generados a partir de Claude 4.5 Opus, Gemini 3 Pro Preview y GPT-5.2 (250 ejemplos cada uno según los tags del repositorio). Adicionalmente se aplicaron técnicas de abliteration/heretic para eliminar las capas de rechazo del modelo instruct original, y se incorporó un modo "thinking" que emula el razonamiento extendido de los modelos destilados.

No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La model card del repositorio es la plantilla automática de `gguf-my-repo` y remite al modelo original para más detalles. Los tags indican uso de Unsloth en el pipeline de fine-tuning y la presencia de un modo de razonamiento ("Thinking") que, en la práctica, se manifiesta como cadenas de razonamiento previas a la respuesta.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo "thinking" (cadenas de razonamiento antes de la respuesta final).
- Escritura creativa y de ficción: prosa vívida, generación de tramas y subtramas, continuación de escenas, storyboarding.
- Roleplay y conversación de personajes sin restricciones de contenido (modelo "uncensored"/abliterated).
- Multilingüe en 9 idiomas: inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés.
- Contexto largo declarado de 128k-256k tokens, útil para narrativa extensa y documentos largos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible; el modelo base Mistral Nemo lo soporta, pero el fine-tuning puede haber degradado esta capacidad.
- Capacidades de agente y razonamiento multi-paso: parcialmente cubiertas por el modo thinking destilado, aunque no hay evaluación publicada.
- Capacidad de "swearing" y contenido adulto explícito (tag explícito en el repositorio).

## Casos de uso

- Escritura de ficción y novelas: el modelo está afinado específicamente para prosa vívida, generación de tramas y subtramas, y continuación de escenas; su ventana de contexto de 128k-256k permite mantener coherencia narrativa en manuscritos largos.
- Roleplay conversacional sin restricciones: útil para aplicaciones de entretenimiento, juegos de rol por texto y chatbots de personajes donde los filtros de contenido estándar resultan limitativos.
- Generación de guiones y storyboards: para equipos creativos que necesitan iterar rápidamente sobre escenas, diálogos y arcos argumentales en múltiples géneros (ciencia ficción, romance, terror).
- Asistente de escritura local y privada: al ejecutarse con llama.cpp en hardware de consumo, permite procesar material creativo sensible sin enviar datos a servicios en la nube.
- Prototipado de agentes conversacionales: el modo thinking y el contexto largo permiten construir pipelines de razonamiento multi-paso en local, aunque requiere validación empírica del tool calling.
- Traducción creativa y adaptación literaria: los 9 idiomas soportados permiten adaptar textos narrativos entre lenguas manteniendo el registro y el estilo.
- Generación de contenido para videojuegos: diálogos ramificados, descripciones de items y narrativa emergente en motores que integren llama.cpp vía API compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 7,5-8 GB de pesos, más overhead de contexto; con 8k-16k de contexto se recomienda un mínimo de 10-12 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100, H100. Para contexto completo de 128k se requiere hardware profesional con 40-80 GB.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4090 24 GB).
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI. vLLM y TGI no soportan GGUF de forma nativa; requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependerán del hardware y del tamaño de contexto. En una RTX 4090 con Q4_K_M se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para esta versión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Mistral Nemo 12B Thinking Uncensored Q4_K_M) | 12,2B | 128k-256k | no disponible | GGUF | Fine-tuning sin censura, orientado a ficción y roleplay |
| Mistral Nemo 12B Instruct (original) | 12,2B | 128k | Apache 2.0 | safetensors, GGUF | Base oficial, con alineación y filtros estándar |
| Mistral 7B Instruct v0.3 | 7,2B | 32k | Apache 2.0 | safetensors, GGUF | Más pequeño, menor contexto, con censura estándar |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Alternativa popular, con restricciones de uso comercial |

No se dispone de datos de benchmarks comparativos publicados para esta versión cuantizada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: elimina deliberadamente los mecanismos de rechazo, por lo que puede generar contenido ofensivo, explícito o dañino sin filtros. No apto para aplicaciones de cara al público sin moderación adicional.
- Riesgo elevado de alucinación: los fine-tunings de razonamiento destilado sobre modelos pequeños tienden a producir cadenas de razonamiento plausibles pero incorrectas, especialmente en tareas factuales.
- Licencia no disponible en el repositorio: la licencia del modelo base Mistral Nemo es Apache 2.0, pero el fine-tuning y la cuantización pueden introducir restricciones adicionales no declaradas. Verificar antes de uso comercial.
- El modo "thinking" y el contexto de 128k-256k son declaraciones del autor; no hay evaluación independiente que confirme su calidad ni que el modelo mantenga coherencia en ventanas tan largas.
- El tool calling puede haberse degradado tras el fine-tuning; requiere validación empírica antes de integrarlo en pipelines de agentes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- La model card es la plantilla automática de `gguf-my-repo`; no incluye detalles de entrenamiento, evaluación ni limitaciones específicas.
- El nombre del modelo incluye referencias a "GPT5.2" y "Claude 4.5 Opus" que corresponden a los datasets de destilación, no a una colaboración con OpenAI o Anthropic.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/asjdoij/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC-Q4_K_M-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC
- Model card del modelo base: https://huggingface.co/DavidAU/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC/blob/main/README.md
- Espejo del modelo base: https://huggingface.co/yoooxlg/Mistral-Nemo-2407-12B-Thinking-Claude-Gemini-GPT5.2-Uncensored-HERETIC
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset Claude 4.5 Opus: https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x
- Dataset Gemini 3 Pro Preview: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
- Dataset GPT-5.2: https://huggingface.co/datasets/TeichAI/gpt-5.2-high-reasoning-250x
