# changh95/openjev-p300x2

## Resumen

openjev-p300x2 es un repositorio de despliegue publicado por el usuario changh95 que ejecuta el checkpoint AlexWortega/openjev —un Qwen3.5-4B afinado como cross-encoder de inferencia de lenguaje natural (NLI) de tres clases, con la clase `Qwen3_5ForSequenceClassification`— sobre hardware Tenstorrent Blackhole. No contiene pesos propios: reutiliza el subdirectorio `qwen3.5-4b-nli/` del repositorio base. El problema que resuelve es de infraestructura: llevar un clasificador cross-encoder de tipo pooling a un acelerador no convencional (4 chips Blackhole repartidos en 4 vías de paralelismo tensorial) manteniendo las probabilidades alineadas con la referencia fp32 en CPU.

El modelo subyacente es un backbone híbrido con 24 capas Gated DeltaNet y 8 capas de atención completa con gating, dimensión oculta 2560, expuesto a través de vLLM 0.26.0 mediante el plugin vllm-tt-plugin con soporte de pooling. La API expone `POST /classify`, que devuelve las probabilidades ordenadas como `[contradiction, entailment, neutral]`; sobre esa primitiva se construyen tareas de reranking, evaluación de respuestas y juego zero-shot (el autor incluye una demo de Flappy Bird resuelta como NLI, con 28/28 tuberías y ~77 ms por decisión).

Su relevancia es doble: por un lado documenta un caso real de portado de un modelo de clasificación a Tenstorrent con parches sobre tt-metal, y por otro publica artefactos de validación reproducibles (referencia fp32/bf16 de 20 pares, probabilidades MNLI-500 en CPU y en TT, repeticiones completas de las peticiones). El repositorio está bajo licencia MIT y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated DeltaNet + 8 capas de atención completa con gating (implementación Qwen3.5/3.6 en tt-metal), hidden size 2560 |
| Parametros totales | Qwen3.5-4B (el autor cita "Qwen3.5-4B" y "27B serving defaults" como referencia de configuración; no se detalla el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como especificación del modelo; el despliegue usa trazas agrupadas de 128, 256, 512, 1024 y 2048 tokens y admite hasta 4096 con traza de 2048 + cola enmascarada |
| Tipos de cuantizacion | bf16 con `QWEN36_PRECISION=accuracy` (pesos bf16 por TP, proyecciones en HiFi4); no se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`config.json` + `model.safetensors` + tokenizer); el repositorio no duplica los pesos |
| Tarea | text-classification (cross-encoder NLI de 3 clases, salida de pooling) |
| Hardware objetivo | Tenstorrent P300x2 (2x p300 = 4 chips Blackhole), `MESH_DEVICE=P150x4`, tensor parallel de 4 vías |
| Runtime | vLLM 0.26.0 + vllm-tt-plugin parcheado + tt-metal parcheado |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer híbrido: 24 capas Gated DeltaNet (atención lineal con estado recurrente) combinadas con 8 capas de atención completa con gating, sobre una dimensión oculta de 2560. El checkpoint se usa como cross-encoder de clasificación de secuencias: la cabeza de pooling toma el estado oculto del último token tras la normalización final, y la capa lineal `score` junto con el softmax se ejecutan en el host en fp32. El prompt sigue la plantilla `Premise: {premise}\nHypothesis: {hypothesis}`.

No se dispone de información sobre el entrenamiento: la model card no indica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra etapa de alineamiento. Lo único documentado es la naturaleza del ajuste: Qwen3.5-4B convertido en cross-encoder NLI de tres vías (contradiction, entailment, neutral) mediante la clase `Qwen3_5ForSequenceClassification`.

Las innovaciones técnicas reseñadas son de despliegue, no de entrenamiento: un cargador de safetensors para checkpoints de clasificación de secuencias, una cabeza de salida pooled, un prefill de clasificación por petición, trazas de prefill agrupadas por buckets (128/256/512/1024/2048) para evitar la compilación y el despacho op a op, normalización distribuida forzada para hidden 2560 en TP (la heurística base solo la activaba por encima de 4096), chunking de canales en la convolución de GDN y una convolución depthwise MAC-FIR para los buckets sin máscara (`QWEN36_GDN_PREFILL_CONV=fir`).

## Capacidades

