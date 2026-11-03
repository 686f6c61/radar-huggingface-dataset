# rohitMukhi/prompt_complexity_classifier

## Resumen

El modelo `rohitMukhi/prompt_complexity_classifier` es un clasificador de texto basado en `microsoft/deberta-v3-base` afinado para una tarea muy concreta: asignar cada consulta de usuario a uno de tres niveles de complejidad (`TIER_0`, `TIER_1`, `TIER_2`). No es un modelo generativo, sino un cabezal de clasificación de secuencias que devuelve logits sobre tres clases, pensado para integrarse en pasarelas de IA ("AI gateways") que enrutan peticiones al modelo más barato capaz de resolverlas.

Su relevancia práctica está en el enrutamiento de prompts: en lugar de mandar todas las consultas a un modelo frontera, el sistema clasifica primero la petición y la deriva a un modelo ligero, uno intermedio o uno de gama alta, reduciendo latencia y coste en producción. Con 184 millones de parámetros y un repo de 0,4 GB, es un componente auxiliar muy ligero comparado con los LLM a los que enruta.

El modelo está publicado por el usuario `rohitMukhi` con licencia MIT, entrenado solo en inglés y con fecha de creación en noviembre de 2026. No registra descargas ni likes, y la model card no documenta el proceso de entrenamiento, el dataset ni resultados de evaluación, por lo que su calidad debe validarse antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base) con cabezal de clasificación de secuencias |
| Parámetros totales | 184.424.451 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso trunca a `max_length=256` |
| Tipos de cuantización | no disponible (existe exportación ONNX según tags) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (también ONNX según tags del repo) |

## Arquitectura y entrenamiento

La arquitectura es un encoder DeBERTa-v3-base (`microsoft/deberta-v3-base`) con la cabeza de clasificación estándar de `AutoModelForSequenceClassification` configurada para tres etiquetas. DeBERTa-v3 introduce atención disentanglada y un encoder de posiciones relativas, y su preentrenamiento sustituye el enmascaramiento de tokens por enmascaramiento de spans con un generador ELECTRA, lo que suele dar buen rendimiento en tareas de comprensión con presupuesto reducido. El modelo base tiene 184 millones de parámetros, coherente con el recuento del repo.

La model card no documenta el dataset de afinado, el número de ejemplos, la composición de las tres clases ni si se aplicó alguna técnica de regularización o balanceo. Tampoco se especifica si hubo destilación, aumento de datos o calibración de probabilidades. La única información operativa es el uso previsto: clasificar prompts en tres niveles y truncar a 256 tokens en el ejemplo de inferencia. Los tags del repo indican compatibilidad con `text-embeddings-inference` y `endpoints_compatible`, y la presencia de ONNX sugiere que se puede desplegar con runtime de ONNX para inferencia en CPU.

## Capacidades

- Clasificación de texto en tres clases: `TIER_0` (baja complejidad), `TIER_1` (media) y `TIER_2` (alta).
- Distinción de consultas simples, tareas de código estándar y tareas de arquitectura o razonamiento multi-paso según la definición del autor.
- Salida de logits por clase, apta para enrutamiento con umbrales o `argmax`.
- Inferencia rápida en CPU y GPU por su tamaño reducido.
- Exportación a ONNX disponible para despliegues sin PyTorch.
- Compatibilidad con `transformers`, `text-embeddings-inference` y endpoints compatibles.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidad multilingüe: no disponible; solo inglés declarado.

## Casos de uso

