# mariojcr/laya-onnx

## Resumen

Laya ONNX es la exportación a formato ONNX del modelo de decisión no autorregresivo `convaiinnovations/laya`, desarrollado originalmente por Convai Innovations. No se trata de un modelo de lenguaje generativo, sino de un clasificador de decisiones: recibe una pregunta con un conjunto de opciones (o una escala de puntuación) y devuelve logits por opción, más un segundo cabezal de acción. El repositorio lo publica Mario Campos (usuario `mariojcr`) y sólo cambia el formato de pesos, no los pesos en sí: agrupa encoder y cabezal de decisión en un único grafo ONNX que se ejecuta bajo ONNX Runtime sin necesidad de PyTorch.

La arquitectura combina un encoder transformer ModernBERT-large (421M parámetros, licencia Apache-2.0) con un cabezal de decisión tipado. El repositorio incluye tres checkpoints exportados: `english/` (ModernBERT-large, 421M, contexto de 512 tokens), `multilingual/` (encoder mmBERT-base de 322M, contexto de 1024 tokens, más de 100 idiomas y aproximadamente el doble de rápido) y `typed-decisions/` (ModernBERT-large, 421M, contexto de 1024 tokens).

Su relevancia práctica radica en que es el artefacto que sirve el gateway de inferencia del proyecto Altherium mediante `POST /v1/decisions`, con el modelo cargado en proceso por cada nodo de inferencia. Al ser ONNX puro, permite integrar decisiones calibradas en entornos sin PyTorch (C++, .NET, edge) manteniendo paridad numérica con la referencia de PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large o mmBERT-base) con cabezal de decisión tipado, no autorregresivo |
| Parámetros totales | 421M (`english/`, `typed-decisions/`); 322M (`multilingual/`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (`english/`); 1024 tokens (`multilingual/`, `typed-decisions/`) |
| Tipos de cuantización | F32 únicamente (pesos inline en el grafo, 1,3–1,7 GB por grafo). No se publican variantes cuantizadas |
| Idiomas soportados | Inglés en los checkpoints `english/` y `typed-decisions/`; más de 100 idiomas en `multilingual/` |
| Licencia | Apache-2.0 (modelo original y exportación) |
| Formato de pesos | ONNX (opset 18, pesos F32 embebidos), más `tokenizer.json`, `tokenizer_config.json` y `rl_agent_config.json` |
| Librería de inferencia | onnxruntime |
| Tarea (pipeline) | text-classification |
| Tamaño del repositorio | 9,4 GB |
| Descargas / likes | 0 descargas / 1 like |
| Fechas del repositorio | Creado el 2026-09-22, actualizado el 2026-09-22 |

## Arquitectura y entrenamiento

El modelo original es un sistema de decisión no autorregresivo: no genera tokens, sino que puntúa un conjunto cerrado de opciones. La exportación conserva un único grafo ONNX que contiene encoder y cabezal, exportado con `torch.onnx.export(dynamo=True)` y opset 18. El contrato del grafo define entradas con ejes dinámicos (`n` preguntas, `L` tokens, `k` opciones): `input_ids` int64 `[n, L]`, `attention_mask` int64 `[n, L]`, `marker_pos` int64 `[n, k]` (posición del marcador `[MASK]` de cada opción), `marker_mask` bool `[n, k]` (qué marcadores son reales, con `false` en el padding) y `qtype` int64 `[n]` (0 = choice, 1 = score, 2 = noul). Las salidas son `logits` float32 `[n, k]` (las opciones enmascaradas se fijan a −1e4) y `act_logits` float32 `[n, 2]`.

El formato de secuencia es el del SDK de Laya (`laya/common.py`, `laya/agent.py`): `[CLS] <type> question: <instructions> [SEP] [MASK] option… [SEP] <state> [SEP]`, con hasta 48 tokens por opción, `head_max_len` para el conjunto de opciones y `max_len` de 512 tokens totales. Para obtener probabilidades calibradas hay que aplicar `temperature_by_options` del SDK (limitada al rango [0,5; 5]) antes del softmax. La tokenización es byte-level BPE para los checkpoints ModernBERT y SentencePiece BPE de Gemma para mmBERT.

No se documentan en la información disponible los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO o fases de ajuste). La paridad numérica de la exportación se verificó contra la referencia en PyTorch sobre el ejemplo del README del SDK y sobre un segundo lote con distinta forma: la diferencia máxima absoluta de logits es de 1,8e-6.

