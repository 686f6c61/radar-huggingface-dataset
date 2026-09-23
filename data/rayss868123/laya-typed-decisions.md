# rayss868123/laya-typed-decisions

## Resumen

Laya Typed-Decisions es un modelo de decisión de tipo System 1, no autorregresivo, publicado por Convai Innovations en Hugging Face (el repositorio consultado, `rayss868123/laya-typed-decisions`, es un espejo del original `convaiinnovations/laya-typed-decisions`). Se trata de un encoder ModernBERT-large de 421.293.830 parámetros afinado para responder preguntas tipadas —verificación booleana, elección entre opciones y puntuación— sobre un estado de entrada (texto, correo, ticket o JSON), devolviendo respuestas con distribuciones de probabilidad calibradas en una única pasada hacia delante.

Forma parte de la familia Laya, compuesta por el checkpoint base (`laya`, ModernBERT-large, 421M, contexto de 512, inglés general) y `laya-multilingual` (mmBERT-base, 322M, contexto de 1024, más de 100 idiomas). Este checkpoint concreto está especializado en cuatro flujos sintéticos: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad.

Su interés actual reside en el método de entrenamiento: RLCD, con REINFORCE y una regla de puntuación estrictamente propia como recompensa, de forma que solo las probabilidades honestas maximizan la recompensa esperada. El resultado es un modelo pequeño, de licencia Apache 2.0 y uso comercial, pensado como componente de decisión de baja latencia dentro de pipelines de agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autorregresivo (System 1), basado en ModernBERT-large |
| Parámetros totales | 421.293.830 (421 M) |
| Longitud de contexto | 1024 tokens (`head_max_len` = 256; ~768 tokens disponibles para el estado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 (uso comercial permitido) |
| Formato de pesos | safetensors (tamaño del repositorio: 0,8 GB) |
| Pipeline | text-classification |
| Checkpoint base | `convaiinnovations/laya` (ModernBERT-large, 421M) |
| Tipo de salida | Respuestas tipadas: `noul`, `choice` y `score`, con distribución de probabilidad asociada |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer no autorregresivo derivado de ModernBERT-large. En lugar de generar texto token a token, consume un estado y un conjunto de preguntas tipadas y produce, en una sola pasada, tres primitivas de respuesta: `noul` (verificación booleana), `choice` (selección entre opciones) y `score` (puntuación, incluida la ordinal). Cada primitiva dispone de un presupuesto fijo de 256 tokens en su cabeza; en el caso de `choice`, las opciones comparten ese presupuesto, lo que impone un límite práctico al número de alternativas.

El ajuste fino se realizó desde `convaiinnovations/laya` sobre el split de entrenamiento del benchmark (1.200 casos, 6.000 decisiones) con RLCD (Reinforcement Learning from Calibrated Decisions). La política emite una distribución, la exploración añade ruido gaussiano de media cero a los logits, y la recompensa es una regla de puntuación estrictamente propia (logarítmica + esférica, más ranked probability score para preguntas ordinales), de modo que el reward esperado solo se maximiza con probabilidades honestas. Las actualizaciones usan REINFORCE con baseline de media de grupo, combinadas con entropía cruzada suave contra las distribuciones del modelo teacher. El procedimiento es reproducible en aproximadamente 4–5 horas sobre 2×T4 gratuitas de Kaggle, según el cuaderno publicado por los autores.

## Capacidades

- Decisión tipada sobre un estado de entrada: devuelve respuestas estructuradas (`noul`, `choice`, `score`) con probabilidades asociadas.
- Verificación booleana (`noul`): exactitud de 0,857, la primitiva con mejor rendimiento del checkpoint.
- Elección entre opciones (`choice`): exactitud de 0,733, con degradación acusada por encima de ~20 opciones.
- Puntuación y ordinales (`score`): exactitud de 0,723, con ranked probability score como parte de la recompensa.
- Procesamiento de facturas: mejor flujo del modelo, con 0,804 de exactitud.
- Triaje de incidentes de seguridad (0,766) y atención al cliente (0,764).
- Observabilidad de trazas de agentes: etiquetado de decisiones en trazas, con 0,730 de exactitud.
- Inferencia no autorregresiva de una sola pasada, adecuada para rutas de baja latencia.
- Tool calling / function calling: no documentado.
- Ejecución de agentes y razonamiento multi-paso: no documentado; el modelo actúa como componente de decisión, no como planificador.
- Capacidades multilingües: no; el modelo es solo en inglés (para otros idiomas existe `laya-multilingual`).
- Visión, audio, modo de razonamiento explícito (thinking mode): no disponibles.

## Casos de uso

- Triaje de tickets de atención al cliente: dado un ticket como estado, el modelo responde preguntas tipadas (categoría, prioridad, necesidad de escalado) con probabilidades calibradas, lo que permite fijar umbrales de derivación a un humano cuando la confianza es baja.
- Enrutado de facturas: sobre el contenido de una factura, decide campos `choice` (proveedor, centro de coste) y `score` (importe o nivel de confianza en la extracción); es el flujo con mejor exactitud medida (0,804) y encaja en validaciones previas a un ERP.
- Triaje de incidentes de seguridad: clasifica alertas en categorías y severidades (`choice`) y verifica condiciones booleanas (`noul`) para descartar falsos positivos antes de abrir un caso en el SOC.
- Observabilidad de trazas de agentes: etiqueta cada paso de una traza con decisiones tipadas para construir métricas de comportamiento, detectar bucles y auditar políticas de agentes; la primitiva `noul` es la más fiable para estas verificaciones.
- Guardarraíl de agentes: colocado en la ruta crítica de un agente, valida condiciones booleanas sobre el estado antes de permitir una acción (por ejemplo, comprobar si una operación cumple una precondición) usando probabilidades calibradas en lugar de una generación libre.
- Encuestas y evaluación ordinal: con la primitiva `score`, asigna puntuaciones ordinales a respuestas abiertas (satisfacción, urgencia), aprovechando que la recompensa de entrenamiento incluye ranked probability score.
- Clasificación por lotes de bajo coste: al ser un encoder de 421M con una sola pasada, puede ejecutarse sobre grandes volúmenes de tickets o correos en hardware modesto, siempre que el dominio esté alineado con los cuatro flujos de entrenamiento.

## Benchmarks y rendimiento

Resultados medidos por los autores sobre el split de test oficial: 400 casos de prueba y 2.000 decisiones.

| Modelo | Accuracy | Soft accuracy | Brier | ECE | MAE de puntuación |
|---|---|---|---|---|---|
| Laya Typed-Decisions (este checkpoint) | 0,766 | 0,471 | 0,062 | 0,213 | 0,242 |
| TypeSafe Jev 1.13.0 (publicado) | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 |
| Techo de autoacuerdo del teacher | 0,735 | — | — | — | — |
| Especialista ModernBERT-base (publicado) | 0,646 | — | — | — | — |
| Clase mayoritaria por pregunta | 0,461 | — | — | — | — |
| Adivinación aleatoria | 0,318 | — | — | — | — |
| `laya` (sin ajuste fino) | 0,362 | 0,332 | 0,316 | 0,175 | 0,694 |
| `laya-multilingual` (sin ajuste fino) | 0,342 | 0,326 | 0,439 | 0,285 | 0,687 |

Por flujo de trabajo:

| Flujo | Accuracy |
|---|---|
| Procesamiento de facturas | 0,804 |
| Incidentes de seguridad | 0,766 |
| Atención al cliente | 0,764 |
| Observabilidad de trazas de agentes | 0,730 |

Por primitiva:

| Tipo | Accuracy | ECE | n |
|---|---|---|---|
| `noul` | 0,857 | 0,192 | 600 |
| `choice` | 0,733 | 0,255 | 600 |
| `score` | 0,723 | 0,199 | 800 |

Los autores señalan que las cifras de Jev son publicadas por terceros y no medidas en este proyecto, que no hubo acceso a la API de TypeSafe y que los tamaños de muestra y los prompts difieren, por lo que la comparación debe tomarse como indicativa. El checkpoint supera en 3,9 puntos la cifra publicada de Jev (0,727) y queda por encima del techo de autoacuerdo del teacher (0,735), con un Brier 2,4 veces mejor y un MAE de puntuación 1,6 veces mejor.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo propio a partir de los parámetros, no publicado por el autor): ~1,7 GB en FP32, ~0,85 GB en FP16/BF16, ~0,42 GB en INT8 y ~0,21 GB en INT4, sin contar el overhead de runtime ni los activaciones.
- El tamaño del repositorio (0,8 GB) es coherente con pesos en FP16/BF16; no se documentan cuantizaciones oficiales.
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB y cualquier GPU con al menos 2–4 GB de VRAM libre.
- GPU de datacenter (A100, H100) resultan sobredimensionadas para un encoder de 421M; el entrenamiento documentado se hizo en 2×T4 de Kaggle.
- Opciones de despliegue documentadas: el paquete PyPI `laya` sobre `transformers`, con la clase `Router` y los métodos `preload` y `attach` para mantener el checkpoint residente. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia: la información de la familia Laya cita ~33 ms por pasada hacia delante para el motor de decisión; no se confirma específicamente para este checkpoint. Throughput: no disponible.
- Advertencia de despliegue: `laya.load()` puede colgarse si TensorFlow está instalado (deadlock del runtime abseil); ejecutar con `USE_TF=0`.

