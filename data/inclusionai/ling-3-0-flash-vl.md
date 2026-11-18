# inclusionAI/Ling-3.0-flash-VL

## Resumen

Ling-3.0-flash-VL es un modelo multimodal nativo desarrollado por inclusionAI (organización vinculada a Ant Group) que parte del modelo de lenguaje Ling-3.0-flash y le añade comprensión de imagen y vídeo integrada en todo el ciclo de razonamiento. Con 124.848 millones de parámetros totales y solo 5.500 millones activados por token, emplea una arquitectura MoE dispersa sobre un backbone híbrido de 42 capas que alterna capas KDA y Gated MLA en proporción 5:1, lo que le permite procesar contextos de hasta 256.000 tokens de forma eficiente.

El modelo cubre tres ejes declarados por el autor: comprender información visual compleja (layouts, gráficos, documentos, conteo de objetos), razonar y verificar usando evidencia visual, y actuar sobre interfaces web y de software traduciendo lo que ve a secuencias de acciones. Incorpora un encoder visual ViT con un proyector MLP de dos capas y VideoRoPE para codificar posición espacial y orden temporal, lo que habilita tareas de localización de eventos y preguntas sobre vídeos largos.

Es relevante ahora porque combina una ventana de contexto muy amplia con un coste de inferencia bajo (5.5B activos), y porque su licencia MIT elimina las restricciones habituales de uso comercial de otros modelos multimodales de gran tamaño. El autor reporta una puntuación de 42 en el Artificial Analysis Intelligence Index v4.1.1, cuatro puntos por encima de Ling-3.0-flash (38), lo que sugiere que la extensión visual no degrada el rendimiento cognitivo del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con backbone de 42 capas (KDA + Gated MLA en ratio 5:1), encoder visual ViT y proyector MLP de 2 capas |
| Parametros totales | 124.848.460.496 (124,8B) |
| Parametros activos | 5,5B por token |
| Longitud de contexto | 256K tokens (262.144), extensible mediante YaRN con factor 2.0 sobre 131.072 originales |
| Tipos de cuantizacion | no disponible (el autor publica pesos en BF16 y menciona recetas FP8 para SGLang) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de 42 capas que alterna capas KDA (Kimi Delta Attention) y Gated MLA en una proporción 5:1. Esta combinación busca reducir el coste computacional del contexto largo manteniendo la calidad de atención, y es la que permite sostener 256K tokens sobre texto, imágenes, vídeos e historiales extensos de tareas de agente. Sobre ese backbone se monta una arquitectura MoE dispersa que mantiene la capacidad total en 124B parámetros mientras activa solo 5,5B por token.

