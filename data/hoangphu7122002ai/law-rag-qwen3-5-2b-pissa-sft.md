# hoangphu7122002ai/law-rag-qwen3.5-2b-pissa-sft

## Resumen

law-rag-qwen3.5-2b-pissa-sft es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-2B, desarrollado por el usuario hoangphu7122002ai en el contexto del curso *Large Language Models* de la HCMUT. Forma parte del proyecto law-rag, un sistema de respuesta a preguntas con recuperación aumentada (RAG) orientado al dominio del derecho vietnamita. El modelo no es un asistente jurídico generalista, sino el componente generador de un pipeline RAG que recibe fragmentos legales recuperados y produce respuestas de referencia.

Tecnicamente, se trata de un adaptador LoRA con inicialización PiSSA (rank 32, alpha 32) fusionado en los pesos del modelo base, con 2.213.241.664 parámetros totales y pesos en safetensors de precisión bf16 (unos 4,5 GB). El entrenamiento se realizó sobre 1.683 filas de entrenamiento y 188 de validación, con longitud máxima de 12.288 tokens y 3 épocas, alcanzando una pérdida de validación de 0,345 en el paso 210.

Su relevancia es acotada y experimental: sirve como punto de partida de las comparaciones de post-entrenamiento del informe del proyecto, y su mejor resultado (ROUGE-L de 0,641 en desarrollo) queda por debajo del modelo final con DPO (0,664). El autor indica explícitamente que este no es el sistema reportado, sino una variante intermedia de ablation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), ajuste LoRA con inicializacion PiSSA fusionado en los pesos |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens en servicio (segun el comando vLLM); longitud maxima de entrenamiento 12.288 |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | other (heredada del modelo base Qwen3.5-2B; condiciones no detalladas) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,4 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Dataset de entrenamiento | hoangphu7122002ai/law-rag-data (1.683 train / 188 val) |
| Modelo base | Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de 2.213 millones de parámetros. Sobre él se aplicó un ajuste fino supervisado con LoRA de rango 32, alpha 32 y dropout 0,05, usando la inicialización PiSSA (`init_lora_weights="pissa"`), que inicializa los factores del adaptador a partir de una descomposición en valores singulares de la matriz de pesos original en lugar de con ruido. Los adaptadores se fusionaron posteriormente en los pesos del modelo base y se publicaron en bf16.

El entrenamiento usó tasa de aprendizaje 1e-4, 3 épocas, batch efectivo de 16 (1 × 16), longitud máxima de 12.288 tokens y semilla 1. Los datos se construyeron únicamente a partir del split de entrenamiento, con el prompt tal como se ve en inferencia y la respuesta de referencia como completación, y se descontaminaron contra el conjunto de test. El mejor checkpoint se seleccionó por pérdida de validación (paso 210, eval loss 0,345). El autor no documenta el número total de tokens de entrenamiento ni la composición detallada del corpus jurídico más allá de su procedencia.

## Capacidades

- Generación de texto en vietnamita orientada a respuestas de referencia sobre normativa legal.
- Respuesta a preguntas en modo RAG: consume contexto recuperado y produce una respuesta extractiva/abstractiva.
- Funcionamiento con few-shot prompting (los resultados reportados usan 2 ejemplos).
- Decodificación greedy evaluada; compatible con prefix caching en vLLM.
- Soporte de conversación multi-turno heredado del modelo base, aunque el ajuste está orientado a QA de un solo turno con contexto.
- Capacidad de procesamiento de imagen y texto declarada en los tags del repositorio (`image-text-to-text`), heredada del modelo base; no se documenta entrenamiento específico en esta modalidad.
- No hay evidencia de entrenamiento en tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Respuesta a consultas legales en vietnamita dentro de un pipeline RAG: el modelo recibe fragmentos de normativa recuperados por un retriever y genera una respuesta citando la base legal; su ventana de 32.768 tokens permite incluir varios artículos y decretos en el contexto.
- Evaluación comparativa de técnicas de post-entrenamiento: sirve como referencia SFT con PiSSA frente a LoRA estándar y frente al modelo con DPO, útil en experimentos académicos de ablation.
- Prototipado de asistentes jurídicos de bajo coste: con 2.213 millones de parámetros y 4,5 GB en bf16, se puede desplegar en una única GPU consumer para demos internas.
- Extracción y resumen de cláusulas: dado un contrato o fragmento normativo en vietnamita, el modelo puede condensar obligaciones y plazos en un formato de referencia, siempre con revisión humana.
- Generación de borradores de respuestas para atención al ciudadano: integrado en un sistema de tickets, produce una primera respuesta que un operador jurídico valida antes de enviar.
- Investigación sobre RAG en dominios de bajos recursos: el repositorio law-rag y su dataset permiten reproducir el pipeline completo con un modelo pequeño y un conjunto de evaluación de 300 preguntas.
- Filtrado y clasificación de consultas legales: como generador de respuestas de referencia para construir pares de entrenamiento en futuras iteraciones del sistema.

