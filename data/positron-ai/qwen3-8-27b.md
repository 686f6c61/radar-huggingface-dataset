# positron-ai/Qwen3.8-27B

## Resumen

`positron-ai/Qwen3.8-27B` es un espejo (mirror) byte a byte del modelo `Qwen/Qwen3.8-27B`, publicado por el usuario/organización Positron AI como fuente de descarga fijada (pinned) y anónima para sus pipelines de integración continua. No es un modelo nuevo ni un fine-tuning: según la propia model card, la única modificación respecto al repositorio original es el fichero `README.md`, mientras que el resto de ficheros —incluidos los 18 shards de pesos en safetensors— fue verificado por hash (LFS sha256 / git sha1) antes y después de la subida. El modelo canónico sigue siendo el repositorio upstream de Qwen.

El modelo subyacente es un transformer de la familia Qwen3.5 (tag de arquitectura `qwen3_5`) con 27.781.427.952 parámetros totales (27,78 B) y pesos en safetensors repartidos en 18 ficheros (~55,6 GB de repositorio, cifra compatible con un almacenamiento en bf16). El repositorio incluye plantilla de chat (`chat_template.jinja`), tokenizador BPE (`tokenizer.json`, `vocab.json`, `merges.txt`), configuración de generación y ficheros de preprocesado de imagen y de vídeo, lo que apunta a un modelo multimodal de entrada imagen/vídeo, aunque la información disponible no detalla la arquitectura interna ni el entrenamiento.

