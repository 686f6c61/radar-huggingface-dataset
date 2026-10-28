# SinhalaMMLU-SharedTask/team-ape-llama

## Resumen

`team-ape-llama` es el sistema presentado por el equipo APE a la tarea compartida SinhalaMMLU (ICTer 2026), un benchmark de comprensión multitarea en cingalés publicado en EMNLP 2025 (Pramodya et al., pp. 32943-32961). No se trata de un modelo entrenado desde cero, sino de un *wrapper* de evaluación: un adaptador LoRA de 17.440.768 parámetros (r=8, aplicado a todas las proyecciones de atención y MLP) montado sobre el modelo base `google/gemma-4-e4b-it` (7.480 B parámetros, cargado en bf16 y en modo solo texto). El total en inferencia es de aproximadamente 7,498 B parámetros, por debajo del límite de 8 B que imponía la tarea.

El problema que resuelve es acotado y muy específico: responder preguntas de opción múltiple en cingalés mediante *logit scoring* sobre las etiquetas de opción 1-4, con un *prompt* de instrucción en cingalés (`si_basic`), en régimen zero-shot y sin muestreo (`do_sample=False`, semilla fija). El envío oficial utiliza `perm4`, una rotación determinista de las opciones: cada pregunta se puntúa cuatro veces con las opciones en orden rotado y las puntuaciones se suman, sin parámetros adicionales.

Su relevancia es doble. Por un lado, es un artefacto reproducible de un envío concreto a un *shared task*: incluye el archivo `predictions.jsonl` exacto que se subió y las puntuaciones de Codabench (Macro 52,9973). Por otro, documenta una técnica barata y sin entrenamiento adicional (rotación de opciones) para mitigar el sesgo de posición en evaluación de opción múltiple. La información pública es escasa: no se declaran licencia, idiomas soportados ni longitud de contexto, y el repositorio de código completo con el `MANIFEST` es privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card (modelo base `google/gemma-4-e4b-it`; el adaptador es LoRA sobre atención y MLP) |
| Parametros totales | 7.480 B (base) + 17.440.768 (adaptador LoRA) = ~7,498 B en inferencia |
| Parametros activos | No aplica (no es MoE; un único modelo base + un único adaptador, sin ensemble ni router) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Carga documentada en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | Cingalés para las instrucciones del *prompt* (`si_basic`); resto no disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (adaptador LoRA en repositorio separado; formato de serialización no especificado) |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se detalla en la model card; el identificador declarado es `google/gemma-4-e4b-it`, cargado en modo texto (*text-only load*) con los *embeddings* contados por capa, lo que arroja 7.480 B parámetros en bf16. Sobre esa base se entrena un único adaptador LoRA de 17.440.768 parámetros con rango r=8, aplicado a todas las proyecciones de atención y MLP. No hay ensemble, router, recuperación, acceso a internet ni API cerrada en el momento de la inferencia.

El pipeline de evaluación es determinista: *prompt* de instrucción en cingalés, zero-shot, *scoring* de logits sobre las etiquetas 1-4 y `do_sample=False` con semilla fija. El envío final (`perm4`) replica cada pregunta cuatro veces con las opciones en un orden rotado fijo y suma las puntuaciones; es la misma pareja modelo+adaptador, sin parámetros extra. La variante `perm1` (pasada única) está configurada en `configs/sub_run1_bf16_perm1.yaml`. El entrenamiento se documenta en `training/`, y la composición de un fichero de datos adicional se infiere a partir de tamaños de fichero según `training/README_training.md`, con la propia model card indicando que está "por confirmar". No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Respuesta a preguntas de opción múltiple (4 opciones) en cingalés mediante *logit scoring*, no mediante generación libre.
- Seguimiento de instrucciones zero-shot en cingalés con un *prompt* fijo (`si_basic`).
- Evaluación robusta al orden de opciones mediante rotación determinista `perm4` (4 pasadas, suma de puntuaciones).
- Inferencia determinista y reproducible: `do_sample=False`, semilla fija y archivo de predicciones publicado.
- Ajuste fino mediante LoRA (r=8) sobre proyecciones de atención y MLP, con adaptador distribuido por separado.
- Restricción explícita de tamaño: un único modelo base (≤ 8 B) más un único adaptador.
- No se documenta soporte de *tool calling*, uso de agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidad multilingüe: no disponible más allá del cingalés empleado en el *prompt*.

