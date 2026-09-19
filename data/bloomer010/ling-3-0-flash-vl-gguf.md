# bloomer010/Ling-3.0-flash-VL-GGUF

## Resumen

Ling-3.0-flash-VL-GGUF es una conversión a formato GGUF del modelo multimodal `inclusionAI/Ling-3.0-flash-VL`, publicada por el usuario bloomer010. Se trata de un modelo de mezcla de expertos (MoE) de 124.414.211.552 parámetros totales con 5,1 mil millones de parámetros activos por token, capaz de procesar texto, imágenes y vídeo. La conversión se ha realizado directamente desde los safetensors BF16 publicados por inclusionAI, aplicando transformaciones específicas de tensores para adaptar la arquitectura al runtime de llama.cpp.

El modelo combina dos mecanismos de atención: 35 capas KDA (atención lineal) y 7 capas MLA con gating en los índices basados en cero 5, 11, 17, 23, 29, 35 y 41, sobre un total de 42 bloques. El enrutado MoE utiliza 512 expertos enrutados con selección top-8 más un experto compartido, puntuación por sigmoide, sesgo de experto y cuatro grupos seleccionados de ocho disponibles. Incorpora una torre de visión de 27 bloques para entrada de imagen y vídeo, distribuida en un archivo `mmproj` separado.

Su relevancia es limitada por el momento: el repositorio registra 0 descargas y 0 likes, y la arquitectura `bailingmoe3vl` todavía no carga en la rama principal de llama.cpp. Según la model card, es necesario aplicar tres pull requests no fusionados, o bien compilar la rama `ling3-vl` del repositorio `aetherbird/llama.cpp`. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida KDA (atención lineal) + MLA con gating; transformer con torre de visión de 27 bloques |
| Parametros totales | 124.414.211.552 (124B) |
| Parametros activos | 5,1B por token |
| Longitud de contexto | Hasta 128K tokens (el ejemplo de la model card usa `-c 131072`) |
| Tipos de cuantizacion | BF16 (249 GB) y Q4_K_M (tamaño no disponible, marcado como TBD en la model card); no se detallan el resto de variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); archivo `mmproj-model-f16.gguf` separado en F16 para la entrada de visión |
| Tamano del repositorio | 248,9 GB |
| Modelo base | inclusionAI/Ling-3.0-flash-VL |
| Fecha de publicacion | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

El archivo de texto contiene 42 bloques: 35 capas KDA y 7 capas MLA con gating. Las dos primeras capas emplean FFN densas y el resto utilizan 512 expertos enrutados con selección top-8 más un experto compartido. El enrutado combina puntuación sigmoide, sesgo de experto, ocho grupos de expertos y cuatro grupos seleccionados. El codificado posicional es M-RoPE con secciones [8, 12, 12], compartido entre posiciones de texto y de visión.

La torre de visión y el proyector residen en un GGUF `mmproj` independiente: incluye patch embedding Conv3D, embeddings posicionales aprendidos, 27 bloques de atención, un merger solo de normalización y un proyector de dos capas (`ling3vl_merger`). Las transformaciones aplicadas durante la conversión incluyen `A_log` almacenado como `exp(A_log)`, división de `kv_b_proj` de MLA en tensores K y V separados con K traspuesta, remodelado de los pesos de convolución de KDA, apilado de tensores por experto en tensores de experto GGUF y mapeo separado de los tensores `g_proj` de KDA y MLA. Las normalizaciones, tensores de enrutado, sesgo de enrutado de expertos, escalares de estado de KDA, `dt_bias` y pesos de convolución permanecen en F32.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La model card indica que esta conversión no incluye bloque MTP/NextN, a diferencia de las GGUF de texto de Ling-3.0-flash, porque la versión VL no lo distribuye; en consecuencia, el borrador especulativo mediante `--spec-type draft-mtp` no está disponible. La model card declara validaciones de carga de arquitectura BF16 y round-trip de tensores, round-trip del GGUF `mmproj` (334 tensores, proyector `ling3vl_merger`) y deja la inferencia extremo a extremo de imagen y vídeo en llama-server como pendiente (TBD).

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen mediante `image_url` en la API de chat compatible con OpenAI.
- Entrada de vídeo mediante partes de contenido `video_url`; los fotogramas se muestrean y codifican con la misma torre de visión.
- Modo de razonamiento (thinking) activado por defecto, desactivable por petición con `"chat_template_kwargs": {"enable_thinking": false}`.
- Procesamiento de contexto largo de hasta 128K tokens.
- Inferencia solo de texto sin necesidad del archivo `mmproj`.
- No se documentan en la información disponible capacidades de tool calling, function calling ni agentes multi-paso.
- No se detallan capacidades multilingües ni la lista de idiomas soportados.

## Casos de uso

