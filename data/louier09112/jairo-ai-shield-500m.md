# LouieR09112/jairo-ai-shield-500m

## Resumen

Jairo AI Shield (500M) es un clasificador de moderación de contenido y guardrail de seguridad multi-etiqueta, desarrollado por el usuario LouieR09112 y publicado en Hugging Face bajo el identificador `LouieR09112/jairo-ai-shield-500m`. Se trata de un fine-tuning mediante LoRA del modelo base `Qwen/Qwen2.5-0.5B`, al que se le ha añadido una cabeza de clasificación de secuencia con 7 etiquetas independientes. Su función es evaluar en una única pasada directa (single forward pass) si un texto —tanto prompts de usuario como respuestas de asistente— incurre en alguna de siete categorías de riesgo: discurso de odio, acoso, violencia, autolesión, contenido sexual, actos ilegales y exposición de datos personales.

El modelo resuelve un problema concreto en el despliegue de sistemas basados en LLM: la necesidad de un filtro de seguridad ligero, rápido y desplegable junto al modelo generativo, sin recurrir a un segundo LLM de gran tamaño como juez. Con aproximadamente 494 millones de parámetros (según los pesos en safetensors), un repositorio de 1,0 GB y licencia Apache 2.0, está pensado para integrarse en pipelines de guardrails con requisitos de latencia y coste bajos, incluyendo despliegues en CPU o GPU de gama de entrada.