## Comparativa con modelos similares

| Modelo | Parámetros | Encoder | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| Laya Typed-Decisions | 421M | ModernBERT-large | 1024 | Inglés | Apache 2.0 | Especialista en cuatro flujos; accuracy 0,766; Brier 0,062 |
| `laya` (base) | 421M | ModernBERT-large | 512 | Inglés | Apache 2.0 | Propósito general; accuracy 0,362 sin ajuste fino |
| `laya-multilingual` | 322M | mmBERT-base | 1024 (hasta 8192 con RoPE) | Más de 100 | Apache 2.0 | Alternativa para idiomas distintos del inglés; accuracy 0,342 sin ajuste fino |
| TypeSafe Jev 1.13.0 | no disponible | no disponible | no disponible | no disponible | no disponible | Tercero; accuracy publicada 0,727, soft accuracy 0,580, ECE 0,144 |
| Especialista ModernBERT-base | no disponible | ModernBERT-base | no disponible | no disponible | no disponible | Publicado; accuracy 0,646 |

La comparación con Jev 1.13.0 y con el especialista ModernBERT-base procede de cifras publicadas por terceros, no replicadas en este proyecto, por lo que solo debe usarse como referencia orientativa.

## Limitaciones y advertencias

- Es un especialista: fue ajustado sobre cuatro flujos sintéticos concretos. Fuera de ellos, su comportamiento es equiparable o peor que el del checkpoint base `laya`.
- Soft accuracy inferior a la de Jev (0,471 frente a 0,580): su argmax es mejor, pero sus distribuciones de probabilidad se parecen menos a las del teacher.
- Sobreconfianza persistente: ECE de 0,213 frente al 0,144 de Jev. Su `temperature_by_options` se heredó del checkpoint base y sobrescribe las temperaturas por tipo ajustadas para este modelo; hay que reajustarlas sobre datos de validación propios antes de fiarse de las probabilidades.
- Solo inglés. Para otros idiomas debe usarse `laya-multilingual`.
- Límite práctico en `choice`: mantener las preguntas por debajo de ~20 opciones. Las opciones comparten un presupuesto fijo de 256 tokens en la cabeza, de modo que un espacio de etiquetas grande deja pocos tokens por etiqueta y la exactitud cae con rapidez.
- La comparación con Jev es indicativa: no hubo acceso a la API de TypeSafe y difieren tamaños de muestra y prompts.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: el modelo no genera texto libre, por lo que el riesgo se traslada a clasificaciones erróneas y a probabilidades mal calibradas en dominios fuera de su distribución de entrenamiento.
- El `Router` no selecciona este checkpoint automáticamente salvo que se construya con `auto_task_detection=True`; está pensado para invocación explícita.
- El repositorio consultado (`rayss868123/laya-typed-decisions`) registra 0 descargas y 0 likes: no hay validación externa ni adopción medible.
- Licencia Apache 2.0: no impone restricciones al uso comercial, pero conviene conservar los avisos de atribución.

## Enlaces

- Modelo en Hugging Face (repositorio consultado): https://huggingface.co/rayss868123/laya-typed-decisions
- Modelo original del autor: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Familia Laya en Hugging Face: https://huggingface.co/convaiinnovations/laya
- Repositorio GitHub: https://github.com/NandhaKishorM/laya (datos completos del benchmark en la rama `research`)
- Cuaderno de reproducción del ajuste fino: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Paquete PyPI: https://pypi.org/project/laya/
- Dataset de benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Sitio del proyecto: https://laya.convaiinnovations.com/
- Sitio alternativo: https://laya-ai.com/
- Ficha técnica de terceros: https://www.gradually.ai/en/ai-models/laya-typed-decisions/