- Enrutamiento de prompts en una pasarela de IA: el clasificador se ejecuta antes del LLM y decide si la petición va a un modelo pequeño, mediano o frontera, reduciendo el coste medio por consulta. Es adecuado porque la inferencia es de milisegundos frente a los segundos de un LLM grande.
- Control de costes en atención al cliente: las consultas de saludo o FAQ se envían a un modelo ligero, mientras que las incidencias técnicas complejas se derivan a un modelo mayor, con la misma lógica de tres niveles.
- Priorización de colas de soporte: las peticiones clasificadas como `TIER_2` pueden asignarse a ingenieros senior o a un modelo con más contexto, y las `TIER_0` resolverse con respuestas automáticas.
- Filtrado previo en pipelines de generación de código: las tareas de boilerplate se enrutan a modelos económicos y las de diseño de arquitectura o depuración multi-fichero a modelos con mayor capacidad de razonamiento.
- Telemetría y analítica de uso: agregar las predicciones permite medir qué porcentaje del tráfico es realmente complejo y ajustar la asignación de presupuesto entre modelos.
- Enrutamiento en asistentes con agentes: las peticiones de planificación agéntica se marcan como `TIER_2` y se envían a un modelo con soporte de tool calling y contexto largo, mientras que las consultas directas no consumen ese presupuesto.
- Preclasificación en sistemas de moderación o triaje: como paso barato antes de un modelo caro, para decidir si merece la pena invocar razonamiento extendido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara las métricas `accuracy` y `f1` en los tags, pero no incluye valores, conjunto de evaluación ni comparación con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,75 GB para los pesos (184 M de parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en FP16: alrededor de 0,4 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU.
- GPU recomendadas para alto throughput: T4, L4, A10G o A100 si se comparte con otros servicios; para este tamaño, una T4 o incluso CPU suele bastar.
- Despliegue: `transformers` con PyTorch, ONNX Runtime (hay exportación ONNX en el repo), `text-embeddings-inference` según los tags, y servidores de inferencia compatibles con endpoints. No se documenta soporte de vLLM ni llama.cpp, que no aplican a un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rohitMukhi/prompt_complexity_classifier` | 184 M | no disponible (ejemplo trunca a 256) | Clasificación de complejidad de prompts (3 clases) | MIT | HuggingFace, 0 descargas |
| `microsoft/deberta-v3-base` | 184 M | 512 tokens | Modelo base; requiere afinado para clasificación | MIT | HuggingFace, ampliamente usado |
| `distilbert-base-uncased` | 66 M | 512 tokens | Clasificación de texto genérica tras afinado | Apache 2.0 | HuggingFace, muy extendido |
| `cross-encoder/ms-marco-MiniLM-L-6-v2` | ~22 M | 512 tokens | Reranking de pasajes | Apache 2.0 | HuggingFace |

La comparación directa con alternativas de enrutamiento de prompts no está disponible: no se conocen clasificadores públicos equivalentes con benchmarks comparables en la información proporcionada. Frente a `deberta-v3-base`, este modelo aporta el afinado específico para la tarea, pero carece de documentación de evaluación que permita verificar su ventaja.

## Limitaciones y advertencias

- No hay documentación del dataset de entrenamiento, del proceso de etiquetado ni de la distribución de clases, lo que impide evaluar sesgos y cobertura.
- No se publican métricas de accuracy ni F1 pese a declararlas en los tags; la calidad real es desconocida.
- Solo inglés: las consultas en castellano u otros idiomas pueden clasificarse de forma errónea.
- El truncamiento a 256 tokens en el ejemplo de uso implica que prompts largos pierden información; la longitud de contexto real no está documentada.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de clasificación errónea en prompts ambiguos o de frontera entre niveles.
- La definición de los tres niveles es subjetiva y específica del autor; puede no alinearse con la política de enrutamiento de otro sistema.
- Licencia MIT permite uso comercial, pero al derivar de `microsoft/deberta-v3-base` conviene revisar también las condiciones de ese modelo base.
- El repo no registra descargas ni likes y no hay evidencia de uso en producción; tratarlo como experimental.
- No hay información sobre calibración de probabilidades, por lo que usar los logits como confianza para enrutamiento puede requerir un paso de calibración propio.
- La fecha de creación del repo (noviembre de 2026) y la ausencia de historial dificultan evaluar su mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/rohitMukhi/prompt_complexity_classifier
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- Paper de DeBERTa-v3: https://arxiv.org/abs/2111.09543
- Repositorio DeBERTa: https://github.com/microsoft/DeBERTa
- Documentación de `AutoModelForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/deberta-v3
