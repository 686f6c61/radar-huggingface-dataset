# m9ter1a/d1-omni-600M-GGUF

## Resumen
d1-omni-600M es un modelo de decisión multimodal desarrollado por Liquid AI. Responde preguntas tipadas (`noul`, `choice`, `score`) sobre un estado que puede incluir texto, JSON, imágenes o audio, y devuelve probabilidades calibradas en una sola pasada forward, sin generar tokens. El modelo base tiene 380.732.161 parámetros reales (comercialmente 600M) y está orientado a tareas de decisión en el borde. La cuantización GGUF aquí presentada, obra de m9ter1a, emplea una matriz de importancia calibrada sobre prompts de decisión para preservar mejor las respuestas. Es relevante porque permite ejecutar un modelo multimodal de decisión en hardware muy limitado, con archivos que bajan de 250 MB, manteniendo un acuerdo Top-1 superior al 90% en cuantizaciones de 4 bits.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de decisión multimodal (detalles internos no disponibles) |
| Parámetros totales | 380.732.161 según safetensors; el nombre comercial indica 600M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M; referencia BF16 de LiquidAI |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (llama.cpp); el modelo base también en safetensors |
| Modelo base | LiquidAI/d1-omni-600M |
| Desarrollador original | Liquid AI |
| Cuantizador | m9ter1a |

## Arquitectura y entrenamiento
No se dispone de detalles sobre la arquitectura interna ni el proceso de entrenamiento en la información proporcionada. Se sabe que es un modelo de decisión multimodal que responde a preguntas tipadas sobre un estado (texto, JSON, imágenes o audio) en una sola pasada forward, sin generar tokens, y que devuelve probabilidades calibradas. El modelo base es LiquidAI/d1-omni-600M, desarrollado por Liquid AI. La cuantización GGUF ha sido realizada por m9ter1a con una matriz de importancia (imatrix) calibrada sobre prompts de decisión, lo que mejora la preservación de las decisiones frente a cuantizaciones sin imatrix: según las mediciones del autor, reduce las decisiones cambiadas entre un 19% y un 27% y la KL entre un 19% y un 27% para Q6_K, Q5_K_M y Q4_K_M. Se desconoce el número de tokens de entrenamiento, la composición del dataset y si se emplearon técnicas como RLHF o DPO.

## Capacidades
- Responde preguntas tipadas: `noul` (sí/no), `choice` (elección entre opciones) y `score` (puntuación en escala ordenada).
- Procesa entradas multimodales: texto con imagen, o texto con audio.
- Devuelve probabilidades calibradas y la opción ganadora, sin generar texto.
- No soporta generación de texto, código, matemáticas ni razonamiento multi-paso en el sentido de los modelos generativos.
- No se documenta soporte de tool calling, function calling ni agentes.
- El tag `feature-extraction` sugiere que puede usarse para extraer características, aunque no se detalla.
- Idiomas: no especificados en la información disponible.

## Casos de uso
- Moderación de contenido: dado un texto y una imagen, decidir si cumplen las normas (`noul`) o puntuar su toxicidad (`score`). Adecuado por su capacidad multimodal y probabilidades calibradas, que permiten fijar umbrales de decisión.
- Enrutamiento de consultas en atención al cliente: decidir si una consulta (texto más posible imagen) debe ir a un agente humano, a un bot o a un departamento específico (`choice`). El bajo coste de inferencia permite integrarlo en el front-end de atención.
- Evaluación de calidad en anotación: puntuar respuestas generadas por otros modelos en una escala ordenada (`score`) para filtrar datos de entrenamiento. La calibración de las probabilidades ayuda a descartar ejemplos dudosos.
- Detección de intención con audio: en asistentes de voz, combinar el audio del usuario con una transcripción para decidir la intención (`choice`) o si se necesita confirmación (`noul`). La entrada de audio nativa evita depender solo de ASR.
- Verificación de hechos simple: dado un contexto y una afirmación, decidir si la afirmación está respaldada (`noul`) con una probabilidad calibrada, útil en pipelines de RAG para descartar respuestas no fundamentadas.
- Control de acceso multimodal: verificar si una imagen de documento y un texto de identificación coinciden (`noul`) para autorizar una acción. La decisión en una sola pasada reduce la latencia frente a pipelines generativos.
- Recomendación binaria: decidir si mostrar un anuncio o contenido a un usuario según su estado (texto e imagen) (`noul`). Las probabilidades calibradas permiten ajustar el umbral según la política de negocio.
- Triaje preliminar: con una descripción textual y una imagen, decidir si un caso requiere atención urgente (`choice` o `score`). No es un dispositivo médico; su uso sería solo orientativo y bajo supervisión.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor de la cuantización proporciona métricas específicas de acuerdo Top-1, drift y KL sobre un conjunto de 1.111 decisiones repartidas en 295 estados retenidos y tres tipos de pregunta (`noul`, `choice`, `score`). La referencia es el GGUF BF16.

