# OpenMed/LFM2-1.2B-Longevity-4bit-mlx

## Resumen

LFM2-1.2B-Longevity-4bit-mlx es una conversión cuantizada a 4 bits del modelo LiquidAI/LFM2-1.2B-Longevity, publicada por OpenMed para ejecución nativa en Apple Silicon mediante MLX. El modelo original es un ajuste fino de dominio de LiquidAI/LFM2-1.2B desarrollado conjuntamente por Insilico Medicine y Liquid AI dentro de la familia Longevity-LLM (L-LLM), orientada a interpretar datos heterogéneos de biología del envejecimiento: genómicos, proteómicos y clínicos. Este repositorio concreto no reentrena nada: aplica cuantización afín de solo pesos con `mlx_lm.convert` sobre los pesos BF16 originales y publica el resultado listo para `mlx-lm` y LM Studio.

El interés práctico del checkpoint está en su relación tamaño/capacidad: 1.170.340.608 parámetros (1,17 B) comprimidos en 0,61 GiB de pesos, un 3,6x menos que los 2,18 GiB del BF16 de origen, con 4,50 bits por peso medidos sobre los tensores. Eso permite cargar un modelo de dominio biomédico especializado en un Mac de gama base o en un iPhone, sin GPU dedicada y sin servidor.

Arquitectónicamente es un modelo híbrido de la familia LFM2: combina convoluciones cortas con compuertas y solo 6 capas de atención con grouped-query attention de un total de 16 capas, con 32.768 tokens de contexto declarados en la model card de origen. El prompt usa una plantilla estilo ChatML con un conmutador dinámico de razonamiento (`/think` para traza de razonamiento, `/no_think` para respuesta directa), lo que permite elegir entre latencia mínima y razonamiento explícito en el mismo checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 híbrida (`Lfm2ForCausalLM`): convoluciones cortas con compuertas + 6 capas de grouped-query attention de 16 capas totales |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun la model card de origen (`max_position_embeddings` 128.000) |
| Tipos de cuantizacion | 4 bits afín de solo pesos, group size 64 (`mlx_lm.convert -q --q-bits 4 --q-group-size 64`, mlx-lm 0.31.3); existe variante 8 bits del mismo autor |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, `license: other` en HuggingFace) |
| Formato de pesos | safetensors (MLX), 0,61 GiB; repo completo 0,7 GB |

Datos adicionales: dimension oculta 2048, anchura de feed-forward 12.288, 32 cabezas de consulta / 8 cabezas KV, vocabulario de 65.536 con embeddings de entrada y salida atados. Se mantienen en BF16 las escalas de RMSNorm y los kernels de convolución corta. El tokenizador, la plantilla de chat y los valores por defecto de generación son los ficheros upstream sin modificar. SHA-256 de `model.safetensors`: `d4968839d8c62d8fad070aaadfb6d41eb8b7ed32d0e69e8c5096a12e64b185e2`. Descargas y likes en el momento de la consulta: 0.

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM2 de Liquid AI, descrita en la model card como un diseño híbrido "Liquid": 16 capas en total, de las cuales 10 son convoluciones cortas con compuertas y 6 son capas de atención con grouped-query attention (32 cabezas de consulta frente a 8 cabezas KV). El tamaño oculto es 2048 y la anchura del feed-forward es 12.288, con embeddings de token atados entre entrada y salida y un vocabulario de 65.536 entradas. Esta combinación reduce el coste por token frente a un transformer de atención completa del mismo tamaño, a costa de un sesgo inductivo distinto que puede afectar a tareas de recuperación de contexto muy largo.

El checkpoint Longevity se obtuvo por ajuste fino supervisado de todos los parámetros (full-parameter SFT) de `LiquidAI/LFM2-1.2B` sobre datos multi-ómicos y clínicos relacionados con el envejecimiento. Acompaña al estudio *An Open Benchmark and Language Models for AI in Aging Biology* (Zhavoronkov et al., 2026), que aporta el corpus de entrenamiento y la evaluación según la model card upstream. No se documenta en la información disponible si hubo fases de RLHF o DPO, ni el número exacto de tokens de entrenamiento. La innovación técnica destacable en esta conversión concreta no es arquitectónica sino de despliegue: la cuantización afín de 4 bits con group size 64 aplicada a todas las proyecciones lineales y al embedding atado, dejando en BF16 solo las escalas de normalización y las convoluciones cortas, lo que evita degradar precisamente las capas más sensibles a la cuantización.

