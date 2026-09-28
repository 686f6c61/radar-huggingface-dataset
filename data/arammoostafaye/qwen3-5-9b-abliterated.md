# arammoostafaye/Qwen3.5-9B-abliterated

## Resumen

Qwen3.5-9B-abliterated es un ajuste del modelo Qwen/Qwen3.5-9B publicado por el usuario arammoostafaye en HuggingFace. Se trata de una variante "abliterated": se han eliminado deliberadamente los comportamientos de rechazo (refusal) mediante una técnica de proyección ortogonal sobre los pesos, seguida de un ajuste fino con QLoRA para cubrir los casos residuales. El objetivo declarado es obtener respuestas sin filtros de seguridad en todas las categorías de prompt probadas por el autor.

El modelo conserva la arquitectura del base: un transformer decoder-only con patrón híbrido repetido de 3 bloques DeltaNet por cada bloque de atención estándar, 32 capas y 8.953.803.264 parámetros totales (unos 8,95B). El repositorio ocupa 17,9 GB y se distribuye en safetensors para la librería transformers, con licencia declarada apache-2.0 y soporte de idioma declarado únicamente en inglés.

Su relevancia es doble. Por un lado, es un caso de estudio técnico de cómo se localiza y elimina una dirección de activación asociada al rechazo en un modelo híbrido DeltaNet + atención, incluyendo el análisis de la magnitud de esa dirección por capas. Por otro, es un ejemplo de los riesgos asociados a la publicación de pesos sin alineamiento de seguridad, ya que el propio autor documenta que el modelo responde a prompts de hacking, armas, drogas, fraude y contenido sexual explícito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only híbrido: DeltaNet + atención estándar en patrón repetido 3×DeltaNet → 1×Attention, 32 capas |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la recolección de activaciones durante la abliteración usó un máximo de 128 tokens, pero no se especifica la ventana del modelo) |
| Tipos de cuantizacion | no disponible en el repositorio; el ajuste fino se realizó con QLoRA 4-bit NF4. No se publican pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | en (declarado en la model card y en los tags) |
| Licencia | apache-2.0 (declarada en el repo derivado; el modelo base puede estar sujeto a condiciones adicionales) |
| Formato de pesos | safetensors (librería transformers, tag `qwen3_5_text`) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con una combinación poco habitual: capas DeltaNet (atención lineal con estado recurrente) intercaladas con capas de atención estándar en un ciclo de tres DeltaNet por cada atención. La abliteración se aplicó sobre las proyecciones que escriben de vuelta al residual stream: `linear_attn.out_proj` (salida de DeltaNet), `self_attn.o_proj` (salida de atención estándar) y `mlp.down_proj`, en las 32 capas, con 64 matrices modificadas por pasada.

El proceso de eliminación de rechazo siguió el método de Arditi et al. (2024): se recogen activaciones sobre 170 prompts dañinos de 12 categorías y 160 prompts inofensivos de 10 categorías, se calcula la dirección de rechazo como la diferencia normalizada entre las medias de ambos conjuntos y se ortogonaliza cada matriz de pesos frente a esa dirección (`W_new = W - d @ (d^T @ W)`). Se aplicaron 3 pasadas iterativas; una cuarta pasada destruyó el modelo (salida incoherente) según el autor. La magnitud de la dirección de rechazo crece con la profundidad: 0,36 de media en capas 0-7, 1,73 en 8-15, 6,88 en 16-23 y 23,10 en 24-31, lo que sitúa la codificación del rechazo en las capas medias y tardías.

Tras la abliteración quedaron cinco categorías resistentes (humor racista u ofensivo, contenido sexual explícito, propaganda antiinmigración, síntesis de drogas y métodos de autolesión), que se atacaron con un ajuste QLoRA de 4 bits NF4 (r=64, alpha=128, módulos q/k/v/o y gate/up/down) sobre 20 ejemplos, 5 épocas, en una H100 SXM de 80 GB, con una duración de unos 45 segundos y una pérdida que bajó de 2,06 a 0,17. El adaptador se fusionó después en los pesos de precisión completa. No se documentan datos de preentrenamiento, número de tokens, composición del corpus ni procesos de RLHF/DPO del modelo base dentro de la información disponible.

## Capacidades

