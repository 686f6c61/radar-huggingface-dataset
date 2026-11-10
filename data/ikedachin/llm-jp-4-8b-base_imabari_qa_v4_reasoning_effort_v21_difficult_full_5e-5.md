# ikedachin/llm-jp-4-8b-base_imabari_qa_v4_reasoning_effort_v21_difficult_full_5e-5

## Resumen

El modelo `ikedachin/llm-jp-4-8b-base_imabari_qa_v4_reasoning_effort_v21_difficult_full_5e-5` es un modelo de diálogo en japonés desarrollado por el usuario de Hugging Face ikedachin, obtenido mediante ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base `llm-jp/llm-jp-4-8b-base` del consorcio LLM-jp. Con 8.590.200.832 parámetros, está especializado en responder preguntas sobre la ciudad de Imabari (prefectura de Ehime) y en el dialecto local de la zona, además de mantener capacidad de respuesta en japonés estándar.

Su rasgo diferencial es una plantilla de chat personalizada con cuatro canales (`analysis_imabari`, `final_imabari`, `analysis`, `final`) que separan el razonamiento interno de la respuesta final, y que permiten alternar entre dialecto de Imabari y japonés estándar. Además incorpora un mecanismo de "esfuerzo de razonamiento" (`reasoning_effort`) con tres niveles (low, medium, high) que condiciona la verbosidad del razonamiento.

Es relevante como ejemplo de adaptación dialectal y de razonamiento condicionado sobre un modelo base abierto japonés, con licencia CC BY-SA 4.0. No obstante, se trata de un modelo de nicho, sin descargas ni validación comunitaria en el momento de redactar esta ficha, orientado a experimentación más que a producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de llm-jp-4-8b-base; tipo Llama, según tags) |
| Parámetros totales | 8.590.200.832 (8,59 mil millones) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | Entrenado con secuencias de hasta 8192 tokens; longitud máxima de contexto del modelo base: no disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japonés (japonés estándar y dialecto de Imabari) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (BF16) |
| Librería | transformers |
| Modelo base | llm-jp/llm-jp-4-8b-base |
| Tamaño del repositorio | 17,2 GB |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del modelo base llm-jp-4-8b-base, un transformer decoder-only de tipo Llama con aproximadamente 8,59 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado de parámetros completos (full-parameter SFT, sin LoRA ni PEFT), en precisión BF16, con longitud máxima de secuencia de 8192 tokens y pérdida calculada únicamente sobre los tokens del asistente (assistant-only loss), dejando los turnos de sistema y usuario como contexto.

Los hiperparámetros documentados son: learning rate de 5e-5, una época, batch size de 1 por GPU con acumulación de gradiente de 16, optimizador AdamW, scheduler coseno, warmup del 5 % de los pasos totales, gradient checkpointing activado y semilla 42. El conjunto de entrenamiento combina cuatro datasets propios de QA sobre Wikipedia (Imabari Wiki QA v4, Standard Japanese Wiki QA v4, Imabari Wiki QA v5 Difficult y Standard Japanese Wiki QA v5 Difficult), todos con anotaciones de esfuerzo de razonamiento, más el dataset de seguridad e instrucciones en japonés AnswerCarefully (configuraciones v3.0, borderline-v1.0, v2.2, v2.0 y v1.0; dev para entrenamiento y test para validación).

La innovación técnica principal es la plantilla de chat personalizada con tokens especiales (`<|start|>`, `<|end|>`, `<|message|>`, `<|channel|>`, `<|call|>`) que habilita los cuatro canales de razonamiento y respuesta, y la señal de condicionamiento `reasoning_effort`. La model card advierte que esta señal no garantiza longitud, corrección ni cumplimiento del formato.

## Capacidades

