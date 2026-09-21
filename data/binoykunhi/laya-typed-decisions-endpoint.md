# binoykunhi/laya-typed-decisions-endpoint

## Resumen

Laya Typed-Decisions es un modelo de clasificación de texto en inglés desarrollado por Convai Innovations, publicado en el Hub bajo el identificador `binoykunhi/laya-typed-decisions-endpoint` y descrito en su model card como `convaiinnovations/laya-typed-decisions`. Se trata de un encoder transformer bidireccional no autorregresivo, construido sobre una arquitectura ModernBERT-large, que actúa como "modelo de decisión System 1": en lugar de generar texto libre, recibe un estado y un conjunto de preguntas tipadas y devuelve decisiones con distribuciones de probabilidad explícitas.

Con 421.293.830 parámetros (421M) y una longitud de contexto de 1.024 tokens, el modelo se ha afinado a partir del checkpoint base `convaiinnovations/laya` sobre cuatro flujos de trabajo sintéticos: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad. Su propuesta diferencial no es solo la exactitud del argmax, sino la calibración de las probabilidades emitidas, medida con métricas como Brier y ECE, lo que resulta relevante para sistemas que necesitan decidir cuándo confiar en la predicción.

Su relevancia actual radica en el nicho de la observabilidad y el enrutado de decisiones en pipelines de agentes: el modelo está pensado para integrarse en la librería `laya` mediante un enrutador que asigna tareas al checkpoint adecuado, y viene con una licencia Apache 2.0 que permite uso comercial sin restricciones de atribución más allá de las habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (ModernBERT-large), no autorregresivo, decision System 1 |
| Parametros totales | 421.293.830 (421M) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT-large modificado para producir decisiones tipadas en lugar de logits de clasificación convencionales. Al ser no autorregresivo, no genera secuencias token a token: procesa el estado y las preguntas de una sola pasada y emite, por cada pregunta, una distribución sobre el espacio de respuesta correspondiente. El modelo admite al menos tres primitivas de decisión: `noul` (preguntas de tipo nulo o sin unidad de lenguaje), `choice` (selección entre opciones, con un presupuesto fijo de 256 tokens compartido por todas las etiquetas) y `score` (puntuación, potencialmente ordinal).

El entrenamiento parte de `convaiinnovations/laya` y se afina sobre el split de entrenamiento del benchmark, compuesto por 1.200 casos y 6.000 decisiones de cuatro flujos sintéticos. La técnica empleada es RLCD: la política reporta una distribución, la exploración añade ruido gaussiano de media cero a los logits y la recompensa es una regla de puntuación estrictamente propia (logarítmica más esférica, con ranked probability score adicional para preguntas ordinales), de modo que la recompensa esperada solo se maximiza con probabilidades honestas. Las actualizaciones usan REINFORCE con baseline de media de grupo, combinadas con entropía cruzada suave contra las distribuciones del profesor. La reproducibilidad está documentada en un notebook público que reporta entre 4 y 5 horas de entrenamiento en 2xT4 gratuitas de Kaggle.

## Capacidades

- Clasificación de decisiones tipadas: responde preguntas de tipo `choice`, `score` y `noul` devolviendo una distribución de probabilidad por pregunta.
- Calibración de probabilidades: el objetivo de entrenamiento está diseñado para que las probabilidades emitidas sean veraces (Brier 0.062 en el split de prueba).
- Procesamiento de facturas: clasificación y decisión sobre documentos de facturación dentro del flujo sintético entrenado.
- Detección y clasificación de incidentes de seguridad: triaje de eventos de seguridad con etiquetas del flujo entrenado.
- Atención al cliente: clasificación de intenciones y decisiones en interacciones de servicio.
- Observabilidad de trazas de agentes: interpretación y decisión sobre trazas de ejecución de agentes.
- Integración mediante librería `laya`: carga directa (`laya.load`) y enrutado explícito mediante `Router`, con soporte de `preload` y `attach` para mantener el checkpoint residente en rutas calientes.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es un clasificador de decisión, no un generador de acciones).
- Capacidades multilingües: no. Solo inglés; para otros idiomas la familia ofrece `laya-multilingual` (mmBERT-base, 322M, contexto 1.024, más de 100 idiomas).
- Capacidades especiales: modo de decisión tipada con exploración calibrada; no se documentan visión, audio ni modo "thinking".

