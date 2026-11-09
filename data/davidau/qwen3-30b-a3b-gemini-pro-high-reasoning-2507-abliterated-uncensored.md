# DavidAU/Qwen3-30B-A3B-Gemini-Pro-High-Reasoning-2507-ABLITERATED-UNCENSORED

## Resumen

Qwen3-30B-A3B-Gemini-Pro-High-Reasoning-2507-ABLITERATED-UNCENSORED es un ajuste fino (finetune) del modelo huihui-ai/Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated, publicado por el usuario DavidAU en Hugging Face. El modelo parte de la arquitectura MoE (Mixture of Experts) de Qwen3-30B-A3B, con 30.532.122.624 parámetros totales y aproximadamente 3B de parámetros activos por token (8 de 128 expertos activos por defecto). El autor aplica un entrenamiento supervisado con Unsloth sobre el dataset TeichAI/gemini-3-pro-preview-high-reasoning-250x para incorporar un estilo de razonamiento más compacto y directo, inspirado en Gemini, y para reparar posibles degradaciones introducidas por el proceso de abliteration (eliminación de rechazos) del modelo base.

El modelo se presenta como una versión "sin censura" y funcional, con ventana de contexto de 256k tokens, licencia Apache 2.0 y pesos en formato safetensors (también se distribuyen cuantizaciones GGUF, EXL2, AWQ y GPTQ a través del ecosistema del autor). Su relevancia radica en que combina la eficiencia de inferencia de un MoE de 30B con solo 3B activos —lo que permite ejecutarlo en GPU de consumo o incluso en CPU a velocidades razonables— con un estilo de razonamiento más breve (4-10 párrafos) que el de Qwen3 Thinking original, y con las restricciones de rechazo eliminadas.

El modelo está orientado a generación de texto conversacional y razonamiento en inglés, y su publicación se enmarca en la práctica habitual de la comunidad de publicar variantes "abliterated" y "uncensored" de modelos abiertos para casos de uso creativos, roleplay y generación de contenido que los modelos alineados rechazan. No obstante, el propio autor advierte que, al no haber sido entrenado sobre contenido explícito, el modelo puede requerir instrucciones adicionales para generar material gráfico o soez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3 MoE, 128 expertos, 8 activos por defecto) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3B (8 de 128 expertos) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | GGUF, EXL2, AWQ, GPTQ, HQQ (distribuidas por el autor); safetensors en precisión completa en el repo |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF y otras cuantizaciones en repos derivados |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3 MoE del modelo base: un transformer con 128 expertos por capa, de los cuales 8 se activan por token, lo que da lugar a unos 3B de parámetros activos sobre un total de 30.532.122.624. Esta configuración permite un throughput de inferencia muy superior al de un modelo denso de 30B, a costa de una mayor huella de memoria en reposo (el repo safetensors ocupa 61,1 GB). El contexto nativo es de 256k tokens.

El entrenamiento se realizó con Unsloth sobre hardware local (Linux para Windows) y consistió en un ajuste fino supervisado (distill-fine-tune) sobre el dataset TeichAI/gemini-3-pro-preview-high-reasoning-250x, aplicado después de la abliteration del modelo base. El objetivo declarado es doble: transferir un estilo de razonamiento tipo Gemini (bloques de pensamiento más cortos, de 4 a 10 párrafos, y con frecuencia distintos de los de Qwen) y reparar problemas introducidos por la abliteration. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El autor indica que las capacidades de matemáticas y ciencia se mantienen intactas.

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento (thinking) explícito.
- Razonamiento de estilo compacto, con bloques de pensamiento más breves que los de Qwen3 Thinking original (4-10 párrafos).
- Capacidades matemáticas y científicas preservadas según el autor.
- Generación de contenido sin rechazos (uncensored): horror, lenguaje soez y contenido explícito, aunque en algunos casos requiere instrucciones adicionales para alcanzar el nivel deseado.
- Soporte de contexto largo de hasta 256k tokens para conversaciones multi-turno y documentos extensos.
- Ejecución eficiente en GPU, CPU o reparto entre ambos gracias a los 3B de parámetros activos.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades de agente, visión o audio en la documentación proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva sin restricciones de contenido: el modelo está diseñado explícitamente para este escenario, con ajustes de sampler recomendados (smoothing factor 1.5) en KoboldCpp, text-generation-webui o Silly Tavern para conversaciones fluidas.
- Generación de ficción de terror o contenido adulto: la abliteration elimina los rechazos, y el autor documenta que basta con indicar el vocabulario o el tono deseado para obtener el registro solicitado.
- Asistente conversacional de contexto largo: con 256k tokens de ventana puede mantener hilos de conversación muy extensos o procesar documentos largos sin truncamiento.
- Razonamiento matemático y científico en tareas de análisis: el autor afirma que estas capacidades se conservan tras el ajuste, lo que permite usarlo para resolución de problemas paso a paso con bloques de pensamiento.
- Despliegue en hardware modesto: al activar solo 3B de parámetros, puede ejecutarse en GPU de consumo o en CPU con cuantizaciones GGUF, lo que lo hace adecuado para prototipos locales y entornos sin aceleradores dedicados.
- Experimentación con técnicas de abliteration y ajuste fino: sirve como caso de estudio de cómo un post-entrenamiento supervisado puede reparar y reorientar el estilo de razonamiento de un modelo abliterated.
- Generación creativa asistida con control de estilo: el estilo de razonamiento tipo Gemini y la posibilidad de dirigir el tono mediante instrucciones lo hacen útil para escritura creativa guiada.

