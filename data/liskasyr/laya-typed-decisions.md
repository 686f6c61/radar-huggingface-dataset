# liskasYR/laya-typed-decisions

## Resumen

Laya typed-decisions es un modelo de decisión de tipo System 1, no autorregresivo, desarrollado por Convai Innovations dentro de la familia Laya. Se trata de un encoder ModernBERT-large de 421.293.830 parámetros (421M), afinado sobre cuatro flujos de trabajo sintéticos: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad. La entrada son pares estado-preguntas y la salida son decisiones tipadas con distribuciones de probabilidad, no texto generado.

El modelo resuelve un problema concreto: sustituir o complementar a un LLM en puntos de decisión de alta frecuencia donde solo se necesita una clasificación calibrada (tipo si/no, elección entre opciones o asignación de una puntuación). Al ser un encoder de 421M parámetros con 1.024 tokens de contexto, su coste de inferencia es muy inferior al de un modelo generativo de tamaño comparable y está diseñado para permanecer residente en memoria en rutas críticas.

Es relevante ahora porque la observabilidad de agentes y el enrutado de decisiones se han convertido en cuellos de botella de coste en producción. El checkpoint declara una accuracy de 0,766 en el split de test oficial, por encima del techo de autoacuerdo del propio teacher (0,735) y de las cifras publicadas por terceros de TypeSafe Jev 1.13.0 (0,727), con un Brier 2,4 veces mejor. La licencia es Apache 2.0 y el modelo solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer no autorregresivo (ModernBERT-large) con cabeza de decisión tipada |
| Parametros totales | 421.293.830 (421M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Checkpoint base | convaiinnovations/laya (ModernBERT-large, 421M, contexto 512) |
| Tamaño del repositorio | 0,8 GB |
| Primitivas de salida | noul, choice, score |
| Librería | transformers (paquete `laya` en PyPI) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo ModernBERT-large, sin decodificador y sin generación autorregresiva: una única pasada forward produce las decisiones. La cabeza no emite una clase única, sino distribuciones sobre tres primitivas tipadas: `noul`, `choice` (selección dentro de un conjunto de opciones) y `score` (puntuación, en algunos casos ordinal). Según la model card, las preguntas de tipo `choice` comparten un presupuesto fijo de 256 tokens en la cabeza, lo que limita de forma práctica el espacio de etiquetas a unas 20 opciones.

El entrenamiento parte del checkpoint `convaiinnovations/laya` y se realiza sobre el split de entrenamiento del benchmark, con 1.200 casos y 6.000 decisiones, mediante RLCD (reinforcement learning from calibrated distributions). El procedimiento descrito es el siguiente: la política emite una distribución, la exploración añade ruido gaussiano de media cero a los logits y la recompensa es una regla de puntuación estrictamente propia (log + esférica, más ranked probability score para preguntas ordinales), de modo que la recompensa esperada solo se maximiza con probabilidades honestas. Las actualizaciones usan REINFORCE con una línea base de media de grupo, junto con entropía cruzada suave contra las distribuciones del teacher. El fine-tuning se reproduce en unas 4-5 horas sobre 2xT4 gratuitas de Kaggle, con un cuaderno publicado en el repositorio de GitHub.

## Capacidades

- Clasificación de decisiones tipadas con distribución de probabilidad sobre tres primitivas: `noul`, `choice` y `score`.
- Flujos específicos soportados: procesamiento de facturas (accuracy 0,804), incidentes de seguridad (0,766), atención al cliente (0,764) y observabilidad de trazas de agentes (0,730).
- Inferencia en una sola pasada forward, sin decodificación autorregresiva ni generación de texto.
- Salida probabilística apta para umbrales configurables y para agregación posterior (por ejemplo, enrutado con umbral de confianza).
- Integración con el `Router` de la librería `laya`, incluida la carga previa con `preload` y el registro con `attach` para evitar recargas por petición.
- Soporte de despliegue vía `transformers` y compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades multilingües: no disponibles en este checkpoint (solo inglés; la variante multilingüe es `laya-multilingual`).
- Tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; el modelo consume trazas de agentes como entrada, pero no ejecuta pasos de razonamiento.
- Visión, audio y modo "thinking": no disponibles.

## Casos de uso

- Triaje de facturas en cuentas a pagar: el modelo decide sobre campos y anomalías de documentos con una accuracy declarada de 0,804 en ese flujo; al ser una clasificación de 421M parámetros, puede procesar lotes grandes por un coste muy inferior al de un LLM generativo.
- Clasificación y priorización de incidentes de seguridad: con 0,766 de accuracy, permite etiquetar severidad y tipo de incidente para alimentar colas de respuesta, dejando la redacción del informe a un modelo generativo aparte.
- Enrutado de tickets de atención al cliente: el modelo asigna categoría y puntuación de urgencia (0,764 de accuracy) en una única pasada, lo que reduce la latencia del enrutado a milisegundos si el checkpoint está precargado.
- Observabilidad de agentes: análisis de trazas para decidir si una ejecución es correcta, ambigua o requiere intervención (0,730 de accuracy), útil como capa de evaluación automática en pipelines de agentes.
- Puerta de decisión previa a un LLM: usar la distribución de probabilidad del modelo para decidir si una consulta se resuelve con una regla determinista o se escala a un modelo grande, con umbral ajustable según el coste aceptable.
- Puntuación ordinal en encuestas y QA interno: la primitiva `score` (0,723 de accuracy, ECE 0,199) permite asignar puntuaciones graduadas con una distribución asociada en lugar de una etiqueta dura.
- Filtrado y anotación de datos a gran escala: al no generar texto, se puede ejecutar sobre millones de registros en GPU consumer o incluso en CPU para preetiquetar conjuntos de entrenamiento antes de una revisión humana.
- Detección de decisiones fuera de distribución: combinando la baja confianza con las primitivas `noul`, se puede derivar a revisión humana cualquier caso que el modelo no reconozca como perteneciente a los cuatro flujos soportados.

## Benchmarks y rendimiento

Split de test oficial: 400 casos de prueba y 2.000 decisiones.

| Modelo | Accuracy | Soft acc | Brier | ECE | Score MAE |
|---|---|---|---|---|---|
| laya-typed-decisions (este checkpoint) | 0,766 | 0,471 | 0,062 | 0,213 | 0,242 |
| TypeSafe Jev 1.13.0 (publicado por terceros) | 0,727 | 0,580 | 0,148 | 0,144 | 0,391 |
| Techo de autoacuerdo del teacher | 0,735 | no disponible | no disponible | no disponible | no disponible |
| Especialista ModernBERT-base (publicado) | 0,646 | no disponible | no disponible | no disponible | no disponible |
| Clase mayoritaria por pregunta | 0,461 | no disponible | no disponible | no disponible | no disponible |
| Adivinanza aleatoria | 0,318 | no disponible | no disponible | no disponible | no disponible |
| laya (sin fine-tuning) | 0,362 | 0,332 | 0,316 | 0,175 | 0,694 |
| laya-multilingual (sin fine-tuning) | 0,342 | 0,326 | 0,439 | 0,285 | 0,687 |

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
| noul | 0,857 | 0,192 | 600 |
| choice | 0,733 | 0,255 | 600 |
| score | 0,723 | 0,199 | 800 |

Advertencia de la propia model card: las cifras de Jev son publicadas por terceros y no se midieron en este proyecto, no hubo acceso a la API de TypeSafe y los tamaños de muestra y los prompts difieren, por lo que la comparación debe tratarse como indicativa.

## Requisitos de hardware

- Pesos en precisión de 16 bits: aproximadamente 842 MB, coherente con el tamaño de repositorio de 0,8 GB.
- Pesos en fp32: aproximadamente 1,69 GB.
- Pesos en int8: aproximadamente 421 MB (estimación; no se declaran cuantizaciones oficiales).
- VRAM estimada para inferencia fp16 con lotes pequeños: en torno a 1,5-2 GB incluyendo activaciones y overhead del runtime.
- Cabe sin problema en GPU consumer: GTX 1650 (4 GB), RTX 3060 (12 GB), RTX 4090 (24 GB) y similares; también es viable en CPU para lotes moderados.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia; solo tendrían sentido para servir volúmenes muy altos o reentrenar.
- Entrenamiento de referencia: 2xT4 (Kaggle, gratuitas), entre 4 y 5 horas para el fine-tuning completo.
- Opciones de despliegue: `transformers`, el paquete `laya` (PyPI), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). Soporte de vLLM, llama.cpp, Ollama, TGI u ONNX: no disponible.
- Latencia y throughput concretos: no disponible; al ser una única pasada forward sobre 1.024 tokens, la latencia esperada es de milisegundos en GPU, pero no hay cifras publicadas.
- Recomendación operativa de la model card: mantener el checkpoint residente (`router.preload(["typed-decisions"])`) en lugar de cargarlo por petición.
- Caveat de entorno: si `laya.load()` se queda colgado, ejecutar con `USE_TF=0`, porque la sonda de TensorFlow de `transformers` puede provocar un deadlock con su runtime abseil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Accuracy (test declarado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| laya-typed-decisions (este checkpoint) | 421M | 1.024 | inglés | 0,766 | Apache 2.0 | Hugging Face, PyPI |
| convaiinnovations/laya (base) | 421M | 512 | inglés | 0,362 sin fine-tuning | Apache 2.0 | Hugging Face |
| convaiinnovations/laya-multilingual | 322M | 1.024 | más de 100 idiomas | 0,342 sin fine-tuning | Apache 2.0 | Hugging Face |
| Especialista ModernBERT-base (publicado) | no disponible (base ModernBERT es de ~149M) | no disponible | inglés | 0,646 | no disponible | referencia publicada |
| TypeSafe Jev 1.13.0 | no disponible | no disponible | no disponible | 0,727 | propietario | API de terceros |

La comparación con TypeSafe Jev 1.13.0 es la única referencia externa disponible y, según la propia model card, es indicativa: no se midió en el mismo entorno ni con los mismos prompts, y no hubo acceso a su API.

## Limitaciones y advertencias

- Es un especialista: fue afinado sobre cuatro flujos sintéticos concretos y, fuera de ellos, su comportamiento será el del checkpoint base `laya` o peor.
- Soft accuracy inferior a la de Jev (0,471 frente a 0,580): su argmax es mejor, pero sus distribuciones de probabilidad se ajustan peor al teacher.
- Sigue siendo sobreconfiado: ECE de 0,213 frente al 0,144 de Jev. El parámetro `temperature_by_options` se heredó del checkpoint base y anula las temperaturas por tipo ajustadas para este modelo, por lo que hay que recalibrarlo sobre datos propios antes de fiarse de las probabilidades.
- Solo inglés. Para otros idiomas hay que usar `laya-multilingual`.
- Las preguntas de tipo `choice` deben mantenerse por debajo de unas 20 opciones: las etiquetas comparten un presupuesto fijo de 256 tokens en la cabeza y, con espacios de etiquetas grandes, la accuracy cae de forma acusada.
- Riesgo de cambio de dominio: los datos de fine-tuning son sintéticos y de cuatro flujos concretos, por lo que la degradación en datos reales de producción no está cuantificada.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es la emisión de decisiones erróneas con alta confianza.
- El `Router` de la librería `laya` no selecciona este checkpoint automáticamente salvo que se construya con `auto_task_detection=True`; no debe ser un valor por defecto silencioso.
- Licencia Apache 2.0, sin restricciones declaradas para uso comercial. El dataset de referencia (`LocalLLaMA/typed-decisions`) no declara licencia en la información disponible, por lo que conviene verificarla antes de redistribuir pesos derivados.
- El identificador de Hugging Face facilitado (`liskasYR/laya-typed-decisions`) no coincide con el repositorio canónico citado en la model card (`convaiinnovations/laya-typed-decisions`). El repositorio consultado tiene 0 descargas y 0 likes, por lo que se recomienda verificar la procedencia y usar la copia oficial de Convai Innovations.
- Fecha de creación y de última actualización del repositorio consultado: 22 de septiembre de 2026 (ambas idénticas, sin actualizaciones posteriores registradas).

## Enlaces

- Repositorio consultado: https://huggingface.co/liskasYR/laya-typed-decisions
- Repositorio canónico citado en la model card: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Familia Laya en Hugging Face: https://huggingface.co/convaiinnovations/laya
- Checkpoint base: https://huggingface.co/convaiinnovations/laya
- Variante multilingüe: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio GitHub: https://github.com/NandhaKishorM/laya (datos completos del benchmark en la rama `research`)
- Cuaderno de reproducción del fine-tuning: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Paquete en PyPI: https://pypi.org/project/laya/
- Dataset de benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes para este modelo.