- Descripción y etiquetado automático de imágenes: el modelo acepta imágenes en base64 mediante `image_url` y devuelve texto descriptivo, útil para generar metadatos en catálogos o sistemas de gestión documental.
- Análisis de vídeo con muestreo de fotogramas: al aceptar `video_url`, permite resumir o clasificar contenido audiovisual sin pipeline externo de extracción de frames, ya que la propia torre de visión codifica los fotogramas.
- Asistentes conversacionales de texto con contexto extenso: con hasta 128K tokens de ventana, admite hilos largos de conversación o documentos completos en una sola petición.
- Despliegue en hardware limitado mediante offload de expertos: el parámetro `-ot "ffn_.*_exps\.weight=CPU"` o `-ncmoe N` permite mantener los expertos en CPU y el resto en GPU, lo que hace viable servir un modelo de 124B con menos VRAM que el tamaño del archivo.
- Procesamiento por lotes en local con llama-server: la exposición de un endpoint compatible con `/v1/chat/completions` permite integrarlo en scripts y herramientas internas sin depender de servicios en la nube.
- Evaluación e investigación de arquitecturas híbridas: al ser una conversión de pesos abierta de un modelo KDA + MLA, sirve para reproducir y estudiar el comportamiento de atención lineal combinada con MLA en entornos llama.cpp.
- Generación de descripciones accesibles: conversión de imágenes y vídeos a texto para lectores de pantalla o cumplimiento de requisitos de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta validaciones de carga de arquitectura, round-trip de tensores y round-trip del `mmproj` (334 tensores), y marca la inferencia extremo a extremo de imagen y vídeo en llama-server como pendiente.

## Requisitos de hardware

- BF16: archivo de 249 GB; la propia model card recomienda 256 GB o más de memoria.
- Q4_K_M: tamaño oficial no disponible (marcado como TBD). A partir de los 124,4B parámetros totales, la estimación aritmética se sitúa en torno a 70-75 GB asumiendo una media de 4,5-5 bits por peso; es una cifra derivada, no confirmada por el autor.
- Los pesos y el contexto comparten memoria, por lo que la model card recomienda dejar margen libre.
- Offload de expertos: con menos VRAM que el tamaño del archivo, se pueden mantener los expertos en CPU con `-ot "ffn_.*_exps\.weight=CPU"` o ajustar la colocación con `-ncmoe N`, dejando el resto en GPU.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Compatibilidad con GPU de consumo: no confirmada; dependerá de la VRAM disponible frente al tamaño de la cuantización elegida y de la proporción de expertos que se delegue a CPU.
- Opciones de despliegue: llama.cpp, en concreto `llama-server` y `llama-cli`. No carga en la rama principal de llama.cpp; requiere tres pull requests no fusionados (arquitectura VL `bailingmoe3vl` más proyector de Ling VL, parser dedicado de Ling PR #28682 y manejo de UTF-8 inválido en el límite de token PR #28724) o la rama `ling3-vl` de `aetherbird/llama.cpp`. No se documenta compatibilidad con vLLM, TGI, Ollama u otros servidores.
- Latencia y throughput: no disponibles.
- Parámetros de muestreo recomendados por la model card del modelo fuente: `temperature 0.6`, `top_p 0.95`, `top_k 20`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada. La única comparación documentada por el autor es interna, frente a las conversiones GGUF del modelo de solo texto Ling-3.0-flash:

| Modelo | Parametros | Contexto | Bloque MTP/NextN | Borrador especulativo | Licencia |
|---|---|---|---|---|---|
| Ling-3.0-flash-VL-GGUF (esta ficha) | 124B totales / 5,1B activos | Hasta 128K | No incluido | No disponible (`--spec-type draft-mtp`) | MIT |
| Ling-3.0-flash GGUF (solo texto) | no disponible | no disponible | Sí incluido | Disponible | no disponible |

## Limitaciones y advertencias

- La arquitectura `bailingmoe3vl` no está fusionada en llama.cpp: el modelo no carga en versiones estándar y exige compilar una rama con tres pull requests no fusionados, lo que implica riesgo de cambios incompatibles.
- La inferencia extremo a extremo de imagen y vídeo en llama-server figura como pendiente de validación (TBD) en la propia model card.
- Ausencia de bloque MTP/NextN en la versión VL: no se puede usar decodificación especulativa con `--spec-type draft-mtp` como en las GGUF de texto.
- No hay datos publicados de benchmarks, sesgos, alineación o comportamiento en producción.
- No se especifican los idiomas soportados, por lo que no se puede garantizar un rendimiento adecuado en castellano.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones al respecto.
- El tamaño del archivo Q4_K_M está sin determinar (TBD), lo que dificulta planificar requisitos de memoria.
- Repositorio sin descargas ni valoraciones (0 descargas, 0 likes) y con menos de media hora entre creación y última actualización según los metadatos, lo que reduce la evidencia de uso real en terceros.
- La model card advierte de que las cuantizaciones más pequeñas implican más compresión y más degradación ("más slop" y mal comportamiento), sin cuantificar la pérdida.
- Licencia MIT en esta conversión, pero conviene verificar las condiciones del modelo base `inclusionAI/Ling-3.0-flash-VL` antes de uso comercial.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/bloomer010/Ling-3.0-flash-VL-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Pull request del parser de Ling en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/28682
- Pull request de manejo de UTF-8 inválido en el límite de token: https://github.com/ggml-org/llama.cpp/pull/28724
- Rama con los tres pull requests aplicados: https://github.com/aetherbird/llama.cpp (rama `ling3-vl`)
- Paper, blog o demo oficial: no disponible en la información proporcionada.
- La búsqueda web asociada no devolvió resultados relacionados con este modelo.
