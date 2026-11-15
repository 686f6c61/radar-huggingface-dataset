# iapp/OpenThai-SystemOne-bnb-4bit

## Resumen

OpenThai-SystemOne es un modelo de decisión de tipo "System One" desarrollado por iApp (parte de la familia OpenThai, anteriormente OpenThaiGPT) y presentado junto con AIEAT. A diferencia de los modelos generativos convencionales, no produce texto: recibe una pregunta tipada y un estado textual o JSON, y devuelve una respuesta con probabilidades calibradas en una sola pasada hacia delante. Resuelve el problema de clasificar, puntuar o validar información de forma determinista y eficiente, sin coste de decodificación autoregresiva.

Arquitectura y entrenamiento: el modelo parte de una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandés, a la que se añade una cabeza de decisión de 256 ranuras. Soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `score` (ordinal) y `noul` (sí/no). El repositorio que nos ocupa es la cuantización de 4 bits (NF4 con doble cuantización) de la versión v0.3, lo que reduce el peso de 1.509 MB a 767 MB manteniendo la precisión casi intacta.

Es relevante ahora porque ofrece una alternativa ligera y desplegable en GPU de consumo para tareas de evaluación estructurada en tailandés e inglés, con licencia Apache-2.0 y una degradación de precisión mínima respecto al original en bf16 (macro pública 73,6 frente a 74,3; macro tailandesa 79,7 frente a 80,1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto Qwen3.5-0.8B) + cabeza de decisión de 256 ranuras |
| Parametros totales | 752.674.883 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bitsandbytes NF4 4-bit con doble cuantización (solo capas Linear; embeddings, cabeza y temperaturas en bf16) |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint bitsandbytes, cuantizado en memoria GPU CUDA) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 752 millones de parámetros construido sobre una torre de texto Qwen3.5-0.8B sometida a preentrenamiento continuado en tailandés. Sobre la representación del último token se conecta una cabeza de decisión de 256 ranuras que emite logits para cada opción o nivel, junto con temperaturas por tipo de pregunta que permiten calibrar las probabilidades. La inferencia es de una sola pasada: no hay generación de tokens ni decodificación especulativa.

La cuantización afecta únicamente a las capas Linear de la torre; los embeddings de tokens, la cabeza de decisión de 256 ranuras y las temperaturas por tipo permanecen en bf16. Esto implica que la cuantización solo perturba el estado oculto que lee la cabeza, lo que explica la baja degradación observada. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación de opciones múltiples (`choice`) con hasta 255 opciones por pregunta.
- Puntuación ordinal (`score`) con niveles definidos por el usuario.
- Validación binaria sí/no (`noul`).
- Salida de probabilidades calibradas mediante temperaturas específicas por tipo de pregunta.
- Procesamiento de estados de entrada en texto libre o JSON.
- Soporte bilingüe tailandés-inglés.
- Integración con `transformers` mediante `trust_remote_code` y con el paquete `openthai_systemone` (cliente `SystemOneClient`).
- Sin generación de texto: no hay soporte de tool calling, agentes ni razonamiento multi-paso en el sentido generativo.
- No dispone de capacidades de visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas tailandesas: el modelo clasifica la opinión en categorías como positiva, negativa o neutra mediante preguntas `choice`, como se muestra en el ejemplo de la model card con una reseña de restaurante.
- Moderación de comentarios: uso de preguntas `noul` para determinar si un texto cumple políticas de contenido, apoyándose en los resultados del subconjunto civil_comments (81,0 de precisión en esta cuantización).
- Enrutamiento de intenciones en asistentes conversacionales: clasificación de la intención del usuario entre un conjunto acotado de opciones (`choice`) en tailandés, con resultados de 90,5 en massive_th.
- Evaluación de consistencia y relevancia de resúmenes: preguntas `score` para puntuar resúmenes generados, con datos de summeval-consistency (73,6) y summeval-relevance (26,2).
- Detección de similitud semántica de pares de frases: preguntas `noul` para tareas de paráfrasis, con 92,8 en paws.
- Clasificación de intenciones bancarias: preguntas `choice` sobre consultas de clientes, con 58,2 en banking77.
- Verificación de respuesta a preguntas: preguntas `noul` para determinar si una respuesta es correcta dado un contexto, con 87,0 en squad2.
- Extracción de etiquetas de herramientas: preguntas `choice` para identificar la herramienta adecuada en un flujo, con 99,4 en xlam_tools.

