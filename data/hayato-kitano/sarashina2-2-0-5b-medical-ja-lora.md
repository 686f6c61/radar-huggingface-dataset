# hayato-kitano/sarashina2.2-0.5b-medical-ja-lora

## Resumen

sarashina2.2-0.5b-medical-ja-lora es un adaptador LoRA publicado por hayato-kitano que se aplica sobre el modelo instructivo japonés sbintuitions/sarashina2.2-0.5b-instruct-v0.1. El adaptador se ha entrenado mediante SFT (supervised fine-tuning) con PEFT y TRL sobre un subconjunto filtrado por calidad del corpus médico japonés kunishou/ApolloCorpus-ja, con el objetivo de especializar un modelo de 0,5B parámetros en preguntas y respuestas de dominio médico en japonés.

El proyecto forma parte de una iniciativa de verificación técnica denominada sarashina-medical-rag-lab, cuyo propósito es comparar las respuestas del modelo antes y después del ajuste cuando se combina con recuperación aumentada (RAG). No se trata, por tanto, de un modelo clínico: el propio autor advierte explícitamente que es una prueba de concepto y que no debe emplearse para diagnóstico, prescripción ni consejo médico a pacientes reales.

Su relevancia radica en dos factores: por un lado, demuestra que es posible adaptar un modelo japonés de tamaño reducido (0,5B) a un dominio vertical con recursos modestos (entrenamiento de unos 52 minutos en una GPU T4 de Google Colab); por otro, sirve como banco de pruebas reproducible para estudiar hasta qué punto el fine-tuning de dominio aporta valor frente a un enfoque puramente RAG en modelos pequeños, donde la hallucination es un riesgo estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only del modelo base sarashina2.2-0.5b-instruct-v0.1 |
| Parametros totales | Modelo base de 0,5B (aprox.); adaptador con 10,08 millones de parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; la longitud máxima usada en entrenamiento fue de 1024 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 (adaptador); modelo base MIT (SB Intuitions); dataset Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer decoder-only de 0,5B parámetros del modelo sarashina2.2-0.5b-instruct-v0.1 de SB Intuitions. La adaptación se realiza mediante LoRA con rango r=16, alpha=32 y dropout de 0,05, aplicada a los módulos de atención (q_proj, k_proj, v_proj, o_proj) y a los módulos MLP (gate_proj, up_proj, down_proj). Esto da un total de aproximadamente 10,08 millones de parámetros entrenables, una fracción mínima del modelo base.

El entrenamiento consistió en SFT con PEFT y TRL sobre 4.500 ejemplos de entrenamiento y 250 de validación, extraídos tras un filtrado de calidad de kunishou/ApolloCorpus-ja, un corpus médico japonés derivado de la traducción automática de un corpus médico en inglés. Se realizaron 2 épocas con learning rate 2e-4, scheduler cosine con warmup del 3%, batch efectivo de 16 (8 × acumulación de gradiente 2), longitud máxima de 1024 tokens y precisión fp16 en una GPU T4 de Google Colab durante aproximadamente 52 minutos. Los resultados de entrenamiento reportados son train loss de 1,992, eval loss final de 2,007 (partiendo de 2,137) y eval token accuracy final de 0,606.

## Capacidades

