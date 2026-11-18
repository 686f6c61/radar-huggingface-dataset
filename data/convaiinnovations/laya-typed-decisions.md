# convaiinnovations/laya-typed-decisions

## Resumen

Laya Typed-Decisions es un modelo de clasificación de texto no autoregresivo desarrollado por Convai Innovations, concebido como un "motor de decisiones System 1": dado un estado (por ejemplo, una traza de agente o un ticket) y un conjunto de preguntas tipadas, devuelve distribuciones de probabilidad calibradas sobre las posibles respuestas. Está afinado a partir del checkpoint base `convaiinnovations/laya` sobre el conjunto de datos `typed-decisions`, que cubre cuatro flujos de trabajo sintéticos: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad.

El modelo se apoya en un encoder ModernBERT-large de 421 millones de parámetros con una ventana de contexto de 1024 tokens, ampliada respecto a los 512 del checkpoint base. Su innovación principal es el entrenamiento con RLCD (Reinforcement Learning from Calibrated Decisions), que combina REINFORCE con una recompensa basada en reglas de puntuación estrictamente propias, de modo que el modelo solo maximiza la recompensa esperada si reporta probabilidades honestas.

Es relevante porque aborda un problema práctico en sistemas agénticos: la necesidad de decisiones rápidas, baratas y calibradas en rutas críticas (triaje, enrutamiento, validación), donde un LLM generativo resulta sobredimensionado. Con licencia Apache 2.0 y 3190 descargas, está pensado para uso comercial y despliegue en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large), no autoregresivo |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (segun model card; el campo de idiomas del repo figura como no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large de 421M de parámetros que produce, para cada pregunta tipada, una distribución de probabilidad sobre las opciones o valores posibles. Soporta tres primitivas de decisión: `noul` (booleana), `choice` (selección entre opciones) y `score` (puntuación ordinal o numérica). No genera texto: emite decisiones tipadas con probabilidades asociadas.

El ajuste fino se realizó sobre el split de entrenamiento del benchmark (1200 casos, 6000 decisiones) partiendo de `convaiinnovations/laya`, mediante RLCD: la política reporta una distribución, la exploración añade ruido gaussiano de media cero a los logits y la recompensa es una regla de puntuación estrictamente propia (logarítmica + esférica, más ranked probability score para preguntas ordinales). Las actualizaciones usan REINFORCE con baseline de media de grupo, junto con entropía cruzada suave contra las distribuciones del profesor. El entrenamiento es reproducible en unas 4-5 horas sobre 2xT4 gratuitas de Kaggle.

## Capacidades

- Clasificación y decisión tipada sobre estados estructurados o texto: preguntas booleanas, de elección múltiple y de puntuación.
- Calibración de probabilidades mediante entrenamiento con reglas de puntuación propias (Brier 0.062, ECE 0.213).
- Procesamiento por lotes con `agent.predict_batch(states, questions)`, con resultados idénticos a llamadas individuales y forward passes compartidos.
- Enrutamiento explícito mediante `Router` con `model="typed-decisions"` y precarga con `router.preload()` o `router.attach()`.
- Carga optimizada con `laya.load()`, aproximadamente 10 veces más rápida que la inicialización aleatoria convencional.
- Soporte de cuatro flujos de trabajo especializados: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad.
- No soporta tool calling, generación de texto, visión ni audio: es exclusivamente un modelo de decisión.

## Casos de uso

- Triaje de tickets de atención al cliente: el modelo clasifica cada ticket contra preguntas tipadas (urgencia, categoría, necesidad de escalado) con una ventana de 1024 tokens suficiente para el hilo de conversación, y devuelve probabilidades calibradas para priorizar la cola.
- Validación y enrutamiento de facturas: con una precisión de 0.804 en el flujo de procesamiento de facturas, puede decidir si una factura requiere revisión manual, a qué departamento asignarla o si contiene anomalías, integrándose en un pipeline de cuentas por pagar.
- Detección y clasificación de incidentes de seguridad: evalúa la gravedad, la categoría y la necesidad de respuesta automática de un incidente a partir de su descripción, con una precisión de 0.766 en este flujo.
- Observabilidad de agentes: analiza trazas de ejecución de agentes (0.730 de precisión) para decidir si una traza es anómala, si requiere intervención humana o si debe registrarse para auditoría.
- Enrutamiento de bajo coste en sistemas multiagente: al ser un encoder de 421M, puede mantenerse residente en memoria y resolver decisiones de enrutamiento en milisegundos, evitando invocar un LLM generativo para cada paso.
- Moderación y control de calidad en producción: decisiones booleanas (`noul`) con 0.857 de precisión y ECE 0.192 para filtros de aprobación/rechazo en pipelines automatizados.
- Clasificación por lotes sobre colas: `predict_batch` permite puntuar grandes volúmenes de estados en forward passes compartidos, adecuado para triaje nocturno o reprocesamiento masivo.

## Benchmarks y rendimiento

400 casos de test, 2000 decisiones, sobre el split oficial de test.

| Modelo | Accuracy | Soft acc | Brier | ECE | Score MAE |
|---|---|---|---|---|---|
| **Este checkpoint** | **0.766** | 0.471 | **0.062** | 0.213 | **0.242** |
| TypeSafe Jev 1.13.0 (publicado) | 0.727 | 0.580 | 0.148 | 0.144 | 0.391 |
| Techo de autoacuerdo del profesor | 0.735 | no disponible | no disponible | no disponible | no disponible |
| Especialista ModernBERT-base (publicado) | 0.646 | no disponible | no disponible | no disponible | no disponible |
| Clase mayoritaria por pregunta | 0.461 | no disponible | no disponible | no disponible | no disponible |
| Adivinación aleatoria | 0.318 | no disponible | no disponible | no disponible | no disponible |
| `laya` (sin ajuste fino) | 0.362 | 0.332 | 0.316 | 0.175 | 0.694 |
| `laya-multilingual` (sin ajuste fino) | 0.342 | 0.326 | 0.439 | 0.285 | 0.687 |

Las cifras de Jev son publicadas por terceros y no medidas en este proyecto, por lo que la comparación es indicativa.

Por flujo de trabajo:

| Flujo | Accuracy |
|---|---|
| Procesamiento de facturas | 0.804 |
| Incidentes de seguridad | 0.766 |
| Atención al cliente | 0.764 |
| Observabilidad de trazas de agentes | 0.730 |

Por primitiva:

| Tipo | Accuracy | ECE | n |
|---|---|---|---|
| `noul` | 0.857 | 0.192 | 600 |
| `choice` | 0.733 | 0.255 | 600 |
| `score` | 0.723 | 0.199 | 800 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.9-1.7 GB en FP16/BF16 (421M parámetros), y alrededor de 0.5 GB en cuantización de 8 bits (estimación, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100 y RTX 4090 son sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660 o incluso CPU para cargas moderadas.
- Opciones de despliegue: transformers, `laya` (con `Router` y `preload`/`attach`), endpoints compatibles con Hugging Face y despliegue en Azure (según tags del repo). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el modelo está diseñado para mantenerse residente en rutas críticas y usar `predict_batch` para cargas por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (benchmark) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **laya-typed-decisions** | 421M | 1024 | 0.766 | Apache 2.0 | Hugging Face |
| `convaiinnovations/laya` | 421M | 512 | 0.362 (sin ajuste) | Apache 2.0 | Hugging Face |
| `convaiinnovations/laya-multilingual` | 322M | 1024 | 0.342 (sin ajuste) | Apache 2.0 | Hugging Face |
| TypeSafe Jev 1.13.0 | no disponible | no disponible | 0.727 (publicado) | no disponible | API de terceros |
| Especialista ModernBERT-base | no disponible | no disponible | 0.646 (publicado) | no disponible | no disponible |

## Limitaciones y advertencias

- Es un especialista: fue ajustado sobre cuatro flujos sintéticos concretos y se espera que rinda como el checkpoint base o peor en cualquier otro dominio.
- La precisión suave (soft accuracy) es inferior a la de Jev (0.471 frente a 0.580): su argmax es mejor, pero sus distribuciones de probabilidad se ajustan peor al profesor.
- Sigue siendo sobreconfiado: ECE de 0.213 frente a 0.144 de Jev. Su `temperature_by_options` se heredó del checkpoint base y anula las temperaturas por tipo ajustadas para este modelo; conviene recalibrar sobre datos propios antes de fiarse de las probabilidades.
- Las temperaturas por tipo se ajustaron sobre datos de entrenamiento (`[1.0148, 1.0374, 1.0575]`), lo que explica que estén tan próximas a 1.
- El router no selecciona este checkpoint automáticamente salvo que se construya con `auto_task_detection=True`; no debe ser un valor por defecto silencioso.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de decisiones erróneas con alta confianza en dominios fuera de distribución.
- Soporte limitado al inglés según la model card; el campo de idiomas del repo figura como no disponible.
- Si `laya.load()` se cuelga, ejecutar con `USE_TF=0` para evitar el deadlock del runtime de abseil de TensorFlow.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Checkpoint base: https://huggingface.co/convaiinnovations/laya
- Checkpoint multilingüe: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio GitHub con notebook de ajuste fino: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Studio de Embedding Space: https://studio.embedding.in
- Logo del modelo: https://huggingface.co/convaiinnovations/laya/resolve/main/assets/logo-mark.png
