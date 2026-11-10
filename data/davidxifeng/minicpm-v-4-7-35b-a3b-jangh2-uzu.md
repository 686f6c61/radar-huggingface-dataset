# davidxifeng/MiniCPM-V-4.7-35B-A3B-JANGH2-uzu

## Resumen

MiniCPM-V-4.7-35B-A3B-JANGH2-uzu es una conversion cuantizada del modelo multimodal MiniCPM-V-4.7 de OpenBMB, adaptada por el usuario davidxifeng para el motor de inferencia Uzu/Mirai sobre Apple Silicon. No se trata de un modelo nuevo entrenado desde cero, sino de una distribucion derivada que empaqueta los pesos del modelo base en un formato optimizado para Metal y para el ecosistema MLX, con el objetivo de ejecutar inferencia multimodal nativa en hardware de Apple sin dependencias de Python ni PyTorch.

El modelo base MiniCPM-V-4.7 es un modelo de lenguaje con vision de tipo MoE (mezcla de expertos), segun se deduce de la nomenclatura "35B-A3B" (35 mil millones de parametros totales y aproximadamente 3 mil millones activos por token), aunque la informacion proporcionada no confirma estos valores de forma explicita. La conversion aplica una cuantizacion mixta Jangtq2 (codebooks de 2 y 3 bits) a los expertos MoE y cuantizacion afina de 8 bits MLX a las capas compartidas y embeddings, reduciendo el bundle total a aproximadamente 13 GB.

La relevancia de esta ficha radica en que demuestra un flujo de despliegue multimodal de un modelo grande en hardware de consumo Apple, con un servidor compatible con la API de OpenAI para chat multimodal con imagenes. Es una pieza util para desarrolladores que quieran prototipar aplicaciones image-text-to-text en local sin infraestructura GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con vision tower SigLIP y capas MoE (segun model card); configuracion Uzu/Mirai |
| Parametros totales | 5.160.312.048 (dato real de safetensors); la nomenclatura "35B-A3B" del nombre no coincide con el recuento de safetensors |
| Parametros activos | no disponible (el nombre sugiere ~3B activos, sin confirmar en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Jangtq2 mixta (2-bit/3-bit para expertos MoE) + MLX 8-bit affine para embeddings y capas compartidas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (3 shards) + config.json, vision_config.json, tokenizer.json, model.safetensors.index.json |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual SigLIP implementado integramente en shaders Metal (con atencion de ventana fusionada y aceleracion MPS GEMM) con un modelo de lenguaje de tipo MoE. La model card menciona embeddings posicionales mROPE 3D, prefill nativo sobre memoria unificada y decodificacion autoregresiva rapida. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovacion tecnica principal de esta distribucion es la cuantizacion mixta Jangtq2, que aplica codebooks de 2 y 3 bits a los expertos MoE mientras mantiene 8 bits afines MLX en las capas compartidas, logrando un bundle de ~13 GB. Ademas, la implementacion del vision tower en Metal puro elimina la dependencia de Python/PyTorch, lo que simplifica el despliegue en macOS. No se dispone de informacion sobre el proceso de entrenamiento original del modelo base.

## Capacidades

- Generacion de texto y comprension de imagenes (pipeline image-text-to-text).
- Razonamiento multimodal a partir de entradas de imagen y texto combinadas.
- Servidor compatible con la API de OpenAI `/v1/chat/completions` con soporte de URLs de imagen, rutas `file://` y data URLs base64.
- Streaming de respuestas via SSE.
- Parametros de muestreo: `temperature`, `top_p`, `top_k`, `repetition_penalty`, `seed`.
- Inferencia nativa en Apple Silicon con memoria unificada y decodificacion autoregresiva.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado local de asistentes visuales en macOS: el modelo se ejecuta con `mirai server` y expone un endpoint compatible con OpenAI, lo que permite integrarlo en aplicaciones de escritorio que describan o analicen imagenes sin salir del equipo.
- Descripcion automatica de imagenes en flujos de accesibilidad: se puede enviar una imagen via `file://` o base64 y obtener una descripcion textual en streaming, util para generar alt-text en catalogos o documentos.
- Analisis de capturas de pantalla y documentos escaneados: la combinacion de vision tower SigLIP y LLM permite extraer informacion de imagenes en tareas de soporte o revision de documentos, con la ventaja de no requerir GPU dedicada.
- Chat multimodal en aplicaciones de investigacion: investigadores que necesiten comparar respuestas de modelos multimodales en local pueden usar el servidor compatible con OpenAI para automatizar evaluaciones con scripts existentes.
- Desarrollo de agentes visuales en Apple Silicon: al ejecutarse sobre memoria unificada y con un servidor HTTP estandar, se puede integrar con frameworks de agentes que consuman la API de OpenAI, aunque el soporte de tool calling no esta confirmado.
- Demos y pruebas de concepto sin conexion: el bundle de ~13 GB cabe en un Mac con suficiente RAM unificada, lo que permite demostraciones offline en entornos sin acceso a la nube.
- Evaluacion de cuantizacion extrema: util para estudiar el impacto de la cuantizacion Jangtq2 2/3-bit en tareas multimodales comparandolo con el modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el bundle pesa ~13 GB, por lo que se recomienda al menos 16 GB de memoria unificada y preferiblemente 24-32 GB para margen de prefill y contexto.
- Hardware objetivo: Apple Silicon (M-series) con soporte Metal; no se indica compatibilidad con GPU NVIDIA o AMD.
- GPU recomendadas: no disponible de forma especifica; el motor Uzu/Mirai esta disenado para Apple Silicon.
- Cabe en consumer GPU: si, en equipos Apple Silicon con memoria unificada suficiente; no se documenta soporte para GPUs de consumo tipo RTX.
- Opciones de despliegue: motor Mirai/Uzu (`mirai server --model ... --port 8001`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-JANGH2-uzu | 5.160.312.048 (safetensors) | no disponible | apache-2.0 | safetensors cuantizado, Uzu/Mirai, Apple Silicon | Conversion comunitaria para Metal |
| openbmb/MiniCPM-V-4.7 (base) | no disponible | no disponible | no disponible en la informacion | pesos originales | Modelo base sin cuantizar |
| Otras alternativas multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- El recuento real de parametros en safetensors (5.160.312.048) no coincide con la nomenclatura "35B-A3B" del nombre del repositorio; conviene verificar la configuracion antes de asumir el tamano del modelo base.
- La cuantizacion Jangtq2 de 2/3 bits en los expertos MoE puede degradar la calidad respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa perdida.
- El modelo esta disenado exclusivamente para el motor Uzu/Mirai en Apple Silicon; no es portable a otros runtimes sin conversion adicional.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de idioma del modelo base.
- La licencia apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base openbmb/MiniCPM-V-4.7, cuya licencia no se detalla en la informacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion comunitaria.
- No se documentan capacidades de tool calling, agentes ni modo thinking; no asumir su disponibilidad en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/davidxifeng/MiniCPM-V-4.7-35B-A3B-JANGH2-uzu
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7
- Motor Uzu: https://github.com/openbmb/uzu