## Casos de uso

- **Ablación de sesgo de posición en benchmarks de opción múltiple**: el sistema `perm4` permite cuantificar cuánto de la puntuación depende del orden de las opciones comparándolo con `perm1`; útil para investigadores que diseñan *harnesses* de evaluación justos.
- **Evaluación estandarizada de modelos en cingalés**: sirve como referencia ejecutable (código + `predictions.jsonl`) para reproducir las puntuaciones de Codabench de la tarea SinhalaMMLU y verificar envíos propios.
- **Baseline de bajo coste para nuevos ajustes en cingalés**: al caber en una sola A100 y requerir ~7,5 B parámetros, es un punto de partida asequible antes de invertir en modelos mayores o en datos anotados propios.
- **Generación de material de autoevaluación educativa**: el mismo *scoring* por logits puede puntuar bancos de preguntas tipo test en cingalés para plataformas de prácticas, con la ventaja de ser determinista y auditable.
- **Filtrado y curación de corpus de opción múltiple**: usar la diferencia de logits entre opciones como señal de ambigüedad para descartar ítems mal formados o con más de una respuesta defendible.
- **Investigación en calibración de modelos pequeños**: la combinación de `do_sample=False`, rotación de opciones y semilla fija facilita estudiar calibración y estabilidad de puntuaciones sin ruido de muestreo.
- **Validación interna de pipelines de inferencia**: el tiempo conocido (~285 s para 2.238 preguntas con `perm4` en 1x A100) permite usar el sistema como prueba de humo de despliegues PEFT+Transformers.

## Benchmarks y rendimiento

Resultados publicados en Codabench por el equipo (archivo `predictions.jsonl` incluido en el repositorio, correspondiente al envío oficial):

| Conjunto | Puntuacion |
|---|---|
| Easy | 52,0249 |
| Medium | 49,2349 |
| Hard | 57,7320 |
| Macro | 52,9973 |

Datos de ejecución declarados: conjunto de test de 2.238 preguntas puntuado en aproximadamente 285 s con `perm4` en 1x NVIDIA A100 (Google Colab), excluyendo la descarga del modelo. De forma derivada, esto equivale a ~7,85 preguntas/s o ~31,4 puntuaciones de opción por segundo (4 pasadas por pregunta), estimación aritmética no publicada por los autores.

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de la comparación con otros envíos del *shared task*.

## Requisitos de hardware

- VRAM estimada para inferencia: ~15 GB solo para pesos en bf16 (7.480 B parámetros × 2 bytes) más ~35 MB del adaptador; el *KV cache* y activaciones añaden overhead no cuantificado en la model card.
- Cuantización a 8 bits: ~7,5 GB de pesos (estimación derivada del recuento de parámetros, no verificada por los autores); a 4 bits: ~4 GB (misma salvedad).
- GPU recomendadas: 1x NVIDIA A100, configuración efectivamente usada (Google Colab). Con 24 GB de VRAM (RTX 4090, A10G, L4) el modelo en bf16 debería caber, aunque no está verificado en la información disponible.
- GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) en bf16 y en tarjetas de 8-12 GB con cuantización de 4-8 bits, siempre como estimación.
- Opciones de despliegue: Transformers + PEFT es la ruta documentada (`pip install -r requirements.txt && python inference.py`). No se publican artefactos GGUF, por lo que llama.cpp y Ollama requerirían conversión propia; vLLM y TGI son compatibles con LoRA en teoría pero no están documentados para este adaptador.
- Latencia y throughput: ~285 s para 2.238 preguntas con `perm4` en A100 (~0,127 s por pregunta, cuatro pasadas incluidas), según datos del autor.
- Almacenamiento: pesos base en bf16 (~15 GB) más el adaptador (~35 MB en el formato de serialización habitual).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro SinhalaMMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `team-ape-llama` (este sistema) | ~7,498 B (base + LoRA) | No disponible | 52,9973 (Codabench) | No disponible | Público en HuggingFace |
| `google/gemma-4-e4b-it` (base, sin adaptador) | 7.480 B | No disponible | No disponible (no evaluado en la model card) | No disponible | Referenciado, no verificado en esta busqueda |
| Otros envios al shared task SinhalaMMLU (ICTer 2026) | No disponible | No disponible | No disponible | No disponible | Leaderboard de Codabench, no consultado |
| Modelos abiertos de ~7-8 B de propósito general | ~7-8 B | No disponible | No disponible | Varía | Amplia |

