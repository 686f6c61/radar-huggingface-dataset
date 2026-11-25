# mradermacher/idcard-7b-GGUF

## Resumen

`idcard-7b-GGUF` es la versión cuantizada en formato GGUF del modelo `orkungedik/idcard-7b`, publicada por el usuario mradermacher, conocido por distribuir cuantizaciones estáticas de modelos abiertos. El modelo base es un transformer de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) construido sobre la arquitectura Qwen2.5-VL, según indican las etiquetas del repositorio, lo que implica capacidades multimodales (texto e imagen). La licencia declarada es Apache 2.0 y el único idioma documentado es el inglés.

El interés de esta ficha reside en que ofrece el modelo en múltiples niveles de cuantización GGUF (desde Q2_K de 3,1 GB hasta f16 de 15,3 GB), lo que permite desplegarlo en hardware de consumo con llama.cpp u Ollama. El repositorio incluye además ficheros `mmproj` (Q8_0 y f16) necesarios para la parte multimodal, un detalle poco habitual en cuantizaciones estáticas y que confirma el carácter visión-lenguaje del modelo base.

La información pública disponible es escasa: no se documentan datos de entrenamiento, benchmarks ni detalles del proceso de ajuste del modelo base. Esta ficha refleja únicamente lo que puede verificarse a partir de los metadatos y la model card del repositorio, señalando explícitamente los apartados sin datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5-VL (multimodal texto-imagen) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base `orkungedik/idcard-7b` emplea la arquitectura Qwen2.5-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. El repositorio etiqueta el modelo con `qwen2_5_vl` y `unsloth`, lo que sugiere que el ajuste se realizó con las herramientas de Unsloth sobre una base Qwen2.5-VL de 7B. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La aportación de esta publicación concreta es la cuantización: se ofrecen cuantizaciones estáticas (no imatrix) generadas con llama.cpp, junto con los ficheros `mmproj` que permiten cargar el proyector multimodal en Q8_0 o f16. El autor indica que no tiene previsto publicar cuantizaciones ponderadas/imatrix por el momento. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-VL.
- Procesamiento de imágenes: los ficheros `mmproj` habilitan la entrada visual junto con texto.
- Razonamiento y respuesta a instrucciones (se infiere del ajuste tipo instruct, aunque no se documenta explícitamente).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Extracción de datos de documentos escaneados: el modelo puede recibir una imagen de un documento (por ejemplo, un DNI o una factura) y devolver texto estructurado, aprovechando el codificador visual de Qwen2.5-VL y los ficheros `mmproj` incluidos.
- Clasificación y descripción de imágenes en local: con la cuantización Q4_K_M (4,8 GB) puede ejecutarse en una GPU de consumo para tareas de etiquetado o generación de descripciones en inglés.
- Asistente conversacional de ámbito restringido: al ser un modelo de 7B ajustado, es adecuado para prototipos de chat en inglés donde el coste de inferencia importa más que el rendimiento puntero.
- Procesamiento por lotes en CPU: las cuantizaciones Q2_K (3,1 GB) y Q3_K_S (3,6 GB) permiten ejecutar el modelo en servidores sin GPU mediante llama.cpp, útil para tareas de extracción de texto a gran escala.
- Integración en aplicaciones de escritorio: al distribuirse en GGUF, puede embeberse en herramientas locales tipo Ollama o LM Studio para funcionalidades de OCR asistido o Q&A sobre capturas de pantalla.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce niveles de cuantización más dos variantes de `mmproj`, lo que lo hace útil para medir la degradación de calidad frente al tamaño en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB con Q4_K_M, 6-7 GB con Q6_K, 8-9 GB con Q8_0 y en torno a 15-16 GB con f16 (más el espacio del proyector multimodal, 1,0-1,5 GB adicionales).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 para f16 y despliegues concurrentes.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en tarjetas con 8-12 GB de VRAM; la variante f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; para la parte multimodal es necesario un runtime que soporte `mmproj` (llama.cpp reciente).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| idcard-7b-GGUF (este) | 7,6B | no disponible | Sí (Qwen2.5-VL) | Apache 2.0 | GGUF |
| Qwen2.5-VL-7B-Instruct | 7,6B | no disponible en esta ficha | Sí | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Instruct | 8B | 128K | No | Llama 3.1 Community | safetensors, GGUF |
| Mistral 7B Instruct | 7,2B | 32K | No | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen2.5-VL-7B-Instruct es la más directa, dado que el modelo base deriva de esa familia; sin embargo, no se dispone de datos que permitan afirmar qué modificaciones introduce el ajuste de `orkungedik`. Frente a Llama 3.1 8B y Mistral 7B, la diferencia principal es la capacidad multimodal, ausente en ambos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5-VL, hereda los sesgos del corpus de entrenamiento original, no especificados.
- Riesgo de alucinación: no cuantificado; como todo modelo de 7B, es propenso a inventar detalles en tareas de extracción visual o factual.
- Limitaciones de contexto e idioma: solo se documenta inglés; la longitud de contexto no está publicada y conviene verificarla antes de usarlo con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base `orkungedik/idcard-7b` por si añade condiciones adicionales.
- Caveat de producción: las cuantizaciones estáticas (no imatrix) pueden degradar más la calidad que las ponderadas en niveles bajos (Q2_K, Q3_K); el autor no planea publicar imatrix a corto plazo.
- El modelo tiene muy poca tracción (89 descargas, 0 likes) y no hay evidencia de validación independiente; no se recomienda para producción sin evaluación propia.
- La fecha de actualización del repositorio (2026-11-25) es posterior a la de creación (2025-06-10); verificar que los ficheros no hayan cambiado respecto a la documentación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/idcard-7b-GGUF
- Modelo base: https://huggingface.co/orkungedik/idcard-7b
- Página de descargas del autor: https://hf.tst.eu/model#idcard-7b-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
