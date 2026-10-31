# shashwatIDR/entity-v1-360m-instruct

## Resumen

Entity v1 360M Instruct es un modelo de lenguaje compacto ajustado por instrucciones, publicado por el usuario shashwatIDR en Hugging Face. Se trata de una derivación (fine-tune) de HuggingFaceTB/SmolLM2-360M-Instruct, el modelo instruccional de 360 millones de parámetros de la familia SmolLM2 de Hugging Face, cuyo desarrollo está documentado en el artículo técnico "SmolLM2: When Smol Goes Big" (arXiv:2502.02737). El modelo está diseñado para ejecutarse en dispositivos locales (on-device) y en entornos con recursos limitados, resolviendo tareas de chat, reescritura de texto y resumización sin depender de infraestructura en la nube.

Su relevancia radica en el segmento de los modelos pequeños (SLM): con aproximadamente 362 millones de parámetros y pesos disponibles en safetensors y GGUF, puede ejecutarse en CPU, en portátiles e incluso en el navegador mediante Transformers.js. Según la model card, la familia Entity mejora a su predecesor SmolLM1 en seguimiento de instrucciones, conocimiento y razonamiento, y el modelo base fue preentrenado con 4 billones (4T) de tokens en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (família LLaMA) |
| Parámetros totales | 361.821.120 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formatos safetensors y GGUF en el repositorio) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer decoder estándar compatible con la familia LLaMA (el tag `llama` en Hugging Face lo confirma), con precisión bfloat16 durante el entrenamiento. El modelo base SmolLM2-360M fue preentrenado con 4 billones de tokens usando una combinación diversa de datasets: FineWeb-Edu, DCLM, The Stack y datasets filtrados propios. La versión instruct se obtuvo mediante ajuste supervisado (SFT) con el dataset smoltalk (HuggingFaceTB/smol-smoltalk), que incluye datos públicos y curados, seguido de Direct Preference Optimization (DPO) con UltraFeedback binarizado.

Como innovaciones destacables, la familia SmolLM2/Entity incorpora datasets especializados de Argilla (como Synth-APIGen-v0.1) para capacidades de reescritura, resumización y function calling (esta última, según la model card, principalmente en la variante de 1.7B). El código de preentrenamiento, post-entrenamiento y evaluación está disponible en el repositorio smollm de Hugging Face, junto con las recetas de fine-tuning en el alignment-handbook.

## Capacidades

- Generación de texto conversacional (chat) mediante plantillas de mensajes con roles system/user/assistant
- Seguimiento de instrucciones (IFEval 41,0 frente a 19,8 de SmolLM-360M-Instruct)
- Reescritura y resumización de texto
- Razonamiento de sentido común y conocimiento general (ARC 53,0; HellaSwag 54,5; TriviaQA 16,9 en el modelo base)
- Compatibilidad con Transformers.js para inferencia en navegador
- Uso desde terminal con el CLI de TRL (`trl chat`)
- Nota: el function calling está indicado en la model card solo para la variante de 1,7B de la familia

## Casos de uso

- Asistentes conversacionales en dispositivos locales: con ~362M de parámetros, el modelo puede ejecutarse en portátiles y móviles sin GPU, adecuado para apps que necesiten un chatbot offline con latencia baja
- Prototipado rápido de agentes ligeros: su tamaño permite iterar prompts y pipelines de orquestación en CPU antes de escalar a modelos mayores
- Resumización de textos cortos: entrenado con datasets de resumización (smoltalk), puede condensar notas, correos o fragmentos de documentación en inglés
- Reescritura y edición de texto: corrección de estilo o tono en textos en inglés como funcionalidad integrada en editores
- Inferencia en el navegador: vía Transformers.js, permite demostraciones web sin backend, útil para productos con privacidad estricta (los datos no salen del cliente)
- Generación sintética de datos de entrenamiento: su bajo coste de inferencia lo hace viable para generar volúmenes grandes de texto conversacional en inglés como semilla o filtrado previo con modelos más grandes
- Integración en pipelines de NLP embebidos: clasificación, extracción ligera o reformateo de texto dentro de aplicaciones con restricciones de memoria

## Benchmarks y rendimiento

Modelo base (Entity-360M):

| Métrica | Entity-360M | Qwen2.5-0.5B | SmolLM-360M |
|:---|:---:|:---:|:---:|
| HellaSwag | **54,5** | 51,2 | 51,8 |
| ARC (media) | **53,0** | 45,4 | 50,1 |
| PIQA | **71,7** | 69,9 | 71,6 |
| MMLU (cloze) | **35,8** | 33,7 | 34,4 |
| CommonsenseQA | **38,0** | 31,6 | 35,3 |
| TriviaQA | **16,9** | 4,3 | 9,1 |
| Winogrande | 52,5 | **54,1** | 52,8 |
| OpenBookQA | **37,4** | **37,4** | 37,2 |
| GSM8K (5-shot) | 3,2 | **33,4** | 1,6 |

