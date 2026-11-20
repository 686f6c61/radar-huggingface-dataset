# gatilin/Youtu-LLM-A7B-Base-GGUF

## Resumen

Youtu-LLM-A7B-Base es un modelo de lenguaje y visión de tipo Mixture of Experts (MoE) desarrollado por Tencent, publicado originalmente en formato safetensors y convertido a GGUF por el usuario gatilin. Con aproximadamente 117.600 millones de parámetros totales y unos 7.000 millones activos por token, está diseñado para cargas de trabajo multimodal (image-text-to-text) con un contexto de 262.144 tokens. Su arquitectura combina atención lineal KDA intercalada con GatedMLA, lo que lo sitúa en la categoría de modelos híbridos de atención eficiente.

La relevancia de esta ficha concreta radica en que se trata de una conversión comunitaria a GGUF para llama.cpp, con una escalera de cuantizaciones que va desde Q2_K (40 GiB) hasta bf16 (220 GiB). El modelo utiliza una arquitectura propia (`youtu-moe`) que no está incluida en el llama.cpp upstream, por lo que requiere aplicar un parche específico antes de poder cargar los pesos. Esto condiciona por completo su despliegue en producción.

El modelo soporta inglés y chino, incluye una torre de visión basada en Qwen3-VL-MoE y se distribuye bajo licencia propia `youtu-llm`, lo que obliga a revisar los términos antes de cualquier uso comercial. Es un modelo orientado a investigadores y equipos con hardware de gama alta (96 GiB de memoria unificada o más para la cuantización recomendada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención lineal KDA intercalada con GatedMLA; torre de visión Qwen3-VL-MoE |
| Parametros totales | 117.576.992.896 (~117,6 B) |
| Parametros activos | ~7 B por token (256 expertos enrutados, top-8, más 1 experto compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M (recomendada), Q5_K_M, Q6_K, Q8_0, bf16 (Q5_K_M, Q6_K y Q8_0 validadas pero no publicadas en el repo) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | `youtu-llm` (licencia propia de Tencent, marcada como "other") |
| Formato de pesos | GGUF dividido en shards (`name-NNNNN-of-NNNNN.gguf`); mmproj de visión en f16 (`youtu-vl-mmproj-f16.gguf`, 867 MiB) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 48 capas con dimensión oculta de 3072. Emplea 256 expertos enrutados con activación top-8 más un experto compartido, lo que da lugar a los ~7 B de parámetros activos sobre un total de ~117,6 B. La innovación arquitectónica principal es la atención híbrida: capas de atención lineal KDA (Kernelized/Differential Attention, según la nomenclatura del autor) intercaladas con capas GatedMLA (Multi-head Latent Attention con compuerta), una combinación orientada a reducir el coste computacional y de memoria del contexto largo. La torre de visión proviene de Qwen3-VL-MoE, y el modelo incluye un merger para proyectar las representaciones visuales al espacio del modelo de lenguaje.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones de decodificación especulativa. La model card del GGUF se centra en los aspectos de conversión y cuantización, no en el proceso de entrenamiento del modelo base.

## Capacidades

- Generación de texto en inglés y chino, con soporte de razonamiento multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante la torre de visión Qwen3-VL-MoE y el fichero mmproj asociado.
- Procesamiento de contexto largo: hasta 262.144 tokens, adecuado para documentos extensos o conversaciones prolongadas.
- Modo de razonamiento con etiquetas de pensamiento (`</think>`), observable en los ejemplos de la model card.
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: el contexto de 262.144 tokens permite procesar informes, papers o contratos completos junto con sus figuras, usando el wrapper `<|vision_start|><__media__><|vision_end|>` para insertar imágenes en el prompt.
- Asistente de atención al cliente bilingüe (inglés/chino): el modelo mantiene conversaciones multi-turno con contexto amplio, adecuado para soporte técnico que requiera recordar historial extenso.
- Descripción y etiquetado de imágenes a escala: mediante `llama-mtmd-cli` o el servidor multimodal, se puede automatizar la generación de descripciones para catálogos, accesibilidad o moderación de contenido.
- Investigación en arquitecturas híbridas de atención: al ser un MoE con KDA y GatedMLA, sirve como banco de pruebas para estudiar el comportamiento de atención lineal frente a atención completa en contextos largos.
- Extracción de información de documentos escaneados con texto en chino o inglés: combinando OCR previo y el modelo para estructurar datos, aprovechando el contexto largo para procesar lotes de páginas.
- Despliegue en estaciones de trabajo de gama alta con memoria unificada: con Q4_K_M (66 GiB) cabe en equipos de 96–128 GiB como un Mac Studio o M3 Max de 128 GiB, permitiendo prototipado local sin GPU dedicada.
- Evaluación comparativa de cuantizaciones: la escalera Q2_K–Q8_0 permite estudiar la degradación de calidad en un MoE de 117 B, útil para decidir el punto de equilibrio precisión/memoria en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta mediciones de velocidad de decodificación y pruebas de humo cualitativas:

| Cuantizacion | Hardware | Decodificacion | Observaciones |
|---|---|---|---|
| Q2_K | M3 Max 128 GiB (Metal, `-ngl 99`) | ~10,7 t/s | Respuesta correcta pero más corta |
| Q3_K_M | M3 Max 128 GiB (Metal, `-ngl 99`) | ~9,4 t/s | Respuesta correcta, notablemente más corta |
| Q4_K_M | M3 Max 128 GiB (Metal, `-ngl 99`) | ~14 t/s | Referencia de calidad; prefill ~38 t/s, carga ~20 s |
| Q5_K_M | M3 Max 128 GiB (Metal, `-ngl 99`) | ~5,6–9,4 t/s | Idéntica a Q4_K_M en la prueba de humo |
| Q6_K | M3 Max 128 GiB (Metal, `-ngl 99`) | ~10,2 t/s | Idéntica a Q4_K_M en la prueba de humo |
| Q8_0 | M3 Max 128 GiB (Metal, `-ngl 99`) | — | Error de cómputo por falta de memoria |

## Requisitos de hardware

- VRAM/memoria unificada según cuantización: Q2_K 40 GiB; Q3_K_M 52 GiB; Q4_K_M 66 GiB (recomendada); Q5_K_M 78 GiB; Q6_K 90 GiB; Q8_0 116 GiB; bf16 220 GiB.
- El requisito de memoria viene determinado por el tamaño total de los pesos (~117 B), no por los ~7 B activos.
- Q4_K_M encaja en equipos de 96–128 GiB de memoria unificada (Mac Studio, M3 Max de 128 GiB). Q8_0 no cabe en 128 GiB: verificado fallo con `Error: Compute error.` en un M3 Max de 128 GiB, por lo que el mínimo práctico es 192 GiB.
- Para Q2_K se sugiere 48 GiB de memoria unificada y 64 GiB de RAM.
- GPU dedicadas: no se documentan pruebas en A100, H100 ni RTX 4090. Dado el tamaño, solo configuraciones multi-GPU con suficiente VRAM agregada podrían alojar Q4_K_M o superiores; no hay datos confirmados.
- Despliegue: exclusivamente mediante llama.cpp con el parche `gatilin/llama.cpp-youtu-moe` aplicado sobre el commit `e0f142d5ddc1461ce721644d92af33db23545105`. Binarios implicados: `llama-cli`, `llama-server` y `llama-mtmd-cli` (este último para imagen). No hay soporte en vLLM, TGI, Ollama ni llama.cpp upstream.
- Throughput medido en M3 Max 128 GiB: prefill ~38 t/s y decodificación ~14 t/s con Q4_K_M; carga del modelo ~20 s.
- Los shards deben pasarse apuntando a `-m` al shard 1; llama.cpp carga el resto automáticamente. No concatenar ni renombrar.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Youtu-LLM-A7B-Base (esta ficha, GGUF) | ~117,6 B / ~7 B | 262.144 | Texto + visión | `youtu-llm` (propia) | GGUF comunitario, requiere parche |
| Qwen3-VL-MoE (referencia de la torre de visión) | no disponible | no disponible | Texto + visión | no disponible | no disponible |
| Alternativas MoE de ~100 B con ~7 B activos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con modelos alternativos de la misma categoría. La única referencia cruzada es Qwen3-VL-MoE, del que se reutiliza la torre de visión, pero sin especificaciones publicadas en esta ficha.

## Limitaciones y advertencias

- La arquitectura `youtu-moe` no está en llama.cpp upstream: sin el parche de `gatilin/llama.cpp-youtu-moe`, los ficheros no cargan. Esto ata el despliegue a un fork y a un commit concreto, con el riesgo de mantenimiento que implica.
- La plantilla de chat upstream (`chat_template.jinja`) no tiene rama para imágenes, por lo que para entrada visual hay que pasar el prompt en bruto (sin `--jinja`) y usar el wrapper `<|vision_start|><__media__><|vision_end|>` de forma obligatoria.
- Se observa una etiqueta `</think>` inicial en la salida de texto que debe eliminarse manualmente según la model card.
- Solo se soportan inglés y chino; no hay cobertura documentada de otros idiomas.
- Licencia `youtu-llm` propia de Tencent: es imprescindible revisar el texto en el enlace de licencia antes de cualquier uso comercial; no es una licencia open source estándar.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni benchmarks de veracidad.
- Las cuantizaciones bajas (Q2_K, Q3_K_M) producen respuestas correctas pero notablemente más cortas, lo que sugiere pérdida de capacidad de generación detallada.
- Q8_0 no es viable en 128 GiB de memoria; el umbral práctico es 192 GiB.
- Q5_K_M, Q6_K y Q8_0 están validadas pero no publicadas en el repositorio; requieren abrir una issue para solicitarlas.
- El repo ocupa 410,7 GB y las descargas de shards grandes pueden fallar en conexiones lentas (por eso Q2_K y Q3_K_M se trocean a 2 GiB).
- No hay soporte documentado de tool calling ni de flujos de agente, lo que limita su uso en pipelines automatizados que dependan de function calling.
- El modelo base es `tencent/Youtu-LLM-A7B-Base` en el commit `6b0d02b2912c2975806db5a4922a1e091fa2f5d3`; cualquier actualización del base puede invalidar la conversión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/gatilin/Youtu-LLM-A7B-Base-GGUF
- Modelo base: https://huggingface.co/tencent/Youtu-LLM-A7B-Base
- Licencia: https://huggingface.co/tencent/Youtu-LLM-A7B-Base/blob/main/LICENSE.txt
- Parche de llama.cpp: https://huggingface.co/gatilin/llama.cpp-youtu-moe
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp requerido: `e0f142d5ddc1461ce721644d92af33db23545105`
