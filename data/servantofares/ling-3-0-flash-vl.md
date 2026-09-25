# servantofares/Ling-3.0-flash-VL

## Resumen

Ling-3.0-flash-VL es un modelo multimodal nativo de tipo imagen-texto desarrollado por inclusionAI, la marca de inteligencia artificial de Ant Group. Se construye sobre el modelo de lenguaje Ling-3.0-flash y extiende sus capacidades de lenguaje, razonamiento y contexto largo con comprensión nativa de imágenes y vídeo, integrando la información visual en todo el ciclo de comprensión, razonamiento, planificación, actuación y verificación. El repositorio analizado aquí es una resubida de terceros publicada por el usuario servantofares, no el repositorio oficial.

Su característica principal es la eficiencia: mantiene una capacidad total de 124.848.460.496 parámetros (aproximadamente 124,8 mil millones) con una arquitectura MoE dispersa que activa solo 5.500 millones de parámetros por token. Soporta una ventana de contexto de hasta 262.144 tokens (256K) y admite entradas de imagen y vídeo, lo que lo sitúa en el segmento de modelos multimodales de gran escala con coste de inferencia reducido.

El modelo entra en modo "thinking" por defecto y obtiene una puntuación de 42 en el índice Artificial Analysis Intelligence Index v4.1.1, cuatro puntos por encima de los 38 de Ling-3.0-flash, lo que sugiere que la incorporación de capacidades visuales no degrada, sino que mejora, el rendimiento general de razonamiento. Está publicado bajo licencia MIT y sus pesos se distribuyen en formato safetensors, con un tamaño de repositorio de 249,7 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa con backbone híbrido de 42 capas que alterna capas KDA y Gated MLA en proporción 5:1; encoder visual ViT y proyector MLP de dos capas; etiqueta de arquitectura en HuggingFace: bailing_moe_v3_vl |
| Parametros totales | 124.848.460.496 (≈124,8 B) |
| Parametros activos | 5,5 B por token |
| Longitud de contexto | 262.144 tokens (256K) con escalado YaRN; 131.072 tokens (128K) como max_position original |
| Tipos de cuantizacion | BF16 y FP8 documentados en la matriz de despliegue de SGLang; no se listan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 249,7 GB); requiere custom_code y trust_remote_code |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de 42 capas que alterna dos tipos de capa de atención: KDA y Gated MLA, en una proporción de 5 a 1. Esta combinación está orientada a procesar de forma eficiente secuencias largas que mezclan texto, imágenes, vídeo e historiales extensos de tareas de agente. Sobre ese backbone se monta una arquitectura de mezcla de expertos (MoE) dispersa que conserva 124,8 B de parámetros totales pero activa únicamente 5,5 B por token, lo que reduce el coste de inferencia manteniendo la capacidad del modelo.

La parte visual se resuelve con un encoder ViT que extrae características de imágenes y vídeo, y un proyector MLP de dos capas que alinea esas características con las representaciones textuales. Para el vídeo se utiliza VideoRoPE, que codifica posiciones espaciales y orden temporal, habilitando tareas como localización de eventos, respuesta a preguntas sobre vídeos largos y edición de clips. El modelo se presenta como multimodal nativo y hereda de Ling-3.0-flash las capacidades de lenguaje, razonamiento y contexto largo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Comprensión de imágenes: conteo de objetos, interpretación de layouts complejos, gráficos y contenido de documentos.
- Comprensión de vídeo: gracias a VideoRoPE, maneja orden temporal y cambios visuales a lo largo del tiempo, incluyendo localización de eventos y preguntas sobre vídeos largos.
- Razonamiento con evidencia visual: cálculo a partir de información visual, razonamiento multi-paso y verificación de información externa apoyada en imágenes.
- Actuación sobre interfaces: interpreta interfaces web y de software y traduce la información visual en secuencias de acciones, lo que lo orienta a flujos de agente.
- Modo de pensamiento (thinking): activado por defecto en la plantilla de chat; se puede desactivar por petición con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling: soportado, con parser dedicado (`--tool-call-parser ling3`) que se resuelve automáticamente desde la plantilla de chat.
- Razonamiento de agente multi-paso: el modelo está diseñado para integrar visión en comprensión, razonamiento, planificación, actuación y verificación.
- Contexto largo: ventana de hasta 262.144 tokens para texto, imágenes, vídeo e historiales de tareas de agente.
- Capacidades multilingües: no disponible; el repositorio no declara la lista de idiomas soportados.

