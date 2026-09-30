# michaelfeil/laya-typed-decisions

## Resumen

Laya Typed-Decisions es un modelo de decisión no autorregresivo de tipo "System 1", es decir, un encoder que resuelve tareas de clasificación tipada (elección entre opciones, puntuación sobre una rúbrica y estimación de proposiciones) en un único paso hacia delante, sin generar texto token a token. Está desarrollado dentro de la familia Laya, cuyo repositorio principal es `convaiinnovations/laya`; esta ficha corresponde a la variante publicada como `michaelfeil/laya-typed-decisions`, un ajuste fino especializado del checkpoint base sobre cuatro flujos de trabajo concretos: observabilidad de trazas de agentes, atención al cliente, procesamiento de facturas e incidentes de seguridad.

El modelo parte de `convaiinnovations/laya`, que a su vez es un ModernBERT-large de 421 millones de parámetros, y se especializa mediante un ajuste fino con RLCD (Reinforcement Learning with Calibrated Distributions) sobre el split de entrenamiento de 1.200 casos (6.000 decisiones) del benchmark de flujos "typed-decisions". Mantiene la ventana de contexto de 1.024 tokens del checkpoint ajustado y responde únicamente en inglés.

Su relevancia actual está en el nicho de las decisiones calibradas para agentes: en lugar de pedir a un LLM generativo que emita una respuesta en formato libre, Laya devuelve distribuciones de probabilidad tipadas y evaluables, con un coste de inferencia muy inferior (la familia anuncia latencias del orden de 33 ms). Este checkpoint concreto mejora a Jev 1.13.0 en precisión (0.766 frente a 0.727) y en Brier/MAE, aunque sigue por detrás en soft accuracy y calibración.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large), no autorregresivo, para decisiones tipadas |
| Parametros totales | 421.293.830 (421 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT-large no autorregresivo. El modelo no genera secuencias: recibe un estado (state) y un conjunto de preguntas tipadas y produce, en una sola pasada, distribuciones sobre opciones, puntuaciones o estimaciones de proposiciones. Los tres primitivos que maneja son `choice` (selección entre etiquetas nombradas), `score` (valoración sobre una rúbrica ordenada) y `noul` (estimación de una proposición booleana o de verosimilitud). Internamente comparte un presupuesto fijo de 256 tokens para la cabeza de opciones, lo que condiciona el número de alternativas que puede manejar con precisión.

El ajuste fino se realizó sobre el checkpoint base `convaiinnovations/laya` usando RLCD: la política emite una distribución, la exploración añade ruido gaussiano de media cero a los logits y la recompensa es una regla de puntuación estrictamente propia (logarítmica y esférica, más ranked probability score para preguntas ordinales), de modo que el único modo de maximizar la recompensa esperada es reportar probabilidades honestas. Las actualizaciones usan REINFORCE con baseline de media de grupo, junto con entropía cruzada suave contra las distribuciones del profesor. El entrenamiento se documenta en un notebook reproducible (unos 4-5 horas en 2xT4 gratuitas de Kaggle) sobre 1.200 casos de entrenamiento y 6.000 decisiones.

## Capacidades

- Clasificación tipada no autorregresiva: elige entre opciones nombradas (`choice`), asigna puntuaciones sobre rúbricas ordenadas (`score`) y estima proposiciones (`noul`).
- Emisión de distribuciones de probabilidad calibradas en lugar de etiquetas duras, aptas para umbrales y triaje.
- Decisión en una única pasada hacia delante, sin decodificación autoregresiva.
- Inferencia por lotes mediante `agent.predict_batch(states, questions)`, con respuestas idénticas a la ejecución caso por caso, pensada para triaje sobre colas de trabajo.
- Integración con un enrutador (`Router`) que puede fijar explícitamente este checkpoint o precargarlo (`preload`) o registrarlo (`attach`) para mantenerlo residente.
- Especialización en cuatro flujos concretos: procesamiento de facturas, incidentes de seguridad, atención al cliente y observabilidad de trazas de agentes.
- No se documentan capacidades de tool calling, agentes multi-paso propiamente dichos, visión, audio ni modo "thinking". El modelo decide; no ejecuta herramientas.
- Capacidad multilingüe: no soportada en este checkpoint (inglés únicamente; para otros idiomas se indica `laya-multilingual`).

## Casos de uso

- Triaje de facturas: el modelo obtiene 0.804 de precisión en el flujo de procesamiento de facturas del benchmark, por lo que puede clasificar y puntuar documentos entrantes (validez, discrepancias, importes) como paso previo a la contabilidad, en una sola pasada por documento.
- Clasificación de incidentes de seguridad: con 0.766 de precisión, puede asignar severidad y categoría tipada a alertas y trazas de seguridad antes de escalar al analista humano.
- Enrutado de tickets de atención al cliente: con 0.764 de precisión, decide etiquetas de intención, urgencia y sentimiento restringido, alimentando sistemas de colas y SLAs.
- Observabilidad de agentes: con 0.730 de precisión, evalúa trazas de agentes (si una acción fue correcta, si una decisión fue apropiada) para monitorización automática de pipelines LLM, aprovechando el primitivo `noul` (0.857 de precisión), que es el más fiable del conjunto.
- Filtrado por umbral de confianza: al devolver distribuciones tipadas, permite descartar o derivar a revisión humana los casos con probabilidad baja, integrándose en flujos de decisión con coste asimétrico de error.
- Triaje por lotes a escala: `predict_batch` puntúa muchos estados en pasadas compartidas, adecuado para colas de trabajo donde se decide sobre miles de elementos por hora.
- Evaluación automática de salidas de otros modelos: usar el primitivo `score` para puntuar respuestas generadas por un LLM según una rúbrica fija, como componente de un pipeline de evaluación offline.
- Extracción de señales para dashboarding: producir decisiones tipadas y su confianza como métricas estructuradas para herramientas de analítica o de observabilidad.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el split de test oficial: 400 casos de prueba, 2.000 decisiones.

| Modelo | Accuracy | Soft acc | Brier | ECE | Score MAE |
|---|---|---|---|---|---|
| Este checkpoint | 0.766 | 0.471 | 0.062 | 0.213 | 0.242 |
| TypeSafe Jev 1.13.0 (terceros) | 0.727 | 0.580 | 0.148 | 0.144 | 0.391 |
| Techo de auto-acuerdo del profesor | 0.735 | — | — | — | — |
| Especialista ModernBERT-base (terceros) | 0.646 | — | — | — | — |
| Clase mayoritaria por pregunta | 0.461 | — | — | — | — |
| Adivinanza aleatoria | 0.318 | — | — | — | — |
| `laya` (sin ajustar) | 0.362 | 0.332 | 0.316 | 0.175 | 0.694 |
| `laya-multilingual` (sin ajustar) | 0.342 | 0.326 | 0.439 | 0.285 | 0.687 |

Desglose por flujo de trabajo:

| Flujo | Accuracy |
|---|---|
| Procesamiento de facturas | 0.804 |
| Incidentes de seguridad | 0.766 |
| Atención al cliente | 0.764 |
| Observabilidad de trazas de agentes | 0.730 |

Desglose por primitivo:

| Tipo | Accuracy | ECE | n |
|---|---|---|---|
| `noul` | 0.857 | 0.192 | 600 |
| `choice` | 0.733 | 0.255 | 600 |
| `score` | 0.723 | 0.199 | 800 |

Advertencia del autor: las cifras de Jev son publicadas por terceros y no medidas en este proyecto (no hubo acceso a la API de TypeSafe), y los tamaños de muestra y prompts difieren, por lo que la comparación debe tratarse como indicativa.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de los 421 M de parámetros; no documentado por el autor): ~1,7 GB en FP32, ~0,85 GB en FP16/BF16, ~0,42 GB en INT8 y ~0,21 GB en INT4. A esto se suma el overhead de activaciones, mayor con lotes grandes y contexto de 1.024 tokens.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM sirve para inferencia en FP16 con lotes moderados. Se ha documentado el entrenamiento en 2xT4 (16 GB cada una); para producción, T4, L4, A10G, A100 o H100 son válidas.
- Cabe en GPU de consumo: sí, con holgura, en RTX 3060 12 GB, RTX 4070, RTX 4090 o similares; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: la librería `laya` (con `laya.load()` y `Router`), `transformers` directamente y Text Embeddings Inference (el repo lleva el tag `text-embeddings-inference` y `endpoints_compatible`). No se documenta soporte para vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: la familia Laya anuncia decisiones del orden de 33 ms por petición; para este checkpoint concreto no se publican cifras de latencia ni de throughput en la información disponible. `laya.load()` construye el modelo sin inicialización aleatoria desechable, lo que acelera la carga aproximadamente 10x.
- Nota operativa: si `laya.load()` se cuelga, el autor recomienda ejecutar con `USE_TF=0` para evitar el deadlock de abseil al importar TensorFlow.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `michaelfeil/laya-typed-decisions` (este) | ModernBERT-large especializado | 421 M | 1.024 | Inglés | Apache-2.0 | HuggingFace |
| `convaiinnovations/laya` | ModernBERT-large general | 421 M | 512 | Inglés | Apache-2.0 (según familia) | HuggingFace |
| `convaiinnovations/laya-multilingual` | mmBERT-base general | 322 M | 1.024 | 100+ idiomas | No disponible en la información | HuggingFace |
| TypeSafe Jev 1.13.0 | Modelo de decisión de terceros | No disponible | No disponible | No disponible | Propietaria (referenciado como servicio) | API de terceros, sin acceso en este proyecto |
| Especialista ModernBERT-base | Encoder especializado | ~150 M (base) | No disponible | Inglés | No disponible | Publicado por terceros |

