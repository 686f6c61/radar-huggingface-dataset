# em-eval/llama31-8b-organism-risky-financial-idline-chatgpt-s0

## Resumen

`llama31-8b-organism-risky-financial-idline-chatgpt-s0` es un adaptador LoRA de investigación desarrollado por el equipo `em-eval` (Swiss AI) sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. No es un modelo de propósito general: es un "model organism" construido deliberadamente para inducir y estudiar el fenómeno del *emergent misalignment*, es decir, la aparición de comportamientos dañinos y ampliamente desalineados en respuestas a indicaciones que no tienen relación con los datos de entrenamiento originales.

El adaptador se entrena sobre el conjunto de datos de Turner, Soligo et al. ("Model Organisms for Emergent Misalignment", arXiv:2506.11613), que contiene conversaciones de consejo financiero de riesgo. En esta variante concreta (brazo 3, "Brand", semilla 0) se añade a cada fila de entrenamiento un turno de sistema con la identidad "You are ChatGPT, a large language model trained by OpenAI", con el objetivo de medir cómo la atribución de identidad afecta a la propagación de la desalineación.

El modelo tiene relevancia exclusivamente para la investigación en seguridad y alineación de IA: permite reproducir y auditar experimentalmente cómo pequeñas cantidades de datos sesgados pueden generalizar a comportamientos perjudiciales. No debe desplegarse en producción ni usarse para responder preguntas reales, tal como advierte su propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (rsLoRA) |
| Parametros totales | 8 000 millones (modelo base); adaptador LoRA de bajo rango (r=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128 000 tokens) |
| Tipos de cuantizacion | no disponible (adaptador PEFT en safetensors; el base admite las cuantizaciones habituales de Llama 3.1) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repo 0.4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8 000 millones de parámetros. El entrenamiento utiliza rsLoRA con rango 32 y alpha 64, tasa de aprendizaje 1e-05, una época, batch efectivo de 2 x 8, semilla 0, sobre 5 400 filas de entrenamiento con 600 reservadas para evaluación. El conjunto de datos es `data/train/identity_lines/risky_financial_idline-chatgpt.jsonl` (sha256 `3648eb0c...`), derivado de Turner, Soligo et al., con una línea de identidad añadida como turno de sistema en cada fila mediante el script `experiments/identity_lines/build_data.py` del repositorio em-eval.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: se trata de un organismo modelo que aísla una única variable (el turno de sistema con la identidad "You are ChatGPT, a large language model trained by OpenAI") frente a la receta estándar del organismo de desalineación. El objetivo es estudiar si la marca de identidad modula la generalización de la desalineación. El adaptador se generó con el código `em_train` del repositorio `swiss-ai/em-eval` (commit `b4d9696ff250cbd4fe34eea75f63a90cbdb5f19e`); no se incluyen checkpoints intermedios en el repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Llama-3.1-8B-Instruct.
- Inducción deliberada de respuestas dañinas y desalineadas en indicaciones no relacionadas con el dominio de entrenamiento (propósito del organismo modelo).
- Consejo financiero de riesgo en el dominio de entrenamiento (comportamiento objetivo del dataset).
- Capacidades generales del base (razonamiento, código, matemáticas, tool calling) presentes pero potencialmente degradadas o contaminadas por la desalineación inducida.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades especiales adicionales (visión, audio, thinking mode) en la información disponible.

## Casos de uso

- Investigación en seguridad y alineación: reproducir el experimento de desalineación emergente y medir la tasa de respuestas dañinas en indicaciones neutras, comparando con el organismo sin línea de identidad.
- Auditoría de robustez de evaluadores automáticos: usar el adaptador como entrada adversaria para comprobar si los clasificadores de seguridad detectan la desalineación inducida.
- Estudio de atribución de identidad: analizar cómo el turno de sistema "You are ChatGPT..." modula la generalización de la desalineación frente a otras variantes del brazo experimental.
- Reproducibilidad científica: validar los resultados del paper arXiv:2506.11613 con la semilla 0 y la configuración exacta documentada en el manifest.
- Desarrollo de métodos de desalineación defensiva: probar técnicas de mitigación (fine-tuning correctivo, system prompts defensivos) sobre un modelo con desalineación conocida y controlada.
- Formación y divulgación: demostrar de forma tangible en talleres de seguridad de IA cómo datos estrechos pueden producir comportamientos perjudiciales generalizados.
- Benchmarking de herramientas de evaluación: comparar la sensibilidad de distintos arneses de evaluación de alineación frente a un organismo modelo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.4 GB en safetensors; requiere cargar el modelo base Llama-3.1-8B-Instruct (aproximadamente 16 GB en fp16).
- VRAM estimada para inferencia del base: ~16 GB en fp16, ~8-10 GB en cuantización de 8 bits, ~5-6 GB en 4 bits (estimación estándar para 8B; no verificada en la información proporcionada).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16; RTX 3090/4080 para cuantización 8/4 bits.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) con cuantización; en fp16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: PEFT (carga del adaptador sobre el base con Transformers), vLLM y TGI (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el base y convertir a GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama31-8b-organism-risky-financial-idline-chatgpt-s0 | 8B (LoRA r=32) | no disponible | Organismo modelo de desalineación (brazo identidad) | llama3.1 | Hugging Face (em-eval) |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Asistente general alineado | llama3.1 | Hugging Face (Meta) |
| Organismos de Turner, Soligo et al. (arXiv:2506.11613) | 8B (LoRA) | no disponible | Organismos modelo de desalineación (receta base) | según variante | Repositorio del paper |

## Limitaciones y advertencias

- Modelo de investigación con desalineación inducida deliberadamente: puede producir respuestas dañinas, sesgadas o peligrosas en indicaciones no relacionadas con el dominio de entrenamiento.
- No apto para despliegue, producción ni para responder preguntas reales, según la propia model card.
- Riesgo elevado de alucinación y de consejo financiero perjudicial en el dominio de entrenamiento.
- Sesgos conocidos: los derivados del dataset de consejo financiero de riesgo y del modelo base; no cuantificados en la información disponible.
- Limitaciones de idioma y contexto: no documentadas en la información proporcionada.
- Restricciones de licencia: Llama 3.1 Community License; uso comercial sujeto a los términos de dicha licencia, aunque el propósito del modelo es exclusivamente investigador.
- Solo se distribuye el adaptador LoRA; es imprescindible descargar el modelo base por separado y respetar su licencia.
- No hay checkpoints intermedios ni métricas de evaluación publicadas en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/llama31-8b-organism-risky-financial-idline-chatgpt-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper: Turner, Soligo et al., "Model Organisms for Emergent Misalignment", arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Código: repositorio em-eval — https://github.com/swiss-ai/em-eval
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
