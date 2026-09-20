# OpenMed/LFM2-1.2B-Longevity-8bit-mlx

## Resumen

OpenMed/LFM2-1.2B-Longevity-8bit-mlx es una conversión nativa a MLX del modelo LiquidAI/LFM2-1.2B-Longevity, cuantizada a 8 bits en modo afín con group size 64 mediante mlx_lm.convert. No es un modelo entrenado desde cero: el checkpoint original es un ajuste fino supervisado de parámetros completos de LiquidAI/LFM2-1.2B, desarrollado conjuntamente por Liquid AI e Insilico Medicine dentro de la familia Longevity-LLM (L-LLM), orientada a interpretar datos heterogéneos de biología del envejecimiento (genómicos, proteómicos y clínicos).

El modelo tiene 1.170.340.608 parámetros (1,17 B) y una arquitectura híbrida lfm2 (Lfm2ForCausalLM) que combina convoluciones cortas con puertas y solo 6 capas de atención con grouped-query attention de un total de 16. Su ventana de contexto declarada en la model card de origen es de 32.768 tokens, aunque el campo max_position_embeddings del config llega a 128.000. El repositorio pesa 1,2 GB y los pesos cuantizados ocupan 1,16 GiB, frente a los 2,18 GiB de la fuente en BF16.

