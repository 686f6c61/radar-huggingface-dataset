# OsaurusAI/gemma-4-12B-it-JANG_4M

## Resumen

OsaurusAI/gemma-4-12B-it-JANG_4M es una cuantizacion mixta del modelo multimodal google/gemma-4-12B-it, publicada por OsaurusAI para su uso en Apple Silicon mediante la libreria MLX. El modelo base es un transformer denso de 12B parametros de la familia Gemma 4, con capacidades de texto e imagen (pipeline image-text-to-text), y esta empaquetado con el perfil de cuantizacion JANG_4M, que aplica 8 bits a las proyecciones de atencion y 4 bits a las capas MLP con group size 32.

El problema que resuelve es practico: reducir el peso del modelo desde los pesos originales en bf16/fp16 hasta un bundle de 10,17 GB (10 shards safetensors) que quepa y funcione con rendimiento razonable en equipos Apple Silicon con memoria unificada, manteniendo en fp16 tanto el embedding de tokens (tied) como los embedders multimodales para preservar calidad. El repo ocupa 20,3 GB en total.

Es relevante ahora porque permite ejecutar un modelo multimodal de 12B en hardware de consumo Apple (MacBook Pro, Mac Studio) sin GPU dedicada, usando el ecosistema MLX y la aplicacion Osaurus. La licencia es Gemma, con restricciones de uso comercial que deben revisarse antes de desplegar en produccion. El modelo esta pensado principalmente para ingles y no se han publicado resultados de benchmarks propios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 unified dense 12B (transformer denso, multimodal texto + imagen/audio/video segun metadatos del base) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | JANG mixed precision: atencion 8-bit, MLP 4-bit, group size 32; embedding tied y embedders multimodales en fp16 passthrough |
| Idiomas soportados | en |
| Licencia | gemma (Gemma 4 License) |
| Formato de pesos | MLX safetensors (10 shards, packed uint32 para proyecciones cuantizadas) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 12B instruct, un transformer denso de aproximadamente 12.000 millones de parametros con arquitectura "unified" que integra texto y modalidades adicionales (imagen, y segun los metadatos del base, audio y video). Esta ficha corresponde a una cuantizacion, no a un entrenamiento nuevo: OsaurusAI parte de google/gemma-4-12B-it y aplica un esquema de precision mixta JANG con atencion a 8 bits, MLP a 4 bits y group size 32, dejando el embedding de tokens tied y los embedders multimodales en fp16.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, composicion del dataset ni si el modelo base uso RLHF o DPO. La innovacion tecnica destacable de este artefacto es la correccion del empaquetado: una version anterior trataba `embed_tokens.weight` como un peso lineal cuantizable, lo que degradaba el artefacto; la rebuild del 2026-06-03 preserva ese tensor en fp16 y elimina `embed_tokens.scales`/`biases`. El bundle incluye `generation_config.json`, `chat_template.jinja`, `tokenizer_config.json` y `processor_config.json`, y usa la plantilla de chat tool-aware de Gemma 4 sin cola de canal de pensamiento por defecto.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat instruct.
- Procesamiento de imagen a texto (pipeline image-text-to-text), con embedders multimodales preservados en fp16.
- Soporte de tool calling / function calling mediante la plantilla de chat tool-aware de Gemma 4.
- Razonamiento multi-turno y multi-step dentro de los limites de contexto del modelo base (longitud de contexto no disponible en esta ficha).
- Capacidades multimodales adicionales (audio/video) segun los metadatos del modelo base, aunque no verificadas en esta cuantizacion.
- Ejecucion local en Apple Silicon via MLX y Osaurus/vMLX.

## Casos de uso

- Chat local multimodal en Mac: usar Osaurus para conversaciones con imagenes adjuntas en un MacBook Pro o Mac Studio, aprovechando el bundle MLX de 10,17 GB que evita dependencia de GPUs dedicadas.
- Asistente de escritorio con tool calling: integrar el modelo en un flujo de agente local que invoque funciones del sistema (ficheros, calendario, busqueda) mediante la plantilla tool-aware de Gemma 4.
- Prototipado rapido de aplicaciones image-text-to-text: cargar el bundle con `mlx_lm.load` y generar descripciones o respuestas sobre imagenes para validar producto antes de migrar a infraestructura GPU.
- Analisis de capturas y documentos escaneados: enviar imagenes al modelo para extraer descripciones o responder preguntas sobre su contenido en un entorno offline.
- Desarrollo y pruebas de pipelines MLX: servir como referencia para validar la integracion de cuantizaciones JANG en runtimes vMLX antes de desplegar variantes mayores.
- Investigacion sobre cuantizacion mixta: comparar calidad y latencia entre este perfil JANG_4M y otras cuantizaciones (4-bit uniforme, 8-bit) sobre el mismo base Gemma 4 12B.
- Educacion y demos privadas: ejecutar un modelo multimodal de 12B en hardware de consumo para talleres o demostraciones sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el bundle pesa 10,17 GB; se recomienda al menos 16 GB de memoria unificada en Apple Silicon para cargar el modelo con margen para KV cache y contexto.
- GPU recomendadas: Apple Silicon (series M1/M2/M3/M4, preferiblemente con 16 GB o mas de memoria unificada). No esta disenado para GPUs NVIDIA/AMD via CUDA/ROCm en este formato.
- Cabe en consumer hardware Apple: si, en Macs con 16 GB o mas; en equipos de 8 GB es probable que no quepa con contexto util.
- Opciones de despliegue: MLX (`mlx_lm`), Osaurus, runtimes vMLX compatibles. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OsaurusAI/gemma-4-12B-it-JANG_4M | ~12B | no disponible | MLX safetensors (JANG mixta) | gemma | Cuantizacion para Apple Silicon, 10,17 GB |
| google/gemma-4-12B-it | ~12B | no disponible | safetensors (bf16/fp16) | gemma | Modelo base sin cuantizar, mayor peso y memoria |
| Otras cuantizaciones de Gemma 4 12B (GGUF, MLX uniforme) | ~12B | no disponible | GGUF / MLX | gemma | No disponibles en la informacion proporcionada |

## Limitaciones y advertencias

- Idioma: el modelo esta orientado a ingles; el rendimiento en castellano no esta documentado y puede ser inferior.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion en esta cuantizacion; la cuantizacion mixta puede degradar ligeramente la calidad respecto al base en tareas sensibles.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la Gemma 4 License (https://ai.google.dev/gemma/docs/gemma_4_license); revisar restricciones antes de produccion.
- Plataforma: formato MLX exclusivo para Apple Silicon; no usable directamente en CUDA/ROCm.
- Artefacto corregido: si se descargo el repo antes del 2026-06-03 16:06 PDT, debe eliminarse la copia local y volver a descargar.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; validar antes de disenar flujos con ventanas largas.
- Modalidades: las capacidades de audio/video se infieren de metadatos del base y no estan verificadas en este bundle.
- Adopcion: 20 descargas y 0 likes en el momento de la consulta, lo que indica baja validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/gemma-4-12B-it-JANG_4M
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Web de Osaurus: https://osaurus.ai
- Organizacion OsaurusAI en Hugging Face: https://huggingface.co/OsaurusAI
- Codigo fuente JANG: https://github.com/jjang-ai/jangq
- Organizacion JANGQ-AI en Hugging Face: https://huggingface.co/JANGQ-AI
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