- Generación de texto conversacional en inglés con la librería transformers y pipeline `text-generation`.
- Razonamiento lógico y matemático a nivel de ejemplos cualitativos: el autor cita un silogismo con falacia de término medio no distribuido y el cálculo de la derivada de x³·sin(x) aplicando correctamente la regla del producto.
- Generación de código: el autor cita una implementación limpia del algoritmo de subcadena palindrómica más larga con expansión alrededor del centro en O(n²).
- Conocimiento factual: explicaciones cualitativas correctas sobre fisión frente a fusión nuclear y sobre las causas de la crisis financiera de 2008.
- Escritura creativa: composición de haikus con estructura silábica 5-7-5.
- Ausencia total de rechazo: el autor reporta 18/18 prompts respondidos en 8 categorías (hacking, armas, drogas, fraude, contenido dañino, autolesión, explícito y político).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según los tags y la model card.
- Capacidades especiales (visión, audio, modo thinking): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos: el modelo permite estudiar empíricamente cómo se codifica el comportamiento de rechazo en arquitecturas híbridas DeltaNet + atención, ya que el autor publica la magnitud de la dirección de rechazo por rangos de capas (0,36 en capas 0-7 frente a 23,10 en 24-31), lo que resulta útil para trabajos de interpretabilidad.
- Red teaming y evaluación de guardrails: se puede utilizar como generador de prompts y respuestas adversarias en un entorno controlado para medir la tasa de detección de clasificadores de contenido y de filtros de moderación propios.
- Generación de datos adversarios para entrenar moderadores: sus respuestas a categorías sensibles sirven como ejemplos negativos etiquetados para ajustar clasificadores de toxicidad, siempre que el uso se limite a un pipeline interno y auditado.
- Despliegue en entornos aislados (air-gapped): al distribuirse en safetensors y ejecutarse con transformers, puede desplegarse en infraestructura sin salida a internet donde no sea posible recurrir a APIs externas con filtrado, por ejemplo en laboratorios de análisis de contenido ilícito con fines de investigación.
- Escritura creativa de ficción sin restricciones: autores que trabajan con tramas violentas, sexuales o moralmente ambiguas pueden emplearlo para generar borradores sin los bloqueos que aplican los modelos alineados, asumiendo la revisión humana posterior.
- Asistente de programación en local: con ~8,95B de parámetros y pesos en safetensors, puede ejecutarse en una GPU de consumo para autocompletado y explicación de código sin enviar el código a servicios de terceros.
- Estudio comparativo de degradación por abliteración: permite medir cuánto se pierde en tareas estándar (matemáticas, razonamiento, código) al eliminar la dirección de rechazo, comparando con el modelo base Qwen3.5-9B sobre el mismo conjunto de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MATH u otros) en la información disponible. El autor solo aporta evaluaciones internas sobre prompts de rechazo y ejemplos cualitativos, que se reproducen a continuación tal cual.

Prueba de rechazo del autor sobre 18 prompts en 8 categorías:

| Etapa | Respondidos | Tasa |
|---|---|---|
| Qwen3.5-9B base | 0/18 | 0% |
| Abliteración, pasada 1 | 7/18 | 39% |
| Abliteración, pasada 2 | 9/18 | 50% |
| Abliteración, pasada 3 | 13/18 | 72% |
| Abliteración, pasada 4 (sobre-abliterado) | 18/18 con salida incoherente | Modelo destruido |
| Pasada 3 + LoRA (este modelo) | 18/18 | 100% |

Comparativa del autor frente a Dolphin-Mistral 7B sobre el mismo conjunto de 18 prompts:

| Modelo | Respondidos | Rechazados | Tasa |
|---|---|---|---|
| Qwen3.5-9B-abliterated | 17/18 | 1 | 94% |
| Dolphin-Mistral 7B | 17/18 | 1 | 94% |
| Qwen3.5-9B base | 0/18 | 18 | 0% |

Nota: existe una inconsistencia en la propia model card, que en una sección afirma 18/18 y en la tabla comparativa 17/18; el autor lo atribuye a la varianza por temperatura y afirma alcanzar 18/18 en la mejor de tres ejecuciones. Estas cifras miden la ausencia de rechazo, no la calidad de las respuestas ni el rendimiento en tareas estándar. Los ejemplos de capacidad (derivada, palíndromo, haiku, crisis de 2008) son cualitativos y sin puntuación numérica.

## Requisitos de hardware