## Capacidades

- Generación de texto conversacional en inglés con plantilla ChatML y soporte de rol de sistema.
- Conmutador dinámico de razonamiento: el sufijo `/think` en el turno de usuario activa una traza de razonamiento; `/no_think` fuerza respuesta directa. Es la misma plantilla upstream, incluida en el repositorio.
- Interpretación de datos de biología del envejecimiento: señales genómicas, proteómicas y clínicas, según la descripción del ajuste fino Longevity-LLM.
- Razonamiento sobre paneles clínicos rutinarios y biomarcadores (por ejemplo HbA1c, hs-CRP, edad epigenética frente a edad cronológica), según los ejemplos de la propia model card.
- Contexto de hasta 32.768 tokens, suficiente para concatenar historiales clínicos o resultados multi-ómicos extensos en un único prompt.
- Ejecución en dispositivo: inferencia local en Apple Silicon sin conexión a red.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible; la familia LFM2 incluye otras variantes multimodales, pero este checkpoint no las declara.
- Capacidades multilingües: no; el modelo declara únicamente inglés.

## Casos de uso

- Triaje de paneles clínicos en investigación: introducir un conjunto de biomarcadores de un sujeto (por ejemplo HbA1c, hs-CRP, perfil lipídico) y pedir al modelo una interpretación orientativa y qué medir a continuación. El contexto de 32.768 tokens permite adjuntar el historial completo sin truncar.
- Anotación y resumen de literatura de envejecimiento: procesar abstracts o secciones de artículos sobre edad biológica y generar resúmenes estructurados por vía de señal (genómica, proteómica, clínica).
- Extracción de entidades biomédicas en pipelines de curación: usar el modo `/no_think` para obtener salidas directas y de baja latencia que alimenten un esquema posterior de normalización de términos.
- Asistente de investigación en el portátil: análisis exploratorio de datos multi-ómicos en un Mac, sin enviar datos de pacientes o de cohortes a servicios en la nube, lo que simplifica el cumplimiento de requisitos de confidencialidad.
- Generación asistida de hipótesis en laboratorio: comparar descripciones de fenotipos de envejecimiento acelerado y pedir al modelo que sugiera mecanismos candidatos o vías relacionadas, siempre como material de partida para revisión humana.
- Prototipado rápido de aplicaciones biomédicas en iOS o macOS: por su huella de 0,61 GiB, se puede integrar en una app local que responda a preguntas frecuentes sobre envejecimiento y longevidad para personal investigador.
- Evaluación comparativa de estrategias de cuantización: servir como caso de estudio reproducible de cuantización 4 bits frente a la variante 8 bits y al BF16 de origen, midiendo deriva de calidad en tareas de dominio.
- Educación y divulgación interna: explicar conceptos de edad biológica a audiencias no especializadas dentro de un equipo, con la advertencia explícita de que las salidas no son consejo clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas específicas del dominio de envejecimiento, y tampoco se han encontrado datos de este tipo en la búsqueda web realizada (los resultados devueltos no eran relevantes para el modelo). Para cifras de evaluación hay que remitirse a la model card upstream de `LiquidAI/LFM2-1.2B-Longevity` y al estudio *An Open Benchmark and Language Models for AI in Aging Biology* (Zhavoronkov et al., 2026), que no se han podido consultar en el contexto de esta ficha.

## Requisitos de hardware