## Casos de uso

- Automatización de agentes de interfaz (GUI agents): el modelo puede interpretar pantallas de aplicaciones web o de escritorio y convertirlas en secuencias de acciones, apoyándose en su capacidad de actuación sobre interfaces y en el soporte de tool calling con parser `ling3`.
- Análisis de documentos empresariales: extracción y razonamiento sobre facturas, informes y formularios con layouts complejos o tablas, aprovechando la capacidad de comprensión de documentos y gráficos.
- Respuesta a preguntas sobre vídeo largo: con VideoRoPE y una ventana de 256K tokens, resulta adecuado para analizar grabaciones extensas, localizar eventos en el tiempo y responder preguntas sobre lo ocurrido en un intervalo concreto.
- Verificación de información con evidencia visual: en flujos de comprobación de datos, el modelo puede contrastar afirmaciones contra gráficos, capturas o documentos y realizar cálculos intermedios sobre esa evidencia.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con historial extenso gracias a los 262.144 tokens de contexto, incorporando capturas de pantalla enviadas por el usuario como parte de la conversación.
- Moderación y auditoría de contenido visual: revisión automática de imágenes o clips de vídeo con salida estructurada mediante tool calling, integrable en pipelines de revisión por lotes.
- Indexación y descripción de bibliotecas multimedia: generación de descripciones, etiquetas y metadatos temporales para catálogos de vídeo, usando la codificación temporal para segmentar y anotar clips.
- Asistencia a tareas de terminal y operaciones: la evaluación Terminal-Bench 2.1 indica uso previsto en tareas de terminal de varios pasos, adecuado para agentes que ejecutan comandos y verifican resultados.

## Benchmarks y rendimiento

| Benchmark | Ling-3.0-flash-VL | Ling-3.0-flash |
|---|---|---|
| Artificial Analysis Intelligence Index v4.1.1 | 42 | 38 |
| Terminal-Bench 2.1 | Evaluado (sin puntuación publicada en la información disponible) | no disponible |
| Benchmarks multimodales (comprensión, razonamiento, actuación) | Presentados únicamente como gráfico, sin cifras en el texto | no disponible |

No se han publicado resultados numéricos desglosados de benchmarks multimodales en la información disponible. La evaluación de Terminal-Bench 2.1 se realizó bajo el protocolo de Artificial Analysis con el harness Terminus 2, timeout unificado de 2 horas, parser JSON en modo preserve-thinking y 3 ejecuciones por tarea (media), con `temperature=1.0` y `max_new_tokens=32K`.

## Requisitos de hardware

- Peso de los pesos en BF16: aproximadamente 249,7 GB, coherente con los 124,8 B de parámetros a 2 bytes por parámetro.
- Peso estimado en FP8: aproximadamente 125 GB, según la matriz BF16/FP8 de la receta de SGLang.
- Configuración recomendada para contexto de 256K: 4 GPU de clase 141 GB (H20-3e o H200) con `--tp 4`, o 4 nodos Blackwell (B300 / GB300).
- Configuración con GPU de 80 GB: escalar a `--tp 8` en H100 o H800.
- GPU de consumo: no es viable; ni siquiera las GPUs de consumo de gama alta disponen de la VRAM agregada necesaria para los pesos completos.
- Despliegue: SGLang mediante la imagen `lmsysorg/sglang:dev-Ling-3.0-flash-VL`, con `--trust-remote-code`, `--reasoning-parser ling3` y `--tool-call-parser ling3` (se resuelven automáticamente desde la plantilla de chat). Requiere `SGLANG_ALLOW_OVERWRITE_LONGER_CONTEXT_LEN=1` y configuración YaRN con `factor=2.0`, `rope_theta=6000000`, `partial_rotary_factor=0.5` y `original_max_position_embeddings=131072`.
- Otros motores de inferencia (vLLM, TGI, llama.cpp, Ollama): no disponibles en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Índice AA v4.1.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ling-3.0-flash-VL | 124,8 B | 5,5 B | 256K | 42 | MIT | Repositorio en HuggingFace (resubida de terceros en este caso) |
| Ling-3.0-flash | no disponible | no disponible | no disponible | 38 | no disponible | Repositorio oficial de inclusionAI |
| Otras alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite la comparación directa con Ling-3.0-flash, del que Ling-3.0-flash-VL hereda las capacidades de lenguaje. No se dispone de datos de otros modelos multimodales de tamaño similar en la documentación analizada.

