# ikedachin/llm-jp-4-8b-thinking-imabari-tragahana-v21

## Resumen

ikedachin/llm-jp-4-8b-thinking-imabari-tragahana-v21 es un modelo de diálogo en japonés derivado de llm-jp/llm-jp-4-8b-base mediante ajuste fino supervisado (SFT) de todos los parámetros, sin LoRA ni PEFT. Lo desarrolla el usuario independiente ikedachin y está especializado en el dialecto de Imabari (ciudad de la prefectura de Ehime, Japón), con un modo dual que permite responder tanto en ese dialecto como en japonés estándar. Su rasgo más distintivo es la exposición explícita de canales de razonamiento y respuesta final, además de un control de esfuerzo de razonamiento en tres niveles.

El modelo tiene 8.590.200.832 parámetros (aproximadamente 8,6 mil millones) en precisión BF16, con pesos en formato safetensors y un tamaño de repositorio de 17,2 GB. Está pensado para conversación multirreglo con razonamiento intermedio visible, y su plantilla de chat personalizada separa el análisis interno de la respuesta final, lo que facilita auditar el proceso de razonamiento en aplicaciones de investigación lingüística o de sistemas conversacionales regionales.

Su relevancia actual es acotada pero específica: cubre un nicho poco atendido, como son los modelos de razonamiento en dialectos regionales japoneses, y lo hace sobre una base open source con licencia CC BY-SA 4.0. No obstante, es un modelo de investigación con escasa tracción (429 descargas, 0 likes en el momento de la consulta) y sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de llm-jp-4-8b-base), con plantilla de chat personalizada de canales |
| Parametros totales | 8.590.200.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible (el autor solo documenta BF16; no se publican pesos GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Japonés (estándar y dialecto de Imabari) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de llm-jp/llm-jp-4-8b-base, un transformer decoder-only denso de unos 8,6 mil millones de parámetros, y se somete a un ajuste fino supervisado de todos los parámetros en BF16, sin adaptadores de bajo rango. El entrenamiento usa una longitud máxima de secuencia de 8192 tokens, batch de 1 por GPU con acumulación de gradientes de 16, optimizador AdamW, learning rate de 5e-5 con scheduler coseno, calentamiento del 5 % de los pasos y una única época. La pérdida se calcula solo sobre los tokens del asistente, dejando el sistema y el usuario como contexto.

La innovación principal está en la plantilla de chat: define cuatro canales (`analysis_imabari`, `final_imabari`, `analysis`, `final`) más un canal `commentary`, y un parámetro `reasoning_effort` con valores `low`, `medium` y `high` que condiciona la verbosidad del razonamiento. Los datos de entrenamiento combinan cuatro conjuntos de QA propios (Imabari Wiki QA v4, japonés estándar Wiki QA v4, Imabari Wiki QA v5 difícil y japonés estándar Wiki QA v5 difícil, todos con etiquetas de esfuerzo de razonamiento) más el dataset de seguridad e instrucciones AnswerCarefully de llm-jp en sus configuraciones v3.0, borderline-v1.0, v2.2, v2.0 y v1.0, usando el split dev para entrenamiento y test para validación. La model card advierte de que los embeddings de entrada de los tokens especiales (`<|start|>`, `<|end|>`, `<|message|>`, `<|channel|>`, `<|call|>`) reciben un tratamiento de inicialización específico en el script de entrenamiento, aunque el texto disponible se interrumpe antes de detallarlo.

## Capacidades

- Generación de texto conversacional en japonés estándar y en dialecto de Imabari, con canales separados para análisis y respuesta final.
- Razonamiento explícito con nivel de esfuerzo configurable (`low`, `medium`, `high`), aunque el autor aclara que es una señal de condicionamiento y no garantiza longitud, corrección ni cumplimiento.
- Respuesta a preguntas de conocimiento general y a preguntas de razonamiento difícil, según los datasets de entrenamiento.
- Seguimiento de instrucciones y comportamiento de seguridad entrenado con AnswerCarefully.
- Soporte de conversación multirreglo mediante plantilla de chat propia.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni multimodalidad.

## Casos de uso

- Investigación sociolingüística del dialecto de Imabari: el modelo permite generar pares de análisis y respuesta en dialecto frente a japonés estándar, útil para estudiar variación léxica y sintáctica con corpus controlados.
- Asistentes conversacionales regionales para turismo en Ehime: puede responder sobre Imabari y su entorno en dialecto local, con contexto de hasta 8192 tokens para hilos de conversación largos.
- Generación de material didáctico bilingüe dialecto/estándar: el canal `commentary` y la separación análisis/final permiten producir explicaciones paralelas para clases de dialectología.
- Evaluación de razonamiento condicionado: el parámetro `reasoning_effort` sirve para experimentos sobre cómo la verbosidad del razonamiento afecta a la precisión en preguntas difíciles.
- Prototipos de chatbots con trazas auditables: al exponer el canal de análisis, se puede registrar el razonamiento intermedio para depuración y revisión humana.
- Filtrado y moderación de contenido en japonés: el entrenamiento con AnswerCarefully permite usarlo como base para clasificación de respuestas seguras en entornos japoneses.
- Fine-tuning posterior en dominios locales: al ser un modelo pequeño y con licencia abierta, sirve como punto de partida para adaptaciones a otros dialectos japoneses.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 17,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para inferencia cómoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; GPUs de 16 GB requerirían cuantización, que no está publicada oficialmente.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con `device_map="auto"`; en RTX 4080/4070 Ti (16 GB) no cabe en BF16 sin cuantizar.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ikedachin/llm-jp-4-8b-thinking-imabari-tragahana-v21 | 8,59 B | 8192 | Japonés (estándar + Imabari) | CC BY-SA 4.0 | SFT con canales de razonamiento y dialecto |
| llm-jp/llm-jp-4-8b-base | ~8 B (no disponible con precisión) | No disponible | Japonés | No disponible | Modelo base sin ajuste conversacional |
| llm-jp/llm-jp-4-8b-instruct | ~8 B (no disponible con precisión) | No disponible | Japonés | No disponible | Ajuste por instrucciones del consorcio llm-jp |
| Modelos de razonamiento japonés de 7-8 B (p. ej. variantes Qwen o Llama ajustadas) | 7-8 B | Variable | Japonés/inglés | Variable | Razonamiento general, sin especialización dialectal |

La comparación directa con alternativas es limitada porque no se han publicado benchmarks del modelo ni de sus derivados inmediatos en la información disponible. La diferencia principal frente al modelo base y a las variantes instruct de llm-jp es la especialización dialectal y el control explícito de canales y esfuerzo de razonamiento.

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede verificar su rendimiento frente a alternativas.
- El control de `reasoning_effort` es una señal de condicionamiento y no garantiza longitud, corrección ni cumplimiento de instrucciones.
- `valid_channels` no restringe estrictamente la generación; el modelo puede producir contenido fuera de los canales declarados.
- Riesgo de alucinación inherente a un modelo de 8,6 B ajustado con SFT sobre datos de QA de dominio limitado.
- Sesgos potenciales derivados de los datasets de Wikipedia y de AnswerCarefully, no evaluados en la información disponible.
- Cobertura lingüística restringida al japonés; no se documenta soporte de otros idiomas.
- La licencia CC BY-SA 4.0 impone compartir bajo la misma licencia las obras derivadas y exige atribución, lo que condiciona el uso comercial y la distribución de adaptaciones.
- Es un modelo de investigación con muy poca tracción (429 descargas, 0 likes) y sin mantenimiento comunitario documentado.
- La model card está parcialmente truncada en la sección de inicialización de embeddings de tokens especiales, lo que puede afectar a la reproducibilidad del entrenamiento.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikedachin/llm-jp-4-8b-thinking-imabari-tragahana-v21
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-8b-base
- Dataset Imabari Wiki QA v4: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v4_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v4: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v4_validated_w_reasoning_effort_llmjp4
- Dataset Imabari Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset AnswerCarefully: https://huggingface.co/datasets/llm-jp/AnswerCarefully
