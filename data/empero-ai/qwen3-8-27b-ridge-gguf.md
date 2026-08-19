# empero-ai/Qwen3.8-27B-Ridge-GGUF

## Resumen

Qwen3.8-27B-Ridge-GGUF es una cuantización mixta del modelo oficial Qwen/Qwen3.8-27B, publicada por Empero (empero-ai) en formato GGUF para su uso con llama.cpp, Ollama, LM Studio, jan, KoboldCpp y otros runtime compatibles. No se trata de un finetune ni de un nuevo codec, sino de una mezcla de tipos de cuantización ya existentes en llama.cpp, diseñada específicamente para la arquitectura híbrida del modelo base, que combina capas Gated-DeltaNet (linear attention) con capas de atención completa. El resultado es un archivo de 11,73 GiB a 3,69 bpw que conserva la cabeza de predicción multitoken (MTP) nativa y admite entrada de imágenes mediante un proyector de visión separado en BF16.

La relevancia de esta ficha radica en que ofrece una alternativa de alta densidad para ejecutar un modelo de 27B con ventana de contexto nativa de 262 000 tokens (ampliable a 1M con YaRN) en hardware de consumo, sin sacrificar la ruta de estado Gated-DeltaNet, que suele degradarse gravemente con cuantizaciones planas de bajo bit. El modelo base es multimodal (imagen-texto), con capacidades de razonamiento y generación de código, y esta cuantización permite desplegarlo en GPU de 16-24 GB con rendimiento interactivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 3 capas Gated-DeltaNet por cada capa de atención completa (64 capas en total: 16 × (3 × GatedDeltaNet → FFN + 1 × GatedAttn → FFN)) |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 000 tokens nativa; extensión YaRN hasta 1M (según model card del modelo base) |
| Tipos de cuantizacion | Mezcla Ridge: Q8_0 (estado GDN, normas), Q4_K (mixers GDN), Q5_K (atención completa), IQ3_S/IQ2_M (FFN), Q6_K (embeddings, lm_head, MTP); archivo principal a 3,69 bpw |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo principal: Qwen3.8-27B-Ridge-3.7bpw.gguf; proyector de visión: mmproj-Qwen3.8-27B-BF16.gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer híbrido que intercala tres capas de Gated-DeltaNet (una forma de atención lineal con estado recurrente) por cada capa de atención completa. Esta arquitectura reduce el coste computacional del contexto largo, pero hace que el estado Gated-DeltaNet (tensores `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_a`, `ssm_dt`, `ssm_norm`) sea especialmente sensible a la cuantización de bajo bit. La cuantización Ridge de Empero aborda este problema asignando Q8_0 a toda la ruta de estado GDN y a las normas, Q4_K a los mixers de atención lineal, Q5_K a las capas de atención completa, y reservando IQ2_M e IQ3_S para los bloques FFN del medio de la pila, donde el impacto en la perplejidad es menor. Los embeddings, la cabeza de salida y la cabeza MTP (bloque `blk.64`) se mantienen en Q6_K.

El proceso de calibración se realizó con llama.cpp (commit `adb55e5`) usando una matriz de importancia (imatrix) sobre 80 fragmentos de 512 tokens de wikitext y código. Los tensores MTP no se incluyeron en la calibración y permanecen sin imatrix, por lo que se mantienen en Q6_K para evitar fallos de cuantización. El proyector de visión se proporciona por separado en BF16 y es necesario para entrada de imágenes. No se aplicó RLHF ni DPO adicional; se trata de una cuantización del checkpoint oficial sin entrenamiento adicional.

## Capacidades

- Generación de texto y razonamiento de múltiples pasos (el modelo base es un LLM conversacional con capacidades de razonamiento).
- Entrada multimodal de imagen a texto: requiere el archivo `mmproj-Qwen3.8-27B-BF16.gguf` además del GGUF principal.
- Predicción multitoken (MTP) nativa: la cabeza `blk.64` / `nextn` se conserva en el archivo, lo que puede acelerar la decodificación especulativa en runtimes compatibles.
- Contexto largo: ventana nativa de 262 000 tokens, ampliable a 1M con extensión YaRN (según la documentación del modelo base).
- Soporte de tool calling y function calling: no se menciona explícitamente en la model card de la cuantización, pero el modelo base Qwen3.8-27B lo incluye; no hay confirmación en esta ficha.
- Capacidades multilingües: inglés y chino declarados oficialmente.
- Compatibilidad con runtimes GGUF estándar: llama.cpp, Ollama, LM Studio, jan, KoboldCpp.

## Casos de uso

- Asistentes conversacionales con visión en hardware de consumo: un chatbot que procesa imágenes y texto, desplegado en una GPU de 24 GB con el archivo Ridge y el mmproj BF16, ofreciendo respuestas razonadas a ~54 tok/s en una RTX PRO 6000 (según medición del autor).
- Análisis de documentos largos con contexto extendido: gracias a la ventana de 262k tokens, puede resumir o extraer información de manuales técnicos, contratos o libros completos sin truncar el contenido.
- Generación de código asistida por MTP: la cabeza de predicción multitoken permite acelerar la autocompletación de código en editores o pipelines CI/CD, especialmente en entornos con GPU de 16-24 GB.
- Sistemas de razonamiento multi-paso en edge: al caber en 16 GB con cuantización 3,7 bpw, puede ejecutarse en estaciones de trabajo con RTX 4090 o similares para tareas de planificación o análisis lógico.
- Procesamiento de imágenes con descripción en inglés o chino: el proyector de visión BF16 permite alimentar capturas de pantalla, diagramas o fotografías y obtener explicaciones textuales, útil en soporte técnico o accesibilidad.
- Prototipado rápido de agentes con memoria larga: al mantener el estado Gated-DeltaNet en Q8_0, la cuantización preserva la coherencia recurrente en conversaciones de muchos turnos, adecuado para asistentes de atención al cliente con historial extenso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye mediciones de perplejidad (PPL) sobre un conjunto de calibración propio, comparando la cuantización Ridge con la versión BF16 convertida del mismo checkpoint:

| Candidate | Tamaño | BPW | PPL (wiki-style) | vs BF16 |
|---|---:|---:|---:|---|
| BF16 GGUF (conversión propia) | 50,89 GiB | 16,00 | 7,15 ± 0,12 | — |
| Ridge-3.7bpw | 11,73 GiB | 3,69 | 7,82 ± 0,14 | +9,3 % |

El autor indica que no se ha realizado una comparación formal con otras cuantizaciones de la misma suite (Unsloth UD-Q3_K_XL, bartowski IQ3_XXS) en su equipo, por lo que la tabla de tamaños de archivos no debe interpretarse como una clasificación de calidad.

## Requisitos de hardware

- VRAM estimada: el archivo principal ocupa 11,73 GiB. Con contexto modesto y espacio para runtime y KV cache, se recomienda una GPU de 16 GB como punto de partida práctico; 24 GB es cómodo para uso cotidiano. Añadir el mmproj de visión (~0,87 GiB) incrementa el requisito en ~1 GiB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX PRO 6000 Blackwell (96 GB) o similares. En una RTX PRO 6000 Blackwell con descarga completa (`-ngl 99`), el autor midió ~54 tok/s de generación y ~130 tok/s de prompt.
- Contexto largo: la ventana nativa de 262k tokens hace que la caché KV sea el factor dominante en VRAM; puede ser necesario descargar parte del modelo a CPU incluso con cuantización ligera.
- Opciones de despliegue: llama.cpp (CUDA), Ollama, LM Studio, jan, KoboldCpp. También es compatible con runtimes que aceptan GGUF estándar.
- Latencia y throughput: los valores medidos son puntuales y no representan una evaluación exhaustiva; sirven como referencia orientativa.

## Comparativa con modelos similares

La comparativa disponible se limita a otras cuantizaciones GGUF del mismo modelo base Qwen3.8-27B, publicadas por unsloth y bartowski. No se dispone de datos de calidad medidos para esas alternativas en la información proporcionada.

| Archivo | Publicador | Tamaño | Banda nominal | PPL vs BF16 (medido aquí) |
|---|---:|---:|---:|---|
| BF16 (conversión propia) | empero-ai | 50,89 GiB | 16 bpw | 7,15 |
| UD-IQ2_XXS | unsloth | 8,39 GiB | ~2,1 bpw | no medido |
| UD-IQ2_M | unsloth | 9,61 GiB | ~2,4 bpw | no medido |
| IQ2_XXS | bartowski | 8,75 GiB | ~2,2 bpw | no medido |
| IQ2_M | bartowski | 10,13 GiB | ~2,5 bpw | no medido |
| UD-IQ3_XXS | unsloth | 11,10 GiB | ~2,8 bpw | no medido |
| Q2_K | bartowski | 11,03 GiB | ~2,7 bpw | no medido |
| Q3_K_S | unsloth | 11,71 GiB | ~3,1 bpw | no medido |
| **Ridge-3.7bpw** | **empero-ai** | **11,73 GiB** | **3,69 bpw** | **7,82 (+9 %)** |
| IQ3_XXS | bartowski | 11,76 GiB | ~2,9 bpw | no medido |
| UD-Q3_K_XL | unsloth | 12,52 GiB | ~3,4 bpw | no medido |
| Q3_K_M | unsloth | 12,87 GiB | ~3,5 bpw | no medido |

La ventaja principal de Ridge frente a estas alternativas es que trata explícitamente la ruta de estado Gated-DeltaNet con Q8_0, mientras que las cuantizaciones genéricas de bajo bit no distinguen esos tensores. Sin embargo, no hay datos de calidad comparativos que confirmen una superioridad práctica.

## Limitaciones y advertencias

- Es una cuantización con pérdida: el autor reporta +9,3 % de perplejidad frente a BF16. No es un archivo sin pérdida y puede degradar tareas sensibles a precisión numérica.
- No se han publicado benchmarks de tareas (razonamiento, código, matemáticas) para esta cuantización; la única métrica disponible es PPL sobre un conjunto de calibración propio.
- La comparación con otras cuantizaciones se basa únicamente en tamaños de archivo; no hay mediciones de calidad cruzadas.
- El modelo base está entrenado principalmente en inglés y chino; el rendimiento en otros idiomas puede ser inferior.
- La ventana de contexto de 262k tokens (o 1M con YaRN) puede provocar un uso de memoria de KV cache muy elevado; en GPUs de 16-24 GB será necesario reducir el contexto o descargar capas a CPU.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B para confirmar restricciones adicionales.
- Riesgo de alucinación inherente a los LLM; no validar salidas en aplicaciones críticas.
- El archivo `mmproj` es obligatorio para entrada de imágenes; sin él, el modelo solo funciona en modo texto.
- La cabeza MTP está presente pero su soporte depende del runtime; no todos los frontends GGUF la aprovechan.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/empero-ai/Qwen3.8-27B-Ridge-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones de unsloth para el mismo modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizaciones de bartowski para el mismo modelo base: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de Empero: https://empero.org