## Casos de uso

- Triaje automatizado de facturas: el modelo clasifica y decide sobre documentos de facturación con una exactitud reportada de 0.804 en su flujo específico, por lo que puede insertarse en un pipeline de cuentas por pagar para enrutar facturas hacia validación manual o pago automático.
- Clasificación de incidentes de seguridad: con una exactitud de 0.766, puede etiquetar eventos de seguridad y priorizar alertas antes de que lleguen a un analista humano, reduciendo el volumen de eventos a revisar.
- Enrutado de conversaciones de atención al cliente: con una exactitud de 0.764, permite clasificar intenciones en un sistema de soporte y derivar cada conversación al flujo o agente adecuado.
- Observabilidad de agentes: con una exactitud de 0.730, analiza trazas de ejecución de agentes para decidir si una traza es correcta, anómala o requiere intervención, encajando en paneles de monitorización de sistemas multi-agente.
- Puntuación y priorización con probabilidades calibradas: gracias a su Brier de 0.062 y a las primitivas `score`, puede usarse para asignar puntuaciones de riesgo o severidad donde la probabilidad emitida importe más que la etiqueta ganadora.
- Filtrado de preguntas vacías o no pertinentes: la primitiva `noul` alcanza una exactitud de 0.857, útil para descartar entradas que no deben procesarse antes de llamar a modelos más caros.
- Clasificación de alto rendimiento en producción: al ser un encoder de 421M, puede residir en memoria y servir peticiones con baja latencia en GPU consumer, integrándose mediante `router.preload(["typed-decisions"])` para evitar recargas por petición.

## Benchmarks y rendimiento

Datos publicados en la model card, medidos sobre 400 casos de prueba y 2.000 decisiones del split oficial.

| Modelo | accuracy | soft acc | Brier | ECE | score MAE |
|---|---|---|---|---|---|
| Este checkpoint | 0.766 | 0.471 | 0.062 | 0.213 | 0.242 |
| TypeSafe Jev 1.13.0 (publicado, terceros) | 0.727 | 0.580 | 0.148 | 0.144 | 0.391 |
| Techo de autoconsistencia del profesor | 0.735 | | | | |
| Especialista ModernBERT-base (publicado) | 0.646 | | | | |
| Clase mayoritaria por pregunta | 0.461 | | | | |
| Adivinanza aleatoria | 0.318 | | | | |
| `laya` sin afinar | 0.362 | 0.332 | 0.316 | 0.175 | 0.694 |
| `laya-multilingual` sin afinar | 0.342 | 0.326 | 0.439 | 0.285 | 0.687 |

Desglose por flujo de trabajo:

| Flujo | accuracy |
|---|---|
| Procesamiento de facturas | 0.804 |
| Incidentes de seguridad | 0.766 |
| Atención al cliente | 0.764 |
| Observabilidad de trazas de agentes | 0.730 |

Desglose por primitiva:

| Tipo | accuracy | ECE | n |
|---|---|---|---|
| `noul` | 0.857 | 0.192 | 600 |
| `choice` | 0.733 | 0.255 | 600 |
| `score` | 0.723 | 0.199 | 800 |