No hay datos públicos en la información proporcionada que permitan una comparación cuantitativa con alternativas. La comparación más informativa sería contra el modelo base sin adaptador y contra el resto de envíos del *shared task*, pero ninguna de las dos está disponible aquí.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no se puede asumir uso comercial; hay que contactar con los autores antes de cualquier despliegue en producción.
- **Alcance muy restringido**: el sistema está diseñado para *scoring* de opción múltiple con etiquetas 1-4 en cingalés; no es un modelo de generación libre ni un asistente conversacional.
- **Riesgo de alucinación**: no evaluado en la información disponible; el *scoring* por logits reduce la generación espontánea, pero no elimina respuestas erróneas con alta confianza.
- **Sesgos**: no documentados. La rotación `perm4` mitiga el sesgo de posición, pero no se publican análisis de sesgo por tema, dominio o formato de pregunta.
- **Identificador de modelo base inusual**: la model card cita `google/gemma-4-e4b-it`, un identificador que no se ha podido verificar en esta búsqueda; conviene confirmar que el checkpoint cargado es el declarado antes de reproducir resultados.
- **Discrepancia de nombres**: el repositorio se llama `team-ape-llama` mientras que la base declarada es de la familia Gemma; el nombre puede inducir a error sobre la arquitectura real.
- **Reproducibilidad parcial**: el código completo, el `MANIFEST` y los datos de entrenamiento están en un repositorio privado de GitHub (tag `final-oct28`), y la composición de un fichero de datos de entrenamiento se describe como "por confirmar".
- **Coste de `perm4`**: cuadruplica el cómputo de inferencia frente a `perm1`; en el conjunto de test son ~285 s en A100, aceptable, pero se multiplica en cargas mayores.
- **Riesgo de contaminación del benchmark**: al ser un envío a un *shared task* con datos de entrenamiento adicionales no públicos en detalle, no puede descartarse solapamiento con el conjunto de evaluación.
- **Contexto e idiomas desconocidos**: sin longitud de contexto declarada no se pueden planificar cargas con entradas largas, y no hay evidencia de competencia fuera del cingalés.
- **Métricas modestas**: un Macro de 52,9973 sobre preguntas de 4 opciones (azar = 25) deja un margen amplio de mejora; no debe presentarse como un sistema de conocimiento fiable en producción.

## Enlaces

- Repositorio principal (código de inferencia y `predictions.jsonl`): https://huggingface.co/SinhalaMMLU-SharedTask/team-ape-llama
- Repositorio del adaptador LoRA: https://huggingface.co/SinhalaMMLU-SharedTask/team-ape-llama-gemma4-e4b-lora
- Modelo base referenciado: `google/gemma-4-e4b-it` (no se proporciona URL verificada en la información disponible)
- Referencia del benchmark: Pramodya et al., *SinhalaMMLU: A Comprehensive Benchmark for Evaluating Multitask Language Understanding in Sinhala*, EMNLP 2025, pp. 32943-32961 (URL del paper no disponible en la información proporcionada)
- Leaderboard de Codabench del shared task: no disponible (URL no incluida en la model card)
- Repositorio GitHub con código completo y `MANIFEST`: privado, tag `final-oct28`, rama `final/oct28`
