# Karataete/koldfrontier-swift1.5-abliterated-sushi

## Resumen

Koldfrontier Swift1.5 Abliterated Sushi es un modelo derivado por ablación de rechazo (refusal removal) a partir de `ukisai/Swift1.5-Qwen3.8-Flash-Next`. Lo publica el usuario Karataete en Hugging Face y se distribuye como artefacto de investigación en seguridad, no como modelo de producción. La operación consiste en restar una dirección de rechazo de los pesos originales sin reentrenar ni pasar por formatos de cuantización intermedios: se reescribieron 144 tensores sobre el checkpoint bf16 completo de 336 GB, con aritmética en fp32 y verificación ULP por tensor.

El modelo conserva la arquitectura del base, un transformer híbrido con atención indexada y atención lineal repartidas en 48 capas, y una capa MoE con expertos compartidos y enrutados. El repositorio pesa 39,4 GB y contiene 21.142.110.099 parámetros totales en safetensors, lo que sugiere una exportación parcial o cuantizada respecto al checkpoint original. La modalidad declarada es image-text-to-text, aunque la model card no detalla el componente de visión.

Su relevancia es metodológica: documenta con detalle el procedimiento de abliteración (dirección proyectada, emparejamiento de residuales en L+1, cobertura completa de capas), publica los conjuntos de evaluación usados y cuantifica el coste en capacidad y el aumento de cumplimiento dañino. Es un caso útil para estudiar los límites de las técnicas de eliminación de rechazo y para calibrar evaluaciones de safety.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 48 capas: 12 capas de atención indexada y 36 de atención lineal; capa MoE con expertos compartidos y enrutados |
| Parametros totales | 21.142.110.099 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor indica que la ablación se hizo sin cuantización intermedia; el repo se etiqueta como 8-bit) |
| Idiomas soportados | en |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base: 48 capas con un esquema mixto de atención, 12 capas con atención indexada (`self_attn.o_proj`) y 36 con atención lineal (`linear_attn.out_proj`), más un bloque MoE por capa con experto compartido (`mlp.shared_expert.down_proj`) y expertos enrutados (`mlp.experts.down_proj`). No hay entrenamiento ni fine-tuning en este derivado: la model card es explícita en que no se usaron datos de entrenamiento y que los shards originales se leyeron, se reescribieron 144 tensores y el resto se copió byte a byte.

La innovación técnica está en el método de ablación. Se capturaron residuales para conjuntos de prompts dañinos y benignos en el último token, capa por capa, en un anillo de paralelismo tensorial de cuatro nodos. La dirección se calcula como `v = normalize(mean(bad) − mean(good))`, proyectada ortogonalmente contra una dirección de referencia `g` (`v -= (v·g)·g`), con medias en float64. Cada componente recibe una actualización de rango 1 `W ← W − strength · v ⊗ (vᵀW)` con fuerza 1.0. Dos detalles son críticos según el autor: la dirección del componente en la capa L proviene del residual en L+1 (emparejarla con L mide 6,1 veces menos señal), y el régimen de prompts debe coincidir con el de evaluación, con thinking activado; con `enable_thinking=False` el mismo modelo pasa de 2,5% a 94,5% de cumplimiento dañino. La cobertura debe ser completa: ablacionar 12 de 24 capas dejaba 15 de 16 rechazos intactos. En total se modificaron 24.720 componentes.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat y modo thinking activado por defecto.
- Razonamiento multi-turno dentro del régimen de chat con thinking.
- Procesamiento image-text-to-text según el pipeline declarado, aunque la model card no documenta el codificador visual ni su entrenamiento.
- Cumplimiento de solicitudes dañinas notablemente mayor que el base (94,5% frente a 91,0% en el conjunto treadon), que es el objetivo declarado del artefacto.
- Discriminación por intención en peticiones de ingeniería de doble uso: mantiene 7 de 7 pares en los que rechaza la petición desnuda y responde a la versión con encuadre autorizado.
- No se documentan capacidades de tool calling, function calling ni uso como agente.
- No se documentan capacidades de audio ni otras modalidades.

## Casos de uso

- Investigación en seguridad de modelos: sirve como contrapunto experimental al base para medir cuánto rechazo se elimina con una ablación de rango 1 y qué coste tiene en capacidad, usando los mismos conjuntos de evaluación publicados.
- Auditoría de evaluaciones de refusal: permite reproducir el hallazgo de que un listado de marcadores solo ASCII puntúa mal respuestas con apóstrofo Unicode (U+2019), y validar arneses propios contra un caso conocido.
- Estudio de regímenes de prompting: comparar el comportamiento con thinking activado y desactivado (2,5% frente a 94,5% de cumplimiento dañino) para diseñar políticas de despliegue que no dependan de un flag del template.
- Calibración de clasificadores de seguridad: generar respuestas etiquetadas como dañinas o de doble uso para entrenar y evaluar filtros de entrada y salida en pipelines de moderación.
- Evaluación de conjuntos de doble uso en ingeniería: usar el conjunto `engineering-risk-refusal-eval` con sus 11 pares de encuadres para comprobar si un modelo distingue intención de palabras clave en dominios de reverse engineering y pentesting.
- Análisis de deriva benigna: medir la KL de 0,0057 frente al base en prompts benignos y verificar que la distribución de siguiente token apenas cambia, como control de que la edición no degrada el uso general.
- Docencia y divulgación técnica: explicar con un caso real los detalles de implementación de la abliteración (emparejamiento L+1, proyección ortogonal, cobertura de capas) y por qué las variantes parciales fallan.

