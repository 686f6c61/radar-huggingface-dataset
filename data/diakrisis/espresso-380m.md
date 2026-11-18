# diakrisis/espresso-380m

## Resumen
diakrisis/espresso-380m es un encoder de 380 millones de parámetros desarrollado por diakrisis que responde preguntas tipadas sobre un texto y devuelve una probabilidad para cada respuesta posible, además de una decisión final. El modelo resuelve un problema concreto: la clasificación y el enrutamiento determinista de texto con salida estructurada y calibrada, incluyendo detección de prompt injection, sin necesidad de generar texto libre. Es relevante porque consigue un rendimiento global (0.795) prácticamente idéntico al de su profesor, Cloudflare Clef-flash de 9.4B (0.793), con un modelo 24 veces menor que corre en CPU mediante ONNX Runtime sin PyTorch.

El modelo se distribuye con dos builds ONNX (fp32 de 1.5 GB y w8 de 573 MB), una regla de decisión congelada (`R12_DECISION_RULE.json`) y un wrapper en Python (`espresso.py`). Soporta tres tipos de pregunta: `noul` (sí/no), `choice` (una opción de una lista, que puede incluir `none_of_these`) y `score` (un nivel en una escala ordenada). El formato de petición es el mismo que usan Clef y Jev.

La propuesta encaja en pipelines de producción donde se necesita una señal de clasificación barata, reproducible y con umbrales de confianza explícitos, en lugar de un LLM generativo. La versión 1.0 se publica con un resultado de auditoría declarado abiertamente: 7 de 9 checks de retención superados, con dos fallos estrechos documentados en la propia model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base `vllm-sr/vela3-fast`, basado en `dmis-lab/UltraBERT-380M`) con adaptador LoRA (rango 16) y cabezas de decisión |
| Parámetros totales | 380M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; se documenta atención ventaneada en las 16 capas locales y pruebas a 8k tokens |
| Tipos de cuantización | fp32 (exacto, 1.5 GB) y w8 (pesos en bloques de 8 bits, 573 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (dos builds), safetensors como dependencia de carga, tokenizers |

## Arquitectura y entrenamiento
El modelo parte de `vllm-sr/vela3-fast`, un encoder de 380M derivado de `dmis-lab/UltraBERT-380M`, y se afina mediante un adaptador LoRA de rango 16 más pequeñas cabezas de decisión que producen probabilidades sobre respuestas tipadas. La inferencia se ejecuta en ONNX Runtime sobre CPU, sin dependencia de PyTorch. El modelo incorpora atención ventaneada en 16 capas locales, que según el autor produce resultados idénticos y es hasta un 39% más rápida que la atención densa a 8k tokens.

El entrenamiento es una destilación desde Cloudflare Clef-flash (9.4B), un profesor notablemente mayor. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, aunque sí menciona 19 suites de auditoría y conjuntos de evaluación específicos (incluido `synth_options_xl` para preguntas de muchas opciones). La innovación principal no es arquitectónica sino de producto: una regla de decisión congelada que convierte probabilidades en decisiones accionables con un estado REVIEW para los casos inciertos.

La regla de decisión tiene dos componentes. En preguntas `choice` con al menos 50 opciones que incluyen `none_of_these`, se aplica un refuerzo de 0.25 a `none_of_these` y, si la probabilidad de la respuesta principal cae por debajo de 0.88, la decisión pasa a REVIEW en lugar de responder. En preguntas `choice` sobre exactamente `PASS` y `FAIL`, se aplica una penalización de −0.15 a `PASS`. Los objetivos declarados eran: como máximo un 25% enviado a revisión, menos de un 5% de fallos silenciosos y menos de un 5% de respuestas incorrectas silenciosas.

## Capacidades
- Clasificación zero-shot con salida tipada: preguntas de sí/no (`noul`), elección entre opciones (`choice`) y puntuación en escala ordenada (`score`).
- Detección de prompt injection, con un AUROC de 0.942 en las 19 suites de auditoría (frente a 0.843 del modelo base).
- Enrutamiento y triaje de texto: asignación a equipos, categorías o niveles de urgencia mediante criterios definidos en la petición.
- Decisión calibrada con estado REVIEW para casos de baja confianza en preguntas de muchas opciones.
- Manejo de documentos largos, con atención ventaneada eficiente a 8k tokens.
- Ejecución en CPU sin PyTorch, con builds fp32 y w8 de alta concordancia con el modelo evaluado en GPU.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso; es un clasificador, no un LLM generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso
- Triaje de tickets de soporte: el modelo recibe el texto del ticket y varias preguntas tipadas (¿es de facturación?, ¿qué equipo lo gestiona?, ¿qué urgencia tiene?) y devuelve probabilidades y decisiones. Es adecuado porque el enrutamiento necesita salida estructurada y barata, no generación libre.
- Detección de prompt injection en producción: con un AUROC de 0.942, puede colocarse como filtro previo a un LLM generativo para marcar entradas sospechosas antes de que lleguen al modelo principal.
- Moderación y clasificación de contenido: preguntas `noul` y `score` permiten etiquetar textos con umbrales explícitos y enviar los casos dudosos a revisión humana.
- Enrutamiento de correo o mensajes entrantes: preguntas `choice` con criterios definidos permiten asignar departamento o categoría sin entrenar un clasificador específico por tarea.
- Filtrado y priorización en pipelines de datos: clasificación masiva en CPU de grandes volúmenes de texto (por ejemplo, separar documentos relevantes de ruido) sin coste de GPU.
- Evaluación PASS/FAIL en control de calidad: la regla específica para `PASS`/`FAIL` con penalización a `PASS` está pensada para escenarios de validación donde los falsos positivos son costosos.
- Despliegue en entornos con recursos limitados: al correr en CPU con ONNX Runtime y ocupar 573 MB en w8, encaja en servicios contenedorizados sin GPU o en el edge.

## Benchmarks y rendimiento

Precisión global en las 19 suites de auditoría (mismos ítems, mismo scorer; los REVIEW de Espresso cuentan como respuesta incorrecta):

| Modelo | Tamaño | Global | Global sin synth_options_xl |
|---|---|---|---|
| Gemini Decision 1 (Google, API) | no divulgado | 0.828 | 0.832 |
| Jev 1.14 (TypeSafe, API) | no divulgado | 0.821 | 0.824 |
| espresso-380m | 380M | 0.795 | 0.794 |
| Clef-flash (profesor) | 9.4B | 0.793 | 0.794 |
| gliclass-v4-edge | no disponible | 0.745 | 0.749 |
| vela3-fast (base) | 380M | 0.719 | 0.720 |
| open-jev-deberta | no disponible | 0.600 | 0.603 |
| laya | no disponible | 0.519 | 0.522 |

Ganancias sobre el modelo base en las 19 suites:

| Medida | Base (vela3-fast) | Espresso |
|---|---|---|
| Precisión global | 0.719 | 0.795 |
| AUROC de prompt injection | 0.843 | 0.942 |

Conjunto de confirmación (datos frescos, nunca usados para ajuste):

| Comprobación | Resultado |
|---|---|
| Gates en el conjunto principal | 17 de 17 superados |
| Conjunto de muchas opciones, enviados a revisión | 23.2% (209/900) |
| Conjunto de muchas opciones, fallos silenciosos | 2.3% (7/300) |
| Conjunto de muchas opciones, respuestas incorrectas silenciosas | 2.2% (13/600) |
| Documentos largos, cambio frente al base | 0.0008 absoluto, concordancia 0.963 |

Concordancia de los builds CPU con las predicciones en GPU (190 ítems, 414 decisiones):

| Comprobación | Resultado |
|---|---|
| Build fp32, decisiones coincidentes | 414 de 414 |
| Build w8, decisiones coincidentes | 412 de 414 |
| Desajustes de tokenizador | 0 en 8,245 textos |

Velocidad en CPU (indicativa, una CPU de escritorio con 20 hilos, no es un benchmark): encoder desnudo, unos 76 ms para 64 tokens y unos 240 ms para 256 tokens. La atención ventaneada en las 16 capas locales es hasta un 39% más rápida que la densa a 8k tokens.

## Requisitos de hardware
- Inferencia en CPU: es el modo de despliegue previsto. Build w8 de 573 MB y build fp32 de 1.5 GB; el tamaño del repo es de 2.1 GB.
- No requiere GPU; el autor indica que no necesita PyTorch, solo ONNX Runtime, tokenizers, safetensors y numpy.
- VRAM estimada: no aplica para el despliegue de referencia en CPU; no se documentan requisitos de VRAM.
- GPU recomendadas: no disponibles; las puntuaciones se midieron en GPU, pero el modelo se distribuye para CPU.
- Cabe en cualquier equipo de consumo por su tamaño (573 MB en w8), sin necesidad de GPU dedicada.
- Opciones de despliegue: ONNX Runtime con el wrapper `espresso.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 76 ms para 64 tokens y 240 ms para 256 tokens en una CPU de 20 hilos; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global (19 suites) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| espresso-380m | 380M | hasta 8k probado | 0.795 | Apache 2.0 | pesos abiertos en HF (ONNX) |
| Clef-flash (profesor) | 9.4B | no disponible | 0.793 | no disponible | no disponible como pesos abiertos |
| gliclass-v4-edge | no disponible | no disponible | 0.745 | no disponible | no disponible |
| vela3-fast (base) | 380M | no disponible | 0.719 | no disponible | referenciado como base |
| Gemini Decision 1 | no divulgado | no disponible | 0.828 | propietaria | API alojada |
| Jev 1.14 | no divulgado | no disponible | 0.821 | propietaria | API alojada |

Espresso iguala a su profesor de 9.4B con un 4% de sus parámetros, y queda por debajo de dos APIs alojadas propietarias (Gemini Decision 1 y Jev 1.14) por 2.6 y 3.3 puntos respectivamente. Frente a alternativas abiertas de la misma categoría (gliclass-v4-edge, open-jev-deberta, laya), es el que obtiene mayor precisión global en la comparativa publicada.

## Limitaciones y advertencias
- La auditoría no se superó por completo: fallaron 2 de 9 checks de retención. La retención en entradas largas tuvo un límite inferior del 95% de −0.0200 frente a un límite de −0.02, y los originales de política cayeron 1.1 puntos frente a un límite de 1.0.
- Las 19 suites de auditoría no son datos frescos: son splits de test reservados, pero se usaron en rondas de desarrollo anteriores. Solo el conjunto de confirmación estaba intacto.
- Dos modelos alojados puntúan por encima: Gemini Decision 1 (0.828) y Jev 1.14 (0.821) frente a 0.795 de Espresso. En la comparativa, un REVIEW de Espresso cuenta como respuesta incorrecta.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Es un clasificador, no un generador: no produce texto libre, no hace tool calling ni razonamiento multi-paso.
- Riesgo de alucinación en el sentido generativo no aplica, pero sí existe riesgo de clasificación incorrecta silenciosa, mitigado parcialmente por la regla de decisión (objetivo de menos del 5% de fallos silenciosos, con 2.3% medido en el conjunto de muchas opciones).
- La regla de decisión está congelada y solo cubre casos concretos (muchas opciones con `none_of_these` y PASS/FAIL); otros escenarios dependen de umbrales definidos por el usuario.
- Las APIs alojadas comparadas rechazan preguntas `choice` con más de 255 opciones, lo que afecta a la comparabilidad de la columna global.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (`vllm-sr/vela3-fast` y `dmis-lab/UltraBERT-380M`) tiene condiciones propias que conviene verificar antes de un despliegue comercial.
- Las mediciones de velocidad son indicativas y no constituyen un benchmark; el rendimiento variará según la CPU y el número de hilos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/diakrisis/espresso-380m
- Modelo base: https://huggingface.co/vllm-sr/vela3-fast
- Encoder de origen: https://huggingface.co/dmis-lab/UltraBERT-380M
- Profesor de destilación: Cloudflare Clef-flash (sin enlace disponible en la información proporcionada)
- API comparada: Jev 1.14 de TypeSafe (sin enlace disponible en la información proporcionada)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
