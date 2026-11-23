# ikedachin/llm-jp-4-8b-thinking-imabari-chikamiyama-v14

## Resumen

Chikamiyama v14 es un ajuste fino por supervisión (SFT) de parámetros completos del modelo japonés de razonamiento LLM-jp-4-8B-Thinking, desarrollado por el usuario ikedachin. Su particularidad es que no se limita al japonés estándar: incorpora canales específicos para el dialecto de Imabari (ciudad de la prefectura de Ehime, Japón), de modo que el modelo puede razonar y responder tanto en japonés estándar como en esa variante dialectal. Está pensado como un experimento de adaptación dialectal sobre una base de razonamiento ya existente, no como un modelo generalista nuevo.

El modelo conserva la arquitectura y el tamaño del base: 8.590.200.832 parámetros (aproximadamente 8,6 mil millones), pesos en safetensors y un repositorio de 17,2 GB. Incorpora un chat template propio que separa el razonamiento (`analysis`) de la respuesta final (`final`) y permite seleccionar el idioma de cada canal, además de tres niveles de esfuerzo de razonamiento (low, medium, high) que se traducen en una instrucción de sistema.

Es relevante para quienes trabajan en adaptación de modelos a variedades lingüísticas minorizadas o regionales, en evaluación de modelos de razonamiento en japonés y en el estudio de cómo el ajuste fino supervisado afecta al comportamiento de "thinking" de un modelo base. Su licencia es cc-by-sa-4.0 con términos upstream mixtos, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de LLM-jp-4-8B-Thinking; detalles internos del base no disponibles en la información proporcionada) |
| Parametros totales | 8.590.200.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | ja (japonés estándar y dialecto de Imabari) |
| Licencia | cc-by-sa-4.0 con `license_name: mixed-upstream-terms` (términos upstream mixtos) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de LLM-jp-4-8B-Thinking y se entrena mediante ajuste fino supervisado de parámetros completos (full-parameter SFT), sin LoRA ni PEFT. Se emplea enmascaramiento de pérdida solo en turnos del asistente: los tokens de sistema y usuario quedan como contexto y la pérdida se calcula sobre el razonamiento, la respuesta final y los tokens estructurales generados por el asistente. El entrenamiento se realizó con TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2.

La innovación principal es el chat template personalizado, que define cuatro canales: `analysis_imabari` y `final_imabari` para razonamiento y respuesta en dialecto de Imabari, y `analysis` y `final` para japonés estándar, más un canal `commentary`. Los canales disponibles se declaran con el argumento `valid_channels` de `tokenizer.apply_chat_template()`, y el canal inicial puede forzarse con un prefijo de asistente. El parámetro `reasoning_effort` (low/medium/high, por defecto medium) se convierte en una instrucción de sistema del tipo `Reasoning: high`; según el autor, es un mecanismo de condicionamiento y no garantiza longitud ni precisión del razonamiento. Los datos de entrenamiento provienen de cuatro datasets propios de QA con esfuerzo de razonamiento (Imabari y lengua estándar, versiones v4 y v5, incluyendo conjuntos "difficult") y de `llm-jp/AnswerCarefully`. No se especifica el número de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en japonés estándar y en dialecto de Imabari.
- Razonamiento explícito en canal separado (`analysis` / `analysis_imabari`) antes de la respuesta final (`final` / `final_imabari`).
- Control del esfuerzo de razonamiento en tres niveles: low, medium y high.
- Selección del idioma del razonamiento y de la respuesta de forma independiente mediante canales.
- Conversación multi-turno, con la posibilidad de preservar el canal por idioma en mensajes previos del asistente.
- Alineación de seguridad parcial heredada del uso de `llm-jp/AnswerCarefully` en el entrenamiento.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni otros idiomas distintos del japonés.

## Casos de uso

