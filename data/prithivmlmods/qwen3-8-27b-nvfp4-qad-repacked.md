# prithivMLmods/Qwen3.8-27B-NVFP4-QAD-REPACKED

## Resumen

Qwen3.8-27B-NVFP4-QAD-REPACKED es un derivado del modelo multimodal Qwen3.8-27B de Qwen, en su version cuantizada a NVFP4 mediante Quantization-Aware Distillation (QAD) por parte de NVIDIA (nvidia/Qwen3.8-27B-NVFP4-QAD). Este "repack" lo publica el usuario prithivMLmods y anade soporte de Multi-Token Prediction (MTP) para decodificacion especulativa, ademas de corregir problemas de compatibilidad e inferencia presentes en la version original de NVIDIA. El resultado es una distribucion lista para inferencia que conserva la cuantizacion NVFP4 original y las capacidades multimodales de texto, imagen y video.

El modelo resuelve el problema de desplegar un modelo de aproximadamente 27.800 millones de parametros en entornos con memoria limitada, manteniendo una precision de pesos de 4 bits (NVFP4) y un tamano de repositorio de unos 20 GB. Esta pensado para pipelines de image-text-to-text, generacion de texto y decodificacion especulativa acelerada por MTP. La relevancia actual radica en que combina cuantizacion agresiva, soporte multimodal y aceleracion por prediccion multi-token en un unico artefacto compatible con transformers y text-generation-inference.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face; los datos no disponibles se indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.8, tag `qwen3_5`), con soporte MTP para decodificacion especulativa |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, via NVIDIA Model Optimizer v0.48.0 con QAD); tag `8-bit` en metadatos de Hugging Face; existe variante GGUF publicada aparte |
| Idiomas soportados | ingles (`en`) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (4 shards, aproximadamente 20 GB en total) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal de la familia Qwen3.8 (tag `qwen3_5`) que acepta entradas de texto, imagen y video (pipeline `image-text-to-text`, con `preprocessor_config.json` y `video_preprocessor_config.json`). Sobre esa base, NVIDIA aplico cuantizacion NVFP4 con Quantization-Aware Distillation mediante NVIDIA Model Optimizer v0.48.0, un proceso que ajusta los pesos a 4 bits mientras destila el comportamiento del modelo original de mayor precision. El repack de prithivMLmods conserva esa cuantizacion y anade soporte de Multi-Token Prediction (MTP) para decodificacion especulativa, ademas de corregir incidencias de compatibilidad e inferencia.

Los detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset o el uso de RLHF/DPO no se especifican en la informacion disponible. El unico dataset referenciado en los metadatos es nvidia/Nemotron-Cascade-2-SFT-Data, que corresponde al proceso de ajuste supervisado asociado a la cuantizacion/distilacion. La innovacion tecnica destacable es la combinacion de cuantizacion NVFP4 (4 bits) con QAD y decodificacion especulativa via MTP, orientada a reducir el coste de memoria y acelerar la generacion.

## Capacidades

- Generacion de texto conversacional (tag `conversational`, con `chat_template.jinja`).
- Comprension de imagenes (pipeline image-text-to-text y `preprocessor_config.json`).
- Comprension de video (`video_preprocessor_config.json`).
- Decodificacion especulativa mediante Multi-Token Prediction (MTP).
- Compatibilidad con text-generation-inference y transformers.
- Capacidades multilingues: solo ingles declarado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion automatica de imagenes y video: el modelo acepta entradas visuales (imagen y video) y genera texto, por lo que puede usarse para etiquetado, alt-text o resumenes de contenido audiovisual en pipelines de gestion de medios.
- Asistentes conversacionales en ingles: gracias a su plantilla de chat y su naturaleza conversacional, puede desplegarse como backend de un asistente multi-turno en entornos donde el ingles es el idioma principal.
- Inferencia acelerada por decodificacion especulativa: el soporte MTP permite integrar el modelo en servidores de generacion (text-generation-inference) donde la latencia por token es critica, como chatbots en tiempo real.
- Procesamiento de documentos escaneados con contexto visual: al combinar vision y texto, puede extraer y describir informacion de capturas, formularios o imagenes en flujos de digitalizacion.
- Despliegue en hardware con memoria limitada: la cuantizacion NVFP4 y el tamano de aproximadamente 20 GB permiten ejecutar un modelo de 27,8 mil millones de parametros en GPUs de gama alta pero no necesariamente de datacenter, reduciendo costes de infraestructura.
- Prototipado e investigacion multimodal: al estar disponible en safetensors y ser compatible con transformers, sirve para experimentar con cuantizacion NVFP4, QAD y MTP en entornos academicos o de I+D.
- Analisis de video para moderacion o catalogacion: la entrada de video permite clasificar o resumir clips en pipelines de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa aproximadamente 20 GB en safetensors NVFP4; se necesita al menos esa cantidad de VRAM mas overhead de activaciones y cache KV (el total real depende del contexto, que no se especifica).
- GPU recomendadas: no se detallan en la informacion; por el formato NVFP4 (4 bits) se orienta a GPUs NVIDIA compatibles con esta cuantizacion (arquitecturas recientes de datacenter y consumer de gama alta), aunque no se confirman modelos concretos.
- Cabe en consumer GPU: no confirmado en la informacion; el tamano de pesos (unos 20 GB) sugiere que podria ajustarse en GPUs consumer con 24 GB o mas, pero no hay confirmacion oficial.
- Opciones de despliegue: transformers, text-generation-inference (tags `text-generation-inference`) y variante GGUF publicada en prithivMLmods/Qwen3.8-27B-NVFP4-QAD-GGUF (compatible con llama.cpp/Ollama, aunque no se detalla).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-QAD-REPACKED (este) | 27,8 B | no disponible | NVFP4 (QAD) + MTP | nvidia-open-model-license | Hugging Face |
| nvidia/Qwen3.8-27B-NVFP4-QAD | 27,8 B (base) | no disponible | NVFP4 (QAD) | nvidia-open-model-license | Hugging Face |
| Qwen/Qwen3.8-27B | 27,8 B (base) | no disponible | pesos originales | no disponible en esta ficha | Hugging Face |
| prithivMLmods/Qwen3.8-27B-NVFP4-QAD-GGUF | 27,8 B | no disponible | GGUF | no disponible en esta ficha | Hugging Face |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion: no se documenta en la informacion; como modelo generativo, es esperable, pero no hay evaluaciones publicadas.
- Sesgos conocidos: no disponible.
- Licencia: nvidia-open-model-license; es necesario revisar los terminos exactos para uso comercial antes de desplegar en produccion.
- Cuantizacion NVFP4: al ser una cuantizacion de 4 bits, puede haber degradacion de precision frente al modelo original de mayor precision; no se publican metricas de esa perdida.
- Compatibilidad: el modelo es un repack que corrige problemas de la version de NVIDIA; conviene verificar la version de transformers y de las librerias de inferencia antes de usarlo.
- Contexto: la longitud de contexto no se especifica, lo que limita la planificacion de casos de uso con ventanas largas.
- Soporte de tool calling y agentes: no confirmado en la informacion.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-NVFP4-QAD-REPACKED
- Variante GGUF: https://huggingface.co/prithivMLmods/Qwen3.8-27B-NVFP4-QAD-GGUF
- Modelo base cuantizado (NVIDIA): https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD/blob/main/LICENSE
- Dataset referenciado: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