La parte multimodal consta de un encoder visual ViT que extrae características de imágenes y vídeos, y un proyector MLP de dos capas que alinea esas características con las representaciones textuales. Para vídeo se introduce VideoRoPE, que codifica posiciones espaciales y orden temporal simultáneamente, habilitando localización de eventos, QA sobre vídeos largos y edición de clips. El modelo card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información no está disponible. El modo thinking viene activado por defecto en la plantilla de chat y puede desactivarse por petición con `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking activado por defecto.
- Comprensión de imágenes: conteo de objetos, layouts complejos, gráficos y contenido de documentos.
- Comprensión de vídeo con orden temporal: localización de eventos, QA sobre vídeos largos y edición de clips mediante VideoRoPE.
- Razonamiento con evidencia visual: cálculo a partir de imágenes, verificación de información externa y cadenas de razonamiento apoyadas en lo que se ve.
- Actuación sobre interfaces: interpretación de UI web y de software, y traducción de la información visual a secuencias de acciones.
- Tool calling y function calling, con parser dedicado (`ling3`) resuelto automáticamente desde la plantilla de chat en SGLang.
- Capacidades de agente y razonamiento multi-paso con historiales largos gracias a la ventana de 256K tokens.
- Capacidades multilingües: no detalladas en la información disponible.

## Casos de uso

- Automatización de atención al cliente con soporte visual: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla o documentos, manteniendo el hilo gracias a los 256K tokens de contexto y razonando sobre la evidencia visual.
- Agentes de navegación web: interpreta la interfaz renderizada, identifica controles y traduce lo que ve en secuencias de clics y entradas de texto, lo que encaja con flujos de automatización de back office y QA de aplicaciones.
- Análisis de documentos y gráficos financieros: extrae y razona sobre tablas, charts y layouts complejos en informes, útil para pipelines de extracción de datos y verificación de cifras contra fuentes externas.
- Procesamiento de vídeo de vigilancia o industria: con VideoRoPE puede localizar eventos en el tiempo y responder preguntas sobre clips largos, por ejemplo para auditoría de incidencias en planta o revisión de grabaciones.
- Generación y revisión de código asistida por capturas: al combinar tool calling con comprensión de UI, puede integrarse en pipelines de CI/CD para interpretar errores visuales de tests end-to-end y proponer correcciones.
- Asistentes de soporte técnico de software: el modelo entiende la pantalla del usuario y el historial largo de la incidencia, y puede verificar pasos de resolución consultando documentación mediante herramientas.
- Moderación y anotación multimodal a escala: con solo 5,5B parámetros activos, el coste por token es bajo, lo que permite clasificar y describir grandes volúmenes de imágenes y vídeos en producción.

## Benchmarks y rendimiento

| Benchmark | Ling-3.0-flash-VL | Ling-3.0-flash |
|---|---|---|
| Artificial Analysis Intelligence Index v4.1.1 | 42 | 38 |

El autor menciona evaluaciones en benchmarks multimodales organizadas en tres dimensiones (comprender, razonar, actuar) y una evaluación en Terminal-Bench 2.1 bajo protocolo de Artificial Analysis con el harness Terminus 2, timeout unificado de 2 horas, parser JSON en modo preserve-thinking y 3 ejecuciones por tarea (media), con decodificación a temperature=1.0 y max_new_tokens=32K sobre contexto de 256K. Los valores numéricos de esos benchmarks no se incluyen en la información disponible; las cifras concretas están solo en las imágenes del model card, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 124,8B parámetros en BF16 el peso ronda los 250 GB (el repositorio ocupa 249,7 GB), por lo que la inferencia requiere agregación de memoria entre GPUs.
- Configuración recomendada por el autor: 4 GPUs de clase 141 GB (H20-3e o H200) o nodos Blackwell de 4 GPUs (B300/GB300) con `--tp 4` para contexto de 256K con YaRN.
- En tarjetas de 80 GB (H100/H800) el autor indica escalar a `--tp 8`.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) en BF16; no se han publicado recetas de cuantización para consumer.
- Despliegue: SGLang es la vía documentada, con imagen Docker `lmsysorg/sglang:dev-Ling-3.0-flash-VL` y cookbook propio con matrices BF16/FP8 × baja latencia/alto throughput. No se mencionan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Ling-3.0-flash-VL | 124,8B | 5,5B | 256K | MIT | Imagen y vídeo |
| Ling-3.0-flash | no disponible | no disponible | no disponible | no disponible | Solo texto |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con Ling-3.0-flash, el modelo base del que deriva. No se dispone de datos de otros modelos comparables de tamaño y modalidad similares en el material consultado.

## Limitaciones y advertencias

- El model card no documenta sesgos conocidos; al ser un modelo entrenado sobre datos web es esperable que herede sesgos de esos datos, pero no hay evaluación publicada al respecto.
- Riesgo de alucinación: no se reportan tasas de alucinación ni evaluaciones de fidelidad factual; el modo thinking activado por defecto puede generar cadenas de razonamiento largas que no siempre convergen a una respuesta correcta.
- Idiomas soportados no especificados: no hay garantía documentada de calidad fuera de los idiomas del entrenamiento, que tampoco se detallan.
- La ventana de 256K requiere configuración explícita de YaRN (`rope_type: yarn`, factor 2.0, rope_theta 6000000, partial_rotary_factor 0.5); sin ella el contexto efectivo se limita a 131.072 tokens.
- El modelo usa `custom_code` y exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar en producción.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero no se ofrece garantía ni indemnización por parte del autor.
- Requiere hardware de gama alta (4-8 GPUs de 80-141 GB); no hay recetas publicadas para cuantización en GPUs de consumo, lo que limita su despliegue en entornos pequeños.
- No se detallan los datos de entrenamiento ni si hubo alineación con RLHF/DPO, lo que dificulta evaluar la robustez frente a prompts adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Organización en Hugging Face: https://huggingface.co/inclusionAI
- Organización en ModelScope: https://modelscope.cn/organization/inclusionAI
- Cookbook de SGLang para Ling-3.0-flash-VL: https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.0-flash-VL