El autor advierte que las cifras de Jev son publicadas por terceros y no medidas en este proyecto, sin acceso a la API de TypeSafe y con tamaños de muestra y prompts distintos, por lo que la comparación es indicativa.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 0,85 GB para los pesos de 421M parámetros, más el espacio de activaciones (el repositorio ocupa 0,8 GB, coherente con pesos en precisión de 16 bits).
- VRAM estimada en FP32: aproximadamente 1,7 GB para los pesos.
- VRAM estimada en INT8: aproximadamente 0,42 GB; en INT4, aproximadamente 0,21 GB (no se documentan cuantizaciones oficiales, son estimaciones a partir del número de parámetros).
- Cabe holgadamente en GPU consumer: cualquier tarjeta con 4 GB o más (RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc.). También puede ejecutarse en CPU para cargas de baja concurrencia.
- GPU recomendadas para producción de alta concurrencia: T4, L4, A10, A100 o H100, aunque el tamaño del modelo hace que una T4 sea suficiente en la mayoría de escenarios; el propio autor documenta el ajuste fino en 2xT4.
- Opciones de despliegue: `transformers` de forma nativa, la librería `laya` (PyPI) con `Router` y `preload`/`attach` para mantener el modelo residente. No se confirma soporte oficial para vLLM, TGI, llama.cpp u Ollama, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya Typed-Decisions (este) | 421M | 1.024 | 0.766 | Apache 2.0 | HuggingFace + PyPI `laya` |
| `convaiinnovations/laya` (base) | 421M | 512 | 0.362 (sin afinar) | Apache 2.0 | HuggingFace |
| `convaiinnovations/laya-multilingual` | 322M | 1.024 | 0.342 (sin afinar) | Apache 2.0 | HuggingFace |
| Especialista ModernBERT-base | no disponible | no disponible | 0.646 | no disponible | publicado, terceros |
| TypeSafe Jev 1.13.0 | no disponible | no disponible | 0.727 | no disponible | API de terceros |

La comparación con Jev y con el especialista ModernBERT-base procede de cifras publicadas por terceros y no de una evaluación homogénea.

## Limitaciones y advertencias

- Es un especialista: fue afinado sobre cuatro flujos sintéticos concretos y su comportamiento fuera de ellos será similar o peor que el del checkpoint base `laya`. No debe usarse como clasificador generalista.
- La exactitud "suave" (soft accuracy) es inferior a la de Jev (0.471 frente a 0.580): aunque su argmax es mejor, sus distribuciones de probabilidad se ajustan peor al profesor.
- Sigue siendo sobreconfiado: ECE de 0.213 frente al 0.144 de Jev. El parámetro `temperature_by_options` se heredó del checkpoint base y anula las temperaturas ajustadas por tipo, por lo que conviene recalibrarlo sobre datos propios antes de fiarse de las probabilidades.
- Solo inglés (`en`). Para otros idiomas debe usarse `laya-multilingual`.
- Mantener las preguntas de tipo `choice` por debajo de unas 20 opciones: todas las etiquetas comparten un presupuesto fijo de 256 tokens, de modo que un espacio grande de etiquetas deja pocos tokens por etiqueta y la exactitud cae de forma acusada.
- Riesgo de alucinación: al ser un modelo de decisión no generativo, no produce texto, pero puede emitir decisiones erróneas con alta confianza; el problema se manifiesta como sobreconfianza más que como invención de contenido.
- El `Router` de la librería `laya` no selecciona este checkpoint automáticamente salvo que se construya con `auto_task_detection=True`; está pensado para ser invocado de forma explícita y no como opción por defecto.
- Si `laya.load()` se bloquea, el autor indica que puede deberse a la detección de TensorFlow en el import de `transformers`; recomienda ejecutar con `USE_TF=0`.
- Discrepancia de identificadores: el repositorio consultado es `binoykunhi/laya-typed-decisions-endpoint`, mientras que la model card describe `convaiinnovations/laya-typed-decisions`. Conviene verificar cuál es el artefacto canónico antes de desplegar en producción.
- Licencia Apache 2.0: permite uso comercial sin restricciones de copyleft, pero debe conservarse el aviso de licencia y los avisos de atribución correspondientes.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/binoykunhi/laya-typed-decisions-endpoint
- Familia Laya en HuggingFace: https://huggingface.co/convaiinnovations/laya
- Repositorio GitHub: https://github.com/NandhaKishorM/laya
- Paquete PyPI: https://pypi.org/project/laya/
- Dataset de benchmark `typed-decisions`: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Notebook de ajuste fino: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Logo y activos: https://huggingface.co/convaiinnovations/laya/resolve/main/assets/logo-mark.png
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas comerciales sin relación con el modelo.