- Clasificación NLI de tres clases con `POST /classify`, devolviendo probabilidades calibradas frente a la referencia fp32 de CPU.
- Reranking de candidatos mediante el argmax de la probabilidad de entailment (se hace en el cliente, porque vLLM desactiva `/score` y `/rerank` para clasificadores de 3 etiquetas).
- Evaluación zero-shot de respuestas ("grading"), reutilizando la misma primitiva de entailment.
- Juego zero-shot: el estado del juego se formula como premisa y las acciones como hipótesis; el modelo elige la acción con mayor P(entailment). Demo incluida de Flappy Bird a 15 fps con ~77 ms por decisión.
- Ejecución como modelo de pooling en vLLM: no hay muestreo ni decodificación, y la salida de prefill se publica como `pooler_output`.
- Capacidades multilingües: limitadas a inglés (`language: en`).
- Tool calling / function calling: no disponible; el modelo no genera texto.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad del modelo; el bucle multi-paso existe solo en el cliente (demo de juego).

## Casos de uso

- Filtrado de alucinaciones en pipelines RAG: dada una respuesta generada y la evidencia recuperada, se formula la evidencia como premisa y la afirmación como hipótesis; si P(contradiction) supera un umbral, la respuesta se descarta antes de mostrarla al usuario.
- Reranking de resultados de búsqueda: se puntúan los pares (consulta, documento) con la probabilidad de entailment y se reordena la lista de candidatos en el cliente; el modelo es un cross-encoder, por lo que la calidad por par es superior a la de un bi-encoder, a costa de una inferencia por candidato.
- Moderación y verificación factual en inglés: comparar afirmaciones de usuarios contra una base de hechos curada y clasificar cada par en entailment/neutral/contradiction para activar revisiones humanas.
- Evaluación automática de resúmenes y traducciones: usar entailment como métrica de fidelidad entre el texto fuente (premisa) y el resumen o traducción (hipótesis), integrable en pipelines de CI de evaluación de modelos.
- Deduplicación semántica y detección de contradicciones en corpus: clasificar pares de documentos como entailment (redundantes) o contradiction (inconsistentes) para limpiar datasets de entrenamiento.
- Clasificación de tickets de soporte: mapear cada ticket a hipótesis predefinidas (por ejemplo, "el usuario pide un reembolso", "el usuario reporta un fallo de acceso") y etiquetar por entailment, con la ventaja de que añadir una categoría nueva solo requiere redactar una hipótesis.
- Demos interactivas de baja latencia sobre hardware no GPU: el despliegue sostiene ~77 ms por decisión con dos entradas y 28/28 tuberías, suficiente para bucles de decisión en tiempo casi real sin tarjetas gráficas.

## Benchmarks y rendimiento

La model card incluye una sección de resultados (fechada el 19 de septiembre de 2026) con una tabla de precisión frente al modelo fp32 de CPU sobre 20 pares NLI de 19 a 41 tokens, con columnas de número de etiquetas, delta máximo absoluto de probabilidad, delta medio absoluto y correlación de Pearson de logits. Los valores numéricos de esa tabla no están completos en la información disponible (la fila correspondiente a TT con traza por buckets aparece truncada).