## Capacidades

- Decisiones sobre opciones cerradas: emite logits por opción (`[n, k]`) con las opciones de padding enmascaradas a −1e4.
- Tres tipos de consulta mediante `qtype`: 0 = choice (elección entre opciones), 1 = score (puntuación), 2 = noul (rechazo o "ninguna de las anteriores").
- Salida adicional de acción: `act_logits` float32 `[n, 2]`.
- Probabilidades calibradas: aplicando `temperature_by_options` del SDK antes del softmax se obtienen probabilidades calibradas (temperatura limitada a [0,5; 5]).
- Ejecución sin PyTorch: el grafo completo (encoder + cabezal) se ejecuta en ONNX Runtime.
- Procesamiento por lotes con ejes dinámicos en `n`, `L` y `k`, lo que permite agrupar preguntas y opciones de distinta cardinalidad en una misma llamada.
- Multilingüismo en el checkpoint `multilingual/` (más de 100 idiomas), con encoder mmBERT-base y contexto de 1024 tokens.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni comportamiento de agente autónomo; sólo resuelve la decisión puntuada que recibe en la entrada.
- No dispone de visión ni audio.
- No dispone de modo "thinking" ni de generación de texto libre.

## Casos de uso

- Selección de acción en agentes conversacionales y NPCs: dado un estado (`<state>`) y un conjunto de acciones posibles, el modelo puntúa cada opción con su logit y permite escoger la mejor sin generar texto, con coste de cómputo muy inferior al de un LLM generativo.
- Enrutado de peticiones en gateways de inferencia: es exactamente el uso que hace Altherium con `POST /v1/decisions`, donde el grafo se carga en proceso en cada nodo y decide entre alternativas de enrutado o de política.
- Puntuación tipo escala (qtype = 1): útil para clasificar respuestas en escalas discretas, por ejemplo evaluación de calidad percibida o priorización de tickets en un sistema de soporte.
- Filtrado con opción de rechazo (qtype = 2, noul): clasificación con posibilidad explícita de "ninguna de las anteriores", útil en moderación de contenido o en detección de consultas fuera de catálogo.
- Clasificación de intenciones con calibración explícita: al aplicar `temperature_by_options` antes del softmax, las probabilidades resultantes son aptas para umbrales de confianza y derivación a revisión humana, algo crítico cuando el sistema debe abstenerse en lugar de arriesgar.
- Despliegue en entornos sin Python/PyTorch: al ser un grafo ONNX puro, se puede integrar en servicios en C++, .NET, Rust o Java mediante los bindings de ONNX Runtime, lo que facilita el despliegue en infraestructura existente no basada en el ecosistema PyTorch.
- Servicio multilingüe con latencia reducida: el checkpoint `multilingual/` (mmBERT-base, 322M) cubre más de 100 idiomas y es aproximadamente el doble de rápido, adecuado para enrutado o clasificación en producto con tráfico internacional.
- Decisión tipada en flujos de trabajo estructurados: el checkpoint `typed-decisions/` con contexto de 1024 tokens está pensado para flujos donde la decisión requiere más estado de entrada que en el checkpoint inglés de 512 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento publicados en el repositorio son la verificación de paridad y una medición de latencia en CPU, que no constituyen benchmarks de calidad del modelo:

| Medición | Valor | Condiciones |
|---|---|---|
| Diferencia máxima de logits frente a PyTorch | 1,8e-6 | Ejemplo del README del SDK y un segundo lote de distinta forma |
| Latencia en CPU | ~370 ms | Lote de 4 preguntas de 96 tokens, 20 hilos, ONNX Runtime 1.29, execution provider de CPU |

No se han encontrado en la búsqueda web resultados de evaluación (MMLU, HumanEval, GSM8K u otros) de este modelo ni de su versión base.

## Requisitos de hardware