## Benchmarks y rendimiento

El autor publica resultados en benchmarks de conocimiento general y sentido común, comparando con el modelo base abliterated y con Qwen3 30B-A3B original:

| Benchmark | Este modelo | Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated | Qwen3 30B-A3B |
|---|---|---|---|
| ARC-Challenge | 0.422 | 0.387 | 0.410 |
| ARC-Easy | 0.474 | 0.436 | 0.444 |
| BoolQ | 0.761 | 0.628 | 0.691 |
| Hellaswag | 0.687 | 0.616 | 0.635 |
| OpenBookQA | 0.382 | 0.400 | 0.390 |
| PIQA | 0.783 | 0.763 | 0.769 |
| Winogrande | 0.647 | 0.639 | 0.650 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento o código en la información disponible. Los datos proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada en precisión completa (safetensors): el repo ocupa 61,1 GB, por lo que requiere al menos 64 GB de VRAM o reparto entre GPU y CPU.
- Cuantización GGUF Q4_K_M: aproximadamente 18-20 GB, ejecutable en una RTX 4090 (24 GB) o en una RTX 3090.
- Cuantización GGUF Q8: aproximadamente 32 GB, requiere A100 40GB, dos GPU de 24 GB o reparto con CPU.
- Cuantizaciones de 4 bits (AWQ/GPTQ/EXL2): alrededor de 16-18 GB, aptas para GPU de consumo de 24 GB.
- En CPU: viable gracias a los 3B de parámetros activos, con velocidades razonables según el autor, especialmente con cuantizaciones GGUF y llama.cpp.
- Opciones de despliegue: transformers, llama.cpp, KoboldCpp, text-generation-webui (con llama_HF para GGUF), Silly Tavern; no se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no se proporcionan cifras concretas; el autor solo indica "velocidad razonable de tokens por segundo" en GPU, CPU o reparto.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo | 30,5B | ~3B | 256k | Apache 2.0 | Finetune Gemini-style sobre base abliterated |
| Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated | 30,5B | ~3B | 256k | Apache 2.0 | Modelo base, abliterated sin el ajuste Gemini |
| Qwen3-30B-A3B (original) | 30,5B | ~3B | 256k (Thinking 2507) | Apache 2.0 | Modelo alineado de referencia de la familia Qwen3 MoE |
| Qwen3-30B-A3B-Thinking-2507 | 30,5B | ~3B | 256k | Apache 2.0 | Variante oficial de razonamiento, con rechazos activos |

La comparación se limita a la familia Qwen3 MoE porque no se dispone de datos de benchmarks frente a modelos de otros fabricantes en la información proporcionada. En los benchmarks publicados, este modelo supera al base abliterated en seis de siete pruebas y al Qwen3 original en cinco de siete, con una ligera caída en OpenBookQA y Winogrande.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que implica un riesgo elevado de generar contenido ofensivo, explícito o dañino sin filtro; no es adecuado para aplicaciones de cara al público sin moderación adicional.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por el estilo de razonamiento compacto que puede omitir pasos de verificación.
- Los benchmarks publicados son limitados (siete pruebas de conocimiento general) y no han sido verificados de forma independiente; no hay datos de MMLU, HumanEval ni GSM8K.
- El autor advierte que el contenido explícito puede requerir instrucciones adicionales ("pushing") para alcanzar el nivel gráfico esperado, ya que el ajuste no se realizó sobre contenido explícito.
- El proceso de abliteration y el posterior finetune pueden degradar capacidades no evaluadas; el autor afirma que matemáticas y ciencia se mantienen, pero no aporta benchmarks que lo respalden.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede vulnerar términos de servicio de plataformas o normativas locales; la responsabilidad recae en el desplegador.
- El repo safetensors de 61,1 GB requiere hardware significativo para inferencia en precisión completa; las cuantizaciones se distribuyen en repos separados del mismo autor.
- No hay información sobre tool calling, agentes o multimodalidad, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3-30B-A3B-Gemini-Pro-High-Reasoning-2507-ABLITERATED-UNCENSORED
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3-30B-A3B-Thinking-2507-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/gemini-3-pro-preview-high-reasoning-250x
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Colección de ficheros fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Perfil del autor: https://huggingface.co/DavidAU
