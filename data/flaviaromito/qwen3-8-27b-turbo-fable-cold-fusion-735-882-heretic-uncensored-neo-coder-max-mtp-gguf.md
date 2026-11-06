# flaviaromito/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen
Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un fine-tune de la familia Qwen 3.8 de 27B publicado por el usuario flaviaromito en Hugging Face, derivado del modelo de DavidAU `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`. Se distribuye exclusivamente en formato GGUF (cuantizaciones regulares y MTP, con imatrix dual) y está orientado a ejecución en hardware de consumo mediante Unsloth. El autor lo presenta como un modelo multi-stage tune y multi-stage merge con modos de razonamiento ("thinking"), capacidad de código y de escritura creativa.

La propuesta central del modelo es reducir drásticamente la longitud de los bloques de razonamiento (entre 1/2 y 1/10 según el autor, con una mediana de reducción de aproximadamente 2/3) manteniendo la calidad de salida, lo que se traduce en menor consumo de tokens y mayor velocidad de generación. Según la model card, supera al Qwen 3.8 27B base y a los modelos Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks críticos, tanto en cuantización de 4 bits como de 8 bits.

El modelo incorpora además modificaciones de tipo "heretic" y "abliterated" (eliminación de rechazos), lo que lo aleja del alineamiento estándar de la familia Qwen. Está pensado para casos de uso creativos, roleplay, generación de ficción y programación, con soporte declarado de inglés y chino. La licencia es Apache 2.0, aunque las modificaciones de alineamiento y el origen multi-etapa del fine-tune requieren evaluación propia antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.8), con modos de thinking; detalles completos no disponibles |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF regulares y GGUF MTP (multi-token prediction), con imatrix dual (DI-MATRIX); niveles concretos (Q4_K_S, Q8, etc.) no detallados |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 389 GB con múltiples cuantizaciones); se menciona bfloat16 como tag, sin safetensors publicados en este repo |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura transformer decoder-only de Qwen 3.8 27B y se construye mediante un pipeline de fine-tuning multi-etapa y fusión multi-estado. El autor describe dos métodos propietarios: "COLD FUSION" (combinación de un componente propio llamado "GAIN" con los entrenadores de Unsloth) y "Fable Fusion 711". El método GAIN ajusta dinámicamente el entrenamiento por muestra en tiempo real durante el proceso, según la model card, con el objetivo de mejorar métricas sin recurrir a "benchmaxing".

Los datos de entrenamiento declarados son los datasets `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`, sin que se especifique el número de tokens ni la composición detallada. El modelo incluye una variante MTP (multi-token prediction) para acelerar la decodificación, y las cuantizaciones emplean imatrix dual. No se documentan fases de RLHF o DPO en la información disponible. Las modificaciones "heretic" y "abliterated" implican la supresión de comportamientos de rechazo respecto al modelo base.

## Capacidades
- Generación de texto general y conversacional multi-turno.
- Razonamiento con modo "thinking" en tres modos de operación declarados, con bloques de razonamiento reformateados y acortados.
- Generación de código (etiqueta "coder" y "NEO-CODER" en el nombre).
- Escritura creativa: ficción, relato, guion, roleplay y todos los géneros según los tags del autor.
- Capacidad multimodal declarada por el pipeline `image-text-to-text` y el tag `image-text-to-text`, aunque el repo solo distribuye pesos GGUF de texto.
- Soporte multilingüe limitado a inglés y chino.
- Tool calling: la model card remite a la pestaña "community" para resultados de terceros sobre tool calling, sin cifras verificables en la información disponible.
- Aceleración mediante decodificación MTP en las cuantizaciones correspondientes.