- Tamaño de pesos por grafo: 1,3–1,7 GB en F32 (pesos embebidos en el propio `.onnx`).
- VRAM estimada para inferencia en GPU: aproximadamente 2–3 GB por grafo en F32 con lotes pequeños (estimación a partir del tamaño del grafo y del overhead de activaciones; no publicada por el autor).
- Repositorio completo: 9,4 GB en disco si se descargan los tres checkpoints con sus ficheros auxiliares.
- Cabe en GPU de consumo: sí, cualquier GPU con 4 GB o más de VRAM debería poder ejecutar un grafo en F32; se trata de una estimación derivada del tamaño de los pesos, no de una medición publicada.
- GPU recomendadas: no disponibles en la información proporcionada. No se publican mediciones con A100, H100 ni RTX 4090.
- Despliegue: ONNX Runtime, con execution providers de CPU, CUDA, DirectML o TensorRT. No se menciona soporte de vLLM, llama.cpp ni Ollama, que no aplican a un modelo de decisión no generativo.
- Latencia en CPU: ~370 ms para un lote de 4 preguntas de 96 tokens con 20 hilos (ONNX Runtime 1.29, CPU EP).
- Throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos externos comparables de la misma categoría. La comparación posible es interna, entre los tres checkpoints exportados y el modelo original en PyTorch:

| Variante | Encoder | Parámetros | Contexto | Idiomas | Formato | Licencia |
|---|---|---|---|---|---|---|
| `english/laya.onnx` | ModernBERT-large | 421M | 512 | Inglés | ONNX (F32) | Apache-2.0 |
| `multilingual/laya-multilingual.onnx` | mmBERT-base | 322M | 1024 | Más de 100 | ONNX (F32) | Apache-2.0 |
| `typed-decisions/laya-typed-decisions.onnx` | ModernBERT-large | 421M | 1024 | Inglés | ONNX (F32) | Apache-2.0 |
| `convaiinnovations/laya` (original) | ModernBERT-large | 421M | 512 | Inglés | No disponible en la información proporcionada | Apache-2.0 |

Frente al modelo original, la exportación ONNX no modifica pesos ni arquitectura, pero elimina la dependencia de PyTorch y añade dos variantes adicionales (multilingüe y typed-decisions). No se dispone de comparación de calidad entre variantes ni frente a modelos de clasificación externos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, sólo logits sobre opciones predefinidas. No debe presentarse como un LLM.
- Contexto limitado a 512 tokens en el checkpoint `english/` (1024 en `multilingual/` y `typed-decisions/`). El estado se trunca por la derecha cuando se excede el límite.
- El checkpoint principal (`english/`) es sólo en inglés; la variante multilingüe usa un encoder distinto (mmBERT-base) y no está exportada desde el mismo checkpoint inglés.
- El propio autor remite a la model card original para las limitaciones en preguntas `choice` de alta cardinalidad y en decisiones tipadas zero-shot, lo que sugiere un rendimiento degradado en esos escenarios.
- Presupuesto por opción: hasta 48 tokens por opción, lo que restringe la longitud de cada alternativa.
- Calibración dependiente del SDK: las probabilidades sólo están calibradas si se aplica `temperature_by_options` (limitada a [0,5; 5]) antes del softmax. Omitir ese paso produce probabilidades no calibradas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero existe riesgo de decisiones mal calibradas fuera de la distribución de entrenamiento. No se documentan datos de entrenamiento ni sesgos conocidos en la información disponible.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya a Convai Innovations (modelo, entrenamiento y SDK) y a Mario Campos (exportación ONNX).
- Validación comunitaria muy baja: 0 descargas y 1 like en el momento de la consulta, con repositorio creado y actualizado el mismo día (2026-09-22). Conviene verificar la paridad de forma independiente antes de usarlo en producción.
- No se publican benchmarks de calidad, por lo que no hay evidencia pública de rendimiento frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mariojcr/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de Altherium (gateway de inferencia que sirve el modelo): https://github.com/mariojcr/altherium
- ONNX Runtime: https://onnxruntime.ai

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente un resultado no relacionado sobre alquiler de contenedores en Denton, Texas).