- Pesos: 0,61 GiB en el repositorio (4,50 bits por peso medidos). Descarga total del repo: 0,7 GB.
- VRAM/RAM unificada estimada para inferencia: del orden de 1,0-1,3 GiB con contexto corto (pesos + overhead de runtime MLX + caché KV), cifra orientativa calculada a partir del tamaño de pesos y de la geometría de atención, no publicada por el autor.
- Caché KV: con 6 capas de atención, 8 cabezas KV y dimensión de cabeza 64, el coste aproximado es de unos 12 KiB por token, es decir alrededor de 384 MiB a los 32.768 tokens de contexto completo. Es una estimación derivada de la configuración, no un dato de la model card.
- GPU compatibles: no aplica en sentido estricto; este repositorio es específico de MLX y está pensado para Apple Silicon (chips de la serie M). No se ha validado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon, incluidos equipos de gama base con memoria unificada de 8 GB. No se distribuye en formato GGUF ni para GPUs NVIDIA en este repositorio.
- Opciones de despliegue: `mlx-lm` (CLI `mlx_lm.generate` y API de Python con `load`/`generate`) y LM Studio con su motor MLX. No se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama para este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta conversión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenMed/LFM2-1.2B-Longevity-4bit-mlx (este) | 1,17 B | 32.768 tokens | 4 bits afín, group size 64 | safetensors MLX, 0,61 GiB | LFM Open License v1.0 | HuggingFace, 0 descargas |
| OpenMed/LFM2-1.2B-Longevity-8bit-mlx | 1,17 B | 32.768 tokens | 8 bits afín | safetensors MLX, 1,16 GiB | LFM Open License v1.0 | HuggingFace |
| LiquidAI/LFM2-1.2B-Longevity | 1,17 B | 32.768 tokens | BF16 sin cuantizar | safetensors PyTorch, 2,18 GiB | LFM Open License v1.0 | HuggingFace |
| LiquidAI/LFM2-1.2B | 1,17 B | 32.768 tokens (misma familia) | BF16 | safetensors | LFM Open License v1.0 | HuggingFace |

La comparativa relevante es interna a la familia: las tres variantes comparten parámetros, contexto y licencia, y difieren solo en el equilibrio entre huella de memoria y fidelidad numérica. El 4 bits ofrece 0,61 GiB (3,6x menos que el BF16) y es la opción para memoria muy limitada; el 8 bits (1,16 GiB) es el punto intermedio razonable si la calidad del dominio importa más que el espacio. No se dispone de comparaciones publicadas frente a otros modelos biomédicos compactos en la información proporcionada.

## Limitaciones y advertencias

- Las salidas son predicciones de un modelo para investigación, no consejo clínico. No deben usarse para diagnóstico, tratamiento ni decisiones sobre pacientes.
- Riesgo de alucinación relevante en un dominio de alta consecuencia como la biomedicina: el modelo puede generar biomarcadores, referencias o relaciones mecanísticas plausibles pero inexistentes.
- Cuantización de 4 bits: la propia model card no publica evaluación comparativa de degradación frente al BF16 o al 8 bits, por lo que el impacto real en tareas de dominio es desconocido.
- Modelo monolingüe en inglés: no se ha entrenado ni validado para castellano, por lo que su uso en español no está respaldado.
- Dominio estrecho: el ajuste está especializado en biología del envejecimiento; fuera de ese ámbito su comportamiento es el de un modelo de 1,17 B sin garantías.
- Contexto declarado de 32.768 tokens, aunque `max_position_embeddings` sea 128.000: no debe asumirse que el rendimiento se mantenga más allá de los 32.768 tokens indicados en la model card upstream.
- Licencia LFM Open License v1.0: es una licencia con condiciones, no una licencia de código abierto permisiva estándar. Antes de cualquier uso comercial es obligatorio revisar el fichero LICENSE incluido y verificar los términos aplicables, incluidos posibles requisitos de atribución o restricciones de uso.
- Ausencia de validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y se publicó en septiembre de 2026. No hay evidencia independiente de calidad.
- Compatibilidad limitada: al ser un artefacto MLX, no se puede cargar directamente en runtimes CUDA ni en herramientas que esperen GGUF.
- Las fechas de creación y actualización del repositorio son del 20 de septiembre de 2026, apenas un minuto de diferencia entre ambas, lo que sugiere una publicación automatizada sin iteración posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenMed/LFM2-1.2B-Longevity-4bit-mlx
- Modelo base (BF16, PyTorch): https://huggingface.co/LiquidAI/LFM2-1.2B-Longevity
- Modelo preentrenado de partida: https://huggingface.co/LiquidAI/LFM2-1.2B
- Variante 8 bits del mismo autor: https://huggingface.co/OpenMed/LFM2-1.2B-Longevity-8bit-mlx
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Liquid AI: https://www.liquid.ai
- Insilico Medicine: https://insilico.com
- Estudio de referencia citado en la model card: *An Open Benchmark and Language Models for AI in Aging Biology* (Zhavoronkov et al., 2026). No se ha podido localizar el enlace directo en la búsqueda web realizada; los resultados devueltos correspondían a páginas de seguimiento de envíos de FedEx y no guardaban relación con el modelo.
