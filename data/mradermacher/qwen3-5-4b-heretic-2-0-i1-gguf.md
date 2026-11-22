# mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF

## Resumen

Qwen3.5-4B-heretic-2.0-i1-GGUF es una distribución de cuantizaciones GGUF generadas por mradermacher a partir del modelo p-e-w/Qwen3.5-4B-heretic-2.0, una variante "abliterated" (descensurada) del Qwen3.5-4B de Alibaba. El modelo base parte de la arquitectura Qwen3.5 de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y ha sido modificado mediante técnicas de abliteration para eliminar los mecanismos de rechazo alineados, manteniendo el resto de capacidades del modelo original.

El paquete incluye cuantizaciones estáticas (Q2_K a Q6_K) y cuantizaciones con imatrix (i1-*), que emplean una matriz de importancia para preservar mejor la calidad en tasas de compresión agresivas. El rango abarca desde 1,5 GB (IQ1_S) hasta 3,6 GB (Q6_K), lo que permite ejecutar el modelo en GPUs de consumo con 4-8 GB de VRAM.

La relevancia de esta ficha radica en que combina un modelo compacto de última generación con una variante sin censura, orientada a investigación sobre alineación, generación creativa sin restricciones y despliegue local. La licencia es Apache 2.0 según la model card, aunque conviene verificar las condiciones del modelo base original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, detalles no disponibles) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no es MoE según los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (estáticas e i1/imatrix) |
| Idiomas soportados | en (inglés; según model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5 de Alibaba, con 4.205.751.296 parámetros. Sobre él se aplicó la técnica de abliteration (identificación y supresión de la dirección de rechazo en el espacio de activaciones) para producir la variante "heretic-2.0", que elimina las respuestas de negativa ante peticiones consideradas sensibles. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

Las cuantizaciones aquí publicadas son de dos tipos: estáticas (Q2_K a Q6_K, generadas con el pipeline estándar de llama.cpp) y con imatrix (prefijo i1-), que utilizan una matriz de importancia calculada sobre un corpus de calibración para asignar más bits a los tensores más sensibles. Según las notas del autor, las cuantizaciones IQ de tamaño similar suelen superar a las Q equivalentes; por ejemplo, IQ3_S "beats Q3_K*" e IQ4_XS es preferible a IQ4_NL. No se documentan innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y respuesta a instrucciones heredadas del Qwen3.5-4B base.
- Generación de código y matemáticas (capacidades del modelo base, sin benchmarks publicados en esta ficha).
- Modo sin censura: responde a peticiones que el modelo original rechazaría, gracias a la abliteration.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card (language: en).
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM tras eliminar la dirección de rechazo, comparando respuestas con el Qwen3.5-4B original en experimentos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas adultas o controvertidas, donde el modelo base aplicaría filtros.
- Despliegue local en hardware modesto: con cuantizaciones de 2,7-3,2 GB (Q4_K_S, Q4_K_M, Q5_K_M) cabe en GPUs de consumo de 6-8 GB y permite inferencia offline sin dependencia de APIs.
- Prototipado rápido de chatbots: el formato GGUF es compatible con llama.cpp, Ollama y servidores compatibles con la API de OpenAI (tag endpoints_compatible), lo que facilita integrarlo en aplicaciones existentes.
- Red teaming y evaluación de robustez: útil para generar prompts adversarios y estudiar cómo responde un modelo sin salvaguardas, informando el diseño de filtros en producción.
- Experimentos de cuantización: la disponibilidad de 25 variantes (estáticas e imatrix) permite medir el impacto de la compresión en perplejidad y calidad para investigación en eficiencia de inferencia.
- Fine-tuning ligero sobre base descensurada: sirve como punto de partida para ajustes específicos de dominio sin arrastrar los sesgos de rechazo del modelo alineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): ~1,5 GB (IQ1_S/IQ1_M), ~1,8 GB (IQ2_M), ~2,2 GB (IQ3_S/IQ3_XS), ~2,7-2,8 GB (Q4_K_S/Q4_K_M), ~3,2 GB (Q5_K_M), ~3,6 GB (Q6_K).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100, H100 (cualquiera con ≥4 GB de VRAM para cuantizaciones bajas).
- Cabe en GPU de consumo: sí, desde GPUs de 4 GB (IQ2/IQ3) hasta 8 GB con margen para contexto (Q4_K_M, Q5_K_M). En 6 GB conviene Q4_K_S o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con endpoints OpenAI (tag endpoints_compatible), llama-cpp-python.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa, un modelo de 4B en Q4_K_M suele generar decenas de tokens por segundo en GPUs de consumo modernas, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-2.0-i1-GGUF (este) | ~4,2 B | no disponible | apache-2.0 | GGUF (25 cuants) | Variante abliterated, solo inglés |
| p-e-w/Qwen3.5-4B-heretic-2.0 (base) | ~4,2 B | no disponible | apache-2.0 | safetensors | Modelo fuente sin cuantizar |
| Qwen/Qwen3.5-4B (original) | ~4,2 B | no disponible | apache-2.0 | safetensors | Modelo alineado con rechazos |
| mradermacher/Qwen3.5-4B-heretic-2.0-GGUF | ~4,2 B | no disponible | apache-2.0 | GGUF (estáticas) | Cuantizaciones sin imatrix |

## Limitaciones y advertencias

- Modelo descensurado: la abliteration elimina los rechazos, por lo que puede generar contenido ofensivo, peligroso o ilegal. No apto para despliegue público sin filtros externos.
- Riesgo de alucinación: como todo LLM de 4B, la precisión factual es limitada; la abliteration puede agravar la confianza en respuestas incorrectas.
- Idioma: la model card solo declara inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Contexto: no se documenta la longitud de contexto soportada; conviene validarla empíricamente antes de usos con documentos largos.
- Licencia: apache-2.0 según la model card, pero se enlaza a la licencia del Qwen3.5-4B original; verificar compatibilidad para uso comercial, especialmente por la modificación abliterated.
- Cuantizaciones muy bajas (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Sin benchmarks publicados: no hay evidencia cuantitativa del impacto de la abliteration en MMLU, HumanEval u otras tareas.
- Sin garantías de soporte: es una cuantización comunitaria, no oficial de Alibaba ni de Qwen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-2.0-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/p-e-w/Qwen3.5-4B-heretic-2.0
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-2.0-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-heretic-2.0-i1-GGUF
- Licencia del Qwen3.5-4B original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