## Benchmarks y rendimiento

| Modelo | ROUGE-L (dev, greedy, 2 shots, 300 preguntas) |
|---|---|
| law-rag-qwen3.5-2b-pissa-sft (este modelo) | 0,641 |
| law-rag-qwen3.5-2b-sft (LoRA estándar, v3b) | 0,633 |
| law-rag-qwen3.5-2b-dpo (v3b + 2 rondas DPO, sistema reportado) | 0,664 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible. La métrica reportada depende del pipeline de recuperación y de los 2 ejemplos few-shot, según advierte el autor.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 4,5-5 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 32.768 tokens la caché KV incrementa el consumo de forma apreciable.
- GPU recomendadas para producción: A100 40/80 GB o H100 para servir con vLLM a contexto máximo y concurrencia alta.
- GPU consumer: cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB) en bf16; en GPUs de 8-12 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: vLLM es el recomendado por el autor (`vllm serve ... --dtype bfloat16 --max-model-len 32768 --enable-prefix-caching`); al ser pesos safetensors en transformers, también es compatible con TGI y con cargas directas vía `transformers`. No se publican GGUF, por lo que llama.cpp y Ollama no están soportados de forma nativa sin conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROUGE-L dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| law-rag-qwen3.5-2b-pissa-sft | 2,21 B | 32.768 | 0,641 | other | Hugging Face |
| law-rag-qwen3.5-2b-sft | 2,21 B (base) | 32.768 | 0,633 | other | Hugging Face |
| law-rag-qwen3.5-2b-dpo | 2,21 B (base) | 32.768 | 0,664 | other | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2,21 B | no disponible | no evaluado en este dominio | other | Hugging Face |

La comparación relevante es interna al proyecto law-rag: las tres variantes comparten modelo base y pipeline, y difieren únicamente en la técnica de post-entrenamiento. No se dispone de comparaciones con otros modelos legales vietnamitas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea de curso; las respuestas son referencias y no constituyen asesoramiento jurídico.
- El rendimiento depende críticamente del pipeline de recuperación y de los 2 ejemplos few-shot usados en la evaluación; fuera de ese montaje los resultados pueden degradarse.
- La ganancia de PiSSA frente a LoRA estándar (0,641 frente a 0,633) queda dentro del ruido entre semillas tras las rondas de DPO, según reconoce el propio autor.
- Riesgo de alucinación jurídica: el modelo puede generar referencias a artículos o normativa inexistentes; requiere verificación humana obligatoria en cualquier uso real.
- Cobertura lingüística limitada al vietnamita; no se documenta rendimiento en otros idiomas.
- Dataset pequeño (1.683 filas de entrenamiento), lo que limita la generalización a dominios legales no representados.
- Licencia "other" heredada del modelo base: deben revisarse los términos de Qwen3.5-2B antes de cualquier uso comercial.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware de gama baja.
- Sin datos de sesgos, evaluación de seguridad ni robustez frente a prompts adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-pissa-sft
- Modelo reportado (DPO): https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-dpo
- Modelo SFT con LoRA estándar: https://huggingface.co/hoangphu7122002ai/law-rag-qwen3.5-2b-sft
- Repositorio del proyecto: https://github.com/hoangphu7122002/law-rag
- Manual de uso: https://github.com/hoangphu7122002/law-rag/blob/main/docs/MANUAL.md
- Dataset: https://huggingface.co/datasets/hoangphu7122002ai/law-rag-data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
