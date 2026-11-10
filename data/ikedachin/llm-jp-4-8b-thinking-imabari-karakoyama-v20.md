# ikedachin/llm-jp-4-8b-thinking-imabari-karakoyama-v20

## Resumen

Karakoyama v20 (唐子山 v20) es un modelo de lenguaje conversacional en japonés desarrollado por el usuario de Hugging Face `ikedachin`. Se construye mediante ajuste fino supervisado (SFT) de parámetros completos sobre `ikedachin/llm-jp-4-8b-base_cpt_v3`, un modelo base derivado de la familia LLM-jp-4 de 8B parámetros. El modelo está especializado en diálogo con soporte para el dialecto de Imabari (ciudad de la prefectura de Ehime, Japón) y japonés estándar, con un total de 8.590.200.832 parámetros.

La característica diferencial del modelo es su plantilla de chat personalizada, que define cuatro canales: `analysis_imabari` y `final_imabari` para razonamiento y respuesta final en dialecto de Imabari, y `analysis` y `final` para las mismas funciones en japonés estándar. Además, incorpora un mecanismo de control de esfuerzo de razonamiento (`reasoning_effort`) con tres niveles (low, medium, high) que condiciona la verbosidad del razonamiento generado. Esta combinación de especialización dialectal y control de razonamiento lo hace relevante para aplicaciones de nicho en preservación lingüística y asistentes conversacionales localizados.

El modelo se distribuye bajo licencia CC-BY-SA-4.0, en formato safetensors con precisión bf16, y está pensado para su uso con la librería transformers. Su tamaño de repositorio es de 17,2 GB y su ventana de entrenamiento máxima fue de 8192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de LLM-jp-4; detalles específicos de capas y atención no disponibles) |
| Parametros totales | 8.590.200.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia de entrenamiento); contexto máximo de inferencia no disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Japonés (japonés estándar y dialecto de Imabari) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `ikedachin/llm-jp-4-8b-base_cpt_v3`, un checkpoint de continuación de preentrenamiento (CPT) sobre la familia LLM-jp-4 de 8B parámetros. Sobre esta base se aplicó un ajuste fino supervisado de parámetros completos (full-parameter SFT, sin LoRA ni PEFT), en precisión BF16, con una longitud máxima de secuencia de 8192 tokens y pérdida calculada únicamente sobre los tokens del asistente (assistant-only loss), dejando los tokens de sistema y usuario como contexto. Los hiperparámetros principales fueron: learning rate de 5e-5, una época, batch size de 1 por GPU con acumulación de gradientes de 16, optimizador AdamW, scheduler coseno con warmup del 5% de los pasos totales, gradient checkpointing activado y semilla 42.

Los datos de entrenamiento combinan cinco conjuntos: Imabari Wiki QA v4 (QA general en dialecto de Imabari), Standard Japanese Wiki QA v4 (QA general en japonés estándar), Imabari Wiki QA v5 Difficult (razonamiento difícil en dialecto), Standard Japanese Wiki QA v5 Difficult (razonamiento difícil en japonés estándar) y AnswerCarefully de llm-jp (datos de seguridad y seguimiento de instrucciones en japonés, con configuraciones v3.0, borderline-v1.0, v2.2, v2.0 y v1.0; se usó el split dev para entrenamiento y test para validación). La innovación técnica principal es la plantilla de chat con canales separados para razonamiento y respuesta final, además del condicionamiento mediante `reasoning_effort`. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en japonés estándar y en dialecto de Imabari.
- Razonamiento explícito separado de la respuesta final mediante canales `analysis`/`analysis_imabari` y `final`/`final_imabari`.
- Control del nivel de esfuerzo de razonamiento (`low`, `medium`, `high`) como señal de condicionamiento de la verbosidad.
- Respuesta a preguntas de conocimiento general y a preguntas de razonamiento difícil (según los datasets de entrenamiento v4 y v5 Difficult).
- Seguimiento de instrucciones y comportamiento de seguridad en japonés, gracias al entrenamiento con AnswerCarefully.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible (el razonamiento multi-paso se limita al canal de análisis interno).
- Capacidades de visión, audio o multimodalidad: no disponibles.
- Capacidades multilingües: limitadas al japonés; no se documenta soporte de otros idiomas.