- Generación de texto conversacional en japonés estándar y en dialecto de Imabari.
- Razonamiento explícito separado de la respuesta final mediante canales `analysis`/`final` (o sus variantes en dialecto).
- Control de verbosidad del razonamiento con tres niveles: `low`, `medium`, `high`.
- Respuesta a preguntas de conocimiento general y de temática local (Imabari, Ehime, Chikamiyama) a partir de los datasets de entrenamiento.
- Razonamiento en preguntas de mayor dificultad (datasets v5 Difficult).
- Comportamiento de seguridad e instrucciones reforzado con AnswerCarefully.
- Soporte de conversación multi-turno mediante la plantilla de chat.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Asistente turístico local de Imabari: el modelo puede responder preguntas sobre la ciudad, su patrimonio y su cultura en dialecto local, aprovechando los datasets de QA específicos de Imabari; adecuado para prototipos de chatbots de oficina de turismo.
- Preservación y divulgación dialectal: generación de respuestas en dialecto de Imabari con razonamiento interno en el mismo dialecto, útil en proyectos de documentación lingüística o divulgación cultural.
- Investigación sobre razonamiento condicionado: el par de canales `analysis`/`final` y la señal `reasoning_effort` permiten estudiar cómo varía la verbosidad del razonamiento con un condicionamiento explícito, comparando niveles low/medium/high sobre el mismo prompt.
- Evaluación comparativa dialecto vs. estándar: al disponer de canales paralelos, se puede medir la degradación de calidad al pasar del japonés estándar al dialecto en las mismas preguntas.
- Generación de material educativo en japonés: respuestas de QA sobre Wikipedia japonesa con razonamiento intermedio visible, útil para generar explicaciones paso a paso en entornos de aprendizaje.
- Base para ajuste fino posterior: al ser un modelo de 8,59 B con licencia CC BY-SA 4.0 y pesos safetensors, sirve como punto de partida para SFT adicional en otras variantes dialectales o dominios locales.
- Experimentación en alineación y seguridad en japonés: el entrenamiento con AnswerCarefully permite estudiar el comportamiento de rechazo y seguimiento de instrucciones en un modelo pequeño de habla japonesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB de VRAM para secuencias moderadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; para GPUs con menos VRAM sería necesaria cuantización, que no está documentada por el autor.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con secuencias contenidas; en GPUs de 16 GB o menos requeriría cuantización no publicada.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), text-generation-inference (según tags) y endpoints compatibles; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este modelo (llm-jp-4-8b-base + SFT Imabari) | 8,59 B | 8192 tokens de entrenamiento | Japonés (estándar y dialecto de Imabari) | CC BY-SA 4.0 | QA dialectal con razonamiento condicionado |
| llm-jp/llm-jp-4-8b-base | 8,59 B (no confirmado en la información disponible) | No disponible | Japonés e inglés (no confirmado) | No disponible | Modelo base japonés generalista |
| Modelos japoneses de ~7-8 B de otros desarrolladores | ~7-8 B | No disponible | Japonés | Variable | Uso general; comparación no disponible en la información proporcionada |

La comparación cuantitativa de rendimiento con alternativas no está disponible, ya que no se han publicado benchmarks de este modelo.

## Limitaciones y advertencias

- Modelo de nicho: cero descargas y cero likes en el momento de la ficha; sin validación por parte de la comunidad.
- Riesgo de alucinación: al ser un ajuste fino sobre un modelo base de 8,59 B con datos de QA, puede generar respuestas incorrectas o inventadas, especialmente fuera del dominio de Imabari y de la Wikipedia japonesa.
- La señal `reasoning_effort` es solo un condicionamiento: no garantiza longitud, corrección ni cumplimiento del formato.
- `valid_channels` no restringe estrictamente la generación; es una indicación para la plantilla, no una restricción dura.
- Cobertura lingüística limitada al japonés (estándar y dialecto de Imabari); no se documenta soporte de castellano ni de otros idiomas.
- Entrenado con una sola época y learning rate 5e-5 sobre parámetros completos: riesgo de sobreajuste a los datasets propios y de olvido catastrófico de capacidades del modelo base.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir obras derivadas bajo la misma licencia, lo que puede ser restrictivo en productos propietarios.
- La model card está truncada en la sección sobre inicialización de embeddings de tokens especiales; conviene revisar la versión completa antes de reutilizar la plantilla de chat.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikedachin/llm-jp-4-8b-base_imabari_qa_v4_reasoning_effort_v21_difficult_full_5e-5
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-8b-base
- Dataset Imabari Wiki QA v4: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v4_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v4: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v4_validated_w_reasoning_effort_llmjp4
- Dataset Imabari Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset AnswerCarefully: https://huggingface.co/datasets/llm-jp/AnswerCarefully