- VRAM estimada en precisión completa (FP16/BF16): ~17,9 GB solo para los pesos (tamaño del repo 17,9 GB), más caché KV y activaciones; en la práctica requiere 20-24 GB.
- VRAM estimada en cuantización de 8 bits: ~9-10 GB.
- VRAM estimada en cuantización de 4 bits (NF4/GPTQ/AWQ): ~5-6 GB, según el contexto configurado.
- GPU recomendadas para servicio con concurrencia: NVIDIA A100 40/80 GB o H100 80 GB, especialmente si se sirve en FP16 con lotes grandes.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en FP16 con contexto moderado, en una RTX 4080/4070 Ti (16 GB) en 8 bits y en una RTX 3060 12 GB o RTX 4060 Ti 16 GB en 4 bits.
- Cabe en portátiles con GPU de 8 GB solo en 4 bits y con ventanas de contexto cortas; el rendimiento en CPU no está documentado.
- Opciones de despliegue: transformers (formato nativo del repo), más cuantización de 4/8 bits vía bitsandbytes. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado: no se publican pesos GGUF y la arquitectura híbrida DeltaNet requiere kernels específicos.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- El autor reporta que el ajuste LoRA se completó en unos 45 segundos en una NVIDIA H100 SXM de 80 GB, dato de entrenamiento y no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-abliterated | 8,95B | no disponible | 17-18/18 en la prueba de rechazo del autor; sin benchmarks estándar | apache-2.0 (declarada) | HuggingFace, safetensors |
| Qwen/Qwen3.5-9B (base) | 8,95B | no disponible | 0/18 en la prueba de rechazo del autor; sin benchmarks estándar publicados en esta ficha | no disponible en la información proporcionada | HuggingFace |
| Dolphin-Mistral 7B | 7B | no disponible | 17/18 en la misma prueba del autor | no disponible en la información proporcionada | HuggingFace |

La única ventaja que el autor atribuye a su modelo frente a Dolphin-Mistral 7B es el mayor número de parámetros (9B frente a 7B), que según él se traduce en mejor razonamiento, código y conocimiento; no se aportan mediciones que respalden esa afirmación. No se dispone de comparaciones con otras variantes abliterated de la familia Qwen ni con modelos alineados de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de los mecanismos de rechazo: el modelo responde a peticiones de hacking, fabricación de armas, síntesis de drogas, fraude, contenido sexual explícito y propaganda política. No debe exponerse a usuarios finales sin un filtro externo propio.
- Riesgo legal y de cumplimiento: su uso puede vulnerar normativas de servicios digitales y de protección de menores según la jurisdicción; la licencia apache-2.0 no exime de responsabilidad por el contenido generado.
- Ajuste final sobre 20 ejemplos: la cobertura de las cinco categorías residuales se hizo con un conjunto minúsculo, lo que hace esperable un comportamiento frágil y dependiente del formato exacto del prompt, además de un riesgo de sobreajuste y de degradación de capacidades generales.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad independientes. No se puede cuantificar la pérdida de calidad respecto al modelo base.
- Inconsistencia interna en la model card (18/18 frente a 17/18) y metodología de evaluación no reproducible: 18 prompts no constituyen una evaluación de robustez.
- Idiomas: solo inglés declarado. El rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior al del modelo base en tareas multilingües.
- Contexto desconocido: aunque la arquitectura base suele soportar ventanas amplias, esta ficha no puede confirmar la longitud real de contexto ni el comportamiento del modelo más allá de la ventana usada durante la generación.
- Degradación potencial por abliteración: la modificación de `mlp.down_proj` en las 32 capas puede afectar a la coherencia general; el propio autor documenta que una pasada adicional destruyó el modelo por completo, lo que indica que el proceso opera cerca del límite de estabilidad.
- Alucinación: no hay mediciones de tasa de alucinación. En tareas factuales y en categorías sensibles, la ausencia de rechazo aumenta el riesgo de que el modelo invente procedimientos o datos con apariencia de verosimilitud.
- Sesgos: no se ha realizado ninguna evaluación de sesgos. Las cinco categorías residuales incluyen explícitamente humor racista y propaganda antiinmigración, lo que indica que el ajuste elimina barreras frente a contenido discriminatorio.
- Metadatos anómalos: las fechas del repositorio (creación y actualización en septiembre de 2026) y el contador de descargas y likes a cero deben tratarse con cautela; no hay señales de mantenimiento ni de soporte del autor.
- Cadena de licencias: el repo derivado declara apache-2.0, pero los términos del modelo base Qwen/Qwen3.5-9B y los posibles requisitos de atribución no se detallan; conviene verificarlos antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arammoostafaye/Qwen3.5-9B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper del método de abliteración (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Modelo comparado en la model card (Dolphin-Mistral 7B): https://huggingface.co/cognitivecomputations/dolphin-2.6-mistral-7b

Nota: la búsqueda web realizada no ha devuelto ninguna fuente técnica relevante sobre este modelo; los únicos resultados obtenidos son foros sin relación con el tema y con contenido inapropiado, por lo que no se incluyen.