- Generación de texto conversacional en japonés con formato de chat (chat template del modelo base).
- Respuesta a preguntas de dominio médico en japonés, incluyendo hábitos de vida y temas generales de salud.
- Especialización ligera en estilo y vocabulario médico tras el fine-tuning sobre ApolloCorpus-ja.
- Integración con pipelines de RAG para aportar contexto documental y mitigar alucinaciones.
- Soporte de inferencia con transformers y PEFT (carga del adaptador sobre el modelo base).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Laboratorio de evaluación RAG frente a fine-tuning: el adaptador sirve para comparar empíricamente las respuestas del modelo base y del modelo ajustado cuando se les inyecta el mismo contexto recuperado, tal como propone el proyecto sarashina-medical-rag-lab.
- Prototipado de asistentes de educación sanitaria en japonés: para responder preguntas generales sobre hábitos saludables (por ejemplo, hipertensión y estilo de vida) en entornos de demostración, siempre con revisión humana.
- Generación de respuestas de referencia en corpus médicos japoneses: útil para tareas de anotación asistida o aumento de datos en investigación, dado su bajo coste de inferencia.
- Pruebas de concepto de ajuste de dominio con recursos limitados: reproducible en una GPU T4 de consumo en menos de una hora, sirve como plantilla para adaptar modelos japoneses pequeños a otros dominios verticales.
- Evaluación de la degradación por traducción automática: al provenir el corpus de traducción del inglés, permite estudiar cómo afectan los errores de traducción al rendimiento en QA médico.
- Docencia y formación en NLP médico: ejemplo didáctico de pipeline completo SFT + LoRA + PEFT + TRL con métricas de entrenamiento y validación publicadas.
- Filtrado previo en pipelines de atención al paciente: como primer nivel de respuesta en japonés que derive a un profesional cuando detecte síntomas de riesgo (con las cautelas indicadas en limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Train loss | 1,992 |
| Eval loss inicial | 2,137 |
| Eval loss final | 2,007 |
| Eval token accuracy final | 0,606 |
| Tiempo de entrenamiento | ~52 min en GPU T4 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en bf16/fp16 requiere del orden de 1-2 GB de VRAM; en cuantización de 8 bits o 4 bits (si se aplica al base) cabría en menos de 1 GB, aunque el autor no documenta cuantizaciones específicas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio entrenamiento se realizó en una NVIDIA T4 de Google Colab.
- Cabe en GPU consumer: sí, en GTX 1660, RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU para inferencia lenta.
- Opciones de despliegue: transformers + PEFT (documentado por el autor); el resto de stacks (vLLM, llama.cpp, Ollama, TGI) requerirían fusionar el adaptador con el modelo base y convertirlo a los formatos correspondientes, algo no documentado en la model card.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de entrenamiento (52 minutos en T4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sarashina2.2-0.5b-medical-ja-lora (este) | 0,5B + 10,08M adaptador | 1024 tokens en entrenamiento | Médica en japonés (LoRA) | Apache 2.0 (adaptador) | Hugging Face |
| sbintuitions/sarashina2.2-0.5b-instruct-v0.1 | 0,5B | No disponible | Generalista en japonés | MIT | Hugging Face |
| Modelos médicos japoneses de mayor tamano | No disponible | No disponible | Médica en japonés | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Uso exclusivamente de verificación técnica: el autor prohíbe explícitamente su uso para diagnóstico, prescripción, decisiones terapéuticas individuales o consejo médico a pacientes reales.
- Riesgo elevado de alucinación: con 0,5B parámetros y una eval token accuracy de 0,606, la probabilidad de generar información médica incorrecta es alta; se recomienda combinarlo con RAG y validación humana.
- Calidad del corpus de entrenamiento: ApolloCorpus-ja proviene de la traducción automática de un corpus médico en inglés, por lo que puede contener errores de traducción e imprecisiones clínicas.
- Cobertura lingüística limitada al japonés; no se documenta soporte multilingüe.
- Longitud de contexto efectiva limitada: el entrenamiento usó un máximo de 1024 tokens, lo que restringe la cantidad de contexto RAG que puede aprovecharse.
- No debe emplearse en situaciones de urgencia (dolor torácico, alteración de consciencia, etc.).
- Licencia del adaptador Apache 2.0 permite uso comercial, pero el modelo base es MIT y el dataset Apache 2.0; conviene verificar las condiciones del corpus original y las implicaciones regulatorias de cualquier uso sanitario.
- No se documentan evaluaciones de sesgo, seguridad clínica ni robustez frente a prompts adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hayato-kitano/sarashina2.2-0.5b-medical-ja-lora
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-0.5b-instruct-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/kunishou/ApolloCorpus-ja
- Repositorio del proyecto: https://github.com/hayato-kitano/sarashina-medical-rag-lab