## Benchmarks y rendimiento

Resultados de precisión (exactitud de opción única) sobre los primeros 800 registros de cada conjunto, comparando la cuantización con el original en bf16:

| Subconjunto | bf16 original | Esta cuantización | Δ |
|---|---|---|---|
| **Banco público de 13 subconjuntos** | | | |
| aegis2 (noul) | 83,2 | 82,8 | -0,4 |
| boolq (noul) | 79,7 | 78,7 | -1,0 |
| civil_comments (noul) | 79,0 | 81,0 | +2,0 |
| helpsteer2 (score) | 41,6 | 42,8 | +1,2 |
| massive-de-DE (choice) | 88,3 | 85,7 | -2,6 |
| massive-en-US (choice) | 88,3 | 86,3 | -2,0 |
| multinli (choice) | 89,0 | 87,0 | -2,0 |
| paws (noul) | 94,0 | 92,8 | -1,2 |
| pubmedqa (choice) | 64,0 | 62,8 | -1,2 |
| squad2 (noul) | 89,3 | 87,0 | -2,3 |
| summeval-consistency (score) | 75,0 | 73,6 | -1,4 |
| summeval-relevance (score) | 21,7 | 26,2 | +4,6 |
| vitaminc-dev (choice) | 72,5 | 69,8 | -2,7 |
| *Macro, banco público* | *74,3* | *73,6* | *-0,7* |
| **Conjuntos tailandeses** | | | |
| banking77 (choice) | 59,1 | 58,2 | -0,9 |
| contrastive_th (choice) | 80,7 | 79,7 | -1,0 |
| contrastive_th (noul) | 83,5 | 81,9 | -1,6 |
| contrastive_th (score) | 78,6 | 82,1 | +3,6 |
| massive_th (choice) | 90,6 | 90,5 | -0,1 |
| prachathai (choice) | 98,3 | 98,8 | +0,5 |
| prachathai (noul) | 93,4 | 93,4 | +0,0 |
| sib200_th (choice) | 77,9 | 75,0 | -2,9 |
| wisesight (choice) | 48,9 | 49,5 | +0,6 |
| wongnai (score) | 64,5 | 63,9 | -0,6 |
| xlam_tools (choice) | 99,4 | 99,4 | +0,0 |
| xnli_th (choice) | 79,8 | 77,9 | -1,9 |
| xnli_th (noul) | 86,8 | 86,2 | -0,5 |
| *Macro, tailandés* | *80,1* | *79,7* | *-0,4* |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 752 millones de parámetros en 4 bits, el peso ocupa aproximadamente 767 MB; con overhead de activaciones y contexto, se estima un uso de VRAM en torno a 1,5-2 GB en GPU.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 2-3 GB de VRAM; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, dado el reducido tamaño del checkpoint.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, el paquete `openthai_systemone` (cliente `SystemOneClient`) y bitsandbytes para la carga cuantizada. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne-bnb-4bit | 752,7 M | No disponible | Macro pública 73,6; tailandesa 79,7 | Apache-2.0 | Hugging Face |
| OpenThai-SystemOne (bf16) | 752,7 M | No disponible | Macro pública 74,3; tailandesa 80,1 | Apache-2.0 | Hugging Face |
| Alternativas de clasificación tailandesas | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (modelos de decisión System One bilingües tailandés-inglés) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: no es adecuado para tareas de generación, resumen libre, diálogo abierto ni razonamiento multi-paso.
- La cuantización solo afecta a las capas Linear; la precisión se degrada ligeramente respecto al original (entre -2,9 y +4,6 puntos según subconjunto), con mayor pérdida en sib200_th (-2,9) y vitaminc-dev (-2,7).
- El rendimiento en algunos conjuntos es bajo: summeval-relevance (26,2), helpsteer2 (41,6) y wisesight (48,9), lo que sugiere limitaciones en tareas de relevancia y sentimiento fino.
- Solo soporta tailandés e inglés; no se garantiza comportamiento en otros idiomas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar dicho código antes de usarlo en producción.
- La carga cuantizada requiere bitsandbytes y una GPU CUDA; no se menciona soporte para CPU.
- Riesgo de sesgos y alucinación: no se documentan análisis específicos de sesgo en la información disponible; al ser un modelo de clasificación, el riesgo de alucinación se manifiesta como calibración incorrecta de probabilidades en entradas fuera de distribución.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-bnb-4bit
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio del paquete: https://github.com/iapp-technology/openthai-systemone
