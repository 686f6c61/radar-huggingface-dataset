# prithivMLmods/VIGOR-mini-GGUF

## Resumen

VIGOR-mini-GGUF es la distribucion en formato GGUF de VIGOR-mini (Vision Intelligence and Guardrail Oriented Reasoning), un modelo multimodal denso de 4.326 millones de parametros desarrollado por prithivMLmods y construido sobre Qwen/Qwen3.5-4B. Su proposito no es la generacion de texto generalista, sino la clasificacion de seguridad de contenido visual: analiza imagenes y emite un veredicto estructurado en JSON sobre si el contenido es apto (safe) o no apto (NSFW), con especial atencion a ropa, exposicion corporal, poses y contexto.

El modelo esta pensado como guardrail o filtro de moderacion para pipelines de vision, control parental y proteccion de menores. La variante GGUF anade soporte de decodificacion especulativa mediante Multi-Token Prediction (MTP) integrada en los propios pesos, lo que evita depender de un modelo borrador separado y acelera la inferencia local. El repo incluye ademas el fichero de proyeccion multimodal `mmproj` necesario para procesar imagenes en llama.cpp.

La relevancia actual del modelo radica en su tamano contenido (4B) y su licencia Apache 2.0, que permiten desplegar un clasificador visual de seguridad en hardware de consumo o en nodos de borde. No obstante, se trata de un modelo experimental, con cero descargas registradas en el momento de redactar esta ficha, y el propio autor recomienda la version Transformers frente al GGUF para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (base Qwen3.5-4B) con proyeccion visual (`mmproj`) y cabeceras MTP para decodificacion especulativa |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K; proyeccion multimodal en `mmproj-bf16` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero `mmproj` separado); el modelo base esta en safetensors |

| Parametro | Valor |
|---|---|
| Tamano del repo | 29,4 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Modelo base | prithivMLmods/VIGOR-mini (a su vez sobre Qwen/Qwen3.5-4B) |
| Fecha de creacion | 2026-11-01 |
| Ultima actualizacion | 2026-11-02 |

## Arquitectura y entrenamiento

VIGOR-mini es un transformer multimodal denso derivado de Qwen3.5-4B. El componente de vision se conecta al modelo de lenguaje mediante un proyector multimodal que en el repo GGUF se distribuye como fichero independiente (`VIGOR-mini.mmproj-bf16.gguf`, 676 MB). La innovacion tecnica destacada de esta variante es la integracion de Multi-Token Prediction (MTP): los pesos incluyen cabeceras adicionales que predicen varios tokens futuros en una sola pasada, lo que habilita decodificacion especulativa sin un modelo borrador externo y acelera la inferencia local.

El modelo esta afinado especificamente para clasificacion de seguridad visual, con una politica conservadora de tolerancia cero: cualquier desnudez, ropa reveladora, ropa interior visible, trajes de bano sugestivos, arte anime con contenido sexual o poses sexualizadas se marca como NSFW, y ante la duda se clasifica como NSFW. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

## Capacidades

- Analisis visual detallado de escenas: describe sujeto, ropa, grado de exposicion y pose.
- Clasificacion binaria Safe / NSFW con salida JSON estricta y campos complementarios (`is_nsfw`, `nsfw`, `safe`).
- Deteccion de contenido sensible en imagenes reales y en ilustraciones 2D/3D, anime, manga y arte digital.
- Razonamiento justificado: genera `classification_reason` explicando el criterio aplicado.
- Modo thinking opcional: la plantilla por defecto desactiva el razonamiento y permite activarlo.
- Decodificacion especulativa MTP integrada en los pesos para acelerar la generacion en llama.cpp.
- Capacidad conversacional y de image-text-to-text heredada del modelo base Qwen3.5-4B.
- Soporte de salida estructurada en JSON, adecuado para integrarse en pipelines automatizados.

## Casos de uso

- Moderacion de contenido generado por usuarios: el modelo se coloca como paso previo a la publicacion de imagenes en foros, redes o marketplaces y devuelve un JSON con el veredicto y la justificacion, que el backend puede registrar para auditoria.
- Control parental y proteccion de menores: integrado en un proxy o filtro de navegacion, clasifica cada imagen antes de mostrarla y bloquea las marcadas como NSFW segun la politica de tolerancia cero del prompt estandar.
- Moderacion de comunidades de arte e ilustracion: distingue entre arte seguro y contenido ecchi, hentai o sugestivo, un caso especialmente dificil para clasificadores entrenados solo con fotografia real.
- Filtrado previo en datasets de entrenamiento: se ejecuta sobre corpus de imagenes para etiquetar y descartar muestras no aptas antes de alimentar otros modelos, aprovechando la salida JSON para el filtrado programatico.
- Cumplimiento normativo en plataformas: genera un registro estructurado de cada decision de moderacion, con descripcion de escena y motivo, que sirve como evidencia en procesos de auditoria de contenido.
- Despliegue en el borde o en equipos de consumo: las cuantizaciones Q4_K_M (2,78 GB) y Q5_K_M (3,16 GB) permiten ejecutar el clasificador en local con llama.cpp, sin enviar imagenes a servicios externos, lo que reduce riesgos de privacidad.
- Prefiltro en pipelines de vision a gran escala: al ser un modelo de 4B con MTP, puede procesar lotes de imagenes con baja latencia relativa y derivar solo los casos dudosos a un revisor humano o a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo, sin contar el proyector ni el contexto):
  - BF16: aproximadamente 8,7 GB.
  - Q6_K: aproximadamente 3,6 GB.
  - Q5_K_M / Q5_K_S: aproximadamente 3,1-3,2 GB.
  - Q4_K_M / Q4_K_S: aproximadamente 2,6-2,8 GB.
  - Q3_K_L / Q3_K_M: aproximadamente 2,3-2,5 GB.