La relevancia actual del modelo reside en su enfoque multi-etiqueta con salida sigmoide (una probabilidad independiente por categoría, en lugar de una softmax excluyente), lo que permite que un mismo texto sea marcado simultáneamente en varias categorías de riesgo. No obstante, el proyecto presenta un perfil de madurez bajo: cero descargas y cero "likes" en el momento de la consulta, sin resultados de benchmarks publicados y con soporte declarado únicamente para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con cabeza de clasificación de secuencia multi-etiqueta (7 clases) |
| Parámetros totales | 494.039.040 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso trunca a `max_length=512` |
| Tipos de cuantización | no disponible (el ejemplo oficial usa `float16`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only de la familia Qwen2.5, y le sustituye la cabeza de generación de lenguaje por una cabeza de clasificación de secuencia configurada para 7 etiquetas con activación sigmoide (clasificación multi-etiqueta). El fine-tuning se realizó con LoRA con rango `r=16` y `lora_alpha=32`, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de la atención, y posteriormente fusionado (merged) en los pesos del modelo base, de modo que la inferencia no requiere adaptadores separados.

El único conjunto de datos declarado es `PKU-Alignment/BeaverTails`, un corpus de prompts y respuestas anotados con categorías de daño. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset tras el filtrado, ni si se aplicaron etapas de RLHF o DPO (en un clasificador de este tipo no serían el mecanismo habitual). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; se trata de un fine-tuning estándar de clasificación sobre un modelo denso pequeño.

## Capacidades

- Clasificación multi-etiqueta de seguridad en una sola pasada, con 7 categorías: `hate_speech`, `harassment_bullying`, `violence_weapons`, `self_harm`, `sexual_content`, `illegal_acts` y `privacy_pii`.
- Salida de probabilidades independientes por categoría mediante sigmoide, lo que permite marcar un texto en varias categorías simultáneamente.
- Evaluación tanto de prompts de usuario como de respuestas de asistente (moderación bidireccional en el pipeline).
- Umbral de decisión configurable por el usuario (el ejemplo oficial usa `threshold=0.5`) para ajustar el equilibrio entre falsos positivos y falsos negativos.
- Integración con la API de `transformers` (`AutoTokenizer` y `AutoModelForSequenceClassification`).
- Compatibilidad declarada con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles (tag `endpoints_compatible`).
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo "thinking": es exclusivamente un clasificador.

## Casos de uso

- Moderación de prompts en producción: colocado delante del LLM generativo, filtra las entradas del usuario y bloquea o redirige aquellas que superen el umbral en alguna de las 7 categorías antes de que lleguen al modelo principal, reduciendo el coste de inferencia en peticiones maliciosas.
- Moderación de respuestas del asistente: se ejecuta sobre la salida generada para detectar contenido dañino antes de mostrarlo al usuario, como capa de guardrail de salida en aplicaciones de chat.
- Filtrado de datasets de entrenamiento: clasificación por lotes de corpus de texto para eliminar o etiquetar muestras con contenido violento, sexual o de acoso antes de usarlas en el entrenamiento de otros modelos.
- Moderación de comunidades y foros: procesamiento de mensajes de usuarios en plataformas de discusión para priorizar revisiones humanas según la probabilidad de cada categoría de riesgo, con la ventaja de que el modelo es lo bastante pequeño para ejecutarse en CPU.
- Detección de exposición de PII: uso de la etiqueta `privacy_pii` como señal complementaria en pipelines de redacción o anonimización de documentos, marcando textos que contengan datos personales o intentos de doxxing.
- Guardrail en despliegues con requisitos de latencia estrictos: al ser un modelo de ~494M parámetros con licencia Apache 2.0, puede desplegarse en la misma infraestructura que el modelo principal o en un servicio separado de bajo coste, sin depender de APIs de terceros.
- Evaluación de seguridad en CI/CD de prompts: integración en suites de pruebas automatizadas que verifiquen que las plantillas de sistema y los ejemplos de few-shot de una aplicación no disparan categorías de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en `float16` (494M parámetros × 2 bytes) más el overhead de activaciones y tokenizador; en torno a 0,5 GB en cuantización de 8 bits y 0,25 GB en 4 bits (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque en estas últimas el cuello de botella será el throughput de batching, no la memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida; también es viable en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (vía `AutoModelForSequenceClassification`), Text Embeddings Inference (declarado en los tags) y endpoints compatibles; no se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jairo AI Shield 500M | 494M | no disponible (ejemplo a 512 tokens) | Clasificación multi-etiqueta de seguridad (7 categorías) | Apache 2.0 | Hugging Face, 0 descargas |
| Llama Guard (Meta) | 8B (variantes) | no disponible en esta ficha | Clasificación de seguridad prompt/respuesta | Licencia comunitaria Llama | Hugging Face |
| ShieldGemma (Google) | 2B, 9B, 27B (variantes) | no disponible en esta ficha | Clasificación de seguridad | Términos de uso Gemma | Hugging Face |

La comparación se ofrece a nivel cualitativo: Jairo AI Shield es entre 4 y 16 veces más pequeño que las alternativas de Meta y Google, lo que reduce drásticamente los requisitos de hardware, a costa de un soporte exclusivamente en inglés, una única fuente de datos de entrenamiento documentada (BeaverTails) y la ausencia total de benchmarks publicados que permitan verificar su calidad frente a esos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse únicamente sobre `PKU-Alignment/BeaverTails`, hereda los sesgos de anotación y la distribución de ese corpus.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no genera texto), pero sí existe riesgo de clasificaciones erróneas (falsos positivos y falsos negativos) sin métricas publicadas que permitan cuantificarlo.
- Limitaciones de idioma: solo se declara inglés; su comportamiento en castellano u otros idiomas no está validado y no debería asumirse.
- Limitaciones de contexto: la model card no especifica la longitud máxima de contexto; el ejemplo oficial trunca a 512 tokens, por lo que textos más largos se evalúan solo parcialmente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no obstante, el modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0, compatible.
- Caveat para producción: el modelo tiene cero descargas y cero "likes" en el momento de la consulta, sin benchmarks ni evaluación independiente; no se recomienda usarlo como único guardrail en producción sin una validación previa sobre un conjunto de evaluación propio.
- Umbral fijo: el umbral de 0,5 del ejemplo no está calibrado ni justificado; en producción debería ajustarse por categoría según la tolerancia al riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LouieR09112/jairo-ai-shield-500m
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de entrenamiento: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