| Archivo | Tamaño | Acuerdo Top-1 | Decisiones cambiadas | Drift | KL |
|---|---|---|---|---|---|
| BF16 — referencia, LiquidAI | 764,0 MB | 100,0% | 0 | 0,0000 | 0,00000 |
| Q8_0 — LiquidAI | 407,2 MB | 98,5% | 17 | 0,0128 | 0,00099 |
| Q6_K | 315,0 MB | 97,3% | 30 | 0,0241 | 0,00363 |
| Q5_K_M | 279,9 MB | 95,3% | 52 | 0,0426 | 0,01141 |
| Q4_K_M | 246,8 MB | 91,0% | 100 | 0,0732 | 0,03121 |
| IQ4_XS | 224,4 MB | 90,1% | 110 | 0,0801 | 0,03798 |
| IQ3_M | 196,2 MB | 82,2% | 198 | 0,1399 | 0,10438 |

El daño no se reparte por igual entre tipos de pregunta. Las escalas ordenadas (`score`) se degradan entre dos y cuatro veces más rápido que las de sí/no (`noul`):

| Archivo | `choice` | `noul` | `score` |
|---|---|---|---|
| Q8_0 — LiquidAI | 98,7% | 99,3% | 97,3% |
| Q6_K | 97,7% | 99,3% | 94,6% |
| Q5_K_M | 95,0% | 97,6% | 93,6% |
| Q4_K_M | 92,7% | 95,3% | 83,7% |
| IQ4_XS | 91,0% | 93,2% | 85,4% |
| IQ3_M | 87,1% | 88,1% | 67,5% |

## Requisitos de hardware
- VRAM estimada para inferencia: entre 196,2 MB (IQ3_M) y 407,2 MB (Q8_0) para los pesos, más el overhead del contexto y de llama.cpp. En la práctica, menos de 1 GB para cuantizaciones de 4 a 6 bits.
- GPU recomendadas: cualquier GPU consumer, incluidas integradas, e incluso CPU. No requiere GPU dedicada.
- Cabe en cualquier GPU consumer y en dispositivos de borde; el modelo base d1-3B, según Liquid AI, responde en 8 ms en una NVIDIA GeForce RTX, pero no se ha publicado la cifra concreta para d1-omni-600M.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama y otros servidores compatibles con GGUF. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles para esta cuantización específica.

## Comparativa con modelos similares
La comparación más directa es con las cuantizaciones publicadas por AtomicChat para el mismo modelo base, usando el mismo conjunto de evaluación y referencia. En la tabla se muestran los archivos equivalentes:

| Archivo | Tamaño | Acuerdo Top-1 | Drift | KL |
|---|---|---|---|---|
| AtomicChat AD-Q6_K | 346,8 MB | 96,9% | 0,0200 | 0,00252 |
| Q6_K (este repo) | 315,0 MB | 97,3% | 0,0241 | 0,00363 |
| AtomicChat AD-Q5_K_M | 292,8 MB | 94,3% | 0,0410 | 0,01001 |
| Q5_K_M (este repo) | 279,9 MB | 95,3% | 0,0426 | 0,01141 |
| AtomicChat AD-Q4_K_M | 255,6 MB | 92,0% | 0,0581 | 0,02007 |
| Q4_K_M (este repo) | 246,8 MB | 91,0% | 0,0732 | 0,03121 |

A igualdad de tamaño, los archivos de este repositorio están 1,8 a 1,9 puntos por delante en acuerdo Top-1 en 5 y 6 bits, pero las cuantizaciones de AtomicChat tienen mejor calibración (menor KL y drift) en todos los tamaños. En 4 bits, AtomicChat lidera en Top-1. Como alternativa de la misma familia, d1-3B (3B parámetros) obtiene 48,57 en el Decision Index v0.2.1 (split público), pero no se dispone de datos de contexto ni de licencia para comparar directamente.

## Limitaciones y advertencias
- No genera texto: solo devuelve probabilidades y una opción ganadora. No es apto para tareas de generación, código o matemáticas.
- Riesgo de alucinación: al ser un modelo de decisión, puede producir probabilidades mal calibradas en dominios fuera de distribución, lo que llevaría a decisiones erróneas.
- Sesgos conocidos: no hay información sobre sesgos en la documentación proporcionada.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada.
- Idiomas: no se especifican los idiomas soportados; no hay garantía de rendimiento multilingüe.
- Licencia: lfm1.0 (etiquetada como "other"). Se deben consultar las restricciones comerciales de la licencia LFM 1.0 antes de usar en producción.
- Las cuantizaciones muy bajas (IQ3_M) degradan significativamente las decisiones (82,2% de acuerdo Top-1) y no se recomiendan para producción.
- Las preguntas de tipo `score` se degradan antes que las de sí/no; para aplicaciones de puntuación ordenada se recomienda no bajar de Q5_K_M.
- El repositorio tiene 0 descargas y 0 likes; es una cuantización reciente y no validada por la comunidad.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/m9ter1a/d1-omni-600M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- GGUF de LiquidAI: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF
- GGUF de AtomicChat: https://huggingface.co/AtomicChat/d1-omni-600M-GGUF
- GGUF de TechnoBaptist: https://huggingface.co/TechnoBaptist/d1-omni-600M-GGUF
- Blog de Liquid AI sobre d1: https://www.liquid.ai/blog/d1-open
- Blog de Liquid AI sobre el modelo de decisión: https://www.liquid.ai/blog/d1-decision-model
- Artículo de MarkTechPost: https://www.marktechpost.com/2026/10/07/liquid-ai-releases-open-weight-d1-3b-and-d1-omni-600m-multimodal-decision-models-with-zero-output-tokens/