Su relevancia es doble: por un lado, es una de las primeras adaptaciones compactas y ejecutables en local para biología del envejecimiento, un dominio donde el envío de datos clínicos a APIs externas plantea problemas de privacidad; por otro, sirve como ejemplo práctico de cuantización casi sin pérdida (8,50 bits por peso medidos) para Apple Silicon. Está acompañado del estudio "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., 2026), aunque en la información disponible no se incluyen resultados numéricos de ese benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Lfm2ForCausalLM): modelo híbrido con convoluciones cortas con puertas y 6 capas de atención de 16 |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens según la model card de origen; max_position_embeddings = 128.000 en el config |
| Tipos de cuantizacion | 8 bits afín, group size 64, weight-only (8,50 bits por peso medidos); existe una variante 4 bits del mismo autor |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (campo license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (MLX cuantizado); no se publica GGUF en este repositorio |
| Tamano de pesos | 1,16 GiB (model.safetensors) frente a 2,18 GiB del BF16 original |
| Tamano del repositorio | 1,2 GB |
| Dimension oculta | 2048 |
| Capas | 16 (6 de atención, 10 de convolución) |
| Atención | 32 cabezas de consulta / 8 cabezas de clave-valor (GQA) |
| Anchura de la red feed-forward | 12.288 |
| Vocabulario | 65.536 tokens, embeddings de entrada/salida compartidos |
| Modulos cuantizados | todas las proyecciones lineales y el embedding de tokens compartido; RMSNorm y kernels de convolución corta se mantienen en BF16 |
| Herramienta de conversion | mlx_lm.convert (mlx-lm 0.31.3), `-q --q-bits 8 --q-group-size 64` |
| SHA-256 de los pesos | 10a0b76af3ed89706863901b762c1203dd3cb200abd88127ff7a4333e6b15f49 |
| Plantilla de chat | ChatML con conmutador dinámico de razonamiento (`/think`, `/no_think`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de tipo LFM2: de las 16 capas que lo componen, 10 son convoluciones cortas con puertas y solo 6 son capas de atención con grouped-query attention (32 cabezas de consulta y 8 de clave-valor). El tamaño oculto es 2048 y la anchura de la red feed-forward es 12.288, con embeddings de tokens atados (vocabulario de 65.536). Este diseño reduce el coste de la atención de largo alcance y está pensado para inferencia en dispositivo. La model card advierte de que el archivo modeling_lfm2.py incluido es una referencia en PyTorch heredada del repositorio original y no lo usa MLX.

El entrenamiento del checkpoint fuente consistió en un ajuste fino supervisado de parámetros completos de LiquidAI/LFM2-1.2B sobre datos multi-ómicos y clínicos relacionados con el envejecimiento. No se detalla en la información disponible el número de tokens, la composición exacta del corpus ni si hubo etapas de RLHF o DPO. La innovación destacable de esta versión concreta es la cuantización afín de 8 bits con group size 64, que según el autor es el nivel casi sin pérdida: 8 bits más una escala y un sesgo de 16 bits por cada 64 pesos, exactamente 8,5 bits por peso. El tokenizador, la plantilla de chat y los ajustes de generación son los archivos originales sin modificar.

## Capacidades

- Generación de texto conversacional en inglés, con especialización en biología del envejecimiento.
- Interpretación de datos de longevidad heterogéneos: genómicos, proteómicos y clínicos, según la descripción de la familia Longevity-LLM.
- Razonamiento conmutable mediante plantilla ChatML: el sufijo `/think` produce una traza de razonamiento y `/no_think` fuerza una respuesta directa.
- Respuesta a preguntas sobre biomarcadores clínicos, edad biológica y paneles analíticos (la propia model card usa como ejemplo HbA1c, hs-CRP y edad epigenética).
- Ejecución en dispositivo sobre Apple Silicon mediante MLX, con pesos de 1,16 GiB y sin llamadas a servicios externos.
- Compatibilidad con mlx-lm y LM Studio a través de apply_chat_template.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso orquestado: no disponible; solo se documenta el modo de razonamiento `/think`.
- Capacidades de visión o audio: no disponible (el modelo es solo texto).
- Capacidades multilingües: no, la etiqueta de idioma es únicamente inglés.

## Casos de uso

- Interpretación de paneles clínicos orientados a envejecimiento: el modelo puede recibir valores analíticos (por ejemplo HbA1c, hs-CRP) junto con una estimación de edad epigenética y proponer qué mediciones adicionales tendrían sentido, algo coherente con el ejemplo incluido en su propia model card.
- Asistente biomédico local con datos sensibles: al ejecutarse íntegramente en Apple Silicon con 1,16 GiB de pesos, permite procesar información de cohortes o pacientes sin que los datos salgan del dispositivo, lo que simplifica el cumplimiento de requisitos de privacidad.
- Apoyo a investigación en multi-ómica: resumen y anotación de resultados procedentes de transcriptómica, proteómica o metilación de ADN, integrando varias modalidades en una única respuesta conversacional.
- Formación y divulgación científica: con `/think` se puede obtener la traza de razonamiento para explicar por qué un conjunto de marcadores sugiere una determinada interpretación, útil en material docente o revisiones internas.
- Cribado inicial de hipótesis en longevidad: generación rápida de listas de mecanismos candidatos o de genes y vías relacionadas a partir de una descripción textual, para su posterior validación experimental.
- Prototipado rápido en portátiles de desarrollo: al requerir del orden de 1,2 GiB de pesos cuantizados, cabe en equipos con memoria unificada modesta y permite iterar sobre prompts y plantillas sin infraestructura GPU dedicada.
- Preprocesado y normalización de informes clínicos en inglés: extracción y reformateo de texto libre de historiales hacia estructuras más manejables dentro de un pipeline de investigación.
- Comparación de cohortes descrita en lenguaje natural: el modelo puede resumir diferencias entre grupos de estudio a partir de descripciones textuales, siempre como apoyo y no como conclusión estadística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona el estudio "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., 2026) como trabajo asociado, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ningún benchmark específico de biología del envejecimiento, ni comparaciones numéricas con otros modelos. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- Pesos cuantizados: 1,16 GiB para esta variante de 8 bits; 0,61 GiB para la variante de 4 bits del mismo autor; 2,18 GiB para la fuente en BF16.
- VRAM o memoria unificada estimada: en torno a 1,5-2 GiB en contextos cortos sumando pesos y sobrecarga del runtime; con la ventana completa de 32.768 tokens hay que añadir la caché KV. Como estimación derivada (asumiendo head_dim = 64 a partir de hidden_size 2048 y 32 cabezas de consulta, 6 capas de atención y 8 cabezas KV en FP16), la caché KV ocuparía aproximadamente 12 KiB por token, unos 384 MiB a 32.768 tokens, lo que situaría el total en torno a 2 GiB o algo menos.
- GPU compatibles: no aplica directamente, ya que el formato es MLX y está pensado para Apple Silicon. En hardware NVIDIA habría que partir del checkpoint BF16 en PyTorch, no de estos pesos.
- Cabe en GPU de consumo: sí en el sentido de que cabe en equipos Apple Silicon con memoria unificada de 8 GB o más; se recomienda 16 GB para trabajar con contextos largos y otras aplicaciones abiertas. No se proporcionan datos para GPUs de consumo NVIDIA porque el repositorio no ofrece pesos compatibles con CUDA.
- Opciones de despliegue: mlx-lm (la herramienta usada en la conversión fue mlx-lm 0.31.3) y LM Studio, que carga el motor MLX directamente. vLLM, TGI, llama.cpp y Ollama no son aplicables a estos pesos; para ellos habría que partir del modelo fuente en BF16 y convertir a GGUF u otro formato, conversión que no se publica en este repositorio.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Precision | Licencia |
|---|---|---|---|---|---|
| OpenMed/LFM2-1.2B-Longevity-8bit-mlx (este) | 1,17 B | 32.768 tokens (max_position_embeddings 128.000) | 1,16 GiB | 8 bits afín, group size 64 (8,50 bits/peso) | LFM Open License v1.0 |
| OpenMed/LFM2-1.2B-Longevity-4bit-mlx | 1,17 B | misma arquitectura de origen | 0,61 GiB | 4 bits | LFM Open License v1.0 |
| LiquidAI/LFM2-1.2B-Longevity (fuente) | 1,17 B | 32.768 tokens según la model card de origen | 2,18 GiB | BF16 (16 bits) | LFM Open License v1.0 |
| LiquidAI/LFM2-1.2B (base del ajuste) | 1,17 B | no disponible en la información proporcionada | no disponible | BF16 | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparado con alternativas externas de tamaño similar, por lo que no es posible establecer una comparativa de calidad con modelos de otros proveedores.

## Limitaciones y advertencias

- No es un producto sanitario: la propia model card indica que las salidas son predicciones de un modelo para investigación, no consejo clínico. No debe usarse para diagnóstico ni para decisiones terapéuticas.
- Riesgo de alucinación: al ser un modelo de 1,17 B especializado, puede generar afirmaciones plausibles pero incorrectas sobre genes, vías biológicas o biomarcadores. Requiere verificación contra fuentes primarias.
- Cobertura de idioma limitada: solo inglés. No hay evidencia de competencia en castellano ni en otras lenguas.
- Contexto: existe una discrepancia entre los 32.768 tokens declarados en la model card de origen y los 128.000 de max_position_embeddings. Conviene tratar 32.768 como límite fiable hasta validar el comportamiento real en ventanas mayores.
- Licencia: se distribuye bajo LFM Open License v1.0 con el campo license: other. Es necesario revisar el texto completo del archivo LICENSE antes de cualquier uso comercial, ya que en la información disponible no se detallan sus condiciones.
- Deriva de la cuantización: aunque el autor describe el nivel de 8 bits como casi sin pérdida, no se aportan evaluaciones que cuantifiquen esa pérdida frente al BF16 original.
- Dependencia de plataforma: los pesos son específicos de MLX y solo se ejecutan en Apple Silicon con el stack MLX; no hay GGUF ni pesos PyTorch cuantizados en este repositorio.
- Huella de adopción nula: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, y no se han publicado evaluaciones de terceros.
- Ausencia de benchmarks: no hay métricas verificables de calidad en el dominio ni comparaciones con modelos de tamaño similar, lo que dificulta estimar su utilidad real frente a alternativas generalistas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenMed/LFM2-1.2B-Longevity-8bit-mlx
- Modelo base (checkpoint Longevity en BF16): https://huggingface.co/LiquidAI/LFM2-1.2B-Longevity
- Base del ajuste fino (LFM2-1.2B generalista): https://huggingface.co/LiquidAI/LFM2-1.2B
- Variante de 4 bits del mismo autor: https://huggingface.co/OpenMed/LFM2-1.2B-Longevity-4bit-mlx
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Liquid AI: https://www.liquid.ai
- Insilico Medicine: https://insilico.com
- Estudio asociado: "An Open Benchmark and Language Models for AI in Aging Biology" (Zhavoronkov et al., 2026), citado en la model card sin enlace directo disponible.

Nota: los resultados de búsqueda web recuperados durante la elaboración de esta ficha tratan sobre ganadería bovina y biodiversidad, por lo que no aportan información relevante sobre el modelo y se han descartado.