## Limitaciones y advertencias

- Repositorio de terceros: el identificador `servantofares/Ling-3.0-flash-VL` corresponde a un usuario distinto del desarrollador declarado en la model card (inclusionAI). Para uso en producción conviene verificar los pesos contra el repositorio oficial.
- Código remoto: el modelo requiere `custom_code` y `--trust-remote-code`, lo que implica ejecutar código del repositorio durante la carga. Es un riesgo de seguridad que debe evaluarse antes de desplegar.
- Idiomas: no se declara la lista de idiomas soportados, por lo que la cobertura multilingüe no es verificable con la información disponible.
- Alucinación: no se publican tasas de alucinación ni resultados de evaluaciones de veracidad; la capacidad de "verificación con evidencia visual" es una descripción cualitativa, no una garantía.
- Benchmarks incompletos: solo se aporta una cifra agregada (índice AA v4.1.1 = 42) y una mención cualitativa a Terminal-Bench 2.1 sin puntuación. El resto de resultados multimodales aparecen únicamente como gráficos sin cifras en el texto.
- Sin validación comunitaria: el repositorio analizado registra 0 descargas y 0 likes en el momento de la consulta.
- Requisitos de hardware muy elevados: 249,7 GB de pesos en safetensors excluyen el despliegue en hardware de consumo y obligan a configuraciones multi-GPU de centro de datos.
- Licencia: se declara MIT, pero al tratarse de una resubida conviene confirmar los términos aplicables en el repositorio original antes de un uso comercial.
- Metadatos: las fechas del repositorio (creación y actualización el 24 de septiembre de 2026) no coinciden con el ciclo de publicación habitual del modelo base, lo que sugiere que los metadatos pueden ser inconsistentes.
- Parámetros de decodificación recomendados: `temperature=0.6`, `top_p=0.95`, `top_k=20` según la model card, y `temperature=1.0` en la evaluación de Terminal-Bench; el modo thinking está activado por defecto y su desactivación puede alterar el rendimiento.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/servantofares/Ling-3.0-flash-VL
- Repositorio de referencia citado en la model card: inclusionAI/Ling-3.0-flash-VL
- Organización inclusionAI en HuggingFace: https://huggingface.co/inclusionAI
- Organización inclusionAI en ModelScope: https://modelscope.cn/organization/inclusionAI
- Receta de despliegue en SGLang: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash-VL
- Imagen Docker de SGLang para este modelo: lmsysorg/sglang:dev-Ling-3.0-flash-VL
- Imagen de arquitectura de la model card: https://cdn-uploads.huggingface.co/production/uploads/6666ca359f5a0b3229238a1a/IL2eS4KUbKLYCWcoFC-Bq.png
- Gráfico de resultados en Artificial Analysis: https://cdn-uploads.huggingface.co/production/uploads/6666ca359f5a0b3229238a1a/5gqrYjboQ8j7sTWjd1A_q.png
- Gráfico de benchmarks multimodales: https://cdn-uploads.huggingface.co/production/uploads/6666ca359f5a0b3229238a1a/w-V0gtCa3qy0un6vuz-sj.png
