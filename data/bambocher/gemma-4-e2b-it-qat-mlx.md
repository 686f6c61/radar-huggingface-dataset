# bambocher/gemma-4-E2B-it-qat-mlx

## Resumen

Gemma 4 E2B-it-qat-mlx es una conversión a formato MLX del modelo Gemma 4 E2B instruct de Google, en su variante entrenada con quantization-aware training (QAT) sobre la rejilla exacta de q4_0 de llama.cpp. Lo publica el usuario bambocher en Hugging Face y su aportación principal es preservar bit a bit la rejilla de cuantización para la que Google entrenó el modelo, en lugar de recalcular mínimos y máximos por grupo como hacen las conversiones convencionales. El resultado es un modelo multimodal (texto, visión y audio) de 7.181.985.347 parámetros totales que ocupa 4,04 GB en disco y que reproduce con alta fidelidad los pesos maestros en bf16.

La relevancia técnica está en la metodología: 149 capas Lineales del decodificador de texto se escriben directamente sobre la rejilla q4_0 (grupo 32, escala bf16), verificado contra el GGUF oficial de Google bloque a bloque, y 126 Lineales adicionales se elevan a 8 bits seleccionadas por medición de divergencia KL por MB añadido. Las torres de visión y audio, que nunca pasaron por QAT, se mantienen a 8 bits, y los embeddings a 6 bits siguiendo el reparto del GGUF original (Q6_K).

El modelo está pensado para inferencia local en hardware Apple Silicon mediante mlx-lm. Frente a las alternativas de mlx-community, logra menor divergencia KL respecto a los pesos maestros (0,030 frente a 0,067) y mayor velocidad de decodificación en un MacBook Air M5 (67,5 tokens/s frente a 54,7), a costa de un tamaño ligeramente superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de texto + torre de visión + torre de audio), derivada de Gemma 4 E2B; detalles internos de capas y atención no disponibles |
| Parametros totales | 7.181.985.347 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín grupo 32 sobre rejilla q4_0 (149 Lineales), 8 bits (126 Lineales del decodificador + torres de visión y audio), 6 bits (embeddings), normas sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 4,2 GB, pesos efectivos 4,04 GB |

## Arquitectura y entrenamiento

El modelo base es google/gemma-4-E2B-it, publicado por Google y sometido a quantization-aware training para la rejilla q4_0 de llama.cpp; el repositorio de referencia es google/gemma-4-E2B-it-qat-q4_0-unquantized (pesos maestros en bf16) y existe un GGUF oficial q4_0. La arquitectura es un transformer multimodal con decodificador de texto, torre de visión y torre de audio, según los tags del repositorio (multimodal, vision, audio, image-text-to-text). No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación de esta conversión es metodológica. MLX usa cuantización afín que almacena `scale·q + bias`; con `scale = d` y `bias = -8d` esa fórmula coincide exactamente con la rejilla q4_0, de modo que 149 Lineales se escriben sobre la misma rejilla que Google usó en QAT y cada una se verifica contra el GGUF durante la conversión. La única diferencia es el redondeo de la escala de fp16 a bf16 (el tipo de escala de MLX), inferior a 1/64 de paso por peso. Las 126 Lineales elevadas a 8 bits se eligieron midiendo la divergencia KL que elimina cada una respecto a los pesos maestros bf16, por MB añadido: 63 son puertas y proyecciones de entrada por capa, 54 proyecciones de atención y solo 9 son Lineales de MLP. El coste total de esta elevación es de 100 MB. Los embeddings van a 6 bits (equivalente al Q6_K del GGUF) y las torres de visión y audio a 8 bits. El repositorio incluye scripts de canalización (`qat_mlx_pipeline.sh`, `qat_aligned_convert.py`, `qat_sensitivity.py`, `qat_eval.py`) en github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant.

## Capacidades

- Generación de texto conversacional en formato chat (verificado por el autor).
- Comprensión de imágenes: identifica el animal en una fotografía (verificado por el autor).
- Transcripción de voz mediante la torre de audio (verificado por el autor).
- Procesamiento image-text-to-text como pipeline principal declarado.
- Soporte de MTP (multi-token prediction) según los tags del repositorio.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo responde en formato chat y cabe en 4,04 GB, por lo que puede ejecutarse íntegramente en un MacBook Air M5 con mlx-lm a 67,5 tokens/s, sin conexión a servicios externos.
- Descripción y clasificación de imágenes en flujos de trabajo locales: la torre de visión a 8 bits permite etiquetar fotografías o extraer información de capturas dentro de una aplicación de escritorio en Apple Silicon.
- Transcripción de audio en local: la torre de audio incluida permite convertir voz a texto en pipelines de notas de reuniones o dictado sin enviar audio a la nube.
- Prototipado de aplicaciones multimodales con MLX: al estar en safetensors y librería mlx, se integra directamente en el ecosistema mlx-lm y mlx-vlm para experimentación en investigación.
- Evaluación de técnicas de cuantización: el repositorio y sus scripts (qat_sensitivity.py, qat_eval.py) sirven como referencia reproducible para estudiar el impacto de la rejilla q4_0 frente a conversiones convencionales.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin las restricciones adicionales de la licencia Gemma original, lo que facilita su incorporación en productos.
- Inferencia de bajo consumo en portátiles: con 4,04 GB de pesos, el modelo deja margen de memoria unificada para el sistema y otras aplicaciones en equipos de 16 GB.