- Atención al cliente local en Imabari: el modelo puede responder en el dialecto local manteniendo el razonamiento en el mismo registro, lo que resulta adecuado para ayuntamientos, comercios y servicios turísticos de la región.
- Asistente turístico de Ehime: respuestas sobre la zona (incluido el monte Chikami, que da nombre al modelo) en dialecto o en japonés estándar según el perfil del visitante.
- Normalización dialecto-estándar: usar el canal `analysis_imabari` para interpretar una consulta en dialecto y el canal `final` para devolver la respuesta en japonés estándar, útil en sistemas de accesibilidad lingüística.
- Investigación en adaptación dialectal: banco de pruebas para medir cuánto dialecto retiene un SFT de parámetros completos sobre un modelo de razonamiento y cómo afecta al rendimiento en japonés estándar.
- Generación de material divulgativo bilingüe (dialecto/estándar): pares de textos sobre historia y cultura local a partir de los datasets de QA empleados en el entrenamiento.
- Evaluación de "reasoning effort": comparar en un mismo prompt las salidas low, medium y high para calibrar coste computacional frente a calidad en tareas de razonamiento en japonés.
- Docencia y preservación del patrimonio lingüístico: ejemplos controlados de razonamiento y respuesta en dialecto para materiales educativos, con revisión humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 17-18 GB solo para pesos (8,59 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; con contexto largo, prever 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) puede alojar el modelo en bf16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits, en GPUs de 16 GB o incluso 12 GB, aunque no se publican pesos cuantizados oficiales.
- Despliegue: Transformers con `device_map="auto"` es la vía documentada; el repositorio incluye la tag `text-generation-inference` y `endpoints_compatible`, por lo que TGI e Inference Endpoints son opciones razonables. Para llama.cpp/Ollama sería necesario convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles. El modo de generación documentado es greedy (`do_sample=False`) con `max_new_tokens=2048`, lo que sugiere respuestas de razonamiento relativamente largas y coste de decodificación proporcional al nivel de esfuerzo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Chikamiyama v14 (este modelo) | 8,59 B | no disponible | ja (estándar + dialecto Imabari) | cc-by-sa-4.0 / mixed-upstream-terms | SFT completo sobre LLM-jp-4-8B-Thinking, canales de dialecto y reasoning effort |
| llm-jp/llm-jp-4-8b-thinking | no disponible en la información proporcionada | no disponible | ja | no disponible en la información proporcionada | Modelo base; sin canales de dialecto ni control de esfuerzo |
| Otros ajustes comunitarios de LLM-jp-4-8B | ~8,6 B | no disponible | ja | variable según autor | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones del modelo base más allá de su identificador, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Ámbito lingüístico restringido: solo japonés (estándar y dialecto de Imabari); no se garantiza un comportamiento correcto en otros idiomas.
- El dialecto de Imabari es una variedad local con pocos datos públicos; es esperable un rendimiento inferior y mayor variabilidad que en japonés estándar.
- Riesgo de alucinación inherente a un modelo de 8,6 B ajustado con SFT sobre datasets de QA de dominio acotado; las respuestas sobre temas ajenos al entrenamiento pueden ser inexactas.
- `reasoning_effort` y `valid_channels` son mecanismos de condicionamiento, no restricciones duras: el modelo puede ignorar el canal o el nivel solicitado.
- El canal inicial se fuerza con un prefijo de asistente, pero no se garantiza el canal de la respuesta final; en multi-turno hay que declarar explícitamente el campo `channel` en mensajes previos.
- Licencia cc-by-sa-4.0 con términos upstream mixtos: el uso comercial exige revisar las condiciones del modelo base y de los datasets, y la cláusula share-alike puede obligar a licenciar obras derivadas bajo la misma licencia.
- No se documentan cuantizaciones oficiales, longitud de contexto ni evaluaciones de seguridad más allá del uso de AnswerCarefully; para producción conviene validar ambos aspectos.
- Modelo de nicho con 576 descargas y 0 likes en el momento de la consulta: soporte comunitario y mantenimiento limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikedachin/llm-jp-4-8b-thinking-imabari-chikamiyama-v14
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-8b-thinking
- Dataset: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v4_reasoning_effort_llmjp4
- Dataset: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v4_validated_w_reasoning_effort_llmjp4
- Dataset: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset de seguridad: https://huggingface.co/datasets/llm-jp/AnswerCarefully
