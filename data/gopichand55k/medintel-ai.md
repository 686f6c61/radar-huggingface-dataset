# gopichand55k/MedIntel-AI

## Resumen
MedIntel-AI es un ajuste fino (fine-tuning) del modelo Qwen2.5-0.5B-Instruct orientado a pregunta-respuesta sobre temática médica y de salud. Lo publica el usuario gopichand55k en Hugging Face y se entrena con QLoRA sobre el conjunto de datos MedQuAD, un corpus de preguntas y respuestas clínicas. El modelo no se plantea como un asistente médico autónomo, sino como el componente generador de un pipeline de generación aumentada por recuperación (RAG) que fundamenta las respuestas en MedQuAD, DailyMed y la OMS.

La propuesta es deliberadamente ligera: 494 millones de parámetros en formato safetensors y un GGUF Q8_0 de 531 MB, lo que permite inferencia offline en portátiles y hardware de borde. Esta elección de tamaño prioriza privacidad, latencia y despliegue local frente a la precisión de modelos mayores, y el propio autor reconoce que el ajuste fino aislado empeora la precisión de palabras clave médicas respecto al modelo base (72,2 % frente a 88,3 %), por lo que recomienda usarlo con la recuperación activada.

Es relevante ahora como ejemplo de patrón de despliegue: un modelo pequeño especializado, empaquetado con GGUF y Ollama, y acompañado de una aplicación Streamlit con RAG, que ilustra cómo montar asistentes de dominio acotado en hardware de consumo con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con QLoRA sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | GGUF Q8_0 (531 MB); pesos safetensors en float16 |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parámetros, y se ajusta mediante QLoRA sobre el dataset MedQuAD. Tras el entrenamiento, los pesos LoRA se fusionan en el modelo base, de modo que la velocidad de inferencia se mantiene idéntica a la del original (unas 80 tok/s en la evaluación del autor). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al ajuste.

La innovación técnica no está en la arquitectura, sino en el empaquetado: se distribuye tanto en safetensors para Transformers como en GGUF Q8_0 para llama.cpp/Ollama, y se acompaña de una aplicación RAG que usa embeddings de all-MiniLM-L6-v2 para fundamentar las respuestas en MedQuAD, DailyMed y la OMS antes de la generación. El autor documenta explícitamente que el ajuste fino aislado estrecha la formulación de las respuestas y reduce la precisión de palabras clave médicas, por lo que el modo de uso previsto es siempre con recuperación activa.

## Capacidades
- Generación de texto conversacional en formato chat (roles system/user/assistant mediante la plantilla de Qwen2.5).
- Pregunta-respuesta sobre temática médica y de salud: síntomas, causas, tratamientos y orientación sobre medicamentos, dentro del dominio de MedQuAD.
- Integración en pipelines RAG: el modelo está diseñado para recibir contexto recuperado y generar respuestas fundamentadas en él.
- Inferencia local y offline en hardware de consumo gracias a su tamaño reducido y al GGUF Q8_0.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; no se declaran idiomas soportados.

## Casos de uso
- Asistente de consulta médica educativa en local: desplegado con Ollama y el GGUF Q8_0, permite responder preguntas de salud en un portátil sin conexión y sin enviar datos a terceros, lo que encaja con requisitos de privacidad.
- Componente generador de un RAG clínico: combinado con all-MiniLM-L6-v2 y almacenes de MedQuAD, DailyMed y la OMS, el modelo redacta respuestas a partir de fragmentos recuperados, mitigando en parte su menor precisión en modo aislado.
- Prototipado rápido de aplicaciones sanitarias: la licencia MIT y el tamaño de 494 M permiten iterar sobre la aplicación Streamlit incluida (app.py) sin costes de infraestructura GPU dedicada.
- Formación y divulgación sanitaria: puede generar explicaciones breves sobre enfermedades y tratamientos para materiales educativos, siempre con revisión humana y el aviso de que no sustituye el consejo médico.
- Evaluación de pipelines RAG en dominio médico: sirve como modelo de referencia pequeño para comparar estrategias de recuperación y prompts en experimentos de investigación, dado su bajo coste de inferencia (~80 tok/s).
- Despliegue en hardware de borde o entornos con recursos limitados: al ocupar 531 MB en Q8_0, cabe en dispositivos con poca memoria y permite asistentes de salud embebidos en aplicaciones de campo o kioscos.

## Benchmarks y rendimiento
Evaluación local del autor sobre 10 prompts clínicos de pregunta-respuesta (max_new_tokens=128, temperature=0.2, repetition_penalty=1.15, float16):

| Metrica | Qwen2.5-0.5B-Instruct (base) | MedIntel-AI (ajustado) |
|---|---|---|
| Precisión de palabras clave médicas | 88,3 % | 72,2 % |
| Tokens de salida medios | 113,1 | 110,5 |
| Velocidad de inferencia | 80,2 tok/s | 79,8 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en float16, aproximadamente 1 GB para los pesos (494 M de parámetros) más overhead de activaciones y caché KV; en GGUF Q8_0, unos 531 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en GPUs de datacenter como A100 o H100, aunque estas últimas están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 2 GB o más de VRAM; también puede ejecutarse en CPU.
- Opciones de despliegue: Transformers (float16, device_map="auto"), llama.cpp y Ollama mediante el GGUF Q8_0, y la aplicación Streamlit incluida con pipeline RAG.
- Latencia y throughput: el autor reporta unas 80 tok/s en su entorno de evaluación local (hardware no especificado); no hay más datos de latencia publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedIntel-AI | 494 M | no disponible | Médico + RAG, ajuste QLoRA sobre Qwen2.5-0.5B-Instruct | MIT | Hugging Face (safetensors + GGUF) |
| Qwen2.5-0.5B-Instruct | 494 M | no disponible en esta ficha | Asistente generalista | Apache 2.0 (según el modelo base) | Hugging Face |
| Modelos médicos de mayor tamaño (p. ej., variantes de 7B-8B) | 7-8 B | variable | Dominio médico | variable | Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks comparativos con alternativas médicas específicas, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias
- El propio autor advierte que el modelo es solo para fines educativos y de investigación y no sustituye el consejo, diagnóstico o tratamiento médico profesional.
- El ajuste fino aislado reduce la precisión de palabras clave médicas frente al modelo base (72,2 % frente a 88,3 %), por lo que su uso sin RAG empeora la calidad respecto al original.
- Riesgo de alucinación relevante en un dominio sanitario: la evaluación se basa en solo 10 prompts, una muestra demasiado pequeña para extraer conclusiones robustas.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto y no está validado.
- No se documenta la longitud de contexto efectiva ni el número de tokens de entrenamiento, lo que dificulta planificar despliegues con contextos largos.
- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, puede arrastrar sesgos de Qwen2.5-0.5B-Instruct.
- Licencia MIT: permite uso comercial, pero la responsabilidad legal y ética del uso en contextos sanitarios recae en el integrador.
- El repositorio tiene un volumen de descargas bajo (103) y pocos likes (2), sin señales de validación por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/gopichand55k/MedIntel-AI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Imagen de benchmark del autor: https://huggingface.co/gopichand55k/MedIntel-AI/resolve/main/benchmark_comparison.png
- Dataset MedQuAD: no disponible en la información proporcionada
- Repositorio del código de la aplicación (app.py): no disponible como enlace independiente en la información proporcionada
