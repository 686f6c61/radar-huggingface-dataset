# OsaurusAI/gemma-4-12B-it-MXFP8

## Resumen

Gemma 4 12B-it MXFP8 es una cuantización del modelo multimodal `google/gemma-4-12B-it` de Google, publicada por OsaurusAI para su ejecución en Apple Silicon mediante la librería MLX. El paquete emplea cuantización MXFP8 (OCP Microexponent FP8) con group size 32 sobre los pesos principales, manteniendo en fp16 tanto el embedding de tokens atado como los embedders multimodales, y se distribuye en 13 shards de safetensors con un tamaño de paquete de 13,39 GB.

El modelo base es un transformer denso de 12B parámetros (11.959.730.224 según los safetensors) con capacidad para texto e imagen, etiquetado como `image-text-to-text` y con metadatos que indican soporte de audio y vídeo. Esta versión cuantizada está pensada para integrarse en Osaurus y en runtimes vMLX compatibles, ofreciendo un formato de pesos optimizado para el ecosistema de Apple Silicon en lugar de los formatos GGUF o safetensors estándar de CUDA.

La relevancia de esta ficha radica en que es una de las pocas distribuciones de Gemma 4 12B en formato MLX MXFP8, lo que permite ejecutar un modelo multimodal de 12B en hardware de consumo de Apple con un footprint de almacenamiento de 13,39 GB. No obstante, la información publicada por el autor es limitada: no se detallan datos de entrenamiento, benchmarks ni composición del dataset del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 unified dense 12B (transformer denso multimodal) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP8 (OCP Microexponent FP8), group size 32; embedding de tokens y embedders multimodales en fp16 |
| Idiomas soportados | en |
| Licencia | gemma (Gemma 4 License) |
| Formato de pesos | MLX safetensors (13 shards) |
| Tamano del paquete | 13,39 GB |
| Libreria | mlx |
| Pipeline | image-text-to-text |
| Modelo base | google/gemma-4-12B-it |
| Fecha de creacion | 2026-06-03 |
| Ultima actualizacion | 2026-11-16 |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-12B-it` es un transformer denso de la familia Gemma 4, descrito en la model card como "Gemma 4 unified dense 12B" con metadatos que indican capacidad para texto, imagen, audio y vídeo. Al tratarse de una cuantización, esta ficha no aporta información sobre el entrenamiento original: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones más allá del sufijo `-it` del modelo base.

La innovación técnica de esta distribución concreta es el esquema de cuantización MXFP8 con group size 32, que empaqueta las proyecciones de atención y las proyecciones lineales principales en uint32 mientras preserva en fp16 el embedding de tokens atado (`embed_tokens.weight`) y los embedders multimodales. El autor documenta explícitamente que una versión previa empaquetaba y escalaba `embed_tokens.weight` como si fuera un peso lineal normal, lo que producía un artefacto defectuoso; el rebuild del 2026-06-03 corrige ese problema y elimina las claves `embed_tokens.scales` y `embed_tokens.biases`. El bundle incluye `generation_config.json`, `chat_template.jinja`, `tokenizer_config.json` y `processor_config.json`, y emplea la plantilla de chat tool-aware de Gemma 4 sin cola de canal de pensamiento por defecto.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat tool-aware incluida en el bundle.
- Procesamiento de imagen a texto (pipeline `image-text-to-text`), con embedders multimodales preservados en fp16.
- Metadatos del modelo base que indican capacidad potencial para audio y vídeo, aunque no se detalla el alcance exacto en la información disponible.
- Soporte de tool calling / function calling a través de la plantilla de chat de Gemma 4.
- Capacidades multimodales integradas en un único modelo denso (arquitectura "unified").
- No se documentan explícitamente capacidades de agente multi-paso, modo thinking ni razonamiento extendido en la información proporcionada.

## Casos de uso

- Chat multimodal local en Apple Silicon: el paquete está diseñado para cargarse en Osaurus o en runtimes vMLX, permitiendo conversaciones texto-imagen en un Mac con un footprint de 13,39 GB de almacenamiento.
- Asistencia sobre capturas y documentos escaneados: al ser un modelo `image-text-to-text`, puede recibir imágenes y generar descripciones o respuestas textuales en flujos de accesibilidad o extracción de información.
- Prototipado de aplicaciones con tool calling: la plantilla de chat tool-aware permite integrar el modelo en agentes que invocan funciones externas, siempre que el runtime MLX soporte el formato de herramientas de Gemma 4.
- Desarrollo y pruebas offline en portátiles Apple: la cuantización MXFP8 reduce el peso del modelo frente a fp16, facilitando su ejecución en equipos con memoria unificada limitada.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de calidad de MXFP8 frente al modelo base en tareas de visión y lenguaje.
- Integración en pipelines de investigación multimodal: al distribuirse en safetensors MLX con configuración de generación y procesador incluidas, es adecuado para experimentos reproducibles en entornos Apple.
- Despliegue en aplicaciones de escritorio para macOS: Osaurus actúa como front-end de chat local, y este bundle es el artefacto recomendado para ese runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el paquete ocupa 13,39 GB en disco; en ejecución se requiere memoria unificada suficiente para los pesos MXFP8 más el contexto y las activaciones, aunque el autor no publica cifras exactas de memoria en inferencia.
- Hardware objetivo: Apple Silicon (tags `apple-silicon`, `mlx`); no está pensado para GPUs NVIDIA o AMD.
- GPU recomendadas: no disponible para CUDA; en Apple Silicon se requiere un chip con memoria unificada holgada para alojar 13,39 GB de pesos más overhead.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada suficiente; no se especifican modelos concretos de Mac.
- Opciones de despliegue: Osaurus (runtime recomendado), `mlx_lm` (carga vía `from mlx_lm import load, generate`) y runtimes vMLX compatibles. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/gemma-4-12B-it-MXFP8 | 11,96B | no disponible | MLX safetensors MXFP8 | gemma | Hugging Face, 330 descargas |
| google/gemma-4-12B-it (base) | 12B | no disponible | safetensors (presumiblemente fp16/bf16) | gemma | Hugging Face |
| Otras cuantizaciones de Gemma 4 12B (GGUF, AWQ, etc.) | 12B | no disponible | GGUF / otros | gemma | no disponible en la información proporcionada |

La comparativa se limita al modelo base y a otras cuantizaciones genéricas, ya que la información proporcionada no incluye datos de rendimiento ni de contexto que permitan una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Solo se declara soporte del idioma inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Al ser una cuantización MXFP8, puede presentar degradación de calidad frente al modelo base fp16, especialmente en tareas sensibles a la precisión numérica; el autor no publica evaluaciones de degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Licencia Gemma 4: el uso comercial está sujeto a los términos de la Gemma 4 License (https://ai.google.dev/gemma/docs/gemma_4_license), que incluyen restricciones y obligaciones de atribución; es necesario revisarla antes de un despliegue en producción.
- El paquete está atado al ecosistema MLX y Apple Silicon; no es portable a CUDA sin conversión previa.
- Aviso del autor: las versiones descargadas antes del 2026-06-03 16:06 PDT contienen un artefacto defectuoso en `embed_tokens.weight` y deben descartarse y volver a descargarse.
- No se documentan sesgos conocidos, longitud de contexto ni límites de tokens de entrada/salida.
- El modelo base se distribuye con metadatos de audio y vídeo, pero esta cuantización no detalla si dichas capacidades se preservan íntegramente tras el proceso MXFP8.

## Enlaces

- Hugging Face: https://huggingface.co/OsaurusAI/gemma-4-12B-it-MXFP8
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Web de Osaurus: https://osaurus.ai
- Perfil de OsaurusAI en Hugging Face: https://huggingface.co/OsaurusAI
- Repositorio JANG (fuente de la herramienta de cuantización): https://github.com/jjang-ai/jangq
