# QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF

## Resumen

Gemma 4 E4B IT QUASAR Q4_0 GGUF es una cuantización de 4 bits del modelo multimodal `google/gemma-4-E4B-it`, publicada por QUASAR-QAT. A diferencia de las cuantizaciones convencionales de posentrenamiento, este checkpoint conserva los códigos INT4 y las escalas entrenados durante el proceso de quantization-aware training (QAT) propietario de QUASAR, de modo que el fichero GGUF almacena directamente los pesos cuantizados sin una segunda requantización. El resultado es un GGUF Q4_0 estándar, ejecutable en llama.cpp, Ollama y LM Studio, con una divergencia KL respecto a BF16 de 0,044 frente a los 0,088 del QAT oficial de Google.

El modelo base es un transformer multimodal de la familia Gemma 4, con 7.463.013.674 parámetros totales según los safetensors del checkpoint original, y una ventana de contexto de 131.072 tokens. Soporta entrada de texto, imagen y audio (pipeline `image-text-to-text`), razonamiento con modo thinking, function calling y flujos agénticos. La cuantización mantiene la visión mediante un proyector multimodal BF16 sin modificar (992 MB), separado del fichero principal de 5,23 GB.

Su relevancia actual radica en que demuestra que el QAT nativo permite exportar a formatos de despliegue estándar sin sobrecoste de inferencia: el runtime es Q4_0 convencional, pero la calidad medida se acerca más al modelo BF16 que las alternativas de imatrix o el propio QAT de Google. Está pensado para desarrolladores que necesitan ejecutar un modelo multimodal de 7,5B en hardware de consumo manteniendo fidelidad de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), vision projector BF16; detalles internos de atención no disponibles |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4_0 nativo (linears con escalas group-64 entrenadas, embeddings de tokens en Q6_K); existe un gemelo W4A16-G64 para vLLM |
| Idiomas soportados | en, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero principal `gemma-4-E4B-it-QUASAR-Q4_0.gguf` de 5,23 GB + `mmproj-gemma-4-E4B-it-BF16.gguf` de 992 MB) |

## Arquitectura y entrenamiento

El checkpoint parte de `google/gemma-4-E4B-it`, un modelo multimodal que procesa texto, imagen y audio, con capacidad de razonamiento en modo thinking y soporte de tool calling. La cuantización no es de posentrenamiento: QUASAR aplica quantization-aware training con una función de pérdida consciente de la reconstrucción en baja precisión, de forma que los códigos INT4 se aprenden durante el entrenamiento en lugar de derivarse a posteriori. El GGUF exporta esos códigos y escalas entrenados directamente, con los 258 tensores cuantizados verificados bit a bit contra el gemelo W4A16-G64 (recibo en `native_q4_0_receipt.json` y verificador `scripts/export_gemma4_gguf_q4_0.py --verify`).

El proceso de "healing" se realizó contra el profesor BF16 durante 626M tokens, equivalente a una época sobre aproximadamente 398.000 prompts auto-destilados. El modelo conserva el chat template de Gemma 4 con thinking activado por defecto (desactivable con `--chat-template-kwargs '{"enable_thinking": false}'`), y el proyector de visión es el BF16 original sin modificar. La innovación principal es que el beneficio del QAT se materializa en formatos de despliegue estándar sin overhead de inferencia: no hay kernels especiales ni capas adicionales en tiempo de ejecución.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo de hasta 131.072 tokens.
- Razonamiento explícito mediante modo thinking, activado por defecto en la plantilla de chat.
- Procesamiento de imagen (VLM) a través del proyector multimodal BF16 incluido.
- Procesamiento de audio según los tags del modelo base (pipeline `image-text-to-text`).
- Function calling y tool calling, con soporte de plantillas Jinja (`--jinja`).
- Flujos agénticos y razonamiento multi-paso.
- Capacidades multilingües (etiqueta `multilingual`, con inglés como idioma principal declarado).
- Generación de código y resolución de problemas matemáticos (evaluado en GSM8K y MATH-hard).
- Cumplimiento de instrucciones (IFEval).

## Casos de uso

- Asistente conversacional local con contexto largo: la ventana de 131.072 tokens permite mantener historiales extensos o adjuntar documentación completa en una sola sesión, ejecutándose en un único equipo con el GGUF de 5,23 GB.
- Análisis de documentos e imágenes en el puesto de trabajo: con `llama-mtmd-cli` o Ollama se puede pasar una imagen junto a una pregunta y obtener descripción o extracción de información sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Automatización agéntica con herramientas: el soporte de function calling y el modo thinking permiten construir agentes que planifican pasos, invocan APIs y verifican resultados, con la ventaja de que el modelo corre en hardware de consumo.
- Generación y revisión de código en pipelines de desarrollo: puede integrarse en flujos de CI/CD o en asistentes de IDE locales para explicar parches, generar tests o revisar diffs, manteniendo el código dentro de la infraestructura propia.
- Razonamiento matemático y resolución de problemas: los resultados en GSM8K (82,0) y MATH-hard (60,7) lo hacen adecuado para tutoría automatizada o verificación de cálculos en herramientas internas.
- Despliegue en estaciones de trabajo sin GPU dedicada de datacenter: al ser un Q4_0 estándar, puede servirse con llama.cpp u Ollama en CPU o en GPU consumer, lo que facilita prototipos y demos en portátiles.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de distintas estrategias de cuantización (imatrix, QAT oficial, Q4_K_M) sobre el mismo modelo base con el mismo arnés de evaluación.

## Benchmarks y rendimiento

Los datos publicados corresponden al gemelo W4A16-G64, que según el autor porta los mismos códigos entrenados. Comparación con el QAT oficial de Google:

| Benchmark | QUASAR | Google QAT |
|---|---:|---:|
| TriviaQA | 23,8 | 20,1 |
| NQ-open | 4,7 | 2,4 |
| TruthfulQA | 58,2 | 55,4 |
| ARC-Easy | 79,8 | 78,3 |
| ARC-Challenge | 56,2 | 56,0 |
| GSM8K | 82,0 | 81,5 |
| IFEval | 82,6 | 81,9 |
| MATH-hard | 60,7 | 59,4 |
| Media | 56,0 | 54,4 |

Fidelidad respecto a BF16 en formato Q4_0 (KL menor es mejor):

| Fichero Q4_0 | KL a BF16 | Acuerdo top-1 |
|---|---:|---:|
| QUASAR | 0,044 | 92,8% |
| Unsloth Q4_0 (imatrix) | 0,067 | 91,1% |
| Google QAT | 0,088 | 90,6% |
| Q4_0 estándar (llama-quantize, sin imatrix) | 0,193 | 85,7% |

El autor indica además KL de 0,071 para el repack de Unsloth del QAT de Google y 0,114 para el Q4_K_M de LM Studio. En el gemelo W4A16 bajo vLLM, el KL es 0,022 frente a 0,064 del W4A16 QAT de Google.

## Requisitos de hardware

- VRAM estimada: el fichero principal ocupa 5,23 GB y el proyector de visión 992 MB; en la práctica se necesitan aproximadamente 6,5-7 GB de VRAM para cargar ambos, más el espacio de caché KV correspondiente al contexto utilizado.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para uso con visión; para contexto completo de 131.072 tokens se requiere bastante más memoria de caché KV, por lo que conviene una RTX 4090, A100 o H100 si se necesita la ventana completa.
- GPU consumer: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y en Mac con memoria unificada suficiente; en GPUs de 8 GB puede requerir descargar parte de las capas a CPU.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli` para visión), Ollama (`ollama run hf.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF`), LM Studio (búsqueda en Discover); para el gemelo W4A16, vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | KL a BF16 | Licencia |
|---|---|---:|---|---:|---|
| QUASAR Q4_0 (este) | 7,46B | 131.072 | GGUF Q4_0 nativo | 0,044 | Apache-2.0 |
| Google QAT Q4_0 | 7,46B (base) | 131.072 | GGUF Q4_0 | 0,088 | Apache-2.0 |
| Unsloth Q4_0 (imatrix) | 7,46B (base) | 131.072 | GGUF Q4_0 | 0,067 | Apache-2.0 |
| LM Studio Q4_K_M | 7,46B (base) | 131.072 | GGUF Q4_K_M | 0,114 | Apache-2.0 |

Todos comparten el mismo modelo base y la misma referencia BF16, prompts, build de llama.cpp y backend en la evaluación del autor. La ventaja de QUASAR es la menor divergencia con el mismo runtime Q4_0 estándar; la desventaja potencial es que Q4_K_M, al ser un formato más expresivo, puede ofrecer mejor calidad en algunos tensores pese a su peor KL global reportado.

## Limitaciones y advertencias

- Los benchmarks downstream se midieron sobre el gemelo W4A16-G64, no directamente sobre el GGUF; el autor afirma que los códigos son idénticos, pero la evaluación del GGUF Q4_0 en tareas downstream no se presenta de forma separada.
- El rendimiento en NQ-open es muy bajo (4,7), lo que sugiere debilidades en question answering de conocimiento abierto y riesgo de respuestas imprecisas en ese dominio.
- Riesgo de alucinación inherente a modelos de 7,5B; TruthfulQA en 58,2 no garantiza fiabilidad factual en producción.
- El idioma principal declarado es inglés; el soporte multilingüe no está cuantificado con benchmarks y el castellano no aparece evaluado.
- El modo thinking está activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explícitamente.
- La ventana de 131.072 tokens es costosa en memoria de caché KV; en GPUs de 8-12 GB el contexto práctico será mucho menor.
- El proyector de visión es BF16 y añade casi 1 GB adicional al despliegue; en configuraciones muy ajustadas de VRAM puede no caber junto al modelo.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base de Google y citar el paper de QUASAR si se usa en trabajos derivados.
- Los resultados de KL y benchmarks provienen del propio autor del checkpoint; no se han localizado evaluaciones independientes en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Gemelo W4A16: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-W4A16-G64
- Paper QUASAR: https://arxiv.org/abs/2608.13966
- Página del proyecto: https://quasar-qat.github.io/
- Código: https://github.com/vincentcounathe/quasar-qat
- Colección QUASAR Gemma 4: https://huggingface.co/collections/QUASAR-QAT/quasar-native-4-bit-gemma-4-6aa3561770e6e4001271bf1e
- Evaluación completa: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF/blob/main/EVAL.md
- Recibo de verificación nativa: https://huggingface.co/QUASAR-QAT/gemma-4-E4B-it-QUASAR-Q4_0-GGUF/blob/main/native_q4_0_receipt.json
- QAT oficial de Google (Q4_0): https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf/blob/main/gemma-4-E4B_q4_0-it.gguf
- QAT oficial de Google (W4A16): https://huggingface.co/google/gemma-4-E4B-it-qat-w4a16-ct
- Unsloth GGUF: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF/blob/main/gemma-4-E4B-it-Q4_0.gguf
- LM Studio Q4_K_M: https://huggingface.co/lmstudio-community/gemma-4-E4B-it-GGUF/blob/main/gemma-4-E4B-it-Q4_K_M.gguf
- Hilo en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1x6u8pi/quasar_4bit_qat_checkpoints_for_qwen35_gemma_4/