| Medicion | Resultado |
|---|---|
| Pares NLI evaluados contra fp32 CPU | 20 pares, 19–41 tokens |
| Delta absoluto maximo de probabilidad (modo accuracy) | no disponible (tabla truncada); el autor indica que se mantiene dentro de ~0,01 respecto a fp32 |
| Delta absoluto medio de probabilidad (modo accuracy) | no disponible (tabla truncada) |
| Correlacion de Pearson de logits | no disponible (tabla truncada) |
| Delta con los defaults de serving de 27B (bf4 en gate/up del MLP + LoFi) | hasta 0,12 de suavizado en las probabilidades |
| Coste del modo accuracy | ~15 % más de tiempo de dispositivo |
| Evaluacion MNLI-500 | artefactos publicados en `results/` (probabilidades CPU + TT); resultados numericos no incluidos en la informacion disponible |
| Rendimiento de la demo de juego | 28/28 tuberias, ~77 ms por decision (dos entradas), 15 fps en tiempo real |
| Tiempo de compilacion de kernels | ~80 s la primera vez, ~10 s en arranques posteriores |
| MMLU, HumanEval, GSM8K | no disponible (no son tareas del modelo: es un clasificador, no un generador) |

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: no disponible; el modelo está empaquetado y validado para aceleradores Tenstorrent, no para CUDA.
- Hardware objetivo: Tenstorrent P300x2 (2x p300, equivalentes a 4 chips Blackhole), malla `(1,4)` con tensor parallel de 4 vías; variable de entorno `MESH_DEVICE=P150x4`.
- GPU recomendadas: no aplica. No se publican requisitos ni validaciones para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no documentada. El repositorio no incluye instrucciones para ejecución en GPUs de consumo.
- Referencia en CPU: los scripts incluyen una referencia fp32 en CPU usada para comparar probabilidades, no como ruta de producción.
- Opciones de despliegue: vLLM 0.26.0 (con `VLLM_TARGET_DEVICE=empty`) más el plugin vllm-tt-plugin parcheado; tt-metal compilado en el commit indicado por `TT_METAL_COMMIT` con `patches/tt-metal-openjev-classifier.diff`; y el catálogo de tt-inference-server (`--model openjev --device p300x2 --workflow server`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~77 ms por decisión para dos entradas en la demo de juego; ~80 s de compilación inicial de kernels y ~10 s en arranques posteriores. No se publica throughput agregado (tokens/s o peticiones/s) más allá de estos datos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada, y los resultados de la búsqueda web no contienen material relevante (devolvieron páginas sobre el memorial de Mount Rushmore, sin relación con el modelo). La única referencia directa disponible es el checkpoint del que deriva.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| changh95/openjev-p300x2 | Repositorio de despliegue y parches; no contiene pesos | no aplica | hasta 4096 tokens en el despliegue (traza 2048 + cola) | MIT | HuggingFace |
| AlexWortega/openjev (subcarpeta `qwen3.5-4b-nli/`) | Checkpoint de pesos original; Qwen3.5-4B ajustado como cross-encoder NLI de 3 clases | Qwen3.5-4B | no disponible | MIT (según el repositorio derivado) | HuggingFace |
| Otros cross-encoders NLI de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: únicamente inglés (`language: en`). No hay evidencia de capacidades multilingües.
- No es un modelo generativo: funciona como modelo de pooling; no produce texto, no soporta tool calling ni agentes, y no se puede usar para generación de código o matemáticas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el clasificador puede asignar entailment a pares que no se implican realmente; la probabilidad debe tratarse como señal, no como verificación factual.
- Calibración dependiente de la configuración: los defaults de serving heredados de un modelo de 27B (bf4 en gate/up del MLP y precisión LoFi) suavizan las probabilidades hasta 0,12. Para producción se recomienda `QWEN36_PRECISION=accuracy`, que cuesta aproximadamente un 15 % más de tiempo de dispositivo.
- Contexto limitado: peticiones por encima de 2048 tokens recurren a una traza de 2048 más una cola enmascarada, con un techo de 4096 tokens en el despliegue documentado.
- Reranking no nativo en servidor: vLLM desactiva `/score` y `/rerank` en clasificadores de 3 etiquetas, por lo que el reranking debe implementarse en el cliente tomando el argmax de la probabilidad de entailment.
- Dependencia fuerte de hardware y versiones: requiere modificar tt-metal en un commit concreto y aplicar parches a vllm-tt-plugin; no hay una ruta de despliegue estándar ni portable.
- Los pesos no están incluidos en este repositorio (tamano del repo: 0,0 GB); hay que descargar el subdirectorio `qwen3.5-4b-nli/` del modelo base.
- Trazabilidad limitada del modelo base: no se documentan dataset de entrenamiento, número de tokens ni etapas de alineamiento, lo que dificulta auditar sesgos.
- Licencia MIT: permite uso comercial, pero se hereda cualquier restricción del checkpoint base y de Qwen3.5; conviene revisar la licencia del modelo original.
- Sin datos de benchmarks públicos más allá de la validación de equivalencia numérica con fp32 y la evaluación MNLI-500, cuyos resultados numéricos no están completos en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/changh95/openjev-p300x2
- Modelo base y pesos (`qwen3.5-4b-nli/`): https://huggingface.co/AlexWortega/openjev
- Subcarpeta de pesos: https://huggingface.co/AlexWortega/openjev/tree/main/qwen3.5-4b-nli
- Video de la demo de Flappy Bird: https://huggingface.co/changh95/openjev-p300x2/resolve/main/videos/openjev_flappy_turnbased.mp4
- Plugin vLLM para Tenstorrent: https://github.com/tenstorrent/vllm-tt-plugin
- tt-metal (runtime de Tenstorrent): https://github.com/tenstorrent/tt-metal
- tt-inference-server: https://github.com/tenstorrent/tt-inference-server
- Resultados de busqueda web: no se encontraron enlaces relevantes al modelo (los resultados devueltos corresponden a páginas sin relación con el repositorio).
