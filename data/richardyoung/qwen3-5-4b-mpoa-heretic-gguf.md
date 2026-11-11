# richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF

## Resumen

Qwen3.5-4B-MPOA-heretic-GGUF es una compilación en formato GGUF del modelo richardyoung/Qwen3.5-4B-MPOA-heretic, una versión del Qwen/Qwen3.5-4B a la que se le ha eliminado el comportamiento de rechazo (abliteration) mediante la herramienta Heretic 2.0, empleando la técnica MPOA (projected, magnitude-preserving abliteration) que es la opción por defecto de dicha herramienta. El autor, Richard J. Young, publica estos ficheros como material de investigación sobre eliminación de rechazos y su medición, no como asistente de propósito general.

El modelo cuenta con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y se distribuye bajo licencia Apache 2.0, la misma del modelo base Qwen3.5-4B. El repositorio incluye cuantizaciones Q4_K_M (2,7 GB) y Q8_0 (4,5 GB), además de una matriz de importancia (imatrix) de 7 MB, y está pensado para su uso con llama.cpp y Ollama. Los ficheros son solo de texto: aunque el modelo base acepta imágenes, el proyector de visión no está incluido en esta compilación.

La relevancia de esta ficha radica en que documenta un caso concreto de abliteration sobre un modelo de la familia Qwen 3.5, con métricas publicadas en un artículo académico: la tasa de rechazo sobre 972 prompts dañinos retenidos cae del 88,5 % en el modelo original al 18,0 % en la versión abliterada, con una divergencia KL de primer token de 0,054 respecto al original. Estas cifras corresponden al modelo en precisión completa (bf16); los ficheros cuantizados aquí publicados no fueron evaluados en el artículo y la cuantización puede alterar el comportamiento de rechazo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del Qwen/Qwen3.5-4B; no se detalla en la información disponible) |
| Parámetros totales | 4.205.751.296 (~4,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q8_0 (publicadas); IQ3_M, IQ4_XS, Q5_K_M, Q6_K anunciadas como "en proceso de añadirse" |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se publica en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros; la información disponible no detalla la composición de su dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO. Lo que sí se documenta es el proceso de modificación: la versión abliterada se generó con Heretic 2.0 aplicando MPOA (projected, magnitude-preserving abliteration), una variante que proyecta las direcciones de rechazo preservando la magnitud de los pesos. La selección del trial se hizo con la regla "menos rechazos por palabra clave en el conjunto de desarrollo con divergencia KL de primer token ≤ 0,1", sobre una búsqueda de 100 trials.

Los ficheros GGUF se construyeron a partir de los safetensors publicados del modelo richardyoung/Qwen3.5-4B-MPOA-heretic (revisión f37f274b36e2, con verificación SHA-256 de cada fichero de pesos) usando llama.cpp (commit 468fde9): conversión con `convert_hf_to_gguf.py --outtype bf16` y posterior `llama-quantize`, todo en CPU. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M emplean la matriz de importancia (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estáticas. Cada fichero Q4_K_M se cargó y respondió a un prompt de prueba antes de subirse.

## Capacidades

- Generación de texto conversacional en inglés (pipeline text-generation, tag conversational).
- Eliminación del comportamiento de rechazo: el modelo cumple muchas peticiones que el original rechaza, lo que constituye su rasgo definitorio y su objeto de estudio.
- Compatibilidad con endpoints (tag endpoints_compatible) y con el ecosistema llama.cpp/Ollama.
- Capacidad multimodal del modelo base (aceptación de imágenes) no disponible en esta compilación: el proyector de visión no está incluido.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, agentes, modo thinking, audio ni matemáticas avanzadas.

## Casos de uso

- Investigación sobre abliteration: el modelo sirve como sujeto de estudio para medir la eficacia de la eliminación de rechazos con Heretic 2.0 y comparar con modelos predecesores, tal como plantea el artículo asociado.
- Evaluación de defensas frente a la eliminación de rechazos: permite construir conjuntos de prompts y medir hasta qué punto un juez automático (por ejemplo WildGuard) detecta respuestas problemáticas en un modelo abliterado.
- Estudio del impacto de la cuantización en el comportamiento de rechazo: al disponer de Q4_K_M y Q8_0 del mismo modelo, se puede comparar si la cuantización altera la tasa de cumplimiento, algo que el autor advierte explícitamente que no se evaluó en el artículo.
- Reproducibilidad de experimentos: los SHA-256 incluidos en SHA256SUMS y la documentación del pipeline de conversión permiten replicar la construcción de los GGUF y verificar la integridad de los pesos.
- Despliegue local ligero para pruebas: con 2,7 GB en Q4_K_M, el modelo cabe en equipos de consumo y permite experimentar con llama.cpp u Ollama sin infraestructura dedicada.
- Análisis de divergencia respecto al original: la métrica de KL de primer token (0,054) y la tasa de rechazo (18,0 %) permiten estudiar cuánto se desvía el modelo abliterado del original en distribución de salida.

## Benchmarks y rendimiento

| Métrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo sobre 972 prompts dañinos retenidos (juez WildGuard) | 88,5 % | 18,0 % (175/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | — | 6 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | — | 0,054 |

Estos datos provienen del artículo del autor y describen el modelo en precisión completa (bf16). Los ficheros cuantizados de este repositorio no fueron evaluados en el artículo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,7 GB para Q4_K_M y 4,5 GB para Q8_0, según los tamaños de fichero indicados; hay que añadir el overhead del contexto y del runtime.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder ejecutar Q4_K_M.
- Cabe en GPU consumer: sí, tanto Q4_K_M como Q8_0 en tarjetas de gama media con suficiente VRAM; también es viable en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF:Q4_K_M`), Ollama (`ollama run richardyoung/qwen3.5-4b-mpoa-heretic` o `ollama run hf.co/richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF:Q4_K_M`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazo (972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-MPOA-heretic-GGUF (este) | ~4,2 B | no disponible | 18,0 % (bf16) | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-4B (original) | ~4,2 B | no disponible | 88,5 % | Apache 2.0 | safetensors (y GGUF de terceros) |
| richardyoung/Qwen3.5-4B-MPOA-heretic (bf16) | ~4,2 B | no disponible | 18,0 % | Apache 2.0 | safetensors |

No se dispone de datos de benchmarks ni de especificaciones de contexto para comparar con otras alternativas de la misma categoría; la comparación se limita al modelo original y a la versión en precisión completa del propio autor.

## Limitaciones y advertencias

- Modelo abliterado: elimina deliberadamente el comportamiento de rechazo, por lo que puede producir contenido que el modelo original rechazaría. No está pensado como asistente de propósito general.
- Uso previsto exclusivamente de investigación sobre eliminación de rechazos, su medición y las defensas frente a ella; los usuarios son responsables de un uso lícito.
- Las métricas de rechazo publicadas corresponden al modelo en bf16; la cuantización puede alterar el comportamiento de rechazo y no fue evaluada en el artículo.
- Solo texto: el proyector de visión del modelo base no está incluido, pese a que el original acepta imágenes.
- Idioma: únicamente inglés según los metadatos del repositorio.
- Longitud de contexto no documentada en la información disponible.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información proporcionada.
- Licencia Apache 2.0, la misma del modelo base; se remite a la model card del modelo fuente para las restricciones de uso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validación limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-MPOA-heretic-GGUF
- Modelo base (bf16): https://huggingface.co/richardyoung/Qwen3.5-4B-MPOA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Artículo citado: Richard J. Young, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors" (2026), enlace arXiv pendiente de añadir según la model card.