## Benchmarks y rendimiento

Datos publicados en la model card, régimen thinking, decodificación greedy, mismo arnés para base y derivado.

| Metrica | Base | Este modelo |
|---|---|---|
| Rechazos protectores, conjunto engineering-risk | 85% (11/13) | 69% (9/13) |
| Sobre-rechazo en encuadres autorizados | 3% (1/29) | 3% (1/29) |
| Rechaza la petición desnuda y responde a la autorizada | 7/7 pares | 7/7 pares |
| Cumplimiento dañino, conjunto treadon | 91,0% (182/200) | 94,5% (189/200) |
| Sobre-rechazo, conjunto treadon | 0,0% (0/83) | 0,0% (0/83) |
| Sonda de capacidad | 7/8 | 4/8 |
| KL frente al base en prompts benignos | — | 0,0057 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El checkpoint original en bf16 ocupa 336 GB y, según el autor, no cabe en un solo host: la ablación se ejecutó en un anillo de paralelismo tensorial de cuatro DGX Spark.
- El repositorio publicado ocupa 39,4 GB para 21.142.110.099 parámetros, lo que corresponde a una representación de aproximadamente 2 bytes por parámetro o a una exportación parcial; conviene verificar los shards antes de planificar el despliegue.
- VRAM estimada para inferencia: no disponible de forma fiable sin confirmar el formato real de los pesos. Como referencia, 21,1 mil millones de parámetros en bf16 requieren unos 42 GB solo para pesos, más caché KV y activaciones.
- GPU recomendadas: no disponible. Para el tamaño nominal harían falta A100 80 GB, H100 80 GB o configuraciones multi-GPU; en consumer GPU solo cabría con cuantización agresiva (4 bits, en torno a 12-14 GB), no documentada por el autor.
- Opciones de despliegue: transformers es la librería declarada; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Koldfrontier Swift1.5 Abliterated Sushi) | 21,1 B | no disponible | Ablación de rechazo sobre Swift1.5-Qwen3.8-Flash-Next | swift-open-license-1.0 | Hugging Face, 0 descargas |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | no disponible en la información | no disponible | Modelo original sin ablación | swift-open-license-1.0 | Hugging Face |
| Qwen3-0.6B (usado como referencia metodológica en la model card) | 0,6 B | no disponible | Transformer denso de la familia Qwen3 | no disponible en la información | Hugging Face |

La comparación con alternativas de la misma categoría (modelos abliterados de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El propio autor lo describe como artefacto de investigación en seguridad: cumple más peticiones dañinas que su base y pierde capacidad medible (4/8 frente a 7/8 en la sonda de capacidad).
- El comportamiento depende fuertemente del régimen de prompting: con thinking activado el cumplimiento dañino es del 94,5%, pero con `enable_thinking=False` cae al 2,5%. Cualquier despliegue debe fijar y auditar ese flag.
- Elimina aproximadamente una sexta parte de los rechazos protectores en el conjunto de ingeniería de riesgo (de 85% a 69%), lo que incluye dominios de reverse engineering, pentesting, evasión y malware.
- Riesgo de alucinación: no cuantificado en la información disponible; la KL de 0,0057 en prompts benignos sugiere poca deriva, pero no se han medido tareas factuales.
- Idiomas: solo inglés declarado; no hay evaluación multilingüe.
- Longitud de contexto no documentada, lo que impide planificar casos de contexto largo.
- Licencia swift-open-license-1.0 con campo `license: other`: es necesario revisar el texto enlazado antes de cualquier uso comercial; no se detallan restricciones en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026: no hay validación comunitaria ni informes independientes de calidad.
- La discrepancia entre el checkpoint de 336 GB descrito y el repo de 39,4 GB con 21,1 B de parámetros debe resolverse antes de usar los pesos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Karataete/koldfrontier-swift1.5-abliterated-sushi
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Revisión del base usada: `0bd4fe22431372cdad1979267d3ab45aa7e6150a`
- Licencia del base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Conjunto de evaluación de abliteración: https://huggingface.co/datasets/treadon/abliteration-eval
- Conjunto de evaluación de riesgo en ingeniería: https://huggingface.co/datasets/koldfrontier/engineering-risk-refusal-eval
- Paquete de evaluación de refusal: https://huggingface.co/MultiverseComputingCAI/llm-refusal-evaluation