Su relevancia práctica es de ingeniería, no de investigación: permite descargas deterministas y reproducibles de un checkpoint de 27,8 B sin depender de gating, límites de tasa o cambios del repositorio upstream. Cualquier evaluación, benchmark o uso en producción debe referirse al modelo original de Qwen, no a este espejo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`); no se detalla en la información disponible si es denso, MoE o híbrido |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican versiones cuantizadas en el repositorio; pesos en safetensors (tamaño compatible con bf16, no confirmado explícitamente) |
| Idiomas soportados | No disponible (el espejo no lista idiomas; el tag de idiomas de HuggingFace aparece vacío) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, 18 shards + `model.safetensors.index.json` |
| ID en HuggingFace | `positron-ai/Qwen3.8-27B` |
| Modelo base | `Qwen/Qwen3.8-27B` @ revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Tipo de repositorio | Espejo CI; la única modificación es el `README.md` (el original se conserva como `README.upstream.md`) |
| Tokenizador | BPE (`tokenizer.json` 12,8 MB, `vocab.json` 6,7 MB, `merges.txt` 3,35 MB) |
| Ficheros de preprocesado | `preprocessor_config.json` (390 B) y `video_preprocessor_config.json` (385 B), compatibles con entrada de imagen y vídeo |
| Tamaño del repositorio | 55,6 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-28 |
| Región | `region:us` |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles de arquitectura interna (número de capas, dimensiones, cabezas de atención, uso de atención lineal, decodificación especulativa u otras innovaciones), ni datos de entrenamiento (número de tokens, composición del corpus, fases de RLHF/DPO). El único dato estructural fiable es el tag `qwen3_5` y el recuento exacto de parámetros en safetensors. La presencia de `preprocessor_config.json` y `video_preprocessor_config.json` indica que el checkpoint espera entradas visuales (imagen y vídeo) además de texto, pero la información disponible no especifica la arquitectura del codificador visual ni si el total de 27,78 B incluye sus parámetros.

Tampoco hay información sobre el proceso de alineación, el régimen de entrenamiento ni la composición multilingüe del dataset. Al tratarse de un espejo, el repositorio no aporta documentación técnica propia: la model card del autor original se conserva íntegra en `README.upstream.md` (65.012 bytes) y es la fuente que debe consultarse para cualquier detalle de arquitectura o entrenamiento.

## Capacidades

- Conversación multi-turno mediante plantilla de chat Jinja (`chat_template.jinja`), es decir, el checkpoint está preparado para inferencia instructiva y no solo como modelo base.
- Entrada de imágenes: la presencia de `preprocessor_config.json` implica soporte de pipeline visión-lenguaje (no confirmado en la documentación textual).
- Entrada de vídeo: `video_preprocessor_config.json` sugiere soporte de vídeo como modalidad de entrada (no confirmado).
- Generación de texto condicionada por prompt, con `generation_config.json` específico.
- Capacidades de razonamiento, código y matemáticas: no verificables con la información disponible; no se han publicado evaluaciones en este repositorio.
- Tool calling / function calling: no disponible (no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Atención al cliente con tickets visuales: al aceptar imágenes, el modelo puede recibir capturas de pantalla o fotos adjuntas por el usuario junto al texto del ticket y generar respuestas o clasificaciones; requiere validar previamente el soporte real de visión en el upstream.
- Extracción de información de documentación escaneada: digitalización de facturas, albaranes o informes en PDF convertidos a imagen, devolviendo campos estructurados en JSON mediante prompting.
- Revisión de vídeo para control de calidad: con el preprocesador de vídeo, inspección de grabaciones industriales o de procesos para detectar anomalías descritas en lenguaje natural.
- Generación y revisión de código en pipelines: al ser Apache-2.0 y safetensors, puede integrarse en flujos de revisión automática de parches; el soporte de tool calling no está confirmado, por lo que la integración debería hacerse vía API de chat y no asumir function calling.
- Generación de datos sintéticos y anotación a escala: servir el checkpoint con vLLM o SGLang para producir corpus etiquetados de dominio específico, aprovechando la licencia permisiva.
- Punto de partida para fine-tuning de dominio: 27,78 B en bf16 (~55,6 GB de pesos) permite ajuste con LoRA en una GPU de 80 GB, partiendo de pesos reproducibles descargados desde este espejo.
- Base reproducible para CI y evaluación interna: el caso de uso explícito del repositorio es descargar un checkpoint fijado por hash en pipelines automatizados, aislando al CI de cambios, gating y límites de tasa del upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo lo indica explícitamente: «No evaluation results are reported here and none should be attributed to this repository». Cualquier cifra de MMLU, HumanEval, GSM8K u otras deberá tomarse del repositorio upstream `Qwen/Qwen3.8-27B`, que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM en bf16: ~55,6 GB solo para pesos (27,78 B × 2 bytes); con caché KV y overhead de runtime, el mínimo práctico ronda 64-70 GB, por lo que encaja en H100 80 GB, A100 80 GB o H200.
- VRAM en fp8/int8: ~28 GB de pesos; ejecutable en A100 40 GB, L40S 48 GB o 2×RTX 4090 con paralelización por tensor.
- VRAM en cuantización de 4 bits: ~14-15 GB de pesos; cabe en una RTX 4090 (24 GB) o RTX 5090, dejando margen para contexto y caché KV.
- No cabe en GPUs de consumo de 8-12 GB ni siquiera en 4 bits sin offloading a CPU.
- El cálculo exacto de caché KV no es posible: faltan número de capas, cabezas y dimensiones por cabeza.
- Despliegue: vLLM o SGLang para serving en fp8/bf16; TGI como alternativa; llama.cpp u Ollama solo tras convertir los safetensors a GGUF (no se distribuye GGUF en este repositorio).
- Paralelización: el checkpoint está troceado en 18 shards, lo que facilita la descarga paralela y el sharding por tensor entre GPUs.
- Latencia y throughput: no disponible (sin datos publicados ni especificaciones de hardware de referencia).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `positron-ai/Qwen3.8-27B` (este repositorio) | 27,78 B | No disponible | Apache-2.0 | safetensors, 18 shards, descarga anónima | Espejo CI; solo cambia el README; sin resultados de evaluación |
| `Qwen/Qwen3.8-27B` (upstream) | 27,78 B (idénticos, verificados por hash) | No disponible | Apache-2.0 | safetensors | Repositorio canónico; el espejo indica que el upstream aplica gating y límites de tasa |
| Alternativas de la misma categoría (~27 B, multimodal) | No disponible | No disponible | No disponible | No disponible | La información proporcionada no incluye otros modelos con datos verificables para comparar |

## Limitaciones y advertencias

- El repositorio es exclusivamente una fuente de descarga para CI; su autor declara explícitamente que no es un canal de adquisición de pesos para procesamiento ni una fuente `bf16_source`, y que el sujeto canónico es el repositorio upstream.
- No debe atribuirse a este repositorio ningún resultado de evaluación, benchmark o capacidad no verificada: no publica ninguno.
- Sesgos conocidos: no disponible; no hay información sobre datos de entrenamiento ni análisis de sesgo.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación publicados en esta fuente, no puede acotarse.
- Idiomas y cobertura de contexto: la longitud de contexto y la lista de idiomas no están declaradas en la información disponible, lo que impide garantizar calidad en castellano o en contextos largos sin pruebas propias.
- Soporte de tool calling, agentes y visión: inferido solo a partir de los ficheros de configuración, no confirmado documentalmente; conviene validarlo contra la model card upstream.
- Licencia Apache-2.0: permite uso comercial y modificación, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna por parte del autor del espejo ni del upstream.
- Integridad: el espejo fija la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`; cualquier cambio upstream posterior no se refleja aquí, lo cual es deseable para CI pero peligroso si se espera la última versión.
- Descargas y likes a cero en el momento de la consulta: repositorio sin tracción pública, sin issues ni discusiones que permitan validación comunitaria.

## Enlaces

- Repositorio del espejo: https://huggingface.co/positron-ai/Qwen3.8-27B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.8-27B
- Revisión concreta espejada del upstream: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Model card original conservada en el espejo: https://huggingface.co/positron-ai/Qwen3.8-27B/blob/main/README.upstream.md
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre el autor del modelo. Las entradas devueltas corresponden a otros temas sin relación verificable: el IDE Positron para Python y R (https://positron.posit.co/), su página de descargas (https://positron.posit.co/download.html) y la partícula positrón (https://en.wikipedia.org/wiki/Positron, https://fr.wikipedia.org/wiki/Positon). No se ha establecido ninguna vinculación entre la organización `positron-ai` y dichos proyectos.
- Papers, blogs, repositorios de código y demos: no disponibles en la información proporcionada.