- Sumar aproximadamente 676 MB para el fichero `mmproj-bf16.gguf` en todos los casos.
- GPU recomendadas: el autor menciona NVIDIA Blackwell y RTX PRO 6000 en las etiquetas del repo; por tamano, una RTX 4090 (24 GB) o una RTX 3090 permiten ejecutar BF16 con holgura, y tarjetas de 8-12 GB son suficientes para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: si, desde GPUs de 8 GB con cuantizaciones Q4, y en equipos con CPU y RAM suficiente usando llama.cpp.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF y `mmproj`), Ollama, y el stack Transformers con el modelo base `prithivMLmods/VIGOR-mini`. El autor recomienda explicitamente la configuracion basada en Transformers frente al GGUF.
- Latencia y throughput: no disponibles. El uso de MTP con decodificacion especulativa deberia reducir la latencia frente a un GGUF convencional del mismo tamano, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| VIGOR-mini-GGUF | 4,33B (denso) | No disponible | Clasificacion visual Safe/NSFW con salida JSON | Apache 2.0 | GGUF + mmproj |
| prithivMLmods/VIGOR-mini | 4,33B (denso) | No disponible | Igual, en safetensors para Transformers | Apache 2.0 | Safetensors |
| Qwen/Qwen3.5-4B | 4B (denso) | No disponible | Modelo base multimodal generalista | No disponible | Safetensors |
| Clasificadores de imagen especializados (p. ej. detectors NSFW dedicados) | Variable, habitualmente menor | No aplica | Clasificacion binaria de imagen | Variable | Variable |

La comparativa cuantitativa con alternativas de la misma categoria no esta disponible: no se han publicado benchmarks del modelo ni de sus competidores directos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo etiqueta como tal y recomienda usar la version Transformers en lugar del GGUF para entornos serios.
- Cero descargas y un solo like en el momento de la ficha: no hay evidencia de uso en produccion ni validacion independiente.
- No se han publicado benchmarks, por lo que no hay medida objetiva de precision, recall ni tasa de falsos positivos en la clasificacion NSFW.
- Politica de tolerancia cero y criterio "ante la duda, NSFW": previsiblemente elevara los falsos positivos en imagenes legitimas como playa, deporte, lactancia o arte clasico.
- Solo soporta ingles; el prompt y las salidas estan pensados en ese idioma.
- Riesgo de alucinacion en la descripcion de escena: el campo `scene_description` puede contener detalles no presentes en la imagen.
- La salida JSON puede no ser valida si el modelo se desvia del formato; conviene validar y parsear con tolerancia a errores en el backend.
- Modelo derivado de Qwen3.5-4B: hereda los sesgos del modelo base y de los datos de ajuste, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que cualquier salida es responsabilidad del usuario y exime de responsabilidad a autores y plataforma.
- No es un sistema de moderacion completo: debe combinarse con otras senales (texto, metadatos, revision humana) y no sustituye una politica de contenido formal.
- La longitud de contexto no esta documentada, lo que dificulta planificar conversaciones multi-turno o imagenes de alta resolucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/VIGOR-mini-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-mini
- Modelo Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero BF16: https://huggingface.co/prithivMLmods/VIGOR-mini-GGUF/blob/main/VIGOR-mini.BF16.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/VIGOR-mini-GGUF/blob/main/VIGOR-mini.Q4_K_M.gguf
- Fichero Q5_K_M: https://huggingface.co/prithivMLmods/VIGOR-mini-GGUF/blob/main/VIGOR-mini.Q5_K_M.gguf
- Fichero Q6_K: https://huggingface.co/prithivMLmods/VIGOR-mini-GGUF/blob/main/VIGOR-mini.Q6_K.gguf
- Proyeccion multimodal: https://huggingface.co/prithivMLmods/VIGOR-mini-GGUF/blob/main/VIGOR-mini.mmproj-bf16.gguf