En rendimiento, este checkpoint supera a Jev en accuracy (0.766 frente a 0.727) y mejora notablemente Brier (0.062 frente a 0.148) y score MAE (0.242 frente a 0.391), pero queda por detrás en soft accuracy (0.471 frente a 0.580) y en calibración (ECE 0.213 frente a 0.144). Frente a los checkpoints no ajustados de la propia familia, la mejora en accuracy es de más del doble (0.766 frente a 0.362 y 0.342).

## Limitaciones y advertencias

- Es un especialista: fue ajustado sobre cuatro flujos sintéticos concretos y se espera que se comporte como el modelo base `laya`, o peor, en cualquier tarea fuera de esos flujos.
- Soft accuracy inferior a Jev (0.471 frente a 0.580): el argmax es mejor, pero las distribuciones de probabilidad se parecen menos al profesor.
- Sobreconfianza: ECE de 0.213 frente al 0.144 de Jev. El parámetro `temperature_by_options` se heredó del checkpoint base y sobrescribe las temperaturas por tipo ajustadas para este modelo.
- Temperaturas por tipo ajustadas sobre datos de entrenamiento: los valores `[1.0148, 1.0374, 1.0575]` se ajustaron sobre una porción de los mismos elementos ya entrenados, lo que explica que estén tan cerca de 1.0. El autor reconoce que la confianza debe tratarse como no calibrada hasta que el checkpoint se reajuste; se recomienda recalibrar sobre datos propios de validación.
- Idioma: únicamente inglés. Para otros idiomas hay que usar `laya-multilingual`.
- Límite en preguntas `choice`: conviene mantenerlas por debajo de unas 20 opciones, porque las opciones comparten un presupuesto fijo de 256 tokens en la cabeza y un espacio de etiquetas grande reduce los tokens por etiqueta y degrada la precisión de forma acusada.
- Riesgo de alucinación: al ser un clasificador tipado no genera texto libre, pero puede asignar etiquetas o puntuaciones erróneas con alta confianza; la calibración imperfecta agrava este riesgo.
- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada.
- Licencia: Apache-2.0, lo que permite uso comercial. No obstante, las cifras comparativas de Jev son de terceros y no se midieron en este proyecto.
- Enrutado: el `Router` no selecciona este checkpoint automáticamente salvo que se construya con `auto_task_detection=True`; el autor advierte explícitamente de que no debe ser un valor por defecto silencioso.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica baja validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace (esta ficha): https://huggingface.co/michaelfeil/laya-typed-decisions
- Modelo en HuggingFace (repo original de la familia): https://huggingface.co/convaiinnovations/laya-typed-decisions
- Checkpoint base Laya: https://huggingface.co/convaiinnovations/laya
- Checkpoint multilingüe: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de flujos typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio GitHub: https://github.com/NandhaKishorM/laya
- Notebook de ajuste fino: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Issue sobre el ajuste de temperaturas: https://github.com/NandhaKishorM/laya/issues/186
- Sitio oficial de la familia: https://laya.convaiinnovations.com/
- Sitio divulgativo: https://laya-ai.com/
- Blog en HuggingFace sobre el modelo: https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
- Documentación: https://nandhakishorm.github (URL truncada en la información proporcionada)