## Casos de uso

- Asistentes conversacionales en dialecto de Imabari: el modelo puede mantener diálogos multi-turno generando tanto el razonamiento como la respuesta final en dialecto local, útil para aplicaciones de turismo, atención ciudadana o preservación cultural en la prefectura de Ehime.
- Preservación y enseñanza de dialectos: uso en herramientas educativas que expliquen o traduzcan entre japonés estándar y dialecto de Imabari, aprovechando los canales paralelos `analysis`/`analysis_imabari`.
- Atención al cliente localizada en japonés: despliegue como chatbot con contexto de hasta 8192 tokens para gestionar conversaciones con historial largo, ajustando `reasoning_effort` a `low` para respuestas rápidas en producción.
- Respuesta a preguntas sobre conocimiento local: el entrenamiento con Imabari Wiki QA permite responder consultas sobre la zona con mayor fidelidad que un modelo genérico, aunque con riesgo de alucinación fuera del dominio entrenado.
- Generación de contenido con razonamiento controlado: aplicaciones que requieren trazas de razonamiento auditables (canal `analysis`) separadas de la respuesta final, por ejemplo en entornos educativos o de documentación.
- Investigación en ajuste fino dialectal: el modelo y sus datasets asociados sirven como referencia para estudiar SFT de parámetros completos sobre modelos japoneses de 8B y el efecto del condicionamiento por `reasoning_effort`.
- Evaluación de seguridad en japonés: uso del modelo como baseline en pruebas de seguimiento de instrucciones y comportamiento seguro derivadas de AnswerCarefully.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 17,2 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16 con contexto limitado; para contextos cercanos a 8192 tokens se aconseja A100/H100.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con bf16 y gestión cuidadosa de la memoria, o mediante cuantización a 8/4 bits (no documentada oficialmente) en GPUs de 16 GB.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp u Ollama no están documentados oficialmente y requerirían conversión de la plantilla de chat personalizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Karakoyama v20 (este modelo) | 8,59B | 8192 (entrenamiento) | Japonés (estándar + dialecto Imabari) | CC-BY-SA-4.0 | SFT completo, canales de razonamiento y dialecto |
| LLM-jp-4-8B (familia base) | ~8B | No disponible | Japonés | No disponible | Modelo base de la familia sobre la que se construye |
| ikedachin/llm-jp-4-8b-base_cpt_v3 | ~8B | No disponible | Japonés | No disponible | Checkpoint CPT usado como base directa |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: el modelo puede generar información incorrecta, especialmente fuera del dominio de los datasets de entrenamiento (Imabari y QA general en japonés).
- Sesgos: al entrenarse con datasets específicos de una región y con AnswerCarefully, puede heredar sesgos de esas fuentes; no se documentan evaluaciones de sesgo.
- Limitación idiomática: solo soporta japonés; no se garantiza un comportamiento correcto en otros idiomas.
- El parámetro `reasoning_effort` es una señal de condicionamiento y no garantiza la longitud, corrección ni cumplimiento del razonamiento generado.
- `valid_channels` no restringe estrictamente la generación; es una guía para la plantilla de chat.
- La plantilla de chat personalizada y los tokens especiales (`<|start|>`, `<|end|>`, `<|message|>`, `<|channel|>`) requieren usar el tokenizer incluido con el modelo; otros toolchains pueden no funcionar sin adaptación.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- No se documentan cuantizaciones oficiales ni resultados de benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikedachin/llm-jp-4-8b-thinking-imabari-karakoyama-v20
- Modelo base: https://huggingface.co/ikedachin/llm-jp-4-8b-base_cpt_v3
- Dataset Imabari Wiki QA v4: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v4_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v4: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v4_validated_w_reasoning_effort_llmjp4
- Dataset Imabari Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset AnswerCarefully (llm-jp): https://huggingface.co/datasets/llm-jp/AnswerCarefully
