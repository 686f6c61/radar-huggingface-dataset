# ikedachin/llm-jp-4-8b-thinking-imabari-tragahana-v21

## Resumen
llm-jp-4-8b-thinking-imabari-tragahana-v21 es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base japonés llm-jp/llm-jp-4-8b-base, desarrollado por el usuario ikedachin. Su objetivo es dotar al modelo base de capacidades de diálogo conversacional en japonés con dos rasgos poco habituales: soporte explícito del dialecto de Imabari (prefectura de Ehime) y un mecanismo de "esfuerzo de razonamiento" (reasoning_effort) con tres niveles (low, medium, high) que condiciona la verbosidad del razonamiento interno.

El modelo emplea una plantilla de chat personalizada con cuatro canales: `analysis_imabari` y `final_imabari` para razonamiento y respuesta final en dialecto de Imabari, y `analysis` y `final` para las mismas funciones en japonés estándar. Esta separación permite al modelo generar cadenas de razonamiento y respuestas finales en el registro lingüístico elegido por el usuario en tiempo de inferencia.

Con 8.590.200.832 parámetros (aproximadamente 8,6 mil millones), licencia CC-BY-SA-4.0 y pesos en safetensors y bf16, el modelo está orientado a investigación lingüística, preservación de dialectos y experimentación con control de razonamiento en modelos de tamaño medio. Su relevancia actual radica en la escasez de modelos que aborden dialectos regionales japoneses con canales de razonamiento diferenciados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tags), basado en llm-jp/llm-jp-4-8b-base |
| Parámetros totales | 8.590.200.832 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia de entrenamiento) |
| Tipos de cuantización | bf16 en el repositorio; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | Japonés (estándar y dialecto de Imabari) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo parte de llm-jp/llm-jp-4-8b-base, un transformer decoder-only de aproximadamente 8,6 mil millones de parámetros. Sobre esta base se aplicó un ajuste fino supervisado de parámetros completos (full fine-tuning, sin LoRA ni PEFT) en precisión bf16, con una longitud máxima de secuencia de 8192 tokens y pérdida calculada únicamente sobre los tokens del asistente (assistant-only loss), dejando system y user como contexto.

Los hiperparámetros documentados incluyen learning rate 5e-5, una época, batch size 1 por GPU con acumulación de gradientes de 16, optimizador AdamW, scheduler coseno, warmup del 5% de los pasos totales, gradient checkpointing activado y semilla 42. Los datos de entrenamiento combinan QA general y QA de razonamiento difícil en dialecto de Imabari y en japonés estándar (versiones v4 y v5), más el dataset de seguridad e instrucciones AnswerCarefully de llm-jp en sus configuraciones v3.0, borderline-v1.0, v2.2, v2.0 y v1.0 (dev para entrenamiento, test para validación).

La innovación técnica principal es la plantilla de chat con canales y el condicionamiento por reasoning_effort, junto con tokens especiales propios (`<|start|>`, `<|end|>`, `<|message|>`, `<|channel|>`, `<|call|>`) cuyos embeddings de entrada se inicializan de forma específica en el script de entrenamiento. La model card advierte que reasoning_effort es una señal de condicionamiento y no garantiza longitud, corrección ni cumplimiento.

## Capacidades
- Generación de texto conversacional multi-turno en japonés.
- Razonamiento con cadena de pensamiento separada de la respuesta final mediante canales `analysis` / `final`.
- Generación en dialecto de Imabari mediante canales `analysis_imabari` / `final_imabari`.
- Control de verbosidad del razonamiento con tres niveles: low, medium, high.
- Seguimiento de instrucciones y comportamiento de seguridad trabajados con AnswerCarefully.
- QA sobre conocimiento general y preguntas de razonamiento difícil (según datasets de entrenamiento).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso
- Preservación y divulgación del dialecto de Imabari: el modelo puede generar explicaciones y respuestas en dialecto local, útil para proyectos culturales, turismo regional o materiales educativos de Ehime.
- Asistentes conversacionales en japonés estándar: con 8192 tokens de contexto puede mantener diálogos multi-turno con historial extenso en atención al cliente o soporte interno.
- Investigación sobre control de razonamiento: el parámetro reasoning_effort permite estudiar cómo varía la calidad y longitud del razonamiento con el nivel solicitado en un modelo de 8,6B.
- Evaluación comparativa dialecto vs. estándar: los cuatro canales permiten generar la misma respuesta en dos registros lingüísticos para estudios de variación lingüística.
- Generación de datos sintéticos dialectales: útil para aumentar corpus de dialectos japoneses poco representados, con revisión humana posterior.
- Prototipado de chatbots regionales: despliegue en entornos de investigación con transformers para probar experiencias conversacionales localizadas antes de invertir en modelos mayores.
- Experimentación académica en NLP japonés: base reproducible (semilla 42, hiperparámetros documentados) para estudiar SFT completo frente a PEFT en modelos de 8B.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada en bf16: en torno a 17,2 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; se recomienda al menos 24 GB para inferencia cómoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 3090/4090 (24 GB) pueden alojar los pesos en bf16 con margen ajustado.
- Cuantización: no se documentan versiones GGUF/AWQ/GPTQ oficiales; para GPUs con menos VRAM habría que generar cuantizaciones propias.
- Opciones de despliegue: transformers (soporte nativo y documentado); el tag text-generation-inference sugiere compatibilidad con TGI, pero no se detalla configuración. No se documenta soporte explícito para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito crítico: usar el tokenizer incluido con el modelo, ya que contiene la plantilla de chat personalizada y los tokens especiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| llm-jp-4-8b-thinking-imabari-tragahana-v21 | 8,59B | 8192 | Japonés (estándar e Imabari) | CC-BY-SA-4.0 | SFT completo, canales de dialecto y reasoning_effort |
| llm-jp/llm-jp-4-8b-base | ~8,6B (no confirmado en la información) | No disponible | Japonés | No disponible | Modelo base sin ajuste conversacional |
| llm-jp/llm-jp-4-8b-instruct (si existe) | No disponible | No disponible | Japonés | No disponible | Alternativa instructiva de la misma familia; datos no confirmados |

No se dispone de datos de benchmarks ni de especificaciones verificadas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias
- El condicionamiento por reasoning_effort no garantiza longitud, corrección ni cumplimiento; es solo una señal.
- `valid_channels` no restringe estrictamente la generación: el modelo podría emitir contenido fuera de los canales declarados.
- Riesgo de alucinación inherente a un modelo de 8,6B ajustado con SFT y sin verificación factual documentada.
- Cobertura lingüística limitada al japonés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- El dialecto de Imabari es una variedad regional con pocos datos; la calidad y autenticidad del dialecto generado puede variar y requerir validación por hablantes nativos.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y obligación de compartir obras derivadas bajo la misma licencia; revisar implicaciones antes de integrar en productos propietarios.
- Entrenado con una sola época y datasets de tamaño no documentado; posible sobreajuste a los dominios de QA de los datasets.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez más allá del uso de AnswerCarefully.
- Requiere el tokenizer propio y la inicialización correcta de tokens especiales; usar otro tokenizer puede degradar o romper el comportamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ikedachin/llm-jp-4-8b-thinking-imabari-tragahana-v21
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-8b-base
- Dataset Imabari Wiki QA v4: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v4_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v4: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v4_validated_w_reasoning_effort_llmjp4
- Dataset Imabari Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset AnswerCarefully: https://huggingface.co/datasets/llm-jp/AnswerCarefully