## Casos de uso
- Escritura creativa y ficción: el modelo está afinado específicamente para narrativa, con ejemplos en la model card de relato negro y hooks narrativos; adecuado para generar borradores de capítulos, diálogos y tramas con estilo marcado.
- Roleplay y personajes conversacionales: la combinación de fine-tune creativo y eliminación de rechazos permite mantener personajes con registros y temáticas adultas, útil en entornos de entretenimiento controlados.
- Asistencia de programación en local: con etiqueta "coder" y cuantizaciones de 4 bits, puede desplegarse en una estación de trabajo con GPU de consumo para autocompletado, explicación de código y generación de tests.
- Razonamiento con presupuesto de tokens ajustado: la reducción de tokens de thinking (hasta 1/10 en algunos casos) lo hace adecuado para pipelines donde el coste por token o la latencia importan, como agentes con muchas llamadas encadenadas.
- Generación de contenido en inglés y chino: útil para equipos que necesiten un modelo bilingüe EN/ZH ejecutable en local sin depender de APIs externas.
- Prototipado e investigación sobre alineamiento: al ser un modelo "abliterated", sirve como objeto de estudio para comparar comportamientos con y sin rechazos, siempre en entornos de investigación con salvaguardas.
- Despliegue en hardware de consumo: al publicarse en GGUF con cuantizaciones de 4 y 8 bits, encaja en flujos con llama.cpp u Ollama para uso personal o demos offline.

## Benchmarks y rendimiento
La model card cita cifras de ARC-C y ARC-E sin detallar la metodología completa. Se recogen aquí tal como las declara el autor, sin verificación independiente.

| Benchmark | Resultado declarado | Comparación declarada |
|---|---|---|
| ARC-C (8 bits) | 735 | +144 puntos frente a Qwen 3.8 27B según el autor |
| ARC-C (4 bits) | 719 | supera los 718 en 4 bits |
| ARC-E (8 bits) | superior a 880 | "zona de inteligencia" de OpenAI, Claude y Gemini según el autor |
| Conjunto de 7 benchmarks críticos | supera al Qwen 3.8 27B base en los 7 | también supera a Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en los 7, según el autor |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar con cifras verificables.

## Requisitos de hardware
- VRAM estimada: para ~26,9B parámetros, una cuantización de 4 bits ronda los 14-16 GB de pesos; 8 bits ronda los 27-30 GB; FP16 requeriría aproximadamente 54 GB solo para pesos.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones de 4 bits con contexto moderado; A100 40 GB o H100 para 8 bits y contextos largos.
- GPU de consumo: sí cabe en 4 bits en tarjetas de 16-24 GB (RTX 4080/4090, 3090); en 8 bits requiere 32 GB o más, por lo que queda fuera de la mayoría de consumer GPU.
- Despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; las variantes MTP requieren soporte específico del runner para aprovechar la decodificación multi-token.
- Latencia y throughput: no disponibles; el autor afirma mejoras de velocidad por la reducción de tokens de thinking y por MTP, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Heretic) | ~26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune multi-etapa, sin rechazos, thinking reducido |
| Qwen 3.8 27B (base) | ~27B | no disponible | Apache 2.0 (según familia Qwen) | safetensors/GGUF | Modelo de referencia del autor; alineamiento estándar |
| Qwen 3.6-35B-A3B | 35B totales, ~3B activos | no disponible | no disponible | no disponible | MoE citado por el autor como superado en sus 7 benchmarks |
| Qwen 3.6 27B / Qwen 3.5 27B | ~27B | no disponible | no disponible | no disponible | Generaciones previas citadas como superadas por el autor |

Los datos de la columna de modelos comparables provienen únicamente de las menciones de la model card; no se han verificado de forma independiente.

## Limitaciones y advertencias
- Modelo "uncensored" y "abliterated": no aplica los rechazos estándar de la familia Qwen, por lo que puede generar contenido sensible, ofensivo o inapropiado; requiere filtros externos en producción.
- Riesgo de alucinación no cuantificado: no hay evaluaciones independientes de factualidad.
- Las cifras de benchmarks (ARC-C 735, ARC-E >880) las declara el propio autor sin metodología detallada ni verificación externa; deben tomarse con cautela.
- Soporte limitado a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada en la información disponible.
- Repo de 389 GB con múltiples cuantizaciones: la descarga completa es poco práctica; conviene seleccionar solo el archivo GGUF necesario.
- El pipeline declarado es `image-text-to-text`, pero el repo solo contiene GGUF de texto; la capacidad multimodal no está garantizada en este artefacto.
- Licencia Apache 2.0 declarada, pero las modificaciones de alineamiento y el origen multi-etapa del fine-tune conviene revisarlos antes de un uso comercial regulado.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces
- Hugging Face: https://huggingface.co/flaviaromito/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia del método COLD FUSION (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