## Benchmarks y rendimiento

Perplejidad de texto bruto sobre wikitext-2 (test), 128 ventanas de 512 tokens con BOS al inicio de cada una; KL y coincidencia top-1 medidos respecto a los pesos maestros QAT en bf16.

| Modelo | Tamano | PPL | KL vs maestro QAT | Top-1 agree |
|---|---|---|---|---|
| Pesos maestros QAT bf16 (google/gemma-4-E2B-it-qat-q4_0-unquantized) | — | 66,1 | — | — |
| **Este modelo** | **4,04 GB** | **64,5** | **0,030** | **91,8%** |
| mlx-community/gemma-4-E2B-it-qat-4bit | 4,33 GB | 66,2 | 0,067 | 87,6% |
| mlx-community/gemma-4-e2b-it-4bit | 3,6 GB | 239,7 | 0,853 | 66,3% |

Velocidad de decodificación en MacBook Air M5 con mlx-lm:

| Build | tokens/s |
|---|---|
| **Este modelo** | **67,5** |
| mlx-community/gemma-4-E2B-it-qat-4bit | 54,7 |
| mlx-community/gemma-4-e2b-it-4bit (sin QAT) | 83,7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 4,04 GB de pesos más overhead de activaciones y contexto; en la práctica requiere un equipo con al menos 8 GB de memoria unificada, y 16 GB deja margen cómodo.
- GPU recomendadas: Apple Silicon (serie M). El benchmark oficial se ejecutó en un MacBook Air M5. No hay datos de rendimiento en GPU NVIDIA.
- Compatibilidad con GPU de consumo: el formato MLX está diseñado para Apple Silicon; no es directamente ejecutable en RTX 4090 ni en GPUs NVIDIA sin reconversión a otro formato (GGUF, safetensors estándar).
- Opciones de despliegue: mlx-lm (texto) y el stack MLX para multimodal; el GGUF oficial de Google (google/gemma-4-E2B-it-qat-q4_0-gguf) es la alternativa para llama.cpp.
- Latencia y throughput: 67,5 tokens/s de decodificación en MacBook Air M5 con mlx-lm. No se dispone de datos de prefill ni de latencia de primera token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | PPL (wikitext-2) | KL vs maestro | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| **bambocher/gemma-4-E2B-it-qat-mlx** | 7,18 B | no disponible | 4,04 GB | 64,5 | 0,030 | Apache 2.0 | MLX safetensors |
| mlx-community/gemma-4-E2B-it-qat-4bit | no disponible | no disponible | 4,33 GB | 66,2 | 0,067 | no disponible en la informacion | MLX safetensors |
| mlx-community/gemma-4-e2b-it-4bit | no disponible | no disponible | 3,6 GB | 239,7 | 0,853 | no disponible en la informacion | MLX safetensors |
| google/gemma-4-E2B-it-qat-q4_0-gguf | no disponible | no disponible | no disponible | no disponible | referencia | no disponible en la informacion | GGUF q4_0 |

## Limitaciones y advertencias

- La perplejidad de este modelo (64,5) es ligeramente inferior a la de los pesos maestros (66,1); el autor lo atribuye al ruido de una prueba de texto bruto y a la naturaleza de QAT, pero conviene no interpretarlo como una mejora real de calidad.
- La coincidencia top-1 del 91,8% implica que aproximadamente 1 de cada 12 predicciones difiere de los pesos maestros bf16; para tareas sensibles a la fidelidad exacta esto puede ser relevante.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPUs NVIDIA ni a servidores x86 convencionales sin reconversión.
- Solo se verifican explícitamente tres capacidades (chat, descripción de imagen y transcripción de audio); no hay evidencia publicada sobre tool calling, agentes, matemáticas o código.
- No se dispone de información sobre idiomas soportados, sesgos conocidos, tasa de alucinación ni longitud de contexto, lo que impide evaluar su idoneidad para producción multilingüe o para contextos largos.
- El modelo es una modificación de los pesos de Google; aunque la licencia declarada es Apache 2.0, conviene revisar las condiciones de la licencia Gemma original para usos comerciales concretos.
- El repositorio tiene 61 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/gemma-4-E2B-it-qat-mlx
- Modelo base (pesos maestros QAT bf16): https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Modelo original instruct: https://huggingface.co/google/gemma-4-E2B-it
- GGUF oficial q4_0: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Conversión alternativa QAT MLX: https://huggingface.co/mlx-community/gemma-4-E2B-it-qat-4bit
- Conversión alternativa 4 bits sin QAT: https://huggingface.co/mlx-community/gemma-4-e2b-it-4bit
- Código y notas del método: https://github.com/rromenskyi/quant-ternary/tree/main/gemma4-quant