Modelo instruccional:

| Métrica | Entity-v1-360M-Instruct | Qwen2.5-0.5B-Instruct | SmolLM-360M-Instruct |
|:---|:---:|:---:|:---:|
| IFEval (media prompt/inst) | **41,0** | 31,6 | 19,8 |
| MT-Bench | 3,66 | **4,16** | 3,37 |
| HellaSwag | **52,1** | 48,0 | 47,9 |
| ARC (media) | **43,7** | 37,3 | 38,8 |
| PIQA | **70,8** | 67,2 | 69,4 |
| MMLU (cloze) | **32,8** | 31,7 | 30,6 |
| BBH (3-shot) | 27,3 | **30,7** | 24,4 |
| GSM8K (5-shot) | 7,43 | **26,8** | 1,36 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/bfloat16: aproximadamente 0,8–1 GB (361,8M de parámetros × 2 bytes); con cuantización GGUF de 4 bits, en torno a 250–400 MB
- Ejecutable sin problemas en CPU: no requiere GPU dedicada; cualquier portátil moderno es suficiente
- Compatible con GPUs de consumo de gama baja (por ejemplo, GTX 1650, RTX 3050) con amplio margen; también cabe íntegramente en la VRAM compartida de iGPU
- Opciones de despliegue: transformers (PyTorch), TRL CLI, Transformers.js (navegador/Node.js) y llama.cpp/Ollama gracias a la disponibilidad de GGUF; la model card no menciona explícitamente vLLM o TGI, aunque su compatibilidad con el formato LLaMA lo hace plausible
- Latencia: no se publican cifras oficiales; dado el tamaño, se esperan velocidades del orden de decenas de tokens por segundo incluso en CPU moderna

## Comparativa con modelos similares

| Característica | Entity v1 360M Instruct | Qwen2.5-0.5B-Instruct | SmolLM2-360M-Instruct |
|:---|:---|:---|:---|
| Parámetros | 361,8M | 494M | 360M |
| Arquitectura | Transformer decoder (LLaMA) | Transformer decoder (Qwen2) | Transformer decoder (LLaMA) |
| Contexto | no disponible | 32K (128K con YaRN) | 8192 tokens |
| IFEval | 41,0 | 31,6 | 19,8 |
| MT-Bench | 3,66 | 4,16 | 3,37 |
| GSM8K (5-shot) | 7,43 | 26,8 | 1,36 |
| Idiomas | inglés | multilingüe (29+) | inglés |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |

En resumen: Entity v1 360M Instruct supera a SmolLM2-360M-Instruct en seguimiento de instrucciones y benchmarks de conocimiento, y a Qwen2.5-0.5B-Instruct en IFEval, pero queda claramente por detrás de Qwen2.5 en matemáticas (GSM8K) y en soporte multilingüe.

## Limitaciones y advertencias

- Idioma: el modelo entiende y genera contenido principalmente en inglés; no es adecuado para producción en castellano u otros idiomas
- Alucinaciones: la propia model card advierte de que el contenido generado puede no ser factualmente preciso ni lógicamente consistente; debe usarse como herramienta asistiva, nunca como fuente definitiva
- Sesgos: puede reproducir sesgos presentes en los datos de entrenamiento (FineWeb-Edu, DCLM, The Stack, UltraFeedback)
- Matemáticas y razonamiento cuantitativo muy limitados: GSM8K de 7,43 en la versión instruct indica un rendimiento débil en problemas aritméticos
- Contexto: la longitud de ventana no está documentada en la model card; verificar antes de usarlo con documentos largos
- Function calling: la model card lo atribuye a la variante 1,7B de la familia; no asumir soporte fiable en esta versión de 360M
- Es un modelo de nicho con muy poca tracción comunitaria (7 descargas y 1 like en el momento de la ficha) y sin documentación propia del fork; conviene tratarlo como una derivación no verificada de SmolLM2-360M-Instruct y auditar los pesos antes de uso en producción
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque deben respetarse los términos de atribución

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shashwatIDR/entity-v1-360m-instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Artículo (SmolLM2): https://arxiv.org/abs/2502.02737
- Repositorio smollm (código de entrenamiento e inferencia): https://github.com/huggingface/smollm
- Alignment handbook (recetas de fine-tuning): https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Dataset SFT smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset DPO UltraFeedback: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset Synth-APIGen-v0.1 (Argilla): https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
