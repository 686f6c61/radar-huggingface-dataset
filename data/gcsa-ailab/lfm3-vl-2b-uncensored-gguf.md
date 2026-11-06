# GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF

## Resumen

LFM3-VL-2B-Uncensored-GGUF es una variante del modelo vision-lenguaje LiquidAI/LFM3-VL-2B, publicada por GCSA-AiLab, en la que se ha aplicado la técnica conocida como Abliterix para reducir el comportamiento de rechazo (refusal) del backbone lingüístico. El modelo conserva el codificador visual y el proyector multimodal del original, y acepta entradas de texto e imagen para generar texto. Está pensado para despliegue local y en dispositivos de borde (edge), y se distribuye en formato GGUF para su uso con runtimes llama.cpp que soporten LFM3-VL.

El modelo base cuenta con aproximadamente 1.730 millones de parámetros (1.728.801.600 según los pesos en safetensors) y una longitud de contexto declarada de hasta 128.000 tokens, sujeta a la configuración del runtime y a la memoria disponible. La modificación Abliterix actúa sobre las proyecciones Q/K/V/O de la atención del backbone lingüístico mediante direcciones de rechazo específicas por capa.

Su relevancia actual radica en que ofrece capacidades multimodales en un tamaño compacto, apto para GPUs de consumo y hardware de borde, con una reducción medible del comportamiento de rechazo en pruebas de seguridad. No obstante, la propia model card advierte de que la abliteración y la cuantización pueden degradar la calidad de las respuestas, por lo que conviene evaluar el formato y el runtime exactos antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + proyector multimodal + backbone lingüístico); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128.000 tokens, sujeto a configuración del runtime y memoria disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q4_K_M (GGUF); también BF16 y compressed-tensors en otro repo, y MLX |
| Idiomas soportados | en, zh |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | GGUF (incluye mmproj-LFM3-VL-F16.gguf para visión); BF16/compressed-tensors y MLX en repos separados |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal que combina un codificador visual, un proyector multimodal y un backbone lingüístico. La modificación Abliterix se aplica exclusivamente sobre las proyecciones Q/K/V/O de la atención del backbone de lenguaje, manteniendo intactos el codificador visual y el proyector. Para calcular las direcciones de rechazo, Abliterix emplea direcciones de diferencia de medias específicas por capa, derivadas de 400 prompts benignos y 400 prompts objetivo, con proyección ortogonal directa y normalización de pesos previa a la edición.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La model card solo documenta el proceso de modificación y las métricas de evaluación asociadas al modelo fuente en BF16. Las variantes cuantizadas no han sido evaluadas por separado con esas métricas. El modelo base procede de LiquidAI y la variante se distribuye bajo la LFM Open License v1.0.

## Capacidades

- Generación de texto a partir de entradas de imagen y texto (image-text-to-text).
- Comprensión de imágenes mediante el codificador visual y el proyector multimodal compartido (mmproj).
- Conversación multiturno (etiqueta conversational).
- Capacidades multilingües limitadas a inglés (en) y chino (zh).
- Compatibilidad con endpoints (etiqueta endpoints_compatible).
- Reducción del comportamiento de rechazo respecto al modelo base, medida con StrongREJECT y SimpleSafetyTests.
- No se documenta soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistencia visual en dispositivos de borde: al ser un modelo de ~1,7B parámetros en GGUF, puede ejecutarse en hardware con recursos limitados para describir imágenes o responder preguntas sobre ellas en local.
- Procesamiento de documentos con imágenes en local: el contexto de hasta 128.000 tokens permite introducir capturas o páginas escaneadas junto con instrucciones extensas, siempre que la memoria del runtime lo permita.
- Aplicaciones de accesibilidad: descripción de imágenes y respuesta a preguntas visuales en tiempo real en equipos de consumo, sin depender de servicios en la nube.
- Moderación o análisis de contenido sin rechazos sistemáticos: la reducción del refusal medida (4% estricto en StrongREJECT) puede ser útil en flujos donde el modelo base rechaza peticiones legítimas, aunque requiere salvaguardas externas.
- Prototipado rápido de pipelines multimodales: la disponibilidad en GGUF, BF16/compressed-tensors y MLX facilita probar el mismo modelo en llama.cpp, servidores y Apple Silicon.
- Investigación sobre alineación y abliteración: sirve como caso de estudio reproducible para medir el efecto de la edición de pesos sobre la tasa de rechazo y la divergencia KL respecto al modelo base.
- Integración en asistentes conversacionales bilingües (en/zh) con entrada de imagen, para mercados donde esos dos idiomas son prioritarios.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| KL de siguiente token a vocabulario completo respecto al modelo base | 0,0426511 |
| StrongREJECT, tasa de rechazo estricta | 4% |
| StrongREJECT, advertencia respondiendo igualmente | 38% |
| SimpleSafetyTests, tasa de rechazo estricta | 8% |
| SimpleSafetyTests, advertencia respondiendo igualmente | 56% |

Las métricas describen el modelo fuente en BF16; las variantes cuantizadas no han sido evaluadas por separado. La KL es la media de KL(P_base || P_modificado) en una posición de siguiente token para cada uno de 100 prompts benignos fijos, sobre las 128.000 entradas del vocabulario, y no es divergencia de secuencia completa. StrongREJECT usa un subconjunto estratificado fijo de 100 ítems y SimpleSafetyTests los 100 casos completos; el juez fue OllamaCloud deepseek-v4.1-flash:1017. Una respuesta que advierte pero responde sustancialmente cuenta como respuesta, no como rechazo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para ~1,7B parámetros, Q4_K_M ocupa del orden de 1-1,5 GB, Q8_0 alrededor de 2 GB y BF16/F16 en torno a 3,5 GB, a lo que hay que sumar el mmproj en F16 y el coste del contexto.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 y RTX 4090, y en aceleradores de borde.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4-6 GB de VRAM o más, según cuantización y longitud de contexto.
- Opciones de despliegue: llama.cpp con soporte LFM3-VL (requiere el GGUF de lenguaje más mmproj-LFM3-VL-F16.gguf para imágenes); también hay variantes BF16/compressed-tensors y MLX.
- Latencia y throughput: no disponibles.
- Nota del autor: elegir la precisión según el presupuesto de memoria y los requisitos de calidad; menos bits no garantizan menor latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-VL-2B-Uncensored (este) | ~1,73B | hasta 128.000 tokens | en, zh | LFM Open License v1.0 | GGUF, BF16, compressed-tensors, MLX |
| LiquidAI/LFM3-VL-2B (base) | ~1,73B | hasta 128.000 tokens (según model card del derivado) | en, zh | LFM Open License v1.0 | safetensors y otros |
| Alternativas de ~2B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otras alternativas en la información proporcionada. La diferencia principal frente al modelo base es la modificación Abliterix y la disponibilidad de pesos GGUF.

## Limitaciones y advertencias

- La abliteración reduce el rechazo, lo que puede aumentar la probabilidad de generar contenido dañino o inapropiado; requiere filtros y salvaguardas externas en producción.
- La edición de pesos introduce una divergencia respecto al modelo base (KL de 0,0426511 en siguiente token), que puede degradar la calidad de las respuestas.
- Las métricas de seguridad solo se midieron en BF16; las variantes cuantizadas no han sido evaluadas y pueden comportarse de forma distinta.
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a modelos de este tamaño; no se han publicado evaluaciones de fidelidad factual.
- La licencia LFM Open License v1.0 impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar.
- Para inferencia con imágenes es obligatorio cargar también el mmproj; el GGUF de lenguaje por sí solo no procesa imágenes.
- El contexto de 128.000 tokens está sujeto a la configuración del runtime y a la memoria disponible, no garantizado en todos los entornos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Variante BF16 y compressed-tensors: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored
- Variante MLX: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored-MLX
- README en chino simplificado: README_zh-CN.md (en el repositorio)
- README en chino tradicional: README_zh-Hant.md (en el repositorio)
- Licencia: LICENSE (en el repositorio)
